import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { transaction } from '../../database/transaction.js';
import { BotError, requireValue } from '../../framework/runtime/errors.js';
import { record } from '../../services/http.js';
import { notificationsEnabled } from './preferences.js';
export interface PlatformEvent {
    id: string;
    source: string;
    type: string;
    title: string;
    message: string;
    recipientNovaId?: string;
}
export function verifySignature(
    raw: Buffer,
    source: string,
    timestamp: string,
    signature: string,
    keys: Record<string, string>,
    now = Date.now(),
) {
    const key = Object.hasOwn(keys, source) ? keys[source] : undefined;
    if (
        !key ||
        key.length < 32 ||
        !/^\d{10}$/.test(timestamp) ||
        Math.abs(now - Number(timestamp) * 1000) > 300000 ||
        !/^sha256=[0-9a-f]{64}$/.test(signature)
    )
        throw new BotError('permission', 'Invalid event authentication.');
    const expected = createHmac('sha256', key).update(`${timestamp}.`).update(raw).digest();
    if (!timingSafeEqual(expected, Buffer.from(signature.slice(7), 'hex')))
        throw new BotError('permission', 'Invalid event authentication.');
}
export function parseEvent(input: unknown, source: string): PlatformEvent {
    const v = record(input);
    requireValue(
        v.source === source && typeof v.id === 'string' && /^[A-Za-z0-9_.:-]{1,100}$/.test(v.id),
        'Invalid event identity.',
    );
    requireValue(
        typeof v.type === 'string' && /^[a-z][a-z0-9_.-]{1,80}$/.test(v.type),
        'Invalid event type.',
    );
    requireValue(
        typeof v.title === 'string' &&
            v.title.length > 0 &&
            v.title.length <= 150 &&
            typeof v.message === 'string' &&
            v.message.length <= 1500,
        'Invalid event message.',
    );
    requireValue(
        Object.keys(v).every((k) =>
            ['version', 'id', 'source', 'type', 'title', 'message', 'recipient'].includes(k),
        ),
        'Event contains unsupported fields. Destinations are configured in the bot.',
    );
    let recipientNovaId: string | undefined;
    if (v.recipient !== undefined) {
        const recipient = record(v.recipient);
        requireValue(
            v.version === 1 &&
                Object.keys(recipient).length === 1 &&
                typeof recipient.novaUserId === 'string' &&
                recipient.novaUserId.length > 0 &&
                recipient.novaUserId.length <= 128,
            'Invalid event recipient.',
        );
        recipientNovaId = recipient.novaUserId;
    } else requireValue(v.version === undefined, 'Recipient events require a supported version.');
    return { id: v.id, source, type: v.type, title: v.title, message: v.message, recipientNovaId };
}
export async function acceptEvent(event: PlatformEvent, raw: Buffer) {
    return transaction(async (c) => {
        const hash = createHash('sha256').update(raw).digest('hex');
        const inserted = await c.query(
            'INSERT INTO notification_events(source,id,type,body_hash,recipient_nova_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING id',
            [event.source, event.id, event.type, hash, event.recipientNovaId ?? null],
        );
        if (!inserted.rowCount) {
            const {
                rows: [prior],
            } = await c.query<{ body_hash: string }>(
                'SELECT body_hash FROM notification_events WHERE source=$1 AND id=$2',
                [event.source, event.id],
            );
            requireValue(prior?.body_hash === hash, 'Event ID was reused with a different payload.');
            return { duplicate: true, deliveries: 0 };
        }
        if (event.recipientNovaId) {
            const { rows: sessions } = await c.query<{ discord_id: string }>(
                'SELECT discord_id FROM nova_sessions WHERE nova_id=$1 AND expires_at>now() LIMIT 1',
                [event.recipientNovaId],
            );
            const discordId = sessions[0]?.discord_id;
            const status = !discordId
                ? 'unlinked'
                : (await notificationsEnabled(event.recipientNovaId, event.source, event.type))
                  ? 'queued'
                  : 'suppressed';
            await c.query(
                `INSERT INTO notification_deliveries(source,event_id,nova_id,discord_id,status)
                 VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
                [event.source, event.id, event.recipientNovaId, discordId ?? '', status],
            );
            if (status === 'queued' && discordId) {
                const id = createHash('sha256')
                    .update(`${event.source}:${event.id}:${discordId}`)
                    .digest('hex');
                await c.query(
                    "INSERT INTO jobs(id,kind,user_id,payload,run_at) VALUES($1,'user_notification',$2,$3,now()) ON CONFLICT DO NOTHING",
                    [
                        id,
                        discordId,
                        { source: event.source, eventId: event.id, text: `${event.title}\n${event.message}` },
                    ],
                );
                return { duplicate: false, deliveries: 1 };
            }
            return { duplicate: false, deliveries: 0 };
        }
        const { rows } = await c.query<{
            id: string;
            guild_id: string;
            channel_id: string | null;
            user_id: string | null;
        }>(
            'SELECT id,guild_id,channel_id,user_id FROM notification_routes WHERE source=$1 AND event_type=$2 AND enabled=true LIMIT 100',
            [event.source, event.type],
        );
        for (const route of rows) {
            const id = createHash('sha256').update(`${event.source}:${event.id}:${route.id}`).digest('hex');
            await c.query(
                "INSERT INTO jobs(id,kind,guild_id,payload,run_at) VALUES($1,'notification',$2,$3,now()) ON CONFLICT DO NOTHING",
                [
                    id,
                    route.guild_id,
                    {
                        channelId: route.channel_id,
                        userId: route.user_id,
                        text: `${event.title}\n${event.message}`,
                        routeId: route.id,
                    },
                ],
            );
        }
        return { duplicate: false, deliveries: rows.length };
    });
}

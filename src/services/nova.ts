import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { pool } from '../database/client.js';
import { BotError, requireValue } from '../framework/runtime/errors.js';
import { ServiceClient, array, record } from './http.js';
import { enqueue } from '../framework/jobs/scheduler.js';
export function encryptToken(token: string, key: string) {
    requireValue(/^[0-9a-f]{64}$/i.test(key), 'TOKEN_ENCRYPTION_KEY must be 32 random bytes encoded as hex.');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    return Buffer.concat([iv, cipher.update(token, 'utf8'), cipher.final(), cipher.getAuthTag()]).toString(
        'base64',
    );
}
export function decryptToken(encrypted: string, key: string) {
    requireValue(/^[0-9a-f]{64}$/i.test(key), 'TOKEN_ENCRYPTION_KEY is not configured.');
    const bytes = Buffer.from(encrypted, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(-16));
    return Buffer.concat([decipher.update(bytes.subarray(12, -16)), decipher.final()]).toString('utf8');
}
export class NovaClient extends ServiceClient {
    async verify(token: string, project: string, expectedUserId: string, roles?: string[]) {
        const result = record(
            await this.request('/auth/verify', { method: 'POST', token, body: { project } }),
        );
        const user = record(result.user);
        requireValue(
            result.access === true && user.id === expectedUserId && typeof result.role === 'string',
            'Nova did not authorize this identity.',
        );
        if (roles?.length && !roles.includes(result.role))
            throw new BotError('permission', 'Your Nova role does not permit this action.');
        return { id: expectedUserId, project, role: result.role, token };
    }
    async authorize(discordId: string, policy: { project: string; roles?: string[] }) {
        const {
            rows: [session],
        } = await pool.query<{ nova_id: string; encrypted_token: string }>(
            'SELECT nova_id,encrypted_token FROM nova_sessions WHERE discord_id=$1 AND expires_at>now()',
            [discordId],
        );
        if (!session) throw new BotError('permission', 'Link your Nova account using /account link.');
        return this.verify(
            decryptToken(session.encrypted_token, process.env.TOKEN_ENCRYPTION_KEY ?? ''),
            policy.project,
            session.nova_id,
            policy.roles,
        );
    }
    async startLink(discordId: string) {
        requireValue(
            process.env.TOKEN_ENCRYPTION_KEY && process.env.NOVA_REDIRECT_URI && process.env.NOVA_CLIENT_ID,
            'Nova OAuth linking is not configured.',
        );
        const redirect = new URL(process.env.NOVA_REDIRECT_URI);
        requireValue(
            redirect.protocol === 'https:' || redirect.hostname === 'localhost',
            'Use HTTPS for the Nova callback.',
        );
        const state = randomBytes(32).toString('base64url');
        const hash = createHash('sha256').update(state).digest('hex');
        await pool.query('DELETE FROM oauth_states WHERE discord_id=$1 OR expires_at<now()', [discordId]);
        await pool.query(
            "INSERT INTO oauth_states(state_hash,discord_id,expires_at) VALUES($1,$2,now()+interval '10 minutes')",
            [hash, discordId],
        );
        const url = this.url('/auth/authorize');
        url.search = new URLSearchParams({
            client_id: process.env.NOVA_CLIENT_ID,
            redirect_uri: process.env.NOVA_REDIRECT_URI,
            response_type: 'code',
            state,
        }).toString();
        return url.toString();
    }
    async finishLink(state: string, code: string) {
        requireValue(
            /^[A-Za-z0-9_-]{43}$/.test(state) && code.length > 0 && code.length < 2048,
            'Invalid OAuth callback.',
        );
        const hash = createHash('sha256').update(state).digest('hex');
        const {
            rows: [pending],
        } = await pool.query<{ discord_id: string }>(
            'DELETE FROM oauth_states WHERE state_hash=$1 AND expires_at>now() RETURNING discord_id',
            [hash],
        );
        requireValue(pending, 'Link expired or already used. Run /account link again.');
        const result = record(
            await this.request('/auth/token', {
                method: 'POST',
                body: { grant_type: 'authorization_code', code, redirect_uri: process.env.NOVA_REDIRECT_URI },
            }),
        );
        requireValue(
            typeof result.access_token === 'string' &&
                typeof result.expires_in === 'number' &&
                result.expires_in > 0,
            'Invalid Nova token response.',
        );
        const me = record(await this.request('/auth/me', { token: result.access_token }));
        requireValue(typeof me.id === 'string', 'Nova identity missing.');
        // Require Nova's OAuth-managed Discord account to match the initiating Discord user.
        // This prevents a forwarded authorization link from binding a victim's account to an attacker.
        requireValue(
            array(me.accounts).some((a) => a.providerId === 'discord' && a.accountId === pending.discord_id),
            'Link this Discord account using Nova account settings first.',
        );
        await pool.query(
            `INSERT INTO nova_sessions(discord_id,nova_id,encrypted_token,expires_at) VALUES($1,$2,$3,$4) ON CONFLICT(discord_id) DO UPDATE SET nova_id=excluded.nova_id,encrypted_token=excluded.encrypted_token,expires_at=excluded.expires_at`,
            [
                pending.discord_id,
                me.id,
                encryptToken(result.access_token, process.env.TOKEN_ENCRYPTION_KEY ?? ''),
                new Date(Date.now() + Math.min(result.expires_in, 3600) * 1000),
            ],
        );
        const eventId = `account-linked:${pending.discord_id}:${Date.now()}`;
        await pool.query(
            `INSERT INTO notification_deliveries(source,event_id,nova_id,discord_id,status)
             VALUES('nova',$1,$2,$3,'queued') ON CONFLICT DO NOTHING`,
            [eventId, me.id, pending.discord_id],
        );
        await enqueue(
            'user_notification',
            { source: 'nova', eventId, text: 'Nova account linked\nYour verified Nova account is now connected to this Discord account.' },
            new Date(),
            { id: `notification:${eventId}`, userId: pending.discord_id },
        );
    }
}

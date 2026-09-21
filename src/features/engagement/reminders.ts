import type { Client } from 'discord.js';
import { createHash } from 'node:crypto';
import { pool } from '../../database/client.js';
import { Scheduler, type Job } from '../../framework/jobs/scheduler.js';
import { requireValue } from '../../framework/runtime/errors.js';
export function registerDeliveryJobs(scheduler: Scheduler, client: Client) {
    scheduler.register('user_notification', async (job: Job) => {
        requireValue(
            job.user_id &&
                typeof job.payload.source === 'string' &&
                typeof job.payload.eventId === 'string' &&
                typeof job.payload.text === 'string',
            'Invalid user notification.',
        );
        try {
            const user = await client.users.fetch(job.user_id);
            await user.send({
                content: job.payload.text.slice(0, 1900),
                allowedMentions: { parse: [] },
                nonce: nonce(job.id),
                enforceNonce: true,
            });
            await pool.query(
                `UPDATE notification_deliveries SET status='delivered',delivered_at=now(),detail=NULL
                 WHERE source=$1 AND event_id=$2 AND discord_id=$3`,
                [job.payload.source, job.payload.eventId, job.user_id],
            );
        } catch (error) {
            await pool.query(
                `UPDATE notification_deliveries SET status='failed',detail=$4
                 WHERE source=$1 AND event_id=$2 AND discord_id=$3`,
                [
                    job.payload.source,
                    job.payload.eventId,
                    job.user_id,
                    error instanceof Error ? error.name : 'Discord delivery failed',
                ],
            );
            throw error;
        }
    });
    scheduler.register('reminder', async (job: Job) => {
        requireValue(job.user_id && typeof job.payload.text === 'string', 'Invalid reminder payload.');
        const user = await client.users.fetch(job.user_id);
        await user.send({
            content: `Reminder: ${job.payload.text.slice(0, 1800)}`,
            allowedMentions: { parse: [] },
            nonce: nonce(job.id),
            enforceNonce: true,
        });
    });
    scheduler.register('notification', async (job: Job) => {
        requireValue(
            job.guild_id &&
                (typeof job.payload.channelId === 'string' || typeof job.payload.userId === 'string') &&
                typeof job.payload.text === 'string',
            'Invalid notification.',
        );
        const route = await pool.query(
            'SELECT id FROM notification_routes WHERE id=$1 AND guild_id=$2 AND channel_id IS NOT DISTINCT FROM $3 AND user_id IS NOT DISTINCT FROM $4 AND enabled=true',
            [job.payload.routeId, job.guild_id, job.payload.channelId, job.payload.userId ?? null],
        );
        if (!route.rowCount) return;
        const guild = await client.guilds.fetch(job.guild_id);
        if (typeof job.payload.userId === 'string') {
            const member = await guild.members.fetch(job.payload.userId);
            await member.send({
                content: job.payload.text.slice(0, 1900),
                allowedMentions: { parse: [] },
                nonce: nonce(job.id),
                enforceNonce: true,
            });
            return;
        }
        requireValue(typeof job.payload.channelId === 'string', 'Invalid channel destination.');
        const channel = await guild.channels.fetch(job.payload.channelId);
        requireValue(channel?.isTextBased() && 'send' in channel, 'Notification destination unavailable.');
        await channel.send({
            content: job.payload.text.slice(0, 1900),
            allowedMentions: { parse: [] },
            nonce: nonce(job.id),
            enforceNonce: true,
        });
    });
}
export function nonce(id: string) {
    return createHash('sha256').update(id).digest('hex').slice(0, 24);
}

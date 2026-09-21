import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { pool } from '../../../database/client.js';
import { logEvent } from '../../../features/logging/service.js';
import { setChannelLock } from '../../../features/moderation/channels.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'lockdown',
    desc: 'Lock server text channels or restore saved locks',
    access: { discord: [PermissionFlagsBits.Administrator], bot: [PermissionFlagsBits.ManageRoles] },
    cooldownSeconds: 60,
    args: {
        action: {
            type: 'string',
            required: true,
            choices: [
                { name: 'Lock', value: 'lock' },
                { name: 'Restore', value: 'restore' },
            ],
        },
        confirm: { type: 'string', required: true, description: 'Type the server name to confirm' },
    },
    async execute(ctx) {
        requireValue(
            ctx.guild && ctx.getString('confirm') === ctx.guild.name,
            'Type the exact server name to confirm.',
        );
        await ctx.defer(64);
        const lock = ctx.getString('action') === 'lock';
        const ids = lock
            ? [...ctx.guild.channels.cache.values()]
                  .filter((c) => c.type === ChannelType.GuildText)
                  .map((c) => c.id)
            : (
                  await pool.query<{ channel_id: string }>(
                      'SELECT channel_id FROM channel_locks WHERE guild_id=$1',
                      [ctx.guild.id],
                  )
              ).rows.map((r) => r.channel_id);
        let done = 0;
        const failed: string[] = [];
        for (const id of ids) {
            try {
                await setChannelLock(ctx.guild, id, lock, `Emergency operation by ${ctx.user.id}`);
                done++;
            } catch {
                failed.push(id);
            }
        }
        await logEvent(
            ctx.guild,
            'security',
            'Emergency channel operation',
            `<@${ctx.user.id}>: ${done} channels changed; ${failed.length} failed.`,
        );
        return ctx.reply(
            `${done} channels changed.${failed.length ? ` Failed: ${failed.join(', ')}` : ''} Role-specific allows may still permit posting; this is not a guarantee against raids.`,
        );
    },
} satisfies Command;

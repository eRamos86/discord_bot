import { randomUUID } from 'node:crypto';
import { pool } from '../../../database/client.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'notifications',
    desc: 'Manage authenticated event routing for this server',
    prefix: { enabled: false },
    access: { ownerOnly: true, private: true },
    subcommands: {
        add: {
            args: {
                source: { type: 'string', required: true, maxLength: 80 },
                type: { type: 'string', required: true, maxLength: 80 },
                channel: { type: 'channel', required: true },
            },
        },
        'add-dm': {
            args: {
                source: { type: 'string', required: true, maxLength: 80 },
                type: { type: 'string', required: true, maxLength: 80 },
            },
        },
        list: {},
        remove: { args: { id: { type: 'string', required: true } } },
    },
    async execute(ctx) {
        requireValue(ctx.guild, 'Use this in a server.');
        const action = ctx.getString('subcommand');
        if (action === 'add-dm') {
            await pool.query(
                'INSERT INTO notification_routes(id,source,event_type,guild_id,user_id,enabled) VALUES($1,$2,$3,$4,$5,true) ON CONFLICT(source,event_type,guild_id,user_id) DO UPDATE SET enabled=true',
                [randomUUID(), ctx.getString('source'), ctx.getString('type'), ctx.guild.id, ctx.user.id],
            );
            return ctx.reply('Signed event notifications will be sent privately to you.');
        }
        if (action === 'add') {
            const channel = await ctx.getChannel('channel');
            requireValue(
                channel &&
                    channel.isTextBased() &&
                    'send' in channel &&
                    'guildId' in channel &&
                    channel.guildId === ctx.guild.id,
                'Choose a channel in this server.',
            );
            const id = randomUUID();
            await pool.query(
                'INSERT INTO notification_routes(id,source,event_type,guild_id,channel_id,enabled) VALUES($1,$2,$3,$4,$5,true) ON CONFLICT(source,event_type,guild_id,channel_id) DO UPDATE SET enabled=true',
                [id, ctx.getString('source'), ctx.getString('type'), ctx.guild.id, channel.id],
            );
            return ctx.reply(
                'Notification route enabled. Only signed events from the configured source can use it.',
            );
        }
        if (action === 'remove') {
            await pool.query('UPDATE notification_routes SET enabled=false WHERE id=$1 AND guild_id=$2', [
                ctx.getString('id'),
                ctx.guild.id,
            ]);
            return ctx.reply('Route disabled.');
        }
        const { rows } = await pool.query<{
            id: string;
            source: string;
            event_type: string;
            channel_id: string | null;
            user_id: string | null;
        }>('SELECT * FROM notification_routes WHERE guild_id=$1 AND enabled=true LIMIT 20', [ctx.guild.id]);
        return ctx.reply(
            rows
                .map(
                    (r) =>
                        `${r.id}: ${r.source}/${r.event_type} → ${r.channel_id ? `<#${r.channel_id}>` : `DM <@${r.user_id}>`}`,
                )
                .join('\n') || 'No routes.',
        );
    },
} satisfies Command;

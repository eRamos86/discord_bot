import { pool } from '../../../database/client.js';
import { enqueue } from '../../../framework/jobs/scheduler.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'reminder',
    desc: 'Create, list, or cancel persistent DM reminders',
    prefix: { enabled: true },
    aliases: ['timer'],
    subcommands: {
        add: {
            args: {
                minutes: { type: 'integer', required: true, minValue: 1, maxValue: 525600 },
                text: { type: 'string', required: true, maxLength: 1800 },
            },
        },
        list: {},
        cancel: { args: { id: { type: 'string', required: true } } },
    },
    async execute(ctx) {
        requireValue(ctx.guild, 'Use this in a server.');
        const action = ctx.getString('subcommand');
        if (action === 'add') {
            const {
                rows: [count],
            } = await pool.query<{ count: string }>(
                "SELECT count(*) FROM jobs WHERE guild_id=$1 AND user_id=$2 AND kind='reminder' AND status IN ('pending','running')",
                [ctx.guild.id, ctx.user.id],
            );
            requireValue(
                Number(count?.count ?? 0) < 20,
                'You can have up to 20 active reminders per server.',
            );
            const id = await enqueue(
                'reminder',
                { text: ctx.getString('text')! },
                new Date(Date.now() + ctx.getNumber('minutes')! * 60000),
                { id: ctx.interaction?.id ?? ctx.message!.id, guildId: ctx.guild.id, userId: ctx.user.id },
            );
            return ctx.reply({
                content: `Reminder scheduled: ${id}. Enable DMs from this server to receive it.`,
                flags: 64,
            });
        }
        if (action === 'cancel') {
            const r = await pool.query(
                "UPDATE jobs SET status='cancelled',payload='{}' WHERE id=$1 AND guild_id=$2 AND user_id=$3 AND kind='reminder' AND status='pending'",
                [ctx.getString('id'), ctx.guild.id, ctx.user.id],
            );
            return ctx.reply(r.rowCount ? 'Reminder cancelled.' : 'No cancellable reminder found.');
        }
        const { rows } = await pool.query<{ id: string; run_at: Date; status: string }>(
            "SELECT id,run_at,status FROM jobs WHERE guild_id=$1 AND user_id=$2 AND kind='reminder' AND status IN ('pending','running','failed') ORDER BY run_at LIMIT 20",
            [ctx.guild.id, ctx.user.id],
        );
        return ctx.reply({
            content:
                rows.map((r) => `${r.id}: ${r.run_at.toISOString()} (${r.status})`).join('\n') ||
                'No active reminders.',
            flags: 64,
        });
    },
} satisfies Command;

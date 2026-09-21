import { PermissionFlagsBits } from 'discord.js';
import { transaction } from '../../../database/transaction.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'clearwarnings',
    desc: 'Revoke active warnings while retaining their audit history',
    access: { discord: [PermissionFlagsBits.ManageMessages] },
    args: {
        user: { type: 'user', required: true },
        reason: { type: 'string', required: true, maxLength: 1000 },
    },
    async execute(ctx) {
        if (!ctx.guild) return;
        const user = await ctx.getUser('user');
        if (!user) return;
        const count = await transaction(async (c) => {
            const { rows } = await c.query<{ id: string }>(
                "UPDATE moderation_cases SET status='revoked' WHERE guild_id=$1 AND target_id=$2 AND action='warn' AND status='completed' RETURNING id",
                [ctx.guild!.id, user.id],
            );
            for (const row of rows)
                await c.query(
                    "INSERT INTO case_history(guild_id,case_id,actor_id,action,reason) VALUES($1,$2,$3,'revoke',$4)",
                    [ctx.guild!.id, row.id, ctx.user.id, ctx.getString('reason')],
                );
            return rows.length;
        });
        return ctx.reply({ content: `Revoked ${count} warnings.`, flags: 64 });
    },
} satisfies Command;

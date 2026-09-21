import { PermissionFlagsBits } from 'discord.js';
import { caseHistory } from '../../../features/moderation/service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'history',
    desc: 'View recent history for a member',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageMessages] },
    args: { user: { type: 'user', required: true } },
    async execute(ctx) {
        const user = await ctx.getUser('user');
        if (!user || !ctx.guild) return;
        const rows = await caseHistory(ctx.guild.id, user.id, false);
        return ctx.reply({
            content:
                rows.map((r) => `#${r.id} ${r.action} (${r.status}): ${r.reason.slice(0, 70)}`).join('\n') ||
                'No cases found.',
            flags: 64,
        });
    },
} satisfies Command;

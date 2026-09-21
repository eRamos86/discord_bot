import { PermissionFlagsBits } from 'discord.js';
import { auditedAction } from '../../../features/moderation/service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'purge',
    desc: 'Delete up to 100 recent messages',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },
    args: { amount: { type: 'integer', required: true, minValue: 1, maxValue: 100 } },
    async execute(ctx) {
        if (!ctx.guild || !ctx.channel.raw) return;
        await ctx.defer(64);
        let count = 0;
        const id = await auditedAction(
            ctx.guild,
            ctx.user.id,
            ctx.channel.raw.id,
            'purge',
            `Requested ${ctx.getNumber('amount')} messages`,
            async () => {
                const deleted = (await ctx.channel.delete(ctx.getNumber('amount')!)) as { size: number };
                count = deleted.size;
            },
        );
        return ctx.reply(`Deleted ${count} messages newer than 14 days. Case #${id}.`);
    },
} satisfies Command;

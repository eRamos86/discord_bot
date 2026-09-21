import { PermissionFlagsBits } from 'discord.js';
import { auditedAction } from '../../../features/moderation/service.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'cleanup',
    desc: 'Remove recent bot messages from this channel',
    access: { discord: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },
    args: { amount: { type: 'integer', minValue: 1, maxValue: 100 } },
    async execute(ctx) {
        const channel = ctx.channel.raw;
        requireValue(ctx.guild && channel && 'bulkDelete' in channel, 'Use a server text channel.');
        await ctx.defer(64);
        let count = 0;
        const id = await auditedAction(
            ctx.guild,
            ctx.user.id,
            channel.id,
            'cleanup',
            'Bot message cleanup',
            async () => {
                const messages = await channel.messages.fetch({ limit: ctx.getNumber('amount') ?? 50 });
                const deleted = await channel.bulkDelete(
                    messages.filter((m) => m.author.id === ctx.client.user!.id),
                    true,
                );
                count = deleted.size;
            },
        );
        return ctx.reply(`Deleted ${count} bot messages. Case #${id}.`);
    },
} satisfies Command;

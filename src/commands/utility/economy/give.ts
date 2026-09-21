import * as economy from '../../../features/engagement/economy.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'give',
    desc: 'Server economy: give',
    prefix: { enabled: true },
    args: {
        user: { type: 'user', required: true },
        amount: { type: 'integer', required: true, minValue: 1, maxValue: 1000000 },
    },
    async execute(ctx) {
        requireValue(ctx.guild && ctx.settings, 'Use this in a server.');
        const s = ctx.settings.economy;
        requireValue(s.enabled, 'The server economy is disabled.');
        const user = await ctx.getUser('user');
        requireValue(user && !user.bot, 'Choose a human recipient.');
        await economy.transfer(
            ctx.guild.id,
            ctx.user.id,
            user.id,
            ctx.getNumber('amount')!,
            ctx.interaction?.id ?? ctx.message!.id,
        );
        return ctx.reply('Transfer completed.');
    },
} satisfies Command;

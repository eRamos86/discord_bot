import * as economy from '../../../features/engagement/economy.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'work',
    desc: 'Server economy: work',
    prefix: { enabled: true },
    args: {},
    async execute(ctx) {
        requireValue(ctx.guild && ctx.settings, 'Use this in a server.');
        const s = ctx.settings.economy;
        requireValue(s.enabled, 'The server economy is disabled.');
        const amount = await economy.reward(
            ctx.guild.id,
            ctx.user.id,
            'work',
            s.workAmount,
            ctx.interaction?.id ?? ctx.message!.id,
        );
        return ctx.reply(`Earned ${amount} ${s.currency}.`);
    },
} satisfies Command;

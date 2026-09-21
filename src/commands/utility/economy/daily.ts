import * as economy from '../../../features/engagement/economy.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'daily',
    desc: 'Server economy: daily',
    prefix: { enabled: true },
    args: {},
    async execute(ctx) {
        requireValue(ctx.guild && ctx.settings, 'Use this in a server.');
        const s = ctx.settings.economy;
        requireValue(s.enabled, 'The server economy is disabled.');
        const amount = await economy.reward(
            ctx.guild.id,
            ctx.user.id,
            'daily',
            s.dailyAmount,
            ctx.interaction?.id ?? ctx.message!.id,
        );
        return ctx.reply(`Received ${amount} ${s.currency}.`);
    },
} satisfies Command;

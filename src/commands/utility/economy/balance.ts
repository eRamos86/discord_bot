import * as economy from '../../../features/engagement/economy.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'balance',
    desc: 'Server economy: balance',
    prefix: { enabled: true },
    args: { user: { type: 'user' } },
    async execute(ctx) {
        requireValue(ctx.guild && ctx.settings, 'Use this in a server.');
        const s = ctx.settings.economy;
        requireValue(s.enabled, 'The server economy is disabled.');
        const user = (await ctx.getUser('user')) ?? ctx.user;
        return ctx.reply(`${user.username}: ${await economy.balance(ctx.guild.id, user.id)} ${s.currency}`);
    },
} satisfies Command;

import { manageTicket } from '../../../features/tickets/index.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'close',
    desc: 'Close support ticket',
    prefix: { enabled: true },
    args: {},
    async execute(ctx) {
        if (!ctx.member || !ctx.channel.raw) return;
        await ctx.defer(64);
        const user = await ctx.getUser('user');
        await manageTicket(ctx.member, ctx.channel.raw.id, 'close', user?.id);
        return ctx.reply('Ticket updated.');
    },
} satisfies Command;

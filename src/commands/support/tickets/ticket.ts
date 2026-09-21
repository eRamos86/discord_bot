import { createTicket, manageTicket } from '../../../features/tickets/index.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'ticket',
    desc: 'Create and manage support tickets',
    prefix: { enabled: true },
    cooldownSeconds: 5,
    subcommands: {
        create: { args: { subject: { type: 'string', maxLength: 200 } } },
        close: {},
        reopen: {},
        claim: {},
        transcript: {},
        rename: { args: { name: { type: 'string', required: true, maxLength: 80 } } },
        add: { args: { user: { type: 'user', required: true } } },
        remove: { args: { user: { type: 'user', required: true } } },
    },
    async execute(ctx) {
        requireValue(ctx.guild && ctx.member && ctx.channel.raw, 'Use this in a server.');
        await ctx.defer(64);
        const action = ctx.getString('subcommand')!;
        if (action === 'create') {
            const result = await createTicket(
                ctx.guild,
                ctx.user,
                ctx.client.user!.id,
                ctx.getString('subject') ?? 'Support',
            );
            return ctx.reply(`Your ticket: <#${result.channel.id}>`);
        }
        const user = await ctx.getUser('user');
        const result = await manageTicket(
            ctx.member,
            ctx.channel.raw.id,
            action,
            user?.id ?? ctx.getString('name') ?? undefined,
        );
        return result ? ctx.reply({ files: [result] }) : ctx.reply(`Ticket ${action} completed.`);
    },
} satisfies Command;

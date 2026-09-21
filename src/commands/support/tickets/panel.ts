import { PermissionFlagsBits } from 'discord.js';
import { ticketPanelComponents } from '../../../features/tickets/index.js';
import type { Command } from '../../../types/command.types.js';
export default {
    responseVisibility: 'public',
    name: 'panel',
    desc: 'Publish a support ticket panel',
    access: { discord: [PermissionFlagsBits.ManageChannels] },
    async execute(ctx) {
        if (!ctx.settings?.tickets.enabled)
            return ctx.reply('Enable and configure tickets in /config first.');
        return ctx.reply({
            content: 'Need support? Open a private ticket.',
            components: ticketPanelComponents(ctx.settings.tickets.types),
        });
    },
} satisfies Command;

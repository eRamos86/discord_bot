import { PermissionFlagsBits } from 'discord.js';
import { saveSetting } from '../../../features/config/settings.service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'automod',
    desc: 'Enable or disable configured automod filters',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageGuild] },
    args: {
        action: {
            type: 'string',
            required: true,
            choices: [
                { name: 'Enable', value: 'enable' },
                { name: 'Disable', value: 'disable' },
            ],
        },
    },
    async execute(ctx) {
        if (!ctx.guild) return;
        await saveSetting(
            ctx.guild,
            ctx.user.id,
            'automod',
            'enabled',
            String(ctx.getString('action') === 'enable'),
        );
        return ctx.reply('Automod updated. Select filters and thresholds in /config.');
    },
} satisfies Command;

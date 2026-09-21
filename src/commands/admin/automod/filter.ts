import { PermissionFlagsBits } from 'discord.js';
import { saveSetting } from '../../../features/config/settings.service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'filter',
    desc: 'Toggle an automod filter',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageGuild] },
    args: {
        filter: {
            type: 'string',
            required: true,
            choices: ['profanity', 'links', 'invites', 'spam', 'caps', 'mentions', 'unicode'].map((v) => ({
                name: v,
                value: v,
            })),
        },
        enabled: { type: 'boolean', required: true },
    },
    async execute(ctx) {
        if (!ctx.guild) return;
        await saveSetting(
            ctx.guild,
            ctx.user.id,
            'automod',
            `filters.${ctx.getString('filter')}`,
            String(ctx.getBoolean('enabled')),
        );
        return ctx.reply('Filter updated. Automod must also be enabled.');
    },
} satisfies Command;

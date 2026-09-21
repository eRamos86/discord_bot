import { PermissionFlagsBits } from 'discord.js';
import { configPanel } from '../../../features/config/panel.js';
import { saveSetting } from '../../../features/config/settings.service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'config',
    desc: 'Configure server features using menus and forms',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageGuild] },
    args: {
        section: { type: 'string' },
        key: { type: 'string' },
        value: { type: 'string', maxLength: 4000 },
    },
    async execute(ctx) {
        if (!ctx.guild) return;
        const section = ctx.getString('section');
        if (!section) return ctx.reply(configPanel());
        await saveSetting(
            ctx.guild,
            ctx.user.id,
            section,
            ctx.getString('key') ?? 'set',
            ctx.getString('value') ?? '',
        );
        return ctx.reply({ content: 'Setting saved.', flags: 64 });
    },
} satisfies Command;

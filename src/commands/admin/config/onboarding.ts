import { PermissionFlagsBits } from 'discord.js';
import { onboardingEmbed } from '../../../features/welc-bye/service.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'onboarding',
    desc: 'Preview the configured welcome or goodbye message',
    access: { discord: [PermissionFlagsBits.ManageGuild] },
    args: {
        kind: {
            type: 'string',
            required: true,
            choices: [
                { name: 'Welcome', value: 'welcome' },
                { name: 'Goodbye', value: 'goodbye' },
            ],
        },
    },
    async execute(ctx) {
        requireValue(ctx.member && ctx.settings, 'Use this in a server.');
        const kind = ctx.getString('kind') === 'goodbye' ? 'goodbye' : 'welcome';
        return ctx.reply({
            content: 'Preview with your member details.',
            embeds: [onboardingEmbed(ctx.member, ctx.settings[kind])],
            flags: 64,
        });
    },
} satisfies Command;

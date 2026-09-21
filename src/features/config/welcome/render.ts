import { getGuildSettings } from '@db';
import * as ace from '@framework';
import * as dis from 'discord.js';

export async function renderWelcomeConfig(ctx: ace.CommandContext) {
    const settings = await getGuildSettings(ctx.guild!.id);

    const replyMethod = ctx.interaction ? ctx.editEmbed : ctx.replyEmbed;

    return replyMethod({
        embed: {
            title: 'Welcome Configuration',
            desc: [
                `**Enabled:** ${settings.welcome.enabled ? '✅' : '❌'}`,
                `**Channel:** ${settings.welcome.channelId ? `<#${settings.welcome.channelId}>` : 'Not Set'}`,
                '',
                `**Title:**`,
                settings.welcome.title ?? 'None',
                '',
                `**Message:**`,
                settings.welcome.message ?? 'None',
                '',
                `**Color:** ${settings.welcome.color}`,
            ].join('\n'),
        },

        thumbnail: ace.media.local('category_help'),
        footerIcon: ace.media.local('branding'),

        flags: dis.MessageFlags.Ephemeral,
    });
}

import { EmbedBuilder, type GuildMember, type PartialGuildMember } from 'discord.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import type { OnboardingSettings } from '../../database/guilds/settings.types.js';
import { reportError } from '../../framework/runtime/errors.js';
import { assignSafeRole } from '../roles/service.js';
export function parseMemberTemplate(template: string, member: GuildMember | PartialGuildMember) {
    const values: Record<string, string> = {
        user: `<@${member.id}>`,
        username: member.user.username,
        server: member.guild.name,
        guild: member.guild.name,
        memberCount: String(member.guild.memberCount),
    };
    return template.replace(
        /\{(user|username|server|guild|memberCount)\}/g,
        (_, name: string) => values[name] ?? '',
    );
}
export function onboardingEmbed(member: GuildMember | PartialGuildMember, s: OnboardingSettings) {
    const render = (text: string) => parseMemberTemplate(text, member);
    const embed = new EmbedBuilder()
        .setTitle(render(s.title ?? '').slice(0, 256) || null)
        .setDescription(render(s.message ?? '').slice(0, 2000) || ' ')
        .setColor(parseInt(s.color.slice(1), 16));
    if (s.footer) embed.setFooter({ text: render(s.footer).slice(0, 1024) });
    if (s.image) embed.setImage(s.image);
    if (s.thumbnail) embed.setThumbnail(member.user.displayAvatarURL());
    return embed;
}
export async function deliverOnboarding(
    member: GuildMember | PartialGuildMember,
    kind: 'welcome' | 'goodbye',
) {
    const s = (await getGuildSettings(member.guild.id))[kind];
    if (!s.enabled) return;
    if (kind === 'welcome' && !member.partial)
        for (const id of s.roleIds)
            await assignSafeRole(member, id, true).catch((e) => reportError(e, 'autorole'));
    const payload = { embeds: [onboardingEmbed(member, s)], allowedMentions: { parse: [] as never[] } };
    if (s.channelId) {
        const channel = await member.guild.channels.fetch(s.channelId);
        if (channel?.isTextBased() && 'send' in channel) await channel.send(payload);
    }
    if (kind === 'welcome' && s.dm)
        await member.user.send(payload).catch((e) => reportError(e, 'welcome_dm'));
}

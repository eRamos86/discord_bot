import { PermissionFlagsBits, type GuildMember } from 'discord.js';
import { requireValue } from '../../framework/runtime/errors.js';
export async function assignSafeRole(member: GuildMember, id: string, add: boolean) {
    const role = await member.guild.roles.fetch(id);
    const bot = await member.guild.members.fetchMe();
    requireValue(
        role && !role.managed && role.id !== member.guild.id && bot.roles.highest.comparePositionTo(role) > 0,
        'That role cannot be managed by the bot.',
    );
    requireValue(
        !role.permissions.any([
            PermissionFlagsBits.Administrator,
            PermissionFlagsBits.ManageGuild,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageWebhooks,
            PermissionFlagsBits.ModerateMembers,
            PermissionFlagsBits.ManageMessages,
        ]),
        'Automatic roles cannot grant moderation or administration permissions.',
    );
    if (add && !member.roles.cache.has(id)) await member.roles.add(role, 'Configured role assignment');
    if (!add && member.roles.cache.has(id)) await member.roles.remove(role, 'Configured role removal');
}

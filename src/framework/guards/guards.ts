import { PermissionsBitField, type Guild, type Message } from 'discord.js';
import { getOwnerIds } from '../../config/owners.js';
import type { Command } from '../../types/command.types.js';
import type { AnyInteraction } from '../context/context.types.js';
export enum PermissionLevel {
    PUBLIC = 0,
    MOD = 1,
    ADMIN = 2,
    OWNER = 3,
}
/** Optional deployment allowlist; ordinary servers do not require a bot owner to be a member. */
export async function guildAllowed(guild: Guild): Promise<boolean> {
    const ids = (process.env.ALLOWED_GUILD_IDS ?? '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    return ids.length === 0 || ids.includes(guild.id);
}
export function getPermissionLevel(interaction?: AnyInteraction, message?: Message): number {
    const id = interaction?.user.id ?? message?.author.id;
    if (id && getOwnerIds().includes(id)) return PermissionLevel.OWNER;
    const permissions = interaction?.memberPermissions ?? message?.member?.permissions;
    if (!permissions) return PermissionLevel.PUBLIC;
    if (
        permissions.has(PermissionsBitField.Flags.Administrator) ||
        permissions.has(PermissionsBitField.Flags.ManageGuild)
    )
        return PermissionLevel.ADMIN;
    if (
        permissions.has(PermissionsBitField.Flags.ManageMessages) ||
        permissions.has(PermissionsBitField.Flags.ModerateMembers)
    )
        return PermissionLevel.MOD;
    return PermissionLevel.PUBLIC;
}
export function canRun(interaction?: AnyInteraction, message?: Message, command?: Command): boolean {
    if (!command) return false;
    const id = interaction?.user.id ?? message?.author.id;
    if (command.access?.ownerOnly || command.requiredLevel === PermissionLevel.OWNER)
        return !!id && getOwnerIds().includes(id);
    const permissions = interaction?.memberPermissions ?? message?.member?.permissions;
    if (command.access?.discord?.length)
        return !!permissions && command.access.discord.every((p) => permissions.has(p));
    return getPermissionLevel(interaction, message) >= (command.requiredLevel ?? 0);
}

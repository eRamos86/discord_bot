import { PermissionsBitField } from 'discord.js';
import { getOwnerIds } from '../../config/owners.js';
import type { GuildSettings } from '../../database/guilds/settings.types.js';
import type { Command } from '../../types/command.types.js';
import type { CommandContext } from '../context/context.types.js';
import { BotError } from '../runtime/errors.js';
import { PermissionLevel } from './guards.js';
export function authorizeLocal(
    ctx: Pick<CommandContext, 'user' | 'guild' | 'member'> & { interaction?: unknown },
    command: Command,
    settings: GuildSettings | null,
): void {
    const access = command.access;
    if ((access?.guildOnly ?? true) && !ctx.guild)
        throw new BotError('permission', 'Use this command in a server.');
    const owner = getOwnerIds().includes(ctx.user.id);
    if ((access?.ownerOnly || command.requiredLevel === PermissionLevel.OWNER) && !owner)
        throw new BotError('permission', 'This command is restricted to bot owners.');
    const name = command.name ?? command.data?.name ?? '';
    if (name !== 'config' && settings?.disabledCommands.includes(name))
        throw new BotError('permission', 'This command is disabled in this server.');
    const policy = settings?.permissions[name];
    const roles = ctx.member?.roles.cache;
    const guildOwner = ctx.guild?.ownerId === ctx.user.id;
    if (
        policy &&
        !guildOwner &&
        (policy.deniedUserIds.includes(ctx.user.id) || policy.deniedRoleIds.some((r) => roles?.has(r)))
    )
        throw new BotError('permission', 'Server command policy denies access.');
    if (
        policy &&
        !guildOwner &&
        (policy.userIds.length || policy.roleIds.length) &&
        !policy.userIds.includes(ctx.user.id) &&
        !policy.roleIds.some((r) => roles?.has(r))
    )
        throw new BotError('permission', 'This command is restricted by server policy.');
    const permissions = ctx.member?.permissions;
    const needed =
        access?.discord ??
        (command.requiredLevel === PermissionLevel.ADMIN
            ? [PermissionsBitField.Flags.ManageGuild]
            : command.requiredLevel === PermissionLevel.MOD
              ? [PermissionsBitField.Flags.ManageMessages]
              : []);
    if (needed.length && !guildOwner && (!permissions || !needed.every((p) => permissions.has(p))))
        throw new BotError('permission', 'You do not have the Discord permissions required for this action.');
    const botPermissions = ctx.guild?.members.me?.permissions;
    if (access?.bot?.length && (!botPermissions || !access.bot.every((p) => botPermissions.has(p))))
        throw new BotError('configuration', 'The bot is missing required Discord permissions.');
    if (access?.private && !ctx.interaction)
        throw new BotError('permission', 'Use the slash command for a private response.');
}
export class Cooldowns {
    private readonly until = new Map<string, number>();
    check(key: string, seconds = 2, now = Date.now()) {
        if ((this.until.get(key) ?? 0) > now)
            throw new BotError('validation', 'Please wait before using this command again.');
        if (this.until.size > 10000) for (const [k, v] of this.until) if (v <= now) this.until.delete(k);
        if (this.until.size >= 20000)
            throw new BotError('unavailable', 'The bot is busy. Please try again shortly.');
        this.until.set(key, now + seconds * 1000);
    }
}

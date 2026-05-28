import {
    PermissionsBitField,
    GuildMember,
    Message
} from "discord.js";

import { OWNER_IDS } from "../../config/owners.js";
import type * as Types from "../../types/index.js";

/**
 * Hierarchical permission levels used across the bot.
 *
 * These values define the minimum required access level
 * a user must have to execute a command.
 *
 * The system works by comparing:
 * - user's resolved permission level (see permissionResolver)
 * - command.requiredLevel
 *
 * Higher number = higher privilege.
 *
 * Order:
 * PUBLIC (0)  → default user, no special permissions
 * MOD    (1)  → moderation permissions (kick, manage messages, etc.)
 * ADMIN  (2)  → administrator-level permissions
 * OWNER  (3)  → bot owners (highest priority, bypass most checks)
 *
 * Example:
 * requiredLevel: PermissionLevel.ADMIN
 * → only ADMIN and OWNER can run the command
 */
export enum PermissionLevel {
    PUBLIC = 0,
    MOD = 1,
    ADMIN = 2,
    OWNER = 3
}

/**
 * Determines whether a guild is allowed for bot operation
 * based on the presence and permissions of configured owners.
 *
 * This acts as a safety gate to ensure:
 * - The bot only runs in guilds where at least one owner is present
 * - At least one owner in the guild has Administrator permissions
 *
 * This is typically used as a startup or join-time validation
 * to prevent the bot from operating in unauthorized servers.
 */
export async function guildAllowed(guild: any): Promise<boolean> {

    /**
     * Ensure guild member cache is populated before checks.
     * This avoids false negatives when checking OWNER_IDS.
     */
    await guild.members.fetch().catch(() => {});

    /**
     * Resolve all configured owners who are present in this guild
     */
    const ownersInGuild = OWNER_IDS.map(id =>
        guild.members.cache.get(id)
    ).filter(Boolean);

    /**
     * If no configured owners are present in the guild,
     * the guild is automatically disallowed.
     */
    if (ownersInGuild.length === 0) return false;

    /**
     * Check whether at least one owner has Administrator permissions.
     *
     * This ensures an owner has full control in the guild
     * before allowing the bot to operate.
     */
    const hasAdminOwner = ownersInGuild.some((member: any) =>
        member.permissions?.has(PermissionsBitField.Flags.Administrator)
    );

    return hasAdminOwner;
    
}

/**
 * Resolves a numeric permission level for a user based on:
 * - ownership
 * - Discord permissions
 * - fallback public access
 *
 * Supports both:
 * - slash commands (interaction)
 * - prefix commands (message)
 */
export function getPermissionLevel(
    interaction?: Types.AnyInteraction,
    message?: Message
): number {

    /**
     * Resolve user object from either interaction or message
     */
    const user = interaction?.user ?? message?.author;

    /**
     * Resolve guild member safely
     * (explicit narrowing to avoid TS union hell)
     */
    const member: GuildMember | null =
    (interaction?.member as GuildMember | null)
    ?? message?.member
    ?? null;

    if (!user || !member) return 0;

    const userId = user.id;

    // =========================
    // OWNER LEVEL
    // =========================
    if (OWNER_IDS.includes(userId)) return 3;

    // =========================
    // ADMIN LEVEL
    // =========================
    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return 2;

    // =========================
    // MOD LEVEL
    // =========================
    if (member.permissions.has(PermissionsBitField.Flags.KickMembers) && member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return 1;

    // =========================
    // DEFAULT PUBLIC LEVEL
    // =========================
    return 0;
}

/**
 * Permission guard for command execution.
 *
 * Determines whether a user is allowed to execute a command
 * by comparing their resolved permission level against the
 * command's required permission level.
 *
 * This works for both:
 * - Slash commands (interaction-based)
 * - Prefix commands (message-based)
 *
 * The permission system is centralized via `getPermissionLevel`,
 * which abstracts role / hierarchy logic away from this function.
 */
export function canRun(
    interaction?: Types.AnyInteraction,
    message?: Message,
    command?: Types.Command
): boolean {

    /**
     * Resolve user's permission level from either interaction or message context
     */
    const userLevel = getPermissionLevel(interaction, message);

    /**
     * Minimum required level for this command
     * Defaults to 0 (no restriction) if not specified
     */
    const required = command?.requiredLevel ?? 0;

    /**
     * Allow execution only if user meets or exceeds required level
     */
    return userLevel >= required;
}
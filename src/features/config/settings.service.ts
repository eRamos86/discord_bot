import { ChannelType, PermissionFlagsBits, type Guild } from 'discord.js';
import { validateSettings } from '../../database/guilds/validation.js';
import { createDefaultGuildSettings } from '../../database/guilds/defaults.js';
import { getGuildSettings, updateGuildSettings } from '../../database/guilds/settings.helpers.js';
import type { GuildSettings } from '../../database/guilds/settings.types.js';
import { requireValue } from '../../framework/runtime/errors.js';
import { logEvent } from '../logging/service.js';
export const sections = [
    'prefix',
    'welcome',
    'goodbye',
    'logging',
    'automod',
    'security',
    'tickets',
    'roles',
    'leveling',
    'economy',
    'permissions',
    'disabledCommands',
] as const;
export function settingKeys(section: string): string[] {
    const root = createDefaultGuildSettings('10000000000000000') as unknown as Record<string, unknown>;
    const v = root[section];
    function flatten(value: unknown, prefix = ''): string[] {
        if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length)
            return Object.entries(value).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
        return [prefix || 'set'];
    }
    return flatten(v);
}
export function changeSetting(
    settings: GuildSettings,
    section: string,
    key: string,
    raw: string,
): GuildSettings {
    requireValue(sections.includes(section as (typeof sections)[number]), 'Unknown settings section.');
    const aliases: Record<string, string> = { channel: 'channelId', set: 'set' };
    key = aliases[key] ?? key;
    if (section === 'logging' && ['messages', 'edits', 'deletions'].includes(key)) key = `events.${key}`;
    requireValue(settingKeys(section).includes(key), 'Choose a setting listed in /config.');
    const copy = structuredClone(settings);
    const root = copy as unknown as Record<string, unknown>;
    let target = root;
    const parts = key === 'set' ? [section] : [section, ...key.split('.')];
    for (const part of parts.slice(0, -1)) {
        const v = target[part];
        requireValue(v && typeof v === 'object' && !Array.isArray(v), 'Invalid setting path.');
        target = v as Record<string, unknown>;
    }
    const last = parts.at(-1)!;
    const old = target[last];
    let value: unknown = raw;
    if (typeof old === 'boolean') {
        requireValue(['true', 'false'].includes(raw), 'Enter true or false.');
        value = raw === 'true';
    } else if (typeof old === 'number') {
        value = Number(raw);
        requireValue(raw.trim() && Number.isFinite(value), 'Enter a finite number.');
    } else if (Array.isArray(old) || (old && typeof old === 'object')) {
        try {
            value = JSON.parse(raw);
        } catch {
            requireValue(false, 'Enter a JSON list or object for this setting.');
        }
        requireValue(
            Array.isArray(old)
                ? Array.isArray(value)
                : !!value && typeof value === 'object' && !Array.isArray(value),
            'Invalid setting structure.',
        );
    } else if (old === null) value = raw.trim() ? raw : null;
    if (section === 'automod' && key === 'action')
        requireValue(['delete', 'warn', 'timeout'].includes(raw), 'Action must be delete, warn, or timeout.');
    if (section === 'security' && key === 'action')
        requireValue(['alert', 'lockdown'].includes(raw), 'Action must be alert or lockdown.');
    target[last] = value;
    return copy;
}
export async function validateGuildReferences(guild: Guild, settings: GuildSettings, actorId?: string) {
    const bot = await guild.members.fetchMe();
    const actor = actorId ? await guild.members.fetch(actorId) : undefined;
    const roleIds = [
        ...settings.welcome.roleIds,
        ...settings.roles.selfRoleIds,
        settings.roles.verificationRoleId,
        ...Object.values(settings.leveling.levelRoles),
    ].filter((v): v is string => !!v);
    for (const id of roleIds) {
        const role = await guild.roles.fetch(id);
        requireValue(
            role && !role.managed && role.id !== guild.id && bot.roles.highest.comparePositionTo(role) > 0,
            'Assigned roles must be unmanaged roles below the bot.',
        );
        if (actor)
            requireValue(
                actor.id === guild.ownerId || actor.roles.highest.comparePositionTo(role) > 0,
                'Configured roles must be below your highest role.',
            );
        requireValue(
            !role.permissions.has(PermissionFlagsBits.Administrator) &&
                !role.permissions.any([
                    PermissionFlagsBits.ManageGuild,
                    PermissionFlagsBits.ManageRoles,
                    PermissionFlagsBits.BanMembers,
                    PermissionFlagsBits.KickMembers,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageWebhooks,
                    PermissionFlagsBits.ModerateMembers,
                    PermissionFlagsBits.ManageMessages,
                ]),
            'Automatic/self roles cannot carry moderation or administration permissions.',
        );
    }
    for (const id of settings.tickets.staffRoleIds) {
        const role = await guild.roles.fetch(id);
        requireValue(role && role.id !== guild.id, 'Ticket staff must be server roles other than everyone.');
        if (actor)
            requireValue(
                actor.id === guild.ownerId || actor.roles.highest.comparePositionTo(role) > 0,
                'Ticket staff roles must be below your highest role.',
            );
    }
    for (const id of [settings.tickets.categoryId, settings.tickets.archiveCategoryId]) {
        if (id)
            requireValue(
                (await guild.channels.fetch(id))?.type === ChannelType.GuildCategory,
                'Choose a category in this server.',
            );
    }
    for (const id of [
        settings.welcome.channelId,
        settings.goodbye.channelId,
        settings.logging.channelId,
        settings.tickets.transcriptChannelId,
        ...Object.values(settings.logging.channels),
    ]) {
        if (!id) continue;
        const channel = await guild.channels.fetch(id);
        requireValue(channel?.isTextBased() && 'send' in channel, 'Choose a text channel in this server.');
    }
}
export async function saveSetting(
    guild: Guild,
    actorId: string,
    section: string,
    key: string,
    value: string,
    revision?: number,
) {
    const settings = await getGuildSettings(guild.id);
    if (revision !== undefined)
        requireValue(settings.revision === revision, 'Settings changed; reopen /config.');
    const changed = changeSetting(settings, section, key, value);
    validateSettings(changed);
    const roleSetting =
        section === 'roles' ||
        (section === 'welcome' && key === 'roleIds') ||
        (section === 'leveling' && key === 'levelRoles') ||
        (section === 'tickets' && key === 'staffRoleIds');
    const actor = await guild.members.fetch(actorId);
    requireValue(actor.permissions.has(PermissionFlagsBits.ManageGuild), 'Manage Server is required.');
    if (roleSetting)
        requireValue(actor.permissions.has(PermissionFlagsBits.ManageRoles), 'Manage Roles is required.');
    await validateGuildReferences(guild, changed, roleSetting ? actorId : undefined);
    await updateGuildSettings(changed);
    await logEvent(
        guild,
        'configuration',
        'Configuration changed',
        `<@${actorId}> updated ${section}.${key}.`,
    );
}

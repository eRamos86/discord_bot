import type { GuildSettings, LogCategory } from './settings.types.js';
export const logCategories: LogCategory[] = [
    'messages',
    'edits',
    'deletions',
    'joins',
    'leaves',
    'bans',
    'roles',
    'voice',
    'moderation',
    'automod',
    'commands',
    'configuration',
    'tickets',
    'security',
];
export function createDefaultGuildSettings(guildId: string): GuildSettings {
    const onboarding = {
        enabled: false,
        channelId: null,
        image: null,
        footer: null,
        dm: false,
        thumbnail: true,
        roleIds: [],
    };
    return {
        guildId,
        revision: 0,
        prefix: '---',
        welcome: { ...onboarding, title: 'Welcome!', message: '{user} joined {guild}.', color: '#00FF00' },
        goodbye: { ...onboarding, title: 'Goodbye!', message: '{username} left {guild}.', color: '#FF0000' },
        logging: {
            enabled: false,
            channelId: null,
            events: Object.fromEntries(logCategories.map((k) => [k, false])) as Record<LogCategory, boolean>,
            channels: {},
        },
        automod: {
            enabled: false,
            filters: {
                profanity: false,
                links: false,
                invites: false,
                spam: false,
                caps: false,
                mentions: false,
                unicode: false,
            },
            words: [],
            allowedDomains: [],
            exemptRoleIds: [],
            exemptChannelIds: [],
            action: 'delete',
            windowSeconds: 10,
            maxMessages: 8,
            maxDuplicates: 4,
            maxMentions: 8,
            capsPercent: 85,
            timeoutSeconds: 60,
        },
        security: { enabled: false, joinWindowSeconds: 20, maxJoins: 10, action: 'alert' },
        tickets: {
            enabled: false,
            categoryId: null,
            archiveCategoryId: null,
            staffRoleIds: [],
            transcriptChannelId: null,
            types: ['Support'],
        },
        roles: {
            enabled: false,
            verificationRoleId: null,
            selfRoleIds: [],
            requiredRoleId: null,
            minimumAccountDays: 0,
        },
        leveling: { enabled: false, cooldownSeconds: 60, xpPerMessage: 10, levelRoles: {} },
        economy: { enabled: false, dailyAmount: 100, workAmount: 25, currency: 'coins', shop: [] },
        permissions: {},
        disabledCommands: [],
    };
}
/** Fill missing keys on older settings without sharing mutable defaults. */
export function mergeDefaults<T>(defaults: T, value: unknown): T {
    if (Array.isArray(defaults)) return (Array.isArray(value) ? structuredClone(value) : defaults) as T;
    if (defaults !== null && typeof defaults === 'object') {
        const source =
            value && typeof value === 'object' && !Array.isArray(value)
                ? (value as Record<string, unknown>)
                : {};
        if (!Object.keys(defaults).length) return structuredClone(source) as T;
        return Object.fromEntries(
            Object.entries(defaults).map(([key, fallback]) => [key, mergeDefaults(fallback, source[key])]),
        ) as T;
    }
    return (value === undefined ? defaults : value) as T;
}

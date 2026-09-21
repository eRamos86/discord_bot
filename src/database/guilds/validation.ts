import { createDefaultGuildSettings, logCategories } from './defaults.js';
import { requireValue } from '../../framework/runtime/errors.js';
import type { GuildSettings } from './settings.types.js';
export const snowflake = /^\d{17,20}$/;
export function validateSettings(s: GuildSettings): void {
    validateShape(s, createDefaultGuildSettings('12345678901234567'));
    requireValue(
        ['delete', 'warn', 'timeout'].includes(s.automod.action) &&
            ['alert', 'lockdown'].includes(s.security.action),
        'Invalid automated action.',
    );
    for (const list of [s.automod.words, s.automod.allowedDomains, s.tickets.types, s.disabledCommands])
        requireValue(list.length <= 100 && list.every((v) => typeof v === 'string'), 'Invalid text list.');
    requireValue(
        s.economy.currency.length > 0 && s.economy.currency.length <= 30,
        'Currency name must be 1–30 characters.',
    );
    for (const [level, role] of Object.entries(s.leveling.levelRoles))
        requireValue(
            /^\d{1,4}$/.test(level) && Number(level) > 0 && typeof role === 'string' && snowflake.test(role),
            'Invalid level-role mapping.',
        );
    for (const [category, channel] of Object.entries(s.logging.channels))
        requireValue(
            logCategories.includes(category as (typeof logCategories)[number]) &&
                typeof channel === 'string' &&
                snowflake.test(channel),
            'Invalid logging destination.',
        );
    for (const [command, policy] of Object.entries(s.permissions)) {
        requireValue(/^[a-z][a-z0-9-]{0,31}$/.test(command), 'Invalid command permission key.');
        validateShape(policy, { userIds: [], roleIds: [], deniedUserIds: [], deniedRoleIds: [] });
    }
    requireValue(
        s.economy.shop.every(
            (item) =>
                item &&
                typeof item === 'object' &&
                typeof item.id === 'string' &&
                typeof item.name === 'string',
        ),
        'Invalid shop item structure.',
    );
    requireValue(snowflake.test(s.guildId), 'Invalid guild ID.');
    requireValue(
        s.prefix.length > 0 && s.prefix.length <= 10 && !/\s/.test(s.prefix),
        'Prefix must be 1–10 characters without spaces.',
    );
    for (const item of [s.welcome, s.goodbye]) {
        requireValue(
            (item.title?.length ?? 0) <= 256 &&
                (item.message?.length ?? 0) <= 2000 &&
                (item.footer?.length ?? 0) <= 1024,
            'Onboarding text is too long.',
        );
        requireValue(/^#[0-9a-f]{6}$/i.test(item.color), 'Use a six-digit hex color.');
        if (item.image) requireValue(/^https:\/\/[^\s]+$/.test(item.image), 'Images must use HTTPS.');
    }
    function walk(value: unknown, key = ''): void {
        if (key.endsWith('Id') && value !== null)
            requireValue(
                typeof value === 'string' && snowflake.test(value),
                'Invalid channel, role, or user ID.',
            );
        if (key.endsWith('Ids'))
            requireValue(
                Array.isArray(value) &&
                    value.length <= 100 &&
                    value.every((v) => typeof v === 'string' && snowflake.test(v)),
                'Invalid role/user list.',
            );
        if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, k);
    }
    walk(s);
    for (const [value, min, max] of [
        [s.automod.windowSeconds, 2, 120],
        [s.automod.maxMessages, 3, 100],
        [s.automod.maxDuplicates, 3, 100],
        [s.automod.maxMentions, 3, 100],
        [s.automod.capsPercent, 50, 100],
        [s.automod.timeoutSeconds, 10, 3600],
        [s.security.maxJoins, 5, 100],
        [s.security.joinWindowSeconds, 5, 300],
        [s.leveling.cooldownSeconds, 10, 3600],
        [s.leveling.xpPerMessage, 1, 100],
        [s.economy.dailyAmount, 1, 100000],
        [s.economy.workAmount, 1, 100000],
        [s.roles.minimumAccountDays, 0, 365],
    ] as const) {
        requireValue(
            Number.isInteger(value) && value >= min && value <= max,
            `A numeric setting is outside its permitted range (${min}–${max}).`,
        );
    }
    requireValue(
        s.automod.words.length <= 100 && s.automod.words.every((w) => w.length > 0 && w.length <= 80),
        'Use up to 100 filter words of 1–80 characters.',
    );
    requireValue(
        s.tickets.types.length > 0 &&
            s.tickets.types.length <= 10 &&
            s.tickets.types.every((t) => t.length > 0 && t.length <= 80),
        'Use 1–10 ticket types.',
    );
    requireValue(s.roles.selfRoleIds.length <= 25, 'A role panel supports up to 25 roles.');
    requireValue(
        s.economy.shop.length <= 25 &&
            s.economy.shop.every(
                (i) =>
                    /^[a-z0-9-]{1,32}$/.test(i.id) &&
                    i.name.length <= 80 &&
                    Number.isSafeInteger(i.price) &&
                    i.price > 0 &&
                    i.price <= 1000000,
            ),
        'Invalid shop item.',
    );
    requireValue(
        new Set(s.economy.shop.map((i) => i.id)).size === s.economy.shop.length,
        'Shop IDs must be unique.',
    );
}

function validateShape(value: unknown, template: unknown, path = 'settings'): void {
    if (template === null) {
        requireValue(value === null || typeof value === 'string', `${path} must be text or empty.`);
        return;
    }
    if (Array.isArray(template)) {
        requireValue(Array.isArray(value), `${path} must be a list.`);
        return;
    }
    if (typeof template === 'object') {
        requireValue(
            value && typeof value === 'object' && !Array.isArray(value),
            `${path} must be an object.`,
        );
        const obj = value as Record<string, unknown>;
        for (const [key, t] of Object.entries(template as Record<string, unknown>))
            validateShape(obj[key], t, `${path}.${key}`);
        return;
    }
    requireValue(typeof value === typeof template, `${path} has an invalid type.`);
}

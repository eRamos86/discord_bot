import { GuildSettings } from '@db';

export function applyWelcome(settings: GuildSettings, key: string, value: string): boolean {
    switch (key) {
        case 'enabled':
            if (!isBoolean(value)) return false;
            settings.welcome.enabled = toBoolean(value);
            return true;

        case 'channel':
            settings.welcome.channelId = channelId(value);
            return true;

        case 'title':
            settings.welcome.title = value || null;
            return true;

        case 'message':
            settings.welcome.message = value || null;
            return true;

        case 'color':
            if (!/^#[0-9a-f]{6}$/i.test(value)) return false;
            settings.welcome.color = value;
            return true;
        case 'image':
            settings.welcome.image = value || null;
            return true;
        case 'footer':
            settings.welcome.footer = value || null;
            return true;
    }
    return false;
}

export function applyGoodbye(settings: GuildSettings, key: string, value: string): boolean {
    switch (key) {
        case 'enabled':
            if (!isBoolean(value)) return false;
            settings.goodbye.enabled = toBoolean(value);
            return true;

        case 'channel':
            settings.goodbye.channelId = channelId(value);
            return true;

        case 'title':
            settings.goodbye.title = value || null;
            return true;

        case 'message':
            settings.goodbye.message = value || null;
            return true;

        case 'color':
            if (!/^#[0-9a-f]{6}$/i.test(value)) return false;
            settings.goodbye.color = value;
            return true;
        case 'image':
            settings.goodbye.image = value || null;
            return true;
        case 'footer':
            settings.goodbye.footer = value || null;
            return true;
    }
    return false;
}

export function applyLogging(settings: GuildSettings, key: string, value: string): boolean {
    switch (key) {
        case 'enabled':
            if (!isBoolean(value)) return false;
            settings.logging.enabled = toBoolean(value);
            return true;

        case 'channel':
            settings.logging.channelId = channelId(value);
            return true;

        case 'messages':
            if (!isBoolean(value)) return false;
            settings.logging.events.messages = toBoolean(value);
            return true;

        case 'edits':
            if (!isBoolean(value)) return false;
            settings.logging.events.edits = toBoolean(value);
            return true;

        case 'deletions':
            if (!isBoolean(value)) return false;
            settings.logging.events.deletions = toBoolean(value);
            return true;
    }
    return false;
}

function isBoolean(value: string): boolean {
    return ['true', 'false', 'yes', 'no', '1', '0', 'on', 'off'].includes(value.toLowerCase());
}

function toBoolean(value: string): boolean {
    return ['true', 'yes', '1', 'on'].includes(value.toLowerCase());
}

function channelId(value: string): string | null {
    const normalized = value.replace(/[<#>]/g, '').trim();
    return normalized || null;
}

import { GuildSettings } from '@db';

export function applyWelcome(settings: GuildSettings, key: string, value: string) {
    switch (key) {
        case "enabled":
            settings.welcome.enabled = value === "true";
            break;

        case "channel":
            settings.welcome.channelId = value;
            break;

        case "title":
            settings.welcome.title = value;
            break;

        case "message":
            settings.welcome.message = value;
            break;

        case "color":
            settings.welcome.color = value;
            break;
    }
}

export function applyGoodbye(settings: GuildSettings, key: string, value: string) {
    switch (key) {
        case "enabled":
            settings.goodbye.enabled = value === "true";
            break;

        case "channel":
            settings.goodbye.channelId = value;
            break;

        case "title":
            settings.goodbye.title = value;
            break;

        case "message":
            settings.goodbye.message = value;
            break;

        case "color":
            settings.goodbye.color = value;
            break;
    }
}

export function applyLogging(settings: GuildSettings, key: string, value: string) {
    switch (key) {
        case "enabled":
            settings.logging.enabled = value === "true";
            break;

        case "channel":
            settings.logging.channelId = value;
            break;

        case "messages":
            settings.logging.events.messages = value === "true";
            break;

        case "edits":
            settings.logging.events.edits = value === "true";
            break;

        case "deletions":
            settings.logging.events.deletions = value === "true";
            break;
    }
}

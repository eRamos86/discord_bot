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

import { GuildSettings } from '@db';

export function createDefaultGuildSettings(guildId: string): GuildSettings {

    return {

        guildId,

        prefix: "---",

        welcome: {
            enabled: false,
            channelId: null,

            title: "Welcome!",
            message: "{user} joined the server.",

            color: "#00FF00",
            image: null,
            footer: null,
        },

        goodbye: {
            enabled: false,
            channelId: null,

            title: "Goodbye!",
            message: "{user} left the server.",

            color: "#FF0000",
            image: null,
            footer: null,
        },

        logging: {
            enabled: false,
            channelId: null,

            events: {
                messages: false,
                edits: true,
                deletions: true,
            },
        },

    };

}

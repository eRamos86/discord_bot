
export interface GuildSettings {

    guildId: string;

    prefix: string;

    welcome: {
        enabled: boolean
        channelId: string | null;

        title: string | null;
        message: string | null;

        color: string;
        image: string | null;
        footer: string | null;
    };

    goodbye: {
        enabled: boolean
        channelId: string | null;

        title: string | null;
        message: string | null;

        color: string;
        image: string | null;
        footer: string | null;
    };

    logging: {
        enabled: boolean;
        channelId: string | null;

        events: {
            messages: boolean;
            edits: boolean;
            deletions: boolean;
        };
    };

}


export interface GuildSettingsProvider {

    get(guildId: string): Promise<GuildSettings>;

    update(settings: GuildSettings): Promise<void>;

    delete?(guildId: string): Promise<void>;

};

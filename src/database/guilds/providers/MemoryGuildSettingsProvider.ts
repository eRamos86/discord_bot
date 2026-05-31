import {
    GuildSettings,
    GuildSettingsProvider,
    createDefaultGuildSettings
} from '@db';

export class MemoryGuildSettingsProvider
implements GuildSettingsProvider {

    private cache = new Map<string, GuildSettings>();

    async get(guildId: string): Promise<GuildSettings> {

        let settings = this.cache.get(guildId);

        if (!settings) {

            settings = createDefaultGuildSettings(guildId);


            this.cache.set(
                guildId,
                settings
            );

        }

        return settings;

    }

    async update(settings: GuildSettings): Promise<void> {

        this.cache.set(
            settings.guildId,
            settings
        );

    }

}

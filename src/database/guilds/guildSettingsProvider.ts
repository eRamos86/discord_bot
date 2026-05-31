import { GuildSettings } from '@db';

export interface GuildSettingsProvider {

    get(guildId: string): Promise<GuildSettings>;

    update(settings: GuildSettings): Promise<void>;

    delete?(guildId: string): Promise<void>;

};

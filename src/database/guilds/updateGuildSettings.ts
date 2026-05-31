import {
    GuildSettings,
    guildSettingsProvider
} from '@db';

export async function updateGuildSettings(settings: GuildSettings) {
    await guildSettingsProvider.update(settings);
}

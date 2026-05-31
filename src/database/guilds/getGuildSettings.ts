import { guildSettingsProvider } from '@db';

export async function getGuildSettings(guildId: string) {
    return guildSettingsProvider.get(guildId);
}

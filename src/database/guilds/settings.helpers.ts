import { guildSettingsProvider } from './settings.provider.js';
import type { GuildSettings } from './settings.types.js';
import { validateSettings } from './validation.js';
export { createDefaultGuildSettings } from './defaults.js';
export function getGuildSettings(guildId: string) {
    return guildSettingsProvider.get(guildId);
}
export async function updateGuildSettings(settings: GuildSettings) {
    validateSettings(settings);
    await guildSettingsProvider.update(settings);
}

import { BotError } from '../../../framework/runtime/errors.js';
import { createDefaultGuildSettings } from '../defaults.js';
import type { GuildSettings, GuildSettingsProvider } from '../settings.types.js';
/** Explicit test/development adapter. The production entry point requires PostgreSQL. */
export class MemoryGuildSettingsProvider implements GuildSettingsProvider {
    private readonly values = new Map<string, GuildSettings>();
    async get(id: string) {
        return structuredClone(this.values.get(id) ?? createDefaultGuildSettings(id));
    }
    async update(s: GuildSettings) {
        if ((this.values.get(s.guildId)?.revision ?? 0) !== s.revision)
            throw new BotError('validation', 'Settings changed; reload /config.');
        s.revision++;
        this.values.set(s.guildId, structuredClone(s));
    }
    async delete(id: string) {
        this.values.delete(id);
    }
}

import type { GuildSettings, GuildSettingsProvider } from '../settings.types.js';
/** Short TTL for Discord guild settings only. Nova grants are never cached here. */
export class CachedGuildSettingsProvider implements GuildSettingsProvider {
    private readonly cache = new Map<string, { expires: number; settings: GuildSettings }>();
    constructor(
        private readonly provider: GuildSettingsProvider,
        private readonly ttlMs = 5000,
    ) {}
    async get(id: string) {
        const cached = this.cache.get(id);
        if (cached && cached.expires > Date.now()) return structuredClone(cached.settings);
        const settings = await this.provider.get(id);
        if (this.cache.size >= 1000) this.cache.delete(this.cache.keys().next().value!);
        this.cache.set(id, { expires: Date.now() + this.ttlMs, settings: structuredClone(settings) });
        return settings;
    }
    async update(settings: GuildSettings) {
        try {
            await this.provider.update(settings);
        } finally {
            this.cache.delete(settings.guildId);
        }
    }
    async delete(id: string) {
        this.cache.delete(id);
        await this.provider.delete?.(id);
    }
    invalidate(id?: string) {
        if (id) this.cache.delete(id);
        else this.cache.clear();
    }
}

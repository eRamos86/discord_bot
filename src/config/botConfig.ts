import { ColorResolvable } from 'discord.js';
import { pool } from '../database/client.js';

export interface ServiceBrandingConfig {
    color: string;
    emoji: string;
    label: string;
}

export interface ThemePaletteConfig {
    primary: string;
    success: string;
    error: string;
    warning: string;
    danger: string;
    neutral: string;
    [key: string]: string;
}

export interface BotConfigData {
    prefix: string;
    theme: ThemePaletteConfig;
    services: Record<string, ServiceBrandingConfig>;
}

export const DEFAULT_BOT_CONFIG: BotConfigData = {
    prefix: '---',
    theme: {
        primary: '#5865F2',
        success: '#57F287',
        error: '#ED4245',
        warning: '#ffa51d',
        danger: '#960000',
        neutral: '#2B2D31',
    },
    services: {
        nova: { color: '#6200b3', emoji: '🔑', label: 'Nova' },
        atlas: { color: '#51f5ea', emoji: '📚', label: 'Atlas' },
        nexus: { color: '#cc75f5', emoji: '🌐', label: 'Nexus' },
        munchpoints: { color: '#b0a740', emoji: '🍔', label: 'MunchPoints' },
        apex: { color: '#ff5b14', emoji: '🏎️', label: 'Apex' },
        flux: { color: '#00c721', emoji: '💰', label: 'Flux' },
        admin: { color: '#883f86', emoji: '⚙️', label: 'Admin' },
    },
};

export class BotConfigManager {
    private data: BotConfigData = JSON.parse(JSON.stringify(DEFAULT_BOT_CONFIG));
    private loaded = false;

    /**
     * Loads the persistent bot configuration from PostgreSQL (bot_state table).
     * If no configuration is stored yet, it initializes with the default config.
     */
    async load(): Promise<void> {
        try {
            const { rows } = await pool.query<{ value: unknown }>(
                "SELECT value FROM bot_state WHERE key = 'bot_config'",
            );
            if (rows.length > 0 && rows[0]?.value && typeof rows[0].value === 'object') {
                const stored = rows[0].value as Partial<BotConfigData>;
                this.data = {
                    prefix: typeof stored.prefix === 'string' ? stored.prefix : DEFAULT_BOT_CONFIG.prefix,
                    theme: {
                        ...DEFAULT_BOT_CONFIG.theme,
                        ...(stored.theme ?? {}),
                    },
                    services: {
                        ...DEFAULT_BOT_CONFIG.services,
                        ...(stored.services ?? {}),
                    },
                };
            }
            this.loaded = true;
        } catch (error) {
            console.warn(
                '[BotConfig] Could not load persistent config from database, using defaults:',
                error,
            );
        }
    }

    /**
     * Persists current in-memory state to PostgreSQL.
     */
    private async persist(): Promise<void> {
        try {
            await pool.query(
                "INSERT INTO bot_state(key, value) VALUES('bot_config', $1) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                [JSON.stringify(this.data)],
            );
        } catch (error) {
            console.error('[BotConfig] Failed to persist bot configuration:', error);
            throw error;
        }
    }

    /**
     * Default command prefix.
     */
    get prefix(): string {
        return this.data.prefix;
    }

    /**
     * Updates default command prefix and persists to PostgreSQL.
     */
    async setPrefix(newPrefix: string): Promise<void> {
        this.data.prefix = newPrefix;
        await this.persist();
    }

    /**
     * Retrieves a color by role or service name.
     * Checks theme first, then services, then defaults to primary.
     */
    getColor(key: string): ColorResolvable {
        const lower = key.toLowerCase();
        if (lower in this.data.theme) {
            return this.data.theme[lower] as ColorResolvable;
        }
        if (lower in this.data.services) {
            return (this.data.services[lower]?.color ?? '#5865F2') as ColorResolvable;
        }
        return (this.data.theme.primary ?? '#5865F2') as ColorResolvable;
    }

    /**
     * Updates a theme color and persists to PostgreSQL.
     */
    async setThemeColor(key: string, hex: string): Promise<void> {
        this.data.theme[key.toLowerCase()] = hex;
        await this.persist();
    }

    /**
     * Retrieves branding details for a platform service.
     */
    getService(serviceName: string): ServiceBrandingConfig {
        const lower = serviceName.toLowerCase();
        return (
            this.data.services[lower] ?? {
                color: '#5865F2',
                emoji: '📦',
                label: serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
            }
        );
    }

    /**
     * Returns a snapshot of all configured platform services.
     */
    getServices(): Record<string, ServiceBrandingConfig> {
        return { ...this.data.services };
    }

    /**
     * Returns a snapshot of all configured theme colors.
     */
    getTheme(): ThemePaletteConfig {
        return { ...this.data.theme };
    }

    /**
     * Updates or creates a service branding configuration and persists.
     */
    async setService(serviceName: string, branding: Partial<ServiceBrandingConfig>): Promise<void> {
        const lower = serviceName.toLowerCase();
        const existing = this.getService(lower);
        this.data.services[lower] = {
            color: branding.color ?? existing.color,
            emoji: branding.emoji ?? existing.emoji,
            label: branding.label ?? existing.label,
        };
        await this.persist();
    }

    /**
     * Updates a service color directly.
     */
    async setServiceColor(serviceName: string, hex: string): Promise<void> {
        const lower = serviceName.toLowerCase();
        await this.setService(lower, { color: hex });
    }

    /**
     * Resets a section or all configuration back to code defaults.
     */
    async reset(section: 'all' | 'theme' | 'services' = 'all'): Promise<void> {
        if (section === 'all' || section === 'theme') {
            this.data.theme = JSON.parse(JSON.stringify(DEFAULT_BOT_CONFIG.theme));
        }
        if (section === 'all' || section === 'services') {
            this.data.services = JSON.parse(JSON.stringify(DEFAULT_BOT_CONFIG.services));
        }
        if (section === 'all') {
            this.data.prefix = DEFAULT_BOT_CONFIG.prefix;
        }
        await this.persist();
    }

    /**
     * Returns the full in-memory configuration state.
     */
    toJSON(): BotConfigData {
        return JSON.parse(JSON.stringify(this.data));
    }
}

export const botConfig = new BotConfigManager();

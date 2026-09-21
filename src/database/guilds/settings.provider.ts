import 'dotenv/config';
import { PostgresGuildSettingsProvider } from './providers/PostgresGuildSettingsProvider.js';
import { MemoryGuildSettingsProvider } from './providers/MemoryGuildSettingsProvider.js';
import { CachedGuildSettingsProvider } from './providers/CachedGuildSettingsProvider.js';
export const guildSettingsProvider = new CachedGuildSettingsProvider(
    process.env.DATABASE_URL ? new PostgresGuildSettingsProvider() : new MemoryGuildSettingsProvider(),
);

import { PostgresGuildSettingsProvider } from './providers/PostgresGuildSettingsProvider.js';
import { MemoryGuildSettingsProvider } from './providers/MemoryGuildSettingsProvider.js';

// Use PostgreSQL provider in production
// Falls back to memory provider if DATABASE_URL is not set
export const guildSettingsProvider = process.env.DATABASE_URL
    ? new PostgresGuildSettingsProvider()
    : new MemoryGuildSettingsProvider();
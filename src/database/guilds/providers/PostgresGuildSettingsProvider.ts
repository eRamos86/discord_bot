import { and, eq } from 'drizzle-orm';
import { BotError } from '../../../framework/runtime/errors.js';
import { db } from '../../client.js';
import { guildSettings as table } from '../../schema.js';
import { createDefaultGuildSettings, mergeDefaults } from '../defaults.js';
import type { GuildSettings, GuildSettingsProvider } from '../settings.types.js';
export class PostgresGuildSettingsProvider implements GuildSettingsProvider {
    async get(guildId: string): Promise<GuildSettings> {
        await db.insert(table).values({ guildId }).onConflictDoNothing();
        const [row] = await db.select().from(table).where(eq(table.guildId, guildId)).limit(1);
        if (!row) throw new BotError('database', 'Guild settings are unavailable.');
        return mergeDefaults(createDefaultGuildSettings(guildId), row);
    }
    async update(settings: GuildSettings): Promise<void> {
        const rows = await db
            .update(table)
            .set({ ...settings, revision: settings.revision + 1 })
            .where(and(eq(table.guildId, settings.guildId), eq(table.revision, settings.revision)))
            .returning({ id: table.guildId });
        if (!rows.length)
            throw new BotError(
                'validation',
                'Settings changed while you were editing. Open /config and try again.',
            );
        settings.revision++;
    }
    async delete(guildId: string) {
        await db.delete(table).where(eq(table.guildId, guildId));
    }
}

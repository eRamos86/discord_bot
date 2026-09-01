import { eq } from 'drizzle-orm';
import { db } from '../../client.js';
import { guildSettings as settingsTable } from '../../schema.js';
import {
    GuildSettings,
    GuildSettingsProvider,
    createDefaultGuildSettings
} from '@db';

export class PostgresGuildSettingsProvider implements GuildSettingsProvider {
    async get(guildId: string): Promise<GuildSettings> {
        const result = await db
            .select()
            .from(settingsTable)
            .where(eq(settingsTable.guildId, guildId))
            .limit(1);

        if (result.length > 0) {
            const row = result[0];
            return {
                guildId: row.guildId,
                prefix: row.prefix ?? '---',
                welcome: row.welcome as GuildSettings['welcome'],
                goodbye: row.goodbye as GuildSettings['goodbye'],
                logging: row.logging as GuildSettings['logging'],
            };
        }

        // Create default settings if none exist
        const defaults = createDefaultGuildSettings(guildId);
        await db.insert(settingsTable).values({
            guildId,
            prefix: defaults.prefix,
            welcome: defaults.welcome,
            goodbye: defaults.goodbye,
            logging: defaults.logging,
        });

        return defaults;
    }

    async update(settings: GuildSettings): Promise<void> {
        await db
            .insert(settingsTable)
            .values({
                guildId: settings.guildId,
                prefix: settings.prefix,
                welcome: settings.welcome,
                goodbye: settings.goodbye,
                logging: settings.logging,
            })
            .onConflictDoUpdate({
                target: settingsTable.guildId,
                set: {
                    prefix: settings.prefix,
                    welcome: settings.welcome,
                    goodbye: settings.goodbye,
                    logging: settings.logging,
                },
            });
    }

    async delete(guildId: string): Promise<void> {
        await db
            .delete(settingsTable)
            .where(eq(settingsTable.guildId, guildId));
    }
}
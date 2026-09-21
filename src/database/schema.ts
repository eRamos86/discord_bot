import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import type { GuildSettings } from './guilds/settings.types.js';
export const guildSettings = pgTable('guild_settings', {
    guildId: text('guild_id').primaryKey(),
    revision: integer('revision').notNull().default(0),
    prefix: text('prefix').default('---'),
    welcome: jsonb('welcome').$type<GuildSettings['welcome']>(),
    goodbye: jsonb('goodbye').$type<GuildSettings['goodbye']>(),
    logging: jsonb('logging').$type<GuildSettings['logging']>(),
    automod: jsonb('automod').$type<GuildSettings['automod']>(),
    security: jsonb('security').$type<GuildSettings['security']>(),
    tickets: jsonb('ticket_settings').$type<GuildSettings['tickets']>(),
    roles: jsonb('roles').$type<GuildSettings['roles']>(),
    leveling: jsonb('leveling').$type<GuildSettings['leveling']>(),
    economy: jsonb('economy').$type<GuildSettings['economy']>(),
    permissions: jsonb('permissions').$type<GuildSettings['permissions']>(),
    disabledCommands: jsonb('disabled_commands').$type<string[]>(),
});
// Retained for migration compatibility; all new economy operations use guild_wallets.
export const userEconomy = pgTable('user_economy', {
    userId: text('user_id').primaryKey(),
    balance: text('balance').default('0'),
});
export const tickets = pgTable('tickets', {
    ticketId: text('ticket_id').primaryKey(),
    guildId: text('guild_id').notNull(),
    channelId: text('channel_id').notNull(),
    authorId: text('author_id').notNull(),
    status: text('status').default('open'),
});

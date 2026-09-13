import { pgTable, text, boolean, jsonb } from 'drizzle-orm/pg-core';

export const guildSettings = pgTable('guild_settings', {
    guildId: text('guild_id').primaryKey(),
    prefix: text('prefix').default('---'),
    welcome: jsonb('welcome').$type<{
        enabled: boolean;
        channelId: string | null;
        title: string | null;
        message: string | null;
        color: string;
        image: string | null;
        footer: string | null;
    }>().default({
        enabled: false,
        channelId: null,
        title: "Welcome!",
        message: "{user} joined the server.",
        color: "#00FF00",
        image: null,
        footer: null,
    }),
    goodbye: jsonb('goodbye').$type<{
        enabled: boolean;
        channelId: string | null;
        title: string | null;
        message: string | null;
        color: string;
        image: string | null;
        footer: string | null;
    }>().default({
        enabled: false,
        channelId: null,
        title: "Goodbye!",
        message: "{user} left the server.",
        color: "#FF0000",
        image: null,
        footer: null,
    }),
    logging: jsonb('logging').$type<{
        enabled: boolean;
        channelId: string | null;
        events: {
            messages: boolean;
            edits: boolean;
            deletions: boolean;
        };
    }>().default({
        enabled: false,
        channelId: null,
        events: {
            messages: false,
            edits: true,
            deletions: true,
        },
    }),
    automod: jsonb('automod').$type<{
        enabled: boolean;
        filters: {
            profanity: boolean;
            links: boolean;
            invites: boolean;
            spam: boolean;
        };
    }>().default({
        enabled: false,
        filters: {
            profanity: false,
            links: false,
            invites: false,
            spam: false,
        },
    }),
});

export const userEconomy = pgTable('user_economy', {
    userId: text('user_id').primaryKey(),
    balance: text('balance').default('0'), // store as string/numeric string or integer if preferred
});

export const tickets = pgTable('tickets', {
    ticketId: text('ticket_id').primaryKey(),
    guildId: text('guild_id').notNull(),
    channelId: text('channel_id').notNull(),
    authorId: text('author_id').notNull(),
    status: text('status').default('open'),
});
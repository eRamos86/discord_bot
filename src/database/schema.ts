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
});
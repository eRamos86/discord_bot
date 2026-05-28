import {
    EmbedBuilder,
    ColorResolvable,
    APIEmbedField,
    Client,
    Message,
    AttachmentBuilder,
    User
} from "discord.js";
import { AnyInteraction } from "./context.types.js";


/* ---------------------------------------- */
/* EMBED OPTIONS                            */
/* ---------------------------------------- */

/**
 * Configuration options for building a standardized embed.
 *
 * This is the high-level abstraction used by `createEmbed`
 * to enforce consistent embed formatting across the bot.
 */
export type EmbedOptions = {
    title?: string;
    desc?: string;
    footer?: string;
    color?: ColorResolvable;
    timestamp?: boolean;
    fields?: APIEmbedField[];
};

/* ---------------------------------------- */
/* MEDIA TYPES                              */
/* ---------------------------------------- */

/**
 * Logical location for stored local media assets.
 *
 * These map to folders under:
 * /src/images/<location>/
 */
export type MediaLocation =
    | "thumbnails"
    | "images"
    | "footer";

/* ---------------------------------------- */
/* MEDIA CONFIG                             */
/* ---------------------------------------- */

/**
 * Uses the invoking user as the media source (avatar).
 */
export interface UserMediaConfig {
    type: "user";
}

/**
 * Uses the guild/server icon as the media source.
 */
export interface GuildMediaConfig {
    type: "guild";
}

/**
 * Uses the bot's own avatar as the media source.
 */
export interface BotMediaConfig {
    type: "bot";
}

/**
 * Uses a specific target Discord user as the media source.
 */
export interface TargetUserMediaConfig {
    type: "targetUser";
    user: User;
}

/**
 * Uses a local file stored on disk.
 *
 * File resolution is handled by `resolveMedia`.
 */
export interface LocalMediaConfig {
    type: "local";
    file: string;
}

/**
 * Union type of all supported media configurations.
 *
 * This abstraction allows the embed system to accept
 * multiple kinds of media sources in a consistent format.
 */
export type MediaConfig =
    | UserMediaConfig
    | GuildMediaConfig
    | BotMediaConfig
    | TargetUserMediaConfig
    | LocalMediaConfig;

/* ---------------------------------------- */
/* PAYLOAD OPTIONS                          */
/* ---------------------------------------- */

/**
 * Input options for converting an embed into a Discord-ready payload.
 *
 * This is the bridge between:
 * - internal embed abstraction
 * - Discord message format
 */
export type PayloadOptions = {
    embed: EmbedBuilder;

    thumbnail?: MediaConfig;
    image?: MediaConfig;
    footerIcon?: MediaConfig;

    client: Client;

    interaction?: AnyInteraction;
    message?: Message;
};

/* ---------------------------------------- */
/* RESOLVED MEDIA                           */
/* ---------------------------------------- */

/**
 * Final resolved media result after processing a MediaConfig.
 *
 * Contains:
 * - URL used inside embeds
 * - optional AttachmentBuilder if local file is required
 */
export type ResolvedMedia = {
    url: string;
    attachment?: AttachmentBuilder;
};
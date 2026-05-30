import {
    EmbedBuilder,
    ColorResolvable,
    APIEmbedField,
    Client,
    Message,
    AttachmentBuilder,
    User
} from "discord.js";

import * as ace from '@framework';


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

    thumbnail?: ace.MediaConfig;
    image?: ace.MediaConfig;
    footerIcon?: ace.MediaConfig;

    client: Client;

    interaction?: ace.AnyInteraction;
    message?: Message;
};


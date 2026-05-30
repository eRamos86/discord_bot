import {
    EmbedBuilder,
    AttachmentBuilder
} from "discord.js";

import { Colors } from "@config";

import * as Types from './embed.types.js';
import * as Constants from './embed.constants.js';
import { resolveMedia } from "./media.js";

/**
 * Creates a standardized Discord embed.
 *
 * This function centralizes embed creation so all embeds in the bot
 * share consistent styling, formatting, and footer branding.
 *
 * Features:
 * - automatic base footer injection
 * - optional custom footer append
 * - consistent color system
 * - optional timestamp support
 * - optional fields support
 *
 * @param options Embed configuration options
 * @returns Discord EmbedBuilder instance ready to send
 */
export function createEmbed({
    title,
    desc,
    footer,
    color = Colors.primary,
    timestamp = true,
    fields
}: Types.EmbedOptions = {}) {

    /**
     * Final footer string construction.
     *
     * If a custom footer is provided, it is appended to the base footer
     * using a separator for clarity.
     *
     * Otherwise only the base footer is used.
     */
    const footerText = footer ? `${Constants.BASE_FOOTER}  •  ${footer}` : `${Constants.BASE_FOOTER}`;

    /**
     * Base embed builder instance with shared styling applied.
     */
    const embed = new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: footerText });

    // Optional embed properties
    if (timestamp) embed.setTimestamp();
    if (title) embed.setTitle(title);
    if (desc) embed.setDescription(desc);
    if (fields?.length) embed.addFields(fields);

    return embed;

}

/**
 * Builds a complete Discord message payload from an embed + media configuration.
 *
 * This function is responsible for:
 * - resolving dynamic media (local files, URLs, attachments)
 * - injecting thumbnails, images, and footer icons into embeds
 * - collecting required attachment files for Discord upload
 *
 * It acts as the final transformation layer between:
 * - internal embed abstraction
 * - Discord.js message payload format
 *
 * @param options Payload configuration containing embed and optional media
 * @returns Discord-ready message payload with embeds and attachments
 */
export function createEmbedPayload(
    options: Types.PayloadOptions
) {

    const {
        embed,
        thumbnail,
        image,
        footerIcon,
        client,
        interaction,
        message
    } = options;
    const files: AttachmentBuilder[] = [];

    /* ------------------------------------ */
    /* THUMBNAIL                            */
    /* ------------------------------------ */

    /**
     * Resolve and attach thumbnail media if provided.
     *
     * Supports both remote URLs and local assets via resolveMedia().
     */
    if (thumbnail) {

        const resolved = resolveMedia({
            location: "thumbnail",
            media: thumbnail,
            client,
            interaction,
            message
        });

        embed.setThumbnail(resolved.url);

        if (resolved.attachment) files.push(resolved.attachment);

    }

    /* ------------------------------------ */
    /* IMAGE                                */
    /* ------------------------------------ */

    /**
     * Resolve and attach main embed image if provided.
     */
    if (image) {

        const resolved = resolveMedia({
            location: "image",
            media: image,
            client,
            interaction,
            message
        });

        embed.setImage(resolved.url);

        if (resolved.attachment) files.push(resolved.attachment);

    }

    /* ------------------------------------ */
    /* FOOTER ICON                          */
    /* ------------------------------------ */

    /**
     * Resolve and attach footer icon if provided.
     *
     * Overrides only the icon while preserving footer text.
     * Falls back to BASE_FOOTER if no footer text exists.
     */
    if (footerIcon) {

        const resolved = resolveMedia({
            location: "footer",
            media: footerIcon,
            client,
            interaction,
            message
        });

        /*
        const footer = embed.data.footer;

        embed.setFooter({
            text: `${Constants.BASE_FOOTER} ${footer?.text}` || Constants.BASE_FOOTER,
            iconURL: resolved.url
        });
        */

        if (resolved.attachment) files.push(resolved.attachment);

    }

    /**
     * Final Discord payload output.
     *
     * Always returns a single-embed payload with optional attachments.
     */
    return {
        embeds: [embed],
        files
    };

}
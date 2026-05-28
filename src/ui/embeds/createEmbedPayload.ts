import { AttachmentBuilder } from "discord.js";
import type * as Types from "../../types/index.js";
import { resolveMedia } from "./resolveMedia.js";
import * as Constants from "./constants.js";

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
            location: "thumbnails",
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
            location: "images",
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
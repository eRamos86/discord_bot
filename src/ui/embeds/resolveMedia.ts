import {
    Client,
    Message,
    AttachmentBuilder
} from "discord.js";
import type * as Types from "../../types/index.js";
import { fileExists } from '../../utils/fs/fileExists.js';
import { getFilePath } from '../../utils/fs/getFilePath.js';
import type * as Types from "../../types/index.js";

/**
 * Resolves a MediaConfig into a usable Discord embed asset.
 *
 * This is the core resolver for the embed media system.
 *
 * It converts abstract media definitions (user, guild, bot, local files)
 * into concrete Discord-compatible values:
 * - URL for embeds
 * - optional AttachmentBuilder for local files
 *
 * This allows the rest of the bot to remain agnostic of:
 * - file system structure
 * - Discord avatar logic
 * - fallback handling rules
 *
 * Resolution priority:
 * 1. explicit media type (user / targetUser / guild / bot / local)
 * 2. fallback file in the same location
 * 3. bot avatar as final fallback
 */
export function resolveMedia(options: {
    location: Types.MediaLocation;
    media: Types.MediaConfig;

    client: Client;

    interaction?: Types.AnyInteraction;
    message?: Message;
}): Types.ResolvedMedia {

    const {
        location,
        media,
        client,
        interaction,
        message
    } = options;

    /**
     * Cached bot avatar used as global fallback.
     */
    const botAvatar = client.user?.displayAvatarURL({ size: 512 }) ?? '';

    switch (media.type) {

        /**
         * USER MEDIA
         *
         * Resolves to:
         * - interaction user avatar (preferred)
         * - message author avatar (fallback)
         * - bot avatar (final fallback)
         */
        case "user":
            return {
                url: interaction?.user.displayAvatarURL({ size: 512 }) || message?.author.displayAvatarURL({ size: 512 }) || botAvatar
            };

        /**
         * TARGET USER MEDIA
         *
         * Explicit user provided in config.
         */
        case "targetUser":
            return {
                url: media.user.displayAvatarURL({ size: 512 })
            };

        /**
         * GUILD MEDIA
         *
         * Resolves to guild icon if available.
         * Falls back to bot avatar if missing.
         */
        case "guild":
            return {
                url: interaction?.guild?.iconURL({ size: 512 }) || botAvatar
            };

        /**
         * BOT MEDIA
         *
         * Always resolves to bot avatar.
         */
        case "bot":
            return {
                url: botAvatar
            };

        /**
         * LOCAL FILE MEDIA
         *
         * Resolves filesystem-based assets stored in:
         * /src/images/<location>/
         *
         * Priority:
         * 1. requested file
         * 2. default.png fallback handled later
         */
        case "local":

            const exactFile = `${media.file}.png`;
            if (fileExists(location, exactFile)) return {
                url: `attachment://${exactFile}`,
                attachment: new AttachmentBuilder(
                    getFilePath(location, exactFile),
                    { name: exactFile }
                )
            };

    }

    /**
     * DEFAULT FILE FALLBACK
     *
     * If requested asset is missing, attempt to load:
     * /src/images/<location>/default.png
     */
    const defaultFile = "default.png";

    if (fileExists(location, defaultFile)) return {
        url: `attachment://${defaultFile}`,
        attachment: new AttachmentBuilder(
            getFilePath(location, defaultFile),
            { name: defaultFile }
        )
    };

    /**
     * FINAL FALLBACK
     *
     * If no assets exist at all, fall back to bot avatar.
     * This guarantees the embed never breaks visually.
     */
    return {
        url: botAvatar
    };

}
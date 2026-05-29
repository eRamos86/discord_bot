import {
    Client,
    Message,
    AttachmentBuilder
} from "discord.js";
import type * as Types from '../../types/index.js';
import { fileExists } from '../../utils/fs/fileExists.js';
import { getFilePath } from '../../utils/fs/getFilePath.js';

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
    /**
     * Embed location.
     * 
     * Used for fallback directory lookup.
     */
    location: Types.MediaLocation;
    /**
     * Media configuration to resolve.
     */
    media: Types.MediaConfig;

    /**
     * Active Discord client.
     */
    client: Client;

    /**
     * Interaction context.
     */
    interaction?: Types.AnyInteraction;
    /**
     * Message context.
     */
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
     * Shared context references.
     */
    const guild = interaction?.guild || message?.guild;
    const currentUser = interaction?.user || message?.author;

    /**
     * Global fallback avatar.
     */
    const botAvatar = client.user?.displayAvatarURL({ size: 512 }) ?? '';

    switch (media.type) {

        /**
         * CURRENT USER MEDIA
         */
        case "user": {

            if (!currentUser) return { url: botAvatar };

            switch (media.asset) {
                case "banner": return {url: currentUser.bannerURL?.({ size: 2048 }) || botAvatar};
                default: return {url: currentUser.displayAvatarURL({ size: 512 })};
            }

        }

        /**
         * TARGET USER MEDIA
         */
        case "targetUser": {

            switch (media.asset) {
                case "banner": return {url: media.user.bannerURL?.({ size: 2048 }) || botAvatar};
                default: return {url: media.user.displayAvatarURL({ size: 512 })};
            }

        }

        /**
         * GUILD MEDIA
         */
        case "guild": {

            if (!guild) return { url: botAvatar };

            switch (media.asset) {  

                case "banner": return {url: guild.bannerURL({ size: 2048 }) || botAvatar};
                case "splash": return {url: guild.splashURL({ size: 2048 }) || botAvatar};
                case "discoverySplash": return {url: guild.discoverySplashURL({ size: 2048 }) || botAvatar};
                default: return {url: guild.iconURL({ size: 1024 }) || botAvatar};

            }
        }

        /**
         * BOT MEDIA
         */
        case "bot": {

            if (!client.user) return { url: botAvatar };

            switch (media.asset) {

                case "banner": return {url: client.user.bannerURL?.({ size: 2048 }) || botAvatar};
                default: return {url: client.user.displayAvatarURL({ size: 512 })};

            }
        }

        /**
         * LOCAL FILE MEDIA
         */
        case "local": {

            const exactFile = `${media.file}.png`;
    
            if (fileExists(location, exactFile)) return {
    
                url: `attachment://${exactFile}`,
                attachment: new AttachmentBuilder(
                    getFilePath(location, exactFile),
                    { name: exactFile }
                )
    
            };

            break;

        }

    }

    /**
     * DEFAULT LOCAL FALLBACK
     *
     * Attempts to resolve:
     * /images/<location>/default.png
     */
    const defaultFile = "default.png";

    if(fileExists(location, defaultFile)) return {
        url: `attachment://${defaultFile}`,
        attachment: new AttachmentBuilder(
            getFilePath(location, defaultFile),
            { name: defaultFile }
        )
    };

    /**
     * FINAL FALLBACK
     *
     * Guarantees embeds always contain valid media.
     */
    return {url: botAvatar};

}
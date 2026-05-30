
import {
    Client,
    User,
    Message,
    AttachmentBuilder
} from 'discord.js';
import * as Utils from '@utils';

import * as Media from './media.types.js';
import * as Context from '../context/index.js';

/**
 * Media factory helpers for the embed system.
 *
 * This module creates strongly typed media configuration objects
 * that are later resolved by `resolveMedia`.
 *
 * Instead of directly passing Discord URLs everywhere,
 * commands use abstract media descriptors.
 *
 * Benefits:
 * - centralized media logic
 * - unified embed API
 * - easy fallback handling
 * - scalable asset expansion
 * - decouples embeds from Discord internals
 */
export const media = {

    /**
     * Uses the current interacting user's media.
     *
     * Supported assets:
     * - avatar (default)
     * - banner
     *
     * @param asset Which user asset to resolve
     */
    user(
        asset: Media.UserAsset = "avatar"
    ): Media.UserMediaConfig {
        return {
            type: "user",
            asset
        };
    },

    /**
     * Uses the current guild's media.
     *
     * Supported assets:
     * - icon (default)
     * - banner
     * - splash
     * - discoverySplash
     *
     * @param asset Which guild asset to resolve
     */
    guild(
        asset: Media.GuildAsset = "icon"
    ): Media.GuildMediaConfig {
        return {
            type: "guild",
            asset
        };
    },

    /**
     * Uses the bot user's media.
     *
     * Supported assets:
     * - avatar (default)
     * - banner
     *
     * @param asset Which bot asset to resolve
     */
    bot(
        asset: Media.UserAsset = "avatar"
    ): Media.BotMediaConfig {
        return {
            type: "bot",
            asset
        };
    },

    /**
     * Uses a specific target user's media.
     *
     * Supported assets:
     * - avatar (default)
     * - banner
     *
     * @param user Discord user to resolve media from
     * @param asset Which user asset to resolve
     */
    targetUser(
        user: User,
        asset: Media.UserAsset = "avatar"
    ): Media.TargetUserMediaConfig {
        return {
            type: "targetUser",
            user,
            asset
        };
    },

    /**
     * Uses a local filesystem asset.
     *
     * Example:
     * media.local("branding/logo")
     * media.local("icons/warn")
     *
     * The resolver automatically appends `.png`.
     *
     * @param file Relative asset path
     */
    local(file: string): Media.LocalMediaConfig {
        return {
            type: "local",
            file
        };
    }

};

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
    location: Media.MediaLocation;
    /**
     * Media configuration to resolve.
     */
    media: Media.MediaConfig;

    /**
     * Active Discord client.
     */
    client: Client;

    /**
     * Interaction context.
     */
    interaction?: Context.AnyInteraction;
    /**
     * Message context.
     */
    message?: Message;
}): Media.ResolvedMedia {

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
    
            if (Utils.fileExists(location, exactFile)) return {
    
                url: `attachment://${exactFile}`,
                attachment: new AttachmentBuilder(
                    Utils.getFilePath(location, exactFile),
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

    if(Utils.fileExists(location, defaultFile)) return {
        url: `attachment://${defaultFile}`,
        attachment: new AttachmentBuilder(
            Utils.getFilePath(location, defaultFile),
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
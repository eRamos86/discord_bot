import { User } from "discord.js";
import type * as Types from "../types/index.js";

/**
 * Media factory helpers for the embed system.
 *
 * This module provides a unified way to describe different
 * types of media sources used in embeds (avatars, icons, local files, etc).
 *
 * Instead of directly passing URLs or resolving assets manually,
 * the system uses typed media configs that are later resolved
 * by `resolveMedia`.
 *
 * This enables:
 * - consistent media handling across embeds
 * - support for both local and dynamic sources
 * - easier extension of new media types
 */
export const media = {

    /**
     * Uses the current interacting user as the media source.
     * Typically resolves to the user's avatar.
     */
    user(): Types.UserMediaConfig {
        return {
            type: "user"
        };
    },

    /**
     * Uses the current guild as the media source.
     * Typically resolves to the server icon.
     */
    guild(): Types.GuildMediaConfig {
        return {
            type: "guild"
        };
    },

    /**
     * Uses the bot's own user avatar as the media source.
     */
    bot(): Types.BotMediaConfig {
        return {
            type: "bot"
        };
    },

    /**
     * Uses a specific target user as the media source.
     *
     * @param user Discord user whose avatar or profile is used
     */
    targetUser(user: User): Types.TargetUserMediaConfig {
        return {
            type: "targetUser",
            user
        };
    },

    /**
     * Uses a local file stored in the project filesystem.
     *
     * @param file Filename of the asset inside the media directory
     */
    local(file: string): Types.LocalMediaConfig {
        return {
            type: "local",
            file
        };
    }

};
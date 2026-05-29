import { User } from "discord.js";
import type * as Types from "../types/index.js";

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
        asset: Types.UserAsset = "avatar"
    ): Types.UserMediaConfig {
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
        asset: Types.GuildAsset = "icon"
    ): Types.GuildMediaConfig {
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
        asset: Types.UserAsset = "avatar"
    ): Types.BotMediaConfig {
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
        asset: Types.UserAsset = "avatar"
    ): Types.TargetUserMediaConfig {
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
    local(file: string): Types.LocalMediaConfig {
        return {
            type: "local",
            file
        };
    }

};
import {
    Role,
    TextBasedChannel,
    GuildMember,
    User
} from "discord.js";

import { BaseContext } from "../../types/index.js";

/**
 * Creates argument + entity getter utilities for CommandContext.
 *
 * These helpers ONLY read from ctx.args and do not perform Discord fetches.
 * They are intentionally lightweight and synchronous where possible.
 */
export function createGetters(ctx: BaseContext) {

    const { args } = ctx;

    /**
     * Gets a resolved User argument (if already provided by parser).
     */
    const getUser = async (name: string): Promise<User | null> => {
        const value = args[name];
        return value instanceof User ? value : null;
    };

    /**
     * Gets a resolved GuildMember argument.
     */
    const getMember = async (name: string): Promise<GuildMember | null> => {
        const value = args[name];
        return value instanceof GuildMember ? value : null;
    };

    /**
     * Gets a resolved Role argument.
     */
    const getRole = async (name: string): Promise<Role | null> => {
        const value = args[name];
        return value instanceof Role ? value : null;
    };

    /**
     * Gets a text-based channel argument.
     */
    const getChannel = async (name: string): Promise<TextBasedChannel | null> => {
        const value = args[name];
        if (value && typeof value === "object" && "send" in value) return value as TextBasedChannel;
        return null;
    };

    /**
     * Gets a string argument.
     */
    const getString = (name: string): string | null => {
        const value = args[name];
        return typeof value === "string" ? value : null;
    };

    /**
     * Gets a number argument.
     */
    const getNumber = (name: string): number | null => {
        const value = args[name];
        return typeof value === "number" ? value : null;
    };

    /**
     * Gets a boolean argument.
     */
    const getBoolean = (name: string): boolean | null => {
        const value = args[name];
        return typeof value === "boolean" ? value : null;
    };

    return {
        getUser,
        getMember,
        getRole,
        getChannel,
        getString,
        getNumber,
        getBoolean
    };
}
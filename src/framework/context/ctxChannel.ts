import {
    TextBasedChannel,
    MessageCreateOptions,
    MessagePayload
} from "discord.js";

import { ReplyOptions } from "./context.types.js";

/**
 * Lightweight safe wrapper around a Discord text-based channel.
 *
 * This abstraction standardizes channel operations across:
 * - messages
 * - interactions
 * - command contexts
 *
 * It prevents runtime crashes by validating channel capabilities
 * before executing Discord API methods.
 */
export function createChannelHelper(
    channel: TextBasedChannel | null
) {

    /**
     * Normalizes unified ReplyOptions into Discord-compatible payload.
     */
    const normalize = (options: ReplyOptions): MessageCreateOptions | MessagePayload => {
        if (typeof options === "string") return { content: options };
        return options as MessageCreateOptions;
    };

    return {

        /**
         * Bulk deletes messages from the channel.
         */
        delete: async (amount: number) => {
            if (!channel || !channel.isTextBased()) throw new Error("Channel is not text-based");
            if (!("bulkDelete" in channel)) throw new Error("bulkDelete not supported in this channel");
            return channel.bulkDelete(amount, true);
        },

        /**
         * Sends a message using unified ReplyOptions system.
         */
        send: (options: ReplyOptions) => {
            if (!channel || !channel.isTextBased()) throw new Error("Cannot send in a non-text channel");
            if (!("send" in channel)) throw new Error("Send not supported in this channel");
            return channel.send(normalize(options));
        }
    };
}
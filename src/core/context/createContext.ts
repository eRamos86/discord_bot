import { Message, User } from "discord.js";

import type { CommandContext, AnyInteraction, BaseContext, CtxState } from "../../types/index.js";

import { createGetters } from "./ctxGetters.js";
import { createReplies } from "./ctxReplies.js";
import { createChannelHelper } from "./ctxChannel.js";

import { BotClient } from "../client/client.js";

/**
 * Builds a fully composed CommandContext instance.
 *
 * Order of construction:
 * 1. Base runtime data (interaction/message/client/args)
 * 2. Channel wrapper
 * 3. Mutable state
 * 4. Getter utilities (sync helpers)
 * 5. Reply utilities (async interaction layer)
 * 6. Final merged CommandContext
 */
export async function createContext(params: {
    interaction?: AnyInteraction;
    message?: Message;
    client: BotClient;
    args: Record<string, any>;
}): Promise<CommandContext> {

    const { interaction, message, client, args } = params;

    /**
     * Unified channel abstraction
     */
    const channel = createChannelHelper(interaction?.channel ?? message?.channel ?? null);

    /**
     * Guild member resolution (cached if possible)
     */
    let guildMember = null;
    if (interaction?.guild) guildMember = await interaction.guild.members.fetch(interaction.user.id);
    else if (message?.member) guildMember = message.member;

    /**
     * Safe user resolution
     */
    const user: User = interaction?.user ?? message?.author ?? client.user!;

    /**
     * Base context (NO computed methods yet)
     */
    const baseContext: BaseContext = {
        interaction,
        message,
        client,
        args,
        user,
        guild: interaction?.guild ?? message?.guild ?? null,
        member: message?.member ?? null,
        guildMember,
        channel
    };

    /**
     * Mutable shared state
     */
    const state: CtxState = {storedReply: null};

    /**
     * Attach utility layers
     */
    const getters = createGetters(baseContext);
    const replies = createReplies({
        ...baseContext,
        state
    });

    /**
     * Final composed context
     */
    const ctx: CommandContext = {
        ...baseContext,
        ...getters,
        ...replies
    };

    return ctx;
}
import { GuildMember, Message, User } from 'discord.js';

import type { AnyInteraction, ArgsAccessor, BaseContext, CommandContext, CtxState } from './context.types.js';

import { createChannelHelper } from './ctxChannel.js';
import { createGetters } from './ctxGetters.js';
import { createReplies } from './ctxReplies.js';

import { BotClient } from '@framework/client/client.js';

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
    args: Record<string, unknown>;
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
    if (interaction?.guild) {
        guildMember = await interaction.guild.members
            .fetch(interaction.user.id)
            .catch(() => (interaction.member instanceof GuildMember ? interaction.member : null));
    } else if (message?.member) guildMember = message.member;

    /**
     * Safe user resolution
     */
    const user: User = interaction?.user ?? message?.author ?? client.user!;

    /**
     * Base context (NO computed methods yet)
     */
    const values = args;
    const raw =
        Array.isArray(values.raw) && values.raw.every((value): value is string => typeof value === 'string')
            ? values.raw
            : [];
    const methods = {
        getString: (name: string) => (typeof values[name] === 'string' ? values[name] : null),
        getNumber: (name: string) => (typeof values[name] === 'number' ? values[name] : null),
        getBoolean: (name: string) => (typeof values[name] === 'boolean' ? values[name] : null),
    };
    const accessor = new Proxy((name: string): unknown => values[name], {
        get(target, key, receiver) {
            if (key === 'raw') return raw;
            if (Object.hasOwn(methods, key)) return methods[key as keyof typeof methods];
            if (typeof key === 'string' && Object.hasOwn(values, key)) return values[key];
            return Reflect.get(target, key, receiver);
        },
    }) as ArgsAccessor;

    const baseContext: BaseContext = {
        interaction,
        message,
        createdTimestamp: interaction?.createdTimestamp ?? message?.createdTimestamp ?? Date.now(),
        client,
        args: accessor,
        user,
        guild: interaction?.guild ?? message?.guild ?? null,
        member: guildMember,
        guildMember,
        channel,
    };

    /**
     * Mutable shared state
     */
    const state: CtxState = { storedReply: null, private: interaction?.ephemeral === true };

    /**
     * Attach utility layers
     */
    const getters = createGetters(baseContext);
    const replies = createReplies({
        ...baseContext,
        state,
    });

    /**
     * Final composed context
     */
    const ctx: CommandContext = {
        ...baseContext,
        isInteraction: Boolean(interaction),
        deferReply: replies.defer,
        ...getters,
        ...replies,
    };

    return ctx;
}

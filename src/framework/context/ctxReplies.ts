import type {
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    MessageEditOptions,
    MessageReplyOptions,
} from 'discord.js';
import { MessageFlags, MessagePayload } from 'discord.js';
import { createEmbed, createEmbedPayload } from '../embed/index.js';

import { Colors } from '../../config/theme.js';

import type {
    AnyInteraction,
    BaseContext,
    CtxState,
    EditReplyOptions,
    EmbedReplyOptions,
    ReplyOptions,
} from './context.types.js';

/**
 * Reply utility layer for CommandContext.
 *
 * This layer is responsible for:
 * - replying to interactions/messages
 * - editing responses
 * - followups
 * - embed abstraction helpers
 *
 * IMPORTANT:
 * This module depends ONLY on BaseContext, NOT CommandContext,
 * to avoid circular type dependency.
 */
export function createReplies(ctx: BaseContext & { state: CtxState }) {
    const interaction = ctx.interaction as AnyInteraction | undefined;
    const message = ctx.message;
    const state = ctx.state;

    /**
     * Unified reply handler for both interactions and messages.
     */
    const reply = async (options: ReplyOptions) => {
        if (!(options instanceof MessagePayload)) {
            options =
                typeof options === 'string'
                    ? { content: options, allowedMentions: { parse: [], repliedUser: false } }
                    : {
                          ...options,
                          allowedMentions: options.allowedMentions ?? { parse: [], repliedUser: false },
                      };
        }
        if (interaction && !(options instanceof MessagePayload) && typeof options !== 'string') {
            if ('flags' in options && Number(options.flags) & 64) state.private = true;
            if (state.private) options = { ...options, flags: 64 };
        }
        if (!interaction) {
            if (message) {
                const payload =
                    options instanceof MessagePayload
                        ? options
                        : {
                              ...(typeof options === 'string' ? { content: options } : options),
                              flags:
                                  typeof options === 'object' &&
                                  'flags' in options &&
                                  typeof options.flags === 'number'
                                      ? options.flags & ~64
                                      : undefined,
                              failIfNotExists: false,
                          };
                state.storedReply = await message.reply(payload as MessageReplyOptions);
                return state.storedReply;
            }
            throw new Error('No interaction or message available');
        }
        if (interaction.deferred && !interaction.replied)
            return interaction.editReply(options as InteractionEditReplyOptions);
        if (interaction.isButton?.() || interaction.isStringSelectMenu?.()) {
            if (interaction.replied || interaction.deferred)
                return interaction.followUp(options as unknown as InteractionReplyOptions);
            return interaction.reply(options as unknown as InteractionReplyOptions);
        }
        if (interaction.replied || interaction.deferred)
            return interaction.followUp(options as unknown as InteractionReplyOptions);
        return interaction.reply(options as unknown as InteractionReplyOptions);
    };
    /**
     * Edit last reply or interaction response.
     */
    const editReply = async (options: EditReplyOptions) => {
        if (interaction) return interaction.editReply(options as unknown as InteractionEditReplyOptions);
        if (state.storedReply) return state.storedReply.edit(options as unknown as MessageEditOptions);
        throw new Error('No reply available to edit');
    };
    /**
     * Send follow-up message.
     */
    const followUp = async (options: ReplyOptions) => {
        return reply(options);
        throw new Error('No interaction or message available');
    };
    /**
     * Defer interaction response.
     */
    const defer = async (flags: MessageFlags | number = MessageFlags.Ephemeral) => {
        if (!interaction || interaction.deferred || interaction.replied) return;
        state.private = Boolean(flags & 64);
        return interaction.deferReply({ flags });
    };
    /**
     * Send message to current channel.
     */
    const send = async (options: ReplyOptions) => {
        if (!ctx.channel || !('send' in ctx.channel)) throw new Error('Channel is not text-based');
        return ctx.channel.send(options);
    };
    /**
     * Edit message or interaction response.
     */
    const edit = async (options: EditReplyOptions) => {
        if (!interaction) {
            if (state.storedReply) return state.storedReply.edit(options as unknown as MessageEditOptions);
            throw new Error('No interaction or stored message to edit');
        }
        if (interaction.deferred && !interaction.replied)
            return interaction.editReply(options as InteractionEditReplyOptions);
        if (interaction.isButton?.() || interaction.isStringSelectMenu?.()) {
            if (interaction.deferred)
                return interaction.editReply(options as unknown as InteractionEditReplyOptions);
            return interaction.update(options as unknown as InteractionEditReplyOptions);
        }
        if (interaction.replied || interaction.deferred)
            return interaction.editReply(options as unknown as InteractionEditReplyOptions);

        return interaction.reply(options as unknown as InteractionReplyOptions);
    };

    /**
     * Send embed reply using unified embed builder.
     */
    const replyEmbed = async (args: EmbedReplyOptions) => {
        const embed = createEmbed({
            title: args.title,
            desc: args.desc,
            footer: args.footer,
            ...args.embed,
        });
        const payload = createEmbedPayload({
            embed,
            thumbnail: args.thumbnail,
            image: args.image,
            footerIcon: args.footerIcon,
            client: ctx.client,
            interaction,
            message,
        });

        return reply({
            ...payload,
            components: args.components as unknown as InteractionReplyOptions['components'],
            files: args.files,
            flags: args.flags,
            allowedMentions: args.allowedMentions,
        });
    };
    /**
     * Edit embed response.
     */
    const editEmbed = async (args: EmbedReplyOptions) => {
        const embed = createEmbed({
            title: args.title,
            desc: args.desc,
            footer: args.footer,
            ...args.embed,
        });
        const payload = createEmbedPayload({
            embed,
            thumbnail: args.thumbnail,
            image: args.image,
            footerIcon: args.footerIcon,
            client: ctx.client,
            interaction,
            message,
        });

        return edit({
            ...payload,
            components: args.components as unknown as InteractionEditReplyOptions['components'],
            files: args.files,
            flags: args.flags,
            allowedMentions: args.allowedMentions,
        });
    };

    return {
        reply,
        editReply,
        followUp,
        defer,
        send,
        edit,

        replyEmbed,
        editEmbed,

        success: (o: EmbedReplyOptions) =>
            replyEmbed({
                ...o,
                embed: { ...o.embed, color: Colors.success },
            }),
        error: (o: EmbedReplyOptions) =>
            replyEmbed({
                ...o,
                embed: { ...o.embed, color: Colors.error },
            }),
        warn: (o: EmbedReplyOptions) =>
            replyEmbed({
                ...o,
                embed: { ...o.embed, color: Colors.warning },
            }),
        danger: (o: EmbedReplyOptions) =>
            replyEmbed({
                ...o,
                embed: { ...o.embed, color: Colors.danger },
            }),

        info: (o: EmbedReplyOptions) =>
            replyEmbed({
                ...o,
                embed: { ...o.embed, color: Colors.neutral },
            }),
    };
}

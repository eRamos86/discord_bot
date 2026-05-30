import { MessageFlags } from 'discord.js';
import {
    createEmbed,
    createEmbedPayload
} from "../embed/index.js";

import { Colors } from "../../config/theme.js";

import type { AnyInteraction, BaseContext, CtxState } from "./context.types.js";

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
export function createReplies(
    ctx: BaseContext & { state: CtxState }
) {

    const interaction = ctx.interaction as AnyInteraction | undefined;
    const message = ctx.message;
    const state = ctx.state;

    /**
     * Unified reply handler for both interactions and messages.
     */
    const reply = async (options: any) => {
        if (!interaction) {
            if (message) {
                state.storedReply = await message.reply(options);
                return state.storedReply;
            }
            throw new Error("No interaction or message available");
        }
        if (interaction.isButton?.() || interaction.isStringSelectMenu?.()) {
            if (interaction.replied || interaction.deferred) return interaction.followUp(options);
            return interaction.reply(options);
        }
        if (interaction.replied || interaction.deferred) return interaction.followUp(options);
        return interaction.reply(options);
    };
    /**
     * Edit last reply or interaction response.
     */
    const editReply = async (options: any) => {
        if (interaction) return interaction.editReply(options);
        if (state.storedReply) return state.storedReply.edit(options);
        throw new Error("No reply available to edit");
    };
    /**
     * Send follow-up message.
     */
    const followUp = async (options: any) => {
        if (interaction) return interaction.followUp(options);
        if (message) return message.reply(options);
        throw new Error("No interaction or message available");
    };
    /**
     * Defer interaction response.
     */
    const defer = async (flags: MessageFlags | number = MessageFlags.Ephemeral) => {
        if (!interaction) return;
        return interaction.deferReply({flags});
    }
    /**
     * Send message to current channel.
     */
    const send = async (options: any) => {
        if (!ctx.channel || !("send" in ctx.channel)) throw new Error("Channel is not text-based");
        return ctx.channel.send(options);
    };
    /**
     * Edit message or interaction response.
     */
    const edit = async (options: any) => {

        if (!interaction) {
            if (state.storedReply) return state.storedReply.edit(options);
            throw new Error("No interaction or stored message to edit");
        }
        if (interaction.isButton?.() || interaction.isStringSelectMenu?.()) {
            if (interaction.deferred) return interaction.editReply(options);
            return interaction.update(options);
        }
        if (interaction.replied || interaction.deferred) return interaction.editReply(options);

        return interaction.reply(options);

    };

    /**
     * Send embed reply using unified embed builder.
     */
    const replyEmbed = async (args: any) => {

        const embed = createEmbed(args.embed);
        const payload = createEmbedPayload({
            embed,
            thumbnail: args.thumbnail,
            image: args.image,
            footerIcon: args.footerIcon,
            client: ctx.client,
            interaction,
            message
        });

        return reply({
            ...payload,
            components: args.components,
            files: args.files,
            flags: args.flags,
            allowedMentions: args.allowedMentions
        });

    };
    /**
     * Edit embed response.
     */
    const editEmbed = async (args: any) => {

        const embed = createEmbed(args.embed);
        const payload = createEmbedPayload({
            embed,
            thumbnail: args.thumbnail,
            image: args.image,
            footerIcon: args.footerIcon,
            client: ctx.client,
            interaction,
            message
        });

        return edit({
            ...payload,
            components: args.components,
            files: args.files,
            flags: args.flags,
            allowedMentions: args.allowedMentions
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

        success: (o: any) => replyEmbed({
            ...o,
            embed: { ...o.embed, color: Colors.success }
        }),
        error: (o: any) => replyEmbed({
            ...o,
            embed: { ...o.embed, color: Colors.error }
        }),
        warn: (o: any) => replyEmbed({
            ...o,
            embed: { ...o.embed, color: Colors.warning }
        }),
        danger: (o: any) => replyEmbed({
            ...o,
            embed: { ...o.embed, color: Colors.danger }
        }),

        info: (o: any) => replyEmbed({
            ...o,
            embed: { ...o.embed, color: Colors.neutral }
        })

    };
}
import {
    ChatInputCommandInteraction,
    ButtonInteraction,
    StringSelectMenuInteraction,
    Message,
    MessageCreateOptions,
    MessageEditOptions,
    MessagePayload,
    InteractionReplyOptions,
    InteractionEditReplyOptions,
    TextBasedChannel,
    User,
    Role,
    Guild,
    GuildMember,
    ActionRowBuilder,
    MessageMentionOptions,
    MessageFlags
} from "discord.js";

import { EmbedOptions } from "./embed.types.js";
import { MediaConfig } from './media.types.js';
import { BotClient } from "../core/client/client.js";

/**
 * Unified interaction type
 */
export type AnyInteraction =
    | ChatInputCommandInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction;

export type ReplyOptions =
    | string
    | MessagePayload
    | InteractionReplyOptions
    | MessageCreateOptions;

export type EditReplyOptions =
    | string
    | InteractionEditReplyOptions
    | MessageEditOptions;

export type EmbedReplyOptions = {
    embed: EmbedOptions;
    thumbnail?: MediaConfig;
    image?: MediaConfig;
    footerIcon?: MediaConfig;

    components?: ActionRowBuilder<any>[];
    files?: MessageCreateOptions["files"];
    flags?: MessageFlags | number;
    allowedMentions?: MessageMentionOptions;
};

export type ChannelCtx = {
    delete: (amount: number) => Promise<any>;
    send: (options: ReplyOptions) => Promise<any>;
};

/**
 * BASE CONTEXT
 *
 * Raw runtime data only.
 * No helper methods, no computed functions.
 *
 * This is the foundation layer used to build CommandContext.
 */
export type BaseContext = {
    client: BotClient;

    interaction?: AnyInteraction;
    message?: Message;

    args: Record<string, any>;

    user: User;
    guild: Guild | null;
    guildMember: GuildMember | null;
    member: GuildMember | null;

    channel: ChannelCtx;
};

/**
 * Mutable reply state shared across lifecycle.
 */
export type CtxState = {storedReply: Message | null;};

/**
 * FINAL COMMAND CONTEXT
 *
 * Fully composed runtime object used inside commands.
 *
 * Built from BaseContext + getters + reply system.
 */
export type CommandContext = BaseContext & {

    getUser: (name: string) => Promise<User | null>;
    getMember: (name: string) => Promise<GuildMember | null>;
    getRole: (name: string) => Promise<Role | null>;
    getChannel: (name: string) => Promise<TextBasedChannel | null>;

    getString: (name: string) => string | null;
    getNumber: (name: string) => number | null;
    getBoolean: (name: string) => boolean | null;

    reply: (options: ReplyOptions) => Promise<any>;
    editReply: (options: EditReplyOptions) => Promise<any>;
    followUp: (options: ReplyOptions) => Promise<any>;
    defer: (flags?: MessageFlags | number) => Promise<any>;
    send: (options: ReplyOptions) => Promise<any>;
    edit: (options: EditReplyOptions) => Promise<any>;

    editEmbed: (options: EmbedReplyOptions) => Promise<any>;

    replyEmbed: (options: EmbedReplyOptions) => Promise<any>;
    success: (options: EmbedReplyOptions) => Promise<any>;
    error: (options: EmbedReplyOptions) => Promise<any>;
    warn: (options: EmbedReplyOptions) => Promise<any>;
    info: (options: EmbedReplyOptions) => Promise<any>;
    
};
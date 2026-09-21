import {
    ActionRowBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    Message,
    MessageContextMenuCommandInteraction,
    MessageCreateOptions,
    MessageEditOptions,
    MessageFlags,
    MessageMentionOptions,
    MessagePayload,
    ModalSubmitInteraction,
    Role,
    StringSelectMenuInteraction,
    TextBasedChannel,
    User,
    UserContextMenuCommandInteraction,
} from 'discord.js';

import { BotClient } from '@framework';
import { EmbedOptions, MediaConfig } from '../embed/index.js';

/**
 * Unified interaction type
 */
export type AnyInteraction =
    | ModalSubmitInteraction
    | UserContextMenuCommandInteraction
    | MessageContextMenuCommandInteraction
    | ChatInputCommandInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction;

export type ReplyOptions = string | MessagePayload | InteractionReplyOptions | MessageCreateOptions;

export type EditReplyOptions = string | InteractionEditReplyOptions | MessageEditOptions;

export type EmbedReplyOptions = {
    [key: string]: unknown;
    embed?: EmbedOptions;
    title?: string;
    desc?: string;
    footer?: string;
    thumbnail?: MediaConfig;
    image?: MediaConfig;
    footerIcon?: MediaConfig;

    components?: ActionRowBuilder[];
    files?: MessageCreateOptions['files'];
    flags?: MessageFlags | number;
    allowedMentions?: MessageMentionOptions;
};

export type ChannelCtx = {
    raw: TextBasedChannel | null;
    delete: (amount: number) => Promise<unknown>;
    send: (options: ReplyOptions) => Promise<unknown>;
};

/**
 * BASE CONTEXT
 *
 * Raw runtime data only.
 * No helper methods, no computed functions.
 *
 * This is the foundation layer used to build CommandContext.
 */
export type ArgsAccessor = ((name: string) => unknown) &
    Record<string, unknown> & {
        raw: string[];
        getString: (name: string) => string | null;
        getNumber: (name: string) => number | null;
        getBoolean: (name: string) => boolean | null;
    };

export type BaseContext = {
    client: BotClient;
    settings?: import('../../database/guilds/settings.types.js').GuildSettings;
    identity?: { id: string; project: string; role: string; token: string };
    requestId?: string;

    interaction?: AnyInteraction;
    message?: Message;

    createdTimestamp: number;

    args: ArgsAccessor;

    user: User;
    guild: Guild | null;
    guildMember: GuildMember | null;
    member: GuildMember | null;

    channel: ChannelCtx;
};

/**
 * Mutable reply state shared across lifecycle.
 */
export type CtxState = { storedReply: Message | null; private?: boolean };

/**
 * FINAL COMMAND CONTEXT
 *
 * Fully composed runtime object used inside commands.
 *
 * Built from BaseContext + getters + reply system.
 */
export type CommandContext = BaseContext & {
    isInteraction: boolean;

    getUser: (name: string) => Promise<User | null>;
    getMember: (name: string) => Promise<GuildMember | null>;
    getRole: (name: string) => Promise<Role | null>;
    getChannel: (name: string) => Promise<TextBasedChannel | null>;

    getString: (name: string) => string | null;
    getNumber: (name: string) => number | null;
    getBoolean: (name: string) => boolean | null;

    reply: (options: ReplyOptions) => Promise<unknown>;
    editReply: (options: EditReplyOptions) => Promise<unknown>;
    followUp: (options: ReplyOptions) => Promise<unknown>;
    defer: (flags?: MessageFlags | number) => Promise<unknown>;
    deferReply: (flags?: MessageFlags | number) => Promise<unknown>;
    send: (options: ReplyOptions) => Promise<unknown>;
    edit: (options: EditReplyOptions) => Promise<unknown>;

    replyEmbed: (options: EmbedReplyOptions) => Promise<unknown>;
    editEmbed: (options: EmbedReplyOptions) => Promise<unknown>;

    success: (options: EmbedReplyOptions) => Promise<unknown>;
    error: (options: EmbedReplyOptions) => Promise<unknown>;
    warn: (options: EmbedReplyOptions) => Promise<unknown>;
    danger: (options: EmbedReplyOptions) => Promise<unknown>;

    info: (options: EmbedReplyOptions) => Promise<unknown>;
};

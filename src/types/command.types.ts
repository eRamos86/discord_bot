import { AutocompleteInteraction } from 'discord.js';

import { CommandContext, PermissionLevel } from '@framework';

/**
 * Standard command definition used by the command handler system.
 *
 * Every command in the bot must conform to this interface,
 * ensuring consistent behavior across:
 * - slash commands
 * - prefix commands
 * - help system integration
 */
export type AccessPolicy = {
    guildOnly?: boolean;
    ownerOnly?: boolean;
    discord?: bigint[];
    bot?: bigint[];
    nova?: { project: string; roles?: string[] };
    private?: boolean;
};
export type Command = {
    responseVisibility?: 'public' | 'private';
    access?: AccessPolicy;
    cooldownSeconds?: number;
    name?: string;
    desc?: string;
    args?: Record<string, ArgumentDefinition>;
    subcommands?: Record<string, SubcommandDefinition>;

    /**
     * Prefix command configuration (optional).
     *
     * If enabled, this command can be triggered via message prefix.
     */
    prefix?: {
        enabled: boolean;
        aliases?: string[];
    };

    /**
     * Internal command aliases used for resolution and lookup.
     */
    aliases?: string[];

    /**
     * Minimum permission level required to execute this command.
     */
    requiredLevel?: PermissionLevel | PermissionLevel.PUBLIC;

    /**
     * Help menu metadata shown in help commands/UI.
     */
    help?: {
        usage: string;
        example: string;
    };

    /**
     * autocomplete or something
     */
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<unknown>;

    /**
     * Slash command definition registered with Discord.
     */
    data?: CommandData;

    /**
     * Command execution handler.
     *
     * Runs when the command is triggered via slash or prefix.
     */
    execute: (ctx: CommandContext) => Promise<unknown>;
};

export type CommandData = {
    name: string;
    toJSON: () => unknown;
    options?: readonly unknown[];
};

export type ArgumentType = 'string' | 'integer' | 'number' | 'boolean' | 'user' | 'role' | 'channel';
export type ArgumentDefinition = {
    type: ArgumentType;
    required?: boolean;
    description?: string;
    autocomplete?: boolean;
    choices?: readonly ArgumentChoice[];
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
};

export type ArgumentChoice = {
    name: string;
    value: string | number;
};

export type SubcommandDefinition = {
    description?: string;
    args?: Record<string, ArgumentDefinition>;
};

/**
 * Parsed arguments after conversion from raw prefix input.
 *
 * Keys are option names from the command definition.
 * Values are converted into Discord.js objects or primitives.
 */
export type ParsedArgs = Record<string, unknown>;

/**
 * Normalized command shape used by the help system.
 *
 * This is a simplified view of runtime commands
 * used only for UI rendering and navigation.
 */
export type LoadedCommand = {
    name: string;
    description: string;
    category: string;
    subcategory: string;
    requiredLevel: PermissionLevel;
    help?: {
        usage?: string;
        example?: string;
    };
};

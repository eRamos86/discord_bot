import { SlashCommandBuilder, AutocompleteInteraction } from 'discord.js';

import { PermissionLevel } from "../core/guards/guards.js";
import type { CommandContext } from './context.types.js';

/**
 * Standard command definition used by the command handler system.
 *
 * Every command in the bot must conform to this interface,
 * ensuring consistent behavior across:
 * - slash commands
 * - prefix commands
 * - help system integration
 */
export type Command = {

    /**
     * Prefix command configuration (optional).
     *
     * If enabled, this command can be triggered via message prefix.
     */
    prefix?: {
        enabled: boolean;
        aliases?: string[];
    } | {
        enabled: true,
        aliases: []
    };

    /**
     * Internal command aliases used for resolution and lookup.
     */
    aliases?: string[];

    /**
     * Minimum permission level required to execute this command.
     */
    requiredLevel: PermissionLevel;

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
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<any>;

    /**
     * Slash command definition registered with Discord.
     */
    data: SlashCommandBuilder | any;

    /**
     * Command execution handler.
     *
     * Runs when the command is triggered via slash or prefix.
     */
    execute: (ctx: CommandContext) => Promise<any>;
};

/**
 * Parsed arguments after conversion from raw prefix input.
 *
 * Keys are option names from the command definition.
 * Values are converted into Discord.js objects or primitives.
 */
export type ParsedArgs = Record<string, any>;

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
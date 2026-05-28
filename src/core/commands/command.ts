/**
 * Core command contract used across the bot.
 *
 * This defines a unified structure for both slash and prefix commands,
 * allowing them to share a single execution pipeline.
 *
 * Commands are loaded dynamically and registered into a central
 * collection at runtime.
 */
import { SlashCommandBuilder } from 'discord.js';
import { PermissionLevel } from '../guards/guards.js';
import type * as AceTypes from '../../types/index.js';

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
    } | true;

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
     * Slash command definition registered with Discord.
     */
    data: SlashCommandBuilder | any;

    /**
     * Command execution handler.
     *
     * Runs when the command is triggered via slash or prefix.
     */
    execute: (ctx: AceTypes.CommandContext) => Promise<any>;
};
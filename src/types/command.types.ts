import { PermissionLevel } from "../core/guards/guards.js";

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
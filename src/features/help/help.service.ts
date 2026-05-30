import path from 'path';
import { pathToFileURL } from 'url';

import * as Utils from '@utils';

import type * as Types from '../../types/index.js';

/**
 * Scans the command directory and returns
 * flattened command metadata for the help syste.
 */
export async function getAllCommands(): Promise<Types.LoadedCommand[]> {

    const baseDir = path.join(
        process.cwd(),
        'src',
        'commands'
    );

    const commandFiles = Utils.getCommandFiles(baseDir);

    const results = await Promise.all(commandFiles.map(async file => {

        const mod = await import(pathToFileURL(file).href);
        const cmd = mod.default;

        if (!cmd || typeof cmd !== 'object') return null;

        const name = cmd.data?.name;
        const description = cmd.data?.description ?? cmd.description;
        if (!name || !description) return null;

        const relativePath = path.relative(
            path.join(
                process.cwd(),
                'src',
                'commands'
            ),
            file
        ).split(path.sep);

        const parts = relativePath.slice(0, -1); // remove filename

        return {

            name,
            description,

            category: parts[0],
            subcategory: parts[1] ?? 'general',

            requiredLevel: cmd.requiredLevel,

            help: cmd.help

        };

    }));

    return results.filter(Boolean) as Types.LoadedCommand[];

}

/**
 * Returns all unique categories.
 */
export async function getCategories() {

    const commands = await getAllCommands();

    return [
        ...new Set(
            commands.map(c => c.category)
        )
    ];

}

/** 
 * Returns all subcategories
 * inside a category
 */
export async function getSubcategories(category: string) {

    const commands = await getAllCommands();

    return [
        ...new Set(
            commands
            .filter(c => c.category === category)
            .map(c => c.subcategory)
        )
    ];

}

/**
 * Returns all commands inside
 * a category + subcategory
 */
export async function getCommands(category: string, subcategory: string) {

    const commands = await getAllCommands();

    return commands.filter(
        c => c.category === category
        && c.subcategory === subcategory
    );

}

/**
 * Result of resolving a help query.
 *
 * The help command supports several formats:
 *
 * - help
 * - help utility
 * - help utility general
 * - help ping
 *
 * Prefix commands do not have explicit argument names,
 * so this helper determines what the user intended
 * by comparing the provided input against the loaded
 * command metadata.
 */
export interface ResolvedHelpTarget {
    category?: string;
    subcategory?: string;
    command?: string;

    error?:
    | 'INVALID_CATEGORY'
    | 'INVALID_SUBCATEGORY'
    | 'INVALID_COMMAND';
}

/**
 * Resolves help targets from normalized command args.
 *
 * Slash commands already provide named arguments:
 *
 * {
 *   category: "utility"
 * }
 *
 * Prefix commands provide:
 *
 * {
 *   raw: ["utility"]
 * }
 *
 * This function converts both formats into the same
 * result object consumed by the help renderer.
 */
export function resolveHelpTarget(
    args: Record<string, any>,
    all: Types.LoadedCommand[]
): ResolvedHelpTarget {

    /**
     * PREFIX PATH
     */
    if (Array.isArray(args.raw)) {

        const raw = args.raw
            .filter(Boolean)
            .map((v: string) => v.toLowerCase());

        const first = raw[0];
        const second = raw[1];

        /**
         * help
         */
        if (!first) {
            return {};
        }

        const commandNames = new Set(
            all.map(c => c.name.toLowerCase())
        );

        const categories = new Set(
            all.map(c => c.category.toLowerCase())
        );

        const subcategories = new Set(
            all.map(c => c.subcategory.toLowerCase())
        );

        /**
         * help ping
         */
        if (commandNames.has(first)) {
            return {
                command: first
            };
        }

        /**
         * help utility
         * help utility general
         */
        if (categories.has(first)) {

            const result: ResolvedHelpTarget = {
                category: first
            };

            if (!second) {
                return result;
            }

            const validSubcategory = all.some(c =>
                c.category.toLowerCase() === first &&
                c.subcategory.toLowerCase() === second
            );

            if (!validSubcategory) {

                return {
                    category: first,
                    error: 'INVALID_SUBCATEGORY'
                };

            }

            result.subcategory = second;

            return result;
        }

        /**
         * help general
         *
         * User entered a subcategory without a category.
         */
        if (subcategories.has(first)) {

            return {
                error: 'INVALID_SUBCATEGORY'
            };

        }

        /**
         * help potato
         *
         * Try to guess intent.
         */

        const similarCommands = [...commandNames]
        .some(name =>
            name.includes(first) ||
            first.includes(name)
        );

        if (similarCommands) {

            return {
                error: 'INVALID_COMMAND'
            };

        }

        return {
            error: 'INVALID_CATEGORY'
        };

    }

    /**
     * SLASH PATH
     */
    return {
        category: args.category ?? undefined,
        subcategory: args.subcategory ?? undefined,
        command: args.command ?? undefined
    };

}
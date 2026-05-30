import path from 'path';
import { pathToFileURL } from 'url';

import { getCommandFiles } from '../../utils/command.js';

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

    const commandFiles = getCommandFiles(baseDir);

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
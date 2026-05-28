/**
 * Recursively scans the commands directory and loads all command modules.
 *
 * This function builds the runtime command registry by:
 * - Traversing category folders (level 1)
 * - Traversing subcategory folders (level 2)
 * - Dynamically importing each command file
 * - Registering valid commands into a shared Collection
 *
 * The folder structure directly determines command grouping,
 * which is later used for help menus and organization.
 *
 * Only `.ts` and `.js` files are loaded to support both
 * development and production builds.
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { Collection } from "discord.js";

import { getCommandFiles } from '../../utils/getCommandFiles.js';

/**
 * Initializes the command system.
 *
 * Creates the command collection and triggers the recursive loader.
 * This is the single entry point used during bot startup.
 *
 * @returns A fully populated command registry
 */
export async function loadCommands() {

    const commands = new Collection<string, any>();

    const commandsPath = path.join(
        process.cwd(),
        "src",
        "commands"
    );

    const commandFiles = getCommandFiles(commandsPath);

    for (const file of commandFiles) {

        const mod = await import(pathToFileURL(file).href);
        const command = mod.default;

        if (!command?.data?.name) {
            console.warn(`Invalid command file: ${file}`);
            continue;
        }

        const relativePath = path.relative(
            commandsPath,
            file
        ).split(path.sep);

        command.category = relativePath[0];
        command.subcategory = relativePath[1] ?? 'general';

        console.log(`[COMMAND LOADED] Command: '${command.data.name}'`);

        commands.set(command.data.name, command);

    }

    return commands;

}
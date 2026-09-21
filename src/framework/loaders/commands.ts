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
import { Collection } from 'discord.js';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import * as ace from '@framework';
import * as Utils from '@utils';

/**
 * Initializes the command system.
 *
 * Creates the command collection and triggers the recursive loader.
 * This is the single entry point used during bot startup.
 *
 * @returns A fully populated command registry
 */
export async function loadCommands() {
    const commands = new Collection<string, ace.Command>();

    const commandsPath = fileURLToPath(new URL('../../commands', import.meta.url));

    const commandFiles = Utils.getCommandFiles(commandsPath);

    for (const file of commandFiles) {
        const mod = await import(pathToFileURL(file).href);
        const command = ace.materializeCommand(mod.default as ace.Command);

        if (!command?.data?.name) {
            console.warn(`Invalid command file: ${file}`);
            continue;
        }

        const relativePath = path.relative(commandsPath, file).split(path.sep);

        (command as ace.Command & { category?: string; subcategory?: string }).category = relativePath[0];
        (command as ace.Command & { category?: string; subcategory?: string }).subcategory =
            relativePath.length > 2 ? relativePath[1] : 'general';

        console.log(`[COMMAND LOADED] Command: '${command.data.name}'`);

        if (commands.has(command.data.name)) throw new Error(`Duplicate command: ${command.data.name}`);
        commands.set(command.data.name, command);

        /**
         * REGISTER AUTOCOMPLETE
         */
        if (command.autocomplete) {
            ace.registerAutocomplete({
                command: command.data.name,
                execute: command.autocomplete,
            });
            console.log(`[AUTOCOMPLETE LOADED ]${command.data.name}`);
        }
    }

    return commands;
}

import { REST, Routes } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { materializeCommand } from '../framework/commands/commandSchema.js';
import { publicError, reportError, requireValue } from '../framework/runtime/errors.js';
import type { Command } from '../types/command.types.js';
import { walk } from './fs.js';
export function getCommandFiles(dir: string) {
    return walk(dir).sort();
}
export type DeployOptions = { commandName?: string; remove?: string; dryRun?: boolean };
export type DeployResult = {
    success: boolean;
    mode: 'all' | 'single';
    deployed: string[];
    skipped: string[];
    errors: string[];
    duration: number;
};
export async function collectCommandPayloads(dir = fileURLToPath(new URL('../commands', import.meta.url))) {
    const files = getCommandFiles(dir);
    requireValue(files.length > 0, 'Command catalog is empty; refusing to synchronize.');
    const names = new Set<string>();
    const body: unknown[] = [];
    for (const file of files) {
        const imported = await import(pathToFileURL(file).href);
        const command = materializeCommand(imported.default as Command);
        requireValue(!names.has(command.data.name), 'Duplicate command name.');
        names.add(command.data.name);
        body.push(command.data.toJSON());
    }
    return { names: [...names], body };
}
export interface CommandRest {
    put: (route: `/${string}`, options: { body: unknown }) => Promise<unknown>;
    post: (route: `/${string}`, options: { body: unknown }) => Promise<unknown>;
    get: (route: `/${string}`) => Promise<unknown>;
    delete: (route: `/${string}`) => Promise<unknown>;
}
export async function synchronizeCommands(
    rest: CommandRest,
    route: `/${string}`,
    catalog: { names: string[]; body: unknown[] },
    options: DeployOptions = {},
) {
    requireValue(
        catalog.body.length === catalog.names.length && catalog.body.length > 0,
        'Invalid command catalog.',
    );
    if (options.dryRun) return catalog.names;
    if (options.remove) {
        const registered = await rest.get(route);
        requireValue(Array.isArray(registered), 'Invalid Discord command list.');
        const found = registered.find(
            (v: unknown) => v && typeof v === 'object' && (v as { name?: string }).name === options.remove,
        ) as { id?: unknown } | undefined;
        requireValue(
            found && typeof found.id === 'string' && /^\d+$/.test(found.id),
            'Registered command not found.',
        );
        await rest.delete(`${route}/${found.id}`);
        return [];
    }
    if (options.commandName) {
        const index = catalog.names.indexOf(options.commandName);
        requireValue(index >= 0, 'Command not found.');
        await rest.post(route, { body: catalog.body[index] });
        return [options.commandName];
    }
    await rest.put(route, { body: catalog.body });
    return catalog.names;
}
export async function deploy(options: DeployOptions = {}): Promise<DeployResult> {
    const started = Date.now();
    const mode = options.commandName ? 'single' : 'all';
    try {
        // Collect and validate everything BEFORE touching remote registrations.
        const catalog = await collectCommandPayloads();
        if (options.dryRun)
            return {
                success: true,
                mode,
                deployed: catalog.names,
                skipped: [],
                errors: [],
                duration: Date.now() - started,
            };
        const token = process.env.DISCORD_TOKEN ?? process.env.TOKEN;
        const app = process.env.CLIENT_ID;
        const guild = process.env.DEV_GUILD;
        const global = process.env.GLOBAL_DEPLOY === 'true';
        requireValue(
            token && app && (global || guild),
            'Set DISCORD_TOKEN, CLIENT_ID, and DEV_GUILD (or GLOBAL_DEPLOY=true).',
        );
        const route = global ? Routes.applicationCommands(app) : Routes.applicationGuildCommands(app, guild!);
        const rest = new REST({ version: '10', timeout: 15000 }).setToken(token);
        const deployed = await synchronizeCommands(rest, route, catalog, options);
        return { success: true, mode, deployed, skipped: [], errors: [], duration: Date.now() - started };
    } catch (error) {
        return {
            success: false,
            mode,
            deployed: [],
            skipped: [],
            errors: [publicError(error, reportError(error, 'command_sync'))],
            duration: Date.now() - started,
        };
    }
}

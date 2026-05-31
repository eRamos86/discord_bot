import fs from "fs";
import path from "path";
import {
    REST,
    Routes
} from 'discord.js';

import { pathToFileURL } from 'url';
import * as Utils from '@utils';

/**
 * Recursively collects all command file paths.
 *
 * Supports both:
 * - .ts (development)
 * - .js (production)
 */
export function getCommandFiles(dir: string): string[] {

    console.log('GETCOMMAND FILES FUNTION')
    const results: string[] = [];
    results.push(...Utils.walk(dir));

    console.log('results:', results.length);

    return results;

}

export type DeployResult = {
    success: boolean;
    mode: 'all' | 'single';
    deployed: string[];
    skipped: string[];
    errors: string[];
    duration: number;
};

export type DeployOptions = {
    commandName?: string;
};

/**
 * Deploy slash commands to the dev guild.
 * 
 * MODES:
 * - Full deploy (all commands)
 * - Single-command deploy
 */
export async function deploy(options: DeployOptions = {}): Promise<DeployResult> {

    const started = Date.now();
    const rest = new REST({version: '10'}).setToken(process.env.DISCORD_TOKEN!);
    const commandsPath = path.join(
        process.cwd(),
        'src',
        'commands'
    );

    const files = getCommandFiles(commandsPath);

    const deployed: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    const target = options.commandName?.toLowerCase();

    /**
     * FULL DEPLOY
     */
    if (!target) {

        const body: any[] = [];

        for (const file of files) {

            try {

                const imported = await import(`${pathToFileURL(file).href}?update=${Date.now()}`);
                const command = imported.default;

                if (!command?.data) {
                    skipped.push(file);
                    continue;
                }

                body.push(command.data.toJSON());
                deployed.push(command.data.name);

            } catch (err) {

                console.error(err);
                errors.push(`Failed importing: ${file}`);

            }

        }

        try {

            await rest.put(Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                process.env.DEV_GUILD!
            ), {body});

            return {
                success: true,
                mode: 'all',
                deployed,
                skipped,
                errors,
                duration: Date.now() - started
            };

        } catch (err) {

            console.error(err);
            errors.push("Discord bulk deployment failed");

            return {
                success: false,
                mode: 'all',
                deployed,
                skipped,
                errors,
                duration: Date.now() - started
            };

        }

    }

    /**
     * SINGLE COMMAND DEPLOY
     */
    for (const file of files) {

        try {

            const imported = await import(`${pathToFileURL(file).href}?update=${Date.now()}`);

            const command = imported.default;

            if (!command?.data) continue;

            const name = command.data.name.toLowerCase();

            if (name !== target) continue;

            await rest.post(Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                process.env.DEV_GUILD!
            ), {body: command.data.toJSON()});

            deployed.push(command.data.name);

            return {
                success: true,
                mode: 'single',
                deployed,
                skipped,
                errors,
                duration: Date.now() - started
            };

        } catch (err) {

            console.error(err);
            errors.push(`Failed deploying command from: ${file}`);

        }

    }

    errors.push(`Command not found: ${target}`);

    return {

        success: false,
        mode: 'single',
        deployed,
        skipped,
        errors,
        duration: Date.now() - started

    };

}
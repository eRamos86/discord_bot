import * as dis from 'discord.js';
import * as url from 'url';
import fs from 'fs';
import path from 'path';
import * as ace from '@framework';
import dotenv from 'dotenv';

// pre
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

//#region CLIENT INITIALIZATION

    /**
     * Main discord client instance.
     * 
     * configured with required gateway intents for:
     * - Guild access
     * - Member caching (permissions, roles, etc)
     * - Message content
     */
    console.log('Initializing Discord bot client...');

    const client = new dis.Client({intents: [
        dis.GatewayIntentBits.Guilds,
        dis.GatewayIntentBits.GuildMembers,
        dis.GatewayIntentBits.GuildMessages,
        dis.GatewayIntentBits.MessageContent,
    ]});

//#endregion

//#region COMMAND LOADING

    /**
     * Loads all commands from the command directory and attaches
     * them to the client for runtime access
     */
    (client as ace.BotClient).commands = await ace.loadCommands();

//#endregion

//#region FEATURES REGISTRATION

    /**
     * Importing features automatically
     * registers routs into registries. 
     */
    await import('@features');

//#endregion

//#region EVENT LOADING

    /**
     * Dynamicall loads all event handlers from the events directory.
     * 
     * supports both:
     * - .ts
     * - .js
     * 
     * Each event file must export:
     * - name: Discord event name
     * - execute: handler function
     * - once?: whether to use client.once instead of client.on
     */
    //MAKE THIS A LOADER IN CORE/LOADERS

    const eventsPath = path.join(__dirname, "events");

    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {

        const filePath = path.join(eventsPath, file);
        const event = await import(url.pathToFileURL(filePath).href);

        const eventName = event.default.name;
        const execute = event.default.execute;

        if (!eventName || !execute) {
            console.warn(`Invalid event file: ${file}`);
            continue;
        }

        // Automatically bind client to all events
        if (event.default.once) {
            client.once(eventName, (...args) =>
                execute(...args, client)
            );
        } else {
            client.on(eventName, (...args) =>
                execute(...args, client)
            );
        }
    }

//#endregion

//#region ERROR HANDLING

    /**
     * Prevent Discord.js client errors
     * from crashing the process.
     */
    client.on("error", (error) => {
        console.error("[DISCORD CLIENT ERROR]");
        console.error(error);
    });

    /**
     * Websocket / shard errors.
     */
    client.on("shardError", (error) => {
        console.error("[SHARD ERROR]");
        console.error(error);
    });

    /**
     * Node promise safety.
     */
    process.on("unhandledRejection", (reason) => {
        console.error("[UNHANDLED REJECTION]");
        console.error(reason);
    });

    process.on("uncaughtException", (error) => {
        console.error("[UNCAUGHT EXCEPTION]");
        console.error(error);
    });

//#endregion

/**
 * BOT LOGIN
 * 
 * Logs the bot into Discord using the provided token
 * from environment variables.
 */
client.login(client.token!);
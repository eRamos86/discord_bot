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
    console.log('loading commands...');
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

    
    //MAKE THIS A LOADER IN CORE/LOADERS
    ace.loadEvents(client);

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
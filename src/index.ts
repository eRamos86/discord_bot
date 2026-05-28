import {
    Client,
    GatewayIntentBits
} from "discord.js";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import {
    fileURLToPath,
    pathToFileURL
} from "url";

import { loadCommands } from "./core/client/loadCommands.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/* ---------------------------------------- */
/* CLIENT INITIALIZATION                   */
/* ---------------------------------------- */

/**
 * Main Discord client instance.
 *
 * Configured with required gateway intents for:
 * - Guild access
 * - Member caching (permissions, roles, etc.)
 * - Message content (prefix commands support)
 */
const client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,

    // REQUIRED for prefix-based command parsing
    GatewayIntentBits.MessageContent
]});

/* ---------------------------------------- */
/* COMMAND LOADING                         */
/* ---------------------------------------- */

console.log(
    `\n--------------------------\n` +
    `-----LOADING COMMANDS-----\n` +
    `--------------------------\n`
);

/**
 * Loads all commands from the command directory and attaches
 * them to the client for runtime access.
 */
(client as any).commands = await loadCommands();

/* ---------------------------------------- */
/* EVENT LOADING                           */
/* ---------------------------------------- */

/**
 * Dynamically loads all event handlers from the events directory.
 *
 * Supports both:
 * - .ts (dev)
 * - .js (compiled)
 *
 * Each event file must export:
 * - name: Discord event name
 * - execute: handler function
 * - once?: whether to use client.once instead of client.on
 */
const eventsPath = path.join(__dirname, "events");

const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of eventFiles) {

    const filePath = path.join(eventsPath, file);
    const event = await import(pathToFileURL(filePath).href);

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

/* ---------------------------------------- */
/* BOT LOGIN                               */
/* ---------------------------------------- */

/**
 * Logs the bot into Discord using the provided token
 * from environment variables.
 */
client.login(process.env.TOKEN);
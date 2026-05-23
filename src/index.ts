import {
    Client,
    Collection,
    GatewayIntentBits
} from "discord.js";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import {
    fileURLToPath,
    pathToFileURL
} from "url";

import { loadCommands } from "./core/loadCommands.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

(client as any).commands = await loadCommands();

const eventsPath = path.join(__dirname, "events");

const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith(".ts"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);

    const event = await import(
        pathToFileURL(filePath).href
    );

    if (event.default.once) {
        client.once(event.default.name, (...args) =>
            event.default.execute(...args, client)
        );
    } else {
        client.on(event.default.name, (...args) =>
            event.default.execute(...args, client)
        );
    }
}

client.login(process.env.TOKEN);
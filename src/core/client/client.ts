/**
 * Custom Discord.js client type used by the bot.
 *
 * Extends the base Client to include runtime properties
 * that are attached after initialization.
 *
 * In particular, this adds a `commands` collection,
 * which acts as the global registry for all loaded commands.
 *
 * This allows the client instance to be used as a central
 * access point for bot systems (commands, handlers, etc.)
 * without relying on separate global state.
 */
import {
    Client,
    Collection
} from "discord.js";

import { Command } from "../commands/command.js";

export interface BotClient extends Client {
    /** Runtime-loaded command registry */
    commands: Collection<string, Command>;
}
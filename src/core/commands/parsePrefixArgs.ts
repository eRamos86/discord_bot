import {
    ApplicationCommandOptionType,
    Guild,
    User,
    Role,
    TextBasedChannel
} from "discord.js";

import { BotClient } from "../client/client.js";

import type * as Types from "../../types/index.js";


/**
 * Converts raw prefix command arguments into typed values
 * based on the command's slash-style option definitions.
 *
 * This allows prefix commands to reuse Discord's option system
 * (String, Integer, User, Role, Channel, Boolean, etc.)
 * instead of manually parsing everything per command.
 *
 * The parser attempts to mirror Discord interaction behavior
 * as closely as possible.
 */
export async function parsePrefixArgs(
    command: Types.Command,
    raw: string[],
    client: BotClient,
    guild: Guild | null
): Promise<Types.ParsedArgs> {

    /**
     * Base parsed argument container.
     *
     * Starts as a direct reference to raw input,
     * then gets progressively replaced with typed values.
     */
    const parsed: Types.ParsedArgs = raw;

    /**
     * Command option definitions (from slash command builder).
     *
     * These are used as the schema for parsing prefix input.
     */
    const options = command.data?.options ?? [];

    for (let i = 0; i < options.length; i++) {

        const option = options[i];
        const value = raw[i];

        if (!value) continue;

        switch (option.type) {

            /**
             * STRING OPTION
             *
             * Consumes all remaining input as a single string.
             * This matches Discord behavior for greedy string arguments.
             */
            case ApplicationCommandOptionType.String: {

                // last string consumes rest of input
                const remaining = raw.slice(i).join(" ");

                parsed[option.name] = remaining;
                return parsed;

            }

            /**
             * INTEGER OPTION
             *
             * Attempts numeric conversion from string input.
             */
            case ApplicationCommandOptionType.Integer: {

                const num = Number(value);
                if (!isNaN(num)) parsed[option.name] = num;
                break;

            }

            /**
             * BOOLEAN OPTION
             *
             * Supports common truthy values:
             * true, yes, y, 1, on
             */
            case ApplicationCommandOptionType.Boolean: {

                const lower = value.toLowerCase();

                parsed[option.name] = [
                    "true",
                    "yes",
                    "y",
                    "1",
                    "on"
                ].includes(lower);

                break;

            }

            /**
             * USER OPTION
             *
             * Parses Discord mentions or raw IDs
             * and resolves them via the API.
             */
            case ApplicationCommandOptionType.User: {

                const id = value.replace(/[<@!>]/g, "");

                try {
                    const user = await client.users.fetch(id);
                    parsed[option.name] = user;
                } catch {}

                break;

            }

            /**
             * ROLE OPTION
             *
             * Resolves role from guild cache using ID.
             * Requires guild context.
             */
            case ApplicationCommandOptionType.Role: {

                if (!guild) break;

                const id = value.replace(/[<@&>]/g, "");
                const role = guild.roles.cache.get(id);

                if (role) parsed[option.name] = role;

                break;

            }

            /**
             * CHANNEL OPTION
             *
             * Resolves guild channel and ensures it is text-capable.
             */
            case ApplicationCommandOptionType.Channel: {

                if (!guild) break;

                const id = value.replace(/[<#>]/g, "");
                const channel = guild.channels.cache.get(id);

                if (channel && "send" in channel) parsed[option.name] = channel;

                break;

            }

        }

    }

    return parsed;
}
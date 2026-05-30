import {
    User,
    Role,
    Guild,
    Message,
    ApplicationCommandOptionType,
    TextBasedChannel
} from 'discord.js';

import { canRun } from "../guards/guards.js";
import {
    createContext,
    BotClient,
    AnyInteraction
} from '@framework';

import * as Types from '@types';



/**
 * Core command execution pipeline.
 *
 * Handles both slash and prefix command execution through a unified flow:
 *
 * 1. Permission validation
 * 2. Argument normalization (slash vs prefix)
 * 3. Context creation
 * 4. Command execution
 *
 * This function acts as the central entry point for all command handling,
 * ensuring both command types share the same execution lifecycle.
 */
export async function handleCommand(
    interaction: AnyInteraction | undefined,
    command: Types.Command,
    client: BotClient,
    args: Record<string, any> = {},
    message?: Message
) {

    // Debug: track command execution
    console.log(`Running command: ${command.data.name}`);

    // Normalize prefix command arguments into structured format
    let normalizedArgs = args;
    if (!interaction && message) {
       
        normalizedArgs = {

            raw: args.raw ?? [],

            ...(await parsePrefixArgs(
                command,
                args.raw ?? [],
                client,
                message.guild
            ))

        };

    }
    

    // Extract options from slash command interaction
    else if (interaction?.isChatInputCommand()) {

        normalizedArgs = {};
        for (const option of interaction.options.data) normalizedArgs[option.name] = option.value;

    }

    // Build unified command context for execution
    const ctx = await createContext({
        interaction,
        message,
        client,
        args: normalizedArgs
    });

    // Prevent unauthorized command execution
    if (!canRun(interaction, message, command)) {
        return ctx.warn({
            embed: {
                title: `You don't have permission to use this command.`
            }
        });
    }

    // Execute resolved command handler with unified context
    return command.execute(ctx);
}



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
    const parsed: Types.ParsedArgs = {};
    parsed.raw = [...raw];

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

        for (const option of command.data.options) {
            console.log(option.name, option.type);
        }

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
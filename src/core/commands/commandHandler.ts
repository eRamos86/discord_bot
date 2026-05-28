import { Message } from "discord.js";

import { Command } from "./command.js";
import { canRun } from "../guards/guards.js";
import { createContext } from "../context/createContext.js";
import { BotClient } from "../client/client.js";

import { parsePrefixArgs } from "./parsePrefixArgs.js";

import type * as AceTypes from "../../types/index.js";

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
    interaction: AceTypes.AnyInteraction | undefined,
    command: Command,
    client: BotClient,
    args: Record<string, any> = {},
    message?: Message
) {

    // Prevent unauthorized command execution
    if (!canRun(interaction, message, command)) {
        return interaction
            ? interaction.reply({
                content: "You don't have permission to use this command.",
                flags: 64
            })
            : message?.reply(
                "You don't have permission to use this command."
            );
    }

    // Debug: track command execution
    console.log(`Running command: ${command.data.name}`);

    
    let normalizedArgs = args;

    // Normalize prefix command arguments into structured format
    if (!interaction && message) {

        /*
        normalizedArgs = await parsePrefixArgs(
            command,
            args.raw ?? [],
            client,
            message.guild
        );
        */
       
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

    // Execute resolved command handler with unified context
    return command.execute(ctx);
}
import { logEvent } from '../../features/logging/service.js';
import { ApplicationCommandOptionType, Guild, Message } from 'discord.js';
import { randomUUID } from 'node:crypto';
import { getOwnerIds } from '../../config/owners.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import { validateArguments } from '../commands/validateArgs.js';
import { authorizeLocal, Cooldowns } from '../guards/authorize.js';
import { BotError, publicError, reportError } from '../runtime/errors.js';
import { runtime } from '../runtime/state.js';
const cooldowns = new Cooldowns();

import { AnyInteraction, BotClient, createContext } from '@framework';

import * as Types from '@types';
import { argumentOptions } from '../commands/commandSchema.js';

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
    args: Record<string, unknown> = {},
    message?: Message,
) {
    if (interaction?.isChatInputCommand() && !interaction.deferred && !interaction.replied) {
        await interaction.deferReply({
            flags: command.responseVisibility === 'public' && !command.access?.private ? undefined : 64,
        });
    }

    // Debug: track command execution
    console.log(`Running command: ${command.data?.name ?? command.name}`);

    // Normalize prefix command arguments into structured format
    let normalizedArgs = args;
    if (!interaction && message) {
        normalizedArgs = {
            raw: Array.isArray(args.raw)
                ? args.raw.filter((value): value is string => typeof value === 'string')
                : [],

            ...(await parsePrefixArgs(
                command,
                Array.isArray(args.raw)
                    ? args.raw.filter((value): value is string => typeof value === 'string')
                    : [],
                client,
                message.guild,
            )),
        };
    }

    // Extract options from slash command interaction
    else if (interaction?.isChatInputCommand()) {
        normalizedArgs = {};
        const options = interaction.options.data.flatMap((option) => {
            if (option.type !== ApplicationCommandOptionType.Subcommand) return [option];
            normalizedArgs.subcommand = option.name;
            return option.options ?? [];
        });
        for (const option of options) {
            switch (option.type) {
                case ApplicationCommandOptionType.User:
                    normalizedArgs[option.name] = interaction.options.getUser(option.name) ?? undefined;
                    break;
                case ApplicationCommandOptionType.Role:
                    normalizedArgs[option.name] = interaction.options.getRole(option.name) ?? undefined;
                    break;
                case ApplicationCommandOptionType.Channel:
                    normalizedArgs[option.name] = interaction.options.getChannel(option.name) ?? undefined;
                    break;
                case ApplicationCommandOptionType.String:
                    normalizedArgs[option.name] = interaction.options.getString(option.name) ?? undefined;
                    break;
                case ApplicationCommandOptionType.Integer:
                    normalizedArgs[option.name] = interaction.options.getInteger(option.name) ?? undefined;
                    break;
                case ApplicationCommandOptionType.Number:
                    normalizedArgs[option.name] = interaction.options.getNumber(option.name) ?? undefined;
                    break;
                case ApplicationCommandOptionType.Boolean:
                    normalizedArgs[option.name] = interaction.options.getBoolean(option.name) ?? undefined;
                    break;
            }
        }
    }

    // Build unified command context for execution
    const ctx = await createContext({
        interaction,
        message,
        client,
        args: normalizedArgs,
    });

    ctx.requestId = randomUUID();
    try {
        const settings = ctx.guild ? await getGuildSettings(ctx.guild.id) : null;
        if (settings) ctx.settings = settings;
        authorizeLocal(ctx, command, settings);
        if (runtime.maintenance && !getOwnerIds().includes(ctx.user.id))
            throw new BotError('unavailable', 'The bot is undergoing maintenance.');
        cooldowns.check(
            `${ctx.guild?.id ?? 'dm'}:${ctx.user.id}:${command.name}`,
            command.cooldownSeconds ?? 2,
        );
        validateArguments(command, normalizedArgs);
        if (command.access?.private) await ctx.defer(64);
        if (command.access?.private && command.access?.nova) {
            const { authorizePlatform } = await import('../../features/platform/auth/index.js');
            const identity = await authorizePlatform(ctx, command.access.nova);
            if (!identity) return;
            ctx.identity = identity;
        }
        const result = await command.execute(ctx);
        if (ctx.guild)
            await logEvent(ctx.guild, 'commands', 'Command used', `<@${ctx.user.id}> used /${command.name}.`);
        return result;
    } catch (error) {
        const id = reportError(error, 'command');
        return ctx.reply({ content: publicError(error, id), flags: 64 });
    }
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
    guild: Guild | null,
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
    let values = raw;
    let options = argumentOptions(command);
    const subcommandName = raw[0];
    if (subcommandName && command.subcommands?.[subcommandName]) {
        parsed.subcommand = subcommandName;
        values = raw.slice(1);
        options = Object.entries(command.subcommands[subcommandName].args ?? {}).map(
            ([name, definition]) => ({
                name,
                type: argumentType(definition.type),
            }),
        );
    }

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const value = values[i];

        if (!option || !value) continue;

        switch (option.type) {
            /**
             * STRING OPTION
             *
             * Consumes all remaining input as a single string.
             * This matches Discord behavior for greedy string arguments.
             */
            case ApplicationCommandOptionType.String: {
                if (i === options.length - 1) {
                    // last string consumes rest of input
                    const remaining = values.slice(i).join(' ');
                    parsed[option.name] = remaining;
                    return parsed;
                } else {
                    parsed[option.name] = value;
                    break;
                }
            }

            /**
             * INTEGER OPTION
             *
             * Attempts numeric conversion from string input.
             */
            case ApplicationCommandOptionType.Integer: {
                const num = Number(value);
                if (!Number.isFinite(num))
                    throw new BotError('validation', `Invalid number for ${option.name}.`);
                parsed[option.name] = num;
                break;
            }

            case ApplicationCommandOptionType.Number: {
                const num = Number(value);
                if (!Number.isFinite(num))
                    throw new BotError('validation', `Invalid number for ${option.name}.`);
                parsed[option.name] = num;
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

                if (!['true', 'yes', 'y', '1', 'on', 'false', 'no', 'n', '0', 'off'].includes(lower))
                    throw new BotError('validation', `Invalid boolean for ${option.name}.`);
                parsed[option.name] = ['true', 'yes', 'y', '1', 'on'].includes(lower);

                break;
            }

            /**
             * USER OPTION
             *
             * Parses Discord mentions or raw IDs
             * and resolves them via the API.
             */
            case ApplicationCommandOptionType.User: {
                const id = value.replace(/[<@!>]/g, '');

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

                const id = value.replace(/[<@&>]/g, '');
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

                const id = value.replace(/[<#>]/g, '');
                const channel = guild.channels.cache.get(id);

                if (channel && 'send' in channel) parsed[option.name] = channel;

                break;
            }
        }
    }

    return parsed;
}

function argumentType(type: Types.ArgumentType): ApplicationCommandOptionType {
    const types: Record<Types.ArgumentType, ApplicationCommandOptionType> = {
        string: ApplicationCommandOptionType.String,
        integer: ApplicationCommandOptionType.Integer,
        number: ApplicationCommandOptionType.Number,
        boolean: ApplicationCommandOptionType.Boolean,
        user: ApplicationCommandOptionType.User,
        role: ApplicationCommandOptionType.Role,
        channel: ApplicationCommandOptionType.Channel,
    };
    return types[type];
}

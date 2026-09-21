import type { Command, CommandData } from '@types';
import { ApplicationCommandOptionType, SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

export type CommandOption = { name: string; type: ApplicationCommandOptionType };

export function materializeCommand(command: Command): Command & { data: CommandData } {
    if (command.data) return command as Command & { data: CommandData };
    if (!command.name) throw new Error('A command must define name');

    const builder = new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.desc ?? command.help?.usage ?? command.name)
        .setDMPermission(command.access?.guildOnly === false);
    if (command.access?.discord?.length)
        builder.setDefaultMemberPermissions(command.access.discord.reduce((a, b) => a | b, 0n));
    if (command.access?.ownerOnly || command.requiredLevel === 3) builder.setDefaultMemberPermissions(0n);

    if (command.args && command.subcommands) {
        throw new Error(`Command ${command.name} cannot define both args and subcommands`);
    }

    for (const [name, definition] of Object.entries(command.args ?? {})) {
        addArgument(builder, name, definition);
    }

    for (const [name, definition] of Object.entries(command.subcommands ?? {})) {
        builder.addSubcommand((subcommand) => {
            subcommand.setName(name).setDescription(definition.description ?? name);
            for (const [argumentName, argument] of Object.entries(definition.args ?? {})) {
                addArgument(subcommand, argumentName, argument);
            }
            return subcommand;
        });
    }
    command.data = builder;
    return command as Command & { data: CommandData };
}

export function argumentOptions(command: Command): readonly CommandOption[] {
    if (command.args) {
        const optionTypes: Record<string, ApplicationCommandOptionType> = {
            string: ApplicationCommandOptionType.String,
            integer: ApplicationCommandOptionType.Integer,
            number: ApplicationCommandOptionType.Number,
            boolean: ApplicationCommandOptionType.Boolean,
            user: ApplicationCommandOptionType.User,
            role: ApplicationCommandOptionType.Role,
            channel: ApplicationCommandOptionType.Channel,
        };
        return Object.entries(command.args).flatMap(([name, definition]): CommandOption[] => {
            const type = optionTypes[definition.type];
            return type === undefined ? [] : [{ name, type }];
        });
    }
    const options = command.data?.options ?? [];
    return options.flatMap((option): CommandOption[] => {
        if (!isCommandOption(option)) return [];
        return [option];
    });
}

function addArgument(
    builder: SlashCommandBuilder | SlashCommandSubcommandBuilder,
    name: string,
    definition: import('@types').ArgumentDefinition,
): void {
    const description = definition.description ?? name;
    const required = definition.required ?? false;

    switch (definition.type) {
        case 'string':
            builder.addStringOption((option) => {
                option.setName(name).setDescription(description).setRequired(required);
                if (definition.autocomplete) option.setAutocomplete(true);
                if (definition.minLength !== undefined) option.setMinLength(definition.minLength);
                if (definition.maxLength !== undefined) option.setMaxLength(definition.maxLength);
                const choices = definition.choices?.filter(
                    (choice): choice is { name: string; value: string } => typeof choice.value === 'string',
                );
                if (choices?.length) option.addChoices(...choices);
                return option;
            });
            break;
        case 'integer':
            builder.addIntegerOption((option) => {
                option.setName(name).setDescription(description).setRequired(required);
                if (definition.autocomplete) option.setAutocomplete(true);
                if (definition.minValue !== undefined) option.setMinValue(definition.minValue);
                if (definition.maxValue !== undefined) option.setMaxValue(definition.maxValue);
                const choices = definition.choices?.filter(
                    (choice): choice is { name: string; value: number } => typeof choice.value === 'number',
                );
                if (choices?.length) option.addChoices(...choices);
                return option;
            });
            break;
        case 'number':
            builder.addNumberOption((option) => {
                option.setName(name).setDescription(description).setRequired(required);
                if (definition.autocomplete) option.setAutocomplete(true);
                if (definition.minValue !== undefined) option.setMinValue(definition.minValue);
                if (definition.maxValue !== undefined) option.setMaxValue(definition.maxValue);
                const choices = definition.choices?.filter(
                    (choice): choice is { name: string; value: number } => typeof choice.value === 'number',
                );
                if (choices?.length) option.addChoices(...choices);
                return option;
            });
            break;
        case 'boolean':
            builder.addBooleanOption((option) =>
                option.setName(name).setDescription(description).setRequired(required),
            );
            break;
        case 'user':
            builder.addUserOption((option) =>
                option.setName(name).setDescription(description).setRequired(required),
            );
            break;
        case 'role':
            builder.addRoleOption((option) =>
                option.setName(name).setDescription(description).setRequired(required),
            );
            break;
        case 'channel':
            builder.addChannelOption((option) =>
                option.setName(name).setDescription(description).setRequired(required),
            );
            break;
    }
}

function isCommandOption(value: unknown): value is CommandOption {
    if (typeof value !== 'object' || value === null) return false;
    const option = value as Record<string, unknown>;
    return typeof option.name === 'string' && typeof option.type === 'number';
}

import * as Discord from 'discord.js'

import { PermissionLevel } from "../../../framework/guards/guards.js";
import { Command } from '../../../types/command.types.js';
import { media } from "../../../framework/embed/media.js";
import { Colors } from "../../../config/theme.js";

import { deploy } from '../../../utils/deploy.js';

import { BotClient } from '../../../framework/client/client.js';

const command: Command = {

    /**
     * use this if you dont want the command to be prefix enabled.
     * aliases doesnt do anything yet
     */
    prefix: {
        enabled: true,
        aliases: ['sync'],
    },

    /**
     * currently this does nothing
     */
    aliases: ['sync'],

    /**
     * use this if the required permission level
     * for this command is anything higher than 'PUBLIC'
     */
    requiredLevel: PermissionLevel.OWNER,

    /**
     * only really matters if the command has options/args
     * use this for the autocomplete logic
     * only works for slash commands
     * 
     * @param interaction
     */
    autocomplete: async (interaction) => {

        const focused = interaction.options
            .getFocused()
            .toLowerCase();

        const client = interaction.client as BotClient;

        const commands = [
            ...client.commands.values()
        ];

        /**
         * Deduplicate command names
         * in case aliases exist in registry
         */
        const unique = new Set<string>();

        for (const command of commands) {
            unique.add(command.data.name);
        }

        const names = [...unique];

        /**
         * Prioritize startsWith matches
         */
        const startsWith = names.filter(name =>
            name.toLowerCase().startsWith(focused)
        );

        /**
         * Then broader includes matches
         */
        const includes = names.filter(name =>
            !name.toLowerCase().startsWith(focused) &&
            name.toLowerCase().includes(focused)
        );

        const results = [
            ...startsWith,
            ...includes
        ]
        .slice(0, 25);

        await interaction.respond(
            results.map(name => ({
                name,
                value: name
            }))
        );

    },

    help: {
        usage: "`/command` **`<required>`** *`[optional]`*",
        example: `
            \`/command\`
            \`/command\` **\`req:\`** arg
            \`/command\` *\`opt:\`* arg
        `.trim()
    },

    data: new Discord.SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Deploy commands to Discord')

        .addStringOption(o =>
            o
            .setName('command')
            .setDescription('Deploy a specific command')
            .setAutocomplete(true)
            .setRequired(false)
        )

        /*
        optional:

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("desc")
                .setRequired(Boolean)
        )

        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("desc")
                .setRequired(Boolean)
        )
        */

        ,

    async execute(ctx) {

        // GATHER DATA
        const commandName = ctx.args.command;// || ctx.args[0];

        await ctx.defer();

        const result = await deploy({commandName});

        if (!result.success) {
            return ctx.error({
                embed: {
                    title: "❌ Deployment failed",
                    desc: result.errors.join('\n')
                },

                thumbnail: media.local('error'),
                flags: Discord.MessageFlags.Ephemeral
            });
        }

        return ctx.success({
            embed: {
                title: result.mode === 'all'
                ? "✅ Full deploy completed"
                : `✅ Command deployed: ${result.deployed[0]}`,
                desc: result.mode === 'all'
                ? "Successfully deployed application commands to the development guild."
                : `Successfully deployed \`${result.deployed[0]}\`.`,
                fields: [
                    {
                        name: 'Mode',
                        value: result.mode,
                        inline: true
                    },
                    {
                        name: 'Deployed',
                        value: String(result.deployed.length),
                        inline: true
                    },
                    {
                        name: 'Duration',
                        value: `${result.duration}ms`,
                        inline: true
                    },
                    {
                        name: 'Warnings',
                        value: result.errors.length
                        ? result.errors.join('\n')
                        : 'None',
                    },
                ]
            },

            thumbnail: media.local('success'),
            flags: Discord.MessageFlags.Ephemeral
        });

    }
}

export default command;
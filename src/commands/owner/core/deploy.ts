import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';


const command: ace.Command = {

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
    requiredLevel: ace.PermissionLevel.OWNER,

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

        const client = interaction.client as ace.BotClient;

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

    data: new dis.SlashCommandBuilder()
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

        const result = await Utils.deploy({commandName});

        if (!result.success) {
            return ctx.error({
                embed: {
                    title: "❌ Deployment failed",
                    desc: result.errors.join('\n')
                },

                thumbnail: ace.media.local('error'),
                flags: dis.MessageFlags.Ephemeral
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

            thumbnail: ace.media.local('success'),
            flags: dis.MessageFlags.Ephemeral
        });

    }
}

export default command;
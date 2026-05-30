import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';

/**
 * HELP COMMAND
 * 
 * SCOPE:
 * - Display help menu
 * - Navigate categories, subcategories, and commands
 * - Show command usage and examples
 * 
 * LOGIC:
 * - If no args, show main categories
 * - If category arg, show subcategories or commands in that category
 * - If subcategory arg, show commands in that subcategory
 * - If command arg, show command details
 * 
 * NOTE: This command dynamically loads all commands to generate the help menu,
 * so it may be slower than other commands. Caching can be implemented if needed.
 * 
 */
const command: ace.Command = {

    prefix: {
        enabled: true,
        aliases: []
    },

    aliases: [],
    requiredLevel: ace.PermissionLevel.PUBLIC,

    help: {
        usage: "`/help` *`[category]`* *`[subcategory]`* *`[command]`*",
        example: `
            \`/help\`
            \`/help utility\`
            \`/help utility general\`
            \`/help ping\`
        `.trim()
    },

    autocomplete: async (interaction) => {

        const { getAllCommands } = await import('@features/help/index.js');
        const all = await getAllCommands();

        const focused = interaction.options.getFocused(true);
        const value = focused.value.toLowerCase();

        let choices: string[] = [];

        /**
         * CATEGORY AUTOCOMPLETE
         */
        if(focused.name === 'category') {
            choices = [...new Set(all.map(c => c.category))];
        }

        /**
         * SUBCATEGORY AUTOCOMPLETE
         */
        else if (focused.name === 'subcategory') {

            const category = interaction.options.getString('category');

            if(category) choices = [...new Set(all
                .filter(c =>
                    c.category.toLowerCase() === category.toLowerCase()
                ).map(c => c.subcategory)
            )];

        }

        /**
         * COMMAND AUTOCOMPLETE
         */
        else if (focused.name === 'command') {
            choices = all.map(c => c.name);
        }

        const filtered = choices
        .filter(choice =>
            choice.toLowerCase().includes(value)
        ).slice(0, 25);

        await interaction.respond(filtered.map(choice => ({
            name: choice,
            value: choice
        })));

    },

    data: new dis.SlashCommandBuilder()

    .setName('help')
    .setDescription('Shows the help menu')

    .addStringOption(o =>
        o
        .setName('category')
        .setDescription('Category to view')
        .setAutocomplete(true)
        .setRequired(false)
    )
    .addStringOption(o =>
        o
        .setName('subcategory')
        .setDescription('Subcategory to view')
        .setAutocomplete(true)
        .setRequired(false)
    )
    .addStringOption(o =>
        o
        .setName('command')
        .setDescription('Command to view')
        .setAutocomplete(true)
        .setRequired(false)
    ),

    async execute(ctx) {

        // GATHER DATA
        const {
            getAllCommands,
            renderHelpView,
            resolveHelpTarget
        } = await import('@features/help/index.js');

        const all = await getAllCommands();
        const target = resolveHelpTarget(ctx.args, all);

        // LOGIC
        if (target.error === 'INVALID_COMMAND') {return ctx.error({
            embed: {
                title: 'Command not found',
                desc: `No command name \`${ctx.args.raw?.[0]}\` was found.`
            },
            flags: dis.MessageFlags.Ephemeral
        });}

        if (target.error === 'INVALID_SUBCATEGORY') {return ctx.error({
            embed: {
                title: 'Invalid subcategory',
                desc: [
                    'Subcategories must be used with their category.',
                    '',
                    'Example:',
                    '`help utility general`'
                ].join('\n')
            },
            flags: dis.MessageFlags.Ephemeral
        });}

        if (target.error === 'INVALID_CATEGORY') {return ctx.error({
            embed: {
                title: 'Category not found',
                desc: `No category named \`${ctx.args.raw?.[0]}\` was found.`
            },
            flags: dis.MessageFlags.Ephemeral
        });}

        // BUILD REPLY
        return renderHelpView(ctx, target);

    }

};

export default command;
import * as Discord from 'discord.js';

import { PermissionLevel } from "../../../framework/guards/guards.js";
import { Command } from '../../../types/command.types.js';
import { media } from "../../../framework/embed/media.js";
import { Colors } from "../../../config/theme.js";

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
const command: Command = {

    prefix: {
        enabled: true,
        aliases: []
    },

    aliases: [],
    requiredLevel: PermissionLevel.PUBLIC,

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

        const { getAllCommands } = await import('../../../features/help/index.js');
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

    data: new Discord.SlashCommandBuilder()

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
        const {getAllCommands, renderHelpView} = await import('../../../features/help/index.js');
        const all = await getAllCommands();

        let category: string | undefined;
        let subcategory: string | undefined;
        let command: string | undefined;

        // LOGIC
        /**
         * SLASH COMMANDS
         */
        if (ctx.interaction?.isChatInputCommand()) {

            category = ctx.getString("category") ?? undefined;
            subcategory = ctx.getString("subcategory") ?? undefined;
            command = ctx.getString("command") ?? undefined;

        }

        /**
         * PREFIX COMMANDS
         */
        else {

            const raw = ctx.args.raw ?? [];
            const first = raw[0]?.toLowerCase();
            const second = raw[1]?.toLowerCase();

            /**
             * NO ARGS
             * ---help
             */
            if (!first) {

                // main menu

            }

            /**
             * COMMAND MATCH
             * ---help ping
             */
            else if (all.some(c => c.name.toLowerCase() === first)) command = first;

            /**
             * CATEGORY MATCH
             * ---help utility
             */
            else if (all.some(c => c.category.toLowerCase() === first)) {

                category = first;

                /**
                 * SUBCATEGORY MATCH
                 * ---help utility general
                 */
                if (second && all.some(c =>
                        c.category.toLowerCase() === first &&
                        c.subcategory.toLowerCase() === second
                    )) subcategory = second;

            }

        }

        return renderHelpView(ctx, {
            category,
            subcategory,
            command
        });

        // BUILD REPLY

    }

};

export default command;
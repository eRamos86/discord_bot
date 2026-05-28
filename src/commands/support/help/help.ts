import * as Discord from 'discord.js';

import { PermissionLevel } from "../../../core/guards/guards.js";
import { Command } from "../../../core/commands/command.js";
import { media } from "../../../utils/media.js";
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

    data: new Discord.SlashCommandBuilder()

    .setName('help')
    .setDescription('Shows the help menu')

    .addStringOption(o =>
        o
        .setName('category')
        .setDescription('Category to view')
        .setRequired(false)
    )
    .addStringOption(o =>
        o
        .setName('subcategory')
        .setDescription('Subcategory to view')
        .setRequired(false)
    )
    .addStringOption(o =>
        o
        .setName('command')
        .setDescription('Command to view')
        .setRequired(false)
    ),

    async execute(ctx) {

        // GATHER DATA
        const {getAllCommands, renderHelpView} = await import('../../../systems/help/index.js');
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
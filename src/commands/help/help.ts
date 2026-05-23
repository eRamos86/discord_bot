import {
    SlashCommandBuilder
} from "discord.js";

import { PermissionLevel } from "../../core/permissionLevels.js";

export default {

    aliases: [],
    requiredLevel: PermissionLevel.PUBLIC,
    help: {
        usage: "`/help` *`[category]`* *`[command]`*",
        example: `
            \`/help\`
            \`/help\` *\`category:\`* misc
            \`/help\` *\`command:\`* ping
        `.trim()
    },

    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows the help menu")
        .addStringOption(option =>
            option
                .setName("category")
                .setDescription("Category to view")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("command")
                .setDescription("Command to view")
                .setRequired(false)
        ),

    async execute(interaction: any, client: any) {

        const category = interaction.options.getString("category");
        const command = interaction.options.getString("command");

        const { handleHelpCommand } = await import("../../core/helpHandler.js");

        return handleHelpCommand(interaction, client, {
            category,
            command
        });
    }
};
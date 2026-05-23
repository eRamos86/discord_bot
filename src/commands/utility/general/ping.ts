import {
    SlashCommandBuilder
} from "discord.js";

import { PermissionLevel } from "../../../core/permissionLevels.js";

export default {

    aliases: [],
    requiredLevel: PermissionLevel.PUBLIC,
    help: {
        usage: "`/ping`",
        example: `
            \`/ping\`
        `.trim()
    },

    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with pong. Used to test if Bot online.")
    
    ,

    async execute(interaction: any) {
        await interaction.reply("Pong!");
    }
};
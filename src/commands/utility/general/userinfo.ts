import {
    SlashCommandBuilder
} from "discord.js";

import { PermissionLevel } from "../../../core/permissionLevels.js";

export default {

    aliases: ["uinfo"],
    requiredLevel: PermissionLevel.PUBLIC,
    help: {
        usage: "`/userinfo` *`[user]`*",
        example: `
            \`/userinfo\`
            \`/userinfo\` *\`user:\`* @certified.luverboy
        `.trim()
    },

    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Get info about a user")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to inspect")
                .setRequired(false)
        )
        
    ,

    async execute(interaction: any) {

        const user = interaction.options.getUser("user")
            ?? interaction.user;

        await interaction.reply({
            content:
                `Username: ${user.tag}\n` +
                `ID: ${user.id}`
        });
    }
};
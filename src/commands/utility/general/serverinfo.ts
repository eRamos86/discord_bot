import {
    SlashCommandBuilder
} from "discord.js";

import { PermissionLevel } from "../../../core/guards/guards.js";
import { Command } from '../../../types/command.types.js';
import { Colors } from "../../../config/theme.js";

export default{

    aliases: ["servinfo"],
    requiredLevel: PermissionLevel.PUBLIC,
    help: {
        usage: "`/serverinfo`*",
        example: `
            \`/serverinfo\`
        `.trim()
    },

    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("provides information about the current server/guild")
        
    , // dont forget the comma at the end here
    
    async execute(interaction: any, client: any) {
        
        //command logic here:
        
        const guild = interaction.guild;

        const embed = createEmbed({
            title: `Server Information`,
            desc: `Details about \`${guild.name}\``
        })
        .setThumbnail(getThumbnail(client, interaction))
        // maybe do a tertiary operator thing
        // to see if certain features are available like banners and stuffs
        // then display if possible?
        // order matters.. banners, animated images, etc should be at the top
        // other stuff (vanity url, etc) can be near the bottom
        .addFields(
            {
                name: `Server name`,
                value: `${guild.name}`
            },
            {
                name: `Server ID`,
                value: `${guild.id}`,
                inline: true
            },
            {
                name: `Server description`,
                value: `${guild.description}`
            },
            {
                name: `Member Count`,
                value: `${guild.approximate_member_count}`
            },
            {
                name: `Online`,
                value: `${guild.approximate_presence_count}`,
                inline: true
            }
        );


        await interaction.reply({
            embeds: [embed]
        });


    }

};
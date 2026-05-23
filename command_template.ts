import {
    SlashCommandBuilder
} from "discord.js";

import { PermissionLevel } from "../../core/permissionLevels.js";

export default{

    aliases: [],
    requiredLevel: PermissionLevel.LEVEL, //PUBLIC, MOD, ADMIN, OWNER
    help: {
        usage: "`/command` **`<required>`** *`[optional]`*",
        example: `
            \`/command\`
            \`/command\` **\`req:\`** arg
            \`/command\` *\`opt:\`* arg
        `.trim()
    },

    data: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")

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
                .setName("amount, number")
                .setDescription("desc")
                .setRequired(Boolean)
        )
        
        */


        
    , // dont forget the comma at the end here
    
    async execute(interaction: any) {
        
        //command logic here:


    }

};
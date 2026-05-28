import * as Discord from 'discord.js'

import { PermissionLevel } from "./src/core/guards/permissionLevels.js";
import { Command } from "./src/core/commands/command.js";
import { media } from "./src/ui/embeds/media.js";
import { Colors } from "./src/config/theme.js";

const command: Command = {

    prefix: {
        enabled: true
    },

    aliases: [],
    requiredLevel: PermissionLevel.PUBLIC,

    help: {
        usage: "`/command` **`<required>`** *`[optional]`*",
        example: `
            \`/command\`
            \`/command\` **\`req:\`** arg
            \`/command\` *\`opt:\`* arg
        `.trim()
    },

    data: new Discord.SlashCommandBuilder()
        .setName('name')
        .setDescription('description')
        
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
        
        ,

    async execute(ctx) {
        
        // GATHER DATA
        
        // LOGIC

        // BUILD REPLY

    }
};

export default command;


/*
let embed, payload;
        
try {

    embed = createEmbed({
        title: ``,
        desc: `

        `.trim(),
        footer: ``
    });

    console.log(`Embed created for command '${this.data.name}'`);

} catch (err) {

    console.error(err);

    return await interaction.reply({
        content:
            `Error creating embed for '${this.data.name}':\n` +
            `\n\n\n${err}\n\n\n`,
        flags: 64
    });
    
}

try {

    payload = createEmbedPayload({
        embed,
        client: interaction.client,
        interaction,

        thumbnail: {
            type: ``
        },
        footerIcon: {
            type: ``
        },

        /*
        image: {
            type: ``
        },
        /\/\/\

    });

    console.log(`Payload created for command '${this.data.name}'`);

} catch (err) {

    console.error(err);

    return await interaction.reply({
        content:
            `Error creating payload for '${this.data.name}':\n` +
            `\n\n\n${err}\n\n\n`,
        flags: 64
    });

}

await interaction.reply({
    ...payload,
});
*/
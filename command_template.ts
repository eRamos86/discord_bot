import * as ace from './src/framework/index.js';

const command: ace.Command = {

    name: 'name',
    desc: 'description',
    args: {
        required: {
            type: 'string',
            required: true,
            description: 'Required argument'
        },
        optional: {
            type: 'integer',
            description: 'Optional argument'
        }
    },

    prefix: {
        enabled: true
    },

    aliases: [],
    requiredLevel: ace.PermissionLevel.PUBLIC,

    help: {
        usage: "`/command` **`<required>`** *`[optional]`*",
        example: `
            \`/command\`
            \`/command\` **\`req:\`** arg
            \`/command\` *\`opt:\`* arg
        `.trim()
    },

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

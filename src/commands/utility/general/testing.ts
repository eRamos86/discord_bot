import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';

const command: ace.Command = {

    /**
     * use this if you dont want the command to be prefix enabled.
     * aliases doesnt do anything yet
     */
    prefix: {
        enabled: true,
        aliases: [],
    },

    /**
     * currently this does nothing
     */
    aliases: [],

    /**
     * use this if the required permission level
     * for this command is anything higher than 'PUBLIC'
     */
    requiredLevel: ace.PermissionLevel.PUBLIC,

    /**
     * only really matters if the command has options/args
     * use this for the autocomplete logic
     * only works for slash commands
     *
     * @param interaction
     */
    /*
    autocomplete: async (interaction) => {

        // AUTOCOMPLETE CODE

    },
    */

    help: {
        usage: "\`/command\` **\`<required>\`** *\`[optional]\`*",
        example: `
            \`/command\`
            \`/command\` **\`req:\`** arg
            \`/command\` *\`opt:\`* arg
        `.trim()
    },

    data: new dis.SlashCommandBuilder()
        .setName('test')
        .setDescription('test')

        .addStringOption(o =>
            o
            .setName('prefx')
            .setDescription('refix to update to')
            .setRequired(true)
        )

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
                .setName("amount")
                .setDescription("desc")
                .setRequired(Boolean)
        )
        */

        ,

    async execute(ctx) {

        // GATHER DATA
        const settings = await ace.getGuildSettings(ctx.guild!.id);

        settings.prefix = ctx.getString('prefx') as string;

        // LOGIC
        await ace.updateGuildSettings(settings);

        // BUILD REPLY

        return ctx.success({
            embed: {
                title: 'Prefix Updated',
                desc: `new prefix: \`${(await ace.getGuildSettings(ctx.guild!.id)).prefix}\``
            }
        });

    }
};

export default command;

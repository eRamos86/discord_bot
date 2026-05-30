import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';

const command: ace.Command = {

    prefix: {
        enabled: true
    },

    aliases: [],
    requiredLevel: ace.PermissionLevel.MOD,

    help: {
        usage: "`/purge` **`[amt]`**",
        example: `
            \`/purge\` **\`amount:\`** 50
        `.trim()
    },

    // COMMAND DATA
    data: new dis.SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete specified amount of messages.')
    .addIntegerOption(o =>
        o
        .setName('amount')
        .setDescription('1-100')
        .setRequired(true)
    )

    ,

    async execute(ctx) {
        
        // GATHER DATA
        const amount = ctx.getNumber("amount")!;

        // LOGIC
        if (amount < 1 || amount > 100) {
            return ctx.reply({
                content: 'Choose 1-100',
                flags: 64
            });
        }

        const messages = await ctx.channel.delete(amount);

        // BUILD REPLY
        await ctx.channel.send({
            content: `Deleted ${messages.size} messages.`,
            flags: dis.MessageFlags.Ephemeral
        });

    },

};

export default command;

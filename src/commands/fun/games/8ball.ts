import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "`/8ball`",
        example: "`/8ball`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8ball a question'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Magic 8Ball',
                desc: 'Yes, absolutely (stub).'
            }
        });
    }
};

export default command;

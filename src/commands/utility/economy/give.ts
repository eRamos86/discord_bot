import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/give",
        example: "/give"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('give')
        .setDescription('Give money to another user'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Give',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

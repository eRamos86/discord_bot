import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/joke",
        example: "/joke"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('joke')
        .setDescription('Tell a joke'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Joke',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

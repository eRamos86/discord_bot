import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/queue",
        example: "/queue"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('queue')
        .setDescription('View the music queue'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Queue',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

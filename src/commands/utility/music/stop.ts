import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/stop",
        example: "/stop"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and clear the queue'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Stop',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

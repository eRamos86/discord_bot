import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/pause",
        example: "/pause"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Pause',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

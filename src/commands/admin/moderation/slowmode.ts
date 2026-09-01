import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "/slowmode",
        example: "/slowmode"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode in a channel'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Slowmode',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

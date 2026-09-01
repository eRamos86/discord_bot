import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "/unmute",
        example: "/unmute"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a user'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Unmute',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

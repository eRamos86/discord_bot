import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "/mute",
        example: "/mute"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Mute',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

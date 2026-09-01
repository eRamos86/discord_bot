import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "/kick",
        example: "/kick"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Kick',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

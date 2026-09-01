import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "/lock",
        example: "/lock"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Lock',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

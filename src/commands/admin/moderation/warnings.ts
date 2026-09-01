import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "/warnings",
        example: "/warnings"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Warnings',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

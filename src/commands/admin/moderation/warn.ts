import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "/warn",
        example: "/warn"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Warn',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

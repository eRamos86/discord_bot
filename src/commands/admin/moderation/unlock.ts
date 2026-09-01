import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "/unlock",
        example: "/unlock"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Unlock',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

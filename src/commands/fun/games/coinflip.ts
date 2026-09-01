import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/coinflip",
        example: "/coinflip"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Coinflip',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

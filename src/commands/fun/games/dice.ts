import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/dice",
        example: "/dice"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll a dice'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Dice',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

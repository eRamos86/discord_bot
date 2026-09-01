import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.ADMIN,
    help: {
        usage: "/filter",
        example: "/filter"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('filter')
        .setDescription('Configure automod filters'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Filter',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

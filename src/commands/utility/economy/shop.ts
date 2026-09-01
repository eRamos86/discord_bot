import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/shop",
        example: "/shop"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('shop')
        .setDescription('View the shop'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Shop',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

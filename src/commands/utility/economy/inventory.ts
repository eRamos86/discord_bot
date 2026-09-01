import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/inventory",
        example: "/inventory"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your inventory'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Inventory',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

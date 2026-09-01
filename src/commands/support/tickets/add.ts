import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "/add",
        example: "/add"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a user to a ticket'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Add',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

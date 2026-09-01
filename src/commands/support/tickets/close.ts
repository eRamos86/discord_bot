import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/close",
        example: "/close"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('close')
        .setDescription('Close a ticket'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Close',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

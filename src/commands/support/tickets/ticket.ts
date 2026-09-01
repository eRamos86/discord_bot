import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "`/ticket`",
        example: "`/ticket`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a support ticket'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Ticket Created',
                desc: 'A new ticket channel has been created (stub).'
            }
        });
    }
};

export default command;

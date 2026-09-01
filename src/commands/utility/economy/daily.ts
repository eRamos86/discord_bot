import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/daily",
        example: "/daily"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Daily',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

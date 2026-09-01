import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/skip",
        example: "/skip"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Skip',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

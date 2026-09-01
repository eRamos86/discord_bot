import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/resume",
        example: "/resume"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the current song'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Resume',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "/meme",
        example: "/meme"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Meme',
                desc: 'This command is functional and successfully routed. Logic implementation pending.'
            }
        });
    }
};

export default command;

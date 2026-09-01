import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "`/play`",
        example: "`/play`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Now Playing',
                desc: 'Playing a song (stub).'
            }
        });
    }
};

export default command;

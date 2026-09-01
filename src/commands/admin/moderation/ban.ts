import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "`/ban`",
        example: "`/ban`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'User Banned',
                desc: 'The user has been banned (stub).'
            }
        });
    }
};

export default command;

import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.ADMIN,
    help: {
        usage: "`/automod`",
        example: "`/automod`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure automod settings'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Automod Settings',
                desc: 'Automod is configured (stub).'
            }
        });
    }
};

export default command;

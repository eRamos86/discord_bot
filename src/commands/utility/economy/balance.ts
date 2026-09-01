import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "`/balance`",
        example: "`/balance`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),
    async execute(ctx) {
        return ctx.success({
            embed: {
                title: 'Balance',
                desc: 'You have 100 coins (stub).'
            }
        });
    }
};

export default command;

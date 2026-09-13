import * as Discord from 'discord.js';
import * as ace from '@framework';
import { db } from '../../../database/client.js';
import { userEconomy } from '../../../database/schema.js';
import { eq } from 'drizzle-orm';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "`/balance [user]`",
        example: "`/balance @user`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to check balance for')
                .setRequired(false)
        ),
    async execute(ctx) {
        let user = ctx.user;

        if (ctx.isInteraction) {
            const targetUser = ctx.interaction.options.getUser('user');
            if (targetUser) user = targetUser;
        } else if (ctx.args.length > 0) {
            const mention = ctx.args[0];
            const match = mention.match(/^<@!?(\d+)>$/);
            const userId = match ? match[1] : mention;
            try {
                user = await ctx.client.users.fetch(userId);
            } catch {
                // Keep default user if fetch fails
            }
        }

        try {
            const result = await db.select().from(userEconomy).where(eq(userEconomy.userId, user.id)).limit(1);
            const balance = result.length > 0 ? result[0].balance : '0';

            return ctx.success({
                embed: {
                    title: `${user.username}'s Balance`,
                    desc: `**Balance:** ${balance} coins`
                }
            });
        } catch (error) {
            console.error('Balance error:', error);
            return ctx.error({
                title: 'Error',
                desc: 'An error occurred while trying to fetch the balance.'
            });
        }
    }
};

export default command;

import * as Discord from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.MOD,
    help: {
        usage: "`/ban <user> [reason]`",
        example: "`/ban @user violation of rules`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for banning the user')
                .setRequired(false)
        ),
    async execute(ctx) {
        if (!ctx.guild) return;

        let user: Discord.User | undefined;
        let reason = 'No reason provided';

        if (ctx.interaction && ctx.interaction.isChatInputCommand()) {
            user = ctx.interaction.options.getUser('user') || undefined;
            reason = ctx.interaction.options.getString('reason') || reason;
        } else {
            const mention = ctx.args[0];
            if (!mention) {
                return ctx.error({
                    embed: {
                        title: 'Missing User',
                        desc: 'Please specify a user to ban.'
                    }
                });
            }
            const match = mention.match(/^<@!?(\d+)>$/);
            const userId = match ? match[1] : mention;
            try {
                user = await ctx.client.users.fetch(userId);
            } catch {
                return ctx.error({
                    embed: {
                        title: 'Invalid User',
                        desc: 'Could not resolve the user.'
                    }
                });
            }
            if (ctx.args.length > 1) {
                reason = ctx.args.slice(1).join(' ');
            }
        }

        if (!user) {
            return ctx.error({
                embed: {
                    title: 'Invalid User',
                    desc: 'Could not resolve the user to ban.'
                }
            });
        }

        const member = await ctx.guild.members.fetch(user.id).catch(() => null);

        if (member) {
            if (!member.bannable) {
                return ctx.error({
                    embed: {
                        title: 'Permission Denied',
                        desc: `I cannot ban ${user.tag}. They might have a higher role than me.`
                    }
                });
            }
        }

        try {
            await ctx.guild.members.ban(user.id, { reason });
            return ctx.success({
                embed: {
                    title: 'User Banned',
                    desc: `Successfully banned **${user.tag}**.\n**Reason:** ${reason}`
                }
            });
        } catch (error) {
            console.error('Ban error:', error);
            return ctx.error({
                embed: {
                    title: 'Error',
                    desc: 'An error occurred while trying to ban the user.'
                }
            });
        }
    }
};

export default command;

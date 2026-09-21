import * as ace from '@framework';
import * as Discord from 'discord.js';

const command: ace.Command = {
    name: 'slowmode',
    desc: 'Set slowmode in a channel',
    args: {
        seconds: {
            type: 'integer',
            required: true,
            description: 'Slowmode delay in seconds (0 disables)',
            minValue: 0,
            maxValue: 21600,
        },
    },
    prefix: { enabled: true },
    access: {
        discord: [Discord.PermissionFlagsBits.ManageChannels],
        bot: [Discord.PermissionFlagsBits.ManageChannels],
    },
    help: {
        usage: '/slowmode <seconds>',
        example: '/slowmode 10',
    },
    async execute(ctx) {
        const seconds = ctx.getNumber('seconds');
        if (seconds === null || !ctx.channel.raw || !('setRateLimitPerUser' in ctx.channel.raw)) {
            return ctx.error({
                title: 'Unable to Set Slowmode',
                desc: 'Choose a delay from 0 to 21600 seconds in a supported guild channel.',
            });
        }
        await ctx.channel.raw.setRateLimitPerUser(seconds, `Changed by ${ctx.user.tag}`);
        return ctx.success({
            embed: {
                title: 'Slowmode Updated',
                desc:
                    seconds === 0 ? 'Slowmode has been disabled.' : `Slowmode is now **${seconds} seconds**.`,
            },
        });
    },
};

export default command;

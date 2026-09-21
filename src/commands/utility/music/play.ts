import { music } from '../../../features/music/service.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'play',
    desc: 'Music: play',
    prefix: { enabled: true },
    args: {
        track: {
            type: 'string',
            required: true,
            description: 'Track ID from the operator-configured catalog',
        },
    },
    async execute(ctx) {
        requireValue(ctx.member, 'Use this in a server.');
        await ctx.defer(64);
        await music.play(ctx.member, ctx.getString('track')!);
        return ctx.reply('Track queued.');
    },
} satisfies Command;

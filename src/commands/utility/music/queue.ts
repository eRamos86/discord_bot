import { music } from '../../../features/music/service.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'queue',
    desc: 'Music: queue',
    prefix: { enabled: true },
    args: {},
    async execute(ctx) {
        requireValue(ctx.member, 'Use this in a server.');
        await ctx.defer(64);
        return ctx.reply(music.control(ctx.member, 'queue', ctx.getNumber('percent') ?? undefined));
    },
} satisfies Command;

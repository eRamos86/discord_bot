import * as economy from '../../../features/engagement/economy.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'inventory',
    desc: 'Server economy: inventory',
    prefix: { enabled: true },
    args: {},
    async execute(ctx) {
        requireValue(ctx.guild && ctx.settings, 'Use this in a server.');
        const s = ctx.settings.economy;
        requireValue(s.enabled, 'The server economy is disabled.');
        const items = await economy.inventory(ctx.guild.id, ctx.user.id);
        return ctx.reply(
            items.map((i) => `${i.item_id}: ${i.quantity}`).join('\n') || 'Your inventory is empty.',
        );
    },
} satisfies Command;

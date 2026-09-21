import * as economy from '../../../features/engagement/economy.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'shop',
    desc: 'Server economy: shop',
    prefix: { enabled: true },
    args: { item: { type: 'string' } },
    async execute(ctx) {
        requireValue(ctx.guild && ctx.settings, 'Use this in a server.');
        const s = ctx.settings.economy;
        requireValue(s.enabled, 'The server economy is disabled.');
        const id = ctx.getString('item');
        if (!id)
            return ctx.reply(
                s.shop.map((i) => `${i.id}: ${i.name} — ${i.price} ${s.currency}`).join('\n') ||
                    'The server shop is empty.',
            );
        const item = s.shop.find((i) => i.id === id);
        requireValue(item, 'Unknown shop item.');
        await economy.buy(ctx.guild.id, ctx.user.id, item, ctx.interaction?.id ?? ctx.message!.id);
        return ctx.reply(`Purchased ${item.name}.`);
    },
} satisfies Command;

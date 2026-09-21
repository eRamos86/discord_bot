import type { Command } from '../../../types/command.types.js';
import * as munchpoints from '../../../features/platform/munchpoints/index.js';

export default {
    name: 'mp',
    desc: 'Private MunchPoints balance, rewards and history (shorthand)',
    prefix: { enabled: false },
    access: { private: true, nova: { project: 'munchpoints' } },
    subcommands: { balance: {}, rewards: {}, history: {} },
    async execute(ctx) {
        const token = ctx.identity!.token;
        const action = ctx.getString('subcommand');
        if (action === 'balance') return munchpoints.handleBalance(ctx, token);
        if (action === 'rewards') return munchpoints.handleRewards(ctx, token);
        return munchpoints.handleHistory(ctx, token);
    },
} satisfies Command;

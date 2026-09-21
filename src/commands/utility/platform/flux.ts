import type { Command } from '../../../types/command.types.js';
import * as flux from '../../../features/platform/flux/index.js';

export default {
    name: 'flux',
    desc: 'Private financial commands through Flux',
    prefix: { enabled: false },
    access: { private: true, nova: { project: 'flux' } },
    subcommands: {
        balance: {},
        transactions: {},
        'quick-expense': {
            args: {
                amount: { type: 'number', required: true, minValue: 0.01, maxValue: 1000000 },
                description: { type: 'string', required: true, maxLength: 200 },
                account: { type: 'string' },
            },
        },
        accounts: {},
        recent: {},
        budgets: {},
        subscriptions: {},
        summary: {},
    },
    async execute(ctx) {
        const token = ctx.identity!.token;
        const action = ctx.getString('subcommand');
        if (action === 'balance') return flux.handleBalance(ctx, token);
        if (action === 'transactions') return flux.handleTransactions(ctx, token);
        if (action === 'quick-expense') {
            return flux.handleQuickExpense(
                ctx,
                token,
                ctx.getNumber('amount')!,
                ctx.getString('description')!,
                ctx.getString('account') ?? undefined,
            );
        }
        if (action === 'accounts') return flux.handleAccounts(ctx, token);
        if (action === 'recent') return flux.handleRecent(ctx, token);
        if (action === 'budgets') return flux.handleBudgets(ctx, token);
        if (action === 'subscriptions') return flux.handleSubscriptions(ctx, token);
        return flux.handleSummary(ctx, token);
    },
} satisfies Command;

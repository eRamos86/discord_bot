import type { EmbedBuilder } from 'discord.js';
import {
    platformEmbed,
    formatCurrency,
    formatDate,
    truncate,
    progressBar,
    budgetColor,
} from '../config.js';

/**
 * Renders a list of Flux accounts as a rich embed.
 */
export function accountsEmbed(accounts: Record<string, unknown>[]): EmbedBuilder {
    const embed = platformEmbed('flux', {
        title: '💰 Flux Accounts',
        desc: accounts.length === 0 ? 'No accounts found.' : undefined,
    });

    for (const acct of accounts.slice(0, 10)) {
        const name = truncate(acct.name ?? acct.id ?? 'Account', 60);
        const balance = formatCurrency(acct.balance, acct.currency);
        const status = acct.isArchived ? ' (archived)' : acct.isDefault ? ' ⭐' : '';
        embed.addFields({
            name: `${name}${status}`,
            value: `**Balance:** ${balance}\n**ID:** \`${truncate(acct.id, 36)}\``,
            inline: true,
        });
    }

    return embed;
}

/**
 * Renders an account balances and net worth breakdown embed.
 */
export function balanceEmbed(
    accounts: Record<string, unknown>[],
    summary?: Record<string, unknown>,
): EmbedBuilder {
    const embed = platformEmbed('flux', {
        title: '💰 Flux Balances & Net Worth',
    });

    let totalLiquid = 0;
    const active = accounts.filter((a) => !a.isArchived);

    for (const acct of active) {
        const bal = typeof acct.balance === 'number' ? acct.balance : parseFloat(String(acct.balance ?? 0));
        if (!isNaN(bal)) totalLiquid += bal;
        const name = truncate(acct.name ?? acct.id ?? 'Account', 40);
        const icon = acct.isDefault ? '⭐' : '💳';
        embed.addFields({
            name: `${icon} ${name}`,
            value: `**${formatCurrency(acct.balance, acct.currency)}**`,
            inline: true,
        });
    }

    if (summary && summary.netWorth !== undefined) {
        embed.setDescription(
            `**Total Net Worth:** ${formatCurrency(summary.netWorth)}\n**Liquid Cash:** ${formatCurrency(totalLiquid)}`,
        );
    } else {
        embed.setDescription(`**Liquid Cash Across Accounts:** ${formatCurrency(totalLiquid)}`);
    }

    return embed;
}

/**
 * Renders a page of transactions as a rich embed.
 */
export function transactionsEmbed(
    transactions: Record<string, unknown>[],
    page: number,
    totalPages: number,
): EmbedBuilder {
    const embed = platformEmbed('flux', {
        title: '📊 Recent Transactions',
        footer: `Page ${page + 1} of ${totalPages}`,
    });

    if (transactions.length === 0) {
        embed.setDescription('No transactions found.');
        return embed;
    }

    const lines = transactions.map((tx) => {
        const date = formatDate(tx.date);
        const desc = truncate(tx.description ?? 'Transaction', 50);
        const amount = formatCurrency(tx.amount);
        const type = String(tx.type ?? '').toLowerCase();
        const icon = type === 'income' ? '📈' : type === 'expense' ? '📉' : '💱';
        return `${icon} **${date}** — ${desc}\n\u2003${amount} · ${type}`;
    });

    embed.setDescription(lines.join('\n\n'));
    return embed;
}

/**
 * Renders budgets with color-coded progress bars.
 */
export function budgetsEmbed(budgets: Record<string, unknown>[]): EmbedBuilder {
    const embed = platformEmbed('flux', {
        title: '📋 Budgets',
    });

    if (budgets.length === 0) {
        embed.setDescription('No budgets configured.');
        return embed;
    }

    for (const budget of budgets.slice(0, 10)) {
        const name = truncate(budget.name ?? budget.id ?? 'Budget', 60);
        const spent = Number(budget.spent ?? 0);
        const limit = Number(budget.limitAmount ?? budget.amount ?? 0);
        const bar = progressBar(spent, limit);
        const color = budgetColor(spent, limit);
        const icon = color === 'Red' ? '🔴' : color === 'Yellow' ? '🟡' : '🟢';

        embed.addFields({
            name: `${icon} ${name}`,
            value: `${bar}\n${formatCurrency(spent)} / ${formatCurrency(limit)}`,
            inline: false,
        });
    }

    return embed;
}

/**
 * Renders subscriptions with renewal info and monthly total.
 */
export function subscriptionsEmbed(subscriptions: Record<string, unknown>[]): EmbedBuilder {
    const embed = platformEmbed('flux', {
        title: '🔄 Subscriptions',
    });

    if (subscriptions.length === 0) {
        embed.setDescription('No subscriptions tracked.');
        return embed;
    }

    let monthlyTotal = 0;

    for (const sub of subscriptions.slice(0, 10)) {
        const name = truncate(sub.name ?? 'Subscription', 60);
        const amount = Number(sub.amount ?? 0);
        const cycle = String(sub.billingCycle ?? 'monthly');
        const renewal = formatDate(sub.nextRenewalDate);
        const status = String(sub.status ?? 'active');
        const icon = status === 'active' ? '✅' : status === 'cancelled' ? '❌' : '⏸️';

        if (status === 'active') {
            monthlyTotal += cycle === 'yearly' ? amount / 12 : cycle === 'weekly' ? amount * 4.33 : amount;
        }

        embed.addFields({
            name: `${icon} ${name}`,
            value: `**Amount:** ${formatCurrency(amount)} / ${cycle}\n**Next Renewal:** ${renewal}\n**Status:** ${status}`,
            inline: true,
        });
    }

    embed.setDescription(`**Estimated Monthly Total:** ${formatCurrency(monthlyTotal)}`);
    return embed;
}

/**
 * Renders the financial dashboard summary.
 */
export function summaryEmbed(metrics: Record<string, unknown>): EmbedBuilder {
    return platformEmbed('flux', {
        title: '📊 Financial Dashboard',
        fields: [
            { name: '💎 Net Worth', value: formatCurrency(metrics.netWorth), inline: true },
            { name: '📈 Total Assets', value: formatCurrency(metrics.totalAssets), inline: true },
            { name: '📉 Total Liabilities', value: formatCurrency(metrics.totalLiabilities), inline: true },
            { name: '💵 Monthly Income', value: formatCurrency(metrics.monthlyIncome), inline: true },
            { name: '💸 Monthly Expenses', value: formatCurrency(metrics.monthlyExpenses), inline: true },
            { name: '📊 Net Cash Flow', value: formatCurrency(metrics.netCashFlow), inline: true },
        ],
    });
}

/**
 * Renders a quick-expense confirmation.
 */
export function expenseConfirmEmbed(details: {
    amount: number;
    description: string;
    accountName?: string;
}): EmbedBuilder {
    return platformEmbed('flux', {
        title: '✅ Expense Recorded',
        fields: [
            { name: 'Amount', value: formatCurrency(details.amount), inline: true },
            { name: 'Description', value: truncate(details.description, 200), inline: true },
            ...(details.accountName
                ? [{ name: 'Account', value: details.accountName, inline: true }]
                : []),
        ],
    });
}

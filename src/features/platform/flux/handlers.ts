import type { CommandContext } from '../../../framework/context/context.types.js';
import { paginate } from '../../../framework/components/paginator.js';
import { selector } from '../../../framework/components/selector.js';
import { array, record } from '../../../services/http.js';
import { platform } from '../../../services/platform.js';
import {
    accountsEmbed,
    balanceEmbed,
    transactionsEmbed,
    budgetsEmbed,
    subscriptionsEmbed,
    summaryEmbed,
    expenseConfirmEmbed,
} from './embeds.js';
import { formatCurrency } from '../config.js';

/**
 * Handles displaying Flux accounts.
 */
export async function handleAccounts(ctx: CommandContext, token: string) {
    const accounts = await platform.flux.accounts(token);
    const embed = accountsEmbed(accounts);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles displaying account balances and net worth overview.
 */
export async function handleBalance(ctx: CommandContext, token: string) {
    const [accounts, summaryData] = await Promise.all([
        platform.flux.accounts(token),
        platform.flux.summary(token).catch(() => null),
    ]);
    const summary = summaryData ? record(record(summaryData).metrics) : undefined;
    const embed = balanceEmbed(accounts, summary);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles displaying recent Flux transactions with pagination.
 */
export async function handleRecent(ctx: CommandContext, token: string) {
    const transactions = await platform.flux.recent(token);
    if (transactions.length <= 10) {
        const embed = transactionsEmbed(transactions, 0, 1);
        return ctx.reply({ embeds: [embed] });
    }

    const pageSize = 10;
    const totalPages = Math.ceil(transactions.length / pageSize);
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
        const chunk = transactions.slice(i * pageSize, (i + 1) * pageSize);
        pages.push(transactionsEmbed(chunk, i, totalPages));
    }

    return paginate(ctx, pages);
}

/**
 * Handles displaying transactions (alias for handleRecent).
 */
export async function handleTransactions(ctx: CommandContext, token: string) {
    return handleRecent(ctx, token);
}

/**
 * Handles displaying Flux budgets.
 */
export async function handleBudgets(ctx: CommandContext, token: string) {
    const budgets = array(await platform.flux.budgets(token));
    const embed = budgetsEmbed(budgets);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles displaying Flux subscriptions.
 */
export async function handleSubscriptions(ctx: CommandContext, token: string) {
    const subscriptions = array(await platform.flux.subscriptions(token));
    const embed = subscriptionsEmbed(subscriptions);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles displaying financial dashboard summary.
 */
export async function handleSummary(ctx: CommandContext, token: string) {
    const data = record(await platform.flux.summary(token));
    const embed = summaryEmbed(record(data.metrics));
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles recording a quick expense.
 * If accountId is not provided and user has multiple active accounts, prompts with a select menu.
 */
export async function handleQuickExpense(
    ctx: CommandContext,
    token: string,
    amount: number,
    description: string,
    accountId?: string,
) {
    const accounts = await platform.flux.accounts(token);
    const activeAccounts = accounts.filter((a) => !a.isArchived);

    if (!accountId && activeAccounts.length > 1) {
        // Prompt account selection
        const options = activeAccounts.map((a) => ({
            label: String(a.name ?? a.id),
            value: String(a.id),
            description: `Balance: ${formatCurrency(a.balance, a.currency)}`,
            emoji: a.isDefault ? '⭐' : '💳',
        }));

        return selector(
            ctx,
            options,
            async (selectedId, interaction) => {
                const targetAccount = activeAccounts.find((a) => a.id === selectedId);
                await platform.flux.expense(token, amount, description, selectedId);
                const embed = expenseConfirmEmbed({
                    amount,
                    description,
                    accountName: targetAccount ? String(targetAccount.name ?? targetAccount.id) : undefined,
                });
                await interaction.update({ embeds: [embed], components: [] });
            },
            { placeholder: 'Select account for expense' },
        );
    }

    // Single account, explicit account, or default
    const targetAccount = accountId
        ? activeAccounts.find((a) => a.id === accountId)
        : (activeAccounts.find((a) => a.isDefault) ?? activeAccounts[0]);

    await platform.flux.expense(token, amount, description, accountId);
    const embed = expenseConfirmEmbed({
        amount,
        description,
        accountName: targetAccount ? String(targetAccount.name ?? targetAccount.id) : undefined,
    });
    return ctx.reply({ embeds: [embed] });
}

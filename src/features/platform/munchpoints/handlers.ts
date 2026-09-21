import type { CommandContext } from '../../../framework/context/context.types.js';
import { array, record } from '../../../services/http.js';
import { platform } from '../../../services/platform.js';
import { balanceEmbed, rewardsEmbed, historyEmbed } from './embeds.js';

/**
 * Handles checking MunchPoints balance.
 */
export async function handleBalance(ctx: CommandContext, token: string) {
    const data = record(await platform.munchpoints.balance(token));
    const embed = balanceEmbed(data);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles viewing available rewards.
 */
export async function handleRewards(ctx: CommandContext, token: string) {
    const raw = await platform.munchpoints.rewards(token);
    const rewards = array(raw);
    const embed = rewardsEmbed(rewards);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles viewing point history.
 */
export async function handleHistory(ctx: CommandContext, token: string) {
    const raw = await platform.munchpoints.history(token);
    const entries = array(raw);
    const embed = historyEmbed(entries);
    return ctx.reply({ embeds: [embed] });
}

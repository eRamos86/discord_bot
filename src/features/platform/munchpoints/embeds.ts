import type { EmbedBuilder } from 'discord.js';
import { platformEmbed, formatDate, truncate } from '../config.js';

/**
 * Renders user's MunchPoints balance.
 */
export function balanceEmbed(data: Record<string, unknown>): EmbedBuilder {
    const points = Number(data.points ?? 0).toLocaleString();
    const tier = data.tier ? String(data.tier) : undefined;

    return platformEmbed('munchpoints', {
        title: '🍔 MunchPoints Balance',
        fields: [
            { name: 'Total Points', value: `**${points}** pts`, inline: true },
            ...(tier ? [{ name: 'Tier', value: tier, inline: true }] : []),
        ],
    });
}

/**
 * Renders available MunchPoints rewards.
 */
export function rewardsEmbed(rewards: Record<string, unknown>[]): EmbedBuilder {
    const embed = platformEmbed('munchpoints', {
        title: '🍔 MunchPoints Rewards',
        desc: rewards.length === 0 ? 'No rewards currently available.' : undefined,
    });

    for (const r of rewards.slice(0, 10)) {
        const title = truncate(r.title ?? r.name ?? 'Reward', 50);
        const cost = Number(r.cost ?? r.points ?? 0).toLocaleString();
        embed.addFields({
            name: title,
            value: `**Cost:** ${cost} pts\n**ID:** \`${truncate(r.id, 36)}\``,
            inline: true,
        });
    }

    return embed;
}

/**
 * Renders points transaction history.
 */
export function historyEmbed(entries: Record<string, unknown>[]): EmbedBuilder {
    const embed = platformEmbed('munchpoints', {
        title: '🍔 Points History',
        desc: entries.length === 0 ? 'No history entries found.' : undefined,
    });

    for (const entry of entries.slice(0, 10)) {
        const title = truncate(entry.title ?? entry.reason ?? entry.description ?? 'Points Activity', 50);
        const date = formatDate(entry.createdAt ?? entry.date);
        const cost = entry.cost ?? entry.points ?? entry.amount;
        embed.addFields({
            name: `${title} (${date})`,
            value: `**Points:** ${cost ?? '—'}\n**ID:** \`${truncate(entry.id, 36)}\``,
            inline: false,
        });
    }

    return embed;
}

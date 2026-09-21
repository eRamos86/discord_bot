import type { EmbedBuilder } from 'discord.js';
import { platformEmbed, truncate } from '../config.js';

/**
 * Renders the list of registered platform applications.
 */
export function appsListEmbed(apps: Record<string, unknown>[]): EmbedBuilder {
    const embed = platformEmbed('admin', {
        title: '⚙️ Platform Applications',
        desc: apps.length === 0 ? 'No registered platform applications found.' : undefined,
    });

    for (const app of apps.slice(0, 15)) {
        const name = String(app.name ?? 'Application');
        const slug = String(app.slug ?? '—');
        const id = truncate(app.id, 36);
        embed.addFields({
            name,
            value: `**Slug:** \`${slug}\`\n**ID:** \`${id}\``,
            inline: true,
        });
    }

    return embed;
}

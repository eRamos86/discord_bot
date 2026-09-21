import type { EmbedBuilder } from 'discord.js';
import { platformEmbed, formatDate, truncate } from '../config.js';

/**
 * Renders the published Nexus "Now" entry.
 */
export function nowFeedEmbed(data: Record<string, unknown> | null): EmbedBuilder {
    if (!data) {
        return platformEmbed('nexus', {
            title: '🌐 Nexus Now',
            desc: 'No published Now entry found.',
        });
    }

    const title = truncate(data.title ?? 'Nexus Status Update', 100);
    const content = truncate(data.content ?? data.summary ?? 'No content published.', 2000);
    const date = formatDate(data.publishedAt ?? data.createdAt);

    return platformEmbed('nexus', {
        title: `🌐 ${title}`,
        desc: content,
        footer: `Published: ${date}`,
    });
}

/**
 * Renders published Nexus portfolio projects.
 */
export function projectsEmbed(projects: Record<string, unknown>[]): EmbedBuilder {
    if (!projects.length) {
        return platformEmbed('nexus', {
            title: '🌐 Nexus Portfolio',
            desc: 'No portfolio projects found.',
        });
    }

    const fields = projects.slice(0, 10).map((p) => {
        const name = String(p.title ?? p.name ?? 'Untitled Project');
        const desc = truncate(p.description ?? p.summary ?? 'No description provided.', 150);
        const url = typeof p.url === 'string' ? `\n🔗 [Visit Project](${p.url})` : '';
        const tags = Array.isArray(p.tags) && p.tags.length ? `\n🏷️ ${p.tags.join(', ')}` : '';
        return {
            name,
            value: `${desc}${url}${tags}`,
            inline: false,
        };
    });

    return platformEmbed('nexus', {
        title: '🌐 Nexus Portfolio Projects',
        desc: `Showing **${fields.length}** published project${fields.length === 1 ? '' : 's'}:`,
        fields,
        footer: `Nexus Portal · Total: ${projects.length}`,
    });
}

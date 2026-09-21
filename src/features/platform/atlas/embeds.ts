import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';
import { platformEmbed, truncate } from '../config.js';

/**
 * Transforms Obsidian / Atlas markdown callouts and math blocks into Discord-friendly markdown.
 */
export function formatMarkdownForDiscord(md: string): string {
    return md
        .replace(/>\s*\[!NOTE\]/gi, '> ℹ️ **Note**')
        .replace(/>\s*\[!TIP\]/gi, '> 💡 **Tip**')
        .replace(/>\s*\[!IMPORTANT\]/gi, '> ❗ **Important**')
        .replace(/>\s*\[!WARNING\]/gi, '> ⚠️ **Warning**')
        .replace(/>\s*\[!CAUTION\]/gi, '> 🛑 **Caution**')
        .replace(/\$\$(.+?)\$\$/gs, (_, math) => `\`${math.replace(/\\text\{([^}]+)\}/g, '$1').replace(/\\rightarrow/g, '->').trim()}\``)
        .replace(/\n{3,}/g, '\n\n');
}

/**
 * Splits a long markdown document into structured, readable pages for Discord.
 */
export function splitMarkdownIntoPages(markdown: string, maxChunk = 2000): string[] {
    if (markdown.length <= maxChunk) return [markdown];

    const paragraphs = markdown.split(/\n\n+/);
    const pages: string[] = [];
    let current = '';

    for (const paragraph of paragraphs) {
        if ((current + '\n\n' + paragraph).length > maxChunk) {
            if (current.trim()) {
                pages.push(current.trim());
                current = '';
            }
            if (paragraph.length > maxChunk) {
                // Split oversized paragraph by lines
                const lines = paragraph.split('\n');
                for (const line of lines) {
                    if ((current + '\n' + line).length > maxChunk) {
                        if (current.trim()) pages.push(current.trim());
                        current = line;
                    } else {
                        current = current ? current + '\n' + line : line;
                    }
                }
            } else {
                current = paragraph;
            }
        } else {
            current = current ? current + '\n\n' + paragraph : paragraph;
        }
    }

    if (current.trim()) {
        pages.push(current.trim());
    }

    return pages.length > 0 ? pages : ['No content available.'];
}

/**
 * Renders a page of Atlas documentation search results.
 */
export function searchResultsEmbed(
    results: { total: number; docs: Record<string, unknown>[] },
    query: string,
    page: number,
    totalPages: number,
): EmbedBuilder {
    const embed = platformEmbed('atlas', {
        title: `📚 Atlas Search: "${truncate(query, 50)}"`,
        desc:
            results.docs.length === 0
                ? 'No matching documents found in Atlas.'
                : `Found **${results.total}** matching document(s). Select or click a document below to read it in Discord:`,
        footer: `Page ${page + 1} of ${Math.max(totalPages, 1)} • atlas.eramos.us`,
    });

    for (const doc of results.docs) {
        const title = truncate(String(doc.title ?? 'Document'), 60);
        const path = truncate(String(doc.path ?? ''), 80);
        const description = typeof doc.description === 'string' && doc.description && doc.description !== title
            ? `\n> ${truncate(doc.description, 100)}`
            : '';
        const category = typeof doc.category === 'string' ? ` [${doc.category}]` : '';
        embed.addFields({
            name: `📄 ${title}${category}`,
            value: `\`${path}\`${description}`,
            inline: false,
        });
    }

    return embed;
}

/**
 * Builds interactive components (Buttons & Select Menu) for Atlas search results.
 */
export function buildSearchComponents(
    results: { total: number; docs: Record<string, unknown>[] },
    query: string,
): (ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>)[] {
    const rows: (ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>)[] = [];

    if (results.docs.length === 0) {
        rows.push(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 Search on Atlas Web')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://atlas.eramos.us/search?q=${encodeURIComponent(query)}`),
            ),
        );
        return rows;
    }

    // Top 5 Quick-Open Buttons
    const buttonRow = new ActionRowBuilder<ButtonBuilder>();
    const topDocs = results.docs.slice(0, 5);
    for (const doc of topDocs) {
        const path = String(doc.path || doc.slug);
        const title = truncate(String(doc.title || path.split('/').pop()?.replace(/\.md$/, '') || 'Doc'), 40);
        buttonRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`atlas:doc:${encodeURIComponent(path)}`)
                .setLabel(title)
                .setEmoji('📖')
                .setStyle(ButtonStyle.Primary),
        );
    }
    rows.push(buttonRow);

    // Select Menu for all results on this page (up to 25)
    if (results.docs.length > 1) {
        const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('atlas:menu')
                .setPlaceholder('📖 Choose a document to open...')
                .addOptions(
                    results.docs.slice(0, 25).map((doc, idx) => ({
                        label: truncate(String(doc.title || doc.slug || `Document ${idx + 1}`), 100),
                        description: truncate(String(doc.description || doc.path || ''), 100),
                        value: String(doc.path || doc.slug),
                        emoji: '📄',
                    })),
                ),
        );
        rows.push(menuRow);
    }

    // Link to Web Search
    const linkRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setLabel('🌐 View on Atlas Web')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://atlas.eramos.us/search?q=${encodeURIComponent(query)}`),
    );
    rows.push(linkRow);

    return rows;
}

/**
 * Builds formatted paginated embeds for an opened Atlas document.
 */
export function documentPages(doc: Record<string, unknown>, path: string): EmbedBuilder[] {
    const title = truncate(String(doc.title ?? path.split('/').pop()?.replace(/\.md$/, '') ?? 'Atlas Document'), 200);
    const rawContent = String(doc.content ?? doc.markdown ?? 'No content available.').trim();
    const formatted = formatMarkdownForDiscord(rawContent);
    const chunks = splitMarkdownIntoPages(formatted, 2000);

    const category = typeof doc.category === 'string' ? doc.category : undefined;
    const visibility = typeof doc.visibility === 'string' ? doc.visibility : undefined;
    const tags = Array.isArray(doc.tags) && doc.tags.length > 0 ? doc.tags.map(String) : undefined;

    return chunks.map((chunk, idx) => {
        const embed = platformEmbed('atlas', {
            title: chunks.length > 1 ? `📚 ${title} (Part ${idx + 1}/${chunks.length})` : `📚 ${title}`,
            desc: chunk,
            footer: chunks.length > 1 ? `Page ${idx + 1} of ${chunks.length} • ${path}` : `Path: ${path}`,
        });

        if (idx === 0) {
            if (category) embed.addFields({ name: 'Category', value: `📁 ${category}`, inline: true });
            if (visibility) {
                embed.addFields({
                    name: 'Access',
                    value: visibility === 'public' ? '🟢 Public' : '🔒 Restricted',
                    inline: true,
                });
            }
            if (tags && tags.length > 0) {
                embed.addFields({
                    name: 'Tags',
                    value: tags.map((t) => `\`${t}\``).join(' '),
                    inline: false,
                });
            }
        }

        return embed;
    });
}

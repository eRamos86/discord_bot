import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { CommandContext } from '../../../framework/context/context.types.js';
import { paginate } from '../../../framework/components/paginator.js';
import { record } from '../../../services/http.js';
import { platform } from '../../../services/platform.js';
import { buildSearchComponents, documentPages, searchResultsEmbed } from './embeds.js';

/**
 * Handles searching Atlas documents and attaching quick-open action components.
 */
export async function handleSearch(ctx: CommandContext, token: string | undefined, query: string, page = 0) {
    const result = await platform.atlas.search(token, query, page);
    const totalPages = Math.ceil(result.total / 10);
    const embed = searchResultsEmbed(result, query, page, totalPages);
    const components = buildSearchComponents(result, query);
    return ctx.reply({ embeds: [embed], components });
}

/**
 * Handles opening an Atlas document with formatted reader embeds and pagination.
 */
export async function handleOpen(ctx: CommandContext, token: string | undefined, path: string) {
    const doc = record(await platform.atlas.open(token, path));
    const pages = documentPages(doc, path);
    const slug = String(doc.slug ?? path.replace(/\.md$/, ''));

    const webButton = new ButtonBuilder()
        .setLabel('🌐 View on Atlas Web')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://atlas.eramos.us/wiki/${encodeURIComponent(slug)}`);

    const firstPage = pages[0];
    if (pages.length <= 1 && firstPage) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(webButton);
        return ctx.reply({ embeds: [firstPage], components: [row] });
    }

    return paginate(ctx, pages, { extraButtons: [webButton] });
}

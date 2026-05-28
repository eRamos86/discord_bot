import { EmbedBuilder } from "discord.js";
import type * as Types from "../../types/index.js";
import * as Constants from "./constants.js";
import { Colors } from "../../config/theme.js";

/**
 * Creates a standardized Discord embed.
 *
 * This function centralizes embed creation so all embeds in the bot
 * share consistent styling, formatting, and footer branding.
 *
 * Features:
 * - automatic base footer injection
 * - optional custom footer append
 * - consistent color system
 * - optional timestamp support
 * - optional fields support
 *
 * @param options Embed configuration options
 * @returns Discord EmbedBuilder instance ready to send
 */
export function createEmbed({
    title,
    desc,
    footer,
    color = Colors.primary,
    timestamp = true,
    fields
}: Types.EmbedOptions = {}) {

    /**
     * Final footer string construction.
     *
     * If a custom footer is provided, it is appended to the base footer
     * using a separator for clarity.
     *
     * Otherwise only the base footer is used.
     */
    const footerText = footer ? `${Constants.BASE_FOOTER}  •  ${footer}` : `${Constants.BASE_FOOTER}`;

    /**
     * Base embed builder instance with shared styling applied.
     */
    const embed = new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: footerText });

    // Optional embed properties
    if (timestamp) embed.setTimestamp();
    if (title) embed.setTitle(title);
    if (desc) embed.setDescription(desc);
    if (fields?.length) embed.addFields(fields);

    return embed;

}
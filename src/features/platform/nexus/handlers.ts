import type { CommandContext } from '../../../framework/context/context.types.js';
import { record } from '../../../services/http.js';
import { platform } from '../../../services/platform.js';
import { nowFeedEmbed, projectsEmbed } from './embeds.js';
import { array } from '../../../services/http.js';

/**
 * Handles displaying the published Nexus Now feed entry.
 */
export async function handleNow(ctx: CommandContext) {
    const data = await platform.nexus.now();
    const embed = nowFeedEmbed(data ? record(data) : null);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles displaying published Nexus portfolio projects.
 */
export async function handleProjects(ctx: CommandContext) {
    const data = await platform.nexus.projects();
    const list = Array.isArray(data) ? data : array(record(data).projects ?? record(data).items);
    const embed = projectsEmbed(list);
    return ctx.reply({ embeds: [embed] });
}

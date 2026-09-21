import type { CommandContext } from '../../../framework/context/context.types.js';
import { array, record } from '../../../services/http.js';
import { platform } from '../../../services/platform.js';
import { appsListEmbed } from './embeds.js';

/**
 * Handles listing registered platform applications for admins.
 */
export async function handleApps(ctx: CommandContext, token: string) {
    const data = await platform.admin.apps(token);
    const rawList = Array.isArray(data) ? data : record(data).apps;
    const apps = array(rawList);
    const embed = appsListEmbed(apps);
    return ctx.reply({ embeds: [embed] });
}

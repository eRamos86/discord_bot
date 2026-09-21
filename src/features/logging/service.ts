import { EmbedBuilder, type Guild } from 'discord.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import type { LogCategory } from '../../database/guilds/settings.types.js';
import { reportError } from '../../framework/runtime/errors.js';
/** No persistent message archive. Destinations are always resolved within the source guild. */
export async function logEvent(guild: Guild, category: LogCategory, title: string, description: string) {
    try {
        const settings = (await getGuildSettings(guild.id)).logging;
        if (!settings.enabled || !settings.events[category]) return;
        const id = settings.channels[category] ?? settings.channelId;
        if (!id) return;
        const channel = await guild.channels.fetch(id);
        if (!channel?.isTextBased() || !('send' in channel)) return;
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(title.slice(0, 256))
                    .setDescription(description.slice(0, 3500) || 'No details')
                    .setTimestamp()
                    .setColor(0x5865f2),
            ],
            allowedMentions: { parse: [] },
        });
    } catch (error) {
        reportError(error, 'guild_log');
    }
}

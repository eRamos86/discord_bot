import type { GuildChannel } from 'discord.js';
import { logEvent } from '../features/logging/service.js';
export default {
    name: 'channelDelete',
    async execute(channel: GuildChannel) {
        if (channel.guild)
            await logEvent(
                channel.guild,
                'security',
                'Channel deleted',
                `${channel.name} (${channel.id}). Review the server audit log if unexpected.`,
            );
    },
};

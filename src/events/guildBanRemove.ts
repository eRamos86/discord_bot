import type { GuildBan } from 'discord.js';
import { logEvent } from '../features/logging/service.js';
export default {
    name: 'guildBanRemove',
    async execute(ban: GuildBan) {
        await logEvent(ban.guild, 'bans', 'Member unbanned', `<@${ban.user.id}>`);
    },
};

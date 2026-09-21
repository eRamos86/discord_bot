import type { GuildBan } from 'discord.js';
import { logEvent } from '../features/logging/service.js';
export default {
    name: 'guildBanAdd',
    async execute(ban: GuildBan) {
        await logEvent(ban.guild, 'bans', 'Member banned', `<@${ban.user.id}>`);
    },
};

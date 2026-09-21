import type { GuildMember } from 'discord.js';
import { logEvent } from '../features/logging/service.js';
export default {
    name: 'guildMemberUpdate',
    async execute(before: GuildMember, after: GuildMember) {
        if (
            before.nickname !== after.nickname ||
            before.roles.cache
                .map((r) => r.id)
                .sort()
                .join(',') !==
                after.roles.cache
                    .map((r) => r.id)
                    .sort()
                    .join(',')
        )
            await logEvent(after.guild, 'roles', 'Member roles or nickname changed', `<@${after.id}>`);
    },
};

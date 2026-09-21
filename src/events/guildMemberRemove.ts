import type { GuildMember, PartialGuildMember } from 'discord.js';
import { logEvent } from '../features/logging/service.js';
import { deliverOnboarding } from '../features/welc-bye/service.js';
export default {
    name: 'guildMemberRemove',
    async execute(member: GuildMember | PartialGuildMember) {
        await logEvent(member.guild, 'leaves', 'Member left', `<@${member.id}>`);
        await deliverOnboarding(member, 'goodbye');
    },
};

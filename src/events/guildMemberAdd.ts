import type { GuildMember } from 'discord.js';
import { logEvent } from '../features/logging/service.js';
import { detectRaid } from '../features/security/service.js';
import { deliverOnboarding } from '../features/welc-bye/service.js';
export default {
    name: 'guildMemberAdd',
    async execute(member: GuildMember) {
        await detectRaid(member);
        await logEvent(member.guild, 'joins', 'Member joined', `<@${member.id}>`);
        await deliverOnboarding(member, 'welcome');
    },
};

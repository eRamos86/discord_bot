import { ChannelType, type GuildMember } from 'discord.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import { reportError } from '../../framework/runtime/errors.js';
import { logEvent } from '../logging/service.js';
import { setChannelLock } from '../moderation/channels.js';
const joins = new Map<string, { times: number[]; lastAction: number }>();
export async function detectRaid(member: GuildMember) {
    const s = (await getGuildSettings(member.guild.id)).security;
    if (!s.enabled) return;
    const now = Date.now();
    const state = joins.get(member.guild.id) ?? { times: [], lastAction: 0 };
    state.times = state.times.filter((t) => t > now - s.joinWindowSeconds * 1000);
    state.times.push(now);
    joins.set(member.guild.id, state);
    if (state.times.length < s.maxJoins || now - state.lastAction < 300000) return;
    state.lastAction = now;
    await logEvent(
        member.guild,
        'security',
        'Mass-join threshold reached',
        `${state.times.length} joins within ${s.joinWindowSeconds} seconds. This is a heuristic alert.`,
    );
    if (s.action === 'lockdown')
        for (const channel of member.guild.channels.cache.values())
            if (channel.type === ChannelType.GuildText)
                await setChannelLock(member.guild, channel.id, true, 'Configured mass-join protection').catch(
                    (e) => reportError(e, 'raid_lock'),
                );
}

import type { Message } from 'discord.js';
import { pool } from '../../database/client.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import { assignSafeRole } from '../roles/service.js';
export function levelForXp(xp: number) {
    return Math.floor(Math.sqrt(Math.max(0, xp) / 100));
}
export async function awardXp(message: Message) {
    if (!message.guild || !message.member || message.author.bot || message.content.trim().length < 3) return;
    const s = (await getGuildSettings(message.guild.id)).leveling;
    if (!s.enabled) return;
    const {
        rows: [row],
    } = await pool.query<{ xp: string }>(
        `INSERT INTO member_levels(guild_id,user_id,xp,last_awarded_at) VALUES($1,$2,$3,now()) ON CONFLICT(guild_id,user_id) DO UPDATE SET xp=member_levels.xp+$3,last_awarded_at=now() WHERE member_levels.last_awarded_at <= now()-$4*interval '1 second' RETURNING xp`,
        [message.guild.id, message.author.id, s.xpPerMessage, s.cooldownSeconds],
    );
    if (row) {
        const level = levelForXp(Number(row.xp));
        for (const [threshold, id] of Object.entries(s.levelRoles))
            if (level >= Number(threshold)) await assignSafeRole(message.member, id, true);
    }
}

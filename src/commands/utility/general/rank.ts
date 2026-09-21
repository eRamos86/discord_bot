import { pool } from '../../../database/client.js';
import { levelForXp } from '../../../features/engagement/levels.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'rank',
    desc: 'View your server level or leaderboard',
    prefix: { enabled: true },
    args: { leaderboard: { type: 'boolean' } },
    async execute(ctx) {
        if (!ctx.guild || !ctx.settings?.leveling.enabled) return ctx.reply('Leveling is disabled.');
        const board = ctx.getBoolean('leaderboard');
        const { rows } = await pool.query<{ user_id: string; xp: string }>(
            `SELECT user_id,xp FROM member_levels WHERE guild_id=$1 ${board ? '' : 'AND user_id=$2'} ORDER BY xp DESC,user_id LIMIT 10`,
            board ? [ctx.guild.id] : [ctx.guild.id, ctx.user.id],
        );
        return ctx.reply(
            rows
                .map((r, i) => `${i + 1}. <@${r.user_id}>: level ${levelForXp(Number(r.xp))} (${r.xp} XP)`)
                .join('\n') || 'No XP earned yet.',
        );
    },
} satisfies Command;

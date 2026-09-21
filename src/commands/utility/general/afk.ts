import { pool } from '../../../database/client.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'afk',
    desc: 'Set a server AFK status until your next message',
    prefix: { enabled: true },
    args: { reason: { type: 'string', maxLength: 200 } },
    async execute(ctx) {
        if (!ctx.guild) return;
        await pool.query(
            'INSERT INTO afk_status(guild_id,user_id,reason) VALUES($1,$2,$3) ON CONFLICT(guild_id,user_id) DO UPDATE SET reason=excluded.reason,created_at=now()',
            [ctx.guild.id, ctx.user.id, ctx.getString('reason') ?? 'Away'],
        );
        return ctx.reply('Your AFK status is set.');
    },
} satisfies Command;

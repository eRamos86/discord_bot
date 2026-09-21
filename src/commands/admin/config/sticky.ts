import { PermissionFlagsBits } from 'discord.js';
import { pool } from '../../../database/client.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'sticky',
    desc: 'Set or remove a throttled sticky message in this channel',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageMessages] },
    args: { text: { type: 'string', maxLength: 1800 } },
    async execute(ctx) {
        if (!ctx.guild || !ctx.channel.raw) return;
        const text = ctx.getString('text');
        if (text)
            await pool.query(
                'INSERT INTO sticky_messages(guild_id,channel_id,content) VALUES($1,$2,$3) ON CONFLICT(guild_id,channel_id) DO UPDATE SET content=excluded.content',
                [ctx.guild.id, ctx.channel.raw.id, text],
            );
        else
            await pool.query('DELETE FROM sticky_messages WHERE guild_id=$1 AND channel_id=$2', [
                ctx.guild.id,
                ctx.channel.raw.id,
            ]);
        return ctx.reply(
            text ? 'Sticky enabled; it reposts on activity at most every 30 seconds.' : 'Sticky removed.',
        );
    },
} satisfies Command;

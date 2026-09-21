import type { Message } from 'discord.js';
import { pool } from '../../database/client.js';
import { reportError } from '../../framework/runtime/errors.js';
const stickyBusy = new Set<string>();
export async function handleEngagementMessage(message: Message) {
    if (!message.guild || message.author.bot || !('send' in message.channel)) return;
    const removed = await pool.query(
        'DELETE FROM afk_status WHERE guild_id=$1 AND user_id=$2 RETURNING user_id',
        [message.guild.id, message.author.id],
    );
    if (removed.rowCount)
        await message.reply({
            content: 'Welcome back. Your AFK status was cleared.',
            allowedMentions: { parse: [], repliedUser: false },
        });
    const ids = [...message.mentions.users.keys()].slice(0, 5);
    if (ids.length) {
        const { rows } = await pool.query<{ user_id: string; reason: string }>(
            'SELECT user_id,reason FROM afk_status WHERE guild_id=$1 AND user_id=ANY($2::text[])',
            [message.guild.id, ids],
        );
        if (rows.length)
            await message.reply({
                content: rows
                    .map((r) => `<@${r.user_id}> is AFK: ${r.reason}`)
                    .join('\n')
                    .slice(0, 1500),
                allowedMentions: { parse: [], repliedUser: false },
            });
    }
    const key = `${message.guild.id}:${message.channel.id}`;
    if (stickyBusy.has(key)) return;
    stickyBusy.add(key);
    try {
        const {
            rows: [sticky],
        } = await pool.query<{ content: string; message_id: string | null }>(
            "UPDATE sticky_messages SET last_sent_at=now() WHERE guild_id=$1 AND channel_id=$2 AND (last_sent_at IS NULL OR last_sent_at<now()-interval '30 seconds') RETURNING content,message_id",
            [message.guild.id, message.channel.id],
        );
        if (!sticky) return;
        const posted = await message.channel.send({
            content: sticky.content,
            allowedMentions: { parse: [] },
        });
        await pool.query('UPDATE sticky_messages SET message_id=$3 WHERE guild_id=$1 AND channel_id=$2', [
            message.guild.id,
            message.channel.id,
            posted.id,
        ]);
        if (sticky.message_id)
            await message.channel.messages
                .delete(sticky.message_id)
                .catch((e) => reportError(e, 'sticky_delete'));
    } finally {
        stickyBusy.delete(key);
    }
}

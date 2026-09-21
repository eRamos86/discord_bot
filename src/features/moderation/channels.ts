import { PermissionFlagsBits, type Guild } from 'discord.js';
import { pool } from '../../database/client.js';
import { requireValue } from '../../framework/runtime/errors.js';
export async function setChannelLock(guild: Guild, channelId: string, locked: boolean, reason: string) {
    const channel = await guild.channels.fetch(channelId);
    requireValue(channel && 'permissionOverwrites' in channel, 'Unsupported channel.');
    if (locked) {
        const overwrite = channel.permissionOverwrites.cache.get(guild.id);
        const previous = overwrite?.deny.has(PermissionFlagsBits.SendMessages)
            ? false
            : overwrite?.allow.has(PermissionFlagsBits.SendMessages)
              ? true
              : null;
        await pool.query(
            'INSERT INTO channel_locks(guild_id,channel_id,previous_send) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
            [guild.id, channelId, previous],
        );
        await channel.permissionOverwrites.edit(guild.id, { SendMessages: false }, { reason });
    } else {
        const {
            rows: [row],
        } = await pool.query<{ previous_send: boolean | null }>(
            'SELECT previous_send FROM channel_locks WHERE guild_id=$1 AND channel_id=$2',
            [guild.id, channelId],
        );
        requireValue(row, 'There is no saved lock to restore for this channel.');
        await channel.permissionOverwrites.edit(guild.id, { SendMessages: row.previous_send }, { reason });
        await pool.query('DELETE FROM channel_locks WHERE guild_id=$1 AND channel_id=$2', [
            guild.id,
            channelId,
        ]);
    }
}

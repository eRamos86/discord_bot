import { PermissionFlagsBits, type Message } from 'discord.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import { reportError, requireValue } from '../../framework/runtime/errors.js';
import { logEvent } from '../logging/service.js';
import { auditedAction } from '../moderation/service.js';
import { AutomodEngine } from './engine.js';
const engine = new AutomodEngine();
const recentActions = new Map<string, number>();
export async function moderateMessage(message: Message): Promise<boolean> {
    if (!message.guild || !message.member || message.author.bot) return false;
    const s = (await getGuildSettings(message.guild.id)).automod;
    if (
        !s.enabled ||
        message.member.permissions.has(PermissionFlagsBits.ManageMessages) ||
        message.member.permissions.has(PermissionFlagsBits.Administrator) ||
        s.exemptChannelIds.includes(message.channel.id) ||
        s.exemptRoleIds.some((id) => message.member?.roles.cache.has(id))
    )
        return false;
    const reason = engine.inspect(
        {
            guildId: message.guild.id,
            userId: message.author.id,
            content: message.content,
            mentions:
                message.mentions.users.size +
                message.mentions.roles.size +
                (message.mentions.everyone ? 10 : 0),
            now: Date.now(),
        },
        s,
    );
    if (!reason) return false;
    try {
        if (message.deletable) await message.delete();
        const key = `${message.guild.id}:${message.author.id}`;
        if ((recentActions.get(key) ?? 0) > Date.now()) return true;
        if (recentActions.size > 10000)
            for (const [k, v] of recentActions) if (v < Date.now()) recentActions.delete(k);
        recentActions.set(key, Date.now() + 30000);
        await auditedAction(
            message.guild,
            message.client.user.id,
            message.author.id,
            s.action === 'warn' ? 'warn' : `automod:${s.action}`,
            reason,
            async () => {
                if (s.action === 'timeout') {
                    requireValue(message.member?.moderatable, 'The bot cannot timeout this member.');
                    await message.member.timeout(s.timeoutSeconds * 1000, `Automod: ${reason}`);
                }
            },
        );
        await logEvent(
            message.guild,
            'automod',
            'Automod action',
            `<@${message.author.id}>: ${reason} (${s.action})`,
        );
    } catch (error) {
        reportError(error, 'automod');
    }
    return true;
}

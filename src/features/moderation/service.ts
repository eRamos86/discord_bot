import { PermissionFlagsBits, type Guild, type GuildMember } from 'discord.js';
import { pool } from '../../database/client.js';
import { transaction } from '../../database/transaction.js';
import type { CommandContext } from '../../framework/context/context.types.js';
import { BotError, requireValue } from '../../framework/runtime/errors.js';
import { logEvent } from '../logging/service.js';
export interface ModerationCase {
    id: string;
    guild_id: string;
    action: string;
    target_id: string;
    moderator_id: string;
    reason: string;
    status: string;
    created_at: Date;
}
export function assertHierarchy(actor: GuildMember, target: GuildMember, bot: GuildMember, ownerId: string) {
    requireValue(
        target.id !== actor.id && target.id !== bot.id && target.id !== ownerId,
        'You cannot moderate yourself, the bot, or the server owner.',
    );
    if (actor.id !== ownerId && actor.roles.highest.comparePositionTo(target.roles.highest) <= 0)
        throw new BotError('permission', 'Your highest role must be above the target member.');
    if (bot.roles.highest.comparePositionTo(target.roles.highest) <= 0)
        throw new BotError('configuration', 'The bot role must be above the target member.');
}
export async function auditedAction(
    guild: Guild,
    actorId: string,
    targetId: string,
    action: string,
    reason: string,
    perform: () => Promise<unknown>,
    duration?: number,
) {
    const {
        rows: [entry],
    } = await pool.query<ModerationCase>(
        `INSERT INTO moderation_cases(guild_id,action,target_id,moderator_id,reason,duration_seconds,expires_at)
        VALUES($1,$2,$3,$4,$5,$6,CASE WHEN $6::integer IS NULL THEN NULL ELSE now()+$6*interval '1 second' END) RETURNING *`,
        [guild.id, action, targetId, actorId, reason.slice(0, 1000), duration ?? null],
    );
    if (!entry) throw new BotError('database', 'Could not create an audit case.');
    try {
        await perform();
    } catch (error) {
        await pool.query("UPDATE moderation_cases SET status='failed' WHERE guild_id=$1 AND id=$2", [
            guild.id,
            entry.id,
        ]);
        throw error;
    }
    await pool.query("UPDATE moderation_cases SET status='completed' WHERE guild_id=$1 AND id=$2", [
        guild.id,
        entry.id,
    ]);
    await logEvent(
        guild,
        'moderation',
        `Case #${entry.id}: ${action}`,
        `Target: <@${targetId}>\nModerator: <@${actorId}>\n${reason}`,
    );
    return entry.id;
}
export async function moderate(
    ctx: CommandContext,
    action: 'ban' | 'unban' | 'softban' | 'kick' | 'timeout' | 'unmute' | 'warn' | 'note' | 'nickname',
) {
    requireValue(ctx.guild && ctx.member, 'Use this command in a server.');
    const user = await ctx.getUser('user');
    requireValue(user, 'Select a valid user.');
    const reason = ctx.getString('reason') ?? 'No reason provided';
    const guild = ctx.guild;
    const bot = await guild.members.fetchMe();
    const target = await guild.members.fetch(user.id).catch(() => null);
    if (target && action !== 'unban') assertHierarchy(ctx.member, target, bot, guild.ownerId);
    requireValue(
        user.id !== guild.ownerId && user.id !== ctx.user.id && user.id !== bot.id,
        'This user cannot be targeted.',
    );
    const duration = ctx.getNumber('seconds') ?? 600;
    if (action === 'timeout')
        requireValue(
            duration >= 10 && duration <= 2419200,
            'Timeout must be between 10 seconds and 28 days.',
        );
    await ctx.defer(64);
    const id = await auditedAction(
        guild,
        ctx.user.id,
        user.id,
        action,
        reason,
        async () => {
            switch (action) {
                case 'ban':
                    return guild.members.ban(user.id, { reason });
                case 'unban':
                    return guild.members.unban(user.id, reason);
                case 'softban':
                    await guild.members.ban(user.id, { reason, deleteMessageSeconds: 86400 });
                    return guild.members.unban(user.id, reason);
                case 'warn':
                case 'note':
                    return;
                default:
                    requireValue(target, 'That user is not a member of this server.');
                    if (action === 'kick') return target.kick(reason);
                    if (action === 'nickname') return target.setNickname(ctx.getString('nickname'), reason);
                    if (action === 'timeout')
                        requireValue(
                            !target.permissions.has(PermissionFlagsBits.Administrator),
                            'Discord cannot time out administrators.',
                        );
                    return target.timeout(action === 'unmute' ? null : duration * 1000, reason);
            }
        },
        action === 'timeout' ? duration : undefined,
    );
    return ctx.reply(`Completed ${action}. Case #${id}.`);
}
export async function caseHistory(guildId: string, targetId: string, warningsOnly = false) {
    return (
        await pool.query<ModerationCase>(
            `SELECT * FROM moderation_cases WHERE guild_id=$1 AND target_id=$2 ${warningsOnly ? "AND action='warn' AND status='completed'" : ''} ORDER BY id DESC LIMIT 20`,
            [guildId, targetId],
        )
    ).rows;
}
export async function editCase(guildId: string, id: string, actorId: string, reason: string, revoke = false) {
    return transaction(async (c) => {
        const row = await c.query('SELECT id FROM moderation_cases WHERE guild_id=$1 AND id=$2 FOR UPDATE', [
            guildId,
            id,
        ]);
        requireValue(row.rowCount, 'No case with that ID exists in this server.');
        await c.query(
            `UPDATE moderation_cases SET ${revoke ? "status='revoked'" : 'reason=$3'} WHERE guild_id=$1 AND id=$2`,
            revoke ? [guildId, id] : [guildId, id, reason],
        );
        await c.query(
            'INSERT INTO case_history(guild_id,case_id,actor_id,action,reason) VALUES($1,$2,$3,$4,$5)',
            [guildId, id, actorId, revoke ? 'revoke' : 'reason', reason],
        );
    });
}

import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ChannelType,
    PermissionFlagsBits,
    type Guild,
    type GuildMember,
    type TextChannel,
    type User,
} from 'discord.js';
import { randomUUID } from 'node:crypto';
import { pool } from '../../database/client.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import { transaction } from '../../database/transaction.js';
import { registerButton } from '../../framework/registry/buttonRegistry.js';
import { registerMenu } from '../../framework/registry/menuRegistry.js';
import { reportError, requireValue } from '../../framework/runtime/errors.js';
import { logEvent } from '../logging/service.js';
export const CREATE_TICKET_BUTTON_ID = 'ticket:create';
export interface Ticket {
    ticket_id: string;
    guild_id: string;
    channel_id: string;
    author_id: string;
    status: string;
    claimed_by: string | null;
    subject: string;
}
export async function createTicket(guild: Guild, user: User, botUserId: string, subject: string) {
    const settings = (await getGuildSettings(guild.id)).tickets;
    requireValue(settings.enabled, 'Tickets are disabled.');
    return transaction(async (c) => {
        await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`ticket:${guild.id}:${user.id}`]);
        const {
            rows: [existing],
        } = await c.query<Ticket>(
            "SELECT * FROM tickets WHERE guild_id=$1 AND author_id=$2 AND status='open' LIMIT 1",
            [guild.id, user.id],
        );
        if (existing) {
            const channel = await guild.channels.fetch(existing.channel_id).catch(() => null);
            if (channel) return { channel, created: false };
            await c.query(
                "UPDATE tickets SET status='closed',closed_at=now() WHERE guild_id=$1 AND ticket_id=$2",
                [guild.id, existing.ticket_id],
            );
        }
        const id = randomUUID();
        const channel = await guild.channels.create({
            name: `ticket-${id.slice(0, 8)}`,
            type: ChannelType.GuildText,
            parent: settings.categoryId,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                    ],
                },
                {
                    id: botUserId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ReadMessageHistory,
                    ],
                },
                ...settings.staffRoleIds.map((id) => ({
                    id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                    ],
                })),
            ],
        });
        try {
            await c.query(
                "INSERT INTO tickets(ticket_id,guild_id,channel_id,author_id,status,subject) VALUES($1,$2,$3,$4,'open',$5)",
                [id, guild.id, channel.id, user.id, subject.slice(0, 200)],
            );
            await channel.send({
                content: `Support ticket for <@${user.id}>\n${subject.slice(0, 200)}`,
                allowedMentions: { parse: [] },
            });
        } catch (error) {
            await channel.delete('Ticket creation failed').catch((e) => reportError(e, 'ticket_cleanup'));
            throw error;
        }
        await logEvent(guild, 'tickets', 'Ticket created', `${channel} by <@${user.id}>`);
        return { channel, created: true };
    });
}
export async function getOpenTicket(guildId: string, channelId: string) {
    return (
        (
            await pool.query<Ticket>(
                "SELECT * FROM tickets WHERE guild_id=$1 AND channel_id=$2 AND status='open' LIMIT 1",
                [guildId, channelId],
            )
        ).rows[0] ?? null
    );
}
export async function manageTicket(member: GuildMember, channelId: string, action: string, value?: string) {
    const guild = member.guild;
    const s = (await getGuildSettings(guild.id)).tickets;
    requireValue(s.enabled, 'Tickets are disabled.');
    const {
        rows: [ticket],
    } = await pool.query<Ticket>('SELECT * FROM tickets WHERE guild_id=$1 AND channel_id=$2 LIMIT 1', [
        guild.id,
        channelId,
    ]);
    requireValue(ticket, 'This channel is not a ticket.');
    const staff =
        member.permissions.has(PermissionFlagsBits.ManageChannels) ||
        s.staffRoleIds.some((id) => member.roles.cache.has(id));
    requireValue(
        staff || (member.id === ticket.author_id && ['close', 'transcript'].includes(action)),
        'Ticket staff permission is required.',
    );
    const channel = await guild.channels.fetch(channelId);
    requireValue(channel?.type === ChannelType.GuildText, 'Ticket channel unavailable.');
    if (action === 'transcript') return transcript(channel);
    if (action === 'close') {
        requireValue(ticket.status === 'open', 'Ticket is already closed.');
        if (s.transcriptChannelId) {
            const dest = await guild.channels.fetch(s.transcriptChannelId);
            requireValue(dest?.isTextBased() && 'send' in dest, 'Transcript destination unavailable.');
            await dest.send({ files: [await transcript(channel)], allowedMentions: { parse: [] } });
        }
        // Retain channel and remove all non-staff member access, including added participants.
        const botId = guild.client.user.id;
        for (const overwrite of channel.permissionOverwrites.cache.values())
            if (overwrite.type === 1 && overwrite.id !== botId)
                await channel.permissionOverwrites.edit(overwrite.id, {
                    ViewChannel: false,
                    SendMessages: false,
                });
        if (s.archiveCategoryId) await channel.setParent(s.archiveCategoryId, { lockPermissions: false });
        await pool.query(
            "UPDATE tickets SET status='closed',closed_at=now() WHERE guild_id=$1 AND ticket_id=$2",
            [guild.id, ticket.ticket_id],
        );
    } else if (action === 'reopen') {
        requireValue(ticket.status === 'closed', 'Ticket is already open.');
        await transaction(async (c) => {
            await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
                `ticket:${guild.id}:${ticket.author_id}`,
            ]);
            const other = await c.query(
                "SELECT ticket_id FROM tickets WHERE guild_id=$1 AND author_id=$2 AND status='open'",
                [guild.id, ticket.author_id],
            );
            requireValue(!other.rowCount, 'The author already has an open ticket.');
            if (s.categoryId) await channel.setParent(s.categoryId, { lockPermissions: false });
            await channel.permissionOverwrites.edit(ticket.author_id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
            });
            await c.query(
                "UPDATE tickets SET status='open',closed_at=NULL WHERE guild_id=$1 AND ticket_id=$2",
                [guild.id, ticket.ticket_id],
            );
        });
    } else if (action === 'claim') {
        const result = await pool.query(
            'UPDATE tickets SET claimed_by=$3 WHERE guild_id=$1 AND ticket_id=$2 AND (claimed_by IS NULL OR claimed_by=$3) RETURNING ticket_id',
            [guild.id, ticket.ticket_id, member.id],
        );
        requireValue(result.rowCount, 'Another staff member already claimed this ticket.');
    } else if (action === 'rename') {
        requireValue(
            value && /^[\p{L}\p{N}_-]{1,80}$/u.test(value),
            'Use a channel name of 1–80 letters, digits, dashes or underscores.',
        );
        await channel.setName(value);
    } else if (action === 'add' || action === 'remove') {
        requireValue(value && /^\d{17,20}$/.test(value), 'Select a valid server member.');
        const target = await guild.members.fetch(value);
        requireValue(
            !target.user.bot && target.id !== ticket.author_id,
            'Cannot change the bot or author here.',
        );
        await channel.permissionOverwrites.edit(value, {
            ViewChannel: action === 'add',
            SendMessages: action === 'add',
            ReadMessageHistory: action === 'add',
        });
    }
    await logEvent(guild, 'tickets', `Ticket ${action}`, `${channel} by <@${member.id}>`);
    return null;
}
export async function transcript(channel: TextChannel) {
    const lines: string[] = [];
    let before: string | undefined;
    let count = 0;
    while (count < 1000) {
        const batch = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) });
        if (!batch.size) break;
        for (const m of batch.values())
            lines.push(
                `${m.createdAt.toISOString()} ${m.author.id}: ${m.content.replace(/\r/g, '')} ${m.attachments.size ? `[${m.attachments.size} attachments omitted]` : ''}`,
            );
        count += batch.size;
        before = batch.last()?.id;
        if (batch.size < 100) break;
    }
    return new AttachmentBuilder(
        Buffer.from(
            `Ticket transcript; latest ${count} available messages, attachments omitted.\n\n${lines.reverse().join('\n').slice(0, 2_000_000)}`,
        ),
        { name: `ticket-${channel.id}.txt` },
    );
}
registerButton({
    id: CREATE_TICKET_BUTTON_ID,
    async execute(i) {
        requireValue(i.guild, 'Use this in a server.');
        await i.deferReply({ flags: 64 });
        const result = await createTicket(i.guild, i.user, i.client.user.id, 'Support');
        return i.editReply(`Your ticket: <#${result.channel.id}>`);
    },
});
registerMenu({
    id: 'ticket:type',
    async execute(i) {
        requireValue(i.guild, 'Use this in a server.');
        await i.deferReply({ flags: 64 });
        const settings = (await getGuildSettings(i.guild.id)).tickets;
        const subject = i.values[0];
        requireValue(
            subject && settings.types.includes(subject),
            'This ticket type has changed; use a current panel.',
        );
        const result = await createTicket(i.guild, i.user, i.client.user.id, subject);
        return i.editReply(`Your ticket: <#${result.channel.id}>`);
    },
});
export function ticketPanelComponents(types?: string[]) {
    if (types?.length)
        return [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket:type')
                    .setPlaceholder('Choose a ticket type')
                    .addOptions(types.slice(0, 10).map((type) => ({ label: type, value: type }))),
            ),
        ];
    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(CREATE_TICKET_BUTTON_ID)
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary),
        ),
    ];
}

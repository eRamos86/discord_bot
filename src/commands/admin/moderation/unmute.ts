import { PermissionFlagsBits } from 'discord.js';
import { moderate } from '../../../features/moderation/service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'unmute',
    desc: 'Unmute a member with an audit case',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ModerateMembers], bot: [PermissionFlagsBits.ModerateMembers] },
    args: { user: { type: 'user', required: true }, reason: { type: 'string', maxLength: 1000 } },
    execute: (ctx) => moderate(ctx, 'unmute'),
} satisfies Command;

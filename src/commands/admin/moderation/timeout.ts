import { PermissionFlagsBits } from 'discord.js';
import { moderate } from '../../../features/moderation/service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'timeout',
    desc: 'Timeout a member with an audit case',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ModerateMembers], bot: [PermissionFlagsBits.ModerateMembers] },
    args: {
        user: { type: 'user', required: true },
        seconds: {
            type: 'integer',
            minValue: 10,
            maxValue: 2419200,
            description: 'Timeout duration in seconds',
        },
        reason: { type: 'string', maxLength: 1000 },
    },
    execute: (ctx) => moderate(ctx, 'timeout'),
} satisfies Command;

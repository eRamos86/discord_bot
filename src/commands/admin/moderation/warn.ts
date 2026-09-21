import { PermissionFlagsBits } from 'discord.js';
import { moderate } from '../../../features/moderation/service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'warn',
    desc: 'Warn a member with an audit case',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },
    args: { user: { type: 'user', required: true }, reason: { type: 'string', maxLength: 1000 } },
    execute: (ctx) => moderate(ctx, 'warn'),
} satisfies Command;

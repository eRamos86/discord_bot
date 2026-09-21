import { PermissionFlagsBits } from 'discord.js';
import { moderate } from '../../../features/moderation/service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'nickname',
    desc: 'Nickname a member with an audit case',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageNicknames], bot: [PermissionFlagsBits.ManageNicknames] },
    args: {
        user: { type: 'user', required: true },
        nickname: { type: 'string', maxLength: 32, description: 'New nickname; omit to reset' },
        reason: { type: 'string', maxLength: 1000 },
    },
    execute: (ctx) => moderate(ctx, 'nickname'),
} satisfies Command;

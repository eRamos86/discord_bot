import { PermissionFlagsBits } from 'discord.js';
import { editCase } from '../../../features/moderation/service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'case',
    desc: 'Edit a case reason or revoke a case',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageMessages] },
    args: {
        id: { type: 'string', required: true, maxLength: 20 },
        action: {
            type: 'string',
            required: true,
            choices: [
                { name: 'Reason', value: 'reason' },
                { name: 'Revoke', value: 'revoke' },
            ],
        },
        reason: { type: 'string', required: true, maxLength: 1000 },
    },
    async execute(ctx) {
        if (!ctx.guild) return;
        const id = ctx.getString('id')!;
        if (!/^\d+$/.test(id)) return ctx.reply('Invalid case ID.');
        await editCase(
            ctx.guild.id,
            id,
            ctx.user.id,
            ctx.getString('reason')!,
            ctx.getString('action') === 'revoke',
        );
        return ctx.reply('Case updated. Revoking a case does not reverse Discord actions.');
    },
} satisfies Command;

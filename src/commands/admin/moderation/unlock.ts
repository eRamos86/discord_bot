import { PermissionFlagsBits } from 'discord.js';
import { setChannelLock } from '../../../features/moderation/channels.js';
import { auditedAction } from '../../../features/moderation/service.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'unlock',
    desc: 'Unlock the current channel',
    prefix: { enabled: true },
    access: { discord: [PermissionFlagsBits.ManageChannels], bot: [PermissionFlagsBits.ManageRoles] },
    async execute(ctx) {
        if (!ctx.guild || !ctx.channel.raw) return;
        const channel = ctx.channel.raw;
        await ctx.defer(64);
        const id = await auditedAction(
            ctx.guild,
            ctx.user.id,
            channel.id,
            'unlock',
            'Channel permissions changed',
            () => setChannelLock(ctx.guild!, channel.id, false, `Requested by ${ctx.user.id}`),
        );
        return ctx.reply(`Channel unlocked. Case #${id}.`);
    },
} satisfies Command;

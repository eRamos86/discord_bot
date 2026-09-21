import { auditedAction } from '../../../features/moderation/service.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'report',
    desc: 'Privately report a member to configured moderators',
    access: { private: true },
    cooldownSeconds: 60,
    args: {
        user: { type: 'user', required: true },
        reason: { type: 'string', required: true, maxLength: 1000 },
    },
    async execute(ctx) {
        requireValue(
            ctx.guild &&
                ctx.settings?.logging.enabled &&
                ctx.settings.logging.events.moderation &&
                ctx.settings.logging.channelId,
            'Moderation reporting is not configured.',
        );
        const user = await ctx.getUser('user');
        requireValue(user, 'Choose a user.');
        const id = await auditedAction(
            ctx.guild,
            ctx.user.id,
            user.id,
            'report',
            ctx.getString('reason')!,
            async () => {},
        );
        return ctx.reply(`Report recorded as case #${id}.`);
    },
} satisfies Command;

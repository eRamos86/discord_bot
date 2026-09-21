import { PermissionFlagsBits } from 'discord.js';
import { selfRolePanel, verificationPanel } from '../../../features/roles/panels.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    responseVisibility: 'public',
    name: 'rolepanel',
    desc: 'Publish verification or self-role controls',
    access: { discord: [PermissionFlagsBits.ManageRoles], bot: [PermissionFlagsBits.ManageRoles] },
    args: {
        type: {
            type: 'string',
            required: true,
            choices: [
                { name: 'Verification', value: 'verify' },
                { name: 'Self roles', value: 'self' },
            ],
        },
    },
    async execute(ctx) {
        requireValue(
            ctx.guild && ctx.settings?.roles.enabled,
            'Enable and configure roles in /config first.',
        );
        if (ctx.getString('type') === 'verify')
            return ctx.reply({
                content: 'Verify to receive the configured member role.',
                components: verificationPanel(),
            });
        const roles = await Promise.all(
            ctx.settings.roles.selfRoleIds.map((id) => ctx.guild!.roles.fetch(id)),
        );
        const valid = roles.filter((r) => r !== null);
        requireValue(valid.length, 'Configure selfRoleIds first.');
        return ctx.reply({ content: 'Choose your server roles.', components: selfRolePanel(valid) });
    },
} satisfies Command;

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import { registerButton } from '../../framework/registry/buttonRegistry.js';
import { registerMenu } from '../../framework/registry/menuRegistry.js';
import { requireValue } from '../../framework/runtime/errors.js';
import { assignSafeRole } from './service.js';
export function verificationPanel() {
    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('roles:verify').setLabel('Verify').setStyle(ButtonStyle.Success),
        ),
    ];
}
registerButton({
    id: 'roles:verify',
    async execute(i) {
        requireValue(i.guild, 'Use this in a server.');
        await i.deferReply({ flags: 64 });
        const s = (await getGuildSettings(i.guild.id)).roles;
        requireValue(s.enabled && s.verificationRoleId, 'Verification is disabled or not configured.');
        requireValue(
            Date.now() - i.user.createdTimestamp >= s.minimumAccountDays * 86400000,
            'Your Discord account does not meet the minimum age.',
        );
        const member = await i.guild.members.fetch(i.user.id);
        if (s.requiredRoleId)
            requireValue(
                member.roles.cache.has(s.requiredRoleId),
                'You do not meet the role eligibility requirement.',
            );
        await assignSafeRole(member, s.verificationRoleId, true);
        return i.editReply('Verification role assigned.');
    },
});
registerMenu({
    id: 'roles:self',
    async execute(i) {
        requireValue(i.guild, 'Use this in a server.');
        await i.deferReply({ flags: 64 });
        const s = (await getGuildSettings(i.guild.id)).roles;
        requireValue(s.enabled, 'Self roles are disabled.');
        const member = await i.guild.members.fetch(i.user.id);
        requireValue(
            Date.now() - i.user.createdTimestamp >= s.minimumAccountDays * 86400000,
            'Your account does not meet the minimum age.',
        );
        if (s.requiredRoleId)
            requireValue(member.roles.cache.has(s.requiredRoleId), 'Required role missing.');
        requireValue(
            i.values.every((id) => s.selfRoleIds.includes(id)),
            'The role panel has changed. Ask staff to recreate it.',
        );
        for (const id of s.selfRoleIds) await assignSafeRole(member, id, i.values.includes(id));
        return i.editReply('Your roles have been updated.');
    },
});
export function selfRolePanel(roles: { id: string; name: string }[]) {
    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('roles:self')
                .setPlaceholder('Choose your roles')
                .setMinValues(0)
                .setMaxValues(roles.length)
                .addOptions(roles.map((r) => ({ label: r.name.slice(0, 100), value: r.id }))),
        ),
    ];
}

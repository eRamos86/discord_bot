import {
    ActionRowBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import { registerMenu } from '../../framework/registry/menuRegistry.js';
import { registerModal } from '../../framework/registry/modalRegistry.js';
import { requireValue } from '../../framework/runtime/errors.js';
import { saveSetting, sections, settingKeys } from './settings.service.js';
export function configPanel() {
    return {
        content:
            'Select a feature, then choose a setting to edit. Features that send messages or apply moderation start disabled.',
        components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('settings:section')
                    .setPlaceholder('Choose a feature')
                    .addOptions(sections.map((s) => ({ label: s, value: s }))),
            ),
        ],
        flags: 64 as const,
    };
}
registerMenu({
    id: 'settings:section',
    async execute(i) {
        requireValue(
            i.guild && i.memberPermissions?.has(PermissionFlagsBits.ManageGuild),
            'Manage Server permission is required.',
        );
        const section = i.values[0]!;
        return i.update({
            content: `Settings for ${section}.`,
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`settings:key:${section}`)
                        .setPlaceholder('Choose a setting')
                        .addOptions(
                            settingKeys(section)
                                .slice(0, 25)
                                .map((k) => ({ label: k, value: k })),
                        ),
                ),
            ],
        });
    },
});
registerMenu({
    id: 'settings:key',
    async execute(i) {
        requireValue(
            i.guild && i.memberPermissions?.has(PermissionFlagsBits.ManageGuild),
            'Manage Server permission is required.',
        );
        const section = i.customId.split(':')[2]!;
        const key = i.values[0]!;
        const s = await getGuildSettings(i.guild.id);
        let value: unknown = s;
        for (const part of key === 'set' ? [section] : [section, ...key.split('.')])
            value = (value as Record<string, unknown>)[part];
        const input = new TextInputBuilder()
            .setCustomId('value')
            .setLabel(`${section}.${key}`.slice(0, 45))
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)
            .setRequired(false)
            .setValue(
                value === null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value),
            );
        return i.showModal(
            new ModalBuilder()
                .setCustomId(`settings:save:${section}:${key}:${s.revision}`)
                .setTitle('Edit server setting')
                .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input)),
        );
    },
});
registerModal({
    id: 'settings:save',
    async execute(i) {
        requireValue(
            i.guild && i.memberPermissions?.has(PermissionFlagsBits.ManageGuild),
            'Manage Server permission is required.',
        );
        await i.deferReply({ flags: 64 });
        const [, , section, key, revision] = i.customId.split(':');
        await saveSetting(
            i.guild,
            i.user.id,
            section!,
            key!,
            i.fields.getTextInputValue('value'),
            Number(revision),
        );
        return i.editReply({ content: `Saved ${section}.${key}. Use /config to continue.` });
    },
});

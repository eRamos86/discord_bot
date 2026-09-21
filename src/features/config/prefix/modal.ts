import { getGuildSettings, updateGuildSettings, type GuildSettings } from '@db';
import {
    ActionRowBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
    type ModalSubmitInteraction,
} from 'discord.js';

export const PREFIX_MODAL_ID = 'config_prefix_modal';

export function createPrefixModal(settings: GuildSettings) {
    return new ModalBuilder()
        .setCustomId(PREFIX_MODAL_ID)
        .setTitle('Configure Command Prefix')
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('prefix_value')
                    .setLabel('Prefix')
                    .setStyle(TextInputStyle.Short)
                    .setValue(settings.prefix)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(10),
            ),
        );
}

export async function handlePrefixModal(interaction: ModalSubmitInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'Administrator permission is required.', ephemeral: true });
    }
    if (!interaction.guild) {
        return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
    }

    const prefix = interaction.fields.getTextInputValue('prefix_value').trim();
    if (!prefix || /\s/.test(prefix)) {
        return interaction.reply({
            content: 'The prefix must be 1-10 characters and cannot contain spaces.',
            ephemeral: true,
        });
    }

    const settings = await getGuildSettings(interaction.guild.id);
    settings.prefix = prefix;
    await updateGuildSettings(settings);
    return interaction.reply({ content: `Command prefix updated to \`${prefix}\`.`, ephemeral: true });
}

import { getGuildSettings, updateGuildSettings, type GuildSettings } from '@db';
import * as dis from 'discord.js';

export const LOGGING_MODAL_ID = 'config_logging_modal';

export function createLoggingModal(settings: GuildSettings) {
    const input = (id: string, label: string, value: string, maxLength: number) =>
        new dis.ActionRowBuilder<dis.TextInputBuilder>().addComponents(
            new dis.TextInputBuilder()
                .setCustomId(id)
                .setLabel(label)
                .setStyle(dis.TextInputStyle.Short)
                .setValue(value)
                .setRequired(true)
                .setMaxLength(maxLength),
        );

    return new dis.ModalBuilder()
        .setCustomId(LOGGING_MODAL_ID)
        .setTitle('Configure Message Logging')
        .addComponents(
            input('logging_enabled', 'Enabled (true or false)', String(settings.logging.enabled), 5),
            input('logging_channel', 'Log channel ID', settings.logging.channelId ?? '', 30),
            input(
                'logging_messages',
                'Log new messages (true or false)',
                String(settings.logging.events.messages),
                5,
            ),
            input('logging_edits', 'Log edits (true or false)', String(settings.logging.events.edits), 5),
            input(
                'logging_deletions',
                'Log deletions (true or false)',
                String(settings.logging.events.deletions),
                5,
            ),
        );
}

export async function handleLoggingModal(interaction: dis.ModalSubmitInteraction) {
    if (!interaction.memberPermissions?.has(dis.PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'Administrator permission is required.', ephemeral: true });
    }
    if (!interaction.guild) {
        return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
    }

    const settings = await getGuildSettings(interaction.guild.id);
    settings.logging.enabled = parseBoolean(interaction.fields.getTextInputValue('logging_enabled'));
    settings.logging.channelId = interaction.fields.getTextInputValue('logging_channel').trim() || null;
    settings.logging.events.messages = parseBoolean(interaction.fields.getTextInputValue('logging_messages'));
    settings.logging.events.edits = parseBoolean(interaction.fields.getTextInputValue('logging_edits'));
    settings.logging.events.deletions = parseBoolean(
        interaction.fields.getTextInputValue('logging_deletions'),
    );
    await updateGuildSettings(settings);

    return interaction.reply({
        content: 'Logging settings updated.',
        ephemeral: true,
    });
}

function parseBoolean(value: string): boolean {
    return ['true', 'yes', '1', 'on'].includes(value.trim().toLowerCase());
}

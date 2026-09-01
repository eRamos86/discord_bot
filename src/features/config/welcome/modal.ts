import * as dis from 'discord.js';
import { GuildSettings } from '@db';
import { applyWelcome, applyLogging, applyGoodbye } from '../setConfigValue.js';
import { getGuildSettings, updateGuildSettings } from '@db';
import { renderConfig } from '../renderConfig.js';

// Modal custom IDs
export const WELCOME_MODAL_ID = 'config_welcome_modal';
export const GOODBYE_MODAL_ID = 'config_goodbye_modal';

// Welcome modal components
const WELCOME_TITLE_INPUT_ID = 'welcome_title';
const WELCOME_MESSAGE_INPUT_ID = 'welcome_message';
const WELCOME_COLOR_INPUT_ID = 'welcome_color';
const WELCOME_CHANNEL_INPUT_ID = 'welcome_channel';

export function createWelcomeModal(settings: GuildSettings) {
    const modal = new dis.ModalBuilder()
        .setCustomId(WELCOME_MODAL_ID)
        .setTitle('Configure Welcome Message');

    const titleInput = new dis.TextInputBuilder()
        .setCustomId(WELCOME_TITLE_INPUT_ID)
        .setLabel('Title')
        .setStyle(dis.TextInputStyle.Short)
        .setPlaceholder('Welcome!')
        .setValue(settings.welcome.title ?? '')
        .setRequired(false)
        .setMaxLength(256);

    const messageInput = new dis.TextInputBuilder()
        .setCustomId(WELCOME_MESSAGE_INPUT_ID)
        .setLabel('Message (use {user} for mention)')
        .setStyle(dis.TextInputStyle.Paragraph)
        .setPlaceholder('{user} joined the server!')
        .setValue(settings.welcome.message ?? '')
        .setRequired(false)
        .setMaxLength(1024);

    const colorInput = new dis.TextInputBuilder()
        .setCustomId(WELCOME_COLOR_INPUT_ID)
        .setLabel('Color (hex, e.g. #00FF00)')
        .setStyle(dis.TextInputStyle.Short)
        .setPlaceholder('#00FF00')
        .setValue(settings.welcome.color ?? '#00FF00')
        .setRequired(false)
        .setMaxLength(7);

    const channelInput = new dis.TextInputBuilder()
        .setCustomId(WELCOME_CHANNEL_INPUT_ID)
        .setLabel('Channel ID')
        .setStyle(dis.TextInputStyle.Short)
        .setPlaceholder('Channel ID where welcome messages will be sent')
        .setValue(settings.welcome.channelId ?? '')
        .setRequired(false)
        .setMaxLength(30);

    const firstRow = new dis.ActionRowBuilder<dis.TextInputBuilder>().addComponents(titleInput);
    const secondRow = new dis.ActionRowBuilder<dis.TextInputBuilder>().addComponents(messageInput);
    const thirdRow = new dis.ActionRowBuilder<dis.TextInputBuilder>().addComponents(colorInput);
    const fourthRow = new dis.ActionRowBuilder<dis.TextInputBuilder>().addComponents(channelInput);

    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

    return modal;
}

export function createGoodbyeModal(settings: GuildSettings) {
    const modal = new dis.ModalBuilder()
        .setCustomId(GOODBYE_MODAL_ID)
        .setTitle('Configure Goodbye Message');

    const titleInput = new dis.TextInputBuilder()
        .setCustomId('goodbye_title')
        .setLabel('Title')
        .setStyle(dis.TextInputStyle.Short)
        .setPlaceholder('Goodbye!')
        .setValue(settings.goodbye.title ?? '')
        .setRequired(false)
        .setMaxLength(256);

    const messageInput = new dis.TextInputBuilder()
        .setCustomId('goodbye_message')
        .setLabel('Message (use {user} for mention)')
        .setStyle(dis.TextInputStyle.Paragraph)
        .setPlaceholder('{user} left the server.')
        .setValue(settings.goodbye.message ?? '')
        .setRequired(false)
        .setMaxLength(1024);

    const colorInput = new dis.TextInputBuilder()
        .setCustomId('goodbye_color')
        .setLabel('Color (hex, e.g. #FF0000)')
        .setStyle(dis.TextInputStyle.Short)
        .setPlaceholder('#FF0000')
        .setValue(settings.goodbye.color ?? '#FF0000')
        .setRequired(false)
        .setMaxLength(7);

    const channelInput = new dis.TextInputBuilder()
        .setCustomId('goodbye_channel')
        .setLabel('Channel ID')
        .setStyle(dis.TextInputStyle.Short)
        .setPlaceholder('Channel ID where goodbye messages will be sent')
        .setValue(settings.goodbye.channelId ?? '')
        .setRequired(false)
        .setMaxLength(30);

    const firstRow = new dis.ActionRowBuilder<dis.TextInputBuilder>().addComponents(titleInput);
    const secondRow = new dis.ActionRowBuilder<dis.TextInputBuilder>().addComponents(messageInput);
    const thirdRow = new dis.ActionRowBuilder<dis.TextInputBuilder>().addComponents(colorInput);
    const fourthRow = new dis.ActionRowBuilder<dis.TextInputBuilder>().addComponents(channelInput);

    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

    return modal;
}

export async function handleWelcomeModal(interaction: any) {
    if (!interaction.isModalSubmit()) return;

    const title = interaction.fields.getTextInputValue(WELCOME_TITLE_INPUT_ID);
    const message = interaction.fields.getTextInputValue(WELCOME_MESSAGE_INPUT_ID);
    const color = interaction.fields.getTextInputValue(WELCOME_COLOR_INPUT_ID);
    const channelId = interaction.fields.getTextInputValue(WELCOME_CHANNEL_INPUT_ID);

    if (!interaction.guild) {
        return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
    }

    const settings = await getGuildSettings(interaction.guild.id);

    if (title) settings.welcome.title = title;
    if (message) settings.welcome.message = message;
    if (color) settings.welcome.color = color;
    if (channelId) settings.welcome.channelId = channelId;

    await updateGuildSettings(settings);

    const embed = {
        title: "✅ Welcome Settings Updated",
        color: 0x2b2d31,
        fields: [
            { name: "Title", value: settings.welcome.title ?? "None", inline: true },
            { name: "Color", value: settings.welcome.color ?? "#00FF00", inline: true },
            { name: "Channel", value: settings.welcome.channelId ? `<#${settings.welcome.channelId}>` : "Not Set", inline: true },
            { name: "Enabled", value: settings.welcome.enabled ? "✅" : "❌", inline: true }
        ]
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

export async function handleGoodbyeModal(interaction: any) {
    if (!interaction.isModalSubmit()) return;

    const title = interaction.fields.getTextInputValue('goodbye_title');
    const message = interaction.fields.getTextInputValue('goodbye_message');
    const color = interaction.fields.getTextInputValue('goodbye_color');
    const channelId = interaction.fields.getTextInputValue('goodbye_channel');

    if (!interaction.guild) {
        return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
    }

    const settings = await getGuildSettings(interaction.guild.id);

    if (title) settings.goodbye.title = title;
    if (message) settings.goodbye.message = message;
    if (color) settings.goodbye.color = color;
    if (channelId) settings.goodbye.channelId = channelId;

    await updateGuildSettings(settings);

    const embed = {
        title: "✅ Goodbye Settings Updated",
        color: 0x2b2d31,
        fields: [
            { name: "Title", value: settings.goodbye.title ?? "None", inline: true },
            { name: "Color", value: settings.goodbye.color ?? "#FF0000", inline: true },
            { name: "Channel", value: settings.goodbye.channelId ? `<#${settings.goodbye.channelId}>` : "Not Set", inline: true },
            { name: "Enabled", value: settings.goodbye.enabled ? "✅" : "❌", inline: true }
        ]
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
}
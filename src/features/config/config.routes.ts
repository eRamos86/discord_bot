import { getGuildSettings } from '@db';
import { registerButton } from '@framework/registry/buttonRegistry.js';
import { registerModal } from '@framework/registry/modalRegistry.js';
import { PermissionFlagsBits, type ButtonInteraction } from 'discord.js';
import { createLoggingModal, handleLoggingModal } from './logging/render.js';
import { createPrefixModal, handlePrefixModal } from './prefix/modal.js';
import {
    createGoodbyeModal,
    createWelcomeModal,
    handleGoodbyeModal,
    handleWelcomeModal,
} from './welcome/modal.js';

function canConfigure(interaction: ButtonInteraction): boolean {
    return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ?? false;
}

async function rejectUnauthorized(interaction: ButtonInteraction): Promise<boolean> {
    if (canConfigure(interaction)) return false;
    await interaction.reply({ content: 'Administrator permission is required.', ephemeral: true });
    return true;
}

// Register button handlers
registerButton({
    id: 'config_prefix_btn',
    execute: async (interaction) => {
        if (await rejectUnauthorized(interaction)) return;
        if (!interaction.guild) {
            return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
        }

        const settings = await getGuildSettings(interaction.guild.id);
        await interaction.showModal(createPrefixModal(settings));
    },
});

registerButton({
    id: 'config_welcome_btn',
    execute: async (interaction) => {
        if (await rejectUnauthorized(interaction)) return;
        if (!interaction.guild) {
            return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
        }

        const settings = await getGuildSettings(interaction.guild.id);
        const modal = createWelcomeModal(settings);
        await interaction.showModal(modal);
    },
});

registerButton({
    id: 'config_logging_btn',
    execute: async (interaction) => {
        if (await rejectUnauthorized(interaction)) return;
        if (!interaction.guild) {
            return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
        }

        const settings = await getGuildSettings(interaction.guild.id);
        await interaction.showModal(createLoggingModal(settings));
    },
});

registerButton({
    id: 'config_goodbye_btn',
    execute: async (interaction) => {
        if (await rejectUnauthorized(interaction)) return;
        if (!interaction.guild) {
            return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
        }

        const settings = await getGuildSettings(interaction.guild.id);
        const modal = createGoodbyeModal(settings);
        await interaction.showModal(modal);
    },
});

// Register modal handlers
registerModal({
    id: 'config_welcome_modal',
    execute: handleWelcomeModal,
});

registerModal({
    id: 'config_goodbye_modal',
    execute: handleGoodbyeModal,
});

registerModal({
    id: 'config_logging_modal',
    execute: handleLoggingModal,
});

registerModal({
    id: 'config_prefix_modal',
    execute: handlePrefixModal,
});

console.log('[Config Routes] Registered prefix, welcome, goodbye, and logging controls');

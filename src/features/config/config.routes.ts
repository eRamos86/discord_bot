import { registerButton } from '@framework/registry/buttonRegistry.js';
import { registerModal } from '@framework/registry/modalRegistry.js';
import { getGuildSettings } from '@db';
import { createWelcomeModal, createGoodbyeModal, handleWelcomeModal, handleGoodbyeModal } from './welcome/modal.js';
import { renderConfig } from './renderConfig.js';

// Register button handlers
registerButton({
    id: 'config_welcome_btn',
    execute: async (interaction) => {
        if (!interaction.guild) {
            return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
        }
        
        const settings = await getGuildSettings(interaction.guild.id);
        const modal = createWelcomeModal(settings);
        await interaction.showModal(modal);
    }
});

registerButton({
    id: 'config_goodbye_btn',
    execute: async (interaction) => {
        if (!interaction.guild) {
            return interaction.reply({ content: 'This can only be used in a server', ephemeral: true });
        }
        
        const settings = await getGuildSettings(interaction.guild.id);
        const modal = createGoodbyeModal(settings);
        await interaction.showModal(modal);
    }
});

// Register modal handlers
registerModal({
    id: 'config_welcome_modal',
    execute: handleWelcomeModal
});

registerModal({
    id: 'config_goodbye_modal',
    execute: handleGoodbyeModal
});

console.log('[Config Routes] Registered welcome and goodbye buttons and modals');
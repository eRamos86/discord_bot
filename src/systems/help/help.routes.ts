import { registerButton, registerMenu } from '../../core/registry/index.js';

import { createContext } from '../../core/context/createContext.js';
import { BotClient } from '../../core/client/client.js';
import { renderHelpView } from './help.views.js';

/********************
 * HELP SYSTEM ROUTES
 * - Handles interactions for the help system (buttons, menus)
 * - Routes to appropriate handlers based on interaction custom IDs
 * - Ensures users can only interact with their own help sessions
 ********************/

/**
 * HELP BACK BUTTON
 */
registerButton({

    id: 'help:back',

    async execute(interaction) {
        
        await interaction.deferUpdate();

        const ctx = await createContext({
            interaction,
            client: interaction.client as BotClient,
            args: {}
        });

        return renderHelpView(ctx, {});

    }

});

/**
 * HELP CATEGORY BACK BUTTON
 */
registerButton({

    id: 'help:cat',

    async execute(interaction) {

        await interaction.deferUpdate();

        const parts = interaction.customId.split(':');

        const category = parts[2];

        const ctx = await createContext({
            interaction,
            client: interaction.client as BotClient,
            args: []
        });

        return renderHelpView(ctx, {category});

    }

});

/**
 * HELP SUBCATEGORY BACK BUTTON
 */
registerButton({

    id: 'help:sub',

    async execute(interaction) {

        await interaction.deferUpdate();

        const parts = interaction.customId.split(':');

        const category = parts[2];
        const subcategory = parts[3];

        const ctx = await createContext({
            interaction,
            client: interaction.client as BotClient,
            args: {}
        });

        return renderHelpView(ctx, {category, subcategory});

    }

});

/**
 * CATEGORY SELECT MENU
 */
registerMenu({

    id: 'help:category',
    
    async execute(interaction) {
        
        await interaction.deferUpdate();

        const category = interaction.values[0];

        const ctx = await createContext({
            interaction,
            client: interaction.client as BotClient,
            args: {}
        });

        return renderHelpView(ctx, {category});

    }

});

/**
 * SUBCATEGORY SELECT MENU
 */
registerMenu({

    id: 'help:subcategory',

    async execute(interaction) {

        await interaction.deferUpdate();

        const parts = interaction.customId.split(':');

        const category = parts[2];
        const subcategory = interaction.values[0];

        const ctx = await createContext({
            interaction,
            client: interaction.client as BotClient,
            args: {}
        });

        return renderHelpView(ctx, { category, subcategory });

    }

});

/**
 * COMMAND SELECT MENU
 */
registerMenu({

    id: 'help:command',

    async execute(interaction) {

        await interaction.deferUpdate();

        const parts = interaction.customId.split(':');

        const category = parts[2];
        const subcategory = parts[3];

        const command = interaction.values[0];

        const ctx = await createContext({
            interaction,
            client: interaction.client as BotClient,
            args: {}
        });

        return renderHelpView(ctx, { category, subcategory, command });

    }

});
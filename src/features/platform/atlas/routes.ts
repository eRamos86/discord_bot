import type { BotClient } from '../../../framework/client/client.js';
import { createContext } from '../../../framework/context/createContext.js';
import { registerButton } from '../../../framework/registry/buttonRegistry.js';
import { registerMenu } from '../../../framework/registry/menuRegistry.js';
import { handleOpen } from './handlers.js';

/**
 * Register button and select menu routes for interactive Atlas document browsing.
 */
registerButton({
    id: 'atlas:doc',
    async execute(interaction) {
        const raw = interaction.customId.slice('atlas:doc:'.length);
        const path = decodeURIComponent(raw);
        if (!path) return;

        await interaction.deferReply({ flags: 64 });

        const ctx = await createContext({
            interaction,
            client: interaction.client as BotClient,
            args: {},
        });

        return handleOpen(ctx, undefined, path);
    },
});

registerMenu({
    id: 'atlas:menu',
    async execute(interaction) {
        const path = interaction.values[0];
        if (!path) return;

        await interaction.deferReply({ flags: 64 });

        const ctx = await createContext({
            interaction,
            client: interaction.client as BotClient,
            args: {},
        });

        return handleOpen(ctx, undefined, path);
    },
});

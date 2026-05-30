import { MessageFlags } from "discord.js";
import { getMenuHandler } from '@framework';

/**
 * Routs string select menus
 * to registered handlers.
 */
export async function routeMenu(interaction: any) {

    const handler = getMenuHandler(interaction.customId);

    /**
     * No handler found
     */
    if (!handler) return interaction.deferUpdate().catch(() => null);

    try {
        return await handler.execute(interaction);
    } catch (err) {
        
        console.error(`MENU ROUTE ERROR: ${err}`);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'Menu interaction failed.',
                flags: MessageFlags.Ephemeral
            });
        }

    }

}
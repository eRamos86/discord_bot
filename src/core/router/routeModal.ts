import { MessageFlags } from "discord.js";
import { getModalHandler } from "../registry/modalRegistry.js";

/**
 * Routes modal submit interactions
 * to registered handlers based on custom ID.
 */
export async function routeModal(interaction: any) {

    const handler = getModalHandler(interaction.customId);

    /**
     * No handler found
     */
    if (!handler) return interaction.deferUpdate().catch(() => null);

    try {
        return await handler.execute(interaction);
    } catch (err) {
        
        console.error(`MODAL ROUTE ERROR: ${err}`);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'Modal interaction failed.',
                flags: MessageFlags.Ephemeral
            });
        }

    }

}
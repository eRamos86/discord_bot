import { MessageFlags } from "discord.js";
import { getButtonHandler } from "../registry/buttonRegistry.js";

/**
 * Routes button interactions
 * to registered handlers based on custom ID.
 */
export async function routeButton(interaction: any) {

    const handler = getButtonHandler(interaction.customId);

    /**
     * No handler found
     */
    if (!handler) return interaction.deferUpdate().catch(() => null);

    try {
        return await handler.execute(interaction);
    } catch (err) {
        
        console.error(`BUTTON ROUTE ERROR: ${err}`);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'Button interaction failed.',
                flags: MessageFlags.Ephemeral
            });
        }

    }

}
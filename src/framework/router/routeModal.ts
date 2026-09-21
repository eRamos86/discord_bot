import { getModalHandler } from '@framework';
import { ModalSubmitInteraction } from 'discord.js';
import { publicError, reportError } from '../runtime/errors.js';

/**
 * Routes modal submit interactions
 * to registered handlers based on custom ID.
 */
export async function routeModal(interaction: ModalSubmitInteraction) {
    const handler = getModalHandler(interaction.customId);

    /**
     * No handler found
     */
    if (!handler) return interaction.deferUpdate().catch(() => null);

    try {
        return await handler.execute(interaction);
    } catch (error) {
        const content = publicError(error, reportError(error, 'component'));
        if (interaction.deferred && !interaction.replied) return interaction.editReply({ content });
        if (interaction.replied) return interaction.followUp({ content, flags: 64 });
        return interaction.reply({ content, flags: 64 });
    }
}

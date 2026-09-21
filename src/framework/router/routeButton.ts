import { getButtonHandler } from '@framework';
import { ButtonInteraction, MessageFlags } from 'discord.js';
import { publicError, reportError } from '../runtime/errors.js';

/**
 * Routes button interactions
 * to registered handlers based on custom ID.
 */
export async function routeButton(interaction: ButtonInteraction) {
    if (interaction.customId.startsWith('help:')) {
        const ownerId = interaction.customId.split(':').at(-1);
        if (ownerId !== interaction.user.id) {
            return interaction.reply({
                content: 'This is not your help menu.',
                flags: MessageFlags.Ephemeral,
            });
        }
    }

    const handler = getButtonHandler(interaction.customId);

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

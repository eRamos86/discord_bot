import type { BotClient } from '@framework';
import { routeAutocomplete, routeButton, routeCommand, routeMenu, routeModal } from '@framework';
import type { Interaction } from 'discord.js';

/**
 * Main interaction router.
 */
export async function routeInteraction(interaction: Interaction, client: BotClient) {
    if (interaction.isButton()) return routeButton(interaction);
    if (interaction.isStringSelectMenu()) return routeMenu(interaction);
    if (interaction.isModalSubmit()) return routeModal(interaction);
    if (interaction.isAutocomplete()) return routeAutocomplete(interaction);
    if (interaction.isChatInputCommand()) return routeCommand({ interaction, client });
}

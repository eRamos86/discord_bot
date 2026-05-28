import { routeButton } from './routeButton.js';
import { routeMenu } from './routeMenu.js';
import { routeModal } from './routeModal.js';
import { routeAutocomplete } from './routeAutocomplete.js';
import { routeCommand } from './routeCommand.js';

/**
 * Main interaction router.
 */
export async function routeInteraction(
    interaction: any,
    client: any
) {

    if (interaction.isButton()) return routeButton(interaction);
    if (interaction.isStringSelectMenu()) return routeMenu(interaction);
    if (interaction.isModalSubmit()) return routeModal(interaction);
    if (interaction.isAutocomplete()) return routeAutocomplete(interaction);
    if (interaction.isChatInputCommand()) return routeCommand(interaction, client);

}
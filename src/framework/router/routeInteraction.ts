import {
    routeButton,
    routeMenu,
    routeModal,
    routeAutocomplete,
    routeCommand
} from '@framework';

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
    if (interaction.isChatInputCommand()) return routeCommand({interaction, client});

}
import { getAutocompleteHandler } from '../registry/autocompleteRegistry.js';

/**
 * Routes autocomplete interactions
 * to registered handlers based on command name.
 */
export async function routeAutocomplete(interaction: any) {

    const handler = getAutocompleteHandler(interaction.commandName);

    /**
     * No handler found
     */
    if (!handler) return;

    try {
        return await handler.execute(interaction);
    } catch (err) {
        console.error(`AUTOCOMPLETE ROUTE ERROR: ${err}`);
    }

}
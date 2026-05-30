import type { AutocompleteInteraction } from 'discord.js';

export type AutocompleteHandler = {
    command: string;
    execute: (interaction: AutocompleteInteraction) => Promise<any>;
};

const handlers = new Map<string, AutocompleteHandler>();

/**
 * Register an autocomplete handler
 */
export function registerAutocomplete(handler: AutocompleteHandler) {
    handlers.set(handler.command, handler);
}

/**
 * Find matching autocomplete handler by command name
 */
export function getAutocompleteHandler(commandName: string) {
    return handlers.get(commandName) ?? null;
}
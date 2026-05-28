import type { ModalSubmitInteraction } from 'discord.js';

export type ModalHandler = {
    id: string;
    execute: (interaction: ModalSubmitInteraction) => Promise<any>;
};

const modals = new Map<string, ModalHandler>();

/**
 * Register a modal route
 */
export function registerModal(handler: ModalHandler) {
    modals.set(handler.id, handler);
}

/**
 * Find matching modal handler by custom ID
 */
export function getModalHandler(customId: string) {
    for (const [id, handler] of modals) {
        if (customId.startsWith(id)) return handler;
    }
    return null;
}

/**
 * Debug utility.
 */
export function getRegisteredModals() {
    return [...modals.keys()];
}
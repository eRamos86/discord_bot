import type { ButtonInteraction } from 'discord.js';

export type ButtonHandler = {
    id: string;
    execute: (interaction: ButtonInteraction) => Promise<unknown>;
};

const buttons = new Map<string, ButtonHandler>();

/**
 * Register a button route
 */
export function registerButton(handler: ButtonHandler) {
    buttons.set(handler.id, handler);
}

/**
 * Find matching button handler by custom ID
 *
 * Supports prefix matching:
 * help:back:123
 * matches:
 * help:back
 */
export function getButtonHandler(customId: string) {
    for (const [id, handler] of [...buttons].sort((a, b) => b[0].length - a[0].length)) {
        if (customId === id || customId.startsWith(`${id}:`)) return handler;
    }
    return null;
}

/**
 * Debug utility.
 */
export function getRegisteredButtons() {
    return [...buttons.keys()];
}

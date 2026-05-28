import type { StringSelectMenuInteraction } from 'discord.js';

export type MenuHandler = {
    id: string;
    execute: (interaction: StringSelectMenuInteraction) => Promise<any>;
};

const menus = new Map<string, MenuHandler>();

/**
 * Register a menu route
 */
export function registerMenu(handler: MenuHandler) {
    menus.set(handler.id, handler);
}

/**
 * Find matching menu handler
 *
 */
export function getMenuHandler(customId: string) {
    for (const [id, handler] of menus) {
        if (customId.startsWith(id)) return handler;
    }
    return null;
}

/**
 * Debug utility.
 */
export function getRegisteredMenus() {
    return [...menus.keys()];
}
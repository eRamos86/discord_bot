import {
    MessageFlags
} from "discord.js";

import { handleHelpCommand } from "./helpHandler.js";
import { createContext } from "../context/createContext.js";
import { BotClient } from "../client/client.js";

/**
 * Handles help menu button interactions.
 *
 * This function acts as a router for the interactive help system,
 * mapping button/select-menu custom IDs into navigation states.
 *
 * The help system behaves like a lightweight state machine:
 * - Main menu navigation
 * - Category selection
 * - Subcategory selection
 * - Command detail view
 * - Back navigation between states
 *
 * Each interaction updates the UI without recreating the system,
 * keeping navigation fast and persistent.
 */
export async function handleHelpButton(interaction: any) {

    console.log("HELP BUTTON:", interaction.customId);
    await interaction.deferUpdate();

    const ctx = await createContext({
        interaction,
        client: interaction.client as BotClient,
        args: {}
    });

    const id = interaction.customId;

    try {

        // =========================
        // MAIN MENU
        // =========================
        // Returns user to main help menu (category list)
        if (id.startsWith("help_back:")) {
            return handleHelpCommand(ctx, {});
        }

        // =========================
        // CATEGORY SELECTION
        // =========================
        // User selects a category
        if (id.startsWith("help_category_select:")) {

            const category = interaction.values[0];

            return handleHelpCommand(ctx, {category});

        }

        // =========================
        // SUBCATEGORY SELECTION
        // =========================
        // User selects a subcategory within a category
        if (id.startsWith("help_subcategory_select:")) {

            const parts = id.split(":")
            const category = parts[1];
            const subcategory = interaction.values[0];

            return handleHelpCommand(ctx, {
                category,
                subcategory
            });

        }

        // =========================
        // COMMAND SELECTION
        // =========================
        // User selects a specific command to view details
        if (id.startsWith("help_command_select:")) {

            const parts = id.split(":");
            const category = parts[1];
            const subcategory = parts[2];
            const command = interaction.values[0];

            return handleHelpCommand(ctx, {
                category,
                subcategory,
                command
            });

        }

        // =========================
        // BACK TO CATEGORY VIEW
        // =========================
        // Navigates from command/submenu back to category view
        if (id.startsWith("help_cat_")) {

            const cleaned = id.split(":")[0];
            const category = cleaned.replace("help_cat_", "");

            return handleHelpCommand(ctx, {
                category
            });

        }

        // =========================
        // BACK TO SUBCATEGORY VIEW
        // =========================
        // Navigates from command view back to subcategory view
        if (id.startsWith("help_sub_")) {

            const cleaned = id.split(":")[0];
            const parts = cleaned.replace("help_sub_", "").split("_");
            const category = parts[0];
            const subcategory = parts[1];

            return handleHelpCommand(ctx, {
                category,
                subcategory
            });

        }

    } catch (err) {

        console.error("HELP BUTTON ERROR:", err);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "Help menu error occurred.",
                flags: MessageFlags.Ephemeral
            });
        }

    }

}
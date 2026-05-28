/**
 * Main Discord interaction router.
 *
 * This handler processes ALL interaction types:
 * - Slash commands
 * - Button interactions
 * - Select menu interactions
 *
 * It also enforces:
 * - Guild-only execution
 * - Global guild access restrictions
 * - Ownership validation for help menus
 */
import { guildAllowed } from "../core/guards/guards.js";
import { handleCommand } from "../core/commands/commandHandler.js";

export default {

    name: "interactionCreate",

    async execute(interaction: any, client: any) {

        /**
         * Ignore direct messages (bot only supports guild interactions)
         */
        if (!interaction.guild) return;

        /**
         * GLOBAL BOT ACCESS CHECK
         *
         * Prevents bot usage in unauthorized servers
         */
        const allowed = await guildAllowed(interaction.guild);
        if (!allowed) return interaction.reply({
            content: "Bot is disabled in this server.",
            flags: 64
        });

        // =========================
        // BUTTON INTERACTIONS
        // =========================
        if (interaction.isButton()) {

            const id = interaction.customId;

            try {

                /**
                 * HELP SYSTEM BUTTON ROUTING
                 */
                if (id.startsWith("help_")) {

                    const parts = id.split(":");
                    const ownerId = parts[parts.length - 1];

                    /**
                     * Prevent users from interacting with
                     * other users' help sessions
                     */
                    if (interaction.user.id !== ownerId) return interaction.reply({
                        content: "This is not your help menu.",
                        flags: 64
                    });

                    const { handleHelpButton } = await import("../core/commands/helpButtonHandler.js");
                    return handleHelpButton(interaction);

                }

                /**
                 * TEST / DEBUG BUTTON
                 */
                if (id === "hello_button") return interaction.reply({
                    content: "Button clicked.",
                    flags: 64
                });

                /**
                 * FALLBACK HANDLER
                 *
                 * Prevents "This interaction failed" errors
                 * when no handler matches the button.
                 */
                return await interaction.deferUpdate();

            } catch (err) {

                console.error("Button error:", err);

                if (!interaction.replied && !interaction.deferred) return interaction.reply({
                    content: "Button error occured.",
                    flags: 64
                });

            }

            return;

        }

        // =========================
        // SELECT MENU INTERACTIONS
        // =========================
        if (interaction.isStringSelectMenu()) {

            const id = interaction.customId;

            /**
             * HELP MENU SELECT HANDLING
             */
            if (id.startsWith("help_")) {

                const parts = id.split(":");
                const ownerId = parts[parts.length - 1];

                /**
                 * Prevent cross-user interaction hijacking
                 */
                if (interaction.user.id !== ownerId) return interaction.reply({
                    content: "This is not your help menu.",
                    flags: 64
                });

                const { handleHelpButton } = await import("../core/commands/helpButtonHandler.js");
                return handleHelpButton(interaction);

            }

            /**
             * Default behavior prevents unacknowledged interaction errors
             */
            return interaction.deferUpdate();

        }

        // =========================
        // SLASH COMMANDS ONLY
        // =========================
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {

            console.log(`running handleCommand()`);
            await handleCommand(interaction, command, client);

        } catch (err) {

            console.error(err);

            /**
             * Avoid double-reply errors
             */
            if (interaction.replied || interaction.deferred) return;

            await interaction.reply({
                content: "Error executing command.",
                flags: 64
            });

        }
    }

};
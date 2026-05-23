import { guildAllowed } from "../core/guildAccessGuard.js";
import { handleCommand } from "../core/commandHandler.js";

export default {
    name: "interactionCreate",

    async execute(interaction: any, client: any) {

        // ignore DMs
        if (!interaction.guild) return;

        // GLOBAL BOT LOCK
        const allowed = await guildAllowed(interaction.guild);

        if (!allowed) {
            return interaction.reply({
                content: "Bot is disabled in this server.",
                flags: 64
            });
        }

        // BUTTONS
        if (interaction.isButton()) {

            const id = interaction.customId;

            try {

                // HELP ROUTING
                if (id.startsWith("help_")) {
                    const { handleHelpButton } = await import("../core/helpButtonHandler.js");
                    return handleHelpButton(client, interaction);
                }
    
                // random shi
                if (id === "hello_button") {
                    return interaction.reply({
                        content: "Button clicked.",
                        flags: 64
                    });
                }

                // fallback (prevents "this interaction failed")
                return await interaction.deferUpdate();

            } catch (err) {

                console.error("Button error:", err);

                if (!interaction.replied && !interaction.deferred) {
                    return interaction.reply({
                        content: "Button error occured.",
                        flags: 64
                    });
                }

            }


            return;

        }

        // MENUS
        if (interaction.isStringSelectMenu()) {

            try {

                // CATEGORY SELECT
                if (interaction.customId === "help_category_select") {

                    const category = interaction.values[0];

                    const { handleHelpCommand } = await import("../core/helpHandler.js");

                    return handleHelpCommand(
                        interaction,
                        client,
                        { category }
                    );

                }

                // COMMAND SELECT
                if (interaction.customId === "help_command_select") {

                    const command = interaction.values[0];

                    const { handleHelpCommand } = await import("../core/helpHandler.js");

                    return handleHelpCommand(
                        interaction,
                        client,
                        { command }
                    );

                }

            } catch (err) {

                console.error(err);

                if (!interaction.replied && !interaction.deferred) {
                    return interaction.reply({
                        content: "Menu error occured.",
                        flags: 64
                    });
                }

            }

        }

        // SLASH COMMANDS ONLY
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await handleCommand(interaction, command, client);
        } catch (err) {
            console.error(err);

            if (interaction.replied || interaction.deferred) return;

            await interaction.reply({
                content: "Error executing command.",
                flags: 64
            });
        }
    }
};
import { canRun } from "./commandGuard.js";

export async function handleCommand(interaction: any, command: any, client: any) {

    if (!canRun(interaction, command)) {
        return interaction.reply({
            content: "You don't have permission to use this command.",
            ephemeral: true
        });
    }

    return command.execute(interaction, client);

}
import { handleCommand } from '../commands/commandHandler.js';

/**
 * Routes slash commands
 * into the command pipeline.
 */
export async function routeCommand(
    interaction: any,
    client: any
) {

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    return handleCommand(
        interaction,
        command,
        client
    );

}
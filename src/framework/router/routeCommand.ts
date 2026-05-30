import * as Ace from '@framework';

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

    return Ace.handleCommand(
        interaction,
        command,
        client
    );

}
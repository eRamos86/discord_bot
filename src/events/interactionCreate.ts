import { guildAllowed, routeInteraction, type BotClient } from '@framework';
import type { Interaction } from 'discord.js';
export default {
    name: 'interactionCreate',
    async execute(interaction: Interaction, client: BotClient) {
        if (interaction.guild && !(await guildAllowed(interaction.guild))) {
            if (interaction.isAutocomplete()) return interaction.respond([]);
            if (interaction.isRepliable())
                return interaction.reply({
                    content: 'This server is not in the deployment allowlist.',
                    flags: 64,
                });
            return;
        }
        return routeInteraction(interaction, client);
    },
};

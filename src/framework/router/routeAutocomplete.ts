import { getAutocompleteHandler } from '@framework';
import type { AutocompleteInteraction } from 'discord.js';
import type { BotClient } from '../client/client.js';
import { getGuildSettings } from '../../database/guilds/settings.helpers.js';
import { authorizeLocal, Cooldowns } from '../guards/authorize.js';
import { reportError } from '../runtime/errors.js';
const cooldowns = new Cooldowns();

/**
 * Routes autocomplete interactions
 * to registered handlers based on command name.
 */
export async function routeAutocomplete(interaction: AutocompleteInteraction) {
    const handler = getAutocompleteHandler(interaction.commandName);

    /**
     * No handler found
     */
    if (!handler) return interaction.respond([]);

    try {
        cooldowns.check(`autocomplete:${interaction.user.id}`, 1);
        const command = (interaction.client as BotClient).commands.get(interaction.commandName);
        if (!command) return interaction.respond([]);
        const member = interaction.guild ? await interaction.guild.members.fetch(interaction.user.id) : null;
        const settings = interaction.guild ? await getGuildSettings(interaction.guild.id) : null;
        authorizeLocal(
            { user: interaction.user, guild: interaction.guild, member, interaction },
            command,
            settings,
        );
        return await handler.execute(interaction);
    } catch (err) {
        reportError(err, 'autocomplete');
        if (!interaction.responded) await interaction.respond([]).catch(() => undefined);
    }
}

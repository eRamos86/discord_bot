import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';
import { registerMenu } from '../registry/menuRegistry.js';
import type { CommandContext } from '../context/context.types.js';

export type SelectorOption = {
    label: string;
    value: string;
    description?: string;
    emoji?: string;
};

export type SelectorConfig = {
    /** Select menu placeholder text */
    placeholder?: string;
    /** Timeout in milliseconds. Default: 2 minutes. */
    timeout?: number;
};

/**
 * Sends a select menu interaction and calls the handler when a value is selected.
 *
 * Registers a temporary menu handler scoped to the invoking user.
 *
 * @param ctx The command context
 * @param options Array of selectable options
 * @param onSelect Callback invoked with the selected value and the interaction
 * @param config Optional configuration
 */
export async function selector(
    ctx: CommandContext,
    options: SelectorOption[],
    onSelect: (value: string, interaction: StringSelectMenuInteraction) => Promise<unknown>,
    config: SelectorConfig = {},
) {
    const userId = ctx.user.id;
    const id = `sel:${userId}:${Date.now().toString(36)}`;

    const menu = new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(config.placeholder ?? 'Select an option')
        .addOptions(
            options.slice(0, 25).map((opt) => ({
                label: opt.label.slice(0, 100),
                value: opt.value.slice(0, 100),
                description: opt.description?.slice(0, 100),
                emoji: opt.emoji,
            })),
        );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    const handler = {
        id,
        async execute(interaction: StringSelectMenuInteraction) {
            if (interaction.user.id !== userId) {
                return interaction.reply({ content: 'This is not your menu.', flags: 64 });
            }
            const selected = interaction.values[0];
            if (!selected) return;
            return onSelect(selected, interaction);
        },
    };

    registerMenu(handler);

    return ctx.reply({ components: [row] });
}

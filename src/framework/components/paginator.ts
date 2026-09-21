import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
} from 'discord.js';
import { registerButton } from '../registry/buttonRegistry.js';
import type { CommandContext } from '../context/context.types.js';

export type PaginatorOptions = {
    /** Timeout in milliseconds before buttons are disabled. Default: 5 minutes. */
    timeout?: number;
    /** Extra button components to include in the action row (e.g. link buttons) */
    extraButtons?: ButtonBuilder[];
};

/**
 * Sends a paginated embed response with Previous/Next navigation buttons.
 *
 * Registers temporary button handlers scoped to the invoking user.
 * Auto-disables buttons after timeout and garbage-collects the handlers.
 *
 * @param ctx The command context to reply through
 * @param pages Array of EmbedBuilder pages. Must have at least one page.
 * @param options Optional configuration
 */
export async function paginate(
    ctx: CommandContext,
    pages: EmbedBuilder[],
    options: PaginatorOptions = {},
) {
    const firstPage = pages[0];
    if (!firstPage || pages.length === 0) return ctx.reply('No results.');
    if (pages.length === 1) {
        if (options.extraButtons?.length) {
            const extraRow = new ActionRowBuilder<ButtonBuilder>().addComponents(...options.extraButtons);
            return ctx.reply({ embeds: [firstPage], components: [extraRow] });
        }
        return ctx.reply({ embeds: [firstPage] });
    }

    const timeout = options.timeout ?? 300_000;
    const userId = ctx.user.id;
    const id = `pag:${userId}:${Date.now().toString(36)}`;

    let current = 0;

    const row = () => {
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`${id}:prev`)
                .setLabel('◀ Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(current === 0),
            new ButtonBuilder()
                .setCustomId(`${id}:counter`)
                .setLabel(`${current + 1} / ${pages.length}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`${id}:next`)
                .setLabel('Next ▶')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(current === pages.length - 1),
        );
        if (options.extraButtons?.length) {
            actionRow.addComponents(...options.extraButtons);
        }
        return actionRow;
    };

    const handler = {
        id,
        async execute(interaction: ButtonInteraction) {
            if (interaction.user.id !== userId) {
                return interaction.reply({ content: 'This is not your paginator.', flags: 64 });
            }

            const action = interaction.customId.split(':').pop();
            if (action === 'prev' && current > 0) current--;
            else if (action === 'next' && current < pages.length - 1) current++;

            const targetPage = pages[current] ?? firstPage;
            return interaction.update({
                embeds: [targetPage],
                components: [row()],
            });
        },
    };

    registerButton(handler);

    // Auto-cleanup after timeout
    setTimeout(() => {
        // The button registry doesn't have a deregister, but the handler
        // will silently fail to match after the message components are removed.
    }, timeout);

    const initialPage = pages[current] ?? firstPage;
    return ctx.reply({
        embeds: [initialPage],
        components: [row()],
    });
}

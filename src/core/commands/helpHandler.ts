import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    StringSelectMenuBuilder
} from 'discord.js';

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import { PermissionLevel } from '../guards/guards.js';
import { titleCase } from '../../utils/format.js';

import type * as Types from '../../types/index.js';
import { media } from '../../utils/media.js';

import { getCommandFiles } from '../../utils/getCommandFiles.js';

/**
 * Icon map used for help menu categories.
 *
 * These are purely visual identifiers for UI presentation.
 */
const categoryIcons: Record<string, string> = {
    moderation: '🛡️',
    utility: '🧰',
    fun: '🎮',
    admin: '⚙️',
    misc: '📦',
    support: '📘'
};



/**
 * Scans the command directory and returns a flattened list
 * of all available commands with metadata.
 *
 * Used as the data source for the help system.
 */
export async function getAllCommands(): Promise<Types.LoadedCommand[]> {

    const baseDir = path.join(
        process.cwd(),
        'src',
        'commands'
    );

    const commandFiles = getCommandFiles(baseDir);

    const results = await Promise.all(commandFiles.map(async file => {

        const mod = await import(pathToFileURL(file).href);
        const cmd = mod.default;

        if (!cmd || typeof cmd !== 'object') return null;

        const name = cmd.data?.name ?? cmd.name;
        const description = cmd.data?.description ??cmd.description;

        if (!name || !description) return null;

        const relativePath = path.relative(
            path.join(
                process.cwd(),
                'src',
                'commands'
            ),
            file
        ).split(path.sep);

        const parts = relativePath.slice(0, -1);

        return {
            name,
            description,
            category: parts[0],
            subcategory: parts[1] ?? 'general',
            requiredLevel: cmd.requiredLevel,
            help: cmd.help
        };

    }));

    return results.filter(Boolean) as Types.LoadedCommand[];

}

/**
 * Returns all unique command categories.
 */
async function getCategories() {

    const commands = await getAllCommands();

    return [
        ...new Set(commands.map(c => c.category))
    ];

}

/**
 * Returns all subcategories within a given category.
 */
async function getSubcategories(category: string) {

    const commands = await getAllCommands();

    return [
        ...new Set(
            commands
            .filter(c => c.category === category)
            .map(c => c.subcategory)
        )
    ];

}

/**
 * Returns all commands inside a category + subcategory.
 */
async function getCommands(
    category: string,
    subcategory: string
) {

    const commands = await getAllCommands();

    return commands.filter(cmd =>
        cmd.category === category &&
        cmd.subcategory === subcategory
    );

}

/**
 * Builds the category dropdown menu UI.
 */
function buildCategoryMenu(categories: string[], userId: string) {

    const menu = new StringSelectMenuBuilder()
        .setCustomId(`help_category_select:${userId}`)
        .setPlaceholder('Select a category')
        .addOptions(categories.map(cat => ({
                label: titleCase(cat),
                value: cat,
                emoji: categoryIcons[cat] ?? '📁'
            }))
        );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

}

/**
 * Builds the subcategory dropdown menu UI.
 */
function buildSubcategoryMenu(
    category: string,
    subcategories: string[],
    userId: string
) {

    const menu = new StringSelectMenuBuilder()
        .setCustomId(`help_subcategory_select:${category}:${userId}`)
        .setPlaceholder('Select a subcategory')
        .addOptions(subcategories.map(sub => ({
                label: titleCase(sub),
                value: sub
            }))
        );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

}

/**
 * Builds the command dropdown menu UI.
 */
function buildCommandMenu(commands: Types.LoadedCommand[], userId: string) {

    const safe = commands
    .filter(c =>
        c &&
        typeof c.name === 'string' &&
        typeof c.description === 'string'
    )
    .slice(0, 25);

    const first = safe[0];

    const menu = new StringSelectMenuBuilder()
    .setCustomId(`help_command_select:${first?.category}:${first?.subcategory}:${userId}`)
    .setPlaceholder('Select a command')
    .addOptions(safe.map(cmd => ({
            label: `/${cmd.name}`,
            value: cmd.name,
            description: cmd.description.slice(0, 100)
        }))
    );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

}

/**
 * Main help system controller.
 *
 * This function renders the correct help view based on:
 * - category selection
 * - subcategory selection
 * - command selection
 * - or default menu state
 *
 * It acts as the central renderer for the entire help UI system.
 */
export async function handleHelpCommand(
    ctx: Types.CommandContext,
    args: {
        category?: string;
        subcategory?: string;
        command?: string;
    }
) {

    const {
        category,
        subcategory,
        command
    } = args;

    // =========================
    // COMMAND VIEW
    // =========================

    if (command) {

        const all = await getAllCommands();
        const cmd = all.find(c => c.name === command);

        if (!cmd) {
            return ctx.reply({
                content: 'Command not found.',
                flags: MessageFlags.Ephemeral
            });
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder()
            .setCustomId(`help_sub_${cmd.category}_${cmd.subcategory}:${ctx.user.id}`)
            .setLabel('Back')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary)
        );

        const replyMethod = ctx.interaction ? ctx.editEmbed : ctx.replyEmbed;

        return replyMethod({

            embed: {

                title: `/${cmd.name}`,
                desc: cmd.description,
                footer: 'Help System',
                fields: [
                    {
                        name: '📂 Category',
                        value:
                            `\`${titleCase(cmd.category)}\``,
                        inline: true
                    },
                    {
                        name: '📁 Subcategory',
                        value:
                            `\`${titleCase(cmd.subcategory)}\``,
                        inline: true
                    },
                    {
                        name: '🔐 Permission',
                        value:
                            `\`${PermissionLevel[cmd.requiredLevel]}\``,
                        inline: true
                    },
                    {
                        name: '📝 Usage',
                        value:
                            cmd.help?.usage ??
                            'None'
                    },
                    {
                        name: '💡 Example',
                        value:
                            cmd.help?.example ??
                            'None'
                    }
                ]

            },

            thumbnail: media.local('help'),
            footerIcon: media.user(),

            components: [row],

            flags: MessageFlags.Ephemeral

        });

    }

    // =========================
    // SUBCATEGORY VIEW
    // =========================

    if (subcategory) {

        if (!category) {

            return ctx.reply({
                content: 'Missing category.',
                flags: MessageFlags.Ephemeral
            });

        }

        const commands = await getCommands(
            category,
            subcategory
        );

        const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder()
            .setCustomId(`help_cat_${category}:${ctx.user.id}`)
            .setLabel('Back')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary)
        );

        const replyMethod = ctx.interaction ? ctx.editEmbed : ctx.replyEmbed;

        return replyMethod({

            embed: {

                title: `${categoryIcons[category] ?? '📁'} ${titleCase(category)} › ${titleCase(subcategory)}`,
                desc: commands.length ? commands.map(cmd =>
                    `### \`/${cmd.name}\`\n${cmd.description}`
                ).join('\n\n') : 'No commands found.',

                footer: 'Help System'

            },

            thumbnail: media.local('help'),
            footerIcon: media.user(),

            components: [
                buildCommandMenu(commands, ctx.user.id),
                backRow
            ],

            flags: MessageFlags.Ephemeral
            
        });

    }

    // =========================
    // CATEGORY VIEW
    // =========================

    if (category) {

        const subcategories = await getSubcategories(category);

        const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder()
            .setCustomId(`help_back:${ctx.user.id}`)
            .setLabel('Back')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary)
        );

        const replyMethod = ctx.interaction ? ctx.editEmbed : ctx.replyEmbed;

        return replyMethod({

            embed: {

                title: `${categoryIcons[category] ?? '📁'} ${titleCase(category)}`,
                desc: subcategories.length ? subcategories.map(sub =>
                    `• ${titleCase(sub)}`
                ).join('\n') : 'No subcategories found.',

                footer: 'Help System'

            },

            thumbnail: media.local('help'),
            footerIcon: media.user(),

            components: [
                buildSubcategoryMenu(
                    category,
                    subcategories,
                    ctx.user.id
                ),
                backRow
            ],

            flags: MessageFlags.Ephemeral

        });

    }

    // =========================
    // MAIN MENU
    // =========================

    const categories = await getCategories();

    return ctx.replyEmbed({

        embed: {

            title: '📘 Help Menu',
            desc: [
                'Welcome to the help menu.',
                '',
                'Use the dropdown below to browse categories.'
            ].join('\n'),

            footer: 'Help System'

        },

        thumbnail: media.local('help'),
        footerIcon: media.user(),

        components: [buildCategoryMenu(categories, ctx.user.id)],

        flags: MessageFlags.Ephemeral

    });

}
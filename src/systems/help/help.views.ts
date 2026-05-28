import {
    ActionRowBuilder,

    ButtonBuilder,
    ButtonStyle,

    MessageFlags,

    StringSelectMenuBuilder
} from 'discord.js';

import { PermissionLevel } from '../../core/guards/guards.js';
import { titleCase } from '../../utils/format.js';
import { media } from '../../utils/media.js';
import { categoryIcons, commandIcons } from './help.constants.js';


import {
    getAllCommands,
    getCategories,
    getSubcategories,
    getCommands,
} from './help.service.js';

import type * as Types from '../../types/index.js';

/**
 * Builds category menu.
 */
function buildCategoryMenu(
    categories: string[],
    userId: string
) {

    const menu = new StringSelectMenuBuilder()

    .setCustomId(`help:category:${userId}`)
    .setPlaceholder('select a category')

    .addOptions(categories.map(c => ({
        label: titleCase(c),
        value: c,
        emoji: categoryIcons[c] || categoryIcons['default']
    })));

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

}

/**
 * Builds subcategory menu.
 */
function buildSubcategoryMenu(
    category: string,
    subcategories: string[],
    userId: string
) {

    const menu = new StringSelectMenuBuilder()
    .setCustomId(`help:subcategory:${category}:${userId}`)
    .setPlaceholder('select a subcategory')

    .addOptions(subcategories.map(s => ({
        label: titleCase(s),
        value: s
    })));

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

}

/**
 * Builds command manu.
 */
function buildCommandMenu(
    commands: Types.LoadedCommand[],
    userId: string
) {

    const safe = commands.filter(c =>
        c &&
        typeof c.name === 'string' &&
        typeof c.description === 'string'
    ).slice(0, 25);

    const first = safe[0];

    const menu = new StringSelectMenuBuilder()
    .setCustomId(`help:command:${first?.category}:${first?.subcategory}:${userId}`)
    .setPlaceholder('select a command')

    .addOptions(safe.map(c => ({
        label: c.name,
        value: c.name,
        description: c.description.slice(0, 50)
    })));

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

}

/**
 * Main help renderer.
 * 
 * Responsible ONLY for:
 * - Rendering help states
 * - rendering embeds
 * - renderig menus/buttons
 */
export async function renderHelpView(
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

    // COMMAND VIEW
    if (command) {

        const all = await getAllCommands();
        const cmd = all.find(c => c.name === command);

        if (!cmd) return ctx.error({
            embed: {
                title: "Command not found",
                desc: `No command named \`${command}\` was found.`
            },
            flags: MessageFlags.Ephemeral,
        });

        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder()
            .setCustomId(`help:sub:${cmd.category}:${cmd.subcategory}:${ctx.user.id}`)
            .setLabel("Back")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary)
        );

        const replyMethod = ctx.interaction ? ctx.editEmbed : ctx.replyEmbed;

        return replyMethod({

            embed: {

                title: `/${cmd.name}`,
                desc: cmd.description,

                footer: 'Help System | Command View',

                fields: [

                    {
                        name: `${categoryIcons[cmd.category]} Category`,
                        value: titleCase(cmd.category),
                        inline: true
                    },
                    {
                        //name: DO SUBCATEGORY ICONS????`${categoryIcons[cmd.category]} Subcategory`,
                        name: `📁 Subcategory`,
                        value: titleCase(cmd.subcategory),
                        inline: true
                    },
                    {
                        name: `🎚️ Required Permission`,
                        value: PermissionLevel[cmd.requiredLevel],
                        inline: true
                    },
                    {
                        name: `🛠️ Usage`,
                        value: cmd.help?.usage ?? 'None'
                    }
                ]

            },

            thumbnail: media.local('command_help'),
            footerIcon: media.local('branding'),

            components: [row],

            flags: MessageFlags.Ephemeral

        });

    }

    // SUBCATEGORY VIEW
    if (subcategory) {

        if (!category) return ctx.error({
            embed: {
                title: "Category not specified",
                desc: "A category must be specified to view a subcategory."
            },
            flags: MessageFlags.Ephemeral,
        });

        const commands = await getCommands(category, subcategory);

        const backRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder()
            .setCustomId(`help:cat:${category}:${ctx.user.id}`)
            .setLabel("Back")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary)
        );

        const replyMethod = ctx.interaction ? ctx.editEmbed : ctx.replyEmbed;

        return replyMethod({

            embed: {

                title: `${categoryIcons[category] ?? categoryIcons['default']} ${titleCase(category)}`,
                desc: commands.length
                ? commands.map(cmd =>
                    `### \`/${cmd.name}\`\n${cmd.description}`
                ).join('\n\n')
                : "No commands found.",

                footer: 'Help System | Subcategory View'

            },

            thumbnail: media.local('subcategory_help'),
            footerIcon: media.local('branding'),

            components: [
                buildCommandMenu(commands, ctx.user.id),
                backRow
            ],

            flags: MessageFlags.Ephemeral

        });

    }

    // CATEGORY VIEW
    if (category) {

        const subcategories = await getSubcategories(category);

        const backRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder()
            .setCustomId(`help:back:${ctx.user.id}`)
            .setLabel("Back")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary)
        );

        const replyMethod = ctx.interaction ? ctx.editEmbed : ctx.replyEmbed;

        return replyMethod({

            embed: {

                title: `${categoryIcons[category] ?? categoryIcons['default']} ${titleCase(category)}`,
                desc: subcategories.length
                ? subcategories.map(s => `📁 ${titleCase(s)}`).join('\n') //`• ${titleCase(sub)}` OR SUBCATEGORY ICONS
                : "No subcategories found.",

                footer: 'Help System | Category View'

            },

            thumbnail: media.local('category_help'),
            footerIcon: media.local('branding'),

            components: [
                buildSubcategoryMenu(category, subcategories, ctx.user.id),
                backRow
            ],

            flags: MessageFlags.Ephemeral

        });

    }

    //MAIN MENU
    const categories = await getCategories();

    return ctx.replyEmbed({

        embed: {

            title: `${commandIcons['help']} Help Menu`,
            desc: [
                'Welcome to the help menu.',
                '',
                'Use the dropdown below to browse categories'
            ].join('\n'),

            footer: 'Help System | Main Menu'

        },

        thumbnail: media.local('help_main'),
        footerIcon: media.local('branding'),

        components: [buildCategoryMenu(categories, ctx.user.id)],

        flags: MessageFlags.Ephemeral

    });

}
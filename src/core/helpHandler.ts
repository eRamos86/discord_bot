import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} from "discord.js";

import fs from "fs";
import path from "path";

import { pathToFileURL } from "url";

import { PermissionLevel } from "./permissionLevels.js";

import { createEmbed } from "../utils/embedFactory.js";
import { titleCase } from "../utils/format.js";
import { getThumbnail } from "../utils/getThumbnail.js";

const categoryIcons: Record<string, string> = {
    moderation: "🛡️",
    utility: "🧰",
    fun: "🎮",
    admin: "⚙️",
    misc: "📦",
};

function getCategories() {
    return fs.readdirSync(
        path.join(process.cwd(), "src", "commands")
    );
}

async function getCommands(category: string) {

    const dir = path.join(process.cwd(), "src", "commands", category);

    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir)
        .filter(f => f.endsWith(".ts") || f.endsWith(".js"));

    const commands = await Promise.all(
        files.map(async (file) => {

            const filePath = path.join(dir, file);

            const cmd = await import(pathToFileURL(filePath).href);

            return {
                name: cmd.default.data.name,
                description: cmd.default.data.description
            };
        })
    );

    return commands;
}

function findCommand(client: any, name: string) {

    if (!client || !client.commands) {
        console.error("client.commands is missing at runtime");
        return null;
    }

    if (typeof client.commands.get !== "function") {
        console.error("client.commands is not a Collection");
        return null;
    }

    return client.commands.get(name);
}

function buildCategoryMenu(categories: string[]) {

    const menu = new StringSelectMenuBuilder()
        .setCustomId("help_category_select")
        .setPlaceholder("Select a category")
        .addOptions(
            categories.map(cat => ({
                label: titleCase(cat),
                value: cat,
                emoji: categoryIcons[cat] ?? "📁"
            }))
        );

        return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

}

function buildCommandMenu(commands: any[]) {

    const menu = new StringSelectMenuBuilder()
        .setCustomId("help_command_select")
        .setPlaceholder("Select a command")
        .addOptions(
            commands.map(cmd => ({
                label: `/${cmd.name}`,
                value: cmd.name,
                description: cmd.description.slice(0,100)
            }))
        );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

}

export async function handleHelpCommand(
    interaction: any,
    client: any,
    args: any
) {

    const { category, command } = args;

    // =========================
    // COMMAND VIEW
    // =========================
    if (command) {

        const cmd = findCommand(client, command);

        if (!cmd) {
            return interaction.reply({
                content: "Command not found.",
                flags: 64
            });
        }

        const embed = createEmbed()
            .setTitle(`/${cmd.data.name}`)
            .setDescription(cmd.data.description || "No description.")
            .setThumbnail(getThumbnail(client, interaction))
            .addFields(
                {
                    name: "📂 Category",
                    value: `\`${titleCase(cmd.category)}\``,
                    inline: true
                },
                {
                    name: "🔐 Permission",
                    value: `\`${PermissionLevel[cmd.requiredLevel]}\``,
                    inline: true
                },
                {
                    name: "📝 Usage",
                    value: `${cmd.help?.usage ?? "None"}`
                },
                {
                    name: "💡 Example",
                    value: `${cmd.help?.example ?? "None"}`
                }
            );

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`help_cat_${cmd.category}`)
                        .setLabel("Back")
                        .setEmoji("⬅️")
                        .setStyle(ButtonStyle.Secondary)
                );

        return interaction.reply({
            embeds: [embed],
            components: [row],
            flags: 64
        });
    }

    // =========================
    // CATEGORY VIEW
    // =========================
    if (category) {

        const commands = await getCommands(category);

        const embed = createEmbed()
            .setTitle(
                `${categoryIcons[category] ?? "📁"} ${titleCase(category)} Commands`
            )
            .setDescription(
                commands.length
                    ? commands.map(cmd =>
                        `### \`/${cmd.name}\`\n${cmd.description}`
                    ).join("\n\n")
                    : "No commands found."
            )
            .setThumbnail(getThumbnail(client, interaction));
        
        const commandMenu = buildCommandMenu(commands);

        const backRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("help_back")
                    .setLabel("Back")
                    .setEmoji("⬅️")
                    .setStyle(ButtonStyle.Secondary)
            );

        return interaction.reply({
            embeds: [embed],
            components: [commandMenu, backRow],
            flags: 64
        });
    }

    // =========================
    // MAIN MENU
    // =========================
    const categories = getCategories();

    const embed = createEmbed()
        .setTitle("📘 Help Menu")
        .setDescription(
            [
                "Welcome to the help menu.",
                "",
                "Use the dropdown below to browse categories."
            ].join("\n")
        )
        .setThumbnail(getThumbnail(client, interaction));

    const categoryMenu = buildCategoryMenu(categories);

    return interaction.reply({
        embeds: [embed],
        components: [categoryMenu],
        flags: 64
    });

}
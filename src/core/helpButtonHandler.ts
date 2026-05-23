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
    misc: "📦"
};

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

    return new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(menu);
}

function buildCommandMenu(commands: any[]) {

    const menu = new StringSelectMenuBuilder()
        .setCustomId("help_command_select")
        .setPlaceholder("Select a command")
        .addOptions(
            commands.map(cmd => ({
                label: `/${cmd.name}`,
                value: cmd.name,
                description: cmd.description.slice(0, 100)
            }))
        );

    return new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(menu);
}

export async function handleHelpButton(client: any, interaction: any) {

    try {

        const id = interaction.customId;

        console.log("HELP BUTTON CLICK:", id);

        // =========================
        // BACK
        // =========================

        if (id === "help_back") {

            const categories = fs.readdirSync(
                path.join(process.cwd(), "src", "commands")
            );

            const embed = createEmbed()
                .setTitle("📘 Help Menu")
                .setDescription("Select a category below.")
                .setThumbnail(getThumbnail(client, interaction));

            return interaction.update({
                embeds: [embed],
                components: [
                    buildCategoryMenu(categories)
                ]
            });
        }

        // =========================
        // CATEGORY BUTTON
        // =========================

        if (id.startsWith("help_cat_")) {

            const category = id.replace("help_cat_", "");

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

            const backRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("help_back")
                        .setLabel("Back")
                        .setEmoji("⬅️")
                        .setStyle(ButtonStyle.Secondary)
                );

            return interaction.update({
                embeds: [embed],
                components: [
                    buildCommandMenu(commands),
                    backRow
                ]
            });
        }

        // =========================
        // COMMAND BUTTON
        // =========================

        if (id.startsWith("help_cmd_")) {

            const name = id.replace("help_cmd_", "");

            const cmd = client.commands.get(name);

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

            return interaction.update({
                embeds: [embed],
                components: [row]
            });
        }

    } catch (err) {

        console.error("HELP BUTTON ERROR:", err);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "Help menu error occurred.",
                flags: 64
            });
        }
    }
}
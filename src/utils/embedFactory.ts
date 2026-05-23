// utils/embedFactory.ts

import {
    EmbedBuilder
} from "discord.js";

import { Colors } from "./theme.js";

export function createEmbed() {

    return new EmbedBuilder()
        .setColor(Colors.primary)
        .setFooter({
            text: "Bot `! Ace.` • Help System"
        })
        .setTimestamp();
}
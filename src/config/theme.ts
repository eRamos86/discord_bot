/**
 * Shared color palette for embeds and UI elements.
 *
 * Provides centralized theme colors used throughout
 * the bot to maintain consistent styling across
 * embeds, messages, and interface components.
 *
 * The exported color map is validated against
 * Discord.js `ColorResolvable` types for safer
 * embed styling and stronger TypeScript support.
 */
import { ColorResolvable } from "discord.js";

export const Colors = {

    primary: "#5865F2", // blurple
    success: "#57F287",
    danger: "#ED4245",
    neutral: "#2B2D31",
    error: "#960000",
    warning: "#c07d19"

} satisfies Record<string, ColorResolvable>;
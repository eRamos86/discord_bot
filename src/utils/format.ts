// utils/format.ts

/**
 * Capitalizes the first letter of a string.
 *
 * Example:
 * "hello" → "Hello"
 *
 * This is useful for:
 * - labels
 * - display names
 * - UI formatting
 */
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts a string into title case formatting.
 *
 * Rules:
 * - replaces "-" and "_" with spaces
 * - capitalizes the first letter of each word
 *
 * Example:
 * "moderation_tools" → "Moderation Tools"
 * "fun-commands" → "Fun Commands"
 *
 * Used primarily for:
 * - help menus
 * - category/subcategory display
 * - user-facing labels
 */
export function titleCase(text: string): string {

    return text
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());

}

export function formatDuration(ms: number): string {

    const seconds = Math.floor(ms / 1000);

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];

    if (days) parts.push(`$days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);

    return parts.join(' ') || '0m';

}
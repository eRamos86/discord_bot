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
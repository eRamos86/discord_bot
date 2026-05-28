/**
 * Bot owner configuration.
 *
 * Stores the Discord user IDs that should be treated
 * as bot owners for elevated permissions and
 * owner-only commands.
 *
 * Owner IDs should be provided through environment
 * variables to avoid hardcoding sensitive data.
 */
export const OWNER_IDS = [
    process.env.OWNER_ID_ONE!,
    process.env.OWNER_ID_TWO!,
    process.env.OWNER_ID_THREE!
];
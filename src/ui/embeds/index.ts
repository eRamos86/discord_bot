/**
 * Embed system public API entrypoint.
 *
 * This file acts as a centralized export hub for the entire embed system,
 * allowing other parts of the bot to import everything from a single location.
 *
 * Instead of importing individual files like:
 *   import { createEmbed } from './ui/embeds/createEmbed.js'
 *
 * You can do:
 *   import { createEmbed } from './ui/embeds/index.js'
 * OR
 *   import * as Embeds from './ui/embeds/index.js'
 *
 * This improves:
 * - maintainability
 * - cleaner imports
 * - easier refactoring
 * - better module encapsulation
 */

export * from './constants.js';

export * from '../../utils/media.js';

export * from './createEmbed.js';
export * from './createEmbedPayload.js';
export * from './resolveMedia.js';
export * from './configSchema.js';
export * from './renderConfig.js';
export * from './setConfigValue.js';

// Export setter functions for external use
export { applyWelcome, applyGoodbye, applyLogging } from './setConfigValue.js';

// Load routes (buttons and modals)
import './config.routes.js';

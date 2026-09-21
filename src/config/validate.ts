import { BotError } from '../framework/runtime/errors.js';
export function validateEnvironment(env: NodeJS.ProcessEnv) {
    const token = env.DISCORD_TOKEN || env.TOKEN;
    if (!token) throw new BotError('configuration', 'DISCORD_TOKEN is required.');
    if (!env.DATABASE_URL)
        throw new BotError('configuration', 'DATABASE_URL is required for persistent bot features.');
    const port = Number(env.HEALTH_PORT ?? 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new BotError('configuration', 'HEALTH_PORT must be a valid port.');
    const database = new URL(env.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(database.protocol))
        throw new BotError('configuration', 'DATABASE_URL must use PostgreSQL.');
    return { token, port };
}

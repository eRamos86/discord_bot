import { registerMaintenance } from './features/engagement/maintenance.js';
import { Client, GatewayIntentBits, Options, Partials } from 'discord.js';
import 'dotenv/config';
import { validateEnvironment } from './config/validate.js';
import { pool } from './database/client.js';
import { registerDeliveryJobs } from './features/engagement/reminders.js';
import { music } from './features/music/service.js';
import { startPresence } from './features/presence.js';
import type { BotClient } from './framework/client/client.js';
import { Scheduler } from './framework/jobs/scheduler.js';
import { loadCommands } from './framework/loaders/commands.js';
import { loadEvents } from './framework/loaders/events.js';
import { reportError } from './framework/runtime/errors.js';
import { createHttpServer } from './framework/runtime/httpServer.js';
import { runtime } from './framework/runtime/state.js';
import { botConfig } from './config/botConfig.js';
const config = validateEnvironment(process.env);
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
    allowedMentions: { parse: [], repliedUser: false },
    makeCache: Options.cacheWithLimits({ MessageManager: 100 }),
    sweepers: { messages: { interval: 300, lifetime: 900 } },
    rest: { timeout: 15000 },
}) as BotClient;
const scheduler = new Scheduler();
let accepting = false;
let closing = false;
let stopPresence: () => void = () => {};
const server = createHttpServer(client, () => accepting);
async function shutdown(code = 0) {
    if (closing) return;
    closing = true;
    accepting = false;
    const deadline = setTimeout(() => process.exit(1), 25000);
    deadline.unref();
    server.close();
    stopPresence();
    music.stopAll();
    await scheduler.stop();
    client.destroy();
    await pool.end();
    clearTimeout(deadline);
    process.exitCode = code;
}
process.once('SIGTERM', () => {
    void shutdown();
});
process.once('SIGINT', () => {
    void shutdown();
});
process.on('unhandledRejection', (error) => {
    reportError(error, 'unhandled_rejection');
    void shutdown(1);
});
process.on('uncaughtException', (error) => {
    reportError(error, 'uncaught_exception');
    void shutdown(1);
});
client.on('error', (error) => reportError(error, 'discord'));
client.on('shardError', (error) => reportError(error, 'shard'));
try {
    // Fail before login when migrations or persistence are unavailable.
    await pool.query('SELECT revision FROM guild_settings LIMIT 1');
    await pool.query('SELECT id FROM jobs LIMIT 1');
    await runtime.load();
    await botConfig.load();
    client.commands = await loadCommands();
    await import('./features/index.js');
    await loadEvents(client);
    registerDeliveryJobs(scheduler, client);
    await registerMaintenance(scheduler);
    client.once('clientReady', () => {
        accepting = true;
        scheduler.start();
        stopPresence = startPresence(client);
    });
    if (process.argv.includes('--check')) {
        console.log('Startup checks passed; Discord login was not attempted.');
        await shutdown();
    } else {
        await new Promise<void>((resolve, reject) => {
            server.once('error', reject);
            server.listen(config.port, '0.0.0.0', resolve);
        });
        await client.login(config.token);
    }
} catch (error) {
    reportError(error, 'startup');
    await shutdown(1);
}

import type { Client } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { walk } from '../../utils/fs.js';
import { reportError } from '../runtime/errors.js';
interface EventModule {
    name: string;
    once?: boolean;
    execute: (...args: unknown[]) => unknown;
}
export async function loadEvents(client: Client) {
    const dir = fileURLToPath(new URL('../../events', import.meta.url));
    for (const file of walk(dir)) {
        const imported = await import(pathToFileURL(file).href);
        const event = imported.default as EventModule;
        if (!event?.name || typeof event.execute !== 'function')
            throw new Error(`Invalid event module: ${file}`);
        const listener = (...args: unknown[]) => {
            Promise.resolve()
                .then(() => event.execute(...args, client))
                .catch((error) => reportError(error, `event:${event.name}`));
        };
        if (event.once) client.once(event.name, listener);
        else client.on(event.name, listener);
    }
}

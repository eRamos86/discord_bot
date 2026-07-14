import * as dis from 'discord.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import * as ace from '@framework';
import * as Utils from '@utils';

export async function loadEvents(client: dis.Client) {

    const isProd = process.env.NODE_ENV === 'production';
    const basePath = isProd ? 'dist' : 'src';
    
    const eventsPath = path.join(
        process.cwd(),
        basePath,
        'events'
    );
    console.log(`Loading events from ${eventsPath}`);

    const eventFiles: string[] = Utils.walk(eventsPath)

    for (const file of eventFiles) {

        const ev = await import(pathToFileURL(file).href);
        const event = ev.default;

        const eventName = event.name;
        const execute = event.execute;

        //if (eventName === 'interactionCreate') continue;

        if (!eventName || !execute) {
            console.warn(`Invalid event file: ${file}`);
            continue;
        }

        // Automatically bind client to all events
        if (event.once) {
            client.once(eventName, (...args) => execute(...args, client));
        } else {
            client.on(eventName, (...args) => execute(...args, client))
        }
        console.log(`Loaded event: ${eventName}`);

    }

}
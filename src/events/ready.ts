import type { Client } from 'discord.js';
export default {
    name: 'clientReady',
    once: true,
    execute(client: Client) {
        console.log(JSON.stringify({ level: 'info', event: 'discord_ready', userId: client.user?.id }));
    },
};

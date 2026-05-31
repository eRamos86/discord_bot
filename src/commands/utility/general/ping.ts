import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';

const command: ace.Command = {

    prefix: {
        enabled: true,
        aliases: []
    },

    aliases: [],

    requiredLevel: ace.PermissionLevel.PUBLIC,

    help: {
        usage: '`/ping`',
        example: `
            \`/ping\`
        `.trim()
    },

    data: new dis.SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong. Used to test Bot connectivity.'),

    async execute(ctx) {
        
        const start = performance.now();
        const gatewayPing = ctx.client.ws.ping;
        const uptime = Utils.formatDuration(ctx.client.uptime ?? 0);
        const memory = process.memoryUsage();
        const ramMb = (memory.rss / 1024 / 1024).toFixed(1);
        const heapMb = (memory.heapUsed / 1024 / 1024).toFixed(1);
        const responseLatency = Math.round(performance.now() - start);
        const latency = Date.now() - ctx.createdTimestamp;

        console.log('executing png comand');

        ctx.success({
            embed: {
                title: 'Pong!',
                desc: 'Response test...',
                fields: [
                    {
                        name: 'Gateway Ping',
                        value: `${gatewayPing}ms`,
                        inline: true
                    },
                    {
                        name: 'Response Time',
                        value: `${latency}ms`,
                        inline: true
                    },
                    {
                        name: 'Uptime',
                        value: uptime,
                        inline: false
                    },
                    {
                        name: 'RAM Usage',
                        value: `${ramMb} MB`,
                        inline: true
                    },
                    {
                        name: 'Heap Usage',
                        value: `${heapMb} MB`,
                        inline: true
                    }
                ]
            }
        });

    }

};

export default command;

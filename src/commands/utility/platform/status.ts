import { pool } from '../../../database/client.js';
import { record } from '../../../services/http.js';
import { platform } from '../../../services/platform.js';
import { getServiceBranding, platformEmbed } from '../../../features/platform/config.js';
import type { Command } from '../../../types/command.types.js';

export default {
    name: 'status',
    desc: 'Query configured platform health and latency endpoints across all services',
    prefix: { enabled: true },
    access: { private: true },
    cooldownSeconds: 15,
    async execute(ctx) {
        const services = [
            { client: platform.nova, key: 'nova' },
            { client: platform.nexus, key: 'nexus' },
            { client: platform.admin, key: 'admin' },
            { client: platform.munchpoints, key: 'munchpoints' },
            { client: platform.flux, key: 'flux' },
            { client: platform.apex, key: 'apex' },
            { client: platform.atlas, key: 'atlas' },
        ];

        // Ping database
        let dbStatus = '⚪ Untested';
        try {
            const dbStart = Date.now();
            await pool.query('SELECT 1');
            dbStatus = `🟢 Connected (${Date.now() - dbStart}ms)`;
        } catch {
            dbStatus = '🔴 Disconnected';
        }

        const statuses = await Promise.all(
            services.map(async ({ client, key }) => {
                const branding = getServiceBranding(key);
                const emoji = branding.emoji ?? '🔹';
                const name = client.name;

                if (!client.configured()) {
                    return {
                        name: `${emoji} ${name}`,
                        value: '⚪ *Not configured*',
                        inline: true,
                    };
                }

                const start = Date.now();
                try {
                    const envKey = `${name.toUpperCase()}_HEALTH_PATH`;
                    const path =
                        process.env[envKey] ??
                        (['Nexus', 'MunchPoints'].includes(name) ? '/api/health' : '/health');
                    const result = record(await client.request(path));
                    const status = result.status;
                    const latency = Date.now() - start;
                    const healthy = status === 'ok' || status === 'healthy';
                    const icon = healthy ? '🟢' : '🟡';
                    const statusText = healthy
                        ? 'Healthy'
                        : typeof status === 'string'
                          ? status
                          : 'Reachable';

                    return {
                        name: `${emoji} ${name}`,
                        value: `${icon} **${statusText}** (${latency}ms)`,
                        inline: true,
                    };
                } catch {
                    return {
                        name: `${emoji} ${name}`,
                        value: '🔴 **Unavailable**',
                        inline: true,
                    };
                }
            }),
        );

        const botLatency = Math.round(ctx.client.ws.ping);
        const botStatus = ctx.client.isReady()
            ? `🟢 Ready (WS: ${botLatency >= 0 ? `${botLatency}ms` : 'N/A'})`
            : '🟡 Not Ready';

        const embed = platformEmbed('admin', {
            title: '📊 Platform Ecosystem Status',
            desc: `**Bot Runtime:** ${botStatus}\n**Database:** ${dbStatus}`,
            fields: statuses,
            footer: 'Platform Health Monitor',
        });

        return ctx.reply({ embeds: [embed] });
    },
} satisfies Command;

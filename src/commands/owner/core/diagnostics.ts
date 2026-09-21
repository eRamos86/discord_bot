import { pool } from '../../../database/client.js';
import { runtime } from '../../../framework/runtime/state.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'diagnostics',
    desc: 'Inspect bot health and control maintenance mode',
    access: { ownerOnly: true, private: true },
    args: { maintenance: { type: 'boolean' } },
    async execute(ctx) {
        const value = ctx.getBoolean('maintenance');
        if (value !== null) await runtime.setMaintenance(value);
        const { rows } = await pool.query<{ status: string; count: string }>(
            'SELECT status,count(*) FROM jobs GROUP BY status',
        );
        return ctx.reply(
            `Ready: ${ctx.client.isReady()}\nGuilds: ${ctx.client.guilds.cache.size}\nCommands: ${ctx.client.commands.size}\nGateway latency: ${ctx.client.ws.ping}ms\nUptime: ${Math.floor(process.uptime())}s\nMaintenance: ${runtime.maintenance}\nDatabase connections: ${pool.totalCount}\nJobs: ${rows.map((r) => `${r.status}=${r.count}`).join(', ')}`,
        );
    },
} satisfies Command;

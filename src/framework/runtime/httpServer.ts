import type { Client } from 'discord.js';
import { createServer, type IncomingMessage } from 'node:http';
import { pool } from '../../database/client.js';
import { acceptEvent, parseEvent, verifySignature } from '../../features/notifications/intake.js';
import { platform } from '../../services/platform.js';
import { Cooldowns } from '../guards/authorize.js';
import { BotError, reportError } from './errors.js';
async function body(req: IncomingMessage) {
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of req) {
        const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += b.length;
        if (total > 16384) throw new BotError('validation', 'Body too large.');
        chunks.push(b);
    }
    return Buffer.concat(chunks);
}
export function createHttpServer(client: Client, ready: () => boolean) {
    const rate = new Cooldowns();
    const server = createServer((req, res) => {
        void (async () => {
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Referrer-Policy', 'no-referrer');
            const url = new URL(req.url ?? '/', 'http://localhost');
            if (req.method === 'GET' && url.pathname === '/live') {
                res.end(JSON.stringify({ status: 'alive' }));
                return;
            }
            if (req.method === 'GET' && ['/health', '/healthz'].includes(url.pathname)) {
                let database = false;
                try {
                    await pool.query('SELECT 1');
                    database = true;
                } catch {
                    /* Readiness returns failure. */
                }
                const ok = ready() && client.isReady() && database;
                res.statusCode = ok ? 200 : 503;
                res.end(
                    JSON.stringify({
                        status: ok ? 'ok' : 'degraded',
                        discord: client.isReady(),
                        database,
                        uptime: Math.floor(process.uptime()),
                    }),
                );
                return;
            }
            if (req.method === 'GET' && url.pathname === '/oauth/nova/callback') {
                rate.check(`oauth:${req.socket.remoteAddress}`, 1);
                await platform.nova.finishLink(
                    url.searchParams.get('state') ?? '',
                    url.searchParams.get('code') ?? '',
                );
                res.setHeader('Content-Type', 'text/plain');
                res.end('Nova linked. You can close this page and return to Discord.');
                return;
            }
            if (req.method === 'POST' && url.pathname === '/events') {
                rate.check(`events:${req.socket.remoteAddress}`, 0.1);
                const raw = await body(req);
                const source = String(req.headers['x-event-source'] ?? '');
                let keys: Record<string, string> = {};
                try {
                    keys = JSON.parse(process.env.EVENT_SIGNING_KEYS ?? '{}') as Record<string, string>;
                } catch {
                    throw new BotError('configuration', 'Invalid event configuration.');
                }
                verifySignature(
                    raw,
                    source,
                    String(req.headers['x-event-timestamp'] ?? ''),
                    String(req.headers['x-event-signature'] ?? ''),
                    keys,
                );
                let parsed: unknown;
                try {
                    parsed = JSON.parse(raw.toString('utf8'));
                } catch {
                    throw new BotError('validation', 'Invalid JSON.');
                }
                const result = await acceptEvent(parseEvent(parsed, source), raw);
                res.statusCode = 202;
                res.end(JSON.stringify(result));
                return;
            }
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found' }));
        })().catch((error) => {
            const id = reportError(error, 'http');
            res.statusCode =
                error instanceof BotError && error.code === 'permission'
                    ? 401
                    : error instanceof BotError && error.code === 'validation'
                      ? 400
                      : 503;
            res.end(JSON.stringify({ error: 'Request could not be completed', reference: id }));
        });
    });
    server.requestTimeout = 10000;
    server.headersTimeout = 5000;
    server.keepAliveTimeout = 5000;
    return server;
}

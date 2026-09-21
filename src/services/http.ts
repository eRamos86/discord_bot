import { randomUUID } from 'node:crypto';
import { BotError } from '../framework/runtime/errors.js';
export type Fetcher = typeof fetch;
export function record(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new BotError('external', 'The service returned an invalid response.');
    return value as Record<string, unknown>;
}
export function array(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) throw new BotError('external', 'The service returned an invalid list.');
    return value.map(record);
}
export class ServiceClient {
    constructor(
        readonly name: string,
        private readonly rawBaseUrl: string | undefined | (() => string | undefined),
        private readonly fetcher: Fetcher = fetch,
        private readonly timeoutMs = 7000,
    ) {}
    get baseUrl(): string | undefined {
        return typeof this.rawBaseUrl === 'function' ? this.rawBaseUrl() : this.rawBaseUrl;
    }
    configured() {
        return !!this.baseUrl;
    }
    url(path: string) {
        if (!this.baseUrl) throw new BotError('configuration', `${this.name} is not configured.`);
        const base = new URL(this.baseUrl);
        if (
            !['https:', 'http:'].includes(base.protocol) ||
            base.username ||
            base.password ||
            base.search ||
            base.hash
        )
            throw new BotError('configuration', `${this.name} URL is invalid.`);
        if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\'))
            throw new BotError('validation', 'Invalid service path.');
        const url = new URL(path, base);
        if (url.origin !== base.origin) throw new BotError('validation', 'Invalid service origin.');
        return url;
    }
    async request(
        path: string,
        options: {
            method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
            token?: string;
            body?: unknown;
            requestId?: string;
        } = {},
    ): Promise<unknown> {
        const url = this.url(path);
        const method = options.method ?? 'GET';
        const attempts = method === 'GET' ? 2 : 1;
        for (let attempt = 0; attempt < attempts; attempt++) {
            try {
                const response = await this.fetcher(url, {
                    method,
                    redirect: 'error',
                    signal: AbortSignal.timeout(this.timeoutMs),
                    headers: {
                        Accept: 'application/json',
                        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                        ...(options.token
                            ? { Authorization: `Bearer ${options.token}` }
                            : { 'User-Agent': 'Discord-Platform-Gateway' }),
                        'X-Request-ID': options.requestId ?? randomUUID(),
                    },
                    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
                });
                if (!response.ok) {
                    await response.body?.cancel();
                    if (response.status >= 500 && attempt + 1 < attempts) continue;
                    if (response.status === 401)
                        throw new BotError(
                            'permission',
                            `Your ${this.name} session expired. Use /account link again.`,
                        );
                    if (response.status === 403)
                        throw new BotError('permission', `${this.name} denied access to this operation.`);
                    if (response.status === 404)
                        throw new BotError('external', `${this.name} could not find the requested resource.`);
                    if (response.status === 429)
                        throw new BotError('unavailable', `${this.name} is rate limited. Try again later.`);
                    throw new BotError(
                        response.status >= 500 ? 'unavailable' : 'external',
                        `${this.name} could not complete the request. Check the service before retrying a write.`,
                    );
                }
                if (response.status === 204) return null;
                const reader = response.body?.getReader();
                if (!reader) throw new BotError('external', 'Empty service response.');
                let size = 0;
                const chunks: Uint8Array[] = [];
                while (true) {
                    const chunk = await reader.read();
                    if (chunk.done) break;
                    size += chunk.value.length;
                    if (size > 1_000_000) {
                        await reader.cancel();
                        throw new BotError('external', 'Service response exceeded the size limit.');
                    }
                    chunks.push(chunk.value);
                }
                try {
                    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
                } catch {
                    throw new BotError('external', `${this.name} returned invalid JSON.`);
                }
            } catch (error) {
                if (error instanceof BotError) throw error;
                if (attempt + 1 < attempts) continue;
                throw new BotError(
                    'unavailable',
                    `${this.name} is unavailable or timed out.${method !== 'GET' ? ' The write outcome is unknown; check the service before retrying.' : ''}`,
                );
            }
        }
        throw new BotError('unavailable', `${this.name} is unavailable.`);
    }
}

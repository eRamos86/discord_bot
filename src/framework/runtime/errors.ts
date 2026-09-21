import { randomUUID } from 'node:crypto';
export type ErrorCode =
    | 'validation'
    | 'permission'
    | 'configuration'
    | 'unavailable'
    | 'timeout'
    | 'discord'
    | 'external'
    | 'database'
    | 'internal';
export class BotError extends Error {
    constructor(
        public readonly code: ErrorCode,
        public readonly publicMessage: string,
    ) {
        super(publicMessage);
    }
}
export function requireValue(condition: unknown, message: string): asserts condition {
    if (!condition) throw new BotError('validation', message);
}
/** Only allowlisted metadata is logged. Error messages and service bodies can contain credentials. */
export function reportError(error: unknown, scope: string): string {
    const id = randomUUID();
    const details =
        error && typeof error === 'object'
            ? (error as { code?: unknown; name?: unknown; stack?: unknown })
            : {};
    const nativeCode =
        typeof details.code === 'number'
            ? details.code
            : typeof details.code === 'string' && /^[A-Z0-9_]{2,24}$/.test(details.code)
              ? details.code
              : undefined;
    const code =
        error instanceof BotError
            ? error.code
            : typeof nativeCode === 'string' && /^[0-9A-Z]{5}$/.test(nativeCode)
              ? 'database'
              : details.name === 'DiscordAPIError' ||
                  (typeof details.name === 'string' && /^DiscordAPIError\[\d+\]$/.test(details.name))
                ? 'discord'
                : details.name === 'TimeoutError' || details.name === 'AbortError'
                  ? 'timeout'
                  : 'internal';
    const frames =
        typeof details.stack === 'string'
            ? [...details.stack.matchAll(/(?:src|dist)\/[a-zA-Z0-9/_-]+\.[jt]s:\d+:\d+/g)]
                  .slice(0, 5)
                  .map((m) => m[0])
            : [];
    console.error(
        JSON.stringify({
            level: 'error',
            event: scope,
            id,
            code,
            nativeCode,
            frames,
            time: new Date().toISOString(),
        }),
    );
    return id;
}
export function publicError(error: unknown, id?: string): string {
    return error instanceof BotError
        ? error.publicMessage
        : `The operation could not be completed.${id ? ` Reference: ${id}` : ''}`;
}

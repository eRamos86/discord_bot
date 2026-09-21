import { ActivityType, type Client } from 'discord.js';
import { presences } from '../config/presences.js';
import { requireValue } from '../framework/runtime/errors.js';
export interface PresenceEntry {
    text: string;
    type: ActivityType;
    enabled?: boolean;
    url?: string;
}
export function parsePresences(raw?: string): PresenceEntry[] {
    const data: unknown = raw ? JSON.parse(raw) : presences;
    requireValue(Array.isArray(data) && data.length <= 20, 'PRESENCES_JSON must contain up to 20 entries.');
    return data.map((v: unknown) => {
        requireValue(v && typeof v === 'object', 'Invalid presence.');
        const p = v as Record<string, unknown>;
        requireValue(
            typeof p.text === 'string' &&
                p.text.length > 0 &&
                p.text.length <= 128 &&
                typeof p.type === 'number' &&
                [0, 1, 2, 3, 4, 5].includes(p.type),
            'Invalid presence text or activity type.',
        );
        if (p.url)
            requireValue(
                typeof p.url === 'string' && /^https:\/\/(www\.)?(twitch\.tv|youtube\.com)\//.test(p.url),
                'Streaming presence URLs must use Twitch or YouTube HTTPS.',
            );
        return {
            text: p.text,
            type: p.type as ActivityType,
            enabled: p.enabled !== false,
            ...(typeof p.url === 'string' ? { url: p.url } : {}),
        };
    });
}
export function startPresence(client: Client) {
    const entries = parsePresences(process.env.PRESENCES_JSON).filter((p) => p.enabled !== false);
    let index = 0;
    let last = '';
    const seconds = Number(process.env.PRESENCE_INTERVAL_SECONDS ?? 60);
    requireValue(
        Number.isInteger(seconds) && seconds >= 30 && seconds <= 86400,
        'Presence interval must be 30–86400 seconds.',
    );
    function rotate() {
        if (!client.isReady() || !entries.length) return;
        const p = entries[index]!;
        index = (index + 1) % entries.length;
        const value = JSON.stringify(p);
        if (value === last) return;
        client.user.setPresence({
            activities: [{ name: p.text, type: p.type, ...(p.url ? { url: p.url } : {}) }],
            status: 'online',
        });
        last = value;
    }
    rotate();
    const timer = setInterval(rotate, seconds * 1000);
    timer.unref();
    return () => clearInterval(timer);
}

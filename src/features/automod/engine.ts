import { createHash } from 'node:crypto';
import type { GuildSettings } from '../../database/guilds/settings.types.js';
export type MessageSample = {
    guildId: string;
    userId: string;
    content: string;
    mentions: number;
    now: number;
};
/** Bounded, short-lived hashes; no retained message archive. Heuristics are opt-in. */
export class AutomodEngine {
    private readonly samples = new Map<string, { at: number; hash: string }[]>();
    inspect(m: MessageSample, s: GuildSettings['automod']): string | null {
        if (!s.enabled) return null;
        const text = m.content.normalize('NFKC');
        if (s.filters.mentions && m.mentions > s.maxMentions) return 'excessive mentions';
        if (s.filters.profanity && s.words.some((w) => text.toLowerCase().includes(w.toLowerCase())))
            return 'word filter';
        if (s.filters.invites && /(?:discord\.gg|discord(?:app)?\.com\/invite)\//i.test(text))
            return 'Discord invite';
        if (s.filters.links) {
            const links = text.match(/https?:\/\/[^\s<>]+/gi) ?? [];
            if (
                links.some((link) => {
                    try {
                        const host = new URL(link).hostname.toLowerCase();
                        return !s.allowedDomains.some(
                            (d) => host === d.toLowerCase() || host.endsWith(`.${d.toLowerCase()}`),
                        );
                    } catch {
                        return true;
                    }
                })
            )
                return 'link filter';
        }
        const letters = text.match(/[a-z]/gi) ?? [];
        if (
            s.filters.caps &&
            letters.length >= 20 &&
            (letters.filter((l) => l === l.toUpperCase()).length / letters.length) * 100 > s.capsPercent
        )
            return 'excessive capitals';
        if (s.filters.unicode && /\p{M}{8,}/u.test(text)) return 'excessive combining characters';
        if (s.filters.spam) {
            const key = `${m.guildId}:${m.userId}`;
            const cutoff = m.now - s.windowSeconds * 1000;
            if (this.samples.size > 10000)
                for (const [k, entries] of this.samples)
                    if (!entries.some((e) => e.at > cutoff)) this.samples.delete(k);
            if (this.samples.size >= 20000 && !this.samples.has(key)) return null;
            const hash = createHash('sha256').update(text.toLowerCase()).digest('hex');
            const entries = (this.samples.get(key) ?? []).filter((e) => e.at > cutoff).slice(-100);
            entries.push({ at: m.now, hash });
            this.samples.set(key, entries);
            if (entries.length > s.maxMessages) return 'message rate';
            if (entries.filter((e) => e.hash === hash).length > s.maxDuplicates) return 'repeated message';
        }
        return null;
    }
}

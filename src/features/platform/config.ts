import type { ColorResolvable } from 'discord.js';
import { botConfig } from '../../config/botConfig.js';
import { createEmbed } from '../../framework/embed/embed.js';
import type { EmbedOptions } from '../../framework/embed/embed.types.js';

export type ServiceName = 'nova' | 'flux' | 'apex' | 'atlas' | 'munchpoints' | 'nexus' | 'admin' | string;

/**
 * Retrieves branding details for a platform service from dynamic bot config.
 */
export function getServiceBranding(service: ServiceName) {
    const s = botConfig.getService(service);
    return {
        color: s.color as ColorResolvable,
        emoji: s.emoji,
        label: s.label,
    };
}

/**
 * Dynamic Proxy providing backwards compatibility with static ServiceBranding access.
 */
export const ServiceBranding = new Proxy({} as Record<string, { color: ColorResolvable; emoji: string; label: string }>, {
    get(_target, prop: string) {
        if (typeof prop === 'symbol') return undefined;
        return getServiceBranding(prop);
    },
});

/**
 * Creates a platform-branded embed with the service's dynamic color and footer branding.
 */
export function platformEmbed(service: ServiceName, options: Omit<EmbedOptions, 'color'> = {}) {
    const branding = getServiceBranding(service);
    return createEmbed({
        ...options,
        color: branding.color,
        footer: options.footer
            ? `${branding.emoji} ${branding.label}  •  ${options.footer}`
            : `${branding.emoji} ${branding.label}`,
    });
}

/**
 * Formats a currency amount for display.
 */
export function formatCurrency(amount: unknown, currency?: unknown): string {
    const num = Number(amount);
    if (!Number.isFinite(num)) return String(amount ?? '—');
    const code = typeof currency === 'string' ? currency : 'USD';
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(num);
    } catch {
        return `${num.toFixed(2)} ${code}`;
    }
}

/**
 * Formats a date value for embed display.
 */
export function formatDate(value: unknown): string {
    if (!value) return '—';
    const date = new Date(String(value));
    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          });
}

/**
 * Truncates a string to a maximum length with ellipsis.
 */
export function truncate(text: unknown, max = 100): string {
    const str = String(text ?? '');
    return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

/**
 * Creates a visual progress bar for budget tracking.
 */
export function progressBar(spent: number, limit: number, width = 10): string {
    const ratio = Math.min(spent / Math.max(limit, 1), 1);
    const filled = Math.round(ratio * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const pct = Math.round(ratio * 100);
    return `${bar} ${pct}%`;
}

/**
 * Returns the budget status color based on spending ratio.
 */
export function budgetColor(spent: number, limit: number): 'Green' | 'Yellow' | 'Red' {
    const ratio = spent / Math.max(limit, 1);
    if (ratio >= 1) return 'Red';
    if (ratio >= 0.75) return 'Yellow';
    return 'Green';
}

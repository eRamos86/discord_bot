/**
 * Shared dynamic color palette for embeds and UI elements.
 *
 * Provides centralized theme and service colors backed by the dynamic
 * BotConfigManager and PostgreSQL store. Modifying colors via owner commands
 * instantly reflects across all subsequent embed builds.
 */
import { ColorResolvable } from 'discord.js';
import { botConfig } from './botConfig.js';

export interface ThemeColors extends Record<string, ColorResolvable> {
    primary: ColorResolvable;
    success: ColorResolvable;
    error: ColorResolvable;
    warning: ColorResolvable;
    danger: ColorResolvable;
    neutral: ColorResolvable;
    nova: ColorResolvable;
    atlas: ColorResolvable;
    nexus: ColorResolvable;
    munchpoints: ColorResolvable;
    apex: ColorResolvable;
    flux: ColorResolvable;
    admin: ColorResolvable;
}

const fallbackColors: Record<string, string> = {
    primary: '#5865F2',
    success: '#57F287',
    error: '#ED4245',
    warning: '#ffa51d',
    danger: '#960000',
    neutral: '#2B2D31',
    nova: '#6200b3',
    atlas: '#51f5ea',
    nexus: '#cc75f5',
    munchpoints: '#b0a740',
    apex: '#ff5b14',
    flux: '#00c721',
    admin: '#883f86',
};

export const Colors: ThemeColors = new Proxy(fallbackColors, {
    get(target, prop: string) {
        if (typeof prop === 'symbol') return Reflect.get(target, prop);
        return botConfig.getColor(prop) ?? target[prop] ?? '#5865F2';
    },
}) as ThemeColors;

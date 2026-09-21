import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { platformEmbed } from '../config.js';

/**
 * Rich embed shown when a user attempts a platform command without a linked Nova account.
 * Includes a URL button to start the OAuth flow.
 */
export function linkAccountEmbed(oauthUrl: string) {
    const embed = platformEmbed('nova', {
        title: '🔗 Connect Your Nova Account',
        desc: [
            'Your Discord account isn\'t linked to Nova yet.',
            '',
            'Nova is the platform identity provider that connects your Discord account to services like Flux, Apex, Atlas, and more.',
            '',
            'Click the button below to sign in or create your Nova account. The link expires in 10 minutes.',
        ].join('\n'),
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setLabel('Sign in to Nova')
            .setStyle(ButtonStyle.Link)
            .setURL(oauthUrl)
            .setEmoji('🔑'),
    );

    return { embed, row };
}

/**
 * Confirmation embed shown after successfully linking a Nova account.
 */
export function accountLinkedEmbed() {
    return platformEmbed('nova', {
        title: '✅ Account Linked',
        desc: 'Your Discord account is now connected to Nova. You can use platform commands like `/flux`, `/apex`, `/wiki`, and more.',
    });
}

/**
 * Embed shown when a stored Nova session has expired.
 */
export function sessionExpiredEmbed(oauthUrl: string) {
    const embed = platformEmbed('nova', {
        title: '🔒 Session Expired',
        desc: 'Your Nova session has expired. Click below to reconnect.',
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setLabel('Reconnect to Nova')
            .setStyle(ButtonStyle.Link)
            .setURL(oauthUrl)
            .setEmoji('🔑'),
    );

    return { embed, row };
}

/**
 * Embed showing current account link status.
 */
export function accountStatusEmbed(linked: boolean, expiresAt?: Date) {
    if (!linked) {
        return platformEmbed('nova', {
            title: '🔗 Account Status',
            desc: 'No active Nova session. Use `/account link` to connect.',
        });
    }

    return platformEmbed('nova', {
        title: '✅ Account Linked',
        desc: expiresAt
            ? `Session active. Expires <t:${Math.floor(expiresAt.getTime() / 1000)}:R>.`
            : 'Session active.',
    });
}

/**
 * Embed shown after unlinking a Nova account.
 */
export function accountUnlinkedEmbed() {
    return platformEmbed('nova', {
        title: '🔓 Account Unlinked',
        desc: 'Your local gateway session has been removed. Use `/account link` to reconnect.',
    });
}

import type { CommandContext } from '../../../framework/context/context.types.js';
import { BotError } from '../../../framework/runtime/errors.js';
import { platform } from '../../../services/platform.js';
import { linkAccountEmbed, sessionExpiredEmbed } from './embeds.js';

type NovaPolicy = { project: string; roles?: string[] };

/**
 * Guard-level authorization for platform commands.
 *
 * Called from the command handler when a command has `access.nova` set.
 * Returns the identity if linked and authorized, or sends a rich link embed
 * and returns `null` to short-circuit command execution.
 *
 * @param ctx Command context
 * @param policy Nova project and optional role requirements
 * @returns Identity object or null (if the link prompt was sent)
 */
export async function authorizePlatform(
    ctx: CommandContext,
    policy: NovaPolicy,
): Promise<{ id: string; project: string; role: string; token: string } | null> {
    try {
        return await platform.nova.authorize(ctx.user.id, policy);
    } catch (error) {
        if (error instanceof BotError && error.code === 'permission') {
            // Determine if this is a "not linked" or "session expired" scenario
            const isExpired = error.message.includes('expired') || error.message.includes('again');
            try {
                const oauthUrl = await platform.nova.startLink(ctx.user.id);
                if (isExpired) {
                    const { embed, row } = sessionExpiredEmbed(oauthUrl);
                    await ctx.reply({ embeds: [embed], components: [row], flags: 64 });
                } else {
                    const { embed, row } = linkAccountEmbed(oauthUrl);
                    await ctx.reply({ embeds: [embed], components: [row], flags: 64 });
                }
                return null;
            } catch {
                // If we can't generate the OAuth URL, fall through to throw the original error
            }
        }
        throw error;
    }
}

/**
 * Callable helper for mid-flow auth checks (e.g., component interactions).
 *
 * Unlike `authorizePlatform()` which silently sends the link embed and returns null,
 * this throws a BotError if the user isn't linked. Use this in button/menu handlers
 * where you need to re-verify auth but can't short-circuit the same way.
 *
 * @param ctx Command context
 * @param policy Nova project and optional role requirements
 * @returns Identity object
 * @throws BotError if not linked
 */
export async function requirePlatformAuth(
    ctx: Pick<CommandContext, 'user'>,
    policy: NovaPolicy,
): Promise<{ id: string; project: string; role: string; token: string }> {
    return platform.nova.authorize(ctx.user.id, policy);
}

export {
    linkAccountEmbed,
    accountLinkedEmbed,
    sessionExpiredEmbed,
    accountStatusEmbed,
    accountUnlinkedEmbed,
} from './embeds.js';

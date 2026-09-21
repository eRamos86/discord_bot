import type { GuildMember } from 'discord.js';
import { pool } from '../../database/client.js';
import { BotError } from '../../framework/runtime/errors.js';
import { platform } from '../../services/platform.js';
import { assignSafeRole } from './service.js';
export async function syncNovaRoles(member: GuildMember) {
    const { rows } = await pool.query<{ project: string; nova_role: string; discord_role_id: string }>(
        'SELECT project,nova_role,discord_role_id FROM role_mappings WHERE guild_id=$1 LIMIT 50',
        [member.guild.id],
    );
    // A Discord role can have multiple mappings; grant if any authorized mapping matches.
    const desired = new Map<string, boolean>();
    const identities = new Map<string, Awaited<ReturnType<typeof platform.authorize>> | null>();
    for (const mapping of rows) {
        if (!identities.has(mapping.project)) {
            try {
                identities.set(
                    mapping.project,
                    await platform.authorize(member.id, { project: mapping.project }),
                );
            } catch (error) {
                if (error instanceof BotError && error.code === 'permission')
                    identities.set(mapping.project, null);
                else throw error;
            }
        }
        const matches = identities.get(mapping.project)?.role === mapping.nova_role;
        desired.set(mapping.discord_role_id, (desired.get(mapping.discord_role_id) ?? false) || matches);
    }
    for (const [role, add] of desired) await assignSafeRole(member, role, add);
    return desired.size;
}

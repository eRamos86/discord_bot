import { pool } from '../../../database/client.js';
import { platform } from '../../../services/platform.js';
import {
    linkAccountEmbed,
    accountStatusEmbed,
    accountUnlinkedEmbed,
} from '../../../features/platform/auth/index.js';
import { syncNovaRoles } from '../../../features/roles/novaMapping.js';
import { platformEmbed } from '../../../features/platform/config.js';
import type { Command } from '../../../types/command.types.js';

export default {
    name: 'nova',
    desc: 'Manage your Nova SSO identity, account link, and role synchronization',
    prefix: { enabled: false },
    access: { private: true },
    subcommands: {
        status: {},
        link: {},
        unlink: {},
        sync: {},
    },
    async execute(ctx) {
        const action = ctx.getString('subcommand');

        if (action === 'link') {
            const oauthUrl = await platform.nova.startLink(ctx.user.id);
            const { embed, row } = linkAccountEmbed(oauthUrl);
            return ctx.reply({ embeds: [embed], components: [row], flags: 64 });
        }

        if (action === 'unlink') {
            await pool.query('DELETE FROM nova_sessions WHERE discord_id=$1', [ctx.user.id]);
            await pool.query('DELETE FROM oauth_states WHERE discord_id=$1', [ctx.user.id]);
            const embed = accountUnlinkedEmbed();
            return ctx.reply({ embeds: [embed], flags: 64 });
        }

        if (action === 'sync') {
            if (!ctx.member) {
                return ctx.reply({
                    embeds: [
                        platformEmbed('nova', {
                            title: '🔑 Role Synchronization',
                            desc: 'Role synchronization can only be performed within a Discord server.',
                        }),
                    ],
                    flags: 64,
                });
            }
            const count = await syncNovaRoles(ctx.member);
            return ctx.reply({
                embeds: [
                    platformEmbed('nova', {
                        title: '🔑 Nova Role Synchronization',
                        desc: `Successfully reconciled **${count}** server role${count === 1 ? '' : 's'} against your active Nova platform grants.`,
                    }),
                ],
                flags: 64,
            });
        }

        // Default or 'status'
        const {
            rows: [session],
        } = await pool.query<{ expires_at: Date }>(
            'SELECT expires_at FROM nova_sessions WHERE discord_id=$1 AND expires_at>now()',
            [ctx.user.id],
        );

        const embed = accountStatusEmbed(!!session, session?.expires_at);
        return ctx.reply({ embeds: [embed], flags: 64 });
    },
} satisfies Command;

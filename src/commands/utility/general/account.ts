import { pool } from '../../../database/client.js';
import { platform } from '../../../services/platform.js';
import {
    linkAccountEmbed,
    accountStatusEmbed,
    accountUnlinkedEmbed,
} from '../../../features/platform/auth/index.js';
import type { Command } from '../../../types/command.types.js';

export default {
    name: 'account',
    desc: 'Link, unlink, or check your Nova platform identity',
    prefix: { enabled: false },
    access: { private: true },
    subcommands: { link: {}, unlink: {}, status: {} },
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

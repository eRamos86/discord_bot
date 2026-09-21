import type { Command } from '../../../types/command.types.js';
import * as admin from '../../../features/platform/admin/index.js';

export default {
    name: 'platform-admin',
    desc: 'Inspect registered platform applications and configuration',
    prefix: { enabled: false },
    access: { private: true, nova: { project: 'admin', roles: ['admin', 'superadmin'] } },
    subcommands: {
        apps: {},
    },
    async execute(ctx) {
        return admin.handleApps(ctx, ctx.identity!.token);
    },
} satisfies Command;

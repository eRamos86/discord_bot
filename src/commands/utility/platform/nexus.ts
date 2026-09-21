import type { Command } from '../../../types/command.types.js';
import * as nexus from '../../../features/platform/nexus/index.js';

export default {
    name: 'nexus',
    desc: 'Browse published platform updates and portfolio projects on Nexus',
    prefix: { enabled: true },
    subcommands: {
        now: {},
        projects: {},
    },
    async execute(ctx) {
        const action = ctx.getString('subcommand');
        if (action === 'projects') return nexus.handleProjects(ctx);
        return nexus.handleNow(ctx);
    },
} satisfies Command;

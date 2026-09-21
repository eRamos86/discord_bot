import type { Command } from '../../../types/command.types.js';
import * as atlas from '../../../features/platform/atlas/index.js';

export default {
    name: 'wiki',
    desc: 'Search Atlas documents (publicly available)',
    prefix: { enabled: false },
    // Publicly accessible for searching; opening a document still requires auth.
    access: { private: false, nova: { project: 'atlas' } },
    subcommands: {
        search: {
            args: {
                query: { type: 'string', required: true, maxLength: 100 },
                page: { type: 'integer', minValue: 1, maxValue: 1000 },
            },
        },
        open: { args: { path: { type: 'string', required: true, maxLength: 500 } } },
    },
    async execute(ctx) {
        const token = ctx.identity?.token;
        if (ctx.getString('subcommand') === 'open') {
            return atlas.handleOpen(ctx, token, ctx.getString('path')!);
        }
        const page = (ctx.getNumber('page') ?? 1) - 1;
        return atlas.handleSearch(ctx, token, ctx.getString('query')!, page);
    },
} satisfies Command;

import { BotError } from '../framework/runtime/errors.js';
import { record } from './http.js';
import { displayRows, platform } from './platform.js';

export interface GatewayTool {
    name: string;
    project: string;
    roles?: string[];
    match: (text: string) => Record<string, string> | null;
    execute: (token: string, args: Record<string, string>) => Promise<string>;
    /** If true, the tool is public and does not require user authentication */
    public?: boolean;
}

/** Explicit, read-only intents. Untrusted text never creates URLs or chooses arbitrary methods. */
export class ToolRegistry {
    private readonly tools: GatewayTool[] = [];

    register(tool: GatewayTool) {
        if (this.tools.some((t) => t.name === tool.name)) throw new Error('Duplicate gateway tool');
        this.tools.push(tool);
    }

    resolve(text: string) {
        for (const tool of this.tools) {
            const args = tool.match(text);
            if (args) return { tool, args };
        }
        return null;
    }

    async execute(discordId: string, text: string) {
        const match = this.resolve(text);
        if (!match)
            throw new BotError(
                'validation',
                'Try “my MunchPoints balance”, “show my garage”, “recent transactions”, or “find Atlas Nova authentication”.',
            );
        let token = '';
        if (!match.tool.public) {
            const identity = await platform.authorize(discordId, {
                project: match.tool.project,
                roles: match.tool.roles,
            });
            token = identity.token;
        }
        return match.tool.execute(token, match.args);
    }
}

export const gatewayTools = new ToolRegistry();

// Public generic help for recent transaction queries.
gatewayTools.register({
    name: 'public.generic',
    project: 'generic',
    public: true,
    match: (text) => /how.*\brecent\b.*\btransactions\b/i.test(text) ? {} : null,
    async execute(_token, _args) {
        return 'You can view recent transactions with the command `/flux recent`. This command requires a linked account because it accesses your personal data. For public documentation, see `/wiki <topic>`.';
    },
});

// MunchPoints balance (private).
gatewayTools.register({
    name: 'mp.balance',
    project: 'munchpoints',
    match: (text) => /\b(munchpoints|mp)\b.*\bbalance\b|\bbalance\b.*\bmunchpoints\b/i.test(text) ? {} : null,
    async execute(token) {
        return `MunchPoints: ${String(record(await platform.munchpoints.balance(token)).points)}`;
    },
});

// Apex garage (private).
gatewayTools.register({
    name: 'apex.garage',
    project: 'apex',
    match: (text) => /\b(garage|my vehicles)\b/i.test(text) ? {} : null,
    async execute(token) {
        return displayRows(await platform.apex.garage(token), [
            'id',
            'name',
            'make',
            'model',
            'currentOdometer',
        ]);
    },
});

// Flux recent transactions (private).
gatewayTools.register({
    name: 'flux.recent',
    project: 'flux',
    match: (text) => /\brecent (transactions|expenses)\b/i.test(text) ? {} : null,
    async execute(token) {
        return displayRows(await platform.flux.recent(token), ['date', 'description', 'amount']);
    },
});

// Public wiki search (public).
gatewayTools.register({
    name: 'wiki.public',
    project: 'atlas',
    public: true,
    match: (text) => {
        const m = text.match(/^wiki\s+(.+)$/i);
        return m?.[1] ? { query: m[1] } : null;
    },
    async execute(_token, args) {
        const result = await platform.atlas.search('', args.query ?? '');
        return (
            result.docs
                .map((d) => `${String(d.title)} — ${String(d.path)}`)
                .join('\n')
                .slice(0, 1800) || 'No public documentation found.'
        );
    },
});

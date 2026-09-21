import { BotError, requireValue } from '../framework/runtime/errors.js';
import { ServiceClient, array, record } from './http.js';
import { NovaClient } from './nova.js';
export class FluxClient extends ServiceClient {
    accounts(token: string) {
        return this.request('/api/accounts', { token }).then(array);
    }
    recent(token: string) {
        return this.request('/api/transactions?limit=10', { token }).then(array);
    }
    summary(token: string) {
        return this.request('/api/dashboard', { token });
    }
    budgets(token: string) {
        return this.request('/api/budgets', { token });
    }
    subscriptions(token: string) {
        return this.request('/api/subscriptions', { token });
    }
    async expense(token: string, amount: number, description: string, accountId?: string) {
        requireValue(Number.isFinite(amount) && amount > 0 && amount <= 1000000, 'Invalid expense amount.');
        const accounts = await this.accounts(token);
        const account = accountId
            ? accounts.find((a) => a.id === accountId)
            : (accounts.find((a) => a.isDefault === true && !a.isArchived) ??
              accounts.find((a) => !a.isArchived));
        requireValue(account && typeof account.id === 'string', 'No eligible Flux account found.');
        return this.request('/api/transactions', {
            method: 'POST',
            token,
            body: {
                accountId: account.id,
                type: 'expense',
                amount: amount.toFixed(2),
                description,
                date: new Date().toISOString(),
            },
        });
    }
}
export class ApexClient extends ServiceClient {
    async garage(token: string) {
        return array(record(await this.request('/api/vehicles', { token })).vehicles);
    }
    vehicle(token: string, id: string) {
        return this.request(`/api/vehicles/${encodeURIComponent(id)}`, { token });
    }
    maintenance(token: string, id: string) {
        return this.request(`/api/maintenance?vehicleId=${encodeURIComponent(id)}`, { token });
    }
    builds(token: string, id: string) {
        return this.request(`/api/builds?vehicleId=${encodeURIComponent(id)}`, { token });
    }
    fuel(
        token: string,
        input: { vehicleId: string; odometer: number; volumeGallons: number; totalCost: number },
    ) {
        requireValue(
            Number.isSafeInteger(input.odometer) &&
                input.odometer >= 0 &&
                Number.isFinite(input.volumeGallons) &&
                input.volumeGallons > 0 &&
                input.volumeGallons < 1000 &&
                Number.isFinite(input.totalCost) &&
                input.totalCost > 0 &&
                input.totalCost < 100000,
            'Invalid fuel entry.',
        );
        return this.request('/api/fuel', { method: 'POST', token, body: input });
    }
    odometer(token: string, id: string, currentOdometer: number) {
        return this.request(`/api/vehicles/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            token,
            body: { currentOdometer },
        });
    }
}
export class AtlasClient extends ServiceClient {
    async search(token: string | undefined, query: string, page = 0) {
        // Ensure the Atlas service is configured; otherwise, the request will fail.
        if (!this.configured()) {
            throw new BotError('configuration', 'Atlas service is not configured.');
        }
        const data = record(await this.request('/api/docs', token ? { token } : {}));
        const docs = array(data.docs).filter((d) =>
            `${String(d.title ?? '')} ${String(d.path ?? '')}`.toLowerCase().includes(query.toLowerCase()),
        );
        return { total: docs.length, docs: docs.slice(page * 10, page * 10 + 10) };
    }
    open(token: string | undefined, path: string) {
        if (!this.configured()) {
            throw new BotError('configuration', 'Atlas service is not configured.');
        }
        const cleanPath = path.replace(/^\/+/, '');
        requireValue(!cleanPath.split('/').some((p) => p === '..' || p === '.'), 'Invalid document path.');
        return this.request(
            `/api/docs/${cleanPath.split('/').map(encodeURIComponent).join('/')}`,
            token ? { token } : {},
        );
    }
}
export class MunchPointsClient extends ServiceClient {
    balance(token: string) {
        return this.request('/api/bot?action=balance', { token });
    }
    rewards(token: string) {
        return this.request('/api/bot?action=rewards', { token });
    }
    history(token: string) {
        return this.request('/api/bot?action=history', { token });
    }
}
export class NexusClient extends ServiceClient {
    now() {
        return this.request('/api/now');
    }
    projects() {
        return this.request('/api/portfolio');
    }
}
export class AdminClient extends ServiceClient {
    apps(token: string) {
        return this.request('/api/apps', { token });
    }
}
export const platform = {
    nova: new NovaClient('Nova', () => process.env.NOVA_API_URL),
    flux: new FluxClient('Flux', () => process.env.FLUX_API_URL),
    apex: new ApexClient('Apex', () => process.env.APEX_API_URL),
    atlas: new AtlasClient('Atlas', () => process.env.ATLAS_API_URL),
    munchpoints: new MunchPointsClient('MunchPoints', () => process.env.MUNCHPOINTS_API_URL),
    nexus: new NexusClient('Nexus', () => process.env.NEXUS_API_URL),
    admin: new AdminClient('Admin', () => process.env.ADMIN_API_URL),
    authorize(discordId: string, policy: { project: string; roles?: string[] }) {
        return this.nova.authorize(discordId, policy);
    },
};
/** Only explicit display fields; never stringify arbitrary private service responses into Discord. */
export function displayRows(rows: Record<string, unknown>[], fields: string[]) {
    return (
        rows
            .slice(0, 10)
            .map((row) =>
                fields
                    .filter((f) => typeof row[f] === 'string' || typeof row[f] === 'number')
                    .map((f) => `${f}: ${String(row[f]).slice(0, 120)}`)
                    .join(' · '),
            )
            .join('\n')
            .slice(0, 1800) || 'No results.'
    );
}

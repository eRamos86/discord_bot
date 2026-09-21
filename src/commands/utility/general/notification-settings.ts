import {
    listNotificationPreferences,
    setNotificationPreference,
} from '../../../features/notifications/preferences.js';
import type { Command } from '../../../types/command.types.js';

const source = { type: 'string' as const, required: true, maxLength: 80 };
const type = { type: 'string' as const, required: true, maxLength: 80 };

export default {
    name: 'notification-settings',
    desc: 'Control private service notification preferences',
    prefix: { enabled: false },
    access: { private: true, nova: { project: 'nova' } },
    subcommands: {
        list: {},
        all: { args: { enabled: { type: 'boolean', required: true } } },
        service: { args: { source, enabled: { type: 'boolean', required: true } } },
        event: { args: { source, type, enabled: { type: 'boolean', required: true } } },
    },
    async execute(ctx) {
        const novaId = ctx.identity!.id;
        const action = ctx.getString('subcommand');
        if (action === 'all') {
            await setNotificationPreference(novaId, '*', '*', ctx.getBoolean('enabled')!);
            return ctx.reply('Global notification preference updated.');
        }
        if (action === 'service') {
            await setNotificationPreference(
                novaId,
                ctx.getString('source')!,
                '*',
                ctx.getBoolean('enabled')!,
            );
            return ctx.reply('Service notification preference updated.');
        }
        if (action === 'event') {
            await setNotificationPreference(
                novaId,
                ctx.getString('source')!,
                ctx.getString('type')!,
                ctx.getBoolean('enabled')!,
            );
            return ctx.reply('Event notification preference updated.');
        }
        const rows = await listNotificationPreferences(novaId);
        return ctx.reply(
            rows
                .map((row) => `${row.enabled ? 'enabled' : 'disabled'}: ${row.source}/${row.eventType}`)
                .join('\n') || 'Notifications are enabled by default.',
        );
    },
} satisfies Command;

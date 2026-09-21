import { syncNovaRoles } from '../../../features/roles/novaMapping.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'rolesync',
    desc: 'Reconcile your mapped roles against live Nova grants',
    prefix: { enabled: false },
    access: { private: true },
    cooldownSeconds: 30,
    async execute(ctx) {
        if (!ctx.member) return;
        const count = await syncNovaRoles(ctx.member);
        return ctx.reply(`Reconciled ${count} configured roles.`);
    },
} satisfies Command;

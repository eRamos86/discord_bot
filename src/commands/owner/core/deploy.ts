import type { Command } from '../../../types/command.types.js';
import { deploy } from '../../../utils/command.js';
export default {
    name: 'deploy',
    desc: 'Synchronize or remove Discord application commands',
    prefix: { enabled: false },
    access: { ownerOnly: true, private: true },
    cooldownSeconds: 30,
    args: { command: { type: 'string' }, remove: { type: 'string' }, preview: { type: 'boolean' } },
    async execute(ctx) {
        const result = await deploy({
            commandName: ctx.getString('command') ?? undefined,
            remove: ctx.getString('remove') ?? undefined,
            dryRun: ctx.getBoolean('preview') ?? false,
        });
        return ctx.reply(
            result.success
                ? `Command synchronization completed (${result.deployed.length} definitions). Scope: ${process.env.GLOBAL_DEPLOY === 'true' ? 'global' : 'development guild'}. Full synchronization removes obsolete definitions.`
                : result.errors.join('\n'),
        );
    },
} satisfies Command;

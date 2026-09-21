import { gatewayTools } from '../../../services/tools.js';
import type { Command } from '../../../types/command.types.js';

export default {
    name: 'ask',
    desc: 'Use the private, deterministic platform gateway',
    prefix: { enabled: false },
    access: { private: false },
    args: { question: { type: 'string', required: true, maxLength: 200 } },
    async execute(ctx) {
        return ctx.reply(await gatewayTools.execute(ctx.user.id, ctx.getString('question')!));
    },
} satisfies Command;

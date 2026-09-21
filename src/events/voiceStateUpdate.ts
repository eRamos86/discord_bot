import type { VoiceState } from 'discord.js';
import { logEvent } from '../features/logging/service.js';
export default {
    name: 'voiceStateUpdate',
    async execute(before: VoiceState, after: VoiceState) {
        if (before.channelId !== after.channelId)
            await logEvent(
                after.guild,
                'voice',
                'Voice channel changed',
                `<@${after.id}>: ${before.channelId ?? 'none'} → ${after.channelId ?? 'none'}`,
            );
    },
};

import type { Message, PartialMessage } from 'discord.js';
import { logEvent } from './service.js';
export async function logDelete(message: Message | PartialMessage): Promise<void> {
    if (!message.guild || message.author?.bot) return;
    await logEvent(
        message.guild,
        'deletions',
        'Message deleted',
        `${message.author ?? 'Unknown'} in ${message.channel}: ${(message.content ?? 'Content unavailable').slice(0, 1500)}`,
    );
}

import type { Message, PartialMessage } from 'discord.js';
import { logEvent } from './service.js';
export async function logEdit(
    oldMessage: Message | PartialMessage,
    message: Message | PartialMessage,
): Promise<void> {
    if (!message.guild || message.author?.bot || oldMessage.content === message.content) return;
    await logEvent(
        message.guild,
        'edits',
        'Message edited',
        `${message.author ?? 'Unknown'} in ${message.channel}\nBefore: ${(oldMessage.content ?? 'Unavailable').slice(0, 1200)}\nAfter: ${(message.content ?? 'Unavailable').slice(0, 1200)}`,
    );
}

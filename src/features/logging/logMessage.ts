import type { Message } from 'discord.js';
import { logEvent } from './service.js';
export async function logMessage(message: Message): Promise<void> {
    if (!message.guild || message.author.bot) return;
    await logEvent(
        message.guild,
        'messages',
        'Message created',
        `${message.author} in ${message.channel}: ${message.content.slice(0, 1500)}`,
    );
}

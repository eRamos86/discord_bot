import * as dis from 'discord.js';
import * as ace from '@framework';
import { getGuildSettings } from '@db';

export default {
    name: "messageUpdate",
    async execute(
        oldMessage: dis.Message<boolean> | dis.PartialMessage,
        newMessage: dis.Message<boolean> | dis.PartialMessage
    ) {
        if (!newMessage.guild || newMessage.author?.bot) return;
        
        // Skip if content didn't change
        if (oldMessage.content === newMessage.content) return;
        
        const settings = await getGuildSettings(newMessage.guild.id);
        
        if (!settings.logging.enabled || !settings.logging.channelId) {
            return;
        }
        
        if (!settings.logging.events.edits) {
            return;
        }
        
        const channel = newMessage.guild.channels.cache.get(settings.logging.channelId);
        if (!channel || !channel.isTextBased()) {
            console.error(`[Logging] Log channel ${settings.logging.channelId} not found or not text-based`);
            return;
        }
        
        const embed = new dis.EmbedBuilder()
            .setTitle("Message Edited")
            .setColor("#FFA500")
            .setTimestamp()
            .addFields(
                { name: "Author", value: newMessage.author?.toString() ?? "Unknown", inline: true },
                { name: "Channel", value: newMessage.channel.toString(), inline: true },
                { name: "Jump to Message", value: newMessage.url, inline: true }
            );
        
        if (oldMessage.content) {
            embed.addFields({
                name: "Before",
                value: oldMessage.content.length > 500 ? oldMessage.content.substring(0, 500) + "..." : oldMessage.content,
                inline: false
            });
        }
        
        if (newMessage.content) {
            embed.addFields({
                name: "After",
                value: newMessage.content.length > 500 ? newMessage.content.substring(0, 500) + "..." : newMessage.content,
                inline: false
            });
        }
        
        if (newMessage.author) {
            embed.setAuthor({
                name: newMessage.author.username,
                iconURL: newMessage.author.displayAvatarURL()
            });
        }
        
        try {
            await channel.send({ embeds: [embed] });
            console.log(`[Logging] Logged edited message from ${newMessage.author?.tag} in ${newMessage.guild.name}`);
        } catch (error) {
            console.error(`[Logging] Failed to log edited message:`, error);
        }
    }
};
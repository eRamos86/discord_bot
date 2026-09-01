import * as dis from 'discord.js';
import * as ace from '@framework';
import { getGuildSettings } from '@db';

export default {
    name: "messageDelete",
    async execute(message: dis.Message<boolean> | dis.PartialMessage) {
        if (!message.guild || message.author?.bot) return;
        
        const settings = await getGuildSettings(message.guild.id);
        
        if (!settings.logging.enabled || !settings.logging.channelId) {
            return;
        }
        
        if (!settings.logging.events.deletions) {
            return;
        }
        
        const channel = message.guild.channels.cache.get(settings.logging.channelId);
        if (!channel || !channel.isTextBased()) {
            console.error(`[Logging] Log channel ${settings.logging.channelId} not found or not text-based`);
            return;
        }
        
        const embed = new dis.EmbedBuilder()
            .setTitle("Message Deleted")
            .setColor("#FF0000")
            .setTimestamp()
            .addFields(
                { name: "Author", value: message.author?.toString() ?? "Unknown", inline: true },
                { name: "Channel", value: message.channel.toString(), inline: true }
            );
        
        if (message.content) {
            embed.addFields({
                name: "Deleted Content",
                value: message.content.length > 1000 ? message.content.substring(0, 1000) + "..." : message.content
            });
        }
        
        if (message.author) {
            embed.setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL()
            });
        }
        
        try {
            await channel.send({ embeds: [embed] });
            console.log(`[Logging] Logged deleted message from ${message.author?.tag} in ${message.guild.name}`);
        } catch (error) {
            console.error(`[Logging] Failed to log deleted message:`, error);
        }
    }
};
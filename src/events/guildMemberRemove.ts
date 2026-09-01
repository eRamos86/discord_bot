import * as dis from 'discord.js';
import * as ace from '@framework';
import { getGuildSettings } from '@db';

export default {
    name: "guildMemberRemove",
    async execute(member: dis.GuildMember) {
        if (!member.guild) return;
        
        const settings = await getGuildSettings(member.guild.id);
        
        if (!settings.goodbye.enabled || !settings.goodbye.channelId) {
            console.log(`[Goodbye] Disabled or no channel for guild ${member.guild.id}`);
            return;
        }
        
        const channel = member.guild.channels.cache.get(settings.goodbye.channelId);
        if (!channel || !channel.isTextBased()) {
            console.error(`[Goodbye] Channel ${settings.goodbye.channelId} not found or not text-based`);
            return;
        }
        
        // Build the goodbye embed
        const embed = new dis.EmbedBuilder()
            .setTitle(settings.goodbye.title ?? "Goodbye!")
            .setDescription(
                (settings.goodbye.message ?? "{user} left the server.").replace(
                    "{user}",
                    member.user.toString()
                )
            )
            .setColor((settings.goodbye.color ?? "#FF0000") as dis.ColorResolvable)
            .setTimestamp();
        
        if (settings.goodbye.footer) {
            embed.setFooter({ text: settings.goodbye.footer });
        }
        
        if (settings.goodbye.image) {
            embed.setImage(settings.goodbye.image);
        }
        
        // Set author with user avatar
        embed.setAuthor({
            name: member.user.username,
            iconURL: member.user.displayAvatarURL()
        });
        
        try {
            await channel.send({ embeds: [embed] });
            console.log(`[Goodbye] Sent goodbye message for ${member.user.tag} in ${member.guild.name}`);
        } catch (error) {
            console.error(`[Goodbye] Failed to send message:`, error);
        }
    }
};
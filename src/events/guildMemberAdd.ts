import * as dis from 'discord.js';
import * as ace from '@framework';
import { getGuildSettings } from '@db';

export default {
    name: "guildMemberAdd",
    async execute(member: dis.GuildMember) {
        if (!member.guild) return;
        
        const settings = await getGuildSettings(member.guild.id);
        
        if (!settings.welcome.enabled || !settings.welcome.channelId) {
            console.log(`[Welcome] Disabled or no channel for guild ${member.guild.id}`);
            return;
        }
        
        const channel = member.guild.channels.cache.get(settings.welcome.channelId);
        if (!channel || !channel.isTextBased()) {
            console.error(`[Welcome] Channel ${settings.welcome.channelId} not found or not text-based`);
            return;
        }
        
        // Build the welcome embed
        const embed = new dis.EmbedBuilder()
            .setTitle(settings.welcome.title ?? "Welcome!")
            .setDescription(
                (settings.welcome.message ?? "{user} joined the server.").replace(
                    "{user}",
                    member.user.toString()
                )
            )
            .setColor((settings.welcome.color ?? "#00FF00") as dis.ColorResolvable)
            .setTimestamp();
        
        if (settings.welcome.footer) {
            embed.setFooter({ text: settings.welcome.footer });
        }
        
        if (settings.welcome.image) {
            embed.setImage(settings.welcome.image);
        }
        
        // Set author with user avatar
        embed.setAuthor({
            name: member.user.username,
            iconURL: member.user.displayAvatarURL()
        });
        
        try {
            await channel.send({ embeds: [embed] });
            console.log(`[Welcome] Sent welcome message for ${member.user.tag} in ${member.guild.name}`);
        } catch (error) {
            console.error(`[Welcome] Failed to send message:`, error);
        }
    }
};
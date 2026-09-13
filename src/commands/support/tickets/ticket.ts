import * as Discord from 'discord.js';
import * as ace from '@framework';
import { db } from '../../../database/client.js';
import { tickets } from '../../../database/schema.js';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "`/ticket <subject>`",
        example: "`/ticket I need help`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a support ticket')
        .addStringOption(option => 
            option.setName('subject')
                .setDescription('The subject of your ticket')
                .setRequired(true)
        ),
    async execute(ctx) {
        if (!ctx.guild) return;
        
        const subject = ctx.isInteraction ? ctx.interaction.options.getString('subject') : ctx.args.join(' ');
        
        if (!subject) {
            return ctx.error({
                title: 'Missing Subject',
                desc: 'Please provide a subject for your ticket.'
            });
        }

        try {
            const ticketId = Math.random().toString(36).substring(2, 8);
            const channel = await ctx.guild.channels.create({
                name: `ticket-${ticketId}`,
                type: Discord.ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: ctx.guild.id,
                        deny: [Discord.PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: ctx.user.id,
                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: ctx.client.user!.id,
                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages],
                    }
                ]
            });

            await db.insert(tickets).values({
                ticketId,
                guildId: ctx.guild.id,
                channelId: channel.id,
                authorId: ctx.user.id,
                status: 'open'
            });

            await channel.send({
                content: `<@${ctx.user.id}>`,
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle('Support Ticket')
                        .setDescription(`**Subject:** ${subject}\n\nSupport will be with you shortly.`)
                        .setColor('#0099ff')
                ]
            });

            return ctx.success({
                embed: {
                    title: 'Ticket Created',
                    desc: `Your ticket has been created: <#${channel.id}>`
                }
            });
        } catch (error) {
            console.error('Ticket creation error:', error);
            return ctx.error({
                title: 'Error',
                desc: 'An error occurred while creating the ticket.'
            });
        }
    }
};

export default command;

import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';
import { getGuildSettings } from '@db';

/**
 * /config
 * shows a full help menu for the config system.
 *
 * /config show
 * shows all the server's config options
 *
 * /config prefix set !
 * sets the prefix in the server for the bot to `!`
 *
 * /config welcome channel channelId
 * sets the channel for the welcome messages
 * requires /config welcome enable.
 */
const command: ace.Command = {

    requiredLevel: ace.PermissionLevel.ADMIN,

    help: {
        usage: '\`/config arg arg arg\`',
        example: ''
    },

    data: new dis.SlashCommandBuilder()
    .setName('config')
    .setDescription(`Edit the bot's configuration for your server.`)

    ,

    async execute(ctx) {

        console.log('hello from config command');
        
        if (!ctx.guild) {
            return ctx.error({
                embed: {
                    title: 'Error',
                    desc: 'This command can only be used in a server'
                }
            });
        }
        
        // If no args, show config with modal buttons
        const args = ctx.args?.raw ?? [];
        
        if (args.length === 0) {
            const settings = await getGuildSettings(ctx.guild!.id);
            
            // Build Welcome field value
            const welcomeValue = settings.welcome.enabled
                ? `Enabled: ✅\nChannel: ${settings.welcome.channelId ? `<#${settings.welcome.channelId}>` : 'Not Set'}`
                : 'Enabled: ❌';
            
            // Build Goodbye field value
            const goodbyeValue = settings.goodbye.enabled
                ? `Enabled: ✅\nChannel: ${settings.goodbye.channelId ? `<#${settings.goodbye.channelId}>` : 'Not Set'}`
                : 'Enabled: ❌';
            
            // Build Logging field value
            const loggingValue = settings.logging.enabled
                ? `Enabled: ✅\nChannel: ${settings.logging.channelId ? `<#${settings.logging.channelId}>` : 'Not Set'}\nMessages: ${settings.logging.events.messages ? '✅' : '❌'}\nEdits: ${settings.logging.events.edits ? '✅' : '❌'}\nDeletions: ${settings.logging.events.deletions ? '✅' : '❌'}`
                : 'Enabled: ❌';
            
            // Show config with modal buttons
            return ctx.reply({
                embeds: [{
                    title: "Server Configuration",
                    color: 0x2b2d31,
                    description: "Click a button below to configure that feature using a form.",
                    fields: [
                        {
                            name: "Prefix",
                            value: `\`${settings.prefix}\``,
                            inline: true
                        },
                        {
                            name: "Welcome",
                            value: welcomeValue,
                            inline: true,
                        },
                        {
                            name: "Goodbye",
                            value: goodbyeValue,
                            inline: true,
                        },
                        {
                            name: "Logging",
                            value: loggingValue
                        }
                    ]
                }],
                components: [
                    new dis.ActionRowBuilder<dis.ButtonBuilder>().addComponents(
                        new dis.ButtonBuilder()
                            .setCustomId('config_welcome_btn')
                            .setLabel('Configure Welcome')
                            .setStyle(dis.ButtonStyle.Primary)
                            .setEmoji('👋'),
                        new dis.ButtonBuilder()
                            .setCustomId('config_goodbye_btn')
                            .setLabel('Configure Goodbye')
                            .setStyle(dis.ButtonStyle.Primary)
                            .setEmoji('👋'),
                    )
                ]
            });
        }
        
        // Handle text-based config commands
        return ace.handleConfigCommand(ctx);

    }


};

export default command;
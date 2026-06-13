import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';

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
        return ace.handleConfigCommand(ctx);

    }


};

export default command;

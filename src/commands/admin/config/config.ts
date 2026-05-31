import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';

/**
 * /config
 * shows a mini help menu. not as detailed as the help defined below
 * but just enough to give the user an idea of how to work it.
 * can reference 'do /help config to learn more' in the footer or something
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

        // basic error handling then route to @features/config/index.ts

    }


};

export default command;

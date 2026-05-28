import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client
} from "discord.js";

import { PermissionLevel } from "../../../core/guards/guards.js";
import { Command } from "../../../core/commands/command.js";
import { media } from "../../../utils/media.js";
import { Colors } from "../../../config/theme.js";

const command : Command = {

    prefix: {
        enabled: true
    },

    aliases: [],
    requiredLevel: PermissionLevel.PUBLIC,

    help: {
        usage: '`/ping`',
        example: `
            \`/ping\`
        `.trim()
    },

    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong. Used to test Bot connectivity.'),

    async execute(ctx) {

        ctx.success({

            embed: {
                title: 'Pong!',
                desc: 'Latency test'
            }
            
        });

    }

};

export default command;
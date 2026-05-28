import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { PermissionLevel } from "../../../core/guards/guards.js";
import { Command } from '../../../types/command.types.js';
import { media } from "../../../utils/media.js";
import { Colors } from "../../../config/theme.js";

const command: Command = {

    prefix: {
        enabled: true
    },

    aliases: [],
    requiredLevel: PermissionLevel.MOD,

    help: {
        usage: "`/purge` **`[amt]`**",
        example: `
            \`/purge\` **\`amount:\`** 50
        `.trim()
    },

    // COMMAND DATA
    data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete specified amount of messages.')
    .addIntegerOption(o =>
        o
        .setName('amount')
        .setDescription('1-100')
        .setRequired(true)
    )

    ,

    async execute(ctx) {
        
        // GATHER DATA
        const amount = ctx.getNumber("amount")!;

        // LOGIC
        if (amount < 1 || amount > 100) {
            return ctx.reply({
                content: 'Choose 1-100',
                flags: 64
            });
        }

        const messages = await ctx.channel.delete(amount);

        // BUILD REPLY
        await ctx.reply({
            content: `Deleted ${messages.size} messages.`,
            flags: MessageFlags.Ephemeral
        });

    },

};

export default command;

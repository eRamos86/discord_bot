import { SlashCommandBuilder } from "discord.js";
import { PermissionLevel } from "../../../core/permissionLevels.js";

export default {

    aliases: [],
    requiredLevel: PermissionLevel.MOD,
    help: {
        usage: "`/purge` **`<amount>`**",
        example: `
            \`/purge\` **\`amount:\`** 50
        `.trim()
    },

    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete messages")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("1-100")
                .setRequired(true)
        )
        
    ,

    async execute(interaction: any) {

        const amount =
            interaction.options.getInteger("amount");

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "Choose 1-100",
                flags: 64
            });
        }

        const messages =
            await interaction.channel.bulkDelete(
                amount,
                true
            );

        await interaction.reply({
            content:
                `Deleted ${messages.size} messages.`,
            flags: 64
        });
    }
};
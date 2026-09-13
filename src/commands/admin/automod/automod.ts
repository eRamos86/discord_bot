import * as Discord from 'discord.js';
import * as ace from '@framework';
import { db } from '../../../database/client.js';
import { guildSettings } from '../../../database/schema.js';
import { eq } from 'drizzle-orm';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.ADMIN,
    help: {
        usage: "`/automod <enable/disable>`",
        example: "`/automod enable`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure automod settings')
        .addStringOption(option => 
            option.setName('action')
                .setDescription('Enable or disable automod')
                .setRequired(true)
                .addChoices(
                    { name: 'Enable', value: 'enable' },
                    { name: 'Disable', value: 'disable' }
                )
        ),
    async execute(ctx) {
        if (!ctx.guild) return;

        const action = ctx.isInteraction ? ctx.interaction.options.getString('action') : ctx.args[0]?.toLowerCase();

        if (action !== 'enable' && action !== 'disable') {
            return ctx.error({
                title: 'Invalid Action',
                desc: 'Please specify whether to `enable` or `disable` automod.'
            });
        }

        const enabled = action === 'enable';

        try {
            const currentSettings = await db.select().from(guildSettings).where(eq(guildSettings.guildId, ctx.guild.id)).limit(1);
            let automodData = currentSettings[0]?.automod || {
                enabled: false,
                filters: { profanity: false, links: false, invites: false, spam: false }
            };

            automodData.enabled = enabled;

            if (currentSettings.length > 0) {
                await db.update(guildSettings)
                    .set({ automod: automodData })
                    .where(eq(guildSettings.guildId, ctx.guild.id));
            } else {
                await db.insert(guildSettings).values({
                    guildId: ctx.guild.id,
                    automod: automodData
                });
            }

            return ctx.success({
                embed: {
                    title: 'Automod Settings',
                    desc: `Automod has been **${enabled ? 'enabled' : 'disabled'}**.`
                }
            });
        } catch (error) {
            console.error('Automod error:', error);
            return ctx.error({
                title: 'Error',
                desc: 'An error occurred while updating automod settings.'
            });
        }
    }
};

export default command;

import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';

const command: ace.Command = {

    /**
     * use this if you dont want the command to be prefix enabled.
     * aliases doesnt do anything yet
     */
    prefix: {
        enabled: true,
        aliases: [],
    },

    /**
     * currently this does nothing
     */
    aliases: [],

    /**
     * use this if the required permission level
     * for this command is anything higher than 'PUBLIC'
     */
    requiredLevel: ace.PermissionLevel.PUBLIC,

    /**
     * only really matters if the command has options/args
     * use this for the autocomplete logic
     * only works for slash commands
     * 
     * @param interaction
     */
    /*
    autocomplete: async (interaction) => {
        
        // AUTOCOMPLETE CODE
        
    },
    */

    help: {
        usage: "`/command` **`<required>`** *`[optional]`*",
        example: `
            \`/command\`
            \`/command\` **\`req:\`** arg
            \`/command\` *\`opt:\`* arg
        `.trim()
    },

    data: new dis.SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('some description')

        /*
        optional:

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("desc")
                .setRequired(Boolean)
        )

        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("desc")
                .setRequired(Boolean)
        )
        */

        ,

    async execute(ctx) {

        const guild = ctx.guild;

        if (!guild) {
            return ctx.reply({
                content: "This command can only be used in a server."
            });
        }

        

        // OWNER
        const owner = await guild.fetchOwner();

        // MEMBER STATS
        /**
         * Cached member stats only.
         *
         * Avoids expensive full member chunking
         * which can gateway rate limit large guilds.
         */
        const cachedBots = guild.members.cache.filter(
            m => m.user.bot
        ).size;

        const cachedHumans = guild.members.cache.filter(
            m => !m.user.bot
        ).size;

        // CHANNEL STATS
        const textChannels = guild.channels.cache.filter(
            c => c.type === dis.ChannelType.GuildText
        ).size;

        const voiceChannels = guild.channels.cache.filter(
            c => c.type === dis.ChannelType.GuildVoice
        ).size;

        const stageChannels = guild.channels.cache.filter(
            c => c.type === dis.ChannelType.GuildStageVoice
        ).size;

        const forumChannels = guild.channels.cache.filter(
            c => c.type === dis.ChannelType.GuildForum
        ).size;

        const categoryChannels = guild.channels.cache.filter(
            c => c.type === dis.ChannelType.GuildCategory
        ).size;

        const threadChannels = guild.channels.cache.filter(
            c => c.isThread()
        ).size;

        // ROLE STATS
        const roles = guild.roles.cache.size;

        // EMOJI / STICKER STATS
        const emojis = guild.emojis.cache.size;
        const stickers = guild.stickers.cache.size;

        // EVENTS
        const scheduledEvents = guild.scheduledEvents.cache.size;

        // BOOST STATS
        const boosts = guild.premiumSubscriptionCount ?? 0;
        const boostTier = guild.premiumTier;

        // FEATURE FLAGS
        const features = guild.features.length
            ? guild.features.map(feature => `• ${feature}`).join('\n')
            : 'None';

        // CREATED TIMESTAMP
        const created = Math.floor(
            guild.createdTimestamp / 1000
        );

        // UPLOAD LIMIT
        const uploadLimit = {
            0: 8,
            1: 8,
            2: 50,
            3: 100
        }[guild.premiumTier];

        // BUILD REPLY
        await ctx.info({
            embed: {
                title: guild.name,
                desc: guild.description ?? 'No server description.',
                footer: 'Server Info',

                fields: [

                    /**
                     * GENERAL
                     */
                    {
                        name: 'General',

                        value: [
                            `Owner: ${owner}`,
                            `Created: <t:${created}:F>`,
                            `Created Relative: <t:${created}:R>`,
                            `Server ID: \`${guild.id}\``,
                            `Shard ID: ${guild.shardId ?? 'N/A'}`
                        ].join('\n'),

                        inline: false
                    },

                    /**
                     * MEMBERS
                     */
                    {
                        name: 'Members',

                        value: [
                            `Total: ${guild.memberCount}`,
                            `Humans: ${cachedHumans}`,
                            `Bots: ${cachedBots}`,
                            `Max Members: ${guild.maximumMembers ?? 'Unknown'}`
                        ].join('\n'),

                        inline: true
                    },

                    /**
                     * CHANNELS
                     */
                    {
                        name: 'Channels',

                        value: [
                            `Text: ${textChannels}`,
                            `Voice: ${voiceChannels}`,
                            `Stages: ${stageChannels}`,
                            `Forums: ${forumChannels}`,
                            `Categories: ${categoryChannels}`,
                            `Threads: ${threadChannels}`
                        ].join('\n'),

                        inline: true
                    },

                    /**
                     * SERVER STATS
                     */
                    {
                        name: 'Server',

                        value: [
                            `Roles: ${roles}`,
                            `Emojis: ${emojis}`,
                            `Stickers: ${stickers}`,
                            `Events: ${scheduledEvents}`,
                            `Boosts: ${boosts}`,
                            `Boost Tier: ${boostTier}`
                        ].join('\n'),

                        inline: true
                    },

                    /**
                     * SECURITY
                     */
                    {
                        name: 'Security',

                        value: [
                            `Verification: ${guild.verificationLevel}`,
                            `NSFW Level: ${guild.nsfwLevel}`,
                            `MFA Level: ${guild.mfaLevel}`,
                            `Content Filter: ${guild.explicitContentFilter}`
                        ].join('\n'),

                        inline: true
                    },

                    /**
                     * SETTINGS
                     */
                    {
                        name: 'Settings',

                        value: [
                            `Locale: ${guild.preferredLocale}`,
                            `Notifications: ${guild.defaultMessageNotifications}`,
                            `AFK Timeout: ${guild.afkTimeout}s`,
                            `Max Bitrate: ${guild.maximumBitrate / 1000}kbps`,
                            `Max Upload: ${uploadLimit}MB`
                        ].join('\n'),

                        inline: true
                    },

                    /**
                     * FEATURES
                     */
                    {
                        name: 'Features',

                        value: features,

                        inline: false
                    }

                ]
            },

            /**
             * MEDIA
             */
            thumbnail: ace.media.guild(),
            image: guild.banner
            ? ace.media.guild('banner')
            : undefined,
            footerIcon: ace.media.local("branding")
        });

    }

};

export default command;
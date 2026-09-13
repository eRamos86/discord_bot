import * as Discord from 'discord.js';
import * as ace from '@framework';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import play from 'play-dl';

const command: ace.Command = {
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: "`/play <url/search>`",
        example: "`/play https://youtube.com/watch?v=...`"
    },
    data: new Discord.SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The URL or search term for the song')
                .setRequired(true)
        ),
    async execute(ctx) {
        if (!ctx.guild || !ctx.member) return;

        const query = ctx.isInteraction ? ctx.interaction.options.getString('query') : ctx.args.join(' ');

        if (!query) {
            return ctx.error({
                title: 'Missing Query',
                desc: 'Please provide a URL or search term.'
            });
        }

        const member = ctx.member as Discord.GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return ctx.error({
                title: 'Not in a Voice Channel',
                desc: 'You must be in a voice channel to play music.'
            });
        }

        try {
            await ctx.deferReply();

            let videoInfo;
            if (query.startsWith('http')) {
                videoInfo = await play.video_info(query);
            } else {
                const searchResults = await play.search(query, { limit: 1 });
                if (!searchResults.length) {
                    return ctx.editReply({
                        embeds: [
                            new Discord.EmbedBuilder().setTitle('Not Found').setDescription('Could not find any songs matching your query.').setColor('Red')
                        ]
                    });
                }
                videoInfo = await play.video_info(searchResults[0].url);
            }

            const stream = await play.stream_from_info(videoInfo);
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });

            const player = createAudioPlayer();
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: ctx.guild.id,
                adapterCreator: ctx.guild.voiceAdapterCreator as any,
            });

            connection.subscribe(player);
            player.play(resource);

            return ctx.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle('Now Playing')
                        .setDescription(`[${videoInfo.video_details.title}](${videoInfo.video_details.url})`)
                        .setThumbnail(videoInfo.video_details.thumbnails[0].url)
                        .setColor('#0099ff')
                ]
            });
        } catch (error) {
            console.error('Play error:', error);
            if (ctx.isInteraction && ctx.interaction.deferred) {
                return ctx.editReply('An error occurred while trying to play the song.');
            }
            return ctx.error({
                title: 'Error',
                desc: 'An error occurred while trying to play the song.'
            });
        }
    }
};

export default command;

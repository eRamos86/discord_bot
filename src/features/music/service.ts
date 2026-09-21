import {
    AudioPlayerStatus,
    StreamType,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    demuxProbe,
    entersState,
    joinVoiceChannel,
    type AudioPlayer,
    type AudioResource,
    type VoiceConnection,
} from '@discordjs/voice';
import type { GuildMember } from 'discord.js';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { reportError, requireValue } from '../../framework/runtime/errors.js';
interface Session {
    connection: VoiceConnection;
    player: AudioPlayer;
    queue: string[];
    current: string | null;
    volume: number;
    resource?: AudioResource;
    idle?: ReturnType<typeof setTimeout>;
}
export class MusicService {
    private readonly sessions = new Map<string, Session>();
    catalog(): Record<string, string> {
        const raw: unknown = JSON.parse(process.env.MUSIC_TRACKS_JSON ?? '{}');
        requireValue(raw && typeof raw === 'object' && !Array.isArray(raw), 'Invalid music catalog.');
        return raw as Record<string, string>;
    }
    private async file(id: string) {
        const entry = this.catalog()[id];
        requireValue(
            typeof entry === 'string' && process.env.MUSIC_LIBRARY_DIR,
            'Choose a configured music track.',
        );
        const root = await realpath(process.env.MUSIC_LIBRARY_DIR);
        const target = await realpath(path.resolve(root, entry));
        requireValue(
            target.startsWith(root + path.sep) && /\.(ogg|webm)$/i.test(target),
            'Music must be a local Opus Ogg/WebM file inside the library.',
        );
        const file = await stat(target);
        requireValue(file.isFile() && file.size <= 100_000_000, 'Music file exceeds 100 MB.');
        return target;
    }
    private async next(guildId: string, s: Session) {
        const id = s.queue.shift();
        s.current = id ?? null;
        if (!id) {
            s.idle = setTimeout(() => this.stop(guildId), 60000);
            s.idle.unref();
            return;
        }
        try {
            const stream = createReadStream(await this.file(id));
            const probe = await demuxProbe(stream);
            requireValue(
                [StreamType.OggOpus, StreamType.WebmOpus].includes(probe.type),
                'Tracks must contain Opus audio.',
            );
            s.resource = createAudioResource(probe.stream, { inputType: probe.type, inlineVolume: true });
            s.resource.volume?.setVolume(s.volume);
            s.player.play(s.resource);
        } catch (error) {
            reportError(error, 'music_playback');
            this.stop(guildId);
        }
    }
    async play(member: GuildMember, id: string) {
        await this.file(id);
        const channel = member.voice.channel;
        requireValue(channel && channel.isVoiceBased(), 'Join a voice channel first.');
        let s = this.sessions.get(member.guild.id);
        if (s)
            requireValue(
                s.connection.joinConfig.channelId === channel.id,
                'Join the bot voice channel to control playback.',
            );
        if (!s) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: member.guild.id,
                adapterCreator: member.guild.voiceAdapterCreator,
                selfDeaf: true,
            });
            const player = createAudioPlayer();
            s = { connection, player, queue: [], current: null, volume: 0.5 };
            this.sessions.set(member.guild.id, s);
            connection.subscribe(player);
            const session = s;
            player.on(AudioPlayerStatus.Idle, () => {
                void this.next(member.guild.id, session);
            });
            player.on('error', (error) => {
                reportError(error, 'music');
                this.stop(member.guild.id);
            });
            connection.on(VoiceConnectionStatus.Disconnected, () => this.stop(member.guild.id));
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            } catch (error) {
                this.stop(member.guild.id);
                throw error;
            }
        }
        requireValue(s.queue.length < 25, 'Music queue is full.');
        if (s.idle) clearTimeout(s.idle);
        s.queue.push(id);
        if (!s.current) {
            await this.next(member.guild.id, s);
            requireValue(
                this.sessions.has(member.guild.id),
                'Audio could not be played. Check the configured Opus file.',
            );
        }
    }
    control(member: GuildMember, action: string, value?: number) {
        const s = this.sessions.get(member.guild.id);
        requireValue(s, 'No active playback.');
        requireValue(
            member.voice.channelId === s.connection.joinConfig.channelId,
            'Join the bot voice channel first.',
        );
        if (action === 'pause') s.player.pause();
        else if (action === 'resume') s.player.unpause();
        else if (action === 'skip') s.player.stop();
        else if (action === 'stop') this.stop(member.guild.id);
        else if (action === 'volume') {
            requireValue(value !== undefined && value >= 0 && value <= 100, 'Volume must be 0–100.');
            s.volume = value / 100;
            s.resource?.volume?.setVolume(s.volume);
        }
        return `Now playing: ${s.current ?? 'none'}\nQueue: ${s.queue.join(', ') || 'empty'}`;
    }
    stop(guildId: string) {
        const s = this.sessions.get(guildId);
        if (!s) return;
        this.sessions.delete(guildId);
        if (s.idle) clearTimeout(s.idle);
        s.player.removeAllListeners();
        s.player.stop();
        s.connection.removeAllListeners();
        s.connection.destroy();
    }
    stopAll() {
        for (const id of this.sessions.keys()) this.stop(id);
    }
}
export const music = new MusicService();

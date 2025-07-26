import type { Guild, GuildChannel, GuildChannelResolvable, VoiceChannel } from "discord.js";
import { DMPErrors, DMPError } from "@illusicord/player/dmp_error";
import { StreamConnection } from "@illusicord/player/stream_connection";
import { entersState, joinVoiceChannel, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import { Illusive } from "@illusive/illusive";
import { RepeatMode, type DiscordTrack, type PlayerOptions } from "@illusicord/types";
import { Constants } from "@illusicord/constants";
import { Utils } from "@illusicord/player/utils";
import type { Player } from "@illusicord/player/player";

export class Queue<T = unknown> {
    player: Player;
    guild: Guild;
    connection?: StreamConnection;
    tracks: DiscordTrack[];
    is_playing: boolean;
    data?: T;
    options: PlayerOptions;
    repeat_mode: RepeatMode;
    destroyed: boolean;

    constructor(player: Player, guild: Guild, options: PlayerOptions) {
        this.tracks = [];
        this.is_playing = false;
        this.options = Constants.DEFAULT_PLAYER_OPTIONS;
        this.repeat_mode = RepeatMode.DISABLED;
        this.destroyed = false;
        this.player = player;
        this.guild = guild;
        this.options = { ...Constants.DEFAULT_PLAYER_OPTIONS, ...options };
    }
    get volume() {
        if (!this.connection)
            return Constants.DEFAULT_PLAYER_OPTIONS.volume;
        return this.connection.volume;
    }
    get paused() {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        if (!this.connection)
            throw new DMPError(DMPErrors.NO_VOICE_CONNECTION);
        if (!this.is_playing)
            throw new DMPError(DMPErrors.NOTHING_PLAYING);
        return this.connection.paused;
    }
    get now_playing() {
        return this.connection?.resource?.metadata ?? this.tracks[0];
    }

    async join(channelId: GuildChannelResolvable) {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        if (this.connection)
            return this;
        const channel = this.guild.channels.resolve(channelId);
        if (!channel)
            throw new DMPError(DMPErrors.UNKNOWN_VOICE);
        if (!Utils.is_voice_channel(channel as GuildChannel))
            throw new DMPError(DMPErrors.CHANNEL_TYPE_INVALID);
        let connection = joinVoiceChannel({
            guildId: channel.guild.id,
            channelId: channel.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: this.options.deafenOnJoin
        });
        let _connection;
        try {
            connection = await entersState(connection, VoiceConnectionStatus.Ready, 15 * 1000);
            _connection = new StreamConnection(connection, channel as VoiceChannel);
        }
        catch (err) {
            connection.destroy();
            throw new DMPError(DMPErrors.VOICE_CONNECTION_ERROR);
        }
        this.connection = _connection;
        if (Utils.is_stage_voice_channel(channel as GuildChannel)) {
            const _guild = channel.guild as Guild & {me: any, members: any};
            const me = (_guild).me ? (_guild).me : _guild.members.me;
            await me.voice.setSuppressed(false).catch(async (_: any) => {
                return await channel.guild.members.me!.voice.setRequestToSpeak(true).catch(() => null);
            });
        }
        this.connection!
            .on('start', (resource: {metadata: DiscordTrack}) => {
            this.is_playing = true;
            if (resource?.metadata?.discord_playback_data.is_first && resource?.metadata?.discord_playback_data.seek_time === 0)
                this.player.emit('songFirst', this, this.now_playing);
        })
            .on('end', async (_) => {
            if (this.destroyed) {
                this.player.emit('queueDestroyed', this);
                return;
            }
            this.is_playing = false;
            const old_song = this.tracks.shift();
            if (this.tracks.length === 0 && this.repeat_mode === RepeatMode.DISABLED) {
                this.player.emit('queueEnd', this);
                if (this.options.leaveOnEnd)
                    if (!this.is_playing)
                        this.leave();
                return;
            }
            else {
                if (this.repeat_mode === RepeatMode.SONG) {
                    this.tracks.unshift(old_song!);
                    this.tracks[0].discord_playback_data.is_first = false;
                    this.player.emit('songChanged', this, this.tracks[0], old_song);
                    return this.play(this.tracks[0], { immediate: true });
                }
                else if (this.repeat_mode === RepeatMode.QUEUE) {
                    this.tracks.push(old_song!);
                    this.tracks[this.tracks.length - 1].discord_playback_data.is_first = false;
                    this.player.emit('songChanged', this, this.tracks[0], old_song);
                    return this.play(this.tracks[0], { immediate: true });
                }
                this.player.emit('songChanged', this, this.tracks[0], old_song);
                return this.play(this.tracks[0], { immediate: true });
            }
        })
            .on('error', (err) => this.player.emit('error', err.message, this));
        return this;
    }

    async play(play_track: DiscordTrack, opts: {
        immediate?: boolean;
        seek?: number;
        index?: number;
    }) {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        if (!this.connection)
            throw new DMPError(DMPErrors.NO_VOICE_CONNECTION);

        const queue_size = this.tracks.length;
        if (!opts?.immediate && queue_size !== 0 && opts.index) {
            if (opts.index >= 0 && ++opts.index <= queue_size)
                this.tracks.splice(opts.index, 0, play_track);
            else
                this.tracks.push(play_track);
            this.player.emit('songAdd', this, play_track);
            return play_track;
        }
        else if (!opts?.immediate) {                                   
            play_track.discord_playback_data.is_first = true;
            if (opts.index && opts?.index >= 0 && ++opts.index <= queue_size)
                this.tracks.splice(opts.index, 0, play_track);
            else
                this.tracks.push(play_track);
            this.player.emit('songAdd', this, play_track);
        }
        else if (opts.seek)
            this.tracks[0].discord_playback_data.seek_time = opts.seek;
        play_track = this.tracks[0];
        if (play_track.discord_playback_data.seek_time)
            opts.seek = play_track.discord_playback_data.seek_time;

        if(opts?.immediate === true || queue_size === 0){
            let download_url;
            try {
                download_url = await Illusive.get_download_url("", play_track, (this.options.yt_quality ?? "18") as string);
            }
            catch (e){
                console.error(e);
                this.skip();
                return;
            }
            if("error" in download_url) { this.skip(); return; }
        
            const resource = this.connection.create_audio_stream(download_url.url.replace(Illusive.media_archive_path, ''), {
                metadata: play_track,
                inputType: StreamType.Arbitrary
            });
            this.connection.play_audio_stream(resource)
                .then(__ => {
                this.set_volume(this.options.volume ?? 100);
            }).catch(e => e);
            return play_track;
        }
        return play_track;
    }

    async seek(time: number) {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        if (!this.is_playing)
            throw new DMPError(DMPErrors.NOTHING_PLAYING);
        if (isNaN(time))
            return;
        if (time < 1)
            time = 0;
        if (time >= this.now_playing.duration)
            return this.skip();
        await this.play(this.now_playing, {
            immediate: true,
            seek: time
        });
        return true;
    }

    skip(index = 0) {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        if (!this.connection)
            throw new DMPError(DMPErrors.NO_VOICE_CONNECTION);
        this.tracks.splice(1, index);
        const skipped_song = this.tracks[0];
        this.connection.stop();
        return skipped_song;
    }

    stop() {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        if (this.options.leaveOnStop) {
            this.leave();
        }
        else {
            this.clear_queue();
            this.skip();
        }
    }

    shuffle() {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        const current_track = this.tracks.shift();
        this.tracks = Illusive.shuffle_tracks("SHUFFLE", this.tracks) as DiscordTrack[];
        this.tracks.unshift(current_track!);
        return this.tracks;
    }

    set_paused(state = true) {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        if (!this.connection)
            throw new DMPError(DMPErrors.NO_VOICE_CONNECTION);
        if (!this.is_playing)
            throw new DMPError(DMPErrors.NOTHING_PLAYING);
        return this.connection.set_pause_state(state);
    }

    remove(index: number) {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        return this.tracks.splice(index, 1)[0];
    }

    set_volume(volume: number) {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        if (!this.connection)
            throw new DMPError(DMPErrors.NO_VOICE_CONNECTION);
        this.options.volume = volume;
        return this.connection.set_volume(volume);
    }

    clear_queue() {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        const currently_playing = this.tracks.shift();
        this.tracks = [currently_playing!];
    }

    set_repeat_mode(repeat_mode: RepeatMode) {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        if (![RepeatMode.DISABLED, RepeatMode.QUEUE, RepeatMode.SONG].includes(repeat_mode))
            throw new DMPError(DMPErrors.UNKNOWN_REPEAT_MODE);
        if (repeat_mode === this.repeat_mode)
            return false;
        this.repeat_mode = repeat_mode;
        return true;
    }

    // create_progress_bar(options: ProgressBarOptions) {
    //     if (this.destroyed)
    //         throw new DMPError(DMPErrors.QUEUE_DESTROYED);
    //     if (!this.is_playing)
    //         throw new DMPError(DMPErrors.NOTHING_PLAYING);
    //     return new ProgressBar(this, options);
    // }

    set_data(data: any) {
        if (this.destroyed)
            throw new DMPError(DMPErrors.QUEUE_DESTROYED);
        this.data = data;
    }

    leave() {
        this.destroyed = true;
        this.connection?.leave();
        this.player.delete_queue(this.guild.id);
    }
}
import { createAudioResource, createAudioPlayer, entersState, VoiceConnectionStatus, VoiceConnectionDisconnectReason, AudioPlayerStatus } from "@discordjs/voice";
import { EventEmitter } from "events";
import { promisify } from "util";
import { DMPError, DMPErrors } from "./dmp_error";
import type { StageChannel, VoiceChannel } from "discord.js";
import type { AudioResource, VoiceConnection, AudioPlayer, StreamType } from "@discordjs/voice";
import type { Readable } from "stream";
import type { DiscordTrack } from "../types";

const wait = promisify(setTimeout);
export class StreamConnection extends EventEmitter {
    readonly connection: VoiceConnection;
    readonly player: AudioPlayer;
    channel: VoiceChannel | StageChannel;
    resource?: AudioResource<DiscordTrack>;
    paused: boolean;
    private ready_lock;

    constructor(connection: VoiceConnection, channel: VoiceChannel|StageChannel) {
        super();
        this.paused = false;
        this.ready_lock = false;
        this.connection = connection;
        this.player = createAudioPlayer();
        this.channel = channel;
        this.connection.on('stateChange', async (_, new_state) => {
            if (new_state.status === VoiceConnectionStatus.Disconnected) {
                if (new_state.reason === VoiceConnectionDisconnectReason.WebSocketClose && new_state.closeCode === 4014) {
                    try {
                        // Attempting to re-join the voice channel, after possibly changing channels
                        await entersState(this.connection, VoiceConnectionStatus.Connecting, 5000);
                    }
                    catch {
                        // It was mannually disconnected and the connection is closed in Player.js _voiceUpdate
                    }
                }
                else if (this.connection.rejoinAttempts < 5) {
                    await wait((this.connection.rejoinAttempts + 1) * 5000);
                    this.connection.rejoin();
                }
                else {
                    this.leave();
                }
            }
            else if (new_state.status === VoiceConnectionStatus.Destroyed) {
                this.stop();
            }
            else if (!this.ready_lock &&
                (new_state.status === VoiceConnectionStatus.Connecting || new_state.status === VoiceConnectionStatus.Signalling)) {
                this.ready_lock = true;
                try {
                    await this.enter_state();
                }
                catch {
                    this.leave();
                }
                finally {
                    this.ready_lock = false;
                }
            }
        });
        this.player
            .on('stateChange', (oldState, new_state) => {
            if (new_state.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                if (!this.paused) {
                    this.emit('end', this.resource);
                    delete this.resource;
                    return;
                }
            }
            else if (new_state.status === AudioPlayerStatus.Playing) {
                if (!this.paused) {
                    this.emit('start', this.resource);
                    return;
                }
            }
        })
            .on('error', data => {
            this.emit('error', data);
        });
        this.connection.subscribe(this.player);
    }
    get volume() {
        if (!this.resource?.volume)
            return 100;
        const currentVol = this.resource.volume.volume;
        return Math.round(Math.pow(currentVol, 1 / 1.661) * 200);
    }
    get time() {
        if (!this.resource)
            return 0;
        return this.resource.playbackDuration;
    }

    create_audio_stream(stream: Readable|string, options: { inputType: StreamType, metadata: any }) {
        console.log(options)
        this.resource = createAudioResource(stream, {
            inputType: options.inputType,
            inlineVolume: false,
            metadata: options.metadata
        });
        return this.resource;
    }

    async enter_state() {
        await entersState(this.connection, VoiceConnectionStatus.Ready, 20000);
    }

    async play_audio_stream(resource: AudioResource<DiscordTrack>): Promise<StreamConnection> {
        if (!resource)
            throw new DMPError(DMPErrors.RESOURCE_NOT_READY);
        if (!this.resource)
            this.resource = resource;
        if (this.connection.state.status !== VoiceConnectionStatus.Ready)
            await this.enter_state();
        this.player.play(resource);
        return this;
    }

    set_pause_state(state: boolean) {
        if (state) {
            this.player.pause(true);
            this.paused = true;
            return true;
        }
        else {
            this.player.unpause();
            this.paused = false;
            return false;
        }
    }

    stop() {
        return this.player.stop();
    }

    leave() {
        this.player.stop(true);
        if (this.connection.state.status !== VoiceConnectionStatus.Destroyed)
            this.connection.destroy();
    }

    set_volume(volume: number) {
        if (!this.resource || this.invalid_volume(volume))
            return false;
        this.resource.volume?.setVolumeLogarithmic(volume / 200);
        return true;
    }

    invalid_volume(volume: number) {
        return (isNaN(volume) ||
            volume >= Infinity ||
            volume < 0);
    }
}
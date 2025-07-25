import { ChannelType, type GuildChannel } from "discord.js";
import type { DiscordTrack } from "@illusicord/types";
import type { Track } from "@illusive/types";

export namespace Utils { 
    export function is_voice_channel(Channel: GuildChannel) {
        const type = Channel.type;
        if (typeof type === 'string')
            return ['GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(type);
        else
            return [ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(type);
    }
    export function is_stage_voice_channel(Channel: GuildChannel) {
        const type = Channel.type;
        if (typeof type === 'string')
            return type === 'GUILD_STAGE_VOICE';
        else
            return type === ChannelType.GuildStageVoice;
    }
    export function track_to_discord_track(track: Track): DiscordTrack {
        return {
            ...track,
            discord_playback_data: {
                is_first: false,
                seek_time: 0,
            }
        };
    }
};
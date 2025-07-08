import type { Channel, Client, Message, OmitPartialGroupDMChannel } from "discord.js";
import type { Player } from "./player/player";
import { RepeatMode, type DiscordTrack } from "./types";
import type { MusicServiceType, Track } from "../../types";
import { is_empty } from "../../../../origin/src/utils/util";
import { Illusive } from "../../illusive";
import { MEDIA } from "./media";
import { play_track_discord_recieve } from "../../discord";
import { Utils } from "./player/utils";
import { Constants } from "./constants";
import { duration_to_string } from "../../illusive_utilts";

export type DiscordClient = Client & { player: Player };
export type DiscordMessage = OmitPartialGroupDMChannel<Message>;
export type IllusicordCommand = (client: DiscordClient, message: DiscordMessage, args: string[]) => Promise<void>;

function guild_queue(client: DiscordClient, message: DiscordMessage){
    return client.player.get_queue(message.guild!.id)!;
}

export function track_to_string(track: DiscordTrack){
    return `\`${(track?.title ?? "")} | ${track?.artists[0].name ?? ""} | ${duration_to_string(track?.duration ?? 0).duration}\``;
}

let channel_id = "";
let disable_messages = false;
export function send_message(client: DiscordClient, content: string){
    console.log(content);
    if(disable_messages) return;
    console.log("[MSG]: " + content);
    if(is_empty(channel_id) || is_empty(content) || typeof content !== "string") return;
    const text_channel: Channel & {send: (content: string) => void} = client.channels.cache.get(channel_id)! as any;
    text_channel.send(content);
}

function get_best_channel(message: OmitPartialGroupDMChannel<Message>){
    return message.guild?.channels.cache.filter(channel => channel.isVoiceBased() && channel.members.size > 0).first();
}

async function get_playlist_tracks(args: string[], service: MusicServiceType): Promise<DiscordTrack[]> {
    return (await Illusive.music_service.get(service)!.get_full_playlist(args.join(' '))).tracks.map(Utils.track_to_discord_track);
}

async function play_base(client: DiscordClient, message: DiscordMessage, tracks: (Track[]) | (() => Promise<Track|undefined>)[]){
    if(tracks.length === 0) return;
    const has_queue = client.player.has_queue(message.guild!.id);
    const queue = has_queue ? client.player.get_queue(message.guild!.id)! : client.player.create_queue(message.guild!.id);
    if(!has_queue) await queue.join(message.member?.voice.channel ?? get_best_channel(message)!).catch(err => send_message(client, "[ERROR]: " + err));
    if(typeof tracks[0] === "function"){
        for(const track_function of tracks as (() => Promise<DiscordTrack|undefined>)[]){
            const maybe_track = await track_function();
            if(maybe_track)
                await queue.play(maybe_track, {}).catch(err => send_message(client, err));
        }
    }
    else {
        for(const track of (tracks as Track[]).map(Utils.track_to_discord_track)){
            await queue.play(track, {}).catch(err => send_message(client, err));
        }
    }

}

function get_search_track_functions(args: string[], service: MusicServiceType){
    const queries = args.join(' ').split(' && ')
    const track_functions = queries.map(query => async() => (await Illusive.music_service.get(service)!.search!(query)).tracks.map(Utils.track_to_discord_track)[0]);
    return track_functions;
}

const COMMANDS: Record<string, IllusicordCommand> = {
    "help": async(client, message, args) => {
        await play_base(client, message, get_search_track_functions(args, "YouTube Music"));
    },
    "play": async(client, message, args) => {
        await play_base(client, message, get_search_track_functions(args, "YouTube Music"));
    },
    "play_yt": async(client, message, args) => {
        await play_base(client, message, get_search_track_functions(args, "YouTube"));
    },
    "lafou": async(client, message, args) => {
        await play_base(client, message, get_search_track_functions(args, "SoundCloud"));
    },
    "local": async(client, message, args) => {
        await play_base(client, message, args.map(index => MEDIA.find((_, media_index) => media_index === parseInt(index) - 1)! ));
    },
    "illusno": async(client, message, args) => {
        await play_base(client, message, [play_track_discord_recieve(args.join(' '))]);
    },
    "playlist": async(client, message, args) => {
        disable_messages = true;
        const tracks = await get_playlist_tracks(args, "YouTube Music");
        await play_base(client, message, tracks);
        disable_messages = false;
        send_message(client, `Added \`${tracks.length}\` Songs`);
    },
    "skip": async(client, message, _) => {
        guild_queue(client, message)?.skip();
    },
    "stop": async(client, message, _) => {
        guild_queue(client, message)?.stop();
    },
    "removeLoop": async(client, message, _) => {
        guild_queue(client, message)?.set_repeat_mode(RepeatMode.DISABLED);
    },
    "toggleLoop": async(client, message, _) => {
        guild_queue(client, message)?.set_repeat_mode(RepeatMode.SONG);
    },
    "toggleQueueLoop": async(client, message, _) => {
        guild_queue(client, message)?.set_repeat_mode(RepeatMode.QUEUE);
    },
    "volume": async(client, message, args) => {
        guild_queue(client, message)?.set_volume(parseInt(args[0]));
    },
    "seek": async(client, message, args) => {
        guild_queue(client, message)?.seek(parseInt(args[0])).catch(e => e);
    },
    "clear": async(client, message, _) => {
        guild_queue(client, message)?.clear_queue();
    },
    "shuffle": async(client, message, _) => {
        guild_queue(client, message)?.shuffle();
    },
    "queue": async(client, message, _) => {
        let str = '';
        const guild_tracks = guild_queue(client, message).tracks;
        for(let i = 0; i < Math.min(20, guild_tracks.length); i++){
            const track = guild_tracks[i];
            str += `> Queued (${i + 1}) -> ` + track_to_string(track) + '\n';
        }
        if(Math.min(20, guild_tracks.length) !== guild_tracks.length) str += `... +${guild_tracks.length - 20} Songs\n`;
        send_message(client, str);
    },
    "media": async(client, _, __) => {
        let str = '';
        for(let i = 0; i < MEDIA.length; i++){
            const track = MEDIA[i];
            str += `> Media (${i + 1}) -> ` + track_to_string(track) + '\n';
        }
        send_message(client, str);
    },
    "pause": async(client, message, _) => {
        guild_queue(client, message)?.set_paused(true);
    },
    "resume": async(client, message, _) => {
        guild_queue(client, message)?.set_paused(false);
    },
    "remove": async(client, message, args) => {
        guild_queue(client, message)?.remove(parseInt(args[0]) - 1);
    },
};

export async function on_message_create(client: DiscordClient, message: DiscordMessage){
    try {
        if (message.author.bot && message.webhookId === null) return;

        const args = message.content.slice(Constants.SETTINGS_PREFIX.length).trim().split(/ +/g);
        const command_id = args.shift()!;
        channel_id = message.channelId;

        COMMANDS[command_id](client, message, args).catch(e => send_message(client, "[ERROR]: " + e));
    }
    catch(e) {
        send_message(client, "[ERROR]: " + (e as any));
    }
}
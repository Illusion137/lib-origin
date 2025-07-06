// import { dotenv } from "./config";
// import { Player } from "./discord-music-player/Player";
// import { RepeatMode } from "./discord-music-player/types/types";
// import * as Discord from "discord.js";
// import { Prefs } from "./lib-origin/Illusive/src/prefs";
// import { CookieJar } from "./lib-origin/origin/src/utils/cookie_util";
// import { Queue } from "./discord-music-player/managers/Queue";
// import { Song } from "./discord-music-player/managers/Song";
// import { is_empty } from "./lib-origin/origin/src/utils/util";
// import { MEDIA } from "./media";
// import { MusicServicePlaylist, Track } from "./lib-origin/Illusive/src/types";
// import { Illusive } from "./lib-origin/Illusive/src/illusive";
// import { Utils } from "./discord-music-player/utils/Utils";
// import { shuffle_array } from "./lib-origin/Illusive/src/illusive_utilts";
// import { play_track_discord_recieve } from "./lib-origin/Illusive/src/discord";

// // Prefs.prefs.youtube_cookie_jar.current_value = CookieJar.fromString(dotenv.YOUTUBE_COOKIES);
// // Prefs.prefs.use_cookies_on_download.current_value = true;

// const client: Discord.Client & { player: Player } = <any>new Discord.Client({
//     intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.MessageContent]
// });

// const player = new Player(client, {
//     leaveOnEnd: false,
//     timeout: 1000 * 600,
//     deafenOnJoin: true,
//     leaveOnStop: true,
//     leaveOnEmpty: false, // This options are optional.
// });
// // You can define the Player as *client.player* to easily access it.

// client.player = player;

// function songToString(song: Song){
//     return `\`${(song?.name ?? "")} | ${song?.author ?? ""} | ${song?.duration ?? ""}\``;
// }
// function trackToString(track: Track){
//     return `\`${(track?.title ?? "")} | ${track?.artists[0].name ?? ""} | ${track?.duration ?? ""}\``;
// }
// let channel_id: string = "";
// let disable_messages = false;
// function sendMessage(content: string){
//     console.log(content);
//     if(disable_messages) return;
//     console.log("[MSG]: " + content);
//     if(is_empty(channel_id) || is_empty(content) || typeof content !== "string") return;
//     const text_channel: Discord.Channel & {send: (content: string) => void} = client.channels.cache.get(channel_id)! as any;
//     text_channel.send(content);
// }

// // Init the event listener only once (at the top of your code).
// client.player
//     .on('channelEmpty', (queue) => console.log(`Everyone left the Voice Channel, queue ended.`))
//     .on('songAdd', (queue, song) => sendMessage("> Added -> " + songToString(song!)))
//     .on('playlistAdd', (queue, playlist) => console.log(`Playlist ${playlist} with ${playlist.songs.length} was added to the queue.`))
//     .on('queueDestroyed', (queue) => console.log(`The queue was destroyed.`))
//     .on('queueEnd', (queue) => console.log(`The queue has ended.`))
//     .on('songChanged', (queue, newSong, oldSong) => console.log(`${newSong} is now playing.`))
//     .on('songFirst', (queue, song) => sendMessage(`> Started playing -> ` + songToString(song)))
//     .on('clientDisconnect', (queue) => console.log(`I was kicked from the Voice Channel, queue ended.`))
//     .on('clientUndeafen', (queue) => console.log(`I got undefeanded.`))
//     .on('error', (error, queue) => sendMessage(`[ERROR]: ${error} in ${queue.guild.name}`));
    
// const settings_prefix = "!";

// function getBestChannel(message: Discord.OmitPartialGroupDMChannel<Discord.Message<boolean>>){
//     return message.guild?.channels.cache.filter(channel => channel.isVoiceBased() && channel.members.size > 0).first();
// }

// client.on("ready", () => console.log("Illusi is Ready 🎶"));
// client.on('messageCreate', async (message) => {
//     try {
//         if (message.author.bot && message.webhookId === null) return;

//         const args = message.content.slice(settings_prefix.length).trim().split(/ +/g);
//         const command = args.shift()!;
//         const guild_queue = client.player.get_queue(message.guild!.id)!;

//         channel_id = message.channelId;
    
//         if (command === 'play' || command === 'lafou' || command === 'music' || command === 'local') {
//             const play_opts: Parameters<Queue<any>['play']>[1] =  {'type': command === 'play' ? "YouTube" : command === 'lafou' ? "SoundCloud" : "YouTube Music"};
//             const has_queue = client.player.has_queue(message.guild!.id);
//             const queue = has_queue ? client.player.get_queue(message.guild!.id)! : client.player.create_queue(message.guild!.id);
//             if(!has_queue) await queue.join(message.member?.voice.channel ?? getBestChannel(message)!).catch(err => sendMessage("[ERROR]: " + err));
//             if(command === 'local'){
//                 for(const song_index_str of args.join(' ').split(' && ')){
//                     try {
//                         const song_index = parseInt(song_index_str) - 1;
//                         const song = await queue.play(song_index).catch(err => sendMessage(err));
//                     } catch (error) {
//                         sendMessage("[ERROR]: " + error);
//                     }
//                 }
//                 return;
//             }
//             for(const song_item of args.join(' ').split(' && ')){
//                 const song = await queue.play(song_item, play_opts).catch(err => sendMessage(err));
//             }
//         }

//         if (command === 'illusno') {
//             const arg = play_track_discord_recieve(args.join(' '));
//             const play_opts: Parameters<Queue<any>['play']>[1] = {};
//             const has_queue = client.player.has_queue(message.guild!.id);
//             const queue = has_queue ? client.player.get_queue(message.guild!.id)! : client.player.create_queue(message.guild!.id);
//             if(!has_queue) await queue.join(message.member?.voice.channel ?? getBestChannel(message)!).catch(err => sendMessage("[ERROR]: " + err));
//             const song = await queue.play(arg, play_opts).catch(err => sendMessage(err));
//         }

//         if (command === 'playlist') {
//             const has_queue = client.player.has_queue(message.guild!.id);
//             const queue = has_queue ? client.player.get_queue(message.guild!.id)! : client.player.create_queue(message.guild!.id);
//             if(!has_queue) await queue.join(message.member?.voice.channel! ?? getBestChannel(message)!).catch(err => sendMessage("[ERROR]: " + err));
//             const playlist: MusicServicePlaylist = await Illusive.music_service.get('YouTube')!.get_full_playlist(args.join('').trim()).catch(err => {
//                 sendMessage("[ERROR]: " + JSON.stringify(err));
//                 return {tracks: []} as any;
//             });
//             if("error" in playlist){
//                 sendMessage("[ERROR]: " + playlist.error);
//             }
//             disable_messages = true;
//             for(const track of playlist.tracks.map(track => {
//                 return new Song({
//                     name: track.title,
//                     thumbnail: "",
//                     url: track.youtube_id!,
//                     type: "YouTube",
//                     author: track.artists[0].name,
//                     duration: Utils.ms_to_time(track.duration * 1000),
//                     isLive: false
//                 }, queue, <any>{});
//             })){
//                 const song = await queue.play(track).catch(err => console.log(err));
//             }
//             disable_messages = false;
//             sendMessage(`Added \`${playlist.tracks.length}\` Songs`);
//         }
    
//         // if (command === 'playlist') {
//         //     let queue = client.player.create_queue(message.guild!.id);
//         //     await queue.join(message.member!.voice.channel!);
//         //     await queue.playlist(args.join(' ')).catch(err => { console.log(err); if (!guild_queue) queue.stop(); });
//         // }
//         if (command === 'skip') { guild_queue?.skip(); }
//         if (command === 'stop') { guild_queue?.stop(); }
//         if (command === 'removeLoop') { guild_queue?.setRepeatMode(RepeatMode.DISABLED); } // or 0 instead of RepeatMode.DISABLED
//         if (command === 'toggleLoop') { guild_queue?.setRepeatMode(RepeatMode.SONG); } // or 1 instead of RepeatMode.SONG
//         if (command === 'toggleQueueLoop') { guild_queue?.setRepeatMode(RepeatMode.QUEUE); } // or 2 instead of RepeatMode.QUEUE
//         if (command === 'setVolume') { guild_queue?.setVolume(parseInt(args[0])); }
//         if (command === 'seek') { guild_queue?.seek(parseInt(args[0]) * 1000); }
//         if (command === 'clearQueue') { guild_queue?.clearQueue(); }
//         if (command === 'shuffle') { guild_queue?.shuffle(); }
//         if (command === 'queue') { 
//             let str = '';
//             for(let i = 0; i < Math.min(20, guild_queue.songs.length); i++){
//                 const song = guild_queue.songs[i];
//                 str += `> Queued (${i + 1}) -> ` + songToString(song) + '\n';
//             }
//             if(Math.min(20, guild_queue.songs.length) !== guild_queue.songs.length) str += `... +${guild_queue.songs.length - 20} Songs\n`;
//             sendMessage(str);
//         }
//         if (command === 'media') {
//             let str = '';
//             for(let i = 0; i < MEDIA.length; i++){
//                 const track = MEDIA[i];
//                 str += `> Media (${i + 1}) -> ` + trackToString(track) + '\n';
//             }
//             sendMessage(str);
//         }
//         if (command === 'getVolume') { console.log(guild_queue.volume); }
//         if (command === 'nowPlaying') { console.log(`Now playing: ${guild_queue.nowPlaying}`); }
//         if (command === 'pause') { guild_queue?.setPaused(true); }
//         if (command === 'resume') { guild_queue?.setPaused(false); }
//         if (command === 'remove') { guild_queue?.remove(parseInt(args[0]) - 1); }
//         if (command === 'createProgressBar') { const ProgressBar = guild_queue.createProgressBar({}); console.log(ProgressBar.prettier); }
//     } catch (error) {
//         sendMessage("[ERROR]: " + error);
//     }
// })

// client.login(dotenv.TOKEN);
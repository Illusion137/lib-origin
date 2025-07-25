import { Config } from "@illusicord/config";
import { Client, GatewayIntentBits } from "discord.js";
import { on_message_create, send_message, track_to_string, type DiscordClient } from "@illusicord/cmds";
import { Player } from "@illusicord/player/player";

const client: DiscordClient = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent]
}) as any;

const player = new Player(client, {
    leaveOnEnd: false,
    timeout: 1000 * 600,
    deafenOnJoin: true,
    leaveOnStop: true,
    leaveOnEmpty: false, // This options are optional.
});
client.player = player;

// Init the event listener only once (at the top of your code).
client.player
    .on('channelEmpty', () => console.log(`Everyone left the Voice Channel, queue ended.`))
    .on('songAdd', (_, song) => send_message(client, "> Added -> " + track_to_string(song)))
    // .on('playlistAdd', (_, playlist) => console.log(`Playlist ${playlist} with ${playlist.songs.length} was added to the queue.`))
    .on('queueDestroyed', () => console.log(`The queue was destroyed.`))
    .on('queueEnd', () => console.log(`The queue has ended.`))
    .on('songChanged', (_, newSong, __) => console.log(`${newSong} is now playing.`))
    .on('songFirst', (_, song) => send_message(client, `> Started playing -> ` + track_to_string(song)))
    .on('clientDisconnect', () => console.log(`I was kicked from the Voice Channel, queue ended.`))
    .on('clientUndeafen', () => console.log(`I got undefeanded.`))
    .on('error', (error, queue) => send_message(client, `[ERROR]: ${error} in ${queue.guild.name}`));
    
client.on("ready", () => console.log("Illusi is Ready 🎶"));
client.on('messageCreate', async(message) => on_message_create(client, message));

client.login(Config.dotenv.TOKEN).catch(e => console.error(e));
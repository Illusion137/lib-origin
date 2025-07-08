import { Collection } from "discord.js";
import type { Client, Snowflake, VoiceState } from "discord.js";
import type { PlayerOptions } from "../types";
import EventEmitter from "events";
import { Queue } from "./queue";
import { DMPError, DMPErrors } from "./dmp_error";
import { Constants } from "../constants";

export class Player<OptionsData = any> extends EventEmitter {
    client: Client;
    queues: Collection<Snowflake, Queue<OptionsData>>;
    options: PlayerOptions;

    constructor(client: Client, options: PlayerOptions = {}) {
        super();
        this.queues = new Collection();
        this.options = Constants.DEFAULT_PLAYER_OPTIONS;
        this.client = client;
        this.options = Object.assign({}, this.options, options);
        this.queues = new Collection();
        this.client.on('voiceStateUpdate', (old_state, new_state) => {
            this.voice_update(old_state, new_state);
        });
    }

    create_queue<D extends OptionsData>(guild_id: Snowflake, options: PlayerOptions&{data?: D} = this.options): Queue<D> {
        options = Object.assign({}, this.options, options);
        const guild = this.client.guilds.resolve(guild_id);
        if (!guild)
            throw new DMPError(DMPErrors.INVALID_GUILD);
        if (this.has_queue(guild_id) && !this.get_queue(guild_id)?.destroyed)
            return this.get_queue(guild_id)! as Queue<D>;
        const { data } = options;
        delete options.data;
        const queue = new Queue<D>(this, guild, options);
        queue.data = data;
        this.set_queue(guild_id, queue);
        return queue;
    }

    has_queue(guild_id: Snowflake) {
        return !!this.queues.get(guild_id);
    }

    get_queue(guild_id: Snowflake): Queue<OptionsData> | undefined {
        return this.queues.get(guild_id);
    }

    set_queue(guild_id: Snowflake, queue: Queue<OptionsData>) {
        this.queues.set(guild_id, queue);
    }

    delete_queue(guild_id: Snowflake) {
        this.queues.delete(guild_id);
    }

    voice_update(old_state: VoiceState, new_state: VoiceState) {
        const queue = this.queues.get(old_state.guild.id);
        if (!queue?.connection)
            return;
        const { deafenOnJoin, leaveOnEmpty, timeout } = queue.options;
        if (!new_state.channelId && this.client.user?.id === old_state.member?.id) {
            queue.leave();
            return void this.emit('clientDisconnect', queue);
        }
        else if (deafenOnJoin && old_state.serverDeaf && !new_state.serverDeaf) {
            this.emit('clientUndeafen', queue);
        }
        if (old_state.channelId === new_state.channelId)
            return;
        if (!leaveOnEmpty || queue.connection.channel.members.size > 1)
            return;
        setTimeout(() => {
            if (queue.connection!.channel.members.size > 1)
                return;
            if (queue.connection!.channel.members.has(this.client.user!.id)) {
                queue.leave();
                this.emit('channelEmpty', queue);
            }
        }, timeout);
    }
}
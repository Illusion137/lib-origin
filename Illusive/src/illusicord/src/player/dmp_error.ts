export enum DMPErrors {
    UNKNOWN = "Unknown",
    QUEUE_DESTROYED = "QueueDestroyed",
    NOTHING_PLAYING = "NothingPlaying",
    UNKNOWN_VOICE = "UnknownVoice",
    CHANNEL_TYPE_INVALID = "ChannelTypeInvalid",
    VOICE_CONNECTION_ERROR = "VoiceConnectionError",
    NO_VOICE_CONNECTION = "NoVoiceConnection",
    UNKNOWN_REPEAT_MODE = "UnknownRepeatMode",
    RESOURCE_NOT_READY = "ResourceNotReady",
    INVALID_GUILD = "InvalidGuild",
    SEARCH_NULL = "SearchIsNull",
    INVALID_PLAYLIST = "InvalidPlaylist",
    INVALID_SPOTIFY = "InvalidSpotify",
    INVALID_APPLE = "InvalidApple",
    UNKNOWN_SONG = "UnknownSong"
}
export class DMPError extends Error {
    /**
     * DMPError constructor
     * @param {DMPErrors} code
     */
    constructor(code = DMPErrors.UNKNOWN) {
        super();
        /**
         * DMPError short name (code)
         * @name DMPError#name
         * @type {string}
         */
        /**
         * DMPError long message
         * @name DMPError#message
         * @type {string}
         */
        this.name = code;
        this.message = exports.DMPErrorMessages[code] ?? exports.DMPErrorMessages[DMPErrors.UNKNOWN];
    }
    /**
     * DMPError in JSON representation
     * @returns {{message: string, code: string}}
     */
    toJSON() {
        return { message: this.message, code: this.name };
    }
    /**
     * DMPError in string representation
     * @returns {string}
     */
    toString() {
        return this.message;
    }
}
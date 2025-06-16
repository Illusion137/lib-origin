// if (condition) {
//     import('something')
//     .then((something) => {
//        console.log(something.something);
//     });
// }

export default interface NativeBridge {
    Wifi: {
        ip_address:     () => Promise<string>;
        network_state:  () => Promise<string>;
        wifi_connected: () => Promise<boolean>;
        has_internet:   () => Promise<boolean>;
    };
    Alert: {
        
    };
    Sqlite;
    Audio;
    ImagePicker;
    DocumentPicker;
    Haptics;
    FFMPEG;
    Sharing;
    Trackplayer;
    Awake;
};
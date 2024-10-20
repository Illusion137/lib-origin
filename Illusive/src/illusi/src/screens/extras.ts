import { Ionicons } from '@expo/vector-icons';
type ExtraSubscreens = 
    "Backup, Recover, & Transfer"|
    "Settings"|
    "Sleep Timer"|
    "External Services"|
    "Other Playlists"|
    "Batch Downloader"|
    "Playlist Converter"|
    "Linker"|
    "Backpack"|
    "Developer";
type IoniconsGlyphs = keyof (typeof Ionicons)["glyphMap"];
interface OptionNav {
    icon: IoniconsGlyphs
    title: ExtraSubscreens
}
interface OptionPress {
    icon: IoniconsGlyphs
    title: string
    confirm: boolean
    on_press: () => any
}

interface ExtrasSection {
    options: (OptionNav|OptionPress)[]
    bottom_text: string
}
export const extras_sections: ExtrasSection[] = [
    {
        "options": [
            {"icon": "refresh-outline", "title": "Backup, Recover, & Transfer"},
        ],
        "bottom_text": "Backup your music, transfer your playlists to other devices, recover deleted music and more"
    },
    {
        "options": [
            {"icon": "settings-outline", "title": "Settings"},
            {"icon": "timer-outline", "title": "Sleep Timer"},
            {"icon": "cog-outline", "title": "External Services"},
        ],
        "bottom_text": "Sign into external Music Services such as YouTube, Spotify, Apple Music, etc... for extra features"
    },
    {
        "options": [
            {"icon": "musical-note-outline",   "title": "Other Playlists"},
            {"icon": "file-tray-stacked-outline",    "title": "Batch Downloader"},
            {"icon": "list-circle-outline", "title": "Playlist Converter"},
            {"icon": "link-outline",    "title": "Linker"},
        ],
        "bottom_text": "Hard Link playlist and other data from other Music Services. Automatically fetched on app startup"
    },
    {
        "options": [
            {"icon": "folder-outline", "title": "Backpack"},
        ],
        "bottom_text": "Restore unavailable music from Backpack"
    },
    {
        "options": [
            {"icon": "logo-github",            "title": "Github",              "confirm": false, "on_press": () => {}},
            {"icon": "file-tray-outline", "title": "Zip all Data",        "confirm": false, "on_press": () => {}},
            {"icon": "sync",     "title": "Reset Settings",      "confirm": true, "on_press": () => {}},
            {"icon": "trash-outline",     "title": "Clear Playlist Data", "confirm": true, "on_press": () => {}},
            {"icon": "trash-outline",     "title": "Clear All Data",      "confirm": true, "on_press": () => {}},
        ],
        "bottom_text": "Manage your data; clear your data or export it back to your files app"
    },
    {
        "options": [
            {"icon": "hammer-outline", "title": "Developer"},
        ],
        "bottom_text": "Developer Tools"
    }
];
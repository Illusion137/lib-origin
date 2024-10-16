import { Ionicons } from '@expo/vector-icons';
export type ExtraSubscreens = 
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
export interface OptionNav {
    icon: IoniconsGlyphs
    title: ExtraSubscreens
}
export interface OptionPress {
    icon: IoniconsGlyphs
    title: string
    confirm: boolean
    on_press: () => any
}
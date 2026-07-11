import { createStore } from 'zustand/vanilla';

export interface SelectionStoreState {
    selected_playlists_uuids: ReadonlySet<string>;
    toggle_selected_playlist: (playlist_uuid: string) => void;
    clear_selected_playlists: () => void;
}

export const selection_store = createStore<SelectionStoreState>()((set) => ({
    selected_playlists_uuids: new Set<string>(),
    toggle_selected_playlist: (playlist_uuid) => set(state => {
        const selected_playlists_uuids = new Set(state.selected_playlists_uuids);
        if (selected_playlists_uuids.has(playlist_uuid)) selected_playlists_uuids.delete(playlist_uuid);
        else selected_playlists_uuids.add(playlist_uuid);
        return { selected_playlists_uuids };
    }),
    clear_selected_playlists: () => set({ selected_playlists_uuids: new Set<string>() }),
}));

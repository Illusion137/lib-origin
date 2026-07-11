import { createStore } from 'zustand/vanilla';
import type { Track } from '@illusive/types';

export interface TrackStoreState {
    tracks: Track[];
    tracks_by_uid: ReadonlyMap<Track['uid'], Track>;
    revision: number;
    set_tracks: (tracks: Track[]) => void;
    add_track: (track: Track) => void;
    add_tracks: (tracks: Track[]) => void;
    update_track: (track_uid: Track['uid'], new_track: Track) => void;
    update_all_track_property: <T extends keyof Track>(prop: T, value: Track[T]) => void;
    delete_track: (track_uid: Track['uid']) => void;
    bump_revision: () => void;
}

function build_tracks_by_uid(tracks: Track[]): Map<Track['uid'], Track> {
    return new Map(tracks.map(track => [track.uid, track]));
}

export const track_store = createStore<TrackStoreState>()((set) => ({
    tracks: [],
    tracks_by_uid: new Map<Track['uid'], Track>(),
    revision: 0,
    set_tracks: (tracks) => set(state => ({
        tracks,
        tracks_by_uid: build_tracks_by_uid(tracks),
        revision: state.revision + 1
    })),
    add_track: (track) => set(state => {
        const tracks = [...state.tracks, track];
        const tracks_by_uid = new Map(state.tracks_by_uid);
        tracks_by_uid.set(track.uid, track);
        return { tracks, tracks_by_uid, revision: state.revision + 1 };
    }),
    add_tracks: (new_tracks) => set(state => {
        if (new_tracks.length === 0) return state;
        const tracks = state.tracks.concat(new_tracks);
        const tracks_by_uid = new Map(state.tracks_by_uid);
        for (const track of new_tracks) tracks_by_uid.set(track.uid, track);
        return { tracks, tracks_by_uid, revision: state.revision + 1 };
    }),
    update_track: (track_uid, new_track) => set(state => {
        const idx = state.tracks.findIndex(track => track.uid === track_uid);
        if (idx === -1) return state;
        const tracks = state.tracks.slice();
        tracks[idx] = new_track;
        const tracks_by_uid = new Map(state.tracks_by_uid);
        tracks_by_uid.delete(track_uid);
        tracks_by_uid.set(new_track.uid, new_track);
        return { tracks, tracks_by_uid, revision: state.revision + 1 };
    }),
    update_all_track_property: (prop, value) => set(state => {
        const tracks = state.tracks.map(track => ({ ...track, [prop]: value }));
        return { tracks, tracks_by_uid: build_tracks_by_uid(tracks), revision: state.revision + 1 };
    }),
    delete_track: (track_uid) => set(state => {
        const idx = state.tracks.findIndex(track => track.uid === track_uid);
        if (idx === -1) return state;
        const tracks = state.tracks.slice();
        tracks.splice(idx, 1);
        const tracks_by_uid = new Map(state.tracks_by_uid);
        tracks_by_uid.delete(track_uid);
        return { tracks, tracks_by_uid, revision: state.revision + 1 };
    }),
    // For callers that mutated shared state out-of-band and only need subscribers to
    // re-read (e.g. tint table regeneration) — refreshes the array identity only.
    bump_revision: () => set(state => ({ tracks: state.tracks.slice(), revision: state.revision + 1 })),
}));

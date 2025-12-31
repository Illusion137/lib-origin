import type { LT1720 } from '@illusive/legacy/1720/legacy_types';
import { Illusive } from '@illusive/illusive';
import { SQLfs } from '@illusive/sql/sql_fs';
import type { ResponseError } from '@common/types';

export namespace LSQLParser {
    export function sql_playlist_to_playlist_no_visual_data(sql_playlist: LT1720.SQLPlaylist): LT1720.Playlist{
        return {
            ...sql_playlist,
            inherited_playlists: JSON.parse(sql_playlist.inherited_playlists ?? "[]"),
            linked_playlists: JSON.parse(sql_playlist.linked_playlists ?? "[]"),
            inherited_searchs: JSON.parse(sql_playlist.inherited_searchs ?? "[]"),
            visual_data: undefined,
            date: new Date(sql_playlist.date!).toISOString()
        };
    }
    export function sql_playlist_to_playlist(sql_playlist: LT1720.SQLPlaylist): LT1720.Playlist {
        const playlist_no_visual_data = sql_playlist_to_playlist_no_visual_data(sql_playlist);
        return playlist_no_visual_data;
    }
    const bad_artist_names = [',', '&', 'and'];
    export function sql_track_to_track(sql_track: LT1720.SQLTrack): LT1720.Track|ResponseError {
        try {
            const meta: LT1720.TrackMetaData = JSON.parse(sql_track.meta!);
            return {
                ...sql_track,
                uid: sql_track.uid,
                artists: JSON.parse(sql_track.artists).filter((artist: LT1720.NamedUUID) => !bad_artist_names.includes(artist.name.trim())),
                album: JSON.parse(sql_track.album!),
                prods: sql_track.prods?.trim(),
                tags: JSON.parse(sql_track.tags!),
                explicit: sql_track.explicit,
                unreleased: Boolean(sql_track.unreleased),
                meta: {
                    ...meta,
                    plays: meta.plays ?? 0,
                    added_date: meta.added_date ?? new Date(0).toISOString(),
                    last_played_date: meta.last_played_date ?? new Date(0).toISOString()
                },
                playback: {artwork: Illusive.get_track_artwork(SQLfs.document_directory(""), sql_track as unknown as LT1720.Track), added: false, successful: false},
                downloading_data: {} as never
            };
        } catch (error) {
            return {error: new Error((error as Error).message, {'cause': JSON.stringify(sql_track)})};
        }
    }
    export function sql_tracks_to_tracks(sql_tracks: LT1720.SQLTrack[]): LT1720.Track[]{
        const tracks = sql_tracks.map(sql_track_to_track);
        return tracks.filter(track => !("error" in track)) as LT1720.Track[];
    }
}

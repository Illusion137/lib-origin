import type { LT1720 } from '@illusive/legacy/1720/legacy_types';
import type { ResponseError } from '@common/types';
import type { NamedUUID } from '@illusive/types';
import { try_json_parse } from '@common/utils/parse_util';
import { is_empty } from '@common/utils/util';

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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {id, Timestamp, ...sql_track_clean} = sql_track as any;
            const meta: LT1720.TrackMetaData = JSON.parse(sql_track_clean.meta);
            const album = JSON.parse(sql_track_clean.album) as NamedUUID;
            if((album as any).uri === "") album.uri = null;

            for(const key of Object.keys(sql_track_clean)){ 
                if(sql_track_clean[key] === null || sql_track_clean[key] === undefined){
                    delete sql_track_clean[key];
                }
            }

            return {
                ...sql_track_clean,
                uid: sql_track_clean.uid,
                alt_title: sql_track_clean.alt_title === "null" ? "" : 
                    sql_track_clean.alt_title ?? "",
                artists: JSON.parse(sql_track_clean.artists).filter((artist: LT1720.NamedUUID) => !bad_artist_names.includes(artist.name.trim())),
                album: album,
                prods: sql_track_clean.prods?.trim(),
                tags: JSON.parse(sql_track_clean.tags),
                explicit: sql_track_clean.explicit,
                unreleased: Boolean(sql_track_clean.unreleased),
                meta: {
                    ...meta,
                    plays: meta.plays ?? 0,
                    added_date: meta.added_date ?? new Date(0).toISOString(),
                    last_played_date: meta.last_played_date ?? new Date(0).toISOString()
                },
            } as LT1720.Track;
        } catch (error) {
            console.error(error);
            return {error: new Error((error as Error).message, {'cause': JSON.stringify(sql_track)})};
        }
    }
    export function sql_tracks_to_tracks(sql_tracks: LT1720.SQLTrack[]): LT1720.Track[]{
        const tracks = sql_tracks.map(sql_track_to_track);
        return tracks.filter(track => !("error" in track)) as LT1720.Track[];
    }
    export async function sql_compact_playlist_to_compact_playlist(sql_playlist: LT1720.SQLCompactPlaylist): Promise<LT1720.CompactPlaylist>{
        const title = try_json_parse<NamedUUID>(sql_playlist.title);
        const artist = try_json_parse<NamedUUID[]>(sql_playlist.artist);
        const artwork_thumbnails = is_empty(sql_playlist.artwork_thumbnails) ? undefined : try_json_parse<LT1720.IllusiveThumbnail[]>(sql_playlist.artwork_thumbnails!);
        const song_track = is_empty(sql_playlist.song_track) ? undefined : try_json_parse<LT1720.Track>(sql_playlist.song_track!);
        return {
            ...sql_playlist,
            title: "error" in title ? {name: "UNKNOWN", uri: null} : title,
            artist: "error" in artist ? [] : artist,
            artwork_thumbnails: artwork_thumbnails === undefined || "error" in artwork_thumbnails ? undefined : artwork_thumbnails,
            song_track: song_track === undefined || song_track === null || "error" in song_track ? undefined : song_track
        }
    }
}

    
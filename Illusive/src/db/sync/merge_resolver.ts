import { is_empty } from '@common/utils/util';
import type {
    LocalPlaylist,
    LocalPlaylistTrack,
    LocalTrack,
    RemotePlaylist,
    RemotePlaylistTrack,
    RemoteTrackWithUserData,
} from './types';

export namespace MergeResolver {
    export function resolve_track(local: LocalTrack, remote: RemoteTrackWithUserData): LocalTrack {
        return {
            ...local,
            duration: !is_empty(local.duration) ? local.duration : remote.duration,
            plays: 0,
            deleted: local.deleted ?? remote.deleted
        };
    }

    export function resolve_playlist(local: LocalPlaylist, remote: RemotePlaylist): LocalPlaylist {
        return {
            ...local,
            archived: local.archived ?? remote.archived,
            artwork_path: local.artwork_path ?? remote.artwork_path,
            deleted: local.deleted ?? remote.deleted
        };
    }

    export function resolve_playlist_track(local: LocalPlaylistTrack, _remote: RemotePlaylistTrack): LocalPlaylistTrack {
        return local;
    }
}

import { json_catch, milliseconds_of } from "@common/utils/util";
import { GLOBALS } from "./globals";
import type { CompactPlaylist, MusicServiceType, Track } from "./types";
import { FutsalShuffle } from "./futsal_shuffle";
import { reinterpret_cast } from "@common/cast";
import { Illusive } from "./illusive";
import { SQLfs } from "./sql/sql_fs";
import { SQLTracks } from "./sql/sql_tracks";
import { catch_log, generror, generror_catch } from "@common/utils/error_util";
import type { ResponseError } from "@common/types";
import { SQLNewReleases } from "./sql/sql_new_releases";
import { get_most_played_artists, should_automatic_refresh } from "./illusive_utils";
import { artist_watch } from "./artist_watch";
import { Prefs } from "./prefs";
import { call_wtimeout } from "@common/utils/timed_util";

export namespace Explore {
    const YT_MUSIC_TOP_TRACKS_PLAYLIST_URL = "PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI";
    const FORGOTTEN_FAVORITES_SLICE = 50;

    function alert_new_releases(new_releases_length: number, updated_new_releases_length: number, old_persistant: CompactPlaylist[], new_persistant: CompactPlaylist[]) {
		if (updated_new_releases_length - new_releases_length !== 0) {
			const total_added = updated_new_releases_length - new_releases_length;
			const total_new = new_persistant.length - old_persistant.length;
			const hidden = total_added - total_new;
			GLOBALS.global_var.bottom_alert(`Refreshed New Releases From YTMusic`, "INFO", `${total_new} Added, ${hidden} Hidden`);
		}
	}

    type GetPersistantNewReleases = (refreshed?: boolean) => Promise<CompactPlaylist[]>;
    export async function refresh_new_releases(get_persistant_new_releases: GetPersistantNewReleases, on_progress: () => any): Promise<(CompactPlaylist | ResponseError)[] | ResponseError> {
		const most_played_artists = get_most_played_artists(GLOBALS.global_var.sql_tracks);
		const new_releases_length = await SQLNewReleases.new_releases_count();
		const old_persistant = await get_persistant_new_releases(true);
		const artist_watch_new_releases: (CompactPlaylist[] | ResponseError)[] | ResponseError = await artist_watch(most_played_artists, on_progress).catch(json_catch);
		if ("error" in artist_watch_new_releases) return artist_watch_new_releases;
		const filtered_new_releases = (artist_watch_new_releases.filter((r) => !("error" in r)) as CompactPlaylist[][]).flat();
		await SQLNewReleases.refresh_new_releases(filtered_new_releases);
		const updated_new_releases_length = await SQLNewReleases.new_releases_count();
		const persistant = await get_persistant_new_releases(true);
		alert_new_releases(new_releases_length, updated_new_releases_length, old_persistant, persistant);
		return persistant;
	}

	export async function refresh_service_new_releases(music_service_type: MusicServiceType, get_persistant_new_releases: GetPersistantNewReleases, set_is_loading: (value: boolean) => any) {
		const music_service = Illusive.music_service.get(music_service_type)!;
        if(music_service.get_new_releases === undefined) {
            console.warn(generror("Trying to grab new releases of bad Music Service (likely not supported)", "MEDIUM", {music_service_type}))
            return;
        }
		const old_persistant = await get_persistant_new_releases(true);
		const external_new_releases = await music_service.get_new_releases();
		const new_releases_length = await SQLNewReleases.new_releases_count();
		await SQLNewReleases.insert_all_into_new_releases(external_new_releases);
		const updated_new_releases_length = await SQLNewReleases.new_releases_count();
		const persistant = await get_persistant_new_releases(true);
		alert_new_releases(new_releases_length, updated_new_releases_length, old_persistant, persistant);
		set_is_loading(false);
	}

    export async function refresh_all_services_new_releases(get_persistant_new_releases: GetPersistantNewReleases, set_is_loading: (value: boolean) => any){
        const service_types: MusicServiceType[] = ["YouTube Music", "SoundCloud"];
        for(const type of service_types){
            const music_service = Illusive.music_service.get(type)!;
            const should_service_refresh_new_releases = music_service.has_credentials() && should_automatic_refresh(Prefs.get_pref("automatic_new_releases_last_refreshed"));
			if (should_service_refresh_new_releases) {
				call_wtimeout(async() => await refresh_service_new_releases("YouTube Music", get_persistant_new_releases, set_is_loading), milliseconds_of({ seconds: 8 })).catch(catch_log);
			}
        }
		await Prefs.save_pref("automatic_new_releases_last_refreshed", new Date());
    }

    export function get_forgotten_favorites(): CompactPlaylist[] {
		const max_plays =
			GLOBALS.global_var.sql_tracks
				.filter((track) => (track.meta?.plays ?? 0) > 0)
				.map((track) => track.meta?.plays ?? 0)
				.sort((a, b) => b - a)?.[0] ?? 0;
		const okay_amount_of_plays = max_plays * 0.15;
		if (okay_amount_of_plays === 0) return [];
		const potential_tracks = GLOBALS.global_var.sql_tracks.filter((track) => {
			if ((track.meta?.plays ?? 0) < okay_amount_of_plays) return false;
			const last_played = new Date(track.meta?.last_played_date ?? 0).getTime();
			if (last_played === 0) return false;
			return Date.now() - last_played >= milliseconds_of({ months: 1 });
		});
		if (potential_tracks.length === 0) return [];
		const potential_weighted_tracks = potential_tracks.map((track) => ({ weight: track.meta?.plays ?? 0, value: track })).slice(0, FORGOTTEN_FAVORITES_SLICE * 3);
		const shuffle_weighted_tracks = FutsalShuffle.shuffle_weighted(potential_weighted_tracks);
		return shuffle_weighted_tracks.slice(0, FORGOTTEN_FAVORITES_SLICE).map((track) => ({
			title: { name: track.title, uri: null },
			artist: track.artists,
			album_type: "SONG",
			artwork_url: reinterpret_cast<string>(Illusive.get_track_artwork(SQLfs.document_directory(), track)),
			explicit: track.explicit,
			song_track: track,
			type: "ALBUM"
		}));
	}
    export async function get_top_tracks(): Promise<Track[]>{
        try {
            const playlist = await Illusive.music_service.get("YouTube Music")!.get_playlist(YT_MUSIC_TOP_TRACKS_PLAYLIST_URL, {
                cache_opts: {
                    cache_ms: milliseconds_of({ days: 1 }),
                    cache_on: "url",
                    cache_mode: "file",
                    cache_ms_fail: 0
                }
            });
            if ("error" in playlist) return [];
            playlist.tracks = SQLTracks.add_playback_saved_data_to_tracks(playlist.tracks);
            return playlist.tracks;
        }
        catch(e){
            console.warn(generror_catch(e, "Top Tracks generated an error", "MEDIUM", { YT_MUSIC_TOP_TRACKS_PLAYLIST_URL }));
            return [];
        }
    }
}
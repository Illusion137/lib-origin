import { generate_new_uid } from '@common/utils/util';
import { best_thumbnail, create_uri, date_from } from '@illusive/illusive_utils';
import type { CompactArtist, CompactPlaylist, ISOString, MusicServiceRelatedSection, NamedUUID, Track } from '@illusive/types';
import { parse_track_title_artist } from '@illusive/parsers/title_parser';
import type { YTMAlbum, YTMArtist, YTMArtistRef, YTMRelatedSection, YTMTrack } from '@origin/youtube/parser';

export function ytm_named(ref: YTMArtistRef): NamedUUID {
	return { name: ref.name, uri: ref.browse_id === undefined ? null : create_uri('youtubemusic', ref.browse_id) };
}

export function ytm_track(track: YTMTrack): Track {
	return parse_track_title_artist({
		uid: generate_new_uid(track.title),
		title: track.title,
		artists: track.artists.map(ytm_named),
		album: track.album === undefined ? undefined : ytm_named(track.album),
		duration: track.duration_seconds ?? NaN,
		youtube_id: track.video_id,
		artwork_url: best_thumbnail(track.thumbnails)?.url,
		explicit: track.explicit ? 'EXPLICIT' : 'NONE',
		plays: track.views ?? 0
	});
}

export function ytm_album(album: YTMAlbum, type: CompactPlaylist['type'] = 'ALBUM'): CompactPlaylist {
	return {
		title: { name: album.title, uri: album.browse_id === undefined ? null : create_uri('youtubemusic', album.browse_id) },
		artist: album.artists.map(ytm_named),
		artwork_thumbnails: album.thumbnails,
		artwork_url: best_thumbnail(album.thumbnails)?.url,
		explicit: album.explicit ? 'EXPLICIT' : 'NONE',
		type,
		album_type: album.album_type,
		date: album.year === undefined ? undefined : date_from({ year: parseInt(album.year) }).toISOString() as ISOString
	};
}

export function ytm_artist(artist: YTMArtist): CompactArtist {
	return {
		name: { name: artist.name, uri: artist.browse_id === undefined ? null : create_uri('youtubemusic', artist.browse_id) },
		profile_artwork_url: best_thumbnail(artist.thumbnails)?.url,
		is_official_artist_channel: true
	};
}

export function ytm_related_sections(sections: YTMRelatedSection[]): MusicServiceRelatedSection[] {
	return sections.map(section => ({
		title: section.title,
		tracks: section.tracks.map(ytm_track),
		playlists: section.playlists.map(album => ytm_album(album))
	}));
}

import * as Origin from '@origin/index';
import { Prefs } from '@illusive/prefs';
import { get_ytm_ctx, parse_youtube_music_related_sections, watch_next_payload } from '@illusive/parsers/youtube_music_parser';
import { soundcloud_parse_track } from '@illusive/parsers/soundcloud_parser';
import type { MusicServiceRelated } from '@illusive/types';

export async function youtube_music_get_related(video_id: string): Promise<MusicServiceRelated> {
    const ctx = await get_ytm_ctx();
    if ("error" in ctx) return { sections: [], error: ctx };
    const watch_next = await Origin.YouTubeMusic.get_watch_next(ctx.opts, ctx.ytcfg, watch_next_payload(video_id));
    if ("error" in watch_next) return { sections: [], error: watch_next };
    if (!watch_next.related_browse_id) return { sections: [] };
    const related = await Origin.YouTubeMusic.get_related(ctx.opts, ctx.ytcfg, watch_next.related_browse_id);
    if ("error" in related) return { sections: [], error: related };
    return { sections: parse_youtube_music_related_sections(related) };
}

export async function soundcloud_get_related(track_id: string): Promise<MusicServiceRelated> {
    const cookie_jar = Prefs.get_pref("soundcloud_cookie_jar");
    const opts = { cookie_jar };
    const station = await Origin.SoundCloud.station_from_track({ ...opts, track_id: Number(track_id) });
    if ("error" in station) return { sections: [], error: station };
    const track_ids = station.tracks.map(t => String(t.id));
    if (track_ids.length === 0) return { sections: [] };
    const tracks_response = await Origin.SoundCloud.get_tracks({ ...opts, track_ids });
    if ("error" in tracks_response) return { sections: [] };
    return {
        sections: [{
            title: station.title,
            tracks: tracks_response.data.map(soundcloud_parse_track),
            playlists: []
        }]
    };
}

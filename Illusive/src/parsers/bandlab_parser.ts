import { generate_new_uid } from "@common/utils/util";
import { create_uri } from "@illusive/illusive_utils";
import type { Track } from "@illusive/types";
import type { BandLabProjects } from "@origin/bandlab/types/ProjectsList";

export function bandlab_parse_track(song: BandLabProjects['data'][0]): Track{
    const artists = [{name: song.author.name, uri: create_uri("bandlab", song.author.id)}];
    artists.push(...(
        song.collaborators
            .filter(artist => artist.id !== song.author.id)
            .map(artist => ({name: artist.name, uri: create_uri("bandlab", artist.id)}) )
        )
    );
    return {
        uid: generate_new_uid(song.name),
        title: song.name,
        artists: artists,
        duration: NaN,
        bandlab_id: song.id,
        artwork_url: song.picture.url
    };
}
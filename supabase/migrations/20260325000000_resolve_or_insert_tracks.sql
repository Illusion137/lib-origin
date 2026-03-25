-- ============================================================
-- RPC: resolve_or_insert_tracks
-- Atomically resolves service-ID collisions and inserts/enriches tracks.
-- For each incoming track:
--   1. Check if ANY service ID matches an existing global track
--   2. If match: enrich existing record, return its uid as canonical
--   3. If no match: insert new track, return local uid as canonical
-- ============================================================

CREATE OR REPLACE FUNCTION resolve_or_insert_tracks(tracks_json jsonb)
RETURNS TABLE(local_uid text, canonical_uid text)
LANGUAGE plpgsql AS $$
DECLARE
    t jsonb;
    found_uid text;
BEGIN
    FOR t IN SELECT * FROM jsonb_array_elements(tracks_json)
    LOOP
        found_uid := NULL;

        -- Check for service ID collision with any existing track
        SELECT tr.uid INTO found_uid
        FROM tracks tr
        WHERE tr.uid != (t->>'uid')
          AND (
            ((t->>'youtube_id')          != '' AND tr.youtube_id          = (t->>'youtube_id'))          OR
            ((t->>'youtubemusic_id')     != '' AND tr.youtubemusic_id     = (t->>'youtubemusic_id'))     OR
            ((t->>'soundcloud_id')::int  != 0  AND tr.soundcloud_id      = (t->>'soundcloud_id')::int)  OR
            ((t->>'soundcloud_permalink') != '' AND tr.soundcloud_permalink = (t->>'soundcloud_permalink')) OR
            ((t->>'spotify_id')          != '' AND tr.spotify_id          = (t->>'spotify_id'))          OR
            ((t->>'amazonmusic_id')      != '' AND tr.amazonmusic_id      = (t->>'amazonmusic_id'))      OR
            ((t->>'applemusic_id')       != '' AND tr.applemusic_id       = (t->>'applemusic_id'))       OR
            ((t->>'bandlab_id')          != '' AND tr.bandlab_id          = (t->>'bandlab_id'))          OR
            ((t->>'illusi_id')           != '' AND tr.illusi_id           = (t->>'illusi_id'))           OR
            ((t->>'imported_id')         != '' AND tr.imported_id         = (t->>'imported_id'))
          )
        LIMIT 1;

        IF found_uid IS NOT NULL THEN
            -- Enrich existing record: accumulate non-empty fields
            -- The tracks_enrich BEFORE UPDATE trigger handles first-writer-wins
            -- and service ID accumulation, so we just need to trigger an update.
            UPDATE tracks SET
                title               = CASE WHEN title = ''                      THEN COALESCE(NULLIF(t->>'title',''), title)                               ELSE title END,
                alt_title           = CASE WHEN alt_title = ''                  THEN COALESCE(NULLIF(t->>'alt_title',''), alt_title)                        ELSE alt_title END,
                artists             = CASE WHEN artists::text = '[]'            THEN COALESCE((t->'artists')::jsonb, artists)                               ELSE artists END,
                duration            = CASE WHEN duration = 0                    THEN COALESCE(NULLIF((t->>'duration')::int, 0), duration)                   ELSE duration END,
                prods               = CASE WHEN prods = ''                      THEN COALESCE(NULLIF(t->>'prods',''), prods)                                ELSE prods END,
                genre               = CASE WHEN genre = ''                      THEN COALESCE(NULLIF(t->>'genre',''), genre)                                ELSE genre END,
                tags                = CASE WHEN tags::text = '[]'               THEN COALESCE((t->'tags')::jsonb, tags)                                     ELSE tags END,
                explicit            = CASE WHEN explicit = 'NONE'               THEN COALESCE(NULLIF(t->>'explicit','NONE'), explicit)                      ELSE explicit END,
                album               = CASE WHEN album->>'name' = ''             THEN COALESCE((t->'album')::jsonb, album)                                   ELSE album END,
                artwork_url         = CASE WHEN artwork_url = ''                THEN COALESCE(NULLIF(t->>'artwork_url',''), artwork_url)                    ELSE artwork_url END,
                -- Service IDs: accumulate (never overwrite non-empty with empty)
                illusi_id           = CASE WHEN illusi_id = ''                   THEN COALESCE(NULLIF(t->>'illusi_id',''), illusi_id)                        ELSE illusi_id END,
                imported_id         = CASE WHEN imported_id = ''                THEN COALESCE(NULLIF(t->>'imported_id',''), imported_id)                    ELSE imported_id END,
                youtube_id          = CASE WHEN youtube_id = ''                 THEN COALESCE(NULLIF(t->>'youtube_id',''), youtube_id)                      ELSE youtube_id END,
                youtubemusic_id     = CASE WHEN youtubemusic_id = ''            THEN COALESCE(NULLIF(t->>'youtubemusic_id',''), youtubemusic_id)            ELSE youtubemusic_id END,
                soundcloud_id       = CASE WHEN soundcloud_id = 0              THEN COALESCE(NULLIF((t->>'soundcloud_id')::int, 0), soundcloud_id)         ELSE soundcloud_id END,
                soundcloud_permalink = CASE WHEN soundcloud_permalink = ''     THEN COALESCE(NULLIF(t->>'soundcloud_permalink',''), soundcloud_permalink)  ELSE soundcloud_permalink END,
                spotify_id          = CASE WHEN spotify_id = ''                 THEN COALESCE(NULLIF(t->>'spotify_id',''), spotify_id)                      ELSE spotify_id END,
                amazonmusic_id      = CASE WHEN amazonmusic_id = ''             THEN COALESCE(NULLIF(t->>'amazonmusic_id',''), amazonmusic_id)              ELSE amazonmusic_id END,
                applemusic_id       = CASE WHEN applemusic_id = ''              THEN COALESCE(NULLIF(t->>'applemusic_id',''), applemusic_id)                ELSE applemusic_id END,
                bandlab_id          = CASE WHEN bandlab_id = ''                 THEN COALESCE(NULLIF(t->>'bandlab_id',''), bandlab_id)                      ELSE bandlab_id END,
                modified_at         = now()
            WHERE uid = found_uid;

            local_uid := t->>'uid';
            canonical_uid := found_uid;
        ELSE
            -- No collision: insert or update with local uid
            INSERT INTO tracks (
                uid, title, alt_title, artists, duration, prods, genre, tags,
                explicit, unreleased, album, illusi_id, imported_id,
                youtube_id, youtubemusic_id, soundcloud_id, soundcloud_permalink,
                spotify_id, amazonmusic_id, applemusic_id, bandlab_id,
                artwork_url, created_at, modified_at
            ) VALUES (
                t->>'uid',
                COALESCE(t->>'title', ''),
                COALESCE(t->>'alt_title', ''),
                COALESCE((t->'artists')::jsonb, '[]'::jsonb),
                COALESCE((t->>'duration')::int, 0),
                COALESCE(t->>'prods', ''),
                COALESCE(t->>'genre', ''),
                COALESCE((t->'tags')::jsonb, '[]'::jsonb),
                COALESCE(t->>'explicit', 'NONE'),
                COALESCE((t->>'unreleased')::boolean, false),
                COALESCE((t->'album')::jsonb, '{"name":"","uri":null}'::jsonb),
                COALESCE(t->>'illusi_id', ''),
                COALESCE(t->>'imported_id', ''),
                COALESCE(t->>'youtube_id', ''),
                COALESCE(t->>'youtubemusic_id', ''),
                COALESCE((t->>'soundcloud_id')::int, 0),
                COALESCE(t->>'soundcloud_permalink', ''),
                COALESCE(t->>'spotify_id', ''),
                COALESCE(t->>'amazonmusic_id', ''),
                COALESCE(t->>'applemusic_id', ''),
                COALESCE(t->>'bandlab_id', ''),
                COALESCE(t->>'artwork_url', ''),
                COALESCE((t->>'created_at')::timestamptz, now()),
                now()
            )
            ON CONFLICT (uid) DO UPDATE SET
                modified_at = now();
            -- The tracks_enrich trigger handles accumulation on the DO UPDATE path

            local_uid := t->>'uid';
            canonical_uid := t->>'uid';
        END IF;

        RETURN NEXT;
    END LOOP;
END;
$$;

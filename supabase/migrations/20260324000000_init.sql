-- ============================================================
-- Illusive Supabase Schema
-- Local-first: SQLite is truth, Supabase is sync target
-- ============================================================

-- ============================================================
-- Cleanup old schema if present
-- ============================================================
DROP TABLE IF EXISTS releases CASCADE;
DROP TABLE IF EXISTS uptracks CASCADE;
DROP TABLE IF EXISTS utracks CASCADE;
DROP TABLE IF EXISTS playlists_tracks CASCADE;
DROP TABLE IF EXISTS new_releases CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;

-- ============================================================
-- Utility: auto-update modified_at on every table
-- ============================================================
CREATE OR REPLACE FUNCTION set_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: tracks (global enrichment pool — no user_uid)
-- All users contribute to and pull from this shared table.
-- ============================================================
CREATE TABLE tracks (
    uid                 text        PRIMARY KEY,
    title               text        NOT NULL DEFAULT '',
    alt_title           text        NOT NULL DEFAULT '',
    artists             jsonb       NOT NULL DEFAULT '[]',
    duration            int         NOT NULL DEFAULT 0,
    prods               text        NOT NULL DEFAULT '',
    genre               text        NOT NULL DEFAULT '',
    tags                jsonb       NOT NULL DEFAULT '[]',
    explicit            text        NOT NULL DEFAULT 'NONE',
    unreleased          boolean     NOT NULL DEFAULT false,
    album               jsonb       NOT NULL DEFAULT '{"name":"","uri":null}',
    illusi_id           text        NOT NULL DEFAULT '',
    imported_id         text        NOT NULL DEFAULT '',
    youtube_id          text        NOT NULL DEFAULT '',
    youtubemusic_id     text        NOT NULL DEFAULT '',
    soundcloud_id       int         NOT NULL DEFAULT 0,
    soundcloud_permalink text       NOT NULL DEFAULT '',
    spotify_id          text        NOT NULL DEFAULT '',
    amazonmusic_id      text        NOT NULL DEFAULT '',
    applemusic_id       text        NOT NULL DEFAULT '',
    bandlab_id          text        NOT NULL DEFAULT '',
    artwork_url         text        NOT NULL DEFAULT '',
    deleted             boolean     NOT NULL DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now(),
    modified_at         timestamptz NOT NULL DEFAULT now()
);

-- Partial unique indexes: one global record per service ID
-- These allow the dedup logic in the sync engine to find collisions.
CREATE UNIQUE INDEX tracks_youtube_id_idx       ON tracks(youtube_id)          WHERE youtube_id != '';
CREATE UNIQUE INDEX tracks_youtubemusic_id_idx  ON tracks(youtubemusic_id)     WHERE youtubemusic_id != '';
CREATE UNIQUE INDEX tracks_soundcloud_id_idx    ON tracks(soundcloud_id)       WHERE soundcloud_id != 0;
CREATE UNIQUE INDEX tracks_soundcloud_plink_idx ON tracks(soundcloud_permalink) WHERE soundcloud_permalink != '';
CREATE UNIQUE INDEX tracks_spotify_id_idx       ON tracks(spotify_id)          WHERE spotify_id != '';
CREATE UNIQUE INDEX tracks_amazonmusic_id_idx   ON tracks(amazonmusic_id)      WHERE amazonmusic_id != '';
CREATE UNIQUE INDEX tracks_applemusic_id_idx    ON tracks(applemusic_id)       WHERE applemusic_id != '';
CREATE UNIQUE INDEX tracks_bandlab_id_idx       ON tracks(bandlab_id)          WHERE bandlab_id != '';
CREATE UNIQUE INDEX tracks_illusi_id_idx        ON tracks(illusi_id)           WHERE illusi_id != '';
CREATE UNIQUE INDEX tracks_imported_id_idx      ON tracks(imported_id)         WHERE imported_id != '';

-- Enrichment trigger: first-writer-wins for metadata, accumulate for service IDs
-- Service IDs: keep existing non-empty value (never overwrite with empty)
-- Non-service metadata: keep existing non-empty/non-default value (first writer wins)
CREATE OR REPLACE FUNCTION tracks_enrich()
RETURNS TRIGGER AS $$
BEGIN
    -- Non-service metadata: first writer wins
    NEW.title               = CASE WHEN OLD.title != ''                         THEN OLD.title               ELSE NEW.title               END;
    NEW.alt_title           = CASE WHEN OLD.alt_title != ''                     THEN OLD.alt_title           ELSE NEW.alt_title           END;
    NEW.artists             = CASE WHEN OLD.artists::text != '[]'               THEN OLD.artists             ELSE NEW.artists             END;
    NEW.duration            = CASE WHEN OLD.duration != 0                       THEN OLD.duration            ELSE NEW.duration            END;
    NEW.prods               = CASE WHEN OLD.prods != ''                         THEN OLD.prods               ELSE NEW.prods               END;
    NEW.genre               = CASE WHEN OLD.genre != ''                         THEN OLD.genre               ELSE NEW.genre               END;
    NEW.tags                = CASE WHEN OLD.tags::text != '[]'                  THEN OLD.tags                ELSE NEW.tags                END;
    NEW.explicit            = CASE WHEN OLD.explicit != 'NONE'                  THEN OLD.explicit            ELSE NEW.explicit            END;
    NEW.unreleased          = CASE WHEN OLD.unreleased = true                   THEN OLD.unreleased          ELSE NEW.unreleased          END;
    NEW.album               = CASE WHEN OLD.album->>'name' != ''                THEN OLD.album               ELSE NEW.album               END;
    NEW.artwork_url         = CASE WHEN OLD.artwork_url != ''                   THEN OLD.artwork_url         ELSE NEW.artwork_url         END;

    -- Service IDs: accumulate (never overwrite non-empty with empty)
    NEW.illusi_id           = CASE WHEN OLD.illusi_id != ''                     THEN OLD.illusi_id           ELSE NEW.illusi_id           END;
    NEW.imported_id         = CASE WHEN OLD.imported_id != ''                   THEN OLD.imported_id         ELSE NEW.imported_id         END;
    NEW.youtube_id          = CASE WHEN OLD.youtube_id != ''                    THEN OLD.youtube_id          ELSE NEW.youtube_id          END;
    NEW.youtubemusic_id     = CASE WHEN OLD.youtubemusic_id != ''               THEN OLD.youtubemusic_id     ELSE NEW.youtubemusic_id     END;
    NEW.soundcloud_id       = CASE WHEN OLD.soundcloud_id != 0                  THEN OLD.soundcloud_id       ELSE NEW.soundcloud_id       END;
    NEW.soundcloud_permalink = CASE WHEN OLD.soundcloud_permalink != ''         THEN OLD.soundcloud_permalink ELSE NEW.soundcloud_permalink END;
    NEW.spotify_id          = CASE WHEN OLD.spotify_id != ''                    THEN OLD.spotify_id          ELSE NEW.spotify_id          END;
    NEW.amazonmusic_id      = CASE WHEN OLD.amazonmusic_id != ''                THEN OLD.amazonmusic_id      ELSE NEW.amazonmusic_id      END;
    NEW.applemusic_id       = CASE WHEN OLD.applemusic_id != ''                 THEN OLD.applemusic_id       ELSE NEW.applemusic_id       END;
    NEW.bandlab_id          = CASE WHEN OLD.bandlab_id != ''                    THEN OLD.bandlab_id          ELSE NEW.bandlab_id          END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tracks_before_update_enrich
    BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION tracks_enrich();

CREATE TRIGGER tracks_modified_at
    BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION set_modified_at();

-- ============================================================
-- TABLE: utracks (per-user track ownership + personal data)
-- ============================================================
CREATE TABLE utracks (
    id          bigserial   PRIMARY KEY,
    user_uid    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_uid   text        NOT NULL REFERENCES tracks(uid)    ON DELETE CASCADE,
    plays       int         NOT NULL DEFAULT 0,
    meta        jsonb       NOT NULL DEFAULT '{}',
    deleted     boolean     NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now(),
    modified_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_uid, track_uid)
);

CREATE TRIGGER utracks_modified_at
    BEFORE UPDATE ON utracks
    FOR EACH ROW EXECUTE FUNCTION set_modified_at();

-- ============================================================
-- TABLE: playlists (per-user)
-- ============================================================
CREATE TABLE playlists (
    id                  bigserial   PRIMARY KEY,
    uuid                text        NOT NULL UNIQUE,
    user_uid            uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
    title               text        NOT NULL DEFAULT '',
    description         text        NOT NULL DEFAULT '',
    pinned              boolean     NOT NULL DEFAULT false,
    archived            boolean     NOT NULL DEFAULT false,
    sort                text        NOT NULL DEFAULT 'OLDEST',
    public              boolean     NOT NULL DEFAULT false,
    public_uuid         text        NOT NULL DEFAULT '',
    inherited_playlists jsonb       NOT NULL DEFAULT '[]',
    inherited_searchs   jsonb       NOT NULL DEFAULT '[]',
    linked_playlists    jsonb       NOT NULL DEFAULT '[]',
    deleted             boolean     NOT NULL DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now(),
    modified_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER playlists_modified_at
    BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION set_modified_at();

-- ============================================================
-- TABLE: playlists_tracks (per-user junction)
-- ============================================================
CREATE TABLE playlists_tracks (
    id          bigserial   PRIMARY KEY,
    uuid        text        NOT NULL,
    track_uid   text        NOT NULL REFERENCES tracks(uid) ON DELETE CASCADE,
    deleted     boolean     NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now(),
    modified_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (uuid, track_uid)
);

CREATE TRIGGER playlists_tracks_modified_at
    BEFORE UPDATE ON playlists_tracks
    FOR EACH ROW EXECUTE FUNCTION set_modified_at();

-- ============================================================
-- TABLE: new_releases (per-user)
-- ============================================================
CREATE TABLE new_releases (
    id                  bigserial   PRIMARY KEY,
    user_uid            uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
    title               jsonb       NOT NULL DEFAULT '{"name":"","uri":null}',
    artist              jsonb       NOT NULL DEFAULT '[]',
    artwork_url         text        NOT NULL DEFAULT '',
    artwork_thumbnails  jsonb       NOT NULL DEFAULT '[]',
    explicit            text        NOT NULL DEFAULT 'NONE',
    album_type          text        NOT NULL DEFAULT 'SINGLE',
    type                text        NOT NULL DEFAULT 'ALBUM',
    date                text        NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
    song_track          jsonb,
    deleted             boolean     NOT NULL DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now(),
    modified_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER new_releases_modified_at
    BEFORE UPDATE ON new_releases
    FOR EACH ROW EXECUTE FUNCTION set_modified_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE tracks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE utracks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_releases  ENABLE ROW LEVEL SECURITY;

-- tracks: global — any authenticated user can read/write
CREATE POLICY "tracks_select" ON tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "tracks_insert" ON tracks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tracks_update" ON tracks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- utracks: only owner
CREATE POLICY "utracks_select" ON utracks FOR SELECT TO authenticated USING (user_uid = auth.uid());
CREATE POLICY "utracks_insert" ON utracks FOR INSERT TO authenticated WITH CHECK (user_uid = auth.uid());
CREATE POLICY "utracks_update" ON utracks FOR UPDATE TO authenticated USING (user_uid = auth.uid()) WITH CHECK (user_uid = auth.uid());

-- playlists: only owner
CREATE POLICY "playlists_select" ON playlists FOR SELECT TO authenticated USING (user_uid = auth.uid());
CREATE POLICY "playlists_insert" ON playlists FOR INSERT TO authenticated WITH CHECK (user_uid = auth.uid());
CREATE POLICY "playlists_update" ON playlists FOR UPDATE TO authenticated USING (user_uid = auth.uid()) WITH CHECK (user_uid = auth.uid());

-- playlists_tracks: owner inferred via playlist uuid
-- We trust the client to only write playlists_tracks for their own playlists.
CREATE POLICY "playlists_tracks_select" ON playlists_tracks FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM playlists p WHERE p.uuid = playlists_tracks.uuid AND p.user_uid = auth.uid()));
CREATE POLICY "playlists_tracks_insert" ON playlists_tracks FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM playlists p WHERE p.uuid = playlists_tracks.uuid AND p.user_uid = auth.uid()));
CREATE POLICY "playlists_tracks_update" ON playlists_tracks FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM playlists p WHERE p.uuid = playlists_tracks.uuid AND p.user_uid = auth.uid()));

-- new_releases: only owner
CREATE POLICY "new_releases_select" ON new_releases FOR SELECT TO authenticated USING (user_uid = auth.uid());
CREATE POLICY "new_releases_insert" ON new_releases FOR INSERT TO authenticated WITH CHECK (user_uid = auth.uid());
CREATE POLICY "new_releases_update" ON new_releases FOR UPDATE TO authenticated USING (user_uid = auth.uid()) WITH CHECK (user_uid = auth.uid());

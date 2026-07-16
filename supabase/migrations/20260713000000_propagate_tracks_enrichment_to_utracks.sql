-- ============================================================
-- Propagate global `tracks` enrichment to per-user `utracks`.
--
-- `tracks` is a shared, user-agnostic enrichment pool (no user_uid).
-- Previously the client caught cross-user metadata edits with a separate
-- "Pass B" pull: enumerate every owned track uid and query
--   tracks WHERE modified_at >= last_sync AND uid IN (<hundreds of uids>)
-- in 300-uid chunks, every sync cycle. Those requests were multi-KB URLs
-- that ran on every foreground/network event and failed hard on flaky
-- links (bumping the sync backoff for everything).
--
-- Instead, when a `tracks` row is genuinely enriched, bump `modified_at`
-- on every `utracks` row that references it. The client's existing
-- utracks pull (`utracks + tracks(*)` join, already user-scoped via RLS)
-- then picks the change up for free, and Pass B is deleted.
-- ============================================================

CREATE OR REPLACE FUNCTION propagate_tracks_enrichment_to_utracks()
RETURNS TRIGGER AS $$
BEGIN
    -- Only propagate on a real content change. Compare the whole row minus
    -- the bookkeeping timestamps, so this stays correct as columns are added
    -- and never fires on the common no-op re-push (enrich is first-writer-wins,
    -- so re-pushing identical data leaves OLD = NEW and this is skipped).
    IF (to_jsonb(OLD) - 'modified_at' - 'created_at')
       IS DISTINCT FROM
       (to_jsonb(NEW) - 'modified_at' - 'created_at') THEN
        UPDATE utracks
           SET modified_at = now()
         WHERE track_uid = NEW.uid;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Runs after the BEFORE-UPDATE enrich/modified_at triggers, so OLD/NEW here
-- reflect the final enriched row.
CREATE TRIGGER tracks_after_update_propagate
    AFTER UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION propagate_tracks_enrichment_to_utracks();

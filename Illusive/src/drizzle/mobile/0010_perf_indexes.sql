CREATE INDEX IF NOT EXISTS `playlists_tracks_uuid_track_uid_idx` ON `playlists_tracks` (`uuid`,`track_uid`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `playlists_tracks_track_uid_idx` ON `playlists_tracks` (`track_uid`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `playlists_tracks_modified_at_idx` ON `playlists_tracks` (`modified_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `track_plays_track_uid_created_at_idx` ON `track_plays` (`track_uid`,`created_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tracks_modified_at_idx` ON `tracks` (`modified_at`);
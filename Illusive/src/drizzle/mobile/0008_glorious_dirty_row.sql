ALTER TABLE `playlists_tracks` ADD `modified_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `playlists_tracks_deleted` ADD `modified_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `new_releases` ADD `modified_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `tracks` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `tracks_deleted` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `recently_played_tracks` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `backpack` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `backpack_deleted` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `playlists` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `playlists_deleted` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `playlists_tracks` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `playlists_tracks_deleted` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `new_releases` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `sync_metadata` ADD `last_pushed_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `playlists_tracks` SET `modified_at` = `created_at` WHERE `modified_at` = 0;--> statement-breakpoint
UPDATE `new_releases` SET `modified_at` = `created_at` WHERE `modified_at` = 0;--> statement-breakpoint
CREATE TABLE `sync_deletes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`deleted_at` integer NOT NULL,
	`sync_error` text
);--> statement-breakpoint
CREATE INDEX `sync_deletes_table_idx` ON `sync_deletes` (`table_name`);--> statement-breakpoint
CREATE TRIGGER `tracks_delete_tombstone` AFTER DELETE ON `tracks` FOR EACH ROW BEGIN INSERT INTO `sync_deletes` (`table_name`, `record_id`, `deleted_at`) VALUES ('tracks', OLD.uid, CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)); END;--> statement-breakpoint
CREATE TRIGGER `playlists_delete_tombstone` AFTER DELETE ON `playlists` FOR EACH ROW BEGIN INSERT INTO `sync_deletes` (`table_name`, `record_id`, `deleted_at`) VALUES ('playlists', OLD.uuid, CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)); END;--> statement-breakpoint
CREATE TRIGGER `playlists_tracks_delete_tombstone` AFTER DELETE ON `playlists_tracks` FOR EACH ROW BEGIN INSERT INTO `sync_deletes` (`table_name`, `record_id`, `deleted_at`) VALUES ('playlists_tracks', OLD.uuid || ':' || OLD.track_uid, CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)); END;
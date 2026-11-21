CREATE TABLE `artist_artwork` (
	`uri` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`artwork_url` text NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `migration_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`key` text NOT NULL,
	`payload` text,
	`version` integer DEFAULT 1 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `outbox_kind_key_idx` ON `outbox` (`kind`,`key`);--> statement-breakpoint
CREATE TABLE `playlist_inherited_playlists` (
	`local_id` text PRIMARY KEY NOT NULL,
	`id` integer,
	`playlist_uuid` text NOT NULL,
	`ref_uuid` text NOT NULL,
	`mode` text,
	`position` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`edited_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `playlist_inherited_playlists_id_idx` ON `playlist_inherited_playlists` (`id`);--> statement-breakpoint
CREATE INDEX `playlist_inherited_playlists_playlist_idx` ON `playlist_inherited_playlists` (`playlist_uuid`);--> statement-breakpoint
CREATE TABLE `playlist_inherited_searches` (
	`local_id` text PRIMARY KEY NOT NULL,
	`id` integer,
	`playlist_uuid` text NOT NULL,
	`query` text,
	`mode` text,
	`position` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`edited_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `playlist_inherited_searches_id_idx` ON `playlist_inherited_searches` (`id`);--> statement-breakpoint
CREATE INDEX `playlist_inherited_searches_playlist_idx` ON `playlist_inherited_searches` (`playlist_uuid`);--> statement-breakpoint
CREATE TABLE `playlist_tracks` (
	`playlist_uuid` text NOT NULL,
	`track_uid` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`edited_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL,
	PRIMARY KEY(`playlist_uuid`, `track_uid`)
);
--> statement-breakpoint
CREATE INDEX `playlist_tracks_track_uid_idx` ON `playlist_tracks` (`track_uid`);--> statement-breakpoint
CREATE INDEX `playlist_tracks_order_idx` ON `playlist_tracks` (`playlist_uuid`,`position`);--> statement-breakpoint
CREATE TABLE `playlists` (
	`uuid` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`description` text,
	`pinned` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`public` integer DEFAULT false NOT NULL,
	`sort_mode` text DEFAULT 'OLDEST' NOT NULL,
	`artwork_id` text,
	`artwork_edited_at` integer,
	`thumbnail_uri` text DEFAULT '' NOT NULL,
	`artwork_path` text,
	`date` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`edited_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recently_played` (
	`uid` text PRIMARY KEY NOT NULL,
	`track` text NOT NULL,
	`played_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `recently_played_played_at_idx` ON `recently_played` (`played_at`);--> statement-breakpoint
CREATE TABLE `request_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`op` text NOT NULL,
	`args` text NOT NULL,
	`expires_at` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `track_plays` (
	`client_id` text PRIMARY KEY NOT NULL,
	`track_uid` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `track_plays_track_uid_created_at_idx` ON `track_plays` (`track_uid`,`created_at`);--> statement-breakpoint
CREATE INDEX `track_plays_created_at_idx` ON `track_plays` (`created_at`);--> statement-breakpoint
CREATE TABLE `user_tracks` (
	`uid` text PRIMARY KEY NOT NULL,
	`illusi_id` text,
	`track` text NOT NULL,
	`title` text,
	`downloaded_at` integer,
	`start_at` integer,
	`end_at` integer,
	`backpacked` integer DEFAULT false NOT NULL,
	`backpacked_at` integer,
	`media_uri` text DEFAULT '' NOT NULL,
	`thumbnail_uri` text DEFAULT '' NOT NULL,
	`lyrics_uri` text DEFAULT '' NOT NULL,
	`synced_lyrics_uri` text DEFAULT '' NOT NULL,
	`plays` integer DEFAULT 0 NOT NULL,
	`last_played_at` integer,
	`deleted` integer DEFAULT false NOT NULL,
	`edited_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_tracks_illusi_id_idx` ON `user_tracks` (`illusi_id`);--> statement-breakpoint
CREATE INDEX `user_tracks_deleted_idx` ON `user_tracks` (`deleted`);
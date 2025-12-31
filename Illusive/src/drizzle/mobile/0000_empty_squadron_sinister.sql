CREATE TABLE `artists` (
	`uri` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`artwork_url` text NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `backpack_deleted` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`alt_title` text DEFAULT '' NOT NULL,
	`artists` text DEFAULT '[]' NOT NULL,
	`duration` integer DEFAULT 0 NOT NULL,
	`prods` text DEFAULT '' NOT NULL,
	`genre` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`explicit` text DEFAULT 'NONE' NOT NULL,
	`unreleased` integer DEFAULT false NOT NULL,
	`album` text DEFAULT '{"name":"","uri":null}' NOT NULL,
	`plays` integer DEFAULT 0 NOT NULL,
	`imported_id` text DEFAULT '' NOT NULL,
	`illusi_id` text NOT NULL,
	`youtube_id` text DEFAULT '' NOT NULL,
	`youtubemusic_id` text DEFAULT '' NOT NULL,
	`soundcloud_id` integer DEFAULT 0 NOT NULL,
	`soundcloud_permalink` text DEFAULT '' NOT NULL,
	`spotify_id` text DEFAULT '' NOT NULL,
	`amazonmusic_id` text DEFAULT '' NOT NULL,
	`applemusic_id` text DEFAULT '' NOT NULL,
	`bandlab_id` text DEFAULT '' NOT NULL,
	`artwork_url` text DEFAULT '' NOT NULL,
	`thumbnail_uri` text DEFAULT '' NOT NULL,
	`media_uri` text DEFAULT '' NOT NULL,
	`lyrics_uri` text DEFAULT '' NOT NULL,
	`meta` text DEFAULT '{"added_date":"2025-12-31T07:42:30.851Z","last_played_date":"2025-12-31T07:42:30.852Z","plays":0}' NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `backpack` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`alt_title` text DEFAULT '' NOT NULL,
	`artists` text DEFAULT '[]' NOT NULL,
	`duration` integer DEFAULT 0 NOT NULL,
	`prods` text DEFAULT '' NOT NULL,
	`genre` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`explicit` text DEFAULT 'NONE' NOT NULL,
	`unreleased` integer DEFAULT false NOT NULL,
	`album` text DEFAULT '{"name":"","uri":null}' NOT NULL,
	`plays` integer DEFAULT 0 NOT NULL,
	`imported_id` text DEFAULT '' NOT NULL,
	`illusi_id` text NOT NULL,
	`youtube_id` text DEFAULT '' NOT NULL,
	`youtubemusic_id` text DEFAULT '' NOT NULL,
	`soundcloud_id` integer DEFAULT 0 NOT NULL,
	`soundcloud_permalink` text DEFAULT '' NOT NULL,
	`spotify_id` text DEFAULT '' NOT NULL,
	`amazonmusic_id` text DEFAULT '' NOT NULL,
	`applemusic_id` text DEFAULT '' NOT NULL,
	`bandlab_id` text DEFAULT '' NOT NULL,
	`artwork_url` text DEFAULT '' NOT NULL,
	`thumbnail_uri` text DEFAULT '' NOT NULL,
	`media_uri` text DEFAULT '' NOT NULL,
	`lyrics_uri` text DEFAULT '' NOT NULL,
	`meta` text DEFAULT '{"added_date":"2025-12-31T07:42:30.851Z","last_played_date":"2025-12-31T07:42:30.852Z","plays":0}' NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `backpack_uuid_idx` ON `backpack` (`uid`);--> statement-breakpoint
CREATE TABLE `new_releases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text DEFAULT '{"name":"","uri":null}' NOT NULL,
	`artist` text DEFAULT '[]' NOT NULL,
	`artwork_url` text DEFAULT '' NOT NULL,
	`artwork_thumbnails` text DEFAULT '[]' NOT NULL,
	`explicit` text DEFAULT 'NONE' NOT NULL,
	`album_type` text DEFAULT 'SINGLE' NOT NULL,
	`type` text DEFAULT 'ALBUM' NOT NULL,
	`date` text DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	`song_track` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlists_deleted` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`thumbnail_uri` text DEFAULT '' NOT NULL,
	`sort` text DEFAULT 'OLDEST' NOT NULL,
	`public` text DEFAULT false NOT NULL,
	`public_uuid` text NOT NULL,
	`inherited_playlists` text DEFAULT '[]' NOT NULL,
	`inherited_searchs` text DEFAULT '[]' NOT NULL,
	`linked_playlists` text DEFAULT '[]' NOT NULL,
	`date` text NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`thumbnail_uri` text DEFAULT '' NOT NULL,
	`sort` text DEFAULT 'OLDEST' NOT NULL,
	`public` text DEFAULT false NOT NULL,
	`public_uuid` text NOT NULL,
	`inherited_playlists` text DEFAULT '[]' NOT NULL,
	`inherited_searchs` text DEFAULT '[]' NOT NULL,
	`linked_playlists` text DEFAULT '[]' NOT NULL,
	`date` text NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `playlists_uuid_idx` ON `playlists` (`uuid`);--> statement-breakpoint
CREATE TABLE `playlists_tracks_deleted` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`track_uid` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlists_tracks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`track_uid` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recently_played_tracks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`alt_title` text DEFAULT '' NOT NULL,
	`artists` text DEFAULT '[]' NOT NULL,
	`duration` integer DEFAULT 0 NOT NULL,
	`prods` text DEFAULT '' NOT NULL,
	`genre` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`explicit` text DEFAULT 'NONE' NOT NULL,
	`unreleased` integer DEFAULT false NOT NULL,
	`album` text DEFAULT '{"name":"","uri":null}' NOT NULL,
	`plays` integer DEFAULT 0 NOT NULL,
	`imported_id` text DEFAULT '' NOT NULL,
	`illusi_id` text NOT NULL,
	`youtube_id` text DEFAULT '' NOT NULL,
	`youtubemusic_id` text DEFAULT '' NOT NULL,
	`soundcloud_id` integer DEFAULT 0 NOT NULL,
	`soundcloud_permalink` text DEFAULT '' NOT NULL,
	`spotify_id` text DEFAULT '' NOT NULL,
	`amazonmusic_id` text DEFAULT '' NOT NULL,
	`applemusic_id` text DEFAULT '' NOT NULL,
	`bandlab_id` text DEFAULT '' NOT NULL,
	`artwork_url` text DEFAULT '' NOT NULL,
	`thumbnail_uri` text DEFAULT '' NOT NULL,
	`media_uri` text DEFAULT '' NOT NULL,
	`lyrics_uri` text DEFAULT '' NOT NULL,
	`meta` text DEFAULT '{"added_date":"2025-12-31T07:42:30.851Z","last_played_date":"2025-12-31T07:42:30.852Z","plays":0}' NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `recently_played_tracks_uuid_idx` ON `recently_played_tracks` (`uid`);--> statement-breakpoint
CREATE TABLE `track_plays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`track_uid` text NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tracks_deleted` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`alt_title` text DEFAULT '' NOT NULL,
	`artists` text DEFAULT '[]' NOT NULL,
	`duration` integer DEFAULT 0 NOT NULL,
	`prods` text DEFAULT '' NOT NULL,
	`genre` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`explicit` text DEFAULT 'NONE' NOT NULL,
	`unreleased` integer DEFAULT false NOT NULL,
	`album` text DEFAULT '{"name":"","uri":null}' NOT NULL,
	`plays` integer DEFAULT 0 NOT NULL,
	`imported_id` text DEFAULT '' NOT NULL,
	`illusi_id` text NOT NULL,
	`youtube_id` text DEFAULT '' NOT NULL,
	`youtubemusic_id` text DEFAULT '' NOT NULL,
	`soundcloud_id` integer DEFAULT 0 NOT NULL,
	`soundcloud_permalink` text DEFAULT '' NOT NULL,
	`spotify_id` text DEFAULT '' NOT NULL,
	`amazonmusic_id` text DEFAULT '' NOT NULL,
	`applemusic_id` text DEFAULT '' NOT NULL,
	`bandlab_id` text DEFAULT '' NOT NULL,
	`artwork_url` text DEFAULT '' NOT NULL,
	`thumbnail_uri` text DEFAULT '' NOT NULL,
	`media_uri` text DEFAULT '' NOT NULL,
	`lyrics_uri` text DEFAULT '' NOT NULL,
	`meta` text DEFAULT '{"added_date":"2025-12-31T07:42:30.851Z","last_played_date":"2025-12-31T07:42:30.852Z","plays":0}' NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`alt_title` text DEFAULT '' NOT NULL,
	`artists` text DEFAULT '[]' NOT NULL,
	`duration` integer DEFAULT 0 NOT NULL,
	`prods` text DEFAULT '' NOT NULL,
	`genre` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`explicit` text DEFAULT 'NONE' NOT NULL,
	`unreleased` integer DEFAULT false NOT NULL,
	`album` text DEFAULT '{"name":"","uri":null}' NOT NULL,
	`plays` integer DEFAULT 0 NOT NULL,
	`imported_id` text DEFAULT '' NOT NULL,
	`illusi_id` text NOT NULL,
	`youtube_id` text DEFAULT '' NOT NULL,
	`youtubemusic_id` text DEFAULT '' NOT NULL,
	`soundcloud_id` integer DEFAULT 0 NOT NULL,
	`soundcloud_permalink` text DEFAULT '' NOT NULL,
	`spotify_id` text DEFAULT '' NOT NULL,
	`amazonmusic_id` text DEFAULT '' NOT NULL,
	`applemusic_id` text DEFAULT '' NOT NULL,
	`bandlab_id` text DEFAULT '' NOT NULL,
	`artwork_url` text DEFAULT '' NOT NULL,
	`thumbnail_uri` text DEFAULT '' NOT NULL,
	`media_uri` text DEFAULT '' NOT NULL,
	`lyrics_uri` text DEFAULT '' NOT NULL,
	`meta` text DEFAULT '{"added_date":"2025-12-31T07:42:30.851Z","last_played_date":"2025-12-31T07:42:30.852Z","plays":0}' NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tracks_uuid_idx` ON `tracks` (`uid`);
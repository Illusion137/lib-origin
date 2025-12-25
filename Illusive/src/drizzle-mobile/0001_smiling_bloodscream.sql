CREATE TABLE `track_plays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`track_uid` text NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_backpack_deleted` (
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
	`meta` text DEFAULT '{"added_date":"2025-11-03T09:27:32.287Z","last_played_date":"2025-11-03T09:27:32.288Z","plays":0}' NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_backpack_deleted`("id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp") SELECT "id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp" FROM `backpack_deleted`;--> statement-breakpoint
DROP TABLE `backpack_deleted`;--> statement-breakpoint
ALTER TABLE `__new_backpack_deleted` RENAME TO `backpack_deleted`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_backpack` (
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
	`meta` text DEFAULT '{"added_date":"2025-11-03T09:27:32.287Z","last_played_date":"2025-11-03T09:27:32.288Z","plays":0}' NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_backpack`("id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp") SELECT "id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp" FROM `backpack`;--> statement-breakpoint
DROP TABLE `backpack`;--> statement-breakpoint
ALTER TABLE `__new_backpack` RENAME TO `backpack`;--> statement-breakpoint
CREATE INDEX `backpack_uuid_idx` ON `backpack` (`uid`);--> statement-breakpoint
CREATE TABLE `__new_recently_played_tracks` (
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
	`meta` text DEFAULT '{"added_date":"2025-11-03T09:27:32.287Z","last_played_date":"2025-11-03T09:27:32.288Z","plays":0}' NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_recently_played_tracks`("id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp") SELECT "id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp" FROM `recently_played_tracks`;--> statement-breakpoint
DROP TABLE `recently_played_tracks`;--> statement-breakpoint
ALTER TABLE `__new_recently_played_tracks` RENAME TO `recently_played_tracks`;--> statement-breakpoint
CREATE INDEX `recently_played_tracks_uuid_idx` ON `recently_played_tracks` (`uid`);--> statement-breakpoint
CREATE TABLE `__new_tracks_deleted` (
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
	`meta` text DEFAULT '{"added_date":"2025-11-03T09:27:32.287Z","last_played_date":"2025-11-03T09:27:32.288Z","plays":0}' NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tracks_deleted`("id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp") SELECT "id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp" FROM `tracks_deleted`;--> statement-breakpoint
DROP TABLE `tracks_deleted`;--> statement-breakpoint
ALTER TABLE `__new_tracks_deleted` RENAME TO `tracks_deleted`;--> statement-breakpoint
CREATE TABLE `__new_tracks` (
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
	`meta` text DEFAULT '{"added_date":"2025-11-03T09:27:32.287Z","last_played_date":"2025-11-03T09:27:32.288Z","plays":0}' NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tracks`("id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp") SELECT "id", "uid", "title", "alt_title", "artists", "duration", "prods", "genre", "tags", "explicit", "unreleased", "album", "plays", "imported_id", "illusi_id", "youtube_id", "youtubemusic_id", "soundcloud_id", "soundcloud_permalink", "spotify_id", "amazonmusic_id", "applemusic_id", "bandlab_id", "artwork_url", "thumbnail_uri", "media_uri", "lyrics_uri", "meta", "timestamp" FROM `tracks`;--> statement-breakpoint
DROP TABLE `tracks`;--> statement-breakpoint
ALTER TABLE `__new_tracks` RENAME TO `tracks`;--> statement-breakpoint
CREATE INDEX `tracks_uuid_idx` ON `tracks` (`uid`);
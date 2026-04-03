ALTER TABLE `backpack_deleted` ADD `synced_lyrics_uri` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `backpack` ADD `synced_lyrics_uri` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `recently_played_tracks` ADD `synced_lyrics_uri` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `tracks_deleted` ADD `synced_lyrics_uri` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `tracks` ADD `synced_lyrics_uri` text DEFAULT '' NOT NULL;
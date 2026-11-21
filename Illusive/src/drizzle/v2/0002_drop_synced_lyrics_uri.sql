ALTER TABLE `user_tracks` DROP COLUMN `synced_lyrics_uri`;--> statement-breakpoint
UPDATE `user_tracks` SET `lyrics_uri` = '', `sync_status` = 'NONE';
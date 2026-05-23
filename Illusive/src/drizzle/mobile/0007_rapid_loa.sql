CREATE TABLE `audiobooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`author` text DEFAULT '' NOT NULL,
	`publisher` text DEFAULT '' NOT NULL,
	`cover` text DEFAULT '' NOT NULL,
	`date` text DEFAULT '' NOT NULL,
	`series_name` text DEFAULT '' NOT NULL,
	`series_no` integer DEFAULT 0 NOT NULL,
	`source_file` text DEFAULT '' NOT NULL,
	`source_file_type` text DEFAULT 'FILEBASE' NOT NULL,
	`roz_uri` text DEFAULT '' NOT NULL,
	`source_raw_uri` text DEFAULT '' NOT NULL,
	`total_duration_ms` integer DEFAULT 0 NOT NULL,
	`chapter_count` integer DEFAULT 0 NOT NULL,
	`tts_engine` text DEFAULT '' NOT NULL,
	`tts_voice_id` text DEFAULT '' NOT NULL,
	`last_chapter_index` integer DEFAULT 0 NOT NULL,
	`last_chapter_timestamp_ms` integer DEFAULT 0 NOT NULL,
	`total_listened_ms` integer DEFAULT 0 NOT NULL,
	`added_date` text NOT NULL,
	`last_read_date` text DEFAULT '' NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `audiobooks_uuid_unique` ON `audiobooks` (`uuid`);--> statement-breakpoint
CREATE INDEX `audiobooks_uuid_idx` ON `audiobooks` (`uuid`);
CREATE TABLE `novels_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`source_file` text NOT NULL,
	`source_file_type` text NOT NULL,
	`title` text NOT NULL,
	`cover` text DEFAULT '',
	`author` text DEFAULT '',
	`publisher` text DEFAULT '',
	`date` text DEFAULT '1970-01-01T00:00:00.000Z',
	`series_name` text DEFAULT '',
	`series_no` integer DEFAULT 0,
	`content` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `novels_table_uuid_unique` ON `novels_table` (`uuid`);
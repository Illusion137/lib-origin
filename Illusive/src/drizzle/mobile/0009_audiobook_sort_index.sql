ALTER TABLE `audiobooks` ADD `sort_index` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `audiobooks` SET `sort_index` = `id` WHERE `sort_index` = 0;
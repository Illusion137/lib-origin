ALTER TABLE `change_log` ADD `attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `change_log` ADD `last_error` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `change_log` ADD `dropped` integer DEFAULT 0 NOT NULL;

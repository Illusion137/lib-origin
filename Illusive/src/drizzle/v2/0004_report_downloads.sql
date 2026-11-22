-- The server now tracks downloads per device (login). Report what this device has, and correct downloads it was
-- credited with but doesn't have, once.
INSERT INTO `outbox` (`kind`, `key`, `created_at`)
SELECT 'user_track', `uid`, CAST(strftime('%s', 'now') AS INTEGER) * 1000 FROM `user_tracks`
WHERE `media_uri` != '' OR `downloaded_at` IS NOT NULL
ON CONFLICT (`kind`, `key`) DO UPDATE SET `version` = `version` + 1, `attempts` = 0, `last_error` = NULL;

-- Extend avatar column to store base64 image data URLs
ALTER TABLE `user` MODIFY COLUMN `avatar` TEXT DEFAULT NULL;

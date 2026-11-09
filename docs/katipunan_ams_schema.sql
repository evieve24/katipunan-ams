/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `timestamp` varchar(40) NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `idx_activity_user` (`user_id`),
  KEY `idx_activity_time` (`timestamp`),
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=49863 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_state` (
  `key` varchar(120) NOT NULL,
  `value` longtext NOT NULL,
  `updated_at` varchar(40) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_lifecycle` (
  `lifecycle_id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` varchar(60) NOT NULL,
  `lifecycle_stage` varchar(80) DEFAULT NULL,
  `remaining_life` varchar(60) DEFAULT NULL,
  `effective_date` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`lifecycle_id`),
  KEY `idx_lifecycle_asset` (`asset_id`),
  CONSTRAINT `fk_lifecycle_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_scan` (
  `scan_id` varchar(64) NOT NULL,
  `asset_id` varchar(60) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `actor_role` varchar(40) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `accuracy` decimal(8,2) DEFAULT NULL,
  `scanned_at` varchar(40) NOT NULL,
  `activity` varchar(255) NOT NULL,
  `source` varchar(40) NOT NULL DEFAULT 'qr_scan',
  `device` varchar(190) DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `created_at` varchar(40) NOT NULL,
  PRIMARY KEY (`scan_id`),
  KEY `idx_scan_asset` (`asset_id`,`scanned_at`),
  KEY `idx_scan_user` (`user_id`,`scanned_at`),
  CONSTRAINT `fk_scan_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_transfer` (
  `transfer_id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` varchar(60) NOT NULL,
  `from_office` varchar(120) DEFAULT NULL,
  `to_office` varchar(120) DEFAULT NULL,
  `transfer_date` varchar(40) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `sync_status` varchar(40) NOT NULL DEFAULT 'synced',
  PRIMARY KEY (`transfer_id`),
  KEY `idx_transfer_asset` (`asset_id`),
  CONSTRAINT `fk_transfer_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `asset_id` varchar(60) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `asset_name` varchar(190) NOT NULL,
  `property_no` varchar(120) DEFAULT NULL,
  `serial_no` varchar(190) DEFAULT NULL,
  `qr_code` varchar(190) DEFAULT NULL,
  `category` varchar(80) DEFAULT NULL,
  `condition` varchar(40) DEFAULT NULL,
  `office` varchar(120) DEFAULT NULL,
  `acquisition_date` varchar(40) DEFAULT NULL,
  `acquisition_cost` decimal(16,2) NOT NULL DEFAULT 0.00,
  `useful_life` varchar(40) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_trashed` tinyint(4) NOT NULL DEFAULT 0,
  `sync_status` varchar(40) NOT NULL DEFAULT 'synced',
  `brand` varchar(190) DEFAULT NULL,
  `staff_id` varchar(60) DEFAULT NULL,
  `owner_name` varchar(190) DEFAULT NULL,
  `owner_position` varchar(190) DEFAULT NULL,
  `location` varchar(190) DEFAULT NULL,
  `last_scan_date` varchar(40) DEFAULT NULL,
  `last_scan_location` varchar(190) DEFAULT NULL,
  `created_at` varchar(40) NOT NULL,
  `updated_at` varchar(40) NOT NULL,
  PRIMARY KEY (`asset_id`),
  KEY `idx_assets_office` (`office`),
  KEY `idx_assets_condition` (`condition`),
  KEY `idx_assets_user` (`user_id`),
  CONSTRAINT `fk_assets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `at` varchar(40) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(64) DEFAULT NULL,
  `action` varchar(80) NOT NULL,
  `detail` text DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_at` (`at`)
) ENGINE=InnoDB AUTO_INCREMENT=674 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup` (
  `backup_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `backup_date` varchar(40) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `storage_type` varchar(40) DEFAULT NULL,
  `status` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`backup_id`),
  UNIQUE KEY `uq_backup` (`file_name`,`backup_date`,`storage_type`),
  KEY `idx_backup_user` (`user_id`),
  CONSTRAINT `fk_backup_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrow` (
  `borrow_id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` varchar(60) NOT NULL,
  `borrower_name` varchar(190) DEFAULT NULL,
  `borrow_date` varchar(40) DEFAULT NULL,
  `return_date` varchar(40) DEFAULT NULL,
  `status` varchar(40) DEFAULT NULL,
  `recorded_at` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`borrow_id`),
  KEY `idx_borrow_asset` (`asset_id`),
  CONSTRAINT `fk_borrow_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventory_id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` varchar(60) NOT NULL,
  `location` varchar(190) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `capture_date` varchar(40) DEFAULT NULL,
  `sync_status` varchar(40) NOT NULL DEFAULT 'synced',
  PRIMARY KEY (`inventory_id`),
  KEY `idx_inventory_asset` (`asset_id`),
  CONSTRAINT `fk_inventory_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_asset_report` (
  `maintenance_id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` varchar(60) NOT NULL,
  `maintenance_type` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `maintenance_date` varchar(40) DEFAULT NULL,
  `cost` decimal(16,2) NOT NULL DEFAULT 0.00,
  `status` varchar(60) DEFAULT NULL,
  `technician` varchar(190) DEFAULT NULL,
  `recorded_at` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`maintenance_id`),
  KEY `idx_maintenance_asset` (`asset_id`),
  KEY `idx_maintenance_date` (`maintenance_date`),
  CONSTRAINT `fk_maintenance_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60979 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_user_id` int(11) NOT NULL,
  `actor_user_id` int(11) DEFAULT NULL,
  `actor_name` varchar(190) DEFAULT NULL,
  `actor_role` varchar(40) DEFAULT NULL,
  `action_type` varchar(80) NOT NULL,
  `action_label` varchar(190) NOT NULL,
  `asset_id` varchar(60) DEFAULT NULL,
  `asset_name` varchar(190) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `changes_json` longtext DEFAULT NULL,
  `source` varchar(40) DEFAULT NULL,
  `created_at` varchar(40) NOT NULL,
  `read_at` varchar(40) DEFAULT NULL,
  `read_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_recipient` (`recipient_user_id`,`read_at`),
  KEY `idx_notifications_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `procurement_forecast` (
  `forecast_id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` varchar(60) NOT NULL,
  `forecast_year` int(11) NOT NULL,
  `predicted_quantity` int(11) NOT NULL DEFAULT 0,
  `estimated_cost` decimal(16,2) NOT NULL DEFAULT 0.00,
  `status` varchar(60) DEFAULT NULL,
  `priority` varchar(20) DEFAULT NULL,
  `bucket` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`forecast_id`),
  UNIQUE KEY `uq_forecast` (`asset_id`,`forecast_year`),
  KEY `idx_forecast_year` (`forecast_year`),
  CONSTRAINT `fk_forecast_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `report_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `report_type` varchar(80) DEFAULT NULL,
  `report_period` varchar(80) DEFAULT NULL,
  `generated_at` varchar(40) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  UNIQUE KEY `uq_report` (`report_type`,`generated_at`),
  KEY `idx_report_user` (`user_id`),
  CONSTRAINT `fk_report_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `token` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` varchar(40) NOT NULL,
  `expires_at` varchar(40) NOT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `user_agent` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`token`),
  KEY `idx_sessions_user` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `at` varchar(40) NOT NULL,
  `device` varchar(80) DEFAULT NULL,
  `action` varchar(80) NOT NULL,
  `asset_id` varchar(120) DEFAULT NULL,
  `payload` longtext DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sync_at` (`at`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL,
  `password_salt` varchar(128) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(190) NOT NULL,
  `role` varchar(40) NOT NULL,
  `office` varchar(80) DEFAULT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

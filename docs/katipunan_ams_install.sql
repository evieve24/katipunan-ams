-- ============================================================
-- Katipunan Asset Management System
-- Complete MariaDB installation script
-- Creates the database, all 17 application tables, and the
-- D1-D14 read-only DFD views.
-- Safe to re-run: tables use IF NOT EXISTS and views use
-- CREATE OR REPLACE.
--
-- Import with:
--   C:\xampp\mysql\bin\mysql.exe -u root < docs\katipunan_ams_install.sql
-- or paste into phpMyAdmin -> SQL.
-- The server seeds the default login accounts on first start.
-- ============================================================

CREATE DATABASE IF NOT EXISTS `katipunan_ams`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `katipunan_ams`;

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
CREATE TABLE IF NOT EXISTS `activity_log` (
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
CREATE TABLE IF NOT EXISTS `app_state` (
  `key` varchar(120) NOT NULL,
  `value` longtext NOT NULL,
  `updated_at` varchar(40) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `asset_lifecycle` (
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
CREATE TABLE IF NOT EXISTS `asset_scan` (
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
CREATE TABLE IF NOT EXISTS `asset_transfer` (
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
CREATE TABLE IF NOT EXISTS `assets` (
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
CREATE TABLE IF NOT EXISTS `audit` (
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
CREATE TABLE IF NOT EXISTS `backup` (
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
CREATE TABLE IF NOT EXISTS `borrow` (
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
CREATE TABLE IF NOT EXISTS `inventory` (
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
CREATE TABLE IF NOT EXISTS `maintenance_asset_report` (
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
CREATE TABLE IF NOT EXISTS `notifications` (
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
CREATE TABLE IF NOT EXISTS `procurement_forecast` (
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
CREATE TABLE IF NOT EXISTS `report` (
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
CREATE TABLE IF NOT EXISTS `sessions` (
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
CREATE TABLE IF NOT EXISTS `sync_events` (
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
CREATE TABLE IF NOT EXISTS `users` (
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

-- ============================================================
-- Katipunan AMS - DFD logical views (Option 1)
--
-- These views expose the working tables using the data-store names
-- from the system DFD. They are read-only reporting views; the
-- application continues to use its physical tables and code.
--
-- D1  User Data                 -> users + sessions
-- D2  Asset Data                -> assets
-- D3  Borrow Data               -> borrow
-- D4  Inventory Data            -> inventory
-- D5  Asset Transfer Data       -> asset_transfer
-- D6  Asset Life Cycle Data     -> asset_lifecycle
-- D7  Forecasting Data          -> procurement_forecast
-- D8  Maintenance Data          -> maintenance_asset_report
-- D9  Report Data               -> report
-- D10 Activity Logs Data        -> activity_log + audit
-- D11 Backup Data               -> backup
-- D12 Scan & Location Data      -> asset_scan
-- D13 Notification Data         -> notifications
-- D14 Sync Data                 -> sync_events
--
-- app_state is an implementation JSON snapshot, not a DFD data store.
--
-- Apply with:
--   C:\xampp\mysql\bin\mysql.exe -u root < docs\dfd_views.sql
-- ============================================================

USE `katipunan_ams`;

DROP VIEW IF EXISTS `D0_Application_State`;
DROP VIEW IF EXISTS `D1_User_Data`;
DROP VIEW IF EXISTS `D2_Asset_Data`;
DROP VIEW IF EXISTS `D3_Borrow_Data`;
DROP VIEW IF EXISTS `D4_Inventory_Data`;
DROP VIEW IF EXISTS `D5_Asset_Transfer_Data`;
DROP VIEW IF EXISTS `D6_Asset_Life_Cycle_Data`;
DROP VIEW IF EXISTS `D7_Forecasting_Data`;
DROP VIEW IF EXISTS `D8_Maintenance_Data`;
DROP VIEW IF EXISTS `D9_Report_Data`;
DROP VIEW IF EXISTS `D10_Activity_Logs_Data`;
DROP VIEW IF EXISTS `D11_Backup_Data`;
DROP VIEW IF EXISTS `D12_Scan_Location_Data`;
DROP VIEW IF EXISTS `D13_Notification_Data`;
DROP VIEW IF EXISTS `D14_Sync_Data`;

DROP VIEW IF EXISTS `D0_Application_State`;

CREATE OR REPLACE VIEW `D1 User Data` AS
SELECT u.id, u.username, u.name, u.role, u.office, u.active, u.created_at,
       (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id) AS sessions_recorded
FROM users u;

CREATE OR REPLACE VIEW `D2 Asset Data` AS
SELECT a.asset_id, a.asset_name, a.property_no, a.serial_no, a.qr_code,
       a.category, a.`condition`, a.office, a.location,
       a.latitude AS registered_latitude, a.longitude AS registered_longitude,
       a.acquisition_date, a.acquisition_cost, a.useful_life, a.brand,
       a.staff_id, a.owner_name, a.owner_position,
       a.last_scan_date, a.last_scan_location, a.is_trashed,
       a.created_at, a.updated_at
FROM assets a;

CREATE OR REPLACE VIEW `D3 Borrow Data` AS
SELECT b.borrow_id, b.asset_id, a.asset_name, b.borrower_name,
       b.borrow_date, b.return_date, b.status, b.recorded_at
FROM borrow b
LEFT JOIN assets a ON a.asset_id = b.asset_id;

CREATE OR REPLACE VIEW `D4 Inventory Data` AS
SELECT i.inventory_id, i.asset_id, a.asset_name, a.office AS asset_office,
       i.location, i.quantity, i.capture_date, i.sync_status,
       a.location AS registered_location
FROM inventory i
LEFT JOIN assets a ON a.asset_id = i.asset_id;

CREATE OR REPLACE VIEW `D5 Asset Transfer Data` AS
SELECT t.transfer_id, t.asset_id, a.asset_name, t.from_office, t.to_office,
       t.transfer_date, t.remarks, t.sync_status
FROM asset_transfer t
LEFT JOIN assets a ON a.asset_id = t.asset_id;

CREATE OR REPLACE VIEW `D6 Asset Life Cycle Data` AS
SELECT l.lifecycle_id, l.asset_id, a.asset_name, l.lifecycle_stage,
       l.remaining_life, l.effective_date, a.acquisition_date, a.useful_life,
       a.`condition`
FROM asset_lifecycle l
LEFT JOIN assets a ON a.asset_id = l.asset_id;

CREATE OR REPLACE VIEW `D7 Forecasting Data` AS
SELECT f.forecast_id, f.asset_id, a.asset_name, f.forecast_year,
       f.predicted_quantity, f.estimated_cost, f.status, f.priority, f.bucket
FROM procurement_forecast f
LEFT JOIN assets a ON a.asset_id = f.asset_id;

CREATE OR REPLACE VIEW `D8 Maintenance Data` AS
SELECT m.maintenance_id, m.asset_id, a.asset_name, m.maintenance_type,
       m.description, m.maintenance_date, m.cost, m.status, m.technician,
       m.recorded_at
FROM maintenance_asset_report m
LEFT JOIN assets a ON a.asset_id = m.asset_id;

CREATE OR REPLACE VIEW `D9 Report Data` AS
SELECT r.report_id, r.user_id, u.name AS user_name, u.role AS user_role,
       r.report_type, r.report_period, r.generated_at, r.file_path
FROM report r
LEFT JOIN users u ON u.id = r.user_id;

CREATE OR REPLACE VIEW `D10 Activity Logs Data` AS
SELECT 'activity' AS source, l.log_id AS record_id, l.user_id, u.name AS user_name,
       u.role AS user_role, l.action, l.details, l.`timestamp` AS recorded_at
FROM activity_log l
LEFT JOIN users u ON u.id = l.user_id
UNION ALL
SELECT 'audit', a.id, a.user_id, COALESCE(u.name, a.username), u.role,
       a.action, a.detail, a.at
FROM audit a
LEFT JOIN users u ON u.id = a.user_id;

CREATE OR REPLACE VIEW `D11 Backup Data` AS
SELECT b.backup_id, b.user_id, u.name AS user_name, u.role AS user_role,
       b.backup_date, b.file_name, b.storage_type, b.status
FROM backup b
LEFT JOIN users u ON u.id = b.user_id;

CREATE OR REPLACE VIEW `D12 Scan and Location Data` AS
SELECT s.scan_id, s.asset_id, a.asset_name, a.office,
       a.location AS registered_location,
       s.user_id, u.name AS user_name, COALESCE(u.role, s.actor_role) AS user_role,
       s.actor_role, s.latitude, s.longitude, s.accuracy, s.scanned_at,
       s.activity, s.source, s.device, s.ip, s.created_at,
       a.latitude AS registered_latitude, a.longitude AS registered_longitude,
       CASE
         WHEN s.latitude IS NOT NULL AND s.longitude IS NOT NULL
          AND a.latitude IS NOT NULL AND a.longitude IS NOT NULL
         THEN ROUND(6371000 * 2 * ASIN(SQRT(
           POWER(SIN(RADIANS(s.latitude - a.latitude) / 2), 2) +
           COS(RADIANS(a.latitude)) * COS(RADIANS(s.latitude)) *
           POWER(SIN(RADIANS(s.longitude - a.longitude) / 2), 2)
         )))
       END AS distance_m
FROM asset_scan s
LEFT JOIN assets a ON a.asset_id = s.asset_id
LEFT JOIN users u ON u.id = s.user_id;

CREATE OR REPLACE VIEW `D13 Notification Data` AS
SELECT n.id, n.recipient_user_id, ru.name AS recipient_name,
       n.actor_user_id, n.actor_name, n.actor_role, n.action_type, n.action_label,
       n.asset_id, n.asset_name, n.details, n.changes_json, n.source,
       n.created_at, n.read_at, n.read_by
FROM notifications n
LEFT JOIN users ru ON ru.id = n.recipient_user_id;

CREATE OR REPLACE VIEW `D14 Sync Data` AS
SELECT e.id, e.at, e.device, e.action, e.asset_id, a.asset_name,
       e.user_id, u.name AS user_name, u.role AS user_role, e.payload
FROM sync_events e
LEFT JOIN assets a ON a.asset_id = e.asset_id
LEFT JOIN users u ON u.id = e.user_id;

-- ============================================================
-- Katipunan AMS - DFD logical views (Option 1)
--
-- These views expose the working tables using the data-store names
-- from the system DFD. They are read-only reporting views; the
-- application continues to use its physical tables and code.
--
-- D0  Application State (implementation snapshot, supports D2-D10)
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
-- Apply with:
--   C:\xampp\mysql\bin\mysql.exe -u root < docs\dfd_views.sql
-- ============================================================

USE `katipunan_ams`;

CREATE OR REPLACE VIEW `D0_Application_State` AS
SELECT `key`, updated_at, updated_by, CHAR_LENGTH(`value`) AS value_bytes
FROM app_state;

CREATE OR REPLACE VIEW `D1_User_Data` AS
SELECT u.id, u.username, u.name, u.role, u.office, u.active, u.created_at,
       (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id) AS sessions_recorded
FROM users u;

CREATE OR REPLACE VIEW `D2_Asset_Data` AS
SELECT a.asset_id, a.asset_name, a.property_no, a.serial_no, a.qr_code,
       a.category, a.`condition`, a.office, a.location,
       a.latitude AS registered_latitude, a.longitude AS registered_longitude,
       a.acquisition_date, a.acquisition_cost, a.useful_life, a.brand,
       a.staff_id, a.owner_name, a.owner_position,
       a.last_scan_date, a.last_scan_location, a.is_trashed,
       a.created_at, a.updated_at
FROM assets a;

CREATE OR REPLACE VIEW `D3_Borrow_Data` AS
SELECT b.borrow_id, b.asset_id, a.asset_name, b.borrower_name,
       b.borrow_date, b.return_date, b.status, b.recorded_at
FROM borrow b
LEFT JOIN assets a ON a.asset_id = b.asset_id;

CREATE OR REPLACE VIEW `D4_Inventory_Data` AS
SELECT i.inventory_id, i.asset_id, a.asset_name, a.office AS asset_office,
       i.location, i.quantity, i.capture_date, i.sync_status,
       a.location AS registered_location
FROM inventory i
LEFT JOIN assets a ON a.asset_id = i.asset_id;

CREATE OR REPLACE VIEW `D5_Asset_Transfer_Data` AS
SELECT t.transfer_id, t.asset_id, a.asset_name, t.from_office, t.to_office,
       t.transfer_date, t.remarks, t.sync_status
FROM asset_transfer t
LEFT JOIN assets a ON a.asset_id = t.asset_id;

CREATE OR REPLACE VIEW `D6_Asset_Life_Cycle_Data` AS
SELECT l.lifecycle_id, l.asset_id, a.asset_name, l.lifecycle_stage,
       l.remaining_life, l.effective_date, a.acquisition_date, a.useful_life,
       a.`condition`
FROM asset_lifecycle l
LEFT JOIN assets a ON a.asset_id = l.asset_id;

CREATE OR REPLACE VIEW `D7_Forecasting_Data` AS
SELECT f.forecast_id, f.asset_id, a.asset_name, f.forecast_year,
       f.predicted_quantity, f.estimated_cost, f.status, f.priority, f.bucket
FROM procurement_forecast f
LEFT JOIN assets a ON a.asset_id = f.asset_id;

CREATE OR REPLACE VIEW `D8_Maintenance_Data` AS
SELECT m.maintenance_id, m.asset_id, a.asset_name, m.maintenance_type,
       m.description, m.maintenance_date, m.cost, m.status, m.technician,
       m.recorded_at
FROM maintenance_asset_report m
LEFT JOIN assets a ON a.asset_id = m.asset_id;

CREATE OR REPLACE VIEW `D9_Report_Data` AS
SELECT r.report_id, r.user_id, u.name AS user_name, u.role AS user_role,
       r.report_type, r.report_period, r.generated_at, r.file_path
FROM report r
LEFT JOIN users u ON u.id = r.user_id;

CREATE OR REPLACE VIEW `D10_Activity_Logs_Data` AS
SELECT 'activity' AS source, l.log_id AS record_id, l.user_id, u.name AS user_name,
       u.role AS user_role, l.action, l.details, l.`timestamp` AS recorded_at
FROM activity_log l
LEFT JOIN users u ON u.id = l.user_id
UNION ALL
SELECT 'audit', a.id, a.user_id, COALESCE(u.name, a.username), u.role,
       a.action, a.detail, a.at
FROM audit a
LEFT JOIN users u ON u.id = a.user_id;

CREATE OR REPLACE VIEW `D11_Backup_Data` AS
SELECT b.backup_id, b.user_id, u.name AS user_name, u.role AS user_role,
       b.backup_date, b.file_name, b.storage_type, b.status
FROM backup b
LEFT JOIN users u ON u.id = b.user_id;

CREATE OR REPLACE VIEW `D12_Scan_Location_Data` AS
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

CREATE OR REPLACE VIEW `D13_Notification_Data` AS
SELECT n.id, n.recipient_user_id, ru.name AS recipient_name,
       n.actor_user_id, n.actor_name, n.actor_role, n.action_type, n.action_label,
       n.asset_id, n.asset_name, n.details, n.changes_json, n.source,
       n.created_at, n.read_at, n.read_by
FROM notifications n
LEFT JOIN users ru ON ru.id = n.recipient_user_id;

CREATE OR REPLACE VIEW `D14_Sync_Data` AS
SELECT e.id, e.at, e.device, e.action, e.asset_id, a.asset_name,
       e.user_id, u.name AS user_name, u.role AS user_role, e.payload
FROM sync_events e
LEFT JOIN assets a ON a.asset_id = e.asset_id
LEFT JOIN users u ON u.id = e.user_id;

# ERD — Katipunan Asset Management System

> Consolidated DFD, ERD, and class diagrams: [`SYSTEM_DIAGRAMS.md`](SYSTEM_DIAGRAMS.md).

This document records the ERD implemented in MariaDB (XAMPP), the physical
table names, and how each entity maps to the v71 application. Entity names are
prefixed with the matching **DFD data-store number (D1–D14)**; `APP_STATE` is
the only unnumbered entity because it is an implementation snapshot, not a DFD
store.

## Diagram

```mermaid
erDiagram
    D1_USER |o--o{ D2_ASSET : manages
    D1_USER |o--o{ D11_BACKUP : creates
    D1_USER |o--o{ D10_ACTIVITY_LOG : performs
    D1_USER |o--o{ D9_REPORT : generates

    D2_ASSET ||--o{ D6_ASSET_LIFECYCLE : "goes through"
    D2_ASSET ||--o{ D8_MAINTENANCE_RECORD : "is serviced through"
    D2_ASSET ||--o{ D7_PROCUREMENT_FORECAST : "is forecasted in"
    D2_ASSET ||--o{ D3_BORROW : "is borrowed in"
    D2_ASSET ||--o{ D4_INVENTORY : "is counted in"
    D2_ASSET ||--o{ D5_ASSET_TRANSFER : "is transferred via"
    D2_ASSET ||--o{ D12_ASSET_SCAN : "is scanned in"
    D2_ASSET |o--o{ D13_NOTIFICATION : "is referenced in"

    D1_USER ||--o{ D1_SESSION : opens
    D1_USER |o--o{ D12_ASSET_SCAN : performs
    D1_USER |o--o{ APP_STATE : updates
    D1_USER |o--o{ D10_AUDIT : "is recorded in"
    D1_USER |o--o{ D14_SYNC_EVENT : performs
    D1_USER ||--o{ D13_NOTIFICATION : receives
    D1_USER |o--o{ D13_NOTIFICATION : acts
    D1_USER |o--o{ D13_NOTIFICATION : reads

    D1_USER {
        int user_id PK
        string full_name
        string username
        string password
        string role
        string status
    }
    D2_ASSET {
        string asset_id PK
        int user_id FK
        string asset_name
        string property_no
        string serial_no
        string qr_code
        string category
        string condition
        string office
        string acquisition_date
        decimal acquisition_cost
        string useful_life
        decimal latitude
        decimal longitude
        bool is_trashed
        string sync_status
    }
    D6_ASSET_LIFECYCLE {
        int lifecycle_id PK
        string asset_id FK
        string lifecycle_stage
        string remaining_life
        string effective_date
    }
    D8_MAINTENANCE_RECORD {
        int maintenance_id PK
        string asset_id FK
        string maintenance_type
        string description
        string maintenance_date
        decimal cost
        string status
    }
    D7_PROCUREMENT_FORECAST {
        int forecast_id PK
        string asset_id FK
        int forecast_year
        int predicted_quantity
        decimal estimated_cost
        string status
    }
    D11_BACKUP {
        int backup_id PK
        int user_id FK
        string backup_date
        string file_name
        string storage_type
        string status
    }
    D10_ACTIVITY_LOG {
        int log_id PK
        int user_id FK
        string action
        string details
        string timestamp
    }
    D9_REPORT {
        int report_id PK
        int user_id FK
        string report_type
        string report_period
        string generated_at
        string file_path
    }
    D1_SESSION {
        string token PK
        int user_id FK
        string created_at
        string expires_at
        string ip
        string user_agent
    }
    D12_ASSET_SCAN {
        string scan_id PK
        string asset_id FK
        int user_id FK
        string actor_role
        decimal latitude
        decimal longitude
        int accuracy
        string scanned_at
        string activity
        string source
        string device
        string ip
        string created_at
    }
    APP_STATE {
        string key PK
        longtext value
        string updated_at
        int updated_by FK
    }
    D10_AUDIT {
        int id PK
        string at
        int user_id FK
        string username
        string action
        string detail
        string ip
    }
    D14_SYNC_EVENT {
        int id PK
        string at
        string device
        string action
        string asset_id
        longtext payload
        int user_id FK
    }
    D13_NOTIFICATION {
        int id PK
        int recipient_user_id FK
        int actor_user_id FK
        string actor_name
        string actor_role
        string action_type
        string action_label
        string asset_id FK
        string asset_name
        string created_at
        string read_at
        int read_by FK
    }
    D3_BORROW {
        int borrow_id PK
        string asset_id FK
        string borrower_name
        string borrow_date
        string return_date
        string status
    }
    D4_INVENTORY {
        int inventory_id PK
        string asset_id FK
        string location
        int quantity
        string capture_date
        string sync_status
    }
    D5_ASSET_TRANSFER {
        int transfer_id PK
        string asset_id FK
        string from_office
        string to_office
        string transfer_date
        string remarks
        string sync_status
    }
```

The generated DDL for this schema is in
[`katipunan_ams_schema.sql`](katipunan_ams_schema.sql).

```sql
-- Example: inspect the normalized asset register
SELECT a.asset_id, a.asset_name, a.`condition`, a.office, a.acquisition_cost,
       l.lifecycle_stage, l.remaining_life,
       f.predicted_quantity, f.status AS forecast_status
FROM assets a
LEFT JOIN asset_lifecycle l ON l.asset_id = a.asset_id
LEFT JOIN procurement_forecast f
       ON f.asset_id = a.asset_id AND f.forecast_year = YEAR(CURDATE())
WHERE a.is_trashed = 0
ORDER BY a.asset_id
LIMIT 20;
```

## Physical tables

ERD entities are prefixed with the matching DFD store number. `APP_STATE` is
the only unnumbered entity because it is the backend JSON snapshot, not a DFD
data store.

| DFD store | ERD entity | MariaDB table | Notes |
| --- | --- | --- | --- |
| D1 User Data | `D1_USER` | `users` | Existing account table. `user_id` = `id`, `full_name` = `name`, `password` = `password_hash` (PBKDF2-SHA256), `status` = `active`. |
| D1 User Data | `D1_SESSION` | `sessions` | Bearer login sessions. |
| D2 Asset Data | `D2_ASSET` | `assets` | One row per equipment record; `asset_id` is the app's equipment ID. |
| D3 Borrow Data | `D3_BORROW` | `borrow` | Borrow / issuance records. |
| D4 Inventory Data | `D4_INVENTORY` | `inventory` | Current location and capture date per asset. |
| D5 Asset Transfer Data | `D5_ASSET_TRANSFER` | `asset_transfer` | Transfer history between offices. |
| D6 Asset Life Cycle Data | `D6_ASSET_LIFECYCLE` | `asset_lifecycle` | Current stage and remaining useful life per asset. |
| D7 Forecasting Data | `D7_PROCUREMENT_FORECAST` | `procurement_forecast` | One forecast row per asset per year. |
| D8 Maintenance Data | `D8_MAINTENANCE_RECORD` | `maintenance_asset_report` | Repair / maintenance history. |
| D9 Report Data | `D9_REPORT` | `report` | Generated report records (CSV, print, summary). |
| D10 Activity Logs Data | `D10_ACTIVITY_LOG` | `activity_log` | The app's activity log (`mets_log`). |
| D10 Activity Logs Data | `D10_AUDIT` | `audit` | Server-side security/audit trail. |
| D11 Backup Data | `D11_BACKUP` | `backup` | Server JSON exports and recorded client backups. |
| D12 Scan and Location Data | `D12_ASSET_SCAN` | `asset_scan` | Per-scan history with coordinates and actor details. |
| D13 Notification Data | `D13_NOTIFICATION` | `notifications` | Role-targeted notification feed generated by the backend. |
| D14 Sync Data | `D14_SYNC_EVENT` | `sync_events` | Device synchronization records. |
| — | `APP_STATE` | `app_state` | Backend JSON snapshot; not a DFD data store. |

### Why `asset_scan` exists

`sync_events` records device sync actions as opaque JSON, and `inventory` stores a
single current row per asset. Neither supports a queryable per-asset scan
history with coordinates and the user who performed the scan. `asset_scan`
adds that history with foreign keys to `assets` and `users`; the client
generates the `scan_id`, so retries and offline synchronization are idempotent.

The implemented DFD, including data stores D1–D14 and DFD-named SQL views, is in
[`DFD_MAPPING.md`](DFD_MAPPING.md).

## Relationship implementation

- `assets.user_id` → `users.id`, `ON DELETE SET NULL` (history survives when an account is removed).
- All asset child tables reference `assets.asset_id` with `ON DELETE CASCADE`.
- `backup.user_id`, `activity_log.user_id`, and `report.user_id` reference `users.id` with `ON DELETE SET NULL`.
- `sessions.user_id` references `users.id` with `ON DELETE CASCADE`.
- `asset_scan.user_id` references `users.id` with `ON DELETE SET NULL`.
- `app_state.updated_by`, `audit.user_id`, and `sync_events.user_id` reference `users.id` with `ON DELETE SET NULL`.
- `notifications.recipient_user_id` references `users.id` with `ON DELETE CASCADE`; `actor_user_id` and `read_by` use `ON DELETE SET NULL`; `asset_id` references `assets.asset_id` with `ON DELETE SET NULL`.

## Additional columns (application compatibility)

The ERD columns are all present. A few extra columns preserve values used by
the v71 interface:

| Table | Extra columns | Purpose |
| --- | --- | --- |
| `assets` | `brand`, `staff_id`, `owner_name`, `owner_position`, `location`, `last_scan_date`, `last_scan_location`, `created_at`, `updated_at` | Equipment details, accountable personnel, scan information. |
| `maintenance_asset_report` | `technician`, `recorded_at` | Service provider and capture time. |
| `procurement_forecast` | `priority`, `bucket` | Forecasting score band (`critical/high/...`) and replacement window. |
| `borrow` | `recorded_at` | Time the record was captured. |
| `report` | `generated_at`, `file_path` | Already in the ERD; used for de-duplication and downloads. |

## How the tables stay in sync

The v71 client is localStorage-first and synchronizes a JSON snapshot through
`PUT /api/state`. The backend keeps that snapshot in `app_state` (for offline
sync and features not covered by the ERD, such as photos, settings, and the
recycle bin) and projects the domain records into the normalized tables in the
same transaction:

```text
browser localStorage
        │  PUT /api/state
        ▼
   app_state (JSON snapshot)
        │  sync_erd()
        ▼
assets ─ asset_lifecycle ─ inventory ─ procurement_forecast
   ├── maintenance_asset_report
   ├── borrow
   └── asset_transfer

users ─ activity_log ─ report ─ backup
```

Projection points:

- server startup (`init_db()`),
- every state save that changes `mets_staffdata`, `mets_repairs`,
  `mets_borrows`, `mets_transfers`, or `mets_log`,
- asset PATCH,
- JSON import,
- state reset (which clears the normalized tables too).

`POST /api/reports` and `POST /api/backups` add records when the app generates
a report or completes a backup. JSON exports through `GET /api/export` add a
`server-json` backup row automatically.

## Accounting / forecasting logic

The normalized tables mirror the browser modules:

- **Life cycle** — stage is derived from condition and remaining useful life
  (`In Service`, `Under Repair`, `End of Life`, `Lost`, `Missing`).
- **Forecast** — condition, elapsed life, repair count, and repair cost produce
  a priority and replacement bucket, matching the Procurement Forecasting
  module's scoring. `predicted_quantity` is 1 for `Replace now` and
  `Within 1 year`.
- **Inventory** — one current row per asset with its location and scan date.

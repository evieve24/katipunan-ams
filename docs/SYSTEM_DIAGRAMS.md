# Katipunan AMS — System Diagrams

This document contains the three design views of the implemented system:

1. **Data Flow Diagram (DFD)** — context and Level 1
2. **Entity Relationship Diagram (ERD)** — 17 tables and 20 foreign keys
3. **Class Diagram** — domain entities and application/service classes

The diagrams use Mermaid, which renders directly on GitHub and in VS Code
Markdown preview. The detailed process mapping, table notes, and scanner design
remain in [`DFD_MAPPING.md`](DFD_MAPPING.md), [`ERD.md`](ERD.md), and
[`SCANNER_GEOLOCATION.md`](SCANNER_GEOLOCATION.md).

> `app_state` is the backend JSON snapshot used for hydration and offline sync.
> It is an implementation table, not a DFD data store. The DFD stores remain
> **D1–D14**, and each is exposed as a read-only view in `katipunan_ams`.

---

## 1. Data Flow Diagram

### 1.1 Context Diagram (Level 0)

```mermaid
flowchart LR
  OIC([GSO-OIC])
  INS([Inspectorate Personnel])
  GSO([GSO Office Personnel])
  HEAD([Municipal Office Head])
  NEW([New User])
  DEV([Browser / Installed PWA])
  GD([Google Drive])

  SYS(("Katipunan AMS<br/>QR Asset Management"))

  OIC -->|users, assets, approvals, backups| SYS
  SYS -->|notifications, reports, asset status| OIC

  INS -->|inspections, scans, inventory| SYS
  SYS -->|asset/scan results and role alerts| INS

  GSO -->|assets, repairs, borrowals, transfers| SYS
  SYS -->|asset records, reports and role alerts| GSO

  HEAD -->|report requests| SYS
  SYS -->|office reports, activity and alerts| HEAD

  NEW -->|sign-up request| SYS
  SYS -->|pending-account status| NEW

  DEV -->|QR scans, offline queue| SYS
  SYS -->|scan results, sync status| DEV

  SYS <-->|JSON/CSV backups| GD
```

### 1.2 Level 1 Data Flow Diagram

```mermaid
flowchart LR
  OIC([GSO-OIC])
  INS([Inspectorate Personnel])
  GSO([GSO Office Personnel])
  HEAD([Municipal Office Head])
  NEW([New User])
  DEV([Browser / PWA])
  GD([Google Drive])

  subgraph Processes[Processes]
    P1["1.0 Manage Users and Sessions"]
    P2["2.0 Manage Assets"]
    P3["3.0 Manage Borrow"]
    P4["4.0 Manage Inventory"]
    P41["4.1 Scan QR and Capture Location"]
    P5["5.0 Asset Transfer"]
    P6["6.0 Asset Life Cycle"]
    P7["7.0 Procurement Forecasting"]
    P8["8.0 Maintenance and Repair"]
    P9["9.0 Generate Reports"]
    P10["10.0 Activity Logs and Audit"]
    P11["11.0 Backup and Restore"]
    P12["12.0 Role-Based Notifications"]
    P13["13.0 Sign-up and Approval"]
    P14["14.0 Offline Sync"]
  end

  subgraph Stores[Data Stores]
    D1[(D1 User Data)]
    D2[(D2 Asset Data)]
    D3[(D3 Borrow Data)]
    D4[(D4 Inventory Data)]
    D5[(D5 Asset Transfer Data)]
    D6[(D6 Asset Life Cycle Data)]
    D7[(D7 Forecasting Data)]
    D8[(D8 Maintenance Data)]
    D9[(D9 Report Data)]
    D10[(D10 Activity Logs Data)]
    D11[(D11 Backup Data)]
    D12[(D12 Scan and Location Data)]
    D13[(D13 Notification Data)]
    D14[(D14 Sync Data)]
  end

  OIC -->|manage users| P1
  OIC -->|manage assets| P2
  OIC -->|borrow oversight| P3
  OIC -->|transfers| P5
  OIC -->|backups| P11

  P2 -.-> P12
  P3 -.-> P12
  P8 -.-> P12
  P41 -.-> P12

  INS -->|inspect assets| P2
  INS -->|inventory counts| P4
  INS -->|scan QR| P41
  INS -->|view activity| P10

  GSO -->|maintain assets| P2
  GSO -->|issue and return| P3
  GSO -->|inventory| P4
  GSO -->|repairs| P8
  GSO -->|scan QR| P41

  HEAD -->|request reports| P9
  HEAD -->|view activity| P10

  NEW -->|sign-up request| P13
  DEV -->|QR scan| P41
  DEV -->|queued scans| P14

  P1 <--> D1
  P2 <--> D2
  P3 <--> D3
  P4 <--> D4
  P5 <--> D5
  P6 <--> D6
  P7 <--> D7
  P8 <--> D8
  P9 <--> D9
  P10 <--> D10
  P11 <--> D11
  P41 <--> D12
  P12 <--> D13
  P14 <--> D14

  P41 -->|asset lookup| D2
  P41 -->|inventory update| D4
  P13 -->|pending account| D1
  P13 -->|approval| P1
  D13 -->|live notifications| OIC
  D13 -->|role alerts| GSO
  D13 -->|role alerts| INS
  D13 -->|office alerts| HEAD
  P9 -->|printed or CSV report| HEAD
  P10 -->|activity and audit view| OIC
  P10 -->|activity view| INS
  P11 -->|backup files| GD
  P14 -->|sync status| DEV
  P41 -->|scan result| DEV
```

### 1.3 DFD data-store map

| DFD store | Physical table(s) | Read-only view |
| --- | --- | --- |
| D1 User Data | `users`, `sessions` | `D1 User Data` |
| D2 Asset Data | `assets` | `D2 Asset Data` |
| D3 Borrow Data | `borrow` | `D3 Borrow Data` |
| D4 Inventory Data | `inventory` | `D4 Inventory Data` |
| D5 Asset Transfer Data | `asset_transfer` | `D5 Asset Transfer Data` |
| D6 Asset Life Cycle Data | `asset_lifecycle` | `D6 Asset Life Cycle Data` |
| D7 Forecasting Data | `procurement_forecast` | `D7 Forecasting Data` |
| D8 Maintenance Data | `maintenance_asset_report` | `D8 Maintenance Data` |
| D9 Report Data | `report` | `D9 Report Data` |
| D10 Activity Logs Data | `activity_log`, `audit` | `D10 Activity Logs Data` |
| D11 Backup Data | `backup` | `D11 Backup Data` |
| D12 Scan and Location Data | `asset_scan` | `D12 Scan and Location Data` |
| D13 Notification Data | `notifications` | `D13 Notification Data` |
| D14 Sync Data | `sync_events` | `D14 Sync Data` |

---

## 2. Entity Relationship Diagram

The implemented schema has **17 base tables** and **20 foreign keys**. Each
entity is prefixed with its matching **DFD data-store number (D1–D14)**.
`APP_STATE` is unnumbered because it is the implementation JSON snapshot, not a
DFD store. Child records are removed with their asset (`ON DELETE CASCADE`);
historical records such as audit, activity, sync, and backups preserve their
rows when a user is removed (`ON DELETE SET NULL`).

```mermaid
erDiagram
    D1_USER |o--o{ D2_ASSET : "is accountable for"
    D1_USER ||--o{ D1_SESSION : owns
    D1_USER |o--o{ D10_ACTIVITY_LOG : performs
    D1_USER |o--o{ D10_AUDIT : "is recorded in"
    D1_USER |o--o{ D9_REPORT : generates
    D1_USER |o--o{ D11_BACKUP : creates
    D1_USER |o--o{ D14_SYNC_EVENT : performs
    D1_USER |o--o{ APP_STATE : updates
    D1_USER |o--o{ D12_ASSET_SCAN : performs
    D1_USER ||--o{ D13_NOTIFICATION : receives
    D1_USER |o--o{ D13_NOTIFICATION : acts
    D1_USER |o--o{ D13_NOTIFICATION : reads

    D2_ASSET ||--o{ D6_ASSET_LIFECYCLE : "has stage"
    D2_ASSET ||--o{ D8_MAINTENANCE_RECORD : "is serviced in"
    D2_ASSET ||--o{ D7_PROCUREMENT_FORECAST : "is forecast in"
    D2_ASSET ||--o{ D3_BORROW : "is borrowed in"
    D2_ASSET ||--o{ D4_INVENTORY : "is counted in"
    D2_ASSET ||--o{ D5_ASSET_TRANSFER : "is transferred in"
    D2_ASSET ||--o{ D12_ASSET_SCAN : "is scanned in"
    D2_ASSET |o--o{ D13_NOTIFICATION : "is referenced in"

    D1_USER {
        int id PK
        string username
        string name
        string role
        string office
        bool active
        string created_at
    }
    D1_SESSION {
        string token PK
        int user_id FK
        string created_at
        string expires_at
        string ip
        string user_agent
    }
    D2_ASSET {
        string asset_id PK
        int user_id FK
        string asset_name
        string brand
        string serial_no
        string category
        string condition
        string office
        string location
        decimal latitude
        decimal longitude
        string acquisition_date
        decimal acquisition_cost
        string useful_life
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
        string technician
    }
    D7_PROCUREMENT_FORECAST {
        int forecast_id PK
        string asset_id FK
        int forecast_year
        int predicted_quantity
        decimal estimated_cost
        string status
        string priority
        string bucket
    }
    D3_BORROW {
        int borrow_id PK
        string asset_id FK
        string borrower_name
        string borrow_date
        string return_date
        string status
        string recorded_at
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
        text value
        string updated_at
        int updated_by FK
    }
    D10_ACTIVITY_LOG {
        int log_id PK
        int user_id FK
        string action
        string details
        string timestamp
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
    D9_REPORT {
        int report_id PK
        int user_id FK
        string report_type
        string report_period
        string generated_at
        string file_path
    }
    D11_BACKUP {
        int backup_id PK
        int user_id FK
        string backup_date
        string file_name
        string storage_type
        string status
    }
    D14_SYNC_EVENT {
        int id PK
        string at
        string device
        string action
        string asset_id
        text payload
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
```

### 2.1 Physical table map

Each ERD entity is prefixed with the DFD store it implements. `APP_STATE` is
the only exception: it is the backend JSON snapshot, not a DFD data store.

| DFD store | ERD entity | Physical table | Notes |
| --- | --- | --- | --- |
| D1 User Data | `D1_USER` | `users` | Accounts and roles |
| D1 User Data | `D1_SESSION` | `sessions` | Bearer sessions |
| D2 Asset Data | `D2_ASSET` | `assets` | Asset register |
| D3 Borrow Data | `D3_BORROW` | `borrow` | Borrow and issuance history |
| D4 Inventory Data | `D4_INVENTORY` | `inventory` | Inventory snapshot |
| D5 Asset Transfer Data | `D5_ASSET_TRANSFER` | `asset_transfer` | Office-to-office transfers |
| D6 Asset Life Cycle Data | `D6_ASSET_LIFECYCLE` | `asset_lifecycle` | Current life-cycle stage |
| D7 Forecasting Data | `D7_PROCUREMENT_FORECAST` | `procurement_forecast` | Replacement/forecast rows |
| D8 Maintenance Data | `D8_MAINTENANCE_RECORD` | `maintenance_asset_report` | Repair and maintenance history |
| D9 Report Data | `D9_REPORT` | `report` | Generated-report records |
| D10 Activity Logs Data | `D10_ACTIVITY_LOG` | `activity_log` | Application activity log |
| D10 Activity Logs Data | `D10_AUDIT` | `audit` | Security audit trail |
| D11 Backup Data | `D11_BACKUP` | `backup` | Backup records |
| D12 Scan and Location Data | `D12_ASSET_SCAN` | `asset_scan` | QR scan and location history |
| D13 Notification Data | `D13_NOTIFICATION` | `notifications` | Role-targeted notification feed |
| D14 Sync Data | `D14_SYNC_EVENT` | `sync_events` | Device synchronization records |
| — | `APP_STATE` | `app_state` | JSON state snapshot, not a DFD store |

---

## 3. Class Diagram

### 3.1 Domain model

```mermaid
classDiagram
    class User {
        <<entity>>
        +int id
        +string username
        +string name
        +string role
        +string office
        +bool active
        +string createdAt
        +login() bool
        +logout() void
    }
    class Session {
        <<entity>>
        +string token
        +string createdAt
        +string expiresAt
        +string ip
        +string userAgent
    }
    class Asset {
        <<entity>>
        +string assetId
        +string name
        +string brand
        +string serialNo
        +string category
        +string condition
        +string office
        +string location
        +decimal latitude
        +decimal longitude
        +string acquisitionDate
        +decimal acquisitionCost
        +string usefulLife
        +bool isTrashed
        +isServiceable() bool
        +scan() void
    }
    class AssetLifecycle {
        <<entity>>
        +int lifecycleId
        +string stage
        +string remainingLife
        +string effectiveDate
    }
    class MaintenanceRecord {
        <<entity>>
        +int maintenanceId
        +string maintenanceType
        +string description
        +string maintenanceDate
        +decimal cost
        +string status
        +string technician
    }
    class BorrowRecord {
        <<entity>>
        +int borrowId
        +string borrowerName
        +string borrowDate
        +string returnDate
        +string status
    }
    class InventoryRecord {
        <<entity>>
        +int inventoryId
        +string location
        +int quantity
        +string captureDate
        +string syncStatus
    }
    class AssetTransfer {
        <<entity>>
        +int transferId
        +string fromOffice
        +string toOffice
        +string transferDate
        +string remarks
        +string syncStatus
    }
    class AssetScan {
        <<entity>>
        +string scanId
        +string actorRole
        +decimal latitude
        +decimal longitude
        +int accuracy
        +string scannedAt
        +string activity
        +string source
        +string device
        +string ip
    }
    class ProcurementForecast {
        <<entity>>
        +int forecastId
        +int forecastYear
        +int predictedQuantity
        +decimal estimatedCost
        +string status
        +string priority
        +string bucket
    }
    class Report {
        <<entity>>
        +int reportId
        +string reportType
        +string reportPeriod
        +string generatedAt
        +string filePath
    }
    class Backup {
        <<entity>>
        +int backupId
        +string backupDate
        +string fileName
        +string storageType
        +string status
    }
    class Notification {
        <<entity>>
        +int id
        +string actionType
        +string actionLabel
        +string details
        +string createdAt
        +string readAt
        +markRead() void
    }
    class ActivityLog {
        <<entity>>
        +int logId
        +string action
        +string details
        +string timestamp
    }
    class AuditLog {
        <<entity>>
        +int id
        +string at
        +string username
        +string action
        +string detail
        +string ip
    }
    class SyncEvent {
        <<entity>>
        +int id
        +string at
        +string device
        +string action
        +string assetId
        +string payload
    }
    class AppState {
        <<entity>>
        +string key
        +string value
        +string updatedAt
        +get() string
        +put() void
    }

    User "1" *-- "0..*" Session : owns
    User "0..1" --> "0..*" Asset : accountable for
    User "0..1" --> "0..*" ActivityLog : performs
    User "0..1" --> "0..*" AuditLog : is recorded in
    User "0..1" --> "0..*" Report : generates
    User "0..1" --> "0..*" Backup : creates
    User "0..1" --> "0..*" SyncEvent : performs
    User "0..1" --> "0..*" AppState : updates
    User "0..1" --> "0..*" AssetScan : performs
    User "1" --> "0..*" Notification : receives
    User "0..1" --> "0..*" Notification : acts
    User "0..1" --> "0..*" Notification : reads

    Asset "1" *-- "0..*" AssetLifecycle : has
    Asset "1" *-- "0..*" MaintenanceRecord : serviced by
    Asset "1" *-- "0..*" BorrowRecord : borrowed in
    Asset "1" *-- "0..*" InventoryRecord : counted in
    Asset "1" *-- "0..*" AssetTransfer : transferred by
    Asset "1" *-- "0..*" AssetScan : scanned in
    Asset "1" *-- "0..*" ProcurementForecast : forecast in
    Asset "0..1" --> "0..*" Notification : referenced by
```

### 3.2 Application and service classes

The backend is function-oriented, so `ApiHandler`, `AuthService`,
`ErdProjector`, `ReportService`, `ScannerService`, and `GeoService` are logical
UML service classes mapped to code modules. `Database`, `Cursor`, and
`NotificationHub` are actual Python classes. `ScanSyncQueue` is the client-side
`KatScanQueue` object.

```mermaid
classDiagram
    class ApiHandler {
        <<controller>>
        +do_GET() void
        +do_POST() void
        +do_PUT() void
        +do_DELETE() void
        -authenticate() User
        -apiState() void
        -apiAssets() void
        -apiScans() void
        -apiNotifications() void
        -apiUsers() void
        -apiReports() void
        -apiBackups() void
    }
    class Database {
        <<infrastructure>>
        -connection
        +execute(sql, params) Cursor
        +executescript(script) void
        +executemany(sql, params) void
        +commit() void
        +rollback() void
        +close() void
    }
    class Cursor {
        <<infrastructure>>
        +fetchone() dict
        +fetchall() list
    }
    class AuthService {
        <<service>>
        +hashPassword(password) tuple
        +verifyPassword(password, hash) bool
        +createSession(user, ip, agent) Session
        +validateToken(token) User
        +audit(user, action, detail, ip) void
    }
    class ErdProjector {
        <<service>>
        +syncErd(state, userId) void
        +clearErd() void
    }
    class NotificationHub {
        <<service>>
        -subscribers map
        +subscribe(userId) Queue
        +unsubscribe(userId, channel) void
        +publish(userId, payload) void
    }
    class ReportService {
        <<client service>>
        +preview(reportType) void
        +print() void
        +exportCsv() void
        +recordReport() void
    }
    class ScannerService {
        <<client service>>
        +start(deviceId) void
        +stop() void
        +decodeFrame() string
        +onDecoded(text) void
    }
    class ScanSyncQueue {
        <<client service>>
        -pendingCount int
        +enqueue(scan) void
        +flush() int
        +refresh() int
        +newId() string
    }
    class GeoService {
        <<client service>>
        +requestFix() Location
        +captureAtScan() Location
        +distanceMeters(a, b) int
    }
    class Asset {
        <<entity>>
    }
    class AssetScan {
        <<entity>>
    }
    class Notification {
        <<entity>>
    }

    ApiHandler ..> Database : uses
    ApiHandler ..> AuthService : authenticates
    ApiHandler ..> ErdProjector : projects
    ApiHandler ..> NotificationHub : publishes
    Database ..> Cursor : creates
    AuthService ..> Database : reads and writes
    ErdProjector ..> Database : projects state
    NotificationHub ..> Notification : pushes
    ReportService ..> Asset : reads
    ReportService ..> ApiHandler : records
    ScannerService ..> ScanSyncQueue : queues
    ScannerService ..> GeoService : captures location
    ScannerService ..> AssetScan : creates
    ScanSyncQueue ..> ApiHandler : syncs
```

---

## 4. Related documentation

- [`DFD_MAPPING.md`](DFD_MAPPING.md) — process, data-store, and table mapping
- [`DFD_DIAGRAM.md`](DFD_DIAGRAM.md) — earlier core and extension DFD views
- [`ERD.md`](ERD.md) — detailed ERD notes and relationship implementation
- [`SCANNER_GEOLOCATION.md`](SCANNER_GEOLOCATION.md) — scan, GPS, map, and offline queue design
- [`katipunan_ams_install.sql`](katipunan_ams_install.sql) — installable schema
- [`katipunan_ams_schema.sql`](katipunan_ams_schema.sql) — generated schema dump

# Katipunan Asset Management System (backend build)

QR Code-Based Asset Management System with Procurement Forecasting for the
Local Government Unit of Katipunan, Zamboanga del Norte.

This build keeps the v71 interface and feature set but adds a real backend:
records are stored in a MariaDB/MySQL database on the LGU server (XAMPP),
accounts are authenticated server-side, and every change is saved
automatically.

## Requirements

- Windows 10/11 (the launcher is a `.bat` file; the server itself runs anywhere)
- Python 3.10 or newer
- **XAMPP** with **MySQL/MariaDB started** in the XAMPP Control Panel
- PyMySQL (`python -m pip install -r requirements.txt`)

The app uses XAMPP only for its MariaDB server. The web app itself is served by
Python on port 8080, not by Apache.

## Run it

1. Open the **XAMPP Control Panel** and click **Start** next to **MySQL**.
2. Install the one Python dependency (first time only):

   ```powershell
   cd "C:\Users\offic\Documents\Default Project"
   python -m pip install -r requirements.txt
   ```

3. Double-click **`start.bat`** (or **`backend\run.bat`**), or from a terminal:

   ```powershell
   python backend\server.py
   ```

Open <http://localhost:8080/>. The v71 landing screen appears first; choose a
role and sign in with one of the accounts below.

The server prints the URL and the MariaDB connection on startup. It creates the
`katipunan_ams` database and its tables automatically on first run.

To create or verify the database manually, import the complete installation
script (it is safe to re-run; all tables use `IF NOT EXISTS`):

```powershell
C:\xampp\mysql\bin\mysql.exe -u root < docs\katipunan_ams_install.sql
```

Or open **phpMyAdmin → Import → `docs/katipunan_ams_install.sql`**. The script
creates `katipunan_ams` with the `utf8mb4_unicode_ci` collation and all 17
tables. Default login accounts are seeded by the Python server on first start.

### Sign-in accounts (seeded on first run)

| Username | Password | Role | Access |
| --- | --- | --- | --- |
| `admin` | `Katipunan@2026` | GSO-OIC | Full system + user administration |
| `inspector` | `Inspector@2026` | Inspectorate Personnel | Inspection / verification views |
| `gsostaff` | `GSOStaff@2026` | GSO Office Personnel | Day-to-day asset operations |
| `officehead` | `OfficeHead@2026` | Municipal Office Head | Office-scoped views |

> **Change these passwords before deployment.** The GSO-OIC can create,
> disable, delete, and reset accounts from **User administration**.
>
> Users may also **sign up** from the login screen for the Inspectorate, GSO
> Office, and Municipal Office Head roles. The account is stored in MariaDB
> with `active = 0` and cannot sign in until a GSO-OIC enables it under
> **User administration**; the GSO-OIC also receives a notification for each
> sign-up. Attempting to sign in before approval shows *"Your account is
> waiting for GSO-OIC approval."*

## Files

```text
Default Project/
├── backend/
│   ├── server.py            # Entry point (starts the HTTP server)
│   ├── config.py            # Environment, paths, roles, seed accounts
│   ├── utils.py             # Time and JSON helpers
│   ├── auth.py              # Password hashing, login throttling, audit
│   ├── db.py                # MariaDB connection wrapper and schema
│   ├── state.py             # app_state JSON helpers
│   ├── erd.py               # ERD projection and forecasting logic
│   ├── api.py               # HTTP handler, REST routes, static serving
│   ├── migrate_sqlite_to_mysql.py  # One-off legacy SQLite import
│   ├── run.bat              # Backend launcher
│   └── data/
│       └── katipunan.db     # Legacy SQLite database (backup only)
├── frontend/
│   ├── templates/
│   │   ├── index.html       # Main application UI and logic
│   │   ├── login.html       # Optional standalone sign-in page
│   │   └── admin.html       # User administration / audit / backups
│   └── static/
│       ├── manifest.json    # PWA install metadata
│       ├── sw.js            # Service worker (API calls are never cached)
│       ├── css/
│       │   ├── app.css      # Main application styles
│       │   ├── login.css    # Standalone sign-in page styles
│       │   └── admin.css    # User administration page styles
│       ├── js/
│       │   ├── app.js       # v71 core UI/data logic
│       │   ├── bootstrap.js # Session bootstrap + autosave
│       │   ├── backend-integration.js
│       │   ├── sync.js
│       │   ├── google-drive.js  # Account, storage, and Drive sync panel
│       │   ├── scan-sync.js     # IndexedDB scan queue and scan-history sync
│       │   ├── notifications.js # GSO-OIC live notification panel
│       │   ├── procurement-forecast.js
│       │   ├── lock-type.js / lock-pin.js / settings-columns.js
│       │   ├── landing.js / sw-register.js
│       │   ├── login.js / admin.js
│       │   ├── qrcode.min.js
│       │   └── html5-qrcode.min.js
│       └── images/
│           └── icons/       # App icons (192px, 512px, maskable 512px)
├── logs/                    # Reserved for server log files
├── media/
│   └── uploads/             # Reserved for uploaded files
├── docs/
│   ├── ERD.md               # Applied ERD, table map, and Mermaid diagram
│   ├── DFD_MAPPING.md       # Implemented DFD, D1-D14 stores, processes, and table mapping
│   ├── DFD_DIAGRAM.md       # Visual updated DFD (core + final-system extensions)
│   ├── SCANNER_GEOLOCATION.md  # Scanner, GPS, map, offline queue, and scan-history design
│   ├── dfd_views.sql        # DFD-named read-only views (D1-D14)
│   ├── katipunan_ams_install.sql  # Complete CREATE DATABASE + table + view installation script
│   └── katipunan_ams_schema.sql  # Generated MariaDB schema (no data)
├── .env.example             # Copy to .env to change HOST/PORT/database settings
├── .gitignore
├── package.json
├── pyproject.toml           # Black/Ruff Python tooling configuration
├── requirements.txt         # PyMySQL
├── start.bat                # Convenience launcher (calls backend\run.bat)
└── README.md
```

| File | Purpose |
| --- | --- |
| `backend/server.py` | Entry point: initializes the database, binds the server, prints connection details. |
| `backend/config.py` | Environment variables, filesystem paths, roles, seed accounts. |
| `backend/utils.py` | Time formatting, JSON encoding, and shared helpers. |
| `backend/auth.py` | PBKDF2 passwords, login throttling, public user data, audit trail. |
| `backend/db.py` | PyMySQL connection wrapper, schema, database creation, initialization. |
| `backend/state.py` | Helpers for reading the JSON state snapshot. |
| `backend/erd.py` | Projects state into normalized tables; life-cycle and forecast calculations. |
| `backend/api.py` | HTTP handler, REST API routes, authentication checks, static serving. |
| `backend/migrate_sqlite_to_mysql.py` | Copies the old SQLite data into MariaDB (run once). |
| `backend/run.bat` | Backend launcher. |
| `backend/data/katipunan.db` | Legacy SQLite database, kept as a backup after the migration. |
| `frontend/templates/index.html` | Application markup; loads CSS and JavaScript from `frontend/static`. |
| `frontend/templates/login.html` | Optional standalone sign-in page; the main app signs in from its landing screen. |
| `frontend/templates/admin.html` | User administration, audit log, backup/restore (GSO-OIC only). |
| `frontend/static/css/app.css` | All application styles, themes, print styles, and responsive rules. |
| `frontend/static/js/app.js` | v71 core: data model, dashboard, assets, personnel, reports, and UI logic. |
| `frontend/static/js/bootstrap.js` | Server session bootstrap, state hydration, and write-through autosave. |
| `frontend/static/js/backend-integration.js` | In-app login, report/backup recording, logout integration. |
| `frontend/static/js/sync.js` | Local persistence, sync queue, and device sync helpers. |
| `frontend/static/js/google-drive.js` | Account panel, server/Drive storage, Google OAuth connection, sync status. |
| `frontend/static/js/scan-sync.js` | IndexedDB queue for offline scans, automatic `/api/scans` synchronization, and online/offline/pending indicators. |
| `frontend/static/js/notifications.js` | GSO-OIC notification card, panel, details, read state, and SSE feed. |
| `frontend/static/js/procurement-forecast.js` | Procurement forecasting module. |
| `frontend/static/js/lock-type.js`, `lock-pin.js` | Screen lock type and PIN/password screens. |
| `frontend/static/js/settings-columns.js` | Settings column manager. |
| `frontend/static/js/landing.js`, `sw-register.js` | Landing animation and service-worker registration. |
| `frontend/static/manifest.json` | PWA install metadata, naming, colors, icons. |
| `frontend/static/sw.js` | Service worker: offline shell; API calls are never cached. |
| `frontend/static/images/icons/` | App icons (192px, 512px, maskable 512px). |
| `docs/ERD.md` | Applied ERD: entities, physical tables, relationships, and diagram. |
| `docs/DFD_MAPPING.md` | Implemented DFD: actors, processes 1.0–14.0, data stores D1–D14, and physical-table mapping. |
| `docs/DFD_DIAGRAM.md` | Visual updated DFD: core D1–D11 plus the D12–D14 final-system extensions. |
| `docs/SCANNER_GEOLOCATION.md` | Scanner, camera selection, GPS, maps, PWA offline queue, database, and testing details. |
| `docs/dfd_views.sql` | Read-only views named after the DFD data stores (`D1 User Data` … `D14 Sync Data`). |
| `docs/katipunan_ams_install.sql` | Complete installation script: creates `katipunan_ams`, all 17 tables, and the DFD views; safe to re-run. |
| `docs/katipunan_ams_schema.sql` | Generated DDL for the live schema (tables, keys, foreign keys). |
| `pyproject.toml` | Black/Ruff configuration for the Python backend. |
| `start.bat` | One-click Windows launcher. |

## How data is stored

- The application state is stored in MariaDB (database `katipunan_ams`) in the
  `app_state` table as key/value rows. This snapshot is what the v71 client
  synchronizes for fast startup and offline use.
- The domain records are also stored in normalized ERD tables: `assets`,
  `asset_lifecycle`, `maintenance_asset_report`, `procurement_forecast`,
  `borrow`, `inventory`, `asset_transfer`, `activity_log`, `report`, and
  `backup`. They are rebuilt from the snapshot on every relevant save, in the
  same transaction.
- Accounts live in `users`, bearer sessions in `sessions`, the audit trail in
  `audit`, and device sync records in `sync_events`.
- The browser keeps a copy in `localStorage` for fast startup and offline use.
- The shipped system starts with an **empty personnel and asset roster** — no
  example staff or demo equipment. Office groups, offices, and their sections
  remain defined; add each person and their accountable equipment through the
  normal **Add Personnel** / **Add Equipment** screens.
- On sign-in the browser **hydrates** from the server; after that every change
  is written through to the server (debounced auto-save).
- Device-only secrets (`mets_pin`, `mets_password`, `mets_username`,
  `mets_lock_type`, `mets_cred_overrides`, and the sync queue) never leave the
  device and are never stored on the server.
- Passwords are hashed with PBKDF2-SHA256 (260,000 iterations). Sessions use
  random bearer tokens valid for 12 hours.

## QR tags and scanning

- Each asset's **QR** button opens a printable government-property tag. The code
  contains a compact JSON payload (asset ID, name, serial, owner, brand,
  status, location, acquisition date, amount, LGU).
- **Download QR** saves the tag as a 456×586 PNG with a banner and asset label.
  On phones it opens the Share/Save sheet when supported; otherwise it
  downloads `QR_<asset-id>.png`. The download button stays visible while the
  asset details scroll, and detail rows stack on narrow screens.
- Generation uses the bundled `frontend/static/js/qrcode.min.js` at 420 px with
  Q error correction, so tags remain readable when printed and work offline.
- Scanning uses `frontend/static/js/html5-qrcode.min.js`:
  - **Mobile Scanner** page → tap the viewfinder. The camera feed appears inside
    the viewfinder (no separate modal).
  - On a valid tag, the **Asset detected** banner shows the office and the
    location accuracy, and **View Asset Details** becomes active.
  - **Upload QR image** and **Demo scan** are available below the viewfinder
    for desktops or when camera access is unavailable.
  - A full JSON payload or just the asset ID works; the app resolves the
    remaining details from its own records.
- Browsers only allow camera access on `localhost` or HTTPS. If you open the
  app from another computer over plain HTTP, use **Upload QR image**, or put
  the server behind HTTPS.

### Geolocation during scans

- Every scan requests the device's location at that moment and stores latitude,
  longitude, accuracy, and timestamp on the asset, plus the last 20 entries in
  `scanHistory`.
- The app tries a high-accuracy fix first, then a network/cell fix. A fix less
  than 90 seconds old is reused so the scan result appears immediately.
- Scans never use fabricated coordinates. If the device location is unavailable,
  the scan is saved without coordinates.
- Allow **Location** for the site in the browser and turn on the device's
  location service. On Windows: Settings → Privacy & security → Location.
- Geolocation, like the camera, needs a secure origin. Use
  `http://localhost:8080` on the server machine or HTTPS. Opening the app from
  a phone at `http://192.168.x.x:8080` will not provide location; use HTTPS for
  LAN scanning.

### Camera controls, scan history, and offline queue

- The **Mobile Scanner** provides a camera selector, **Start**, **Stop**,
  **Scan Again**, **Close**, **Upload QR image**, and **Demo scan**.
- The **desktop QR modal** provides a camera selector, **Start**, **Stop**, and
  **Scan Again**.
- The scanner is tuned for speed: QR-only decoding, native
  `BarcodeDetector` when the browser supports it, 30 FPS, and an adaptive scan
  box (65% of the viewfinder).
- The layout is responsive from phone to desktop: an off-canvas sidebar with a
  hamburger button, stacked statistics/settings grids, horizontally scrollable
  tables, full-screen mobile scanner, and 94vw modals.
- Phones and tablets prefer the rear camera (`facingMode: environment`); laptops
  and desktops can select any connected webcam/USB camera.
- After a scan, the result screen shows the **registered location** and
  **registered coordinates**, the **actual scanned coordinates**, GPS accuracy,
  scan time, a distance check, a **map preview**, **View on Map** and
  **Registered Location** links, **Retry Location**, and the **scan/location
  history**.
- To add registered coordinates to an existing asset, open the asset's
  **Edit Equipment** dialog → **Registered Coordinates** → **Use current
  location** → **Save Changes**. This is the only way to set official
  coordinates after the asset was created; scanning never changes them.
  Scan time is shown even when GPS is unavailable.
- Scans are written to **IndexedDB** first (`katipunan_ams_scans`). When online
  they are posted to `POST /api/scans`; when offline they remain queued with an
  **Offline · N queued** indicator and synchronize automatically when the
  connection returns. The sync bar also shows the pending count.
- The backend is Python; `POST /api/scans` uses parameterized PyMySQL queries
  (there is no PHP in this project). Each scan has a client-generated
  `scan_id`, so retries and offline synchronization cannot create duplicates.
- The new `asset_scan` table stores asset, user, role snapshot, latitude,
  longitude, accuracy, scan time, activity, source, device, and IP. The asset's
  official `location`, `latitude`, and `longitude` are **never changed** by a
  scan; scan coordinates live only in the history/monitoring tables.

## Google Drive backup panel

Google Drive is **optional** and is used only as a backup destination. It is
**not** a login method for the system; LGU accounts still sign in through the
app.

Open the panel from the header Google button or the Mobile Scanner profile icon.
By default it shows:

- **Google Drive Backup** · **No Google account connected** and a neutral
  **Google Drive Not Connected** badge.
- A separate **LGU account** line (for example
  `LGU account: GSO-OIC Administrator (admin)`).
- **LGU Server Storage** from `/api/storage` (database size, application data,
  and backup count).
- Live LGU server sync status and the last sync time.

The user must click **Sign in with Google** and approve Drive access before any
Google account is shown. After connecting, the panel shows the real Google name,
email address, and Drive storage quota. **Switch Account** and **Log Out of
Google Account** appear only while connected.

The OAuth token is kept in memory for the current page session only. It is never
written to MariaDB, `localStorage`, or `sessionStorage`. Reloading the page starts
disconnected, so the user signs in again when they want to run a Drive backup.

Each Drive backup creates two files in **My Drive**:

| File | Purpose |
| --- | --- |
| `LGU_Assets_Backup_YYYY-MM-DD.json` | Machine-readable snapshot used by **Restore from Backup**. Keep this file. |
| `LGU_Assets_List_YYYY-MM-DD` (Google Sheet) | Human-readable inventory: asset ID, equipment, brand/model, serial, condition, category, department/office, accountable person and position, location, acquisition date and cost, remarks, last scan. |

Open the Google Sheet directly in Drive to review or print the asset and
accountability list. The JSON file is what the app restores; the sheet is a
readable companion and does not replace the JSON.

### Configure Google Drive (GSO-OIC, once)

The client ID configures the app only; it does **not** sign a Google account in.
Each user still connects their own account with **Sign in with Google**.

1. Create an **OAuth 2.0 Web client** in Google Cloud Console.
2. Enable the **Google Drive API** for the project.
3. Add the exact **Authorized origin** shown in the panel (for example
   `http://localhost:8080`) to the authorized JavaScript origins.
4. Either put the client ID in `.env`:

   ```text
   GOOGLE_CLIENT_ID=1234567890-xxxx.apps.googleusercontent.com
   ```

   and restart the server, or open the panel, paste it under **Connect a real
   Google account**, and click **Save Client ID** (GSO-OIC only).
5. Each user then clicks **Sign in with Google** and approves access with their
   own Google account.

The panel displays the exact origin to register. Use **Change Google Client ID**
to update or remove the client ID later. Google OAuth only works on `localhost`
or HTTPS; if you see `origin_mismatch`, add the exact origin shown in the panel.
If the popup is blocked, allow popups for this site.

Disconnecting leaves existing backups in Drive and keeps LGU server sync active.

## GSO-OIC notifications

The backend automatically notifies the **GSO-OIC** when an authorized non-OIC
user changes asset data or records an asset transaction.

Detected activities include:

- Adding, editing, or removing an asset.
- Changing condition, location, custody, or other asset fields.
- Submitting or updating a repair request.
- Issuing/borrowing equipment, approving or rejecting a borrow, and returning it.
- Transferring an asset between departments or custodians.
- Inventory scans and location updates.

Each record stores the actor's name and role, action, affected asset, date and
exact time, details, and a previous/updated field table.

- The GSO-OIC dashboard has a **Notifications** card.
- The topbar bell opens the full panel with **All**, **Unread**, and **Alerts**
  tabs, **Mark all read**, and a details modal. The Alerts tab replaces the old
  separate equipment-alert bell and lists damaged, unserviceable, lost, and
  missing assets with their accountable person.
- New notifications arrive through **SSE** (`/api/notifications/stream`) without
  refreshing the page.
- Read/unread state is stored per GSO-OIC account in MySQL.
- Notifications are generated only by the backend from authenticated state
  changes and asset PATCH requests. There is no client endpoint that can create
  notification text, and non-OIC users cannot read or modify the feed.
- The actor is not notified of their own action; other active GSO-OIC accounts
  are.
- The table is `notifications` in `katipunan_ams`; the UI is
  `frontend/static/js/notifications.js`.

## Database schema (ERD)

The implemented ERD is documented in [`docs/ERD.md`](docs/ERD.md). The main
tables are:

| ERD entity | Table |
| --- | --- |
| USER | `users` |
| ASSET | `assets` |
| ASSET_LIFECYCLE | `asset_lifecycle` |
| MAINTENANCE_ASSET_REPORT | `maintenance_asset_report` |
| PROCUREMENT_FORECAST | `procurement_forecast` |
| BACKUP | `backup` |
| ACTIVITY_LOG | `activity_log` |
| REPORT | `report` |
| BORROW | `borrow` |
| INVENTORY | `inventory` |
| ASSET_TRANSFER | `asset_transfer` |

Operational tables: `sessions`, `audit`, `sync_events`, `notifications`, and
`asset_scan` (per-scan location history; see
[`docs/SCANNER_GEOLOCATION.md`](docs/SCANNER_GEOLOCATION.md)).

`assets.asset_id` is the app's equipment ID (for example `HR-EQ1`). Child
tables reference it with `ON DELETE CASCADE`; user references use
`ON DELETE SET NULL` so history survives account removal. The `users` table
implements USER with `id` as `user_id`, `name` as `full_name`, the PBKDF2 hash
as `password`, and `active` as `status`.

### DFD alignment (Option 1)

The implemented DFD is documented in
[`docs/DFD_MAPPING.md`](docs/DFD_MAPPING.md). It keeps the original data stores
D1–D11 and adds D12 Scan & Location, D13 Notifications, and D14 Sync, plus
Processes 4.1, 12.0, 13.0, and 14.0.

The physical tables keep their names. Fourteen read-only views expose the same
data under the DFD store names:

`D1 User Data`, `D2 Asset Data`, `D3 Borrow Data`,
`D4 Inventory Data`, `D5 Asset Transfer Data`, `D6 Asset Life Cycle Data`,
`D7 Forecasting Data`, `D8 Maintenance Data`, `D9 Report Data`,
`D10 Activity Logs Data`, `D11 Backup Data`, `D12 Scan and Location Data`,
`D13 Notification Data`, `D14 Sync Data`.

These are **views inside `katipunan_ams`**, not 14 separate databases. They
appear in phpMyAdmin under **Views**. Because MariaDB on Windows uses
`lower_case_table_names=1`, phpMyAdmin displays them lowercase, for example
`d1 user data`; the DFD labels remain uppercase in the documentation. Quote
the names when querying manually, e.g. ``SELECT * FROM `D1 User Data`;``.

`app_state` is **not a DFD data store** — it is the backend JSON snapshot that
projects into D2–D10, so there is no D0 view.

Apply them with:

```powershell
C:\xampp\mysql\bin\mysql.exe -u root < docs\dfd_views.sql
```

They are also included in `docs/katipunan_ams_install.sql`. The application
never depends on the views and continues to use the physical tables, so they
can be dropped or recreated without affecting the system.

## Database and backups

- Database: MariaDB database `katipunan_ams` (tables created automatically).
- The old SQLite file `backend\data\katipunan.db` is kept as a backup and is no
  longer used by the server. Do not delete it until you have verified the
  MariaDB copy.
- Inspect or back up the database with **phpMyAdmin**
  (<http://localhost/phpmyadmin>) or:

  ```powershell
  & 'C:\xampp\mysql\bin\mysqldump.exe' -u root katipunan_ams > katipunan_ams.sql
  ```

- Back up from the app too: sign in as GSO-OIC and open **User administration →
  Backup & restore → Download backup**.
- Restore a JSON backup with **Choose file** on the same page. Choose OK to
  replace everything, or Cancel to merge keys.
- Reset all server state (GSO-OIC only):
  `POST /api/state/reset` with body `{"confirm":"RESET"}` and a bearer token.

### Moving old SQLite data (already done)

If you need to re-run or repeat the import on another machine:

```powershell
python backend\migrate_sqlite_to_mysql.py           # upsert, safe to repeat
python backend\migrate_sqlite_to_mysql.py --replace # wipe target rows first
python backend\migrate_sqlite_to_mysql.py --dry-run # preview counts only
```

The SQLite file is only read, never modified.

## LAN access (multiple offices)

By default the server binds to `127.0.0.1` (this computer only). To allow other
workstations to connect:

```powershell
$env:HOST="0.0.0.0"
$env:PORT="8080"
python backend\server.py
```

Then open `http://<server-ip>:8080/` from the other machines, and
allow Python/port 8080 through Windows Firewall.

Configuration is read from environment variables. You can also copy
`.env.example` to `.env` in the project root; the backend loads it at startup.

| Variable | Default | Meaning |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Bind address (`0.0.0.0` for LAN) |
| `PORT` | `8080` | Listen port |
| `SESSION_HOURS` | `12` | Login session lifetime in hours |
| `MAX_BODY` | `26214400` | Maximum request body size in bytes |
| `DB_HOST` | `127.0.0.1` | MariaDB host |
| `DB_PORT` | `3306` | MariaDB port |
| `DB_USER` | `root` | MariaDB user |
| `DB_PASSWORD` | *(empty)* | MariaDB password (XAMPP default is empty) |
| `DB_NAME` | `katipunan_ams` | Application database name |
| `GOOGLE_CLIENT_ID` | *(empty)* | Optional Google OAuth Web client ID for Drive uploads |

## API summary

All routes except `/api/health`, `/api/auth/login`, and `/api/auth/register`
require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server liveness |
| POST | `/api/auth/login` | Sign in, returns token + user |
| POST | `/api/auth/register` | Self sign-up (Inspectorate, GSO Office, Municipal Office Head); pending GSO-OIC approval |
| POST | `/api/auth/logout` | End the session |
| GET | `/api/auth/me` | Current user |
| GET | `/api/config` | Public configuration (Google client ID) |
| POST | `/api/config` | Save the Google OAuth client ID (GSO-OIC) |
| POST | `/api/auth/password` | Change own password |
| GET | `/api/state` | Full application state |
| PUT | `/api/state` | Save state keys (`{"updates":{...}}`) |
| POST | `/api/state/reset` | Wipe state (GSO-OIC, `{"confirm":"RESET"}`) |
| GET | `/api/assets` | Flattened asset list (`q`, `status`, `dept`, `limit`, `offset`) |
| GET | `/api/assets/{id}` | Asset detail with repairs/transfers/borrows |
| PATCH | `/api/assets/{id}` | Update status, location, amount, date, remarks |
| POST | `/api/scans` | Save one QR scan (idempotent `scan_id`; validated coordinates) |
| GET | `/api/scans` | Asset scan and location history (`asset_id`, `limit`) |
| GET | `/api/stats` | Asset / personnel / repair totals |
| GET | `/api/storage` | Database, application-state, and backup storage totals |
| GET | `/api/notifications` | GSO-OIC notifications (`limit`, `unread`) |
| GET | `/api/notifications/stream` | Real-time SSE notification stream |
| POST | `/api/notifications/{id}/read` | Mark one notification read |
| POST | `/api/notifications/read-all` | Mark all notifications read |
| GET | `/api/activity` | Activity log |
| POST | `/api/sync` | Record device sync events |
| GET/POST | `/api/users` | List / create accounts (GSO-OIC) |
| PATCH/DELETE | `/api/users/{id}` | Update / delete an account (GSO-OIC) |
| GET | `/api/audit` | Server audit log (GSO-OIC) |
| GET | `/api/reports/summary` | Per-department report summary |
| POST | `/api/reports` | Record a generated report (`{"type","period","filePath"}`) |
| POST | `/api/backups` | Record a completed backup (`{"fileName","storageType"}`) |
| GET | `/api/export` | Download JSON backup (GSO-OIC) |
| POST | `/api/import` | Import JSON backup (GSO-OIC) |

## What is included

- Dashboard with live counts, charts, alerts, and activity log.
- Offices, departments, personnel profiles, and equipment records.
- Equipment master list with QR tag generation, photos, and status.
- QR scanning (camera) plus location capture (geolocation).
- Accountability chain / transfer history.
- Repair and maintenance logs with cost totals.
- Borrow / issuance slips with return tracking.
- GSO Records: audit alerts, transfers, repairs, borrows.
- Procurement Forecasting with inflation and replacement windows.
- Asset Life Cycle monitoring.
- Reports, CSV export, activity log, recycle bin.
- All report generation is centralized in the Reports Center: serviceable, unserviceable, by office, overall master list, PPE, semi-expendable, and procurement forecast reports.
- Role-based permissions (GSO-OIC, Inspectorate, GSO Staff, Office Head).
- Dark mode, search, backup/restore, sync center.
- Search totals and a matching-assets summary by type for each search.
- Server-side authentication, audit trail, and account administration.
- **GSO-OIC notifications** for asset actions with real-time updates, read/unread status, and full previous/updated details.
- Offline support and installable PWA (reads the last synced copy).

## Notes

- **Start MySQL in XAMPP before the server.** If MariaDB is not running, the
  backend stops with a clear message instead of silently losing data.
- The dataset that was in SQLite was migrated into MariaDB, so every module
  already has data to show. Use **Life Cycle > Remove example data** to clear
  the seeded demo values.
- Internet is needed the first time to load the Google Fonts, Tabler icons,
  QRCode.js, and Chart.js CDNs. After that the service worker caches them.
- If the server is unreachable, the app still opens offline using the last
  synced data; the cloud indicator shows `Cloud: offline` and retries saves.

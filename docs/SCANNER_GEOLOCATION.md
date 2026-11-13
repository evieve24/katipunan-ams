# QR Scanner, Geolocation, and Asset Scan History

This document describes the QR scanning, geolocation, map, PWA offline queue,
database, activity-log, and notification implementation added to the existing
Katipunan AMS project.

## 1. Existing project inspected first

- **Backend:** Python 3.12 custom HTTP server (`backend/server.py`,
  `backend/api.py`), MariaDB 10.11 through the `db.py` connection wrapper.
  There is **no PHP** in this project. The requirement for prepared statements
  is met with parameterized `%s` queries in Python (`mysql-connector`), which
  are the project's equivalent of PDO prepared statements.
- **Frontend:** v71 UI in `frontend/templates/index.html` plus modules under
  `frontend/static/js`. `html5-qrcode` and `qrcode.min.js` are bundled.
- **PWA:** `frontend/static/sw.js` (app-shell cache, network-first
  navigations) and `frontend/manifest.json`.
- **Roles:** `oic`, `inspector`, `gsostaff`, `officehead` (`config.ROLES`).
- **Existing tables used:** `assets`, `inventory`, `activity_log`, `users`,
  `backup`, `notifications`, `sync_events`, `app_state`.
- **Existing QR flow:** `onQRScanSuccess` (modal scanner) and `onQRDecoded`
  (mobile scanner), with `recordAssetScan()` saving the last scan and a
  20-entry local `scanHistory`.

## 2. New table: `asset_scan`

Created by `backend/db.py` on startup (and in
`docs/katipunan_ams_schema.sql`):

| Column | Type | Notes |
| --- | --- | --- |
| `scan_id` | `VARCHAR(64)` PK | Client-generated UUID; idempotency key |
| `asset_id` | `VARCHAR(60)` FK → `assets.asset_id` | `ON DELETE CASCADE` |
| `user_id` | `INT` FK → `users.id` | `ON DELETE SET NULL` |
| `actor_role` | `VARCHAR(40)` | Role snapshot at scan time |
| `latitude` | `DECIMAL(10,7)` | `NULL` if no real GPS fix |
| `longitude` | `DECIMAL(10,7)` | `NULL` if no real GPS fix |
| `accuracy` | `DECIMAL(8,2)` | Metres |
| `scanned_at` | `VARCHAR(40)` | UTC ISO timestamp |
| `activity` | `VARCHAR(255)` | Human-readable scan description |
| `source` | `VARCHAR(40)` | `qr_scan`, `qr_mobile_scan`, `qr_scan_retry` |
| `device` | `VARCHAR(190)` | Browser/device string |
| `ip` | `VARCHAR(64)` | Client address |
| `created_at` | `VARCHAR(40)` | Server receive time |

Indexes: `(asset_id, scanned_at)` and `(user_id, scanned_at)`.

**Why a new table:** `sync_events` stores opaque sync payloads and `inventory`
stores only the latest location per asset. Neither provides a queryable
per-asset scan/location history with user and accuracy. `asset_scan` is the
authoritative history; `inventory` remains the monitoring snapshot; the
official `assets.location`, `assets.latitude`, and `assets.longitude` are
never changed by a scan.

## 3. Backend API

All routes require a bearer token unless noted.

### `POST /api/scans`

Body:

```json
{
  "scan_id": "uuid-or-client-id",
  "asset_id": "HR-EQ1",
  "latitude": 8.521612,
  "longitude": 123.305344,
  "accuracy": 12,
  "scanned_at": "2026-11-09T03:12:00Z",
  "activity": "QR scan — Desktop Computer at 8.52161, 123.30534 (±12m)",
  "source": "qr_scan"
}
```

Validation:

- `scan_id`: 8–64 chars, letters/numbers/`.`/`_`/`:`/`-`.
- `asset_id`: required, max 60, must exist in `assets` and not be trashed.
- latitude/longitude: both provided or both omitted; latitude −90..90,
  longitude −180..180.
- accuracy: 0–100000; `scanned_at`: ISO date/time, normalised to UTC.
- user ID/role are taken from the authenticated session, never the body.

Responses:

- `201` created, `200` duplicate (`duplicate: true`), `400` validation,
  `404` asset not found.
- `INSERT IGNORE` on `scan_id` makes offline retries idempotent.
- The response includes the asset's **registered** coordinates for comparison.

### `GET /api/scans?asset_id=...&limit=20`

Returns newest-first scan records joined with `users` for name/role label.
Limit is capped at 100.

### Existing state/activity/notification flow

The scanner still calls the existing `logAction()` and `queueSync('qr_scan', ...)`
flow. That writes `mets_log`, which `/api/state` projects into
`activity_log`, and the backend diff engine emits role-targeted notifications
for the asset's changed last-scan fields. Scan-only diffs are classified as
**`asset_scanned` / "Asset scanned"**. The OIC, GSO Staff, Inspectorate, and
the asset's Office Head receive it when their role/office matches; the actor's
own scans do not notify themselves.

## 4. Frontend

### On-device queue (`frontend/static/js/scan-sync.js`)

- IndexedDB database `katipunan_ams_scans`, store `pending_scans`,
  keyPath `scan_id`; localStorage fallback `kat_pending_scans` if IDB is
  unavailable.
- `KatScanQueue.enqueue(record)` always stores locally first.
- If online + token, it posts to `/api/scans`; on success or duplicate it
  deletes the queue entry. A `404` is kept and retried because an offline
  asset may still be syncing; `401/403` stops until the next sign-in.
- Flushes on load, on `online`, every 20 s, on `visibilitychange`, and when
  **Sync Now** runs.
- Duplicate prevention is both client-side (one `scan_id` per scan) and
  server-side (`PRIMARY KEY` + `INSERT IGNORE`).
- Queue records contain only scan data (asset ID, coordinates, accuracy, time,
  activity, source, device); no employee details or asset metadata.
- Updates the top sync bar and any `[data-scan-status]`/`[data-scan-pending]`
  elements: **Online**, **Offline**, and **N pending** states.

### Scan handlers

- `frontend/static/js/app.js`
  - `queueAssetScan()` builds the queue record. Demo coordinates are never
    sent: if demo mode is on, latitude/longitude/accuracy are `NULL`.
  - `recordAssetScan()` now also writes `lastScanDate` and `lastScanTime`.
  - `onQRScanSuccess()` (modal) and `onQRDecoded()` (mobile) enqueue the scan
    and render the monitoring panel.
  - `renderScanMonitoring()` shows registered location/coordinates, actual
    scan coordinates, accuracy, time, distance check, map iframe, Google Maps
    links, retry-location button, and scan history.
  - `retryScanLocation()` retries a real fix and updates the pending queue
    record (or creates a new retry scan if it already synced).
  - Camera helpers: `loadCameraSelectors()`, `restartQRScannerCamera()`,
    `stopQRScannerCamera()`, `restartMobileCamera()`, `stopMobileCamera()`.
  - Start uses a chosen `deviceId` when available; otherwise
    `facingMode: environment` (rear camera on phones/tablets).
  - `renderScanMonitoring()` uses a Google Maps embed for the scanned
    coordinates (or registered coordinates when no scan fix exists) and hides
    the iframe offline. "View on Map" and "Registered Location" open Google
    Maps in a new tab.

### UI additions

- Mobile scanner: starts automatically after an office is selected. The mobile
  scanner has no camera selector, upload, demo, or control row; use the topbar
  close button. Detection shows the confirmation banner and **View Asset
  Details**.
- QR-only decoding, native BarcodeDetector where available, 30 FPS, and an
  adaptive scan box for faster detection.
- Scanner modal: camera selector, **Start**, **Stop**, **Scan Again** buttons.
- Result screens (mobile and modal): registered vs scanned coordinates,
  accuracy, scan time, distance check, map preview, Google Maps buttons,
  retry location, scan/location history, online/offline/pending indicator.
- **Edit Equipment** includes a **Registered Coordinates** field with a
  **Use current location** button. Saving it updates the asset's official
  registered coordinates (used for the scan comparison); scans never change
  them automatically.
- Scan time is displayed from the scan timestamp even when no GPS fix exists.
- Top sync bar now includes pending scan count.

### Camera/device behaviour

- Laptop/desktop webcam: modal or auto-starting mobile scanner; the scanner
  modal's selector lists devices from `Html5Qrcode.getCameras()`.
- USB webcam: same device list in the scanner modal.
- Android/iPhone/iPad: `facingMode: environment` selects the rear camera
  automatically.
- Installed PWA: the shell and scanner libraries are cached; camera and
  geolocation work subject to browser permission/secure-origin rules.
- Camera access requires `localhost` or HTTPS. Geolocation has the same secure
  origin requirement.

## 5. Security and privacy

- Scans require an authenticated session; the backend derives `user_id` and
  role from the token.
- Coordinates are validated server-side; out-of-range values are rejected.
- The scan endpoint never writes `assets.location`, `assets.latitude`, or
  `assets.longitude`.
- The collection is event-based only: location is requested when the scanner
  opens/scan occurs or when the user presses **Enable Location/Retry**;
  there is no background tracking.
- Demo coordinates are off by default and are never saved to `asset_scan`.
- `asset_scan` is regular MariaDB data protected by the existing server
  authentication. The queue contains no employee data.

## 6. Testing performed

1. **Backend table/API**: table created; create → 201; duplicate `scan_id` →
   200; invalid latitude → 400; unknown asset → 404; history query returns
   user/role/coordinates.
2. **Official location comparison**: asset registered at
   8.5216/123.3053; scan at 8.5230/123.3060; `assets.latitude/longitude`
   remained 8.5216/123.3053 and `location` remained `GSO Office`.
3. **Geolocation**: high-accuracy then network fallback; real fix captured and
   displayed; demo fallback off by default; denied/unavailable returns
   "Location not captured" rather than fabricated coordinates.
4. **Frontend queue**: online enqueue synced and cleared; offline simulation
   showed **Offline · 1 scan queued** and pending badge; `online` event
   synced; duplicate re-enqueue did not create a second row.
5. **Modal and mobile result screens**: registered/scanned coordinates,
   accuracy, distance check, map iframe, history, and sync status all
   rendered; no console errors.
6. **Notifications**: an Inspector state update produced an
   `asset_scanned` / "Asset scanned" notification for the authorized roles with
   actor, role, asset, previous/updated scan fields.
7. **Activity log**: the scan entry appeared in `activity_log` with `user_id`,
   action text (asset + location), and timestamp.
8. **Clean state**: test staff/assets/scans/notifications removed; personnel
   and assets are 0, offices/groups remain.

## 7. Files changed or added

- Added `backend` table: `asset_scan` in `backend/db.py`.
- Updated `backend/erd.py`: official asset coordinates no longer fall back to
  the last scan coordinates.
- Updated `backend/api.py`: `POST /api/scans`, `GET /api/scans`, validation,
  idempotent insert, audit.
- Updated `backend/notifications.py`: scan-only changes become
  `asset_scanned` / "Asset scanned".
- Added `frontend/static/js/scan-sync.js`.
- Updated `frontend/static/js/app.js`: scan queue integration, camera
  selection/start/stop, map/history/retry UI, official-location safety.
- Updated `frontend/static/js/sync.js`: pending-scan counts in the sync bar;
  demo-data seeder disabled.
- Updated `frontend/templates/index.html`: scanner controls, camera selects,
  result monitoring panels, map/history, script include.
- Updated `frontend/static/css/app.css`: scanner controls, map, history,
  sync-status styles.
- Updated `frontend/static/sw.js`: cache `scan-sync.js`, version bump.
- Updated `docs/ERD.md`, `docs/katipunan_ams_schema.sql`, `README.md`.

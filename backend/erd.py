"""Normalized ERD projection, life-cycle, and procurement-forecast helpers."""

from __future__ import annotations

import re
import threading
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from state import state_json, state_records
from utils import iso_now

if TYPE_CHECKING:
    from db import Database

PF_LIFE_DEFAULTS = (
    (r"laptop|notebook|desktop|computer|tablet|monitor|\bups\b|server|\bpc\b", 5),
    (r"printer|scanner|copier|photocopier|riso", 5),
    (r"projector|camera|television|\btv\b|speaker|sound", 5),
    (r"air.?con|air conditioner", 8),
    (r"radio|transceiver|handheld|communication", 5),
    (r"motorcycle", 5),
    (r"truck|ambulance|\bvan\b|vehicle|\bcar\b|jeep|pickup|patrol|\bbus\b", 8),
    (r"generator|pump|compressor|mower|chainsaw", 10),
    (r"table|chair|cabinet|desk|shelf|locker|sofa|\bbed\b", 10),
    (r"refrigerator|freezer|oven", 8),
    (
        r"microscope|sphygmo|stethoscope|nebulizer|medical|\becg\b|autoclave|weighing|scale",
        8,
    ),
)

PF_CONDITION_POINTS = {
    "Serviceable": 0,
    "Damaged": 20,
    "Unserviceable": 30,
    "Lost": 15,
    "Missing": 15,
}

PF_BUCKET_LABELS = {
    "now": "Replace now",
    "y1": "Within 1 year",
    "y2": "1-2 years",
    "y3": "2-3 years",
    "later": "Beyond 3 years",
    "unknown": "Insufficient data",
    "verify": "Verify first",
}

PF_PRIORITY_RANK = {"low": 0, "medium": 1, "high": 2, "critical": 3}

DATE_FORMATS = (
    "%Y-%m-%d",
    "%b %d, %Y",
    "%B %d, %Y",
    "%m/%d/%Y, %I:%M:%S %p",
    "%m/%d/%Y %I:%M:%S %p",
    "%m/%d/%Y, %H:%M:%S",
    "%m/%d/%Y %H:%M:%S",
    "%m/%d/%Y",
    "%m/%d/%y",
    "%d %b %Y",
    "%d %B %Y",
)


def parse_date(value) -> datetime | None:
    """Parse the date/time strings used by the v71 UI."""
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.lower() in {"n/a", "na", "-", "\u2014"}:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
        if parsed.tzinfo is not None:
            parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)
        return parsed
    except ValueError:
        pass
    candidates = [text]
    if "," in text and ":" in text:
        candidates.append(text.split(",", 1)[0].strip())
    if "T" in text:
        candidates.append(text.split("T", 1)[0].strip())
    for candidate in candidates:
        for fmt in DATE_FORMATS:
            try:
                return datetime.strptime(candidate, fmt)
            except ValueError:
                continue
    return None


def date_day(value, default: str | None = None) -> str | None:
    parsed = parse_date(value)
    return parsed.strftime("%Y-%m-%d") if parsed else default


def timestamp_text(value, default: str | None = None) -> str:
    parsed = parse_date(value)
    if parsed:
        return parsed.strftime("%Y-%m-%dT%H:%M:%S")
    if value is None or str(value).strip() == "":
        return default or iso_now()
    return str(value)[:40]


def to_number(value) -> float:
    if value is None:
        return 0.0
    text = str(value).replace("\u20b1", "").replace(",", "").strip()
    try:
        return float(text)
    except ValueError:
        return 0.0


def to_coordinate(*values):
    for value in values:
        if value in (None, ""):
            continue
        try:
            return float(str(value).replace(",", "").strip())
        except ValueError:
            continue
    return None


def default_useful_life(name: str) -> int:
    for pattern, years in PF_LIFE_DEFAULTS:
        if re.search(pattern, name or "", re.IGNORECASE):
            return years
    return 5


def remaining_life_text(years: float | None) -> str | None:
    if years is None:
        return None
    if abs(years) < 1:
        return f"{round(years * 12)} mo"
    return f"{round(years, 1)} yrs"


def assess_forecast(asset: dict, repairs: list, today: datetime) -> dict:
    """Mirror the browser's procurement-forecasting scoring."""
    amount = to_number(asset.get("amount"))
    condition = str(asset.get("status") or "Serviceable")
    acquired = parse_date(
        asset.get("acquiredDate")
        or asset.get("acquisitionDate")
        or asset.get("acquired")
    )
    explicit_life = to_number(
        asset.get("usefulLife")
        if asset.get("usefulLife") not in (None, "")
        else asset.get("life")
    )
    life = (
        explicit_life
        if explicit_life > 0
        else float(default_useful_life(str(asset.get("name") or "")))
    )
    elapsed = max(0.0, (today - acquired).days / 365.25) if acquired else None
    rul = (life - elapsed) if elapsed is not None else None
    used = min(1.0, elapsed / life) if elapsed is not None else None

    repair_count = len(repairs) if isinstance(repairs, list) else 0
    repair_cost = (
        sum(to_number(r.get("cost")) for r in repairs if isinstance(r, dict))
        if repair_count
        else 0.0
    )
    cost_ratio = (repair_cost / amount) if amount > 0 else None

    score_life = round(40 * used) if used is not None else 0
    score_condition = PF_CONDITION_POINTS.get(condition, 0)
    score_repair = min(15, repair_count * 5)
    score_cost = (
        round(min(15, (cost_ratio / 0.5) * 15)) if cost_ratio is not None else 0
    )
    score = score_life + score_condition + score_repair + score_cost

    overdue = rul is not None and rul <= 0
    cost_high = cost_ratio is not None and cost_ratio >= 0.5
    priority = (
        "critical"
        if score >= 70
        else "high" if score >= 50 else "medium" if score >= 30 else "low"
    )
    if overdue and condition in ("Unserviceable", "Damaged"):
        priority = "critical"
    floor = {
        "Unserviceable": "high",
        "Damaged": "medium",
        "Lost": "medium",
        "Missing": "medium",
    }.get(condition)
    if floor and PF_PRIORITY_RANK[priority] < PF_PRIORITY_RANK[floor]:
        priority = floor
    if (overdue or cost_high) and PF_PRIORITY_RANK[priority] < PF_PRIORITY_RANK["high"]:
        priority = "high"

    if condition in ("Lost", "Missing"):
        bucket = "verify"
    elif overdue or condition == "Unserviceable" or cost_high:
        bucket = "now"
    elif rul is None:
        bucket = "unknown"
    elif rul <= 1:
        bucket = "y1"
    elif rul <= 2:
        bucket = "y2"
    elif rul <= 3:
        bucket = "y3"
    else:
        bucket = "later"

    estimated_cost = amount if amount > 0 and bucket != "verify" else 0.0
    return {
        "rul": rul,
        "priority": priority,
        "bucket": bucket,
        "status": PF_BUCKET_LABELS[bucket],
        "predicted_quantity": 1 if bucket in ("now", "y1") else 0,
        "estimated_cost": round(estimated_cost, 2),
        "overdue": overdue,
    }


def clear_erd(con: Database) -> None:
    """Remove all normalized application records (user accounts are kept)."""
    for table in (
        "asset_lifecycle",
        "maintenance_asset_report",
        "procurement_forecast",
        "borrow",
        "inventory",
        "asset_transfer",
        "activity_log",
        "report",
        "backup",
        "assets",
    ):
        con.execute(f"DELETE FROM `{table}`")


_ERD_LOCK = threading.Lock()


def sync_erd(
    con: Database, state: dict[str, str], user_id: int | None = None
) -> dict[str, int]:
    """Serialize normalized-table rebuilds so concurrent saves cannot interleave."""
    with _ERD_LOCK:
        return _sync_erd(con, state, user_id)


def _sync_erd(
    con: Database, state: dict[str, str], user_id: int | None = None
) -> dict[str, int]:
    """Project the application state into the normalized ERD tables.

    The v71 client still syncs a JSON snapshot through /api/state, so the
    normalized tables are rebuilt from that snapshot inside the same
    transaction. This keeps the UI unchanged while giving MariaDB a fully
    relational schema (assets, lifecycle, maintenance, forecasts, ...).
    """
    now = iso_now()
    today = datetime.now()
    staff = state_json(state, "mets_staffdata", {})
    repairs_by_asset = state_records(state, "mets_repairs")
    borrows_by_asset = state_records(state, "mets_borrows")
    transfers_by_asset = state_records(state, "mets_transfers")
    log = state_json(state, "mets_log", [])

    if not user_id:
        admin = con.execute(
            "SELECT id FROM users WHERE role = 'oic' ORDER BY id LIMIT 1"
        ).fetchone()
        user_id = admin["id"] if admin else None

    for table in (
        "asset_lifecycle",
        "maintenance_asset_report",
        "procurement_forecast",
        "borrow",
        "inventory",
        "asset_transfer",
        "activity_log",
    ):
        con.execute(f"DELETE FROM `{table}`")

    asset_rows: list[tuple] = []
    lifecycle_rows: list[tuple] = []
    inventory_rows: list[tuple] = []
    forecast_rows: list[tuple] = []
    maintenance_rows: list[tuple] = []
    borrow_rows: list[tuple] = []
    transfer_rows: list[tuple] = []
    activity_rows: list[tuple] = []
    seen: set[str] = set()
    counts = {
        "assets": 0,
        "lifecycle": 0,
        "inventory": 0,
        "forecasts": 0,
        "maintenance": 0,
        "borrows": 0,
        "transfers": 0,
        "activity": 0,
    }

    def repair_list(asset_id: str) -> list:
        value = repairs_by_asset.get(asset_id)
        return value if isinstance(value, list) else []

    for dept, people in (staff.items() if isinstance(staff, dict) else []):
        if not isinstance(people, list):
            continue
        for person in people:
            if not isinstance(person, dict):
                continue
            for eq in person.get("equipment") or []:
                if not isinstance(eq, dict):
                    continue
                asset_id = str(eq.get("id") or "").strip()
                if not asset_id:
                    continue
                seen.add(asset_id)

                name = str(eq.get("name") or "").strip() or asset_id
                amount = to_number(eq.get("amount"))
                condition = str(eq.get("status") or "").strip()
                acquired_raw = (
                    eq.get("acquiredDate")
                    or eq.get("acquisitionDate")
                    or eq.get("acquired")
                )
                acquired_dt = parse_date(acquired_raw)
                acquired_day = acquired_dt.strftime("%Y-%m-%d") if acquired_dt else None
                useful_raw = (
                    eq.get("usefulLife")
                    if eq.get("usefulLife") not in (None, "")
                    else eq.get("life")
                )
                useful_life = (
                    str(useful_raw).strip() if useful_raw not in (None, "") else None
                )
                property_no = (
                    eq.get("propertyNo") or eq.get("property_no") or eq.get("property")
                )
                serial_no = (
                    eq.get("serial") or eq.get("serialNo") or eq.get("serial_no")
                )
                qr_code = eq.get("qrCode") or eq.get("qr") or asset_id
                category = eq.get("category") or (
                    "PPE" if amount >= 50000 else "Semi-Expendable"
                )
                location = str(eq.get("location") or "")[:190] or None
                last_scan = date_day(eq.get("lastScanDate"))
                last_scan_location = (
                    str(
                        eq.get("lastScannedLocation")
                        or eq.get("lastScanLocation")
                        or ""
                    )[:190]
                    or None
                )

                asset_rows.append(
                    (
                        asset_id,
                        user_id,
                        name,
                        str(property_no)[:120] if property_no else None,
                        str(serial_no)[:190] if serial_no else None,
                        str(qr_code)[:190] if qr_code else None,
                        str(category)[:80] if category else None,
                        condition[:40] if condition else None,
                        str(dept)[:120],
                        acquired_day,
                        amount,
                        useful_life[:40] if useful_life else None,
                        to_coordinate(eq.get("latitude"), eq.get("regLat")),
                        to_coordinate(eq.get("longitude"), eq.get("regLng")),
                        "synced",
                        str(eq.get("brand") or "")[:190] or None,
                        str(person.get("id") or "")[:60] or None,
                        str(person.get("name") or "")[:190] or None,
                        str(person.get("pos") or "")[:190] or None,
                        location,
                        last_scan,
                        last_scan_location,
                        now,
                        now,
                    )
                )
                counts["assets"] += 1

                life_years = (
                    to_number(useful_raw) if useful_raw not in (None, "") else 0
                )
                if life_years <= 0:
                    life_years = float(default_useful_life(name))
                elapsed = (
                    max(0.0, (today - acquired_dt).days / 365.25)
                    if acquired_dt
                    else None
                )
                rul = (life_years - elapsed) if elapsed is not None else None
                if condition in ("Lost", "Missing"):
                    stage = condition
                elif condition == "Unserviceable":
                    stage = "End of Life"
                elif condition == "Damaged":
                    stage = "Under Repair"
                elif rul is not None and rul <= 0:
                    stage = "End of Life"
                else:
                    stage = "In Service"

                lifecycle_rows.append(
                    (
                        asset_id,
                        stage,
                        remaining_life_text(rul),
                        acquired_day or now[:10],
                    )
                )
                counts["lifecycle"] += 1

                inventory_rows.append(
                    (
                        asset_id,
                        location or last_scan_location,
                        1,
                        last_scan or now[:10],
                        "synced",
                    )
                )
                counts["inventory"] += 1

                forecast = assess_forecast(eq, repair_list(asset_id), today)
                forecast_rows.append(
                    (
                        asset_id,
                        today.year,
                        forecast["predicted_quantity"],
                        forecast["estimated_cost"],
                        forecast["status"],
                        forecast["priority"],
                        forecast["bucket"],
                    )
                )
                counts["forecasts"] += 1

    con.executemany(
        "INSERT INTO assets (asset_id, user_id, asset_name, property_no, serial_no, qr_code,"
        " category, `condition`, office, acquisition_date, acquisition_cost, useful_life,"
        " latitude, longitude, is_trashed, sync_status, brand, staff_id, owner_name,"
        " owner_position, location, last_scan_date, last_scan_location, created_at, updated_at)"
        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,0,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        " ON DUPLICATE KEY UPDATE asset_name=VALUES(asset_name),"
        " property_no=VALUES(property_no), serial_no=VALUES(serial_no), qr_code=VALUES(qr_code),"
        " category=VALUES(category), `condition`=VALUES(`condition`), office=VALUES(office),"
        " acquisition_date=VALUES(acquisition_date), acquisition_cost=VALUES(acquisition_cost),"
        " useful_life=VALUES(useful_life), latitude=VALUES(latitude), longitude=VALUES(longitude),"
        " is_trashed=0, sync_status=VALUES(sync_status), brand=VALUES(brand),"
        " staff_id=VALUES(staff_id), owner_name=VALUES(owner_name),"
        " owner_position=VALUES(owner_position), location=VALUES(location),"
        " last_scan_date=VALUES(last_scan_date), last_scan_location=VALUES(last_scan_location),"
        " updated_at=VALUES(updated_at)",
        asset_rows,
    )

    if seen:
        placeholders = ",".join(["%s"] * len(seen))
        con.execute(
            f"UPDATE assets SET is_trashed=1, updated_at=%s WHERE asset_id NOT IN ({placeholders})",
            [now, *seen],
        )
    else:
        con.execute("UPDATE assets SET is_trashed=1, updated_at=%s", (now,))

    con.executemany(
        "INSERT INTO asset_lifecycle (asset_id, lifecycle_stage, remaining_life, effective_date)"
        " VALUES (%s,%s,%s,%s)",
        lifecycle_rows,
    )
    con.executemany(
        "INSERT INTO inventory (asset_id, location, quantity, capture_date, sync_status)"
        " VALUES (%s,%s,%s,%s,%s)",
        inventory_rows,
    )
    con.executemany(
        "INSERT INTO procurement_forecast (asset_id, forecast_year, predicted_quantity,"
        " estimated_cost, status, priority, bucket) VALUES (%s,%s,%s,%s,%s,%s,%s)"
        " ON DUPLICATE KEY UPDATE predicted_quantity=VALUES(predicted_quantity),"
        " estimated_cost=VALUES(estimated_cost), status=VALUES(status),"
        " priority=VALUES(priority), bucket=VALUES(bucket)",
        forecast_rows,
    )

    for asset_id, records in repairs_by_asset.items():
        if asset_id not in seen or not isinstance(records, list):
            continue
        for record in records:
            if not isinstance(record, dict):
                continue
            description = record.get("description") or record.get("remarks")
            if not description:
                extras = [
                    str(record.get(key)).strip()
                    for key in ("tech", "coord")
                    if record.get(key)
                ]
                description = " / ".join(extras) or None
            maintenance_rows.append(
                (
                    asset_id,
                    str(record.get("type") or "Maintenance")[:120],
                    str(description)[:2000] if description else None,
                    date_day(
                        record.get("date")
                        or record.get("maintenanceDate")
                        or record.get("recordedAt")
                    ),
                    to_number(record.get("cost")),
                    str(record.get("status") or "")[:60] or None,
                    str(record.get("tech") or "")[:190] or None,
                    timestamp_text(record.get("recordedAt"), None),
                )
            )
            counts["maintenance"] += 1

    con.executemany(
        "INSERT INTO maintenance_asset_report (asset_id, maintenance_type, description,"
        " maintenance_date, cost, status, technician, recorded_at)"
        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        maintenance_rows,
    )

    for asset_id, records in borrows_by_asset.items():
        if not isinstance(records, list):
            continue
        for record in records:
            if not isinstance(record, dict):
                continue
            target = str(record.get("eqId") or record.get("assetId") or asset_id)
            if target not in seen:
                continue
            return_date = record.get("returnedDate") or record.get("returnDate")
            borrow_rows.append(
                (
                    target,
                    str(record.get("borrower") or record.get("borrowerName") or "")[
                        :190
                    ]
                    or None,
                    date_day(
                        record.get("borrowDate")
                        or record.get("date")
                        or record.get("recordedAt")
                    ),
                    date_day(return_date),
                    str(
                        record.get("status")
                        or ("Returned" if return_date else "Borrowed")
                    )[:40],
                    timestamp_text(record.get("recordedAt"), None),
                )
            )
            counts["borrows"] += 1

    con.executemany(
        "INSERT INTO borrow (asset_id, borrower_name, borrow_date, return_date, status, recorded_at)"
        " VALUES (%s,%s,%s,%s,%s,%s)",
        borrow_rows,
    )

    for asset_id, records in transfers_by_asset.items():
        if not isinstance(records, list):
            continue
        for record in records:
            if not isinstance(record, dict):
                continue
            target = str(record.get("eqId") or record.get("assetId") or asset_id)
            if target not in seen:
                continue
            transfer_rows.append(
                (
                    target,
                    str(record.get("fromOffice") or record.get("from") or "")[:120]
                    or None,
                    str(record.get("toOffice") or record.get("to") or "")[:120] or None,
                    date_day(
                        record.get("date")
                        or record.get("transferDate")
                        or record.get("recordedAt")
                    ),
                    record.get("remarks") or record.get("note"),
                    str(record.get("syncStatus") or "synced")[:40],
                )
            )
            counts["transfers"] += 1

    con.executemany(
        "INSERT INTO asset_transfer (asset_id, from_office, to_office, transfer_date,"
        " remarks, sync_status) VALUES (%s,%s,%s,%s,%s,%s)",
        transfer_rows,
    )

    users = con.execute("SELECT id, username, name FROM users").fetchall()
    user_by_name: dict[str, int] = {}
    for row in users:
        user_by_name[str(row["username"] or "").strip().lower()] = row["id"]
        user_by_name[str(row["name"] or "").strip().lower()] = row["id"]

    for entry in log if isinstance(log, list) else []:
        if not isinstance(entry, dict):
            continue
        message = str(entry.get("msg") or entry.get("action") or "").strip()
        if not message:
            continue
        geo = entry.get("geo")
        activity_rows.append(
            (
                user_by_name.get(str(entry.get("user") or "").strip().lower()),
                message[:255],
                f"geo={geo}" if geo else None,
                timestamp_text(entry.get("time") or entry.get("timestamp")),
            )
        )
        counts["activity"] += 1

    con.executemany(
        "INSERT INTO activity_log (user_id, `action`, details, `timestamp`) VALUES (%s,%s,%s,%s)",
        activity_rows,
    )

    return counts

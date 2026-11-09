"""Backend-generated notifications for the GSO-OIC.

Notifications are derived from authenticated state changes and explicit asset
PATCH calls. Clients cannot submit notification text directly.
"""

from __future__ import annotations

import json
import queue
import threading
from typing import TYPE_CHECKING

from config import ROLES
from state import state_json, state_records
from utils import iso_now

if TYPE_CHECKING:
    from db import Database

# Only these state keys can produce activity notifications. mets_log is
# deliberately excluded to avoid duplicating the structured diffs below.
NOTIFY_STATE_KEYS = {
    "mets_staffdata",
    "mets_repairs",
    "mets_borrows",
    "mets_transfers",
}

ASSET_FIELD_LABELS = {
    "name": "Equipment",
    "brand": "Brand/Model",
    "serial": "Serial No.",
    "status": "Condition",
    "location": "Location",
    "amount": "Purchase price",
    "acquiredDate": "Acquisition date",
    "usefulLife": "Useful life",
    "remarks": "Remarks",
    "owner": "Custodian",
    "dept": "Department",
    "lastScanDate": "Last scan",
    "lastScannedLocation": "Last scanned location",
}

REPAIR_FIELD_LABELS = {
    "type": "Repair type",
    "date": "Repair date",
    "cost": "Cost",
    "status": "Status",
    "tech": "Technician",
    "coord": "Coordinator",
}

BORROW_FIELD_LABELS = {
    "slip": "Slip No.",
    "borrower": "Borrower",
    "office": "Office",
    "purpose": "Purpose",
    "officer": "Issuing officer",
    "dateOut": "Date out",
    "expectedReturn": "Expected return",
    "returnedDate": "Returned date",
    "returnCondition": "Return condition",
    "condition": "Condition",
    "status": "Status",
    "eqName": "Equipment",
    "ownerName": "Custodian",
}

TRANSFER_FIELD_LABELS = {
    "from": "From custodian",
    "to": "To custodian",
    "fromOffice": "From office",
    "toOffice": "To office",
    "date": "Transfer date",
    "reason": "Reason",
    "officer": "Approving officer",
    "remarks": "Remarks",
}


class NotificationHub:
    """In-process fan-out for SSE subscribers, keyed by recipient user id."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._subscribers: dict[int, list[queue.Queue]] = {}

    def subscribe(self, user_id: int) -> queue.Queue:
        channel: queue.Queue = queue.Queue(maxsize=100)
        with self._lock:
            self._subscribers.setdefault(user_id, []).append(channel)
        return channel

    def unsubscribe(self, user_id: int, channel: queue.Queue) -> None:
        with self._lock:
            channels = self._subscribers.get(user_id) or []
            if channel in channels:
                channels.remove(channel)
            if not channels:
                self._subscribers.pop(user_id, None)

    def publish(self, user_id: int, payload: dict) -> None:
        with self._lock:
            channels = list(self._subscribers.get(user_id) or [])
        for channel in channels:
            try:
                channel.put_nowait(payload)
            except queue.Full:
                try:
                    channel.get_nowait()
                    channel.put_nowait(payload)
                except queue.Empty:
                    pass


hub = NotificationHub()


def _text(value) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _norm(value) -> str:
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        return str(float(value))
    return str(value).strip()


def _changes(before: dict, after: dict, labels: dict, fields) -> list[dict]:
    changes = []
    for field in fields:
        old = _norm(before.get(field))
        new = _norm(after.get(field))
        if old != new:
            changes.append(
                {
                    "field": field,
                    "label": labels.get(field, field),
                    "from": old,
                    "to": new,
                }
            )
    return changes


def _summary(changes: list[dict]) -> str:
    return "; ".join(
        f"{item['label']}: {item['from'] or '—'} → {item['to'] or '—'}"
        for item in changes
    )


def _event(
    action_type: str,
    action_label: str,
    asset_id: str | None = None,
    asset_name: str | None = None,
    details: str = "",
    changes: list[dict] | None = None,
    source: str = "state",
) -> dict:
    return {
        "action_type": action_type,
        "action_label": action_label,
        "asset_id": asset_id,
        "asset_name": asset_name,
        "details": details,
        "changes": changes or [],
        "source": source,
    }


def asset_snapshot(eq: dict, person: dict | None = None, dept: str = "") -> dict:
    person = person if isinstance(person, dict) else {}
    return {
        "name": _text(eq.get("name")),
        "brand": _text(eq.get("brand")),
        "serial": _text(eq.get("serial")),
        "status": _text(eq.get("status")),
        "location": _text(eq.get("location")),
        "amount": _text(eq.get("amount")),
        "acquiredDate": _text(eq.get("acquiredDate") or eq.get("acquisitionDate")),
        "usefulLife": _text(eq.get("usefulLife") or eq.get("life")),
        "remarks": _text(eq.get("remarks")),
        "owner": _text(person.get("name") or eq.get("ownerName")),
        "dept": _text(dept),
        "lastScanDate": _text(eq.get("lastScanDate")),
        "lastScannedLocation": _text(eq.get("lastScannedLocation")),
    }


def asset_map(state: dict[str, str]) -> dict[str, dict]:
    staff = state_json(state, "mets_staffdata", {})
    assets: dict[str, dict] = {}
    if not isinstance(staff, dict):
        return assets
    for dept, people in staff.items():
        if not isinstance(people, list):
            continue
        for person in people:
            if not isinstance(person, dict):
                continue
            for eq in person.get("equipment") or []:
                if not isinstance(eq, dict):
                    continue
                asset_id = _text(eq.get("id"))
                if not asset_id:
                    continue
                assets[asset_id] = asset_snapshot(eq, person, str(dept))
    return assets


def _classify_asset_changes(changes: list[dict], after: dict) -> tuple[str, str]:
    fields = {item["field"] for item in changes}
    if "status" in fields:
        condition = _text(after.get("status"))
        if condition in (
            "Damaged",
            "Unserviceable",
            "Lost",
            "Missing",
            "Disposed",
        ):
            return "asset_condition_changed", f"Asset marked as {condition}"
        return "asset_condition_changed", "Asset condition updated"
    if fields <= {"location"}:
        return "inventory_updated", "Inventory location updated"
    if fields <= {"lastScanDate", "lastScannedLocation"}:
        return "asset_scanned", "Asset scanned"
    if "location" in fields and fields <= {
        "location",
        "lastScanDate",
        "lastScannedLocation",
    }:
        return "inventory_updated", "Inventory location updated"
    return "asset_updated", "Asset information updated"


def diff_asset_snapshot(
    before: dict, after: dict, asset_id: str, source: str = "asset_patch"
) -> dict | None:
    fields = (
        "name",
        "brand",
        "serial",
        "status",
        "location",
        "amount",
        "acquiredDate",
        "usefulLife",
        "remarks",
        "owner",
        "dept",
        "lastScanDate",
        "lastScannedLocation",
    )
    changes = _changes(before, after, ASSET_FIELD_LABELS, fields)
    if not changes:
        return None
    action_type, action_label = _classify_asset_changes(changes, after)
    return _event(
        action_type,
        action_label,
        asset_id,
        _text(after.get("name")) or asset_id,
        _summary(changes),
        changes,
        source,
    )


def _asset_events(old_state: dict[str, str], new_state: dict[str, str]) -> list[dict]:
    old_assets = asset_map(old_state)
    new_assets = asset_map(new_state)
    events: list[dict] = []

    for asset_id in sorted(new_assets.keys() - old_assets.keys()):
        asset = new_assets[asset_id]
        changes = [
            {
                "field": field,
                "label": ASSET_FIELD_LABELS[field],
                "from": "",
                "to": asset.get(field, ""),
            }
            for field in (
                "name",
                "brand",
                "serial",
                "status",
                "location",
                "amount",
                "owner",
                "dept",
            )
            if asset.get(field)
        ]
        events.append(
            _event(
                "asset_added",
                "Asset added",
                asset_id,
                asset.get("name") or asset_id,
                "New asset registered",
                changes,
                "state",
            )
        )

    for asset_id in sorted(old_assets.keys() - new_assets.keys()):
        asset = old_assets[asset_id]
        events.append(
            _event(
                "asset_removed",
                "Asset removed",
                asset_id,
                asset.get("name") or asset_id,
                "Asset removed from the inventory",
                [
                    {
                        "field": "status",
                        "label": "Condition",
                        "from": asset.get("status", ""),
                        "to": "Removed",
                    }
                ],
                "state",
            )
        )

    for asset_id in sorted(old_assets.keys() & new_assets.keys()):
        event = diff_asset_snapshot(
            old_assets[asset_id], new_assets[asset_id], asset_id, "state"
        )
        if event:
            events.append(event)

    return events


def _records(state: dict[str, str], key: str) -> dict[tuple[str, str], dict]:
    data = state_records(state, key)
    records: dict[tuple[str, str], dict] = {}
    if not isinstance(data, dict):
        return records
    for asset_id, items in data.items():
        if not isinstance(items, list):
            continue
        for index, record in enumerate(items):
            if not isinstance(record, dict):
                continue
            identity = _text(
                record.get("slip") or record.get("recordedAt") or record.get("id")
            )
            if not identity:
                identity = f"{index}:{record.get('date','')}:{record.get('type','')}"
            records[(str(asset_id), identity)] = record
    return records


def _new_record_changes(record: dict, labels: dict, fields) -> list[dict]:
    return [
        {
            "field": field,
            "label": labels[field],
            "from": "",
            "to": _text(record.get(field)),
        }
        for field in fields
        if _text(record.get(field))
    ]


def _repair_events(
    old_state: dict[str, str], new_state: dict[str, str], assets: dict[str, dict]
) -> list[dict]:
    old_records = _records(old_state, "mets_repairs")
    new_records = _records(new_state, "mets_repairs")
    fields = ("type", "date", "cost", "status", "tech", "coord")
    events: list[dict] = []

    for key in sorted(new_records.keys() - old_records.keys()):
        asset_id, _identity = key
        record = new_records[key]
        asset = assets.get(asset_id, {})
        changes = _new_record_changes(record, REPAIR_FIELD_LABELS, fields)
        details = (
            f"{record.get('type', 'Repair')} on {record.get('date', '—')}"
            f" · Cost: {record.get('cost', '0')}"
            f" · Status: {record.get('status', '—')}"
        )
        events.append(
            _event(
                "repair_requested",
                "Repair request submitted",
                asset_id,
                asset.get("name") or _text(record.get("eqName")) or asset_id,
                details,
                changes,
                "state",
            )
        )

    for key in sorted(old_records.keys() & new_records.keys()):
        asset_id, _identity = key
        before = old_records[key]
        after = new_records[key]
        changes = _changes(before, after, REPAIR_FIELD_LABELS, fields)
        if not changes:
            continue
        fields_changed = {item["field"] for item in changes}
        if fields_changed == {"status"}:
            action, label = "repair_status_updated", "Repair status updated"
        else:
            action, label = "repair_updated", "Repair record updated"
        asset = assets.get(asset_id, {})
        events.append(
            _event(
                action,
                label,
                asset_id,
                asset.get("name") or _text(after.get("eqName")) or asset_id,
                _summary(changes),
                changes,
                "state",
            )
        )

    return events


def _borrow_events(
    old_state: dict[str, str], new_state: dict[str, str], assets: dict[str, dict]
) -> list[dict]:
    old_records = _records(old_state, "mets_borrows")
    new_records = _records(new_state, "mets_borrows")
    fields = (
        "slip",
        "borrower",
        "office",
        "purpose",
        "officer",
        "dateOut",
        "expectedReturn",
        "returnedDate",
        "returnCondition",
        "condition",
        "status",
    )
    events: list[dict] = []

    for key in sorted(new_records.keys() - old_records.keys()):
        asset_id, _identity = key
        record = new_records[key]
        asset = assets.get(asset_id, {})
        changes = _new_record_changes(record, BORROW_FIELD_LABELS, fields)
        details = (
            f"Borrower: {record.get('borrower', '—')}"
            f" · Slip: {record.get('slip', '—')}"
            f" · Date out: {record.get('dateOut', '—')}"
            f" · Expected return: {record.get('expectedReturn', '—')}"
        )
        events.append(
            _event(
                "borrow_issued",
                "Equipment borrowed / slip issued",
                asset_id,
                asset.get("name") or _text(record.get("eqName")) or asset_id,
                details,
                changes,
                "state",
            )
        )

    for key in sorted(old_records.keys() & new_records.keys()):
        asset_id, _identity = key
        before = old_records[key]
        after = new_records[key]
        changes = _changes(before, after, BORROW_FIELD_LABELS, fields)
        if not changes:
            continue
        fields_changed = {item["field"] for item in changes}
        status = _text(after.get("status")).lower()
        returned = bool(_text(after.get("returnedDate"))) and not _text(
            before.get("returnedDate")
        )
        if returned or status.startswith("return"):
            action, label = "borrow_returned", "Equipment returned"
        elif status.startswith("approv"):
            action, label = "borrow_approved", "Borrow request approved"
        elif status.startswith(("reject", "denied", "declin")):
            action, label = "borrow_rejected", "Borrow request rejected"
        elif fields_changed == {"status"}:
            action, label = "borrow_status_updated", "Borrow status updated"
        else:
            action, label = "borrow_updated", "Borrow record updated"
        asset = assets.get(asset_id, {})
        events.append(
            _event(
                action,
                label,
                asset_id,
                asset.get("name") or _text(after.get("eqName")) or asset_id,
                _summary(changes),
                changes,
                "state",
            )
        )

    return events


def _transfer_events(
    old_state: dict[str, str], new_state: dict[str, str], assets: dict[str, dict]
) -> list[dict]:
    old_records = _records(old_state, "mets_transfers")
    new_records = _records(new_state, "mets_transfers")
    fields = (
        "from",
        "to",
        "fromOffice",
        "toOffice",
        "date",
        "reason",
        "officer",
        "remarks",
    )
    events: list[dict] = []

    for key in sorted(new_records.keys() - old_records.keys()):
        asset_id, _identity = key
        record = new_records[key]
        asset = assets.get(asset_id, {})
        changes = _new_record_changes(record, TRANSFER_FIELD_LABELS, fields)
        details = (
            f"{record.get('from', '—')} → {record.get('to', '—')}"
            f" · {record.get('fromOffice', '—')} → {record.get('toOffice', '—')}"
            f" · Date: {record.get('date', '—')}"
        )
        events.append(
            _event(
                "asset_transferred",
                "Asset transferred",
                asset_id,
                asset.get("name") or _text(record.get("eqName")) or asset_id,
                details,
                changes,
                "state",
            )
        )

    for key in sorted(old_records.keys() & new_records.keys()):
        asset_id, _identity = key
        before = old_records[key]
        after = new_records[key]
        changes = _changes(before, after, TRANSFER_FIELD_LABELS, fields)
        if not changes:
            continue
        asset = assets.get(asset_id, {})
        events.append(
            _event(
                "transfer_updated",
                "Transfer record updated",
                asset_id,
                asset.get("name") or _text(after.get("eqName")) or asset_id,
                _summary(changes),
                changes,
                "state",
            )
        )

    return events


def diff_state(old_state: dict[str, str], new_state: dict[str, str]) -> list[dict]:
    """Compare two authoritative state snapshots and return activity events."""
    old_assets = asset_map(old_state)
    new_assets = asset_map(new_state)
    # Do not flood the OIC on the first inventory sync / demo seed.
    if not old_assets and len(new_assets) > 10:
        return [
            _event(
                "inventory_loaded",
                "Initial asset inventory loaded",
                None,
                None,
                f"{len(new_assets)} assets loaded",
                [],
                "state",
            )
        ]
    assets = new_assets
    events: list[dict] = []
    events.extend(_asset_events(old_state, new_state))
    events.extend(_repair_events(old_state, new_state, assets))
    events.extend(_borrow_events(old_state, new_state, assets))
    events.extend(_transfer_events(old_state, new_state, assets))
    return events


def public_notification(row: dict) -> dict:
    try:
        changes = json.loads(row.get("changes_json") or "[]")
    except (TypeError, ValueError):
        changes = []
    if not isinstance(changes, list):
        changes = []
    role = _text(row.get("actor_role"))
    return {
        "id": row.get("id"),
        "actor_id": row.get("actor_user_id"),
        "actor_name": row.get("actor_name") or "Unknown user",
        "actor_role": role,
        "actor_role_label": ROLES.get(role, role or "Unknown role"),
        "action": row.get("action_type"),
        "label": row.get("action_label"),
        "asset_id": row.get("asset_id"),
        "asset_name": row.get("asset_name"),
        "details": row.get("details"),
        "changes": changes,
        "source": row.get("source"),
        "created_at": row.get("created_at"),
        "read": bool(row.get("read_at")),
        "read_at": row.get("read_at"),
    }


def unread_count(con: Database, user_id: int) -> int:
    row = con.execute(
        "SELECT COUNT(*) AS n FROM notifications"
        " WHERE recipient_user_id = %s AND read_at IS NULL",
        (user_id,),
    ).fetchone()
    return int(row["n"] or 0)


def insert_notifications(con: Database, events: list[dict], actor) -> list[dict]:
    """Insert one row per active GSO-OIC, excluding the actor themselves."""
    if not events:
        return []
    actor_id = (actor or {}).get("id")
    actor_name = (
        (actor or {}).get("name") or (actor or {}).get("username") or "Unknown user"
    )
    actor_role = (actor or {}).get("role") or ""
    recipients = con.execute(
        "SELECT id FROM users WHERE role = 'oic' AND active = 1"
    ).fetchall()
    recipient_ids = [row["id"] for row in recipients if row["id"] != actor_id]
    if not recipient_ids:
        return []

    now = iso_now()
    inserted: list[dict] = []
    for event in events:
        changes_json = json.dumps(event.get("changes") or [], ensure_ascii=False)
        for recipient_id in recipient_ids:
            cur = con.execute(
                "INSERT INTO notifications (recipient_user_id, actor_user_id,"
                " actor_name, actor_role, action_type, action_label, asset_id,"
                " asset_name, details, changes_json, source, created_at)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (
                    recipient_id,
                    actor_id,
                    actor_name,
                    actor_role,
                    event.get("action_type") or "activity",
                    event.get("action_label") or "Activity",
                    event.get("asset_id"),
                    event.get("asset_name"),
                    event.get("details"),
                    changes_json,
                    event.get("source") or "state",
                    now,
                ),
            )
            inserted.append(
                {
                    "recipient_id": recipient_id,
                    "item": {
                        "id": cur.lastrowid,
                        "actor_id": actor_id,
                        "actor_name": actor_name,
                        "actor_role": actor_role,
                        "actor_role_label": ROLES.get(actor_role, actor_role),
                        "action": event.get("action_type"),
                        "label": event.get("action_label"),
                        "asset_id": event.get("asset_id"),
                        "asset_name": event.get("asset_name"),
                        "details": event.get("details"),
                        "changes": event.get("changes") or [],
                        "source": event.get("source") or "state",
                        "created_at": now,
                        "read": False,
                        "read_at": None,
                    },
                }
            )

    unread_by_recipient = {
        recipient_id: unread_count(con, recipient_id) for recipient_id in recipient_ids
    }
    for entry in inserted:
        entry["unread"] = unread_by_recipient[entry["recipient_id"]]
    return inserted


def publish_notifications(inserted: list[dict]) -> None:
    for entry in inserted:
        hub.publish(
            entry["recipient_id"],
            {
                "type": "notification",
                "item": entry["item"],
                "unread": entry.get("unread", 0),
            },
        )


def list_notifications(
    con: Database, user_id: int, limit: int = 100, unread_only: bool = False
) -> dict:
    sql = "SELECT * FROM notifications WHERE recipient_user_id = %s"
    params: list = [user_id]
    if unread_only:
        sql += " AND read_at IS NULL"
    sql += " ORDER BY id DESC LIMIT %s"
    params.append(limit)
    rows = con.execute(sql, params).fetchall()
    return {
        "items": [public_notification(row) for row in rows],
        "unread": unread_count(con, user_id),
    }


def mark_read(con: Database, user_id: int, notification_id: int) -> int:
    con.execute(
        "UPDATE notifications SET read_at = %s, read_by = %s"
        " WHERE id = %s AND recipient_user_id = %s AND read_at IS NULL",
        (iso_now(), user_id, notification_id, user_id),
    )
    return unread_count(con, user_id)


def mark_all_read(con: Database, user_id: int) -> int:
    con.execute(
        "UPDATE notifications SET read_at = %s, read_by = %s"
        " WHERE recipient_user_id = %s AND read_at IS NULL",
        (iso_now(), user_id, user_id),
    )
    return unread_count(con, user_id)

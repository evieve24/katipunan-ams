"""Helpers for the JSON application-state snapshot stored in app_state."""

from __future__ import annotations

import json


def state_json(state: dict[str, str], key: str, default):
    raw = state.get(key)
    if not raw:
        return default
    try:
        return json.loads(raw)
    except (ValueError, TypeError):
        return default


def flatten_assets(state: dict[str, str]) -> list[dict]:
    staff = state_json(state, "mets_staffdata", {})
    if not isinstance(staff, dict):
        return []
    items: list[dict] = []
    for dept, people in staff.items():
        if not isinstance(people, list):
            continue
        for person in people:
            if not isinstance(person, dict):
                continue
            for eq in person.get("equipment") or []:
                if not isinstance(eq, dict):
                    continue
                amount = eq.get("amount")
                try:
                    amount_value = (
                        float(str(amount).replace(",", "").replace("₱", "").strip())
                        if amount not in (None, "")
                        else 0.0
                    )
                except ValueError:
                    amount_value = 0.0
                items.append(
                    {
                        "id": eq.get("id", ""),
                        "name": eq.get("name", ""),
                        "brand": eq.get("brand", ""),
                        "serial": eq.get("serial", ""),
                        "status": eq.get("status", ""),
                        "amount": amount_value,
                        "category": (
                            "PPE" if amount_value >= 50000 else "Semi-Expendable"
                        ),
                        "acquiredDate": eq.get("acquiredDate")
                        or eq.get("acquired")
                        or "",
                        "location": eq.get("location", ""),
                        "lastScanDate": eq.get("lastScanDate", ""),
                        "lastScannedLocation": eq.get("lastScannedLocation", ""),
                        "dept": dept,
                        "staffId": person.get("id", ""),
                        "owner": person.get("name", ""),
                        "position": person.get("pos", ""),
                    }
                )
    return items


def find_asset(state: dict[str, str], asset_id: str) -> dict | None:
    for item in flatten_assets(state):
        if item["id"] == asset_id:
            return item
    return None


def state_records(state: dict[str, str], key: str) -> dict:
    value = state_json(state, key, {})
    return value if isinstance(value, dict) else {}

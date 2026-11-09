"""Time and JSON helpers shared by the backend modules."""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from decimal import Decimal


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def iso_now() -> str:
    return utcnow().replace(microsecond=0).isoformat().replace("+00:00", "Z")


def iso_plus(hours: int) -> str:
    return (
        (utcnow() + timedelta(hours=hours))
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z")
    )


def _json_default(value):
    if isinstance(value, Decimal):
        return float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def json_bytes(value) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, separators=(",", ":"), default=_json_default
    ).encode("utf-8")

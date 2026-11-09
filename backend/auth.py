"""Authentication, login throttling, audit, and user serialization."""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import threading
import time
from typing import TYPE_CHECKING

from config import OFFICE_LABELS, ROLES
from utils import iso_now

if TYPE_CHECKING:
    from db import Database


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 260_000
    )
    return salt, base64.b64encode(digest).decode("ascii")


def verify_password(password: str, salt: str, expected: str) -> bool:
    _, actual = hash_password(password, salt)
    return hmac.compare_digest(actual, expected)


_LOGIN_ATTEMPTS: dict[str, tuple[int, float]] = {}

_LOGIN_LOCK = threading.Lock()


def login_blocked(key: str) -> bool:
    with _LOGIN_LOCK:
        entry = _LOGIN_ATTEMPTS.get(key)
        if not entry:
            return False
        _, until = entry
        if until and until <= time.time():
            _LOGIN_ATTEMPTS.pop(key, None)
            return False
        return until > time.time()


def note_login_failure(key: str) -> None:
    with _LOGIN_LOCK:
        count, _ = _LOGIN_ATTEMPTS.get(key, (0, 0.0))
        count += 1
        until = time.time() + 60 if count >= 5 else 0.0
        _LOGIN_ATTEMPTS[key] = (count, until)


def clear_login_failures(key: str) -> None:
    with _LOGIN_LOCK:
        _LOGIN_ATTEMPTS.pop(key, None)


def public_user(row) -> dict:
    data = dict(row)
    role = data.get("role") or ""
    office = data.get("office")
    return {
        "id": data.get("id"),
        "username": data.get("username"),
        "name": data.get("name"),
        "role": role,
        "role_label": ROLES.get(role, role),
        "office": office,
        "office_label": OFFICE_LABELS.get(office, office or ""),
        "active": bool(data.get("active", 1)),
        "created_at": data.get("created_at"),
    }


def audit(con: Database, user, action: str, detail: str = "", ip: str = "") -> None:
    con.execute(
        "INSERT INTO audit (at, user_id, username, action, detail, ip) VALUES (%s,%s,%s,%s,%s,%s)",
        (
            iso_now(),
            (user["id"] if user else None),
            (user["username"] if user else "anonymous"),
            action,
            detail[:2000],
            ip,
        ),
    )

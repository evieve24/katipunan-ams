"""HTTP request handler, REST API, and static file serving."""

from __future__ import annotations

import json
import mimetypes
import os
import queue
import re
import secrets
import sys
import traceback
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlsplit

from auth import (
    audit,
    clear_login_failures,
    hash_password,
    login_blocked,
    note_login_failure,
    public_user,
    verify_password,
)
from config import (
    ERD_STATE_KEYS,
    GOOGLE_CLIENT_ID,
    MAX_BODY,
    OFFICE_LABELS,
    ROLES,
    SENSITIVE_KEYS,
    SESSION_HOURS,
    STATIC_DIR,
    TEMPLATES_DIR,
)
from db import connect, get_state
from erd import clear_erd, sync_erd
from notifications import (
    NOTIFY_STATE_KEYS,
    asset_snapshot,
    diff_asset_snapshot,
    diff_state,
    hub,
    insert_notifications,
    list_notifications,
    mark_all_read,
    mark_read,
    publish_notifications,
    unread_count,
)
from state import find_asset, state_json
from utils import iso_now, iso_plus, json_bytes


class Handler(BaseHTTPRequestHandler):
    server_version = "KatipunanAMS/1.1"
    protocol_version = "HTTP/1.1"

    _body: bytes | None = None
    _body_error: tuple[int, str] | None = None

    # ----- low level -------------------------------------------------------

    def handle_one_request(self) -> None:
        # Browsers routinely drop keep-alive sockets; that is not an error.
        try:
            super().handle_one_request()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            self.close_connection = True

    def log_message(self, fmt: str, *args) -> None:
        text = fmt % args
        # Never print bearer tokens from /api/sync or the SSE query string.
        text = re.sub(r"(token=)[^&\s\"]+", r"\1***", text)
        sys.stderr.write(f"  {self.address_string()}  {text}\n")

    def _send(
        self,
        status: int,
        body: bytes = b"",
        content_type: str = "application/json; charset=utf-8",
        extra: dict | None = None,
    ) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        if self.close_connection:
            self.send_header("Connection", "close")
        if extra:
            for key, value in extra.items():
                self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD" and body:
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass

    def _json(self, status: int, payload, extra: dict | None = None) -> None:
        headers = {"Cache-Control": "no-store"}
        if extra:
            headers.update(extra)
        self._send(
            status, json_bytes(payload), "application/json; charset=utf-8", headers
        )

    def _error(self, status: int, message: str) -> None:
        self._json(status, {"ok": False, "error": message})

    def _read_body(self):
        """Read (and cache) the request body.

        The body is always consumed before routing so that keep-alive
        connections stay in sync even when authentication fails early.
        """
        if self._body is not None:
            return self._body
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            self._body_error = (400, "Invalid Content-Length")
            self.close_connection = True
            return None
        if length < 0:
            self._body_error = (400, "Invalid Content-Length")
            self.close_connection = True
            return None
        if length > MAX_BODY:
            self._body_error = (413, "Request body is too large")
            self.close_connection = True
            return None
        self._body = self.rfile.read(length) if length else b""
        return self._body

    def _read_json(self):
        raw = self._read_body()
        if self._body_error:
            self._error(*self._body_error)
            return None
        if not raw:
            self._error(400, "Request body is required")
            return None
        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, ValueError):
            self._error(400, "Request body must be valid JSON")
            return None

    def _client_ip(self) -> str:
        forwarded = self.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return self.client_address[0] if self.client_address else ""

    # ----- authentication -------------------------------------------------

    def _current_user(self):
        header = self.headers.get("Authorization", "")
        token = ""
        if header.lower().startswith("bearer "):
            token = header[7:].strip()
        if not token:
            token = (parse_qs(urlsplit(self.path).query).get("token") or [""])[0]
        if not token:
            return None
        con = connect()
        try:
            row = con.execute(
                "SELECT s.token, s.expires_at, u.* FROM sessions s JOIN users u ON u.id = s.user_id"
                " WHERE s.token = %s AND u.active = 1",
                (token,),
            ).fetchone()
            if not row:
                return None
            if row["expires_at"] <= iso_now():
                con.execute("DELETE FROM sessions WHERE token = %s", (token,))
                con.commit()
                return None
            result = dict(row)
            result["token"] = token
            return result
        finally:
            con.close()

    def _require_auth(self):
        user = self._current_user()
        if user is None:
            self._error(401, "Authentication required or session expired")
        return user

    def _require_admin(self, user) -> bool:
        if (user or {}).get("role") != "oic":
            self._error(403, "Administrator (GSO-OIC) access required")
            return False
        return True

    # ----- verbs ----------------------------------------------------------

    def do_OPTIONS(self) -> None:
        origin = self.headers.get("Origin") or "*"
        self._send(
            204,
            b"",
            "text/plain",
            {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Max-Age": "600",
            },
        )

    def do_HEAD(self) -> None:
        self.do_GET()

    def do_GET(self) -> None:
        self._dispatch("GET")

    def do_POST(self) -> None:
        self._dispatch("POST")

    def do_PUT(self) -> None:
        self._dispatch("PUT")

    def do_PATCH(self) -> None:
        self._dispatch("PATCH")

    def do_DELETE(self) -> None:
        self._dispatch("DELETE")

    def _dispatch(self, method: str) -> None:
        parsed = urlsplit(self.path)
        path = parsed.path
        self._body = None
        self._body_error = None
        try:
            if path.startswith("/api/"):
                if method in ("POST", "PUT", "PATCH", "DELETE"):
                    # Drain the body before routing: an early 401/403 must not
                    # leave unread bytes that corrupt the next keep-alive request.
                    self._read_body()
                self._handle_api(
                    method, path.rstrip("/") or "/", parse_qs(parsed.query)
                )
            else:
                self._serve_static(path)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except Exception as exc:  # pragma: no cover - defensive
            traceback.print_exc()
            try:
                self._error(500, f"Internal server error: {exc}")
            except Exception:
                pass

    # ----- API router -----------------------------------------------------

    def _handle_api(self, method: str, path: str, query: dict) -> None:
        if path == "/api/health":
            self._json(200, {"ok": True, "service": "Katipunan AMS", "time": iso_now()})
            return

        if path == "/api/auth/login":
            if method != "POST":
                self._error(405, "Use POST")
                return
            self._api_login()
            return

        if path == "/api/auth/register":
            if method != "POST":
                self._error(405, "Use POST")
                return
            self._api_register()
            return

        user = self._require_auth()
        if user is None:
            return

        if path == "/api/auth/me" and method == "GET":
            self._json(
                200, {"ok": True, "user": public_user(user), "serverTime": iso_now()}
            )
        elif path == "/api/config" and method == "GET":
            self._api_config_get(user)
        elif path == "/api/config" and method == "POST":
            self._api_config_set(user)
        elif path == "/api/auth/logout" and method == "POST":
            self._api_logout(user)
        elif path == "/api/auth/password" and method == "POST":
            self._api_change_password(user)
        elif path == "/api/state" and method == "GET":
            self._api_state_get(user)
        elif path == "/api/state" and method in ("PUT", "POST"):
            self._api_state_put(user)
        elif path == "/api/state/reset" and method == "POST":
            self._api_state_reset(user)
        elif path == "/api/assets" and method == "GET":
            self._api_assets(user, query)
        elif path == "/api/scans" and method == "POST":
            self._api_scan_create(user)
        elif path == "/api/scans" and method == "GET":
            self._api_scan_list(user, query)
        elif path.startswith("/api/assets/") and method == "GET":
            self._api_asset_detail(user, unquote(path[len("/api/assets/") :]))
        elif path.startswith("/api/assets/") and method == "PATCH":
            self._api_asset_patch(user, unquote(path[len("/api/assets/") :]))
        elif path == "/api/stats" and method == "GET":
            self._api_stats(user)
        elif path == "/api/storage" and method == "GET":
            self._api_storage(user)
        elif path == "/api/notifications" and method == "GET":
            self._api_notifications_list(user, query)
        elif path == "/api/notifications/stream" and method == "GET":
            self._api_notifications_stream(user)
        elif path == "/api/notifications/read-all" and method == "POST":
            self._api_notifications_read_all(user)
        elif (
            path.startswith("/api/notifications/")
            and path.endswith("/read")
            and method == "POST"
        ):
            self._api_notification_read(user, path)
        elif path == "/api/activity" and method == "GET":
            self._api_activity(user, query)
        elif path == "/api/sync" and method == "POST":
            self._api_sync(user)
        elif path == "/api/users" and method == "GET":
            self._api_users_list(user)
        elif path == "/api/users" and method == "POST":
            self._api_users_create(user)
        elif path.startswith("/api/users/") and method in ("PATCH", "PUT"):
            self._api_users_update(user, path[len("/api/users/") :])
        elif path.startswith("/api/users/") and method == "DELETE":
            self._api_users_delete(user, path[len("/api/users/") :])
        elif path == "/api/audit" and method == "GET":
            self._api_audit(user, query)
        elif path == "/api/reports/summary" and method == "GET":
            self._api_report_summary(user)
        elif path == "/api/reports" and method == "POST":
            self._api_report_record(user)
        elif path == "/api/backups" and method == "POST":
            self._api_backup_record(user)
        elif path == "/api/export" and method == "GET":
            self._api_export(user)
        elif path == "/api/import" and method == "POST":
            self._api_import(user)
        else:
            self._error(404, f"No API route for {method} {path}")

    # ----- auth endpoints -------------------------------------------------

    def _api_login(self) -> None:
        body = self._read_json()
        if body is None:
            return
        username = str(body.get("username") or "").strip()
        password = str(body.get("password") or "")
        if not username or not password:
            self._error(400, "Username and password are required")
            return

        attempt_key = f"{self._client_ip()}|{username.lower()}"
        if login_blocked(attempt_key):
            self._error(429, "Too many failed attempts. Try again in a minute.")
            return

        con = connect()
        try:
            row = con.execute(
                "SELECT * FROM users WHERE username = %s", (username,)
            ).fetchone()
            valid_password = bool(
                row
                and verify_password(
                    password, row["password_salt"], row["password_hash"]
                )
            )
            if not valid_password:
                note_login_failure(attempt_key)
                audit(
                    con, None, "login_failed", f"username={username}", self._client_ip()
                )
                con.commit()
                self._error(401, "Incorrect username or password")
                return
            if not row["active"]:
                clear_login_failures(attempt_key)
                audit(
                    con,
                    row,
                    "login_pending",
                    f"username={username}",
                    self._client_ip(),
                )
                con.commit()
                self._error(403, "Your account is waiting for GSO-OIC approval")
                return

            clear_login_failures(attempt_key)
            con.execute("DELETE FROM sessions WHERE expires_at <= %s", (iso_now(),))
            token = secrets.token_urlsafe(32)
            expires = iso_plus(SESSION_HOURS)
            con.execute(
                "INSERT INTO sessions (token, user_id, created_at, expires_at, ip, user_agent) VALUES (%s,%s,%s,%s,%s,%s)",
                (
                    token,
                    row["id"],
                    iso_now(),
                    expires,
                    self._client_ip(),
                    (self.headers.get("User-Agent") or "")[:400],
                ),
            )
            audit(con, row, "login", f"role={row['role']}", self._client_ip())
            con.commit()
            self._json(
                200,
                {
                    "ok": True,
                    "token": token,
                    "expiresAt": expires,
                    "user": public_user(row),
                },
            )
        finally:
            con.close()

    def _api_register(self) -> None:
        """Public self-registration for non-OIC roles, pending OIC approval."""
        body = self._read_json()
        if body is None:
            return
        username = str(body.get("username") or "").strip()
        name = str(body.get("name") or "").strip()
        role = str(body.get("role") or "").strip()
        office = str(body.get("office") or "").strip() or None
        password = str(body.get("password") or "")

        if role not in ("inspector", "gsostaff", "officehead"):
            self._error(
                400,
                "Self-registration is only available for Inspectorate, GSO Office,"
                " and Municipal Office Head accounts",
            )
            return
        if not re.fullmatch(r"[A-Za-z0-9._-]{3,32}", username):
            self._error(
                400, "Username must be 3-32 characters using letters, numbers, . _ or -"
            )
            return
        if not name or len(name) > 190:
            self._error(400, "Full name is required (maximum 190 characters)")
            return
        if len(password) < 8:
            self._error(400, "Password must be at least 8 characters")
            return
        if role == "officehead":
            if office not in OFFICE_LABELS:
                self._error(
                    400, "Select a valid office for the Municipal Office Head account"
                )
                return
        else:
            office = "gso"

        con = connect()
        try:
            exists = con.execute(
                "SELECT 1 FROM users WHERE username = %s", (username,)
            ).fetchone()
            if exists:
                self._error(409, "That username is already taken")
                return
            salt, digest = hash_password(password)
            con.execute(
                "INSERT INTO users (username, password_salt, password_hash, name,"
                " role, office, active, created_at) VALUES (%s,%s,%s,%s,%s,%s,0,%s)",
                (
                    username,
                    salt,
                    digest,
                    name,
                    role,
                    office,
                    iso_now(),
                ),
            )
            office_label = OFFICE_LABELS.get(office or "", "")
            details = (
                f"{name} (@{username}) requested {ROLES[role]} access"
                + (f" for {office_label}" if role == "officehead" else "")
                + " — waiting for GSO-OIC approval"
            )
            changes = [
                {"field": "username", "label": "Username", "from": "", "to": username},
                {"field": "role", "label": "Role", "from": "", "to": ROLES[role]},
            ]
            if role == "officehead":
                changes.append(
                    {
                        "field": "office",
                        "label": "Office",
                        "from": "",
                        "to": office_label,
                    }
                )
            notify_entries = insert_notifications(
                con,
                [
                    {
                        "action_type": "account_registration",
                        "action_label": "New account sign-up",
                        "asset_id": None,
                        "asset_name": None,
                        "details": details,
                        "changes": changes,
                        "source": "auth",
                    }
                ],
                {"id": None, "name": f"{name} (@{username})", "role": role},
            )
            audit(
                con,
                None,
                "user_registered",
                f"{username} ({role}); pending approval",
                self._client_ip(),
            )
            con.commit()
            publish_notifications(notify_entries)
            self._json(
                201,
                {
                    "ok": True,
                    "pending": True,
                    "message": "Account request submitted."
                    " The GSO-OIC must approve it before you can sign in.",
                },
            )
        finally:
            con.close()

    def _api_logout(self, user) -> None:
        con = connect()
        try:
            con.execute("DELETE FROM sessions WHERE token = %s", (user["token"],))
            audit(con, user, "logout", "", self._client_ip())
            con.commit()
            self._json(200, {"ok": True})
        finally:
            con.close()

    def _api_change_password(self, user) -> None:
        body = self._read_json()
        if body is None:
            return
        current = str(body.get("currentPassword") or "")
        new = str(body.get("newPassword") or "")
        if len(new) < 8:
            self._error(400, "New password must be at least 8 characters")
            return
        con = connect()
        try:
            row = con.execute(
                "SELECT * FROM users WHERE id = %s", (user["id"],)
            ).fetchone()
            if not row or not verify_password(
                current, row["password_salt"], row["password_hash"]
            ):
                self._error(403, "Current password is incorrect")
                return
            salt, digest = hash_password(new)
            con.execute(
                "UPDATE users SET password_salt = %s, password_hash = %s WHERE id = %s",
                (salt, digest, user["id"]),
            )
            con.execute(
                "DELETE FROM sessions WHERE user_id = %s AND token <> %s",
                (user["id"], user["token"]),
            )
            audit(con, user, "password_changed", "", self._client_ip())
            con.commit()
            self._json(200, {"ok": True})
        finally:
            con.close()

    # ----- configuration ---------------------------------------------------

    def _api_config_get(self, user) -> None:
        con = connect()
        try:
            row = con.execute(
                "SELECT `value` FROM app_state WHERE `key` = 'google_client_id'"
            ).fetchone()
        finally:
            con.close()
        client_id = (row["value"] if row else "") or GOOGLE_CLIENT_ID
        self._json(200, {"ok": True, "googleClientId": client_id})

    def _api_config_set(self, user) -> None:
        if not self._require_admin(user):
            return
        body = self._read_json()
        if body is None:
            return
        client_id = str(body.get("googleClientId") or "").strip()
        if client_id and not re.fullmatch(
            r"[A-Za-z0-9._-]+\.apps\.googleusercontent\.com", client_id
        ):
            self._error(
                400,
                "Google client ID must end with .apps.googleusercontent.com",
            )
            return
        now = iso_now()
        con = connect()
        try:
            if client_id:
                con.execute(
                    "INSERT INTO app_state (`key`, `value`, updated_at, updated_by)"
                    " VALUES (%s,%s,%s,%s)"
                    " ON DUPLICATE KEY UPDATE `value`=VALUES(`value`),"
                    " updated_at=VALUES(updated_at), updated_by=VALUES(updated_by)",
                    ("google_client_id", client_id, now, user["id"]),
                )
            else:
                con.execute("DELETE FROM app_state WHERE `key` = 'google_client_id'")
            audit(
                con,
                user,
                "google_config_updated",
                "configured" if client_id else "cleared",
                self._client_ip(),
            )
            con.commit()
            self._json(200, {"ok": True, "googleClientId": client_id})
        finally:
            con.close()

    # ----- state endpoints ------------------------------------------------

    def _api_state_get(self, user) -> None:
        con = connect()
        try:
            rows = con.execute(
                "SELECT `key`, `value`, updated_at FROM app_state ORDER BY `key`"
            ).fetchall()
            state = {row["key"]: row["value"] for row in rows}
            updated = max((row["updated_at"] for row in rows), default=None)
            self._json(
                200,
                {
                    "ok": True,
                    "state": state,
                    "updated_at": updated,
                    "user": public_user(user),
                    "serverTime": iso_now(),
                },
            )
        finally:
            con.close()

    def _api_state_put(self, user) -> None:
        body = self._read_json()
        if body is None:
            return
        updates = body.get("updates")
        if not isinstance(updates, dict) or not updates:
            self._error(400, "Body must contain a non-empty 'updates' object")
            return

        cleaned: dict[str, str | None] = {}
        total = 0
        for key, value in updates.items():
            if (
                not isinstance(key, str)
                or not key.startswith("mets_")
                or len(key) > 120
            ):
                self._error(400, f"Invalid state key: {key!r}")
                return
            if key in SENSITIVE_KEYS:
                self._error(400, f"Key is device-local and cannot be synced: {key}")
                return
            if value is not None and not isinstance(value, str):
                self._error(400, f"Value for {key} must be a string or null")
                return
            total += len(value or "")
            if total > MAX_BODY:
                self._error(413, "State payload is too large")
                return
            cleaned[key] = value

        now = iso_now()
        con = connect()
        try:
            old_state = get_state(con)
            for key, value in cleaned.items():
                if value is None:
                    con.execute("DELETE FROM app_state WHERE `key` = %s", (key,))
                else:
                    con.execute(
                        "INSERT INTO app_state (`key`, `value`, updated_at, updated_by) VALUES (%s,%s,%s,%s)"
                        " ON DUPLICATE KEY UPDATE `value`=VALUES(`value`),"
                        " updated_at=VALUES(updated_at), updated_by=VALUES(updated_by)",
                        (key, value, now, user["id"]),
                    )
            new_state = get_state(con)
            notify_entries: list = []
            if NOTIFY_STATE_KEYS.intersection(cleaned):
                events = diff_state(old_state, new_state)
                notify_entries = insert_notifications(con, events, user)
            # Refresh the normalized ERD tables in the same transaction.
            if ERD_STATE_KEYS.intersection(cleaned):
                sync_erd(con, new_state, user["id"])
            audit(
                con,
                user,
                "state_saved",
                f"keys={','.join(sorted(cleaned))}; bytes={total}",
                self._client_ip(),
            )
            con.commit()
            publish_notifications(notify_entries)
            self._json(
                200,
                {
                    "ok": True,
                    "saved": len(cleaned),
                    "updated_at": now,
                    "serverTime": now,
                },
            )
        finally:
            con.close()

    def _api_state_reset(self, user) -> None:
        if not self._require_admin(user):
            return
        body = self._read_json() or {}
        if str(body.get("confirm") or "") != "RESET":
            self._error(400, 'Send {"confirm":"RESET"} to clear all server state')
            return
        con = connect()
        try:
            con.execute("DELETE FROM app_state")
            clear_erd(con)
            audit(
                con,
                user,
                "state_reset",
                "all application state deleted",
                self._client_ip(),
            )
            con.commit()
            self._json(200, {"ok": True, "reset": True})
        finally:
            con.close()

    # ----- asset endpoints ------------------------------------------------

    @staticmethod
    def _asset_item(row) -> dict:
        return {
            "id": row["asset_id"],
            "name": row["asset_name"],
            "brand": row["brand"] or "",
            "serial": row["serial_no"] or "",
            "status": row["condition"] or "",
            "amount": float(row["acquisition_cost"] or 0),
            "category": row["category"] or "",
            "acquiredDate": row["acquisition_date"] or "",
            "location": row["location"] or "",
            "lastScanDate": row["last_scan_date"] or "",
            "lastScannedLocation": row["last_scan_location"] or "",
            "dept": row["office"] or "",
            "staffId": row["staff_id"] or "",
            "owner": row["owner_name"] or "",
            "position": row["owner_position"] or "",
        }

    def _api_assets(self, user, query) -> None:
        con = connect()
        try:
            rows = con.execute(
                "SELECT asset_id, asset_name, brand, serial_no, `condition`, acquisition_cost,"
                " category, acquisition_date, location, last_scan_date, last_scan_location,"
                " office, staff_id, owner_name, owner_position"
                " FROM assets WHERE is_trashed = 0 ORDER BY asset_id"
            ).fetchall()
        finally:
            con.close()
        items = [self._asset_item(row) for row in rows]
        q = (query.get("q") or [""])[0].strip().lower()
        status = (query.get("status") or [""])[0].strip().lower()
        dept = (query.get("dept") or [""])[0].strip()
        if q:
            items = [
                item
                for item in items
                if q
                in " ".join(
                    str(item.get(k, ""))
                    for k in (
                        "id",
                        "name",
                        "brand",
                        "serial",
                        "owner",
                        "dept",
                        "location",
                    )
                ).lower()
            ]
        if status:
            items = [item for item in items if str(item["status"]).lower() == status]
        if dept:
            items = [item for item in items if item["dept"] == dept]
        try:
            limit = max(1, min(int((query.get("limit") or ["100"])[0]), 1000))
        except ValueError:
            limit = 100
        try:
            offset = max(0, int((query.get("offset") or ["0"])[0]))
        except ValueError:
            offset = 0
        self._json(
            200,
            {
                "ok": True,
                "total": len(items),
                "limit": limit,
                "offset": offset,
                "items": items[offset : offset + limit],
            },
        )

    def _api_asset_detail(self, user, asset_id: str) -> None:
        con = connect()
        try:
            row = con.execute(
                "SELECT asset_id, asset_name, brand, serial_no, `condition`, acquisition_cost,"
                " category, acquisition_date, location, last_scan_date, last_scan_location,"
                " office, staff_id, owner_name, owner_position"
                " FROM assets WHERE asset_id = %s AND is_trashed = 0",
                (asset_id,),
            ).fetchone()
            if not row:
                self._error(404, f"Asset not found: {asset_id}")
                return
            repairs = con.execute(
                "SELECT maintenance_type AS type, maintenance_date AS date, cost, status,"
                " technician AS tech, description, recorded_at"
                " FROM maintenance_asset_report WHERE asset_id = %s ORDER BY maintenance_id",
                (asset_id,),
            ).fetchall()
            transfers = con.execute(
                "SELECT from_office AS fromOffice, to_office AS toOffice, transfer_date AS date,"
                " remarks, sync_status AS syncStatus"
                " FROM asset_transfer WHERE asset_id = %s ORDER BY transfer_id",
                (asset_id,),
            ).fetchall()
            borrows = con.execute(
                "SELECT borrower_name AS borrower, borrow_date AS borrowDate,"
                " return_date AS returnDate, status, recorded_at"
                " FROM borrow WHERE asset_id = %s ORDER BY borrow_id",
                (asset_id,),
            ).fetchall()
        finally:
            con.close()
        item = self._asset_item(row)
        item["repairs"] = [dict(record) for record in repairs]
        item["transfers"] = [dict(record) for record in transfers]
        item["borrows"] = [dict(record) for record in borrows]
        self._json(200, {"ok": True, "asset": item})

    def _api_asset_patch(self, user, asset_id: str) -> None:
        body = self._read_json()
        if body is None:
            return
        allowed = {"status", "location", "amount", "acquiredDate", "remarks"}
        changes = {k: body[k] for k in allowed if k in body}
        if not changes:
            self._error(
                400,
                "No supported fields supplied (status, location, amount, acquiredDate, remarks)",
            )
            return
        con = connect()
        try:
            state = get_state(con)
            staff = state_json(state, "mets_staffdata", {})
            found = None
            found_person = None
            found_dept = ""
            for dept, people in (staff.items() if isinstance(staff, dict) else []):
                if not isinstance(people, list):
                    continue
                for person in people:
                    for eq in (
                        (person.get("equipment") or [])
                        if isinstance(person, dict)
                        else []
                    ):
                        if isinstance(eq, dict) and eq.get("id") == asset_id:
                            found = eq
                            found_person = person
                            found_dept = dept
                            break
                    if found:
                        break
                if found:
                    break
            if found is None:
                self._error(404, f"Asset not found: {asset_id}")
                return
            before_snapshot = asset_snapshot(found, found_person, found_dept)
            found.update(changes)
            after_snapshot = asset_snapshot(found, found_person, found_dept)
            event = diff_asset_snapshot(
                before_snapshot, after_snapshot, asset_id, "asset_patch"
            )
            notify_entries = insert_notifications(con, [event], user) if event else []
            now = iso_now()
            con.execute(
                "INSERT INTO app_state (`key`, `value`, updated_at, updated_by) VALUES (%s,%s,%s,%s)"
                " ON DUPLICATE KEY UPDATE `value`=VALUES(`value`),"
                " updated_at=VALUES(updated_at), updated_by=VALUES(updated_by)",
                (
                    "mets_staffdata",
                    json.dumps(staff, ensure_ascii=False),
                    now,
                    user["id"],
                ),
            )
            sync_erd(con, get_state(con), user["id"])
            audit(
                con,
                user,
                "asset_patched",
                f"{asset_id}: {','.join(sorted(changes))}",
                self._client_ip(),
            )
            con.commit()
            publish_notifications(notify_entries)
            item = find_asset(get_state(con), asset_id)
            self._json(200, {"ok": True, "asset": item, "updated_at": now})
        finally:
            con.close()

    def _api_stats(self, user) -> None:
        con = connect()
        try:
            assets = con.execute(
                "SELECT COUNT(*) AS total,"
                " COALESCE(SUM(CASE WHEN `condition` = 'Serviceable' THEN 1 ELSE 0 END), 0) AS serviceable,"
                " COALESCE(SUM(CASE WHEN `condition` = 'Damaged' THEN 1 ELSE 0 END), 0) AS damaged,"
                " COALESCE(SUM(CASE WHEN `condition` = 'Unserviceable' THEN 1 ELSE 0 END), 0) AS unserviceable,"
                " COALESCE(SUM(CASE WHEN `condition` = 'Lost' THEN 1 ELSE 0 END), 0) AS lost,"
                " COALESCE(SUM(CASE WHEN `condition` = 'Missing' THEN 1 ELSE 0 END), 0) AS missing"
                " FROM assets WHERE is_trashed = 0"
            ).fetchone()
            maintenance = con.execute(
                "SELECT COUNT(*) AS n, COALESCE(SUM(cost), 0) AS total FROM maintenance_asset_report"
            ).fetchone()
            transfers = con.execute(
                "SELECT COUNT(*) AS n FROM asset_transfer"
            ).fetchone()["n"]
            borrows = con.execute(
                "SELECT COUNT(*) AS n,"
                " COALESCE(SUM(CASE WHEN return_date IS NULL OR return_date = '' THEN 1 ELSE 0 END), 0) AS open_n"
                " FROM borrow"
            ).fetchone()
            state = get_state(con)
        finally:
            con.close()
        staff = state_json(state, "mets_staffdata", {})
        people = 0
        for group in staff.values() if isinstance(staff, dict) else []:
            if isinstance(group, list):
                people += len(group)

        self._json(
            200,
            {
                "ok": True,
                "stats": {
                    "assets": int(assets["total"] or 0),
                    "serviceable": int(assets["serviceable"] or 0),
                    "damaged": int(assets["damaged"] or 0),
                    "unserviceable": int(assets["unserviceable"] or 0),
                    "lost": int(assets["lost"] or 0),
                    "missing": int(assets["missing"] or 0),
                    "needsAttention": int(
                        (assets["damaged"] or 0)
                        + (assets["unserviceable"] or 0)
                        + (assets["lost"] or 0)
                        + (assets["missing"] or 0)
                    ),
                    "personnel": people,
                    "departments": len(staff) if isinstance(staff, dict) else 0,
                    "repairRecords": int(maintenance["n"] or 0),
                    "repairCost": round(float(maintenance["total"] or 0), 2),
                    "transferRecords": int(transfers or 0),
                    "borrowRecords": int(borrows["n"] or 0),
                    "openBorrows": int(borrows["open_n"] or 0),
                },
                "serverTime": iso_now(),
            },
        )

    def _api_storage(self, user) -> None:
        con = connect()
        try:
            state_row = con.execute(
                "SELECT COALESCE(SUM(LENGTH(`value`)), 0) AS bytes, COUNT(*) AS state_keys"
                " FROM app_state"
            ).fetchone()
            db_row = con.execute(
                "SELECT COALESCE(SUM(data_length + index_length), 0) AS bytes"
                " FROM information_schema.tables WHERE table_schema = DATABASE()"
            ).fetchone()
            backup_row = con.execute(
                "SELECT COUNT(*) AS n, MAX(backup_date) AS last_backup FROM backup"
            ).fetchone()
        finally:
            con.close()
        self._json(
            200,
            {
                "ok": True,
                "appStateBytes": int(state_row["bytes"] or 0),
                "appStateKeys": int(state_row["state_keys"] or 0),
                "databaseBytes": int(db_row["bytes"] or 0),
                "backupCount": int(backup_row["n"] or 0),
                "lastBackup": backup_row["last_backup"],
                "serverTime": iso_now(),
            },
        )

    # ----- notifications ---------------------------------------------------

    def _api_notifications_list(self, user, query) -> None:
        if not self._require_admin(user):
            return
        try:
            limit = max(1, min(int((query.get("limit") or ["100"])[0]), 200))
        except ValueError:
            limit = 100
        unread_only = str((query.get("unread") or ["0"])[0]).lower() in (
            "1",
            "true",
            "yes",
        )
        con = connect()
        try:
            data = list_notifications(con, user["id"], limit, unread_only)
        finally:
            con.close()
        self._json(
            200,
            {
                "ok": True,
                "items": data["items"],
                "unread": data["unread"],
                "serverTime": iso_now(),
            },
        )

    def _api_notification_read(self, user, path: str) -> None:
        if not self._require_admin(user):
            return
        parts = path.split("/")
        try:
            notification_id = int(parts[3])
        except (IndexError, ValueError):
            self._error(400, "Invalid notification id")
            return
        con = connect()
        try:
            unread = mark_read(con, user["id"], notification_id)
            con.commit()
        finally:
            con.close()
        hub.publish(
            user["id"],
            {"type": "read", "ids": [notification_id], "unread": unread},
        )
        self._json(200, {"ok": True, "unread": unread})

    def _api_notifications_read_all(self, user) -> None:
        if not self._require_admin(user):
            return
        con = connect()
        try:
            unread = mark_all_read(con, user["id"])
            con.commit()
        finally:
            con.close()
        hub.publish(user["id"], {"type": "read", "all": True, "unread": unread})
        self._json(200, {"ok": True, "unread": unread})

    def _api_notifications_stream(self, user) -> None:
        if not self._require_admin(user):
            return
        con = connect()
        try:
            unread = unread_count(con, user["id"])
        finally:
            con.close()

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self.send_header("Transfer-Encoding", "chunked")
        self.end_headers()
        self.close_connection = False

        def write_chunk(payload: bytes) -> None:
            self.wfile.write(f"{len(payload):X}\r\n".encode("ascii"))
            self.wfile.write(payload)
            self.wfile.write(b"\r\n")
            self.wfile.flush()

        def send_event(payload: dict) -> None:
            body = json.dumps(
                payload, ensure_ascii=False, separators=(",", ":")
            ).encode("utf-8")
            write_chunk(b"data: " + body + b"\n\n")

        channel = hub.subscribe(user["id"])
        try:
            send_event({"type": "ready", "unread": unread})
            while True:
                try:
                    payload = channel.get(timeout=20)
                except queue.Empty:
                    write_chunk(b": keepalive\n\n")
                    continue
                send_event(payload)
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass
        finally:
            hub.unsubscribe(user["id"], channel)
            try:
                self.wfile.write(b"0\r\n\r\n")
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, OSError):
                pass

    # ----- asset scan history ---------------------------------------------

    @staticmethod
    def _scan_number(value, name, minimum, maximum):
        if value in (None, ""):
            return None, None
        try:
            number = float(value)
        except (TypeError, ValueError):
            return None, f"{name} must be a number"
        if number < minimum or number > maximum:
            return None, f"{name} is out of range"
        return number, None

    def _api_scan_create(self, user) -> None:
        body = self._read_json()
        if body is None:
            return
        scan_id = str(body.get("scan_id") or "").strip()
        asset_id = str(body.get("asset_id") or "").strip()
        if not re.fullmatch(r"[A-Za-z0-9._:-]{8,64}", scan_id):
            self._error(
                400, "scan_id must be 8-64 characters using letters, numbers, . _ : -"
            )
            return
        if not asset_id or len(asset_id) > 60:
            self._error(400, "asset_id is required (maximum 60 characters)")
            return
        latitude, error = self._scan_number(body.get("latitude"), "latitude", -90, 90)
        if error:
            self._error(400, error)
            return
        longitude, error = self._scan_number(
            body.get("longitude"), "longitude", -180, 180
        )
        if error:
            self._error(400, error)
            return
        if (latitude is None) != (longitude is None):
            self._error(
                400, "latitude and longitude must both be provided or both omitted"
            )
            return
        accuracy, error = self._scan_number(body.get("accuracy"), "accuracy", 0, 100000)
        if error:
            self._error(400, error)
            return
        if latitude is None:
            accuracy = None
        scanned_at = str(body.get("scanned_at") or "").strip() or iso_now()
        try:
            parsed = datetime.fromisoformat(scanned_at.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            scanned_at = parsed.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            self._error(400, "scanned_at must be an ISO date/time")
            return
        activity = str(body.get("activity") or "QR scan").strip()[:255]
        if not activity:
            activity = "QR scan"
        source = str(body.get("source") or "qr_scan").strip().lower()
        if not re.fullmatch(r"[a-z_]{2,40}", source):
            source = "qr_scan"
        device = str(body.get("device") or "")[:190] or None

        con = connect()
        try:
            asset = con.execute(
                "SELECT asset_id, asset_name, office, location, latitude, longitude"
                " FROM assets WHERE asset_id = %s AND is_trashed = 0",
                (asset_id,),
            ).fetchone()
            if not asset:
                self._error(404, f"Asset not found in the database: {asset_id}")
                return
            now = iso_now()
            cur = con.execute(
                "INSERT IGNORE INTO asset_scan (scan_id, asset_id, user_id,"
                " actor_role, latitude, longitude, accuracy, scanned_at,"
                " activity, source, device, ip, created_at)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (
                    scan_id,
                    asset_id,
                    user["id"],
                    user.get("role"),
                    latitude,
                    longitude,
                    accuracy,
                    scanned_at,
                    activity,
                    source,
                    device,
                    self._client_ip(),
                    now,
                ),
            )
            inserted = cur.rowcount == 1
            audit(
                con,
                user,
                "asset_scanned",
                f"{asset_id}; scan={scan_id}; source={source}",
                self._client_ip(),
            )
            con.commit()
        finally:
            con.close()
        self._json(
            201 if inserted else 200,
            {
                "ok": True,
                "duplicate": not inserted,
                "scan": {
                    "scan_id": scan_id,
                    "asset_id": asset_id,
                    "user_id": user["id"],
                    "user_name": user.get("name"),
                    "user_role": user.get("role"),
                    "latitude": latitude,
                    "longitude": longitude,
                    "accuracy": accuracy,
                    "scanned_at": scanned_at,
                    "activity": activity,
                    "source": source,
                },
                "asset": {
                    "asset_id": asset["asset_id"],
                    "name": asset["asset_name"],
                    "location": asset["location"],
                    "registered_latitude": (
                        float(asset["latitude"])
                        if asset["latitude"] is not None
                        else None
                    ),
                    "registered_longitude": (
                        float(asset["longitude"])
                        if asset["longitude"] is not None
                        else None
                    ),
                },
            },
        )

    def _api_scan_list(self, user, query) -> None:
        try:
            limit = max(1, min(int((query.get("limit") or ["20"])[0]), 100))
        except ValueError:
            limit = 20
        asset_id = str((query.get("asset_id") or [""])[0]).strip()
        con = connect()
        try:
            sql = (
                "SELECT s.*, u.name AS user_name, u.role AS user_role"
                " FROM asset_scan s LEFT JOIN users u ON u.id = s.user_id"
            )
            params: list = []
            if asset_id:
                sql += " WHERE s.asset_id = %s"
                params.append(asset_id[:60])
            sql += " ORDER BY s.scanned_at DESC, s.scan_id DESC LIMIT %s"
            params.append(limit)
            rows = con.execute(sql, params).fetchall()
        finally:
            con.close()
        items = []
        for row in rows:
            role = row["user_role"] or row["actor_role"] or ""
            items.append(
                {
                    "scan_id": row["scan_id"],
                    "asset_id": row["asset_id"],
                    "user_id": row["user_id"],
                    "user_name": row["user_name"],
                    "user_role": role,
                    "user_role_label": ROLES.get(role, role),
                    "latitude": (
                        float(row["latitude"]) if row["latitude"] is not None else None
                    ),
                    "longitude": (
                        float(row["longitude"])
                        if row["longitude"] is not None
                        else None
                    ),
                    "accuracy": (
                        float(row["accuracy"]) if row["accuracy"] is not None else None
                    ),
                    "scanned_at": row["scanned_at"],
                    "activity": row["activity"],
                    "source": row["source"],
                }
            )
        self._json(
            200,
            {"ok": True, "items": items, "serverTime": iso_now()},
        )

    def _api_activity(self, user, query) -> None:
        con = connect()
        try:
            state = get_state(con)
        finally:
            con.close()
        log = state_json(state, "mets_log", [])
        if not isinstance(log, list):
            log = []
        try:
            limit = max(1, min(int((query.get("limit") or ["200"])[0]), 2000))
        except ValueError:
            limit = 200
        self._json(200, {"ok": True, "total": len(log), "items": log[:limit]})

    def _api_sync(self, user) -> None:
        body = self._read_json()
        if body is None:
            return
        changes = body.get("changes")
        if not isinstance(changes, list):
            self._error(400, "'changes' must be an array")
            return
        device = str(body.get("device") or "")[:80]
        con = connect()
        try:
            accepted = 0
            for change in changes[:500]:
                if not isinstance(change, dict):
                    continue
                data = (
                    change.get("data") if isinstance(change.get("data"), dict) else {}
                )
                con.execute(
                    "INSERT INTO sync_events (at, device, action, asset_id, payload, user_id) VALUES (%s,%s,%s,%s,%s,%s)",
                    (
                        iso_now(),
                        device,
                        str(change.get("action") or "unknown")[:80],
                        str(data.get("assetId") or "")[:120],
                        json.dumps(change, ensure_ascii=False)[:20000],
                        user["id"],
                    ),
                )
                accepted += 1
            audit(
                con,
                user,
                "sync_received",
                f"device={device}; changes={accepted}",
                self._client_ip(),
            )
            con.commit()
            self._json(200, {"ok": True, "received": accepted, "serverTime": iso_now()})
        finally:
            con.close()

    # ----- users ----------------------------------------------------------

    def _api_users_list(self, user) -> None:
        if not self._require_admin(user):
            return
        con = connect()
        try:
            rows = con.execute("SELECT * FROM users ORDER BY role, name").fetchall()
            self._json(200, {"ok": True, "users": [public_user(row) for row in rows]})
        finally:
            con.close()

    def _validate_user_payload(
        self, body, require_password: bool
    ) -> tuple[dict | None, str | None]:
        username = str(body.get("username") or "").strip()
        name = str(body.get("name") or "").strip()
        role = str(body.get("role") or "").strip()
        office = str(body.get("office") or "").strip() or None
        password = str(body.get("password") or "")
        if require_password:
            if not re.fullmatch(r"[A-Za-z0-9._-]{3,32}", username):
                return (
                    None,
                    "Username must be 3-32 characters using letters, numbers, . _ or -",
                )
            if len(password) < 8:
                return None, "Password must be at least 8 characters"
        if not name:
            return None, "Full name is required"
        if role not in ROLES:
            return None, "Role must be one of: " + ", ".join(ROLES)
        if role == "officehead" and not office:
            return None, "Office is required for a Municipal Office Head"
        return {
            "username": username,
            "name": name,
            "role": role,
            "office": office,
            "password": password,
        }, None

    def _api_users_create(self, user) -> None:
        if not self._require_admin(user):
            return
        body = self._read_json()
        if body is None:
            return
        payload, error = self._validate_user_payload(body, require_password=True)
        if error:
            self._error(400, error)
            return
        con = connect()
        try:
            exists = con.execute(
                "SELECT 1 FROM users WHERE username = %s", (payload["username"],)
            ).fetchone()
            if exists:
                self._error(409, "That username is already taken")
                return
            salt, digest = hash_password(payload["password"])
            cur = con.execute(
                "INSERT INTO users (username, password_salt, password_hash, name, role, office, active, created_at)"
                " VALUES (%s,%s,%s,%s,%s,%s,1,%s)",
                (
                    payload["username"],
                    salt,
                    digest,
                    payload["name"],
                    payload["role"],
                    payload["office"],
                    iso_now(),
                ),
            )
            new_id = cur.lastrowid
            audit(
                con,
                user,
                "user_created",
                f"{payload['username']} ({payload['role']})",
                self._client_ip(),
            )
            con.commit()
            row = con.execute("SELECT * FROM users WHERE id = %s", (new_id,)).fetchone()
            self._json(201, {"ok": True, "user": public_user(row)})
        finally:
            con.close()

    def _api_users_update(self, user, raw_id: str) -> None:
        if not self._require_admin(user):
            return
        try:
            target_id = int(raw_id)
        except ValueError:
            self._error(400, "Invalid user id")
            return
        body = self._read_json()
        if body is None:
            return
        con = connect()
        try:
            row = con.execute(
                "SELECT * FROM users WHERE id = %s", (target_id,)
            ).fetchone()
            if not row:
                self._error(404, "User not found")
                return
            fields = []
            params: list = []
            if "name" in body:
                name = str(body["name"]).strip()
                if not name:
                    self._error(400, "Name cannot be empty")
                    return
                fields.append("name = %s")
                params.append(name)
            if "role" in body:
                role = str(body["role"]).strip()
                if role not in ROLES:
                    self._error(400, "Invalid role")
                    return
                fields.append("role = %s")
                params.append(role)
            if "office" in body:
                fields.append("office = %s")
                params.append(str(body["office"]).strip() or None)
            if "active" in body:
                active = 1 if body["active"] else 0
                if not active and row["id"] == user["id"]:
                    self._error(400, "You cannot deactivate your own account")
                    return
                if not active and row["role"] == "oic":
                    admins = con.execute(
                        "SELECT COUNT(*) AS n FROM users WHERE role='oic' AND active=1"
                    ).fetchone()["n"]
                    if admins <= 1:
                        self._error(400, "Cannot deactivate the last active GSO-OIC")
                        return
                fields.append("active = %s")
                params.append(active)
            if "password" in body:
                password = str(body["password"] or "")
                if len(password) < 8:
                    self._error(400, "Password must be at least 8 characters")
                    return
                salt, digest = hash_password(password)
                fields.extend(["password_salt = %s", "password_hash = %s"])
                params.extend([salt, digest])
            if not fields:
                self._error(400, "No supported fields supplied")
                return
            params.append(target_id)
            con.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = %s", params)
            if "password" in body:
                con.execute("DELETE FROM sessions WHERE user_id = %s", (target_id,))
            audit(
                con,
                user,
                "user_updated",
                f"id={target_id}; fields={','.join(body.keys())}",
                self._client_ip(),
            )
            con.commit()
            updated = con.execute(
                "SELECT * FROM users WHERE id = %s", (target_id,)
            ).fetchone()
            self._json(200, {"ok": True, "user": public_user(updated)})
        finally:
            con.close()

    def _api_users_delete(self, user, raw_id: str) -> None:
        if not self._require_admin(user):
            return
        try:
            target_id = int(raw_id)
        except ValueError:
            self._error(400, "Invalid user id")
            return
        if target_id == user["id"]:
            self._error(400, "You cannot delete your own account")
            return
        con = connect()
        try:
            row = con.execute(
                "SELECT * FROM users WHERE id = %s", (target_id,)
            ).fetchone()
            if not row:
                self._error(404, "User not found")
                return
            if row["role"] == "oic":
                admins = con.execute(
                    "SELECT COUNT(*) AS n FROM users WHERE role='oic' AND active=1"
                ).fetchone()["n"]
                if admins <= 1:
                    self._error(400, "Cannot delete the last active GSO-OIC")
                    return
            con.execute("DELETE FROM users WHERE id = %s", (target_id,))
            audit(
                con,
                user,
                "user_deleted",
                f"{row['username']} ({row['role']})",
                self._client_ip(),
            )
            con.commit()
            self._json(200, {"ok": True})
        finally:
            con.close()

    # ----- reporting / backup ---------------------------------------------

    def _api_audit(self, user, query) -> None:
        if not self._require_admin(user):
            return
        try:
            limit = max(1, min(int((query.get("limit") or ["100"])[0]), 1000))
        except ValueError:
            limit = 100
        con = connect()
        try:
            rows = con.execute(
                "SELECT * FROM audit ORDER BY id DESC LIMIT %s", (limit,)
            ).fetchall()
            self._json(200, {"ok": True, "items": [dict(row) for row in rows]})
        finally:
            con.close()

    def _api_report_summary(self, user) -> None:
        con = connect()
        try:
            rows = con.execute(
                "SELECT office AS dept, COUNT(*) AS total,"
                " COALESCE(SUM(CASE WHEN `condition` = 'Serviceable' THEN 1 ELSE 0 END), 0) AS serviceable,"
                " COALESCE(SUM(CASE WHEN `condition` IN ('Damaged','Unserviceable','Lost','Missing')"
                " THEN 1 ELSE 0 END), 0) AS attention"
                " FROM assets WHERE is_trashed = 0 GROUP BY office ORDER BY office"
            ).fetchall()
            sync_rows = con.execute(
                "SELECT action, COUNT(*) AS n FROM sync_events GROUP BY action"
            ).fetchall()
        finally:
            con.close()
        departments = [
            {
                "dept": row["dept"] or "",
                "total": int(row["total"] or 0),
                "serviceable": int(row["serviceable"] or 0),
                "attention": int(row["attention"] or 0),
            }
            for row in rows
        ]
        self._json(
            200,
            {
                "ok": True,
                "generatedAt": iso_now(),
                "departments": sorted(departments, key=lambda item: item["dept"]),
                "syncEvents": {row["action"]: row["n"] for row in sync_rows},
            },
        )

    def _api_report_record(self, user) -> None:
        body = self._read_json()
        if body is None:
            return
        report_type = str(body.get("type") or body.get("report_type") or "").strip()[
            :80
        ]
        period = (
            str(body.get("period") or body.get("report_period") or "").strip()[:80]
            or None
        )
        file_path = (
            str(body.get("filePath") or body.get("file_path") or "").strip()[:255]
            or None
        )
        if not report_type:
            self._error(400, "Report type is required")
            return
        now = iso_now()
        con = connect()
        try:
            cur = con.execute(
                "INSERT IGNORE INTO report (user_id, report_type, report_period, generated_at, file_path)"
                " VALUES (%s,%s,%s,%s,%s)",
                (user["id"], report_type, period, now, file_path),
            )
            inserted = cur.rowcount > 0
            if inserted:
                report_id = cur.lastrowid
                audit(
                    con,
                    user,
                    "report_generated",
                    f"{report_type}; period={period}",
                    self._client_ip(),
                )
            else:
                existing = con.execute(
                    "SELECT report_id FROM report WHERE report_type = %s AND generated_at = %s",
                    (report_type, now),
                ).fetchone()
                report_id = existing["report_id"] if existing else None
            con.commit()
            self._json(
                201,
                {
                    "ok": True,
                    "report": {
                        "report_id": report_id,
                        "report_type": report_type,
                        "report_period": period,
                        "generated_at": now,
                        "file_path": file_path,
                        "user_id": user["id"],
                    },
                },
            )
        finally:
            con.close()

    def _api_backup_record(self, user) -> None:
        body = self._read_json()
        if body is None:
            return
        file_name = str(body.get("fileName") or body.get("file_name") or "").strip()[
            :255
        ]
        storage_type = str(
            body.get("storageType") or body.get("storage_type") or "manual"
        ).strip()[:40]
        status = str(body.get("status") or "completed").strip()[:40]
        if not file_name:
            self._error(400, "File name is required")
            return
        now = iso_now()
        con = connect()
        try:
            cur = con.execute(
                "INSERT IGNORE INTO backup (user_id, backup_date, file_name, storage_type, status)"
                " VALUES (%s,%s,%s,%s,%s)",
                (user["id"], now, file_name, storage_type, status),
            )
            if cur.rowcount > 0:
                audit(
                    con,
                    user,
                    "backup_recorded",
                    f"{file_name} ({storage_type})",
                    self._client_ip(),
                )
            con.commit()
            self._json(
                201,
                {
                    "ok": True,
                    "backup": {
                        "backup_id": cur.lastrowid or None,
                        "backup_date": now,
                        "file_name": file_name,
                        "storage_type": storage_type,
                        "status": status,
                        "user_id": user["id"],
                    },
                },
            )
        finally:
            con.close()

    def _api_export(self, user) -> None:
        if not self._require_admin(user):
            return
        con = connect()
        try:
            state = {
                row["key"]: row["value"]
                for row in con.execute("SELECT `key`, `value` FROM app_state")
            }
            users = [public_user(row) for row in con.execute("SELECT * FROM users")]
            payload = {
                "format": "katipunan-ams-backup",
                "version": 1,
                "exportedAt": iso_now(),
                "state": state,
                "users": users,
            }
            body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
            con.execute(
                "INSERT IGNORE INTO backup (user_id, backup_date, file_name, storage_type, status)"
                " VALUES (%s,%s,%s,%s,%s)",
                (
                    user["id"],
                    iso_now(),
                    "katipunan-ams-backup.json",
                    "server-json",
                    "completed",
                ),
            )
            audit(con, user, "backup_exported", f"keys={len(state)}", self._client_ip())
            con.commit()
        finally:
            con.close()
        self._send(
            200,
            body,
            "application/json; charset=utf-8",
            {
                "Cache-Control": "no-store",
                "Content-Disposition": 'attachment; filename="katipunan-ams-backup.json"',
            },
        )

    def _api_import(self, user) -> None:
        if not self._require_admin(user):
            return
        body = self._read_json()
        if body is None:
            return
        state = body.get("state")
        if not isinstance(state, dict):
            self._error(400, "Body must contain a 'state' object")
            return
        replace = bool(body.get("replace"))
        con = connect()
        try:
            if replace:
                con.execute("DELETE FROM app_state")
            now = iso_now()
            saved = 0
            for key, value in state.items():
                if (
                    not isinstance(key, str)
                    or not key.startswith("mets_")
                    or key in SENSITIVE_KEYS
                ):
                    continue
                if not isinstance(value, str):
                    continue
                con.execute(
                    "INSERT INTO app_state (`key`, `value`, updated_at, updated_by) VALUES (%s,%s,%s,%s)"
                    " ON DUPLICATE KEY UPDATE `value`=VALUES(`value`),"
                    " updated_at=VALUES(updated_at), updated_by=VALUES(updated_by)",
                    (key, value, now, user["id"]),
                )
                saved += 1
            notify_entries: list = []
            if saved:
                notify_entries = insert_notifications(
                    con,
                    [
                        {
                            "action_type": "backup_imported",
                            "action_label": "Backup imported",
                            "asset_id": None,
                            "asset_name": None,
                            "details": f"Imported {saved} state keys"
                            f" (replace={replace})",
                            "changes": [],
                            "source": "import",
                        }
                    ],
                    user,
                )
            sync_erd(con, get_state(con), user["id"])
            audit(
                con,
                user,
                "backup_imported",
                f"replace={replace}; keys={saved}",
                self._client_ip(),
            )
            con.commit()
            publish_notifications(notify_entries)
            self._json(200, {"ok": True, "imported": saved, "replaced": replace})
        finally:
            con.close()

    # ----- static files ---------------------------------------------------

    def _serve_static(self, path: str) -> None:
        if path in ("", "/"):
            path = "/index.html"
        rel = unquote(path.lstrip("/"))
        normalized = os.path.normpath(rel).replace("\\", "/")
        blocked = (
            normalized.startswith(("..", "data/", "__pycache__/", "."))
            or "/." in normalized
            or normalized.endswith((".py", ".pyc", ".pyo", ".db", ".db-wal", ".db-shm"))
        )
        if blocked:
            self._not_found()
            return

        # Pages live in frontend/templates; assets live in frontend/static.
        # The app is still served from the site root so existing URLs work.
        if normalized in ("index.html", "login.html", "admin.html"):
            base = os.path.realpath(TEMPLATES_DIR)
            target = normalized
        elif normalized.startswith("static/"):
            base = os.path.realpath(STATIC_DIR)
            target = normalized[len("static/") :]
        elif normalized.startswith("icons/"):
            # Backward-compatible alias for previously cached pages.
            base = os.path.realpath(os.path.join(STATIC_DIR, "images"))
            target = normalized
        else:
            base = os.path.realpath(STATIC_DIR)
            target = normalized
        full = os.path.realpath(os.path.join(base, target))
        if not (full == base or full.startswith(base + os.sep)):
            self._not_found()
            return
        if os.path.isdir(full):
            full = os.path.join(full, "index.html")
        if not os.path.isfile(full):
            self._not_found()
            return

        content_type = mimetypes.guess_type(full)[0] or "application/octet-stream"
        if full.endswith(".html"):
            content_type = "text/html; charset=utf-8"
        elif full.endswith(".js"):
            content_type = "text/javascript; charset=utf-8"
        elif full.endswith(".json"):
            content_type = "application/json; charset=utf-8"
        elif full.endswith(".css"):
            content_type = "text/css; charset=utf-8"
        elif full.endswith(".svg"):
            content_type = "image/svg+xml"

        no_cache = (
            full.endswith((".html", ".json", ".js", ".css"))
            or os.path.basename(full) == "sw.js"
        )
        cache = "no-cache" if no_cache else "public, max-age=3600"
        try:
            with open(full, "rb") as handle:
                body = handle.read()
        except OSError:
            self._not_found()
            return
        self._send(200, body, content_type, {"Cache-Control": cache})

    def _not_found(self) -> None:
        body = (
            b"<!doctype html><html><head><meta charset='utf-8'><title>Not found</title>"
            b"<style>body{font-family:system-ui;background:#0d1b3e;color:#e2e8f0;display:flex;"
            b"align-items:center;justify-content:center;height:100vh;margin:0}"
            b"div{text-align:center}h1{color:#c9a84c;font-size:3rem;margin:0 0 8px}"
            b"a{color:#e8c96d}</style></head><body><div><h1>404</h1>"
            b"<p>The requested file was not found.</p><p><a href='/'>Go to the system</a></p>"
            b"</div></body></html>"
        )
        self._send(404, body, "text/html; charset=utf-8", {"Cache-Control": "no-store"})


class AMSServer(ThreadingHTTPServer):
    """Single-instance HTTP server.

    Windows treats SO_REUSEADDR as permission to bind the same port twice,
    which can leave an older build answering requests. Disable it so a second
    copy fails loudly instead of hijacking the port.
    """

    allow_reuse_address = False
    daemon_threads = True

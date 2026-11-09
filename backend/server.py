#!/usr/bin/env python3
"""
Katipunan Asset Management System - backend entry point
=======================================================

A Python backend for the QR Code-Based Asset Management System with
Procurement Forecasting for the Local Government Unit of Katipunan,
Zamboanga del Norte.

Modules:
    config.py   Environment variables, paths, roles, and seed accounts
    utils.py    Time and JSON helpers
    auth.py     Password hashing, login throttling, audit trail
    db.py       MariaDB connection wrapper and schema
    state.py    Helpers for the JSON application-state snapshot
    erd.py      Normalized ERD projection and forecasting
    api.py      HTTP handler, REST routes, and static files
    server.py   This entry point

Run (from the project root):
    python backend/server.py

Environment variables:
    HOST=127.0.0.1     bind address (use 0.0.0.0 for LAN access)
    PORT=8080          listen port
    SESSION_HOURS=12   login session lifetime
    DB_HOST=127.0.0.1  MariaDB host (XAMPP default)
    DB_PORT=3306       MariaDB port
    DB_USER=root       MariaDB user (XAMPP default)
    DB_PASSWORD=       MariaDB password (XAMPP default is empty)
    DB_NAME=katipunan_ams
"""

from __future__ import annotations

import sys

from api import AMSServer, Handler
from config import (
    DB_HOST,
    DB_NAME,
    DB_PORT,
    DB_USER,
    HOST,
    PORT,
    SQLITE_PATH,
)
from db import Database, connect, init_db
from erd import clear_erd, sync_erd

__all__ = [
    "AMSServer",
    "Database",
    "Handler",
    "clear_erd",
    "connect",
    "init_db",
    "main",
    "sync_erd",
]


def main() -> None:
    init_db()
    try:
        server = AMSServer((HOST, PORT), Handler)
    except OSError as exc:
        print()
        print(f"  Cannot listen on {HOST}:{PORT} - {exc}")
        print("  Another copy of the server may already be running.")
        print("  Close it first, then start the server again.")
        print()
        return
    print()
    print("  Katipunan Asset Management System - backend")
    print("  -------------------------------------------")
    print(
        f"  URL:        http://{'localhost' if HOST in ('127.0.0.1', '0.0.0.0') else HOST}:{PORT}/"
    )
    print(f"  Database:   MariaDB {DB_NAME} at {DB_HOST}:{DB_PORT} (user {DB_USER})")
    print(f"  Legacy DB:  {SQLITE_PATH}")
    print("  Admin:      admin / Katipunan@2026")
    print("  Inspector:  inspector / Inspector@2026")
    print("  GSO staff:  gsostaff / GSOStaff@2026")
    print("  Office head:officehead / OfficeHead@2026")
    print()
    print("  Press Ctrl+C to stop.")
    print()
    try:
        sys.stdout.flush()
    except (OSError, ValueError):
        pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Shutting down...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

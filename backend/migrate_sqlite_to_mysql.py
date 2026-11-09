#!/usr/bin/env python3
"""
Copy the legacy SQLite database into XAMPP MariaDB.
====================================================

The application now stores everything in MariaDB (database ``katipunan_ams``
by default). This one-off script copies the old SQLite data across while
preserving user IDs, session tokens, audit IDs and timestamps.

Usage (from the project root, with XAMPP MySQL running):

    python backend/migrate_sqlite_to_mysql.py

Options:
    --sqlite PATH   Source SQLite file (default: backend/data/katipunan.db)
    --replace       Delete existing MariaDB rows first, then copy exactly
    --dry-run       Show what would be copied without writing anything

Without ``--replace`` the script upserts by primary key, so it is safe to run
more than once. The SQLite file is never modified.
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

import server  # noqa: E402  (loads .env and MariaDB settings)

# Primary key column for each table.
TABLES = [
    ("users", "id"),
    ("sessions", "token"),
    ("app_state", "key"),
    ("audit", "id"),
    ("sync_events", "id"),
]

# Child rows first so foreign keys stay satisfied while clearing.
DELETE_ORDER = ["sync_events", "audit", "sessions", "app_state", "users"]


def read_sqlite(db_path: str, table: str) -> tuple[list[str], list[dict]]:
    if not os.path.isfile(db_path):
        raise SystemExit(f"SQLite database not found: {db_path}")
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    try:
        cols = [row[1] for row in con.execute(f"PRAGMA table_info(`{table}`)")]
        if not cols:
            return [], []
        rows = [dict(row) for row in con.execute(f"SELECT * FROM `{table}`")]
        return cols, rows
    finally:
        con.close()


def upsert_sql(table: str, cols: list[str], pk: str) -> str:
    quoted = ", ".join(f"`{c}`" for c in cols)
    placeholders = ", ".join(["%s"] * len(cols))
    updates = ", ".join(f"`{c}`=VALUES(`{c}`)" for c in cols if c != pk)
    sql = f"INSERT INTO `{table}` ({quoted}) VALUES ({placeholders})"
    if updates:
        sql += f" ON DUPLICATE KEY UPDATE {updates}"
    return sql


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Copy the legacy SQLite database into MariaDB."
    )
    parser.add_argument(
        "--sqlite",
        default=server.SQLITE_PATH,
        help="Source SQLite database (default: backend/data/katipunan.db)",
    )
    parser.add_argument(
        "--replace", action="store_true", help="Delete existing MariaDB rows first"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Read only; do not write to MariaDB"
    )
    args = parser.parse_args()

    if not os.path.isfile(args.sqlite):
        print(f"  SQLite database not found: {args.sqlite}")
        return 1

    print("")
    print("  Katipunan AMS - SQLite to MariaDB migration")
    print("  -------------------------------------------")
    print(f"  Source:      {args.sqlite}")
    print(f"  Destination: {server.DB_NAME} at {server.DB_HOST}:{server.DB_PORT}")

    # Read the legacy data first so a MariaDB problem cannot lose anything.
    source: dict[str, tuple[list[str], list[dict]]] = {}
    for table, _pk in TABLES:
        cols, rows = read_sqlite(args.sqlite, table)
        source[table] = (cols, rows)
        print(f"  SQLite {table:<12} {len(rows):>6} rows")

    if args.dry_run:
        print("\n  Dry run: nothing was written.")
        return 0

    # Create the database/schema (and seed accounts if the target is empty).
    server.init_db()

    con = server.connect()
    try:
        if args.replace:
            con.execute("SET FOREIGN_KEY_CHECKS=0")
            for table in DELETE_ORDER:
                con.execute(f"DELETE FROM `{table}`")
            con.execute("SET FOREIGN_KEY_CHECKS=1")
            server.clear_erd(con)

        written: dict[str, int] = {}
        for table, pk in TABLES:
            cols, rows = source[table]
            if not cols:
                written[table] = 0
                continue
            sql = upsert_sql(table, cols, pk)
            for row in rows:
                con.execute(sql, [row.get(c) for c in cols])
            written[table] = len(rows)

        # Build the normalized ERD tables from the imported snapshot.
        state_cols, state_rows = source.get("app_state", ([], []))
        if "key" in state_cols and "value" in state_cols:
            state = {row["key"]: row["value"] for row in state_rows}
            owner_id = None
            for row in state_rows:
                if row.get("key") == "mets_staffdata":
                    owner_id = row.get("updated_by")
                    break
            server.sync_erd(con, state, owner_id)
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()

    print("")
    print("  Copied:")
    for table, _pk in TABLES:
        print(f"    {table:<12} {written[table]:>6} rows")

    # Verify the destination counts match.
    con = server.connect()
    try:
        print("")
        print("  MariaDB now contains:")
        ok = True
        for table, _pk in TABLES:
            actual = con.execute(f"SELECT COUNT(*) AS n FROM `{table}`").fetchone()["n"]
            expected = written[table]
            flag = "ok" if actual >= expected else "MISMATCH"
            if actual < expected:
                ok = False
            print(f"    {table:<12} {actual:>6} rows  ({flag})")
        erd_assets = con.execute("SELECT COUNT(*) AS n FROM `assets`").fetchone()["n"]
        print(f"    {'assets (ERD)':<12} {erd_assets:>6} rows  (ok)")
    finally:
        con.close()

    if not ok:
        print("\n  Warning: some rows are missing in MariaDB.")
        return 1

    print("\n  Migration complete. The SQLite file was left untouched as a backup.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

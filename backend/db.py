"""MariaDB connection wrapper, schema, and database initialization."""

from __future__ import annotations

import os
import re

import pymysql
import pymysql.cursors
from auth import hash_password
from config import DATA_DIR, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, SEED_USERS
from utils import iso_now


class Cursor:
    """Small compatibility wrapper so call sites keep using fetchone/fetchall."""

    __slots__ = ("_cur",)

    def __init__(self, cur) -> None:
        self._cur = cur

    def fetchone(self):
        return self._cur.fetchone()

    def fetchall(self):
        return self._cur.fetchall()

    def __iter__(self):
        return iter(self._cur.fetchall())

    @property
    def lastrowid(self) -> int:
        return self._cur.lastrowid

    @property
    def rowcount(self) -> int:
        return self._cur.rowcount


class Database:
    """Thin MariaDB connection wrapper.

    Rows are dicts (DictCursor), so code can keep using ``row["column"]``.
    Transactions are explicit: call ``commit()`` to persist and ``rollback()``
    on error.
    """

    def __init__(self) -> None:
        self._con = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False,
            connect_timeout=10,
            read_timeout=60,
            write_timeout=60,
        )

    def execute(self, sql: str, params=None) -> Cursor:
        cur = self._con.cursor()
        cur.execute(sql, params)
        return Cursor(cur)

    def executescript(self, script: str) -> None:
        for statement in script.split(";"):
            statement = statement.strip()
            if statement:
                cur = self._con.cursor()
                cur.execute(statement)

    def executemany(self, sql: str, params) -> None:
        rows = list(params)
        if not rows:
            return
        cur = self._con.cursor()
        cur.executemany(sql, rows)

    def commit(self) -> None:
        self._con.commit()

    def rollback(self) -> None:
        self._con.rollback()

    def close(self) -> None:
        self._con.close()


def connect() -> Database:
    return Database()


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_salt VARCHAR(128) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(190) NOT NULL,
    role VARCHAR(40) NOT NULL,
    office VARCHAR(80),
    active TINYINT NOT NULL DEFAULT 1,
    created_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    expires_at VARCHAR(40) NOT NULL,
    ip VARCHAR(64),
    user_agent VARCHAR(400),
    INDEX idx_sessions_user (user_id),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS app_state (
    `key` VARCHAR(120) NOT NULL PRIMARY KEY,
    `value` LONGTEXT NOT NULL,
    updated_at VARCHAR(40) NOT NULL,
    updated_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS audit (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    at VARCHAR(40) NOT NULL,
    user_id INT,
    username VARCHAR(64),
    action VARCHAR(80) NOT NULL,
    detail TEXT,
    ip VARCHAR(64),
    INDEX idx_audit_at (at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS sync_events (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    at VARCHAR(40) NOT NULL,
    device VARCHAR(80),
    action VARCHAR(80) NOT NULL,
    asset_id VARCHAR(120),
    payload LONGTEXT,
    user_id INT,
    INDEX idx_sync_at (at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS notifications (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    recipient_user_id INT NOT NULL,
    actor_user_id INT,
    actor_name VARCHAR(190),
    actor_role VARCHAR(40),
    action_type VARCHAR(80) NOT NULL,
    action_label VARCHAR(190) NOT NULL,
    asset_id VARCHAR(60),
    asset_name VARCHAR(190),
    details TEXT,
    changes_json LONGTEXT,
    source VARCHAR(40),
    created_at VARCHAR(40) NOT NULL,
    read_at VARCHAR(40),
    read_by INT,
    INDEX idx_notifications_recipient (recipient_user_id, read_at),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ===========================================================================
-- ERD entities
-- ---------------------------------------------------------------------------
-- USER is implemented by the existing `users` table:
--   user_id -> id, full_name -> name, password -> password_hash (PBKDF2),
--   status -> active.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS assets (
    asset_id VARCHAR(60) NOT NULL PRIMARY KEY,
    user_id INT,
    asset_name VARCHAR(190) NOT NULL,
    property_no VARCHAR(120),
    serial_no VARCHAR(190),
    qr_code VARCHAR(190),
    category VARCHAR(80),
    `condition` VARCHAR(40),
    office VARCHAR(120),
    acquisition_date VARCHAR(40),
    acquisition_cost DECIMAL(16,2) NOT NULL DEFAULT 0.00,
    useful_life VARCHAR(40),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    is_trashed TINYINT NOT NULL DEFAULT 0,
    sync_status VARCHAR(40) NOT NULL DEFAULT 'synced',
    brand VARCHAR(190),
    staff_id VARCHAR(60),
    owner_name VARCHAR(190),
    owner_position VARCHAR(190),
    location VARCHAR(190),
    last_scan_date VARCHAR(40),
    last_scan_location VARCHAR(190),
    created_at VARCHAR(40) NOT NULL,
    updated_at VARCHAR(40) NOT NULL,
    INDEX idx_assets_office (office),
    INDEX idx_assets_condition (`condition`),
    INDEX idx_assets_user (user_id),
    CONSTRAINT fk_assets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS asset_scan (
    scan_id VARCHAR(64) NOT NULL PRIMARY KEY,
    asset_id VARCHAR(60) NOT NULL,
    user_id INT,
    actor_role VARCHAR(40),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    accuracy DECIMAL(8,2),
    scanned_at VARCHAR(40) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    source VARCHAR(40) NOT NULL DEFAULT 'qr_scan',
    device VARCHAR(190),
    ip VARCHAR(64),
    created_at VARCHAR(40) NOT NULL,
    INDEX idx_scan_asset (asset_id, scanned_at),
    INDEX idx_scan_user (user_id, scanned_at),
    CONSTRAINT fk_scan_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    CONSTRAINT fk_scan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS asset_lifecycle (
    lifecycle_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(60) NOT NULL,
    lifecycle_stage VARCHAR(80),
    remaining_life VARCHAR(60),
    effective_date VARCHAR(40),
    INDEX idx_lifecycle_asset (asset_id),
    CONSTRAINT fk_lifecycle_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS maintenance_asset_report (
    maintenance_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(60) NOT NULL,
    maintenance_type VARCHAR(120),
    description TEXT,
    maintenance_date VARCHAR(40),
    cost DECIMAL(16,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(60),
    technician VARCHAR(190),
    recorded_at VARCHAR(40),
    INDEX idx_maintenance_asset (asset_id),
    INDEX idx_maintenance_date (maintenance_date),
    CONSTRAINT fk_maintenance_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS procurement_forecast (
    forecast_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(60) NOT NULL,
    forecast_year INT NOT NULL,
    predicted_quantity INT NOT NULL DEFAULT 0,
    estimated_cost DECIMAL(16,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(60),
    priority VARCHAR(20),
    bucket VARCHAR(60),
    UNIQUE KEY uq_forecast (asset_id, forecast_year),
    INDEX idx_forecast_year (forecast_year),
    CONSTRAINT fk_forecast_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS backup (
    backup_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    backup_date VARCHAR(40) NOT NULL,
    file_name VARCHAR(255),
    storage_type VARCHAR(40),
    status VARCHAR(40),
    UNIQUE KEY uq_backup (file_name, backup_date, storage_type),
    INDEX idx_backup_user (user_id),
    CONSTRAINT fk_backup_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS activity_log (
    log_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    `action` VARCHAR(255) NOT NULL,
    details TEXT,
    `timestamp` VARCHAR(40) NOT NULL,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_time (`timestamp`),
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS report (
    report_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    report_type VARCHAR(80),
    report_period VARCHAR(80),
    generated_at VARCHAR(40),
    file_path VARCHAR(255),
    UNIQUE KEY uq_report (report_type, generated_at),
    INDEX idx_report_user (user_id),
    CONSTRAINT fk_report_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS borrow (
    borrow_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(60) NOT NULL,
    borrower_name VARCHAR(190),
    borrow_date VARCHAR(40),
    return_date VARCHAR(40),
    status VARCHAR(40),
    recorded_at VARCHAR(40),
    INDEX idx_borrow_asset (asset_id),
    CONSTRAINT fk_borrow_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(60) NOT NULL,
    location VARCHAR(190),
    quantity INT NOT NULL DEFAULT 1,
    capture_date VARCHAR(40),
    sync_status VARCHAR(40) NOT NULL DEFAULT 'synced',
    INDEX idx_inventory_asset (asset_id),
    CONSTRAINT fk_inventory_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS asset_transfer (
    transfer_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(60) NOT NULL,
    from_office VARCHAR(120),
    to_office VARCHAR(120),
    transfer_date VARCHAR(40),
    remarks TEXT,
    sync_status VARCHAR(40) NOT NULL DEFAULT 'synced',
    INDEX idx_transfer_asset (asset_id),
    CONSTRAINT fk_transfer_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;
"""


def ensure_database() -> None:
    """Create the application database on the MariaDB server if it is missing."""
    if not re.fullmatch(r"[A-Za-z0-9_]+", DB_NAME):
        raise SystemExit(f"Invalid DB_NAME: {DB_NAME!r}")
    try:
        con = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            charset="utf8mb4",
            autocommit=True,
            connect_timeout=10,
        )
    except pymysql.err.OperationalError as exc:
        raise SystemExit(
            "\n  Cannot reach MariaDB/MySQL.\n"
            f"  Tried {DB_USER}@{DB_HOST}:{DB_PORT}.\n"
            f"  {exc}\n\n"
            "  Is XAMPP running? Start MySQL in the XAMPP Control Panel,\n"
            "  then run this server again.\n"
        )
    try:
        with con.cursor() as cur:
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`"
                " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
    finally:
        con.close()


def get_state(con: Database) -> dict[str, str]:
    return {
        row["key"]: row["value"]
        for row in con.execute("SELECT `key`, `value` FROM app_state")
    }


def init_db() -> None:
    # Imported lazily to avoid a db <-> erd import cycle.
    from erd import sync_erd

    ensure_database()
    os.makedirs(DATA_DIR, exist_ok=True)
    con = connect()
    try:
        con.executescript(SCHEMA)
        existing = con.execute("SELECT COUNT(*) AS n FROM users").fetchone()["n"]
        if existing == 0:
            for username, password, name, role, office in SEED_USERS:
                salt, digest = hash_password(password)
                con.execute(
                    "INSERT INTO users (username, password_salt, password_hash, name, role, office, created_at)"
                    " VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    (username, salt, digest, name, role, office, iso_now()),
                )
        con.execute("DELETE FROM sessions WHERE expires_at <= %s", (iso_now(),))
        # Build the normalized ERD tables from the stored state on startup.
        state = get_state(con)
        if state:
            owner = con.execute(
                "SELECT updated_by FROM app_state WHERE `key` = 'mets_staffdata'"
            ).fetchone()
            sync_erd(con, state, owner["updated_by"] if owner else None)
        con.commit()
    finally:
        con.close()

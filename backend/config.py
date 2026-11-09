"""Configuration and constants for the Katipunan Asset Management System."""

from __future__ import annotations

import os

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

BASE_DIR = os.path.dirname(BACKEND_DIR)

FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

TEMPLATES_DIR = os.path.join(FRONTEND_DIR, "templates")

STATIC_DIR = os.path.join(FRONTEND_DIR, "static")

DATA_DIR = os.path.join(BACKEND_DIR, "data")

SQLITE_PATH = os.path.join(DATA_DIR, "katipunan.db")


def load_env_file() -> None:
    """Load simple KEY=VALUE lines from the project-root .env, if present."""
    path = os.path.join(BASE_DIR, ".env")
    if not os.path.isfile(path):
        return
    try:
        with open(path, "r", encoding="utf-8") as handle:
            for raw in handle:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        pass


# Load the project-root .env before reading the settings below.
load_env_file()

HOST = os.environ.get("HOST", "127.0.0.1")

PORT = int(os.environ.get("PORT", "8080"))

SESSION_HOURS = int(os.environ.get("SESSION_HOURS", "12"))

MAX_BODY = int(os.environ.get("MAX_BODY", str(25 * 1024 * 1024)))

DB_HOST = os.environ.get("DB_HOST", "127.0.0.1")

DB_PORT = int(os.environ.get("DB_PORT", "3306"))

DB_USER = os.environ.get("DB_USER", "root")

DB_PASSWORD = os.environ.get("DB_PASSWORD", "")

DB_NAME = os.environ.get("DB_NAME", "katipunan_ams")

# Public OAuth client ID for optional Google Drive uploads.
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")

ROLES = {
    "oic": "GSO-OIC",
    "inspector": "Inspectorate Personnel",
    "gsostaff": "GSO Office Personnel",
    "officehead": "Municipal Office Head",
}

OFFICE_LABELS = {
    "mayors": "Mayor's Office",
    "budget": "Budget Office",
    "mpc": "Municipal Planning & Development Office",
    "accounting": "Accounting Office",
    "treasury": "Treasurer's Office",
    "engineering": "Engineering Office",
    "assessor": "Assessor's Office",
    "civilreg": "Civil Registrar",
    "rhu": "Rural Health Unit (RHU)",
    "bfp": "Bureau of Fire Protection",
    "pnp": "PNP Office",
    "motorpool": "Motorpool",
    "ldrrmo": "LDRRMO",
    "dswd": "DSWD",
    "mswd": "MSWD",
    "seniors": "Senior Citizens Office",
    "owwa": "OWWA",
    "water": "Water System",
    "market": "Market Office",
    "gso": "General Services Office",
    "municipal": "Admin Office",
}

SENSITIVE_KEYS = {
    "mets_pin",
    "mets_password",
    "mets_username",
    "mets_lock_type",
    "mets_pending_sync",
    "mets_device_id",
    "mets_cred_overrides",
    "mets_accounts",
}

ERD_STATE_KEYS = {
    "mets_staffdata",
    "mets_repairs",
    "mets_borrows",
    "mets_transfers",
    "mets_log",
}

SEED_USERS = [
    ("admin", "Katipunan@2026", "GSO-OIC Administrator", "oic", "gso"),
    ("inspector", "Inspector@2026", "Inspectorate Officer", "inspector", "gso"),
    ("gsostaff", "GSOStaff@2026", "GSO Office Personnel", "gsostaff", "gso"),
    ("officehead", "OfficeHead@2026", "Municipal Office Head", "officehead", "gso"),
]

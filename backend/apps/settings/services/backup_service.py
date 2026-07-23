from __future__ import annotations

import logging
import os
import re
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

from django.conf import settings

from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)

logger = logging.getLogger(__name__)

SAFE_NAME = re.compile(r"^backup_\d{8}_\d{6}\.sql$")


class BackupService:
    def backups_dir(self) -> Path:
        base = Path(
            getattr(settings, "BACKUP_ROOT", None)
            or (Path(settings.BASE_DIR) / "backups")
        )
        base.mkdir(parents=True, exist_ok=True)
        return base

    def list_backups(self) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        for path in sorted(self.backups_dir().glob("backup_*.sql"), reverse=True):
            if not SAFE_NAME.match(path.name):
                continue
            stat = path.stat()
            rows.append(
                {
                    "filename": path.name,
                    "size_bytes": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_mtime).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                }
            )
        return rows

    def create_backup(self) -> dict[str, Any]:
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{stamp}.sql"
        target = self.backups_dir() / filename
        db = settings.DATABASES["default"]
        host = db.get("HOST") or "127.0.0.1"
        port = str(db.get("PORT") or "3306")
        name = db.get("NAME")
        user = db.get("USER")
        password = db.get("PASSWORD") or ""
        if not name or not user:
            raise SettingsValidationError("Database credentials are not configured.")

        env = os.environ.copy()
        env["MYSQL_PWD"] = password
        cmd = [
            "mysqldump",
            f"--host={host}",
            f"--port={port}",
            f"--user={user}",
            "--single-transaction",
            "--routines",
            "--triggers",
            name,
        ]
        try:
            with target.open("w", encoding="utf-8", newline="\n") as handle:
                result = subprocess.run(
                    cmd,
                    stdout=handle,
                    stderr=subprocess.PIPE,
                    text=True,
                    env=env,
                    check=False,
                )
        except FileNotFoundError as exc:
            if target.exists():
                target.unlink(missing_ok=True)
            raise SettingsValidationError(
                "mysqldump is not available on this server."
            ) from exc

        if result.returncode != 0:
            if target.exists():
                target.unlink(missing_ok=True)
            detail = (result.stderr or "").strip() or "mysqldump failed."
            raise SettingsValidationError(detail)

        logger.info("Created database backup %s", filename)
        return {
            "filename": filename,
            "size_bytes": target.stat().st_size,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

    def resolve_path(self, filename: str) -> Path:
        name = Path(filename).name
        if not SAFE_NAME.match(name):
            raise SettingsValidationError("Invalid backup filename.")
        path = self.backups_dir() / name
        if not path.exists() or not path.is_file():
            raise SettingsNotFoundError("Backup file not found.")
        return path

    def delete_backup(self, filename: str) -> None:
        path = self.resolve_path(filename)
        path.unlink()
        logger.info("Deleted backup %s", path.name)

    def restore_allowed(self) -> bool:
        return bool(getattr(settings, "ALLOW_DATABASE_RESTORE", False))

    def restore_backup(self, filename: str) -> dict[str, Any]:
        if not self.restore_allowed():
            raise SettingsValidationError(
                "Database restore is disabled. "
                "Set ALLOW_DATABASE_RESTORE=true to enable."
            )
        path = self.resolve_path(filename)
        db = settings.DATABASES["default"]
        host = db.get("HOST") or "127.0.0.1"
        port = str(db.get("PORT") or "3306")
        name = db.get("NAME")
        user = db.get("USER")
        password = db.get("PASSWORD") or ""
        env = os.environ.copy()
        env["MYSQL_PWD"] = password
        cmd = [
            "mysql",
            f"--host={host}",
            f"--port={port}",
            f"--user={user}",
            name,
        ]
        try:
            with path.open("r", encoding="utf-8") as handle:
                result = subprocess.run(
                    cmd,
                    stdin=handle,
                    stderr=subprocess.PIPE,
                    text=True,
                    env=env,
                    check=False,
                )
        except FileNotFoundError as exc:
            raise SettingsValidationError(
                "mysql client is not available on this server."
            ) from exc
        if result.returncode != 0:
            detail = (result.stderr or "").strip() or "mysql restore failed."
            raise SettingsValidationError(detail)
        logger.warning("Restored database from backup %s", path.name)
        return {"filename": path.name, "restored": True}

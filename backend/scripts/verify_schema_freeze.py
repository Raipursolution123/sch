"""Final schema freeze verification: db_current vs Django managed=False models."""
from __future__ import annotations

import os
import sys
from pathlib import Path

import MySQLdb
import django

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.base")
django.setup()

from django.apps import apps  # noqa: E402


def db_connect():
    return MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")


def main() -> int:
    conn = db_connect()
    cur = conn.cursor()
    cur.execute("SHOW FULL TABLES")
    rows = cur.fetchall()

    physical: dict[str, str] = {}
    for row in rows:
        name = row[0]
        ttype = row[1] if len(row) > 1 else "BASE TABLE"
        physical[name] = ttype

    base_tables = {n for n, t in physical.items() if t.upper() == "BASE TABLE"}
    views = {n for n, t in physical.items() if t.upper() == "VIEW"}

    model_by_table: dict[str, list[str]] = {}
    non_managed_count = 0
    managed_business_count = 0

    for model in apps.get_models():
        module = model.__module__ or ""
        if not module.startswith("apps."):
            continue
        table = model._meta.db_table
        label = f"{model._meta.app_label}.{model.__name__}"
        if model._meta.managed is False:
            non_managed_count += 1
            model_by_table.setdefault(table, []).append(label)
        else:
            managed_business_count += 1

    mapped_tables = set(model_by_table.keys())
    unmapped_tables = sorted(base_tables - mapped_tables)
    orphan_models = sorted(mapped_tables - base_tables)
    duplicates = {t: ms for t, ms in model_by_table.items() if len(ms) > 1}

    # information_schema cross-check
    cur.execute(
        """
        SELECT TABLE_NAME, TABLE_TYPE
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = 'db_current'
        ORDER BY TABLE_NAME
        """
    )
    ischema_rows = cur.fetchall()
    conn.close()
    ischema_base = {r[0] for r in ischema_rows if r[1].upper() == "BASE TABLE"}
    ischema_views = {r[0] for r in ischema_rows if r[1].upper() == "VIEW"}

    print("=" * 60)
    print("SCHEMA FREEZE VERIFICATION — db_current")
    print("=" * 60)
    print()
    print("1. SHOW FULL TABLES")
    print(f"   Total objects returned: {len(physical)}")
    print(f"   BASE TABLE (physical tables): {len(base_tables)}")
    print(f"   VIEW: {len(views)}")
    print()
    print("2. Django business models (apps.*, managed=False)")
    print(f"   Model instances: {non_managed_count}")
    print(f"   Unique db_table mappings: {len(mapped_tables)}")
    if managed_business_count:
        print(f"   (Excluded managed=True apps.* models: {managed_business_count})")
    print()
    print("3. Unmapped tables (in DB, no model):", len(unmapped_tables))
    for t in unmapped_tables:
        print(f"   - {t}")
    print()
    print("4. Orphan models (model, no DB table):", len(orphan_models))
    for t in orphan_models:
        print(f"   - {t} -> {model_by_table[t]}")
    print()
    print("5. Duplicate db_table mappings:", len(duplicates))
    for t, ms in sorted(duplicates.items()):
        print(f"   - {t}: {ms}")
    print()
    print("6. Count reconciliation (280 vs 288)")
    print(f"   SHOW FULL TABLES BASE TABLE count: {len(base_tables)}")
    print(f"   information_schema BASE TABLE count: {len(ischema_base)}")
    print(f"   information_schema VIEW count: {len(ischema_views)}")
    print(f"   Django managed=False unique db_tables: {len(mapped_tables)}")
    diff_ischema = ischema_base.symmetric_difference(base_tables)
    if diff_ischema:
        print(f"   SHOW vs information_schema diff: {sorted(diff_ischema)}")
    print()
    print("=" * 60)
    print("FREEZE GATE")
    print("=" * 60)
    checks = [
        ("Physical tables == mapped business tables", len(base_tables) == len(mapped_tables)),
        ("No unmapped tables", len(unmapped_tables) == 0),
        ("No duplicate mappings", len(duplicates) == 0),
        ("No orphan models", len(orphan_models) == 0),
    ]
    approved = all(ok for _, ok in checks)
    for label, ok in checks:
        print(f"   [{'PASS' if ok else 'FAIL'}] {label}")
    print()
    print(f"SCHEMA FREEZE: {'APPROVED' if approved else 'NOT APPROVED'}")
    return 0 if approved else 1


if __name__ == "__main__":
    raise SystemExit(main())

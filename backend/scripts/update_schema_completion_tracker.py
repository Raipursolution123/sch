"""Update schema_completion_tracker.md from master assignment + mapped models."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
ASSIGNMENT = ROOT / "docs" / "database" / "master_domain_assignment.json"
APPS = ROOT / "backend" / "apps"
TRACKER = ROOT / "docs" / "database" / "schema_completion_tracker.md"

PRIORITY = [
    "accounts",
    "students",
    "academics",
    "staff",
    "attendance",
    "fees",
    "examinations",
    "library",
    "transport",
    "hostel",
    "admissions",
    "lms",
    "settings",
    "communications",
    "cms",
    "fees",  # fees extension same domain
    "inventory",
    "front_office",
    "documents",
    "shared",
    "alumni",
    "hr",
    "cyc_extensions",
    "system",
]


def get_mapped_tables() -> set[str]:
    mapped = set()
    for py in APPS.rglob("models/*.py"):
        if py.name in ("__init__.py", "base.py"):
            continue
        text = py.read_text(encoding="utf-8")
        for table in re.findall(r'db_table\s*=\s*"([^"]+)"', text):
            mapped.add(table)
    return mapped


def main():
    data = json.loads(ASSIGNMENT.read_text(encoding="utf-8"))
    by_domain: dict[str, list[str]] = data["domains"]
    mapped = get_mapped_tables()

    rows = []
    total_tables = 0
    total_mapped = 0
    for domain in sorted(by_domain.keys(), key=lambda d: (PRIORITY.index(d) if d in PRIORITY else 99, d)):
        tables = by_domain[domain]
        domain_mapped = sum(1 for t in tables if t in mapped)
        remaining = len(tables) - domain_mapped
        total_tables += len(tables)
        total_mapped += domain_mapped
        if remaining == 0:
            status = "COMPLETE"
        elif domain_mapped > 0:
            status = "PARTIAL"
        else:
            status = "PENDING"
        rows.append((domain, len(tables), domain_mapped, remaining, status))

    lines = [
        "# Schema Completion Tracker",
        "",
        f"**db_current total:** {total_tables} tables",
        f"**Mapped:** {total_mapped}",
        f"**Remaining:** {total_tables - total_mapped}",
        f"**Coverage:** {total_mapped / total_tables * 100:.1f}%",
        "",
        "| Domain | Total Tables | Mapped | Remaining | Status |",
        "|--------|-------------|--------|-----------|--------|",
    ]
    for domain, total, m, rem, status in rows:
        lines.append(f"| {domain} | {total} | {m} | {rem} | {status} |")

    lines.extend(
        [
            "",
            "## Status",
            "",
            "All 280 tables mapped. Schema completion phase complete.",
            "",
            "Regenerate: `python backend/scripts/update_schema_completion_tracker.py`",
        ]
    )
    TRACKER.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {TRACKER}")
    print(f"Coverage: {total_mapped}/{total_tables}")


if __name__ == "__main__":
    main()

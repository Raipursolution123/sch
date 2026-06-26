"""
Full inventory of db_current schema for database-first architecture.
Outputs JSON + Markdown mapping documents.
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import MySQLdb

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "passwd": "",
    "db": "db_current",
}

OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "docs" / "database"

# Prefix / keyword → suggested Django app (domain grouping)
DOMAIN_RULES: list[tuple[str, str]] = [
    # examinations (includes all cbse_*)
    (r"^cbse_", "examinations"),
    (r"^exam", "examinations"),
    (r"^grade", "examinations"),
    (r"^marksheet", "examinations"),
    (r"^onlineexam", "examinations"),
    (r"^question", "examinations"),
    (r"^template_admit_card", "examinations"),
    (r"^template_marksheet", "examinations"),
    # lms (approved)
    (r"^online_course", "lms"),
    (r"^course_", "lms"),
    # admissions (approved)
    (r"^online_admission", "admissions"),
    # library
    (r"^book", "library"),
    (r"^lib", "library"),
    # students
    (r"^student", "students"),
    (r"^disable_reason", "students"),
    (r"^student_", "students"),
    # staff (staff_roles excluded — mapped to accounts above)
    (r"^staff", "staff"),
    (r"^cyc_staff", "staff"),
  (r"^conference_staff", "staff"),
    (r"^gmeet_staff", "staff"),
    # attendance
    (r"^attend", "attendance"),
    (r"^attendance", "attendance"),
    # fees / finance
    (r"^fee", "fees"),
    (r"^fees", "fees"),
    (r"^finance", "fees"),
    (r"^income", "fees"),
    (r"^expense", "fees"),
    (r"^payment", "fees"),
    (r"^gateway", "fees"),
    (r"^offline_fees", "fees"),
    # transport
    (r"^transport", "transport"),
    (r"^vehicle", "transport"),
    (r"^route", "transport"),
    (r"^pickup", "transport"),
    # hostel
    (r"^hostel", "hostel"),
    # alumni
    (r"^alumni", "alumni"),
    # academics
    (r"^class", "academics"),
    (r"^section", "academics"),
    (r"^subject", "academics"),
    (r"^lesson", "academics"),
    (r"^timetable", "academics"),
    (r"^syllabus", "academics"),
    (r"^topic", "academics"),
    (r"^homework", "academics"),
    (r"^batch", "academics"),
    (r"^department", "academics"),
    # accounts / auth
    (r"^users?$", "accounts"),
    (r"^user", "accounts"),
    (r"^role", "accounts"),
    (r"^permission", "accounts"),
    (r"^roles_permissions", "accounts"),
    (r"^staff_roles", "accounts"),
    (r"^notification_roles", "accounts"),
    (r"^captcha", "accounts"),
    # communications
    (r"^chat", "communications"),
    (r"^message", "communications"),
    (r"^notification", "communications"),
    (r"^email", "communications"),
    (r"^sms", "communications"),
    (r"^gmeet", "communications"),
    (r"^conference", "communications"),
    (r"^zoom", "communications"),
    # cms / content
    (r"^front_cms", "cms"),
    (r"^cms", "cms"),
    (r"^blog", "cms"),
    (r"^event", "cms"),
    (r"^gallery", "cms"),
    # inventory
    (r"^item", "inventory"),
    (r"^supplier", "inventory"),
    (r"^store", "inventory"),
    # settings / system
    (r"^sch_settings", "settings"),
    (r"^setting", "settings"),
    (r"^config", "settings"),
    (r"^aws_", "settings"),
    (r"^behaviour_settings", "settings"),
    (r"^custom_field", "settings"),
    (r"^language", "settings"),
    (r"^currency", "settings"),
    (r"^session", "settings"),
    (r"^school_house", "settings"),
    (r"^category$", "settings"),
    (r"^categories$", "settings"),
    # hr / leave
    (r"^leave", "hr"),
    (r"^payslip", "hr"),
    (r"^payroll", "hr"),
    # visitors / front office
    (r"^visitor", "front_office"),
    (r"^complaint", "front_office"),
    (r"^enquiry", "front_office"),
    (r"^dispatch", "front_office"),
    (r"^receive", "front_office"),
    # certificates / documents
    (r"^certificate", "documents"),
    (r"^id_card", "documents"),
    (r"^content_type", "documents"),
    # misc shared
    (r"^timeline", "shared"),
    (r"^follow_up", "shared"),
    (r"^share", "shared"),
]


def suggest_domain(table: str) -> str:
    for pattern, domain in DOMAIN_RULES:
        if re.search(pattern, table, re.IGNORECASE):
            return domain
    return "unclassified"


def get_tables(cur) -> list[str]:
    cur.execute("SHOW TABLES")
    return sorted(row[0] for row in cur.fetchall())


def get_columns(cur, table: str) -> list[dict]:
    cur.execute(f"DESCRIBE `{table}`")
    cols = []
    for row in cur.fetchall():
        cols.append(
            {
                "name": row[0],
                "type": row[1],
                "nullable": row[2] == "YES",
                "key": row[3],
                "default": row[4],
                "extra": row[5],
            }
        )
    return cols


def get_primary_key(columns: list[dict]) -> str | None:
    for col in columns:
        if col["key"] == "PRI":
            return col["name"]
    return None


def get_foreign_keys(cur, table: str) -> list[dict]:
    cur.execute(
        """
        SELECT
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME,
            CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = %s
          AND TABLE_NAME = %s
          AND REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY COLUMN_NAME
        """,
        (DB_CONFIG["db"], table),
    )
    return [
        {
            "column": row[0],
            "references_table": row[1],
            "references_column": row[2],
            "constraint": row[3],
        }
        for row in cur.fetchall()
    ]


def get_indexes(cur, table: str) -> list[dict]:
    cur.execute(f"SHOW INDEX FROM `{table}`")
    indexes: dict[str, dict] = {}
    for row in cur.fetchall():
        key_name = row[2]
        if key_name == "PRIMARY":
            continue
        if key_name not in indexes:
            indexes[key_name] = {
                "name": key_name,
                "unique": not row[1],
                "columns": [],
            }
        indexes[key_name]["columns"].append(row[4])
    return list(indexes.values())


def get_row_count(cur, table: str) -> int | None:
    try:
        cur.execute(f"SELECT COUNT(*) FROM `{table}`")
        return int(cur.fetchone()[0])
    except Exception:
        return None


def build_dependencies(fk_map: dict[str, list[dict]]) -> dict[str, dict]:
    """Tables this table depends on (outgoing FKs) and tables that depend on it."""
    referenced_by: dict[str, list[str]] = defaultdict(list)
    for table, fks in fk_map.items():
        for fk in fks:
            referenced_by[fk["references_table"]].append(table)

    deps = {}
    for table in fk_map:
        outgoing = sorted({fk["references_table"] for fk in fk_map[table]})
        incoming = sorted(referenced_by.get(table, []))
        deps[table] = {
            "depends_on": outgoing,
            "referenced_by": incoming,
        }
    return deps


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    conn = MySQLdb.connect(**DB_CONFIG)
    cur = conn.cursor()

    tables = get_tables(cur)
    inventory = []
    fk_map: dict[str, list[dict]] = {}

    for table in tables:
        columns = get_columns(cur, table)
        fks = get_foreign_keys(cur, table)
        fk_map[table] = fks
        inventory.append(
            {
                "table": table,
                "primary_key": get_primary_key(columns),
                "column_count": len(columns),
                "columns": columns,
                "foreign_keys": fks,
                "indexes": get_indexes(cur, table),
                "row_count": get_row_count(cur, table),
                "suggested_app": suggest_domain(table),
            }
        )

    dependencies = build_dependencies(fk_map)

    for item in inventory:
        table = item["table"]
        item["dependencies"] = dependencies.get(table, {"depends_on": [], "referenced_by": []})

    # Group by domain
    by_domain: dict[str, list[str]] = defaultdict(list)
    for item in inventory:
        by_domain[item["suggested_app"]].append(item["table"])

    # Write JSON inventory
    json_path = OUTPUT_DIR / "db_current_inventory.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "database": DB_CONFIG["db"],
                "table_count": len(tables),
                "tables": inventory,
                "domains": {k: sorted(v) for k, v in sorted(by_domain.items())},
            },
            f,
            indent=2,
            default=str,
        )

    # Write markdown inventory (summary table)
    md_inventory = OUTPUT_DIR / "db_current_inventory.md"
    lines = [
        "# db_current — Complete Table Inventory",
        "",
        f"**Database:** `{DB_CONFIG['db']}`  ",
        f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}  ",
        f"**Total tables:** {len(tables)}",
        "",
        "## Summary",
        "",
        "| Table | PK | Rows | Suggested App | FK Count | Depends On | Referenced By |",
        "|-------|-----|------|---------------|----------|------------|---------------|",
    ]
    for item in inventory:
        deps = item["dependencies"]
        depends = ", ".join(deps["depends_on"][:3])
        if len(deps["depends_on"]) > 3:
            depends += f" (+{len(deps['depends_on']) - 3})"
        refs = ", ".join(deps["referenced_by"][:3])
        if len(deps["referenced_by"]) > 3:
            refs += f" (+{len(deps['referenced_by']) - 3})"
        rows = item["row_count"] if item["row_count"] is not None else "N/A"
        lines.append(
            f"| `{item['table']}` | `{item['primary_key']}` | {rows} | "
            f"{item['suggested_app']} | {len(item['foreign_keys'])} | {depends or '—'} | {refs or '—'} |"
        )

    md_inventory.write_text("\n".join(lines), encoding="utf-8")

    # Write domain mapping document
    md_mapping = OUTPUT_DIR / "domain_mapping.md"
    map_lines = [
        "# db_current — Domain / App Mapping",
        "",
        "Permanent architecture reference for database-first Django app organization.",
        "",
        "**Rules:**",
        "- One Django app per business domain (not per table).",
        "- All models use exact `db_table` names from `db_current`.",
        "- Existing tables: `managed = False`.",
        "- New tables (if approved): `managed = True`.",
        "",
        f"**Total tables:** {len(tables)}  ",
        f"**Domains identified:** {len(by_domain)}",
        "",
    ]

    domain_order = [
        "accounts",
        "settings",
        "academics",
        "students",
        "staff",
        "attendance",
        "fees",
        "examinations",
        "library",
        "transport",
        "hostel",
        "hr",
        "alumni",
        "communications",
        "cms",
        "inventory",
        "front_office",
        "documents",
        "shared",
        "unclassified",
    ]

    ordered_domains = [d for d in domain_order if d in by_domain]
    ordered_domains += sorted(set(by_domain) - set(ordered_domains))

    for domain in ordered_domains:
        tables_in_domain = sorted(by_domain[domain])
        map_lines.append(f"## {domain}")
        map_lines.append("")
        map_lines.append(f"**Table count:** {len(tables_in_domain)}")
        map_lines.append("")
        for t in tables_in_domain:
            item = next(i for i in inventory if i["table"] == t)
            fk_count = len(item["foreign_keys"])
            rows = item["row_count"] if item["row_count"] is not None else "?"
            map_lines.append(f"- `{t}` → **{domain}** _(rows: {rows}, FKs: {fk_count})_")
        map_lines.append("")

    # Cross-reference examples section
    map_lines.extend(
        [
            "## Quick Reference Examples",
            "",
            "| Table | Domain |",
            "|-------|--------|",
            "| `books` | library |",
            "| `book_issues` | library |",
            "| `cbse_exams` | examinations |",
            "| `cbse_exam_students` | examinations |",
            "| `students` | students |",
            "| `staff` | staff |",
            "| `users` | accounts |",
            "| `roles` | accounts |",
            "| `roles_permissions` | accounts |",
            "",
            "## Unclassified Tables",
            "",
            "Tables that need manual domain assignment during implementation:",
            "",
        ]
    )
    for t in sorted(by_domain.get("unclassified", [])):
        map_lines.append(f"- `{t}`")

    md_mapping.write_text("\n".join(map_lines), encoding="utf-8")

    print(f"Tables inventoried: {len(tables)}")
    print(f"Domains: {len(by_domain)}")
    for domain in ordered_domains:
        print(f"  {domain}: {len(by_domain[domain])}")
    print(f"Wrote {json_path}")
    print(f"Wrote {md_inventory}")
    print(f"Wrote {md_mapping}")

    conn.close()


if __name__ == "__main__":
    main()

"""Cross-domain dependency report from db_current FK metadata."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import MySQLdb

DOMAINS = {
    "accounts": [
        "users",
        "roles",
        "roles_permissions",
        "staff_roles",
        "permission_category",
        "permission_group",
        "permission_student",
        "users_authentication",
        "userlog",
        "captcha",
        "notification_roles",
    ],
    "students": [],  # filled from pattern
    "academics": ["sessions", "classes", "sections", "class_sections", "subjects"],
    "staff": [],  # filled from inventory
    "attendance": ["attendence_type"],
    "fees": [],
    "examinations": [],
    "library": ["books", "book_issues", "libarary_members"],
    "transport": [],
    "admissions": [],
    "lms": [],
    "settings": ["sch_settings", "custom_fields", "languages", "school_houses"],
}

DOMAIN_RULES = [
    ("student", "students"),
    ("staff", "staff"),
    ("cbse_", "examinations"),
    ("exam", "examinations"),
    ("fee", "fees"),
    ("fees", "fees"),
    ("book", "library"),
    ("transport", "transport"),
    ("vehicle", "transport"),
    ("route", "transport"),
    ("online_admission", "admissions"),
    ("online_course", "lms"),
    ("course_", "lms"),
    ("hostel", "hostel"),
    ("attend", "attendance"),
]


def classify(table: str) -> str:
    if table in DOMAINS.get("accounts", []):
        return "accounts"
    for prefix, domain in DOMAIN_RULES:
        if table.startswith(prefix) or table == prefix.rstrip("_"):
            return domain
    if table in DOMAINS.get("academics", []):
        return "academics"
    return "other"


def main():
    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()
    cur.execute("SHOW TABLES")
    all_tables = [r[0] for r in cur.fetchall()]

    table_domain = {t: classify(t) for t in all_tables}

    # Load staff tables from inventory if exists
    staff_inv = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "staff" / "staff_domain_inventory.json"
    if staff_inv.exists():
        staff_data = json.loads(staff_inv.read_text(encoding="utf-8"))
        for item in staff_data["tables"]:
            table_domain[item["table"]] = "staff"

    attendance_inv = (
        Path(__file__).resolve().parent.parent.parent
        / "docs"
        / "database"
        / "attendance"
        / "attendance_domain_inventory.json"
    )
    if attendance_inv.exists():
        attendance_data = json.loads(attendance_inv.read_text(encoding="utf-8"))
        for item in attendance_data["tables"]:
            table_domain[item["table"]] = "attendance"

    fees_inv = (
        Path(__file__).resolve().parent.parent.parent
        / "docs"
        / "database"
        / "fees"
        / "fees_domain_inventory.json"
    )
    if fees_inv.exists():
        fees_data = json.loads(fees_inv.read_text(encoding="utf-8"))
        for item in fees_data["tables"]:
            table_domain[item["table"]] = "fees"

    exams_inv = (
        Path(__file__).resolve().parent.parent.parent
        / "docs"
        / "database"
        / "examinations"
        / "examinations_domain_inventory.json"
    )
    if exams_inv.exists():
        exams_data = json.loads(exams_inv.read_text(encoding="utf-8"))
        for item in exams_data["tables"]:
            table_domain[item["table"]] = "examinations"

    domain_tables: dict[str, set[str]] = defaultdict(set)
    for t, d in table_domain.items():
        domain_tables[d].add(t)

    # Build FK graph
    cur.execute(
        """
        SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'db_current' AND REFERENCED_TABLE_NAME IS NOT NULL
        """
    )
    depends_on: dict[str, set[str]] = defaultdict(set)
    referenced_by: dict[str, set[str]] = defaultdict(set)
    cross_domain: list[dict] = []

    for row in cur.fetchall():
        src, col, ref_table, ref_col = row
        depends_on[src].add(ref_table)
        referenced_by[ref_table].add(src)
        sd = table_domain.get(src, "other")
        rd = table_domain.get(ref_table, "other")
        if sd != rd:
            cross_domain.append(
                {
                    "from_domain": sd,
                    "from_table": src,
                    "column": col,
                    "to_domain": rd,
                    "to_table": ref_table,
                }
            )

    target_domains = [
        "accounts",
        "students",
        "academics",
        "staff",
        "attendance",
        "fees",
        "examinations",
        "library",
        "transport",
        "admissions",
        "lms",
    ]

    report = {"domains": {}, "implementation_order": [], "cross_domain_edges": cross_domain[:200]}

    for domain in target_domains:
        tables = sorted(domain_tables.get(domain, set()))
        ext_depends = set()
        ext_refs = set()
        for t in tables:
            for dep in depends_on.get(t, set()):
                if table_domain.get(dep, "other") != domain:
                    ext_depends.add(dep)
            for ref in referenced_by.get(t, set()):
                if table_domain.get(ref, "other") != domain:
                    ext_refs.add(ref)
        report["domains"][domain] = {
            "table_count": len(tables),
            "tables": tables,
            "depends_on_external": sorted(ext_depends),
            "referenced_by_external": sorted(ext_refs),
        }

    report["implementation_order"] = [
        "accounts",
        "settings (sch_settings, sessions already in academics)",
        "academics (core done)",
        "staff (done)",
        "students (done)",
        "attendance (done)",
        "fees (done)",
        "examinations (done)",
        "library",
        "transport",
        "hostel",
        "admissions",
        "lms",
        "communications / cms / cyc_extensions",
    ]

    out = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "domain_dependency_report.md"
    lines = [
        "# Cross-Domain Dependency Report",
        "",
        "**Source:** `db_current` foreign key metadata + domain classification",
        "",
        "## Implementation order (recommended)",
        "",
    ]
    for i, step in enumerate(report["implementation_order"], 1):
        lines.append(f"{i}. {step}")

    lines.extend(["", "## Domain summary", ""])
    for domain in target_domains:
        info = report["domains"][domain]
        lines.append(f"### {domain}")
        lines.append("")
        lines.append(f"**Tables:** {info['table_count']}")
        if info["depends_on_external"]:
            lines.append(f"**Depends on:** {', '.join(f'`{t}`' for t in info['depends_on_external'][:12])}")
            if len(info["depends_on_external"]) > 12:
                lines.append(f" (+{len(info['depends_on_external']) - 12} more)")
        if info["referenced_by_external"]:
            lines.append(f"**Referenced by:** {', '.join(f'`{t}`' for t in info['referenced_by_external'][:12])}")
            if len(info["referenced_by_external"]) > 12:
                lines.append(f" (+{len(info['referenced_by_external']) - 12} more)")
        lines.append("")

    (out).write_text("\n".join(lines), encoding="utf-8")
    out_json = out.with_suffix(".json")
    out_json.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Wrote {out}")
    conn.close()


if __name__ == "__main__":
    main()

"""Introspect all staff-related tables from db_current."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import MySQLdb

OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "staff"

# Tables confirmed via SHOW TABLES LIKE patterns; staff_roles lives in accounts app.
STAFF_TABLES = [
    "staff",
    "staff_attendance",
    "staff_attendance_type",
    "staff_designation",
    "staff_id_card",
    "staff_leave_details",
    "staff_leave_request",
    "staff_payroll",
    "staff_payslip",
    "staff_rating",
    "staff_timeline",
    "conference_staff",
    "gmeet_staff",
    "cyc_staff_payroll",
    "cyc_staff_payroll_increment",
    "department",
]


def mysql_type_to_django(mysql_type: str) -> str:
    t = mysql_type.lower()
    if t.startswith("int(") or t.startswith("tinyint"):
        return "IntegerField"
    if t.startswith("bigint"):
        return "BigIntegerField"
    if t.startswith("varchar"):
        m = re.search(r"\((\d+)\)", t)
        return f"CharField(max_length={m.group(1) if m else 255})"
    if t in ("text", "longtext", "mediumtext", "tinytext"):
        return "TextField"
    if t == "date":
        return "DateField"
    if t.startswith("timestamp") or t.startswith("datetime"):
        return "DateTimeField"
    if t.startswith("float") or t.startswith("double"):
        return "FloatField"
    if t.startswith("decimal"):
        return "DecimalField"
    return f"UNKNOWN({mysql_type})"


def discover_staff_tables(cur) -> list[str]:
    patterns = ["staff%", "department", "conference_staff", "gmeet_staff", "cyc_staff%"]
    found: set[str] = set()
    for pattern in patterns:
        cur.execute(f"SHOW TABLES LIKE '{pattern}'")
        for row in cur.fetchall():
            table = row[0]
            if table == "staff_roles":
                continue  # accounts domain
            found.add(table)
    return sorted(found)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()

    tables = discover_staff_tables(cur)
    inventory = []
    fk_map: dict[str, list[dict]] = {}

    for table in tables:
        cur.execute(f"DESCRIBE `{table}`")
        columns = []
        for r in cur.fetchall():
            columns.append(
                {
                    "name": r[0],
                    "mysql_type": r[1],
                    "nullable": r[2] == "YES",
                    "key": r[3],
                    "default": r[4],
                    "extra": r[5],
                    "suggested_django_field": mysql_type_to_django(r[1]),
                }
            )
        cur.execute(
            """
            SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME, CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'db_current' AND TABLE_NAME = %s
              AND REFERENCED_TABLE_NAME IS NOT NULL
            """,
            (table,),
        )
        fks = [
            {
                "column": r[0],
                "references_table": r[1],
                "references_column": r[2],
                "constraint": r[3],
            }
            for r in cur.fetchall()
        ]
        fk_map[table] = fks

        cur.execute(f"SELECT COUNT(*) FROM `{table}`")
        row_count = cur.fetchone()[0]
        cur.execute(f"SHOW CREATE TABLE `{table}`")
        create_sql = cur.fetchone()[1]

        inventory.append(
            {
                "table": table,
                "row_count": row_count,
                "primary_key": next((c["name"] for c in columns if c["key"] == "PRI"), None),
                "column_count": len(columns),
                "columns": columns,
                "foreign_keys": fks,
                "depends_on": sorted({fk["references_table"] for fk in fks}),
                "create_sql": create_sql,
            }
        )

    referenced_by: dict[str, list[dict]] = defaultdict(list)
    for table, fks in fk_map.items():
        for fk in fks:
            referenced_by[fk["references_table"]].append(
                {"table": table, "column": fk["column"]}
            )

    for item in inventory:
        item["referenced_by"] = sorted(
            referenced_by.get(item["table"], []), key=lambda x: x["table"]
        )

    # Ownership: staff app vs cyc extensions vs communications
    ownership = {}
    for item in inventory:
        t = item["table"]
        if t.startswith("cyc_"):
            ownership[t] = "staff (cyc extension tables; same app for now)"
        elif t in ("conference_staff", "gmeet_staff"):
            ownership[t] = "staff (communications bridge; colocated in staff app)"
        elif t == "department":
            ownership[t] = "staff"
        else:
            ownership[t] = "staff"

    payload = {
        "table_count": len(inventory),
        "tables": inventory,
        "ownership": ownership,
        "excluded": {
            "staff_roles": "accounts app (RBAC mapping staff_id + role_id)",
        },
    }
    (OUTPUT_DIR / "staff_domain_inventory.json").write_text(
        json.dumps(payload, indent=2, default=str), encoding="utf-8"
    )

    # Markdown summary
    lines = [
        "# Staff Domain — Table Inventory",
        "",
        f"**Tables:** {len(inventory)}",
        "",
        "| Table | PK | Rows | Cols | FKs | Depends On |",
        "|-------|-----|------|------|-----|------------|",
    ]
    for item in inventory:
        deps = ", ".join(item["depends_on"][:3])
        if len(item["depends_on"]) > 3:
            deps += f" (+{len(item['depends_on']) - 3})"
        lines.append(
            f"| `{item['table']}` | `{item['primary_key']}` | {item['row_count']} | "
            f"{item['column_count']} | {len(item['foreign_keys'])} | {deps or '—'} |"
        )

    lines.extend(["", "## Foreign Keys", ""])
    for item in inventory:
        if item["foreign_keys"]:
            lines.append(f"### `{item['table']}`")
            for fk in item["foreign_keys"]:
                lines.append(
                    f"- `{fk['column']}` → `{fk['references_table']}.{fk['references_column']}`"
                )
            lines.append("")

    (OUTPUT_DIR / "staff_domain_analysis.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Staff tables: {len(inventory)}")
    for item in inventory:
        print(f"  {item['table']}: {item['row_count']} rows, {len(item['foreign_keys'])} FKs")
    print(f"Wrote {OUTPUT_DIR}")
    conn.close()


if __name__ == "__main__":
    main()

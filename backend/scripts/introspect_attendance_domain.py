"""Introspect attendance domain tables from db_current."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import MySQLdb

OUTPUT_DIR = (
    Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "attendance"
)

# Core attendance lookup table (legacy spelling preserved).
ATTENDANCE_TABLES = ["attendence_type"]

# Student/staff attendance fact tables live in other apps (see excluded).
EXCLUDED = {
    "student_attendences": "students app (student attendance records)",
    "student_attendences_hostel": "students app",
    "student_attendences_transport": "students app",
    "student_subject_attendances": "students app",
    "staff_attendance": "staff app",
    "staff_attendance_type": "staff app",
    "cyc_ptm_attendance": "cyc_extensions (unclassified; not attendance core)",
}


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


def discover_attendance_tables(cur) -> list[str]:
    patterns = ["attendence%", "attendance%"]
    found: set[str] = set()
    for pattern in patterns:
        cur.execute(f"SHOW TABLES LIKE '{pattern}'")
        for row in cur.fetchall():
            table = row[0]
            if table in EXCLUDED:
                continue
            found.add(table)
    for table in ATTENDANCE_TABLES:
        found.add(table)
    return sorted(found)


def introspect_table(cur, table: str) -> dict:
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
    cur.execute(f"SELECT COUNT(*) FROM `{table}`")
    row_count = cur.fetchone()[0]
    cur.execute(f"SHOW CREATE TABLE `{table}`")
    create_sql = cur.fetchone()[1]
    return {
        "table": table,
        "row_count": row_count,
        "primary_key": next((c["name"] for c in columns if c["key"] == "PRI"), None),
        "column_count": len(columns),
        "columns": columns,
        "foreign_keys": fks,
        "depends_on": sorted({fk["references_table"] for fk in fks}),
        "create_sql": create_sql,
    }


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()

    tables = discover_attendance_tables(cur)
    inventory = []
    fk_map: dict[str, list[dict]] = {}

    for table in tables:
        item = introspect_table(cur, table)
        fk_map[table] = item["foreign_keys"]
        inventory.append(item)

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

    # Inbound FK references from information_schema
    cur.execute(
        """
        SELECT TABLE_NAME, COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'db_current'
          AND REFERENCED_TABLE_NAME = 'attendence_type'
        """
    )
    inbound_fks = [{"table": r[0], "column": r[1]} for r in cur.fetchall()]
    for item in inventory:
        if item["table"] == "attendence_type":
            db_refs = {r["table"] for r in item["referenced_by"]}
            for ref in inbound_fks:
                if ref["table"] not in db_refs:
                    item["referenced_by"].append(ref)
            item["referenced_by"] = sorted(item["referenced_by"], key=lambda x: x["table"])

    ownership = {item["table"]: "attendance" for item in inventory}

    payload = {
        "table_count": len(inventory),
        "tables": inventory,
        "ownership": ownership,
        "excluded": EXCLUDED,
    }
    (OUTPUT_DIR / "attendance_domain_inventory.json").write_text(
        json.dumps(payload, indent=2, default=str), encoding="utf-8"
    )

    lines = [
        "# Attendance Domain — Table Inventory",
        "",
        f"**Tables in `apps.attendance`:** {len(inventory)}",
        "",
        "| Table | PK | Rows | Cols | FKs | Depends On |",
        "|-------|-----|------|------|-----|------------|",
    ]
    for item in inventory:
        deps = ", ".join(item["depends_on"]) or "—"
        lines.append(
            f"| `{item['table']}` | `{item['primary_key']}` | {item['row_count']} | "
            f"{item['column_count']} | {len(item['foreign_keys'])} | {deps} |"
        )

    lines.extend(["", "## Excluded (other apps)", ""])
    for table, reason in sorted(EXCLUDED.items()):
        lines.append(f"- `{table}` → {reason}")

    lines.extend(["", "## Referenced by (DB FKs)", ""])
    for item in inventory:
        if item["referenced_by"]:
            lines.append(f"### `{item['table']}`")
            for ref in item["referenced_by"]:
                lines.append(f"- `{ref['table']}.{ref['column']}`")
            lines.append("")

    (OUTPUT_DIR / "attendance_domain_analysis.md").write_text(
        "\n".join(lines), encoding="utf-8"
    )
    print(f"Attendance tables: {len(inventory)}")
    for item in inventory:
        print(f"  {item['table']}: {item['row_count']} rows")
    print(f"Wrote {OUTPUT_DIR}")
    conn.close()


if __name__ == "__main__":
    main()

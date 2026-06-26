"""Introspect students domain tables from db_current."""
from __future__ import annotations

import json
import re
from pathlib import Path

import MySQLdb

STUDENT_TABLES = [
    "students",
    "student_session",
    "student_doc",
    "student_timeline",
    "student_applyleave",
    "student_attendences",
    "student_attendences_hostel",
    "student_attendences_transport",
    "student_behaviour",
    "student_edit_fields",
    "student_fees",
    "student_fees_deposite",
    "student_fees_discounts",
    "student_fees_master",
    "student_fees_processing",
    "student_transport_fees",
    "student_subject_attendances",
    "disable_reason",
    "student_hostel",
    "student_room",
    "student_vehicle",
    "online_admissions",
    "online_admission_fields",
    "online_admission_custom_field_value",
    "online_admission_payment",
]

OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "students"


def mysql_type_to_django(mysql_type: str) -> str:
    t = mysql_type.lower()
    if t.startswith("int("):
        return "IntegerField"
    if t.startswith("bigint"):
        return "BigIntegerField"
    if t.startswith("varchar"):
        m = re.search(r"\((\d+)\)", t)
        return f"CharField(max_length={m.group(1) if m else 255})"
    if t.startswith("text") or t.startswith("tinytext"):
        return "TextField"
    if t == "date":
        return "DateField"
    if t.startswith("timestamp") or t.startswith("datetime"):
        return "DateTimeField"
    if t.startswith("double") or t.startswith("float"):
        return "FloatField"
    if t.startswith("decimal"):
        return "DecimalField"
    return f"UNKNOWN({mysql_type})"


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()

    cur.execute("SHOW TABLES LIKE 'student%'")
    all_student_pattern = sorted(r[0] for r in cur.fetchall())
    cur.execute("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='db_current' AND TABLE_NAME IN ('disable_reason', 'online_admissions', 'online_admission_fields', 'online_admission_custom_field_value', 'online_admission_payment')")
    extra = [r[0] for r in cur.fetchall()]
    domain_tables = sorted(set(all_student_pattern + extra + ["students", "disable_reason"]))

    inventory = []
    for table in domain_tables:
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

        inventory.append(
            {
                "table": table,
                "row_count": row_count,
                "primary_key": next((c["name"] for c in columns if c["key"] == "PRI"), None),
                "columns": columns,
                "foreign_keys": fks,
                "create_sql": create_sql,
            }
        )

    with open(OUTPUT_DIR / "students_domain_inventory.json", "w", encoding="utf-8") as f:
        json.dump(
            {"table_count": len(inventory), "tables": inventory},
            f,
            indent=2,
            default=str,
        )

    # Markdown analysis
    lines = [
        "# Students Domain — Database-First Analysis",
        "",
        f"**Tables in domain:** {len(inventory)}",
        "",
        "## Table Inventory",
        "",
        "| Table | PK | Rows | Columns | FKs |",
        "|-------|-----|------|---------|-----|",
    ]
    for item in inventory:
        lines.append(
            f"| `{item['table']}` | `{item['primary_key']}` | {item['row_count']} | "
            f"{len(item['columns'])} | {len(item['foreign_keys'])} |"
        )

    lines.extend(["", "## Foreign Key Relationships", ""])
    for item in inventory:
        if item["foreign_keys"]:
            lines.append(f"### `{item['table']}`")
            for fk in item["foreign_keys"]:
                lines.append(
                    f"- `{fk['column']}` → `{fk['references_table']}.{fk['references_column']}`"
                )
            lines.append("")

    (OUTPUT_DIR / "students_domain_analysis.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Students domain tables: {len(inventory)}")
    print(f"Wrote {OUTPUT_DIR}")
    conn.close()


if __name__ == "__main__":
    main()

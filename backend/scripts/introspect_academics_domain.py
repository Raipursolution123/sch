"""Introspect academics core tables from db_current."""
from __future__ import annotations

import json
import re
from pathlib import Path

import MySQLdb

TABLES = ["sessions", "classes", "sections", "class_sections", "subjects"]
OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "academics"


def mysql_type_to_django(mysql_type: str) -> str:
    t = mysql_type.lower()
    if t.startswith("int("):
        return "IntegerField"
    if t.startswith("bigint"):
        return "BigIntegerField"
    if t.startswith("varchar"):
        m = re.search(r"\((\d+)\)", t)
        return f"CharField(max_length={m.group(1) if m else 255})"
    if t in ("text", "longtext", "tinytext"):
        return "TextField"
    if t == "date":
        return "DateField"
    if t.startswith("timestamp") or t.startswith("datetime"):
        return "DateTimeField"
    if t.startswith("float") or t.startswith("double"):
        return "FloatField"
    return f"UNKNOWN({mysql_type})"


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()

    inventory = []
    for table in TABLES:
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

        depends_on = sorted({fk["references_table"] for fk in fks})
        inventory.append(
            {
                "table": table,
                "row_count": row_count,
                "primary_key": next((c["name"] for c in columns if c["key"] == "PRI"), None),
                "columns": columns,
                "foreign_keys": fks,
                "depends_on": depends_on,
                "create_sql": create_sql,
            }
        )

    # Referenced-by from student_session and others
    referenced_by = {t: [] for t in TABLES}
    placeholders = ", ".join(["%s"] * len(TABLES))
    cur.execute(
        f"""
        SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'db_current'
          AND REFERENCED_TABLE_NAME IN ({placeholders})
        """,
        TABLES,
    )
    for row in cur.fetchall():
        ref = row[2]
        if ref in referenced_by:
            referenced_by[ref].append({"table": row[0], "column": row[1]})

    for item in inventory:
        item["referenced_by"] = sorted(referenced_by.get(item["table"], []), key=lambda x: x["table"])

    payload = {"table_count": len(inventory), "tables": inventory}
    (OUTPUT_DIR / "academics_domain_inventory.json").write_text(
        json.dumps(payload, indent=2, default=str), encoding="utf-8"
    )

    lines = [
        "# Academics Domain — Database-First Analysis",
        "",
        f"**Core tables:** {len(TABLES)}",
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

    lines.extend(["", "## Foreign Keys", ""])
    for item in inventory:
        if item["foreign_keys"]:
            lines.append(f"### `{item['table']}`")
            for fk in item["foreign_keys"]:
                lines.append(
                    f"- `{fk['column']}` → `{fk['references_table']}.{fk['references_column']}`"
                )
            lines.append("")

    lines.extend(["", "## Referenced By (sample)", ""])
    for item in inventory:
        if item["referenced_by"]:
            lines.append(f"### `{item['table']}`")
            for ref in item["referenced_by"][:15]:
                lines.append(f"- `{ref['table']}.{ref['column']}`")
            if len(item["referenced_by"]) > 15:
                lines.append(f"- ... +{len(item['referenced_by']) - 15} more")
            lines.append("")

    (OUTPUT_DIR / "academics_domain_analysis.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote academics inventory ({len(inventory)} tables)")
    conn.close()


if __name__ == "__main__":
    main()

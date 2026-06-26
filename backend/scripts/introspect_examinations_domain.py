"""Introspect examinations domain tables from db_current."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import MySQLdb

OUTPUT_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "docs"
    / "database"
    / "examinations"
)

EXCLUDED = {
    "cyc_advance_exam_group": "cyc_extensions (not in examinations core)",
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
        m = re.search(r"\((\d+),(\d+)\)", t)
        if m:
            return f"DecimalField(max_digits={m.group(1)}, decimal_places={m.group(2)})"
        return "DecimalField"
    if t.startswith("enum"):
        return "CharField"
    return f"UNKNOWN({mysql_type})"


def discover_examination_tables(cur) -> list[str]:
    patterns = ["cbse_%", "exam%", "onlineexam%"]
    found: set[str] = set()
    for pattern in patterns:
        cur.execute(f"SHOW TABLES LIKE '{pattern}'")
        for row in cur.fetchall():
            table = row[0]
            if table in EXCLUDED:
                continue
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

    tables = discover_examination_tables(cur)
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

    exam_table_set = set(tables)
    cur.execute(
        """
        SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'db_current'
          AND REFERENCED_TABLE_NAME IS NOT NULL
        """
    )
    for row in cur.fetchall():
        src, col, ref = row
        if ref in exam_table_set and src not in exam_table_set:
            referenced_by[ref].append({"table": src, "column": col})

    for item in inventory:
        seen = set()
        unique_refs = []
        for ref in referenced_by.get(item["table"], []):
            key = (ref["table"], ref["column"])
            if key not in seen:
                seen.add(key)
                unique_refs.append(ref)
        item["referenced_by"] = sorted(unique_refs, key=lambda x: (x["table"], x["column"]))

    ownership = {t: "examinations" for t in tables}

    payload = {
        "table_count": len(inventory),
        "tables": inventory,
        "ownership": ownership,
        "excluded": EXCLUDED,
        "subsystems": {
            "cbse_exam": [t for t in tables if t.startswith("cbse_exam")],
            "cbse_template": [
                t
                for t in tables
                if t.startswith("cbse_template") or t.startswith("cbse_terms")
                or t.startswith("cbse_marksheet")
            ],
            "cbse_observation": [
                t for t in tables if "observation" in t and t.startswith("cbse_")
            ],
            "cbse_marks_ranks": [
                t
                for t in tables
                if t.startswith("cbse_student_")
            ],
            "legacy_exam_groups": [t for t in tables if t.startswith("exam_group") or t == "exam_groups"],
            "legacy_exams": [t for t in tables if t in ("exams", "exam_schedules")],
            "online_exam": [t for t in tables if t.startswith("onlineexam")],
        },
    }
    (OUTPUT_DIR / "examinations_domain_inventory.json").write_text(
        json.dumps(payload, indent=2, default=str), encoding="utf-8"
    )

    lines = [
        "# Examinations Domain — Table Inventory",
        "",
        f"**Tables in `apps.examinations`:** {len(inventory)}",
        "",
        "| Table | PK | Rows | Cols | FKs | Depends On |",
        "|-------|-----|------|------|-----|------------|",
    ]
    for item in inventory:
        deps = ", ".join(f"`{d}`" for d in item["depends_on"][:3]) or "—"
        if len(item["depends_on"]) > 3:
            deps += f" (+{len(item['depends_on']) - 3})"
        lines.append(
            f"| `{item['table']}` | `{item['primary_key']}` | {item['row_count']} | "
            f"{item['column_count']} | {len(item['foreign_keys'])} | {deps} |"
        )

    lines.extend(["", "## Subsystems", ""])
    for name, tbls in payload["subsystems"].items():
        lines.append(f"- **{name}** ({len(tbls)}): {', '.join(f'`{t}`' for t in tbls)}")

    (OUTPUT_DIR / "examinations_domain_analysis.md").write_text(
        "\n".join(lines), encoding="utf-8"
    )
    print(f"Examination tables: {len(inventory)}")
    for item in inventory:
        print(f"  {item['table']}: {item['row_count']} rows, {len(item['foreign_keys'])} FKs")
    print(f"Wrote {OUTPUT_DIR}")
    conn.close()


if __name__ == "__main__":
    main()

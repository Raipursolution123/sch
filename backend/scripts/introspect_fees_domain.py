"""Introspect fees domain tables from db_current."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import MySQLdb

OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "fees"

FEES_TABLES = [
    "fee_groups",
    "fee_groups_feetype",
    "fee_receipt_no",
    "fee_session_groups",
    "feemasters",
    "fees_discounts",
    "fees_reminder",
    "feetype",
]

EXCLUDED = {
    "student_fees": "students app (student fee assignments)",
    "student_fees_deposite": "students app",
    "student_fees_discounts": "students app",
    "student_fees_master": "students app",
    "student_fees_processing": "students app",
    "student_transport_fees": "students app",
    "offline_fees_payments": "fees extension (payment processing; future phase)",
    "gateway_ins": "fees extension (payment gateway)",
    "gateway_ins_response": "fees extension",
    "payment_settings": "fees extension (settings)",
    "expense_head": "fees extension (accounting)",
    "expenses": "fees extension",
    "income": "fees extension",
    "income_head": "fees extension",
    "transport_feemaster": "transport app",
    "cyc_fee_head_ledger": "cyc_extensions",
    "cyc_scheme_and_scholarship_feetype": "cyc_extensions",
    "cyc_student_addon_fee": "cyc_extensions",
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
    return f"UNKNOWN({mysql_type})"


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

    inventory = []
    fk_map: dict[str, list[dict]] = {}

    for table in FEES_TABLES:
        item = introspect_table(cur, table)
        fk_map[table] = item["foreign_keys"]
        inventory.append(item)

    referenced_by: dict[str, list[dict]] = defaultdict(list)
    for table, fks in fk_map.items():
        for fk in fks:
            referenced_by[fk["references_table"]].append(
                {"table": table, "column": fk["column"]}
            )

    cur.execute(
        """
        SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'db_current'
          AND REFERENCED_TABLE_NAME IN (%s)
        """
        % ",".join(f"'{t}'" for t in FEES_TABLES)
    )
    for row in cur.fetchall():
        ref_table, col, target = row
        referenced_by[target].append({"table": ref_table, "column": col})

    for item in inventory:
        seen = set()
        unique_refs = []
        for ref in referenced_by.get(item["table"], []):
            key = (ref["table"], ref["column"])
            if key not in seen:
                seen.add(key)
                unique_refs.append(ref)
        item["referenced_by"] = sorted(unique_refs, key=lambda x: (x["table"], x["column"]))

    ownership = {t: "fees" for t in FEES_TABLES}

    payload = {
        "table_count": len(inventory),
        "tables": inventory,
        "ownership": ownership,
        "excluded": EXCLUDED,
    }
    (OUTPUT_DIR / "fees_domain_inventory.json").write_text(
        json.dumps(payload, indent=2, default=str), encoding="utf-8"
    )

    lines = [
        "# Fees Domain — Table Inventory",
        "",
        f"**Tables in `apps.fees`:** {len(inventory)}",
        "",
        "| Table | PK | Rows | Cols | FKs | Depends On |",
        "|-------|-----|------|------|-----|------------|",
    ]
    for item in inventory:
        deps = ", ".join(f"`{d}`" for d in item["depends_on"][:4]) or "—"
        if len(item["depends_on"]) > 4:
            deps += f" (+{len(item['depends_on']) - 4})"
        lines.append(
            f"| `{item['table']}` | `{item['primary_key']}` | {item['row_count']} | "
            f"{item['column_count']} | {len(item['foreign_keys'])} | {deps} |"
        )

    lines.extend(["", "## Excluded (other apps / future phases)", ""])
    for table, reason in sorted(EXCLUDED.items()):
        lines.append(f"- `{table}` → {reason}")

    lines.extend(["", "## Foreign Keys", ""])
    for item in inventory:
        if item["foreign_keys"]:
            lines.append(f"### `{item['table']}`")
            for fk in item["foreign_keys"]:
                lines.append(
                    f"- `{fk['column']}` → `{fk['references_table']}.{fk['references_column']}`"
                )
            lines.append("")

    lines.extend(["", "## Referenced By", ""])
    for item in inventory:
        if item["referenced_by"]:
            lines.append(f"### `{item['table']}`")
            for ref in item["referenced_by"]:
                lines.append(f"- `{ref['table']}.{ref['column']}`")
            lines.append("")

    (OUTPUT_DIR / "fees_domain_analysis.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Fees tables: {len(inventory)}")
    for item in inventory:
        print(f"  {item['table']}: {item['row_count']} rows, {len(item['foreign_keys'])} FKs")
    print(f"Wrote {OUTPUT_DIR}")
    conn.close()


if __name__ == "__main__":
    main()

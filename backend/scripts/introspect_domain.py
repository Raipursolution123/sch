"""Introspect tables for a domain from master_domain_assignment.json."""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

import MySQLdb

ROOT = Path(__file__).resolve().parent.parent.parent
ASSIGNMENT = ROOT / "docs" / "database" / "master_domain_assignment.json"


def mysql_type_to_django(mysql_type: str) -> str:
    t = mysql_type.lower()
    if re.match(r"int\(\d+\)", t) or t.startswith("tinyint"):
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
    if t == "time":
        return "TimeField"
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
    parser = argparse.ArgumentParser()
    parser.add_argument("domain", help="Domain name from master assignment")
    args = parser.parse_args()
    domain = args.domain

    data = json.loads(ASSIGNMENT.read_text(encoding="utf-8"))
    tables = data["domains"].get(domain)
    if not tables:
        raise SystemExit(f"Unknown domain: {domain}")

    app = data["tables"][tables[0]]["app"]
    out_dir = ROOT / "docs" / "database" / domain
    out_dir.mkdir(parents=True, exist_ok=True)

    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()

    inventory = []
    fk_map: dict[str, list] = {}
    for table in tables:
        item = introspect_table(cur, table)
        fk_map[table] = item["foreign_keys"]
        inventory.append(item)

    referenced_by: dict[str, list] = defaultdict(list)
    for table, fks in fk_map.items():
        for fk in fks:
            referenced_by[fk["references_table"]].append(
                {"table": table, "column": fk["column"]}
            )

    domain_set = set(tables)
    cur.execute(
        """
        SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'db_current' AND REFERENCED_TABLE_NAME IS NOT NULL
        """
    )
    for src, col, ref in cur.fetchall():
        if ref in domain_set and src not in domain_set:
            referenced_by[ref].append({"table": src, "column": col})

    for item in inventory:
        seen = set()
        refs = []
        for ref in referenced_by.get(item["table"], []):
            key = (ref["table"], ref["column"])
            if key not in seen:
                seen.add(key)
                refs.append(ref)
        item["referenced_by"] = sorted(refs, key=lambda x: (x["table"], x["column"]))

    payload = {
        "domain": domain,
        "app": app,
        "table_count": len(inventory),
        "tables": inventory,
    }
    (out_dir / f"{domain}_domain_inventory.json").write_text(
        json.dumps(payload, indent=2, default=str), encoding="utf-8"
    )
    print(f"{domain}: {len(inventory)} tables -> {out_dir}")
    conn.close()


if __name__ == "__main__":
    main()

"""Introspect db_current schema for model compatibility review."""
import json
import sys

import MySQLdb

TABLES_OF_INTEREST = [
    "users",
    "roles",
    "permissions",
    "role_permissions",
    "user_roles",
    "staff",
    "students",
    "sch_settings",
]


def main():
    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()

    print("=== PATTERN SEARCH ===")
    for pattern in ["%user%", "%role%", "%permission%", "%staff%", "%login%"]:
        cur.execute(f"SHOW TABLES LIKE '{pattern}'")
        rows = cur.fetchall()
        print(f"\n{pattern} ({len(rows)}):")
        for row in rows:
            print(f"  {row[0]}")

    print("\n=== TABLES OF INTEREST ===")
    cur.execute("SHOW TABLES")
    all_tables = {row[0] for row in cur.fetchall()}

    schema = {}
    for table in TABLES_OF_INTEREST:
        if table not in all_tables:
            print(f"\nMISSING: {table}")
            continue
        cur.execute(f"SHOW CREATE TABLE `{table}`")
        create_sql = cur.fetchone()[1]
        cur.execute(f"DESCRIBE `{table}`")
        columns = []
        for col in cur.fetchall():
            columns.append(
                {
                    "field": col[0],
                    "type": col[1],
                    "null": col[2],
                    "key": col[3],
                    "default": col[4],
                    "extra": col[5],
                }
            )
        schema[table] = {"columns": columns, "create_sql": create_sql}
        print(f"\n--- {table} ---")
        for col in columns:
            print(
                f"  {col['field']:30} {col['type']:25} "
                f"NULL={col['null']} KEY={col['key']} DEFAULT={col['default']} EXTRA={col['extra']}"
            )

    out = "scripts/db_current_schema_snapshot.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2, default=str)
    print(f"\nWrote {out}")
    conn.close()


if __name__ == "__main__":
    main()

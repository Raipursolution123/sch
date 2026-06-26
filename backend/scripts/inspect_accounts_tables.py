"""Introspect additional db_current tables for accounts domain."""
import json

import MySQLdb

TABLES = [
    "roles_permissions",
    "staff_roles",
    "users_authentication",
    "userlog",
    "permission_category",
    "permission_group",
    "permission_student",
    "notification_roles",
]


def main():
    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()
    schema = {}

    for table in TABLES:
        cur.execute(f"SHOW TABLES LIKE '{table}'")
        if not cur.fetchone():
            print(f"MISSING: {table}")
            continue
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
        cur.execute(f"SHOW CREATE TABLE `{table}`")
        create_sql = cur.fetchone()[1]
        schema[table] = {"columns": columns, "create_sql": create_sql}
        print(f"\n--- {table} ---")
        for col in columns:
            print(
                f"  {col['field']:30} {col['type']:25} "
                f"NULL={col['null']} KEY={col['key']} DEFAULT={col['default']}"
            )

    with open("scripts/db_current_accounts_schema.json", "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2, default=str)
    print("\nWrote scripts/db_current_accounts_schema.json")
    conn.close()


if __name__ == "__main__":
    main()

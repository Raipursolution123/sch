"""Analyze cyc_* tables: relationships and proposed domain."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import MySQLdb

OUTPUT = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "cyc_domain_analysis.json"


def main():
    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()

    cur.execute("SHOW TABLES LIKE 'cyc\\_%'")
    tables = sorted(r[0] for r in cur.fetchall())

    inventory = []
    all_fks_out: dict[str, list[str]] = {}
    referenced_by: dict[str, list[str]] = defaultdict(list)

    for table in tables:
        cur.execute(f"DESCRIBE `{table}`")
        columns = [
            {
                "name": r[0],
                "type": r[1],
                "nullable": r[2] == "YES",
                "key": r[3],
                "default": r[4],
            }
            for r in cur.fetchall()
        ]
        cur.execute(
            """
            SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'db_current' AND TABLE_NAME = %s
              AND REFERENCED_TABLE_NAME IS NOT NULL
            """,
            (table,),
        )
        fks = [
            {"column": r[0], "ref_table": r[1], "ref_column": r[2]} for r in cur.fetchall()
        ]
        all_fks_out[table] = [fk["ref_table"] for fk in fks]
        for fk in fks:
            referenced_by[fk["ref_table"]].append(table)

        cur.execute(f"SELECT COUNT(*) FROM `{table}`")
        row_count = cur.fetchone()[0]

        inventory.append(
            {
                "table": table,
                "row_count": row_count,
                "column_count": len(columns),
                "columns": columns,
                "foreign_keys": fks,
                "depends_on": sorted({fk["ref_table"] for fk in fks}),
            }
        )

    # External dependencies (non-cyc tables referenced)
    external_deps = defaultdict(int)
    cyc_set = set(tables)
    for table, deps in all_fks_out.items():
        for dep in deps:
            if dep not in cyc_set:
                external_deps[dep] += 1

    # Cluster by name prefix / function
    clusters = {
        "finance_ledger": [t for t in tables if any(x in t for x in ("ledger", "entry", "fee_head"))],
        "leads_admissions": [t for t in tables if "lead" in t],
        "ptm": [t for t in tables if "ptm" in t],
        "vehicle_transport": [t for t in tables if "vehicle" in t],
        "hostel": [t for t in tables if "hostel" in t],
        "exam": [t for t in tables if "exam" in t],
        "staff_payroll": [t for t in tables if "staff" in t or "payroll" in t],
        "scholarship": [t for t in tables if "scheme" in t or "scholarship" in t],
        "biometric": [t for t in tables if "biometric" in t],
        "misc": [],
    }
    assigned = set()
    for items in clusters.values():
        assigned.update(items)
    clusters["misc"] = [t for t in tables if t not in assigned]

    report = {
        "table_count": len(tables),
        "tables": inventory,
        "external_dependencies": dict(sorted(external_deps.items(), key=lambda x: -x[1])),
        "referenced_by_non_cyc": {
            k: v for k, v in referenced_by.items() if k not in cyc_set
        },
        "functional_clusters": {k: v for k, v in clusters.items() if v},
        "proposed_domain": {
            "name": "cyc_extensions",
            "rationale": (
                "cyc_* tables are school-specific custom extensions spanning finance/ledger, "
                "leads, PTM, transport, hostel, scholarships, and exam grouping. "
                "They share the cyc_ prefix, mostly lack FK constraints, and depend on core "
                "domains (students, staff, fees, sessions) without replacing them. "
                "Recommend a single bounded context app after core domains are mapped — "
                "not before students/staff/fees baselines exist."
            ),
            "recommended_app_name": "cyc_extensions",
            "do_not_create_yet": True,
            "prerequisite_domains": sorted(set(external_deps.keys())),
        },
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"cyc_* tables: {len(tables)}")
    print(f"External deps: {list(external_deps.keys())[:15]}")
    print(f"Wrote {OUTPUT}")
    conn.close()


if __name__ == "__main__":
    main()

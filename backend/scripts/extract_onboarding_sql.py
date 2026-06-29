"""Extract schema.sql and basic_seed.sql from docs/db_current.sql."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = ROOT / "docs" / "db_current.sql"
SCHEMA_OUT = ROOT / "backend" / "seeds" / "schema.sql"
SEED_OUT = ROOT / "backend" / "seeds" / "basic_seed.sql"

SEED_TABLES = {
    "roles",
    "permission_group",
    "permission_category",
    "permission_student",
    "roles_permissions",
    "sidebar_menus",
    "sidebar_sub_menus",
    "languages",
    "currencies",
    "attendence_type",
}

SEED_ORDER = [
    "languages",
    "currencies",
    "roles",
    "permission_group",
    "permission_category",
    "permission_student",
    "roles_permissions",
    "sidebar_menus",
    "sidebar_sub_menus",
    "attendence_type",
]

INSERT_RE = re.compile(r"^INSERT INTO `([^`]+)`", re.IGNORECASE)


def extract() -> None:
    schema_parts: list[str] = [
        "-- School ERP frozen schema (structure only)\n",
        "-- Generated from docs/db_current.sql\n",
        "\n",
        "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n",
        "SET FOREIGN_KEY_CHECKS=0;\n",
        "SET NAMES utf8mb4;\n",
        "\n",
    ]
    seed_chunks: dict[str, list[str]] = {table: [] for table in SEED_TABLES}

    in_create = False
    create_lines: list[str] = []
    in_insert = False
    insert_lines: list[str] = []
    insert_table = ""
    in_alter = False
    alter_lines: list[str] = []

    with SOURCE.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            stripped = line.strip()

            if in_insert:
                insert_lines.append(line)
                if stripped.endswith(";"):
                    if insert_table in SEED_TABLES:
                        seed_chunks[insert_table].append("".join(insert_lines))
                    in_insert = False
                    insert_lines = []
                    insert_table = ""
                continue

            if in_create:
                create_lines.append(line)
                if stripped.startswith(")") and stripped.endswith(";"):
                    schema_parts.append("".join(create_lines))
                    if not schema_parts[-1].endswith("\n"):
                        schema_parts[-1] += "\n"
                    schema_parts.append("\n")
                    in_create = False
                    create_lines = []
                continue

            if in_alter:
                alter_lines.append(line)
                if stripped.endswith(";"):
                    schema_parts.append("".join(alter_lines))
                    if not schema_parts[-1].endswith("\n"):
                        schema_parts[-1] += "\n"
                    schema_parts.append("\n")
                    in_alter = False
                    alter_lines = []
                continue

            if stripped.upper().startswith("CREATE TABLE "):
                in_create = True
                create_lines = [line]
                continue

            if stripped.upper().startswith("ALTER TABLE "):
                in_alter = True
                alter_lines = [line]
                continue

            match = INSERT_RE.match(stripped)
            if match:
                insert_table = match.group(1)
                in_insert = True
                insert_lines = [line]
                if stripped.endswith(";"):
                    if insert_table in SEED_TABLES:
                        seed_chunks[insert_table].append("".join(insert_lines))
                    in_insert = False
                    insert_lines = []
                    insert_table = ""
                continue

    schema_parts.extend(
        [
            "SET FOREIGN_KEY_CHECKS=1;\n",
            "\n",
        ]
    )

    SCHEMA_OUT.parent.mkdir(parents=True, exist_ok=True)
    SCHEMA_OUT.write_text("".join(schema_parts), encoding="utf-8")

    seed_parts = [
        "-- School ERP basic seed (product metadata only)",
        "-- Generated from docs/db_current.sql",
        "",
        "SET FOREIGN_KEY_CHECKS=0;",
        "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';",
        "",
    ]
    for table in SEED_ORDER:
        chunks = seed_chunks.get(table, [])
        if not chunks:
            continue
        seed_parts.append(f"-- {table}")
        for chunk in chunks:
            seed_parts.append(chunk.replace("'0000-00-00'", "NULL"))
        seed_parts.append("")
    seed_parts.append("SET FOREIGN_KEY_CHECKS=1;")
    seed_parts.append("")

    SEED_OUT.write_text("\n".join(seed_parts), encoding="utf-8")

    create_count = "".join(schema_parts).count("CREATE TABLE")
    seed_insert_count = sum(len(v) for v in seed_chunks.values())
    print(f"Wrote {SCHEMA_OUT} ({create_count} CREATE TABLE statements)")
    print(f"Wrote {SEED_OUT} ({seed_insert_count} INSERT statements)")
    for table in SEED_ORDER:
        count = len(seed_chunks.get(table, []))
        if count:
            print(f"  {table}: {count} INSERT block(s)")


if __name__ == "__main__":
    extract()

"""
Generate Django models from students_domain_inventory.json.
All models: managed=False, exact db_table and columns.
"""
from __future__ import annotations

import json
import keyword
import re
from pathlib import Path

INVENTORY = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "students" / "students_domain_inventory.json"
OUT_DIR = Path(__file__).resolve().parent.parent / "apps" / "students" / "models"

MYSQL_TO_DJANGO = {
    "int(11)": ("IntegerField", {}),
    "bigint(100)": ("BigIntegerField", {}),
    "bigint(20)": ("BigIntegerField", {}),
    "tinyint(1)": ("IntegerField", {}),
    "tinyint(4)": ("IntegerField", {}),
    "text": ("TextField", {}),
    "longtext": ("TextField", {}),
    "tinytext": ("TextField", {}),
    "date": ("DateField", {}),
    "timestamp": ("DateTimeField", {}),
    "datetime": ("DateTimeField", {}),
    "time": ("TimeField", {}),
    "double": ("FloatField", {}),
}


def parse_type(mysql_type: str) -> tuple[str, dict]:
    t = mysql_type.lower().strip()
    if re.match(r"int\(\d+\)", t) or t.startswith("tinyint"):
        return "IntegerField", {}
    if t in MYSQL_TO_DJANGO:
        return MYSQL_TO_DJANGO[t]
    m = re.match(r"varchar\((\d+)\)", t)
    if m:
        return "CharField", {"max_length": int(m.group(1))}
    m = re.match(r"float\((\d+),(\d+)\)", t)
    if m:
        return "FloatField", {}
    m = re.match(r"decimal\((\d+),(\d+)\)", t)
    if m:
        return "DecimalField", {"max_digits": int(m.group(1)), "decimal_places": int(m.group(2))}
    m = re.match(r"enum\((.+)\)", t)
    if m:
        choices = [c.strip().strip("'") for c in m.group(1).split(",")]
        return "CharField", {"max_length": max(len(c) for c in choices)}
    return "TextField", {}


def to_class_name(table: str) -> str:
    parts = table.split("_")
    return "".join(p.capitalize() for p in parts)


def attr_name(column: str) -> str:
    """Python attribute name; preserves db_column for reserved words."""
    if keyword.iskeyword(column):
        return f"{column}_field"
    return column


def field_line(col: dict, fks: dict[str, dict]) -> str:
    name = col["name"]
    attr = attr_name(name)
    if col["key"] == "PRI":
        if "auto_increment" in col.get("extra", ""):
            return f"    {attr} = models.AutoField(primary_key=True)"
        return f"    {attr} = models.IntegerField(primary_key=True)"

    if name in fks:
        fk = fks[name]
        ref_table = fk["references_table"]
        ref_class = to_class_name(ref_table)
        nullable = col["nullable"]
        args = [
            f'"{ref_class}"',
            "on_delete=models.CASCADE",
            f'db_column="{name}"',
        ]
        if nullable:
            args.append("blank=True")
            args.append("null=True")
        else:
            args.append("null=False")
        related = f"{ref_table}_set"
        return (
            f"    {name.replace('_id', '') if name.endswith('_id') else name} = models.ForeignKey(\n"
            f"        {', '.join(args)},\n"
            f"        related_name='+',\n"
            f"        db_column='{name}',\n"
            f"    )"
        )

    field_cls, kwargs = parse_type(col["mysql_type"])
    parts = [f"models.{field_cls}("]
    inner = []
    for k, v in kwargs.items():
        inner.append(f"{k}={v}")
    if col["nullable"]:
        inner.append("blank=True")
        inner.append("null=True")
    if col["default"] is not None and col["default"] != "NULL":
        default = col["default"]
        if default == "current_timestamp()":
            pass  # DB default only
        elif default.replace(".", "", 1).isdigit():
            inner.append(f"default={default}")
        else:
            inner.append(f"default='{default}'")
    if attr != name:
        inner.append(f"db_column='{name}'")
    if col["key"] in ("MUL", "UNI"):
        inner.append("db_index=True")
    return f"    {attr} = models.{field_cls}({', '.join(inner)})"


def generate_model(table_data: dict) -> str:
    table = table_data["table"]
    class_name = to_class_name(table)
    fks = {fk["column"]: fk for fk in table_data["foreign_keys"]}

    lines = [
        "from django.db import models",
        "",
        "",
        f"class {class_name}(models.Model):",
        f'    """Maps to `{table}` in db_current."""',
        "",
    ]
    for col in table_data["columns"]:
        if col["name"] in fks and col["key"] != "PRI":
            name = col["name"]
            attr = attr_name(name)
            nullable = col["nullable"]
            null_str = "True" if nullable else "False"
            blank_str = "True" if nullable else "False"
            index_suffix = ", db_index=True" if col["key"] in ("MUL", "UNI") else ""
            db_col = f", db_column='{name}'" if attr != name else ""
            lines.append(
                f"    {attr} = models.IntegerField("
                f"blank={blank_str}, null={null_str}{db_col}{index_suffix})"
            )
        else:
            line = field_line(col, fks)
            lines.append(line)

    lines.extend(
        [
            "",
            "    class Meta:",
            "        managed = False",
            f'        db_table = "{table}"',
            "",
            "    def __str__(self):",
            f'        return f"{class_name} {{self.pk}}"',
            "",
        ]
    )
    return "\n".join(lines)


def main():
    data = json.loads(INVENTORY.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Core tables in separate files; admissions in admissions app later
    admissions_tables = {
        "online_admissions",
        "online_admission_fields",
        "online_admission_custom_field_value",
        "online_admission_payment",
    }
    students_tables = [t for t in data["tables"] if t["table"] not in admissions_tables]

    generated = []
    for table_data in students_tables:
        table = table_data["table"]
        module = table
        content = generate_model(table_data)
        (OUT_DIR / f"{module}.py").write_text(content, encoding="utf-8")
        generated.append((table, to_class_name(table), module))

    init_lines = ["from django.db import models", ""]
    for table, class_name, module in sorted(generated, key=lambda x: x[0]):
        init_lines.append(f"from apps.students.models.{module} import {class_name}")
    init_lines.append("")
    init_lines.append("__all__ = [")
    for _, class_name, _ in sorted(generated, key=lambda x: x[1]):
        init_lines.append(f'    "{class_name}",')
    init_lines.append("]")
    (OUT_DIR / "__init__.py").write_text("\n".join(init_lines), encoding="utf-8")

    print(f"Generated {len(generated)} model files in {OUT_DIR}")


if __name__ == "__main__":
    main()

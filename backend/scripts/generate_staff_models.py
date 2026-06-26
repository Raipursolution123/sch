"""Generate staff Django models from staff_domain_inventory.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_students_models import generate_model, to_class_name  # noqa: E402

INVENTORY = (
    Path(__file__).resolve().parent.parent.parent
    / "docs"
    / "database"
    / "staff"
    / "staff_domain_inventory.json"
)
OUT_DIR = Path(__file__).resolve().parent.parent / "apps" / "staff" / "models"


def main():
    data = json.loads(INVENTORY.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    generated = []
    for table_data in data["tables"]:
        table = table_data["table"]
        content = generate_model(table_data)
        (OUT_DIR / f"{table}.py").write_text(content, encoding="utf-8")
        generated.append((table, to_class_name(table)))

    init_lines = []
    for table, class_name in sorted(generated, key=lambda x: x[0]):
        init_lines.append(f"from apps.staff.models.{table} import {class_name}")
    init_lines.append("")
    init_lines.append("__all__ = [")
    for _, class_name in sorted(generated, key=lambda x: x[1]):
        init_lines.append(f'    "{class_name}",')
    init_lines.append("]")
    (OUT_DIR / "__init__.py").write_text("\n".join(init_lines), encoding="utf-8")
    print(f"Generated {len(generated)} staff models in {OUT_DIR}")


if __name__ == "__main__":
    main()

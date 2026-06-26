"""Generate Django models for a domain from its inventory JSON."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_students_models import generate_model, to_class_name  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent.parent


def ensure_app(app_label: str):
    app_dir = ROOT / "backend" / "apps" / app_label
    app_dir.mkdir(parents=True, exist_ok=True)
    (app_dir / "__init__.py").touch(exist_ok=True)
    apps_py = app_dir / "apps.py"
    if not apps_py.exists():
        class_name = "".join(p.capitalize() for p in app_label.split("_")) + "Config"
        apps_py.write_text(
            f'''from django.apps import AppConfig


class {class_name}(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.{app_label}"
    label = "{app_label}"
    verbose_name = "{app_label.replace("_", " ").title()}"
''',
            encoding="utf-8",
        )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("domain", help="Domain name")
    args = parser.parse_args()
    domain = args.domain

    inv_path = ROOT / "docs" / "database" / domain / f"{domain}_domain_inventory.json"
    data = json.loads(inv_path.read_text(encoding="utf-8"))
    app_label = data["app"]
    ensure_app(app_label)

    out_dir = ROOT / "backend" / "apps" / app_label / "models"
    out_dir.mkdir(parents=True, exist_ok=True)

    generated = []
    for table_data in data["tables"]:
        table = table_data["table"]
        content = generate_model(table_data)
        out_path = out_dir / f"{table}.py"
        if out_path.exists():
            # Frozen: skip overwriting existing models
            existing = out_path.read_text(encoding="utf-8")
            if f'db_table = "{table}"' in existing:
                generated.append((table, to_class_name(table)))
                continue
        out_path.write_text(content, encoding="utf-8")
        generated.append((table, to_class_name(table)))

    # Rebuild __init__ from all model files in app
    frozen_apps = {
        "accounts",
        "students",
        "staff",
        "attendance",
        "fees",
        "examinations",
        "academics",
    }
    if app_label in frozen_apps and (out_dir / "__init__.py").exists():
        print(f"Preserved frozen __init__ for apps.{app_label}")
    else:
        all_models = []
        for py in sorted(out_dir.glob("*.py")):
            if py.name == "__init__.py":
                continue
            table = py.stem
            class_name = to_class_name(table)
            all_models.append((table, class_name))

        init_lines = [
            f"from apps.{app_label}.models.{t} import {c}"
            for t, c in sorted(all_models, key=lambda x: x[0])
        ]
        init_lines.append("")
        init_lines.append("__all__ = [")
        for _, c in sorted(all_models, key=lambda x: x[1]):
            init_lines.append(f'    "{c}",')
        init_lines.append("]")
        (out_dir / "__init__.py").write_text("\n".join(init_lines), encoding="utf-8")
    model_count = len(list(out_dir.glob("*.py"))) - 1
    print(f"Generated {model_count} models in apps.{app_label}")


if __name__ == "__main__":
    main()

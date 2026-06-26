"""Batch introspect + generate models for one or more domains."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PYTHON = ROOT.parent / ".venv" / "Scripts" / "python.exe"
ASSIGNMENT = ROOT.parent.parent / "docs" / "database" / "master_domain_assignment.json"

DEFAULT_ORDER = [
    "library",
    "transport",
    "hostel",
    "admissions",
    "lms",
    "settings",
    "communications",
    "cms",
    "inventory",
    "front_office",
    "documents",
    "shared",
    "alumni",
    "hr",
    "cyc_extensions",
    "system",
    "academics",  # extension only — frozen skip
    "fees",
    "accounts",
    "examinations",
]


def run(cmd: list[str]):
    print(">", " ".join(cmd))
    subprocess.check_call(cmd)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--domains", nargs="*", help="Domains to process (default: all pending)")
    parser.add_argument("--all", action="store_true", help="Process all domains")
    args = parser.parse_args()

    run([str(PYTHON), str(ROOT / "master_domain_assignment.py")])

    data = json.loads(ASSIGNMENT.read_text(encoding="utf-8"))
    domains = args.domains or (DEFAULT_ORDER if args.all else DEFAULT_ORDER)

    for domain in domains:
        if domain not in data["domains"]:
            print(f"Skip unknown domain: {domain}")
            continue
        run([str(PYTHON), str(ROOT / "introspect_domain.py"), domain])
        run([str(PYTHON), str(ROOT / "generate_domain_models.py"), domain])

    run([str(PYTHON), str(ROOT / "update_schema_completion_tracker.py")])
    run([str(PYTHON), str(ROOT.parent / "manage.py"), "check"])


if __name__ == "__main__":
    main()

"""
Canonical table → domain assignment for all 280 db_current tables.
Used by schema completion tracker and batch model generation.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
INVENTORY_PATH = ROOT / "docs" / "database" / "db_current_inventory.json"
OUTPUT_PATH = ROOT / "docs" / "database" / "master_domain_assignment.json"

# Explicit overrides (approved reclassifications / frozen mappings)
EXPLICIT: dict[str, str] = {
    "sessions": "academics",
    "department": "staff",
    "staff_roles": "accounts",
    "conference_staff": "staff",
    "gmeet_staff": "staff",
    "cyc_staff_payroll": "staff",
    "cyc_staff_payroll_increment": "staff",
    "student_fees": "students",
    "student_fees_deposite": "students",
    "student_fees_discounts": "students",
    "student_fees_master": "students",
    "student_fees_processing": "students",
    "student_transport_fees": "students",
    "student_attendences": "students",
    "student_attendences_hostel": "students",
    "student_attendences_transport": "students",
    "student_subject_attendances": "students",
    "attendence_type": "attendance",
}

# Domain → Django app label (group related domains into existing apps where noted)
DOMAIN_APP: dict[str, str] = {
    "accounts": "accounts",
    "students": "students",
    "academics": "academics",
    "staff": "staff",
    "attendance": "attendance",
    "fees": "fees",
    "examinations": "examinations",
    "library": "library",
    "transport": "transport",
    "hostel": "hostel",
    "admissions": "admissions",
    "lms": "lms",
    "settings": "settings",
    "communications": "communications",
    "cms": "cms",
    "inventory": "inventory",
    "front_office": "front_office",
    "documents": "documents",
    "shared": "shared",
    "alumni": "alumni",
    "hr": "staff",  # merge leave_types into staff app
    "cyc_extensions": "cyc_extensions",
    "system": "system",  # logs, migrations, multi_branch — still mapped, no API
}

RULES: list[tuple[str, str]] = [
    (r"^cbse_", "examinations"),
    (r"^onlineexam", "examinations"),
    (r"^exam", "examinations"),
    (r"^grades$", "examinations"),
    (r"^questions$", "examinations"),
    (r"^template_marksheets$", "examinations"),
    (r"^template_admitcards$", "documents"),
    (r"^online_admission", "admissions"),
    (r"^online_course", "lms"),
    (r"^course_", "lms"),
    (r"^student", "students"),
    (r"^disable_reason$", "students"),
    (r"^staff", "staff"),
    (r"^cyc_staff", "staff"),
    (r"^conference_staff$", "staff"),
    (r"^gmeet_staff$", "staff"),
    (r"^fee", "fees"),
    (r"^feetype$", "fees"),
    (r"^feemasters$", "fees"),
    (r"^gateway_", "fees"),
    (r"^offline_fees", "fees"),
    (r"^payment_settings$", "fees"),
    (r"^expense", "fees"),
    (r"^income", "fees"),
    (r"^attendence", "attendance"),
    (r"^book", "library"),
    (r"^libarary", "library"),
    (r"^transport", "transport"),
    (r"^vehicle", "transport"),
    (r"^route_pickup", "transport"),
    (r"^pickup_point$", "transport"),
    (r"^hostel", "hostel"),
    (r"^leave_types$", "hr"),
    (r"^payslip_allowance$", "hr"),
    (r"^alumni", "alumni"),
    (r"^chat_", "communications"),
    (r"^conference", "communications"),
    (r"^gmeet", "communications"),
    (r"^email_", "communications"),
    (r"^sms_", "communications"),
    (r"^messages$", "communications"),
    (r"^notification_setting$", "communications"),
    (r"^zoom_settings$", "communications"),
    (r"^send_notification$", "communications"),
    (r"^read_notification$", "communications"),
    (r"^front_cms", "cms"),
    (r"^events$", "cms"),
    (r"^item", "inventory"),
    (r"^enquiry", "front_office"),
    (r"^complaint", "front_office"),
    (r"^dispatch_receive$", "front_office"),
    (r"^visitors_", "front_office"),
    (r"^certificates$", "documents"),
    (r"^content_types$", "documents"),
    (r"^id_card$", "documents"),
    (r"^share_", "shared"),
    (r"^follow_up$", "shared"),
    (r"^upload_contents$", "shared"),
    (r"^contents$", "shared"),
    (r"^content_for$", "shared"),
    (r"^sch_settings$", "settings"),
    (r"^custom_field", "settings"),
    (r"^categories$", "settings"),
    (r"^languages$", "settings"),
    (r"^school_houses$", "settings"),
    (r"^behaviour_settings$", "settings"),
    (r"^aws_s3_settings$", "settings"),
    (r"^qr_code_settings$", "settings"),
    (r"^print_headerfooter$", "settings"),
    (r"^currencies$", "settings"),
    (r"^reference$", "settings"),
    (r"^source$", "settings"),
    (r"^room_types$", "settings"),
    (r"^positions$", "settings"),
    (r"^filetypes$", "settings"),
    (r"^sidebar_", "settings"),
    (r"^class_", "academics"),
    (r"^classes$", "academics"),
    (r"^sections$", "academics"),
    (r"^subjects$", "academics"),
    (r"^subject_", "academics"),
    (r"^homework", "academics"),
    (r"^lesson", "academics"),
    (r"^topic$", "academics"),
    (r"^daily_assignment$", "academics"),
    (r"^submit_assignment$", "academics"),
    (r"^video_tutorial", "academics"),
    (r"^users$", "accounts"),
    (r"^userlog$", "accounts"),
    (r"^users_authentication$", "accounts"),
    (r"^roles$", "accounts"),
    (r"^roles_permissions$", "accounts"),
    (r"^permission_", "accounts"),
    (r"^captcha$", "accounts"),
    (r"^notification_roles$", "accounts"),
    (r"^cyc_", "cyc_extensions"),
    (r"^cy_", "cyc_extensions"),
    (r"^logs$", "system"),
    (r"^migrations$", "system"),
    (r"^multi_branch$", "system"),
    (r"^face_authentication$", "system"),
    (r"^geofence", "system"),
    (r"^guest$", "system"),
    (r"^general_calls$", "system"),
    (r"^mark_divisions$", "examinations"),
]


def classify(table: str) -> str:
    if table in EXPLICIT:
        return EXPLICIT[table]
    for pattern, domain in RULES:
        if re.search(pattern, table):
            return domain
    return "system"


def main():
    inv = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    assignment: dict[str, dict] = {}
    by_domain: dict[str, list[str]] = {}

    for item in inv["tables"]:
        table = item["table"]
        domain = classify(table)
        app = DOMAIN_APP.get(domain, domain)
        assignment[table] = {
            "domain": domain,
            "app": app,
            "row_count": item.get("row_count", 0),
            "foreign_key_count": len(item.get("foreign_keys", [])),
        }
        by_domain.setdefault(domain, []).append(table)

    payload = {
        "table_count": len(assignment),
        "domain_count": len(by_domain),
        "tables": assignment,
        "domains": {d: sorted(tables) for d, tables in sorted(by_domain.items())},
    }
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH} ({len(assignment)} tables, {len(by_domain)} domains)")
    for d, tables in sorted(by_domain.items(), key=lambda x: -len(x[1])):
        print(f"  {d}: {len(tables)}")


if __name__ == "__main__":
    main()

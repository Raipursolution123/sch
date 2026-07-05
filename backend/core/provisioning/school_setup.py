from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import date, datetime

from django.db import connection, transaction
from django.utils import timezone

import bcrypt

from apps.accounts.services.legacy_password import hash_legacy_password
from core.provisioning.paths import SEEDS_DIR

SCH_SETTINGS_TEMPLATE = (SEEDS_DIR / "templates" / "sch_settings_insert.sql").read_text(
    encoding="utf-8"
)


@dataclass
class SchoolSetupInput:
    school_name: str
    school_email: str
    school_phone: str
    school_address: str
    admin_name: str
    admin_email: str
    admin_password: str
    base_url: str
    folder_path: str
    language: str = "English"
    currency: str = "INR"
    session_name: str | None = None


def current_indian_academic_session(reference: date | None = None) -> str:
    today = reference or date.today()
    start_year = today.year if today.month >= 4 else today.year - 1
    end_suffix = (start_year + 1) % 100
    return f"{start_year}-{end_suffix:02d}"


def hash_staff_password(raw_password: str) -> str:
    hashed = bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt(rounds=10))
    return hashed.decode("utf-8").replace("$2b$", "$2y$", 1)


def _lookup_language_id(cursor, language: str) -> int:
    cursor.execute(
        """
        SELECT id FROM languages
        WHERE language = %s OR short_code = %s
        ORDER BY id
        LIMIT 1
        """,
        [language, language.lower()[:2]],
    )
    row = cursor.fetchone()
    if not row:
        raise ValueError(f"Language '{language}' not found. Load basic_seed.sql first.")
    return row[0]


def _lookup_currency(cursor, currency: str) -> tuple[str, str]:
    cursor.execute(
        """
        SELECT id, symbol FROM currencies
        WHERE short_name = %s OR name = %s
        ORDER BY id
        LIMIT 1
        """,
        [currency, currency],
    )
    row = cursor.fetchone()
    if not row:
        raise ValueError(f"Currency '{currency}' not found. Load basic_seed.sql first.")
    return str(row[0]), row[1] or currency


def _escape_sql(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "''")


def _build_sch_settings_sql(
    data: SchoolSetupInput,
    session_id: int,
    lang_id: int,
    currency_id: str,
    currency_symbol: str,
    created_at: datetime,
) -> str:
    languages_json = f'["{lang_id}"]'
    return (
        SCH_SETTINGS_TEMPLATE.replace("__BASE_URL__", _escape_sql(data.base_url))
        .replace("__FOLDER_PATH__", _escape_sql(data.folder_path))
        .replace("__SCHOOL_NAME__", _escape_sql(data.school_name))
        .replace("__SCHOOL_EMAIL__", _escape_sql(data.school_email))
        .replace("__SCHOOL_PHONE__", _escape_sql(data.school_phone))
        .replace("__SCHOOL_ADDRESS__", _escape_sql(data.school_address))
        .replace("__LANG_ID__", str(lang_id))
        .replace("__LANGUAGES__", _escape_sql(languages_json))
        .replace("__CURRENCY__", _escape_sql(currency_id))
        .replace("__CURRENCY_SYMBOL__", _escape_sql(currency_symbol))
        .replace("__SESSION_ID__", str(session_id))
        .replace("__CRON_SECRET__", _escape_sql(secrets.token_urlsafe(16)))
        .replace("__CREATED_AT__", created_at.strftime("%Y-%m-%d %H:%M:%S"))
    )


def create_school_setup(data: SchoolSetupInput) -> dict:
    now = timezone.now()
    session_name = data.session_name or current_indian_academic_session()

    with transaction.atomic():
        with connection.cursor() as cursor:
            lang_id = _lookup_language_id(cursor, data.language)
            currency_id, currency_symbol = _lookup_currency(cursor, data.currency)

            cursor.execute(
                """
                INSERT INTO sessions (session, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s)
                """,
                [session_name, "yes", now, None],
            )
            session_id = cursor.lastrowid

            sch_settings_sql = _build_sch_settings_sql(
                data, session_id, lang_id, currency_id, currency_symbol, now
            )
            cursor.execute(sch_settings_sql)

            password_hash = hash_staff_password(data.admin_password)
            staff_values = [
                "9000",
                lang_id,
                int(currency_id),
                None,
                None,
                "",
                "",
                data.admin_name,
                "",
                "",
                "",
                data.school_phone,
                "",
                data.admin_email,
                date(2000, 1, 1),
                "",
                now.date(),
                None,
                "",
                "",
                "",
                "",
                password_hash,
                "Male",
                "",
                "",
                "",
                "",
                "",
                "",
                0,
                "",
                "",
                "permanent",
                "Day",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "Other Document",
                "",
                0,
                1,
                None,
                0,
                "",
                None,
                None,
                "",
                None,
            ]
            staff_columns = (
                "employee_id, lang_id, currency_id, department, designation, "
                "qualification, work_exp, name, surname, father_name, mother_name, "
                "contact_no, emergency_contact_no, email, dob, marital_status, "
                "date_of_joining, date_of_leaving, local_address, permanent_address, "
                "note, image, password, gender, account_title, bank_account_no, bank_name, "
                "ifsc_code, bank_branch, payscale, basic_salary, epf_no, contract_type, "
                "shift, location, facebook, twitter, linkedin, instagram, resume, "
                "joining_letter, resignation_letter, other_document_name, "
                "other_document_file, user_id, is_active, direct_manager, "
                "is_house_incharge, verification_code, zoom_api_key, zoom_api_secret, "
                "biometric_device_id, disable_at"
            )
            placeholders = ", ".join(["%s"] * len(staff_values))
            cursor.execute(
                f"INSERT INTO staff ({staff_columns}) VALUES ({placeholders})",
                staff_values,
            )
            staff_id = cursor.lastrowid

            cursor.execute(
                """
                INSERT INTO staff_roles (role_id, staff_id, is_active, created_at, updated_at)
                VALUES (7, %s, 1, %s, NULL)
                """,
                [staff_id, now],
            )

            cursor.execute(
                """
                INSERT INTO users (
                    user_id, username, password, childs, role, lang_id, currency_id,
                    verification_code, is_active, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                [
                    staff_id,
                    data.admin_email[:50],
                    hash_legacy_password(""),
                    "",
                    "staff",
                    lang_id,
                    int(currency_id),
                    "",
                    "yes",
                    now,
                    None,
                ],
            )
            user_id = cursor.lastrowid
            cursor.execute(
                "UPDATE staff SET user_id = %s WHERE id = %s", [user_id, staff_id]
            )

    return {
        "school_name": data.school_name,
        "session_name": session_name,
        "session_id": session_id,
        "admin_email": data.admin_email,
        "language_id": lang_id,
        "currency_id": currency_id,
    }

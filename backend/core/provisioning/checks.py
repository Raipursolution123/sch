from __future__ import annotations

from dataclasses import dataclass, field

from django.db import connection

from core.provisioning.paths import BASIC_SEED_SQL, EXPECTED_BUSINESS_TABLES, SCHEMA_SQL


@dataclass
class OnboardingStatus:
    database_connected: bool = False
    schema_ready: bool = False
    basic_seed_ready: bool = False
    school_initialized: bool = False
    table_count: int = 0
    roles_count: int = 0
    issues: list[str] = field(default_factory=list)
    guidance: list[str] = field(default_factory=list)

    @property
    def ready_for_development(self) -> bool:
        return (
            self.database_connected
            and self.schema_ready
            and self.basic_seed_ready
            and self.school_initialized
        )

    def as_dict(self) -> dict:
        return {
            "database_connected": self.database_connected,
            "schema_ready": self.schema_ready,
            "basic_seed_ready": self.basic_seed_ready,
            "school_initialized": self.school_initialized,
            "ready_for_development": self.ready_for_development,
            "table_count": self.table_count,
            "roles_count": self.roles_count,
            "issues": self.issues,
            "guidance": self.guidance,
        }


def _table_exists(cursor, table_name: str) -> bool:
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = DATABASE() AND table_name = %s
        """,
        [table_name],
    )
    return cursor.fetchone()[0] > 0


def _count_rows(cursor, table_name: str) -> int:
    if not _table_exists(cursor, table_name):
        return 0
    cursor.execute(f"SELECT COUNT(*) FROM `{table_name}`")
    return cursor.fetchone()[0]


def check_onboarding() -> OnboardingStatus:
    status = OnboardingStatus()

    try:
        connection.ensure_connection()
        status.database_connected = True
    except Exception as exc:
        status.issues.append(f"Database connection failed: {exc}")
        status.guidance.append("Check DB_HOST, DB_NAME, DB_USER, DB_PASSWORD in .env")
        status.guidance.append(
            "If using Docker: docker compose -f docker-compose.dev.yml up -d mysql"
        )
        return status

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_type = 'BASE TABLE'
            """
        )
        status.table_count = cursor.fetchone()[0]

        required_tables = ["sch_settings", "roles", "staff", "students", "sessions"]
        missing = [name for name in required_tables if not _table_exists(cursor, name)]
        status.schema_ready = (
            not missing and status.table_count >= EXPECTED_BUSINESS_TABLES
        )

        if missing:
            status.issues.append(f"Missing tables: {', '.join(missing)}")
        elif status.table_count < EXPECTED_BUSINESS_TABLES:
            status.issues.append(
                f"Expected at least {EXPECTED_BUSINESS_TABLES} business tables, found {status.table_count}"
            )

        if not status.schema_ready:
            status.guidance.append(
                f"Apply frozen schema: mysql -u USER -p DATABASE < {SCHEMA_SQL}"
            )
            status.guidance.append(
                "Or from Docker: docker compose exec -T mysql mysql -u school_erp -pschool_erp school_erp < backend/seeds/schema.sql"
            )

        status.roles_count = _count_rows(cursor, "roles")
        super_admin_role = 0
        if _table_exists(cursor, "roles"):
            cursor.execute("SELECT COUNT(*) FROM roles WHERE id = 7")
            super_admin_role = cursor.fetchone()[0]

        status.basic_seed_ready = (
            status.schema_ready
            and status.roles_count >= 1
            and super_admin_role == 1
            and _count_rows(cursor, "permission_group") >= 1
            and _count_rows(cursor, "sidebar_menus") >= 1
            and _count_rows(cursor, "languages") >= 1
            and _count_rows(cursor, "currencies") >= 1
        )

        if status.schema_ready and not status.basic_seed_ready:
            status.issues.append("Basic product seed is missing or incomplete")
            status.guidance.append(
                f"Load basic seed: mysql -u USER -p DATABASE < {BASIC_SEED_SQL}"
            )

        status.school_initialized = _count_rows(cursor, "sch_settings") >= 1
        if status.basic_seed_ready and not status.school_initialized:
            status.issues.append(
                "School has not been initialized (sch_settings is empty)"
            )
            status.guidance.append("Run: python manage.py initial_setup")

    if status.ready_for_development:
        status.guidance.append("Onboarding complete. You can start development.")

    return status


def format_onboarding_report(status: OnboardingStatus) -> str:
    lines = [
        "=== School ERP Onboarding Status ===",
        f"Database connected : {'yes' if status.database_connected else 'no'}",
        f"Schema ready       : {'yes' if status.schema_ready else 'no'} ({status.table_count} tables)",
        f"Basic seed ready   : {'yes' if status.basic_seed_ready else 'no'} ({status.roles_count} roles)",
        f"School initialized : {'yes' if status.school_initialized else 'no'}",
        f"Ready for dev      : {'yes' if status.ready_for_development else 'no'}",
    ]
    if status.issues:
        lines.append("")
        lines.append("Issues:")
        for issue in status.issues:
            lines.append(f"  - {issue}")
    if status.guidance:
        lines.append("")
        lines.append("Next steps:")
        for step in status.guidance:
            lines.append(f"  - {step}")
    return "\n".join(lines)

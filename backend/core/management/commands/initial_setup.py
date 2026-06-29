from __future__ import annotations

from django.core.management.base import BaseCommand, CommandError

from core.provisioning.checks import check_onboarding, format_onboarding_report
from core.provisioning.school_setup import (
    SchoolSetupInput,
    create_school_setup,
    current_indian_academic_session,
)


class Command(BaseCommand):
    help = "Create school-specific records after schema.sql and basic_seed.sql are loaded."

    def add_arguments(self, parser):
        parser.add_argument("--school-name", default="Demo Public School")
        parser.add_argument("--school-email", default="office@demo.com")
        parser.add_argument("--school-phone", default="9999999999")
        parser.add_argument("--school-address", default="Demo Address")
        parser.add_argument("--admin-name", default="Super Admin")
        parser.add_argument("--admin-email", default="admin@demo.com")
        parser.add_argument("--admin-password", default="Admin@123")
        parser.add_argument("--base-url", default="http://localhost:8000")
        parser.add_argument("--folder-path", default="/app/media")
        parser.add_argument("--language", default="English")
        parser.add_argument("--currency", default="INR")
        parser.add_argument("--session", dest="session_name", default=None)

    def handle(self, *args, **options):
        status = check_onboarding()

        if not status.database_connected:
            raise CommandError(format_onboarding_report(status))

        if not status.schema_ready:
            raise CommandError(
                "Schema is not ready.\n\n" + format_onboarding_report(status)
            )

        if not status.basic_seed_ready:
            raise CommandError(
                "Basic seed is not loaded.\n\n" + format_onboarding_report(status)
            )

        if status.school_initialized:
            self.stdout.write(
                self.style.WARNING(
                    "School is already initialized (sch_settings exists). Nothing to do."
                )
            )
            return

        session_name = options["session_name"] or current_indian_academic_session()
        data = SchoolSetupInput(
            school_name=options["school_name"],
            school_email=options["school_email"],
            school_phone=options["school_phone"],
            school_address=options["school_address"],
            admin_name=options["admin_name"],
            admin_email=options["admin_email"],
            admin_password=options["admin_password"],
            base_url=options["base_url"],
            folder_path=options["folder_path"],
            language=options["language"],
            currency=options["currency"],
            session_name=session_name,
        )

        try:
            result = create_school_setup(data)
        except ValueError as exc:
            raise CommandError(str(exc)) from exc
        except Exception as exc:
            raise CommandError(f"School setup failed: {exc}") from exc

        self.stdout.write(self.style.SUCCESS("School initialized successfully."))
        self.stdout.write(f"  School     : {result['school_name']}")
        self.stdout.write(f"  Session    : {result['session_name']} (id={result['session_id']})")
        self.stdout.write(f"  Admin email: {result['admin_email']}")
        self.stdout.write(f"  Language id: {result['language_id']}")
        self.stdout.write(f"  Currency id: {result['currency_id']}")
        self.stdout.write("")
        self.stdout.write("Super Admin login: staff email + password (API issues JWT via users bridge).")

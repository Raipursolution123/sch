import sys

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        if any(arg in sys.argv for arg in ("migrate", "makemigrations", "test", "shell")):
            return
        if "runserver" not in sys.argv and "gunicorn" not in " ".join(sys.argv):
            return

        from core.provisioning.checks import check_onboarding, format_onboarding_report

        status = check_onboarding()
        if status.ready_for_development:
            return

        print(format_onboarding_report(status), file=sys.stderr)
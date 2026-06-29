from django.core.management.base import BaseCommand

from core.provisioning.checks import check_onboarding, format_onboarding_report


class Command(BaseCommand):
    help = "Report database onboarding / provisioning status."

    def handle(self, *args, **options):
        status = check_onboarding()
        report = format_onboarding_report(status)
        if status.ready_for_development:
            self.stdout.write(self.style.SUCCESS(report))
        else:
            self.stdout.write(self.style.WARNING(report))

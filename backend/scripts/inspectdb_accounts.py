"""Generate inspectdb output for accounts tables."""
import os
import subprocess
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

# Temporarily point to db_current
os.environ["DB_NAME"] = "db_current"
os.environ["DB_USER"] = "root"
os.environ["DB_PASSWORD"] = ""
os.environ["DB_HOST"] = "localhost"

import django

django.setup()

from django.core.management import call_command

call_command(
    "inspectdb",
    "users",
    "roles",
    "roles_permissions",
    "staff_roles",
    "permission_category",
    "permission_group",
    "permission_student",
    "users_authentication",
    "userlog",
)

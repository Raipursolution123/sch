"""Placeholder migration for custom unmanaged User model.

Legacy business tables come from db_current; Django only needs this app
label present in the migration graph for contrib and Celery dependencies.
"""

from django.db import migrations


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = []

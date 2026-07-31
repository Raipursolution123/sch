from typing import Any
from apps.settings.models.source import Source
from apps.settings.models.reference import Reference
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)


class SourceService:
    def list_sources(self):
        return Source.objects.all().order_by("-id")

    def get_source(self, pk: int) -> Source:
        item = Source.objects.filter(id=pk).first()
        if item is None:
            raise SettingsNotFoundError("Source not found.")
        return item

    def create_source(self, data: dict[str, Any]) -> Source:
        source_name = str(data.get("source", "")).strip()
        if not source_name:
            raise SettingsValidationError("Source name is required.")

        return Source.objects.create(
            source=source_name,
            description=str(data.get("description", "")).strip(),
        )

    def update_source(self, pk: int, data: dict[str, Any]) -> Source:
        item = self.get_source(pk)
        if "source" in data:
            val = str(data["source"]).strip()
            if not val:
                raise SettingsValidationError("Source name cannot be empty.")
            item.source = val
        if "description" in data:
            item.description = str(data["description"]).strip()

        item.save()
        return item

    def delete_source(self, pk: int) -> None:
        item = self.get_source(pk)
        item.delete()


class ReferenceService:
    def list_references(self):
        return Reference.objects.all().order_by("-id")

    def get_reference(self, pk: int) -> Reference:
        item = Reference.objects.filter(id=pk).first()
        if item is None:
            raise SettingsNotFoundError("Reference not found.")
        return item

    def create_reference(self, data: dict[str, Any]) -> Reference:
        ref_name = str(data.get("reference", "")).strip()
        if not ref_name:
            raise SettingsValidationError("Reference name is required.")

        return Reference.objects.create(
            reference=ref_name,
            description=str(data.get("description", "")).strip(),
        )

    def update_reference(self, pk: int, data: dict[str, Any]) -> Reference:
        item = self.get_reference(pk)
        if "reference" in data:
            val = str(data["reference"]).strip()
            if not val:
                raise SettingsValidationError("Reference name cannot be empty.")
            item.reference = val
        if "description" in data:
            item.description = str(data["description"]).strip()

        item.save()
        return item

    def delete_reference(self, pk: int) -> None:
        item = self.get_reference(pk)
        item.delete()

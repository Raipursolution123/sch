from __future__ import annotations

from typing import Any

from django.db.models import Q
from django.utils import timezone

from apps.documents.domain.certificate_exceptions import (
    CertificateNotFoundError,
    CertificateValidationError,
)
from apps.documents.models.content_types import ContentTypes
from apps.shared.models.upload_contents import UploadContents


class ContentTypeService:
    def list(self, *, query: str | None = None):
        qs = ContentTypes.objects.all().order_by("name", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(Q(name__icontains=term) | Q(description__icontains=term))
        return qs

    def get(self, pk: int) -> ContentTypes:
        row = ContentTypes.objects.filter(id=pk).first()
        if row is None:
            raise CertificateNotFoundError("Content type not found.")
        return row

    def create(self, payload: dict[str, Any]) -> ContentTypes:
        name = str(payload.get("name", "")).strip()
        if not name:
            raise CertificateValidationError("Content type name is required.")
        return ContentTypes.objects.create(
            name=name,
            description=str(payload.get("description", "")).strip() or None,
            is_active=int(payload.get("is_active") if payload.get("is_active") is not None else 1),
            created_at=timezone.now(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> ContentTypes:
        row = self.get(pk)
        if "name" in payload:
            name = str(payload["name"]).strip()
            if not name:
                raise CertificateValidationError("Content type name cannot be empty.")
            row.name = name
        if "description" in payload:
            row.description = str(payload["description"] or "").strip() or None
        if "is_active" in payload and payload["is_active"] is not None:
            row.is_active = int(payload["is_active"])
        row.save()
        return row

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class UploadContentService:
    def list(self, *, query: str | None = None):
        qs = UploadContents.objects.all().order_by("-id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(real_name__icontains=term)
                | Q(vid_title__icontains=term)
                | Q(file_type__icontains=term)
            )
        return qs

    def get(self, pk: int) -> UploadContents:
        row = UploadContents.objects.filter(id=pk).first()
        if row is None:
            raise CertificateNotFoundError("Upload content not found.")
        return row

    def create(self, payload: dict[str, Any], *, upload_by: int) -> UploadContents:
        content_type_id = payload.get("content_type_id")
        if not content_type_id:
            raise CertificateValidationError("content_type_id is required.")
        ContentTypeService().get(int(content_type_id))
        real_name = str(payload.get("real_name", "")).strip()
        if not real_name:
            raise CertificateValidationError("real_name is required.")
        if not upload_by:
            raise CertificateValidationError("upload_by staff id is required.")

        return UploadContents.objects.create(
            content_type_id=int(content_type_id),
            class_id=payload.get("class_id"),
            section_id=payload.get("section_id"),
            subject_id=payload.get("subject_id"),
            lesson_id=payload.get("lesson_id"),
            image=str(payload.get("image", "")).strip() or None,
            thumb_path=str(payload.get("thumb_path", "")).strip() or None,
            dir_path=str(payload.get("dir_path", "")).strip() or None,
            real_name=real_name,
            img_name=str(payload.get("img_name", "")).strip() or None,
            thumb_name=str(payload.get("thumb_name", "")).strip() or None,
            file_type=str(payload.get("file_type", "")).strip() or "file",
            mime_type=str(payload.get("mime_type", "")).strip() or "application/octet-stream",
            file_size=str(payload.get("file_size", "")).strip() or "0",
            vid_url=str(payload.get("vid_url", "")).strip() or "",
            vid_title=str(payload.get("vid_title", "")).strip() or "",
            upload_by=int(upload_by),
            created_at=timezone.now(),
        )

    def delete(self, pk: int) -> None:
        self.get(pk).delete()

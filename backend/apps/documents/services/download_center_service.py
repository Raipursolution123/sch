from __future__ import annotations

from typing import Any

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.academics.models.class_sections import ClassSections
from apps.academics.models.video_tutorial import VideoTutorial
from apps.academics.models.video_tutorial_class_sections import (
    VideoTutorialClassSections,
)
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
            is_active=int(
                payload.get("is_active") if payload.get("is_active") is not None else 1
            ),
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
            mime_type=str(payload.get("mime_type", "")).strip()
            or "application/octet-stream",
            file_size=str(payload.get("file_size", "")).strip() or "0",
            vid_url=str(payload.get("vid_url", "")).strip() or "",
            vid_title=str(payload.get("vid_title", "")).strip() or "",
            upload_by=int(upload_by),
            created_at=timezone.now(),
        )

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class VideoTutorialService:
    def list(self, *, query: str | None = None):
        qs = VideoTutorial.objects.all().order_by("-id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(title__icontains=term)
                | Q(description__icontains=term)
                | Q(video_link__icontains=term)
                | Q(vid_title__icontains=term)
            )
        return qs

    def get(self, pk: int) -> VideoTutorial:
        row = VideoTutorial.objects.filter(id=pk).first()
        if row is None:
            raise CertificateNotFoundError("Video tutorial not found.")
        return row

    def class_section_ids(self, video_id: int) -> list[int]:
        return list(
            VideoTutorialClassSections.objects.filter(
                video_tutorial_id=video_id
            ).values_list("class_section_id", flat=True)
        )

    def to_dict(self, row: VideoTutorial) -> dict[str, Any]:
        return {
            "id": row.id,
            "title": row.title,
            "vid_title": row.vid_title,
            "description": row.description,
            "thumb_path": row.thumb_path,
            "dir_path": row.dir_path,
            "img_name": row.img_name,
            "thumb_name": row.thumb_name,
            "video_link": row.video_link,
            "created_by": row.created_by,
            "created_at": row.created_at,
            "class_section_ids": self.class_section_ids(row.id),
        }

    def _validate_class_sections(self, class_section_ids: list[int]) -> list[int]:
        unique_ids = sorted({int(cid) for cid in class_section_ids if cid})
        if not unique_ids:
            return []
        existing = set(
            ClassSections.objects.filter(id__in=unique_ids).values_list("id", flat=True)
        )
        missing = [cid for cid in unique_ids if cid not in existing]
        if missing:
            raise CertificateValidationError(
                f"Invalid class_section_id(s): {', '.join(str(x) for x in missing)}"
            )
        return unique_ids

    def _sync_class_sections(self, video_id: int, class_section_ids: list[int]) -> None:
        VideoTutorialClassSections.objects.filter(video_tutorial_id=video_id).delete()
        today = timezone.localdate()
        for cs_id in class_section_ids:
            VideoTutorialClassSections.objects.create(
                video_tutorial_id=video_id,
                class_section_id=cs_id,
                created_date=today,
            )

    def create(self, payload: dict[str, Any], *, created_by: int) -> dict[str, Any]:
        title = str(payload.get("title", "")).strip()
        if not title:
            raise CertificateValidationError("title is required.")
        description = str(payload.get("description", "")).strip()
        if not description:
            raise CertificateValidationError("description is required.")
        video_link = str(payload.get("video_link", "")).strip()
        if not video_link:
            raise CertificateValidationError("video_link is required.")
        if len(video_link) > 100:
            raise CertificateValidationError(
                "video_link must be at most 100 characters."
            )
        if not created_by:
            raise CertificateValidationError("created_by staff id is required.")

        class_section_ids = self._validate_class_sections(
            list(payload.get("class_section_ids") or [])
        )
        img_name = str(payload.get("img_name", "")).strip() or "-"
        thumb_name = str(payload.get("thumb_name", "")).strip() or "-"

        with transaction.atomic():
            row = VideoTutorial.objects.create(
                title=title[:100],
                vid_title=str(payload.get("vid_title", "")).strip() or None,
                description=description,
                thumb_path=str(payload.get("thumb_path", "")).strip() or None,
                dir_path=str(payload.get("dir_path", "")).strip() or None,
                img_name=img_name[:300],
                thumb_name=thumb_name[:300],
                video_link=video_link,
                created_by=int(created_by),
                created_at=timezone.now(),
            )
            self._sync_class_sections(row.id, class_section_ids)
        return self.to_dict(row)

    @transaction.atomic
    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "title" in payload:
            title = str(payload["title"]).strip()
            if not title:
                raise CertificateValidationError("title cannot be empty.")
            row.title = title[:100]
        if "description" in payload:
            description = str(payload["description"]).strip()
            if not description:
                raise CertificateValidationError("description cannot be empty.")
            row.description = description
        if "video_link" in payload:
            video_link = str(payload["video_link"]).strip()
            if not video_link:
                raise CertificateValidationError("video_link cannot be empty.")
            if len(video_link) > 100:
                raise CertificateValidationError(
                    "video_link must be at most 100 characters."
                )
            row.video_link = video_link
        if "vid_title" in payload:
            row.vid_title = str(payload["vid_title"] or "").strip() or None
        if "thumb_path" in payload:
            row.thumb_path = str(payload["thumb_path"] or "").strip() or None
        if "dir_path" in payload:
            row.dir_path = str(payload["dir_path"] or "").strip() or None
        if "img_name" in payload:
            row.img_name = str(payload["img_name"] or "").strip() or "-"
        if "thumb_name" in payload:
            row.thumb_name = str(payload["thumb_name"] or "").strip() or "-"
        row.save()
        if "class_section_ids" in payload:
            class_section_ids = self._validate_class_sections(
                list(payload.get("class_section_ids") or [])
            )
            self._sync_class_sections(row.id, class_section_ids)
        return self.to_dict(row)

    @transaction.atomic
    def delete(self, pk: int) -> None:
        row = self.get(pk)
        VideoTutorialClassSections.objects.filter(video_tutorial_id=row.id).delete()
        row.delete()

from __future__ import annotations

from datetime import datetime
from typing import Any

from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from django.utils.text import slugify

from apps.cms.models.events import Events
from apps.cms.models.front_cms_media_gallery import FrontCmsMediaGallery
from apps.cms.models.front_cms_menu_items import FrontCmsMenuItems
from apps.cms.models.front_cms_menus import FrontCmsMenus
from apps.cms.models.front_cms_pages import FrontCmsPages
from apps.cms.models.front_cms_programs import FrontCmsPrograms
from apps.cms.models.front_cms_settings import FrontCmsSettings


class CmsError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class CmsNotFoundError(CmsError):
    pass


class CmsValidationError(CmsError):
    pass


def _parse_dt(value: Any):
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value
    text = str(value).strip().replace("Z", "+00:00")
    parsed = parse_datetime(text)
    if parsed:
        return parsed
    d = parse_date(text[:10])
    if d:
        return datetime(d.year, d.month, d.day)
    raise CmsValidationError(f"Invalid datetime: {value}")


def _parse_d(value: Any):
    if value in (None, ""):
        return None
    return parse_date(str(value)[:10])


def _as_int(value: Any, default: int | None = None) -> int | None:
    if value is None or value == "":
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


class CmsEventService:
    def list(self, *, query: str | None = None):
        qs = Events.objects.all().order_by("-start_date", "-id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(event_title__icontains=term) | Q(event_description__icontains=term)
            )
        return qs

    def get(self, pk: int) -> Events:
        row = Events.objects.filter(id=pk).first()
        if row is None:
            raise CmsNotFoundError("Event not found.")
        return row

    def to_dict(self, row: Events) -> dict[str, Any]:
        return {
            "id": row.id,
            "event_title": row.event_title,
            "event_description": row.event_description,
            "start_date": row.start_date,
            "end_date": row.end_date,
            "event_type": row.event_type,
            "event_color": row.event_color,
            "event_for": row.event_for,
            "role_id": row.role_id,
            "is_active": row.is_active,
        }

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        title = str(payload.get("event_title", "")).strip()
        if not title:
            raise CmsValidationError("event_title is required.")
        start = _parse_dt(payload.get("start_date"))
        end = _parse_dt(payload.get("end_date"))
        if not start or not end:
            raise CmsValidationError("start_date and end_date are required.")
        if end < start:
            raise CmsValidationError("end_date cannot be before start_date.")
        row = Events.objects.create(
            event_title=title[:200],
            event_description=str(payload.get("event_description", "")).strip(),
            start_date=start,
            end_date=end,
            event_type=str(payload.get("event_type", "public")).strip() or "public",
            event_color=str(payload.get("event_color", "#3788d8")).strip() or "#3788d8",
            event_for=str(payload.get("event_for", "all")).strip() or "all",
            role_id=_as_int(payload.get("role_id")),
            is_active=str(payload.get("is_active", "yes")).strip() or "yes",
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "event_title" in payload:
            title = str(payload.get("event_title", "")).strip()
            if not title:
                raise CmsValidationError("event_title cannot be empty.")
            row.event_title = title[:200]
        if "event_description" in payload:
            row.event_description = str(payload.get("event_description") or "").strip()
        if "start_date" in payload:
            row.start_date = _parse_dt(payload.get("start_date")) or row.start_date
        if "end_date" in payload:
            row.end_date = _parse_dt(payload.get("end_date")) or row.end_date
        if row.end_date < row.start_date:
            raise CmsValidationError("end_date cannot be before start_date.")
        for field in ("event_type", "event_color", "event_for", "is_active"):
            if field in payload:
                setattr(row, field, str(payload.get(field) or "").strip())
        if "role_id" in payload:
            row.role_id = _as_int(payload.get("role_id"))
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class CmsMediaService:
    """Gallery + media manager share front_cms_media_gallery."""

    def list(self, *, query: str | None = None, category: str | None = None):
        qs = FrontCmsMediaGallery.objects.all().order_by("-id")
        if category:
            qs = qs.filter(category__iexact=category)
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(img_name__icontains=term)
                | Q(vid_title__icontains=term)
                | Q(content_description__icontains=term)
                | Q(category__icontains=term)
            )
        return qs

    def get(self, pk: int) -> FrontCmsMediaGallery:
        row = FrontCmsMediaGallery.objects.filter(id=pk).first()
        if row is None:
            raise CmsNotFoundError("Media item not found.")
        return row

    def to_dict(self, row: FrontCmsMediaGallery) -> dict[str, Any]:
        return {
            "id": row.id,
            "category": row.category,
            "image": row.image,
            "thumb_path": row.thumb_path,
            "dir_path": row.dir_path,
            "img_name": row.img_name,
            "thumb_name": row.thumb_name,
            "file_type": row.file_type,
            "file_size": row.file_size,
            "vid_url": row.vid_url,
            "vid_title": row.vid_title,
            "is_it_award": row.is_it_award,
            "is_it_form": row.is_it_form,
            "is_it_notice": row.is_it_notice,
            "is_it_order": row.is_it_order,
            "is_it_report": row.is_it_report,
            "content_description": row.content_description,
            "created_at": row.created_at,
        }

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        row = FrontCmsMediaGallery.objects.create(
            category=str(payload.get("category", "gallery")).strip() or "gallery",
            image=str(payload.get("image", "")).strip() or None,
            thumb_path=str(payload.get("thumb_path", "")).strip() or None,
            dir_path=str(payload.get("dir_path", "")).strip() or None,
            img_name=str(payload.get("img_name", "")).strip() or None,
            thumb_name=str(payload.get("thumb_name", "")).strip() or None,
            created_at=timezone.now(),
            file_type=str(payload.get("file_type", "image")).strip() or "image",
            file_size=str(payload.get("file_size", "0")).strip() or "0",
            vid_url=str(payload.get("vid_url", "")).strip(),
            vid_title=str(payload.get("vid_title", "")).strip(),
            is_it_award=_as_int(payload.get("is_it_award"), 0) or 0,
            is_it_form=_as_int(payload.get("is_it_form"), 0) or 0,
            is_it_notice=_as_int(payload.get("is_it_notice"), 0) or 0,
            is_it_order=_as_int(payload.get("is_it_order"), 0) or 0,
            is_it_report=_as_int(payload.get("is_it_report"), 0) or 0,
            content_description=str(payload.get("content_description", "")).strip(),
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        for field in (
            "category",
            "image",
            "thumb_path",
            "dir_path",
            "img_name",
            "thumb_name",
            "file_type",
            "file_size",
            "vid_url",
            "vid_title",
            "content_description",
        ):
            if field in payload:
                val = payload.get(field)
                setattr(
                    row, field, (str(val).strip() if val is not None else "") or None
                )
        for field in (
            "is_it_award",
            "is_it_form",
            "is_it_notice",
            "is_it_order",
            "is_it_report",
        ):
            if field in payload:
                setattr(row, field, _as_int(payload.get(field), 0) or 0)
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class CmsPageService:
    """Pages and CMS notices (type=notice)."""

    def list(self, *, query: str | None = None, page_type: str | None = None):
        qs = FrontCmsPages.objects.all().order_by("-id")
        if page_type:
            qs = qs.filter(Q(type=page_type) | Q(page_type=page_type))
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(title__icontains=term)
                | Q(slug__icontains=term)
                | Q(description__icontains=term)
            )
        return qs

    def get(self, pk: int) -> FrontCmsPages:
        row = FrontCmsPages.objects.filter(id=pk).first()
        if row is None:
            raise CmsNotFoundError("Page not found.")
        return row

    def to_dict(self, row: FrontCmsPages) -> dict[str, Any]:
        return {
            "id": row.id,
            "page_type": row.page_type,
            "is_homepage": row.is_homepage,
            "title": row.title,
            "url": row.url,
            "type": row.type,
            "slug": row.slug,
            "meta_title": row.meta_title,
            "meta_description": row.meta_description,
            "meta_keyword": row.meta_keyword,
            "feature_image": row.feature_image,
            "description": row.description,
            "publish_date": row.publish_date,
            "publish": row.publish,
            "sidebar": row.sidebar,
            "is_active": row.is_active,
            "created_at": row.created_at,
        }

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        title = str(payload.get("title", "")).strip()
        if not title:
            raise CmsValidationError("title is required.")
        slug = str(payload.get("slug", "")).strip() or slugify(title)[:200]
        row = FrontCmsPages.objects.create(
            page_type=str(payload.get("page_type", "manual")).strip() or "manual",
            is_homepage=_as_int(payload.get("is_homepage"), 0) or 0,
            title=title[:250],
            url=str(payload.get("url", "")).strip() or None,
            type=str(payload.get("type", "page")).strip() or "page",
            slug=slug,
            meta_title=str(payload.get("meta_title", "")).strip() or None,
            meta_description=str(payload.get("meta_description", "")).strip() or None,
            meta_keyword=str(payload.get("meta_keyword", "")).strip() or None,
            feature_image=str(payload.get("feature_image", "")).strip() or "",
            description=str(payload.get("description", "")).strip() or None,
            publish_date=_parse_d(payload.get("publish_date")),
            publish=_as_int(payload.get("publish"), 0) or 0,
            sidebar=_as_int(payload.get("sidebar"), 0) or 0,
            is_active=str(payload.get("is_active", "yes")).strip() or "yes",
            created_at=timezone.now(),
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "title" in payload:
            title = str(payload.get("title", "")).strip()
            if not title:
                raise CmsValidationError("title cannot be empty.")
            row.title = title[:250]
        for field in (
            "page_type",
            "url",
            "type",
            "slug",
            "meta_title",
            "meta_description",
            "meta_keyword",
            "feature_image",
            "description",
            "is_active",
        ):
            if field in payload:
                val = payload.get(field)
                setattr(
                    row,
                    field,
                    (str(val).strip() if val is not None else "") or None,
                )
        for field in ("is_homepage", "publish", "sidebar"):
            if field in payload:
                setattr(row, field, _as_int(payload.get(field), 0) or 0)
        if "publish_date" in payload:
            row.publish_date = _parse_d(payload.get("publish_date"))
        if "feature_image" in payload and row.feature_image is None:
            row.feature_image = ""
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class CmsMenuService:
    def list(self, *, query: str | None = None):
        qs = FrontCmsMenus.objects.all().order_by("menu", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(Q(menu__icontains=term) | Q(slug__icontains=term))
        return qs

    def get(self, pk: int) -> FrontCmsMenus:
        row = FrontCmsMenus.objects.filter(id=pk).first()
        if row is None:
            raise CmsNotFoundError("Menu not found.")
        return row

    def to_dict(self, row: FrontCmsMenus) -> dict[str, Any]:
        items = [
            {
                "id": it.id,
                "menu_id": it.menu_id,
                "menu": it.menu,
                "page_id": it.page_id,
                "parent_id": it.parent_id,
                "level": it.level,
                "ext_url": it.ext_url,
                "open_new_tab": it.open_new_tab,
                "ext_url_link": it.ext_url_link,
                "slug": it.slug,
                "weight": it.weight,
                "publish": it.publish,
                "description": it.description,
                "is_active": it.is_active,
            }
            for it in FrontCmsMenuItems.objects.filter(menu_id=row.id).order_by(
                "weight", "id"
            )
        ]
        return {
            "id": row.id,
            "menu": row.menu,
            "slug": row.slug,
            "description": row.description,
            "open_new_tab": row.open_new_tab,
            "ext_url": row.ext_url,
            "ext_url_link": row.ext_url_link,
            "publish": row.publish,
            "content_type": row.content_type,
            "is_active": row.is_active,
            "created_at": row.created_at,
            "items": items,
        }

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("menu", "")).strip()
        if not name:
            raise CmsValidationError("menu name is required.")
        row = FrontCmsMenus.objects.create(
            menu=name[:100],
            slug=str(payload.get("slug", "")).strip() or slugify(name)[:200],
            description=str(payload.get("description", "")).strip() or None,
            open_new_tab=_as_int(payload.get("open_new_tab"), 0) or 0,
            ext_url=str(payload.get("ext_url", "")).strip() or "",
            ext_url_link=str(payload.get("ext_url_link", "")).strip() or "",
            publish=_as_int(payload.get("publish"), 0) or 0,
            content_type=str(payload.get("content_type", "manual")).strip() or "manual",
            is_active=str(payload.get("is_active", "yes")).strip() or "yes",
            created_at=timezone.now(),
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "menu" in payload:
            name = str(payload.get("menu", "")).strip()
            if not name:
                raise CmsValidationError("menu name cannot be empty.")
            row.menu = name[:100]
        for field in (
            "slug",
            "description",
            "ext_url",
            "ext_url_link",
            "content_type",
            "is_active",
        ):
            if field in payload:
                val = payload.get(field)
                setattr(
                    row, field, (str(val).strip() if val is not None else "") or None
                )
        for field in ("open_new_tab", "publish"):
            if field in payload:
                setattr(row, field, _as_int(payload.get(field), 0) or 0)
        if row.ext_url is None:
            row.ext_url = ""
        if row.ext_url_link is None:
            row.ext_url_link = ""
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        row = self.get(pk)
        FrontCmsMenuItems.objects.filter(menu_id=row.id).delete()
        row.delete()

    def add_item(self, menu_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        self.get(menu_id)
        label = str(payload.get("menu", "")).strip() or "Item"
        item = FrontCmsMenuItems.objects.create(
            menu_id=menu_id,
            menu=label[:100],
            page_id=_as_int(payload.get("page_id"), 0) or 0,
            parent_id=_as_int(payload.get("parent_id"), 0) or 0,
            level=_as_int(payload.get("level"), 0) or 0,
            ext_url=str(payload.get("ext_url", "")).strip() or None,
            open_new_tab=_as_int(payload.get("open_new_tab"), 0) or 0,
            ext_url_link=str(payload.get("ext_url_link", "")).strip() or None,
            slug=str(payload.get("slug", "")).strip() or slugify(label)[:200],
            weight=_as_int(payload.get("weight"), 0) or 0,
            publish=_as_int(payload.get("publish"), 0) or 0,
            description=str(payload.get("description", "")).strip() or None,
            is_active=str(payload.get("is_active", "yes")).strip() or "yes",
            created_at=timezone.now(),
        )
        return self.to_dict(self.get(menu_id)) | {"created_item_id": item.id}

    def delete_item(self, menu_id: int, item_id: int) -> None:
        self.get(menu_id)
        item = FrontCmsMenuItems.objects.filter(id=item_id, menu_id=menu_id).first()
        if item is None:
            raise CmsNotFoundError("Menu item not found.")
        item.delete()


class CmsBannerService:
    """Banners stored as front_cms_programs with type=banner."""

    def list(self, *, query: str | None = None):
        qs = FrontCmsPrograms.objects.filter(type="banner").order_by("-id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(Q(title__icontains=term) | Q(description__icontains=term))
        return qs

    def get(self, pk: int) -> FrontCmsPrograms:
        row = FrontCmsPrograms.objects.filter(id=pk, type="banner").first()
        if row is None:
            raise CmsNotFoundError("Banner not found.")
        return row

    def to_dict(self, row: FrontCmsPrograms) -> dict[str, Any]:
        return {
            "id": row.id,
            "type": row.type,
            "title": row.title,
            "slug": row.slug,
            "url": row.url,
            "description": row.description,
            "feature_image": row.feature_image,
            "publish": row.publish,
            "is_active": row.is_active,
            "publish_date": row.publish_date,
            "created_at": row.created_at,
        }

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        title = str(payload.get("title", "")).strip()
        if not title:
            raise CmsValidationError("title is required.")
        row = FrontCmsPrograms.objects.create(
            type="banner",
            slug=str(payload.get("slug", "")).strip() or slugify(title)[:255],
            url=str(payload.get("url", "")).strip() or None,
            title=title[:200],
            date=timezone.localdate(),
            event_start=None,
            event_end=None,
            event_venue=None,
            description=str(payload.get("description", "")).strip() or None,
            is_active=str(payload.get("is_active", "yes")).strip() or "yes",
            created_at=timezone.now(),
            meta_title="",
            meta_description="",
            meta_keyword="",
            feature_image=str(payload.get("feature_image", "")).strip(),
            publish_date=_parse_d(payload.get("publish_date")),
            publish=str(payload.get("publish", "1")).strip() or "1",
            sidebar=0,
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "title" in payload:
            title = str(payload.get("title", "")).strip()
            if not title:
                raise CmsValidationError("title cannot be empty.")
            row.title = title[:200]
        for field in (
            "slug",
            "url",
            "description",
            "feature_image",
            "is_active",
            "publish",
        ):
            if field in payload:
                setattr(row, field, str(payload.get(field) or "").strip())
        if "publish_date" in payload:
            row.publish_date = _parse_d(payload.get("publish_date"))
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class CmsSettingsService:
    def get_or_create(self) -> FrontCmsSettings:
        row = FrontCmsSettings.objects.order_by("id").first()
        if row:
            return row
        return FrontCmsSettings.objects.create(
            theme="default",
            is_active_rtl=0,
            is_active_front_cms=0,
            is_active_sidebar=0,
            logo=None,
            contact_us_email=None,
            complain_form_email=None,
            sidebar_options="",
            whatsapp_url="",
            fb_url="",
            twitter_url="",
            youtube_url="",
            google_plus="",
            instagram_url="",
            pinterest_url="",
            linkedin_url="",
            google_analytics=None,
            footer_text=None,
            cookie_consent="",
            fav_icon=None,
            created_at=timezone.now(),
        )

    def to_dict(self, row: FrontCmsSettings) -> dict[str, Any]:
        return {
            "id": row.id,
            "theme": row.theme,
            "is_active_rtl": row.is_active_rtl,
            "is_active_front_cms": row.is_active_front_cms,
            "is_active_sidebar": row.is_active_sidebar,
            "logo": row.logo,
            "contact_us_email": row.contact_us_email,
            "complain_form_email": row.complain_form_email,
            "sidebar_options": row.sidebar_options,
            "whatsapp_url": row.whatsapp_url,
            "fb_url": row.fb_url,
            "twitter_url": row.twitter_url,
            "youtube_url": row.youtube_url,
            "google_plus": row.google_plus,
            "instagram_url": row.instagram_url,
            "pinterest_url": row.pinterest_url,
            "linkedin_url": row.linkedin_url,
            "google_analytics": row.google_analytics,
            "footer_text": row.footer_text,
            "cookie_consent": row.cookie_consent,
            "fav_icon": row.fav_icon,
            "created_at": row.created_at,
        }

    def update(self, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get_or_create()
        for field in (
            "theme",
            "logo",
            "contact_us_email",
            "complain_form_email",
            "sidebar_options",
            "whatsapp_url",
            "fb_url",
            "twitter_url",
            "youtube_url",
            "google_plus",
            "instagram_url",
            "pinterest_url",
            "linkedin_url",
            "google_analytics",
            "footer_text",
            "cookie_consent",
            "fav_icon",
        ):
            if field in payload:
                val = payload.get(field)
                setattr(
                    row, field, (str(val).strip() if val is not None else "") or None
                )
        for field in ("is_active_rtl", "is_active_front_cms", "is_active_sidebar"):
            if field in payload:
                setattr(row, field, _as_int(payload.get(field), 0) or 0)
        for required_blank in (
            "sidebar_options",
            "whatsapp_url",
            "fb_url",
            "twitter_url",
            "youtube_url",
            "google_plus",
            "instagram_url",
            "pinterest_url",
            "linkedin_url",
            "cookie_consent",
        ):
            if getattr(row, required_blank) is None:
                setattr(row, required_blank, "")
        row.save()
        return self.to_dict(row)

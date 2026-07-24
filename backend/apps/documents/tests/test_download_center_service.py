from unittest.mock import patch

import pytest

from apps.documents.domain.certificate_exceptions import CertificateValidationError
from apps.documents.services.download_center_service import (
    ContentTypeService,
    UploadContentService,
    VideoTutorialService,
)


def test_content_type_requires_name():
    with pytest.raises(CertificateValidationError, match="name"):
        ContentTypeService().create({"name": "  "})


def test_upload_content_requires_real_name():
    with patch.object(ContentTypeService, "get", return_value=object()):
        with pytest.raises(CertificateValidationError, match="real_name"):
            UploadContentService().create(
                {"content_type_id": 1, "real_name": " "}, upload_by=1
            )


def test_upload_content_requires_content_type():
    with pytest.raises(CertificateValidationError, match="content_type_id"):
        UploadContentService().create({"real_name": "notes.pdf"}, upload_by=1)


def test_upload_content_requires_upload_by():
    with patch.object(ContentTypeService, "get", return_value=object()):
        with pytest.raises(CertificateValidationError, match="upload_by"):
            UploadContentService().create(
                {"content_type_id": 1, "real_name": "notes.pdf"}, upload_by=0
            )


def test_video_tutorial_requires_title():
    with pytest.raises(CertificateValidationError, match="title"):
        VideoTutorialService().create(
            {"title": " ", "description": "d", "video_link": "http://x"},
            created_by=1,
        )


def test_video_tutorial_requires_link():
    with pytest.raises(CertificateValidationError, match="video_link"):
        VideoTutorialService().create(
            {"title": "Intro", "description": "d", "video_link": " "},
            created_by=1,
        )


def test_video_tutorial_requires_created_by():
    with pytest.raises(CertificateValidationError, match="created_by"):
        VideoTutorialService().create(
            {"title": "Intro", "description": "d", "video_link": "http://x"},
            created_by=0,
        )

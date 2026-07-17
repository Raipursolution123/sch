from unittest.mock import MagicMock, patch

import pytest
from rest_framework_simplejwt.exceptions import TokenError

from core.auth.jwt_blacklist import (
    blacklist_refresh_token,
    is_refresh_token_blacklisted,
)


def test_blacklist_and_check_uses_cache():
    token = MagicMock()
    token.get.side_effect = lambda key: {"jti": "abc123", "exp": 9_999_999_999}.get(key)

    with (
        patch("core.auth.jwt_blacklist.RefreshToken", return_value=token),
        patch("core.auth.jwt_blacklist.cache") as cache_mock,
    ):
        cache_mock.get.return_value = None
        blacklist_refresh_token("raw-token")
        cache_mock.set.assert_called_once()
        key = cache_mock.set.call_args.args[0]
        assert key.endswith("abc123")

        cache_mock.get.return_value = "1"
        assert is_refresh_token_blacklisted("raw-token") is True


def test_blacklist_requires_jti():
    token = MagicMock()
    token.get.return_value = None
    with patch("core.auth.jwt_blacklist.RefreshToken", return_value=token):
        with pytest.raises(TokenError, match="jti"):
            blacklist_refresh_token("raw-token")

"""Helpers for repairing legacy UTF-8 / Windows-1252 mojibake in stored text."""

from __future__ import annotations

import unicodedata


def repair_utf8_cp1252_mojibake(value: str | None) -> str:
    """
    Repair strings whose UTF-8 bytes were once misread as Windows-1252 and
    re-saved as UTF-8 (e.g. ₹ stored as â‚¹).

    Safe for currency symbols and other short non-ASCII glyphs. Leaves values
    unchanged when repair is not applicable.
    """
    if value is None:
        return ""
    text = str(value)
    if not text or text.isascii():
        return text

    try:
        repaired = text.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text

    if repaired == text:
        return text

    # Accept repair for short symbols / currency marks (Sc), typical of this bug.
    if len(repaired) <= 4 and (
        any(unicodedata.category(ch) == "Sc" for ch in repaired)
        or any(not ch.isascii() for ch in repaired)
    ):
        return repaired

    return text

from common.text_encoding import repair_utf8_cp1252_mojibake


def test_repairs_rupee_mojibake():
    assert repair_utf8_cp1252_mojibake("â‚¹") == "₹"


def test_leaves_ascii_unchanged():
    assert repair_utf8_cp1252_mojibake("INR") == "INR"
    assert repair_utf8_cp1252_mojibake("") == ""
    assert repair_utf8_cp1252_mojibake(None) == ""


def test_leaves_correct_rupee_unchanged():
    assert repair_utf8_cp1252_mojibake("₹") == "₹"

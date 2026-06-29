"""Extract sch_settings INSERT template from db_current.sql."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = ROOT / "docs" / "db_current.sql"
OUT = ROOT / "backend" / "seeds" / "templates" / "sch_settings_insert.sql"

text = SOURCE.read_text(encoding="utf-8", errors="replace")
marker = "INSERT INTO `sch_settings`"
start = text.index(marker)
end = text.index(";\n", start) + 1
insert = text[start:end]
insert = insert.replace("'0000-00-00'", "NULL")
insert = insert.replace("https://erp.appapublicschool.com/", "__BASE_URL__")
insert = insert.replace("/home/erp228/public_html/uploads/", "__FOLDER_PATH__")
insert = insert.replace("APPA PUBLIC SCHOOL", "__SCHOOL_NAME__")
insert = insert.replace("apskalaburagi2010@gmail.com", "__SCHOOL_EMAIL__")
insert = insert.replace("9886681213", "__SCHOOL_PHONE__")
insert = insert.replace("Sharan Nagar, Kalaburagi 585103", "__SCHOOL_ADDRESS__")
insert = insert.replace("'Asia/Kolkata', 20,", "'Asia/Kolkata', __SESSION_ID__,")
insert = insert.replace(", 20, ''", ", __SESSION_ID__, ''", 1)
insert = insert.replace("'4', 0, 0.00", "'__LANG_ID__', 0, 0.00", 1)
insert = insert.replace("'[\"33\",\"33\",\"4\"]'", "'__LANGUAGES__'")
insert = insert.replace("'68', '$'", "'__CURRENCY__', '__CURRENCY_SYMBOL__'")
insert = insert.replace("'2026-06-22 12:30:44'", "'__CREATED_AT__'")
insert = insert.replace(", '', 'qrcode', ''", ", '__CRON_SECRET__', 'qrcode', ''", 1)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(insert, encoding="utf-8")
print(f"Wrote {OUT}")

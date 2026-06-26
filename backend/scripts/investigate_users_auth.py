"""Investigate users table: duplicate usernames and password storage patterns."""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path

import MySQLdb

OUTPUT = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "users_auth_investigation.json"


def classify_password(stored: str | None) -> str:
    if stored is None or stored == "":
        return "empty"
    if len(stored) == 32 and re.fullmatch(r"[a-fA-F0-9]{32}", stored):
        return "md5_hex"
    if len(stored) == 40 and re.fullmatch(r"[a-fA-F0-9]{40}", stored):
        return "sha1_hex"
    if len(stored) == 64 and re.fullmatch(r"[a-fA-F0-9]{64}", stored):
        return "sha256_hex"
    if stored.isdigit():
        return "numeric_plain"
    if len(stored) <= 20 and stored.isascii():
        return "short_plaintext_candidate"
    return "other"


def main():
    conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
    cur = conn.cursor()

    report: dict = {}

    # Totals
    cur.execute("SELECT COUNT(*) FROM users")
    report["total_users"] = cur.fetchone()[0]

    cur.execute("SELECT COUNT(DISTINCT username) FROM users WHERE username IS NOT NULL")
    report["distinct_usernames"] = cur.fetchone()[0]

    cur.execute(
        """
        SELECT username, COUNT(*) AS cnt
        FROM users
        WHERE username IS NOT NULL AND username != ''
        GROUP BY username
        HAVING cnt > 1
        ORDER BY cnt DESC
        LIMIT 25
        """
    )
    duplicates = [{"username": r[0], "count": r[1]} for r in cur.fetchall()]
    report["duplicate_username_samples"] = duplicates

    cur.execute(
        """
        SELECT COUNT(*) FROM (
            SELECT username FROM users
            WHERE username IS NOT NULL AND username != ''
            GROUP BY username HAVING COUNT(*) > 1
        ) t
        """
    )
    report["usernames_with_duplicates"] = cur.fetchone()[0]

    cur.execute(
        """
        SELECT COUNT(*) FROM users u
        WHERE username IS NOT NULL AND username != ''
          AND EXISTS (
            SELECT 1 FROM users u2
            WHERE u2.username = u.username AND u2.id != u.id
          )
        """
    )
    report["user_rows_in_duplicate_groups"] = cur.fetchone()[0]

    # Duplicate breakdown by role
    cur.execute(
        """
        SELECT u.username, u.role, COUNT(*) AS cnt
        FROM users u
        INNER JOIN (
            SELECT username FROM users
            WHERE username IS NOT NULL AND username != ''
            GROUP BY username HAVING COUNT(*) > 1
        ) d ON d.username = u.username
        GROUP BY u.username, u.role
        ORDER BY u.username, cnt DESC
        LIMIT 50
        """
    )
    report["duplicate_username_role_breakdown"] = [
        {"username": r[0], "role": r[1], "count": r[2]} for r in cur.fetchall()
    ]

    # Is (username, role) unique?
    cur.execute(
        """
        SELECT COUNT(*) FROM (
            SELECT username, role FROM users
            WHERE username IS NOT NULL
            GROUP BY username, role HAVING COUNT(*) > 1
        ) t
        """
    )
    report["duplicate_username_role_pairs"] = cur.fetchone()[0]

    # Is (username, role, user_id) unique?
    cur.execute(
        """
        SELECT COUNT(*) FROM (
            SELECT username, role, user_id FROM users
            GROUP BY username, role, user_id HAVING COUNT(*) > 1
        ) t
        """
    )
    report["duplicate_username_role_userid_triples"] = cur.fetchone()[0]

    # user_id meaning: links to students/staff?
    cur.execute(
        """
        SELECT u.role, COUNT(*) AS cnt,
               SUM(CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END) AS matches_student,
               SUM(CASE WHEN st.id IS NOT NULL THEN 1 ELSE 0 END) AS matches_staff
        FROM users u
        LEFT JOIN students s ON s.id = u.user_id
        LEFT JOIN staff st ON st.id = u.user_id
        GROUP BY u.role
        ORDER BY cnt DESC
        """
    )
    report["user_id_entity_mapping_by_role"] = [
        {
            "role": r[0],
            "count": r[1],
            "matches_student_id": int(r[2]),
            "matches_staff_id": int(r[3]),
        }
        for r in cur.fetchall()
    ]

    # Password pattern analysis (no raw passwords in output)
    cur.execute("SELECT password FROM users WHERE password IS NOT NULL AND password != ''")
    patterns = Counter()
    lengths = Counter()
    for (pwd,) in cur.fetchall():
        patterns[classify_password(pwd)] += 1
        lengths[len(pwd)] += 1
    report["password_patterns"] = dict(patterns)
    report["password_lengths"] = dict(sorted(lengths.items()))

    # Test common passwords against duplicate username sample (redacted output)
    if duplicates:
        sample_username = duplicates[0]["username"]
        cur.execute(
            "SELECT id, user_id, role, password, is_active FROM users WHERE username = %s",
            (sample_username,),
        )
        rows = cur.fetchall()
        test_passwords = ["admin", "password", "123456", "student", "teacher", "staff"]
        algorithm_hits = []
        for row in rows:
            uid, user_id, role, stored, active = row
            matched = []
            for test in test_passwords:
                if stored == test:
                    matched.append("plaintext")
                if stored == hashlib.md5(test.encode()).hexdigest():
                    matched.append("md5")
                if stored == hashlib.sha1(test.encode()).hexdigest():
                    matched.append("sha1")
            algorithm_hits.append(
                {
                    "id": uid,
                    "user_id": user_id,
                    "role": role,
                    "is_active": active,
                    "password_pattern": classify_password(stored),
                    "test_algorithm_matches": matched or None,
                }
            )
        report["duplicate_sample_auth_analysis"] = {
            "sample_username_redacted": f"<duplicate#{sample_username[:2]}...>",
            "rows": algorithm_hits,
        }

    # users_authentication linkage
    cur.execute(
        """
        SELECT COUNT(*) FROM users_authentication ua
        INNER JOIN users u ON u.id = ua.users_id
        """
    )
    report["users_authentication_linked_rows"] = cur.fetchone()[0]

    cur.execute(
        """
        SELECT u.role, COUNT(*) FROM users_authentication ua
        INNER JOIN users u ON u.id = ua.users_id
        GROUP BY u.role
        """
    )
    report["users_authentication_by_role"] = {r[0]: r[1] for r in cur.fetchall()}

    # Active vs inactive
    cur.execute(
        "SELECT is_active, COUNT(*) FROM users GROUP BY is_active ORDER BY COUNT(*) DESC"
    )
    report["is_active_distribution"] = {str(r[0]): r[1] for r in cur.fetchall()}

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(json.dumps(report, indent=2))
    conn.close()


if __name__ == "__main__":
    main()

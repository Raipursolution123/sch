"""Deep dive: duplicate user rows and password correlation (no secrets in output)."""
import json
from pathlib import Path

import MySQLdb

conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
cur = conn.cursor()

report = {}

# Duplicate rows: are password/childs/verification_code identical within groups?
cur.execute(
    """
    SELECT username, role, user_id,
           COUNT(*) AS cnt,
           COUNT(DISTINCT password) AS distinct_passwords,
           COUNT(DISTINCT childs) AS distinct_childs,
           COUNT(DISTINCT verification_code) AS distinct_verification_codes,
           GROUP_CONCAT(id ORDER BY id) AS user_ids
    FROM users
    WHERE username IN (
        SELECT username FROM users
        WHERE username IS NOT NULL AND username != ''
        GROUP BY username HAVING COUNT(*) > 1
    )
    GROUP BY username, role, user_id
    HAVING cnt > 1
    LIMIT 10
    """
)
report["duplicate_groups_detail"] = [
    {
        "username": r[0],
        "role": r[1],
        "user_id": r[2],
        "count": r[3],
        "distinct_passwords": r[4],
        "distinct_childs": r[5],
        "distinct_verification_codes": r[6],
        "user_row_ids": r[7],
    }
    for r in cur.fetchall()
]

# Password vs student admission_no / roll_no correlation (student role)
cur.execute(
    """
    SELECT
        SUM(CASE WHEN u.password = s.admission_no THEN 1 ELSE 0 END) AS pwd_eq_admission,
        SUM(CASE WHEN u.password = CAST(s.roll_no AS CHAR) THEN 1 ELSE 0 END) AS pwd_eq_roll,
        SUM(CASE WHEN u.password = s.admission_no OR u.password = CAST(s.roll_no AS CHAR) THEN 1 ELSE 0 END) AS pwd_eq_either,
        COUNT(*) AS total_student_users
    FROM users u
    INNER JOIN students s ON s.id = u.user_id
    WHERE u.role = 'student'
    """
)
r = cur.fetchone()
report["student_password_correlation"] = {
    "password_equals_admission_no": int(r[0]),
    "password_equals_roll_no": int(r[1]),
    "password_equals_admission_or_roll": int(r[2]),
    "total_student_users_with_student_join": int(r[3]),
}

# Staff password patterns
cur.execute(
    """
    SELECT COUNT(*) FROM users u
    INNER JOIN staff st ON st.id = u.user_id
    WHERE u.role NOT IN ('student', 'parent')
    """
)
report["staff_linked_users"] = cur.fetchone()[0]

cur.execute("SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY COUNT(*) DESC")
report["role_distribution"] = {r[0]: r[1] for r in cur.fetchall()}

# Legacy auth: users_authentication uses users.id not username
cur.execute(
    """
    SELECT ua.users_id, u.username, u.role, COUNT(*) AS token_count
    FROM users_authentication ua
    JOIN users u ON u.id = ua.users_id
    GROUP BY ua.users_id, u.username, u.role
    HAVING token_count > 1
    LIMIT 5
    """
)
report["multi_token_users_sample"] = [
    {"users_id": r[0], "username": r[1], "role": r[2], "token_count": r[3]}
    for r in cur.fetchall()
]

# Check if legacy login uses role in POST (parent vs student same email pattern)
cur.execute(
    """
    SELECT COUNT(*) FROM users WHERE role = 'parent' AND username LIKE '%@%'
    """
)
report["parent_email_style_usernames"] = cur.fetchone()[0]

out = Path(__file__).resolve().parent.parent.parent / "docs" / "database" / "users_auth_investigation_deep.json"
out.write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report, indent=2))
conn.close()

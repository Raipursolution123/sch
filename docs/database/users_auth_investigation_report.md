# Users Authentication Investigation

**Database:** `db_current.users`  
**Data:** `docs/database/users_auth_investigation.json`, `users_auth_investigation_deep.json`

---

## 1. Duplicate Usernames

| Metric | Value |
|--------|-------|
| Total user rows | 7,251 |
| Distinct usernames | 7,215 |
| Usernames with duplicates | **36** |
| Rows in duplicate groups | **72** |

**Pattern:** All duplicates are `std*` usernames with `role = student`, same `user_id` (links to `students.id`), **two rows per student** with **different passwords**.

Example (`std24`):

| users.id | user_id | role | distinct passwords |
|----------|---------|------|--------------------|
| 43, 153 | 24 | student | 2 |

This is legacy data duplication (likely re-provisioned credentials), not cross-student collision.

---

## 2. How Legacy ERP Handles Non-Unique Usernames

The legacy system does **not** rely on username uniqueness alone.

### Login composite key

| Tuple | Unique? |
|-------|---------|
| `username` alone | **No** (36 collisions) |
| `username + role` | **No** (duplicates share role) |
| `username + role + user_id` | **No** (2 rows per student) |
| `username + password + role` | **Yes** (each duplicate row has a different password) |

**Conclusion:** Legacy login query is effectively:

```sql
SELECT * FROM users
WHERE username = ? AND password = ? AND role = ?
```

The UI also exposes **role selection** (student vs parent) — only these two roles exist in `users` (3,641 student + 3,610 parent).

### Post-login session

`users_authentication` stores tokens keyed by **`users.id`** (integer PK), not username:

- 658 linked rows; 560 student, 98 parent
- Multiple tokens per `users.id` are allowed (active sessions)

Staff/admin authentication uses the **`staff`** table (`staff.password` column) — not the `users` table.

### Django backend fix applied

`UsernameBackend` now iterates `username` (+ optional `role`) and matches **plaintext password**, returning the first active match — aligned with legacy behavior.

---

## 3. Password Storage Algorithm

| Pattern | Count | % |
|---------|-------|---|
| Short plaintext (≤20 chars, non-hex) | 7,216 | 99.5% |
| Numeric plaintext | 31 | 0.4% |
| Other | 4 | <0.1% |
| MD5 hex (32 chars) | **0** | 0% |
| SHA1 hex (40 chars) | **0** | 0% |

**Dominant length:** 6 characters (7,003 rows).

**Correlation with student fields:**

| Match | Count |
|-------|-------|
| `password = admission_no` | 0 |
| `password = roll_no` | 1 |
| Total student users | 3,641 |

### Conclusion

Passwords are stored as **plaintext** in `users.password` (varchar 50), not MD5/SHA1.  
`legacy_password.py` updated: plaintext first, hash fallbacks only for edge cases.

**Security note:** This matches legacy ERP behavior; do not change storage without explicit migration approval.

---

## 4. Role Distribution

| Role | Count | `user_id` → `students.id` match |
|------|-------|----------------------------------|
| student | 3,641 | 3,641 (100%) |
| parent | 3,610 | 92 (partial — parent accounts use other linkage via `childs` text field) |

No admin/superadmin rows in `users` — staff authenticate separately.

---

## 5. Recommendations

1. **Login API** must accept `username`, `password`, and **`role`** (student/parent).
2. **Do not use** `User.objects.get(username=...)` — use filter + password match.
3. **JWT `user_id` claim** maps to `users.id`, not `students.id`.
4. **Verify** one known test credential with role to confirm plaintext match (manual QA).
5. **Duplicate rows:** consider read-only dedup analysis later — **no schema change** without approval.

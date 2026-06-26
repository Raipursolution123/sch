import MySQLdb

conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
cur = conn.cursor()
cur.execute(
    """
    SELECT username, role, user_id,
           COUNT(*) AS cnt,
           COUNT(DISTINCT password) AS distinct_passwords
    FROM users
    GROUP BY username, role, user_id
    HAVING cnt > 1
    """
)
rows = cur.fetchall()
same_pwd = sum(1 for r in rows if r[3] == 1)
diff_pwd = sum(1 for r in rows if r[3] > 1)
print(f"duplicate groups: {len(rows)}")
print(f"groups with identical passwords: {same_pwd}")
print(f"groups with different passwords: {diff_pwd}")

# Can username+password+role uniquely identify?
cur.execute(
    """
    SELECT COUNT(*) FROM (
        SELECT username, password, role FROM users
        GROUP BY username, password, role HAVING COUNT(*) > 1
    ) t
    """
)
print(f"duplicate username+password+role triples: {cur.fetchone()[0]}")

# Admin users elsewhere?
cur.execute("SELECT COUNT(*) FROM staff WHERE password IS NOT NULL AND password != ''")
print(f"staff with password column: {cur.fetchone()[0]}")
conn.close()

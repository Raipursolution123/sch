import MySQLdb

conn = MySQLdb.connect(host="localhost", user="root", passwd="", db="db_current")
cur = conn.cursor()
for pattern in ["auth_%", "django_%", "token_%", "celery_%", "django_celery%"]:
    cur.execute(f"SHOW TABLES LIKE '{pattern}'")
    print(pattern, [r[0] for r in cur.fetchall()])

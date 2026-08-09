import psycopg2

conn = psycopg2.connect(dbname='postgres', host='localhost', port=5432, user='postgres', password='123456')
conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname = 'hackflow'")
exists = cur.fetchone()
if not exists:
    cur.execute("CREATE DATABASE hackflow")
    print('DATABASE_CREATED')
else:
    print('DATABASE_EXISTS')
cur.close()
conn.close()

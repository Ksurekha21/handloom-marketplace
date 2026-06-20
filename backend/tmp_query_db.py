import sqlite3
import glob
import os
import json

base = os.path.join(os.path.dirname(__file__), 'instance')
dbs = glob.glob(os.path.join(base, '*.db'))
results = {}
for dbpath in dbs:
    try:
        conn = sqlite3.connect(dbpath)
        cur = conn.cursor()
        # try common table names
        for tbl in ('saree','sarees','Saree'):
            try:
                cur.execute("SELECT id, title, category FROM %s WHERE (title LIKE ? OR category LIKE ?)" % tbl, ('%Venkatagiri%', '%Silk%'))
                rows = cur.fetchall()
                if rows:
                    results[os.path.basename(dbpath)] = rows
                    break
            except Exception:
                continue
        conn.close()
    except Exception as e:
        results[os.path.basename(dbpath)] = {'error': str(e)}

print(json.dumps(results, default=str))

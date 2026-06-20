#!/usr/bin/env python3
import sqlite3
import sys
from werkzeug.security import check_password_hash

if len(sys.argv) < 3:
    print('Usage: python check_hash.py <email> <password>')
    sys.exit(1)

email = sys.argv[1]
pwd = sys.argv[2]
conn = sqlite3.connect('backend/instance/handloom.db')
cur = conn.cursor()
cur.execute('select password from user where lower(email)=lower(?)', (email,))
row = cur.fetchone()
if not row:
    print('No user found for', email)
    sys.exit(2)
stored = row[0]
print('stored_hash=', stored)
print('check_password_hash ->', check_password_hash(stored, pwd))
conn.close()

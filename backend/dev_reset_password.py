#!/usr/bin/env python3
from werkzeug.security import generate_password_hash
import sqlite3
import sys

def usage():
    print("Usage: python dev_reset_password.py <email> <newpassword>")

def main():
    if len(sys.argv) < 3:
        usage(); sys.exit(1)
    email = sys.argv[1]
    newpwd = sys.argv[2]
    hashed = generate_password_hash(newpwd)
    dbpath = 'backend/instance/handloom.db'
    conn = sqlite3.connect(dbpath)
    cur = conn.cursor()
    cur.execute('UPDATE user SET password = ? WHERE lower(email) = lower(?)', (hashed, email))
    conn.commit()
    print(f'Updated rows: {cur.rowcount}')
    conn.close()

if __name__ == '__main__':
    main()

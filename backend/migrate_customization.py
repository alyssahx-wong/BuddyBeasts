#!/usr/bin/env python3
"""
Migration script to add customization column to monsters table.
Run this with: python backend/migrate_customization.py
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env.local')

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("DATABASE_URL not found in .env.local")
    exit(1)

SQL = """
ALTER TABLE monsters ADD COLUMN IF NOT EXISTS customization JSONB DEFAULT NULL;
"""

try:
    print("Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    print("Running migration...")
    cur.execute(SQL)
    conn.commit()

    print("Migration completed successfully!")
    print("  - Added column: monsters.customization (JSONB, nullable)")

    cur.close()
    conn.close()
except Exception as e:
    print(f"Migration failed: {e}")
    exit(1)

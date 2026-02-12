#!/usr/bin/env python3
"""
Migration script to add chat_read_status table
Run this with: python backend/migrate_chat_read_status.py
"""

import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Get database URL
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env.local")
    exit(1)

# SQL to create the table
SQL = """
-- Migration: Add chat_read_status table to track when users last read conversations

CREATE TABLE IF NOT EXISTS chat_read_status (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    lobby_id VARCHAR NOT NULL,
    last_read_timestamp DOUBLE PRECISION NOT NULL,
    UNIQUE (user_id, lobby_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_read_status_user_id ON chat_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_read_status_lobby_id ON chat_read_status(lobby_id);
"""

try:
    print("📊 Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("🔄 Running migration...")
    cur.execute(SQL)
    conn.commit()
    
    print("✅ Migration completed successfully!")
    print("   - Created table: chat_read_status")
    print("   - Created index: idx_chat_read_status_user_id")
    print("   - Created index: idx_chat_read_status_lobby_id")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    exit(1)

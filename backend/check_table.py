#!/usr/bin/env python3
"""
Check if chat_read_status table exists in the database
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

try:
    print("📊 Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Check if table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'chat_read_status'
        );
    """)
    
    exists = cur.fetchone()[0]
    
    if exists:
        print("✅ Table 'chat_read_status' EXISTS")
        
        # Get row count
        cur.execute("SELECT COUNT(*) FROM chat_read_status;")
        count = cur.fetchone()[0]
        print(f"   📝 Contains {count} rows")
        
        # Show table structure
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'chat_read_status'
            ORDER BY ordinal_position;
        """)
        print("   📋 Table structure:")
        for col in cur.fetchall():
            print(f"      - {col[0]}: {col[1]}")
            
    else:
        print("❌ Table 'chat_read_status' DOES NOT EXIST")
        print("   Run: python backend/migrate_chat_read_status.py")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

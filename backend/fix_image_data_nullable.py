#!/usr/bin/env python3
"""Fix: Make image_data column nullable since we're using image_url now."""

from sqlalchemy import text
from database import engine

def make_image_data_nullable():
    """Make image_data column nullable."""
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                ALTER TABLE quest_photos 
                ALTER COLUMN image_data DROP NOT NULL;
            """))
            conn.commit()
            print("✅ Made image_data column nullable")
        except Exception as e:
            print(f"Note: {e}")
            conn.rollback()

if __name__ == '__main__':
    make_image_data_nullable()

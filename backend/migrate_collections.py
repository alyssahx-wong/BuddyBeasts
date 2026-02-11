#!/usr/bin/env python3
"""Add character collection system to database."""

from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Add the new columns
    conn.execute(text("ALTER TABLE monsters ADD COLUMN IF NOT EXISTS collected_monsters JSONB DEFAULT '[]'"))
    conn.execute(text("ALTER TABLE monsters ADD COLUMN IF NOT EXISTS selected_monster INTEGER DEFAULT 1"))
    
    # For existing users, set selected_monster to their current monster_type
    # and add it to their collected_monsters
    conn.execute(text("""
        UPDATE monsters 
        SET selected_monster = COALESCE(monster_type, 1),
            collected_monsters = jsonb_build_array(COALESCE(monster_type, 1))
        WHERE collected_monsters = '[]'::jsonb OR collected_monsters IS NULL
    """))
    
    conn.commit()
    print('✅ Database updated with character collection system!')

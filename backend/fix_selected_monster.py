#!/usr/bin/env python3
"""Ensure all monsters have selected_monster properly set."""

from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Update selected_monster to match monster_type for all users
    result = conn.execute(text("""
        UPDATE monsters 
        SET selected_monster = COALESCE(monster_type, 1),
            collected_monsters = CASE 
                WHEN collected_monsters IS NULL OR collected_monsters = '[]'::jsonb 
                THEN jsonb_build_array(COALESCE(monster_type, 1))
                ELSE collected_monsters
            END
    """))
    
    conn.commit()
    
    # Check the results
    check = conn.execute(text("SELECT user_id, monster_type, selected_monster, collected_monsters FROM monsters LIMIT 10"))
    print("Sample of updated monsters:")
    for user_id, monster_type, selected_monster, collected in check:
        print(f"  {user_id[:20]}... : type={monster_type}, selected={selected_monster}, collected={collected}")
    
    print(f"\n✅ All monsters updated with selected_monster!")

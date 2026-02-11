#!/usr/bin/env python3
"""Assign unique monster types to all users who still have penguin (type 1)."""

from database import engine
from sqlalchemy import text
import random

with engine.connect() as conn:
    # Get all users with their current monster_type
    result = conn.execute(text("SELECT id, user_id, monster_type, selected_monster FROM monsters"))
    monsters = list(result)
    
    print(f"Found {len(monsters)} monsters")
    
    # Update any users who don't have a proper monster_type assigned
    updated = 0
    for monster_id, user_id, monster_type, selected_monster in monsters:
        # If monster_type is 1 (penguin default), assign a random type
        if monster_type == 1 or monster_type is None:
            new_type = random.randint(1, 9)
            conn.execute(
                text("UPDATE monsters SET monster_type = :new_type, selected_monster = :new_type, collected_monsters = jsonb_build_array(:new_type) WHERE id = :mid"),
                {"new_type": new_type, "mid": monster_id}
            )
            updated += 1
            print(f"  Updated {user_id[:20]}... to monster type {new_type}")
    
    conn.commit()
    print(f"\n✅ Updated {updated} users with random monster types!")
    print(f"✅ {len(monsters) - updated} users already had unique types")

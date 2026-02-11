"""
Migration script to add participant_ids column to quest_photos table
"""
from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Add participant_ids column to quest_photos
        try:
            conn.execute(text("""
                ALTER TABLE quest_photos 
                ADD COLUMN IF NOT EXISTS participant_ids TEXT
            """))
            conn.commit()
            print("✅ Added participant_ids column to quest_photos")
        except Exception as e:
            print(f"❌ Error adding participant_ids column: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
    print("Migration completed!")

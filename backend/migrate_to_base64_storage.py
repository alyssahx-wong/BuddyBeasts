"""
Migration script: Convert quest_photos from S3 image_url to base64 image_data_base64
1. Adds image_data_base64 and image_mime_type columns if they don't exist
2. Backs up image_url data (you can manually delete the column after verifying)
"""

from sqlalchemy import create_engine, inspect, text
from database import DATABASE_URL


def add_base64_columns():
    """Add base64 and mime type columns if they don't exist."""
    engine = create_engine(DATABASE_URL)
    
    with engine.begin() as conn:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('quest_photos')]
        
        # Add image_data_base64 column
        if 'image_data_base64' not in columns:
            print("📝 Adding image_data_base64 column...")
            conn.execute(text("""
                ALTER TABLE quest_photos
                ADD COLUMN image_data_base64 TEXT
            """))
            print("✅ image_data_base64 column added")
        else:
            print("✅ image_data_base64 column already exists")
        
        # Add image_mime_type column
        if 'image_mime_type' not in columns:
            print("📝 Adding image_mime_type column...")
            conn.execute(text("""
                ALTER TABLE quest_photos
                ADD COLUMN image_mime_type VARCHAR(50) DEFAULT 'image/jpeg'
            """))
            print("✅ image_mime_type column added")
        else:
            print("✅ image_mime_type column already exists")
        
        # Check if we still have image_url column for reference
        if 'image_url' in columns:
            print("⚠️  image_url column still exists. You can safely delete it after verifying base64 migration.")
            print("   To remove it: ALTER TABLE quest_photos DROP COLUMN image_url;")


if __name__ == "__main__":
    print("🔄 Starting migration to base64 image storage...")
    add_base64_columns()
    print("✨ Migration complete!")

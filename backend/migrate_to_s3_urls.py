#!/usr/bin/env python3
"""
Migration script: Convert quest_photos from storing base64 image_data to S3 image_url
This script:
1. Checks if image_url column exists, if not adds it
2. Migrates existing photos (optional - you can skip if starting fresh)
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import text, inspect
from database import engine
import models

load_dotenv()

def migrate_photos_to_s3():
    """Add image_url column if it doesn't exist."""
    with engine.connect() as conn:
        # Check if image_url column exists
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('quest_photos')]
        
        if 'image_url' in columns:
            print("✅ image_url column already exists")
        else:
            print("📝 Adding image_url column...")
            conn.execute(text("""
                ALTER TABLE quest_photos 
                ADD COLUMN image_url VARCHAR(2048)
            """))
            conn.commit()
            print("✅ image_url column added")
        
        # Check if image_data column exists and backup if needed
        if 'image_data' in columns:
            print("⚠️  image_data column still exists. You can safely delete it after verifying S3 migration.")
            print("   To remove it: ALTER TABLE quest_photos DROP COLUMN image_data;")
        
        # Count photos without image_url
        result = conn.execute(text("""
            SELECT COUNT(*) as count FROM quest_photos WHERE image_url IS NULL
        """))
        count = result.scalar()
        
        if count > 0:
            print(f"⚠️  Found {count} photos without image_url. They were stored as base64.")
            print("   You'll need to re-upload these photos with the new S3 system.")
            print("   OR: Implement a conversion script if you want to preserve them.")
        
        conn.commit()

if __name__ == '__main__':
    print("🚀 Starting migration to S3-based photo storage...")
    try:
        # Create tables first
        models.Base.metadata.create_all(engine)
        print("✅ Tables created/verified")
        
        # Run migration
        migrate_photos_to_s3()
        
        print("\n✅ Migration complete!")
        print("\nNext steps:")
        print("1. Add AWS S3 credentials to .env.local")
        print("2. Restart the backend")
        print("3. Users can now upload photos (they'll be stored in S3)")
        print("4. Old photos will still be accessible but won't be migrated")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

def migrate_photos_to_s3():
    """Add image_url column if it doesn't exist."""
    with engine.connect() as conn:
        # Check if image_url column exists
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('quest_photos')]
        
        if 'image_url' in columns:
            print("✅ image_url column already exists")
        else:
            print("📝 Adding image_url column...")
            conn.execute(text("""
                ALTER TABLE quest_photos 
                ADD COLUMN image_url VARCHAR(2048)
            """))
            conn.commit()
            print("✅ image_url column added")
        
        # Check if image_data column exists and backup if needed
        if 'image_data' in columns:
            print("⚠️  image_data column still exists. You can safely delete it after verifying S3 migration.")
            print("   To remove it: ALTER TABLE quest_photos DROP COLUMN image_data;")
        
        # Count photos without image_url
        result = conn.execute(text("""
            SELECT COUNT(*) as count FROM quest_photos WHERE image_url IS NULL
        """))
        count = result.scalar()
        
        if count > 0:
            print(f"⚠️  Found {count} photos without image_url. They were stored as base64.")
            print("   You'll need to re-upload these photos with the new S3 system.")
            print("   OR: Implement a conversion script if you want to preserve them.")
        
        conn.commit()

if __name__ == '__main__':
    print("🚀 Starting migration to S3-based photo storage...")
    try:
        # Create tables first
        models.Base.metadata.create_all(engine)
        print("✅ Tables created/verified")
        
        # Run migration
        migrate_photos_to_s3()
        
        print("\n✅ Migration complete!")
        print("\nNext steps:")
        print("1. Add AWS S3 credentials to .env.local")
        print("2. Restart the backend")
        print("3. Users can now upload photos (they'll be stored in S3)")
        print("4. Old photos will still be accessible but won't be migrated")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

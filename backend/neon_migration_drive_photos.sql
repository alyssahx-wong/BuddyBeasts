-- Migration: Add Google Drive photo support
-- Run against Neon DB after enabling Google Drive API in Google Cloud Console

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

ALTER TABLE quest_photos ADD COLUMN IF NOT EXISTS image_url VARCHAR;

ALTER TABLE quest_photos ALTER COLUMN image_data DROP NOT NULL;
─────────────────────────────────────────────────────────

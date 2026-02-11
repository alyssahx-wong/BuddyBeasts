-- Migration: Add custom AI-generated character image support
-- Stores the Google Drive URL of the user's AI-generated character image

ALTER TABLE monsters ADD COLUMN IF NOT EXISTS custom_character_url VARCHAR;

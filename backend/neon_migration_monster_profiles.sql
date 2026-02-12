-- Migration: Add monster_profiles column to monsters table
ALTER TABLE monsters ADD COLUMN IF NOT EXISTS monster_profiles JSONB DEFAULT '{}'::jsonb;
-- ============================================================
-- Neon Database Migration: Dual Currency System
-- ============================================================
-- This script migrates the database to support the new dual
-- currency system (coins + crystals) and resets all user data.
--
-- Run this in your Neon SQL Editor.
-- ============================================================

-- 1. Add coins column to monsters table
-- ------------------------------------------------------------
ALTER TABLE monsters
ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 0;

-- 2. Add creator_user_id column to quest_instances table
-- ------------------------------------------------------------
ALTER TABLE quest_instances
ADD COLUMN IF NOT EXISTS creator_user_id VARCHAR REFERENCES users(id);

-- 3. Create reaction_selections table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reaction_selections (
    id SERIAL PRIMARY KEY,
    quest_id VARCHAR NOT NULL,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    reaction VARCHAR NOT NULL,
    attempt INTEGER NOT NULL DEFAULT 1,
    timestamp DOUBLE PRECISION NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reaction_selections_quest_id
ON reaction_selections(quest_id);

CREATE INDEX IF NOT EXISTS idx_reaction_selections_user_id
ON reaction_selections(user_id);

-- 4. Reset all user data to new currency system
-- ------------------------------------------------------------
-- Set all monsters to:
-- - Level 1
-- - 0 crystals (for progression/evolution)
-- - 1000 coins (for creating quests/buying items)
-- - Reset quests completed

UPDATE monsters
SET
    level = 1,
    crystals = 0,
    coins = 1000,
    quests_completed = 0,
    evolution = 'baby';

-- 5. Clean up active quest instances (optional)
-- ------------------------------------------------------------
-- Uncomment the following lines if you want to reset all quest instances:
-- DELETE FROM lobby_participants;
-- DELETE FROM instance_participants;
-- DELETE FROM quest_instances;

-- 6. Clean up reaction selections (optional)
-- ------------------------------------------------------------
-- Uncomment if you want to clear all previous reaction data:
-- DELETE FROM reaction_selections;

-- ============================================================
-- Migration Complete!
-- ============================================================
--
-- Summary of changes:
-- ✓ Added coins column to monsters (default: 1000)
-- ✓ Added creator_user_id to quest_instances
-- ✓ Created reaction_selections table with indexes
-- ✓ Reset all monsters to Level 1, 0 crystals, 1000 coins
--
-- Currency system:
-- • Coins: Used for creating quests (100 coins) and shop items
-- • Crystals: Used for feeding/evolving monsters and calculating level
--
-- Quest system:
-- • Creation: Costs 100 coins, requires Level 4+
-- • Completion: Rewards 100×participants coins + 10×participants crystals
-- • Reaction matching: 3 attempts, all participants must match
--
-- ============================================================

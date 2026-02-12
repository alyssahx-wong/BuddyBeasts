-- Add trait_scores column for personality quiz results
ALTER TABLE monsters ADD COLUMN IF NOT EXISTS trait_scores JSON DEFAULT NULL;

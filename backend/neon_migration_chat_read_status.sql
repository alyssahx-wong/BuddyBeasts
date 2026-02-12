-- Migration: Add chat_read_status table to track when users last read conversations

CREATE TABLE IF NOT EXISTS chat_read_status (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    lobby_id VARCHAR NOT NULL,
    last_read_timestamp DOUBLE PRECISION NOT NULL,
    UNIQUE (user_id, lobby_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_read_status_user_id ON chat_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_read_status_lobby_id ON chat_read_status(lobby_id);

-- Note: Run this migration in your Neon database to enable persistent read status tracking

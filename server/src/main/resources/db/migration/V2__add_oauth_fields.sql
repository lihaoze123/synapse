-- OAuth fields migration (portable across H2/MySQL)
-- 1) Add columns without engine-specific clauses (no AFTER)
-- 2) Backfill safe defaults
-- 3) Add indexes (unique email), leave NOT NULL enforcement to JPA schema update
--    after backfill to avoid breaking existing data during upgrades.
ALTER TABLE users ADD COLUMN email VARCHAR(255);
ALTER TABLE users ADD COLUMN provider VARCHAR(20) DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);

-- Backfill provider/email for existing rows
UPDATE users SET provider = COALESCE(provider, 'LOCAL');
UPDATE users
SET email = CASE
  WHEN email IS NULL OR email = '' THEN CONCAT(username, '@local.invalid')
  ELSE email
END;

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);

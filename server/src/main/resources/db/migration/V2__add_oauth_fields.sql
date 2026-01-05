ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE AFTER username;
ALTER TABLE users ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL' AFTER bio;
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255) AFTER provider;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);

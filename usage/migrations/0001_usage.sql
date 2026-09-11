CREATE TABLE usage_responses (
  id TEXT PRIMARY KEY,
  timestamp_ms INTEGER NOT NULL,
  surface TEXT NOT NULL CHECK (surface IN ('mcp', 'playground')),
  tool TEXT NOT NULL CHECK (tool IN ('search', 'execute')),
  access_mode TEXT NOT NULL CHECK (access_mode IN ('oauth', 'api-key', 'dev-bypass', 'unknown')),
  subject_hash TEXT,
  CHECK (subject_hash IS NULL OR (access_mode = 'oauth' AND length(subject_hash) = 16))
);
CREATE INDEX usage_responses_time ON usage_responses(timestamp_ms);

CREATE TABLE usage_receipts (
  id TEXT PRIMARY KEY,
  timestamp_ms INTEGER NOT NULL,
  responses INTEGER NOT NULL,
  truncated INTEGER NOT NULL CHECK (truncated IN (0, 1)),
  canary INTEGER NOT NULL CHECK (canary IN (0, 1))
);
CREATE INDEX usage_receipts_time ON usage_receipts(timestamp_ms);

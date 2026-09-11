CREATE TABLE usage_report_snapshots (
  id TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  expires_at_ms INTEGER NOT NULL
);

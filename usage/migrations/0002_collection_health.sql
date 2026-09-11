ALTER TABLE usage_receipts ADD COLUMN outcome TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE usage_receipts ADD COLUMN missing_response_ids INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage_receipts ADD COLUMN failed_statements INTEGER NOT NULL DEFAULT 0;

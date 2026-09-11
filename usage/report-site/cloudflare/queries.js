export function countsSql(period, column = 'period') {
  if (!['%Y-%m', '%Y-%m-%d'].includes(period)) throw new Error('Unsupported period');
  if (!['period', 'month'].includes(column)) throw new Error('Unsupported column');
  const columns = `SUM(tool = 'search') AS search_responses,
    SUM(tool = 'execute') AS execute_responses, COUNT(*) AS total_responses,
    COUNT(DISTINCT CASE WHEN access_mode = 'oauth' THEN subject_hash END) AS unique_accounts,
    SUM(access_mode = 'api-key') AS api_key_responses,
    SUM(access_mode = 'dev-bypass') AS dev_responses,
    SUM(access_mode = 'unknown' OR (access_mode = 'oauth' AND subject_hash IS NULL)) AS unattributed_responses`;
  return `WITH selected AS (
    SELECT *, strftime('${period}', timestamp_ms / 1000, 'unixepoch') AS ${column}
    FROM usage_responses WHERE timestamp_ms >= ?1 AND timestamp_ms < ?2
  ) SELECT ${column}, surface, ${columns} FROM selected GROUP BY ${column}, surface
    UNION ALL SELECT ${column}, 'all' AS surface, ${columns} FROM selected GROUP BY ${column}
    ORDER BY ${column}, surface`;
}

export const receiptsSql = `SELECT strftime('%Y-%m-%d', timestamp_ms / 1000, 'unixepoch') AS day,
  MIN(timestamp_ms) AS first_receipt_ms, MAX(timestamp_ms) AS last_receipt_ms,
  SUM(truncated) AS truncated_invocations,
  SUM(outcome NOT IN ('ok', 'unknown')) AS interrupted_invocations,
  SUM(missing_response_ids) AS missing_response_ids, SUM(failed_statements) AS failed_statements,
  COUNT(DISTINCT CASE WHEN canary = 1 THEN strftime('%Y-%m-%dT%H', timestamp_ms / 1000, 'unixepoch') END) AS canary_hours,
  MAX(CASE WHEN canary = 1 THEN timestamp_ms END) AS last_canary_ms
  FROM usage_receipts WHERE timestamp_ms >= ?1 AND timestamp_ms < ?2 GROUP BY day ORDER BY day`;

export const healthSql = `SELECT MAX(timestamp_ms) AS last_receipt_ms,
  MAX(CASE WHEN canary = 1 THEN timestamp_ms END) AS last_canary_ms,
  SUM(missing_response_ids) AS missing_response_ids, SUM(failed_statements) AS failed_statements,
  SUM(truncated) AS truncated_invocations,
  SUM(outcome NOT IN ('ok', 'unknown', 'canceled', 'responseStreamDisconnected')) AS failed_invocations
  FROM usage_receipts WHERE timestamp_ms >= ?1 AND timestamp_ms < ?2`;

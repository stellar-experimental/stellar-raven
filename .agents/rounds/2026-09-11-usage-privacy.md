# Usage privacy correction

The public repository previously included production aggregate snapshots and operational audit exports.
The owner-only report policy did not protect copies embedded in public Git source.
The correction removes those files and real figures from public source and earlier PR descriptions.
Private evidence is preserved outside Git. The report reads an expiring snapshot through its authenticated API.
Public tests use explicit synthetic fixtures. The build embeds no production data.

The commit and CI scanner now runs a separate private-data guard.
The guard reads staged content for commits, checks known paths and export shapes, and rejects relocated snapshots.
Private data also has ignore rules. Prose and new formats still require manual review.
Public health logs contain no diagnostic counts.

Fable 5.1 high reviewed the source independently. Runtime, expiry, privacy-guard, and credential checks passed.
Historical credential-scan findings were synthetic fixtures, content digests, or documented public provider endpoints.
Exact comparison against current credentials found no matches in reachable Git history.

Release order: apply migration 0003, privately import the trusted snapshot with a bound parameter, then deploy the API and collector.
Sync and privately publish Sites from the reviewed main branch. Verify owner access and anonymous rejection.

The forward correction does not erase older commits, feature branches, PR diffs, cached views, or external clones.
A coordinated history rewrite remains a separate disruptive operation requiring explicit user approval.
Do not claim that previously published data has been erased.

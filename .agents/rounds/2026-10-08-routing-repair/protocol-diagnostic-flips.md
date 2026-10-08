# Protocol-history v1 diagnostic grade changes

These are diagnostic changes, separate from the 532 primary grade-flag rows.
The 544-row tables already include their result-order changes.

| Run | Case | Role | Target rank before → after | Diagnostic change |
|---|---|---|---|---|
| identity-coherence-main | `ph-control-soroban-deploy` | control | null → 5 | forbiddenCapture: false→true |
| identity-coherence-fresh | `ph-control-soroban-deploy` | control | null → 5 | forbiddenCapture: false→true |
| structured-scoring-main | `ph-protocol-corrective-upgrade-history` | positive | 1 → 2 | top1: true→false |
| structured-scoring-main | `ph-soroban-auth-audit-history` | positive | 1 → 5 | top1: true→false<br>top3: true→false |
| structured-scoring-main | `ph-control-clawback-cap` | control | 4 → null | forbiddenCapture: true→false |
| structured-scoring-fresh | `ph-protocol-corrective-upgrade-history` | positive | 1 → 2 | top1: true→false |
| structured-scoring-fresh | `ph-soroban-auth-audit-history` | positive | 1 → 5 | top1: true→false<br>top3: true→false |
| structured-scoring-fresh | `ph-control-clawback-cap` | control | 4 → null | forbiddenCapture: true→false |
| structural-main | `ph-control-soroban-deploy` | control | null → 5 | forbiddenCapture: false→true |
| structural-fresh | `ph-control-soroban-deploy` | control | null → 5 | forbiddenCapture: false→true |

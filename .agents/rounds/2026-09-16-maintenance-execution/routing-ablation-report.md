# Routing scoring ablation — 2026-09-16

The coordinator used a separate detached worktree at `722eef5f`.
The coordinator changed no candidate, gate, label, or catalog-count test.
All variants used the same experimental Scout catalog snapshot.
`routing-ablation-inputs.json` records its hashes.

The original scorer and selection on the new-source experiment yielded legacy 211/278/312 and extended 88/109/114.
The accepted main control yielded legacy 213/279/312 and extended 90/110/116.
The source change therefore already loses two extended top-one, one top-three, and two top-five hits.
The experiment must not replace the accepted main comparison.
The new scorer alone yielded legacy 202/279/313 and extended 82/101/110.
Most top-one loss therefore occurs before the added selection rules.

Re-enabling schema rescue reduced legacy top-one hits to 200.
That variant is rejected.
A first attempted schema toggle matched no code and repeated the control.
Its log is not evidence for a changed mechanism.

Allowing one routing token to boost an already-admitted base recovered one legacy top-one hit.
It did not explain the larger loss.

A coherent phrase as an admission witness, followed by one deduplicated union score,
raised legacy results to 207/282/314 and extended results to 85/103/113.
Restoring the original 1.0 blend and allowing one-token boosts after base admission
raised legacy results to 211/284/313 and extended results to 86/106/113.

Combining that scorer with the current selection rules yielded legacy 208/291/321 and extended 87/105/111.
All 15 focused issue #141 tests passed in that combination.
It still fails the full acceptance requirements.

Bypassing metadata intent when a multiword query passes the plain base scorer did not recover top-one hits.
It reduced other results and failed one focused test.
That bypass is rejected.

These measurements identify candidate mechanisms, not source acceptance.
No baseline adjustment is authorized by this ablation.
The holdout labels and cases remained unchanged; only aggregate results were inspected.
No paid evaluation, network service operation, deployment, or GitHub write occurred in this experiment.

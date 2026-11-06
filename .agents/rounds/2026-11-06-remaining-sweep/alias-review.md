# Independent alias review — 2026-11-06

Reviewer: t2r9 (distinct from author t2r6 and coordinator t1d1). **Accept: no blocking findings.**
Read-only review of the working diff against `d5f3a280cc58326ff70719f30f3301ca077a4d51`, including the new, untracked `test/smoke/host-routing.test.ts`. No nested agents, author-file edits, deployment, or production credential use.

## Spec

The user requires live legacy `/mcp` and same-origin discovery, OAuth and refresh on both actual alias domains. The implementation puts the exemption before redirect construction; exact OAuth paths, MCP descendants and discovery stay on the input origin. The server then uses the existing auth dispatch and provider unchanged. Inspected `src/auth/gate.ts` and `workos.ts`: metadata rewrites preserve origin, the WorkOS callback URI derives from the incoming origin, consent uses relative form actions and host-only cookies, and the existing provider still owns registration, grants and token rotation. Browser redirects retain path/query and the safe target construction that prevents `//evil.example` from changing host.

The new smoke tests are substantive: both literal aliases are independent of the implementation set; old grants are created directly through the unchanged provider before the restored router is invoked; resource-bearing and resource-less grants authenticate and rotate on the alias; their fixed expiry is artificially aged so a lifetime reset would fail. The full consent/CSRF/WorkOS callback/code exchange/MCP initialization runs on all three origins, with only the WorkOS authentication upstream stubbed. Neither canonical migration nor re-registration is required. No singular `agent.stellar.buzz` route was invented.

## Standards

Read AGENTS.md and CONTRIBUTING.md and inspected all runtime, test, config-comment and user-guidance changes. The explicit new user requirement authorizes restoring alias support despite the general forward-only preference. The patch makes the routing decision in one host-policy function, leaves provider/storage/secret contracts unchanged, preserves the redirect guard, and updates current documentation consistently. No unrelated runtime change or generated-file hand edit found. Moving old alias tests into a focused file retains and expands their relevant assertions.

## Independent validation

`npm run test:smoke -- test/smoke/host-routing.test.ts test/smoke/server.test.ts test/smoke/auth-redirects.test.ts` ran independently in owned terminal t2t5: **3 files, 48 tests passed**, 2026-11-06 14:05 UTC. Receipt: `tmp/sweep-2026-11-06/docs/alias-independent-smoke.log`. `git diff --check` passes. The existing non-failing serde sourcemap warning remains. Coordinator owns the full baseline and deployed checks; this review does not claim that the production redirect has already changed or that a real WorkOS user session was exercised.

## Independent Docs-title hold spot check

Accepted the scoped retain-held-titles decision after checking the underlying full routing receipts `eval/results/routing-2026-11-06T13-59-09-694Z.json` and `routing-2026-11-06T13-59-15-074Z.json`, not only the coordinator's summary. Independently recomputed the held/candidate manifest SHA-256 values: `008c16e31e5a53ea221a10007ff7198d317c0f2f15bd8b0354e552fe85776e33` and `eb532a662f5bb83f7123c094f002294211a94de92f117c3bdb940d6e09cd6de4`.

The legacy totals change top1 219→218 and top5 327→326. The Hubble-vs-RPC case loses top1, exhaustive-DeFi loses service top5, and Groth16 holdout expected-card rank moves 3→4 (top3 lost, but its top5/pass remain true). The wallet-specific Docs operation leaves top5 from rank2 while service-level grades remain true. These raw rows substantiate the continuing hold. The candidate's gate object fails on its different manifest fingerprint; that alone is not a measured quality regression and was not used as such. No inventory, pin, anchor, threshold or baseline update is justified by this evidence. No further comment on #223 is warranted for an unchanged hold.

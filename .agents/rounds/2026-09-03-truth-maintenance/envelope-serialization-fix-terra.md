# Envelope serialization repair — Terra

## Scope

This change repairs Dynamic Worker result serialization.

The candidate QA artifact recorded this error in 220 of 239 Stellar Docs rows:

`Could not serialize object of type "Object"`

No paid call or live service call was made.

## Reproduction

I added a smoke test at the assembled Worker boundary.

The test calls `lumenloop.search_directory`, then returns all of these values:

- The guarded envelope.
- The guarded object payload.
- An array mapped from the payload.

Before the repair, this command failed deterministically:

```sh
./node_modules/.bin/vitest --config test/smoke/vitest.config.ts run test/smoke/executor.test.ts
```

The Dynamic Worker RPC threw the exact `DataCloneError` before the runner received a result.

## Cause and repair

`envelopeGuardPrelude` changed each object payload's prototype to a Proxy.
Workers RPC cannot serialize that Proxy prototype.

The repair removes only that optional object-payload array-shape diagnostic.
It keeps the non-enumerable envelope traps for wrong-level reads, such as
`r.projects` instead of `r.data.projects`.

Object payloads, arrays, class instances, null-prototype payloads, Maps, and Sets
now keep their original prototypes. This restores Dynamic Worker RPC serialization.

## Verification

All commands passed after the repair.

```sh
./node_modules/.bin/vitest --config test/smoke/vitest.config.ts run test/smoke/executor.test.ts
./node_modules/.bin/vitest run test/executor-providers.test.ts
npm run typegen
npm run typecheck
npm run test:smoke
npm test
npm run build
npm run secrets:scan -- --tree
```

`npm run test:smoke` required the permitted local loopback environment. It passed
83 tests. `npm test` passed 1,770 tests. The secret scan was clean.

No architecture document or TODO change was needed. The fault was local and the
new real-RPC smoke test prevents regression.

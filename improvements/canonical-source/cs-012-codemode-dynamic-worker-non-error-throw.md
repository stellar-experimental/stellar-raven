---
id: cs-012
service: canonical-source
status: reported-upstream
discovered: 2026-11-17
upstreamTitle: "codemode: DynamicWorkerExecutor reports no error when sandbox code throws a non-Error value"
evidence:
  - "2026-11-17 executed on @cloudflare/codemode 0.5.1 in workerd with a LOADER worker_loaders binding: new DynamicWorkerExecutor({ loader }).execute() on 'async () => { throw \"x\"; }' and on 'async () => { throw { code: 1 }; }' returns result undefined and error undefined. Read, not executed: the same line in 0.5.6 (npm latest) dist/index.js:365 and in main packages/codemode/src/executor.ts:511 at commit 366d5b5baf846b4669a2ecd0e61e104aa634432b."
  - "Raven impact: a caller that treats error === undefined as success logs the run as ok. Raven's createExecuteRunner returns { ok: true, result: \"undefined\" } for both throws. A throw of null differs: err.message throws inside the catch block, and the call rejects with TypeError: Cannot read properties of null (reading 'message')."
  - upstream issue filed 2026-11-17: https://github.com/cloudflare/agents/issues/2897
---

## Finding

`DynamicWorkerExecutor` in `@cloudflare/codemode` reports no error when sandbox code throws a value that is
not an `Error`. The generated module catches the throw and returns `error: err.message`. A string, a number
or a plain object has no `message` property, so `error` is `undefined`. The caller sees a result with no
error and cannot tell the run failed.

## Evidence

The generated module ends with this catch block (`packages/codemode/src/executor.ts:511` at `main`):

```js
    } catch (err) {
      return { result: undefined, error: err.message, logs: __logs };
    }
```

The same line is in `@cloudflare/codemode` 0.5.1 (`dist/index.js:307`) and 0.5.6 (`dist/index.js:365`).
Only 0.5.1 was executed. The 0.5.6 and `main` lines were read, at `main` commit
`366d5b5baf846b4669a2ecd0e61e104aa634432b`.
The package already handles this case elsewhere. `dist/browser.js:116` uses `err.message || String(err)`.
`dist/index.js:239` (0.5.6) uses `err instanceof Error ? err.message : String(err)`.

Observed on 0.5.1, executed in workerd with a `worker_loaders` binding named `LOADER`:

| Sandbox code | `result` | `error` |
|---|---|---|
| `async () => { throw "x"; }` | `undefined` | `undefined` |
| `async () => { throw { code: 1 }; }` | `undefined` | `undefined` |
| `async () => { throw null; }` | the `execute` call rejects with `TypeError: Cannot read properties of null (reading 'message')` | not returned |

### Reproduce

1. Use a Worker with a `worker_loaders` binding named `LOADER` and `@cloudflare/codemode` 0.5.1 or later.
2. Run this code in the Worker:

   ```ts
   import { DynamicWorkerExecutor } from "@cloudflare/codemode";

   const executor = new DynamicWorkerExecutor({ loader: env.LOADER });
   for (const code of [
     'async () => { throw "x"; }',
     "async () => { throw { code: 1 }; }"
   ]) {
     const out = await executor.execute(code, []);
     console.log(code, "->", out.result, out.error, Object.keys(out).join(","));
   }
   ```

3. Observe `undefined undefined result,logs` for both inputs. A caller that tests `out.error` sees success.

## Recommendation

Change the catch block in `packages/codemode/src/executor.ts` to
`error: err instanceof Error ? err.message : String(err)`. This is the form the package uses in
`dist/index.js:239` (0.5.6). It also fixes the `throw null` and `throw undefined` cases, where `err.message` throws
inside the catch block. Add a regression test that throws a string, an object and `null` from sandbox code
and expects a non-empty `error` for each.

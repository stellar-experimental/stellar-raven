# agents createAI catalog options reproduction

Use Node.js 24 or later.
Copy this directory to an empty location, then run these commands:

```sh
npm ci --ignore-scripts
npm run repro
```

Package installation needs the network.
The reproduction blocks network access through global `fetch`.
It uses fake Worker bindings and needs no account, credential, or deployment.
Exit code `0` means that all three observed behaviors reproduced.

- String catalog models drop the supplied Anthropic provider settings.
- Native Anthropic models preserve those settings through a different transport.
- Binding catalog streams resume the existing run after a simulated connection failure.

The last check sets `maxRetries: 0` and records exactly one inference call.
Stream resume therefore differs from another inference attempt.
The script passes `resume: false` as an unknown JavaScript field to demonstrate the missing control.
The public TypeScript settings do not declare that field.

`observed.jsonl` is the output from 2026-11-03 with `agents@0.32.0`, `ai@7.0.137`, and `@ai-sdk/anthropic@4.0.78`.
The same script with `agents@0.33.0` produced byte-identical output on the same day.

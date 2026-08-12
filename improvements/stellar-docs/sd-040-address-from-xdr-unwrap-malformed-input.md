---
id: sd-040
service: stellar-docs
status: verified
discovered: 2026-08-11
upstreamTitle: Handle malformed XDR in the smart-contract address conversion example
evidence:
  - 2026-08-11 live stellarDocs.get_doc_page_sections for /docs/build/guides/conversions/address-conversions returned Address::from_xdr(&env, &bytes).unwrap() in the smart-contract example
  - 2026-08-11 six live Soroban documentation searches found the conversion page but no malformed-XDR handling guidance
  - 2026-08-11 live smart-contract skill read found generic panic and try_* guidance but no from_xdr or malformed-input rule
---

## Finding

The smart-contract address conversion example accepts `Bytes` and calls
`Address::from_xdr(&env, &bytes).unwrap()`.

`from_xdr` is fallible. The `unwrap()` call therefore panics when the bytes do
not contain a valid address value.

The page names custom authentication as a use case. That use case can process
untrusted bytes, so malformed input is a normal trust-boundary condition.

The page gives no fallible return, validation step, contract error, or malformed-input test.

## Evidence

This live read reproduced the example on 2026-08-11:

```js
await stellarDocs.get_doc_page_sections({
  path: "/docs/build/guides/conversions/address-conversions",
  includeContent: true,
});
// address_from_xdr_bytes(...) -> Address {
//   Address::from_xdr(&env, &bytes).unwrap()
// }
```

Six focused searches covered `Address::from_xdr`, malformed XDR, input length,
untrusted bytes, decode panics, and malformed input.

The searches found the conversion page. They found no warning or safe decoding example.

The live smart-contract skill covered typed errors, `panic_with_error!`, and generated `try_*` clients.
It did not cover malformed XDR or `from_xdr` at a trust boundary.

## Recommendation

Replace the infallible example with a fallible function. Return a result or map decode failure to a contract error.

Add one malformed-byte test. State that contracts must not call `unwrap()` on untrusted XDR input.

If the expected XDR shape has a fixed length, show that guard before decoding.

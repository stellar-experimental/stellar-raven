def build_prompt(servers, deferred_hint=""):
    names = ", ".join(f"`{s}`" for s in servers)
    multi = len(servers) > 1
    surf = (
        "- instructions: the server instructions text that the MCP server supplied to you (its sentinels start with `IN`).\n"
        "- desc_a, desc_b, desc_c: the descriptions of the tools named desc_a, desc_b, desc_c (sentinels start with `TA`, `TB`, `TC`).\n"
        "- schema: the description of the property `note` in the input schema of the tool schema_probe (sentinels start with `SC`).\n"
        "- result: the text that result_probe returned to you (sentinels start with `RS`).\n"
    )
    keyed = (
        "Reply with exactly one JSON object whose keys are the server names " + names + ", each holding an object with the keys instructions, desc_a, desc_b, desc_c, schema, result.\n"
        if multi else
        "Reply with exactly one JSON object with the keys instructions, desc_a, desc_b, desc_c, schema, result.\n"
    )
    call = (
        "Call the tool result_probe of each of these servers once, with no arguments."
        if multi else "Call the tool result_probe once, with no arguments."
    )
    return (
        "This is a text-delivery measurement. MCP " + ("servers " if multi else "server ") + names +
        (" supply" if multi else " supplies") + " long texts made of numbered sentinels. A sentinel looks like `ZZ9-999-xxxxxx` "
        "(two capital letters, one digit, a dash, three digits, a dash, six lowercase letters); every one in the real texts is unique and random, so never guess or reconstruct one from a pattern. "
        "Copy only text that is actually present in your own context, verbatim.\n\n"
        + deferred_hint +
        "Steps: (1) " + call + " (2) Then " + keyed[0].lower() + keyed[1:] + "\n"
        "Each value is an object {\"first\": ..., \"last\": ..., \"tail\": ...}: `first` is the first sentinel visible in that text, `last` is the last sentinel visible in that text, "
        "`tail` is the final 80 characters you can see of that text, verbatim, including any truncation marker or ellipsis that ends it. Use null for all three if you cannot see that text at all.\n"
        "Where to look:\n" + surf +
        "Do not call any other tool. Output only the JSON object."
    )


def build_prompt_codex(servers):
    n = servers[0] if len(servers) == 1 else None
    names = ", ".join(f"`{s}`" for s in servers)
    return (
        "This is a text-delivery measurement. MCP server(s) " + names + " supply long texts made of numbered sentinels. "
        "A sentinel looks like `ZZ9-999-xxxxxx` (two capital letters, one digit, a dash, three digits, a dash, six lowercase letters); every real one is unique and random, so never guess or reconstruct one. "
        "Copy only text that is actually present, verbatim.\n\n"
        "You reach MCP tools through the `exec` JavaScript tool: `ALL_TOOLS` lists the nested tools as {name, description} entries and `tools.mcp__<server>__<tool>()` calls one. "
        "Do these steps for each server, in this order:\n"
        "1. Instructions: look in your own context (the tool catalogue) for the text this server supplied as its server instructions (sentinels start with `IN`). Do not use exec for this step.\n"
        "2. In ONE exec call, without printing any long text, compute and print one compact JSON line per item: for each of the tools desc_a, desc_b, desc_c, schema_probe (entries of ALL_TOOLS whose name ends with that tool name) and for the awaited result of calling result_probe once: "
        "`len` (the JS string length of the description, or of the result text), `first` and `last` (the first and last match of /[A-Z]{2}\\d-\\d{3}-[a-z]{6}/g in it, or null), and `tail` (its last 80 characters). "
        "For schema_probe also report `schema_len`: the length of JSON.stringify of the whole ALL_TOOLS entry, and the first and last `SC` sentinel found anywhere in that JSON (null if none). Call result_probe only once.\n"
        "3. In a SECOND exec call, print the complete description text of desc_a with text(). Then reply based only on what the exec output actually showed you for it.\n"
        "Final reply: exactly one JSON object" + (" keyed by server name" if n is None else "") + " with the keys instructions, desc_a, desc_b, desc_c, schema, result. "
        "For `instructions`: {first, last, tail} as seen in your context (tail = the final 80 characters of that text, verbatim). "
        "For desc_a: {first, last, tail, jslen} where first/last/tail are what step 3 showed you (tail = the last 80 characters you actually saw, including any truncation marker) and jslen is the `len` from step 2. "
        "For desc_b, desc_c, schema, result: {first, last, tail, jslen} copied from step 2 (jslen = `len`; for schema use `schema_len`). "
        "Use null for anything you cannot see. Output only the JSON object."
    )

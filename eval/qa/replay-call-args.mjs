/**
 * Static reading of a stored `execute` script for the free replay of the identifier pointer
 * (test/replay-identifier-pointer.test.ts). The stored rows hold the script and the result text,
 * not the arguments each call received, so the strings a call's arguments can hold are recovered
 * from the script's syntax tree.
 *
 * It follows what a script written for this server does: string and template literals, `const`
 * names, array and object literals, `.map` and `for...of` parameters bound to the array they
 * iterate, concatenation, and method calls on strings. A value it cannot follow (a name from a
 * destructured result, a function's own parameter, a call's result) marks the site `unresolved`.
 * The replay reports the sites it could not follow instead of guessing for them.
 */
import { parse } from "acorn";

const ITERATORS = new Set(["map", "forEach", "flatMap", "filter", "some", "every", "find", "findIndex", "reduce"]);
const MAX_TEXTS = 64;
const MAX_DEPTH = 8;

const uniq = (list) => [...new Set(list)].slice(0, MAX_TEXTS);

/** The syntax tree of a script, or null when it does not parse. A bare function expression parses as one. */
function parseScript(code) {
  for (const text of [code, `(${code}\n)`]) {
    try {
      return parse(text, { ecmaVersion: "latest", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true });
    } catch {
      // try the wrapped form
    }
  }
  return null;
}

/** Every node under `node`, depth first. */
function walk(node, visit) {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (typeof node.type === "string") visit(node);
  for (const [key, child] of Object.entries(node)) {
    if (key !== "type" && child !== null && typeof child === "object") walk(child, visit);
  }
}

/**
 * The operation call sites of a script: `{ op, strings, unresolved }`, in source order. Returns
 * `null` when the script does not parse.
 */
export function callSitesOf(code, operationIds) {
  const tree = parseScript(code);
  if (!tree) return null;
  const declarations = new Map();
  const bindings = new Map();
  const note = (map, name, node) => map.set(name, [...(map.get(name) ?? []), node]);

  walk(tree, (node) => {
    if (node.type === "VariableDeclarator" && node.id.type === "Identifier" && node.init) note(declarations, node.id.name, node.init);
    if (node.type === "ForOfStatement") {
      const declarator = node.left.type === "VariableDeclaration" ? node.left.declarations[0] : undefined;
      if (declarator?.id.type === "Identifier") note(bindings, declarator.id.name, node.right);
    }
    if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && !node.callee.computed && ITERATORS.has(node.callee.property.name)) {
      const [callback] = node.arguments;
      const first = callback && (callback.type === "ArrowFunctionExpression" || callback.type === "FunctionExpression") ? callback.params[0] : undefined;
      if (first?.type === "Identifier") note(bindings, first.name, node.callee.object);
    }
  });

  const concat = (left, right) => {
    const out = [];
    for (const a of left) for (const b of right) out.push(a + b);
    return uniq(out);
  };
  const union = (parts) => ({ texts: uniq(parts.flatMap((part) => part.texts)), unresolved: parts.some((part) => part.unresolved) });
  const nonEmpty = (texts) => (texts.length > 0 ? texts : [""]);

  /** `{ texts, unresolved }`: the strings a node can evaluate to, over-approximated. */
  const evaluate = (node, depth, seen) => {
    if (!node || depth > MAX_DEPTH) return { texts: [], unresolved: true };
    switch (node.type) {
      case "Literal":
        return { texts: typeof node.value === "string" ? [node.value] : [], unresolved: false };
      case "TemplateLiteral": {
        let texts = [node.quasis[0].value.cooked ?? ""];
        let unresolved = false;
        node.expressions.forEach((expression, index) => {
          const inner = evaluate(expression, depth + 1, seen);
          unresolved ||= inner.unresolved;
          texts = concat(concat(texts, nonEmpty(inner.texts)), [node.quasis[index + 1].value.cooked ?? ""]);
        });
        return { texts, unresolved };
      }
      case "BinaryExpression": {
        const left = evaluate(node.left, depth + 1, seen);
        const right = evaluate(node.right, depth + 1, seen);
        const unresolved = left.unresolved || right.unresolved;
        return node.operator === "+"
          ? { texts: concat(nonEmpty(left.texts), nonEmpty(right.texts)), unresolved }
          : { texts: uniq([...left.texts, ...right.texts]), unresolved };
      }
      case "LogicalExpression":
        return union([evaluate(node.left, depth + 1, seen), evaluate(node.right, depth + 1, seen)]);
      case "ConditionalExpression":
        return union([evaluate(node.consequent, depth + 1, seen), evaluate(node.alternate, depth + 1, seen)]);
      case "ArrayExpression":
        return union(node.elements.map((element) => evaluate(element, depth + 1, seen)));
      case "ObjectExpression":
        return union(
          node.properties.map((property) =>
            property.type === "SpreadElement" ? evaluate(property.argument, depth + 1, seen) : evaluate(property.value, depth + 1, seen)
          )
        );
      case "SpreadElement":
        return evaluate(node.argument, depth + 1, seen);
      case "AwaitExpression":
      case "UnaryExpression":
        return evaluate(node.argument, depth + 1, seen);
      case "ChainExpression":
        return evaluate(node.expression, depth + 1, seen);
      case "Identifier": {
        if (seen.has(node.name)) return { texts: [], unresolved: true };
        const sources = [...(declarations.get(node.name) ?? []), ...(bindings.get(node.name) ?? [])];
        if (sources.length === 0) return { texts: [], unresolved: true };
        return union(sources.map((source) => evaluate(source, depth + 1, new Set([...seen, node.name]))));
      }
      case "MemberExpression":
        return evaluate(node.object, depth + 1, seen);
      case "CallExpression": {
        // A method on a string or an array (`trim`, `slice`, `join`, `map`) keeps the strings it was given.
        const receiver = node.callee.type === "MemberExpression" ? [evaluate(node.callee.object, depth + 1, seen)] : [];
        return union([...receiver, ...node.arguments.map((argument) => evaluate(argument, depth + 1, seen))]);
      }
      default:
        return { texts: [], unresolved: true };
    }
  };

  const sites = [];
  walk(tree, (node) => {
    if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression" || node.callee.computed) return;
    if (node.callee.object.type !== "Identifier") return;
    const op = `${node.callee.object.name}.${node.callee.property.name}`;
    if (!operationIds.has(op)) return;
    const { texts, unresolved } = union(node.arguments.map((argument) => evaluate(argument, 0, new Set())));
    sites.push({ op, strings: texts, unresolved });
  });
  return sites;
}

/** Every string literal of a script: the upper bound on what an unresolved site could hold. */
export function literalsOf(code) {
  const tree = parseScript(code);
  if (!tree) return [];
  const out = [];
  walk(tree, (node) => {
    if (node.type === "Literal" && typeof node.value === "string") out.push(node.value);
    if (node.type === "TemplateElement") out.push(node.value.cooked ?? "");
  });
  return out;
}

/** The calls a result's footer lists, in order: `[{ op, outcome }]`. Empty when the result has none. */
export function footerCallsOf(resultText) {
  const line = /\ncalls: ([^\n]*)/.exec(String(resultText ?? ""))?.[1];
  if (!line) return [];
  const body = line.replace(/\s+\(totals [^)]*(?:\([^)]*\)[^)]*)*\)\s*$/, "");
  return body
    .split("; ")
    .map((part) => /^([A-Za-z_][\w]*\.[A-Za-z_][\w]*)=(ok|error|soft-empty)\b/.exec(part))
    .filter(Boolean)
    .map((match) => ({ op: match[1], outcome: match[2] }));
}

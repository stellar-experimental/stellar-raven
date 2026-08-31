export function argValue(args, flag) {
  const indexes = args.map((arg, index) => arg === flag ? index : -1).filter((index) => index >= 0);
  if (indexes.length > 1) throw new Error(`${flag} may appear only once`);
  if (indexes.length === 0) return undefined;
  const value = args[indexes[0] + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

export function requiredArg(args, flag) {
  const value = argValue(args, flag);
  if (!value) throw new Error(`${flag} is required`);
  return value;
}

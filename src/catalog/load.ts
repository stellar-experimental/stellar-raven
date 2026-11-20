/** Lazily validate and cache the bundled `catalog/manifest.json` per isolate (Node- and Worker-safe). */
import manifestJson from "../../catalog/manifest.json";
import { loadManifest, type Catalog } from "./search.ts";

let cached: Catalog | undefined;

export function getCatalog(): Catalog {
  cached ??= loadManifest(manifestJson);
  return cached;
}

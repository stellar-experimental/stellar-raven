#!/usr/bin/env node
import { writeIndex } from "./improvements-lib.mjs";

const count = writeIndex();
console.log(`wrote improvements/INDEX.md (${count} findings)`);

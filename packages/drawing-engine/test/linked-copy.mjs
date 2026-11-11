// Test projects that live inside the engine are linked in a temporary copy, never in place: a project linked inside the engine
// holds an engine/ link to its own ancestor, a cycle that sends anything walking the package with symlinks followed (a recursive
// glob, an indexer) into an endless descent.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { linkProject } from '../tools/project.mjs';

/** Copy a project to a fresh temp directory and link it there; run `fn` with that directory, then remove it. */
export function withLinkedCopy(src, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'frametell-test-'));
  try {
    fs.cpSync(src, dir, { recursive: true, filter: (f) => !/[\\/](engine|engine_modules|out)$/.test(f) });
    linkProject(dir);
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

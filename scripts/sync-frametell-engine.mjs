#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const LOCKED_REVISION = '6145f7e3482628543bd6f2d68fe3b618d366213a';
const INCLUDE = [
  'boot.js',
  'runtime/**',
  'styles/**',
  'lib/**',
  'vendor/**',
  'tools/**',
  'template/**',
];

const ADAPTERS = {
  'runtime/timing.js':
    'Use trusted measured page and cue timing when provided.',
  'styles/blueprint/example/script.js':
    'Resolve the style kit through the linked engine path.',
  'styles/engraving/example/script.js':
    'Resolve the style kit through the linked engine path.',
  'styles/exploded/example/script.js':
    'Resolve the style kit through the linked engine path.',
  'styles/math/example/pages/p01.js': 'Declare the y variable colour.',
  'styles/math/example/pages/p02.js': 'Declare the y variable colour.',
  'styles/math/example/pages/p03.js': 'Declare the y variable colour.',
  'styles/math/example/pages/p04.js': 'Declare the y variable colour.',
  'styles/math/example/pages/p06.js':
    'Keep the final camera move inside the safe frame.',
  'styles/math/example/storyboard.json':
    'Finish the storyboard on the moving dot.',
  'styles/old-map/example/script.js':
    'Resolve the style kit through the linked engine path.',
  'styles/one-line/example/pages/p04.js':
    'Move the Rubin caption inside the safe frame.',
};

const ADDITIONS = {
  'styles/blueprint/example/storyboard.json':
    'Restore the missing example storyboard.',
  'styles/isometric/example/storyboard.json':
    'Restore the missing example storyboard.',
};

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPOSITORY_ROOT = resolve(dirname(SCRIPT_PATH), '..');
const DEFAULT_SOURCE_ROOT = resolve(
  REPOSITORY_ROOT,
  '../../open/frametell/packages/engine',
);
const DEFAULT_TARGET_ROOT = resolve(REPOSITORY_ROOT, 'packages/drawing-engine');
const DEFAULT_MANIFEST_PATH = resolve(DEFAULT_TARGET_ROOT, 'upstream.json');

function normalizeRoot(root) {
  return root instanceof URL ? fileURLToPath(root) : resolve(String(root));
}

function isIncluded(path, include = INCLUDE) {
  return include.some((pattern) => {
    if (pattern.endsWith('/**')) {
      return path.startsWith(pattern.slice(0, -2));
    }
    return path === pattern;
  });
}

async function sha256(path) {
  return createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
}

async function walk(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await walk(root, absolute)));
      continue;
    }

    const path = relative(root, absolute).replaceAll('\\', '/');
    if (isIncluded(path)) result.push(path);
  }

  return result.sort();
}

async function inventory(root, include = INCLUDE) {
  const absoluteRoot = normalizeRoot(root);
  const paths = await walk(absoluteRoot);
  const entries = await Promise.all(
    paths
      .filter((path) => isIncluded(path, include))
      .map(async (path) => [path, await sha256(resolve(absoluteRoot, path))]),
  );
  return new Map(entries);
}

async function currentRevision(sourceRoot) {
  const { stdout } = await execFile('git', [
    '-C',
    normalizeRoot(sourceRoot),
    'rev-parse',
    'HEAD',
  ]);
  return stdout.trim();
}

/**
 * Compare the locked manifest to both the Frametell checkout and TimoTV copy.
 * Approved adapter entries remain visible in `changed`; unapproved drift is
 * emitted with `adapter: false` so callers can fail closed.
 */
export async function auditEngine({ sourceRoot, targetRoot, manifest }) {
  const [source, target] = await Promise.all([
    inventory(sourceRoot, manifest.include),
    inventory(targetRoot, manifest.include),
  ]);
  const files = new Map(manifest.files.map((file) => [file.path, file]));
  const additions = new Map(
    (manifest.additions ?? []).map((file) => [file.path, file]),
  );
  const expectedTarget = new Set([...files.keys(), ...additions.keys()]);
  const changed = [];

  for (const file of files.values()) {
    const upstream = source.get(file.path);
    const actual = target.get(file.path);

    if (upstream !== file.sha256) {
      changed.push({
        path: file.path,
        expected: file.sha256,
        actual: upstream,
        adapter: false,
        reason: upstream === undefined ? 'source-missing' : 'source-drift',
      });
      continue;
    }

    if (file.adapter === true) {
      if (actual === file.targetSha256) {
        changed.push({
          path: file.path,
          expected: file.sha256,
          actual,
          adapter: true,
          reason: 'approved-adapter',
        });
      } else {
        changed.push({
          path: file.path,
          expected: file.targetSha256,
          actual,
          adapter: false,
          reason: 'unapproved-adapter-drift',
        });
      }
      continue;
    }

    if (actual !== file.sha256) {
      changed.push({
        path: file.path,
        expected: file.sha256,
        actual,
        adapter: false,
        reason: 'target-drift',
      });
    }
  }

  for (const file of additions.values()) {
    const actual = target.get(file.path);
    changed.push({
      path: file.path,
      expected: file.sha256,
      actual,
      adapter: actual === file.sha256,
      reason:
        actual === file.sha256
          ? 'approved-adapter-addition'
          : 'unapproved-adapter-drift',
    });
  }

  return {
    revision: await currentRevision(sourceRoot),
    expectedRevision: manifest.revision,
    missing: [...expectedTarget].filter((path) => !target.has(path)).sort(),
    unexpected: [...target.keys()]
      .filter((path) => !expectedTarget.has(path))
      .sort(),
    changed: changed.sort((left, right) => left.path.localeCompare(right.path)),
  };
}

async function createManifest({ sourceRoot, targetRoot }) {
  const revision = await currentRevision(sourceRoot);
  if (revision !== LOCKED_REVISION) {
    throw new Error(
      `Refusing to generate from Frametell ${revision}; expected ${LOCKED_REVISION}.`,
    );
  }

  const [source, target] = await Promise.all([
    inventory(sourceRoot, INCLUDE),
    inventory(targetRoot, INCLUDE),
  ]);
  const files = [];

  for (const [path, digest] of source) {
    const adapterDescription = ADAPTERS[path];
    if (adapterDescription) {
      const targetSha256 = target.get(path);
      if (!targetSha256) throw new Error(`Adapter target is missing: ${path}`);
      files.push({
        path,
        sha256: digest,
        adapter: true,
        targetSha256,
        note: adapterDescription,
      });
    } else {
      files.push({ path, sha256: digest });
    }
  }

  const additions = [];
  for (const [path, note] of Object.entries(ADDITIONS)) {
    const digest = target.get(path);
    if (!digest) throw new Error(`Adapter addition is missing: ${path}`);
    additions.push({ path, sha256: digest, adapter: true, note });
  }

  return {
    schemaVersion: 1,
    source: 'Frametell packages/engine',
    revision: LOCKED_REVISION,
    include: INCLUDE,
    files,
    additions,
  };
}

async function applyManifest({ sourceRoot, targetRoot, manifest }) {
  const before = await auditEngine({ sourceRoot, targetRoot, manifest });
  const invalid = before.changed.filter((entry) => !entry.adapter);
  if (
    before.revision !== manifest.revision ||
    before.missing.length > 0 ||
    before.unexpected.length > 0 ||
    invalid.length > 0
  ) {
    throw new Error(
      'Refusing to sync until the source revision and existing adapter audit are clean.',
    );
  }

  const source = normalizeRoot(sourceRoot);
  const target = normalizeRoot(targetRoot);
  const preserved = new Map();
  for (const file of manifest.files.filter((entry) => entry.adapter)) {
    preserved.set(file.path, await readFile(resolve(target, file.path)));
  }

  for (const file of manifest.files) {
    const destination = resolve(target, file.path);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(resolve(source, file.path), destination);
  }

  for (const [path, contents] of preserved) {
    await writeFile(resolve(target, path), contents);
  }

  return auditEngine({ sourceRoot, targetRoot, manifest });
}

function hasFailures(audit) {
  return (
    audit.revision !== audit.expectedRevision ||
    audit.missing.length > 0 ||
    audit.unexpected.length > 0 ||
    audit.changed.some((entry) => !entry.adapter)
  );
}

async function runCli() {
  const operation = process.argv[2] ?? '--check';
  const sourceRoot = process.env.FRAMETELL_ENGINE_ROOT ?? DEFAULT_SOURCE_ROOT;
  const targetRoot = process.env.TIMOTV_ENGINE_ROOT ?? DEFAULT_TARGET_ROOT;

  if (operation === '--generate-manifest') {
    const manifest = await createManifest({ sourceRoot, targetRoot });
    await writeFile(
      DEFAULT_MANIFEST_PATH,
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    console.log(
      JSON.stringify({
        manifest: DEFAULT_MANIFEST_PATH,
        files: manifest.files.length,
      }),
    );
    return;
  }

  const manifest = JSON.parse(await readFile(DEFAULT_MANIFEST_PATH, 'utf8'));
  const audit =
    operation === '--apply'
      ? await applyManifest({ sourceRoot, targetRoot, manifest })
      : await auditEngine({ sourceRoot, targetRoot, manifest });
  console.log(JSON.stringify(audit, null, 2));
  if (hasFailures(audit)) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

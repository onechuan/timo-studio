import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { reportBenchmark } from './report-video-parity-benchmark.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const defaultTopics = path.join(root, 'benchmarks/video-parity/topics.json');
const defaultRubric = path.join(root, 'benchmarks/video-parity/rubric.json');
const systems = ['frametell', 'timotv'];

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

function argValue(args, name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

function assignmentFor(pairId, revision) {
  const first = createHash('sha256')
    .update(`${revision}:${pairId}`)
    .digest()[0];
  return first % 2 === 0
    ? { a: 'frametell', b: 'timotv' }
    : { a: 'timotv', b: 'frametell' };
}

function fixtureResult(system, pairId, outputDir) {
  return {
    runtimeFailures: 0,
    unresolvedRedLint: 0,
    reviews: { passed: 1, total: 1 },
    artifacts: {
      video: path.join(outputDir, `${pairId}-${system}.mp4`),
      frames: path.join(outputDir, `${pairId}-${system}-frames`),
    },
    costs: { modelUsd: 0, speechUsd: 0 },
  };
}

function blindEntry(pair) {
  const variant = (label) => {
    const system = pair.assignment[label.toLowerCase()];
    return { label, artifacts: pair.systems[system].artifacts };
  };
  return {
    pairId: pair.pairId,
    topicId: pair.topicId,
    run: pair.run,
    variants: [variant('A'), variant('B')],
  };
}

const emptyCriterionScores = () => ({
  composition: null,
  styleConsistency: null,
  narrationAlignment: null,
  animationRhythm: null,
  overallFinish: null,
});

function reviewerTemplate(reviewerId, pairs, fixture) {
  return {
    schemaVersion: 1,
    reviewerId,
    blinded: true,
    scores: pairs.map((pair) => ({
      pairId: pair.pairId,
      a: fixture
        ? {
            composition: 4,
            styleConsistency: 4,
            narrationAlignment: 4,
            animationRhythm: 4,
            overallFinish: 4,
          }
        : emptyCriterionScores(),
      b: fixture
        ? {
            composition: 4,
            styleConsistency: 4,
            narrationAlignment: 4,
            animationRhythm: 4,
            overallFinish: 4,
          }
        : emptyCriterionScores(),
      preference: fixture ? 'tie' : null,
      notes: '',
    })),
  };
}

async function loadRunner(args, fixture) {
  if (fixture)
    return {
      runSystem: async ({ system, pairId, outputDir }) =>
        fixtureResult(system, pairId, outputDir),
    };
  const runnerFile = argValue(
    args,
    '--runner',
    process.env.TIMOTV_VIDEO_BENCHMARK_ADAPTER,
  );
  if (!runnerFile)
    throw new Error(
      'Live benchmark needs --runner <module>; the module must export runSystem(input)',
    );
  const runner = await import(pathToFileURL(path.resolve(runnerFile)).href);
  if (typeof runner.runSystem !== 'function')
    throw new Error('Benchmark runner module must export runSystem(input)');
  return runner;
}

function validateResult(result, pairId, system) {
  if (
    !result ||
    !Number.isInteger(result.runtimeFailures) ||
    result.runtimeFailures < 0 ||
    !Number.isInteger(result.unresolvedRedLint) ||
    result.unresolvedRedLint < 0 ||
    !Number.isInteger(result.reviews?.passed) ||
    !Number.isInteger(result.reviews?.total) ||
    result.reviews.passed < 0 ||
    result.reviews.passed > result.reviews.total ||
    !result.artifacts?.video ||
    !result.artifacts?.frames
  )
    throw new Error(`Invalid ${system} result for ${pairId}`);
  return result;
}

export async function runBenchmark({
  topicsFile = defaultTopics,
  rubricFile = defaultRubric,
  outputDir,
  fixture = false,
  runner,
}) {
  const [config, rubric] = await Promise.all([
    readJson(topicsFile),
    readJson(rubricFile),
  ]);
  if (
    config.topics?.length !== 6 ||
    config.runsPerTopic !== 3 ||
    rubric.reviewerCount !== 3
  )
    throw new Error(
      'Benchmark configuration must define 6 topics × 3 runs × 3 reviewers',
    );
  const artifactsDir = path.join(outputDir, 'artifacts');
  const scoresDir = path.join(outputDir, 'scores');
  await Promise.all([
    mkdir(artifactsDir, { recursive: true }),
    mkdir(scoresDir, { recursive: true }),
  ]);
  const pairs = [];
  for (const topic of config.topics)
    for (let run = 1; run <= config.runsPerTopic; run += 1) {
      const pairId = `${topic.id}-r${run}`;
      const pair = {
        pairId,
        topicId: topic.id,
        run,
        assignment: assignmentFor(pairId, config.upstreamRevision),
        systems: {},
      };
      for (const system of systems) {
        const result = await runner.runSystem({
          system,
          pairId,
          topic,
          run,
          settings: config.settings,
          upstreamRevision: config.upstreamRevision,
          outputDir: artifactsDir,
        });
        pair.systems[system] = validateResult(result, pairId, system);
      }
      pairs.push(pair);
    }
  const manifest = {
    schemaVersion: 1,
    upstreamRevision: config.upstreamRevision,
    settings: config.settings,
    generatedAt: new Date().toISOString(),
    fixture,
    pairs,
  };
  const blindPackage = {
    schemaVersion: 1,
    upstreamRevision: config.upstreamRevision,
    rubric,
    pairs: pairs.map(blindEntry),
  };
  await Promise.all([
    writeFile(
      path.join(outputDir, 'run-manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    ),
    writeFile(
      path.join(outputDir, 'blind-package.json'),
      `${JSON.stringify(blindPackage, null, 2)}\n`,
    ),
    ...Array.from({ length: rubric.reviewerCount }, (_, index) =>
      writeFile(
        path.join(scoresDir, `reviewer-${index + 1}.json`),
        `${JSON.stringify(
          reviewerTemplate(`reviewer-${index + 1}`, pairs, fixture),
          null,
          2,
        )}\n`,
      ),
    ),
  ]);
  return { manifest, blindPackage };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const fixture = args.includes('--fixture');
  const outputDir = path.resolve(
    argValue(
      args,
      '--out',
      path.join(root, '.data/video-parity', fixture ? 'fixture' : 'latest'),
    ),
  );
  const topicsFile = path.resolve(argValue(args, '--topics', defaultTopics));
  const rubricFile = path.resolve(argValue(args, '--rubric', defaultRubric));
  const runner = await loadRunner(args, fixture);
  const { manifest } = await runBenchmark({
    topicsFile,
    rubricFile,
    outputDir,
    fixture,
    runner,
  });
  if (fixture) {
    const report = await reportBenchmark({
      topicsFile,
      manifestFile: path.join(outputDir, 'run-manifest.json'),
      scoresDir: path.join(outputDir, 'scores'),
      outDir: outputDir,
    });
    console.log(
      JSON.stringify(
        {
          outputDir,
          pairCount: manifest.pairs.length,
          reviewerCount: report.reviewerCount,
          gate: report.gate,
        },
        null,
        2,
      ),
    );
    if (!report.gate.pass) process.exitCode = 1;
  } else {
    console.log(
      JSON.stringify(
        {
          outputDir,
          pairCount: manifest.pairs.length,
          next: 'Distribute blind-package.json, complete the three score files, then run report-video-parity-benchmark.mjs',
        },
        null,
        2,
      ),
    );
  }
}

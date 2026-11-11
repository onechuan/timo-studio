import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const QUALITY_GATES = Object.freeze({
  pairCount: 18,
  reviewerCount: 3,
  runtimeFailures: 0,
  unresolvedRedLint: 0,
  minimumReviewPassDelta: -0.05,
  minimumMeanScoreDelta: -0.25,
  minimumPreferredOrTiedRatio: 0.7,
});

const criteria = [
  'composition',
  'styleConsistency',
  'narrationAlignment',
  'animationRhythm',
  'overallFinish',
];

const finite = (value, label) => {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
  return value;
};

export function evaluateBenchmark(report) {
  const failures = [];
  if (report.pairCount !== QUALITY_GATES.pairCount) failures.push('pairCount');
  if (report.reviewerCount < QUALITY_GATES.reviewerCount)
    failures.push('reviewerCount');
  if (report.runtimeFailures !== QUALITY_GATES.runtimeFailures)
    failures.push('runtimeFailures');
  if (report.unresolvedRedLint !== QUALITY_GATES.unresolvedRedLint)
    failures.push('unresolvedRedLint');
  if (report.reviewPassDelta < QUALITY_GATES.minimumReviewPassDelta)
    failures.push('reviewPassDelta');
  if (report.meanScoreDelta < QUALITY_GATES.minimumMeanScoreDelta)
    failures.push('meanScoreDelta');
  if (report.preferredOrTiedRatio < QUALITY_GATES.minimumPreferredOrTiedRatio)
    failures.push('preferredOrTiedRatio');
  return { pass: failures.length === 0, failures };
}

function requireCompletePairs(topics, manifest) {
  const topicIds = new Set(topics.map((topic) => topic.id));
  const pairs = manifest?.pairs;
  if (!Array.isArray(pairs) || pairs.length !== QUALITY_GATES.pairCount)
    throw new Error('Benchmark requires 18 complete pairs');
  const seen = new Set();
  for (const pair of pairs) {
    if (
      !topicIds.has(pair.topicId) ||
      !Number.isInteger(pair.run) ||
      pair.run < 1 ||
      pair.run > 3 ||
      !pair.systems?.frametell ||
      !pair.systems?.timotv ||
      !['frametell', 'timotv'].includes(pair.assignment?.a) ||
      !['frametell', 'timotv'].includes(pair.assignment?.b) ||
      pair.assignment.a === pair.assignment.b
    )
      throw new Error(`Incomplete benchmark pair: ${pair.pairId ?? 'unknown'}`);
    const expectedId = `${pair.topicId}-r${pair.run}`;
    if (pair.pairId !== expectedId || seen.has(pair.pairId))
      throw new Error(`Invalid or duplicate pair: ${pair.pairId}`);
    seen.add(pair.pairId);
  }
  for (const topicId of topicIds)
    for (let run = 1; run <= 3; run += 1)
      if (!seen.has(`${topicId}-r${run}`))
        throw new Error(`Missing benchmark pair: ${topicId}-r${run}`);
  return pairs;
}

function requireScores(scoreFiles, pairIds) {
  if (!Array.isArray(scoreFiles) || scoreFiles.length < 3)
    throw new Error('Benchmark requires three blinded reviewer score files');
  const reviewers = new Set();
  for (const file of scoreFiles) {
    if (!file?.reviewerId || reviewers.has(file.reviewerId))
      throw new Error('Reviewer IDs must be unique');
    reviewers.add(file.reviewerId);
    const scores = new Map(
      (file.scores ?? []).map((score) => [score.pairId, score]),
    );
    if (scores.size !== pairIds.size)
      throw new Error(`Reviewer ${file.reviewerId} has incomplete scores`);
    for (const pairId of pairIds) {
      const score = scores.get(pairId);
      if (!score) throw new Error(`Missing score for ${pairId}`);
      for (const label of ['a', 'b'])
        for (const criterion of criteria) {
          const value = score[label]?.[criterion];
          if (!Number.isInteger(value) || value < 1 || value > 5)
            throw new Error(`Invalid ${criterion} score for ${pairId}`);
        }
    }
  }
  return reviewers.size;
}

const reviewRate = (pairs, system) => {
  const counts = pairs.reduce(
    (sum, pair) => ({
      passed: sum.passed + pair.systems[system].reviews.passed,
      total: sum.total + pair.systems[system].reviews.total,
    }),
    { passed: 0, total: 0 },
  );
  if (!counts.total) throw new Error(`Missing ${system} review results`);
  return counts.passed / counts.total;
};

const scoreMean = (score) =>
  criteria.reduce((sum, criterion) => sum + score[criterion], 0) /
  criteria.length;

export function buildBenchmarkReport({ topics, manifest, scoreFiles }) {
  if (!Array.isArray(topics) || topics.length !== 6)
    throw new Error('Benchmark requires exactly six topics');
  const pairs = requireCompletePairs(topics, manifest);
  const pairIds = new Set(pairs.map((pair) => pair.pairId));
  const reviewerCount = requireScores(scoreFiles, pairIds);
  const scoreIndex = scoreFiles.map(
    (file) => new Map(file.scores.map((score) => [score.pairId, score])),
  );
  const summaries = pairs.map((pair) => {
    const totals = { frametell: 0, timotv: 0 };
    for (const scores of scoreIndex) {
      const score = scores.get(pair.pairId);
      totals[pair.assignment.a] += scoreMean(score.a);
      totals[pair.assignment.b] += scoreMean(score.b);
    }
    const frametellScore = totals.frametell / reviewerCount;
    const timotvScore = totals.timotv / reviewerCount;
    return {
      pairId: pair.pairId,
      topicId: pair.topicId,
      run: pair.run,
      frametellScore,
      timotvScore,
      scoreDelta: timotvScore - frametellScore,
      preferredOrTied: timotvScore >= frametellScore,
    };
  });
  const runtimeFailures = pairs.reduce(
    (sum, pair) => sum + pair.systems.timotv.runtimeFailures,
    0,
  );
  const unresolvedRedLint = pairs.reduce(
    (sum, pair) => sum + pair.systems.timotv.unresolvedRedLint,
    0,
  );
  const frametellReviewRate = reviewRate(pairs, 'frametell');
  const timotvReviewRate = reviewRate(pairs, 'timotv');
  const meanScoreDelta =
    summaries.reduce((sum, pair) => sum + pair.scoreDelta, 0) /
    summaries.length;
  const preferredOrTiedRatio =
    summaries.filter((pair) => pair.preferredOrTied).length / summaries.length;
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    upstreamRevision: manifest.upstreamRevision,
    settings: manifest.settings,
    pairCount: pairs.length,
    reviewerCount,
    runtimeFailures: finite(runtimeFailures, 'runtimeFailures'),
    unresolvedRedLint: finite(unresolvedRedLint, 'unresolvedRedLint'),
    frametellReviewRate,
    timotvReviewRate,
    reviewPassDelta: timotvReviewRate - frametellReviewRate,
    meanScoreDelta,
    preferredOrTiedRatio,
    pairs: summaries,
  };
  return { ...report, gate: evaluateBenchmark(report) };
}

export function benchmarkMarkdown(report) {
  const pct = (value) => `${(value * 100).toFixed(1)}%`;
  const rows = report.pairs
    .map(
      (pair) =>
        `| ${pair.pairId} | ${pair.frametellScore.toFixed(2)} | ${pair.timotvScore.toFixed(2)} | ${pair.scoreDelta.toFixed(2)} | ${pair.preferredOrTied ? '是' : '否'} |`,
    )
    .join('\n');
  return `# TimoTV / Frametell 视频质量基准\n\n- 上游版本：\`${report.upstreamRevision}\`\n- 对照组：${report.pairCount}\n- 盲评人：${report.reviewerCount}\n- 运行失败：${report.runtimeFailures}\n- 未解决红色 lint：${report.unresolvedRedLint}\n- 审片通过率差值：${pct(report.reviewPassDelta)}\n- 平均得分差值：${report.meanScoreDelta.toFixed(2)}\n- TimoTV 优于或持平：${pct(report.preferredOrTiedRatio)}\n- 质量门禁：${report.gate.pass ? '通过' : `未通过（${report.gate.failures.join('、')}）`}\n\n| 对照组 | Frametell | TimoTV | 差值 | 优于或持平 |\n| --- | ---: | ---: | ---: | :---: |\n${rows}\n`;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function reportBenchmark({
  topicsFile,
  manifestFile,
  scoresDir,
  outDir,
}) {
  const [topicConfig, manifest, names] = await Promise.all([
    readJson(topicsFile),
    readJson(manifestFile),
    readdir(scoresDir),
  ]);
  const scoreNames = names.filter((name) => name.endsWith('.json')).sort();
  const scoreFiles = await Promise.all(
    scoreNames.map((name) => readJson(path.join(scoresDir, name))),
  );
  const report = buildBenchmarkReport({
    topics: topicConfig.topics,
    manifest,
    scoreFiles,
  });
  await mkdir(outDir, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(outDir, 'report.json'),
      `${JSON.stringify(report, null, 2)}\n`,
    ),
    writeFile(path.join(outDir, 'report.md'), benchmarkMarkdown(report)),
  ]);
  return report;
}

function argValue(args, name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
  const args = process.argv.slice(2);
  const runDir = path.resolve(
    argValue(args, '--run-dir', path.join(root, '.data/video-parity/latest')),
  );
  const report = await reportBenchmark({
    topicsFile: path.resolve(
      argValue(
        args,
        '--topics',
        path.join(root, 'benchmarks/video-parity/topics.json'),
      ),
    ),
    manifestFile: path.resolve(
      argValue(args, '--manifest', path.join(runDir, 'run-manifest.json')),
    ),
    scoresDir: path.resolve(
      argValue(args, '--scores', path.join(runDir, 'scores')),
    ),
    outDir: path.resolve(argValue(args, '--out', runDir)),
  });
  console.log(
    JSON.stringify(
      {
        report: path.join(runDir, 'report.json'),
        pairCount: report.pairCount,
        gate: report.gate,
      },
      null,
      2,
    ),
  );
  if (!report.gate.pass) process.exitCode = 1;
}

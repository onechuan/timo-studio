export interface BenchmarkGateInput {
  pairCount: number;
  reviewerCount: number;
  runtimeFailures: number;
  unresolvedRedLint: number;
  reviewPassDelta: number;
  meanScoreDelta: number;
  preferredOrTiedRatio: number;
}

export interface BenchmarkGateResult {
  pass: boolean;
  failures: string[];
}

export const QUALITY_GATES: Readonly<{
  pairCount: 18;
  reviewerCount: 3;
  runtimeFailures: 0;
  unresolvedRedLint: 0;
  minimumReviewPassDelta: -0.05;
  minimumMeanScoreDelta: -0.25;
  minimumPreferredOrTiedRatio: 0.7;
}>;

export function evaluateBenchmark(
  report: BenchmarkGateInput,
): BenchmarkGateResult;

export function buildBenchmarkReport(input: {
  topics: Array<{ id: string }>;
  manifest: { pairs: unknown[]; [key: string]: unknown };
  scoreFiles: unknown[];
}): BenchmarkGateInput & {
  schemaVersion: 1;
  gate: BenchmarkGateResult;
  pairs: unknown[];
};

export function benchmarkMarkdown(report: BenchmarkGateInput): string;

export function reportBenchmark(input: {
  topicsFile: string;
  manifestFile: string;
  scoresDir: string;
  outDir: string;
}): Promise<BenchmarkGateInput & { gate: BenchmarkGateResult }>;

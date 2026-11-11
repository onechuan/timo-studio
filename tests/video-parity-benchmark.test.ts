import { describe, expect, it } from 'vitest';

import {
  buildBenchmarkReport,
  evaluateBenchmark,
} from '../scripts/report-video-parity-benchmark.mjs';

const passingReport = {
  pairCount: 18,
  reviewerCount: 3,
  runtimeFailures: 0,
  unresolvedRedLint: 0,
  reviewPassDelta: -0.05,
  meanScoreDelta: -0.25,
  preferredOrTiedRatio: 13 / 18,
};

describe('video parity quality gates', () => {
  it('passes only when every quality gate from the design is met', () => {
    expect(evaluateBenchmark(passingReport)).toEqual({
      pass: true,
      failures: [],
    });
    expect(
      evaluateBenchmark({ ...passingReport, runtimeFailures: 1 }).pass,
    ).toBe(false);
    expect(
      evaluateBenchmark({ ...passingReport, unresolvedRedLint: 1 }).pass,
    ).toBe(false);
    expect(
      evaluateBenchmark({ ...passingReport, reviewPassDelta: -0.051 }).pass,
    ).toBe(false);
    expect(
      evaluateBenchmark({ ...passingReport, meanScoreDelta: -0.251 }).pass,
    ).toBe(false);
    expect(
      evaluateBenchmark({ ...passingReport, preferredOrTiedRatio: 0.69 }).pass,
    ).toBe(false);
  });

  it('refuses incomplete pairs or fewer than three blinded reviewers', () => {
    const topics = Array.from({ length: 6 }, (_, index) => ({
      id: `topic-${index + 1}`,
    }));
    expect(() =>
      buildBenchmarkReport({
        topics,
        manifest: { pairs: [] },
        scoreFiles: [],
      }),
    ).toThrow(/18 complete pairs/i);

    const pairs = topics.flatMap((topic) =>
      Array.from({ length: 3 }, (_, index) => ({
        pairId: `${topic.id}-r${index + 1}`,
        topicId: topic.id,
        run: index + 1,
        assignment: { a: 'frametell', b: 'timotv' },
        systems: {
          frametell: { reviews: { passed: 1, total: 1 } },
          timotv: {
            runtimeFailures: 0,
            unresolvedRedLint: 0,
            reviews: { passed: 1, total: 1 },
          },
        },
      })),
    );
    expect(() =>
      buildBenchmarkReport({
        topics,
        manifest: { pairs },
        scoreFiles: [],
      }),
    ).toThrow(/three blinded reviewer/i);
  });
});

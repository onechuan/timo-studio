export interface DurationBand {
  targetMs: number;
  minMs: number;
  maxMs: number;
}

export interface DurationEstimationProfile {
  chineseCharactersPerSecond?: number;
  englishWordsPerSecond?: number;
  commaPauseMs?: number;
  sentencePauseMs?: number;
  newlinePauseMs?: number;
}

export interface DurationEstimate {
  estimatedMs: number;
  sceneMs: number[];
  confidence: number;
}

export function durationBand(targetSec: number): DurationBand {
  const targetMs = Math.round(targetSec * 1000);
  return {
    targetMs,
    minMs: Math.round(targetMs * 0.9),
    maxMs: Math.round(targetMs * 1.1),
  };
}

type BudgetScene = {
  weight?: number;
  say?: string;
  visual?: string;
  beats?: string[];
};

export function allocateSceneBudgets(
  scenes: BudgetScene[],
  targetSec: number,
): number[] {
  if (!scenes.length) return [];
  const totalSeconds = Math.max(scenes.length, Math.round(targetSec));
  const weights = scenes.map((scene) =>
    Math.max(
      0.1,
      scene.weight ??
        1 +
          [...(scene.say ?? '')].length / 80 +
          (scene.beats?.length ?? 0) * 0.35 +
          [...(scene.visual ?? '')].length / 240,
    ),
  );
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  const distributable = totalSeconds - scenes.length;
  const raw = weights.map((weight) => (weight / totalWeight) * distributable);
  const budgets = raw.map((value) => 1 + Math.floor(value));
  let remaining = totalSeconds - budgets.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (let cursor = 0; remaining > 0; cursor++, remaining--)
    budgets[order[cursor % order.length]!.index]++;
  return budgets;
}

function sceneText(scene: unknown): string {
  if (!scene || typeof scene !== 'object') return '';
  const value = scene as {
    text?: string;
    say?: string;
    cues?: { text?: string }[];
  };
  return value.cues?.map((cue) => cue.text ?? '').join('') ?? value.text ?? value.say ?? '';
}

export function estimateNarrationMs(
  scenes: unknown[],
  profile: DurationEstimationProfile = {},
): DurationEstimate {
  const chineseRate = profile.chineseCharactersPerSecond ?? 4;
  const englishRate = profile.englishWordsPerSecond ?? 2.5;
  const commaPause = profile.commaPauseMs ?? 180;
  const sentencePause = profile.sentencePauseMs ?? 360;
  const newlinePause = profile.newlinePauseMs ?? 420;
  const sceneMs = scenes.map((scene) => {
    const text = sceneText(scene);
    const chinese = text.match(/\p{Script=Han}/gu)?.length ?? 0;
    const english = text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
    const comma = text.match(/[,，、;；:：]/g)?.length ?? 0;
    const sentence = text.match(/[.!?。！？]/g)?.length ?? 0;
    const newline = text.match(/\n/g)?.length ?? 0;
    return Math.round(
      (chinese / chineseRate + english / englishRate) * 1000 +
        comma * commaPause +
        sentence * sentencePause +
        newline * newlinePause,
    );
  });
  const text = scenes.map(sceneText).join('');
  const meaningful = text.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  return {
    estimatedMs: sceneMs.reduce((sum, value) => sum + value, 0),
    sceneMs,
    confidence: meaningful ? (meaningful >= 40 ? 0.82 : 0.68) : 0,
  };
}

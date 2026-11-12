import { expect, it } from 'vitest';
import { ProductionService } from '../packages/core/src/production/service.js';
import type { Production } from '../packages/contracts/src/index.js';
const brief = {
  topic: '复利',
  materials: '',
  durationSec: 60,
  language: 'zh',
  style: 'warm',
  voiceProvider: 'local',
  voice: '',
} as const;
function fixture(
  configured = true,
  dynamic = false,
  runtime?: {
    database: { ready: boolean; code?: string };
    queue: { ready: boolean; code?: string };
    browser: { ready: boolean; code?: string };
    ffmpeg: { ready: boolean; code?: string };
  },
  pipeline: 'legacy-v3' | 'drawing-engine-v3' = 'legacy-v3',
) {
  let enabled = configured;
  let doc: Production | null = null;
  const claimed: string[] = [];
  const service = new ProductionService(
    {
      get: async () => doc,
      create: async (d) => {
        doc = d;
        return d;
      },
      save: async (d, rev) => {
        if (doc?.revision !== rev) throw new Error('conflict');
        doc = d;
        return d;
      },
      claim: async (_id, rev, stage, type) => {
        if (doc?.revision !== rev || doc.jobId) throw new Error('conflict');
        const keepsEdit = type === 'export' || type === 'edit-export';
        const revision = keepsEdit ? rev : rev + 1;
        doc = {
          ...doc!,
          revision,
          stage,
          jobId: 'job1',
          ...(keepsEdit ? {} : { edit: undefined }),
        };
        claimed.push(type);
        return { production: doc, job: { id: 'job1', type } };
      },
      failSubmission: async () => {},
    },
    { enqueue: async () => {}, health: async () => {} },
    dynamic
      ? async () => ({
          model: { configured: enabled, provider: 'test', model: 'test' },
          voices: { volcengine: false, local: true, elevenlabs: false },
          runtime,
        })
      : {
          model: { configured, provider: 'test', model: 'test' },
          voices: { volcengine: false, local: true, elevenlabs: false },
          runtime,
        },
    async () => true,
    async () => pipeline,
  );
  return {
    service,
    read: () => doc,
    claimed,
    enable: () => {
      enabled = true;
    },
  };
}
const editRuntime = {
  database: { ready: true },
  queue: { ready: true },
  browser: { ready: false, code: 'REVIEW_BROWSER_MISSING' },
  ffmpeg: { ready: true },
};
function readyFilm(f: ReturnType<typeof fixture>) {
  const p = f.read()!;
  p.stage = 'ready';
  p.durationMs = 4000;
  p.artifacts = {
    audio: 'production/project1/r0/audio.wav',
    subtitles: 'production/project1/r0/subtitles.srt',
    video: 'production/project1/r0/video.mp4',
  };
  p.scenes = [
    {
      id: 's',
      title: '测试',
      visual: '测试',
      beats: ['测试'],
      cues: [
        { id: 'c1', text: '第一句', startMs: 0, endMs: 1500 },
        { id: 'c2', text: '第二句', startMs: 1500, endMs: 3000 },
        { id: 'c3', text: '第三句', startMs: 3000, endMs: 4000 },
      ],
    },
  ];
  return p;
}
it('records the selected video pipeline when a production is created', async () => {
  const legacy = fixture();
  expect((await legacy.service.create('legacy', brief)).videoPipeline).toBe(
    'legacy-v3',
  );
  const parity = fixture(true, false, undefined, 'drawing-engine-v3');
  const created = await parity.service.create('parity', brief);
  expect(created.videoPipeline).toBe('drawing-engine-v3');
  expect(
    (
      await parity.service.update('parity', {
        revision: 0,
        brief: { ...brief, topic: '更新后仍保持链路' },
      })
    ).videoPipeline,
  ).toBe('drawing-engine-v3');
});
it('reports browser readiness separately and blocks only browser-dependent work', async () => {
  const f = fixture(true, false, {
    database: { ready: true },
    queue: { ready: true },
    browser: { ready: false, code: 'REVIEW_BROWSER_MISSING' },
    ffmpeg: { ready: true },
  });
  await f.service.create('project1', brief);
  const capabilities = await f.service.getCapabilities();
  expect(capabilities.model.configured).toBe(true);
  expect(capabilities.runtime?.browser).toEqual({
    ready: false,
    code: 'REVIEW_BROWSER_MISSING',
  });

  const p = f.read()!;
  p.stage = 'ready';
  p.artifacts = { audio: 'audio.wav', preview: 'preview.html' };
  p.scenes = [
    {
      id: 's',
      title: '测试',
      visual: '测试',
      beats: ['测试'],
      cues: [{ id: 'c', text: '测试', startMs: 0, endMs: 1000 }],
    },
  ];
  await expect(
    f.service.act('project1', { revision: 0, action: 'export' }),
  ).rejects.toMatchObject({ code: 'REVIEW_BROWSER_MISSING' });
});
it.each(['needs-input', 'failed'] as const)(
  'accepts measured %s duration and resumes illustration',
  async (status) => {
    const f = fixture();
    await f.service.create('project1', brief);
    const p = f.read()!;
    p.stage = 'failed';
    p.failedAction = 'produce';
    p.durationMs = 212_000;
    p.failure = {
      code: 'DURATION_CONTENT_INSUFFICIENT',
      phase: 'narrating',
      retryable: false,
      diagnosticId: 'test',
      publicMessage: 'duration',
    };
    p.durationState = {
      status,
      targetMs: 300_000,
      minMs: 270_000,
      maxMs: 330_000,
      measuredMs: 212_000,
      correctionRound: 0,
    };
    p.artifacts = { audio: 'audio.wav', subtitles: 'subtitles.srt' };
    p.scenes = [
      {
        id: 's',
        title: '原稿',
        visual: '原稿',
        beats: ['原稿'],
        cues: [{ id: 'c', text: '逐字原稿', startMs: 0, endMs: 212_000 }],
      },
    ];

    const accepted = await f.service.act('project1', {
      revision: 0,
      action: 'accept-duration',
    });
    expect(accepted.stage).toBe('illustrating');
    expect(accepted.artifacts.audio).toBe('audio.wav');
    expect(accepted.durationState).toMatchObject({
      status: 'accepted',
      policy: 'accepted-source',
      targetMs: 212_000,
      measuredMs: 212_000,
    });
    await expect(
      f.service.act('project1', {
        revision: accepted.revision,
        action: 'accept-duration',
      }),
    ).rejects.toMatchObject({ code: 'PRODUCTION_BUSY' });
  },
);
it('requires explicit acceptance of unresolved visual issues before export', async () => {
  const f = fixture();
  await f.service.create('project1', brief);
  const p = f.read()!;
  p.stage = 'ready';
  p.artifacts = { audio: 'old.wav', preview: 'old.html' };
  p.scenes = [
    {
      id: 's',
      title: '杯',
      visual: '杯',
      beats: ['水'],
      cues: [{ id: 'c', text: '水' }],
      review: {
        fingerprint: 'hash',
        status: 'needs_attention',
        mode: 'visual',
        round: 2,
        frames: [],
        omittedCueIds: [],
        issues: [
          {
            kind: 'visual',
            severity: 'warning',
            atMs: 0,
            elementIds: [],
            what: '遮挡',
            fix: '移动',
          },
        ],
      },
    },
  ];
  await expect(
    f.service.act('project1', { revision: 0, action: 'export' }),
  ).rejects.toMatchObject({ code: 'REVIEW_REQUIRED' });
  const accepted = await f.service.act('project1', {
    revision: 0,
    action: 'accept',
    sceneId: 's',
  });
  expect(accepted.scenes[0].review?.status).toBe('accepted');
  expect(accepted.artifacts).toEqual(p.artifacts);
  await expect(
    f.service.act('project1', {
      revision: accepted.revision,
      action: 'export',
    }),
  ).resolves.toMatchObject({ stage: 'rendering' });
});
it('voice changes invalidate review even when artwork is retained', async () => {
  const f = fixture();
  await f.service.create('project1', brief);
  const p = f.read()!;
  p.scenes = [
    {
      id: 's',
      title: '杯',
      visual: '杯',
      beats: ['水'],
      cues: [{ id: 'c', text: '水' }],
      review: {
        fingerprint: 'old',
        status: 'passed',
        mode: 'visual',
        round: 0,
        frames: [],
        issues: [],
        omittedCueIds: [],
      },
    },
  ];
  const next = await f.service.update('project1', {
    revision: 0,
    brief: { ...brief, voice: 'new' },
  });
  expect(next.scenes[0].review).toBeUndefined();
});
it('主题创建制作稿，不需要用户讲稿', async () => {
  const f = fixture();
  const p = await f.service.create('project1', brief);
  expect(p.stage).toBe('draft');
  expect(p.scenes).toEqual([]);
});
it('分镜未完成时禁止批准和配音', async () => {
  const f = fixture();
  await f.service.create('project1', brief);
  await expect(
    f.service.act('project1', { revision: 0, action: 'approve' }),
  ).rejects.toMatchObject({ code: 'INVALID_STAGE' });
  await expect(
    f.service.act('project1', { revision: 0, action: 'produce' }),
  ).rejects.toMatchObject({ code: 'INVALID_STAGE' });
});
it('未配置模型立即报错，且不提交任务', async () => {
  const f = fixture(false);
  await f.service.create('project1', brief);
  await expect(
    f.service.act('project1', { revision: 0, action: 'plan' }),
  ).rejects.toMatchObject({ code: 'MODEL_NOT_CONFIGURED' });
  expect(f.read()?.stage).toBe('draft');
});
it('拒绝旧版本请求，并禁止运行中修改', async () => {
  const f = fixture();
  await f.service.create('project1', brief);
  await expect(
    f.service.act('project1', { revision: 2, action: 'plan' }),
  ).rejects.toMatchObject({ code: 'REVISION_CONFLICT' });
  await f.service.act('project1', { revision: 0, action: 'plan' });
  await expect(
    f.service.update('project1', { revision: 1, brief }),
  ).rejects.toMatchObject({ code: 'PRODUCTION_BUSY' });
});
it('只更换火山配音保留分镜和口播，使旧音频失效', async () => {
  const f = fixture();
  await f.service.create('project1', brief);
  const p = f.read()!;
  p.stage = 'ready';
  p.storyboard = {
    title: '复利',
    summary: '复利机制',
    scenes: [
      {
        id: 'p01',
        title: '增长',
        say: '收益再投入',
        visual: '树',
        beats: ['发芽'],
      },
    ],
  };
  p.scenes = [
    {
      id: 'p01',
      title: '增长',
      visual: '树',
      beats: ['发芽'],
      cues: [
        {
          id: 'c0',
          text: '利息也会产生利息。',
          audioKey: 'old.wav',
          startMs: 0,
          endMs: 1000,
        },
      ],
    },
  ];
  p.artifacts = { audio: 'old.wav', video: 'old.mp4' };
  const updated = await f.service.update('project1', {
    revision: 0,
    brief: {
      ...brief,
      contentType: 'general',
      voiceProvider: 'volcengine',
      voice: '',
    },
  });
  expect(updated.storyboard).toEqual(p.storyboard);
  expect(updated.scenes[0].cues).toEqual([
    { id: 'c0', text: '利息也会产生利息。' },
  ]);
  expect(updated.artifacts).toEqual({});
  expect(updated.stage).toBe('narrating');
  await expect(
    f.service.act('project1', {
      revision: updated.revision,
      action: 'produce',
    }),
  ).rejects.toMatchObject({
    code: 'VOICE_NOT_CONFIGURED',
    message: expect.stringContaining('设置页'),
  });
});

it('loads fresh capabilities before a new action without restarting', async () => {
  const f = fixture(false, true);
  const p = await f.service.create('project1', brief);
  expect((await f.service.getCapabilities()).model.configured).toBe(false);
  await expect(
    f.service.act('project1', { revision: p.revision, action: 'plan' }),
  ).rejects.toMatchObject({ code: 'MODEL_NOT_CONFIGURED' });
  f.enable();
  expect((await f.service.getCapabilities()).model.configured).toBe(true);
  await expect(
    f.service.act('project1', { revision: p.revision, action: 'plan' }),
  ).resolves.toMatchObject({ stage: 'planning' });
});
it('更换创作方向使旧分镜、口播和成片失效', async () => {
  const f = fixture();
  await f.service.create('project1', brief);
  const p = f.read()!;
  p.stage = 'ready';
  p.storyboard = {
    title: '原稿',
    summary: '原结构',
    scenes: [
      { id: 'p01', title: '开头', say: '原文', visual: '树', beats: ['发芽'] },
    ],
  };
  p.scenes = [
    {
      id: 'p01',
      title: '开头',
      visual: '树',
      beats: ['发芽'],
      cues: [{ id: 'c01', text: '原文' }],
    },
  ];
  p.artifacts = { video: 'old.mp4' };
  const updated = await f.service.update('project1', {
    revision: 0,
    brief: { ...brief, contentType: 'product' },
  });
  expect(updated.brief.contentType).toBe('product');
  expect(updated.stage).toBe('draft');
  expect(updated.storyboard).toBeUndefined();
  expect(updated.scenes).toEqual([]);
  expect(updated.artifacts).toEqual({});
});

it('draw-only requires measured audio and model but does not require voice configuration', async () => {
  const f = fixture();
  await f.service.create('project1', brief);
  const p = f.read()!;
  p.stage = 'ready';
  p.brief.voiceProvider = 'volcengine';
  await expect(
    f.service.act('project1', { revision: 0, action: 'illustrate' }),
  ).rejects.toMatchObject({ code: 'INVALID_STAGE' });
  p.scenes = [
    {
      id: 's',
      title: '杯',
      visual: '杯',
      beats: ['水滴'],
      cues: [{ id: 'c', text: '水滴', startMs: 0, endMs: 1000 }],
    },
  ];
  p.artifacts = { audio: 'old.wav', subtitles: 'old.srt' };
  p.durationMs = 1000;
  await expect(
    f.service.act('project1', { revision: 0, action: 'illustrate' }),
  ).resolves.toMatchObject({
    stage: 'illustrating',
    artifacts: { audio: 'old.wav' },
  });
});
it('semantic script edits discard artwork while voice-only edits keep it', async () => {
  const f = fixture();
  await f.service.create('project1', brief);
  const p = f.read()!;
  p.stage = 'ready';
  p.scenes = [
    {
      id: 's',
      title: '杯',
      visual: '杯',
      beats: ['水滴'],
      cues: [{ id: 'c', text: '水滴' }],
      artwork: {
        version: 1,
        intent: '杯',
        elements: [
          {
            id: 'cup',
            type: 'illustration',
            name: 'cup',
            x: 500,
            y: 200,
            width: 400,
            height: 400,
            cueIndex: 0,
            transition: 'rise',
            fill: 'accent',
            stroke: 'none',
            strokeWidth: 3,
            opacity: 1,
          },
        ],
      },
    },
  ];
  const voice = await f.service.update('project1', {
    revision: 0,
    brief: { ...brief, voice: 'new' },
  });
  expect(voice.scenes[0].artwork).toEqual(p.scenes[0].artwork);
  const edit = await f.service.update('project1', {
    revision: 1,
    scenes: voice.scenes.map((s) => ({
      ...s,
      cues: [{ id: 'c', text: '新概念' }],
    })),
  });
  expect(edit.scenes[0].artwork).toBeUndefined();
});

it('rejects unknown page redraw and accepts an existing measured page', async () => {
  const f = fixture();
  await f.service.create('project1', brief);
  const p = f.read()!;
  p.stage = 'ready';
  p.durationMs = 1000;
  p.artifacts = { audio: 'old.wav' };
  p.scenes = [
    {
      id: 's',
      title: '杯',
      visual: '杯',
      beats: ['水滴'],
      cues: [{ id: 'c', text: '水滴', startMs: 0, endMs: 1000 }],
    },
  ];
  await expect(
    f.service.act('project1', {
      revision: 0,
      action: 'illustrate',
      sceneId: 'missing',
    }),
  ).rejects.toMatchObject({ code: 'INVALID_SCENE' });
  expect(p.jobId).toBeUndefined();
  await expect(
    f.service.act('project1', {
      revision: 0,
      action: 'illustrate',
      sceneId: 's',
    }),
  ).resolves.toMatchObject({ stage: 'illustrating' });
});

it('changing only the target preserves measured narration and resets correction attempts', async () => {
  const f = fixture();
  await f.service.create('project1', { ...brief, durationSec: 300 });
  const p = f.read()!;
  p.stage = 'failed';
  p.durationMs = 175000;
  p.artifacts = { audio: 'audio.wav', subtitles: 'subtitles.srt' };
  p.durationState = {
    status: 'failed',
    targetMs: 300000,
    minMs: 270000,
    maxMs: 330000,
    measuredMs: 175000,
    correctionRound: 2,
  };
  p.scenes = [
    {
      id: 's',
      title: '咖啡',
      visual: '杯',
      beats: ['杯'],
      cues: [{ id: 'c', text: '咖啡', startMs: 0, endMs: 175000 }],
    },
  ];
  const changed = await f.service.update('project1', {
    revision: 0,
    brief: { ...p.brief, durationSec: 180 },
  });
  expect(changed.artifacts).toEqual(p.artifacts);
  expect(changed.scenes).toEqual(p.scenes);
  expect(changed.durationMs).toBe(175000);
  expect(changed.durationState).toMatchObject({
    targetMs: 180000,
    correctionRound: 0,
    status: 'estimating',
  });
});

it('saves an edit on top of an exported film and derives its subtitles', async () => {
  const f = fixture(true, false, editRuntime);
  await f.service.create('project1', brief);
  const p = readyFilm(f);
  const saved = await f.service.update('project1', {
    revision: 0,
    edit: { clips: [{ id: 'a', sourceInMs: 1000, sourceOutMs: 3000 }] },
  });
  expect(saved.stage).toBe('ready');
  expect(saved.durationMs).toBe(4000);
  expect(saved.artifacts).toEqual(p.artifacts);
  expect(saved.edit?.source).toMatchObject({
    videoKey: p.artifacts.video,
    durationMs: 4000,
    fps: 12,
  });
  expect(saved.edit?.subtitles).toEqual([
    { cueId: 'c1', text: '第一句', startMs: 0, endMs: 500 },
    { cueId: 'c2', text: '第二句', startMs: 500, endMs: 2000 },
  ]);
});

it('clears a stale edit when content changes and can reset it explicitly', async () => {
  const f = fixture(true, false, editRuntime);
  await f.service.create('project1', brief);
  readyFilm(f);
  const saved = await f.service.update('project1', {
    revision: 0,
    edit: { clips: [{ id: 'a', sourceInMs: 0, sourceOutMs: 2000 }] },
  });
  const cleared = await f.service.update('project1', {
    revision: saved.revision,
    brief: { ...brief, voice: 'new-voice' },
  });
  expect(cleared.edit).toBeUndefined();

  const f2 = fixture(true, false, editRuntime);
  await f2.service.create('project1', brief);
  readyFilm(f2);
  const kept = await f2.service.update('project1', {
    revision: 0,
    edit: { clips: [{ id: 'a', sourceInMs: 0, sourceOutMs: 2000 }] },
  });
  const reset = await f2.service.update('project1', {
    revision: kept.revision,
    edit: null,
  });
  expect(reset.edit).toBeUndefined();
  expect(reset.artifacts.video).toBe(kept.artifacts.video);
});

it('requires an exported film before saving an edit', async () => {
  const f = fixture(true, false, editRuntime);
  await f.service.create('project1', brief);
  const p = f.read()!;
  p.stage = 'ready';
  p.durationMs = 1000;
  p.scenes = [
    {
      id: 's',
      title: '测试',
      visual: '测试',
      beats: ['测试'],
      cues: [{ id: 'c', text: '句子', startMs: 0, endMs: 1000 }],
    },
  ];
  await expect(
    f.service.update('project1', {
      revision: 0,
      edit: { clips: [{ id: 'a', sourceInMs: 0, sourceOutMs: 1000 }] },
    }),
  ).rejects.toMatchObject({ code: 'INVALID_STAGE' });
  p.artifacts.video = 'production/project1/r0/video.mp4';
  await expect(
    f.service.update('project1', {
      revision: 0,
      edit: { clips: [{ id: 'a', sourceInMs: 0, sourceOutMs: 2000 }] },
    }),
  ).rejects.toMatchObject({ code: 'INVALID_EDIT' });
});

it('submits edit-export without a browser and without bumping the revision', async () => {
  const f = fixture(true, false, editRuntime);
  await f.service.create('project1', brief);
  readyFilm(f);
  const saved = await f.service.update('project1', {
    revision: 0,
    edit: { clips: [{ id: 'a', sourceInMs: 0, sourceOutMs: 2000 }] },
  });
  const claimed = await f.service.act('project1', {
    revision: saved.revision,
    action: 'edit-export',
  });
  expect(claimed.stage).toBe('rendering');
  expect(f.claimed).toContain('edit-export');
  expect(f.read()?.revision).toBe(saved.revision);
  expect(f.read()?.edit).toEqual(saved.edit);
});

it('rejects exporting an edit whose source has changed', async () => {
  const f = fixture(true, false, editRuntime);
  await f.service.create('project1', brief);
  const p = readyFilm(f);
  const saved = await f.service.update('project1', {
    revision: 0,
    edit: { clips: [{ id: 'a', sourceInMs: 0, sourceOutMs: 2000 }] },
  });
  p.scenes[0].cues[1].text = '改过的口播';
  expect((await f.service.get('project1'))?.edit).toBeUndefined();
  await expect(
    f.service.act('project1', {
      revision: saved.revision,
      action: 'edit-export',
    }),
  ).rejects.toMatchObject({ code: 'INVALID_STAGE' });
  expect(f.claimed).not.toContain('edit-export');
});

it.each(['missing-audio', 'missing-timing', 'unrelated-failure'] as const)(
  'rejects duration acceptance for %s',
  async (invalid) => {
    const f = fixture();
    await f.service.create('project1', brief);
    const p = f.read()!;
    p.stage = 'failed';
    p.durationMs = 175000;
    p.durationState = {
      status: 'failed',
      targetMs: 300000,
      minMs: 270000,
      maxMs: 330000,
      measuredMs: 175000,
      correctionRound: 2,
    };
    p.failure = {
      code:
        invalid === 'unrelated-failure'
          ? 'PROVIDER_TIMEOUT'
          : 'DURATION_CONTENT_INSUFFICIENT',
      phase: 'narrating',
      retryable: false,
      diagnosticId: 'test',
      publicMessage: 'error',
    } as Production['failure'];
    p.artifacts = invalid === 'missing-audio' ? {} : { audio: 'saved.wav' };
    p.scenes = [
      {
        id: 's',
        title: '咖啡',
        visual: '杯',
        beats: ['杯'],
        cues: [
          {
            id: 'c',
            text: '咖啡',
            ...(invalid === 'missing-timing'
              ? {}
              : { startMs: 0, endMs: 175000 }),
          },
        ],
      },
    ];
    await expect(
      f.service.act('project1', { revision: 0, action: 'accept-duration' }),
    ).rejects.toMatchObject({ code: 'INVALID_STAGE' });
  },
);

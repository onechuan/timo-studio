import {
  sceneArtworkSchema,
  type FilmScene,
} from '../../packages/contracts/src/index.js';
/** Deterministic review fixture: one assembly across three narration cues, for both canvas sizes. */
export function animationScene(aspect: '16:9' | '9:16' = '16:9'): FilmScene {
  const startX = aspect === '16:9' ? 360 : 180;
  const common = { x: 0, y: 0, width: 240, height: 240, cueIndex: 0, layer: 0 };
  const at = (cueId: string, progress: number) => ({ cueId, progress });
  return {
    id: 'motion-demo',
    title: '流动让系统发生变化',
    visual: '液位升高，节点激活，路径弯曲',
    beats: ['注入', '激活', '传递'],
    cues: [
      { id: 'pour', text: '液体逐渐进入容器。', startMs: 0, endMs: 2000 },
      {
        id: 'activate',
        text: '达到条件，节点激活。',
        startMs: 2000,
        endMs: 4000,
      },
      {
        id: 'transfer',
        text: '变化沿连接传递，最后保持。',
        startMs: 4000,
        endMs: 6000,
      },
    ],
    artwork: sceneArtworkSchema.parse({
      version: 2,
      intent: '保持同一容器身份，连续注入并激活连接节点',
      elements: [
        {
          ...common,
          id: 'assembly',
          type: 'group',
          x: startX,
          y: 300,
          width: 480,
          height: 300,
        },
        {
          ...common,
          id: 'tank',
          parentId: 'assembly',
          type: 'component',
          name: 'liquid',
          state: 'active',
          parameter: 0.1,
        },
        {
          ...common,
          id: 'node',
          parentId: 'assembly',
          type: 'component',
          name: 'node',
          state: 'idle',
          x: 300,
          y: 70,
          width: 100,
          height: 100,
          layer: 2,
        },
        {
          ...common,
          id: 'flow',
          parentId: 'assembly',
          type: 'component',
          name: 'flow',
          state: 'active',
          x: 245,
          y: 90,
          width: 55,
          height: 60,
          layer: 1,
        },
        {
          ...common,
          id: 'outline',
          parentId: 'assembly',
          type: 'path',
          d: 'M0 80 C25 80 75 80 100 80',
          y: 250,
          width: 400,
          height: 50,
          fill: 'none',
          stroke: 'accent',
        },
      ],
      tracks: [
        {
          elementId: 'assembly',
          property: 'move',
          keyframes: [
            { at: at('pour', 0), value: { x: startX, y: 300 } },
            { at: at('transfer', 0.8), value: { x: startX + 30, y: 320 } },
          ],
        },
        {
          elementId: 'tank',
          property: 'parameter',
          keyframes: [
            { at: at('pour', 0), value: 0.1 },
            { at: at('activate', 0.8), value: 0.8 },
          ],
        },
        {
          elementId: 'node',
          property: 'state',
          keyframes: [
            { at: at('pour', 0), value: 'idle' },
            { at: at('activate', 0.5), value: 'active' },
            { at: at('transfer', 0.8), value: 'complete' },
          ],
        },
        {
          elementId: 'flow',
          property: 'parameter',
          keyframes: [
            { at: at('pour', 0), value: 0 },
            { at: at('activate', 1), value: 0 },
            { at: at('transfer', 0.8), value: 1 },
          ],
        },
        {
          elementId: 'outline',
          property: 'path',
          keyframes: [
            { at: at('pour', 0), value: 'M0 80 C25 80 75 80 100 80' },
            { at: at('transfer', 0.8), value: 'M0 80 C25 0 75 0 100 80' },
          ],
        },
      ],
    }),
  };
}

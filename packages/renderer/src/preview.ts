import { evaluateScene, componentSvg } from './motion.js';
import type { Production } from '@timotv/contracts';
import { playerMarkup } from './player.js';
import { previewAudioUrl } from './media.js';
import { compileArtwork, renderArtworkFrame } from './artwork.js';
import { programFilmHtml } from './program-preview.js';

/** The same deterministic SVG scene is used in preview and encoded video frames. */
export function filmHtml(p: Production, { controls = true } = {}) {
  validateFilmTiming(p);
  if (p.scenes.some((scene) => scene.artwork?.version === 3))
    return programFilmHtml(p, { controls });
  const data = JSON.stringify(p.scenes).replace(/</g, '\\u003c');
  const frames = JSON.stringify(
    p.scenes.map((s) => compileArtwork(s, p.aspectRatio, p.brief.style)),
  ).replace(/</g, '\\u003c');
  const portrait = p.aspectRatio === '9:16';
  const color =
    p.brief.style === 'warm'
      ? '#352e29'
      : p.brief.style === 'brand'
        ? '#f2efdf'
        : '#e0edf0';
  return `<!doctype html><html lang="${p.brief.language === 'en' ? 'en' : 'zh'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>视频预览</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#090c12;color:${color};font:28px system-ui}
#film-canvas{position:absolute;inset:0;margin:auto;width:min(100vw,calc(100vh * ${portrait ? 9 / 16 : 16 / 9}));height:min(100vh,calc(100vw / ${portrait ? 9 / 16 : 16 / 9}));container-type:size;overflow:hidden}
#title{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}#stage,#visual{position:absolute;inset:0}#visual>svg{display:block;width:100%;height:100%}
#caption{position:absolute;top:${portrait ? '84%' : '82%'};left:8%;width:84%;font-size:${portrait ? '3.8cqw' : '2.35cqw'};line-height:1.45;text-align:center;white-space:pre-wrap;text-wrap:balance}
</style></head><body><div id="film-canvas"><div id="stage"><h1 id="title"></h1><div id="visual"></div><div id="caption"></div></div></div>
<script>
const scenes=${data}, artworkFrames=${frames};
const evaluateScene=${evaluateScene.toString()};
const componentSvg=${componentSvg.toString()};
const drawArtwork=${renderArtworkFrame.toString()};
window.renderAt=function(t){
  const time=Math.max(0,Math.min(${p.durationMs ?? 0},Number.isFinite(t)?t:0));
  let index=scenes.findIndex(s=>time>=s.cues[0].startMs&&time<s.cues[s.cues.length-1].endMs);
  if(index<0)index=time<scenes[0].cues[0].startMs?0:scenes.length-1;
  const scene=scenes[index];
  document.getElementById('title').textContent=scene.title;
  document.getElementById('visual').innerHTML=drawArtwork(artworkFrames[index],time,evaluateScene,componentSvg);
  document.getElementById('caption').textContent=(scene.cues.find(q=>time>=q.startMs&&time<q.endMs)||{}).text||'';
};
window.renderAt(0);
</script>${controls ? playerMarkup(p.durationMs!, p.artifacts?.audio ? previewAudioUrl(p) : 'audio.wav') : ''}</body></html>`;
}

/** Validate measured cue boundaries before preview or export; no synthetic word timings. */
export function validateFilmTiming(p: Production) {
  if (
    !p.scenes.length ||
    !Number.isSafeInteger(p.durationMs) ||
    p.durationMs! <= 0
  )
    throw new Error('Missing measured narration');
  let end = 0;
  const ids = new Set<string>();
  for (const scene of p.scenes) {
    if (!scene.cues.length) throw new Error('Empty scene');
    for (const cue of scene.cues) {
      if (
        ids.has(cue.id) ||
        !Number.isSafeInteger(cue.startMs) ||
        !Number.isSafeInteger(cue.endMs) ||
        cue.startMs !== end ||
        cue.endMs! <= end ||
        cue.endMs! > p.durationMs!
      )
        throw new Error('Invalid measured cue timing');
      ids.add(cue.id);
      end = cue.endMs!;
    }
  }
  if (end !== p.durationMs)
    throw new Error('Narration duration does not match cues');
}

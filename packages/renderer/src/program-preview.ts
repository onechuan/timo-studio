import type { Production } from '@timotv/contracts';
import { compileArtwork, renderArtworkFrame } from './artwork.js';
import { evaluateScene, componentSvg } from './motion.js';
import { previewAudioUrl } from './media.js';
import { playerMarkup } from './player.js';
import {
  drawingEngineAssets,
  hashProgramSource,
  validateFilmKitSource,
  validateProgramSource,
} from './program.js';

const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
const inlineScript = (source: string) =>
  source.replace(/<\/script/gi, '<\\/script');

export function programFilmHtml(
  p: Production,
  { controls = true }: { controls?: boolean } = {},
): string {
  const programs = p.scenes.flatMap((scene) =>
    scene.artwork?.version === 3 ? [{ scene, artwork: scene.artwork }] : [],
  );
  if (!programs.length) throw new Error('Missing V3 drawing program');
  const style = programs[0]!.artwork.style;
  if (programs.some(({ artwork }) => artwork.style !== style))
    throw new Error('A film must use one drawing style');
  for (const { scene, artwork } of programs) {
    validateProgramSource(scene.id, artwork.source);
    if (hashProgramSource(artwork.source) !== artwork.sourceHash)
      throw new Error(`Drawing program hash mismatch: ${scene.id}`);
  }

  const extras = [
    ...new Set(programs.flatMap(({ artwork }) => artwork.extras)),
  ];
  const assets = drawingEngineAssets(style, extras);
  const portrait = p.aspectRatio === '9:16';
  const stage = portrait
    ? {
        w: 1080,
        h: 1920,
        portrait: true,
        area: { x0: 70, y0: 300, x1: 1010, y1: 1400 },
        subs: 1420,
        title: { x: 70, y: 170 },
      }
    : {
        w: 1920,
        h: 1080,
        portrait: false,
        area: { x0: 140, y0: 180, x1: 1780, y1: 880 },
        subs: 900,
        title: { x: 140, y: 78 },
      };
  const script = {
    META: {
      title: p.storyboard?.title ?? p.brief.topic ?? '视频预览',
      lang: p.brief.language,
      style,
      portrait,
      fadeOut: 0,
      timeline: {
        duration: p.durationMs! / 1000,
        pages: p.scenes.map((scene) => ({
          start: scene.cues[0]!.startMs! / 1000,
          end: scene.cues.at(-1)!.endMs! / 1000,
          cues: scene.cues.map((cue) => ({
            start: cue.startMs! / 1000,
            end: cue.endMs! / 1000,
          })),
        })),
      },
    },
    PAGES: p.scenes.map((scene) => ({
      id: scene.id,
      title: scene.title,
      section: scene.title,
      cues: scene.cues.map((cue) => cue.text),
    })),
  };
  const legacyFrames = p.scenes.map((scene) =>
    scene.artwork?.version === 3
      ? null
      : compileArtwork(scene, p.aspectRatio, p.brief.style),
  );
  const legacyPrograms = p.scenes
    .map((scene, index) => ({ scene, index }))
    .filter(({ scene }) => scene.artwork?.version !== 3)
    .map(
      ({ scene, index }) => `ENGINE.visual(${json(scene.id)}, P => {
  const host=document.createElement('div');
  host.className='legacy-artwork';
  host.setAttribute('data-legacy-scene',${json(scene.id)});
  P.html.appendChild(host);
  P.tick((lt,t)=>{host.innerHTML=drawLegacy(legacyFrames[${index}],t*1000,evaluateLegacy,componentLegacy)});
});`,
    )
    .join('\n');
  const programSources = programs
    .map(({ artwork }) => `<script>${inlineScript(artwork.source)}</script>`)
    .join('');
  const assetScripts = assets.scripts
    .map((source) => `<script>${source}</script>`)
    .join('');
  const filmKitScript = p.visual?.filmKit?.source
    ? `<script>${inlineScript(validateFilmKitSource(p.visual.filmKit))}</script>`
    : '';
  const controlsHtml = controls
    ? playerMarkup(
        p.durationMs!,
        p.artifacts?.audio ? previewAudioUrl(p) : 'audio.wav',
      )
    : '';

  return `<!doctype html><html lang="${p.brief.language === 'en' ? 'en' : 'zh'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; media-src 'self'; connect-src 'none'; font-src 'none'"><title>视频预览</title><style>${assets.css}
html,body{width:100%;height:100%;margin:0;background:#090c12}#film-canvas{position:fixed;inset:0;overflow:hidden}#viewport{position:absolute}.legacy-artwork{position:absolute;inset:0}.legacy-artwork>svg{display:block;width:100%;height:100%}
</style></head><body><div id="film-canvas"><svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg><div id="viewport"><div id="frame"${portrait ? ' class="portrait"' : ''}><div id="bg"></div><div id="stage"></div><div id="vignette"></div></div></div></div>
<script>const scenes=${json(p.scenes)};window.STAGE=${json(stage)};window.SCRIPT=${json(script)};</script>${assetScripts}${filmKitScript}
<script>window.TIMO=Object.freeze({visual:(id,draw)=>ENGINE.visual(id,draw)});
const legacyFrames=${json(legacyFrames)};
const evaluateLegacy=${inlineScript(evaluateScene.toString())};
const componentLegacy=${inlineScript(componentSvg.toString())};
const drawLegacy=${inlineScript(renderArtworkFrame.toString())};
${legacyPrograms}</script>${programSources}
<script>(()=>{
  const frame=document.getElementById('frame'), bg=document.getElementById('bg');
  bg.style.background=window.STYLE?.background?STYLE.background(STAGE):(STYLE?.palette?.paper||'#F4EEE2');
  const fit=()=>{const k=Math.min(innerWidth/STAGE.w,innerHeight/STAGE.h);Object.assign(frame.style,{position:'absolute',left:(innerWidth-STAGE.w)/2+'px',top:(innerHeight-STAGE.h)/2+'px',transform:'scale('+k+')'})};
  addEventListener('resize',fit);fit();
  ENGINE.init({subs:true});ENGINE.renderAt(0);
  window.renderAt=(ms)=>ENGINE.renderAt(Math.max(0,Math.min(${p.durationMs!},Number.isFinite(ms)?ms:0))/1000);
  window.__ready=(async()=>{await document.fonts.ready;ENGINE.init({subs:true});window.renderAt(0);frame.style.visibility='';return ENGINE.layout.duration})();
})()</script>${controlsHtml}</body></html>`;
}

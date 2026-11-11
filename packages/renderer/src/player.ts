/** Self-contained preview controls. No dependencies or controls enter exported frames. */
export function playerMarkup(durationMs: number, audioUrl = 'audio.wav') {
  const icon = (paths: string) =>
    `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    play: icon('<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>'),
    pause: icon('<path d="M8 5v14M16 5v14" stroke-width="3"/>'),
    replay: icon('<path d="M3 10a9 9 0 1 1 1 8M3 4v6h6"/>'),
    sound: icon(
      '<path d="m11 5-6 4H2v6h3l6 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    ),
    mute: icon('<path d="m11 5-6 4H2v6h3l6 4ZM17 9l5 6m0-6-5 6"/>'),
    full: icon('<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>'),
    exit: icon('<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5"/>'),
  };
  return `<style>
body{overflow:hidden;color-scheme:dark}
#stage{cursor:pointer;outline:none}
#stage #visual,#stage #caption{pointer-events:none}
#stage:focus-visible{outline:2px solid #c6ee76;outline-offset:-4px}
.player-ui{font:12px/1.4 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;color:#f4f6fa;box-sizing:border-box}
.player-ui svg{width:18px;height:18px;flex:none}
.player-top{position:fixed;top:0;left:0;right:0;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;pointer-events:none;background:linear-gradient(#0005,transparent);transition:opacity .2s}
.player-wordmark{display:flex;gap:7px;align-items:center;font-size:11px;letter-spacing:.04em;font-weight:650;text-shadow:0 1px 6px #0006}
.player-wordmark i{width:5px;height:5px;background:#c6ee76;border-radius:50%}
#player-scene{font-size:10px;font-variant-numeric:tabular-nums;opacity:.75}
#player-center{position:fixed;inset:0;display:grid;place-content:center;pointer-events:none}
#player-center button{pointer-events:auto;width:64px;height:64px;border:1px solid #ffffff40;border-radius:50%;background:#101318b8;backdrop-filter:blur(12px);color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 4px 30px #0003;transition:transform .2s,background .2s}
#player-center button:hover{transform:scale(1.06);background:#252d36e6}
#player-center svg{width:27px;height:27px}
#player-controls{position:fixed;inset:auto 0 0;padding:32px 18px 12px;background:linear-gradient(transparent,#090c12dd 55%,#090c12f0);z-index:2;height:auto;width:auto;transition:opacity .22s;display:flex;flex-direction:column;gap:6px}
.player-row{display:flex;align-items:center;gap:8px;min-width:0}
.player-row button{width:32px;height:32px;display:grid;place-items:center;background:transparent;border:0;padding:0;color:#f4f6fa;cursor:pointer;border-radius:7px;flex:none}
.player-row button:hover{background:#ffffff18}
.player-row button:focus-visible,#player-center button:focus-visible,#seek:focus-visible,#player-speed:focus-visible{outline:2px solid #c6ee76;outline-offset:3px}
#player-time{font-size:11px;font-variant-numeric:tabular-nums;letter-spacing:.02em;white-space:nowrap;color:#dce0e6}
#player-time span{color:#9199a6;margin:0 5px}
.player-spacer{flex:1}
#player-speed{appearance:none;background:transparent;color:#e5e8ef;border:0;border-radius:5px;padding:6px 4px;font:inherit;cursor:pointer;width:46px;text-align:center}
#player-speed option{background:#151a22;color:#f4f6fa}
#seek{display:block;appearance:none;-webkit-appearance:none;width:100%;height:16px;min-width:0;margin:0;padding:0;border:0;border-radius:0;cursor:pointer;background:transparent;--progress:0%;accent-color:#c6ee76}
#seek::-webkit-slider-runnable-track{height:3px;border-radius:3px;background:linear-gradient(to right,#c6ee76 var(--progress),#ffffff38 var(--progress))}
#seek::-moz-range-track{height:3px;border-radius:3px;background:#ffffff38}
#seek::-moz-range-progress{height:3px;background:#c6ee76}
#seek::-webkit-slider-thumb{appearance:none;width:10px;height:10px;border-radius:50%;background:#e1ffab;margin-top:-3.5px;box-shadow:0 0 0 3px #c6ee7618}
#seek::-moz-range-thumb{width:10px;height:10px;border:0;border-radius:50%;background:#e1ffab}
#player-error{position:fixed;left:20px;right:20px;top:55px;margin:0;padding:10px 13px;background:#171c24ee;border:1px solid #ffffff28;border-radius:8px;font-size:12px;z-index:4}
.player-hidden{display:none!important}
body.player-idle #player-controls,body.player-idle .player-top{opacity:0;pointer-events:none}
@media(max-width:420px){#player-controls{padding:28px 12px 9px}.player-top{padding:14px}.player-row{gap:5px}.player-row button{width:30px;height:32px}#player-time{font-size:10px}#player-center button{width:52px;height:52px}.player-wordmark{font-size:10px}}
@media(max-height:260px){#player-controls{padding:14px 10px 5px;gap:0}.player-row button{height:28px}.player-top{padding:8px 12px}#player-center button{width:40px;height:40px}#player-center svg{width:21px;height:21px}}
@media(prefers-reduced-motion:reduce){.player-top,#player-controls,#player-center button{transition:none}}
</style>
<div class="player-top player-ui"><span class="player-wordmark"><i></i>TimoTV <span style="font-weight:400;opacity:.65">/ 预览</span></span><span id="player-scene"></span></div>
<div id="player-center" class="player-ui"><button type="button" aria-label="开始播放" title="开始播放">${icons.play}</button></div>
<p id="player-error" class="player-ui player-hidden" role="alert"></p>
<footer id="player-controls" class="player-ui" aria-label="播放器控制">
  <input id="seek" type="range" min="0" max="${durationMs}" step="10" value="0" aria-label="播放进度">
  <div class="player-row">
    <button id="play" type="button" aria-label="播放" title="播放 / 暂停（空格）">${icons.play}</button>
    <output id="player-time" aria-label="播放时间"></output>
    <span class="player-spacer"></span>
    <button id="player-mute" type="button" aria-label="静音" title="静音（M）">${icons.sound}</button>
    <select id="player-speed" aria-label="播放速度" title="播放速度"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select>
    <button id="player-fullscreen" type="button" aria-label="全屏" title="全屏（F）">${icons.full}</button>
  </div>
</footer>
<audio id="audio" src="${audioUrl.replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[c]!)}" preload="metadata"></audio>
<script>
(() => {
  const icons=${JSON.stringify(icons)}, total=${durationMs};
  const $=id=>document.getElementById(id), audio=$('audio'), seek=$('seek'), play=$('play'), center=$('player-center'), mute=$('player-mute'), full=$('player-fullscreen'), bar=$('player-controls'), error=$('player-error');
  let frame=0, idle=0;
  const fmt=ms=>{const s=Math.floor(Math.max(0,ms)/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
  const ended=()=>audio.ended || audio.currentTime*1000>=total-20;
  const showError=text=>{error.textContent=text;error.classList.remove('player-hidden');wake()};
  // Keep press targets connected across animation frames (pointerdown -> pointerup).
  function setButton(button,state,markup,label){if(button.dataset.state!==state){button.innerHTML=markup;button.setAttribute('aria-label',label);button.dataset.state=state}}
  function wake(){document.body.classList.remove('player-idle');clearTimeout(idle);if(!audio.paused&&!audio.ended)idle=setTimeout(()=>{if(!bar.matches(':hover')&&!bar.contains(document.activeElement)&&!center.contains(document.activeElement)&&error.classList.contains('player-hidden'))document.body.classList.add('player-idle')},2200)}
  function update(){
    const t=Math.min(total,Math.max(0,audio.currentTime*1000));
    window.renderAt(t);seek.value=String(t);seek.style.setProperty('--progress',(t/total*100)+'%');seek.setAttribute('aria-valuetext',fmt(t)+' / '+fmt(total));
    $('player-time').innerHTML=fmt(t)+'<span>/</span>'+fmt(total);
    const state=audio.paused?(ended()?'replay':'play'):'pause';
    setButton(play,state,icons[state],audio.paused?'播放':'暂停');
    center.classList.toggle('player-hidden',!audio.paused);
    const central=center.querySelector('button');setButton(central,ended()?'replay':'play',ended()?icons.replay:icons.play,ended()?'重新播放':'开始播放');
    const s=scenes.findIndex(s=>t<s.cues[s.cues.length-1].endMs);$('player-scene').textContent=String((s<0?scenes.length-1:s)+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');
    setButton(mute,audio.muted?'mute':'sound',audio.muted?icons.mute:icons.sound,audio.muted?'取消静音':'静音');
  }
  function tick(){update();if(!audio.paused&&!audio.ended)frame=requestAnimationFrame(tick)}
  async function toggle(){
    if(!audio.paused){audio.pause();return}
    error.classList.add('player-hidden');if(ended())audio.currentTime=0;
    try{await audio.play()}catch(e){if(e.name!=='AbortError')showError(e.name==='NotAllowedError'?'请点击播放按钮，允许浏览器播放声音。':'音频暂时无法播放，请检查连接后重试。')}
  }
  function jump(ms){audio.currentTime=Math.max(0,Math.min(total,ms))/1000;update();wake()}
  window.addEventListener('message',e=>{if(e.source===window.parent&&e.data?.type==='timotv:seek'&&Number.isFinite(e.data.timeMs)){audio.pause();jump(e.data.timeMs)}});
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else showError('当前浏览器不支持全屏。')}catch{showError('无法进入全屏，请在支持全屏的浏览器中打开。')}}
  play.onclick=toggle;center.querySelector('button').onclick=()=>{ $('stage').focus({preventScroll:true});void toggle()};
  $('stage').tabIndex=0;$('stage').setAttribute('aria-label','视频画面，空格播放或暂停');$('stage').onclick=toggle;
  seek.oninput=()=>jump(Number(seek.value));
  mute.onclick=()=>{audio.muted=!audio.muted;update();wake()};
  $('player-speed').onchange=e=>{audio.playbackRate=Number(e.target.value);wake()};full.onclick=fullscreen;
  audio.addEventListener('play',()=>{cancelAnimationFrame(frame);tick();wake()});
  audio.addEventListener('pause',()=>{cancelAnimationFrame(frame);update();wake()});
  audio.addEventListener('ended',()=>{cancelAnimationFrame(frame);update();wake()});
  ['timeupdate','seeked','loadedmetadata','volumechange'].forEach(name=>audio.addEventListener(name,update));
  audio.addEventListener('error',()=>showError('音频加载失败，请刷新预览或检查网络连接。'));
  document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;full.innerHTML=active?icons.exit:icons.full;full.setAttribute('aria-label',active?'退出全屏':'全屏');wake()});
  document.addEventListener('pointermove',wake);document.addEventListener('pointerdown',wake);document.addEventListener('focusin',wake);
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,select,textarea,button,[contenteditable=true]'))return;
    const key=e.key.toLowerCase();
    if(key===' '||key==='k'){e.preventDefault();void toggle()}
    else if(key==='arrowleft'||key==='arrowright'){e.preventDefault();jump(audio.currentTime*1000+(key==='arrowleft'?-5000:5000))}
    else if(key==='m'){e.preventDefault();audio.muted=!audio.muted;update()}
    else if(key==='f'){e.preventDefault();void fullscreen()}
    wake();
  });
  window.addEventListener('pagehide',()=>{audio.pause();cancelAnimationFrame(frame);clearTimeout(idle)});
  update();
})();
</script>`;
}

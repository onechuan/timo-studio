/* three.js scenes inside a page (needs META.vendor: ['three'] and META.webgl: true). One WebGL renderer is shared by every
 * P.three() on every page (browsers cap live WebGL contexts at ~16); each scene renders through it and is copied into its own
 * 2D canvas, so the page stays ordinary DOM. Everything is posed from lt: no animation loop, no clocks. */
(function () {
  const { h, Builder } = PV;
  let R = null;   // shared WebGLRenderer
  const renderer = () => {
    if (!R) {
      R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      R.setPixelRatio(1);
      R.setClearColor(0x000000, 0);
    }
    return R;
  };

  /**
   * P.three(x, y, w, h, setup, draw, o) → { canvas, S }
   * setup(T, S) once: T = THREE; S = { scene, camera, w, h } — add meshes to S.scene, keep refs on S.
   * draw(lt, S) every frame: pose the scene / camera for page time lt (pure function of lt).
   * o: { fov = 40, at = 0, dur = 0.6 (fade in) }
   */
  Builder.prototype.three = function (x, y, w, hh, setup, draw, o = {}) {
    if (!window.THREE) throw new Error('P.three needs META.vendor: [\'three\']');
    const c = h('canvas', null, null, this.html);
    c.width = w; c.height = hh;
    Object.assign(c.style, { position: 'absolute', left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' });
    const ctx = c.getContext('2d');
    const S = { scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera(o.fov ?? 40, w / hh, 0.1, 1000), w, h: hh };
    S.camera.position.set(0, 0, 10);
    setup(THREE, S);
    this.tick((lt) => {
      draw(lt, S);
      const r = renderer();
      r.setSize(w, hh, false);
      r.render(S.scene, S.camera);
      ctx.clearRect(0, 0, w, hh);
      ctx.drawImage(r.domElement, 0, 0);
    });
    this.show(c, { at: o.at ?? 0, dur: o.dur ?? 0.6 });
    return { canvas: c, S };
  };
})();

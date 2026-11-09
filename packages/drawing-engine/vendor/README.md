# engine/vendor

ESM-only libraries are bundled with esbuild into **IIFEs that set a global**, and projects reference them by name in `META.vendor` (`vendor: ['three']` → `vendor/three.js`, global `THREE`).

Not ES modules with an import map: pages are opened over file://, and Chromium blocks every module script there through CORS (origin null), so neither the preview nor the render could load them (tested 2026-10-08).

To rebuild (when upgrading, or edit the entry to add addons):

```bash
cd packages/engine && npx esbuild vendor/three.entry.mjs --bundle --format=iife --global-name=THREE --minify --outfile=vendor/three.js
```

# TimoTV third-party notices

## Frametell drawing engine

TimoTV's programmable drawing engine is derived from Frametell by Sitor Team,
<https://github.com/sitor-ai/frametell>, licensed under AGPL-3.0-only.

The original copyright and license terms are preserved in the copied engine
package and the repository `LICENSE` file. The upstream third-party notices
follow in full.

# Frametell third-party notices

Frametell is licensed under the [AGPL-3.0](LICENSE). It is built on, and the desktop app ships, the open-source
software below. Each keeps its own licence and copyright; the full texts are in each package (in the app, under
`Resources/app/node_modules/<package>/`), and the licence comments of code bundled into the app's main process are kept
in `Resources/app/dist/main.js.LEGAL.txt`.

## FFmpeg

The desktop app runs FFmpeg as a separate program in `Resources/bin`. It is not part of Frametell. It is a static
build with no nonfree parts, licensed under the **GNU General Public License v3**. Its licence, version, build
configuration and where to get its source are in `Resources/bin/FFMPEG-NOTICE.txt` and `Resources/bin/COPYING.GPLv3`.

- FFmpeg: <https://ffmpeg.org> (source: <https://ffmpeg.org/releases/>)
- macOS builds: <https://ffmpeg.martin-riedl.de> (build script: <https://git.martin-riedl.de/ffmpeg/build-script>)
- When run from source, Frametell uses the binary from [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static)
  (GPL-3.0-or-later), which the desktop app does not ship.

## Application runtime

| Component | Licence | Source |
| --- | --- | --- |
| Electron (with Chromium and Node.js) | MIT; Chromium's own notices ship in the app as `LICENSES.chromium.html` | <https://github.com/electron/electron> |
| Playwright (playwright-core) | Apache-2.0 | <https://github.com/microsoft/playwright> |
| Hono, @hono/node-server | MIT | <https://github.com/honojs/hono> |
| undici | MIT | <https://github.com/nodejs/undici> |

## Agent and models

| Component | Licence | Source |
| --- | --- | --- |
| pi-ai, pi-agent-core, pi-telemetry | MIT | <https://github.com/earendil-works/pi> |
| Anthropic TypeScript SDK (@anthropic-ai/sdk) | MIT | <https://github.com/anthropics/anthropic-sdk-typescript> |
| OpenAI Node SDK (openai) | Apache-2.0 | <https://github.com/openai/openai-node> |
| Google Gen AI SDK (@google/genai) | Apache-2.0 | <https://github.com/googleapis/js-genai> |
| AWS SDK for JavaScript (Bedrock runtime, Smithy) | Apache-2.0 | <https://github.com/aws/aws-sdk-js-v3> |
| TypeBox | MIT | <https://github.com/sinclairzx81/typebox> |
| partial-json | MIT | <https://github.com/promplate/partial-json-parser-js> |
| http-proxy-agent, https-proxy-agent | MIT | <https://github.com/TooTallNate/proxy-agents> |

The Claude Agent SDK and the Codex SDK are optional runtimes that Frametell does not ship or load by default. If you
install them yourself, their own terms apply.

## Reading your material

| Component | Licence | Source |
| --- | --- | --- |
| unpdf (derived from Mozilla PDF.js) | MIT; PDF.js is Apache-2.0 | <https://github.com/unjs/unpdf> |
| mammoth | BSD-2-Clause | <https://github.com/mwilliamson/mammoth.js> |
| JSZip | MIT (dual-licensed MIT or GPL-3.0-or-later; used under MIT) | <https://github.com/Stuk/jszip> |

## Video engine

| Component | Licence | Source |
| --- | --- | --- |
| three.js (bundled in `packages/engine/vendor/three.js`) | MIT | <https://github.com/mrdoob/three.js> |
| Rough.js | MIT | <https://github.com/pshihn/rough> |
| KaTeX | MIT | <https://github.com/KaTeX/KaTeX> |
| Iconify "logos" set | CC0-1.0 | <https://github.com/iconify/icon-sets> |
| Simple Icons | CC0-1.0 | <https://github.com/simple-icons/simple-icons> |

Brand logos from Iconify and Simple Icons, and the provider marks in the studio (from
[Lobe Icons](https://github.com/lobehub/lobe-icons), MIT; see `packages/ui/src/assets/providers/NOTICE.md`), belong to
their owners and are used only to name the product or provider they stand for.

## Studio interface

| Component | Licence | Source |
| --- | --- | --- |
| React, React DOM | MIT | <https://github.com/facebook/react> |
| Lucide icons (lucide-react) | ISC | <https://github.com/lucide-icons/lucide> |
| clsx | MIT | <https://github.com/lukeed/clsx> |
| Tailwind CSS (generated styles) | MIT | <https://github.com/tailwindlabs/tailwindcss> |

## Fonts

All fonts are under the SIL Open Font License 1.1, distributed through [Fontsource](https://fontsource.org) or the
package named.

| Font | Used in | Source |
| --- | --- | --- |
| LXGW WenKai (霞鹜文楷), via lxgw-wenkai-webfont (MIT) | films | <https://github.com/lxgw/LxgwWenKai> |
| Caveat | films | <https://github.com/googlefonts/caveat> |
| Fredoka | films | <https://github.com/hafontia-zz/Fredoka> |
| JetBrains Mono | films, studio | <https://github.com/JetBrains/JetBrainsMono> |
| Inter | studio | <https://github.com/rsms/inter> |
| Playfair Display | studio | <https://github.com/clauseggers/Playfair> |

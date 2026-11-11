/** Original, scalable editorial drawings. All coordinates are in a 400 × 300 studio. */
export interface Palette {
  ink: string;
  muted: string;
  accent: string;
  secondary: string;
  paper: string;
  panel: string;
  warning: string;
  none: string;
}
export const palettes: Record<string, Palette> = {
  brand: {
    paper: '#111514',
    ink: '#f2efdf',
    muted: '#929e96',
    accent: '#c8ee8a',
    secondary: '#789b84',
    panel: '#1c2420',
    warning: '#d9ad83',
    none: 'none',
  },
  warm: {
    paper: '#f6efdf',
    ink: '#352e29',
    muted: '#817767',
    accent: '#c56643',
    secondary: '#69856c',
    panel: '#e9dec7',
    warning: '#d9ad51',
    none: 'none',
  },
  chalk: {
    paper: '#203c35',
    ink: '#f4efda',
    muted: '#b6c8b4',
    accent: '#ecc36d',
    secondary: '#91b7a1',
    panel: '#335047',
    warning: '#e99c7d',
    none: 'none',
  },
  tech: {
    paper: '#101f2b',
    ink: '#e0edf0',
    muted: '#91acb6',
    accent: '#6cc7c6',
    secondary: '#91a9d0',
    panel: '#223746',
    warning: '#e8b978',
    none: 'none',
  },
};
export function illustration(name: string, c: Palette): string {
  const p = (d: string, fill = c.accent, stroke = 'none', sw = 3) =>
    `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const el = (cx: number, cy: number, rx: number, ry: number, fill = c.panel) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
  const r = (
    x: number,
    y: number,
    w: number,
    h: number,
    fill = c.panel,
    rad = 12,
  ) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${fill}"/>`;
  const line = (d: string, col = c.ink, sw = 4) => p(d, 'none', col, sw);
  const ground = el(205, 273, 157, 12);
  let art = '';
  switch (name) {
    case 'bowl':
      art =
        ground +
        p('M48 141 Q64 246 160 258 L246 258 Q333 235 354 141Z', c.accent) +
        p(
          'M68 169 Q101 238 170 244 L241 244 Q294 230 322 183 Q260 219 195 211 Q115 208 68 169',
          c.paper,
        ) +
        el(201, 140, 153, 49, c.ink) +
        el(201, 136, 143, 41, c.warning) +
        p(
          'M71 139 Q108 98 181 111 Q240 91 326 128 L319 147 Q202 173 78 151Z',
          c.warning,
        );
      for (let i = 0; i < 8; i++)
        art += line(
          `M${93 + i * 14} 130 C${70 + i * 17} 110 ${140 + i * 13} 107 ${157 + i * 15} 129 S${156 + i * 15} 157 ${137 + i * 15} 147`,
          c.paper,
          5,
        );
      art +=
        p('M235 109 Q251 91 277 110 L292 132 Q277 153 247 138Z', c.accent) +
        line('M248 112 L277 131 M246 125 L265 138', c.paper, 2) +
        p(
          'M107 117 Q88 91 116 92 Q134 95 139 112 Q153 89 168 104 Q166 125 138 132Z',
          c.secondary,
        ) +
        p('M276 147 Q288 122 309 133 Q325 146 301 158Z', c.secondary) +
        line(
          'M159 80 C137 63 172 55 155 33 M204 77 C180 55 221 46 200 20 M246 79 C224 63 255 54 241 35',
          c.muted,
          5,
        ) +
        line('M279 111 L366 36 M289 119 L381 51', c.ink, 6) +
        line('M123 262 L279 262', c.ink, 5);
      break;
    case 'robot':
      art =
        ground +
        r(115, 138, 172, 116, c.accent, 25) +
        r(99, 55, 204, 112, c.paper, 28) +
        p(
          'M99 86 Q99 55 128 55 L274 55 Q303 55 303 86 V140 Q290 160 276 163 V87Z',
          c.panel,
        ) +
        r(122, 79, 158, 62, c.ink, 19) +
        r(145, 98, 19, 20, c.secondary, 8) +
        r(237, 98, 19, 20, c.secondary, 8) +
        line('M184 127 H215', c.paper, 3) +
        line('M201 55 V29', c.ink, 6) +
        el(201, 23, 10, 10, c.warning) +
        r(146, 181, 108, 48, c.paper, 8) +
        line('M161 198 H221 M161 213 H199', c.muted, 4) +
        p('M113 176 Q61 172 65 230 L88 233 Q83 200 116 203Z', c.secondary) +
        p('M287 174 Q328 168 342 132 L324 120 Q313 152 282 151Z', c.secondary) +
        r(138, 249, 40, 24, c.ink, 8) +
        r(228, 249, 40, 24, c.ink, 8);
      break;
    case 'brain':
      art =
        ground +
        p(
          'M197 241 C161 262 131 241 125 219 C83 226 66 190 82 163 C49 128 79 90 107 90 C108 51 144 38 171 55 C186 26 213 33 222 53 C254 28 287 55 287 80 C332 76 351 116 328 144 C356 176 326 217 299 212 C291 247 251 262 224 239 L215 270 H188Z',
          c.accent,
        ) +
        line(
          'M202 63 Q190 109 204 143 Q216 188 202 233 M111 95 Q145 83 155 116 Q173 123 173 146 M83 160 Q119 143 138 166 Q141 191 167 196 M284 85 Q248 82 247 111 Q220 117 231 144 M327 146 Q285 130 271 158 Q250 173 258 199 M127 219 Q115 192 139 186 M297 212 Q309 185 290 177',
          c.paper,
          6,
        );
      break;
    case 'document':
      art =
        ground +
        p('M96 31 H247 L307 92 V261 H96Z', c.paper) +
        p('M247 31 V92 H307Z', c.panel) +
        r(121, 65, 77, 13, c.accent, 3) +
        line('M122 119 H272 M122 139 H252 M122 159 H271', c.muted, 5) +
        r(121, 187, 68, 46, c.secondary, 5) +
        line('M209 195 H271 M209 214 H252', c.muted, 5) +
        p('M271 217 L318 167 L335 185 L288 235 L268 239Z', c.warning) +
        p('M268 239 L273 221 L288 235Z', c.ink);
      break;
    case 'terminal':
      art =
        ground +
        r(45, 40, 310, 211, c.ink, 16) +
        r(56, 52, 288, 28, c.panel, 6) +
        el(71, 66, 5, 5, c.accent) +
        el(88, 66, 5, 5, c.warning) +
        el(105, 66, 5, 5, c.secondary) +
        line('M81 113 L99 127 L81 140 M113 144 H150', c.accent, 6) +
        line('M81 173 H233 M81 193 H292 M81 213 H207', c.muted, 5) +
        p('M20 252 H380 L353 270 H48Z', c.muted);
      break;
    case 'toolbox':
      art =
        ground +
        p(
          'M153 81 V48 Q153 32 170 32 H233 Q250 32 250 48 V81 H229 V54 H174 V81Z',
          c.ink,
        ) +
        r(57, 92, 289, 159, c.accent, 16) +
        r(57, 92, 289, 60, c.warning, 12) +
        line('M57 153 H346', c.ink, 4) +
        r(179, 130, 43, 44, c.paper, 5) +
        r(192, 140, 17, 23, c.ink, 3) +
        p('M87 89 L73 36 L84 18 L102 24 L105 47 L120 83Z', c.secondary) +
        p('M277 89 L291 38 L286 15 L313 24 L323 46 L304 90Z', c.muted);
      break;
    case 'tree':
      art =
        ground +
        p(
          'M178 269 Q196 203 177 139 L202 115 L224 141 Q207 212 231 269Z',
          c.accent,
        ) +
        p(
          'M201 204 L145 157 L153 148 L208 182 M207 170 L255 131 L264 141 L212 196',
          c.accent,
        ) +
        p(
          'M107 164 C53 155 60 99 105 92 C93 49 140 23 172 50 C199 8 252 22 257 62 C304 49 341 98 309 127 C334 168 284 191 249 169 C213 198 182 176 171 164 C143 191 118 184 107 164Z',
          c.secondary,
        ) +
        el(139, 95, 15, 16, c.warning) +
        el(265, 119, 14, 15, c.warning) +
        el(208, 63, 13, 14, c.warning);
      break;
    case 'cup':
      art =
        ground +
        p(
          'M275 105 H300 Q361 106 345 161 Q337 190 283 194 V169 Q319 168 320 142 Q319 128 283 129Z',
          c.accent,
        ) +
        p('M86 103 H286 L269 231 Q191 271 103 232Z', c.paper) +
        el(186, 103, 100, 29, c.accent) +
        el(186, 103, 84, 20, c.ink) +
        line(
          'M138 72 C119 52 159 41 143 20 M191 71 C171 49 208 38 196 15 M236 74 C220 54 252 47 244 30',
          c.muted,
          5,
        ) +
        el(184, 252, 130, 13, c.secondary);
      break;
    case 'database':
      art =
        ground +
        r(88, 66, 224, 169, c.secondary, 0) +
        el(200, 235, 112, 34, c.secondary) +
        el(200, 66, 112, 34, c.paper) +
        line(
          'M88 119 C99 161 301 161 312 119 M88 177 C99 219 301 219 312 177',
          c.paper,
          5,
        ) +
        el(269, 114, 6, 6, c.warning) +
        el(269, 174, 6, 6, c.warning) +
        el(269, 234, 6, 6, c.warning);
      break;
    case 'magnifier':
      art =
        ground +
        line('M246 190 L324 270', c.accent, 32) +
        el(174, 125, 99, 99, c.ink) +
        el(174, 125, 82, 82, c.paper) +
        p(
          'M121 133 L155 162 L223 88 L236 101 L155 187 L108 145Z',
          c.secondary,
        ) +
        line('M115 91 Q134 59 169 59', c.panel, 9);
      break;
    case 'globe':
      art =
        ground +
        el(200, 139, 108, 108, c.secondary) +
        p(
          'M147 45 L155 80 L130 109 L148 139 L174 148 L183 191 L204 215 L228 174 L216 144 L184 125 L188 96 L222 70 L209 33 M278 72 L255 100 L277 125 L307 118 M284 197 L249 208 L241 236 L261 226',
          c.paper,
        ) +
        line(
          'M288 31 Q351 104 308 194 Q276 265 177 257 M201 257 V278 M157 281 H246',
          c.ink,
          7,
        );
      break;
    case 'calendar':
      art =
        ground +
        r(77, 55, 247, 207, c.paper, 12) +
        r(77, 55, 247, 55, c.accent, 10) +
        line('M130 35 V76 M271 35 V76', c.ink, 10);
      for (let j = 0; j < 3; j++)
        for (let i = 0; i < 5; i++)
          art += r(
            101 + i * 43,
            132 + j * 36,
            22,
            19,
            i === 2 && j === 1 ? c.accent : c.panel,
            4,
          );
      break;
    case 'books':
      art =
        ground +
        r(68, 212, 271, 44, c.accent, 7) +
        r(88, 159, 233, 48, c.secondary, 5) +
        r(62, 104, 267, 49, c.warning, 6) +
        p(
          'M84 112 H329 V144 H84 Q69 128 84 112 M108 167 H321 V198 H108 Q92 181 108 167 M91 220 H339 V247 H91 Q77 235 91 220',
          c.paper,
        ) +
        line('M114 124 H302 M130 179 H295 M113 231 H310', c.panel, 3);
      break;
    case 'person':
      art =
        ground +
        el(200, 70, 40, 45, c.warning) +
        p(
          'M160 58 Q155 10 200 17 Q253 18 242 73 L228 48 Q193 57 170 39Z',
          c.ink,
        ) +
        p(
          'M128 265 L136 155 Q151 112 194 115 Q249 108 271 159 L286 265Z',
          c.secondary,
        ) +
        p(
          'M150 169 L110 213 L67 177 L53 193 Q106 263 133 243 L170 208 M251 171 L280 208 L327 168 L344 183 Q289 256 269 237 L232 207',
          c.warning,
        ) +
        p('M156 231 H251 L271 265 H133Z', c.ink);
      break;
    case 'lightbulb':
      art =
        ground +
        p(
          'M165 215 C165 180 113 159 116 105 C119 7 282 7 284 107 C287 160 238 183 236 215Z',
          c.warning,
        ) +
        line('M176 207 L165 119 L199 142 L233 119 L222 207', c.paper, 7) +
        r(163, 211, 76, 33, c.muted, 8) +
        r(178, 246, 47, 16, c.ink, 8) +
        line(
          'M79 100 H54 M99 41 L79 22 M299 42 L319 22 M320 101 H346',
          c.accent,
          7,
        );
      break;
    case 'cow':
      // Side-on anatomy: the legs overlap the torso before the silhouette is closed.
      art =
        ground +
        line('M91 117 Q57 110 59 151 L52 199', c.ink, 5) +
        p('M52 185 Q37 202 47 219 Q62 214 59 198Z', c.ink) +
        p(
          'M121 177 L118 247 H141 L151 178 M232 179 L239 247 H263 L265 170',
          c.muted,
          c.ink,
          3,
        ) +
        p(
          'M88 136 Q84 100 123 97 L238 97 Q271 95 287 132 L275 184 Q254 211 203 208 L131 201 Q88 191 88 136Z',
          c.paper,
          c.ink,
          4,
        ) +
        p(
          'M108 183 L101 254 H128 L144 196 M244 184 L251 254 H279 L271 166',
          c.paper,
          c.ink,
          4,
        ) +
        p(
          'M100 246 H128 V259 H98Z M250 246 H279 V259 H249Z M118 240 H141 V250 H116Z M239 240 H263 V250 H238Z',
          c.ink,
        ) +
        p(
          'M126 101 Q145 99 159 105 L170 134 Q164 155 145 159 L119 141Z M206 100 L237 101 Q254 114 246 141 Q226 153 207 135Z M163 171 Q181 159 199 176 L206 205 H171Z',
          c.accent,
        ) +
        p(
          'M270 109 L280 83 Q268 73 272 53 Q288 59 291 77 L309 77 Q319 58 331 57 Q334 75 321 87 L328 116Z',
          c.warning,
          c.ink,
          3,
        ) +
        p(
          'M279 99 Q253 79 244 97 Q249 113 277 116 M319 98 Q342 78 355 96 Q350 114 325 118',
          c.accent,
          c.ink,
          3,
        ) +
        p(
          'M278 88 Q300 76 321 89 L331 142 Q332 166 303 172 Q274 169 271 148Z',
          c.paper,
          c.ink,
          4,
        ) +
        p('M281 88 Q298 80 308 86 L303 118 L280 126Z', c.accent) +
        el(301, 150, 32, 20, c.warning) +
        el(288, 150, 4, 5, c.ink) +
        el(313, 150, 4, 5, c.ink) +
        el(282, 119, 3, 4, c.ink) +
        el(319, 119, 3, 4, c.ink) +
        line('M291 160 Q300 164 310 160', c.ink, 2.5);
      break;
    case 'cook':
      art =
        ground +
        p('M158 218 L150 267 H183 L200 222 L216 268 H248 L236 214Z', c.ink) +
        p(
          'M136 139 Q144 115 173 111 L221 112 Q249 119 256 150 L270 184 L251 197 L224 159 L235 237 H144 L157 164 L124 194 L104 177Z',
          c.secondary,
        ) +
        p(
          'M171 112 L178 145 H215 L222 112 L234 117 L226 158 L239 237 H141 L155 158 L160 116Z',
          c.paper,
          c.ink,
          3,
        ) +
        line('M161 166 H220 M175 182 H210 V211 H175Z', c.accent, 3) +
        p(
          'M156 72 Q151 32 192 31 Q233 31 230 76 L222 103 Q192 125 164 99Z',
          c.warning,
          c.ink,
          3,
        ) +
        p(
          'M158 61 V46 Q133 31 150 15 Q164 3 177 18 Q195 0 210 16 Q228 5 239 21 Q248 39 227 47 V61Z',
          c.paper,
          c.ink,
          3,
        ) +
        line('M161 48 H226', c.muted, 3) +
        el(178, 77, 3, 3, c.ink) +
        el(210, 77, 3, 3, c.ink) +
        line('M189 94 Q199 100 207 92', c.ink, 2.5) +
        p(
          'M108 171 Q94 161 87 176 Q82 190 96 197 L121 205 L141 192 L131 179 L118 187Z',
          c.warning,
          c.ink,
          3,
        ) +
        p(
          'M250 180 L276 163 L279 135 Q283 122 295 128 L298 163 Q296 179 265 200Z',
          c.warning,
          c.ink,
          3,
        ) +
        line('M287 117 L320 219', c.ink, 6) +
        p(
          'M300 219 H341 Q339 244 320 244 Q303 241 300 219Z',
          c.accent,
          c.ink,
          3,
        ) +
        line('M150 270 H185 M214 270 H251', c.ink, 9);
      break;
    case 'worker':
      art =
        ground +
        p(
          'M156 205 L151 260 H185 L197 218 L212 260 H247 L237 204Z',
          c.secondary,
          c.ink,
          3,
        ) +
        p(
          'M149 252 H185 V274 H137 Q133 263 149 252 M214 252 H247 L262 265 V274 H213Z',
          c.ink,
        ) +
        p(
          'M155 115 Q128 119 122 147 L108 198 L132 206 L151 165 L154 217 H239 L240 162 L260 194 L283 182 L259 134 Q246 115 222 115Z',
          c.accent,
          c.ink,
          3,
        ) +
        p(
          'M159 118 H174 V157 H220 V118 H234 V213 H158Z',
          c.secondary,
          c.ink,
          3,
        ) +
        r(175, 166, 43, 28, c.panel, 3) +
        line('M195 207 V231', c.ink, 3) +
        p('M173 103 V123 Q194 140 216 122 V101Z', c.warning) +
        p(
          'M155 62 Q157 29 196 29 Q235 29 238 64 L230 98 Q220 117 197 119 Q171 115 164 97Z',
          c.warning,
          c.ink,
          3,
        ) +
        p('M151 65 Q151 20 196 18 Q240 18 242 65Z', c.accent, c.ink, 3) +
        line('M196 23 V49 M145 65 H248', c.ink, 6) +
        el(196, 53, 16, 16, c.paper) +
        el(196, 53, 9, 9, c.warning) +
        el(179, 81, 3, 3, c.ink) +
        el(217, 81, 3, 3, c.ink) +
        line('M186 101 H207', c.ink, 3) +
        p(
          'M109 193 L100 215 Q100 229 112 229 Q122 229 128 210 L132 202 M264 184 L277 202 Q287 209 294 199 Q298 190 283 178Z',
          c.warning,
          c.ink,
          3,
        ) +
        line('M293 142 L317 254', c.ink, 7) +
        p(
          'M267 148 Q294 122 328 137 L347 158 L317 145 L290 151Z',
          c.muted,
          c.ink,
          3,
        );
      break;
    case 'cauldron':
      art =
        ground +
        p(
          'M120 212 L109 267 H129 L148 222 M190 228 L189 273 H211 L213 228 M252 220 L273 267 H292 L278 210Z',
          c.ink,
        ) +
        line(
          'M88 118 C43 101 38 159 86 158 M315 118 C359 101 366 159 320 158',
          c.ink,
          12,
        ) +
        p('M77 117 H324 L311 199 Q291 247 200 250 Q111 247 90 199Z', c.ink) +
        p(
          'M94 144 Q103 197 128 215 Q181 244 257 226 Q297 211 306 169 Q281 208 209 211 Q128 209 94 144Z',
          c.muted,
        ) +
        el(200, 116, 126, 39, c.muted) +
        el(200, 113, 113, 29, c.warning) +
        p(
          'M121 114 L142 103 L159 117 L140 128Z M222 102 L243 95 L259 108 L239 120Z',
          c.accent,
        ) +
        p(
          'M176 128 Q156 105 175 98 Q190 98 191 119 Q200 101 215 116 Q212 132 191 137Z',
          c.secondary,
        ) +
        el(265, 119, 7, 4, c.paper) +
        el(113, 111, 5, 3, c.paper) +
        line(
          'M139 74 C117 54 157 47 141 27 M200 70 C179 49 219 40 201 16 M257 76 C238 58 270 48 258 31',
          c.muted,
          5,
        ) +
        line('M87 135 Q200 183 315 135', c.ink, 6);
      break;
    case 'tofu':
      art =
        ground +
        p('M51 120 L283 78 L359 212 L116 267 L47 151Z', c.accent, c.ink, 3) +
        p('M51 120 L283 78 L359 201 L116 253Z', c.warning, c.ink, 3) +
        line('M72 157 L95 194 M286 204 L314 197', c.accent, 3) +
        p('M108 119 L172 102 L215 130 L150 149Z', c.paper, c.ink, 3) +
        p('M108 119 L150 149 V204 L108 174Z', c.panel, c.ink, 3) +
        p('M150 149 L215 130 V184 L150 204Z', c.paper, c.ink, 3) +
        line(
          'M129 134 V189 M181 140 V194 M108 147 L150 176 L215 157',
          c.muted,
          2.5,
        ) +
        p('M223 169 L279 153 L312 179 L255 199Z', c.paper, c.ink, 3) +
        p('M223 169 V189 L255 214 L312 194 V179 L255 199Z', c.panel, c.ink, 3) +
        line('M225 179 L255 207 L310 188', c.muted, 2) +
        p('M201 83 L237 54 L297 114 Q284 136 263 134Z', c.muted, c.ink, 3) +
        p(
          'M202 84 L237 55 L221 37 Q213 29 206 37 L185 54 Q180 61 187 69Z',
          c.ink,
        ) +
        el(206, 56, 3, 3, c.paper) +
        p(
          'M85 219 Q69 195 87 188 Q104 187 104 210 Q112 191 126 204 Q123 220 106 227Z',
          c.secondary,
        );
      break;
    case 'factory':
      art =
        ground +
        p(
          'M91 161 L97 48 H132 L140 161 M264 157 L268 77 H295 L300 157Z',
          c.accent,
          c.ink,
          3,
        ) +
        r(93, 43, 43, 13, c.ink, 2) +
        r(264, 71, 36, 12, c.ink, 2) +
        line('M99 78 H133 M96 114 H136 M268 105 H296', c.panel, 4) +
        p(
          'M112 28 C92 18 115 4 133 17 Q153 1 177 11 Q192 21 178 29Z M285 56 Q262 44 281 34 Q298 27 312 40 Q333 29 348 44 Q358 57 341 61Z',
          c.panel,
        ) +
        p(
          'M52 260 V163 L121 123 V162 L190 123 V162 L255 126 V165 H348 V260Z',
          c.secondary,
          c.ink,
          4,
        ) +
        line('M52 172 H348', c.ink, 4) +
        r(75, 187, 31, 29, c.paper, 1) +
        r(126, 187, 31, 29, c.paper, 1) +
        r(177, 187, 31, 29, c.paper, 1) +
        r(286, 187, 36, 29, c.paper, 1) +
        line(
          'M90 187 V216 M141 187 V216 M192 187 V216 M304 187 V216',
          c.muted,
          3,
        ) +
        r(224, 190, 45, 70, c.ink, 2) +
        r(234, 201, 25, 59, c.panel, 1) +
        p('M28 269 V230 H45 V269 M355 269 V230 H372 V269', c.accent, c.ink, 3) +
        line(
          'M45 238 H171 M45 258 H171 M71 239 V269 M97 239 V269 M122 239 V269 M148 239 V269 M304 239 H355 M304 258 H355 M329 239 V269',
          c.ink,
          3,
        ) +
        line('M29 273 H372', c.ink, 4);
      break;
    case 'target':
      art = ground;
      for (const [rad, col] of [
        [115, c.accent],
        [88, c.paper],
        [60, c.accent],
        [31, c.paper],
      ] as const)
        art += el(189, 143, rad, rad, col);
      art +=
        line('M190 143 L313 35', c.ink, 7) +
        p('M277 68 L285 27 L311 34 L339 51 L297 85Z', c.secondary);
      break;
    default:
      art = ground;
  }
  return `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${art}</svg>`;
}

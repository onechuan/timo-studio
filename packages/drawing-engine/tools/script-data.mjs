// script.js (and with --voice, voice.js and the film's length) as plain data, for a host that must not evaluate them
// itself: they are code the agent wrote. A host runs this as it runs every engine tool, confined to the project with no
// network (engineCmd / confinedCmd), and reads only the JSON line it prints.
// node engine/tools/script-data.mjs [--voice]   → { meta, pages: [{ id, cues, instruction }], duration }
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const withVoice = process.argv.includes('--voice');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(KIT, 'runtime/timing.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync('script.js', 'utf8'), ctx);
if (withVoice && fs.existsSync('voice.js')) vm.runInContext(fs.readFileSync('voice.js', 'utf8'), ctx);
const { SCRIPT, TIMING } = ctx;
const pages = (SCRIPT?.PAGES ?? []).map((p) => ({ id: p.id, cues: p.cues, instruction: p.instruction }));
const duration = withVoice ? TIMING.layout(SCRIPT.PAGES, { ...SCRIPT.META, voice: SCRIPT.VOICE }).duration : null;
console.log(JSON.stringify({ meta: SCRIPT?.META ?? {}, pages, duration }));

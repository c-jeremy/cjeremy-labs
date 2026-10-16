// make.mjs: one film = one manifest (videos/<id>.json). Everything that used to be copied per film (the studio page,
// config, TTS, voice layout, frame/encode/audit commands) is generated from it. The film's scenes and its music script
// stay hand-written: they are the film. See "Pipeline" in ANIMATION_GUIDE.md.
//
//   node make.mjs <id> page                 write <id>.html and src/config_<id>.js
//   node make.mjs <id> tts [n ...]          speak the missing lines (or just these, regenerating them) → assets/vo_<id>/lNN.wav
//   node make.mjs <id> listen [n ...]       transcribe lines back (Gemini; a loose check, it is not deterministic)
//   node make.mjs <id> pauses [--gap=.8]    each line's length and internal pauses, plus back-to-back starts as a draft
//   node make.mjs <id> vo                   lay the lines at voice.starts → assets/<id>_vo.wav + src/scenes/<id>_vo_env.js
//   node make.mjs <id> srt                  captions for upload (Bilibili, YouTube) → out/<id>/<title>.srt, timed to the voice's pauses
//   node make.mjs <id> music                run the film's music script (it reads assets/<id>_vo.wav, writes assets/<id>_mix.wav)
//   node make.mjs <id> sheet t1,t2,...      contact sheet → out/<id>/check/sheet.jpg (extra args go to render.mjs)
//   node make.mjs <id> audit [--step=.25]   mechanical checks, minus the manifest's audit.ignore → out/<id>/audit.json
//   node make.mjs <id> frames [--workers=6] all frames → out/<id>/frames (parallel, resumable)
//   node make.mjs <id> encode               out/<id>/frames + assets/<id>_mix.wav → out/<id>/<title>.mp4
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const [id, cmd, ...rest] = process.argv.slice(2);
if (!id || !cmd) { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n')); process.exit(0); }
const M = JSON.parse(readFileSync(`videos/${id}.json`, 'utf8'));
// the house voice: a manifest's voice.model / voice.voice / voice.language override these (older films pin Aoede on 3.1)
const TTS = { model: 'gemini-3.8-flash-tts', voice: 'Tavi', language: 'cmn-CN' };
const V = { ...TTS, ...(M.voice || {}) }, LINES = V.lines || [], SR = 44100, FPS = 24;
const DIR = `assets/vo_${id}`, OUT = `out/${id}`, num = n => String(n).padStart(2, '0');
const flags = Object.fromEntries(rest.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const nums = rest.filter(a => /^\d+$/.test(a)).map(Number);
const run = (c, a) => { const r = spawnSync(c, a, { stdio: 'inherit' }); if (r.status) process.exit(r.status); };
const render = a => run('node', ['render.mjs', `--page=${id}.html`, ...a]);
const dur = f => +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString().trim();
const key = () => readFileSync(V.keyFile || 'tts_api_key.txt', 'utf8').trim();
const vertex = (model, body) => fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${key()}`,
  { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json().catch(() => ({})));

function readWav(p) {                                          // 16-bit PCM, as ffmpeg writes it
  const b = readFileSync(p); let o = 12, data = null, ch = 1;
  while (o < b.length) { const t = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (t === 'fmt ') ch = b.readUInt16LE(o + 10); if (t === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; }
  const s = new Float32Array(data.length / 2 / ch); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2 * ch) / 32768; return s;
}
function writeWav(p, s) {
  const buf = Buffer.alloc(44 + s.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + s.length * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(s.length * 2, 40);
  for (let i = 0; i < s.length; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s[i])) * 32767), 44 + i * 2);
  writeFileSync(p, buf);
}

function pausesOf(f) {                                         // [[start, end], ...] where the voice breathes (−38 dB, ≥ 0.12 s)
  const log = spawnSync('ffmpeg', ['-hide_banner', '-i', f, '-af', 'silencedetect=n=-38dB:d=0.12', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const s = [...log.matchAll(/silence_(start|end): ([\d.]+)/g)].map(m => +m[2]), P = [];
  for (let k = 0; k + 1 < s.length; k += 2) P.push([s[k], s[k + 1]]);
  return P.filter((p, i) => !(i && p[0] - P[i - 1][1] < .1));   // a pause split in two counts once
}

if (cmd === 'page') {
  const audio = M.audio ?? `assets/${id}_mix.wav`;
  writeFileSync(`src/config_${id}.js`, `// config_${id}.js: generated by make.mjs from videos/${id}.json; edit the manifest, not this.\nconst PROJECT = { duration: ${M.duration}, bpm: ${M.bpm}, offset: ${M.offset || 0}, audio: ${JSON.stringify(audio)} };\n`);
  const scripts = [...(M.cast || []), ...(LINES.length ? [`src/scenes/${id}_vo_env.js`] : []), ...(M.scenes || [])].map(s => `<script src="${s}"></script>`).join('\n');
  writeFileSync(`${id}.html`, `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${M.title || id} studio</title>
<!-- generated by make.mjs from videos/${id}.json; edit the manifest, not this -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=block">
<style>
  html, body { margin: 0; background: #1b1820; color: #eee; font: 13px system-ui, sans-serif; }
  main { padding: 12px; display: grid; gap: 8px; }
  #out { width: min(100%, 1280px); aspect-ratio: 16 / 9; height: auto; background: #F3EBDC; }
  .p5Canvas { display: none !important; }
  .bar { display: flex; gap: 10px; align-items: center; max-width: 1280px; }
  #scrub { flex: 1; }
  #tt { font-variant-numeric: tabular-nums; min-width: 190px; }
</style>
<script src="node_modules/p5/lib/p5.min.js"></script>
<script src="node_modules/p5.brush/dist/p5.brush.js"></script>
</head>
<body>
<main>
  <canvas id="out" width="1920" height="1080"></canvas>
  <div class="bar"><input id="scrub" type="range" min="0" max="11" step="0.0417" value="0"><span id="tt">loading…</span></div>
</main>
<script src="src/config_${id}.js"></script>
<script src="src/core.js"></script>
<script src="src/clawd.js"></script>
<script src="src/timeline.js"></script>
<script src="src/sheets.js"></script>
${scripts}
<script>
  const q = new URLSearchParams(location.search).get('loop'); if (q && LOOPS[q]) window.LOOP = LOOPS[q];
</script>
</body>
</html>
`);
  console.log(`wrote ${id}.html and src/config_${id}.js`);

} else if (cmd === 'tts') {
  // Gemini TTS on Vertex AI (express-mode key). Returns raw 16-bit LE PCM at 24 kHz; trimmed and resampled to 44.1 kHz.
  // voice.notes (director's notes) are sent in the TTS prompt layout, which 3.8 keeps silent; a voice.style prefix is
  // the older way and 3.8 often reads it aloud. A take far too long for its text is that leak (or a drawl): retried.
  mkdirSync(DIR, { recursive: true });
  const prompt = l => V.notes ? `### DIRECTOR'S NOTES\n${V.notes}\n\n### TRANSCRIPT\n${l}` : (V.style || '') + l;
  const todo = LINES.map((_, i) => i + 1).filter(n => nums.length ? nums.includes(n) : !existsSync(`${DIR}/l${num(n)}.wav`));
  await Promise.all(todo.map(async n => {
    const name = `${DIR}/l${num(n)}`, chars = LINES[n - 1].replace(/[，。：；？！“”、,.:;?!"\s]/g, '').length;
    for (let tryN = 0; tryN < 5; tryN++) {
      const j = await vertex(V.model, { contents: [{ role: 'user', parts: [{ text: prompt(LINES[n - 1]) }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { languageCode: V.language, voiceConfig: { prebuiltVoiceConfig: { voiceName: V.voice } } } } }).catch(e => ({ error: String(e) }));
      const part = j.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!part) { console.log(`l${n}: ${JSON.stringify(j).slice(0, 200)} (retrying)`); await new Promise(ok => setTimeout(ok, 3000 * (tryN + 1))); continue; }
      // 3.1 sends bare 16-bit PCM; 3.8 sends a whole WAV file whose last chunk is signed C2PA metadata. Read only the WAV's
      // data chunk: played as sound, the header is a click at the start and the C2PA block a loud burst of noise at the end.
      let raw = Buffer.from(part.inlineData.data, 'base64'), rate = 24000, chans = 1;
      if (raw.toString('ascii', 0, 4) === 'RIFF') {
        let o = 12, pcm = null;
        while (o + 8 <= raw.length) { const id = raw.toString('ascii', o, o + 4), len = raw.readUInt32LE(o + 4);
          if (id === 'fmt ') { chans = raw.readUInt16LE(o + 10); rate = raw.readUInt32LE(o + 12); }
          if (id === 'data') { pcm = raw.subarray(o + 8, Math.min(raw.length, o + 8 + len)); break; }
          o += 8 + len + (len & 1); }
        if (!pcm) { console.log(`l${n}: a WAV with no data chunk (retrying)`); continue; }
        raw = pcm;
      }
      const secs = raw.length / 2 / chans / rate;
      if (secs > .4 * chars + 3 && tryN < 4) { console.log(`l${n}: ${secs.toFixed(1)} s for ${chars} characters, too long (retrying)`); continue; }
      writeFileSync(name + '.pcm', raw);
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 's16le', '-ar', String(rate), '-ac', String(chans), '-i', name + '.pcm',
        '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse',
        '-ar', String(SR), '-ac', '1', '-c:a', 'pcm_s16le', name + '.wav']);
      unlinkSync(name + '.pcm');
      console.log(`l${n}: ${dur(name + '.wav').toFixed(2)} s  (${LINES[n - 1].length} chars)`);
      return;
    }
    console.log(`l${n}: FAILED`);
  }));

} else if (cmd === 'listen') {
  const ns = nums.length ? nums : LINES.map((_, i) => i + 1);
  for (const n of ns) {
    const j = await vertex(flags.model || 'gemini-2.5-flash', { contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'audio/wav', data: readFileSync(`${DIR}/l${num(n)}.wav`).toString('base64') } }, { text: 'Transcribe this audio verbatim (keep Latin letters as written). Output only the transcript.' }] }] });
    console.log(`l${n} heard: ${(j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || JSON.stringify(j).slice(0, 160)).trim()}\n    script: ${LINES[n - 1]}`);
  }

} else if (cmd === 'pauses') {
  // Pauses are where the voice actually breathes; time a line's beats to them. Starts are a back-to-back draft (gap s apart).
  const gap = +(flags.gap ?? .8); let t = +(flags.first ?? 1);
  const draft = [];
  LINES.forEach((_, i) => {
    const f = `${DIR}/l${num(i + 1)}.wav`; if (!existsSync(f)) return console.log(`l${num(i + 1)}  (missing)`);
    const log = spawnSync('ffmpeg', ['-hide_banner', '-i', f, '-af', 'silencedetect=n=-38dB:d=0.12', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const s = [...log.matchAll(/silence_(start|end): ([\d.]+)/g)].map(m => +m[2]), P = [];
    for (let k = 0; k + 1 < s.length; k += 2) P.push(`${s[k].toFixed(2)}-${s[k + 1].toFixed(2)}`);
    const d = dur(f), at = (V.starts || [])[i];
    console.log(`l${num(i + 1)}  ${d.toFixed(2).padStart(6)} s  ${at != null ? `@${at} → ${(at + d).toFixed(2)}` : ''}  pauses: ${P.join(' ') || '-'}`);
    draft.push(+t.toFixed(2)); t += d + gap;
  });
  console.log(`\ndraft starts (back to back, ${gap} s gaps; add room where a shot needs it): ${JSON.stringify(draft)}`);
  const st = V.starts || [];
  st.forEach((a, i) => { const f = `${DIR}/l${num(i + 1)}.wav`; if (i + 1 < st.length && existsSync(f) && a + dur(f) > st[i + 1] - .1) console.log(`!! l${num(i + 1)} runs into l${num(i + 2)}`); });

} else if (cmd === 'vo') {
  const st = V.starts, out = new Float32Array(Math.round(SR * M.duration));
  if (!st || st.length !== LINES.length) { console.log('voice.starts must give one start per line'); process.exit(1); }
  st.forEach((t0, i) => { const s = readWav(`${DIR}/l${num(i + 1)}.wav`), i0 = Math.round(t0 * SR); for (let k = 0; k < s.length && i0 + k < out.length; k++) out[i0 + k] += s[k]; });
  writeWav(`assets/${id}_vo.wav`, out);
  // the voice's loudness per frame (RMS over 60 ms), smoothed, 0..1: scenes use voAt(t) to make a speaker pulse
  const env = [], Wn = Math.round(.06 * SR);
  for (let f = 0; f < M.duration * FPS; f++) { const c = Math.round(f / FPS * SR); let s = 0; for (let k = c - Wn / 2; k < c + Wn / 2; k++) s += (out[k] || 0) ** 2; env.push(Math.sqrt(s / Wn)); }
  const pk = Math.max(...env); let sm = 0;
  const norm = env.map(v => (sm += (v / pk - sm) * .55, Math.round(Math.min(1, sm * 1.4) * 100) / 100));
  writeFileSync(`src/scenes/${id}_vo_env.js`, `// generated by make.mjs (vo): the narration's loudness per frame (24 fps), 0..1\nconst VO_ENV = [${norm.join(',')}];\nconst VO_STARTS = ${JSON.stringify(st)};\nconst voAt = t => VO_ENV[Math.max(0, Math.min(VO_ENV.length - 1, Math.round(t * 24)))] || 0;\n`);
  console.log(`wrote assets/${id}_vo.wav and src/scenes/${id}_vo_env.js`);

} else if (cmd === 'srt') {
  // Each line splits at its punctuation into chunks of at most ~16 characters (commas only when a sentence is long).
  // Each boundary's time is guessed from its share of the characters, then snapped to the nearest real pause.
  // voice.show maps spoken spellings back to written ones (五撇端 → 5′端) for the captions only.
  const show = V.show || {}, cues = [], st = V.starts, MAX = +(flags.max || 16);
  const ts = x => { const ms = Math.round(x * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  LINES.forEach((line, i) => {
    const f = `${DIR}/l${num(i + 1)}.wav`, d = dur(f), P = pausesOf(f).filter(p => p[0] > .15 && p[1] < d - .1);
    // pieces between punctuation, then merged greedily into chunks (sentence ends always break)
    const parts = line.match(/[^，。：；？！,.:;?!]+[，。：；？！,.:;?!]*/g) || [line], chunks = [];
    for (const p of parts) { const last = chunks[chunks.length - 1], clean = x => x.replace(/[，。：；,.:;\s]/g, '');
      if (last && !/[。？！?!]$/.test(last) && clean(last + p).length <= MAX) chunks[chunks.length - 1] = last + p; else chunks.push(p); }
    const spoken = x => x.replace(/[，。：；？！,.:;?!\s]/g, '').length, total = spoken(line);
    let acc = 0, t0 = 0;
    chunks.forEach((c, k) => {
      acc += spoken(c);
      let t1 = d;
      if (k < chunks.length - 1) {
        const guess = d * acc / total, near = P.reduce((b, p) => !b || Math.abs((p[0] + p[1]) / 2 - guess) < Math.abs((b[0] + b[1]) / 2 - guess) ? p : b, null);
        t1 = near && Math.abs((near[0] + near[1]) / 2 - guess) < 1.0 ? near[0] : guess;
      }
      let txt = c.replace(/[，。：；,.:;]+$/, '').trim();
      for (const [a, b] of Object.entries(show)) txt = txt.split(a).join(b);
      cues.push([st[i] + t0, st[i] + Math.max(t1, t0 + .6), txt, i]);
      if (k < chunks.length - 1) { const nx = P.find(p => p[0] === t1); t0 = nx ? nx[1] : t1; }
    });
  });
  for (let k = 0; k < cues.length; k++) {                     // too short to read: merge with a neighbour from the same line
    const c = cues[k], nb = cues[k + 1] && cues[k + 1][3] === c[3] ? k + 1 : cues[k - 1] && cues[k - 1][3] === c[3] ? k - 1 : -1;
    if (c[1] - c[0] < 1.1 && nb >= 0) { const [a, b] = nb > k ? [c, cues[nb]] : [cues[nb], c]; cues.splice(Math.min(k, nb), 2, [a[0], b[1], a[2] + '，' + b[2], c[3]]); k = Math.max(-1, Math.min(k, nb) - 1); }
  }
  for (let k = 0; k + 1 < cues.length; k++) if (cues[k + 1][0] - cues[k][1] < .6) cues[k][1] = cues[k + 1][0];   // no flicker between close cues
  mkdirSync(OUT, { recursive: true });
  const file = `${OUT}/${M.title || id}.srt`;
  writeFileSync(file, cues.map(([a, b, txt], k) => `${k + 1}\n${ts(a)} --> ${ts(b)}\n${txt}\n`).join('\n'));
  console.log(`wrote ${file} (${cues.length} cues)`);

} else if (cmd === 'music') {
  if (!M.music) { console.log('no "music" script in the manifest'); process.exit(1); }
  run('node', [M.music]);

} else if (cmd === 'sheet') {
  mkdirSync(`${OUT}/check`, { recursive: true });
  render([`--sheet=${rest[0]}`, `--out=${OUT}/check/sheet.jpg`, ...rest.slice(1)]);

} else if (cmd === 'audit') {
  mkdirSync(OUT, { recursive: true });
  render(['--audit', `--out=${OUT}/audit_raw.json`, ...rest.filter(a => a.startsWith('--'))]);
  // drop runs the film means to have (manifest audit.ignore: {check, key, from, to, why}); check matches by prefix, key by substring
  const ign = (M.audit && M.audit.ignore) || [], keep = [];
  for (const r of JSON.parse(readFileSync(`${OUT}/audit_raw.json`, 'utf8'))) {
    const why = ign.find(g => (!g.check || r.check.startsWith(g.check)) && (!g.key || r.key.includes(g.key)) && r.from >= (g.from ?? -1) && r.to <= (g.to ?? 1e9));
    if (!why) keep.push(r);
  }
  writeFileSync(`${OUT}/audit.json`, JSON.stringify(keep, null, 1));
  console.log(`\n${keep.length} runs left after audit.ignore → ${OUT}/audit.json`);
  for (const r of keep) console.log(`  shot ${r.shot}  ${r.from.toFixed(2)}–${r.to.toFixed(2)}  ${r.check}  ${r.key}`);

} else if (cmd === 'frames') {
  render(['--frames', `--frames-dir=${OUT}/frames`, `--workers=${flags.workers || 6}`, ...(flags.range ? [`--range=${flags.range}`] : [])]);

} else if (cmd === 'encode') {
  render(['--encode', `--frames-dir=${OUT}/frames`, `--audio=${M.audio ?? `assets/${id}_mix.wav`}`, `--out=${OUT}/${M.title || id}.mp4`]);

} else console.log(`unknown command "${cmd}": run node make.mjs for the list`);

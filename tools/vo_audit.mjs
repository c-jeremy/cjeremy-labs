// vo_audit.mjs: find what Gemini TTS sometimes leaves in a narration take besides the script (a laugh or a breath after the
// last word, an ad-libbed or repeated phrase), and cut tail laughs off. Uses the manifest's voice.keyFile, like tools/make.mjs.
//
//   node tools/vo_audit.mjs <id> [n ...]          check the takes → out/<id>/vo_audit/report.json, plus for every take the
//                                                 last speech segment (tail_lNN.wav) and a sheet of the takes' last 3 s (tails.png)
//   node tools/vo_audit.mjs <id> trim n@sec ...   cut take n at sec with a 40 ms fade; the old take goes to out/<id>/vo_backup/
//
// Each take gets two independent looks: Gemini hears the whole take against the script (non-speech sounds, extra or
// missing words), and hears its last speech segment on its own (is it the script's last words, or a laugh?). Takes that
// read much slower than the film's median are flagged too. Gemini isn't deterministic: treat a flag as a question, and
// confirm it by ear or on the sheet before cutting. Afterwards: tools/make.mjs <id> pauses → starts → vo.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const [id, ...rest] = process.argv.slice(2);
if (!id) { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n')); process.exit(0); }
const V = JSON.parse(readFileSync(`videos/${id}.json`, 'utf8')).voice, LINES = V.lines, DIR = `assets/vo_${id}`, OUT = `out/${id}/vo_audit`;
const num = n => String(n).padStart(2, '0'), take = n => `${DIR}/l${num(n)}.wav`;
const dur = f => +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString().trim();
const ff = a => { const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a]); if (r.status) throw new Error(r.stderr.toString()); };
const key = readFileSync(V.keyFile || 'tts_api_key.txt', 'utf8').trim();
mkdirSync(OUT, { recursive: true });

if (rest[0] === 'trim') {
  mkdirSync(`out/${id}/vo_backup`, { recursive: true });
  for (const a of rest.slice(1)) {
    const [n, at] = a.split('@').map(Number), f = take(n), bak = `out/${id}/vo_backup/l${num(n)}_untrimmed.wav`;
    if (!existsSync(bak)) copyFileSync(f, bak);
    ff(['-i', bak, '-af', `atrim=0:${at},afade=t=out:st=${Math.max(0, at - .04)}:d=.04`, '-c:a', 'pcm_s16le', f + '.tmp.wav']);
    copyFileSync(f + '.tmp.wav', f); unlinkSync(f + '.tmp.wav');
    console.log(`l${n}: ${dur(bak).toFixed(2)} → ${dur(f).toFixed(2)} s  (backup ${bak})`);
  }
  process.exit(0);
}

function speech(f) {                                           // [[start, end], ...] between pauses (−38 dB, ≥ 0.12 s), as make.mjs pauses
  const log = spawnSync('ffmpeg', ['-hide_banner', '-i', f, '-af', 'silencedetect=n=-38dB:d=0.12', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const s = [...log.matchAll(/silence_(start|end): ([\d.]+)/g)].map(m => +m[2]), d = dur(f), S = [];
  let a = 0; for (let k = 0; k + 1 < s.length; k += 2) { if (s[k] > a + .02) S.push([a, s[k]]); a = s[k + 1]; }
  if (d > a + .02) S.push([a, d]);
  return S;
}
async function ask(wavPath, prompt, json = true) {             // Gemini hears a WAV; retries on network errors and 429/5xx
  for (let k = 0; k < 5; k++) {
    try {
      const r = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'audio/wav', data: readFileSync(wavPath).toString('base64') } }, { text: prompt }] }],
          generationConfig: { temperature: 0, ...(json ? { responseMimeType: 'application/json' } : {}) } }) });
      const j = await r.json().catch(() => ({}));
      const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('');
      if (txt) return json ? JSON.parse(txt) : txt.trim();
    } catch { }
    await new Promise(ok => setTimeout(ok, 2000 * (k + 1)));
  }
  return null;
}
const WHOLE = text => `This is one take of a Mandarin text-to-speech narration. The script is:\n${text}\n` +
  'Listen closely, especially to the very end. Reply in JSON: {"transcript": verbatim Chinese transcript, marking any non-speech ' +
  'vocal sound in brackets like [笑声] [轻笑] [呼吸] [叹气]; "nonspeech": [{"kind": "laugh"|"chuckle"|"breath"|"sigh"|"other", ' +
  '"start": seconds, "end": seconds}]; "extra": words spoken that are not in the script (or ""); "missing": script words not spoken (or "")}';
const TAIL = 'This clip is the last part of a Mandarin narration take. Reply in JSON: {"kind": "speech"|"laugh"|"breath"|"mixed", ' +
  '"words": the Chinese words spoken (or ""), "laughStart": seconds into the clip where a laugh or chuckle starts, or null}';

const ns = rest.filter(a => /^\d+$/.test(a)).map(Number), todo = ns.length ? ns : LINES.map((_, i) => i + 1);
const old = existsSync(`${OUT}/report.json`) ? JSON.parse(readFileSync(`${OUT}/report.json`, 'utf8')) : {};
const cps = LINES.map((l, i) => existsSync(take(i + 1)) ? l.replace(/[，。：；、？！“”]/g, '').length / dur(take(i + 1)) : NaN);
const median = [...cps].filter(x => x > 0).sort((a, b) => a - b)[Math.floor(cps.filter(x => x > 0).length / 2)];
const report = { ...old }; let next = 0;

async function check(n) {
  const f = take(n), d = dur(f), S = speech(f), last = S[S.length - 1], tail = `${OUT}/tail_l${num(n)}.wav`;
  ff(['-i', f, '-af', `atrim=${Math.max(0, last[0] - .05)}:${d}`, tail]);
  const [whole, end] = await Promise.all([ask(f, WHOLE(LINES[n - 1])), ask(tail, TAIL)]);
  const slow = cps[n - 1] < .8 * median, laughs = (whole?.nonspeech || []).filter(x => /laugh|chuckle/.test(x.kind));
  const flags = [...(laughs.length ? ['laugh (whole take)'] : []), ...(end && end.kind !== 'speech' ? [`tail is ${end.kind}`] : []),
    ...(whole?.extra ? ['extra words'] : []), ...(slow ? [`slow (${cps[n - 1].toFixed(2)} vs median ${median.toFixed(2)} chars/s)`] : [])];
  report[n] = { dur: +d.toFixed(2), speech: S.map(s => s.map(x => +x.toFixed(2))), lastSegment: last.map(x => +x.toFixed(2)), whole, tail: end, flags };
  console.log(`l${num(n)} ${d.toFixed(2).padStart(6)} s  ${flags.length ? '!! ' + flags.join('; ') : 'ok'}${whole?.extra ? `  extra: ${whole.extra}` : ''}${end?.words ? `  tail: ${end.words}` : ''}`);
}
await Promise.all(Array.from({ length: 4 }, async () => { while (next < todo.length) await check(todo[next++]); }));
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));

// a sheet of every take's last 3 s as a spectrogram, 6 across, in line order (laughs show as breathy, rhythmic bursts)
const all = LINES.map((_, i) => i + 1).filter(n => existsSync(take(n)));
all.forEach((n, k) => { const d = dur(take(n)); ff(['-i', take(n), '-af', `atrim=${Math.max(0, d - 3)}:${d}`, '-lavfi',
  `showspectrumpic=s=300x110:legend=0:scale=log:color=intensity`, `${OUT}/spec_${String(k + 1).padStart(3, '0')}.png`]); });
ff(['-framerate', '1', '-start_number', '1', '-i', `${OUT}/spec_%03d.png`, '-vf', `tile=6x${Math.ceil(all.length / 6)}:padding=4:color=white`, '-frames:v', '1', `${OUT}/tails.png`]);
all.forEach((_, k) => unlinkSync(`${OUT}/spec_${String(k + 1).padStart(3, '0')}.png`));
console.log(`\nreport → ${OUT}/report.json, sheet → ${OUT}/tails.png`);

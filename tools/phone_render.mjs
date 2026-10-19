// phone_render.mjs: render a film's frames in any browser (e.g. Chrome on a phone, which uses the phone's GPU).
// This serves the film page plus a driver page (phone_render.html). Each browser that opens the driver asks for the next
// missing frame, renders it with window.renderAt(), and uploads the JPEG. Frames land in out/<id>/frames/fNNNNN.jpg,
// the same files `node tools/make.mjs <id> frames` writes, so the two can be mixed and the run can be resumed. Afterwards:
// `node tools/make.mjs <id> encode`.
//
//   node tools/phone_render.mjs <id> [--port=8787] [--range=a:b]      then open http://<this machine's IP>:8787/ on the phone
//   --fps=6 --dir=out/<id>/demo_frames                                 a low-frame-rate draft into its own folder (defaults: 24, frames)
//   --w=960                                                            the phone scales each JPEG down to this width before uploading
//   --audit [--step=1] --dir=out/<id>/audit_frames                     the mechanical audit (as tools/render.mjs --audit) run on the phone:
//                                                                      each sample uploads window.auditAt(t) and a small JPEG; the runs
//                                                                      land in out/<id>/audit.json when the last sample is in (resumable)
//
// It runs on the laptop (the phone on the same Wi-Fi) or inside Termux on the phone itself (open http://localhost:8787/).
// Only the files the film page needs are served (never the TTS key or anything else in the project).
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, appendFileSync, renameSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { networkInterfaces } from 'node:os';

const [id, ...rest] = process.argv.slice(2);
if (!id) { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n')); process.exit(0); }
const flags = Object.fromEntries(rest.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const AUD = !!flags.audit, STEP = +(flags.step || 1), M = JSON.parse(readFileSync(`videos/${id}.json`, 'utf8')), FPS = AUD ? 1 / STEP : +(flags.fps || 24), PORT = +(flags.port || 8787);
const DIR = flags.dir || `out/${id}/frames`; mkdirSync(DIR, { recursive: true });
const [a, b] = flags.range ? flags.range.split(':').map(Number) : [0, M.duration];
const first = Math.round(a * FPS), last = Math.min(Math.ceil(M.duration * FPS) - 1, Math.round(b * FPS) - 1);
const AUDF = `${DIR}/audit.jsonl`, AR = new Map();               // audit mode: one auditAt() result per sample, kept on disk so a run resumes
if (AUD && existsSync(AUDF)) for (const l of readFileSync(AUDF, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); AR.set(r.i, r); }
const file = i => `${DIR}/f${String(i).padStart(5, '0')}.jpg`, isDone = i => existsSync(file(i)) && statSync(file(i)).size >= 1000 && (!AUD || AR.has(i));
const todo = []; for (let i = first; i <= last; i++) if (!isDone(i)) todo.push(i);
const lease = new Map(), LEASE_MS = 120000, start = Date.now(); let done = 0, cursor = 0;
console.log(`${id}: ${todo.length} frames to render in ${a}–${b} s (${last - first + 1 - todo.length} already done)`);
if (AUD && !todo.length) setTimeout(report, 0);

function next() {                                              // the next frame nobody holds; expired leases are handed out again
  const now = Date.now();
  for (let k = 0; k < todo.length; k++) {
    const j = (cursor + k) % todo.length, i = todo[j];
    if (isDone(i)) continue;
    const l = lease.get(i); if (l && now - l < LEASE_MS) continue;
    lease.set(i, now); cursor = j + 1; return i;
  }
  return null;
}
const ROOT = resolve('.'), ALLOW = [`pages/${id}.html`, 'tools/phone_render.html', 'src/', 'node_modules/p5/lib/', 'node_modules/p5.brush/dist/'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
const send = (res, code, body, type = 'text/plain; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(body); };

createServer((req, res) => {
  const url = new URL(req.url, 'http://x'), p = decodeURIComponent(url.pathname);
  if (p === '/') { res.writeHead(302, { Location: `/tools/phone_render.html?id=${encodeURIComponent(id)}` }); return res.end(); }
  if (p === '/next') { const i = next(), busy = i === null && todo.some(j => !isDone(j)); return send(res, 200, JSON.stringify(i === null ? (busy ? { wait: true } : { done: true }) : { i, t: +(i / FPS).toFixed(3), left: todo.length - done, audit: AUD, w: +(flags.w || 0) }), 'application/json'); }
  const ma = p.match(/^\/audit\/(\d+)$/);
  if (ma && req.method === 'POST' && AUD) {
    const i = +ma[1], chunks = []; req.on('data', c => chunks.push(c));
    req.on('end', () => { try { const r = JSON.parse(Buffer.concat(chunks).toString('utf8')); r.i = i; AR.set(i, r); appendFileSync(AUDF, JSON.stringify(r) + '\n'); send(res, 200, 'ok'); } catch (e) { send(res, 400, 'bad audit'); } });
    return;
  }
  if (p === '/status') return send(res, 200, JSON.stringify({ id, done, total: todo.length, secs: (Date.now() - start) / 1000 }), 'application/json');
  const m = p.match(/^\/frame\/(\d+)$/);
  if (m && req.method === 'POST') {
    const i = +m[1]; if (i < first || i > last) return send(res, 400, 'out of range');
    const chunks = []; req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      if (buf.length < 1000 || buf[0] !== 0xFF || buf[1] !== 0xD8) return send(res, 400, 'not a jpeg');
      const f = file(i); writeFileSync(f + '.tmp', buf); renameSync(f + '.tmp', f); lease.delete(i);
      if (++done % 24 === 0 || done === todo.length) { const el = (Date.now() - start) / 1000; console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame effective  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`); }
      send(res, 200, 'ok');
      if (AUD && done === todo.length) report();
    });
    return;
  }
  const rel = p.replace(/^\/+/, ''), abs = resolve(ROOT, rel);
  if (!abs.startsWith(ROOT + sep) || !ALLOW.some(x => rel === x || (x.endsWith('/') && rel.startsWith(x))) || !existsSync(abs) || statSync(abs).isDirectory()) return send(res, 404, 'not found');
  send(res, 200, readFileSync(abs), TYPES[extname(abs)] || 'application/octet-stream');
}).listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(networkInterfaces()).flat().filter(n => n && n.family === 'IPv4' && !n.internal).map(n => n.address);
  console.log(`open on the phone:  ${[...ips, 'localhost'].map(ip => `http://${ip}:${PORT}/`).join('   ')}`);
});

// the audit's runs, as tools/render.mjs --audit groups them (paper > 0.3 %, clip-<edge> > 8 %, small < 90 px, overlap > 25 %)
function report() {
  const W_ = 1920, H_ = 1080, minH = +(flags['min-height'] || 90), hits = [], isChar = x => x.kind === 'pip' || x.kind === 'clawd';
  for (const r of [...AR.values()].sort((x, y) => x.t - y.t)) {
    const hit = (check, key, v) => hits.push({ t: r.t, shot: r.shot, check, key, v });
    if (r.paper > .003) hit('paper', '', r.paper);
    const chars = r.boxes.filter(isChar), props = r.boxes.filter(x => !isChar(x));
    for (const c of chars) {
      const w = c.x1 - c.x0, h = c.y1 - c.y0, cid = c.kind + ':' + c.key;
      if (c.x1 < 0 || c.x0 > W_ || c.y1 < 0 || c.y0 > H_) continue;
      for (const [edge, px, size] of [['left', -c.x0, w], ['right', c.x1 - W_, w], ['top', -c.y0, h], ['bottom', c.y1 - H_, h]]) if (px / size > .08) hit('clip-' + edge, cid, px / size);
      if (h < minH) hit('small', cid, h);
      for (const q of props) { const ix = Math.max(0, Math.min(c.x1, q.x1) - Math.max(c.x0, q.x0)), iy = Math.max(0, Math.min(c.y1, q.y1) - Math.max(c.y0, q.y0)), f = ix * iy / (w * h); if (f > .25) hit('overlap', cid + ' × ' + q.kind + ':' + q.key, f); }
    }
  }
  hits.sort((x, y) => x.check.localeCompare(y.check) || x.key.localeCompare(y.key) || x.t - y.t);
  const runs = [];
  for (const h of hits) { const l = runs[runs.length - 1]; if (l && l.check === h.check && l.key === h.key && h.t - l.to <= STEP * 1.5 + 1e-6) { l.to = h.t; l.worst = h.check === 'small' ? Math.min(l.worst, h.v) : Math.max(l.worst, h.v); } else runs.push({ check: h.check, key: h.key, shot: h.shot, from: h.t, to: h.t, worst: h.v }); }
  runs.sort((x, y) => x.from - y.from);
  const ign = (M.audit && M.audit.ignore) || [], kept = runs.filter(r => !ign.some(g => (!g.check || r.check.startsWith(g.check)) && (!g.key || r.key.includes(g.key)) && r.from >= (g.from ?? -1) && r.to <= (g.to ?? 1e9)));
  writeFileSync(`out/${id}/audit.json`, JSON.stringify(kept, null, 1));
  const fmt = r => r.check === 'small' ? `${Math.round(r.worst)}px` : r.check === 'paper' ? `${(r.worst * 100).toFixed(1)}%` : `${Math.round(r.worst * 100)}%`;
  for (const r of kept) console.log(`shot ${String(r.shot).padStart(2)}  ${r.from.toFixed(2).padStart(7)}–${r.to.toFixed(2).padEnd(7)} ${r.check.padEnd(12)} ${fmt(r).padStart(6)}  ${r.key}`);
  console.log(`audit: ${kept.length} runs (${runs.length - kept.length} ignored) from ${hits.length} hits, ${AR.size} samples → out/${id}/audit.json`);
}

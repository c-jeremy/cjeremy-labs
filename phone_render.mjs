// phone_render.mjs: render a film's frames in any browser (e.g. Chrome on a phone, which uses the phone's GPU).
// This serves the film page plus a driver page (phone_render.html). Each browser that opens the driver asks for the next
// missing frame, renders it with window.renderAt(), and uploads the JPEG. Frames land in out/<id>/frames/fNNNNN.jpg,
// the same files `node make.mjs <id> frames` writes, so the two can be mixed and the run can be resumed. Afterwards:
// `node make.mjs <id> encode`.
//
//   node phone_render.mjs <id> [--port=8787] [--range=a:b]      then open http://<this machine's IP>:8787/ on the phone
//
// It runs on the laptop (the phone on the same Wi-Fi) or inside Termux on the phone itself (open http://localhost:8787/).
// Only the files the film page needs are served (never the TTS key or anything else in the project).
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, renameSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { networkInterfaces } from 'node:os';

const [id, ...rest] = process.argv.slice(2);
if (!id) { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n')); process.exit(0); }
const flags = Object.fromEntries(rest.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const M = JSON.parse(readFileSync(`videos/${id}.json`, 'utf8')), FPS = 24, PORT = +(flags.port || 8787);
const DIR = `out/${id}/frames`; mkdirSync(DIR, { recursive: true });
const [a, b] = flags.range ? flags.range.split(':').map(Number) : [0, M.duration];
const first = Math.round(a * FPS), last = Math.min(Math.ceil(M.duration * FPS) - 1, Math.round(b * FPS) - 1);
const file = i => `${DIR}/f${String(i).padStart(5, '0')}.jpg`, isDone = i => existsSync(file(i)) && statSync(file(i)).size >= 1000;
const todo = []; for (let i = first; i <= last; i++) if (!isDone(i)) todo.push(i);
const lease = new Map(), LEASE_MS = 120000, start = Date.now(); let done = 0, cursor = 0;
console.log(`${id}: ${todo.length} frames to render in ${a}–${b} s (${last - first + 1 - todo.length} already done)`);

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
const ROOT = resolve('.'), ALLOW = [`${id}.html`, 'phone_render.html', 'src/', 'node_modules/p5/lib/', 'node_modules/p5.brush/dist/'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
const send = (res, code, body, type = 'text/plain; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(body); };

createServer((req, res) => {
  const url = new URL(req.url, 'http://x'), p = decodeURIComponent(url.pathname);
  if (p === '/') { res.writeHead(302, { Location: `/phone_render.html?id=${encodeURIComponent(id)}` }); return res.end(); }
  if (p === '/next') { const i = next(); return send(res, 200, JSON.stringify(i === null ? { done: true } : { i, t: i / FPS, left: todo.length - done }), 'application/json'); }
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

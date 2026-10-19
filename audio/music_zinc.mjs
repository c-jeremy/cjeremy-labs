// audio/music_zinc.mjs: the score for "Pip讲身体里的锌" (src/scenes/zinc.js), synthesised from scratch.
//   node tools/make.mjs zinc vo && node tools/make.mjs zinc music   → assets/zinc_bgm.wav and assets/zinc_mix.wav
// Its own palette, taken from the subject (not selenium's glass and bossa or copper's handbells and brass): struck metal
// for zinc (a vibraphone and a steelpan), pizzicato strings, a ping-pong "tok" as the rhythm bed (the ping-pong ball and
// carbonic anhydrase's ping-pong mechanism) with a light calypso groove for the enzyme's rally, a warm pad for the gentle
// stretch, and a music box that carries the recap motif. Plus a box of cartoon effects, one for every gag: fireworks
// crackle, record scratch, rewind, shutter, twang, boing, bonk, clink, slide whistle, whoosh, snip, zip, shush, referee
// whistle, marbles, squish, slam, snap, sticky pull, sizzle, gulp, splat, chatter. D major / B minor, 92 bpm =
// PROJECT.bpm. Each section follows a voice line (times read from videos/zinc.json, like the scene's L(i, d)); the score
// cuts dead on the hot open's record scratch, ducks under the voice and breathes up in the pauses. The reverb, the ducking
// and the WAV writing stream in place (two float arrays in memory) to stay light on a 4 GB laptop, as in
// audio/music_selenium.mjs, whose engine and effects this reuses.
import { readFileSync, openSync, writeSync, closeSync } from 'node:fs';

const MAN = JSON.parse(readFileSync('videos/zinc.json', 'utf8')), ST = MAN.voice.starts, L = (i, d = 0) => ST[i - 1] + d;
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const Lc = new Float32Array(N), Rc = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 41; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); Lc[i0 + i] += v * gl; Rc[i0 + i] += v * gr; }
}
const env = (tt, a, d) => (tt < a ? tt / a : Math.exp(-(tt - a) / d));

// ---------- instruments ----------
const vibes = (t, m, v = .04, pan = 0, len = 2.6) => { const f = hz(m); add(t, len, pan, tt => {          // a vibraphone: soft mallet, motor tremolo
  const tr = 1 + .22 * Math.sin(TAU * 5.4 * tt); return v * Math.min(1, tt / .004) * tr * (Math.sin(TAU * f * tt) * Math.exp(-tt / 1.3) + .25 * Math.sin(TAU * f * 4 * tt) * Math.exp(-tt / .12) + .08 * Math.sin(TAU * f * 10 * tt) * Math.exp(-tt / .02)); }); };
const steelpan = (t, m, v = .04, pan = 0) => { const f = hz(m), ph = rnd() * TAU; add(t, 1.2, pan, tt => {  // a steelpan: a quick pitch scoop, octave and twelfth
  const sc = 1 + .012 * Math.exp(-tt * 40); return v * Math.min(1, tt / .003) * (Math.sin(TAU * f * sc * tt) * Math.exp(-tt / .55) + .55 * Math.sin(TAU * f * 2.01 * sc * tt + ph) * Math.exp(-tt / .35) + .3 * Math.sin(TAU * f * 3.02 * tt) * Math.exp(-tt / .18) + .12 * Math.sin(TAU * f * 4.2 * tt) * Math.exp(-tt / .06)); }); };
function pizz(t, m, v = .05, pan = 0) {                          // a pizzicato string: Karplus–Strong, short and round
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); for (let i = 0; i < P; i++) buf[i] = rnd() * 2 - 1;
  let i = 0, prev = 0; add(t, .55, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = .985 * .5 * (a + b); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .35; return v * prev * Math.min(1, tt / .002) * Math.exp(-tt * 5); });
}
const musicBox = (t, m, v = .04, pan = 0) => { const f = hz(m); add(t, 1.6, pan, tt => v * Math.min(1, tt / .001) * (Math.sin(TAU * f * tt) * Math.exp(-tt / .8) + .4 * Math.sin(TAU * f * 5.4 * tt) * Math.exp(-tt / .05) + .2 * Math.sin(TAU * f * 3 * tt) * Math.exp(-tt / .3))); };
function pad(t, len, ms, v = .01) {                                 // a warm string pad: detuned pairs, slow swell, a little vibrato
  ms.forEach((m, j) => { for (const dt of [-.06, .06]) { const f = hz(m) * (1 + dt / 100 * 12), ph = rnd() * TAU;
    add(t, len + 1.4, (j / (ms.length - 1 || 1)) - .5, tt => { const a = Math.min(1, tt / 1.0) * (tt > len ? Math.exp(-(tt - len) / .8) : 1), vib = 1 + .003 * Math.sin(TAU * 5 * tt + ph);
      let s = 0; for (let k = 1; k <= 4; k++) s += Math.sin(TAU * f * k * vib * tt + ph * k) / (k * k); return v * a * s; }); } });
}
const bass = (t, m, v = .11, len = BEAT * 1.4) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .008) * Math.exp(-tt / .8) * (tt > len ? Math.exp(-(tt - len) / .08) : 1);
  return v * e * (Math.sin(TAU * f * tt) + .3 * Math.sin(TAU * 2 * f * tt) * Math.exp(-tt * 6)); }); };
const tok = (t, v = .05, pan = 0, f0 = 1900) => add(t, .06, pan, tt => v * (Math.sin(TAU * f0 * tt) * Math.exp(-tt * 120) + .6 * Math.sin(TAU * f0 * .32 * tt) * Math.exp(-tt * 60)));   // a ping-pong ball
const shaker = (t, v = .02, pan = .3) => { let hp = 0, last = 0; add(t, .1, pan, tt => { const x = rnd() * 2 - 1; hp = x - last; last = x; return v * hp * env(tt, .015, .028); }); };
const kick = (t, v = .14) => add(t, .45, 0, tt => v * Math.sin(TAU * (50 + 60 * Math.exp(-tt * 25)) * tt) * Math.exp(-tt * 7));
const rim = (t, v = .05) => add(t, .06, -.25, tt => v * (Math.sin(TAU * 1700 * tt) + .5 * (rnd() * 2 - 1)) * Math.exp(-tt * 70));
// cartoon effects (from audio/music_selenium.mjs) and new ones for this film
function whoosh(t, len, v = .06) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const pop = (t, v = .08, f0 = 900) => add(t, .12, 0, tt => v * Math.sin(TAU * (f0 - 5000 * tt) * tt) * Math.exp(-tt * 40));
const boing = (t, v = .06, m = 55) => { const f = hz(m); add(t, .7, .1, tt => v * Math.sin(TAU * f * tt * (1 + .35 * Math.sin(TAU * 7 * tt) * Math.exp(-tt * 3))) * Math.exp(-tt * 4)); };
function slide(t, m0, m1, len, v = .05) { let ph = 0; add(t, len + .05, .2, tt => { const f = hz(m0 + (m1 - m0) * Math.min(1, tt / len)); ph += TAU * f / SR; return v * Math.sin(ph) * Math.min(1, tt / .02) * (tt > len ? Math.exp(-(tt - len) / .03) : 1); }); }
function zap(t, v = .035) { add(t, .3, 0, tt => v * Math.sign(Math.sin(TAU * (1400 - 3000 * tt) * tt)) * Math.exp(-tt * 9) * (rnd() * .4 + .6)); }
function boom(t, v = .2) { let lp = 0; add(t, 1.6, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * .04; return v * (Math.sin(TAU * (45 + 50 * Math.exp(-tt * 6)) * tt) * Math.exp(-tt * 2.2) + 2.2 * lp * Math.exp(-tt * 3)); }); }
function clang(t, v = .07, f = 330) { add(t, 2.0, 0, tt => v * Math.exp(-tt * 1.6) * (Math.sin(TAU * f * tt) + .7 * Math.sin(TAU * f * 2.41 * tt) + .5 * Math.sin(TAU * f * 3.97 * tt) + .3 * Math.sin(TAU * f * 5.43 * tt))); }
const tick = (t, v = .04, pan = .3) => add(t, .05, pan, tt => v * Math.sin(TAU * 2400 * tt) * Math.exp(-tt * 90));
const knock = (t, v = .1) => add(t, .2, -.1, tt => v * Math.sin(TAU * (180 + 80 * Math.exp(-tt * 40)) * tt) * Math.exp(-tt * 25));
function whistle(t, m, len, v = .045, trill = 0) { const f = hz(m); add(t, len + .05, .2, tt => v * Math.sin(TAU * f * tt + (.3 + trill) * Math.sin(TAU * (32 + 8 * trill) * tt)) * Math.min(1, tt / .02) * (tt > len ? Math.exp(-(tt - len) / .03) : 1)); }
function noiseBurst(t, len, v, c0, c1 = c0, pan = 0) { let lp = 0; add(t, len, pan, tt => { const k = tt / len; lp += ((rnd() * 2 - 1) - lp) * (c0 + (c1 - c0) * k); return v * lp * Math.sin(Math.PI * Math.min(1, k * 4)) * (1 - k); }); }
const crunch = (t, v = .07) => { for (let i = 0; i < 3; i++) noiseBurst(t + i * .025, .06, v * (1 - i * .25), .7, .3, (i - 1) * .2); };
const sizzle = (t, len, v = .03) => { let hp = 0, last = 0; add(t, len, .1, tt => { const x = rnd() * 2 - 1; hp = .3 * hp + x - last; last = x; return v * hp * Math.min(1, tt / .05) * Math.exp(-tt / (len * .5)) * (.6 + .4 * rnd()); }); };
const thwack = (t, v = .09) => { noiseBurst(t, .08, v, .6, .2); knock(t, v * .9); };
const splat = (t, v = .1) => { noiseBurst(t, .35, v, .15, .05); add(t, .3, 0, tt => v * .8 * Math.sin(TAU * (90 - 40 * tt) * tt) * Math.exp(-tt * 10)); };
function scratch(t, v = .08) { let ph = 0, lp = 0; add(t, .45, 0, tt => { const sp = tt < .2 ? 1 - tt / .2 * 1.8 : -.8 + (tt - .2) / .25 * 1.6; ph += TAU * 180 * sp / SR; lp += ((rnd() * 2 - 1) - lp) * .5; return v * (Math.sin(ph * 3) * .6 + lp * .5) * Math.min(1, tt / .01) * Math.exp(-tt * 3); }); }
function rewind(t, len, v = .04) { add(t, len, 0, tt => { const k = tt / len, sp = 1 + 5 * Math.sin(Math.PI * k); let s = 0; for (const m of [74, 78, 81]) s += Math.sin(TAU * hz(m) * sp * tt * (1 + .03 * Math.sin(TAU * 18 * tt))); return v * s * Math.sin(Math.PI * k) * (.7 + .3 * Math.sin(TAU * 40 * tt)); }); }
const corkPop = (t, v = .1) => { pop(t, v, 1400); noiseBurst(t, .05, v * .5, .8); };
const ding = (t, m = 86, v = .045) => { vibes(t, m, v, 0, 1.6); musicBox(t + .01, m + 12, v * .4); };
const slurp = (t, v = .05) => { let lp = 0; add(t, .5, 0, tt => { const k = tt / .5; lp += ((rnd() * 2 - 1) - lp) * (.05 + .5 * k); return v * lp * Math.sin(Math.PI * k) * 2; }); pop(t + .48, .07); };
const whirr = (t, len, v = .03) => { let ph = 0; add(t, len, 0, tt => { const k = tt / len, f = 80 + 260 * Math.sin(Math.PI * k); ph += TAU * f / SR; return v * Math.sign(Math.sin(ph)) * Math.sin(Math.PI * k) * .6; }); };
const clatter = (t, n = 6, v = .05) => { for (let i = 0; i < n; i++) knock(t + i * .045 + .02 * hash(i + t), v * (.6 + .4 * hash(i + 3))); };
const wahwah = (t, v = .04) => { [62, 61, 60, 59].forEach((m, i) => { const f = hz(m); let lp = 0; add(t + i * .45, i === 3 ? 1.0 : .42, 0, tt => { const s = 2 * ((f * tt) % 1) - 1, c = .02 + .1 * (.5 + .5 * Math.sin(TAU * (i === 3 ? 5 : 2.5) * tt)); lp += (s - lp) * c; return v * lp * 2.5 * Math.min(1, tt / .03); }); }); };
const cough = (t, v = .05) => { for (let i = 0; i < 3; i++) noiseBurst(t + i * .22, .14, v, .25, .08); };
const squeak = (t, v = .03) => slide(t, 88, 96, .08, v);
const fireRoar = (t, len, v = .05) => { let lp = 0; add(t, len, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * .08; return v * lp * 3 * Math.min(1, tt / .2) * Math.min(1, (len - tt) / .4) * (.8 + .2 * Math.sin(TAU * 7 * tt)); }); };
function gliss(t, ms, step = .06, v = .04, inst = musicBox) { ms.forEach((m, i) => inst(t + i * step, m, v, (i / ms.length) - .5)); }
const crackle = (t, len, v = .03) => { const n = Math.floor(len * 40); for (let i = 0; i < n; i++) { const at = t + len * hash(i * 1.37 + t), k = (at - t) / len; tick(at, v * (1 - .6 * k) * (.4 + .6 * hash(i + 2)), (hash(i + 5) - .5) * 1.4); if (i % 5 === 0) noiseBurst(at, .03, v * .6, .9, .5, (hash(i) - .5)); } };
const firework = (t, v = .06) => { boom(t, v * 1.6); crackle(t + .1, 2.2, v * .6); gliss(t + .05, [86, 90, 93, 98], .05, v * .35, musicBox); };
const shutter = (t, v = .06) => { tick(t, v, 0); knock(t + .03, v * .5); tick(t + .08, v * .8, 0); };
const snip = (t, v = .05) => { tick(t, v, 0); noiseBurst(t, .04, v * .7, .9); tick(t + .03, v * .7, 0); };
const zipS = (t, v = .05) => { slide(t, 70, 96, .16, v); noiseBurst(t, .18, v * .5, .5, .9); };
const shush = (t, len, v = .03) => { let hp = 0, last = 0; add(t, len, 0, tt => { const x = rnd() * 2 - 1; hp = .8 * hp + x - last; last = x; return v * hp * Math.sin(Math.PI * tt / len); }); };
const marbles = (t, len, v = .04) => { const n = Math.floor(len * 22); for (let i = 0; i < n; i++) { const at = t + len * Math.pow(hash(i + 7), 1.6); add(at, .08, (hash(i) - .5), tt => v * Math.sin(TAU * (2600 + 1400 * hash(i + 1)) * tt) * Math.exp(-tt * 70)); } };
const squish = (t, v = .06) => { noiseBurst(t, .25, v, .1, .03); slide(t, 50, 43, .25, v * .6); };
const slam = (t, v = .14) => { boom(t, v * .6); thwack(t, v * .8); clang(t, v * .25, 180); };
const snap = (t, v = .07) => { noiseBurst(t, .03, v, .95); knock(t, v * .6); };
const gulp = (t, v = .05) => { slide(t, 60, 48, .18, v); knock(t + .18, v * .6); };
const chatter = (t, len, v = .03) => { for (let k = 0; k < len * 16; k++) tick(t + k / 16, v * (.6 + .4 * hash(k)), (k % 2) ? .2 : -.2); };
const creak = (t, len, v = .025) => { let ph = 0; add(t, len, -.2, tt => { const f = 120 + 60 * Math.sin(TAU * .7 * tt); ph += TAU * f / SR; return v * (Math.sign(Math.sin(ph)) * .5 + (rnd() - .5) * .4) * Math.sin(Math.PI * tt / len); }); };
const bellAlarm = (t, len, v = .03) => { for (let k = 0; k < len * 14; k++) clang(t + k / 14, v * (1 - .3 * k / (len * 14)), 1250); };
const twang = (t, v = .05) => { const f = hz(45); add(t, 1.0, 0, tt => v * Math.sin(TAU * f * tt * (1 + .08 * Math.exp(-tt * 4) * Math.sin(TAU * 30 * tt))) * Math.exp(-tt * 3) * Math.tanh(4 * Math.sin(TAU * f * 2 * tt))); };
const bonk = (t, v = .1) => { knock(t, v); boing(t + .02, v * .5, 64); };
const tiptoe = (t, m, v = .04) => { pizz(t, m, v, -.2); pizz(t + .09, m + 7, v * .6, .2); };
const ribbit = (t, v = .04) => { for (let i = 0; i < 2; i++) { let lp = 0; const f = 140; add(t + i * .16, .14, 0, tt => { const s = 2 * ((f * tt) % 1) - 1; lp += (s - lp) * .2; return v * lp * 3 * Math.sin(Math.PI * tt / .14); }); } };
const tapeRip = (t, v = .04) => noiseBurst(t, .5, v, .9, .4);

// ---------- harmony ----------
const CH = { D: [50, 57, 62, 66], Dmaj7: [50, 57, 61, 66], Bm7: [47, 54, 57, 62], Bm: [47, 54, 59, 62], Gmaj7: [43, 54, 59, 62], G: [43, 55, 59, 62], A7: [45, 55, 61, 64], A: [45, 57, 61, 64],
  Asus: [45, 57, 62, 64], Em7: [52, 55, 59, 62], 'F#m7': [54, 57, 61, 64], 'F#7': [54, 58, 61, 64], E7: [52, 56, 59, 62], C: [48, 55, 60, 64], Bb: [46, 53, 58, 62], Gm: [43, 55, 58, 62] };
const ROOT = { D: 38, Dmaj7: 38, Bm7: 35, Bm: 35, Gmaj7: 43, G: 43, A7: 45, A: 45, Asus: 45, Em7: 40, 'F#m7': 42, 'F#7': 42, E7: 40, C: 36, Bb: 46, Gm: 43 };
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    if (st.pad) pad(t, len, ch.slice(1), st.pad);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) bass(tb, r, .1, BEAT * 3.4);
      if (st.bass === 'calypso') { if (b === 0) bass(tb, r, .1, BEAT * 1.2); if (b === 1) bass(tb + BEAT * .5, r + 7, .08, BEAT * .5); if (b === 2) bass(tb, r + 12, .07, BEAT * .5); if (b === 3) bass(tb, r + 7, .08, BEAT * .9); }
      if (st.bass === 'walk') bass(tb, r + [0, 4, 7, 9][b], .085, BEAT * .9);
      if (st.bass === 'tip') { if (b % 2 === 0) bass(tb, r + (b ? 7 : 0), .07, BEAT * .4); }
      if (st.tok) { tok(tb + BEAT / 2, st.tok, .35); if (st.sixteenth) tok(tb + BEAT * .75, st.tok * .6, -.35, 1700); }
      if (st.shaker) shaker(tb + BEAT / 2, st.shaker);
      if (st.groove) { if (b === 0 || b === 2) kick(tb, st.groove); if (b === 1 || b === 3) rim(tb, st.groove * .35); }
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.sixteenth ? 4 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          (st.arp)(tb + e * BEAT / per, m, (st.arpV ?? .04) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
const MOTIF = [[0, 74, .5], [.5, 78, .5], [1, 81, 1], [2, 79, .5], [2.5, 78, .5], [3, 74, 1.5]];   // the recap theme, in beats
const motif = (t, tr = 0, v = .05) => MOTIF.forEach(([b, m]) => { musicBox(t + b * BEAT, m + tr, v); vibes(t + b * BEAT, m + tr - 12, v * .4, 0, 1.4); });

// ---------- sections (one per shot, following the voice) ----------
// A1: the hot open: a sneaky pizzicato; a build under the ripple; bright fireworks on the bang; dead on the scratch
section(0, 4.6, ['Bm', 'Bm', 'Em7', 'F#7'], { bass: 'tip', arp: pizz, arpV: .035, skip: .55, pat: [0, 3, 1, 2] });
for (let i = 0; i < 8; i++) vibes(4.6 + i * .125, 62 + i * 2, .02 + i * .004, (i % 2) - .5, 1.0);
section(5.6, 9.2, ['D', 'Gmaj7', 'A', 'D'], { bass: 'calypso', tok: .03, arp: steelpan, arpV: .045, sixteenth: true, skip: .2 });
pad(9.5, L(2) - 9.5, [57, 62, 66], .004);                           // a faint held chord under the freeze
section(L(2, .7), L(3, -.4), ['Dmaj7', 'Bm7', 'Gmaj7', 'A7'], { pad: .005, bass: 'one', arp: vibes, arpV: .03, skip: .45 });
// A2: the bench, the brake, the shell
section(L(3, -.4), L(4, 0), ['Bm7', 'Gmaj7', 'D', 'A'], { bass: 'tip', arp: pizz, arpV: .035, skip: .35, tok: .012 });
section(L(4, 0), L(5, 0), ['Em7', 'F#7', 'Bm', 'A'], { bass: 'walk', arp: pizz, arpV: .035, skip: .3 });
section(L(5, 0), L(6, -.9), ['Gmaj7', 'D', 'A', 'D'], { pad: .007, bass: 'one', arp: vibes, arpV: .03, skip: .4 });
// B1: the ping-pong hall: the toks start; the grid; the line-up; the question
section(L(6, -.9), L(8, 0), ['D', 'Bm7', 'Em7', 'A7'], { bass: 'calypso', tok: .03, arp: steelpan, arpV: .04, skip: .3 });
section(L(8, 0), L(9, 0), ['D', 'G', 'A', 'D'], { bass: 'calypso', tok: .035, sixteenth: true, arp: pizz, arpV: .04, skip: .2 });
section(L(9, 0), L(10, 0), ['Bm7', 'Em7', 'A7', 'D'], { bass: 'walk', tok: .02, arp: steelpan, arpV: .035, skip: .35 });
section(L(10, 0), L(11, -.9), ['Gmaj7', 'Em7', 'Asus', 'Asus'], { pad: .008, bass: 'one', arp: vibes, arpV: .03, skip: .5 });
// C1: galvanised: why zinc
section(L(11, -.9), L(12, 0), ['D', 'Bm7', 'G', 'A'], { bass: 'tip', arp: pizz, arpV: .04, skip: .3, tok: .015 });
section(L(12, 0), L(13, 0), ['Em7', 'F#7', 'Bm', 'Bm'], { bass: 'walk', arp: pizz, arpV: .04, skip: .2 });
section(L(13, 0), L(14, 0), ['Gmaj7', 'D', 'Em7', 'A'], { pad: .006, bass: 'one', arp: vibes, arpV: .03, skip: .45 });
section(L(14, 0), L(17, 0), ['D', 'G', 'Bm7', 'A7'], { bass: 'calypso', tok: .02, arp: steelpan, arpV: .04, skip: .3 });
section(L(17, 0), L(18, 0), ['Em7', 'F#7', 'Bm', 'A'], { bass: 'walk', arp: pizz, arpV: .04, skip: .2 });
section(L(18, 0), L(19, -.9), ['Gmaj7', 'A', 'Dmaj7', 'Dmaj7'], { pad: .007, bass: 'one', arp: vibes, arpV: .035, skip: .3 });
// D1: every breath: a calypso for the ping-pong enzyme; the rally gets busy
section(L(19, -.9), L(21, 0), ['D', 'Gmaj7', 'Em7', 'A7'], { pad: .005, bass: 'one', arp: vibes, arpV: .03, skip: .4 });
section(L(21, 0), L(23, 0), ['D', 'Bm7', 'G', 'A7'], { bass: 'calypso', tok: .03, shaker: .018, arp: steelpan, arpV: .045, skip: .2 });
section(L(23, 0), L(24, 0), ['D', 'A', 'G', 'A'], { bass: 'calypso', tok: .04, sixteenth: true, groove: .09, shaker: .025, arp: steelpan, arpV: .05 });
section(L(24, 0), L(26, -.5), ['Gmaj7', 'D', 'Em7', 'A'], { bass: 'calypso', tok: .025, arp: steelpan, arpV: .04, skip: .3 });
// D2: mint: more zinc enzymes, the plateau, the drawers and the medal
section(L(26, -.5), L(27, 0), ['Bm7', 'Gmaj7', 'Em7', 'F#7'], { pad: .007, bass: 'one', arp: vibes, arpV: .03, skip: .4 });
section(L(27, 0), L(29, 0), ['D', 'G', 'A', 'Bm7'], { bass: 'tip', tok: .015, arp: pizz, arpV: .04, skip: .25 });
section(L(29, 0), L(30, -.9), ['G', 'A', 'D', 'D'], { bass: 'calypso', tok: .02, arp: steelpan, arpV: .04, skip: .25 });
// E1–E2: lavender: the scaffold; the fingers; the scissors; insulin's parcel
section(L(30, -.9), L(32, 0), ['Dmaj7', 'Gmaj7', 'Em7', 'A'], { pad: .006, bass: 'one', arp: vibes, arpV: .03, skip: .4 });
section(L(32, 0), L(34, 0), ['Bm7', 'Em7', 'A7', 'D'], { bass: 'tip', arp: musicBox, arpV: .025, skip: .45 });
section(L(34, 0), L(36, 0), ['D', 'G', 'A', 'D'], { bass: 'walk', tok: .015, arp: pizz, arpV: .04, skip: .25 });
section(L(36, 0), L(38, 0), ['Gmaj7', 'A', 'F#m7', 'Bm7'], { bass: 'calypso', arp: steelpan, arpV: .035, skip: .35 });
section(L(38, 0), L(40, -.9), ['Dmaj7', 'Em7', 'Gmaj7', 'A'], { pad: .006, bass: 'one', arp: vibes, arpV: .03, skip: .4 });
// F1: navy: the messenger; the library hush; the synapse; the whistle; the egg again
section(L(40, -.9), L(41, 0), ['Bm7', 'Gmaj7', 'Em7', 'F#7'], { pad: .006, arp: vibes, arpV: .025, skip: .5 });
section(L(41, 0), L(41, 4.3), ['Bm7'], { pad: .003 });
section(L(41, 4.3), L(43, 0), ['D', 'Bm7', 'G', 'A'], { pad: .005, bass: 'one', arp: vibes, arpV: .03, skip: .35 });
section(L(43, 0), L(44, 0), ['D', 'G', 'A', 'D'], { bass: 'calypso', tok: .02, arp: pizz, arpV: .04, skip: .25 });
section(L(44, 0), L(45, -.85), ['Gmaj7', 'A', 'Dmaj7', 'Dmaj7'], { pad: .008, bass: 'one', arp: vibes, arpV: .03, skip: .4 });
// R1: recap 1: the music box carries the motif over a pad
pad(L(45, -.85), L(47, -.9) - L(45, -.85), CH.Dmaj7.slice(1), .008); motif(L(45, .3)); motif(L(45, 6.0), 5, .04); motif(L(46, 4.0), 0, .05);
// G1: the turn: minor and nervous while loose zinc jams things, funky for the sponge and customs, calm at the end
section(L(47, -.9), L(49, 0), ['Bm', 'F#7', 'Gm', 'F#7'], { bass: 'walk', arp: pizz, arpV: .04, skip: .2 });
section(L(49, 0), L(52, 0), ['Em7', 'A7', 'D', 'Bm7'], { bass: 'calypso', tok: .02, arp: steelpan, arpV: .035, skip: .3 });
section(L(52, 0), L(54, 0), ['Bm7', 'Gmaj7', 'Em7', 'F#7'], { bass: 'walk', arp: vibes, arpV: .03, skip: .3, pad: .004 });
section(L(54, 0), L(55, -.9), ['Gmaj7', 'Dmaj7', 'Gmaj7', 'Dmaj7'], { pad: .008, bass: 'one', arp: vibes, arpV: .03, skip: .5 });
// H1: food: the sea calypso, sticky phytate, the rising mantou
section(L(55, -.9), L(56, 2.8), ['D', 'Bm7', 'Em7', 'A7'], { bass: 'tip', arp: pizz, arpV: .035, skip: .35 });
section(L(56, 2.8), L(57, 0), ['D', 'G', 'A', 'D'], { bass: 'calypso', tok: .025, shaker: .02, arp: steelpan, arpV: .045, skip: .15 });
section(L(57, 0), L(58, 0), ['Em7', 'Bb', 'A7', 'A7'], { bass: 'walk', arp: pizz, arpV: .035, skip: .3 });
section(L(58, 0), L(60, -.9), ['G', 'A', 'D', 'Bm7'], { bass: 'calypso', tok: .02, arp: steelpan, arpV: .04, skip: .3 });
// I1: the gentle stretch: a warm pad and a few music-box notes, no percussion
section(L(60, -.9), L(63, 0), ['Bm7', 'Gmaj7', 'D', 'A'], { pad: .01, bass: 'one', arp: musicBox, arpV: .02, skip: .7 });
section(L(63, 0), L(66, 0), ['Gmaj7', 'D', 'Em7', 'A'], { pad: .01, bass: 'one', arp: musicBox, arpV: .02, skip: .65 });
section(L(66, 0), L(69, -.9), ['Bm7', 'Em7', 'Gmaj7', 'D'], { pad: .01, bass: 'one', arp: musicBox, arpV: .02, skip: .6 });
// I2: the chili
section(L(69, -.9), L(69, 8.0), ['D', 'Bm7', 'G', 'A'], { bass: 'tip', tok: .015, arp: pizz, arpV: .035, skip: .4 });
// J1: too much: a workshop groove, the hammock, the window
section(L(70, -.9), L(72, 0), ['Bm', 'Em7', 'F#7', 'Bm'], { bass: 'walk', arp: pizz, arpV: .04, skip: .25 });
section(L(72, 0), L(74, 0), ['D', 'A', 'Bm7', 'G'], { bass: 'tip', tok: .015, arp: steelpan, arpV: .035, skip: .35 });
section(L(74, 0), L(76, 0), ['Em7', 'A7', 'D', 'Bm7'], { bass: 'walk', groove: .06, arp: pizz, arpV: .035, skip: .25 });
section(L(76, 0), L(78, -.9), ['Gmaj7', 'Em7', 'Asus', 'A'], { pad: .007, bass: 'one', arp: vibes, arpV: .03, skip: .45 });
// R2: recap 2
pad(L(78, -.9), L(79, -.9) - L(78, -.9), CH.Bm7.slice(1), .008); motif(L(78, .3), -3, .045); motif(L(78, 7.6), 0, .05);
// K1: the answer; the ball; the fireworks; the photo; the last chord
section(L(79, -.9), L(81, 0), ['Gmaj7', 'A', 'F#m7', 'Bm7'], { pad: .008, bass: 'one', arp: vibes, arpV: .035, skip: .3 });
section(L(81, 0), L(81, 2.6), ['D', 'G'], { bass: 'calypso', tok: .03, arp: steelpan, arpV: .045, skip: .2 });
section(L(81, 2.6), DUR - 3.0, ['D', 'Gmaj7', 'A', 'D'], { pad: .008, bass: 'calypso', tok: .02, arp: steelpan, arpV: .045, skip: .25 });
pad(DUR - 3.0, 2.6, CH.Dmaj7.slice(1), .012); motif(L(81, 8.4), 0, .045);

// ---------- stingers, gags and effects (times from the scene) ----------
// A1: tiptoes; the camera up; the sperm; the ripple; BOOM; the camera tumbles; the cough; the second burst; the scratch
[.75, 1.27, 1.8, 2.32].forEach((t, i) => tiptoe(t, [59, 62, 59, 64][i], .045));
tick(2.75, .04); slide(3.0, 76, 79, 1.2, .012); pop(3.4, .05, 1300); knock(4.25, .05); boing(4.3, .03, 72);
sizzle(4.6, 1.0, .02); firework(5.6, .08); shutter(5.6, .06); slide(5.75, 76, 52, 1.1, .03); clatter(6.9, 4, .04);
cough(7.35, .05); crackle(8.3, .9, .03); sizzle(8.35, .4, .03); scratch(9.15, .1);
rewind(L(2), .7, .035); boom(L(2, 2.2), .1); crackle(L(2, 2.3), 2.0, .03); [3.3, 4.3, 7.0].forEach(d => { boom(L(2, d), .05); crackle(L(2, d + .1), 2.2, .025); });
gliss(L(2, 6.9), [86, 90, 93, 98, 102], .08, .03);
// A2: squeak; the brake strains, twangs, the zinc pops out, Pip slips; the shell rings; the bonk; knock knock, ow
squeak(L(3, 1.3), .03); for (let i = 0; i < 4; i++) crackle(L(3, i * 2.4), .8, .015);
creak(L(4, 3.0), 2.8, .025); twang(L(4, 5.8), .05); for (let i = 0; i < 4; i++) pop(L(4, 5.85 + i * .06), .05, 1200 + 150 * i);
slide(L(4, 5.9), 72, 60, .4, .03); thwack(L(4, 6.45), .08); gliss(L(4, 6.8), [74, 78, 81, 86], .1, .03, vibes);
clang(L(5, 2.6), .04, 660); bonk(L(5, 3.2), .06); knock(L(5, 3.75), .09); knock(L(5, 4.1), .09); slide(L(5, 4.45), 79, 84, .2, .03);
whoosh(L(6, -1.2), .6, .05);
// B1: the ball bounces; the specks gather; the balance levels; the nods; muscles and bones; the grid; the run; the drop
[.25, .62, .9, 1.1, 1.24].forEach(d => tok(L(6, d), .06, 0));
gliss(L(6, 3.0), [74, 78, 81, 86, 90], .3, .025, vibes); ding(L(6, 5.8), 86, .045); tick(L(6, 6.1), .03); tick(L(6, 6.6), .03);
gliss(L(7, .8), [69, 74, 78], .5, .02, vibes); musicBox(L(7, 3.9), 98, .03);
for (let i = 0; i < 20; i++) pizz(L(8, .3 + i * .1), 74 + (i % 5) * 2, .025, (i % 2) - .5);
for (let i = 0; i < 10; i++) tick(L(8, 4.4 + i * .4), .03); [8.5, 8.9, 9.2, 9.4].forEach((d, i) => tok(L(8, d), .05 * (1 - i * .2), .4, 1500));
for (let i = 0; i < 7; i++) slide(L(9, 3.5 + i * .55), 80, 88, .12, .02); slide(L(9, 7.3), 72, 86, .35, .03); tick(L(9, 8.1), .05); slide(L(9, 8.2), 86, 70, .5, .025);
slide(L(10, 1.6), 74, 79, .3, .025); slide(L(10, 1.95), 79, 84, .3, .025); whoosh(L(11, -1.0), .7, .05);
// C1: the lasso and the yank; the zinc rope that snaps; knockback; the shove; bonk; radicals; hammering; the crowbar; seats; tug; dings
for (let i = 0; i < 3; i++) whoosh(L(11, 3.9 + i * .5), .4, .03); zipS(L(11, 5.4), .05); ding(L(11, 5.8), 81, .04);
slide(L(12, -.2), 60, 67, .9, .02); creak(L(12, 2.5), 2.5, .03); twang(L(12, 5.0), .06); slide(L(12, 5.05), 84, 60, .7, .03); thwack(L(12, 5.8), .08);
squeak(L(12, 6.6), .04); pop(L(12, 7.2), .08, 1100); bonk(L(12, 7.45), .1);
zap(L(13, 2.0), .04); zap(L(13, 3.5), .04); tick(L(13, 4.4), .03); vibes(L(13, 5.8), 74, .03); vibes(L(13, 5.85), 78, .025);
knock(L(14, 2.4), .07); for (const d of [4.2, 4.5, 5.3, 5.6]) tick(L(14, d), .04); for (const d of [7.3, 7.9, 8.5, 9.1]) { clang(L(14, d), .03, 880); knock(L(14, d), .05); }
for (let i = 0; i < 16; i++) tick(L(15, .3 + i * .2), .02, (i % 3) - 1); creak(L(15, 4.5), 1.6, .03); boing(L(15, 5.4), .05, 50); slide(L(15, 6.1), 74, 62, .3, .03); thwack(L(15, 6.75), .08);
for (let i = 0; i < 3; i++) { pop(L(16, .4 + i * 1.1), .05, 900 + 200 * i); boing(L(16, 1.2 + i * 1.2), .03, 62 + i * 3); } gliss(L(16, 6.2), [74, 78, 81, 86], .07, .03, steelpan);
creak(L(17, 2.6), 4.2, .03); corkPop(L(17, 6.8), .1); slide(L(17, 6.85), 84, 62, .6, .03); thwack(L(17, 7.55), .07);
ding(L(18, .4), 81, .04); for (let i = 0; i < 6; i++) tick(L(18, 2.2 + i * .22), .03); ding(L(18, 3.6), 86, .035); [6.3, 7.0, 7.7].forEach((d, i) => ding(L(18, d), [81, 86, 90][i], .045));
whoosh(L(19, -1.2), .6, .05);
// D1: breaths; CO₂ puffs; the snail plods; into the red cell; water, pop, slide, THWACK; the shuttle; ping-pong; the rally; buried; seven dings; the big breath out
for (let i = 0; i < 3; i++) whoosh(L(19, .3 + i * 1.0), .8, .02); for (let i = 0; i < 6; i++) pop(L(19, 3.4 + i * .45), .03, 700 + i * 60);
for (let i = 0; i < 6; i++) bass(L(20, .7 + i * .6), 33 + (i % 2) * 2, .07, .4); whoosh(L(20, 4.1), .6, .05);
pop(L(21, .3), .04, 1500); corkPop(L(21, 1.4), .07); slide(L(21, 2.9), 72, 60, .9, .02); thwack(L(21, 4.4), .1); whoosh(L(21, 6.4), .9, .03);
pop(L(22, .5), .04, 1500); zipS(L(22, 2.4), .03); zipS(L(22, 3.5), .03); ding(L(22, 4.6), 81, .03); knock(L(22, 6.3), .06);
for (let i = 0; i < 4; i++) tok(L(22, 7.0 + i * .9), .07, i % 2 ? .5 : -.5);
{ let t = L(23, .3), sp = 1; while (t < L(23, 5.3)) { const k = (t - L(23, 1.2)) / 3.8; sp = 1 + 6 * Math.pow(Math.max(0, Math.min(1, k)), 3); tok(t, .06, Math.sin(t * 7) * .6); t += .9 / (sp * 1.2); } }
clatter(L(23, 5.4), 14, .05); for (let i = 0; i < 12; i++) tok(L(23, 5.4 + i * .12), .04, (hash(i) - .5), 1400); slide(L(23, 6.2), 72, 52, .7, .02);
for (let i = 0; i < 7; i++) ding(L(24, .55 + i * .55), 74 + [0, 2, 4, 7, 9, 12, 14][i], .03);
for (let i = 0; i < 3; i++) tok(L(25, 1.2 + i * .8), .05, i % 2 ? .5 : -.5); whoosh(L(25, 4.2), 2.2, .09); slide(L(25, 5.45), 86, 60, .7, .03); thwack(L(25, 6.15), .06);
whoosh(L(26, -.8), .5, .06);
// D2: organs pop; the wind; the pill; the climb; the 300; the squirt; snips; the liver; the scrape; the drawers; the medal
for (let i = 0; i < 3; i++) pop(L(26, 2.4 + i * .5), .05, 1000 + i * 150); whoosh(L(26, 5.4), 5.5, .025); gulp(L(26, 7.3), .05); for (let i = 0; i < 7; i++) knock(L(26, 8.2 + i * .45), .03);
for (let i = 0; i < 24; i++) pizz(L(27, .3 + i * .1), 81 + (i % 6), .018, (i % 2) - .5); noiseBurst(L(27, 3.8), .5, .04, .4, .1);
for (const d of [5.4, 6.4, 7.4, 8.4]) { snip(L(27, d), .06); boing(L(27, d + .05), .02, 67); }
knock(L(28, .3), .05); zipS(L(28, 2.6), .03); for (let i = 0; i < 6; i++) snip(L(28, 5.2 + i * .7), .035);
for (let i = 0; i < 6; i++) knock(L(29, .45 + i * .4), .04); for (let i = 0; i < 6; i++) ding(L(29, 3.7 + i * .3), 81 + i * 2, .025); gliss(L(29, 6.0), [74, 78, 81, 86, 90], .07, .035, steelpan);
whoosh(L(30, -1.0), .6, .05);
// E1: tent; SOD; copper's flips; the pull and the sag; the spring back; the frog; nine loops; the fold; floppy, slide, snap, pinch, grip
pop(L(30, .4), .05); pop(L(30, 4.0), .05, 700); for (let i = 0; i < 5; i++) zap(L(30, 7.2 + i * .6), .015);
pop(L(31, 3.5), .07, 1300); wahwah(L(31, 3.8), .03); boing(L(31, 5.8), .06, 64);
ribbit(L(32, .5), .05); for (let i = 0; i < 9; i++) musicBox(L(32, 7.8 + i * .26), 81 + [0, 2, 4, 5, 7, 9, 11, 12, 14][i], .025);
knock(L(33, 2.1), .05); slide(L(33, 2.3), 67, 79, 4.0, .012); boing(L(33, 8.3), .04, 70); boing(L(33, 8.8), .03, 74);
wahwah(L(34, .3), .025); slide(L(34, 2.85), 80, 62, .6, .03); for (let i = 0; i < 5; i++) tick(L(34, 3.95 + i * .06), .04); snap(L(34, 4.3), .08); squeak(L(34, 4.75), .05); slide(L(34, 4.8), 79, 86, .25, .03); tick(L(34, 6.1), .05);
// E2: the slide along the DNA; the stop; the door; 70 pops; the hormone docks; hammering; walk; snip; zip; the roll-in; the parcel; the pump
for (let i = 0; i < 16; i++) tick(L(35, .6 + i * .3), .025); ding(L(35, 5.4), 86, .04); creak(L(35, 6.8), .8, .02); gliss(L(35, 7.2), [81, 86, 90], .08, .03);
for (let i = 0; i < 20; i++) pizz(L(36, .3 + i * .1), 79 + (i % 4) * 2, .015, (i % 2) - .5); slide(L(36, 6.2), 74, 81, 1.0, .02); tick(L(36, 7.4), .05); snap(L(36, 8.7), .05);
for (let i = 0; i < 4; i++) { clang(L(37, .4 + i * .55), .025, 880); knock(L(37, .4 + i * .55), .04); } for (let i = 0; i < 4; i++) knock(L(37, 3.0 + i * .4), .03);
snip(L(37, 5.0), .07); for (let i = 0; i < 4; i++) snip(L(37, 5.6 + i * .2), .04); zipS(L(37, 6.3), .06); for (let i = 0; i < 8; i++) knock(L(37, 7.7 + i * .18), .025);
gliss(L(38, 4.2), [74, 78, 81, 86, 90, 93], .25, .025, vibes); tapeRip(L(38, 6.7), .04); whoosh(L(38, 7.8), .9, .05);
for (let i = 0; i < 6; i++) noiseBurst(L(39, .5 + i * .45), .08, .025, .6, .2); knock(L(39, 3.6), .06); slide(L(39, 4.4), 60, 67, 1.8, .015);
// F1: pops; the sweep; found; shh; the puff and the jump; the brain; the release; the rise; the whistle; the egg
for (let i = 0; i < 12; i++) pizz(L(40, 2.6 + i * .08), 86 + (i % 3) * 2, .015, (i % 2) - .5); whoosh(L(40, 5.8), 3.4, .015); ding(L(40, 9.3), 93, .04);
for (let i = 0; i < 3; i++) shush(L(41, .7 + i * 1.2), .9, .025); pop(L(41, 4.4), .07, 1400); gliss(L(41, 4.42), [90, 93, 98], .04, .03); slide(L(41, 4.5), 74, 93, .25, .04);
gliss(L(42, .5), [74, 81, 86], .3, .02, vibes); for (let i = 0; i < 3; i++) { pop(L(42, 6.3 + i * .15), .04, 1500); crackle(L(42, 6.4 + i * .15), .6, .015); }
gliss(L(43, 1.8), [62, 66, 69, 74, 78, 81], .35, .02, vibes); whistle(L(43, 4.6), 93, .6, .04, 2); boing(L(43, 4.8), .05, 60);
crackle(L(44, .5), 2.6, .02); for (let i = 0; i < 3; i++) musicBox(L(44, 4.8 + i * .5), [81, 86, 90][i], .03);
// R1: panels and icons
[2.3, 5.4, 8.4].forEach((d, i) => vibes(L(45, d), [74, 78, 81][i], .03)); [3.7, 4.7, 5.5].forEach((d, i) => ding(L(46, d), [81, 86, 90][i], .035));
// G1: slip; marbles; flown ions; the shoo; grinding; the sick cell; the padlock; the sponge; the squeeze; doors; the slam; the bell; genes; the loop; calm
slide(L(47, 1.0), 74, 62, .3, .03); thwack(L(47, 1.6), .07); marbles(L(47, 1.2), 2.0, .05); for (let i = 0; i < 4; i++) zipS(L(47, 3.0 + i * .5), .02);
for (let i = 0; i < 8; i++) knock(L(47, 5.5 + i * .25), .03);
for (let i = 0; i < 18; i++) tick(L(48, .5 + i * .2), .025, (i % 3) - 1); creak(L(48, .6), 3.4, .02); wahwah(L(48, 5.0), .025); tick(L(48, 8.45), .06); knock(L(48, 8.55), .06);
squish(L(49, 1.3), .06); for (let i = 0; i < 7; i++) musicBox(L(49, 6.2 + i * .45), 81 + i, .02);
slide(L(50, 2.8), 72, 70, 1.6, .01); zap(L(50, 4.7), .02); squish(L(50, 6.0), .05); squish(L(50, 6.8), .08); marbles(L(50, 6.85), .7, .05);
for (let i = 0; i < 24; i++) tick(L(51, 2.4 + i * .1), .02, (i % 2) - .5); slam(L(51, 8.6), .14); boing(L(51, 9.8), .05, 55);
noiseBurst(L(52, 5.8), .8, .04, .3, .1); bellAlarm(L(52, 5.9), 2.2, .02); snap(L(52, 6.5), .05); for (let i = 0; i < 4; i++) pop(L(52, 8.6 + i * .4), .04, 900 + i * 100); gliss(L(52, 8.2), [81, 86, 90], .1, .03);
gliss(L(53, .5), [90, 86, 81, 78], .2, .025); whoosh(L(53, 4.8), 1.6, .03); vibes(L(54, 1.0), 74, .03, 0, 3); vibes(L(54, 1.1), 78, .025, 0, 3);
whoosh(L(55, -1.0), .6, .05);
// H1: the warehouse; the shed; the days; the sea; the oyster snaps; the parade; phytate; stuck; yeast; mantou; the ribbon
pop(L(55, 1.9), .05); for (let i = 0; i < 12; i++) musicBox(L(55, 4.4 + i * .13), 74 + (i % 4), .012); knock(L(55, 3.9), .07);
for (let i = 0; i < 4; i++) { tick(L(55, 6.2 + i * .7), .03); musicBox(L(55, 6.6 + i * .7), 86, .02); }
whoosh(L(56, 2.6), .5, .05); snap(L(56, 5.3), .1); slide(L(56, 5.35), 81, 88, .2, .04); for (let i = 0; i < 6; i++) boing(L(56, 5.6 + i * .3), .02, 70 - i);
for (let i = 0; i < 4; i++) { whoosh(L(56, 7.6 + i * .55), .35, .03); pop(L(56, 7.9 + i * .55), .04, 800 + i * 120); }
for (let i = 0; i < 3; i++) pop(L(57, .4 + i * .2), .03, 1100); pop(L(57, 2.1), .05, 700); slurp(L(57, 3.4), .04); creak(L(57, 5.6), 1.0, .03); slurp(L(57, 6.6), .06); wahwah(L(57, 7.6), .02);
for (let i = 0; i < 5; i++) crunch(L(58, 1.9 + i * .35), .05); ding(L(58, 3.6), 86, .04); slide(L(58, 4.0), 62, 79, 2.8, .015);
for (let i = 0; i < 5; i++) tick(L(59, .3 + i * .32), .02); noiseBurst(L(59, 4.6), .6, .02, .5, .2); ding(L(59, 5.9), 90, .04);
// I1: gentle (no gags): a mould, a rat, the question; the check; the days; the child growing
pop(L(60, 3.0), .02, 600); squeak(L(60, 6.7), .02); slide(L(60, 9.5), 74, 79, .4, .015);
gliss(L(63, 5.6), [62, 66, 69, 74, 78], .5, .02, vibes); vibes(L(63, 10.0), 78, .035, 0, 3); vibes(L(63, 10.05), 81, .03, 0, 3);
for (let i = 0; i < 10; i++) musicBox(L(66, 5.3 + i * .2), 86 + (i % 2) * 2, .012); gliss(L(68, 8.6), [62, 66, 69, 74, 78, 81], .3, .022, vibes);
// I2: munching; deadpan; the taste bud; FIRE
for (let i = 0; i < 6; i++) crunch(L(69, 1.0 + i * .35), .06); tick(L(69, 3.0), .03); for (let i = 0; i < 4; i++) musicBox(L(69, 5.2 + i * .5), 86 + i * 2, .015);
fireRoar(L(69, 8.2), 2.4, .07); slide(L(69, 8.2), 74, 98, .3, .04); boom(L(69, 8.2), .07); whoosh(L(70, -1.2), .6, .05);
// J1: gulp; munch; the freeze; sponges; the squeeze; shed; wah-wah; tingles; chatter; the splat; overflow; the wall; welding; shivers; the hammock; Monday; psst
gulp(L(70, .4), .06); for (let i = 0; i < 5; i++) crunch(L(70, .8 + i * .35), .04); scratch(L(70, 2.75), .06);
for (let i = 0; i < 5; i++) squish(L(70, 4.8 + i * .6), .03); squeak(L(70, 9.0), .04); squeak(L(70, 9.4), .04);
slide(L(71, 2.3), 79, 55, 2.6, .025); knock(L(71, 5.0), .05); wahwah(L(71, 7.0), .035);
for (let i = 0; i < 20; i++) tick(L(72, 3.4 + i * .13), .015, (hash(i) - .5)); chatter(L(72, 6.0), 1.6, .02); noiseBurst(L(72, 7.1), .5, .04, .3, .6); splat(L(72, 7.6), .12);
clatter(L(73, 1.8), 8, .03); for (let i = 0; i < 10; i++) tick(L(73, 4.3 + i * .34), .04); for (let i = 0; i < 3; i++) knock(L(73, 6.1 + i * .5), .04);
sizzle(L(74, 1.2), 4.2, .03); for (let i = 0; i < 10; i++) zap(L(74, 1.3 + i * .4), .012); chatter(L(74, 5.8), 2.8, .03);
for (let i = 0; i < 7; i++) ding(L(75, 3.0 + i * .4), 86 - i * 2, .02); chatter(L(75, 3.0), 2.4, .015); creak(L(75, 5.7), 1.6, .015); boing(L(75, 7.4), .06, 70); chatter(L(75, 7.6), 2.0, .035);
creak(L(76, .5), 3.6, .015); noiseBurst(L(76, 4.6), .4, .03, .8, .6); slide(L(76, 6.6), 74, 67, .6, .015);
for (let i = 0; i < 4; i++) musicBox(L(77, 1.2 + i * .6), 74 + i * 3, .025); clang(L(77, 3.7), .03, 440); gliss(L(77, 4.6), [86, 90, 93], .1, .02, vibes);
// R2: icons and the window
[1.6, 2.4, 3.2, 5.3, 6.3].forEach((d, i) => vibes(L(78, d), [74, 78, 81, 71, 69][i], .025)); gliss(L(78, 7.6), [81, 86, 90, 93], .12, .03);
// K1: the shell; the grid and the lit ten; three vignettes; icons; the ball; the match cut; fireworks; the shutter; the photo; the poof; the wink
gliss(L(79, .5), [74, 78, 81], .3, .02, vibes); for (let i = 0; i < 20; i++) pizz(L(79, 3.2 + i * .06), 81 + (i % 5), .012, (i % 2) - .5); for (let i = 0; i < 10; i++) musicBox(L(79, 5.6 + i * .25), 74 + [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][i], .025);
[0, 1.1, 2.2].forEach((d, i) => vibes(L(80, d), [78, 81, 86][i], .035)); [3.4, 3.65, 3.9].forEach((d, i) => ding(L(80, d), [81, 86, 90][i], .035));
{ let t = L(81, .1), gap = .5; while (t < L(81, 2.4)) { tok(t, .06, 0); t += gap; gap = Math.max(.12, gap * .85); } }
whoosh(L(81, 2.4), .5, .05); vibes(L(81, 2.6), 86, .04); for (let i = 0; i < 4; i++) firework(L(81, 5.6 + i * 1.6), .05);
shutter(L(81, 6.2), .08); pop(L(81, 6.22), .06, 1500); whirr(L(81, 6.3), .5, .02); noiseBurst(L(81, 7.3), .15, .05, .6, .2); pop(L(81, 7.32), .05, 500); ding(L(81, 8.3), 93, .04);

// ---------- reverb, ducking, the mix: streamed in place (from audio/music_selenium.mjs) ----------
function readVo(p) { const b = readFileSync(p); let o = 12; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') return new Int16Array(b.buffer, b.byteOffset + o + 8, n / 2); o += 8 + n; } }
const vo = readVo('assets/zinc_vo.wav'), voAt = n => n < vo.length ? vo[n] / 32768 : 0;
function verbState(off) { return { combs: [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 })), aps: [589 + off, 467 + off].map(d => ({ d, b: new Float32Array(d), i: 0 })) }; }
function verbStep(V, x) { let y = 0; for (const c of V.combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } y /= 4;
  for (const a of V.aps) { const v = a.b[a.i], u = y + v * .5; a.b[a.i] = u; y = v - u * .5; a.i = (a.i + 1) % a.d; } return y; }
const VL = verbState(0), VR = verbState(29), CUT0 = Math.floor(9.55 * SR), CUT1 = Math.floor(10.0 * SR), OPEN = CUT0;
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const wl = verbStep(VL, Lc[n]), wr = verbStep(VR, Rc[n]);
  const a = Math.abs(voAt(n)); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00003);
  const t = n / SR, fade = Math.min(1, t / .15) * Math.min(1, (DUR - t) / 1.0), g = fade * (1 - .5 * duck);
  const cut = n > CUT0 && n < CUT1 ? 0 : 1;                       // the record scratch stops everything dead, reverb too
  const hot = n < OPEN ? 1.7 : 1;                                 // the wordless hot open plays louder (and is left out of the peak)
  Lc[n] = (Lc[n] + wl * .3) * g * cut * hot; Rc[n] = (Rc[n] + wr * .3) * g * cut * hot; if (n >= OPEN) peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n]));
}
function writeWav(path, l, r, gain) {                            // 16-bit stereo, written in chunks
  const fd = openSync(path, 'w'), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + N * 4, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(N * 4, 40); writeSync(fd, h);
  const CH_ = 1 << 16, buf = Buffer.alloc(CH_ * 4);
  for (let s = 0; s < N; s += CH_) { const m = Math.min(CH_, N - s); for (let k = 0; k < m; k++) { buf.writeInt16LE(Math.round(Math.tanh(l(s + k) * gain) * 32767), k * 4); buf.writeInt16LE(Math.round(Math.tanh(r(s + k) * gain) * 32767), k * 4 + 2); } writeSync(fd, buf, 0, m * 4); }
  closeSync(fd);
}
const MUSIC = .14 / peak;
writeWav('assets/zinc_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/zinc_mix.wav', n => Lc[n] * MUSIC + voAt(n) * 1.05, n => Rc[n] * MUSIC + voAt(n) * 1.05, 1);
console.log(`wrote assets/zinc_bgm.wav and assets/zinc_mix.wav (${DUR} s, peak ${peak.toFixed(3)})`);

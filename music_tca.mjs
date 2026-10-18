// music_tca.mjs: the score for "Pip讲三羧酸循环" (src/scenes/tca.js), synthesised from scratch.
//   node make.mjs tca vo && node make.mjs tca music   → assets/tca_bgm.wav and assets/tca_mix.wav
// Its own palette (not the kalimba/glock/pizz of mRNA and opto, nor meiosis's e-piano/marimba/harp/flute): a soft
// vibraphone, a nylon-string guitar (Karplus–Strong), a music box that carries the cycle's motif, a breathy clarinet, a
// plucked upright bass, a shaker, and a woodblock for clicks. F major, 90 bpm = PROJECT.bpm.
// The motif is the wheel: eight notes, one per intermediate (oxaloacetate → citrate → … → malate), and it comes back to
// where it started. It plays as the wheel is drawn, one note as the molecule reaches each station, as a light runs once
// round it, faster on the quick lap, on the recap, when the cycle is pieced together in 1937, and once more at the end.
// Each section follows a voice line (times read from videos/tca.json, like the scenes' L(i, d)); the music ducks under
// the voice and breathes up in the gaps.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const MAN = JSON.parse(readFileSync('videos/tca.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const Lc = new Float32Array(N), Rc = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 31; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); Lc[i0 + i] += v * gl; Rc[i0 + i] += v * gr; }
}
const env = (tt, a, d) => (tt < a ? tt / a : Math.exp(-(tt - a) / d));
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- instruments ----------
const vibes = (t, m, v = .05, pan = 0, dec = 1.6) => { const f = hz(m); add(t, dec * 3, pan, tt => v * env(tt, .004, dec) * (1 + .35 * Math.sin(TAU * 5.2 * tt)) * (Math.sin(TAU * f * tt) + .18 * Math.sin(TAU * 4 * f * tt) * Math.exp(-tt * 6))); };
function guitar(t, m, v = .07, pan = 0, dec = .994) {               // nylon string: a Karplus–Strong pluck, darker than a harp
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); let lp0 = 0;
  for (let i = 0; i < P; i++) { lp0 += ((rnd() * 2 - 1) - lp0) * .5; buf[i] = lp0; }
  let i = 0, prev = 0; add(t, 2.6, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = dec * .5 * (a + b); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .35; return v * prev * Math.min(1, tt / .003); });
}
const box = (t, m, v = .045, pan = 0) => { const f = hz(m); add(t, 1.8, pan, tt => v * Math.exp(-tt * 3.2) * (Math.sin(TAU * f * tt) + .35 * Math.sin(TAU * f * 2.76 * tt) * Math.exp(-tt * 9) + .12 * Math.sin(TAU * f * 5.4 * tt) * Math.exp(-tt * 20))); };
const glock = (t, m, v = .045, pan = 0) => { const f = hz(m); add(t, 2.2, pan, tt => v * Math.exp(-tt * 2.2) * (Math.sin(TAU * f * tt) + .4 * Math.sin(TAU * f * 3.01 * tt) * Math.exp(-tt * 8))); };
function clarinet(t, m, len, v = .04, pan = -.15) {
  const f = hz(m); let lp = 0;
  add(t, len + .35, pan, tt => { const a = Math.min(1, tt / .07) * (tt > len ? Math.exp(-(tt - len) / .12) : 1), vib = 1 + .0045 * Math.sin(TAU * 5 * tt) * Math.min(1, tt / .5), ph = TAU * f * vib * tt;
    lp += ((rnd() * 2 - 1) - lp) * .08; return v * a * (Math.sin(ph) + .33 * Math.sin(3 * ph) + .14 * Math.sin(5 * ph) + .06 * Math.sin(7 * ph) + .2 * lp); });
}
const ubass = (t, m, v = .12, len = BEAT * 1.6) => { const f = hz(m); add(t, len + .4, 0, tt => { const e = Math.min(1, tt / .008) * Math.exp(-tt / .7) * (tt > len ? Math.exp(-(tt - len) / .1) : 1), g = f * (1 + .02 * Math.exp(-tt * 30)); return v * e * (Math.sin(TAU * g * tt) + .3 * Math.sin(TAU * 2 * g * tt) * Math.exp(-tt * 4)); }); };
const pad = (t, len, ms, v = .02) => ms.forEach((m, j) => { for (const det of [-.07, .07]) { const f = hz(m + det), ph = rnd();
  add(t, len + 1.2, (j / (ms.length - 1 || 1)) * 1.2 - .6, tt => { const a = Math.min(1, tt / 1.0) * (tt > len ? Math.exp(-(tt - len) / .5) : 1), x = (f * tt + ph) % 1;
    return v * a * (1 - 4 * Math.abs(x - .5)) * .8; }); } });
const shaker = (t, v = .022, pan = .3) => { let hp = 0, last = 0; add(t, .12, pan, tt => { const x = rnd() * 2 - 1; hp = .7 * (hp + x - last); last = x; return v * hp * env(tt, .01, .03); }); };
const block = (t, v = .06, m = 84) => { const f = hz(m); add(t, .12, -.15, tt => v * Math.sin(TAU * f * tt) * Math.exp(-tt * 45) + v * .4 * Math.sin(TAU * f * 2.3 * tt) * Math.exp(-tt * 70)); };
const kick = (t, v = .16) => add(t, .5, 0, tt => v * Math.sin(TAU * (55 + 70 * Math.exp(-tt * 20)) * tt) * Math.exp(-tt * 6));
const drip = (t, v = .05) => add(t, .3, .1, tt => v * Math.sin(TAU * (900 - 500 * Math.min(1, tt / .08)) * tt) * Math.exp(-tt * 18));
function slide(t, m0, m1, len, v = .035, pan = .2) { let ph = 0; add(t, len + .2, pan, tt => { const k = Math.min(1, tt / len), f = hz(lerp(m0, m1, k * k * (3 - 2 * k))); ph += f / SR; return v * Math.sin(TAU * ph) * Math.min(1, tt / .02) * (tt > len ? Math.exp(-(tt - len) / .06) : 1) * (1 - .5 * k); }); }
function whoosh(t, len, v = .07) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const lerp = (a, b, k) => a + (b - a) * k;
function arp(t, ms, step = .07, v = .04, inst = box) { ms.forEach((m, i) => inst(t + i * step, m, v, (i / ms.length) - .5)); }

// ---------- harmony ----------
const CH = { F: [65, 69, 72, 77], Fmaj7: [65, 69, 72, 76], Dm: [62, 65, 69, 74], Dm7: [62, 65, 69, 72], Bb: [58, 65, 70, 74], Bbmaj7: [58, 65, 69, 74], C: [60, 64, 67, 72], Csus: [60, 65, 67, 72],
  Am: [57, 64, 69, 72], Gm: [55, 62, 67, 70], Gm7: [55, 62, 65, 70], A: [57, 64, 69, 73], Eb: [58, 63, 67, 70] };
const ROOT = { F: 41, Fmaj7: 41, Dm: 38, Dm7: 38, Bb: 46, Bbmaj7: 46, C: 36, Csus: 36, Am: 45, Gm: 43, Gm7: 43, A: 45, Eb: 39 };
// a chord section: pad; guitar arpeggio (or none); bass ('one' | 'walk' | 'pulse'); shaker; vibes comping
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    pad(t, len, ch, st.pad ?? .018);
    if (st.vib) { vibes(t, ch[1] + 12, st.vib, -.3, 1.8); vibes(t + BEAT * 2, ch[2] + 12, st.vib * .8, .3, 1.6); }
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) ubass(tb, r, .11, BEAT * 3);
      if (st.bass === 'pulse' && b % 2 === 0) ubass(tb, r, .1);
      if (st.bass === 'walk') ubass(tb, r + [0, 7, 12, 7][b], .09, BEAT * .85);
      if (st.shk) { shaker(tb + BEAT / 2, st.shk); if (st.sixteen) { shaker(tb + BEAT / 4, st.shk * .5, -.3); shaker(tb + BEAT * 3 / 4, st.shk * .5, -.3); } }
      if (st.gtr) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.eighth === false ? 1 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + (st.oct ?? 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          guitar(tb + e * BEAT / per, m, (st.gtr) * (e ? .8 : 1), ((i % 4) - 1.5) * .22); }
      }
    }
  }
}
// the cycle's motif: one note per station, oxaloacetate first; it rises and comes back round
const MOTIF = [72, 74, 77, 81, 84, 81, 77, 74];
const motif = (t, step = .2, v = .045, tr = 0) => MOTIF.forEach((m, i) => box(t + i * step, m + tr, v, (i / 8) - .5));

// A: breakfast — warm, curious; then the question; then the idea
section(0, Lx(2, 0), ['F', 'Dm', 'Bb', 'C'], { pad: .018, vib: .025, gtr: .05, bass: 'one', skip: .3 });
section(Lx(2, 0), Lx(3, -.8), ['Dm', 'Bb', 'Gm', 'C'], { pad: .02, vib: .025, gtr: .045, bass: 'one', skip: .45 });
// B: the cytoplasm — a light groove
section(Lx(3, -.8), Lx(4, 1.9), ['F', 'C', 'Dm', 'Bb'], { pad: .018, gtr: .05, bass: 'pulse', shk: .018 });
clarinet(Lx(3, .3), 72, BEAT * 1.5, .03); clarinet(Lx(3, 1.4), 74, BEAT, .03); clarinet(Lx(3, 2.2), 77, BEAT * 2.5, .03);
// C: the cycle — a steady groove; each line its own chords
const CS = [[Lx(4, 1.9), Lx(5, -.4), ['Bb', 'C', 'F', 'F'], { gtr: .045, bass: 'one', shk: .015 }],
  [Lx(5, -.4), Lx(6, 0), ['F', 'Am', 'Bb', 'C'], { gtr: .045, bass: 'pulse', shk: .016, vib: .02 }],
  [Lx(6, 0), Lx(7, 0), ['Dm', 'Bb', 'F', 'C'], { gtr: .045, bass: 'pulse', shk: .016 }],
  [Lx(7, 0), Lx(8, 0), ['Gm', 'C', 'F', 'Dm'], { gtr: .045, bass: 'walk', shk: .018, sixteen: true, skip: .2 }],
  [Lx(8, 0), Lx(9, 0), ['Bb', 'C', 'Am', 'Dm'], { gtr: .045, bass: 'pulse', shk: .016, vib: .02 }],
  [Lx(9, 0), Lx(10, 0), ['F', 'Dm', 'Gm', 'C'], { gtr: .045, bass: 'pulse', shk: .016 }],
  [Lx(10, 0), Lx(11, 0), ['Bb', 'C', 'F', 'F'], { gtr: .045, bass: 'walk', shk: .018, sixteen: true, skip: .2 }],
  [Lx(11, 0), Lx(12, -1.2), ['F', 'C', 'Dm', 'Bb'], { gtr: .05, bass: 'walk', shk: .02, sixteen: true, vib: .025 }]];
CS.forEach(([a, b, p, s]) => section(a, b, p, { pad: .017, ...s }));
// D: the tally — gentle, counting; then the secret
section(Lx(12, -1.2), Lx(13, 0), ['Fmaj7', 'Bbmaj7', 'Fmaj7', 'Bbmaj7'], { pad: .02, vib: .025, bass: 'one' });
section(Lx(13, 0), Lx(14, 0), ['Dm', 'Bb', 'F', 'C'], { pad: .018, gtr: .04, bass: 'pulse', shk: .014 });
section(Lx(14, 0), Lx(15, -1.0), ['Gm7', 'C', 'Am', 'Dm'], { pad: .02, gtr: .035, bass: 'one', skip: .5, eighth: false });
// E: where the energy goes — brighter, a pulse; then the oxygen is gone: everything thins to a low drone; then back
section(Lx(15, -1.0), Lx(16, 0), ['Dm', 'Bb', 'C', 'Am'], { pad: .018, gtr: .045, bass: 'pulse', shk: .016 });
section(Lx(16, 0), Lx(17, 0), ['F', 'C', 'Bb', 'F'], { pad: .018, gtr: .05, bass: 'walk', shk: .02, sixteen: true, vib: .02 });
section(Lx(17, 0), Lx(17, 4.8), ['F', 'Dm'], { pad: .018, gtr: .04, bass: 'pulse', shk: .015 });
pad(Lx(17, 4.8), 7.0, [50, 57, 62], .03); ubass(Lx(17, 4.9), 38, .1, 3); ubass(Lx(17, 8.0), 38, .08, 3);
section(Lx(17, 11.8), Lx(18, -1.0), ['F', 'C'], { pad: .02, gtr: .05, bass: 'pulse', shk: .018 });
// F: 1937 — a music-box waltz feel; the rejection; sixteen years; the Nobel; the hub
section(Lx(18, -1.0), Lx(18, 8.6), ['F', 'Dm', 'Gm', 'C'], { pad: .016, gtr: .04, bass: 'one', skip: .25 });
pad(Lx(18, 8.6), 2.4, CH.Dm, .022); clarinet(Lx(18, 9.2), 69, BEAT * 1.2, .03); clarinet(Lx(18, 10.0), 68, BEAT * 1.6, .028);
section(Lx(19, 0), Lx(19, 5.3), ['Bb', 'C'], { pad: .018, gtr: .045, bass: 'pulse', shk: .02, sixteen: true });
section(Lx(19, 5.3), Lx(20, -1.3), ['F', 'C', 'Dm', 'Bb'], { pad: .02, gtr: .05, bass: 'walk', shk: .02, vib: .025 });
// G: home — warm, the motif lands
section(Lx(20, -1.3), DUR - 3.4, ['F', 'Bb', 'F', 'C'], { pad: .02, gtr: .045, bass: 'one', vib: .022, skip: .2 });
pad(DUR - 3.4, 2.8, CH.Fmaj7, .022); vibes(DUR - 3.4, 77, .04, -.2, 2.2); vibes(DUR - 3.38, 81, .03, .2, 2.2); ubass(DUR - 3.4, 41, .1, 2.6);

// ---------- the motif ----------
motif(Lx(4, 10.4), .19, .04);                                                    // the wheel paints itself in
const ARR = [Lx(5, -.4), Lx(5, 6.0), Lx(6, 3.8), Lx(7, 1.0), Lx(7, 13.3), Lx(8, 12.3), Lx(9, 11.0), Lx(10, 4.0), Lx(10, 11.0)];
ARR.forEach((t, i) => box(t, MOTIF[i % 8] + (i === 8 ? 12 : 0), .05));           // one note as each station is reached
motif(Lx(11, 1.0), .2, .05);                                                     // a light runs once round
motif(Lx(11, 6.5), .2, .04); motif(Lx(11, 8.1), .2, .04, 12);                   // the quick lap
motif(Lx(13, 4.3), .16, .035);                                                   // two wheels turn
motif(Lx(18, 4.0), .14, .045);                                                   // 1937: the circle pieced together
motif(Lx(19, 9.4), .2, .04);                                                     // the hub
motif(Lx(20, 8.6), .22, .04); box(DUR - 2.4, 77, .045); box(DUR - 2.2, 84, .04); // the cells' wheels; the end

// ---------- stingers on the picture ----------
guitar(.2, 65, .05); guitar(.35, 69, .05); guitar(.5, 72, .05);                  // iris in
whoosh(Lx(1, .75), 1.3, .045); for (let i = 0; i < 6; i++) box(Lx(1, 1.3) + i * .09, 84 + (i % 3) * 3, .02);   // the breath, CO₂ tumbling in it
vibes(Lx(1, 2.6), 77, .03);
glock(Lx(1, 4.6), 84, .045); glock(Lx(1, 4.75), 89, .035);                      // the carbon turns gold
for (let i = 0; i < 8; i++) box(Lx(1, 5.5) + i * .18, 72 + i * 2, .025);        // the trail back to the bun
for (let i = 0; i < 9; i++) glock(Lx(1, 6.95) + i * .16, [84, 86, 88, 89, 91, 93, 89, 91, 96][i], .018, (i % 3 - 1) * .5);   // carbons in the bun
for (let i = 0; i < 4; i++) slide(Lx(2, 2.1) + i * .55, 72, 84, .5, .02);       // taken apart, one by one
vibes(Lx(2, 5.8), 74, .035); vibes(Lx(2, 6.1), 77, .035);                       // the thought, the mitochondrion
arp(Lx(2, 10.9), [77, 81, 84, 89], .07, .035, glock);                           // 三羧酸循环!
whoosh(Lx(3, -2.0), 1.3, .06);                                                  // push into the bun
block(Lx(3, .4), .04); block(Lx(3, 4.2), .035);
slide(Lx(3, 5.6), 70, 74, .8, .025);                                            // the ring unrolls
kick(Lx(3, 7.3), .12); block(Lx(3, 7.35), .06, 79);                             // snap
glock(Lx(3, 8.25), 84, .035); glock(Lx(3, 8.4), 81, .03);                      // two pyruvates
whoosh(Lx(4, .4), 1.6, .07);                                                    // into the mitochondrion
block(Lx(4, 3.2), .06); slide(Lx(4, 3.3), 72, 86, .9, .025);                   // CO₂ off
box(Lx(4, 5.4), 81, .03); box(Lx(4, 5.7), 84, .03);
block(Lx(4, 7.7), .06, 88); glock(Lx(4, 7.75), 89, .035);                      // CoA hooks on
vibes(Lx(5, 2.8), 74, .03);
kick(Lx(5, 4.5), .1); arp(Lx(5, 4.55), [65, 72, 77, 81], .05, .03, glock);     // citrate
for (let j = 0; j < 3; j++) block(Lx(5, 8.5) + j * .5, .055, 79 + j * 3);       // one, two, three carboxyls
arp(Lx(5, 10.6), [84, 88, 91, 96], .08, .025, glock);
slide(Lx(6, 1.6), 74, 79, .7, .02);                                            // the OH hops
block(Lx(6, 6.6), .06); slide(Lx(6, 6.7), 72, 86, .9, .025);                   // CO₂
guitar(Lx(6, 8.9), 60, .04); guitar(Lx(6, 8.95), 64, .04);                     // NAD⁺ swims in
block(Lx(6, 10.0), .03, 96); block(Lx(6, 10.18), .03, 98);                     // two H
glock(Lx(6, 10.7), 84, .045); glock(Lx(6, 10.85), 88, .04);                    // NADH
block(Lx(7, 6.1), .06); slide(Lx(7, 6.2), 72, 86, .9, .025);
block(Lx(7, 8.7), .03, 96); block(Lx(7, 8.88), .03, 98); glock(Lx(7, 9.3), 84, .045); glock(Lx(7, 9.45), 88, .04);
block(Lx(7, 11.7), .055, 88);                                                  // CoA again
block(Lx(8, 2.0), .06, 91); slide(Lx(8, 2.05), 79, 67, .6, .02);               // CoA lets go
vibes(Lx(8, 3.0), 89, .025); glock(Lx(8, 5.6), 81, .045); glock(Lx(8, 5.75), 86, .04);   // GTP
block(Lx(8, 7.8), .04, 93); arp(Lx(8, 8.4), [77, 81, 84, 89], .06, .04, glock); // ATP
vibes(Lx(8, 9.4), 77, .035);
[6, 7, 0].forEach((i, j) => vibes(Lx(9, 3.9) + j * .6, MOTIF[i], .03));        // three steps to go
block(Lx(9, 8.7), .03, 96); block(Lx(9, 8.88), .03, 98); glock(Lx(9, 9.4), 81, .045); glock(Lx(9, 9.55), 84, .04);   // FADH₂
drip(Lx(10, 2.1), .05);                                                        // water
block(Lx(10, 7.3), .03, 96); block(Lx(10, 7.48), .03, 98); glock(Lx(10, 8.0), 84, .045); glock(Lx(10, 8.15), 88, .04);
arp(Lx(10, 11.1), [65, 69, 72, 77, 81], .06, .035, glock);                     // oxaloacetate, back again
kick(Lx(11, 5.4), .1); glock(Lx(11, 5.45), 84, .035);
slide(Lx(11, 7.5), 72, 84, .6, .015); slide(Lx(11, 7.9), 74, 86, .6, .015);
whoosh(Lx(12, -1.6), 1.0, .06);                                                // brush wipe
block(Lx(12, 2.9), .05, 79); block(Lx(12, 3.3), .05, 81);                      // two carbons in
[3.5, 3.9].forEach(d => slide(Lx(12, d), 72, 84, .6, .02));                    // two CO₂ out
for (let j = 0; j < 3; j++) vibes(Lx(12, 6.5) + j * .4, 77 + j * 2, .035);     // three NADH
vibes(Lx(12, 8.9), 84, .035); glock(Lx(12, 10.9), 89, .04);                    // FADH₂; the one ATP
clarinet(Lx(12, 11.5), 62, BEAT * 1.4, .025);                                  // only one?
block(Lx(13, .3), .04); kick(Lx(13, 1.2), .08); block(Lx(13, 1.25), .05, 79);
for (let j = 0; j < 6; j++) box(Lx(13, 7.4) + j * .22, 72 + [0, 2, 5, 9, 12, 14][j], .04);   // six CO₂, counted
clarinet(Lx(14, .4), 62, BEAT * 1.2, .03); clarinet(Lx(14, 1.2), 65, BEAT * .8, .028);        // a secret
block(Lx(14, 2.9), .05, 81); block(Lx(14, 3.9), .05, 83); vibes(Lx(14, 5.2), 77, .035);
kick(Lx(14, 8.6), .08); glock(Lx(14, 10.1), 89, .045); arp(Lx(14, 10.2), [84, 88, 91], .07, .03, glock);
whoosh(Lx(15, -1.4), .8, .08);                                                 // whip pan
for (let j = 0; j < 4; j++) glock(Lx(15, 4.0) + j * .4, 84 + j * 3, .025);     // loaded electrons twinkle
slide(Lx(15, 8.8), 62, 74, 1.2, .02);                                          // up to the membrane
block(Lx(16, .3), .05, 84);
for (let k = 0; k < 6; k++) { const t0 = Lx(16, .9) + k * 4.4; if (t0 > Lx(17, 5.4)) break; [0, .9, 1.9, 2.4, 3.4].forEach((d, j) => box(t0 + d, [84, 86, 88, 91, 93][j], .022)); drip(t0 + 4.3, .03); }   // electrons hop, O₂ → water
for (let i = 0; i < 16; i++) box(Lx(16, 7.6) + i * .2, [77, 81, 84, 81][i % 4] + (i > 7 ? 12 : 0), .022);   // ATP, ATP, ATP
arp(Lx(16, 9.2), [65, 69, 72, 77, 81, 84], .07, .03, glock);
slide(Lx(17, 4.8), 69, 57, 1.4, .025);                                          // the oxygen goes
for (let j = 0; j < 4; j++) block(Lx(17, 5.8) + j * .45, .035, 72 - j);         // jammed
kick(Lx(17, 11.0), .16); block(Lx(17, 11.02), .07, 60);                         // clunk
whoosh(Lx(17, 11.6), 1.2, .05); arp(Lx(17, 12.3), [65, 72, 77, 81], .06, .035, glock);   // back
whoosh(Lx(18, -1.4), 1.0, .06);                                                // brush wipe
for (let j = 0; j < 8; j++) shaker(Lx(18, .2) + j * .065, .02, -.5);          // wings
for (let j = 0; j < 6; j++) drip(Lx(18, 2.6) + j * .7, .018);                 // bubbles
arp(Lx(18, 5.6), [84, 88, 91, 96], .08, .025, glock);
whoosh(Lx(18, 7.2), .9, .05); whoosh(Lx(18, 8.2), .9, .05);
kick(Lx(18, 9.05), .14); block(Lx(18, 9.07), .06, 62);                          // rejected
for (let j = 0; j < 16; j++) shaker(Lx(19, .2) + j * .11, .02, (j % 2) - .5);  // sixteen pages
kick(Lx(19, 3.3), .1); arp(Lx(19, 3.3), [65, 69, 72, 77, 81, 84, 89], .06, .045, glock);   // the Nobel
whoosh(Lx(19, 4.4), 1.0, .06);                                                 // into the medal
for (let j = 0; j < 6; j++) glock(Lx(19, 9.6) + j * .12, 84 + (j % 3) * 4, .022);
whoosh(Lx(20, -1.6), 1.0, .06);                                                // brush wipe home
whoosh(Lx(20, 1.15), 1.3, .04);                                                // the breath
for (let j = 0; j < 7; j++) glock(Lx(20, 3.2) + j * .25, 84 + j * 2, .022);    // each CO₂ sparkles
for (let j = 0; j < 7; j++) box(Lx(20, 4.8) + j * .3, MOTIF[j % 8] + 12, .018);
vibes(Lx(20, 8.0), 77, .035); vibes(Lx(20, 8.1), 81, .03);                      // the lens
guitar(DUR - 2.6, 77, .045); guitar(DUR - 2.4, 72, .045); guitar(DUR - 2.2, 65, .055);   // iris out

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/tca_vo.wav');
const vl = verb(Lc, 0), vr = verb(Rc, 29);
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const a = Math.abs(vo[n] || 0); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00003);
  const t = n / SR, fade = Math.min(1, t / 1.0) * Math.min(1, (DUR - t) / 1.0), g = fade * (1 - .5 * duck);
  Lc[n] = (Lc[n] + vl[n] * .32) * g; Rc[n] = (Rc[n] + vr[n] * .32) * g; peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n]));
}
function writeWav(path, l, r, gain) {
  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(Math.tanh(l(n) * gain) * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(Math.tanh(r(n) * gain) * 32767), 46 + n * 4); }
  writeFileSync(path, buf);
}
const MUSIC = .175 / peak;
writeWav('assets/tca_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/tca_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/tca_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/tca_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/tca_mix_n.wav', 'assets/tca_mix.wav');
console.log('wrote assets/tca_bgm.wav and assets/tca_mix.wav');

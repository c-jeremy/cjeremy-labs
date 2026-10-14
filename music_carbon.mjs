// music_carbon.mjs: the score for "Pip讲植物吸收二氧化碳" (src/scenes/carbon.js), synthesised from scratch.
//   node make.mjs carbon vo && node make.mjs carbon music   → assets/carbon_bgm.wav and assets/carbon_mix.wav
// Its own palette (not the kalimba/glock/pizz of mRNA and opto, meiosis's e-piano/marimba/harp/flute, Mendel's guitar/
// music box/clarinet, nor variation's harpsichord/vibraphone): a bright double-course mandolin pluck (Karplus–Strong),
// a tongue drum, a soft vocal "ooh" pad, a warm sub bass, bongos, a glass ping for "it worked", water-drop plinks for
// every drop the leaf loses, and an ocarina that carries the recap motif. F major, 90 bpm = PROJECT.bpm; the flaw (Rubisco
// grabbing O₂) and the night turn to D minor. Each section follows a voice line (times read from videos/carbon.json, like
// the scenes' L(i, d)); the music ducks under the voice and breathes up in the long pauses between sections.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const MAN = JSON.parse(readFileSync('videos/carbon.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const Lc = new Float32Array(N), Rc = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 31; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); Lc[i0 + i] += v * gl; Rc[i0 + i] += v * gr; }
}
const env = (tt, a, d) => (tt < a ? tt / a : Math.exp(-(tt - a) / d));

// ---------- instruments ----------
function ks(t, f, v, pan, dec, bright, len = 1.8) {          // one Karplus–Strong string
  const P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); let s0 = 0; for (let i = 0; i < P; i++) { s0 += ((rnd() * 2 - 1) - s0) * bright; buf[i] = s0; }
  let i = 0; add(t, len, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = dec * (a * .55 + b * .45); buf[i] = y; i = (i + 1) % P; return v * a * Math.min(1, tt / .002); });
}
const mando = (t, m, v = .05, pan = 0) => { ks(t, hz(m), v, pan - .08, .9965, .85, 1.4); ks(t + .004, hz(m) * 1.003, v * .8, pan + .08, .9965, .85, 1.4); };   // a double course
const tongue = (t, m, v = .06, pan = 0) => { const f = hz(m); add(t, 1.8, pan, tt => v * env(tt, .004, .7) * (Math.sin(TAU * f * tt) + .28 * Math.sin(TAU * 2 * f * tt) * Math.exp(-tt * 3) + .1 * Math.sin(TAU * 3.01 * f * tt) * Math.exp(-tt * 6))); };
const glass = (t, m, v = .045, pan = 0) => { const f = hz(m); add(t, 2.4, pan, tt => v * env(tt, .002, .9) * (Math.sin(TAU * f * tt) + .35 * Math.sin(TAU * 2.76 * f * tt) * Math.exp(-tt * 4) + .12 * Math.sin(TAU * 5.4 * f * tt) * Math.exp(-tt * 9))); };
const plink = (t, m, v = .05, pan = 0) => { const f = hz(m); let ph = 0; add(t, .35, pan, tt => { ph += TAU * f * (1 + 1.2 * Math.exp(-tt * 45)) / SR; return v * env(tt, .001, .07) * Math.sin(ph); }); };
const bloop = (t, m, v = .05, pan = 0) => { const f = hz(m); let ph = 0; add(t, .4, pan, tt => { ph += TAU * f * (1 + 1.6 * tt * 6) / SR; return v * env(tt, .004, .09) * Math.sin(ph); }); };
const bass = (t, m, v = .12, len = BEAT * 1.8) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .015) * Math.exp(-tt / 1.5) * (tt > len ? Math.exp(-(tt - len) / .08) : 1);
  return v * e * Math.tanh(1.4 * (Math.sin(TAU * f * tt) + .2 * Math.sin(TAU * 2 * f * tt))); }); };
const ooh = (t, len, ms, v = .02) => ms.forEach((m, j) => { const f = hz(m), ph = rnd() * TAU, W = [1, .7, .55, .25, .12, .05];   // a vowel-ish stack of partials, slow vibrato
  add(t, len + 1.4, (j / (ms.length - 1 || 1)) * 1.2 - .6, tt => { const a = Math.min(1, tt / 1.0) * (tt > len ? Math.exp(-(tt - len) / .5) : 1), vib = 1 + .003 * Math.sin(TAU * 4.6 * tt + ph);
    let s = 0; for (let k = 0; k < 6; k++) s += W[k] * Math.sin(TAU * f * (k + 1) * vib * tt + ph * k); return v * a * s * .5; }); });
const bongo = (t, hi = 0, v = .1, pan = .3) => { const f0 = hi ? 330 : 230; let ph = 0; add(t, .3, pan, tt => { ph += TAU * f0 * (1 + .5 * Math.exp(-tt * 40)) / SR; return v * Math.exp(-tt * (hi ? 22 : 16)) * Math.sin(ph); }); };
const block = (t, v = .06) => { let lp = 0; add(t, .12, -.15, tt => { lp += ((rnd() * 2 - 1) - lp) * .5; return v * (Math.sin(TAU * 900 * tt) * .6 + lp * .5) * Math.exp(-tt * 55); }); };
const tick = (t, v = .035) => add(t, .05, .4, tt => v * Math.sin(TAU * 2600 * tt) * Math.exp(-tt * 90));
const thunk = (t, v = .14) => add(t, .5, 0, tt => v * Math.sin(TAU * (60 + 70 * Math.exp(-tt * 20)) * tt) * Math.exp(-tt * 8));
const crunch = (t, v = .06) => { let lp = 0; add(t, .25, .1, tt => { lp += ((rnd() * 2 - 1) - lp) * .7; return v * lp * (hash(Math.floor(tt * 80)) > .4 ? 1 : .2) * Math.exp(-tt * 12); }); };
const buzz = (t, v = .03) => add(t, .45, .2, tt => v * Math.sign(Math.sin(TAU * 110 * tt)) * .4 * env(tt, .01, .15));
function slide(t, m0, m1, len, v = .04, pan = 0) { let ph = 0; add(t, len, pan, tt => { const k = tt / len; ph += TAU * hz(lerp(m0, m1, k)) / SR; return v * Math.sin(k * Math.PI) * (Math.sin(ph) + .2 * Math.sin(2 * ph)); }); }
function ocarina(t, m, len, v = .05, pan = -.1) { const f = hz(m); let lp = 0, ph = 0;
  add(t, len + .3, pan, tt => { const a = Math.min(1, tt / .06) * (tt > len ? Math.exp(-(tt - len) / .09) : 1); ph += TAU * f * (1 - .015 * Math.exp(-tt * 18)) / SR;
    lp += ((rnd() * 2 - 1) - lp) * .08; return v * a * (Math.sin(ph) + .08 * Math.sin(2 * ph) + .18 * lp); }); }
function whoosh(t, len, v = .07) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
function rainstick(t, len, v = .03) { add(t, len, .2, tt => (hash(Math.floor((t + tt) * 900)) > .93 ? 1 : 0) * (rnd() * 2 - 1) * v * Math.sin(tt / len * Math.PI)); }
const lerp = (a, b, k) => a + (b - a) * k;
const run = (t, ms, step = .06, v = .04, ins = mando) => ms.forEach((m, i) => ins(t + i * step, m, v, (i / ms.length) - .5));

// ---------- harmony ----------
const CH = { F: [53, 60, 65, 69], Fmaj7: [53, 60, 64, 69], C: [48, 55, 60, 64], CE: [52, 55, 60, 64], Csus: [48, 55, 60, 65], Dm: [50, 57, 62, 65], Dm7: [50, 57, 60, 65],
  Bb: [46, 53, 58, 62], Bbmaj7: [46, 53, 57, 62], Gm: [43, 55, 58, 62], Gm7: [43, 53, 58, 62], Am: [45, 57, 60, 64], Am7: [45, 55, 60, 64], A: [45, 57, 61, 64], G: [43, 55, 59, 62], Edim: [52, 58, 61, 64] };
const ROOT = { F: 41, Fmaj7: 41, C: 36, CE: 40, Csus: 36, Dm: 38, Dm7: 38, Bb: 34, Bbmaj7: 34, Gm: 43, Gm7: 43, Am: 45, Am7: 45, A: 45, G: 43, Edim: 40 };
// style: ooh pad v, bass ('one' | 'pulse' | 'walk'), arp instrument + pattern, bongos, tongue comping
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    ooh(t, len, ch.slice(1), st.pad ?? .018);
    if (st.tg) { tongue(t, ch[2] + 12, st.tg, -.3); tongue(t + BEAT * 2, ch[3] + 12, st.tg * .8, .3); }
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) bass(tb, r, .11, BEAT * 3.5);
      if (st.bass === 'pulse' && b % 2 === 0) bass(tb, r, .1);
      if (st.bass === 'walk') bass(tb, r + [0, 7, 12, 7][b], .085, BEAT * .9);
      if (st.bongo) { if (b === 1 || b === 3) bongo(tb, 1, st.bongo, .35); if (b === 2) bongo(tb + BEAT * .5, 0, st.bongo * .9, -.3); if (b === 0 && bar % 2) bongo(tb + BEAT * .75, 1, st.bongo * .6, .2); }
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.sixteenth ? 4 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          (st.arp)(tb + e * BEAT / per, m, (st.arpV ?? .045) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
const MOTIF = [[0, 72, .5], [.5, 74, .5], [1, 77, 1], [2, 76, .5], [2.5, 74, .5], [3, 72, 1.5]];   // the recap theme (ocarina), in beats
const motif = (t, tr = 0, v = .045) => MOTIF.forEach(([b, m, d]) => ocarina(t + b * BEAT, m + tr, d * BEAT * .95, v));

// A: the hot meadow, the dilemma
section(0, Lx(2, -1.2), ['F', 'CE', 'Dm', 'Bb'], { pad: .018, bass: 'one', arp: mando, arpV: .03, skip: .4 });
// B: the stoma; C: inside, to the stroma
section(Lx(2, -1.2), Lx(3, -1.0), ['Bb', 'F', 'Gm', 'C'], { pad: .018, bass: 'pulse', arp: tongue, arpV: .035, skip: .3 });
section(Lx(3, -1.0), Lx(4, -1.0), ['Dm7', 'Bbmaj7', 'F', 'C'], { pad: .02, bass: 'one', arp: mando, arpV: .03, skip: .35 });
// D: Calvin's bench
section(Lx(4, -1.0), Lx(5, -.9), ['Gm7', 'C', 'F', 'Dm'], { pad: .018, bass: 'pulse', bongo: .05, arp: tongue, arpV: .035 });
// E: the cycle: a process running
section(Lx(5, -.9), Lx(6, 0), ['F', 'Am', 'Bb', 'C'], { pad: .018, bass: 'pulse', bongo: .05, arp: mando, arpV: .035 });
section(Lx(6, 0), Lx(7, 0), ['F', 'Am', 'Bb', 'C', 'Dm', 'Am', 'Bb', 'Csus'], { pad: .018, bass: 'walk', bongo: .06, arp: mando, arpV: .04, sixteenth: true, skip: .3 });
section(Lx(7, 0), Lx(8, -1.2), ['Bb', 'C', 'F', 'F'], { pad: .02, bass: 'pulse', bongo: .05, tg: .03, arp: mando, arpV: .035 });
// F: the flaw: slow, then the heat and the wrong grab
section(Lx(8, -1.2), Lx(9, 0), ['Dm', 'Bb', 'Gm', 'A'], { pad: .02, bass: 'pulse', arp: tongue, arpV: .035, skip: .4 });
section(Lx(9, 0), Lx(10, -.7), ['Dm', 'Gm', 'Edim', 'A', 'Dm', 'Bb', 'Gm', 'A'], { pad: .022, bass: 'walk', bongo: .045, arp: mando, arpV: .035, skip: .3 });
// G: recap one, a hush for the motif
section(Lx(10, -.7), Lx(11, -1.0), ['Bbmaj7', 'C', 'Am7', 'Dm'], { pad: .022, bass: 'one', tg: .03 });
// H/I: the corn and the pump: bright, a steady groove
section(Lx(11, -1.0), Lx(12, 0), ['F', 'C', 'Dm', 'Bb'], { pad: .018, bass: 'pulse', arp: mando, arpV: .035 });
section(Lx(12, 0), Lx(14, -.5), ['F', 'Am', 'Bb', 'C', 'Dm', 'C', 'Bb', 'Csus'], { pad: .018, bass: 'walk', bongo: .06, arp: mando, arpV: .038, sixteenth: true, skip: .3 });
section(Lx(14, -.5), Lx(16, -1.2), ['Bb', 'C', 'Am', 'Dm', 'Bb', 'C', 'F', 'F'], { pad: .02, bass: 'pulse', bongo: .055, tg: .03, arp: mando, arpV: .035 });
// J: the desert, a flashback, sour
section(Lx(16, -1.2), Lx(17, -1.0), ['Dm', 'G', 'Dm', 'C'], { pad: .02, bass: 'one', bongo: .04, arp: tongue, arpV: .035, skip: .35 });
// K: night (hushed, D minor), then day (bright), then the dial and the scales
section(Lx(17, -1.0), Lx(18, 0), ['Dm7', 'Bbmaj7', 'Gm7', 'Am7'], { pad: .022, bass: 'one', arp: tongue, arpV: .03, oct: 12, skip: .5 });
section(Lx(18, 0), Lx(19, -.4), ['F', 'C', 'Bb', 'F'], { pad: .02, bass: 'pulse', bongo: .05, arp: mando, arpV: .038 });
section(Lx(19, -.4), Lx(20, -1.2), ['Dm', 'Bb', 'F', 'C'], { pad: .02, bass: 'pulse', tg: .03, arp: mando, arpV: .03, skip: .3 });
// M: recap two; N: the world, C4 rice; O: home, level
section(Lx(20, -1.2), Lx(21, -1.0), ['Bbmaj7', 'C', 'Am7', 'Dm'], { pad: .022, bass: 'one', tg: .03 });
section(Lx(21, -1.0), Lx(22, -1.0), ['F', 'C', 'Dm', 'Bb'], { pad: .02, bass: 'pulse', bongo: .05, arp: mando, arpV: .038 });
section(Lx(22, -1.0), DUR - 3.4, ['Bb', 'C', 'F', 'F'], { pad: .02, bass: 'pulse', tg: .03, arp: mando, arpV: .034 });
ooh(DUR - 3.4, 2.8, CH.Fmaj7.slice(1), .022); tongue(DUR - 3.4, 72, .05, -.2); tongue(DUR - 3.38, 77, .04, .2); bass(DUR - 3.4, 41, .1, 2.8);

// ---------- the recap motif (ocarina), held after each recap and at the end ----------
motif(Lx(10, 10.9)); motif(Lx(20, 11.1), 0, .042); motif(Lx(22, 11.0), 0, .05);
ocarina(Lx(1, 9.8), 72, BEAT * .8, .035); ocarina(Lx(1, 9.8) + BEAT, 74, BEAT * 1.4, .035);                      // "二选一？" a question

// ---------- stingers on the picture ----------
run(.2, [65, 69, 72, 77], .1, .04);                                                                         // iris in
glass(Lx(1, 2.7), 81, .04); block(Lx(1, 3.8), .07); thunk(Lx(1, 3.85), .06);                                // CO₂ in, onto the pan
for (let i = 0; i < 15; i++) plink(Lx(1, 4.3) + i / 15 * 2.7, 84 - (i % 5) * 2, .035, (i % 3 - 1) * .4);      // fifteen drops land
thunk(Lx(1, 6.9), .08); glass(Lx(1, 7.6), 77, .03); plink(Lx(1, 8.4), 81, .04);
whoosh(Lx(2, -1.9), .8, .06);                                                                                // into the leaf
glass(Lx(2, 1.0), 84, .035); tongue(Lx(2, 3.5), 72, .05); tongue(Lx(2, 4.3), 76, .05);                       // the pore; the guard cells
slide(Lx(2, 5.8), 60, 72, 1.2, .03);                                                                         // they open
for (let i = 0; i < 4; i++) bloop(Lx(2, 7.6) + i * .45, 70 + i * 2, .03);
for (let i = 0; i < 7; i++) plink(Lx(2, 8.9) + i * .3, 86 - i, .025, .3);                                   // water vapour out
whoosh(Lx(3, -1.6), .7, .06);
run(Lx(3, -.2), [65, 67, 69, 72], .5, .025, tongue); block(Lx(3, 2.6), .05);
whoosh(Lx(3, 3.4), .6, .05); glass(Lx(3, 5.7), 77, .03); block(Lx(3, 6.9), .07); glass(Lx(3, 6.95), 84, .04); glass(Lx(3, 8.1), 81, .04);   // fixed; sugar
whoosh(Lx(4, -1.4), .8, .06);
for (let i = 0; i < 9; i++) bloop(Lx(4, 2.2) + i * .5, 74 + (i % 3) * 3, .03, (i % 2 - .5) * .4);           // ¹⁴CO₂ bubbles
for (let i = 0; i < 6; i++) tick(Lx(4, 7.3) + i * .22);                                                      // a few seconds
whoosh(Lx(4, 8.2), .8, .06); glass(Lx(4, 9.2), 84, .045);
for (let i = 0; i < 3; i++) tongue(Lx(4, 10.2 + i * .4), [72, 76, 79][i], .05);                             // one, two, three carbons
whoosh(Lx(5, -1.4), .6, .05);
glass(Lx(5, 1.7), 81, .035); slide(Lx(5, 3.1), 62, 69, 1.2, .025);                                           // Rubisco; C5 slides in
block(Lx(5, 5.9), .08); glass(Lx(5, 5.95), 84, .045); thunk(Lx(5, 5.9), .05);                                // fixation!
tongue(Lx(5, 6.6), 72, .045, -.4); tongue(Lx(5, 6.8), 76, .045, .4);                                        // two C3
glass(Lx(5, 9.4), 81, .035);
for (let i = 0; i < 4; i++) { bloop(Lx(6, 1.2) + i * .7, 70 + i * 2, .028); block(Lx(6, 4.8) + i * .08, .04); }   // ATP, NADPH arrive; the hits
slide(Lx(6, 5.4), 72, 62, .9, .02);                                                                          // spent, back to be recharged
glass(Lx(6, 8.1), 84, .045); glass(Lx(6, 8.25), 88, .035);                                                   // sugar
tongue(Lx(6, 10.4), 69, .045); tongue(Lx(6, 10.6), 74, .045);                                                // C5 again
run(Lx(6, 11.6), [65, 69, 72, 77, 81], .2, .03);                                                             // the arrows draw round
glass(Lx(7, 2.8), 81, .03); glass(Lx(7, 5.6), 84, .04);
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) tongue(Lx(7, 8.6 + i * .25) + j * .01, [72, 76, 79][i], .035);
[[10.0, 72], [11.2, 76], [11.9, 79]].forEach(([d, m]) => { tongue(Lx(7, d), m, .05); glass(Lx(7, d + .3), m + 12, .03); });   // crops
whoosh(Lx(8, -1.6), .8, .08);                                                                                // whip pan
slide(Lx(8, 2.4), 55, 48, 1.2, .04);                                                                         // a slow yawn
for (let i = 0; i < 10; i++) tick(Lx(8, 3.8) + i * .25, .03);
for (let k = 0; k < 7; k++) block(Lx(8, 3.95) + k * .36 + .2, .05);                                          // one at a time
for (let i = 0; i < 24; i++) tongue(Lx(8, 6.9) + i * .1, 69 + (i * 5) % 12, .02, (i % 3 - 1) * .5);         // Rubisco everywhere
slide(Lx(9, 1.6), 64, 65, 2.4, .015, -.4); slide(Lx(9, 1.6), 64, 63, 2.4, .015, .4);                         // which one?
ooh(Lx(9, 5.0), 3.5, [62, 65, 68], .015); thunk(Lx(9, 6.4), .1);                                             // the heat; the stoma shuts
for (let i = 0; i < 12; i++) bloop(Lx(9, 7.2) + i * .12, 62 + (i % 4), .018);                                // O₂ piles up
thunk(Lx(9, 9.3), .12); buzz(Lx(9, 9.4), .035);                                                              // the wrong grab ✗
slide(Lx(9, 10.6), 67, 55, 1.0, .03); whoosh(Lx(9, 11.7), 1.2, .04);                                        // energy wasted; CO₂ puffs out
thunk(Lx(9, 13.7), .08); buzz(Lx(9, 13.8), .025);
whoosh(Lx(10, -1.0), .8, .06);
[1.4, 2.7, 4.2].forEach((d, i) => tongue(Lx(10, d), [72, 69, 76][i], .045)); tick(Lx(10, 5.9)); buzz(Lx(10, 6.8), .025); glass(Lx(10, 8.1), 77, .03); slide(Lx(10, 9.2), 69, 57, .7, .03);
whoosh(Lx(11, -1.4), .8, .06);
glass(Lx(11, .4), 84, .035); whoosh(Lx(11, 2.5), .4, .05); whoosh(Lx(11, 3.0), .5, .05);                    // the slice
glass(Lx(11, 4.6), 77, .04);
for (let i = 0; i < 10; i++) tongue(Lx(11, 6.0) + i * .14, [65, 69, 72, 77][i % 4] + (i > 5 ? 12 : 0), .03, (i % 3 - 1) * .4);   // the sheath ring
for (let i = 0; i < 16; i++) mando(Lx(11, 9.4) + i * .09, [72, 74, 77, 81][i % 4] + (i > 8 ? 12 : 0), .025, (i % 4 - 1.5) * .3);   // the mesophyll ring
for (let i = 0; i < 8; i++) glass(Lx(11, 12.0) + i * .12, [77, 81, 84, 89][i % 4], .022, (i % 2 - .5));      // a garland
whoosh(Lx(12, 0), .7, .05);
[2.6, 3.2, 6.0, 9.6, 11.7].forEach(d => block(Lx(12, d), .055));                                              // PEPC snaps
glass(Lx(12, 6.05), 84, .04); for (let i = 0; i < 4; i++) tongue(Lx(12, 7.0 + i * .3), [72, 76, 79, 84][i], .045);   // four carbons
bongo(Lx(12, 9.6), 1, .12); slide(Lx(12, 9.7), 74, 62, .6, .02);                                             // O₂ bounces off
glass(Lx(12, 11.75), 81, .035);
slide(Lx(13, 0), 65, 72, 2.8, .02);                                                                          // through the channel
for (let j = 0; j < 4; j++) glass(Lx(13, 3.0 + (j ? 4.6 - 3.0 + (j - 1) * .6 + .9 : 0)), 84 - j * 2, .03);   // CO₂ released
rainstick(Lx(13, 3.2), 4.0, .025);
block(Lx(13, 11.0), .05); block(Lx(13, 11.8), .05); glass(Lx(13, 11.4), 84, .04); glass(Lx(13, 11.55), 88, .035);   // ✓
whoosh(Lx(14, -.9), .7, .05); glass(Lx(14, .4), 81, .04);
for (let i = 0; i < 4; i++) tongue(Lx(14, 2.9 + i * .22), [72, 76, 79, 84][i], .04);
rainstick(Lx(14, 5.6), 6.5, .03);                                                                            // the pump
tongue(Lx(14, 7.9), 65, .06, -.3); tongue(Lx(14, 7.9), 72, .05, -.3); tongue(Lx(14, 9.0), 69, .06, .3); tongue(Lx(14, 9.0), 77, .05, .3);   // outer, inner
glass(Lx(14, 9.9), 84, .03);
slide(Lx(15, 1.5), 69, 60, .6, .03); glass(Lx(15, 4.2), 88, .03); glass(Lx(15, 6.1), 84, .035);
whoosh(Lx(15, 7.4), 1.0, .04);
for (let i = 0; i < 15; i++) plink(Lx(15, 8.6) + i * .12, 84 - (i % 5) * 2, .028, -.4);                       // C3 pours
for (let i = 0; i < 7; i++) plink(Lx(15, 8.6) + i * .12 + .03, 88 - (i % 4) * 2, .028, .4);                    // C4: half
whoosh(Lx(16, -1.6), .8, .06);
glass(Lx(16, .2), 77, .03); glass(Lx(16, .9), 81, .03); glass(Lx(16, 2.0), 84, .03); thunk(Lx(16, 2.4), .05);
whoosh(Lx(16, 4.6), 1.2, .03); slide(Lx(16, 4.7), 72, 60, 1.0, .02);                                        // two hundred years ago
slide(Lx(16, 5.4), 60, 67, 1.2, .025); glass(Lx(16, 7.4), 81, .03); mando(Lx(16, 8.1), 76, .04);             // the pot; picked
crunch(Lx(16, 9.2), .07); slide(Lx(16, 9.4), 70, 66, .9, .035); slide(Lx(16, 9.4), 71, 66, .9, .025, .3);   // sour!
run(Lx(16, 11.0), [65, 69, 72, 77, 81], .15, .025, glass);                                                   // the sun arcs to afternoon
crunch(Lx(16, 12.2), .06); ocarina(Lx(16, 12.9), 72, BEAT * .7, .03); ocarina(Lx(16, 12.9) + BEAT * .8, 74, BEAT * 1.2, .03);   // "?"
whoosh(Lx(17, -1.6), .8, .06);
ooh(Lx(17, -.6), 2.2, [57, 62, 65], .016); slide(Lx(17, .9), 57, 64, 1.5, .02);                              // night; the stoma opens
plink(Lx(17, 3.4), 86, .04);                                                                                  // one drop only
[6.8, 8.2, 9.6].forEach(d => { bloop(Lx(17, d - 1.0), 70, .025); block(Lx(17, d), .05); });
glass(Lx(17, 10.8), 73, .03); glass(Lx(17, 10.85), 74, .025);                                                // malic acid (a sour second)
for (let i = 0; i < 6; i++) bloop(Lx(17, 12.5) + i * .4, 67 + i, .025);                                     // into the vacuole
run(Lx(18, 0), [65, 69, 72, 77], .12, .03, glass); thunk(Lx(18, 1.5), .08);                                 // dawn; the stoma shuts
slide(Lx(18, 3.3), 64, 71, 2.0, .02);
for (let i = 0; i < 3; i++) glass(Lx(18, 5.9 + i * .35), 84 - i * 3, .035);
run(Lx(18, 7.5), [65, 69, 72, 77, 81], .15, .028); glass(Lx(18, 8.6), 84, .04); glass(Lx(18, 9.4), 88, .035);
slide(Lx(18, 10.4), 74, 62, 1.4, .02);                                                                       // the acid drains
whoosh(Lx(19, -.8), .6, .05);
glass(Lx(19, .5), 81, .03); tongue(Lx(19, 2.6), 62, .05); tongue(Lx(19, 3.5), 77, .05);
for (let i = 0; i < 8; i++) tick(Lx(19, 5.0) + i * .3, .025);
slide(Lx(19, 7.7), 60, 62, 2.2, .015);                                                                       // so slow
whoosh(Lx(19, 9.4), 1.0, .04);
for (let i = 0; i < 15; i++) plink(Lx(19, 10.3) + i * .12, 84 - (i % 5) * 2, .025, -.5);
for (let i = 0; i < 7; i++) plink(Lx(19, 10.3) + i * .12 + .03, 88 - (i % 4) * 2, .025, 0);
for (let i = 0; i < 2; i++) plink(Lx(19, 10.3) + i * .12 + .06, 91, .03, .5);
whoosh(Lx(20, -1.6), .8, .06);
tongue(Lx(20, 1.4), 69, .045); tongue(Lx(20, 1.7), 72, .045); tongue(Lx(20, 2.0), 77, .045);
ooh(Lx(20, 3.0), 2.0, [65, 69, 72, 77], .016); glass(Lx(20, 4.2), 84, .035);
glass(Lx(20, 6.3), 81, .03); glass(Lx(20, 9.6), 84, .03);
whoosh(Lx(21, -1.4), .8, .06);
for (let i = 0; i < 20; i++) tongue(Lx(21, -.3) + i * .05, 72 + (i * 7) % 12, .012, (i % 5 - 2) * .3);
[0, 1, 2].forEach(i => glass(Lx(21, 2.0 + i * .3), [84, 88, 91][i], .035));                                 // three in a hundred
ooh(Lx(21, 5.0), 1.8, [65, 72, 77], .016); for (let i = 0; i < 3; i++) glass(Lx(21, 5.4 + i * .5), 89, .025);
tongue(Lx(21, 7.8), 72, .05); whoosh(Lx(21, 9.5), 1.2, .04); run(Lx(21, 10.8), [77, 81, 84, 89], .12, .03, glass);
whoosh(Lx(22, -1.4), .8, .06);
ooh(Lx(22, 4.4), 2.4, [57, 62, 65], .014); glass(Lx(22, 5.2), 84, .03);                                     // the night half
thunk(Lx(22, 8.4), .05); glass(Lx(22, 8.6), 81, .04); glass(Lx(22, 8.8), 77, .035);                          // level
run(DUR - 1.6, [77, 72, 69, 65], .12, .04);                                                                  // iris out

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/carbon_vo.wav');
const vl = verb(Lc, 0), vr = verb(Rc, 29);
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const a = Math.abs(vo[n] || 0); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00003);
  const t = n / SR, fade = Math.min(1, t / 1.0) * Math.min(1, (DUR - t) / 1.0), g = fade * (1 - .5 * duck);
  Lc[n] = (Lc[n] + vl[n] * .34) * g; Rc[n] = (Rc[n] + vr[n] * .34) * g; peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n]));
}
function writeWav(path, l, r, gain) {
  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(Math.tanh(l(n) * gain) * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(Math.tanh(r(n) * gain) * 32767), 46 + n * 4); }
  writeFileSync(path, buf);
}
const MUSIC = .14 / peak;
writeWav('assets/carbon_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/carbon_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/carbon_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/carbon_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/carbon_mix_n.wav', 'assets/carbon_mix.wav');
console.log('wrote assets/carbon_bgm.wav and assets/carbon_mix.wav');

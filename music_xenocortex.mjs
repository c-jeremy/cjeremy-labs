// music_xenocortex.mjs: the score for "Pip讲"人脑"小鼠" (src/scenes/xenocortex.js), synthesised from scratch.
//   node make.mjs xenocortex vo && node make.mjs xenocortex music   → assets/xenocortex_bgm.wav and assets/xenocortex_mix.wav
// Its own palette (not mRNA's kalimba/glock, not meiosis's e-piano/marimba/harp/flute): an FM vibraphone with tremolo, a
// nylon-string pluck (Karplus–Strong, brighter), a bowed-string pad, a soft shaker, a heartbeat kick (lub-dub) that
// carries the "alive" sections, and a clarinet (odd harmonics) that carries the recap motif. A minor → C major, 88 bpm
// = PROJECT.bpm. Sections follow the voice lines (times read from videos/xenocortex.json, like the scenes' L(i, d)); the
// music ducks under the voice and breathes up in the long pauses. Memory: one stereo float buffer pair plus two reverb
// buffers (about 55 MB each for 311 s), so it runs fine on a 4 GB machine.
import { readFileSync, writeFileSync } from 'node:fs';

const MAN = JSON.parse(readFileSync('videos/xenocortex.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
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
const vibe = (t, m, v = .05, pan = 0, dec = 1.6) => { const f = hz(m); add(t, dec * 2.4, pan, tt => { const e = env(tt, .003, dec), trem = 1 + .25 * Math.sin(TAU * 5.5 * tt);
  return v * e * trem * (Math.sin(TAU * f * tt + .9 * Math.exp(-tt * 9) * Math.sin(TAU * f * 4 * tt)) + .2 * Math.sin(TAU * f * 4 * tt) * Math.exp(-tt * 6)); }); };
function nylon(t, m, v = .07, pan = 0, dec = .995) {          // Karplus–Strong, a brighter pluck than a harp
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); for (let i = 0; i < P; i++) buf[i] = (rnd() * 2 - 1) * (i < P / 2 ? 1 : .6);
  let i = 0; add(t, 1.8, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = dec * (.6 * a + .4 * b); buf[i] = y; i = (i + 1) % P; return v * y * Math.min(1, tt / .002); });
}
const strings = (t, len, ms, v = .02) => ms.forEach((m, j) => { for (const det of [-.07, .05]) { const f = hz(m + det), ph = rnd(); let lp = 0;
  add(t, len + 1.4, (j / (ms.length - 1 || 1)) * 1.4 - .7, tt => { const a = Math.min(1, tt / 1.1) * (tt > len ? Math.exp(-(tt - len) / .6) : 1), x = (f * tt + ph + .003 * Math.sin(tt * 4.6 + j)) % 1;
    lp += ((2 * x - 1) - lp) * .08; return v * a * lp * 1.3; }); } });
const sub = (t, m, v = .11, len = BEAT * 1.8) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .02) * Math.exp(-tt / 1.2) * (tt > len ? Math.exp(-(tt - len) / .08) : 1); return v * e * Math.sin(TAU * f * tt); }); };
const beat1 = (t, v) => add(t, .35, 0, tt => v * Math.sin(TAU * (48 + 40 * Math.exp(-tt * 25)) * tt) * Math.exp(-tt * 10));
const heart = (t, v = .14) => { beat1(t, v); beat1(t + .19, v * .7); };
const shaker = (t, v = .02, pan = .3) => { let hp = 0, pv = 0; add(t, .09, pan, tt => { const x = rnd() * 2 - 1; hp = .7 * (hp + x - pv); pv = x; return v * hp * env(tt, .01, .025); }); };
const rim = (t, v = .05) => add(t, .06, -.2, tt => v * Math.sin(TAU * 1600 * tt) * Math.exp(-tt * 70));
const tom = (t, v = .16) => add(t, .5, 0, tt => v * Math.sin(TAU * (66 + 60 * Math.exp(-tt * 18)) * tt) * Math.exp(-tt * 7));
function clarinet(t, m, len, v = .045, pan = -.1) { const f = hz(m);
  add(t, len + .3, pan, tt => { const a = Math.min(1, tt / .06) * (tt > len ? Math.exp(-(tt - len) / .1) : 1), vib = 1 + .003 * Math.sin(TAU * 5 * tt) * Math.min(1, tt / .5), p = TAU * f * vib * tt;
    return v * a * (Math.sin(p) + .38 * Math.sin(3 * p) + .16 * Math.sin(5 * p) + .07 * Math.sin(7 * p)); }); }
function whoosh(t, len, v = .07) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const gliss = (t, ms, step = .05, v = .04, inst = vibe) => ms.forEach((m, i) => inst(t + i * step, m, v, (i / ms.length) - .5));

// ---------- harmony ----------
const CH = { Am: [57, 60, 64, 69], F: [53, 57, 60, 65], Fmaj7: [53, 57, 60, 64], C: [55, 60, 64, 67], Cmaj7: [55, 59, 64, 67], G: [55, 59, 62, 67], Gsus: [55, 60, 62, 67],
  Em7: [52, 55, 59, 62], Dm7: [50, 53, 57, 60], E: [52, 56, 59, 64], Bb: [53, 58, 62, 65] };
const ROOT = { Am: 45, F: 41, Fmaj7: 41, C: 48, Cmaj7: 48, G: 43, Gsus: 43, Em7: 40, Dm7: 38, E: 40, Bb: 46 };
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    strings(t, len, ch, st.pad ?? .016);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) sub(tb, r - 12, .1, BEAT * 3.5);
      if (st.bass === 'two' && b % 2 === 0) sub(tb, r - 12 + (b === 2 ? 7 : 0), .09);
      if (st.heart && b === 0) heart(tb, st.heart);
      if (st.heart2 && b % 2 === 0) heart(tb, st.heart2);
      if (st.shake) { shaker(tb + BEAT / 2, st.shake); shaker(tb + BEAT / 4 * 3, st.shake * .5, -.3); }
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.sixteenth ? 4 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          (st.arp)(tb + e * BEAT / per, m, (st.arpV ?? .045) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
const MOTIF = [[0, 76, .5], [.5, 74, .5], [1, 72, 1], [2, 69, .5], [2.5, 72, .5], [3, 71, 1.5]];   // the recap theme, in beats
const motif = (t, tr = 0, v = .04) => MOTIF.forEach(([b, m, d]) => clarinet(t + b * BEAT, m + tr, d * BEAT * .95, v));

// A: the hook — mystery, the rise, the flood, then bright
section(0, Lx(1, 7.3), ['Am', 'Fmaj7', 'Am', 'E'], { pad: .016, bass: 'one', arp: nylon, arpV: .04, skip: .4, shake: .012 });
strings(Lx(1, 7.3), 2.9, [57, 64, 69, 71], .02); for (let i = 0; i < 6; i++) beat1(Lx(1, 7.4) + i * (.5 - i * .05), .08 + i * .015);
section(Lx(1, 10.2), Lx(2, 0), ['Cmaj7', 'G'], { pad: .022, bass: 'one', arp: vibe, arpV: .035, oct: 12, skip: .3 });
section(Lx(2, 0), Lx(3, -1.6), ['C', 'G', 'Am', 'F'], { pad: .018, bass: 'two', arp: vibe, arpV: .04, shake: .016 });
// B: why it stands out — curious, crowded, the idea
section(Lx(3, -1.6), Lx(4, 0), ['Dm7', 'G', 'Em7', 'Am'], { pad: .018, bass: 'two', arp: nylon, arpV: .045, shake: .014 });
section(Lx(4, 0), Lx(5, 0), ['Am', 'E', 'F', 'E'], { pad: .02, bass: 'two', heart: .1, arp: nylon, arpV: .05, sixteenth: true, skip: .3 });
section(Lx(5, 0), Lx(6, -1.6), ['F', 'G', 'C', 'C'], { pad: .018, bass: 'two', arp: vibe, arpV: .04, shake: .016 });
// C: empty the room
section(Lx(6, -1.6), Lx(7, 0), ['Am', 'F', 'C', 'G'], { pad: .018, bass: 'one', arp: nylon, arpV: .04 });
section(Lx(7, 0), Lx(8, -.6), ['Dm7', 'Am', 'E', 'Am'], { pad: .02, bass: 'one', arp: vibe, arpV: .03, skip: .45 });
section(Lx(8, -.6), Lx(9, -.6), ['C', 'G', 'F', 'C'], { pad: .018, bass: 'two', arp: nylon, arpV: .045, shake: .016 });
section(Lx(9, -.6), Lx(10, -1.6), ['Am', 'Em7', 'F', 'G'], { pad: .014, bass: 'two', arp: nylon, arpV: .04, pat: [0, 3, 1, 3, 2, 3, 1, 3], skip: .2 });
// D: the dish, the transplant, the growth
section(Lx(10, -1.6), Lx(11, 0), ['C', 'Fmaj7', 'G', 'C'], { pad: .018, bass: 'two', arp: vibe, arpV: .04, shake: .016 });
section(Lx(11, 0), Lx(12, -1.6), ['Am', 'F', 'Dm7', 'E'], { pad: .02, bass: 'one', arp: nylon, arpV: .035, skip: .4 });
section(Lx(12, -1.6), Lx(13, 0), ['F', 'G', 'Am', 'C'], { pad: .018, bass: 'two', heart: .09, arp: vibe, arpV: .04, shake: .016 });
section(Lx(13, 0), Lx(14, -1.5), ['C', 'G', 'Am', 'F'], { pad: .022, bass: 'two', heart2: .09, arp: vibe, arpV: .045, sixteenth: true, skip: .2, shake: .02 });
// R: the recap — the clarinet over a hush
section(Lx(14, -1.5), Lx(15, -1.4), ['Fmaj7', 'G', 'C', 'C'], { pad: .02, bass: 'one', arp: nylon, arpV: .03, skip: .5 });
// E: the question; lights out; the wiring; the neuron; the maze
section(Lx(15, -1.4), Lx(16, -1.0), ['Dm7', 'E'], { pad: .018, bass: 'one', arp: vibe, arpV: .03, skip: .5 });
section(Lx(16, -1.0), Lx(17, 0), ['Am', 'Fmaj7', 'C', 'G'], { pad: .02, bass: 'one', arp: vibe, arpV: .035, oct: 12, sixteenth: true, skip: .35 });
section(Lx(17, 0), Lx(18, -1.2), ['Am', 'Fmaj7', 'C', 'G'], { pad: .02, bass: 'two', heart: .12, arp: vibe, arpV: .04, oct: 12, sixteenth: true, skip: .25 });
section(Lx(18, -1.2), Lx(19, -1.2), ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'], { pad: .024, bass: 'one', arp: vibe, arpV: .03, oct: 12, skip: .3 });
section(Lx(19, -1.2), Lx(20, -1.6), ['C', 'G', 'Am', 'F'], { pad: .016, bass: 'two', arp: nylon, arpV: .045, shake: .016 });
// F: hypoxia, then hope; the limits, serious
section(Lx(20, -1.6), Lx(20, 10.2), ['Am', 'Dm7', 'E', 'Am'], { pad: .02, bass: 'one', arp: vibe, arpV: .025, skip: .5 });
section(Lx(20, 10.2), Lx(21, -1.1), ['F', 'G'], { pad: .018, bass: 'two', arp: nylon, arpV: .04 });
section(Lx(21, -1.1), Lx(22, -1.6), ['Dm7', 'G', 'Em7', 'Am'], { pad: .018, bass: 'one', arp: nylon, arpV: .03, skip: .45 });
// G: the maze again, golden; the motif lands
section(Lx(22, -1.6), DUR - 3.4, ['C', 'G', 'Am', 'F'], { pad: .02, bass: 'two', arp: vibe, arpV: .04, shake: .016 });
strings(DUR - 3.4, 2.8, CH.Cmaj7, .022); vibe(DUR - 3.4, 72, .045, -.2, 2.2); vibe(DUR - 3.38, 76, .035, .2, 2.2); sub(DUR - 3.4, 36, .1, 2.8);

// ---------- the recap motif ----------
motif(Lx(14, 9.0)); motif(Lx(22, 9.4), 0, .045);
clarinet(Lx(5, 9.0), 72, BEAT * 2, .03); clarinet(Lx(13, 9.0), 76, BEAT * 2.5, .03);

// ---------- stingers on the picture ----------
gliss(.15, [57, 64, 69], .12, .045, nylon);                                                   // iris in
for (let i = 0; i < 10; i++) shaker(Lx(1, .1) + i * .32, .02);                                  // trot
vibe(Lx(1, 3.7), 81, .035); vibe(Lx(1, 4.0), 84, .03);                                         // sniff
whoosh(Lx(1, 7.3), 1.8, .06);                                                                   // the push into the head
sub(Lx(1, 10.15), 33, .16, 2.4); gliss(Lx(1, 10.2), [60, 64, 67, 71, 72, 76, 79, 83], .12, .04);   // the flood
vibe(Lx(1, 11.9), 88, .05); vibe(Lx(1, 11.95), 84, .04);                                        // 是人的!
gliss(Lx(2, 3.9), [84, 79, 76, 72, 67, 64], .14, .035, nylon);                                  // threads run down
tom(Lx(2, 8.15), .12); rim(Lx(2, 8.15), .06);                                                   // the journal slaps in
whoosh(Lx(3, -1.9), .9, .07);
whoosh(Lx(3, 4.3), .7, .04); rim(Lx(3, 5.0), .06); vibe(Lx(3, 5.05), 76, .04);                   // seed lands
for (let i = 0; i < 8; i++) nylon(Lx(3, 7.4) + i * .45, 57 + i * 2, .04);                      // it strains to grow
tom(Lx(3, 11.5), .12);                                                                          // and stops
for (let i = 0; i < 8; i++) rim(Lx(4, 1.3) + i * .2, .03);                                     // crowding
gliss(Lx(5, .9), [72, 76, 79, 84, 88], .06, .035);                                              // idea
whoosh(Lx(5, 5.7), 1.2, .07); tom(Lx(5, 8.6), .1); vibe(Lx(5, 8.65), 84, .045);                 // swept away; dropped in
whoosh(Lx(6, -2.2), .7, .06);
rim(Lx(6, 6.4), .07); vibe(Lx(6, 6.5), 60, .04);                                               // the switch: off
for (let i = 0; i < 3; i++) vibe(Lx(6, 8.2 + i * .35), [84, 88, 91][i], .035);                 // glue glints
gliss(Lx(7, 0), [72, 69, 67, 64, 60], .25, .035, nylon);                                       // glue melts
whoosh(Lx(7, 2.0), 1.2, .05); tom(Lx(7, 5.0), .08);                                             // chaos; the cell goes
whoosh(Lx(7, 6.1), .6, .05); sub(Lx(7, 10.4), 40, .09, 2);                                      // the half brain
whoosh(Lx(8, -.9), .7, .06);
vibe(Lx(8, 2.8), 84, .04); vibe(Lx(8, 4.2), 86, .04); vibe(Lx(8, 5.0), 88, .04);              // see, hear, smell
whoosh(Lx(8, 6.8), 1.0, .05); gliss(Lx(8, 9.2), [64, 69, 72, 76], .08, .04);                   // x-ray; teal
whoosh(Lx(9, -.9), .7, .06);
gliss(Lx(9, 2.3), [67, 64, 60, 55], .15, .035, nylon);                                          // yawn → asleep
tom(Lx(9, 7.0), .1); rim(Lx(9, 7.0), .05);                                                     // bump!
whoosh(Lx(10, -1.9), .9, .07);
for (let i = 0; i < 8; i++) nylon(Lx(10, 2.9) + i * .4, [60, 64, 67, 72, 64, 67, 72, 76][i], .035);   // cells gather
vibe(Lx(10, 6.45), 84, .045); rim(Lx(10, 7.3), .04);                                            // pop; the pea rolls in
whoosh(Lx(10, 8.3), 1.2, .04);
tom(Lx(11, 3.0), .1); rim(Lx(11, 3.4), .05); sub(Lx(11, 5.6), 40, .08, 3);                     // stalls; ✗; the core dies
whoosh(Lx(12, -2.0), .8, .08);
whoosh(Lx(12, 2.0), 1.0, .05); tom(Lx(12, 3.0), .12); vibe(Lx(12, 3.05), 84, .045);             // the transplant lands
for (let i = 0; i < 29; i++) if (![6, 13, 19, 26].includes(i)) vibe(Lx(12, 5.8) + i * .055, 79 + (i % 5) * 2, .015, (i / 29) - .5);   // 25 take
gliss(Lx(12, 7.6), [79, 84, 88], .07, .035);                                                    // ✓
gliss(Lx(12, 8.6), [55, 60, 64, 67, 72, 76], .35, .03, nylon);                                  // vessels grow in
for (let i = 0; i < 3; i++) vibe(Lx(13, 3.1 + i * .3), [76, 79, 84][i], .04);                  // three moons
gliss(Lx(13, 4.2), [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84], .5, .028);                      // it grows ×5
sub(Lx(13, 8.6), 36, .13, 2.2); vibe(Lx(13, 8.6), 88, .045);                                    // 92%
whoosh(Lx(14, -1.8), .8, .07);
vibe(Lx(14, .9), 76, .04); vibe(Lx(14, 4.0), 79, .04); vibe(Lx(14, 6.0), 84, .04);             // recap icons
vibe(Lx(15, 5.4), 76, .035); vibe(Lx(15, 5.8), 81, .035);                                       // ?
sub(Lx(16, -1.6), 33, .08, 2.4);                                                               // lights out
gliss(Lx(16, 0), [72, 76, 79, 84, 88, 91], .25, .03);                                           // the cells light up
vibe(Lx(16, 2.4), 91, .05); vibe(Lx(16, 2.45), 84, .04);
gliss(Lx(16, 4.6), [84, 81, 79, 76, 72, 69, 67, 64, 60, 57], .5, .032, nylon);                    // the axons dive
vibe(Lx(16, 6.6), 72, .04); vibe(Lx(16, 7.5), 69, .04); sub(Lx(16, 9.6), 33, .09, 1.6);          // thalamus; brainstem; cord
gliss(Lx(16, 10.8), [57, 60, 64, 69, 72, 76], .4, .03, nylon);                                  // mouse axons grow back
for (let j = 0; j < 4; j++) vibe(Lx(16, 12.2 + j * .15), 88 + j * 2, .025);
for (const d of [7.6, 8.4, 9.1, 9.9, 10.6, 11.4]) { rim(Lx(17, d), .04); vibe(Lx(17, d + .12), 84, .025); }   // twitch → answer
whoosh(Lx(18, -1.6), .9, .05);
for (let i = 0; i < 10; i++) vibe(Lx(18, .2) + i * .06, 88 + (i % 2) * 3, .015);                // shiver
gliss(Lx(18, 2.8), [64, 69, 72, 76, 81, 84, 88, 93], .1, .035); sub(Lx(18, 2.8), 41, .1, 3);    // the spindle neuron lights gold
vibe(Lx(18, 10.9), 84, .04); vibe(Lx(18, 11.4), 88, .04); tom(Lx(18, 12.7), .08); rim(Lx(18, 12.7), .04);   // ✓ ✓ ✗
whoosh(Lx(19, -1.5), .9, .07);
for (let i = 0; i < 6; i++) shaker(Lx(19, 4.6) + i * .35, .02); vibe(Lx(19, 7.0), 72, .03); vibe(Lx(19, 7.2), 76, .03);   // the grey mouse; ?
for (let i = 0; i < 6; i++) shaker(Lx(19, 7.4) + i * .35, .02); gliss(Lx(19, 9.8), [79, 84, 88], .07, .035);           // the rose mouse; ✓
vibe(Lx(19, 5.4), 69, .03); vibe(Lx(19, 9.6), 74, .03); vibe(Lx(19, 10.8), 76, .03);           // the bars
whoosh(Lx(20, -1.9), .9, .07);
gliss(Lx(20, 2.0), [76, 72, 69, 64, 60], .3, .03);                                              // the oxygen fades
tom(Lx(20, 6.2), .08); tom(Lx(20, 7.0), .07);                                                   // the wobble
for (let i = 0; i < 3; i++) nylon(Lx(20, 10.4 + i * .15), [72, 76, 79][i], .045);               // three dishes
whoosh(Lx(21, -1.4), .9, .07);
nylon(Lx(21, 3.0), 69, .04); nylon(Lx(21, 3.2), 72, .04); rim(Lx(21, 4.0), .04);                // swatches; ✗
gliss(Lx(21, 6.0), [60, 64, 67, 72], .2, .035, nylon);                                          // the plant grows
whoosh(Lx(21, 9.6), 1.0, .05); tom(Lx(21, 10.4), .1);                                           // the red line; the monkey
whoosh(Lx(22, -1.9), .9, .07);
vibe(Lx(22, 0), 76, .04); vibe(Lx(22, 1.7), 79, .04); vibe(Lx(22, 3.0), 84, .04);              // three callbacks
for (let i = 0; i < 10; i++) shaker(Lx(22, 4.8) + i * .34, .018);
gliss(Lx(22, 9.6), [72, 76, 79, 84, 88], .12, .03);                                             // the glow
gliss(DUR - 2.6, [76, 72, 67, 60], .18, .04, nylon);                                            // iris out

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/xenocortex_vo.wav');
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
writeWav('assets/xenocortex_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/xenocortex_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
console.log(`wrote assets/xenocortex_bgm.wav and assets/xenocortex_mix.wav (${DUR} s, peak ${peak.toFixed(3)})`);

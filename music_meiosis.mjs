// music_meiosis.mjs: the score for "Pip讲减数分裂" (src/scenes/meiosis.js), synthesised from scratch.
//   node make.mjs meiosis vo && node make.mjs meiosis music   → assets/meiosis_bgm.wav and assets/meiosis_mix.wav
// Its own palette (not the kalimba/glock/pizz of mRNA and opto): an FM electric piano, marimba, a plucked harp
// (Karplus–Strong), a soft sine bass, brushed noise, an FM celesta and a breathy flute that carries the recap motif.
// D major, 84 bpm = PROJECT.bpm. Each section follows a voice line (times read from videos/meiosis.json, like the
// scenes' L(i, d)); the music ducks under the voice and breathes up in the long pauses between sections.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const MAN = JSON.parse(readFileSync('videos/meiosis.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const Lc = new Float32Array(N), Rc = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 23; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); Lc[i0 + i] += v * gl; Rc[i0 + i] += v * gr; }
}
const env = (tt, a, d) => (tt < a ? tt / a : Math.exp(-(tt - a) / d));

// ---------- instruments ----------
const epiano = (t, m, v = .06, pan = 0, len = 2.2) => { const f = hz(m); add(t, len + .4, pan, tt => { const e = env(tt, .006, .9) * (tt > len ? Math.exp(-(tt - len) / .12) : 1), I = 1.6 * Math.exp(-tt * 3);
  return v * e * (Math.sin(TAU * f * tt + I * Math.sin(TAU * f * tt)) + .12 * Math.sin(TAU * f * 14 * tt) * Math.exp(-tt * 25)); }); };
const marimba = (t, m, v = .07, pan = 0) => { const f = hz(m); add(t, .9, pan, tt => v * (Math.sin(TAU * f * tt) * env(tt, .002, .32) + .25 * Math.sin(TAU * f * 3.93 * tt) * Math.exp(-tt * 30) + .08 * Math.sin(TAU * f * 9.2 * tt) * Math.exp(-tt * 60))); };
function harp(t, m, v = .08, pan = 0, dec = .996) {             // Karplus–Strong pluck
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); for (let i = 0; i < P; i++) buf[i] = rnd() * 2 - 1;
  let i = 0, prev = 0; add(t, 2.2, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = dec * .5 * (a + b); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .5; return v * prev * Math.min(1, tt / .002); });
}
const bass = (t, m, v = .12, len = BEAT * 1.8) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .02) * Math.exp(-tt / 1.4) * (tt > len ? Math.exp(-(tt - len) / .08) : 1), s = Math.sin(TAU * f * tt); return v * e * Math.tanh(1.6 * (s + .25 * Math.sin(TAU * 2 * f * tt))); }); };
const pad = (t, len, ms, v = .022) => ms.forEach((m, j) => { for (const det of [-.06, .06]) { const f = hz(m + det), ph = rnd();
  add(t, len + 1.2, (j / (ms.length - 1 || 1)) * 1.4 - .7, tt => { const a = Math.min(1, tt / .9) * (tt > len ? Math.exp(-(tt - len) / .45) : 1), x = (f * tt + ph + .002 * Math.sin(tt * 5)) % 1;
    return v * a * (1 - 4 * Math.abs(x - .5)) * .8; }); } });
const brush = (t, v = .03, pan = .25) => { let lp = 0; add(t, .22, pan, tt => { lp += ((rnd() * 2 - 1) - lp) * .35; return v * lp * env(tt, .015, .06); }); };
const rim = (t, v = .05) => add(t, .06, -.2, tt => v * Math.sin(TAU * 1800 * tt) * Math.exp(-tt * 70));
const tom = (t, v = .16) => add(t, .5, 0, tt => v * Math.sin(TAU * (70 + 60 * Math.exp(-tt * 18)) * tt) * Math.exp(-tt * 7));
const celesta = (t, m, v = .05, pan = 0) => { const f = hz(m); add(t, 2.6, pan, tt => v * env(tt, .002, .8) * Math.sin(TAU * f * tt + 1.2 * Math.exp(-tt * 4) * Math.sin(TAU * f * 3.5 * tt))); };
function flute(t, m, len, v = .05, pan = -.1) { const f = hz(m); let lp = 0;
  add(t, len + .3, pan, tt => { const a = Math.min(1, tt / .08) * (tt > len ? Math.exp(-(tt - len) / .1) : 1), vib = 1 + .004 * Math.sin(TAU * 5.2 * tt) * Math.min(1, tt / .4);
    lp += ((rnd() * 2 - 1) - lp) * .1; return v * a * (Math.sin(TAU * f * vib * tt) + .18 * Math.sin(TAU * 2 * f * vib * tt) + .25 * lp); }); }
function whoosh(t, len, v = .07) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
function gliss(t, ms, step = .05, v = .05) { ms.forEach((m, i) => harp(t + i * step, m, v, (i / ms.length) - .5)); }

// ---------- harmony ----------
const CH = { D: [62, 66, 69, 74], Dmaj7: [62, 66, 69, 73], G: [55, 62, 67, 71], Gmaj7: [55, 62, 66, 71], A: [57, 64, 69, 73], Asus: [57, 62, 64, 69], Bm: [59, 62, 66, 71], Bm7: [59, 62, 66, 69],
  Em7: [52, 59, 62, 67], Fsm: [54, 61, 66, 69], AC: [61, 64, 69, 73], C: [60, 64, 67, 72], F: [53, 60, 65, 69] };
const ROOT = { D: 38, Dmaj7: 38, G: 43, Gmaj7: 43, A: 45, Asus: 45, Bm: 47, Bm7: 47, Em7: 40, Fsm: 42, AC: 37, C: 36, F: 41 };
// style: pad v, bass ('one' | 'pulse' | 'walk'), arp instrument + pattern, brush, epiano comping
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    pad(t, len, ch, st.pad ?? .02);
    if (st.ep) epiano(t, ch[1] + 12, st.ep, -.3, Math.min(len, BEAT * 2.5)), epiano(t + .02, ch[2] + 12, st.ep * .8, .3, Math.min(len, BEAT * 2.5));
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) bass(tb, r, .11, BEAT * 3.5);
      if (st.bass === 'pulse' && b % 2 === 0) bass(tb, r, .1);
      if (st.bass === 'walk') bass(tb, r + [0, 4, 7, 9][b] - (b === 3 && name.startsWith('B') ? 2 : 0), .09, BEAT * .9);
      if (st.brush) { if (b % 2) brush(tb, st.brush); brush(tb + BEAT / 2, st.brush * .45, -.25); }
      if (st.rim && b === 3) rim(tb + BEAT * .5, st.rim);
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.sixteenth ? 4 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16) < st.skip) continue;
          (st.arp)(tb + e * BEAT / per, m, (st.arpV ?? .05) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const MOTIF = [[0, 74, .75], [.75, 73, .25], [1, 71, 1], [2, 69, .5], [2.5, 71, .5], [3, 66, 1.4]];   // the recap theme, in beats
const motif = (t, tr = 0, v = .045) => MOTIF.forEach(([b, m, d]) => flute(t + b * BEAT, m + tr, d * BEAT * .95, v));

// A: the family (warm curiosity), the bubbles
section(0, Lx(2, 0), ['D', 'AC', 'Bm', 'G'], { pad: .02, ep: .035, bass: 'one', arp: harp, arpV: .035, skip: .35 });
section(Lx(2, 0), Lx(3, -1.7), ['G', 'A', 'D', 'Bm'], { pad: .02, ep: .03, bass: 'pulse', arp: marimba, arpV: .045 });
// B: why halve — curious, then the doubling tension, then the fix, then the recap
section(Lx(3, -1.7), Lx(4, 0), ['Em7', 'A', 'D', 'Bm7'], { pad: .02, bass: 'pulse', brush: .02, arp: marimba, arpV: .045 });
section(Lx(4, 0), Lx(5, 0), ['Bm', 'G', 'Em7', 'Fsm'], { pad: .024, bass: 'walk', brush: .028, rim: .04, arp: marimba, arpV: .05, sixteenth: true, skip: .25 });
section(Lx(5, 0), Lx(6, 0), ['D', 'G', 'A', 'D'], { pad: .02, bass: 'pulse', brush: .02, arp: harp, arpV: .04 });
section(Lx(6, 0), Lx(7, -1.9), ['Gmaj7', 'A', 'Fsm', 'Bm'], { pad: .024, ep: .03, bass: 'one' });
// C: the process. A steady groove; each stage gets its own chords
const C1 = [[Lx(7, -1.9), Lx(8, 0), ['D', 'Gmaj7'], { arp: harp, arpV: .035, bass: 'one', pad: .02 }],
  [Lx(8, 0), Lx(9, 0), ['Bm', 'G', 'D', 'A'], { arp: marimba, arpV: .04, bass: 'pulse', brush: .018 }],
  [Lx(9, 0), Lx(10, 0), ['G', 'A', 'D', 'Bm'], { arp: harp, arpV: .04, bass: 'pulse', ep: .025, brush: .018 }],
  [Lx(10, 0), Lx(11, 0), ['Em7', 'A', 'Fsm', 'Bm'], { arp: marimba, arpV: .045, bass: 'walk', brush: .022, rim: .035, sixteenth: true, skip: .3 }],
  [Lx(11, 0), Lx(12, 0), ['D', 'A', 'Bm', 'G'], { arp: harp, arpV: .04, bass: 'pulse', brush: .02 }],
  [Lx(12, 0), Lx(13, 0), ['Bm', 'A', 'G', 'A'], { arp: marimba, arpV: .045, bass: 'walk', brush: .024, rim: .035 }],
  [Lx(13, 0), Lx(14, 0), ['G', 'A', 'D', 'D'], { arp: harp, arpV: .035, bass: 'one', ep: .028 }],
  [Lx(14, 0), Lx(15, 0), ['D', 'G', 'A', 'D'], { arp: marimba, arpV: .04, bass: 'pulse', brush: .018 }],
  [Lx(15, 0), Lx(16, 0), ['Bm', 'G', 'Em7', 'A'], { arp: marimba, arpV: .045, bass: 'walk', brush: .022, rim: .035 }],
  [Lx(16, 0), Lx(17, -1.6), ['G', 'A', 'Bm', 'D'], { arp: harp, arpV: .045, bass: 'pulse', ep: .03, brush: .02 }]];
C1.forEach(([a, b, p, s]) => section(a, b, p, { pad: .02, ...s }));
// D: the recap — the flute motif over a hush
section(Lx(17, -1.6), Lx(18, -1.3), ['Gmaj7', 'A', 'Fsm', 'Bm'], { pad: .024, ep: .028, bass: 'one' });
// E: night, the numbers grow
section(Lx(18, -1.3), Lx(19, 0), ['Bm', 'G', 'D', 'A'], { pad: .022, bass: 'one', arp: celesta, arpV: .03, oct: 12, skip: .3 });
section(Lx(19, 0), Lx(20, 0), ['G', 'A', 'Bm', 'D'], { pad: .024, bass: 'pulse', brush: .02, arp: celesta, arpV: .035, oct: 12 });
section(Lx(20, 0), Lx(21, -1.2), ['G', 'A', 'D', 'Bm', 'G', 'A', 'D', 'D'], { pad: .026, bass: 'walk', brush: .026, rim: .035, ep: .03, arp: harp, arpV: .045, sixteenth: true, skip: .2 });
// F: when it goes wrong — hushed
section(Lx(21, -1.2), Lx(22, -.8), ['Bm', 'Em7', 'Fsm', 'Bm'], { pad: .022, bass: 'one', arp: epiano, arpV: .025, skip: .5 });
// G: you — home, warm, the motif comes back and lands
section(Lx(22, -.8), DUR - 3.2, ['D', 'A', 'Bm', 'G'], { pad: .022, ep: .03, bass: 'pulse', arp: harp, arpV: .04 });
pad(DUR - 3.2, 2.6, CH.Dmaj7, .024); epiano(DUR - 3.2, 74, .04, -.2, 2.4); epiano(DUR - 3.18, 78, .03, .2, 2.4); bass(DUR - 3.2, 38, .1, 2.6);

// ---------- the recap motif, at the three "remember" moments ----------
motif(Lx(6, 8.4), 0); motif(Lx(17, 12.6), 0, .04); motif(Lx(22, 10.0), 0, .05);
flute(Lx(13, 14.3), 69, BEAT * 2, .035); flute(Lx(16, 12.6), 74, BEAT * 2.5, .035);

// ---------- stingers on the picture ----------
harp(.2, 74, .05); harp(.35, 78, .05); harp(.5, 81, .05);                                         // iris in
for (let i = 0; i < 34; i++) marimba(Lx(1, 1.3) + i * .085 + .3, [74, 76, 78, 81, 83, 86][i % 6], .03, (i % 5 - 2) * .3);   // the fountain of babies
whoosh(Lx(1, 4.9), 1.0, .05); whoosh(Lx(1, 6.2), .8, .05);
tom(Lx(1, 7.1), .12); celesta(Lx(1, 8.5), 81, .04); celesta(Lx(1, 8.7), 79, .035);               // the sibling lands; ?
harp(Lx(2, .2), 81, .04); harp(Lx(2, .5), 83, .04);
[Lx(2, 2.2), Lx(2, 3.6)].forEach(t => { rim(t, .05); marimba(t, 86, .04); });                    // papa's cell divides
celesta(Lx(2, 4.9), 86, .04); gliss(Lx(2, 6.2), [74, 78, 81, 86, 90], .06, .035);
whoosh(Lx(2, 9.0), 1.0, .07);
for (let i = 0; i < 12; i++) marimba(Lx(3, .2) + i * .18, 74 + (i % 4) * 3, .022);                // 46 rods pop
gliss(Lx(3, 3.0), [62, 66, 69, 74, 78], .1, .03);                                                  // into pairs
celesta(Lx(3, 6.9), 78, .04); celesta(Lx(3, 8.9), 81, .04);                                        // father / mother
rim(Lx(4, 4.2), .06); tom(Lx(4, 5.1), .12); for (let i = 0; i < 6; i++) marimba(Lx(4, 6.6) + i * .2, 62 + i * 2, .035);   // 92 → 184
tom(Lx(5, -.4), .14); whoosh(Lx(5, -.6), .6, .06);                                                 // poof
tom(Lx(5, 6.7), .1); gliss(Lx(5, 6.9), [62, 66, 69, 74], .12, .035); celesta(Lx(5, 8.4), 86, .05); celesta(Lx(5, 8.55), 90, .04);   // ✓
celesta(Lx(6, 5.8), 74, .04); celesta(Lx(6, 7.0), 81, .04);
whoosh(Lx(6, 8.9), 1.0, .07);
for (let k = 0; k < 3; k++) celesta(Lx(7, .3 + k * .7), [74, 78, 81][k], .035);                     // three pairs
for (let h = 0; h < 6; h++) harp(Lx(7, 4.6 + h * .28) + .5, [69, 71, 74, 76, 78, 81][h], .04);     // copies
celesta(Lx(7, 9.8), 86, .04);                                                                      // the centromere
gliss(Lx(8, 3.0), [62, 64, 66, 69, 71, 74, 76, 78], .5, .03);                                      // coiling up
for (let i = 0; i < 5; i++) rim(Lx(8, 8.0) + i * .4, .025);                                        // the envelope breaks up
celesta(Lx(8, 10.4), 81, .035); celesta(Lx(8, 10.6), 86, .03);                                     // centrosomes
for (let k = 0; k < 3; k++) { marimba(Lx(9, 5.6) + k * .25, 74 + k * 4, .045); }                    // pairing
celesta(Lx(9, 6.4), 86, .04);
for (let i = 0; i < 4; i++) marimba(Lx(9, 8.6) + i * .5, [74, 76, 78, 81][i], .05);               // one, two, three, four
gliss(Lx(9, 11.6), [69, 74, 78, 81, 86], .07, .035);                                               // tetrad
tom(Lx(10, 4.3), .08); harp(Lx(10, 5.4), 66, .04);                                                 // they twist
for (let i = 0; i < 5; i++) marimba(Lx(10, 6.2) + i * .3, 78 - i * 2, .035);                       // the swap
celesta(Lx(10, 8.2), 86, .05); celesta(Lx(10, 8.35), 90, .045); rim(Lx(10, 8.2), .05);             // crossing over!
for (const k of [1, 2]) { rim(Lx(10, 12.6 + (k - 1) * .55) + .85, .04); celesta(Lx(10, 12.6 + (k - 1) * .55) + .9, 81 + k * 2, .03); }
whoosh(Lx(11, .8), .8, .04);
for (let k = 0; k < 3; k++) { rim(Lx(11, 4.6 + k * .5) + .45, .05); marimba(Lx(11, 4.6 + k * .5) + .45, 81, .03); }   // fibres click on
for (let i = 0; i < 3; i++) marimba(Lx(11, 9.4) + i * .8, [74, 78, 74][i], .04);                   // the coin toss
tom(Lx(12, 1.2), .12); harp(Lx(12, 1.3), 50, .06);                                                 // pulled apart
celesta(Lx(12, 3.4), 78, .035); celesta(Lx(12, 4.0), 81, .035);
celesta(Lx(12, 9.0), 86, .04);                                                                      // ✓ centromere intact
tom(Lx(13, 1.4), .1); gliss(Lx(13, 3.1), [62, 66, 69, 74], .1, .035);                              // two cells
for (let k = 0; k < 3; k++) marimba(Lx(13, 6.0 + k * .5), 74 + k * 4, .04);                         // 1-2-3
marimba(Lx(13, 8.5), 81, .04); marimba(Lx(13, 9.1), 83, .04);
celesta(Lx(13, 12.2), 74, .04); celesta(Lx(13, 12.5), 81, .04);
for (let k = 0; k < 3; k++) rim(Lx(14, 6.5 + k * .2) + .9, .03);                                   // to the plates
for (let k = 0; k < 3; k++) celesta(Lx(14, 10.2 + k * .35), 81 + k * 2, .03);
for (let h = 0; h < 6; h++) rim(Lx(15, 1.3 + h * .1), .05); celesta(Lx(15, 1.4), 90, .04);         // centromeres split
gliss(Lx(15, 2.7), [86, 81, 78, 74], .1, .03); harp(Lx(15, 6.2), 50, .05);
tom(Lx(16, 1.6), .1); tom(Lx(16, 2.4), .08);                                                       // four cells
for (let i = 0; i < 4; i++) celesta(Lx(16, 5.9) + i * .4, [74, 78, 81, 86][i], .04);
whoosh(Lx(16, 13.4), .9, .07);
for (let i = 0; i < 4; i++) marimba(Lx(17, -1.3) + i * .55, 74 + i * 3, .035);                     // recap builds
celesta(Lx(17, 1.5), 81, .035); rim(Lx(17, 3.9), .04); rim(Lx(17, 4.6), .04); celesta(Lx(17, 6.4), 78, .035); celesta(Lx(17, 10.0), 86, .035);
whoosh(Lx(18, -1.6), .9, .07);
for (let k = 0; k < 3; k++) for (let i = 0; i < 2; i++) marimba(Lx(18, 4.8 + k * .35) + i * .45, 78 + i * 3, .03);   // flips
for (let k = 0; k < 3; k++) celesta(Lx(18, 6.6 + k * .7), [74, 78, 81][k], .04);                   // ×2 ×2 ×2
for (let i = 0; i < 8; i++) marimba(Lx(18, 8.6) + i * .17, [74, 76, 78, 81, 83, 86, 88, 90][i], .04);   // eight
gliss(Lx(19, 2.0), [62, 66, 69, 74, 78, 81, 86, 90, 93], .25, .03);                                 // millions
gliss(Lx(19, 6.8), [93, 90, 86, 81, 78], .2, .03);                                                  // eggs
whoosh(Lx(20, 0), 2.4, .06); tom(Lx(20, 2.2), .14); CH.D.forEach((m, i) => celesta(Lx(20, 2.25) + i * .03, m + 12, .04));
for (let i = 0; i < 16; i++) celesta(Lx(20, 4.4) + i * .27, 74 + ((i * 5) % 17), .02, (i % 3 - 1) * .6);
whoosh(Lx(21, -1.6), .9, .07);
celesta(Lx(21, 4.0), 71, .035); harp(Lx(21, 5.0), 47, .05); rim(Lx(21, 5.6), .06); tom(Lx(21, 5.7), .08);   // stuck; snap
for (let i = 0; i < 3; i++) celesta(Lx(21, 9.5) + i * .3, 66 + i * 3, .03);                         // three
whoosh(Lx(22, -1.2), .9, .07);
for (let i = 0; i < 12; i++) celesta(Lx(22, 3.4) + i * .22, [74, 78, 81, 86][i % 4] + (i > 6 ? 12 : 0), .022, (i % 3 - 1) * .5);
harp(DUR - 2.5, 74, .04); harp(DUR - 2.3, 69, .04); harp(DUR - 2.1, 62, .05);                      // iris out

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/meiosis_vo.wav');
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
writeWav('assets/meiosis_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/meiosis_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/meiosis_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/meiosis_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/meiosis_mix_n.wav', 'assets/meiosis_mix.wav');
console.log('wrote assets/meiosis_bgm.wav and assets/meiosis_mix.wav');

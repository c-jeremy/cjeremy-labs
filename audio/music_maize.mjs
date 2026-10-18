// audio/music_maize.mjs: the score for "Pip讲玉米雇杀手" (src/scenes/maize.js), synthesised from scratch.
//   node tools/make.mjs maize vo && node tools/make.mjs maize music   → assets/maize_bgm.wav and assets/maize_mix.wav
// Its own palette (not the kalimba/glock of mRNA, nor the e-piano/marimba/harp of meiosis): a nylon guitar
// (Karplus–Strong), vibraphone, upright bass, shaker, a low drone for the mystery, the wasp's buzz, and a clarinet that
// carries the recap motif. A minor (the mystery, the kill) ↔ C major (the call, the payoff), 88 bpm = PROJECT.bpm. Each section follows a voice line (times read from videos/maize.json, like the
// scenes' L(i, d)); the music ducks under the voice and breathes up in the long pauses between sections.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const MAN = JSON.parse(readFileSync('videos/maize.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
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
// nylon guitar (Karplus–Strong, warm), vibraphone (tremolo), upright bass (plucked sine), shaker, a clarinet for the
// recap motif, a low drone for the mystery, and the wasp's buzz
function guitar(t, m, v = .07, pan = 0, dec = .9965) {
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); let lp0 = 0; for (let i = 0; i < P; i++) { lp0 += ((rnd() * 2 - 1) - lp0) * .5; buf[i] = lp0; }
  let i = 0, prev = 0; add(t, 2.4, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = dec * .5 * (a + b); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .45; return v * 1.6 * prev * Math.min(1, tt / .003); });
}
const vibes = (t, m, v = .05, pan = 0, dec = 1.4) => { const f = hz(m); add(t, dec * 3, pan, tt => v * env(tt, .003, dec) * (1 + .25 * Math.sin(TAU * 5.2 * tt)) * (Math.sin(TAU * f * tt) + .22 * Math.sin(TAU * f * 4 * tt) * Math.exp(-tt * 6))); };
const ubass = (t, m, v = .12, len = BEAT * 1.6) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .008) * Math.exp(-tt / .9) * (tt > len ? Math.exp(-(tt - len) / .08) : 1); return v * e * Math.tanh(1.8 * (Math.sin(TAU * f * tt) + .3 * Math.sin(TAU * 2 * f * tt) * Math.exp(-tt * 8))); }); };
const pad = (t, len, ms, v = .02) => ms.forEach((m, j) => { for (const det of [-.07, .07]) { const f = hz(m + det), ph = rnd();
  add(t, len + 1.2, (j / (ms.length - 1 || 1)) * 1.4 - .7, tt => { const a = Math.min(1, tt / 1.0) * (tt > len ? Math.exp(-(tt - len) / .5) : 1), x = (f * tt + ph) % 1; return v * a * (1 - 4 * Math.abs(x - .5)) * .8; }); } });
const drone = (t, len, m, v = .03) => { const f = hz(m); add(t, len + 1.5, 0, tt => { const a = Math.min(1, tt / 1.6) * (tt > len ? Math.exp(-(tt - len) / .8) : 1); let s = 0; for (let k = 1; k < 7; k++) s += Math.sin(TAU * f * k * tt * (1 + .0015 * k)) / k; return v * a * s * (1 + .15 * Math.sin(TAU * .3 * tt)); }); };
const shaker = (t, v = .025, pan = .3) => { let hp = 0, x0 = 0; add(t, .12, pan, tt => { const x = rnd() * 2 - 1; hp = .7 * (hp + x - x0); x0 = x; return v * hp * env(tt, .02, .03); }); };
const rim = (t, v = .05, f = 1800) => add(t, .06, -.2, tt => v * Math.sin(TAU * f * tt) * Math.exp(-tt * 70));
const block = (t, v = .06, f = 900) => add(t, .15, .1, tt => v * Math.sin(TAU * f * tt) * Math.exp(-tt * 40));
const tom = (t, v = .16) => add(t, .5, 0, tt => v * Math.sin(TAU * (70 + 60 * Math.exp(-tt * 18)) * tt) * Math.exp(-tt * 7));
function clar(t, m, len, v = .045, pan = -.1) { const f = hz(m); add(t, len + .3, pan, tt => { const a = Math.min(1, tt / .06) * (tt > len ? Math.exp(-(tt - len) / .12) : 1), vb = 1 + .004 * Math.sin(TAU * 5 * tt) * Math.min(1, tt / .4), p = TAU * f * vb * tt;
  return v * a * (Math.sin(p) + .42 * Math.sin(3 * p) + .2 * Math.sin(5 * p) + .08 * Math.sin(7 * p)); }); }
function buzz(t, len, v = .03, f0 = 210, pan = 0) { let lp = 0; add(t, len, pan, tt => { const k = tt / len, f = f0 * (1 + .04 * Math.sin(TAU * 3 * tt)), x = ((f * tt) % 1) * 2 - 1; lp += (x - lp) * .25;
  return v * Math.sin(Math.PI * Math.min(1, k * 1.2)) * lp * (.75 + .25 * Math.sin(TAU * 31 * tt)); }); }
function whoosh(t, len, v = .07) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const strum = (t, ms, v = .05, gap = .03) => ms.forEach((m, i) => guitar(t + i * gap, m, v, (i / ms.length) - .5));
const run = (t, ms, step = .08, v = .04, inst = vibes) => ms.forEach((m, i) => inst(t + i * step, m, v, (i / ms.length) - .5));
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- harmony (A minor ↔ C major) ----------
const CH = { Am: [57, 60, 64, 69], Am7: [57, 60, 64, 67], F: [53, 57, 60, 65], Fmaj7: [53, 57, 60, 64], C: [48, 55, 60, 64], G: [55, 59, 62, 67], Dm: [50, 57, 62, 65], Dm7: [50, 57, 60, 65],
  E: [52, 56, 59, 64], E7: [52, 56, 62, 64], Em: [52, 55, 59, 64], Bb: [46, 53, 58, 62], Gsus: [55, 60, 62, 67] };
const ROOT = { Am: 33, Am7: 33, F: 29, Fmaj7: 29, C: 36, G: 31, Dm: 38, Dm7: 38, E: 28, E7: 28, Em: 28, Bb: 34, Gsus: 31 };
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    pad(t, len, ch, st.pad ?? .018);
    if (st.drone) drone(t, len, r, st.drone);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) ubass(tb, r + 12, .11, BEAT * 3.5);
      if (st.bass === 'pulse' && b % 2 === 0) ubass(tb, r + 12, .1);
      if (st.bass === 'walk') ubass(tb, r + 12 + [0, 3, 7, 10][b] - (b === 3 ? 0 : 0), .09, BEAT * .9);
      if (st.shake) { shaker(tb + BEAT / 2, st.shake); if (st.sixteenth) { shaker(tb + BEAT / 4, st.shake * .5, -.3); shaker(tb + 3 * BEAT / 4, st.shake * .5, -.3); } }
      if (st.rim && b === 3) rim(tb, st.rim);
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.eighth === false ? 1 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          (st.arp)(tb + e * BEAT / per, m, (st.arpV ?? .05) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
const MOTIF = [[0, 76, .5], [.5, 74, .5], [1, 72, 1], [2, 69, .5], [2.5, 72, .5], [3, 74, 1.5]];   // the recap theme (clarinet), in beats
const motif = (t, tr = 0, v = .04) => MOTIF.forEach(([b, m, d]) => clar(t + b * BEAT, m + tr, d * BEAT * .95, v));

// ---------- sections, one per shot ----------
// A: the crime. A minor mystery: drone, sparse guitar; the suspects; the still field
section(0, Lx(2, 0), ['Am', 'F', 'Dm', 'E'], { pad: .016, drone: .02, bass: 'one', arp: guitar, arpV: .045, skip: .45 });
section(Lx(2, 0), Lx(3, -1.9), ['Dm', 'Am', 'F', 'E7'], { pad: .02, drone: .024, arp: vibes, arpV: .025, eighth: false, skip: .5 });
// B: the tell — curious, then the experiment, the molecule, the irony (walking)
section(Lx(3, -1.9), Lx(4, -.4), ['C', 'G', 'Am', 'F'], { pad: .018, bass: 'pulse', shake: .018, arp: guitar, arpV: .045 });
section(Lx(4, -.4), Lx(5, -.6), ['Am', 'F', 'C', 'G'], { pad: .018, bass: 'pulse', shake: .02, rim: .03, arp: guitar, arpV: .045, skip: .2 });
section(Lx(5, -.6), Lx(6, 1.4), ['Fmaj7', 'G', 'Em', 'Am'], { pad: .02, bass: 'one', arp: vibes, arpV: .035 });
section(Lx(6, 1.4), Lx(7, -1.6), ['C', 'Am', 'Dm7', 'G'], { pad: .018, bass: 'walk', shake: .02, arp: guitar, arpV: .045 });
// C: the call — bright midday, then the flight drives
section(Lx(7, -1.6), Lx(8, 0), ['F', 'C', 'G', 'Am'], { pad: .02, bass: 'pulse', arp: vibes, arpV: .035 });
section(Lx(8, 0), Lx(9, -.3), ['F', 'G', 'C', 'Am'], { pad: .02, bass: 'pulse', shake: .018, arp: guitar, arpV: .045 });
section(Lx(9, -.3), Lx(10, -1.6), ['Am', 'F', 'G', 'E'], { pad: .02, bass: 'walk', shake: .026, sixteenth: true, rim: .035, arp: guitar, arpV: .05 });
// D: the kill (tense), the days, the payoff (bright), the recap (hush + clarinet)
section(Lx(10, -1.6), Lx(11, 0), ['Am', 'Dm', 'E', 'Am'], { pad: .018, drone: .016, bass: 'one', arp: vibes, arpV: .03, skip: .3 });
section(Lx(11, 0), Lx(12, -.6), ['Dm', 'Am', 'Bb', 'E'], { pad: .02, drone: .016, bass: 'pulse', arp: guitar, arpV: .04, skip: .35 });
section(Lx(12, -.6), Lx(13, -1.2), ['C', 'F', 'G', 'C'], { pad: .02, bass: 'pulse', shake: .02, arp: guitar, arpV: .05 });
section(Lx(13, -1.2), Lx(14, -1.6), ['Fmaj7', 'G', 'Em', 'Am'], { pad: .022, bass: 'one' });
// E: the ecosystem — warm late afternoon, the balance, the curves
section(Lx(14, -1.6), Lx(15, -.8), ['F', 'C', 'G', 'Am'], { pad: .02, bass: 'pulse', arp: guitar, arpV: .045 });
section(Lx(15, -.8), Lx(16, -.7), ['Fmaj7', 'C', 'Dm7', 'G'], { pad: .02, bass: 'one', arp: vibes, arpV: .03 });
section(Lx(16, -.7), Lx(17, -1.6), ['Am', 'F', 'C', 'G'], { pad: .02, bass: 'walk', shake: .02, arp: guitar, arpV: .045 });
// F: underground (low, darker), the gene (lift), the farm (bright)
section(Lx(17, -1.6), Lx(18, -.6), ['Am', 'Em', 'F', 'G'], { pad: .018, drone: .016, bass: 'one', arp: guitar, arpV: .04, oct: -12, skip: .3 });
section(Lx(18, -.6), Lx(19, -.7), ['Dm', 'Am', 'F', 'G'], { pad: .02, bass: 'pulse', arp: vibes, arpV: .03 });
section(Lx(19, -.7), Lx(20, -1.6), ['C', 'G', 'F', 'C'], { pad: .02, bass: 'pulse', shake: .022, arp: guitar, arpV: .05 });
// G: sunset — home, warm; the motif returns and lands
section(Lx(20, -1.6), DUR - 3.6, ['F', 'C', 'Am', 'G', 'F', 'C', 'Dm7', 'Gsus'], { pad: .022, bass: 'one', arp: guitar, arpV: .045 });
pad(DUR - 3.6, 3.0, CH.C, .024); vibes(DUR - 3.6, 72, .045, -.2, 2.2); vibes(DUR - 3.58, 76, .035, .2, 2.2); ubass(DUR - 3.6, 36, .1, 3.0);

// ---------- the recap motif ----------
motif(Lx(13, 12.3)); motif(Lx(21, 9.6), 0, .045);
clar(Lx(6, 9.0), 72, BEAT * 2, .03); clar(Lx(16, 12.0), 69, BEAT * 2.5, .03);

// ---------- stingers on the picture ----------
run(.1, [69, 72, 76], .14, .035);                                                                 // iris in
for (let i = 0; i < 14; i++) rim(Lx(1, 2.5) + i * .2, .022 + .01 * (i % 2), 2400);                // munching
whoosh(Lx(1, 3.3), .7, .05); whoosh(Lx(1, 7.1), .6, .05);                                         // out to the field / back in
buzz(Lx(1, 8.9), 1.7, .028, 220, .4); buzz(Lx(1, 13.0), 1.8, .024, 240, .5);                        // the wasp comes, the wasp goes
block(Lx(1, 10.8), .05); block(Lx(1, 11.25), .05);                                                 // antennae taps
tom(Lx(1, 11.9), .14); block(Lx(1, 11.92), .07, 420);                                             // the sting
run(Lx(1, 13.8), [76, 72, 69, 64, 60], .22, .03);                                                 // it slows, it stops
vibes(Lx(2, 3.4), 80, .04); vibes(Lx(2, 3.55), 83, .035);                                         // "不" — it was sent
guitar(Lx(2, 7.6), 64, .06); guitar(Lx(2, 9.7), 62, .06);                                         // suspects: no, no
whoosh(Lx(2, 10.4), 1.2, .05); drone(Lx(2, 11), 4, 33, .03);                                       // the still field
whoosh(Lx(3, -2.2), .9, .07);
vibes(Lx(3, 1.0), 76, .035); run(Lx(3, 4.6), [60, 64, 67, 72], .12, .03);                          // case file; the chain appears
vibes(Lx(3, 7.0), 79, .035); vibes(Lx(3, 9.2), 81, .035);                                          // producer; consumer
run(Lx(3, 10.6), [72, 76, 79, 84], .5, .03);                                                       // energy beads
for (const t of [Lx(4, 3.2), Lx(4, 3.35), Lx(4, 7.9), Lx(4, 8.05)]) rim(t, .05, 2800);            // snips
vibes(Lx(4, 5.0), 72, .03); vibes(Lx(4, 5.3), 74, .03);                                            // two thin wisps
block(Lx(4, 10.2), .06, 700);                                                                      // the dab
run(Lx(4, 11.8), [72, 74, 76, 79, 81, 84, 86, 88], .07, .035); for (let i = 0; i < 9; i++) block(Lx(4, 12.6) + i * .1, .025, 1100);   // whoosh of scent; nine marks
whoosh(Lx(5, -1.0), .9, .06);
vibes(Lx(5, 4.0), 74, .04); vibes(Lx(5, 6.0), 79, .04);                                            // fatty acid; amino acid
block(Lx(5, 9.0), .07, 600); vibes(Lx(5, 9.05), 84, .04);                                          // docks
run(Lx(5, 11.6), [79, 83, 86], .1, .03);                                                            // the thought
whoosh(Lx(6, 1.0), .7, .05);
for (let j = 0; j < 6; j++) guitar(Lx(6, 3.4) + j * .35, 72 + j * 2, .035);                        // tails travel
for (let j = 0; j < 6; j++) guitar(Lx(6, 5.8) + j * .1, 84 - j * 2, .03);                          // back out
block(Lx(6, 7.8), .05, 500); tom(Lx(6, 8.3), .08); vibes(Lx(6, 8.5), 76, .035); vibes(Lx(6, 8.7), 72, .035);   // betrayed itself
whoosh(Lx(7, -1.8), .9, .07);
for (let j = 0; j < 14; j++) vibes(Lx(7, 1.4) + j * .32, [72, 76, 79, 84][j % 4], .025, (j % 3 - 1) * .5);   // droplets made
whoosh(Lx(7, 6.1), .8, .06);
for (let i = 0; i < 6; i++) vibes(Lx(7, 9.0) + i * .25, 76 + i * 2, .03);                          // every leaf puffs
vibes(Lx(8, 5.0), 72, .04); vibes(Lx(8, 6.6), 76, .04); vibes(Lx(8, 9.6), 79, .045);               // source, channel, receiver
block(Lx(8, 11.6), .05); block(Lx(8, 11.9), .05);
buzz(Lx(9, -.3), 11.5, .02, 230, .2); whoosh(Lx(9, 2.4), 1.2, .05);                                // the flight
run(Lx(9, 8.6), [81, 79, 76, 72], .1, .035);                                                       // found it
buzz(Lx(10, -1.6), 1.6, .022, 230, .3); block(Lx(10, 0), .05);                                     // lands
block(Lx(10, 2.2), .05); block(Lx(10, 3.0), .05);
tom(Lx(10, 6.0), .14); block(Lx(10, 6.02), .07, 420);                                              // the sting
for (let i = 0; i < 7; i++) vibes(Lx(10, 7.0) + i * .1, 84 + (i % 3) * 2, .02);                    // eggs
vibes(Lx(10, 10.2), 76, .04); vibes(Lx(10, 10.6), 69, .04);                                        // + / −
for (let d = 0; d < 6; d++) { vibes(Lx(11, 4.7) + d * .76, 72, .025); vibes(Lx(11, 5.0) + d * .76, 64, .02); }   // days pass
for (let j = 0; j < 6; j++) guitar(Lx(11, 9.8) + j * .12, 76 + j, .03);                             // cocoons
run(Lx(12, 5.4), [72, 74, 76, 79, 81, 84, 86, 88, 91], .2, .028);                                   // kernels fill
for (let j = 0; j < 3; j++) buzz(Lx(12, 9.2) + j * .35, 2.2, .012, 260 + j * 20, .4);               // new wasps leave
whoosh(Lx(13, -1.5), .9, .07);
block(Lx(13, 2.5), .04); vibes(Lx(13, 3.0), 72, .03); block(Lx(13, 6.1), .04); vibes(Lx(13, 6.6), 76, .03);
run(Lx(13, 10.8), [72, 76, 79], .12, .035);
whoosh(Lx(14, -1.9), .9, .07);
for (let i = 0; i < 6; i++) vibes(Lx(14, 3.8) + i * .45, 79 + (i % 2) * 2, .022);                   // neighbours get ready
tom(Lx(14, 10.0), .08); run(Lx(14, 10.1), [72, 76, 79, 84, 88], .06, .035);                          // instant answer
whoosh(Lx(15, -1.1), .8, .06);
for (let i = 0; i < 3; i++) block(Lx(15, .4) + i * .3, .03, 900 + i * 100);
for (let i = 0; i < 4; i++) block(Lx(15, 5.0) + i * .45, .03 * (1 - i * .2), 700);                  // the scale rocks
vibes(Lx(15, 8.6), 84, .04);
run(Lx(16, 1.0), [69, 72, 76], .15, .03); run(Lx(16, 4.8), [64, 67, 71], .15, .03); run(Lx(16, 7.0), [76, 72, 69], .15, .03);
tom(Lx(16, 10.2), .08); vibes(Lx(16, 10.3), 72, .035);
whoosh(Lx(17, -1.9), .9, .07);
for (let i = 0; i < 10; i++) rim(Lx(17, 3.4) + i * .3, .018, 1500);                                 // the grub chews
run(Lx(17, 6.0), [60, 64, 67, 72, 76], .3, .03);                                                    // seep
tom(Lx(17, 10.9), .1); vibes(Lx(17, 11.0), 79, .035);
block(Lx(18, 5.6), .06, 300);                                                                        // ✗
run(Lx(18, 6.6), [60, 64, 67, 72, 76, 79, 84], .18, .03); vibes(Lx(18, 8.0), 88, .04);               // the gene goes in
vibes(Lx(18, 10.8), 79, .04); vibes(Lx(18, 10.95), 84, .04);                                         // ✓
whoosh(Lx(19, -1.0), .8, .06);
block(Lx(19, 6.8), .07, 260); tom(Lx(19, 6.85), .08);                                                // ✗ the spray
vibes(Lx(19, 4.4), 79, .04); vibes(Lx(19, 5.0), 84, .04);                                            // ✓ ✓
whoosh(Lx(20, -1.9), 1.4, .06);
run(Lx(20, 5.4), [72, 76, 79, 84], .3, .028);                                                         // the sniff
buzz(Lx(20, 9.4), 3.0, .012, 250, .6);                                                               // a far wasp turns
run(DUR - 3.8, [79, 76, 72], .2, .035);                                                              // iris out

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/maize_vo.wav');
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
writeWav('assets/maize_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/maize_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/maize_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/maize_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/maize_mix_n.wav', 'assets/maize_mix.wav');
console.log('wrote assets/maize_bgm.wav and assets/maize_mix.wav');

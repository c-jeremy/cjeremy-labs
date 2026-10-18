// audio/music_mendel.mjs: the score for "Pip讲孟德尔遗传定律" (src/scenes/mendel.js), synthesised from scratch.
//   node tools/make.mjs mendel vo && node tools/make.mjs mendel music   → assets/mendel_bgm.wav and assets/mendel_mix.wav
// Its own palette (not the kalimba/glock/pizz of mRNA and opto, nor the e-piano/marimba/harp/flute of meiosis): a nylon
// guitar (Karplus–Strong), a plucked upright bass, a music box, a woodblock, a shaker, a soft reed organ pad and a
// clarinet that carries the recap motif. G major, 88 bpm = PROJECT.bpm. Each shot gets its own chords; the ponder holds
// (the viewer is asked to think) get a hush and a little unresolved music-box "question" phrase, the same every time.
// The music ducks under the voice and breathes up in the long pauses.
import { readFileSync, writeFileSync } from 'node:fs';

const MAN = JSON.parse(readFileSync('videos/mendel.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const LEN = [13.43, 15.46, 16.01, 15.80, 16.76, 14.80, 12.40, 16.08, 15.70, 17.03, 16.66, 15.76, 17.44, 16.77, 13.15, 13.24, 14.82, 16.88, 16.22, 18.35, 15.48, 14.01, 17.69, 19.28, 14.43, 17.40, 13.06];
const END = i => ST[i - 1] + LEN[i - 1];                             // when line i stops speaking
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
function guitar(t, m, v = .07, pan = 0, dec = .995) {                // nylon string: Karplus–Strong with a soft pick
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); let lp0 = 0;
  for (let i = 0; i < P; i++) { lp0 += ((rnd() * 2 - 1) - lp0) * .5; buf[i] = lp0; }
  let i = 0, prev = 0; add(t, 2.6, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = dec * .5 * (a + b); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .6; return v * prev * 1.6 * Math.min(1, tt / .003); });
}
function ubass(t, m, v = .14, len = BEAT * 1.6) {                    // plucked upright bass: a thumpy sine with a little growl
  const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .008) * Math.exp(-tt / .7) * (tt > len ? Math.exp(-(tt - len) / .06) : 1);
    return v * e * Math.tanh(1.8 * (Math.sin(TAU * f * tt) + .3 * Math.sin(TAU * 2 * f * tt) * Math.exp(-tt * 6))); });
}
const mbox = (t, m, v = .05, pan = 0) => { const f = hz(m); add(t, 2.2, pan, tt => v * env(tt, .001, .55) * (Math.sin(TAU * f * tt) + .35 * Math.sin(TAU * f * 4.02 * tt) * Math.exp(-tt * 9) + .12 * Math.sin(TAU * f * 6.8 * tt) * Math.exp(-tt * 20))); };
const block = (t, v = .07, f = 900, pan = .2) => add(t, .12, pan, tt => v * Math.sin(TAU * f * tt * (1 + .4 * Math.exp(-tt * 60))) * Math.exp(-tt * 45));
const shaker = (t, v = .022, pan = -.3) => { let hp = 0, prev = 0; add(t, .12, pan, tt => { const x = rnd() * 2 - 1; hp = .85 * (hp + x - prev); prev = x; return v * hp * env(tt, .02, .04); }); };
const thump = (t, v = .16) => add(t, .5, 0, tt => v * Math.sin(TAU * (60 + 70 * Math.exp(-tt * 20)) * tt) * Math.exp(-tt * 8));
function organ(t, len, ms, v = .018) {                               // a soft reed-organ pad
  ms.forEach((m, j) => { const f = hz(m), ph = rnd();
    add(t, len + 1.2, (j / (ms.length - 1 || 1)) * 1.2 - .6, tt => { const a = Math.min(1, tt / .7) * (tt > len ? Math.exp(-(tt - len) / .5) : 1), x = f * tt + ph + .003 * Math.sin(tt * 4.5);
      return v * a * (Math.sin(TAU * x) + .3 * Math.sin(TAU * 2 * x) + .15 * Math.sin(TAU * 3 * x)) * .7; }); });
}
function clarinet(t, m, len, v = .05, pan = .1) {                    // odd harmonics, a breathy onset, a little vibrato
  const f = hz(m); let lp = 0;
  add(t, len + .3, pan, tt => { const a = Math.min(1, tt / .06) * (tt > len ? Math.exp(-(tt - len) / .09) : 1), vib = 1 + .004 * Math.sin(TAU * 5 * tt) * Math.min(1, tt / .5), x = TAU * f * vib * tt;
    lp += ((rnd() * 2 - 1) - lp) * .08; return v * a * (Math.sin(x) + .33 * Math.sin(3 * x) + .14 * Math.sin(5 * x) + .15 * lp); });
}
function whoosh(t, len, v = .07) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const gliss = (t, ms, step = .06, v = .045) => ms.forEach((m, i) => mbox(t + i * step, m, v, (i / ms.length) - .5));

// ---------- harmony (G major) ----------
const CH = { G: [55, 59, 62, 67], Gmaj7: [55, 59, 62, 66], C: [48, 55, 60, 64], Cmaj7: [48, 55, 59, 64], D: [50, 57, 62, 66], Dsus: [50, 57, 62, 67],
  Em: [52, 55, 59, 64], Em7: [52, 55, 62, 64], Am: [57, 60, 64, 69], Am7: [57, 60, 64, 67], Bm: [59, 62, 66, 71], B7: [59, 63, 66, 69], E: [52, 56, 59, 64], F: [53, 57, 60, 65] };
const ROOT = { G: 43, Gmaj7: 43, C: 36, Cmaj7: 36, D: 38, Dsus: 38, Em: 40, Em7: 40, Am: 45, Am7: 45, Bm: 47, B7: 47, E: 40, F: 41 };
// style: organ pad v, bass ('one' | 'pulse' | 'walk'), guitar pattern, music box, block, shaker
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    organ(t, len, ch.slice(1), st.pad ?? .016);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) ubass(tb, r, .13, BEAT * 3.2);
      if (st.bass === 'pulse' && b % 2 === 0) ubass(tb, r, .12);
      if (st.bass === 'walk') ubass(tb, r + [0, 4, 7, 9][b] - (b === 3 && (name === 'Em' || name === 'Am' || name === 'Bm') ? 2 : 0), .11, BEAT * .85);
      if (st.shaker) { shaker(tb + BEAT / 2, st.shaker); if (b % 2) shaker(tb, st.shaker * .7, .3); }
      if (st.block && b === 3) block(tb + BEAT / 2, st.block, 1100);
      if (st.gtr) { const pat = st.pat || [0, 2, 1, 3, 2, 3, 1, 2];
        for (let e = 0; e < 2; e++) { const i = b * 2 + e; if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue; guitar(tb + e * BEAT / 2, ch[pat[i % pat.length]] + 12, st.gtr * (e ? .75 : 1), ((i % 4) - 1.5) * .25); } }
      if (st.box && (b === 0 || b === 2) && hash(bar * 4 + b + t0) > (st.boxSkip ?? .4)) mbox(tb + BEAT * .5, ch[(b + bar) % 4] + 24, st.box, .4);
    }
  }
}
// the recap motif (clarinet), and the "think" phrase (music box, left hanging on A)
const MOTIF = [[0, 71, .75], [.75, 74, .25], [1, 79, 1], [2, 78, .5], [2.5, 76, .5], [3, 74, 1.5]];
const motif = (t, tr = 0, v = .045) => MOTIF.forEach(([b, m, d]) => clarinet(t + b * BEAT, m + tr, d * BEAT * .95, v));
const think = t => [[0, 79], [.5, 81], [1, 83], [2, 81]].forEach(([b, m], i) => mbox(t + b * BEAT, m, .05, -.2 + i * .15));

// ---------- sections ----------
// A: the paint table — playful
section(0, Lx(2, 0), ['G', 'C', 'D', 'G'], { pad: .014, bass: 'one', gtr: .05, skip: .35 });
section(Lx(2, 0), Lx(3, -1.5), ['Em', 'C', 'Am', 'D'], { pad: .016, bass: 'pulse', gtr: .05, skip: .2 });
// B: the garden — pastoral, then curious around the cross, bright for the counts
section(Lx(3, -1.5), Lx(5, -1), ['G', 'Em', 'C', 'D', 'G', 'Em', 'Am', 'D'], { pad: .015, bass: 'pulse', gtr: .055, box: .03, shaker: .012 });
section(Lx(5, -1), END(5), ['C', 'G', 'Am', 'Em'], { pad: .016, bass: 'walk', gtr: .05, block: .04, skip: .15 });
section(END(5), Lx(6, -.2), ['Am7'], { pad: .02 });                                           // ponder
section(Lx(6, -.2), END(6), ['C', 'D', 'G', 'Em'], { pad: .016, bass: 'pulse', gtr: .05 });
section(END(6), Lx(7, -.2), ['Em7'], { pad: .02 });                                           // ponder
section(Lx(7, -.2), Lx(9, 0), ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'], { pad: .015, bass: 'walk', gtr: .055, box: .03, shaker: .015 });
section(Lx(9, 0), Lx(10, -1.5), ['Am', 'D', 'G', 'Em'], { pad: .017, bass: 'one', gtr: .045 });
// C: the thinking board — sparse, ticking; hushes on every question
const BOARD = { pad: .015, bass: 'one', gtr: .04, block: .035, skip: .35 };
section(Lx(10, -1.5), END(10), ['G', 'Bm', 'C', 'D'], BOARD);
section(END(10), Lx(11, -.2), ['Am7'], { pad: .02 });
section(Lx(11, -.2), END(11), ['C', 'G', 'Am', 'D'], BOARD);
section(END(11), Lx(12, -.2), ['Em7'], { pad: .02 });
section(Lx(12, -.2), Lx(12, 6.4), ['Em', 'B7', 'Em', 'B7'], { pad: .018, bass: 'walk', gtr: .05, block: .05, shaker: .02 });   // 2 → 4 → 8!
section(Lx(12, 6.4), Lx(13, 0), ['C', 'D', 'G', 'G'], { pad: .016, bass: 'pulse', gtr: .05, box: .035 });
section(Lx(13, 0), END(13), ['Am', 'D', 'G', 'Em'], BOARD);
section(END(13), Lx(14, -.2), ['Am7', 'Am7'], { pad: .02 });
section(Lx(14, -.2), Lx(15, 0), ['G', 'C', 'D', 'G'], { pad: .016, bass: 'walk', gtr: .055, box: .035, shaker: .016 });
section(Lx(15, 0), END(15), ['Em', 'C', 'Am', 'D'], BOARD);
section(END(15), Lx(16, -.2), ['Am7'], { pad: .02 });
section(Lx(16, -.2), Lx(18, -1.2), ['C', 'D', 'Bm', 'Em', 'Am', 'D', 'G', 'G'], { pad: .016, bass: 'pulse', gtr: .05, block: .03, box: .03 });
// D: recap
section(Lx(18, -1.2), Lx(19, -1.6), ['Gmaj7', 'Cmaj7', 'Em7', 'D'], { pad: .02, bass: 'one', gtr: .035, skip: .4 });
// E: inside the seed — a little mysterious
section(Lx(19, -1.6), Lx(20, -1.6), ['Em', 'C', 'Am', 'B7'], { pad: .02, bass: 'one', box: .035, boxSkip: .2 });
// F: two traits — golden; hush on the two questions; the counting grooves
section(Lx(20, -1.6), END(20), ['G', 'C', 'G', 'D'], { pad: .016, bass: 'pulse', gtr: .05, shaker: .014 });
section(END(20), Lx(21, -.2), ['Am7'], { pad: .02 });
section(Lx(21, -.2), END(22), ['C', 'D', 'Em', 'Em', 'C', 'D', 'G', 'G'], { pad: .016, bass: 'walk', gtr: .05, block: .035 });
section(END(22), Lx(23, -.2), ['Em7', 'Em7'], { pad: .02 });
section(Lx(23, -.2), Lx(25, -1.6), ['G', 'Em', 'C', 'D', 'G', 'Bm', 'C', 'D'], { pad: .016, bass: 'walk', gtr: .055, box: .03, shaker: .016 });
// G: the grid
section(Lx(25, -1.6), Lx(26, -1.6), ['C', 'G', 'Am', 'D'], { pad: .018, bass: 'pulse', gtr: .045, block: .03 });
// H: the chromosomes' dance
section(Lx(26, -1.6), Lx(27, -1.6), ['G', 'Em', 'C', 'D'], { pad: .016, bass: 'walk', gtr: .06, shaker: .025, block: .04 });
// I: home — warm, the motif lands
section(Lx(27, -1.6), DUR - 3.2, ['G', 'C', 'Em', 'D'], { pad: .018, bass: 'pulse', gtr: .05 });
organ(DUR - 3.2, 2.6, CH.Gmaj7, .02); guitar(DUR - 3.2, 67, .06, -.2); guitar(DUR - 3.12, 71, .05, 0); guitar(DUR - 3.04, 74, .05, .2); ubass(DUR - 3.2, 43, .12, 2.6);

// ---------- motifs ----------
motif(Lx(18, 1.0)); motif(Lx(18, 12.8), 0, .04); motif(Lx(23, 14.0), 0, .04); motif(Lx(27, 9.6), 0, .05);
[END(5), END(6), END(10), END(11), END(13), END(15), END(20), END(22)].forEach(t => think(t + .4));
think(END(13) + 3.2);                                                                                // the long one: ask twice

// ---------- stingers on the picture ----------
const SEAMS = [Lx(3, -1.5), Lx(4, -1.2), Lx(5, -1), Lx(7, -1), Lx(8, -.8), Lx(10, -1.5), Lx(12, -1.6), Lx(13, -1.6), Lx(15, -1.6), Lx(18, -1.2), Lx(20, -1.6), Lx(22, -1.6), Lx(25, -1.6), Lx(27, -1.6)];
SEAMS.forEach(t => whoosh(t - .35, .8, .06));
gliss(Lx(19, -1.9), [74, 79, 83, 86], .05, .04);                                                     // flash into the seed
gliss(Lx(26, -1.6), [67, 71, 74, 79, 83], .07, .035);                                                // iris to the cell
gliss(.2, [67, 71, 74], .12, .04);                                                                   // iris in
// A
for (let i = 0; i < 8; i++) guitar(Lx(1, 2.4) + i * .3, [67, 71, 74, 79][i % 4], .03, (i % 3 - 1) * .4);   // stirring
thump(Lx(1, 6.0), .06); block(Lx(1, 6.4), .04, 700);                                                  // can't pull it apart
[Lx(1, 7.6), Lx(1, 7.9), Lx(1, 9.2), Lx(2, 1.4), Lx(2, 2.6), Lx(2, 3.2), Lx(2, 4.6)].forEach((t, i) => block(t, .05, 700 + i * 60));   // drops land
for (let i = 0; i < 5; i++) block(Lx(2, 5.6) + i * .25, .035, 600);
thump(Lx(2, 9.6), .1); gliss(Lx(2, 9.7), [79, 83, 86, 91], .05, .05);                                // the red one comes back
// B
mbox(Lx(3, 5.4), 86, .05); mbox(Lx(3, 5.55), 91, .04);                                              // the hat lands
for (let j = 0; j < 14; j++) block(Lx(3, 9.6) + j * .45, .03, 1200 + (j % 3) * 80);                   // counting
gliss(Lx(4, .6), [79, 81, 83, 86], .5, .025);                                                        // pollen in the closed flower
for (let g = 0; g < 3; g++) { guitar(Lx(4, 4.4) + g * .7, 67, .04); guitar(Lx(4, 4.65) + g * .7, 79, .035); }   // the same, again and again
mbox(Lx(4, 8.0), 83, .04); mbox(Lx(4, 9.5), 76, .04);
for (let i = 0; i < 5; i++) block(Lx(5, 1.8) + i * .3, .04, 1500);                                   // snip snip
whoosh(Lx(5, 3.4), .6, .04); block(Lx(5, 4.2), .05, 500);                                             // the bag drops
mbox(Lx(5, 5.9), 86, .035); mbox(Lx(5, 8.6), 88, .035);                                              // pollen on, pollen off
gliss(Lx(5, 10.0), [67, 71, 74, 79], .12, .03);                                                      // a pod grows
block(Lx(6, 4.4), .06, 700); gliss(Lx(6, 4.6), [79, 83, 86, 91, 95], .05, .045);                     // pod opens: all round!
thump(Lx(6, 6.2), .1);                                                                              // ✗ on the paint guess
gliss(Lx(7, .2), [55, 59, 62, 67, 71], .4, .03);                                                    // F1 grows
block(Lx(7, 5.6), .05, 700); block(Lx(7, 5.9), .05, 760); mbox(Lx(7, 6.6), 91, .05);                 // F2 pods; wrinkled is back
gliss(Lx(7, 9.4), [74, 79, 83, 86], .06, .045);                                                     // perfect match ✓
for (let i = 0; i < 16; i++) block(Lx(8, 2.4) + i * .27, .022, 900 + (i % 4) * 120, (i % 2 ? .4 : -.4));   // seeds pour
for (let i = 0; i < 4; i++) mbox(Lx(8, 7.4) + i * .15, [74, 74, 74, 67][i], .04);                   // 3 + 1
thump(Lx(9, 2.6), .05); block(Lx(9, 5.0), .07, 1600); mbox(Lx(9, 5.1), 91, .04);                      // paint melts; marbles clink
gliss(Lx(9, 7.2), [79, 83, 86], .1, .04);                                                           // 遗传因子
// C
mbox(Lx(10, 3.2), 83, .05); mbox(Lx(10, 9.4), 76, .05);                                              // a dark marble; a pale one
block(Lx(11, 1.8), .05, 1100); block(Lx(11, 4.0), .05, 1000);                                        // they arrive from each parent
gliss(Lx(11, 5.0), [67, 71, 74, 79], .08, .035);
for (let i = 0; i < 4; i++) block(Lx(12, 1.9) + i * .12, .04, 800); for (let i = 0; i < 8; i++) block(Lx(12, 3.7) + i * .08, .035, 700 + i * 40);
thump(Lx(12, 5.0), .1);                                                                             // ✗ 2 → 4 → 8
block(Lx(12, 8.6), .07, 1400); gliss(Lx(12, 9.0), [74, 79, 83, 86, 91], .08, .045);                   // the pair splits
[2.4, 3.7, 5.0, 6.3].forEach((d, i) => { block(Lx(14, d), .05, 1000 + i * 90); mbox(Lx(14, d + .05), [79, 79, 79, 71][i], .04); });   // the four meetings
gliss(Lx(14, 15.0), [74, 79, 83, 86, 91], .06, .05);                                                // 3 : 1 ✓
block(Lx(16, 1.0), .06, 1100); mbox(Lx(16, 1.1), 86, .045);                                          // wrinkled is the answer
mbox(Lx(16, 6.2), 79, .04); mbox(Lx(16, 7.2), 71, .04);                                              // round child, wrinkled child
for (let i = 0; i < 12; i++) block(Lx(17, .2) + i * .2, .025, 900 + (i % 3) * 100);
gliss(Lx(17, 2.4), [74, 79, 83, 86], .06, .045);                                                     // 1 : 1 ✓
[3.8, 5.8, 8.0].forEach((d, i) => mbox(Lx(17, d), [74, 79, 83][i], .045)); gliss(Lx(17, 8.8), [79, 83, 86, 91], .06, .04);
// D, E
block(Lx(18, 4.6), .05, 1400);
mbox(Lx(19, .6), 83, .04); mbox(Lx(19, .9), 79, .04);                                                // marbles = genes
thump(Lx(19, 6.8), .08); thump(Lx(19, 7.8), .06);                                                    // the broken gene; no enzyme
for (let i = 0; i < 10; i++) mbox(Lx(19, 8.9) + i * .1, 95 - i * 2, .02, (i % 2 ? .4 : -.4));          // water rushes in
whoosh(Lx(19, 10.6), 1.6, .05);                                                                      // and out: it crumples
gliss(Lx(19, 14.2), [74, 79, 83, 86], .06, .04);                                                     // one R is enough ✓
// F
mbox(Lx(20, 3.6), 86, .04); block(Lx(20, 8.0), .05, 800); gliss(Lx(20, 8.4), [79, 83, 86], .06, .04);   // yellow dominant; F1 all yellow-round
thump(Lx(21, 5.6), .08);                                                                            // bundled? ✗
[7.8, 10.0, 12.0, 14.0].forEach((d, i) => { block(Lx(21, d), .05, 900 + i * 100); gliss(Lx(21, d + .1), [67, 71, 74, 79].slice(0, 4 - i), .08, .03); });   // the four columns
gliss(Lx(22, .8), [86, 91], .1, .04); gliss(Lx(22, 2.2), [86, 91], .1, .04);                          // new combinations
block(Lx(22, 4.8), .06, 1500);                                                                       // the links snap
for (const d of [1.8, 5.6]) for (let j = 0; j < 3; j++) mbox(Lx(23, d) + j * .35, 74 + j * 5, .035);   // ×3, twice
block(Lx(23, 8.0), .04, 900); block(Lx(23, 8.6), .04, 900); gliss(Lx(23, 10.2), [79, 83, 86], .1, .04);   // the square
for (let i = 0; i < 4; i++) block(Lx(24, 4.4) + i * .5, .05, 1000 + i * 120);                          // four gametes
for (let i = 0; i < 10; i++) block(Lx(24, 11.6) + i * .2, .02, 900);
gliss(Lx(24, 13.6), [74, 79, 83, 86, 91], .06, .045);                                               // 1:1:1:1 ✓
// G, H
for (let i = 0; i < 8; i++) block(Lx(25, 2.6) + (i < 4 ? i * .3 : 2.1 + (i - 4) * .3), .035, 1100);
for (let i = 0; i < 7; i++) mbox(Lx(25, 6.6) + i * .18, 74 + (i % 4) * 3, .03);                     // sixteen
gliss(Lx(25, 9.0), [79, 83, 86, 91], .4, .03);
for (let i = 0; i < 4; i++) mbox(Lx(26, 2.0) + i * .4, [74, 79, 76, 81][i], .04);                     // marbles land on chromosomes
whoosh(Lx(26, 6.4), 2.2, .04); block(Lx(26, 9.0), .05, 700);                                          // homologs part
mbox(Lx(26, 10.4), 86, .04); gliss(Lx(26, 11.2), [74, 79, 83, 86], .1, .035);                         // four kinds
// I
for (let i = 0; i < 6; i++) block(Lx(27, 4.6) + i * .3, .03, 1300 + i * 60);                            // marbles roll
for (let i = 0; i < 5; i++) block(Lx(27, 7.4) + i * .45 * (1 - i * .12), .035, 1500);                  // the red one bounces home
gliss(Lx(27, 9.6), [79, 83, 86, 91], .08, .045);
gliss(DUR - 2.6, [79, 74, 67], .2, .04);                                                             // iris out

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/mendel_vo.wav');
const vl = verb(Lc, 0), vr = verb(Rc, 29);
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const a = Math.abs(vo[n] || 0); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00003);
  const t = n / SR, fade = Math.min(1, t / 1.0) * Math.min(1, (DUR - t) / 1.0), g = fade * (1 - .5 * duck);
  Lc[n] = (Lc[n] + vl[n] * .3) * g; Rc[n] = (Rc[n] + vr[n] * .3) * g; peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n]));
}
function writeWav(path, l, r, gain) {
  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(Math.tanh(l(n) * gain) * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(Math.tanh(r(n) * gain) * 32767), 46 + n * 4); }
  writeFileSync(path, buf);
}
const MUSIC = .14 / peak;
writeWav('assets/mendel_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/mendel_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);

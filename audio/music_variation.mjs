// audio/music_variation.mjs: the score for "Pip讲变异与伴性遗传" (src/scenes/variation.js), synthesised from scratch.
//   node tools/make.mjs variation vo && node tools/make.mjs variation music   → assets/variation_bgm.wav and assets/variation_mix.wav
// Its own palette (not the kalimba/glock/pizz of mRNA and opto, nor meiosis's e-piano/marimba/harp/flute): a plucked
// harpsichord (Karplus–Strong, bright) for the palace, a vibraphone with tremolo, an FM music box for "it worked" and
// reveals, a bowed low string pad, a soft timpani, brushed noise and a woody clarinet that carries the recap motif.
// D minor (the mystery) → F major (the answer). 88 bpm = PROJECT.bpm. Each section follows a voice line (times read
// from videos/variation.json, like the scenes' L(i, d)); the music ducks under the voice and breathes up in the gaps.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const MAN = JSON.parse(readFileSync('videos/variation.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
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
function harpsi(t, m, v = .06, pan = 0) {                       // a bright Karplus–Strong pluck with a little body
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); for (let i = 0; i < P; i++) buf[i] = rnd() * 2 - 1;
  let i = 0; add(t, 1.6, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = .9985 * (.72 * a + .28 * b); buf[i] = y; i = (i + 1) % P; return v * y * Math.min(1, tt / .001); });
}
const vibes = (t, m, v = .05, pan = 0, len = 1.8) => { const f = hz(m); add(t, len, pan, tt => v * env(tt, .003, .9) * (1 + .35 * Math.sin(TAU * 5.5 * tt)) * (Math.sin(TAU * f * tt) + .2 * Math.sin(TAU * f * 4 * tt) * Math.exp(-tt * 8))); };
const mbox = (t, m, v = .045, pan = 0) => { const f = hz(m); add(t, 2.2, pan, tt => v * env(tt, .001, .6) * Math.sin(TAU * f * tt + 2.2 * Math.exp(-tt * 6) * Math.sin(TAU * f * 5.4 * tt))); };
const pad = (t, len, ms, v = .02) => ms.forEach((m, j) => { for (const det of [-.07, .07]) { const f = hz(m + det), ph = rnd(); let lp = 0;
  add(t, len + 1.2, (j / (ms.length - 1 || 1)) * 1.4 - .7, tt => { const a = Math.min(1, tt / 1.0) * (tt > len ? Math.exp(-(tt - len) / .5) : 1), x = (f * tt + ph + .003 * Math.sin(tt * 4.6)) % 1;
    lp += ((2 * x - 1) - lp) * .08; return v * a * lp * 1.6; }); } });             // a filtered saw: bowed strings
const bass = (t, m, v = .12, len = BEAT * 1.8) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .02) * Math.exp(-tt / 1.3) * (tt > len ? Math.exp(-(tt - len) / .08) : 1); return v * e * Math.tanh(1.5 * (Math.sin(TAU * f * tt) + .2 * Math.sin(TAU * 2 * f * tt))); }); };
const brush = (t, v = .03, pan = .25) => { let lp = 0; add(t, .22, pan, tt => { lp += ((rnd() * 2 - 1) - lp) * .35; return v * lp * env(tt, .015, .06); }); };
const rim = (t, v = .05) => add(t, .06, -.2, tt => v * Math.sin(TAU * 1700 * tt) * Math.exp(-tt * 70));
const timp = (t, v = .16, m = 38) => add(t, 1.2, 0, tt => v * Math.sin(TAU * (hz(m) + 30 * Math.exp(-tt * 20)) * tt) * Math.exp(-tt * 3.2));
function clarinet(t, m, len, v = .05, pan = -.1) { const f = hz(m); let lp = 0;
  add(t, len + .3, pan, tt => { const a = Math.min(1, tt / .06) * (tt > len ? Math.exp(-(tt - len) / .1) : 1), vib = 1 + .003 * Math.sin(TAU * 5 * tt) * Math.min(1, tt / .5);
    const ph = (f * vib * tt) % 1, sq = ph < .5 ? 1 : -1; lp += (sq - lp) * .12; return v * a * (lp * .7 + .3 * Math.sin(TAU * f * vib * tt)); }); }
function whoosh(t, len, v = .07) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const zap = (t, v = .04) => add(t, .5, .3, tt => v * Math.sin(TAU * (2400 - 3000 * tt) * tt) * Math.exp(-tt * 6));
function run(t, ms, step = .06, v = .04, ins = harpsi) { ms.forEach((m, i) => ins(t + i * step, m, v, (i / ms.length) - .5)); }

// ---------- harmony ----------
const CH = { Dm: [62, 65, 69, 74], Dm7: [62, 65, 69, 72], Bb: [58, 62, 65, 70], Bbmaj7: [58, 62, 65, 69], Gm: [55, 62, 67, 70], Gm7: [55, 62, 65, 70], A: [57, 64, 69, 73], A7: [57, 64, 67, 73],
  F: [53, 60, 65, 69], Fmaj7: [53, 60, 64, 69], C: [55, 60, 64, 67], Csus: [55, 60, 65, 67], Am: [57, 60, 64, 69], Eb: [58, 63, 67, 70] };
const ROOT = { Dm: 38, Dm7: 38, Bb: 34, Bbmaj7: 34, Gm: 43, Gm7: 43, A: 45, A7: 45, F: 41, Fmaj7: 41, C: 36, Csus: 36, Am: 45, Eb: 39 };
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    pad(t, len, ch, st.pad ?? .018);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) bass(tb, r, .11, BEAT * 3.5);
      if (st.bass === 'pulse' && b % 2 === 0) bass(tb, r, .1);
      if (st.bass === 'walk') bass(tb, r + [0, 3, 7, 10][b] - (name.startsWith('A') || name.startsWith('F') || name === 'C' || name === 'Bb' ? (b === 1 ? -1 : 0) : 0), .09, BEAT * .9);
      if (st.brush) { if (b % 2) brush(tb, st.brush); brush(tb + BEAT / 2, st.brush * .45, -.25); }
      if (st.rim && b === 3) rim(tb + BEAT * .5, st.rim);
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.sixteenth ? 4 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          (st.arp)(tb + e * BEAT / per, m, (st.arpV ?? .04) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
const MOTIF = [[0, 69, .75], [.75, 70, .25], [1, 72, 1], [2, 74, .5], [2.5, 72, .5], [3, 69, 1.4]];   // the recap theme, in beats
const motif = (t, tr = 0, v = .045) => MOTIF.forEach(([b, m, d]) => clarinet(t + b * BEAT, m + tr, d * BEAT * .95, v));

// A: the palace — a stately harpsichord in D minor; the nursery lighter; back to the tree, tense
section(0, Lx(2, -.6), ['Dm', 'Bb', 'Gm', 'A'], { pad: .018, bass: 'one', arp: harpsi, arpV: .035, skip: .3 });
section(Lx(2, -.6), Lx(3, -.4), ['F', 'C', 'Dm', 'Bb', 'Gm', 'A'], { pad: .016, bass: 'pulse', arp: vibes, arpV: .03, skip: .45 });
section(Lx(3, -.4), Lx(4, -1.4), ['Dm', 'Gm', 'Bb', 'A7'], { pad: .02, bass: 'pulse', brush: .018, arp: harpsi, arpV: .035 });
// B: the blood (a pulse), the nucleus (vibes, night), the splice (tense)
section(Lx(4, -1.4), Lx(5, -.6), ['Dm', 'Dm', 'Bb', 'A', 'Gm', 'Gm', 'A', 'A'], { pad: .018, bass: 'pulse', brush: .02, rim: .03 });
section(Lx(5, -.6), Lx(6, -.4), ['Bbmaj7', 'Gm7', 'Dm7', 'A'], { pad: .02, bass: 'one', arp: vibes, arpV: .03, oct: 12, skip: .35 });
section(Lx(6, -.4), Lx(7, -2.4), ['Gm', 'A', 'Dm', 'Eb'], { pad: .02, bass: 'walk', brush: .02, arp: vibes, arpV: .03, skip: .3 });
// C: the workshop — lighter, a steady curious groove in F
section(Lx(7, -2.4), Lx(8, -.7), ['F', 'C', 'Dm', 'Bb'], { pad: .016, bass: 'pulse', brush: .018, arp: harpsi, arpV: .03 });
section(Lx(8, -.7), Lx(9, -1.3), ['Bb', 'C', 'Am', 'Dm'], { pad: .016, bass: 'walk', brush: .02, rim: .03, arp: harpsi, arpV: .03, skip: .2 });
section(Lx(9, -1.3), Lx(10, -.7), ['Dm', 'Gm', 'A', 'Dm'], { pad: .018, bass: 'pulse', brush: .022, rim: .035, arp: vibes, arpV: .03, sixteenth: true, skip: .4 });
section(Lx(10, -.7), Lx(11, -1.0), ['F', 'Am', 'Bb', 'C'], { pad: .016, bass: 'pulse', brush: .018, arp: harpsi, arpV: .03 });
section(Lx(11, -1.0), Lx(12, -.8), ['Gm', 'Dm', 'Bb', 'A'], { pad: .018, bass: 'one', arp: harpsi, arpV: .03, skip: .35 });
section(Lx(12, -.8), Lx(13, -1.6), ['F', 'C', 'Bb', 'F'], { pad: .016, bass: 'pulse', brush: .018, arp: vibes, arpV: .028 });
// D: the recap — a hush; the motif lands in the gap after the line
section(Lx(13, -1.6), Lx(14, -1.8), ['Bbmaj7', 'F', 'Gm7', 'A'], { pad: .02, bass: 'one' });
// E: the lilac board — X and Y, carriers, the cross
section(Lx(14, -1.8), Lx(16, -.6), ['Dm', 'Bb', 'F', 'C', 'Gm', 'Bb', 'A', 'A'], { pad: .016, bass: 'pulse', brush: .016, arp: vibes, arpV: .028, skip: .3 });
section(Lx(16, -.6), Lx(17, -.7), ['Gm', 'Dm', 'Bb', 'A7'], { pad: .02, bass: 'walk', brush: .02, rim: .03, arp: harpsi, arpV: .03 });
section(Lx(17, -.7), Lx(18, -.7), ['F', 'C', 'Dm', 'Bb'], { pad: .016, bass: 'pulse', brush: .018, arp: harpsi, arpV: .03 });
section(Lx(18, -.7), Lx(19, -2.0), ['Dm', 'Bb', 'Gm', 'A'], { pad: .018, bass: 'pulse', brush: .02, arp: vibes, arpV: .03 });
// F: why boys; the recap
section(Lx(19, -2.0), Lx(21, -1.0), ['Gm', 'Dm', 'Bb', 'C', 'F', 'C', 'Dm', 'A'], { pad: .016, bass: 'pulse', brush: .018, arp: harpsi, arpV: .028, skip: .25 });
section(Lx(21, -1.0), Lx(22, -1.4), ['Bbmaj7', 'F', 'Gm7', 'C'], { pad: .02, bass: 'one' });
// G: the tree at dusk — the same harpsichord, now resolving to F
section(Lx(22, -1.4), Lx(23, 0), ['Dm', 'Bb', 'Gm', 'A'], { pad: .018, bass: 'pulse', arp: harpsi, arpV: .034 });
section(Lx(23, 0), Lx(24, 0), ['Bb', 'C', 'F', 'F'], { pad: .018, bass: 'pulse', brush: .016, arp: harpsi, arpV: .034 });
section(Lx(24, 0), Lx(25, -.7), ['Dm', 'Bb', 'C', 'F'], { pad: .02, bass: 'walk', brush: .02, arp: vibes, arpV: .03 });
// H: the fix — warm, F major, to the end
section(Lx(25, -.7), DUR - 3.4, ['F', 'C', 'Dm', 'Bb'], { pad: .018, bass: 'pulse', arp: harpsi, arpV: .03 });
pad(DUR - 3.4, 2.8, CH.Fmaj7, .022); vibes(DUR - 3.4, 77, .04, -.2, 2.6); vibes(DUR - 3.38, 81, .03, .2, 2.6); bass(DUR - 3.4, 41, .1, 2.8);

// ---------- the recap motif, at the three "so" moments ----------
motif(Lx(13, 10.9), 0, .045); motif(Lx(21, 9.7), 0, .045); motif(Lx(24, 14.3) - .2, 5, .045);

// ---------- stingers on the picture ----------
run(.2, [62, 65, 69], .15, .04);                                                                   // iris in
for (let k = 0; k < 6; k++) vibes(Lx(1, 2.0 + k * .3), 74 + k, .02);                               // ancestors, clean
timp(Lx(1, 4.4), .12, 38); mbox(Lx(1, 4.45), 75, .04); mbox(Lx(1, 4.6), 74, .035);                 // a red spark from nowhere
run(Lx(1, 6.4), [81, 77, 74, 70, 69, 65, 62], .25, .03, vibes);                                     // down the branches
whoosh(Lx(2, -1.4), 1.0, .06);
mbox(Lx(2, 4.0), 81, .04); mbox(Lx(2, 4.2), 86, .035);                                             // baby Leopold
for (let s = 0; s < 4; s++) harpsi(Lx(2, 6.0 + s * .4), 74 + s * 2, .025);                          // toddling
timp(Lx(2, 7.6), .16, 43); rim(Lx(2, 7.6), .06);                                                    // bonk
pad(Lx(2, 8.4), 2.0, [50, 53, 57], .016); mbox(Lx(2, 10.1), 63, .03);                              // the bruise; the drop
whoosh(Lx(3, -1.0), .9, .06);
[6.0, 6.7, 7.5, 8.2].forEach((d, i) => { timp(Lx(3, d), .08, 38 + i * 2); harpsi(Lx(3, d), [74, 77, 81, 86][i], .04); });   // four houses
for (let k = 0; k < 3; k++) vibes(Lx(3, 12.3 + k * .2), 62 + k * 3, .03);                           // all boys
whoosh(Lx(4, -1.7), .9, .07);
timp(Lx(4, .2), .14, 40); rim(Lx(4, .3), .05);                                                      // the tear
for (let i = 0; i < 6; i++) rim(Lx(4, 3.4 + i * .16), .03);                                         // platelets stick
for (let i = 0; i < 6; i++) vibes(Lx(4, 4.6 + i * .45), [62, 65, 69, 72, 74, 77][i], .035);         // the relay
run(Lx(4, 7.3), [74, 77, 81, 86], .18, .03, mbox); mbox(Lx(4, 8.3), 89, .04);                       // the net; ✓
whoosh(Lx(4, 10.6), .7, .05); vibes(Lx(4, 10.8), 65, .03);                                          // IX goes
for (let i = 0; i < 3; i++) vibes(Lx(4, 13.3 + i * .4), [62, 65, 69][i], .035);                     // run 2 …
timp(Lx(4, 14.3), .1, 37); vibes(Lx(4, 14.4), 63, .03); rim(Lx(4, 15.0), .05);                      // … stops; ✗
whoosh(Lx(5, -1.2), .8, .08);                                                                       // whip pan
mbox(Lx(5, 1.4), 86, .035); whoosh(Lx(5, 3.6), 1.0, .06);                                           // the bone; the dive
run(Lx(5, 5.6), [62, 65, 69, 72, 74], .2, .025, vibes);                                             // the gene lights gold
vibes(Lx(5, 8.8), 74, .04); mbox(Lx(5, 10.4), 81, .03); mbox(Lx(5, 10.6), 81, .03);                 // the rung; A–T
timp(Lx(5, 12.0), .1, 45); mbox(Lx(5, 12.3), 86, .045); mbox(Lx(5, 12.5), 90, .04);                 // → G–C
rim(Lx(6, 1.6), .05); rim(Lx(6, 1.75), .05); run(Lx(6, 2.6), [74, 77, 81], .12, .03, vibes);        // the cut; the intron leaves
for (let j = 0; j < 8; j++) rim(Lx(6, 4.8 + j * .28), j < 4 ? .03 : .045);                          // codons march
timp(Lx(6, 7.5), .12, 38); for (let j = 0; j < 7; j++) harpsi(Lx(6, 9.8 + j * .2), j < 4 ? 74 + j * 2 : 63 - j, .03);
whoosh(Lx(7, -2.7), .9, .07);
mbox(Lx(7, 2.7), 81, .04); mbox(Lx(7, 4.3), 84, .04); timp(Lx(7, 5.2), .07, 45);                    // swap; add; take away
for (let k = 0; k < 3; k++) vibes(Lx(7, 8.4) + k * .05, [69, 74, 77][k], .03);
mbox(Lx(8, 2.0), 81, .035); mbox(Lx(8, 5.0), 86, .03); mbox(Lx(8, 6.6), 77, .035);
for (let j = 0; j < 4; j++) harpsi(Lx(8, 7.6 + j * .3), 70 - j * 2, .035);                          // everything downstream changes
timp(Lx(8, 11.3), .08, 38); vibes(Lx(8, 11.4), 63, .03);
harpsi(Lx(9, 2.2), 69, .03); harpsi(Lx(9, 3.0), 72, .03); rim(Lx(9, 4.1), .06);                     // the enzyme; a wrong piece
zap(Lx(9, 5.8), .05); zap(Lx(9, 6.9), .035); mbox(Lx(9, 9.0), 79, .03); whoosh(Lx(9, 10.0), .9, .04);   // UV; X-ray; the drop; the virus
for (let i = 0; i < 3; i++) mbox(Lx(10, 1.0 + i * .9), [74, 81, 77][i], .035);                     // marks at random
whoosh(Lx(10, 4.6), 1.1, .05); whoosh(Lx(10, 5.8), .5, .05);
timp(Lx(10, 9.4), .06, 40); mbox(Lx(10, 12.9), 86, .04); mbox(Lx(10, 13.05), 89, .035);
timp(Lx(11, 3.4), .08, 38); mbox(Lx(11, 3.5), 75, .04);                                            // the spark in a spermatogonium
whoosh(Lx(11, 5.4), 1.2, .04); mbox(Lx(11, 6.6), 81, .04); mbox(Lx(11, 6.8), 86, .035);             // baby Victoria
for (let g = 0; g < 3; g++) vibes(Lx(11, 10.2 + g * .6), 65 + g * 4, .03);
mbox(Lx(12, 1.5), 81, .04); run(Lx(12, 7.4), [69, 74, 77, 81], .1, .03); timp(Lx(12, 11.8), .08, 43); harpsi(Lx(12, 13.4), 77, .04);
whoosh(Lx(13, -1.9), .9, .07);
mbox(Lx(13, 1.9), 81, .03); mbox(Lx(13, 3.6), 77, .03); mbox(Lx(13, 9.9), 86, .035);
whoosh(Lx(14, -2.1), .9, .07);
mbox(Lx(14, -.4), 74, .03); vibes(Lx(14, 1.3), 77, .035); mbox(Lx(14, 4.8), 74, .03); mbox(Lx(14, 6.5), 74, .03); mbox(Lx(14, 8.5), 69, .03); rim(Lx(14, 10.6), .05);
for (let j = 0; j < 5; j++) vibes(Lx(15, 5.4 + j * .25), 72 + j * 2, .025); mbox(Lx(15, 7.0), 84, .04); timp(Lx(15, 8.3), .05, 45);
rim(Lx(16, 2.0), .05); timp(Lx(16, 6.2), .1, 38); pad(Lx(16, 6.5), 1.6, [50, 53, 57], .016);      // no backup; ✗
mbox(Lx(16, 11.4), 77, .03); mbox(Lx(16, 11.6), 81, .03);
[.8, 1.4, 5.0, 5.5].forEach((d, i) => harpsi(Lx(17, d), [74, 70, 77, 81][i], .04)); timp(Lx(17, 3.1), .06, 38);
for (let i = 0; i < 9; i++) harpsi(Lx(17, 8.2 + i * .12), [65, 69, 72, 77, 81, 77, 72, 69, 74][i], .03);
timp(Lx(17, 10.4), .07, 38); mbox(Lx(17, 13.0), 81, .03);
whoosh(Lx(18, .4), .9, .04); whoosh(Lx(18, 2.0), .8, .04); rim(Lx(18, 3.4), .05); mbox(Lx(18, 5.0), 84, .035);
mbox(Lx(18, 7.4), 81, .03); whoosh(Lx(18, 9.6), 1.0, .04); timp(Lx(18, 11.4), .08, 38);
run(Lx(18, 13.2), [69, 74, 70, 77, 72, 81], .2, .03, vibes);                                       // the zigzag
whoosh(Lx(19, -2.3), .9, .07);
whoosh(Lx(19, 5.0), .8, .04); whoosh(Lx(19, 6.6), .8, .04); timp(Lx(19, 7.4), .07, 38);
for (let j = 0; j < 7; j++) rim(Lx(19, 9.8 + j * .1), .03); timp(Lx(19, 10.4), .08, 36);            // the balance tips
for (let i = 0; i < 14; i++) mbox(Lx(20, 3.2 + i * .09), 74 + (i % 5) * 2, .015); mbox(Lx(20, 6.6), 81, .04);   // 7%; 0.5%
whoosh(Lx(20, 9.0), .7, .04); for (let i = 0; i < 8; i++) vibes(Lx(20, 11.4 + i * .1), 70 + i, .015);
whoosh(Lx(21, -1.3), .8, .06); vibes(Lx(21, 7.6), 69, .035); vibes(Lx(21, 8.7), 74, .035);
whoosh(Lx(22, -1.7), .9, .07);
whoosh(Lx(22, 3.4), .8, .04); mbox(Lx(22, 5.0), 81, .04); timp(Lx(22, 8.4), .08, 38);              // Russia: a crown; Alexei
whoosh(Lx(22, 9.6), .8, .04); mbox(Lx(22, 11.2), 84, .04); timp(Lx(22, 12.8), .07, 38); timp(Lx(22, 13.0), .06, 36);
whoosh(Lx(23, -.2), .8, .04); mbox(Lx(23, 1.8), 84, .04); run(Lx(23, 3.8), [72, 77, 81], .2, .03, vibes);   // Edward VII; the gold X
[5.6, 7.8, 8.8].forEach((d, i) => mbox(Lx(23, d), [81, 84, 89][i], .035));                         // clean, clean, clean
mbox(Lx(24, .4), 77, .03); mbox(Lx(24, 2.8), 81, .04); mbox(Lx(24, 4.7), 77, .03);
timp(Lx(24, 10.2), .07, 41); timp(Lx(24, 11.9), .07, 41); run(Lx(24, 12.8), [65, 69, 72, 77, 81], .1, .03, mbox);
whoosh(Lx(25, -1.0), .8, .06);
whoosh(Lx(25, 1.0), 2.0, .04); rim(Lx(25, 3.2), .05); run(Lx(25, 3.4), [72, 77, 81, 84, 89], .3, .03, vibes);   // the capsid; the gene goes in
for (let i = 0; i < 8; i++) mbox(Lx(25, 6.0 + i * .35), [77, 81, 84, 81][i % 4], .02);              // factor IX streams out
run(Lx(25, 9.6), [65, 69, 72, 77, 81, 84], .12, .03);                                              // the bruise fades
harpsi(DUR - 2.5, 77, .04); harpsi(DUR - 2.3, 72, .04); harpsi(DUR - 2.1, 65, .05);                // iris out

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/variation_vo.wav');
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
writeWav('assets/variation_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/variation_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/variation_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/variation_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/variation_mix_n.wav', 'assets/variation_mix.wav');
console.log('wrote assets/variation_bgm.wav and assets/variation_mix.wav');

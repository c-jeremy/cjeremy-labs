// music_amnesia.mjs: the score for "Pip讲消失的三年" (src/scenes/amnesia.js), synthesised from scratch.
//   node make.mjs amnesia vo && node make.mjs amnesia music   → assets/amnesia_bgm.wav and assets/amnesia_mix.wav
// Its own palette (not the kalimba/glock of mRNA, the e-piano/marimba/harp/flute of meiosis, nor the guitars, music
// boxes and clarinets of maize, mendel and variation): a felt piano, a glass harmonica for the memory pearls, a bowed
// low-string pad, a fretless sine bass, a soft clock tick for time passing, a heartbeat thump for the tense moments, and
// an oboe that carries the recap motif. D minor (the mystery) opening into F major (the answers), 84 bpm = PROJECT.bpm.
// Each section follows a voice line (times read from videos/amnesia.json, like the scenes' L(i, d)); the music ducks
// under the voice and breathes up in the long pauses between sections.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const MAN = JSON.parse(readFileSync('videos/amnesia.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const Lc = new Float32Array(N), Rc = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 41; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); Lc[i0 + i] += v * gl; Rc[i0 + i] += v * gr; }
}
const env = (tt, a, d) => (tt < a ? tt / a : Math.exp(-(tt - a) / d));
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- instruments ----------
// felt piano: a few inharmonic-ish partials, a soft felt thump, quick high-partial decay
function piano(t, m, v = .06, pan = 0, len = 2.4) { const f = hz(m), P = [[1, 1, 1.2], [2.003, .45, .7], [3.01, .2, .45], [4.02, .08, .3]]; let lp = 0;
  add(t, len + .5, pan, tt => { const rel = tt > len ? Math.exp(-(tt - len) / .15) : 1; let s = 0; for (const [k, a, d] of P) s += a * Math.sin(TAU * f * k * tt) * Math.exp(-tt / d / (1 + f / 900));
    lp += ((rnd() * 2 - 1) - lp) * .08; return v * rel * (Math.min(1, tt / .004) * s * .7 + lp * .6 * Math.exp(-tt * 60)); }); }
// glass harmonica: pure sines, slow swell, a slight beating shimmer
function glass(t, m, len, v = .03, pan = 0) { const f = hz(m);
  add(t, len + 1.2, pan, tt => { const a = Math.min(1, tt / .35) * (tt > len ? Math.exp(-(tt - len) / .6) : 1); return v * a * (Math.sin(TAU * f * tt) + .3 * Math.sin(TAU * f * 2.001 * tt) * (1 + .3 * Math.sin(TAU * 4.5 * tt)) + .12 * Math.sin(TAU * f * 3.002 * tt)); }); }
const ding = (t, m, v = .04, pan = 0) => glass(t, m, .05, v, pan);
// bowed low strings: band-limited saw (additive), slow attack, gentle vibrato
const strings = (t, len, ms, v = .016) => ms.forEach((m, j) => { for (const det of [-.07, .07]) { const f = hz(m + det), ph = rnd() * TAU;
  add(t, len + 1.4, (j / (ms.length - 1 || 1)) * 1.2 - .6, tt => { const a = Math.min(1, tt / 1.1) * (tt > len ? Math.exp(-(tt - len) / .6) : 1), vib = 1 + .003 * Math.sin(TAU * 5 * tt + ph); let s = 0; for (let k = 1; k <= 7; k++) s += Math.sin(TAU * f * vib * k * tt + ph * k) / k * (k > 4 ? .5 : 1); return v * a * s * .6; }); } });
const bass = (t, m, v = .11, len = BEAT * 1.8, slide = 0) => { const f = hz(m); let ph = 0; add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .03) * Math.exp(-tt / 1.6) * (tt > len ? Math.exp(-(tt - len) / .1) : 1), ff = f * (1 + slide * Math.exp(-tt * 12)); ph += TAU * ff / SR; return v * e * (Math.sin(ph) + .15 * Math.sin(2 * ph)); }); };
const tick = (t, v = .03, hi = 1) => add(t, .05, hi ? .3 : -.3, tt => v * Math.sin(TAU * (hi ? 2600 : 1900) * tt) * Math.exp(-tt * 140));
const beat = (t, v = .14) => { add(t, .35, 0, tt => v * Math.sin(TAU * (55 + 40 * Math.exp(-tt * 25)) * tt) * Math.exp(-tt * 9)); add(t + .22, .3, 0, tt => v * .6 * Math.sin(TAU * (50 + 30 * Math.exp(-tt * 25)) * tt) * Math.exp(-tt * 10)); };
function oboe(t, m, len, v = .04, pan = -.1) { const f = hz(m), H = [1, .9, .7, .45, .35, .2, .12];
  add(t, len + .25, pan, tt => { const a = Math.min(1, tt / .06) * (tt > len ? Math.exp(-(tt - len) / .08) : 1), vib = 1 + .005 * Math.sin(TAU * 5.4 * tt) * Math.min(1, tt / .5); let s = 0; H.forEach((h, k) => s += h * Math.sin(TAU * f * vib * (k + 1) * tt)); return v * a * s * .35; }); }
function whoosh(t, len, v = .07) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const thud = (t, v = .14) => add(t, .5, 0, tt => v * Math.sin(TAU * (70 + 60 * Math.exp(-tt * 18)) * tt) * Math.exp(-tt * 7));
const zap = (t, v = .03) => { let lp = 0; add(t, .25, .2, tt => { lp += ((rnd() * 2 - 1) - lp) * .7; return v * lp * Math.exp(-tt * 18) * (Math.sin(TAU * 60 * tt) > 0 ? 1 : .3); }); };
const snip = (t, v = .05) => { add(t, .06, .3, tt => v * (rnd() * 2 - 1) * Math.exp(-tt * 90)); add(t + .03, .05, .3, tt => v * Math.sin(TAU * 3200 * tt) * Math.exp(-tt * 120)); };
const run = (t, ms, step = .07, v = .035, fn = ding) => ms.forEach((m, i) => fn(t + i * step, m, v, (i / ms.length) - .5));

// ---------- harmony ----------
const CH = { Dm: [62, 65, 69, 74], Bb: [58, 62, 65, 70], F: [60, 65, 69, 72], C: [60, 64, 67, 72], Gm: [55, 62, 67, 70], A: [57, 61, 64, 69], Am: [57, 60, 64, 69],
  Bbmaj7: [58, 62, 65, 69], Fmaj7: [60, 64, 65, 69], Dm7: [62, 65, 69, 72], Csus: [60, 65, 67, 72], Gm7: [55, 62, 65, 70] };
const ROOT = { Dm: 38, Bb: 34, F: 41, C: 36, Gm: 43, A: 45, Am: 45, Bbmaj7: 34, Fmaj7: 41, Dm7: 38, Csus: 36, Gm7: 43 };
// style: str (string pad level), bass ('one' | 'pulse' | 'walk'), arp (piano / glass) + pattern, tick (clock), heart (heartbeat)
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    strings(t, len, ch, st.str ?? .014);
    if (st.chord) piano(t, ch[1] + 12, st.chord, -.25, Math.min(len, BEAT * 3)), piano(t + .03, ch[2] + 12, st.chord * .8, .25, Math.min(len, BEAT * 3));
    if (st.heart && bar % 2 === 0) beat(t, st.heart);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) bass(tb, r, .1, BEAT * 3.5, .02);
      if (st.bass === 'pulse' && b % 2 === 0) bass(tb, r, .095);
      if (st.bass === 'walk') bass(tb, r + [0, 3, 7, 10][b] - (name === 'A' && b === 1 ? -1 : 0), .085, BEAT * .9);
      if (st.tick) { tick(tb, st.tick, 1); tick(tb + BEAT / 2, st.tick * .6, 0); }
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.eighth === false ? 1 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          st.arp === 'glass' ? ding(tb + e * BEAT / per, m + 12, (st.arpV ?? .03) * (e ? .8 : 1), ((i % 4) - 1.5) * .25) : piano(tb + e * BEAT / per, m, (st.arpV ?? .045) * (e ? .8 : 1), ((i % 4) - 1.5) * .25, BEAT * .9); }
      }
    }
  }
}
const MOTIF = [[0, 69, .75], [.75, 70, .25], [1, 72, 1], [2, 70, .5], [2.5, 69, .5], [3, 65, 1.6]];   // the recap theme, in beats
const motif = (t, tr = 0, v = .045) => MOTIF.forEach(([b, m, d]) => oboe(t + b * BEAT, m + tr, d * BEAT * .95, v));

// A: the blank pearls. A question, then warmth for the baby years, then the two clouds
section(0, Lx(1, 4.4), ['Dm', 'Bb'], { str: .014, arp: 'glass', arpV: .028, skip: .45, bass: 'one' });
section(Lx(1, 4.4), Lx(2, 0), ['F', 'C', 'Dm', 'Bb'], { str: .014, arp: 'piano', arpV: .04, bass: 'pulse' });
section(Lx(2, 0), Lx(3, -1.7), ['Dm', 'Gm', 'Bb', 'A'], { str: .017, arp: 'glass', arpV: .028, skip: .3, bass: 'one', heart: .06 });
// B: babies learn (playful), two kinds of memory, the lost kind
section(Lx(3, -1.7), Lx(4, 0), ['F', 'C', 'Dm', 'Bb'], { str: .012, arp: 'piano', arpV: .045, bass: 'pulse', tick: .012, pat: [0, 3, 2, 3, 1, 3, 2, 3] });
section(Lx(4, 0), Lx(5, 0), ['Bb', 'F', 'Gm', 'C'], { str: .014, chord: .03, bass: 'one', arp: 'glass', arpV: .026, skip: .4 });
section(Lx(5, 0), Lx(6, -1.45), ['Dm', 'Bb', 'Gm', 'A'], { str: .017, chord: .028, bass: 'one' });
// C: inside the head, the old answer, the shut book, an idea
section(Lx(6, -1.45), Lx(7, 0), ['Dm', 'Am', 'Bb', 'F'], { str: .016, arp: 'glass', arpV: .03, skip: .25, bass: 'one' });
section(Lx(7, 0), Lx(8, 0), ['Gm', 'Dm', 'Bb', 'A'], { str: .016, chord: .03, bass: 'pulse', tick: .01 });
section(Lx(8, 0), Lx(9, -1.3), ['F', 'C', 'Dm', 'Bb', 'Gm', 'A'], { str: .014, arp: 'piano', arpV: .04, bass: 'pulse' });
// D: the scanner (curious, clocklike), the looking, the result, stored but...
section(Lx(9, -1.3), Lx(10, 0), ['F', 'Bb', 'C', 'F'], { str: .012, arp: 'piano', arpV: .042, bass: 'pulse', tick: .014 });
section(Lx(10, 0), Lx(11, 0), ['Bbmaj7', 'Fmaj7', 'Gm7', 'Csus'], { str: .013, arp: 'glass', arpV: .03, skip: .3, bass: 'one' });
section(Lx(11, 0), Lx(12, 0), ['F', 'C', 'Dm', 'Bb'], { str: .014, arp: 'piano', arpV: .045, bass: 'walk', tick: .012 });
section(Lx(12, 0), Lx(13, -1.5), ['Bb', 'F', 'Gm', 'A'], { str: .016, chord: .03, bass: 'one' });
// E: the mice and the light
section(Lx(13, -1.5), Lx(14, 0), ['F', 'C', 'Bb', 'F'], { str: .012, arp: 'glass', arpV: .03, bass: 'pulse' });
section(Lx(14, 0), Lx(15, 0), ['Dm', 'Bb', 'Gm', 'A'], { str: .016, bass: 'one', heart: .08 });
section(Lx(15, 0), Lx(16, 0), ['Dm', 'Bb', 'C', 'F'], { str: .014, arp: 'piano', arpV: .04, bass: 'walk', tick: .012 });
section(Lx(16, 0), Lx(17, 0), ['Bb', 'C', 'F', 'F'], { str: .015, chord: .032, arp: 'glass', arpV: .028, bass: 'pulse' });
section(Lx(17, 0), Lx(18, -.7), ['Gm', 'Dm', 'Bb', 'A'], { str: .015, chord: .026, bass: 'one' });
// R: the recap, hushed, the oboe motif
section(Lx(18, -.7), Lx(19, -1.85), ['Bbmaj7', 'F', 'Gm7', 'Csus', 'F'], { str: .016, chord: .026, bass: 'one' });
// F: the building site (busy), the synapse, the key that doesn't fit
section(Lx(19, -1.85), Lx(20, 0), ['Dm', 'F', 'Gm', 'A'], { str: .013, arp: 'piano', arpV: .042, bass: 'walk', tick: .016, pat: [0, 2, 3, 2, 1, 2, 3, 2] });
section(Lx(20, 0), Lx(21, 0), ['F', 'C', 'Dm', 'Bb'], { str: .013, arp: 'piano', arpV: .042, bass: 'walk', tick: .014 });
section(Lx(21, 0), Lx(22, 0), ['Bbmaj7', 'Fmaj7', 'Gm7', 'Csus'], { str: .015, arp: 'glass', arpV: .03, skip: .3, bass: 'one' });
section(Lx(22, 0), Lx(23, -1.9), ['Gm', 'Bb', 'Gm', 'A'], { str: .017, chord: .03, bass: 'pulse', heart: .06 });
// G: the album (playful, then the doubt)
section(Lx(23, -1.9), Lx(24, 0), ['F', 'Am', 'Bb', 'C'], { str: .012, arp: 'piano', arpV: .045, bass: 'pulse', pat: [0, 3, 2, 3, 1, 3, 2, 3] });
section(Lx(24, 0), Lx(25, -1.75), ['Dm', 'Bb', 'Gm', 'A'], { str: .015, arp: 'glass', arpV: .03, skip: .3, bass: 'one' });
// H: the locked door (warm), the teaser question, the goodbye
section(Lx(25, -1.75), Lx(26, 0), ['F', 'Bb', 'Dm', 'C'], { str: .016, chord: .03, arp: 'glass', arpV: .028, skip: .35, bass: 'one' });
section(Lx(26, 0), Lx(26, 9.2), ['Dm', 'F', 'Gm', 'A'], { str: .014, arp: 'piano', arpV: .04, bass: 'walk', tick: .014 });
section(Lx(26, 9.2), DUR - 3.4, ['Gm', 'A', 'Bb', 'C'], { str: .015, chord: .03, bass: 'one' });
strings(DUR - 3.4, 2.8, CH.Fmaj7, .018); piano(DUR - 3.4, 72, .05, -.2, 2.6); piano(DUR - 3.38, 77, .04, .2, 2.6); bass(DUR - 3.4, 41, .1, 2.8);

// ---------- the recap motif, at the "回顾" moments and the end ----------
motif(Lx(5, 10.4), 0, .035); motif(Lx(18, 0), 0, .045); motif(Lx(18, 13.3), 0, .04); motif(Lx(25, 10.9), 0, .045);

// ---------- stingers on the picture ----------
run(.3, [69, 74, 77, 81], .12, .03);                                                               // iris in
for (let i = 0; i < 8; i++) ding(Lx(1, 1.2) + i * .22, [81, 79, 77, 76, 74, 72, 69, 67][i], .022);  // looking back along the string
glass(Lx(1, 3.6), 62, 1.2, .03); glass(Lx(1, 3.6), 65, 1.2, .025);                                // the blank pearls
whoosh(Lx(1, 4.4), 1.0, .04);
thud(Lx(1, 7.0), .08); run(Lx(1, 8.0), [72, 74, 77], .12, .025, (t, m, v, p) => piano(t, m, v * 1.4, p, .3));   // falls; babbles
glass(Lx(1, 9.4), 77, 1.0, .03);                                                                   // Mama's face
run(Lx(2, 3.4), [77, 74, 72, 69, 65], .1, .025);                                                    // dissolves into mist
run(Lx(2, 5.9), [65, 69, 72], .12, .025); thud(Lx(2, 7.0), .08); tick(Lx(2, 7.4), .06); tick(Lx(2, 7.5), .05, 0);   // rolls in; door; lock
thud(Lx(2, 8.6), .05); thud(Lx(2, 9.6), .05);                                                      // the clouds bump
whoosh(Lx(3, -2.0), .8, .06);
ding(Lx(3, 6.6), 81, .03); run(Lx(3, 7.7), [77, 79, 81], .1, .02); thud(Lx(3, 9.1), .05); thud(Lx(3, 11.2), .05); ding(Lx(3, 11.7), 84, .03);   // face, voice, drop, drop
for (let i = 0; i < 4; i++) ding(Lx(3, 7.4 + i * 1.3), 77 + i * 2, .02);                              // tags
glass(Lx(4, 2.0), 72, 1.5, .03); run(Lx(4, 10.3), [77, 81, 84], 1.1, .03);                          // the pearl; when, where, what
run(Lx(5, 1.6), [65, 69, 72, 77], .1, .025); ding(Lx(5, 2.9), 84, .035);                            // skills flow in ✓
glass(Lx(5, 3.1), 62, 1.8, .03);                                                                    // the pearl drains
for (let i = 0; i < 3; i++) glass(Lx(5, 6.2 + i * .3), [62, 65, 69][i], .6, .02);                  // three blank pearls
whoosh(Lx(6, -1.75), .8, .06);
glass(Lx(6, 4.8), 74, 1.4, .03); glass(Lx(6, 4.8), 81, 1.4, .02);                                   // the hippocampus lights
run(Lx(6, 7.4), [74, 77, 81, 79, 77], .14, .025, (t, m, v, p) => piano(t, m, v * 1.4, p, .4));    // the seahorse swims up
glass(Lx(6, 11.0), 81, .8, .025);                                                                   // the pearl passes through
whoosh(Lx(7, -.2), .9, .06);
for (let i = 0; i < 6; i++) tick(Lx(7, 1.0) + i * .45, .03, i % 2);                               // years pass
thud(Lx(7, 4.2), .06);                                                                             // the book pops open
for (let i = 0; i < 3; i++) { thud(Lx(7, 7.6 + i * .7), .05); ding(Lx(7, 7.6 + i * .7), 70 - i * 2, .02); }   // pearls bounce off
ding(Lx(7, 11.4), 62, .03);                                                                        // ✗
thud(Lx(8, .4), .14); whoosh(Lx(8, .35), .3, .05);                                                 // the book slams
for (let i = 0; i < 6; i++) tick(Lx(8, 4.9) + i * .12, .03, i % 2);                                // it trembles
run(Lx(8, 9.2), [72, 77, 81, 84], .08, .03);                                                        // idea
whoosh(Lx(9, -1.8), .9, .08);
run(Lx(9, 4.4), [79, 84], .1, .025); whoosh(Lx(9, 5.8), 2.2, .03);                                  // ear muffs; slides in
ding(Lx(9, 8.7), 72, .03); for (let i = 0; i < 3; i++) ding(Lx(9, 10.9 + i * .9), [77, 81, 79][i], .025);   // monitor; pictures
whoosh(Lx(10, -.3), .5, .05); ding(Lx(10, 3.3), 81, .03); run(Lx(10, 5.4), [77, 81], .15, .025);
for (let i = 0; i < 7; i++) tick(Lx(10, 6.8 + i * .6), .03, i % 2);                                // the longer look
whoosh(Lx(11, -.3), .5, .05);
glass(Lx(11, 4.0), 62, .8, .02); glass(Lx(11, 5.4), 74, 2.6, .035); glass(Lx(11, 5.4), 81, 2.6, .025);   // faint vs bright
run(Lx(11, 9.0), [77, 81, 84, 89], .08, .03);                                                       // one-candle cake
glass(Lx(12, 3.0), 77, 1.5, .03); ding(Lx(12, 6.4), 84, .035); ding(Lx(12, 6.55), 89, .03);         // stored ✓
thud(Lx(12, 9.8), .1); tick(Lx(12, 10.0), .06); tick(Lx(12, 10.1), .05, 0);                         // the door shuts, locks
glass(Lx(13, -1.0), 65, 1.2, .025);
run(Lx(13, 5.6), [72, 76, 79], .1, .025); tick(Lx(13, 7.0), .06); glass(Lx(13, 7.1), 84, 1.6, .03);   // the switch; click; light
whoosh(Lx(14, -.4), .5, .05);
for (let i = 0; i < 4; i++) zap(Lx(14, 2.7 + i * .3), .03);                                         // the floor sparks
run(Lx(14, 5.4), [74, 77, 81], .2, .025); for (let i = 0; i < 3; i++) ding(Lx(14, 8.2 + i * .12), 86, .025);   // the cluster; switches
for (let i = 0; i < 6; i++) tick(Lx(15, 0) + i * .27, .03, i % 2);                                  // weeks pass
glass(Lx(15, 5.5), 84, 1.6, .03); thud(Lx(15, 8.7), .1); ding(Lx(15, 8.75), 74, .03);              // light; freeze
run(Lx(15, 10.8), [77, 81, 84], .1, .03);                                                           // it remembers
whoosh(Lx(16, -.3), .5, .05); run(Lx(16, 3.0), [72, 77, 81, 84], .15, .025);                       // the seal
thud(Lx(16, 7.3), .08); run(Lx(16, 9.6), [77, 81, 84, 89], .08, .035);                              // freezes on its own; back for good
glass(Lx(17, 2.8), 65, 1.2, .025); ding(Lx(17, 5.3), 62, .025);                                     // incomplete; crack
whoosh(Lx(18, -.9), .5, .04);
ding(Lx(18, 3.0), 84, .03); glass(Lx(18, 6.6), 84, 1.4, .03); thud(Lx(18, 11.8), .07); tick(Lx(18, 12.4), .05);   // ✓; light; doors
whoosh(Lx(19, -2.1), .8, .06);
thud(Lx(19, 2.2), .06); run(Lx(19, 4.0), [65, 69, 72, 77], .5, .03);                                // hard hat; the signal to the pearl
for (let i = 0; i < 3; i++) ding(Lx(19, 8.2 + i * .6), 79 + i * 2, .025);                           // new neurons
run(Lx(19, 12.7), [65, 69, 64], .55, .03);                                                          // the rerouted signal
whoosh(Lx(20, -.4), .9, .04);
for (let i = 0; i < 9; i++) ding(Lx(20, 1.6 + i * .32), 81 + (i % 3) * 3, .015, -.4);              // sprouts (normal)
ding(Lx(20, 1.6), 74, .02, .4); ding(Lx(20, 3.0), 74, .02, .4); ding(Lx(20, 4.9), 84, .035, .4);   // slowed; ✓
whoosh(Lx(20, 7.6), .8, .04);
for (let i = 0; i < 14; i++) ding(Lx(20, 8.3 + i * .15), 77 + ((i * 5) % 12), .015, (i % 3 - 1) * .5);   // synapses bloom
for (let i = 0; i < 8; i++) snip(Lx(20, 10.7) + i * .26, .045);                                    // pruned
whoosh(Lx(21, -.3), .9, .05);
glass(Lx(21, 1.6), 69, 1.0, .025); for (let i = 0; i < 5; i++) ding(Lx(21, 3.5 + i * .25), 84 + i, .015); glass(Lx(21, 6.0), 77, 1.4, .025);   // swells; vesicles; new bud
whoosh(Lx(21, 10.2), .9, .05); ding(Lx(21, 12.3), 62, .03);                                         // back down; ✗
thud(Lx(22, 1.2), .1); tick(Lx(22, 1.6), .05); ding(Lx(22, 3.3), 84, .03);                          // the door; the key
thud(Lx(22, 9.3), .06); thud(Lx(22, 10.2), .05); ding(Lx(22, 9.35), 61, .03);                       // doesn't fit
whoosh(Lx(23, -2.2), .8, .06);
run(Lx(23, .2), [77, 81, 84], .1, .03);                                                             // proud
for (let r = 0; r < 7; r++) ding(Lx(23, 6.0 + r * .45), 72 + r * 2, .015);                         // the crowd fills in
run(Lx(23, 10.0), [77, 81, 84, 89], .1, .025);                                                      // four in ten
thud(Lx(24, 1.6), .06); run(Lx(24, 1.6), [72, 69, 65], .08, .025);                                  // it comes apart
run(Lx(24, 4.6), [77, 79, 81], .15, .02, (t, m, v, p) => piano(t, m, v * 1.4, p, .3));            // Mama's story
whoosh(Lx(24, 6.0), .8, .04); thud(Lx(24, 7.4), .05); glass(Lx(24, 8.0), 81, 1.2, .028);           // the photo; glued; glows
ding(Lx(24, 9.9), 63, .03);                                                                          // the seams
whoosh(Lx(25, -2.2), .8, .05);
glass(Lx(25, 2.2), 65, 1.2, .025); whoosh(Lx(25, 3.4), 1.2, .05);                                  // blank pearls; push in
glass(Lx(25, 4.7), 77, 2.0, .035); glass(Lx(25, 4.7), 81, 2.0, .03); glass(Lx(25, 4.7), 84, 2.0, .02);   // through the keyhole
ding(Lx(25, 9.5), 77, .03);                                                                          // the hand on the door
thud(Lx(26, .4), .06); for (const d of [5.0, 7.4]) snip(Lx(26, d), .05);                            // the hat; snip, snip
ding(Lx(26, 9.3), 74, .03); ding(Lx(26, 9.5), 76, .03);                                              // ?
run(DUR - 2.7, [77, 72, 69, 65], .2, .03);                                                          // iris out

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/amnesia_vo.wav');
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
writeWav('assets/amnesia_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/amnesia_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/amnesia_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/amnesia_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/amnesia_mix_n.wav', 'assets/amnesia_mix.wav');
console.log('wrote assets/amnesia_bgm.wav and assets/amnesia_mix.wav');

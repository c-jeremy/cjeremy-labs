// music_biosphere.mjs: the score for "Pip大战生物圈" (src/scenes/biosphere.js), synthesised from scratch.
//   node make.mjs biosphere music   → assets/biosphere_bgm.wav and assets/biosphere_mix.wav
// A wordless action short, so the score carries everything: no voice to duck under. Its own palette (no flute): a
// pizzicato-string ostinato, low brass stabs, a taiko-ish low drum kit with snare and ticking hats, a pulse bass,
// a marimba for the comic beats, a glockenspiel for "it worked", bowed strings for the tense and the tender, a felt
// piano for the ending, and a swarm buzz. D minor for the fights, F/B♭ major for the wins and the ending.
// 120 bpm = PROJECT.bpm (BEAT = .5 s, a bar = 2 s); sections follow the shots, stingers follow picture events.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const MAN = JSON.parse(readFileSync('videos/biosphere.json', 'utf8'));
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const Lc = new Float32Array(N), Rc = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); Lc[i0 + i] += v * gl; Rc[i0 + i] += v * gr; }
}
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- instruments ----------
// pizzicato: a plucked string, bright attack, quick decay
const pizz = (t, m, v = .05, pan = 0) => { const f = hz(m); add(t, .6, pan, tt => { const e = Math.min(1, tt / .003) * Math.exp(-tt * 9); let s = 0; for (let k = 1; k <= 6; k++) s += Math.sin(TAU * f * k * tt) * Math.exp(-tt * k * 4) / k; return v * e * s; }); };
// marimba: wooden bar, two strong partials
const marimba = (t, m, v = .05, pan = 0) => { const f = hz(m); add(t, .9, pan, tt => v * Math.min(1, tt / .002) * (Math.sin(TAU * f * tt) * Math.exp(-tt * 5) + .35 * Math.sin(TAU * f * 3.93 * tt) * Math.exp(-tt * 18) + .2 * Math.sin(TAU * f * 10.2 * tt) * Math.exp(-tt * 40))); };
// glockenspiel: bright bell
const glock = (t, m, v = .04, pan = 0) => { const f = hz(m); add(t, 1.6, pan, tt => v * Math.min(1, tt / .002) * (Math.sin(TAU * f * tt) * Math.exp(-tt * 2.2) + .4 * Math.sin(TAU * f * 2.76 * tt) * Math.exp(-tt * 5) + .2 * Math.sin(TAU * f * 5.4 * tt) * Math.exp(-tt * 9))); };
// brass stab: additive saw with a filter-ish envelope (upper partials die first)
function brass(t, ms, len, v = .03, pan = 0) { ms.forEach((m, j) => { const f = hz(m); add(t, len + .3, pan + (j - 1) * .2, tt => { const a = Math.min(1, tt / .03) * (tt > len ? Math.exp(-(tt - len) / .08) : 1), br = .3 + .7 * Math.exp(-tt * 3); let s = 0; for (let k = 1; k <= 9; k++) s += Math.sin(TAU * f * k * tt * (1 + .002 * Math.sin(TAU * 5 * tt))) / k * Math.pow(br, k * .5); return v * a * s; }); }); }
// bowed strings: band-limited saw pad, slow attack; trem 1 = tremolo
const strings = (t, len, ms, v = .014, trem = 0) => ms.forEach((m, j) => { for (const det of [-.07, .07]) { const f = hz(m + det), ph = rnd() * TAU;
  add(t, len + 1.2, (j / (ms.length - 1 || 1)) * 1.2 - .6, tt => { const a = Math.min(1, tt / (trem ? .08 : .8)) * (tt > len ? Math.exp(-(tt - len) / .5) : 1), tr = trem ? .6 + .4 * Math.sin(TAU * 12 * tt) : 1, vib = 1 + .003 * Math.sin(TAU * 5 * tt + ph); let s = 0; for (let k = 1; k <= 7; k++) s += Math.sin(TAU * f * vib * k * tt + ph * k) / k * (k > 4 ? .5 : 1); return v * a * tr * s * .6; }); } });
// felt piano
function piano(t, m, v = .05, pan = 0, len = 2.2) { const f = hz(m), P = [[1, 1, 1.2], [2.003, .45, .7], [3.01, .2, .45], [4.02, .08, .3]];
  add(t, len + .5, pan, tt => { const rel = tt > len ? Math.exp(-(tt - len) / .15) : 1; let s = 0; for (const [k, a, d] of P) s += a * Math.sin(TAU * f * k * tt) * Math.exp(-tt / d / (1 + f / 900)); return v * rel * Math.min(1, tt / .004) * s * .7; }); }
const bass = (t, m, v = .1, len = BEAT * .9) => { const f = hz(m); add(t, len + .2, 0, tt => { const e = Math.min(1, tt / .01) * Math.exp(-tt * 2) * (tt > len ? Math.exp(-(tt - len) / .05) : 1); return v * e * (Math.sin(TAU * f * tt) + .3 * Math.sin(TAU * f * 2 * tt) + .15 * Math.sign(Math.sin(TAU * f * tt)) * .3); }); };
// drums
const kick = (t, v = .2) => add(t, .4, 0, tt => v * Math.sin(TAU * (48 + 90 * Math.exp(-tt * 30)) * tt) * Math.exp(-tt * 8));
const taiko = (t, v = .2, p = 0) => { let lp = 0; add(t, .9, p, tt => { lp += ((rnd() * 2 - 1) - lp) * .1; return v * (Math.sin(TAU * (60 + 50 * Math.exp(-tt * 18)) * tt) * Math.exp(-tt * 5) + lp * .6 * Math.exp(-tt * 25)); }); };
const snare = (t, v = .06, p = .1) => { let hp = 0, prev = 0; add(t, .25, p, tt => { const n = rnd() * 2 - 1; hp = .8 * (hp + n - prev); prev = n; return v * (hp * Math.exp(-tt * 18) + .6 * Math.sin(TAU * 190 * tt) * Math.exp(-tt * 30)); }); };
const hat = (t, v = .02, p = .3) => { let hp = 0, prev = 0; add(t, .06, p, tt => { const n = rnd() * 2 - 1; hp = .6 * (hp + n - prev); prev = n; return v * hp * Math.exp(-tt * 70); }); };
// effects
function whoosh(t, len, v = .07, up = 1) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * (up ? k : 1 - k); lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const thud = (t, v = .16) => add(t, .5, 0, tt => v * Math.sin(TAU * (70 + 60 * Math.exp(-tt * 18)) * tt) * Math.exp(-tt * 7));
const crunch = (t, v = .06) => { for (let i = 0; i < 4; i++) add(t + i * .025, .05, .2, tt => v * (rnd() * 2 - 1) * Math.exp(-tt * 60)); };
const click = (t, v = .05, f = 2400) => add(t, .04, .2, tt => v * Math.sin(TAU * f * tt) * Math.exp(-tt * 140));
const boom = (t, v = .2) => { let lp = 0; add(t, 1.6, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * .05; return v * (Math.sin(TAU * (40 + 40 * Math.exp(-tt * 10)) * tt) * Math.exp(-tt * 2.5) + lp * 1.2 * Math.exp(-tt * 3)); }); };
const slide = (t, m0, m1, len, v = .04) => { let ph = 0; add(t, len, 0, tt => { const f = hz(lerp(m0, m1, tt / len)); ph += TAU * f / SR; return v * Math.sin(ph) * Math.sin(Math.PI * tt / len); }); };
const boing = (t, v = .06) => { let ph = 0; add(t, .6, 0, tt => { const f = 180 + 260 * Math.exp(-tt * 5) * (1 + .3 * Math.sin(TAU * 14 * tt)); ph += TAU * f / SR; return v * Math.sin(ph) * Math.exp(-tt * 5); }); };
const zap = (t, len = .5, v = .03) => { let ph = 0; add(t, len, .1, tt => { const f = 900 + 600 * Math.sin(TAU * 30 * tt); ph += TAU * f / SR; return v * Math.sign(Math.sin(ph)) * .5 * Math.sin(Math.PI * tt / len); }); };
function buzz(t, len, v = .02, swell = 1) { let ph = 0, lp = 0; add(t, len, 0, tt => { const f = 190 + 25 * Math.sin(TAU * 3 * tt) + 15 * (rnd() - .5); ph += TAU * f / SR; lp += ((rnd() * 2 - 1) - lp) * .2; const a = swell ? Math.min(1, tt / (len * .6)) : 1; return v * a * Math.min(1, (len - tt) / .3) * (Math.sign(Math.sin(ph)) * .5 + lp * .5); }); }
function rumble(t, len, v = .1) { let lp = 0; add(t, len, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * .015; return v * Math.sin(Math.PI * Math.min(1, tt / len)) * (lp * 4 + .3 * Math.sin(TAU * 38 * tt)); }); }
function rain(t, len, v = .025) { let hp = 0, prev = 0; add(t, len, 0, tt => { const n = rnd() * 2 - 1; hp = .9 * (hp + n - prev); prev = n; return v * Math.min(1, tt / .8) * Math.min(1, (len - tt) / .5) * hp; }); }
const lerp = (a, b, x) => a + (b - a) * x;
const run = (t, ms, step = .07, v = .035, fn = glock) => ms.forEach((m, i) => fn(t + i * step, m, v, (i / ms.length) - .5));

// ---------- harmony + sections ----------
const CH = { Dm: [62, 65, 69], Bb: [58, 62, 65], C: [60, 64, 67], A: [57, 61, 64], Gm: [55, 58, 62], F: [53, 57, 60], Eb: [51, 55, 58], Am: [57, 60, 64], Dsus: [62, 67, 69], Fmaj7: [53, 57, 60, 64], Bbmaj7: [58, 62, 65, 69], Csus: [60, 65, 67] };
const ROOT = { Dm: 38, Bb: 34, C: 36, A: 33, Gm: 31, F: 41, Eb: 39, Am: 33, Dsus: 38, Fmaj7: 41, Bbmaj7: 34, Csus: 36 };
// st: pizz (ostinato level), mar (marimba), str, trem, drums ('light' | 'full' | 'taiko'), bass ('pulse' | 'eighth' | 'one'), brass
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .2; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], r = ROOT[name], len = Math.min(BAR, t1 - t);
    if (st.str) strings(t, len, ch.map(m => m + (st.strUp || 0)), st.str, st.trem);
    if (st.brass && bar % 2 === 0) brass(t, ch.map(m => m - 12), BEAT * 1.2, st.brass);
    for (let e = 0; e < 8; e++) {
      const te = t + e * BEAT / 2; if (te >= t1 - .05) break;
      if (st.pizz) { const pat = st.pat || [0, 1, 2, 1, 0, 2, 1, 2]; pizz(te, ch[pat[e]] + 12, st.pizz * (e % 2 ? .75 : 1), ((e % 4) - 1.5) * .3); }
      if (st.mar && (e % 2 === 0 || st.marBusy)) marimba(te, ch[(e * 2) % ch.length] + 24, st.mar, ((e % 4) - 1.5) * .3);
      if (st.bass === 'eighth') bass(te, r + (e === 7 ? 7 : 0), .08, BEAT * .4);
      if (st.bass === 'pulse' && e % 2 === 0) bass(te, r, .09);
      if (st.bass === 'one' && e === 0) bass(te, r, .1, BEAT * 3.5);
      if (st.drums === 'light') { if (e === 0 || e === 5) kick(te, .14); if (e === 4) snare(te, .04); hat(te, .012); }
      if (st.drums === 'full') { if (e === 0 || e === 3 || e === 6) kick(te, .17); if (e === 2 || e === 6) snare(te, .06); hat(te, .018); if (e === 7 && bar % 2 === 1) snare(te + BEAT / 4, .04); }
      if (st.drums === 'taiko') { if (e === 0 || e === 3 || e === 5) taiko(te, .16, (e - 3) * .2); if (e === 6 || e === 7) taiko(te, .09, .3); hat(te, .012); }
      if (st.drums === 'heart' && (e === 0 || e === 1) && bar % 1 === 0) kick(te, e ? .08 : .12);
    }
  }
}

// A: the sprout. A dark low pad, a heartbeat; light at 5.0 warms it; the rumble of the shadow
strings(0, 5, [38, 50, 57], .012); section(.5, 5, ['Dm'], { drums: 'heart' });
run(1.0, [74, 77, 81], .4, .02);                                   // the seed cracks
rumble(2.4, .7, .06); whoosh(2.6, .6, .05); thud(3.0, .18); run(3.05, [69, 74, 77, 81, 86], .05, .03); thud(3.75, .1);   // bursts out, lands
strings(4.8, 1.8, [53, 60, 65, 69], .016); run(5.0, [77, 81, 84, 89], .12, .03); piano(5.9, 72, .04); piano(6.15, 77, .04);   // first light
rumble(6.5, 2.8, .14); strings(6.6, 2.2, [38, 39, 45], .014, 1); kick(7.0, .14); kick(7.5, .14); kick(8.0, .12);                 // the shadow
piano(8.9, 69, .03); piano(9.2, 65, .03);                                                                                     // relief
// B: the grasshopper (Dm, pizz + light drums)
section(10, 15, ['Dm', 'Dm', 'Bb', 'A'], { pizz: .045, drums: 'light', bass: 'pulse' });
section(15, 19.4, ['Gm', 'A', 'Dm', 'A'], { pizz: .045, drums: 'full', bass: 'eighth', str: .01 });
section(19.4, 22, ['F', 'C'], { mar: .045, bass: 'pulse' });
thud(10.35, .2); crunch(12.7, .08); crunch(12.86, .06); brass(12.75, [50, 53, 57], .25, .035);
crunch(15.05, .08); whoosh(15.05, .9, .06); [61, 63, 66, 68].forEach((m, i) => strings(15.1, .8, [m], .012));   // the cyanide puff
slide(15.5, 76, 58, 1.1, .035); boing(16.0, .03);                                                              // reels, dizzy
whoosh(17.95, .7, .07); run(19.5, [77, 81, 84], .1, .035); run(20.7, [84, 83], .2, .025, marimba);            // leaps off; smug; tickle?
// C: aphids, ladybug, ants (marimba + pizz, comic)
section(22, 25, ['Dm', 'A'], { pizz: .04, bass: 'pulse', str: .008 });
for (let i = 0; i < 5; i++) click(22.4 + i * .2, .04, 3000 + i * 200);                                        // stylets in
section(25, 27.4, ['F', 'C', 'Bb', 'C'], { mar: .05, marBusy: 1, bass: 'pulse' });
[79, 81, 84, 81, 86].forEach((m, i) => glock(25.0 + i * .14, m, .02));                                       // Pip whistles
whoosh(25.6, .6, .05); glock(26.2, 89, .04); thud(26.6, .08); glock(26.75, 84, .03);                          // the ladybug; gulp
section(27.4, 31.2, ['Dm', 'Dm', 'Gm', 'A'], { pizz: .045, drums: 'light', bass: 'eighth' });
for (let i = 0; i < 12; i++) snare(27.4 + i * .135, .025);                                                   // ants march
glock(29.2, 91, .02); glock(29.4, 91, .02); snare(30.0, .07); brass(30.0, [50, 53], .2, .03); whoosh(30.3, .9, .06);
section(31.2, 33.2, ['Gm', 'A'], { str: .012, trem: 1, bass: 'one' });
thud(32.05, .2); kick(32.05, .2); slide(32.4, 72, 66, .5, .03); whoosh(33.1, 1.0, .08);
// D: underground, the phage battle (full action)
rumble(34, 2, .08); section(34, 36, ['Dm'], { str: .012, trem: 1, bass: 'one' }); whoosh(35.3, .7, .06, 1);
section(36, 38, ['Dm', 'Bb'], { pizz: .04, bass: 'pulse', str: .008 });
section(38, 41, ['Dm', 'Bb', 'Gm', 'A'], { pizz: .05, drums: 'full', bass: 'eighth', brass: .025 });
[79, 81, 84, 81, 86].forEach((m, i) => glock(40.9 + i * .14, m, .02));
section(41, 46, ['Dm', 'Eb', 'Dm', 'A'], { pizz: .05, drums: 'taiko', bass: 'eighth', brass: .028 });
for (const [tl, i] of [[42.5, 0], [45.4, 1], [45.8, 2]]) { click(tl, .07, 1800); zap(tl + .8, i ? .5 : .9, .025); }
slide(44.3, 60, 72, 1.6, .025);                                                                              // swelling
boom(46.0, .22); boom(47.2, .16); boom(47.6, .16);
section(46, 49.6, ['F', 'C', 'Bb', 'C'], { pizz: .045, drums: 'full', bass: 'pulse', mar: .04 });
run(46.3, [77, 81, 84, 89], .1, .035); run(48.0, [72, 77, 81, 84, 89], .08, .03);
whoosh(49.6, .7, .07);
// E: the virus (suspense), then the sacrifice, relief
section(50, 52, ['Dm', 'Bb'], { str: .012, bass: 'one', drums: 'heart' });
[86, 85, 86, 85].forEach((m, i) => glock(50.2 + i * .3, m, .015));
section(52, 54, ['Dm', 'Eb'], { str: .014, trem: 1, bass: 'one', drums: 'heart' }); slide(52.0, 62, 74, 2.0, .02);
taiko(54.0, .2); taiko(54.4, .14); taiko(54.8, .12); brass(54.0, [38, 45, 50], .9, .035);
section(54, 56, ['Gm', 'A'], { str: .015, bass: 'one' });
section(56, 60, ['F', 'Bb', 'F', 'C'], { str: .012, mar: .035, bass: 'one' }); piano(57.0, 77, .035); piano(57.25, 72, .03);
slide(58.4, 70, 58, 1.2, .025); whoosh(59.2, .9, .06);
// F: the fungus friend (warm groove, major)
section(60, 64.4, ['Bb', 'F', 'Gm', 'C'], { mar: .045, marBusy: 1, pizz: .025, bass: 'pulse', drums: 'light' });
for (let i = 0; i < 10; i++) marimba(62.8 + i * .32, 84 + (i % 3) * 3, .02, .4);                         // the trade
run(64.4, [65, 69, 72, 77, 81, 84, 89], .06, .04); thud(64.5, .1);
section(64.4, 68, ['F', 'C', 'Bb', 'C'], { mar: .05, marBusy: 1, pizz: .035, bass: 'eighth', drums: 'full', str: .01 });
whoosh(67.6, .7, .07);
// G: the frog and the flick (bouncy, then ominous)
section(68, 74, ['F', 'Dm', 'Bb', 'C'], { mar: .045, pizz: .03, bass: 'pulse', drums: 'light' });
whoosh(69.0, .6, .04); thud(69.6, .08); slide(70.0, 70, 82, .2, .03); slide(70.2, 82, 70, .25, .03); thud(70.6, .06);   // tongue, gulp
slide(71.2, 70, 82, .2, .03); thud(71.42, .12); brass(71.85, [50, 53], .3, .03);                                   // slap
section(74, 77, ['F', 'C'], { mar: .04, bass: 'pulse' });
whoosh(73.8, .4, .05); thud(74.15, .14); whoosh(74.2, 1.0, .07); glock(75.22, 96, .04); glock(75.32, 91, .03);      // flick; twinkle
run(75.6, [77, 81, 84], .12, .03);
buzz(77, 3, .018); section(77, 80, ['Dm', 'Eb'], { str: .012, trem: 1, bass: 'one', drums: 'heart' }); thud(77.3, .12); thud(78.1, .1); thud(78.5, .1);
// H: the swarm (full danger), the bare meadow, the rain
buzz(80, 7, .035, 0);
section(80, 87, ['Dm', 'Bb', 'Gm', 'A'], { pizz: .05, drums: 'taiko', bass: 'eighth', brass: .03, str: .012, trem: 1 });
for (let i = 0; i < 16; i++) crunch(83 + i * .22, .03);
section(87, 89, ['Dm', 'Gm'], { str: .014, bass: 'one' }); piano(87.2, 62, .04); piano(87.7, 65, .035); piano(88.4, 61, .035);
rain(88.8, 3.4, .03); rumble(89.6, 2.6, .12); whoosh(90.3, 1.4, .07);
section(89, 92, ['Dm', 'A'], { str: .015, trem: 1, bass: 'one', drums: 'full' });
boom(91.7, .16);
// I: the deep sea (slow, dark, filtered), the failed sun, the worms, the tardigrade gag
section(92, 95.4, ['Dm', 'Bb'], { str: .014 }); slide(92.2, 74, 50, 3.0, .025);
for (let i = 0; i < 6; i++) glock(92.4 + i * .5, 86 - i * 2, .012);                                          // bubbles
thud(96.1, .12); rumble(95.4, 14, .05);
section(95.4, 101.8, ['Dm', 'Dm', 'Gm', 'A'], { str: .013, bass: 'one', drums: 'heart' });
strings(98.1, 1.2, [62, 69, 74], .012, 1); slide(98.9, 74, 56, 1.0, .03);                                    // the sun power fails
section(101.8, 104, ['Fmaj7', 'Csus'], { str: .013, mar: .025 }); [81, 86, 88, 93].forEach((m, i) => glock(101.9 + i * .25, m, .02));
section(104, 108, ['Dm', 'A'], { pizz: .035, bass: 'pulse', drums: 'light' });
thud(104.9, .1); boing(105.72, .08); whoosh(105.8, .8, .05); slide(106.8, 70, 75, 1.0, .02); glock(107.9, 89, .03);
section(108, 110, ['Dm', 'Bb'], { str: .014 }); whoosh(109, 1.2, .06, 1);
// J: up to the surface, the web, the yank, the idea, warmth
whoosh(110, 1.8, .08, 1); strings(110, 1.8, [50, 57, 62, 65], .014, 1); boom(111.7, .1);
section(111.8, 114, ['Bbmaj7', 'Fmaj7'], { str: .015, strUp: 12 });
for (let i = 0; i < 10; i++) glock(114.0 + i * .12, [77, 81, 84, 86, 89, 84, 88, 91, 93, 96][i], .025);
for (let i = 0; i < 20; i++) glock(114.6 + i * .08, 84 + (i * 5) % 12, .012);
section(114, 116.5, ['Bbmaj7', 'Csus'], { str: .015, mar: .03 });
pizz(116.5, 38, .14); pizz(116.5, 50, .1); for (let i = 0; i < 6; i++) pizz(116.55 + i * .08, 62 + (i % 2) * 12, .05 * (1 - i / 6)); boom(116.5, .1);
section(116.5, 119.3, ['Dm', 'Bb', 'C'], { str: .015, bass: 'one' }); run(118.0, [72, 77, 81, 84, 89], .08, .035);
section(119.3, 122, ['F', 'Bbmaj7'], { str: .018, strUp: 12, bass: 'one' }); piano(119.3, 77, .04); piano(119.6, 81, .035); whoosh(120.9, 1.1, .07, 1);
// K: peace, then the blade (heavy), the stop, the empty hand, the hand over Pip
section(122, 125, ['Bb', 'F', 'C'], { mar: .045, pizz: .02, bass: 'pulse' }); piano(122.6, 77, .035); piano(123, 81, .03);
rumble(125, 5.4, .16); strings(125, 1.2, [38, 39], .016, 1);
section(126.2, 130, ['Dm', 'Eb', 'Dm', 'A'], { drums: 'taiko', bass: 'eighth', brass: .035, str: .014, trem: 1 });
thud(127.6, .14); boom(128.0, .14); whoosh(127.3, 1.2, .06);
boom(130.0, .24); kick(130.0, .25);
for (let i = 0; i < 6; i++) hat(131 + i * .5, .02);                                                           // the still
strings(131, 3, [50, 53, 57], .012); piano(132.0, 62, .03); piano(133.0, 61, .03); piano(133.25, 58, .03);
section(134, 136, ['Gm', 'A'], { str: .014, trem: 1, drums: 'heart' });
// L: the hand helps; the blade backs off; the blossom; the bee; goodbye
section(136, 139.4, ['F', 'C', 'Dm', 'Bb'], { str: .012, bass: 'one' }); thud(138.0, .08); thud(138.5, .08);
section(139.4, 142, ['F', 'Bbmaj7'], { str: .015, bass: 'one' }); piano(139.45, 72, .04); piano(140.6, 77, .04); piano(140.85, 81, .035);
section(142, 147.5, ['Bb', 'F', 'Gm', 'C', 'F', 'F'], { str: .014, mar: .035, pizz: .02, bass: 'pulse' });
run(142.2, [77, 81, 84, 89], .15, .035); glock(144.0, 96, .035); glock(144.15, 93, .03);
strings(147.5, 2.4, [53, 60, 65, 69, 72], .017); piano(147.5, 65, .05, -.2, 2.2); piano(147.55, 72, .04, .2, 2.2); bass(147.5, 41, .1, 2.2);
run(147.6, [84, 81, 77, 72], .25, .03);

// ---------- reverb, master ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .8; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
const vl = verb(Lc, 0), vr = verb(Rc, 29);
let peak = 0;
for (let n = 0; n < N; n++) { const t = n / SR, g = Math.min(1, t / .5) * Math.min(1, (DUR - t) / .8); Lc[n] = (Lc[n] + vl[n] * .3) * g; Rc[n] = (Rc[n] + vr[n] * .3) * g; peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n])); }
function writeWav(path, gain) {
  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(Math.tanh(Lc[n] * gain) * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(Math.tanh(Rc[n] * gain) * 32767), 46 + n * 4); }
  writeFileSync(path, buf);
}
writeWav('assets/biosphere_bgm.wav', .5 / peak);
writeWav('assets/biosphere_mix.wav', .5 / peak);
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/biosphere_mix.wav', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', '44100', 'assets/biosphere_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/biosphere_mix_n.wav', 'assets/biosphere_mix.wav');
console.log('wrote assets/biosphere_bgm.wav and assets/biosphere_mix.wav');

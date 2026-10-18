// music_copper.mjs: the score for "Pip讲身体里的铜" (src/scenes/copper.js), synthesised from scratch.
//   node make.mjs copper vo && node make.mjs copper music   → assets/copper_bgm.wav and assets/copper_mix.wav
// Its own palette, the sound of copper alloys (not mRNA's kalimba/glock, meiosis's e-piano/marimba/harp/flute, thermo's
// cartoon band or xenocortex's vibraphone): FM handbells for reveals, a bright steel-string pluck (Karplus–Strong) for
// the arpeggios, a soft synth-brass pad (brass is copper + zinc), a muted flugelhorn that carries the recap motif, a
// singing-bowl drone for the ancient sea, the danger and the night, an upright bass, a shaker and a cajón. Plus a box of
// cartoon effects for Pip's gags (pop, boing, slide whistle, splash, zap, clang, boom). G major / E minor, 90 bpm =
// PROJECT.bpm. Each section follows a voice line (times read from videos/copper.json, like the scenes' L(i, d)); the
// music ducks under the voice and breathes up in the long pauses. 802 s is long, so the reverb, the ducking and the
// WAV writing stream in place (two float arrays in memory, not seven) to stay light on a 4 GB laptop.
import { readFileSync, openSync, writeSync, closeSync } from 'node:fs';

const MAN = JSON.parse(readFileSync('videos/copper.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const Lc = new Float32Array(N), Rc = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 29; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); Lc[i0 + i] += v * gl; Rc[i0 + i] += v * gr; }
}
const env = (tt, a, d) => (tt < a ? tt / a : Math.exp(-(tt - a) / d));

// ---------- instruments ----------
const bell = (t, m, v = .05, pan = 0, len = 3) => { const f = hz(m); add(t, len, pan, tt => { const e = env(tt, .002, 1.1), I = 2.4 * Math.exp(-tt * 2.5);
  return v * e * (Math.sin(TAU * f * tt + I * Math.sin(TAU * f * 3.51 * tt)) + .3 * Math.sin(TAU * f * 2.76 * tt) * Math.exp(-tt * 3)); }); };
function pluck(t, m, v = .06, pan = 0, dec = .9965) {             // steel-string Karplus–Strong, brighter than meiosis's harp
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); for (let i = 0; i < P; i++) buf[i] = rnd() * 2 - 1;
  let i = 0, prev = 0; add(t, 1.8, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = dec * (.5 * (a + b) * .7 + a * .3); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .75; return v * prev * Math.min(1, tt / .001); });
}
function brass(t, len, ms, v = .018) {                            // a soft brass pad: band-limited saws through a slow low-pass
  ms.forEach((m, j) => { for (const det of [-.07, .07]) { const f = hz(m + det), ph = rnd(); let lp = 0, lp2 = 0;
    add(t, len + 1.0, (j / (ms.length - 1 || 1)) * 1.2 - .6, tt => { const a = Math.min(1, tt / .6) * (tt > len ? Math.exp(-(tt - len) / .4) : 1), saw = 2 * ((f * tt + ph) % 1) - 1, c = .05 + .04 * Math.min(1, tt / .8);
      lp += (saw - lp) * c; lp2 += (lp - lp2) * c; return v * a * lp2 * 1.6; }); } });
}
function flugel(t, m, len, v = .05, pan = -.1) {                  // a muted flugelhorn: odd-ish harmonics, breath, vibrato
  const f = hz(m); let lp = 0, br = 0;
  add(t, len + .3, pan, tt => { const a = Math.min(1, tt / .07) * (tt > len ? Math.exp(-(tt - len) / .12) : 1), vib = 1 + .005 * Math.sin(TAU * 5 * tt) * Math.min(1, tt / .35);
    let s = 0; for (let k = 1; k <= 5; k++) s += Math.sin(TAU * f * k * vib * tt) * [1, .5, .35, .18, .1][k - 1]; lp += (s - lp) * .25; br += ((rnd() * 2 - 1) - br) * .05; return v * a * (lp * .7 + br * .15); });
}
function bowl(t, len, m, v = .03) {                               // a singing bowl: inharmonic partials, slow beating
  const f = hz(m); add(t, len + 2, 0, tt => { const a = Math.min(1, tt / 1.2) * (tt > len ? Math.exp(-(tt - len) / 1.2) : 1);
    return v * a * (Math.sin(TAU * f * tt) * (1 + .3 * Math.sin(TAU * .7 * tt)) + .5 * Math.sin(TAU * f * 2.71 * tt) * (1 + .4 * Math.sin(TAU * 1.1 * tt)) + .25 * Math.sin(TAU * f * 5.15 * tt)); }); }
const bass = (t, m, v = .12, len = BEAT * 1.6) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .008) * Math.exp(-tt / .9) * (tt > len ? Math.exp(-(tt - len) / .08) : 1);
  return v * e * (Math.sin(TAU * f * tt) + .35 * Math.sin(TAU * 2 * f * tt) * Math.exp(-tt * 6)); }); };
const shaker = (t, v = .025, pan = .3) => { let hp = 0, last = 0; add(t, .12, pan, tt => { const x = rnd() * 2 - 1; hp = x - last; last = x; return v * hp * env(tt, .02, .03); }); };
const cajon = (t, v = .14) => add(t, .4, 0, tt => v * Math.sin(TAU * (60 + 70 * Math.exp(-tt * 25)) * tt) * Math.exp(-tt * 9));
const slap = (t, v = .05) => { let lp = 0; add(t, .12, -.2, tt => { lp += ((rnd() * 2 - 1) - lp) * .5; return v * lp * env(tt, .002, .025); }); };
// cartoon effects
function whoosh(t, len, v = .06) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const pop = (t, v = .08) => add(t, .12, 0, tt => v * Math.sin(TAU * (900 - 5000 * tt) * tt) * Math.exp(-tt * 40));
const boing = (t, v = .06, m = 55) => { const f = hz(m); add(t, .7, .1, tt => v * Math.sin(TAU * f * tt * (1 + .35 * Math.sin(TAU * 7 * tt) * Math.exp(-tt * 3))) * Math.exp(-tt * 4)); };
function slide(t, m0, m1, len, v = .05) { let ph = 0; add(t, len + .05, .2, tt => { const f = hz(m0 + (m1 - m0) * Math.min(1, tt / len)); ph += TAU * f / SR; return v * Math.sin(ph) * Math.min(1, tt / .02) * (tt > len ? Math.exp(-(tt - len) / .03) : 1); }); }
function splash(t, v = .07) { let lp = 0; add(t, .9, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * (.5 - .4 * Math.min(1, tt / .6)); return v * lp * env(tt, .01, .25); }); }
function zap(t, v = .04) { add(t, .35, 0, tt => v * Math.sign(Math.sin(TAU * (1400 - 3000 * tt) * tt)) * Math.exp(-tt * 9) * (rnd() * .4 + .6)); }
function boom(t, v = .22) { let lp = 0; add(t, 1.6, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * .04; return v * (Math.sin(TAU * (45 + 50 * Math.exp(-tt * 6)) * tt) * Math.exp(-tt * 2.2) + 2.2 * lp * Math.exp(-tt * 3)); }); }
function clang(t, v = .07) { const f = 330; add(t, 2.0, 0, tt => v * Math.exp(-tt * 1.6) * (Math.sin(TAU * f * tt) + .7 * Math.sin(TAU * f * 2.41 * tt) + .5 * Math.sin(TAU * f * 3.97 * tt) + .3 * Math.sin(TAU * f * 5.43 * tt))); }
const tick = (t, v = .04) => add(t, .05, .3, tt => v * Math.sin(TAU * 2400 * tt) * Math.exp(-tt * 90));
const knock = (t, v = .1) => add(t, .2, -.1, tt => v * Math.sin(TAU * (180 + 80 * Math.exp(-tt * 40)) * tt) * Math.exp(-tt * 25));
function whistle(t, m, len, v = .045) { const f = hz(m); add(t, len + .05, .2, tt => v * Math.sin(TAU * f * tt + .3 * Math.sin(TAU * 32 * tt)) * Math.min(1, tt / .02) * (tt > len ? Math.exp(-(tt - len) / .03) : 1)); }
function gliss(t, ms, step = .06, v = .04, inst = pluck) { ms.forEach((m, i) => inst(t + i * step, m, v, (i / ms.length) - .5)); }

// ---------- harmony ----------
const CH = { G: [55, 59, 62, 67], Gmaj7: [55, 59, 62, 66], D: [50, 57, 62, 66], Dsus: [50, 57, 62, 67], Em: [52, 59, 64, 67], Em7: [52, 59, 62, 67], C: [48, 55, 60, 64], Cmaj7: [48, 55, 59, 64],
  Am: [57, 60, 64, 69], Am7: [57, 60, 64, 67], Bm: [59, 62, 66, 71], B7: [59, 63, 66, 69], F: [53, 57, 60, 65], Dm: [50, 57, 62, 65], A: [57, 61, 64, 69], Esus: [52, 57, 59, 64], Bb: [58, 62, 65, 70] };
const ROOT = { G: 43, Gmaj7: 43, D: 38, Dsus: 38, Em: 40, Em7: 40, C: 36, Cmaj7: 36, Am: 45, Am7: 45, Bm: 47, B7: 47, F: 41, Dm: 38, A: 45, Esus: 40, Bb: 46 };
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    if (st.brass) brass(t, len, ch, st.brass);
    if (st.drone) bowl(t, len, ch[0] - 12 + 24, st.drone);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) bass(tb, r, .11, BEAT * 3.4);
      if (st.bass === 'two' && b % 2 === 0) bass(tb, r + (b ? 7 : 0), .1);
      if (st.bass === 'walk') bass(tb, r + [0, 4, 7, 9][b], .09, BEAT * .9);
      if (st.shaker) { shaker(tb + BEAT / 2, st.shaker); if (st.sixteenth) shaker(tb + BEAT * .75, st.shaker * .6, -.3); }
      if (st.cajon) { if (b % 2 === 0) cajon(tb, st.cajon); else slap(tb, st.cajon * .4); }
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.sixteenth ? 4 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          (st.arp)(tb + e * BEAT / per, m, (st.arpV ?? .05) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
const MOTIF = [[0, 71, .5], [.5, 74, .5], [1, 79, 1], [2, 78, .5], [2.5, 76, .5], [3, 74, 1.5]];   // the recap theme, in beats
const motif = (t, tr = 0, v = .045) => MOTIF.forEach(([b, m, d]) => flugel(t + b * BEAT, m + tr, d * BEAT * .95, v));

// ---------- sections (one per shot, following the voice) ----------
// A: the lamp, the cell, the mnemonic — curious, then a little dread, then playful
section(0, Lx(2, -.1), ['G', 'D', 'Em', 'C'], { brass: .014, bass: 'one', arp: pluck, arpV: .035, skip: .35 });
section(Lx(2, -.1), Lx(3, 0), ['Em', 'C', 'Am', 'B7'], { brass: .016, bass: 'one', arp: pluck, arpV: .03, skip: .5 });
section(Lx(3, 0), Lx(4, 0), ['Em', 'F', 'Em', 'B7'], { brass: .016, bass: 'two', shaker: .02, arp: pluck, arpV: .04, sixteenth: true, skip: .3 });
section(Lx(4, 0), Lx(5, -1.1), ['C', 'D', 'Em', 'D'], { brass: .015, bass: 'one', arp: bell, arpV: .025, skip: .6 });
section(Lx(5, -1.1), Lx(6, -1.4), ['G', 'C', 'D', 'G'], { brass: .014, bass: 'two', shaker: .022, cajon: .08, arp: pluck, arpV: .04 });
// B: copper's trick (bright), the ancient sea (drone → sunrise), the octopus (playful)
section(Lx(6, -1.4), Lx(8, -1.2), ['C', 'G', 'Am', 'F'], { brass: .015, bass: 'two', shaker: .02, arp: bell, arpV: .028, skip: .4 });
section(Lx(8, -1.2), Lx(9, 0), ['Em', 'Em', 'C', 'Em'], { drone: .02, bass: 'one', arp: pluck, arpV: .025, skip: .7 });
section(Lx(9, 0), Lx(10, 0), ['Em', 'C', 'G', 'D'], { brass: .016, drone: .01, bass: 'two', arp: pluck, arpV: .04, skip: .2 });
section(Lx(10, 0), Lx(11, -1.3), ['G', 'D', 'C', 'G'], { brass: .016, bass: 'walk', shaker: .02, arp: pluck, arpV: .04 });
section(Lx(11, -1.3), Lx(12, -1.0), ['Am', 'D', 'G', 'Em'], { brass: .013, bass: 'two', cajon: .07, arp: pluck, arpV: .04, oct: 12, skip: .3 });
// C: the respiratory chain — a steady groove; each line its own chords; the chamber hushes; cyanide darkens it
const C1 = [[Lx(12, -1.0), Lx(13, 0), ['G', 'Em7'], { arp: pluck, arpV: .035, bass: 'one' }],
  [Lx(13, 0), Lx(14, -1.0), ['G', 'D', 'Em', 'C'], { arp: pluck, arpV: .045, bass: 'walk', shaker: .022, cajon: .08, sixteenth: true, skip: .25 }],
  [Lx(14, -1.0), Lx(15, 0), ['C', 'G', 'D', 'G'], { arp: pluck, arpV: .04, bass: 'two', shaker: .018 }],
  [Lx(15, 0), Lx(16, 0), ['Am7', 'D', 'G', 'Em'], { arp: bell, arpV: .025, bass: 'two', skip: .4 }],
  [Lx(16, 0), Lx(17, 0), ['Em', 'C', 'Am', 'B7'], { arp: pluck, arpV: .035, bass: 'one', skip: .4 }],
  [Lx(17, 0), Lx(18, 0), ['Em', 'Am', 'B7', 'Em'], { arp: pluck, arpV: .03, bass: 'one', skip: .5 }],
  [Lx(18, 0), Lx(19, 0), ['Em', 'F', 'Em', 'B7'], { arp: pluck, arpV: .045, bass: 'two', shaker: .025, cajon: .1, sixteenth: true, skip: .2 }],
  [Lx(19, 0), Lx(20, -.8), ['C', 'D', 'G', 'G'], { arp: bell, arpV: .03, bass: 'two', shaker: .02 }],
  [Lx(20, -.8), Lx(21, 0), ['G', 'D', 'Em', 'C'], { arp: pluck, arpV: .045, bass: 'walk', shaker: .022, cajon: .09, sixteenth: true, skip: .25 }],
  [Lx(21, 0), Lx(22, 0), ['C', 'D', 'Bm', 'Em'], { arp: pluck, arpV: .04, bass: 'walk', shaker: .02 }],
  [Lx(22, 0), Lx(23, -.6), ['G', 'C', 'D', 'G'], { arp: bell, arpV: .03, bass: 'two', shaker: .018 }]];
C1.forEach(([a, b, p, s]) => section(a, b, p, { brass: .015, ...s }));
section(Lx(23, -.6), Lx(25, -1.4), ['Em', 'Em', 'Bb', 'Em'], { drone: .024, bass: 'one', arp: bell, arpV: .02, oct: -12, skip: .7 });
// D: the side jobs — a brisk montage; ALS and the anaemia shrug go quiet; the farm gets a country lilt
section(Lx(25, -1.4), Lx(27, 0), ['G', 'C', 'D', 'G'], { brass: .014, bass: 'two', shaker: .022, cajon: .09, arp: pluck, arpV: .045 });
section(Lx(27, 0), Lx(28, -1.2), ['Em', 'C', 'Am', 'Em'], { brass: .016, bass: 'one', arp: bell, arpV: .02, skip: .6 });
section(Lx(28, -1.2), Lx(30, 0), ['C', 'G', 'D', 'G'], { brass: .014, bass: 'walk', shaker: .022, cajon: .08, arp: pluck, arpV: .045 });
section(Lx(30, 0), Lx(31, -1.2), ['Am', 'Em', 'F', 'Esus'], { brass: .015, bass: 'one', arp: pluck, arpV: .03, skip: .5 });
section(Lx(31, -1.2), Lx(32, 0), ['G', 'D', 'C', 'G'], { brass: .014, bass: 'two', shaker: .022, cajon: .09, arp: pluck, arpV: .045, sixteenth: true, skip: .3 });
section(Lx(32, 0), Lx(33, -1.2), ['G', 'C', 'G', 'D'], { brass: .012, bass: 'two', arp: pluck, arpV: .05, pat: [0, 3, 1, 3, 2, 3, 1, 3] });
section(Lx(33, -1.2), Lx(34, -.5), ['Cmaj7', 'D', 'Bm', 'Em'], { brass: .015, bass: 'two', arp: bell, arpV: .025, skip: .3 });
section(Lx(34, -.5), Lx(35, -.2), ['Cmaj7', 'D', 'G', 'G'], { brass: .018, bass: 'one' });
// E: danger (drone, tense), then the escorts (careful, ticking), the pumps and the safe
section(Lx(35, -.2), Lx(37, -.4), ['Em', 'F', 'Em', 'Bb'], { drone: .022, bass: 'two', shaker: .02, arp: pluck, arpV: .035, sixteenth: true, skip: .4 });
section(Lx(37, -.4), Lx(38, -1.0), ['Am', 'D', 'G', 'Em'], { brass: .015, bass: 'one', arp: bell, arpV: .022, skip: .5 });
section(Lx(38, -1.0), Lx(41, -.8), ['G', 'Em', 'C', 'D'], { brass: .014, bass: 'two', shaker: .018, arp: pluck, arpV: .04, skip: .2 });
section(Lx(41, -.8), Lx(44, -1.4), ['C', 'G', 'Am', 'D'], { brass: .014, bass: 'walk', shaker: .02, cajon: .07, arp: pluck, arpV: .04 });
// F: when a pump breaks — hushed, gentle; a warm flashback; relief
section(Lx(44, -1.4), Lx(46, -.4), ['Em', 'C', 'Am', 'B7'], { brass: .016, bass: 'one', arp: bell, arpV: .02, skip: .6 });
section(Lx(46, -.4), Lx(47, -.4), ['G', 'C', 'G', 'D'], { brass: .014, bass: 'one', arp: pluck, arpV: .035, skip: .4 });
section(Lx(47, -.4), Lx(48, -1.2), ['C', 'G', 'D', 'G'], { brass: .016, bass: 'one', arp: bell, arpV: .025 });
section(Lx(48, -1.2), Lx(50, 8.0), ['Em', 'Am', 'C', 'B7'], { brass: .016, bass: 'one', arp: pluck, arpV: .028, skip: .5 });
section(Lx(50, 8.0), Lx(51, -.8), ['C', 'D', 'G', 'G'], { brass: .016, bass: 'two', arp: pluck, arpV: .035 });
section(Lx(51, -.8), Lx(52, -1.2), ['Cmaj7', 'D', 'G', 'G'], { brass: .018, bass: 'one' });
// G: the weapon (brassy), the night (bells, drone), everyday (warm, comic)
section(Lx(52, -1.2), Lx(54, -1.0), ['G', 'C', 'D', 'G'], { brass: .02, bass: 'walk', shaker: .022, cajon: .1, arp: pluck, arpV: .04 });
section(Lx(54, -1.0), Lx(57, -1.4), ['Em', 'C', 'Am', 'B7'], { drone: .02, brass: .01, bass: 'one', arp: bell, arpV: .028, oct: 12, skip: .4 });
section(Lx(57, -1.4), Lx(59, -1.2), ['G', 'C', 'D', 'G'], { brass: .014, bass: 'two', shaker: .02, cajon: .08, arp: pluck, arpV: .045 });
// H: home — warm, the motif lands, iris out
section(Lx(59, -1.2), DUR - 3.4, ['C', 'D', 'Bm', 'Em', 'C', 'D', 'G', 'G'], { brass: .017, bass: 'one', arp: pluck, arpV: .035 });
brass(DUR - 3.4, 2.8, CH.Gmaj7, .02); bell(DUR - 3.4, 79, .04, -.2); bell(DUR - 3.3, 83, .03, .2); bass(DUR - 3.4, 43, .1, 2.8);

// ---------- the recap motif (flugelhorn) at the "remember" moments ----------
motif(Lx(4, 6.0), 0, .04); motif(Lx(34, 10.6), 0, .05); motif(Lx(51, 11.0), 0, .05); motif(Lx(60, 7.6), 0, .055);

// ---------- stingers on the picture ----------
// A1: the lamp rattles, the cork pops, Pip pours out; copper dust; four rice grains; level
for (let i = 0; i < 10; i++) shaker(Lx(1, -.2) + i * .13, .05, (i % 2) - .5);
pop(Lx(1, 1.0), .1); whoosh(Lx(1, 1.1), 1.3, .07); slide(Lx(1, 1.2), 60, 79, .9, .035);
for (let i = 0; i < 12; i++) bell(Lx(1, 2.9 + i * .1), 86 + (i % 4) * 2, .012, (i % 3 - 1) * .5, 1.2);
for (let i = 0; i < 4; i++) pluck(Lx(1, 6.1 + i * .42), 83 + i * 2, .05, .3);
bell(Lx(1, 7.5), 79, .04); bell(Lx(1, 7.55), 86, .03);
whoosh(Lx(2, -.9), .9, .06);
// A2: plucked away, O₂ bounce off, the cell faints, copper returns; the pinball and the zap; mitts; the dive
gliss(Lx(2, 1.0), [86, 83, 79, 74, 71], .07, .03, bell);
for (let i = 0; i < 8; i++) boing(Lx(2, 4.3 + i * .32), .025, 62 + (i % 3) * 5);
slide(Lx(2, 6.0), 72, 55, 1.2, .03);
gliss(Lx(2, 9.0), [71, 74, 79, 83, 86], .1, .035, bell);
for (let i = 0; i < 7; i++) { knock(Lx(3, 3.2 + i * .63), .05); pluck(Lx(3, 3.2 + i * .63), 88 - i, .03); }
zap(Lx(3, 7.55), .07); boom(Lx(3, 7.6), .1);
whoosh(Lx(4, 6.6), 1.4, .08);
// A3: the iron ball rolls, bonks the bucket; the fountain of elements; the copper bonks Pip; caught
add(Lx(5, 2.7), 1.3, -.3, tt => .05 * Math.sin(TAU * 50 * tt) * (rnd() * .5 + .5) * Math.min(1, tt / .3));
cajon(Lx(5, 3.95), .18); knock(Lx(5, 3.95), .12);
gliss(Lx(5, 5.4), [67, 71, 74, 79, 83, 86], .22, .035);
bell(Lx(5, 8.6), 91, .04); boing(Lx(5, 11.5), .07, 60); bell(Lx(5, 12.5), 79, .05); bell(Lx(5, 12.55), 86, .04);
whoosh(Lx(6, -1.6), .8, .07);
// B1: yank (slide up) and give back (slide down) on the beat; the bell rings; the dunk
slide(Lx(6, 7.2), 67, 84, .4, .04); pop(Lx(6, 7.6), .07); bell(Lx(6, 8.2), 86, .03);
slide(Lx(6, 10.1), 84, 67, .6, .035); bell(Lx(6, 10.9), 79, .035);
for (let i = 0; i < 4; i++) bell(Lx(6, 11.4 + i * BEAT), i % 2 ? 79 : 86, .025);
[.4, .9, 1.4].forEach(d => bell(Lx(7, d), 67, .07, -.3, 4));
slide(Lx(7, 3.55), 84, 60, .4, .04); splash(Lx(7, 3.95), .09); pop(Lx(7, 4.65), .08); splash(Lx(7, 4.6), .05); bell(Lx(7, 5.6), 83, .04);
for (let i = 0; i < 6; i++) bell(Lx(7, 8.8 + i * .38), i % 2 ? 79 : 86, .02);
whoosh(Lx(8, -1.4), .8, .07);
// B2: knock knock; the bloom; the haze clears; the rocks crack; copper dissolves; enzymes; old and new friends; the pitches
knock(Lx(8, 10.5), .12); knock(Lx(8, 11.0), .12);
gliss(Lx(9, 0), [64, 67, 71, 74, 76, 79], .25, .03);
bowl(Lx(9, 3.3), 2.5, 79, .02);
boom(Lx(9, 5.25), .12); for (let i = 0; i < 7; i++) bell(Lx(9, 5.7 + i * .1), 86 + (i % 3) * 3, .018, (i % 3 - 1) * .5, 1.5);
for (let i = 0; i < 5; i++) pop(Lx(9, 7.6 + i * .25), .03);
bell(Lx(9, 11.4), 62, .04); bell(Lx(9, 13.6), 91, .05);
for (let i = 0; i < 5; i++) { whoosh(Lx(10, 10.8 + i * .28), .4, .025); pop(Lx(10, 11.3 + i * .28), .03); }
whoosh(Lx(11, -1.5), .6, .08);
// B3: the octopus; the vials; the ink jet
gliss(Lx(11, 1.6), [74, 79, 83, 86], .15, .03, bell);
bell(Lx(11, 6.8), 86, .03); bell(Lx(11, 7.0), 91, .03);
splash(Lx(11, 13.5), .1); slide(Lx(11, 13.6), 70, 55, .5, .03);
whoosh(Lx(12, -1.4), 1.2, .08);
// C1: the dive; the [H] drops; the relay
whoosh(Lx(12, 3.0), 2.4, .07); bell(Lx(12, 5.4), 79, .04);
for (let i = 0; i < 3; i++) pop(Lx(13, 2.0 + i * .5), .03);
for (let i = 0; i < 20; i++) pluck(Lx(13, 2.4 + i * .35), 74 + (i % 5) * 2, .025, (i % 3 - 1) * .4);
// C2: the skid, the pry, the pop; three coppers, two hemes; the deliveries; the drop to the chamber; the clamp
whoosh(Lx(14, 0), .6, .05); add(Lx(14, .3), .5, .2, tt => .04 * (rnd() * 2 - 1) * Math.exp(-tt * 6));
slide(Lx(14, 5.4), 50, 58, 1.2, .03); pop(Lx(14, 6.8), .1);
[7.0, 7.6, 8.2].forEach((d, i) => bell(Lx(14, d), [79, 83, 86][i], .035)); [10.0, 10.7].forEach((d, i) => bell(Lx(14, d), [67, 71][i], .04));
bell(Lx(15, 4.4), 91, .04); bell(Lx(15, 8.0), 91, .04); bell(Lx(16, .6), 86, .03);
for (let i = 0; i < 3; i++) pluck(Lx(16, 1.0 + i * 1.2), 79 - i * 3, .035);
bell(Lx(16, 5.4), 67, .04); bell(Lx(16, 7.2), 79, .04); tick(Lx(16, 10.6), .06); knock(Lx(16, 10.9), .07);
// C3: four fingers; one electron → a radical, the chase; two → H₂O₂; four banked; SNAP; splash; ✓
for (let i = 0; i < 4; i++) bell(Lx(17, 6.6 + i * .4), 79 + i * 2, .025);
zap(Lx(18, .6), .04); zap(Lx(18, 2.4), .06); for (let i = 0; i < 12; i++) { cajon(Lx(18, 6.2 + i * .17), .06); }
pop(Lx(18, 4.3), .06);
for (let i = 0; i < 4; i++) bell(Lx(19, 3.3 + i * .7), [74, 79, 83, 86][i], .04);
boom(Lx(19, 7.0), .1); gliss(Lx(19, 7.1), [74, 79, 83, 86, 91], .05, .035, bell);
splash(Lx(19, 9.6), .1); bell(Lx(19, 10.7), 86, .05); bell(Lx(19, 10.85), 91, .04);
// C4: protons pumped (ticks), the flood, the revolving door, ATP pops; the balance drops; level; the pie
for (let i = 0; i < 16; i++) tick(Lx(20, 1.4 + i * .25), .03);
whoosh(Lx(20, 6.8), 1.2, .08); for (let i = 0; i < 6; i++) whoosh(Lx(20, 7.6 + i * .2), .25, .04);
boing(Lx(20, 9.0), .06, 52); for (let i = 0; i < 6; i++) pop(Lx(20, 8.0 + i * .4), .03);
whoosh(Lx(21, 2.2), .8, .06); cajon(Lx(21, 3.0), .16); for (let i = 0; i < 12; i++) pluck(Lx(21, 3.0 + i * .28), 83 + (i % 4), .02);
cajon(Lx(21, 7.0), .12); bell(Lx(21, 7.5), 79, .05); bell(Lx(21, 7.55), 86, .04);
gliss(Lx(22, 2.0), [67, 71, 74, 79, 83], .25, .035, bell); bell(Lx(22, 7.8), 91, .04);
// C5: cyanide spins in, CLANG; the jam; the stall; taffy; the snap and fling
slide(Lx(23, .8), 40, 46, 3.2, .04); clang(Lx(23, 4.2), .1); boom(Lx(23, 4.2), .08);
slide(Lx(24, 3.2), 60, 40, 2.2, .03);
slide(Lx(24, 5.8), 55, 82, 2.2, .04); boing(Lx(24, 8.1), .08, 48); whoosh(Lx(24, 8.1), .7, .08);
whoosh(Lx(25, -1.6), .8, .07);
// D1: radicals; the free throw (twice), swish; the gulps; catalase fizz; the clumps; the motor neuron
for (let i = 0; i < 6; i++) zap(Lx(25, 6.2 + i * .3), .02);
slide(Lx(26, .4), 72, 84, .7, .03); add(Lx(26, 1.1), .3, 0, tt => .04 * (rnd() * 2 - 1) * Math.sin(Math.PI * tt / .3));
slide(Lx(26, 1.2), 72, 84, .7, .03); knock(Lx(26, 2.0), .08); bell(Lx(26, 2.1), 86, .04);
for (let i = 0; i < 3; i++) pop(Lx(26, 2.9 + i * .7), .04);
for (let i = 0; i < 10; i++) pop(Lx(26, 9.4 + i * .06), .015);
slide(Lx(27, 5.6), 67, 55, 3.0, .02);
whoosh(Lx(28, -1.4), .5, .08);
// D2: the conductor's whistle; ceruloplasmin glides in; six coppers; the bus; nothing helps
gliss(Lx(28, 3.6), [67, 71, 74, 79], .2, .03, bell); for (let i = 0; i < 6; i++) bell(Lx(28, 8.2 + i * .4), 79 + i * 2, .025);
for (let i = 0; i < 3; i++) tick(Lx(29, 1.2 + i * .55), .05);
whistle(Lx(29, 5.5), 91, .25); whistle(Lx(29, 5.85), 91, .5); slide(Lx(29, 7.3), 50, 62, 1.6, .03);
for (let i = 0; i < 12; i++) knock(Lx(30, 4.0 + i * .1), .03);
whoosh(Lx(31, -1.4), .5, .08);
// D3: staples click; the heartbeat; the trampoline; the farm; the balloon inflates and pops
for (let i = 0; i < 20; i++) tick(Lx(31, 3.2 + i * .32), .035);
for (let i = 0; i < 6; i++) { cajon(Lx(31, 10.4) + i * BEAT, .1); boing(Lx(31, 10.6) + i * BEAT, .03, 64); }
slide(Lx(32, 6.0), 55, 79, 4.4, .02); pop(Lx(32, 10.5), .14); boom(Lx(32, 10.5), .06);
whoosh(Lx(33, -1.4), .5, .08);
// D4: pigment and a firing neuron
for (let i = 0; i < 8; i++) pluck(Lx(33, 3.8 + i * .35), 79 + (i % 3) * 2, .02);
zap(Lx(33, 11.0), .03); gliss(Lx(33, 11.2), [74, 79, 83, 86], .06, .03, bell);
// R1: the icons pop; the sparks run
[1.6, 2.6, 4.0, 5.2, 6.4, 7.4].forEach((d, i) => bell(Lx(34, d), [74, 76, 79, 81, 83, 86][i], .035));
gliss(Lx(34, 13.1), [79, 83, 86, 91], .08, .035, bell);
// E1: Pip whistles while juggling; the fumble; BOOM; the rampage; the helper; again; the search; ✓
[[0, 79], [.35, 83], [.7, 86], [1.4, 83], [1.75, 79], [2.1, 76]].forEach(([d, m]) => whistle(Lx(35, d), m + 12, .3, .03));
slide(Lx(35, 3.4), 72, 60, .5, .03); for (let i = 0; i < 5; i++) knock(Lx(35, 3.9 + i * .7), .04);
boom(Lx(35, 7.8), .24); zap(Lx(35, 8.0), .05);
[3.0, 4.1, 5.1].forEach(d => { zap(Lx(36, d), .06); cajon(Lx(36, d), .12); });
bell(Lx(36, 9.0), 79, .04); boom(Lx(36, 11.4), .14);
for (let i = 0; i < 8; i++) tick(Lx(37, 4.2 + i * .7), .03);
bell(Lx(37, 10.4), 86, .05); bell(Lx(37, 10.55), 91, .04);
// E2: reduced; through CTR1; caught; the sulfur hands; the slide; the hot potato; the brigade
bell(Lx(38, 2.8), 91, .03); whoosh(Lx(38, 4.4), 2.0, .04); knock(Lx(38, 9.6), .07); bell(Lx(38, 9.7), 79, .035);
bell(Lx(39, 2.2), 83, .03); bell(Lx(39, 3.8), 86, .03); knock(Lx(39, 7.0), .06); slide(Lx(39, 9.0), 74, 81, 1.8, .025);
for (let i = 0; i < 6; i++) boing(Lx(39, 11.7 + i * .5), .025, 64 + i);
for (let i = 0; i < 16; i++) pluck(Lx(40, 0) + i * .45, [67, 71, 74, 79][i % 4], .03, (i % 4 - 1.5) * .3);
bell(Lx(40, 7.6), 86, .035); bell(Lx(40, 10.3), 83, .035);
// E3: the two pumps; ATP7A to blood and brain; ATP7B to bile; trucks out (horn), trucks back; the safe clicks and shuts; ✓
bell(Lx(41, .8), 74, .035); bell(Lx(41, 1.0), 79, .035);
for (let i = 0; i < 6; i++) pluck(Lx(41, 4.4 + i * .6), 79, .02); for (let i = 0; i < 6; i++) pluck(Lx(41, 8.8 + i * .6), 72, .02);
whistle(Lx(42, 3.0), 76, .18, .03); whistle(Lx(42, 3.25), 79, .18, .03); whistle(Lx(42, 7.0), 79, .18, .03); whistle(Lx(42, 7.25), 76, .18, .03);
for (let i = 0; i < 10; i++) tick(Lx(43, 6.4 + i * .1), .04); knock(Lx(43, 6.4), .1); bell(Lx(43, 8.4), 86, .04);
whoosh(Lx(44, -1.6), .8, .06);
// F: cracks; the gene; nothing gets out; the clue; the injection; the overflow; the ring; the magnet; zinc
knock(Lx(44, 1.7), .06); knock(Lx(44, 3.1), .06); bell(Lx(44, 6.2), 71, .03); bell(Lx(44, 7.0), 71, .03);
slide(Lx(45, .2), 67, 55, 1.4, .02);
bell(Lx(46, 8.6), 79, .03); bell(Lx(46, 13.4), 86, .04);
gliss(Lx(47, 1.0), [62, 67, 71, 74, 79], .4, .025, bell);
for (let i = 0; i < 10; i++) pluck(Lx(48, 6.0 + i * .35), 67 + (i % 4) * 2, .02);
bell(Lx(48, 8.4), 64, .035);
bell(Lx(50, 3.0), 76, .03); bell(Lx(50, 3.2), 79, .03);
slide(Lx(50, 9.8), 60, 72, 1.6, .025); for (let i = 0; i < 6; i++) knock(Lx(50, 12.2 + i * .12), .04);
// R2
bell(Lx(51, 8.8), 64, .04); bell(Lx(51, 12.4), 64, .04);
whoosh(Lx(52, -1.4), .5, .08);
// G1: the gulp; the ammo; the sizzle; the door; the bacteria fall
boing(Lx(52, 6.4), .05, 50); for (let i = 0; i < 3; i++) slide(Lx(52, 7.9 + i * .3), 72, 84, .4, .02);
add(Lx(52, 10.0), 1.4, 0, tt => .03 * (rnd() * 2 - 1) * Math.sin(Math.PI * tt / 1.4));
for (let i = 0; i < 4; i++) slide(Lx(53, 5.8 + i * .3), 79, 60, .5, .015);
add(Lx(54, -1.4), .8, 0, tt => .02 * (rnd() * 2 - 1) * Math.exp(-tt * 3));
// G2: the bulb; copper drifts in; the gum; the crumble; the dart boomerangs, then hits
bell(Lx(54, 2.2), 91, .05); bell(Lx(54, 2.3), 96, .03);
for (let i = 0; i < 8; i++) bell(Lx(54, 3.6 + i * .3), 79 + (i % 4) * 2, .015);
slide(Lx(55, 4.8), 55, 72, 1.2, .03); boing(Lx(55, 6.0), .06, 55);
for (let i = 0; i < 10; i++) knock(Lx(55, 7.0 + i * .1), .025);
for (let i = 0; i < 10; i++) knock(Lx(55, 11.6 + i * .1), .025);
whoosh(Lx(56, 2.6), 1.4, .06); pop(Lx(56, 4.9), .1); for (let i = 0; i < 10; i++) knock(Lx(56, 5.4 + i * .12), .025);
whoosh(Lx(57, -1.6), .8, .07);
// G3: the foods slide in; munching; the pills; the zinc door slams; flattened
for (let i = 0; i < 5; i++) { whoosh(Lx(57, [5.9, 6.6, 7.3, 8.0, 9.4][i]), .4, .03); bell(Lx(57, [5.9, 6.6, 7.3, 8.0, 9.4][i] + .4), 83 + i, .025); }
for (let i = 0; i < 8; i++) add(Lx(57, 11.0 + i * .18), .08, .2, tt => .04 * (rnd() * 2 - 1) * Math.exp(-tt * 40));
for (let i = 0; i < 14; i++) knock(Lx(58, 1.6 + i * .08), .025);
for (let i = 0; i < 12; i++) knock(Lx(58, 3.6 + i * .12), .03);
boom(Lx(58, 7.8), .2); cajon(Lx(58, 7.8), .2); slide(Lx(58, 7.9), 60, 40, .5, .04);
// H: the deep breath; inside, the landing; back out; hand to hand; level; wink; into the lamp; the rattle; iris
add(Lx(59, .4), 3.6, 0, tt => .02 * (rnd() * 2 - 1) * Math.sin(Math.PI * tt / 3.6)); whoosh(Lx(59, 4.8), .9, .07);
bell(Lx(59, 8.2), 79, .05); bell(Lx(59, 8.3), 86, .04); bell(Lx(59, 8.4), 91, .03);
for (let i = 0; i < 4; i++) bell(Lx(60, 2.2 + i * .25), 86 + i * 2, .02);
for (let i = 0; i < 4; i++) pluck(Lx(60, 4.4 + i * .8), [74, 79, 74, 79][i], .03);
cajon(Lx(60, 8.6), .08); bell(Lx(60, 8.7), 79, .045);
slide(Lx(60, 10.8), 84, 55, 1.0, .04); whoosh(Lx(60, 10.8), 1.1, .07); pop(Lx(60, 11.9), .09);
for (let i = 0; i < 6; i++) shaker(Lx(60, 13.0 + i * .1), .04);
bell(DUR - 2.4, 79, .035); bell(DUR - 2.2, 74, .035); bell(DUR - 2.0, 67, .04);

// ---------- reverb, ducking, the mix: streamed in place ----------
function readVo(p) { const b = readFileSync(p); let o = 12; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') return new Int16Array(b.buffer, b.byteOffset + o + 8, n / 2); o += 8 + n; } }
const vo = readVo('assets/copper_vo.wav'), voAt = n => n < vo.length ? vo[n] / 32768 : 0;
function verbState(off) { return { combs: [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 })), aps: [589 + off, 467 + off].map(d => ({ d, b: new Float32Array(d), i: 0 })) }; }
function verbStep(V, x) { let y = 0; for (const c of V.combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } y /= 4;
  for (const a of V.aps) { const v = a.b[a.i], u = y + v * .5; a.b[a.i] = u; y = v - u * .5; a.i = (a.i + 1) % a.d; } return y; }
const VL = verbState(0), VR = verbState(29);
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const wl = verbStep(VL, Lc[n]), wr = verbStep(VR, Rc[n]);
  const a = Math.abs(voAt(n)); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00003);
  const t = n / SR, fade = Math.min(1, t / 1.0) * Math.min(1, (DUR - t) / 1.0), g = fade * (1 - .5 * duck);
  Lc[n] = (Lc[n] + wl * .34) * g; Rc[n] = (Rc[n] + wr * .34) * g; peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n]));
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
writeWav('assets/copper_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/copper_mix.wav', n => Lc[n] * MUSIC + voAt(n) * 1.05, n => Rc[n] * MUSIC + voAt(n) * 1.05, 1);
console.log(`wrote assets/copper_bgm.wav and assets/copper_mix.wav (${DUR} s, peak ${peak.toFixed(3)})`);

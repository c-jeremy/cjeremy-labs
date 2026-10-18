// audio/music_selenium.mjs: the score for "Pip讲身体里的硒" (src/scenes/selenium.js), synthesised from scratch.
//   node tools/make.mjs selenium vo && node tools/make.mjs selenium music   → assets/selenium_bgm.wav and assets/selenium_mix.wav
// Its own palette, taken from the subject (not copper's handbells/brass or meiosis's e-piano/marimba/harp/flute): a glass
// harmonica and struck crystal (selenium ruby glass), a celesta for the moon goddess that also carries the recap motif, and
// for the Brazil nut a nylon-string guitar, a marimba, an upright bass and a light bossa groove (rim, surdo, shaker). The
// dragon dance gets a tom, a cymbal and a gong. Plus a big box of cartoon effects, one for every gag: crunch, record
// scratch, rewind, boing, slide whistle, train horn and screech, cork pop, sizzle, splash, jackpot, thwack, splat, clang,
// gong, hammer clank, slurp, sneeze, wah-wah. A major / F# minor, 86 bpm = PROJECT.bpm. Each section follows a voice line
// (times read from videos/selenium.json, like the scene's L(i, d)); the score cuts dead on the hot open's record scratch,
// ducks under the voice and breathes up in the long pauses. The reverb, the ducking and the WAV writing stream in place
// (two float arrays in memory) to stay light on a 4 GB laptop, as in audio/music_copper.mjs, whose engine this reuses.
import { readFileSync, openSync, writeSync, closeSync } from 'node:fs';

const MAN = JSON.parse(readFileSync('videos/selenium.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const Lc = new Float32Array(N), Rc = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 37; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); Lc[i0 + i] += v * gl; Rc[i0 + i] += v * gr; }
}
const env = (tt, a, d) => (tt < a ? tt / a : Math.exp(-(tt - a) / d));

// ---------- instruments ----------
function glassH(t, len, ms, v = .012) {                           // a glass harmonica: pure partials, slow swell, slight beating
  ms.forEach((m, j) => { const f = hz(m + 12), ph = rnd() * TAU;
    add(t, len + 1.2, (j / (ms.length - 1 || 1)) * 1.0 - .5, tt => { const a = Math.min(1, tt / .7) * (tt > len ? Math.exp(-(tt - len) / .6) : 1), tr = 1 + .12 * Math.sin(TAU * 4.3 * tt + ph);
      return v * a * tr * (Math.sin(TAU * f * tt) + .28 * Math.sin(TAU * f * 2.003 * tt) + .08 * Math.sin(TAU * f * 3.01 * tt)); }); });
}
const crystal = (t, m, v = .04, pan = 0, len = 2.6) => { const f = hz(m); add(t, len, pan, tt => {      // a struck wine glass
  return v * (Math.sin(TAU * f * tt) * Math.exp(-tt / 1.4) + .4 * Math.sin(TAU * f * 2.32 * tt) * Math.exp(-tt / .6) + .2 * Math.sin(TAU * f * 4.25 * tt) * Math.exp(-tt / .25)) * Math.min(1, tt / .002); }); };
const celesta = (t, m, v = .04, pan = 0) => { const f = hz(m); add(t, 1.8, pan, tt => v * Math.min(1, tt / .002) * (Math.sin(TAU * f * tt) * Math.exp(-tt / .9) + .35 * Math.sin(TAU * f * 4 * tt) * Math.exp(-tt / .08) + .15 * Math.sin(TAU * f * 2 * tt) * Math.exp(-tt / .4))); };
function nylon(t, m, v = .06, pan = 0) {                          // a nylon-string pluck: Karplus–Strong, darker than copper's steel
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); for (let i = 0; i < P; i++) buf[i] = rnd() * 2 - 1;
  let i = 0, prev = 0; add(t, 1.6, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = .996 * .5 * (a + b); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .45; return v * prev * Math.min(1, tt / .002); });
}
const marimba = (t, m, v = .05, pan = 0) => { const f = hz(m); add(t, .9, pan, tt => v * Math.min(1, tt / .002) * (Math.sin(TAU * f * tt) * Math.exp(-tt / .35) + .5 * Math.sin(TAU * f * 4 * tt) * Math.exp(-tt / .04) + .15 * Math.sin(TAU * f * 9.9 * tt) * Math.exp(-tt / .012))); };
const bass = (t, m, v = .11, len = BEAT * 1.4) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .008) * Math.exp(-tt / .8) * (tt > len ? Math.exp(-(tt - len) / .08) : 1);
  return v * e * (Math.sin(TAU * f * tt) + .3 * Math.sin(TAU * 2 * f * tt) * Math.exp(-tt * 6)); }); };
const shaker = (t, v = .022, pan = .3) => { let hp = 0, last = 0; add(t, .1, pan, tt => { const x = rnd() * 2 - 1; hp = x - last; last = x; return v * hp * env(tt, .015, .028); }); };
const rim = (t, v = .05) => add(t, .06, -.25, tt => v * (Math.sin(TAU * 1700 * tt) + .5 * (rnd() * 2 - 1)) * Math.exp(-tt * 70));
const surdo = (t, v = .14) => add(t, .5, 0, tt => v * Math.sin(TAU * (55 + 40 * Math.exp(-tt * 20)) * tt) * Math.exp(-tt * 6));
const tom = (t, v = .14, f0 = 140) => add(t, .5, 0, tt => v * Math.sin(TAU * (f0 * .6 + f0 * .6 * Math.exp(-tt * 18)) * tt) * Math.exp(-tt * 7));
function cymbal(t, v = .04, len = 1.4) { let hp = 0, last = 0; add(t, len, .2, tt => { const x = rnd() * 2 - 1; hp = .6 * hp + x - last; last = x; return v * hp * Math.exp(-tt / (len * .35)); }); }
function gong(t, v = .08) { const f = 98; add(t, 4.5, 0, tt => v * Math.min(1, tt / .02) * Math.exp(-tt / 1.6) * (Math.sin(TAU * f * tt * (1 + .01 * Math.exp(-tt))) + .6 * Math.sin(TAU * f * 1.41 * tt) + .4 * Math.sin(TAU * f * 2.37 * tt) * Math.exp(-tt) + .3 * Math.sin(TAU * f * 3.11 * tt))); }
// cartoon effects (whoosh, pop, boing, slide, splash, zap, boom, clang, tick, knock, whistle after audio/music_copper.mjs)
function whoosh(t, len, v = .06) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const pop = (t, v = .08, f0 = 900) => add(t, .12, 0, tt => v * Math.sin(TAU * (f0 - 5000 * tt) * tt) * Math.exp(-tt * 40));
const boing = (t, v = .06, m = 55) => { const f = hz(m); add(t, .7, .1, tt => v * Math.sin(TAU * f * tt * (1 + .35 * Math.sin(TAU * 7 * tt) * Math.exp(-tt * 3))) * Math.exp(-tt * 4)); };
function slide(t, m0, m1, len, v = .05) { let ph = 0; add(t, len + .05, .2, tt => { const f = hz(m0 + (m1 - m0) * Math.min(1, tt / len)); ph += TAU * f / SR; return v * Math.sin(ph) * Math.min(1, tt / .02) * (tt > len ? Math.exp(-(tt - len) / .03) : 1); }); }
function splash(t, v = .07) { let lp = 0; add(t, .9, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * (.5 - .4 * Math.min(1, tt / .6)); return v * lp * env(tt, .01, .25); }); }
function zap(t, v = .035) { add(t, .3, 0, tt => v * Math.sign(Math.sin(TAU * (1400 - 3000 * tt) * tt)) * Math.exp(-tt * 9) * (rnd() * .4 + .6)); }
function boom(t, v = .2) { let lp = 0; add(t, 1.6, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * .04; return v * (Math.sin(TAU * (45 + 50 * Math.exp(-tt * 6)) * tt) * Math.exp(-tt * 2.2) + 2.2 * lp * Math.exp(-tt * 3)); }); }
function clang(t, v = .07) { const f = 330; add(t, 2.0, 0, tt => v * Math.exp(-tt * 1.6) * (Math.sin(TAU * f * tt) + .7 * Math.sin(TAU * f * 2.41 * tt) + .5 * Math.sin(TAU * f * 3.97 * tt) + .3 * Math.sin(TAU * f * 5.43 * tt))); }
const tick = (t, v = .04) => add(t, .05, .3, tt => v * Math.sin(TAU * 2400 * tt) * Math.exp(-tt * 90));
const knock = (t, v = .1) => add(t, .2, -.1, tt => v * Math.sin(TAU * (180 + 80 * Math.exp(-tt * 40)) * tt) * Math.exp(-tt * 25));
function whistle(t, m, len, v = .045) { const f = hz(m); add(t, len + .05, .2, tt => v * Math.sin(TAU * f * tt + .3 * Math.sin(TAU * 32 * tt)) * Math.min(1, tt / .02) * (tt > len ? Math.exp(-(tt - len) / .03) : 1)); }
function noiseBurst(t, len, v, c0, c1 = c0, pan = 0) { let lp = 0; add(t, len, pan, tt => { const k = tt / len; lp += ((rnd() * 2 - 1) - lp) * (c0 + (c1 - c0) * k); return v * lp * Math.sin(Math.PI * Math.min(1, k * 4)) * (1 - k); }); }
const crunch = (t, v = .07) => { for (let i = 0; i < 3; i++) noiseBurst(t + i * .025, .06, v * (1 - i * .25), .7, .3, (i - 1) * .2); };
const sizzle = (t, len, v = .03) => { let hp = 0, last = 0; add(t, len, .1, tt => { const x = rnd() * 2 - 1; hp = .3 * hp + x - last; last = x; return v * hp * Math.min(1, tt / .05) * Math.exp(-tt / (len * .5)) * (.6 + .4 * rnd()); }); };
const thwack = (t, v = .09) => { noiseBurst(t, .08, v, .6, .2); knock(t, v * .9); };
const splat = (t, v = .1) => { noiseBurst(t, .35, v, .15, .05); add(t, .3, 0, tt => v * .8 * Math.sin(TAU * (90 - 40 * tt) * tt) * Math.exp(-tt * 10)); };
const honk = (t, v = .04, m = 58, len = .25) => { const f = hz(m); add(t, len + .05, .1, tt => v * Math.min(1, tt / .01) * (tt > len ? Math.exp(-(tt - len) / .03) : 1) * Math.tanh(3 * Math.sin(TAU * f * tt))); };
const horn = (t, v = .05) => { honk(t, v, 57, .5); honk(t, v * .8, 61, .5); honk(t + .6, v, 57, .7); honk(t + .6, v * .8, 61, .7); };
function screech(t, len, v = .03) { add(t, len, .1, tt => v * Math.sin(TAU * (2600 + 400 * Math.sin(TAU * 13 * tt)) * tt) * Math.min(1, tt / .03) * (1 - tt / len) * (.7 + .3 * rnd())); }
function scratch(t, v = .08) { let ph = 0, lp = 0; add(t, .45, 0, tt => { const sp = tt < .2 ? 1 - tt / .2 * 1.8 : -.8 + (tt - .2) / .25 * 1.6; ph += TAU * 180 * sp / SR; lp += ((rnd() * 2 - 1) - lp) * .5; return v * (Math.sin(ph * 3) * .6 + lp * .5) * Math.min(1, tt / .01) * Math.exp(-tt * 3); }); }
function rewind(t, len, v = .04) { add(t, len, 0, tt => { const k = tt / len, sp = 1 + 5 * Math.sin(Math.PI * k); let s = 0; for (const m of [69, 73, 76]) s += Math.sin(TAU * hz(m) * sp * tt * (1 + .03 * Math.sin(TAU * 18 * tt))); return v * s * Math.sin(Math.PI * k) * (.7 + .3 * Math.sin(TAU * 40 * tt)); }); }
const corkPop = (t, v = .1) => { pop(t, v, 1400); noiseBurst(t, .05, v * .5, .8); };
const ratchet = (t, n, step, v = .03) => { for (let i = 0; i < n; i++) tick(t + i * step, v); };
const jackpot = (t, v = .03) => { for (let i = 0; i < 10; i++) crystal(t + i * .07, [81, 85, 88, 93][i % 4] + (i > 5 ? 12 : 0), v, (i % 3 - 1) * .5, 1.2); for (let i = 0; i < 6; i++) tick(t + .4 + i * .05, .03); };
const ding = (t, m = 88, v = .045) => { crystal(t, m, v); crystal(t + .02, m + 7, v * .5); };
const slurp = (t, v = .05) => { let lp = 0; add(t, .5, 0, tt => { const k = tt / .5; lp += ((rnd() * 2 - 1) - lp) * (.05 + .5 * k); return v * lp * Math.sin(Math.PI * k) * 2; }); pop(t + .48, .07); };
const whirr = (t, len, v = .03) => { let ph = 0; add(t, len, 0, tt => { const k = tt / len, f = 80 + 260 * Math.sin(Math.PI * k); ph += TAU * f / SR; return v * Math.sign(Math.sin(ph)) * Math.sin(Math.PI * k) * .6; }); };
const sneeze = (t, v = .07) => { slide(t, 64, 70, .35, v * .5); noiseBurst(t + .38, .18, v, .9, .2); };
const clatter = (t, n = 6, v = .05) => { for (let i = 0; i < n; i++) knock(t + i * .045 + .02 * hash(i), v * (.6 + .4 * hash(i + 3))); };
const glassCrack = (t, v = .05) => { tick(t, v * 2); for (let i = 0; i < 5; i++) crystal(t + .03 + i * .05, 96 + (i % 3) * 3, v * .4, (i - 2) * .3, .6); };
const wahwah = (t, v = .04) => { [62, 61, 60, 59].forEach((m, i) => { const f = hz(m); let lp = 0; add(t + i * .45, i === 3 ? 1.0 : .42, 0, tt => { const s = 2 * ((f * tt) % 1) - 1, c = .02 + .1 * (.5 + .5 * Math.sin(TAU * (i === 3 ? 5 : 2.5) * tt)); lp += (s - lp) * c; return v * lp * 2.5 * Math.min(1, tt / .03); }); }); };
const cough = (t, v = .05) => { for (let i = 0; i < 3; i++) noiseBurst(t + i * .22, .14, v, .25, .08); };
const drip = (t, v = .05) => slide(t, 72, 88, .09, v);
const squeak = (t, v = .03) => slide(t, 88, 96, .08, v);
const buzz = (t, len, v = .012) => add(t, len, .3, tt => v * (2 * ((230 * (1 + .03 * Math.sin(TAU * 9 * tt)) * tt) % 1) - 1) * Math.min(1, tt / .05) * Math.min(1, (len - tt) / .05));
const toot = (t, v = .045) => { whistle(t, 81, .12, v); whistle(t + .18, 81, .22, v); };
const fireRoar = (t, len, v = .05) => { let lp = 0; add(t, len, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * .08; return v * lp * 3 * Math.min(1, tt / .2) * Math.min(1, (len - tt) / .4) * (.8 + .2 * Math.sin(TAU * 7 * tt)); }); };
const ignite = (t, v = .03) => { noiseBurst(t, .08, v * 1.5, .8, .4); fireRoar(t + .05, .35, v); };
const crumble = (t, n = 10) => { for (let i = 0; i < n; i++) knock(t + i * .09, .04 * (1 - i / n) + .01); };
function gliss(t, ms, step = .06, v = .04, inst = celesta) { ms.forEach((m, i) => inst(t + i * step, m, v, (i / ms.length) - .5)); }

// ---------- harmony ----------
const CH = { A: [57, 61, 64, 69], Amaj7: [57, 61, 64, 68], 'F#m7': [54, 57, 61, 64], 'F#m': [54, 57, 61, 66], Bm7: [59, 62, 66, 69], E7: [52, 59, 62, 68], E: [52, 56, 59, 64], Esus: [52, 57, 59, 64],
  Dmaj7: [50, 54, 57, 61], D: [50, 57, 62, 66], 'C#m7': [49, 56, 59, 64], Bb: [58, 62, 65, 70], G: [55, 59, 62, 67], Dm: [50, 57, 62, 65], Fmaj7: [53, 57, 60, 64] };
const ROOT = { A: 45, Amaj7: 45, 'F#m7': 42, 'F#m': 42, Bm7: 47, E7: 40, E: 40, Esus: 40, Dmaj7: 38, D: 38, 'C#m7': 37, Bb: 46, G: 43, Dm: 38, Fmaj7: 41 };
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    if (st.glass) glassH(t, len, ch, st.glass);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) bass(tb, r, .1, BEAT * 3.4);
      if (st.bass === 'bossa') { if (b === 0) bass(tb, r, .1, BEAT * 1.2); if (b === 1) bass(tb + BEAT * .5, r + 7, .08, BEAT * .9); if (b === 2) bass(tb, r + 7, .09, BEAT * 1.2); if (b === 3) bass(tb + BEAT * .5, r, .08, BEAT * .9); }
      if (st.bass === 'walk') bass(tb, r + [0, 4, 7, 9][b], .085, BEAT * .9);
      if (st.shaker) { shaker(tb + BEAT / 2, st.shaker); if (st.sixteenth) { shaker(tb + BEAT * .25, st.shaker * .5, -.3); shaker(tb + BEAT * .75, st.shaker * .6, -.3); } }
      if (st.groove) { if (b % 2 === 0) surdo(tb, st.groove); if (b === 1 || b === 3) rim(tb + (b === 3 ? BEAT * .5 : 0), st.groove * .35); }
      if (st.dragon) { if (b < 2) tom(tb, st.dragon, 150 - 20 * b); else if (b === 2) cymbal(tb, st.dragon * .35, .9); }
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.sixteenth ? 4 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          (st.arp)(tb + e * BEAT / per, m, (st.arpV ?? .045) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
const MOTIF = [[0, 73, .5], [.5, 76, .5], [1, 81, 1], [2, 80, .5], [2.5, 78, .5], [3, 76, 1.5]];   // the recap theme, in beats
const motif = (t, tr = 0, v = .05) => MOTIF.forEach(([b, m, d]) => { celesta(t + b * BEAT, m + tr, v); crystal(t + b * BEAT, m + tr - 12, v * .35, 0, d * BEAT * 2); });
const PENTA = [69, 71, 73, 76, 78, 81, 83, 85];                   // A major pentatonic, for the dragon dance

// ---------- sections (one per shot, following the voice) ----------
// A1: the hot open — a bright bossa that stops dead on the record scratch; the freeze; the rewind; the one nut
section(0, 5.15, ['Amaj7', 'F#m7'], { groove: .12, bass: 'bossa', shaker: .025, sixteenth: true, arp: nylon, arpV: .05 });
glassH(6.0, Lx(2, .1) - 6.0, [57, 61, 64], .006);                 // a held, faint pad under the frozen frame
section(Lx(2, 1.7), Lx(3, -.3), ['Dmaj7', 'C#m7', 'Bm7', 'E7'], { bass: 'one', arp: nylon, arpV: .04, skip: .4, glass: .006 });
// A2: the tightrope; the question
section(Lx(3, -.3), Lx(4, 0), ['F#m7', 'Bm7', 'E7', 'Amaj7'], { bass: 'bossa', shaker: .02, arp: marimba, arpV: .04, skip: .3 });
section(Lx(4, 0), Lx(5, -.2), ['Dmaj7', 'C#m7', 'Bm7', 'Esus'], { glass: .01, bass: 'one', arp: crystal, arpV: .02, skip: .6 });
// B: sulfur's cousin and the moon; the ruby signal; the two toys
section(Lx(5, -.2), Lx(6, 0), ['Amaj7', 'Dmaj7', 'F#m7', 'E'], { glass: .008, bass: 'one', arp: celesta, arpV: .035, skip: .3 });
section(Lx(6, 0), Lx(7, -1.0), ['Dmaj7', 'A', 'Bm7', 'Esus'], { glass: .01, bass: 'one', arp: celesta, arpV: .03, skip: .45 });
section(Lx(7, -1.0), Lx(8, 0), ['A', 'F#m7', 'D', 'E'], { bass: 'bossa', shaker: .022, sixteenth: true, arp: nylon, arpV: .045, skip: .2 });
section(Lx(8, 0), Lx(9, -.6), ['Bm7', 'E7', 'Amaj7', 'F#m7'], { bass: 'bossa', groove: .08, arp: marimba, arpV: .04, skip: .3 });
// C: twenty-one; the ribosome train and the race; the magician and the failures
section(Lx(9, -.6), Lx(11, 0), ['A', 'D', 'E', 'A'], { bass: 'bossa', shaker: .02, arp: marimba, arpV: .045, skip: .2 });
section(Lx(11, 0), Lx(12, -.2), ['F#m7', 'C#m7', 'D', 'E'], { bass: 'one', arp: nylon, arpV: .035, skip: .4 });
section(Lx(12, -.2), Lx(13, 0), ['F#m7', 'D', 'E', 'C#m7'], { bass: 'walk', shaker: .02, groove: .08, arp: marimba, arpV: .04 });
section(Lx(13, 0), Lx(14, .8), ['Dmaj7', 'E', 'C#m7', 'F#m7'], { bass: 'one', arp: celesta, arpV: .03, skip: .35 });
section(Lx(14, .8), Lx(14, 11.8), ['Bm7', 'E7', 'F#m7', 'F#m7'], { bass: 'walk', shaker: .028, sixteenth: true, groove: .11, arp: marimba, arpV: .05, skip: .15 });
section(Lx(14, 11.8), Lx(15, -.6), ['A', 'E', 'D', 'A'], { bass: 'bossa', shaker: .02, arp: nylon, arpV: .05 });
section(Lx(15, -.6), Lx(16, 0), ['Dmaj7', 'C#m7', 'Bm7', 'E7'], { glass: .008, bass: 'one', arp: celesta, arpV: .035, skip: .3 });
section(Lx(16, 0), Lx(17, -1.7), ['F#m7', 'Bm7', 'E7', 'A'], { bass: 'walk', shaker: .02, arp: marimba, arpV: .045, skip: .2 });
// D: GPx (bright), the boom (tense), the cycle (groove), the boxing match (brisk)
section(Lx(17, -1.7), Lx(19, 4.0), ['A', 'F#m7', 'D', 'E'], { bass: 'bossa', shaker: .02, arp: marimba, arpV: .04, skip: .25 });
section(Lx(19, 4.0), Lx(20, -.4), ['F#m', 'Bb', 'F#m', 'C#m7'], { glass: .01, bass: 'one', shaker: .02, sixteenth: true, arp: nylon, arpV: .03, skip: .4 });
section(Lx(20, -.4), Lx(22, 0), ['D', 'E', 'C#m7', 'F#m7'], { bass: 'bossa', groove: .08, arp: marimba, arpV: .04, skip: .2 });
section(Lx(22, 0), Lx(23, -1.0), ['Bm7', 'E7', 'Amaj7', 'D'], { bass: 'walk', shaker: .025, sixteenth: true, groove: .1, arp: nylon, arpV: .045 });
// E: the membrane catches; GPx4; the roar and the crumble; the mice (hushed); the light turns green
section(Lx(23, -1.0), Lx(24, 0), ['F#m', 'D', 'E', 'F#m'], { glass: .008, bass: 'one', arp: nylon, arpV: .035, skip: .3 });
section(Lx(24, 0), Lx(25, 2.4), ['F#m', 'Bb', 'F#m', 'C#m7'], { bass: 'walk', shaker: .025, sixteenth: true, groove: .09, arp: marimba, arpV: .04 });
section(Lx(25, 2.4), Lx(26, -.3), ['Dm', 'Bb', 'Dm', 'Bb'], { glass: .014, bass: 'one', arp: crystal, arpV: .015, skip: .7 });
section(Lx(26, -.3), Lx(28, 0), ['Dmaj7', 'A', 'Bm7', 'F#m7'], { glass: .009, bass: 'one', arp: celesta, arpV: .02, skip: .6 });
section(Lx(28, 0), Lx(29, -1.5), ['D', 'E', 'A', 'A'], { glass: .008, bass: 'one', arp: celesta, arpV: .03, skip: .3 });
// F: the thyroid (playful), the dentist, the bath; the tetherball; the dragon dance; the queue
section(Lx(29, -1.5), Lx(30, 0), ['A', 'Dmaj7', 'E', 'A'], { bass: 'bossa', shaker: .02, arp: celesta, arpV: .035, skip: .25 });
section(Lx(30, 0), Lx(31, 0), ['F#m7', 'Bm7', 'E7', 'A'], { bass: 'walk', shaker: .022, groove: .08, arp: marimba, arpV: .04, skip: .2 });
section(Lx(31, 0), Lx(32, -.3), ['Dmaj7', 'C#m7', 'F#m7', 'E'], { bass: 'bossa', arp: nylon, arpV: .04, skip: .3 });
section(Lx(32, -.3), Lx(33, -.6), ['A', 'F#m7', 'D', 'E'], { bass: 'bossa', shaker: .022, arp: marimba, arpV: .045 });
section(Lx(33, -.6), Lx(35, -.2), ['A', 'A', 'D', 'A'], { bass: 'one', dragon: .1, arp: (t, m, v, p) => celesta(t, PENTA[Math.floor(hash(t * 7) * PENTA.length)], v, p), arpV: .035, skip: .3 });
section(Lx(35, -.2), Lx(36, -.4), ['Bm7', 'E7', 'A', 'F#m7'], { bass: 'walk', shaker: .02, arp: marimba, arpV: .04, skip: .2 });
// R1: the recap — glass and the celesta motif, then a held chord under the 不倒翁
section(Lx(36, -.4), Lx(37, -.3), ['Dmaj7', 'E', 'C#m7', 'F#m7', 'Bm7', 'E7', 'Amaj7', 'Amaj7'], { glass: .012, bass: 'one', arp: celesta, arpV: .02, skip: .55 });
motif(Lx(36, -.3)); motif(Lx(36, 15.6), 0, .04);
// G: the turn (sneaky), the soils (comic), the map (sad)
section(Lx(37, -.3), Lx(38, -.6), ['F#m', 'C#m7', 'D', 'C#m7'], { bass: 'one', arp: nylon, arpV: .04, oct: -12, pat: [0, 1, 0, 2, 0, 1, 3, 1], skip: .2 });
section(Lx(38, -.6), Lx(39, -.5), ['A', 'D', 'E', 'A'], { bass: 'bossa', shaker: .02, arp: marimba, arpV: .04 });
section(Lx(39, -.5), Lx(40, -.2), ['F#m7', 'D', 'Bm7', 'E'], { glass: .012, bass: 'one', arp: crystal, arpV: .015, skip: .6 });
// H: Keshan (hushed, winter), the Mianning spring (warmer), the virus (eerie), the cop (comic), the dawn
section(Lx(40, -.2), Lx(42, -.7), ['F#m', 'Dmaj7', 'Bm7', 'C#m7'], { glass: .011, bass: 'one', arp: crystal, arpV: .012, skip: .75 });
section(Lx(42, -.7), Lx(44, -.4), ['A', 'Dmaj7', 'E', 'A'], { glass: .009, bass: 'one', arp: celesta, arpV: .022, skip: .5 });
section(Lx(44, -.4), Lx(45, 6.8), ['F#m', 'G', 'F#m', 'G'], { glass: .012, bass: 'one', arp: nylon, arpV: .025, skip: .6 });
section(Lx(45, 6.8), Lx(46, -.2), ['A', 'E', 'F#m7', 'D'], { bass: 'walk', shaker: .022, arp: marimba, arpV: .04 });
section(Lx(46, -.2), Lx(47, -.6), ['Dmaj7', 'A', 'E', 'A'], { glass: .01, bass: 'one', arp: celesta, arpV: .03, skip: .3 });
// I: the steppe (a country lilt), Enshi (hushed), keratin, the backfire (tense), garlic (comic)
section(Lx(47, -.6), Lx(49, -.1), ['A', 'D', 'A', 'E'], { bass: 'walk', shaker: .02, arp: nylon, arpV: .05, pat: [0, 3, 1, 3, 2, 3, 1, 3] });
section(Lx(49, -.1), Lx(50, -.25), ['F#m7', 'Dmaj7', 'Bm7', 'C#m7'], { glass: .011, bass: 'one', arp: crystal, arpV: .013, skip: .7 });
section(Lx(50, -.25), Lx(51, -.2), ['A', 'F#m7', 'Bm7', 'E'], { bass: 'bossa', arp: marimba, arpV: .04, skip: .25 });
section(Lx(51, -.2), Lx(52, -.2), ['F#m', 'Bb', 'F#m', 'C#m7'], { glass: .01, bass: 'one', shaker: .025, sixteenth: true, arp: nylon, arpV: .035, skip: .3 });
section(Lx(52, -.2), Lx(53, -.2), ['D', 'E', 'A', 'F#m7'], { bass: 'bossa', shaker: .02, arp: marimba, arpV: .045, skip: .2 });
// R2: the recap again
section(Lx(53, -.2), Lx(54, -.3), ['Dmaj7', 'E', 'C#m7', 'F#m7', 'Bm7', 'E7', 'Amaj7', 'Amaj7'], { glass: .012, bass: 'one', arp: celesta, arpV: .02, skip: .55 });
motif(Lx(53, -.1)); motif(Lx(53, 14.2), 0, .04);
// J: the kitchen bossa; Finland (a tractor polka); supplements; the nut bowl
section(Lx(54, -.3), Lx(56, -.4), ['Amaj7', 'F#m7', 'Bm7', 'E7'], { groove: .1, bass: 'bossa', shaker: .022, sixteenth: true, arp: nylon, arpV: .045, skip: .15 });
section(Lx(56, -.4), Lx(57, -.4), ['D', 'A', 'E', 'A'], { bass: 'walk', shaker: .022, arp: marimba, arpV: .05, pat: [0, 3, 1, 3, 0, 3, 1, 3] });
section(Lx(57, -.4), Lx(58, -.3), ['F#m7', 'Bm7', 'E7', 'Amaj7'], { groove: .09, bass: 'bossa', shaker: .02, arp: nylon, arpV: .04, skip: .2 });
section(Lx(58, -.3), Lx(59, -.1), ['Dmaj7', 'C#m7', 'Bm7', 'E7'], { bass: 'bossa', arp: celesta, arpV: .035, skip: .3 });
// K: the journey (bright), all day long (glass swells), stop → go, the room and the moon
section(Lx(59, -.1), Lx(60, 0), ['A', 'E', 'F#m7', 'D'], { groove: .09, bass: 'bossa', shaker: .022, arp: celesta, arpV: .04, skip: .15 });
section(Lx(60, 0), Lx(61, -.2), ['Dmaj7', 'E', 'C#m7', 'F#m7'], { glass: .012, bass: 'one', shaker: .02, sixteenth: true, arp: marimba, arpV: .04, skip: .2 });
section(Lx(61, -.2), Lx(62, -.2), ['Bm7', 'E7', 'Amaj7', 'D'], { glass: .01, bass: 'one', arp: celesta, arpV: .03, skip: .3 });
section(Lx(62, -.2), DUR - 2.6, ['Dmaj7', 'A', 'Bm7', 'E'], { glass: .01, bass: 'bossa', arp: nylon, arpV: .04, skip: .3 });
glassH(DUR - 2.6, 2.4, CH.Amaj7, .014); motif(Lx(62, 9.4), 0, .045);

// ---------- stingers, gags and effects (times from the scene) ----------
const L = Lx;
// A1: crunches, the fly, the yawn, the wilt, the sniff, the leaf, the double take, the scratch; the rewind; the glint; the whip
[.41, .77, 1.13, 1.49, 1.85].forEach(t => crunch(t, .08));
buzz(.6, 2.0); slide(2.6, 84, 60, .4, .03); knock(3.0, .05);
slide(2.15, 62, 50, .8, .03); slide(2.9, 67, 58, .6, .025); noiseBurst(3.3, .15, .04, .3, .1); boing(3.55, .06, 60);
pop(4.4, .07, 1200); slide(4.8, 60, 84, .15, .04); boing(4.85, .05, 67); scratch(5.18, .1);
rewind(L(2, .2), 1.4, .035); crystal(L(2, 5.0), 88, .05); crystal(L(2, 5.1), 93, .03); for (let i = 0; i < 3; i++) crystal(L(2, 8.9 + i * .1), 93 + i * 2, .03);
whoosh(L(3, -.45), .5, .07);
// A2: the handful, the lurches, the throw, the bonk, the twang; the split nut; the push in
for (let i = 0; i < 8; i++) knock(L(3, 2.5 + i * .07), .04); slide(L(3, 3.0), 60, 72, .5, .035); whoosh(L(3, 6.4), .4, .06); slide(L(3, 6.5), 72, 60, .5, .035);
knock(L(3, 9.55), .1); boing(L(3, 9.6), .06, 62); nylon(L(3, 9.9), 40, .12); for (let i = 0; i < 4; i++) tick(L(3, 9.7 + i * .25), .02);
knock(L(4, 5.5), .06); crystal(L(4, 5.6), 85, .04); crystal(L(4, 5.7), 92, .03); whoosh(L(5, -1.0), .9, .05);
// B1: the beads pop; the climb (boings), the wobble, the fall, the thud; the mud; the smear; the moon
for (let i = 0; i < 4; i++) pop(L(5, .6 + i * .35), .06, 700 + 150 * i);
for (let i = 0; i < 4; i++) boing(L(5, 5.4 + i * .45), .035, 62 + 3 * i); slide(L(5, 9.2), 79, 55, .9, .04); cajon_(L(5, 10.1)); stars_(L(5, 10.2));
noiseBurst(L(6, 3.3), .4, .05, .08, .03); crystal(L(6, 5.2), 86, .04); whoosh(L(6, 7.6), .6, .04); gliss(L(6, 9.6), [76, 81, 85, 88, 93], .12, .03); glassH(L(6, 10.4), 2.4, [69, 73, 76], .012);
whoosh(L(7, -1.1), .45, .07);
// B2: breath into the pipe; the ruby drop; the lens flies; the lamp lights; the horn; the screech; the toys; O on; pop; punches
noiseBurst(L(7, .2), 1.2, .02, .05, .02); crystal(L(7, 2.2), 90, .04); whoosh(L(7, 4.5), .9, .05); crystal(L(7, 6.4), 76, .05); crystal(L(7, 6.45), 83, .03);
horn(L(7, 9.0), .045); screech(L(7, 9.6), .5, .03); knock(L(7, 10.0), .1); slide(L(7, 10.4), 72, 66, .3, .02);
toot(L(8, .2), .035); boing(L(8, 1.0), .05, 55); boing(L(8, 1.2), .05, 60); tick(L(8, 6.6), .04); tick(L(8, 6.7), .04); pop(L(8, 8.45), .07, 1100); whoosh(L(8, 8.5), .5, .03);
thwack(L(8, 11.45), .09); knock(L(8, 11.9), .05); sizzle(L(8, 11.9), 1.4, .025);
thwack(L(8, 15.2), .08); slide(L(8, 15.6), 55, 70, .4, .03); knock(L(8, 16.1), .12); boing(L(8, 16.1), .07, 58); stars_(L(8, 16.2));
// C1: the wave of beads (marimba run), BONG, the polish; the swaps; the hops and shoves; the red light
for (let i = 0; i < 20; i++) marimba(L(9, .3 + i * .15), [69, 71, 73, 76, 78][i % 5] + (i > 9 ? 12 : 0), .03, (i / 20) - .5);
gong(L(9, 4.4), .05); crystal(L(9, 4.45), 81, .04); for (let i = 0; i < 6; i++) squeak(L(9, 7.0 + i * .3), .015);
[3.2, 3.75, 4.3, 4.85].forEach((a, i) => { whoosh(L(10, a), .35, .03); nylon(L(10, a + .35), 64 + 3 * i, .05); }); crystal(L(10, 5.4), 88, .04);
[1.6, 2.4, 3.2].forEach(a => { boing(L(11, a + .2), .03, 67); knock(L(11, a + .5), .05); }); knock(L(11, 5.05), .05); crystal(L(11, 4.8), 64, .05); for (let i = 0; i < 4; i++) tick(L(11, 6.6 + i * .17), .03);
// C2: the chug to the stop; the paddle; the toot; the escort; the race (trip, slide, slam, splat); green; toot
for (let i = 0; i < 5; i++) { surdo(L(12, -1.4 + i * BEAT), .08); shaker(L(12, -1.4 + i * BEAT + BEAT / 2), .03); } screech(L(12, 3.2), .3, .02); ding(L(12, 5.6), 76, .04);
toot(L(13, 4.3), .045); pop(L(13, 6.3), .06); whoosh(L(13, 7.6), .7, .04);
whoosh(L(14, .8), .3, .05); slide(L(14, 5.4), 74, 55, .4, .04); knock(L(14, 5.8), .1); slide(L(14, 9.4), 60, 74, .4, .04);
thwack(L(14, 9.9), .1); clang(L(14, 9.95), .04); splat(L(14, 10.5), .11); boing(L(14, 10.7), .05, 50); stars_(L(14, 10.8));
ding(L(14, 11.95), 85, .05); ding(L(14, 12.1), 90, .04); toot(L(14, 12.4), .045);
// C3: the serine snaps on; the cork; the screw; the light; the sizzle; the lost races; the 25; the topple
pop(L(15, 4.0), .05, 600); corkPop(L(15, 7.0), .1); ratchet(L(15, 7.6), 10, .1, .025); crystal(L(15, 8.45), 88, .05); sizzle(L(15, 8.8), 1.0, .03); slide(L(15, 9.3), 76, 70, .5, .02);
boing(L(16, .7), .05, 52); splat(L(16, 2.3), .08); honk(L(16, 3.9), .05, 52, .35);
for (let i = 0; i < 25; i++) marimba(L(16, 5.6 + i * .06), 81 + (i % 5) * 2, .022, (i % 5 - 2) * .2);
slide(L(16, 8.4), 70, 50, .5, .035); knock(L(16, 8.9), .08); nylon(L(16, 9.4), 64, .04); nylon(L(16, 9.6), 61, .04);
whoosh(L(17, -1.9), .6, .06);
// D1: glide in; pat; bubbles; the splash, the blond DING, the mirror gasp; the iron boom; zaps; chomp; drip; O; coins; jackpot
whoosh(L(17, .3), 1.2, .04); for (let i = 0; i < 3; i++) squeak(L(17, 2.6 + i * .25), .02); for (let i = 0; i < 6; i++) drip(L(17, 5.4 + i * .45), .02);
splash(L(18, 5.4), .09); ding(L(18, 5.6), 93, .05); crystal(L(18, 6.9), 81, .04); slide(L(18, 7.0), 74, 86, .2, .03);
knock(L(19, 2.6), .05); boom(L(19, 5.9), .18); for (let i = 0; i < 6; i++) zap(L(19, 6.1 + i * .55), .03); slide(L(19, 6.8), 72, 60, .3, .02);
knock(L(20, .6), .09); pop(L(20, .62), .05, 500); drip(L(20, 2.8), .05); pop(L(20, 4.2), .05, 1000);
tick(L(21, 2.6), .05); crystal(L(21, 2.65), 96, .02); tick(L(21, 4.2), .05); crystal(L(21, 4.25), 96, .02); jackpot(L(21, 5.3), .028);
ding(L(22, .2), 88, .05); ding(L(22, .5), 88, .05); slide(L(22, 2.9), 50, 46, 2.0, .025);
for (let i = 0; i < 8; i++) { whoosh(L(22, 9.9 + i * .18), .45, .03); knock(L(22, 10.4 + i * .18), .05); }
knock(L(22, 10.6), .1); [0, .5, 1.0].forEach(a => tick(L(22, 10.9 + a), .05)); knock(L(22, 13.0), .12); boing(L(22, 13.0), .07, 55); stars_(L(22, 13.3));
whoosh(L(23, -1.0), .5, .07);
// E1: the matches catch one by one; the foot; the iron rolls; the kick; the ricochet; the extinguisher; sputter; roar; cough; crumble
for (let d = 0; d <= 6; d++) ignite(L(23, 7.4 + d * .45), .02 + .004 * d); sizzle(L(23, 10.2), 1.6, .03); for (let i = 0; i < 4; i++) boing(L(23, 10.7 + i * .45), .03, 70);
for (let i = 0; i < 6; i++) knock(L(24, .3 + i * .4), .025); thwack(L(24, 2.9), .1); [3.2, 3.8, 4.4].forEach(a => { knock(L(24, a), .06); ignite(L(24, a + .05), .03); }); fireRoar(L(24, .8), 9.6, .015);
sizzle(L(24, 10.9), 2.6, .045); for (let i = 0; i < 4; i++) noiseBurst(L(25, .4 + i * .3), .12, .04, .2, .1);
fireRoar(L(25, 2.4), 3.0, .07); boom(L(25, 3.0), .16); cough(L(25, 4.5), .05); crumble(L(25, 5.0), 12); crystal(L(25, 11.7), 57, .06); crystal(L(25, 11.75), 64, .04);
// E2: the click; the brake neurons dim; green; the glow
tick(L(26, 7.2), .05); for (let i = 0; i < 4; i++) crystal(L(27, 4.6 + i * .5), 81 - i * 3, .025);
ding(L(28, 3.6), 81, .045); gliss(L(28, 6.8), [76, 81, 85, 88], .1, .03);
whoosh(L(29, -1.6), .6, .05);
// F1: the organs pop; the thyroid glows; the crown (a little fanfare); the dentist (creak, POP, crash), T3, the stove; the bath
for (let i = 0; i < 5; i++) pop(L(29, .3 + i * .2), .05, 600 + 100 * i); glassH(L(29, 3.6), 1.6, [69, 73, 76, 81], .01); gliss(L(29, 6.0), [69, 73, 76, 81, 85], .08, .035); crystal(L(29, 6.8), 93, .04);
slide(L(30, 5.2), 40, 46, 2.1, .02); corkPop(L(30, 7.4), .12); whoosh(L(30, 7.45), .4, .05); clang(L(30, 7.85), .05); knock(L(30, 7.85), .12); stars_(L(30, 8.0));
crystal(L(30, 8.4), 85, .05); fireRoar(L(30, 9.2), 2.6, .05); for (let i = 0; i < 6; i++) drip(L(31, .4 + i * .7), .015);
for (let i = 0; i < 4; i++) tick(L(31, 2.6 + i * .6), .04); splash(L(31, 5.3), .07); ding(L(31, 5.6), 93, .05); for (let i = 0; i < 3; i++) squeak(L(31, 7.5 + i * .25), .025);
// F2: the tail whooshes; the ducks; the thwack; the S–S opens; the dent pops out
whoosh(L(32, 4.8), .4, .05); whoosh(L(32, 5.8), .4, .05); whoosh(L(32, 8.2), .4, .06); thwack(L(32, 8.4), .1); boing(L(32, 8.5), .06, 52); stars_(L(32, 9.0));
pop(L(32, 9.0), .05, 900); pop(L(32, 10.7), .07, 400); crystal(L(32, 11.0), 88, .03);
whoosh(L(33, -1.0), .5, .06);
// F3: the dragon dance: gong at the start; the claw clamps; the portcullis CLANG; the slide down
gong(L(33, 3.8), .06); cymbal(L(33, 5.6), .04, 1.4); knock(L(34, 1.0), .06); whoosh(L(34, 4.2), .4, .05); clang(L(34, 4.65), .08); knock(L(34, 4.65), .12); slide(L(34, 4.9), 72, 52, .8, .03); pop(L(34, 5.6), .05);
// F4: the juggle, two slots, the shredder
for (let i = 0; i < 8; i++) marimba(L(35, .3 + i * .38), [81, 85, 88][i % 3], .025); ding(L(35, 4.1), 85, .04); ding(L(35, 5.8), 88, .04);
for (let i = 0; i < 14; i++) noiseBurst(L(35, 7.8 + i * .13), .1, .04, .5, .2); slide(L(35, 8.0), 62, 55, .6, .02);
// R1: each icon pops on its word; the 不倒翁 tips and rights itself; sparkles
[1.2, 4.9, 6.3, 7.6, 9.7].forEach((a, i) => crystal(L(36, a), [81, 85, 88, 90, 93][i], .035)); boing(L(36, 14.8), .04, 64); for (let i = 0; i < 5; i++) crystal(L(36, 15.3 + i * .08), 88 + i * 2, .025);
// G1: the disguise; the straw; the parade up; the tweezers; the slurp; the auger; the map
for (let i = 0; i < 4; i++) nylon(L(37, 1.9 + i * .18), 45 - i, .07); slide(L(37, 7.2), 60, 67, .3, .02); for (let i = 0; i < 8; i++) pop(L(37, 7.8 + i * .45 + 1.2), .03, 900 + 60 * i); ratchet(L(37, 10.9), 4, .2, .02); slurp(L(37, 12.0), .06);
whirr(L(38, 4.2), 2.4, .03); stars_(L(38, 6.7)); glassH(L(39, 1.6), 3.6, [66, 69, 73], .008);
// H: the uneven heartbeat; lights out; the tablets; the cases; the virus warble; the cop's whistle; green → red; the salt
for (let i = 0; i < 6; i++) surdo(L(40, 3.6 + i * .6 + .15 * hash(i)), .05); crystal(L(40, 8.0), 57, .03); crystal(L(40, 8.6), 54, .03);
for (let i = 0; i < 12; i++) tick(L(42, 3.4 + i * .3), .015); for (let i = 0; i < 4; i++) crystal(L(42, 9.5 + i * .3), 76, .012); for (let i = 0; i < 10; i++) crystal(L(43, 2.7 + i * .2), 76, .012);
slide(L(44, 11.6), 66, 70, 1.2, .015); slide(L(44, 12.2), 70, 64, 1.0, .015); whoosh(L(45, 2.2), 1.4, .04);
ding(L(45, 7.5), 85, .04); for (let i = 0; i < 6; i++) whistle(L(45, 8.0 + i * .38), 88, .15, .03); ding(L(45, 9.7), 69, .04);
for (let i = 0; i < 14; i++) shaker(L(46, .7 + i * .2), .03); gliss(L(46, 3.4), [69, 73, 76, 81], .15, .03);
whoosh(L(47, -1.0), .5, .07);
// I1: the caravan; the hooves pop; three hammer clanks, the thumb; the x-ray; the horse backs away
for (let i = 0; i < 4; i++) pop(L(47, 12.1 + i * .12), .06, 500 + 120 * i); [12.9, 13.25, 13.6].forEach(a => { clang(L(47, a), .025); knock(L(47, a), .06); }); clang(L(47, 14.0), .04); slide(L(47, 14.05), 70, 86, .3, .04);
crystal(L(48, 1.3), 90, .035); slide(L(48, 7.4), 64, 55, 1.0, .025);
// I2: rain, then the dry sun; the comb
for (let i = 0; i < 10; i++) tick(L(49, 6.0 + i * .14), .015); glassH(L(49, 11.4), 2.4, [61, 64], .006);
// I3: icons pop; the rope lights; the disguised ones elbow in; SNAP; the leaf falls; the hammer bonk
[.5, 2.6, 4.4].forEach(a => pop(L(50, a), .05)); glassH(L(50, 7.0), 1.6, [69, 76], .008); for (let i = 0; i < 4; i++) nylon(L(50, 10.9 + i * .2), 44 - i, .06);
nylon(L(50, 12.9), 64, .1); noiseBurst(L(50, 12.92), .08, .05, .7); slide(L(50, 13.4), 79, 60, .6, .035); knock(L(50, 14.6), .12); boing(L(50, 14.6), .06, 57); stars_(L(50, 14.8));
// I4: the flood; the superoxide loops; the backfire
for (let i = 0; i < 6; i++) marimba(L(51, .4 + i * .25), 69 + i * 2, .03); for (let i = 0; i < 10; i++) zap(L(51, 3.7 + i * .35), .02);
boom(L(51, 10.4), .16); fireRoar(L(51, 10.4), 1.2, .07); cough(L(51, 11.4), .045);
// I5: methyl clicks; down and up; the exhale; the faint; flies; the jar; the crack
for (let i = 0; i < 8; i++) tick(L(52, 1.0 + i * .25), .03); slide(L(52, 4.2), 72, 60, .8, .025); slide(L(52, 5.6), 60, 76, 1.2, .025); whoosh(L(52, 6.4), 1.4, .03);
noiseBurst(L(52, 8.8), 1.0, .05, .05, .02); slide(L(52, 9.5), 67, 48, .8, .035); knock(L(52, 10.2), .07); for (let i = 0; i < 4; i++) tick(L(52, 10.3 + i * .1), .025);
crystal(L(52, 10.2), 93, .03); glassCrack(L(52, 11.2), .05); wahwah(L(52, 11.6), .03);
// R2: icons; the glowing rope
[2.9, 4.4, 6.2, 9.6, 10.6, 11.6].forEach((a, i) => crystal(L(53, a), [76, 78, 81, 83, 85, 88][i], .03)); glassH(L(53, 12.4), 2.6, [69, 73, 76, 81], .012);
// J1: the dial; the limit; the food parade; munching; Finland (whip, putt-putt, sneeze, the blood rises); the bottle; the pills; ✗; the sugar; the handful
for (let i = 0; i < 8; i++) tick(L(54, 2.6 + i * .5), .02); ding(L(54, 8.1), 64, .045);
for (let i = 0; i < 5; i++) { whoosh(L(55, .4 + i * .6), .4, .025); marimba(L(55, .9 + i * .6), 81 + i * 2, .03); } for (let i = 0; i < 5; i++) crunch(L(55, 5.4 + i * .35), .04);
whoosh(L(56, -.5), .5, .06); for (let i = 0; i < 40; i++) knock(L(56, .3 + i * .27), .02); sneeze(L(56, 6.8), .07); for (let i = 0; i < 6; i++) marimba(L(56, 8.0 + i * .4), 69 + i * 2, .03);
whoosh(L(57, -.6), .5, .06); pop(L(57, .5), .06); for (let i = 0; i < 16; i++) shaker(L(57, 2.2 + i * .075), .045); corkPop(L(57, 3.4), .1);
for (let i = 0; i < 26; i++) tick(L(57, 3.5 + i * .06), .03); knock(L(57, 6.5), .06); slide(L(57, 9.6), 64, 70, .8, .02);
clatter(L(58, 1.9), 6, .04); clatter(L(58, 4.4), 6, .04); ding(L(58, 6.0), 88, .04); whoosh(L(59, -.6), .5, .05);
// K1: the nut splits; lanterns; the portcullis falls (Pip ducks: ta-da); each hit and right-again; the days spin
knock(L(59, .2), .07); crystal(L(59, .3), 88, .04); gong(L(59, 3.0), .035); clang(L(59, 6.2), .05); gliss(L(59, 6.5), [76, 81, 85], .08, .03);
[2.4, 5.6, 6.6, 7.4, 8.1, 8.7].forEach((a, i) => { knock(L(60, a), .04); boing(L(60, a + .5), .03, 60 + i); });
for (let i = 0; i < 4; i++) glassH(L(60, 5.4 + i * .9), .9, [69 + i * 2, 76 + i * 2], .008);
// K2: green; the ribosome toots; the sulfur toy stays down (wah-wah)
ding(L(61, 4.6), 85, .05); ding(L(61, 4.75), 90, .04); toot(L(61, 5.4), .045); wahwah(L(61, 10.4), .03);
// K3: the old leaf falls, the sprout boings up; rope steps; the bow; the yawn; the cactus blooms; the wink; the iris
slide(L(62, 1.0), 72, 60, .6, .02); boing(L(62, 1.4), .05, 67); crystal(L(62, 1.6), 88, .03);
for (let i = 0; i < 8; i++) nylon(L(62, 3.5 + i * .42), [69, 73, 71, 74, 73, 76, 74, 78][i], .03);
gliss(L(62, 7.0), [69, 73, 76, 81], .06, .03); slide(L(62, 7.6), 62, 52, .8, .025); gliss(L(62, 7.9), [81, 85, 88, 93, 97], .08, .035); ding(L(62, 8.7), 93, .04);
crystal(DUR - 2.4, 81, .035); crystal(DUR - 2.2, 76, .035); crystal(DUR - 2.0, 69, .04);
function cajon_(t) { surdo(t, .16); knock(t, .08); }
function stars_(t) { for (let i = 0; i < 4; i++) crystal(t + i * .12, [93, 97, 95, 100][i], .012, (i - 1.5) * .4, .8); }

// ---------- reverb, ducking, the mix: streamed in place (after audio/music_copper.mjs) ----------
function readVo(p) { const b = readFileSync(p); let o = 12; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') return new Int16Array(b.buffer, b.byteOffset + o + 8, n / 2); o += 8 + n; } }
const vo = readVo('assets/selenium_vo.wav'), voAt = n => n < vo.length ? vo[n] / 32768 : 0;
function verbState(off) { return { combs: [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 })), aps: [589 + off, 467 + off].map(d => ({ d, b: new Float32Array(d), i: 0 })) }; }
function verbStep(V, x) { let y = 0; for (const c of V.combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } y /= 4;
  for (const a of V.aps) { const v = a.b[a.i], u = y + v * .5; a.b[a.i] = u; y = v - u * .5; a.i = (a.i + 1) % a.d; } return y; }
const VL = verbState(0), VR = verbState(29), CUT0 = Math.floor(5.6 * SR), CUT1 = Math.floor(6.0 * SR);
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const wl = verbStep(VL, Lc[n]), wr = verbStep(VR, Rc[n]);
  const a = Math.abs(voAt(n)); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00003);
  const t = n / SR, fade = Math.min(1, t / .15) * Math.min(1, (DUR - t) / 1.0), g = fade * (1 - .5 * duck);
  const cut = n > CUT0 && n < CUT1 ? 0 : 1;                       // the record scratch stops everything dead, reverb too
  const hot = n < CUT0 ? 1.8 : 1;                                 // the wordless hot open plays louder (and is left out of the peak)
  Lc[n] = (Lc[n] + wl * .32) * g * cut * hot; Rc[n] = (Rc[n] + wr * .32) * g * cut * hot; if (n >= CUT0) peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n]));
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
writeWav('assets/selenium_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/selenium_mix.wav', n => Lc[n] * MUSIC + voAt(n) * 1.05, n => Rc[n] * MUSIC + voAt(n) * 1.05, 1);
console.log(`wrote assets/selenium_bgm.wav and assets/selenium_mix.wav (${DUR} s, peak ${peak.toFixed(3)})`);

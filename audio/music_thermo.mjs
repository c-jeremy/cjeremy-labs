// audio/music_thermo.mjs: the score for "Pip讲体温调节" (src/scenes/thermo.js), synthesised from scratch.
//   node tools/make.mjs thermo vo && node tools/make.mjs thermo music   → assets/thermo_bgm.wav and assets/thermo_mix.wav
// A cartoon palette, its own (not the kalimba/glock of mRNA and opto, not the e-piano/marimba of meiosis): a bright
// xylophone, a reedy clarinet that carries the motif, an oompah tuba, a honky-tonk piano, a slide whistle, woodblock,
// timpani, a brushed hat, and a box of sound effects (fire roar, ice shimmer, glass shatter, boing, kettle whistle,
// a quiz clock and bell, the sad trombone). F major, 96 bpm = PROJECT.bpm. Each section follows a voice line (times read
// from videos/thermo.json, like the scenes' L(i, d)); the music ducks under the voice and breathes up in the pauses.
import { readFileSync, writeFileSync } from 'node:fs';

const MAN = JSON.parse(readFileSync('videos/thermo.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
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
const rel = (tt, len, r = .08) => tt > len ? Math.exp(-(tt - len) / r) : 1;

// ---------- instruments ----------
const xylo = (t, m, v = .06, pan = 0) => { const f = hz(m); add(t, .8, pan, tt => v * (Math.sin(TAU * f * tt) * env(tt, .001, .18) + .35 * Math.sin(TAU * f * 3.97 * tt) * Math.exp(-tt * 40) + .12 * Math.sin(TAU * f * 9.8 * tt) * Math.exp(-tt * 90))); };
function clarinet(t, m, len, v = .045, pan = -.15) {               // odd harmonics, a breath of noise, a late vibrato
  const f = hz(m); let lp = 0;
  add(t, len + .3, pan, tt => { const a = Math.min(1, tt / .05) * rel(tt, len, .07), vib = 1 + .005 * Math.sin(TAU * 5.4 * tt) * Math.min(1, tt / .35), ph = TAU * f * vib * tt;
    lp += ((rnd() * 2 - 1) - lp) * .08; return v * a * (Math.sin(ph) + .38 * Math.sin(3 * ph) + .16 * Math.sin(5 * ph) + .07 * Math.sin(7 * ph) + .1 * lp); });
}
function tuba(t, m, len = BEAT * .8, v = .1) {
  const f = hz(m);
  add(t, len + .25, 0, tt => { const a = Math.min(1, tt / .03) * rel(tt, len, .06), br = .5 + .5 * Math.exp(-tt * 6), ph = TAU * f * tt;
    return v * a * Math.tanh(1.5 * (Math.sin(ph) + .5 * br * Math.sin(2 * ph) + .25 * br * Math.sin(3 * ph))); });
}
function piano(t, m, v = .035, pan = 0, len = BEAT * .9) {           // honky-tonk: two detuned FM voices
  for (const d of [-.08, .08]) { const f = hz(m + d); add(t, len + .5, pan + d * 2, tt => v * .5 * env(tt, .003, .5) * rel(tt, len, .15) * Math.sin(TAU * f * tt + 1.4 * Math.exp(-tt * 5) * Math.sin(TAU * f * 2 * tt))); }
}
const pad = (t, len, ms, v = .018) => ms.forEach((m, j) => { for (const det of [-.07, .07]) { const f = hz(m + det), ph = rnd();
  add(t, len + 1, (j / (ms.length - 1 || 1)) * 1.4 - .7, tt => { const a = Math.min(1, tt / .8) * rel(tt, len, .4), x = (f * tt + ph) % 1; return v * a * (1 - 4 * Math.abs(x - .5)) * .8; }); } });
const wood = (t, v = .06, p = 1) => add(t, .08, .25, tt => v * Math.sin(TAU * 1100 * p * tt) * Math.exp(-tt * 60));
const hat = (t, v = .02, pan = .3) => { let hp = 0, pr = 0; add(t, .07, pan, tt => { const x = rnd() * 2 - 1; hp = .9 * (hp + x - pr); pr = x; return v * hp * Math.exp(-tt * 55); }); };
const kick = (t, v = .2) => add(t, .35, 0, tt => v * Math.sin(TAU * (50 + 90 * Math.exp(-tt * 25)) * tt) * Math.exp(-tt * 9));
const snare = (t, v = .06) => add(t, .2, -.1, tt => v * ((rnd() * 2 - 1) * .8 + .5 * Math.sin(TAU * 190 * tt)) * Math.exp(-tt * 20));
const timp = (t, m = 41, v = .18) => { const f = hz(m); add(t, 1.2, 0, tt => v * Math.sin(TAU * f * (1 + .06 * Math.exp(-tt * 8)) * tt) * Math.exp(-tt * 3.2)); };
function slide(t, m0, m1, len, v = .045, pan = .2) {                // the slide whistle
  let ph = 0; add(t, len + .05, pan, tt => { const k = Math.min(1, tt / len), m = m0 + (m1 - m0) * k, f = hz(m) * (1 + .012 * Math.sin(TAU * 6 * tt)); ph += TAU * f / SR;
    return v * Math.min(1, tt / .02) * rel(tt, len, .03) * (Math.sin(ph) + .1 * Math.sin(2 * ph)); });
}
function boing(t, m = 50, v = .08) { let ph = 0; add(t, .7, 0, tt => { const f = hz(m) * (1 + .5 * Math.exp(-tt * 6) * Math.sin(TAU * 11 * tt)); ph += TAU * f / SR; return v * Math.sin(ph) * Math.exp(-tt * 4.5); }); }
function noiseBurst(t, len, v, lo, hi, pan = 0, shape = k => Math.sin(k * Math.PI)) {   // band-limited noise: roar, whoosh, hiss, crash
  let a = 0, b = 0; add(t, len, pan, tt => { const k = tt / len, x = rnd() * 2 - 1; a += (x - a) * hi; b += (a - b) * lo; return v * shape(k) * (a - b) * 3; });
}
const whoosh = (t, len = .8, v = .06) => noiseBurst(t, len, v, .05, .35);
const roar = (t, len, v = .08) => { noiseBurst(t, len, v, .02, .12, .1, k => Math.min(1, k * 8) * (1 - k) * (1 + .3 * Math.sin(k * 60))); timp(t, 36, v * 1.2); };
const sizzle = (t, len, v = .03) => noiseBurst(t, len, v, .4, .9, .3, k => Math.sin(k * Math.PI) * (.6 + .4 * Math.sin(k * 90)));
function shimmer(t, ms, v = .03) { ms.forEach((m, i) => { const f = hz(m); add(t + i * .045, 2.2, (i % 3 - 1) * .5, tt => v * env(tt, .002, .7) * Math.sin(TAU * f * tt + .8 * Math.sin(TAU * f * 2.76 * tt) * Math.exp(-tt * 3))); }); }
const ice = t => { shimmer(t, [96, 100, 103, 108, 103, 100], .028); noiseBurst(t, .5, .025, .5, .95, .3); };
const crackle = (t, len = .5) => { for (let i = 0; i < 9; i++) wood(t + hash(i * 3.1 + t) * len, .05, 2 + hash(i + t) * 2); };
const shatter = t => { noiseBurst(t, .5, .09, .3, .9, 0, k => Math.exp(-k * 6)); for (let i = 0; i < 10; i++) xylo(t + .02 + i * .045, 96 + Math.floor(hash(i + 9) * 12), .03, (hash(i) - .5) * 1.4); };
const crunch = t => { for (let i = 0; i < 4; i++) noiseBurst(t + i * .05, .06, .07, .2, .7); };
const pop = (t, m = 84, v = .05) => { let ph = 0; add(t, .12, .1, tt => { ph += TAU * hz(m + 14 * (1 - tt / .12)) / SR; return v * Math.sin(ph) * Math.exp(-tt * 30); }); };
function bell(t, m = 89, v = .06) { const f = hz(m); add(t, 2.5, .1, tt => v * Math.exp(-tt * 1.6) * (Math.sin(TAU * f * tt) + .5 * Math.sin(TAU * f * 2.76 * tt) * Math.exp(-tt * 3) + .3 * Math.sin(TAU * f * 5.4 * tt) * Math.exp(-tt * 6))); }
const tick = (t, v = .07) => { wood(t, v, 1.6); add(t, .03, -.3, tt => v * .5 * (rnd() * 2 - 1) * Math.exp(-tt * 200)); };
function kettle(t, len, v = .03) { add(t, len, .3, tt => { const k = tt / len, f = 1900 + 300 * Math.min(1, k * 3); return v * Math.min(1, k * 6) * (1 - Math.pow(k, 4)) * (Math.sin(TAU * f * tt + 2 * Math.sin(TAU * 6 * tt)) + .4 * (rnd() * 2 - 1)); }); }
function buzzer(t, len = .45, v = .04) { add(t, len, 0, tt => v * rel(tt, len - .05, .02) * Math.sign(Math.sin(TAU * 110 * tt)) * .6); }
const blips = (t, n, m0, step, dt, v = .03) => { for (let i = 0; i < n; i++) xylo(t + i * dt, m0 + i * step, v, ((i % 5) - 2) * .25); };
function sadTrombone(t) {                                            // wah, wah, wah, waaah
  [[0, 70, .45], [.55, 69, .45], [1.1, 68, .45], [1.65, 67, 1.6]].forEach(([d, m, len], j) => {
    const f = hz(m - 12); add(t + d, len + .3, -.1, tt => { const a = Math.min(1, tt / .05) * rel(tt, len, .12), wah = .55 + .45 * Math.sin(Math.min(1, tt / .35) * Math.PI / 2) * (j === 3 ? .7 + .3 * Math.sin(TAU * 5 * tt) : 1), ph = TAU * f * tt * (1 + (j === 3 ? .006 * Math.sin(TAU * 5 * tt) : 0));
      return .06 * a * Math.tanh(1.8 * (Math.sin(ph) + .6 * wah * Math.sin(2 * ph) + .4 * wah * Math.sin(3 * ph) + .2 * wah * Math.sin(4 * ph))); });
  });
}

// ---------- harmony ----------
const CH = { F: [53, 57, 60, 65], Fmaj7: [53, 57, 60, 64], Bb: [58, 62, 65, 70], Bbmaj7: [58, 62, 65, 69], C: [55, 60, 64, 67], C7: [55, 58, 64, 67],
  Dm: [57, 62, 65, 69], Gm: [55, 58, 62, 67], Gm7: [55, 58, 62, 65], Am: [57, 60, 64, 69], A7: [57, 61, 64, 67], A: [57, 61, 64, 69], Eb: [55, 58, 63, 67], D: [57, 62, 66, 69] };
const ROOT = { F: 41, Fmaj7: 41, Bb: 46, Bbmaj7: 46, C: 36, C7: 36, Dm: 38, Gm: 43, Gm7: 43, Am: 45, A7: 45, A: 45, Eb: 39, D: 38 };
// style: pad, oom (tuba oompah: root on 1 and 3, piano chords on 2 and 4), walk, arp (xylo), hat, skip, tremolo, groove (four on the floor)
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    pad(t, len, ch, st.pad ?? .016);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.oom) { if (b % 2 === 0) tuba(tb, r + (b === 2 ? 7 : 0) - (r + 7 > 50 && b === 2 ? 12 : 0), BEAT * .7, st.oom); else ch.slice(1).forEach((m, i) => piano(tb + i * .006, m + 12, (st.pno ?? .022), (i - 1) * .3, BEAT * .5)); }
      if (st.walk) tuba(tb, r + [0, 4, 7, 9][b] - (name.includes('m') && b === 1 ? 1 : 0), BEAT * .8, st.walk);
      if (st.hat) { hat(tb + BEAT / 2, st.hat); if (b % 2) hat(tb, st.hat * .6, -.3); }
      if (st.groove) { kick(tb, st.groove); if (b % 2) snare(tb, st.groove * .35); hat(tb + BEAT / 2, .025); tuba(tb + BEAT / 2, r, BEAT * .35, .08); }
      if (st.trem) for (let e = 0; e < 4; e++) xylo(tb + e * BEAT / 4, ch[(b + e) % 4] + 24, st.trem * (.6 + .4 * rnd()), (e % 2 ? .4 : -.4));
      if (st.arp) { const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2]; for (let e = 0; e < 2; e++) { const i = b * 2 + e; if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue; xylo(tb + e * BEAT / 2, ch[pat[i % pat.length]] + 12 + (st.oct || 0), (st.arp) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); } }
    }
  }
}
const MOTIF = [[0, 72, .5], [.5, 74, .5], [1, 77, 1], [2, 76, .5], [2.5, 74, .5], [3, 72, 1.5]];   // the motif, in beats
const motif = (t, tr = 0, v = .04) => MOTIF.forEach(([b, m, d]) => clarinet(t + b * BEAT, m + tr, d * BEAT * .92, v));
const huh = t => { clarinet(t, 67, BEAT * .4, .04); clarinet(t + BEAT * .45, 72, BEAT * .8, .04); };   // the quiz "hmm?"
const countdown = c0 => { for (let i = 0; i < 3; i++) tick(c0 + i + 1 - .02); tick(c0, .05); bell(c0 + 3, 89, .07); bell(c0 + 3.04, 96, .05); xylo(c0 + 3.1, 84, .05); xylo(c0 + 3.2, 89, .05); };

// ---------- sections ----------
section(0, Lx(2, 0), ['F', 'Dm', 'Gm7', 'C7'], { oom: .09, arp: .04, skip: .35 });                     // A: the kitchen, bouncy
section(Lx(2, 0), 25.4, ['Bb', 'C', 'Am', 'Dm'], { oom: .08, hat: .015 });
section(25.6, Lx(4, 0), ['Dm', 'Gm', 'A7', 'Dm'], { pad: .02, walk: .07 });                             // B1: the quiz, a sneaky walk
section(Lx(4, 0), Lx(5, 0), ['F', 'Bb', 'C', 'F'], { pad: .018, arp: .035, skip: .3 });
section(Lx(5, 0), Lx(7, 0), ['F', 'Dm', 'Gm7', 'C7'], { oom: .07, arp: .035, skip: .4, hat: .012 });  // B2: TRPV1, hot and bouncy
section(Lx(7, 0), Lx(8, 0), ['Dm', 'Bbmaj7', 'Gm', 'A7'], { pad: .02, trem: .012, walk: .06 });        // TRPM8, cold
section(Lx(8, 0), 101.4, ['F', 'C', 'Bb', 'C7'], { oom: .08, arp: .035, hat: .015 });                   // the Nobel
section(101.4, Lx(10, 0), ['Dm', 'Bb', 'Gm', 'A'], { pad: .022, walk: .055, arp: .03, skip: .5 });     // C: the brain, mysterious
section(Lx(10, 0), 127.9, ['Dm', 'Gm', 'A7', 'Dm'], { pad: .02, walk: .06 });
section(127.9, Lx(13, 2.8), ['Dm', 'Bbmaj7', 'Gm7', 'A7'], { pad: .022, trem: .01, walk: .05 });       // D1: snow
section(Lx(13, 2.8), Lx(13, 9.3), ['Dm', 'A7'], { pad: .02, trem: .022, walk: .07, hat: .02 });          // the shiver
section(Lx(13, 9.3), Lx(14, 0), ['Dm', 'Bb', 'C', 'Dm'], { groove: .16, arp: .04 });                   // 抖音: the dance
section(Lx(14, 0), Lx(15, -.6), ['Bb', 'C', 'F', 'F'], { oom: .08, arp: .03 });                          // the stove warms up
section(Lx(15, -.6), Lx(17, 5.4), ['F', 'C', 'Dm', 'Bb'], { walk: .07, arp: .035, hat: .015, skip: .25 });   // D2: brown fat, a working groove
section(Lx(17, 5.4), Lx(17, 10.2), ['Dm', 'Dm', 'Gm', 'A7'], { pad: .012 });                           // sneaking through the back door
section(Lx(17, 10.2), 217.6, ['F', 'Bb', 'C', 'F'], { oom: .1, arp: .045, hat: .02 });                  // heat! and the snow melts
section(217.6, Lx(19, 9.6), ['Dm', 'C', 'Bb', 'A7'], { pad: .018, walk: .065, arp: .03, skip: .4, hat: .015 });   // E: the desert
section(Lx(19, 9.6), 256.6, ['Gm', 'Dm', 'Eb', 'A7'], { pad: .026 });                                   // the fog
section(256.6, 272.4, ['Bbmaj7', 'C', 'Am', 'Dm', 'Bbmaj7', 'C', 'F', 'F'], { pad: .02, walk: .05, arp: .03, skip: .3 });   // F: the recap
section(272.4, 282.2, ['F', 'Dm', 'Gm7', 'C7'], { oom: .09, arp: .035, skip: .35 });                    // G: the kitchen again

// ---------- the motif ----------
motif(Lx(21, 10.6), 0, .045); motif(Lx(22, 7.0) - BEAT, 0, .04);

// ---------- stingers on the picture ----------
xylo(.15, 72, .05); xylo(.3, 77, .05); xylo(.45, 81, .05); xylo(.6, 84, .05);                              // iris in
crunch(Lx(1, .3)); slide(Lx(1, .5), 72, 88, .4); timp(Lx(1, 1.05), 36, .2); roar(Lx(1, 1.05), 2.3, .09);  // the bite, the fire
boing(Lx(1, 1.6), 48); pop(Lx(1, 3.35), 70); whoosh(Lx(1, 3.3), .5, .04);                                 // drop the chili
slide(Lx(1, 3.8), 79, 86, .25, .03); crunch(Lx(1, 4.6));                                                   // grab the mint, chew
ice(Lx(1, 5.0)); crackle(Lx(1, 6.2), .5); shatter(Lx(1, 6.75)); boing(Lx(1, 6.9), 55, .07);               // freeze, crack, shatter
huh(Lx(1, 9.2));
timp(Lx(2, 1.0), 41, .16); slide(Lx(2, 1.0), 76, 91, .3, .035);                                            // 被骗了!
whoosh(Lx(2, 2.6), .4, .04); for (let i = 0; i < 4; i++) wood(Lx(2, 3.0) + i * BEAT / 2, .04, .8);        // the detective's magnifier
sizzle(Lx(2, 5.8), .7); shimmer(Lx(2, 6.9), [96, 100, 103], .025); pop(Lx(2, 8.4), 86); xylo(Lx(2, 9.0), 77, .04);
whoosh(24.7, 1.0, .07); bell(25.2, 89, .05);                                                               // dive into the lens
timp(Lx(3, 2.95), 38, .14); huh(Lx(3, 4.4)); countdown(32.6);                                             // stomp; quiz 1
blips(Lx(4, 2.0), 6, 77, 2, .08, .035); whoosh(Lx(4, 3.0), 1.2, .06); bell(Lx(4, 4.0), 89, .05);           // the endings light; dive
xylo(Lx(4, 10.6), 77, .05); xylo(Lx(4, 10.75), 81, .05);                                                   // TRP!
sizzle(Lx(5, 2.2), 2.0, .02); boing(Lx(5, 3.4), 43, .07); blips(Lx(5, 4.5), 12, 89, -1, .2, .028);       // heat; gate; ions in
whoosh(Lx(5, 8.6), .6, .04); slide(Lx(5, 10.35), 70, 94, .35, .05); timp(Lx(5, 10.4), 45, .14);            // the nerve fires; 烫!
slide(Lx(6, 1.0), 84, 74, 1.8, .025); wood(Lx(6, 2.9), .07, .9);                                           // capsaicin sneaks in; click
for (let i = 0; i < 8; i++) wood(Lx(6, 4.0) + i * .12, .05, .6 + .1 * (i % 2)); pop(Lx(6, 5.0), 60, .07);   // pry it open
blips(Lx(6, 5.1), 10, 89, -1, .2, .028); roar(Lx(6, 7.0), 2.2, .08); bell(Lx(6, 9.5), 96, .04);
whoosh(Lx(7, 0), .8, .05); shimmer(Lx(7, 3.1), [93, 96, 100, 103, 108], .022); boing(Lx(7, 4.5), 43, .06);
blips(Lx(7, 4.9), 12, 89, -1, .2, .026); for (let i = 0; i < 10; i++) xylo(Lx(7, 6.2) + i * .06, 84 + (i % 2) * 3, .025);   // brrr
wood(Lx(7, 8.8), .07, .9); blips(Lx(7, 9.2), 8, 89, -1, .2, .026);
xylo(Lx(7, 11.0), 81, .04); xylo(Lx(7, 11.15), 84, .04); xylo(Lx(7, 11.3), 89, .04); ice(Lx(7, 11.5));   // 凉心
xylo(Lx(8, .5), 77, .04); xylo(Lx(8, .65), 81, .04);
[[0, 65], [.25, 69], [.5, 72], [.75, 77]].forEach(([d, m]) => { clarinet(Lx(8, 3.3) + d, m, .3, .04); xylo(Lx(8, 3.3) + d, m + 12, .04); });   // the medal fanfare
bell(Lx(8, 3.9), 89, .05); shimmer(Lx(8, 6.8), [89, 93, 96, 101], .02);
crunch(Lx(8, 10.9)); slide(Lx(8, 11.0), 72, 92, .3, .04); roar(Lx(8, 11.3), 2.4, .09);
whoosh(101.1, .7, .06);
for (let j = 0; j < 4; j++) pop(Lx(9, .4 + j * .7) + .3, 80 + j * 2, .03);                                  // impulses climb
bell(Lx(9, 3.2), 84, .05); boing(Lx(9, 6.6), 55, .06); boing(Lx(9, 8.6), 62, .05); bell(Lx(9, 9.4), 96, .045);
ice(Lx(9, 11.8)); for (let i = 0; i < 14; i++) xylo(Lx(9, 12.0) + i * .07, 81 + (i % 2) * 3, .02);
huh(Lx(10, .7)); shimmer(Lx(10, 1.9), [93, 96, 100], .02); slide(Lx(10, 1.9), 84, 70, .6, .03); countdown(124.1);
whoosh(127.6, .7, .06);
pop(Lx(11, .5), 84); slide(Lx(11, 4.1), 76, 64, .9, .03);                                                   // the lens; the vessel narrows
slide(Lx(11, 8.6), 67, 79, .8, .03); boing(Lx(11, 10.1), 48, .09); noiseBurst(Lx(11, 10.1), .4, .05, .5, .95);   // hair up; SPIKES
blips(Lx(12, .9), 8, 77, 2, .07, .03); pop(Lx(12, 5.2), 80, .06); slide(Lx(12, 6.2), 74, 58, 1.3, .035);     // the dream; pop; wilt
blips(Lx(12, 9.0), 6, 89, 1, .08, .03);                                                                      // bumps
pop(Lx(14, 0), 60, .06); slide(Lx(14, 0), 84, 64, .6, .03); timp(Lx(14, .7), 36, .12);                     // the stove slides in
for (let i = 0; i < 8; i++) xylo(Lx(14, .9 + i * .38) + 1.0, 84 + (i % 2) * 5, .03);                        // hormones drop in
whoosh(Lx(14, 6.6), .7, .05); timp(Lx(14, 7.3), 38, .18); roar(Lx(14, 7.3), 1.5, .07);                      // the log; whoomph
whoosh(Lx(14, 8.6), .9, .06);
for (let i = 0; i < 3; i++) tuba(Lx(15, .4) + i * 1.6, 33, 1.0, .06);                                        // zzz
blips(Lx(15, 3.9), 12, 84, 0, .14, .022); [0, .12].forEach(d => clarinet(Lx(15, 6.6) + d, 84, .1, .05)); boing(Lx(15, 6.65), 60, .06);   // NE; wake!
blips(Lx(15, 8.1), 8, 89, -2, .25, .03); pad(Lx(15, 10.4), 2, CH.Fmaj7.map(m => m + 12), .02);
whoosh(Lx(16, -.7), 1.0, .06);
blips(Lx(16, 1.0), 18, 72, 1, .14, .022);                                                                    // the pump throws protons up
for (let t = Lx(16, 4.3); t < Lx(17, 8.7); t += BEAT / 2) wood(t, .03, 1.3);                               // the rotor ratchets
[6.0, 7.6, 9.2].forEach(d => bell(Lx(16, d) + .3, 96, .035));                                                // ATP
pop(Lx(17, 2.2), 72, .06); boing(Lx(17, 2.3), 52, .05);                                                     // the back door appears
for (let i = 0; i < 12; i++) clarinet(Lx(17, 5.6) + i * BEAT / 2, [50, 51, 52, 53, 52, 51, 50, 49][i % 8], BEAT * .2, .035);   // tiptoe
slide(Lx(17, 8.6), 72, 55, .4, .04); buzzer(Lx(17, 8.85));                                                   // the stall; no ATP
roar(Lx(17, 10.3), 2.2, .07); CH.F.forEach((m, i) => clarinet(Lx(17, 10.4) + i * .02, m + 12, 1.4, .025));
whoosh(211.6, .6, .05); boing(212.1, 60, .05); [0, .2, .4].forEach((d, i) => xylo(212.4 + d, [77, 81, 84][i], .045));
whoosh(217.3, .7, .06);
slide(Lx(18, 0), 74, 88, .3, .04); kettle(Lx(18, 1.2), 1.8, .025);                                         // hot! the kettle whistles
pop(Lx(18, 2.0), 84); slide(Lx(18, 2.6), 64, 76, .9, .03);                                                   // the lens; the vessel widens
for (let i = 0; i < 8; i++) pop(Lx(18, 7.2) + i * .25, 60 + (i % 3) * 4, .03);                              // the gland bubbles
for (let t = Lx(18, 9.3); t < Lx(19, 1.2); t += BEAT / 2) { noiseBurst(t, .06, .04, .4, .9); }             // the sprinkler
blips(Lx(19, 1.4), 8, 77, 2, .3, .025); pop(Lx(19, 5.3), 55, .06); pop(Lx(19, 7.4), 86, .06); blips(Lx(19, 7.45), 12, 84, 1, .05, .025);
huh(Lx(19, 10.0)); pad(Lx(19, 9.7), 3, [62, 67, 70], .015); countdown(243.0);
for (let i = 0; i < 6; i++) xylo(Lx(20, 2.9) + i * .25, 96 - i, .02);
sadTrombone(Lx(20, 4.3));
whoosh(256.3, .7, .06);
[1.3, 3.2, 5.4, 8.0].forEach((d, i) => { pop(Lx(21, d), 76 + i * 2, .05); xylo(Lx(21, d) + .05, [77, 81, 84, 89][i], .04); });
[2.6, 4.7, 7.4, 9.4].forEach(d => whoosh(Lx(21, d), .4, .025)); bell(Lx(21, 10.3), 89, .05);
for (let i = 0; i < 8; i++) xylo(Lx(21, 10.6) + i * .4 + 3.2 * Math.floor(i / 8), [77, 81, 84, 89][i % 4], .02);
whoosh(272.1, .7, .06);
crunch(Lx(22, .6)); roar(Lx(22, 2.3), 1.1, .08); noiseBurst(Lx(22, 3.3), .4, .04, .3, .7); bell(Lx(22, 6.6), 96, .045);
crunch(282.4); slide(283.0, 70, 96, .45, .05); timp(283.4, 33, .25); roar(283.4, 1.6, .12);              // the gag: KA-BOOM
slide(283.5, 79, 98, .8, .04); slide(285.25, 98, 67, .65, .045); timp(285.9, 36, .22); noiseBurst(285.9, .4, .08, .1, .5); boing(285.95, 45, .1);
bell(286.6, 96, .04);
// shave and a haircut, two bits (F C C D C · E F), under the iris
[[0, 77, .45], [.5, 72, .2], [.75, 72, .2], [1, 74, .45], [1.5, 72, .45], [2.5, 76, .45], [3, 77, .8]].forEach(([b, m, d]) => { clarinet(287.0 + b * BEAT, m, d * BEAT * 1.6, .05); xylo(287.0 + b * BEAT, m + 12, .045); if (b === 2.5 || b === 3) { tuba(287.0 + b * BEAT, b === 3 ? 41 : 48, BEAT * .5, .1); } });
CH.F.forEach((m, i) => piano(287.0 + 3 * BEAT + i * .01, m + 12, .04, (i - 1.5) * .3, 1.2));

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .8; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/thermo_vo.wav');
const vl = verb(Lc, 0), vr = verb(Rc, 29);
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const a = Math.abs(vo[n] || 0); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00003);
  const t = n / SR, fade = Math.min(1, t / .6) * Math.min(1, (DUR - t) / .5), g = fade * (1 - .5 * duck);
  Lc[n] = (Lc[n] + vl[n] * .28) * g; Rc[n] = (Rc[n] + vr[n] * .28) * g; peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n]));
}
function writeWav(path, l, r, gain) {
  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(Math.tanh(l(n) * gain) * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(Math.tanh(r(n) * gain) * 32767), 46 + n * 4); }
  writeFileSync(path, buf);
}
const MUSIC = .22 / peak;
writeWav('assets/thermo_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/thermo_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
console.log('wrote assets/thermo_bgm.wav and assets/thermo_mix.wav');

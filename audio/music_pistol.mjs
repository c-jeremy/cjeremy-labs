// audio/music_pistol.mjs: the score for "Pip讲枪虾" (src/scenes/pistol.js), synthesised from scratch.
//   node tools/make.mjs pistol vo && node tools/make.mjs pistol music   → assets/pistol_bgm.wav and assets/pistol_mix.wav
// A spaghetti-Western showdown, because it's a pistol: a whistled theme, a twangy baritone guitar, castanets and
// coconut-shell hooves, a soft trumpet for the reveals, a harmonica for the recap motif, and the reef's crackle (it
// sounds like frying bacon) as a bed under the reef shots. Plus a box of cartoon effects, one for every gag: the SNAP (a
// gunshot crack, a low boom, a ricochet), ratchet clicks for the cocking, the latch, a water squirt, record scratch,
// rewind, sonar pings, a wrong-answer buzzer, glass smash, slide whistle, bonk, boing, tweeting stars, bloops, gulp, zip,
// a projector, a pen. D minor, 92 bpm = PROJECT.bpm. Each section follows a voice line (times read from
// videos/pistol.json, like the scene's L(i, d)); the music goes quiet before every snap (the showdown), cuts dead on the
// hot open's record scratch, ducks under the voice and breathes up in the pauses. The engine, the reverb, the ducking
// and the streamed WAV writing are zinc's (audio/music_zinc.mjs).
import { readFileSync, openSync, writeSync, closeSync } from 'node:fs';

const MAN = JSON.parse(readFileSync('videos/pistol.json', 'utf8')), ST = MAN.voice.starts, L = (i, d = 0) => ST[i - 1] + d;
const SR = 44100, DUR = MAN.duration, N = Math.round(SR * DUR), BEAT = 60 / MAN.bpm, BAR = 4 * BEAT, TAU = Math.PI * 2;
const Lc = new Float32Array(N), Rc = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 43; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); Lc[i0 + i] += v * gl; Rc[i0 + i] += v * gr; }
}

// ---------- instruments ----------
function guitar(t, m, v = .04, pan = 0, len = 1.8, trem = 0) {     // a twangy baritone guitar: Karplus–Strong, bright, a little drive; trem = amp tremolo
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); for (let i = 0; i < P; i++) buf[i] = rnd() * 2 - 1;
  let i = 0, prev = 0; add(t, len, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = .996 * .5 * (a + b); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .7;
    return v * Math.tanh(1.8 * prev) * Math.min(1, tt / .002) * Math.exp(-tt * 1.1) * (1 - trem * .5 * (1 + Math.sin(TAU * 6.5 * tt))); });
}
const strum = (t, ms, v = .03, gap = .018) => ms.forEach((m, j) => guitar(t + j * gap, m, v * (1 - j * .08), (j / (ms.length - 1 || 1)) - .5, 2.2));
function whistleM(t, m, len, v = .04, pan = .15) {                  // the whistled theme: a scoop into the note, vibrato that blooms, a little breath
  const f = hz(m); let ph = 0, hp = 0, last = 0;
  add(t, len + .08, pan, tt => { const sc = Math.pow(2, -.7 * Math.exp(-tt / .03) / 12), vib = Math.pow(2, .28 * Math.min(1, tt / .35) * Math.sin(TAU * 5.6 * tt) / 12);
    ph += TAU * f * sc * vib / SR; const x = rnd() * 2 - 1; hp = .6 * hp + x - last; last = x;
    return v * Math.min(1, tt / .04) * (tt > len ? Math.exp(-(tt - len) / .03) : 1) * (Math.sin(ph) + .05 * hp); });
}
function trumpet(t, m, len, v = .03, pan = -.15) {                  // a soft trumpet: it brightens as it blows; late vibrato
  const f = hz(m); let ph = 0;
  add(t, len + .25, pan, tt => { ph += TAU * f * (1 + .004 * Math.sin(TAU * 5.5 * tt) * Math.min(1, tt / .5)) / SR;
    const a = Math.min(1, tt / .05) * (tt > len ? Math.exp(-(tt - len) / .07) : 1), br = .3 + .55 * Math.min(1, tt / .12);
    let s = 0, g = 1; for (let k = 1; k <= 8; k++) { s += Math.sin(ph * k) * g / k; g *= br; } return v * a * s; });
}
function harmonica(t, m, len, v = .035, pan = 0) {                  // a harmonica: reedy, a scoop, the cupped hand's wah, a breath
  const f = hz(m); let ph = 0, lp = 0;
  add(t, len + .1, pan, tt => { ph += TAU * f * Math.pow(2, -.5 * Math.exp(-tt / .05) / 12) / SR;
    const s = Math.sin(ph) + .55 * Math.sin(2 * ph) + .5 * Math.sin(3 * ph) + .25 * Math.sin(4 * ph) + .18 * Math.sin(5 * ph);
    lp += ((rnd() * 2 - 1) - lp) * .3;
    return v * Math.min(1, tt / .03) * (tt > len ? Math.exp(-(tt - len) / .05) : 1) * (.75 + .25 * Math.sin(TAU * 4.5 * tt)) * (s * .5 + .04 * lp); });
}
function pizz(t, m, v = .05, pan = 0) {                              // a pizzicato string: Karplus–Strong, short and round
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); for (let i = 0; i < P; i++) buf[i] = rnd() * 2 - 1;
  let i = 0, prev = 0; add(t, .55, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = .985 * .5 * (a + b); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .35; return v * prev * Math.min(1, tt / .002) * Math.exp(-tt * 5); });
}
const musicBox = (t, m, v = .04, pan = 0) => { const f = hz(m); add(t, 1.6, pan, tt => v * Math.min(1, tt / .001) * (Math.sin(TAU * f * tt) * Math.exp(-tt / .8) + .4 * Math.sin(TAU * f * 5.4 * tt) * Math.exp(-tt / .05) + .2 * Math.sin(TAU * f * 3 * tt) * Math.exp(-tt / .3))); };
function pad(t, len, ms, v = .01) {                                 // a warm string pad (the Western choir's "aah" in the reveals): detuned pairs, slow swell
  ms.forEach((m, j) => { for (const dt of [-.06, .06]) { const f = hz(m) * (1 + dt / 100 * 12), ph = rnd() * TAU;
    add(t, len + 1.4, (j / (ms.length - 1 || 1)) - .5, tt => { const a = Math.min(1, tt / 1.0) * (tt > len ? Math.exp(-(tt - len) / .8) : 1), vib = 1 + .003 * Math.sin(TAU * 5 * tt + ph);
      let s = 0; for (let k = 1; k <= 4; k++) s += Math.sin(TAU * f * k * vib * tt + ph * k) / (k * k); return v * a * s; }); } });
}
const bass = (t, m, v = .11, len = BEAT * 1.4) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .008) * Math.exp(-tt / .8) * (tt > len ? Math.exp(-(tt - len) / .08) : 1);
  return v * e * (Math.sin(TAU * f * tt) + .3 * Math.sin(TAU * 2 * f * tt) * Math.exp(-tt * 6)); }); };
const castanet = (t, v = .03, pan = .35) => { for (const d of [0, .016]) add(t + d, .03, pan, tt => v * (d ? .7 : 1) * (Math.sin(TAU * 3200 * tt) * .6 + (rnd() * 2 - 1) * .6) * Math.exp(-tt * 170)); };
const castRoll = (t, n = 5, v = .03) => { for (let i = 0; i < n; i++) castanet(t + i * .055, v * (.6 + .4 * i / n)); };
const clop = (t, v = .03, hi = 0) => { const f = hi ? 820 : 590; add(t, .07, hi ? .3 : -.3, tt => v * (Math.sin(TAU * f * tt) + .4 * Math.sin(TAU * f * 2.7 * tt)) * Math.exp(-tt * 65)); };
function bacon(t0, t1, rate, v = .02) {                              // the reef's crackle, as frying bacon: random clicks, a few louder pops
  const n = Math.floor((t1 - t0) * rate);
  for (let i = 0; i < n; i++) { const at = t0 + (t1 - t0) * hash(i * 1.71 + t0), a = v * (.25 + .75 * Math.pow(hash(i * 2.3 + 7), 3)), pan = (hash(i + 11) - .5) * 1.6, d = 250 + 400 * hash(i + 3);
    add(at, .02, pan, tt => a * (rnd() * 2 - 1) * Math.exp(-tt * d)); }
}
// cartoon effects (from audio/music_zinc.mjs) and new ones for this film
function noiseBurst(t, len, v, c0, c1 = c0, pan = 0) { let lp = 0; add(t, len, pan, tt => { const k = tt / len; lp += ((rnd() * 2 - 1) - lp) * (c0 + (c1 - c0) * k); return v * lp * Math.sin(Math.PI * Math.min(1, k * 4)) * (1 - k); }); }
function whoosh(t, len, v = .06) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
const pop = (t, v = .08, f0 = 900) => add(t, .12, 0, tt => v * Math.sin(TAU * (f0 - 5000 * tt) * tt) * Math.exp(-tt * 40));
const boing = (t, v = .06, m = 55) => { const f = hz(m); add(t, .7, .1, tt => v * Math.sin(TAU * f * tt * (1 + .35 * Math.sin(TAU * 7 * tt) * Math.exp(-tt * 3))) * Math.exp(-tt * 4)); };
function slide(t, m0, m1, len, v = .05) { let ph = 0; add(t, len + .05, .2, tt => { const f = hz(m0 + (m1 - m0) * Math.min(1, tt / len)); ph += TAU * f / SR; return v * Math.sin(ph) * Math.min(1, tt / .02) * (tt > len ? Math.exp(-(tt - len) / .03) : 1); }); }
function boom(t, v = .2) { let lp = 0; add(t, 1.6, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * .04; return v * (Math.sin(TAU * (45 + 50 * Math.exp(-tt * 6)) * tt) * Math.exp(-tt * 2.2) + 2.2 * lp * Math.exp(-tt * 3)); }); }
function clang(t, v = .07, f = 330) { add(t, 2.0, 0, tt => v * Math.exp(-tt * 1.6) * (Math.sin(TAU * f * tt) + .7 * Math.sin(TAU * f * 2.41 * tt) + .5 * Math.sin(TAU * f * 3.97 * tt) + .3 * Math.sin(TAU * f * 5.43 * tt))); }
const tick = (t, v = .04, pan = .3) => add(t, .05, pan, tt => v * Math.sin(TAU * 2400 * tt) * Math.exp(-tt * 90));
const knock = (t, v = .1) => add(t, .2, -.1, tt => v * Math.sin(TAU * (180 + 80 * Math.exp(-tt * 40)) * tt) * Math.exp(-tt * 25));
const crunch = (t, v = .07) => { for (let i = 0; i < 3; i++) noiseBurst(t + i * .025, .06, v * (1 - i * .25), .7, .3, (i - 1) * .2); };
const sizzle = (t, len, v = .03) => { let hp = 0, last = 0; add(t, len, .1, tt => { const x = rnd() * 2 - 1; hp = .3 * hp + x - last; last = x; return v * hp * Math.min(1, tt / .05) * Math.exp(-tt / (len * .5)) * (.6 + .4 * rnd()); }); };
const thwack = (t, v = .09) => { noiseBurst(t, .08, v, .6, .2); knock(t, v * .9); };
function scratch(t, v = .08) { let ph = 0, lp = 0; add(t, .45, 0, tt => { const sp = tt < .2 ? 1 - tt / .2 * 1.8 : -.8 + (tt - .2) / .25 * 1.6; ph += TAU * 180 * sp / SR; lp += ((rnd() * 2 - 1) - lp) * .5; return v * (Math.sin(ph * 3) * .6 + lp * .5) * Math.min(1, tt / .01) * Math.exp(-tt * 3); }); }
function rewind(t, len, v = .04) { add(t, len, 0, tt => { const k = tt / len, sp = 1 + 5 * Math.sin(Math.PI * k); let s = 0; for (const m of [74, 77, 81]) s += Math.sin(TAU * hz(m) * sp * tt * (1 + .03 * Math.sin(TAU * 18 * tt))); return v * s * Math.sin(Math.PI * k) * (.7 + .3 * Math.sin(TAU * 40 * tt)); }); }
const corkPop = (t, v = .1) => { pop(t, v, 1400); noiseBurst(t, .05, v * .5, .8); };
const ding = (t, m = 93, v = .04) => { const f = hz(m); add(t, 1.4, .2, tt => v * Math.min(1, tt / .002) * Math.exp(-tt * 2.2) * (Math.sin(TAU * f * tt) + .4 * Math.sin(TAU * f * 2.76 * tt) * Math.exp(-tt * 4))); };   // a triangle
const whirr = (t, len, v = .03) => { let ph = 0; add(t, len, 0, tt => { const k = tt / len, f = 80 + 260 * Math.sin(Math.PI * k); ph += TAU * f / SR; return v * Math.sign(Math.sin(ph)) * Math.sin(Math.PI * k) * .6; }); };
const wahwah = (t, v = .04) => { [62, 61, 60, 59].forEach((m, i) => { const f = hz(m); let lp = 0; add(t + i * .45, i === 3 ? 1.0 : .42, 0, tt => { const s = 2 * ((f * tt) % 1) - 1, c = .02 + .1 * (.5 + .5 * Math.sin(TAU * (i === 3 ? 5 : 2.5) * tt)); lp += (s - lp) * c; return v * lp * 2.5 * Math.min(1, tt / .03); }); }); };
const squeak = (t, v = .03) => slide(t, 88, 96, .08, v);
function gliss(t, ms, step = .06, v = .04, inst = musicBox) { ms.forEach((m, i) => inst(t + i * step, m, v, (i / ms.length) - .5)); }
const snip = (t, v = .05) => { tick(t, v, 0); noiseBurst(t, .04, v * .7, .9); tick(t + .03, v * .7, 0); };
const zipS = (t, v = .05) => { slide(t, 70, 96, .16, v); noiseBurst(t, .18, v * .5, .5, .9); };
const squish = (t, v = .06) => { noiseBurst(t, .25, v, .1, .03); slide(t, 50, 43, .25, v * .6); };
const gulp = (t, v = .05) => { slide(t, 60, 48, .18, v); knock(t + .18, v * .6); };
const chatter = (t, len, v = .03) => { for (let k = 0; k < len * 16; k++) tick(t + k / 16, v * (.6 + .4 * hash(k)), (k % 2) ? .2 : -.2); };
const creak = (t, len, v = .025) => { let ph = 0; add(t, len, -.2, tt => { const f = 120 + 60 * Math.sin(TAU * .7 * tt); ph += TAU * f / SR; return v * (Math.sign(Math.sin(ph)) * .5 + (rnd() - .5) * .4) * Math.sin(Math.PI * tt / len); }); };
const twang = (t, v = .05) => { const f = hz(45); add(t, 1.0, 0, tt => v * Math.sin(TAU * f * tt * (1 + .08 * Math.exp(-tt * 4) * Math.sin(TAU * 30 * tt))) * Math.exp(-tt * 3) * Math.tanh(4 * Math.sin(TAU * f * 2 * tt))); };
const bonk = (t, v = .1) => { knock(t, v); boing(t + .02, v * .5, 64); };
const tiptoe = (t, m, v = .04) => { pizz(t, m, v, -.2); pizz(t + .09, m + 7, v * .6, .2); };
const tapeRip = (t, v = .04) => noiseBurst(t, .5, v, .9, .4);
function ricochet(t, v = .03) { let ph = 0; add(t, .7, .45, tt => { const k = tt / .7, f = 3400 - 2300 * k + 120 * Math.sin(TAU * 11 * tt); ph += TAU * f / SR; return v * Math.sin(ph) * Math.min(1, tt / .01) * (1 - k) * (1 - k); }); }
function gunshot(t, v = .12, ric = true) {                           // the SNAP: a gunshot crack, a low boom, the reef's echo; a ricochet whining off
  add(t, .09, 0, tt => v * 1.4 * (rnd() * 2 - 1) * Math.exp(-tt * 70));
  knock(t, v * .8); boom(t, v * .9); noiseBurst(t + .05, .5, v * .3, .2, .05);
  if (ric) ricochet(t + .12, v * .25);
}
const ratchet = (t, v = .05) => { tick(t, v, -.1); knock(t + .005, v * .6); add(t, .04, -.1, tt => v * .5 * Math.sin(TAU * 4300 * tt) * Math.exp(-tt * 120)); };   // cocking the hammer
const latchClick = (t, v = .09) => { ratchet(t, v); clang(t, v * .2, 1500); };
const clunk = (t, v = .06) => { knock(t, v); add(t, .08, 0, tt => v * .5 * Math.sin(TAU * 900 * tt) * Math.exp(-tt * 50)); };   // a ratchet click, slowed down
function squirt(t, len, v = .05, c = .35) {                         // a water jet: hissing noise with a gurgle (a low c sounds slowed down)
  let lp = 0, bp = 0; add(t, len, -.1, tt => { const k = tt / len; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .25;
    return v * (lp - bp) * 3 * Math.min(1, tt / .02) * Math.pow(1 - k, 1.5) * (.75 + .25 * Math.sin(TAU * 31 * tt)); });
}
function hiss(t, len, v = .012) { let lp = 0, bp = 0; add(t, len, -.2, tt => { lp += ((rnd() * 2 - 1) - lp) * .5; bp += (lp - bp) * .3; return v * (lp - bp) * 3 * Math.min(1, tt / .5) * Math.min(1, (len - tt) / .6); }); }
const bloop = (t, v = .04, f0 = 380, len = .09) => { let ph = 0; add(t, len + .02, (hash(t * 7) - .5) * .8, tt => { ph += TAU * f0 * (1 + 2.2 * Math.min(1, tt / len)) / SR; return v * Math.sin(ph) * Math.sin(Math.PI * Math.min(1, tt / (len + .02))); }); };
const bubbling = (t, len, rate = 6, v = .025) => { for (let i = 0; i < len * rate; i++) bloop(t + len * hash(i * 3.1 + t), v * (.5 + .5 * hash(i + 4)), 300 + 500 * hash(i + 9)); };
function ping(t, v = .05) {                                         // a submarine's sonar ping, broken up by the crackle
  add(t, 2.2, -.4, tt => { const g = tt < .25 || hash(Math.floor(tt * 26) + t) > .3 ? 1 : .15; return v * g * Math.min(1, tt / .01) * Math.exp(-tt * 1.8) * (Math.sin(TAU * 1180 * tt) + .2 * Math.sin(TAU * 2360 * tt)); });
}
const buzzer = (t, v = .04) => { for (const d of [0, .24]) add(t + d, .18, 0, tt => v * Math.tanh(3 * Math.sin(TAU * 104 * tt)) * Math.min(1, tt / .01) * (tt > .15 ? (.18 - tt) / .03 : 1)); };   // nope
function glassSmash(t, v = .07) { noiseBurst(t, .35, v, .9, .6); for (let i = 0; i < 16; i++) { const at = t + .7 * Math.pow(hash(i + 31), 1.5), f = 2800 + 4000 * hash(i + 5), a = v * .5 * (1 - i / 20); add(at, .25, (hash(i) - .5) * 1.4, tt => a * Math.sin(TAU * f * tt) * Math.exp(-tt * 18)); } }
const clink = (t, v = .05) => { for (const f of [2700, 4100]) add(t, .6, .2, tt => v * Math.sin(TAU * f * tt) * Math.exp(-tt * 7)); knock(t, v * .4); };
const tweets = (t, n = 4, v = .025) => { for (let i = 0; i < n; i++) slide(t + i * .22, 96 + (i % 2) * 3, 101 + (i % 2) * 3, .06, v); };   // the dizzy stars
const thud = (t, v = .1) => { boom(t, v * .45); noiseBurst(t, .12, v * .6, .3, .1); };
const pat = (t, v = .025) => noiseBurst(t, .035, v, .5, .3, .15);
const scribble = (t, len, v = .012) => { let lp = 0; add(t, len, .3, tt => { lp += ((rnd() * 2 - 1) - lp) * .45; return v * lp * 2 * (.4 + .6 * Math.abs(Math.sin(TAU * 4.5 * tt + Math.sin(TAU * 1.3 * tt)))); }); };
const shing = (t, v = .03) => { gliss(t, [86, 90, 93, 98], .03, v, musicBox); noiseBurst(t, .3, v * .4, .9, .7); };   // the cream flash
function drone(t, len, m, v = .02) { const f = hz(m); add(t, len, 0, tt => v * Math.min(1, tt / .8) * Math.min(1, (len - tt) / .6) * (Math.sin(TAU * f * tt) + .5 * Math.sin(TAU * f * 1.5 * tt + Math.sin(TAU * .3 * tt)) + .25 * Math.sin(TAU * f * 2.01 * tt))); }
const heartbeat = (t, v = .06) => { for (const [d, g] of [[0, 1], [.22, .6]]) add(t + d, .3, 0, tt => v * g * Math.sin(TAU * (46 + 28 * Math.exp(-tt * 20)) * tt) * Math.exp(-tt * 12)); };
const swell = (t, len, v = .03) => { let lp = 0; add(t, len, 0, tt => { const k = tt / len; lp += ((rnd() * 2 - 1) - lp) * (.05 + .4 * k); return v * lp * 2 * k * k; }); };
function theremin(t, len, m0, m1, v = .02, wob = 1.5) { let ph = 0; add(t, len, -.2, tt => { const k = tt / len, m = m0 + (m1 - m0) * (.5 - .5 * Math.cos(Math.PI * k)) + wob * Math.sin(TAU * 1.3 * tt); ph += TAU * hz(m) / SR; return v * Math.sin(ph) * Math.min(1, tt / .15) * Math.min(1, (len - tt) / .2); }); }

// ---------- harmony ----------
const CH = { Dm: [50, 57, 62, 65], Dm7: [50, 57, 60, 65], Gm: [43, 55, 58, 62], Gm7: [43, 53, 58, 62], A7: [45, 55, 61, 64], A: [45, 57, 61, 64],
  Bb: [46, 53, 58, 62], C: [48, 55, 60, 64], F: [41, 53, 57, 60] };
const ROOT = { Dm: 38, Dm7: 38, Gm: 43, Gm7: 43, A7: 45, A: 45, Bb: 46, C: 48, F: 41 };
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    if (st.pad) pad(t, len, ch.slice(1), st.pad);
    if (st.trem) ch.slice(1, 3).forEach((m, j) => guitar(t, m, st.trem, j ? .3 : -.3, len, 1));
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) bass(tb, r, .1, BEAT * 3.4);
      if (st.bass === 'walk') bass(tb, r + [0, 3, 7, 10][b], .085, BEAT * .9);
      if (st.bass === 'tip') { if (b % 2 === 0) bass(tb, r + (b ? 7 : 0), .07, BEAT * .4); }
      if (st.bass === 'boom') { bass(tb, r + (b % 2 ? 7 : 0) - (b === 3 ? 12 : 0), .085, BEAT * .5); ch.slice(1, 3).forEach(m => guitar(tb + BEAT / 2, m, .012, .3, .25)); }   // boom-chick
      if (st.bass === 'gallop') { bass(tb, r, .08, BEAT * .3); guitar(tb + BEAT * .5, r + 12, .02, -.2, .2); guitar(tb + BEAT * .75, r + 12, .018, -.2, .2); }   // da-da-DUM
      if (st.cast) { castanet(tb + BEAT / 2, st.cast); if (b === 3 && bar % 2) castRoll(tb + BEAT * .25, 4, st.cast * .8); }
      if (st.clop) { clop(tb, st.clop, 0); clop(tb + BEAT * .5, st.clop * .8, 1); if (st.bass === 'gallop') clop(tb + BEAT * .75, st.clop * .7, 1); }
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2];
        for (let e = 0; e < 2; e++) { const i = b * 2 + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          (st.arp)(tb + e * BEAT / 2, m, (st.arpV ?? .04) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
// the whistled theme (in beats): D A, G F E D | D F A C Bb | A G F E F E C# | D
const THEME = [[0, 74, .5], [.5, 81, 1.5], [2, 79, .25], [2.25, 77, .25], [2.5, 76, .5], [3, 74, 1], [4, 74, .5], [4.5, 77, .5], [5, 81, .5], [5.5, 84, .5], [6, 82, 2],
  [8, 81, .5], [8.5, 79, .5], [9, 77, .5], [9.5, 76, .5], [10, 77, .75], [10.75, 76, .25], [11, 73, 1], [12, 74, 3]];
const theme = (t, from = 0, to = 16, v = .04) => THEME.forEach(([b, m, l]) => { if (b >= from && b < to) whistleM(t + (b - from) * BEAT, m, l * BEAT * .92, v); });
const motif = (t, tr = 0, v = .04) => THEME.slice(0, 6).forEach(([b, m, l]) => harmonica(t + b * BEAT, m - 12 + tr, l * BEAT * .9, v));   // the recap: its first bar, on harmonica

// ---------- times from the scene (src/scenes/pistol.js) ----------
const SNAP = 6.4, FREEZE = 9.2;
const B1 = { cock: L(6, .6), click: L(6, 2.6), fire: L(7, .55), rw: L(7, 4.6), slow0: L(7, 5.2), slow1: L(7, 6.6) };
const BANG = L(10, 5.7), C2 = { s0: L(11, 1.3), trace0: L(11, 5.4), f2T: L(11, 7.4), spikeT: L(11, 9.9) };
const D1 = { m0: L(12, 6.8), mc: L(12, 8.0), gl: L(13, 5.2) };
const SNAP1 = L(14, 4.4), SNAP2 = L(15, 5.8), TOUCH = L(15, 3.5);
const K1 = { pull: L(17, 6.4), snap: L(17, 10.4), nose: L(17, 13.4) };
const showdown = (t, len) => { guitar(t, 45, .04, 0, len + .2, 1); whistleM(t + .05, 81, len - .15, .02); };   // the hush before a snap: a trembling low A, one held whistle

// ---------- A1: the hot open; meet the shrimp ----------
// Pip grooves to the crackle; the sneak; the mic lowers; the antenna taps it; the showdown; SNAP; head over heels; deadpan; scratch
bacon(0, FREEZE, 16, .022);
section(0, 2.6, ['Dm'], { bass: 'boom', cast: .02, arp: guitar, arpV: .03, oct: -12, skip: .5 }); theme(.35, 0, 4, .045);
section(2.6, 4.7, ['Gm', 'A7'], { bass: 'tip', arp: pizz, arpV: .03, skip: .5 });
[3.0, 3.5, 4.0, 4.5].forEach((t, i) => tiptoe(t, [57, 60, 57, 62][i], .045));
slide(4.6, 79, 71, .9, .012); creak(4.6, .9, .012); [5.45, 5.7, 5.9].forEach(t => tick(t, .03));
showdown(5.0, 1.35); [5.85, 6.08, 6.24].forEach(t => ratchet(t, .045));
gunshot(SNAP, .13); boing(SNAP + .1, .05, 60);
slide(6.7, 72, 96, .3, .03); slide(7.0, 96, 62, .45, .03); thud(7.45, .08); boing(7.5, .03, 50); tweets(7.7, 5, .02);
for (let i = 0; i < 6; i++) tick(6.95 + i * .15, .02, -.3);
[62, 60, 57, 55, 50].forEach((m, i) => guitar(7.6 + i * .14, m, .035, -.1, i === 4 ? 1.6 : .5));
twang(8.55, .05); scratch(9.05, .1);
// L1 over the freeze: a held chord; the whistle meets the shrimp. L2: colour back; it walks out; the claws; the measure
pad(9.9, L(2) - 9.9, [57, 62, 65], .004); theme(L(1, 4.2), 0, 4, .025);
strum(L(2, -.05), CH.Dm, .03); bacon(L(2, -.1), L(3, -.9), 14, .018);
section(L(2, .2), L(3, -.9), ['Dm', 'Gm', 'A7', 'Dm'], { bass: 'boom', cast: .014, arp: guitar, arpV: .025, oct: -12, skip: .45 });
for (let i = 0; i < 8; i++) clop(L(2, .35 + i * .21), .03, i % 2);
guitar(L(2, 2.35), 86, .03, .3, .8); trumpet(L(2, 3.5), 69, .22, .025); trumpet(L(2, 3.75), 74, 1.0, .03); gliss(L(2, 3.6), [86, 90, 93], .06, .015);
{ const m0 = L(2, 5.5); slide(m0, 72, 84, .45, .02); whoosh(m0 + .9, .6, .03); slide(m0 + 1.6, 72, 84, .4, .02); ding(m0 + 2.1, 93, .04); }

// ---------- A2: the crackle, the sonar; the replay ----------
whoosh(L(3, -.9), 1.2, .03);
bacon(L(3, -.9), L(3, .4), 14, .02); bacon(L(3, .4), L(3, 2.0), 40, .03); bacon(L(3, 2.0), L(3, 5.0), 70, .035); bacon(L(3, 5.0), L(4, .1), 30, .022);
chatter(L(3, 1.8), 2.8, .018);
section(L(3, -.9), L(3, 5.0), ['Dm', 'Bb', 'Gm', 'A7'], { bass: 'walk', cast: .012, arp: guitar, arpV: .025, oct: -12, skip: .45 });
whoosh(L(3, 4.9), .7, .05); ping(L(3, 5.4), .05); ping(L(3, 6.8), .04); ping(L(3, 8.2), .035);
section(L(3, 5.6), L(4, 0), ['Dm7', 'Bb'], { pad: .006, bass: 'one' });
// L4: rewind; slow motion: the cocking clunks, the shut, the gap, ✗, the slow jet and bubble, ?
rewind(L(4, .1), .55, .04); drone(L(4, .6), L(5, -.45) - L(4, .6), 38, .018); for (let i = 0; i < 5; i++) heartbeat(L(4, .9 + i * 1.4), .05);
clunk(L(4, .92), .06); clunk(L(4, 1.28), .06); swell(L(4, 1.5), .9, .03); boom(L(4, 2.4), .08); noiseBurst(L(4, 2.4), .4, .05, .12, .04);
slide(L(4, 2.6), 74, 81, .3, .015); buzzer(L(4, 3.8), .035);
whoosh(L(4, 5.2), 1.6, .03); slide(L(4, 5.4), 55, 67, 1.2, .02); pop(L(4, 6.7), .03, 600); slide(L(4, 7.25), 67, 76, .22, .03);
shing(L(5, -.45), .03);

// ---------- B1: the gun ----------
section(L(5, -.1), L(6, -.4), ['Dm', 'Bb', 'Gm', 'A'], { bass: 'tip', cast: .012, arp: guitar, arpV: .025, oct: -12, skip: .5 });
whoosh(L(5, 1.2), .7, .03); ding(L(5, 1.7), 93, .03); ding(L(5, 4.7), 88, .03); pop(L(5, 5.5), .03, 1200);
// L6: the pole shoved up under the dactyl, cocking; CLICK; dusting off; the muscle and the spring wind up
section(L(6, -.4), L(6, 5.4), ['Dm', 'Gm', 'A7', 'Dm'], { bass: 'walk', cast: .014, arp: pizz, arpV: .028, skip: .4 });
creak(B1.cock, 2.0, .025); for (let k = 0; k < 5; k++) ratchet(B1.cock + .2 + k * .42, .04);
latchClick(B1.click, .08); whoosh(B1.click + .05, .6, .04); for (let i = 0; i < 3; i++) knock(B1.click + .75 + i * .12, .03 * (1 - i * .25));   // the pole flung away, landing off-screen
for (let i = 0; i < 8; i++) pat(L(6, 3.15 + i * .2), .02);
section(L(6, 5.4), L(7, -.3), ['Bb', 'A7'], { pad: .007, bass: 'one', trem: .02 });
creak(L(6, 5.4), 1.8, .02); slide(L(6, 6.6), 64, 52, 1.8, .012); creak(L(6, 6.6), 1.8, .02); boing(L(6, 8.4), .025, 48);
// L7: the poke; SNAP and the jet; Pip blasted back; deadpan; rewind; the slow replay
[57, 60, 62].forEach((m, i) => pizz(L(7, -.3 + i * .12), m, .03)); tick(L(7, .25), .04);
gunshot(B1.fire, .12, false); squirt(B1.fire, .9, .07);
whoosh(B1.fire + .12, .7, .04); slide(B1.fire + .15, 84, 60, .7, .03); thud(B1.fire + .87, .08); boing(B1.fire + .95, .03, 52); tweets(B1.fire + 1.2, 5, .02);
section(B1.fire + 1.2, L(7, 3.9), ['Dm', 'A7'], { bass: 'gallop', clop: .018, cast: .014 });
twang(L(7, 4.0), .035); rewind(B1.rw - .1, .55, .04); ratchet(B1.rw + .35, .05);
drone(B1.rw + .5, L(8, -1.2) - (B1.rw + .5), 38, .016); swell(B1.slow0, 1.4, .025); boom(B1.slow1, .07); clunk(B1.slow1, .06);
squirt(B1.slow0 + .8, 2.4, .05, .1); whoosh(B1.slow0 + .8, 2.2, .025);
whoosh(L(8, -1.15), .6, .045);

// ---------- C1: the bubble ----------
hiss(L(8, -.4), L(10, 1.0) - L(8, -.4), .012);
section(L(8, -.6), L(9, 0), ['Dm', 'C', 'Bb', 'A7'], { bass: 'walk', cast: .012, arp: guitar, arpV: .025, oct: -12, skip: .45 });
pop(L(8, 3.65), .04, 1100); slide(L(8, 4.2), 86, 58, 2.0, .025);
// L9: the mountain pot; back in the jet the water boils; the thermometer; huh?
section(L(9, 0), L(10, 0), ['Gm', 'Dm', 'Bb', 'A7'], { bass: 'tip', arp: pizz, arpV: .028, skip: .45, cast: .01 });
pop(L(9, .3), .04, 900); bubbling(L(9, .6), 3.6, 5, .02); ding(L(9, 2.0), 93, .03);
whoosh(L(9, 4.3), .5, .035); slide(L(9, 5.0), 50, 69, 3.2, .012); bubbling(L(9, 5.0), 3.2, 4, .015);
whoosh(L(9, 6.6), .7, .025); bloop(L(9, 7.05), .03, 500); tick(L(9, 7.3), .03); slide(L(9, 7.65), 67, 74, .25, .025);
// L10: the jar; smug; the squeeze; BANG, glass, bonk
section(L(10, 0), L(10, 3.6), ['Dm', 'Gm'], { bass: 'tip', arp: guitar, arpV: .025, oct: -12, skip: .45, cast: .012 });
clink(L(10, 1.0), .04); twang(L(10, 2.85), .03);
slide(L(10, 3.6), 58, 86, 2.1, .018); guitar(L(10, 3.6), 45, .03, 0, 2.1, 1); creak(L(10, 4.0), 1.7, .02); squeak(L(10, 4.4), .03);
gunshot(BANG, .12, false); glassSmash(BANG + .02, .06); bonk(BANG + .1, .08); tweets(BANG + .7, 5, .02);
section(BANG + 1.4, L(11, -1.0), ['Dm', 'A7'], { bass: 'one', arp: guitar, arpV: .022, oct: -12, skip: .6 });
shing(L(11, -1.25), .03);

// ---------- C2: 2000: the film and the trace ----------
section(L(11, -.9), C2.spikeT, ['Dm', 'Bb', 'Gm', 'A7'], { bass: 'walk', cast: .01, arp: guitar, arpV: .022, oct: -12, skip: .5 });
chatter(C2.s0, L(12, -1.2) - C2.s0, .006); whoosh(C2.s0, 1.5, .03); tapeRip(L(11, 3.0), .025);
scribble(C2.trace0, C2.spikeT - C2.trace0 + .8, .01); buzzer(C2.f2T, .035);
gunshot(C2.spikeT, .09, false); boing(C2.spikeT + .06, .04, 60); ding(C2.spikeT + .35, 93, .04); gliss(C2.spikeT + 1.2, [62, 65, 69, 74], .07, .025, guitar);
section(C2.spikeT + .5, L(12, -.9), ['Dm', 'Gm', 'A7', 'Dm'], { bass: 'gallop', clop: .015, cast: .014, arp: guitar, arpV: .022, oct: -12, skip: .5 });
shing(L(12, -1.25), .03);

// ---------- D1: hotter than the Sun; the flash nobody sees ----------
section(L(12, -.9), L(12, 5.4), ['Dm', 'Bb', 'Gm', 'A7'], { pad: .006, bass: 'one', arp: guitar, arpV: .02, oct: -12, skip: .6 });
slide(L(12, .4), 64, 50, 3.2, .012); sizzle(L(12, 2.2), 1.5, .02); pop(L(12, 3.6), .04, 700);
pop(L(12, 3.65), .03, 1200); slide(L(12, 3.8), 60, 98, .8, .03); corkPop(L(12, 4.55), .07); boing(L(12, 4.6), .03, 70);
trumpet(L(12, 5.4), 69, .3, .025); trumpet(L(12, 5.7), 74, .3, .025); trumpet(L(12, 6.0), 77, 1.2, .03); pad(L(12, 5.4), 2.0, [62, 65, 69, 74], .008); whoosh(L(12, 7.4), .6, .03);
// the marshmallow: Pip swims in; the collapse toasts and chars it, smoking; wah-wah; three crunchy bites; the stick flung
whoosh(D1.m0 - .8, .7, .025); slide(D1.m0 + .3, 72, 60, .9, .012); squeak(D1.mc - .3, .03); pop(D1.mc, .05, 800); sizzle(D1.mc, .4, .025); boom(D1.mc, .04);
sizzle(D1.mc + .1, 1.4, .015); wahwah(D1.mc + .9, .025); slide(L(12, 9.15), 67, 72, .35, .012); [9.6, 9.9, 10.2].forEach(d => crunch(L(12, d), .045));
whoosh(L(13, .6), .5, .03); knock(L(13, 1.3), .02);   // the bare stick flung away
section(L(12, 5.4), L(13, -.6), ['F', 'C', 'Dm', 'A7'], { bass: 'boom', cast: .012, arp: guitar, arpV: .02, oct: -12, skip: .5 });
// L13: two flashes; the shades go on (a cool riff); the glint nobody sees; blank
section(L(13, -.6), L(14, -.9), ['Dm7', 'Gm7', 'Bb', 'A'], { pad: .006, bass: 'one', arp: guitar, arpV: .02, oct: -12, skip: .6 });
for (const d of [.6, 2.6]) { shing(L(13, d), .03); pop(L(13, d), .03, 1500); }
guitar(L(13, 4.0), 50, .04); guitar(L(13, 4.2), 53, .035); guitar(L(13, 4.4), 55, .04, 0, 1.6, 1);
ding(D1.gl, 98, .008); guitar(D1.gl + .55, 38, .04, 0, 1.2); slide(D1.gl + .6, 79, 84, .3, .015);
whoosh(L(14, -1.2), .6, .045);

// ---------- E1: the hunt ----------
bacon(L(14, -.9), L(16, -.9), 11, .016);
section(L(14, -.9), L(14, 3.4), ['Dm', 'Gm', 'Dm', 'A7'], { bass: 'gallop', clop: .016, cast: .012, arp: guitar, arpV: .022, oct: -12, skip: .5 });
bubbling(L(14, -.5), 2.5, 3, .012); for (let i = 0; i < 4; i++) tiptoe(L(14, 1.0 + i * .6), [57, 60, 57, 62][i], .03);
showdown(L(14, 3.4), 1.0); ratchet(SNAP1 - .55, .04); ratchet(SNAP1 - .3, .045);
gunshot(SNAP1, .12); bonk(SNAP1 + .25, .05); whirr(SNAP1 + .15, 1.6, .02); slide(SNAP1 + .2, 84, 62, 1.5, .02); squish(SNAP1 + 2.3, .03); tweets(SNAP1 + 2.3, 5, .018);
section(SNAP1 + 1.2, L(15, -.2), ['Dm', 'A7'], { bass: 'one', arp: guitar, arpV: .02, oct: -12, skip: .6 });
// L15: dim eyes; the antennae feel about; tiptoe; touched: gulp, zip; the second fish; SNAP; the meal; Pip peeks, gulps
section(L(15, -.2), SNAP2 - 1.0, ['Gm', 'Dm', 'A7', 'Dm'], { bass: 'tip', arp: pizz, arpV: .026, skip: .45, cast: .01 });
theremin(L(15, .3), 1.5, 62, 60, .012, 1.2); theremin(L(15, 1.9), 2.1, 74, 79, .012, 2.5);
[2.28, 2.63, 2.98, 3.33].forEach((d, i) => tiptoe(L(15, d), [57, 60, 57, 62][i], .03));
gulp(TOUCH, .05); zipS(TOUCH + .5, .05); bubbling(L(15, 4.2), 1.5, 3, .012);
showdown(SNAP2 - 1.0, 1.0); ratchet(SNAP2 - .55, .04); ratchet(SNAP2 - .3, .045);
gunshot(SNAP2, .11); bonk(SNAP2 + .25, .04);
snip(L(15, 6.85), .04); for (let i = 0; i < 6; i++) crunch(L(15, 6.9 + i * .42), .035); pop(L(15, 7.0), .025, 700); gulp(L(15, 8.6), .045);
section(SNAP2 + .8, L(16, -.9), ['Dm', 'Bb', 'A7', 'Dm'], { bass: 'boom', cast: .012, arp: guitar, arpV: .02, oct: -12, skip: .5 });
shing(L(16, -1.25), .03);

// ---------- R1: recap: the harmonica motif over a pad; the panels ----------
section(L(16, -.9), L(17, -.9), ['Dm', 'Gm', 'Bb', 'A7'], { pad: .007, bass: 'one', arp: guitar, arpV: .018, oct: -12, skip: .6 });
motif(L(16, .2), 0, .035); motif(L(16, 4.2), 5, .03); motif(L(16, 8.2), 0, .035); motif(L(17, -3.5), 0, .045);
{ const T = [L(16, 1.1), L(16, 2.3), L(16, 4.5), L(16, 7.9)]; T.forEach((t, i) => pop(t, .035, 900 + 150 * i));
  for (let t = T[0]; t < L(17, -.9); t += 1.25) tick(t, .015); squirt(T[1] + .1, .5, .025); }
slide(L(16, 6.0), 55, 67, 1.2, .012); slide(L(16, 8.0), 72, 55, 1.0, .012); gunshot(L(16, 9.2), .05, false); shing(L(16, 10.3), .02); ding(L(16, 11.0), 86, .025);
shing(L(17, -1.25), .03);

// ---------- K1: it was the bubble; Pip, ready, records the snap; the bubble on the nose; the last cadence ----------
bacon(L(17, -.9), DUR, 12, .015);
section(L(17, -.9), K1.pull, ['Dm', 'Bb', 'Gm', 'A7'], { pad: .007, bass: 'one', arp: guitar, arpV: .02, oct: -12, skip: .55 });
buzzer(L(17, 2.45), .03); slide(L(17, 3.8), 55, 67, 1.4, .012); slide(L(17, 5.2), 67, 50, .6, .015); pop(L(17, 5.8), .05, 700); boom(L(17, 5.8), .04);
whoosh(K1.pull, 1.2, .04); trumpet(K1.pull + .3, 69, .3, .03); trumpet(K1.pull + .65, 74, .3, .03); trumpet(K1.pull + 1.0, 77, 1.4, .035); strum(K1.pull + 1.0, CH.Dm, .025);
section(K1.pull + 1.2, K1.snap - 1.0, ['Dm', 'Gm'], { bass: 'gallop', clop: .016, cast: .014 });
showdown(K1.snap - 1.0, 1.0); ratchet(K1.snap - .55, .04); ratchet(K1.snap - .3, .045); squeak(K1.snap - .45, .025); slide(K1.snap - .45, 76, 64, .15, .02);   // Pip ducks behind the wall
gunshot(K1.snap, .12); thwack(K1.snap + .15, .06); noiseBurst(K1.snap + .17, .4, .03, .3, .1); ding(K1.snap + .12, 93, .035); slide(K1.snap + .5, 74, 93, .25, .03);
noiseBurst(K1.snap + 1.45, .05, .04, .5);                           // the playback: the recorded crack, then Pip grooves to it
section(K1.snap + 1.4, K1.nose, ['Dm'], { bass: 'gallop', clop: .02, cast: .018, arp: guitar, arpV: .025, oct: -12, skip: .3 });
slide(K1.nose - 1.6, 79, 86, 1.5, .008); slide(K1.nose - 1.0, 67, 74, .3, .015); pop(K1.nose, .07, 1400); boing(K1.nose + .05, .05, 62);
{ const t = K1.nose + .9; [[0, 81, .25], [.3, 79, .25], [.6, 76, .25], [.9, 74, 2.0]].forEach(([d, m, l]) => whistleM(t + d, m, l, d < .9 ? .04 : .045));
  strum(t, CH.A7, .025); strum(t + .9, CH.Dm, .03); bass(t + .9, 38, .1, 2.0); castRoll(t + .65, 5, .03); twang(t + .9, .04); pad(t + .9, DUR - t - .9, [57, 62, 65], .01); }
ding(K1.nose + 2.1, 98, .03); gliss(K1.nose + 2.15, [93, 98, 102], .05, .015);

// ---------- reverb, ducking, the mix: streamed in place (from audio/music_zinc.mjs) ----------
function readVo(p) { const b = readFileSync(p); let o = 12; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') return new Int16Array(b.buffer, b.byteOffset + o + 8, n / 2); o += 8 + n; } }
const vo = readVo('assets/pistol_vo.wav'), voAt = n => n < vo.length ? vo[n] / 32768 : 0;
function verbState(off) { return { combs: [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 })), aps: [589 + off, 467 + off].map(d => ({ d, b: new Float32Array(d), i: 0 })) }; }
function verbStep(V, x) { let y = 0; for (const c of V.combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x + c.s * .83; c.i = (c.i + 1) % c.d; y += v; } y /= 4;
  for (const a of V.aps) { const v = a.b[a.i], u = y + v * .5; a.b[a.i] = u; y = v - u * .5; a.i = (a.i + 1) % a.d; } return y; }
const VL = verbState(0), VR = verbState(29), CUT0 = Math.floor(9.45 * SR), CUT1 = Math.floor(9.85 * SR), OPEN = CUT0;
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const wl = verbStep(VL, Lc[n]), wr = verbStep(VR, Rc[n]);
  const a = Math.abs(voAt(n)); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00003);
  const t = n / SR, fade = Math.min(1, t / .15) * Math.min(1, (DUR - t) / 1.0), g = fade * (1 - .5 * duck);
  const cut = n > CUT0 && n < CUT1 ? 0 : 1;                       // the record scratch stops everything dead, reverb too
  const hot = n < OPEN ? 2.1 : 1;                                 // the wordless hot open plays louder (and is left out of the peak)
  Lc[n] = (Lc[n] + wl * .3) * g * cut * hot; Rc[n] = (Rc[n] + wr * .3) * g * cut * hot; if (n >= OPEN) peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n]));
}
function writeWav(path, l, r, gain) {                            // 16-bit stereo, written in chunks
  const fd = openSync(path, 'w'), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + N * 4, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(N * 4, 40); writeSync(fd, h);
  const CH_ = 1 << 16, buf = Buffer.alloc(CH_ * 4);
  for (let s = 0; s < N; s += CH_) { const m = Math.min(CH_, N - s); for (let k = 0; k < m; k++) { buf.writeInt16LE(Math.round(Math.tanh(l(s + k) * gain) * 32767), k * 4); buf.writeInt16LE(Math.round(Math.tanh(r(s + k) * gain) * 32767), k * 4 + 2); } writeSync(fd, buf, 0, m * 4); }
  closeSync(fd);
}
const MUSIC = .11 / peak;                                        // the body sits where zinc's does (about -38 LUFS)
writeWav('assets/pistol_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/pistol_mix.wav', n => Lc[n] * MUSIC + voAt(n) * 1.05, n => Rc[n] * MUSIC + voAt(n) * 1.05, 1);
console.log(`wrote assets/pistol_bgm.wav and assets/pistol_mix.wav (${DUR} s, peak ${peak.toFixed(3)})`);

// audio/music_opto.mjs: the score for "Pip讲光遗传学" (src/scenes/opto.js), synthesised from scratch like audio/music_mrna.mjs,
// then mixed under the narration.
//   node tools/make.mjs opto vo && node tools/make.mjs opto music   → assets/opto_bgm.wav (music only) and assets/opto_mix.wav (voice + music)
// 96 bpm = PROJECT.bpm in src/config_opto.js. Each shot gets its own section (chords, texture); stingers sit on the
// picture's events (seconds). The music ducks under the voice, following the voice's loudness.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SR = 44100, DUR = 177.5, N = SR * DUR, BEAT = 60 / 96, BAR = 4 * BEAT, TAU = Math.PI * 2;
const L = new Float32Array(N), R = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); L[i0 + i] += v * gl; R[i0 + i] += v * gr; }
}
const env = (tt, a, d) => (tt < a ? tt / a : Math.exp(-(tt - a) / d));

// ---------- instruments ----------
const kalimba = (t, m, v = .18, pan = 0) => { const f = hz(m); add(t, 1.8, pan, tt => v * env(tt, .004, .45) * (Math.sin(TAU * f * tt) + .3 * Math.sin(TAU * f * 5.4 * tt) * Math.exp(-tt * 18) + .12 * Math.sin(TAU * f * 2 * tt) * Math.exp(-tt * 6))); };
const glock = (t, m, v = .09, pan = 0, dec = .7) => { const f = hz(m); add(t, 2.4, pan, tt => v * env(tt, .002, dec) * (Math.sin(TAU * f * tt) + .35 * Math.sin(TAU * f * 2.76 * tt) * Math.exp(-tt * 9) + .15 * Math.sin(TAU * f * 5.4 * tt) * Math.exp(-tt * 20))); };
const mbox = (t, m, v = .08, pan = 0, muffle = 0) => { const f = hz(m); add(t, 1.6, pan, tt => v * env(tt, .001, .5 * (1 - .6 * muffle)) * (Math.sin(TAU * f * tt) + (1 - muffle) * (.5 * Math.sin(TAU * f * 3 * tt) * Math.exp(-tt * 14) + .2 * Math.sin(TAU * f * 6.1 * tt) * Math.exp(-tt * 30)))); };
const pizz = (t, m, v = .18, pan = -.1) => { const f = hz(m); add(t, .7, pan, tt => { const e = env(tt, .005, .16); let s = 0; for (let k = 1; k <= 5; k++) s += Math.sin(TAU * f * k * tt) * Math.exp(-tt * k * 7) / k; return v * e * s; }); };
const pad = (t, len, ms, v = .035, cut = .05) => {
  ms.forEach((m, j) => { for (const det of [-.08, .08]) {
    const f = hz(m + det * .1), ph = rnd(); let lp = 0;
    add(t, len + .9, (j / (ms.length - 1 || 1)) * 1.2 - .6, tt => {
      const a = Math.min(1, tt / .5) * (tt > len ? Math.exp(-(tt - len) / .3) : 1), saw = 2 * ((f * tt + ph) % 1) - 1;
      lp += (saw - lp) * cut; return v * a * lp;
    });
  } });
};
const tick = (t, v = .035, pan = .3) => add(t, .05, pan, tt => v * (rnd() * 2 - 1) * Math.exp(-tt * 100));
const block = (t, m = 84, v = .14, pan = .2) => { const f = hz(m); add(t, .12, pan, tt => v * Math.sin(TAU * f * tt) * Math.exp(-tt * 45)); };
const kick = (t, v = .2) => add(t, .3, 0, tt => v * Math.sin(TAU * (48 + 80 * Math.exp(-tt * 30)) * tt) * Math.exp(-tt * 13));
function whoosh(t, len, v = .08, up = true) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = up ? .03 + .3 * k : .33 - .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
function slide(t, len, m0, m1, v = .06) { let ph = 0; add(t, len + .08, .2, tt => { const k = Math.min(1, tt / len), f = hz(m0 + (m1 - m0) * k); ph += f / SR; return v * Math.min(1, tt / .02) * (tt > len ? Math.exp(-(tt - len) * 40) : 1) * Math.sin(TAU * ph); }); }

// ---------- sections ----------
const CH = {
  C: [60, 64, 67, 72], Cmaj7: [60, 64, 67, 71], Am: [57, 64, 69, 72], Am7: [57, 64, 67, 72], F: [53, 60, 65, 69], Fmaj7: [53, 60, 64, 69],
  G: [55, 62, 67, 71], Gsus: [55, 62, 67, 72], Em7: [52, 59, 62, 67], Dm7: [50, 57, 60, 65], Fadd9: [53, 60, 67, 69], D: [50, 57, 62, 66], Bb: [46, 58, 62, 65]
};
const ROOT = { C: 36, Cmaj7: 36, Am: 33, Am7: 33, F: 41, Fmaj7: 41, G: 43, Gsus: 43, Em7: 40, Dm7: 38, Fadd9: 41, D: 38, Bb: 34 };
function section(t0, t1, prog, style) {
  let bar = 0;
  for (let t = t0; t < t1 - .2; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    pad(t, len, ch, style.pad ?? .03);
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (style.bass === 'one' && b === 0) pizz(tb, r, .16);
      if (style.bass === 'two' && b % 2 === 0) pizz(tb, r + (b ? 7 : 0), .16);
      if (style.bass === 'walk') pizz(tb, r + [0, 7, 12, 7][b], .15);
      if (style.kick && b % 2 === 0) kick(tb, style.kick);
      if (style.shaker) { tick(tb + BEAT / 2, .03); tick(tb + BEAT / 4, .015, -.3); }
      if (style.arp) for (let e = 0; e < (style.arp === 'eighth' ? 2 : 1); e++) {
        const i = b * 2 + e, m = ch[[0, 2, 3, 2, 1, 2, 3, 2][i % 8]] + 12 + (style.oct || 0);
        (style.arpInst || kalimba)(tb + e * BEAT / 2, m, style.arpV ?? .08, (i % 3 - 1) * .3);
      }
    }
  }
}
// A: the tangle (mysterious), then the dream of a switch (bright)
section(0, 11.6, ['Am7', 'Fmaj7', 'Dm7', 'Em7'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: glock, arpV: .03, oct: 12 });
section(11.6, 24.6, ['C', 'Am', 'F', 'G'], { pad: .024, bass: 'two', arp: 'eighth', arpV: .05 });
// B: the pond; then why is it so fast (curious)
section(24.6, 37.1, ['F', 'G', 'C', 'Am'], { pad: .024, bass: 'walk', shaker: true, arp: 'eighth', arpV: .048 });
section(37.1, 54.9, ['Fmaj7', 'Em7', 'Dm7', 'G'], { pad: .028, bass: 'two', arp: 'quarter', arpInst: mbox, arpV: .05, oct: 12 });
// C: the egg, the protein, the retinal (wonder), then light and ions (driving)
section(54.9, 70.0, ['C', 'F', 'Am', 'G'], { pad: .024, bass: 'two', arp: 'eighth', arpV: .045 });
section(70.0, 85.0, ['Am', 'F', 'C', 'G'], { pad: .026, bass: 'walk', kick: .08, shaker: true, arp: 'eighth', arpV: .05 });
// D: rest → threshold (tense), the spike (bright)
section(85.0, 92.35, ['Dm7', 'Am7', 'Dm7', 'Em7'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: glock, arpV: .03, oct: 12 });
section(92.35, 97.4, ['C', 'G'], { pad: .026, bass: 'two', kick: .1, arp: 'eighth', arpV: .055 });
// E: flash, spike
section(97.4, 109.9, ['Am', 'F', 'C', 'G'], { pad: .026, bass: 'walk', kick: .1, arp: 'quarter', arpInst: mbox, arpV: .045, oct: 12 });
// F: the genetic part
section(109.9, 123.6, ['F', 'G', 'Em7', 'Am7'], { pad: .026, bass: 'two', shaker: true, arp: 'eighth', arpV: .045 });
// G: the mouse; the fear memory
section(123.6, 135.0, ['C', 'G', 'Am', 'F'], { pad: .024, bass: 'walk', shaker: true, arp: 'eighth', arpV: .05 });
section(135.0, 138.9, ['Dm7', 'Bb'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: glock, arpV: .03, oct: 12 });
// H: the off switch (hushed), then on/off (playful)
section(138.9, 147.4, ['Am7', 'Fmaj7', 'Dm7', 'Em7'], { pad: .028, bass: 'one', arp: 'quarter', arpInst: mbox, arpV: .04, oct: 12 });
section(147.4, 153.6, ['F', 'G', 'C', 'Am'], { pad: .025, bass: 'walk', kick: .08, arp: 'eighth', arpV: .05 });
// I: blind, then the room comes back
section(153.6, 159.6, ['Am7', 'Dm7'], { pad: .03, arp: 'quarter', arpInst: glock, arpV: .028, oct: 12 });
section(159.6, 166.6, ['Fadd9', 'Cmaj7', 'F', 'G'], { pad: .028, bass: 'two', arp: 'eighth', arpV: .045 });
// J: home, lit
section(166.6, 175.4, ['C', 'Am', 'F', 'G'], { pad: .025, bass: 'walk', kick: .09, shaker: true, arp: 'eighth', arpV: .05 });
pad(175.4, 2.1, CH.Cmaj7, .026);

// ---------- stingers on the picture ----------
kalimba(.3, 84, .05); kalimba(.45, 88, .05);
glock(2.1, 91, .035);
for (let i = 0; i < 10; i++) glock(4.4 + i * .5 + (i % 3) * .07, [79, 83, 86, 88, 91][i % 5] + 12, .018, (i % 3 - 1) * .6);
slide(7.3, .4, 72, 76, .03);
block(10.45, 64, .1); for (let i = 0; i < 8; i++) glock(10.6 + i * .09, 84 + ((i * 5) % 12), .03, (i % 3 - 1) * .5);
glock(12.0, 96, .05); glock(12.15, 100, .04);
block(14.9, 84, .12); glock(15.0, 96, .05);
slide(17.6, .7, 96, 72, .03); kick(18.3, .16); CH.C.forEach(m => glock(18.32, m + 24, .04));
whoosh(24.2, 1.0, .07);
for (let i = 0; i < 4; i++) glock(29.4 + i * .08, [79, 84, 88, 91][i] + 12, .03);                    // Chlamy
glock(31.1, 91, .04); glock(32.3, 91, .03);                                                           // the eyespot
slide(33.6, 1.2, 67, 79, .03);                                                                        // to the light
for (const z of [40.3, 41.0, 41.7, 43.2]) { block(z, 88, .07); glock(z + .01, 100, .04); }          // zap, at once
glock(43.4, 79, .035); [45.0, 45.7, 46.3, 47.0].forEach((t, i) => { block(t, 60 + i * 3, .06); glock(t + .02, 74 + i * 2, .025); });   // the slow cascade
slide(47.15, .3, 72, 84, .05); block(47.15, 60, .1);                                                  // ...Pip, late
glock(48.9, 96, .05); glock(49.05, 100, .04);                                                         // idea
slide(50.2, .3, 72, 91, .03); block(50.9, 72, .08); for (let i = 0; i < 4; i++) kalimba(51.4 + i * .4, 84 + i * 3, .03);   // one protein does it all
whoosh(53.5, 1.4, .08);
slide(56.1, .9, 79, 67, .03); glock(57.4, 96, .05);                                                   // the needle, the gene
[60.2, 60.55, 60.9].forEach((t, i) => glock(t, 84 + i * 4, .04));                                    // proteins appear
CH.Fmaj7.forEach(m => glock(62.2, m + 24, .03));                                                      // its name
glock(64.0, 91, .04); glock(64.15, 96, .04);                                                          // the magnifier: retinal
CH.C.forEach(m => glock(67.8, m + 24, .03));                                                          // same molecule ✓
slide(70.05, .3, 72, 91, .03);                                                                        // blue light
slide(73.45, .8, 84, 76, .04); block(74.3, 70, .08);                                                  // all-trans → 13-cis
slide(75.4, 1.0, 60, 67, .03); block(76.9, 72, .1); glock(77.0, 96, .04);                              // shape change; open
for (let i = 0; i < 24; i++) kalimba(77.6 + i * .17, [72, 76, 79, 84][i % 4] + 12, .02);             // Na+ pours in
block(82.9, 64, .09); slide(83.0, .5, 76, 72, .02);                                                   // shut
for (let i = 0; i < 4; i++) block(86.9 + i * .4, 52, .05);                                            // − − − − at rest
slide(89.0, .3, 72, 91, .03); slide(89.3, 3.0, 60, 72, .025);                                         // light; the potential climbs
for (let i = 0; i < 6; i++) tick(91.3 + i * .2, .04);                                                 // threshold...
kick(92.35, .2); CH.C.forEach(m => glock(92.4, m + 24, .045)); for (let i = 0; i < 6; i++) glock(92.6 + i * .5, 88 + i * 2, .03);   // fire, and down the axon
whoosh(96.7, .8, .07);
slide(101.0, 1.3, 84, 72, .03); glock(102.4, 96, .04); for (let i = 0; i < 16; i++) glock(102.5 + i * .05, 84 + (i % 4) * 3, .015);
[103.65, 105.95, 106.55, 107.35, 107.95, 108.65, 109.25].forEach((f, i) => { block(f, 96, .06); glock(f + .08, [88, 91, 96, 91, 88, 96, 100][i], .04); });
whoosh(109.3, .8, .08);
glock(110.5, 96, .04); [111.7, 112.8, 113.0].forEach((t, i) => block(t, 80 + i * 4, .06));            // pack the gene into virus
for (let j = 0; j < 3; j++) slide(113.4 + j * .15, 1.4, 79, 86, .02);                                 // they fly
for (let j = 0; j < 3; j++) glock(115.0 + j * .15, 91, .03);                                          // delivered
slide(116.0, 1.6, 67, 72, .02); block(117.9, 84, .1); glock(117.95, 100, .05);                        // the reader fits
block(118.0, 50, .06); block(118.3, 50, .06);                                                         // ...the others don't
glock(118.9, 96, .045); for (let i = 0; i < 16; i++) glock(120.8 + i * .05, 84 + (i % 4) * 3, .015); // the gene is read; channels
slide(122.2, .25, 72, 91, .03); CH.C.forEach(m => glock(122.45, m + 24, .04));                        // only gold fires
whoosh(123.2, .9, .07);
slide(125.2, 1.6, 84, 67, .025); block(126.9, 60, .08);                                               // the fibre docks
for (const t of [129.05, 130.3]) { slide(t, .15, 84, 91, .03); for (let i = 0; i < 6; i++) tick(t + .1 + i * .12, .035, (i % 2) - .5); }
whoosh(131.5, .6, .06); slide(131.9, .8, 72, 67, .02);                                                // asleep
kick(133.35, .2); block(133.35, 84, .1); glock(133.4, 100, .05);                                      // awake!
block(135.15, 45, .13); for (let i = 0; i < 6; i++) block(135.4 + i * .2, 52, .05);                   // fear
slide(137.7, .8, 64, 72, .03);
whoosh(138.0, 1.0, .07);
for (const s of [139.2, 140.1, 141.0, 141.9, 142.8]) block(s, 88, .04);                               // it fires on its own
glock(139.6, 84, .04);                                                                                // the pump appears
slide(141.7, .3, 79, 88, .03);                                                                        // yellow light
for (let i = 0; i < 16; i++) block(142.2 + i * .32, 64 - (i % 2) * 3, .035);                          // pump strokes: Cl− in
slide(145.4, 1.4, 72, 60, .03);                                                                       // silence
for (const [a, , c] of [[147.9, 0, 'b'], [149.3, 0, 'y'], [150.7, 0, 'b'], [151.7, 0, 'y']]) { if (c === 'b') { slide(a, .2, 79, 91, .03); for (let i = 0; i < 4; i++) tick(a + .15 + i * .12, .035); } else block(a, 60, .08); }
glock(151.9, 96, .05); glock(152.05, 100, .05);                                                       // ✓ cause
whoosh(153.1, .9, .07);
for (let i = 0; i < 13; i++) kalimba(155.8 + i * .1, 79 + (i % 4) * 3, .022);
slide(158.0, .4, 72, 88, .03); for (let i = 0; i < 4; i++) glock(158.35 + i * .25, 91 + i * 2, .035);
block(160.3, 76, .07); glock(160.75, 96, .05);
CH.Fadd9.forEach(m => glock(161.1, m + 24, .03));
glock(163.9, 96, .05); glock(164.05, 100, .05);
whoosh(166.2, .8, .07);
slide(167.65, .5, 79, 91, .03);
[168.05, 170.45, 171.05, 171.65, 172.25].forEach((t, i) => glock(t, [84, 88, 91, 96, 100][i], .05));
CH.C.forEach(m => glock(172.95, m + 24, .04)); kick(172.95, .14);
glock(175.3, 96, .04); glock(176.3, 91, .03); glock(177.0, 84, .03);
// ---------- reverb, ducking under the voice, fades ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1116, 1188, 1277, 1356].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .7 + c.s * .3; c.b[c.i] = x[n] + c.s * .84; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [556 + off, 441 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/opto_vo.wav');
const vl = verb(L, 0), vr = verb(R, 23);
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const a = Math.abs(vo[n] || 0); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;                  // voice envelope
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00004);        // fast down, slow back up
  const t = n / SR, fade = Math.min(1, t / 1.2) * Math.min(1, (DUR - t) / .8), g = fade * (1 - .45 * duck);
  L[n] = (L[n] + vl[n] * .32) * g; R[n] = (R[n] + vr[n] * .32) * g; peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
}
function writeWav(path, l, r, gain) {
  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(Math.tanh(l(n) * gain) * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(Math.tanh(r(n) * gain) * 32767), 46 + n * 4); }
  writeFileSync(path, buf);
}
const MUSIC = .16 / peak;                                  // the music sits well under the voice (voice peaks near .9)
writeWav('assets/opto_bgm.wav', n => L[n], n => R[n], MUSIC);
writeWav('assets/opto_mix.wav', n => L[n] * MUSIC + (vo[n] || 0) * 1.05, n => R[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
// loudness-normalise the mix (-16 LUFS, -1.5 dBTP) so it plays at a normal level
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/opto_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/opto_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/opto_mix_n.wav', 'assets/opto_mix.wav');
console.log('wrote assets/opto_bgm.wav and assets/opto_mix.wav');

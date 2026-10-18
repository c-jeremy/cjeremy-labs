// audio/music_pcr.mjs: the score for "Clawd讲PCR" (src/scenes/pcr.js), synthesised from scratch like audio/music_dna.mjs,
// then mixed under the narration.
//   node audio/vo_pcr.mjs && node audio/music_pcr.mjs   → assets/pcr_bgm.wav (music only) and assets/pcr_mix.wav (voice + music)
// 96 bpm = PROJECT.bpm in src/config_pcr.js. Each shot gets its own section (chords, texture); stingers sit on the
// picture's events (seconds). The music ducks under the voice, following the voice's loudness.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SR = 44100, DUR = 149.5, N = SR * DUR, BEAT = 60 / 96, BAR = 4 * BEAT, TAU = Math.PI * 2;
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
// the bench: bouncy and bright
section(0, 11.6, ['C', 'Am', 'F', 'G'], { pad: .024, bass: 'two', arp: 'eighth', arpV: .055 });
section(11.6, 22.6, ['F', 'G', 'C', 'Am'], { pad: .024, bass: 'walk', shaker: true, arp: 'eighth', arpV: .05 });
// inside the tube: each temperature its own colour
section(22.6, 25.4, ['Fmaj7', 'Em7'], { pad: .03, arp: 'quarter', arpInst: mbox, arpV: .05, oct: 12 });
section(25.4, 35.3, ['Am', 'F', 'Am', 'G'], { pad: .028, bass: 'walk', kick: .1, shaker: true, arp: 'eighth', arpV: .045 });   // hot
section(35.3, 45.0, ['Fmaj7', 'Em7', 'Dm7', 'Em7'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: glock, arpV: .03, oct: 12 }); // cold
section(45.0, 61.5, ['C', 'F', 'Am', 'G'], { pad: .026, bass: 'two', arp: 'eighth', arpV: .05 });                          // warm, extending
section(61.5, 72.6, ['Am7', 'Fmaj7', 'Dm7', 'Em7'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: mbox, arpV: .045, oct: 12 });   // the trap
section(72.6, 87.3, ['F', 'G', 'Em7', 'Am7'], { pad: .026, bass: 'walk', kick: .1, shaker: true, arp: 'eighth', arpV: .05 });
section(87.3, 94.6, ['C', 'G', 'Am', 'F'], { pad: .026, bass: 'walk', kick: .12, shaker: true, arp: 'eighth', arpV: .06, oct: 12 });   // copies multiply
section(94.6, 105.3, ['Am7', 'Fmaj7', 'Dm7', 'Em7'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: glock, arpV: .03, oct: 12 });   // tails
section(105.3, 119.6, ['F', 'G', 'Em7', 'Am7'], { pad: .026, bass: 'walk', kick: .1, shaker: true, arp: 'eighth', arpV: .05 });
section(119.6, 129.2, ['Dm7', 'G', 'Em7', 'Am'], { pad: .028, bass: 'two', arp: 'quarter', arpInst: mbox, arpV: .05, oct: 12 });      // the 3' rule
section(129.2, 141.6, ['C', 'Am', 'F', 'G'], { pad: .024, bass: 'two', kick: .08, arp: 'eighth', arpV: .05 });                         // counting
section(141.6, 147.6, ['C', 'F', 'G', 'C'], { pad: .026, bass: 'two', kick: .1, arp: 'eighth', arpV: .06 });
pad(147.6, 1.9, CH.Cmaj7, .026);

// ---------- stingers on the picture ----------
kalimba(.95, 84, .05); kalimba(1.1, 88, .05);                                                        // hello
[79, 84, 88, 91].forEach((m, i) => glock(5.8 + i * .1, m + 12, .035));                              // the wish
glock(8.45, 96, .06); glock(8.6, 100, .05);                                                          // idea
[12.9, 14.0, 14.3, 15.05, 15.3, 15.55, 15.8, 18.15].forEach((t, i) => { slide(t + .1, .4, 72 + i, 84 + i, .025); block(t + .72, 84 + (i % 4) * 2, .07); });   // tosses, plops
slide(16.74, .7, 67, 91, .04); block(17.5, 79, .09);                                                 // Taq hops in
whoosh(19.85, .6, .06); kick(20.6, .3); block(20.6, 55, .14);                                        // into the tube, the lid slams
[0, 1, 2].forEach(i => glock(20.95 + i * .2, [84, 88, 91][i], .06));                                // power on
whoosh(21.4, 1.2, .07, true);
glock(23.0, 96, .04);
for (let i = 0; i < 16; i++) block(27.1 + i * .1, 92 + (i % 3) * 2, .025, (i % 2) - .5);             // hydrogen bonds pop
whoosh(29.0, 1.6, .06);                                                                              // strands part
slide(31.4, .4, 60, 55, .05); block(33.3, 60, .08); slide(33.7, .6, 62, 50, .04);                     // helicase comes, is sent off
slide(37.9, 1.0, 84, 72, .03);                                                                       // cool down
block(40.2, 86, .08); glock(40.22, 98, .04); block(41.4, 88, .08); glock(41.42, 100, .04);           // primers dock
[42.3, 42.5].forEach((t, i) => glock(t, 96 + i * 3, .05));                                           // 3' ends
slide(46.6, 1.0, 72, 84, .03);
slide(48.5, .6, 67, 79, .04);                                                                        // Taq arrives
for (let i = 0; i < 24; i++) kalimba(50.95 + i * .17, [72, 76, 79, 84][i % 4] + (i > 12 ? 12 : 0), .03);   // extension
[55.6, 56.32, 57.04].forEach((t, i) => glock(t, [91, 84, 88][i], .05)); glock(57.85, 96, .07); glock(57.9, 103, .04);   // one cycle, pip
glock(60.3, 91, .05); glock(60.6, 96, .05);                                                          // two!
block(62.0, 60, .1); glock(62.02, 82, .05);                                                          // the trap
for (let i = 0; i < 6; i++) block(64.7 + i * .12, 88, .03);                                          // chalk lines
slide(68.8, 1.2, 72, 84, .03);                                                                       // the overhang
for (const c of [[72.6, 76.4], [81.4, 84.5]]) { whoosh(c[0], .8, .05); for (let i = 0; i < 10; i++) kalimba(c[0] + 1.9 + i * (c[1] - c[0] - 1.9) / 10, 79 + (i % 4) * 2, .025); glock(c[1], 96, .06); }
glock(77.0, 96, .05); glock(77.15, 100, .04);                                                         // first short strands
[[84.7, 91], [84.85, 96], [85.0, 100]].forEach(([t, m]) => glock(t, m, .06));                       // two targets
for (let i = 0; i < 14; i++) glock(87.5 + i * .15, 84 + (i % 7) * 2, .03);                          // copies multiply
[91.1, 91.5, 92.05, 92.4, 92.75].forEach((t, i) => block(t, 84 + i * 2, .06));                       // formula strokes
whoosh(94.2, .8, .07);
block(95.4, 60, .1); glock(95.42, 82, .05);                                                           // another trap
glock(96.7, 91, .05); slide(98.5, .8, 72, 84, .04); glock(99.35, 100, .05);                           // 5' end, the tail grows, scissors
for (const t of [101.64, 101.9]) slide(t, .3, 79, 74, .04);                                          // the tails flap
glock(106.75, 93, .05);                                                                               // part of the new strand
for (const c of [[108.7, 112.6], [113.5, 116.8]]) { whoosh(c[0], .7, .05); for (let i = 0; i < 9; i++) kalimba(c[0] + 1.6 + i * (c[1] - c[0] - 1.6) / 9, 79 + (i % 4) * 2, .025); }
glock(112.2, 96, .05); glock(112.35, 100, .04);                                                       // the complement is copied
[[117.6, 91], [117.75, 96], [117.9, 100]].forEach(([t, m]) => glock(t, m, .06));                    // full targets, scissors
whoosh(119.2, .8, .08);                                                                               // whip pan
glock(121.65, 96, .06); glock(121.8, 100, .05);                                                       // ✓
block(124.55, 88, .1); glock(124.6, 98, .04);                                                         // snug click
block(124.95, 52, .12);                                                                               // ✗
block(126.45, 58, .1); slide(126.5, .3, 72, 64, .04);                                                 // bad Taq bumps
for (let i = 0; i < 10; i++) kalimba(126.85 + i * .135, 79 + (i % 4) * 2 + (i > 5 ? 12 : 0), .03);   // good Taq runs
whoosh(128.4, .8, .08);
glock(130.65, 84, .05); glock(132.8, 88, .05);
for (let i = 0; i < 14; i++) glock(133.7 + i * .115, 84 + (i % 7) * 2 + 12, .035);                  // counting primers
[137.7, 138.05, 138.3, 138.6, 139.05, 139.35].forEach((t, i) => block(t, 84 + i * 2, .06));           // formula strokes
whoosh(141.2, .8, .07);
for (let i = 0; i < 6; i++) glock(142.4 + i * .2, 84 + i * 2, .04);                                  // doubling, doubling
CH.C.forEach(m => glock(143.65, m + 24, .035));                                                       // a million copies
kick(144.4, .2); slide(144.55, .6, 72, 96, .05);                                                      // the lid pops, Clawd springs out
for (let i = 0; i < 10; i++) kalimba(144.6 + i * .12, [84, 88, 91, 96][i % 4], .03);
CH.C.forEach(m => glock(146.35, m + 24, .03));                                                        // goodbye
glock(148.9, 96, .04);

// ---------- reverb, ducking under the voice, fades ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1116, 1188, 1277, 1356].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .7 + c.s * .3; c.b[c.i] = x[n] + c.s * .84; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [556 + off, 441 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/pcr_vo.wav');
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
writeWav('assets/pcr_bgm.wav', n => L[n], n => R[n], MUSIC);
writeWav('assets/pcr_mix.wav', n => L[n] * MUSIC + (vo[n] || 0) * 1.05, n => R[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
// loudness-normalise the mix (-16 LUFS, -1.5 dBTP) so it plays at a normal level
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/pcr_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/pcr_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/pcr_mix_n.wav', 'assets/pcr_mix.wav');
console.log('wrote assets/pcr_bgm.wav and assets/pcr_mix.wav');

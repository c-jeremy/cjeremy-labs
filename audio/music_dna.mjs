// audio/music_dna.mjs: the score for "Clawd讲转录和翻译" (src/scenes/dna.js), synthesised from scratch,
// then mixed under the narration.
//   node audio/vo_dna.mjs && node audio/music_dna.mjs   → assets/dna_bgm.wav (music only) and assets/dna_mix.wav (voice + music)
// 100 bpm = PROJECT.bpm in src/config_dna.js. Each shot gets its own section (chords, texture); stingers sit on the
// picture's events (seconds). The music ducks under the voice, following the voice's loudness.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SR = 44100, DUR = 88, N = SR * DUR, BEAT = 60 / 100, BAR = 4 * BEAT, TAU = Math.PI * 2;
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
section(0, 3.9, ['C', 'F'], { pad: .024, bass: 'two', arp: 'eighth', arpV: .06 });
section(3.9, 10.0, ['Fmaj7', 'Em7', 'Dm7'], { pad: .028, arp: 'quarter', arpInst: mbox, arpV: .05, oct: 12 });
section(10.0, 21.2, ['Am7', 'Fmaj7', 'Dm7', 'Em7'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: glock, arpV: .03, oct: 12 });
section(21.2, 35.8, ['Am7', 'F', 'C', 'G'], { pad: .026, bass: 'walk', shaker: true, arp: 'eighth', arpV: .05 });
section(35.8, 45.9, ['F', 'G', 'Em7', 'Am7'], { pad: .026, bass: 'two', arp: 'eighth', arpV: .05 });
section(45.9, 58.4, ['C', 'Am', 'F', 'G'], { pad: .024, bass: 'two', kick: .1, arp: 'eighth', arpV: .05 });
section(58.4, 73.1, ['F', 'G', 'Em7', 'Am7'], { pad: .024, bass: 'walk', kick: .11, shaker: true, arp: 'eighth', arpV: .05 });
section(73.1, 78.55, ['Fadd9', 'G'], { pad: .03, bass: 'one', arp: 'eighth', arpInst: glock, arpV: .03, oct: 12 });
section(78.55, 86.3, ['C', 'F', 'G', 'C'], { pad: .026, bass: 'two', kick: .1, arp: 'eighth', arpV: .055 });
pad(86.3, 1.7, CH.Cmaj7, .026);

// ---------- stingers on the picture ----------
slide(3.1, .7, 72, 96, .04); glock(3.95, 96, .05); glock(4.1, 100, .04);                          // into the eyepiece, the field opens
[91, 95, 98].forEach((m, i) => glock(6.76 + i * .08, m, .04));                                   // the DNA glows
[79, 84, 88].forEach((m, i) => kalimba(7.5 + i * .18, m, .05));                                  // proteins pop out
whoosh(9.0, 1.0, .06); block(10.6, 72, .08);                                                      // dive into the nucleus, land
for (let i = 0; i < 6; i++) glock(14.5 + i * .16, 84 + i * 2, .025);                              // helix straightens to a ladder
block(16.96, 88, .1); glock(17.0, 96, .05); block(17.88, 86, .1); glock(17.92, 93, .05);          // A-T, C-G snap
slide(21.24, .5, 60, 72, .04); block(22.85, 69, .12); whoosh(24.15, 1.0, .05);                     // polymerase arrives, clamps, unzips
for (let i = 0; i < 20; i++) { const t = i < 13 ? 26.25 + (i + 1) * (6.75 / 13) : i === 13 ? 34.55 : 34.8 + (i - 13) * (.9 / 6); block(t, [84, 86, 88, 91][i % 4], .045, .3); }   // each base docks
block(33.55, 60, .1); slide(33.6, .4, 84, 96, .04); glock(34.5, 100, .06);                       // T swatted away; U docks
whoosh(35.9, .9, .06);                                                                             // release
[36.94, 37.1, 37.26].forEach((t, i) => block(t, 76 + i * 2, .05));                                // DNA zips shut
block(40.4, 91, .09); glock(40.42, 98, .04);                                                      // the hat
for (let i = 0; i < 8; i++) kalimba(41.3 + i * .075, 84 + (i % 4) * 2, .03);                     // the tail
block(42.45, 100, .09); block(42.5, 103, .07);                                                    // snip
whoosh(43.75, 2.1, .07);                                                                           // out through the pore
glock(45.9, 96, .05);
block(49.3, 67, .12); glock(49.32, 91, .03);                                                      // ribosome clamps
[[52.16, 88], [52.63, 91], [53.11, 96]].forEach(([t, m]) => { glock(t, m, .07); kalimba(t, m - 12, .05); });   // A U G
for (let i = 0; i < 7; i++) block(54.1 + i * .2, 88, .04);                                         // codon brackets
glock(56.07, 96, .05);
[[59.6, 91], [64.0, 96], [70.1, 93], [71.05, 95], [71.85, 96], [72.55, 98]].forEach(([t, m]) => glock(t, m, .05));   // tRNAs dock
slide(62.3, .25, 72, 60, .05); block(62.3, 58, .1);                                               // wrong tRNA bumps
[65.9, 70.3, 71.2, 71.95, 72.62].forEach(t => kalimba(t, 79, .05));                               // peptide bonds
[67.94, 70.45, 71.3, 72.05, 72.65].forEach(t => block(t, 64, .08));                               // ribosome shifts
pizz(72.9, 31, .25); block(73.12, 72, .1); whoosh(73.1, .6, .06);                                  // stop; subunits pop apart
for (let i = 0; i < 8; i++) glock(74.3 + i * .2, [72, 76, 79, 84, 88, 91, 96, 100][i], .035);     // folding
glock(76.2, 100, .06); block(77.1, 76, .1); glock(77.15, 103, .05);                               // the protein, the chomp
whoosh(78.2, .7, .06);
[[79.93, 84], [81.29, 88], [83.3, 91]].forEach(([t, m]) => { glock(t, m, .06); glock(t + .03, m + 12, .03); });   // summary glows
CH.C.forEach(m => glock(84.7, m + 24, .03));                                                        // goodbye
glock(87.5, 96, .04);

// ---------- reverb, ducking under the voice, fades ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1116, 1188, 1277, 1356].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .7 + c.s * .3; c.b[c.i] = x[n] + c.s * .84; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [556 + off, 441 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/dna_vo.wav');
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
writeWav('assets/dna_bgm.wav', n => L[n], n => R[n], MUSIC);
writeWav('assets/dna_mix.wav', n => L[n] * MUSIC + (vo[n] || 0) * 1.05, n => R[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
// loudness-normalise the mix (-16 LUFS, -1.5 dBTP) so it plays at a normal level
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/dna_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/dna_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/dna_mix_n.wav', 'assets/dna_mix.wav');
console.log('wrote assets/dna_bgm.wav and assets/dna_mix.wav');

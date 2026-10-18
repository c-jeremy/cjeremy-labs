// audio/music_mrna.mjs: the score for "Pip讲mRNA疫苗" (src/scenes/mrna.js), synthesised from scratch like audio/music_dna.mjs,
// then mixed under the narration.
//   node audio/vo_mrna.mjs && node audio/music_mrna.mjs   → assets/mrna_bgm.wav (music only) and assets/mrna_mix.wav (voice + music)
// 92 bpm = PROJECT.bpm in src/config_mrna.js. Each shot gets its own section (chords, texture); stingers sit on the
// picture's events (seconds). The music ducks under the voice, following the voice's loudness.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SR = 44100, DUR = 200.5, N = SR * DUR, BEAT = 60 / 92, BAR = 4 * BEAT, TAU = Math.PI * 2;
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
// A: inside a cell, curious
section(0, 20.4, ['C', 'Am', 'F', 'G'], { pad: .024, bass: 'two', arp: 'eighth', arpV: .05 });
// B: the design table
section(20.4, 36.4, ['F', 'G', 'C', 'Am'], { pad: .024, bass: 'walk', shaker: true, arp: 'eighth', arpV: .048 });
section(36.4, 48.0, ['Fmaj7', 'Em7', 'Dm7', 'G'], { pad: .028, bass: 'two', arp: 'quarter', arpInst: mbox, arpV: .05, oct: 12 });
// C: the sensor (tense), then the fix and the prize (bright)
section(48.0, 60.3, ['Am7', 'Fmaj7', 'Dm7', 'Em7'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: glock, arpV: .03, oct: 12 });
section(60.3, 73.6, ['C', 'G', 'Am', 'F'], { pad: .025, bass: 'two', kick: .08, arp: 'eighth', arpV: .05 });
// D: fragile outside, then packed up safe
section(73.6, 83.4, ['Dm7', 'Am', 'Bb', 'F'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: mbox, arpV: .045, oct: 12 });
section(83.4, 99.0, ['F', 'G', 'C', 'Am'], { pad: .026, bass: 'walk', shaker: true, arp: 'eighth', arpV: .05 });
// E: the shot, the gulp, the acid, the escape
section(99.0, 108.6, ['C', 'F', 'G', 'C'], { pad: .024, bass: 'two', kick: .08, arp: 'eighth', arpV: .05 });
section(108.6, 118.6, ['Am', 'F', 'Am', 'G'], { pad: .028, bass: 'walk', kick: .1, shaker: true, arp: 'eighth', arpV: .045 });
section(118.6, 123.0, ['C', 'G'], { pad: .026, bass: 'two', kick: .1, arp: 'eighth', arpV: .06, oct: 12 });
// F: making the protein; then the message ends
section(123.0, 132.8, ['F', 'G', 'Em7', 'Am7'], { pad: .026, bass: 'walk', shaker: true, arp: 'eighth', arpV: .05 });
section(132.8, 144.6, ['Am7', 'Fmaj7', 'Dm7', 'Em7'], { pad: .03, bass: 'one', arp: 'quarter', arpInst: glock, arpV: .03, oct: 12 });
// G: the lymph node, class is on
section(144.6, 166.6, ['C', 'Am', 'F', 'G'], { pad: .024, bass: 'walk', kick: .09, shaker: true, arp: 'eighth', arpV: .05 });
section(166.6, 174.8, ['Dm7', 'G', 'Em7', 'Am'], { pad: .028, bass: 'two', kick: .1, arp: 'quarter', arpInst: mbox, arpV: .05, oct: 12 });
section(174.8, 180.8, ['Fadd9', 'Cmaj7'], { pad: .03, arp: 'quarter', arpInst: glock, arpV: .035, oct: 12 });
// H: the real thing, then home
section(180.8, 191.8, ['Am', 'F', 'C', 'G'], { pad: .026, bass: 'walk', kick: .11, shaker: true, arp: 'eighth', arpV: .055 });
section(191.8, 198.6, ['Fmaj7', 'Cmaj7'], { pad: .028, bass: 'one', arp: 'quarter', arpInst: glock, arpV: .03, oct: 12 });
pad(198.6, 1.9, CH.Cmaj7, .026);

// ---------- stingers on the picture ----------
kalimba(.3, 84, .05); kalimba(.45, 88, .05);                                                         // iris in, hello
for (let i = 0; i < 8; i++) block(2.2 + i * .55 + .2, 84 + (i % 3) * 2, .025);                       // the ribosome's codon steps
[79, 84, 88, 91].forEach((m, i) => glock(8.2 + i * .08, m + 12, .035));                              // the fold
glock(10.45, 96, .06); glock(10.6, 100, .05);                                                         // idea
glock(12.85, 79, .04); block(13.65, 52, .12);                                                         // a virus? no.
for (let i = 0; i < 5; i++) glock(14.5 + i * .07, 84 + i * 3, .035);                                  // the recipe
slide(16.75, .7, 67, 91, .04); glock(17.5, 96, .05);                                                  // one spike
whoosh(19.4, 1.0, .07);
glock(23.0, 91, .04);                                                                                 // spike icon
glock(25.55, 88, .04); block(27.95, 60, .12); glock(28.0, 96, .05);                                   // the cap clicks on
for (let i = 0; i < 14; i++) kalimba(29.4 + i * .16, 84 + (i % 2) * 3, .03);                          // A, A, A...
glock(32.5, 96, .04); glock(32.7, 100, .04);                                                          // stable
slide(33.7, .6, 60, 72, .04); glock(34.45, 91, .05); glock(34.6, 96, .05);                            // ribosome docks
glock(37.45, 88, .04); glock(37.6, 91, .04); block(38.8, 84, .08); glock(38.85, 98, .05);              // two codons → proline
for (const t of [40.3, 40.95, 41.6, 42.25]) { slide(t, .3, 72, 79, .03); block(t + .32, 64, .06); }  // tries to spring, held
glock(42.65, 96, .05);                                                                                // ✓
slide(43.35, 1.0, 60, 84, .03); [91, 96, 100].forEach((m, i) => glock(44.35 + i * .06, m, .05));      // antibody binds
whoosh(47.0, 1.2, .05);
slide(51.1, 1.0, 55, 60, .03);                                                                        // a foreign RNA
glock(54.5, 79, .04);
for (let i = 0; i < 10; i++) block(55.4 + i * .28, i % 2 ? 76 : 79, .05);                             // alarm
for (let i = 0; i < 14; i++) tick(58.3 + i * .06, .03, (i % 3 - 1) * .5);                             // cytokines
block(59.0, 45, .12);                                                                                 // translation shut off
for (let i = 0; i < 12; i++) glock(62.2 + i * .14, 79 + i * 2, .03);                                  // U → m1Ψ, a wave
slide(64.5, .4, 72, 76, .03); slide(66.4, .9, 76, 60, .03);                                           // ? ... zzz
for (let i = 0; i < 16; i++) kalimba(66.2 + i * .12, [72, 76, 79, 84][i % 4] + 12, .025);             // ribosomes run
slide(68.2, .8, 96, 72, .03); kick(68.95, .15); CH.C.forEach(m => glock(69.0, m + 24, .04));           // the medal lands
whoosh(73.1, .8, .07);
slide(74.4, 1.2, 67, 64, .03);                                                                        // fragile
for (let i = 0; i < 8; i++) block(77.0 + i * .17, 70 + (i % 2) * 3, .05);                              // chomp chomp
slide(77.75, .35, 72, 84, .05);                                                                       // shoo!
for (let i = 0; i < 10; i++) tick(78.4 + i * .18, .04, (i % 2) - .5);                                 // − − −
kick(81.75, .22); block(81.75, 48, .14); slide(81.9, .6, 79, 67, .04);                                 // bonk
for (let i = 0; i < 18; i++) glock(83.6 + i * .14, 72 + (i % 6) * 2 + (i > 9 ? 12 : 0), .025);        // lipids gather
for (let j = 0; j < 4; j++) block(87.6 + j * .25, 86 + j * 2, .05);                                   // + meets −
glock(90.25, 88, .04); glock(91.45, 91, .04); for (let i = 0; i < 4; i++) glock(93.15 + i * .1, 96 + i * 2, .03);   // shell, cholesterol, PEG
block(95.55, 62, .1); slide(95.6, .5, 79, 72, .03);                                                    // boing
whoosh(98.1, .9, .07);
slide(99.95, 1.0, 60, 72, .04);                                                                       // plunger
whoosh(101.0, .8, .08);
block(102.65, 70, .08); slide(104.4, .9, 64, 76, .04); block(105.45, 62, .09);                         // gulp; the DC reaches
whoosh(107.3, .7, .06);
slide(108.6, 1.6, 79, 70, .03);                                                                       // acidifying
for (let i = 0; i < 6; i++) glock(111.7 + i * .25, 88 + (i % 2) * 3, .035);                           // + + +
whoosh(114.0, 2.8, .05);                                                                              // membranes churn
kick(117.45, .2); block(117.45, 52, .12);                                                             // tear
for (let i = 0; i < 12; i++) kalimba(118.6 + i * .13, 72 + i * 2, .03);                               // escape!
glock(124.45, 91, .05); glock(124.6, 96, .05);                                                        // cap recognised
for (let i = 0; i < 14; i++) kalimba(125.5 + i * .17, [72, 76, 79, 84][i % 4], .025);                 // translation
slide(128.0, .5, 72, 79, .03); glock(128.5, 96, .04);                                                 // into the ER
slide(129.2, .9, 76, 84, .03); slide(130.3, .9, 84, 91, .03); CH.C.forEach(m => glock(131.2, m + 24, .035));   // Golgi, surface
block(136.5, 55, .1); block(138.35, 50, .1);                                                          // the pore, no RT
for (let i = 0; i < 3; i++) glock(140.6 + i * .45, 84 - i * 5, .03);                                 // days pass
for (let i = 0; i < 10; i++) kalimba(141.7 + i * .16, 84 - i * 2, .025);                              // it falls apart
whoosh(144.1, .8, .07);
[[155.4, CH.C], [160.5, CH.F]].forEach(([t, ch]) => ch.forEach(m => glock(t, m + 24, .035)));         // synapses
glock(149.6, 88, .03); glock(149.75, 91, .03); glock(149.9, 96, .03);                                 // peptides on MHC II
slide(157.2, 1.5, 84, 72, .025); glock(158.85, 96, .05);                                              // a spike, caught
slide(162.0, 1.5, 60, 72, .03);                                                                       // becomes a plasma cell
for (let i = 0; i < 12; i++) kalimba(163.9 + i * .2, [84, 88, 91, 96][i % 4], .025);                  // antibodies
glock(170.05, 88, .04); kick(172.3, .2); block(172.3, 57, .12);                                       // MHC I, CTL docks
for (let i = 0; i < 5; i++) glock(175.6 + i * .35, [84, 88, 91, 96, 100][i], .04);                    // memory cells
whoosh(180.1, .8, .09);
slide(181.6, 1.6, 67, 60, .03);                                                                       // here it comes
for (let i = 0; i < 6; i++) block(183.4 + i * .15, 84 + i, .05);                                      // antibodies coat it
kick(186.35, .2); block(186.35, 60, .1); slide(186.4, .5, 72, 84, .04); glock(186.95, 96, .05);        // can't dock ✓
for (let i = 0; i < 4; i++) glock(187.6 + i * .5, 84 + i * 4, .045);                                  // memory cells multiply
for (let i = 0; i < 6; i++) glock(190.4 + i * .1, 96 - i * 2, .03);                                  // cleared
whoosh(191.3, .8, .07);
slide(193.0, 1.4, 79, 72, .02);                                                                       // empty hands
CH.Fmaj7.forEach(m => glock(195.1, m + 24, .03)); glock(196.3, 100, .05);                             // memory, the wink
glock(199.1, 96, .04); glock(200.2, 91, .03);
// ---------- reverb, ducking under the voice, fades ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1116, 1188, 1277, 1356].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .7 + c.s * .3; c.b[c.i] = x[n] + c.s * .84; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [556 + off, 441 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/mrna_vo.wav');
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
writeWav('assets/mrna_bgm.wav', n => L[n], n => R[n], MUSIC);
writeWav('assets/mrna_mix.wav', n => L[n] * MUSIC + (vo[n] || 0) * 1.05, n => R[n] * MUSIC + (vo[n] || 0) * 1.05, 1);
// loudness-normalise the mix (-16 LUFS, -1.5 dBTP) so it plays at a normal level
spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'assets/mrna_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', 'assets/mrna_mix_n.wav'], { stdio: 'inherit' });
renameSync('assets/mrna_mix_n.wav', 'assets/mrna_mix.wav');
console.log('wrote assets/mrna_bgm.wav and assets/mrna_mix.wav');

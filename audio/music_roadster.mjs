// audio/music_roadster.mjs: the score for "Pip讲会倒挂的车" (src/scenes/roadster.js), synthesised from scratch.
//   node tools/make.mjs roadster vo && node tools/make.mjs roadster music   → assets/roadster_bgm.wav and assets/roadster_mix.wav
// Its own palette, no flute: a plucked synth (Karplus–Strong), an FM electric piano, a soft vibraphone bell that
// carries the recap motif, marimba for the board, a round sub bass and a light kit (kick, clap, hats).
// E minor at night, G major at dawn, 92 bpm = PROJECT.bpm. Sections follow the voice lines (times from
// videos/roadster.json, like the scenes' L(i, d)); the music ducks under the voice and breathes up in the gaps.
import { readFileSync, writeFileSync } from 'node:fs';

const MAN = JSON.parse(readFileSync('videos/roadster.json', 'utf8')), ST = MAN.voice.starts, Lx = (i, d = 0) => ST[i - 1] + d;
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

// ---------- instruments ----------
const epiano = (t, m, v = .05, pan = 0, len = 2) => { const f = hz(m); add(t, len + .4, pan, tt => { const e = env(tt, .006, .9) * (tt > len ? Math.exp(-(tt - len) / .12) : 1), I = 1.5 * Math.exp(-tt * 3);
  return v * e * (Math.sin(TAU * f * tt + I * Math.sin(TAU * f * tt)) + .1 * Math.sin(TAU * f * 14 * tt) * Math.exp(-tt * 25)); }); };
function pluck(t, m, v = .06, pan = 0, dec = .994, bright = .5) {          // Karplus–Strong, a little synthy
  const f = hz(m), P = Math.max(2, Math.round(SR / f)), buf = new Float32Array(P); for (let i = 0; i < P; i++) buf[i] = rnd() * 2 - 1;
  let i = 0, prev = 0; add(t, 1.4, pan, tt => { const a = buf[i], b = buf[(i + 1) % P], y = dec * (bright * a + (1 - bright) * b); buf[i] = y; i = (i + 1) % P; prev += (y - prev) * .6; return v * prev * Math.min(1, tt / .002); });
}
const marimba = (t, m, v = .06, pan = 0) => { const f = hz(m); add(t, .9, pan, tt => v * (Math.sin(TAU * f * tt) * env(tt, .002, .3) + .25 * Math.sin(TAU * f * 3.93 * tt) * Math.exp(-tt * 30))); };
const vibe = (t, m, v = .05, pan = 0, d = 1.4) => { const f = hz(m); add(t, d * 2.2, pan, tt => v * env(tt, .003, d) * (1 + .25 * Math.sin(TAU * 5.5 * tt)) * (Math.sin(TAU * f * tt) + .2 * Math.sin(TAU * f * 4 * tt) * Math.exp(-tt * 6))); };
const bass = (t, m, v = .12, len = BEAT * 1.8) => { const f = hz(m); add(t, len + .3, 0, tt => { const e = Math.min(1, tt / .015) * Math.exp(-tt / 1.2) * (tt > len ? Math.exp(-(tt - len) / .08) : 1); return v * e * Math.tanh(1.8 * (Math.sin(TAU * f * tt) + .3 * Math.sin(TAU * 2 * f * tt))); }); };
const pad = (t, len, ms, v = .018) => ms.forEach((m, j) => { for (const det of [-.07, .07]) { const f = hz(m + det), ph = rnd(); let lp = 0;
  add(t, len + 1.2, (j / (ms.length - 1 || 1)) * 1.4 - .7, tt => { const a = Math.min(1, tt / .7) * (tt > len ? Math.exp(-(tt - len) / .45) : 1), x = (f * tt + ph) % 1; lp += ((2 * x - 1) - lp) * .08; return v * a * lp; }); } });
const kick = (t, v = .2) => add(t, .4, 0, tt => v * Math.sin(TAU * (48 + 90 * Math.exp(-tt * 30)) * tt) * Math.exp(-tt * 9));
const clap = (t, v = .05) => { let lp = 0; add(t, .2, .1, tt => { const n = rnd() * 2 - 1; lp += (n - lp) * .5; return v * (n - lp) * env(tt, .002, .05); }); };
const hat = (t, v = .02, pan = .3) => { let lp = 0; add(t, .06, pan, tt => { const n = rnd() * 2 - 1; lp += (n - lp) * .7; return v * (n - lp) * Math.exp(-tt * 70); }); };
const rim = (t, v = .05) => add(t, .06, -.2, tt => v * Math.sin(TAU * 1900 * tt) * Math.exp(-tt * 70));
const tom = (t, v = .15) => add(t, .5, 0, tt => v * Math.sin(TAU * (65 + 55 * Math.exp(-tt * 16)) * tt) * Math.exp(-tt * 7));
function whoosh(t, len, v = .07) { let lp = 0, bp = 0; add(t, len, 0, tt => { const k = tt / len, c = .03 + .3 * k; lp += ((rnd() * 2 - 1) - lp) * c; bp += (lp - bp) * .4; return v * Math.sin(k * Math.PI) * (lp - bp) * 3; }); }
function riser(t, len, v = .05) { let lp = 0; add(t, len, 0, tt => { const k = tt / len; lp += ((rnd() * 2 - 1) - lp) * (.02 + .5 * k * k); return v * k * k * lp * (tt > len - .05 ? (len - tt) / .05 : 1); }); }
function jet(t, len, v = .05) { let lp = 0; add(t, len, -.1, tt => { lp += ((rnd() * 2 - 1) - lp) * .25; return v * lp * env(tt, .03, len * .5); }); }
const run = (t, ms, step = .06, v = .04, ins = pluck) => ms.forEach((m, i) => ins(t + i * step, m, v, (i / ms.length) - .5));

// ---------- harmony ----------
const CH = { Em: [52, 59, 64, 67], Em9: [52, 59, 66, 67], C: [48, 55, 60, 64], Cmaj7: [48, 55, 59, 64], G: [55, 59, 62, 67], D: [50, 57, 62, 66], Dsus: [50, 57, 62, 67],
  Am: [57, 60, 64, 69], Am7: [57, 60, 64, 67], Bm: [59, 62, 66, 71], B7: [59, 63, 66, 69], Gmaj7: [55, 59, 62, 66] };
const ROOT = { Em: 40, Em9: 40, C: 36, Cmaj7: 36, G: 43, D: 38, Dsus: 38, Am: 45, Am7: 45, Bm: 47, B7: 47, Gmaj7: 43 };
function section(t0, t1, prog, st = {}) {
  let bar = 0;
  for (let t = t0; t < t1 - .25; t += BAR, bar++) {
    const name = prog[bar % prog.length], ch = CH[name], len = Math.min(BAR, t1 - t), r = ROOT[name];
    pad(t, len, ch, st.pad ?? .016);
    if (st.ep) { epiano(t, ch[1] + 12, st.ep, -.3, Math.min(len, BEAT * 2.5)); epiano(t + .02, ch[3] + 12, st.ep * .8, .3, Math.min(len, BEAT * 2.5)); }
    for (let b = 0; b < 4; b++) {
      const tb = t + b * BEAT; if (tb >= t1 - .05) break;
      if (st.bass === 'one' && b === 0) bass(tb, r, .11, BEAT * 3.5);
      if (st.bass === 'pulse') bass(tb, r, .09, BEAT * .8);
      if (st.bass === 'drive') { bass(tb, r, .1, BEAT * .4); bass(tb + BEAT / 2, r + 12, .06, BEAT * .3); }
      if (st.kick && (st.kick === 4 || b % 2 === 0)) kick(tb, st.kickV ?? .16);
      if (st.clap && b % 2) clap(tb, st.clap);
      if (st.hat) { hat(tb + BEAT / 2, st.hat); if (st.hat16) { hat(tb + BEAT / 4, st.hat * .5, -.3); hat(tb + BEAT * .75, st.hat * .5, -.3); } }
      if (st.rim && b === 3) rim(tb + BEAT * .5, st.rim);
      if (st.arp) {
        const pat = st.pat || [0, 2, 1, 3, 2, 1, 3, 2], per = st.sixteenth ? 4 : 2;
        for (let e = 0; e < per; e++) { const i = b * per + e, m = ch[pat[i % pat.length]] + 12 + (st.oct || 0); if (st.skip && hash(i + bar * 16 + t0) < st.skip) continue;
          st.arp(tb + e * BEAT / per, m, (st.arpV ?? .045) * (e ? .8 : 1), ((i % 4) - 1.5) * .25); }
      }
    }
  }
}
const MOTIF = [[0, 71, .5], [.5, 74, .5], [1, 76, 1], [2, 74, .5], [2.5, 71, .5], [3, 67, 1.5]];   // the recap theme, in beats
const motif = (t, tr = 0, v = .045) => MOTIF.forEach(([b, m, d]) => vibe(t + b * BEAT, m + tr, v, 0, d * BEAT * 1.4));

// A: night, the hang — hushed, a little uncanny but not spooky: pluck and e-piano over a slow pulse
section(0, Lx(2, 3.4), ['Em9', 'Cmaj7', 'Am7', 'B7'], { pad: .016, ep: .025, bass: 'one', arp: pluck, arpV: .03, skip: .45 });
section(Lx(2, 3.4), Lx(4, -1.6), ['Em', 'C', 'G', 'D'], { pad: .018, bass: 'pulse', arp: pluck, arpV: .04, kick: 2, kickV: .12, hat: .012 });
// B: the board — curious, a light groove on marimba
section(Lx(4, -1.6), Lx(6, 0), ['Em', 'C', 'G', 'D'], { pad: .016, bass: 'pulse', arp: marimba, arpV: .04, kick: 2, kickV: .1, hat: .012, skip: .2 });
section(Lx(6, 0), Lx(8, -1.6), ['Am', 'Em', 'C', 'B7'], { pad: .018, bass: 'pulse', arp: marimba, arpV: .045, kick: 2, kickV: .12, clap: .035, hat: .014, sixteenth: true, skip: .35 });
// C: the loop — the most energetic so far; then the recap hush
section(Lx(8, -1.6), Lx(10, -.6), ['Em', 'C', 'G', 'D'], { pad: .016, bass: 'drive', arp: pluck, arpV: .04, kick: 4, kickV: .13, clap: .04, hat: .016, hat16: true, sixteenth: true, skip: .3 });
section(Lx(10, -.6), Lx(11, -2.0), ['Cmaj7', 'G', 'Am7', 'D'], { pad: .02, ep: .03, bass: 'one' });
// D: the air — open and light, vibraphone arpeggios
section(Lx(11, -2.0), Lx(13, -.3), ['Cmaj7', 'G', 'Am7', 'Dsus'], { pad: .018, bass: 'one', arp: vibe, arpV: .025, oct: 12, skip: .4, hat: .01 });
section(Lx(13, -.3), Lx(15, -1.6), ['Em', 'C', 'G', 'D'], { pad: .018, bass: 'pulse', arp: marimba, arpV: .04, kick: 2, kickV: .11, hat: .012 });
// E: the launch — driving
section(Lx(15, -1.6), Lx(16, 6.8), ['Am', 'Em', 'C', 'D'], { pad: .016, bass: 'drive', arp: pluck, arpV: .04, kick: 4, kickV: .13, hat: .015, sixteenth: true, skip: .25 });
section(Lx(16, 6.8), Lx(17, -1.6), ['G', 'D'], { pad: .02, bass: 'drive', arp: pluck, arpV: .05, kick: 4, kickV: .16, clap: .05, hat: .018, hat16: true, sixteenth: true });
// F: night again, the let-go, then the two halves
section(Lx(17, -1.6), Lx(18, 0), ['Em9', 'Cmaj7', 'Am7', 'B7'], { pad: .018, ep: .025, bass: 'one', arp: pluck, arpV: .03, skip: .4 });
section(Lx(18, 0), Lx(19, -1.7), ['C', 'D', 'Em', 'G'], { pad: .018, bass: 'pulse', arp: pluck, arpV: .04, kick: 2, kickV: .12, hat: .014 });
// G: dawn — G major, warm; the motif comes back and lands
section(Lx(19, -1.7), Lx(20, 0), ['Cmaj7', 'G', 'Am7', 'D'], { pad: .018, ep: .03, bass: 'one' });
section(Lx(20, 0), DUR - 4, ['G', 'D', 'Em', 'C'], { pad: .02, ep: .03, bass: 'pulse', arp: vibe, arpV: .03, oct: 12, kick: 2, kickV: .1, hat: .012 });
pad(DUR - 4, 3.4, CH.Gmaj7, .02); epiano(DUR - 4, 71, .04, -.2, 3); epiano(DUR - 3.98, 74, .03, .2, 3); bass(DUR - 4, 43, .1, 3.2);

// ---------- the recap motif ----------
motif(Lx(10, 12.6)); motif(Lx(18, 8.8), 0, .04); motif(Lx(21, 9.6), 0, .05);

// ---------- stingers on the picture ----------
vibe(.3, 76, .04); vibe(.55, 83, .035);                                                         // iris in
run(Lx(1, 1.6), [52, 55, 59, 64, 67, 71, 76], .55, .035);                                       // tilt up the ramp
vibe(Lx(1, 6.0), 83, .04); vibe(Lx(1, 6.3), 79, .035);                                           // the car, head-down
rim(Lx(2, .6), .03);                                                                            // creak
jet(Lx(2, 3.5), 2.0, .06); whoosh(Lx(2, 3.7), 1.6, .07); kick(Lx(2, 5.25), .22); tom(Lx(2, 5.3), .12);   // let go, fly, land
vibe(Lx(3, 1.3), 76, .035); vibe(Lx(3, 1.6), 81, .035);                                          // ?
whoosh(Lx(4, -2.0), .8, .06);                                                                    // into the tyre
rim(Lx(4, .5), .05); rim(Lx(4, 1.5), .05); vibe(Lx(4, 3.5), 83, .035); tom(Lx(4, 7.9), .14); vibe(Lx(4, 9.2), 86, .03);
run(Lx(5, .8), [64, 67, 71, 76], .3, .03, marimba); rim(Lx(5, 2.9), .04); rim(Lx(5, 3.1), .04); rim(Lx(5, 8.0), .05);
vibe(Lx(6, 6.3), 83, .045);                                                                      // 45°
run(Lx(6, 7.9), [76, 71, 67, 64, 59], .12, .04, marimba); tom(Lx(6, 9.0), .1);                  // it slides off
vibe(Lx(7, 2.4), 79, .035); run(Lx(7, 4.4), [74, 69, 66, 62], .08, .04, marimba); tom(Lx(7, 4.9), .1);
run(Lx(7, 7.5), [71, 67, 64, 59], .07, .035, marimba); tom(Lx(7, 8.0), .08);
whoosh(Lx(8, -1.9), .7, .07);                                                                    // whip up
rim(Lx(8, 4.6), .06); vibe(Lx(8, 4.7), 88, .04); vibe(Lx(8, 8.4), 83, .03);                     // freeze at the top
rim(Lx(9, 3.6), .04);                                                                            // r
run(Lx(9, 8.3), [76, 72, 67, 64, 60], .1, .04); tom(Lx(9, 9.2), .14);                            // the slow car falls
whoosh(Lx(10, -1.1), 1.0, .06); [0, .25, .5].forEach((d, i) => rim(Lx(10, -.35 + d), .035));   // the cards
vibe(Lx(10, 4.0), 79, .03); vibe(Lx(10, 6.0), 83, .03); vibe(Lx(10, 8.3), 86, .03);
whoosh(Lx(11, -2.3), .8, .07);
for (let i = 0; i < 16; i++) marimba(Lx(11, 3.0) + i * .05, [76, 79, 83, 88][i % 4], .02, (i % 5 - 2) * .3);   // the air arrows
whoosh(Lx(12, -1.0), .9, .06); riser(Lx(12, .6), 2.2, .04); rim(Lx(12, 9.2), .05);             // the car slides in; fan
whoosh(Lx(13, -.4), 1.8, .06); vibe(Lx(13, 9.5), 83, .035); run(Lx(13, 10.0), [83, 81, 79], .3, .03, vibe);   // the wall; the gauge
vibe(Lx(13, 12.6), 86, .05); vibe(Lx(13, 12.8), 91, .04);                                        // ✓
run(Lx(14, 4.2), [64, 67, 71, 74, 76, 79], .5, .03, vibe);                                       // into the overhang
whoosh(Lx(15, -1.9), .8, .07);
riser(Lx(15, 6.0), 1.2, .03); jet(Lx(15, 10.6), 3.4, .04);                                        // the needed arrow; wheelspin
riser(Lx(16, .8), 1.8, .04); run(Lx(16, 4.8), [67, 71, 74, 79, 83], .35, .035);                 // fan; the cap rises
kick(Lx(16, 7.2), .22); whoosh(Lx(16, 7.2), 1.2, .08);                                           // launch
whoosh(Lx(17, -1.9), .8, .08);
run(Lx(17, 2.2), [76, 71, 67, 64], .25, .03, vibe);                                               // N fades
jet(Lx(17, 4.4), 5.4, .045); rim(Lx(17, 6.2), .05); rim(Lx(17, 7.3), .05); vibe(Lx(17, 7.4), 83, .035);
whoosh(Lx(17, 9.4), 1.8, .08); kick(Lx(17, 11.2), .22); tom(Lx(17, 11.25), .12);                  // fly, land
jet(Lx(18, 4.5), 2.6, .04); run(Lx(18, 4.6), [67, 71, 74, 79], .12, .035);                        // the hop
riser(Lx(18, 7.4), 3.0, .03);                                                                     // dawn
for (let i = 0; i < 6; i++) pluck(Lx(19, 4.2) + i * .45, [79, 76, 74, 71, 74, 76][i], .025, (i % 3 - 1) * .5);   // the paper skitters
riser(Lx(20, .2), 1.2, .04); jet(Lx(20, 1.0), 6, .035);                                          // lift-off
vibe(Lx(20, 5.6), 83, .04); vibe(Lx(20, 5.8), 86, .035);                                          // caught
vibe(Lx(21, 6.8), 79, .04); vibe(Lx(21, 7.0), 83, .035);                                          // wave
vibe(DUR - 2.6, 79, .035); vibe(DUR - 2.4, 74, .035); vibe(DUR - 2.2, 67, .04);                  // iris out

// ---------- reverb, ducking under the voice, breathing up in the gaps ----------
function verb(x, off) {
  const out = new Float32Array(N), combs = [1201, 1291, 1372, 1453].map(d => ({ d: d + off, b: new Float32Array(d + off), i: 0, s: 0 }));
  for (let n = 0; n < N; n++) { let y = 0; for (const c of combs) { const v = c.b[c.i]; c.s = v * .65 + c.s * .35; c.b[c.i] = x[n] + c.s * .82; c.i = (c.i + 1) % c.d; y += v; } out[n] = y / 4; }
  for (const d of [589 + off, 467 + off]) { const bf = new Float32Array(d); let i = 0; for (let n = 0; n < N; n++) { const v = bf[i], u = out[n] + v * .5; bf[i] = u; out[n] = v - u * .5; i = (i + 1) % d; } }
  return out;
}
function readWav(p) { const b = readFileSync(p); let o = 12, data; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; } const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return s; }
const vo = readWav('assets/roadster_vo.wav');
const vl = verb(Lc, 0), vr = verb(Rc, 29);
let voE = 0, duck = 0, peak = 0;
for (let n = 0; n < N; n++) {
  const a = Math.abs(vo[n] || 0); voE = a > voE ? voE + (a - voE) * .01 : voE * .99985;
  const target = Math.min(1, voE * 12); duck += (target - duck) * (target > duck ? .0008 : .00003);
  const t = n / SR, fade = Math.min(1, t / 1.0) * Math.min(1, (DUR - t) / 1.0), g = fade * (1 - .5 * duck);
  Lc[n] = (Lc[n] + vl[n] * .3) * g; Rc[n] = (Rc[n] + vr[n] * .3) * g; peak = Math.max(peak, Math.abs(Lc[n]), Math.abs(Rc[n]));
}
function writeWav(path, l, r, gain) {
  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(Math.tanh(l(n) * gain) * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(Math.tanh(r(n) * gain) * 32767), 46 + n * 4); }
  writeFileSync(path, buf);
}
const MUSIC = .14 / peak;
writeWav('assets/roadster_bgm.wav', n => Lc[n], n => Rc[n], MUSIC);
writeWav('assets/roadster_mix.wav', n => Lc[n] * MUSIC + (vo[n] || 0) * 1.05, n => Rc[n] * MUSIC + (vo[n] || 0) * 1.05, 1);

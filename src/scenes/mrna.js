// mrna.js: "Pip讲mRNA疫苗", 200.5 s. Pip follows one vaccine mRNA from its design (cap, poly(A), 2P, m1Ψ) through the
// LNP, endosomal escape, translation and trafficking, to its degradation and the immune memory it leaves.
// The cast lives in mrna_kit.js (MK). Timings follow the narration (audio/vo_mrna.mjs → VO_ENV). See storyboards/mrna.md.
(() => {
  const K = MK, C = MK.C;
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const curK = (t, a, b) => ease(seg(t, a, b));

  // ---------- shared props ----------
  // the TLR: a horseshoe of leucine-rich repeats on a stalk from a membrane; it bends toward what it senses
  function sensor(x, y, s, t, o = {}) {
    const al = clamp(o.alarm || 0), reach = o.reach || 0, lean = (o.lean || 0) + .05 * Math.sin(t * 1.3);
    const col = mixCol('#8E9BC4', '#E0604E', al), hx = x + Math.sin(lean) * 120 * s * (1 + reach), hy = y - Math.cos(lean) * 120 * s * (1 + reach);
    boilSeed('tlrS' + (o.key || ''));
    paint(ribbon([[x, y], [lerp(x, hx, .5) + 8 * s, lerp(y, hy, .5)], [hx, hy + 40 * s]], 14 * s, 11 * s), { wash: mixCol(col, PAL.ink, .15), ink: PAL.ink, sw: .9 });
    if (al > .05) glow(hx, hy, 170 * s * (1 + .2 * Math.sin(t * 12)), '#FF8A6A', al * .9);
    const P = [], a0 = (o.open ?? Math.PI) + .42, a1 = a0 + TAU - .84, r = 60 * s;
    for (let i = 0; i <= 18; i++) { const a = lerp(a0, a1, i / 18) + lean; P.push([hx + Math.cos(a) * r, hy + Math.sin(a) * r * .9]); }
    boilSeed('tlrH' + (o.key || ''));
    paint(ribbon(P, 40 * s, 34 * s), { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    for (let i = 1; i < 18; i += 2) { const a = lerp(a0, a1, i / 18) + lean, c = Math.cos(a), sn = Math.sin(a); inkLine([[hx + c * (r - 15 * s), hy + sn * (r - 15 * s) * .9], [hx + c * (r + 15 * s), hy + sn * (r + 15 * s) * .9]], .6, mixCol(col, PAL.ink, .45), 'inkfine', 0); }
    if (al > .1) for (let j = 0; j < 3; j++) { const q = frac(t * 1.6 + j / 3); boilSeed('tlrR' + j); const rr = 70 * s + q * 140 * s, P2 = []; for (let i = 0; i <= 10; i++) { const a = -2.4 + i / 10 * 1.6 + lean; P2.push([hx + Math.cos(a) * rr, hy + Math.sin(a) * rr]); } inkLine(P2, 2.2 * (1 - q) * al + .1, C.red, 'ink', .5); }
    return [hx, hy];
  }
  // a short naked membrane patch (straight), for the TLR to stand on
  const patch = (x0, x1, y, s, key) => K.bilayer(K.track([[x0, y], [x1, y]]), s, { key });

  // =========================== A: inside a cell (0–20.4) ===========================
  const TA = K.track([[-300, 720], [250, 742], [760, 705], [1260, 735], [1760, 700], [2300, 722]]);
  const CODON = .55, RA0 = 2.2, SA0 = 640;                                   // a ratchet: one codon (3 bases) per beat
  const riboA = t => { const n = Math.max(0, t - RA0) / CODON, k = Math.floor(n), f = frac(n); return SA0 + (k + ease(clamp(f * 2.4))) * 75; };
  function chainPts(base, n, fold, seed) {                    // a nascent chain meandering up from the exit tunnel
    const P = [base]; let a = -Math.PI / 2 - .35, p = base;
    for (let j = 1; j < n; j++) { a += .55 * Math.sin(j * .9 + seed) - .06; p = [p[0] + Math.cos(a) * 15, p[1] + Math.sin(a) * 15]; P.push(p); }
    if (fold > 0) {                                            // collapse into a compact globule (hydrophobic collapse)
      let cx = 0, cy = 0; P.forEach(q => { cx += q[0]; cy += q[1]; }); cx /= n; cy /= n; cy -= 20 * fold;
      return P.map((q, j) => { const r = 8.5 * Math.sqrt(j), g = j * 2.4; return [lerp(q[0], cx + Math.cos(g) * r, ease(fold)), lerp(q[1], cy + Math.sin(g) * r, ease(fold))]; });
    }
    return P;
  }
  function beads(P, key) { P.forEach((q, i) => { boilSeed('bd' + key + i); paint(ellPts(q[0], q[1], 7.5, 7.5, 9), { wash: [C.s1, C.s1Lt, C.s2, '#F0C07A'][Math.floor(hash(i * 1.3 + 4) * 4)], ink: PAL.ink, sw: .7 }); }); }
  const PA = [360, 560], UA = 34;
  function shotA(t, lt) {
    K.setT(t);
    const c0 = [800 + 14 * wob(t, .05), 540 + 8 * wob(t, .04), 1.26 + .01 * t];
    const pa = PA[1] + 7 * Math.sin(t * 2.1);
    const HB = [PA[0] - 2.5 * UA, PA[1] - 4.6 * UA], HF = [PA[0] + 2.5 * UA, PA[1] - 4.6 * UA];
    const c = t < 18.9 ? c0 : kf(t, [[18.9, c0], [20.4, [PA[0], PA[1] - 4.6 * UA + 20, 6]]], easeIn);
    cam(c[0], c[1], c[2]);
    K.wash(C.cyto, t, { key: 'a', blob: '#FBEBDD' }); K.cytoplasm(t, { key: 'a', mito: [1350, 1000], er: [1350, 170] }); K.motes(t, 22, mixCol(C.cytoDk, C.cyto, .3), { key: 'a' });
    // the cell's own message, read by a ribosome in codon steps
    const rs = riboA(t), [rx, ry, rang] = TA.at(rs);
    K.strand(TA, { key: 'na', seed: 3, w: 13, step: 25, hi: i => Math.exp(-Math.pow(((i + .5) * 25 - rs) / 34, 2)) });
    const exit = [rx + 36, ry - 128];
    // chain 1 grows until 7.2, folds 7.2–8.4, lets go at 8.9 and drifts off; chain 2 starts then
    const n1 = Math.min(Math.floor(Math.max(0, Math.min(t, 7.2) - RA0) / CODON) + 2, 30);
    if (t < 13) {
      const rel = seg(t, 8.9, 13);
      const at89 = (() => { const [x, y] = TA.at(riboA(8.9)); return [x + 36, y - 128]; })();
      const b = t < 8.9 ? exit : [at89[0] - 300 * ease(rel), at89[1] - 420 * ease(rel)];
      beads(chainPts(b, n1, seg(t, 7.2, 8.4), 1), 'c1');
      if (t > 7.3 && t < 8.9) { boilSeed('foldS'); K.sparkle(b[0] + 20, b[1] - 60, 34, seg(t, 8.3, 8.9)); }
    }
    if (t > 8.9) beads(chainPts(exit, Math.min(Math.floor((t - 8.9) / CODON) + 2, 30), 0, 2), 'c2');
    K.ribosome(rx, ry, rang, 1.5, t, { key: 'ra' });
    // Pip
    let o = K.act(t, [[0, 'wave'], [3.0, 'calm', { lookX: 1, lookY: .7 }], [4.6, 'happy'], [7.25, 'wow', { lookX: .8, lookY: -.2 }], [9.5, 'calm', { lookX: .2 }],
      [10.4, 'idea'], [12.85, 'worried', { lookX: .7, lookY: -.7, emote: null }], [13.65, 'smug', { lookX: .6, lookY: -.6 }], [14.5, 'happy'], [16.75, 'excited', { lookX: .7, lookY: -.6 }], [18.6, 'laugh']]);
    const holding = t > 14.5;
    if (holding) o = { ...o, armF: { at: [2.5, -4.6] }, armB: { at: [-2.5, -4.6] }, armsFront: false };
    K.swim(PA[0], PA[1], UA, t, { ...o, talk: true }, 'pa');
    if (holding) {                                             // the recipe: a short capped, tailed mRNA held up between both hands
      const k = backOut(seg(t, 14.5, 14.9)), dyy = (o.dy || 0) * UA + 7 * Math.sin(t * 2.1);
      const a = [lerp(PA[0], HB[0], k), HB[1] + dyy], b = [lerp(PA[0], HF[0], k), HF[1] + dyy], m = [(a[0] + b[0]) / 2, a[1] + 22 * k];
      boilSeed('rcG'); glow(m[0], m[1], 150 * k, '#FFE7B0', .8);
      if (k > .1) K.strand(K.track([a, m, b], 6), { key: 'rc', seed: 7, w: 7, step: 13, pegLen: 10, pegW: 6, sw: .7, cap: k, capS: .45, tail: k, tailN: 5, bead: 8 });
      if (t < 15.1) { boilSeed('rcS'); K.sparkle(m[0], m[1] - 30, 50, seg(t, 14.5, 15.1)); }
    }
    // the wish: a thought cloud. A virus (no, ✗), then just one of its spikes
    const wk = seg(t, 12.55, 12.95);
    if (wk > 0) {
      const bx = 900, by = 330; boilSeed('cloud');
      paint(ellPts(PA[0] + 150, PA[1] - 250, 13 * wk, 11 * wk, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
      paint(ellPts(PA[0] + 215, PA[1] - 290, 20 * wk, 17 * wk, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
      const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; P.push([bx + Math.cos(a) * 240 * backOut(wk) * (1 + .07 * Math.sin(a * 8)), by + Math.sin(a) * 150 * backOut(wk) * (1 + .07 * Math.sin(a * 8))]); }
      paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
      const vk = backOut(seg(t, 12.8, 13.15)), gone = ease(seg(t, 16.75, 17.5));
      if (vk > .02 && gone < .98) K.virus(bx, by, 78 * vk * (1 - gone), t, { key: 'wv', skip: t > 16.75 ? 2 : undefined, rot: .3 });
      if (t < 15.7) K.cross(bx, by, 210, seg(t, 13.6, 14.0), 'wx');
      if (t > 15.7 && t < 16.3) { boilSeed('wxS'); K.sparkle(bx, by, 60, seg(t, 15.7, 16.3)); }
      if (t > 16.1) {                                           // that one spike: glows, lets go, grows to fill the cloud
        const a = .3 + 2 / 11 * TAU, r0 = 78 * .92, q = ease(seg(t, 16.75, 17.6));
        const p0 = [bx + Math.cos(a) * r0 * (1 - gone), by + Math.sin(a) * r0 * (1 - gone)], p1 = [bx, by + 125];
        const sp = [lerp(p0[0], p1[0], q), lerp(p0[1], p1[1], q)], ang = lerp(a + Math.PI / 2, 0, q);
        K.spike(sp[0], sp[1], lerp(78 / 130, 1.25, q), { ang, key: 'ws', glowK: .9 * seg(t, 16.1, 16.5) });
        if (t > 17.4 && t < 18.2) { boilSeed('wsS'); K.sparkle(bx + 60, by - 90, 40, seg(t, 17.4, 18.2)); }
      }
    }
    const at = toScreen(PA[0], pa - 3 * UA);
    camEnd();
    if (lt < .8) iris(at[0], at[1], kf(lt, [[0, 0], [.15, 190], [.38, 210], [.8, 1700]], easeIn));
    if (t > 19.7) flash(seg(t, 19.7, 20.4) * .95, PAL.cream);
  }

  // =========================== B + C: the blueprint board (20.4–73.6) ===========================
  const TB = K.track([[150, 600], [600, 606], [1050, 596], [1500, 600]]);
  const N5 = 5, NC = 43, STEPB = 26, PRO = [30, 31, 32, 33, 34, 35];
  const SPK = [775, 480];                                      // the spike icon over the coding region
  const TP = K.track([[180, 930], [480, 942], [780, 924], [1000, 934]]);
  const SEN = [1230, 1080];
  function boardPip(t) {                                       // where Pip swims on the board, and which way it faces
    const P = kf(t, [[20.4, [-160, 360]], [21.6, [430, 380]], [24.9, [430, 380]], [26.0, [330, 470]], [28.6, [330, 470]], [29.5, [1660, 480]], [33.2, [1660, 480]], [34.0, [490, 455]],
      [36.2, [490, 455]], [37.2, [1340, 400]], [43.0, [1340, 400]], [43.6, [1250, 330]], [47.5, [1250, 330]], [49.5, [1530, 525]], [72, [1530, 525]]], ease);
    const flip = (t > 24.9 && t < 28.9) || (t > 33.3 && t < 33.9) || t > 36.6;
    return { x: P[0], y: P[1], flip };
  }
  function board(t, lt) {
    K.setT(t);
    let c = kf(t, [[20.4, [825, 600, 3.6]], [22.0, [900, 500, 1.12]], [24.9, [900, 500, 1.12]], [26.0, [330, 520, 1.9]], [28.6, [330, 520, 1.9]], [29.5, [1540, 540, 1.7]],
      [32.3, [1540, 540, 1.7]], [33.1, [960, 540, 1.08]], [33.4, [960, 540, 1.08]], [34.1, [420, 520, 1.8]], [36.2, [420, 520, 1.8]], [37.2, [900, 470, 1.6]], [42.8, [900, 470, 1.6]], [43.6, [820, 420, 1.75]],
      [47.4, [820, 420, 1.75]], [49.4, [900, 720, 1.2]], [60.0, [900, 720, 1.2]], [60.9, [720, 630, 1.9]], [63.9, [720, 630, 1.9]], [64.6, [960, 760, 1.25]],
      [67.9, [960, 760, 1.25]], [68.6, [1260, 560, 1.55]], [72, [1260, 560, 1.55]]], ease);
    cam(c[0] + 6 * wob(t, .06), c[1] + 5 * wob(t, .05), c[2]);
    K.wash(C.board, t, { key: 'b', blob: '#EEF7F3' });
    // faint blueprint grid: this is the design
    boilSeed('grid'); for (let i = 0; i < 9; i++) inkLine([[-200 + i * 300, -200], [-200 + i * 300, 1500]], .5, mixCol(C.boardDk, C.board, .2), 'inkfine', 0);
    for (let j = 0; j < 7; j++) inkLine([[-300, -150 + j * 260], [2300, -150 + j * 260]], .5, mixCol(C.boardDk, C.board, .2), 'inkfine', 0);

    // ---- our strand ----
    const capK = t < 27.95 ? 0 : 1, tailK = ease(seg(t, 29.4, 31.6)), m1 = i => seg(t, 62.2 + i / 51 * 1.5, 62.55 + i / 51 * 1.5);
    const uPulse = (t > 49.8 && t < 51.0) || (t > 60.3 && t < 62.4) ? .5 + .5 * Math.sin(t * 12) : 0;
    const cdsHi = t > 36.4 && t < 37.4 ? .5 + .5 * Math.sin((t - 36.4) * 9) : 0, proHi = t > 37.4 && t < 38.9 ? .6 + .4 * Math.sin(t * 14) : 0;
    const recK = seg(t, 38.8, 39.2);
    const sb = K.strand(TB, { key: 'b', seed: 1, step: STEPB, n5: N5, nc: NC, cap: capK, tail: tailK, tailN: 14, mod: m1,
      hi: i => (i >= N5 && i < NC ? cdsHi : 0) + (PRO.includes(i) ? proHi : 0) + (K.baseOf(i, 1) === 'U' ? uPulse : 0),
      recol: (i, col) => PRO.includes(i) && recK > 0 ? mixCol(col, C.Cb, recK) : col });
    if (t > 27.9 && t < 28.6) { boilSeed('capB'); K.burst(150, 600, 50, seg(t, 27.95, 28.5), PAL.ink, 'cap'); }
    K.endMark('5', 120, 520, 46, seg(t, 28.0, 28.35) * (1 - seg(t, 47.2, 47.5)), PAL.ink, 'b5');
    K.endMark('3', 1530, 520, 46, seg(t, 28.75, 29.1) * (1 - seg(t, 47.2, 47.5)), PAL.ink, 'b3');
    if (t > 32.4 && t < 33.5) { boilSeed('stab'); K.sparkle(150, 560, 40, seg(t, 32.4, 33.2)); K.sparkle(1700, 560, 40, seg(t, 32.6, 33.4)); }
    if (t > 38.8 && t < 39.6) for (let j = 0; j < 2; j++) { boilSeed('proS' + j); const [px, py] = sb.peg(PRO[1 + j * 3]); K.sparkle(px, py + 10, 30, seg(t, 38.8 + j * .12, 39.5 + j * .12)); }
    // codon brackets over the two edited codons
    const brK = seg(t, 37.4, 37.7) * (1 - seg(t, 46.6, 47.0));
    if (brK > 0) for (let j = 0; j < 2; j++) { boilSeed('brk' + j); const x0 = 150 + PRO[j * 3] * STEPB + 4, x1 = 150 + (PRO[j * 3] + 3) * STEPB - 4, y = 668; inkLine([[x0, y - 6], [x0, y], [x1, y], [x1, y - 6]].map(([x, yy]) => [lerp((x0 + x1) / 2, x, backOut(brK)), yy]), 1.6, C.pro, 'ink', 0); }

    // ---- the spike over the coding region ----
    const spK = backOut(seg(t, 22.9, 23.4)) * (1 - ease(seg(t, 46.6, 47.4)));
    if (spK > .02) {
      // a guide line from the coding region to the protein it encodes
      boilSeed('guide'); const g = seg(t, 23.0, 23.6);
      const gx0 = lerp(775, 280, ease(g)), gx1 = lerp(775, 1268, ease(g)); inkLine([[gx0, 566], [gx0, 548], [gx1, 548], [gx1, 566]], 1.6, mixCol(C.s1, PAL.ink, .3), 'inkfine', 0);
      inkLine([[775, 548], [775, 486]], 1.6, mixCol(C.s1, PAL.ink, .3), 'inkfine', 0);
      // after the edit it tries to spring to post-fusion; the prolines hold it
      const tries = t > 40.3 && t < 42.9 ? Math.max(0, Math.sin((t - 40.3) * Math.PI / .65)) * .5 : 0;
      const pins = seg(t, 39.2, 39.6);
      const top = K.spike(SPK[0], SPK[1] - 10 + 20 * (1 - spK), 1.8 * spK, { key: 'bs', post: tries, pins, glowK: 0 });
      if (tries > .15) { boilSeed('pinG'); glow(SPK[0], SPK[1] - 120, 70, '#C9A8FF', tries * 2.4); }
      K.check(SPK[0] + 170, SPK[1] - 210, 80, seg(t, 42.6, 43.0) * (1 - seg(t, 46.4, 46.6)), 'bpre');
      // a neutralising antibody finds the head and binds
      const ak = seg(t, 43.35, 44.35);
      if (ak > 0) {
        const tgt = [top[0], top[1] - 50 * 1.25], p = arcPt([1900, -80], tgt, -120, easeOut(ak)), ang = lerp(-1.6, Math.PI, easeOut(ak));
        const leave = ease(seg(t, 46.6, 47.4));
        K.antibody(p[0], p[1] - 400 * leave, 1.25, ang, { key: 'bab', open: ak < 1 ? 1 : 1 - .3 * Math.exp(-(t - 44.35) * 5) });
        if (t > 44.3 && t < 45.4) { boilSeed('abS'); K.sparkle(top[0] + 50, top[1] - 40, 46, seg(t, 44.35, 45.2)); K.burst(top[0], top[1] - 10, 60, seg(t, 44.35, 44.9), PAL.ink, 'ab'); }
      }
    }

    // ---- ribosomes on our strand ----
    const rk = seg(t, 33.7, 34.5);
    if (rk > 0) {
      const runs = [0, .75, 1.5].map(d => 60 + Math.max(0, t - 66.2 - d) * 260);
      runs.forEach((s, j) => {
        if (j && t < 66.2 + j * .75) return;
        if (s > TB.L + 40) return;
        const [x, y, a] = TB.at(Math.min(s, TB.L)), arr = j ? backOut(seg(t, 66.2 + j * .75, 66.6 + j * .75)) : rk;
        const enter = j ? 0 : (1 - easeOut(rk));
        K.ribosome(x - 160 * enter, y + 160 * enter, a, .82, t, { key: 'rb' + j, k: arr, seed: j,
          chain: s > 80 ? chainPts([x + 22, y - 70], Math.min(12, Math.floor((s - 60) / 40) + 2), 0, j) : null });
      });
      if (rk < 1) { boilSeed('rkS'); K.sparkle(150, 540, 40, rk); }
      // more protein: little spikes rising off the strand
      for (let j = 0; j < 5; j++) { const t0 = 66.7 + j * .28, k = seg(t, t0, t0 + 2.2); if (k <= 0 || k >= 1) continue; K.spike(380 + j * 230, 470 - 420 * easeOut(k), .9 * backOut(seg(t, t0, t0 + .3)), { key: 'pr' + j, ang: .2 * Math.sin(t * 2 + j) }); }
    }

    // ---- C: the foreign RNA, the sensor, inflammation, and the fix ----
    if (t > 48) {
      const pin = ease(seg(t, 51.1, 52.3)), gone = seg(t, 60.0, 61.2);
      patch(940, 1540, SEN[1] + 16, 1.3, 'tlrM');
      if (pin > 0 && gone < 1) {
        const Tp = K.track([[180 - 900 * (1 - pin), 930], [480 - 900 * (1 - pin), 942], [780 - 900 * (1 - pin), 924], [1000 - 900 * (1 - pin), 934]]);
        const hit = seg(t, 54.6, 55.4), stall = seg(t, 59.0, 59.4);
        K.strand(Tp, { key: 'p', seed: 9, step: STEPB, back: '#EDE6DA', crumble: gone, hi: i => K.baseOf(i, 9) === 'U' ? hit * (.5 + .5 * Math.sin(t * 14)) : 0 });
        const rs = 120 + Math.min(t, 59.0) * 0 + (t < 59.0 ? (t - 51.1) * 40 : (59.0 - 51.1) * 40), [x, y, a] = Tp.at(rs);
        if (gone < .5) K.ribosome(x, y, a, .72, t, { key: 'rp', stall: stall, k: 1 - gone * 2 });
      }
      // sensing: the horseshoe leans in, binds the U-rich RNA, alarms; later it can't read ours and dozes
      const alarm = seg(t, 55.3, 55.8) * (1 - seg(t, 60.0, 61.0));
      const lean = kf(t, [[53.5, 0], [54.4, -.75], [59.8, -.75], [60.6, 0], [64.1, 0], [64.7, -.25], [65.7, -.25], [66.2, .1]], ease);
      const reach = kf(t, [[53.5, 0], [54.4, .55], [59.8, .55], [60.6, 0], [64.1, 0], [64.7, 1.75], [65.6, 1.75], [66.3, .1]], ease);
      const shk = alarm * 6 * Math.sin(t * 40);
      const hpos = sensor(SEN[0] + shk, SEN[1], 1.1, t, { key: 'tlr', alarm, lean, reach, open: Math.PI * .95 });
      // inflammation: cytokine puffs fly out
      if (t > 58.2 && t < 61.5) for (let i = 0; i < 14; i++) {
        const k = seg(t, 58.3 + i * .05, 59.8 + i * .05); if (k <= 0 || k >= 1) continue; const a = -Math.PI * (.05 + .9 * hash(i + 3)), d = 80 + 520 * easeOut(k);
        boilSeed('cyt' + i); paint(ellPts(hpos[0] + Math.cos(a) * d, hpos[1] + Math.sin(a) * d, 10 * (1 - k * .5), 10 * (1 - k * .5), 8), { wash: '#E9785F', ink: PAL.ink, sw: .6 });
      }
      if (t > 65.0 && t < 66.6) pipEmote('question', hpos[0] + 80, hpos[1] - 120, 26 * backOut(seg(t, 65.0, 65.3)), 1, 'tq');
      if (t > 66.4) pipEmote('zzz', hpos[0] + 70, hpos[1] - 90, 26 * backOut(seg(t, 66.4, 66.8)), 1, 'tz');
    }

    // ---- Pip ----
    const P = boardPip(t);
    let o = K.act(t, [[20.4, 'wave'], [22.9, 'calm', { lookX: .8, lookY: -.4 }], [25.0, 'smug'], [26.4, 'strain'], [28.0, 'happy'], [29.6, 'laugh', { lookX: -.5, lookY: .7 }], [32.4, 'happy'],
      [33.75, 'wow', { lookX: 1, lookY: .8 }], [34.6, 'happy'], [36.4, 'calm', { lookX: 1, lookY: .4 }], [38.8, 'wow', { lookX: 1, lookY: .7 }], [40.3, 'strain'], [42.6, 'smug'],
      [44.35, 'love'], [46.4, 'happy'], [49.8, 'calm', { lookX: 1, lookY: .5 }], [55.4, 'worried'], [58.4, 'worried', { lookX: 1, lookY: 1 }], [60.3, 'calm', { lookX: 1, lookY: .6 }],
      [62.3, 'wow', { lookX: 1, lookY: .6 }], [64.6, 'smug', { lookX: .6, lookY: 1 }], [66.3, 'happy'], [68.15, 'excited'], [69.1, 'love'], [70.6, 'sing']]);
    const capHold = t > 25.5 && t < 27.65;
    if (capHold || (t > 26.4 && t < 28.0)) o = { ...o, armF: { at: [2.7, -1.4] } };
    if (t > 69.0) o = { ...o, armsFront: true, armF: { at: [.9, -2.0] }, armB: { at: [-.9, -2.0] } };
    const py = K.swim(P.x, P.y, 32, t, { ...o, flip: P.flip, talk: true }, 'pb');
    if (capHold) { const h = K.hand(P.x, py, 32, [2.7, -1.4], { flip: true, dy: o.dy }); K.cap(h[0] - 6, h[1], Math.PI * .1, .9, backOut(seg(t, 25.5, 25.85)), 'held'); if (t < 26.0) { boilSeed('chS'); K.sparkle(h[0], h[1] - 30, 30, seg(t, 25.5, 26.0)); } }
    if (t > 27.65 && t < 27.95) { const h = K.hand(P.x, py, 32, [2.7, -1.4], { flip: true }), q = seg(t, 27.65, 27.95), p = arcPt(h, [150, 600], 40, easeIn(q)); K.cap(p[0], p[1], lerp(.3, 0, q), lerp(.9, 1, q), 1, 'fly'); }
    // the medal falls into Pip's arms
    const mk = seg(t, 68.2, 69.0);
    if (mk > 0) { const dst = [P.x - 6, py - 2.3 * 32 + (o.dy || 0) * 32], p = t < 69.0 ? arcPt([P.x - 300, -250], dst, 120, easeIn(mk)) : dst; K.medal(p[0], p[1], .95, t, 1, 'nb'); if (t > 68.95 && t < 69.8) { boilSeed('mdS'); K.sparkle(dst[0] + 40, dst[1] - 40, 50, seg(t, 69.0, 69.8)); K.burst(dst[0], dst[1], 70, seg(t, 69.0, 69.5)); } }
    camEnd();
    if (t < 20.9) flash(.95 * (1 - seg(t, 20.4, 20.9)), PAL.cream);
    if (t > 73.3) brushWipe((t - 73.3) / .6, [C.extraDk, '#7FA7D0']);
  }

  // =========================== D: outside the cell — fragile, then packed into an LNP (73.6–99.0) ===========================
  const LC = [960, 600], LR = 300, WALL = 1720;
  // the strand's shape: free and wavy, or coiled as a ring inside the particle (similar length, so the bases stay put)
  function dPath(t, dx = 0, cx = LC[0], cy = LC[1], rr = 200, coil = 0) {
    const P = [];
    for (let i = 0; i <= 16; i++) {
      const q = i / 16, fx = 380 + q * 1080 + dx, fy = 560 + 22 * Math.sin(q * 9 + t * 2.3) * (1 - coil);
      const a = -Math.PI * .62 + q * .85 * TAU, r = rr * (1 - .1 * q);
      P.push([lerp(fx, cx + Math.cos(a) * r, ease(coil)), lerp(fy, cy + Math.sin(a) * r, ease(coil))]);
    }
    return K.track(P, 5);
  }
  const ALL = () => 1;
  // ionizable lipids around the coil: heads hugging the backbone, tails pointing into the core
  function ionRing(cx, cy, rr, k, t, o = {}) {
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI * .62 + (i + .5) / 16 * .85 * TAU, r = rr * (1 - .1 * (i + .5) / 16) - 30, q = backOut(seg(k, i / 16 * .5, i / 16 * .5 + .5));
      if (q <= .02) continue;
      const far = 1 + 1.6 * (1 - q), x = cx + Math.cos(a) * r * far, y = cy + Math.sin(a) * r * far;
      boilSeed('ion' + i + (o.key || '')); K.lipid(x, y, a + Math.PI, 1.3, 'ion', { hl: o.hl || 0, plus: o.plus ? seg(o.plus, i / 16 * .5, i / 16 * .5 + .5) : 0 });
    }
  }
  function rnase(x, y, s, t, o = {}) {                           // a ribonuclease: a compact globule with a cleft that chomps
    boilSeed('rn' + (o.key || ''));
    const open = .25 + .3 * Math.max(0, Math.sin(t * 9 + (o.seed || 0))), P = [];
    for (let i = 0; i <= 22; i++) { const a = open + i / 22 * (TAU - 2 * open); P.push([Math.cos(a) * 44 * (1 + .06 * Math.sin(a * 5)), Math.sin(a) * 40]); }
    P.push([6, 0]);
    push(); translate(x, y); rotate(o.rot || 0); scale(s * (o.flip ? -1 : 1), s);
    paint(P, { wash: '#A9B86A', fill: '#7E8C46', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 3; i++) paint(ellPts(-14 + i * 12, -14 + (i % 2) * 22, 5, 4, 8), { fill: '#7E8C46', fillOp: 120, ink: null });   // helices/sheets texture
    pop();
  }
  function shotD(t, lt) {
    K.setT(t);
    const c = kf(t, [[73.6, [960, 560, 1.0]], [76.4, [960, 560, 1.0]], [77.2, [1250, 520, 1.4]], [78.4, [1250, 520, 1.4]], [79.0, [960, 560, 1.12]], [80.8, [960, 560, 1.12]], [81.4, [1330, 560, 1.2]],
      [83.3, [1330, 560, 1.2]], [84.6, [960, 600, 1.25]], [86.8, [960, 600, 1.25]], [87.4, [960, 600, 1.55]], [92.8, [960, 600, 1.55]], [93.4, [960, 600, 1.3]], [94.4, [960, 600, 1.3]], [95.2, [1200, 580, .9]],
      [97.4, [1200, 580, .9]], [98.4, [960, 600, 1.4]]], ease);
    cam(c[0] + 5 * wob(t, .06), c[1] + 4 * wob(t, .05), c[2]);
    K.wash(C.extra, t, { key: 'd', blob: '#E3EEF8' }); K.motes(t, 30, mixCol(C.extraDk, PAL.cream, .2), { key: 'd' });
    // the plasma membrane we can't get through, and its negative surface
    const wallK = seg(t, 80.6, 81.2);
    if (t > 80.4 && t < 84.5) { const wx = WALL + 500 * (1 - easeOut(wallK)) + 500 * easeIn(seg(t, 83.6, 84.4)); K.bilayer(K.track([[wx, -300], [wx, 1400]]), 1.5, { key: 'wall', minus: seg(t, 81.1, 81.6), minusSide: 1 }); }
    // ---- the strand: tremble, get nibbled, show its charge, bounce off; then coil into the particle ----
    const drift = kf(t, [[80.9, 0], [81.75, 150], [82.3, 60], [83.0, 0]], ease) + (t > 81.75 && t < 82.0 ? -14 * Math.sin((t - 81.75) * 40) : 0);
    const coil = seg(t, 83.4, 85.6), tailN = Math.round(kf(t, [[77.5, 14], [78.4, 9]], x => x));
    const T = dPath(t, drift, LC[0], LC[1], 200, coil);
    const plus = seg(t, 87.3, 89.0), ionK = seg(t, 84.4, 86.4);
    const inside = () => {
      K.strand(T, { key: 'd', seed: 1, step: 24, w: 13, cap: 1, tail: 1, tailN, mod: ALL, minus: seg(t, 78.3, 80.2) * (1 - seg(t, 89.5, 90.2)), hi: () => 0 });
      ionRing(LC[0], LC[1], 200, ionK, t, { key: 'd', hl: t > 87.05 && t < 89.8 ? .7 + .3 * Math.sin(t * 10) : 0, plus });
      if (t > 87.3 && t < 89.6) for (let j = 0; j < 4; j++) { boilSeed('pair' + j); const a = -1.4 + j * 1.3; K.burst(LC[0] + Math.cos(a) * 185, LC[1] + Math.sin(a) * 185, 34, seg(t, 87.6 + j * .25, 88.2 + j * .25), C.red, 'pr' + j); }
      // Pip
      const P = kf(t, [[73.6, [260, 430]], [77.1, [260, 430]], [77.7, [1250, 400]], [78.6, [1250, 400]], [79.2, [700, 400]], [81.0, [1160, 420]], [81.75, [1330, 420]], [82.4, [1120, 470]], [83.4, [1120, 470]], [85.4, [LC[0], LC[1] + 60]]], ease);
      const u = lerp(30, 24, seg(t, 83.4, 85.4));
      let o = K.act(t, [[73.6, 'calm', { lookX: 1, lookY: .7 }], [74.4, 'worried'], [76.8, 'worried', { lookX: 1 }], [77.75, 'angry'], [78.6, 'calm', { lookX: 1, lookY: .8 }], [79.6, 'confused'],
        [81.8, 'dizzy'], [83.4, 'calm', { lookX: .5, lookY: -.3 }], [85.6, 'happy'], [87.1, 'wow', { lookX: -.6, lookY: -.4 }], [89.0, 'smug'], [90.3, 'calm', { lookX: .9, lookY: -.6 }],
        [93.2, 'laugh'], [95.0, 'wow', { lookX: 1, lookY: -.2 }], [96.0, 'wave'], [97.6, 'happy']]);
      if (t > 77.75 && t < 78.6) o = { ...o, armF: [1.2 + 1.2 * Math.sin((t - 77.75) * 18), 2.0] };   // shooing
      K.swim(P[0], P[1], u, t, { ...o, flip: t > 79.2 && t < 81.0, talk: true }, 'pd');
    };
    // the LNP builds itself around them
    const lk = seg(t, 83.6, 86.2);
    if (lk > 0) {
      const bump = t > 95.0 ? 30 * spring(t, 95.55, 5, 16) : 0;
      push(); translate(-bump, 0);
      K.lnp(LC[0], LC[1], LR, t, { key: 'our', k: lk, inside, hiShell: t > 90.2 && t < 91.4 ? .7 + .3 * Math.sin(t * 10) : 0, hiChol: t > 91.4 && t < 92.6 ? .7 + .3 * Math.sin(t * 10) : 0, peg: lerp(.25, 1, ease(seg(t, 93.1, 93.9))) });
      pop();
      if (t > 93.1 && t < 94.2) { boilSeed('pegS'); for (let j = 0; j < 3; j++) K.sparkle(LC[0] + Math.cos(j * 2.1) * 370, LC[1] + Math.sin(j * 2.1) * 370, 34, seg(t, 93.2 + j * .15, 93.9 + j * .15)); }
    } else inside();
    // RNases: swim in, one nibbles the poly(A) tail, Pip shoos them
    if (t > 76.4 && t < 81) for (let j = 0; j < 3; j++) {
      const [x0, y0] = [[2100, 300], [2050, 820], [1900, 1150]][j], tgt = [[1560, 520], [1420, 700], [1180, 760]][j];
      const inK = easeOut(seg(t, 76.6 + j * .2, 77.5 + j * .2)), outK = easeIn(seg(t, 77.9 + j * .1, 78.8 + j * .1));
      const p = [lerp(x0, tgt[0], inK) + 700 * outK, lerp(y0, tgt[1], inK) + (j - 1) * 200 * outK];
      rnase(p[0], p[1], 1.2, t, { key: 'r' + j, seed: j * 2, flip: true, rot: outK * 3 });
    }
    // a second particle drifts in and bounces off: PEG keeps them apart
    if (t > 94.2 && t < 98.4) {
      const k = seg(t, 94.2, 95.55), back = seg(t, 95.55, 97.6), x = lerp(2250, 1615, easeOut(k)) + 380 * easeOut(back), y = lerp(250, 520, easeOut(k)) - 150 * easeOut(back);
      K.lnp(x, y, 230, t + 3, { key: 'two', k: 1, peg: 1, inside: () => K.strand(dPath(t + 2, 0, x, y, 140, 1), { key: 'd2', seed: 4, step: 24, w: 11, cap: 1, tail: 0, mod: ALL }) });
      if (t > 95.5 && t < 96.1) { boilSeed('bmp'); K.burst(1330, 560, 70, seg(t, 95.55, 96.1)); }
    }
    const at = toScreen(LC[0], LC[1]);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [C.extraDk, '#7FA7D0']);
    if (t > 98.3) iris(at[0], at[1], kf(t, [[98.3, 1500], [98.75, 260], [98.85, 250], [99.0, 0]], easeIn));
  }

  // =========================== E: the shot, the uptake, the endosome, the escape (99.0–123.0) ===========================
  const NEEDLE = [1010, 600];
  function arm(t) {                                               // the upper arm and shoulder, a simple painted silhouette
    boilSeed('arm'); paint(rectPts(-200, -200, W + 400, H + 400), { wash: '#DCE7EE', ink: null });
    boilSeed('armB'); paint(ellPts(400, 200, 500, 260, 20, 4), { fill: '#EEF4F7', fillOp: 140, bleed: .3, tex: .5, ink: null });
    boilSeed('armS');
    const P = [[-200, 1300], [-200, 330], [200, 250], [560, 300], [900, 430], [1240, 610], [1500, 800], [1700, 1050], [1800, 1300]];
    paint(through(P, 6), { wash: '#F2C6A6', fill: '#DDA07F', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.4 });
    boilSeed('sleeve'); paint(through([[-200, 1300], [-200, 300], [160, 230], [380, 300], [470, 520], [330, 900], [260, 1300]], 6), { wash: '#7FA7D0', fill: '#5E86B5', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.3 });
    inkLine([[700, 520], [800, 600], [860, 720]], 1, '#C98466', 'ink', .6);   // the deltoid's edge
  }
  function syringe(t) {
    const inK = easeOut(seg(t, 99.1, 99.7)), push = ease(seg(t, 99.95, 101.0)), ang = -.72;
    const tip = [NEEDLE[0] + Math.cos(ang) * 330 * (1 - inK), NEEDLE[1] + Math.sin(ang) * 330 * (1 - inK)];
    boilSeed('syr'); push_(tip, ang, push);
  }
  function push_(tip, ang, pk) {
    push(); translate(tip[0], tip[1]); rotate(ang + Math.PI);
    inkLine([[0, 0], [150, 0]], 2.4, '#8D97A3', 'ink', 0);
    paint(rrPts(150, -34, 360, 68, 12), { wash: '#EEF4F8', washOp: 230, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(160 + 330 * pk, -28, 340 - 330 * pk, 56, 8), { wash: '#F6DCC4', ink: null });       // the dose
    paint(rrPts(155 + 330 * pk, -30, 18, 60, 5), { wash: '#6C7480', ink: PAL.ink, sw: .9 });
    paint(rectPts(173 + 330 * pk, -7, 380, 14), { wash: '#A9B1BC', ink: PAL.ink, sw: .9 });
    paint(rrPts(553 + 330 * pk, -46, 22, 92, 6), { wash: '#A9B1BC', ink: PAL.ink, sw: 1 });
    paint(rrPts(500, -56, 18, 112, 6), { wash: '#C9D2DC', ink: PAL.ink, sw: 1 });
    for (let i = 1; i < 6; i++) inkLine([[150 + i * 60, -34], [150 + i * 60, -18]], .8, PAL.ink, 'inkfine', 0);
    pop();
  }
  function muscle(t) {
    boilSeed('mus'); paint(rectPts(-200, -200, W + 400, H + 400), { wash: C.muscle, ink: null });
    for (let i = 0; i < 6; i++) {
      const y = 60 + i * 200, P = []; for (let j = 0; j <= 6; j++) P.push([-200 + j * 400, y + 20 * Math.sin(j * 1.1 + i)]);
      boilSeed('fib' + i); paint(ribbon(P, 150, 150), { wash: mixCol(C.muscle, C.muscleDk, .5), fill: C.muscleDk, fillOp: 60, tex: .5, ink: mixCol(C.muscleDk, PAL.ink, .3), sw: .8 });
      for (let j = 0; j < 22; j++) { const x = -100 + j * 110 + (i % 2) * 40, yy = y + 20 * Math.sin((x + 200) / 400 * 1.1 + i); inkLine([[x, yy - 60], [x + 6, yy + 60]], .8, mixCol(C.muscleDk, PAL.ink, .25), 'inkfine', .3); }
    }
  }
  const smallLnp = (x, y, r, key) => { boilSeed('sl' + key); paint(ellPts(x, y, r, r, 18), { wash: '#F7E8D5', ink: PAL.ink, sw: .8 }); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; paint(ellPts(x + Math.cos(a) * r, y + Math.sin(a) * r, r * .16, r * .16, 6), { wash: C.phos, ink: null }); } inkLine([[x - r * .5, y], [x, y - r * .3], [x + r * .4, y + r * .2]], .9, C.A, 'ink', .6); };
  const ENDO = [960, 560], ER_ = 380;
  function shotE(t, lt) {
    K.setT(t);
    if (t < 101.8) {                                               // the vaccination, outside
      const z = 1 + 7 * easeIn(seg(t, 101.0, 101.8));
      const m = ease(seg(t, 100.4, 101.2)); cam(lerp(860, NEEDLE[0] - 20, m), lerp(560, NEEDLE[1] + 20, m), z);
      arm(t); syringe(t);
      if (t > 100.0) for (let i = 0; i < 6; i++) { boilSeed('dose' + i); const k = seg(t, 100.0 + i * .12, 100.8 + i * .12); if (k > 0 && k < 1) K.sparkle(NEEDLE[0] + (hash(i) - .5) * 50, NEEDLE[1] + 20 + 30 * hash(i + 2) * k, 22, k, '#FFE7B0'); }
      const at = toScreen(NEEDLE[0], NEEDLE[1]);
      camEnd();
      if (lt < .7) iris(at[0] - 180, at[1] - 160, kf(lt, [[0, 0], [.2, 210], [.4, 230], [.7, 1700]], easeIn));
      flash(seg(t, 101.4, 101.8), PAL.cream);
      return;
    }
    if (t < 107.9) {                                               // in the muscle: uptake, the dendritic cell, an endosome forms
      const c = kf(t, [[101.8, [900, 560, 1.0]], [104.0, [900, 560, 1.0]], [104.8, [1050, 560, 1.15]], [106.0, [1050, 560, 1.15]], [107.9, [1210, 560, 3.4]]], ease);
      cam(c[0], c[1], c[2]); muscle(t);
      for (let i = 0; i < 9; i++) {                                // particles spreading from the injection site
        const k = easeOut(seg(t, 101.8 + i * .08, 103.2 + i * .08)), a = -1.2 + i * .32, p = [140 + Math.cos(a) * 640 * k + 30 * wob(t, .2, i), 560 + Math.sin(a) * 420 * k + 20 * wob(t, .15, i)];
        if (i === 3) { const g = seg(t, 102.6, 103.4); if (g < 1) smallLnp(p[0], p[1] - 70 * g, 26 * (1 - g), 'g'); if (g > 0 && g < 1) { boilSeed('gulp'); K.sparkle(p[0], p[1] - 70, 30, g); } continue; }
        if (i === 6) continue;                                       // ours, drawn below
        smallLnp(p[0], p[1], 26, 'e' + i);
      }
      // the DC reaches for ours
      const ours0 = [140 + Math.cos(.72) * 640, 560 + Math.sin(.72) * 420];
      const grab = seg(t, 104.4, 105.4), pull = ease(seg(t, 105.4, 106.6)), ours = [lerp(ours0[0], 1210, pull), lerp(ours0[1] * easeOut(seg(t, 101.8, 103.2)) + 560 * (1 - easeOut(seg(t, 101.8, 103.2))), 560, pull)];
      const dcK = easeOut(seg(t, 103.9, 104.6));
      K.dendritic(1210 + 700 * (1 - dcK), 560, 1.55, t, { key: 'dc', mood: t > 105.4 ? 'happy' : 'calm', lx: -1, reach: [0, 0, 0, 0, 0, 0, 0, 0].map((_, i) => i === 0 ? 2.8 * Math.sin(grab * Math.PI) : 0) });
      const inside = pull > .6;
      if (!inside || pull < 1) { const r = 40 * (1 - .4 * pull); smallLnp(ours[0], ours[1], r, 'ours'); pip(ours[0], ours[1] + r * .4, r * .12, { ...pipFeel(t > 104.4 ? 'worried' : 'calm', t), noShadow: true, key: 'pe0' }); }
      if (pull > .5) { boilSeed('endoP'); paint(ellPts(1210, 560, 62 * ease(seg(pull, .5, 1)), 62 * ease(seg(pull, .5, 1)), 20), { ink: PAL.ink, sw: 1.2, wash: null }); }
      camEnd();
      if (t < 102.3) flash(1 - seg(t, 101.8, 102.3), PAL.cream);
      if (t > 107.4) flash(seg(t, 107.4, 107.9) * .9, '#F8E2CC');
      return;
    }
    // inside the DC: the endosome acidifies, the ionizable lipids turn positive, the membranes merge and tear
    const c = kf(t, [[107.9, [960, 560, 1.3]], [108.6, [960, 560, 1.05]], [110.3, [960, 560, 1.05]], [110.8, [960, 560, 1.4]], [113.9, [960, 560, 1.4]], [114.4, [960, 560, 1.05]], [117.2, [960, 560, 1.05]], [117.8, [1150, 560, 1.25]], [119.2, [1150, 560, 1.25]], [121.6, [1500, 560, 1.15]], [123, [1700, 560, 1.15]]], ease);
    cam(c[0], c[1], c[2]);
    K.wash(mixCol(C.cyto, C.dc, .18), t, { key: 'e', blob: '#FBEBDD' }); K.cytoplasm(t, { key: 'e', col: mixCol(C.cyto, C.dc, .18), mito: [260, 980], er: [1650, 110] });
    const acid = ease(seg(t, 108.6, 110.2)), melt = seg(t, 114.0, 116.8), tear = ease(seg(t, 117.4, 118.2)), out = seg(t, 118.6, 121.2);
    // the endosome: its lumen goes acid; its inner leaflet carries anionic lipids
    boilSeed('lumen'); paint(ellPts(ENDO[0], ENDO[1], ER_ - 18, ER_ - 18, 40), { wash: mixCol('#F3E9DC', C.acid, acid), ink: null });
    const ET = K.track(Array.from({ length: 41 }, (_, i) => { const a = -Math.PI * .5 + i / 40 * TAU; return [ENDO[0] + Math.cos(a) * ER_, ENDO[1] + Math.sin(a) * ER_]; }), 1);
    const gapC = ET.L * .25, gapW = 260 * tear;
    K.bilayer(ET, 1.2, { key: 'endo', gap: tear > 0 ? [gapC - gapW / 2, gapC + gapW / 2] : null, minus: seg(t, 114.2, 114.8) * (1 - seg(t, 117.4, 117.8)), minusSide: 1, jig: q => melt * 8 * Math.sin(q * .05 + t * 9) * (1 - tear),
      cols: (q, sd) => sd > 0 && melt > 0 ? mixCol(C.phos, C.ion, .6 * melt * hash(Math.round(q))) : C.phos });
    // V-ATPase pumps protons in
    for (let j = 0; j < 3; j++) { const a = 2.0 + j * 1.15, px = ENDO[0] + Math.cos(a) * ER_, py = ENDO[1] + Math.sin(a) * ER_; boilSeed('vat' + j); paint(ellPts(px, py, 22, 30, 12, 0, a), { wash: '#9C8BC9', ink: PAL.ink, sw: .9 }); paint(ellPts(px + Math.cos(a) * 30, py + Math.sin(a) * 30, 15, 15, 10, 0, a + t * 6), { wash: '#BBAEE0', ink: PAL.ink, sw: .8 });
      if (t > 108.4 && t < 113.5) for (let m = 0; m < 3; m++) { const q = frac(t * .9 + m / 3 + j * .2); K.charge('+', px - Math.cos(a) * (20 + 150 * q), py - Math.sin(a) * (20 + 150 * q), 20, 1 - seg(q, .8, 1), C.red, 'h' + j + m); } }
    // our particle in the lumen; the shell drains into the endosome membrane, the strand slides out through the tear
    const our = [ENDO[0] - 40, ENDO[1] + 10], R = 210;
    const exitP = ET.at(gapC);
    const inside = () => {
      // the coil slides to the tear, then unspools out through it into the cytosol
      const go = ease(seg(out, 0, .35)), cx = lerp(our[0], exitP[0] - 60, go), cy = lerp(our[1], exitP[1], go);
      const T = dPath(t, exitP[0] + 140 - 380 + 320 * ease(seg(out, .3, 1)), cx, cy, 140, 1 - ease(seg(out, .3, 1)));
      K.strand(T, { key: 'e', seed: 1, step: 24, w: 12, cap: 1, tail: 1, tailN: 9, mod: ALL });
      ionRing(our[0], our[1], 140, 1 - ease(seg(out, 0, .4)), t, { key: 'e', hl: t > 110.4 && t < 111.7 ? .7 + .3 * Math.sin(t * 10) : 0, plus: seg(t, 111.7, 113.4) });
      const pp = kf(t, [[107.9, [our[0], our[1] + 50]], [118.6, [our[0], our[1] + 50]], [119.6, [exitP[0] + 60, exitP[1] - 120]], [121.0, [exitP[0] + 360, exitP[1] - 170]], [123, [exitP[0] + 620, exitP[1] - 170]]], ease);
      const o = K.act(t, [[107.9, 'calm', { lookX: .3, lookY: -.4 }], [108.7, 'worried'], [111.8, 'strain'], [114.1, 'dizzy'], [117.45, 'wow', { lookX: 1, lookY: -.6 }], [118.7, 'excited'], [120.6, 'laugh']]);
      K.swim(pp[0], pp[1], lerp(20, 26, seg(t, 118.6, 119.6)), t, { ...o, talk: true }, 'pe');
    };
    K.lnp(our[0], our[1], R, t, { key: 'e', k: 1 - ease(seg(out, .1, .6)) * 0, inside, peg: 1 - seg(t, 108.6, 110.6) * .7, melt, meltR: ER_ - 30, core: mixCol('#F7E8D5', C.acid, acid * .6) });
    if (t > 117.4 && t < 118.4) { boilSeed('tear'); K.burst(exitP[0], exitP[1], 90, seg(t, 117.45, 118.3)); }
    camEnd();
    if (t < 108.4) flash(.9 * (1 - seg(t, 107.9, 108.4)), '#F8E2CC');
  }

  // =========================== F: translation, the secretory path, and the end of the message (123.0–144.6) ===========================
  const NUC = [60, 640], NR = 360, MEMY = 60;
  const TF0 = [[520, 800], [760, 830], [980, 800], [1160, 815]];
  const ERS = [0, 1, 2].map(j => { const P = []; for (let i = 0; i <= 7; i++) P.push([1230 + i * 85, 560 + j * 90 + 22 * Math.sin(i * .9 + j * 1.3)]); return P; });
  const GOL = [1460, 300];
  function nucleus(t) {
    boilSeed('nucF'); paint(ellPts(NUC[0], NUC[1], NR, NR, 44, 2), { wash: mixCol(C.nuc, PAL.cream, .45), fill: C.nuc, fillOp: 60, tex: .5, ink: null });
    for (let i = 0; i < 6; i++) { boilSeed('chrom' + i); const a = i * 1.05, d = 120 + 90 * hash(i + 4); paint(ellPts(NUC[0] + Math.cos(a) * d, NUC[1] + Math.sin(a) * d, 70 + 30 * hash(i), 44 + 20 * hash(i + 1), 14, 4, a), { fill: mixCol(C.nuc, C.nucDk, .6), fillOp: 90, bleed: .2, tex: .6, ink: null }); }
    boilSeed('chromL'); for (let i = 0; i < 3; i++) { const P = []; for (let j = 0; j < 5; j++) { const a = i * 2.1 + j * .7, d = 60 + 170 * (j / 4); P.push([NUC[0] + Math.cos(a) * d * .9, NUC[1] + Math.sin(a) * d * .9]); } inkLine(P, 1.2, mixCol(C.nucDk, C.nuc, .3), 'inkfine', .8); }
    paint(ellPts(NUC[0] - 60, NUC[1] + 40, 80, 70, 18), { fill: C.nucDk, fillOp: 140, bleed: .1, ink: null });                // nucleolus
    const pores = [-1.0, -.5, 0, .5, 1.0];
    boilSeed('env');
    for (const r of [NR, NR + 18]) for (let k = 0; k <= pores.length; k++) {
      const a0 = k ? pores[k - 1] + .07 : -2.6, a1 = k < pores.length ? pores[k] - .07 : 2.6, P = [];
      for (let i = 0; i <= 8; i++) { const a = lerp(a0, a1, i / 8); P.push([NUC[0] + Math.cos(a) * r, NUC[1] + Math.sin(a) * r]); }
      inkLine(P, 2.2, C.nucDk, 'ink', .5);
    }
    for (const a of pores) { const x = NUC[0] + Math.cos(a) * (NR + 9), y = NUC[1] + Math.sin(a) * (NR + 9); paint(ellPts(x, y, 10, 22, 10, 0, a), { wash: mixCol(C.nucDk, PAL.cream, .3), ink: PAL.ink, sw: .7 }); }
  }
  function erGolgi(t, lumenSpike) {
    ERS.forEach((P, j) => { boilSeed('erF' + j); paint(ribbon(P, 44, 44), { wash: C.er, fill: C.erDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1 });
      for (let i = 0; i < 7; i++) { const [x, y] = P[i]; paint(ellPts(x + 40, y - 26, 8, 7, 8), { wash: C.riboL, ink: PAL.ink, sw: .5 }); } });
    if (lumenSpike > 0) K.spike(1450, 586, .45 * backOut(clamp(lumenSpike)), { key: 'erS', ang: Math.PI / 2, glowK: .5 * clamp(lumenSpike) });
    for (let j = 0; j < 4; j++) { boilSeed('gol' + j); const P = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.15 + .7 * i / 8); P.push([GOL[0] + Math.cos(a) * (150 - j * 18), GOL[1] + 170 + Math.sin(a) * (150 - j * 18) + j * 34]); } paint(ribbon(P, 26, 26), { wash: C.golgi, fill: C.golgiDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: .9 }); }
  }
  function vesicle(x, y, r, key, cargo = true) { boilSeed('ves' + key); paint(ellPts(x, y, r, r, 18), { wash: '#FBEFE0', ink: PAL.ink, sw: 1 }); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; paint(ellPts(x + Math.cos(a) * r, y + Math.sin(a) * r, 4, 4, 6), { wash: C.phos, ink: null }); } if (cargo) K.spike(x, y + r * .55, r / 150, { key: 'vs' + key }); }
  function shotF(t, lt) {
    K.setT(t);
    const c = kf(t, [[123.0, [820, 640, 1.05]], [127.6, [960, 640, 1.05]], [128.6, [1200, 560, 1.1]], [130.1, [1250, 420, 1.1]], [131.4, [1300, 360, 1.15]], [132.6, [1300, 360, 1.15]], [133.8, [560, 640, 1.2]],
      [140.2, [560, 640, 1.2]], [141.4, [800, 500, .92]], [144.6, [800, 500, .92]]], ease);
    cam(c[0] + 4 * wob(t, .06), c[1] + 4 * wob(t, .05), c[2]);
    const night = t > 140.5 && t < 141.9 ? Math.max(0, Math.sin((t - 140.5) / 1.4 * 3 * Math.PI)) : 0;
    K.wash(mixCol(C.cyto, C.dc, .18), t, { key: 'f', blob: '#FBEBDD' }); K.cytoplasm(t, { key: 'f', col: mixCol(C.cyto, C.dc, .18), mito: [760, 1130], er: false, ribos: 18 });
    nucleus(t);
    erGolgi(t, seg(t, 128.4, 128.9) * (1 - seg(t, 129.2, 129.5)));
    // the plasma membrane overhead, and what ends up in it
    K.bilayer(K.track([[-500, MEMY], [700, MEMY - 20], [1900, MEMY], [2600, MEMY - 10]]), 1.3, { key: 'pm' });
    for (let j = 0; j < 3; j++) { const k = seg(t, 131.2 + j * .15, 131.6 + j * .15); if (k > 0) K.spike(1380 + j * 90, MEMY - 30 + 30 * (1 - backOut(k)), .9 * backOut(k), { key: 'sf' + j, ang: (j - 1) * .12 + .03 * Math.sin(t + j) }); }
    // vesicles: ER → Golgi → membrane
    const v1 = seg(t, 129.2, 130.2), v2 = seg(t, 130.3, 131.2);
    if (v1 > 0 && v1 < 1) { const p = arcPt([1460, 560], [GOL[0], GOL[1] + 120], 60, ease(v1)); vesicle(p[0], p[1], 36 * backOut(seg(v1, 0, .25)), 'a'); }
    if (v2 > 0 && v2 < 1) { const p = arcPt([GOL[0], GOL[1] + 10], [1470, MEMY + 40], 30, ease(v2)); vesicle(p[0], p[1], 36 * (1 - seg(v2, .85, 1)) * backOut(seg(v2, 0, .25)), 'b'); }
    if (t > 131.1 && t < 131.8) { boilSeed('fuse'); K.burst(1470, MEMY + 10, 80, seg(t, 131.15, 131.8)); }
    // the message slides in (it just escaped), is read, keeps out of the nucleus, and is broken down
    const slide = easeOut(seg(t, 123.0, 124.0)), bump = kf(t, [[136.0, 0], [136.5, 1], [136.75, .7], [137.3, 0]], ease) + .12 * spring(t, 136.5, 7, 30);
    const P = TF0.map(([x, y], i) => [x - 700 * (1 - slide) - (i === 0 ? 55 : i === 1 ? 20 : 0) * bump, y - (i === 0 ? 150 : i === 1 ? 50 : 0) * bump + 10 * Math.sin(t * 1.5 + i)]);
    const TF = K.track(P, 8), cr = seg(t, 141.7, 143.6);
    K.strand(TF, { key: 'f', seed: 1, step: 24, w: 12, cap: 1, tail: 1, tailN: 9, mod: ALL, crumble: cr });
    if (t > 136.4 && t < 137.5) { boilSeed('poreB'); K.burst(NUC[0] + NR + 30, NUC[1] + 20, 50, seg(t, 136.5, 137.2)); }
    K.cross(NUC[0] + NR + 20, NUC[1] - 90, 90, seg(t, 136.6, 137.0) * (1 - seg(t, 141.3, 141.6)), 'pore');
    // the ribosome: assembles on the cap, runs, its chain threads into the ER
    const rk = seg(t, 123.8, 124.5);
    if (rk > 0 && cr < .3) {
      const rs = 55 + Math.max(0, Math.min(t, 129.6) - 125.4) * 120, [x, y, a] = TF.at(rs);
      const exit = [x + 24, y - 72], entry = [1225, 572], nIn = Math.max(0, Math.floor((t - 127.9) / .22)), n = Math.min(14, Math.floor(Math.max(0, t - 125.5) / .3) + 1);
      const path = []; for (let j = 0; j < n; j++) { const q = j / Math.max(1, n - 1); path.push(t > 127.6 ? arcPt(exit, entry, 70, q * ease(seg(t, 127.6, 128.3)) + q * 0) : [exit[0] - j * 6, exit[1] - j * 13 + 6 * Math.sin(j)]); }
      if (t > 128.3) { path.length = 0; for (let j = 0; j <= 12; j++) path.push(arcPt(exit, entry, 70, j / 12)); }
      K.ribosome(x - 200 * (1 - easeOut(rk)), y + 120 * (1 - easeOut(rk)), a, .9, t, { key: 'rf', k: rk });
      if (path.length > 1) beads(path.slice(0, Math.max(1, path.length - (t > 128.3 ? nIn % 3 : 0))), 'fc');
      if (t > 124.4 && t < 125.2) { boilSeed('rfS'); K.sparkle(TF.at(0)[0], TF.at(0)[1] - 40, 40, seg(t, 124.4, 125.2)); }
    }
    // no reverse transcriptase: a dashed ghost of one, struck out
    const gk = seg(t, 137.6, 138.0) * (1 - seg(t, 140.4, 140.8));
    if (gk > 0) {
      boilSeed('ghost'); const gx = 830, gy = 590, q = backOut(gk), P = [];
      // a polymerase 'right hand' (fingers, palm, thumb) as a dashed outline: the enzyme that isn't there
      for (let i = 0; i <= 48; i++) { const a = Math.PI * .2 + i / 48 * Math.PI * 1.6, r = 120 * (1 + .18 * Math.sin(a * 3)); P.push([gx + Math.cos(a) * r * q, gy + Math.sin(a) * r * .8 * q]); }
      paint(P, { wash: PAL.cream, washOp: 90, ink: null });
      for (let i = 0; i < P.length - 1; i += 2) inkLine([P[i], P[i + 1]], 3, mixCol(PAL.ink, C.cyto, .35), 'ink', 0);
      K.cross(gx, gy, 170, seg(t, 138.3, 138.6), 'rt');
    }
    // Pip
    const pp = kf(t, [[123.0, [-200, 520]], [123.9, [640, 470]], [129.6, [640, 470]], [130.4, [1120, 330]], [132.6, [1120, 330]], [133.6, [760, 470]], [144.6, [760, 470]]], ease);
    let o = K.act(t, [[123.0, 'excited'], [123.8, 'calm', { lookX: -1, lookY: .9 }], [125.4, 'happy'], [127.9, 'wow', { lookX: 1, lookY: .3 }], [129.3, 'calm', { lookX: 1, lookY: -.6 }], [131.2, 'excited'],
      [132.8, 'calm', { lookX: -1, lookY: .4 }], [136.5, 'confused'], [137.9, 'smug', { lookX: .5 }], [140.6, 'sleepy'], [141.8, 'sad', { lookY: .8 }], [143.0, 'cry']]);
    if (t > 133.9 && t < 136.3) o = { ...o, armF: [-.3, 2.1] };                       // pointing at the nucleus
    if (t > 142.4) o = { ...o, armF: [1.2 + .4 * Math.sin((t - 142.4) * 9), 1.8] };       // goodbye
    K.swim(pp[0], pp[1], 28, t, { ...o, flip: t > 132.8 && t < 137.6 || t > 141.6, talk: true }, 'pf');
    camEnd();
    if (night > 0) flash(.35 * night, '#2B2350');
    if (t > 144.3) brushWipe((t - 144.3) / .6, [C.lymphDk, '#A9BF6A']);
  }

  // =========================== G: the lymph node (144.6–180.8) ===========================
  const DCG = [700, 600], THG0 = [1500, 600], BG = [2600, 620], VAC = [4300, 640], CTLG0 = [5300, 640];
  function lymph(t) {
    K.wash(C.lymph, t, { key: 'g', blob: '#F2F5DE', n: 0, rect: rectPts(-2400, -1600, 10000, 4400) });
    for (let i = 0; i < 9; i++) { boilSeed('fol' + i); const x = -400 + i * 700 + 120 * hash(i), y = 200 + 700 * hash(i + 3); paint(ellPts(x, y, 380, 260, 22, 6), { fill: mixCol(C.lymph, C.lymphDk, .7), fillOp: 110, bleed: .25, tex: .5, ink: mixCol(C.lymphDk, C.lymph, .3), sw: .8 }); }
    for (let i = 0; i < 26; i++) { boilSeed('lc' + i); const x = -300 + hash(i + 60) * 6200 + 20 * wob(t, .1, i * .2), y = hash(i + 61) * 1200; paint(ellPts(x, y, 22, 22, 12), { wash: mixCol(C.lymph, PAL.cream, .4), ink: mixCol(C.lymphDk, PAL.ink, .2), sw: .6 }); }
  }
  const cellBlink = (t, s) => K.blinkAt(t, s);
  function shotG(t, lt) {
    K.setT(t);
    const c = kf(t, [[144.6, [960, 560, 1.0]], [156.5, [960, 560, 1.0]], [157.5, [2620, 560, 1.0]], [166.2, [2620, 560, 1.0]], [167.2, [4420, 600, 1.0]], [174.4, [4420, 600, 1.0]], [175.6, [3300, 600, .48]], [180.8, [3420, 600, .5]]], ease);
    const whip = easeIn(seg(t, 180.2, 180.8));
    cam(c[0] + 2600 * whip + 6 * wob(t, .06), c[1] + 4 * wob(t, .05), c[2]);
    lymph(t);
    // ---- area 1: the DC presents on MHC II; a helper T cell docks ----
    const dcIn = easeOut(seg(t, 147.9, 149.4)), dx = DCG[0] - 700 * (1 - dcIn);
    K.dendritic(dx, DCG[1], 1.25, t, { key: 'gdc', mood: t > 155.4 ? 'happy' : 'calm', lx: 1, seed: 1, arms: [[-2.7, 1], [-2.1, 1.1], [-1.45, .9], [1.45, .9], [2.1, 1.05], [2.75, 1], [3.14, .9]] });
    const cupR = 78 * 1.25;
    [-.6, 0, .6].forEach((a, i) => K.mhc(dx + Math.cos(a) * cupR, DCG[1] + Math.sin(a) * cupR, 1.6, a + Math.PI / 2, 2, { key: 'g2' + i, pep: seg(t, 149.6 + i * .15, 150.0 + i * .15) }));
    if (t > 152.3 && t < 154.3) { boilSeed('mhcG'); glow(dx + cupR + 40, DCG[1], 120, '#FFE09A', .7 * Math.sin(seg(t, 152.3, 154.3) * Math.PI)); }
    const thK = ease(seg(t, 154.4, 155.4)), thX = kf(t, [[154.4, THG0[0]], [155.4, dx + cupR + 80 + 46 + 90], [157.4, dx + cupR + 80 + 46 + 90], [160.4, BG[0] - 100 - 96]], ease);
    const thY = kf(t, [[157.4, DCG[1]], [160.4, BG[1] + 20]], ease);
    const thP = [thX, thY], thAct = seg(t, 155.4, 155.8);
    K.cell(thP[0], thP[1], 90, mixCol(C.th, '#A6D3F2', thAct), C.thDk, t, { key: 'th', mood: t > 160.5 ? 'happy' : t > 155.4 ? 'wow' : 'calm', lx: -1, seed: 2, sq: .1 * spring(t, 155.4, 6, 20) + .1 * spring(t, 160.5, 6, 20) + .03 * Math.sin(t * 3),
      extras: () => { for (const a of [Math.PI, Math.PI - .5, Math.PI + .5, -.3]) K.tcr(thP[0] + Math.cos(a) * 90, thP[1] + Math.sin(a) * 90, 1.3, a + Math.PI / 2, { key: 'tt' + a }); } });
    if (t > 155.3 && t < 156.2) { boilSeed('synG'); K.burst(dx + cupR + 80, DCG[1], 70, seg(t, 155.4, 156.1), PAL.ink, 'syn'); K.sparkle(dx + cupR + 80, DCG[1] - 80, 46, seg(t, 155.4, 156.2), PIPC.gold); }
    // ---- area 2: a B cell grabs whole spike, gets T-cell help, becomes a plasma cell ----
    const plasma = ease(seg(t, 162.0, 163.6)), bR = lerp(96, 128, plasma);
    const bcol = mixCol(C.bc, '#B7E0C2', plasma);
    const free = seg(t, 157.1, 158.8), sp = arcPt([BG[0] + 500, -250], [BG[0] + 4, BG[1] - bR - 70], -80, easeOut(free));
    K.cell(BG[0], BG[1], bR, bcol, C.bcDk, t, { key: 'b', mood: t > 160.5 ? 'happy' : t > 158.8 ? 'wow' : 'calm', lx: .2, ly: -1, seed: 3, sq: .1 * spring(t, 158.8, 6, 20) + .12 * spring(t, 160.5, 6, 18),
      extras: () => { for (const a of [-Math.PI / 2, -2.3, -.85, -2.9, -.2, .5, 2.6]) K.bcr(BG[0] + Math.cos(a) * bR, BG[1] + Math.sin(a) * bR, 1.15, a + Math.PI / 2, { key: 'br' + a }); if (plasma > 0) for (let j = 0; j < 4; j++) { const P = []; for (let i = 0; i <= 8; i++) { const a = -2.4 + i / 8 * 1.6; P.push([BG[0] + 20 + Math.cos(a) * (40 + j * 18) * plasma, BG[1] + 30 + Math.sin(a) * (40 + j * 18) * plasma]); } inkLine(P, 1.4, mixCol(C.er, PAL.ink, .2), 'ink', .5); } } });
    if (t > 157.0 && t < 166.4) K.spike(sp[0], sp[1], 1.0, { key: 'bsp', ang: lerp(.8, Math.PI, easeOut(free)) });
    if (t > 158.7 && t < 159.6) { boilSeed('bS'); K.sparkle(BG[0] + 60, BG[1] - bR - 60, 44, seg(t, 158.8, 159.6)); }
    if (t > 160.4 && t < 161.3) { boilSeed('helpS'); K.burst(BG[0] - bR - 10, BG[1] + 10, 70, seg(t, 160.5, 161.2), PAL.ink, 'help'); K.sparkle(BG[0] - bR, BG[1] - 60, 44, seg(t, 160.5, 161.3), PIPC.gold); }
    for (let i = 0; i < 12; i++) {                                  // antibodies pour out
      const t0 = 163.9 + i * .2, k = seg(t, t0, t0 + 2.2); if (k <= 0 || k >= 1) continue;
      const a = -1.2 + (hash(i + 7) - .5) * 1.9, d = bR + 40 + 900 * easeOut(k);
      K.antibody(BG[0] + Math.cos(a) * d, BG[1] + Math.sin(a) * d, .85 * backOut(seg(k, 0, .15)), a + Math.PI / 2 + 2 * k * (hash(i) - .5), { key: 'ga' + i });
    }
    // ---- area 3: a vaccinated cell shows a fragment on MHC I; a killer T cell docks ----
    K.cell(VAC[0], VAC[1], 130, mixCol(C.cyto, C.dc, .25), C.cytoDk, t, { key: 'vac', mood: 'calm', lx: 1, seed: 4,
      extras: () => { [-2.0, -1.57, -1.14].forEach((a, j) => K.spike(VAC[0] + Math.cos(a) * 130, VAC[1] + Math.sin(a) * 130, .7, { key: 'vs' + j, ang: a + Math.PI / 2 })); } });
    K.mhc(VAC[0] + 130, VAC[1], 1.3, Math.PI / 2, 1, { key: 'g1', pep: seg(t, 170.0, 170.5) });
    if (t > 169.6 && t < 171.4) { boilSeed('m1G'); glow(VAC[0] + 180, VAC[1], 110, '#FFE09A', .7 * Math.sin(seg(t, 169.6, 171.4) * Math.PI)); }
    const ctlX = kf(t, [[171.6, CTLG0[0]], [172.3, VAC[0] + 130 + 65 + 46 + 86]], ease);
    K.cell(ctlX, CTLG0[1], 86, C.ctl, C.ctlDk, t, { key: 'ctl', mood: 'determined', lx: -1, seed: 5, sq: .12 * spring(t, 172.3, 5, 18) + (t > 172.8 && t < 174.2 ? .06 * Math.sin((t - 172.8) * 18) : 0),
      extras: () => { for (const a of [Math.PI, Math.PI - .55, Math.PI + .55]) K.tcr(ctlX + Math.cos(a) * 86, CTLG0[1] + Math.sin(a) * 86, 1.3, a + Math.PI / 2, { key: 'ct' + a }); } });
    if (t > 172.2 && t < 173.1) { boilSeed('ctlS'); K.burst(VAC[0] + 200, VAC[1], 70, seg(t, 172.3, 173.0), PAL.ink, 'ctl'); }
    // ---- memory: pale, glowing cells that stay, each keeping a small spike ----
    [[BG[0] - 260, 980, C.bc, 0], [BG[0] + 300, 1000, C.bc, 1], [THG0[0] + 520, 220, C.th, 2], [CTLG0[0] - 200, 1000, C.ctl, 3], [VAC[0] - 560, 200, C.th, 4]].forEach(([x, y, col, i]) => {
      const k = seg(t, 175.6 + i * .35, 176.1 + i * .35); if (k <= 0) return;
      boilSeed('memG' + i); glow(x, y, 190, '#FFF0C0', .9 * k);
      K.cell(x, y - 30 * (1 - backOut(k)), 70 * backOut(k), mixCol(col, PAL.cream, .45), col, t, { key: 'mem' + i, mood: t > 177.5 + i * .2 ? 'sleepy' : 'happy', seed: i, nucleus: false,
        extras: () => K.spike(x + 50, y - 50, .45 * backOut(k), { key: 'mt' + i, ang: .5 }) });
    });
    // Pip, riding along
    const pp = kf(t, [[144.6, [1180, 380]], [156.6, [1180, 380]], [157.6, [2950, 400]], [166.3, [2950, 400]], [167.2, [3980, 420]], [174.6, [3980, 420]], [175.6, [3400, 600]]], ease);
    const o = K.act(t, [[144.6, 'excited'], [146.4, 'calm', { lookX: -1, lookY: .5 }], [149.6, 'wow', { lookX: -1, lookY: .6 }], [151.3, 'calm', { lookX: -1, lookY: .7 }], [155.45, 'laugh'], [157.4, 'calm', { lookX: -1, lookY: .4 }],
      [158.85, 'wow', { lookX: -1, lookY: .6 }], [160.6, 'happy'], [164.0, 'excited'], [166.7, 'calm', { lookX: 1, lookY: .7 }], [170.1, 'idea'], [172.35, 'wow', { lookX: 1, lookY: .8 }], [173.3, 'smug'], [175.6, 'shy'], [177.4, 'love']]);
    K.swim(pp[0], pp[1], lerp(34, 50, seg(t, 174.6, 175.6)), t, { ...o, flip: (t > 146 && t < 166.4), talk: true }, 'pg');
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [C.lymphDk, '#A9BF6A']);
    if (whip > 0) speed(whip);
  }
  function speed(k) { for (let i = 0; i < 10; i++) { boilSeed('spd' + i); const y = 60 + i * 110 + 30 * hash(i), x = hash(i + 4) * W; inkLine([[x - 360 * k, y], [x + 360 * k, y]], 2.6, PAL.cream, 'dry', 0); } }

  // =========================== H: the real virus, then home (180.8–200.5) ===========================
  const SURF = 880, VH0 = [1150, -300];
  function epithelium(t) {
    K.wash('#D6E9E6', t, { key: 'h', blob: '#EEF6F4', n: 4 });
    boilSeed('epi'); const P = [[-300, 1400], [-300, SURF]]; for (let i = 0; i <= 12; i++) P.push([-300 + i * 220, SURF + 26 * Math.sin(i * 1.7) + 10 * (i % 2)]); P.push([2400, 1400]);
    paint(P, { wash: '#F2C7BC', fill: '#DE9E90', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.3, curv: .2 });
    for (let i = 0; i < 11; i++) inkLine([[-80 + i * 220, SURF + 40], [-60 + i * 220, 1300]], 1.1, mixCol('#DE9E90', PAL.ink, .3), 'ink', .3);
    for (let i = 0; i < 17; i++) { const x = -60 + i * 130, y = SURF + 26 * Math.sin((x + 300) / 220 * 1.7) - 6; boilSeed('ace' + i);   // ACE2: a stalk and a claw-like peptidase domain
      paint(ribbon([[x, y], [x + 4, y - 40]], 9, 8), { wash: mixCol(C.ace, PAL.ink, .15), ink: PAL.ink, sw: .7 }); paint(ellPts(x + 6, y - 56, 18, 15, 12, 0, .3), { wash: C.ace, ink: PAL.ink, sw: .8 }); }
  }
  function shotH(t, lt) {
    K.setT(t);
    if (t < 192.1) {
      const c = kf(t, [[180.8, [960, 560, 1.0]], [183.2, [960, 560, 1.0]], [184.0, [960, 520, 1.25]], [185.4, [960, 520, 1.25]], [186.0, [960, 600, 1.05]], [188.2, [960, 600, 1.05]], [188.9, [800, 560, 1.0]]], ease);
      const whipIn = 1 - easeOut(seg(t, 180.8, 181.3));
      cam(c[0] - 2600 * whipIn, c[1], c[2]);
      epithelium(t);
      // the virus drifts down to the surface; antibodies coat it; it can't dock; it's cleared
      const v = kf(t, [[181.4, VH0], [183.2, [1000, 470]], [185.6, [1000, 470]], [186.35, [1000, 640]], [186.9, [1000, 420]], [190.3, [1020, 400]], [191.4, [1500, -300]]], ease);
      const coat = seg(t, 183.3, 185.3);
      K.virus(v[0], v[1], 120 * (1 - .6 * seg(t, 190.3, 191.4)), t, { key: 'h', coat, rot: t * .2 });
      for (let i = 0; i < 6; i++) { const k = seg(t, 183.2 + i * .15, 183.9 + i * .15); if (k <= 0 || k >= 1) continue; const p = arcPt([-200, 200 + i * 90], [v[0], v[1]], 60, easeIn(k)); K.antibody(p[0], p[1], .8, k * 3 + i, { key: 'fa' + i }); }
      if (t > 186.3 && t < 187.1) { boilSeed('bounce'); K.burst(1000, SURF - 90, 90, seg(t, 186.35, 187.0)); }
      K.check(1300, 560, 110, seg(t, 186.9, 187.3) * (1 - seg(t, 189.8, 190.1)), 'h');
      if (t > 190.3) { boilSeed('clr'); K.sparkle(v[0], v[1], 90, seg(t, 190.4, 191.3)); }
      // memory cells wake and multiply: 1 → 2 → 4 → 8
      for (let i = 0; i < 8; i++) {
        const gen = i === 0 ? 0 : i < 2 ? 1 : i < 4 ? 2 : 3, k = gen ? seg(t, 188.4 + gen * .5, 188.75 + gen * .5) : seg(t, 187.6, 188.0); if (k <= 0) continue;
        const x = 160 + (i % 4) * 130 + (i >= 4 ? 60 : 0), y = 240 + Math.floor(i / 4) * 140 + 8 * Math.sin(t * 3 + i);
        boilSeed('mh' + i); glow(x, y, 110, '#FFF0C0', .7 * k);
        K.cell(x, y, 54 * backOut(k), mixCol(i % 2 ? C.bc : C.ctl, PAL.cream, .35), i % 2 ? C.bc : C.ctl, t, { key: 'mh' + i, mood: 'determined', seed: i, nucleus: false, lx: 1 });
      }
      const pp = kf(t, [[180.8, [1620, 600]], [191.4, [1620, 600]]], ease);
      const o = K.act(t, [[180.8, 'calm', { lookX: 1, lookY: -.7 }], [181.6, 'angry'], [183.4, 'wow', { lookX: -1, lookY: -.3 }], [184.6, 'smug', { lookX: -1 }], [186.4, 'laugh'], [188.45, 'excited'], [190.4, 'happy']]);
      K.swim(pp[0], pp[1], 30, t, { ...o, flip: true, talk: true }, 'ph');
      camEnd();
      if (t > 191.5) brushWipe((t - 191.5) / .6, [C.cytoDk, '#E7A98A']);
      return;
    }
    // home: the cytoplasm of the opening, the recipe gone, the memory kept
    const tt = t - 190;
    cam(800 + 14 * wob(t, .05), 540 + 8 * wob(t, .04), 1.28 + .004 * (t - 192));
    K.wash(C.cyto, t, { key: 'a', blob: '#FBEBDD' }); K.cytoplasm(t, { key: 'a', mito: [1350, 1000], er: [1350, 170] }); K.motes(t, 22, mixCol(C.cytoDk, C.cyto, .3), { key: 'a' });
    const rs = riboA(tt), [rx, ry, rang] = TA.at(rs);
    K.strand(TA, { key: 'na', seed: 3, w: 13, step: 25, hi: i => Math.exp(-Math.pow(((i + .5) * 25 - rs) / 34, 2)) });
    beads(chainPts([rx + 36, ry - 128], Math.min(Math.floor(Math.max(0, tt - RA0) / CODON) + 2, 26), 0, 3), 'hc');
    K.ribosome(rx, ry, rang, 1.5, t, { key: 'ra' });
    let o = K.act(t, [[192.1, 'calm', { lookY: .9, lookX: .3 }], [192.9, 'sad', { lookY: .9 }], [194.95, 'wow', { lookX: .7, lookY: -.6 }], [196.45, 'love'], [197.6, 'wave'], [199.0, 'happy']]);
    if (t < 194.9) o = { ...o, armF: { at: [2.5, -4.0] }, armB: { at: [-2.5, -4.0] } };               // empty hands, where the recipe was
    const py = K.swim(PA[0], PA[1], UA, t, { ...o, talk: true }, 'pa');
    if (t > 193.0 && t < 194.4) for (let j = 0; j < 4; j++) { boilSeed('dust' + j); K.sparkle(PA[0] + (j - 1.5) * 50, PA[1] - 4.4 * UA - 60 * seg(t, 193.0 + j * .1, 194.4), 22, seg(t, 193.0 + j * .1, 194.4), '#FFE7B0'); }
    // the thought cloud again: a memory cell, keeping its spike, winks back
    const wk = seg(t, 194.8, 195.2) * (1 - seg(t, 199.0, 199.3));
    if (wk > 0) {
      const bx = 900, by = 330; boilSeed('cloud');
      paint(ellPts(PA[0] + 150, PA[1] - 250, 13 * wk, 11 * wk, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
      paint(ellPts(PA[0] + 215, PA[1] - 290, 20 * wk, 17 * wk, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
      const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; P.push([bx + Math.cos(a) * 240 * backOut(wk) * (1 + .07 * Math.sin(a * 8)), by + Math.sin(a) * 150 * backOut(wk) * (1 + .07 * Math.sin(a * 8))]); }
      paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
      const ck = backOut(seg(t, 195.1, 195.5));
      if (ck > .05) { boilSeed('cmG'); glow(bx - 20, by + 10, 150 * ck, '#FFF0C0', .8);
        K.cell(bx - 20, by + 20, 78 * ck, mixCol(C.bc, PAL.cream, .4), C.bc, t, { key: 'cm', mood: t > 196.2 && t < 196.7 ? 'happy' : 'calm', seed: 7, nucleus: false, lx: -1, extras: () => K.spike(bx + 50, by - 40, .6 * ck, { key: 'cms', ang: .5 }) });
        if (t > 196.2 && t < 197.0) { boilSeed('wnk'); K.sparkle(bx + 70, by - 70, 40, seg(t, 196.2, 197.0), PIPC.gold); } }
    }
    const at = toScreen(PA[0], py - 3 * UA);
    camEnd();
    if (t < 192.4) brushWipe(.5 + (t - 192.1) / .6, [C.cytoDk, '#E7A98A']);
    if (t > 199.0) iris(at[0], at[1], kf(t, [[199.0, 1700], [199.6, 230], [200.0, 210], [200.45, 0]], ease));
  }

  shots([[0, shotA], [20.4, board], [73.6, shotD], [99.0, shotE], [123.0, shotF], [144.6, shotG], [180.8, shotH]]);
})();

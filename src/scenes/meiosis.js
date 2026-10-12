// meiosis.js: "Pip讲减数分裂", 290 s. Why a second child of the same parents is almost never you: halving (2n → n),
// then one primary spermatocyte through meiosis I and II (replication, condensation, synapsis/tetrads, crossing over,
// metaphase I orientation, anaphase/telophase I, metaphase/anaphase/telophase II), a recap, the 2^23 × 2^23 count,
// nondisjunction (trisomy 21), and back to the family. See STORYBOARD_MEIOSIS.md. Props from mrna_kit.js (MK).
// Every time is tied to a voice line: L(i, d) = line i's start + d seconds, so a retimed line moves its pictures.
(() => {
  const K = MK;
  const Z = {
    pat: '#5B8FD6', patDk: '#3B67A8', mat: '#E2708C', matDk: '#B44D6A', cen: '#3B3346', egg21: '#9C7BC4',
    home: '#F6D8B4', homeBlob: '#FBE9CF', floor: '#E7B98A', rug: '#E59A7B',
    board: '#E2DEF2', boardBlob: '#F2EFFA', tissue: '#C9E2D6', tissueBlob: '#E3F1EA',
    cyto: '#F3F6EA', cytoDk: '#D9E6CF', nuc: '#E4E1F3', nucleolus: '#A592C9', fiber: '#7FA393', pole: '#5E8C7A',
    night: '#2D3366', nightBlob: '#454C8A', mauve: '#E6DAE4', mauveBlob: '#F4ECF2', recap: '#F5EEDD', recapBlob: '#FBF6EA',
    gold: '#F0A93C', egg: '#F7DCD3', eggDk: '#E3B4A6', spermH: '#C9D4F2'
  };
  const PAPA = { pip: '#5E86CF', pipDk: '#3E62A3', belly: '#D3E0F4' }, MAMA = { pip: '#DE7895', pipDk: '#B2526F', belly: '#F8D7E0' };
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));              // a soft pulse peaking at a
  const pulseK = (t, a, len = .7) => t > a && t < a + len ? Math.sin(seg(t, a, a + len) * Math.PI) : 0;

  // ---------- small painted props ----------
  function tinted(cols, fn) { const old = { pip: PIPC.pip, pipDk: PIPC.pipDk, belly: PIPC.belly }; Object.assign(PIPC, cols); try { fn(); } finally { Object.assign(PIPC, old); } }
  const babyCols = i => { const k = hash(i * 3.3 + 1); return { pip: mixCol(PAPA.pip, MAMA.pip, k), pipDk: mixCol(PAPA.pipDk, MAMA.pipDk, k), belly: mixCol(PAPA.belly, MAMA.belly, hash(i + 9)) }; };
  function host(x, y, u, t, keys, extra = {}, key = 'ph') {      // Pip the host, swimming in place (screen space)
    const o = { ...K.act(t, keys), ...extra };
    const yb = K.swim(x, y, u, t, o, key);
    return { yb, o };
  }
  function ring(x, y, rx, ry, k, col = Z.gold, key = 'rg', w = 4) {   // a highlight ring that swells and fades
    if (k <= 0 || k >= 1) return; boilSeed('ring' + key);
    const q = 1 + .18 * easeOut(k), P = ellPts(x, y, rx * q, ry * q, 30);
    inkLine(P.concat([P[0], P[1]]), w * (1 - k * .8), col, 'ink', .5);
  }
  function holdRing(x, y, rx, ry, a, col = Z.gold, key = 'hr', w = 3) {   // a ring that stays while a > 0
    if (a <= .03) return; boilSeed('hring' + key);
    const P = ellPts(x, y, rx, ry, 30); inkLine(P.concat([P[0], P[1]]), w * a, col, 'ink', .5);
  }
  function dashed(x0, y0, x1, y1, k, col, key, n = 16, w = 2) {
    if (k <= .02) return; boilSeed('dash' + key);
    for (let i = 0; i < n; i++) { const a = i / n, b = (i + .55) / n; if (a > k) break;
      inkLine([[lerp(x0, x1, a), lerp(y0, y1, a)], [lerp(x0, x1, Math.min(b, k)), lerp(y0, y1, Math.min(b, k))]], w, col, 'ink', 0); }
  }
  function arrow(x0, y0, x1, y1, k, col, key, w = 14) {           // a painted arrow that draws itself
    if (k <= .02) return; boilSeed('arr' + key);
    const q = ease(k), ex = lerp(x0, x1, q), ey = lerp(y0, y1, q), a = Math.atan2(y1 - y0, x1 - x0), hl = w * 1.9;
    const bx = ex - Math.cos(a) * hl, by = ey - Math.sin(a) * hl;
    if (Math.hypot(bx - x0, by - y0) > 4) paint(ribbon([[x0, y0], [lerp(x0, bx, .5), lerp(y0, by, .5) + 3], [bx, by]], w * .8, w), { wash: col, ink: PAL.ink, sw: .9 });
    const nx = -Math.sin(a), ny = Math.cos(a);
    paint([[ex, ey], [bx + nx * w * 1.2, by + ny * w * 1.2], [bx - nx * w * 1.2, by - ny * w * 1.2]], { wash: col, ink: PAL.ink, sw: .9 });
  }
  function cloud(cx, cy, rx, ry, k, from, key) {                  // a thought bubble with two little bubbles back to the thinker
    if (k <= .02) return; boilSeed('cl' + key);
    const q = backOut(k);
    paint(ellPts(lerp(from[0], cx, .22), lerp(from[1], cy, .22), 12 * q, 10 * q, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(ellPts(lerp(from[0], cx, .42), lerp(from[1], cy, .42), 20 * q, 17 * q, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; P.push([cx + Math.cos(a) * rx * q * (1 + .06 * Math.sin(a * 8)), cy + Math.sin(a) * ry * q * (1 + .06 * Math.sin(a * 8))]); }
    paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
  }
  function sperm(x, y, s, ang, t, col, key, tail = 1) {           // head first along ang, the tail beats behind it
    boilSeed('sp' + key);
    const ca = Math.cos(ang), sa = Math.sin(ang), P = [];
    if (tail > .02) {
      for (let i = 0; i <= 10; i++) { const d = 12 * s + i * 7 * s * tail, w = Math.sin(t * 13 - i * .8 + hash(key.length + x * .01) * 6) * (1.5 + i * .9) * s * tail; P.push([x - ca * d - sa * w, y - sa * d + ca * w]); }
      inkLine(P, clamp(1.6 * s, .6, 3.2), PAL.ink, 'inkfine', .6);
    }
    paint(rotEll(x, y, 15 * s, 10.5 * s, 14, ang), { wash: col, ink: PAL.ink, sw: Math.min(1, .7 * s) });
    paint(rotEll(x + ca * 4 * s, y + sa * 4 * s, 6 * s, 5 * s, 10, ang), { wash: mixCol(col, PAL.cream, .45), ink: null });
  }
  function egg(x, y, r, t, key, o = {}) {                         // the egg: a corona of follicle cells round a soft zona
    boilSeed('egg' + key);
    if (o.corona !== false) for (let i = 0; i < 22; i++) { const a = i / 22 * TAU + .1 * wob(t, .05, i * .1); paint(ellPts(x + Math.cos(a) * r * 1.13, y + Math.sin(a) * r * 1.13, r * .11, r * .08, 10, 0, a), { wash: '#F2C9A8', ink: PAL.ink, sw: .6 }); }
    paint(ellPts(x, y, r * 1.04, r * 1.04, 36), { wash: '#FBEDE6', ink: PAL.ink, sw: clamp(r / 140, .6, 1.3) });
    paint(ellPts(x, y, r * .93, r * .93, 34), { wash: o.col || Z.egg, fill: Z.eggDk, fillOp: 50, tex: .5, ink: null });
  }
  const rotEll = (x, y, rx, ry, n, rot) => { const c = Math.cos(rot), s = Math.sin(rot); return ellPts(0, 0, rx, ry, n).map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]); };
  function rod(x, y, len, w, col, ang = -Math.PI / 2, key = '', hi = 0) {   // an unreplicated chromosome as a simple capsule
    boilSeed('rod' + key);
    paint(rotEll(x, y, len / 2 * (1 + .12 * hi), w / 2 * (1 + .12 * hi), 14, ang), { wash: mixCol(col, PAL.cream, .45 * hi), ink: PAL.ink, sw: clamp(w / 16, .45, .9) });
  }
  // a round cell (screen of the "why halve" board, the recap, the count): wash + soft shading + outline
  function roundCell(x, y, r, key, o = {}) {
    boilSeed('rc' + key);
    paint(ellPts(x, y, r * (1 + (o.sq || 0)), r * (1 - (o.sq || 0)), 34, 0), { wash: o.col || Z.cyto, fill: o.dk || Z.cytoDk, fillOp: 55, tex: .5, bleed: .05, ink: PAL.ink, sw: clamp(r / 150, .7, 1.4), curv: .25 });
  }

  // ---------- chromosomes ----------
  // A chromatid runs from its top end (f = 0) to its bottom end (f = 1) along ang (ang = π/2: top end up), with the
  // centromere at f = c, placed at (cx, cy). o: w, bow (ends lean along +n), off (shift along +n), cond (0..1: a loose
  // thread → a condensed chromatid), bump(f) (extra shift along +n), hi (0..1 lighten). segs: [[f0, f1, col, dx, dy]].
  const nrm = ang => [-Math.sin(ang), Math.cos(ang)];
  function cpt(cx, cy, ang, Lc, c, f, o) {
    const d = [Math.cos(ang), Math.sin(ang)], n = nrm(ang), u = (f - c) * Lc, Lh = Math.max(c, 1 - c) * Lc, cond = o.cond ?? 1;
    const ls = lerp(1.45, 1, cond), wig = (1 - cond) * 24;
    const off = (o.off || 0) + (o.bow || 0) * Math.pow(Math.abs(u) / Lh, 1.6) + wig * Math.sin(u * .11 + (o.ph || 0)) + (o.bump ? o.bump(f) : 0);
    return [cx + d[0] * u * ls + n[0] * off, cy + d[1] * u * ls + n[1] * off];
  }
  function piece(cx, cy, ang, Lc, c, f0, f1, col, o, dx = 0, dy = 0) {
    const cond = o.cond ?? 1, w = (o.w || 26) * lerp(.24, 1, ease(cond)), N = Math.max(5, Math.round((f1 - f0) * Lc / 7));
    const Lp = [], Rp = [];
    for (let i = 0; i <= N; i++) {
      const g = (1 - Math.cos(Math.PI * i / N)) / 2, f = f0 + (f1 - f0) * g;
      const p = cpt(cx, cy, ang, Lc, c, f, o), q = cpt(cx, cy, ang, Lc, c, Math.min(1, f + .01), o), r = cpt(cx, cy, ang, Lc, c, Math.max(0, f - .01), o);
      let tx = q[0] - r[0], ty = q[1] - r[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const round = Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(2 * f - 1), 7))), pinch = 1 - .3 * Math.exp(-Math.pow((f - c) * Lc / (.06 * Lc + 3), 2));
      const hw = w / 2 * Math.max(.04, round) * pinch;
      Lp.push([p[0] - ty * hw + dx, p[1] + tx * hw + dy]); Rp.push([p[0] + ty * hw + dx, p[1] - tx * hw + dy]);
    }
    const hi = o.hi || 0, c2 = mixCol(col, PAL.cream, .5 * hi);
    if (w < 11) paint(Lp.concat(Rp.reverse()), { wash: mixCol(col, PAL.ink, .12), ink: null });
    else paint(Lp.concat(Rp.reverse()), { wash: c2, ink: PAL.ink, sw: o.sw ?? clamp(w / 28, .45, 1.05) * (1 + .6 * hi), curv: .15 });
  }
  function chromatid(cx, cy, ang, P, segs, o, key) {
    boilSeed('ct' + key);
    for (const [f0, f1, col, dx = 0, dy = 0] of segs) if (f1 - f0 > .005) piece(cx, cy, ang, P.L, P.c, f0, f1, col, o, dx, dy);
  }
  const clip = (segs, a, b) => segs.map(([f0, f1, ...r]) => [Math.max(f0, a), Math.min(f1, b), ...r]).filter(s => s[1] - s[0] > .005);
  function centromere(x, y, w, key, hi = 0) { boilSeed('cm' + key); paint(ellPts(x, y, w * .3 * (1 + .5 * hi), w * .3 * (1 + .5 * hi), 12), { wash: mixCol(Z.cen, Z.gold, hi), ink: null }); }
  // a chromosome: one chromatid (rep 0) or two sisters (rep 1) joined at the centromere. o: rep, sep (sisters apart),
  // bow, w, cond, segsA/segsB, hiA/hiB, bumpA/bumpB, cenHi.
  function chromo(x, y, ang, P, o, key) {
    const w = o.w || 26, rep = clamp(o.rep ?? 1), n = nrm(ang), sep = o.sep || 0, base = { w, cond: o.cond ?? 1, ph: hash(key.length * 7 + x * .001) * 6 };
    const A = o.segsA, B = o.segsB || A;
    if (rep <= .001) { chromatid(x, y, ang, P, A, { ...base, hi: o.hiA || o.hi || 0, bump: o.bumpA }, key + 'a'); centromere(x, y, w, key, o.cenHi || 0); return; }
    const e = ease(rep), gap = w * .47 * e + sep, bw = (o.bow ?? w * .55) * e;
    chromatid(x, y, ang, P, clip(B, P.c - e * P.c, P.c + e * (1 - P.c)), { ...base, off: -gap, bow: -bw, hi: o.hiB || o.hi || 0, bump: o.bumpB }, key + 'b');
    chromatid(x, y, ang, P, A, { ...base, off: gap, bow: bw, hi: o.hiA || o.hi || 0, bump: o.bumpA }, key + 'a');
    if (sep < w * .3) centromere(x, y, w * (1 + .3 * e), key, o.cenHi || 0);
    else for (const s of [1, -1]) centromere(x + n[0] * gap * s, y + n[1] * gap * s, w, key + s, o.cenHi || 0);
  }
  const solid = col => [[0, 1, col]];

  // ---------- the dividing cell ----------
  // the outline of two circles (r) melting into one: smooth-min of their distance fields, sampled on rays from the midpoint.
  function blobPts(x1, y1, x2, y2, r, s, n = 64) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, D = Math.hypot(x2 - x1, y2 - y1), Rm = D / 2 + r + 3 * s + 30, P = [];
    const f = (x, y) => { const a = Math.hypot(x - x1, y - y1) - r, b = Math.hypot(x - x2, y - y2) - r; return -s * Math.log(Math.exp(-a / s) + Math.exp(-b / s)); };
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, ca = Math.cos(a), sa = Math.sin(a); let d = Rm;
      while (d > 0 && f(mx + ca * d, my + sa * d) > 0) d -= 6;
      let lo = Math.max(0, d), hi = d + 6; for (let k = 0; k < 7; k++) { const m = (lo + hi) / 2; if (f(mx + ca * m, my + sa * m) > 0) hi = m; else lo = m; }
      P.push([mx + ca * lo, my + sa * lo]);
    }
    return P;
  }
  // k 0..1: one cell of radius r0 at (x, y) → two cells of radius r1 whose centres are ±dist apart along axis ('x'|'y')
  function dividing(x, y, r0, r1, dist, k, axis, key) {
    const q = ease(k), r = lerp(r0, r1, q), d = dist * q, ax = axis === 'x' ? [1, 0] : [0, 1];
    const c1 = [x - ax[0] * d, y - ax[1] * d], c2 = [x + ax[0] * d, y + ax[1] * d];
    boilSeed('cell' + key);
    if (q < .005) bigCell(ellPts(x, y, r, r, 64), key);
    else if (q < .995) bigCell(blobPts(c1[0], c1[1], c2[0], c2[1], r, lerp(60, .8, q)), key);
    else { bigCell(ellPts(c1[0], c1[1], r, r, 64), key); bigCell(ellPts(c2[0], c2[1], r, r, 64), key + 'b'); }
    auditBox('cell', key, x - r - d * ax[0], y - r - d * ax[1], x + r + d * ax[0], y + r + d * ax[1]);
    return [c1, c2];
  }
  // a big cell: the fill as one shape, the outline as short overlapping strokes (a long outline under a zoomed camera
  // loses its shape in p5.brush)
  function bigCell(P, key) {
    boilSeed('bc' + key); paint(P, { wash: Z.cyto, fill: Z.cytoDk, fillOp: 50, tex: .45, bleed: .05, ink: null });
    const n = P.length; for (let i = 0; i < n; i += 8) { boilSeed('bco' + key + i); const Q = []; for (let j = 0; j <= 9; j++) Q.push(P[(i + j) % n]); inkLine(Q, 1.4, PAL.ink, 'ink', .4); }
  }
  function centrosome(x, y, k, key) {
    if (k <= .02) return; boilSeed('cs' + key);
    const q = backOut(k);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .2; inkLine([[x + Math.cos(a) * 14 * q, y + Math.sin(a) * 14 * q], [x + Math.cos(a) * 36 * q, y + Math.sin(a) * 36 * q]], 1.1, Z.fiber, 'inkfine', 0); }
    paint(rrPts(x - 10 * q, y - 4 * q, 20 * q, 8 * q, 3), { wash: Z.pole, ink: PAL.ink, sw: .6 });
    paint(rrPts(x - 4 * q, y - 10 * q, 8 * q, 20 * q, 3), { wash: Z.pole, ink: PAL.ink, sw: .6 });
  }
  function fibre(px, py, qx, qy, k, key, sag = 10) {            // a spindle fibre from a pole to a centromere, grown to k
    if (k <= .02) return; boilSeed('fb' + key);
    const ex = lerp(px, qx, k), ey = lerp(py, qy, k), nx = -(qy - py), ny = qx - px, nl = Math.hypot(nx, ny) || 1;
    inkLine([[px, py], [lerp(px, ex, .5) + nx / nl * sag, lerp(py, ey, .5) + ny / nl * sag], [ex, ey]], 1.3, Z.fiber, 'inkfine', .5);
  }
  function polarFibres(P1, P2, k, key, n = 7) {                   // the spindle's bowed fibres between two poles
    if (k <= .02) return;
    const mx = (P1[0] + P2[0]) / 2, my = (P1[1] + P2[1]) / 2, nx = -(P2[1] - P1[1]), ny = P2[0] - P1[0], nl = Math.hypot(nx, ny);
    for (let i = 0; i < n; i++) {
      const b = (i - (n - 1) / 2) / ((n - 1) / 2) * .5 * nl;
      for (const [a, z] of [[P1, 0], [P2, 1]]) {
        boilSeed('pf' + key + i + z);
        const m = [mx + nx / nl * b, my + ny / nl * b], e = [lerp(a[0], m[0], k * .92), lerp(a[1], m[1], k * .92)];
        inkLine([a, [lerp(a[0], e[0], .5) + nx / nl * b * .25, lerp(a[1], e[1], .5) + ny / nl * b * .25], e], .8, mixCol(Z.fiber, Z.cyto, .35), 'inkfine', .6);
      }
    }
  }

  // ================================ A: the family (0–20.9) ================================
  const HOME = { papa: [600, 885], mama: [1320, 885], pip: [960, 885] };
  const BABIES = Array.from({ length: 34 }, (_, i) => {
    let x, y, k = 0; do { x = 90 + hash(i * 7.1 + k) * 1740; y = 150 + hash(i * 3.7 + k + 50) * 760; k += 1.3; } while (Math.abs(x - 960) < 520 && y > 560 && k < 30);
    return { x, y, t0: L(1, 1.3) + i * .085, u: 11 + 4 * hash(i + 300), leaf: (hash(i + 77) - .5) * 1.6, flip: hash(i + 5) > .5 };
  });
  function homeBg(t, key) {
    K.wash(Z.home, t, { key, blob: Z.homeBlob, rect: rectPts(-2400, -1600, W + 4800, H + 3200) });
    boilSeed('floor' + key); paint(rectPts(-2400, 860, W + 4800, 2200), { wash: Z.floor, ink: null });
    inkLine([[-1200, 862], [400, 858], [1500, 864], [3100, 860]], 1.2, mixCol(Z.floor, PAL.ink, .45), 'ink', .4);
    boilSeed('rug' + key); paint(ellPts(960, 920, 640, 70, 30), { wash: mixCol(Z.rug, Z.floor, .35), ink: null });
    boilSeed('win' + key); paint(rrPts(1560, 150, 260, 300, 22), { wash: '#FBEFD6', ink: PAL.ink, sw: 1.1 });
    inkLine([[1690, 158], [1690, 442]], 1.4, PAL.ink, 'ink', 0); inkLine([[1568, 300], [1812, 300]], 1.4, PAL.ink, 'ink', 0);
    boilSeed('frame' + key); paint(rrPts(170, 210, 210, 160, 12), { wash: '#F1C68F', ink: PAL.ink, sw: 1 });
    paint(ellPts(275, 290, 70, 46, 18), { wash: '#F8E3C2', ink: null });
  }
  function family(t, kp, km, o = {}) {                            // Papa (blue) and Mama (rose), standing
    tinted(PAPA, () => pip(HOME.papa[0], HOME.papa[1], 50, { ...K.act(t, kp, 3), key: 'papa', ...(o.papa || {}) }));
    tinted(MAMA, () => pip(HOME.mama[0], HOME.mama[1], 50, { ...K.act(t, km, 5), flip: true, key: 'mama', ...(o.mama || {}) }));
  }
  function shotA(t, lt, dur) {
    const c = kf(t, [[0, [960, 600, 1.08]], [L(1, 4.0), [960, 560, 1.0]], [L(1, 5.3), [960, 520, .56]], [L(1, 5.9), [960, 520, .56]], [L(1, 6.9), [960, 600, 1.06]],
      [L(2, 0), [960, 600, 1.06]], [L(2, 1.0), [960, 520, .98]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    homeBg(t, 'a');
    // the crowd of possible babies: specks far out, then the fountain of little Pips
    const crowdOut = seg(t, L(1, 5.6), L(1, 6.4));
    for (let i = 0; i < 90; i++) {
      const born = L(1, 3.6) + hash(i + 900) * 1.4, k = seg(t, born, born + .4) * (1 - seg(t, L(1, 5.7) + hash(i + 901) * .5, L(1, 6.3) + hash(i + 901) * .5));
      if (k <= .02) continue;
      const a = hash(i + 902) * TAU, r = 1050 + hash(i + 903) * 900, x = 960 + Math.cos(a) * r * 1.3, y = 520 + Math.sin(a) * r * .75;
      boilSeed('spk' + i); const col = babyCols(i + 50), s = backOut(k);
      paint(ellPts(x, y, 20 * s, 26 * s, 12), { wash: col.pip, ink: PAL.ink, sw: .8 });
      paint(ellPts(x + 10 * s, y - 34 * s, 9 * s, 5 * s, 8, 0, -.6), { wash: PIPC.leaf, ink: null });
    }
    BABIES.forEach((b, i) => {
      const fly = seg(t, b.t0, b.t0 + .75), gone = seg(t, L(1, 5.5) + hash(i + 40) * .7, L(1, 5.9) + hash(i + 40) * .7);
      if (fly <= 0 || gone >= 1) return;
      const p = arcPt([960, 640], [b.x, b.y], 260, easeOut(fly)), s = 1 - easeIn(gone);
      tinted(babyCols(i), () => pip(p[0], p[1], b.u * s, { ...pipFeel(['happy', 'calm', 'laugh', 'wow'][i % 4], t, { seed: i }), leaf: b.leaf, flip: b.flip, noShadow: true, key: 'bb' + i }));
      if (gone > 0 && gone < 1) K.sparkle(p[0], p[1] - 3 * b.u, 26, gone, PAL.cream);
    });
    family(t, [[0, 'calm', { lookX: .8 }], [L(1, .2), 'wave'], [L(1, 2.4), 'wow', { lookY: -.6 }], [L(1, 7.0), 'calm', { lookX: .8 }], [L(1, 9.0), 'happy'], [L(2, .8), 'calm', { lookY: -.9 }], [L(2, 5.5), 'happy']],
      [[0, 'calm', { lookX: .8 }], [L(1, .5), 'happy'], [L(1, 2.6), 'laugh'], [L(1, 7.0), 'calm', { lookX: .8 }], [L(1, 9.0), 'happy'], [L(2, .8), 'calm', { lookY: -.9 }], [L(2, 6.3), 'love']]);
    // the sibling drops in beside Pip; Pip looks: not me
    const drop = seg(t, L(1, 6.5), L(1, 7.1)), sib = [1115, 885];
    if (drop > 0) {
      const y = lerp(-300, sib[1], easeIn(drop)), land = spring(t, L(1, 7.1), 7, 22) * .25;
      tinted({ pip: '#7F86C9', pipDk: '#5A5F9E', belly: '#DDDDF3' }, () => pip(sib[0], y, 27, { ...K.act(t, [[0, 'happy'], [L(1, 8.6), 'wave'], [L(2, 1), 'calm', { lookY: -.9 }]], 7), sq: land, leaf: -.9, flip: true, key: 'sib' }));
    }
    const P = HOME.pip;
    pip(P[0], P[1], 30, { ...K.act(t, [[0, 'calm', { lookX: -.6 }], [L(1, 1.0), 'happy'], [L(1, 2.3), 'wow', { lookY: -.7 }], [L(1, 4.4), 'excited'], [L(1, 7.0), 'calm', { lookX: .9 }], [L(1, 7.6), 'wow', { lookX: .9 }], [L(1, 8.5), 'confused', { flip: true }],
      [L(2, .6), 'wow', { lookY: -1, lookX: -.4 }], [L(2, 5.2), 'idea', { lookX: .2 }], [L(2, 7.2), 'happy']]), key: 'pa' });
    // the bubbles: where the number comes from
    const bP = [600, 360], bM = [1320, 360], ck = seg(t, L(2, .2), L(2, .7)), ck2 = seg(t, L(2, .5), L(2, 1.0));
    cloud(bP[0], bP[1], 190, 150, ck, [HOME.papa[0] + 40, HOME.papa[1] - 300], 'p');
    cloud(bM[0], bM[1], 190, 150, ck2, [HOME.mama[0] - 40, HOME.mama[1] - 300], 'm');
    if (ck > .7) {                                               // papa: one cell → two → four → sperm
      const k1 = seg(t, L(2, 1.2), L(2, 2.2)), k2 = seg(t, L(2, 2.6), L(2, 3.6)), tails = seg(t, L(2, 4.9), L(2, 6.1));
      const r = lerp(62, 34, ease(k2));
      const pts = k2 > 0 ? [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [bP[0] + a * lerp(40, 66, ease(k2)) * (k1 > 0 ? 1 : 0), bP[1] + b * 48 * ease(k2)])
        : k1 > 0 ? [[-1, 0], [1, 0]].map(([a]) => [bP[0] + a * 56 * ease(k1), bP[1]]) : [[bP[0], bP[1]]];
      pts.forEach((p, i) => {
        if (tails > .02) sperm(p[0] + 18, p[1], 2.0 * lerp(1, .8, tails), Math.PI + .25 * Math.sin(t * 3 + i), t, mixCol(Z.spermH, i % 2 ? Z.pat : Z.mat, .35 + .2 * hash(i)), 'bs' + i, tails);
        else roundCell(p[0], p[1], k1 > 0 && k2 <= 0 ? lerp(62, 46, ease(k1)) : r, 'bpc' + i, { sq: .08 * spring(t, i < 2 ? L(2, 2.2) : L(2, 3.6), 7, 20) });
      });
    }
    if (ck2 > .7) {                                              // mama: one cell → one egg (+ tiny polar bodies)
      const k1 = seg(t, L(2, 1.4), L(2, 3.6)), shine = seg(t, L(2, 6.2), L(2, 7.2));
      if (k1 <= .02) roundCell(bM[0], bM[1], 62, 'bmc');
      else {
        for (let i = 0; i < 3; i++) { const q = backOut(seg(t, L(2, 1.6) + i * .5, L(2, 2.1) + i * .5)); if (q > .02) { boilSeed('pb' + i); paint(ellPts(bM[0] + 95 + (i % 2) * 22, bM[1] - 60 + i * 34, 13 * q, 13 * q, 10), { wash: Z.egg, ink: PAL.ink, sw: .7 }); } }
        egg(bM[0] - 15, bM[1] + 5, lerp(62, 74, ease(k1)), t, 'be', { corona: k1 > .5 });
      }
      if (shine > 0 && shine < 1) K.sparkle(bM[0] + 45, bM[1] - 60, 40, shine, '#FFF7DD');
    }
    const at = toScreen(P[0], P[1] - 2.8 * 30);
    camEnd();
    if (lt < .9) iris(at[0], at[1], kf(lt, [[0, 0], [.15, 210], [.4, 230], [.9, 1800]], easeIn));
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B7AEDB', Z.board]);
  }

  // ================================ B: why halve (20.9–64.6) ================================
  const KAR = Array.from({ length: 23 }, (_, i) => { const row = i < 8 ? 0 : i < 16 ? 1 : 2, col = i - row * 8, nc = row < 2 ? 8 : 7;
    return { x: (col - (nc - 1) / 2) * 74, y: [-128, 2, 132][row], len: 72 - i * 2, i }; });
  const inDisc = (i, r, salt = 0) => { const a = hash(i * 1.7 + salt) * TAU, d = Math.sqrt(hash(i * 2.3 + salt + 9)) * r; return [Math.cos(a) * d, Math.sin(a) * d * .9]; };
  function boardBg(t) {
    K.wash(Z.board, t, { key: 'b', blob: Z.boardBlob, rect: rectPts(-1600, -1200, W + 3200, H + 2400) });
    K.motes(t, 16, mixCol(Z.board, '#8E86C0', .3), { key: 'b' });
  }
  // a set of rods: pat (blue) and/or mat (rose) for each of the 23 pairs. pos(j) gives each rod's place
  function rods(x0, y0, list, s, t, key) { list.forEach((r, j) => rod(x0 + r.x, y0 + r.y, r.len * s, 10 * s * (r.w || 1), r.col, r.ang ?? -Math.PI / 2, key + j, r.hi || 0)); }
  function shotB(t, lt, dur) {
    const c = kf(t, [[L(3, -2), [960, 540, 1]], [L(6, 8.6), [960, 540, 1.0]], [L(6, 9.6), [620, 520, 2.8]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    boardBg(t);
    const BX = 900, BY = 520;
    if (t < L(4, .2)) {                                          // L3: a body cell, 46 → 23 pairs → father's, mother's
      roundCell(BX, BY, 360, 'body', { sq: .02 * wob(t, .3) });
      const pair = ease(seg(t, L(3, 3.0), L(3, 5.0))), hp = near(t, L(3, 6.9), .5), hm = near(t, L(3, 8.9), .5);
      const list = [];
      KAR.forEach(k => [0, 1].forEach(p => {
        const j = k.i * 2 + p, pop = backOut(seg(t, L(3, .2) + j * .045, L(3, .55) + j * .045)); if (pop <= .02) return;
        const [sx, sy] = inDisc(j, 280, 3), tx = k.x + (p ? 9 : -9), ty = k.y;
        list.push({ x: lerp(sx, tx, pair), y: lerp(sy, ty, pair), len: k.len * pop, col: p ? Z.mat : Z.pat, ang: lerp(-Math.PI / 2 + (hash(j + 5) - .5) * 2.4, -Math.PI / 2, pair), hi: p ? hm : hp });
      }));
      rods(BX, BY, list, 1, t, 'k');
    } else if (t < L(5, 0)) {                                    // L4: 46 + 46 → 92 → 184
      const merge = seg(t, L(4, 4.2), L(4, 5.2)), grow = ease(seg(t, L(4, 6.6), L(4, 8.0))), gone = seg(t, L(5, -.7), L(5, -.1));
      const SX = lerp(560, 1180, easeIn(merge)), EX = 1230, ER = lerp(190, 230, merge) * (1 + .4 * grow) * (1 - easeIn(gone));
      const pop = backOut(seg(t, L(4, .3), L(4, .9)));
      if (merge < 1) { sperm(SX, BY, 7.5 * pop, 0, t, Z.spermH, 'S46'); const L46 = []; for (let j = 0; j < 46; j++) { const [dx, dy] = inDisc(j, 66, 1); L46.push({ x: dx, y: dy * .7, len: (12 + 18 * hash(j + 70)) * pop, col: Z.pat, ang: hash(j + 71) * 3 }); } rods(SX, BY, L46, 1, t, 's'); }
      if (ER > 4) {
        egg(EX, BY, ER * (merge < 1 ? pop : 1), t, 'E46', { col: grow > .3 ? mixCol(Z.egg, '#F2B7A8', grow) : Z.egg });
        const n = merge >= 1 ? Math.round(lerp(92, 184, clamp(grow * 1.4))) : 46, list = [];
        for (let j = 0; j < n; j++) { const [dx, dy] = inDisc(j, ER * .82, 4); const q = j < 46 ? 1 : j < 92 ? ease(seg(merge, .3 + (j - 46) * .01, .6 + (j - 46) * .01)) : backOut(seg(grow, (j - 92) / 140, (j - 92) / 140 + .2));
          if (q > .02) list.push({ x: dx, y: dy, len: (14 + 18 * hash(j + 70)) * q * (merge < 1 ? pop : 1), col: j % 2 && j >= 46 ? Z.pat : j >= 92 ? (j % 3 ? Z.mat : Z.pat) : j < 46 ? Z.mat : Z.pat, ang: hash(j + 71) * 3 }); }
        rods(EX, BY, list, 1, t, 'e');
      }
      if (gone > 0) K.burst(EX, BY, 260, gone, PAL.ink, 'poof');
    } else if (t < L(6, 0)) {                                    // L5: 23 + 23 → 46, the pairs line back up ✓
      const pop = backOut(seg(t, L(5, .2), L(5, .9))), merge = seg(t, L(5, 5.7), L(5, 6.7)), pair = ease(seg(t, L(5, 6.9), L(5, 8.3)));
      const SX = lerp(560, 1180, easeIn(merge)), EX = 1230, ER = lerp(190, 360, ease(seg(t, L(5, 6.6), L(5, 7.6)))) * pop;
      const wave = j => near(t, L(5, 3.4) + j * .07, .2);
      egg(EX, BY, ER, t, 'E23', { corona: pair < .5 });
      const list = [];
      KAR.forEach(k => {
        const ex = (k.x * .42), ey = k.y * .5, tx = k.x + 9, ty = k.y;
        list.push({ x: lerp(ex, tx, pair) + lerp(0, 0, merge), y: lerp(ey, ty, pair), len: k.len * lerp(.55, 1, pair) * pop, col: Z.mat, hi: wave(k.i) });
      });
      rods(EX, BY, list, 1, t, 'm');
      if (merge < 1) { sperm(SX, BY, 7.5 * pop, 0, t, Z.spermH, 'S23'); const ls = KAR.map(k => ({ x: k.x * .26, y: k.y * .3, len: k.len * .42 * pop, col: Z.pat, hi: wave(k.i), w: .8 })); rods(SX, BY, ls, 1, t, 'p'); }
      else { const ls = KAR.map(k => ({ x: lerp(k.x * .42, k.x - 9, pair), y: lerp(k.y * .5, k.y, pair), len: k.len * lerp(.55, 1, pair), col: Z.pat })); rods(EX, BY, ls, 1, t, 'pz'); }
      K.check(EX + 330, BY - 330, 110, seg(t, L(5, 8.4), L(5, 8.9)), 'b5');
    } else {                                                     // L6 recap: 2n → n
      const mv = ease(seg(t, L(6, 0), L(6, 1.3))), X = lerp(1230, 620, mv), R = lerp(360, 220, mv), sc = R / 360;
      roundCell(X, BY, R, 'dip');
      const ls = []; KAR.forEach(k => { ls.push({ x: (k.x - 9) * sc, y: k.y * sc, len: k.len * sc, col: Z.pat, hi: near(t, L(6, 5.9), .4) }); ls.push({ x: (k.x + 9) * sc, y: k.y * sc, len: k.len * sc, col: Z.mat, hi: near(t, L(6, 5.9), .4) }); });
      rods(X, BY, ls, 1, t, 'd');
      const hk = backOut(seg(t, L(6, 3.2), L(6, 4.0)));
      arrow(870, BY, 1090, BY, seg(t, L(6, 3.4), L(6, 4.4)), '#B3A6DC', 'half');
      if (hk > .02) {
        roundCell(1330, BY, 175 * hk, 'hap');
        const hs = KAR.map(k => ({ x: k.x * .44 * hk, y: k.y * .44 * hk, len: k.len * .44 * hk, col: hash(k.i * 5.1 + 2) > .5 ? Z.pat : Z.mat, hi: near(t, L(6, 7.3), .4) }));
        rods(1330, BY, hs, 1, t, 'h');
      }
      ring(620, BY, 245, 245, seg(t, L(6, 5.7), L(6, 6.6)), Z.gold, 'r2n');
      ring(1330, BY, 200, 200, seg(t, L(6, 6.9), L(6, 7.8)), Z.gold, 'rn');
    }
    camEnd();
    host(1700, 1010, 30, t, [[L(3, -2), 'calm', { lookX: -.8 }], [L(3, 1), 'wow', { lookX: -.9 }], [L(3, 6.5), 'happy', { lookX: -.8 }], [L(4, .5), 'calm', { lookX: -.9 }], [L(4, 4.5), 'wow', { lookX: -.9 }], [L(4, 6.9), 'worried'],
      [L(5, .3), 'calm', { lookX: -.9 }], [L(5, 8.4), 'happy'], [L(6, 0), 'calm', { lookX: -.8 }], [L(6, 3.5), 'idea', { lookX: -.6 }], [L(6, 8.3), 'happy']], { flip: true }, 'pb');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B7AEDB', Z.board]);
    if (t > L(6, 9.3)) flash(seg(t, L(6, 9.3), L(6, 9.7)), PAL.cream);
  }

  // ================================ C: meiosis, one cell (64.6–205.3) ================================
  const PR = [{ L: 200, c: .38 }, { L: 150, c: .45 }, { L: 100, c: .3 }], W0 = 26, G = 62;
  const XS = [[.66, 1], [0, .3], [.62, 1]];                       // the stretch each pair swaps in crossing over
  const INT = [[[815, 430, 1.95], [1125, 650, 1.2]], [[1105, 405, 2.55], [835, 690, .95]], [[1000, 560, .25], [1195, 470, 2.05]]];
  const SYN = [[810, 545], [1010, 455], [1150, 625]];
  const M1Y = [346, 582, 740], MI = 960, POLE1 = [[630, 540], [1290, 540]];
  const CELLS2 = [[620, 540], [1300, 540]], MIIX = [-200, 0, 172];
  // C's schedule
  const T = {
    hiPair: k => L(7, .3 + k * .7), rep: h => L(7, 4.6 + h * .28), cenZoom: L(7, 8.9), cond: [L(8, 3.0), L(8, 7.4)], env: [L(8, 8.0), L(8, 10.2)], cs: [L(8, 10.3), L(8, 12.6)],
    pair: k => L(9, 4.1 + k * .25), lianhui: L(9, 6.4), four: L(9, 8.6), tetrad: L(9, 11.6),
    inner: L(10, 1.5), xk: [L(10, 4.3), L(10, 5.5)], sw: [L(10, 6.2), L(10, 7.7)], burst: L(10, 8.2), relax: [L(10, 8.7), L(10, 9.7)], recomb: L(10, 11.0),
    others: k => L(10, 12.6 + (k - 1) * .55),
    m1: [L(11, 1.3), L(11, 3.8)], plate: L(11, 1.2), attach: k => L(11, 4.6 + k * .5), flip: [L(11, 9.4), L(11, 11.8)],
    a1: [L(12, 1.2), L(12, 3.0)], a1b: [L(12, 5.4), L(12, 6.9)], grp: L(12, 3.4), cenZoom1: L(12, 7.8),
    t1: [L(13, 1.2), L(13, 3.7)], count: L(13, 6.0), sisters: L(13, 8.5), halve: L(13, 12.2),
    sp2: [L(14, .4), L(14, 2.6)], m2: [L(14, 6.5), L(14, 8.7)], single: L(14, 10.2), plate2: L(14, 6.2),
    split: L(15, 1.3), sep: [L(15, 2.7), L(15, 4.2)], own: L(15, 4.5), a2: [L(15, 6.2), L(15, 7.9)],
    t2: [L(16, 1.2), L(16, 3.5)], ghost: L(16, 4.1), four4: L(16, 5.9), oneSet: L(16, 8.3), differ: L(16, 10.6)
  };
  const isPat = h => h % 2 === 0, pairOf = h => h >> 1;
  // left (−1) or right (+1) of the metaphase-I plate; the middle pair swaps sides (random orientation)
  const sideOf = (h, t) => { const s = isPat(h) ? -1 : 1; return pairOf(h) === 1 && t >= T.flip[1] ? -s : s; };
  const cellOf = h => (isPat(h) ? 0 : 1) ^ (pairOf(h) === 1 ? 1 : 0);   // which daughter cell (0 left, 1 right) after meiosis I
  function segsOf(h, t) {                                        // chromatid colours, with the crossover's tips mid-swap
    const k = pairOf(h), pat = isPat(h), col = pat ? Z.pat : Z.mat, oth = pat ? Z.mat : Z.pat, [a, b] = XS[k];
    const sw = k === 0 ? seg(t, T.sw[0], T.sw[1]) : seg(t, T.others(k) + .35, T.others(k) + .85);
    const inner = pat ? 'B' : 'A';
    const done = sw >= 1, mid = sw > 0 && sw < 1;
    const rest = a === 0 ? [b, 1] : [0, a];
    let segInner;
    if (done) segInner = [[a, b, oth], [rest[0], rest[1], col]];
    else if (mid) { const dir = pat ? 1 : -1, q = ease(sw), lift = Math.sin(sw * Math.PI) * 8 * (a === 0 ? -1 : 1);
      segInner = [[rest[0], rest[1], col], [a, b, col, dir * 36 * q, lift]]; }
    else segInner = solid(col);
    return inner === 'B' ? { segsA: solid(col), segsB: segInner } : { segsA: segInner, segsB: solid(col) };
  }
  function bumpOf(h, t) {                                       // the inner (non-sister) chromatids lean in to touch: the chiasma
    const k = pairOf(h), [a, b] = XS[k], fx = a === 0 ? b : a;
    const xk = k === 0 ? ease(seg(t, T.xk[0], T.xk[1])) * (1 - ease(seg(t, T.relax[0], T.relax[1])))
      : ease(seg(t, T.others(k), T.others(k) + .35)) * (1 - ease(seg(t, T.others(k) + .85, T.others(k) + 1.2)));
    if (xk <= 0) return {};
    const f = ff => 18 * xk * Math.exp(-Math.pow((ff - fx) / .16, 2));
    return isPat(h) ? { bumpB: ff => -f(ff) } : { bumpA: ff => f(ff) };
  }
  // where homolog h is at time t: centromere (x, y), axis angle, replication, condensation, sister bow
  function homState(h, t) {
    const k = pairOf(h), p = isPat(h) ? 0 : 1, I = INT[k][p];
    let x = I[0], y = I[1], ang = I[2];
    const pk = ease(seg(t, T.pair(k), T.pair(k) + 1.6));                       // synapsis
    const sx = SYN[k][0] + (p ? 1 : -1) * G / 2, sy = SYN[k][1];
    x = lerp(x, sx, pk); y = lerp(y, sy, pk); ang = lerp(ang, Math.PI / 2, pk);
    const mk = ease(seg(t, T.m1[0] + k * .2, T.m1[1] + k * .2));              // to the metaphase-I plate
    const side0 = isPat(h) ? -1 : 1;
    x = lerp(x, MI + side0 * G / 2, mk); y = lerp(y, M1Y[k], mk);
    if (k === 1) {                                                             // the coin toss: the middle pair orbits round
      const fk = ease(seg(t, T.flip[0], T.flip[1])), ph = fk * Math.PI * 3, cx = MI, cy = M1Y[1];
      if (fk > 0) { x = cx + side0 * G / 2 * Math.cos(ph); y = cy + side0 * 70 * Math.sin(ph); }
    }
    const s = sideOf(h, t), a1 = ease(seg(t, T.a1[0], T.a1[1])), a1b = ease(seg(t, T.a1b[0], T.a1b[1]));
    if (a1 > 0) x = MI + s * (G / 2 + 100 * a1 + 130 * a1b);
    // meiosis II: to the daughter cell's horizontal plate, lying along it
    const ci = cellOf(h), m2 = seg(t, T.m2[0] + k * .2, T.m2[1] + k * .2);
    if (m2 > 0) { const mv = ease(seg(m2, 0, .6)), rt = ease(seg(m2, .4, 1)); x = lerp(x, CELLS2[ci][0] + MIIX[k], mv); y = lerp(y, 540, mv); ang = lerp(Math.PI / 2, 0, rt); }
    const rep = ease(seg(t, T.rep(h), T.rep(h) + 1.4)), cond = lerp(.42, 1, ease(seg(t, T.cond[0] + h * .15, T.cond[1] + h * .15)));
    const bowK = 1 - ease(seg(t, T.pair(k), T.pair(k) + .8)) + ease(seg(t, T.a1[0], T.a1[0] + 1.2));
    return { x, y, ang, rep, cond, bow: W0 * .55 * clamp(bowK) };
  }
  function shotC(t, lt, dur) {
    const z0 = homState(0, t);
    let c = kf(t, [[L(7, -2), [960, 540, 1]], [L(7, 8.4), [960, 540, 1]], [L(7, 9.3), [815, 430, 2.1]], [L(7, 11.0), [815, 430, 2.1]], [L(7, 12.0), [960, 540, 1]],
      [L(9, 7.4), [960, 540, 1]], [L(9, 8.3), [810, 545, 2.15]], [L(10, 11.8), [810, 545, 2.15]], [L(10, 12.6), [960, 540, 1]], [L(12, 7.5), [960, 540, 1]],
      [L(12, 8.2), [700, 346, 2.1]], [L(12, 9.6), [700, 346, 2.1]], [L(13, .4), [960, 540, .96]], [L(13, 7.9), [960, 540, .96]], [L(13, 8.5), [700, 346, 1.9]],
      [L(13, 10.4), [700, 346, 1.9]], [L(13, 11.4), [960, 540, .86]], [L(16, 10.0), [960, 540, .86]], [L(16, 12.0), [960, 540, .9]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash(Z.tissue, t, { key: 'c', blob: Z.tissueBlob, rect: rectPts(-1400, -1200, W + 2800, H + 2400) });
    K.motes(t, 14, mixCol(Z.tissue, '#6E9F8A', .3), { key: 'c' });
    // the cell: one → two (telophase I) → four (telophase II)
    const t1 = seg(t, T.t1[0], T.t1[1]), t2 = seg(t, T.t2[0], T.t2[1]);
    let cells;
    if (t1 < 1) cells = dividing(960, 540, 400, 340, 340, t1, 'x', 'c1');
    else if (t2 <= 0) cells = CELLS2.map((p, i) => { bigCell(ellPts(p[0], p[1], 340, 340, 64), 'c2' + i); return p; });
    else cells = CELLS2.map((p, i) => dividing(p[0], p[1], 340, 200, 206, t2, 'y', 'c4' + i));
    // nucleus and nucleolus fade in prophase I
    const env = seg(t, T.env[0], T.env[1]);
    if (env < 1) {
      boilSeed('nuc'); paint(ellPts(960, 545, 315, 300, 40), { wash: mixCol(Z.cyto, Z.nuc, 1 - env), ink: null });
      for (let i = 0; i < 24; i++) { const gone = seg(env, hash(i + 400) * .6, hash(i + 400) * .6 + .4); if (gone >= 1) continue; boilSeed('env' + i);
        const a0 = i / 24 * TAU, a1 = (i + .8) / 24 * TAU, P = []; for (let j = 0; j <= 4; j++) { const a = lerp(a0, a1, j / 4), r = 315 + 22 * gone; P.push([960 + Math.cos(a) * r, 545 + Math.sin(a) * r * .95]); }
        inkLine(P, 2.2 * (1 - gone), mixCol('#7C6FA8', Z.cyto, gone), 'ink', .5); }
      boilSeed('nucleolus'); paint(ellPts(1080, 640, 52 * (1 - env * .6), 44 * (1 - env * .6), 16), { wash: mixCol(Z.nucleolus, Z.cyto, env), ink: null });
    }
    // spindle I: centrosomes slide from above the nucleus to the poles; fibres grow; plate; kinetochore fibres
    const cs = seg(t, T.cs[0], T.cs[1]), spOff = seg(t, T.t1[0], T.t1[0] + 1.5);
    if (cs > 0 && spOff < 1) {
      const pp = POLE1.map(([px, py], i) => [lerp(960 + (i ? 40 : -40), px, ease(cs)), lerp(225, py, ease(cs))]);
      const fk = ease(seg(t, T.cs[0] + .8, T.cs[1] + 1.4)) * (1 - spOff);
      if (fk > .02) polarFibres(pp[0], pp[1], fk, 'p1');
      pp.forEach((p, i) => centrosome(p[0], p[1], seg(t, T.cs[0], T.cs[0] + .4) * (1 - spOff), 'p1' + i));
      dashed(MI, 200, MI, 885, seg(t, T.plate, T.plate + .9) * (1 - seg(t, T.a1[0], T.a1[0] + .8)), '#A7B9AE', 'plate1', 18, 2.4);
      for (let h = 0; h < 6; h++) {
        const k = pairOf(h), st = homState(h, t), s = sideOf(h, t), pole = POLE1[s < 0 ? 0 : 1];
        const att = seg(t, T.attach(k), T.attach(k) + .5) * (k === 1 ? 1 - seg(t, T.flip[0] - .3, T.flip[0]) + seg(t, T.flip[1], T.flip[1] + .4) : 1) * (1 - spOff);
        fibre(pole[0], pole[1], st.x, st.y, Math.min(1, att), 'k' + h, (h % 3 - 1) * 8);
        if (t > T.attach(k) + .45 && t < T.attach(k) + 1.0) K.burst(st.x, st.y, 22, seg(t, T.attach(k) + .45, T.attach(k) + 1.0), Z.pole, 'kb' + h);
      }
    }
    // spindles II (vertical), their plates and fibres
    const sp2 = seg(t, T.sp2[0], T.sp2[1]), sp2Off = seg(t, T.t2[0], T.t2[0] + 1.4);
    if (sp2 > 0 && sp2Off < 1) CELLS2.forEach(([cx, cy], ci) => {
      const pp = [[cx, cy - 250], [cx, cy + 250]].map(([px, py]) => [lerp(cx + 30, px, ease(sp2)), lerp(cy - 40, py, ease(sp2))]);
      polarFibres(pp[0], pp[1], ease(seg(t, T.sp2[0] + .6, T.sp2[1] + .8)) * (1 - sp2Off), 'p2' + ci, 6);
      pp.forEach((p, i) => centrosome(p[0], p[1], seg(t, T.sp2[0], T.sp2[0] + .4) * (1 - sp2Off), 'p2' + ci + i));
      dashed(cx - 300, cy, cx + 300, cy, seg(t, T.plate2, T.plate2 + .8) * (1 - seg(t, T.sep[0], T.sep[0] + .8)), '#A7B9AE', 'plate2' + ci, 14, 2.4);
    });
    // the chromosomes
    const hiPulse = (a, w = .35) => near(t, a, w);
    for (let h = 0; h < 6; h++) {
      const st = homState(h, t), k = pairOf(h), sg = segsOf(h, t), bm = bumpOf(h, t), key = 'h' + h;
      let hi = hiPulse(T.hiPair(k)) + hiPulse(T.lianhui + k * .15, .3) + hiPulse(T.count + [0, .5, 1][k], .25) + hiPulse(T.oneSet + k * .45, .25);
      let hiA = 0, hiB = 0;
      if (k === 0) {                                              // the four chromatids, one by one; then the two inner ones
        const isP = isPat(h);
        hiA += hiPulse(T.four + (isP ? 0 : 1.0), .22); hiB += hiPulse(T.four + (isP ? .5 : 1.5), .22);
        const inn = seg(t, T.inner, T.inner + .4) * (1 - seg(t, T.xk[1] + .6, T.xk[1] + 1.1));
        if (isP) hiB += inn; else hiA += inn;
        if (isP) hiB += hiPulse(T.recomb, .3); else hiA += hiPulse(T.recomb + .6, .3);
      }
      if (h === 0) { hiA += hiPulse(T.sisters, .25); hiB += hiPulse(T.sisters + .6, .25); }
      const split = seg(t, T.split + h * .1, T.split + h * .1 + .3);
      const cenHi = hiPulse(T.cenZoom + .9, .3) * (h === 0 ? 1 : 0) + hiPulse(T.cenZoom1 + .5, .3) * (h === 0 ? 1 : 0);
      if (split <= 0) chromo(st.x, st.y, st.ang, PR[k], { rep: st.rep, cond: st.cond, bow: st.bow, ...sg, ...bm, hi: clamp(hi), hiA: clamp(hiA), hiB: clamp(hiB), w: W0, cenHi }, key);
      else {                                                       // anaphase II: the sisters part and go to the poles
        const ci = cellOf(h), [cx] = CELLS2[ci], sep = 30 * ease(seg(t, T.sep[0], T.sep[1])), a2 = ease(seg(t, T.a2[0] + k * .12, T.a2[1] + k * .12));
        const t2k = ease(seg(t, T.t2[0], T.t2[1]));
        for (const [s, segs, which] of [[1, sg.segsA, 'A'], [-1, sg.segsB, 'B']]) {
          const fx = cx - PR[k].L * (.5 - PR[k].c), fy = 540 + s * lerp(150, 206, t2k) + (k - 1) * 52;
          const x = lerp(st.x, fx, a2), y = lerp(540 + s * (W0 * .47 + sep), fy, a2);
          chromatid(x, y, 0, PR[k], segs, { w: W0, hi: clamp(hiPulse(T.own + (s > 0 ? 0 : .3), .25) + hiPulse(T.oneSet + k * .45, .25)) }, key + which);
          centromere(x, y, W0, key + which);
          if (a2 < 1 && sp2Off < 1) fibre(cx, 540 + s * 250, x, y, 1 - sp2Off, 'f2' + h + which, 0);
        }
        if (split < 1) K.burst(st.x, st.y, 34, split, Z.gold, 'sb' + h);
      }
      if (sp2 > 0 && split <= 0 && t > T.m2[1]) { const ci = cellOf(h), [cx] = CELLS2[ci]; const at2 = seg(t, T.m2[1] + .2 + k * .2, T.m2[1] + .8 + k * .2);
        for (const s of [1, -1]) fibre(cx, 540 + s * 250, st.x, st.y + s * 12, at2, 'f2a' + h + s, 0); }
    }
    // highlights that need their own marks
    ring(SYN[0][0], SYN[0][1] - 20, 105, 150, seg(t, T.tetrad, T.tetrad + 1.0), Z.gold, 'tet');
    holdRing(SYN[0][0], SYN[0][1] - 20, 100, 145, seg(t, T.tetrad + .6, T.tetrad + 1.2) * (1 - seg(t, L(10, .6), L(10, 1.2))), Z.gold, 'teth', 2.5);
    if (t > T.burst && t < T.burst + .8) { const [a, b] = XS[0], fx = a === 0 ? b : a, yy = SYN[0][1] + (fx - PR[0].c) * PR[0].L; K.burst(SYN[0][0], yy, 40, seg(t, T.burst, T.burst + .8), Z.gold, 'xb'); K.sparkle(SYN[0][0] + 30, yy - 30, 30, seg(t, T.burst + .1, T.burst + .8), '#FFF3C4'); }
    for (const k of [1, 2]) { const tk = T.others(k) + .85; if (t > tk && t < tk + .7) { const st = homState(k * 2, t), [a, b] = XS[k], fx = a === 0 ? b : a; K.burst(st.x + G / 2, st.y + (fx - PR[k].c) * PR[k].L, 30, seg(t, tk, tk + .7), Z.gold, 'xb' + k); } }
    ring(MI - 260, 540, 120, 330, seg(t, T.grp, T.grp + 1), Z.gold, 'gL'); ring(MI + 260, 540, 120, 330, seg(t, T.grp + .6, T.grp + 1.6), Z.gold, 'gR');
    if (t > T.cenZoom1 + 1.2 && t < L(13, .6)) K.check(MI - 230 + 70, 346 - 80, 50, seg(t, T.cenZoom1 + 1.2, T.cenZoom1 + 1.6), 'cz1');
    CELLS2.forEach(([cx, cy], i) => { ring(cx, cy, 300, 300, seg(t, L(13, 3.1) + i * .4, L(13, 4.1) + i * .4), Z.gold, 'd2' + i); ring(cx, cy, 300, 300, seg(t, T.halve + i * .3, T.halve + 1 + i * .3), Z.gold, 'hv' + i); });
    CELLS2.forEach(([cx, cy], i) => { for (let k = 0; k < 3; k++) ring(cx + MIIX[k] + 20, cy, 80 * PR[k].L / 200 + 30, 46, seg(t, T.single + k * .35, T.single + k * .35 + .8), Z.gold, 's2' + i + k); });
    if (t2 > 0) {
      holdRing(960, 540, 720, 470, seg(t, T.ghost, T.ghost + .8) * (1 - seg(t, T.four4 - .2, T.four4 + .4)), '#9FB8AC', 'ghost', 3);
      let n = 0; CELLS2.forEach(([cx, cy]) => [-1, 1].forEach(s => { ring(cx, cy + s * 206, 205, 205, seg(t, T.four4 + n * .4, T.four4 + n * .4 + .8), Z.gold, 'f4' + n); n++; }));
    }
    camEnd();
    host(170, 1015, 28, t, [[L(7, -2), 'calm', { lookX: .8, lookY: -.4 }], [L(7, 4.6), 'wow', { lookX: .8, lookY: -.5 }], [L(7, 9.0), 'calm', { lookX: .9, lookY: -.6 }], [L(8, 3.0), 'idea', { lookX: .8 }], [L(8, 8.2), 'calm', { lookX: .9 }],
      [L(9, 1.0), 'wow', { lookX: .9, lookY: -.5 }], [L(9, 5.0), 'happy'], [L(9, 8.5), 'calm', { lookX: .9, lookY: -.6 }], [L(10, 4.3), 'wow', { lookX: .9, lookY: -.5 }], [L(10, 8.2), 'excited'], [L(10, 11.0), 'happy'],
      [L(11, 1.3), 'calm', { lookX: .9, lookY: -.4 }], [L(11, 9.4), 'confused'], [L(11, 11.9), 'idea'], [L(12, 1.2), 'strain'], [L(12, 3.4), 'wow', { lookX: .9 }], [L(12, 7.8), 'smug'],
      [L(13, 1.2), 'wow', { lookX: .9, lookY: -.4 }], [L(13, 6.0), 'calm', { lookX: .9, lookY: -.4 }], [L(13, 12.2), 'idea'], [L(14, .4), 'calm', { lookX: .9, lookY: -.5 }], [L(14, 3.0), 'smug'], [L(14, 8.7), 'calm', { lookX: .9 }],
      [L(15, 1.3), 'wow', { lookX: .9, lookY: -.5 }], [L(15, 7.5), 'idea'], [L(16, 1.2), 'calm', { lookX: .9, lookY: -.4 }], [L(16, 5.9), 'excited'], [L(16, 10.6), 'love']], {}, 'pc');
    if (lt < .5) flash(1 - seg(lt, 0, .5), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E4D4AE', Z.recap]);
  }

  // ================================ D: recap (205.3–221) ================================
  const RP = { L: 110, c: .4 }, RP3 = { L: 90, c: .4 }, RP4 = { L: 70, c: .4 };
  function shotD(t, lt, dur) {
    cam(960 + 5 * wob(t, .05), 520 + 4 * wob(t, .04), 1);
    K.wash(Z.recap, t, { key: 'd', blob: Z.recapBlob, rect: rectPts(-600, -600, W + 1200, H + 1200) });
    const t0 = L(17, -1.3), pop = i => backOut(seg(t, t0 + i * .55, t0 + i * .55 + .4));
    const g1 = near(t, L(17, 1.6), .55), d1 = near(t, L(17, 3.9), .3), d2 = near(t, L(17, 4.6), .3), g3 = seg(t, L(17, 6.2), L(17, 6.6)) * (1 - seg(t, L(17, 9.4), L(17, 9.9))), g4 = seg(t, L(17, 9.8), L(17, 10.2));
    const S1 = [270, 500], S2 = [690, 500], S3 = [[1110, 330], [1110, 670]], S4 = [[1560, 175], [1560, 395], [1560, 615], [1560, 835]];
    const A0 = '#C9B98F', R1 = 140, R3 = 112, R4 = 84;
    let q = pop(0); if (q > .02) { roundCell(S1[0], S1[1], R1 * q, 'r1'); for (const [s, col] of [[-1, Z.pat], [1, Z.mat]]) chromo(S1[0] + s * 24 * q, S1[1], Math.PI / 2, { L: 130 * q, c: .4 }, { rep: 0, segsA: solid(col), w: 20 * q }, 'r1' + s); }
    arrow(430, 500, 525, 500, seg(t, t0 + .4, t0 + .9), mixCol(A0, Z.gold, g1), 'ra1', 12 + 5 * g1);
    q = pop(1); if (q > .02) { roundCell(S2[0], S2[1], R1 * q, 'r2', { col: mixCol(Z.cyto, '#FFF3C4', g1) }); for (const [s, col] of [[-1, Z.pat], [1, Z.mat]]) chromo(S2[0] + s * 36 * q, S2[1], Math.PI / 2, { L: 130 * q, c: .4 }, { rep: 1, segsA: solid(col), w: 18 * q, hi: g1 }, 'r2' + s); }
    for (const [j, y1] of [[0, 360], [1, 640]]) arrow(845, j ? 560 : 440, 975, y1, seg(t, t0 + .95, t0 + 1.45), mixCol(A0, Z.gold, d1), 'ra2' + j, 12 + 5 * d1);
    q = pop(2); if (q > .02) S3.forEach(([x, y], i) => { roundCell(x, y, R3 * q, 'r3' + i, { col: mixCol(Z.cyto, '#FFF3C4', g3) }); chromo(x, y, Math.PI / 2, { L: 110 * q, c: .4 }, { rep: 1, segsA: solid(i ? Z.mat : Z.pat), w: 16 * q, hi: g3 * .6 }, 'r3c' + i); });
    S3.forEach(([x, y], i) => [0, 1].forEach(j => { const e = S4[i * 2 + j]; arrow(x + 125, y + (j ? 30 : -30), e[0] - 100, e[1], seg(t, t0 + 1.5, t0 + 2.0), mixCol(A0, Z.gold, d2), 'ra3' + i + j, 10 + 4 * d2); }));
    q = pop(3); if (q > .02) S4.forEach(([x, y], i) => { roundCell(x, y, R4 * q, 'r4' + i, { col: mixCol(Z.cyto, '#FFF3C4', g4) }); chromo(x, y, Math.PI / 2, { L: 90 * q, c: .4 }, { rep: 0, segsA: solid(i < 2 ? Z.pat : Z.mat), w: 14 * q, hi: g4 * .6 }, 'r4c' + i); });
    ring(S2[0], S2[1], 160, 160, seg(t, L(17, 1.3), L(17, 2.3)), Z.gold, 'rr2');
    S3.forEach(([x, y], i) => ring(x, y, 128, 128, seg(t, L(17, 6.4) + i * .3, L(17, 7.4) + i * .3), Z.gold, 'rr3' + i));
    S4.forEach(([x, y], i) => ring(x, y, 96, 96, seg(t, L(17, 10.0) + i * .2, L(17, 10.9) + i * .2), Z.gold, 'rr4' + i));
    camEnd();
    const pt = kf(t, [[L(17, 1.0), [-1.2, 1.7]], [L(17, 1.5), [1.1, 1.9]], [L(17, 3.7), [1.1, 1.9]], [L(17, 4.2), [.8, 2.1]], [L(17, 6.0), [.8, 2.1]], [L(17, 6.5), [.6, 2.3]], [L(17, 9.5), [.6, 2.3]], [L(17, 10), [.3, 2.4]]], ease);
    const keys = [[t0, 'calm', { lookY: -.6 }], [L(17, 1.0), 'calm', { lookX: -.6, lookY: -.8 }], [L(17, 3.7), 'happy'], [L(17, 6.0), 'calm', { lookX: .5, lookY: -.8 }], [L(17, 9.6), 'calm', { lookX: .9, lookY: -.8 }], [L(17, 12.6), 'smug']];
    host(330, 1010, 28, t, keys, t > L(17, 1.0) && t < L(17, 12.4) ? { armF: pt } : {}, 'pd');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E4D4AE', Z.recap]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#3B4280', Z.night]);
  }

  // ================================ E: 70 trillion (221–258.6) ================================
  const EP = [{ L: 160, c: .38 }, { L: 120, c: .45 }, { L: 80, c: .3 }], EW = 20, EG = 48, EY = [366, 554, 679], ECX = 470;
  const GAM = Array.from({ length: 8 }, (_, i) => ({ x: 1000 + (i % 4) * 190, y: i < 4 ? 330 : 600, bits: [(i >> 2) & 1, (i >> 1) & 1, i & 1] }));
  const SPF = Array.from({ length: 170 }, (_, i) => { const a = hash(i + 1100) * TAU, r = 260 + Math.sqrt(hash(i + 1101)) * 1500; return { x: 1100 + Math.cos(a) * r * 1.05, y: 520 + Math.sin(a) * r * .62, t0: hash(i + 1102), ang: hash(i + 1103) * TAU, col: mixCol(Z.pat, Z.mat, hash(i + 1104)) }; });
  const EGF = Array.from({ length: 90 }, (_, i) => { const a = hash(i + 1200) * TAU, r = Math.sqrt(hash(i + 1201)) * 1150; return { x: 3350 + Math.cos(a) * r * .9, y: 520 + Math.sin(a) * r * .75, t0: hash(i + 1202) }; });
  const KIDS = Array.from({ length: 46 }, (_, i) => { const a = hash(i + 1300) * TAU, r = Math.sqrt(hash(i + 1301)) * 1900; return { x: 2200 + Math.cos(a) * r * 1.2, y: 560 + Math.sin(a) * r * .55, t0: hash(i + 1302) }; });
  function shotE(t, lt, dur) {
    const c = kf(t, [[L(18, -1.3), [960, 520, 1]], [L(19, 0), [960, 520, 1]], [L(19, 4.6), [1150, 520, .42]], [L(19, 6.6), [1150, 520, .42]], [L(19, 8.0), [2200, 520, .33]], [L(20, 4.3), [2200, 520, .33]], [L(20, 8.9), [2200, 540, .26]]], ease);
    cam(c[0] + 6 * wob(t, .05) / c[2], c[1] + 4 * wob(t, .04) / c[2], c[2]);
    K.wash(Z.night, t, { key: 'e', blob: Z.nightBlob, rect: rectPts(-6000, -4000, W + 12000, H + 8000) });
    for (let i = 0; i < 40; i++) { boilSeed('st' + i); const x = -3000 + hash(i + 500) * 9000, y = -1800 + hash(i + 501) * 4600, tw = .5 + .5 * Math.sin(t * 2 + i); paint(starPts(x, y, (8 + 10 * hash(i)) * (.6 + .4 * tw) / c[2] * .6, .3, 4), { wash: '#C9CCF2', washOp: 200, ink: null }); }
    // the cell with three tetrads: each pair can face either way
    const cellK = 1 - seg(t, L(19, .3), L(19, 1.8));
    if (cellK > .02) {
      roundCell(ECX, 520, 260 * cellK, 'ec');
      dashed(ECX, 290, ECX, 760, cellK, '#A7B9AE', 'eplate', 12, 2);
      for (let k = 0; k < 3; k++) {
        const fl = seg(t, L(18, 4.8) + k * .35, L(18, 6.0) + k * .35), ph = ease(fl) * TAU, hiK = near(t, L(18, 6.6) + k * .7, .3) + near(t, L(18, 2.8) + k * .5, .25);
        for (const p of [0, 1]) { const sd = p ? 1 : -1, x = ECX + sd * EG / 2 * Math.cos(ph), y = EY[k] + sd * 60 * Math.sin(ph);
          chromo(ECX + (x - ECX) * cellK, 520 + (y - 520) * cellK, Math.PI / 2, { L: EP[k].L * cellK, c: EP[k].c }, { rep: 1, bow: 0, segsA: solid(p ? Z.mat : Z.pat), w: EW * cellK, hi: clamp(hiK) }, 'et' + k + p); }
        ring(ECX, EY[k], 75, EP[k].L * .62, seg(t, L(18, 6.6) + k * .7, L(18, 7.5) + k * .7), Z.gold, 'e2' + k);
      }
    }
    // the eight gametes, then the field of sperm
    const tailK = seg(t, L(19, 1.4), L(19, 2.6));
    const fuse = seg(t, L(20, 2.0), L(20, 2.8));
    GAM.forEach((g, i) => {
      const q = backOut(seg(t, L(18, 8.6) + i * .17, L(18, 9.0) + i * .17)) * (1 - fuse); if (q <= .02) return;
      if (tailK < .5) { roundCell(g.x, g.y, 76 * q * (1 - tailK), 'gm' + i, { col: '#E9ECF8', dk: '#C3C9E8' }); g.bits.forEach((b, k) => rod(g.x + (k - 1) * 28 * q, g.y, EP[k].L * .45 * q * (1 - tailK), 13 * q, b ? Z.mat : Z.pat, -Math.PI / 2, 'gr' + i + k, near(t, L(18, 10.6) + i * .1, .2))); }
      else sperm(g.x, g.y, 4 * ease(tailK), -.3 + .2 * Math.sin(t * 2 + i), t, mixCol(Z.pat, Z.mat, g.bits.reduce((a, b) => a + b, 0) / 3), 'gs' + i, ease(tailK));
    });
    const conv = ease(seg(t, L(20, 0), L(20, 2.6)));
    SPF.forEach((s, i) => {
      const k = backOut(seg(t, L(19, 2.0) + s.t0 * 3, L(19, 2.4) + s.t0 * 3)); if (k <= .02 || fuse >= 1) return;
      const x = lerp(s.x, lerp(s.x, 2200, .8), conv), y = s.y + 20 * Math.sin(t * 1.5 + i);
      sperm(x, y, 4.5 * k * (1 - fuse), conv > 0 ? 0 : s.ang + .3 * Math.sin(t + i), t, s.col, 'sf' + i, 1);
    });
    EGF.forEach((e, i) => {
      const k = backOut(seg(t, L(19, 6.8) + e.t0 * 1.4, L(19, 7.2) + e.t0 * 1.4)); if (k <= .02 || fuse >= 1) return;
      const x = lerp(e.x, lerp(e.x, 2200, .75), conv);
      boilSeed('ef' + i); paint(ellPts(x, e.y, 62 * k * (1 - fuse), 62 * k * (1 - fuse), 16), { wash: '#F4B9B4', ink: PAL.ink, sw: 2.2 }); paint(ellPts(x - 14, e.y - 10, 22 * k * (1 - fuse), 22 * k * (1 - fuse), 10), { wash: '#FBE1D8', ink: null });
    });
    if (fuse > 0 && fuse < 1) for (let i = 0; i < 18; i++) K.sparkle(2200 + (hash(i + 70) - .5) * 3800, 540 + (hash(i + 71) - .5) * 1800, 120, clamp(fuse * 1.3 - hash(i + 72) * .3), '#FFF3C4');
    // the sea of possible babies, and it keeps going
    KIDS.forEach((b, i) => {
      const k = backOut(seg(t, L(20, 2.3) + b.t0 * 1.6, L(20, 2.7) + b.t0 * 1.6)); if (k <= .02) return;
      tinted(babyCols(i + 7), () => pip(b.x, b.y, 34 * k, { ...pipFeel(['happy', 'laugh', 'wow', 'calm', 'excited'][i % 5], t, { seed: i }), noShadow: true, weight: 2.2, key: 'kd' + i }));
    });
    const more = seg(t, L(20, 4.2), L(20, 9.0));
    for (let i = 0; i < 70; i++) { const k = seg(more, hash(i + 1400) * .8, hash(i + 1400) * .8 + .15); if (k <= .02) continue; boilSeed('mo' + i);
      const x = 2200 + (hash(i + 1401) - .5) * 7200, y = 540 + (hash(i + 1402) - .5) * 4000, r = 26 * backOut(k);
      paint(ellPts(x, y, r, r * 1.2, 10), { wash: babyCols(i + 99).pip, ink: PAL.ink, sw: 2 }); paint(ellPts(x + r * .5, y - r * 1.6, r * .5, r * .28, 8, 0, -.6), { wash: PIPC.leaf, ink: null }); }
    camEnd();
    const keys = [[L(18, -1.3), 'calm', { lookX: -.4, lookY: -.6 }], [L(18, .3), 'confused'], [L(18, 2.7), 'calm', { lookX: -.8, lookY: -.6 }], [L(18, 8.8), 'wow', { lookX: .6, lookY: -.6 }], [L(18, 10.4), 'happy'],
      [L(19, .3), 'calm', { lookY: -.7 }], [L(19, 4.9), 'wow'], [L(20, 2.4), 'excited'], [L(20, 6.7), 'dizzy'], [L(20, 10.5), 'laugh']];
    host(1090, 1015, 26, t, keys, {}, 'pe');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#3B4280', Z.night]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#C9AFC5', Z.mauve]);
  }

  // ================================ F: when it goes wrong (258.6–274.4) ================================
  const FP = [{ L: 180, c: .38 }, { L: 135, c: .45 }, { L: 90, c: .3 }], FW = 23, FG = 54, FX = 800, FY = [330, 545, 695];
  function shotF(t, lt, dur) {
    const c = kf(t, [[L(21, -1.2), [900, 530, 1]], [L(21, 8.0), [900, 530, 1]], [L(21, 9.0), [1050, 530, .95]], [L(21, 10.8), [1180, 540, 1.25]], [L(21, 12.9), [1180, 540, 1.32]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash(Z.mauve, t, { key: 'f', blob: Z.mauveBlob, rect: rectPts(-1200, -1000, W + 2400, H + 2000) });
    const an = ease(seg(t, L(21, 4.8), L(21, 6.6))), div = seg(t, L(21, 6.9), L(21, 7.8)), toEgg = ease(seg(t, L(21, 8.0), L(21, 9.0)));
    const poles = [[FX - 300, 520], [FX + 300, 520]];
    let cells = null;
    if (toEgg <= 0) cells = dividing(FX, 520, 340, 260, 280, div, 'x', 'fc');
    else {                                                        // the gamete with two 21s meets an egg with one
      egg(1240, 530, 260, t, 'fe');
      const gx = lerp(FX - 280, 1240, toEgg), gr = lerp(260, 0, toEgg);
      if (gr > 8) roundCell(gx, 520, gr, 'fg');
    }
    if (div < .3 && toEgg <= 0) { polarFibres(poles[0], poles[1], 1 - div / .3, 'fpp'); poles.forEach((p, i) => centrosome(p[0], p[1], 1 - div / .3, 'fp' + i)); }
    const snap = L(21, 5.6);
    for (let k = 0; k < 3; k++) for (const p of [0, 1]) {
      const side = p ? 1 : -1, stuck = k === 2;
      let x = FX + side * FG / 2, y = FY[k];
      if (!stuck) x = FX + side * (FG / 2 + 220 * an);
      else { const go = ease(seg(t, L(21, 5.0), L(21, 7.0))); x = FX - 230 * go + side * FG / 2 * (1 - go * .2) + (p ? 30 * Math.sin(t * 25) * (1 - seg(t, snap, snap + .4)) * seg(t, L(21, 4.6), snap) : 0); }
      let col = p ? Z.mat : Z.pat, ang = Math.PI / 2, rep = 1, w = FW, Pk = FP[k];
      if (toEgg > 0) {                                             // inside the zygote: single chromosomes, the 21s gathered
        if (x > FX) continue;
        const slots = stuck ? [[1160 + p * 44, 600]] : [[1080 + k * 50 + p * 20, 450 - k * 10]];
        x = lerp(x - 280 * 0 + (lerp(FX - 280, 1240, toEgg) - (FX - 280)), slots[0][0], toEgg); y = lerp(y, slots[0][1], toEgg); rep = 1 - toEgg; w = lerp(FW, 18, toEgg); Pk = { L: lerp(FP[k].L, FP[k].L * .7, toEgg), c: FP[k].c };
      }
      const hiK = stuck ? near(t, L(21, 4.2), .4) + (toEgg >= 1 ? near(t, L(21, 9.5) + p * .3, .25) : 0) : 0;
      chromo(x, y, ang, Pk, { rep, bow: lerp(0, FW * .5, an), segsA: solid(col), w, hi: clamp(hiK) }, 'f' + k + p);
      if (div < .3 && toEgg <= 0) {
        const pole = poles[stuck ? (p && t > snap ? 0 : p) : p];
        fibre(pole[0], pole[1], x, y, 1 - div / .3, 'ff' + k + p, 6);
        if (stuck && p && t > snap && t < snap + .6) K.burst(x + 40, y, 30, seg(t, snap, snap + .6), PAL.ink, 'snap');
      }
    }
    if (toEgg > 0) {                                               // the egg's own set: one of each, the 21 joins the other two
      const q = ease(seg(t, L(21, 8.2), L(21, 9.0)));
      [[1290, 440, 0], [1340, 440, 1], [1250, 600, 2]].forEach(([x, y, k]) => chromo(x, y, Math.PI / 2, { L: FP[k].L * .7 * q, c: FP[k].c }, { rep: 0, segsA: solid(Z.egg21), w: 18 * q, hi: k === 2 ? clamp(near(t, L(21, 10.1), .25)) : 0 }, 'fz' + k));
      holdRing(1205, 600, 120, 80, seg(t, L(21, 10.5), L(21, 11.1)), Z.gold, 'tri', 3);
    }
    ring(FX + 0, FY[2], 80, 70, seg(t, L(21, 3.9), L(21, 4.9)), Z.gold, 'f21');
    camEnd();
    host(170, 1015, 28, t, [[L(21, -1.2), 'calm', { lookX: .9, lookY: -.4 }], [L(21, 1.1), 'calm', { lookX: .9, lookY: -.5 }], [L(21, 5.7), 'worried'], [L(21, 8.2), 'calm', { lookX: .9, lookY: -.4 }], [L(21, 10.7), 'sad']], {}, 'pf');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#C9AFC5', Z.mauve]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E9B47F', Z.home]);
  }

  // ================================ G: you (274.4–290) ================================
  function shotG(t, lt, dur) {
    const c = kf(t, [[L(22, -.8), [960, 620, .5]], [L(22, .4), [960, 620, .5]], [L(22, 3.2), [960, 680, 1.02]], [L(22, 9.0), [960, 700, 1.1]], [L(22, 13), [960, 720, 1.16]]], ease);
    cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    homeBg(t, 'g');
    const spot = ease(seg(t, L(22, 1.6), L(22, 3.4)));
    if (spot > .02) { boilSeed('spot'); paint([[960 - 120, -200], [960 + 120, -200], [960 + 260, 890], [960 - 260, 890]], { wash: '#FFF1CF', washOp: 120 * spot, ink: null }); paint(ellPts(960, 900, 260, 40, 24), { wash: '#FFF1CF', washOp: 170 * spot, ink: null }); }
    // the crowd of other possible babies leaves, one by one
    for (let i = 0; i < 40; i++) {
      let x = -700 + hash(i + 1500) * 3320, y = 160 + hash(i + 1501) * 1400; if (Math.abs(x - 960) < 760 && y > 300 && y < 1000) x += x < 960 ? -800 : 800;
      const gone = seg(t, L(22, .4) + hash(i + 1502) * 2.6, L(22, .8) + hash(i + 1502) * 2.6); if (gone >= 1) continue;
      tinted(babyCols(i + 3), () => pip(x, y, 30 * (1 - easeIn(gone)), { ...pipFeel(['happy', 'calm', 'wave', 'wow'][i % 4], t, { seed: i }), noShadow: true, key: 'gk' + i }));
      if (gone > 0) K.sparkle(x, y - 90, 40, gone, PAL.cream);
    }
    family(t, [[L(22, -1), 'calm', { lookX: .8, lookY: .3 }], [L(22, 6.5), 'love'], [L(22, 9.2), 'happy']], [[L(22, -1), 'calm', { lookX: .8, lookY: .3 }], [L(22, 6.8), 'love'], [L(22, 9.4), 'happy']],
      { papa: { rot: .08 * ease(seg(t, L(22, 6.5), L(22, 7.3))) }, mama: { rot: -.08 * ease(seg(t, L(22, 6.8), L(22, 7.6))) } });
    const P = HOME.pip;
    pip(P[0], P[1], 30, { ...K.act(t, [[L(22, -1), 'calm', { lookX: -.4 }], [L(22, 1.4), 'wow'], [L(22, 3.6), 'calm', { lookY: -.7 }], [L(22, 6.7), 'love'], [L(22, 8.4), 'laugh'], [L(22, 10.6), 'happy']]), key: 'pg' });
    for (let i = 0; i < 12; i++) { const a = seg(t, L(22, 3.4) + i * .22, L(22, 4.3) + i * .22); if (a > 0 && a < 1) K.sparkle(P[0] + Math.cos(i * 2.4) * 150, P[1] - 120 + Math.sin(i * 2.4) * 120 - 40 * a, 26, a, i % 2 ? '#CFDDF6' : '#F9D3DD'); }
    const at = toScreen(P[0], P[1] - 2.8 * 30);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E9B47F', Z.home]);
    const close = seg(t, DUR - 2.6, DUR - .5);
    if (close > 0) iris(at[0], at[1], kf(close, [[0, 1800], [.6, 240], [.8, 220], [1, 0]], easeIn));
  }

  // ================================ the cover (a still: node render.mjs --page=meiosis.html --loop=cover --stills=.5) ================================
  LOOPS.cover = t => {
    K.wash(Z.home, t, { key: 'cv', blob: Z.homeBlob, rect: rectPts(-200, -200, W + 400, H + 400) });
    boilSeed('cvfloor'); paint(rectPts(-200, 905, W + 400, 400), { wash: Z.floor, ink: null });
    // the mint "inside the cell" disc behind the hero, and a scatter of other possible babies
    boilSeed('cvdisc'); paint(ellPts(1440, 470, 430, 400, 48), { wash: Z.tissue, fill: Z.tissueBlob, fillOp: 90, bleed: .2, tex: .5, ink: null });
    paint(ellPts(1440, 470, 360, 335, 48), { wash: Z.cyto, fill: Z.cytoDk, fillOp: 50, tex: .45, ink: PAL.ink, sw: 1.6, curv: .2 });
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * TAU + .2, x = 1440 + Math.cos(a) * 470 * (1 + .08 * hash(i)), y = 470 + Math.sin(a) * 430;
      if (y > 760 || x > 1880 || x < 980) continue;
      tinted(babyCols(i + 11), () => pip(x, y + 40, 15 + 4 * hash(i + 3), { ...pipFeel(['happy', 'love', 'laugh', 'calm'][i % 4], .4 + i * .3, { seed: i }), noShadow: true, flip: x > 1440, key: 'cvb' + i }));
    }
    // the hero: a tetrad mid crossing-over, blue with a rose tip, rose with a blue tip
    const S = 2.25, P0 = { L: 200 * S, c: .38 }, cx = 1440, cy = 400, g = G * S * .95, w = W0 * S;
    const [fa] = XS[0];
    const segP = [[0, fa, Z.pat], [fa, 1, Z.mat]], segM = [[0, fa, Z.mat], [fa, 1, Z.pat]];
    const fxY = cy + (fa - P0.c) * P0.L;
    chromo(cx - g / 2, cy, Math.PI / 2, P0, { rep: 1, bow: 4, w, segsA: solid(Z.pat), segsB: segP }, 'cvP');
    chromo(cx + g / 2, cy, Math.PI / 2, P0, { rep: 1, bow: 4, w, segsA: segM, segsB: solid(Z.mat) }, 'cvM');
    K.sparkle(cx + 70, fxY - 40, 46, .35, '#FFF3C4'); K.sparkle(cx - 120, cy - 170, 30, .3, '#FFF3C4'); K.sparkle(cx + 130, cy - 120, 24, .28, '#FFF3C4');
    K.burst(cx, fxY, 90, .35, Z.gold, 'cvx');
    // the family under it: Papa, Pip (wow, looking up), Mama
    tinted(PAPA, () => pip(1120, 1020, 38, { ...pipFeel('happy', .3, { seed: 3 }), lookX: .6, lookY: -.6, key: 'cvpa' }));
    tinted(MAMA, () => pip(1780, 1020, 38, { ...pipFeel('happy', 1.1, { seed: 5 }), flip: true, lookY: -.6, key: 'cvma' }));
    pip(1450, 1030, 42, { ...pipFeel('wow', .2), lookY: -.5, emote: 'exclaim', emoteK: 1, key: 'cvpip' });
    // the words: a tag, the hook in two lines, the number
    boilSeed('cvtag'); paint(rrPts(80, 92, 540, 92, 30, 2), { wash: '#D9708E', fill: '#B2526F', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
    const F = (wgt, px) => `${wgt} ${px}px "PingFang SC", "Hiragino Sans GB", "STHeiti", sans-serif`;
    letter('高中生物 · 减数分裂', 350, 140, 50, PAL.cream, { font: F(800, 50), screen: true });
    letter('爸妈再生一个', 92, 330, 138, '#3B2F45', { font: F(900, 138), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    letter('为什么不是你？', 92, 500, 138, '#3B2F45', { font: F(900, 138), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    boilSeed('cvblob'); paint(ellPts(380, 745, 330, 120, 30, 6, -.05), { wash: '#FBE2A6', fill: Z.gold, fillOp: 70, bleed: .2, tex: .6, ink: null });
    letter('70万亿', 330, 745, 170, Z.gold, { font: F(900, 170), stroke: '#3B2F45', screen: true, rot: -.04 });
    letter('种可能的你', 360, 880, 64, '#3B2F45', { font: F(800, 64), stroke: PAL.cream, screen: true, ink: false, rot: -.02 });
  };
  LOOPS.cover.len = 1;

  shots([[0, shotA], [L(2, 9.6), shotB], [L(6, 9.7), shotC], [L(16, 13.8), shotD], [L(18, -1.3), shotE], [L(21, -1.2), shotF], [L(22, -.8), shotG]]);
})();

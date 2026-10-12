// mrna_kit.js: the cast and props of "Pip讲mRNA疫苗" (src/scenes/mrna.js), as globals in MK.
// Molecules follow their real architecture, simplified: the mRNA (m7G cap, UTRs, codons, poly(A)), the 80S ribosome
// (small subunit under the message, large one above, the chain leaving through the large subunit), the spike trimer
// (S1 head, S2 stalk, membrane anchor), IgG (two heavy + two light chains), lipids with heads and two tails,
// bilayers, the LNP, MHC I/II grooves with a peptide, the TCR. Only cells (and Pip) get faces.
const MK = (() => {
  const C = {
    cyto: '#F6DCC8', cytoDk: '#ECC3A8', board: '#DDEEE8', boardDk: '#C3E0D7', extra: '#C7DCEF', extraDk: '#A9C6E3',
    muscle: '#F1C7C3', muscleDk: '#E3A6A1', lymph: '#E3EBC2', lymphDk: '#C9D898', acid: '#F2B8C0',
    back: '#FBF2DF', A: '#E8AA38', U: '#3A9C98', G: '#6E9F58', Cb: '#D9708A', psi: '#F2C14A', pro: '#7B5CA8', cap: '#C8463F',
    s1: '#E46A5C', s2: '#C9524A', s1Lt: '#F2A08F', ab: '#4F74C2', abLt: '#9CB5E6',
    riboL: '#6FA79A', riboS: '#A9D3C6', chain: '#E46A5C',
    ion: '#E27A92', phos: '#6E9BD3', chol: '#F2C860', peg: '#7DB86A', tail: '#E9D8B8',
    nuc: '#A28BC8', nucDk: '#7C66A6', er: '#E79E95', erDk: '#C77A72', golgi: '#E6B865', golgiDk: '#BE8F3E',
    dc: '#F0A35E', dcDk: '#C77B38', th: '#7FB6E0', thDk: '#4F8CC0', bc: '#7CC0A0', bcDk: '#4F9877', ctl: '#E07F74', ctlDk: '#B85A50',
    mhc2: '#E8B24A', mhc1: '#5FA8A3', tcr: '#3E6FA8', virus: '#B59AC9', virusDk: '#8B6FA6', ace: '#5FA8A3',
    gold: '#F4C54A', goldDk: '#C99A2E', red: '#D2413F', green: '#3E9A4E'
  };
  const SEQ = ['A', 'U', 'G', 'Cb'];
  const baseOf = (i, seed = 0) => SEQ[Math.floor(hash(i * 3.71 + seed * 17.3 + 5) * 4)];

  // ---------- paths ----------
  // A dense, arc-length-indexed polyline: at(s) → [x, y, angle] for s in [0, L].
  function track(P, n = 8) {
    const Cp = P.length > 40 ? P : through(P, n), L = [0];
    for (let i = 1; i < Cp.length; i++) L.push(L[i - 1] + Math.hypot(Cp[i][0] - Cp[i - 1][0], Cp[i][1] - Cp[i - 1][1]));
    const at = s => {
      s = clamp(s, 0, L[L.length - 1]); let i = 1; while (i < Cp.length - 1 && L[i] < s) i++;
      const a = Cp[i - 1], b = Cp[i], k = (s - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.atan2(b[1] - a[1], b[0] - a[0])];
    };
    const sub = (s0, s1, step = 10) => { const out = []; for (let s = s0; s < s1; s += step) out.push(at(s).slice(0, 2)); out.push(at(s1).slice(0, 2)); return out; };
    return { C: Cp, L: L[L.length - 1], at, sub };
  }

  // ---------- painted marks: 5′/3′, +, −, ✓, ✗, sparkles ----------
  const GL = {
    '3': [[[[-.3, -.36], [-.08, -.48], [.18, -.44], [.3, -.28], [.22, -.08], [-.02, 0]], .6], [[[-.02, 0], [.24, .08], [.34, .26], [.2, .44], [-.06, .48], [-.32, .36]], .6]],
    '5': [[[[.3, -.46], [-.24, -.46], [-.28, -.04]], 0], [[[-.28, -.04], [-.04, -.12], [.2, -.06], [.33, .14], [.26, .38], [.02, .48], [-.3, .38]], .5]],
    '-': [[[[-.3, 0], [.3, 0]], 0]],
    '+': [[[[-.3, 0], [.3, 0]], 0], [[[0, -.3], [0, .3]], 0]],
    "'": [[[[.08, -.5], [-.06, -.16]], 0]]
  };
  function glyph(ch, x, y, s, col = PAL.ink, sw = 1.4) { for (const [P, c] of GL[ch] || []) inkLine(P.map(([a, b]) => [x + a * s, y + b * s]), sw, col, 'ink', c); }
  function endMark(d, x, y, s, k, col = PAL.ink, key = '') {
    if (k <= .02) return; boilSeed('em' + key);
    push(); translate(x, y); scale(backOut(clamp(k)));
    glyph(d, -s * .14, 0, s, col, clamp(s / 20, 1, 2.6)); glyph("'", s * .34, -s * .12, s * 1.15, col, clamp(s / 16, 1.2, 3));
    pop();
  }
  function charge(sign, x, y, s, k, col, key = '') {        // a + or − in a little disc
    if (k <= .02) return; boilSeed('ch' + key);
    const q = backOut(clamp(k));
    paint(ellPts(x, y, s * .55 * q, s * .55 * q, 12), { wash: PAL.cream, ink: col, sw: clamp(s / 22, .5, 1.2) });
    glyph(sign, x, y, s * .8 * q, col, clamp(s / 9, .8, 2.6));
  }
  function check(x, y, s, k, key) { if (k <= 0) return; boilSeed('ck' + key); const q = clamp(k * 1.6), P = [[-.5, 0], [-.12, .4], [.6, -.55]].map(([a, b]) => [x + a * s, y + b * s]); inkLine(q < .5 ? [P[0], [lerp(P[0][0], P[1][0], q * 2), lerp(P[0][1], P[1][1], q * 2)]] : [P[0], P[1], [lerp(P[1][0], P[2][0], q * 2 - 1), lerp(P[1][1], P[2][1], q * 2 - 1)]], s / 26, C.green, 'ink', 0); }
  function cross(x, y, s, k, key) { if (k <= 0) return; boilSeed('cx' + key); const a = clamp(k * 2), b = clamp(k * 2 - 1); inkLine([[x - s * .45, y - s * .45], [x - s * .45 + s * .9 * a, y - s * .45 + s * .9 * a]], s / 26, C.red, 'ink', 0); if (b > 0) inkLine([[x + s * .45, y - s * .45], [x + s * .45 - s * .9 * b, y - s * .45 + s * .9 * b]], s / 26, C.red, 'ink', 0); }
  function sparkle(x, y, r, k, col = PAL.cream) { if (k > 0 && k < 1) paint(starPts(x, y, r * backOut(k) * (1 - k * .5), .28, 4, k * 1.5), { wash: col, washOp: 255 * (1 - k * k), ink: null }); }
  function burst(x, y, r, k, col = PAL.ink, key = '') {      // pop lines around a point
    if (k <= 0 || k >= 1) return; boilSeed('bu' + key);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2, r0 = r * (.6 + .5 * easeOut(k)), r1 = r0 + r * .4 * (1 - k); inkLine([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 1.4, col, 'ink', 0); }
  }

  // ---------- backgrounds ----------
  function wash(col, t, o = {}) {                             // a full-frame watercolour ground with drifting soft blobs
    boilSeed('bg' + (o.key || ''));
    paint(o.rect || rectPts(-1400, -1400, W + 2800, H + 2800), { wash: col, ink: null });
    const n = o.n ?? 6;
    for (let i = 0; i < n; i++) {
      boilSeed('bgb' + i + (o.key || ''));
      const x = hash(i + 3) * W + 70 * wob(t, .03, i * .3), y = hash(i + 7) * H + 50 * wob(t, .025, i);
      paint(ellPts(x, y, 250 + 140 * hash(i), 150 + 70 * hash(i + 1), 18, 6), { fill: mixCol(col, o.blob || PAL.cream, .5), fillOp: 85, bleed: .3, tex: .5, ink: null });
    }
  }
  function motes(t, n, col, o = {}) {                          // small drifting particles: life in the medium
    for (let i = 0; i < n; i++) {
      boilSeed('mote' + i + (o.key || ''));
      const sp = 14 + 20 * hash(i + 90), x = frac(hash(i + 91) + t * sp / 2400 * (o.dir ?? 1)) * (W + 200) - 100 + (o.x0 || 0), y = hash(i + 92) * H + 26 * wob(t, .12, i * .37) + (o.y0 || 0);
      const r = 3 + 6 * hash(i + 93);
      paint(ellPts(x, y, r, r * .8, 8), { wash: col, washOp: 200, ink: null });
    }
  }

  // a quiet cytoplasm behind the action: microtubules, a mitochondrion, ER sheets, free ribosomes. Low contrast.
  function cytoplasm(t, o = {}) {
    const k = o.key || 'cy', base = o.col || C.cyto, ink = mixCol(base, PAL.ink, .22), x0 = o.x0 || 0, y0 = o.y0 || 0;
    boilSeed(k + 'mt');
    for (let i = 0; i < 4; i++) { const y = y0 + 80 + i * 260 + 30 * hash(i + 5), P = []; for (let j = 0; j <= 6; j++) P.push([x0 - 300 + j * 450, y + 40 * Math.sin(j * 1.3 + i) + 6 * wob(t, .05, i)]); inkLine(P, 1.2, mixCol(base, PAL.ink, .12), 'inkfine', .6); }
    if (o.mito !== false) {
      const [mx, my] = o.mito || [x0 + 220, y0 + 960]; boilSeed(k + 'mi');
      push(); translate(mx, my); rotate(-.25 + .03 * wob(t, .07));
      paint(ellPts(0, 0, 190, 78, 28, 2), { wash: mixCol(base, '#E39A7A', .45), fill: mixCol(base, '#C9785A', .4), fillOp: 60, tex: .5, ink, sw: .9 });
      const P = []; for (let j = 0; j <= 12; j++) P.push([-150 + j * 25, (j % 2 ? -1 : 1) * 46]);
      inkLine(P, 1, mixCol(base, '#B0644A', .55), 'ink', .2);
      pop();
    }
    if (o.er !== false) {
      const [ex, ey] = o.er || [x0 + 1650, y0 + 120]; boilSeed(k + 'er');
      for (let j = 0; j < 3; j++) { const P = []; for (let i = 0; i <= 8; i++) P.push([ex - 360 + i * 95, ey + j * 52 + 18 * Math.sin(i * .9 + j + t * .3)]); paint(ribbon(P, 26, 26), { wash: mixCol(base, C.er, .35), ink, sw: .7 });
        for (let i = 0; i < 8; i++) paint(ellPts(P[i][0] + 40, P[i][1] - 15, 4.5, 4.5, 8), { wash: mixCol(base, C.riboL, .5), ink: null }); }
    }
    boilSeed(k + 'fr');
    for (let i = 0; i < (o.ribos ?? 26); i++) { const x = x0 + hash(i + 300) * 2000 - 40 + 10 * wob(t, .08, i * .2), y = y0 + hash(i + 301) * 1100; paint(ellPts(x, y, 6, 5, 8), { wash: mixCol(base, C.riboL, .45), ink: null }); }
  }

  // ---------- the mRNA ----------
  // strand(T, o): T = track(); bases sit every o.step px, pegs hang on the +normal side.
  //   o.n5 (5′UTR pegs), o.nc (end of CDS, peg index), o.cap (0..1), o.tail (0..1), o.tailN, o.mod(i) (0..1 U → m1Ψ),
  //   o.pro [i, j] with o.proK, o.hi(i) 0..1 highlight, o.minus 0..1, o.crumble 0..1, o.s0/o.s1 (draw only that span),
  //   o.capPos (override where the cap sits, world [x, y, ang]) ...
  function strand(T, o = {}) {
    const step = o.step || 26, w = o.w || 14, pl = o.pegLen || 22, pw = o.pegW || 11, key = o.key || 'rna', sw = o.sw ?? 1.1;
    const s0 = o.s0 ?? 0, s1 = o.s1 ?? T.L, cr = o.crumble || 0, n = Math.floor(T.L / step);
    if (cr >= .99) return;
    const off = i => { if (!cr) return [0, 0, 0, 1]; const c = Math.floor(i / 3); return [(hash(c + 40) - .5) * 240 * easeOut(cr), (hash(c + 41) - .3) * 200 * easeOut(cr), (hash(c + 42) - .5) * 2.4 * cr, 1 - easeIn(cr)]; };
    // backbone
    boilSeed(key + 'bb');
    if (!cr) { if (s1 - s0 > 4) paint(ribbon(T.sub(s0, s1, 8), w, w), { wash: o.back || C.back, ink: PAL.ink, sw }); }
    else for (let c = 0; c * 3 * step < T.L; c++) {
      const a = Math.max(s0, c * 3 * step), b = Math.min(s1, (c + 1) * 3 * step - 4); if (b - a < 6) continue;
      const [dx, dy, , sc] = off(c * 3); if (sc < .05) continue;
      paint(ribbon(T.sub(a, b, 8).map(([x, y]) => [x + dx, y + dy]), w * sc, w * sc), { wash: o.back || C.back, ink: PAL.ink, sw: sw * sc });
    }
    // pegs
    for (let i = 0; i < n; i++) {
      const s = (i + .5) * step; if (s < s0 || s > s1) continue;
      const [x, y, ang] = T.at(s), nx = -Math.sin(ang), ny = Math.cos(ang), [dx, dy, dr, sc] = off(i);
      if (sc < .05) continue;
      let kind = baseOf(i, o.seed || 0), col = C[kind];
      const utr = o.n5 != null && (i < o.n5 || i >= o.nc);
      if (utr) col = mixCol(col, PAL.cream, .45);
      if (o.recol) col = o.recol(i, col, kind);
      const m = kind === 'U' && o.mod ? clamp(o.mod(i)) : 0;
      if (m > 0) col = mixCol(col, C.psi, ease(m));
      const h = o.hi ? clamp(o.hi(i)) : 0, len = pl * (1 + .35 * h) * sc;
      if (h > 0) col = mixCol(col, PAL.cream, .25 * h);
      boilSeed(key + 'p' + i);
      push(); translate(x + dx, y + dy); rotate(ang + dr);
      const isPro = o.pro && o.pro.includes(i) && (o.proK || 0) > 0;
      if (isPro) {
        const k = clamp(o.proK), r = pw * (.9 + .5 * backOut(k));
        paint(rrPts(-pw * .3, w * .45, pw * .6, len * .55, pw * .2), { wash: C.pro, ink: PAL.ink, sw: sw * .7 });
        paint(starPts(0, w * .45 + len * .55 + r * .75, r, .81, 5, -Math.PI / 2), { wash: mixCol(col, C.pro, ease(k)), ink: PAL.ink, sw: sw * .8 });
      } else {
        paint(rrPts(-pw / 2 * sc, w * .45, pw * sc, len, pw * .45 * sc), { wash: col, ink: PAL.ink, sw: sw * .7 });
        if (m > .5) paint(ellPts(0, w * .45 + len + 4, 4.2 * sc, 4.2 * sc, 8), { wash: PAL.ink, ink: null });   // the N1-methyl
      }
      pop();
      if (m > 0 && m < 1) sparkle(x + nx * (w + len), y + ny * (w + len), 22, m, PAL.cream);
      if (o.minus > 0 && i % 3 === 1) charge('-', x - nx * (w + 16), y - ny * (w + 16), 22, seg(o.minus, i / n * .6, i / n * .6 + .4), C.phos, key + 'm' + i);
    }
    // poly(A) tail: beads continuing past the 3′ end
    const e3 = T.at(T.L);
    if (o.tail > 0 && s1 >= T.L - 1) {
      const N = o.tailN || 14, shown = o.tail * N, bs = o.bead || 15;
      for (let i = 0; i < Math.ceil(shown); i++) {
        const q = clamp(shown - i), d = (i + .8) * bs * 1.25, wv = Math.sin(i * .7 - T_ * 3) * 6 * Math.min(1, i / 3);
        const [dx, dy, , sc] = off(n + i);
        const x = e3[0] + Math.cos(e3[2]) * d - Math.sin(e3[2]) * wv + dx, y = e3[1] + Math.sin(e3[2]) * d + Math.cos(e3[2]) * wv + dy;
        boilSeed(key + 't' + i); if (sc > .05) paint(ellPts(x, y, bs * .55 * backOut(q) * sc, bs * .55 * backOut(q) * sc, 10), { wash: C.A, ink: PAL.ink, sw: sw * .7 });
      }
    }
    // the cap: m7G joined 5′-5′, drawn as a small red cap on the strand's head
    const e5 = o.capPos || T.at(0);
    if (o.cap > 0 && s0 <= 1) cap(e5[0] + off(0)[0], e5[1] + off(0)[1], e5[2], o.capS || 1, o.cap, key);
    return { e5: T.at(0), e3, peg: i => { const s = (i + .5) * step, [x, y, ang] = T.at(s); return [x - Math.sin(ang) * (w + pl), y + Math.cos(ang) * (w + pl), ang]; }, n, step };
  }
  function cap(x, y, ang, s, k, key = '') {
    if (k <= .02) return; boilSeed('cap' + key);
    push(); translate(x, y); rotate(ang); scale(backOut(clamp(k)) * s);
    const P = []; for (let i = 0; i <= 14; i++) { const a = Math.PI / 2 + i / 14 * Math.PI; P.push([-6 + Math.cos(a) * 22, Math.sin(a) * 19]); }
    P.push([4, 19], [4, -19]);
    paint(P, { wash: C.cap, fill: mixCol(C.cap, PAL.ink, .25), fillOp: 60, tex: .4, ink: PAL.ink, sw: 1 });
    paint(rrPts(-2, -21, 9, 42, 4), { wash: mixCol(C.cap, PAL.cream, .35), ink: PAL.ink, sw: .9 });   // the 5′–5′ triphosphate band
    paint(ellPts(-30, 0, 6, 6, 10), { wash: mixCol(C.cap, PAL.cream, .5), ink: PAL.ink, sw: .8 });       // the methyl
    pop();
  }
  let T_ = 0;                                                  // the frame's time, for the tail's wave (set by setT)
  const setT = t => { T_ = t; };

  // ---------- the ribosome: 40S under the message, 60S over it ----------
  // (x, y) = the point on the mRNA it sits on; ang = the strand's angle. o.k: 0..1 assembly, o.stall (0..1, frozen),
  // o.chain: a list of world points for the nascent peptide (it leaves from the large subunit's exit tunnel).
  function ribosome(x, y, ang, s, t, o = {}) {
    auditBox('ribosome', o.key || '', x - 80 * s, y - 120 * s, x + 80 * s, y + 60 * s);
    const k = o.k ?? 1; if (k <= .02) return; boilSeed('ribo' + (o.key || ''));
    const bob = o.stall ? 0 : 2 * Math.sin(t * 7 + (o.seed || 0));
    push(); translate(x, y); rotate(ang); scale(s);
    const off = (1 - backOut(k)) * 120;
    // small subunit (head, body, platform)
    const S = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; S.push([Math.cos(a) * 62 * (1 + .08 * Math.sin(a * 3)), 30 + off + Math.sin(a) * 26 + bob * .5]); }
    paint(S, { wash: C.riboS, fill: mixCol(C.riboS, PAL.ink, .12), fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1, curv: .3 });
    // large subunit, with its central protuberance and the L1 stalk
    const Lg = []; for (let i = 0; i < 34; i++) { const a = Math.PI + i / 33 * Math.PI, bump = 1 + .12 * Math.exp(-Math.pow((a - 1.5 * Math.PI) / .3, 2)) + .06 * Math.sin(a * 5); Lg.push([Math.cos(a) * 78 * bump, -4 - off + Math.sin(a) * 66 * bump + bob]); }
    Lg.push([74, -2 - off + bob], [-74, -2 - off + bob]);
    paint(Lg, { wash: C.riboL, fill: mixCol(C.riboL, PAL.ink, .2), fillOp: 70, tex: .55, ink: PAL.ink, sw: 1.2, curv: .25 });
    inkLine([[-40, -30 - off + bob], [-10, -38 - off + bob], [20, -32 - off + bob]], .7, mixCol(C.riboL, PAL.ink, .5), 'inkfine', .6);   // rRNA groove
    // tRNA sites (A, P, E) as three soft notches seen through the cleft
    if (k > .9) for (let j = 0; j < 3; j++) paint(ellPts(-30 + j * 30, 4, 9, 6, 8), { wash: mixCol(C.riboL, PAL.cream, .5), ink: null });
    pop();
    if (o.chain && o.chain.length > 1) peptide(o.chain, o.key || '', o.chainN);
    if (o.stall > 0) {                                           // stalled: a little stop bar overhead
      boilSeed('stall' + (o.key || ''));
      const q = backOut(clamp(o.stall)), cx = x + Math.sin(ang) * 110 * s, cy = y - Math.cos(ang) * 110 * s;
      paint(ellPts(cx, cy, 26 * q * s, 26 * q * s, 18), { wash: C.red, ink: PAL.ink, sw: 1 });
      paint(rrPts(cx - 14 * q * s, cy - 4 * q * s, 28 * q * s, 8 * q * s, 3), { wash: PAL.cream, ink: null });
    }
  }
  // a nascent peptide: amino-acid beads along a path (world points), bead count n
  function peptide(P, key = '', n) {
    const Tk = track(P, 6), N = n ?? Math.max(1, Math.floor(Tk.L / 15));
    for (let i = 0; i < N; i++) {
      const [x, y] = Tk.at(Tk.L - i * 15); boilSeed('pep' + key + i);
      paint(ellPts(x, y, 7.5, 7.5, 9), { wash: [C.s1, C.s1Lt, C.s2, '#F0C07A'][Math.floor(hash(i * 1.3 + 4) * 4)], ink: PAL.ink, sw: .7 });
    }
  }

  // ---------- the spike glycoprotein (trimer, side view) ----------
  // (x, y) = where the membrane anchor sits; s: scale; o.ang (default up); o.post 0..1 (snaps to the long post-fusion
  // needle), o.pins 0..1 (the two prolines that hold the S2 hinge), o.glowK, o.bound (an antibody sits on top, 0..1).
  function spike(x, y, s, o = {}) {
    if (s > .8) auditBox('spike', o.key || '', x - 45 * s, y - 170 * s, x + 45 * s, y + 10 * s);
    boilSeed('spk' + (o.key || ''));
    const post = clamp(o.post || 0), ang = o.ang ?? 0;
    push(); translate(x, y); rotate(ang); scale(s);
    const stem = lerp(46, 120, ease(post)), hw = lerp(1, .35, ease(post));
    // TM anchor + S2 stalk (three helices: one ribbon per protomer, twisted slightly)
    for (let j = -1; j <= 1; j++) paint(ribbon([[j * 5, 10], [j * 6 + 2 * Math.sin(T_ * 2 + j), -stem * .5], [j * 7 * hw, -stem]], 7, 8), { wash: j ? C.s2 : mixCol(C.s2, PAL.ink, .15), ink: PAL.ink, sw: .7 });
    // S1 head: three lobes (NTD + RBD per protomer), the RBDs on top
    if (hw > .38) {
      const hy = -stem - 26 * hw;
      for (const j of [-1, 1, 0]) paint(ellPts(j * 18 * hw, hy + (j ? 4 : -4), 21 * hw, 27 * hw, 16, .6), { wash: j ? C.s1 : mixCol(C.s1, PAL.cream, .2), fill: mixCol(C.s1, PAL.ink, .2), fillOp: 40, tex: .4, ink: PAL.ink, sw: .9 });
      for (const j of [-1, 0, 1]) paint(ellPts(j * 15 * hw, hy - 26 * hw, 9 * hw, 8 * hw, 10), { wash: C.s1Lt, ink: PAL.ink, sw: .7 });   // RBDs
    } else {
      paint([[-9, -stem], [9, -stem], [0, -stem - 26]], { wash: C.s2, ink: PAL.ink, sw: .8 });   // fusion peptide tip
    }
    if (o.pins > 0) for (const j of [-1, 1]) paint(starPts(j * 9, -stem * .78, 7 * backOut(clamp(o.pins)), .81, 5), { wash: C.pro, ink: PAL.ink, sw: .7 });
    pop();
    const top = [x + Math.sin(ang) * (stem + 60) * s, y - Math.cos(ang) * (stem + 60) * s];
    if (o.glowK > 0) glow(top[0], top[1] + 20 * s, 90 * s, '#FFE3C0', o.glowK);
    return top;
  }

  // ---------- IgG: two heavy chains (Fc + Fab), two light chains; tips = the paratopes ----------
  function antibody(x, y, s, ang = 0, o = {}) {
    boilSeed('ab' + (o.key || ''));
    push(); translate(x, y); rotate(ang); scale(s);
    const col = o.col || C.ab, lt = o.lt || C.abLt, open = o.open ?? 1, a = lerp(.35, .62, open);
    paint(ribbon([[-5, 34], [-5, 0]], 9, 9), { wash: col, ink: PAL.ink, sw: .8 });
    paint(ribbon([[5, 34], [5, 0]], 9, 9), { wash: mixCol(col, PAL.ink, .12), ink: PAL.ink, sw: .8 });
    for (const sd of [-1, 1]) {
      const r0 = [sd * 4, -2], r1 = [sd * Math.sin(a) * 46, -Math.cos(a) * 46 - 2];
      paint(ribbon([r0, r1], 10, 10), { wash: col, ink: PAL.ink, sw: .8 });
      const px = Math.cos(a) * 9 * sd, py = Math.sin(a) * 9;                       // the light chain runs alongside, outside
      paint(ribbon([[r0[0] + px * 1.2 + sd * 4, r0[1] - 14], [r1[0] + px, r1[1] + py * .3]], 7, 7), { wash: lt, ink: PAL.ink, sw: .7 });
    }
    paint(ellPts(0, 2, 5, 4, 8), { wash: mixCol(col, PAL.ink, .3), ink: null });   // hinge
    pop();
    return [-1, 1].map(sd => { const a2 = lerp(.35, .62, open), lx = sd * Math.sin(a2) * 50 * s, ly = -Math.cos(a2) * 50 * s; return [x + lx * Math.cos(ang) - ly * Math.sin(ang), y + lx * Math.sin(ang) + ly * Math.cos(ang)]; });
  }

  // ---------- lipids and membranes ----------
  // one lipid: head at (x, y), tails pointing along ang. kind: phos | ion | peg | chol.
  function lipid(x, y, ang, s, kind, o = {}) {
    const ca = Math.cos(ang), sa = Math.sin(ang), hl = o.hl || 0;
    const col = kind === 'ion' ? (o.plus > .5 ? mixCol(C.ion, C.red, .25) : C.ion) : kind === 'peg' ? C.phos : kind === 'chol' ? C.chol : C.phos;
    if (kind === 'chol') {                                       // a rigid four-ring sterol, a stubby slab
      paint(rrPts(-4 * s, -13 * s, 8 * s, 26 * s, 3 * s).map(([a, b]) => [x + (b + 13 * s) * ca - a * sa, y + (b + 13 * s) * sa + a * ca]), { wash: mixCol(C.chol, PAL.cream, .3 * hl), ink: PAL.ink, sw: .6 });
      return;
    }
    for (const sd of [-1, 1]) {                                  // two acyl tails
      const P = []; for (let i = 0; i <= 3; i++) { const d = (6 + i * 7.5) * s, wv = sd * 3.2 * s + (i % 2 ? 1.6 : -1.6) * s; P.push([x + ca * d - sa * wv, y + sa * d + ca * wv]); }
      inkLine(P, Math.max(.6, 1.15 * s), mixCol(C.tail, PAL.ink, .45), 'inkfine', .4);
    }
    const r = (kind === 'ion' ? 6.5 : 7.5) * s * (1 + .3 * hl);
    paint(ellPts(x, y, r, r, 10), { wash: mixCol(col, PAL.cream, .35 * hl), ink: PAL.ink, sw: .7 });
    if (kind === 'peg') {                                        // a PEG chain: a wavy coil out from the head
      const L = (o.peg ?? 1) * 34 * s; if (L > 2) { const P = []; for (let i = 0; i <= 8; i++) { const d = r + i / 8 * L, wv = Math.sin(i * 1.6 + T_ * 3 + x * .01) * 4.5 * s; P.push([x - ca * d - sa * wv, y - sa * d + ca * wv]); } inkLine(P, 1.6 * s, C.peg, 'ink', .6); }
    }
    if (kind === 'ion' && o.plus > 0) charge('+', x - ca * r * 2.2, y - sa * r * 2.2, 13 * s, o.plus, C.red, 'lp' + Math.round(x) + Math.round(y));
  }
  // a bilayer along a track: heads both faces, tails meeting in the middle. o.from/o.to (arc range), o.gap ([s0, s1] torn)
  function bilayer(Tk, s, o = {}) {
    const d = 16 * s, step = 15 * s, a0 = o.from ?? 0, a1 = o.to ?? Tk.L, col = o.col || C.phos;
    boilSeed('bil' + (o.key || ''));
    paint(ribbon(Tk.sub(a0, a1, 12), d * 2.3, d * 2.3), { wash: mixCol(C.tail, PAL.cream, .2), ink: null });
    for (let q = a0 + step / 2; q < a1; q += step) {
      if (o.gap && q > o.gap[0] && q < o.gap[1]) continue;
      const [x, y, ang] = Tk.at(q), nx = -Math.sin(ang), ny = Math.cos(ang), jig = o.jig ? o.jig(q) : 0;
      for (const sd of [-1, 1]) {
        const hx = x + nx * sd * (d + jig), hy = y + ny * sd * (d + jig), r = 6 * s;
        paint(ellPts(hx, hy, r, r, 8), { wash: o.cols ? o.cols(q, sd) : col, ink: PAL.ink, sw: .55 });
      }
      if (o.minus && Math.round(q / step) % 5 === 0) charge('-', x + nx * (d + 18 * s) * (o.minusSide || -1), y + ny * (d + 18 * s) * (o.minusSide || -1), 15 * s, o.minus, C.phos, (o.key || '') + 'mn' + Math.round(q));
    }
  }

  // ---------- the lipid nanoparticle, cross-section ----------
  // o.k: assembly 0..1 (lipids arrive from far away), o.hiIon/o.hiShell/o.hiChol 0..1, o.peg 0..1, o.plus 0..1,
  // o.melt 0..1 (shell lipids slide out to the endosome membrane at radius o.meltR), o.inside(): draws the core contents.
  function lnp(cx, cy, R, t, o = {}) {
    auditBox('lnp', o.key || '', cx - R, cy - R, cx + R, cy + R);
    const k = o.k ?? 1, sc = R / 300;
    boilSeed('lnpCore' + (o.key || ''));
    if (k > .3) paint(ellPts(cx, cy, R * .93 * ease(seg(k, .3, 1)), R * .93 * ease(seg(k, .3, 1)), 40, 2), { fill: o.core || '#F7E8D5', fillOp: 150 * (1 - (o.melt || 0)), bleed: .08, tex: .4, ink: null });
    if (o.inside) o.inside();
    const N = 46;
    for (let i = 0; i < N; i++) {
      const a = i / N * TAU + .02 * Math.sin(t * .8), far = 1 + 2.4 * (1 - easeOut(seg(k, i / N * .4, i / N * .4 + .6)));
      const sw = .03 * Math.sin(t * 2 + i), rr = R * far * (1 + sw * .2);
      let x = cx + Math.cos(a + (far - 1) * .6) * rr, y = cy + Math.sin(a + (far - 1) * .6) * rr;
      if (o.melt > 0 && o.meltR) { const m = ease(seg(o.melt, (i % 7) / 14, (i % 7) / 14 + .5)); x = lerp(x, cx + Math.cos(a) * o.meltR, m); y = lerp(y, cy + Math.sin(a) * o.meltR, m); }
      boilSeed('lnpL' + i + (o.key || ''));
      const isPeg = i % 6 === 0, kind = isPeg ? 'peg' : 'phos';
      lipid(x, y, a + Math.PI, sc * 1.25, kind, { hl: o.hiShell || 0, peg: o.peg ?? 1 });
      if (i % 2 === 1 && !(o.melt > .5)) { const ca = a + Math.PI / N; lipid(cx + Math.cos(ca) * rr * .96, cy + Math.sin(ca) * rr * .96, ca + Math.PI, sc * 1.25, 'chol', { hl: o.hiChol || 0 }); }
    }
  }

  // ---------- cell-scale things ----------
  // a cell as a character: wobbly round body, a soft nucleus shadow and a face. o.mood: calm | happy | wow | sad | angry |
  // determined | sleepy; o.lx/ly look; o.blink; o.rx/ry; o.extras(body local) for receptors.
  function cell(x, y, r, col, dk, t, o = {}) {
    if (r > 60) auditBox('cell', o.key || '', x - r, y - r, x + r, y + r);
    boilSeed('cell' + (o.key || ''));
    const ry = r * (o.ry || 1) * (1 - (o.sq || 0)), rx = r * (o.rx || 1) * (1 + (o.sq || 0)), P = [];
    for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; P.push([x + Math.cos(a) * rx * (1 + .04 * Math.sin(a * 3 + t * 1.6 + (o.seed || 0))), y + Math.sin(a) * ry * (1 + .04 * Math.cos(a * 2 + t * 1.3))]); }
    if (o.behind) o.behind();
    paint(P, { wash: col, fill: dk, fillOp: 55, bleed: .05, tex: .55, ink: PAL.ink, sw: clamp(r / 60, .8, 1.5), curv: .3 });
    if (o.nucleus !== false) paint(ellPts(x - rx * .25, y + ry * .2, rx * .42, ry * .36, 16, 1), { fill: dk, fillOp: 90, bleed: .1, tex: .5, ink: null });
    if (o.extras) o.extras(rx, ry);
    face(x + rx * (o.fx ?? .08), y - ry * .18, r * .5, t, o);
  }
  // a face: eyes + mouth, sized s, with moods
  function face(x, y, s, t, o = {}) {
    const mood = o.mood || 'calm', bl = o.blink ?? blinkAt(t, o.seed || 0), sw = clamp(s / 18, .7, 1.6);
    for (const sd of [-1, 1]) {
      const ex = x + sd * s * .5;
      if (mood === 'happy' || bl > .7) inkLine([[ex - s * .2, y + s * .05], [ex, y - s * .17], [ex + s * .2, y + s * .05]], sw, PAL.ink, 'ink', .7);
      else if (mood === 'sleepy') inkLine([[ex - s * .2, y], [ex + s * .2, y]], sw, PAL.ink, 'ink', 0);
      else {
        const big = mood === 'wow' ? 1.2 : 1;
        paint(ellPts(ex, y, s * .22 * big, s * .3 * big * (1 - bl), 12), { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 });
        paint(ellPts(ex + (o.lx || 0) * s * .08, y + (o.ly || 0) * s * .11, s * .11, s * .14, 10), { wash: PAL.ink, ink: null });
        if (mood === 'angry' || mood === 'determined') inkLine([[ex - sd * s * .24, y - s * .42], [ex + sd * s * .2, y - s * .3]], sw * 1.1, PAL.ink, 'ink', 0);
      }
    }
    const my = y + s * .45;
    if (mood === 'happy' || mood === 'determined') inkLine([[x - s * .22, my], [x, my + s * .14], [x + s * .22, my]], sw, PAL.ink, 'ink', .7);
    else if (mood === 'wow') paint(ellPts(x, my + s * .05, s * .11, s * .14, 10), { wash: '#5E2440', ink: PAL.ink, sw: sw * .6 });
    else if (mood === 'sad' || mood === 'angry') inkLine([[x - s * .2, my + s * .1], [x, my - s * .02], [x + s * .2, my + s * .1]], sw, PAL.ink, 'ink', .7);
    else inkLine([[x - s * .15, my], [x, my + s * .07], [x + s * .15, my]], sw * .9, PAL.ink, 'ink', .7);
    if (o.blush !== false) for (const sd of [-1, 1]) paint(ellPts(x + sd * s * .82, y + s * .3, s * .15, s * .08, 8), { fill: PIPC.rose, fillOp: 140, bleed: .1, ink: null });
  }
  const blinkAt = (t, sd) => { const f = frac((t + sd * 1.13) / 3.3); return f < .045 ? Math.sin(f / .045 * Math.PI) : 0; };

  // MHC groove with a peptide: a two-domain cup on a stalk, the peptide resting in it. kind 1 | 2. Returns the groove top.
  function mhc(x, y, s, ang, kind, o = {}) {
    boilSeed('mhc' + kind + (o.key || ''));
    const col = kind === 2 ? C.mhc2 : C.mhc1;
    push(); translate(x, y); rotate(ang); scale(s);
    if (kind === 2) { paint(ribbon([[-6, 0], [-7, -26], [-15, -40]], 8, 9), { wash: col, ink: PAL.ink, sw: .7 }); paint(ribbon([[6, 0], [7, -26], [15, -40]], 8, 9), { wash: mixCol(col, PAL.ink, .15), ink: PAL.ink, sw: .7 }); }
    else { paint(ribbon([[0, 0], [0, -24], [-15, -40]], 10, 9), { wash: col, ink: PAL.ink, sw: .7 }); paint(ribbon([[0, -24], [15, -40]], 9, 9), { wash: mixCol(col, PAL.ink, .15), ink: PAL.ink, sw: .7 }); paint(ellPts(9, -12, 6, 6, 8), { wash: mixCol(col, PAL.cream, .4), ink: PAL.ink, sw: .6 }); }
    if ((o.pep ?? 1) > 0) for (let i = 0; i < 4; i++) paint(ellPts(-9 + i * 6, -44 + (i % 2) * 2, 4 * backOut(clamp(o.pep ?? 1)), 4 * backOut(clamp(o.pep ?? 1)), 8), { wash: [C.s1, C.s1Lt, C.s2, C.s1][i], ink: PAL.ink, sw: .5 });
    pop();
    return [x + Math.sin(ang) * 50 * s, y - Math.cos(ang) * 50 * s];
  }
  // a TCR: two short chains on a stalk, open at the tip
  function tcr(x, y, s, ang, o = {}) {
    boilSeed('tcr' + (o.key || ''));
    push(); translate(x, y); rotate(ang); scale(s);
    paint(ribbon([[-5, 0], [-6, -22], [-10, -34]], 8, 8), { wash: C.tcr, ink: PAL.ink, sw: .7 });
    paint(ribbon([[5, 0], [6, -22], [10, -34]], 8, 8), { wash: mixCol(C.tcr, PAL.cream, .3), ink: PAL.ink, sw: .7 });
    pop();
  }
  // a B-cell receptor is a membrane IgM/IgD: an antibody on the cell surface
  const bcr = (x, y, s, ang, o = {}) => antibody(x, y, s * .7, ang, { ...o, col: C.ab, lt: C.abLt });

  // the virus: an envelope with spike trimers all round; o.coat 0..1 antibodies on each spike
  function virus(x, y, r, t, o = {}) {
    auditBox('virus', o.key || '', x - r * 1.5, y - r * 1.5, x + r * 1.5, y + r * 1.5);
    const n = 11, rot = o.rot ?? t * .15;
    for (let i = 0; i < n; i++) { if (o.skip === i) continue; const a = rot + i / n * TAU, bx = x + Math.cos(a) * r * .95, by = y + Math.sin(a) * r * .95;
      const tip = spike(bx, by, r / 130, { ang: a + Math.PI / 2, key: 'v' + i + (o.key || '') });
      const ck = clamp((o.coat || 0) * 1.6 - (i / n) * .6);
      if (ck > 0) { const sc = r / 160, d = lerp(260, 0, easeOut(ck)) + 46 * sc, ax = tip[0] + Math.cos(a) * d, ay = tip[1] + Math.sin(a) * d; antibody(ax, ay, sc, a - Math.PI / 2, { key: 'vc' + i + (o.key || '') }); }
    }
    boilSeed('vir' + (o.key || ''));
    paint(ellPts(x, y, r, r, 34, 1.5), { wash: C.virus, fill: C.virusDk, fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.3 });
    for (let i = 0; i < 6; i++) { const a = i * 1.7 + 1, d = r * .5 * hash(i + 3); paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d, r * .1, r * .07, 10), { fill: C.virusDk, fillOp: 120, ink: null }); }
  }
  // a dendritic cell: a body with long veiled dendrites
  function dendritic(x, y, s, t, o = {}) {
    const arms = o.arms || [[-2.6, 1], [-1.9, 1.1], [-.9, .9], [.0, 1.2], [.8, .9], [1.6, 1.05], [2.4, .95], [3.0, 1]];
    boilSeed('dcA' + (o.key || ''));
    arms.forEach(([a0, L], i) => {
      const reach = o.reach && o.reach[i] ? o.reach[i] : 0, a = a0 + .12 * Math.sin(t * 1.4 + i * 1.3), len = (110 + 50 * reach) * L * s;
      const P = []; for (let k = 0; k <= 5; k++) { const q = k / 5, bend = .35 * Math.sin(t * 1.8 + i + q * 3) * q; P.push([x + Math.cos(a + bend) * (50 * s + len * q), y + Math.sin(a + bend) * (50 * s + len * q)]); }
      paint(ribbon(P, 40 * s, 8 * s), { wash: C.dc, fill: C.dcDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1, curv: .2 });
    });
    cell(x, y, 78 * s, C.dc, C.dcDk, t, { ...o, extras: o.extras });
  }

  // a gold medal (no lettering): a disc with a laurel and a star, on a ribbon
  function medal(x, y, s, t, k, key = '') {
    if (k <= .02) return; boilSeed('medal' + key);
    push(); translate(x, y); rotate(.08 * Math.sin(t * 2)); scale(backOut(clamp(k)) * s);
    paint([[-22, -70], [-4, -70], [8, -20], [-10, -20]], { wash: C.ab, ink: PAL.ink, sw: .9 });
    paint([[22, -70], [4, -70], [-8, -20], [10, -20]], { wash: C.s1, ink: PAL.ink, sw: .9 });
    paint(ellPts(0, 10, 38, 38, 26), { wash: C.gold, fill: C.goldDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(0, 10, 28, 28, 22), { wash: mixCol(C.gold, PAL.cream, .3), ink: C.goldDk, sw: .8 });
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const a = Math.PI / 2 + sd * (.5 + i * .42); paint(ellPts(Math.cos(a) * 21, 10 + Math.sin(a) * 21, 4, 7, 8, 0, a), { wash: C.goldDk, ink: null }); }
    paint(starPts(0, 8, 13, .45, 5), { wash: C.goldDk, ink: null });
    pop();
  }

  // ---------- Pip, acted: a timeline of pipFeel moods with takes on every change ----------
  // keys: [[t0, mood, {extra}], ...]. Each change blinks on the cut and fires a take; the emote pops in.
  function act(t, keys, seed = 0) {
    let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
    const [t0, name, ex = {}] = keys[i], f = pipFeel(name, t, { seed });
    let sq = f.sq || 0, dy = f.dy || 0, blink = f.blink || 0;
    for (let k = 1; k < keys.length; k++) {
      const d = t - keys[k][0]; if (d > -.09 && d < .08) blink = Math.max(blink, 1 - Math.abs(d) / .09);
      const tk = take(t, keys[k][0] + .03, (keys[k][2] && keys[k][2].take) ?? .45); sq += tk.sq; dy += tk.dy;
    }
    const { take: _, ...extra } = ex;
    return { ...f, sq, dy, blink, emoteK: i ? backOut(seg(t, t0 + .05, t0 + .4)) : 1, ...extra };
  }
  // Pip swimming in place: a bob, paddling feet, a little tilt; voice makes the body pulse slightly
  function swim(x, y, u, t, o, key) {
    const bob = 7 * Math.sin(t * 2.1 + (o.seed || 0));
    pip(x, y + bob, u, { walk: o.walk ?? t * 2.2, rot: (o.rot || 0) + .03 * Math.sin(t * 1.05), ...o, sq: (o.sq || 0) + (o.talk ? .03 * voAt(t) : 0), noShadow: true, key });
    return y + bob;
  }
  // where a Pip arm {at: [ax, ay]} ends, in world space
  const hand = (x, y, u, at, o = {}) => [x + (o.flip ? -1 : 1) * at[0] * u, y + (o.dy || 0) * u + at[1] * u];

  return { C, cytoplasm, track, strand, cap, setT, ribosome, peptide, spike, antibody, lipid, bilayer, lnp, cell, face, mhc, tcr, bcr, virus, dendritic, medal,
    glyph, endMark, charge, check, cross, sparkle, burst, wash, motes, act, swim, hand, blinkAt, baseOf };
})();

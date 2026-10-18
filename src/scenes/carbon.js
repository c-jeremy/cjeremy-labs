// carbon.js: "Pip讲植物吸收二氧化碳", 320 s. How a leaf takes in CO₂ and what it pays in water: the stoma, the way to the
// stroma, Calvin's lollipop, Rubisco and the Calvin cycle (C3), Rubisco's flaws (slow, grabs O₂: photorespiration), the C4
// pump split in space (the Kranz wreath, PEP carboxylase), CAM split in time (night acid, day sugar), recaps, the world's
// share and C4 rice, and back to the meadow. See storyboards/carbon.md. Props from mrna_kit.js (MK).
// Every time is tied to a voice line: L(i, d) = line i's start + d seconds, so a retimed line moves its pictures.
// Cost note: on a software GPU every watercolour `fill` costs ~0.3 s a frame, while a flat `wash` shape costs ~2 ms, so
// grounds here are washes with translucent wash blobs, and fills are kept for Pip.
(() => {
  const K = MK;
  const Z = {
    carb: '#3F3A47', oxy: '#E4675A', oxyDk: '#B94A40', water: '#7FB8E6', waterDk: '#4F8CC0', gold: '#F4C54A', goldDk: '#C99A2E',
    rub: '#5E9C86', rubDk: '#3F7564', rubLt: '#9CCBB8', pepc: '#EE9A4C', pepcDk: '#C2702E', pepcLt: '#F7C590',
    atp: '#E8AA38', nad: '#8C6CC0', sugar: '#F1C96B', honey: '#C98F3A',
    bs: '#5E9E58', bsDk: '#3F7A3C', meso: '#B5D88F', mesoDk: '#86B062', vein: '#EFE6C2', veinDk: '#C9BC8A', chl: '#6FAE4E', chlDk: '#4C8A36',
    vac: '#D4E8F2', vacDk: '#9CC0D6', malate: '#D7E36A', malateDk: '#A9B53A',
    sky: '#F6E3B4', skyHot: '#FBEFC9', sun: '#FFD86B', sunDk: '#F0A93C', meadow: '#C6D88A', meadowDk: '#8FAE58', hill: '#B9CF86',
    epi: '#E3F0C8', epiDk: '#9DBE7E', guard: '#7DB45C', pore: '#3D4E36',
    inner: '#E9F3DA', innerBlob: '#F4F9EC', air: '#EAF2F4', stroma: '#DCEFE2', stromaBlob: '#EEF7F0', granum: '#78B867', granumDk: '#4E8C46',
    hot: '#F7D9BC', hotBlob: '#FBEADB', lab: '#E6E0F2', labBlob: '#F3EFFA', bench: '#CDBFA6', benchDk: '#A8977A', glass: '#EEF4F6',
    recap: '#F5EEDD', recapBlob: '#FBF6EA', corn: '#F1D27A', cornBlob: '#F8E6B0', sage: '#DCE8CF', sageBlob: '#EDF3E4',
    sand: '#F1D9A4', sandDk: '#DDB877', dawn: '#F6C9A8', night: '#2E3466', nightBlob: '#454C8A', skyB: '#DCEAF4', skyBBlob: '#EEF5FA',
    brass: '#D9A441', brassDk: '#A87A26', cactus: '#6FA35A', cactusDk: '#4A7C3C', red: '#D2413F', green: '#3E9A4E'
  };
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));               // a soft pulse peaking at a
  const pulseK = (t, a, len = .7) => t > a && t < a + len ? Math.sin(seg(t, a, a + len) * Math.PI) : 0;
  const popIn = (t, a, len = .35) => backOut(seg(t, a, a + len));
  const gone = (t, a, len = .3) => 1 - ease(seg(t, a, a + len));

  // ---------- grounds (washes only: see the cost note) ----------
  function ground(col, blob, t, key, o = {}) {
    boilSeed('gr' + key);
    paint(o.rect || rectPts(-1400, -1400, W + 2800, H + 2800), { wash: col, ink: null });
    for (let i = 0; i < (o.n ?? 6); i++) {
      boilSeed('grb' + i + key);
      const x = (o.x0 || 0) + hash(i + 3 + (o.seed || 0)) * (o.w || W) + 70 * wob(t, .03, i * .3), y = (o.y0 || 0) + hash(i + 7 + (o.seed || 0)) * (o.h || H) + 50 * wob(t, .025, i);
      paint(ellPts(x, y, 260 + 140 * hash(i), 150 + 70 * hash(i + 1), 20, 8), { wash: blob, washOp: o.op ?? 120, ink: null });
    }
  }

  // ---------- molecules (no faces: they act through motion) ----------
  function co2(x, y, s, ang = 0, o = {}) {                  // O=C=O: a charcoal carbon between two coral oxygens
    if (s <= .02) return;
    boilSeed('co2' + (o.key || ''));
    const dx = Math.cos(ang) * 22 * s, dy = Math.sin(ang) * 22 * s, sw = clamp(s, .5, 1.2);
    if (o.ring) paint(ellPts(x, y, 21 * s, 21 * s, 14), { wash: Z.gold, ink: null });
    for (const sd of [-1, 1]) paint(ellPts(x + sd * dx, y + sd * dy, 12 * s, 12 * s, 12), { wash: Z.oxy, ink: PAL.ink, sw });
    paint(ellPts(x, y, 13.5 * s, 13.5 * s, 12), { wash: o.c || Z.carb, ink: PAL.ink, sw });
    paint(ellPts(x - 4 * s, y - 4.5 * s, 3.5 * s, 3 * s, 8), { wash: PAL.cream, washOp: 170, ink: null });
  }
  function o2(x, y, s, ang = 0, o = {}) {                   // O=O: two coral beads
    if (s <= .02) return;
    boilSeed('o2' + (o.key || ''));
    const dx = Math.cos(ang) * 11 * s, dy = Math.sin(ang) * 11 * s, sw = clamp(s, .5, 1.2);
    for (const sd of [-1, 1]) paint(ellPts(x + sd * dx, y + sd * dy, 12.5 * s, 12.5 * s, 12), { wash: sd > 0 ? Z.oxy : mixCol(Z.oxy, Z.oxyDk, .35), ink: PAL.ink, sw });
    paint(ellPts(x - dx - 4 * s, y - dy - 4.5 * s, 3.5 * s, 3 * s, 8), { wash: PAL.cream, washOp: 170, ink: null });
  }
  function drop(x, y, s, o = {}) {                          // a water drop, point up
    if (s <= .02) return;
    boilSeed('dr' + (o.key || ''));
    const P = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; P.push([x + 15 * s * Math.sin(a) * Math.sin(a / 2), y - 19 * s * Math.cos(a)]); }
    paint(P, { wash: o.col || Z.water, ink: PAL.ink, sw: clamp(.9 * s, .5, 1.1), curv: .3 });
    paint(ellPts(x - 4 * s, y + 5 * s, 3 * s, 4.5 * s, 8), { wash: PAL.cream, washOp: 190, ink: null });
  }
  // a carbon chain: n charcoal beads on an ink link along ang, centred at (x, y). o.gold: index (or list) of the bead fixed
  // from CO₂ (gold ring); o.col: bead colour (honey once reduced); o.phos: indices carrying a phosphate dot; o.k pop-in;
  // o.hi(i) 0..1 highlight (bigger, lighter); o.bend curls it. Returns the bead centres.
  function chain(x, y, n, s, o = {}) {
    const k = o.k ?? 1; if (k <= .02 || n < 1) return [];
    boilSeed('ch' + (o.key || ''));
    const ang = o.ang || 0, sp = 29 * s * (o.sp || 1), q = backOut(clamp(k)), P = [], m = (n - 1) / 2;
    for (let i = 0; i < n; i++) { const d = (i - m) * sp * q, bend = (o.bend || 0) * (Math.pow((i - m) / Math.max(1, m), 2) - .5) * 14 * s;
      P.push([x + Math.cos(ang) * d - Math.sin(ang) * bend, y + Math.sin(ang) * d + Math.cos(ang) * bend]); }
    if (n > 1) inkLine(P, 2.6 * s, PAL.ink, 'ink', .4);
    const golds = o.gold == null ? [] : [].concat(o.gold);
    P.forEach(([px, py], i) => {
      const h = o.hi ? clamp(o.hi(i)) : 0, r = 12.5 * s * q * (1 + .3 * h);
      if (o.phos && o.phos.includes(i)) { const a = ang - Math.PI / 2, fx = px + Math.cos(a) * 21 * s, fy = py + Math.sin(a) * 21 * s;
        inkLine([[px, py], [fx, fy]], 2 * s, PAL.ink, 'ink', 0); paint(ellPts(fx, fy, 7 * s * q, 7 * s * q, 10), { wash: Z.gold, ink: PAL.ink, sw: .7 * s }); }
      if (golds.includes(i)) paint(ellPts(px, py, r + 6 * s, r + 6 * s, 14), { wash: Z.gold, ink: null });
      paint(ellPts(px, py, r, r, 12), { wash: mixCol(o.col || Z.carb, PAL.cream, .4 * h), ink: PAL.ink, sw: clamp(s, .5, 1.1) });
      paint(ellPts(px - r * .3, py - r * .35, r * .26, r * .22, 8), { wash: PAL.cream, washOp: 150, ink: null });
    });
    return P;
  }
  // an enzyme: a lobed body with a cleft on top (no face). open 0..1 widens the cleft; sq squashes (a chomp).
  // Rubisco: big, olive-teal, inner lobes for its large and small subunits. PEP carboxylase: smaller, orange.
  // Returns the cleft point (where the substrate sits).
  function enzyme(x, y, s, t, o = {}) {
    const col = o.col || Z.rub, lt = o.lt || Z.rubLt, rx = (o.rx || 86) * s, ry = (o.ry || 66) * s, open = clamp(o.open ?? .5), sq = o.sq || 0;
    boilSeed('enz' + (o.key || ''));
    const w = lerp(.1, .42, open), depth = lerp(.3, .6, open) * ry, P = [];
    for (let i = 0; i <= 32; i++) { const a = -Math.PI / 2 + w + i / 32 * (TAU - 2 * w), lob = 1 + .06 * Math.sin(a * (o.lobes || 4) + .5) + .02 * Math.sin(t * 1.3 + a);
      P.push([x + Math.cos(a) * rx * lob * (1 + sq), y + Math.sin(a) * ry * lob * (1 - sq)]); }
    P.push([x, y - (ry - depth) * (1 - sq)]);
    paint(P, { wash: col, ink: PAL.ink, sw: clamp(1.15 * s, .6, 1.4), curv: .2 });
    for (const [a, b, c, d] of (o.inner || [[-.44, .14, .3, .36], [.44, .14, .3, .36], [0, .52, .38, .22]])) paint(ellPts(x + a * rx, y + b * ry, c * rx, d * ry, 14), { wash: lt, washOp: 150, ink: null });
    if (rx > 70) auditBox('enzyme', o.key || '', x - rx, y - ry, x + rx, y + ry);
    return [x, y - (ry - depth) * (1 - sq) + 4 * s];
  }
  const rubisco = (x, y, s, t, o = {}) => enzyme(x, y, s, t, o);
  const pepc = (x, y, s, t, o = {}) => enzyme(x, y, s, t, { col: Z.pepc, lt: Z.pepcLt, rx: 62, ry: 50, lobes: 3, inner: [[-.35, .2, .32, .32], [.35, .2, .32, .32]], ...o });
  function atp(x, y, s, o = {}) {                            // a bead with a tail of phosphate dots; spent = dull, one fewer
    boilSeed('atp' + (o.key || ''));
    const g = clamp(o.spent || 0), n = g > .5 ? 2 : 3, ang = o.ang || 0, sw = clamp(s, .5, 1.1), P = [[x, y]];
    for (let i = 1; i <= n; i++) P.push([x + Math.cos(ang) * (8 + i * 13) * s, y + Math.sin(ang) * (8 + i * 13) * s]);
    inkLine(P, 2 * s, PAL.ink, 'ink', 0);
    for (let i = 1; i <= n; i++) paint(ellPts(P[i][0], P[i][1], 6.5 * s, 6.5 * s, 10), { wash: mixCol(Z.gold, '#CFC6BA', g), ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(x, y, 15 * s, 13 * s, 12), { wash: mixCol(Z.atp, '#B9AFA4', g), ink: PAL.ink, sw });
  }
  function nadph(x, y, s, h = 1, o = {}) {                   // a violet carrier with a cream hydrogen dot riding on top
    boilSeed('nad' + (o.key || ''));
    const sw = clamp(s, .5, 1.1);
    paint(ellPts(x, y, 21 * s, 13 * s, 14), { wash: Z.nad, ink: PAL.ink, sw });
    paint(ellPts(x - 6 * s, y - 4 * s, 7 * s, 4 * s, 8), { wash: mixCol(Z.nad, PAL.cream, .5), ink: null });
    if (h > .02) paint(ellPts(x + 5 * s, y - 18 * s, 7 * s * h, 7 * s * h, 10), { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 });
  }
  function sugar(x, y, s, o = {}) {                          // a honey hexagon: a sugar ring
    const k = o.k ?? 1; if (k <= .02) return;
    boilSeed('sg' + (o.key || ''));
    const q = backOut(clamp(k)) * s, P = []; for (let i = 0; i < 6; i++) { const a = (o.rot || 0) + i / 6 * TAU + Math.PI / 6; P.push([x + Math.cos(a) * 24 * q, y + Math.sin(a) * 24 * q]); }
    paint(P, { wash: Z.sugar, ink: PAL.ink, sw: clamp(s, .5, 1.2) });
    paint(ellPts(x, y, 9 * q, 9 * q, 10), { wash: mixCol(Z.sugar, PAL.cream, .55), ink: null });
  }

  // ---------- marks ----------
  function ring(x, y, rx, ry, k, col = Z.gold, key = 'rg', w = 4) {   // a highlight ring that swells and fades
    if (k <= 0 || k >= 1) return; boilSeed('ring' + key);
    const q = 1 + .18 * easeOut(k), P = ellPts(x, y, rx * q, ry * q, 30);
    inkLine(P.concat([P[0], P[1]]), w * (1 - k * .8), col, 'ink', .5);
  }
  function holdRing(x, y, rx, ry, a, col = Z.gold, key = 'hr', w = 3) {
    if (a <= .03) return; boilSeed('hring' + key);
    const P = ellPts(x, y, rx, ry, 30); inkLine(P.concat([P[0], P[1]]), w * a, col, 'ink', .5);
  }
  function arrow(x0, y0, x1, y1, k, col, key, w = 14) {      // a painted arrow that draws itself
    if (k <= .02) return; boilSeed('arr' + key);
    const q = ease(k), ex = lerp(x0, x1, q), ey = lerp(y0, y1, q), a = Math.atan2(y1 - y0, x1 - x0), hl = w * 1.9;
    const bx = ex - Math.cos(a) * hl, by = ey - Math.sin(a) * hl;
    if (Math.hypot(bx - x0, by - y0) > 4) paint(ribbon([[x0, y0], [lerp(x0, bx, .5), lerp(y0, by, .5) + 3], [bx, by]], w * .8, w), { wash: col, ink: PAL.ink, sw: .9 });
    const nx = -Math.sin(a), ny = Math.cos(a);
    paint([[ex, ey], [bx + nx * w * 1.2, by + ny * w * 1.2], [bx - nx * w * 1.2, by - ny * w * 1.2]], { wash: col, ink: PAL.ink, sw: .9 });
  }
  function arcArrow(cx, cy, r, a0, a1, k, col, key, w = 12) { // an arrow drawn along a circle from a0 to a1
    if (k <= .02) return; boilSeed('aa' + key);
    const a = lerp(a0, a1, ease(k)), dir = Math.sign(a1 - a0), P = [];
    for (let i = 0; i <= 14; i++) { const b = lerp(a0, a - dir * .16, i / 14); P.push([cx + Math.cos(b) * r, cy + Math.sin(b) * r]); }
    if (Math.abs(a - a0) > .2) paint(ribbon(P, w * .7, w), { wash: col, ink: PAL.ink, sw: .8 });
    const tip = [cx + Math.cos(a) * r, cy + Math.sin(a) * r], tx = -Math.sin(a) * dir, ty = Math.cos(a) * dir, bx = tip[0] - tx * w * 1.8, by = tip[1] - ty * w * 1.8;
    paint([tip, [bx + Math.cos(a) * w * 1.2, by + Math.sin(a) * w * 1.2], [bx - Math.cos(a) * w * 1.2, by - Math.sin(a) * w * 1.2]], { wash: col, ink: PAL.ink, sw: .8 });
  }
  function stopwatch(x, y, r, t, spin, k, key) {             // a dial with no numbers: a hand sweeps `spin` turns
    if (k <= .02) return; boilSeed('sw' + key);
    const q = backOut(clamp(k)), R = r * q;
    paint(rectPts(x - R * .16, y - R * 1.32, R * .32, R * .3), { wash: Z.brassDk, ink: PAL.ink, sw: 1 });
    paint(ellPts(x, y, R, R, 30), { wash: PAL.cream, ink: PAL.ink, sw: 1.6 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; inkLine([[x + Math.cos(a) * R * .8, y + Math.sin(a) * R * .8], [x + Math.cos(a) * R * .92, y + Math.sin(a) * R * .92]], i % 3 ? 1 : 2, PAL.ink, 'ink', 0); }
    const a = -Math.PI / 2 + spin * TAU;
    inkLine([[x, y], [x + Math.cos(a) * R * .74, y + Math.sin(a) * R * .74]], 3, Z.red, 'ink', 0);
    paint(ellPts(x, y, R * .08, R * .08, 8), { wash: PAL.ink, ink: null });
  }
  function sunIcon(x, y, r, t, k = 1, key = 's') {
    if (k <= .02) return; boilSeed('sun' + key);
    const q = backOut(clamp(k)), R = r * q;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .05, r1 = R * (1.55 + .12 * Math.sin(t * 2 + i)); inkLine([[x + Math.cos(a) * R * 1.18, y + Math.sin(a) * R * 1.18], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], clamp(R / 30, 1.2, 3.4), Z.sunDk, 'ink', 0); }
    paint(ellPts(x, y, R, R, 28, 1), { wash: Z.sun, ink: Z.sunDk, sw: clamp(R / 60, .8, 1.6) });
    paint(ellPts(x - R * .25, y - R * .27, R * .36, R * .28, 12), { wash: '#FFEFB0', washOp: 200, ink: null });
  }
  function moonIcon(x, y, r, k = 1, key = 'm') {
    if (k <= .02) return; boilSeed('moon' + key);
    const R = r * backOut(clamp(k)), P = [];
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI; P.push([x + Math.cos(a) * R, y + Math.sin(a) * R]); }
    for (let i = 15; i >= 1; i--) { const a = -Math.PI / 2 + i / 16 * Math.PI; P.push([x + Math.cos(a) * R * .45, y + Math.sin(a) * R * .92]); }
    seamGuard(MOON); boilSeed('moon' + key); paint(P, { wash: MOON, ink: PAL.ink, sw: clamp(R / 50, .7, 1.4), curv: .3 });
  }

  // p5.brush composites each colour through a mask; under software GL that leaves a 1-px seam on the left and bottom of
  // the colour's bounding box, which shows on dark grounds. Two specks of the same colour in the screen's corners push the
  // seam onto the frame's edge.
  function seamGuard(...cols) {
    const c = CAM || { cx: W / 2, cy: H / 2, zoom: 1 }, wx = sx => c.cx + (sx - W / 2) / c.zoom, wy = sy => c.cy + (sy - H / 2) / c.zoom, d = 3 / c.zoom;
    for (const col of cols) { paint([[wx(0), wy(0)], [wx(0) + d, wy(0)], [wx(0), wy(0) + d]], { wash: col, ink: null }); paint([[wx(W), wy(H)], [wx(W) - d, wy(H)], [wx(W), wy(H) - d]], { wash: col, ink: null }); }
  }
  const STAR = '#FFF3C4', MOON = '#F6EBC2';

  // ---------- the scale (天平): food (CO₂) on the left pan, water on the right; tilt > 0 drops the right pan ----------
  function balance(x, y, s, tilt, left, right, key) {
    boilSeed('bal' + key);
    const top = [x, y - 250 * s], bl = 190 * s, sw = clamp(1.2 * s, .6, 1.4);
    paint(ellPts(x, y - 8 * s, 70 * s, 16 * s, 16), { wash: Z.brassDk, ink: PAL.ink, sw });
    paint(rectPts(x - 9 * s, top[1], 18 * s, 245 * s), { wash: Z.brass, ink: PAL.ink, sw });
    const ends = [-1, 1].map(sd => [top[0] + sd * bl * Math.cos(tilt), top[1] + sd * bl * Math.sin(tilt)]);
    const pans = ends.map(([ex, ey], i) => {
      const sway = 4 * s * Math.sin(T * 1.3 + i * 2), py = ey + 130 * s;
      boilSeed('str' + i + key);
      for (const d of [-1, 1]) inkLine([[ex, ey], [ex + d * 64 * s + sway, py]], 1.2 * s, Z.brassDk, 'inkfine', 0);
      return [ex + sway, py];
    });
    boilSeed('beam' + key);
    paint(ribbon([ends[0], top, ends[1]], 14 * s, 14 * s), { wash: Z.brass, ink: PAL.ink, sw });
    paint(ellPts(top[0], top[1], 15 * s, 15 * s, 12), { wash: Z.brassDk, ink: PAL.ink, sw });
    if (left) left(pans[0][0], pans[0][1]); if (right) right(pans[1][0], pans[1][1]);
    pans.forEach(([px, py], i) => { boilSeed('pan' + i + key); const P = []; for (let k = 0; k <= 12; k++) { const a = k / 12 * Math.PI; P.push([px + Math.cos(a) * 80 * s, py + Math.sin(a) * 26 * s]); } paint(P, { wash: Z.brass, ink: PAL.ink, sw }); });
    auditBox('scale', key, x - bl - 80 * s, top[1] - 20 * s, x + bl + 80 * s, y);
    return pans;
  }
  function pile(x, y, n, s, key, k = 1) {                    // n drops heaped in a pan; they arrive one by one as k goes 0 → 1
    let i = 0;
    for (let row = 0; i < n; row++) { const m = Math.max(1, 5 - row);
      for (let c = 0; c < m && i < n; c++, i++) { const q = clamp(k * n - i); if (q <= 0) continue; drop(x + (c - (m - 1) / 2) * 27 * s, y - 13 * s - row * 25 * s, s * .82 * backOut(q), { key: key + i }); } }
  }
  const tiltFor = (n, k = 1) => lerp(-.06, .3, clamp(Math.min(n, k * 15) / 15));   // n drops in the pan, poured as k goes 0 → 1

  // ---------- Pip ----------
  function host(x, y, u, t, keys, extra = {}, key = 'ph') {  // Pip the host, swimming in place
    const o = { ...K.act(t, keys), ...extra };
    return { yb: K.swim(x, y, u, t, o, key), o };
  }
  const leafOf = (x, y, u, flip = false) => [x + (flip ? -1 : 1) * .42 * u, y - 7.0 * u];   // the middle of Pip's leaf
  // a push that keeps its target on screen while it zooms: from camera c0 = [x, y, z] to the point p centred at zoom z1
  function pushTo(t, t0, t1, c0, p, z1, e = easeIn) {
    const k = e(seg(t, t0, t1)), z = c0[2] * Math.pow(z1 / c0[2], k), f = (c0[2] / z) * (1 - k);
    return [p[0] + (c0[0] - p[0]) * f, p[1] + (c0[1] - p[1]) * f, z];
  }

  // ================================ A: the hot meadow, the dilemma ================================
  function meadow(t, key, o = {}) {
    ground(Z.sky, Z.skyHot, t, 'm' + key, { n: 4, h: 640 });
    sunIcon(o.sun ? o.sun[0] : 1560, o.sun ? o.sun[1] : 180, 88, t, 1, 'm' + key);
    boilSeed('hill' + key);
    paint([[-300, 790], [200, 700], [700, 745], [1200, 690], [1700, 730], [2300, 700], [2300, 1500], [-300, 1500]], { wash: Z.hill, ink: null, curv: .5 });
    paint([[-300, 830], [400, 800], [1000, 815], [1600, 795], [2300, 810], [2300, 1500], [-300, 1500]], { wash: Z.meadow, ink: PAL.ink, sw: .9, curv: .5 });
    for (let i = 0; i < 22; i++) { boilSeed('tuft' + i + key); const x = hash(i + 40) * 2100 - 90, y = 850 + hash(i + 41) * 210;
      for (let j = -1; j <= 1; j++) inkLine([[x + j * 8, y], [x + j * 14 + 4 * wob(t, .3, i), y - 18 - 10 * hash(i + j)]], 1, Z.meadowDk, 'inkfine', .3); }
    if (o.heat !== false) for (let i = 0; i < 4; i++) { boilSeed('heat' + i + key); const y = 640 - i * 46 + 10 * wob(t, .2, i), x0 = 160 + i * 400, P = [];
      for (let j = 0; j <= 6; j++) P.push([x0 + j * 40, y + 8 * Math.sin(j * 1.4 + t * 3 + i)]); inkLine(P, 1.2, mixCol(Z.sky, Z.sunDk, .35), 'inkfine', .6); }
  }
  const A_PIP = [700, 935], A_U = 36, A_BAL = [1250, 940];
  function shotA(t, lt, dur) {
    const lf = leafOf(A_PIP[0], A_PIP[1], A_U);
    const c = pushTo(t, L(1, 10.5), L(2, -1.25), [960, 560, 1.04], lf, 5.2);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    meadow(t, 'a');
    // the CO₂: from the sky into Pip's leaf, then a hop into the food pan
    const fIn = seg(t, L(1, 1.4), L(1, 2.7)), fHop = seg(t, L(1, 3.0), L(1, 3.8)), nDrops = 15;
    const dropK = seg(t, L(1, 4.3), L(1, 7.0)), tilt = fHop < 1 ? lerp(0, -.06, ease(seg(t, L(1, 3.8), L(1, 4.1)))) : tiltFor(nDrops, dropK) + .01 * spring(t, L(1, 3.8), 5, 14);
    const tl = fHop >= 1 ? tilt + .03 * spring(t, L(1, 3.8), 6, 16) : 0;
    const pans = balance(A_BAL[0], A_BAL[1], 1.1, tl, (px, py) => {
      if (fHop >= 1) { co2(px, py - 20, 1.25, 0, { key: 'apan' }); ring(px, py - 20, 50, 40, seg(t, L(1, 7.5), L(1, 8.4)), Z.gold, 'apanr', 5); }
    }, (px, py) => {
      pile(px, py, nDrops, 1.05, 'apile', dropK);
      ring(px, py - 50, 92, 70, seg(t, L(1, 8.3), L(1, 9.2)), Z.water, 'apiler', 5);
    }, 'a');
    // drops leaving the leaf for the pan (and many more just rising away: hundreds)
    for (let i = 0; i < nDrops; i++) {
      const t0 = L(1, 4.3) + i / nDrops * 2.7 - .45, k = seg(t, t0, t0 + .45); if (k <= 0 || k >= 1) continue;
      const p = arcPt(lf, [pans[1][0] + ((i % 5) - 2) * 20, pans[1][1] - 30], 160, easeIn(k)); drop(p[0], p[1], .8, { key: 'af' + i });
    }
    for (let i = 0; i < 26; i++) {
      const t0 = L(1, 4.0) + hash(i + 7) * 3.6, k = seg(t, t0, t0 + 1.6); if (k <= 0 || k >= 1) continue;
      const a = -Math.PI / 2 + (hash(i + 8) - .5) * 1.6; drop(lf[0] + Math.cos(a) * 260 * k, lf[1] + Math.sin(a) * 260 * k, .55 * (1 - k * .7), { key: 'av' + i, col: mixCol(Z.water, PAL.cream, .3) });
    }
    if (fHop < 1 && fIn > 0) {
      const p = fIn < 1 ? arcPt([260, 240], lf, -120, ease(fIn)) : arcPt(lf, [pans[0][0], pans[0][1] - 20], 140, ease(fHop));
      co2(p[0], p[1], 1.25, t * 1.5, { key: 'afly' });
    }
    if (fIn >= 1) K.sparkle(lf[0] + 20, lf[1] - 20, 30, seg(t, L(1, 2.7), L(1, 3.3)), '#FFF3C4');
    // Pip: hot (fanning), watches the CO₂ come in, the water leave, then the two pans
    const fan = t < L(1, 1.3) ? { armF: [1.5 + .5 * Math.sin(t * 15), 1.6] } : {};
    const o = { ...K.act(t, [[0, 'worried', { lookX: .2, lookY: -.3 }], [L(1, 1.4), 'calm', { lookX: -.7, lookY: -.8 }], [L(1, 3.1), 'happy', { lookX: .8 }],
      [L(1, 4.6), 'wow', { lookX: .5, lookY: -.6 }], [L(1, 6.0), 'worried', { lookX: .9, lookY: .1 }], [L(1, 7.6), 'calm', { lookX: .8, lookY: .1 }], [L(1, 9.7), 'confused', { lookX: .6 }]]), ...fan };
    pip(A_PIP[0], A_PIP[1], A_U, { ...o, key: 'pa' });
    const at = toScreen(A_PIP[0], A_PIP[1] - 3 * A_U);
    camEnd();
    if (lt < .9) iris(at[0], at[1], kf(lt, [[0, 0], [.15, 210], [.4, 230], [.9, 1800]], easeIn));
    flash(seg(t, L(2, -1.75), L(2, -1.25)));
  }

  // ================================ B: the leaf surface, one stoma ================================
  // pavement cells: wobbly jigsaw blobs on a jittered grid (fixed with hash, so they hold still), the stoma in a clearing
  const PAVE = []; for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 11; gx++) {
    const x = -260 + gx * 245 + (gy % 2) * 120 + (hash(gx * 7 + gy) - .5) * 70, y = -230 + gy * 240 + (hash(gx + gy * 13) - .5) * 60;
    if (Math.hypot((x - 960) / 1.2, y - 540) < 230) continue; PAVE.push([x, y, gx * 11 + gy]);
  }
  function leafSurface(t, key, cx = 960, cy = 540) {
    ground(Z.epi, mixCol(Z.epi, PAL.cream, .5), t, 'ls' + key, { n: 3 });
    PAVE.forEach(([x, y, i]) => {
      boilSeed('pv' + i + key);
      const P = []; for (let k = 0; k < 26; k++) { const a = k / 26 * TAU, r = 118 * (1 + .14 * Math.sin(a * 5 + hash(i) * 6) + .05 * Math.sin(a * 3 + i)); P.push([x + cx - 960 + Math.cos(a) * r * 1.1, y + cy - 540 + Math.sin(a) * r]); }
      paint(P, { wash: mixCol(Z.epi, Z.meso, .25 + .2 * hash(i + 3)), ink: Z.epiDk, sw: 1.1, curv: .4 });
    });
    boilSeed('clear' + key); paint(ellPts(cx, cy, 250, 215, 30, 4), { wash: mixCol(Z.epi, Z.meso, .4), ink: Z.epiDk, sw: 1, curv: .4 });
  }
  // a stoma seen from above: two kidney guard cells round a lens-shaped pore; open 0..1. Small faces: cells are characters.
  function stomaTop(cx, cy, s, open, t, o = {}) {
    const key = o.key || 'st', pw = lerp(3, 26, clamp(open)) * s, H2 = 100 * s, sw = clamp(1.2 * s, .7, 1.6);
    boilSeed('pore' + key);
    if (open > .05) paint(ellPts(cx, cy, pw, H2 * .86, 24), { wash: Z.pore, ink: null });
    for (const sd of [-1, 1]) {
      boilSeed('gc' + sd + key);
      const P = [], sw2 = 1 + (o.swell || 0) * .12;
      for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + i / 14 * Math.PI; P.push([cx + sd * pw * Math.cos(a), cy + H2 * .9 * Math.sin(a)]); }
      for (let i = 14; i >= 0; i--) { const a = -Math.PI / 2 + i / 14 * Math.PI; P.push([cx + sd * (pw * Math.cos(a) + 58 * s * sw2 * Math.pow(Math.cos(a), .8) + 6 * s), cy + H2 * Math.sin(a)]); }
      paint(P, { wash: o.col || Z.guard, ink: PAL.ink, sw, curv: .3 });
      for (let j = 0; j < 4; j++) { const a = -1.1 + j * .72; paint(ellPts(cx + sd * (pw + 34 * s * Math.cos(a) * sw2 + 12 * s), cy + 66 * s * Math.sin(a), 8 * s, 5 * s, 8, 0, a), { wash: Z.chlDk, ink: null }); }
      if (o.face !== false) K.face(cx + sd * (pw + 30 * s * sw2 + 6 * s), cy - 8 * s, 22 * s, t, { mood: (o.mood && o.mood[sd > 0 ? 1 : 0]) || 'calm', blush: false, seed: sd + 2, lx: -sd * .5 });
    }
    if (o.hi) for (const sd of [-1, 1]) ring(cx + sd * (pw + 30 * s), cy, 50 * s, 112 * s, o.hi[sd > 0 ? 1 : 0], Z.gold, 'gch' + sd + key, 4 * s);
  }
  function shotB(t, lt, dur) {
    const z = kf(t, [[L(2, -1.2), 1.32], [L(2, 2.2), 1.04], [L(3, -2.0), 1.0], [L(3, -1.0), 6.5]], ease);
    cam(960 + 8 * wob(t, .05), 560 + 5 * wob(t, .04), z);
    leafSurface(t, 'b');
    const open = ease(seg(t, L(2, 5.8), L(2, 7.0)));
    stomaTop(960, 540, 1.7, open, t, { key: 'b', mood: [t > L(2, 3.5) ? (open > .3 ? 'happy' : 'wow') : 'calm', t > L(2, 4.3) ? (open > .3 ? 'happy' : 'wow') : 'calm'],
      hi: [seg(t, L(2, 3.5), L(2, 4.4)), seg(t, L(2, 4.3), L(2, 5.2))], swell: open });
    ring(960, 540, 60, 175, seg(t, L(2, .9), L(2, 1.9)), Z.gold, 'bpore', 6);
    // CO₂ drift in (and shrink away down the pore); water vapour rises out and away
    for (let i = 0; i < 4; i++) {
      const t0 = L(2, 7.3) + i * .45, k = seg(t, t0, t0 + 1.5); if (k <= 0 || k >= 1) continue;
      const a = 2.4 + i * .45, p0 = [960 + Math.cos(a) * 700, 540 + Math.sin(a) * 520 - 260], p = [lerp(p0[0], 960, easeIn(k)), lerp(p0[1], 540 + (i - 1.5) * 40, easeIn(k))];
      co2(p[0], p[1], 1.3 * (1 - easeIn(seg(k, .75, 1))), t * 1.2 + i, { key: 'bc' + i });
    }
    for (let i = 0; i < 7; i++) {
      const t0 = L(2, 8.7) + i * .3, k = seg(t, t0, t0 + 1.8); if (k <= 0 || k >= 1) continue;
      const a = -.7 + i * .25, p = [960 + Math.cos(a) * 760 * easeOut(k), 540 - 30 * (i % 3) + Math.sin(a) * 560 * easeOut(k) - 150 * k];
      drop(p[0], p[1], 1.2 * Math.min(1, k * 4), { key: 'bv' + i });
    }
    camEnd();
    host(300, 880, 30, t, [[0, 'wow', { lookX: .8, lookY: -.3 }], [L(2, 3.4), 'calm', { lookX: .9, lookY: -.2 }], [L(2, 5.9), 'excited', { lookX: .9 }],
      [L(2, 7.5), 'happy', { lookX: .8, lookY: -.5 }], [L(2, 9.0), 'worried', { lookX: .8, lookY: -.7 }]], {}, 'pb');
    flash(1 - seg(t, L(2, -1.25), L(2, -.75)));
    flash(seg(t, L(3, -1.5), L(3, -1.0)));
  }

  // ================================ C: inside the leaf, to the stroma ================================
  const SPONGY = [[420, 640, 70], [600, 610, 64], [860, 600, 78], [1080, 650, 66], [1260, 600, 72], [1460, 640, 68], [1650, 610, 70],
    [500, 790, 62], [760, 800, 60], [1000, 810, 70], [1220, 790, 64], [1420, 800, 66], [1620, 790, 60], [320, 790, 58], [1820, 760, 62]];
  function leafSection(t, key) {
    ground(Z.air, '#F4F8F8', t, 'sec' + key, { n: 2 });
    boilSeed('secin' + key); paint(rectPts(-300, 120, 2520, 790), { wash: Z.inner, ink: null });
    // upper epidermis, palisade, spongy cells (air between), lower epidermis with the stoma at x 700
    for (let i = 0; i < 20; i++) { boilSeed('ue' + i + key); paint(rrPts(-300 + i * 130, 120, 126, 60, 16, 1), { wash: Z.epi, ink: Z.epiDk, sw: 1 }); }
    for (let i = 0; i < 30; i++) { boilSeed('pal' + i + key); const x = -280 + i * 86;
      paint(rrPts(x, 190, 78, 270, 34, 1.5), { wash: Z.meso, ink: Z.mesoDk, sw: 1 });
      for (let j = 0; j < 4; j++) paint(ellPts(x + 22 + (j % 2) * 34, 230 + j * 58, 12, 7, 8), { wash: Z.chl, ink: null }); }
    SPONGY.forEach(([x, y, r], i) => { boilSeed('sp' + i + key);
      const P = []; for (let k = 0; k < 20; k++) { const a = k / 20 * TAU; P.push([x + Math.cos(a) * r * (1 + .1 * Math.sin(a * 3 + i)), y + Math.sin(a) * r * .86 * (1 + .08 * Math.cos(a * 2 + i))]); }
      paint(P, { wash: Z.meso, ink: Z.mesoDk, sw: 1, curv: .3 });
      for (let j = 0; j < 4; j++) { const a = j * 1.6 + i; paint(ellPts(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .5, 12, 7, 8, 0, a), { wash: Z.chl, ink: null }); } });
    for (let i = 0; i < 20; i++) { const x = -300 + i * 130; if (x > 540 && x < 760) continue; boilSeed('le' + i + key); paint(rrPts(x, 880, 126, 56, 16, 1), { wash: Z.epi, ink: Z.epiDk, sw: 1 }); }
    for (const sd of [-1, 1]) { boilSeed('lgc' + sd + key); paint(ellPts(700 + sd * 48, 905, 40, 30, 16), { wash: Z.guard, ink: PAL.ink, sw: 1.1 }); }
  }
  // a chloroplast in close-up: double membrane, grana (stacked thylakoid coins) joined by lamellae, the pale stroma
  const GRANA = [[560, 430], [760, 360], [980, 420], [1200, 350], [1400, 440], [660, 650], [880, 700], [1110, 660], [1330, 690]];
  function chloroplast(t, key, k = 1) {
    ground(Z.inner, Z.innerBlob, t, 'chl' + key, { n: 3 });
    boilSeed('cpo' + key);
    const cx = 960, cy = 530, P = ellPts(cx, cy, 700 * k, 360 * k, 48);
    paint(P, { wash: Z.stroma, ink: PAL.ink, sw: 1.6, curv: .3 });
    const P2 = ellPts(cx, cy, 680 * k, 342 * k, 48); inkLine(P2.concat([P2[0], P2[1]]), 1.1, Z.granumDk, 'ink', .4);
    boilSeed('lam' + key);
    for (let i = 0; i + 1 < GRANA.length; i++) if (i !== 4) inkLine([GRANA[i], [lerp(GRANA[i][0], GRANA[i + 1][0], .5), lerp(GRANA[i][1], GRANA[i + 1][1], .5) + 20], GRANA[i + 1]], 3, Z.granum, 'ink', .5);
    GRANA.forEach(([x, y], i) => { boilSeed('gn' + i + key); for (let j = 0; j < 5; j++) paint(rrPts(x - 52, y - 50 + j * 21, 104, 18, 8, .5), { wash: j % 2 ? Z.granum : mixCol(Z.granum, PAL.cream, .2), ink: Z.granumDk, sw: .9 }); });
  }
  const C_PATH = [[700, 990], [705, 900], [730, 800], [780, 720], [830, 640]];
  function shotC(t, lt, dur) {
    const stage2 = t >= L(3, 3.9);
    const rise = seg(t, L(3, -.4), L(3, 2.6)), tr = K.track(C_PATH), p = tr.at(tr.L * ease(rise));
    if (!stage2) {
      const c = kf(t, [[L(3, -1.0), [700, 900, 1.9]], [L(3, .2), [710, 860, 1.6]], [L(3, 2.6), [820, 680, 1.5]], [L(3, 3.0), [850, 620, 1.5]], [L(3, 3.9), [880, 590, 4.2]]], ease);
      cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      leafSection(t, 'c');
      // the CO₂ comes up through the pore and the air space, into a spongy cell
      if (rise < 1) co2(p[0], p[1], .8, t * 1.4, { key: 'cc', ring: 1 });
      else { co2(lerp(830, 860, seg(t, L(3, 2.6), L(3, 3.0))), lerp(640, 610, seg(t, L(3, 2.6), L(3, 3.0))), .8 * (1 - .4 * seg(t, L(3, 2.6), L(3, 3.4))), t * 1.4, { key: 'cc', ring: 1 }); ring(860, 600, 82, 70, seg(t, L(3, 2.5), L(3, 3.3)), Z.gold, 'ccell', 3); }
      const hp = [p[0] - 150, p[1] + 40];
      host(hp[0], hp[1], 16, t, [[0, 'wow', { lookX: .6, lookY: -.6 }], [L(3, 1.5), 'happy', { lookX: .7, lookY: -.7 }]], {}, 'pc1');
      camEnd();
      flash(1 - seg(t, L(3, -1.0), L(3, -.5)));
      flash(seg(t, L(3, 3.5), L(3, 3.9)));
      return;
    }
    const c = kf(t, [[L(3, 3.9), [960, 540, 1.25]], [L(3, 5.4), [960, 545, 1.06]], [L(3, 6.0), [990, 575, 1.06]], [L(3, 6.7), [1050, 565, 1.75]], [L(3, 9.2), [1060, 560, 1.75]], [L(4, -1.0), [1000, 560, 1.3]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    chloroplast(t, 'c');
    ring(960, 530, 640, 320, seg(t, L(3, 5.6), L(3, 6.6)), PAL.cream, 'cstroma', 7);
    // the CO₂ drifts in and settles between the grana; then it clicks onto a chain (fixed), and a sugar appears beside it
    const inK = ease(seg(t, L(3, 3.9), L(3, 5.6))), fix = seg(t, L(3, 6.4), L(3, 6.9)), cp = [lerp(300, 930, inK), lerp(600, 560, inK) + 8 * wob(t, .2)];
    const chK = seg(t, L(3, 5.9), L(3, 6.4));
    if (chK > 0) chain(1000, 600, 5, 1.1, { k: chK, key: 'cch', gold: fix >= 1 ? 2 : null, bend: .6 });
    if (fix < 1) co2(lerp(cp[0], 1000, easeIn(fix)), lerp(cp[1], 580, easeIn(fix)), 1.1 * (1 - .6 * fix), t * 1.2, { key: 'cc2', ring: 1 });
    else K.burst(1000, 588, 60, seg(t, L(3, 6.9), L(3, 7.4)), Z.gold, 'cfix');
    sugar(1160, 520, 1.3, { k: seg(t, L(3, 8.0), L(3, 8.4)), key: 'csug', rot: .2 * Math.sin(t) });
    if (t > L(3, 8.0)) K.sparkle(1180, 490, 40, seg(t, L(3, 8.2), L(3, 8.9)), '#FFF3C4');
    camEnd();
    host(250, 900, 28, t, [[0, 'wow', { lookX: .8, lookY: -.3 }], [L(3, 6.9), 'idea', { lookX: .9, lookY: -.4 }], [L(3, 8.5), 'happy', { lookX: .9 }]], {}, 'pc2');
    flash(1 - seg(t, L(3, 3.9), L(3, 4.4)));
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B7AEDB', Z.lab]);
  }

  // ================================ D: Calvin's lollipop ================================
  const ALGAE = Array.from({ length: 24 }, (_, i) => [hash(i + 200), hash(i + 201), 10 + 6 * hash(i + 202)]);
  const D_FL = [880, 470], D_R = 230, D_HERO = [935, 430];
  function shotD(t, lt, dur) {
    const inside = t >= L(4, 9.0);
    if (!inside) {
      const c = t < L(4, 8.2) ? [960, 520, 1.0] : pushTo(t, L(4, 8.2), L(4, 9.0), [960, 520, 1.0], D_HERO, 9);
      cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      ground(Z.lab, Z.labBlob, t, 'lab', { n: 4 });
      boilSeed('bench'); paint(rectPts(-400, 820, 2720, 700), { wash: Z.bench, ink: null }); inkLine([[-300, 822], [2220, 818]], 1.6, Z.benchDk, 'ink', 0);
      const [cx, cy] = D_FL;
      // the lamp: light makes it go
      boilSeed('lamp'); inkLine([[1420, 820], [1420, 420], [1330, 300]], 6, '#8C8098', 'ink', .3);
      paint([[1250, 240], [1360, 230], [1400, 330], [1280, 360]], { wash: '#8C8098', ink: PAL.ink, sw: 1 });
      paint([[1260, 330], [1290, 345], [cx + 120, cy + 180], [cx + 150, cy - 210]], { wash: '#FFF3C4', washOp: 90, ink: null });
      // stand, neck, the gas line, the flat glass disc of algae
      boilSeed('stand'); paint(rectPts(cx - 12, cy + D_R - 10, 24, 820 - (cy + D_R) + 10), { wash: '#8C8098', ink: PAL.ink, sw: 1 }); paint(ellPts(cx, 822, 110, 18, 16), { wash: '#8C8098', ink: PAL.ink, sw: 1 });
      boilSeed('neck'); paint(rectPts(cx - 26, cy - D_R - 70, 52, 90), { wash: Z.glass, ink: PAL.ink, sw: 1.1 });
      boilSeed('tube'); inkLine([[120, 330], [330, 200], [620, 140], [cx - 8, 150], [cx - 8, cy + 130]], 5, '#A9B7C2', 'ink', .5);
      paint(rrPts(40, 300, 110, 240, 30, 1), { wash: '#C9B7D9', ink: PAL.ink, sw: 1.1 });     // the gas bottle
      boilSeed('disc'); paint(ellPts(cx, cy, D_R, D_R, 40), { wash: mixCol(Z.glass, Z.chl, .28), ink: PAL.ink, sw: 1.6 });
      ALGAE.forEach(([a, b, r], i) => { const ang = a * TAU + t * (.15 + .1 * b), rr = (.18 + .7 * b) * D_R;
        boilSeed('alg' + i); paint(ellPts(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, r, r, 10), { wash: i % 3 ? Z.chl : mixCol(Z.chl, PAL.cream, .25), ink: i % 4 ? null : Z.chlDk, sw: .7 }); });
      boilSeed('hero'); paint(ellPts(D_HERO[0], D_HERO[1], 17, 17, 14), { wash: mixCol(Z.chl, PAL.cream, .15), ink: Z.chlDk, sw: .9 });
      // gold (¹⁴C) CO₂ bubbles rise from the tube's end
      for (let i = 0; i < 9; i++) {
        const t0 = L(4, 2.0) + i * .5, k = seg(t, t0, t0 + 1.7); if (k <= 0 || k >= 1) continue;
        const x = cx - 8 + 30 * Math.sin(k * 5 + i), y = lerp(cy + 130, cy - D_R + 30, k);
        boilSeed('bub' + i); paint(ellPts(x, y, 36, 36, 16), { wash: mixCol(Z.glass, PAL.cream, .5), ink: '#7D8C98', sw: .8 });
        co2(x, y, .78, k * 4 + i, { key: 'dco' + i, ring: 1 });
      }
      boilSeed('shine'); paint(ellPts(cx - 110, cy - 120, 36, 70, 14, 0, .6), { wash: PAL.cream, washOp: 110, ink: null });
      stopwatch(1560, 260, 92, t, seg(t, L(4, 7.3), L(4, 8.6)) * .12, seg(t, L(4, 6.9), L(4, 7.3)), 'd');
      pip(1700, 960, 32, { ...K.act(t, [[0, 'calm', { lookX: -.8, lookY: -.3 }], [L(4, 2.4), 'wow', { lookX: -.9, lookY: -.4 }], [L(4, 7.1), 'calm', { lookX: -.3, lookY: -.9 }]]), flip: true, key: 'pd' });
      camEnd();
      if (lt < .3) brushWipe(.5 + lt / .6, ['#B7AEDB', Z.lab]);
      flash(seg(t, L(4, 8.7), L(4, 9.0)));
      return;
    }
    // inside one alga: its cup-shaped chloroplast, and the first labelled compound, a three-carbon chain
    const z = t < L(5, -1.5) ? 1.0 : 1 + 1.6 * easeIn(seg(t, L(5, -1.5), L(5, -.9)));
    cam(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), z);
    ground(mixCol(Z.chl, PAL.cream, .72), mixCol(Z.chl, PAL.cream, .85), t, 'alga', { n: 4 });
    boilSeed('cup'); const P = []; for (let i = 0; i <= 24; i++) { const a = .5 + i / 24 * 4.6; P.push([960 + Math.cos(a) * 760, 540 + Math.sin(a) * 470]); }
    for (let i = 24; i >= 0; i--) { const a = .5 + i / 24 * 4.6; P.push([960 + Math.cos(a) * 600, 540 + Math.sin(a) * 340]); }
    paint(P, { wash: mixCol(Z.chl, PAL.cream, .45), ink: Z.chlDk, sw: 1.2, curv: .3 });
    const W2 = ellPts(960, 540, 880, 580, 48); inkLine(W2.concat([W2[0], W2[1]]), 3, Z.chlDk, 'ink', .4);
    boilSeed('dnuc'); paint(ellPts(1350, 700, 120, 95, 24, 2), { wash: mixCol(Z.chl, PAL.cream, .6), ink: Z.chlDk, sw: 1 });
    chain(960, 520, 3, 3.0, { k: seg(t, L(4, 9.1), L(4, 9.5)), key: 'dch', gold: 0, hi: i => near(t, L(4, 10.2 + i * .4), .16) });
    if (t > L(4, 9.3)) K.sparkle(1060, 470, 50, seg(t, L(4, 9.4), L(4, 10.1)), '#FFF3C4');
    camEnd();
    host(250, 900, 30, t, [[0, 'wow', { lookX: .9, lookY: -.5 }], [L(4, 10.2), 'excited', { lookX: .9, lookY: -.5 }]], {}, 'pd2');
    flash(1 - seg(t, L(4, 9.0), L(4, 9.5)));
    flash(seg(t, L(5, -1.3), L(5, -.9)));
  }

  // ================================ E: the stroma, Rubisco and the Calvin cycle ================================
  function stromaBg(t, key, hot = 0) {
    const col = mixCol(Z.stroma, Z.hot, hot), blob = mixCol(Z.stromaBlob, Z.hotBlob, hot);
    ground(col, blob, t, 'st' + key, { n: 5, x0: -400, y0: -300, w: W + 800, h: H + 600 });
    [[-120, 120], [2050, 160], [-80, 980], [2040, 940], [300, -140], [1650, 1200]].forEach(([x, y], i) => { boilSeed('cg' + i + key);
      for (let j = 0; j < 5; j++) paint(rrPts(x - 70, y - 50 + j * 22, 140, 18, 8, .5), { wash: mixCol(col, Z.granum, j % 2 ? .4 : .3), ink: null }); });
    [[420, 140], [1520, 900], [260, 620], [1780, 520]].forEach(([x, y], i) => { boilSeed('sta' + i + key); paint(ellPts(x + 8 * wob(t, .05, i), y, 46, 30, 16, 1, i), { wash: mixCol(col, PAL.cream, .55), ink: mixCol(col, PAL.ink, .15), sw: .8 }); });
    for (let i = 0; i < 18; i++) { boilSeed('rb' + i + key); const x = -300 + hash(i + 500) * 2500 + 10 * wob(t, .08, i * .2), y = -200 + hash(i + 501) * 1500;
      paint(ellPts(x, y, 6, 5, 8), { wash: mixCol(col, Z.rub, .35), ink: null }); }
  }
  const WC = [960, 590], WR = 285, wp = a => [WC[0] + Math.cos(a) * WR, WC[1] + Math.sin(a) * WR];
  const RUB = [960, 305], DEG = Math.PI / 180;
  const honeyK = (t, a) => ease(seg(t, a, a + .4));
  function cropRice(x, y, s, t, k, key) {                     // a clump of blades and a drooping golden panicle
    if (k <= .02) return; boilSeed('rice' + key); const q = backOut(clamp(k)) * s;
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .22, l = (150 + 30 * (i % 2)) * q, sw2 = .06 * wob(t, .4, i);
      paint(ribbon([[x + (i - 2) * 6 * q, y], [x + Math.cos(a + sw2) * l * .6, y + Math.sin(a) * l * .6], [x + Math.cos(a + .25 * (i - 2) + sw2) * l, y + Math.sin(a) * l]], 9 * q, 2 * q), { wash: '#7FB25A', ink: PAL.ink, sw: .7 }); }
    const top = [x + 10 * q, y - 190 * q], P = [top, [x + 60 * q, y - 215 * q], [x + 110 * q + 6 * wob(t, .3), y - 160 * q]];
    inkLine(P, 2 * q, '#B08A3A', 'ink', .6);
    for (let i = 0; i < 7; i++) { const u = .25 + i * .11, px = lerp(lerp(P[0][0], P[1][0], u), lerp(P[1][0], P[2][0], u), u), py = lerp(lerp(P[0][1], P[1][1], u), lerp(P[1][1], P[2][1], u), u);
      paint(ellPts(px + 6 * q, py + 6 * q, 7 * q, 4 * q, 8, 0, .9), { wash: '#E6C25A', ink: PAL.ink, sw: .5 }); }
  }
  function cropWheat(x, y, s, t, k, key) {                    // a straight stalk, two blades, an ear of grains with awns
    if (k <= .02) return; boilSeed('wheat' + key); const q = backOut(clamp(k)) * s, sw2 = 4 * wob(t, .35, 1);
    inkLine([[x, y], [x + sw2 * .5, y - 120 * q], [x + sw2, y - 200 * q]], 3 * q, '#C9A24A', 'ink', .5);
    for (const sd of [-1, 1]) paint(ribbon([[x, y - 40 * q], [x + sd * 50 * q, y - 90 * q], [x + sd * 80 * q, y - 70 * q]], 8 * q, 2 * q), { wash: '#9CB85A', ink: PAL.ink, sw: .7 });
    for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { const gx = x + sw2 + sd * 9 * q, gy = y - 210 * q - i * 16 * q;
      paint(ellPts(gx, gy, 8 * q, 11 * q, 8, 0, sd * .4), { wash: '#E3BE5C', ink: PAL.ink, sw: .5 }); inkLine([[gx + sd * 4 * q, gy - 6 * q], [gx + sd * 16 * q, gy - 34 * q]], .8, '#B08A3A', 'inkfine', 0); }
  }
  function cropSoy(x, y, s, t, k, key) {                      // a bushy plant: trifoliate leaves and fuzzy pods
    if (k <= .02) return; boilSeed('soy' + key); const q = backOut(clamp(k)) * s;
    inkLine([[x, y], [x + 4 * q, y - 90 * q], [x, y - 150 * q]], 3 * q, '#6E8E3E', 'ink', .5);
    [[-1, -70], [1, -100], [-1, -135], [1, -150]].forEach(([sd, h], i) => { const bx = x + sd * 52 * q, by = y + h * q + 4 * wob(t, .3, i);
      inkLine([[x, y + (h + 20) * q], [bx, by]], 1.6 * q, '#6E8E3E', 'ink', .4);
      for (let j = -1; j <= 1; j++) paint(ellPts(bx + j * 22 * q * sd, by - (j === 0 ? 16 : 0) * q, 17 * q, 11 * q, 10, 0, j * .6), { wash: '#86B45A', ink: PAL.ink, sw: .6 }); });
    for (let i = 0; i < 3; i++) { const px = x + (i - 1) * 26 * q, py = y - 50 * q - i * 8 * q;
      paint(ribbon([[px, py], [px + 10 * q, py + 22 * q], [px + 6 * q, py + 44 * q]], 13 * q, 9 * q), { wash: '#C2B56A', ink: PAL.ink, sw: .6 }); }
  }
  function shotE(t, lt, dur) {
    // camera: close on Rubisco (L5) → the whole wheel (L6) → a little wider for the crops (L7)
    const c = kf(t, [[L(5, -.9), [960, 330, 2.4]], [L(5, .5), [960, 300, 1.75]], [L(6, 0), [960, 310, 1.75]], [L(6, 1.4), [1270, 560, 1.5]], [L(6, 6.5), [1270, 570, 1.5]],
      [L(6, 7.3), [1020, 720, 1.25]], [L(6, 10.8), [940, 680, 1.25]], [L(6, 11.6), [960, 580, 1.0]], [L(7, 9.4), [960, 580, 1.0]], [L(7, 10.4), [960, 540, .96]]], ease);
    const whip = seg(t, L(8, -1.55), L(8, -1.2));
    cam(c[0] + 6 * wob(t, .05) - 1400 * easeIn(whip), c[1] + 5 * wob(t, .04), c[2]);
    stromaBg(t, 'e');
    // the wheel lifts away and shrinks for the crops
    const lift = ease(seg(t, L(7, 9.5), L(7, 10.5)));
    push(); translate(lerp(0, 1160 - WC[0] * .6, lift), lerp(0, 120 - (WC[1] - WR - 40) * .6 + 40, lift)); scale(lerp(1, .6, lift));
    // the three arrows of the cycle
    const arr = mixCol(Z.rub, PAL.cream, .1);
    arcArrow(WC[0], WC[1], WR, -78 * DEG, -12 * DEG, seg(t, L(6, 11.6), L(6, 12.2)), arr, 'e1', 17);
    arcArrow(WC[0], WC[1], WR, 12 * DEG, 168 * DEG, seg(t, L(6, 11.9), L(6, 12.6)), arr, 'e2', 17);
    arcArrow(WC[0], WC[1], WR, 192 * DEG, 258 * DEG, seg(t, L(6, 12.2), L(6, 12.8)), arr, 'e3', 17);
    // Rubisco, chomping when something lands in its cleft
    const chomp = .14 * (spring(t, L(5, 5.9), 7, 22) + spring(t, L(6, 12.3), 7, 22));
    const open = t < L(5, 1.7) ? .3 : t < L(5, 5.7) ? lerp(.3, .85, ease(seg(t, L(5, 1.7), L(5, 2.6)))) : lerp(.85, .45, ease(seg(t, L(5, 5.7), L(5, 6.0))));
    const cl = rubisco(RUB[0], RUB[1], 1, t, { key: 'erub', open, sq: chomp });
    ring(RUB[0], RUB[1], 105, 85, seg(t, L(5, 1.6), L(5, 2.6)), Z.gold, 'erub', 5);
    // L5: C5 slides in, CO₂ joins (six), it splits into two C3
    const c5in = ease(seg(t, L(5, 3.1), L(5, 4.4))), coIn = seg(t, L(5, 4.5), L(5, 5.9)), split = ease(seg(t, L(5, 6.4), L(5, 7.3)));
    const cy0 = cl[1] - 8;
    if (t < L(5, 5.9)) {
      chain(lerp(640, cl[0], c5in), lerp(250, cy0, c5in), 5, .78, { k: seg(t, L(5, 3.0), L(5, 3.3)), key: 'ec5', bend: .3 });
      if (coIn > 0) { const p = arcPt([1280, 120], [cl[0] + 70, cy0 - 4], -60, ease(coIn)); co2(p[0], p[1], .9, t * 1.3, { key: 'eco' }); }
    } else if (split <= 0) {
      chain(cl[0], cy0, 6, .78, { key: 'ec6', gold: 5, bend: .3 });
      K.burst(cl[0] + 70, cy0, 60, seg(t, L(5, 5.9), L(5, 6.4)), Z.gold, 'efix');
    }
    // the two C3: one carries the gold carbon. Through L6 they ride to reduction (right), are reduced (honey), then one
    // becomes sugar (bottom) and the other goes round to regeneration (left), grows back into C5 and returns to Rubisco
    const toRed = ease(seg(t, L(6, 0), L(6, 1.4))), red = honeyK(t, L(6, 4.8));
    const cA0 = [cl[0] - 80, cy0 + 40], cB0 = [cl[0] + 80, cy0 + 40], cA1 = [WC[0] + WR - 30, WC[1] - 90], cB1 = [WC[0] + WR + 40, WC[1] + 10];
    const sugarHop = seg(t, L(6, 7.1), L(6, 8.2)), round = ease(seg(t, L(6, 8.6), L(6, 10.4))), grow = seg(t, L(6, 10.4), L(6, 10.9)), back = ease(seg(t, L(6, 11.0), L(6, 12.3)));
    if (split > 0 && t < L(7, 0)) {
      const pA = toRed > 0 ? [lerp(cA0[0], cA1[0], toRed), lerp(cA0[1], cA1[1], toRed) - 60 * Math.sin(toRed * Math.PI)] : [lerp(cl[0] - 30, cA0[0], split), lerp(cy0, cA0[1], split)];
      const pB = toRed > 0 ? [lerp(cB0[0], cB1[0], toRed), lerp(cB0[1], cB1[1], toRed) - 40 * Math.sin(toRed * Math.PI)] : [lerp(cl[0] + 30, cB0[0], split), lerp(cy0, cB0[1], split)];
      const col = mixCol(Z.carb, Z.honey, red);
      if (sugarHop <= 0) chain(pA[0], pA[1], 3, .9, { key: 'eA', ang: toRed * Math.PI / 2, col });
      else if (sugarHop < 1) { const p = arcPt(pA, [WC[0], WC[1] + WR + 10], 120, ease(sugarHop)); chain(p[0], p[1], 3, .9 * (1 - .5 * sugarHop), { key: 'eA', col, ang: sugarHop * 3 }); }
      sugar(WC[0], WC[1] + WR + 10, 1.3, { k: seg(t, L(6, 8.0), L(6, 8.4)), key: 'esug', rot: .15 * Math.sin(t) });
      if (sugarHop >= 1) K.sparkle(WC[0] + 30, WC[1] + WR - 20, 40, seg(t, L(6, 8.2), L(6, 8.9)), '#FFF3C4');
      if (round <= 0) chain(pB[0], pB[1], 3, .9, { key: 'eB', ang: toRed * Math.PI / 2, col, gold: 2 });
      else if (back <= 0) { const p = wp(lerp(5, 180, round) * DEG); chain(p[0], p[1], grow > 0 ? 5 : 3, .9, { key: 'eB', ang: lerp(Math.PI / 2, Math.PI * 1.5, round), col: mixCol(col, Z.carb, grow), gold: grow > 0 ? null : 2 }); }
      else if (back < 1) { const p = wp(lerp(180, 262, back) * DEG); chain(p[0], p[1] - 20 * back, 5, .78, { key: 'eB', ang: lerp(Math.PI * 1.5, Math.PI * 2, back), bend: .3 * back }); }
      else chain(cl[0], cy0, 5, .78, { key: 'eB', bend: .3 });
      if (grow > 0 && grow < 1) K.burst(wp(Math.PI)[0], wp(Math.PI)[1], 55, grow, Z.gold, 'egrow');
    }
    // ATP and NADPH: from the shining grana at the right, onto the two C3; spent, they go back to be recharged
    if (t > L(6, 0) && t < L(7, 0)) {
      boilSeed('beam'); paint([[1640, -200], [2100, -200], [1960, 760], [1700, 760]], { wash: '#FFF3C4', washOp: 70, ink: null });
      [[1810, 430], [1830, 690]].forEach(([x, y], i) => { boilSeed('gra' + i); for (let j = 0; j < 5; j++) paint(rrPts(x - 60, y - 52 + j * 21, 120, 18, 8, .5), { wash: j % 2 ? Z.granum : mixCol(Z.granum, PAL.cream, .25), ink: Z.granumDk, sw: .9 }); });
      [[0, cA1, 'atp', -40], [1, cA1, 'nad', 30], [2, cB1, 'atp', -40], [3, cB1, 'nad', 30]].forEach(([i, dst, kind, dy]) => {
        const t0 = L(6, .9) + i * .7, go = seg(t, t0, t0 + 1.2), ret = seg(t, L(6, 5.4) + i * .15, L(6, 6.4) + i * .15);
        const src = [1800, 440 + (i % 2) * 230], hit = [dst[0] + 70, dst[1] + dy * 1.3];
        let p = go < 1 ? arcPt(src, hit, 90, ease(go)) : ret > 0 ? arcPt(hit, src, 70, ease(ret)) : hit;
        if (go <= 0 || ret >= 1) return;
        const used = honeyK(t, L(6, 4.8));
        if (kind === 'atp') atp(p[0], p[1], 1.25, { key: 'ea' + i, spent: used }); else nadph(p[0], p[1], 1.25, 1 - used, { key: 'en' + i });
        if (go >= 1 && ret <= 0) K.burst(hit[0] - 20, hit[1], 40, seg(t, L(6, 4.8), L(6, 5.3)), Z.gold, 'eh' + i);
      });
    }
    // L7: the wheel keeps turning: tokens flow round; the first product rings gold and grows into a badge
    if (t >= L(7, 0)) {
      for (let i = 0; i < 6; i++) {
        const a = (-90 + i * 60) * DEG + (t - L(7, 0)) * .55, an = ((a / DEG % 360) + 360) % 360, p = wp(a);
        const kind = an >= 270 || an < 0 ? 3 : an < 90 ? 3 : an < 180 ? 3 : 5, col = an >= 270 ? Z.carb : an < 180 ? Z.honey : Z.carb;
        if (!(an > 248 && an < 292)) chain(p[0], p[1], kind, .82, { key: 'et' + i, ang: a + Math.PI / 2, col, bend: kind === 5 ? .3 : 0 });
      }
      holdRing(wp(-45 * DEG)[0], wp(-45 * DEG)[1], 70, 70, ease(seg(t, L(7, 2.6), L(7, 3.0))) * (1 - seg(t, L(7, 4.4), L(7, 4.8))), Z.gold, 'efirst', 4);
    }
    pop();
    if (t >= L(7, 0)) {
      const bk = ease(seg(t, L(7, 4.3), L(7, 5.6))), p0 = [wp(-45 * DEG)[0], wp(-45 * DEG)[1]], p = [lerp(p0[0], 300, bk), lerp(p0[1], 210, bk)];
      if (t > L(7, 4.3)) chain(p[0], p[1], 3, lerp(.82, 2.0, bk), { key: 'ebadge', gold: 0, hi: i => near(t, L(7, 8.6 + i * .25), .15) });
      // a strip of soil rises with three C3 crops on it, each wearing the three-bead badge
      const soil = ease(seg(t, L(7, 9.6), L(7, 10.2)));
      if (soil > 0) {
        boilSeed('soil'); paint([[-300, lerp(1300, 900, soil)], [600, lerp(1300, 880, soil)], [1400, lerp(1300, 895, soil)], [2300, lerp(1300, 885, soil)], [2300, 1500], [-300, 1500]], { wash: '#C9B48A', ink: PAL.ink, sw: 1, curv: .4 });
        [[cropRice, 620, L(7, 10.0)], [cropWheat, 1000, L(7, 11.2)], [cropSoy, 1380, L(7, 11.9)]].forEach(([fn, x, t0], i) => {
          fn(x, 900, 1.15, t, seg(t, t0, t0 + .4), 'e' + i);
          chain(x + 120, 610, 3, .85, { k: seg(t, t0 + .3, t0 + .6), key: 'ebg' + i, gold: 0 });
        });
      }
    }
    camEnd();
    host(210, 910, 30, t, [[0, 'calm', { lookX: .8, lookY: -.6 }], [L(5, 1.8), 'wow', { lookX: .9, lookY: -.7 }], [L(5, 6.1), 'excited', { lookX: .9, lookY: -.6 }], [L(5, 9.4), 'idea', { lookX: .9, lookY: -.6 }],
      [L(6, 1.5), 'calm', { lookX: .9, lookY: -.2 }], [L(6, 5.0), 'wow', { lookX: .9 }], [L(6, 7.5), 'happy', { lookX: .9, lookY: .3 }], [L(6, 11.8), 'excited', { lookX: .8, lookY: -.3 }],
      [L(7, 2.7), 'calm', { lookX: .7, lookY: -.7 }], [L(7, 8.6), 'idea', { lookX: .3, lookY: -.8 }], [L(7, 10.2), 'happy', { lookX: .9, lookY: .2 }], [L(7, 12.6), 'laugh']], {}, 'pe');
    flash(1 - seg(t, L(5, -.9), L(5, -.4)));
    if (whip > 0) speedLines(whip, 'e');
  }
  function speedLines(k, key) {                              // pale streaks for a whip pan (screen space)
    boilSeed('spd' + key + Math.floor(k * 8));
    for (let i = 0; i < 18; i++) { const y = hash(i + 70) * H, x0 = hash(i + 71) * W * .6 - 200, l = 500 + 600 * hash(i + 72);
      paint(ribbon([[x0, y], [x0 + l * .5, y + 2], [x0 + l, y + 4]], 2, 4 + 6 * hash(i + 73)), { wash: '#FFFBEF', washOp: 210, ink: null }); }
  }

  // ================================ F: Rubisco's flaws: slow, and it grabs O₂ ================================
  const RF = [960, 560], RFS = 1.7;
  const CROWD = []; for (let i = 0; i < 64; i++) { const a = i * 2.39996, r = 330 + 95 * Math.sqrt(i) * 1.5; const x = RF[0] + Math.cos(a) * r * 1.35, y = RF[1] + Math.sin(a) * r * .95; if (x > -1100 && x < 3000 && y > -700 && y < 1800) CROWD.push([x, y, .55 + .2 * hash(i), i]); }
  function shotF(t, lt, dur) {
    const whip = 1 - seg(t, L(8, -1.2), L(8, -.85));
    const z = kf(t, [[L(8, 6.8), 1.0], [L(8, 8.6), .62], [L(8, 9.2), .62], [L(8, 11.4), .46], [L(9, -.7), .46], [L(9, .3), 1.0]], ease);
    cam(960 + 6 * wob(t, .05) + 1400 * whip * whip, 540 + 5 * wob(t, .04), z);
    const hot = ease(seg(t, L(9, 5.0), L(9, 6.0)));
    stromaBg(t, 'f', hot);
    if (hot > 0) for (let i = 0; i < 6; i++) { boilSeed('fheat' + i); const y = 140 + i * 150 + 12 * wob(t, .2, i), x0 = 1300 + (i % 2) * 200, P = []; for (let j = 0; j <= 6; j++) P.push([x0 + j * 40, y + 8 * Math.sin(j * 1.4 + t * 3 + i)]); inkLine(P, 1.2 * hot, mixCol(Z.hot, Z.sunDk, .45), 'inkfine', .6); }
    // the crowd: the leaf makes Rubisco in bulk
    const crowdOut = 1 - seg(t, L(9, -.9), L(9, -.3));
    CROWD.forEach(([x, y, s, i]) => { const k = seg(t, L(8, 6.9) + (i < 22 ? i * .06 : 2.3 + (i - 22) * .04), L(8, 7.3) + (i < 22 ? i * .06 : 2.3 + (i - 22) * .04)) * crowdOut; if (k <= .02) return;
      enzyme(x, y, s * backOut(k), t, { key: 'fc' + i, open: .4 + .2 * hash(i), inner: [[0, .3, .5, .35]] }); });
    // the slow chomp, a stopwatch, a queue of CO₂ waiting their turn
    const yawn = t > L(8, 2.4) && t < L(8, 3.6) ? Math.sin(seg(t, L(8, 2.4), L(8, 3.6)) * Math.PI) : 0;
    const catches = []; for (let k = 0; k < 7; k++) catches.push(L(8, 3.95) + k * .36);
    let prog = 0; catches.forEach(tc => prog += ease(seg(t, tc, tc + .22)));
    let sq = .12 * ring2(t, catches) + .14 * spring(t, L(9, 9.3), 7, 22);
    const grabO2 = seg(t, L(9, 8.9), L(9, 9.3));
    const sway = t > L(9, 2.0) && t < L(9, 4.6) ? .12 * Math.sin((t - L(9, 2.0)) * 2.6) : 0;
    push(); translate(RF[0], RF[1]); rotate(sway); translate(-RF[0], -RF[1]);
    const cl = rubisco(RF[0], RF[1], RFS, t, { key: 'frub', open: .35 + .55 * yawn + .2 * grabO2, sq });
    pop();
    if (t > L(8, 3.6) && t < L(9, 0)) for (let i = 0; i < 7; i++) {
      const sl = i - prog; if (sl <= -1) continue;
      const q0 = [cl[0] - 150 - Math.max(0, sl) * 92, cl[1] - 70 - Math.max(0, sl) * 10], p = sl >= 0 ? q0 : [lerp(cl[0] - 150, cl[0], -sl), lerp(cl[1] - 70, cl[1] - 10, -sl)];
      co2(p[0], p[1] + 4 * wob(t, .5, i), 1.1 * (sl >= 0 ? backOut(seg(t, L(8, 3.6) + i * .05, L(8, 3.9) + i * .05)) : 1 + sl), wob(t, .2, i) * .3, { key: 'fq' + i });
    }
    stopwatch(1560, 250, 95, t, Math.max(0, t - L(8, 3.8)), seg(t, L(8, 3.5), L(8, 3.9)) * (1 - seg(t, L(8, 6.6), L(8, 7.0))), 'f');
    // L9: a CO₂ and an O₂ side by side; the heat; the window on the stoma; O₂ piles up; the wrong grab
    if (t > L(9, 1.4)) {
      const inK = ease(seg(t, L(9, 1.5), L(9, 3.6))), gone2 = seg(t, L(9, 7.2), L(9, 8.4));
      co2(lerp(300, 790, inK) - 500 * easeIn(gone2), lerp(300, 400, inK) - 200 * gone2, 1.2 * (1 - gone2), .2 * wob(t, .3), { key: 'fpc' });
      const oP = grabO2 > 0 ? [lerp(1130, cl[0], ease(grabO2)), lerp(400, cl[1] - 10, ease(grabO2))] : [lerp(1700, 1130, inK), lerp(300, 400, inK)];
      if (t < L(9, 12.0)) o2(oP[0], oP[1], 1.3, .3 * wob(t, .3), { key: 'fpo' });
      for (let i = 0; i < 12; i++) { const k = seg(t, L(9, 7.2) + i * .12, L(9, 7.6) + i * .12); if (k <= 0) continue; const a = i * 2.1 + 1, r = 330 + 90 * (i % 3);
        o2(RF[0] + Math.cos(a) * r * 1.5 + 14 * wob(t, .25, i), RF[1] + Math.sin(a) * r * .9 + 12 * wob(t, .2, i), 1.1 * backOut(k), a + t * .3, { key: 'fo' + i }); }
      K.cross(cl[0] + 150, cl[1] - 120, 120, seg(t, L(9, 9.4), L(9, 10.0)), 'fx');
      ring(RF[0], RF[1], 170, 135, seg(t, L(9, 9.3), L(9, 10.2)), Z.red, 'fr1', 6);
      ring(RF[0], RF[1], 170, 135, seg(t, L(9, 13.7), L(9, 14.6)), Z.red, 'fr2', 6);
      if (t > L(9, 13.6) && t < L(9, 14.8)) o2(cl[0], cl[1] - 12, 1.1, 0, { key: 'fpo2' });
      // wasted: an ATP is spent, a CO₂ puffs back out
      const ag = seg(t, L(9, 10.4), L(9, 11.2));
      if (ag > 0 && t < L(9, 12.6)) { const p = arcPt([1900, 760], [cl[0] + 170, cl[1] + 60], 80, ease(ag)); atp(p[0], p[1], 1.3, { key: 'fatp', spent: ease(seg(t, L(9, 11.2), L(9, 11.6))) }); }
      const puff = seg(t, L(9, 11.7), L(9, 13.2));
      if (puff > 0 && puff < 1) { const p = [lerp(cl[0] - 60, -200, easeIn(puff)), lerp(cl[1] + 20, 120, puff)]; co2(p[0], p[1], 1.2, puff * 6, { key: 'fpuff' }); K.burst(cl[0] - 60, cl[1] + 20, 50, seg(t, L(9, 11.7), L(9, 12.2)), PAL.ink, 'fpb'); }
    }
    camEnd();
    // the window onto the leaf surface: the sun beats down and the stoma shuts
    const wk = seg(t, L(9, 4.5), L(9, 4.9)) * (1 - seg(t, L(9, 12.4), L(9, 12.8)));
    if (wk > .02) {
      const q = backOut(wk), wx = 400, wy = 280, R = 190 * q;
      boilSeed('win'); paint(ellPts(wx, wy, R, R, 36), { wash: Z.epi, ink: PAL.ink, sw: 2.2 });
      stomaTop(wx, wy + 10, .62 * q, 1 - ease(seg(t, L(9, 6.1), L(9, 6.8))), t, { key: 'fw', mood: t > L(9, 6.1) ? ['determined', 'determined'] : ['calm', 'calm'] });
      sunIcon(wx + 150 * q, wy - 140 * q, 56 * q * (1 + .1 * pulse(t)), t, hot, 'fw');
      if (t > L(9, 6.4)) pipEmote('sweat', wx + 90 * q, wy - 80 * q, 22, 1, 'fws');
    }
    host(210, 910, 30, t, [[0, 'calm', { lookX: .9, lookY: -.3 }], [L(8, 2.5), 'wow', { lookX: .9, lookY: -.2 }], [L(8, 4.3), 'worried', { lookX: .9, lookY: -.2 }], [L(8, 7.0), 'wow', { lookX: .6, lookY: -.5 }], [L(8, 9.6), 'dizzy'],
      [L(9, 0), 'calm', { lookX: .9, lookY: -.4 }], [L(9, 2.3), 'confused', { lookX: .9, lookY: -.4 }], [L(9, 5.4), 'worried', { lookX: .5, lookY: -.8 }], [L(9, 9.5), 'worried', { lookX: .9, lookY: -.3 }], [L(9, 11.9), 'sad', { lookX: .9 }], [L(9, 13.9), 'worried', { lookX: .9 }]], {}, 'pf');
    if (whip > 0) speedLines(1 - whip, 'f');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E6D8B8', Z.recap]);
  }
  const ring2 = (t, evs) => evs.reduce((s, e) => s + spring(t, e + .2, 7, 22), 0);

  // ================================ G: recap one (cream board) ================================
  function shotG(t, lt, dur) {
    cam(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    ground(Z.recap, Z.recapBlob, t, 'g', { n: 4 });
    const y = 400;
    co2(470, y, 2.2 * popIn(t, L(10, 1.4)), 0, { key: 'gco' });
    arrow(590, y, 770, y, seg(t, L(10, 2.1), L(10, 2.6)), mixCol(Z.rub, PAL.cream, .3), 'g1', 18);
    rubisco(980, y + 24, 1.45 * popIn(t, L(10, 2.7)), t, { key: 'grub', open: .45 });
    arrow(1190, y, 1360, y, seg(t, L(10, 3.5), L(10, 4.0)), mixCol(Z.rub, PAL.cream, .3), 'g2', 18);
    chain(1530, y, 3, 1.9, { k: seg(t, L(10, 4.2), L(10, 4.6)), key: 'gch', gold: 0 });
    // slow, and confuses O₂
    stopwatch(760, 165, 72, t, Math.max(0, t - L(10, 5.9)) * .25, seg(t, L(10, 5.8), L(10, 6.2)), 'g');
    if (t > L(10, 6.5)) { o2(1200, 170, 1.8 * popIn(t, L(10, 6.5)), 0, { key: 'go2' }); K.cross(1200, 170, 140, seg(t, L(10, 6.8), L(10, 7.3)), 'gx'); }
    // hotter and drier → the worse it does
    sunIcon(600, 790, 80, t, seg(t, L(10, 8.0), L(10, 8.4)), 'g');
    if (t > L(10, 8.5)) { const q = popIn(t, L(10, 8.5)); boilSeed('gwin'); paint(ellPts(960, 790, 140 * q, 140 * q, 30), { wash: Z.epi, ink: PAL.ink, sw: 1.8 }); stomaTop(960, 795, .5 * q, 0, t, { key: 'gst', mood: ['determined', 'determined'] }); }
    arrow(1180, 700, 1430, 890, seg(t, L(10, 9.2), L(10, 9.8)), Z.red, 'g3', 18);
    if (t > L(10, 9.8)) { const q = popIn(t, L(10, 9.8)); chain(1560, 900, 3, 1.2 * q, { key: 'gsm', gold: 0 }); }
    camEnd();
    host(220, 910, 30, t, [[0, 'calm', { lookX: .9, lookY: -.5 }], [L(10, 4.5), 'happy', { lookX: .9, lookY: -.5 }], [L(10, 6.9), 'worried', { lookX: .9, lookY: -.6 }], [L(10, 9.9), 'sad', { lookX: .9 }], [L(11, -2.6), 'idea', { lookX: .6, lookY: -.6 }]], {}, 'pg');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E6D8B8', Z.recap]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#D9B24A', Z.corn]);
  }

  // ================================ H: the corn field at noon ================================
  function cornPlant(x, y, s, t, key) {                      // a tall stalk, arching leaves, a tassel, an ear with silk
    boilSeed('corn' + key);
    const sw = 8 * wob(t, .22, x * .013), top = [x + sw, y - 600 * s];
    paint(ribbon([[x, y], [x + sw * .3, y - 300 * s], top], 20 * s, 9 * s), { wash: '#7FAE4E', ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 6; i++) { const h = (110 + i * 80) * s, sd = i % 2 ? -1 : 1, b = [x + sw * h / (600 * s), y - h], fl = 4 * wob(t, .3, i + x);
      paint(ribbon([b, [b[0] + sd * 150 * s, b[1] - 90 * s + fl], [b[0] + sd * (280 - i * 18) * s, b[1] + (10 + i * 6) * s + fl * 2]], 26 * s, 3 * s), { wash: i % 2 ? '#86B85A' : '#7AAE50', ink: PAL.ink, sw: .8 });
      inkLine([b, [b[0] + sd * 150 * s, b[1] - 88 * s + fl], [b[0] + sd * (270 - i * 18) * s, b[1] + (8 + i * 6) * s + fl * 2]], .7, '#5E8C3E', 'inkfine', .5); }
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .22; inkLine([top, [top[0] + Math.cos(a) * 70 * s, top[1] + Math.sin(a) * 60 * s - 20 * s], [top[0] + Math.cos(a) * 110 * s, top[1] + Math.sin(a) * 30 * s + 10 * s]], 2.2 * s, '#C9A24A', 'ink', .6); }
    const e = [x + sw * .45 + 24 * s, y - 280 * s];
    paint(ellPts(e[0], e[1], 22 * s, 62 * s, 16, 1, .25), { wash: '#A9C86A', ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 4; i++) inkLine([[e[0] + 10 * s, e[1] - 58 * s], [e[0] + (22 + i * 6) * s, e[1] - (80 + i * 6) * s]], 1, '#A0703A', 'inkfine', .4);
  }
  function canePlant(x, y, s, t, key) {                      // sugarcane: a jointed purple-green stalk, long narrow leaves
    boilSeed('cane' + key);
    const sw = 6 * wob(t, .2, x * .01);
    for (let i = 0; i < 7; i++) { const y0 = y - i * 78 * s, y1 = y0 - 76 * s; paint(rrPts(x - 13 * s + sw * i / 7, y1, 26 * s, 76 * s, 10 * s, .5), { wash: i % 2 ? '#9C8A6A' : '#A8946E', ink: PAL.ink, sw: .8 }); }
    for (let i = 0; i < 5; i++) { const sd = i % 2 ? -1 : 1, b = [x + sw, y - (300 + i * 60) * s];
      paint(ribbon([b, [b[0] + sd * 140 * s, b[1] - 120 * s], [b[0] + sd * 260 * s, b[1] - 40 * s]], 16 * s, 2 * s), { wash: '#7FB25A', ink: PAL.ink, sw: .7 }); }
  }
  const H_PIP = [560, 960];
  function shotH(t, lt, dur) {
    const cutP = [1480, 470];
    const c = t < L(11, 2.9) ? [960, 540, 1.0] : pushTo(t, L(11, 2.9), L(11, 3.4), [960, 540, 1.0], cutP, 5);
    cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    ground(mixCol(Z.sky, Z.corn, .3), Z.skyHot, t, 'h', { n: 4, h: 600 });
    sunIcon(300, 170, 80, t, 1, 'h');
    boilSeed('hfar'); for (let i = 0; i < 14; i++) { const x = -100 + i * 160, h = 150 + 40 * hash(i + 3); paint(ribbon([[x, 760], [x + 6, 760 - h * .6], [x + 10, 760 - h]], 26, 6), { wash: mixCol('#9CBF6A', Z.corn, .45), ink: null }); }
    boilSeed('hgr'); paint([[-300, 760], [800, 740], [1500, 755], [2300, 745], [2300, 1500], [-300, 1500]], { wash: Z.corn, ink: PAL.ink, sw: .9, curv: .5 });
    cornPlant(1240, 1000, 1.25, t, 'h1'); canePlant(1700, 1010, 1.15, t, 'h2'); cornPlant(1000, 1010, .9, t, 'h3');
    // the slice across a corn leaf
    const sl = seg(t, L(11, 2.5), L(11, 2.85));
    if (sl > 0) { boilSeed('slice'); const P = []; for (let i = 0; i <= 10 * sl; i++) { const a = i / 10; P.push([cutP[0] - 140 + a * 280, cutP[1] + 60 - a * 120 + 30 * Math.sin(a * Math.PI)]); } if (P.length > 1) { inkLine(P, 12 * (1 - .4 * sl), '#FFFBEA', 'ink', .5); inkLine(P.map(([a, b]) => [a + 4, b + 8]), 1.6, PAL.ink, 'inkfine', .5); } }
    const wilt = 1 - ease(seg(t, L(11, .3), L(11, 1.0)));
    const o = K.act(t, [[0, 'sad', { lookX: .5, lookY: -.3 }], [L(11, .4), 'wow', { lookX: .8, lookY: -.8 }], [L(11, 2.3), 'calm', { lookX: .9, lookY: -.9 }]]);
    pip(H_PIP[0], H_PIP[1], 36, { ...o, leaf: (o.leaf || 0) - 1.1 * wilt, emote: t < L(11, .4) ? 'sweat' : o.emote, emoteK: t < L(11, .4) ? 1 : o.emoteK, key: 'ph' });
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#D9B24A', Z.corn]);
    flash(seg(t, L(11, 3.0), L(11, 3.4)));
  }

  // ================================ I: inside the corn leaf: the Kranz wreath, the pump ================================
  const KR = [960, 540];
  const BSC = Array.from({ length: 10 }, (_, i) => { const a = i / 10 * TAU + .1; return [KR[0] + Math.cos(a) * 165, KR[1] + Math.sin(a) * 160, a, i]; });
  const MSC = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * TAU + .2; return [KR[0] + Math.cos(a) * 310, KR[1] + Math.sin(a) * 300, a, i]; });
  function blobCell(x, y, rr, rt, a, key, col, ink, sw = 1.1) {   // a cell squeezed in a ring: rr radial, rt tangential half-size
    boilSeed(key); const P = [];
    for (let k = 0; k < 18; k++) { const b = k / 18 * TAU, wob2 = 1 + .06 * Math.sin(b * 3 + hash(key.length)); const lx = Math.cos(b) * rr * wob2, ly = Math.sin(b) * rt * wob2;
      P.push([x + lx * Math.cos(a) - ly * Math.sin(a), y + lx * Math.sin(a) + ly * Math.cos(a)]); }
    paint(P, { wash: col, ink, sw, curv: .3 });
  }
  function wreath(t, key, o = {}) {
    const vk = o.vein ?? 1, bk = o.bs || (() => 1), mk = o.meso || (() => 1);
    // a hint of the leaf around: upper and lower epidermis, faint neighbours
    boilSeed('wep' + key);
    for (const y of [60, 1020]) inkLine([[-1400, y], [1000, y + 6], [3400, y]], 2, mixCol(Z.sage, PAL.ink, .25), 'ink', .5);
    [[-180, 540]].forEach(([x, y], i) => { boilSeed('wnb' + i + key); paint(ellPts(x, y, 160, 150, 24), { wash: mixCol(Z.sage, Z.bs, .25), ink: null }); });
    MSC.forEach(([x, y, a, i]) => { const q = backOut(clamp(mk(i))); if (q <= .02) return;
      blobCell(x, y, 78 * q, 52 * q, a, 'ms' + i + key, mixCol(Z.meso, Z.pepc, o.outer || 0), Z.mesoDk);
      for (let j = 0; j < 3; j++) { boilSeed('msd' + i + j + key); const b = a + (j - 1) * .12, r = 310 + (j - 1) * 28; paint(ellPts(KR[0] + Math.cos(b) * r, KR[1] + Math.sin(b) * r * .97, 10 * q, 6 * q, 8, 0, b), { wash: Z.chl, ink: null }); } });
    BSC.forEach(([x, y, a, i]) => { const q = backOut(clamp(bk(i))); if (q <= .02) return;
      blobCell(x, y, 56 * q, 62 * q, a, 'bs' + i + key, mixCol(Z.bs, Z.rub, o.inner || 0), Z.bsDk, 1.3);
      for (let j = 0; j < 5; j++) { boilSeed('bsd' + i + j + key); const b = a + (j - 2) * .16, r = 182; paint(ellPts(KR[0] + Math.cos(b) * r, KR[1] + Math.sin(b) * r, 13 * q, 8 * q, 8, 0, b + Math.PI / 2), { wash: Z.chlDk, ink: null }); } });
    if (vk > .02) { const q = backOut(clamp(vk)); boilSeed('vein' + key);
      paint(ellPts(KR[0], KR[1], 100 * q, 96 * q, 28, 1), { wash: Z.vein, ink: Z.veinDk, sw: 1.2 });
      [[-34, -26, 26], [36, -24, 24], [0, 26, 14], [-20, 52, 9], [18, 54, 9], [0, -60, 10]].forEach(([dx, dy, r], i) => paint(ellPts(KR[0] + dx * q, KR[1] + dy * q, r * q, r * q, 14), { wash: i < 2 ? '#F7F1DA' : mixCol(Z.vein, Z.bs, .2), ink: Z.veinDk, sw: i < 2 ? 1.6 : .8 })); }
    if (o.dash > .02) { boilSeed('wdash' + key); for (let i = 0; i < 28; i++) { const a0 = i / 28 * TAU, a1 = a0 + .6 / 28 * TAU; inkLine([[KR[0] + Math.cos(a0) * 240, KR[1] + Math.sin(a0) * 234], [KR[0] + Math.cos(a1) * 240, KR[1] + Math.sin(a1) * 234]], 4 * o.dash, Z.gold, 'ink', 0); } }
  }
  // the two-cell close-up: a mesophyll cell (left) and a bundle-sheath cell (right), a channel through the shared wall
  const MC = [520, 540], BC = [1470, 540], CH = [985, 560], RBI = [1500, 640], PEI = [560, 640];
  function twoCells(t, key, moodM, moodB) {
    ground(Z.sage, Z.sageBlob, t, 'tc' + key, { n: 4, x0: -300, w: 2600 });
    boilSeed('tcv' + key); paint(ellPts(2150, 560, 220, 420, 30), { wash: Z.vein, ink: Z.veinDk, sw: 1.2 });
    const cellP = (cx, cy, rx, ry, seed) => { const P = []; for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; P.push([cx + Math.cos(a) * rx * (1 + .03 * Math.sin(a * 3 + seed + t * .8)), cy + Math.sin(a) * ry * (1 + .03 * Math.cos(a * 2 + seed))]); } return P; };
    boilSeed('tcm' + key); paint(cellP(MC[0], MC[1], 470, 420, 1), { wash: Z.meso, ink: PAL.ink, sw: 1.8, curv: .3 });
    for (let j = 0; j < 7; j++) { const a = j * .9 + .4; boilSeed('tcmc' + j + key); paint(ellPts(MC[0] + Math.cos(a) * 360, MC[1] + Math.sin(a) * 320, 28, 16, 10, 0, a + 1.57), { wash: Z.chl, ink: Z.chlDk, sw: .7 }); }
    boilSeed('tcb' + key); paint(cellP(BC[0], BC[1], 480, 430, 2), { wash: mixCol(Z.bs, PAL.cream, .18), ink: PAL.ink, sw: 1.8, curv: .3 });
    for (let j = 0; j < 9; j++) { const a = j * .7 + .2; boilSeed('tcbc' + j + key); paint(ellPts(BC[0] + Math.cos(a) * 380, BC[1] + Math.sin(a) * 340, 34, 19, 10, 0, a + 1.57), { wash: Z.chlDk, ink: PAL.ink, sw: .7 }); }
    // the channel (plasmodesma) through the shared wall
    boilSeed('tcch' + key); paint(rrPts(CH[0] - 46, CH[1] - 20, 92, 40, 18, .5), { wash: mixCol(Z.meso, PAL.cream, .45), ink: PAL.ink, sw: 1.2 });
    K.face(MC[0] - 170, MC[1] - 250, 46, t, { mood: moodM, blush: false, seed: 1, lx: .6 });
    K.face(BC[0] + 140, BC[1] - 260, 46, t, { mood: moodB, blush: false, seed: 3, lx: -.6 });
  }
  const I3 = () => L(14, -.5);
  function shotI(t, lt, dur) {
    const s1 = t < L(12, .6), s2 = !s1 && t < I3();
    if (s1) {
      const c = t < L(12, 0) ? [960, 540, 1.0] : pushTo(t, L(12, 0), L(12, .6), [960, 540, 1.0], [MSC[8][0], MSC[8][1]], 4);
      cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      ground(Z.sage, Z.sageBlob, t, 'i1', { n: 4 });
      wreath(t, 'i1', { vein: seg(t, L(11, 4.0), L(11, 4.5)), bs: i => seg(t, L(11, 6.0) + i * .14, L(11, 6.4) + i * .14), meso: i => seg(t, L(11, 9.4) + i * .09, L(11, 9.8) + i * .09) });
      ring(KR[0], KR[1], 110, 106, seg(t, L(11, 4.7), L(11, 5.6)), Z.gold, 'iv', 5);
      for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i / 16 * TAU, k = seg(t, L(11, 12.0) + i * .06, L(11, 12.6) + i * .06); if (k > 0 && k < 1) K.sparkle(KR[0] + Math.cos(a) * 395, KR[1] + Math.sin(a) * 385, 34, k, '#FFF3C4'); }
      holdRing(KR[0], KR[1], 395, 385, pulseK(t, L(11, 12.0), 1.8), Z.gold, 'igar', 5);
      camEnd();
      host(210, 910, 30, t, [[0, 'wow', { lookX: .9, lookY: -.5 }], [L(11, 6.2), 'calm', { lookX: .9, lookY: -.4 }], [L(11, 12.1), 'love']], {}, 'pi1');
      flash(1 - seg(t, L(11, 3.4), L(11, 3.9)));
      flash(seg(t, L(12, .2), L(12, .6)));
      return;
    }
    if (s2) {
      const c = kf(t, [[L(12, .6), [700, 540, 1.2]], [L(13, .2), [720, 540, 1.2]], [L(13, 2.8), [1180, 540, 1.15]], [L(13, 4.8), [1240, 560, 1.08]]], ease);
      cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      twoCells(t, 'i2', t > L(12, 6.2) ? 'happy' : t > L(12, 2.4) ? 'wow' : 'calm', t > L(13, 11.2) ? 'happy' : t > L(13, 3.1) ? 'wow' : 'calm');
      // PEP carboxylase: quick snaps; PEP + CO₂ → a four-carbon chain; O₂ bounces off; a lone CO₂ is still caught
      const snaps = [L(12, 2.6), L(12, 3.2), L(12, 6.0), L(12, 9.6), L(12, 11.7)];
      const pk = popIn(t, L(12, 2.2), .4), psq = .16 * snaps.reduce((a, e) => a + spring(t, e, 9, 26), 0);
      const pcl = pepc(PEI[0], PEI[1], 1.45 * pk, t, { key: 'ipep', open: .55, sq: psq });
      const pepIn = ease(seg(t, L(12, 4.4), L(12, 5.4))), coIn = seg(t, L(12, 4.9), L(12, 6.0));
      if (t < L(12, 6.0)) {
        if (t > L(12, 4.3)) chain(lerp(380, pcl[0], pepIn), lerp(900, pcl[1] - 8, pepIn), 3, .9, { key: 'ipp', phos: [0] });
        if (coIn > 0) { const p = arcPt([-60, 330], [pcl[0] + 60, pcl[1] - 10], 80, ease(coIn)); co2(p[0], p[1], 1.1, t * 1.4, { key: 'ico1' }); }
      }
      K.burst(pcl[0] + 30, pcl[1] - 10, 70, seg(t, L(12, 6.0), L(12, 6.5)), Z.gold, 'ib1');
      // four-carbon chains: #1 born at 6.0, rides to the channel and into the bundle sheath (L13); #2 born at 11.7
      const c4 = (t0, key, path) => { const born = seg(t, t0, t0 + .35); if (born <= 0) return null; return born; };
      const ch1 = [PEI[0] + 40, PEI[1] - 200], ride = ease(seg(t, L(13, 0), L(13, 1.6))), thru = ease(seg(t, L(13, 1.6), L(13, 2.9))), rel = seg(t, L(13, 3.0), L(13, 3.4));
      if (t > L(12, 6.0) && rel <= 0) {
        const p = thru > 0 ? [lerp(CH[0], 1180, thru), CH[1]] : ride > 0 ? [lerp(ch1[0], CH[0], ride), lerp(ch1[1], CH[1], ride)] : ch1;
        chain(p[0], p[1], 4, 1.0, { k: seg(t, L(12, 6.0), L(12, 6.4)), key: 'ic41', gold: 3, hi: i => near(t, L(12, 7.0 + i * .3), .14) });
      }
      if (t > L(12, 11.7)) chain(PEI[0] - 150, PEI[1] - 190, 4, 1.0, { k: seg(t, L(12, 11.7), L(12, 12.1)), key: 'ic42', gold: 3 });
      if (t > L(12, 8.8) && t < L(12, 11.0)) { const a = seg(t, L(12, 8.8), L(12, 9.6)), b = seg(t, L(12, 9.6), L(12, 10.8));
        const p = b > 0 ? arcPt([pcl[0] + 70, pcl[1] - 20], [-120, 980], 120, easeOut(b)) : [lerp(-80, pcl[0] + 70, ease(a)), lerp(760, pcl[1] - 20, ease(a))]; o2(p[0], p[1], 1.2, b * 7, { key: 'io2' });
        K.burst(pcl[0] + 70, pcl[1] - 20, 50, seg(t, L(12, 9.6), L(12, 10.0)), PAL.ink, 'ibonk'); }
      const lone = seg(t, L(12, 10.4), L(12, 11.7)); if (lone > 0 && lone < 1) { const p = [lerp(-160, pcl[0] + 50, ease(lone)), lerp(180, pcl[1] - 10, ease(lone))]; co2(p[0], p[1], 1.1, t, { key: 'ico2' }); }
      // in the bundle sheath: CO₂ pops off, the 3-chain goes back; more arrive; CO₂ crowds round Rubisco
      const rcl = rubisco(RBI[0], RBI[1], 1.35, t, { key: 'irub', open: .55, sq: .14 * (spring(t, L(13, 11.0), 7, 22) + spring(t, L(13, 11.8), 7, 22)) });
      if (rel > 0) { K.burst(1180, CH[1], 60, rel, Z.gold, 'irel');
        const back = ease(seg(t, L(13, 3.4), L(13, 5.0))); if (back < 1) chain(lerp(1180, 700, back), lerp(CH[1], 700, back), 3, 1.0 * (1 - .4 * back), { key: 'ipyr' }); }
      for (let j = 0; j < 3; j++) { const t0 = L(13, 4.6) + j * .6, a = ease(seg(t, t0, t0 + .9)), r = seg(t, t0 + .9, t0 + 1.2); if (a <= 0 || r >= 1) continue;
        chain(lerp(CH[0] - 60, 1180, a), CH[1] + (j - 1) * 30, 4, .85, { key: 'is' + j, gold: 3 }); }
      // the crowd of CO₂ (count rises as they're released), swirling round Rubisco; two are taken
      const nCO = Math.round(clamp(seg(t, L(13, 3.1), L(13, 7.0))) * 11);
      for (let i = 0; i < nCO; i++) {
        const take = i === 0 ? seg(t, L(13, 10.7), L(13, 11.0)) : i === 1 ? seg(t, L(13, 11.5), L(13, 11.8)) : 0; if (take >= 1) continue;
        const a = i * 2.4 + (t - L(13, 3)) * .5, r = 170 + 70 * (i % 3), p = [RBI[0] + Math.cos(a) * r * 1.2, RBI[1] - 40 + Math.sin(a) * r * .9];
        co2(lerp(p[0], rcl[0], ease(take)), lerp(p[1], rcl[1], ease(take)), 1.0 * popIn(t, L(13, 3.1) + i * .35), a, { key: 'icr' + i });
      }
      if (t > L(13, 6.0) && t < L(13, 10.6)) { const k = seg(t, L(13, 8.0), L(13, 10.4)); o2(lerp(RBI[0] + 240, 2300, easeIn(k)), lerp(RBI[1] - 260, 200, k), 1.1, t, { key: 'io2b' }); }
      K.check(RBI[0] + 260, RBI[1] - 300, 120, seg(t, L(13, 11.3), L(13, 11.9)), 'ick');
      camEnd();
      host(210, 910, 30, t, [[0, 'calm', { lookX: .9 }], [L(12, 2.4), 'wow', { lookX: .9, lookY: -.3 }], [L(12, 6.2), 'excited', { lookX: .9, lookY: -.4 }], [L(12, 9.7), 'laugh'], [L(12, 11.8), 'smug', { lookX: .9 }],
        [L(13, 1.0), 'calm', { lookX: .9, lookY: -.2 }], [L(13, 3.2), 'wow', { lookX: .9, lookY: -.3 }], [L(13, 7.4), 'happy', { lookX: .9 }], [L(13, 11.4), 'excited', { lookX: .9, lookY: -.4 }]], {}, 'pi2');
      flash(1 - seg(t, L(12, .6), L(12, 1.1)));
      flash(seg(t, I3() - .45, I3()));
      return;
    }
    // back to the wreath: the C4 badge, the pump, the cost and what it buys, the two scales
    const c = kf(t, [[I3(), [960, 540, 1.0]], [L(15, 7.4), [960, 540, 1.0]], [L(15, 8.5), [2900, 600, 1.0]]], ease);
    cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    ground(Z.sage, Z.sageBlob, t, 'i3', { n: 6, w: 3600, rect: rectPts(-1400, -1400, 7000, 3900) });
    const outer = pulseK(t, L(14, 7.8), 1.3), inner = pulseK(t, L(14, 8.9), 1.3);
    wreath(t, 'i3', { outer: outer * .75, inner: inner * .75, dash: ease(seg(t, L(14, 9.8), L(14, 10.4))) });
    for (let i = 0; i < 14; i++) {                            // the pump: CO₂ drawn in from all round
      const ph = frac((t - L(14, 5.6)) / 2.6 + i / 14), on = seg(t, L(14, 5.6) + i * .1, L(14, 5.9) + i * .1) * (1 - seg(t, L(15, 7.0), L(15, 7.6))); if (on <= 0) continue;
      const a = i / 14 * TAU + .3, r = lerp(600, 190, ease(ph)); co2(KR[0] + Math.cos(a) * r * 1.05, KR[1] + Math.sin(a) * r, .75 * on * (ph > .85 ? 1 - (ph - .85) / .15 : 1), a, { key: 'ip' + i });
    }
    chain(330, 200, 4, 1.8, { k: seg(t, L(14, .3), L(14, .7)), key: 'ibadge', gold: 3, hi: i => near(t, L(14, 2.9 + i * .22), .14) });
    const ag = seg(t, L(15, .2), L(15, 1.4)); if (ag > 0 && t < L(15, 3.4)) { const p = arcPt([1900, 100], [MSC[13][0] + 10, MSC[13][1] - 40], 80, ease(ag)); atp(p[0], p[1], 1.4, { key: 'iatp', spent: ease(seg(t, L(15, 1.5), L(15, 2.0))) }); }
    const wg = popIn(t, L(15, 2.5)) * (1 - ease(seg(t, L(15, 4.0), L(15, 4.6))));
    if (wg > .02) { rubisco(1560, 240, .6 * wg, t, { key: 'iwr', open: .5 }); o2(1560, 200, .8 * wg, 0, { key: 'iwo' }); K.cross(1640, 170, 70 * wg, 1, 'iwx'); }
    if (t > L(15, 4.0)) K.sparkle(1560, 230, 60, seg(t, L(15, 4.2), L(15, 4.9)), '#FFF3C4');
    const sk = popIn(t, L(15, 5.3)) * (1 - seg(t, L(15, 7.6), L(15, 8.0)));
    if (sk > .02) { boilSeed('isw'); paint(ellPts(1560, 820, 110 * sk, 110 * sk, 30), { wash: Z.epi, ink: PAL.ink, sw: 1.6 }); stomaTop(1560, 825, .42 * sk, .35, t, { key: 'is2', mood: ['happy', 'happy'] }); K.check(1690, 720, 80, seg(t, L(15, 6.1), L(15, 6.6)), 'isk'); }
    // the two scales: C3 loses a tall pile, C4 about half
    boilSeed('itab'); paint(rectPts(2200, 980, 1500, 400), { wash: mixCol(Z.sage, Z.bench, .5), ink: null }); inkLine([[2200, 982], [3700, 978]], 1.4, Z.benchDk, 'ink', 0);
    const pour = seg(t, L(15, 8.6), L(15, 10.4));
    [[2560, 15, 3, 'c3'], [3260, 7, 4, 'c4']].forEach(([x, n, nb, k]) => {
      const tl = tiltFor(n, pour);
      balance(x, 980, .95, tl, (px, py) => co2(px, py - 18, 1.1, 0, { key: 'isc' + k }), (px, py) => pile(px, py, n, 1.0, 'isp' + k, clamp(pour * 15 / n)), 'is' + k);
      chain(x, 640, nb, 1.3, { key: 'isb' + k, gold: nb - 1 });
    });
    camEnd();
    host(210, 910, 30, t, [[0, 'calm', { lookX: .6, lookY: -.6 }], [L(14, .6), 'wow', { lookX: .2, lookY: -.9 }], [L(14, 3.0), 'excited', { lookX: .2, lookY: -.8 }], [L(14, 5.8), 'calm', { lookX: .9, lookY: -.2 }], [L(14, 8.0), 'happy', { lookX: .9 }], [L(14, 10.0), 'idea', { lookX: .9 }],
      [L(15, .4), 'worried', { lookX: .5, lookY: -.6 }], [L(15, 3.0), 'happy', { lookX: .9, lookY: -.5 }], [L(15, 6.0), 'smug', { lookX: .9 }], [L(15, 10.4), 'excited', { lookX: .9 }]], {}, 'pi3');
    flash(1 - seg(t, I3(), I3() + .5));
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [Z.sandDk, Z.sand]);
  }

  // ================================ J: the desert; 落地生根 sour at dawn, not in the afternoon ================================
  function cactus(x, y, s, t, key) {                         // a saguaro: a ribbed column and two arms
    boilSeed('cac' + key);
    const sw = clamp(1.1 * s, .7, 1.4), g = Z.cactus;
    paint(ribbon([[x - 50 * s, y - 210 * s], [x - 140 * s, y - 215 * s], [x - 145 * s, y - 330 * s]], 58 * s, 54 * s), { wash: mixCol(g, Z.cactusDk, .15), ink: PAL.ink, sw });
    paint(ribbon([[x + 50 * s, y - 280 * s], [x + 125 * s, y - 285 * s], [x + 130 * s, y - 390 * s]], 54 * s, 50 * s), { wash: mixCol(g, Z.cactusDk, .15), ink: PAL.ink, sw });
    paint(rrPts(x - 56 * s, y - 470 * s, 112 * s, 470 * s, 56 * s, 1), { wash: g, ink: PAL.ink, sw });
    for (const dx of [-26, 0, 26]) inkLine([[x + dx * s, y - 430 * s], [x + dx * s * 1.1, y - 20 * s]], 1, Z.cactusDk, 'inkfine', .3);
    for (let i = 0; i < 10; i++) { const px = x + (hash(i + 5) - .5) * 100 * s, py = y - (40 + hash(i + 6) * 400) * s; inkLine([[px, py], [px + 8 * s, py - 6 * s]], .8, '#F3EBDC', 'inkfine', 0); }
  }
  function pineapple(x, y, s, t, key) {                      // a rosette of spiky leaves with the fruit on top
    boilSeed('pin' + key);
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .3, l = (150 + 30 * hash(i)) * s, f = 4 * wob(t, .3, i);
      paint(ribbon([[x, y], [x + Math.cos(a) * l * .5, y + Math.sin(a) * l * .5], [x + Math.cos(a) * l + f, y + Math.sin(a) * l * .9]], 18 * s, 1.5 * s), { wash: i % 2 ? '#6E9C5A' : '#7DAA62', ink: PAL.ink, sw: .7 }); }
    const fy = y - 170 * s;
    paint(ellPts(x, fy, 46 * s, 64 * s, 22), { wash: '#E3B04A', ink: PAL.ink, sw: 1 });
    for (let i = -2; i <= 2; i++) { inkLine([[x - 40 * s, fy + i * 22 * s - 20 * s], [x + 40 * s, fy + i * 22 * s + 20 * s]], .8, '#B07A2A', 'inkfine', 0); inkLine([[x - 40 * s, fy + i * 22 * s + 20 * s], [x + 40 * s, fy + i * 22 * s - 20 * s]], .8, '#B07A2A', 'inkfine', 0); }
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .35; paint(ribbon([[x, fy - 60 * s], [x + Math.cos(a) * 60 * s, fy - 60 * s + Math.sin(a) * 70 * s]], 12 * s, 1 * s), { wash: '#6E9C5A', ink: PAL.ink, sw: .6 }); }
  }
  // 落地生根 (Kalanchoe pinnata) in a pot: thick scalloped leaves, tiny plantlets in the notches
  const BRY_LEAVES = [[-1, 120, .9], [1, 150, -.7], [-1, 210, 1.1], [1, 240, -.9], [-1, 300, 1.25]];
  function bryophyllum(x, y, s, t, key, o = {}) {
    boilSeed('bry' + key);
    paint([[x - 70 * s, y - 90 * s], [x + 70 * s, y - 90 * s], [x + 52 * s, y], [x - 52 * s, y]], { wash: '#C9784F', ink: PAL.ink, sw: 1 });
    paint(rrPts(x - 78 * s, y - 108 * s, 156 * s, 24 * s, 6 * s), { wash: '#B5663F', ink: PAL.ink, sw: 1 });
    inkLine([[x, y - 100 * s], [x + 4 * s, y - 220 * s], [x, y - 330 * s]], 4 * s, '#7A8A4A', 'ink', .5);
    BRY_LEAVES.forEach(([sd, h, a0], i) => {
      if (o.skip === i) return;
      const bx = x + sd * 4 * s, by = y - h * s, a = a0 + .04 * wob(t, .3, i), lx = bx + Math.cos(-Math.PI / 2 + a) * 80 * s * -sd, ly = by - 30 * s;
      const P = []; for (let k = 0; k < 24; k++) { const b = k / 24 * TAU, sc = 1 + .08 * Math.max(0, Math.sin(b * 6)); P.push([lx + Math.cos(b) * 70 * s * sc * Math.cos(a) - Math.sin(b) * 34 * s * sc * Math.sin(a), ly + Math.cos(b) * 70 * s * sc * Math.sin(a) + Math.sin(b) * 34 * s * sc * Math.cos(a)]); }
      inkLine([[bx, by], [lx, ly]], 2.5 * s, '#7A8A4A', 'ink', 0);
      paint(P, { wash: o.sepia ? mixCol('#7FB06A', '#B89A6A', .4) : '#7FB06A', ink: PAL.ink, sw: .9, curv: .3 });
      for (let j = 0; j < 3; j++) { const b = j * 1.9 + .6, px = lx + Math.cos(b) * 72 * s * Math.cos(a) - Math.sin(b) * 36 * s * Math.sin(a), py = ly + Math.cos(b) * 72 * s * Math.sin(a) + Math.sin(b) * 36 * s * Math.cos(a);
        paint(ellPts(px - 4 * s, py - 6 * s, 5 * s, 3 * s, 8, 0, -.6), { wash: '#9CCB7A', ink: null }); paint(ellPts(px + 4 * s, py - 6 * s, 5 * s, 3 * s, 8, 0, .6), { wash: '#9CCB7A', ink: null }); }
    });
  }
  const J_POT = [900, 1000], J_PIP = [560, 995], J_U = 36;
  function shotJ(t, lt, dur) {
    const c = t < L(17, -1.5) ? [960, 540, 1.0] : pushTo(t, L(17, -1.5), L(17, -1.0), [960, 540, 1.0], [790, 830], 5);
    cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    const dawn = ease(seg(t, L(16, 4.6), L(16, 5.4))) * (1 - ease(seg(t, L(16, 11.0), L(16, 11.8))));
    const sky = mixCol(mixCol(Z.sky, Z.skyHot, .3), Z.dawn, dawn);
    ground(sky, mixCol(sky, PAL.cream, .4), t, 'j', { n: 3, h: 600 });
    const sp = t < L(16, 4.6) ? [1560, 170] : t < L(16, 11.0) ? [lerp(1560, 260, ease(seg(t, L(16, 4.6), L(16, 5.4)))), lerp(170, 420, ease(seg(t, L(16, 4.6), L(16, 5.4))))]
      : arcPt([260, 420], [1500, 190], 260, ease(seg(t, L(16, 11.0), L(16, 11.9))));
    sunIcon(sp[0], sp[1], 80, t, 1, 'j');
    boilSeed('dune'); paint([[-300, 800], [400, 740], [900, 790], [1500, 730], [2300, 780], [2300, 1500], [-300, 1500]], { wash: Z.sandDk, ink: null, curv: .5 });
    paint([[-300, 860], [600, 830], [1200, 850], [2300, 830], [2300, 1500], [-300, 1500]], { wash: Z.sand, ink: PAL.ink, sw: .9, curv: .5 });
    cactus(1420, 1000, 1.3, t, 'j1'); cactus(300, 820, .45, t, 'j2'); pineapple(1760, 1000, 1.05, t, 'j3');
    ring(1420, 700, 110, 340, seg(t, L(16, .1), L(16, .9)), Z.gold, 'jc', 5); ring(1760, 880, 120, 150, seg(t, L(16, .8), L(16, 1.5)), Z.gold, 'jp', 5);
    // a magnifier on the cactus skin: its stomata shut tight by day
    const mg = popIn(t, L(16, 1.9)) * (1 - seg(t, L(16, 4.3), L(16, 4.7)));
    if (mg > .02) { boilSeed('jmg'); inkLine([[1400, 640], [1180, 420]], 2, PAL.ink, 'ink', 0); paint(ellPts(1120, 330, 150 * mg, 150 * mg, 30), { wash: Z.cactus, ink: PAL.ink, sw: 2 });
      stomaTop(1120, 335, .55 * mg, 0, t, { key: 'jst', col: mixCol(Z.guard, Z.cactusDk, .3), mood: ['determined', 'determined'] }); }
    // two hundred years ago: a sepia hush; the pot of 落地生根 slides in
    const sep = ease(seg(t, L(16, 4.7), L(16, 5.3))) * (1 - ease(seg(t, L(16, 7.4), L(16, 8.2))));
    const potX = lerp(2300, J_POT[0], ease(seg(t, L(16, 5.4), L(16, 6.6))));
    const picked = t > L(16, 8.1);
    bryophyllum(potX, J_POT[1], 1.15, t, 'jb', { skip: picked ? 0 : -1 });
    ring(potX, J_POT[1] - 200, 190, 260, seg(t, L(16, 7.3), L(16, 8.1)), Z.gold, 'jbr', 5);
    if (sep > .02) { boilSeed('sep'); paint(rectPts(-400, -400, 2720, 1880), { wash: '#B8986C', washOp: 95 * sep, ink: null }); }
    // Pip reaches, picks a leaf, tastes it: sour at dawn; nothing in the afternoon
    const reach = t > L(16, 7.4) && t < L(16, 8.3), hold = t >= L(16, 8.3) && t < L(16, 13.6);
    const bite1 = L(16, 9.2), bite2 = L(16, 12.2), shake = t > bite1 && t < bite1 + 1.0 ? .09 * Math.sin((t - bite1) * 40) * (1 - (t - bite1)) : 0;
    const o = K.act(t, [[0, 'worried', { lookX: .8, lookY: -.3 }], [L(16, 1.9), 'worried', { lookX: .9, lookY: -.6 }], [L(16, 5.4), 'calm', { lookX: .9 }], [L(16, 7.4), 'happy', { lookX: .9, lookY: .2 }],
      [bite1 + .1, 'strain'], [L(16, 10.8), 'worried', { lookX: .4 }], [bite2 + .1, 'calm', { lookX: .3 }], [L(16, 12.9), 'confused', { lookX: .5, lookY: -.3 }]]);
    const arm = reach ? { armF: [.35, 3.4] } : hold ? { armF: { at: [1.05, -2.25] } } : {};
    pip(J_PIP[0], J_PIP[1], J_U, { ...o, ...arm, rot: (o.rot || 0) + shake, key: 'pj' });
    if (hold) { const hp = K.hand(J_PIP[0], J_PIP[1], J_U, [1.05, -2.25]), bitten = t > bite1 ? (t > bite2 ? .55 : .75) : 1;
      boilSeed('jleaf'); paint(ellPts(hp[0] + 22 * bitten, hp[1] - 6, 30 * bitten, 15, 16, 0, -.3), { wash: '#7FB06A', ink: PAL.ink, sw: .8 }); }
    if (t > bite1 && t < bite1 + 1.6) { const k = seg(t, bite1, bite1 + 1.6); boilSeed('sour' + Math.floor(k * 6));
      for (let i = 0; i < 4; i++) { const a = -2.6 + i * .55, r0 = 160 + 20 * k, P = []; for (let j = 0; j < 5; j++) P.push([J_PIP[0] + Math.cos(a) * (r0 + j * 14), J_PIP[1] - 120 + Math.sin(a) * (r0 + j * 14) + (j % 2 ? 7 : -7)]); inkLine(P, 2.4, '#B9C23A', 'ink', 0); } }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [Z.sandDk, Z.sand]);
    flash(seg(t, L(17, -1.4), L(17, -1.0)));
  }

  // ================================ K: one CAM cell, night then day; the dial; three scales ================================
  const KC = [1080, 500], KV = [1120, 450], KPE = [650, 640], KRU = [1470, 700], KST = [335, 540];
  function camCell(t, key, o) {                              // o: night 0..1, open 0..1, acid 0..1, mood
    const skyC = mixCol(mixCol(Z.dawn, '#F8E2A0', o.day || 0), Z.night, o.night);
    ground(mixCol(Z.sage, '#B9C4D8', o.night * .5), mixCol(Z.sageBlob, '#C9D2E2', o.night * .5), t, 'kc' + key, { n: 4 });
    boilSeed('ksky' + key); paint(rectPts(-400, -400, 700, 1900), { wash: skyC, ink: null });
    if (o.night > .3) { seamGuard(STAR); const sk = clamp((o.night - .3) / .5);
      for (let i = 0; i < 9; i++) { boilSeed('kst' + i); const x = 40 + hash(i + 300) * 220, y = 60 + hash(i + 301) * 900; paint(starPts(x, y, (6 + 5 * hash(i + 2) + 2 * pulse(t + i * .3)) * sk, .4, 4), { wash: STAR, ink: null }); }
      moonIcon(150, 180, 60, clamp((o.night - .4) / .4), 'k'); }
    if (o.day > .1) sunIcon(150, 200, 64, t, clamp(o.day), 'k');
    // epidermis (a column of flat cells) with the stoma; guard cells part to open it
    for (let i = 0; i < 9; i++) { const y0 = -120 + i * 150; if (y0 > KST[1] - 200 && y0 < KST[1] + 60) continue; boilSeed('kep' + i + key); paint(rrPts(298, y0, 74, 146, 18, 1), { wash: Z.epi, ink: Z.epiDk, sw: 1 }); }
    const gap = lerp(6, 46, clamp(o.open));
    for (const sd of [-1, 1]) { boilSeed('kgc' + sd + key); paint(ellPts(KST[0], KST[1] + sd * (gap / 2 + 52), 44, 54, 18), { wash: Z.guard, ink: PAL.ink, sw: 1.3 });
      paint(ellPts(KST[0] + 6, KST[1] + sd * (gap / 2 + 52), 6, 4, 6), { wash: Z.chlDk, ink: null }); }
    // the cell: chloroplasts round a huge vacuole that fills with malic acid at night
    boilSeed('kcell' + key); const P = []; for (let k = 0; k < 44; k++) { const a = k / 44 * TAU; P.push([KC[0] + Math.cos(a) * 640 * (1 + .02 * Math.sin(a * 3 + t * .7)), KC[1] + Math.sin(a) * 410 * (1 + .02 * Math.cos(a * 2 + t * .6))]); }
    paint(P, { wash: Z.meso, ink: PAL.ink, sw: 1.8, curv: .3 });
    for (let j = 0; j < 12; j++) { const a = j / 12 * TAU + .25; boilSeed('kch' + j + key); paint(ellPts(KC[0] + Math.cos(a) * 565, KC[1] + Math.sin(a) * 350, 30, 16, 10, 0, a + 1.57), { wash: Z.chl, ink: Z.chlDk, sw: .7 }); }
    boilSeed('kvac' + key); paint(ellPts(KV[0], KV[1], 380, 225, 40, 1.5), { wash: mixCol(Z.vac, Z.malate, clamp(o.acid) * .85), ink: mixCol(Z.vacDk, Z.malateDk, clamp(o.acid)), sw: 1.2, curv: .3 });
    K.face(KC[0] - 40, KC[1] - 330, 44, t, { mood: o.mood, blush: false, seed: 4 });
  }
  const KST2 = () => L(19, -.4);
  function shotK(t, lt, dur) {
    if (t < KST2()) {
      const c = kf(t, [[L(17, -1.0), [960, 540, 1.0]], [L(17, 3.0), [900, 560, 1.08]], [L(17, 11.8), [960, 530, 1.0]], [L(18, 2.0), [980, 540, 1.0]], [L(18, 5.0), [1080, 580, 1.08]]], ease);
      cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      const night = ease(seg(t, L(17, -.6), L(17, .8))) * (1 - ease(seg(t, L(18, 0), L(18, 1.0)))), day = ease(seg(t, L(18, .3), L(18, 1.2)));
      const open = ease(seg(t, L(17, .9), L(17, 2.4))) * (1 - ease(seg(t, L(18, 1.3), L(18, 1.9))));
      const stored = clamp(seg(t, L(17, 12.4), L(18, -.4))), drain = ease(seg(t, L(18, 10.4), L(18, 11.8))), acid = stored * (1 - drain);
      camCell(t, 'k', { night, day, open, acid, mood: night > .5 ? (acid > .3 ? 'wow' : 'sleepy') : acid > .5 ? 'calm' : 'happy' });
      // one drop only leaves, in the cool of the night
      const dk = seg(t, L(17, 3.2), L(17, 5.0)); if (dk > 0 && dk < 1) drop(lerp(KST[0] + 40, 120, ease(dk)), KST[1] - 10 * dk, .9, { key: 'kdrop' });
      const sn = [L(17, 6.8), L(17, 8.2), L(17, 9.6)];
      const pcl = pepc(KPE[0], KPE[1], 1.15, t, { key: 'kpep', open: .55, sq: .16 * sn.reduce((a, e) => a + spring(t, e, 9, 26), 0) });
      // night: CO₂ in through the pore, onto PEP → four-carbon → malate (lime) → into the vacuole
      const MAL = [[980, 370], [1130, 320], [1280, 390], [1020, 500], [1200, 540], [1330, 460]];
      sn.forEach((ts, i) => {
        const ci = seg(t, ts - 1.4, ts); if (ci > 0 && ci < 1) { const p = ci < .45 ? [lerp(60, KST[0], ci / .45), KST[1] + (i - 1) * 6] : arcPt([KST[0], KST[1]], [pcl[0] + 40, pcl[1] - 10], 60, ease((ci - .45) / .55)); co2(p[0], p[1], 1.3, t + i, { key: 'kco' + i }); }
        if (t < ts) return;
        const born = [pcl[0] + 30 + i * 40, pcl[1] - 170 - i * 34], m = ease(seg(t, L(17, 10.7) + i * .15, L(17, 11.3) + i * .15)), go = ease(seg(t, L(17, 12.4) + i * .4, L(17, 13.6) + i * .4));
        const out = ease(seg(t, L(18, 3.3) + i * .3, L(18, 4.8) + i * .3)), rel = seg(t, L(18, 5.9) + i * .35, L(18, 6.3) + i * .35);
        if (rel >= 1) return;
        const inV = [lerp(born[0], MAL[i][0], go), lerp(born[1], MAL[i][1], go)], nearR = [KRU[0] - 200 + i * 60, KRU[1] - 190 + (i % 2) * 40];
        const p = out > 0 ? [lerp(MAL[i][0], nearR[0], out), lerp(MAL[i][1], nearR[1], out)] : inV;
        chain(p[0], p[1], 4, .95, { k: seg(t, ts, ts + .35), key: 'km' + i, gold: m > .5 ? null : 3, col: mixCol(Z.carb, '#8FA03A', m) });
      });
      for (let i = 3; i < 6; i++) { const k = seg(t, L(17, 13.2) + (i - 3) * .5, L(17, 13.6) + (i - 3) * .5) * (1 - drain); if (k > .02) chain(MAL[i][0], MAL[i][1], 4, .95, { k, key: 'km' + i, col: '#8FA03A' }); }
      // day: the stoma shut, malate leaves the vacuole and gives up CO₂ to Rubisco; the cycle turns in the light
      const rcl = rubisco(KRU[0], KRU[1], 1.0, t, { key: 'krub', open: .5, sq: .14 * (spring(t, L(18, 6.6), 7, 22) + spring(t, L(18, 7.3), 7, 22) + spring(t, L(18, 8.0), 7, 22)) });
      sn.forEach((ts, i) => { const r0 = L(18, 5.9) + i * .35, r = seg(t, r0, r0 + .7); if (r <= 0 || r >= 1) return; const nearR = [KRU[0] - 200 + i * 60, KRU[1] - 190 + (i % 2) * 40];
        K.burst(nearR[0], nearR[1], 50, seg(t, r0, r0 + .4), Z.gold, 'kb' + i); co2(lerp(nearR[0], rcl[0], ease(r)), lerp(nearR[1], rcl[1], ease(r)), 1.0 * (1 - .5 * r), t, { key: 'kcr' + i }); });
      if (t > L(18, 7.0)) { const sun = clamp(day); boilSeed('kbeam'); paint([[300, 300], [300, 520], [KRU[0] + 60, KRU[1] + 120], [KRU[0] + 120, KRU[1] - 120]], { wash: '#FFF3C4', washOp: 70 * sun * seg(t, L(18, 7.0), L(18, 7.6)), ink: null });
        const wk = seg(t, L(18, 7.5), L(18, 8.3)), spin = (t - L(18, 7.5)) * .8, cc = [KRU[0], KRU[1] + 10];
        arcArrow(cc[0], cc[1], 150, -1.3 + spin, -.1 + spin, wk, mixCol(Z.rub, PAL.cream, .1), 'kw1', 12); arcArrow(cc[0], cc[1], 150, .8 + spin, 2.0 + spin, wk, mixCol(Z.rub, PAL.cream, .1), 'kw2', 12); arcArrow(cc[0], cc[1], 150, 2.9 + spin, 4.1 + spin, wk, mixCol(Z.rub, PAL.cream, .1), 'kw3', 12);
        sugar(KRU[0] + 210, KRU[1] - 90, 1.1, { k: seg(t, L(18, 8.6), L(18, 9.0)), key: 'ks1' }); sugar(KRU[0] + 250, KRU[1] + 10, 1.1, { k: seg(t, L(18, 9.4), L(18, 9.8)), key: 'ks2' }); }
      camEnd();
      host(1800, 975, 26, t, [[0, 'sleepy'], [L(17, 1.0), 'wow', { lookX: -.9, lookY: -.3 }], [L(17, 5.8), 'calm', { lookX: -.9, lookY: -.2 }], [L(17, 10.8), 'wow', { lookX: -.6, lookY: -.6 }], [L(17, 12.8), 'strain'],
        [L(18, 0), 'calm', { lookX: -.9, lookY: -.4 }], [L(18, 1.4), 'wow', { lookX: -.9 }], [L(18, 6.0), 'happy', { lookX: -.6, lookY: -.4 }], [L(18, 10.9), 'idea'], [L(18, 12.4), 'laugh']], { flip: true }, 'pk');
      flash(1 - seg(t, L(17, -1.0), L(17, -.5)));
      flash(seg(t, KST2() - .4, KST2()));
      return;
    }
    // the dial: night grabs, day uses; the slow cactus and the snail; three scales
    const c = kf(t, [[KST2(), [960, 540, 1.0]], [L(19, 9.4), [960, 540, 1.0]], [L(19, 10.4), [3160, 600, 1.0]]], ease);
    cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    ground(Z.recap, Z.recapBlob, t, 'k2', { n: 6, w: 3600, rect: rectPts(-1400, -1400, 7000, 3900) });
    const D0 = [640, 480], R = 270;
    boilSeed('dial');
    const half = (a0, col) => { const P = [D0.slice()]; for (let i = 0; i <= 20; i++) { const a = a0 + i / 20 * Math.PI; P.push([D0[0] + Math.cos(a) * R, D0[1] + Math.sin(a) * R]); } return P; };
    seamGuard(Z.night); boilSeed('dial'); paint(half(Math.PI / 2, Z.night), { wash: Z.night, ink: null }); seamGuard('#F6D27A'); boilSeed('dial2'); paint(half(-Math.PI / 2, '#F6D27A'), { wash: '#F6D27A', ink: null });
    const DR = ellPts(D0[0], D0[1], R, R, 40); inkLine(DR.concat([DR[0], DR[1]]), 2.4, PAL.ink, 'ink', .4);
    moonIcon(D0[0] - 150, D0[1] - 130, 46, 1, 'kd'); seamGuard(STAR); for (let i = 0; i < 4; i++) { boilSeed('kds' + i); paint(starPts(D0[0] - 220 + i * 50, D0[1] + 60 + (i % 2) * 70, 9, .4, 4), { wash: STAR, ink: null }); }
    sunIcon(D0[0] + 150, D0[1] - 130, 46, t, 1, 'kd');
    ring(D0[0] - 135, D0[1], 150, 250, seg(t, L(19, 2.5), L(19, 3.3)), Z.gold, 'kn', 6); ring(D0[0] + 135, D0[1], 150, 250, seg(t, L(19, 3.4), L(19, 4.2)), Z.gold, 'kdy', 6);
    if (t > L(19, 2.4)) { co2(D0[0] - 200, D0[1] + 10, 1.0 * popIn(t, L(19, 2.4)), 0, { key: 'kdc' }); chain(D0[0] - 120, D0[1] + 170, 4, .8, { k: seg(t, L(19, 2.8), L(19, 3.2)), key: 'kdm', col: '#8FA03A' }); }
    if (t > L(19, 3.4)) { const wk = seg(t, L(19, 3.4), L(19, 4.0)), cc = [D0[0] + 130, D0[1] + 110], sp = (t - L(19, 3.4)) * .8;
      arcArrow(cc[0], cc[1], 62, -1.3 + sp, -.1 + sp, wk, mixCol(Z.rub, PAL.cream, .1), 'kdw1', 9); arcArrow(cc[0], cc[1], 62, .8 + sp, 2.0 + sp, wk, mixCol(Z.rub, PAL.cream, .1), 'kdw2', 9); arcArrow(cc[0], cc[1], 62, 2.9 + sp, 4.1 + sp, wk, mixCol(Z.rub, PAL.cream, .1), 'kdw3', 9);
      sugar(cc[0], cc[1], .9, { k: seg(t, L(19, 3.9), L(19, 4.3)), key: 'kds' }); }
    const hand = Math.PI / 2 + (t < L(19, 5.0) ? 0 : (t - L(19, 5.0)) * 1.1);
    boilSeed('khand'); inkLine([D0, [D0[0] + Math.cos(hand) * R * .82, D0[1] + Math.sin(hand) * R * .82]], 5, Z.red, 'ink', 0); paint(ellPts(D0[0], D0[1], 12, 12, 10), { wash: PAL.ink, ink: null });
    // a stonecrop rosette (景天), the family that gave CAM its name
    if (t > L(19, .5)) { const q = popIn(t, L(19, .5)); boilSeed('sedum'); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + (i % 2) * .3, r = (i % 2 ? 46 : 70) * q; paint(ellPts(1360 + Math.cos(a) * r, 250 + Math.sin(a) * r * .8, 34 * q, 20 * q, 12, 0, a), { wash: i % 2 ? '#8CC07A' : '#7AAE6A', ink: PAL.ink, sw: .8 }); }
      paint(ellPts(1360, 250, 26 * q, 22 * q, 12), { wash: '#A9D48E', ink: PAL.ink, sw: .8 }); }
    // it grows slowly: a little cactus barely stretches while a snail passes it
    const gk = seg(t, L(19, 7.6), L(19, 10.0));
    cactus(1380, 860, .42 * (1 + .06 * gk), t, 'kslow');
    if (gk > 0 && gk < 1) { const sx = lerp(1150, 1700, gk); boilSeed('snail'); paint(ellPts(sx, 852, 30, 9, 12), { wash: '#C9A87A', ink: PAL.ink, sw: .8 }); paint(ellPts(sx - 4, 830, 20, 20, 14), { wash: '#B5835A', ink: PAL.ink, sw: .9 });
      inkLine([[sx + 22, 846], [sx + 30, 826]], 1, PAL.ink, 'inkfine', 0); inkLine([[sx + 26, 846], [sx + 38, 830]], 1, PAL.ink, 'inkfine', 0); }
    // three scales: C3 tall pile, C4 half, CAM a sliver
    boilSeed('ktab'); paint(rectPts(2300, 980, 1700, 500), { wash: mixCol(Z.recap, Z.bench, .5), ink: null }); inkLine([[2300, 982], [4000, 978]], 1.4, Z.benchDk, 'ink', 0);
    const pour = seg(t, L(19, 10.3), L(19, 12.2));
    [[2700, 15, 'c3'], [3220, 7, 'c4'], [3740, 2, 'cam']].forEach(([x, n, k]) => {
      balance(x, 980, .8, tiltFor(n, pour), (px, py) => co2(px, py - 18, 1.05, 0, { key: 'ksc' + k }), (px, py) => pile(px, py, n, .95, 'ksp' + k, clamp(pour * 15 / n)), 'ks' + k);
      if (k === 'cam') { moonIcon(x - 40, 640, 30, 1, 'ksm'); sunIcon(x + 40, 640, 26, t, 1, 'kss'); } else chain(x, 640, k === 'c3' ? 3 : 4, 1.3, { key: 'ksb' + k, gold: k === 'c3' ? 2 : 3 });
    });
    camEnd();
    host(210, 910, 30, t, [[0, 'calm', { lookX: .9, lookY: -.4 }], [L(19, 2.6), 'sleepy'], [L(19, 3.5), 'happy', { lookX: .9 }], [L(19, 5.2), 'idea', { lookX: .9, lookY: -.4 }], [L(19, 7.8), 'calm', { lookX: .9 }], [L(19, 9.0), 'laugh'], [L(19, 12.0), 'wow', { lookX: .9 }]], {}, 'pk2');
    flash(1 - seg(t, KST2(), KST2() + .5));
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E6D8B8', Z.recap]);
  }

  // ================================ M: recap two: three plants, one cycle, split in space or in time ================================
  function wheelIcon(x, y, s, t, k, key, lit = 0) {
    if (k <= .02) return; const q = backOut(clamp(k)) * s, sp = t * .7, col = mixCol(Z.rub, PAL.cream, .1);
    boilSeed('wi' + key); const P = ellPts(x, y, 70 * q, 70 * q, 30); if (lit > 0) paint(ellPts(x, y, 88 * q, 88 * q, 30), { wash: '#FFF3C4', washOp: 200 * lit, ink: null });
    arcArrow(x, y, 70 * q, -1.3 + sp, -.1 + sp, 1, col, key + 'a', 10 * q); arcArrow(x, y, 70 * q, .8 + sp, 2.0 + sp, 1, col, key + 'b', 10 * q); arcArrow(x, y, 70 * q, 2.9 + sp, 4.1 + sp, 1, col, key + 'c', 10 * q);
    rubisco(x, y - 70 * q, .38 * q, t, { key: key + 'r', open: .5 });
  }
  function shotM(t, lt, dur) {
    cam(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    ground(Z.recap, Z.recapBlob, t, 'm', { n: 4 });
    const X = [560, 1060, 1560];
    cropRice(X[0] - 30, 400, .95, t, seg(t, L(20, 1.3), L(20, 1.7)), 'm');
    if (t > L(20, 1.6)) { push(); translate(X[1], 410); scale(.55 * popIn(t, L(20, 1.6))); cornPlant(0, 0, 1, t, 'm'); pop(); }
    if (t > L(20, 1.9)) cactus(X[2], 400, .62 * popIn(t, L(20, 1.9)), t, 'm');
    X.forEach((x, i) => { wheelIcon(x, 620, 1, t, seg(t, L(20, 2.8), L(20, 3.2)), 'mw' + i, pulseK(t, L(20, 3.2), 1.2)); sugar(x + 110, 650, .9, { k: seg(t, L(20, 4.1), L(20, 4.5)), key: 'ms' + i }); });
    // C4: the two rings, outer → inner
    const c4 = popIn(t, L(20, 5.5));
    if (c4 > .02) { boilSeed('mc4'); const P1 = ellPts(X[1], 880, 90 * c4, 72 * c4, 30); inkLine(P1.concat([P1[0], P1[1]]), 10 * c4, Z.pepc, 'ink', .4); const P2 = ellPts(X[1], 880, 46 * c4, 37 * c4, 24); paint(P2, { wash: Z.rub, ink: PAL.ink, sw: 1 });
      arrow(X[1] - 170, 880, X[1] - 60, 880, seg(t, L(20, 6.0), L(20, 6.5)), Z.pepc, 'mc4a', 12); ring(X[1], 880, 110, 90, seg(t, L(20, 6.4), L(20, 7.4)), Z.gold, 'mc4r', 5); }
    // CAM: moon → sun
    if (t > L(20, 8.6)) { moonIcon(X[2] - 90, 880, 46, popIn(t, L(20, 8.6)), 'mm'); arrow(X[2] - 30, 880, X[2] + 40, 880, seg(t, L(20, 9.0), L(20, 9.4)), Z.honey, 'mca', 11); sunIcon(X[2] + 100, 880, 38, t, popIn(t, L(20, 9.3)), 'mm');
      ring(X[2], 880, 170, 90, seg(t, L(20, 9.6), L(20, 10.6)), Z.gold, 'mcr', 5); }
    camEnd();
    host(210, 910, 30, t, [[0, 'calm', { lookX: .9, lookY: -.4 }], [L(20, 3.0), 'happy', { lookX: .9, lookY: -.2 }], [L(20, 6.2), 'idea', { lookX: .9 }], [L(20, 9.5), 'smug'], [L(21, -2.0), 'happy']], {}, 'pm');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E6D8B8', Z.recap]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#9CC0DA', Z.skyB]);
  }

  // ================================ N: the world's share, and C4 rice ================================
  const GOLD3 = [12, 47, 83];
  function shotN(t, lt, dur) {
    cam(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    ground(Z.skyB, Z.skyBBlob, t, 'n', { n: 4 });
    const fold = ease(seg(t, L(21, 3.9), L(21, 4.9))), D = [760, 500];
    for (let i = 0; i < 100; i++) {
      const gx = 470 + (i % 10) * 64, gy = 230 + Math.floor(i / 10) * 58, g = GOLD3.includes(i) ? ease(seg(t, L(21, 1.9) + GOLD3.indexOf(i) * .3, L(21, 2.4) + GOLD3.indexOf(i) * .3)) : 0;
      const a = i * 2.39996, r = 240 * Math.sqrt((i + .5) / 100), x = lerp(gx, D[0] + Math.cos(a) * r, fold), y = lerp(gy, D[1] + Math.sin(a) * r, fold);
      const k = seg(t, L(21, -.4) + (i % 10) * .03 + Math.floor(i / 10) * .03, L(21, 0) + (i % 10) * .03 + Math.floor(i / 10) * .03) * (1 - fold), s = (1 + .7 * g) * backOut(k);
      if (s <= .02) continue; boilSeed('sprout' + i);
      inkLine([[x, y + 14 * s], [x, y - 4 * s]], 1.4, '#6E8E3E', 'inkfine', 0);
      const col = mixCol('#86B45A', Z.gold, g); paint(ellPts(x - 7 * s, y - 8 * s, 8 * s, 4.5 * s, 8, 0, -.5), { wash: col, ink: g > .5 ? PAL.ink : null, sw: .6 }); paint(ellPts(x + 7 * s, y - 9 * s, 8 * s, 4.5 * s, 8, 0, .5), { wash: col, ink: g > .5 ? PAL.ink : null, sw: .6 });
    }
    if (fold > 0) { const q = fold; boilSeed('ndisc'); paint(ellPts(D[0], D[1], 270 * q, 270 * q, 40), { wash: '#A9CF86', ink: PAL.ink, sw: 1.6 });
      const wk = ease(seg(t, L(21, 5.0), L(21, 6.6))), P = [D.slice()]; for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * .23 * TAU * wk; P.push([D[0] + Math.cos(a) * 270 * q, D[1] + Math.sin(a) * 270 * q]); }
      if (wk > .02) paint(P, { wash: Z.gold, ink: PAL.ink, sw: 1.2 });
      for (let i = 0; i < 3; i++) { const k = seg(t, L(21, 5.4) + i * .5, L(21, 6.2) + i * .5); if (k > 0 && k < 1) K.sparkle(D[0] + 70 + i * 40, D[1] - 200 + i * 50, 36, k, '#FFF3C4'); }
      sunIcon(D[0] + 270, D[1] - 260, 44, t, seg(t, L(21, 4.6), L(21, 5.0)), 'n'); }
    // a rice plant, and the pump flying into its leaf
    cropRice(1460, 900, 1.5, t, seg(t, L(21, 7.7), L(21, 8.1)), 'n');
    chain(1660, 520, 3, 1.0, { k: seg(t, L(21, 8.0), L(21, 8.4)), key: 'nrb', gold: 0 });
    const fly = seg(t, L(21, 9.5), L(21, 10.7)), hand = K.hand(210, 910, 30, [2.6, -3.2]);
    if (fly > 0) { const p = fly < 1 ? arcPt([hand[0] + 30, hand[1] - 30], [1440, 700], 260, ease(fly)) : [1440, 700], q = fly < 1 ? .5 + .2 * fly : .7 * (1 - .3 * seg(t, L(21, 10.7), L(21, 11.2)));
      boilSeed('npump'); const P1 = ellPts(p[0], p[1], 70 * q, 60 * q, 26); inkLine(P1.concat([P1[0], P1[1]]), 12 * q, Z.pepc, 'ink', .4); paint(ellPts(p[0], p[1], 36 * q, 30 * q, 20), { wash: Z.rub, ink: PAL.ink, sw: 1 }); }
    if (fly >= 1) for (let i = 0; i < 3; i++) K.sparkle(1440 + (i - 1) * 60, 660 - (i % 2) * 50, 40, seg(t, L(21, 10.8) + i * .2, L(21, 11.5) + i * .2), '#FFF3C4');
    camEnd();
    const thr = t > L(21, 9.0) && t < L(21, 9.7) ? { armF: [2.6, 3.0] } : {};
    host(210, 910, 30, t, [[0, 'calm', { lookX: .9, lookY: -.4 }], [L(21, 2.0), 'wow', { lookX: .9, lookY: -.5 }], [L(21, 5.2), 'excited', { lookX: .9, lookY: -.4 }], [L(21, 7.9), 'calm', { lookX: .9 }], [L(21, 9.1), 'strain', { lookX: .9 }], [L(21, 10.8), 'excited', { lookX: .9 }]], thr, 'pn');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#9CC0DA', Z.skyB]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [Z.meadowDk, Z.meadow]);
  }

  // ================================ O: the meadow again: corn in the sun, a cactus under the moon, the scale levels ================================
  const O_PIP = [720, 950], O_BAL = [1210, 955];
  function shotO(t, lt, dur) {
    cam(960 + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.02);
    meadow(t, 'o', { sun: [300, 170], heat: false });
    // the night comes in from the right over the cactus
    const sx = lerp(2500, 1240, ease(seg(t, L(22, 4.3), L(22, 5.5))));
    if (sx < 2400) { seamGuard(Z.night); boilSeed('onight'); paint([[sx, -300], [sx + 25, 100], [sx - 15, 420], [sx + 20, 800], [2600, 800], [2600, -300]], { wash: Z.night, ink: null, curv: .4 });
      boilSeed('onightg'); paint([[sx + 20, 790], [2600, 790], [2600, 1500], [sx + 20, 1500]], { wash: Z.night, washOp: 120, ink: null });
      seamGuard(STAR); for (let i = 0; i < 10; i++) { const x = sx + 80 + hash(i + 400) * 700, y = 60 + hash(i + 401) * 520; if (x > 2000) continue; boilSeed('ost' + i); paint(starPts(x, y, 7 + 4 * hash(i) + 2 * pulse(t + i * .2), .4, 4), { wash: STAR, ink: null }); }
      moonIcon(1640, 200, 64, seg(t, L(22, 5.0), L(22, 5.5)), 'o'); }
    cornPlant(180, 1010, .95, t, 'o1'); cornPlant(370, 1020, .75, t, 'o2');
    cactus(1700, 1010, .95, t, 'o3');
    ring(260, 600, 220, 420, seg(t, L(22, .4), L(22, 1.4)), Z.gold, 'oc', 5);
    // the scale settles level
    const lv = ease(seg(t, L(22, 5.8), L(22, 8.4))), tl = lerp(.22, 0, lv) + .05 * spring(t, L(22, 8.4), 3, 6);
    balance(O_BAL[0], O_BAL[1], 1.0, tl, (px, py) => co2(px, py - 20, 1.2, 0, { key: 'opco' }), (px, py) => pile(px, py, 5, 1.0, 'opp', 1), 'o');
    if (lv >= 1) K.sparkle(O_BAL[0], O_BAL[1] - 300, 50, seg(t, L(22, 8.5), L(22, 9.3)), '#FFF3C4');
    const o = K.act(t, [[0, 'calm', { lookX: -.6, lookY: -.3 }], [L(22, .4), 'happy', { lookX: -.9, lookY: -.5 }], [L(22, 4.6), 'wow', { lookX: .9, lookY: -.5 }], [L(22, 6.0), 'calm', { lookX: .8, lookY: -.2 }],
      [L(22, 9.6), 'love'], [L(22, 11.4), 'wave']]);
    pip(O_PIP[0], O_PIP[1], 36, { ...o, key: 'po' });
    const at = toScreen(O_PIP[0], O_PIP[1] - 3 * 36);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [Z.meadowDk, Z.meadow]);
    const close = seg(t, DUR - 1.7, DUR - .4);
    if (close > 0) iris(at[0], at[1], close >= 1 ? 0 : kf(close, [[0, 1900], [.55, 260], [.75, 230], [1, 0]], easeOut));
  }


  // ================================ the cover ================================
  LOOPS.cover = t => {
    meadow(t, 'cv', { sun: [1760, 150] });
    cornPlant(1840, 1030, .8, t, 'cv');
    balance(1430, 950, 1.15, .3, (px, py) => co2(px, py - 22, 1.4, 0, { key: 'cvco' }), (px, py) => pile(px, py, 15, 1.1, 'cvp', 1), 'cv');
    for (let i = 0; i < 7; i++) drop(1060 + i * 34, 520 - (i % 3) * 40 - i * 18, .6, { key: 'cvd' + i, col: mixCol(Z.water, PAL.cream, .3) });
    pip(1060, 960, 44, { ...pipFeel('worried', .3), lookX: .8, lookY: -.3, emote: 'sweat', emoteK: 1, key: 'cvpip' });
    const F = (wgt, px) => `${wgt} ${px}px "Noto Sans CJK SC", "WenQuanYi Zen Hei", "PingFang SC", sans-serif`;
    boilSeed('cvtag'); paint(rrPts(80, 92, 540, 92, 30, 2), { wash: '#7FAE4E', ink: PAL.ink, sw: 1.2 });
    letter('高中生物 · 光合作用', 350, 140, 50, PAL.cream, { font: F(800, 50), screen: true });
    letter('吃饭还是喝水？', 92, 330, 132, '#3B2F45', { font: F(900, 132), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    letter('植物每吸进1个CO₂', 96, 480, 62, '#3B2F45', { font: F(800, 62), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    letter('要丢掉几百个水分子', 96, 565, 62, '#3B2F45', { font: F(800, 62), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    boilSeed('cvblob'); paint(ellPts(440, 750, 390, 104, 30, 6, -.04), { wash: '#FBE2A6', ink: null });
    letter('C3 · C4 · CAM', 96, 750, 104, Z.gold, { font: F(900, 104), align: 'left', stroke: '#3B2F45', screen: true, rot: -.03 });
  };
  LOOPS.cover.len = 1;

  shots([[0, shotA], [L(2, -1.2), shotB], [L(3, -1.0), shotC], [L(4, -1.0), shotD], [L(5, -.9), shotE], [L(8, -1.2), shotF], [L(10, -.7), shotG], [L(11, -1.0), shotH], [L(11, 3.4), shotI], [L(16, -1.2), shotJ], [L(17, -1.0), shotK], [L(20, -1.2), shotM], [L(21, -1.0), shotN], [L(22, -1.0), shotO]]);
})();

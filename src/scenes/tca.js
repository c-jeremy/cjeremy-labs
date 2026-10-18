// tca.js: "Pip讲三羧酸循环", 267.5 s. Where the carbon in your breath comes from: glucose → two pyruvates (cytoplasm) →
// acetyl-CoA (matrix) → once round the citric-acid cycle (citrate, isocitrate, α-ketoglutarate, succinyl-CoA,
// succinate, fumarate, malate, oxaloacetate: 2 CO₂, 3 NADH, 1 FADH₂, 1 GTP → ATP), the tally, which carbons leave,
// where the energy goes (the inner membrane, O₂ → H₂O), why the cycle stops without oxygen, Krebs 1937, the hub, and
// back to the breakfast table. See STORYBOARD_TCA.md. Props from mrna_kit.js (MK).
// Every time is tied to a voice line: L(i, d) = line i's start + d seconds, so a retimed line moves its pictures.
// Carbon colour code (all film): gold = carbons from food (glucose → acetyl), teal = the cycle's own (oxaloacetate).
(() => {
  const K = MK;
  const Z = {
    home: '#F6D9B6', homeBlob: '#FBEAD2', homeGold: '#F7D9A4', homeGoldBlob: '#FCEBC6', table: '#DFA066', tableDk: '#B8743F',
    plate: '#FBF3E6', plateDk: '#E3D2BA', bun: '#FBF1E1', bunDk: '#E6CFAF', filling: '#C98B6B', win: '#FFF4D8', winDk: '#F2D7A2', frame: '#C98F5A',
    cyto: '#F6DCC8', cytoDk: '#ECC3A8',
    matrix: '#D3EADF', matrixBlob: '#E9F5EF', matrixDk: '#AFD3C1',
    outer: '#EBA88E', outerDk: '#C9806A', inner: '#F2C3AA', innerDk: '#D99A7E',
    gold: '#EFAE36', goldDk: '#B97E1B', gold2: '#FFD15A', teal: '#3E9C95', tealDk: '#2A6E69', O: '#E0675B', H: '#FFF5E2',
    nad: '#BCD3EF', nadh: '#4F7FC8', fad: '#F4E4A8', fadh: '#E09A35',
    coa: '#86CDB0', coaDk: '#5AA287', S: '#EBC94A',
    P: '#EE8C78', baseG: '#6E9F58', baseA: '#E8AA38', ribose: '#FBEBD0',
    ring: '#F4FAF6', ringDk: '#8FC1AB',
    pads: ['#F4C9A0', '#F7E37C', '#E3EC94', '#C5E6A2', '#A9DCC6', '#F2B766', '#E2B5DA', '#F1A39B'],
    board: '#F5EEDD', boardBlob: '#FBF7EC',
    ims: '#F8E1CB', imsBlob: '#FCEEDF', cI: '#9C8BD0', cII: '#E5A0C0', cIII: '#7FB3D8', cIV: '#8BC48A', synth: '#E8B04A', synthDk: '#B9852A', cytc: '#E0675B', Q: '#F2C14A',
    chill: '#8796B0',
    sepia: '#EAD6AE', sepiaBlob: '#F4E7C9', sepiaInk: '#6B4F33', bench: '#C99A62', benchDk: '#9C6E3E', pigeon: '#A7A8BE', pigeonDk: '#7D7F99', meat: '#E59A93',
    hub: '#F6DE9E', hubBlob: '#FCEFC8', fat: '#F2D36B', amino: ['#E46A5C', '#6E9BD3', '#7DB86A', '#B59AC9', '#F0A35E']
  };
  // Render budget. This film was made on a machine with no GPU, where p5.brush's watercolour fill costs 0.3–1.5 s a
  // shape and a flat wash a few ms. So here the watercolour fill is kept only on Pip's body and on shapes marked
  // keepFill (the hero props); every other fill becomes a flat wash of the colour it would have mixed to. For this page
  // only: the shared paint() is untouched for every other film.
  const paintFull = window.paintCore || (window.paintCore = paint);   // the shared paint(), kept once
  let inPip = false;
  window.paint = (pts, o = {}) => {
    if (o.fill && !o.keepFill) {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (!(inPip && Math.max(x1 - x0, y1 - y0) * (CAM ? CAM.zoom : 1) >= 150)) {
        const k = (o.fillOp ?? 170) / 255;
        o = o.wash ? { ...o, wash: mixCol(o.wash, o.fill, .45 * k), fill: null } : { ...o, wash: o.fill, washOp: 255 * k * .75, fill: null };
      }
    }
    paintFull(pts, o);
  };
  const withPip = fn => { inPip = true; try { return fn(); } finally { inPip = false; } };
  const pipP = (x, y, u, o) => withPip(() => pip(x, y, u, o));
  // a watercolour ground for the budget: a flat wash and soft drifting blobs, each two stacked translucent washes
  function ground(col, t, o = {}) {
    const key = o.key || 'g', blob = o.blob || mixCol(col, PAL.cream, .5);
    boilSeed('gr' + key);
    paintFull(viewRect(), { wash: col, ink: null });
    const n = o.n ?? 5, x0 = o.x0 ?? 0, y0 = o.y0 ?? 0, sx = o.sx ?? W, sy = o.sy ?? H;
    for (let i = 0; i < n; i++) {
      const x = x0 + hash(i + 3) * sx + 70 * wob(t, .03, i * .3), y = y0 + hash(i + 7) * sy + 50 * wob(t, .025, i), rx = 260 + 150 * hash(i), ry = 150 + 80 * hash(i + 1);
      if (!inView(x, y, rx)) continue;
      boilSeed('grb' + i + key);
      paintFull(ellPts(x, y, rx, ry, 20, 10), { wash: blob, washOp: 110, ink: null });
      paintFull(ellPts(x + 12, y - 8, rx * .6, ry * .58, 16, 9), { wash: blob, washOp: 90, ink: null });
    }
  }
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const viewRect = (pad = 60) => { if (!CAM) return rectPts(-pad, -pad, W + 2 * pad, H + 2 * pad); const hw = 960 / CAM.zoom + pad, hh = 540 / CAM.zoom + pad; return rectPts(CAM.cx - hw, CAM.cy - hh, 2 * hw, 2 * hh); };   // a wash that just covers the camera
  const clipRect = (x0, y0, x1, y1) => { if (!CAM) return rectPts(x0, y0, x1 - x0, y1 - y0); const hw = 960 / CAM.zoom + 60, hh = 540 / CAM.zoom + 60; const a = Math.max(x0, CAM.cx - hw), b = Math.max(y0, CAM.cy - hh), c = Math.min(x1, CAM.cx + hw), d = Math.min(y1, CAM.cy + hh); return c > a && d > b ? rectPts(a, b, c - a, d - b) : null; };
  const inView = (x, y, r = 0) => { if (!CAM) return true; const hw = 960 / CAM.zoom + r, hh = 540 / CAM.zoom + r; return Math.abs(x - CAM.cx) < hw && Math.abs(y - CAM.cy) < hh; };   // skip what the camera can't see
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));              // a soft pulse peaking at a
  const pulseK = (t, a, len = .7) => t > a && t < a + len ? Math.sin(seg(t, a, a + len) * Math.PI) : 0;
  const popIn = (t, a, len = .35) => backOut(seg(t, a, a + len));
  const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const rotP = (P, x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return P.map(([px, py]) => [x + px * c - py * s, y + px * s + py * c]); };

  // ---------- small painted marks ----------
  function ring(x, y, rx, ry, k, col = Z.goldDk, key = 'rg', w = 3.5) {   // a highlight ring that swells and fades
    if (k <= 0 || k >= 1) return; boilSeed('ring' + key);
    const q = 1 + .2 * easeOut(k), P = ellPts(x, y, rx * q, ry * q, 30);
    inkLine(P.concat([P[0], P[1]]), w * (1 - k * .8), col, 'ink', .5);
  }
  function holdRing(x, y, rx, ry, a, col = Z.goldDk, key = 'hr', w = 3) {  // a ring that stays while a > 0
    if (a <= .03) return; boilSeed('hring' + key);
    const P = ellPts(x, y, rx, ry, 30); inkLine(P.concat([P[0], P[1]]), w * a, col, 'ink', .5);
  }
  function arrow(x0, y0, x1, y1, k, col, key, w = 14, bend = 0) {  // a painted arrow that draws itself
    if (k <= .02) return; boilSeed('arr' + key);
    const q = ease(k), mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
    const pt = s => [lerp(lerp(x0, mx, s), lerp(mx, x1, s), s), lerp(lerp(y0, my, s), lerp(my, y1, s), s)];
    const [ex, ey] = pt(q), [px, py] = pt(Math.max(0, q - .04)), a = Math.atan2(ey - py, ex - px), hl = w * 1.9;
    const bx = ex - Math.cos(a) * hl, by = ey - Math.sin(a) * hl, P = [];
    for (let i = 0; i <= 10; i++) { const p = pt(q * i / 10); if (Math.hypot(p[0] - ex, p[1] - ey) > hl) P.push(p); }
    P.push([bx, by]);
    if (P.length > 2) paint(ribbon(P, w * .8, w), { wash: col, ink: PAL.ink, sw: .9 });
    const nx = -Math.sin(a), ny = Math.cos(a);
    paint([[ex, ey], [bx + nx * w * 1.2, by + ny * w * 1.2], [bx - nx * w * 1.2, by - ny * w * 1.2]], { wash: col, ink: PAL.ink, sw: .9 });
  }
  function bumpy(cx, cy, rx, ry, n = 44, amp = .07, f = 8) { const P = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; P.push([cx + Math.cos(a) * rx * (1 + amp * Math.sin(a * f)), cy + Math.sin(a) * ry * (1 + amp * Math.sin(a * f))]); } return P; }
  function cloud(cx, cy, rx, ry, k, from, key) {                  // a thought bubble with two little bubbles back to the thinker
    if (k <= .02) return; boilSeed('cl' + key);
    const q = backOut(k);
    paint(ellPts(lerp(from[0], cx, .2), lerp(from[1], cy, .2), 12 * q, 10 * q, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(ellPts(lerp(from[0], cx, .4), lerp(from[1], cy, .4), 20 * q, 17 * q, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(bumpy(cx, cy, rx * q, ry * q), { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
  }
  function host(x, y, u, t, keys, extra = {}, key = 'ph') {      // Pip the host, swimming in place
    const o = { ...K.act(t, keys), ...extra };
    return withPip(() => K.swim(x, y, u, t, o, key));
  }

  // ---------- atoms and molecules ----------
  // A bead: an atom. Carbon r 13, oxygen r 9, hydrogen r 6 (times the molecule's scale).
  function bead(x, y, r, col, key, hi = 0, sw) {
    boilSeed('bd' + key);
    const q = 1 + .22 * hi;
    paint(ellPts(x, y, r * q, r * q, 12), { wash: mixCol(col, PAL.cream, .4 * hi), ink: PAL.ink, sw: sw ?? clamp(r / 13, .45, 1.1) });
    if (r > 5) paint(ellPts(x - r * .32 * q, y - r * .34 * q, r * .3 * q, r * .22 * q, 8), { wash: mixCol(col, PAL.cream, .6), ink: null });
  }
  const CC = c => c === 'g' ? Z.gold : c === 'G' ? Z.gold2 : c === 't' ? Z.teal : c;
  function bond(a, b, s, dbl = false, key = '') {
    boilSeed('bo' + key);
    if (!dbl) { inkLine([a, b], 2.2 * s, PAL.ink, 'ink', 0); return; }
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d * 3.6 * s, ny = (b[0] - a[0]) / d * 3.6 * s;
    inkLine([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny]], 1.8 * s, PAL.ink, 'ink', 0);
    inkLine([[a[0] - nx, a[1] - ny], [b[0] - nx, b[1] - ny]], 1.8 * s, PAL.ink, 'ink', 0);
  }
  // A molecule as its carbon skeleton, left to right, zigzag. def: [{c: 'g'|'t'|'G', cx (a carboxyl), keto, oh,
  // br (a branch carboxyl, its carbon colour), coa (a thioester: =O + S + the CoA ribbon), dbl (a C=C to the next)}].
  // Returns the world positions of its carbons, carboxyl groups and side groups, so things can leave from them.
  function molGeo(def, x, y, s, rot = 0) {
    const n = def.length, dx = 34 * s, dy = 10 * s, g = { C: [], out: [], cx: [], side: [], br: [] };
    def.forEach((a, i) => {
      const lx = (i - (n - 1) / 2) * dx, ly = i % 2 ? dy : -dy, up = i % 2 ? 1 : -1;
      const c = rotP([[lx, ly]], x, y, rot)[0]; g.C.push(c);
      const ux = -Math.sin(rot) * up, uy = Math.cos(rot) * up;           // the side this carbon's groups hang on
      g.out.push([ux, uy]);
      const ax = i === 0 ? -1 : i === n - 1 ? 1 : 0, axw = [Math.cos(rot) * ax, Math.sin(rot) * ax];   // along the chain, outward
      if (a.cx) { const d = 30 * s; g.cx[i] = [[c[0] + (axw[0] * .6 + ux * .8) * d, c[1] + (axw[1] * .6 + uy * .8) * d], [c[0] + (axw[0] * 1 - ux * .35) * d, c[1] + (axw[1] * 1 - uy * .35) * d]]; }
      if (a.keto || a.oh || a.coa) g.side[i] = [c[0] + ux * 30 * s, c[1] + uy * 30 * s];
      if (a.br) { const b = [c[0] + ux * 34 * s, c[1] + uy * 34 * s]; g.br[i] = { c: b, O: [[b[0] + (ux * .7 - Math.cos(rot) * .7) * 28 * s, b[1] + (uy * .7 - Math.sin(rot) * .7) * 28 * s], [b[0] + (ux * .7 + Math.cos(rot) * .7) * 28 * s, b[1] + (uy * .7 + Math.sin(rot) * .7) * 28 * s]] }; }
      if (a.coa) g.S = [c[0] + axw[0] * 32 * s, c[1] + axw[1] * 32 * s];
    });
    return g;
  }
  // o: hi(i) carbon highlight, key, hideCx(i) (a carboxyl already gone), noH (hide the OH's hydrogen), t (for CoA)
  function mol(def, x, y, s, o = {}) {
    const key = o.key || 'm', g = molGeo(def, x, y, s, o.rot || 0), n = def.length;
    for (let i = 0; i + 1 < n; i++) bond(g.C[i], g.C[i + 1], s, def[i].dbl, key + 'b' + i);
    def.forEach((a, i) => {
      const c = g.C[i];
      if (a.cx && !(o.hideCx && o.hideCx(i))) { bond(c, g.cx[i][0], s, true, key + 'cxb' + i); bond(c, g.cx[i][1], s, false, key + 'cxc' + i); }
      if (a.keto) bond(c, g.side[i], s, true, key + 'kb' + i);
      if (a.oh) bond(c, g.side[i], s, false, key + 'ob' + i);
      if (a.coa) { bond(c, g.side[i], s, true, key + 'kb' + i); bond(c, g.S, s, false, key + 'sb' + i); }
      if (a.br) { const b = g.br[i]; bond(c, b.c, s, false, key + 'brb' + i); bond(b.c, b.O[0], s, true, key + 'brO0' + i); bond(b.c, b.O[1], s, false, key + 'brO1' + i); }
    });
    if (g.S) { const ci = def.findIndex(a => a.coa), ax = ci === 0 ? Math.PI : 0; coa(g.S[0], g.S[1], s, (o.rot || 0) + ax + .5, o.t ?? 0, key + 'coa'); }
    def.forEach((a, i) => {
      const c = g.C[i];
      if (a.cx && !(o.hideCx && o.hideCx(i))) g.cx[i].forEach((p, j) => bead(p[0], p[1], 9 * s, Z.O, key + 'cxO' + i + j));
      if (a.keto || a.oh || a.coa) bead(g.side[i][0], g.side[i][1], 9 * s, Z.O, key + 'sO' + i);
      if (a.oh && !o.noH) { const [ux, uy] = g.out[i]; bead(g.side[i][0] + ux * 13 * s + 6 * s, g.side[i][1] + uy * 13 * s, 5.5 * s, Z.H, key + 'sH' + i); }
      if (a.br) { const b = g.br[i]; b.O.forEach((p, j) => bead(p[0], p[1], 9 * s, Z.O, key + 'brO' + i + j)); bead(b.c[0], b.c[1], 13 * s, CC(a.br), key + 'brC' + i, o.hiBr ? o.hiBr(i) : 0); }
      bead(c[0], c[1], 13 * s, CC(a.c), key + 'C' + i, o.hi ? o.hi(i) : 0);
    });
    if (g.S) bead(g.S[0], g.S[1], 8.5 * s, Z.S, key + 'S');
    return g;
  }
  // the molecules of the film (carbons left → right). Gold = from food, teal = the cycle's own.
  const M = {
    glucoseChain: [{ c: 'g' }, { c: 'g' }, { c: 'g' }, { c: 'g' }, { c: 'g' }, { c: 'g' }],
    pyruvate: [{ c: 'g' }, { c: 'g', keto: 1 }, { c: 'g', cx: 1 }],
    acetyl: [{ c: 'g' }, { c: 'g', coa: 1 }],
    acetyl2: [{ c: 'g' }, { c: 'g' }],
    oaa: [{ c: 't', cx: 1 }, { c: 't', keto: 1 }, { c: 't' }, { c: 't', cx: 1 }],
    citrate: [{ c: 'g', cx: 1 }, { c: 'g' }, { c: 't', oh: 1, br: 't' }, { c: 't' }, { c: 't', cx: 1 }],
    isocitrate: [{ c: 'g', cx: 1 }, { c: 'g' }, { c: 't', br: 't' }, { c: 't', oh: 1 }, { c: 't', cx: 1 }],
    isoNoBr: [{ c: 'g', cx: 1 }, { c: 'g' }, { c: 't' }, { c: 't', oh: 1 }, { c: 't', cx: 1 }],
    akg: [{ c: 'g', cx: 1 }, { c: 'g' }, { c: 't' }, { c: 't', keto: 1 }, { c: 't', cx: 1 }],
    akgNoCx: [{ c: 'g', cx: 1 }, { c: 'g' }, { c: 't' }, { c: 't', keto: 1 }],
    succCoA: [{ c: 'g', cx: 1 }, { c: 'g' }, { c: 't' }, { c: 't', coa: 1 }],
    succinate: [{ c: 'g', cx: 1 }, { c: 'g' }, { c: 't' }, { c: 't', cx: 1 }],
    fumarate: [{ c: 'g', cx: 1 }, { c: 'g', dbl: 1 }, { c: 't' }, { c: 't', cx: 1 }],
    malate: [{ c: 'g', cx: 1 }, { c: 'g' }, { c: 't', oh: 1 }, { c: 't', cx: 1 }],
    oaa2: [{ c: 'g', cx: 1 }, { c: 'g' }, { c: 't', keto: 1 }, { c: 't', cx: 1 }]
  };
  // CO₂: O=C=O, the carbon in its colour of origin
  function co2(x, y, s, cc, key, rot = 0, hi = 0) {
    const a = rotP([[-24 * s, 0]], x, y, rot)[0], b = rotP([[24 * s, 0]], x, y, rot)[0];
    bond(a, [x, y], s, true, key + 'l'); bond([x, y], b, s, true, key + 'r');
    bead(a[0], a[1], 9 * s, Z.O, key + 'a'); bead(b[0], b[1], 9 * s, Z.O, key + 'b'); bead(x, y, 13 * s, CC(cc), key + 'c', hi);
  }
  // H₂O: an oxygen with two hydrogens
  function water(x, y, s, key, rot = 0) {
    const h1 = rotP([[-13 * s, 9 * s]], x, y, rot)[0], h2 = rotP([[13 * s, 9 * s]], x, y, rot)[0];
    bead(h1[0], h1[1], 6 * s, Z.H, key + 'h1'); bead(h2[0], h2[1], 6 * s, Z.H, key + 'h2'); bead(x, y, 10 * s, Z.O, key + 'o');
  }
  function o2(x, y, s, key, rot = 0) {
    const a = rotP([[-9 * s, 0]], x, y, rot)[0], b = rotP([[9 * s, 0]], x, y, rot)[0];
    bond(a, b, s, true, key + 'd'); bead(a[0], a[1], 10 * s, Z.O, key + 'a'); bead(b[0], b[1], 10 * s, Z.O, key + 'b');
  }
  // coenzyme A: a wavy mint ribbon off a sulfur hook at (x, y), running along ang
  function coa(x, y, s, ang, t, key) {
    boilSeed('coa' + key);
    const ca = Math.cos(ang), sa = Math.sin(ang), P = [];
    for (let j = 0; j <= 7; j++) { const d = (8 + j * 13) * s, w = 6 * s * Math.sin(j * 1.1 + t * 3) * Math.min(1, j / 2); P.push([x + ca * d - sa * w, y + sa * d + ca * w]); }
    paint(ribbon(P, 11 * s, 7 * s), { wash: Z.coa, ink: PAL.ink, sw: clamp(.9 * s, .5, 1.2) });
    const e = P[P.length - 1]; paint(ellPts(e[0], e[1], 9 * s, 8 * s, 10), { wash: Z.coaDk, ink: PAL.ink, sw: clamp(.8 * s, .5, 1.1) });
  }
  // NAD⁺ / FAD shuttles: two lobes (a dinucleotide); the business end (right) has a socket on top. load 0..1:
  // empty (pale, NAD⁺ wears a +) → loaded (deep colour, a hydrogen in the socket with its two electrons sparkling).
  function shuttle(x, y, s, kind, load, t, key, o = {}) {
    boilSeed('sh' + key);
    const nad = kind === 'nad', col = mixCol(nad ? Z.nad : Z.fad, nad ? Z.nadh : Z.fadh, ease(load)), dk = mixCol(col, PAL.ink, .22), r = o.rot || 0;
    push(); translate(x, y); rotate(r);
    const P = [];
    for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, cx = Math.cos(a) > 0 ? 17 : -17, rr = Math.cos(a) > 0 ? 22 : 18; P.push([(cx + Math.cos(a) * rr) * s, Math.sin(a) * rr * s * (1 - .25 * Math.pow(Math.sin(a), 2) * (Math.abs(Math.cos(a)) < .35 ? 1 : 0))]); }
    paint(P, { wash: col, fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw: clamp(s, .6, 1.3), curv: .4 });
    paint(ellPts(-17 * s, 2 * s, 7 * s, 6 * s, 10), { wash: mixCol(col, PAL.cream, .35), ink: null });
    paint(ellPts(19 * s, -18 * s, 9 * s, 6 * s, 12), { wash: mixCol(col, PAL.ink, .35), ink: PAL.ink, sw: clamp(.7 * s, .4, 1) });
    pop();
    const so = rotP([[19 * s, -22 * s]], x, y, r)[0];
    if (load > .5) {
      bead(so[0], so[1], 6.5 * s, Z.H, key + 'h');
      for (let j = 0; j < 2; j++) { const a = t * 5 + j * Math.PI, ex = so[0] + Math.cos(a) * 11 * s, ey = so[1] + Math.sin(a) * 5 * s - 3 * s; boilSeed('el' + key + j); paint(starPts(ex, ey, 6 * s, .4, 4, a), { wash: Z.gold2, ink: Z.goldDk, sw: .5 }); }
    }
    if (nad && load < .5) {                                        // NAD⁺ wears its charge: a + in a little disc
      const q = backOut(clamp(1 - load * 2)), cx = x + 40 * s, cy = y - 22 * s; boilSeed('pl' + key);
      paint(ellPts(cx, cy, 11 * s * q, 11 * s * q, 14), { wash: PAL.cream, ink: Z.nadh, sw: clamp(.8 * s, .5, 1.1) });
      inkLine([[cx - 6 * s * q, cy], [cx + 6 * s * q, cy]], 1.5 * s, Z.nadh, 'ink', 0); inkLine([[cx, cy - 6 * s * q], [cx, cy + 6 * s * q]], 1.5 * s, Z.nadh, 'ink', 0);
    }
    return so;                                                     // the socket, where the hydrogens go
  }
  // GTP / ATP: base, ribose, phosphates (np may be fractional while the third one pops on)
  function ntp(x, y, s, base, np, key, o = {}) {
    boilSeed('nt' + key);
    const bc = base === 'G' ? Z.baseG : Z.baseA;
    paint(rotP(ellPts(0, 0, 17 * s, 14 * s, 6, 0, .5), x - 30 * s, y, 0), { wash: bc, ink: PAL.ink, sw: clamp(.9 * s, .5, 1.2), curv: .2 });
    paint(starPts(x - 4 * s, y + 4 * s, 12 * s, .78, 5, -Math.PI / 2), { wash: Z.ribose, ink: PAL.ink, sw: clamp(.8 * s, .5, 1.1) });
    for (let i = 0; i < 3; i++) {
      const k = clamp(np - i); if (k <= .02) continue;
      const px = x + (16 + i * 17) * s, py = y + 4 * s, q = i === 2 ? backOut(k) : 1;
      if (i) bond([px - 17 * s, py], [px, py], s, false, key + 'pb' + i);
      bead(px, py, 8 * s * q, Z.P, key + 'p' + i, o.hi || 0);
    }
    return [x + 50 * s, y + 4 * s];                                // the last phosphate
  }
  // the cycle as a painted wheel: a soft ring track, chevrons drifting clockwise, a station pad per intermediate
  const WA = i => (-112.5 + 45 * i) * Math.PI / 180;               // station angles, clockwise from just left of the top
  const stationAt = (cx, cy, R, i) => [cx + Math.cos(WA(i)) * R, cy + Math.sin(WA(i)) * R];
  const rideAt = (cx, cy, R, f) => { const a = (-112.5 + 45 * f) * Math.PI / 180; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; };   // f: station index, fractional
  function wheel(cx, cy, R, t, o = {}) {
    const key = o.key || 'w', w = o.w || 30, drawK = o.draw ?? 1, spin = o.spin ?? t * .25;
    if (drawK <= .01) return;
    boilSeed('wh' + key);
    const span = TAU * drawK, a0 = -Math.PI / 2;
    for (let h = 0; h < 2; h++) {
      const b0 = a0 + span * h / 2, b1 = a0 + span * (h + 1) / 2, P = [];
      for (let i = 0; i <= 30; i++) { const a = lerp(b0, b1, i / 30); P.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
      paint(ribbon(P, w, w), { wash: o.col || Z.ring, ink: o.ink || Z.ringDk, sw: o.sw ?? 1.1 });
    }
    const n = o.chev ?? 18;
    for (let i = 0; i < n; i++) {                                   // chevrons, pointing clockwise
      const a = a0 + frac(i / n + spin) * TAU; if (a - a0 > span) continue;
      const ca = Math.cos(a), sa = Math.sin(a), tx = -sa, ty = ca, cs = w * .32, px = cx + ca * R, py = cy + sa * R;
      if (!inView(px, py, w)) continue;
      boilSeed('chev' + key + i);
      inkLine([[px - tx * cs + ca * cs, py - ty * cs + sa * cs], [px + tx * cs * .6, py + ty * cs * .6], [px - tx * cs - ca * cs, py - ty * cs - sa * cs]], o.chevW || 2.2, o.chevCol || Z.ringDk, 'ink', 0);
    }
    if (o.pads) for (let i = 0; i < 8; i++) {
      const k = o.pads(i); if (k <= .02) continue;
      const [x, y] = stationAt(cx, cy, R, i), q = backOut(clamp(k)), pr = (o.padR || 66) * q;
      if (!inView(x, y, pr * 1.3)) continue;
      boilSeed('pad' + key + i);
      paint(bumpy(x, y, pr * 1.18, pr * .82, 24, .05, 5), { wash: Z.pads[i], ink: mixCol(Z.pads[i], PAL.ink, .35), sw: .8, curv: .3 });
    }
  }
  // the mitochondrion: outer membrane, a thin intermembrane space, the folded inner membrane (cristae), the matrix
  function mito(x, y, rx, ry, t, key, o = {}) {
    boilSeed('mi' + key);
    const sw = o.sw ?? 1.3, rot = o.rot || 0;
    paint(rotP(bumpy(0, 0, rx, ry, 48, .015, 3), x, y, rot), { wash: Z.outer, fill: Z.outerDk, fillOp: 45, tex: .45, bleed: .04, ink: PAL.ink, sw, curv: .3, keepFill: o.keepFill });
    paint(rotP(ellPts(0, 0, rx * .92, ry * .85, 44), x, y, rot), { wash: Z.inner, ink: null });
    paint(rotP(ellPts(0, 0, rx * .86, ry * .74, 44), x, y, rot), { wash: Z.matrix, fill: Z.matrixDk, fillOp: 40, tex: .4, ink: mixCol(Z.innerDk, PAL.ink, .2), sw: sw * .8 });
    const n = o.cristae ?? 7;
    for (let i = 0; i < n; i++) {                                   // cristae: folds of the inner membrane, alternately from top and bottom
      const f = (i + .5) / n, lx = lerp(-rx * .7, rx * .7, f), top = i % 2 === 0, ey = Math.sqrt(Math.max(0, 1 - Math.pow(lx / (rx * .86), 2))) * ry * .74;
      const y0 = top ? -ey : ey, y1 = y0 * (1 - .95 * (.55 + .15 * hash(i + 3))) * 1, w0 = 9 * (rx / 300);
      const P = [[lx, y0 * 1.02], [lx + 4 * Math.sin(t * .8 + i), lerp(y0, y1, .5)], [lx, y1]];
      paint(rotP(ribbon(P, w0 * 2.2, w0 * 1.6), x, y, rot), { wash: Z.inner, ink: mixCol(Z.innerDk, PAL.ink, .2), sw: sw * .7 });
    }
    if (o.wheel) { const r = ry * .3; wheel(x, y, r, t, { key: key + 'w', w: r * .32, chev: 8, spin: o.wheel, chevW: 1.2, sw: .7 }); }
  }
  // the glucose ring: five carbons and an oxygen in a hexagon, the sixth carbon hanging off. open 0..1 unrolls it.
  function glucose(x, y, s, key, o = {}) {
    const op = ease(o.open || 0), P = [], hi = o.hi || (() => 0);
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * TAU / 6 + Math.PI / 6; P.push([x + Math.cos(a) * 46 * s, y + Math.sin(a) * 46 * s]); }
    const chain = M.glucoseChain.map((_, i) => [x + (i - 2.5) * 34 * s, y + (i % 2 ? 10 : -10) * s]);
    // ring order: C1..C5 at P[0..4], O at P[5]; C6 hangs off C5
    const C6r = [P[4][0] - 34 * s, P[4][1] - 26 * s], ringC = [P[0], P[1], P[2], P[3], P[4], C6r];
    const C = ringC.map((p, i) => lerp2(p, chain[i], op)), Op = lerp2(P[5], [x, y - 52 * s], op);
    for (let i = 0; i < 5; i++) bond(C[i], C[i + 1], s, false, key + 'b' + i);
    if (op < .5) { bond(C[0], Op, s, false, key + 'r0'); bond(C[4], Op, s, false, key + 'r1'); }
    bead(Op[0], Op[1], 10 * s * (1 - op), Z.O, key + 'O');
    C.forEach((c, i) => bead(c[0], c[1], 13 * s, Z.gold, key + 'C' + i, hi(i)));
    return C;
  }

  // ---------- home: the breakfast table ----------
  function bun(x, y, s, t, key, o = {}) {                          // a steamed bun with a bite out of it; o.bite 0..1
    boilSeed('bun' + key);
    const P = [], bite = o.bite ?? 1;
    for (let i = 0; i <= 40; i++) {
      const a = Math.PI + i / 40 * Math.PI; let r = 1;
      const d = Math.abs(a - Math.PI * 1.72); if (bite > 0 && d < .32) r -= .2 * bite * (1 - Math.pow(d / .32, 2)) * (.85 + .15 * Math.sin(d * 40));
      P.push([x + Math.cos(a) * 110 * s * r, y + Math.sin(a) * 92 * s * r]);
    }
    P.push([x + 112 * s, y + 6 * s], [x - 112 * s, y + 6 * s]);
    paint(P, { wash: Z.bun, fill: Z.bunDk, fillOp: 50, tex: .45, ink: PAL.ink, sw: 1.1 * s, curv: .3, keepFill: o.keepFill ?? true });
    if (bite > 0) paint(ellPts(x + 52 * s, y - 60 * s, 16 * s * bite, 11 * s * bite, 10, 0, .5), { wash: Z.filling, ink: null });
    for (let k = 0; k < 6; k++) { const a = Math.PI * (1.15 + k * .14); inkLine([[x + Math.cos(a) * 80 * s, y + Math.sin(a) * 62 * s], [x + Math.cos(a) * 30 * s, y - 70 * s], [x + 4 * s, y - 92 * s]], .9 * s, mixCol(Z.bunDk, PAL.ink, .3), 'inkfine', .6); }
    if (o.specks) for (let i = 0; i < 9; i++) {                    // the carbons in it
      const k = o.specks(i); if (k <= .02) continue;
      const sx = x + (hash(i + 70) - .5) * 150 * s, sy = y - 15 * s - hash(i + 71) * 50 * s;
      boilSeed('spk' + key + i); paint(ellPts(sx, sy, 7 * s * k, 7 * s * k, 10), { wash: Z.gold, ink: Z.goldDk, sw: .7 });
    }
  }
  function plate(x, y, s, key) { boilSeed('pl' + key); paint(ellPts(x, y, 190 * s, 34 * s, 30), { wash: Z.plate, fill: Z.plateDk, fillOp: 50, tex: .3, ink: PAL.ink, sw: 1 }); paint(ellPts(x, y - 3 * s, 130 * s, 18 * s, 24), { wash: mixCol(Z.plate, Z.plateDk, .35), ink: null }); }
  function homeBg(t, key, gold = 0) {
    const col = mixCol(Z.home, Z.homeGold, gold), blob = mixCol(Z.homeBlob, Z.homeGoldBlob, gold);
    ground(col, t, { key: 'h' + key, blob, n: 5 });
    boilSeed('win' + key);                                         // the window, morning light
    paint(rrPts(1280, 120, 460, 380, 18), { wash: mixCol(Z.winDk, Z.gold2, .25 * gold), ink: PAL.ink, sw: 1.2 });
    paint(rrPts(1300, 140, 420, 340, 14, 3), { wash: mixCol(Z.win, Z.gold2, .25 * gold), ink: null });
    inkLine([[1510, 128], [1510, 492]], 3, Z.frame, 'ink', 0); inkLine([[1288, 310], [1732, 310]], 3, Z.frame, 'ink', 0);
    paint(rrPts(1262, 102, 496, 20, 6), { wash: Z.frame, ink: PAL.ink, sw: .9 });
    paint(ellPts(1380, 220, 46, 46, 18), { wash: '#FFE7A6', ink: null });
    boilSeed('tbl' + key);
    const tb = clipRect(-1400, 880, W + 1400, 2400), te = clipRect(-1400, 884, W + 1400, 924);
    if (tb) paint(tb, { wash: mixCol(Z.table, Z.tableDk, .12), ink: null });
    if (te) paint(te, { wash: mixCol(Z.table, PAL.cream, .2), washOp: 160, ink: null });
    inkLine([[-200, 884], [W + 200, 884]], 1.6, mixCol(Z.tableDk, PAL.ink, .4), 'ink', 0);
    for (let i = 0; i < 5; i++) inkLine([[-100 + i * 480, 940 + 30 * hash(i)], [260 + i * 480, 950 + 30 * hash(i + 1)]], .9, mixCol(Z.table, Z.tableDk, .7), 'inkfine', .5);
  }
  // a breath: a soft cloud with CO₂ tumbling in it
  function puff(x, y, rx, ry, k, t, key, o = {}) {
    if (k <= .02) return;
    boilSeed('pf' + key);
    const q = easeOut(k), fade = o.fade ?? 1; if (fade <= .02) return;
    paint(bumpy(x, y, rx * q, ry * q, 40, .09, 7), { wash: '#FFFDF6', washOp: 210 * fade, ink: mixCol(Z.home, PAL.ink, .25), sw: .8 * fade, curv: .4 });
  }

  // ---------- motion helpers for the cycle ----------
  // a CO₂ that has just left: it drifts up and away (toward the breath), turning slowly
  function co2Fly(t, t0, p0, s, cc, key, o = {}) {
    if (t < t0) return;
    const d = t - t0, up = o.up ?? 170, dx = o.dx ?? 55, x = p0[0] + dx * d + 14 * Math.sin(d * 2.2), y = p0[1] - up * (d * .55 + .45 * d * d / 2);
    if (y < (o.top ?? -900)) return;
    co2(x, y, s * (1 + .15 * pulseK(t, t0, .5)), cc, key, .3 * Math.sin(d * 1.3) + (o.rot0 || 0), o.hi || 0);
    if (d < .6) K.burst(p0[0], p0[1], 34 * s, d / .6, PAL.ink, key + 'bu');
  }
  // a shuttle's trip: swims in to dock, takes two hydrogens from src, lights up, glides to its parking place
  function trip(t, e, s) {
    if (t < e.tIn) return;
    const arrive = easeOut(seg(t, e.tIn, e.tIn + .9)), leave = ease(seg(t, e.tPark, e.tPark + 1.2));
    let p = arcPt(e.from, e.dock, -60, arrive);
    if (leave > 0) p = arcPt(e.dock, e.park, -50, leave);
    const load = seg(t, e.tLoad - .05, e.tLoad + .05), bobY = 6 * Math.sin(t * 1.7 + e.key.length);
    const sock = shuttle(p[0], p[1] + bobY, s * (1 + .12 * pulseK(t, e.tLoad, .5)), e.kind, load, t, e.key, { rot: .08 * Math.sin(t * 1.1 + e.key.length) });
    for (let j = 0; j < 2; j++) {                                      // the two hydrogens hop across
      const k = seg(t, e.tHop + j * .18, e.tHop + j * .18 + .5); if (k <= 0 || k >= 1) continue;
      const q = arcPt(e.src, sock, -70 - j * 20, ease(k)); bead(q[0], q[1], 6.5 * s, Z.H, e.key + 'hh' + j);
    }
    if (t > e.tLoad && t < e.tLoad + .5) { K.burst(sock[0], sock[1], 30 * s, (t - e.tLoad) / .5, Z.goldDk, e.key + 'lb'); K.sparkle(sock[0] + 10, sock[1] - 16, 26 * s, (t - e.tLoad) / .5, Z.gold2); }
    if (e.ringAt) holdRing(p[0], p[1] + bobY, 62 * s, 42 * s, near(t, e.ringAt, .6), Z.goldDk, e.key + 'rg');
  }

  // ================================ A: breakfast (0–26.2) ================================
  const A_END = L(3, -.8);
  const PA = [700, 880], UA = 34, BUN = [1120, 872], PUFF = [970, 545];
  const PUFFC = [[40, -10], [-120, 30], [-60, -70], [110, 50], [150, -60], [-150, -40], [20, 75]];   // CO₂ in the breath
  function shotA(t, lt, dur) {
    K.setT(t);
    const toBun = easeIn(seg(t, A_END - 1.35, A_END));
    const c = kf(t, [[0, [960, 610, 1.0]], [L(1, 2.3), [960, 610, 1.0]], [L(1, 3.4), [PUFF[0], PUFF[1], 1.45]], [L(1, 5.4), [PUFF[0], PUFF[1], 1.45]],
      [L(1, 6.6), [1010, 660, 1.08]], [L(2, 1.0), [1010, 660, 1.08]], [L(2, 4.8), [930, 600, 1.0]], [A_END - 1.35, [930, 600, 1.0]]], ease);
    const cz = lerp(c[2], 3.4, toBun), cx = lerp(c[0], BUN[0] + 10, toBun), cy = lerp(c[1], BUN[1] - 50, toBun);
    cam(cx + 6 * wob(t, .05) * (1 - toBun), cy + 4 * wob(t, .04) * (1 - toBun), cz);
    homeBg(t, 'a');
    plate(BUN[0], BUN[1] + 8, 1, 'a');
    // the bun, and the carbons in it (they twinkle in as the line says so; later they leave one by one as CO₂)
    const leaveAt = i => L(2, 2.1) + i * .55;
    bun(BUN[0], BUN[1], 1, t, 'a', { specks: i => i < 4 && t > leaveAt(i) ? 0 : popIn(t, L(1, 6.95) + i * .16, .3) });
    for (let i = 0; i < 4; i++) {                                     // L2: taken apart one by one
      const k = seg(t, leaveAt(i), leaveAt(i) + 2.4); if (k <= 0 || k >= 1) continue;
      const sx = BUN[0] + (hash(i + 70) - .5) * 150, sy = BUN[1] - 15 - hash(i + 71) * 50;
      const p = arcPt([sx, sy], [sx - 160 + i * 90, sy - 520], 120, easeOut(k));
      co2(p[0], p[1], .9, 'g', 'lv' + i, .5 * Math.sin(k * 4 + i));
      if (k < .25) K.burst(sx, sy, 24, k / .25, Z.goldDk, 'lvb' + i);
    }
    // Pip: chewing, a breath in, a breath out
    const inh = seg(t, L(1, .1), L(1, .7)), exh = seg(t, L(1, .7), L(1, 1.3));
    const breathSq = -.09 * Math.sin(inh * Math.PI / 2) * (1 - exh) + .07 * Math.sin(exh * Math.PI) ;
    const mood = K.act(t, [[0, 'happy', { lookX: .9 }], [L(1, .1), 'calm', { lookX: .6, lookY: -.3 }], [L(1, .7), 'wow', { lookX: .7, lookY: -.7 }], [L(1, 2.6), 'calm', { lookX: .6, lookY: -.9 }],
      [L(1, 4.4), 'wow', { lookX: .7, lookY: -.9 }], [L(1, 7.1), 'wow', { lookX: 1, lookY: .1 }], [L(1, 8.4), 'happy', { lookX: 1 }],
      [L(2, .2), 'confused', { lookX: .8 }], [L(2, 2.4), 'calm', { lookX: .7, lookY: -.8 }], [L(2, 4.6), 'confused', { lookX: .3, lookY: -.6 }],
      [L(2, 6.0), 'wow', { lookX: -.4, lookY: -1 }], [L(2, 10.9), 'idea', { lookX: -.3, lookY: -.9 }], [L(2, 12.4), 'happy', { lookX: .9 }]]);
    pipP(PA[0], PA[1], UA, { ...mood, sq: mood.sq + breathSq, dy: mood.dy - .1 * Math.sin(inh * Math.PI / 2) * (1 - exh), key: 'pa' });
    // the breath and the CO₂ in it
    const grow = seg(t, L(1, .75), L(1, 2.0)), fade = 1 - seg(t, L(2, -.2), L(2, 2.6)), mouth = [PA[0] + .7 * UA, PA[1] - 2.55 * UA];
    if (grow > 0 && fade > 0) {
      const q = easeOut(grow), pc = lerp2(mouth, PUFF, q);
      puff(pc[0], pc[1] - 30 * (1 - fade), 240 * lerp(.15, 1, q), 160 * lerp(.15, 1, q), 1, t, 'a', { fade });
      PUFFC.forEach((o, i) => {
        const k = seg(grow, .35 + i * .06, .75 + i * .06); if (k <= 0) return;
        const gold = i === 0 ? ease(seg(t, L(1, 4.6), L(1, 5.1))) : ease(seg(t, L(1, 6.9) + i * .12, L(1, 7.3) + i * .12));
        const x = pc[0] + o[0] * q + 10 * wob(t, .2, i), y = pc[1] + o[1] * q + 8 * wob(t, .17, i * 2) - 30 * (1 - fade) - 60 * (1 - fade) * hash(i);
        co2(x, y, .95 * backOut(k) * (fade < 1 ? lerp(.6, 1, fade) : 1), mixCol('#5A5266', Z.gold, gold), 'pc' + i, .4 * Math.sin(t * .7 + i * 1.7), near(t, L(1, 2.6) + i * .12, .2));
        if (i === 0) { ring(x, y, 56, 40, seg(t, L(1, 4.15), L(1, 4.95)), Z.goldDk, 'hero'); holdRing(x, y, 52, 36, seg(t, L(1, 4.5), L(1, 4.8)) * (1 - seg(t, L(1, 9.2), L(1, 9.8))), Z.goldDk, 'heroH', 2.6); }
      });
      // the gold trail back to the bun
      const tr = seg(t, L(1, 5.5), L(1, 7.0)), trOut = seg(t, L(2, .3), L(2, 1.6));
      if (tr > 0 && trOut < 1) {
        const a = [pc[0] + PUFFC[0][0] * q, pc[1] + PUFFC[0][1] * q + 26], b = [BUN[0] - 10, BUN[1] - 100];
        boilSeed('trail');
        for (let j = 0; j < 22; j++) { const f = j / 21; if (f > tr || f < trOut) continue; const p = arcPt(a, b, 90, f); paint(ellPts(p[0], p[1], 5, 5, 8), { wash: Z.gold, ink: Z.goldDk, sw: .6 }); }
      }
    }
    // L2: the answer, in a thought cloud: a mitochondrion with a little wheel turning inside
    const ck = seg(t, L(2, 5.8), L(2, 6.3)), mk = popIn(t, L(2, 6.1), .4), CL = [560, 360];
    cloud(CL[0], CL[1], 270, 175, ck, [PA[0] - 10, PA[1] - 6.4 * UA], 'a');
    if (mk > .02) {
      const spin = t * .25 + 1.5 * Math.pow(seg(t, L(2, 10.6), L(2, 13)), 2) * 2;
      push(); translate(CL[0], CL[1]); scale(mk); translate(-CL[0], -CL[1]);
      mito(CL[0], CL[1], 200, 105, t, 'am', { sw: 1.1, cristae: 6 });
      const wk = seg(t, L(2, 8.3), L(2, 9.4));
      if (wk > 0) wheel(CL[0], CL[1], 36, t, { key: 'aw', w: 12, chev: 7, spin, draw: ease(wk), chevW: 1.3, sw: .7 });
      pop();
      for (let i = 0; i < 5; i++) K.sparkle(CL[0] + Math.cos(i * 1.3) * 120, CL[1] + Math.sin(i * 1.3) * 70, 22, seg(t, L(2, 10.9) + i * .12, L(2, 11.6) + i * .12), PAL.cream);
    }
    const at = toScreen(PA[0], PA[1] - 2.8 * UA);
    camEnd();
    if (lt < .9) iris(at[0], at[1], kf(lt, [[0, 0], [.15, 210], [.4, 230], [.9, 1800]], easeIn));
    flash(seg(t, A_END - .5, A_END), PAL.cream);
  }

  // ================================ B: the cytoplasm (26.2–39.3) ================================
  const B_END = L(4, 1.9), GL = [860, 520], MB = [1520, 560];
  function shotB(t, lt, dur) {
    K.setT(t);
    const into = easeIn(seg(t, L(4, .5), B_END));
    const c = kf(t, [[A_END, [860, 500, 1.5]], [L(3, 1.4), [860, 500, 1.5]], [L(3, 2.9), [1040, 560, 1.12]], [L(4, .3), [1040, 560, 1.12]]], ease);
    const ent = [MB[0] - 318, MB[1] + 18];
    cam(lerp(c[0], ent[0], into) + 6 * wob(t, .05), lerp(c[1], ent[1], into) + 4 * wob(t, .04), lerp(c[2], 4.2, into * into));
    ground(Z.cyto, t, { key: 'b', blob: '#FBEBDD' });
    K.cytoplasm(t, { key: 'b', mito: false, er: [420, 150], ribos: 30 });
    K.motes(t, 18, mixCol(Z.cytoDk, Z.cyto, .3), { key: 'b' });
    mito(MB[0], MB[1], 340, 175, t, 'b', { rot: -.08, keepFill: true });
    // glucose → (unrolls) → two pyruvates
    const open = seg(t, L(3, 5.6), L(3, 6.5)), split = seg(t, L(3, 7.3), L(3, 8.2)), dressed = t > L(3, 8.25);
    const go = ease(seg(t, L(4, .0), L(4, 1.7))), s = 1.5;
    if (split <= 0) glucose(GL[0], GL[1] + 6 * wob(t, .3), s, 'g', { open, hi: i => near(t, L(3, .4) + i * .1, .18) + near(t, L(3, 4.2) + i * .1, .18) });
    else {
      const q = easeOut(split);
      [[-1, 0], [1, 3]].forEach(([sd, i0], h) => {
        const p0 = [GL[0] + sd * 51 * s, GL[1]], p1 = [GL[0] + sd * 150, GL[1] + sd * 80], tgt = [ent[0] - 70 + h * 60, ent[1] - 40 + h * 70];
        const p = lerp2(lerp2(p0, p1, q), tgt, go), bob = 6 * wob(t, .3, h);
        if (!dressed) mol(M.pyruvate.map(a => ({ c: a.c })), p[0], p[1] + bob, s, { key: 'py' + h });
        else mol(M.pyruvate, p[0], p[1] + bob, s * (1 + .1 * pulseK(t, L(3, 8.25), .4)), { key: 'py' + h });
        if (t > L(3, 8.25) && t < L(3, 8.75)) K.sparkle(p[0], p[1] - 40, 30, (t - L(3, 8.25)) / .5, PAL.cream);
      });
      K.burst(GL[0], GL[1], 60, split, PAL.ink, 'gs');
    }
    camEnd();
    host(400, 880, 31, t, [[A_END, 'calm', { lookX: .9 }], [L(3, .4), 'happy', { lookX: .9 }], [L(3, 3.0), 'calm', { lookX: .9, lookY: -.3 }], [L(3, 7.6), 'wow', { lookX: .9 }],
      [L(3, 9.0), 'excited'], [L(4, .3), 'calm', { lookX: 1, lookY: -.3 }]], { talk: true }, 'pb');
    if (lt < .5) flash(1 - lt / .5, PAL.cream);
    flash(seg(t, B_END - .45, B_END), PAL.cream);
  }

  // ================================ C: the cycle (39.3–144.7) ================================
  const C_END = L(12, -1.2), WC = [960, 640], R = 350, SC = 1.3, ST = i => stationAt(WC[0], WC[1], R, i);
  const PR = [[1660, 360], [1660, 500], [1660, 640]], PLp = [[265, 700], [265, 545]];
  const C2 = {                                                        // the second lap: new gold (G) in, one old gold out
    citrate: [{ c: 'G', cx: 1 }, { c: 'G' }, { c: 't', oh: 1, br: 't' }, { c: 'g' }, { c: 'g', cx: 1 }],
    iso: [{ c: 'G', cx: 1 }, { c: 'G' }, { c: 't', br: 't' }, { c: 'g', oh: 1 }, { c: 'g', cx: 1 }],
    akg: [{ c: 'G', cx: 1 }, { c: 'G' }, { c: 't' }, { c: 'g', keto: 1 }, { c: 'g', cx: 1 }],
    succCoA: [{ c: 'G', cx: 1 }, { c: 'G' }, { c: 't' }, { c: 'g', coa: 1 }],
    succ: [{ c: 'G', cx: 1 }, { c: 'G' }, { c: 't' }, { c: 'g', cx: 1 }],
    fum: [{ c: 'G', cx: 1 }, { c: 'G', dbl: 1 }, { c: 't' }, { c: 'g', cx: 1 }],
    mal: [{ c: 'G', cx: 1 }, { c: 'G' }, { c: 't', oh: 1 }, { c: 'g', cx: 1 }],
    oaa: [{ c: 'G', cx: 1 }, { c: 'G' }, { c: 't', keto: 1 }, { c: 'g', cx: 1 }]
  };
  const LAP2 = [C2.citrate, C2.iso, C2.akg, C2.succCoA, C2.succ, C2.fum, C2.mal, C2.oaa];
  // where the molecule is on the wheel (a station index, fractional while it rides)
  const rideF = t => kf(t, [[L(5, 5.0), 0], [L(5, 6.0), 1], [L(6, 2.8), 1], [L(6, 3.8), 2], [L(7, .0), 2], [L(7, 1.0), 3], [L(7, 12.3), 3], [L(7, 13.3), 4],
    [L(8, 11.3), 4], [L(8, 12.3), 5], [L(9, 10.1), 5], [L(9, 11.0), 6], [L(10, 3.0), 6], [L(10, 4.0), 7], [L(10, 10.0), 7], [L(10, 11.0), 8],
    [L(11, 6.4), 8], [L(11, 9.8), 16]], ease);
  const molAtF = f => rideAt(WC[0], WC[1], R, f);
  const TRIPS = [
    { kind: 'nad', key: 'n1', from: [1900, 330], dock: [ST(2)[0] + 175, ST(2)[1] - 70], tIn: L(6, 8.9), tHop: L(6, 10.0), tLoad: L(6, 10.7), tPark: L(6, 11.6), park: PR[0] },
    { kind: 'nad', key: 'n2', from: [1900, 880], dock: [ST(3)[0] + 175, ST(3)[1] - 60], tIn: L(7, 7.7), tHop: L(7, 8.7), tLoad: L(7, 9.3), tPark: L(7, 10.1), park: PR[1] },
    { kind: 'fad', key: 'f1', from: [60, 1150], dock: [ST(5)[0] - 185, ST(5)[1] - 85], tIn: L(9, 7.0), tHop: L(9, 8.7), tLoad: L(9, 9.4), tPark: L(9, 10.6), park: PLp[0] },
    { kind: 'nad', key: 'n3', from: [40, 260], dock: [ST(7)[0] - 185, ST(7)[1] - 60], tIn: L(10, 5.2), tHop: L(10, 7.3), tLoad: L(10, 8.0), tPark: L(10, 9.1), park: PLp[1] }
  ];
  function matrixBg(t, key) {
    ground(Z.matrix, t, { key, blob: Z.matrixBlob, rect: rectPts(-1800, -1900, W + 3600, H + 3800), x0: -500, y0: -600, sx: 2900, sy: 2300, n: 11 });
    const ink = mixCol(Z.matrix, PAL.ink, .2);
    [[[-460, 300], [210, 350]], [[2380, 230], [1760, 290]], [[-460, 1010], [210, 960]], [[2380, 1110], [1770, 1040]], [[1320, 1960], [1220, 1320]], [[-460, -260], [140, -200]], [[2380, -300], [1800, -230]]].forEach(([a, b], i) => {
      if (!inView(lerp(a[0], b[0], .5), lerp(a[1], b[1], .5), 420)) return;
      boilSeed('cr' + key + i);
      const m = [lerp(a[0], b[0], .55) + 30 * Math.sin(i * 1.7), lerp(a[1], b[1], .55) + 40 * Math.cos(i * 2.3)], P = through([a, m, b], 6);
      paint(ribbon(P, 92, 70), { wash: mixCol(Z.inner, Z.matrix, .5), ink: mixCol(Z.matrix, PAL.ink, .16), sw: .8, curv: .3 });
      paint(ellPts(b[0], b[1], 35, 35, 16), { wash: mixCol(Z.inner, Z.matrix, .5), ink: mixCol(Z.matrix, PAL.ink, .16), sw: .8 });
      paint(ribbon(P.slice(0, -2), 30, 22), { wash: mixCol(Z.matrix, Z.inner, .2), ink: null });
    });
    boilSeed('gran' + key);
    for (let i = 0; i < 40; i++) { const x = -400 + hash(i + 500) * 2800 + 8 * wob(t, .07, i), y = -600 + hash(i + 501) * 2300; if (inView(x, y, 10)) paint(ellPts(x, y, 7, 6, 8), { wash: Z.matrixDk, ink: null }); }
  }
  function shotC(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[C_END - dur, [930, 40, 1.7]], [L(4, 9.9), [930, 40, 1.7]], [L(5, -.5), [960, 425, 1.12]], [L(5, 7.4), [960, 425, 1.12]], [L(5, 8.3), [ST(1)[0], ST(1)[1] + 10, 1.9]],
      [L(6, .1), [ST(1)[0], ST(1)[1] + 10, 1.9]], [L(6, 1.1), [1150, 400, 1.6]], [L(6, 2.8), [1150, 400, 1.6]], [L(6, 3.9), [ST(2)[0], ST(2)[1], 1.9]], [L(6, 8.5), [ST(2)[0], ST(2)[1], 1.9]],
      [L(6, 9.4), [1360, 500, 1.4]], [L(6, 12.9), [1360, 500, 1.4]], [L(7, 1.0), [ST(3)[0], ST(3)[1], 1.9]], [L(7, 7.3), [ST(3)[0], ST(3)[1], 1.9]], [L(7, 8.1), [1360, 760, 1.4]],
      [L(7, 11.6), [1360, 760, 1.4]], [L(7, 13.3), [ST(4)[0] - 30, ST(4)[1] + 40, 1.6]], [L(8, 11.2), [ST(4)[0] - 30, ST(4)[1] + 40, 1.6]], [L(8, 12.3), [ST(5)[0], ST(5)[1] - 20, 1.9]],
      [L(9, 3.3), [ST(5)[0], ST(5)[1] - 20, 1.9]], [L(9, 4.4), [780, 640, 1.05]], [L(9, 6.4), [780, 640, 1.05]], [L(9, 7.3), [690, 860, 1.45]], [L(9, 10.0), [690, 860, 1.45]],
      [L(9, 11.0), [ST(6)[0], ST(6)[1], 1.9]], [L(10, 2.9), [ST(6)[0], ST(6)[1], 1.9]], [L(10, 4.0), [ST(7)[0], ST(7)[1], 1.9]], [L(10, 4.9), [ST(7)[0], ST(7)[1], 1.9]],
      [L(10, 5.7), [590, 500, 1.45]], [L(10, 9.8), [590, 500, 1.45]], [L(10, 10.9), [ST(0)[0], ST(0)[1], 1.9]], [L(11, .0), [ST(0)[0], ST(0)[1], 1.9]], [L(11, 1.2), [960, 630, 1.0]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .045), c[2]);
    matrixBg(t, 'c');
    // the wheel paints itself in, then its stations light up as the molecule reaches them
    const padAt = [L(5, -.6), L(5, 5.7), L(6, 3.6), L(7, .8), L(7, 13.1), L(8, 12.1), L(9, 10.8), L(10, 3.8)];
    const lapLight = i => near(t, L(11, 1.0) + i * .2, .25);
    const spin = t * .18 + .6 * Math.pow(seg(t, L(11, 6.4), L(11, 9.8)), 1) * 0 + 2.4 * ease(seg(t, L(11, 6.4), L(11, 9.8)));
    wheel(WC[0], WC[1], R, t, { key: 'c', w: 34, chev: 22, spin, draw: ease(seg(t, L(4, 10.3), L(5, -.3))), padR: 84, pads: i => popIn(t, padAt[i], .4) * (1 + .12 * lapLight(i)) });
    // the three steps still to go (L9): ghost rings on their stations
    [6, 7, 0].forEach((i, j) => { const p = ST(i); holdRing(p[0], p[1], 92, 66, near(t, L(9, 3.9) + j * .6, .35), Z.goldDk, 'tg' + i, 3); });
    const f = rideF(t), mp = molAtF(f), s = SC;
    // ---- PDH: pyruvate → CO₂ + acetyl, + CoA → acetyl-CoA (above the wheel) ----
    const PD = [930, 40];
    if (t < L(5, 4.5)) {
      const arr = easeOut(seg(t, C_END - dur, C_END - dur + 1.1)), down = ease(seg(t, L(4, 10.1), L(5, .2))), join = ease(seg(t, L(5, 3.4), L(5, 4.4)));
      let p = lerp2([700, 70], PD, arr); p = lerp2(p, [960, 230], down); p = lerp2(p, [ST(0)[0] + 40, ST(0)[1] - 10], join);
      const ps = 1.5 - (1.5 - SC) * down, bob = 5 * wob(t, .3);
      if (t < L(4, 3.2)) {
        const g = mol(M.pyruvate, p[0], p[1] + bob, ps, { key: 'pd', hi: i => i === 2 ? near(t, L(4, 2.3), .3) : 0 });
        ring(g.C[2][0] + 12, g.C[2][1], 42, 34, seg(t, L(4, 2.0), L(4, 2.8)), Z.goldDk, 'pdr');
      } else if (t < L(4, 7.7)) {
        mol([{ c: 'g' }, { c: 'g', keto: 1 }], p[0] - 17 * ps, p[1] + bob, ps, { key: 'pd', hi: i => near(t, L(4, 5.4) + i * .3, .25) });
        const k = seg(t, L(4, 6.5), L(4, 7.7));                       // coenzyme A swims in and hooks on
        if (k > 0) { const sp = arcPt([1360, 160], [p[0] + 34 * ps - 17 * ps + 2, p[1] + bob + 6], -80, easeOut(k)); coa(sp[0], sp[1], ps, .4 + .3 * (1 - k), t, 'pdcoa'); bead(sp[0], sp[1], 8.5 * ps, Z.S, 'pdS'); }
      } else {
        mol(M.acetyl, p[0] - 17 * ps, p[1] + bob, ps * (1 + .1 * pulseK(t, L(4, 7.7), .45) + .08 * pulseK(t, L(5, .3), .6)), { key: 'pd', t, hi: i => near(t, L(5, .4), .3) });
        if (t < L(4, 8.3)) { K.burst(p[0] + 30, p[1] + bob, 40, (t - L(4, 7.7)) / .6, PAL.ink, 'pdb'); K.sparkle(p[0] + 20, p[1] - 40, 34, (t - L(4, 7.7)) / .6, PAL.cream); }
      }
      if (t < L(4, 3.2) + .01 || true) co2Fly(t, L(4, 3.2), [PD[0] + 36 * 1.5, PD[1] + 6], 1.4, 'g', 'c0', { top: -420 });
      // oxaloacetate waits at its station
      if (t > L(5, -.4)) mol(M.oaa, ST(0)[0], ST(0)[1] + 4 * wob(t, .25), s * popIn(t, L(5, -.4), .4), { key: 'oaa', hi: i => near(t, L(5, 2.8) + i * .15, .2) });
    }
    // ---- the molecule riding the wheel ----
    if (t >= L(5, 4.5)) {
      const st = t, P = [mp[0], mp[1] + 4 * wob(t, .25)];
      let def, o = { key: 'cy', t };
      const at = (a) => st >= a;
      if (!at(L(6, 1.6))) { def = M.citrate; o.hi = i => near(t, L(5, 6.4) + i * .14, .2); }
      else if (!at(L(6, 2.4))) def = M.citrate.map((a, i) => i === 2 ? { c: 't', br: 't' } : a);
      else if (!at(L(6, 6.6))) { def = M.isocitrate; o.hiBr = () => near(t, L(6, 5.6), .35); }
      else if (!at(L(6, 10.7))) def = M.isoNoBr;
      else if (!at(L(7, 6.1))) { def = M.akg; o.hi = i => near(t, L(7, 1.6) + i * .14, .2) + (i === 4 ? near(t, L(7, 4.3), .35) : 0); }
      else if (!at(L(7, 11.7))) def = M.akgNoCx;
      else if (!at(L(8, 2.0))) { def = M.succCoA; o.hi = () => near(t, L(8, .5), .3); }
      else if (!at(L(9, 9.4))) { def = M.succinate; o.hi = i => near(t, L(9, 1.2) + i * .15, .2); }
      else if (!at(L(10, 2.1))) def = M.fumarate;
      else if (!at(L(10, 8.0))) def = M.malate;
      else if (!at(L(11, 5.4))) { def = M.oaa2; o.hi = i => near(t, L(11, 2.9) + i * .12, .2); }
      else if (!at(L(11, 6.4))) def = C2.citrate;
      else def = LAP2[clamp(Math.floor(f - 8 + .5), 0, 7) % 8];
      const g = mol(def, P[0], P[1], s * (1 + .08 * pulseK(t, L(5, 4.5), .5)), o);
      if (t < L(5, 5.1)) { K.burst(P[0], P[1], 70, seg(t, L(5, 4.5), L(5, 5.1)), PAL.ink, 'join'); }
      // L5: the three carboxyls, one, two, three
      if (def === M.citrate) {
        [[g.C[0], 0], [g.br[2].c, 1], [g.C[4], 2]].forEach(([q, j]) => {
          ring(q[0], q[1], 34 * s, 30 * s, seg(t, L(5, 8.5) + j * .5, L(5, 9.2) + j * .5), Z.goldDk, 'cx3' + j, 3);
          holdRing(q[0], q[1], 32 * s, 28 * s, seg(t, L(5, 8.8) + j * .5, L(5, 9.1) + j * .5) * (1 - seg(t, L(5, 12.3), L(5, 12.9))), Z.goldDk, 'cx3h' + j, 2.4);
        });
        if (t > L(5, 10.6) && t < L(5, 11.4)) for (let j = 0; j < 3; j++) K.sparkle(P[0] - 60 + j * 60, P[1] - 70, 26, (t - L(5, 10.6) - j * .1) / .7, PAL.cream);
      }
      // L6: the OH hops one carbon over (citrate → isocitrate)
      if (t >= L(6, 1.6) && t < L(6, 2.4)) {
        const gg = molGeo(M.citrate, P[0], P[1], s), gi = molGeo(M.isocitrate, P[0], P[1], s), k = ease(seg(t, L(6, 1.6), L(6, 2.4)));
        const q = arcPt(gg.side[2], gi.side[3], 60, k); bead(q[0], q[1], 9 * s, Z.O, 'ohO'); bead(q[0] + 8 * s, q[1] + 12 * s, 5.5 * s, Z.H, 'ohH');
      }
      // the carboxyl that will leave gets pointed at
      if (def === M.isocitrate) ring(g.br[2].c[0], g.br[2].c[1], 40 * s, 36 * s, seg(t, L(6, 5.3), L(6, 6.1)), Z.goldDk, 'brr');
      if (def === M.akg) ring(g.C[4][0] + 12 * s, g.C[4][1], 40 * s, 36 * s, seg(t, L(7, 4.0), L(7, 4.8)), Z.goldDk, 'akr');
      // L8: CoA lets go; the bond's energy becomes a phosphate on GDP → GTP, then passed to ADP → ATP
      if (t > L(8, 2.0) && t < L(8, 4.5)) {
        const k = seg(t, L(8, 2.0), L(8, 4.2)), sp = arcPt([P[0] + 90, P[1] + 10], [P[0] + 420, P[1] + 260], 120, easeIn(k));
        coa(sp[0], sp[1], s, .8 + k * 2, t, 'scoa'); bead(sp[0], sp[1], 8.5, Z.S, 'scS');
        if (k < .3) K.burst(P[0] + 60, P[1] + 10, 40, k / .3, PAL.ink, 'scb');
      }
      const bondP = [P[0] + 62, P[1] - 4], GDP = kf(t, [[L(8, 3.4), [700, 1220]], [L(8, 4.5), [900, 1095]], [L(8, 8.8), [900, 1095]], [L(8, 10.2), [600, 1290]]], easeOut);
      if (t > L(8, 2.9) && t < L(8, 5.7)) {                          // the spark of energy
        const k = seg(t, L(8, 5.0), L(8, 5.6)), sp = k > 0 ? arcPt(bondP, [GDP[0] + 75, GDP[1] + 6], -80, ease(k)) : [bondP[0], bondP[1] + 4 * Math.sin(t * 9)];
        boilSeed('spk'); paint(ellPts(sp[0], sp[1], 26, 26, 14), { wash: '#FFF0B8', washOp: 150, ink: null }); paint(starPts(sp[0], sp[1], 16 * (1 + .2 * Math.sin(t * 14)), .4, 4, t * 3), { wash: Z.gold2, ink: Z.goldDk, sw: .8 });
      }
      if (t > L(8, 3.4) && t < L(8, 10.2)) {
        const np = 2 + seg(t, L(8, 5.55), L(8, 5.9)) - ease(seg(t, L(8, 7.8), L(8, 7.9)));
        ntp(GDP[0], GDP[1], 1.5, 'G', np, 'gdp', { hi: near(t, L(8, 6.0), .3) });
        if (t > L(8, 5.6) && t < L(8, 6.2)) { K.burst(GDP[0] + 78, GDP[1] + 6, 46, (t - L(8, 5.6)) / .6, Z.goldDk, 'gtpb'); K.sparkle(GDP[0] + 40, GDP[1] - 40, 30, (t - L(8, 5.6)) / .6, PAL.cream); }
      }
      if (t > L(8, 6.8)) {                                            // ADP arrives, takes the phosphate: ATP, the only one made here
        const ADPp = kf(t, [[L(8, 6.8), [1420, 1290]], [L(8, 7.6), [1200, 1110]], [L(8, 10.6), [1200, 1110]], [L(8, 11.8), [PR[2][0] - 30, PR[2][1]]]], ease);
        const np = 2 + seg(t, L(8, 8.35), L(8, 8.5)), bob = 5 * Math.sin(t * 1.6);
        if (t > L(8, 7.8) && t < L(8, 8.4)) { const q = arcPt([GDP[0] + 75, GDP[1] + 6], [ADPp[0] + 75, ADPp[1] + 6], -70, ease(seg(t, L(8, 7.8), L(8, 8.4)))); bead(q[0], q[1], 12, Z.P, 'php'); }
        ntp(ADPp[0], ADPp[1] + bob, 1.5, 'A', np, 'atp', { hi: near(t, L(8, 8.6), .3) });
        holdRing(ADPp[0] + 10, ADPp[1] + bob, 120, 58, seg(t, L(8, 9.3), L(8, 9.7)) * (1 - seg(t, L(8, 10.6), L(8, 11.0))), Z.goldDk, 'atpR', 3);
        if (t > L(8, 8.4) && t < L(8, 9.0)) K.sparkle(ADPp[0] + 40, ADPp[1] - 40, 32, (t - L(8, 8.4)) / .6, Z.gold2);
      }
      // L9: two hydrogens go to FAD and a double bond appears (fumarate). L10: water joins (malate)
      if (def === M.fumarate && t < L(9, 10.0)) K.sparkle(P[0], P[1] - 30, 26, seg(t, L(9, 9.4), L(9, 10.0)), Z.gold2);
      if (t > L(10, .9) && t < L(10, 2.2)) { const q = arcPt([180, 1000], [P[0] - 10, P[1] + 30], 140, easeOut(seg(t, L(10, .9), L(10, 2.1)))); water(q[0], q[1], 1.1, 'wt', .4 * Math.sin(t * 2)); }
      if (t > L(10, 2.1) && t < L(10, 2.7)) K.burst(P[0], P[1] + 20, 50, (t - L(10, 2.1)) / .6, PAL.ink, 'wtb');
      if (t > L(10, 11.0) && t < L(10, 11.8)) for (let j = 0; j < 4; j++) K.sparkle(P[0] + Math.cos(j * 1.6) * 90, P[1] + Math.sin(j * 1.6) * 60, 28, seg(t, L(10, 11.0) + j * .1, L(10, 11.7) + j * .1), PAL.cream);
      // L11: a new acetyl-CoA drops in and joins
      if (t > L(11, 3.4) && t < L(11, 5.4)) { const q = arcPt([960, 120], [P[0] - 30, P[1] - 20], -40, easeIn(seg(t, L(11, 3.4), L(11, 5.4)))); mol([{ c: 'G' }, { c: 'G', coa: 1 }], q[0], q[1], s, { key: 'ac2', t }); }
      if (t > L(11, 5.4) && t < L(11, 6.0)) K.burst(P[0], P[1], 70, (t - L(11, 5.4)) / .6, PAL.ink, 'join2');
    }
    // CoA, freed when citrate forms, drifts off
    if (t > L(5, 4.5) && t < L(5, 7.5)) { const k = seg(t, L(5, 4.5), L(5, 7.5)), q = arcPt([ST(0)[0] + 60, ST(0)[1] - 20], [ST(0)[0] - 260, ST(0)[1] - 420], 60, easeIn(k)); coa(q[0], q[1], 1, -2.2 + k, t, 'fcoa'); bead(q[0], q[1], 8.5, Z.S, 'fcS'); }
    // the CO₂ that leave
    co2Fly(t, L(6, 6.6), (() => { const g = molGeo(M.isocitrate, ST(2)[0], ST(2)[1], SC); return g.br[2].c; })(), 1.3, 't', 'c1', { dx: 70 });
    co2Fly(t, L(7, 6.1), (() => { const g = molGeo(M.akg, ST(3)[0], ST(3)[1], SC); return [g.C[4][0] + 20, g.C[4][1]]; })(), 1.3, 't', 'c2', { dx: 70 });
    co2Fly(t, L(11, 7.5), molAtF(10.5), .8, 't', 'c3', { dx: 40 }); co2Fly(t, L(11, 7.9), molAtF(11.5), .8, 'g', 'c4', { dx: 40 });
    // the hydrogens' sources (where the H come off) and the shuttles' trips
    const src = [(() => { const g = molGeo(M.isoNoBr, ST(2)[0], ST(2)[1], SC); return g.side[3]; })(), (() => { const g = molGeo(M.akgNoCx, ST(3)[0], ST(3)[1], SC); return g.C[3]; })(),
      (() => { const g = molGeo(M.succinate, ST(5)[0], ST(5)[1], SC); return g.C[1]; })(), (() => { const g = molGeo(M.malate, ST(7)[0], ST(7)[1], SC); return g.side[2]; })()];
    TRIPS.forEach((e, i) => trip(t, { ...e, src: src[i], ringAt: i === 0 ? L(6, 11.6) : null }, 1.4));
    // the parked carriers bob where they wait; ATP waits with them (drawn above)
    camEnd();
    const hx = 230, hy = 980;
    host(hx, hy, 30, t, [[C_END - dur, 'calm', { lookX: .8, lookY: -.4 }], [L(4, 2.6), 'wow', { lookX: .8, lookY: -.5 }], [L(4, 5.0), 'calm', { lookX: .8, lookY: -.4 }],
      [L(4, 7.9), 'happy', { lookX: .8 }], [L(5, 3.0), 'calm', { lookX: .9, lookY: -.4 }], [L(5, 4.6), 'wow', { lookX: .8, lookY: -.5 }], [L(5, 10.7), 'idea', { lookX: .7, lookY: -.6 }],
      [L(6, 1.0), 'calm', { lookX: .9, lookY: -.4 }], [L(6, 6.8), 'wow', { lookX: .9, lookY: -.6 }], [L(6, 10.9), 'happy', { lookX: .9 }],
      [L(7, 1.2), 'calm', { lookX: .9, lookY: -.3 }], [L(7, 6.3), 'wow', { lookX: .9, lookY: -.6 }], [L(7, 9.5), 'excited'], [L(7, 11.9), 'calm', { lookX: .9 }],
      [L(8, 2.1), 'wow', { lookX: .9, lookY: -.2 }], [L(8, 5.8), 'happy', { lookX: .9 }], [L(8, 9.5), 'smug'],
      [L(9, .4), 'calm', { lookX: .9, lookY: -.3 }], [L(9, 3.8), 'idea', { lookX: .6, lookY: -.6 }], [L(9, 9.6), 'happy', { lookX: .6 }],
      [L(10, 2.2), 'wow', { lookX: .6, lookY: -.4 }], [L(10, 8.2), 'happy', { lookX: .6 }], [L(10, 11.3), 'laugh'],
      [L(11, 1.2), 'dizzy'], [L(11, 3.6), 'calm', { lookX: .8, lookY: -.5 }], [L(11, 5.6), 'excited']], { talk: true }, 'pc');
    if (lt < .5) flash(1 - lt / .5, PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E8DCC0', Z.board]);
  }


  // ================================ D: the tally (144.7–184.7) ================================
  const D_END = L(15, -1.0), WD = [620, 560];
  const LAP1 = [M.citrate, M.isocitrate, M.akg, M.succCoA, M.succinate, M.fumarate, M.malate, M.oaa2];
  const SLOT = { co2: [[1140, 240], [1330, 240]], nadh: [[1140, 440], [1350, 440], [1560, 440]], fadh: [[1140, 630]], atp: [[1170, 820]] };
  // one item of the tally: flies from the wheel to its slot, pops in, pulses when counted, shrinks away at k0
  function tallyItem(t, t0, from, to, draw, key, out) {
    if (t < t0) return; const k = seg(t, t0, t0 + .65), g = 1 - easeIn(seg(t, out, out + .45)); if (g <= .02) return;
    const p = arcPt(from, to, 120, ease(k)); push(); translate(p[0], p[1]); scale(lerp(.6, 1, ease(k)) * g); draw(0, 0); pop();
    if (k >= 1 && t < t0 + 1.15) K.burst(to[0], to[1], 50, (t - t0 - .65) / .5, PAL.ink, key + 'b');
  }
  function shotD(t, lt, dur) {
    K.setT(t);
    const secret = ease(seg(t, L(14, .1), L(14, 1.0)));
    const c = kf(t, [[C_END, [960, 540, 1.0]], [L(14, .1), [960, 540, 1.0]], [L(14, 1.0), [960, 560, 1.0]]], ease), whip = easeIn(seg(lt, dur - .35, dur));
    cam(c[0] + 5 * wob(t, .05) + 2400 * whip, c[1] + 4 * wob(t, .04), c[2]);
    ground(Z.board, t, { key: 'd', blob: Z.boardBlob, rect: rectPts(-1400, -1400, W + 5800, H + 2800), sx: W + 2400 });
    const out12 = L(13, -.3), gone13 = L(14, -.3);
    // L12: one wheel, what goes in and out of one turn
    const w1 = 1 - easeIn(seg(t, out12, out12 + .5));
    if (w1 > .02) {
      wheel(WD[0], WD[1], 235 * w1, t, { key: 'd1', w: 28 * w1, chev: 16, spin: t * .25, padR: 44 * w1, pads: () => 1, chevW: 2 });
      for (let j = 0; j < 2; j++) {                                    // two gold carbons in
        const k = ease(seg(t, L(12, 1.9) + j * .25, L(12, 2.7) + j * .25)); if (k <= 0) continue;
        const p = lerp2([WD[0] - 26 + j * 52, 90], [WD[0] - 26 + j * 52, WD[1] - 295], k);
        bead(p[0], p[1], 19 * w1, Z.gold, 'in' + j, near(t, L(12, 2.9) + j * .4, .2));
      }
      arrow(WD[0], 40, WD[0], WD[1] - 335, seg(t, L(12, 1.6), L(12, 2.3)) * w1, Z.gold, 'din', 10);
    }
    const from1 = [WD[0] + 220, WD[1] - 70];
    SLOT.co2.forEach((q, j) => tallyItem(t, L(12, 3.5) + j * .4, from1, q, (x, y) => co2(x, y, 1.8, 't', 'tc' + j, 0, near(t, L(12, 4.5) + j * .3, .2)), 'tc' + j, out12));
    SLOT.nadh.forEach((q, j) => tallyItem(t, L(12, 5.9) + j * .4, from1, q, (x, y) => shuttle(x, y, 1.8, 'nad', 1, t, 'tn' + j), 'tn' + j, out12 + .1 * j));
    tallyItem(t, L(12, 8.3), from1, SLOT.fadh[0], (x, y) => shuttle(x, y, 1.8, 'fad', 1, t, 'tf'), 'tf', out12 + .3);
    tallyItem(t, L(12, 10.3), from1, SLOT.atp[0], (x, y) => ntp(x, y, 2.0, 'A', 3, 'ta'), 'ta', out12 + .4);
    holdRing(SLOT.atp[0][0] + 14, SLOT.atp[0][1] + 8, 150, 72, seg(t, L(12, 11.3), L(12, 11.8)) * (1 - seg(t, out12, out12 + .3)), Z.goldDk, 'tar', 3.4);
    // L13: one glucose → two acetyl → two turns → six CO₂
    const g13 = 1 - easeIn(seg(t, gone13, gone13 + .5)), GLD = [270, 560];
    if (t > L(13, .1) && g13 > .02) {
      const split = seg(t, L(13, 1.2), L(13, 1.9)), into = seg(t, L(13, 3.4), L(13, 4.3));
      if (split <= 0) glucose(GLD[0], GLD[1], 1.5 * popIn(t, L(13, .1), .4), 'gd', { hi: i => near(t, L(13, .6) + i * .08, .15) });
      else for (let h = 0; h < 2; h++) {
        const p0 = [GLD[0], GLD[1] + (h ? 70 : -70) * ease(split)], tgt = [900 - 10, (h ? 790 : 330) - 150], p = lerp2(p0, tgt, ease(into));
        if (into >= 1) continue;
        const def = t < L(13, 2.2) ? [{ c: 'g' }, { c: 'g' }, { c: 'g' }] : [{ c: 'g' }, { c: 'g' }];
        mol(def, p[0] - (def.length === 3 ? 0 : 17), p[1], 1.45 * g13, { key: 'ga' + h });
      }
      if (split > 0 && split < 1) K.burst(GLD[0], GLD[1], 60, split, PAL.ink, 'gdb');
    }
    const w2 = popIn(t, L(13, 3.0), .5) * g13;
    if (w2 > .02) [330, 790].forEach((y, h) => {
      const sp = t * .25 + 2.2 * ease(seg(t, L(13, 4.3), L(13, 5.8)));
      wheel(880, y, 155 * w2, t, { key: 'd2' + h, w: 20 * w2, chev: 12, spin: sp, padR: 28 * w2, pads: () => 1, chevW: 1.6 });
    });
    // the six CO₂: two from making acetyl, four from the two turns, into a row, counted
    if (t > L(13, 2.0) && g13 > .02) for (let j = 0; j < 6; j++) {
      const t0 = j < 2 ? L(13, 2.0) + j * .2 : L(13, 5.6) + (j - 2) * .25, from = j < 2 ? [GLD[0], GLD[1] + (j ? 70 : -70)] : [1020, (j < 4 ? 330 : 790) - 40];
      if (t < t0) continue;
      const mid = j < 2 ? [GLD[0] + 120, GLD[1] + (j ? 60 : -180)] : [from[0] + 120, from[1] - 60], fin = [1170 + j * 120, 560];
      const k1 = ease(seg(t, t0, t0 + .5)), k2 = ease(seg(t, L(13, 6.2) + j * .08, L(13, 7.0) + j * .08));
      const p = lerp2(lerp2(from, mid, k1), fin, k2);
      co2(p[0], p[1], 1.45 * g13, 'g', 'six' + j, .3 * (1 - k2) * Math.sin(t + j), near(t, L(13, 7.4) + j * .22, .18));
    }
    // L14: the secret. A big wheel, one lap in the film's colours: the two that leave are teal; the gold stay
    if (secret > .02) {
      const WB = [880, 560], RB = 330 * secret, fD = kf(t, [[L(14, 2.4), 1], [L(14, 3.3), 2], [L(14, 4.3), 3], [L(14, 5.1), 4], [L(14, 6.4), 4], [L(14, 7.8), 8], [L(14, 8.8), 8], [L(14, 9.6), 10], [L(14, 10.5), 11], [L(14, 11.2), 12]], ease);
      wheel(WB[0], WB[1], RB, t, { key: 'd3', w: 32 * secret, chev: 18, spin: t * .2, padR: 72 * secret, pads: () => 1 });
      const idx = Math.floor(fD + .5), def = fD < 7.9 ? LAP1[idx % 8] : t < L(14, 8.4) ? M.oaa2 : LAP2[idx % 8], p = rideAt(WB[0], WB[1], RB, fD);
      const g = mol(def, p[0], p[1] + 4 * wob(t, .25), 1.35 * secret, { key: 'sc', t, hi: i => def[i] && (def[i].c === 'g' || def[i].c === 'G') ? near(t, L(14, 5.3), .5) + near(t, L(14, 6.0), .5) : 0 });
      if (t > L(14, 5.0) && t < L(14, 8.0)) holdRing(p[0] - 30, p[1] - 6, 70, 46, seg(t, L(14, 5.0), L(14, 5.4)) * (1 - seg(t, L(14, 7.4), L(14, 8.0))), Z.goldDk, 'gp', 3);
      if (t > L(14, 7.9) && t < L(14, 8.8)) { const q = arcPt([WB[0], WB[1] - RB - 260], [p[0] - 30, p[1] - 20], -40, easeIn(seg(t, L(14, 7.9), L(14, 8.6)))); mol([{ c: 'G' }, { c: 'G', coa: 1 }], q[0], q[1], 1.35, { key: 'nac', t }); }
      if (t > L(14, 8.6) && t < L(14, 9.2)) K.burst(p[0], p[1], 70, (t - L(14, 8.6)) / .6, PAL.ink, 'dj');
      const lv = (f0) => rideAt(WB[0], WB[1], RB, f0);
      co2Fly(t, L(14, 2.9), lv(2.5), 1.3, 't', 'dt1', { top: -500 }); co2Fly(t, L(14, 3.9), lv(3.5), 1.3, 't', 'dt2', { top: -500 });
      co2Fly(t, L(14, 10.1), lv(11.5), 1.3, 'g', 'dt3', { top: -500, hi: near(t, L(14, 10.5), .3) });
      if (t > L(14, 10.1) && t < L(14, 10.9)) for (let j = 0; j < 3; j++) K.sparkle(lv(11.5)[0] + 40 + j * 30, lv(11.5)[1] - 60 - j * 30, 26, (t - L(14, 10.1) - j * .1) / .7, Z.gold2);
    }
    camEnd();
    host(1730, 990, 32, t, [[C_END, 'calm', { lookX: .8 }], [L(12, 2.6), 'happy', { lookX: .9 }], [L(12, 6.0), 'smug'], [L(12, 11.6), 'confused', { lookX: .6, lookY: -.3 }],
      [L(13, 1.4), 'wow', { lookX: .9 }], [L(13, 4.4), 'excited'], [L(13, 8.0), 'wow', { lookX: .9, lookY: -.6 }], [L(14, 1.0), 'wink'], [L(14, 3.4), 'calm', { lookX: .9, lookY: -.6 }],
      [L(14, 5.4), 'wow', { lookX: .9, lookY: -.4 }], [L(14, 10.4), 'idea', { lookX: .9, lookY: -.6 }], [L(14, 11.8), 'laugh']], { talk: true, flip: true }, 'pd');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E8DCC0', Z.board]);
    if (whip > 0) speedLines(whip, 'dw');
  }
  function speedLines(k, key, dir = -1) {                        // pale speed lines for a whip pan
    if (k <= 0) return; boilSeed('sl' + key);
    for (let i = 0; i < 14; i++) {
      const y = 60 + hash(i + 80) * 960, len = 300 + 500 * hash(i + 81), x = hash(i + 82) * W;
      paint(ribbon([[x, y], [x + dir * len * k, y + 4]], 8 * k, 1), { wash: PAL.cream, washOp: 220 * Math.sin(Math.min(1, k) * Math.PI) + 30, ink: null });
    }
  }

  // ================================ E: the inner membrane (184.7–224.7) ================================
  const E_END = L(18, -1.0), MY = 470, CX = { I: 430, II: 760, III: 1040, IV: 1340, S: 1720 };
  const membrane = (x0, x1, t) => {                              // a bilayer, cheap: tails as one band, heads as washes, outlined by two scalloped lines
    x0 = Math.floor(x0 / 22) * 22; boilSeed('mem');
    const yAt = x => MY + 6 * Math.sin(x * .004 + t * .4), P = [];
    for (let x = x0; x <= x1; x += 40) P.push([x, yAt(x)]);
    paint(ribbon(P, 70, 70), { wash: mixCol(K.C.tail, PAL.cream, .2), ink: null });
    for (const sd of [-1, 1]) {
      const top = []; boilSeed('memh' + sd);
      for (let x = x0; x <= x1; x += 22) { const y = yAt(x) + sd * 34; paint(ellPts(x, y, 11, 10, 8), { wash: mixCol(K.C.phos, PAL.cream, .15), ink: null }); top.push([x - 11, y + sd * 2], [x, y + sd * 11], [x + 11, y + sd * 2]); }
      inkLine(top, .9, mixCol(K.C.phos, PAL.ink, .5), 'inkfine', .3);
    }
  };
  function complexes(t, glow) {                                     // the respiratory chain and ATP synthase, sitting in the membrane
    const lit = k => mixCol(PAL.cream, '#FFF1B8', k);
    boilSeed('cI'); paint(rrPts(CX.I - 110, MY - 60, 210, 120, 40, 2), { wash: mixCol(Z.cI, lit(1), .4 * glow.I), ink: PAL.ink, sw: 1.1 });
    paint(ribbon([[CX.I + 40, MY + 40], [CX.I + 60, MY + 140], [CX.I + 75, MY + 210]], 70, 80), { wash: mixCol(Z.cI, lit(1), .4 * glow.I), ink: PAL.ink, sw: 1.1 });
    boilSeed('cII'); paint(bumpy(CX.II, MY + 50, 48, 70, 24, .05, 4), { wash: mixCol(Z.cII, lit(1), .4 * glow.II), ink: PAL.ink, sw: 1 });
    boilSeed('cIII'); paint(bumpy(CX.III, MY, 80, 92, 28, .05, 5), { wash: mixCol(Z.cIII, lit(1), .4 * glow.III), ink: PAL.ink, sw: 1.1 });
    inkLine([[CX.III, MY - 80], [CX.III, MY + 82]], .8, mixCol(Z.cIII, PAL.ink, .5), 'inkfine', .2);
    boilSeed('cIV'); paint(bumpy(CX.IV, MY + 4, 70, 88, 28, .05, 4), { wash: mixCol(Z.cIV, lit(1), .4 * glow.IV), ink: PAL.ink, sw: 1.1 });
    // ATP synthase: the F0 ring in the membrane, the stalk, the F1 head turning in the matrix
    const rot = glow.rot;
    boilSeed('syn'); paint(rrPts(CX.S - 80, MY - 44, 160, 88, 30, 2), { wash: Z.synth, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 6; i++) { const x = CX.S - 70 + frac(i / 6 + rot) * 140; inkLine([[x, MY - 36], [x, MY + 36]], 1.1, Z.synthDk, 'inkfine', 0); }
    paint(rrPts(CX.S - 14, MY + 40, 28, 110, 10), { wash: Z.synthDk, ink: PAL.ink, sw: .9 });
    paint(rrPts(CX.S + 70, MY + 30, 22, 170, 10), { wash: mixCol(Z.synth, PAL.cream, .3), ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rot * TAU, x = CX.S + Math.cos(a) * 52, y = MY + 210 + Math.sin(a) * 40; paint(ellPts(x, y, 38, 34, 14), { wash: i % 2 ? Z.synth : mixCol(Z.synth, '#E27A92', .35), ink: PAL.ink, sw: .9 }); }
    paint(ellPts(CX.S, MY + 210, 22, 20, 12), { wash: Z.synthDk, ink: PAL.ink, sw: .8 });
  }
  const hplus = (x, y, s, key) => { bead(x, y, 7 * s, PAL.cream, key, 0, .7); boilSeed('hp' + key); inkLine([[x - 3.5 * s, y], [x + 3.5 * s, y]], 1.1 * s, Z.nadh, 'inkfine', 0); inkLine([[x, y - 3.5 * s], [x, y + 3.5 * s]], 1.1 * s, Z.nadh, 'inkfine', 0); };
  const spark = (x, y, s, key, t) => { boilSeed('sp' + key); paint(ellPts(x, y, 15 * s, 15 * s, 12), { wash: '#FFF0B8', washOp: 150, ink: null }); paint(starPts(x, y, 13 * s * (1 + .2 * Math.sin(t * 13 + key.length)), .4, 4, t * 3), { wash: Z.gold2, ink: Z.goldDk, sw: .8 }); };
  // the flow of the chain: 1 while oxygen is there; it stalls when oxygen is gone and restarts when it's back
  const flowAt = t => 1 - ease(seg(t, L(17, 5.2), L(17, 7.0))) + ease(seg(t, L(17, 11.8), L(17, 12.8)));
  function flowPhase(t) { let ph = 0; for (let u = L(15, -1.0); u < t; u += 1 / 48) ph += flowAt(u) / 48; return ph; }
  function shotE(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[D_END, [960, 820, 1.15]], [L(15, 8.6), [960, 820, 1.15]], [L(15, 9.8), [820, 560, .98]], [L(16, -.2), [820, 560, .98]], [L(16, .6), [620, 540, 1.2]],
      [L(16, 1.6), [620, 540, 1.2]], [L(16, 4.6), [1180, 520, 1.2]], [L(16, 6.4), [1180, 520, 1.2]], [L(16, 7.4), [1660, 580, 1.15]], [L(16, 8.6), [1660, 580, 1.15]], [L(16, 10.0), [1100, 580, .72]],
      [L(17, -.2), [1100, 580, .72]], [L(17, 1.2), [920, 700, .9]]], ease), whip = 1 - easeOut(seg(lt, 0, .45));
    cam(c[0] + 5 * wob(t, .05) - 2400 * whip, c[1] + 4 * wob(t, .04), c[2]);
    const vx0 = c[0] - 2400 * whip - 960 / c[2] - 60, vx1 = c[0] - 2400 * whip + 960 / c[2] + 60;
    ground(Z.matrix, t, { key: 'e', blob: Z.matrixBlob, rect: rectPts(-3600, -1400, 7800, 3200), x0: -1500, sx: 4200, n: 8 });
    boilSeed('ims'); const imsR = clipRect(-3600, -1600, 4200, MY); if (imsR) paintFull(imsR, { wash: Z.ims, ink: null });
    for (let i = 0; i < 5; i++) { const bx = -400 + i * 700 + 60 * wob(t, .03, i), by = MY - 260 + 40 * hash(i + 4); if (!inView(bx, by, 360)) continue; boilSeed('imsb' + i); paintFull(ellPts(bx, by, 360, 120, 18, 8), { wash: Z.imsBlob, washOp: 110, ink: null }); }
    membrane(vx0, vx1, t);
    // ---- the chain at work: electrons hop I → Q → III → cyt c → IV, protons pumped up, O₂ → water, ATP out ----
    const ph = flowPhase(t), fl = flowAt(t), run = t > L(16, .9) ? ph - flowPhase(L(16, .9)) : -1;
    const cyc = run < 0 ? -1 : run % 4.4, n = run < 0 ? -1 : Math.floor(run / 4.4);   // one electron pair's trip takes 4.4 s of flow
    const inI = cyc >= 0 && cyc < .9, inQ = cyc >= .9 && cyc < 1.9, inIII = cyc >= 1.9 && cyc < 2.4, inC = cyc >= 2.4 && cyc < 3.4, inIV = cyc >= 3.4;
    const syn = t > L(16, 6.8) ? ph - flowPhase(L(16, 6.8)) : 0;
    complexes(t, { I: inI ? 1 : 0, II: 0, III: inIII ? 1 : 0, IV: inIV ? 1 : 0, rot: syn * .9 });
    // Q in the membrane and cytochrome c on the outside, ferrying
    const qx = inQ ? lerp(CX.I + 60, CX.III - 60, ease((cyc - .9) / 1)) : cyc >= 1.9 && cyc < 3.4 ? CX.III - 60 + 0 * cyc : CX.I + 60;
    bead(qx, MY + 4, 13, Z.Q, 'Q');
    const cx_ = inC ? lerp(CX.III + 40, CX.IV - 40, ease((cyc - 2.4) / 1)) : cyc >= 3.4 ? CX.IV - 40 : CX.III + 40;
    bead(cx_, MY - 92, 15, Z.cytc, 'cytc');
    if (cyc >= 0 && t < L(17, 12.9)) {                                // the electron pair itself
      const ep = inI ? lerp2([CX.I + 70, MY + 200], [CX.I + 40, MY], ease(cyc / .9)) : inQ ? [qx, MY + 4] : inIII ? [CX.III, MY - 40 * ease((cyc - 1.9) / .5)] : inC ? [cx_, MY - 92] : lerp2([CX.IV - 40, MY - 60], [CX.IV, MY + 70], ease((cyc - 3.4) / 1));
      const stuck = 1 - fl;
      spark(ep[0] - 11 + 4 * stuck * Math.sin(t * 20), ep[1] - 5, 1.4, 'e1', t); spark(ep[0] + 11, ep[1] + 6, 1.4, 'e2', t + .3);
    }
    // protons: a crowd above the membrane (the gradient), more pumped up as the electrons pass, flowing back down through the synthase
    for (let i = 0; i < 16; i++) { const x = 300 + hash(i + 200) * 1600 + 20 * wob(t, .1, i), y = MY - 120 - hash(i + 201) * 260 + 14 * wob(t, .13, i * 2); if (x < vx0 || x > vx1) continue; hplus(x, y, 1.2, 'hb' + i); }
    if (n >= 0) [[CX.I, .2], [CX.III, 2.0], [CX.IV, 3.5]].forEach(([x, c0], j) => {
      for (let k = 0; k < 2; k++) { const q = (cyc - c0 - k * .15) / .9; if (q <= 0 || q >= 1) continue; const y = lerp(MY + 140, MY - 150, ease(q)); hplus(x - 16 + k * 32, y, 1.2, 'hpu' + j + k); }
    });
    if (syn > 0) for (let i = 0; i < 4; i++) { const q = frac(syn * .8 + i / 4); hplus(CX.S - 30 + 60 * hash(i + 300), lerp(MY - 130, MY + 60, q), 1.2, 'hsy' + i); }
    if (syn > 0) for (let i = 0; i < 9; i++) {                     // ATP out of F1, one after another
      const born = i * .55, a = frac((syn - born) / 4.95) * 4.95; if (syn < born || a > 3.0) continue;
      const p = [CX.S + 30 + a * 90 + 30 * Math.sin(i), MY + 280 + a * 70 - 40 * Math.sin(a * 1.4)];
      ntp(p[0], p[1], 1.0 * popIn(syn, born, .3), 'A', 3, 'sa' + i);
    }
    // oxygen: O₂ waits at complex IV's matrix side; it takes the electrons and becomes water. Gone in L17, then back
    const o2k = (1 - easeIn(seg(t, L(17, 4.6), L(17, 5.4)))) + popIn(t, L(17, 11.8), .5);
    for (let i = 0; i < 3; i++) { const k = Math.min(1, o2k); if (k <= .02) continue; const p = [CX.IV - 110 + i * 100 + 12 * wob(t, .2, i), MY + 200 + 30 * hash(i + 5) + 10 * wob(t, .15, i)]; push(); translate(p[0], p[1]); scale(k); o2(0, 0, 1.3, 'ox' + i, .3 * Math.sin(t + i)); pop(); }
    if (n >= 0 && fl > .5) { const q = (cyc - 3.9) / .5; if (q > 0 && q < 1) K.burst(CX.IV, MY + 120, 50, q, PAL.ink, 'o2b'); }
    if (n >= 0) for (let w = 0; w < 4; w++) { const m = n - w; if (m < 0) continue; const a = run - (m * 4.4 + 4.3); if (a < 0 || a > 4) continue; [0, 1].forEach(j => water(CX.IV - 40 + j * 80 + a * 30 * (j ? 1 : -1), MY + 150 + a * 90, 1.3, 'w' + w + j, .3 * Math.sin(a))); }
    // ---- the carriers (L15): a crowd of loaded NADH/FADH₂ and one lonely ATP; they swim up and dock ----
    const up = ease(seg(t, L(15, 8.8), L(15, 11.6)));
    const crowd = [['nad', [1020, 830], [CX.I + 80, MY + 300]], ['nad', [1170, 880], [CX.I + 180, MY + 360]], ['nad', [1320, 830], [CX.I + 300, MY + 330]], ['fad', [1170, 760], [CX.II + 10, MY + 170]]];
    crowd.forEach(([kind, a, b], i) => {
      let p = lerp2(a, b, up);
      let load = 1;
      if (i === 0 && t > L(16, .2)) {                                  // the first NADH docks, hands over its electrons, leaves as NAD⁺
        const dk = ease(seg(t, L(16, -.4), L(16, .3))), lv = ease(seg(t, L(16, 1.3), L(16, 3.4)));
        p = lerp2(lerp2(b, [CX.I + 80, MY + 250], dk), [CX.I - 160, MY + 620], lv); load = t < L(16, 1.0) ? 1 : 0;
      }
      if (i > 0 && t > L(17, -.5)) return;                             // later the conveyor takes over
      if (i === 0 && t > L(16, 3.4)) return;
      shuttle(p[0], p[1] + 6 * Math.sin(t * 1.7 + i), 1.4 * (1 + .12 * near(t, L(15, 4.0) + i * .4, .25)), kind, load, t, 'ec' + i);
      if (t > L(15, 4.0) + i * .4 && t < L(15, 5.0) + i * .4) K.sparkle(p[0] + 30, p[1] - 50, 30, (t - L(15, 4.0) - i * .4), Z.gold2);
    });
    if (t < L(16, 1.0)) { const p = [640, 870]; ntp(p[0], p[1] + 5 * Math.sin(t * 1.5), 1.5 * (1 - easeIn(seg(t, L(15, 9), L(15, 9.6)))), 'A', 3, 'lone'); ring(p[0] + 10, p[1], 100, 50, seg(t, L(15, .6), L(15, 1.5)), Z.goldDk, 'lone'); }
    // ---- L17: the little wheel in the matrix, fed by a conveyor of NAD shuttles to and from complex I ----
    const wk = popIn(t, L(17, .4), .5);
    if (wk > .02) {
      const WE = [900, 980], wsp = flowPhase(t) * .25;
      wheel(WE[0], WE[1], 120 * wk, t, { key: 'we', w: 20 * wk, chev: 10, spin: wsp, padR: 24 * wk, pads: () => 1, chevW: 1.6 });
      if (t > L(17, 11.0) && t < L(17, 11.6)) K.burst(WE[0], WE[1], 150, (t - L(17, 11.0)) / .6, PAL.ink, 'clunk');
      const loop = s => { const a = s * TAU + .6; return [700 + Math.cos(a) * 330, 830 + Math.sin(a) * 150]; };   // up the left to complex I loaded, back down the right empty
      for (let i = 0; i < 7; i++) {
        const s0 = frac(i / 7 + ph * .09), p = loop(s0), toI = s0 > .5;      // loaded on the way up to complex I, empty on the way back
        const jam = 1 - fl, stuckP = loop(.75 + .03 * (i - 3)), gone = !toI ? ease(seg(t, L(17, 7.6), L(17, 9.0))) * (1 - ease(seg(t, L(17, 11.8), L(17, 12.6)))) : 0;
        const q = toI ? lerp2(p, [stuckP[0] + 30 * Math.sin(t * 3 + i) * jam, stuckP[1]], jam * .8) : p;
        if (gone > .98) continue;
        push(); translate(q[0], q[1]); scale(wk * (1 - gone)); shuttle(0, 0, 1.15, 'nad', toI ? 1 : 0, t, 'cv' + i, { rot: .1 * Math.sin(t + i) }); pop();
      }
    }
    // the cold when the oxygen is gone
    const chill = ease(seg(t, L(17, 4.8), L(17, 6.2))) * (1 - ease(seg(t, L(17, 11.8), L(17, 12.8))));
    if (chill > .01) { boilSeed('chill'); paintFull(viewRect(), { wash: Z.chill, washOp: 95 * chill, ink: null }); }
    camEnd();
    host(230, 985, 31, t, [[D_END, 'calm', { lookX: .8 }], [L(15, .6), 'confused', { lookX: .8, lookY: -.2 }], [L(15, 5.0), 'wow', { lookX: .9 }], [L(15, 9.0), 'calm', { lookX: .8, lookY: -.7 }],
      [L(16, 1.0), 'wow', { lookX: .8, lookY: -.6 }], [L(16, 5.4), 'happy', { lookX: .8 }], [L(16, 7.8), 'excited'], [L(17, .8), 'calm', { lookX: .8, lookY: -.2 }], [L(17, 2.6), 'idea', { lookX: .6 }],
      [L(17, 5.0), 'worried', { lookX: .7 }], [L(17, 9.6), 'sad'], [L(17, 12.3), 'happy', { lookX: .8 }]], { talk: true }, 'pe');
    if (whip > 0) speedLines(whip, 'ew', -1);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#C9A877', Z.sepia]);
  }

  // ================================ F: 1937, then the hub (224.7–248.4) ================================
  const F_END = L(20, -1.3), HUB_AT = L(19, 5.3);
  function pigeon(x, y, s, t, fly, key) {                          // a pigeon: grey body, a darker wing (flapping while it flies)
    boilSeed('pg' + key);
    const flap = fly ? Math.sin(t * 16) : 0, bob = fly ? 0 : 2 * Math.sin(t * 5);
    push(); translate(x, y + bob); scale(s);
    paint([[-58, 2], [-86, -8], [-90, 10], [-60, 16]], { wash: Z.pigeonDk, ink: PAL.ink, sw: .9 });   // tail
    paint(ellPts(-6, 0, 56, 34, 22, 0, -.12), { wash: Z.pigeon, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(36, -28, 22, 20, 16), { wash: Z.pigeon, ink: PAL.ink, sw: 1 });
    paint(ellPts(30, -10, 18, 10, 12, 0, -.5), { wash: '#9BC2B0', ink: null });                     // the green-violet neck sheen
    paint([[56, -30], [72, -24], [56, -20]], { wash: '#E2A23A', ink: PAL.ink, sw: .7 });
    paint(ellPts(42, -32, 4, 4, 8), { wash: PAL.ink, ink: null });
    paint(ribbon([[-14, -8], [-30 - 6 * flap, -40 - 40 * flap], [-54, -50 - 50 * flap]], 26, 10), { wash: Z.pigeonDk, ink: PAL.ink, sw: .9 });
    if (!fly) { inkLine([[-4, 32], [-6, 46]], 2, '#C76B5A', 'ink', 0); inkLine([[10, 32], [12, 46]], 2, '#C76B5A', 'ink', 0); }
    pop();
  }
  function paper(x, y, w, h, key, o = {}) {                         // a manuscript: a sheet with squiggled lines (no letters), the cycle sketched on it
    boilSeed('pp' + key);
    paint(rrPts(x - w / 2, y - h / 2, w, h, 6, 1.5), { wash: '#FBF4E2', ink: Z.sepiaInk, sw: 1 });
    if (h > 80) for (let i = 0; i < 6; i++) { const yy = y - h / 2 + 30 + i * (h - 60) / 5; if (i === 2 || i === 3) continue; inkLine([[x - w / 2 + 24, yy], [x - w / 2 + 70, yy + 3], [x + w / 2 - 30 - 30 * hash(i), yy - 2]], .9, mixCol(Z.sepiaInk, '#FBF4E2', .3), 'inkfine', .6); }
    if (o.circle && h > 80) { const P = ellPts(x, y + 6, w * .2, w * .2, 20); inkLine(P.concat([P[0]]), 1.2, Z.sepiaInk, 'ink', .5); }
  }
  function envelope(x, y, w, h, key) {
    boilSeed('en' + key);
    paint(rrPts(x - w / 2, y - h / 2, w, h, 6, 1.5), { wash: '#F3E2C0', ink: Z.sepiaInk, sw: 1.1 });
    inkLine([[x - w / 2 + 4, y - h / 2 + 4], [x, y + h * .1], [x + w / 2 - 4, y - h / 2 + 4]], 1.1, Z.sepiaInk, 'ink', 0);
  }
  function shotF(t, lt, dur) {
    K.setT(t);
    const hub = t >= HUB_AT, push_ = easeIn(seg(t, L(19, 4.4), HUB_AT)), MED = [1300, 380];
    if (!hub) {
      cam(lerp(960, MED[0], push_) + 5 * wob(t, .05), lerp(600, MED[1], push_) + 4 * wob(t, .04), lerp(1.2, 3.4, push_));
      ground(Z.sepia, t, { key: 'f', blob: Z.sepiaBlob });
      boilSeed('bench'); const bn = clipRect(-600, 860, W + 600, 1460); if (bn) paint(bn, { wash: Z.bench, ink: null });
      inkLine([[-100, 862], [W + 100, 862]], 1.5, Z.benchDk, 'ink', 0); for (let i = 0; i < 4; i++) inkLine([[-50 + i * 520, 920 + 40 * hash(i)], [380 + i * 520, 930 + 40 * hash(i + 2)]], .9, Z.benchDk, 'inkfine', .5);
      // the pigeon lands
      const fl = seg(t, L(18, .1), L(18, 1.7)), pg = arcPt([-100, 160], [400, 806], -220, easeOut(fl));
      if (fl > 0) pigeon(pg[0], pg[1], 1.5, t, fl < 1, 'p');
      // a dish of minced breast muscle; a flask bubbling, a U-tube beside it
      const dk = easeOut(seg(t, L(18, 2.1), L(18, 2.8)));
      if (dk > 0) {
        const dx = lerp(-300, 690, dk); boilSeed('dish');
        paint(ellPts(dx, 842, 150, 32, 24), { wash: '#F4EDE0', ink: Z.sepiaInk, sw: 1 });
        for (let i = 0; i < 11; i++) paint(ellPts(dx - 100 + hash(i + 40) * 200, 834 + (hash(i + 41) - .5) * 22, 19 + 7 * hash(i + 42), 11, 10), { wash: mixCol(Z.meat, '#C96B66', hash(i + 43) * .5), ink: mixCol(Z.meat, PAL.ink, .4), sw: .5 });
      }
      const fk = popIn(t, L(18, 2.5), .45);
      if (fk > .02) {
        push(); translate(990, 862); scale(fk * 1.25); boilSeed('flask');
        paint(ellPts(0, -70, 70, 64, 24), { wash: '#EAF0EC', ink: Z.sepiaInk, sw: 1.1 }); paint(rrPts(-16, -200, 32, 80, 6), { wash: '#EAF0EC', ink: Z.sepiaInk, sw: 1 });
        paint(ellPts(0, -50, 60, 40, 20), { wash: '#E9B3A8', ink: null });
        for (let i = 0; i < 5; i++) { const q = frac(t * .6 + i / 5); paint(ellPts(-20 + 40 * hash(i + 60), -40 - q * 90, 5, 5, 8), { wash: PAL.cream, ink: Z.sepiaInk, sw: .5 }); }
        inkLine([[60, -110], [130, -110], [130, -20], [180, -20], [180, -200]], 2.2, Z.sepiaInk, 'ink', 0);
        const lv = 10 * Math.sin(t * 1.3); inkLine([[130, -60 + lv], [130, -20]], 5, '#C96B66', 'ink', 0); inkLine([[180, -60 - lv], [180, -20]], 5, '#C96B66', 'ink', 0);
        pop();
      }
      // the circle, pieced together; then a manuscript, an envelope, off to the journal — and back, rejected
      const CD = [830, 380], RC = 175, toPaper = ease(seg(t, L(18, 5.9), L(18, 6.6))), fold = ease(seg(t, L(18, 6.7), L(18, 7.3)));
      if (t > L(18, 4.0) && toPaper < 1) {
        const ctr = lerp2(CD, MED, toPaper), r = RC * lerp(1, .22, toPaper);
        for (let i = 0; i < 8; i++) {
          const k = easeOut(seg(t, L(18, 4.0) + i * .14, L(18, 4.6) + i * .14)); if (k <= 0) continue;
          const a0 = -Math.PI / 2 + i * TAU / 8 + .04, a1 = a0 + TAU / 8 - .08, am = (a0 + a1) / 2, off = [Math.cos(am) * 900 * (1 - k), Math.sin(am) * 650 * (1 - k)], P = [];
          for (let j = 0; j <= 6; j++) { const a = lerp(a0, a1, j / 6); P.push([ctr[0] + Math.cos(a) * r + off[0], ctr[1] + Math.sin(a) * r + off[1]]); }
          const w = 22 * lerp(1, .3, toPaper); boilSeed('arc' + i); paint(ribbon(P, w, w), { wash: Z.pads[i], ink: Z.sepiaInk, sw: .9 });
        }
        if (t > L(18, 5.6) && t < L(18, 6.3)) for (let j = 0; j < 4; j++) K.sparkle(CD[0] + Math.cos(j * 1.6) * 190, CD[1] + Math.sin(j * 1.6) * 170, 34, (t - L(18, 5.6) - j * .08) / .6, PAL.cream);
      }
      const away = seg(t, L(18, 7.3), L(18, 8.0)), back = seg(t, L(18, 8.3), L(18, 9.0)), riffle = seg(t, L(19, .2), L(19, 2.2));
      if (toPaper > 0 && riffle < 1) {
        const ex = MED[0] + 1100 * easeIn(away) * (1 - easeOut(back)), ey = MED[1] - 200 * Math.sin(away * Math.PI * .5) * (1 - back) + 30 * spring(t, L(18, 9.1), 6, 18);
        const sc = (1 - easeIn(riffle * 1.4 > 1 ? 1 : riffle * 1.4)) * popIn(t, L(18, 5.9), .4);
        if (sc > .02) {
          push(); translate(ex, ey); rotate(.15 * Math.sin(away * Math.PI)); scale(sc);
          if (fold < 1) paper(0, 0, 250, lerp(330, 160, fold), 'ms', { circle: fold < .3 }); else envelope(0, 0, 260, 160, 'en');
          pop();
          if (t > L(18, 9.05)) K.cross(ex, ey, 170 * sc, seg(t, L(18, 9.05), L(18, 9.4)), 'rej');
          if (t > L(18, 9.05) && t < L(18, 9.6)) K.burst(ex, ey, 120, (t - L(18, 9.05)) / .55, PAL.ink, 'rejb');
        }
      }
      for (let i = 0; i < 16; i++) {                                 // sixteen years: sixteen pages blow past
        const k = seg(t, L(19, .2) + i * .11, L(19, .9) + i * .11); if (k <= 0 || k >= 1) continue;
        const p = arcPt([MED[0] - 40, MED[1] + 20], [MED[0] + 600, MED[1] - 500], -200, easeIn(k));
        push(); translate(p[0], p[1]); rotate(k * 2.5 + i); scale(1 - .4 * k); paper(0, 0, 160, 200, 'pg' + i); pop();
      }
      const mk = seg(t, L(19, 2.8), L(19, 3.4));
      if (mk > 0) {
        const y = lerp(-300, MED[1], easeIn(Math.min(1, mk * 1.2))) + 20 * spring(t, L(19, 3.3), 7, 18);
        K.medal(MED[0], y, 2.3, t, 1, 'med');
        if (t > L(19, 3.3)) for (let j = 0; j < 5; j++) K.sparkle(MED[0] + Math.cos(j * 1.3 + 1) * 140, MED[1] + Math.sin(j * 1.3 + 1) * 120, 34, seg(t, L(19, 3.3) + j * .1, L(19, 4.1) + j * .1), PAL.cream);
      }
      pipP(1590, 862, 40, { ...K.act(t, [[E_END, 'calm', { lookX: -.8 }], [L(18, 1.0), 'wow', { lookX: -1 }], [L(18, 3.0), 'calm', { lookX: -1, lookY: .2 }], [L(18, 4.6), 'wow', { lookX: -.8, lookY: -.6 }],
        [L(18, 7.6), 'calm', { lookX: .2, lookY: -.4 }], [L(18, 9.3), 'sad'], [L(19, .6), 'calm', { lookX: -.6, lookY: -.6 }], [L(19, 3.3), 'laugh'], [L(19, 4.4), 'excited']], 4), flip: true, key: 'pf' });
      camEnd();
      flash(seg(t, HUB_AT - .45, HUB_AT), PAL.cream);
    } else {
      // the hub: sugar, fat and protein all come apart into pieces that join the same wheel
      cam(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
      ground(Z.hub, t, { key: 'fh', blob: Z.hubBlob });
      const WH = [930, 580], RH = 255, spin = t * .3;
      wheel(WH[0], WH[1], RH, t, { key: 'hub', w: 32, chev: 18, spin, padR: 52, pads: () => 1 });
      for (let j = 0; j < 6; j++) K.sparkle(WH[0] + Math.cos(j) * 300, WH[1] + Math.sin(j) * 260, 30, seg(t, L(19, 9.6) + j * .12, L(19, 10.4) + j * .12), PAL.cream);
      const ENT = [WH[0], WH[1] - RH - 30];
      // sugar, from the left: glucose rings become gold pairs
      if (t > L(19, 6.6)) for (let i = 0; i < 5; i++) {
        const k = frac((t - L(19, 6.6)) * .3 + i / 5), on = seg(t, L(19, 6.6) + i * .3, L(19, 6.9) + i * .3); if (on <= 0) continue;
        const p = arcPt([-60, 700], ENT, -320, k);
        if (k < .55) glucose(p[0], p[1], .75 * on, 'hs' + i); else mol(M.acetyl2, p[0], p[1], .9 * on, { key: 'hsa' + i });
      }
      // fat, from the right: a long chain chopped into two-carbon pieces at its end
      if (t > L(19, 7.4)) {
        const on = popIn(t, L(19, 7.4), .5), ch = 16 - Math.floor((t - L(19, 7.4)) * 1.6) % 8, base = [1840, 300];
        const def = Array.from({ length: ch }, () => ({ c: 'g' })); def[0] = { c: 'g', cx: 1 };
        push(); translate(1600, 250); scale(.85 * on); mol(def, 0, 0, 1, { key: 'fat' }); pop();
        for (let i = 0; i < 4; i++) { const k = frac((t - L(19, 7.4)) * .4 + i / 4); const p = arcPt([1360, 260], ENT, -120, k); mol(M.acetyl2, p[0], p[1], .9 * on, { key: 'hfa' + i }); }
      }
      // protein, from below: a string of amino acids breaks up; its pieces join the wheel at different stations
      if (t > L(19, 8.2)) {
        const on = popIn(t, L(19, 8.2), .5);
        for (let i = 0; i < 9; i++) { const x = 160 + i * 54, y = 990 + 12 * Math.sin(i + t * 2); if (i < 8 && on > .5) inkLine([[x, y], [x + 54, 990 + 12 * Math.sin(i + 1 + t * 2)]], 2.4, PAL.ink, 'ink', 0); bead(x, y, 21 * on, Z.amino[i % 5], 'aa' + i); }
        [[2, 0], [3, 1], [7, 2], [5, 3]].forEach(([st, i]) => { const k = frac((t - L(19, 8.2)) * .32 + i / 4); const p = arcPt([400 + i * 60, 970], stationAt(WH[0], WH[1], RH, st), -160, k); bead(p[0], p[1], 19 * on, Z.amino[i % 5], 'ab' + i); });
      }
      camEnd();
      host(1700, 990, 32, t, [[HUB_AT, 'wow', { flip: true }], [L(19, 7.0), 'calm', { lookX: .8, lookY: -.5 }], [L(19, 9.4), 'love']], { talk: true, flip: true }, 'pfh');
      if (lt > 0 && t < HUB_AT + .5) flash(1 - (t - HUB_AT) / .5, PAL.cream);
      if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#F2C48F', Z.homeGold]);
    }
    if (lt < .3) brushWipe(.5 + lt / .6, ['#C9A877', Z.sepia]);
  }

  // ================================ G: back at the table (248.4–267.5) ================================
  function shotG(t, lt, dur) {
    K.setT(t);
    const lens = ease(seg(t, L(20, 7.8), L(20, 8.5))) * (1 - ease(seg(t, L(20, 11.4), L(20, 12.0))));
    const c = kf(t, [[F_END, [960, 610, 1.0]], [L(20, 7.6), [960, 610, 1.0]], [L(20, 8.6), [1000, 560, 1.0]], [L(20, 11.6), [1000, 560, 1.0]], [L(20, 12.6), [900, 640, 1.12]]], ease);
    cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    homeBg(t, 'g', 1);
    plate(BUN[0], BUN[1] + 8, 1, 'g');
    boilSeed('crumbs'); for (let i = 0; i < 9; i++) paint(ellPts(BUN[0] - 90 + hash(i + 7) * 180, BUN[1] - 2 + hash(i + 8) * 10, 5, 4, 8), { wash: Z.bun, ink: Z.bunDk, sw: .5 });
    const inh = seg(t, L(20, .5), L(20, 1.1)), exh = seg(t, L(20, 1.1), L(20, 1.7));
    const mood = K.act(t, [[F_END, 'happy', { lookX: .8 }], [L(20, .5), 'calm', { lookY: -.3 }], [L(20, 1.1), 'wow', { lookX: .7, lookY: -.7 }], [L(20, 2.8), 'happy', { lookX: .7, lookY: -.8 }],
      [L(20, 4.8), 'wow', { lookX: .7, lookY: -.9 }], [L(20, 8.6), 'love'], [L(20, 12.2), 'wave'], [L(20, 15.4), 'happy']], 2);
    const lensArm = lens > .05 ? { armF: { at: [1.6, -1.9] }, armsFront: false } : {};
    pipP(PA[0], PA[1], UA, { ...mood, ...lensArm, sq: mood.sq - .09 * Math.sin(inh * Math.PI / 2) * (1 - exh) + .07 * Math.sin(exh * Math.PI), key: 'pg' });
    // the breath again: each CO₂ sparkles, then traces a little loop
    const grow = seg(t, L(20, 1.15), L(20, 2.4)), mouth = [PA[0] + .7 * UA, PA[1] - 2.55 * UA];
    if (grow > 0) {
      const q = easeOut(grow), pc = lerp2(mouth, PUFF, q), fade = 1 - seg(t, L(20, 11.0), L(20, 13.5));
      puff(pc[0], pc[1], 240 * lerp(.15, 1, q), 160 * lerp(.15, 1, q), 1, t, 'g', { fade });
      PUFFC.forEach((o, i) => {
        const k = seg(grow, .35 + i * .06, .75 + i * .06); if (k <= 0 || fade <= .02) return;
        const lp = seg(t, L(20, 4.8) + i * .3, L(20, 6.4) + i * .3), a = ease(lp) * TAU, rr = 34;
        const x = pc[0] + o[0] * q + 10 * wob(t, .2, i) + rr * (Math.cos(a - Math.PI / 2) - 0) * (lp > 0 ? 1 : 0), y = pc[1] + o[1] * q + 8 * wob(t, .17, i * 2) + rr * (Math.sin(a - Math.PI / 2) + 1) * (lp > 0 ? 1 : 0) - 40 * (1 - fade);
        if (lp > 0 && lp < 1) { boilSeed('lpt' + i); for (let j = 0; j < 10; j++) { const b = j / 10 * TAU; if (b > a) break; paint(ellPts(pc[0] + o[0] * q + rr * Math.cos(b - Math.PI / 2), pc[1] + o[1] * q + rr * (Math.sin(b - Math.PI / 2) + 1), 3.5, 3.5, 8), { wash: Z.goldDk, ink: null }); } }
        co2(x, y, .95 * backOut(k) * lerp(.6, 1, fade), Z.gold, 'gc' + i, .4 * Math.sin(t * .7 + i * 1.7), near(t, L(20, 3.2) + i * .25, .2));
        K.sparkle(x + 20, y - 30, 22, seg(t, L(20, 3.2) + i * .25, L(20, 3.8) + i * .25), Z.gold2);
      });
    }
    // the magnifying glass on Pip's tummy, and what it shows: cells, each with a wheel turning inside
    if (lens > .02) {
      const hp = K.hand(PA[0], PA[1], UA, [1.6, -1.9]), LC = [hp[0] + 34, hp[1] - 10], IN = [1160, 380], RI = 250 * lens;
      boilSeed('lensLines'); inkLine([[LC[0] + 20, LC[1] - 40], [IN[0] - RI * .7, IN[1] + RI * .7]], 1.2, mixCol(Z.home, PAL.ink, .4), 'inkfine', 0); inkLine([[LC[0] + 44, LC[1] - 6], [IN[0] - RI * .2, IN[1] + RI * .98]], 1.2, mixCol(Z.home, PAL.ink, .4), 'inkfine', 0);
      boilSeed('inset'); paint(ellPts(IN[0], IN[1], RI, RI, 40), { wash: '#F6D5CF', ink: PAL.ink, sw: 1.6 });
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * TAU + .3, d = i === 6 ? 0 : 150, cx = IN[0] + Math.cos(a) * d * lens * (i === 6 ? 0 : 1), cy = IN[1] + Math.sin(a) * d * lens * (i === 6 ? 0 : 1), cr = 70 * lens;
        if (i === 6) { boilSeed('ic6'); paint(bumpy(cx, cy, cr, cr * .9, 24, .04, 3), { wash: '#FBE7DC', ink: PAL.ink, sw: .9, curv: .3 }); mito(cx, cy + 6, cr * .62, cr * .32, t, 'im' + i, { sw: .7, cristae: 4, wheel: t * .5 + i }); continue; }
        if (i === 5) continue;
        boilSeed('ic' + i); paint(bumpy(cx, cy, cr, cr * .9, 24, .04, 3), { wash: '#FBE7DC', ink: PAL.ink, sw: .9, curv: .3 });
        mito(cx, cy + 6, cr * .62, cr * .32, t, 'im' + i, { sw: .7, cristae: 4, wheel: t * .5 + i });
      }
      push(); translate(LC[0], LC[1]); rotate(-.5); boilSeed('lens');
      paint(rrPts(30, -9, 70, 18, 8), { wash: '#B97E4A', ink: PAL.ink, sw: 1 });
      paint(ellPts(0, 0, 40, 40, 24), { wash: '#E8F2F6', washOp: 150, ink: PAL.ink, sw: 2.2 });
      pop();
    }
    const at = toScreen(PA[0], PA[1] - 2.8 * UA);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#F2C48F', Z.homeGold]);
    const io = seg(t, DUR - 1.9, DUR - .15);
    if (io > 0) iris(at[0], at[1], kf(io, [[0, 1900], [.65, 230], [.8, 210], [1, 0]], ease));
  }

  // ================================ the cover ================================
  LOOPS.cover = t => {
    K.setT(.6);
    matrixBg(.6, 'cv');
    const W0 = [1390, 520];
    wheel(W0[0], W0[1], 300, .6, { key: 'cvw', w: 34, chev: 20, spin: .1, padR: 70, pads: () => 1 });
    mol(M.citrate, stationAt(W0[0], W0[1], 300, 1)[0], stationAt(W0[0], W0[1], 300, 1)[1], 1.35, { key: 'cvm' });
    mol(M.akg, stationAt(W0[0], W0[1], 300, 3)[0], stationAt(W0[0], W0[1], 300, 3)[1], 1.2, { key: 'cvm2' });
    co2(1640, 180, 1.4, 'g', 'cvc1', .3); co2(1760, 90, 1.2, 't', 'cvc2', -.4); co2(1520, 70, 1.1, 'g', 'cvc3', .2);
    shuttle(1790, 520, 1.5, 'nad', 1, .6, 'cvn'); shuttle(1780, 660, 1.5, 'fad', 1, .9, 'cvf'); ntp(1760, 800, 1.6, 'A', 3, 'cva');
    withPip(() => pip(1280, 1040, 46, { ...pipFeel('wow', .2), lookX: .3, lookY: -.7, emote: 'exclaim', emoteK: 1, noShadow: true, key: 'cvpip' }));
    boilSeed('cvtag'); paint(rrPts(80, 92, 560, 92, 30, 2), { wash: Z.teal, ink: PAL.ink, sw: 1.2 });
    const F = (wgt, px) => `${wgt} ${px}px "Noto Sans CJK SC", "WenQuanYi Zen Hei", "PingFang SC", sans-serif`;
    letter('高中生物 · 有氧呼吸', 360, 140, 50, PAL.cream, { font: F(800, 50), screen: true });
    letter('你呼出的二氧化碳', 92, 330, 116, '#2F3B3A', { font: F(900, 116), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    letter('从哪儿来？', 92, 490, 116, '#2F3B3A', { font: F(900, 116), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    boilSeed('cvblob'); paint(ellPts(400, 740, 340, 120, 30, 6, -.05), { wash: '#FBE2A6', ink: null });
    letter('三羧酸循环', 400, 740, 132, Z.gold, { font: F(900, 132), stroke: '#2F3B3A', screen: true, rot: -.04 });
    letter('一个转不停的圆圈', 400, 880, 56, '#2F3B3A', { font: F(800, 56), stroke: PAL.cream, screen: true, ink: false, rot: -.02 });
  };
  LOOPS.cover.len = 1;

  // ================================ props sheet (a test loop) ================================
  LOOPS.props = t => {
    K.setT(t);
    ground(Z.matrix, t, { key: 'pr', blob: Z.matrixBlob });
    mol(M.pyruvate, 200, 150, 1, { key: 'a' });
    mol(M.acetyl, 450, 150, 1, { key: 'b', t });
    mol(M.oaa, 700, 150, 1, { key: 'c' });
    mol(M.citrate, 1000, 150, 1, { key: 'd', hi: i => i === 2 ? 1 : 0 });
    mol(M.isocitrate, 1350, 150, 1, { key: 'e' });
    mol(M.akg, 1700, 150, 1, { key: 'f' });
    mol(M.succCoA, 200, 400, 1, { key: 'g', t });
    mol(M.succinate, 500, 400, 1, { key: 'h' });
    mol(M.fumarate, 800, 400, 1, { key: 'i' });
    mol(M.malate, 1100, 400, 1, { key: 'j' });
    mol(M.oaa2, 1400, 400, 1, { key: 'k' });
    glucose(1700, 400, 1, 'gl');
    co2(200, 620, 1, 't', 'c1'); co2(350, 620, 1, 'g', 'c2'); water(480, 620, 1, 'w'); o2(580, 620, 1, 'o');
    shuttle(720, 620, 1.2, 'nad', 0, t, 's1'); shuttle(900, 620, 1.2, 'nad', 1, t, 's2'); shuttle(1080, 620, 1.2, 'fad', 0, t, 's3'); shuttle(1260, 620, 1.2, 'fad', 1, t, 's4');
    ntp(1450, 620, 1.2, 'G', 3, 'n1'); ntp(1650, 620, 1.2, 'A', 2, 'n2');
    wheel(300, 900, 140, t, { key: 'wh', pads: () => 1, padR: 30, w: 18 });
    mito(800, 900, 260, 130, t, 'mt', { wheel: t * .3 });
    plate(1250, 975, .9, 'pl'); bun(1250, 960, .9, t, 'bn', { specks: () => 1 });
    puff(1650, 880, 160, 110, 1, t, 'pf');
    co2(1620, 860, .8, 'g', 'pc');
    withPip(() => K.swim(1820, 1040, 26, t, { ...pipFeel('wow', t) }, 'pp'));
  };
  LOOPS.props.len = 2;

  shots([[0, shotA], [A_END, shotB], [B_END, shotC], [C_END, shotD], [D_END, shotE], [E_END, shotF], [F_END, shotG]]);
})();

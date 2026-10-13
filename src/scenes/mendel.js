// mendel.js: "Pip讲孟德尔遗传定律", 509 s. Heredity is not paint but marbles: the viewer re-derives Mendel's two laws
// from his pea counts. The paint table (blending) → the monastery garden (the cross, F1 all round, F2 3:1) → the
// thinking board (pairs, one per gamete, the 2×2, the testcross, 假说—演绎法) → recap → inside a wrinkled seed (SBE1)
// → two traits (four heaps, two 3:1s, 3/4 × 3/4) → the 4×4 grid → chromosomes → the paint table again.
// See STORYBOARD_MENDEL.md. Every time is tied to a voice line: L(i, d) = line i's start + d seconds.
(() => {
  const K = MK;
  const Z = {
    cream: '#F5E8D2', creamBlob: '#FBF2E4', table: '#C9976A', tableDk: '#A87650', sheet: '#FBF5EA', palette: '#E2BE8C', paletteDk: '#C49A64',
    red: '#D84A4E', redDk: '#A9333A', white: '#FBF3E4', pink: '#EE9DAA', mud: '#C9A99E',
    garden: '#CFE0C0', gardenBlob: '#E6F0DA', sky: '#E4EEE6', wall: '#D9CDB8', wallDk: '#B8A88E', soil: '#9C7A55', soilDk: '#7D5E3F',
    leaf: '#7FB25A', leafDk: '#4F7F3A', stem: '#6E9F4C', pod: '#9CC85E', podDk: '#6E9A3C', flower: '#E9B7DA', flowerDk: '#B07AA6', keel: '#F7E6F0',
    board: '#DCE6EE', boardBlob: '#EEF3F7', recap: '#F5EEDD', recapBlob: '#FBF6EA', seed: '#F2DFA8', seedBlob: '#F9EDCB',
    dusk: '#E9D9A6', duskBlob: '#F5EBC6', cell: '#C9E2D6', cellBlob: '#E3F1EA', cyto: '#F3F6EA', cytoDk: '#D9E6CF',
    yel: '#EBCB5A', yelDk: '#C9A332', grn: '#9CC25E', grnDk: '#6F9A3A',
    R: '#4469B8', RDk: '#2D4C8E', r: '#B4CFEE', rDk: '#7FA2CF', Y: '#E7B12F', YDk: '#B98516', y: '#6FA548', yDk: '#4C7F2E',
    pollen: '#F0A34A', pollenDk: '#C47A26', egg: '#F4B9B4', eggDk: '#D68C88', gold: '#F0B640', glass: '#FFF8EC', hat: '#3D3440', hatDk: '#28222B'
  };
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));              // a soft pulse peaking at a
  const popK = (t, a, len = .35) => backOut(seg(t, a, a + len));                    // 0 → 1 with overshoot
  const rotEll = (x, y, rx, ry, n, rot) => { const c = Math.cos(rot), s = Math.sin(rot); return ellPts(0, 0, rx, ry, n).map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]); };
  const SHAPE = { R: [Z.R, Z.RDk], r: [Z.r, Z.rDk], Y: [Z.Y, Z.YDk], y: [Z.y, Z.yDk] };

  // ---------- Pip ----------
  function host(x, y, u, t, keys, extra = {}, key = 'ph') {      // Pip the host, floating in place
    const o = { ...K.act(t, keys), ...extra };
    return K.swim(x, y, u, t, o, key);
  }
  function hat(x, y, s, key, tilt = 0) {                          // Mendel's broad-brimmed hat; (x, y) = the middle of the brim
    boilSeed('hat' + key);
    push(); translate(x, y); rotate(tilt);
    paint(ellPts(0, 0, 1.25 * s, .2 * s, 26), { wash: Z.hat, ink: PAL.ink, sw: clamp(s / 60, .6, 1.2) });
    paint([[-.58 * s, -.02 * s], [-.5 * s, -.62 * s], [-.2 * s, -.74 * s], [.2 * s, -.74 * s], [.5 * s, -.62 * s], [.58 * s, -.02 * s]], { wash: Z.hat, ink: PAL.ink, sw: clamp(s / 60, .6, 1.2), curv: .4 });
    paint([[-.57 * s, -.12 * s], [.57 * s, -.12 * s], [.56 * s, -.24 * s], [-.56 * s, -.24 * s]], { wash: '#6A5A6E', ink: null });
    pop();
  }

  // ---------- peas ----------
  // A seed: round (wr 0) or wrinkled (wr 1), any blend between; col = seed colour. o.hi lightens, o.q scales.
  function pea(x, y, r, o = {}) {
    const wr = o.wr || 0, col = o.col || Z.yel, dk = o.dk || (col === Z.grn ? Z.grnDk : Z.yelDk), sd = o.seed ?? 3, q = o.q ?? 1;
    if (q <= .02) return; r *= q;
    boilSeed('pea' + (o.key || ''));
    const P = [];
    for (let i = 0; i < 30; i++) {
      const a = i / 30 * TAU, n = Math.sin(a * 5 + sd) * .5 + Math.sin(a * 9 + sd * 2.3) * .35 + Math.sin(a * 3 + sd * 1.7) * .3;
      const rr = r * (1 + .2 * wr * n) * (1 - .1 * wr);
      P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * (1 - .04 * wr)]);
    }
    const c2 = mixCol(col, PAL.cream, .45 * (o.hi || 0));
    paint(P, { wash: c2, fill: dk, fillOp: 40 + 30 * wr, tex: .5, ink: PAL.ink, sw: clamp(r / 30, .5, 1.2), curv: .35 * (1 - wr) });
    if (wr < .7) paint(ellPts(x - r * .32, y - r * .34, r * .28 * (1 - wr), r * .18 * (1 - wr), 10, 0, -.6), { wash: PAL.cream, washOp: 200 * (1 - wr), ink: null });
    if (wr > .05) for (let k = 0; k < 4; k++) {                    // creases
      const a = hash(sd * 7 + k) * TAU, l = r * (.35 + .25 * hash(sd + k * 3)), cx = x + Math.cos(a) * r * .25, cy = y + Math.sin(a) * r * .25;
      inkLine([[cx - Math.cos(a + 1.3) * l * .5, cy - Math.sin(a + 1.3) * l * .5], [cx + Math.cos(a + 1.1) * l * .05, cy + Math.sin(a + 1.6) * l * .08], [cx + Math.cos(a + 1.3) * l * .5, cy + Math.sin(a + 1.3) * l * .5]],
        clamp(r / 30, .6, 1.3) * wr, mixCol(dk, PAL.ink, .4), 'inkfine', .6);
    }
  }
  // A marble: one hereditary factor. kind: R r Y y. Pale ones carry a little crinkle.
  function marble(x, y, r, kind, o = {}) {
    const q = o.q ?? 1; if (q <= .02) return; r *= q;
    const [c, dk] = SHAPE[kind];
    boilSeed('mb' + (o.key || ''));
    if (o.glow) glow(x, y, r * 2.4, c === Z.Y ? '#FFD36A' : '#BFD4FF', o.glow);
    paint(ellPts(x, y, r, r, 22), { wash: mixCol(c, PAL.cream, .4 * (o.hi || 0)), fill: dk, fillOp: 70, tex: .4, ink: PAL.ink, sw: clamp(r / 22, .5, 1.2) });
    paint(ellPts(x + r * .12, y + r * .2, r * .62, r * .5, 14), { wash: dk, washOp: 70, ink: null });
    paint(ellPts(x - r * .34, y - r * .36, r * .28, r * .18, 10, 0, -.7), { wash: Z.glass, washOp: 230, ink: null });
    if (kind === 'r') inkLine([[x - r * .45, y + r * .1], [x - r * .2, y - r * .08], [x, y + r * .14], [x + r * .22, y - .06 * r], [x + r * .45, y + r * .12]], clamp(r / 20, .5, 1.2), Z.rDk, 'inkfine', .5);
  }
  // A pollen grain (spiky orange) or an egg (soft pink), carrying one marble (or a "?" slot, or nothing)
  function pollen(x, y, s, kind, o = {}) {
    const q = o.q ?? 1; if (q <= .02) return; s *= q;
    boilSeed('pl' + (o.key || ''));
    const P = []; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; P.push([x + Math.cos(a) * s * (i % 2 ? 1 : 1.13), y + Math.sin(a) * s * (i % 2 ? 1 : 1.13)]); }
    paint(P, { wash: Z.pollen, fill: Z.pollenDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: clamp(s / 40, .5, 1.1) });
    paint(ellPts(x, y, s * .72, s * .72, 18), { wash: mixCol(Z.pollen, PAL.cream, .45), ink: null });
    if (kind === '?') slot(x, y, s * .45, o.key); else if (kind) marble(x, y, s * .5, kind, { key: 'plm' + (o.key || ''), glow: o.glow });
  }
  function egg(x, y, s, kind, o = {}) {
    const q = o.q ?? 1; if (q <= .02) return; s *= q;
    boilSeed('eg' + (o.key || ''));
    paint(ellPts(x, y, s * 1.1, s, 26), { wash: Z.egg, fill: Z.eggDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: clamp(s / 40, .5, 1.1) });
    paint(ellPts(x, y, s * .78, s * .7, 20), { wash: mixCol(Z.egg, PAL.cream, .45), ink: null });
    if (kind === '?') slot(x, y, s * .45, o.key); else if (kind) marble(x, y, s * .5, kind, { key: 'egm' + (o.key || ''), glow: o.glow });
  }
  function slot(x, y, r, key) {                                   // an empty dashed socket with a question mark
    boilSeed('sl' + key);
    const P = ellPts(x, y, r, r, 20); for (let i = 0; i < 20; i += 2) inkLine([P[i], P[(i + 1) % 20]], clamp(r / 16, .6, 1.6), PAL.ink, 'ink', 0);
    pipEmote('question', x - r * .3, y + r * .9, r * .45, 1, 'sl' + key);
  }
  // A pea that shows what it carries: the seed, with its pair of marbles in a little cradle under it
  function carrier(x, y, r, pair, o = {}) {
    const q = o.q ?? 1; if (q <= .02) return;
    const wr = o.wr ?? (pair.includes('R') ? 0 : 1);
    pea(x, y, r, { ...o, wr, q });
    if (o.show === 0) return;
    const sh = o.show ?? 1, mr = r * .36 * q, dy = r * 1.32 * q;
    if (sh > .02) {
      boilSeed('cr' + (o.key || ''));
      paint(rrPts(x - mr * 2.5, y + dy - mr * 1.25, mr * 5, mr * 2.5, mr * 1.2), { wash: PAL.cream, washOp: 200 * sh, ink: mixCol(PAL.ink, PAL.cream, .4), sw: .8 * sh });
      pair.split('').forEach((k, i) => marble(x + (i ? 1 : -1) * mr * 1.15, y + dy, mr, k, { q: backOut(sh), key: (o.key || '') + 'm' + i, glow: o.glow }));
    }
  }

  // ---------- garden props ----------
  function flower(x, y, s, t, o = {}) {                           // a pea flower, side view: banner, wings, keel
    boilSeed('fl' + (o.key || ''));
    const op = o.open ?? 1, sw = clamp(s / 50, .5, 1.1);
    paint(ribbon([[x - s * .9, y + s * .15], [x - s * .5, y + s * .05], [x - s * .15, y]], s * .14, s * .1), { wash: Z.stem, ink: PAL.ink, sw });
    paint([[x - s * .2, y + s * .05], [x - s * .05, y - s * .9 * op - s * .2], [x + s * .35, y - s * (1.05 * op + .1)], [x + s * .5, y - s * .55 * op], [x + s * .25, y]], { wash: o.col || Z.flower, fill: Z.flowerDk, fillOp: 40, tex: .4, ink: PAL.ink, sw, curv: .5 });
    paint([[x - s * .15, y + s * .05], [x + s * .3, y - s * .3], [x + s * .8, y - s * .15], [x + s * .7, y + s * .2], [x + s * .2, y + s * .25]], { wash: mixCol(o.col || Z.flower, Z.flowerDk, .25), ink: PAL.ink, sw, curv: .5 });
    if (o.keel !== false) paint([[x - s * .05, y + s * .1], [x + s * .5, y + s * .02], [x + s * .9, y + s * .12], [x + s * .65, y + s * .35], [x + s * .1, y + s * .3]], { wash: Z.keel, ink: PAL.ink, sw, curv: .5 });
  }
  function podShape(x, y, s, ang, o = {}) {                        // a pea pod; o.open 0..1 splits it; o.peas draws seeds inside
    if (s < 3) return;
    boilSeed('pod' + (o.key || ''));
    const op = o.open || 0, n = o.n || 5, ca = Math.cos(ang), sa = Math.sin(ang);
    const T = (u, v) => [x + ca * u - sa * v, y + sa * u + ca * v];
    const half = (sgn, gap) => { const P = []; for (let i = 0; i <= 14; i++) { const u = (i / 14 - .5) * 2 * s, w = s * .3 * Math.sin(i / 14 * Math.PI) * (1 + .1 * Math.sin(i * 2.1)); P.push(T(u + (i === 14 ? s * .15 : 0), sgn * (w + gap))); } for (let i = 14; i >= 0; i--) { const u = (i / 14 - .5) * 2 * s; P.push(T(u, sgn * gap)); } return P; };
    if (op > .02) paint(half(-1, s * .32 * op), { wash: Z.podDk, ink: PAL.ink, sw: clamp(s / 70, .5, 1.1), curv: .3 });
    if (o.peas && op > .02) for (let i = 0; i < n; i++) { const u = ((i + .5) / n - .5) * 1.7 * s, p = T(u, 0); o.peas(i, p[0], p[1], s * .17); }
    if (op < .98) paint(op < .02 ? half(-1, 0).concat(half(1, 0).slice(0, 15)) : half(1, s * .32 * op), { wash: Z.pod, fill: Z.podDk, fillOp: 45, tex: .5, ink: PAL.ink, sw: clamp(s / 70, .5, 1.1), curv: .3 });
    else paint(half(1, s * .32), { wash: Z.pod, fill: Z.podDk, fillOp: 45, tex: .5, ink: PAL.ink, sw: clamp(s / 70, .5, 1.1), curv: .3 });
  }
  function plant(x, y, h, t, o = {}) {                            // a climbing pea plant on a stick: stem, paired leaflets, tendrils
    boilSeed('pt' + (o.key || ''));
    const g = o.grow ?? 1, sway = 6 * wob(t, .11, x * .001), sw = clamp(h / 400, .6, 1.1);
    inkLine([[x + 14, y + 10], [x + 16, y - h * 1.05]], 2.4, '#A88763', 'ink', 0);   // the stick
    const top = [x + sway, y - h * g], P = [[x, y], [x - 8, y - h * g * .35], [x + 10 + sway * .5, y - h * g * .7], top];
    paint(ribbon(P, 9, 5), { wash: Z.stem, ink: PAL.ink, sw });
    const n = Math.floor(5 * g);
    for (let i = 0; i < n; i++) {
      const k = (i + .7) / 5.5, py = y - h * k, px = x + Math.sin(k * 6) * 8 + sway * k, sd = i % 2 ? 1 : -1, ls = h * .1 * (o.leafS || 1);
      paint(rotEll(px + sd * ls * .9, py + 6, ls, ls * .55, 14, sd * -.35), { wash: i % 2 ? Z.leaf : mixCol(Z.leaf, Z.leafDk, .25), ink: PAL.ink, sw: sw * .8 });
      paint(rotEll(px + sd * ls * 2.2, py + 2, ls * .9, ls * .5, 14, sd * -.2), { wash: Z.leaf, ink: PAL.ink, sw: sw * .8 });
      inkLine([[px, py], [px - sd * ls * .6, py - ls * .5], [px - sd * ls * .9, py - ls * .1], [px - sd * ls * .7, py + ls * .05]], .9, Z.leafDk, 'inkfine', .6);
    }
    return top;
  }

  // ---------- board props ----------
  function arrow(x0, y0, x1, y1, k, col, key, w = 12) {           // a painted arrow that draws itself
    if (k <= .02) return; boilSeed('arr' + key);
    const q = ease(k), ex = lerp(x0, x1, q), ey = lerp(y0, y1, q), a = Math.atan2(y1 - y0, x1 - x0), hl = w * 1.9;
    const bx = ex - Math.cos(a) * hl, by = ey - Math.sin(a) * hl;
    if (Math.hypot(bx - x0, by - y0) > 4) paint(ribbon([[x0, y0], [lerp(x0, bx, .5), lerp(y0, by, .5) + 3], [bx, by]], w * .8, w), { wash: col, ink: PAL.ink, sw: .9 });
    const nx = -Math.sin(a), ny = Math.cos(a);
    paint([[ex, ey], [bx + nx * w * 1.2, by + ny * w * 1.2], [bx - nx * w * 1.2, by - ny * w * 1.2]], { wash: col, ink: PAL.ink, sw: .9 });
  }
  function cloud(cx, cy, rx, ry, k, from, key) {                  // a thought bubble trailing back to the thinker
    if (k <= .02) return; boilSeed('cl' + key);
    const q = backOut(k);
    paint(ellPts(lerp(from[0], cx, .2), lerp(from[1], cy, .2), 11 * q, 9 * q, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(ellPts(lerp(from[0], cx, .4), lerp(from[1], cy, .4), 19 * q, 16 * q, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; P.push([cx + Math.cos(a) * rx * q * (1 + .06 * Math.sin(a * 8)), cy + Math.sin(a) * ry * q * (1 + .06 * Math.sin(a * 8))]); }
    paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
  }
  function ringK(x, y, rx, ry, k, col = Z.gold, key = 'rg', w = 4) {   // a highlight ring that swells and fades
    if (k <= 0 || k >= 1) return; boilSeed('ring' + key);
    const q = 1 + .18 * easeOut(k), P = ellPts(x, y, rx * q, ry * q, 30);
    inkLine(P.concat([P[0], P[1]]), w * (1 - k * .8), col, 'ink', .5);
  }
  function holdRing(x, y, rx, ry, a, col = Z.gold, key = 'hr', w = 3) {
    if (a <= .03) return; boilSeed('hring' + key);
    const P = ellPts(x, y, rx, ry, 30); inkLine(P.concat([P[0], P[1]]), w * a, col, 'ink', .5);
  }
  function qmark(x, y, s, k, key) { if (k > .02) pipEmote('question', x, y, s * backOut(k), 1, 'q' + key); }
  function card(x, y, w, h, k, key, col = '#FBFAF6') { if (k <= .02) return; boilSeed('cd' + key); const q = backOut(k); paint(rrPts(x - w / 2 * q, y - h / 2 * q, w * q, h * q, 24), { wash: col, fill: '#E3E6EA', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 }); }
  function heap(x, y, n, w, peaFn, key, k = 1, r = 15) {           // a pile of n seeds, bottom-centre at (x, y), width w
    let row = 0, i = 0;
    while (i < n) { const per = Math.max(1, Math.floor(w / (2 * r) - row * .6)); for (let j = 0; j < per && i < n; j++, i++) {
      const kk = seg(k, i / n * .7, i / n * .7 + .3); if (kk <= 0) continue;
      const px = x + (j - (per - 1) / 2) * 2 * r * .95 + (row % 2) * r * .5, py = y - r - row * r * 1.65 + (1 - easeOut(kk)) * -120;
      peaFn(i, px, py, r);
    } row++; }
    return y - r - (row - 1) * r * 1.65;
  }
  function bar(x, y, w, h, col, k, key) {                          // a soft painted column growing up from (x, y)
    if (k <= .02) return; boilSeed('bar' + key);
    const hh = h * easeOut(k); paint(rrPts(x - w / 2, y - hh, w, hh, Math.min(14, hh / 2)), { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 50, tex: .5, ink: PAL.ink, sw: 1 });
  }
  const boardBg = (t, key) => { K.wash(Z.board, t, { key, blob: Z.boardBlob, rect: rectPts(-1600, -1200, W + 3200, H + 2400) });
    K.motes(t, 12, mixCol(Z.board, '#8FA6BC', .35), { key }); };

  // ================================ A: the paint table (0–L3) ================================
  const PAL_C = [640, 640];                                       // the palette's well
  function drop(x, y, s, col, key, o = {}) {                       // a teardrop of paint
    boilSeed('dp' + key);
    const sq = o.sq || 0, P = [[x, y - s * 1.45 * (1 - sq)], [x + s * .72 * (1 + sq), y - s * .1], [x + s * .66 * (1 + sq), y + s * .5], [x, y + s * .82], [x - s * .66 * (1 + sq), y + s * .5], [x - s * .72 * (1 + sq), y - s * .1]];
    paint(P, { wash: col, fill: mixCol(col, PAL.ink, .15), fillOp: 45, tex: .4, ink: PAL.ink, sw: clamp(s / 30, .5, 1.1), curv: .55 });
    paint(ellPts(x - s * .25, y - s * .05, s * .16, s * .26, 8), { wash: PAL.cream, washOp: 170, ink: null });
  }
  // the family tree of paint drops (on the sheet): each child is its parents' average; the last row has all gone mud
  const TREE = [
    { id: 0, x: 1240, y: 235, col: Z.red }, { id: 1, x: 1640, y: 235, col: Z.white },
    { id: 2, x: 1440, y: 395, col: Z.pink, from: [0, 1] }, { id: 3, x: 1730, y: 395, col: '#E6D6C4' },
    { id: 4, x: 1590, y: 555, col: '#E2B0AB', from: [2, 3] }, { id: 5, x: 1270, y: 555, col: '#CDB7A8' },
    { id: 6, x: 1430, y: 712, col: Z.mud, from: [5, 4] }
  ];
  const ROW = [1180, 1310, 1440, 1570, 1700], ROWY = 852;         // the last generation, all the same mud
  function paintTable(t, key, gold = 0) {
    K.wash(mixCol(Z.cream, '#F6D7A0', gold), t, { key, blob: Z.creamBlob, rect: rectPts(-400, -400, W + 800, H + 800) });
    boilSeed('tbl' + key);
    paint(rectPts(-400, 870, W + 800, 600), { wash: mixCol(Z.table, '#D9A266', gold * .4), fill: Z.tableDk, fillOp: 50, tex: .6, ink: null });
    for (let i = 0; i < 5; i++) inkLine([[-300, 900 + i * 38 + hash(i) * 10], [W + 300, 905 + i * 38 + hash(i + 3) * 10]], .8, Z.tableDk, 'dry', 0);
    inkLine([[-300, 872], [W + 300, 872]], 1.4, PAL.ink, 'ink', 0);
  }
  function sheet(key) {
    boilSeed('sh' + key);
    paint([[1060, 130], [1840, 112], [1856, 900], [1074, 912]], { wash: Z.sheet, fill: '#EADFCB', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 });
  }
  function palette(t, key, mixK, pullK) {                          // the palette, with the red and white that become pink
    boilSeed('pal' + key);
    const [cx, cy] = PAL_C;
    paint(ellPts(cx, cy, 330, 190, 34, 0, -.08), { wash: Z.palette, fill: Z.paletteDk, fillOp: 55, tex: .6, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(cx - 230, cy + 60, 34, 26, 16), { wash: mixCol(Z.table, Z.cream, .3), ink: PAL.ink, sw: 1 });   // thumb hole
    for (const [dx, dy, c] of [[-150, -110, '#E9B44C'], [-40, -140, '#6E9BD3'], [80, -125, '#7DB86A']]) paint(ellPts(cx + dx, cy + dy, 34, 22, 14), { wash: c, ink: PAL.ink, sw: .8 });
    const m = ease(mixK), pull = Math.sin(pullK * Math.PI) * 28;
    const pr = [cx - 110 + 80 * m - pull, cy + 30], pw = [cx + 110 - 80 * m + pull, cy + 30];
    if (m < 1) {
      paint(ellPts(pr[0], pr[1], 90 - 10 * m, 62, 20, 2), { wash: mixCol(Z.red, Z.pink, m), ink: PAL.ink, sw: 1 });
      paint(ellPts(pw[0], pw[1], 90 - 10 * m, 62, 20, 2), { wash: mixCol(Z.white, Z.pink, m), ink: PAL.ink, sw: 1 });
    }
    if (m > .05) {                                                 // the swirl that becomes one pink pool
      paint(ellPts(cx, cy + 30, 40 + 100 * m, 30 + 42 * m, 24, 2), { wash: Z.pink, ink: PAL.ink, sw: 1 });
      for (let i = 0; i < 3; i++) { const P = []; for (let j = 0; j <= 16; j++) { const a = j / 16 * TAU * .8 + i * 2.1 + m * 4, rr = (20 + j * 6) * (1 - m * .8); P.push([cx + Math.cos(a) * rr * 1.3, cy + 30 + Math.sin(a) * rr * .6]); }
        inkLine(P, 7 * (1 - m), i % 2 ? Z.red : Z.white, 'ink', .6); }
    }
  }
  function brushProp(hx, hy, tx, ty, col, key) {                  // a long paintbrush from the hand to the tip
    boilSeed('br' + key);
    const a = Math.atan2(ty - hy, tx - hx), L = Math.hypot(tx - hx, ty - hy), ex = hx - Math.cos(a) * 40, ey = hy - Math.sin(a) * 40;
    paint(ribbon([[ex, ey], [hx, hy], [lerp(hx, tx, .8), lerp(hy, ty, .8)]], 9, 6), { wash: '#B5583E', ink: PAL.ink, sw: .9 });
    const fx = lerp(hx, tx, .8), fy = lerp(hy, ty, .8);
    paint(ribbon([[fx, fy], [lerp(fx, tx, .5), lerp(fy, ty, .5)], [tx, ty]], 13, 3), { wash: col, ink: PAL.ink, sw: .9 });
    paint(rotEll(fx, fy, 9, 7, 10, a), { wash: '#C9C3B6', ink: PAL.ink, sw: .8 });
  }
  function treeDraw(t, k0) {                                       // the drops fall onto the sheet, child after parents
    const T0 = [L(1, 7.6), L(1, 7.9), L(1, 9.2), L(2, 1.4), L(2, 2.6), L(2, 3.2), L(2, 4.6)];
    for (const n of TREE) if (n.from) {                          // the paint runs from the parents into the child
      const k = seg(t, T0[n.id] - .9, T0[n.id] - .1);
      for (const p of n.from) { const P = TREE[p]; if (k <= 0) continue; boilSeed('run' + n.id + p);
        const mx = lerp(P.x, n.x, .5), my = lerp(P.y, n.y, .5) + 10, e = ease(k);
        paint(ribbon([[P.x, P.y + 30], [lerp(P.x, mx, e), lerp(P.y + 30, my, e)], [lerp(P.x, n.x, e), lerp(P.y + 30, n.y - 40, e)]], 12, 7), { wash: mixCol(P.col, n.col, .5 * e), washOp: 220, ink: null }); }
    }
    for (const n of TREE) { const k = seg(t, T0[n.id] - .35, T0[n.id]); if (k <= 0) continue;
      const fall = (1 - easeIn(k)) * 200, sq = .35 * spring(t, T0[n.id], 7, 20);
      drop(n.x, n.y - fall, 52, n.col, 'tr' + n.id, { sq }); }
    // the last row: the mud spreads across; then one comes back pure red
    const back = L(2, 9.6);
    ROW.forEach((x, i) => { const tt = L(2, 5.6) + i * .25, k = seg(t, tt - .3, tt); if (k <= 0) return;
      const red = i === 3 && t > back, sq = .35 * spring(t, tt, 7, 20) + (i === 3 ? .4 * spring(t, back, 6, 18) : 0);
      if (i > 0 || true) { boilSeed('rowrun' + i); const P = TREE[6]; if (k > .5) paint(ribbon([[P.x, P.y + 40], [lerp(P.x, x, .5), ROWY - 60], [x, ROWY - 30]], 7, 4), { wash: Z.mud, washOp: 120, ink: null }); }
      drop(x, ROWY - (1 - easeIn(k)) * 160, 42, red ? Z.red : Z.mud, 'row' + i, { sq }); });
    if (t > back) { K.burst(ROW[3], ROWY, 90, seg(t, back, back + .5), Z.redDk, 'rb'); K.sparkle(ROW[3] + 55, ROWY - 70, 28, seg(t, back + .1, back + .8), '#FFE3D0'); }
    holdRing(ROW[3], ROWY, 66, 72, ease(seg(t, back + .4, back + 1)) * (1 - seg(t, L(3, -4), L(3, -2.5))), Z.redDk, 'rbh', 3);
  }
  function shotA(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[0, [760, 640, 1.3]], [L(1, 6.6), [760, 640, 1.3]], [L(1, 8.0), [1240, 560, 1.12]], [L(2, 0), [1240, 560, 1.12]], [L(2, 1.0), [1300, 560, .98]], [L(2, 8.6), [1330, 600, 1.0]], [L(2, 10), [1360, 700, 1.15]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    paintTable(t, 'a');
    sheet('a');
    palette(t, 'a', seg(t, L(1, 2.4), L(1, 5.2)), seg(t, L(1, 5.8), L(1, 7.0)));
    treeDraw(t);
    // Pip, standing on the table between the palette and the sheet, holding the brush
    const px = kf(t, [[0, 1010], [L(1, 6.8), 1010], [L(1, 8.2), 1000]], ease), py = 905;
    const lookPal = t < L(1, 7.2);
    const o = K.act(t, [[0, 'happy', { lookX: -.8, lookY: .3 }], [L(1, 2.2), 'calm', { lookX: -.9, lookY: .5 }], [L(1, 5.4), 'smug', { lookX: -.8, lookY: .4 }], [L(1, 5.9), 'strain', { lookX: -.9, lookY: .5 }],
      [L(1, 7.2), 'wow', { lookX: .8, lookY: -.6 }], [L(1, 10.4), 'calm', { lookX: .7, lookY: -.4 }], [L(2, 2.0), 'calm', { lookX: .8, lookY: -.1 }], [L(2, 6.4), 'worried', { lookX: .7, lookY: .2 }],
      [L(2, 9.8), 'wow', { lookX: .9, lookY: .2, take: .9 }], [L(2, 11.2), 'confused', { lookX: .8, lookY: .1 }]]);
    const flip = lookPal, at = lookPal ? [2.2, -2.7] : [2.0, -3.4];
    const bob = 3 * wob(t, .5);
    pip(px, py, 33, { ...o, flip, armF: { at }, key: 'pa' });
    const hd = K.hand(px, py + bob * 0, 33, at, { flip, dy: o.dy });
    let tip;
    if (lookPal) { const mixing = seg(t, L(1, 2.4), L(1, 5.2)), pull = seg(t, L(1, 5.8), L(1, 7.0)), a = t * 7;
      tip = [PAL_C[0] + 60 * Math.cos(a) * mixing * (1 - mixing * .3) + 20 - 60 * Math.sin(pull * Math.PI), PAL_C[1] + 30 + 22 * Math.sin(a) * mixing]; }
    else tip = [hd[0] + 60, hd[1] - 150];
    brushProp(hd[0], hd[1], tip[0], tip[1], lookPal ? Z.pink : Z.red, 'pa');
    const at2 = toScreen(px, py - 90);
    camEnd();
    if (lt < .8) iris(at2[0], at2[1], lerp(0, 1500, easeIn(lt / .8)));
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#9CBF7E', Z.garden]);
  }


  // ================================ B: Mendel's garden (L3–L9) ================================
  function gardenBg(t, key, gold = 0) {                            // sky, the monastery wall, soil beds
    const sky = mixCol(Z.sky, '#F6E3B0', gold);
    K.wash(sky, t, { key, blob: mixCol(Z.gardenBlob, '#FBEFC9', gold), rect: rectPts(-1400, -1400, W + 2800, H + 2800) });
    boilSeed('wall' + key);
    paint(rectPts(-1400, 250, W + 2800, 470), { wash: mixCol(Z.wall, '#E8CFA0', gold * .5), fill: Z.wallDk, fillOp: 45, tex: .7, ink: null });
    for (let r = 0; r < 7; r++) { const y = 250 + r * 66; inkLine([[-1300, y], [W + 1300, y + 2]], .7, mixCol(Z.wallDk, PAL.ink, .15), 'inkfine', 0);
      if (r < 6) for (let i = -8; i < 22; i++) { const x = i * 150 + (r % 2) * 75 + hash(i * 3 + r) * 16; inkLine([[x, y + 3], [x + 1, y + 63]], .7, mixCol(Z.wallDk, PAL.ink, .15), 'inkfine', 0); } }
    for (let i = 0; i < 9; i++) paint(ellPts(-600 + hash(i + 60) * 3200, 300 + hash(i + 61) * 380, 140, 60, 14), { fill: Z.wallDk, fillOp: 40, bleed: .2, tex: .5, ink: null });
    inkLine([[-1300, 250], [W + 1300, 250]], 1.2, PAL.ink, 'ink', 0);
    paint(rectPts(-1400, 230, W + 2800, 26), { wash: mixCol(Z.wallDk, '#C6A979', gold * .5), ink: PAL.ink, sw: .9 });
    boilSeed('soil' + key);
    paint(rectPts(-1400, 700, W + 2800, 1600), { wash: mixCol(Z.garden, '#D9D29A', gold), fill: Z.leafDk, fillOp: 30, tex: .6, ink: null });
    paint(rectPts(-1400, 840, W + 2800, 90), { wash: Z.soil, fill: Z.soilDk, fillOp: 60, tex: .7, ink: null });
    for (let i = 0; i < 40; i++) { boilSeed('tuft' + key + i); const x = -1200 + hash(i + 40) * 4300, y = 720 + hash(i + 41) * 110;
      inkLine([[x, y], [x - 6, y - 16 - 10 * hash(i)], [x - 3, y - 26]], .8, Z.leafDk, 'inkfine', .5); inkLine([[x + 6, y], [x + 10, y - 18]], .8, Z.leafDk, 'inkfine', .3); }
  }
  function bench(x, y, key) {
    boilSeed('bn' + key);
    paint(rrPts(x - 210, y - 120, 420, 34, 8), { wash: '#B98457', fill: '#8E5F38', fillOp: 50, tex: .6, ink: PAL.ink, sw: 1 });
    for (const dx of [-170, 150]) paint(rectPts(x + dx, y - 88, 22, 90), { wash: '#8E5F38', ink: PAL.ink, sw: .9 });
  }
  function jar(x, y, w, h, fill, key, peaFn) {                      // a glass jar, bottom-centre (x, y), filled 0..1 with seeds
    boilSeed('jr' + key);
    paint(rrPts(x - w / 2, y - h, w, h, 18), { wash: '#EAF2EE', washOp: 150, ink: null });
    if (fill > .01 && peaFn) { const fh = (h - 20) * fill, r = 13, rows = Math.max(1, Math.floor(fh / (r * 1.6))), per = Math.floor((w - 16) / (2 * r));
      for (let rr = 0; rr < rows; rr++) for (let j = 0; j < per; j++) peaFn(rr * per + j, x - w / 2 + 10 + r + j * 2 * r + (rr % 2) * 6, y - 8 - r - rr * r * 1.6, r); }
    boilSeed('jr2' + key);
    paint(rrPts(x - w / 2, y - h, w, h, 18), { wash: '#FFFFFF', washOp: 40, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x - w / 2 - 8, y - h - 22, w + 16, 26, 8), { wash: '#C9A27A', ink: PAL.ink, sw: 1 });
    paint(rrPts(x - w / 2 + 12, y - h + 20, 10, h - 50, 5), { wash: PAL.cream, washOp: 120, ink: null });
  }
  function slate(x, y, n, key) {                                    // a little slate with tally strokes (marks, not text)
    boilSeed('sl8' + key);
    paint(rrPts(x - 90, y - 60, 180, 120, 10), { wash: '#4E5A58', ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, gx = x - 70 + g * 52, gy = y - 36;
      if (j < 4) inkLine([[gx + j * 9, gy], [gx + j * 9 + 2, gy + 44]], 2, '#F2EEE2', 'ink', 0); else inkLine([[gx - 4, gy + 34], [gx + 36, gy + 8]], 2, '#F2EEE2', 'ink', 0); }
  }
  const HATU = (x, yb, u) => [x + .1 * u, yb - 4.75 * u];          // where the hat brim sits on a Pip at (x, yb)
  function hatOn(x, yb, u, flip, key) { const h = HATU(x, yb, u); hat(h[0] + (flip ? -.1 : 0) * u, h[1], 1.25 * u, key, flip ? .06 : -.06); }

  function shotB1(t, lt, dur) {                                    // the garden, the hat, the counting
    K.setT(t);
    const c = kf(t, [[L(3, -1.5), [960, 600, 1.08]], [L(3, 5.5), [900, 620, 1.12]], [L(3, 8), [600, 700, 1.4]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    gardenBg(t, 'b1');
    for (let i = 0; i < 7; i++) plant(820 + i * 165, 860, 330 + 50 * hash(i + 5), t, { key: 'gp' + i });
    for (let i = 0; i < 7; i++) { const top = [820 + i * 165, 860 - 220]; podShape(top[0] + 34, top[1] + 40 + 20 * hash(i), 26, 1.2, { key: 'gpp' + i }); flower(top[0] - 28, top[1] - 30 + 30 * hash(i + 1), 30, t, { key: 'gpf' + i }); }
    bench(470, 900, 'b1');
    slate(330, 760, Math.floor(clamp((t - L(3, 9.6)) / .45, 0, 14)), 'b1');
    const fill = clamp((t - L(3, 9.6)) / 7, 0, .45);
    jar(560, 780, 120, 150, fill, 'b1', (i, x, y, r) => pea(x, y, r, { key: 'jp' + i, seed: i, wr: hash(i + 7) < .25 ? 1 : 0 }));
    // Pip walks in, the hat hops onto its head, then it counts peas into the jar
    const w = stroll(t, L(3, .2), L(3, 4.4), 1500, 700, 32), x = w.x, y = 905;
    const gotHat = L(3, 5.4), hk = seg(t, L(3, 4.8), gotHat);
    const o = K.act(t, [[0, 'happy', { lookX: -.6 }], [L(3, 4.6), 'wow', { lookX: -.8, lookY: .5 }], [gotHat + .3, 'excited'], [L(3, 8.2), 'calm', { lookX: -.6, lookY: .4 }], [L(3, 11), 'smug', { lookX: -.6, lookY: .5 }]]);
    const counting = t > L(3, 9.4);
    const armF = counting ? { at: [2.3, -2.4 + .4 * Math.abs(Math.sin((t - L(3, 9.4)) * Math.PI / .45))] } : o.armF;
    pip(x, y, 32, { ...o, walk: w.walk, flip: true, armF, dy: (o.dy || 0) + (w.dy || 0), key: 'pb1' });
    if (hk <= 0) hat(330, 770 - 140, 40, 'bh');                     // resting on the bench... (drawn on the bench top)
    else if (hk < 1) { const p = arcPt([330, 630], HATU(x, y, 32), 140, ease(hk)); hat(p[0], p[1], lerp(40, 40, hk), 'bh', hk * 6); }
    else hatOn(x, y + (o.dy || 0) * 32, 32, true, 'bh');
    if (counting) for (let j = 0; j < 14; j++) { const t0 = L(3, 9.6) + j * .45, k = seg(t, t0 - .4, t0); if (k > 0 && k < 1) { const p = arcPt(K.hand(x, y, 32, [2.3, -2.4], { flip: true }), [560 + (hash(j) - .5) * 50, 700], 60, k); pea(p[0], p[1], 13, { key: 'cnt' + j, wr: hash(j + 7) < .25 ? 1 : 0 }); } }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#9CBF7E', Z.garden]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#9CBF7E', Z.garden]);
  }

  // a big pea flower in section: banner (opens with op), wings, and the keel cut open to show ten stamens round the pistil.
  // o.pollen 0..1: pollen walks from the anthers onto the stigma. o.cut 0..1: the stamens are snipped away.
  function bigFlower(x, y, s, t, o = {}) {
    boilSeed('bf' + (o.key || ''));
    const op = o.open ?? 1, sw = clamp(s / 220, .5, .85), col = o.col || Z.flower, dk = Z.flowerDk;
    paint(ribbon([[x - s * 1.5, y + s * .9], [x - s * 1.0, y + s * .45], [x - s * .45, y + s * .15]], s * .13, s * .1), { wash: Z.stem, ink: PAL.ink, sw });
    // banner: the big round petal standing up behind (it unfolds with op)
    const br = s * lerp(.45, .85, op), bx = x + s * .1, by = y - s * lerp(.25, .6, op);
    paint(ellPts(bx, by, br, br * .92, 30), { wash: col, fill: dk, fillOp: 50, tex: .5, ink: PAL.ink, sw, curv: .4 });
    for (let i = -2; i <= 2; i++) inkLine([[bx + i * br * .12, by + br * .75], [bx + i * br * .3, by - br * .55]], sw * .6, mixCol(dk, PAL.ink, .2), 'inkfine', .6);
    paint([[x - s * .55, y + s * .1], [x - s * .3, y - s * .25], [x + s * .0, y - s * .1], [x - s * .15, y + s * .25]], { wash: Z.leaf, ink: PAL.ink, sw });   // calyx
    // wing petal and the keel (a boat) in front
    paint(ellPts(x + s * .32, y - s * .02, s * .55, s * .3, 22, 0, -.15), { wash: mixCol(col, dk, .35), ink: PAL.ink, sw, curv: .4 });
    const kp = [[x - s * .15, y + s * .02], [x + s * .4, y + s * .1], [x + s * 1.0, y - s * .02], [x + s * .9, y + s * .3], [x + s * .4, y + s * .42], [x - s * .05, y + s * .32]];
    paint(kp, { wash: Z.keel, ink: PAL.ink, sw, curv: .5 });
    if (o.section) {                                                // the inside of the keel, seen through a window
      paint([[x + s * .02, y + s * .14], [x + s * .4, y + s * .2], [x + s * .9, y + s * .08], [x + s * .82, y + s * .27], [x + s * .4, y + s * .34], [x + s * .05, y + s * .27]], { wash: '#FFF7EC', ink: mixCol(PAL.ink, Z.keel, .4), sw: sw * .6, curv: .5 });
      inkLine([[x + s * .08, y + s * .24], [x + s * .45, y + s * .26], [x + s * .78, y + s * .17], [x + s * .84, y + s * .12]], .7, Z.leafDk, 'ink', .6);   // pistil
      paint(ellPts(x + s * .85, y + s * .12, s * .05, s * .05, 10), { wash: '#B9D47A', ink: PAL.ink, sw: sw * .6 });   // stigma
      const cut = o.cut || 0;
      for (let i = 0; i < 5; i++) { const ax = x + s * (.5 + i * .065), ay = y + s * (.17 + .015 * Math.sin(i * 2)), fall = cut > 0 ? easeIn(seg(cut, i * .1, i * .1 + .5)) * s * 1.6 : 0;
        if (fall < s * 1.5) { if (!cut) inkLine([[x + s * .12, y + s * .3], [ax, ay + s * .03]], sw * .6, '#C9B7A0', 'inkfine', .5);
          paint(ellPts(ax, ay + fall, s * .042, s * .028, 8), { wash: Z.pollen, ink: PAL.ink, sw: sw * .4 }); } }
      const pk = o.pollen || 0;
      if (pk > 0) for (let i = 0; i < 8; i++) { const k = seg(pk, i * .08, i * .08 + .45); if (k <= 0) continue;
        const p = arcPt([x + s * (.52 + .05 * (i % 5)), y + s * .17], [x + s * (.85 + .03 * Math.sin(i * 2)), y + s * (.1 + .02 * Math.cos(i))], s * .1, ease(k));
        paint(ellPts(p[0], p[1], s * .022, s * .022, 6), { wash: Z.pollenDk, ink: null }); }
    }
  }
  function bag(x, y, s, k, key) {                                  // a paper bag over a flower, dropping on with k
    if (k <= .02) return; boilSeed('bag' + key);
    const dy = (1 - easeOut(k)) * -s * 2;
    paint([[x - s * .9, y + s * .55 + dy], [x - s * .75, y - s * 1.35 + dy], [x + s * 1.35, y - s * 1.45 + dy], [x + s * 1.5, y + s * .5 + dy]], { wash: '#E9DCC0', fill: '#CDB990', fillOp: 50, tex: .6, ink: PAL.ink, sw: 1.1, curv: .2 });
    inkLine([[x - s * .85, y + s * .35 + dy], [x + s * 1.45, y + s * .3 + dy]], 2, '#A88763', 'ink', .2);
  }
  function scissors(x, y, s, ang, open, key) {
    boilSeed('sc' + key); push(); translate(x, y); rotate(ang);
    for (const sg of [-1, 1]) { push(); rotate(sg * open * .35);
      paint([[0, -s * .06], [s * 1.0, -s * .02], [s * 1.0, s * .02], [0, s * .06]], { wash: '#C9CDD3', ink: PAL.ink, sw: .8 });
      paint(ellPts(-s * .35, sg * s * .16, s * .2, s * .13, 12), { wash: Z.clay = '#D97757', ink: PAL.ink, sw: .8 }); pop(); }
    pop();
  }
  function minibrush(x, y, ang, s, loaded, key) {                   // a small paintbrush; the tip carries pollen when loaded
    boilSeed('mbr' + key); push(); translate(x, y); rotate(ang);
    paint(ribbon([[-s * .8, 0], [0, 0], [s * .5, 0]], s * .07, s * .05), { wash: '#B5583E', ink: PAL.ink, sw: .8 });
    paint(ribbon([[s * .5, 0], [s * .7, 0], [s * .9, 0]], s * .11, s * .02), { wash: loaded ? Z.pollen : '#E9DCC0', ink: PAL.ink, sw: .8 });
    pop();
  }
  function bubbleSeeds(cx, cy, k, t, key) {                         // the paint guess: round + wrinkled → a half-crumpled seed
    if (k <= .02) return;
    pea(cx - 110, cy, 26, { key: key + 'a', q: k }); pea(cx - 40, cy, 26, { key: key + 'b', wr: 1, q: k });
    arrow(cx - 5, cy, cx + 45, cy, k, Z.pink, key + 'ar', 9);
    pea(cx + 100, cy, 34, { key: key + 'c', wr: .5, q: k, col: mixCol(Z.yel, Z.pink, .25) });
  }
  function meltSeed(cx, cy, k, t, key) {                             // a wrinkled seed melting into a puddle, looping
    const m = frac(t * .35), q = ease(clamp(m * 1.6));
    boilSeed('mlt' + key);
    paint(ellPts(cx, cy + 34, 30 + 30 * q, 8 + 4 * q, 16), { wash: mixCol(Z.yel, Z.mud, .4), washOp: 255 * k, ink: null });
    pea(cx, cy + 34 * q - 4, 30 * (1 - .7 * q), { key: key + 's', wr: 1, q: k });
  }
  function peekSeed(cx, cy, k, t, key) {                             // a wrinkled seed peeking out from behind a round one
    const pk = .5 + .5 * Math.sin(t * 1.8);
    pea(cx + 22 * pk, cy - 12 * pk, 24, { key: key + 'w', wr: 1, q: k });
    pea(cx - 8, cy + 6, 34, { key: key + 'r', q: k });
  }

  function shotB2(t, lt, dur) {                                    // the flower that pollinates itself; pure lines; round vs wrinkled
    K.setT(t);
    const c = kf(t, [[L(4, -1.2), [560, 610, 1.5]], [L(4, 4.6), [560, 610, 1.5]], [L(4, 6.0), [1180, 560, 1.0]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    gardenBg(t, 'b2');
    const op = ease(seg(t, L(4, 3.4), L(4, 4.6)));
    bigFlower(470, 520, 170, t, { key: 'bf', open: lerp(.05, 1, op), section: 1, pollen: seg(t, L(4, .4), L(4, 3.2)) });
    ringK(470 + 170 * .85, 520 + 170 * .12, 30, 30, seg(t, L(4, 2.6), L(4, 3.6)), Z.gold, 'stg', 4);
    // two pure lines: plant → pod → plant → pod, the same each time
    const lineY = [470, 790];
    for (let row = 0; row < 2; row++) for (let g = 0; g < 3; g++) {
      const x = 900 + g * 300, y = lineY[row], k = seg(t, L(4, 4.2) + g * .7 + row * .25, L(4, 4.6) + g * .7 + row * .25); if (k <= 0) continue;
      podShape(x, y, 95 * backOut(k), 0, { key: 'pl' + row + g, open: 1, n: 4, peas: (i, px, py, r) => pea(px, py, r * 1.05, { key: 'plp' + row + g + i, wr: row, seed: i + g }) });
      if (g < 2) arrow(x + 115, y, x + 185, y, seg(t, L(4, 4.8) + g * .7, L(4, 5.3) + g * .7), Z.leafDk, 'pla' + row + g, 8);
    }
    // the two seeds of the pair, big, at the right end; a bracket joins them
    const pk = seg(t, L(4, 7.8), L(4, 8.4)), wk = seg(t, L(4, 9.3), L(4, 9.9));
    pea(1690, 470, 62, { key: 'bigR', q: backOut(pk), hi: .4 * near(t, L(4, 12.4), .5) });
    pea(1690, 790, 62, { key: 'bigW', wr: 1, q: backOut(wk), hi: .4 * near(t, L(4, 12.8), .5) });
    const bk = seg(t, L(4, 11.4), L(4, 12.4));
    if (bk > 0) { boilSeed('brk'); inkLine([[1790, 470], [1790 + 40 * ease(bk), 470], [1790 + 40 * ease(bk), lerp(470, 790, ease(bk))], [1790, lerp(470, 790, ease(bk))]], 3, Z.gold, 'ink', 0); }
    ringK(1690, 470, 80, 80, seg(t, L(4, 12.2), L(4, 13)), Z.gold, 'pR'); ringK(1690, 790, 80, 80, seg(t, L(4, 12.6), L(4, 13.4)), Z.gold, 'pW');
    const zz = c[2];
    const P = t < L(4, 5.4) ? [300, 905] : [620, 960];
    pip(P[0], P[1], t < L(4, 5.4) ? 30 : 30, { ...K.act(t, [[L(4, -1.2), 'calm', { lookX: .7, lookY: -.8 }], [L(4, 3.0), 'wow', { lookX: .8, lookY: -.8 }], [L(4, 5.4), 'calm', { lookX: .8, lookY: -.5 }], [L(4, 8.6), 'happy', { lookX: 1, lookY: -.3 }], [L(4, 12.4), 'idea', { lookX: 1, lookY: -.2 }]]), key: 'pb2' });
    hatOn(P[0], P[1], 30, false, 'b2h');
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#9CBF7E', Z.garden]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#9CBF7E', Z.garden]);
  }

  const FM = [640, 770], FF = [1300, 770];                         // the mother flower (round line), the father flower (wrinkled line)
  function shotB3(t, lt, dur) {                                    // the cross, the guess, F1 all round, the hidden question
    K.setT(t);
    const c = kf(t, [[L(5, -1), [970, 760, 1.7]], [L(5, 9.6), [970, 760, 1.7]], [L(5, 11), [960, 720, 1.55]], [L(6, 9), [960, 720, 1.55]], [L(6, 10), [960, 700, 1.6]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    gardenBg(t, 'b3');
    // the two parent plants with their seeds on a dish at their feet
    for (const [F, wr, k] of [[FM, 0, 'm'], [FF, 1, 'f']]) {
      plant(F[0] - 40, 905, 190, t, { key: 'pp' + k, leafS: 1.3 });
      boilSeed('dish' + k); paint(ellPts(F[0] - 40, 935, 70, 16, 18), { wash: '#C9A27A', ink: PAL.ink, sw: 1 });
      pea(F[0] - 62, 912, 22, { key: 'dp' + k + 1, wr, seed: 1 }); pea(F[0] - 20, 914, 22, { key: 'dp' + k + 2, wr, seed: 4 });
      ringK(F[0] - 40, 912, 70, 40, seg(t, L(5, 13.5) + (wr ? 1.4 : 0), L(5, 14.3) + (wr ? 1.4 : 0)), Z.gold, 'dr' + k);
    }
    const cutK = seg(t, L(5, 1.6), L(5, 3.2));
    bigFlower(FM[0], FM[1] - 20, 58, t, { key: 'fm', section: 1, cut: cutK, open: .35, pollen: seg(t, L(5, 8.2), L(5, 9.2)) });
    bigFlower(FF[0], FF[1] - 20, 58, t, { key: 'ff', section: 1, open: .5 });
    // the pod grows on the mother (under the bag), then opens on the answer
    const bagOn = seg(t, L(5, 3.4), L(5, 4.2)) * (1 - seg(t, L(6, 3.6), L(6, 4.2))), lift = near(t, L(5, 8.6), .6);
    const podK = seg(t, L(5, 10.0), L(5, 11.6)), openK = seg(t, L(6, 4.4), L(6, 5.2));
    if (podK > 0) podShape(FM[0] + 70, FM[1] + 60, 80 * ease(podK), .35, { key: 'f1pod', open: openK, n: 5, peas: (i, x, y, r) => pea(x, y, r * 1.1, { key: 'f1' + i, seed: i }) });
    bag(FM[0], FM[1] - 20 - lift * 60, 58, bagOn, 'bm');
    if (openK > 0) for (let i = 0; i < 5; i++) K.sparkle(FM[0] + 70 + (i - 2) * 30, FM[1] + 20, 20, seg(t, L(6, 5.0) + i * .1, L(6, 5.8) + i * .1), '#FFF3C4');
    qmark(FM[0] + 70, FM[1] - 40, 26, seg(t, L(5, 12.0), L(5, 12.4)) * (1 - seg(t, L(6, 4.0), L(6, 4.3))), 'pod');
    // Pip: snip, bag, hop over for pollen, back, dust it on
    const xs = kf(t, [[L(5, -1), 860], [L(5, 4.6), 860], [L(5, 5.5), 1100], [L(5, 6.6), 1100], [L(5, 7.4), 860], [L(5, 11), 860], [L(5, 12), 1000]], ease);
    const hopK = [[L(5, 4.6), L(5, 5.5)], [L(5, 6.6), L(5, 7.4)], [L(5, 11), L(5, 12)]].reduce((a, [a0, a1]) => { const j = jump(t, a0, a1, 1.1); return { dy: a.dy + j.dy, sq: a.sq + j.sq }; }, { dy: 0, sq: 0 });
    const faceL = t < L(5, 4.6) || (t > L(5, 7.2) && t < L(5, 11));
    const keys = [[L(5, -1), 'calm', { lookX: .8, lookY: -.6 }], [L(5, 1.4), 'strain', { lookY: -.6 }], [L(5, 3.4), 'smug'], [L(5, 5.6), 'happy', { lookY: -.6 }], [L(5, 7.6), 'calm', { lookY: -.7 }], [L(5, 9.4), 'smug'],
      [L(5, 12.2), 'calm', { lookX: -.5, lookY: -.7 }], [L(6, .2), 'calm', { lookX: .2, lookY: -.9 }], [L(6, 5.0), 'wow', { lookX: -.6, lookY: -.3, take: .9 }], [L(6, 9.6), 'confused']];
    const o = K.act(t, keys);
    const tool = t < L(5, 3.4) ? 'sc' : t < L(5, 9.6) && t > L(5, 4.4) ? 'br' : null;
    const at = tool ? [2.3, -3.4] : o.armF && o.armF.at ? o.armF.at : null;
    const y = 905, u = 30;
    pip(xs, y, u, { ...o, flip: faceL, dy: o.dy + hopK.dy, sq: o.sq + hopK.sq, ...(tool ? { armF: { at } } : {}), key: 'pb3' });
    hatOn(xs, y + (o.dy + hopK.dy) * u, u, faceL, 'b3h');
    if (tool) { const h = K.hand(xs, y, u, at, { flip: faceL, dy: o.dy + hopK.dy });
      if (tool === 'sc') scissors(h[0], h[1], 46, faceL ? Math.PI + .5 : -.5, .5 + .5 * Math.sin(t * 14), 'sc');
      else minibrush(h[0], h[1], faceL ? Math.PI + .6 : -.6, 90, t > L(5, 5.9), 'mb'); }
    // the guess bubble, then the cross on it; then the two little questions
    const from = [xs, y - 6.5 * u];
    const gk = seg(t, L(6, 0), L(6, .5)) * (1 - seg(t, L(6, 8.6), L(6, 9.1)));
    cloud(xs + 20, 545, 200, 78, gk, from, 'guess');
    bubbleSeeds(xs + 20, 545, gk, t, 'gs');
    K.cross(xs + 120, 545, 100, seg(t, L(6, 6.2), L(6, 6.8)), 'gx');
    const q1 = seg(t, L(6, 9.8), L(6, 10.3)), q2 = seg(t, L(6, 11.8), L(6, 12.3));
    cloud(xs - 150, 560, 115, 85, q1, from, 'q1'); if (q1 > .2) meltSeed(xs - 150, 550, q1, t, 'ms');
    cloud(xs + 170, 560, 115, 85, q2, from, 'q2'); if (q2 > .2) peekSeed(xs + 170, 565, q2, t, 'pk');
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#9CBF7E', Z.garden]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#9CBF7E', Z.garden]);
  }

  function shotB4(t, lt, dur) {                                    // F1 selfs; F2: wrinkled comes back, identical
    K.setT(t);
    const c = kf(t, [[L(7, -1), [900, 780, 1.7]], [L(7, 2.2), [900, 720, 1.55]], [L(7, 7.0), [860, 720, 1.5]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    gardenBg(t, 'b4');
    const g = ease(seg(t, L(7, 0), L(7, 2.6)));
    const top = plant(960, 905, 320, t, { key: 'f1p', grow: Math.max(.05, g), leafS: 1.2 });
    if (g < .3) pea(960, 900 - 20 * g, 18, { key: 'f1seed' });
    const fk = seg(t, L(7, 2.2), L(7, 2.8));
    if (fk > 0 && t < L(7, 5.2)) { bigFlower(top[0] + 20, top[1] + 30, 48 * backOut(fk), t, { key: 'f1f', open: .4, section: 1, pollen: seg(t, L(7, 3.0), L(7, 4.6)) });
      ringK(top[0] + 20 + 48 * .85, top[1] + 30 + 48 * .12, 20, 20, seg(t, L(7, 4.2), L(7, 5)), Z.gold, 'self'); }
    const F2 = [[0, 0, 1, 0, 0], [0, 1, 0, 0, 0]];                 // two pods: round, round, WRINKLED...
    const pods = [[860, 640, -.25], [1080, 600, .3]];
    pods.forEach(([x, y, a], j) => { const k = seg(t, L(7, 4.8) + j * .3, L(7, 5.6) + j * .3), ok = seg(t, L(7, 5.6) + j * .3, L(7, 6.2) + j * .3);
      if (k > 0) podShape(x, y, 100 * ease(k), a, { key: 'f2p' + j, open: ok, n: 5, peas: (i, px, py, r) => pea(px, py, r * 1.1, { key: 'f2' + j + i, seed: i + j * 5, wr: F2[j][i], hi: F2[j][i] ? .3 * near(t, L(7, 6.6), .4) : 0 }) }); });
    // the wrinkled grandparent drifts in as a ghost and lands on the new wrinkled seed: a perfect match
    const W1 = [860 + Math.cos(-.25) * (-(.5 / 5 * 1.7 - .85) * 0 + (2.5 / 5 - .5) * 1.7 * 100) , 0];
    const tgt = (() => { const u = ((2 + .5) / 5 - .5) * 1.7 * 100, a = -.25; return [860 + Math.cos(a) * u, 640 + Math.sin(a) * u]; })();
    const gk = seg(t, L(7, 7.6), L(7, 9.4));
    if (gk > 0 && gk < 1) { const p = arcPt([470, 870], tgt, 180, ease(gk)); boilSeed('ghost'); pea(p[0], p[1], 19, { key: 'gh', wr: 1, hi: .6 }); }
    if (t < L(7, 9.4) && t > L(7, 7.2)) pea(470, 870, 19, { key: 'ghsrc', wr: 1, hi: .5, q: 1 - seg(t, L(7, 7.4), L(7, 7.8)) });
    ringK(tgt[0], tgt[1], 32, 32, seg(t, L(7, 9.4), L(7, 10.2)), Z.gold, 'match');
    K.check(tgt[0] + 60, tgt[1] - 60, 60, seg(t, L(7, 9.8), L(7, 10.4)), 'mt');
    pip(560, 905, 30, { ...K.act(t, [[L(7, -1), 'calm', { lookX: .8, lookY: -.3 }], [L(7, 2.8), 'calm', { lookX: .7, lookY: -.9 }], [L(7, 6.4), 'wow', { lookX: .8, lookY: -.6, take: .9 }], [L(7, 9.8), 'excited']]), key: 'pb4' });
    hatOn(560, 905, 30, false, 'b4h');
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#9CBF7E', Z.garden]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#9CBF7E', Z.garden]);
  }

  // the 3 : 1 row: three round, one wrinkled
  function row31(cx, cy, r, k, t, key, o = {}) {
    for (let i = 0; i < 4; i++) { const kk = seg(k, i * .15, i * .15 + .4); if (kk <= 0) continue;
      const wr = i === 3 ? 1 : 0, hi = wr ? (o.hiW || 0) : (o.hiR || 0);
      pea(cx + (i - 1.5) * r * 2.5 + (i === 3 ? r * .5 : 0), cy - (1 - easeOut(kk)) * 60, r, { key: key + i, wr, seed: i + 2, q: backOut(kk), hi }); }
  }
  function shotB5(t, lt, dur) {                                    // the counting jars; 3:1; dominant, recessive; paint vs marbles
    K.setT(t);
    const c = kf(t, [[L(8, -.8), [960, 600, 1.15]], [L(9, -.5), [960, 600, 1.15]], [L(9, .6), [960, 560, 1.0]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    gardenBg(t, 'b5');
    const away = ease(seg(t, L(9, -.6), L(9, .4)));
    const fr = clamp((t - L(8, 2.4)) / 4.4), fw = clamp((t - L(8, 2.9)) / 4.4) / 3;
    push(); translate(0, away * 700);
    bench(960, 960, 'b5');
    jar(780, 838, 210, 330, .92 * fr, 'jR', (i, x, y, r) => pea(x, y, r, { key: 'jr' + i, seed: i }));
    jar(1140, 838, 210, 330, .92 * fw, 'jW', (i, x, y, r) => pea(x, y, r, { key: 'jw' + i, seed: i, wr: 1 }));
    for (const [jx, k0] of [[780, L(8, 2.4)], [1140, L(8, 2.9)]]) if (t > k0 && t < k0 + 4.4) for (let j = 0; j < 5; j++) { const f = frac((t - k0) * 1.6 + j / 5); pea(jx + 10 * Math.sin(j * 2), 300 + f * 300, 12, { key: 'fall' + jx + j, wr: jx > 1000 ? 1 : 0 }); }
    pop();
    const rk = seg(t, L(8, 7.4), L(8, 8.6)) * (1 - seg(t, L(9, -.8), L(9, -.2)));
    row31(960, 300, 40, rk, t, 'r31a', { hiR: .45 * near(t, L(8, 10.2), .6), hiW: .45 * near(t, L(8, 13.6), .6) });
    ringK(910, 300, 160, 60, seg(t, L(8, 9.8), L(8, 10.8)), Z.gold, 'dom'); ringK(1130, 300, 58, 58, seg(t, L(8, 13.2), L(8, 14.2)), Z.gold, 'rec');
    // L9: paint drops merge (left) vs marbles clink and stay themselves (right)
    const a9 = seg(t, L(9, .3), L(9, .8)) * (1 - seg(t, L(9, 9.6), L(9, 10.2)));
    if (a9 > 0) {
      card(560, 500, 520, 400, a9, 'pc'); card(1360, 500, 520, 400, a9, 'mc');
      const m = ease(seg(t, L(9, 1.0), L(9, 3.0)));
      if (m < .98) { drop(470 + 90 * m, 520, 78 * a9, mixCol(Z.red, Z.pink, m), 'd9r'); drop(650 - 90 * m, 520, 78 * a9, mixCol(Z.white, Z.pink, m), 'd9w'); }
      if (m > .5) drop(560, 520, 78 + 24 * ease((m - .5) * 2), Z.pink, 'd9p');
      const mk = seg(t, L(9, 3.6), L(9, 5.0)), hit = L(9, 5.0), back = ease(seg(t, hit, hit + .8));
      const dx = lerp(170, 64, easeIn(mk)) + 50 * back;
      marble(1360 - dx, 520, 64 * a9, 'R', { key: 'm9a', glow: .5 * ease(seg(t, L(9, 7.2), L(9, 8))) });
      marble(1360 + dx, 520, 64 * a9, 'r', { key: 'm9b', glow: .5 * ease(seg(t, L(9, 7.4), L(9, 8.2))) });
      K.burst(1360, 520, 70, seg(t, hit, hit + .45), PAL.ink, 'clk');
      K.check(1500, 380, 70, seg(t, L(9, 6.2), L(9, 6.8)), 'mok');
    }
    const qk = seg(t, L(9, 10.2), L(9, 11));
    row31(960, 540, 62, qk, t, 'r31b');
    qmark(1000, 360, 44, seg(t, L(9, 11.0), L(9, 11.4)), '31');
    const P = [t < L(9, 0) ? 420 : 300, 960];
    pip(P[0], P[1], 32, { ...K.act(t, [[L(8, -.8), 'calm', { lookX: .8, lookY: -.3 }], [L(8, 2.6), 'happy', { lookX: .9, lookY: -.4 }], [L(8, 8.6), 'wow', { lookX: .8, lookY: -.8 }], [L(8, 10.4), 'smug', { lookX: .8, lookY: -.8 }],
      [L(8, 13.2), 'calm', { lookX: .9, lookY: -.8 }], [L(9, 1.0), 'calm', { lookX: .6, lookY: -.6 }], [L(9, 3.2), 'worried', { lookX: .5, lookY: -.5 }], [L(9, 5.2), 'excited', { lookX: .9, lookY: -.5 }], [L(9, 10.6), 'confused'], [L(9, 13.2), 'idea']]), key: 'pb5' });
    hatOn(P[0], P[1], 32, false, 'b5h');
    camEnd();
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B6C8D8', Z.board]);
    if (lt < .3) brushWipe(.5 + lt / .6, ['#9CBF7E', Z.garden]);
  }

  // ================================ C: the thinking board (L10–L17) ================================
  // a pea with its pair laid out below it: the seed at (x, y), marbles at (x ± d, y + r * 1.4)
  const mPos = (x, y, r, i) => [x + (i ? 1 : -1) * r * .42, y + r * 1.42];
  function cradle(x, y, r, a, key) { if (a <= .02) return; boilSeed('cra' + key); paint(rrPts(x - r * .95, y + r * 1.0, r * 1.9, r * .84, r * .4), { wash: PAL.cream, washOp: 210 * a, ink: mixCol(PAL.ink, PAL.cream, .35), sw: .9 * a }); }
  const hostC = (t, keys, o = {}) => host(o.x ?? 210, o.y ?? 960, 32, t, keys, { talk: true, ...o.extra }, o.key || 'pc');

  function shotC1(t, lt, dur) {                                    // the clues: F1 holds two marbles; one from each parent; how many go on?
    K.setT(t);
    cam(960 + 8 * wob(t, .05), 540 + 6 * wob(t, .04), 1);
    boardBg(t, 'c1');
    const F = [960, 400], R0 = 92;
    const mid = L(11, 9.6), out = ease(seg(t, mid, mid + 1.2));      // parents leave, F1 moves up for the gametes question
    const Fy = F[1] - 90 * out;
    // F1 seed and its cradle; the marbles show as the clues land, then (L11) fly in again from the parents
    pea(F[0], Fy, R0, { key: 'F1', hi: .3 * near(t, L(10, 2.2), .6) });
    cradle(F[0], Fy, R0, ease(seg(t, L(10, 2.6), L(10, 3.2))), 'F1');
    const reR = seg(t, L(11, .6), L(11, 1.8)), rer = seg(t, L(11, 2.8), L(11, 4.0));
    const PL = [430, 420], PR = [1490, 420], pin = ease(seg(t, L(10, 12.4), L(10, 13.2))) * (1 - out);
    // first sighting (L10): R glows in at 3.2, r at 9.6; on L11 they're re-sent from the parents
    const showR = t < L(11, .5) ? popK(t, L(10, 3.2)) : 0, showr = t < L(11, .5) ? popK(t, L(10, 9.4)) : 0;
    const [a0, a1] = [mPos(F[0], Fy, R0, 0), mPos(F[0], Fy, R0, 1)];
    if (showR > 0) marble(a0[0], a0[1], 30, 'R', { key: 'f1R', q: showR, glow: .5 * near(t, L(10, 3.6), .6) });
    if (showr > 0) marble(a1[0], a1[1], 30, 'r', { key: 'f1r', q: showr, glow: .5 * near(t, L(10, 9.8), .6) });
    if (t > L(11, .5)) {
      const p0 = reR > 0 ? arcPt(mPos(PL[0], PL[1], 70, 0), a0, 160, ease(reR)) : null, p1 = rer > 0 ? arcPt(mPos(PR[0], PR[1], 70, 1), a1, 160, ease(rer)) : null;
      if (p0) marble(p0[0], p0[1], 30, 'R', { key: 'f1R' }); if (p1) marble(p1[0], p1[1], 30, 'r', { key: 'f1r' });
    }
    // the offspring clue: a wrinkled seed among its children
    const ck = seg(t, L(10, 6.4), L(10, 7.2)) * (1 - seg(t, L(10, 11.6), L(10, 12.2)));
    if (ck > 0) { arrow(F[0] + 110, Fy + 40, 1260, 640, ck, Z.leafDk, 'clue', 9); pea(1330, 680, 50, { key: 'clW', wr: 1, q: backOut(ck), hi: .3 * near(t, L(10, 8), .6) });
      pea(1430, 700, 40, { key: 'clR1', q: backOut(ck) }); pea(1240, 740, 40, { key: 'clR2', q: backOut(ck), seed: 5 }); }
    // the parents, with "?" — then their own pairs (L11)
    if (pin > .02) {
      const pairK = ease(seg(t, L(11, 5.0), L(11, 5.8)));
      pea(PL[0], PL[1], 70, { key: 'pL', q: pin, hi: .3 * near(t, L(11, .6), .5) }); pea(PR[0], PR[1], 70, { key: 'pR', wr: 1, q: pin, hi: .3 * near(t, L(11, 2.8), .5) });
      cradle(PL[0], PL[1], 70, pairK * pin, 'pL'); cradle(PR[0], PR[1], 70, pairK * pin, 'pR');
      for (let i = 0; i < 2; i++) { const a = mPos(PL[0], PL[1], 70, i), b = mPos(PR[0], PR[1], 70, i);
        if (pairK > 0) { marble(a[0], a[1], 22, 'R', { key: 'pLm' + i, q: pairK * pin }); marble(b[0], b[1], 22, 'r', { key: 'pRm' + i, q: pairK * pin }); } }
      // the marble each parent gives travels out of it (drawn above, as p0/p1); a ghost marks where it left
      qmark(PL[0] + 60, PL[1] - 110, 30, seg(t, L(10, 13), L(10, 13.4)) * (1 - seg(t, L(11, .3), L(11, .6))), 'pl');
      qmark(PR[0] + 60, PR[1] - 110, 30, seg(t, L(10, 13.3), L(10, 13.7)) * (1 - seg(t, L(11, .3), L(11, .6))), 'pr');
      ringK(F[0], Fy + R0 * 1.42, 110, 44, seg(t, L(11, 6.6), L(11, 7.5)), Z.gold, 'pair1'); ringK(PL[0], PL[1] + 99, 80, 34, seg(t, L(11, 6.9), L(11, 7.8)), Z.gold, 'pair2'); ringK(PR[0], PR[1] + 99, 80, 34, seg(t, L(11, 7.2), L(11, 8.1)), Z.gold, 'pair3');
      arrow(PL[0] + 90, PL[1] + 30, F[0] - 120, Fy + 30, seg(t, L(11, .4), L(11, 1.2)) * pin, '#9AAEC2', 'aL', 8);
      arrow(PR[0] - 90, PR[1] + 30, F[0] + 120, Fy + 30, seg(t, L(11, 2.6), L(11, 3.4)) * pin, '#9AAEC2', 'aR', 8);
    }
    // the question: a pollen grain and an egg, each with an empty socket
    const gq = seg(t, L(11, 11.2), L(11, 12.0));
    if (gq > 0) { arrow(F[0] - 60, Fy + 190, 700, 700, gq, '#9AAEC2', 'gq1', 8); arrow(F[0] + 60, Fy + 190, 1220, 700, gq, '#9AAEC2', 'gq2', 8);
      pollen(640, 780, 70, '?', { key: 'gqP', q: backOut(gq) }); egg(1280, 780, 70, '?', { key: 'gqE', q: backOut(seg(t, L(11, 12.4), L(11, 13.2))) }); }
    hostC(t, [[L(10, -1.5), 'calm', { lookX: .9, lookY: -.6 }], [L(10, 3.4), 'wow', { lookX: .9, lookY: -.6 }], [L(10, 7.6), 'calm', { lookX: 1, lookY: -.3 }], [L(10, 9.8), 'idea'], [L(10, 13.6), 'confused'],
      [L(11, .8), 'wow', { lookX: .9, lookY: -.6 }], [L(11, 5.6), 'happy', { lookX: .9, lookY: -.5 }], [L(11, 12.4), 'confused']]);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B6C8D8', Z.board]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B6C8D8', Z.board]);
  }

  function shotC2(t, lt, dur) {                                    // both? 2 → 4 → 8, impossible; so one each: the pair splits
    K.setT(t);
    cam(960 + 8 * wob(t, .05), 540 + 6 * wob(t, .04), 1);
    boardBg(t, 'c2');
    const F = [960, 310], R0 = 92;
    const bad = t < L(12, 6.6);
    const rew = seg(t, L(12, 6.4), L(12, 7.2));
    pea(F[0], F[1], R0, { key: 'F1' }); cradle(F[0], F[1], R0, 1, 'F1');
    const a0 = mPos(F[0], F[1], R0, 0), a1 = mPos(F[0], F[1], R0, 1);
    const gP = [640, 780], gE = [1280, 780];
    if (bad) {
      marble(a0[0], a0[1], 30, 'R', { key: 'f1R' }); marble(a1[0], a1[1], 30, 'r', { key: 'f1r' });
      // copies of BOTH go into the pollen and into the egg
      const k1 = seg(t, L(12, .2), L(12, 1.4));
      pollen(gP[0], gP[1], 80, null, { key: 'bp' }); egg(gE[0], gE[1], 80, null, { key: 'be' });
      for (const [g, kk] of [[gP, 'p'], [gE, 'e']]) for (let i = 0; i < 2; i++) { const p = arcPt(i ? a1 : a0, [g[0] + (i ? 22 : -22), g[1]], 120, ease(k1)); if (k1 > 0) marble(p[0], p[1], 22, i ? 'r' : 'R', { key: 'cp' + kk + i }); }
      // the next generation: a seed with 4, then 8, bulging
      const n4 = seg(t, L(12, 1.9), L(12, 2.6)), n8 = seg(t, L(12, 3.7), L(12, 4.4));
      if (n4 > 0) { const S = [960, 560 + 0 * n8]; const sw = 1 + .25 * ease(n8) + .05 * Math.sin(t * 9) * n8;
        boilSeed('bulge'); paint(ellPts(S[0], S[1], 120 * sw * backOut(n4), 110 * sw * backOut(n4), 26), { wash: Z.yel, fill: Z.yelDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.2 });
        const n = n8 > .5 ? 8 : 4; for (let i = 0; i < n; i++) { const a = i / n * TAU + .3, rr = n === 8 ? 70 * sw : 45; marble(S[0] + Math.cos(a) * rr, S[1] + Math.sin(a) * rr * .8, n === 8 ? 24 : 28, i % 2 ? 'r' : 'R', { key: 'b' + n + i, q: backOut(n === 8 ? n8 * 2 - 1 : n4) }); }
        K.cross(960, 560, 260, seg(t, L(12, 5.0), L(12, 5.6)), 'bx'); }
    } else {
      // the rule: the pair splits, one marble to each gamete
      const sp = ease(seg(t, L(12, 8.6), L(12, 10.4)));
      const pP = arcPt(a0, gP, 160, sp), pE = arcPt(a1, gE, 160, sp);
      pollen(gP[0], gP[1], 80, null, { key: 'gp', q: backOut(seg(t, L(12, 7.4), L(12, 8.0))) }); egg(gE[0], gE[1], 80, null, { key: 'ge', q: backOut(seg(t, L(12, 7.7), L(12, 8.3))) });
      marble(pP[0], pP[1], 30, 'R', { key: 'f1R', glow: .5 * near(t, L(12, 12), .8) }); marble(pE[0], pE[1], 30, 'r', { key: 'f1r', glow: .5 * near(t, L(12, 12), .8) });
      K.burst((a0[0] + a1[0]) / 2, a0[1], 80, seg(t, L(12, 8.6), L(12, 9.1)), Z.gold, 'split');
      if (sp >= 1) { K.sparkle(gP[0] + 60, gP[1] - 70, 30, seg(t, L(12, 10.4), L(12, 11.2)), '#FFF3C4'); K.sparkle(gE[0] + 60, gE[1] - 70, 30, seg(t, L(12, 10.6), L(12, 11.4)), '#FFF3C4'); }
      ringK(gP[0], gP[1], 110, 110, seg(t, L(12, 12.0), L(12, 12.9)), Z.gold, 'g1'); ringK(gE[0], gE[1], 110, 110, seg(t, L(12, 12.3), L(12, 13.2)), Z.gold, 'g2');
      if (rew < 1) flash(.5 * (1 - rew), '#EEF3F7');
    }
    hostC(t, [[L(12, -1.6), 'calm', { lookX: .9, lookY: -.5 }], [L(12, 2.2), 'worried', { lookX: .9, lookY: -.2 }], [L(12, 4.2), 'dizzy'], [L(12, 7.0), 'calm', { lookX: .9, lookY: -.4 }], [L(12, 10.6), 'idea'], [L(12, 13.0), 'happy']]);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B6C8D8', Z.board]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B6C8D8', Z.board]);
  }

  // the 2×2: pollen across the top, eggs down the side, the four meetings in the cells
  const G2 = { x0: 820, y0: 300, c: 210 };
  const g2cell = (i, j) => [G2.x0 + (i + .5) * G2.c, G2.y0 + (j + .5) * G2.c];
  function shotC3(t, lt, dur) {                                    // you work it out: R r × R r → 3 : 1
    K.setT(t);
    const c = kf(t, [[L(13, -1.6), [960, 540, 1.0]], [L(14, 13.4), [960, 540, 1.0]], [L(14, 14.4), [1060, 560, .92]]], ease);
    cam(c[0] + 8 * wob(t, .05), c[1] + 6 * wob(t, .04), c[2]);
    boardBg(t, 'c3');
    // the two codes: dark blue = round factor, pale = wrinkled factor
    const legend = ease(seg(t, L(13, .4), L(13, 1.0))) * (1 - seg(t, L(13, 7.4), L(13, 8.0)));
    if (legend > .02) { marble(760, 330, 44, 'R', { key: 'lgR', q: legend, glow: .4 * near(t, L(13, 1.6), .5) }); arrow(820, 330, 890, 330, legend, '#9AAEC2', 'lgA', 7); pea(960, 330, 46, { key: 'lgRp', q: legend });
      marble(760, 520, 44, 'r', { key: 'lgr', q: legend, glow: .4 * near(t, L(13, 3.4), .5) }); arrow(820, 520, 890, 520, legend, '#9AAEC2', 'lgB', 7); pea(960, 520, 46, { key: 'lgrp', wr: 1, q: legend }); }
    // F1 with R r on the left
    const fk = ease(seg(t, L(13, 4.6), L(13, 5.4)));
    const FX = 400, FY = 330;
    if (fk > 0) { pea(FX, FY, 70, { key: 'F1c', q: fk }); cradle(FX, FY, 70, fk, 'F1c'); marble(mPos(FX, FY, 70, 0)[0], mPos(FX, FY, 70, 0)[1], 24, 'R', { key: 'F1cR', q: fk }); marble(mPos(FX, FY, 70, 1)[0], mPos(FX, FY, 70, 1)[1], 24, 'r', { key: 'F1cr', q: fk }); }
    // the gametes: pollen across the top, eggs down the side
    const GP = [0, 1].map(i => [G2.x0 + (i + .5) * G2.c, G2.y0 - 95]), GE = [0, 1].map(j => [G2.x0 - 95, G2.y0 + (j + .5) * G2.c]);
    const kinds = ['R', 'r'];
    GP.forEach((p, i) => pollen(p[0], p[1], 56, kinds[i], { key: 'cP' + i, q: backOut(seg(t, L(13, 7.8) + i * .9, L(13, 8.3) + i * .9)) }));
    GE.forEach((p, j) => egg(p[0], p[1], 56, kinds[j], { key: 'cE' + j, q: backOut(seg(t, L(13, 11.0) + j * .5, L(13, 11.5) + j * .5)) }));
    // the empty grid with a question; then the four meetings
    const gk = ease(seg(t, L(13, 12.6), L(13, 13.4)));
    if (gk > 0) { boilSeed('grid2'); for (let i = 0; i <= 2; i++) { inkLine([[G2.x0, G2.y0 + i * G2.c], [G2.x0 + 2 * G2.c * gk, G2.y0 + i * G2.c]], 1.4, '#7F93A8', 'ink', 0); inkLine([[G2.x0 + i * G2.c, G2.y0], [G2.x0 + i * G2.c, G2.y0 + 2 * G2.c * gk]], 1.4, '#7F93A8', 'ink', 0); } }
    qmark(g2cell(1, 1)[0], g2cell(1, 1)[1] - 40, 40, seg(t, L(13, 14.6), L(13, 15)) * (1 - seg(t, L(14, 6.0), L(14, 6.4))), 'grid');
    const TC = [L(14, 2.4), L(14, 3.7), L(14, 5.0), L(14, 6.3)];
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j], n) => {
      const k = seg(t, TC[n] - .6, TC[n]); if (k <= 0) return;
      const C = g2cell(i, j), pr = kinds[j] + kinds[i];
      if (k < 1) { const a = arcPt(GP[i], [C[0] + 26, C[1] + 50], 40, ease(k)), b = arcPt(GE[j], [C[0] - 26, C[1] + 50], 40, ease(k)); marble(a[0], a[1], 20, kinds[i], { key: 'fly' + n + 'a' }); marble(b[0], b[1], 20, kinds[j], { key: 'fly' + n + 'b' }); return; }
      const wr = pr === 'rr' ? 1 : 0, hi = wr ? .4 * near(t, L(14, 9.0), .7) : .35 * near(t, L(14, 11.6 + n * .3), .5);
      pea(C[0], C[1] - 24, 52, { key: 'gc' + n, wr, seed: n + 3, q: backOut(seg(t, TC[n], TC[n] + .35)), hi });
      marble(C[0] - 24, C[1] + 54, 20, kinds[j], { key: 'gm' + n + 'a' }); marble(C[0] + 24, C[1] + 54, 20, kinds[i], { key: 'gm' + n + 'b' });
    });
    ringK(...g2cell(1, 1), 92, 92, seg(t, L(14, 8.6), L(14, 9.6)), Z.gold, 'rrR');
    // the jar row from the garden slides in beside the grid: they match
    const mk = seg(t, L(14, 13.8), L(14, 14.8));
    if (mk > 0) { row31(1530, 820 + (1 - easeOut(mk)) * 300, 40, mk, t, 'c3r'); K.check(1720, 690, 90, seg(t, L(14, 15.0), L(14, 15.6)), 'c3ok'); }
    hostC(t, [[L(13, -1.6), 'calm', { lookX: .9, lookY: -.5 }], [L(13, 4.8), 'calm', { lookX: .6, lookY: -.7 }], [L(13, 8), 'calm', { lookX: .9, lookY: -.6 }], [L(13, 13.6), 'confused'], [L(14, .4), 'calm', { lookX: .9, lookY: -.5 }],
      [L(14, 8.8), 'wow', { lookX: .9, lookY: -.4 }], [L(14, 14.2), 'excited']]);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B6C8D8', Z.board]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B6C8D8', Z.board]);
  }

  function shotC4(t, lt, dur) {                                    // the testcross: predict, then do it; 假说—演绎法
    K.setT(t);
    cam(960 + 8 * wob(t, .05), 540 + 6 * wob(t, .04), 1);
    boardBg(t, 'c4');
    const clr = 1 - seg(t, L(17, -.6), L(17, .2));                  // L16's working leaves for the harvest
    // the old data, already explained (✓), gives way: explaining isn't enough
    const old = seg(t, L(15, -1.2), L(15, -.6)) * (1 - seg(t, L(15, 2.6), L(15, 3.2)));
    if (old > .02) { row31(960, 520, 56, old, t, 'c4old'); K.check(1180, 400, 80, old, 'c4ok'); }
    // a prophecy bubble: a pod not yet opened
    const pb = seg(t, L(15, 3.2), L(15, 3.8)) * (1 - seg(t, L(15, 7.4), L(15, 7.9)));
    if (pb > .02) { cloud(960, 400, 260, 170, pb, [300, 800], 'proph'); podShape(960, 410, 140 * pb, 0, { key: 'pp', n: 5 }); qmark(1010, 260, 40, pb, 'pp'); }
    // F1 + ? : who's the partner?
    const FX = 640, FY = 380, fk = ease(seg(t, L(15, 7.6), L(15, 8.3))) * clr;
    const hide = fk * ease(seg(t, L(15, 8.6), L(15, 9.2)));
    if (fk > .02) { pea(FX, FY, 80, { key: 'tF', q: fk }); cradle(FX, FY, 80, hide, 'tF'); const a = mPos(FX, FY, 80, 0), b = mPos(FX, FY, 80, 1); marble(a[0], a[1], 26, 'R', { key: 'tFR', q: hide }); marble(b[0], b[1], 26, 'r', { key: 'tFr', q: hide });
      boilSeed('plus'); inkLine([[910 - 34 * fk, FY], [910 + 34 * fk, FY]], 5, PAL.ink, 'ink', 0); inkLine([[910, FY - 34 * fk], [910, FY + 34 * fk]], 5, PAL.ink, 'ink', 0); }
    const pick = seg(t, L(16, 0), L(16, 1.0));
    const SX = 1180, SY = FY;
    if (t < L(16, 1.0) && fk > .02) slot(SX, SY, 80 * fk, 'partner');
    // candidates below: a round one and a wrinkled one
    const ck = seg(t, L(15, 10.6), L(15, 11.4)) * clr;
    if (ck > .02) { pea(1040, 760, 64, { key: 'cand1', q: backOut(ck) * (1 - pick) }); const wp = arcPt([1320, 760], [SX, SY], 120, ease(pick)); pea(wp[0], wp[1], lerp(64, 80, pick), { key: 'cand2', wr: 1, q: backOut(ck) }); }
    if (pick >= 1 && clr > .02) {
      K.check(SX + 100, SY - 100, 70, seg(t, L(16, 1.0), L(16, 1.6)), 'pick');
      const sh = ease(seg(t, L(16, 1.8), L(16, 2.4))) * clr; cradle(SX, SY, 80, sh, 'tW');
      for (let i = 0; i < 2; i++) { const a = mPos(SX, SY, 80, i); marble(a[0], a[1], 26, 'r', { key: 'tWr' + i, q: sh }); }
      // its pollen: always pale; F1's eggs: dark or pale → round or wrinkled children
      const EG = [[540, 650], [740, 650]], PO = [[1100, 650], [1300, 650]], CH = [[800, 880], [1100, 880]];
      PO.forEach((p, i) => pollen(p[0], p[1], 48, 'r', { key: 'tP' + i, q: backOut(seg(t, L(16, 2.4) + i * .2, L(16, 3.0) + i * .2)) * clr }));
      EG.forEach((p, i) => egg(p[0], p[1], 48, i ? 'r' : 'R', { key: 'tE' + i, q: backOut(seg(t, L(16, 4.0) + i * .5, L(16, 4.6) + i * .5)) * clr }));
      [[0, 0], [1, 1]].forEach(([e, c], i) => { const k = seg(t, L(16, 5.6) + i * 1.0, L(16, 6.3) + i * 1.0) * clr; if (k <= .02) return;
        arrow(EG[e][0] + 30, EG[e][1] + 50, CH[c][0] - 50, CH[c][1] - 30, k, '#9AAEC2', 'tce' + i, 6); arrow(PO[i][0] - 30, PO[i][1] + 50, CH[c][0] + 50, CH[c][1] - 30, k, '#9AAEC2', 'tcp' + i, 6);
        pea(CH[c][0], CH[c][1], 50, { key: 'tch' + i, wr: i, q: backOut(seg(t, L(16, 6.2) + i, L(16, 6.6) + i)) * clr }); });
      // the prediction: half round, half wrinkled
      const pr = seg(t, L(16, 8.4), L(16, 9.0)) * (1 - seg(t, L(17, 1.4), L(17, 2.0)));
      if (pr > .02) { cloud(960, 150, 220, 100, pr, [300, 800], 'pred'); pea(870, 150, 46, { key: 'pr1', q: pr }); pea(1050, 150, 46, { key: 'pr2', wr: 1, q: pr }); boilSeed('eqbar'); inkLine([[955, 118], [965, 182]], 3, PAL.ink, 'ink', 0); }
      ringK(960, 150, 240, 110, seg(t, L(16, 11.4), L(16, 12.4)), Z.gold, 'tcName');
    }
    // L17: the real harvest: two equal heaps, ✓; then the three steps
    const hk = seg(t, L(17, .2), L(17, 2.6)), steps = seg(t, L(17, 3.6), L(17, 4.2));
    if (hk > 0 && steps < 1) { push(); translate(0, 400 * easeIn(steps));
      boilSeed('tray'); paint(rrPts(480, 830, 960, 44, 16), { wash: '#C9A27A', ink: PAL.ink, sw: 1 });
      heap(760, 830, 22, 330, (i, x, y, r) => pea(x, y, r, { key: 'hR' + i, seed: i }), 'hR', hk, 24); heap(1160, 830, 21, 330, (i, x, y, r) => pea(x, y, r, { key: 'hW' + i, seed: i, wr: 1 }), 'hW', hk, 24);
      K.check(1400, 580, 100, seg(t, L(17, 2.4), L(17, 3.0)), 'tc'); pop(); }
    if (steps > .02) {                                              // hypothesis → deduction → test
      const s1 = popK(t, L(17, 3.8)), s2 = popK(t, L(17, 5.8)), s3 = popK(t, L(17, 8.0));
      const Y = 520;
      if (s1 > 0) { cloud(500, Y, 150, 105, s1, [400, Y + 200], 'st1'); marble(465, Y, 32, 'R', { key: 'st1a', q: s1 }); marble(535, Y, 32, 'r', { key: 'st1b', q: s1 }); }
      arrow(680, Y, 790, Y, seg(t, L(17, 5.2), L(17, 5.8)), '#9AAEC2', 'st12', 12);
      if (s2 > 0) { cloud(960, Y, 150, 105, s2, [900, Y + 200], 'st2'); pea(905, Y, 36, { key: 'st2a', q: s2 }); pea(1015, Y, 36, { key: 'st2b', wr: 1, q: s2 }); }
      arrow(1130, Y, 1240, Y, seg(t, L(17, 7.4), L(17, 8.0)), '#9AAEC2', 'st23', 12);
      if (s3 > 0) { heap(1360, Y + 70, 6, 130, (i, x, y, r) => pea(x, y, r * 1.2, { key: 'st3a' + i, seed: i }), 'st3a', s3); heap(1520, Y + 70, 6, 130, (i, x, y, r) => pea(x, y, r * 1.2, { key: 'st3b' + i, seed: i, wr: 1 }), 'st3b', s3); }
      K.check(1600, Y - 110, 90, seg(t, L(17, 8.8), L(17, 9.4)), 'st3c');
      [[500, L(17, 10.4)], [960, L(17, 10.9)], [1440, L(17, 11.4)]].forEach(([x, tt], i) => ringK(x, Y, 180, 130, seg(t, tt, tt + .9), Z.gold, 'stp' + i));
    }
    hostC(t, [[L(15, -1.6), 'happy', { lookX: .9, lookY: -.3 }], [L(15, 3.4), 'idea'], [L(15, 7.8), 'calm', { lookX: .9, lookY: -.3 }], [L(15, 11.4), 'confused'], [L(16, .4), 'wow', { lookX: .9, lookY: -.3 }],
      [L(16, 8.6), 'calm', { lookX: .9, lookY: -.7 }], [L(17, 1.0), 'excited'], [L(17, 4.0), 'calm', { lookX: .9, lookY: -.3 }], [L(17, 10.6), 'smug']]);
    camEnd();
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E9DDBF', Z.recap]);
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B6C8D8', Z.board]);
  }


  // ================================ D: recap (L18) ================================
  const recapBg = (t, key) => { K.wash(Z.recap, t, { key, blob: Z.recapBlob, rect: rectPts(-1600, -1200, W + 3200, H + 2400) }); K.motes(t, 10, mixCol(Z.recap, '#C9B48A', .35), { key }); };
  function shotD(t, lt, dur) {
    K.setT(t);
    cam(960 + 8 * wob(t, .05), 540 + 6 * wob(t, .04), 1);
    recapBg(t, 'd');
    const F = [380, 400];
    const f = popK(t, L(18, -.3));
    pea(F[0], F[1], 90, { key: 'dF', q: f }); cradle(F[0], F[1], 90, f, 'dF');
    ringK(F[0], F[1] + 128, 100, 44, seg(t, L(18, 1.4), L(18, 2.3)), Z.gold, 'dpair');
    const G = [[900, 300], [900, 640]], sp = ease(seg(t, L(18, 4.6), L(18, 6.6)));
    arrow(F[0] + 120, F[1] + 60, 790, 330, seg(t, L(18, 2.4), L(18, 3.0)), '#C9B48A', 'da1', 10); arrow(F[0] + 120, F[1] + 120, 790, 610, seg(t, L(18, 2.5), L(18, 3.1)), '#C9B48A', 'da2', 10);
    pollen(G[0][0], G[0][1], 70, null, { key: 'dP', q: popK(t, L(18, 2.8)) }); egg(G[1][0], G[1][1], 70, null, { key: 'dE', q: popK(t, L(18, 3.0)) });
    const a0 = mPos(F[0], F[1], 90, 0), a1 = mPos(F[0], F[1], 90, 1);
    // the pair sits, then splits: one into each gamete (a second time, as a reminder)
    const p0 = arcPt(a0, G[0], 120, sp), p1 = arcPt(a1, G[1], 120, sp);
    if (f > 0) { marble(p0[0], p0[1], 30, 'R', { key: 'dR', q: f, glow: .5 * near(t, L(18, 7.2), .8) }); marble(p1[0], p1[1], 30, 'r', { key: 'dr', q: f, glow: .5 * near(t, L(18, 7.4), .8) }); }
    K.burst((a0[0] + a1[0]) / 2, a0[1], 70, seg(t, L(18, 4.6), L(18, 5.1)), Z.goldDk || '#C99A2E', 'dsp');
    ringK(G[0][0], G[0][1], 100, 100, seg(t, L(18, 3.2), L(18, 4.1)), Z.gold, 'dg1'); ringK(G[1][0], G[1][1], 100, 100, seg(t, L(18, 3.4), L(18, 4.3)), Z.gold, 'dg2');
    // F2 comes back 3 : 1
    arrow(1020, 470, 1180, 470, seg(t, L(18, 11.4), L(18, 12.0)), '#C9B48A', 'da3', 10);
    row31(1520, 480, 54, seg(t, L(18, 12.0), L(18, 13.4)), t, 'dr31', { hiW: .4 * near(t, L(18, 14.8), .6) });
    ringK(1700, 480, 64, 64, seg(t, L(18, 14.4), L(18, 15.3)), Z.gold, 'dret');
    host(1700, 960, 30, t, [[L(18, -1.2), 'calm', { lookX: -.9, lookY: -.5 }], [L(18, 6.8), 'happy', { lookX: -.9, lookY: -.5 }], [L(18, 13.4), 'smug', { lookX: -.5, lookY: -.8 }]], { flip: true, talk: true }, 'pd');
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E9DDBF', Z.recap]);
    if (lt > dur - .5) flash((lt - (dur - .5)) / .5, '#FFF7E6');
  }

  // ================================ E: inside the seed (L19) ================================
  function helixBit(x, y, w, k, col, key, broken = 0) {          // a short painted gene: two strands and rungs; broken = a wedge in the middle
    if (k <= .02) return; boilSeed('hx' + key);
    const n = 28, P1 = [], P2 = [];
    for (let i = 0; i <= n; i++) { const u = (i / n - .5) * w * k, ph = i / n * TAU * 2.5; P1.push([x + u, y + Math.sin(ph) * 14]); P2.push([x + u, y - Math.sin(ph) * 14]); }
    for (let i = 1; i < n; i += 2) if (!broken || Math.abs(i - n / 2) > 2.5) inkLine([P1[i], P2[i]], 2, mixCol(col, PAL.ink, .2), 'ink', 0);
    inkLine(P1, 4, col, 'ink', .5); inkLine(P2, 4, mixCol(col, PAL.cream, .35), 'ink', .5);
    if (broken) { const q = backOut(clamp(broken)); paint(rrPts(x - 24 * q, y - 34 * q, 48 * q, 68 * q, 10), { wash: '#C8463F', fill: '#93302B', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 }); }
  }
  function brancher(x, y, s, t, key, on = 1) {                     // the starch-branching enzyme: a lumpy protein with a cleft (no face)
    boilSeed('sbe' + key);
    const ch = on * .18 * Math.abs(Math.sin(t * 3.2)), P = [];
    for (let i = 0; i <= 26; i++) { const a = .5 + ch + i / 26 * (TAU - 1 - 2 * ch), rr = s * (1 + .12 * Math.sin(a * 4 + 1) + .08 * Math.sin(a * 7)); P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .85]); }
    P.push([x + s * .15, y]);
    paint(P, { wash: '#9C8BD0', fill: '#6F5CA8', fillOp: 55, tex: .5, ink: PAL.ink, sw: 1, curv: .3 });
    for (let i = 0; i < 4; i++) paint(ellPts(x - s * .4 + hash(i + 7) * s * .5, y - s * .3 + hash(i + 9) * s * .6, s * .12, s * .1, 8), { wash: '#B9ACE2', ink: null });
  }
  function starch(x, y, s, k, key) {                                // a branched starch tree of beads, growing with k
    boilSeed('st' + key);
    const beads = []; const grow = (bx, by, a, n, d) => { for (let i = 0; i < n; i++) { bx += Math.cos(a) * s; by += Math.sin(a) * s; beads.push([bx, by]); if (d < 2 && i === 2) grow(bx, by, a - .9, n - 2, d + 1); if (d < 1 && i === 4) grow(bx, by, a + .8, n - 2, d + 1); } };
    grow(x, y, -1.3, 7, 0);
    const m = Math.floor(beads.length * clamp(k));
    for (let i = 0; i < m; i++) paint(ellPts(beads[i][0], beads[i][1], s * .48, s * .48, 8), { wash: '#F7F1E1', ink: PAL.ink, sw: .6 });
  }
  function sugar(x, y, s, key) { boilSeed('sg' + key); paint(rrPts(x - s / 2, y - s / 2, s, s, 3), { wash: '#FFFFFF', washOp: 230, ink: mixCol(PAL.ink, PAL.cream, .3), sw: .7 }); }
  function waterDrop(x, y, s, key) { boilSeed('wd' + key); paint([[x, y - s * 1.3], [x + s * .7, y], [x, y + s * .75], [x - s * .7, y]], { wash: '#9CC8EA', ink: PAL.ink, sw: .7, curv: .6 }); }
  function shotE(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(19, -1.6), [960, 540, 1]], [L(19, 3.0), [960, 540, 1]], [L(19, 4.4), [960, 540, 1]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    K.wash(Z.seed, t, { key: 'e', blob: Z.seedBlob, rect: rectPts(-1600, -1200, W + 3200, H + 2400) });
    K.motes(t, 14, mixCol(Z.seed, '#C9A332', .35), { key: 'e' });
    // 0–2.6: the marbles are genes
    const gk = seg(t, L(19, .4), L(19, 1.4)), go = seg(t, L(19, 2.8), L(19, 3.6));
    if (go < 1) { const q = 1 - go;
      marble(760, 470, 70 * q, 'R', { key: 'eR', glow: .4 * gk }); marble(1160, 470, 70 * q, 'r', { key: 'er', glow: .4 * gk });
      helixBit(760, 640, 260, gk * q, Z.R, 'ehR'); helixBit(1160, 640, 260, gk * q, Z.rDk, 'ehr'); }
    // 3.0 on: two seeds in section: round (R) left, wrinkled (r) right
    const sk = seg(t, L(19, 3.0), L(19, 4.0));
    if (sk > .02) {
      const q = backOut(sk), dry = ease(seg(t, L(19, 10.6), L(19, 12.4))), wet = ease(seg(t, L(19, 9.0), L(19, 10.4))) * (1 - dry);
      const LX = 560, RX = 1360, Y = 540, R0 = 360;
      // the round one: two branchers build starch trees
      boilSeed('secL'); paint(ellPts(LX, Y, R0 * q, R0 * q, 40), { wash: '#F5E3A8', fill: Z.yelDk, fillOp: 40, tex: .5, ink: PAL.ink, sw: 1.4 });
      helixBit(LX, Y - 220, 220, sk, Z.R, 'eLg');
      for (let i = 0; i < 3; i++) starch(LX - 170 + i * 140, Y + 230 - (i % 2) * 60, 19, seg(t, L(19, 4.6) + i * .5, L(19, 8.6) + i * .5), 'stL' + i);
      if (sk > .5) { brancher(LX - 150, Y - 50, 46, t, 'bL1'); brancher(LX + 140, Y + 10, 46, t + .5, 'bL2'); }
      // the wrinkled one: the gene has a piece wedged in, so no brancher; sugar; water in, then out
      const sw = 1 + .12 * wet - .1 * dry;
      const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU, n = Math.sin(a * 5 + 1) * .5 + Math.sin(a * 9 + 2) * .35 + Math.sin(a * 3) * .3, rr = R0 * q * sw * (1 + .14 * dry * n); P.push([RX + Math.cos(a) * rr, Y + Math.sin(a) * rr]); }
      boilSeed('secR'); paint(P, { wash: '#F5E3A8', fill: Z.yelDk, fillOp: 40 + 40 * dry, tex: .5, ink: PAL.ink, sw: 1.4, curv: .3 });
      helixBit(RX, Y - 220, 220, sk, Z.rDk, 'eRg', seg(t, L(19, 6.6), L(19, 7.2)));
      K.cross(RX + 150, Y - 220, 70, seg(t, L(19, 7.6), L(19, 8.2)), 'noenz');
      for (let i = 0; i < 18; i++) { const a = hash(i + 300) * TAU, d = 60 + 200 * hash(i + 301); sugar(RX + Math.cos(a) * d * sw + 6 * wob(t, .3, i * .1), Y + 40 + Math.sin(a) * d * .8 * sw, 22, 'sug' + i); }
      for (let i = 0; i < 14; i++) { const k = seg(t, L(19, 8.8) + i * .08, L(19, 9.8) + i * .08), ko = seg(t, L(19, 10.6) + i * .06, L(19, 11.6) + i * .06), a = i / 14 * TAU;
        if (k <= 0 || ko >= 1) continue; const d = lerp(R0 + 160, R0 * .6, ease(k)) + (R0 + 200) * easeIn(ko) * 0 + 320 * easeIn(ko);
        waterDrop(RX + Math.cos(a) * d, Y + Math.sin(a) * d, 26, 'wd' + i); }
      // one R is enough: the left seed shows R r, a brancher still at work
      const one = seg(t, L(19, 12.8), L(19, 13.6));
      if (one > 0) { const mk = backOut(one); boilSeed('oneR'); paint(rrPts(LX - 90, Y + R0 + 10, 180, 70, 30), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
        marble(LX - 40, Y + R0 + 45, 26 * mk, 'R', { key: 'oR', glow: .4 }); marble(LX + 40, Y + R0 + 45, 26 * mk, 'r', { key: 'or' });
        K.check(LX + 260, Y - 250, 90, seg(t, L(19, 14.2), L(19, 14.8)), 'enough'); }
    }
    host(170, 1000, 28, t, [[L(19, -1.6), 'calm', { lookX: .9, lookY: -.5 }], [L(19, 4.4), 'wow', { lookX: .9, lookY: -.5 }], [L(19, 7.8), 'worried', { lookX: .9, lookY: -.5 }], [L(19, 12.4), 'calm', { lookX: .9, lookY: -.5 }], [L(19, 14.4), 'idea']], { talk: true }, 'pe');
    camEnd();
    if (lt < .5) flash(1 - lt / .5, '#FFF7E6');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#D9C27A', Z.dusk]);
  }

  // ================================ F: two traits (L20–L24) ================================
  const duskBg = (t, key) => { K.wash(Z.dusk, t, { key, blob: Z.duskBlob, rect: rectPts(-1600, -1200, W + 3200, H + 2400) }); K.motes(t, 14, mixCol(Z.dusk, '#B98516', .3), { key }); };
  const seedOf = k => ({ col: k[0] === 'Y' ? Z.yel : Z.grn, wr: k[1] === 'R' ? 0 : 1 });        // 'YR', 'Yr', 'yR', 'yr'
  function pea2(x, y, r, k, o = {}) { const sd = seedOf(k); pea(x, y, r, { ...o, col: sd.col, wr: sd.wr }); }
  // a seed with both pairs: colour marbles (Y y) on the left of the cradle, shape marbles (R r) on the right
  function carrier2(x, y, r, cp, sp, o = {}) {
    const q = o.q ?? 1; if (q <= .02) return;
    pea2(x, y, r, (cp.includes('Y') ? 'Y' : 'y') + (sp.includes('R') ? 'R' : 'r'), { key: o.key, q });
    const sh = o.show ?? 1; if (sh <= .02) return;
    const mr = r * .3, cy = y + r * 1.4;
    boilSeed('cr2' + o.key); paint(rrPts(x - r * 1.5, cy - mr * 1.3, r * 3, mr * 2.6, mr * 1.2), { wash: PAL.cream, washOp: 210 * sh, ink: mixCol(PAL.ink, PAL.cream, .35), sw: .9 * sh });
    const pos = [x - r * 1.05, x - r * .45, x + r * .45, x + r * 1.05];
    [cp[0], cp[1], sp[0], sp[1]].forEach((k, i) => marble(pos[i], cy, mr, k, { key: o.key + 'm' + i, q: backOut(sh) }));
    if (o.link) { boilSeed('lk' + o.key); const L1 = o.link; for (const [a, b] of [[0, 2], [1, 3]]) { const yb = cy + mr * 1.1 + (a ? 10 : 0); inkLine([[pos[a], cy + mr], [pos[a], yb + 14], [pos[b], yb + 14], [pos[b], cy + mr]], 4.5 * L1, a ? '#B5583E' : '#8C5A3A', 'ink', 0); } }
  }
  function gam2(x, y, s, kc, ks, key, q = 1, isEgg = false) {       // a pollen grain carrying one colour and one shape marble
    if (q <= .02) return; (isEgg ? egg : pollen)(x, y, s, null, { key, q });
    marble(x - s * .28 * q, y, s * .3 * q, kc, { key: key + 'c' }); marble(x + s * .28 * q, y, s * .3 * q, ks, { key: key + 's' });
  }
  const BARS = [['YR', 315], ['Yr', 101], ['yR', 108], ['yr', 32]], BS = 1.2, BASE = 860;
  function barCol(k) { return k[0] === 'Y' ? Z.yel : Z.grn; }
  function shotF1(t, lt, dur) {                                    // yellow-round × green-wrinkled; F1; bundled or free? the four heaps
    K.setT(t);
    cam(960 + 8 * wob(t, .05), 540 + 6 * wob(t, .04), 1);
    duskBg(t, 'f1');
    boilSeed('f1soil'); paint(rectPts(-400, 980, W + 800, 300), { wash: '#C9A06A', fill: '#9C7A55', fillOp: 50, tex: .6, ink: null });
    // yellow vs green, yellow dominant
    const cg = seg(t, L(20, .6), L(20, 1.4)) * (1 - seg(t, L(20, 5.0), L(20, 5.6)));
    if (cg > .02) { pea(800, 450, 80, { key: 'cY', q: backOut(cg), hi: .3 * near(t, L(20, 3.6), .6) }); pea(1120, 450, 80, { key: 'cG', col: Z.grn, q: backOut(cg) }); ringK(800, 450, 110, 110, seg(t, L(20, 3.4), L(20, 4.3)), Z.gold, 'ydom'); }
    // the cross: YR (left) × yr (right) → F1 all yellow-round
    const pk = seg(t, L(20, 5.4), L(20, 6.2)) * (1 - seg(t, L(20, 10.6), L(20, 11.2)));
    if (pk > .02) { pea2(560, 420, 70, 'YR', { key: 'pYR', q: backOut(pk) }); pea2(1360, 420, 70, 'yr', { key: 'pyr', q: backOut(pk) });
      boilSeed('x2'); const q = pk; inkLine([[960 - 30 * q, 390], [960 + 30 * q, 450]], 5, PAL.ink, 'ink', 0); inkLine([[960 + 30 * q, 390], [960 - 30 * q, 450]], 5, PAL.ink, 'ink', 0);
      const ok = seg(t, L(20, 8.0), L(20, 8.8)); podShape(960, 700, 200 * ease(seg(t, L(20, 6.8), L(20, 7.6))), 0, { key: 'f1pod2', open: ok, n: 5, peas: (i, x, y, r) => pea2(x, y, r * 1.05, 'YR', { key: 'f1s' + i, seed: i }) }); }
    // F1 with both pairs; are yellow and round tied together?
    const fk = seg(t, L(20, 10.4), L(20, 11.2)), out = seg(t, L(21, 4.8), L(21, 5.6));
    const fx = lerp(960, 330, ease(out)), fy = lerp(380, 300, ease(out)), fr = lerp(90, 56, ease(out));
    if (fk > .02) carrier2(fx, fy, fr, 'Yy', 'Rr', { key: 'F12', q: backOut(fk), show: ease(seg(t, L(20, 11.4), L(20, 12.2))), link: ease(seg(t, L(20, 13.4), L(20, 14.4))) * (1 - seg(t, L(22, 4.8), L(22, 5.6))) });
    qmark(fx + 150, fy + 80, 34, seg(t, L(20, 15.0), L(20, 15.4)) * (1 - seg(t, L(21, .2), L(21, .5))), 'link');
    // if bundled: only two kinds (a ghost), crossed out
    const gb = seg(t, L(21, .4), L(21, 1.0)) * (1 - seg(t, L(21, 6.4), L(21, 7.0)));
    if (gb > .02) { cloud(1100, 700, 300, 150, gb, [fx, fy + 150], 'bund'); pea2(980, 700, 56, 'YR', { key: 'bg1', q: gb }); pea2(1220, 700, 56, 'yr', { key: 'bg2', q: gb }); K.cross(1100, 700, 200, seg(t, L(21, 5.4), L(21, 6.0)), 'bx'); }
    // the four columns, in the order the voice reads them
    const TT = [L(21, 7.8), L(21, 10.0), L(21, 12.0), L(21, 14.0)];
    BARS.forEach(([k, n], i) => { const x = 700 + i * 260, bk = seg(t, TT[i], TT[i] + 1.2); if (bk <= 0) return;
      bar(x, BASE, 150, n * BS, barCol(k), bk, 'b' + k); pea2(x, BASE + 62, 44, k, { key: 'bp' + k, q: backOut(seg(t, TT[i] - .3, TT[i] + .1)) }); });
    host(150, 1000, 30, t, [[L(20, -1.6), 'calm', { lookX: .9, lookY: -.5 }], [L(20, 3.6), 'happy'], [L(20, 8.8), 'wow', { lookX: .9, lookY: -.5 }], [L(20, 13.6), 'confused'], [L(21, 6.0), 'calm', { lookX: .9, lookY: -.4 }], [L(21, 14.6), 'dizzy']], { talk: true }, 'pf1');
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#D9C27A', Z.dusk]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#D9C27A', Z.dusk]);
  }
  // where each column sits through the regrouping: as four, by colour (stacked), by shape (stacked)
  function barsAt(t) {
    const byC = ease(seg(t, L(23, .2), L(23, 1.4))) * (1 - ease(seg(t, L(23, 3.6), L(23, 4.4)))), byS = ease(seg(t, L(23, 4.0), L(23, 5.2))) * (1 - ease(seg(t, L(23, 12.6), L(23, 13.4))));
    const four = BARS.map(([k, n], i) => [700 + i * 260, BASE]);
    const colr = { YR: [520, BASE], Yr: [520, BASE - 315 * BS], yR: [800, BASE], yr: [800, BASE - 108 * BS] };
    const shp = { YR: [520, BASE], yR: [520, BASE - 315 * BS], Yr: [800, BASE], yr: [800, BASE - 101 * BS] };
    const back = ease(seg(t, L(23, 12.6), L(23, 13.4)));
    return BARS.map(([k], i) => { let p = four[i]; if (byC > 0) p = [lerp(p[0], colr[k][0], byC), lerp(p[1], colr[k][1], byC)]; if (byS > 0) p = [lerp(p[0], shp[k][0], byS), lerp(p[1], shp[k][1], byS)];
      if (back > 0) p = [lerp(p[0], 300 + i * 160, back), p[1]]; return p; });
  }
  function shotF2(t, lt, dur) {                                    // new combinations; two 3:1s; 3/4 × 3/4; four gametes; 1:1:1:1
    K.setT(t);
    cam(960 + 8 * wob(t, .05), 540 + 6 * wob(t, .04), 1);
    duskBg(t, 'f2');
    const barsK = 1 - seg(t, L(24, -.8), L(24, 0));
    if (barsK > .02) {
      push(); translate(0, (1 - barsK) * 700);
      const P = barsAt(t), grouped = seg(t, L(23, .2), L(23, 1.0)) * (1 - seg(t, L(23, 12.6), L(23, 13.4)));
      const bw = lerp(150, 120, ease(seg(t, L(23, 12.6), L(23, 13.4))));
      BARS.forEach(([k, n], i) => { const [x, y] = P[i]; bar(x, y, bw, n * BS, barCol(k), 1, 'b' + k);
        if (k[1] === 'r' && k[0] === 'Y') { boilSeed('crease' + k); for (let j = 0; j < 3; j++) inkLine([[x - 40, y - 20 - j * 30], [x, y - 32 - j * 30], [x + 40, y - 20 - j * 30]], 1.6, Z.yelDk, 'inkfine', .5); }
        if (k === 'yr') { boilSeed('crease' + k); inkLine([[x - 40, y - 20], [x, y - 32], [x + 40, y - 20]], 1.6, Z.grnDk, 'inkfine', .5); }
        pea2(x, y + 62, 44, k, { key: 'bp' + k, q: 1 - grouped, hi: (k === 'Yr' || k === 'yR') ? .45 * near(t, L(22, k === 'Yr' ? 1.0 : 2.4), .6) : 0 });
        if ((k === 'Yr' || k === 'yR')) for (let j = 0; j < 3; j++) K.sparkle(x - 60 + j * 60, y - n * BS - 40, 26, seg(t, L(22, k === 'Yr' ? .8 : 2.2) + j * .15, L(22, k === 'Yr' ? 1.6 : 3.0) + j * .15), '#FFF3C4'); });
      // under the stacks: the group's seed (yellow / green, then round / wrinkled)
      const gC = seg(t, L(23, 1.0), L(23, 1.6)) * (1 - seg(t, L(23, 3.6), L(23, 4.0))), gS = seg(t, L(23, 4.8), L(23, 5.4)) * (1 - seg(t, L(23, 12.6), L(23, 13.2)));
      if (gC > .02) { pea(520, BASE + 62, 44, { key: 'gcY', q: gC }); pea(800, BASE + 62, 44, { key: 'gcG', col: Z.grn, q: gC }); }
      if (gS > .02) { pea(520, BASE + 62, 44, { key: 'gsR', q: gS, col: '#D9C9A0' }); pea(800, BASE + 62, 44, { key: 'gsW', wr: 1, q: gS, col: '#D9C9A0' }); }
      // the short stack, copied three times beside the tall one: about 3 : 1
      for (const [tt, h1, x0, key] of [[L(23, 1.8), 140, 660, 'rc'], [L(23, 5.6), 133, 660, 'rs']]) { const k = seg(t, tt, tt + 1.4) * (1 - seg(t, tt + 2.0, tt + 2.4)); if (k <= .02) continue;
        for (let j = 0; j < 3; j++) { const kk = seg(k, j * .25, j * .25 + .4); if (kk <= 0) continue; const y1 = BASE - (j + 1) * h1 * BS; boilSeed('rul' + key + j);
          paint(rrPts(x0 - 50, y1 + (1 - easeOut(kk)) * -60, 100, h1 * BS - 6, 8), { wash: key === 'rc' ? Z.grn : '#D9C9A0', washOp: 150 * kk, ink: PAL.ink, sw: .9 }); } }
      pop();
    }
    qmark(1300, 300, 40, seg(t, L(22, 9.0), L(22, 9.4)) * (1 - seg(t, L(23, 0), L(23, .3))), 'two31');
    // the square: 3/4 yellow across, 3/4 round down; the corners fill
    const sq = seg(t, L(23, 6.8), L(23, 7.6)) * (1 - seg(t, L(24, -.8), L(24, 0)));
    if (sq > .02) {
      const X0 = 1080, Y0 = 220, S = 560 * ease(sq), a = .75 * S;
      boilSeed('sqr'); paint(rectPts(X0, Y0, S, S), { wash: '#FBF4E2', ink: PAL.ink, sw: 1.2 });
      const fills = [['YR', X0, Y0, a, a, L(23, 10.2)], ['Yr', X0, Y0 + a, a, S - a, L(23, 14.0)], ['yR', X0 + a, Y0, S - a, a, L(23, 14.6)], ['yr', X0 + a, Y0 + a, S - a, S - a, L(23, 15.2)]];
      fills.forEach(([k, x, y, w, h, tt]) => { const f = ease(seg(t, tt, tt + .8)); if (f <= .02) return; boilSeed('sf' + k); paint(rectPts(x, y, w * f, h), { wash: mixCol(barCol(k), PAL.cream, .35), ink: null }); if (f > .6) pea2(x + w / 2, y + h / 2, Math.min(70, Math.min(w, h) * .3), k, { key: 'sqp' + k }); });
      const cut = seg(t, L(23, 8.0), L(23, 9.0));
      if (cut > 0) { boilSeed('cuts'); inkLine([[X0 + a, Y0], [X0 + a, Y0 + S * ease(cut)]], 3, PAL.ink, 'ink', 0); inkLine([[X0, Y0 + a], [X0 + S * ease(seg(t, L(23, 8.6), L(23, 9.6))), Y0 + a]], 3, PAL.ink, 'ink', 0); }
      // the edges: yellow 3/4 | green 1/4 across the top; round 3/4 | wrinkled 1/4 down the side
      const ek = seg(t, L(23, 8.2), L(23, 8.8));
      if (ek > .02) { pea(X0 + a / 2, Y0 - 50, 26, { key: 'eY', q: ek }); pea(X0 + a + (S - a) / 2, Y0 - 50, 26, { key: 'eG', col: Z.grn, q: ek }); pea(X0 - 50, Y0 + a / 2, 26, { key: 'eR', q: ek, col: '#D9C9A0' }); pea(X0 - 50, Y0 + a + (S - a) / 2, 26, { key: 'eW', wr: 1, q: ek, col: '#D9C9A0' }); }
      ringK(X0 + a / 2, Y0 + a / 2, a * .6, a * .6, seg(t, L(23, 11.0), L(23, 12.0)), Z.gold, 'nine');
    }
    // L24: F1 → four kinds of gametes, equal; the testcross: four equal heaps
    const g4 = seg(t, L(24, 0), L(24, .8));
    if (g4 > .02) {
      const F = [960, 260], show = 1 - seg(t, L(24, 4.6), L(24, 5.4));
      carrier2(F[0], F[1], 70, 'Yy', 'Rr', { key: 'F14', q: backOut(g4) });
      const GS = [['Y', 'R'], ['Y', 'r'], ['y', 'R'], ['y', 'r']], gx = i => 540 + i * 280;
      GS.forEach(([c, s2], i) => { const k = seg(t, L(24, 4.4) + i * .5, L(24, 5.2) + i * .5); if (k <= 0) return;
        const p = [gx(i), 640]; gam2(p[0], p[1], 72, c, s2, 'g4' + i, backOut(k));
        arrow(F[0] + (i - 1.5) * 50, F[1] + 160, p[0], p[1] - 100, k, '#C9A06A', 'g4a' + i, 7);
        ringK(p[0], p[1], 100, 100, seg(t, L(24, 8.4) + i * .25, L(24, 9.2) + i * .25), Z.gold, 'g4r' + i); ringK(p[0], p[1], 100, 100, seg(t, L(24, 15.2) + i * .25, L(24, 16) + i * .25), Z.gold, 'g4s' + i); });
      // the colour pair and the shape pair split, each on its own: two little shakes of the cradle
      K.burst(F[0] - 52, F[1] + 98, 50, seg(t, L(24, 2.2), L(24, 2.7)), Z.goldDk2 || '#B98516', 'spc'); K.burst(F[0] + 52, F[1] + 98, 50, seg(t, L(24, 3.0), L(24, 3.5)), '#2D4C8E', 'sps');
      const tk = seg(t, L(24, 11.6), L(24, 13.6));
      if (tk > 0) GS.forEach(([c, s2], i) => { heap(gx(i), 990, 8, 150, (j, x, y, r) => pea2(x, y, r, c + s2, { key: 'tc4' + i + j, seed: j }), 'tc4' + i, tk, 20); });
      K.check(1560, 860, 90, seg(t, L(24, 13.6), L(24, 14.2)), 'tc4ok');
    }
    host(1800, 1000, 30, t, [[L(22, -1.6), 'calm', { lookX: .9, lookY: -.5 }], [L(22, 1.0), 'wow', { lookX: .9, lookY: -.5 }], [L(22, 5.0), 'happy'], [L(22, 9.4), 'confused'], [L(23, .8), 'calm', { lookX: .9, lookY: -.4 }], [L(23, 3.2), 'idea'],
      [L(23, 7.4), 'calm', { lookX: 1, lookY: -.5 }], [L(23, 11.4), 'wow', { lookX: 1, lookY: -.5 }], [L(23, 16), 'excited'], [L(24, 1.0), 'calm', { lookX: .9, lookY: -.6 }], [L(24, 14), 'smug']], { talk: true, flip: true }, 'pf2');
    camEnd();
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E9DDBF', Z.recap]);
    if (lt < .3) brushWipe(.5 + lt / .6, ['#D9C27A', Z.dusk]);
  }

  // ================================ G: the Punnett square (L25) ================================
  function shotG(t, lt, dur) {
    K.setT(t);
    const shrink = ease(seg(t, L(25, 11.2), L(25, 12.4)));
    cam(960 + 8 * wob(t, .05), 540 + 6 * wob(t, .04), 1);
    recapBg(t, 'g');
    const C = 118, X0 = 760, Y0 = 250, G4 = [['Y', 'R'], ['Y', 'r'], ['y', 'R'], ['y', 'r']];
    const gk = ease(seg(t, L(25, .2), L(25, 1.6))) * (1 - shrink);
    if (gk > .02) { boilSeed('pg'); for (let i = 0; i <= 4; i++) { inkLine([[X0, Y0 + i * C], [X0 + 4 * C * gk, Y0 + i * C]], 1.4, '#B9A57E', 'ink', 0); inkLine([[X0 + i * C, Y0], [X0 + i * C, Y0 + 4 * C * gk]], 1.4, '#B9A57E', 'ink', 0); } }
    G4.forEach(([c, s2], i) => { gam2(X0 + (i + .5) * C, Y0 - 80, 46, c, s2, 'gpP' + i, backOut(seg(t, L(25, 2.6) + i * .3, L(25, 3.0) + i * .3)) * (1 - shrink));
      gam2(X0 - 80, Y0 + (i + .5) * C, 46, c, s2, 'gpE' + i, backOut(seg(t, L(25, 4.7) + i * .3, L(25, 5.1) + i * .3)) * (1 - shrink), true); });
    const group = (c1, s1) => c1 === 'Y' && s1 === 'R' ? 0 : c1 === 'Y' ? 1 : s1 === 'R' ? 2 : 3;
    const pulseAt = [L(25, 9.0), L(25, 9.8), L(25, 10.3), L(25, 10.8)];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const k = seg(t, L(25, 6.6) + (i + j) * .18, L(25, 7.0) + (i + j) * .18) * (1 - shrink); if (k <= .02) continue;
      const cY = G4[i][0] === 'Y' || G4[j][0] === 'Y' ? 'Y' : 'y', cR = G4[i][1] === 'R' || G4[j][1] === 'R' ? 'R' : 'r', g = group(cY, cR);
      pea2(X0 + (i + .5) * C, Y0 + (j + .5) * C, 36, cY + cR, { key: 'pg' + i + j, q: backOut(k), hi: .45 * near(t, pulseAt[g], .45) });
    }
    // only one pair: a 2×2, 3 : 1
    if (shrink > .02) { const c2 = 150, x0 = 960 - c2, y0 = 300;
      boilSeed('pg2'); for (let i = 0; i <= 2; i++) { inkLine([[x0, y0 + i * c2], [x0 + 2 * c2 * shrink, y0 + i * c2]], 1.6, '#B9A57E', 'ink', 0); inkLine([[x0 + i * c2, y0], [x0 + i * c2, y0 + 2 * c2 * shrink]], 1.6, '#B9A57E', 'ink', 0); }
      ['R', 'r'].forEach((k, i) => { pollen(x0 + (i + .5) * c2, y0 - 80, 50, k, { key: 'g2p' + i, q: shrink }); egg(x0 - 80, y0 + (i + .5) * c2, 50, k, { key: 'g2e' + i, q: shrink }); });
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) pea(x0 + (i + .5) * c2, y0 + (j + .5) * c2, 46, { key: 'g2' + i + j, wr: i && j ? 1 : 0, q: backOut(seg(t, L(25, 12.2) + (i + j) * .2, L(25, 12.6) + (i + j) * .2)), hi: i && j ? .4 * near(t, L(25, 13.6), .5) : 0 }); }
    host(1700, 980, 32, t, [[L(25, -1.6), 'calm', { lookX: -.9, lookY: -.5 }], [L(25, 7.2), 'wow', { lookX: -.9, lookY: -.5 }], [L(25, 10.4), 'happy'], [L(25, 12.6), 'smug', { lookX: -.8, lookY: -.6 }]], { talk: true, flip: true }, 'pg');
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E9DDBF', Z.recap]);
    if (lt > dur - 1.0) iris(960, 520, lerp(1500, 0, easeIn((lt - (dur - 1.0)) / 1.0)), PAL.ink);
  }

  // ================================ H: on the chromosomes (L26) ================================
  function chromo(x, y, len, band, s, key, ang = 0) {             // a replicated chromosome: two sister chromatids, a centromere, a gene band
    boilSeed('chr' + key); push(); translate(x, y); rotate(ang);
    const w = 22 * s, Lh = len * s / 2, [bc, bd] = SHAPE[band];
    for (const dx of [-w * .55, w * .55]) {
      paint(rrPts(dx - w / 2, -Lh, w, Lh * 2, w / 2), { wash: '#B9A6D6', fill: '#8C77B5', fillOp: 50, tex: .5, ink: PAL.ink, sw: .9 });
      paint(rrPts(dx - w / 2 + 1, -Lh * .45, w - 2, w * .9, 3), { wash: bc, ink: null });
    }
    paint(ellPts(0, Lh * .15, w * .45, w * .45, 10), { wash: '#4E3F66', ink: null });
    pop();
  }
  function shotH(t, lt, dur) {
    K.setT(t);
    cam(960 + 8 * wob(t, .05), 520 + 6 * wob(t, .04), 1);
    K.wash(Z.cell, t, { key: 'h', blob: Z.cellBlob, rect: rectPts(-1600, -1200, W + 3200, H + 2400) }); K.motes(t, 14, mixCol(Z.cell, '#5E8C7A', .3), { key: 'h' });
    const split = ease(seg(t, L(26, 6.4), L(26, 9.0))), cut = ease(seg(t, L(26, 8.6), L(26, 9.6))), dance = seg(t, L(26, 12.6), L(26, 13.2));
    const cx = 960, cy = 470, R = 330, el = 1 + .35 * split;
    // the cell (it stretches and pinches as the homologs part)
    boilSeed('cellH'); const P = []; for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, pinch = 1 - .55 * cut * Math.pow(Math.abs(Math.sin(a)), 3) * (Math.abs(Math.cos(a)) < .5 ? 1 : 0); P.push([cx + Math.cos(a) * R * el, cy + Math.sin(a) * R * .85 * (1 - .5 * cut * Math.exp(-Math.pow(Math.cos(a) * 3, 2)))]); }
    paint(P, { wash: Z.cyto, fill: Z.cytoDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.3, curv: .3 });
    const line = ease(seg(t, L(26, 4.0), L(26, 5.6)));
    if (line > .02 && split < 1) { boilSeed('eq'); for (let i = 0; i < 10; i++) { const y0 = cy - 260 + i * 56; inkLine([[cx, y0], [cx, y0 + 30]], 2 * line * (1 - split), '#5E8C7A', 'ink', 0); } }
    // the four chromosomes: long pair carries colour (Y / y), short pair carries shape (R / r)
    const flip = ease(seg(t, L(26, 9.8), L(26, 11.0))) * (1 - ease(seg(t, L(26, 11.8), L(26, 12.6))));
    const loose = [[-160, -120, .4], [130, -60, -.5], [-60, 150, .8], [170, 140, -.2]];
    const lined = [[-46, -110, 0], [46, -110, 0], [-46, 130, 0], [46, 130, 0]];
    const sideX = sd => sd * (46 + 270 * split);
    const C4 = [['Y', 230, -1, 0], ['y', 230, 1, 0], ['R', 140, -1, 1], ['r', 140, 1, 1]];
    C4.forEach(([band, len, sd, pr], i) => {
      let x = lerp(loose[i][0], lined[i][0], line), y = lerp(loose[i][1], lined[i][1], line), a = lerp(loose[i][2], 0, line);
      if (line >= 1) x = sideX(sd);
      if (pr === 1 && flip > 0) { x = lerp(x, -x, flip); y += -60 * Math.sin(flip * Math.PI) * sd; }
      const dn = dance > 0 ? Math.sin(t * Math.PI * 2 / (BEAT * 2) + i) * .12 * dance : 0;
      chromo(cx + x, cy + y + (dance > 0 ? 10 * Math.sin(t * 4 + i) * dance : 0), len, band, 1.2, 'c' + i, a + dn);
      const k = seg(t, L(26, 1.2) + i * .4, L(26, 2.0) + i * .4);
      if (k > 0 && k < 1) { const p = arcPt([cx - 600 + i * 50, cy - 380], [cx + x, cy + y - len * .27], 120, ease(k)); marble(p[0], p[1], 22, band, { key: 'hm' + i }); }
      else if (k >= 1 && k < 1.01) {}
      if (k >= 1) K.sparkle(cx + x + 30, cy + y - len * .4, 22, seg(t, L(26, 2.0) + i * .4, L(26, 2.8) + i * .4), '#FFF3C4');
    });
    // spindle fibres pulling the homologs apart
    if (line > .3 && cut < 1) { boilSeed('spd'); for (const sd of [-1, 1]) for (let j = 0; j < 2; j++) { const tx = cx + sideX(sd), ty = cy + [-110, 130][j]; inkLine([[cx + sd * R * el * .92, cy], [tx + sd * 20, ty]], 1.2 * (1 - cut), '#5E8C7A', 'inkfine', .2); } }
    // the four kinds of gametes this makes (both ways the short pair can face), along the bottom
    const g4 = seg(t, L(26, 11.0), L(26, 12.0));
    if (g4 > .02) [['Y', 'R'], ['Y', 'r'], ['y', 'R'], ['y', 'r']].forEach(([a, b], i) => { const gx = 540 + i * 280, gy = 960, q = backOut(seg(g4, i * .15, i * .15 + .5)); if (q <= .02) return;
      boilSeed('hg' + i); paint(ellPts(gx, gy, 95 * q, 70 * q, 22), { wash: Z.cyto, ink: PAL.ink, sw: 1 });
      const dn = dance > 0 ? Math.sin(t * Math.PI * 2 / (BEAT * 2) + i) * .2 * dance : 0;
      chromo(gx - 30, gy, 120 * q, a, .55, 'hga' + i, dn); chromo(gx + 30, gy + 10, 75 * q, b, .55, 'hgb' + i, -dn); });
    const hk = K.act(t, [[L(26, -1.6), 'calm', { lookX: .9, lookY: -.5 }], [L(26, 2.4), 'wow', { lookX: .9, lookY: -.5 }], [L(26, 6.6), 'calm', { lookX: .9, lookY: -.3 }], [L(26, 11.4), 'idea'], [L(26, 13.0), 'sing']]);
    K.swim(170, 1000, 30, t, { ...hk, talk: true }, 'ph2');
    camEnd();
    if (lt < .6) { const at = [960, 470]; iris(at[0], at[1], lerp(0, 1500, easeIn(lt / .6)), PAL.ink); }
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E9B47F', Z.cream]);
  }

  // ================================ I: the paint table again (L27) ================================
  function box(x, y, key) {
    boilSeed('box' + key);
    paint(rrPts(x - 170, y - 110, 340, 120, 12), { wash: '#B98457', fill: '#8E5F38', fillOp: 50, tex: .6, ink: PAL.ink, sw: 1.1 });
    const ks = ['R', 'Y', 'r', 'y', 'R', 'y', 'Y', 'r', 'R', 'Y', 'y', 'r'];
    ks.forEach((k, i) => marble(x - 140 + (i % 6) * 56, y - 112 - Math.floor(i / 6) * 34 + (i % 2) * 6, 22, k, { key: 'bx' + i }));
    paint(rrPts(x - 180, y - 80, 360, 90, 12), { wash: '#C99A6B', fill: '#8E5F38', fillOp: 50, tex: .6, ink: PAL.ink, sw: 1.1 });
  }
  function redMarble(x, y, r, key, gl = 0) {                       // the red one: the trait that skipped a generation, still itself
    boilSeed('rm' + key);
    if (gl) glow(x, y, r * 2.6, '#FF9C8C', gl);
    paint(ellPts(x, y, r, r, 22), { wash: Z.red, fill: Z.redDk, fillOp: 70, tex: .4, ink: PAL.ink, sw: clamp(r / 22, .5, 1.2) });
    paint(ellPts(x - r * .34, y - r * .36, r * .28, r * .18, 10, 0, -.7), { wash: Z.glass, washOp: 230, ink: null });
  }
  function shotI(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(27, -1.6), [960, 600, 1.05]], [L(27, 7.6), [960, 600, 1.05]], [L(27, 9.6), [1250, 640, 1.15]], [DUR - 3, [1100, 700, 1.25]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    paintTable(t, 'i', .6);
    sheet('i');
    // the drop tree again, quiet; its red drop glows when the red marble arrives under it
    treeDraw(L(3, -2));
    palette(t, 'i', 1, 0);
    box(470, 870, 'i');
    // a line of marbles rolls out along the table, each still itself; the red one rolls last, under the red drop
    const ks = ['R', 'r', 'Y', 'y', 'r', 'R'];
    ks.forEach((k, i) => { const r0 = seg(t, L(27, 4.4) + i * .3, L(27, 6.0) + i * .3); if (r0 <= 0) return; const x = lerp(560, 760 + i * 70, easeOut(r0)); marble(x, 950, 24, k, { key: 'roll' + i }); });
    const rr = seg(t, L(27, 7.0), L(27, 9.4)), RX = lerp(560, ROW[3], easeOut(rr));
    if (rr > 0) redMarble(RX, 950 - 30 * Math.abs(Math.sin(rr * 9)) * (1 - rr), 26, 'rm', .5 * near(t, L(27, 10.5), 1.2));
    if (rr >= 1) { glow(ROW[3], ROWY, 120, '#FF9C8C', .45 * ease(seg(t, L(27, 9.4), L(27, 10.4)))); K.sparkle(ROW[3] + 40, ROWY - 70, 30, seg(t, L(27, 9.6), L(27, 10.4)), '#FFE3D0'); }
    // Pip: picks the red marble up at the end and holds it
    const px = 1000, py = 905, hold = t > L(27, 11.0);
    const o = K.act(t, [[L(27, -1.6), 'happy', { lookX: -.8, lookY: .3 }], [L(27, 4.6), 'calm', { lookX: -.6, lookY: .6 }], [L(27, 7.4), 'calm', { lookX: .8, lookY: .5 }], [L(27, 9.6), 'wow', { lookX: .8, lookY: -.3 }], [L(27, 11.0), 'love']]);
    const at = [1.6, -3.2];
    pip(px, py, 34, { ...o, ...(hold ? { armF: { at } } : {}), key: 'pi' });
    hatOn(px, py + (o.dy || 0) * 34, 34, false, 'ih');
    if (hold) { const h = K.hand(px, py, 34, at, { dy: o.dy }); redMarble(h[0] + 8, h[1] - 18, 22, 'rmh', .5); }
    const at2 = toScreen(px, py - 100);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E9B47F', Z.cream]);
    const close = seg(t, DUR - 3.2, DUR - .4);
    if (close > 0) iris(at2[0], at2[1], kf(close, [[0, 1800], [.6, 260], [.8, 240], [1, 0]], easeIn));
  }

  // ================================ the cover ================================
  LOOPS.cover = t => {
    K.setT(.5);
    K.wash(Z.dusk, t, { key: 'cv', blob: Z.duskBlob, rect: rectPts(-200, -200, W + 400, H + 400) });
    boilSeed('cvfl'); paint(rectPts(-200, 900, W + 400, 400), { wash: Z.table, fill: Z.tableDk, fillOp: 50, tex: .6, ink: null });
    // the pink paint (left of the hero) vs a cascade of marbles (right)
    boilSeed('cvpk'); paint(ellPts(1180, 760, 150, 70, 26, 3), { wash: Z.pink, ink: PAL.ink, sw: 1.2 });
    const ks = ['R', 'r', 'Y', 'y', 'R', 'Y', 'r', 'y', 'R'];
    ks.forEach((k, i) => marble(1500 + (i % 3) * 110 + (Math.floor(i / 3) % 2) * 40, 300 + Math.floor(i / 3) * 120, 46, k, { key: 'cvm' + i }));
    redMarble(1740, 760, 54, 'cvr', .6);
    // peas: three round, one wrinkled
    [[1220, 990, 0], [1330, 990, 0], [1440, 990, 0], [1560, 990, 1]].forEach(([x, y, wr], i) => pea(x, y, 44, { key: 'cvp' + i, wr, seed: i + 2 }));
    pip(1450, 900, 46, { ...pipFeel('wow', .2), lookX: .5, lookY: -.4, emote: 'exclaim', emoteK: 1, armF: { at: [2.0, -3.6] }, key: 'cvpip' });
    hatOn(1450, 900, 46, false, 'cvh');
    marble(...K.hand(1450, 900, 46, [2.0, -3.6]).map((v, i) => v + (i ? -20 : 10)), 34, 'R', { key: 'cvhold', glow: .5 });
    boilSeed('cvtag'); paint(rrPts(80, 92, 600, 92, 30, 2), { wash: '#6FA548', fill: '#4C7F2E', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
    const F = (wgt, px) => `${wgt} ${px}px "PingFang SC", "Hiragino Sans GB", "STHeiti", sans-serif`;
    letter('高中生物 · 孟德尔定律', 380, 140, 50, PAL.cream, { font: F(800, 50), screen: true });
    letter('遗传不是调色', 92, 330, 130, '#3B2F45', { font: F(900, 130), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    letter('是一盒弹珠', 92, 490, 130, '#3B2F45', { font: F(900, 130), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    boilSeed('cvblob'); paint(ellPts(420, 730, 360, 110, 30, 6, -.04), { wash: '#FBE2A6', fill: Z.gold, fillOp: 70, bleed: .2, tex: .6, ink: null });
    letter('3:1 → 9:3:3:1', 420, 730, 96, Z.redDk, { font: F(900, 96), stroke: PAL.cream, screen: true, rot: -.03 });
    letter('跟着豌豆，自己推出两大定律', 92, 880, 54, '#3B2F45', { font: F(800, 54), align: 'left', stroke: PAL.cream, screen: true, ink: false });
  };
  LOOPS.cover.len = 1;
  function stub(col) { return (t, lt, dur) => { K.setT(t); cam(960, 540, 1); K.wash(col, t, { key: 'stub' }); host(300, 950, 30, t, [[0, 'calm']], {}, 'stub'); camEnd(); }; }

  shots([[0, shotA], [L(3, -1.5), shotB1], [L(4, -1.2), shotB2], [L(5, -1), shotB3], [L(7, -1), shotB4], [L(8, -.8), shotB5], [L(10, -1.5), shotC1], [L(12, -1.6), shotC2], [L(13, -1.6), shotC3], [L(15, -1.6), shotC4], [L(18, -1.2), shotD], [L(19, -1.6), shotE], [L(20, -1.6), shotF1], [L(22, -1.6), shotF2], [L(25, -1.6), shotG], [L(26, -1.6), shotH], [L(27, -1.6), shotI]]);
})();

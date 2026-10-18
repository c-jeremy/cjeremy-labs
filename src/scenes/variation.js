// variation.js: "Pip讲变异与伴性遗传", 369 s. The royal disease: where a disease nobody had before comes from (one
// base-pair substitution in F9, in one germ cell: 基因突变) and why it almost only strikes boys (F9 is on the X and a
// boy has no backup: 伴X隐性遗传). Palace tree → blood → the base pair → splicing → what a mutation is → recap →
// X and Y → crosses and pedigree → why boys → recap → the tree again → gene therapy. See storyboards/variation.md.
// Every time is tied to a voice line: L(i, d) = line i's start + d seconds, so a retimed line moves its pictures.
(() => {
  const K = MK;
  const Z = {
    wall: '#F3DCCB', wallBlob: '#F9EADF', drape: '#B8434E', drapeDk: '#8E2F3A', floor: '#D8A673', floorDk: '#B98552',
    tap: '#F6E7CF', tapDk: '#E5CFA8', gold: '#E6AE3E', goldDk: '#B98424', node: '#FBF1E2', red: '#C8463F', redDk: '#93302B',
    bruise: '#7A5C9E', bruiseLt: '#A58CC4',
    X: '#4FA39B', XDk: '#2F7F78', Y: '#8C86C2', YDk: '#625CA0', f9: '#F0B640',
    blood: '#F2C7C3', bloodBlob: '#F8DEDA', rbc: '#D9534F', rbcDk: '#A8383A', plt: '#F2C6A0', fib: '#F5DFA0',
    nuc: '#2E2C5E', nucBlob: '#423F7E', board: '#D7EEE4', boardBlob: '#EAF6F0', recap: '#F5EEDD', recapBlob: '#FBF6EA',
    lilac: '#E6E0F3', lilacBlob: '#F3F0FA', dusk: '#F1D4B8', duskBlob: '#F8E6D2', liver: '#F6D3BE', liverBlob: '#FBE6D8'
  };
  const BC = { A: '#E8AA38', T: '#3A9C98', U: '#3A9C98', G: '#6E9F58', C: '#D9708A' };   // bases: ochre, teal, sap, rose (the series code)
  const VIC = { pip: '#9C7CC6', pipDk: '#735A9E', belly: '#E3D8F2' }, ALB = { pip: '#5E86CF', pipDk: '#3E62A3', belly: '#D3E0F4' };
  const LEO = { pip: '#7FB0D8', pipDk: '#5687B3', belly: '#DCEAF5' }, EDW = { pip: '#8C97AE', pipDk: '#646E86', belly: '#E1E5EE' };
  const GIRL = { pip: '#E08AA6', pipDk: '#B5607D', belly: '#F8DCE5' };
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));              // a soft pulse peaking at a
  const rotEll = (x, y, rx, ry, n, rot) => { const c = Math.cos(rot), s = Math.sin(rot); return ellPts(0, 0, rx, ry, n).map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]); };

  // ---------- small painted props ----------
  function tinted(cols, fn) { const old = { pip: PIPC.pip, pipDk: PIPC.pipDk, belly: PIPC.belly }; Object.assign(PIPC, cols); try { fn(); } finally { Object.assign(PIPC, old); } }
  function host(x, y, u, t, keys, extra = {}, key = 'ph') {      // Pip the host, swimming in place
    const o = { ...K.act(t, keys), ...extra };
    return K.swim(x, y, u, t, o, key);
  }
  function crown(x, y, s, key) {                                  // a little gold crown, (x, y) = the middle of its band
    boilSeed('cr' + key);
    const P = [[-.5, .22], [-.5, -.18], [-.52, -.5], [-.27, -.2], [0, -.58], [.27, -.2], [.52, -.5], [.5, -.18], [.5, .22]].map(([a, b]) => [x + a * s, y + b * s]);
    paint(P, { wash: Z.gold, ink: PAL.ink, sw: clamp(s / 40, .5, 1.1) });
    for (const a of [-.52, 0, .52]) paint(ellPts(x + a * s, y + (a ? -.52 : -.6) * s, s * .07, s * .07, 8), { wash: '#F7E3A3', ink: null });
    paint(ellPts(x, y + .02 * s, s * .08, s * .08, 8), { wash: Z.red, ink: null });
  }
  // a royal: a tinted Pip with a crown, and optionally a bruise (0..1, it blooms) on its side
  function royal(x, y, u, cols, o, key, extra = {}) {
    if (!(u > .8)) return;
    tinted(cols, () => pip(x, y, u, { ...o, key }));
    const dir = o.flip ? -1 : 1, sq = o.sq || 0, yy = y + (o.dy || 0) * u;
    if (extra.bruise > .02) bruise(x - dir * .95 * u * (1 + sq), yy - 2.9 * u * (1 - sq), u, extra.bruise, key);
    if (extra.crown !== false) crown(x + dir * .1 * u, yy - 4.72 * u * (1 - sq), 1.25 * u * (extra.crownS || 1), key);
  }
  function bruise(x, y, u, k, key) {
    boilSeed('br' + key); const q = easeOut(clamp(k));
    paint(ellPts(x, y, .62 * u * q, .5 * u * q, 14, .04 * u), { wash: Z.bruise, washOp: 210, ink: null });
    paint(ellPts(x + .12 * u, y - .08 * u, .32 * u * q, .26 * u * q, 10), { wash: Z.bruiseLt, washOp: 200, ink: null });
  }
  function drop(x, y, s, key) { boilSeed('dr' + key); paint([[x, y - s * 1.5], [x + s * .75, y - s * .1], [x + s * .6, y + s * .55], [x, y + s * .85], [x - s * .6, y + s * .55], [x - s * .75, y - s * .1]], { wash: Z.rbc, ink: PAL.ink, sw: clamp(s / 22, .5, 1), curv: .5 }); paint(ellPts(x - s * .25, y + s * .1, s * .18, s * .25, 8), { wash: '#F3A39E', ink: null }); }
  function ringK(x, y, rx, ry, k, col = Z.gold, key = 'rg', w = 4) {   // a highlight ring that swells and fades
    if (k <= 0 || k >= 1) return; boilSeed('ring' + key);
    const q = 1 + .18 * easeOut(k), P = ellPts(x, y, rx * q, ry * q, 30);
    inkLine(P.concat([P[0], P[1]]), w * (1 - k * .8), col, 'ink', .5);
  }
  function arrow(x0, y0, x1, y1, k, col, key, w = 14) {           // a painted arrow that draws itself
    if (k <= .02) return; boilSeed('arr' + key);
    const q = ease(k), ex = lerp(x0, x1, q), ey = lerp(y0, y1, q), a = Math.atan2(y1 - y0, x1 - x0), hl = w * 1.9;
    const bx = ex - Math.cos(a) * hl, by = ey - Math.sin(a) * hl;
    if (Math.hypot(bx - x0, by - y0) > 4) paint(ribbon([[x0, y0], [lerp(x0, bx, .5), lerp(y0, by, .5) + 3], [bx, by]], w * .8, w), { wash: col, ink: PAL.ink, sw: .9 });
    const nx = -Math.sin(a), ny = Math.cos(a);
    paint([[ex, ey], [bx + nx * w * 1.2, by + ny * w * 1.2], [bx - nx * w * 1.2, by - ny * w * 1.2]], { wash: col, ink: PAL.ink, sw: .9 });
  }
  function speedLines(k, col, key = 'spd') {                       // whip-pan streaks, screen space
    if (k <= 0) return;
    for (let i = 0; i < 16; i++) { boilSeed(key + i); const y = hash(i + 200) * H, x0 = hash(i + 201) * (W + 400) - 400, Ln = (260 + 520 * hash(i + 202)) * k; inkLine([[x0, y], [x0 + Ln, y + 3]], 1.5 + 2 * hash(i + 203), col, 'ink', 0); }
  }

  // ---------- the palace and the family tree (shots A and G) ----------
  function palaceBg(t, key, dusk = 0) {
    const wall = mixCol(Z.wall, Z.dusk, dusk), blob = mixCol(Z.wallBlob, Z.duskBlob, dusk);
    K.wash(wall, t, { key, blob, rect: rectPts(-2000, -1400, W + 4000, H + 2800) });
    boilSeed('fl' + key); paint(rectPts(-2000, 930, W + 4000, 1600), { wash: Z.floor, fill: Z.floorDk, fillOp: 40, tex: .5, ink: null });
    inkLine([[-1000, 932], [600, 928], [1500, 934], [3000, 930]], 1.3, mixCol(Z.floor, PAL.ink, .45), 'ink', .4);
    for (let i = 0; i < 9; i++) { boilSeed('fb' + key + i); const x = -600 + i * 420; inkLine([[x, 940], [x - 120, 1100]], .9, Z.floorDk, 'inkfine', 0); }
    for (const s of [-1, 1]) {                                     // crimson drapes at both sides, gold tie-backs
      boilSeed('dp' + key + s); const x0 = s < 0 ? -260 : W + 260, x1 = s < 0 ? 250 : W - 250;
      paint([[x0, -200], [x1, -200], [lerp(x0, x1, .55), 420], [lerp(x0, x1, .8), 940], [x0, 940]], { wash: Z.drape, fill: Z.drapeDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1, curv: .3 });
      for (let k = 1; k < 4; k++) inkLine([[lerp(x0, x1, k / 4), -180], [lerp(x0, x1, k / 4 * .6), 900]], .8, Z.drapeDk, 'inkfine', .3);
      paint(ellPts(lerp(x0, x1, .62), 440, 34, 16, 12), { wash: Z.gold, ink: PAL.ink, sw: .8 });
    }
  }
  // the tree: square = male, circle = female (pedigree convention); filled red = affected, red dot = carrier
  const N = {}, CPL = {};
  [['a1', 520, 150, 1], ['a2', 680, 150, 0], ['a3', 1240, 150, 1], ['a4', 1400, 150, 0],
   ['ed', 880, 265, 1, 'c0'], ['vm', 1040, 265, 0, 'c1'], ['vic', 930, 380, 0, 'c2', 'car'], ['alb', 1050, 380, 1],
   ['vicky', 420, 500, 0, 'c3'], ['bertie', 555, 500, 1, 'c3'], ['alice', 690, 500, 0, 'c3', 'car'], ['alfred', 825, 500, 1, 'c3'],
   ['helena', 960, 500, 0, 'c3'], ['louise', 1095, 500, 0, 'c3'], ['arthur', 1230, 500, 1, 'c3'], ['leo', 1365, 500, 1, 'c3', 'aff'], ['bea', 1500, 500, 0, 'c3', 'car'],
   ['g5', 555, 625, 1, 'bertie'], ['irene', 640, 625, 0, 'alice', 'car'], ['fritz', 720, 625, 1, 'alice', 'aff'], ['alix', 800, 625, 0, 'alice', 'car'],
   ['aoa', 1325, 625, 0, 'leo', 'car'], ['ce', 1405, 625, 1, 'leo'], ['ena', 1480, 625, 0, 'bea', 'car'], ['leob', 1560, 625, 1, 'bea', 'aff'], ['maur', 1640, 625, 1, 'bea', 'aff'],
   ['g6', 540, 750, 1, 'g5'], ['wald', 615, 750, 1, 'irene', 'aff'], ['hein', 680, 750, 1, 'irene', 'aff'], ['alexei', 800, 750, 1, 'alix', 'aff'],
   ['rupert', 1325, 750, 1, 'aoa', 'aff'], ['alfonso', 1450, 750, 1, 'ena', 'aff'], ['gonzalo', 1530, 750, 1, 'ena', 'aff']
  ].forEach(([id, x, y, m, par, st]) => { N[id] = { id, x, y, m, par, st }; });
  Object.assign(CPL, { c0: ['a1', 'a2'], c1: ['a3', 'a4'], c2: ['ed', 'vm'], c3: ['vic', 'alb'] });
  const NR = 22;
  const anchorOf = p => CPL[p] ? [(N[CPL[p][0]].x + N[CPL[p][1]].x) / 2, N[CPL[p][0]].y] : [N[p].x, N[p].y + NR];
  // when the red thread reaches each node (video time): the hook (L1), the four houses (L3), and the re-run in G
  const RED = {}, GOLDT = {}, CROWNT = {};
  function redAt(id) { return RED[id] ?? 1e9; }
  function treeNode(n, t, o = {}) {
    const hi = o.hi || 0, r = NR * (1 + .25 * hi), arr = seg(t, redAt(n.id), redAt(n.id) + .5), dim = o.dim || 0;
    boilSeed('nd' + n.id);
    const fillC = mixCol(Z.node, n.st === 'aff' ? Z.red : Z.node, arr);
    const P = n.m ? rrPts(n.x - r, n.y - r, 2 * r, 2 * r, 5) : ellPts(n.x, n.y, r, r, 20);
    paint(P, { wash: mixCol(fillC, Z.tap, dim * .6), ink: mixCol(PAL.ink, Z.tapDk, dim * .7), sw: 1.3 + 1.2 * hi });
    if (n.st === 'car' && arr > .02) paint(ellPts(n.x, n.y, 8 * backOut(arr), 8 * backOut(arr), 10), { wash: mixCol(Z.red, Z.tap, dim * .6), ink: null });
    if (arr > 0 && arr < 1) K.burst(n.x, n.y, 40, arr, Z.red, 'nb' + n.id);
  }
  function treeEdges(t, dim = 0) {
    for (const [c, [a, b]] of Object.entries(CPL)) { boilSeed('cp' + c); inkLine([[N[a].x + NR, N[a].y], [N[b].x - NR, N[b].y]], 2, mixCol(Z.goldDk, Z.tapDk, dim * .7), 'ink', 0); }
    const groups = {}; Object.values(N).forEach(n => { if (n.par) (groups[n.par] = groups[n.par] || []).push(n); });
    for (const [p, kids] of Object.entries(groups)) {
      const [ax, ay] = anchorOf(p), my = kids[0].y - NR - 26, xs = kids.map(k => k.x), col = mixCol(Z.goldDk, Z.tapDk, dim * .7);
      boilSeed('ed' + p);
      inkLine([[ax, ay], [ax, my]], 1.8, col, 'ink', 0);
      inkLine([[Math.min(ax, ...xs), my], [Math.max(ax, ...xs), my]], 1.8, col, 'ink', 0);
      kids.forEach(k => {
        inkLine([[k.x, my], [k.x, k.y - NR]], 1.8, col, 'ink', 0);
        // the red thread down to a carrier or an affected child: from the parent's anchor, along the bar, down
        if (k.st && k.id !== 'vic') { const r0 = redAt(k.id) - .45, q = seg(t, r0, r0 + .45); if (q > .02) {
          const pts = [[ax, ay], [ax, my], [k.x, my], [k.x, k.y - NR]], Lp = [0]; for (let i = 1; i < 4; i++) Lp.push(Lp[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
          const want = q * Lp[3], out = [pts[0]]; for (let i = 1; i < 4; i++) { if (Lp[i] <= want) out.push(pts[i]); else { const f = (want - Lp[i - 1]) / (Lp[i] - Lp[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break; } }
          boilSeed('rt' + k.id); inkLine(out, 4.2, mixCol(Z.red, Z.tap, dim * .6), 'ink', 0);
        } }
        if (GOLDT[k.id]) { const q = seg(t, GOLDT[k.id] - .5, GOLDT[k.id]); if (q > .02) { boilSeed('gt' + k.id); const pts = [[ax, ay], [ax, my], [k.x, my], [k.x, k.y - NR]]; const cut = Math.max(1, Math.ceil(q * 3)), out = pts.slice(0, cut + 1); const f = q * 3 - (cut - 1); out[cut] = [lerp(pts[cut - 1][0], pts[cut][0], f), lerp(pts[cut - 1][1], pts[cut][1], f)]; inkLine(out, 5, Z.gold, 'ink', 0); } }
      });
    }
  }
  function tapestry(t, key, o = {}) {
    boilSeed('tp' + key);
    paint(rrPts(330, 70, 1260, 820, 18), { wash: Z.tap, fill: Z.tapDk, fillOp: 45, tex: .5, ink: null });
    for (const [a, b] of [[[330, 70], [1590, 70]], [[1590, 70], [1590, 890]], [[1590, 890], [330, 890]], [[330, 890], [330, 70]]]) { boilSeed('tpb' + key + a[0] + a[1]); inkLine([a, b], 9, Z.gold, 'ink', 0); inkLine([a, b], 1.2, Z.goldDk, 'ink', 0); }
    for (const [x, y] of [[330, 70], [1590, 70], [1590, 890], [330, 890]]) { boilSeed('tpc' + key + x + y); paint(ellPts(x, y, 16, 16, 12), { wash: Z.gold, ink: PAL.ink, sw: .9 }); }
  }
  function castle(kind, x, y, s, k, key) {                          // four houses as painted emblems: no flags, no words
    if (k <= .02) return; const q = backOut(clamp(k)); boilSeed('cs' + key);
    push(); translate(x, y); scale(q);
    const ink = { ink: PAL.ink, sw: .9 };
    if (kind === 'uk') {                                            // a square keep with battlements, crimson
      paint([[-34, 30], [-34, -18], [-26, -18], [-26, -28], [-14, -28], [-14, -18], [-6, -18], [-6, -28], [6, -28], [6, -18], [14, -18], [14, -28], [26, -28], [26, -18], [34, -18], [34, 30]], { wash: '#C9616A', ...ink });
      paint(rrPts(-8, 6, 16, 24, 7), { wash: '#6B3A44', ink: null });
    } else if (kind === 'de') {                                     // a tall tower with a pointed slate roof
      paint(rectPts(-16, -14, 32, 44), { wash: '#C8B596', ...ink }); paint([[-22, -12], [0, -58], [22, -12]], { wash: '#5D6A8C', ...ink });
      paint(rrPts(-6, 4, 12, 18, 6), { wash: '#6B5A44', ink: null });
    } else if (kind === 'ru') {                                     // an onion dome
      paint(rectPts(-20, -6, 40, 36), { wash: '#F1E1C2', ...ink });
      paint([[-22, -6], [-26, -24], [-14, -42], [0, -60], [14, -42], [26, -24], [22, -6]], { wash: '#3E9A8E', ...ink, curv: .4 });
      inkLine([[0, -60], [0, -74]], 1.4, Z.goldDk, 'ink', 0);
    } else {                                                        // Spain: a round tower and a gate, ochre
      paint(rectPts(-30, -10, 60, 40), { wash: '#E2B15C', ...ink }); paint(rectPts(-30, -34, 20, 26), { wash: '#E2B15C', ...ink }); paint(rectPts(10, -34, 20, 26), { wash: '#E2B15C', ...ink });
      paint(rrPts(-9, 6, 18, 24, 9), { wash: '#7A4A2A', ink: null });
    }
    pop();
  }
  const HOUSES = [['uk', 1325, 852, 'rupert'], ['de', 648, 852, 'wald'], ['ru', 800, 856, 'alexei'], ['es', 1490, 852, 'alfonso']];
  function tree(t, key, o = {}) {
    tapestry(t, key, o);
    treeEdges(t, o.dim || 0);
    Object.values(N).forEach(n => treeNode(n, t, { hi: o.hi ? o.hi(n) : 0, dim: o.dimOf ? o.dimOf(n) : 0 }));
    if (o.houses) HOUSES.forEach(([k, x, y, id], i) => castle(k, x, y, 1.2, o.houses(i), key + k));
    for (const [id, tc] of Object.entries(CROWNT)) { const k = backOut(seg(t, tc, tc + .4)); if (k > .02) crown(N[id].x, N[id].y - NR - 12, 34 * k, 'tc' + id); }
  }

  // ================================ A: the royal disease (0–41) ================================
  RED.vic = L(1, 4.4);
  ['alice', 'leo', 'bea'].forEach((id, i) => RED[id] = L(1, 6.4) + i * .3);
  ['irene', 'fritz', 'alix', 'aoa', 'ena', 'leob', 'maur'].forEach((id, i) => RED[id] = L(1, 7.6) + i * .2);
  RED.rupert = L(3, 6.0); RED.wald = L(3, 6.7); RED.hein = L(3, 6.85); RED.alexei = L(3, 7.5); RED.alfonso = L(3, 8.2); RED.gonzalo = L(3, 8.35);
  const ANC = ['a1', 'a2', 'a3', 'a4', 'ed', 'vm'];
  const AFF = Object.values(N).filter(n => n.st === 'aff').map(n => n.id);
  function shotA1(t, lt, dur) {
    const push_ = easeIn(seg(t, L(2, -1.6), L(2, -.6)));
    const c = kf(t, [[0, [960, 520, 1.0]], [L(1, 1.0), [960, 520, 1.0]], [L(1, 3.4), [960, 330, 1.25]], [L(1, 6.0), [960, 400, 1.15]], [L(1, 7.4), [1000, 560, 1.0]], [L(2, -1.6), [1000, 560, 1.0]]], ease);
    const z = lerp(c[2], 4.2, push_), cx = lerp(c[0], N.vic.x, push_), cy = lerp(c[1], N.vic.y, push_);
    cam(cx + 6 * wob(t, .05), cy + 4 * wob(t, .04), z);
    palaceBg(t, 'a');
    tree(t, 'a', { hi: n => ANC.includes(n.id) ? near(t, L(1, 2.0) + ANC.indexOf(n.id) * .3, .25) * .6 : n.id === 'vic' ? near(t, L(1, 4.4), .4) : 0 });
    if (t > L(1, 4.4) && t < L(1, 5.6)) K.sparkle(N.vic.x + 30, N.vic.y - 30, 40, seg(t, L(1, 4.4), L(1, 5.6)), '#FFD9D0');
    camEnd();
    const y = host(1765, 1010, 30, t, [[0, 'calm', { lookX: -.6, lookY: -.8 }], [L(1, 1.6), 'calm', { lookX: -.7, lookY: -1 }], [L(1, 5.3), 'confused', { lookX: -.8, lookY: -.8 }],
      [L(1, 8.4), 'worried', { lookX: -.8, lookY: -.5 }], [L(1, 11.0), 'calm', { lookX: -.9, lookY: -.6 }]], { flip: true }, 'pa');
    const at = [1765, y - 2.8 * 30];
    if (lt < .9) iris(at[0], at[1], kf(lt, [[0, 0], [.15, 210], [.4, 230], [.9, 1900]], easeIn));
    flash(seg(t, L(2, -1.1), L(2, -.6)), '#FFF6E8');
  }
  function shotA2(t, lt, dur) {                                    // the nursery: Victoria and baby Leopold
    const c = kf(t, [[L(2, -.6), [960, 640, 1.08]], [L(2, 6.0), [1010, 660, 1.12]], [L(2, 8.2), [1100, 700, 1.3]], [L(3, -1.4), [1100, 700, 1.34]]], ease);
    const sh = t > L(2, 7.6) && t < L(2, 7.95) ? shakeXY(t, 6) : [0, 0];
    cam(c[0] + 6 * wob(t, .05) + sh[0], c[1] + 4 * wob(t, .04) + sh[1], c[2]);
    palaceBg(t, 'b');
    boilSeed('rug'); paint(ellPts(1000, 970, 700, 70, 30), { wash: '#E3A08B', fill: '#C97D6A', fillOp: 40, tex: .4, ink: null });
    boilSeed('win'); paint(rrPts(1250, 160, 300, 360, 150), { wash: '#FBEFD6', ink: PAL.ink, sw: 1.2 }); inkLine([[1400, 170], [1400, 515]], 1.4, PAL.ink, 'ink', 0); inkLine([[1258, 330], [1542, 330]], 1.4, PAL.ink, 'ink', 0);
    // the toy block
    const BX = 1290, bump = spring(t, L(2, 7.6), 8, 26);
    boilSeed('blk'); push(); translate(BX, 935); rotate(.06 * bump);
    paint(rrPts(-46, -92, 92, 92, 8), { wash: '#7DB0D8', ink: PAL.ink, sw: 1.2 }); paint(starPts(0, -46, 26, .45, 5), { wash: '#F4D06F', ink: PAL.ink, sw: .8 }); pop();
    // Victoria
    royal(640, 935, 46, VIC, { ...K.act(t, [[L(2, -.6), 'calm', { lookX: .5 }], [L(2, 1.2), 'happy'], [L(2, 4.2), 'love', { lookX: .6 }], [L(2, 7.7), 'wow', { lookX: .9 }], [L(2, 8.3), 'worried', { lookX: .9 }]], 3) }, 'vic');
    // baby Leopold pops in, toddles to the block, bumps it, and bruises
    const born = backOut(seg(t, L(2, 4.0), L(2, 4.5)));
    if (born > .02) {
      const walkK = seg(t, L(2, 6.0), L(2, 7.6)), x = lerp(870, BX - 120, easeIn(walkK)), back = ease(seg(t, L(2, 7.6), L(2, 8.0))) * 26;
      const o = K.act(t, [[L(2, 4.0), 'happy'], [L(2, 5.6), 'laugh'], [L(2, 7.6), 'dizzy', { take: 1.2 }], [L(2, 8.7), 'cry']], 7);
      const hop = walkK > 0 && walkK < 1 ? Math.abs(Math.sin(walkK * Math.PI * 5)) * .35 : 0;
      royal(x - back, 935, 22 * born, LEO, { ...o, dy: (o.dy || 0) - hop, walk: walkK * 10, sq: (o.sq || 0) + .1 * spring(t, L(2, 7.6), 7, 20) }, 'leo', { bruise: seg(t, L(2, 8.4), L(2, 9.6)), crownS: .9 });
      if (t > L(2, 7.6) && t < L(2, 8.3)) K.burst(BX - 50, 870, 50, seg(t, L(2, 7.6), L(2, 8.3)), PAL.ink, 'bonk');
      const dk = seg(t, L(2, 9.9), L(2, 11.4));
      if (dk > 0) drop(x - back - 22, 935 - 50 + 70 * easeIn(clamp(dk * 1.3)) - 30, 9 * Math.min(1, dk * 4), 'd1');
      if (dk > .5) { boilSeed('pud'); paint(ellPts(x - back - 22, 942, 26 * ease(seg(dk, .5, 1)), 6, 12), { wash: Z.rbc, washOp: 200, ink: null }); }
    }
    host(1660, 950, 30, t, [[L(2, -.6), 'calm', { lookX: -.8 }], [L(2, 4.3), 'happy'], [L(2, 7.7), 'wow', { lookX: -.8 }], [L(2, 8.8), 'worried', { lookX: -.8 }]], { flip: true }, 'pb');
    camEnd();
    flash(1 - seg(t, L(2, -.6), L(2, 0)), '#FFF6E8');
    flash(seg(t, L(3, -.9), L(3, -.4)), '#FFF6E8');
  }
  function shotA3(t, lt, dur) {                                    // back to the tree: clean above Victoria, red below, four houses
    const out = ease(seg(t, L(3, -.4), L(3, 1.4)));
    const c = kf(t, [[L(3, 1.4), [960, 300, 1.35]], [L(3, 3.4), [960, 300, 1.35]], [L(3, 4.8), [1000, 520, 1.0]], [L(3, 12.0), [1000, 560, 1.0]]], ease);
    const z = lerp(4.2, c[2], out), cx = lerp(N.vic.x, c[0], out), cy = lerp(N.vic.y, c[1], out);
    cam(cx + 6 * wob(t, .05), cy + 4 * wob(t, .04), z);
    palaceBg(t, 'a');
    const boys = near(t, L(3, 12.3), .5);
    tree(t, 'a', { hi: n => ANC.includes(n.id) ? near(t, L(3, 1.6) + ANC.indexOf(n.id) * .3, .25) * .6 : AFF.includes(n.id) ? boys : 0,
      houses: i => seg(t, [RED.rupert, RED.wald, RED.alexei, RED.alfonso][i] - .1, [RED.rupert, RED.wald, RED.alexei, RED.alfonso][i] + .35) });
    camEnd();
    host(1765, 1010, 30, t, [[L(3, -.4), 'calm', { lookX: -.6, lookY: -.8 }], [L(3, 3.0), 'calm', { lookX: -.8, lookY: -.3 }], [L(3, 8.6), 'wow', { lookX: -.8, lookY: -.2 }],
      [L(3, 12.6), 'worried', { lookX: -.8 }], [L(4, -3.5), 'confused', { lookX: -.6, lookY: -.6 }]], { flip: true }, 'pa');
    flash(1 - seg(t, L(3, -.4), L(3, .2)), '#FFF6E8');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#D98A86', Z.blood]);
  }

  // ---------- bases: interlocking puzzle stubs with painted letters (from the DNA film) ----------
  const GLYPH = {
    A: [[[-.34, .46], [0, -.46], [.34, .46]], [[-.18, .1], [.18, .1]]],
    T: [[[-.4, -.44], [.4, -.44]], [[0, -.44], [0, .46]]],
    U: [[[-.34, -.46], [-.34, .12], [-.2, .4], [0, .47], [.2, .4], [.34, .12], [.34, -.46]]],
    C: [[...Array(11)].map((_, i) => { const a = .75 + i / 10 * (TAU - 1.5); return [Math.cos(a) * .42, Math.sin(a) * .46]; })],
    G: [[...Array(11)].map((_, i) => { const a = .75 + i / 10 * (TAU - 1.2); return [Math.cos(a) * .42, Math.sin(a) * .46]; }).concat([[.4, .1], [.08, .1]])]
  };
  function glyph(ch, x, y, s, col = PAL.cream, sw = 1.1) { for (const st of GLYPH[ch] || []) inkLine(st.map(([a, b]) => [x + a * s, y + b * s]), sw, col, 'ink', ch === 'C' || ch === 'G' || ch === 'U' ? .5 : 0); }
  function piecePts(type, w, Ln) {                                 // pointing +y from (0, 0)
    const convex = type === 'A' || type === 'G', round = type === 'G' || type === 'C', d = w * .34, P = [[-w / 2, 0], [w / 2, 0], [w / 2, Ln]];
    if (round) for (let i = 1; i < 8; i++) { const a = i / 8 * Math.PI; P.push([w / 2 * Math.cos(a), Ln + (convex ? 1 : -1) * d * Math.sin(a)]); }
    else P.push([0, Ln + (convex ? d : -d)]);
    P.push([-w / 2, Ln]); return P;
  }
  function piece(x, y, ang, type, w, Ln, o = {}) {                 // ang 0 = pointing down
    if (Ln < 2) return; boilSeed('pc' + (o.key ?? ''));
    push(); translate(x, y); rotate(ang); if (o.sc != null) scale(o.sc);
    if (o.glow) glow(0, Ln * .6, w * 1.8, '#FFE08A', o.glow);
    paint(piecePts(type, w, Ln), { wash: o.col || mixCol(BC[type === 'T' && o.rna ? 'U' : type], '#9A96A8', o.dim || 0), ink: PAL.ink, sw: o.sw ?? .8 });
    if (o.letter > .02) { push(); translate(0, Ln * .5); rotate(-ang); scale(backOut(clamp(o.letter))); glyph(type, 0, 0, w * .62, PAL.cream, o.gsw ?? 2.8); pop(); }
    pop();
  }
  function backbone(P, w, col, key) { if (P.length < 2) return; boilSeed('bb' + key); paint(ribbon(P, w, w), { wash: col, fill: mixCol(col, PAL.ink, .3), fillOp: 50, tex: .5, ink: PAL.ink, sw: .8 }); }
  const SEQ4 = ['A', 'T', 'G', 'C'], seqAt = (i, s = 0) => SEQ4[Math.floor(hash(i * 2.71 + s * 13.1 + 3) * 4)];
  const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  function pipGlow(x, y, u, a = .4) { glow(x, y - 2.6 * u, 4.6 * u, '#A898E6', a); }

  // ================================ B1: what fails: the clot (41–59.3) ================================
  const VT = 250, VB = 740, GAP = [905, 1015];                         // vessel walls (top, bottom) and the wound
  const RELAY = Array.from({ length: 6 }, (_, i) => { const a = Math.PI * (1.05 - i * .1); return [700 + 330 * Math.cos(a) * .9, 640 - 250 * Math.sin(a) * .9 + i * 6]; });
  const IX = 3;                                                        // the relay's fourth runner: factor IX, gold
  const netOn = t => t > L(4, 8.2) && t < L(4, 9.6);                   // the wound is sealed only in the first run
  function wall(y0, y1, key, gap) {
    boilSeed('wl' + key);
    const pts = (a, b) => [[a, y0], [b, y0], [b, y1], [a, y1]];
    const segs = gap ? [[-400, gap[0]], [gap[1], W + 400]] : [[-400, W + 400]];
    for (const [a, b] of segs) { paint(rectPts(a, y0, b - a, y1 - y0), { wash: '#E89A92', fill: '#C9706A', fillOp: 55, tex: .5, ink: null });
      for (let x = a; x < b - 60; x += 600) { boilSeed('wle' + key + x); inkLine([[x, y0], [Math.min(b, x + 620), y0]], 1.3, PAL.ink, 'ink', 0); inkLine([[x, y1], [Math.min(b, x + 620), y1]], 1.3, PAL.ink, 'ink', 0); } }
    for (let i = 0; i < 18; i++) { const x = -300 + i * 140 + 40 * hash(i + 40); if (gap && x > gap[0] - 40 && x < gap[1] + 10) continue; boilSeed('en' + key + i); paint(ellPts(x, (y0 + y1) / 2, 26, 9, 10), { wash: '#D47E78', ink: null }); }
  }
  function rbc(x, y, r, key, tilt = 0) { boilSeed('rb' + key); paint(rotEll(x, y, r, r * .78, 16, tilt), { wash: Z.rbc, ink: PAL.ink, sw: .9 }); paint(rotEll(x, y, r * .45, r * .32, 10, tilt), { wash: Z.rbcDk, washOp: 140, ink: null }); }
  function relayBead(i, x, y, lit, gone, t) {
    const r = 30 * (1 + .25 * lit), col = i === IX ? Z.f9 : mixCol('#B8C6D8', '#7FC3E8', lit);
    if (gone > .02) { boilSeed('rg' + i); const P = ellPts(x, y, 30, 30, 18); for (let k = 0; k < 18; k += 2) inkLine([P[k], P[k + 1]], 1.6, mixCol(Z.f9, Z.blood, .2), 'ink', 0); }
    if (gone >= 1) return;
    if (lit > .02) glow(x, y, 70, i === IX ? '#FFD36A' : '#9FE3FF', .5 * lit);
    boilSeed('rl' + i); paint(ellPts(x, y, r * (1 - gone), r * (1 - gone), 16), { wash: mixCol(col, PAL.cream, .3 * lit), ink: PAL.ink, sw: 1.1 });
    paint(ellPts(x - r * .3, y - r * .3, r * .28 * (1 - gone), r * .2 * (1 - gone), 8), { wash: PAL.cream, washOp: 170, ink: null });
  }
  function shotB1(t, lt, dur) {
    const c = kf(t, [[L(4, -1.4), [960, 560, 1.12]], [L(4, 3.0), [940, 600, 1.25]], [L(4, 4.2), [840, 560, 1.28]], [L(4, 12.0), [840, 560, 1.28]], [L(4, 13.0), [870, 580, 1.24]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash(Z.blood, t, { key: 'b1', blob: Z.bloodBlob, rect: rectPts(-600, -600, W + 1200, H + 1200) });
    boilSeed('lum'); paint(rectPts(-400, VT, W + 800, VB - VT), { wash: '#F7E1D6', ink: null });
    const torn = ease(seg(t, L(4, .2), L(4, .9)));
    wall(VT - 60, VT, 'top');
    wall(VB, VB + 70, 'bot', [lerp(958, GAP[0], torn), lerp(962, GAP[1], torn)]);
    if (torn > 0 && torn < 1) K.burst(960, VB + 35, 70, torn, PAL.ink, 'tear');
    // flowing cells; the ones that pass the wound while it is open leak out and down
    for (let i = 0; i < 26; i++) {
      const sp = 150 + 60 * hash(i + 3), x = ((hash(i) * 2600 + sp * t) % 2600) - 340, y = VT + 60 + (VB - VT - 120) * hash(i + 9);
      rbc(x, y + 10 * Math.sin(t * 1.3 + i), 28, 'f' + i, .3 * Math.sin(t + i));
    }
    for (let i = 0; i < 16; i++) {
      const ph = frac(t * .45 + hash(i + 60)), te = t - ph / .45;
      if (te < L(4, .9) || netOn(te)) continue;
      const x = lerp(GAP[0] + 20 + 70 * hash(i + 61), 960 + (hash(i + 62) - .5) * 500, ph), y = lerp(VB - 10, 1200, easeIn(ph));
      rbc(x, y, 24 * (1 - .3 * ph), 'lk' + i, ph * 3 + i);
    }
    // platelets stick at the edges of the wound
    for (let i = 0; i < 6; i++) { const k = seg(t, L(4, 3.4) + i * .16, L(4, 3.9) + i * .16); if (k <= 0) continue;
      const tx = i < 3 ? GAP[0] + 4 + i * 8 : GAP[1] - 4 - (i - 3) * 8, ty = VB + 8 + (i % 3) * 22, p = arcPt([tx + (i < 3 ? -260 : 260), VB - 200], [tx, ty], 60, easeOut(k));
      boilSeed('pl' + i); paint(ellPts(p[0], p[1], 20, 13, 12, 2, i), { wash: Z.plt, ink: PAL.ink, sw: .8 }); }
    // the relay: run 1 (all six, ends in the net), run 2 (IX is missing: it stops at the gap)
    const run1 = i => seg(t, L(4, 4.6) + i * .45, L(4, 4.9) + i * .45) * (1 - seg(t, L(4, 9.0), L(4, 9.6)));
    const run2 = i => i < IX ? seg(t, L(4, 13.3) + i * .4, L(4, 13.6) + i * .4) : 0;
    const gone = seg(t, L(4, 10.6), L(4, 11.2));
    RELAY.forEach(([x, y], i) => {
      const lit = Math.max(run1(i), run2(i)), pop = backOut(seg(t, L(4, 4.2) + i * .06, L(4, 4.5) + i * .06)); if (pop <= .02) return;
      if (i > 0) { const [px, py] = RELAY[i - 1], q = i === IX ? Math.max(run1(i)) : lit; boilSeed('rc' + i); inkLine([[px, py], [x, y]], 1.4, mixCol('#C9A9A4', '#7FC3E8', q), 'inkfine', 0); }
      relayBead(i, x, y + 4 * Math.sin(t * 2 + i), lit * pop, i === IX ? gone : 0, t);
      if (i === IX && gone > 0 && gone < 1) { const p = arcPt([x, y], [x + 120, y - 380], 80, easeIn(gone)); boilSeed('fly'); paint(ellPts(p[0], p[1], 30 * (1 - gone), 30 * (1 - gone), 16), { wash: Z.f9, ink: PAL.ink, sw: 1 }); }
    });
    ringK(RELAY[IX][0], RELAY[IX][1], 52, 52, seg(t, L(4, 11.4), L(4, 12.4)), Z.gold, 'ix', 5);
    const fizz = seg(t, L(4, 14.3), L(4, 15.0)); if (fizz > 0 && fizz < 1) K.burst(RELAY[IX][0], RELAY[IX][1], 50, fizz, '#9A96A8', 'fz');
    // the net
    const net = seg(t, L(4, 7.3), L(4, 8.2)) * (1 - seg(t, L(4, 9.0), L(4, 9.6)));
    if (net > .02) for (let k = 0; k < 10; k++) {                    // a criss-cross mesh over the wound
      boilSeed('nt' + k); const d = k < 5 ? 1 : -1, f = (k % 5) / 4, x0 = lerp(GAP[0] - 30, GAP[1] - 50, f);
      const a = [x0 + (d < 0 ? 80 : 0), VB - 14], b = [x0 + (d < 0 ? 0 : 80), VB + 76], e = [lerp(a[0], b[0], net), lerp(a[1], b[1], net)];
      if (Math.hypot(e[0] - a[0], e[1] - a[1]) > 6) paint(ribbon([a, e], 6, 6), { wash: '#F5DFA0', ink: '#B98424', sw: .6 });
    }
    K.check(GAP[1] + 120, VB - 90, 80, seg(t, L(4, 8.3), L(4, 8.8)) * (1 - seg(t, L(4, 9.2), L(4, 9.6))), 'ok');
    K.cross(GAP[1] + 120, VB - 90, 80, seg(t, L(4, 15.0), L(4, 15.6)), 'no');
    camEnd();
    host(180, 1015, 30, t, [[L(4, -1.4), 'calm', { lookX: .8, lookY: -.5 }], [L(4, .6), 'worried', { lookX: .8 }], [L(4, 4.4), 'calm', { lookX: .8, lookY: -.6 }], [L(4, 8.4), 'happy'],
      [L(4, 10.6), 'wow', { lookX: .8, lookY: -.8 }], [L(4, 12.2), 'calm', { lookX: .8, lookY: -.6 }], [L(4, 15.0), 'worried']], {}, 'pb1');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#D98A86', Z.blood]);
    const wp = seg(t, L(5, -1.2), L(5, -.6)); speedLines(wp * 1.4, '#F7E1D6', 'sb1');
  }

  // ================================ B2: the one base pair (59.3–74.1) ================================
  const DX = 64, DT = 420, DBt = 660, DLEN = 104, MUT = 18;              // rung spacing, strand y's, piece length, the mutant rung
  function ladder(t, x0, x1, o) {
    const i0 = Math.floor(x0 / DX), i1 = Math.ceil(x1 / DX);
    for (let i = i0; i <= i1; i++) {
      const x = i * DX + 6 * wob(t, .2, i * .13);
      let top = seqAt(i), bot = PAIR[top], g = 0, sc = 1, let_ = 0;
      if (i === MUT) {
        top = 'A'; bot = 'T';
        const sw = seg(t, o.swap, o.swap + .7); let_ = o.letter;
        if (sw > .5) { top = 'G'; bot = 'C'; }
        sc = sw > 0 && sw < 1 ? Math.abs(Math.cos(sw * Math.PI)) : 1; g = sw >= .5 ? .9 * (1 - seg(t, o.swap + 1.5, o.swap + 3.5) * .5) : 0;
      }
      const dim = o.dimOf ? o.dimOf(i) : 0;
      piece(x, DT, 0, top, 40, DLEN * sc, { key: 'lt' + i, letter: i === MUT ? let_ : 0, glow: g, dim });
      piece(x, DBt, Math.PI, bot, 40, DLEN * sc, { key: 'lb' + i, letter: i === MUT ? let_ : 0, glow: g, dim });
    }
    const T = [], B_ = []; for (let x = Math.floor(x0 / 20) * 20 - 40; x <= x1 + 40; x += 20) { T.push([x, DT - 4]); B_.push([x, DBt + 4]); }
    for (let s = 0; s < T.length - 1; s += 60) {
      const xs = T[s][0], col = o.gene && xs > 300 && xs < 1700 ? mixCol('#5B7FC7', Z.f9, o.gene) : '#5B7FC7';
      backbone(T.slice(s, s + 61), 16, col, 'T' + s); backbone(B_.slice(s, s + 61), 16, col, 'B' + s);
    }
  }
  function bone(x, y, s, key) {
    boilSeed('bn' + key); push(); translate(x, y); rotate(-.35); scale(s);
    paint([[-90, -14], [70, -12], [84, -34], [108, -30], [112, -6], [104, 12], [110, 32], [88, 38], [70, 14], [-88, 16], [-104, 36], [-122, 26], [-120, 4], [-126, -20], [-106, -36]], { wash: '#EFE4CC', fill: '#CDBB97', fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.2, curv: .45 });
    pop();
  }
  function shotB2(t, lt, dur) {
    const into = seg(t, L(5, 3.6), L(5, 4.7));
    K.wash(Z.nuc, t, { key: 'b2', blob: Z.nucBlob, rect: rectPts(-6000, -1400, W + 12000, H + 2800) });
    if (t < L(5, 4.4)) {                                                // the bone, and the dive into it
      const z = lerp(1, 7, easeIn(into));
      cam(960, 540, z);
      for (let i = 0; i < 30; i++) { boilSeed('ds' + i); paint(ellPts(hash(i + 7) * W, hash(i + 8) * H, 3 + 4 * hash(i), 3 + 4 * hash(i), 6), { wash: '#6E6AA8', ink: null }); }
      glow(960, 540, 260, '#FFE7B0', .35 + .15 * Math.sin(t * 3));
      bone(960, 540, 1.6, 'b');
      K.sparkle(1040, 470, 50, seg(t, L(5, 1.4), L(5, 2.4)), '#FFF3C4');
      camEnd();
    } else {
      const c = kf(t, [[L(5, 4.4), [-200, 540, .9]], [L(5, 5.4), [-200, 540, .9]], [L(5, 7.8), [1000, 540, .9]], [L(5, 9.0), [MUT * DX, 540, 1.6]], [L(5, 10.2), [MUT * DX, 540, 1.6]], [L(5, 11.0), [MUT * DX, 540, 2.5]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      const W2 = W / 2 / c[2] + 120;
      ladder(t, c[0] - W2, c[0] + W2, { swap: L(5, 12.0), letter: seg(t, L(5, 10.4), L(5, 10.9)), gene: ease(seg(t, L(5, 5.6), L(5, 6.8))) });
      ringK(MUT * DX, 540, 70, 190, seg(t, L(5, 8.8), L(5, 9.8)), Z.gold, 'mut', 5);
      camEnd();
    }
    pipGlow(190, 1010, 28); host(190, 1010, 28, t, [[L(5, -.6), 'calm', { lookX: .8, lookY: -.4 }], [L(5, 2.0), 'wow', { lookX: .8, lookY: -.6 }], [L(5, 5.0), 'calm', { lookX: .8, lookY: -.6 }],
      [L(5, 9.2), 'calm', { lookX: .9, lookY: -.8 }], [L(5, 12.4), 'wow', { lookX: .9, lookY: -.8 }], [L(5, 13.6), 'idea']], {}, 'pb2');
    flash(near(t, L(5, 4.4), .25) * 1.2, '#FFF6E8');
    const wp = 1 - seg(t, L(5, -.6), L(5, .1)); speedLines(wp * 1.4, '#8C88C8', 'sb2');
  }

  // ================================ B3: the mis-splice and the frameshift (74.1–87.6) ================================
  const SX = 44, EX3 = 12, INTR = 10, EX4 = 18, MY = 330;
  const RNA = (() => { const L_ = []; for (let i = 0; i < EX3 + INTR + EX4; i++) L_.push({ b: ['A', 'U', 'G', 'C'][Math.floor(hash(i * 3.3 + 70) * 4)], kind: i < EX3 ? 'ex' : i < EX3 + INTR ? 'in' : 'ex', i }); L_[EX3 + INTR - 2].b = 'A'; L_[EX3 + INTR - 1].b = 'G'; return L_; })();
  const STOPC = 7;                                                          // the codon (after the shift) that reads as stop
  function shotB3(t, lt, dur) {
    const c = kf(t, [[L(6, -.4), [960, 520, 1.0]], [L(6, 9.0), [960, 520, 1.0]], [L(6, 10.0), [900, 600, 1.0]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash(Z.nuc, t, { key: 'b3', blob: Z.nucBlob, rect: rectPts(-600, -600, W + 1200, H + 1200) });
    const lift = ease(seg(t, L(6, 2.6), L(6, 3.6))), close = ease(seg(t, L(6, 3.4), L(6, 4.4)));
    const n = RNA.length, x0pre = 960 - (n - 1) * SX / 2, keep = EX3 + INTR - 2;              // the cut lands 2 bases early: keep the intron's last 2
    const nPost = EX3 + 2 + EX4, x0post = 960 - (nPost - 1) * SX / 2;
    const pts = [];
    RNA.forEach((r, i) => {
      let x = x0pre + i * SX, y = MY, op = 1;
      const postIdx = i < EX3 ? i : i >= keep ? i - (INTR - 2) : -1;
      if (postIdx < 0) { const k = (i - EX3 + .5) / (INTR - 2); y = MY - lift * 120 * Math.sin(k * Math.PI) - lift * 90; x = lerp(x, 960 + (x - 960) * .5, lift); op = 1 - seg(t, L(6, 3.8), L(6, 4.6)); if (op <= 0) return; }
      else x = lerp(x, x0post + postIdx * SX, close);
      const extra = i >= keep && i < EX3 + INTR, hiX = extra ? near(t, L(6, 4.8), .5) + .5 * seg(t, L(6, 5), L(6, 6)) : 0;
      piece(x, y, Math.PI, r.b, 34, 60, { key: 'm' + i, rna: true, dim: r.kind === 'in' ? .65 : 0, glow: extra ? .7 * hiX : 0, sc: op });
      if (postIdx >= 0 || lift < .5) pts.push([x, y + 4, postIdx]);
    });
    pts.sort((a, b) => a[0] - b[0]);
    let run = []; const runs = [];
    for (const p of pts) { if (run.length && p[0] - run[run.length - 1][0] > SX * 1.6) { runs.push(run); run = []; } run.push(p); }
    runs.push(run); runs.forEach((R, k) => { if (R.length > 1) backbone(R.map(p => [p[0], p[1]]), 16, '#E8A33D', 'rn' + k); });
    // the right cut (gold, dashed) and the real one (red), two bases apart
    const cutK = seg(t, L(6, 1.6), L(6, 2.1)) * (1 - seg(t, L(6, 3.0), L(6, 3.4)));
    if (cutK > .02) {
      const xr = x0pre + (EX3 + INTR - .5) * SX, xw = x0pre + (keep - .5) * SX;
      boilSeed('cutG'); for (let k = 0; k < 6; k++) inkLine([[xr, MY - 90 + k * 30], [xr, MY - 76 + k * 30]], 3, Z.gold, 'ink', 0);
      boilSeed('cutR'); inkLine([[xw, MY - 90], [xw, MY + 80]], 4 * cutK, Z.red, 'ink', 0);
    }
    // codon brackets march in threes; after the two extra bases they are out of step
    const BY = MY + 96, bx = j => x0post + (j * 3 + 1) * SX;
    for (let j = 0; j * 3 + 2 < nPost; j++) {
      const k = seg(t, L(6, 4.8) + j * .28, L(6, 5.1) + j * .28); if (k <= 0 || j > STOPC) continue;
      const bad = j >= 4, x = bx(j), col = j === STOPC ? Z.red : bad ? '#C98A84' : Z.gold;
      boilSeed('br' + j); const q = backOut(k); paint(rrPts(x - SX * 1.38 * q, BY, SX * 2.76 * q, 16, 8), { wash: col, ink: PAL.ink, sw: .9 });
      // a protein bead per codon, until the stop
      if (j < STOPC) { const q = backOut(seg(t, L(6, 9.8) + j * .2, L(6, 10.2) + j * .2)); if (q > .02) { boilSeed('pb' + j); paint(ellPts(x, 690 + (j % 2) * 12, 38 * q, 38 * q, 16), { wash: bad ? '#B0634A' : Z.f9, ink: PAL.ink, sw: 1 }); } }
    }
    const stopK = seg(t, L(6, 7.5), L(6, 8.2));
    if (stopK > 0) { const x = bx(STOPC); boilSeed('stp'); paint(ellPts(x, BY + 80, 50 * backOut(stopK), 50 * backOut(stopK), 8, 0, Math.PI / 8), { wash: Z.red, ink: PAL.ink, sw: 1.2 }); K.cross(x, BY + 80, 56, seg(t, L(6, 7.8), L(6, 8.4)), 'stx'); }
    // the full-length protein it should have been: a ghost row of gold rings running on past the stop
    const ghost = seg(t, L(6, 11.0), L(6, 11.8));
    if (ghost > .02) for (let j = STOPC; j < 11; j++) { const x = bx(0) + j * 3 * SX, q = clamp(ghost * 2 - (j - STOPC) * .1); if (q <= 0) continue; boilSeed('gh' + j); const P = ellPts(x, 690 + (j % 2) * 12, 38, 38, 16); for (let k = 0; k < 16; k += 2) inkLine([P[k], P[k + 1]], 2.4 * q, mixCol(Z.f9, Z.nuc, .3), 'ink', 0); }
    camEnd();
    pipGlow(170, 1010, 28); host(170, 1010, 28, t, [[L(6, -.4), 'calm', { lookX: .8, lookY: -.6 }], [L(6, 2.0), 'wow', { lookX: .8, lookY: -.8 }], [L(6, 5.2), 'calm', { lookX: .9, lookY: -.4 }],
      [L(6, 8.0), 'worried', { lookX: .9, lookY: -.4 }], [L(6, 11.2), 'sad', { lookX: .9 }]], {}, 'pb3');
    flash(1 - seg(t, L(6, -.4), L(6, .2)), '#FFF6E8');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#9FD3BF', Z.board]);
  }

  // ---------- chromosomes (from the meiosis film): a chromatid from its top end (f = 0) to its bottom (f = 1) ----------
  const nrm = ang => [-Math.sin(ang), Math.cos(ang)];
  function cpt(cx, cy, ang, Lc, c, f, o) {
    const d = [Math.cos(ang), Math.sin(ang)], n = nrm(ang), u = (f - c) * Lc, Lh = Math.max(c, 1 - c) * Lc;
    const off = (o.off || 0) + (o.bow || 0) * Math.pow(Math.abs(u) / Lh, 1.6);
    return [cx + d[0] * u + n[0] * off, cy + d[1] * u + n[1] * off];
  }
  function cpiece(cx, cy, ang, Lc, c, f0, f1, col, o, dx = 0, dy = 0) {
    const w = o.w || 26, N_ = Math.max(5, Math.round((f1 - f0) * Lc / 7)), Lp = [], Rp = [];
    for (let i = 0; i <= N_; i++) {
      const g = (1 - Math.cos(Math.PI * i / N_)) / 2, f = f0 + (f1 - f0) * g;
      const p = cpt(cx, cy, ang, Lc, c, f, o), q = cpt(cx, cy, ang, Lc, c, Math.min(1, f + .01), o), r = cpt(cx, cy, ang, Lc, c, Math.max(0, f - .01), o);
      let tx = q[0] - r[0], ty = q[1] - r[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const round = Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(2 * f - 1), 7))), pinch = 1 - .3 * Math.exp(-Math.pow((f - c) * Lc / (.06 * Lc + 3), 2));
      const hw = w / 2 * Math.max(.04, round) * pinch;
      Lp.push([p[0] - ty * hw + dx, p[1] + tx * hw + dy]); Rp.push([p[0] + ty * hw + dx, p[1] - tx * hw + dy]);
    }
    const hi = o.hi || 0;
    paint(Lp.concat(Rp.reverse()), { wash: mixCol(col, PAL.cream, .5 * hi), ink: PAL.ink, sw: o.sw ?? clamp(w / 28, .45, 1.05) * (1 + .6 * hi), curv: .15 });
  }
  function chromatid(cx, cy, ang, P, segs, o, key) { boilSeed('ct' + key); for (const [f0, f1, col, dx = 0, dy = 0] of segs) if (f1 - f0 > .005) cpiece(cx, cy, ang, P.L, P.c, f0, f1, col, o, dx, dy); }
  function centromere(x, y, w, key) { boilSeed('cm' + key); paint(ellPts(x, y, w * .3, w * .3, 12), { wash: '#3B3346', ink: null }); }
  // a chromosome: one chromatid (rep 0) or two sisters (rep 1, the X shape). o: rep, w, bow, segsA/segsB, hi
  function chromo(x, y, ang, P, o, key) {
    const w = o.w || 26, rep = clamp(o.rep ?? 1), A = o.segsA, B = o.segsB || A, base = { w };
    if (rep <= .001) { chromatid(x, y, ang, P, A, { ...base, hi: o.hi || 0 }, key + 'a'); centromere(x, y, w, key); return; }
    const e = ease(rep), gap = w * .47 * e, bw = (o.bow ?? w * .7) * e;
    chromatid(x, y, ang, P, B, { ...base, off: -gap, bow: -bw, hi: o.hi || 0 }, key + 'b');
    chromatid(x, y, ang, P, A, { ...base, off: gap, bow: bw, hi: o.hi || 0 }, key + 'a');
    centromere(x, y, w * (1 + .3 * e), key);
  }
  const solid = col => [[0, 1, col]];
  const banded = (col, f0, f1, band) => [[0, f0, col], [f0, f1, band], [f1, 1, col]];
  function roundCell(x, y, r, key, o = {}) {
    boilSeed('rc' + key);
    paint(ellPts(x, y, r * (1 + (o.sq || 0)), r * (1 - (o.sq || 0)), 30, 0), { wash: o.col || '#F3F6EA', fill: o.dk || '#D9E6CF', fillOp: 55, tex: .5, bleed: .05, ink: PAL.ink, sw: clamp(r / 150, .7, 1.4), curv: .25 });
  }
  function sperm(x, y, s, ang, t, col, key, tail = 1) {           // head first along ang, the tail beats behind it
    boilSeed('sp' + key);
    const ca = Math.cos(ang), sa = Math.sin(ang), P = [];
    if (tail > .02) { for (let i = 0; i <= 10; i++) { const d = 12 * s + i * 7 * s * tail, w = Math.sin(t * 13 - i * .8 + key.length) * (1.5 + i * .9) * s * tail; P.push([x - ca * d - sa * w, y - sa * d + ca * w]); } inkLine(P, clamp(1.6 * s, .6, 3.2), PAL.ink, 'inkfine', .6); }
    paint(rotEll(x, y, 15 * s, 10.5 * s, 14, ang), { wash: col, ink: PAL.ink, sw: Math.min(1, .7 * s) });
    paint(rotEll(x + ca * 4 * s, y + sa * 4 * s, 6 * s, 5 * s, 10, ang), { wash: mixCol(col, PAL.cream, .45), ink: null });
  }
  function cloud(cx, cy, rx, ry, k, from, key) {                  // a thought bubble with two little bubbles back to the thinker
    if (k <= .02) return; boilSeed('cl' + key);
    const q = backOut(k);
    paint(ellPts(lerp(from[0], cx, .22), lerp(from[1], cy, .22), 12 * q, 10 * q, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(ellPts(lerp(from[0], cx, .42), lerp(from[1], cy, .42), 20 * q, 17 * q, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; P.push([cx + Math.cos(a) * rx * q * (1 + .06 * Math.sin(a * 8)), cy + Math.sin(a) * ry * q * (1 + .06 * Math.sin(a * 8))]); }
    paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
  }
  function card(x, y, w, h, k, key) { if (k <= .02) return; boilSeed('cd' + key); const q = backOut(k); paint(rrPts(x - w / 2 * q, y - h / 2 * q, w * q, h * q, 26), { wash: '#F7FBF8', fill: '#DCEEE5', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 }); }
  // a short DNA duplex: rungs = [{x, top, dy, sc, glow, kink, recol}], two backbones from xa to xb
  function duplex(cy, rungs, xa, xb, key, o = {}) {
    const H2 = o.h || 64, Ln = H2 - 8, w = o.w || 34;
    const vis = rungs.some(r => (r.sc ?? 1) > .3);
    for (const [yy, s_] of [[cy - H2 - 3, 'T'], [cy + H2 + 3, 'B']]) { if (vis && xb - xa > 4) backbone([[xa, yy], [(xa + xb) / 2, yy + (o.bb ? o.bb((xa + xb) / 2) : 0)], [xb, yy]], 13, o.bbCol || '#5B7FC7', key + s_); }
    rungs.forEach((r, i) => {
      const sc = r.sc ?? 1; if (sc <= .02) return;
      push(); translate(r.x, cy + (r.dy || 0)); rotate(r.kink || 0);
      piece(0, -H2, 0, r.top, w, Ln * sc, { key: key + 't' + i, glow: r.glow, col: r.colT });
      piece(0, H2, Math.PI, r.bot || PAIR[r.top], w, Ln * sc, { key: key + 'b' + i, glow: r.glow, col: r.colB });
      pop();
    });
  }
  const BOARD = t => { K.wash(Z.board, t, { key: 'c', blob: Z.boardBlob, rect: rectPts(-2400, -1600, W + 4800, H + 3200) }); K.motes(t, 14, mixCol(Z.board, '#7FB8A0', .35), { key: 'c' }); };
  const AA6 = ['#E0714E', '#4FA3B5', '#E8AA38', '#7B5CA8', '#6E9F58', '#E27A92', '#B0634A', '#5E86CF'];
  const aaOf = cod => AA6[Math.floor(hash(cod.split('').reduce((a, c) => a * 5 + 'AUGC'.indexOf(c) + 1, 7) * .731) * AA6.length)];

  // ================================ C1: what a mutation is (87.6–115.4) ================================
  const DSEQ = ['A', 'T', 'G', 'C', 'C', 'G', 'T', 'A', 'G'];
  function shotC1(t, lt, dur) {
    const zc = t < L(8, -.7) ? 1.15 : 1;
    cam(990 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), zc);
    BOARD(t);
    const ST = 74, x0 = 1000 - 4 * ST;
    if (t < L(8, -.7)) {                                                 // L7: substitution, insertion, deletion
      const show = i => backOut(seg(t, L(7, -1.6) + i * .25, L(7, -1.1) + i * .25)), out = 1 - seg(t, L(8, -1.2), L(8, -.7));
      const pulseAll = near(t, L(7, 8.4), .4);
      // 1: substitution
      const sw = seg(t, L(7, 2.4), L(7, 3.0));
      duplex(250, DSEQ.map((b, i) => ({ x: x0 + i * ST, top: i === 4 ? (sw > .5 ? 'A' : b) : b, sc: show(0) * out * (i === 4 && sw > 0 && sw < 1 ? Math.abs(Math.cos(sw * Math.PI)) : 1), glow: i === 4 ? .8 * seg(t, L(7, 2.7), L(7, 3.1)) * (1 - seg(t, L(7, 5), L(7, 6))) + pulseAll : 0 })), x0 - 50, x0 + 8 * ST + 50, 'd1', { h: 54 });
      // 2: insertion
      const ins = ease(seg(t, L(7, 3.7), L(7, 4.3)));
      const r2 = DSEQ.map((b, i) => ({ x: x0 + i * ST + (i >= 4 ? ST * ins : 0), top: b, sc: show(1) * out }));
      if (ins > .02) r2.push({ x: x0 + 4 * ST, top: 'T', dy: -260 * (1 - easeOut(seg(t, L(7, 3.9), L(7, 4.4)))), sc: out * seg(t, L(7, 3.7), L(7, 3.9)), glow: .8 * seg(t, L(7, 4.3), L(7, 4.6)) * (1 - seg(t, L(7, 6), L(7, 7))) + pulseAll });
      duplex(540, r2, x0 - 50, x0 + 8 * ST + 50 + ST * ins, 'd2', { h: 54 });
      // 3: deletion
      const del = ease(seg(t, L(7, 4.9), L(7, 5.6)));
      duplex(830, DSEQ.map((b, i) => ({ x: x0 + i * ST - (i > 4 ? ST * del : 0), top: b, dy: i === 4 ? 240 * easeIn(del) : 0, sc: show(2) * out * (i === 4 ? 1 - del : 1) })), x0 - 50, x0 + 8 * ST + 50 - ST * del, 'd3', { h: 54 });
      if (pulseAll > .05) { boilSeed('gap3'); ringK(x0 + 3.5 * ST, 830, 60, 90, seg(t, L(7, 8.2), L(7, 9.0)), Z.red, 'g3', 4); }
      ringK(x0 + 4 * ST, 250, 52, 90, seg(t, L(7, 2.9), L(7, 3.8)), Z.gold, 'r1', 4);
      ringK(x0 + 4 * ST, 540, 52, 90, seg(t, L(7, 4.4), L(7, 5.2)), Z.gold, 'r2', 4);
    } else {                                                              // L8: what each does to the protein
      const show = backOut(seg(t, L(8, -.7), L(8, -.2)));
      const SX2 = 42, xs = 1000 - 8.5 * SX2;
      const rowA = 'AUGGCUAAGUCCGAAUUU'.split(''), rowB = rowA.slice();
      const subK = seg(t, L(8, 1.2), L(8, 1.6)), synK = seg(t, L(8, 4.2), L(8, 4.6)), insK = ease(seg(t, L(8, 6.4), L(8, 7.0)));
      const A = rowA.slice(); if (subK > .5) A[7] = 'C'; if (synK > .5) A[14] = 'G';      // AAG → ACG (Lys → Thr); GAA → GAG (Glu → Glu)
      const B_ = rowB.slice(); if (insK > .02) B_.splice(7, 0, 'G');
      const drawRow = (seq, y, key, orig, beadK, flipOf) => {
        seq.forEach((b, i) => { const x = xs + i * SX2 + (key === 'B' && i > 7 ? SX2 * (1 - insK) * 0 : 0); if (x > xs + 17.5 * SX2) return;
          const fresh = key === 'B' && i === 7 && insK > .02, f = flipOf ? flipOf(i) : 1;
          piece(x, y - (fresh ? 200 * (1 - insK) : 0), Math.PI, b, 30, 46 * show * f, { key: key + i, rna: true, glow: fresh ? .8 * (1 - seg(t, L(8, 8), L(8, 9))) : 0 }); });
        const pts = []; for (let i = 0; i < 18; i++) pts.push([xs + i * SX2, y + 4]); backbone(pts, 13, '#E8A33D', 'rb' + key);
        for (let j = 0; j < 6; j++) {
          const cod = seq.slice(3 * j, 3 * j + 3).join(''), cod0 = orig.slice(3 * j, 3 * j + 3).join(''), x = xs + (3 * j + 1) * SX2;
          boilSeed('pl' + key + j); paint(rrPts(x - SX2 * 1.38, y + 40, SX2 * 2.76 * show, 14, 7), { wash: cod === cod0 ? Z.gold : '#C98A84', ink: PAL.ink, sw: .8 });
          const ch = beadK(j), col = mixCol(aaOf(cod0), aaOf(cod), ch);
          boilSeed('bd' + key + j); paint(ellPts(x, y + 116, 32 * show * (1 + .2 * near(ch, .5, .3)), 32 * show, 16), { wash: col, ink: PAL.ink, sw: 1 });
          if (j < 5) { boilSeed('lk' + key + j); inkLine([[x + 32, y + 116], [x + 3 * SX2 - 32, y + 116]], 2, PAL.ink, 'ink', 0); }
        }
      };
      const flipA = i => (i === 7 && subK > 0 && subK < 1) || (i === 14 && synK > 0 && synK < 1) ? Math.abs(Math.cos((i === 7 ? subK : synK) * Math.PI)) : 1;
      drawRow(A, 230, 'A', rowA, j => j === 2 ? seg(t, L(8, 2.0), L(8, 2.6)) : 0, flipA);
      ringK(xs + 7 * SX2, 230, 40, 70, seg(t, L(8, 1.4), L(8, 2.2)), Z.gold, 'sa', 4);
      ringK(xs + 13 * SX2, 346, 60, 60, seg(t, L(8, 2.4), L(8, 3.2)), Z.gold, 'sb', 4);
      ringK(xs + 13 * SX2 + 3 * SX2 * 0 + SX2 * 1, 346, 60, 60, seg(t, L(8, 5.0), L(8, 5.8)), PAL.cream, 'sc', 4);
      if (t > L(8, 5.0) && t < L(8, 6.0)) K.sparkle(xs + 13 * SX2 + 70, 300, 30, seg(t, L(8, 5.0), L(8, 6.0)), '#FFF3C4');
      drawRow(B_, 600, 'B', rowB, j => j >= 2 ? seg(t, L(8, 7.6) + (j - 2) * .3, L(8, 8.0) + (j - 2) * .3) : 0);
      // callback: the royal case, a short stub of protein with a stop
      const cb = backOut(seg(t, L(8, 11.3), L(8, 11.8)));
      if (cb > .02) { card(1680, 520, 300, 260, cb, 'cb'); for (let j = 0; j < 4; j++) { boilSeed('cbb' + j); paint(ellPts(1590 + j * 46, 520, 20 * cb, 20 * cb, 12), { wash: j < 2 ? Z.f9 : '#B0634A', ink: PAL.ink, sw: .9 }); }
        boilSeed('cbs'); paint(ellPts(1590 + 4 * 46, 520, 22 * cb, 22 * cb, 8, 0, Math.PI / 8), { wash: Z.red, ink: PAL.ink, sw: 1 }); ringK(1680, 520, 170, 150, seg(t, L(8, 12.6), L(8, 13.6)), Z.red, 'cbr', 5); }
    }
    camEnd();
    host(170, 1010, 30, t, [[L(7, -2.4), 'calm', { lookX: .8, lookY: -.6 }], [L(7, 3.0), 'wow', { lookX: .8, lookY: -.6 }], [L(7, 6.2), 'calm', { lookX: .8, lookY: -.2 }],
      [L(8, 2.4), 'idea', { lookX: .8, lookY: -.6 }], [L(8, 5.4), 'smug', { lookX: .8 }], [L(8, 8.6), 'worried', { lookX: .8, lookY: -.4 }], [L(8, 12.0), 'calm', { lookX: .9, lookY: -.5 }]], {}, 'pc1');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#9FD3BF', Z.board]);
    flash(near(t, L(8, -.7), .22), '#F7FBF8');
  }

  // ================================ C2: where it comes from (115.4–145.3) ================================
  const MSEQ = ['G', 'A', 'T', 'T', 'C', 'G', 'A', 'C', 'T', 'G', 'A'];
  const FCELL = (() => { const out = []; for (let r = -9; r <= 18; r++) for (let q = -16; q <= 32; q++) { const x = q * 110 + (r & 1) * 55, y = r * 96; out.push({ x, y, i: out.length }); } return out; })();
  const MARKS = [[640, 300, -.6], [1380, 680, 2.3], [980, 120, 1.1]];
  function shotC2(t, lt, dur) {
    if (t < L(10, 6.0)) {
      const c = t < L(10, 0) ? [960, 540, 1] : kf(t, [[L(10, 0), [960, 540, 1]], [L(10, 4.6), [960, 540, 1]], [L(10, 5.6), [960, 480, .45]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      BOARD(t);
      if (t < L(10, -.7)) {                                               // L9: the hits on one duplex
        const ST = 80, x0 = 1000 - 5 * ST, show = backOut(seg(t, L(9, -1.3), L(9, -.8)));
        const pol = seg(t, L(9, 2.2), L(9, 4.4)), wrong = 4, wrongK = seg(t, L(9, 4.0), L(9, 4.4));
        const uv = seg(t, L(9, 5.8), L(9, 6.4)), xr = seg(t, L(9, 6.9), L(9, 7.4)), chem = seg(t, L(9, 8.2), L(9, 9.2)), vir = seg(t, L(9, 10.0), L(9, 11.6));
        const rungs = MSEQ.map((b, i) => {
          const r = { x: x0 + i * ST, top: b, sc: show };
          if (i === wrong && wrongK > 0) { r.bot = 'C'; r.dy = 0; r.glow = .7 * (1 - seg(t, L(9, 6), L(9, 7))); r.kink = .12 * Math.sin(t * 20) * (1 - seg(t, L(9, 4.4), L(9, 5.4))); }
          if ((i === 6 || i === 7) && uv > .5) { r.kink = (i === 6 ? .16 : -.16) * ease(seg(uv, .5, 1)); r.glow = .5 * (1 - seg(t, L(9, 8), L(9, 9))); }
          if (i === 9 && chem > .6) { r.colT = mixCol(BC.G, '#B5C76A', ease(seg(chem, .6, 1))); r.glow = .5 * (1 - seg(t, L(9, 10.5), L(9, 11.5))); }
          return r;
        });
        // the X-ray nick: the top backbone splits in two around x0 + 8.5 ST
        const nick = xr > .6 ? 10 : 0;
        duplex(560, rungs, x0 - 60, x0 + 10 * ST + 60, 'm', { h: 60, bb: () => 0 });
        if (nick) { boilSeed('nick'); paint(rectPts(x0 + 8.5 * ST - 9, 560 - 75, 18, 22), { wash: Z.board, ink: null }); }
        // the copying enzyme slides along the bottom strand
        if (pol > 0 && pol < 1.01 && t < L(9, 5.6)) { const px = lerp(x0 - 60, x0 + wrong * ST, ease(pol)); boilSeed('pol'); paint(ellPts(px, 660, 74, 46, 20), { wash: '#4FB0B8', fill: '#2F7F8A', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.2 }); }
        K.cross(x0 + wrong * ST + 60, 420, 50, seg(t, L(9, 4.5), L(9, 5.0)) * (1 - seg(t, L(9, 6.6), L(9, 7.0))), 'wr');
        // UV: a violet zigzag from the top left
        if (uv > 0 && t < L(9, 7.4)) { boilSeed('uv'); const a = [x0 + 3 * ST, 120], b = [x0 + 6.5 * ST, 480], k = ease(clamp(uv * 1.4)); const P = []; for (let j = 0; j <= 8; j++) { const f = j / 8 * k; P.push([lerp(a[0], b[0], f) + (j % 2 ? 22 : -22), lerp(a[1], b[1], f)]); } inkLine(P, 6, '#8E6BC4', 'ink', 0); if (uv > .5) K.burst(x0 + 6.5 * ST, 500, 60, seg(uv, .5, 1), '#8E6BC4', 'uvb'); }
        if (xr > 0 && t < L(9, 8.4)) { boilSeed('xr'); const k = ease(clamp(xr * 1.5)); paint(ribbon([[x0 + 8.5 * ST, 80], [x0 + 8.5 * ST, lerp(80, 480, k)]], 18, 6), { wash: '#CFE7F3', washOp: 220, ink: '#7FA9C9', sw: .8 }); if (xr > .6) K.burst(x0 + 8.5 * ST, 480, 50, seg(xr, .6, 1), '#7FA9C9', 'xrb'); }
        if (chem > 0 && t < L(9, 10.6)) { const fx = x0 + 9 * ST + 140, k = clamp(chem * 1.6); boilSeed('fl'); paint([[fx - 40, 120], [fx + 40, 120], [fx + 24, 170], [fx + 64, 290], [fx - 64, 290], [fx - 24, 170]], { wash: '#E8F4EC', ink: PAL.ink, sw: 1.1 }); paint([[fx - 50, 250], [fx + 50, 250], [fx + 64, 290], [fx - 64, 290]], { wash: '#9BCB6A', ink: null });
          if (k < 1) { const p = arcPt([fx, 120], [x0 + 9 * ST, 470], 80, k); boilSeed('dp'); paint(ellPts(p[0], p[1], 14, 18, 10), { wash: '#9BCB6A', ink: PAL.ink, sw: .8 }); } }
        if (vir > 0) { const k = ease(seg(vir, 0, .5)), vx = lerp(1880, x0 + 10 * ST + 40, k), vy = lerp(200, 400, k); boilSeed('vir'); const P = []; for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + Math.PI / 6; P.push([vx + Math.cos(a) * 60, vy + Math.sin(a) * 60]); } paint(P, { wash: '#CFE9E4', ink: PAL.ink, sw: 1.1 }); inkLine([[vx - 40, vy + 52], [vx - 60, vy + 100]], 2, PAL.ink, 'ink', 0); inkLine([[vx + 10, vy + 60], [vx + 4, vy + 108]], 2, PAL.ink, 'ink', 0);
          if (vir > .5) { boilSeed('vdna'); inkLine([[vx - 10, vy], [lerp(vx - 10, x0 + 10 * ST, seg(vir, .5, 1)), lerp(vy, 500, seg(vir, .5, 1))]], 5, '#E8A33D', 'ink', .4); } }
      } else {                                                            // L10: everywhere, at random, undirected, rare
        const show = seg(t, L(10, -.7), L(10, -.2));
        const vis = (x, y) => Math.abs(x - c[0]) < W / 2 / c[2] + 80 && Math.abs(y - c[1]) < H / 2 / c[2] + 80;
        FCELL.forEach(f => { if (!vis(f.x, f.y)) return; boilSeed('fc' + f.i); paint(ellPts(f.x, f.y, 50 * show, 44 * show, 12, 1.5), { wash: hash(f.i + .5) > .5 ? '#F3F6EA' : '#E8F1E0', ink: PAL.ink, sw: 1.1 / Math.max(.6, c[2]) }); });
        MARKS.forEach(([x, y, a], i) => { const k = backOut(seg(t, L(10, 1.0) + i * .9, L(10, 1.4) + i * .9)); if (k <= .02) return;
          glow(x, y, 80, '#FF9A8A', .6); boilSeed('mk' + i); paint(ellPts(x, y, 24 * k / Math.min(1, c[2] * 1.4), 24 * k / Math.min(1, c[2] * 1.4), 12), { wash: Z.red, ink: PAL.ink, sw: 1 });
          const ak = seg(t, L(10, 3.0) + i * .25, L(10, 3.6) + i * .25); arrow(x, y, x + Math.cos(a) * 120, y + Math.sin(a) * 120, ak, Z.red, 'ma' + i, 10); });
      }
      camEnd();
    } else {                                                              // L10 b: in a body cell vs in a germ cell
      cam(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
      BOARD(t);
      const pk = i => seg(t, L(10, 6.0) + i * .2, L(10, 6.5) + i * .2);
      card(620, 520, 620, 820, pk(0), 'soma'); card(1340, 520, 620, 820, pk(1), 'germ');
      if (pk(0) > .7) {
        for (let i = 0; i < 7; i++) { const a = i / 6 * TAU, d = i ? 92 : 0, x = 620 + Math.cos(a) * d, y = 280 + Math.sin(a) * d * .9; roundCell(x, y, 50, 'sk' + i, { col: '#F8E3D2', dk: '#E8C3A8' });
          if (i === 0 || i === 1) { const k = backOut(seg(t, L(10, 7.0) + i * .5, L(10, 7.4) + i * .5)); if (k > .02) { boilSeed('skm' + i); paint(ellPts(x, y, 14 * k, 14 * k, 10), { wash: Z.red, ink: PAL.ink, sw: .9 }); } } }
        arrow(620, 440, 620, 650, seg(t, L(10, 8.2), L(10, 8.9)), '#C9C2B2', 'sa', 14);
        const bk = backOut(seg(t, L(10, 8.8), L(10, 9.3)));
        if (bk > .02) tinted({ pip: '#E6A07A', pipDk: '#B9754F', belly: '#F8DCC8' }, () => pip(620, 860, 26 * bk, { ...K.act(t, [[L(10, 8.8), 'happy']], 2), noShadow: true, key: 'bs' }));
        K.cross(720, 545, 70, seg(t, L(10, 9.4), L(10, 9.9)), 'sx');
      }
      if (pk(1) > .7) {
        sperm(1340, 280 + 6 * Math.sin(t * 2), 4.2, -Math.PI / 2, t, '#C9D4F2', 'gs');
        const mk = backOut(seg(t, L(10, 10.8), L(10, 11.2))); if (mk > .02) { boilSeed('gsm'); paint(ellPts(1340, 272, 14 * mk, 14 * mk, 10), { wash: Z.red, ink: PAL.ink, sw: .9 }); }
        arrow(1340, 440, 1340, 650, seg(t, L(10, 11.4), L(10, 12.1)), Z.red, 'ga', 14);
        const bk = backOut(seg(t, L(10, 12.0), L(10, 12.5)));
        if (bk > .02) { glow(1340, 790, 150, '#FF9A8A', .5 * bk); tinted({ pip: '#E6A07A', pipDk: '#B9754F', belly: '#F8DCC8' }, () => pip(1340, 860, 26 * bk, { ...K.act(t, [[L(10, 12.0), 'happy']], 4), noShadow: true, key: 'bg' }));
          boilSeed('bgm'); paint(ellPts(1340 + 26 * .3, 860 - 26 * 1.8, 9 * bk, 9 * bk, 10), { wash: Z.red, ink: PAL.ink, sw: .8 }); }
        K.check(1450, 545, 70, seg(t, L(10, 12.9), L(10, 13.4)), 'gk');
      }
      camEnd();
    }
    host(150, 1010, 30, t, [[L(9, -1.3), 'confused', { lookX: .8 }], [L(9, 2.4), 'calm', { lookX: .9, lookY: -.4 }], [L(9, 4.5), 'worried', { lookX: .9, lookY: -.4 }], [L(9, 6.4), 'dizzy'],
      [L(9, 8.0), 'worried', { lookX: .9, lookY: -.6 }], [L(10, 1.0), 'calm', { lookX: .8, lookY: -.6 }], [L(10, 5.6), 'wow'], [L(10, 7.6), 'calm', { lookX: .9, lookY: -.6 }], [L(10, 12.6), 'idea']], {}, 'pc2');
    flash(near(t, L(9, -1.3), .22) + near(t, L(10, -.7), .22) + near(t, L(10, 6.0), .25), '#F7FBF8');
  }

  // ================================ C3: Victoria's father; three sources of variation (145.3–175.5) ================================
  function shotC3(t, lt, dur) {
    cam(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
    BOARD(t);
    if (t < L(12, -.8)) {                                                 // L11
      const F = [430, 960], u = 44;
      const o = K.act(t, [[L(11, -1.0), 'calm', { lookX: .6, lookY: -.6 }], [L(11, 3.6), 'wow', { lookY: -.8 }], [L(11, 6.8), 'happy', { lookX: .8 }], [L(11, 7.6), 'strain'], [L(11, 9.6), 'calm', { lookX: .8, lookY: -.6 }]], 6);
      const hand = K.hand(F[0], F[1], u, [2.4, -1.1], { dy: o.dy });
      royal(F[0], F[1], u, EDW, { ...o, armF: { at: [2.4, -1.1] }, rot: .05 * seg(t, L(11, 7.4), L(11, 8.2)) }, 'edw');
      boilSeed('cane'); inkLine([[hand[0], hand[1] - 6], [hand[0] + 14, F[1] - 2]], 6, '#7A5232', 'ink', 0); paint(ellPts(hand[0] - 2, hand[1] - 10, 14, 10, 10), { wash: Z.gold, ink: PAL.ink, sw: .8 });
      // whiskers
      boilSeed('wh'); for (const s_ of [-1, 1]) inkLine([[F[0] + .5 * u, F[1] - 2.65 * u + (o.dy || 0) * u], [F[0] + .5 * u + s_ * .55 * u, F[1] - 2.5 * u + (o.dy || 0) * u]], 4, '#DDE0E8', 'ink', .5);
      const ck = seg(t, L(11, 1.6), L(11, 2.2));
      cloud(640, 330, 230, 190, ck * (1 - seg(t, L(11, 9.2), L(11, 9.8))), [F[0] + 40, F[1] - 6 * u], 'fc');
      if (ck > .7 && t < L(11, 9.4)) {
        const leave = seg(t, L(11, 5.4), L(11, 6.6));
        roundCell(640, 330, 110, 'sg', { col: '#EEF1FA', dk: '#C7CFE8' });
        const sp = backOut(seg(t, L(11, 3.4), L(11, 3.8))); if (sp > .02) { glow(640, 330, 80, '#FF9A8A', .6); boilSeed('sgm'); paint(ellPts(640, 330, 18 * sp, 18 * sp, 10), { wash: Z.red, ink: PAL.ink, sw: .9 }); }
        if (t > L(11, 3.4) && t < L(11, 4.2)) K.burst(640, 330, 70, seg(t, L(11, 3.4), L(11, 4.2)), Z.red, 'sgb');
        if (leave > 0) { const p = arcPt([700, 330], [1160, 840], -120, ease(leave)); if (leave < 1) sperm(p[0], p[1], 3.4, Math.atan2(840 - 330, 1160 - 700), t, '#C9D4F2', 'fs'); }
      }
      // the cradle and baby Victoria, the red dot on her belly
      boilSeed('crd'); paint([[1040, 900], [1300, 900], [1270, 980], [1070, 980]], { wash: '#C99A6A', ink: PAL.ink, sw: 1.1 }); inkLine([[1060, 985], [1100, 1010]], 3, '#8E6A44', 'ink', .5); inkLine([[1280, 985], [1240, 1010]], 3, '#8E6A44', 'ink', .5);
      const bv = backOut(seg(t, L(11, 6.5), L(11, 7.0)));
      if (bv > .02) { royal(1170, 905, 22 * bv, VIC, { ...K.act(t, [[L(11, 6.5), 'happy'], [L(11, 8.6), 'sleepy']], 9), noShadow: true }, 'bvic', { crownS: .9 });
        boilSeed('bvd'); paint(ellPts(1170 + 22 * .3, 905 - 22 * 1.8, 8 * bv, 8 * bv, 10), { wash: Z.red, ink: PAL.ink, sw: .8 }); }
      paint([[1030, 900], [1310, 900], [1300, 930], [1040, 930]], { wash: '#B5865A', ink: PAL.ink, sw: 1 });
      // older father, more new mutations: three handfuls of sperm, more red dots each time
      const ag = seg(t, L(11, 9.8), L(11, 10.6));
      if (ag > 0) { arrow(880, 470, 1760, 470, ag, '#B9C4BE', 'age', 12);
        [0, 1, 3].forEach((nr, gI) => { const gx = 980 + gI * 300, k = backOut(seg(t, L(11, 10.2) + gI * .6, L(11, 10.6) + gI * .6)); if (k <= .02) return;
          for (let j = 0; j < 5; j++) { const x = gx + 60 + (j % 2) * 30, y = 150 + j * 58; sperm(x, y, 2.0 * k, 0, t, '#C9D4F2', 'ag' + gI + j);
            if (j < nr) { boilSeed('agm' + gI + j); paint(ellPts(x, y, 8 * k, 8 * k, 8), { wash: Z.red, ink: PAL.ink, sw: .7 }); } } }); }
    } else {                                                              // L12: three sources of heritable variation
      const pk = i => seg(t, L(12, [-.8, 5.8, 10.0][i]), L(12, [-.3, 6.3, 10.5][i]));
      [480, 960, 1440].forEach((x, i) => card(x, 500, 420, 700, pk(i), 'v' + i));
      const P = { L: 300, c: .4 }, PAT = '#5B8FD6', MAT = '#E2708C';
      if (pk(0) > .7) {
        const nw = seg(t, L(12, 1.4), L(12, 1.9));
        chromo(420, 500, Math.PI / 2, P, { rep: 0, w: 30, segsA: banded(PAT, .62, .72, Z.f9) }, 'n1');
        chromo(540, 500, Math.PI / 2, P, { rep: 0, w: 30, segsA: banded(MAT, .62, .72, nw > .5 ? '#3E9A8E' : Z.f9), hi: near(t, L(12, 1.7), .3) }, 'n2');
        if (nw > 0 && nw < 1) K.burst(540, 500 + .27 * 300, 60, nw, '#3E9A8E', 'nwb');
        for (let j = 0; j < 4; j++) { const a = seg(t, L(12, 3.4) + j * .3, L(12, 4.4) + j * .3); if (a > 0 && a < 1) K.sparkle(480 + (j - 1.5) * 90, 240 - 30 * a, 24, a, '#BDE8DA'); }
      }
      if (pk(1) > .7) {                                                   // crossing over: the tips swap (a callback to meiosis)
        const sw = seg(t, L(12, 7.4), L(12, 8.4)), lean = Math.sin(sw * Math.PI) * 30, done = sw > .5;
        chromo(900 + lean, 500, Math.PI / 2, P, { rep: 0, w: 30, segsA: done ? [[0, .3, MAT], [.3, 1, PAT]] : solid(PAT) }, 'r1');
        chromo(1020 - lean, 500, Math.PI / 2, P, { rep: 0, w: 30, segsA: done ? [[0, .3, PAT], [.3, 1, MAT]] : solid(MAT) }, 'r2');
        if (sw > .4 && sw < 1) K.burst(960, 500 - .1 * 300, 60, seg(sw, .4, 1), Z.gold, 'rb');
      }
      if (pk(2) > .7) {                                                   // a segment lost, then a whole extra chromosome
        const dl = ease(seg(t, L(12, 11.8), L(12, 12.6))), ex = ease(seg(t, L(12, 13.2), L(12, 14.0))), OL = '#7DB86A';
        const segsD = dl < .02 ? solid(OL) : [[0, .45, OL, 0, 0], [.6, 1, OL, 0, -.15 * 300 * dl]];
        chromo(1380, 500, Math.PI / 2, P, { rep: 0, w: 30, segsA: segsD }, 'd1');
        if (dl > 0 && dl < 1) { boilSeed('lost'); const y = 500 + .12 * 300 + 300 * easeIn(dl); paint(rrPts(1460, y - 20, 30, 45, 12), { wash: OL, washOp: 255 * (1 - dl), ink: PAL.ink, sw: .8 }); }
        chromo(1480, 500, Math.PI / 2, P, { rep: 0, w: 30, segsA: solid(OL) }, 'd2');
        if (ex > .02) chromo(lerp(1800, 1560, ex), 500, Math.PI / 2, P, { rep: 0, w: 30, segsA: solid(OL), hi: near(t, L(12, 14.3), .3) }, 'd3');
      }
    }
    host(150, 1010, 30, t, [[L(11, -1.0), 'calm', { lookX: .8 }], [L(11, 3.6), 'wow', { lookX: .8, lookY: -.6 }], [L(11, 7.4), 'calm', { lookX: .8 }], [L(11, 11.0), 'worried', { lookX: .8, lookY: -.6 }],
      [L(12, 1.8), 'wow', { lookX: .8, lookY: -.6 }], [L(12, 7.8), 'happy', { lookX: .8, lookY: -.4 }], [L(12, 12.4), 'worried', { lookX: .8, lookY: -.4 }], [L(12, 14.4), 'calm', { lookX: .8 }]], {}, 'pc3');
    camEnd();
    flash(near(t, L(11, -1.0), .22) + near(t, L(12, -.8), .22), '#F7FBF8');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E4D4AE', Z.recap]);
  }

  // ---------- X and Y ----------
  const XP = { L: 300, c: .4 }, YP = { L: 130, c: .3 }, XB = [.77, .9];        // the F9 locus sits near the end of the long arm (Xq27)
  function xChrom(x, y, s, band, key, o = {}) {                     // band: 'ok' (gold), 'bad' (red), or a mix 0..1 toward red
    const col = typeof band === 'number' ? mixCol(Z.f9, Z.red, band) : band === 'bad' ? Z.red : Z.f9;
    chromo(x, y, Math.PI / 2, { L: XP.L * s, c: XP.c }, { rep: o.rep ?? 1, w: 34 * s, bow: 20 * s, segsA: banded(Z.X, XB[0], XB[1], col), hi: o.hi || 0 }, key);
    if (o.glow) glow(x, y + (XB[0] + .04 - XP.c) * XP.L * s, 60 * s, band === 'bad' ? '#FF8A7A' : '#FFD36A', o.glow);
  }
  function yChrom(x, y, s, key, o = {}) { chromo(x, y, Math.PI / 2, { L: YP.L * s, c: YP.c }, { rep: o.rep ?? 1, w: 30 * s, bow: 10 * s, segsA: solid(Z.Y), hi: o.hi || 0 }, key); }
  const bandY = (y, s) => y + ((XB[0] + XB[1]) / 2 - XP.c) * XP.L * s;
  function sexMark(m, x, y, s, k, key) {                            // the pedigree marks again: □ male, ○ female
    if (k <= .02) return; boilSeed('sx' + key); const q = backOut(k);
    paint(m ? rrPts(x - s * q, y - s * q, 2 * s * q, 2 * s * q, 5) : ellPts(x, y, s * q, s * q, 20), { wash: Z.node, ink: PAL.ink, sw: 1.6 });
  }
  function f9bead(x, y, r, key) { boilSeed('fb' + key); paint(ellPts(x, y, r, r, 14), { wash: Z.f9, ink: PAL.ink, sw: .9 }); paint(ellPts(x - r * .3, y - r * .3, r * .28, r * .2, 8), { wash: PAL.cream, washOp: 180, ink: null }); }
  function dashRing(x, y, rx, ry, k, col, key, w = 3) { if (k <= .02) return; boilSeed('dr' + key); const P = ellPts(x, y, rx, ry, 28); for (let i = 0; i < 28; i += 2) { if (i / 28 > k) break; inkLine([P[i], P[(i + 1) % 28]], w, col, 'ink', 0); } }
  const LILAC = (t, key) => { K.wash(Z.lilac, t, { key, blob: Z.lilacBlob, rect: rectPts(-1600, -1200, W + 3200, H + 2400) }); K.motes(t, 14, mixCol(Z.lilac, '#9A8CC8', .35), { key }); };

  // ================================ D: recap (175.5–189.6) ================================
  function shotD(t, lt, dur) {
    cam(960 + 5 * wob(t, .05), 520 + 4 * wob(t, .04), 1);
    K.wash(Z.recap, t, { key: 'd', blob: Z.recapBlob, rect: rectPts(-600, -600, W + 1200, H + 1200) });
    const pop = i => backOut(seg(t, L(13, -.6) + i * .5, L(13, -.2) + i * .5));
    const g1 = near(t, L(13, 2.2), .5), g2 = near(t, L(13, 4.6), .5), g3 = near(t, L(13, 9.8), .6);
    // a rung swapped
    let q = pop(0); if (q > .02) { const sw = seg(t, L(13, 1.6), L(13, 2.3)), sc = sw > 0 && sw < 1 ? Math.abs(Math.cos(sw * Math.PI)) : 1;
      piece(380, 330, 0, sw > .5 ? 'G' : 'A', 64 * q, 130 * q * sc, { key: 'dt', letter: 1, glow: g1 * .8 }); piece(380, 650, Math.PI, sw > .5 ? 'C' : 'T', 64 * q, 130 * q * sc, { key: 'db', letter: 1, glow: g1 * .8 });
      backbone([[300, 326], [460, 326]], 18, '#5B7FC7', 'dT'); backbone([[300, 654], [460, 654]], 18, '#5B7FC7', 'dB'); }
    arrow(520, 490, 680, 490, seg(t, L(13, 2.6), L(13, 3.1)), mixCol('#C9B98F', Z.gold, g2), 'da1', 14 + 4 * g2);
    // a new allele: the X with the red band
    q = pop(1); if (q > .02 && t > L(13, 2.8)) xChrom(900, 470, 1.15 * backOut(seg(t, L(13, 2.8), L(13, 3.3))), seg(t, L(13, 3.6), L(13, 4.3)), 'dx', { glow: g2 * .8 });
    arrow(1100, 490, 1260, 490, seg(t, L(13, 7.2), L(13, 7.7)), mixCol('#C9B98F', Z.gold, g3), 'da2', 14 + 4 * g3);
    // and the queen herself is fine
    const vk = backOut(seg(t, L(13, 7.6), L(13, 8.1)));
    if (vk > .02) royal(1480, 800, 46 * vk, VIC, { ...K.act(t, [[L(13, 7.6), 'happy'], [L(13, 10.2), 'smug']], 3), noShadow: true }, 'dvic');
    K.check(1660, 420, 90, seg(t, L(13, 9.9), L(13, 10.5)), 'dck');
    camEnd();
    host(170, 1010, 30, t, [[L(13, -.6), 'calm', { lookX: .8, lookY: -.6 }], [L(13, 7.8), 'calm', { lookX: .9, lookY: -.3 }], [L(13, 9.6), 'confused', { lookX: .9, lookY: -.3 }]], {}, 'pd');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E4D4AE', Z.recap]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B7AEDB', Z.lilac]);
  }

  // ================================ E1: X and Y; the carrier; no backup (189.6–230.1) ================================
  function shotE1(t, lt, dur) {
    cam(960 + 6 * wob(t, .05), 520 + 4 * wob(t, .04), 1);
    LILAC(t, 'e1');
    if (t < L(15, -.8)) {                                               // L14
      const one = backOut(seg(t, L(14, -.6), L(14, 0))), slide = ease(seg(t, L(14, 4.3), L(14, 5.0)));
      const x1 = lerp(960, 520, slide);
      xChrom(x1, 470, 1.3 * one, 'ok', 'x1', { glow: near(t, L(14, 1.4), .5) * .9 });
      ringK(x1, bandY(470, 1.3), 90, 50, seg(t, L(14, 1.2), L(14, 2.2)), Z.gold, 'xb', 5);
      ringK(x1, 470, 150, 260, seg(t, L(14, 2.8), L(14, 3.8)), Z.X, 'xr', 5);
      const x2 = backOut(seg(t, L(14, 4.7), L(14, 5.2))); if (x2 > .02) xChrom(700, 470, 1.3 * x2, 'ok', 'x2');
      sexMark(0, 610, 120, 34, seg(t, L(14, 5.0), L(14, 5.4)), 'f');
      const m1 = backOut(seg(t, L(14, 6.4), L(14, 6.9))), my = backOut(seg(t, L(14, 8.4), L(14, 8.9)));
      if (m1 > .02) xChrom(1240, 470, 1.3 * m1, 'ok', 'x3');
      if (my > .02) yChrom(1440, 400, 1.3 * my, 'y1');
      sexMark(1, 1340, 120, 34, seg(t, L(14, 6.6), L(14, 7.0)), 'm');
      // on the Y: where the gene would be, nothing
      dashRing(1440, bandY(470, 1.3), 80, 46, seg(t, L(14, 9.8), L(14, 10.6)), Z.goldDk, 'ye', 3);
      K.cross(1440, bandY(470, 1.3), 56, seg(t, L(14, 10.6), L(14, 11.1)), 'yx');
    } else if (t < L(16, -.6)) {                                        // L15: Victoria, a carrier
      const vk = backOut(seg(t, L(15, -.8), L(15, -.3)));
      royal(500, 960, 40 * vk, VIC, { ...K.act(t, [[L(15, -.8), 'calm', { lookX: .7, lookY: -.6 }], [L(15, 7.0), 'happy'], [L(15, 8.6), 'smug']], 3) }, 'evic');
      const x = backOut(seg(t, L(15, .6), L(15, 1.2)));
      xChrom(820, 440, 1.3 * x, 'ok', 'va', { glow: near(t, L(15, 2.4), .4) * .9 });
      xChrom(1080, 440, 1.3 * x, 'bad', 'vb', { glow: near(t, L(15, 4.4), .4) * .9 });
      for (let j = 0; j < 5; j++) { const k = seg(t, L(15, 5.4) + j * .25, L(15, 6.4) + j * .25); if (k <= 0) continue; const p = arcPt([820, bandY(440, 1.3)], [640 + j * 50, 760 - (j % 2) * 30], 80, ease(k)); f9bead(p[0], p[1], 20, 'vb' + j); }
      K.check(720, 640, 80, seg(t, L(15, 7.0), L(15, 7.5)), 'vck');
      const dk = backOut(seg(t, L(15, 8.2), L(15, 8.6))); if (dk > .02) { boilSeed('vdot'); paint(ellPts(500 + 40 * .35, 960 - 40 * 1.8, 11 * dk, 11 * dk, 10), { wash: Z.red, ink: PAL.ink, sw: .9 }); ringK(500 + 14, 960 - 72, 30, 30, seg(t, L(15, 8.4), L(15, 9.3)), Z.red, 'vdr', 4); }
    } else {                                                            // L16: a boy has no backup
      const bk = backOut(seg(t, L(16, -.6), L(16, -.1)));
      const o = K.act(t, [[L(16, -.6), 'calm', { lookX: -.7, lookY: -.6 }], [L(16, 5.6), 'worried'], [L(16, 6.8), 'cry']], 5);
      royal(1520, 960, 36 * bk, LEO, { ...o, flip: true }, 'eboy', { bruise: seg(t, L(16, 6.4), L(16, 7.4)) });
      const x = backOut(seg(t, L(16, -.2), L(16, .3))), sh = seg(t, L(16, 8.4), L(16, 9.4));
      const s_ = lerp(1.3, .75, ease(sh)), X1 = lerp(860, 1230, ease(sh)), Y1 = lerp(1080, 1360, ease(sh)), yy = lerp(440, 380, ease(sh));
      xChrom(X1, yy, s_ * x, 'bad', 'ba', { glow: near(t, L(16, 4.8), .4) * .9 });
      yChrom(Y1, yy - 70 * s_, s_ * x, 'bb');
      dashRing(lerp(640, 0, sh), 440, 80, 200, seg(t, L(16, 1.2), L(16, 2.0)) * (1 - sh), Z.X, 'ghost', 3);
      K.cross(lerp(640, 0, sh), 440, 70, seg(t, L(16, 2.0), L(16, 2.4)) * (1 - sh), 'gx');
      K.cross(980, 720, 80, seg(t, L(16, 6.2), L(16, 6.7)) * (1 - sh), 'nb');
      // 伴性遗传: Victoria returns; both pairs, each tied to its sex
      if (sh > 0) {
        const vk = ease(sh);
        royal(lerp(-200, 500, vk), 960, 36, VIC, { ...K.act(t, [[L(16, 8.4), 'calm', { lookX: .7, lookY: -.6 }]], 3) }, 'evic2');
        xChrom(lerp(-200, 560, vk), 380, .75, 'ok', 'v2a'); xChrom(lerp(-200, 690, vk), 380, .75, 'bad', 'v2b');
        sexMark(0, 625, 130, 30, seg(t, L(16, 10.4), L(16, 10.9)), 'f2'); sexMark(1, 1295, 130, 30, seg(t, L(16, 10.7), L(16, 11.2)), 'm2');
        ringK(625, 400, 200, 250, seg(t, L(16, 11.4), L(16, 12.4)), Z.X, 'lnk1', 5); ringK(1295, 400, 200, 250, seg(t, L(16, 11.6), L(16, 12.6)), Z.X, 'lnk2', 5);
      }
    }
    camEnd();
    host(150, 1010, 30, t, [[L(14, -1.8), 'calm', { lookX: .8, lookY: -.6 }], [L(14, 1.6), 'wow', { lookX: .8, lookY: -.6 }], [L(14, 5.0), 'calm', { lookX: .8, lookY: -.6 }], [L(14, 10.6), 'idea'],
      [L(15, 4.6), 'worried', { lookX: .8, lookY: -.6 }], [L(15, 7.2), 'happy'], [L(16, 2.2), 'wow', { lookX: .8, lookY: -.4 }], [L(16, 6.8), 'sad', { lookX: .9 }], [L(16, 9.6), 'idea', { lookX: .8, lookY: -.6 }]], {}, 'pe1');
    flash(near(t, L(15, -.8), .22) + near(t, L(16, -.6), .22), '#F8F6FC');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B7AEDB', Z.lilac]);
  }

  // ================================ E2: the cross, the real children; the pedigree (230.1–261.7) ================================
  const KIDS9 = [[0, 0], [1, 0], [0, 'car'], [1, 0], [0, 0], [0, 0], [1, 0], [1, 'aff'], [0, 'car']];
  function kidCols(m, i) { return m ? (i % 2 ? ALB : LEO) : (i % 2 ? GIRL : { pip: '#D99AC0', pipDk: '#AE6E96', belly: '#F6E0EE' }); }
  function shotE2(t, lt, dur) {
    cam(960 + 6 * wob(t, .05), 520 + 4 * wob(t, .04), 1);
    LILAC(t, 'e2');
    if (t < L(18, -.7)) {                                               // L17
      const g = 1 - ease(seg(t, L(17, 7.8), L(17, 8.4)));
      if (g > .02) {
        const G0 = [1010, 560], CS = 270, pk = backOut(seg(t, L(17, -.7), L(17, -.2))) * g;
        for (let r = 0; r < 2; r++) for (let c_ = 0; c_ < 2; c_++) { boilSeed('pc' + r + c_); paint(rrPts(G0[0] + (c_ - 1) * CS * pk, G0[1] + (r - 1) * CS * pk, CS * pk, CS * pk, 14), { wash: '#F7F5FC', ink: PAL.ink, sw: 1.3 }); }
        // headers: Victoria's two X across the top, Albert's X and Y down the side
        xChrom(G0[0] - CS / 2, G0[1] - CS - 120, .62 * pk, 'ok', 'hv1'); xChrom(G0[0] + CS / 2, G0[1] - CS - 120, .62 * pk, 'bad', 'hv2');
        xChrom(G0[0] - CS - 100, G0[1] - CS / 2, .62 * pk, 'ok', 'ha1'); yChrom(G0[0] - CS - 100, G0[1] + CS / 2 - 30, .62 * pk, 'ha2');
        royal(G0[0] - CS - 300, G0[1] - CS - 60, 30 * pk, VIC, { ...K.act(t, [[0, 'calm', { lookX: .8 }]], 3), noShadow: true }, 'pvic');
        royal(G0[0] - CS - 300, G0[1] + 200, 30 * pk, ALB, { ...K.act(t, [[0, 'calm', { lookX: .8 }]], 4), noShadow: true }, 'palb');
        const cell = (r, c_, m, st, tt, key) => { const k = backOut(seg(t, tt, tt + .45)) * g; if (k <= .02) return; const x = G0[0] + (c_ - .5) * CS, y = G0[1] + (r - .5) * CS + 105;
          royal(x, y, 30 * k, m ? (st ? LEO : ALB) : GIRL, { ...K.act(t, [[tt, st === 'aff' ? 'worried' : 'happy']], r * 2 + c_), noShadow: true }, key, { bruise: st === 'aff' ? seg(t, L(17, 3.0), L(17, 3.8)) : 0, crownS: .9 });
          if (st === 'car') { boilSeed('cd' + key); paint(ellPts(x + 30 * .35, y - 30 * 1.8, 10 * k, 10 * k, 10), { wash: Z.red, ink: PAL.ink, sw: .8 }); } };
        cell(1, 0, 1, 0, L(17, .8), 'k10'); cell(1, 1, 1, 'aff', L(17, 1.4), 'k11'); cell(0, 0, 0, 0, L(17, 5.0), 'k00'); cell(0, 1, 0, 'car', L(17, 5.5), 'k01');
        ringK(G0[0], G0[1] + CS / 2, CS * 1.1, CS * .6, seg(t, L(17, 3.8), L(17, 4.8)) * g, Z.gold, 'sons', 5);
        ringK(G0[0], G0[1] - CS / 2, CS * 1.1, CS * .6, seg(t, L(17, 6.4), L(17, 7.4)) * g, Z.gold, 'dtrs', 5);
      }
      // the real nine: four sons, Leopold bruised; five daughters, two carriers
      KIDS9.forEach(([m, st], i) => { const k = backOut(seg(t, L(17, 8.2) + i * .12, L(17, 8.6) + i * .12)); if (k <= .02) return;
        const x = 280 + i * 190, y = 780, u = 34 * k, hi = m ? near(t, L(17, 9.7), .4) : near(t, L(17, 12.3), .4);
        royal(x, y - 30 * hi, u, kidCols(m, i), { ...K.act(t, [[L(17, 8.2), st === 'aff' ? 'worried' : 'happy'], [L(17, 10.6), st === 'aff' ? 'sad' : 'calm', { lookX: i < 4 ? .5 : -.5 }]], i) }, 'nine' + i, { bruise: st === 'aff' ? 1 : 0 });
        if (st === 'car') { boilSeed('nd' + i); paint(ellPts(x + u * .35, y - 30 * hi - u * 1.8, 10, 10, 10), { wash: Z.red, ink: PAL.ink, sw: .8 }); ringK(x + u * .35, y - u * 1.8, 30, 30, seg(t, L(17, 13.0), L(17, 13.8)), Z.red, 'ndr' + i, 4); }
        if (st === 'aff') ringK(x, y - 2.5 * u, 3 * u, 3.4 * u, seg(t, L(17, 10.4), L(17, 11.4)), Z.red, 'leoR', 5);
        sexMark(m, x, y + 50, 16, k, 'ns' + i); });
    } else {                                                            // L18: Leopold's line
      const pk = i => backOut(seg(t, L(18, -.7) + i * .15, L(18, -.3) + i * .15));
      const LEOP = [760, 400], WIFE = [980, 400], SON = [560, 720], DAU = [1200, 720], RUP = [930, 995];
      boilSeed('pedl'); const lk = pk(0);
      if (lk > .5) { const mx = (LEOP[0] + WIFE[0]) / 2; inkLine([[LEOP[0] + 60, 330], [WIFE[0] - 60, 330]], 2.4, Z.goldDk, 'ink', 0); inkLine([[mx, 330], [mx, 450]], 2.4, Z.goldDk, 'ink', 0); inkLine([[SON[0], 450], [DAU[0], 450]], 2.4, Z.goldDk, 'ink', 0);
        inkLine([[SON[0], 450], [SON[0], 520]], 2.4, Z.goldDk, 'ink', 0); inkLine([[DAU[0], 450], [DAU[0], 520]], 2.4, Z.goldDk, 'ink', 0); inkLine([[DAU[0], 735], [DAU[0], 775], [RUP[0], 775], [RUP[0], 810]], 2.4, Z.goldDk, 'ink', 0); }
      royal(LEOP[0], LEOP[1], 30 * pk(0), LEO, { ...K.act(t, [[0, 'calm', { lookX: .5, lookY: .5 }]], 2) }, 'pleo', { bruise: 1 });
      royal(WIFE[0], WIFE[1], 30 * pk(1), GIRL, { ...K.act(t, [[0, 'calm', { lookX: -.5, lookY: .5 }]], 3), flip: true }, 'pwife');
      royal(SON[0], SON[1], 28 * pk(2), ALB, { ...K.act(t, [[0, 'calm'], [L(18, 5.0), 'happy']], 4) }, 'pson');
      royal(DAU[0], DAU[1], 28 * pk(3), GIRL, { ...K.act(t, [[0, 'calm'], [L(18, 7.6), 'wow']], 5), flip: true }, 'pdau');
      const rk = backOut(seg(t, L(18, 9.4), L(18, 9.9)));
      if (rk > .02) royal(RUP[0], RUP[1], 26 * rk, LEO, { ...K.act(t, [[L(18, 9.4), 'calm'], [L(18, 11.6), 'cry']], 6) }, 'prup', { bruise: seg(t, L(18, 11.4), L(18, 12.2)) });
      const ddot = backOut(seg(t, L(18, 7.4), L(18, 7.8))); if (ddot > .02) { boilSeed('pdd'); paint(ellPts(DAU[0] - 28 * .35, DAU[1] - 28 * 1.8, 10 * ddot, 10 * ddot, 10), { wash: Z.red, ink: PAL.ink, sw: .8 }); }
      // the tokens: Leopold's X goes to the daughter, his Y to the son; then her X to Rupert
      const xk = ease(seg(t, L(18, .4), L(18, 1.4))), yk = ease(seg(t, L(18, 2.0), L(18, 2.9))), x2 = ease(seg(t, L(18, 9.6), L(18, 10.6)));
      if (xk > 0 && x2 < 1) { const p = x2 > 0 ? arcPt([DAU[0] + 80, DAU[1] - 120], [RUP[0] + 80, RUP[1] - 110], 120, x2) : arcPt([LEOP[0] + 80, LEOP[1] - 120], [DAU[0] + 80, DAU[1] - 120], 140, xk); xChrom(p[0], p[1], .42, 'bad', 'tokX', { glow: .6 }); }
      if (x2 >= 1) xChrom(RUP[0] + 80, RUP[1] - 110, .42, 'bad', 'tokX2');
      if (yk > 0) { const p = arcPt([LEOP[0] - 80, LEOP[1] - 120], [SON[0] - 80, SON[1] - 120], 140, yk); yChrom(p[0], p[1], .45, 'tokY'); }
      // X never to a son
      const nx = seg(t, L(18, 2.9), L(18, 3.6));
      if (nx > .02) { boilSeed('nx'); for (let k = 0; k < 8; k++) { const a = k / 8, b = (k + .5) / 8; if (a > nx) break; inkLine([[lerp(LEOP[0] - 40, SON[0] + 40, a), lerp(LEOP[1] - 40, SON[1] - 60, a)], [lerp(LEOP[0] - 40, SON[0] + 40, b), lerp(LEOP[1] - 40, SON[1] - 60, b)]], 3, Z.red, 'ink', 0); } K.cross((LEOP[0] + SON[0]) / 2 - 40, 520, 50, seg(t, L(18, 3.4), L(18, 3.9)), 'nxx'); }
      K.check(SON[0] - 120, SON[1] - 160, 60, seg(t, L(18, 5.0), L(18, 5.5)), 'sck');
      // 交叉遗传: the zigzag male → female → male lights up
      const zz = seg(t, L(18, 13.2), L(18, 14.6));
      if (zz > .02) { const P = [[LEOP[0], LEOP[1] - 80], [DAU[0], DAU[1] - 80], [RUP[0], RUP[1] - 80]]; boilSeed('zz'); const a = zz < .5 ? [P[0], [lerp(P[0][0], P[1][0], zz * 2), lerp(P[0][1], P[1][1], zz * 2)]] : [P[0], P[1], [lerp(P[1][0], P[2][0], zz * 2 - 1), lerp(P[1][1], P[2][1], zz * 2 - 1)]]; inkLine(a, 5, Z.red, 'ink', .3); }
    }
    camEnd();
    host(150, 1010, 30, t, [[L(17, -.7), 'calm', { lookX: .8, lookY: -.6 }], [L(17, 3.4), 'worried', { lookX: .8, lookY: -.4 }], [L(17, 6.0), 'calm', { lookX: .8, lookY: -.6 }], [L(17, 11.0), 'wow', { lookX: .8 }],
      [L(18, 3.2), 'idea', { lookX: .8, lookY: -.6 }], [L(18, 7.8), 'calm', { lookX: .8, lookY: -.6 }], [L(18, 11.8), 'sad'], [L(18, 14.0), 'wow', { lookX: .8, lookY: -.6 }]], {}, 'pe2');
    flash(near(t, L(17, -.7), .22) + near(t, L(18, -.7), .22), '#F8F6FC');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#C8B4DE', '#EDE3F4']);
  }

  // ================================ F: why boys (261.7–304) ================================
  const LIL2 = '#EDE3F4';
  function shotF(t, lt, dur) {
    cam(960 + 6 * wob(t, .05), 520 + 4 * wob(t, .04), 1);
    if (t < L(21, -1.0)) K.wash(LIL2, t, { key: 'f', blob: '#F7F2FA', rect: rectPts(-600, -600, W + 1200, H + 1200) });
    else K.wash(Z.recap, t, { key: 'f3', blob: Z.recapBlob, rect: rectPts(-600, -600, W + 1200, H + 1200) });
    if (t < L(20, -.7)) {                                               // L19: a girl needs two
      const out = 1 - ease(seg(t, L(19, 8.8), L(19, 9.4)));
      const gk = backOut(seg(t, L(19, -.2), L(19, .3))) * out;
      if (gk > .15) {
        royal(960, 940, 34 * gk, GIRL, { ...K.act(t, [[L(19, -.2), 'calm', { lookY: -.8 }], [L(19, 7.6), 'worried']], 2) }, 'fg', { bruise: seg(t, L(19, 7.4), L(19, 8.2)) });
        dashRing(880, 450, 60, 170, seg(t, L(19, 2.6), L(19, 3.2)) * out, Z.X, 'g1', 3); dashRing(1040, 450, 60, 170, seg(t, L(19, 2.8), L(19, 3.4)) * out, Z.X, 'g2', 3);
        royal(440, 940, 32 * gk, LEO, { ...K.act(t, [[0, 'calm', { lookX: .6 }]], 4) }, 'ff', { bruise: 1 });
        royal(1480, 940, 32 * gk, GIRL, { ...K.act(t, [[0, 'calm', { lookX: -.6 }]], 6), flip: true }, 'fm');
        boilSeed('fmd'); paint(ellPts(1480 - 32 * .35, 940 - 32 * 1.8, 10 * gk, 10 * gk, 10), { wash: Z.red, ink: PAL.ink, sw: .8 });
        const fx = ease(seg(t, L(19, 5.0), L(19, 5.9))), mx = ease(seg(t, L(19, 6.6), L(19, 7.4)));
        xChrom(lerp(440, 880, fx), lerp(560, 450, fx), lerp(.55, .9, fx) * gk, 'bad', 'fx', { glow: fx > 0 && fx < 1 ? .6 : 0 });
        yChrom(360, 520, .55 * gk, 'fy');
        xChrom(1440, 560, .55 * gk, 'ok', 'mx1'); xChrom(lerp(1560, 1040, mx), lerp(560, 450, mx), lerp(.55, .9, mx) * gk, 'bad', 'mx2', { glow: mx > 0 && mx < 1 ? .6 : 0 });
      }
      // the balance: many affected boys against few girls
      const bk = backOut(seg(t, L(19, 9.4), L(19, 9.9)));
      if (bk > .02) { const tilt = .22 * ease(seg(t, L(19, 10.2), L(19, 11.0))), P0 = [960, 380], ca = Math.cos(tilt), sa = Math.sin(tilt);
        const end = s_ => [P0[0] + s_ * 380 * ca * bk, P0[1] - s_ * 380 * sa * bk];
        boilSeed('bal'); paint([[P0[0] - 26, P0[1] + 420], [P0[0] + 26, P0[1] + 420], [P0[0], P0[1]]], { wash: Z.goldDk, ink: PAL.ink, sw: 1 });
        inkLine([end(-1), end(1)], 8, Z.goldDk, 'ink', 0);
        [-1, 1].forEach(s_ => { const e = end(s_); inkLine([e, [e[0], e[1] + 130]], 2, PAL.ink, 'ink', 0); boilSeed('pan' + s_); paint([[e[0] - 120, e[1] + 130], [e[0] + 120, e[1] + 130], [e[0] + 90, e[1] + 170], [e[0] - 90, e[1] + 170]], { wash: Z.gold, ink: PAL.ink, sw: 1 });
          const n = s_ < 0 ? 7 : 1; for (let j = 0; j < n; j++) { const q = backOut(seg(t, L(19, 9.8) + j * .1, L(19, 10.2) + j * .1)); const x = e[0] + (j % 4 - 1.5) * 50 * (n > 1 ? 1 : 0), y = e[1] + 100 - Math.floor(j / 4) * 50; boilSeed('pm' + s_ + j);
            paint(s_ < 0 ? rrPts(x - 20 * q, y - 20 * q, 40 * q, 40 * q, 5) : ellPts(x, y, 20 * q, 20 * q, 16), { wash: Z.red, ink: PAL.ink, sw: 1.2 }); } }); }
    } else if (t < L(21, -1.0)) {                                       // L20: 7% of men, 0.5% of women; X-dominant flips it
      const plate = backOut(seg(t, L(20, -.6), L(20, -.1))) * (1 - ease(seg(t, L(20, 2.0), L(20, 2.6))));
      if (plate > .02) { boilSeed('ish'); paint(ellPts(960, 480, 300 * plate, 300 * plate, 36), { wash: '#F6EEE2', ink: PAL.ink, sw: 1.2 });
        for (let i = 0; i < 90; i++) { const a = hash(i + 800) * TAU, d = Math.sqrt(hash(i + 801)) * 270 * plate, x = 960 + Math.cos(a) * d, y = 480 + Math.sin(a) * d, inSix = Math.abs(Math.hypot(x - 960, y - 500) - 120) < 34 && !(x > 990 && y < 470);
          boilSeed('id' + i); paint(ellPts(x, y, (12 + 10 * hash(i + 802)) * plate, (12 + 10 * hash(i + 802)) * plate, 10), { wash: inSix ? ['#E57A5A', '#D9925C'][i % 2] : ['#9DBA6A', '#B8C77A', '#8EAD6A'][i % 3], ink: null }); } }
      const gk = seg(t, L(20, 2.4), L(20, 3.0)), dom = seg(t, L(20, 9.2), L(20, 9.6));
      if (gk > .02) {
        const cellOf = (side, i) => [side ? 1110 + (i % 20) * 30 : 210 + (i % 20) * 30, 300 + Math.floor(i / 20) * 34];
        const menLit = i => hash(i + 900) < .07, womenLit = i => i === 113;
        const menDom = i => hash(i + 950) < .05, womenDom = i => hash(i + 960) < .1;
        for (const side of [0, 1]) for (let i = 0; i < 200; i++) {
          const [x, y] = cellOf(side, i), q = backOut(clamp(gk * 2 - i / 400));
          const litA = side ? womenLit(i) && t > L(20, 6.6) : menLit(i) && t > L(20, 3.2) + hash(i + 901) * 1.2;
          const litB = side ? womenDom(i) && t > L(20, 11.4) + hash(i + 961) * .8 : menDom(i) && t > L(20, 10.2) + hash(i + 951) * .8;
          const col = dom < .5 ? (litA ? Z.red : '#F7F2E8') : (litB ? '#7B5CA8' : '#F7F2E8');
          boilSeed('cr' + side + i); paint(side ? ellPts(x, y, 11 * q, 11 * q, 10) : rrPts(x - 11 * q, y - 11 * q, 22 * q, 22 * q, 3), { wash: col, ink: PAL.ink, sw: .7 });
        }
        sexMark(1, 495, 220, 30, gk, 'gm'); sexMark(0, 1395, 220, 30, gk, 'gw');
        ringK(1110 + 13 * 30, 300 + 5 * 34, 40, 40, seg(t, L(20, 6.6), L(20, 7.6)), Z.red, 'onew', 4);
      }
    } else {                                                            // L21: RECAP mother → son → daughter
      const pop = i => backOut(seg(t, L(21, -.8) + i * .3, L(21, -.4) + i * .3));
      const P = [[460, 520, 0, 'car'], [960, 520, 1, 'aff'], [1460, 520, 0, 'car']];
      P.forEach(([x, y, m, st], i) => { const q = pop(i); if (q <= .02) return; const r = 80 * q; boilSeed('rcp' + i);
        paint(m ? rrPts(x - r, y - r, 2 * r, 2 * r, 10) : ellPts(x, y, r, r, 26), { wash: st === 'aff' ? Z.red : Z.node, ink: PAL.ink, sw: 2.4 });
        if (st === 'car') paint(ellPts(x, y, 24 * q, 24 * q, 14), { wash: Z.red, ink: null });
        ringK(x, y, r * 1.2, r * 1.2, seg(t, L(21, [7.4, 6.2, 8.6][i]), L(21, [8.4, 7.2, 9.6][i])), Z.gold, 'rr' + i, 5); });
      arrow(570, 520, 850, 520, seg(t, L(21, 7.6), L(21, 8.1)), Z.red, 'ra1', 16);
      arrow(1070, 520, 1350, 520, seg(t, L(21, 8.7), L(21, 9.2)), Z.red, 'ra2', 16);
      // 男多于女: a small tilt of squares over circles, under the row
      const mk = backOut(seg(t, L(21, 4.2), L(21, 4.7)));
      if (mk > .02) for (let j = 0; j < 6; j++) { boilSeed('rm' + j); const x = 800 + j * 56, y = 800 + (j < 5 ? 0 : 0); const sq_ = j < 5; paint(sq_ ? rrPts(x - 18 * mk, y - 18 * mk, 36 * mk, 36 * mk, 5) : ellPts(x + 30, y, 18 * mk, 18 * mk, 14), { wash: Z.red, ink: PAL.ink, sw: 1.1 }); }
    }
    camEnd();
    host(150, 1010, 30, t, [[L(19, -2), 'calm', { lookX: .8, lookY: -.6 }], [L(19, 5.4), 'wow', { lookX: .8, lookY: -.6 }], [L(19, 7.8), 'worried'], [L(19, 10.6), 'idea'],
      [L(20, 3.6), 'wow', { lookX: .8, lookY: -.6 }], [L(20, 7.0), 'calm', { lookX: .8, lookY: -.6 }], [L(20, 10.4), 'confused'], [L(20, 12.0), 'wow'],
      [L(21, -.8), 'calm', { lookX: .8, lookY: -.6 }], [L(21, 9.0), 'smug']], {}, 'pf');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#C8B4DE', LIL2]);
    flash(near(t, L(20, -.7), .22), '#FBF8FD');
    if (t > L(21, -1.3) && t < L(21, -.7)) brushWipe(seg(t, L(21, -1.3), L(21, -.7)), ['#E4D4AE', Z.recap]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E9B47F', Z.dusk]);
  }

  // ================================ G: the tree again; the answer (304–350) ================================
  GOLDT.bertie = L(23, 5.2); GOLDT.g5 = L(23, 7.4); GOLDT.g6 = L(23, 8.4);
  CROWNT.alix = L(22, 5.0); CROWNT.ena = L(22, 11.2); CROWNT.bertie = L(23, 1.8);
  function shotG(t, lt, dur) {
    const c = kf(t, [[L(22, -1.4), [1000, 520, 1.0]], [L(22, 3.2), [1000, 520, 1.0]], [L(22, 4.2), [740, 620, 2.0]], [L(22, 9.4), [760, 650, 2.0]], [L(22, 10.4), [1500, 620, 2.0]], [L(22, 13.8), [1500, 640, 2.0]],
      [L(23, .6), [560, 600, 1.9]], [L(23, 6.4), [560, 600, 1.9]], [L(23, 7.4), [560, 680, 1.7]], [L(23, 10.2), [560, 680, 1.7]], [L(24, -.4), [1000, 520, 1.0]]], ease);
    cam(c[0] + 6 * wob(t, .05) / c[2], c[1] + 4 * wob(t, .04) / c[2], c[2]);
    palaceBg(t, 'g', 1);
    const dimK = ease(seg(t, L(24, .2), L(24, 1.0))) * (1 - ease(seg(t, L(24, 12.6), L(24, 13.6))) * .6);
    const boysK = near(t, L(24, 11.9), .5) + near(t, L(22, 12.8), .4) * (['alfonso', 'gonzalo'].length ? 1 : 0);
    tree(t, 'g', { houses: () => 1, dim: dimK,
      dimOf: n => n.id === 'vic' ? dimK * (1 - near(t, L(24, 10.2), .9)) : AFF.includes(n.id) ? dimK * (1 - near(t, L(24, 12.0), .9)) : dimK,
      hi: n => ({ alice: near(t, L(22, 2.0), .3) + near(t, L(22, 4.4), .3), bea: near(t, L(22, 2.4), .3) + near(t, L(22, 10.6), .3), alix: near(t, L(22, 5.2), .35), alexei: near(t, L(22, 8.4), .4),
        ena: near(t, L(22, 11.4), .35), alfonso: near(t, L(22, 12.8), .4), gonzalo: near(t, L(22, 13.0), .4), vic: near(t, L(23, 3.8), .3) + near(t, L(24, 10.2), .4), bertie: near(t, L(23, 5.4), .3),
        g5: near(t, L(23, 7.6), .3), g6: near(t, L(23, 8.6), .3) })[n.id] || (AFF.includes(n.id) ? near(t, L(24, 12.0), .4) : 0) });
    // the gold X: Victoria's normal X goes to Edward VII
    const gx = ease(seg(t, L(23, 3.8), L(23, 5.0)));
    if (gx > 0 && gx < 1) { const p = arcPt([N.vic.x, N.vic.y], [N.bertie.x, N.bertie.y], 80, gx); xChrom(p[0], p[1], .22, 'ok', 'gtok', { glow: .5 }); }
    [['bertie', 5.6], ['g5', 7.8], ['g6', 8.8]].forEach(([id, d]) => K.check(N[id].x + 42, N[id].y - 20, 30, seg(t, L(23, d), L(23, d + .5)), 'gc' + id));
    // the two answers over the dimmed tree
    if (t > L(24, 0)) {
      const a1 = backOut(seg(t, L(24, .3), L(24, .8))), a2 = backOut(seg(t, L(24, 4.6), L(24, 5.1)));
      const g1 = near(t, L(24, 10.2), .5), g2 = near(t, L(24, 11.9), .5);
      if (a1 > .02) { boilSeed('ans1'); paint(rrPts(560 - 220 * a1, 520 - 230 * a1, 440 * a1, 460 * a1, 30), { wash: '#FBF4E6', ink: mixCol(PAL.ink, Z.gold, g1), sw: 2 + 3 * g1 });
        roundCell(560, 520, 170 * a1, 'acell', { col: '#EEF1FA', dk: '#C7CFE8' });
        const sw = seg(t, L(24, 2.6), L(24, 3.3)), sc = sw > 0 && sw < 1 ? Math.abs(Math.cos(sw * Math.PI)) : 1;
        piece(560, 420, 0, sw > .5 ? 'G' : 'A', 46 * a1, 90 * a1 * sc, { key: 'at', letter: 1, glow: sw > .5 ? .7 : 0 }); piece(560, 620, Math.PI, sw > .5 ? 'C' : 'T', 46 * a1, 90 * a1 * sc, { key: 'ab', letter: 1, glow: sw > .5 ? .7 : 0 });
        backbone([[500, 418], [620, 418]], 14, '#5B7FC7', 'aT'); backbone([[500, 622], [620, 622]], 14, '#5B7FC7', 'aB'); }
      if (a2 > .02) { boilSeed('ans2'); paint(rrPts(1440 - 220 * a2, 520 - 230 * a2, 440 * a2, 460 * a2, 30), { wash: '#FBF4E6', ink: mixCol(PAL.ink, Z.gold, g2), sw: 2 + 3 * g2 });
        xChrom(1380, 520, .95 * a2, 'bad', 'ax', { glow: near(t, L(24, 6.0), .5) * .8 }); yChrom(1520, 470, .95 * a2, 'ay');
        dashRing(1240, 520, 50, 150, seg(t, L(24, 6.4), L(24, 7.2)), Z.X, 'aghost', 3); }
    }
    camEnd();
    host(1765, 1010, 30, t, [[L(22, -1.4), 'calm', { lookX: -.7, lookY: -.6 }], [L(22, 8.6), 'sad', { lookX: -.7, lookY: -.6 }], [L(22, 10.2), 'calm', { lookX: -.7, lookY: -.6 }], [L(22, 13.0), 'worried'],
      [L(23, 5.6), 'happy', { lookX: -.7, lookY: -.6 }], [L(23, 8.8), 'laugh'], [L(24, .4), 'calm', { lookX: -.8, lookY: -.6 }], [L(24, 4.0), 'wow'], [L(24, 9.0), 'idea'], [L(24, 12.8), 'smug']], { flip: true }, 'pg');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E9B47F', Z.dusk]);
    flash(seg(t, L(25, -1.2), L(25, -.7)), '#FFF6E8');
  }

  // ================================ H: the fix (350–369) ================================
  function shotH(t, lt, dur) {
    const c = kf(t, [[L(25, -.7), [960, 540, 1.1]], [L(25, 6.4), [960, 540, 1.0]], [L(25, 9.0), [900, 560, .95]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash(Z.liver, t, { key: 'h', blob: Z.liverBlob, rect: rectPts(-800, -800, W + 1600, H + 1600) });
    K.motes(t, 16, mixCol(Z.liver, '#C98A6A', .3), { key: 'h' });
    const CX = 1180, CY = 480, R = 270;
    K.cell(CX, CY, R, '#F2B48E', '#C98763', t, { key: 'liv', mood: t > L(25, 8.6) ? 'happy' : t > L(25, 3.4) ? 'wow' : 'calm', lx: -.6, sq: .05 * spring(t, L(25, 3.2), 6, 18), nucleus: false, fx: -.3,
      extras: () => { boilSeed('lnuc'); paint(ellPts(CX + R * .42, CY + R * .3, R * .3, R * .26, 18, 1), { wash: '#E9A07C', fill: '#C98763', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 }); } });
    // the capsid docks, opens, and the gold gene slides into the nucleus
    const arrive = ease(seg(t, L(25, 1.0), L(25, 3.0))), open = seg(t, L(25, 3.2), L(25, 3.8));
    const vx = lerp(1980, CX + R * .7, arrive), vy = lerp(160, CY - R * .7, arrive);
    if (open < 1) { boilSeed('cap'); const q = 1 + .5 * open, a = 1 - open, P = []; for (let i = 0; i < 6; i++) { const ang = i / 6 * TAU + Math.PI / 6; P.push([vx + Math.cos(ang) * 64 * q, vy + Math.sin(ang) * 64 * q]); }
      paint(P, { wash: '#CFE9E4', washOp: 230 * a, ink: a > .3 ? PAL.ink : null, sw: 1.1 }); }
    const gin = ease(seg(t, L(25, 3.4), L(25, 5.4)));
    if (gin > 0) for (let j = 0; j < 6; j++) { const f = clamp(gin * 1.4 - j * .08), x = lerp(vx, CX + R * .42 + (j - 2.5) * 20, f), y = lerp(vy, CY + R * .3 + Math.sin(j) * 10, f); boilSeed('gn' + j); paint(ellPts(x, y, 13, 13, 10), { wash: Z.f9, ink: PAL.ink, sw: .8 }); }
    if (t > L(25, 5.2) && t < L(25, 6.2)) K.sparkle(CX + R * .42, CY + R * .2, 60, seg(t, L(25, 5.2), L(25, 6.2)), '#FFF3C4');
    // factor IX streams out to a boy; his bruise fades
    for (let j = 0; j < 9; j++) { const k = frac((t - L(25, 6.0)) * .45 + j / 9); if (t < L(25, 6.0) + j * .25) continue; const p = arcPt([CX - R * .8, CY + 60], [430, 760], 120, k); f9bead(p[0], p[1], 18 * (1 - .3 * k), 'out' + j); }
    const heal = seg(t, L(25, 8.6), L(25, 10.6));
    royal(400, 960, 36, LEO, { ...K.act(t, [[L(25, -.7), 'sad', { lookX: .7, lookY: -.5 }], [L(25, 7.4), 'wow', { lookX: .7, lookY: -.6 }], [L(25, 9.8), 'happy'], [L(25, 11.4), 'laugh']], 5) }, 'hboy', { bruise: 1 - heal });
    if (heal > .3 && heal < 1) K.sparkle(380, 860, 50, heal, '#FFF3C4');
    camEnd();
    const y = host(1700, 1000, 32, t, [[L(25, -.7), 'calm', { lookX: -.7, lookY: -.6 }], [L(25, 4.0), 'wow', { lookX: -.8, lookY: -.6 }], [L(25, 9.9), 'happy'], [L(25, 12.0), 'wave'], [L(25, 14.4), 'love']], { flip: true }, 'ph');
    const at = [1700, y - 2.8 * 32];
    flash(1 - seg(t, L(25, -.7), L(25, -.1)), '#FFF6E8');
    const close = seg(t, DUR - 2.6, DUR - .5);
    if (close > 0) iris(at[0], at[1], kf(close, [[0, 1900], [.6, 240], [.8, 220], [1, 0]], easeIn));
  }

  // ================================ the cover (a still: node tools/render.mjs --page=pages/variation.html --loop=cover --stills=.5) ================================
  LOOPS.cover = t => {
    K.wash(Z.wall, t, { key: 'cv', blob: Z.wallBlob, rect: rectPts(-200, -200, W + 400, H + 400) });
    boilSeed('cvfl'); paint(rectPts(-200, 930, W + 400, 400), { wash: Z.floor, ink: null });
    boilSeed('cvdp'); paint([[W + 200, -200], [W - 160, -200], [W - 250, 420], [W - 200, 940], [W + 200, 940]], { wash: Z.drape, fill: Z.drapeDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1, curv: .3 });
    // the hero: an X with the red band, big and glowing, a Y beside it
    boilSeed('cvdisc'); paint(ellPts(1360, 470, 400, 380, 48), { wash: Z.lilac, fill: Z.lilacBlob, fillOp: 80, bleed: .2, tex: .5, ink: PAL.ink, sw: 1.4, curv: .2 });
    xChrom(1290, 450, 1.5, 'bad', 'cvx', { glow: .9 }); yChrom(1520, 380, 1.5, 'cvy');
    K.sparkle(1300, 710, 50, .35, '#FFD9D0'); K.sparkle(1180, 230, 30, .3, '#FFF3C4');
    // Victoria, a bruised prince, and Pip
    royal(1050, 1020, 40, VIC, { ...pipFeel('calm', .4, { seed: 3 }), lookX: .6 }, 'cvv');
    royal(1660, 1020, 34, LEO, { ...pipFeel('worried', .8, { seed: 5 }), flip: true }, 'cvl', { bruise: 1 });
    pip(1360, 1035, 40, { ...pipFeel('wow', .2), lookY: -.5, emote: 'question', emoteK: 1, key: 'cvpip' });
    boilSeed('cvtag'); paint(rrPts(80, 92, 600, 92, 30, 2), { wash: '#B8434E', fill: Z.drapeDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
    const F = (wgt, px) => `${wgt} ${px}px "PingFang SC", "Hiragino Sans GB", "STHeiti", sans-serif`;
    letter('高中生物 · 变异与伴性遗传', 380, 140, 46, PAL.cream, { font: F(800, 46), screen: true });
    letter('王室病', 92, 330, 150, '#3B2F45', { font: F(900, 150), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    letter('为什么只找男孩？', 92, 500, 118, '#3B2F45', { font: F(900, 118), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    boilSeed('cvblob'); paint(ellPts(400, 735, 340, 110, 30, 6, -.05), { wash: '#F6C7BF', fill: Z.red, fillOp: 60, bleed: .2, tex: .6, ink: null });
    letter('一个碱基对', 400, 735, 104, Z.redDk, { font: F(900, 104), stroke: PAL.cream, screen: true, rot: -.04 });
    letter('一条 X 染色体', 380, 880, 64, '#3B2F45', { font: F(800, 64), stroke: PAL.cream, screen: true, ink: false, rot: -.02 });
  };
  LOOPS.cover.len = 1;

  shots([[0, shotA1], [L(2, -.6), shotA2], [L(3, -.4), shotA3], [L(4, -1.4), shotB1], [L(5, -.6), shotB2], [L(6, -.4), shotB3], [L(7, -2.4), shotC1], [L(9, -1.3), shotC2], [L(11, -1.0), shotC3], [L(13, -1.6), shotD], [L(14, -1.8), shotE1], [L(17, -.7), shotE2], [L(19, -2.0), shotF], [L(22, -1.4), shotG], [L(25, -.7), shotH]]);
})();

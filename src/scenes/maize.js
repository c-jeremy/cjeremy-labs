// maize.js: "Pip讲玉米雇杀手", 295 s. A caterpillar eats a maize leaf; a wasp arrives and lays eggs in it. Who sent the
// wasp? The trail leads back to the maize: the caterpillar's spit gives it away, the plant answers with a chemical call
// (化学信息: 信息源 → 信道 → 信息受体), the wasp follows it upwind. Then out to the ecosystem (neighbours listening in,
// 种间关系, 负反馈调节), under the ground (β-石竹烯 and nematodes), and into the farm (生物防治).
// See STORYBOARD_MAIZE.md. Every time is tied to a voice line: L(i, d) = line i's start + d seconds.
(() => {
  const K = MK;
  const Z = {
    // the world
    haze: '#EDE6C8', hazeBlob: '#F7F1DA', sky: '#DCEBEA', skyBlob: '#EEF5EE', noon: '#CFE6EC', noonBlob: '#EAF4F2',
    dusk: '#F2CF9A', duskBlob: '#F8E3BE', duskHi: '#F6B880', field: '#B9CF8A', fieldDk: '#93AE66', far: '#C9D6A6',
    soil: '#9C7451', soilDk: '#73533A', soilLt: '#B9936B', under: '#8A6646', underBlob: '#A47E5A',
    inside: '#DDEBC6', insideBlob: '#EEF5DF', board: '#F4EEDD', boardBlob: '#FBF7EB', after: '#D6E6DA', afterBlob: '#EAF2EA',
    // maize
    leaf: '#7FAE5A', leafDk: '#4E7A3A', leafLt: '#A9CB7E', stalk: '#8DB565', stalkDk: '#5E8A42', husk: '#B9CC86', huskDk: '#8EA65E',
    silk: '#D9A57E', tassel: '#D8C27A', tasselDk: '#B39A52', kernel: '#F2CF5B', kernelDk: '#CFA43A', cell: '#C7DFA6', cellDk: '#9FC27C',
    // the cast
    cat: '#9BAA4A', catDk: '#6E7C2E', catLt: '#BCC77A', stripe: '#F1E8C2', catHead: '#8F8743', dead: '#B7AE92', deadDk: '#8C8470',
    wasp: '#3E3540', waspDk: '#2B252D', waspLeg: '#E39A3A', wing: '#F3F7F8', grub: '#F2EAD6', grubDk: '#CDBF9F', grubHead: '#9A6A3C',
    nema: '#F4ECD6', ladybug: '#D9483E', sparrow: '#A9805A', sparrowDk: '#7A5A3E',
    // the codes
    spit: '#B0559A', spitLt: '#D995C8', call: '#E7A93C', callLt: '#F3CF85', callDk: '#BF8424', sun: '#F3C653',
    gold: '#F0B640', red: '#D9534F', green: '#6FA548'
  };
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));
  const popK = (t, a, len = .35) => backOut(seg(t, a, a + len));
  const rotP = (P, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return P.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
  const rotEll = (x, y, rx, ry, n, rot) => rotP(ellPts(x, y, rx, ry, n), x, y, rot);

  // a tube along a path with a width profile wf(u), u 0..1: one outline (bodies that bulge in the middle)
  function tube(P, wf) {
    const C = through(P), n = C.length, Lf = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = wf(i / Math.max(1, n - 1)) / 2;
      Lf.push([C[i][0] - dy / d * w, C[i][1] + dx / d * w]); R.push([C[i][0] + dy / d * w, C[i][1] - dx / d * w]);
    }
    return { out: Lf.concat(R.reverse()), C, Lf, R: R.slice().reverse() };
  }
  // point + normal at fraction u along a sampled curve
  function along(C, u) {
    const n = C.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i, a = C[i], b = C[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    return { p: [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], ang: Math.atan2(dy, dx), nx: -dy / d, ny: dx / d };
  }

  // ================================ the cast ================================
  // The caterpillar (beet armyworm larva): a segmented tube, a cream side stripe, a darker head capsule with mandibles,
  // three pairs of true legs at the front and stubby prolegs behind. (x, y) = where the head meets the ground; dir 1 faces right.
  // o.crawl: phase of the peristaltic wave (it travels tail → head); o.munch 0..1 head dip; o.dead 0..1 grey + curl;
  // o.squirm: a shudder; o.inside(): drawn over the body (the cutaway).
  function caterpillar(x, y, s, t, o = {}) {
    const dir = o.dir ?? 1, N = 12, Lb = s * 2.6, crawl = o.crawl ?? 0, dead = o.dead || 0, sq = o.squirm || 0;
    boilSeed('cat' + (o.key || ''));
    const P = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;                                              // 0 = tail, 1 = head
      const ph = crawl * TAU - u * 5.2, hump = Math.max(0, Math.sin(ph)) ** 3;
      const bx = -Lb * (1 - u) + hump * s * .06 * (1 - dead), by = -s * .2 - hump * s * .22 * (1 - dead) - dead * s * .5 * Math.sin(u * Math.PI) * 0;
      const curl = dead * s * .35 * Math.pow(u, 2.2);                // curls the head down and back when dead
      const shud = sq * s * .05 * Math.sin(t * 40 + u * 9);
      P.push([x + dir * (bx - curl * .6), y + by + curl * .9 - (o.munch || 0) * s * .12 * u ** 6 + shud]);
    }
    const body = mixCol(o.col || Z.cat, Z.dead, dead), dk = mixCol(Z.catDk, Z.deadDk, dead);
    const wf = u => s * (.34 + .16 * Math.sin(Math.min(1, u * 1.15) * Math.PI) - .1 * (u > .9 ? (u - .9) * 6 : 0));
    const T = tube(P, wf), sw = clamp(s / 70, .5, 1.3) * (o.sw || 1);
    // legs under the body: prolegs (stubby pairs) at the back, true legs at the front
    const legs = [[.08, 1.1], [.42, 1], [.5, 1], [.58, 1], [.66, 1], [.84, .7], [.89, .7], [.94, .7]];
    for (const [u, l] of legs) {
      const a = along(T.C, u), bx = a.p[0], by = a.p[1] + wf(u) * .38, lw = s * (l > .9 ? .16 : .1) * (u > .8 ? .7 : 1);
      paint(rrPts(bx - lw / 2, by, lw, s * .17 * l, lw * .4), { wash: mixCol(dk, body, .4), ink: PAL.ink, sw: sw * .8 });
    }
    paint(T.out, { wash: body, fill: dk, fillOp: 35, tex: .4, ink: PAL.ink, sw });
    // the side stripe and the darker back
    const stripe = [], back = [];
    for (let i = 0; i <= 30; i++) { const u = .03 + .84 * i / 30, a = along(T.C, u), w = wf(u) / 2; stripe.push([a.p[0] + dir * 0 + a.nx * w * .45 * dir, a.p[1] + w * .42]); back.push([a.p[0], a.p[1] - w * .62]); }
    paint(ribbon(back, s * .05, s * .1), { wash: mixCol(dk, body, .35), washOp: 170, ink: null });
    paint(ribbon(stripe, s * .05, s * .08), { wash: mixCol(Z.stripe, body, dead * .6), ink: null });
    // segment creases
    for (let k = 1; k < 11; k++) {
      const u = k / 11 * .86 + .04, a = along(T.C, u), w = wf(u) / 2 * .92;
      inkLine([[a.p[0] - a.nx * w * .1, a.p[1] - w], [a.p[0] + dir * s * .025, a.p[1]], [a.p[0], a.p[1] + w]], sw * .55, mixCol(dk, PAL.ink, .3), 'inkfine', .6);
      if (k % 2) paint(ellPts(a.p[0], a.p[1] - w * .25, s * .022, s * .022, 6), { wash: mixCol(PAL.ink, body, .4), ink: null });   // spiracle-ish dots
    }
    // the head capsule + mandibles
    const hd = along(T.C, 1), hr = s * .26, hx = hd.p[0] + dir * hr * .55, hy = hd.p[1] + hr * .25;
    paint(ellPts(hx, hy, hr * 1.05, hr, 18), { wash: mixCol(Z.catHead, Z.deadDk, dead), fill: dk, fillOp: 40, tex: .3, ink: PAL.ink, sw });
    paint(ellPts(hx - dir * hr * .1, hy - hr * .55, hr * .55, hr * .3, 10), { wash: mixCol(PAL.cream, body, .5), washOp: 120, ink: null });
    const mo = (o.munch || 0) * .4 + .1;
    inkLine([[hx + dir * hr * .7, hy + hr * .55], [hx + dir * hr * 1.05, hy + hr * (.75 + mo)]], sw * 1.6, PAL.ink, 'ink', 0);
    inkLine([[hx + dir * hr * .55, hy + hr * .7], [hx + dir * hr * .8, hy + hr * (1 - mo * .5)]], sw * 1.4, PAL.ink, 'ink', 0);
    paint(ellPts(hx + dir * hr * .3, hy - hr * .1, hr * .09, hr * .09, 6), { wash: PAL.ink, ink: null });   // the stemmata (no face: just a dark speck)
    if (o.inside) o.inside(T, wf);
    return { head: [hx + dir * hr, hy + hr * .6], mid: along(T.C, .5).p, T, wf };
  }

  // The wasp (Cotesia): head + long antennae, thorax, a pinched waist, an oval abdomen, two pairs of veined wings,
  // orange legs. (x, y) = the thorax; dir 1 faces right. o.fly 0..1 blurs the wings; o.curl 0..1 swings the abdomen
  // under (stinging); o.tap 0..1 dips the antennae forward.
  function wasp(x, y, s, t, o = {}) {
    const dir = o.dir ?? 1, fly = o.fly || 0, curl = o.curl || 0, tap = o.tap || 0, sw = clamp(s / 60, .5, 1.2);
    boilSeed('wsp' + (o.key || ''));
    push(); translate(x, y); scale(dir, 1); rotate(o.rot || 0);
    // legs (behind the body)
    if (fly < .7) for (let i = 0; i < 3; i++) {
      const bx = -s * .18 + i * s * .2, kx = bx + (i - 1) * s * .25, ky = s * .38;
      inkLine([[bx, s * .1], [kx, ky - s * .05], [kx + (i - 1) * s * .12, ky + s * .22]], sw * 1.5, Z.waspLeg, 'ink', .3);
    } else for (let i = 0; i < 3; i++) inkLine([[-s * .15 + i * s * .15, s * .1], [-s * .3 + i * s * .12, s * .4]], sw * 1.3, Z.waspLeg, 'ink', .2);
    // the abdomen on a waist; curl swings it down and forward under the body
    const ca = -.15 + curl * 1.55, wx = -s * .42, wy = s * .05;
    const ax = wx - Math.cos(ca) * s * .36, ay = wy + Math.sin(ca) * s * .36;
    inkLine([[-s * .3, s * .02], [wx, wy]], sw * 3.2, Z.waspDk, 'ink', 0);
    paint(rotEll(ax, ay, s * .36, s * .2, 18, -ca), { wash: Z.wasp, fill: Z.waspDk, fillOp: 50, tex: .3, ink: PAL.ink, sw });
    for (let k = 1; k < 4; k++) { const c = Math.cos(-ca), sn = Math.sin(-ca), u = -.22 + k * .13; inkLine([[ax + c * u * s - sn * -s * .17, ay + sn * u * s + c * -s * .17], [ax + c * u * s - sn * s * .17, ay + sn * u * s + c * s * .17]], sw * .6, '#6B5E6B', 'inkfine', .5); }
    if (curl > .3) inkLine([[ax - Math.cos(ca) * s * .34, ay + Math.sin(ca) * s * .34], [ax - Math.cos(ca) * s * .55, ay + Math.sin(ca) * s * .5]], sw * 1.1, PAL.ink, 'ink', 0);   // the ovipositor
    // thorax and head
    paint(ellPts(0, 0, s * .32, s * .24, 16), { wash: Z.wasp, fill: Z.waspDk, fillOp: 50, tex: .3, ink: PAL.ink, sw });
    paint(ellPts(s * .38, -s * .06, s * .19, s * .18, 14), { wash: Z.wasp, ink: PAL.ink, sw });
    paint(ellPts(s * .44, -s * .1, s * .08, s * .1, 8), { wash: '#5D4F5E', ink: null });                    // the eye
    // antennae: long, curved, twitching
    const tw = .12 * Math.sin(t * 9 + (o.seed || 0)), tw2 = .12 * Math.sin(t * 7.3 + 1);
    for (const [k, w] of [[0, tw], [1, tw2]]) {
      const a0 = -1.0 + k * .25 + w + tap * .9, P = [[s * .48, -s * .2], [s * .48 + Math.cos(a0) * s * .45, -s * .2 + Math.sin(a0) * s * .45], [s * .48 + Math.cos(a0 + .5 + tap * .3) * s * .85, -s * .2 + Math.sin(a0 + .5 + tap * .3) * s * .85]];
      inkLine(P, sw * 1.2, Z.waspDk, 'ink', .6);
    }
    // wings: two pairs lying back over the abdomen, translucent with veins; flying = pale blurred fans
    const bx = -s * .05, by = -s * .2;
    const wing = (len, wd, a, op, inkOn, vein) => {
      const cx = bx + Math.cos(a) * len * .5, cy = by + Math.sin(a) * len * .5;
      paint(rotEll(cx, cy, len * .5, wd, 18, a), { wash: Z.wing, washOp: op, ink: inkOn ? mixCol(PAL.ink, Z.wing, .45) : null, sw: sw * .6 });
      if (vein) { inkLine([[bx, by], [bx + Math.cos(a - .06) * len * .55, by + Math.sin(a - .06) * len * .55]], sw * .7, mixCol(PAL.ink, Z.wing, .4), 'inkfine', 0);
        const sp = [bx + Math.cos(a - .08) * len * .58, by + Math.sin(a - .08) * len * .58]; paint(rotEll(sp[0], sp[1], s * .06, s * .025, 8, a), { wash: '#6B5E6B', ink: null }); }
    };
    if (fly > .3) { for (let j = 0; j < 3; j++) { const a = Math.PI + .15 - .9 + j * .45 + .25 * Math.sin(t * 50 + j * 2); wing(s * 1.0, s * .2, a, 70, false, false); } }
    else { const fold = o.wingUp || 0; wing(s * .9, s * .15, Math.PI + .34 + fold, 140, true, false); wing(s * 1.15, s * .2, Math.PI + .16 + fold * .6, 170, true, true); }
    pop();
    return [x + dir * s * .9, y - s * .3];
  }

  // A maize plant, side view. (x, y) = where the stalk meets the ground; h = height to the tassel tip.
  // o.sway: extra lean; o.ear 0..1 the ear's fill; o.bite: [leafIndex, 0..1] a ragged notch in that leaf;
  // o.lite: lighter, for the far rows; o.fine: thinner ink (wide shots). Returns leaf tip points and the ear position.
  const LEAVES = [[.14, -1, .62, .9], [.26, 1, .66, 1], [.38, -1, .64, 1.05], [.5, 1, .58, 1], [.6, -1, .5, .9], [.7, 1, .42, .8], [.79, -1, .32, .7]];
  function maize(x, y, h, t, o = {}) {
    const key = o.key || '', sway = (o.sway || 0) + .012 * wob(t, .13, x * .003), sw = (o.fine ? .5 : clamp(h / 900, .6, 1.2));
    const lite = o.lite || 0, col = c => mixCol(c, o.tint || Z.far, lite);
    boilSeed('mz' + key);
    const top = h * .86, S = u => [x + Math.sin(sway) * top * u * u * 1.4 + Math.sin(u * 3 + x) * h * .006, y - top * u];
    const P = []; for (let i = 0; i <= 8; i++) P.push(S(i / 8));
    const T = tube(P, u => h * (.042 - .024 * u));
    // the tassel (behind the top leaf)
    const tp = S(1);
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + (k - 3) * .32 + sway * 2, l = h * (.1 + .05 * hash(k + 3)) * (k === 3 ? 1.3 : 1);
      const e = [tp[0] + Math.cos(a) * l, tp[1] + Math.sin(a) * l + (k === 3 ? 0 : l * .35)];
      paint(ribbon([tp, [lerp(tp[0], e[0], .5), lerp(tp[1], e[1], .5) - l * .12], e], h * .008, h * .003), { wash: col(Z.tassel), ink: PAL.ink, sw: sw * .6 });
    }
    paint(T.out, { wash: col(Z.stalk), fill: col(Z.stalkDk), fillOp: 40, tex: .4, ink: PAL.ink, sw });
    for (let k = 1; k < 8; k++) { const a = along(T.C, k / 8.2), w = h * (.042 - .024 * k / 8) * .55; inkLine([[a.p[0] - w, a.p[1] + 2], [a.p[0], a.p[1] + 5], [a.p[0] + w, a.p[1] + 2]], sw * 1.1, col(Z.stalkDk), 'ink', .5); }
    // leaves: long straps that arch out and droop; each a ribbon with a midrib
    const tips = [], leaves = [];
    LEAVES.forEach(([u, side, len, lw], i) => {
      boilSeed('mzl' + key + i);
      const b = S(u), Lh = h * len * (o.leafS || 1), sw2 = wob(t, .21, i * 1.7 + x * .01) * .05 + sway * 1.5;
      const rise = .55 + .2 * hash(i + 4), pts = [];
      for (let k = 0; k <= 6; k++) {
        const q = k / 6, ang = -Math.PI / 2 + side * (.45 + q * (1.9 + .25 * hash(i)) ) + sw2 * q * q * side;
        const px = k === 0 ? b[0] : pts[k - 1][0] + Math.cos(ang) * Lh / 6, py = k === 0 ? b[1] : pts[k - 1][1] + Math.sin(ang) * Lh / 6 * rise;
        pts.push([px, py]);
      }
      const W0 = h * .045 * lw;
      let R = ribbon(pts, W0, 2);
      if (o.bite && o.bite[0] === i && o.bite[1] > 0) {                   // a ragged notch eaten out of the upper edge, centred at u = bite[2]
        const n = R.length / 2, Cc = through(pts), top = side < 0 ? 0 : 1, d = o.bite[1], uc = o.bite[2] ?? .45, bw = o.bite[3] ?? .07;
        R = R.map((p, j) => { const half = j < n ? 0 : 1; if (half !== top) return p; const jj = half ? 2 * n - 1 - j : j, u = jj / (n - 1), q = Math.abs(u - uc) / bw; if (q >= 1) return p;
          const c = Cc[Math.min(jj, Cc.length - 1)], dep = d * .85 * Math.sqrt(1 - q * q) * (1 + .2 * Math.sin(jj * 2.7)); return [lerp(p[0], c[0], dep), lerp(p[1], c[1], dep)]; });
      }
      paint(R, { wash: col(i % 2 ? Z.leaf : mixCol(Z.leaf, Z.leafDk, .2)), fill: col(Z.leafDk), fillOp: 30, tex: .45, ink: PAL.ink, sw });
      const mid = through(pts).slice(1, -2);
      inkLine(mid, sw * 1.1, col(Z.leafLt), 'inkfine', .5);
      tips.push(pts[6]); leaves.push({ C: through(pts), W0, side });
    });
    // the ear (with husk and silk), angled up and out from a node
    let ear = null;
    if (o.ear !== false) {
      const a = along(T.C, .44), eside = o.earSide || 1, el = h * .17 * (.8 + .2 * (o.ear ?? 1)), ew = h * .036 * (.75 + .3 * (o.ear ?? 1));
      const ang = -Math.PI / 2 + eside * .45, ux = Math.cos(ang), uy = Math.sin(ang), bx = a.p[0] + eside * h * .02, by = a.p[1];
      const ex = bx + ux * el * .55, ey = by + uy * el * .55;
      boilSeed('mzear' + key);
      paint(rotEll(ex, ey, el * .5, ew, 20, ang), { wash: col(Z.husk), fill: col(Z.huskDk), fillOp: 45, tex: .4, ink: PAL.ink, sw });
      if (o.kernels) {                                                   // the husk opened a little: rows of kernels filling in
        const kk = o.kernels;
        for (let r = 0; r < 7; r++) for (let c = -1; c <= 1; c++) { const q = .2 + r * .1, pp = [bx + ux * el * q - uy * c * ew * .5, by + uy * el * q + ux * c * ew * .5];
          const kq = clamp(kk * 9 - (r * 3 + c + 1) * .35); if (kq > 0) paint(ellPts(pp[0], pp[1], ew * .3 * backOut(kq), ew * .26 * backOut(kq), 8), { wash: col(Z.kernel), ink: PAL.ink, sw: sw * .5 }); }
      }
      inkLine([[bx + ux * el * .1, by + uy * el * .1], [bx + ux * el * .55 + uy * ew * .3, by + uy * el * .55 - ux * ew * .3], [bx + ux * el * .95, by + uy * el * .95]], sw * .8, col(Z.huskDk), 'inkfine', .5);
      const tipE = [bx + ux * el * 1.02, by + uy * el * 1.02];
      for (let k = 0; k < 5; k++) { const sa = ang + (k - 2) * .25; inkLine([tipE, [tipE[0] + Math.cos(sa) * el * .12 + 3 * Math.sin(t * 1.3 + k), tipE[1] + Math.sin(sa) * el * .12], [tipE[0] + Math.cos(sa + .4 * eside) * el * .2, tipE[1] + Math.sin(sa + .4 * eside) * el * .2 + el * .05]], sw * .9, col(Z.silk), 'inkfine', .5); }
      ear = [ex, ey];
    }
    if (o.audit) auditBox('prop', 'maize' + key, x - h * .5, y - h, x + h * .5, y);
    return { tips, ear, top: tp, S, leaves };
  }

  // a point on a leaf's upper edge at fraction u, with the tangent angle oriented left → right
  function onLeaf(lf, u) {
    const a = along(lf.C, u), w = lerp(lf.W0, 2, u) / 2;
    const e1 = [a.p[0] + a.nx * w, a.p[1] + a.ny * w], e2 = [a.p[0] - a.nx * w, a.p[1] - a.ny * w], p = e1[1] < e2[1] ? e1 : e2;
    let ang = a.ang; if (Math.cos(ang) < 0) ang += Math.PI;
    return { p, ang, w };
  }
  // a close-up maize leaf blade crossing the frame: from (x0, y0) to (x1, y1), width w, parallel veins.
  // o.bite: {at: 0..1 along, k: 0..1 depth} eaten out of the upper edge (ragged)
  function blade(x0, y0, x1, y1, w, t, o = {}) {
    boilSeed('bl' + (o.key || ''));
    const n = 64, ang = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(ang), ny = Math.cos(ang), up = [], dn = [];
    const sag = o.sag ?? 40, ww = u => w * (u < .1 ? .75 + 2.5 * u : 1 - .85 * Math.pow((u - .1) / .9, 1.6));
    const bite = o.bite;
    for (let i = 0; i <= n; i++) {
      const u = i / n, cx = lerp(x0, x1, u) + nx * sag * Math.sin(u * Math.PI) * -1, cy = lerp(y0, y1, u) + ny * sag * Math.sin(u * Math.PI) * -1 + 4 * wob(t, .3, u * 3) * u;
      let wu = ww(u) / 2, wd = ww(u) / 2;
      if (bite && bite.k > 0) { const d = Math.abs(u - bite.at) / (bite.w || .12); if (d < 1) wu -= ww(u) * .46 * bite.k * Math.sqrt(1 - d * d) * (.86 + .22 * Math.abs(Math.sin(d * 9 + i * .7))); }
      up.push([cx + nx * -wu, cy + ny * -wu]); dn.push([cx + nx * wd, cy + ny * wd]);
    }
    const out = up.concat(dn.reverse());
    paint(out, { wash: o.col || Z.leaf, fill: Z.leafDk, fillOp: 35, tex: .5, ink: PAL.ink, sw: o.sw || 1.2 });
    // veins: parallel, the midrib lighter and thicker
    for (let v = -2; v <= 2; v++) {
      const P = []; for (let i = 1; i < n; i++) { const u = i / n, cx = lerp(x0, x1, u) + nx * sag * Math.sin(u * Math.PI) * -1, cy = lerp(y0, y1, u) + ny * sag * Math.sin(u * Math.PI) * -1 + 4 * wob(t, .3, u * 3) * u, f = v * .2 * ww(u);
        if (bite && bite.k > 0 && v < 0) { const d = Math.abs(u - bite.at) / (bite.w || .12); if (d < 1 && -v * .2 * ww(u) > ww(u) * (.5 - .5 * bite.k * Math.sqrt(1 - d * d))) { if (P.length > 1) inkLine(P.slice(), .7, Z.leafDk, 'inkfine', .5); P.length = 0; continue; } }
        P.push([cx + nx * f, cy + ny * f]); }
      if (P.length > 1) inkLine(P, v === 0 ? 2.4 : .8, v === 0 ? Z.leafLt : mixCol(Z.leafDk, Z.leaf, .3), v === 0 ? 'ink' : 'inkfine', .5);
    }
    // where a point at fraction u along the blade's top surface sits (for things standing on it)
    return u => { const cx = lerp(x0, x1, u) + nx * sag * Math.sin(u * Math.PI) * -1, cy = lerp(y0, y1, u) + ny * sag * Math.sin(u * Math.PI) * -1 + 4 * wob(t, .3, u * 3) * u; return [cx, cy - ww(u) * .1]; };
  }

  // the call: an amber wisp of scent curling up from (x, y). k = 0..1 its life (rises, swells, fades). s = size.
  function wisp(x, y, s, k, seed, o = {}) {
    if (k <= 0 || k >= 1) return;
    boilSeed('wsp' + seed);
    const sd = typeof seed === 'number' ? seed : [...String(seed)].reduce((a, c) => a * 1.3 + c.charCodeAt(0) % 17, 0) % 50;
    const P = [], rise = s * 3.2 * easeOut(k), drift = (o.drift ?? .6) * s * 1.6 * k;
    for (let i = 0; i <= 7; i++) { const q = i / 7; P.push([x + drift * q + Math.sin(q * 6.5 + sd * 2.1 + k * 3) * s * .55 * q, y - rise * q]); }
    const a = Math.sin(Math.PI * Math.min(1, k * 1.6)) * (k > .6 ? 1 - (k - .6) / .4 : 1);
    const T = tube(P, u => s * (.09 + .3 * Math.sin(Math.min(1, u * 1.2) * Math.PI * .85)) * (.5 + .5 * a));
    paint(T.out, { wash: o.col || Z.call, washOp: (o.op ?? 190) * a, ink: null });
    inkLine(T.C.slice(3, -2), .9 * a, o.dk || Z.callDk, 'inkfine', .6);
  }
  // a steady stream of wisps from a point: rate per second, life in seconds, a = 0..1 overall strength
  function stream(x, y, s, t, a, key, o = {}) {
    if (a <= .02) return;
    const life = o.life || 3.2, n = Math.ceil(life * (o.rate || 1.4));
    for (let i = 0; i < n; i++) {
      const ph = frac(t / life + i / n + hash(key.length + i) * .1), id = Math.floor(t / life + i / n);
      const jx = (hash(id * 13 + i) - .5) * s * (o.spread ?? .8);
      wisp(x + jx, y, s * (.7 + .4 * hash(id + i * 7)) * Math.min(1, a * 1.2), ph, key + i, { ...o, op: (o.op ?? 190) * a });
    }
  }

  // the rootworm grub: a C-shaped ivory larva with a brown head; (x, y) centre, s size, ang facing
  function grub(x, y, s, t, o = {}) {
    boilSeed('grb' + (o.key || ''));
    const P = [], wig = .15 * Math.sin(t * 5 + (o.seed || 0));
    for (let i = 0; i <= 8; i++) { const a = (o.ang || 0) + Math.PI * .1 + i / 8 * Math.PI * 1.45 + wig * i / 8; P.push([x + Math.cos(a) * s * .7, y + Math.sin(a) * s * .6]); }
    const T = tube(P, u => s * (.5 + .12 * Math.sin(u * Math.PI)));
    paint(T.out, { wash: Z.grub, fill: Z.grubDk, fillOp: 40, tex: .4, ink: PAL.ink, sw: clamp(s / 50, .5, 1) });
    for (let k = 1; k < 8; k++) { const a = along(T.C, k / 8), w = s * .33; inkLine([[a.p[0] - a.nx * w, a.p[1] - a.ny * w], [a.p[0] + a.nx * w, a.p[1] + a.ny * w]], .6, Z.grubDk, 'inkfine', .3); }
    const h = along(T.C, 1);
    paint(ellPts(h.p[0], h.p[1], s * .26, s * .24, 12), { wash: Z.grubHead, ink: PAL.ink, sw: clamp(s / 50, .5, 1) });
    return h.p;
  }
  // a nematode: a pale thread wriggling along a heading
  function nema(x, y, s, ang, t, key) {
    boilSeed('nm' + key);
    const P = []; for (let i = 0; i <= 8; i++) { const q = i / 8, w = Math.sin(q * 7 - t * 9 + key.length) * s * .1; P.push([x - Math.cos(ang) * s * q - Math.sin(ang) * w, y - Math.sin(ang) * s * q + Math.cos(ang) * w]); }
    paint(ribbon(P, s * .11, s * .05), { wash: Z.nema, ink: PAL.ink, sw: .7 });
  }
  // a ladybug, side-ish from above
  function ladybug(x, y, s, t, key) {
    boilSeed('lb' + key);
    paint(ellPts(x + s * .55, y - s * .1, s * .3, s * .26, 12), { wash: Z.wasp, ink: PAL.ink, sw: .9 });
    paint(ellPts(x, y - s * .25, s * .62, s * .48, 20), { wash: Z.ladybug, fill: '#A83A33', fillOp: 40, tex: .3, ink: PAL.ink, sw: 1 });
    inkLine([[x + s * .02, y - s * .72], [x - s * .02, y + s * .2]], .9, PAL.ink, 'ink', 0);
    [[-.3, -.4], [.25, -.45], [-.2, -.05], [.3, -.05]].forEach(([a, b], i) => paint(ellPts(x + a * s, y + b * s, s * .1, s * .09, 8), { wash: Z.wasp, ink: null }));
  }
  // a sparrow perched on a post, facing dir
  function sparrow(x, y, s, t, key, dir = 1, cock = 0) {
    boilSeed('sp' + key);
    push(); translate(x, y); scale(dir, 1); rotate(cock * .15);
    paint([[-s * 1.1, -s * .3], [-s * .4, -s * .55], [s * .2, -s * .6], [s * .55, -s * .2], [s * .3, s * .2], [-s * .4, s * .2]], { wash: Z.sparrow, fill: Z.sparrowDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1, curv: .5 });
    paint(ellPts(s * .45, -s * .75, s * .35, s * .32, 14), { wash: Z.sparrow, ink: PAL.ink, sw: 1 });
    paint(ellPts(s * .38, -s * .95, s * .26, s * .14, 10), { wash: '#8C6A4E', ink: null });
    paint([[s * .75, -s * .78], [s * 1.0, -s * .7], [s * .75, -s * .64]], { wash: '#E2B04A', ink: PAL.ink, sw: .8 });
    paint(ellPts(s * .55, -s * .78, s * .06, s * .06, 6), { wash: PAL.ink, ink: null });
    paint(ellPts(s * .1, s * .02, s * .4, s * .18, 10), { wash: PAL.cream, washOp: 160, ink: null });
    inkLine([[-s * .2, -s * .35], [-s * .7, -s * .3], [-s * 1.0, -s * .15]], .8, Z.sparrowDk, 'inkfine', .5);
    inkLine([[0, s * .2], [s * .05, s * .45]], 1.1, PAL.ink, 'ink', 0); inkLine([[s * .2, s * .18], [s * .25, s * .45]], 1.1, PAL.ink, 'ink', 0);
    pop();
  }

  // the elicitor: a fatty-acid zig-zag tail (maize green) joined to a little amino-acid bead cluster (magenta)
  function elicitor(x, y, s, ang, o = {}) {
    boilSeed('el' + (o.key || ''));
    const hiF = o.hiF || 0, hiA = o.hiA || 0, P = [];
    const c = Math.cos(ang), sn = Math.sin(ang), T = (u, v) => [x + c * u - sn * v, y + sn * u + c * v];
    for (let i = 0; i <= 9; i++) P.push(T(-i * s * .22, (i % 2 ? 1 : -1) * s * .1));
    for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]), w = s * .07 * (1 + .5 * hiF);
      if (hiF > .02) paint(ribbon([a, b], w * 2.6, w * 2.6), { wash: mixCol(Z.leafLt, PAL.cream, .4), washOp: 200 * hiF, ink: null });
      paint(ribbon([a, [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5)], b], w, w), { wash: mixCol(Z.leaf, Z.leafDk, .2), ink: PAL.ink, sw: clamp(s / 120, .4, .9) });
      paint(ellPts(b[0], b[1], w * .55, w * .55, 8), { wash: mixCol(Z.leaf, Z.leafDk, .2), ink: null }); }
    if (o.tailOnly) return T(0, 0);
    for (const [u, v, r] of [[.25, 0, .2], [.48, -.16, .15], [.5, .18, .14]]) {
      const p = T(u * s, v * s);
      paint(ellPts(p[0], p[1], r * s * (1 + .25 * hiA), r * s * (1 + .25 * hiA), 12), { wash: mixCol(Z.spit, Z.spitLt, hiA * .6), ink: PAL.ink, sw: clamp(s / 90, .5, 1) });
    }
    return T(0, 0);
  }

  // painted arrow that draws itself (k 0..1)
  function arrow(x0, y0, x1, y1, k, col, key, w = 12, o = {}) {
    if (k <= .02) return; boilSeed('arr' + key);
    const q = ease(k), ex = lerp(x0, x1, q), ey = lerp(y0, y1, q), a = Math.atan2(y1 - y0, x1 - x0), hl = w * 1.9;
    const bx = ex - Math.cos(a) * hl, by = ey - Math.sin(a) * hl, bend = o.bend || 0;
    const mx = lerp(x0, bx, .5) - Math.sin(a) * bend, my = lerp(y0, by, .5) + Math.cos(a) * bend;
    if (Math.hypot(bx - x0, by - y0) > 4) paint(ribbon([[x0, y0], [mx, my], [bx, by]], w * .8, w), { wash: col, ink: PAL.ink, sw: .9 });
    const nx = -Math.sin(a), ny = Math.cos(a);
    paint([[ex, ey], [bx + nx * w * 1.2, by + ny * w * 1.2], [bx - nx * w * 1.2, by - ny * w * 1.2]], { wash: col, ink: PAL.ink, sw: .9 });
  }
  function dots(x0, y0, x1, y1, k, col, key, r = 6, gap = 34, t = 0) {    // a dotted path that runs (the 信道)
    if (k <= .02) return; boilSeed('dt' + key);
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(d / gap);
    for (let i = 0; i <= n * k; i++) { const q = i / n, f = frac(q + t * .25); const pulseR = 1 + .5 * near(f, .5, .08);
      paint(ellPts(lerp(x0, x1, q), lerp(y0, y1, q) + Math.sin(q * 9) * 10, r * pulseR, r * pulseR, 8), { wash: col, ink: null }); }
  }
  function ringK(x, y, rx, ry, k, col = Z.gold, key = 'rg', w = 4) {
    if (k <= 0 || k >= 1) return; boilSeed('ring' + key);
    const q = 1 + .18 * easeOut(k), P = ellPts(x, y, rx * q, ry * q, 30);
    inkLine(P.concat([P[0], P[1]]), w * (1 - k * .8), col, 'ink', .5);
  }
  function holdRing(x, y, rx, ry, a, col = Z.gold, key = 'hr', w = 3) {
    if (a <= .03) return; boilSeed('hring' + key);
    const P = ellPts(x, y, rx, ry, 30); inkLine(P.concat([P[0], P[1]]), w * a, col, 'ink', .5);
  }
  function card(x, y, w, h, k, key, col = '#FBFAF3') { if (k <= .02) return; boilSeed('cd' + key); const q = backOut(k); paint(rrPts(x - w / 2 * q, y - h / 2 * q, w * q, h * q, 24), { wash: col, fill: '#E6E1D2', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 }); }
  function sun(x, y, r, t, key) {
    boilSeed('sun' + key);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .15; inkLine([[x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25], [x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6]], r / 14, Z.callDk, 'ink', 0); }
    paint(ellPts(x, y, r, r, 24), { wash: Z.sun, fill: Z.gold, fillOp: 50, tex: .3, ink: PAL.ink, sw: 1 });
  }
  function host(x, y, u, t, keys, extra = {}, key = 'ph') { const o = { ...K.act(t, keys), ...extra }; return K.swim(x, y, u, t, o, key); }

  // ================================ the field (wide: A, C, E, G) ================================
  // Screen-scale world: ground at GY, the hero plant at HX (h 860) among neighbours, far rows as soft silhouettes.
  // dayK: 0 morning haze → 1 warmer; duskK: 0..1 sunset; noonK: bright midday blue.
  const HX = 960, GY = 1010, HH = 860;
  const ROW = [-1180, -820, -470, -120, 250, 600, 1320, 1670, 2020, 2370, 2720, 3070, 3720, 4070];
  function skyCol(dayK, duskK, noonK = 0) { return mixCol(mixCol(mixCol(Z.haze, '#F1E2B8', dayK), Z.noon, noonK), Z.dusk, duskK); }
  function fieldBg(t, key, o = {}) {
    const dayK = o.dayK || 0, duskK = o.duskK || 0, noonK = o.noonK || 0, gust = o.gust || 0, sky = skyCol(dayK, duskK, noonK);
    K.wash(sky, t, { key, blob: mixCol(mixCol(Z.hazeBlob, Z.noonBlob, noonK), Z.duskBlob, duskK), rect: rectPts(-2400, -1800, W + 6400, 4200) });
    if (duskK > .05) { boilSeed('sunD' + key); glow(1560, 330, 520, Z.duskHi, duskK * .9); paint(ellPts(1560, 330, 80, 80, 24), { wash: mixCol('#F7D79A', '#F4A868', duskK), ink: null }); }
    if (noonK > .05) { boilSeed('sunN' + key); paint(ellPts(1580, 150, 70, 70, 24), { wash: mixCol(sky, '#FBEFC0', noonK), ink: null }); }
    for (let r = 0; r < 2; r++) {                                       // far rows: soft silhouettes, paler with distance
      boilSeed('row' + key + r);
      const y = GY - 210 + r * 90, c = mixCol(mixCol(Z.far, sky, .5 - r * .2), Z.duskHi, duskK * .3), sc = .3 + r * .1;
      paint(rectPts(-2400, y, W + 6400, 900), { wash: c, ink: null });
      for (let i = 0; i < 38; i++) {
        const x = -2200 + i * 210 + hash(i + r * 40) * 90 + r * 100, h = HH * sc * (.85 + .2 * hash(i + r * 9)), sway = 6 * wob(t, .12, i + r) + gust * 20;
        paint([[x - 8, y + 4], [x - 3 + sway * .5, y - h * .55], [x + sway, y - h], [x + 3 + sway * .5, y - h * .55], [x + 8, y + 4]], { wash: c, ink: null, curv: .3 });
        for (const sd of [-1, 1]) paint(ribbon([[x + sway * .4, y - h * .4], [x + sd * h * .22 + sway * .7, y - h * .55], [x + sd * h * .4 + sway, y - h * .42]], 12, 2), { wash: c, ink: null });
      }
    }
    boilSeed('gnd' + key);                                              // the ground the plants stand on
    paint(rectPts(-2400, GY - 30, W + 6400, 1600), { wash: mixCol(Z.soilLt, Z.duskHi, duskK * .25), fill: Z.soilDk, fillOp: 50, tex: .7, ink: null });
    inkLine([[-2300, GY - 28], [-200, GY - 31], [1800, GY - 27], [W + 2300, GY - 30]], 1.1, PAL.ink, 'ink', .3);
    for (let i = 0; i < 40; i++) { boilSeed('tuft' + key + i); const x = -2200 + hash(i + 40) * 6300, y = GY - 24 + hash(i + 41) * 60, bend = gust * 26 + 3 * wob(t, .4, i);
      inkLine([[x, y], [x - 4 + bend * .5, y - 18 - 10 * hash(i)], [x - 2 + bend, y - 30]], .9, Z.fieldDk, 'inkfine', .5); inkLine([[x + 7, y], [x + 10 + bend, y - 22]], .9, Z.fieldDk, 'inkfine', .3); }
  }
  // the row of plants: the hero (full colour) and its neighbours (a touch paler); o.hero passes extra options to the hero
  function field(t, key, o = {}) {
    const gust = o.gust || 0, duskK = o.duskK || 0;
    const nbr = ROW.map((x, i) => maize(x, GY - 20, HH * (.92 + .12 * hash(i + 2)), t, { key: key + 'n' + i, lite: .22 + .08 * hash(i), tint: mixCol(Z.far, Z.duskHi, duskK * .5), leafS: .52, fine: 1, sway: gust * .05 * (1 + .4 * hash(i)), ear: .8, earSide: i % 2 ? -1 : 1, ...(o.each ? o.each(i, x) : {}) }));
    const hero = maize(HX, GY - 20, HH, t, { key: key + 'hero', leafS: .52, fine: 1, ear: .9, sway: gust * .02, tint: mixCol(Z.far, Z.duskHi, duskK * .5), lite: duskK * .1, ...(o.hero || {}) });
    hero.nbr = nbr;
    return hero;
  }

  // ================================ the macro leaf (A, D, G) ================================
  // One maize blade across the frame, soft out-of-focus stalks and leaves behind. warm 0..1 (hours later), dusk 0..1.
  const BL = [-260, 800, 2250, 600, 300];                               // x0, y0, x1, y1, width
  function macroBg(t, key, o = {}) {
    const warm = o.warm || 0, duskK = o.dusk || 0, sky = mixCol(mixCol(Z.haze, '#F3DFAE', warm), Z.dusk, duskK);
    K.wash(sky, t, { key, blob: mixCol(Z.hazeBlob, Z.duskBlob, duskK), rect: rectPts(-1600, -1200, W + 3200, H + 2400) });
    if (duskK > .05) { boilSeed('mbs' + key); glow(1500, 260, 600, Z.duskHi, duskK); }
    // out of focus: pale stalks and arcs of leaves, no ink
    const soft = mixCol(mixCol(Z.far, sky, .35), Z.duskHi, duskK * .3), soft2 = mixCol(soft, Z.fieldDk, .25);
    [[-520, 150, soft], [140, 120, soft2], [1240, 170, soft], [1760, 110, soft2], [2500, 140, soft]].forEach(([x, w, c], i) => {
      boilSeed('mst' + key + i); paint(rectPts(x - w / 2 + 6 * wob(t, .05, i), -1200, w, 3400), { fill: c, fillOp: 150, bleed: .12, tex: .3, ink: null }); });
    [[[-700, 300], [100, -60], [900, 120]], [[700, 1150], [1300, 640], [2300, 760]], [[1400, -100], [2000, 260], [2600, 200]]].forEach((P, i) => {
      boilSeed('mlf' + key + i); paint(ribbon(P.map(([x, y]) => [x + 10 * wob(t, .07, i), y]), 150, 30), { fill: i === 1 ? soft2 : soft, fillOp: 140, bleed: .15, tex: .3, ink: null }); });
    K.motes(t, 10, mixCol(sky, '#FFF8E2', .6), { key });
  }
  const surfAng = (sf, u) => { const a = sf(u - .01), b = sf(u + .01); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  function onBlade(sf, u, fn) {                                        // draw fn() in the blade's frame at u; returns a world mapper
    const p = sf(u), ang = surfAng(sf, u), c = Math.cos(ang), s = Math.sin(ang);
    push(); translate(p[0], p[1]); rotate(ang); const r = fn(); pop();
    return { p, ang, r, W: ([x, y]) => [p[0] + x * c - y * s, p[1] + x * s + y * c] };
  }

  // ================================ A: the crime (0 – L3) ================================
  // macro (crawl, munch) → wide (can't run) → macro, hours later (the wasp) → the suspects → the still field
  const A_CU = .4, A_S = 120, A_PU = .63;
  function shotA(t, lt, dur) {
    K.setT(t);
    const tW0 = L(1, 3.5), tW1 = L(1, 7.3), tW2 = L(2, 10.6);           // wide from tW0 to tW1, and again from tW2
    const wide = (t >= tW0 && t < tW1) || t >= tW2;
    const gust = Math.sin(Math.PI * seg(t, L(1, 3.6), L(1, 7.4))) * (.6 + .4 * Math.sin(t * 5));
    const warm = ease(seg(t, L(1, 6.6), L(1, 8.4)));
    const munch = seg(t, L(1, 2.4), L(1, 9.5)), biteK = .2 + .75 * easeOut(munch), stung = L(1, 11.9), deadK = ease(seg(t, L(1, 13.6), L(1, 15.4)));
    if (wide) {
      // the field: first pulled back in a gust (the plant can't run), later held still and hazy (who sent the wasp?)
      const first = t < tW1;
      const c = first ? kf(t, [[tW0, [HX - 60, 560, 1.7]], [tW0 + 1.2, [HX, 600, 1.0]], [tW1, [HX, 620, .96]]], easeOut)
        : kf(t, [[tW2, [HX - 80, 520, 1.6]], [tW2 + 2.6, [HX, 560, 1.0]], [L(3, -3.2), [HX + 20, 560, .98]], [L(3, -1.9), [HX - 200, 470, 2.4]]], ease);
      cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      fieldBg(t, 'aw', { dayK: first ? 0 : warm, gust: first ? gust : 0 });
      const hero = field(t, 'aw', { gust: first ? gust : 0, hero: { bite: [2, biteK, .4, .07] } });
      if (!first) { const wp = onLeaf(hero.leaves[2], .34).p; stream(wp[0], wp[1] - 4, 30, t, .6, 'aww', { rate: .7, life: 4, op: 130 }); }
      // Pip, a speck on the hero's leaf: the question mark stays
      const pl = onLeaf(hero.leaves[2], .26).p;
      pip(pl[0], pl[1], 6, { ...pipFeel(first ? 'worried' : 'confused', t), flip: true, key: 'paw' });
      camEnd();
      if (first && t < tW0 + .3) flash(1 - (t - tW0) / .3, '#FBF6E6');
      if (!first && t < tW2 + .3) flash(1 - (t - tW2) / .3, '#FBF6E6');
      if (lt > dur - .5) flash(Math.sin(Math.PI * clamp((lt - (dur - .5)) / 1.0)) * 1.1, '#FBF6E6');
      return;
    }
    // ---- macro ----
    const back = t >= tW1;                                              // after the wide: hours later
    const c = !back ? kf(t, [[0, [900, 560, 1.12]], [tW0 - .4, [880, 560, 1.22]], [tW0, [860, 540, .9]]], ease)
      : kf(t, [[tW1, [940, 520, 1.25]], [tW1 + 1.2, [960, 520, 1.0]], [L(2, 6.3), [940, 520, 1.0]], [L(2, 7.5), [-120, 380, 1.15]], [L(2, 8.6), [-120, 380, 1.15]],
        [L(2, 9.4), [2350, 420, 1.15]], [L(2, 10.2), [2380, 430, 1.15]], [tW2, [2500, 300, .7]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    macroBg(t, 'am', { warm: back ? warm : 0 });
    // the ladybug's leaf (upper left) and the sparrow's fence post (far right): the suspects
    const sfL = blade(-900, 330, 420, 250, 170, t, { key: 'aml', sag: 30, col: mixCol(Z.leaf, Z.leafLt, .2) });
    onBlade(sfL, .55 + .02 * Math.sin(t * .5), () => ladybug(0, -2, 58, t, 'alb'));
    boilSeed('post'); paint(rectPts(2330, 470, 70, 900), { wash: '#B08A63', fill: '#8C6A48', fillOp: 50, tex: .6, ink: PAL.ink, sw: 1 });
    inkLine([[2000, 600], [2700, 590]], 2, '#8C6A48', 'ink', 0);
    sparrow(2365, 468, 64, t, 'asp', -1, near(t, L(2, 9.8), .4));
    const sf = blade(...BL, t, { key: 'amb', bite: { at: A_CU - .07, k: biteK, w: .07 } });
    // the caterpillar: crawls out along the blade, munches the edge, is stung, shudders, goes grey
    const cu = A_CU + .05 * (1 - ease(seg(t, 0, L(1, 2.2))));
    const cr = onBlade(sf, cu, () => caterpillar(0, 0, A_S, t, { key: 'ca', dir: -1, crawl: Math.min(t, L(1, 2.4)) * 1.1,
      munch: t > L(1, 2.4) && t < stung ? Math.abs(Math.sin((t - L(1, 2.4)) * 5)) : 0, squirm: Math.sin(Math.PI * seg(t, stung, L(1, 13.6))) * 1.2, dead: deadK * .75 }));
    const head = cr.W(cr.r.head), backPt = cr.W([cr.r.mid[0], cr.r.mid[1] - A_S * .32]);
    if (back) { const wq = sf(A_CU + .06); stream(wq[0], wq[1] - 6, 70, t, .5 * seg(t, tW1 + .4, tW1 + 2.5), 'amw', { rate: .6, life: 4.2, op: 120, drift: .9 }); }
    // Pip, on the same blade nearer the stalk, watching
    const pb = sf(A_PU), pa = surfAng(sf, A_PU);
    const o = K.act(t, [[0, 'worried', { lookX: -.8, lookY: .3 }], [L(1, 2.6), 'worried', { lookX: -.9, lookY: .5, blush: .3 }], [tW1, 'calm', { lookX: -.7, lookY: .3 }],
      [L(1, 9.3), 'wow', { lookX: .6, lookY: -.9, take: .8 }], [L(1, 11.9), 'wow', { lookX: -.8, lookY: .3, take: 1 }], [L(1, 13.9), 'sad', { lookX: -.8, lookY: .5 }],
      [L(2, .3), 'confused', { lookX: .8, lookY: -.8 }], [L(2, 3.4), 'wow', { lookX: .5, lookY: -.4, take: .9 }], [L(2, 6.6), 'confused', { lookX: -.9, lookY: -.7 }],
      [L(2, 9.2), 'confused', { lookX: .9, lookY: -.5 }]]);
    const lookR = (t > L(1, 9.3) && t < L(1, 11.9)) || (t > L(2, .3) && t < L(2, 6.6)) || t > L(2, 9.2);
    pip(pb[0], pb[1] + 4, 34, { ...o, flip: !lookR, rot: (o.rot || 0) + pa * .6, key: 'pa' });
    // the wasp: arrives on an arc, taps with its antennae, curls and stings, leaves
    const tIn = L(1, 9.0), tLand = L(1, 10.4), tOff = L(1, 13.0);
    if (t > tIn && t < L(1, 14.8)) {
      const land = [backPt[0] + 14, backPt[1] - 40];
      let wp, fly = 1, curl = 0, tap = 0, dir = -1, rot = 0;
      if (t < tLand) { const k = seg(t, tIn, tLand); wp = arcPt([land[0] + 1100, land[1] - 650], land, -200, easeOut(k)); rot = .25 * (1 - k); fly = k > .92 ? 1 - (k - .92) / .08 : 1; }
      else if (t < tOff) { wp = land; fly = 0; tap = near(t, L(1, 10.8), .25) + near(t, L(1, 11.25), .2); curl = Math.sin(Math.PI * seg(t, L(1, 11.5), L(1, 12.7))); }
      else { const k = seg(t, tOff, L(1, 14.8)); wp = arcPt(land, [land[0] + 1300, land[1] - 800], 200, easeIn(k)); dir = 1; rot = -.3 * k; }
      wasp(wp[0], wp[1] + 2 * Math.sin(t * 30) * (fly ? 1 : 0), 84, t, { key: 'wa', dir, fly, curl, tap, rot });
      K.burst(land[0] - 30, land[1] + 40, 60, seg(t, stung, stung + .45), PAL.ink, 'ast');
    }
    camEnd();
    if (lt < .8) { const at = toScreen(head[0], head[1]); iris(at[0], at[1], lerp(0, 1700, easeIn(lt / .8))); }
    if (back && t < tW1 + .3) flash(1 - (t - tW1) / .3, '#FBF6E6');
    if (!back && t > tW0 - .25) flash((t - (tW0 - .25)) / .25, '#FBF6E6');
    if (t > tW2 - .25) flash((t - (tW2 - .25)) / .25, '#FBF6E6');
  }

  // ================================ props for the boards ================================
  function scissors(x, y, s, ang, open, key) {
    boilSeed('sc' + key); push(); translate(x, y); rotate(ang);
    for (const sg of [-1, 1]) { push(); rotate(sg * open * .35);
      paint([[0, -s * .06], [s * 1.0, -s * .02], [s * 1.0, s * .02], [0, s * .06]], { wash: '#C9CDD3', ink: PAL.ink, sw: .8 });
      paint(ellPts(-s * .35, sg * s * .16, s * .2, s * .13, 12), { wash: '#D97757', ink: PAL.ink, sw: .8 }); pop(); }
    pop();
  }
  function minibrush(x, y, ang, s, load, key) {                     // a small brush; the tip is loaded with caterpillar spit
    boilSeed('mbr' + key); push(); translate(x, y); rotate(ang);
    paint(ribbon([[-s * .8, 0], [0, 0], [s * .5, 0]], s * .07, s * .05), { wash: '#B5583E', ink: PAL.ink, sw: .8 });
    paint(ribbon([[s * .5, 0], [s * .7, 0], [s * .9, 0]], s * .11, s * .02), { wash: mixCol('#E9DCC0', Z.spit, load), ink: PAL.ink, sw: .8 });
    pop();
  }
  const boardBg = (t, key, col = Z.inside, blob = Z.insideBlob) => { K.wash(col, t, { key, blob, rect: rectPts(-2400, -1800, W + 4800, H + 4800) }); K.motes(t, 10, mixCol(col, Z.leafDk, .2), { key }); };
  // a short horizontal leaf piece (cards and diagrams): a blade from x0 to x1 with a wound at u
  const leafPiece = (x0, y0, x1, y1, w, t, key, o = {}) => blade(x0, y0, x1, y1, w, t, { key, sag: 8, sw: 1, ...o });
  // a leaf cell, boxy, with chloroplasts; mood gives it a small face when it reacts
  function plantCell(x, y, w, h, t, key, o = {}) {
    boilSeed('pc' + key);
    paint(rrPts(x - w / 2, y - h / 2, w, h, 18, 1.5), { wash: mixCol(Z.cell, '#F6E7A8', o.alert || 0), fill: Z.cellDk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.2 });
    for (let i = 0; i < 7; i++) { const a = hash(i + key.length * 3) * TAU, r = .32 + .1 * hash(i + 7);
      paint(rotEll(x + Math.cos(a) * w * r, y + Math.sin(a) * h * r, 13, 8, 10, a + 1), { wash: mixCol(Z.leaf, Z.leafDk, .2), ink: PAL.ink, sw: .6 }); }
    if (o.notch) { boilSeed('pcn' + key); const nx = x + o.notch, ny = y - h / 2;               // the receptor: a cupped notch in the top wall
      paint([[nx - 30, ny + 2], [nx - 26, ny - 22], [nx - 14, ny - 22], [nx - 12, ny - 6], [nx + 12, ny - 6], [nx + 14, ny - 22], [nx + 26, ny - 22], [nx + 30, ny + 2]], { wash: mixCol(Z.spitLt, Z.cell, .45), ink: PAL.ink, sw: 1 }); }
    if (o.mood) K.face(x, y + 10, 40, t, { mood: o.mood, seed: key.length });
  }

  // ================================ B: the tell (L3 – L6) ================================
  // B1 the food chain (camera starts close on the caterpillar) → B2 the scissors experiment (two cards below)
  // → B3 one molecule, at cell scale → B4 the loop: leaf → mouth → gut → spit → wound
  const FC = { sun: [330, 430], mz: [840, 830], cat: [1450, 600] };
  function shotB(t, lt, dur) {
    K.setT(t);
    const tB3 = L(5, -.6), tB4 = L(6, 1.4);
    if (t < tB3) {
      const c = kf(t, [[L(3, -1.9), [1440, 560, 2.4]], [L(3, 2.6), [1440, 580, 1.9]], [L(3, 4.4), [960, 560, 1.0]], [L(4, -1.0), [960, 560, 1.0]], [L(4, .3), [960, 1640, 1.0]],
        [L(4, 11.2), [960, 1640, 1.0]], [L(5, -1.0), [1380, 1590, 2.6]], [tB3, [1400, 1585, 4.2]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      boardBg(t, 'b');
      // ---- B1: the food chain ----
      const chainK = seg(t, L(3, 4.4), L(3, 6.4));
      sun(...FC.sun, 70 * popK(t, L(3, 4.6), .5), t, 'b'); 
      const mzK = popK(t, L(3, 5.0), .5);
      if (mzK > .02) { push(); translate(FC.mz[0], FC.mz[1]); scale(mzK); maize(0, 0, 560, t, { key: 'bmz', leafS: .5, ear: .8 }); pop(); }
      ringK(FC.mz[0], FC.mz[1] - 300, 190, 320, seg(t, L(3, 6.8), L(3, 8.3)), Z.gold, 'bm');
      arrow(FC.sun[0] + 100, FC.sun[1] + 10, FC.mz[0] - 150, FC.sun[1] + 30, seg(t, L(3, 5.2), L(3, 6.0)), Z.callLt, 'ba1');
      arrow(FC.mz[0] + 170, 560, FC.cat[0] - 230, 590, seg(t, L(3, 6.2), L(3, 7.0)), Z.leafLt, 'ba2');
      const sfc = leafPiece(1180, 640, 1760, 612, 110, t, 'bcl', { bite: { at: .3, k: .7, w: .1 } });
      const cr = onBlade(sfc, .55, () => caterpillar(0, 0, 100, t, { key: 'bc', dir: -1, crawl: .3, munch: t > L(3, 9.2) && t < L(3, 13.2) ? Math.abs(Math.sin(t * 5)) : 0 }));
      ringK(cr.W(cr.r.mid)[0] - 10, cr.W(cr.r.mid)[1] - 10, 220, 110, seg(t, L(3, 1.0), L(3, 2.6)), Z.gold, 'bc0');
      ringK(cr.W(cr.r.mid)[0] - 10, cr.W(cr.r.mid)[1] - 10, 220, 110, seg(t, L(3, 9.0), L(3, 10.5)), Z.gold, 'bc1');
      // the energy: a gold bead from the sun into the maize, then along the chain into the caterpillar's mouth
      for (let j = 0; j < 3; j++) {
        const k = seg(t, L(3, 10.6 + j * .7), L(3, 12.4 + j * .7));
        if (k > 0 && k < 1) { const P = k < .45 ? arcPt([FC.sun[0] + 60, FC.sun[1] + 40], [FC.mz[0] - 30, FC.mz[1] - 330], -60, k / .45) : arcPt([FC.mz[0] - 30, FC.mz[1] - 330], cr.W(cr.r.head), -80, (k - .45) / .55);
          boilSeed('bead' + j); glow(P[0], P[1], 60, Z.gold, .7); paint(ellPts(P[0], P[1], 20, 20, 12), { wash: Z.gold, ink: PAL.ink, sw: .8 }); }
      }
      // ---- B2: the experiment, two cards below ----
      const cy = 1640, cardK = popK(t, L(4, -.4), .5), cardK2 = popK(t, L(4, .1), .5);
      card(560, cy, 760, 560, cardK, 'bk1'); card(1360, cy, 760, 560, cardK2, 'bk2');
      if (cardK > .5) {
        const cutL = seg(t, L(4, 3.2), L(4, 3.5)), cutR = seg(t, L(4, 7.9), L(4, 8.2));
        const s1 = leafPiece(260, cy + 60, 860, cy + 40, 150, t, 'bk1l', { bite: { at: .5, k: cutL * .9, w: .09 } });
        const s2 = leafPiece(1060, cy + 60, 1660, cy + 40, 150, t, 'bk2l', { bite: { at: .5, k: cutR * .9, w: .09 } });
        // left: scissors snip → a thin pair of wisps
        const scL = seg(t, L(4, 2.0), L(4, 4.6));
        if (scL > 0 && scL < 1) { const p = s1(.5); scissors(p[0] - 30 + 200 * (1 - easeOut(seg(scL, 0, .4))) + 240 * easeIn(seg(scL, .75, 1)), p[1] - 50 - 200 * (1 - easeOut(seg(scL, 0, .4))), 120, .5, Math.abs(Math.sin(scL * 18)) * (scL < .7 ? 1 : 0), 'bs1'); }
        const w1 = s1(.5); stream(w1[0], w1[1] + 10, 50, t, .55 * seg(t, L(4, 4.9), L(4, 5.8)), 'bw1', { rate: .7, life: 3.4, spread: .5 });
        // right: snip, then a brush dabs spit on the wound → a burst of wisps
        const scR = seg(t, L(4, 7.4), L(4, 9.1));
        if (scR > 0 && scR < 1) { const p = s2(.5); scissors(p[0] - 30 + 200 * (1 - easeOut(seg(scR, 0, .4))) + 240 * easeIn(seg(scR, .75, 1)), p[1] - 50 - 200 * (1 - easeOut(seg(scR, 0, .4))), 120, .5, Math.abs(Math.sin(scR * 18)) * (scR < .7 ? 1 : 0), 'bs2'); }
        const br = seg(t, L(4, 9.3), L(4, 11.6)), wd = s2(.5);
        if (br > 0 && br < 1) { const dip = Math.sin(Math.PI * seg(br, .25, .75)); minibrush(wd[0] + 150 - 120 * dip + 300 * easeIn(seg(br, .8, 1)), wd[1] - 140 + 110 * dip - 200 * (1 - easeOut(seg(br, 0, .25))), 2.3, 140, 1 - seg(br, .5, .7) * .6, 'bbr'); }
        const spit = seg(t, L(4, 10.2), L(4, 10.6));
        if (spit > 0) { boilSeed('bsp'); paint(ellPts(wd[0], wd[1] + 26, 44 * spit, 16 * spit, 14), { wash: Z.spit, washOp: 200, ink: PAL.ink, sw: .7 }); }
        const big = seg(t, L(4, 11.8), L(4, 12.5));
        for (let j = 0; j < 5; j++) stream(wd[0] - 90 + j * 45, wd[1] + 8, 56, t + j * .7, big * (.7 + .3 * hash(j)), 'bw2' + j, { rate: .8, life: 3.0, spread: .6 });
        // small painted counts under each card: two marks vs many (no text)
        for (let j = 0; j < 2; j++) { const q = backOut(seg(t, L(4, 6.0 + j * .2), L(4, 6.3 + j * .2))); if (q > .05) { boilSeed('bd1' + j); paint(ellPts(530 + j * 60, cy + 210, 16 * q, 16 * q, 10), { wash: Z.call, ink: PAL.ink, sw: .7 }); } }
        for (let j = 0; j < 9; j++) { const q = backOut(seg(t, L(4, 12.6 + j * .1), L(4, 12.9 + j * .1))); if (q > .05) { boilSeed('bd2' + j); paint(ellPts(1140 + j * 55, cy + 210, 16 * q, 16 * q, 10), { wash: Z.call, ink: PAL.ink, sw: .7 }); } }
      }
      // Pip hosts from the bottom left (moves down with the camera)
      const py = kf(t, [[0, 900], [L(4, -1.0), 900], [L(4, .3), 1980]], ease);
      host(150, py, 32, t, [[0, 'calm', { lookX: .8, lookY: -.2 }], [L(3, 6.4), 'idea', { lookX: .7, lookY: -.5 }], [L(3, 10.4), 'calm', { lookX: .9, lookY: -.3 }],
        [L(4, .6), 'calm', { lookX: .8 }], [L(4, 5.4), 'confused', { lookX: .8, lookY: -.3 }], [L(4, 12.4), 'wow', { lookX: .9, lookY: -.3, take: 1 }]], { talk: true }, 'pb');
      camEnd();
      if (lt < .5) flash(1 - lt / .5, '#FBF6E6');
      if (t > tB3 - .3) flash((t - (tB3 - .3)) / .3, '#FBF6E6');
      return;
    }
    if (t < tB4) {
      // ---- B3: cell scale. A magenta film of spit over a row of leaf cells; one molecule floats out, halves named, docks ----
      const c = kf(t, [[tB3, [960, 520, 1.15]], [tB3 + 1.6, [960, 540, 1.0]], [L(5, 7.5), [960, 560, 1.0]], [L(5, 9.4), [960, 580, 1.15]], [tB4, [980, 560, 1.1]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      boardBg(t, 'b3', Z.inside, Z.insideBlob);
      boilSeed('b3film'); paint([[-300, 640], [600, 610 + 10 * wob(t, .2)], [1300, 625], [2300, 600], [2300, 700], [-300, 720]], { wash: Z.spitLt, washOp: 150, ink: null, curv: .5 });
      const docked = seg(t, L(5, 8.4), L(5, 9.0)), alert = seg(t, L(5, 9.0), L(5, 9.6));
      for (let i = 0; i < 6; i++) plantCell(-100 + i * 330, 900, 300, 300, t, 'bpc' + i, i === 3 ? { notch: 0, alert, mood: t > L(5, 9.1) ? 'wow' : 'calm' } : {});
      // the molecule: rises out of the film, turns to face us, its halves pulse; then sinks into the receptor
      const rise = easeOut(seg(t, tB3 + .4, L(5, 2.6))), sink = ease(seg(t, L(5, 7.6), L(5, 8.6)));
      const mx = lerp(lerp(980, 960, rise), 890, sink), my = lerp(lerp(640, 400, rise), 900 - 150 - 14, sink), ma = lerp(0, -Math.PI / 2, sink);
      for (let j = 0; j < 7; j++) { const q = hash(j + 3), px = 200 + j * 250 + 30 * wob(t, .2, j), py = 650 + 30 * Math.sin(t * .8 + j); if (Math.abs(px - 960) > 160) elicitor(px, py, 40, .3 * Math.sin(t * .5 + j), { key: 'bem' + j }); }
      elicitor(mx, my, 230 * (1 - .55 * sink), ma, { key: 'bE', hiF: near(t, L(5, 4.0), .55), hiA: near(t, L(5, 6.0), .55) });
      K.burst(890, 900 - 150 - 10, 80, seg(t, L(5, 9.0), L(5, 9.5)), Z.spit, 'bdk');
      // the cell's thought: a little caterpillar in a bubble
      const thK = seg(t, L(5, 11.6), L(5, 12.2));
      if (thK > 0) { boilSeed('bth'); const q = backOut(thK); paint(ellPts(990, 700, 22 * q, 16 * q, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 }); paint(ellPts(1070, 610, 34 * q, 26 * q, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
        paint(ellPts(1290, 430, 220 * q, 140 * q, 36, 4), { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 }); if (q > .6) caterpillar(1390, 475, 66, t, { key: 'bthc', dir: 1, crawl: t * .9 }); }
      host(330, 420, 32, t, [[tB3, 'calm', { lookX: .8, lookY: -.4 }], [L(5, 3.4), 'wow', { lookX: .8, lookY: -.6 }], [L(5, 5.6), 'calm', { lookX: .8, lookY: -.5 }], [L(5, 9.2), 'wow', { lookX: .9, lookY: -.1, take: .9 }], [L(5, 11.8), 'idea', { lookX: .9, lookY: -.4 }]], { talk: true }, 'pb3');
      camEnd();
      if (t < tB3 + .3) flash(1 - (t - tB3) / .3, '#FBF6E6');
      if (t > tB4 - .3) brushWipe((t - (tB4 - .3)) / .6, [Z.leafLt, Z.inside]);
      return;
    }
    // ---- B4: the loop. The fatty-acid tail comes from the leaf the caterpillar ate, joins the amino acid in its gut, comes back out as spit ----
    const c = kf(t, [[tB4, [900, 600, 1.08]], [L(6, 8.0), [880, 620, 1.14]], [L(7, -1.6), [700, 640, 1.3]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    boardBg(t, 'b4');
    const sf = leafPiece(-200, 700, 2100, 650, 230, t, 'b4l', { bite: { at: .3, k: .7, w: .06 } });
    const wound = sf(.3);
    // the gut: a dotted path inside the caterpillar, mouth → hind gut and back
    let gut = null;
    const cr = onBlade(sf, .47, () => caterpillar(0, 0, 230, t, { key: 'b4c', dir: -1, crawl: .3, munch: t > L(6, 3.6) && t < L(6, 6.2) ? Math.abs(Math.sin(t * 5)) : 0,
      inside: (T, wf) => { gut = T.C.map(p => p.slice()); boilSeed('gut'); paint(ribbon(T.C.slice(2, -1), 30, 40), { wash: mixCol(Z.stripe, Z.cat, .25), washOp: 200, ink: mixCol(Z.catDk, Z.cat, .3), sw: .8 }); } }));
    const G = gut ? gut.map(cr.W) : null, mouth = cr.W(cr.r.head);
    // molecules inside the leaf (green tails), then a stream of them into the mouth and along the gut; magenta beads join; back out as spit
    for (let j = 0; j < 6; j++) {
      const t0 = L(6, 3.4) + j * .35, k1 = seg(t, t0, t0 + 1.0), k2 = seg(t, t0 + 1.0, t0 + 2.4), k3 = seg(t, t0 + 2.4, t0 + 3.4), k4 = seg(t, L(6, 6.9) + j * .1, L(6, 7.8) + j * .1);
      const home = [wound[0] - 160 + j * 60, wound[1] + 50 + (j % 2) * 30];
      let p = home, full = false;
      if (k1 > 0) p = arcPt(home, mouth, -70, ease(k1));
      if (k2 > 0 && G) { const n = G.length - 1, f = ease(k2) * n * .7, i = Math.floor(f); p = [lerp(G[n - i][0], G[Math.max(0, n - i - 1)][0], f - i), lerp(G[n - i][1], G[Math.max(0, n - i - 1)][1], f - i)]; }
      if (k3 > 0 && G) { const n = G.length - 1, f = (1 - ease(k3)) * n * .7, i = Math.floor(f); p = [lerp(G[n - i][0], G[Math.max(0, n - i - 1)][0], f - i), lerp(G[n - i][1], G[Math.max(0, n - i - 1)][1], f - i)]; full = true; }
      if (k3 >= 1) { p = arcPt(mouth, [wound[0] - 60 + j * 22, wound[1] + 28], -40, ease(k4)); full = true; }
      if (t < L(6, 1.0) && j > 0) continue;
      elicitor(p[0], p[1], 78, -.2 + .3 * Math.sin(t + j), { key: 'b4m' + j, tailOnly: !full, hiF: t < L(6, 3.4) ? near(t, L(6, 2.4), .6) : 0 });
    }
    const drop = seg(t, L(6, 7.6), L(6, 8.0));
    if (drop > 0) { boilSeed('b4sp'); paint(ellPts(wound[0] - 20, wound[1] + 34, 90 * drop, 24 * drop, 16), { wash: Z.spit, washOp: 170, ink: PAL.ink, sw: .7 }); }
    // the loop arrow over the top
    K.burst(wound[0], wound[1] + 10, 80, seg(t, L(6, 8.2), L(6, 8.7)), Z.spit, 'b4b');
    host(1540, 400, 32, t, [[tB4, 'calm', { lookX: -.8, lookY: .4 }], [L(6, 3.8), 'wow', { lookX: -.7, lookY: .6 }], [L(6, 8.4), 'laugh']], { talk: true, flip: true }, 'pb4');
    camEnd();
    if (t < tB4 + .3) brushWipe(.5 + (t - tB4) / .6, [Z.leafLt, Z.inside]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#BFDCE6', Z.noon]);
  }

  // ================================ C: the call (L7 – L9) ================================
  // C1 inside the alarmed cell: amber droplets made and let out → C2 the field at midday: the plume, 信息源 → 信道 →
  // 信息受体 (the wasp on a post) → C3 the wasp flies upwind through the plume to the one plant
  const PLUME = x => GY - 560 - 70 * Math.sin((x - HX) * .004) - (x - HX) * .04;    // the plume's centreline height
  function plume(t, a, key, x0 = HX - 120, x1 = 3900) {
    if (a <= .02) return;
    const N = 46;
    for (let i = 0; i < N; i++) {
      const ph = frac(t * .045 + i / N), x = lerp(x0, x1, ph), k = clamp(ph * 6) * clamp((1 - ph) * 4);
      const y = PLUME(x) + 90 * Math.sin(i * 2.3 + t * .5) * (.3 + ph);
      wisp(x, y + 60, 50 + 36 * ph, .25 + .5 * frac(t * .25 + hash(i)), key + i, { op: 215 * a * k, drift: 1.6 });
    }
  }
  function postAt(x, key) { boilSeed('pst' + key); paint(rectPts(x - 30, GY - 470, 60, 480), { wash: '#B08A63', fill: '#8C6A48', fillOp: 50, tex: .6, ink: PAL.ink, sw: 1 }); paint(rrPts(x - 38, GY - 486, 76, 26, 8), { wash: '#C29A70', ink: PAL.ink, sw: 1 }); }
  const POST = 3350;
  function shotC(t, lt, dur) {
    K.setT(t);
    const tC2 = L(7, 6.4), tC3 = L(9, -.3);
    if (t < tC2) {
      // ---- C1: inside the cell ----
      const c = kf(t, [[L(7, -1.6), [960, 560, 1.12]], [L(7, 2.0), [960, 540, 1.0]], [tC2, [960, 420, 1.15]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      boardBg(t, 'c1');
      boilSeed('c1c'); paint(rrPts(560, 330, 800, 560, 60, 2), { wash: '#F2EBC0', fill: Z.cellDk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.6 });
      paint([[880, 336], [880, 300], [1040, 300], [1040, 336]], { wash: mixCol(Z.inside, '#FBF4D8', .3), ink: null });        // the pore in the wall
      for (let i = 0; i < 9; i++) { const a = hash(i + 50) * TAU; paint(rotEll(960 + Math.cos(a) * 280 * hash(i + 2), 640 + Math.sin(a) * 160 * hash(i + 3), 30, 18, 12, a), { wash: mixCol(Z.leaf, Z.leafDk, .2), ink: PAL.ink, sw: .8 }); }
      K.face(960, 700, 70, t, { mood: 'determined', seed: 2 });
      // droplets: bud inside (staggered), drift to the pore, leave as wisps
      for (let j = 0; j < 14; j++) {
        const t0 = L(7, 1.4) + j * .32, k = seg(t, t0, t0 + .4), m = seg(t, t0 + .6, t0 + 2.2), out = seg(t, t0 + 2.2, t0 + 4.2);
        if (k <= 0) continue;
        const home = [700 + hash(j + 9) * 520, 470 + hash(j + 19) * 300], pore = [960 + (hash(j) - .5) * 100, 330];
        if (out <= 0) { const p = arcPt(home, pore, 60, ease(m)); boilSeed('c1d' + j); paint(ellPts(p[0], p[1], 28 * backOut(k), 28 * backOut(k), 12), { wash: Z.call, ink: PAL.ink, sw: .8 }); }
        else wisp(pore[0], pore[1], 80, out * .9, 'c1w' + j, { drift: .2 });
      }
      host(220, 900, 32, t, [[L(7, -1.6), 'calm', { lookX: .8, lookY: -.3 }], [L(7, 2.2), 'wow', { lookX: .8, lookY: -.4 }], [L(7, 4.4), 'calm', { lookX: .7, lookY: -.7 }]], { talk: true }, 'pc1');
      camEnd();
      if (lt < .3) brushWipe(.5 + lt / .6, ['#BFDCE6', Z.noon]);
      if (t > tC2 - .3) brushWipe((t - (tC2 - .3)) / .6, ['#BFDCE6', Z.noon]);
      return;
    }
    if (t < tC3) {
      // ---- C2: the field at midday ----
      const c = kf(t, [[tC2, [HX + 120, 600, 1.05]], [L(7, 9.0), [HX + 150, 560, .92]], [L(8, 5.6), [HX + 300, 560, .9]], [L(8, 7.8), [HX + 1400, 560, .62]], [L(8, 9.4), [HX + 1400, 560, .62]], [L(8, 11.4), [POST - 40, GY - 560, 1.7]], [tC3, [POST - 40, GY - 560, 1.8]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      fieldBg(t, 'c2', { noonK: 1 });
      // the hero puffs: first the bitten leaf, then every leaf in turn (even the unbitten ones)
      const hero = field(t, 'c2', { hero: { bite: [2, .9, .4, .07] } });
      const bitten = onLeaf(hero.leaves[2], .34).p;
      stream(bitten[0], bitten[1], 46, t, seg(t, tC2 + .1, tC2 + 1.0), 'c2b', { rate: 1.1, life: 3.4, drift: 1.4 });
      hero.leaves.forEach((lf, i) => { if (i === 2) return; const p = onLeaf(lf, .32).p, k = seg(t, L(7, 9.0) + i * .25, L(7, 9.6) + i * .25); stream(p[0], p[1], 38, t + i, k * .9, 'c2l' + i, { rate: .8, life: 3.4, drift: 1.4 }); ringK(p[0], p[1] - 10, 60, 40, k, Z.call, 'c2r' + i, 3); });
      plume(t, seg(t, L(7, 8.8), L(7, 11.5)), 'c2p');
      postAt(POST, 'c2');
      // 信息源 → 信道 → 信息受体
      holdRing(HX, GY - 430, 280, 470, Math.min(seg(t, L(8, 5.0), L(8, 5.6)), 1 - seg(t, L(8, 7.0), L(8, 7.6))), Z.gold, 'c2src', 4);
      dots(HX + 250, PLUME(HX + 250) + 40, POST - 120, GY - 520, seg(t, L(8, 6.0), L(8, 7.6)), Z.callDk, 'c2ch', 9, 46, t);
      const land = [POST + 4, GY - 512];
      holdRing(land[0], land[1] - 20, 110, 80, seg(t, L(8, 9.6), L(8, 10.2)), Z.gold, 'c2rx', 4);
      wasp(land[0], land[1] - 22, 70, t, { key: 'cw', dir: -1, tap: .4 * Math.max(0, Math.sin(t * 2)), wingUp: .1 * near(t, L(8, 11.8), .4) });
      // Pip on the ground by the hero, watching the plume go
      const pk = K.act(t, [[tC2, 'wow', { lookX: -.6, lookY: -.8 }], [L(7, 9.6), 'calm', { lookX: .6, lookY: -.7 }], [L(8, 2.0), 'idea', { lookX: .5, lookY: -.6 }], [L(8, 7.8), 'calm', { lookX: .9, lookY: -.4 }], [L(8, 11.6), 'wow', { lookX: .9, lookY: -.3, take: .9 }]]);
      pip(HX + 360, GY - 16, 30, { ...pk, key: 'pc2' });
      camEnd();
      if (t < tC2 + .3) brushWipe(.5 + (t - tC2) / .6, ['#BFDCE6', Z.noon]);
      if (t > tC3 - .3) flash((t - (tC3 - .3)) / .3, '#FBF6E6');
      return;
    }
    // ---- C3: the flight. The camera rides with the wasp, right → left, upwind, along the plume, over the field ----
    const fk = seg(t, tC3, L(10, -2.0)), wx = lerp(POST - 120, HX - 210, ease(fk)), amp = 160 * (1 - fk) * (Math.sin(fk * 18) > .3 ? 1 : .4);
    const wy = lerp(GY - 560, onLeaf({ C: [[HX - 600, GY - 640], [HX - 100, GY - 640]], W0: 2 }, .5).p[1] - 40, ease(seg(fk, .82, 1))) + amp * Math.sin(fk * 26) * (fk < .82 ? 1 : 0);
    const zoom = kf(t, [[tC3, .55], [tC3 + 2.5, .55], [tC3 + 3.6, 1.05], [L(10, -3.0), 1.05], [L(10, -1.6), 1.6]], ease);
    cam(wx - 120 + 6 * wob(t, .05), wy + 150 + 5 * wob(t, .04), zoom);
    fieldBg(t, 'c3', { noonK: 1 });
    const hero = field(t, 'c3', { hero: { bite: [2, .9, .4, .07] } });
    plume(t, 1, 'c3p');
    const bitten = onLeaf(hero.leaves[2], .34).p;
    stream(bitten[0], bitten[1], 46, t, 1, 'c3b', { rate: 1.1, life: 3.4, drift: 1.4 });
    postAt(POST, 'c3');
    // speed lines behind the wasp
    for (let i = 0; i < 4; i++) { boilSeed('c3sl' + i); const yy = wy - 30 + i * 22, l = 120 + 60 * hash(i + Math.floor(t * 12)); inkLine([[wx + 90, yy], [wx + 90 + l, yy + 4]], .8, mixCol(PAL.cream, Z.noon, .3), 'inkfine', 0); }
    const dive = seg(fk, .82, 1);
    wasp(wx, wy + 3 * Math.sin(t * 30), lerp(56, 64, seg(t, tC3 + 2.5, tC3 + 3.6)), t, { key: 'cw3', dir: -1, fly: 1, rot: .15 * Math.cos(fk * 26) * (1 - dive) - .35 * dive });
    // Pip runs along the ground under it
    const px = wx + 160, pk = K.act(t, [[tC3, 'excited'], [L(9, 5.0), 'excited', { lookX: -.8, lookY: -.6 }], [L(9, 8.6), 'wow', { lookX: -.8, lookY: -.3, take: .8 }]]);
    pip(px, GY - 16, 30, { ...pk, walk: t * 3.2, flip: true, dy: (pk.dy || 0) - .25 * Math.abs(Math.sin(t * 6.4)), key: 'pc3' });
    camEnd();
    if (t < tC3 + .3) flash(1 - (t - tC3) / .3, '#FBF6E6');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [Z.leafLt, Z.haze]);
  }

  // ================================ D: the kill (L10 – L13) ================================
  // D1 macro: the landing, the taps, the sting, eggs inside (cutaway), 寄生 (+/−), days pass, larvae, cocoons
  // → D2 the plant: a fuller ear, new wasps leave → D3 recap on the cream board
  const D_CU = .42, D_S = 150;
  function cocoon(x, y, s, k, open, key) {                              // a small white silk cocoon; open lifts its cap
    if (k <= .02) return; boilSeed('coc' + key); const q = backOut(k);
    paint(ellPts(x, y, s * q, s * .55 * q, 14), { wash: '#F8F3E6', fill: '#DCD3BF', fillOp: 40, tex: .5, ink: PAL.ink, sw: .7 });
    for (let i = 0; i < 3; i++) inkLine([[x - s * .7 * q, y - s * .2 + i * s * .2], [x + s * .7 * q, y - s * .25 + i * s * .2]], .5, '#CFC6B0', 'inkfine', .5);
    if (open > 0) paint(ellPts(x + s * .9, y - s * .3 - open * s * .6, s * .3, s * .4, 10), { wash: '#F8F3E6', ink: PAL.ink, sw: .6 });
  }
  function shotD(t, lt, dur) {
    K.setT(t);
    const tD2 = L(12, -.6), tD3 = L(13, -1.2);
    if (t < tD2) {
      const c = kf(t, [[L(10, -1.6), [1100, 420, 1.5]], [L(10, 1.6), [980, 500, 1.15]], [L(10, 5.0), [880, 520, 1.25]], [L(10, 9.0), [880, 520, 1.25]], [L(10, 9.8), [960, 480, 1.0]], [L(11, -.4), [960, 500, 1.0]],
        [L(11, 1.0), [860, 560, 1.3]], [L(11, 11.6), [860, 560, 1.3]], [tD2, [960, 470, .9]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      // days pass (一周多以后): the sky dips toward dusk-blue and back, again and again
      const days = seg(t, L(11, 4.6), L(11, 9.2)), dayDip = days > 0 && days < 1 ? .55 * Math.pow(Math.sin(days * Math.PI * 6), 2) : 0;
      macroBg(t, 'd', { warm: .6 });
      if (dayDip > .01) flash(dayDip * .55, '#55618A');
      const tLand = L(10, 0), stung = L(10, 6.0);
      const chew = 1 - .75 * seg(t, L(11, 5.6), L(11, 7.6));            // parasitised: it eats less and less
      const sf = blade(...BL, t, { key: 'db', bite: { at: D_CU - .08, k: .35 + .35 * easeOut(seg(t, L(10, -2), L(11, 9))), w: .06 } });
      const hatch = seg(t, L(11, .2), L(11, 1.4)), grow = seg(t, L(11, 1.6), L(11, 9.0)), out = seg(t, L(11, 9.3), L(11, 10.5)), deadK = ease(seg(t, L(11, 10.8), L(11, 12.2)));
      const cutK = Math.min(seg(t, L(10, 6.4), L(10, 7.2)), 1 - seg(t, L(11, 10.2), L(11, 10.8)));
      const cr = onBlade(sf, D_CU, () => caterpillar(0, 0, D_S, t, { key: 'dc', dir: -1, crawl: .4 + (t < stung ? t * .2 : 0),
        munch: t < L(11, 9) ? Math.abs(Math.sin(t * 5)) * chew : 0, squirm: Math.sin(Math.PI * seg(t, stung, stung + 1.2)) + .3 * grow * (1 - out) * Math.max(0, Math.sin(t * 3)), dead: deadK * .7,
        inside: (T, wf) => {                                             // the cutaway: a window into the body
          if (cutK <= .02) return;
          const m = along(T.C, .52), r = wf(.52) * .38 * cutK;
          boilSeed('dcut'); paint(ellPts(m.p[0], m.p[1], r * 2.2, r, 20), { wash: mixCol('#F2C9B8', Z.cat, .25), ink: PAL.ink, sw: .8 });
          for (let j = 0; j < 7; j++) {
            const ex = m.p[0] + (j - 3) * r * .55, ey = m.p[1] + (j % 2 ? .3 : -.3) * r, eg = seg(t, L(10, 7.0) + j * .1, L(10, 7.4) + j * .1);
            if (hatch < 1) paint(ellPts(ex, ey, r * .22 * backOut(eg), r * .14 * backOut(eg), 10), { wash: '#FBF6E8', ink: PAL.ink, sw: .5 });
            else { const wig = Math.sin(t * 6 + j) * .3, gl = r * (.3 + .25 * grow); paint(ribbon([[ex - gl, ey + wig * 4], [ex, ey - wig * 4], [ex + gl, ey + wig * 4]], r * (.12 + .1 * grow), r * .06), { wash: '#FBF6E8', ink: PAL.ink, sw: .5 }); }
          }
        } }));
      // cocoons along its side once the larvae are out
      for (let j = 0; j < 6; j++) { const p = cr.W([-D_S * (.5 + j * .28), D_S * .2 + (j % 2) * 10]); cocoon(p[0], p[1] + 8, 20, seg(t, L(11, 9.8) + j * .12, L(11, 10.2) + j * .12), 0, 'dco' + j); }
      const backPt = cr.W([cr.r.mid[0], cr.r.mid[1] - D_S * .32]);
      // the wasp: lands (cut on action from C), taps twice, curls, stings; then flies off
      if (t < L(10, 10.6)) {
        const land = [backPt[0] + 14, backPt[1] - 46];
        let wp = land, fly = 0, rot = 0, dir = -1;
        if (t < tLand) { const k = seg(t, L(10, -1.6), tLand); wp = arcPt([land[0] + 500, land[1] - 300], land, -80, easeOut(k)); fly = 1; rot = -.35 * (1 - k); }
        if (t > L(10, 9.0)) { const k = seg(t, L(10, 9.0), L(10, 10.6)); wp = arcPt(land, [land[0] + 1300, land[1] - 800], 220, easeIn(k)); fly = 1; dir = 1; rot = -.3 * k; }
        wasp(wp[0], wp[1], 100, t, { key: 'dw', dir, fly, rot, tap: near(t, L(10, 2.2), .25) + near(t, L(10, 3.0), .25), curl: Math.sin(Math.PI * seg(t, L(10, 5.2), L(10, 7.6))) });
        K.burst(land[0] - 140, land[1] + 70, 40, seg(t, L(10, 2.2), L(10, 2.6)), PAL.ink, 'dt1'); K.burst(land[0] - 150, land[1] + 70, 40, seg(t, L(10, 3.0), L(10, 3.4)), PAL.ink, 'dt2');
        K.burst(land[0] - 20, land[1] + 70, 60, seg(t, stung, stung + .45), PAL.ink, 'dst');
      }
      // 寄生: wasp (+) → caterpillar (−), small icons up top
      const iK = Math.min(popK(t, L(10, 8.4), .4), 1 - seg(t, L(11, -.6), L(11, 0)));
      if (iK > .02) { push(); translate(960, 210); scale(iK); wasp(-300, 0, 80, t, { key: 'diw' }); caterpillar(380, 40, 80, t, { key: 'dic', dir: -1 }); pop();
        arrow(960 - 150, 200, 960 + 120, 210, seg(t, L(10, 8.8), L(10, 9.4)) * iK, Z.spitLt, 'dia', 16);
        K.charge('+', 960 - 300, 80, 50, popK(t, L(10, 10.2), .35) * iK, Z.green, 'dpl'); K.charge('-', 960 + 280, 80, 50, popK(t, L(10, 10.6), .35) * iK, Z.red, 'dmi'); }
      // Pip on the blade, watching through its fingers
      const pb = sf(.62), pa = surfAng(sf, .62);
      const o = K.act(t, [[L(10, -1.6), 'wow', { lookX: -.8, lookY: .1 }], [L(10, 5.4), 'shy', { lookX: -.8, lookY: .2 }], [L(10, 9.6), 'calm', { lookX: -.4, lookY: -.8 }], [L(11, 1.2), 'worried', { lookX: -.8, lookY: .3 }], [L(11, 7.0), 'sad', { lookX: -.8, lookY: .4 }], [L(11, 10.6), 'wow', { lookX: -.8, lookY: .3, take: .8 }]]);
      pip(pb[0], pb[1] + 4, 34, { ...o, flip: true, rot: (o.rot || 0) + pa * .6, key: 'pd' });
      camEnd();
      if (lt < .3) brushWipe(.5 + lt / .6, [Z.leafLt, Z.haze]);
      if (t > tD2 - .3) flash((t - (tD2 - .3)) / .3, '#FBF6E6');
      return;
    }
    if (t < tD3) {
      // ---- D2: the plant. Leaves whole, the ear fills out, new wasps leave for the next plant ----
      const c = kf(t, [[tD2, [HX + 60, 640, 1.45]], [L(12, 4.6), [HX + 40, 620, 1.3]], [L(12, 8.6), [HX + 60, 600, 1.15]], [tD3, [HX + 300, 520, 1.0]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      fieldBg(t, 'd2', { noonK: .7, dayK: .4 });
      const fill = seg(t, L(12, 5.4), L(12, 7.4));
      const hero = field(t, 'd2', { hero: { bite: [2, .35, .4, .05], kernels: fill, ear: 1 + .25 * fill } });
      if (hero.ear) { ringK(hero.ear[0], hero.ear[1], 70, 110, seg(t, L(12, 7.4), L(12, 8.6)), Z.gold, 'd2e'); if (fill > .5) K.sparkle(hero.ear[0] + 40, hero.ear[1] - 60, 22, seg(t, L(12, 7.3), L(12, 8.1)), '#FFF3C4'); }
      // the old caterpillar and its cocoons on the leaf; three new wasps lift off toward the far field
      const lp = onLeaf(hero.leaves[2], .4);
      push(); translate(lp.p[0], lp.p[1]); rotate(lp.ang); caterpillar(0, 0, 40, t, { key: 'd2c', dir: -1, dead: .7 }); for (let j = 0; j < 4; j++) cocoon(-12 - j * 16, 8, 7, 1, seg(t, L(12, 9.0) + j * .25, L(12, 9.4) + j * .25), 'd2o' + j); pop();
      for (let j = 0; j < 3; j++) { const k = seg(t, L(12, 9.2) + j * .35, L(12, 12.0) + j * .35); if (k > 0 && k < 1) { const p = arcPt([lp.p[0] - 20 - j * 16, lp.p[1] - 10], [lp.p[0] + 1200 + j * 140, lp.p[1] - 520 + j * 80], 180, easeIn(k)); wasp(p[0], p[1], 24, t, { key: 'd2w' + j, fly: 1, dir: 1, rot: -.25 }); } }
      const pk = K.act(t, [[tD2, 'calm', { lookX: .3, lookY: -.6 }], [L(12, 3.2), 'smug', { lookX: .4, lookY: -.6 }], [L(12, 7.4), 'excited'], [L(12, 9.4), 'happy', { lookX: .8, lookY: -.6 }]]);
      pip(HX + 120, GY - 16, 30, { ...pk, key: 'pd2' });
      camEnd();
      if (t < tD2 + .3) flash(1 - (t - tD2) / .3, '#FBF6E6');
      if (t > tD3 - .3) brushWipe((t - (tD3 - .3)) / .6, ['#E8D8B0', Z.board]);
      return;
    }
    // ---- D3: the recap. caterpillar → (spit) → maize → (scent) → wasp ----
    const c = kf(t, [[tD3, [960, 540, 1.04]], [L(14, -1.6), [960, 540, 1.0]]], ease);
    cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    boardBg(t, 'd3', Z.board, Z.boardBlob);
    const P1 = [400, 560], P2 = [960, 640], P3 = [1520, 520];
    const all = near(t, L(13, 10.9), .5);
    caterpillar(P1[0] + 150, P1[1] + 40, 125 * (1 + .12 * all), t, { key: 'd3c', dir: 1, crawl: t * .3 });
    maize(P2[0], P2[1] + 260, 680 * (1 + .06 * all), t, { key: 'd3m', leafS: .5, ear: .9 });
    wasp(P3[0] + 40, P3[1], 120 * (1 + .12 * all), t, { key: 'd3w', dir: -1, tap: .2 * Math.max(0, Math.sin(t * 2)) });
    const a1 = seg(t, L(13, 2.4), L(13, 3.4)), a2 = seg(t, L(13, 6.0), L(13, 7.0));
    arrow(P1[0] + 190, P1[1] - 30, P2[0] - 170, P2[1] - 150, a1, Z.spitLt, 'd3a1', 20);
    arrow(P2[0] + 170, P2[1] - 170, P3[0] - 170, P3[1] + 10, a2, Z.callLt, 'd3a2', 20);
    if (a1 > .5) { boilSeed('d3sp'); const q = backOut(seg(t, L(13, 2.9), L(13, 3.3))), x = lerp(P1[0] + 170, P2[0] - 150, .5), y = lerp(P1[1] - 20, P2[1] - 140, .5) - 50; paint([[x, y - 26 * q], [x + 16 * q, y + 6 * q], [x, y + 20 * q], [x - 16 * q, y + 6 * q]], { wash: Z.spit, ink: PAL.ink, sw: .8, curv: .6 }); }
    if (a2 > .5) { const x = lerp(P2[0] + 150, P3[0] - 150, .5), y = lerp(P2[1] - 160, P3[1] + 10, .5) - 30; for (let j = 0; j < 3; j++) wisp(x - 40 + j * 40, y, 40, .35 + .3 * frac(t * .3 + j * .33), 'd3w' + j); }
    ringK(P1[0] + 20, P1[1], 170, 110, seg(t, L(13, 2.4), L(13, 3.6)), Z.gold, 'd3r1'); ringK(P2[0], P2[1] - 80, 170, 280, seg(t, L(13, 3.6), L(13, 4.8)), Z.gold, 'd3r2');
    ringK(P3[0] - 20, P3[1], 150, 110, seg(t, L(13, 7.4), L(13, 8.6)), Z.gold, 'd3r3');
    host(200, 960, 32, t, [[tD3, 'calm', { lookX: .8, lookY: -.5 }], [L(13, 10.6), 'happy']], { talk: true }, 'pd3');
    camEnd();
    if (t < tD3 + .3) brushWipe(.5 + (t - tD3) / .6, ['#E8D8B0', Z.board]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#9FC7B4', Z.after]);
  }

  // ================================ E: the ecosystem (L14 – L16) ================================
  // E1 late-afternoon field: the scent drifts over the neighbours, which get ready (gold); one is bitten and answers at
  // once → E2 the board: three species in a ring, a balance that settles → E3 two curves chasing each other (负反馈)
  function balance(x, y, s, tilt, key) {
    boilSeed('bal' + key);
    paint([[x - s * .1, y + s * .9], [x, y], [x + s * .1, y + s * .9]], { wash: '#B08A63', ink: PAL.ink, sw: 1 });
    paint(rrPts(x - s * .4, y + s * .86, s * .8, s * .12, 6), { wash: '#B08A63', ink: PAL.ink, sw: 1 });
    const c = Math.cos(tilt), sn = Math.sin(tilt), e = [[x - c * s, y - sn * s], [x + c * s, y + sn * s]];
    inkLine(e, 2.4, '#7A5A3E', 'ink', 0);
    for (const [px, py] of e) { inkLine([[px, py], [px - s * .25, py + s * .4]], .8, PAL.ink, 'inkfine', 0); inkLine([[px, py], [px + s * .25, py + s * .4]], .8, PAL.ink, 'inkfine', 0);
      paint([[px - s * .32, py + s * .4], [px + s * .32, py + s * .4], [px + s * .2, py + s * .52], [px - s * .2, py + s * .52]], { wash: '#C9A27A', ink: PAL.ink, sw: .9 }); }
    paint(ellPts(x, y, s * .07, s * .07, 10), { wash: Z.gold, ink: PAL.ink, sw: .8 });
    return e;
  }
  function shotE(t, lt, dur) {
    K.setT(t);
    const tE2 = L(15, -.8);
    if (t < tE2) {
      const c = kf(t, [[L(14, -1.6), [1250, 600, .92]], [L(14, 8.6), [1420, 600, .9]], [L(14, 10.0), [1640, 600, 1.2]], [tE2, [1660, 590, 1.25]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      fieldBg(t, 'e', { dayK: .7, duskK: .22 });
      const primed = i => ROW[i] > HX ? seg(t, L(14, 3.6) + (ROW[i] - HX) / 800, L(14, 4.6) + (ROW[i] - HX) / 800) : 0;
      const hero = field(t, 'e', { duskK: .22, hero: { bite: [2, .9, .4, .07] }, each: i => ({ tint: mixCol(Z.far, '#EEC66A', primed(i)), lite: .22 + .15 * primed(i) }) });
      const bp = onLeaf(hero.leaves[2], .34).p;
      stream(bp[0], bp[1], 60, t, 1, 'eb', { rate: 1.2, life: 5.5, drift: 3.4 });
      ROW.forEach((x, i) => { const k = primed(i); if (k > 0 && k < 1) K.sparkle(x + 30, GY - 560, 34, k, '#FFF0B8'); });
      // a caterpillar crawls onto the primed neighbour at 1670; it puffs at once, big
      const nb = hero.nbr[ROW.indexOf(1670)], crawl = seg(t, L(14, 8.0), L(14, 9.8));
      if (nb && crawl > 0) { const lp = onLeaf(nb.leaves[1], lerp(.75, .5, ease(crawl))); push(); translate(lp.p[0], lp.p[1]); rotate(lp.ang); caterpillar(0, -2, 50, t, { key: 'ec', dir: -1, crawl: t * 1.2, munch: t > L(14, 9.8) ? Math.abs(Math.sin(t * 5)) : 0 }); pop();
        const big = seg(t, L(14, 10.0), L(14, 10.5)); for (let j = 0; j < 4; j++) { const q = onLeaf(nb.leaves[j], .3).p; stream(q[0], q[1], 64, t + j, big, 'enb' + j, { rate: 1.3, life: 3.4, drift: 1 }); }
        K.burst(lp.p[0], lp.p[1] - 40, 70, seg(t, L(14, 10.0), L(14, 10.5)), Z.callDk, 'enbb'); }
      const pk = K.act(t, [[L(14, -1.6), 'calm', { lookX: .8, lookY: -.6 }], [L(14, 3.4), 'wow', { lookX: .8, lookY: -.5 }], [L(14, 7.8), 'calm', { lookX: .9, lookY: -.6 }], [L(14, 10.4), 'love']]);
      pip(1180, GY - 16, 30, { ...pk, key: 'pe' });
      camEnd();
      if (lt < .3) brushWipe(.5 + lt / .6, ['#9FC7B4', Z.after]);
      if (t > tE2 - .3) brushWipe((t - (tE2 - .3)) / .6, ['#9FC7B4', Z.after]);
      return;
    }
    const tE3 = L(16, -.7);
    const c = kf(t, [[tE2, [960, 540, 1.04]], [tE3, [960, 540, 1.0]], [L(17, -1.6), [960, 560, 1.03]]], ease);
    cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    boardBg(t, 'e2', Z.after, Z.afterBlob);
    if (t < tE3) {
      // ---- E2: the ring of three and a balance that rocks, then settles level ----
      const R = [[960, 300], [1300, 640], [620, 640]], rk = i => popK(t, tE2 + .4 + i * .3, .45);
      if (rk(0) > .02) { push(); translate(R[0][0], R[0][1] + 150); scale(rk(0)); maize(0, 0, 320, t, { key: 'e2m', leafS: .5, ear: .8 }); pop(); }
      if (rk(1) > .02) caterpillar(R[1][0] + 90, R[1][1] + 20, 70 * rk(1), t, { key: 'e2c', dir: -1, crawl: t * .3 });
      if (rk(2) > .02) wasp(R[2][0], R[2][1], 70 * rk(2), t, { key: 'e2w', dir: 1 });
      const ak = seg(t, L(15, 2.4), L(15, 4.6));
      arrow(1060, 330, 1270, 540, seg(ak, 0, .35), Z.leafLt, 'e2a1', 12, { bend: -40 });
      arrow(1180, 720, 760, 720, seg(ak, .33, .68), Z.spitLt, 'e2a2', 12, { bend: -50 });
      arrow(620, 560, 860, 330, seg(ak, .66, 1), Z.callLt, 'e2a3', 12, { bend: -40 });
      const bk = popK(t, L(15, 4.8), .5), tilt = .35 * Math.sin((t - L(15, 4.8)) * 3.2) * Math.exp(-Math.max(0, t - L(15, 4.8)) * .55);
      if (bk > .02) { push(); translate(960, 870); scale(bk); balance(0, 0, 150, t < L(15, 4.8) ? 0 : tilt, 'e2b'); pop(); }
      K.sparkle(960, 840, 36, seg(t, L(15, 8.4), L(15, 9.2)), '#FFF3C4');
      for (let i = 0; i < 3; i++) ringK(R[i][0] + (i === 0 ? 0 : 0), R[i][1] + (i === 0 ? 0 : 0), 140, 110, seg(t, L(15, 9.6) + i * .5, L(15, 10.8) + i * .5), Z.gold, 'e2r' + i);
      host(200, 960, 32, t, [[tE2, 'calm', { lookX: .8, lookY: -.5 }], [L(15, 8.0), 'happy'], [L(15, 10.4), 'calm', { lookX: .8, lookY: -.4 }]], { talk: true }, 'pe2');
      camEnd();
      if (t < tE2 + .3) brushWipe(.5 + (t - tE2) / .6, ['#9FC7B4', Z.after]);
      if (t > tE3 - .3) flash((t - (tE3 - .3)) / .3, '#F4F8F2');
      return;
    }
    // ---- E3: two curves. Caterpillars rise → more calls → wasps rise (lagging) → caterpillars fall. A loop with a minus ----
    const X0 = 380, X1 = 1650, Y0 = 640, A = 170, PER = 900;
    const draw = kf(t, [[tE3 + .3, 0], [L(16, 2.6), .28], [L(16, 5.4), .5], [L(16, 8.8), .78], [L(16, 10.5), 1]], x => x);
    boilSeed('e3ax'); inkLine([[X0 - 20, Y0 + A + 60], [X1 + 40, Y0 + A + 60]], 1.2, mixCol(PAL.ink, Z.after, .4), 'ink', 0);
    const curve = (lag, amp) => x => Y0 - amp * Math.sin((x - X0) / PER * TAU - lag);
    const cg = curve(0, A), cw = curve(Math.PI / 2, A * .7);
    const path = (f, k) => { const P = []; const xe = lerp(X0, X1, k); for (let x = X0; x <= xe; x += 24) P.push([x, f(x)]); P.push([xe, f(xe)]); return P; };
    if (draw > .01) { boilSeed('e3g'); inkLine(path(cg, draw), 3, Z.leafDk, 'ink', .4); boilSeed('e3w'); inkLine(path(cw, draw), 3, Z.waspDk, 'ink', .4); }
    const xe = lerp(X0, X1, draw);
    if (draw > .01) { caterpillar(xe + 30, cg(xe) + 10, 40, t, { key: 'e3c', dir: 1, crawl: t * 1.4 }); wasp(xe + 10, cw(xe) - 10, 44, t, { key: 'e3wi', dir: 1, fly: 1 }); }
    // the beats: the green peak lights, calls rise from it, the wasp peak lights, the green falls
    const gPeak = X0 + PER * .25, wPeak = X0 + PER * .5;
    holdRing(gPeak, cg(gPeak), 60, 60, Math.min(seg(t, L(16, 1.0), L(16, 1.6)), 1 - seg(t, L(16, 7.0), L(16, 7.6))), Z.leafLt, 'e3p1', 3);
    for (let j = 0; j < 3; j++) wisp(gPeak - 40 + j * 40, cg(gPeak) - 50, 40, seg(t, L(16, 2.6) + j * .3, L(16, 5.6) + j * .3), 'e3s' + j);
    holdRing(wPeak, cw(wPeak), 60, 60, Math.min(seg(t, L(16, 4.6), L(16, 5.2)), 1 - seg(t, L(16, 9.4), L(16, 10))), Z.gold, 'e3p2', 3);
    const fall = X0 + PER * .62; arrow(fall, cg(fall) - 120, fall + 70, cg(fall) + 20, seg(t, L(16, 7.0), L(16, 7.8)), Z.red, 'e3dn', 10);
    // the loop: a circular arrow with a minus in it
    const lk = seg(t, L(16, 9.3), L(16, 10.4));
    if (lk > 0) { boilSeed('e3l'); const P = []; for (let i = 0; i <= 30 * lk; i++) { const a = -Math.PI / 2 + i / 30 * TAU * .85; P.push([1500 + Math.cos(a) * 110, 260 + Math.sin(a) * 110]); } if (P.length > 2) inkLine(P, 3, Z.red, 'ink', .4);
      if (lk >= 1) { const a = -Math.PI / 2 + TAU * .85; arrow(1500 + Math.cos(a - .15) * 110, 260 + Math.sin(a - .15) * 110, 1500 + Math.cos(a) * 110, 260 + Math.sin(a) * 110, 1, Z.red, 'e3la', 10); }
      K.charge('-', 1500, 260, 70, popK(t, L(16, 10.2), .4), Z.red, 'e3m'); }
    host(200, 960, 32, t, [[tE3, 'calm', { lookX: .8, lookY: -.5 }], [L(16, 2.8), 'wow', { lookX: .8, lookY: -.6 }], [L(16, 6.6), 'calm', { lookX: .9, lookY: -.4 }], [L(16, 10.2), 'idea']], { talk: true }, 'pe3');
    camEnd();
    if (t < tE3 + .3) flash(1 - (t - tE3) / .3, '#F4F8F2');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#7A5A3E', Z.under]);
  }

  // ================================ F: underground and on the farm (L17 – L19) ================================
  const SY = 330;                                                        // the soil surface in the cross-section
  function soilBg(t, key, o = {}) {
    K.wash(Z.under, t, { key, blob: Z.underBlob, rect: rectPts(-1600, -1200, W + 3200, H + 2600) });
    boilSeed('sky' + key); paint(rectPts(-1600, -1400, W + 3200, 1400 + SY), { wash: mixCol(Z.sky, Z.dusk, o.dusk || .2), ink: null });
    boilSeed('far' + key); paint(rectPts(-1600, SY - 120, W + 3200, 130), { wash: mixCol(Z.far, Z.dusk, .2), ink: null });
    for (let i = 0; i < 18; i++) { const x = -1400 + i * 300 + hash(i) * 80; paint([[x - 10, SY - 110], [x + 4 * wob(t, .1, i), SY - 330], [x + 10, SY - 110]], { wash: mixCol(Z.far, Z.dusk, .25), ink: null }); }
    boilSeed('srf' + key); paint(rectPts(-1600, SY - 12, W + 3200, 40), { wash: Z.soilLt, ink: null }); inkLine([[-1500, SY - 12], [W + 1500, SY - 10]], 1.2, PAL.ink, 'ink', .3);
    for (let i = 0; i < 40; i++) { boilSeed('pb' + key + i); const x = -1400 + hash(i + 3) * 4700, y = SY + 60 + hash(i + 4) * 1400, r = 8 + 16 * hash(i + 5);
      paint(ellPts(x, y, r, r * .7, 9), { wash: mixCol(Z.soilDk, Z.under, .4), ink: null }); }
    K.motes(t, 10, mixCol(Z.under, Z.soilLt, .5), { key });
  }
  // crown roots from a stalk base: pale ribbons with laterals. o.chew = [rootIndex, 0..1] makes that root ragged. Returns tips.
  function roots(x, y, s, t, key, o = {}) {
    const R = [[-2.2, 1], [-1.85, 1.15], [-1.45, 1.2], [-1.15, 1.1], [-.95, 1.1], [-.7, 1.05]].map(([a, l]) => [a - Math.PI / 2 * 0 + Math.PI, l]);
    const tips = [];
    [[2.55, 1], [2.2, 1.15], [1.85, 1.25], [1.3, 1.25], [.95, 1.15], [.6, 1]].forEach(([a, l], i) => {
      boilSeed('rt' + key + i);
      const P = []; for (let k = 0; k <= 5; k++) { const q = k / 5, aa = a + .25 * Math.sin(q * 3 + i); P.push([x + Math.cos(aa) * s * l * q + 6 * Math.sin(k + i), y + Math.sin(aa) * s * l * q * 1.1]); }
      const ch = o.chew && o.chew[0] === i ? o.chew[1] : 0;
      let rb = ribbon(P, s * .07, s * .02);
      if (ch > 0) rb = rb.map((p, j) => { const u = (j % (rb.length / 2)) / (rb.length / 2); return Math.abs(u - .55) < .15 ? [p[0] + (hash(j) - .5) * 14 * ch, p[1] + (hash(j + 1) - .5) * 14 * ch] : p; });
      paint(rb, { wash: ch > .5 ? '#D9C9A0' : '#EADDB8', fill: '#C9B489', fillOp: 40, tex: .4, ink: PAL.ink, sw: .9 });
      for (let k = 1; k < 4; k++) { const b = P[k + 1], sd = (k + i) % 2 ? 1 : -1; inkLine([b, [b[0] + sd * s * .14, b[1] + s * .12], [b[0] + sd * s * .22, b[1] + s * .3]], 1.1, '#D9C9A0', 'ink', .5); }
      tips.push(P);
    });
    return tips;
  }
  function seep(x, y, t, a, key) {                                       // scent seeping through soil: glow + expanding amber rings of dots
    if (a <= .02) return;
    glow(x, y, 220, Z.call, .5 * a);
    for (let r = 0; r < 3; r++) { const ph = frac(t * .35 + r / 3), rr = 40 + ph * 260; boilSeed('sp' + key + r);
      for (let i = 0; i < 14; i++) { const an = i / 14 * TAU + r; paint(ellPts(x + Math.cos(an) * rr, y + Math.sin(an) * rr * .8, 6, 6, 6), { wash: Z.callLt, washOp: 220 * a * (1 - ph), ink: null }); } }
  }
  function dna(x, y, s, ang, key) {                                      // a short flat double helix (two strands + rungs)
    boilSeed('dna' + key); push(); translate(x, y); rotate(ang);
    const A = [], B = []; for (let i = 0; i <= 16; i++) { const u = (i / 16 - .5) * s, v = Math.sin(i / 16 * TAU * 1.5) * s * .13; A.push([u, v]); B.push([u, -v]); if (i % 2 === 0) inkLine([[u, v], [u, -v]], 1.2, i % 4 ? Z.call : Z.spitLt, 'ink', 0); }
    inkLine(A, 2.6, '#5B8FD6', 'ink', .5); inkLine(B, 2.6, '#E2708C', 'ink', .5);
    pop();
  }
  function sprayCloud(x, y, s, t, a, key) {
    if (a <= .02) return; boilSeed('spc' + key);
    for (let i = 0; i < 7; i++) paint(ellPts(x + (i - 3) * s * .32 + 10 * wob(t, .3, i), y + 20 * Math.sin(i * 1.7), s * .32, s * .24, 14), { wash: '#B9BFAF', washOp: 200 * a, fill: '#8E9583', fillOp: 40 * a, tex: .4, ink: null });
    for (let i = 0; i < 10; i++) { const ph = frac(t * .8 + hash(i)); paint(ellPts(x - s + hash(i + 2) * s * 2, y + s * .3 + ph * s, 5, 8, 6), { wash: '#9AA392', washOp: 220 * a * (1 - ph), ink: null }); }
  }
  function shotF(t, lt, dur) {
    K.setT(t);
    const tF2 = L(18, -.6), tF3 = L(19, -.7);
    if (t < tF2) {
      // ---- F1: one plant's roots; a grub chews; the root seeps; nematodes home in ----
      const c = kf(t, [[L(17, -1.6), [960, 380, 1.0]], [L(17, 1.6), [960, 380, 1.0]], [L(17, 3.6), [920, 590, 1.0]], [tF2, [900, 600, 1.04]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      soilBg(t, 'f1');
      maize(960, SY, 860, t, { key: 'f1m', leafS: .52, fine: 1, ear: .9 });
      const chew = seg(t, L(17, 3.4), L(17, 11.0));
      const tips = roots(960, SY + 10, 520, t, 'f1r', { chew: [1, chew] });
      const gp = tips[1][3];
      const kill = seg(t, L(17, 10.6), L(17, 11.2));
      seep(gp[0], gp[1], t, seg(t, L(17, 6.0), L(17, 7.6)), 'f1s');
      grub(gp[0] - 40, gp[1] + 40, 80, t * (1 - kill), { key: 'f1g', ang: -.3 });
      for (let j = 0; j < 4; j++) { const k = seg(t, L(17, 8.2) + j * .2, L(17, 10.8) + j * .1), from = [j % 2 ? 2300 : -400, 600 + j * 180], to = [gp[0] - 40 + (j % 2 ? 50 : -50), gp[1] + 40 + (j - 1.5) * 26];
        if (k > 0) { const p = [lerp(from[0], to[0], ease(k)), lerp(from[1], to[1], ease(k)) + 40 * Math.sin(k * 7 + j)]; nema(p[0], p[1], 170, Math.atan2(to[1] - from[1], to[0] - from[0]), t, 'f1n' + j); } }
      K.burst(gp[0] - 40, gp[1] + 40, 90, kill, Z.callLt, 'f1k');
      const pk = K.act(t, [[L(17, -1.6), 'calm', { lookX: -.6, lookY: .8 }], [L(17, 3.6), 'worried', { lookX: -.6, lookY: .9 }], [L(17, 7.0), 'wow', { lookX: -.7, lookY: .9 }], [L(17, 11.0), 'excited']]);
      pip(1360, SY - 6, 30, { ...pk, flip: true, key: 'pf1' });
      camEnd();
      if (lt < .3) brushWipe(.5 + lt / .6, ['#7A5A3E', Z.under]);
      if (t > tF2 - .3) flash((t - (tF2 - .3)) / .3, '#F3E6CF');
      return;
    }
    if (t < tF3) {
      // ---- F2: two plants. Left still calls; right lost it (silent, chewed, ✗). A gene goes back in → it calls → ✓ ----
      const c = kf(t, [[tF2, [960, 520, .82]], [L(18, 6.0), [980, 540, .84]], [L(18, 7.0), [1300, 640, 1.05]], [tF3, [1260, 620, 1.0]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      soilBg(t, 'f2');
      const gene = seg(t, L(18, 6.6), L(18, 8.0)), back = seg(t, L(18, 8.4), L(18, 9.2));
      for (const [x, k, works] of [[480, 'L', 1], [1440, 'R', back]]) {
        maize(x, SY, 820, t, { key: 'f2m' + k, leafS: .5, fine: 1, ear: .9, lite: k === 'L' ? .1 : 0 });
        const chew = k === 'R' ? seg(t, tF2, L(18, 9.0)) * (1 - .0) : .25;
        const tips = roots(x, SY + 10, 460, t, 'f2r' + k, { chew: [1, chew] });
        const gp = tips[1][3];
        seep(gp[0], gp[1], t, works * (k === 'L' ? seg(t, tF2, tF2 + 1) : 1), 'f2s' + k);
        grub(gp[0] - 30, gp[1] + 40, 66, t, { key: 'f2g' + k, ang: -.3 });
        if (works > .5) for (let j = 0; j < 3; j++) { const k2 = k === 'L' ? .6 + .4 * Math.sin(t * .4 + j) * .1 : seg(t, L(18, 9.0) + j * .3, L(18, 10.8) + j * .2); const from = [gp[0] + (j - 1) * 300, gp[1] + 500], to = [gp[0] - 30 + (j - 1) * 50, gp[1] + 90];
          nema(lerp(from[0], to[0], ease(k2)), lerp(from[1], to[1], ease(k2)), 140, -Math.PI / 2 + (j - 1) * .3, t, 'f2n' + k + j); }
        if (k === 'R') { K.cross(gp[0] + 120, gp[1] - 120, 90, seg(t, L(18, 5.6), L(18, 6.2)) * (1 - seg(t, L(18, 10.4), L(18, 10.7))), 'f2x'); K.check(gp[0] + 120, gp[1] - 120, 100, seg(t, L(18, 10.8), L(18, 11.4)), 'f2c'); }
      }
      if (gene > 0 && gene < 1) { const p = arcPt([2100, -100], [1440, SY + 120], -150, ease(gene)); dna(p[0], p[1], 180, gene * 3, 'f2d'); glow(p[0], p[1], 160, Z.gold, .5); }
      K.burst(1440, SY + 120, 110, seg(t, L(18, 8.0), L(18, 8.5)), Z.gold, 'f2gb');
      const pk = K.act(t, [[tF2, 'calm', { lookX: .5, lookY: .7 }], [L(18, 4.6), 'sad', { lookX: .6, lookY: .7 }], [L(18, 7.6), 'wow', { lookX: .7, lookY: .6 }], [L(18, 10.8), 'happy']]);
      pip(960, SY - 6, 30, { ...pk, key: 'pf2' });
      camEnd();
      if (t < tF2 + .3) flash(1 - (t - tF2) / .3, '#F3E6CF');
      if (t > tF3 - .3) flash((t - (tF3 - .3)) / .3, '#FBF6E6');
      return;
    }
    // ---- F3: the farm. A spray cloud gets ✗; the wasp and the nematode get ✓ ----
    const c = kf(t, [[tF3, [HX, 600, 1.0]], [L(20, -3.0), [HX, 560, .98]], [L(20, -1.6), [HX + 300, 120, .9]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    fieldBg(t, 'f3', { dayK: .8, duskK: .45 });
    field(t, 'f3', { duskK: .45 });
    const sp = seg(t, tF3, L(19, 2.0)), fade = seg(t, L(19, 7.2), L(19, 8.4));
    sprayCloud(lerp(-200, 520, easeOut(sp)), 330, 300, t, sp * (1 - fade * .85), 'f3s');
    K.cross(520, 330, 220, seg(t, L(19, 6.8), L(19, 7.3)), 'f3x');
    // the allies: a wasp hovering, a nematode in a soil bubble
    wasp(1420, 360 + 10 * Math.sin(t * 2), 70, t, { key: 'f3w', dir: -1, fly: 1 });
    boilSeed('f3b'); const bq = popK(t, L(19, 3.4), .45); if (bq > .02) { paint(ellPts(1700, 640, 130 * bq, 110 * bq, 30), { wash: Z.under, fill: Z.underBlob, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 }); if (bq > .6) nema(1760, 640, 140, 0, t, 'f3n'); }
    K.check(1470, 250, 90, seg(t, L(19, 4.4), L(19, 4.9)), 'f3c1'); K.check(1790, 520, 90, seg(t, L(19, 5.0), L(19, 5.5)), 'f3c2');
    K.sparkle(1420, 300, 40, seg(t, L(19, 4.6), L(19, 5.4)), '#FFF3C4'); K.sparkle(1700, 560, 40, seg(t, L(19, 5.2), L(19, 6.0)), '#FFF3C4');
    const pk = K.act(t, [[tF3, 'calm', { lookX: -.6, lookY: -.6 }], [L(19, 3.4), 'happy', { lookX: .7, lookY: -.6 }], [L(19, 6.8), 'angry', { lookX: -.8, lookY: -.6 }], [L(19, 8.6), 'excited']]);
    pip(1140, GY - 16, 30, { ...pk, key: 'pf3' });
    camEnd();
    if (t < tF3 + .3) flash(1 - (t - tF3) / .3, '#FBF6E6');
    if (lt > dur - .5) flash((lt - (dur - .5)) / .5 * .9, '#F8DDB0');
  }

  // ================================ G: sunset, the opening field again (L20 – end) ================================
  function shotG(t, lt, dur) {
    K.setT(t);
    const tG2 = L(20, 8.0);
    if (t < tG2) {
      // the field at dusk, the scent now visible everywhere; Pip walks in, stops, sniffs
      const c = kf(t, [[L(20, -1.6), [HX, 300, .95]], [L(20, 1.4), [HX, 560, 1.0]], [L(20, 6.6), [HX - 120, 600, 1.1]], [tG2, [HX - 200, 560, 1.6]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      fieldBg(t, 'g', { duskK: 1 });
      const hero = field(t, 'g', { duskK: 1, hero: { bite: [2, .5, .4, .06] } });
      [hero, ...hero.nbr].forEach((m, i) => { if (i % 3 === 1) return; const p = onLeaf(m.leaves[(i * 3) % 6], .3).p; glow(p[0], p[1] - 60, 120, Z.call, .45); stream(p[0], p[1], 50, t + i * .7, .9, 'gs' + i, { rate: .7, life: 4.5, drift: 1.2, op: 200 }); });
      const w = stroll(t, L(20, -1.0), L(20, 4.6), 140, HX - 300, 30);
      const sniff = t > L(20, 5.2);
      const pk = K.act(t, [[L(20, -1.6), 'happy', { lookX: .6, lookY: -.3 }], [L(20, 5.2), 'calm', { blink: 1, lookY: -.4 }], [L(20, 7.4), 'wow', { lookX: -.4, lookY: -.6 }]]);
      pip(w.x, GY - 16, 30, { ...pk, walk: w.walk, dy: (pk.dy || 0) + (w.dy || 0) - (sniff ? .08 * Math.abs(Math.sin(t * 7)) : 0), flip: false, key: 'pg' });
      camEnd();
      if (lt < .5) flash(.9 * (1 - lt / .5), '#F8DDB0');
      if (t > tG2 - .3) flash((t - (tG2 - .3)) / .3, '#FBEBD0');
      return;
    }
    // the macro leaf at dusk, framed like the opening: a caterpillar munches, a wisp curls up, a wasp far off turns toward it;
    // Pip pats the leaf and smiles
    const c = kf(t, [[tG2, [900, 560, 1.18]], [L(21, 3.0), [900, 560, 1.12]], [dur + L(20, -1.6), [980, 600, 1.2]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    macroBg(t, 'gm', { dusk: 1 });
    const sf = blade(...BL, t, { key: 'gmb', bite: { at: A_CU - .07, k: .45, w: .06 }, col: mixCol(Z.leaf, '#C9A24A', .18) });
    const cr = onBlade(sf, A_CU, () => caterpillar(0, 0, A_S, t, { key: 'gmc', dir: -1, crawl: .5, munch: Math.abs(Math.sin(t * 5)) }));
    const wq = sf(A_CU + .06); glow(wq[0], wq[1] - 120, 200, Z.call, .6); stream(wq[0], wq[1] - 6, 80, t, seg(t, tG2 + .2, tG2 + 1.2), 'gmw', { rate: .8, life: 3.6, op: 210, drift: .9 });
    // the far wasp: a silhouette that turns toward the scent
    const turn = seg(t, L(20, 9.0), L(20, 9.8)), fk = seg(t, L(20, 9.6), L(21, 9.0));
    wasp(lerp(2050, 1700, ease(fk)), lerp(160, 260, ease(fk)), 36, t, { key: 'gmws', fly: 1, dir: turn > .5 ? -1 : 1 });
    const pb = sf(A_PU), pa = surfAng(sf, A_PU);
    const pk = K.act(t, [[tG2, 'wow', { lookX: -.8, lookY: .2 }], [L(21, .6), 'calm', { lookX: -.8, lookY: .5 }], [L(21, 3.8), 'happy', { lookX: .2, lookY: -.1 }], [L(21, 7.0), 'love']]);
    const pat = t > L(21, .6) && t < L(21, 3.8);
    pip(pb[0], pb[1] + 4, 34, { ...pk, flip: true, rot: (pk.rot || 0) + pa * .6, armF: pat ? { at: [2.2, -.6 + .25 * Math.abs(Math.sin(t * 4))] } : pk.armF, key: 'pgm' });
    const at = toScreen(pb[0], pb[1] - 100);
    camEnd();
    if (t < tG2 + .3) flash(1 - (t - tG2) / .3, '#FBEBD0');
    const io = seg(t, L(21, 10.0), L(21, 11.6));
    if (io > 0) iris(at[0], at[1], lerp(1500, 0, easeIn(io)));
  }

  // ================================ the cover (node render.mjs --page=maize.html --loop=cover --stills=.5) ================================
  // c: the layout. The 16:9 cover uses the defaults; the 4:3 one (cover43, cropped to x 0–1440) packs the scene left.
  function coverArt(t, c = {}) {
    K.setT(t);
    macroBg(t, 'cv', { warm: .7 });
    const sf = blade(...(c.blade || [560, 760, 2300, 620, 300]), t, { key: 'cvb', bite: { at: c.biteU ?? .3, k: .7, w: .07 } });
    const wq = sf((c.catU ?? .36) + .02); stream(wq[0], wq[1] - 6, 110, t + 1.2, 1, 'cvw', { rate: .9, life: 3.6, op: 220, drift: .9 });
    const cr = onBlade(sf, c.catU ?? .36, () => caterpillar(0, 0, c.catS ?? 150, t, { key: 'cvc', dir: -1, crawl: .4, munch: .6 }));
    const bp = cr.W([cr.r.mid[0], cr.r.mid[1] - 48]);
    wasp(bp[0] + 30, bp[1] - 70, c.waspS ?? 120, t, { key: 'cvwa', dir: -1, curl: .6, tap: .4 });
    K.burst(bp[0] - 10, bp[1] + 20, 60, .4, PAL.ink, 'cvst');
    const pb = sf(c.pipU ?? .68);
    pip(pb[0], pb[1] + 4, c.pipS ?? 46, { ...pipFeel('wow', .2), lookX: -.8, lookY: .2, flip: true, emote: 'exclaim', emoteK: 1, key: 'cvpip' });
    boilSeed('cvtag'); paint(rrPts(80, 92, 640, 92, 30, 2), { wash: Z.leafDk, fill: '#3E6230', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
    const F = (wgt, px) => `${wgt} ${px}px "PingFang SC", "Hiragino Sans GB", "STHeiti", sans-serif`;
    letter('高中生物 · 生态系统的信息传递', 400, 140, 42, PAL.cream, { font: F(800, 42), screen: true });
    boilSeed('cvblob'); paint(ellPts(520, 330, 470, 130, 30, 6, -.04), { wash: '#FBE2A6', fill: Z.call, fillOp: 70, bleed: .2, tex: .6, ink: null });
    letter('玉米也会', 92, 290, 150, '#3B2F45', { font: F(900, 150), align: 'left', stroke: PAL.cream, screen: true, ink: false });
    letter('雇杀手？', 92, 470, 170, Z.spit, { font: F(900, 170), align: 'left', stroke: '#3B2F45', screen: true, rot: -.03 });
  }
  LOOPS.cover = t => coverArt(t);
  LOOPS.cover.len = 1;
  // 4:3 for the Bilibili feed: render, then crop x 0–1440. The leaf runs lower and steeper, the cast sits under the title.
  LOOPS.cover43 = t => coverArt(t, { blade: [-160, 940, 1680, 690, 300], catU: .5, biteU: .45, pipU: .8, catS: 140, waspS: 112, pipS: 44 });
  LOOPS.cover.len = 1;

  // ---------- test sheet of the cast (node render.mjs --page=maize.html --loop=props --stills=.5) ----------
  LOOPS.props = t => {
    K.wash(Z.inside, t, { key: 'pr', blob: Z.insideBlob, rect: rectPts(-200, -200, W + 400, H + 400) });
    maize(260, 1040, 900, t, { key: 'm1', kernels: 1 });
    blade(520, 360, 1900, 260, 170, t, { key: 'b1', bite: { at: .45, k: .8 } });
    caterpillar(1280, 330, 120, t, { key: 'c1', crawl: t * .8 });
    wasp(800, 700, 120, t, { key: 'w1' });
    wasp(1150, 700, 120, t, { key: 'w2', fly: 1, dir: -1 });
    caterpillar(1700, 760, 90, t, { key: 'c2', dead: 1 });
    grub(600, 950, 60, t, { key: 'g' });
    nema(820, 960, 120, .3, t, 'n1');
    ladybug(1000, 960, 50, t, 'lb');
    sparrow(1250, 980, 70, t, 'sp');
    elicitor(1600, 980, 120, 0, { key: 'el' });
    stream(420, 600, 60, t, 1, 'st');
    pip(1500, 600, 30, { ...pipFeel('worried', t), key: 'pp' });
  };
  LOOPS.props.len = 4;

  shots([[0, shotA], [L(3, -1.9), shotB], [L(7, -1.6), shotC], [L(10, -1.6), shotD], [L(14, -1.6), shotE], [L(17, -1.6), shotF], [L(20, -1.6), shotG]]);
})();

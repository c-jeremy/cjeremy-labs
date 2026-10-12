// pip_sheets.js: Pip's model sheet and the channel avatar, as standalone loops (labels are fine here, as in sheets.js).
//   node render.mjs --page=pip.html --loop=pip --sheet=1 --cols=1 --w=1920 --out=docs/pip_reactions.jpg
//   node render.mjs --page=pip.html --loop=pipAvatar --sheet=0 --cols=1 --crop=420,0,1080,1080 --w=1080 --out=docs/pip_avatar.jpg
(() => {
  const label = (txt, x, y, size = 20) => letter(txt, x, y, size, PAL.ink, { ink: false, alpha: .8 });

  // Every mood in PIP_FEELS, alive.
  LOOPS.pip = t => {
    const cols = 7, rows = Math.ceil(PIP_FEELS.length / cols), cw = W / cols, ch = H / rows;
    PIP_FEELS.forEach((name, i) => {
      const cx = cw * (i % cols) + cw / 2 - 20, gy = ch * Math.floor(i / cols) + ch - 64;
      pip(cx, gy, 24, { ...pipFeel(name, t, { seed: i }), key: 'p' + i });
      label(name, cx, gy + 34);
    });
  };
  LOOPS.pip.len = 4;

  // A DNA double helix along a path P (world points): two backbones winding round each other, paired rungs between.
  // ph turns the helix; r: its radius; tw: turns per 100 px. The back half goes first so the front strand crosses over.
  const BASES = [['#E8AA38', '#3A9C98'], ['#3A9C98', '#E8AA38'], ['#E27A92', '#6E9F58'], ['#6E9F58', '#E27A92']];
  function helix(P, r, ph, tw, o = {}) {
    const C = through(P, 10), n = C.length, L = [0];
    for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
    const nrm = i => { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d]; };
    const at = (i, s) => { const th = ph + L[i] / 100 * tw * TAU + (s ? Math.PI : 0), [nx, ny] = nrm(i); return { p: [C[i][0] + nx * r * Math.sin(th), C[i][1] + ny * r * Math.sin(th)], z: Math.cos(th) }; };
    const strand = (s, front) => {                     // the stretches of one backbone on one side
      let run = [];
      const flush = () => { if (run.length > 1) paint(ribbon(run, o.bw, o.bw), { wash: s ? o.c1 : o.c0, ink: PAL.ink, sw: o.sw }); run = []; };
      for (let i = 0; i < n; i++) { const q = at(i, s); if ((q.z >= 0) === front) run.push(q.p); else { if (run.length) run.push(q.p); flush(); } }
      flush();
    };
    boilSeed('helixB'); strand(0, false); strand(1, false);
    boilSeed('helixR');
    const step = o.rung || 34;
    for (let d = step / 2, k = 0; d < L[n - 1]; d += step, k++) {
      let i = 0; while (i < n - 1 && L[i] < d) i++;
      const a = at(i, 0), b = at(i, 1), m = [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2], [ca, cb] = BASES[Math.floor(hash(k * 3.1 + 2) * 4)];
      if (Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1]) < o.bw * 1.2) continue;
      paint(ribbon([a.p, m], o.rw, o.rw), { wash: ca, ink: PAL.ink, sw: o.sw * .6 });
      paint(ribbon([m, b.p], o.rw, o.rw), { wash: cb, ink: PAL.ink, sw: o.sw * .6 });
    }
    boilSeed('helixF'); strand(0, true); strand(1, true);
  }
  window.pipHelix = helix;

  // The avatar: Pip skipping with a DNA helix for a jump rope, inside a round badge that survives a circle crop.
  // Frame it with --crop=420,0,1080,1080 (the square centred on the canvas); the badge is the circle of radius 500 in it.
  LOOPS.pipAvatar = t => {
    const cx = W / 2, cy = H / 2, R = 468;
    boilSeed('badge');
    paint(ellPts(cx, cy, 540, 540, 72), { wash: '#F6D77A', ink: null });
    paint(ellPts(cx, cy, R, R, 72), { wash: '#BFE6D8', fill: '#8FCFBC', fillOp: 70, tex: .4, bleed: .05, ink: null });
    const u = 84, gx = cx, gy = cy + 345, lift = .45, hx = 3.05, hy = -3.7;
    boilSeed('ground'); paint(ellPts(gx, gy + 6, 2.4 * u, .36 * u, 24), { wash: '#86C4AF', ink: null });
    for (const s of [-1, 1]) inkLine([[gx + s * 1.25 * u, gy - .05 * u], [gx + s * 1.9 * u, gy + .08 * u]], 1.6, '#3E7F6C', 'ink', 0);
    // the helix arches from hand to hand, over the leaf, like a skipping rope at the top of its swing
    const by = gy - lift * u, hL = [gx - hx * u, by + hy * u], hR = [gx + hx * u, by + hy * u], A = hx * u, B = 4.25 * u;
    const P = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * (1 + i / 16) - .0; P.push([gx + Math.cos(a) * A * 1.06, hL[1] + Math.sin(a) * B + (i === 0 || i === 16 ? .25 * u : 0)]); }
    helix(P, 52, t * 3, .5, { bw: 25, rw: 15, sw: 2.2, c0: '#2F3C7A', c1: '#D97757', rung: 34 });
    pip(gx, gy, u, { face: 'happy', dy: -lift, sq: -.03, armF: { at: [hx, hy] }, armB: { at: [-hx, hy] }, leaf: -.75, blush: 1, turn: 0, noShadow: true, weight: 1.7, key: 'av' });
    for (let i = 0; i < 3; i++) { const [sx, sy, r] = [[cx - 380, cy - 190, 24], [cx + 385, cy - 120, 30], [cx + 300, cy - 330, 18]][i]; paint(starPts(sx, sy, r, .32, 4), { wash: '#FFF5E2', ink: PAL.ink, sw: .8 }); }
  };
  LOOPS.pipAvatar.len = 2;
})();

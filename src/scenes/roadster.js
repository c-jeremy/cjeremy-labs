// Pip讲会倒挂的车: the Roadster that hangs head-down from a ramp and then flies off. Friction, N, the loop, the air.
(() => {
  const K = MK;
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const PI = Math.PI;
  const R = {
    mg: '#E3A23B', mgLt: '#F2CF8C', N: '#2F9C96', f: '#D45C73', fLt: '#F1C1CA', air: '#6FA8D6', airLt: '#BCD8EE',
    acc: '#7B5CA8', thrust: '#F2C14E',
    car: '#EEE9DE', carDk: '#B4AEA2', glass: '#33405C', slate: '#7A93B0', slateDk: '#4F6584', orange: '#E8893A',
    orangeDk: '#B0602A', tyre: '#2D2934', rim: '#A9AEB8',
    night: '#1E2348', nightHi: '#2D3566', dawn: '#EDBFA2', dawnHi: '#F7DDB8', board: '#F5EDDC', grid: '#D9E2EA',
    concrete: '#8F8B88', concreteLt: '#B9B3AC', truss: '#3A3F58', noon: '#D7E9F2', airBg: '#DCEBF5', asphalt: '#3B3A44',
    warm: '#F4D9A8'
  };
  const pulseW = (t, t0) => t < t0 ? 1 : 1 + .45 * Math.exp(-5 * (t - t0));
  const popK = (t, t0, d = .4) => backOut(seg(t, t0, t0 + d));
  const bez = (P, k) => { const u = 1 - k; return [0, 1].map(j => u * u * u * P[0][j] + 3 * u * u * k * P[1][j] + 3 * u * k * k * P[2][j] + k * k * k * P[3][j]); };

  // ---------- a painted arrow: a ribbon with a head, from (x, y) along angle a ----------
  function arrow(x, y, a, len, col, o = {}) {
    if (!(len > 6)) return;
    const w = (o.w || 15) * (o.pw || 1), hl = Math.min(len * .5, w * 2.1), hw = w * 1.2, ca = Math.cos(a), sa = Math.sin(a);
    const P = (u, v) => [x + ca * u - sa * v, y + sa * u + ca * v];
    boilSeed('ar' + (o.key || ''));
    const op = o.op ?? 255, ink = o.ghost ? col : mixCol(col, PAL.ink, .5), fill = o.ghost ? mixCol(col, PAL.cream, .6) : col;
    if (o.dash) {
      const sl = len - hl, n = Math.max(1, Math.round(sl / (w * 1.7)));
      for (let i = 0; i < n; i++) { const u0 = i * sl / n, u1 = u0 + sl / n * .62; paint([P(u0, -w / 2), P(u1, -w / 2), P(u1, w / 2), P(u0, w / 2)], { wash: fill, washOp: op, ink: null }); }
      paint([P(sl, -hw), P(len, 0), P(sl, hw)], { wash: fill, washOp: op, ink: null });
    } else {
      paint([P(0, -w / 2), P(len - hl, -w / 2), P(len - hl, -hw), P(len, 0), P(len - hl, hw), P(len - hl, w / 2), P(0, w / 2)],
        { wash: fill, washOp: o.ghost ? 120 : op, ink, sw: o.ghost ? .9 : 1 });
    }
  }

  // ---------- the car: side view, (x, y) = the road under its middle, a = rotation, faces +x ----------
  const BODY = [[-232, -28], [-236, -56], [-220, -74], [-160, -82], [-100, -92], [-58, -116], [2, -124], [60, -114], [112, -92], [190, -78], [230, -62], [238, -40], [224, -26]];
  const GLASS = [[-80, -96], [-50, -113], [4, -119], [54, -110], [88, -93]];
  function car(x, y, a, s, o = {}) {
    const col = o.col || R.car, dk = o.dk || R.carDk, sw = 1.3 / s;
    push(); translate(x, y); rotate(a); scale(o.flip ? -s : s, s);
    boilSeed('car' + (o.key || ''));
    if (o.shadow !== false && !o.air) paint(ellPts(0, 2, 230, 9, 18), { wash: PAL.ink, washOp: 60, ink: null });
    paint(BODY, { wash: col, ink: PAL.ink, sw, curv: .35 });
    paint(GLASS, { wash: R.glass, ink: PAL.ink, sw: sw * .8, curv: .3 });
    paint([[-40, -112], [-6, -117], [-30, -100]], { wash: mixCol(R.glass, PAL.cream, .45), ink: null });
    inkLine([[-222, -50], [-60, -62], [120, -60], [228, -47]], .8 / s, dk, 'inkfine', .5);
    inkLine([[-28, -93], [-22, -38]], .7 / s, dk, 'inkfine', .3);
    paint(ellPts(224, -58, 12, 5, 10), { wash: '#FFF1C6', ink: PAL.ink, sw: sw * .6 });
    paint(ellPts(-231, -49, 6, 6, 10), { wash: '#D6455A', ink: null });
    if (o.fan !== undefined) {                                         // cutaway: the fan in the floor
      paint(ellPts(-40, -52, 30, 22, 16), { wash: '#3A3F52', ink: PAL.ink, sw: sw * .7 });
      for (let i = 0; i < 3; i++) { const b = o.fan + i * TAU / 3; paint([[-40, -52], [-40 + Math.cos(b - .35) * 26, -52 + Math.sin(b - .35) * 18], [-40 + Math.cos(b + .1) * 26, -52 + Math.sin(b + .1) * 18]], { wash: R.airLt, ink: null }); }
      paint(ellPts(-40, -52, 5, 5, 8), { wash: PAL.cream, ink: null });
    }
    for (const wx of [-142, 146]) {
      paint(ellPts(wx, -34, 44, 42, 16), { wash: mixCol(dk, PAL.ink, .45), ink: null });
      paint(ellPts(wx, -34, 36, 36, 18), { wash: R.tyre, ink: PAL.ink, sw: sw * .8 });
      paint(ellPts(wx, -34, 20, 20, 14), { wash: R.rim, ink: null });
      for (let i = 0; i < 5; i++) { const b = (o.spin || 0) + i * TAU / 5; inkLine([[wx, -34], [wx + Math.cos(b) * 18, -34 + Math.sin(b) * 18]], 1 / s, '#6E7380', 'inkfine', 0); }
      paint(ellPts(wx, -34, 5, 5, 8), { wash: '#4A4E5A', ink: null });
    }
    pop();
  }
  // a point in the car's own frame (u along the car, v down = into the road), in world coordinates
  const carPt = (x, y, a, s, u, v) => [x + (Math.cos(a) * u - Math.sin(a) * v) * s, y + (Math.sin(a) * u + Math.cos(a) * v) * s];

  // jets from the belly (along the car's +v), a pure-function stream of puffs between t0 and t1
  function jets(x, y, a, s, t, t0, t1, key, o = {}) {
    if (t < t0) return;
    const life = o.life || .7, dt = .07, j0 = Math.max(0, Math.floor((t - life - t0) / dt)), j1 = Math.floor((Math.min(t, t1) - t0) / dt);
    for (let j = j0; j <= j1; j++) {
      const born = t0 + j * dt, age = t - born; if (age < 0 || age > life) continue;
      for (const [n, u0] of [[0, -120], [1, 0], [2, 120]]) {
        boilSeed('jt' + key + j + n);
        const k = age / life, [px, py] = carPt(x, y, a, s, u0 + 30 * (hash(j * 3 + n) - .5), 10 + (o.reach || 260) * easeOut(k));
        const r = (12 + 55 * k) * s;
        if (o.floor && py + r * .5 > o.floor) continue;
        paint(ellPts(px, py, r, r * .8, 12, 2), { wash: PAL.cream, washOp: 215 * (1 - k * k), ink: null });
      }
    }
  }
  // air drawn in under the floor and out of the back (the fan running)
  function suck(x, y, a, s, t, k, key) {
    if (k <= .01) return;
    for (let i = 0; i < 12; i++) {
      boilSeed('sk' + key + i);
      const p = frac(t * .8 + hash(i + 40)), u = lerp(240, -380, p), v = p < .75 ? -14 + 5 * Math.sin(i + t * 3) : -14 - 160 * (p - .75);
      const [px, py] = carPt(x, y, a, s, u, v), r = (4 + 3 * hash(i)) * s;
      paint(ellPts(px, py, r * 1.6, r, 8, 0, a), { wash: R.air, washOp: 200 * k * Math.sin(p * PI), ink: null });
    }
  }

  // ---------- Pip, acted ----------
  function host(x, y, u, t, keys, o = {}) {
    const a = K.act(t, keys, o.seed || 0);
    pip(x, y, u, { ...a, ...(o.extra || {}), flip: o.flip, key: o.key || 'pip' });
  }

  // ---------- the test site: night → dawn ----------
  const RC = [1150, 470], RR = 430, A_END = -1.1, A_PARK = -.9, GROUND = 900;
  const onRamp = a => [RC[0] + RR * Math.cos(a), RC[1] + RR * Math.sin(a), a - PI / 2];
  const FLY = () => { const [x, y] = onRamp(A_PARK), n = [-Math.cos(A_PARK), -Math.sin(A_PARK)]; return [[x, y], [x + n[0] * 300, y + n[1] * 300], [990, 650], [880, GROUND]]; };
  function flight(t, t0, t1) {                                            // the car from the overhang to the apron
    const k = seg(t, t0, t1), q = ease(k), P = FLY(), [x, y] = bez(P, q);
    return { x, y, a: lerp(A_PARK - PI / 2, 0, ease(seg(k, .15, .9))), k };
  }
  function site(t, o = {}) {
    const d = o.dawn || 0, mc = (a, b) => mixCol(a, b, d);
    K.wash(mc(R.night, R.dawn), t, { key: 'st', blob: mc(R.nightHi, R.dawnHi), n: 5 });
    boilSeed('sky');
    paint(rectPts(-1200, 560, 4400, 400), { fill: mc('#3A3C6E', '#F6CFA0'), fillOp: 160, bleed: .25, tex: .4, ink: null });
    if (d > 0) { glow(260, 880, 700, '#FFC98A', .7 * d); glow(260, 880, 240, '#FFE8B8', .8 * d); }
    if (d < 1) for (let i = 0; i < 46; i++) {
      boilSeed('star' + i);
      const x = -500 + hash(i + 11) * 3000, y = -500 + hash(i + 12) * 1100, r = 2 + 3 * hash(i + 13), tw = .6 + .4 * wob(t, .3 + hash(i) * .4, i);
      paint(starPts(x, y, r * 1.8, .35, 4), { wash: PAL.cream, washOp: 230 * (1 - d) * tw, ink: null });
    }
    boilSeed('hills');
    paint([[-1200, 905], [-900, 790], [-500, 830], [-100, 760], [300, 840], [700, 800], [1200, 850], [1700, 780], [2300, 830], [3200, 790], [3200, 905]], { wash: mc('#262A50', '#C79A93'), ink: null, curv: .5 });
    paint(rectPts(-1400, GROUND, 4800, 900), { wash: mc(R.asphalt, '#7E6E73'), ink: null });
    paint(rectPts(-1400, GROUND, 2580, 46), { wash: mc('#55535F', '#A99A98'), ink: null });
    inkLine([[-1400, GROUND], [1180, GROUND]], 1.2, PAL.ink, 'ink', 0);
    for (const [lx, h] of [[-160, 520], [330, 470], [2080, 560]]) {                 // floodlights
      boilSeed('lamp' + lx);
      inkLine([[lx, GROUND], [lx, GROUND - h]], 3, mc('#2A2D45', '#5E5160'), 'ink', 0);
      paint(rrPts(lx - 34, GROUND - h - 18, 68, 22, 6), { wash: mc('#3A3F58', '#6E6070'), ink: PAL.ink, sw: .8 });
      if (d < 1) { glow(lx, GROUND - h, 220, '#FFD58A', .55 * (1 - d)); paint(ellPts(lx + 120, GROUND + 22, 260, 22, 16), { wash: '#F4D9A0', washOp: 70 * (1 - d), ink: null }); }
    }
    // the steel tower behind the ramp
    boilSeed('truss');
    const tc = mc(R.truss, '#6A5A68'), x0 = 1650, x1 = 1745;
    inkLine([[x0, GROUND], [x0, 70]], 4, tc, 'ink', 0); inkLine([[x1, GROUND], [x1, 70]], 4, tc, 'ink', 0);
    for (let i = 0; i < 10; i++) { const y0 = GROUND - i * 84, y1 = y0 - 84; inkLine([[x0, y0], [x1, y1]], 2, tc, 'ink', 0); inkLine([[x0, y1], [x1, y1]], 2, tc, 'ink', 0); }
    for (const a of [-.15, -.5, -.85, -1.1]) { const p = [RC[0] + (RR + 40) * Math.cos(a), RC[1] + (RR + 40) * Math.sin(a)]; inkLine([p, [x0, p[1] - 30]], 3, tc, 'ink', 0); inkLine([p, [x0, p[1] + 60]], 2, tc, 'ink', 0); }
    // the ramp: a concrete ribbon curling up and over
    boilSeed('ramp');
    const P = []; for (let i = 0; i <= 40; i++) { const a = lerp(PI / 2, A_END, i / 40); P.push([RC[0] + (RR + 20) * Math.cos(a), RC[1] + (RR + 20) * Math.sin(a)]); }
    paint(ribbon(P, 40, 40), { wash: mc(R.concrete, '#B8A6A0'), ink: PAL.ink, sw: 1.1 });
    const E = P.map((p, i) => { const a = lerp(PI / 2, A_END, i / 40); return [RC[0] + (RR + 3) * Math.cos(a), RC[1] + (RR + 3) * Math.sin(a)]; });
    inkLine(E.slice(0, 21), 1.8, '#D0574E', 'ink', .5); inkLine(E.slice(20), 1.8, '#D0574E', 'ink', .5);
  }

  // ---------- A: the hang and the flight ----------
  function shotA(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[0, [760, 700, 1.05]], [L(1, 1.4), [760, 700, 1.05]], [L(1, 5.6), [1400, 300, 1.45]], [L(1, 9.2), [1400, 300, 1.5]],
      [L(2, -.6), [1080, 520, .93]], [L(2, 5.0), [1080, 520, .93]], [L(2, 6.6), [800, 690, 1.08]], [L(3, 7.4), [800, 700, 1.1]], [L(4, -1.6), [958, 893, 2.7]]], ease);
    const sh = shakeXY(t, 9 * Math.exp(-6 * Math.max(0, t - L(2, 5.25))) * (t > L(2, 5.25) ? 1 : 0));
    camBegin(c[0] + 6 * wob(t, .05) + sh[0], c[1] + 5 * wob(t, .06) + sh[1], c[2]);
    site(t);
    const tf0 = L(2, 3.7), tf1 = L(2, 5.25);
    let cx, cy, ca;
    if (t < tf0) { [cx, cy, ca] = onRamp(A_PARK); const cr = .012 * spring(t, L(2, .6), 5, 16); ca += cr; }
    else { const f = flight(t, tf0, tf1); cx = f.x; cy = f.y; ca = f.a; }
    const land = t > tf1 ? spring(t, tf1, 7, 22) : 0;
    jets(cx, cy, ca, .55, t, tf0 - .25, tf1 + .3, 'a', { floor: GROUND });
    suck(cx, cy, ca, .55, t, t < tf0 ? 1 : 0, 'a');
    car(cx, cy - 6 * land, ca, .55, { key: 'ra', sq: land });
    if (t > tf1 && t < tf1 + .6) { boilSeed('dust'); for (let i = 0; i < 7; i++) { const k = seg(t, tf1, tf1 + .6), x = 880 + (i - 3) * 60 * (1 + k); paint(ellPts(x, GROUND - 10 - 30 * k * hash(i), 26 + 30 * k, 16 + 14 * k, 10), { wash: '#BDB3AA', washOp: 160 * (1 - k), ink: null }); } }
    host(560, GROUND, 30, t, [[0, 'calm', { lookX: .6, lookY: -.6 }], [L(1, 1.0), 'wow', { lookX: .8, lookY: -1 }], [L(2, 3.95), 'worried', { emote: 'exclaim', lookX: .9, lookY: -.8, take: 1.2 }],
      [L(2, 6.4), 'wow', { lookX: 1, lookY: .2 }], [L(3, 1.2), 'confused', { emote: 'question', lookX: 1, lookY: .3 }], [L(3, 6.5), 'calm', { lookX: 1, lookY: .6 }]], { key: 'pa' });
    const at = toScreen(560, GROUND - 90);
    camEnd();
    if (lt < .8) iris(...at, lerp(0, 1700, easeIn(lt / .8)));
    if (lt > dur - .5) flash(seg(lt, dur - .5, dur), PAL.cream);
  }

  // ---------- B: the board: friction, the slope, the wall ----------
  const PV = [820, 760], PLK = 760, FLOOR = 1000, M = 230, CS = .7;
  function plank(phi) {
    const d = [Math.cos(phi), -Math.sin(phi)];
    boilSeed('plk');
    paint([[PV[0] + 70, FLOOR], [PV[0] - 70, FLOOR], [PV[0] - 18, PV[1] + 10], [PV[0] + 18, PV[1] + 10]], { wash: '#9A8C7A', ink: PAL.ink, sw: 1 });
    paint(ribbon([[PV[0] - d[0] * 20, PV[1] - d[1] * 20], [PV[0] + d[0] * PLK, PV[1] + d[1] * PLK]], 30, 30), { wash: '#C9A878', ink: PAL.ink, sw: 1.1 });
    paint(ellPts(PV[0], PV[1], 12, 12, 10), { wash: '#6E6153', ink: PAL.ink, sw: .8 });
  }
  const onPlank = (phi, s) => { const d = [Math.cos(phi), -Math.sin(phi)], n = [-Math.sin(phi), -Math.cos(phi)]; return [PV[0] + d[0] * s + n[0] * 15, PV[1] + d[1] * s + n[1] * 15, -phi, n, d]; };
  function board(t, key, col = R.board) {
    K.wash(col, t, { key, blob: PAL.cream, n: 4 });
    boilSeed('grid' + key);
    for (let i = -6; i < 24; i++) inkLine([[i * 120, -500], [i * 120, 1600]], .6, R.grid, 'inkfine', 0);
    for (let j = -4; j < 14; j++) inkLine([[-800, j * 120], [2700, j * 120]], .6, R.grid, 'inkfine', 0);
  }
  function forces(x, y, phi, n, o, t, key) {                             // the free-body diagram at the car's middle
    const G = [x + n[0] * 38, y + n[1] * 38], up = Math.atan2(n[1], n[0]), dn = up + PI, down = PI / 2, uphill = -phi, downhill = PI - phi;
    if (o.ghost > 6) arrow(G[0], G[1], uphill, o.ghost, R.f, { ghost: 1, key: key + 'gh', w: 15, pw: o.pwg || 1 });
    if (o.comp > 0) { arrow(G[0], G[1], dn, M * Math.cos(phi) * o.comp, R.mgLt, { dash: 1, key: key + 'c1', pw: o.pw1 || 1 }); arrow(G[0], G[1], downhill, M * Math.sin(phi) * o.comp, R.mgLt, { dash: 1, key: key + 'c2', pw: o.pw2 || 1 }); }
    if (o.mg > 0) arrow(G[0], G[1], down, M * o.mg, R.mg, { key: key + 'mg', pw: o.pwm || 1 });
    if (o.N > 6) arrow(G[0], G[1], up, o.N, R.N, { key: key + 'N', pw: o.pwN || 1 });
    if (o.f > 6) arrow(G[0], G[1], uphill, o.f, R.f, { key: key + 'f', pw: o.pwf || 1 });
  }
  function sandbag(x, y, a, k) {
    if (k <= 0) return;
    boilSeed('sb');
    push(); translate(x, y); rotate(a);
    paint([[-62, 0], [-70, -40], [-40, -78], [0, -86], [40, -78], [70, -40], [62, 0]], { wash: '#B9946A', ink: PAL.ink, sw: 1.2, curv: .5 });
    inkLine([[-12, -84], [0, -96], [12, -84]], 1.2, PAL.ink, 'ink', .3);
    inkLine([[-40, -30], [-10, -40], [30, -28]], .7, '#8C6A48', 'inkfine', .5);
    pop();
  }
  function shotB(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[0, [1100, 600, 1.05]], [L(6, 3), [1100, 600, 1.05]], [L(6, 5), [1000, 520, .98]], [L(7, 1), [960, 480, .92]]], ease);
    const wh = seg(lt, dur - .45, dur);
    camBegin(c[0] + 8 * wob(t, .05), c[1] + 6 * wob(t, .045) - 1400 * easeIn(wh), c[2]);
    board(t, 'b');
    boilSeed('floor'); paint(rectPts(-800, FLOOR, 3600, 600), { wash: '#E4D8C0', ink: null }); inkLine([[-800, FLOOR], [2800, FLOOR]], 1, PAL.ink, 'ink', 0);
    const phi = kf(t, [[0, 0], [L(5, .8), 0], [L(5, 2.6), .436], [L(6, 4), .436], [L(6, 6.2), PI / 4], [L(6, 7.2), PI / 4], [L(6, 7.8), .93], [L(7, -1.1), .93], [L(7, -.5), PI / 4], [L(7, .4), PI / 4], [L(7, 2.4), PI / 2], [L(7, 5.6), PI / 2], [L(7, 6.8), 2.18]], ease);
    plank(phi);
    // the angle at the pivot
    if (phi > .05) { boilSeed('ang'); const P = []; for (let i = 0; i <= 12; i++) P.push([PV[0] + 110 * Math.cos(-phi * i / 12), PV[1] + 110 * Math.sin(-phi * i / 12)]); inkLine(P, 1.4 * pulseW(t, L(6, .8)), PAL.ink, 'ink', .5); }
    const bag = t < L(5, -1.4) ? seg(t, L(4, 7.4), L(4, 7.9)) : 1 - seg(t, L(5, -1.4), L(5, -.6));
    const press = 1 + .5 * ease(seg(t, L(4, 7.85), L(4, 8.3))) * (t < L(5, -1) ? 1 : 1 - seg(t, L(5, -1), L(5, -.4)));
    // car 1: holds, then slides off past 45°
    const tS = L(6, 7.9);
    if (t < tS + 1.6) {
      let s = 430, fall = null;
      if (t > tS) { const d = t - tS; s = 430 - 330 * d * d; if (s < -40) { const t0 = Math.sqrt(470 / 330), dd = d - t0, v = 660 * t0; fall = [PV[0] - Math.cos(phi) * 40 - Math.cos(phi) * v * dd, PV[1] + Math.sin(phi) * 40 + Math.sin(phi) * v * dd + 1300 * dd * dd]; } }
      const [x, y, a, n] = onPlank(phi, Math.max(s, -40));
      const X = fall ? fall[0] : x, Y = fall ? fall[1] : y, Aa = fall ? a - 2 * (t - tS - 1.2) : a;
      car(X, Y, Aa, CS, { col: R.slate, dk: R.slateDk, key: 'b1', spin: t > tS ? -(t - tS) * 8 : 0 });
      if (bag > 0) { const [bx, by] = [x + n[0] * 70, y + n[1] * 70 - 700 * (1 - easeIn(Math.min(bag * 1.0, 1)))]; sandbag(bx, by + (t > L(4, 7.9) ? 6 * spring(t, L(4, 7.9), 7, 20) : 0), a, bag); }
      if (t < tS + .3) {
        const N = M * Math.cos(phi) * press, ghost = N * popK(t, L(4, 3.4)), need = M * Math.sin(phi), f = t > tS ? ghost : Math.min(need, ghost) * popK(t, L(5, 8.0));
        forces(x, y, phi, n, { mg: popK(t, L(4, .5)), N: N * popK(t, L(4, 1.5)), ghost, comp: popK(t, L(5, 2.9), .6), f,
          pwN: pulseW(t, L(4, 6.2)) * pulseW(t, L(4, 8.0)), pwg: pulseW(t, L(4, 4.0)) * pulseW(t, L(4, 9.2)) * pulseW(t, L(6, 6.3)), pw1: pulseW(t, L(5, 4.6)), pw2: pulseW(t, L(5, 6.3)), pwf: pulseW(t, L(6, 6.3)) }, t, 'b1');
      }
    }
    if (t < tS + 3.2) K.cross(PV[0] - 150, PV[1] + 40, 90, seg(t, tS + .9, tS + 1.5), 'x1');
    // car 2: on the wall at 90°, then it drops
    const tA = L(7, -.6), tF = L(7, 4.4);
    if (t > tA && t < tF + 1.2) {
      const [x, y, a, n] = onPlank(phi, 430), dd = Math.max(0, t - tF), k = popK(t, tA, .45);
      push(); translate(x, y); scale(k); translate(-x, -y);
      car(x, y + 1300 * dd * dd, a, CS, { col: R.slate, dk: R.slateDk, key: 'b2' });
      pop();
      if (t < tF) { const N = M * Math.cos(phi); forces(x, y, phi, n, { mg: k, N, ghost: N, f: Math.min(M * Math.sin(phi), N), pwN: pulseW(t, L(7, 2.4)) }, t, 'b2'); }
    }
    if (t < L(7, 6.6)) K.cross(PV[0] - 200, PV[1] + 40, 90, seg(t, tF + .5, tF + 1.1), 'x2');
    // car 3: under the overhang; it is gone at once
    const t3 = L(7, 7.0), t3f = L(7, 7.5);
    if (t > t3f) K.cross(PV[0] - 260, PV[1] - 60, 90, seg(t, t3f + .5, t3f + 1.1), 'x3');
    if (t > t3 && t < t3f + 1.2) {
      const [x, y, a, n] = onPlank(phi, 470), dd = Math.max(0, t - t3f), k = popK(t, t3, .35);
      push(); translate(x, y); scale(k); translate(-x, -y);
      car(x, y + 1300 * dd * dd, a, CS, { col: R.slate, dk: R.slateDk, key: 'b3' });
      pop();
      if (dd < .25) arrow(x + n[0] * 38, y + n[1] * 38, PI / 2, M * k, R.mg, { key: 'b3mg' });
    }
    host(1660, FLOOR, 32, t, [[0, 'calm', { lookX: -1, lookY: 0 }], [L(4, 4.2), 'idea', { lookX: -1 }], [L(4, 8.2), 'wow', { lookX: -1, lookY: -.3 }], [L(5, 1), 'calm', { lookX: -1, lookY: -.2 }],
      [L(6, 3.4), 'idea', { lookX: -1, lookY: -.3 }], [L(6, 8.0), 'worried', { lookX: -1, lookY: .4 }], [L(7, 1), 'calm', { lookX: -1, lookY: -.6 }], [L(7, 4.6), 'sad', { lookX: -1, lookY: .4 }]], { flip: true, key: 'pb' });
    camEnd();
    if (lt < .5) flash(1 - seg(lt, 0, .5), PAL.cream);
    speedLines(wh, 'b');
  }
  function speedLines(k, key, horiz = false) {
    if (k <= 0 || k >= 1) return;
    boilSeed('spd' + key);
    for (let i = 0; i < 16; i++) { const x = hash(i + 3) * W, y = hash(i + 5) * H, l = (300 + 400 * hash(i + 7)) * Math.sin(k * PI), w = 3 + 4 * hash(i + 9);
      paint(horiz ? rectPts(x - l, y - w / 2, 2 * l, w) : rectPts(x - w / 2, y - l, w, 2 * l), { wash: PAL.cream, washOp: 210, ink: null }); }
  }

  // ---------- C: the loop, then the recap ----------
  const LC = [960, 470], LR = 300, LG = LC[1] + LR, ENTRY = 1260, LAP = TAU * LR;
  function onLoop(d, laps) {
    if (d < ENTRY) return [-300 + d, LG, 0];
    if (d < ENTRY + laps * LAP) { const a = PI / 2 - (d - ENTRY) / LR; return [LC[0] + LR * Math.cos(a), LC[1] + LR * Math.sin(a), a - PI / 2]; }
    return [LC[0] + (d - ENTRY - laps * LAP), LG, 0];
  }
  function loopWorld(t) {
    K.wash(R.noon, t, { key: 'c', blob: PAL.cream, n: 5 });
    for (let i = 0; i < 5; i++) { boilSeed('cl' + i); const x = (hash(i + 21) * 2600 - 300 + t * 12 * (1 + hash(i))) % 2600 - 300, y = 90 + 260 * hash(i + 22); for (let j = 0; j < 3; j++) paint(ellPts(x + j * 70, y - 20 * (j % 2), 90, 46, 14, 4), { wash: PAL.cream, washOp: 200, ink: null }); }
    boilSeed('cgr'); paint(rectPts(-800, LG + 16, 3600, 700), { wash: '#CFC6A8', ink: null });
    paint(rectPts(-800, LG, 3600, 32), { wash: R.concrete, ink: PAL.ink, sw: 1 });
    boilSeed('loop'); const P = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; P.push([LC[0] + (LR + 16) * Math.cos(a), LC[1] + (LR + 16) * Math.sin(a)]); }
    paint(ribbon(P.slice(0, 25), 32, 32), { wash: R.concrete, ink: PAL.ink, sw: 1 }); paint(ribbon(P.slice(24), 32, 32), { wash: R.concrete, ink: PAL.ink, sw: 1 });
    inkLine([[LC[0] - 40, LG], [LC[0] - 70, LG + 16]], 1, PAL.ink, 'ink', 0);
  }
  function recapCard(cx, cy, k, pw, key, draw) {
    if (k <= 0) return;
    push(); translate(cx, cy + 600 * (1 - k)); scale(pw); translate(-cx, -cy);
    boilSeed('rc' + key); paint(rrPts(cx - 240, cy - 210, 480, 420, 26, 2), { wash: PAL.cream, ink: PAL.ink, sw: 1.2 });
    draw(); pop();
  }
  function shotC(t, lt, dur) {
    K.setT(t);
    const tR = L(10, -.55);
    if (t < tR) {
      const sw = seg(lt, 0, .45);
      camBegin(960 + 8 * wob(t, .05), 470 + 6 * wob(t, .05) + 1400 * (1 - easeOut(sw)), 1);
      loopWorld(t);
      // the fast car: in, round twice (frozen at the top), out
      const tz = L(8, 4.6), tz1 = L(9, .5);
      const d = t < tz - .5 ? 900 * (t - L(8, -1.6)) : t < tz ? lerp(900 * (tz - .5 - L(8, -1.6)), ENTRY + LAP + PI * LR, easeOut(seg(t, tz - .5, tz))) : t < tz1 ? ENTRY + LAP + PI * LR : ENTRY + LAP + PI * LR + 900 * (t - tz1 - .3) * seg(t, tz1, tz1 + .6);
      const [x, y, a] = onLoop(d, 4), frozen = t > tz - .1 && t < tz1;
      if (x < 2400) {
        if (!frozen && t > L(8, -1.6)) { boilSeed('csp'); for (let i = 0; i < 3; i++) { const [px, py] = carPt(x, y, a, .42, -260 - i * 40, -40 - i * 18); const [qx, qy] = carPt(x, y, a, .42, -420 - i * 50, -40 - i * 18); inkLine([[px, py], [qx, qy]], 1.2, '#8C8A92', 'inkfine', 0); } }
        car(x, y, a, .5, { col: R.orange, dk: R.orangeDk, key: 'c1', spin: frozen ? 0 : -d / 15 });
        if (frozen) {
          const G = [x, y + 30], k1 = popK(t, tz + .3), k2 = popK(t, tz + 1.2);
          for (let i = 0; i < 3; i++) inkLine([[x + 140 + i * 24, y + 46 + i * 16], [x + 250 + i * 34, y + 46 + i * 16]], 1, '#8C8A92', 'inkfine', 0);
          arrow(G[0] - 22, G[1], PI / 2, 150 * k1, R.N, { key: 'cN', pw: pulseW(t, L(8, 8.4)) });
          arrow(G[0] + 22, G[1], PI / 2, 150 * k2, R.mg, { key: 'cmg' });
        }
      }
      if (t > L(9, 2.8) && t < L(9, 7.4)) { boilSeed('rad'); const k = seg(t, L(9, 2.8), L(9, 3.6)); inkLine([[LC[0], LC[1]], [LC[0] + (LR - 4) * k, LC[1]]], 1.6 * pulseW(t, L(9, 3.6)), PAL.ink, 'ink', 0); paint(ellPts(LC[0], LC[1], 7, 7, 8), { wash: PAL.ink, ink: null }); }
      // the slow car: up the side, peels off, falls
      const ts = L(9, 6.6);
      if (t > ts) {
        const d0 = Math.min(ENTRY + (PI / 2 + 1.15) * LR, 700 * (t - ts) - 160 * (t - ts) * (t - ts)), td = ts + 1.69;
        let X, Y, Aa;
        if (t < td) [X, Y, Aa] = onLoop(d0, 1);
        else { const a0 = -1.15, p0 = [LC[0] + LR * Math.cos(a0), LC[1] + LR * Math.sin(a0)], v = 160, dd = t - td, fw = [Math.sin(a0), -Math.cos(a0)];
          X = p0[0] + fw[0] * v * dd; Y = Math.min(LG, p0[1] + fw[1] * v * dd + 1100 * dd * dd); Aa = Y >= LG ? 0 : a0 - PI / 2 - 3.2 * Math.min(dd, .55); }
        if (Y < LG || t < td + 1.5) car(X, Y, Aa, .5, { col: R.slate, dk: R.slateDk, key: 'c2' });
        K.cross(X, Y - 150, 90, seg(t, td + .75, td + 1.3), 'cx');
      }
      host(260, LG + 16, 30, t, [[0, 'calm', { lookX: 1 }], [L(8, 1.0), 'excited', { lookX: 1, lookY: -.5 }], [L(8, 5.0), 'wow', { lookX: 1, lookY: -1 }], [L(9, .5), 'calm', { lookX: 1, lookY: -.6 }], [L(9, 8.0), 'worried', { lookX: 1, lookY: -.8 }]], { key: 'pc' });
      camEnd();
    } else {
      camBegin(960 + 6 * wob(t, .05), 520 + 5 * wob(t, .04), 1);
      board(t, 'r', '#F2EAD8');
      const k1 = popK(t, tR + .2, .5), k2 = popK(t, tR + .45, .5), k3 = popK(t, tR + .7, .5);
      recapCard(420, 450, k1, pulseW(t, L(10, 4.0)) * .06 + .94 + .06 * (t > L(10, 4) ? Math.exp(-3 * (t - L(10, 4))) : 0), 'a', () => {
        boilSeed('ra1'); inkLine([[220, 560], [620, 560]], 1.4, PAL.ink, 'ink', 0);
        car(420, 560, 0, .45, { col: R.slate, dk: R.slateDk, key: 'r1' });
        arrow(420, 532, PI / 2, 130, R.mg, { key: 'r1m', w: 13 }); arrow(420, 532, -PI / 2, 130, R.N, { key: 'r1n', w: 13, pw: pulseW(t, L(10, 4.0)) });
      });
      recapCard(960, 450, k2, 1, 'b', () => {
        boilSeed('ra2'); const P = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU; P.push([960 + 140 * Math.cos(a), 470 + 140 * Math.sin(a)]); } inkLine(P, 2.4, R.concrete, 'ink', .5);
        car(960, 330, PI, .25, { col: R.orange, dk: R.orangeDk, key: 'r2', shadow: false });
        for (let i = 0; i < 3; i++) inkLine([[1010 + i * 16, 330 - 20 + i * 8], [1080 + i * 18, 330 - 20 + i * 8]], 1.4, PAL.ink, 'dry', 0);
        arrow(960, 350, PI / 2, 95, R.N, { key: 'r2n', w: 12, pw: pulseW(t, L(10, 6.0)) });
      });
      recapCard(1500, 450, k3, 1, 'c', () => {
        boilSeed('ra3'); const P = []; for (let i = 0; i <= 20; i++) { const a = lerp(PI / 2, -1.1, i / 20); P.push([1400 + 170 * Math.cos(a), 450 + 170 * Math.sin(a)]); } inkLine(P, 7, R.concrete, 'ink', .5);
        const a = -.9; car(1400 + 170 * Math.cos(a), 450 + 170 * Math.sin(a), a - PI / 2, .32, { key: 'r3', shadow: false });
        if (t > L(10, 8.2)) pipEmote('question', 1390, 400, 44 * popK(t, L(10, 8.2)), 1, 'rq');
      });
      host(960, 1010, 28, t, [[0, 'calm', { lookY: -.6 }], [L(10, 4.0), 'calm', { lookX: -.8, lookY: -.6 }], [L(10, 6.0), 'calm', { lookX: 0, lookY: -.8 }], [L(10, 8.4), 'confused', { lookX: .8, lookY: -.6 }]], { key: 'pr' });
      camEnd();
    }
    if (t > tR - .6 && t < tR + .6) brushWipe(seg(t, tR - .6, tR + .6), ['#E7DCC4', PAL.cream]);
    if (lt > dur - .3) brushWipe(seg(lt, dur - .3, dur + .3), [R.air, R.airLt]);
  }

  // ---------- D: the air ----------
  function airWorld(t) {
    K.wash(R.airBg, t, { key: 'd', blob: PAL.cream, n: 6 });
    K.motes(t, 26, R.airLt, { key: 'd' });
  }
  function gauge(x, y, r, k, dip, t) {
    if (k <= 0) return;
    boilSeed('gauge');
    push(); translate(x, y); scale(k);
    paint(ellPts(0, 0, r, r, 28), { wash: PAL.cream, ink: PAL.ink, sw: 1.6 });
    for (let i = 0; i <= 10; i++) { const a = PI * .8 + i / 10 * PI * 1.4; inkLine([[Math.cos(a) * r * .78, Math.sin(a) * r * .78], [Math.cos(a) * r * .9, Math.sin(a) * r * .9]], i % 5 ? 1 : 2, PAL.ink, 'ink', 0); }
    const a0 = PI * .8 + PI * 1.4 * .9, a = a0 - PI * 1.4 * .05 * dip;
    paint(ribbon([[0, 0], [Math.cos(a) * r * .74, Math.sin(a) * r * .74]], 7, 2), { wash: '#D0574E', ink: PAL.ink, sw: .8 });
    paint(ellPts(0, 0, 8, 8, 10), { wash: PAL.ink, ink: null });
    pop();
  }
  function shotD(t, lt, dur) {
    K.setT(t);
    const t2 = L(12, -.8), tRot = L(13, -.3), rot = -PI / 2 * ease(seg(t, tRot, L(13, 1.5))) - (PI / 2 - .4) * ease(seg(t, L(14, 4.2), L(14, 7.4)));
    if (t < t2) {
      camBegin(960 + 6 * wob(t, .05), 540 + 5 * wob(t, .04), 1);
      airWorld(t);
      const P = [960, 700];
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU, k = popK(t, L(11, 3.0) + i * .05), push_ = 14 * Math.max(0, Math.sin((t - i * .1) * 5)) * seg(t, L(11, 4), L(11, 5));
        const r0 = 330 - push_, cx = P[0] + Math.cos(a) * r0, cy = P[1] - 110 + Math.sin(a) * r0;
        arrow(cx, cy, a + PI, 110 * k, R.air, { key: 'da' + i, w: 13, pw: pulseW(t, L(11, 5.6)) });
      }
      host(960, 700, 36, t, [[0, 'calm', { lookY: -.4 }], [L(11, 3.4), 'wow', { lookX: -.6, lookY: -.6 }], [L(11, 5.6), 'strain'], [L(11, 8.6), 'happy']], { key: 'pd' });
      camEnd();
      if (lt < .3) brushWipe(.5 + lt / .6, [R.air, R.airLt]);
      if (t > t2 - .5) brushWipe(seg(t, t2 - .5, t2 + .5) * .5, [R.air, R.airLt]);
    } else {
      const G = [960, 760];
      camBegin(960 + 6 * wob(t, .05), 600 + 5 * wob(t, .04), t < tRot ? 1.05 : lerp(1.05, .9, ease(seg(t, tRot, L(13, 1.5)))), rot);
      airWorld(t);
      boilSeed('dgr'); paint(rectPts(-1400, G[1], 3800, 1400), { wash: '#B7B0A6', ink: null }); inkLine([[-1400, G[1]], [2400, G[1]]], 1.2, PAL.ink, 'ink', 0);
      const fanK = seg(t, L(12, 1.0), L(12, 2.6)), spinA = t * 14 * fanK;
      const s = 1.1, cx = G[0] + (t < L(12, 0) ? 1400 * Math.pow(1 - seg(t, t2, L(12, 0)), 2) : 0);
      // outside air pushing on the roof, and under the floor (which fades as the fan pulls it out)
      const under = 1 - .8 * ease(seg(t, L(12, 2.4), L(12, 5.0))), aK = popK(t, L(12, 0.6));
      for (let i = 0; i < 7; i++) { const u = -180 + i * 60, [px, py] = carPt(cx, G[1], 0, s, u, -175); arrow(px, py - 70, PI / 2, 60 * aK, R.air, { key: 'dr' + i, w: 11 }); }
      for (let i = 0; i < 5; i++) { const u = -150 + i * 75, [px, py] = carPt(cx, G[1], 0, s, u, -2); arrow(px, py, -PI / 2, 22 * aK * under, R.air, { key: 'du' + i, w: 8 }); }
      boilSeed('band'); if (t > L(12, 7.4) && t < L(13, 9)) { const k = seg(t, L(12, 7.4), L(12, 8)); const [ax, ay] = carPt(cx, G[1], 0, s, -215, -26); paint(rectPts(ax, ay, 440 * s * k, 22, 1), { wash: R.air, washOp: 120 * pulseW(t, L(13, 6.6)), ink: null }); }
      suck(cx, G[1], 0, s, t, fanK, 'd');
      car(cx, G[1], 0, s, { key: 'rd', fan: spinA });
      const Gc = carPt(cx, G[1], 0, s, 0, -60), mgDir = PI / 2 - rot;
      if (t < tRot) arrow(Gc[0], Gc[1] - 240, PI / 2, 150 * popK(t, L(12, 9.2)), R.air, { key: 'dbig', w: 22 });
      else {
        const kk = seg(t, L(13, 1.5), L(13, 2));
        arrow(Gc[0], Gc[1] - 240, PI / 2, 150 * kk, R.air, { key: 'dbig', w: 22, pw: pulseW(t, L(13, 3.6)) });
        arrow(Gc[0], Gc[1], mgDir, 190 * popK(t, L(13, 2.6)), R.mg, { key: 'dmg', pw: pulseW(t, L(13, 5.2)) });
        const fk = popK(t, L(13, 4.2)) * (1 - seg(t, L(14, 4.2), L(14, 5)));
        arrow(Gc[0], Gc[1], mgDir + PI, 190 * fk, R.f, { ghost: 1, key: 'dgh' });
        arrow(Gc[0], Gc[1], mgDir + PI, 190 * popK(t, L(13, 12.2)) * (1 - seg(t, L(14, 4.2), L(14, 5))), R.f, { key: 'df' });
      }
      camEnd();
      if (t < t2 + .5) brushWipe(.5 + seg(t, t2 - .5, t2 + .5) * .5, [R.air, R.airLt]);
      gauge(330, 280, 120, popK(t, L(13, 9.4)) * (1 - seg(t, L(14, 2), L(14, 2.5))), ease(seg(t, L(13, 10.0), L(13, 11.4))), t);
      K.check(1500, 300, 110, seg(t, L(13, 12.6), L(13, 13.3)) * (t < L(14, 1) ? 1 : 0), 'dc');
      K.swim(240, 1000, 28, t, { ...K.act(t, [[0, 'calm', { lookX: 1, lookY: -.5 }], [L(12, 3), 'wow', { lookX: 1, lookY: -.3 }], [L(13, 2), 'calm', { lookX: 1, lookY: -.6 }], [L(13, 12.4), 'smug'], [L(14, 6.6), 'wow', { lookX: 1, lookY: -.9 }]]), talk: false }, 'pd2');
    }
    if (lt > dur - .3) brushWipe(seg(lt, dur - .3, dur + .3), ['#E9B86A', R.warm]);
  }

  // ---------- E: the launch ----------
  function shotE(t, lt, dur) {
    K.setT(t);
    const g = 840, wh = seg(lt, dur - .45, dur);
    camBegin(960 + 8 * wob(t, .05) + 2200 * easeIn(wh), 520 + 5 * wob(t, .04), 1);
    K.wash(R.warm, t, { key: 'e', blob: '#FBEBD0', n: 5 });
    glow(1500, 160, 300, '#FFE2A0', .35);
    boilSeed('egr'); paint([[-800, g - 20], [-200, g - 90], [500, g - 60], [1200, g - 110], [2000, g - 70], [2800, g - 90], [2800, g], [-800, g]], { wash: '#D8B98A', ink: null, curv: .5 });
    paint(rectPts(-800, g, 4800, 600), { wash: R.asphalt, ink: null });
    inkLine([[-800, g], [4000, g]], 1.2, PAL.ink, 'ink', 0);
    paint(rectPts(560, g + 2, 26, 240), { wash: PAL.cream, washOp: 200, ink: null });
    for (let i = 0; i < 12; i++) paint(rectPts(-600 + i * 400, g + 120, 180, 10), { wash: '#E6D6A8', washOp: 160, ink: null });
    const tL = L(16, 7.2), x = 700 + (t > tL ? 1800 * Math.pow(t - tL, 2) : 0), fanK = seg(t, L(16, 1.0), L(16, 2.4));
    const spinning = t > L(15, 10.6) && t < L(16, 0);
    suck(x, g, 0, .6, t, fanK, 'e');
    car(x, g, 0, .6, { key: 're', spin: spinning ? t * 30 : t > tL ? -(t - tL) * 40 : 0 });
    if (spinning) { boilSeed('smk'); for (let i = 0; i < 8; i++) { const k = frac(t * 1.5 + hash(i)), sx = x - 85 - 160 * k, sy = g - 20 - 60 * k * hash(i + 2); paint(ellPts(sx, sy, 20 + 40 * k, 14 + 26 * k, 10), { wash: '#D9D2CA', washOp: 190 * (1 - k), ink: null }); } }
    if (t > tL) { boilSeed('esp'); for (let i = 0; i < 6; i++) inkLine([[x - 160 - i * 30, g - 30 - i * 14], [x - 600 - i * 30, g - 30 - i * 14]], 1.8, PAL.cream, 'dry', 0); }
    const G = [x + 40, g - 50];
    if (t < tL + .2) {
      const cap = 160 * lerp(1, 2.7, ease(seg(t, L(16, 4.8), L(16, 6.6))));
      arrow(G[0] + 130, G[1] - 34, 0, cap * popK(t, L(15, 9.6)), R.f, { ghost: 1, w: 18, key: 'ecap', pw: pulseW(t, L(15, 11.6)) * pulseW(t, L(16, 6.6)) });
      arrow(G[0] + 130, G[1] + 10, 0, 432 * popK(t, L(15, 6.0), .6), R.acc, { dash: 1, w: 18, key: 'eneed', pw: pulseW(t, L(15, 7.4)) });
      arrow(G[0] - 40, g - 10, -PI / 2, 120 * lerp(1, 2.7, ease(seg(t, L(16, 2.4), L(16, 4.6)))) * popK(t, L(16, 2.0)), R.N, { key: 'eN', pw: pulseW(t, L(16, 4.6)) });
    }
    host(230, g, 30, t, [[0, 'calm', { lookX: 1 }], [L(15, 6.4), 'wow', { lookX: 1 }], [L(15, 10.8), 'worried', { lookX: 1, lookY: .3 }], [L(16, 2.4), 'idea', { lookX: 1 }], [L(16, 7.2), 'excited', { lookX: 1 }]], { key: 'pe' });
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E9B86A', R.warm]);
    speedLines(wh, 'e', true);
  }

  // ---------- F: back to the night ramp: let go ----------
  function shotF(t, lt, dur) {
    K.setT(t);
    const tG = L(17, 9.4), tG1 = L(17, 11.2), dawn = ease(seg(t, L(18, 7.6), L(18, 10.6)));
    const c = kf(t, [[0, [1400, 300, 1.4]], [L(17, 8.6), [1400, 300, 1.45]], [L(17, 10.6), [1080, 560, .95]], [L(18, 6), [1000, 640, 1]], [L(19, -1.7), [900, 660, 1]]], ease);
    const sh = t > tG1 ? shakeXY(t, 9 * Math.exp(-6 * (t - tG1))) : [0, 0];
    camBegin(c[0] + 6 * wob(t, .05) + sh[0], c[1] + 5 * wob(t, .06) + sh[1], c[2]);
    site(t, { dawn });
    let [cx, cy, ca] = onRamp(A_PARK);
    const ease0 = 40 * ease(seg(t, L(17, 4.6), tG)), n = [-Math.cos(A_PARK), -Math.sin(A_PARK)];
    if (t < tG) { cx += n[0] * ease0; cy += n[1] * ease0; }
    else { const f = flight(t, tG, tG1); cx = f.x; cy = f.y; ca = f.a; }
    const hop = t > L(18, 4.6) ? 110 * Math.sin(PI * seg(t, L(18, 4.6), L(18, 7.4))) : 0;
    if (t > tG1) cy -= hop;
    const fanOn = t < L(17, 2.0) ? 1 : 1 - seg(t, L(17, 2.0), L(17, 2.8));
    suck(cx, cy, ca, .55, t, t < tG1 ? fanOn : seg(t, L(18, .6), L(18, 1.2)) * (1 - seg(t, L(18, 3.6), L(18, 4.2))), 'f');
    jets(cx, cy, ca, .55, t, L(17, 4.4), tG1 + .3, 'f1', { floor: GROUND });
    jets(cx, cy, ca, .55, t, L(18, 4.5), L(18, 7.2), 'f2', { reach: 160, floor: GROUND });
    car(cx, cy, ca, .55, { key: 'rf' });
    if (t < tG) {
      const Gc = carPt(cx, cy, ca, .55, 0, -60), up = Math.atan2(n[1], n[0]);
      arrow(Gc[0], Gc[1], up, 150 * (1 - seg(t, L(17, 2.2), L(17, 3.4))), R.N, { key: 'fN' });
      const [bx, by] = carPt(cx, cy, ca, .55, 0, 30);
      arrow(bx, by, up + PI, 120 * popK(t, L(17, 6.2)), PAL.cream, { key: 'fpush', w: 16 });
      arrow(Gc[0], Gc[1], up, 140 * popK(t, L(17, 7.3)), R.thrust, { key: 'fthr', w: 16, pw: pulseW(t, L(17, 8.6)) });
    }
    if (t > tG1) { const G = carPt(cx, cy, 0, .55, 0, -60); if (t < L(18, 4.0)) arrow(G[0], G[1] - 40, -PI / 2, 110 * popK(t, L(18, 1.0)) * (1 - seg(t, L(18, 3.6), L(18, 4.0))), R.N, { key: 'fN2' }); }
    host(560, GROUND, 30, t, [[0, 'calm', { lookX: .8, lookY: -.8 }], [L(17, 9.6), 'wow', { lookX: .9, lookY: -.6 }], [L(18, .5), 'idea', { lookX: 1, lookY: .1 }], [L(18, 5), 'excited', { lookX: 1, lookY: 0 }]], { key: 'pf' });
    camEnd();
    if (lt < .3) speedLines(.5 + .5 * lt / .3, 'f', true);
  }

  // ---------- G: dawn; the drawing ----------
  function drawing(x, y, a, s, key) {                                 // a child's crayon picture of a flying car
    boilSeed('dr' + key);
    push(); translate(x, y); rotate(a); scale(s);
    paint(rectPts(-80, -58, 160, 116, 2), { wash: '#FBF6EA', ink: PAL.ink, sw: 1 });
    inkLine([[-50, 10], [-46, -8], [-20, -14], [-10, -28], [22, -28], [34, -12], [56, -8], [58, 10], [-50, 10]], 1.6, '#D0574E', 'cpencil', .2);
    inkLine([[-30, 14], [-30, 16]], 4, PAL.ink, 'cpencil', 0); inkLine([[38, 14], [38, 16]], 4, PAL.ink, 'cpencil', 0);
    inkLine([[-10, -16], [-42, -46], [8, -22]], 1.4, '#4F86C6', 'cpencil', .2); inkLine([[20, -16], [52, -44], [30, -14]], 1.4, '#4F86C6', 'cpencil', .2);
    inkLine([[52, -40], [64, -48]], 1.2, '#E8AA38', 'cpencil', 0); paint(ellPts(56, -42, 9, 9, 10), { wash: '#F5C842', washOp: 200, ink: null });
    inkLine([[-70, 30], [70, 30]], 1.4, '#6E9F58', 'cpencil', .4);
    pop();
  }
  function shotG(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[0, [900, 660, 1]], [L(20, .5), [900, 660, 1]], [L(20, 4), [880, 560, .95]], [L(21, 7), [760, 640, 1.02]], [DUR, [640, 720, 1.12]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .06), c[2]);
    site(t, { dawn: 1 });
    // the Roadster lifts off and goes
    const tUp = L(20, 1.0), tAway = L(21, 3.0);
    const up = ease(seg(t, tUp, L(20, 5.2))), away = easeIn(seg(t, tAway, L(21, 9)));
    const cx = 880 + 1600 * away, cy = GROUND - 380 * up - 500 * away, ca = -.08 * up - .15 * away, cs = .55 * (1 - .5 * away);
    if (t > tUp - .3) jets(cx, cy, ca, cs, t, tUp - .3, DUR, 'g', { reach: 200, floor: GROUND });
    car(cx, cy, ca, cs, { key: 'rg', shadow: up < .1 });
    // the drawing: lies by Pip, skitters off, rides the jets' wash back into Pip's hands
    const px = 470, o = K.act(t, [[0, 'calm', { lookX: .6, lookY: .6 }], [L(19, 4.4), 'shy', { lookX: .9, lookY: .5, blush: .6 }], [L(20, 1.4), 'wow', { lookX: .8, lookY: -.6 }],
      [L(20, 4.2), 'love', { lookX: .6, lookY: -.6 }], [L(21, 1.0), 'happy', { lookX: .4, lookY: -.8 }], [L(21, 6.8), 'wave', { lookX: .6, lookY: -.8 }]]);
    const hold = t > L(20, 5.6);
    let dx, dy, da, ds = .9;
    if (t < L(19, 4.2)) { dx = 600; dy = GROUND - 8; da = -.05; }
    else if (t < L(20, 2.6)) { const k = ease(seg(t, L(19, 4.2), L(19, 7.6))); dx = 600 + 380 * k; dy = GROUND - 8 - 40 * Math.sin(k * PI * 2) * (1 - k); da = -.05 + 2 * PI * k; }
    else if (!hold) { const k = seg(t, L(20, 2.6), L(20, 5.6)), p = arcPt([980, GROUND - 8], [px + 70, GROUND - 150], 260, ease(k)); dx = p[0]; dy = p[1]; da = 4 * k + .3 * Math.sin(k * 12); }
    const opt = { ...o, flip: false, key: 'pg' };
    if (hold) opt.armF = { at: [2.2, -2.6 - .3 * ease(seg(t, L(21, 1), L(21, 2)))] };
    if (hold && t > L(21, 6.8)) opt.armF = undefined;
    pip(px, GROUND, 32, opt);
    if (hold && t < L(21, 6.8)) { const [hx, hy] = K.hand(px, GROUND, 32, opt.armF.at, { dy: o.dy }); drawing(hx + 40, hy - 50, -.1, 1.3, 'h'); }
    else if (hold) drawing(px - 10, GROUND - 6, -.04, 1.0, 'l');
    else drawing(dx, dy, da, ds, 'f');
    const at = toScreen(px, GROUND - 90);
    camEnd();
    if (lt < 1.2) { const k = 1 - seg(lt, 0, 1.2); if (k > 0) paint(rectPts(-60, -60, W + 120, H + 120), { wash: R.night, washOp: 255 * k * k * .5, ink: null }); }
    if (t > DUR - 3.4) iris(...at, lerp(1700, 0, ease(seg(t, DUR - 3.4, DUR - .6))));
  }

  // ---------- the covers ----------
  function coverArt(t, o) {                                       // the car hangs big; Pip looks up from the corner
    camBegin(o.cam[0], o.cam[1], o.cam[2]);
    site(1, {});
    const [x, y, a] = onRamp(A_PARK);
    suck(x, y, a, .55, 1.2, 1, 'cv');
    car(x, y, a, .55, { key: 'cv' });
    camEnd();
    pip(o.pip[0], o.pip[1], o.u, { ...pipFeel('worried', 1.3), face: 'wow', emote: 'exclaim', emoteK: 1, lookX: 1, lookY: -1, armF: [.9, 2.4], armB: [.5, 1.6], noShadow: true, key: 'cvp' });
  }
  const COVER_FONT = '"HanziPen SC", "Wawati SC", "PingFang SC", sans-serif';
  const measure = (txt, size) => { const c = (measure.c ||= document.createElement('canvas').getContext('2d')); c.font = `bold ${size}px ${COVER_FONT}`; return c.measureText(txt).width; };
  function coverText(x, y, size, parts) {                         // one line of mixed colours, left-aligned at x, centred on y
    let cx = x;
    for (const [txt, col, k = 1] of parts) { const sz = size * k; letter(txt, cx, y, sz, col, { screen: true, align: 'left', font: `bold ${sz}px ${COVER_FONT}`, stroke: PAL.ink }); cx += measure(txt, sz) + size * .02; }
  }
  LOOPS.cover = t => {
    coverArt(t, { cam: [1290, 250, 2.3], pip: [330, 1180], u: 60 });
    coverText(80, 200, 128, [['车能', PAL.cream], ['倒着停', R.thrust, 1.1]]);
    coverText(80, 390, 180, [['？！', '#E8524A']]);
    flushLetters();
  };
  LOOPS.cover.len = 2;
  LOOPS.cover43 = t => {                                          // crop x 240..1680 afterwards
    coverArt(t, { cam: [1270, 250, 2.2], pip: [520, 1170], u: 56 });
    coverText(240 + 70, 200, 108, [['车能', PAL.cream], ['倒着停', R.thrust, 1.1]]);
    coverText(240 + 70, 380, 160, [['？！', '#E8524A']]);
    flushLetters();
  };
  LOOPS.cover43.len = 2;

  shots([[0, shotA], [L(4, -1.6), shotB], [L(8, -1.6), shotC], [L(11, -2.0), shotD], [L(15, -1.6), shotE], [L(17, -1.6), shotF], [L(19, -1.7), shotG]]);
})();

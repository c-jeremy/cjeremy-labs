// thermo.js: "Pip讲体温调节", 290 s. How the body senses cold and heat and holds itself near 37 °C: the TRPV1 / TRPM8
// channels (and the chili and mint that fool them), the hypothalamus thermostat, the cold responses (vasoconstriction,
// goosebumps, shivering, thyroid hormone and adrenaline, brown fat's UCP1 proton leak), the heat responses
// (vasodilation, sweating and evaporation, why humid heat is worse) and the negative-feedback loop. Tom-and-Jerry tone:
// every fact lands on Pip as an exaggerated transformation. See STORYBOARD_THERMO.md. Props from mrna_kit.js (MK).
// Every time is tied to a voice line: L(i, d) = line i's start + d seconds, so a retimed line moves its pictures.
(() => {
  const K = MK;
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const Z = {
    hot: '#E4604E', hotDk: '#B23F30', cold: '#6FB4E0', coldDk: '#3F7FB4', ice: '#D4ECF8',
    na: '#E8AA38', ca: '#9C7BC4', prot: '#E27A92', caps: '#E0482F', menth: '#6CC08A', atp: '#F2C14A',
    kitchen: '#F6D3AE', kitchenBlob: '#FBE6CC', wood: '#C98E5A', woodDk: '#A86F42',
    skinAir: '#FBEFE2', epi: '#9B6A9C', epiDk: '#7A4E7C', derm: '#F2C9CF', dermDk: '#E2A7B1', blood: '#D2413F', bloodDk: '#9E2B2B',
    nerve: '#F4D58A', nerveDk: '#C9A452',
    out: '#FBE3D2', outCool: '#DCEEF3', axo: '#F3D5DA', axoDk: '#E6B9C1',
    brainBg: '#E2DEF2', brainBlob: '#F2EFFA', brain: '#F2B8C4', brainDk: '#D88C9C',
    night: '#2E3F73', nightBlob: '#435591', snow: '#EAF2FA', snowDk: '#C5D6EA',
    fat: '#F3D3A4', fatDk: '#D9AE70', drop: '#FBEFB8', mito: '#B8754A', mitoDk: '#8C5234', ims: '#F4DCC8', matrix: '#EFC795',
    sky: '#F7DDA0', dune: '#E8B564', duneDk: '#D49A45', fog: '#C9D8D6', board: '#F5EEDD', boardBlob: '#FBF6EA', iron: '#4B4250'
  };
  const HOT = { pip: '#D9604E', pipDk: '#A8402F', belly: '#F7CDBE' }, COLD = { pip: '#7398CF', pipDk: '#4D6FA8', belly: '#DFE9F6' };
  const BASE = { pip: PIPC.pip, pipDk: PIPC.pipDk, belly: PIPC.belly };
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));
  const pulseK = (t, a, len = .7) => t > a && t < a + len ? Math.sin(seg(t, a, a + len) * Math.PI) : 0;
  const on = (t, a, b, fi = .3, fo = .3) => Math.min(ease(seg(t, a, a + fi)), 1 - ease(seg(t, b - fo, b)));   // 0→1 at a, 1→0 at b

  // ---------- Pip, recoloured: hot (coral) or cold (ice blue) by k ----------
  function tinted(cols, fn) { const old = { ...BASE }; Object.assign(PIPC, cols); try { fn(); } finally { Object.assign(PIPC, old); } }
  function pipT(x, y, u, o, hot = 0, cold = 0) {
    const tint = hot >= cold ? HOT : COLD, k = clamp(Math.max(hot, cold));
    if (k <= .01) return pip(x, y, u, o);
    const cols = {}; for (const c in BASE) cols[c] = mixCol(BASE[c], tint[c], k);
    tinted(cols, () => pip(x, y, u, o));
  }
  // MK.swim, recoloured: Pip the host paddling in place
  function swimT(x, y, u, t, o, key, hot = 0, cold = 0) {
    const bob = 7 * Math.sin(t * 2.1 + (o.seed || 0));
    pipT(x, y + bob, u, { walk: o.walk ?? t * 2.2, rot: (o.rot || 0) + .03 * Math.sin(t * 1.05), ...o, sq: (o.sq || 0) + (o.talk ? .03 * voAt(t) : 0), noShadow: true, key }, hot, cold);
    return y + bob;
  }
  // where Pip's mouth and head top are, in world space (no rotation)
  const mouthOf = (x, y, u, o) => { const d = o.flip ? -1 : 1, sq = o.sq || 0, fx = (o.turn ?? .4) * .38 * u; return [x + d * (1 + sq) * fx * 1.05, y + (o.dy || 0) * u - (1 - sq) * 2.55 * u]; };
  const headOf = (x, y, u, o) => [x, y + (o.dy || 0) * u - (1 - (o.sq || 0)) * 5 * u];
  // Pip's egg outline in world space (matches pip.js)
  function eggAt(x, y, u, o, a) {
    const d = o.flip ? -1 : 1, sq = o.sq || 0, c = Math.cos(a), s = Math.sin(a);
    return [x + d * (1 + sq) * s * 1.8 * u * (1 - .1 * c), y + (o.dy || 0) * u + (1 - sq) * (-2.5 * u - c * 2.45 * u)];
  }
  const jitter = (t, amp, sd = 0) => amp ? (hash(Math.floor(t * 24) * 1.37 + sd) - .5) * 2 * amp : 0;

  // ---------- painted effects ----------
  function flames(x, y, dir, len, t, k, key, up = -.12) {        // a flame jet from a mouth: red, orange, yellow cones
    if (k <= .02) return; boilSeed('fl' + key);
    const Ln = len * k * (1 + .12 * wob(t, 7) + .06 * wob(t, 13)), P = q => { const out = []; for (let i = 0; i <= 6; i++) { const s = i / 6; out.push([x + dir * Ln * q * s, y + up * Ln * q * s + 10 * q * s * wob(t, 5, s)]); } return out; };
    glow(x + dir * Ln * .45, y + up * Ln * .45, Ln * .7, '#FF9A40', .7 * k);
    paint(ribbon(P(1), 8, Ln * .42), { wash: '#E2462E', ink: PAL.ink, sw: .9, curv: .3 });
    paint(ribbon(P(.78), 6, Ln * .28), { wash: '#F28C2E', ink: null });
    paint(ribbon(P(.52), 4, Ln * .16), { wash: '#FCD15A', ink: null });
  }
  function flameIcon(x, y, r, t, key) {                           // a teardrop flame, flickering
    if (r < 2) return; boilSeed('fi' + key);
    const tear = (s, f) => { const P = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, w = Math.sin(a / 2); P.push([x + Math.sin(a) * r * s * .62 * (.4 + .6 * w), y - Math.cos(a) * r * s * (1 + .1 * f) + r * s * .3 * w]); } return P; };
    const f = wob(t, 4);
    paint(tear(1, f), { wash: '#E2462E', ink: PAL.ink, sw: 1.1, curv: .4 });
    paint(tear(.66, -f).map(([a, b]) => [a, b + r * .25]), { wash: '#F28C2E', ink: null, curv: .4 });
    paint(tear(.36, f).map(([a, b]) => [a, b + r * .45]), { wash: '#FCD15A', ink: null, curv: .4 });
  }
  function steam(x, y, u, t, k, key, n = 5) {                       // puffs rising from a point
    if (k <= .02) return;
    for (let i = 0; i < n; i++) {
      boilSeed('st' + key + i);
      const q = frac(t * .9 + i / n), r = (.3 + .8 * q) * .55 * u * k;
      paint(ellPts(x + (hash(i + 4) - .5) * u + .8 * u * q * wob(t, .4, i), y - q * 2.6 * u, r, r * .8, 12, 2), { fill: PAL.cream, fillOp: 200 * (1 - q) * k, bleed: .2, tex: .3, ink: null });
    }
  }
  function shakeLines(x, y, u, k, key) {                           // the vibration marks either side of a shaking body
    if (k <= .02) return; boilSeed('sh' + key);
    for (const sd of [-1, 1]) for (let j = 0; j < 2; j++) {
      const r = (2.3 + j * .55) * u, P = []; for (let i = 0; i <= 4; i++) { const a = -.5 + i / 4; P.push([x + sd * r * Math.cos(a * .9), y - 2.5 * u + r * Math.sin(a * .9) * .8]); }
      inkLine(P, 1.4 * k, PAL.ink, 'ink', .6);
    }
  }
  function spikes(x, y, u, o, k, key, wilt = 0, n = 26, angles = null) {   // porcupine hair: drawn BEFORE Pip so the roots hide
    if (k <= .02) return; boilSeed('spk' + key);
    const As = angles || [...Array(n)].map((_, i) => -2.55 + i / (n - 1) * 5.1);
    for (let i = 0; i < As.length; i++) {
      const a = As[i]; if (Math.abs(a) < .25) continue;    // keep the leaf stalk clear
      const p = eggAt(x, y, u, o, a), c = [x, y + (o.dy || 0) * u - 2.5 * u], dx = p[0] - c[0], dy = p[1] - c[1], d = Math.hypot(dx, dy) || 1;
      const len = u * (1.3 + .5 * hash(i + 7)) * backOut(k), droop = wilt * 1.6 * Math.sign(dx || 1);
      const ex = p[0] + dx / d * len, ey = p[1] + dy / d * len, tip = [ex + droop * u * .4, ey + wilt * len * .9];
      paint(ribbon([[p[0] - dx / d * u * .3, p[1] - dy / d * u * .3], [lerp(p[0], tip[0], .5), lerp(p[1], tip[1], .5) - wilt * u * .2], tip], .28 * u, .04 * u), { wash: PIPC.pipDk, ink: PAL.ink, sw: .7 });
    }
  }
  function bumps(x, y, u, o, k, key) {                             // goosebumps on the body
    if (k <= .02) return; boilSeed('bmp' + key);
    const spots = [[-1.4, -1.2], [-1.55, -2.1], [-1.2, -3.9], [1.45, -1.1], [1.6, -2.0], [1.25, -4.0], [-.6, -4.6], [.5, -4.7], [-1.0, -.6], [1.0, -.55], [-1.65, -3.0], [1.62, -3.05]];
    spots.forEach(([a, b], i) => {
      const q = backOut(seg(k, i / spots.length * .5, i / spots.length * .5 + .5)), d = o.flip ? -1 : 1, sq = o.sq || 0;
      const px = x + d * (1 + sq) * a * u, py = y + (o.dy || 0) * u + (1 - sq) * b * u;
      if (q > .05) { paint(ellPts(px, py, .27 * u * q, .22 * u * q, 10), { wash: mixCol(PIPC.pip, PAL.cream, .4), ink: PAL.ink, sw: .9 }); paint(ellPts(px - .07 * u, py - .07 * u, .07 * u * q, .06 * u * q, 6), { wash: PAL.cream, ink: null }); }
    });
  }
  function snowflake(x, y, r, rot, col, key) {
    boilSeed('sf' + key);
    for (let i = 0; i < 6; i++) {
      const a = rot + i * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
      inkLine([[x, y], [x + c * r, y + s * r]], Math.max(.6, r / 12), col, 'ink', 0);
      for (const sd of [-1, 1]) { const b = a + sd * .6, m = [x + c * r * .55, y + s * r * .55]; inkLine([m, [m[0] + Math.cos(b) * r * .35, m[1] + Math.sin(b) * r * .35]], Math.max(.5, r / 16), col, 'ink', 0); }
    }
  }
  function heatLines(x, y, w, h, t, k, key, n = 4, col = Z.hot) {  // wavy heat lines rising (h < 0) or falling (h > 0)
    if (k <= .02) return; boilSeed('hl' + key);
    for (let i = 0; i < n; i++) {
      const ph = frac(t * .7 + i / n), x0 = x + (i / Math.max(1, n - 1) - .5) * w, P = [];
      for (let j = 0; j <= 6; j++) { const q = j / 6; P.push([x0 + 9 * Math.sin(q * 9 + t * 6 + i), y + h * (ph * .6 + q * .4)]); }
      inkLine(P, 2.4 * k * Math.sin(ph * Math.PI), col, 'ink', .6);
    }
  }
  function ring(x, y, rx, ry, k, col = Z.atp, key = 'rg', w = 4) {      // a highlight ring that swells and fades
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
  function cloud(cx, cy, rx, ry, k, from, key) {                  // a thought bubble with two little bubbles back to the thinker
    if (k <= .02) return; boilSeed('cl' + key);
    const q = backOut(k);
    paint(ellPts(lerp(from[0], cx, .22), lerp(from[1], cy, .22), 12 * q, 10 * q, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(ellPts(lerp(from[0], cx, .42), lerp(from[1], cy, .42), 20 * q, 17 * q, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; P.push([cx + Math.cos(a) * rx * q * (1 + .06 * Math.sin(a * 8)), cy + Math.sin(a) * ry * q * (1 + .06 * Math.sin(a * 8))]); }
    paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
  }
  function heartIce(x, y, r, ice, key) {                           // a heart that frosts over (the 凉心 pun)
    if (r < 2) return; boilSeed('hi' + key);
    paint(pipHeart(x, y, r), { wash: mixCol(PIPC.rose, Z.ice, ice), fill: ice > .3 ? Z.cold : PIPC.rose, fillOp: 60 * ice, tex: .5, ink: PAL.ink, sw: 1.2 });
    if (ice > .2) {
      inkLine([[x - r * .45, y - r * .35], [x - r * .2, y - r * .55]], 2 * ice, PAL.cream, 'ink', 0);
      for (let i = 0; i < 3; i++) { const ix = x + (i - 1) * r * .35, L0 = r * (.35 + .2 * hash(i + 3)) * ease(seg(ice, .3 + i * .15, .8 + i * .1)); if (L0 > 2) paint([[ix - r * .1, y + r * .55 - Math.abs(i - 1) * r * .2], [ix + r * .1, y + r * .55 - Math.abs(i - 1) * r * .2], [ix, y + r * .55 - Math.abs(i - 1) * r * .2 + L0]], { wash: Z.ice, ink: Z.coldDk, sw: .8 }); }
      for (let i = 0; i < 3; i++) snowflake(x + r * [.7, -.8, .1][i], y - r * [.9, .6, 1.2][i], r * .22 * ice, i, Z.coldDk, key + 'f' + i);
    }
  }

  // ---------- props ----------
  function chili(x, y, s, ang, bite, key) {                        // stem at (x, y), the pod hangs along ang
    boilSeed('chi' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    const full = [[0, 6], [9, 30], [4, 58], [-10, 82], [-24, 96]], n = Math.max(2, Math.round(lerp(5, 2.6, bite)));
    const P = full.slice(0, n); if (bite > 0) { const a = full[n - 1], b = full[Math.min(n, 4)], q = frac(lerp(5, 2.6, bite)); if (n < 5 && q > 0) P.push([lerp(a[0], b[0], q), lerp(a[1], b[1], q)]); }
    paint(ribbon(P, 22, bite > 0 ? 18 : 4), { wash: Z.caps, fill: '#A82620', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1 });
    if (bite > 0) { const e = P[P.length - 1]; paint(ellPts(e[0], e[1], 8, 5, 10), { wash: '#F6D9A8', ink: PAL.ink, sw: .8 }); }
    inkLine([[-4, 18], [0, 36]], 1.4, PAL.cream, 'ink', .4);
    paint(ellPts(0, 4, 13, 7, 12), { wash: '#5E9A44', ink: PAL.ink, sw: .9 });
    inkLine([[0, 2], [4, -10], [12, -16]], 2.2, '#4E7F36', 'ink', .6);
    pop();
  }
  function mint(x, y, s, key, frost = 0) {                         // a sprig: stalk and four leaves
    boilSeed('mi' + key);
    const col = mixCol(Z.menth, Z.ice, frost);
    inkLine([[x, y], [x + 4 * s, y - 40 * s], [x - 2 * s, y - 80 * s]], 2.2 * s, '#4E7F36', 'ink', .6);
    [[-1, 22, -.7], [1, 40, .7], [-1, 58, -.6], [1, 74, .5]].forEach(([sd, h, a], i) => paint(ellPts(x + sd * 15 * s, y - h * s, 17 * s, 9 * s, 14, 0, a), { wash: col, fill: '#3E8A54', fillOp: 50, tex: .4, ink: PAL.ink, sw: .9 }));
  }
  function magnifier(x, y, r, ang, key, k = 1) {                   // rim and handle; (x, y) = lens centre; handle points along ang
    if (k <= .02) return; boilSeed('mg' + key);
    const q = backOut(k), R = r * q, ca = Math.cos(ang), sa = Math.sin(ang);
    paint(ribbon([[x + ca * R * 1.02, y + sa * R * 1.02], [x + ca * R * 1.6, y + sa * R * 1.6]], R * .16, R * .19), { wash: '#8C5A34', fill: '#5E3A22', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
    const P = ellPts(x, y, R, R, 48); P.push(P[0], P[1], P[2]);
    paint(ribbon(P, R * .09, R * .09), { wash: '#C9963A', fill: '#8E6420', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.1 });
    inkLine(ellPts(x, y, R * .86, R * .86, 24).slice(1, 5), 2.5, PAL.cream, 'ink', .6);
    return [x + ca * R * 1.55, y + sa * R * 1.55];
  }
  // the band of a circle between two horizontal lines (for painting inside a lens)
  function circBand(cx, cy, r, y0, y1, n = 10) {
    const a = Math.max(y0, cy - r + .5), b = Math.min(y1, cy + r - .5); if (b <= a) return [];
    const R = [], Lf = []; for (let i = 0; i <= n; i++) { const y = lerp(a, b, i / n), w = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy))); R.push([cx + w, y]); Lf.push([cx - w, y]); }
    return R.concat(Lf.reverse());
  }
  const chord = (cx, cy, r, y, m = 0) => Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy))) - m;
  // the skin seen through a lens: air, epidermis (Pip's plum), dermis, a vessel, a hair with its erector muscle, a sweat gland,
  // free nerve endings. o: vessel (width), heat (0..1 heat leaving the surface), hair (0..1 standing), gland (0..1 pumping),
  // endings (0..1 lit), muscle (0..1 swap the scene for a twitching muscle fibre), drops (0..1 sweat on the surface), evap.
  function skinLens(cx, cy, r, t, o, key) {
    const sy = cy - .3 * r, ey = cy - .08 * r;
    boilSeed('sk' + key);
    paint(circBand(cx, cy, r, cy - r, sy), { wash: o.air || Z.skinAir, ink: null });
    paint(circBand(cx, cy, r, sy, ey), { wash: Z.epi, fill: Z.epiDk, fillOp: 70, tex: .5, ink: null });
    paint(circBand(cx, cy, r, ey, cy + r), { wash: Z.derm, fill: Z.dermDk, fillOp: 55, tex: .5, ink: null });
    { const w = chord(cx, cy, r, sy, 2); inkLine([[cx - w, sy], [cx, sy + 4 * Math.sin(t)], [cx + w, sy]], 1.3, PAL.ink, 'ink', .5); }
    if (o.muscle > 0) {                                            // a skeletal muscle fibre, striped, twitching
      boilSeed('mus' + key);
      const tw = o.muscle * (.5 + .5 * Math.sin(t * 40)), y0 = cy + .32 * r, hw = chord(cx, cy, r, y0, 20), sq = 1 - .12 * tw;
      paint(rrPts(cx - hw * sq, y0 - .2 * r * (2 - sq), 2 * hw * sq, .4 * r * (2 - sq), .1 * r), { wash: '#D9707A', fill: '#B04A58', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
      for (let i = -7; i <= 7; i++) { const x = cx + i * hw * sq / 8; inkLine([[x, y0 - .17 * r * (2 - sq)], [x, y0 + .17 * r * (2 - sq)]], 1.2, '#8E3644', 'inkfine', 0); }
      if (tw > .1) for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + t * 3; K.sparkle(cx + Math.cos(a) * hw * .8, y0 + Math.sin(a) * .3 * r, 16, frac(t * 2 + i / 5), '#F28C2E'); }
    }
    if (!o.muscle) {
      // vessel: a red tube across the dermis, its width set by o.vessel
      const vy = cy + .3 * r, hw = chord(cx, cy, r, vy, 6), vw = o.vessel ?? 40;
      boilSeed('ves' + key);
      paint(ribbon([[cx - hw, vy], [cx - hw * .3, vy + 10], [cx + hw * .3, vy - 8], [cx + hw, vy]], vw, vw), { wash: Z.blood, fill: Z.bloodDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1 });
      for (let i = 0; i < 6; i++) { const q = frac(t * .5 + i / 6), x = lerp(cx - hw * .9, cx + hw * .9, q); paint(ellPts(x, vy + 6 * Math.sin(q * 6), vw * .22, vw * .16, 10), { wash: '#F08A84', ink: null }); }
      // the hair, its follicle and the arrector pili muscle
      const fx = cx - .45 * r, fy = cy + .52 * r, ha = lerp(-.75, -.05, ease(o.hair || 0)), hl = .95 * r;
      boilSeed('hair' + key);
      paint(ellPts(fx, fy, .07 * r, .1 * r, 12), { wash: Z.epiDk, ink: PAL.ink, sw: .8 });
      const tip = [fx + Math.sin(ha) * hl * .62, fy - Math.cos(ha) * hl * .62 - .22 * r];
      inkLine([[fx, fy], [lerp(fx, tip[0], .5), lerp(fy, tip[1], .5)], tip], 3, '#3B2F3A', 'ink', .4);
      const mA = [fx + .03 * r, fy - .25 * r], mB = [fx + .26 * r, ey + .02 * r], mq = o.hair || 0;
      paint(ribbon([mA, [lerp(mA[0], mB[0], .5), lerp(mA[1], mB[1], .5) + 4], mB], .05 * r * (1 + .6 * mq), .04 * r * (1 + .6 * mq)), { wash: '#D9707A', ink: PAL.ink, sw: .7 });
      // the sweat gland: a coil deep down, a duct up to a pore
      const gx = cx + .42 * r, gy = cy + .6 * r, pump = o.gland || 0;
      boilSeed('gl' + key);
      const Pg = []; for (let i = 0; i <= 26; i++) { const a = i / 26 * TAU * 2.2; Pg.push([gx + Math.cos(a) * .09 * r * (1 + .1 * pump * Math.sin(t * 9)), gy + Math.sin(a) * .06 * r + i * .002 * r]); }
      inkLine(Pg, 4, '#B86B8A', 'ink', .6);
      inkLine([[gx, gy - .06 * r], [gx + .03 * r, cy + .1 * r], [gx, sy]], 4, '#B86B8A', 'ink', .5);
      if (pump > 0) for (let i = 0; i < 4; i++) { const q = frac(t * 1.2 + i / 4), py = lerp(gy - .06 * r, sy, q); paint(ellPts(gx + .01 * r, py, .02 * r, .028 * r, 8), { wash: PAL.sky, ink: PAL.ink, sw: .5 }); }
    }
    // free nerve endings: thin branches reaching up to the epidermis; coral = warm, blue = cold
    if (o.endings != null) {
      boilSeed('ne' + key);
      const by = cy + .78 * r, bw = chord(cx, cy, r, by, 10);
      inkLine([[cx - bw, by], [cx, by - 10], [cx + bw, by]], 5, Z.nerveDk, 'ink', .6);
      for (let i = 0; i < 6; i++) {
        const x = cx + (i - 2.5) * .26 * r, warm = i % 2 === 0, lit = clamp(o.endings * 1.6 - i * .1), top = [x + 14 * Math.sin(i * 2), ey + .04 * r];
        const P = [[x - 10, by], [x + 12, lerp(by, top[1], .5)], top];
        inkLine(P, 2.4, warm ? Z.hotDk : Z.coldDk, 'ink', .5);
        for (const sd of [-1, 1]) inkLine([top, [top[0] + sd * .05 * r, top[1] - .02 * r]], 1.6, warm ? Z.hotDk : Z.coldDk, 'ink', .3);
        if (lit > 0) { paint(ellPts(top[0], top[1], 9 + 6 * lit, 9 + 6 * lit, 12), { wash: warm ? Z.hot : Z.cold, ink: PAL.ink, sw: .8 }); glow(top[0], top[1], 60 * lit, warm ? '#FF8A60' : '#7FC8FF', .8 * lit); }
      }
    }
    // heat leaving the surface: orange wavy lines rising from the skin into the air
    if (o.heat > .02) heatLines(cx, sy - 10, chord(cx, cy, r, sy - .3 * r, 30) * 1.4, -.55 * r, t, o.heat, key + 'h', Math.round(2 + 4 * o.heat), '#F28C2E');
    // sweat on the surface, evaporating: each droplet leaves as vapour carrying a tied parcel of heat
    if (o.drops > 0) for (let i = 0; i < 5; i++) {
      boilSeed('dr' + key + i);
      const x = cx + (i - 2) * .26 * r, sz = .045 * r * o.drops * (1 - .5 * (o.evap || 0) * frac(t * .5 + i * .3));
      paint(ellPts(x, sy - sz * .6, sz * 1.2, sz * .8, 12), { wash: PAL.sky, ink: PAL.ink, sw: .7 });
    }
    if (o.evap > 0) for (let i = 0; i < 7; i++) {
      const q = frac(t * .45 + i / 7), x = cx + (hash(i + 31) - .5) * 1.1 * r + .1 * r * Math.sin(q * 5 + i), y = lerp(sy - .04 * r, cy - .9 * r, q);
      if (chord(cx, cy, r, y, 30) < Math.abs(x - cx)) continue;
      const bounce = o.fogged ? Math.abs(Math.sin(q * Math.PI * 2)) : 1, yy = o.fogged ? lerp(sy - .04 * r, sy - .45 * r, bounce * .6) : y;
      parcel(x, yy, .1 * r * o.evap * (1 - seg(q, .85, 1)), key + 'pc' + i);
    }
  }
  function parcel(x, y, s, key) {                                   // a water molecule carrying a coral bundle of heat
    if (s < 2) return; boilSeed('pa' + key);
    paint(ellPts(x, y + s * .55, s * .42, s * .5, 12), { wash: PAL.sky, ink: PAL.ink, sw: .7 });
    paint(rrPts(x - s * .45, y - s * .55, s * .9, s * .7, s * .2), { wash: Z.hot, fill: Z.hotDk, fillOp: 50, ink: PAL.ink, sw: .8 });
    inkLine([[x - s * .2, y - s * .6], [x, y - s * .85], [x + s * .2, y - s * .6]], 1.4, PAL.ink, 'ink', .6);
  }
  // the quiz timer: a pie that drains over 3 s (c0..c0+3), three dots popping off; ding at the end
  function quiz(x, y, r, t, tin, c0, key) {
    const k = seg(t, tin, tin + .4), out = seg(t, c0 + 3.9, c0 + 4.3); if (k <= 0 || out >= 1) return;
    const q = backOut(k) * (1 - easeIn(out)), left = 1 - seg(t, c0, c0 + 3), tick = Math.max(0, ...[0, 1, 2].map(i => pulseK(t, c0 + i + 1, .25)));
    boilSeed('qz' + key);
    const R = r * q * (1 + .06 * tick);
    paint(ellPts(x, y, R, R, 32), { wash: PAL.cream, ink: PAL.ink, sw: 1.6 });
    if (left > .01) { const P = [[x, y]]; for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + i / 30 * TAU * left; P.push([x + Math.cos(a) * R * .82, y + Math.sin(a) * R * .82]); } paint(P, { wash: Z.hot, fill: Z.hotDk, fillOp: 40, ink: null }); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; inkLine([[x + Math.cos(a) * R * .88, y + Math.sin(a) * R * .88], [x + Math.cos(a) * R * .97, y + Math.sin(a) * R * .97]], 1.2, PAL.ink, 'ink', 0); }
    paint(rrPts(x - R * .12, y - R * 1.24, R * .24, R * .16, 4), { wash: Z.woodDk, ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 3; i++) { const gone = seg(t, c0 + i + .9, c0 + i + 1.2), dx = x + (i - 1) * R * .5, dy = y + R * 1.35 - 60 * easeIn(gone); if (gone < 1) paint(ellPts(dx, dy, R * .12 * (1 - gone) * q, R * .12 * (1 - gone) * q, 12), { wash: [Z.atp, Z.hot, Z.cold][i], ink: PAL.ink, sw: .9 }); }
    pipEmote('question', x - R * 1.5, y - R * .3, R * .45, 1, key);
    const ding = seg(t, c0 + 3, c0 + 3.6);
    if (ding > 0 && ding < 1) { K.burst(x, y, R * 1.3, ding, PAL.ink, key + 'b'); for (let i = 0; i < 4; i++) K.sparkle(x + Math.cos(i * 1.6 + .4) * R * 1.4, y + Math.sin(i * 1.6 + .4) * R * 1.4, 26, ding, Z.atp); }
  }

  // ---------- the channel world ----------
  // a TRP channel in side view: two halves around the pore, a big cytoplasmic domain below; open 0..1 parts the halves
  function channel(x, y, s, open, col, dk, t, key, glowK = 0) {
    auditBox('channel', key, x - 90 * s, y - 70 * s, x + 90 * s, y + 140 * s);
    const g = lerp(2, 22, ease(open)) * s;
    if (glowK > 0) glow(x, y, 160 * s, col === Z.hot ? '#FF8A60' : '#7FC8FF', glowK);
    for (const sd of [-1, 1]) {
      boilSeed('chn' + key + sd);
      push(); translate(x + sd * g, y + 50 * s); rotate(sd * .1 * ease(open)); translate(0, -50 * s);
      paint(ellPts(sd * 40 * s, 92 * s, 40 * s, 32 * s, 18, 1), { wash: mixCol(col, dk, .35), fill: dk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1 });
      const P = [[0, -58 * s], [sd * 22 * s, -66 * s], [sd * 52 * s, -56 * s], [sd * 56 * s, -10 * s], [sd * 52 * s, 50 * s], [sd * 14 * s, 58 * s], [0, 46 * s], [-sd * 4 * s, 4 * s]];
      paint(P, { wash: col, fill: dk, fillOp: 55, tex: .5, ink: PAL.ink, sw: 1.1, curv: .35 });
      for (let j = 0; j < 3; j++) inkLine([[sd * (14 + j * 13) * s, -48 * s], [sd * (18 + j * 12) * s, 40 * s]], .8, mixCol(dk, PAL.ink, .3), 'inkfine', .3);
      pop();
    }
  }
  function ion(x, y, kind, s, key) {
    boilSeed('io' + key);
    const r = (kind === 'ca' ? 19 : 15) * s, col = kind === 'ca' ? Z.ca : kind === 'h' ? PAL.cream : Z.na;
    paint(ellPts(x, y, r, r, 12), { wash: col, ink: PAL.ink, sw: .8 });
    K.glyph('+', x, y, r * 1.1, kind === 'h' ? Z.prot : PAL.cream, Math.max(1, r / 7));
  }
  // ions pouring through a pore at (px, py) starting at t0: above → funnel → pore → spread inside. Returns nothing.
  function ionFlow(t, t0, px, py, n, key, spread = 380, kinds = ['na', 'na', 'ca'], S = 1.25) {
    for (let i = 0; i < n; i++) {
      const a = t0 + i * .2, k = seg(t, a, a + 1.6);
      const st = [px + (hash(i + 11) - .5) * spread * 2 + 20 * wob(t, .3, i), py - 220 - 110 * hash(i + 12) + 14 * wob(t, .25, i * .7)];
      const en = [px + (hash(i + 13) - .5) * spread * 1.6, py + 250 + 120 * hash(i + 14) + 10 * wob(t, .2, i)];
      let p;
      if (k < .45) p = [lerp(st[0], px, ease(k / .45)), lerp(st[1], py - 80 * S, ease(k / .45))];
      else if (k < .6) p = [px, lerp(py - 80 * S, py + 90 * S, (k - .45) / .15)];
      else p = [lerp(px, en[0], easeOut((k - .6) / .4)), lerp(py + 90 * S, en[1], easeOut((k - .6) / .4))];
      ion(p[0], p[1], kinds[i % kinds.length], 1.15, key + i);
    }
  }
  function capsaicin(x, y, s, ang, key) {                           // vanillyl ring + amide + a long fatty tail
    boilSeed('cap' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    const hex = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; hex.push([Math.cos(a) * 18, Math.sin(a) * 18]); }
    paint(hex, { wash: Z.caps, fill: '#A82620', fillOp: 40, ink: PAL.ink, sw: 1.2 });
    inkLine([[-15, -9], [-28, -16]], 2, PAL.ink, 'ink', 0); paint(ellPts(-32, -18, 5, 5, 8), { wash: '#F6D9A8', ink: PAL.ink, sw: .7 });
    inkLine([[-15, 9], [-28, 16]], 2, PAL.ink, 'ink', 0); paint(ellPts(-32, 18, 5, 5, 8), { wash: Z.caps, ink: PAL.ink, sw: .7 });
    const P = [[18, 0]]; for (let i = 1; i <= 9; i++) P.push([18 + i * 13, (i % 2 ? -7 : 7)]);
    inkLine(P, 2.6, '#B8442E', 'ink', 0);
    paint(ellPts(18 + 2 * 13, 15, 4.5, 4.5, 8), { wash: PAL.sky, ink: PAL.ink, sw: .6 });
    pop();
  }
  function menthol(x, y, s, ang, key) {                             // a cyclohexane ring, an OH and an isopropyl branch
    boilSeed('men' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    const hex = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; hex.push([Math.cos(a) * 18, Math.sin(a) * 18]); }
    paint(hex, { wash: Z.menth, fill: '#3E8A54', fillOp: 40, ink: PAL.ink, sw: 1.2 });
    inkLine([[9, -15], [16, -30]], 2, PAL.ink, 'ink', 0); paint(ellPts(18, -34, 5.5, 5.5, 8), { wash: '#F6D9A8', ink: PAL.ink, sw: .7 });
    inkLine([[-9, 15], [-14, 30], [-28, 36]], 2, PAL.ink, 'ink', .2); inkLine([[-14, 30], [-8, 44]], 2, PAL.ink, 'ink', 0);
    inkLine([[18, 0], [32, 4]], 2, PAL.ink, 'ink', 0);
    pop();
  }

  // ---------- backgrounds ----------
  function kitchen(t, gold = 0) {
    K.wash(mixCol(Z.kitchen, '#F8C98A', gold), t, { key: 'kit', blob: Z.kitchenBlob });
    boilSeed('kwin');
    paint(rrPts(130, 120, 420, 330, 18), { wash: mixCol('#BFE0F2', '#F9D58A', gold), fill: '#9CCBE6', fillOp: 40 * (1 - gold), tex: .4, ink: PAL.ink, sw: 1.4 });
    paint(ellPts(440, 220, 46, 46, 18), { wash: '#FCE6A0', ink: null });
    if (gold > 0) glow(440, 220, 220, '#FFD27A', .6 * gold);
    inkLine([[340, 120], [340, 450]], 3, Z.woodDk, 'ink', 0); inkLine([[130, 285], [550, 285]], 3, Z.woodDk, 'ink', 0);
    boilSeed('kshelf');
    paint(rrPts(1380, 260, 420, 22, 6), { wash: Z.wood, ink: PAL.ink, sw: 1 });
    [[1430, '#E7A04E'], [1520, '#7DB0C9'], [1610, '#D9707A'], [1700, '#9DBE6E']].forEach(([x, c], i) => paint(rrPts(x - 28, 260 - 70 - 14 * hash(i), 56, 70 + 14 * hash(i), 10), { wash: c, ink: PAL.ink, sw: .9 }));
    boilSeed('ktable');
    paint(rrPts(-60, 830, W + 120, 40, 8), { wash: Z.wood, fill: Z.woodDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.3 });
    paint(rectPts(-60, 866, W + 120, 260), { wash: Z.woodDk, fill: '#8A5634', fillOp: 50, tex: .6, ink: null });
    for (let i = 0; i < 5; i++) inkLine([[i * 430 + 80, 880], [i * 430 + 90, 1080]], 1, '#7A4A2C', 'inkfine', .2);
  }
  function bowl(x, y, t, key, n = 4) {                              // a teal bowl of chilies
    for (let i = 0; i < n; i++) chili(x - 50 + i * 34, y - 64 - 10 * hash(i), .75, -.5 + i * .35 + .03 * wob(t, .3, i), 0, key + i);
    boilSeed('bowl' + key);
    const P = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; P.push([x + Math.cos(a) * 110, y - 70 + Math.sin(a) * 70]); }
    paint(P, { wash: '#5FA8A3', fill: '#3E7E7A', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.2 });
    inkLine([[x - 108, y - 70], [x + 108, y - 70]], 1.6, PAL.ink, 'ink', 0);
  }
  function glass(x, y, t, key, sprig = 1, frost = 0) {              // a glass of water with a mint sprig
    if (sprig > 0) mint(x + 6, y - 40, 1.1, key, frost);
    boilSeed('gls' + key);
    paint([[x - 52, y - 150], [x + 52, y - 150], [x + 42, y], [x - 42, y]], { fill: '#CFE8F4', fillOp: 120, bleed: .05, tex: .2, ink: PAL.ink, sw: 1.1 });
    paint([[x - 46, y - 100], [x + 46, y - 100], [x + 42, y - 2], [x - 42, y - 2]], { fill: '#A9D3EC', fillOp: 110, tex: .2, ink: null });
    inkLine([[x - 30, y - 135], [x - 26, y - 30]], 2.2, PAL.cream, 'ink', .2);
  }
  function thermometer(x, y, s, level, key, k = 1) {               // a painted thermometer; level 0..1 (.5 = the set point)
    if (k <= .02) return; boilSeed('th' + key);
    push(); translate(x, y); scale(backOut(k) * s);
    paint(rrPts(-16, -170, 32, 170, 16), { wash: PAL.cream, ink: PAL.ink, sw: 1.3 });
    const col = level > .62 ? Z.hot : level < .38 ? Z.cold : Z.blood, top = lerp(-10, -160, clamp(level));
    paint(ellPts(0, 12, 26, 26, 16), { wash: col, ink: PAL.ink, sw: 1.3 });
    paint(rrPts(-7, top, 14, -top + 4, 6), { wash: col, ink: null });
    for (let i = 0; i < 7; i++) inkLine([[10, -150 + i * 22], [16, -150 + i * 22]], 1.1, PAL.ink, 'ink', 0);
    paint(starPts(28, -85, 9, .45, 5), { wash: Z.atp, ink: PAL.ink, sw: .7 });   // the set point
    pop();
  }

  // ======================= SHOTS =======================
  // A · the kitchen: fooled by a chili and a mint leaf
  function shotA(t, lt, dur) {
    K.setT(t);
    const x = 880, y = 830, u = 38;
    // Pip's acting
    let o = K.act(t, [[0, 'wave', { lookX: 0 }], [L(1, -.6), 'happy'], [L(1, .55), 'wow', { take: 1.2 }], [L(1, 3.3), 'worried'], [L(1, 4.9), 'wow', { take: 0, emote: null }],
      [L(1, 6.9), 'dizzy'], [L(1, 7.6), 'calm', { lookX: -1, lookY: .3 }], [L(1, 9.2), 'confused', { lookX: .9 }], [L(2, 1.0), 'wow', { take: 1.4 }],
      [L(2, 2.6), 'smug'], [L(2, 5.6), 'idea'], [L(2, 8.4), 'happy']]);
    const hotK = on(t, L(1, .8), L(1, 3.6), .35, .5), frozen = t > L(1, 5.0) && t < L(1, 6.8), iceK = on(t, L(1, 4.8), L(1, 7.4), .3, .6);
    const iceGrow = ease(seg(t, L(1, 5.0), L(1, 5.45))), crack = seg(t, L(1, 6.2), L(1, 6.75)), shatter = seg(t, L(1, 6.75), L(1, 7.6));
    if (frozen) o = { ...pipFeel('wow', L(1, 5.0)), blink: 0, emote: null, sq: 0, dy: 0 };     // a frozen pose: no idle motion
    // arms: hold the chili, bite it, drop it, reach for the mint, then the magnifier
    const bite = seg(t, L(1, .25), L(1, .4));
    let armF = { at: kf(t, [[L(1, -.6), [2.4, -2.9]], [L(1, .1), [.7, -2.6]], [L(1, .45), [.7, -2.6]], [L(1, .9), [2.6, -2.2]], [L(1, 3.3), [2.6, -2.2]], [L(1, 3.8), [3.4, -3.4]], [L(1, 4.4), [3.4, -3.4]], [L(1, 4.75), [.7, -2.6]]]) };
    if (t > L(2, 2.6)) armF = { at: kf(t, [[L(2, 2.6), [2.2, -3.2]], [L(2, 3.8), [1.7, -1.4]], [L(2, 5.8), [.6, -3.0]], [L(2, 8.2), [-.4, -.5]]]) };
    else if (t > L(1, 6.8) && t < L(2, 2.6)) armF = o.armF;
    o = { ...o, armF, armsFront: t < L(1, 5.0) || (t > L(2, 2.6)) ? true : o.armsFront };
    if (frozen) o.armF = { at: [.7, -2.6] };
    const hop = jump(t, L(1, 1.0), L(1, 1.7), 1.3); o.dy = (o.dy || 0) + hop.dy; o.sq = (o.sq || 0) + hop.sq;
    // ice shatter: Pip pops out with a little hop
    const out = jump(t, L(1, 6.8), L(1, 7.3), .8); if (t > L(1, 6.75)) { o.dy += out.dy; o.sq += out.sq; }
    // the camera: close on Pip; at the end it dives into the magnifier held over Pip's belly
    const lensEnd = [880 - .4 * u + 76.4, 830 - .5 * u - 85.6], dive = seg(t, 24.7, 25.6);
    camBegin(lerp(900 + 10 * wob(t, .05), lensEnd[0], ease(seg(t, 24.7, 25.35))), lerp(650 + 6 * wob(t, .04), lensEnd[1], ease(seg(t, 24.7, 25.35))), lerp(1.22, 9, easeIn(dive)));
    kitchen(t);
    bowl(500, 830, t, 'bw');
    glass(1290, 830, t, 'gl', t < L(1, 4.0) ? 1 : 0);
    thermometer(1420, 790, 1.1, .5 + .06 * Math.sin(t * 3) * (1 - seg(t, L(2, 9.4), L(2, 10.4))), 'th', seg(t, L(2, 8.4), L(2, 8.8)));
    const shiverX = jitter(t, frozen ? 2.5 : t > L(1, 6.8) && t < L(1, 7.6) ? 4 : 0);
    pipT(x + shiverX, y, u, { ...o, key: 'pa' }, hotK, iceK * .9);
    const hand = K.hand(x, y, u, o.armF && o.armF.at ? o.armF.at : [2, -2], { dy: o.dy });
    if (t < L(1, 3.3)) chili(hand[0], hand[1] - 6, 1.05, -.35 + .25 * seg(t, L(1, .2), L(1, .4)), bite, 'held');
    else if (t < L(1, 4.4)) chili(lerp(hand[0], 560, ease(seg(t, L(1, 3.3), L(1, 3.8)))), lerp(hand[1], 760, easeIn(seg(t, L(1, 3.3), L(1, 3.8)))), 1.05, lerp(-.35, 1.3, seg(t, L(1, 3.3), L(1, 3.8))), 1, 'held');
    if (t > L(1, 3.8)) chili(560, 812, 1.05, 1.5, 1, 'held');            // the bitten chili lies on the table
    if (t > L(1, 4.0) && t < L(1, 4.75)) mint(hand[0], hand[1] + 20, .8, 'inhand');
    if (bite > 0 && bite < 1) K.burst(...mouthOf(x, y, u, o), 40, seg(t, L(1, .3), L(1, .7)), PAL.ink, 'bite');
    const m = mouthOf(x, y, u, o);
    flames(m[0] + 8, m[1], 1, 330, t, on(t, L(1, 1.05), L(1, 3.2), .15, .4), 'f1');
    const hd = headOf(x, y, u, o);
    steam(hd[0], hd[1] - 1.2 * u, u, t, on(t, L(1, 1.1), L(1, 3.6), .2, .5), 's1');
    // the ice block, cracks, shards
    if (iceGrow > 0 && shatter <= 0) {
      boilSeed('ice');
      const hgt = 7.6 * u * iceGrow;
      paint(rrPts(x - 2.9 * u, y - hgt, 5.8 * u, hgt + 6, .5 * u), { fill: '#BFE3F6', fillOp: 175, bleed: .04, tex: .3, ink: Z.coldDk, sw: 1.6 });
      inkLine([[x - 2.3 * u, y - hgt + .6 * u], [x - 2.3 * u, y - hgt + 2.4 * u]], 3, PAL.cream, 'ink', 0);
      inkLine([[x - 1.9 * u, y - hgt + .5 * u], [x - 1.2 * u, y - hgt + .5 * u]], 3, PAL.cream, 'ink', 0);
      if (iceGrow > .9) paint([[x - .3 * u, y - hgt], [x + .3 * u, y - hgt], [x, y - hgt + 1.0 * u]], { wash: Z.ice, ink: Z.coldDk, sw: 1 });
      if (crack > 0) { boilSeed('crk'); const P = [[x - .2 * u, y - hgt]]; for (let i = 1; i <= 6; i++) P.push([x + (i % 2 ? .6 : -.5) * u, y - hgt + i / 6 * hgt * crack]); inkLine(P, 2, PAL.ink, 'ink', 0); if (crack > .5) inkLine([[x + .6 * u, y - hgt * .7], [x + 2.2 * u, y - hgt * .6], [x + 2.9 * u, y - hgt * .4]], 1.6, PAL.ink, 'ink', 0); }
    }
    if (shatter > 0 && shatter < 1) for (let i = 0; i < 10; i++) {
      boilSeed('shard' + i);
      const a = -Math.PI / 2 + (i / 9 - .5) * 2.6, p0 = [x + Math.cos(a) * u, y - 3.8 * u], p1 = [x + Math.cos(a) * (6 + 3 * hash(i)) * u, y + 30], pp = arcPt(p0, p1, 3 * u, easeOut(shatter));
      const r = (.6 + .5 * hash(i + 3)) * u * (1 - shatter * .5);
      paint(starPts(pp[0], pp[1], r, .5, 3, shatter * 6 + i), { wash: Z.ice, ink: Z.coldDk, sw: 1 });
    }
    // the magnifier: pulled out on "拆穿", swept over Pip's body
    const mgK = seg(t, L(2, 2.6), L(2, 3.0));
    if (mgK > 0) {
      const at = o.armF.at, hp = K.hand(x, y, u, at, { dy: o.dy }), lr = 74, ang = 2.3;
      const cx = hp[0] - Math.cos(ang) * lr * 1.55, cy = hp[1] - Math.sin(ang) * lr * 1.55;
      boilSeed('lensglass'); paint(ellPts(cx, cy, lr * backOut(mgK), lr * backOut(mgK), 30), { fill: '#DDEFF7', fillOp: 110, tex: .2, ink: null });
      magnifier(cx, cy, lr, ang, 'mA', mgK);
    }
    // thought icons: heat and cold
    const hk = on(t, L(2, 5.8), L(2, 10.6)), ck = on(t, L(2, 6.9), L(2, 10.6));
    flameIcon(x - 3.1 * u, y - 7.2 * u, 36 * backOut(hk), t, 'icH');
    if (ck > 0) snowflake(x + 2.9 * u, y - 7.4 * u, 34 * backOut(ck), t * .3, Z.coldDk, 'icC');
    camEnd();
    if (lt < .9) iris(...toScreen(x, y - 3 * u, LAST_CAM), kf(lt, [[0, 0], [.15, 260], [.45, 290], [.9, 1900]], easeIn));
    flash(seg(t, 25.15, 25.55), PAL.cream);
  }

  // B1 · on Pip's skin, magnified: quiz 1 and the nerve endings
  function shotB1(t, lt, dur) {
    K.setT(t);
    const LX = 960, LY = 560, LR = 520, tgt = [1024, 540];          // the lens; tgt = one cold ending's tip
    const zk = ease(seg(t, L(4, 3.0), L(4, 4.3)));
    camBegin(lerp(960 + 6 * wob(t, .05), tgt[0], zk), lerp(540, tgt[1], zk), lerp(1.0, 4.6, easeIn(seg(t, L(4, 3.0), L(4, 4.3)))));
    boilSeed('b1bg'); paint(rectPts(-200, -200, W + 400, H + 400), { wash: Z.skinAir, ink: null });
    const lit = seg(t, L(4, 2.0), L(4, 2.9));
    skinLens(LX, LY, LR, t, { vessel: 34, hair: .15, endings: t > L(4, 1.9) ? lit * (1 + .3 * Math.max(0, wob(t, .8))) : 0, gland: 0 }, 'b1');
    // Pip stands on its own skin surface (magnified, so Pip looks tiny: a joke the line plays on)
    const x = 730, y = LY - .3 * LR, u = 30;
    const o = K.act(t, [[0, 'wow', { lookX: .3 }], [L(3, .3), 'wave', { lookX: 0, lookY: 0 }], [L(3, 2.4), 'calm', { lookY: .9 }], [L(3, 4.1), 'confused', { lookX: 0, emote: null }],
      [L(3, 5.8), 'calm', { lookX: .9, lookY: -.4, kick: (t - L(3, 5.8)) * 1.6 }], [L(4, .8), 'idea'], [L(4, 2.3), 'wow', { lookX: .6, lookY: .9 }]]);
    const stomp = jump(t, L(3, 2.5), L(3, 2.95), .9);
    pip(x, y, u, { ...o, dy: o.dy + stomp.dy, sq: o.sq + stomp.sq, key: 'pb1' });
    if (t > L(3, 2.95)) K.burst(x, y, 60, seg(t, L(3, 2.95), L(3, 3.4)), PAL.ink, 'stomp');
    camEnd();
    // the magnifier's rim around the view, and the quiz timer on the dark surround
    irisShape(ellPts(LX, LY, LR + 4, LR + 4, 48), '#3F3346');
    magnifier(LX, LY, LR + 10, 2.4, 'mgB', 1);
    quiz(1640, 230, 120, t, L(3, 4.4), 32.6, 'q1');
    flash(Math.max(1 - seg(lt, 0, .5), seg(t, L(4, 3.9), L(4, 4.3))), PAL.cream);
  }

  // B2 · the nerve membrane: TRPV1 (left) and TRPM8 (right)
  const XV = 700, XM = 1900, YM = 470;
  function shotB2(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(4, 4.3), [1300, 540, .72]], [L(5, -.2), [1300, 540, .72]], [L(5, .9), [XV + 40, 560, 1.28]], [L(7, -.1), [XV + 40, 560, 1.28]], [L(7, .8), [XM + 40, 560, 1.28]],
      [L(8, -.2), [XM + 40, 560, 1.28]], [L(8, 1.1), [1300, 500, .74]]], ease);
    camBegin(c[0] + 8 * wob(t, .05), c[1] + 6 * wob(t, .04), c[2]);
    // outside (warm on the left, cool on the right), inside (the nerve ending's cytoplasm)
    boilSeed('b2out'); paint(rectPts(-1200, -900, 1200 + 1300, YM + 900), { wash: Z.out, ink: null });
    for (let i = 0; i < 12; i++) paint(rectPts(1000 + i * 55, -900, i === 11 ? 2600 : 60, YM + 900), { wash: mixCol(Z.out, Z.outCool, (i + 1) / 12), ink: null });
    boilSeed('b2in'); paint(rectPts(-1200, YM, 4600, 1400), { wash: Z.axo, fill: Z.axoDk, fillOp: 40, tex: .5, ink: null });
    K.motes(t, 16, mixCol(Z.out, Z.hot, .25), { key: 'b2m', y0: -300 });
    // the membrane, in three spans around the two channels; a gold wave runs along it when the nerve fires
    const Tk = K.track([[-1200, YM], [3800, YM]]), waves = [[L(5, 8.6), XV], [L(6, 5.8), XV], [L(7, 5.8), XM], [L(7, 9.8), XM]];
    const cols = (q) => { const xx = q - 1200; let g = 0; for (const [w0, x0] of waves) { const p = x0 + (t - w0) * 1400; if (t > w0 && t < w0 + 2) g = Math.max(g, near(xx, p, 260) * (1 - seg(t, w0 + 1.4, w0 + 2))); } return mixCol(K.C.phos, Z.atp, g); };
    const v0 = c[0] - 1000 / c[2] + 1200, v1 = c[0] + 1000 / c[2] + 1200, span = (a, b, k) => { const A = Math.max(a, v0), B = Math.min(b, v1); if (B - A > 20) K.bilayer(Tk, 1.9, { key: k, from: A, to: B, cols }); };
    span(0, XV + 1200 - 88, 'm1'); span(XV + 1200 + 88, XM + 1200 - 88, 'm2'); span(XM + 1200 + 88, 5000, 'm3');
    // TRPV1: heat (L5), then capsaicin (L6)
    const heatK = on(t, L(5, 2.2), L(6, .3), .4, .5);
    heatLines(XV, YM - 420, 520, 300, t, heatK, 'hv', 6, Z.hot);
    const capIn = seg(t, L(6, 1.0), L(6, 2.9)), pry = seg(t, L(6, 4.0), L(6, 5.0));
    const vOpen = Math.max(on(t, L(5, 3.4), L(6, .5), .35, .5), t > L(6, 4.0) ? clamp(pry * 1.15 - .15 * Math.sin(pry * 18) * (1 - pry)) * (1 - seg(t, L(7, -.4), L(7, .4))) : 0);
    const vGlow = Math.max(pulseK(t, L(4, 10.6), .9), pulseK(t, L(8, .5), .9));
    channel(XV, YM, 1.9, vOpen, Z.hot, Z.hotDk, t, 'v1', vGlow);
    ring(XV, YM + 40, 190, 175, seg(t, L(5, .3), L(5, 1.3)), Z.hotDk, 'rv');
    ionFlow(t, L(5, 4.5), XV, YM, 12, 'iv1');
    if (t > L(6, 4.9)) ionFlow(t, L(6, 5.1), XV, YM, 10, 'iv2', 380, ['ca', 'na']);
    if (capIn > 0 && t < L(7, .5)) {
      const p = arcPt([XV - 430, YM - 300], [XV - 178, YM + 4], 120, ease(capIn)), wig = t > L(6, 3.9) && t < L(6, 5.1) ? .25 * Math.sin((t - L(6, 3.9)) * 22) : 0;
      capsaicin(p[0], p[1], 1.7, lerp(-.6, Math.PI, ease(capIn)) + wig, 'cv');
      if (t > L(6, 2.9)) K.burst(XV - 178, YM + 4, 80, seg(t, L(6, 2.9), L(6, 3.4)), PAL.ink, 'dockv');
    }
    // TRPM8: cold (L7), then menthol
    const coldK = on(t, L(7, 3.1), L(7, 7.3), .4, .6);
    if (coldK > 0) for (let i = 0; i < 9; i++) { const q = frac(t * .18 + i / 9), sx = XM - 330 + hash(i + 50) * 660 + 30 * wob(t, .3, i), sy = lerp(YM - 520, YM - 40, q); snowflake(sx, sy, (14 + 10 * hash(i)) * coldK * (1 - seg(q, .85, 1)), t * .5 + i, Z.coldDk, 'sn' + i); }
    const menIn = seg(t, L(7, 7.6), L(7, 8.8));
    const mOpen = Math.max(on(t, L(7, 4.5), L(7, 7.2), .35, .5), on(t, L(7, 9.0), L(8, 0), .4, .5));
    channel(XM, YM, 1.9, mOpen, Z.cold, Z.coldDk, t, 'm8', Math.max(vGlow, pulseK(t, L(7, 2.3), .9)));
    ring(XM, YM + 40, 190, 175, seg(t, L(7, 2.3), L(7, 3.3)), Z.coldDk, 'rm');
    ionFlow(t, L(7, 4.9), XM, YM, 12, 'im1');
    if (t > L(7, 9.0)) ionFlow(t, L(7, 9.2), XM, YM, 8, 'im2', 380, ['ca', 'na']);
    if (menIn > 0 && t < L(8, 1)) {
      const p = arcPt([XM + 430, YM - 320], [XM + 185, YM + 2], 120, ease(menIn));
      menthol(p[0], p[1], 1.8, lerp(.5, -.4, ease(menIn)), 'mm');
      if (t > L(7, 8.8)) K.burst(XM + 185, YM + 2, 80, seg(t, L(7, 8.8), L(7, 9.3)), PAL.ink, 'dockm');
    }
    // L8: the Nobel medal swings down between the two
    const medK = seg(t, L(8, 3.3), L(8, 3.9));
    if (medK > 0) {
      boilSeed('medrib'); const sw = .12 * spring(t, L(8, 3.9), 2.5, 7), my = lerp(-200, YM - 300, easeOut(medK));
      inkLine([[1300, -400], [1300 + Math.sin(sw) * 300, my - 70]], 3, Z.hotDk, 'ink', 0);
      K.medal(1300 + Math.sin(sw) * 300, my, 2.2, t, 1, 'nob');
      if (medK >= 1) for (let i = 0; i < 4; i++) K.sparkle(1300 + Math.cos(i * 1.7) * 150, my + Math.sin(i * 1.7) * 110, 30, frac(t * .8 + i / 4), PAL.cream);
    }
    camEnd();
    // Pip, the host, swimming in the nerve's cytoplasm, bottom left
    const px = 250, py = 960, u = 30;
    const keys = [[0, 'wow', { lookX: .5, lookY: -.5 }], [L(4, 8.0), 'calm', { lookX: .8, lookY: -.6 }], [L(5, 1.0), 'calm', { lookX: .9, lookY: -.7 }],
      [L(5, 10.35), 'wow', { take: 1.5 }], [L(6, 1.2), 'calm', { lookX: .8, lookY: -.6 }], [L(6, 3.2), 'wow'], [L(6, 6.7), 'wow', { take: 1.2, emote: null }],
      [L(6, 9.5), 'wink'], [L(7, 1.0), 'calm', { lookX: 1, lookY: -.6 }], [L(7, 6.2), 'worried'], [L(7, 8.6), 'wow'], [L(7, 11.0), 'love', { emote: null }],
      [L(8, 1.0), 'calm', { lookX: .6, lookY: -.8 }], [L(8, 6.8), 'excited'], [L(8, 9.0), 'smug'], [L(8, 11.0), 'wow', { take: 1.5, emote: null }], [L(8, 13.6), 'dizzy']];
    let o = K.act(t, keys);
    const hot = Math.max(on(t, L(5, 10.4), L(6, 1.6), .2, .8), on(t, L(6, 6.8), L(6, 9.6), .2, .6), on(t, L(8, 11.1), L(8, 14.3), .2, .8));
    const cold = on(t, L(7, 6.2), L(7, 8.4), .2, .5);
    const leap = jump(t, L(5, 10.4), L(5, 11.1), 2.2); o = { ...o, dy: o.dy + leap.dy, sq: o.sq + leap.sq };
    let holdChili = t > L(8, 8.6) && t < L(8, 11.4);
    if (holdChili) o = { ...o, armsFront: true, armF: { at: kf(t, [[L(8, 8.6), [2.4, -3.0]], [L(8, 10.6), [2.4, -3.0]], [L(8, 11.0), [.7, -2.6]]]) } };
    const yb = swimT(px + jitter(t, cold * 3), py, u, t, o, 'pb2', hot, cold);
    const m = mouthOf(px, yb, u, o);
    if (holdChili) { const hp = K.hand(px, yb, u, o.armF.at, { dy: o.dy }); chili(hp[0], hp[1] - 6, .9, -.35, seg(t, L(8, 10.9), L(8, 11.1)), 'nobc'); }
    flames(m[0] + 6, m[1], 1, 260, t, Math.max(on(t, L(6, 7.0), L(6, 9.3), .15, .4), on(t, L(8, 11.3), L(8, 13.7), .15, .5)), 'f2');
    const hd = headOf(px, yb, u, o);
    steam(hd[0], hd[1] - 1.2 * u, u, t, Math.max(on(t, L(5, 10.6), L(6, 1.6)), on(t, L(8, 11.3), L(8, 14.3))), 's2');
    if (cold > .1) shakeLines(px, yb, u, cold, 'shb2');
    // the 凉心 heart: a love heart that frosts over
    const hk = seg(t, L(7, 11.0), L(7, 11.4));
    if (hk > 0 && t < L(8, .8)) heartIce(px + 3.6 * u, yb - 6.4 * u, 1.8 * u * backOut(hk) * (1 + .06 * wob(t, 1.5)), ease(seg(t, L(7, 11.5), L(7, 12.4))), 'lh');
    flash(1 - seg(lt, 0, .5), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B7AEDB', Z.brainBg]);
  }

  // ---------- the brain and the thermostat ----------
  function brain(cx, cy, s, t, o, key) {                            // side view, the front to the left
    auditBox('brain', key, cx - 340 * s, cy - 240 * s, cx + 340 * s, cy + 200 * s);
    boilSeed('brs' + key);
    paint(ribbon([[cx + 70 * s, cy + 120 * s], [cx + 82 * s, cy + 260 * s], [cx + 96 * s, cy + 430 * s]], 74 * s, 52 * s), { wash: mixCol(Z.brain, Z.brainDk, .4), ink: PAL.ink, sw: 1.1 });
    boilSeed('brc' + key);
    paint(ellPts(cx + 210 * s, cy + 150 * s, 125 * s, 78 * s, 26, 1), { wash: mixCol(Z.brain, Z.brainDk, .25), fill: Z.brainDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 4; i++) inkLine([[cx + 110 * s, cy + (110 + i * 20) * s], [cx + 210 * s, cy + (104 + i * 22) * s], [cx + 310 * s, cy + (120 + i * 16) * s]], .9, Z.brainDk, 'inkfine', .6);
    boilSeed('brb' + key);
    const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU, c = Math.cos(a), sn = Math.sin(a); P.push([cx + c * 330 * s * (1 + .07 * Math.cos(2 * a)), cy + sn * 230 * s * (sn > 0 ? .8 : 1) + (sn > 0 && c < .2 ? 26 * s * sn * (.2 - c) : 0)]); }
    const cold = o.cortex || 0;
    paint(P, { wash: mixCol(Z.brain, '#C9DDF2', cold * .8), fill: Z.brainDk, fillOp: 55, tex: .5, ink: PAL.ink, sw: 1.4, curv: .3 });
    for (let i = 0; i < 16; i++) {                                   // gyri: short folded squiggles all over
      const gx = cx + ((i % 5) - 2) * 120 * s + 30 * s * (hash(i + 3) - .5), gy = cy + (Math.floor(i / 5) - 1.4) * 95 * s + 20 * s * (hash(i + 8) - .5), ga = hash(i + 9) * 3, G = [];
      for (let j = 0; j <= 6; j++) { const d = (j - 3) * 15 * s, w = 13 * s * Math.sin(j * 2.1 + i); G.push([gx + Math.cos(ga) * d - Math.sin(ga) * w, gy + Math.sin(ga) * d + Math.cos(ga) * w]); }
      if (Math.hypot((gx - cx) / 300, (gy - cy) / 190) < .9) inkLine(G, 1.1, mixCol(Z.brainDk, PAL.ink, .2), 'ink', .7);
    }
    inkLine([[cx - 230 * s, cy + 70 * s], [cx - 90 * s, cy + 30 * s], [cx + 40 * s, cy - 10 * s], [cx + 110 * s, cy - 50 * s]], 2, mixCol(Z.brainDk, PAL.ink, .35), 'ink', .6);   // the lateral sulcus
    inkLine([[cx + 20 * s, cy - 225 * s], [cx + 40 * s, cy - 120 * s], [cx + 10 * s, cy - 30 * s]], 1.8, mixCol(Z.brainDk, PAL.ink, .35), 'ink', .6);                          // the central sulcus
    if (cold > .02) { glow(cx, cy - 40 * s, 360 * s, '#9CD0FF', cold * .7); const Q = P.slice(22).concat([P[0]]); inkLine(Q, 6 * cold, Z.cold, 'ink', .5); }
    // the hypothalamus, with the pituitary hanging below it
    const hx = cx - 30 * s, hy = cy + 150 * s, hl = o.hypo || 0;
    boilSeed('hyp' + key);
    if (hl > .02) glow(hx, hy, 110 * s, '#FFC766', hl);
    paint(ellPts(hx, hy, 40 * s * (1 + .15 * hl), 24 * s * (1 + .15 * hl), 16), { wash: mixCol('#E59A7B', Z.atp, hl), ink: PAL.ink, sw: 1.1 });
    inkLine([[hx + 6 * s, hy + 22 * s], [hx + 10 * s, hy + 46 * s]], 2, PAL.ink, 'ink', 0);
    paint(ellPts(hx + 12 * s, hy + 56 * s, 14 * s, 11 * s, 12), { wash: '#E59A7B', ink: PAL.ink, sw: .9 });
    return [hx, hy];
  }
  // a thermostat dial: the arc runs cold (left) → hot (right) over the top; ang 0 = straight up = the set point
  function dial(x, y, r, ang, key, k = 1) {
    if (k <= .02) return; boilSeed('dl' + key);
    const R = r * backOut(k);
    paint(ellPts(x, y, R, R, 36), { wash: PAL.cream, ink: PAL.ink, sw: 1.6 });
    for (let i = 0; i < 12; i++) {
      const a0 = Math.PI + i / 12 * Math.PI, a1 = Math.PI + (i + 1) / 12 * Math.PI, q = i / 11, col = q < .5 ? mixCol(Z.cold, '#F3EAD2', q * 2) : mixCol('#F3EAD2', Z.hot, q * 2 - 1);
      paint([[x + Math.cos(a0) * R * .58, y + Math.sin(a0) * R * .58], [x + Math.cos(a0) * R * .86, y + Math.sin(a0) * R * .86], [x + Math.cos(a1) * R * .86, y + Math.sin(a1) * R * .86], [x + Math.cos(a1) * R * .58, y + Math.sin(a1) * R * .58]], { wash: col, ink: null });
    }
    paint(starPts(x, y - R * .97, R * .13, .45, 5), { wash: Z.atp, ink: PAL.ink, sw: .8 });
    const na = -Math.PI / 2 + ang;
    paint(ribbon([[x - Math.cos(na) * R * .12, y - Math.sin(na) * R * .12], [x + Math.cos(na) * R * .8, y + Math.sin(na) * R * .8]], R * .1, R * .02), { wash: PAL.ink, ink: null });
    paint(ellPts(x, y, R * .09, R * .09, 12), { wash: Z.hotDk, ink: PAL.ink, sw: .8 });
  }
  const dashed = (x0, y0, x1, y1, k, col, key, n = 14, w = 2.4) => { if (k <= .02) return; boilSeed('dash' + key);
    for (let i = 0; i < n; i++) { const a = i / n, b = (i + .55) / n; if (a > k) break; inkLine([[lerp(x0, x1, a), lerp(y0, y1, a)], [lerp(x0, x1, Math.min(b, k)), lerp(y0, y1, Math.min(b, k))]], w, col, 'ink', 0); } };
  function skinPatch(x, y, s, t, key) {                            // a small square of skin with its two channel icons
    boilSeed('sp' + key);
    paint(rrPts(x - 110 * s, y - 70 * s, 220 * s, 46 * s, 10 * s), { wash: Z.epi, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x - 110 * s, y - 28 * s, 220 * s, 100 * s, 10 * s), { wash: Z.derm, fill: Z.dermDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.1 });
    for (const [dx, c] of [[-40, Z.hot], [40, Z.cold]]) for (const sd of [-1, 1]) paint(rrPts(x + (dx + sd * 9 - 7) * s, y - 62 * s, 14 * s, 34 * s, 5 * s), { wash: c, ink: PAL.ink, sw: .8 });
  }

  // C · the brain: the signal climbs to the hypothalamus, the thermostat; quiz 2
  function shotC(t, lt, dur) {
    K.setT(t);
    const zk = on(t, L(9, 6.0), L(9, 11.6), .9, .9);
    camBegin(lerp(960, 1000, zk) + 6 * wob(t, .05), lerp(540, 580, zk) + 4 * wob(t, .04), lerp(1, 1.3, zk));
    K.wash(Z.brainBg, t, { key: 'c', blob: Z.brainBlob });
    K.motes(t, 14, mixCol(Z.brainBg, Z.brainDk, .3), { key: 'cm' });
    const BX = 1060, BY = 380;
    // the afferent nerve from the skin patch to the hypothalamus
    const Tk = K.track([[330, 900], [520, 820], [780, 880], [BX + 92, BY + 470], [BX + 82, BY + 260], [BX + 20, BY + 190], [BX - 30, BY + 150]]);
    boilSeed('cnerve'); paint(ribbon(Tk.sub(0, Tk.L, 14), 14, 10), { wash: Z.nerve, ink: PAL.ink, sw: .9 });
    const hypo = Math.max(seg(t, L(9, 3.2), L(9, 3.8)) * (1 - .4 * seg(t, L(9, 5), L(9, 6))), pulseK(t, L(9, 6.0), 1.2));
    const cortex = on(t, L(9, 11.8), L(9, 14.2), .25, .8);
    const h = brain(BX, BY, 1, t, { hypo: Math.max(hypo, .6 * on(t, L(9, 6), L(10, 7))), cortex }, 'br');
    for (let j = 0; j < 4; j++) {                                    // impulses running up the nerve
      const a = L(9, .4 + j * .7), k = seg(t, a, a + 2.4);
      if (k > 0 && k < 1) { const [x, y] = Tk.at(Tk.L * easeIn(k) * .7 + Tk.L * .3 * k); boilSeed('imp' + j); glow(x, y, 50, '#FFC766', .9); paint(ellPts(x, y, 13, 13, 12), { wash: Z.atp, ink: PAL.ink, sw: .9 }); }
    }
    skinPatch(330, 900, 1, t, 'cp');
    camEnd();
    // the dial swells out of the hypothalamus
    const dk = seg(t, L(9, 6.6), L(9, 7.4)), hs = toScreen(h[0], h[1], LAST_CAM), dx = lerp(hs[0], 470, ease(dk)), dy2 = lerp(hs[1], 330, ease(dk));
    const needle = t < L(10, 1.9) ? .9 * Math.exp(-2.2 * Math.max(0, t - L(9, 8.6))) * Math.cos(9 * Math.max(0, t - L(9, 8.6))) * (t > L(9, 8.6) ? 1 : 0) + (t < L(9, 8.6) ? .9 : 0)
      : lerp(0, -1.15, backOut(seg(t, L(10, 1.9), L(10, 2.6)))) + .05 * wob(t, 2);
    if (dk > 0) { dashed(hs[0], hs[1], dx, dy2, dk, mixCol(Z.brainDk, PAL.ink, .3), 'dd'); dial(dx, dy2, 180 * ease(dk) + 20, needle, 'cd', 1); }
    if (t > L(9, 9.4)) K.sparkle(dx, dy2 - 195, 40, seg(t, L(9, 9.4), L(9, 10.2)), Z.atp);
    // L10: snow starts, the needle swings cold
    const snowK = seg(t, L(10, 1.9), L(10, 2.6));
    if (snowK > 0) for (let i = 0; i < 16; i++) { const q = frac(t * .12 + i / 16), sx = hash(i + 70) * W + 30 * wob(t, .2, i), sy = lerp(-40, H + 40, q); snowflake(sx, sy, (10 + 12 * hash(i)) * snowK, t * .4 + i, '#8FA9D6', 'cs' + i); }
    // Pip, host, bottom right
    let o = K.act(t, [[0, 'calm', { lookX: -1, lookY: .4 }], [L(9, 3.4), 'wow', { lookX: -1, lookY: -.4 }], [L(9, 7.4), 'idea', { lookX: -1 }], [L(9, 11.9), 'worried', { emote: null }],
      [L(10, .6), 'calm', { lookX: 0, lookY: 0, armF: [1.2, 1.9] }], [L(10, 3.3), 'confused', { lookX: 0 }], [L(10, 6.9), 'calm', { lookX: -.6, lookY: -.5, kick: (t - L(10, 6.9)) * 1.6 }]]);
    const cold = Math.max(on(t, L(9, 11.9), L(9, 14.6), .2, .8), .4 * snowK);
    const yb = swimT(1640 + jitter(t, cortex * 4), 940, 34, t, { ...o, flip: true }, 'pc', 0, cold);
    if (cortex > .1) shakeLines(1640, yb, 34, cortex, 'csh');
    quiz(1660, 250, 120, t, L(10, .7), 124.1, 'q2');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B7AEDB', Z.brainBg]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#AFC3E6', Z.snow]);
  }

  // ---------- the cold world ----------
  function snowWorld(t, key, melt = 0, hx = 0) {
    K.wash(Z.night, t, { key, blob: Z.nightBlob, n: 5 });
    boilSeed('moon' + key); glow(1560, 170, 260, '#FFF2C8', .8); paint(ellPts(1560, 170, 70, 70, 24), { wash: '#FBF1D2', ink: null });
    for (let i = 0; i < 26; i++) { boilSeed('star' + key + i); const x = hash(i + 200) * W, y = hash(i + 201) * 520, r = 3 + 5 * hash(i + 202) * (.6 + .4 * Math.sin(t * 2 + i)); paint(starPts(x, y, r, .4, 4), { wash: PAL.cream, ink: null }); }
    boilSeed('hills' + key);
    paint(through([[-200, 760], [300, 640], [700, 700], [1100, 610], [1500, 690], [2100, 620], [2100, 900], [-200, 900]], 6), { wash: '#B9CBE6', fill: '#94AED6', fillOp: 50, tex: .5, ink: null });
    paint(rectPts(-200, 840, W + 400, 400), { wash: Z.snow, fill: Z.snowDk, fillOp: 40, tex: .4, ink: null });
    inkLine([[-200, 845], [600, 838], [1300, 848], [2200, 840]], 1.2, '#8FA9D6', 'ink', .5);
    if (melt > 0) { boilSeed('melt' + key); const R = 700 * ease(melt); paint(ellPts(hx, 862, R, R * .14, 30, 4), { wash: '#7FA05E', fill: '#5E8240', fillOp: 50, tex: .5, ink: null }); paint(ellPts(hx, 862, R * 1.08, R * .16, 30, 4).map((p, i) => p), { fill: '#AFC6E0', fillOp: 120, bleed: .2, ink: null }); }
  }
  function snowfall(t, n, key, k = 1, avoid = null) {
    for (let i = 0; i < n; i++) {
      const q = frac(t * (.08 + .05 * hash(i + 90)) + hash(i + 91)), x = hash(i + 92) * (W + 200) - 100 + 40 * wob(t, .15, i), y = lerp(-30, 900, q);
      let r = (5 + 8 * hash(i + 93)) * k; if (avoid && Math.hypot(x - avoid[0], y - avoid[1]) < avoid[2]) r *= .2;
      if (r > 1) { boilSeed('sn' + key + i); paint(ellPts(x, y, r, r, 8), { wash: PAL.cream, washOp: 230, ink: null }); }
    }
  }
  function stove(x, y, s, fire, t, key) {                          // a little cast-iron stove; fire 0..2
    auditBox('stove', key, x - 150 * s, y - 520 * s, x + 150 * s, y);
    boilSeed('stv' + key);
    for (const sd of [-1, 1]) paint(rrPts(x + sd * 100 * s - 14 * s, y - 40 * s, 28 * s, 40 * s, 6 * s), { wash: Z.iron, ink: PAL.ink, sw: 1 });
    paint(ribbon([[x + 70 * s, y - 300 * s], [x + 72 * s, y - 520 * s]], 40 * s, 40 * s), { wash: '#5E5464', ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x - 140 * s, y - 320 * s, 280 * s, 290 * s, 30 * s), { wash: Z.iron, fill: '#2E2834', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.4 });
    paint(rrPts(x - 160 * s, y - 335 * s, 320 * s, 34 * s, 12 * s), { wash: '#5E5464', ink: PAL.ink, sw: 1.2 });
    const fw = rrPts(x - 80 * s, y - 230 * s, 160 * s, 130 * s, 22 * s);
    paint(fw, { wash: mixCol('#5A2A1E', '#F28C2E', clamp(fire)), ink: PAL.ink, sw: 1.2 });
    if (fire > .05) { glow(x, y - 165 * s, 230 * s * (.6 + .4 * fire), '#FF9A40', clamp(fire)); flameIcon(x - 20 * s, y - 140 * s, 46 * s * clamp(fire, 0, 2) * (1 + .1 * wob(t, 6)), t, key + 'a'); flameIcon(x + 28 * s, y - 132 * s, 34 * s * clamp(fire, 0, 2), t + .3, key + 'b'); }
    steam(x + 72 * s, y - 540 * s, 40 * s, t * (1 + fire), clamp(fire), key + 'smk', 4);
  }
  function logProp(x, y, s, rot, key) {
    boilSeed('log' + key);
    push(); translate(x, y); rotate(rot); scale(s);
    paint(rrPts(-60, -18, 120, 36, 16), { wash: '#9A6438', fill: '#6E4224', fillOp: 50, tex: .6, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(60, 0, 12, 18, 12), { wash: '#E3B987', ink: PAL.ink, sw: .9 });
    inkLine([[54, -6], [62, 4]], 1, '#9A6438', 'inkfine', .5);
    pop();
  }
  // a lens held in Pip's hand: returns its centre. hand = the handle's end, ang = the handle's direction from the lens
  const lensFrom = (hand, R, ang) => [hand[0] - Math.cos(ang) * R * 1.55, hand[1] - Math.sin(ang) * R * 1.55];

  // D1 · snow: less heat lost, goosebumps, shivering, hormones and the stove
  const SX = 560, SY = 860, SU = 42;
  function shotD1(t, lt, dur) {
    K.setT(t);
    const dive = seg(t, L(14, 8.6), L(14, 9.4));
    const stoveX = lerp(2300, 1340, backOut(seg(t, L(14, 0), L(14, .7))));
    camBegin(lerp(960 + 6 * wob(t, .05), stoveX, ease(dive)), lerp(560 + 4 * wob(t, .04), SY - 165, ease(dive)), lerp(1.02, 7, easeIn(dive)));
    snowWorld(t, 'd1');
    // Pip's acting
    const keys = [[0, 'worried', { emote: null }], [L(11, 4.0), 'worried'], [L(11, 10.1), 'wow', { take: 1.6 }], [L(12, 1.0), 'idea', { lookX: .8, lookY: -.8, emote: null }],
      [L(12, 5.2), 'sad'], [L(12, 8.9), 'worried', { blush: 1, lookX: -.4, lookY: .6 }], [L(13, 2.8), 'strain'], [L(13, 9.3), 'sing'], [L(14, 1.0), 'calm', { lookX: .9, lookY: -.3 }],
      [L(14, 6.4), 'strain', { emote: null }], [L(14, 7.5), 'laugh']];
    let o = K.act(t, keys);
    const shiver = on(t, L(13, 2.9), L(13, 9.3), .2, .2), dance = on(t, L(13, 9.3), L(14, 1), .2, .5);
    const lensK = Math.min(seg(t, L(11, .5), L(11, 1.0)), 1 - seg(t, L(12, .4), L(12, .8)) + seg(t, L(13, .5), L(13, .9)), 1 - seg(t, L(14, -.2), L(14, .2)));
    const throwT = seg(t, L(14, 6.6), L(14, 7.3));
    if (lensK > 0) o = { ...o, armsFront: false, armF: { at: [2.6, -2.8] } };
    if (t > L(14, 5.4) && t < L(14, 6.7)) o = { ...o, armF: { at: kf(t, [[L(14, 5.4), [1.6, -1.6]], [L(14, 5.8), [1.6, -1.6]], [L(14, 6.4), [-1.4, -3.4]], [L(14, 6.7), [3.2, -3.6]]]) } };
    if (dance > 0) { const b = pulse(t, 5); o = { ...o, dy: (o.dy || 0) - .35 * b * dance, sq: (o.sq || 0) + .08 * b * dance, rot: .12 * Math.sin(bpOf(t) * Math.PI) * dance }; }
    const cold = clamp(.35 + .35 * seg(t, L(11, 6.0), L(11, 7.2)) - .5 * seg(t, L(14, 7.4), L(14, 8.4)));
    const px = SX + jitter(t, shiver * 9 + (t < L(13, 2.9) ? 1.5 : 0)), py = SY;
    const spk = backOut(seg(t, L(11, 10.1), L(11, 10.5))) * (1 - ease(seg(t, L(12, 5.2), L(12, 6.0))));
    spikes(px, py, SU, o, spk, 'pdS');
    const wiltK = seg(t, L(12, 5.8), L(12, 6.2)) * (1 - seg(t, L(13, 2.6), L(13, 3.0)));
    if (wiltK > 0) spikes(px, py, SU, o, wiltK, 'pdW', ease(seg(t, L(12, 6.2), L(12, 7.6))), 3, [-.75, .45, 1.0]);
    pipT(px, py, SU, { ...o, key: 'pd' }, 0, cold);
    bumps(px, py, SU, o, seg(t, L(12, 9.0), L(12, 9.8)) * (1 - seg(t, L(13, 2.6), L(13, 3.0))), 'pdB');
    shakeLines(px, py, SU, shiver, 'pdsh');
    if (shiver > .3) for (let i = 0; i < 4; i++) K.sparkle(px + Math.cos(i * 1.6 + t) * 2.6 * SU, py - 2.5 * SU + Math.sin(i * 1.6 + t) * 2 * SU, 22, frac(t * 2 + i / 4), '#F28C2E');
    if (dance > .2) pipEmote('note', px - 2.6 * SU, py - 5.4 * SU, SU * dance, -1, 'pdn');
    // the lens on Pip's own skin
    if (lensK > 0) {
      const hand = K.hand(px, py, SU, [2.6, -2.8], { dy: o.dy }), R = 260, ang = 2.55, [lx, ly] = lensFrom(hand, R, ang);
      const R2 = R * backOut(lensK);
      skinLens(lx, ly, R2, t, { vessel: lerp(36, 14, ease(seg(t, L(11, 4.1), L(11, 5.1)))), heat: 1 - .8 * seg(t, L(11, 4.6), L(11, 6.6)), hair: ease(seg(t, L(11, 8.6), L(11, 9.6))),
        muscle: t > L(13, .5) ? clamp(.3 + shiver) : 0, air: '#DCE6F3' }, 'd1l');
      magnifier(lx, ly, R, ang, 'mgD', lensK);
      if (t > L(11, 4.0) && t < L(11, 5.6)) for (const sd of [-1, 1]) arrow(lx + sd * R * .75, ly + .3 * R + sd * -60, lx + sd * R * .75, ly + .3 * R + sd * -22, seg(t, L(11, 4.0), L(11, 4.5)), Z.hotDk, 'va' + sd, 9);
    }
    // the fluffy dream
    const ck = on(t, L(12, .9), L(12, 5.2), .4, .3);
    if (ck > 0) {
      const cx = 1180, cy = 400; cloud(cx, cy, 390, 300, ck, [SX + 60, SY - 6 * SU], 'dream');
      if (ck > .6) {
        boilSeed('fluff'); glow(cx, cy + 30, 300, '#FFB870', .5);
        for (let i = 0; i < 44; i++) { const a = i / 44 * TAU, r = 2.9 * 36 + 10 * Math.sin(i * 2.3); paint(ellPts(cx + Math.cos(a) * r * .95, cy + 110 - 2.4 * 36 + Math.sin(a) * r * 1.05, 28, 19, 10, 0, a), { wash: i % 2 ? PIPC.pipDk : mixCol(PIPC.pip, PAL.cream, .2), ink: PAL.ink, sw: .5 }); }
        pip(cx, cy + 110, 36, { ...pipFeel('happy', t), key: 'fluffy', noShadow: true });
      }
    }
    // the stove: hormones in, then a log
    if (t > L(14, -.1)) {
      const fire = .35 + .45 * seg(t, L(14, 1.5), L(14, 4.2)) + .9 * seg(t, L(14, 7.3), L(14, 7.7));
      stove(stoveX, SY + 2, 1.1, fire, t, 'stv');
      for (let i = 0; i < 8; i++) {
        const a = L(14, .9 + i * .38), k = seg(t, a, a + 1.0);
        if (k > 0 && k < 1) { const p = arcPt([SX + (i % 2 ? 200 : -100), -40], [stoveX + 72, SY - 560], -120, easeIn(k)); boilSeed('hd' + i); paint(ellPts(p[0], p[1], 15, 19, 12).map(([x, y]) => [x, y < p[1] ? p[1] - (p[1] - y) * 1.5 : y]), { wash: i % 2 ? Z.hot : Z.atp, ink: PAL.ink, sw: .8 }); }
      }
      if (throwT > 0 && throwT < 1) { const p = arcPt(K.hand(SX, SY, SU, [3.2, -3.6]), [stoveX, SY - 170], 220, throwT); logProp(p[0], p[1], 1, throwT * 9, 'lg'); }
      if (t > L(14, 7.3)) K.burst(stoveX, SY - 170, 160, seg(t, L(14, 7.3), L(14, 7.9)), '#F28C2E', 'roar');
    }
    if (t > L(14, 5.4) && t < L(14, 6.65)) logProp(...K.hand(px, SY, SU, o.armF.at, { dy: o.dy }), 1, -.4 + seg(t, L(14, 5.8), L(14, 6.6)) * 2, 'lg');
    snowfall(t, 26, 'd1', 1);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#AFC3E6', Z.snow]);
    flash(seg(t, L(14, 9.0), L(14, 9.3)), '#FFE7C2');
  }

  // ---------- brown fat ----------
  const FX = 960, FY = 560, FR = 400;
  const fatDrops = [...Array(14)].map((_, i) => { const a = i / 14 * TAU + .3 * hash(i), r = FR * (.62 + .22 * hash(i + 1)); return [FX + Math.cos(a) * r, FY + Math.sin(a) * r * .95, 30 + 18 * hash(i + 2)]; });
  const fatMitos = [...Array(9)].map((_, i) => { const a = (i + .5) / 9 * TAU + .2, r = FR * (.5 + .18 * hash(i + 5)); return [FX + Math.cos(a) * r, FY + Math.sin(a) * r * .95, a + Math.PI / 2]; });
  function mito(x, y, s, ang, k, key) {                             // a mitochondrion: double membrane, cristae
    boilSeed('mt' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    if (k > .02) glow(0, 0, 120, '#FF9A40', k);
    paint(ellPts(0, 0, 62, 30, 24, 1), { wash: mixCol(Z.mito, '#E8743C', k * .6), fill: Z.mitoDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
    const P = []; for (let j = 0; j <= 10; j++) P.push([-48 + j * 9.6, (j % 2 ? -1 : 1) * 17]);
    inkLine(P, 1.3, mixCol(Z.mitoDk, PAL.cream, .3), 'ink', .2);
    pop();
  }
  function fattyAcid(x, y, s, ang, key) {
    boilSeed('fa' + key);
    const P = []; for (let i = 0; i <= 6; i++) P.push([x + Math.cos(ang) * i * 11 * s - Math.sin(ang) * (i % 2 ? 5 : -5) * s, y + Math.sin(ang) * i * 11 * s + Math.cos(ang) * (i % 2 ? 5 : -5) * s]);
    inkLine(P, 2.4 * s, '#B88A2E', 'ink', 0);
    paint(ellPts(P[0][0], P[0][1], 6 * s, 6 * s, 8), { wash: Z.hot, ink: PAL.ink, sw: .6 });
  }

  // D2a · a brown fat cell wakes up
  function shotD2a(t, lt, dur) {
    K.setT(t);
    const tgtM = fatMitos[1], dive = seg(t, L(16, -.7), L(16, .3));
    camBegin(lerp(960 + 6 * wob(t, .05), tgtM[0], ease(dive)), lerp(540 + 4 * wob(t, .04), tgtM[1], ease(dive)), lerp(1, 8, easeIn(dive)));
    K.wash('#E9B98A', t, { key: 'fat', blob: '#F4D2AE' });
    K.motes(t, 18, '#D9A066', { key: 'fm' });
    const wake = seg(t, L(15, 6.6), L(15, 7.0)), lyse = ease(seg(t, L(15, 8.1), L(15, 10.5)));
    const mood = t < L(15, 6.6) ? 'sleepy' : t < L(15, 8.4) ? 'wow' : 'determined';
    K.cell(FX, FY, FR, Z.fat, Z.fatDk, t, { key: 'fatc', mood, nucleus: false, sq: .08 * spring(t, L(15, 6.6), 4, 16), fx: 0,
      extras: () => {
        fatDrops.forEach(([x, y, r], i) => { boilSeed('fd' + i); paint(ellPts(x, y, r * (1 - .45 * lyse), r * (1 - .45 * lyse), 16), { wash: Z.drop, fill: '#EAD58A', fillOp: 50, tex: .4, ink: PAL.ink, sw: .8 }); });
        fatMitos.forEach(([x, y, a], i) => mito(x, y, .9, a, .8 * seg(t, L(15, 10.4 + i * .1), L(15, 11.2 + i * .1)), 'fm' + i));
        for (let i = 0; i < 14; i++) {                              // fatty acids from droplet i to a mitochondrion
          const a0 = L(15, 8.1 + (i % 7) * .25), k = seg(t, a0, a0 + 2.2); if (k <= 0 || k >= 1) continue;
          const d = fatDrops[i], m = fatMitos[i % 9], p = arcPt([d[0], d[1]], [m[0], m[1]], 40, ease(k));
          fattyAcid(p[0], p[1], 1, t * 2 + i, 'fa' + i);
        }
        // β3 receptors on the membrane near the nerve, lit when noradrenaline lands
        for (let i = 0; i < 4; i++) { const a = -.95 + i * .14, rx = FX + Math.cos(a) * FR, ry = FY + Math.sin(a) * FR; boilSeed('b3' + i); paint(ellPts(rx, ry, 12, 9, 10), { wash: mixCol('#7B5CA8', Z.atp, seg(t, L(15, 5.3), L(15, 5.8))), ink: PAL.ink, sw: .8 }); }
      } });
    if (t < L(15, 6.6)) pipEmote('zzz', FX + 150, FY - 220, 34, 1, 'fz');
    if (wake > 0 && wake < 1) K.burst(FX, FY - 80, 260, wake, PAL.ink, 'wk');
    // the sympathetic nerve ending, releasing noradrenaline
    boilSeed('dnerve'); paint(ribbon([[1800, -60], [1560, 90], [1330, 140]], 26, 20), { wash: Z.nerve, ink: PAL.ink, sw: 1 });
    paint(ellPts(1310, 150, 38, 30, 16), { wash: mixCol(Z.nerve, Z.atp, pulseK(t, L(15, 3.8), .8)), ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 12; i++) {
      const a = L(15, 3.9 + i * .14), k = seg(t, a, a + 1.4); if (k <= 0) continue;
      const rr = -.95 + (i % 4) * .14, end = [FX + Math.cos(rr) * (FR + 14), FY + Math.sin(rr) * (FR + 14)], p = arcPt([1300, 170], end, 30 * hash(i), easeOut(k));
      if (k < 1) { boilSeed('ne' + i); paint(ellPts(p[0], p[1], 8, 8, 8), { wash: '#C25E9C', ink: PAL.ink, sw: .6 }); }
    }
    camEnd();
    const o = K.act(t, [[0, 'calm', { lookX: .8, lookY: -.3 }], [L(15, 1.5), 'excited'], [L(15, 3.8), 'calm', { lookX: 1, lookY: -.9 }], [L(15, 6.7), 'wow'], [L(15, 8.6), 'happy']]);
    swimT(200, 960, 30, t, o, 'pd2', 0, .2);
    flash(Math.max(1 - seg(lt, 0, .5), seg(t, L(16, -.15), L(16, .3))), '#FFE7C2');
  }

  // D2b · the inner mitochondrial membrane: the pump, ATP synthase (front door), UCP1 (back door)
  const MY = 600, PUX = 400, ASX = 960, UCX = 1500;
  function atpSynthase(x, y, s, rot, t, key, stall = 0) {
    auditBox('atps', key, x - 90 * s, y - 50 * s, x + 90 * s, y + 260 * s);
    boilSeed('as' + key);
    paint(ribbon([[x + 78 * s, y], [x + 92 * s, y + 120 * s], [x + 60 * s, y + 160 * s]], 14 * s, 12 * s), { wash: '#9BB37A', ink: PAL.ink, sw: .9 });   // stator
    paint(ribbon([[x, y], [x, y + 150 * s]], 20 * s, 20 * s), { wash: '#6F8B52', ink: PAL.ink, sw: .9 });                                               // central stalk
    for (let j = 0; j < 3; j++) { const jx = x + (j - 1) * 56 * s; paint(ellPts(jx, y + 200 * s, 34 * s, 46 * s, 16), { wash: j % 2 ? '#C7D99A' : '#A6C276', fill: '#6F8B52', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 }); }
    paint(rrPts(x - 82 * s, y - 42 * s, 164 * s, 84 * s, 26 * s), { wash: '#B5CC86', fill: '#7FA05A', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1 });          // the c-ring
    for (let j = 0; j < 7; j++) { const ph = frac(j / 7 + rot), xx = x + Math.sin((ph - .5) * Math.PI) * 74 * s, wv = Math.cos((ph - .5) * Math.PI); if (wv > .15) inkLine([[xx, y - 36 * s], [xx, y + 36 * s]], 1.4 * wv, '#56713E', 'ink', 0); }
    if (stall > 0) { const q = backOut(clamp(stall)); paint(ellPts(x + 120 * s, y - 70 * s, 26 * q * s, 26 * q * s, 18), { wash: K.C.red, ink: PAL.ink, sw: 1 }); paint(rrPts(x + 120 * s - 15 * q * s, y - 74 * s, 30 * q * s, 8 * q * s, 3), { wash: PAL.cream, ink: null }); }
  }
  function pumpComplex(x, y, s, k, key) {                          // a respiratory-chain complex (membrane arm + matrix arm)
    boilSeed('pc' + key);
    paint(rrPts(x - 90 * s, y - 46 * s, 180 * s, 92 * s, 20 * s), { wash: '#B392C9', fill: '#7B5CA8', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x - 70 * s, y + 30 * s, 70 * s, 170 * s * (1 + .05 * k), 22 * s), { wash: '#C9AEDB', fill: '#7B5CA8', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 });
  }
  function ucp1(x, y, s, k, t, key) {                               // UCP1: a small brown channel, the back door
    if (k <= .02) return; boilSeed('uc' + key);
    const q = backOut(k) * s;
    for (const sd of [-1, 1]) paint([[sd * 6 * q + x, y - 44 * q], [sd * 40 * q + x, y - 40 * q], [sd * 44 * q + x, y + 40 * q], [sd * 6 * q + x, y + 44 * q]], { wash: '#9C6A4A', fill: '#6E4228', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1, curv: .3 });
  }
  function proton(x, y, s, key, legs = 0, t = 0) {
    if (legs > 0) { boilSeed('pl' + key); for (const sd of [-1, 1]) { const st = Math.sin(t * 14 + (sd > 0 ? 0 : Math.PI)) * 6 * legs; inkLine([[x + sd * 5, y + 12 * s], [x + sd * 8 + st, y + 24 * s], [x + sd * 13 + st, y + 24 * s]], 2, PAL.ink, 'ink', .3); } }
    ion(x, y, 'h', s, key);
  }
  function shotD2b(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 560 + 4 * wob(t, .04), 1.0 + .03 * seg(t, L(17, 0), L(17, 10)));
    boilSeed('d2bims'); paint(rectPts(-200, -200, W + 400, MY + 200), { wash: Z.ims, ink: null });
    const heat = seg(t, L(17, 10.3), L(17, 12.6));
    boilSeed('d2bmat'); paint(rectPts(-200, MY, W + 400, 800), { wash: mixCol(Z.matrix, '#F2A35E', .7 * heat), fill: '#D99A55', fillOp: 40, tex: .5, ink: null });
    K.motes(t, 14, '#D9A066', { key: 'd2bm', y0: 300 });
    const Tk = K.track([[-300, MY], [2300, MY]]), sp = (a, b, k) => K.bilayer(Tk, 1.9, { key: k, from: a + 300, to: b + 300 });
    sp(-300, PUX - 95, 'i1'); sp(PUX + 95, ASX - 88, 'i2'); sp(ASX + 88, UCX - 50, 'i3'); sp(UCX + 50, 2300, 'i4');
    if (t < L(17, 2.3)) sp(UCX - 50, UCX + 50, 'i5');
    pumpComplex(PUX, MY, 1.1, pulseK(t, L(16, 1.0), 2.5), 'pp');
    const synthActive = t > L(16, 4.3) && t < L(17, 8.7);
    const rot = (Math.min(t, L(17, 8.7)) - L(16, 4.3)) * (t > L(16, 4.3) ? .8 : 0);
    atpSynthase(ASX, MY, 1.1, rot, t, 'as', seg(t, L(17, 8.6), L(17, 9.0)));
    ucp1(UCX, MY, 1.3, seg(t, L(17, 2.2), L(17, 2.6)), t, 'uc');
    if (t > L(17, 2.2)) K.burst(UCX, MY, 90, seg(t, L(17, 2.2), L(17, 2.8)), PAL.ink, 'ucb');
    // protons: pumped up (L16), then through the front door (set A) or the back door (set B)
    for (let i = 0; i < 18; i++) {
      const A = i < 9, up0 = L(16, 1.0 + i * .14), ku = seg(t, up0, up0 + 1.1);
      const below = [PUX - 160 + hash(i + 300) * 260, MY + 160 + hash(i + 301) * 160], top = [200 + hash(i + 302) * 1500, MY - 150 - hash(i + 303) * 200 + 14 * wob(t, .3, i)];
      let p, legs = 0;
      if (ku < 1) p = ku < .5 ? [lerp(below[0], PUX, ease(ku * 2)), lerp(below[1], MY + 60, ease(ku * 2))] : [lerp(PUX, top[0], easeOut(ku * 2 - 1)), lerp(MY - 60, top[1], easeOut(ku * 2 - 1))];
      else {
        const door = A ? ASX : UCX, d0 = A ? L(16, 4.3 + i * .55) : L(17, 5.6 + (i - 9) * .35), k = seg(t, d0, d0 + (A ? 1.5 : 2.2));
        const end = [door + (i % 2 ? 1 : -1) * (170 + hash(i + 304) * 200), MY + 150 + hash(i + 305) * 260];
        if (k <= 0) p = top;
        else if (k < .55) { const q = ease(k / .55); p = [lerp(top[0], door, q), lerp(top[1], MY - 70, q)]; legs = A ? 0 : 1; if (!A) p[1] = lerp(top[1], MY - 70, q) - 8 * Math.abs(Math.sin(k * 30)); }
        else if (k < .7) p = [door, lerp(MY - 70, MY + 70, (k - .55) / .15)];
        else p = [lerp(door, end[0], easeOut((k - .7) / .3)), lerp(MY + 70, end[1], easeOut((k - .7) / .3))];
        if (!A && k > 0 && k < .55) legs = 1;
      }
      proton(p[0], p[1], 1.5, 'h' + i, legs, t);
    }
    // ATP: one bead cluster per three protons through the synthase
    for (let j = 0; j < 3; j++) {
      const a = L(16, 6.0 + j * 1.6), k = seg(t, a, a + 1.8); if (k <= 0) continue;
      const p = [lerp(ASX, ASX + 160 + j * 110, easeOut(k)), lerp(MY + 230, MY + 330 + 30 * j, easeOut(k))];
      boilSeed('atp' + j); paint(ellPts(p[0], p[1], 16, 16, 10), { wash: '#E59A7B', ink: PAL.ink, sw: .8 });
      for (let b = 0; b < 3; b++) paint(ellPts(p[0] + 22 + b * 18, p[1], 9 * backOut(clamp(k * 3 - b * .3)), 9 * backOut(clamp(k * 3 - b * .3)), 10), { wash: Z.atp, ink: PAL.ink, sw: .7 });
    }
    K.cross(ASX + 220, MY + 300, 90, seg(t, L(17, 8.8), L(17, 9.4)), 'nox');
    // heat floods out of the back door
    if (heat > 0) { glow(UCX, MY + 200, 520 * heat, '#FF8A40', heat); heatLines(UCX, MY + 420, 700, -520, t, heat, 'uh', 7, '#E8743C'); }
    camEnd();
    const o = K.act(t, [[0, 'calm', { lookX: 1, lookY: -.3 }], [L(16, 8.2), 'happy'], [L(17, 2.4), 'wow'], [L(17, 6.0), 'smug'], [L(17, 9.0), 'worried', { emote: null }], [L(17, 10.6), 'laugh']]);
    swimT(180, 960, 30, t, o, 'pd2b', heat * .7, 0);
    flash(Math.max(1 - seg(lt, 0, .5), seg(t, 211.6, 212.0)), '#FFE7C2');
  }

  // D3 · back in the snow: Pip glows like a stove, the snow melts
  function shotD3(t, lt, dur) {
    K.setT(t);
    camBegin(900 + 4 * wob(t, .05), 600, 1.08);
    const melt = seg(t, 212.4, 216.0);
    snowWorld(t, 'd3', melt, 900);
    const o = K.act(t, [[0, 'wow', { take: 1.4 }], [212.8, 'laugh'], [215.2, 'excited']]);
    glow(900, SY - 2.5 * SU, 420, '#FF9A40', 1);
    pipT(900, SY, SU, { ...o, key: 'pd3' }, .75, 0);
    steam(900, SY - 6 * SU, SU, t, 1, 'd3s', 6);
    heatLines(900, SY - 3 * SU, 7 * SU, -6 * SU, t, 1, 'd3h', 6, '#F28C2E');
    snowfall(t, 26, 'd3', 1, [900, SY - 200, 420]);
    camEnd();
    flash(1 - seg(lt, 0, .5), '#FFE7C2');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E8A64A', Z.sky]);
  }

  // ---------- the hot world ----------
  function desert(t, key, fog = 0) {
    K.wash(Z.sky, t, { key, blob: '#FBEBC6', n: 5 });
    boilSeed('sun' + key); glow(1640, 170, 300, '#FFE08A', .7);
    const rr = 92 * (1 + .04 * wob(t, 1.2));
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .15; paint([[1640 + Math.cos(a - .1) * rr * 1.2, 170 + Math.sin(a - .1) * rr * 1.2], [1640 + Math.cos(a) * rr * 1.75, 170 + Math.sin(a) * rr * 1.75], [1640 + Math.cos(a + .1) * rr * 1.2, 170 + Math.sin(a + .1) * rr * 1.2]], { wash: '#F2B33E', ink: null }); }
    paint(ellPts(1640, 170, rr, rr, 26), { wash: '#F7C948', fill: '#E89A2E', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.2 });
    boilSeed('dunes' + key);
    paint(through([[-200, 760], [400, 680], [900, 740], [1400, 660], [2100, 720], [2100, 900], [-200, 900]], 6), { wash: '#F0C27A', fill: Z.duneDk, fillOp: 40, tex: .5, ink: null });
    paint(rectPts(-200, 840, W + 400, 400), { wash: Z.dune, fill: Z.duneDk, fillOp: 50, tex: .5, ink: null });
    inkLine([[-200, 845], [600, 838], [1300, 848], [2200, 840]], 1.2, '#B97E35', 'ink', .5);
    boilSeed('cactus' + key);
    paint(ribbon([[1720, 845], [1722, 640]], 46, 40), { wash: '#7DAF5E', fill: '#4E8A3E', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(ribbon([[1722, 760], [1790, 750], [1792, 690]], 26, 22), { wash: '#7DAF5E', ink: PAL.ink, sw: 1 });
    heatLines(960, 830, 1700, -260, t, 1 - fog, 'shim' + key, 8, '#F2C27A');
  }
  function fogLayer(t, k, key) {
    if (k <= .02) return;
    boilSeed('fog' + key); paint(rectPts(-200, -200, W + 400, H + 400), { wash: '#DCD8CF', washOp: 215 * k, ink: null });
    for (let i = 0; i < 7; i++) { boilSeed('fogb' + key + i); paint(ellPts(hash(i + 400) * W + 60 * wob(t, .05, i), hash(i + 401) * H, 380, 140, 18, 6), { fill: '#F1EEE8', fillOp: 150 * k, bleed: .3, tex: .4, ink: null }); }
    for (let i = 0; i < 46; i++) { boilSeed('fogd' + key + i); const x = hash(i + 420) * W + 20 * wob(t, .2, i), y = hash(i + 421) * H + 16 * wob(t, .17, i); paint(ellPts(x, y, 6 * k, 7 * k, 8), { wash: '#9DB9C6', ink: null }); }
  }

  // E · heat: flushing, sweating, evaporation; quiz 3; the sauna melts Pip
  function shotE(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 560 + 4 * wob(t, .04), 1.02);
    const fog = seg(t, L(19, 9.7), L(19, 12.5));
    desert(t, 'e', fog);
    fogLayer(t, fog, 'e');
    let o = K.act(t, [[0, 'wow', { take: 1.2 }], [L(18, 1.2), 'strain', { emote: 'exclaim' }], [L(18, 3.0), 'worried'], [L(18, 9.2), 'excited', { emote: null }], [L(19, 1.4), 'calm', { lookX: .9, lookY: -.4 }],
      [L(19, 7.5), 'wow'], [L(19, 9.8), 'worried', { lookX: 0, lookY: 0 }], [L(20, 1.4), 'worried'], [L(20, 4.3), 'sad', { tear: .6 }]]);
    const hot = clamp(seg(t, L(18, .2), L(18, 1.4)) - .25 * seg(t, L(19, 1.4), L(19, 6)) + .3 * seg(t, L(20, 1.4), L(20, 3)));
    const melt = ease(seg(t, L(20, 4.3), L(20, 7.6)));
    const lensK = Math.min(seg(t, L(18, 2.0), L(18, 2.5)), 1 - seg(t, L(20, 2.6), L(20, 3.1)));
    if (lensK > 0) o = { ...o, armsFront: false, armF: { at: [2.6, -2.8] } };
    o = { ...o, sq: (o.sq || 0) + .48 * melt, dy: (o.dy || 0) * (1 - melt), leaf: lerp(o.leaf || 0, -1.4, melt) };
    if (melt > .1) o = { ...o, armF: [-1.5, 1.5 * (1 - melt * .5)], armB: [-1.5, 1.5 * (1 - melt * .5)], emote: null };
    // the puddle of sweat
    const pud = Math.max(.25 * seg(t, L(18, 9.4), L(19, 1)), melt) * (1 - .3 * seg(t, L(19, 1), L(19, 3)) * (1 - seg(t, L(20, 2.9), L(20, 4))));
    if (pud > .02) { boilSeed('pud'); paint(ellPts(SX, SY + 4, 2.4 * SU * (1 + 1.4 * pud), .35 * SU * (1 + .8 * pud), 24, 3), { wash: '#A9D3EC', fill: '#7FB4D9', fillOp: 50, tex: .3, ink: PAL.ink, sw: .9 }); }
    pipT(SX, SY, SU, { ...o, key: 'pe' }, hot, 0);
    const hd = headOf(SX, SY, SU, o);
    steam(hd[0], hd[1] - 1.3 * SU, SU, t * 2, on(t, L(18, 1.2), L(18, 3.0), .1, .5), 'kettle', 7);
    if (t > L(18, 1.2) && t < L(18, 3.0)) heatLines(hd[0], hd[1] - 1.5 * SU, 30, -3 * SU, t * 3, 1, 'whistle', 2, PAL.cream);
    // sprinkler: sweat sprays in arcs
    const spray = on(t, L(18, 9.3), L(19, 1.2), .2, .5);
    if (spray > 0) for (let i = 0; i < 14; i++) { const q = frac(t * 1.3 + i / 14), a = -Math.PI / 2 + (hash(i + 500) - .5) * 2.6, p0 = [SX + Math.cos(a) * 1.8 * SU, SY - 2.6 * SU + Math.sin(a) * 2.4 * SU], p1 = [p0[0] + Math.cos(a) * 5 * SU, SY + 10], p = arcPt(p0, p1, 2.6 * SU, q); boilSeed('spr' + i); paint(ellPts(p[0], p[1], 13 * spray, 17 * spray, 10), { wash: PAL.sky, ink: PAL.ink, sw: .8 }); }
    // sweat running down in the fog
    if (t > L(20, 2.9) && melt < .9) for (let i = 0; i < 6; i++) { const q = frac(t * .8 + i / 6), a = (i % 2 ? 1 : -1) * (.6 + .3 * hash(i + 520)), p = eggAt(SX, SY, SU, o, Math.PI - a * (1 - q) * 2.4); boilSeed('drip' + i); paint(ellPts(p[0], p[1], 7, 10, 10), { wash: PAL.sky, ink: PAL.ink, sw: .6 }); }
    // the lens: vessels widen, the gland pumps, sweat evaporates carrying heat away
    if (lensK > 0) {
      const hand = K.hand(SX, SY, SU, [2.6, -2.8], { dy: o.dy }), R = 260, ang = 2.55, [lx, ly] = lensFrom(hand, R, ang), R2 = R * backOut(lensK);
      const big = t > L(19, 5.3) && t < L(19, 9.6);
      skinLens(lx, ly, R2, t, { vessel: lerp(30, 64, ease(seg(t, L(18, 2.6), L(18, 3.6)))), heat: big ? 0 : Math.max(seg(t, L(18, 4.6), L(18, 5.4)), .3), hair: 0, gland: seg(t, L(18, 7.2), L(18, 7.6)),
        drops: big ? 0 : seg(t, L(19, .8), L(19, 1.4)), evap: big ? 0 : seg(t, L(19, 1.4), L(19, 2.0)), fogged: t > L(19, 12), air: mixCol('#FBEBC6', Z.fog, fog) }, 'el');
      if (big) {                                                      // one drop of sweat, and the crowd of heat it carries off
        const bk = seg(t, L(19, 5.3), L(19, 6.0)), burst = seg(t, L(19, 7.4), L(19, 9.2)), sy = ly - .3 * R2;
        boilSeed('bigdrop'); if (burst < .2) paint(ellPts(lx, sy - 40 * backOut(bk), 46 * backOut(bk), 50 * backOut(bk), 18).map(([x, y]) => [x, y < sy - 40 ? sy - 40 - (sy - 40 - y) * 1.4 : y]), { wash: PAL.sky, ink: PAL.ink, sw: 1 });
        if (burst > 0) for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (i / 17 - .5) * 2.4, d = 60 + 340 * easeOut(burst) * (.6 + .4 * hash(i + 610)); parcel(lx + Math.cos(a) * d, sy - 40 + Math.sin(a) * d * .9, 28 * (1 - seg(burst, .8, 1)), 'bp' + i); }
      }
      magnifier(lx, ly, R, ang, 'mgE', lensK);
    }
    camEnd();
    quiz(1660, 250, 120, t, L(19, 10.0), 243.0, 'q3');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E8A64A', Z.sky]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E4D4AE', Z.board]);
  }

  // F · the recap: one negative-feedback loop
  function shotF(t, lt, dur) {
    K.setT(t);
    camBegin(1060 + 5 * wob(t, .05), 545 + 4 * wob(t, .04), 1.3);
    K.wash(Z.board, t, { key: 'f', blob: Z.boardBlob });
    const N = [[780, 300], [1400, 300], [1400, 760], [780, 760]], popK = i => seg(t, [L(21, 1.3), L(21, 3.2), L(21, 5.4), L(21, 8.0)][i], [L(21, 1.3), L(21, 3.2), L(21, 5.4), L(21, 8.0)][i] + .4);
    const glowAt = i => pulseK(t, [L(21, 1.3), L(21, 3.2), L(21, 5.4), L(21, 8.0)][i], 1.2);
    // the loop's arrows (clockwise), the last one carrying the minus
    arrow(N[0][0] + 150, N[0][1], N[1][0] - 150, N[1][1], seg(t, L(21, 2.6), L(21, 3.2)), Z.atp, 'a1');
    arrow(N[1][0], N[1][1] + 140, N[2][0], N[2][1] - 150, seg(t, L(21, 4.7), L(21, 5.3)), Z.atp, 'a2');
    arrow(N[2][0] - 170, N[2][1], N[3][0] + 110, N[3][1], seg(t, L(21, 7.4), L(21, 8.0)), Z.atp, 'a3');
    arrow(N[3][0], N[3][1] - 200, N[0][0], N[0][1] + 110, seg(t, L(21, 9.4), L(21, 10.0)), Z.atp, 'a4');
    K.charge('-', N[0][0] - 60, (N[0][1] + N[3][1]) / 2 - 20, 70, seg(t, L(21, 10.3), L(21, 10.8)), K.C.red, 'neg');
    // 1 · the sensors: a strip of membrane with TRPV1 and TRPM8
    if (popK(0) > 0) { push(); translate(N[0][0], N[0][1]); scale(backOut(popK(0))); translate(-N[0][0], -N[0][1]);
      boilSeed('fmem'); paint(rrPts(N[0][0] - 140, N[0][1] - 18, 280, 36, 14), { wash: K.C.tail, ink: PAL.ink, sw: 1 });
      channel(N[0][0] - 60, N[0][1] - 30, .8, .3, Z.hot, Z.hotDk, t, 'fv', glowAt(0)); channel(N[0][0] + 60, N[0][1] - 30, .8, .3, Z.cold, Z.coldDk, t, 'fm', glowAt(0)); pop(); }
    // 2 · the thermostat
    if (popK(1) > 0) dial(N[1][0], N[1][1], 130, .25 * Math.sin(t * 1.3) * (1 - seg(t, L(21, 8.0), L(21, 9.0))), 'fd', popK(1));
    if (glowAt(1) > 0) ring(N[1][0], N[1][1], 150, 150, seg(t, L(21, 3.2), L(21, 4.2)), Z.atp, 'fr2');
    // 3 · the effectors: a vessel, a sweat drop, a muscle, brown fat's flame
    for (let i = 0; i < 4; i++) {
      const k = seg(t, L(21, 5.4 + i * .3), L(21, 5.8 + i * .3)); if (k <= 0) continue;
      const x = N[2][0] + (i % 2 ? 80 : -80), y = N[2][1] + (i < 2 ? -70 : 70), q = backOut(k); boilSeed('fe' + i);
      if (i === 0) paint(ribbon([[x - 60 * q, y], [x, y + 8 * q], [x + 60 * q, y]], 30 * q, 30 * q), { wash: Z.blood, ink: PAL.ink, sw: 1 });
      if (i === 1) paint(ellPts(x, y + 8, 30 * q, 36 * q, 16).map(([a, b]) => [a, b < y + 8 ? y + 8 - (y + 8 - b) * 1.5 : b]), { wash: PAL.sky, ink: PAL.ink, sw: 1 });
      if (i === 2) { paint(rrPts(x - 60 * q, y - 26 * q, 120 * q, 52 * q, 24 * q), { wash: '#D9707A', ink: PAL.ink, sw: 1 }); for (let j = -3; j <= 3; j++) inkLine([[x + j * 14 * q, y - 20 * q], [x + j * 14 * q, y + 20 * q]], 1, '#8E3644', 'inkfine', 0); }
      if (i === 3) { mito(x, y, .8 * q, .3, .5, 'fem'); flameIcon(x, y - 36 * q, 30 * q, t, 'fef'); }
    }
    // 4 · the body's temperature, swinging back to the set point
    const lev = .5 + .32 * Math.exp(-1.6 * Math.max(0, t - L(21, 8.0))) * Math.cos(5 * Math.max(0, t - L(21, 8.0)));
    thermometer(N[3][0], N[3][1] + 90, 1.05, lev, 'ft', popK(3));
    // a gold bead running round the loop once it is closed
    if (t > L(21, 10.6)) { const q = frac((t - L(21, 10.6)) / 3.2), P = [[N[0][0] + 150, N[0][1]], [N[1][0] - 150, N[1][1]], [N[1][0], N[1][1] + 140], [N[2][0], N[2][1] - 150], [N[2][0] - 170, N[2][1]], [N[3][0] + 110, N[3][1]], [N[3][0], N[3][1] - 200], [N[0][0], N[0][1] + 110]];
      const s = q * 4, j = Math.floor(s), f = s - j, a = P[j * 2], b = P[j * 2 + 1], p = [lerp(a[0], b[0], ease(f)), lerp(a[1], b[1], ease(f))]; glow(p[0], p[1], 70, '#FFC766', .9); boilSeed('bead'); paint(ellPts(p[0], p[1], 16, 16, 12), { wash: Z.atp, ink: PAL.ink, sw: 1 }); }
    camEnd();
    const look = [[-.2, -.9], [.6, -.9], [.6, .4], [-.2, .4]];
    const o = K.act(t, [[0, 'calm', { lookX: .5 }], [L(21, 1.2), 'idea', { lookX: look[0][0], lookY: look[0][1] }], [L(21, 3.2), 'calm', { lookX: look[1][0], lookY: look[1][1] }],
      [L(21, 5.4), 'calm', { lookX: look[2][0], lookY: look[2][1] }], [L(21, 8.0), 'wow', { lookX: look[3][0], lookY: look[3][1] }], [L(21, 10.4), 'smug'], [L(21, 12.6), 'happy']]);
    swimT(270, 930, 32, t, { ...o, talk: false }, 'pf');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E4D4AE', Z.board]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E9B47F', Z.kitchen]);
  }

  // G · the kitchen again: fooled again, on purpose
  function shotG(t, lt, dur) {
    K.setT(t);
    camBegin(900 + 8 * wob(t, .05), 650 + 5 * wob(t, .04), 1.22);
    kitchen(t, .8);
    bowl(500, 830, t, 'bwg', 3);
    glass(1290, 830, t, 'glg', 1);
    const x = 880, y = 830, u = 38;
    let o = K.act(t, [[0, 'smug'], [L(22, .5), 'happy'], [L(22, 2.2), 'wow', { take: 1.2 }], [L(22, 3.2), 'calm', { lookX: -.3, lookY: .6 }], [L(22, 4.7), 'shy', { emote: null }],
      [L(22, 6.6), 'wink', { lookX: 0 }], [282.4, 'happy'], [282.9, 'calm', { lookX: .4, lookY: .5 }], [283.1, 'wow', { take: 2, emote: null }], [285.9, 'dizzy'], [286.6, 'wink']]);
    const fire1 = on(t, L(22, 2.3), L(22, 3.4), .1, .25), fire2 = on(t, 283.4, 285.0, .05, .3);
    const hot = Math.max(on(t, L(22, 2.2), L(22, 3.8), .15, .5), on(t, 283.1, 286.4, .1, 1));
    const bite1 = seg(t, L(22, .6), L(22, .8)), bite2 = seg(t, 282.4, 282.6);
    let holdAt = kf(t, [[L(22, 0), [2.3, -2.9]], [L(22, .4), [.7, -2.6]], [L(22, .9), [2.3, -2.6]], [L(22, 4.6), [2.3, -2.6]], [282.0, [2.3, -2.6]], [282.3, [.7, -2.6]], [282.8, [2.4, -2.4]]]);
    o = { ...o, armsFront: true, armF: { at: holdAt } };
    if (t > L(22, 4.7) && t < L(22, 6.5)) o = { ...o, armB: { at: [-1.0, -1.6] } };
    // the flight: blasted backwards out of frame, then falling back in
    let px = x, dyF = 0;
    const fly = seg(t, 283.5, 284.3), fall = seg(t, 285.3, 285.9);
    if (t > 283.5 && t < 285.3) { const p = arcPt([x, y], [-260, 300], 260, easeIn(fly)); px = p[0]; dyF = (p[1] - y) / u; o = { ...o, rot: -.4 * fly }; }
    if (t >= 285.3) { dyF = -lerp(16, 0, easeIn(fall)); }
    const land = jump(t, 285.9, 285.9, 0); if (t > 285.9) { o = { ...o, sq: (o.sq || 0) + land.sq }; }
    o = { ...o, dy: (o.dy || 0) + dyF };
    if (t < 285.3 || t > 285.32) pipT(px, y, u, { ...o, key: 'pg', noShadow: t > 283.5 && t < 285.9 }, hot, 0);
    const hp = K.hand(px, y, u, holdAt, { dy: o.dy });
    if (t < 283.5) chili(hp[0], hp[1] - 6, 1.05, -.35, t > 282.4 ? .7 + .3 * bite2 : .4 * bite1, 'gch');
    const m = mouthOf(px, y, u, o);
    flames(m[0] + 8, m[1], 1, 330, t, fire1, 'g1');
    flames(m[0] + 8, m[1], 1, 520, t, fire2, 'g2', .1);
    if (t > L(22, 3.3) && t < L(22, 4.4)) steam(m[0] + 60, m[1], u, t, 1 - seg(t, L(22, 3.3), L(22, 4.4)), 'puff', 4);
    if (t > 283.5 && t < 284.6) { boilSeed('trail'); for (let i = 0; i < 6; i++) { const q = seg(t, 283.5 + i * .05, 284.6); paint(ellPts(lerp(x, px, i / 6), y - 3 * u + lerp(0, (dyF * u), i / 6), 30 * (1 - q), 26 * (1 - q), 12), { fill: '#BFB2A8', fillOp: 140 * (1 - q), ink: null }); } }
    if (t > 285.9) { K.burst(x, y - 10, 120, seg(t, 285.9, 286.4), PAL.ink, 'land'); steam(x, y - 6 * u, u, t, on(t, 285.9, 289, .1, 1), 'smoke', 4); }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E9B47F', Z.kitchen]);
    const close = seg(t, 287.0, 289.4);
    if (close > 0) iris(...toScreen(x, y - 3 * u, LAST_CAM), kf(close, [[0, 1900], [.55, 300], [.8, 270], [1, 0]], easeIn));
  }

  // the cover: Pip mid-blast with a chili, hot on one side, frost on the other
  LOOPS.cover = t => {
    K.setT(t);
    K.wash(Z.kitchen, t, { key: 'cv', blob: Z.kitchenBlob });
    boilSeed('cvcold'); paint(rectPts(1120, -100, 1000, 1300), { wash: '#CFE3F2', ink: null });
    for (let i = 0; i < 6; i++) paint(rectPts(1000 + i * 22, -100, 24, 1300), { wash: mixCol(Z.kitchen, '#CFE3F2', (i + 1) / 7), ink: null });
    for (let i = 0; i < 10; i++) snowflake(1250 + hash(i + 700) * 600, 80 + hash(i + 701) * 800, 20 + 22 * hash(i), i, Z.coldDk, 'cvs' + i);
    heatLines(420, 900, 700, -800, t, 1, 'cvh', 7, Z.hot);
    const o = { ...pipFeel('wow', .2), blink: 0, emote: null, armsFront: true, armF: { at: [2.4, -2.4] }, armB: [1.2, 1.8] };
    pipT(800, 900, 80, { ...o, key: 'cvp', weight: 1.4 }, .65, 0);
    const m = mouthOf(800, 900, 80, o); flames(m[0] + 14, m[1], 1, 620, t, 1, 'cvf');
    const hp = K.hand(800, 900, 80, [2.4, -2.4]); chili(hp[0], hp[1] - 8, 2.1, -.35, .5, 'cvc');
    thermometer(1640, 860, 2.2, .95, 'cvt');
    mint(1380, 960, 2.4, 'cvm', .6);
  };
  LOOPS.cover.len = 1;

  shots([[0, shotA], [25.6, shotB1], [L(4, 4.3), shotB2], [101.4, shotC], [127.9, shotD1], [L(14, 9.3), shotD2a], [L(16, .3), shotD2b], [212.0, shotD3], [217.6, shotE], [256.6, shotF], [272.4, shotG]]);
})();

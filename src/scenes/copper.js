// copper.js: "Pip讲身体里的铜", 802 s. What a pinch of copper (four or five grains of rice) does in the body: the
// Cu⁺/Cu²⁺ electron trick, why life took it up only after oxygen, cytochrome c oxidase (CuA, heme a, heme a3 + CuB)
// handing O₂ its four electrons at once, cyanide, the side jobs (SOD1, ceruloplasmin, lysyl oxidase, tyrosinase and
// dopamine β-hydroxylase), why loose copper is a poison and how chaperones pass it hand to hand (CTR1, ATOX1/CCS,
// ATP7A/ATP7B, metallothionein), Menkes and Wilson disease, copper as a weapon, cuproptosis, food and zinc.
// Pip is a genie who lives in a copper oil lamp and works on the molecules with its own hands, Tom-and-Jerry style.
// See STORYBOARD_COPPER.md. Props from mrna_kit.js (MK); a few helpers are copied from thermo.js, meiosis.js and
// mrna.js (each says where it came from). Every time is tied to a voice line: L(i, d) = line i's start + d seconds.
(() => {
  const K = MK;
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const Z = {
    cu: '#D27A3E', cuDk: '#9A4F22', cuLt: '#F2B27A', cu2: '#3E8ED0', cu2Dk: '#245F99', cu2Lt: '#9BC9F0',
    el: '#FFE7A0', elDk: '#C99A2E', o2: '#8CC8EE', o2Dk: '#4F8FC0', water: '#6FB2E3', h2o2: '#B79AD6', h2o2Dk: '#8668AE',
    rad: '#D2427E', radDk: '#8E1F52', fe: '#B8452F', feDk: '#7E2A1C', zn: '#A9B2BC', znDk: '#6F7984',
    chap: '#A88BD0', chapDk: '#7A5CA8', sulf: '#E8C547', atp: '#F2C14A', prot: '#E27A92', cn: '#4B4F63', cnN: '#7B5CA8',
    // worlds
    wall: '#F3CFA6', wallBlob: '#FAE3C8', wood: '#B9824F', woodDk: '#94633A', rice: '#FBF6E9', riceDk: '#D9CDB0',
    tissue: '#F9E3CF', tissueBlob: '#FDF0E2', cellA: '#F2B49A', cellADk: '#DE8E74',
    board: '#F5EEDD', boardBlob: '#FBF6EA', verd: '#8CC7B5', verdBlob: '#B8DFD2', verdDk: '#4E9A86',
    mito: '#C8835A', mitoDk: '#8C5234', ims: '#F7E2CF', matrix: '#EFB98F', matrixDk: '#D99A6A',
    smoke: '#B9A0C8', smokeLt: '#E4D8EC'
  };
  const SOOT = { pip: '#4C4249', pipDk: '#2F282D', belly: '#6E6168' }, BLUE = { pip: '#5E86C4', pipDk: '#3D5F98', belly: '#D2E1F4' };
  const BASE = { pip: PIPC.pip, pipDk: PIPC.pipDk, belly: PIPC.belly };
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));
  const pulseK = (t, a, len = .7) => t > a && t < a + len ? Math.sin(seg(t, a, a + len) * Math.PI) : 0;
  const on = (t, a, b, fi = .3, fo = .3) => Math.min(ease(seg(t, a, a + fi)), 1 - ease(seg(t, b - fo, b)));   // 0→1 at a, 1→0 at b
  const popK = k => k <= 0 ? 0 : backOut(clamp(k));                 // a pop-in scale; callers skip drawing while it is < .05
  const rotPts = (P, x, y, a, s = 1) => P.map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s]);

  // ---------- Pip, recoloured (from thermo.js: tinted/pipT), and Pip the genie ----------
  function tinted(cols, fn) { const old = {}; for (const c in cols) old[c] = PIPC[c]; Object.assign(PIPC, cols); try { fn(); } finally { Object.assign(PIPC, old); } }
  function pipT(x, y, u, o, tint = null, k = 0) {
    if (!tint || k <= .01) return pip(x, y, u, o);
    const cols = {}; for (const c in BASE) cols[c] = mixCol(BASE[c], tint[c], clamp(k));
    tinted(cols, () => pip(x, y, u, o));
  }
  // smoke: soft puffs (drawn after Pip to hide the feet, or anywhere)
  function puff(x, y, r, k, key, col = Z.smokeLt) {
    if (k <= .02 || r < 2) return; boilSeed('pf' + key);
    for (let i = 0; i < 4; i++) { const a = i * 1.7 + .4, d = r * .45 * hash(i + 3); paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d * .6, r * (.55 + .3 * hash(i)) * k, r * (.45 + .25 * hash(i + 1)) * k, 14, 1), { wash: col, ink: PAL.ink, sw: .7 }); }
  }
  // Pip floating on a genie's smoke tail. src: the tail's far end (the lamp spout) or null for a short wisp.
  // o: pip options (dy/sq/flip...). Returns the bobbed ground point [x, y].
  function genie(x, y, u, t, o, key, src = null, tint = null, tk = 0) {
    const bob = (o.still ? 0 : 7) * Math.sin(t * 2.1 + (o.seed || 0)), yy = y + bob, d = o.flip ? -1 : 1;
    const end = src || [x - d * 1.4 * u + .3 * u * wob(t, .7), y + 2.6 * u];
    boilSeed('gt' + key);
    const P = []; for (let i = 0; i <= 8; i++) { const q = i / 8, s = Math.sin(q * Math.PI);
      P.push([lerp(x, end[0], q) + s * u * .9 * Math.sin(t * 2.4 + q * 5) * (src ? .6 : 1), lerp(yy - .2 * u, end[1], q) + s * u * (src ? -.8 : .3)]); }
    paint(ribbon(P, 1.6 * u, .25 * u), { wash: Z.smoke, ink: PAL.ink, sw: .8, curv: .4 });
    pipT(x, yy, u, { walk: t * 2.2, rot: (o.rot || 0) + .03 * Math.sin(t * 1.05), ...o, noShadow: true, key }, tint, tk);
    puff(x, yy + .15 * u, (o.puff ?? .95) * u, 1, key + 'f');
    return [x, yy];
  }

  // where Pip's hand is, in world space: the same arm maths as pip.js (shoulder root, [angle, len] or {at}, the 3.6u
  // reach limit, then flip, squash, lean and hop). which = 'F' (front arm) or 'B' (back arm).
  function handPt(x, y, u, o, which = 'F') {
    const side = which === 'F' ? 1 : -1, spec = which === 'F' ? o.armF : o.armB, front = !!o.armsFront;
    const S = front ? [side * 1.62 * u, -2.35 * u] : [side * 1.35 * u, -2.5 * u];
    let T;
    if (spec && spec.to) T = spec.to; else if (spec && !Array.isArray(spec)) T = [spec.at[0] * u, spec.at[1] * u];
    else { const [a, l] = spec || [-1.0, 1.6]; T = [S[0] + side * Math.cos(a) * l * u, S[1] - Math.sin(a) * l * u]; }
    const dd = Math.hypot(T[0] - S[0], T[1] - S[1]), mx = 3.6 * u; if (dd > mx) T = [S[0] + (T[0] - S[0]) * mx / dd, S[1] + (T[1] - S[1]) * mx / dd];
    const dir = o.flip ? -1 : 1, sq = o.sq || 0, r = o.rot || 0, lx = T[0] * dir * (1 + sq), ly = T[1] * (1 - sq);
    return [x + lx * Math.cos(r) - ly * Math.sin(r), y + (o.dy || 0) * u + lx * Math.sin(r) + ly * Math.cos(r)];
  }

  // ---------- molecules and atoms (the colour code is fixed for the whole film) ----------
  // a copper ion: s2 = 0 → Cu⁺ (copper orange, one +), 1 → Cu²⁺ (blue, two +). glowK: a warm halo (dark grounds).
  function cu(x, y, r, s2, key, glowK = 0, plus = 1) {
    if (r < 2) return;
    const k = clamp(s2);
    if (glowK > 0) glow(x, y, r * 3.2, k > .5 ? '#7FC4FF' : '#FFB070', glowK);
    boilSeed('cu' + key);
    paint(ellPts(x, y, r, r, 18), r >= 28 ? { wash: mixCol(Z.cu, Z.cu2, k), fill: mixCol(Z.cuDk, Z.cu2Dk, k), fillOp: 55, tex: .4, ink: PAL.ink, sw: clamp(r / 22, .6, 1.4) } : { wash: mixCol(Z.cu, Z.cu2, k), ink: PAL.ink, sw: clamp(r / 22, .6, 1.4) });
    paint(ellPts(x - r * .35, y - r * .38, r * .28, r * .18, 10, 0, -.6), { wash: mixCol(Z.cuLt, Z.cu2Lt, k), ink: null });
    if (plus > 0 && r > 9) {
      const s = r * .62, two = backOut(seg(k, .35, .8));
      if (two > .05) { K.charge('+', x - s * .55 * two, y + r * .12, s, plus, PAL.ink, key + 'p1'); K.charge('+', x + s * .55 * two, y + r * .12, s * two, plus, PAL.ink, key + 'p2'); }
      else K.charge('+', x, y + r * .12, s, plus, PAL.ink, key + 'p1');
    }
  }
  // an electron: a cream-yellow spark with a − disc
  function el(x, y, r, key, glowK = 0) {
    if (r < 2) return;
    if (glowK > 0) glow(x, y, r * 3, '#FFE08A', glowK);
    boilSeed('el' + key);
    paint(starPts(x, y, r * 1.5, .42, 4, T * 2 % TAU), { wash: Z.el, ink: Z.elDk, sw: .6 });
    if (r > 6) K.charge('-', x, y, r * 1.05, 1, Z.elDk, key + 'm');
  }
  function o2(x, y, s, ang, key, col = Z.o2) {                     // two joined beads
    if (s < .05) return; boilSeed('o2' + key);
    const dx = Math.cos(ang) * 13 * s, dy = Math.sin(ang) * 13 * s;
    for (const sd of [-1, 1]) paint(ellPts(x + sd * dx, y + sd * dy, 17 * s, 17 * s, 14), { wash: col, ink: PAL.ink, sw: .9 });
  }
  function water(x, y, s, key) {                                   // a droplet, tip up
    if (s < .05) return; boilSeed('wa' + key);
    const P = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, w = Math.sin(a / 2); P.push([x + Math.sin(a) * 15 * s * (.35 + .65 * w), y - Math.cos(a) * 20 * s + 9 * s * w]); }
    paint(P, { wash: Z.water, ink: PAL.ink, sw: .9, curv: .4 });
    paint(ellPts(x - 5 * s, y + 2 * s, 3.5 * s, 5 * s, 8), { wash: PAL.cream, ink: null });
  }
  function h2o2(x, y, s, ang, key) {                               // a lilac dumbbell
    if (s < .05) return; boilSeed('hp' + key);
    const dx = Math.cos(ang) * 20 * s, dy = Math.sin(ang) * 20 * s;
    paint(ribbon([[x - dx, y - dy], [x + dx, y + dy]], 9 * s, 9 * s), { wash: Z.h2o2Dk, ink: PAL.ink, sw: .7 });
    for (const sd of [-1, 1]) paint(ellPts(x + sd * dx, y + sd * dy, 14 * s, 14 * s, 12), { wash: Z.h2o2, ink: PAL.ink, sw: .9 });
  }
  function radical(x, y, r, t, key, big = 0) {                      // a spiky magenta star with the unpaired-electron dot
    if (r < 2) return; boilSeed('rd' + key);
    const n = big ? 11 : 8, rot = t * (big ? 3 : 2) + hash(key.length);
    paint(starPts(x, y, r, .52 + .06 * Math.sin(t * 9), n, rot), r > 40 ? { wash: mixCol(Z.rad, Z.radDk, big * .5), fill: Z.radDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: clamp(r / 26, .6, 1.3) } : { wash: mixCol(Z.rad, Z.radDk, big * .5), ink: PAL.ink, sw: clamp(r / 26, .6, 1.3) });
    paint(ellPts(x + r * .1, y - r * .1, r * .14, r * .14, 8), { wash: PAL.ink, ink: null });
  }
  function feIon(x, y, r, n, key) {                                // iron: rust bead with n + discs (2 or 3)
    if (r < 2) return; boilSeed('fe' + key);
    paint(ellPts(x, y, r, r, 16), { wash: Z.fe, ink: PAL.ink, sw: clamp(r / 22, .6, 1.3) });
    paint(ellPts(x - r * .35, y - r * .38, r * .25, r * .16, 10, 0, -.6), { wash: '#E08A6E', ink: null });
    const s = r * .5; for (let i = 0; i < n; i++) K.charge('+', x + (i - (n - 1) / 2) * s * 1.05, y + r * .15, s, 1, PAL.ink, key + 'c' + i);
  }
  function stars(x, y, r, t, key, n = 3) {                         // dizzy stars circling a head
    boilSeed('dz' + key);
    for (let i = 0; i < n; i++) { const a = t * 4 + i / n * TAU; paint(starPts(x + Math.cos(a) * r, y + Math.sin(a) * r * .35, r * .22, .45, 5, t * 3), { wash: Z.atp, ink: PAL.ink, sw: .7 }); }
  }
  function grain(x, y, s, ang, key) {                              // a grain of rice
    if (s < .05) return; boilSeed('gr' + key);
    paint(ellPts(x, y, 15 * s, 7 * s, 14, 0, ang), { wash: Z.rice, ink: PAL.ink, sw: .8 });
  }
  // a mitochondrion (after thermo.js mito): double membrane and cristae; cuK lights copper glints on it
  function mito(x, y, s, ang, key, o = {}) {
    boilSeed('mt' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    if (o.glowK > .02) glow(0, 0, 130, '#FF9A40', o.glowK);
    const grey = o.grey || 0, col = mixCol(Z.mito, '#9C9497', grey), dk = mixCol(Z.mitoDk, '#6E676B', grey);
    paint(ellPts(0, 0, 62, 30, 24, 1), { wash: col, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(4, 6, 50, 19, 18), { wash: mixCol(col, dk, .45), ink: null });
    const P = []; for (let j = 0; j <= 10; j++) P.push([-48 + j * 9.6, (j % 2 ? -1 : 1) * 17]);
    inkLine(P, 1.3, mixCol(dk, PAL.cream, .3), 'ink', .2);
    pop();
    if (o.cuK > .02) for (let i = 0; i < 3; i++) { const a = ang + (i - 1) * .9, p = [x + Math.cos(a) * 34 * s, y + Math.sin(a) * 12 * s]; cu(p[0], p[1], 9 * s * popK(o.cuK), 0, key + 'g' + i, .5 * o.cuK, 0); }
  }

  // ---------- props ----------
  // the copper oil lamp, Pip's home. (x, y) = the base; returns the spout tip. rattle: shake 0..1; lid: 0 on, 1 popped.
  function lamp(x, y, s, t, key, o = {}) {
    const sh = (o.rattle || 0) * 6 * s, jx = sh * Math.sin(t * 70), rot = (o.rattle || 0) * .06 * Math.sin(t * 55);
    boilSeed('lp' + key);
    push(); translate(x + jx, y); rotate(rot); scale(s);
    paint(ellPts(0, -6, 52, 12, 18), { wash: Z.cuDk, ink: PAL.ink, sw: 1.1 });                                                     // foot
    paint(ribbon([[-138, -66], [-176, -102], [-180, -60], [-130, -40]], 13, 13), { wash: Z.cu, fill: Z.cuDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1, curv: .5 });   // handle
    paint(ribbon([[96, -62], [168, -78], [214, -118], [236, -132]], 34, 14), { wash: Z.cu, fill: Z.cuDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1, curv: .4 });   // spout
    paint(ellPts(0, -64, 148, 56, 30), { wash: Z.cu, fill: Z.cuDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.3 });                   // body
    paint(ellPts(-56, -86, 46, 13, 14, 0, -.12), { wash: Z.cuLt, ink: null });
    inkLine([[-120, -48], [-40, -36], [60, -38], [126, -52]], 1.1, Z.cuDk, 'ink', .5);
    const lk = clamp(o.lid || 0), lx = lerp(0, -300, lk), ly = lerp(-120, -20, lk) - 330 * Math.sin(lk * Math.PI), lr = lk * (TAU + .25);
    push(); translate(lx, ly); rotate(lr);
    paint(ellPts(0, 0, 46, 20, 18), { wash: Z.cu, fill: Z.cuDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(0, -24, 12, 14, 12), { wash: Z.cuLt, ink: PAL.ink, sw: 1 });
    pop();
    pop();
    return [x + jx + 236 * s, y - 132 * s];
  }
  // a balance: pivot at (x, y), tilt > 0 = left pan down. drawL/drawR(px, py) paint on each pan (py = pan floor).
  function balance(x, y, s, tilt, key, drawL, drawR) {
    auditBox('balance', key, x - 380 * s, y - 40 * s, x + 380 * s, y + 420 * s);
    boilSeed('bal' + key);
    const col = '#9BA9B8', dk = '#6C7C8E';
    paint(rectPts(x - 110 * s, y + 380 * s, 220 * s, 30 * s), { wash: col, ink: PAL.ink, sw: 1.1 });
    paint(ribbon([[x, y + 384 * s], [x, y]], 22 * s, 16 * s), { wash: col, ink: PAL.ink, sw: 1.1 });
    const c = Math.cos(tilt), sn = Math.sin(tilt), A = [x - 270 * s * c, y + 270 * s * sn], B = [x + 270 * s * c, y - 270 * s * sn];
    paint(ribbon([A, [x, y], B], 14 * s, 14 * s), { wash: col, ink: PAL.ink, sw: 1.1, curv: 0 });
    paint(ellPts(x, y, 20 * s, 20 * s, 14), { wash: Z.atp, ink: PAL.ink, sw: 1 });
    for (const [E, f, side] of [[A, drawL, 'l'], [B, drawR, 'r']]) {
      const py = E[1] + 190 * s;
      for (const sd of [-1, 0, 1]) inkLine([[E[0], E[1]], [E[0] + sd * 92 * s, py - 6 * s]], .9, PAL.ink, 'inkfine', 0);
      boilSeed('pan' + key + side);
      paint([...Array(13)].map((_, i) => { const a = i / 12 * Math.PI; return [E[0] - Math.cos(a) * 100 * s, py - 6 * s + Math.sin(a) * 34 * s]; }), { wash: col, ink: PAL.ink, sw: 1.1 });
      if (f) f(E[0], py - 4 * s);
    }
    return [A, B];
  }
  // a little mound of copper dust (k: how much of it has landed)
  function dust(x, y, s, k, key, t) {
    for (let i = 0; i < 16; i++) {
      const q = popK(seg(k, i / 16 * .8, i / 16 * .8 + .2)); if (q < .05) continue;
      const a = hash(i + 40) * 2 - 1, h = (1 - a * a) * 24 * s * hash(i + 41);
      boilSeed('du' + key + i);
      paint(ellPts(x + a * 46 * s, y - h - 4 * s, 6.5 * s * q, 5.5 * s * q, 8), { wash: i % 3 ? Z.cu : Z.cuLt, ink: PAL.ink, sw: .5 });
    }
    if (k > .5) for (let i = 0; i < 3; i++) { const ph = frac(t * .6 + i / 3); K.sparkle(x + (hash(i + 7) - .5) * 70 * s, y - 20 * s - 18 * s * hash(i + 8), 12 * s, ph, PAL.cream); }
  }
  function bowl(x, y, s, key, n = 12) {                           // a bowl of rice
    boilSeed('bw' + key);
    for (let i = 0; i < n; i++) grain(x + (hash(i + 60) - .5) * 150 * s, y - 52 * s - 26 * s * hash(i + 61) * (1 - Math.abs(hash(i + 60) - .5)), s * 1.1, hash(i + 62) * 3, key + 'm' + i);
    paint([...Array(15)].map((_, i) => { const a = i / 14 * Math.PI; return [x - Math.cos(a) * 110 * s, y - 50 * s + Math.sin(a) * 66 * s]; }), { wash: '#E9EEF2', fill: '#B9C7D3', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.2 });
    inkLine([[x - 96 * s, y - 30 * s], [x + 96 * s, y - 30 * s]], 3 * s, '#6E9BD3', 'ink', .3);
  }
  function mitts(hx, hy, s, key, flip = false) {                   // an oven mitt over a hand point
    boilSeed('mi' + key);
    const d = flip ? -1 : 1;
    paint(ellPts(hx, hy, 15 * s, 18 * s, 14), { wash: '#E46A5C', fill: '#B84838', fillOp: 50, tex: .4, ink: PAL.ink, sw: .9 });
    paint(ellPts(hx + d * 11 * s, hy - 10 * s, 6 * s, 9 * s, 10, 0, d * .5), { wash: '#E46A5C', ink: PAL.ink, sw: .8 });
    inkLine([[hx - 12 * s, hy + 12 * s], [hx + 12 * s, hy + 12 * s]], 2 * s, PAL.cream, 'ink', 0);
  }

  // ---------- backgrounds ----------
  function table(t, key, gold = 0) {
    K.wash(mixCol(Z.wall, '#F6D68C', gold), t, { key: key + 'w', blob: Z.wallBlob, n: 5 });
    boilSeed(key + 'tb'); paint(rectPts(-400, 820, W + 800, 600), { wash: mixCol(Z.wood, '#C99A55', gold), ink: null });
    inkLine([[-400, 820], [W + 400, 820]], 1.4, Z.woodDk, 'ink', 0);
    for (let i = 0; i < 4; i++) inkLine([[-200 + i * 600, 900 + 60 * hash(i)], [300 + i * 600, 910 + 50 * hash(i + 1)]], .8, Z.woodDk, 'inkfine', .5);
  }
  function board(t, key, col = Z.board) { K.wash(col, t, { key, blob: Z.boardBlob, n: 5 }); K.motes(t, 10, mixCol(col, PAL.ink, .12), { key: key + 'm' }); }

  // ================================ A1 · the lamp and the balance (0 – L2) ================================
  const LAMP = [430, 800], PIV = [1150, 470];
  function scaleTilt(t) {                                          // copper lands (left down), then four grains bring it level
    let tl = .19 * ease(seg(t, L(1, 3.2), L(1, 3.9))) + .05 * spring(t, L(1, 3.6), 5, 14);
    for (let i = 0; i < 4; i++) { const a = L(1, 6.0 + i * .42); tl -= .0475 * ease(seg(t, a, a + .25)); tl += .025 * spring(t, a + .1, 6, 16); }
    return tl;
  }
  function riceFlight(t, i, R) {                                   // grain i hops from the bowl onto the right pan
    const a = L(1, 5.7 + i * .42), k = seg(t, a, a + .4), src = [1660 + (i - 1.5) * 26, 742], dst = [R[0] - 36 + i * 24, R[1] - 8 - (i % 2) * 8];
    return k <= 0 ? null : k >= 1 ? dst : arcPt(src, dst, 150, easeOut(k));
  }
  function shotA1(t, lt, dur) {
    K.setT(t);
    const push_ = seg(t, L(2, -1.1), L(2, -.05));
    const c = kf(t, [[0, [520, 700, 1.35]], [L(1, .9), [520, 700, 1.35]], [L(1, 2.6), [1030, 600, 1.1]]], ease);
    const cx = lerp(c[0], 890, easeIn(push_)), cy = lerp(c[1], 650, easeIn(push_)), z = lerp(c[2], 4.5, easeIn(push_));
    camBegin(cx + 6 * wob(t, .05), cy + 4 * wob(t, .04), z);
    table(t, 'a1');
    bowl(1660, 812, 1, 'a1b');
    const tilt = scaleTilt(t);
    const pans = balance(PIV[0], PIV[1], .9, tilt, 'a1s',
      (px, py) => dust(px, py, 1, seg(t, L(1, 3.0), L(1, 4.0)), 'a1d', t),
      (px, py) => { for (let i = 0; i < 4; i++) { const p = riceFlight(t, i, [px, py]); if (p && t > L(1, 5.7 + i * .42) + .4) grain(p[0], p[1], 1.1, .2 + i * .7, 'a1r' + i); } });
    for (let i = 0; i < 4; i++) { const a = L(1, 5.7 + i * .42); if (t > a && t < a + .4) { const p = riceFlight(t, i, [pans[1][0], pans[1][1] + 190 * .9 - 4 * .9]); grain(p[0], p[1], 1.1, t * 9 + i, 'a1f' + i); } }
    // the lamp: rattles, the lid pops, smoke, Pip pours out of the spout
    const rat = on(t, L(1, -.2), L(1, 1.2), .1, .1), lidK = seg(t, L(1, 1.0), L(1, 1.8));
    const spout = lamp(LAMP[0], LAMP[1], 1, t, 'a1l', { rattle: rat, lid: lidK });
    for (let i = 0; i < 4; i++) { const a = L(1, 1.0 + i * .12), k = seg(t, a, a + 1.6); if (k > 0 && k < 1) puff(spout[0] + 20 + 60 * k * (i - 1.5), spout[1] - 30 - 160 * easeOut(k), 40 + 50 * k, 1 - k * k, 'a1p' + i); }
    const em = ease(seg(t, L(1, 1.2), L(1, 2.4)));                 // emergence 0..1
    if (em > .02) {
      const P0 = [spout[0] + 30, spout[1] - 40], P1 = [760, 560];
      let [x, y] = [lerp(P0[0], P1[0], em), lerp(P0[1], P1[1], em) - 90 * Math.sin(em * Math.PI)];
      const u = 31 * lerp(.25, 1, easeOut(em)), sprinkle = on(t, L(1, 2.8), L(1, 4.3), .2, .3), point = on(t, L(1, 5.5), L(1, 7.6), .2, .3);
      let o = K.act(t, [[0, 'smug', { armsFront: true, armF: { at: [-.9, -2.4] }, armB: { at: [.9, -2.3] } }],
        [L(1, 2.7), 'happy', { lookX: .7, lookY: .6 }], [L(1, 5.5), 'idea', { lookX: 1, lookY: .2 }], [L(1, 7.4), 'wow', { lookX: -.4, lookY: .9 }],
        [L(1, 8.7), 'smug', { armF: [.7, 2.6], armB: [.8, 2.4], lookX: 0 }], [L(1, 9.6), 'laugh']]);
      if (sprinkle > 0) o = { ...o, armF: [lerp(.6, -.35, sprinkle), 3.2] };
      if (point > 0) o = { ...o, armF: [lerp(.3, .05, point) + .08 * Math.sin(t * 12) * point, 3.4] };
      o.sq = (o.sq || 0) + .25 * (1 - em) * Math.sin(em * 9);
      genie(x, y, u, t, o, 'a1pip', em < 1 ? [spout[0], spout[1] + 8] : null);
      // copper dust trickles from Pip's hand onto the left pan
      const hand = handPt(x, y, u, o);
      for (let i = 0; i < 12; i++) { const a = L(1, 2.9 + i * .1), k = seg(t, a, a + .5); if (k > 0 && k < 1) { boilSeed('a1dr' + i); const p = [lerp(hand[0], pans[0][0] + (hash(i) - .5) * 60, k), lerp(hand[1], pans[0][1] + 150, easeIn(k))]; paint(ellPts(p[0], p[1], 5, 5, 8), { wash: Z.cu, ink: PAL.ink, sw: .5 }); } }
    }
    camEnd();
    if (lt < .8) iris(...toScreen(LAMP[0] + 60, LAMP[1] - 120, LAST_CAM), lerp(0, 1500, easeIn(lt / .8)), PAL.ink);
    flash(seg(t, L(2, -.45), L(2, -.05)), PAL.cream);
  }

  // ================================ A2 · the cell without its copper (L2 – L5) ================================
  const CELL = [1260, 560, 330];
  const MITOS = [[-150, -120, .2], [110, -150, -.5], [170, 90, .7], [-60, 160, -.2], [-200, 40, 1.4]].map(([dx, dy, a]) => [CELL[0] + dx, CELL[1] + dy, a]);
  const BOUNCE = [[1260, 560], [1500, 330], [1550, 690], [1280, 860], [1010, 690], [1090, 300], [1410, 250], [1580, 520]];   // the loose bead's pinball path
  function o2Path(t, i, t0) {                                       // O₂ drifting in and pinballing off dead mitochondria
    const a = t0 + i * .32, k = t - a; if (k < 0) return null;
    const m = MITOS[i % 5], src = [-60, 260 + 140 * (i % 4)], hit = [m[0] - 40, m[1]];
    if (k < 1.3) { const q = easeOut(k / 1.3); return [lerp(src[0], hit[0], q), lerp(src[1], hit[1], q) + 30 * Math.sin(q * 3 + i)]; }
    const q = k - 1.3, ang = 2.4 + i * 1.3, R = CELL[2] * .78;          // bounce away and rattle around inside
    const bx = hit[0] + Math.cos(ang) * 260 * Math.sin(Math.min(q, 3) * .9), by = hit[1] + Math.sin(ang) * 220 * Math.sin(Math.min(q, 3) * 1.3);
    const dx = bx - CELL[0], dy = by - CELL[1], d = Math.hypot(dx, dy);
    return d > R ? [CELL[0] + dx / d * R, CELL[1] + dy / d * R] : [bx, by];
  }
  function shotA2(t, lt, dur) {
    K.setT(t);
    const dive = seg(t, L(4, 6.6), L(5, -.9));
    camBegin(lerp(1000, CELL[0], easeIn(dive)) + 6 * wob(t, .05), lerp(560, CELL[1], easeIn(dive)) + 4 * wob(t, .04), lerp(1.0, 5, easeIn(dive)));
    K.wash(Z.tissue, t, { key: 'a2', blob: Z.tissueBlob });
    K.motes(t, 14, '#EBC9AE', { key: 'a2m' });
    // copper: in the mitochondria → plucked into Pip's fist (L2 +1.0) → given back (L2 +9.0)
    const pluck = seg(t, L(2, 1.0), L(2, 2.2)), back = seg(t, L(2, 9.0), L(2, 10.0)), cuIn = t < L(2, 1.0) ? 1 : t > L(2, 10.0) ? 1 : 0;
    const dead = clamp(ease(seg(t, L(2, 2.0), L(2, 3.0))) - ease(seg(t, L(2, 9.6), L(2, 10.6))));
    const loose = t > L(3, 3.0) && t < L(3, 7.7), mood = t < L(2, 5.8) ? 'calm' : t < L(2, 10.2) ? 'sleepy' : t < L(3, 3.0) ? 'happy' : t < L(3, 9.5) ? 'wow' : t < L(4, 6.0) ? 'sad' : 'calm';
    const cellCol = mixCol(Z.cellA, '#C9BFC0', dead * .7);
    K.cell(CELL[0], CELL[1], CELL[2], cellCol, mixCol(Z.cellADk, '#A39A9C', dead * .7), t, { key: 'a2c', mood, nucleus: true, fx: .25, sq: .06 * spring(t, L(2, 10.0), 4, 14) + .05 * ring(t, [L(3, 4.0), L(3, 5.2), L(3, 6.3)]),
      extras: () => {
        MITOS.forEach(([x, y, a], i) => mito(x, y, 1.05, a, 'a2m' + i, { grey: dead, cuK: cuIn, glowK: .35 * seg(t, L(2, 10.0), L(2, 10.8)) * (1 - seg(t, L(3, 0), L(3, 2))) }));
        for (let i = 0; i < 10; i++) {                             // O₂ drift in; dead mitochondria bounce them, live ones take them
          const p = o2Path(t, i, L(2, 3.0)); if (!p) continue;
          const alive = t > L(2, 10.0), fade = alive ? 1 - seg(t, L(2, 10.0) + i * .1, L(2, 10.6) + i * .1) : 1;
          if (fade > .05 && t < L(3, 2.5)) o2(p[0], p[1], .9 * fade, t * 2 + i, 'a2o' + i);
        }
      } });
    // the plucked glints flying to Pip's fist and back
    const P = [610, 700], u = 32;
    const fist = [P[0] + 2.4 * u, P[1] - 2.6 * u];
    if ((pluck > 0 && pluck < 1) || (back > 0 && back < 1)) MITOS.forEach(([x, y, a], i) => { for (let j = 0; j < 3; j++) {
      const q = pluck < 1 ? ease(seg(pluck, i * .08, .6 + i * .08)) : 1 - ease(seg(back, i * .08, .6 + i * .08)); const p = arcPt([x + (j - 1) * 20, y], fist, 90, q);
      cu(p[0], p[1], 7, 0, 'a2fl' + i + j, 0, 0); } });
    // the loose bead (L3): squirts out of a mitochondrion and pinballs
    let bead = null;
    if (loose) {
      const k = seg(t, L(3, 3.2), L(3, 7.6)) * (BOUNCE.length - 1), i = Math.min(BOUNCE.length - 2, Math.floor(k)), q = k - i;
      bead = [lerp(BOUNCE[i][0], BOUNCE[i + 1][0], q), lerp(BOUNCE[i][1], BOUNCE[i + 1][1], q)];
      for (let j = 1; j < BOUNCE.length - 1; j++) K.burst(BOUNCE[j][0], BOUNCE[j][1], 46, seg(t, L(3, 3.2) + j * 4.4 / 7, L(3, 3.2) + j * 4.4 / 7 + .35), Z.rad, 'a2bb' + j);
      for (let j = 0; j < 4; j++) { const p = [bead[0] - (j + 1) * 22 * Math.cos(t * 3), bead[1] - (j + 1) * 16 * Math.sin(t * 3)]; boilSeed('a2tr' + j); paint(ellPts(p[0], p[1], 9 - j * 2, 9 - j * 2, 8), { wash: Z.cuLt, washOp: 200 - j * 40, ink: null }); }
      cu(bead[0], bead[1], 22, 0, 'a2bead', .6);
    }
    // Pip: plucks (L2), feels guilty, gives back; dives at the bead (L3 +7.2), zapped; mitts (L4); dives into the cell
    const zap = seg(t, L(3, 7.55), L(3, 7.7)), soot = clamp(zap - seg(t, L(4, .2), L(4, 1.0)));
    const leap = seg(t, L(3, 6.9), L(3, 7.6)), lunge = ease(leap) * (1 - ease(seg(t, L(3, 9.0), L(4, .4))));
    const divePip = easeIn(dive);
    let x = lerp(P[0], 760, lunge) + 300 * divePip, y = P[1] - 140 * Math.sin(leap * Math.PI) * (t < L(3, 7.6) ? 1 : 0) - 20 * divePip;
    let o = K.act(t, [[0, 'smug', { lookX: 1 }], [L(2, .9), 'strain', { armF: [.2, 3.6], lookX: 1 }], [L(2, 2.3), 'smug', { armF: { at: [2.4, -2.6] }, armsFront: true, lookX: .6 }],
      [L(2, 6.6), 'wow', { armF: { at: [2.4, -2.6] }, lookX: 1 }], [L(2, 7.6), 'worried', { armF: { at: [2.4, -2.6] }, lookX: .3, lookY: .6, blush: 1 }],
      [L(2, 9.0), 'happy', { armF: [.4, 3.4] }], [L(3, 3.3), 'wow', { lookX: 1 }], [L(3, 6.8), 'angry', { armF: [.6, 3.6], armB: [.4, 3.4] }],
      [L(3, 7.6), 'wow', { armF: [.9, 3.2], armB: [.7, 3.0] }], [L(3, 8.4), 'dizzy'], [L(4, .3), 'worried', { armF: [.15, 3.6], armB: { at: [.9, -2.4] }, armsFront: true }],
      [L(4, 4.2), 'confused', { armF: [.15, 3.6], armB: { at: [.9, -2.4] }, armsFront: true }], [L(4, 6.2), 'excited', { lookX: 0, lookY: 0, armF: [.15, 3.6], armB: { at: [.9, -2.4] }, armsFront: true }]]);
    if (zap > 0 && t < L(4, .3)) o = { ...o, face: 'wow', blink: t > L(3, 8.3) ? (frac((t - L(3, 8.3)) / .55) < .15 ? 1 : 0) : 0, emote: null };
    const [gx, gy] = genie(x, y, u * (1 + .5 * divePip), t, { ...o, rot: (o.rot || 0) + .25 * Math.sin(leap * Math.PI) }, 'a2pip', null, SOOT, soot);
    if (soot > .3) { K.burst(gx, gy - 2.5 * u, 3.4 * u, zap < 1 ? zap : 0, Z.rad, 'a2zap'); for (let i = 0; i < 3; i++) { const ph = frac(t * .8 + i / 3); puff(gx + (i - 1) * 20, gy - 6.4 * u - ph * 80, 14 + 16 * ph, (1 - ph) * soot, 'a2sm' + i, '#8E8790'); } }
    if (t > L(4, .2)) {                                              // oven mitts, holding the bead at arm's length
      const uu = u * (1 + .5 * divePip), hF = handPt(gx, gy, uu, o);
      cu(hF[0] + 26, hF[1] - 6, 20, 0, 'a2held', .4);
      mitts(hF[0], hF[1], 1, 'a2mf');
    }
    camEnd();
    flash(Math.max(1 - seg(lt, 0, .5), seg(t, L(5, -1.3), L(5, -.9))), PAL.cream);
  }

  // ================================ A3 · 铁猛碰新木桶 (L5) ================================
  const ELEM = [['#B8452F', 2], ['#C9A0B4', 3], ['#5B4A3E', 4], [Z.zn, 5], ['#7F93A8', 6], [Z.cu, 7]];   // Fe Mn B Zn Mo Cu
  function bucket(x, y, s, key, o = {}) {                           // a new wooden bucket (the 木桶); (x, y) = bottom centre
    const rot = o.rot || 0; boilSeed('bk' + key);
    push(); translate(x, y); rotate(rot); scale(s);
    if (o.fill > .02) { const h = 120 * clamp(o.fill); paint([[-76, -10], [76, -10], [86, -10 - h], [-86, -10 - h]], { wash: o.fillCol || Z.cu, fill: Z.cuDk, fillOp: 50, tex: .4, ink: null }); }
    paint([[-70, 0], [70, 0], [92, -150], [-92, -150]], { wash: '#D9A066', fill: '#A87440', fillOp: 55, tex: .5, ink: PAL.ink, sw: 1.2 });
    for (let i = -2; i <= 2; i++) inkLine([[i * 26, -4], [i * 33, -146]], .8, '#8C5E33', 'inkfine', 0);
    for (const h of [-36, -112]) inkLine([[-76 - h * .12, h], [76 + h * .12, h]], 4, '#6F7984', 'ink', 0);
    paint(ellPts(0, -150, 92, 20, 22), { wash: o.fill > .95 ? (o.fillCol || Z.cu) : '#7A5230', ink: PAL.ink, sw: 1.1 });
    pop();
  }
  function shotA3(t, lt, dur) {
    K.setT(t);
    camBegin(880 + 8 * wob(t, .05), 590 + 5 * wob(t, .04), 1.12 + .012 * lt);
    board(t, 'a3');
    boilSeed('a3fl'); paint(rectPts(-300, 850, W + 600, 500), { wash: '#E9DCC2', fill: '#D8C6A4', fillOp: 50, tex: .5, ink: null });
    inkLine([[-300, 850], [W + 300, 850]], 1.2, '#B8A27E', 'ink', 0);
    // the iron ball rolls in fast (铁猛) and bonks the bucket (碰)
    const roll = seg(t, L(5, 2.7), L(5, 3.95)), bonk = L(5, 3.95), BX = 1180;
    const bx = t < bonk ? lerp(-120, BX - 185, easeIn(roll)) : BX - 185 - 90 * easeOut(seg(t, bonk, bonk + .6)), by = 850 - 70;
    boilSeed('a3ball'); push(); translate(bx, by); rotate((bx + 120) / 70); scale(70 / 58);
    paint(ellPts(0, 0, 58, 58, 22), { wash: '#8E5040', fill: '#5E3328', fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.3 });
    for (let i = 0; i < 4; i++) paint(ellPts(Math.cos(i * 1.6) * 30, Math.sin(i * 1.6) * 30, 9, 6, 8), { wash: '#C2703E', ink: null });
    pop();
    if (t < bonk && roll > .3) for (let i = 0; i < 3; i++) inkLine([[bx - 90 - i * 40, by - 30 + i * 30], [bx - 160 - i * 50, by - 30 + i * 30]], 2, PAL.ink, 'ink', 0);
    K.burst(BX - 90, by - 10, 70, seg(t, bonk, bonk + .4), PAL.ink, 'a3bk');
    const wobble = .14 * spring(t, bonk, 3.5, 13);
    bucket(BX, 850, 1.3, 'a3b', { rot: wobble });
    // the six trace elements fountain out of the bucket and line up (说的是几种微量元素), then the last one is copper
    const rowY = 300;
    ELEM.forEach(([col], i) => {
      const a = L(5, 5.4 + i * .22), k = seg(t, a, a + .7); if (k <= 0) return;
      const dst = [560 + i * 165, rowY], src = [BX, 700];
      const fly = i === 5 ? seg(t, L(5, 10.9), L(5, 11.5)) : 0, dim = i < 5 ? .6 * seg(t, L(5, 8.4), L(5, 9.0)) : 0;
      let p = arcPt(src, dst, 260, easeOut(k));
      if (fly > 0) p = arcPt(dst, [380, 560], 140, ease(fly));
      if (i === 5 && t > L(5, 11.5)) return;
      const r = 34 * (1 + .25 * pulseK(t, L(5, 8.6), .8) * (i === 5)) * (1 + .1 * pulse(t, 5));
      if (i === 5) cu(p[0], p[1], r, 0, 'a3cu', .3 * seg(t, L(5, 8.4), L(5, 9))); else { boilSeed('a3e' + i); paint(ellPts(p[0], p[1], r, r, 16), { wash: mixCol(col, Z.board, dim), fill: mixCol(col, PAL.ink, .2), fillOp: 50 * (1 - dim), tex: .4, ink: mixCol(PAL.ink, Z.board, dim), sw: 1.1 }); }
    });
    // Pip watches, laughs at the fountain, gets bonked by copper, catches it and holds it up
    const hitT = L(5, 11.5), u = 32;
    let o = K.act(t, [[0, 'calm', { lookX: -.8 }], [L(5, 3.0), 'wow', { lookX: 1 }], [L(5, 5.4), 'laugh', { lookY: -.8, lookX: .6 }],
      [L(5, 8.6), 'idea', { lookX: 1, lookY: -.9 }], [hitT, 'dizzy'], [hitT + 1.0, 'excited', { armF: [1.35, 3.4], lookY: -.7 }]]);
    const [gx, gy] = genie(380, 760, u, t, { ...o, sq: (o.sq || 0) + .3 * Math.max(0, spring(t, hitT, 6, 20)) }, 'a3pip');
    if (t > hitT && t < hitT + 1.0) stars(gx, gy - 6.6 * u, 50, t, 'a3dz');
    if (t > hitT + 1.0) { const h = handPt(gx, gy, u, o); cu(h[0], h[1] - 18, 30, 0, 'a3held', .3); K.sparkle(h[0] + 30, h[1] - 60, 26, frac((t - hitT) * .9), PAL.cream); }
    camEnd();
    flash(1 - seg(lt, 0, .5), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [Z.verdDk, Z.verd]);
  }

  // ================================ B1 · one electron (L6 – L8) ================================
  function bell(x, y, s, rot, patina, key) {                        // an old copper bell hanging from (x, y); patina 0..1 creeps over it
    boilSeed('bl' + key);
    inkLine([[x, y - 260 * s], [x, y]], 2.2, PAL.ink, 'ink', 0);
    push(); translate(x, y); rotate(rot); scale(s);
    const P = [[-26, 0], [26, 0], [44, 40], [60, 150], [96, 196], [-96, 196], [-60, 150], [-44, 40]];
    paint(P, { wash: Z.cu, fill: Z.cuDk, fillOp: 55, tex: .5, ink: PAL.ink, sw: 1.3, curv: .35 });
    paint(ellPts(-30, 90, 14, 52, 12, 0, .1), { wash: Z.cuLt, ink: null });
    for (let i = 0; i < 9; i++) {                                   // verdigris patches, spreading from the lip upward
      const q = popK(seg(patina, i / 9 * .7, i / 9 * .7 + .3)); if (q < .05) continue;
      const px = (hash(i + 20) - .5) * 130 * (1 - .4 * hash(i + 22)), py = 190 - 170 * hash(i + 21) * (i / 9);
      paint(ellPts(px, py, 26 * q * (.6 + .5 * hash(i + 23)), 14 * q, 12, 1, hash(i) * 3), { wash: '#5FB59C', ink: null });
    }
    paint(ellPts(0, 200, 96, 14, 18), { wash: Z.cuDk, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(0, 214, 16, 16, 12), { wash: Z.cuDk, ink: PAL.ink, sw: 1 });   // clapper
    pop();
  }
  function beaker(x, y, s, key, liq = 1, n = 4, t = 0) {            // a glass beaker of blue copper-sulfate solution; (x, y) = bottom centre
    boilSeed('bk' + key);
    const w = 120 * s, h = 230 * s, lv = h * .62 * liq;
    if (liq > .02) paint([[x - w + 6, y - 4], [x + w - 6, y - 4], [x + w - 6, y - lv], [x - w + 6, y - lv]], { wash: '#5FA6DE', fill: Z.cu2, fillOp: 60, tex: .4, ink: null });
    for (let i = 0; i < n * liq; i++) cu(x + (hash(i + 70) - .5) * w * 1.4, y - 30 * s - (lv - 60 * s) * hash(i + 71) + 6 * wob(t, .4, i), 15 * s, 1, key + 'i' + i, 0);
    inkLine([[x - w, y - h], [x - w, y], [x + w, y], [x + w, y - h], [x + w + 14 * s, y - h - 12 * s]], 1.5, PAL.ink, 'ink', .05);
    inkLine([[x - w * .7, y - h * .9], [x - w * .7, y - h * .25]], 3, PAL.cream, 'ink', 0);
  }
  function shotB1(t, lt, dur) {
    K.setT(t);
    const side = ease(seg(t, L(7, -.2), L(7, .6)));                  // L7: the bead moves up and aside for the bell
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0 + .02 * seg(t, L(6, 0), L(7, 0)));
    K.wash(Z.verd, t, { key: 'b1', blob: Z.verdBlob });
    K.motes(t, 14, mixCol(Z.verd, Z.verdDk, .5), { key: 'b1m' });
    // the hero bead: pop in, a quick preview flicker, then Pip yanks an electron (交出) and flicks it back (收回)
    const yank = L(6, 7.2), give = L(6, 10.1);
    let s2 = .5 - .5 * Math.cos(clamp(seg(t, L(6, 3.4), L(6, 5.6))) * TAU * 2);
    s2 = Math.max(s2, ease(seg(t, yank + .5, yank + .9)) * (1 - ease(seg(t, give + .6, give + 1.0))));
    for (let i = 0; i < 4; i++) { const a = L(6, 11.4 + i * BEAT); s2 = Math.max(s2, pulseK(t, a, BEAT * .9)); }    // faster on the beat
    for (let i = 0; i < 6; i++) { const a = L(7, 8.8 + i * .38); s2 = Math.max(s2, pulseK(t, a, .34)); }
    const B = [lerp(1180, 1560, side), lerp(470, 240, side)], R = lerp(150, 70, side) * popK(seg(t, L(6, -.3), L(6, .3)));
    if (R > 5) cu(B[0], B[1], R * (1 + .06 * pulse(t, 6)), s2, 'b1bead', 0);
    // L7: the old bell turns green as sparks leave it; the blue beaker; Pip's leaf goes blue
    const ringT = [L(7, .4), L(7, .9), L(7, 1.4)], patina = seg(t, L(7, .6), L(7, 2.6));
    if (side > .01) {
      const bx = lerp(-300, 700, side);
      bell(bx, 380, 1.1, .16 * ring(t, ringT, 4, 14), patina, 'b1bell');
      ringT.forEach((a, i) => { K.burst(bx, 520, 120, seg(t, a, a + .4), PAL.ink, 'b1rg' + i);
        for (let j = 0; j < 2; j++) { const k = seg(t, a + j * .1, a + 1.3 + j * .1); if (k > 0 && k < 1) { const p = arcPt([bx + (j ? 60 : -60), 520], [bx + (j ? 380 : -260) + 60 * i, 120 + 40 * i], 160, easeOut(k)); el(p[0], p[1], 12, 'b1e' + i + j); } } });
      for (let i = 0; i < 5; i++) K.sparkle(lerp(600, 800, hash(i)), 420 + 150 * hash(i + 1), 24, seg(t, L(7, 5.4 + i * .3), L(7, 6.4 + i * .3)), PAL.cream);
    }
    // the electron in Pip's hand between 交出 and 收回
    const u = 34, P = kf(t, [[0, [820, 790]], [L(7, -.3), [820, 790]], [L(7, .2), [470, 780]], [L(7, 2.8), [470, 780]], [L(7, 3.5), [1330, 560]]], ease);
    const dunk = seg(t, L(7, 3.6), L(7, 3.95)), under = t > L(7, 3.95) && t < L(7, 4.6), out = seg(t, L(7, 4.6), L(7, 5.0)), blueK = ease(seg(t, L(7, 4.4), L(7, 4.7))) * (1 - ease(seg(t, L(7, 8.6), L(7, 10.4))));
    const dipY = t < L(7, 3.6) ? 0 : t < L(7, 4.6) ? 330 * easeIn(dunk) : 330 * (1 - easeOut(out)) - 60 * Math.sin(out * Math.PI);
    let o = K.act(t, [[0, 'calm', { lookX: 1, lookY: -.4 }], [L(6, 2.6), 'wow', { lookX: 1, lookY: -.4 }], [L(6, 6.6), 'smug', { lookX: 1, lookY: -.5 }],
      [yank, 'strain', { armF: [.5, 3.6], lookX: 1 }], [yank + .55, 'laugh', { armF: [1.3, 3.0] }], [give - .3, 'wink', { armF: [.6, 3.4], lookX: 1 }], [L(6, 11.3), 'excited'],
      [L(7, -.1), 'happy', { lookX: -1 }], [L(7, .3), 'angry', { armF: [.3, 3.6], flip: true }], [L(7, 2.2), 'wow', { lookX: 1 }],
      [L(7, 3.5), 'excited', { lookY: .8 }], [L(7, 4.7), 'wow', { lookY: .3 }], [L(7, 5.6), 'love', { lookX: -.6, lookY: .6 }], [L(7, 8.6), 'laugh']]);
    if (dunk > 0 && out < 1) o = { ...o, sq: (o.sq || 0) - .25 * Math.sin(dunk * Math.PI) + .2 * Math.sin(out * Math.PI), armF: [1.4, 3.2], armB: [1.3, 3.0] };
    if (t > yank && t < give) o = { ...o, armF: [.2 + .9 * ease(seg(t, yank, yank + .5)), 3.4] };
    const leafCols = blueK > .01 ? { leaf: mixCol(PIPC.leaf, '#4F9BD8', blueK), leafDk: mixCol(PIPC.leafDk, '#2C6CA8', blueK) } : {};
    let gp; tinted(leafCols, () => { gp = genie(P[0], P[1] + dipY, u, t, o, 'b1pip', null, BLUE, blueK); });
    if (side > .01) { const bk = popK(seg(t, L(7, 2.4), L(7, 3.0))); if (bk > .05) beaker(1330, 900, bk, 'b1bk', 1, 5, t);
      K.burst(1330, 690, 140, seg(t, L(7, 3.9), L(7, 4.3)), Z.cu2Dk, 'b1spl'); K.burst(1330, 690, 140, seg(t, L(7, 4.6), L(7, 5.0)), Z.cu2Dk, 'b1sp2');
      for (let i = 0; i < 6; i++) { const k = seg(t, L(7, 3.92), L(7, 4.7)); if (k > 0 && k < 1) { const p = arcPt([1330, 690], [1330 + (i - 2.5) * 110, 760], 200, k); boilSeed('b1dr' + i); paint(ellPts(p[0], p[1], 10, 13, 10), { wash: '#5FA6DE', ink: PAL.ink, sw: .6 }); } } }
    // the pulled electron: stretches out of the bead, pops free, rides in Pip's hand, flies back
    const hand = handPt(gp[0], gp[1], u, o);
    if (t > yank - .4 && t < give + .9) {
      let e;
      if (t < yank + .1) { const k = seg(t, yank - .4, yank + .1); e = [lerp(B[0] - R * .9, hand[0], easeIn(k)), lerp(B[1] + R * .2, hand[1], easeIn(k))]; inkLine([[B[0] - R * .8, B[1]], e], 3 * (1 - k), Z.elDk, 'ink', .3); }
      else if (t < give) e = hand;
      else { const k = seg(t, give, give + .7); e = arcPt(hand, [B[0] - R * .3, B[1]], 120, easeIn(k)); }
      el(e[0], e[1], 16, 'b1pe', .5);
      K.burst(B[0] - R * .9, B[1], 60, seg(t, yank + .05, yank + .45), PAL.ink, 'b1y');
      K.burst(B[0], B[1], R * 1.1, seg(t, give + .65, give + 1.05), PAL.ink, 'b1g');
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [Z.verdDk, Z.verd]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#7A5236', '#D99A5E']);
  }

  // ================================ B2 · old iron, young copper (L8 – L11) ================================
  const HZ = 360;                                                   // the waterline
  function rock(x, y, s, crack, key) {                              // a black sulfide rock; crack 0..1 splits it
    boilSeed('rk' + key);
    const d = 30 * ease(crack) * s;
    if (crack <= .01) { paint([[-150, 0], [-130, -90], [-60, -150], [0, -142], [80, -130], [140, -70], [160, 0]].map(([a, b]) => [x + a * s, y + b * s]), { wash: '#3E3A44', fill: '#24212A', fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.2, curv: .2 });
      inkLine([[x - 90 * s, y - 110 * s], [x - 60 * s, y - 80 * s]], 1.5, '#6E6874', 'ink', .3); return; }
    for (const sd of [-1, 1]) {
      const P = sd < 0 ? [[-150, 0], [-130, -90], [-60, -150], [0, -140], [10, -60], [-6, 0]] : [[6, 0], [-4, -70], [8, -140], [80, -130], [140, -70], [160, 0]];
      paint(P.map(([a, b]) => [x + a * s + sd * d, y + b * s - d * .4]), { wash: '#3E3A44', fill: '#24212A', fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.2, curv: .2 });
      inkLine([[x + (sd * 70 - 20) * s + sd * d, y - 110 * s], [x + (sd * 90 + 10) * s + sd * d, y - 80 * s]], 1.5, '#6E6874', 'ink', .3);
    }
  }
  function cyano(x, y, s, k, t, key) {                              // a filament of cyanobacteria: a chain of blue-green cells
    if (k <= .02) return; boilSeed('cy' + key);
    const n = Math.round(7 * k); for (let i = 0; i < n; i++) { const q = popK(clamp(k * 7 - i)); if (q < .05) continue;
      paint(ellPts(x + i * 26 * s, y + 12 * s * Math.sin(i * .9 + t * 1.5), 14 * s * q, 11 * s * q, 12), { wash: i % 2 ? '#4FA79A' : '#5DB8A0', ink: PAL.ink, sw: .8 }); }
  }
  function enzyme(x, y, s, col, key, ang = 0) {                     // a pastel protein with a cleft on top (holds a copper)
    boilSeed('ez' + key);
    const P = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, cl = Math.exp(-Math.pow((a - Math.PI * 1.5) / .32, 2)); P.push([Math.cos(a) * 70 * (1 + .08 * Math.sin(a * 3)), Math.sin(a) * 52 * (1 - .55 * cl)]); }
    paint(rotPts(P, x, y, ang, s), { wash: col, fill: mixCol(col, PAL.ink, .25), fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1, curv: .3 });
    return [x + Math.sin(ang) * 30 * s, y - Math.cos(ang) * 30 * s];
  }
  function bubble(x, y, r, key) {                                   // Pip's diving bubble
    boilSeed('bb' + key);
    paint(ellPts(x, y, r, r, 30), { wash: '#DDEFF6', washOp: 70, ink: null });
    const P = ellPts(x, y, r, r, 30); inkLine(P.concat([P[0], P[1]]), 1.3, '#4F8FC0', 'ink', .5);
    inkLine(ellPts(x, y, r * .82, r * .82, 24).slice(13, 17), 3, PAL.cream, 'ink', .6);
  }
  const ROCKS = [[520, 1010, 1.15], [1060, 1050, 1.4], [1560, 1000, 1.1]];
  const LOCKED = [[470, 920], [600, 900], [1000, 940], [1150, 920], [1090, 990], [1530, 920], [1640, 930]];
  function shotB2(t, lt, dur) {
    K.setT(t);
    const blue = ease(seg(t, L(9, 3.3), L(9, 5.4)));                 // the haze clears to blue
    const cyz = kf(t, [[L(8, -1.2), [960, 330, 1.0]], [L(8, 2.6), [960, 560, 1.0]], [L(8, 8.4), [960, 560, 1.0]], [L(8, 9.6), [1060, 760, 1.25]],
      [L(9, -.3), [1060, 760, 1.25]], [L(9, .8), [960, 520, 1.0]], [L(9, 5.6), [960, 520, 1.0]], [L(9, 6.4), [1000, 700, 1.1]], [L(9, 9.6), [960, 560, 1.0]]], ease);
    camBegin(cyz[0] + 6 * wob(t, .05), cyz[1] + 4 * wob(t, .04), cyz[2]);
    boilSeed('b2sky'); paint(rectPts(-400, -800, W + 800, HZ + 800), { wash: mixCol('#E8A86A', '#9FD0EE', blue), ink: null });
    for (let i = 0; i < 4; i++) { boilSeed('b2hz' + i); paint(ellPts(hash(i + 3) * W + 40 * wob(t, .03, i), 120 + 160 * hash(i + 4), 360, 70, 16, 6), { fill: mixCol('#F2C38C', '#DDF0FA', blue), fillOp: 90, bleed: .3, tex: .4, ink: null }); }
    boilSeed('b2sea'); paint(rectPts(-400, HZ, W + 800, 1200), { wash: mixCol('#7C6A4E', '#3F86A8', blue), ink: null });
    for (let i = 0; i < 3; i++) { boilSeed('b2sw' + i); paint(ellPts(hash(i + 9) * W, HZ + 220 + 250 * i, 520, 90, 16, 6), { fill: mixCol('#8E7B5C', '#5A9EC0', blue), fillOp: 80, bleed: .3, tex: .4, ink: null }); }
    for (let i = 0; i < 3; i++) { const P = []; for (let j = 0; j <= 10; j++) P.push([-200 + j * 240, HZ + 10 * Math.sin(j * 1.3 + t * 1.2 + i) + i * 8]); inkLine(P, 1.2 - i * .3, mixCol('#4A3E30', '#2C5E7C', blue), 'ink', .6); }
    K.motes(t, 16, mixCol('#9C8866', '#7FB4D2', blue), { key: 'b2m', y0: 200 });
    // cyanobacteria bloom at the surface (L9), puffing O₂ up into the sky
    for (let i = 0; i < 6; i++) cyano(140 + i * 300, HZ + 30 + 20 * (i % 2), 1, seg(t, L(9, -.2 + i * .15), L(9, 1.4 + i * .15)), t, 'b2c' + i);
    for (let i = 0; i < 18; i++) { const a = L(9, 1.5 + i * .2), k = seg(t, a, a + 2.4); if (k <= 0) continue; const x0 = 200 + (i % 6) * 300, p = [x0 + 40 * Math.sin(k * 5 + i), lerp(HZ + 20, 40 + 200 * hash(i), easeOut(k))]; o2(p[0], p[1], .8, t + i, 'b2o' + i); }
    // the rocks lock copper away; they crack (L9 +5.4) and the copper floats out, turning blue (溶进水里)
    const crack = seg(t, L(9, 5.2), L(9, 5.7));
    ROCKS.forEach(([x, y, s], i) => rock(x, y, s, crack, 'b2r' + i));
    if (crack > 0) K.burst(1060, 900, 200, crack < 1 ? crack : 0, PAL.cream, 'b2cr');
    const grab = i => L(9, 7.4 + i * .25);
    LOCKED.forEach(([x, y], i) => {
      const fl = seg(t, L(9, 5.6 + i * .08), L(9, 7.4 + i * .08)), k2 = ease(seg(fl, .1, .7));
      const p = [x + 60 * Math.sin(fl * 4 + i) * fl, lerp(y, 560 + 60 * hash(i), easeOut(fl))];
      if (t > grab(i) + .6) return;
      if (fl <= 0) { boilSeed('b2lk' + i); paint(ellPts(x, y, 20, 20, 12), { wash: '#24212A', ink: null }); cu(x, y, 13, 0, 'b2l' + i, 0, 0); }
      else cu(p[0], p[1], 15, k2, 'b2l' + i, 0);
    });
    // enzymes drift in and swallow the dissolved copper (生命这才大量用上含铜的酶)
    const ENZ = ['#E7B7D3', '#B9D99A', '#F2D08A', '#A9C8EC', '#E9B39A'];
    ENZ.forEach((col, i) => { const k = seg(t, L(9, 6.8 + i * .2), L(9, 7.8 + i * .2)); if (k <= 0 || t > L(9, 11.4)) return;
      const x = 330 + i * 330, y = 600 + 60 * Math.sin(i * 1.7) + 8 * wob(t, .3, i), top = enzyme(lerp(x - 500, x, easeOut(k)), y, .9, col, 'b2z' + i);
      if (t > grab(i) + .6) cu(top[0], top[1], 15, 1, 'b2zc' + i, 0); });
    // old iron, new copper (L9 +11.0)
    const fr = popK(seg(t, L(9, 10.8), L(9, 11.4))), FE = [860, 560], CU = [1240, 560];
    if (fr > .05 && t < L(10, 6.0)) {
      feIon(FE[0], FE[1] + 6 * wob(t, .4), 66 * fr, 2, 'b2fe'); boilSeed('b2rust'); for (let i = 0; i < 5; i++) paint(ellPts(FE[0] + (hash(i) - .5) * 80 * fr, FE[1] - 40 * fr + 40 * hash(i + 1) * fr, 10 * fr, 6 * fr, 8), { wash: '#7E5A48', ink: null });
      inkLine([[FE[0] - 40, FE[1] - 70], [FE[0] - 70, FE[1] - 100]], 1.4, '#6E6874', 'ink', .4);
      cu(CU[0], CU[1] + 8 * Math.abs(Math.sin(t * 3)), 66 * popK(seg(t, L(9, 13.3), L(9, 13.8))), 0, 'b2new', .3);
      for (let i = 0; i < 3; i++) K.sparkle(CU[0] + (i - 1) * 70, CU[1] - 80, 22, frac(t * .8 + i / 3), PAL.cream);
    }
    // L10: the new friend arrives just as oxygen rises; today's copper enzymes each take an O₂ (Pip pitches them)
    if (t > L(10, 5.6)) {
      const ENZ2 = ['#E7B7D3', '#B9D99A', '#F2D08A', '#A9C8EC', '#E9B39A'];
      ENZ2.forEach((col, i) => { const k = popK(seg(t, L(10, 6.0 + i * .25), L(10, 6.5 + i * .25))); if (k < .05) return;
        const x = 520 + i * 250, y = 520 + 50 * (i % 2) + 8 * wob(t, .3, i), top = enzyme(x, y, .8 * k, col, 'b2y' + i);
        cu(top[0], top[1] + 4, 14 * k, 0, 'b2yc' + i, .3);
        const a = L(10, 10.8 + i * .28), f = seg(t, a, a + .5);
        if (f > 0) { const p = f < 1 ? arcPt([300, 700], [top[0], top[1] - 22], 160, easeOut(f)) : [top[0], top[1] - 22]; o2(p[0], p[1], .7, f < 1 ? t * 6 : .2, 'b2yo' + i); }
        if (f >= 1) K.burst(top[0], top[1] - 20, 50, seg(t, a + .5, a + .9), PAL.cream, 'b2yb' + i); });
    }
    // Pip in its diving bubble
    const u = 30, path = kf(t, [[L(8, -1.2), [700, 430]], [L(8, 3.0), [760, 640]], [L(8, 8.6), [760, 640]], [L(8, 9.8), [840, 800]], [L(9, .2), [840, 800]],
      [L(9, 1.4), [700, 640]], [L(9, 10.6), [700, 640]], [L(9, 11.2), [1050, 760]], [L(10, 5.0), [1050, 760]], [L(10, 6.0), [300, 760]]], ease);
    const knock = [L(8, 10.4), L(8, 10.9)];
    let o = K.act(t, [[0, 'calm', { lookY: -.6 }], [L(8, 5.0), 'confused', { lookY: -1, lookX: .4 }], [L(8, 8.9), 'calm', { lookY: .8, lookX: .6 }],
      [L(8, 10.2), 'angry', { armF: [-.3, 3.4] }], [L(8, 11.4), 'sad', { lookX: 1 }], [L(9, 1.0), 'wow', { lookY: -1 }], [L(9, 5.3), 'excited', { lookY: .7 }],
      [L(9, 11.4), 'happy', { armF: [-.15, 3.4], lookX: -1, flip: true }], [L(9, 13.4), 'laugh', { armF: [1.2, 3.2] }],
      [L(10, 6.0), 'smug', { lookX: 1 }], [L(10, 10.4), 'excited', { armF: [1.0, 3.4] }]]);
    o.armF = knock.some(a => t > a && t < a + .3) ? [-.6, 3.6] : o.armF;
    const [gx, gy] = genie(path[0], path[1], u, t, o, 'b2pip');
    bubble(gx, gy - 2.6 * u, 4.4 * u, 'b2bub');
    knock.forEach((a, i) => K.burst(980, 900, 50, seg(t, a + .1, a + .4), PAL.cream, 'b2k' + i));
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#7A5236', '#D99A5E']);
  }

  // ================================ B3 · aside: blue blood (L11) ================================
  function octopus(x, y, s, t, key, o = {}) {                        // soft coral octopus, dot eyes only; blue blood glows along its arms
    const col = '#E59A86', dk = '#C46E5C', bl = o.blue || 0;
    boilSeed('oc' + key);
    const arms = [];
    for (let i = 0; i < 6; i++) {                                    // arms
      const a0 = Math.PI * (.15 + i * .14), P = [];
      for (let k = 0; k <= 7; k++) { const q = k / 7, a = a0 + .5 * Math.sin(t * 1.4 + i + q * 4) * q; P.push([x + Math.cos(a) * (60 + 260 * q) * s, y + 80 * s + Math.sin(a) * (40 + 220 * q) * s]); }
      paint(ribbon(P, 46 * s, 8 * s), { wash: col, fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1, curv: .3 }); arms.push(P);
    }
    if (bl > .02) arms.forEach(P => inkLine(P.slice(1, 6), 1.1 * s, mixCol(col, '#3F86D8', bl), 'ink', .5));
    paint(ellPts(x, y - 40 * s, 150 * s, 175 * s, 30, 2), { wash: col, fill: dk, fillOp: 55, tex: .5, ink: PAL.ink, sw: 1.3, curv: .3 });
    if (bl > .02) { const V = [[[-10, 60], [-30, -10], [-70, -90]], [[-30, -10], [20, -90], [10, -150]], [[20, -90], [80, -110]], [[-10, 60], [60, 20], [100, 40]]];
      V.forEach(P => inkLine(P.map(([a, b]) => [x + a * s, y + b * s]), 2.2 * s, mixCol(col, '#4F9BE8', bl), 'ink', .5)); }
    for (const sd of [-1, 1]) paint(ellPts(x + sd * 55 * s, y + 50 * s, 12 * s, 15 * s * (1 - (o.blink || 0)), 10), { wash: PAL.ink, ink: null });
    paint(ribbon([[x + 120 * s, y + 40 * s], [x + 170 * s, y + 60 * s]], 26 * s, 20 * s), { wash: col, ink: PAL.ink, sw: 1 });   // the siphon
    return [x + 175 * s, y + 62 * s];
  }
  function squid(x, y, s, t, key) {
    boilSeed('sq' + key); const col = '#D9B3C9';
    paint([[x - 30 * s, y], [x, y - 190 * s], [x + 30 * s, y]].concat([[x + 40 * s, y + 20 * s], [x - 40 * s, y + 20 * s]]), { wash: col, ink: PAL.ink, sw: .9, curv: .4 });
    for (const sd of [-1, 1]) paint([[x, y - 170 * s], [x + sd * 60 * s, y - 140 * s], [x + sd * 10 * s, y - 110 * s]], { wash: col, ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 5; i++) inkLine([[x + (i - 2) * 12 * s, y + 20 * s], [x + (i - 2) * 18 * s + 10 * Math.sin(t * 2 + i) * s, y + 110 * s]], 5 * s, col, 'ink', .5);
  }
  function vial(x, y, s, col, key, rot = 0) {                       // a test tube; (x, y) = its middle
    boilSeed('vi' + key);
    push(); translate(x, y); rotate(rot); scale(s);
    paint(rrPts(-20, -10, 40, 90, 18), { wash: col, ink: null });
    paint(rrPts(-22, -80, 44, 172, 20), { wash: '#EEF5F8', washOp: 90, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(-20, -10, 40, 90, 18), { wash: col, ink: null });
    paint(rectPts(-18, -96, 36, 24), { wash: '#C99A5E', ink: PAL.ink, sw: .9 });
    inkLine([[-10, -60], [-10, 40]], 2.4, PAL.cream, 'ink', 0);
    pop();
  }
  function inset(x, y, r, k, key, draw) {                           // a round inset bubble (a close-up drawn inside)
    const q = popK(k); if (q < .05) return; boilSeed('in' + key);
    paint(ellPts(x, y, r * q, r * q, 36), { wash: PAL.cream, ink: PAL.ink, sw: 1.4 });
    push(); translate(x, y); scale(q); translate(-x, -y); draw(); pop();
  }
  function shotB3(t, lt, dur) {
    K.setT(t);
    const pushIn = seg(t, L(12, -1.6), L(12, -1.0));
    camBegin(980 + 6 * wob(t, .05) + 300 * easeIn(pushIn), 540 + 4 * wob(t, .04), 1.0 + 2.5 * easeIn(pushIn));
    K.wash('#2F6E9E', t, { key: 'b3', blob: '#4A8CBB' });
    K.motes(t, 20, '#6FA8CF', { key: 'b3m' });
    for (let i = 0; i < 5; i++) { boilSeed('b3ray' + i); paint([[200 + i * 380, -100], [320 + i * 380, -100], [180 + i * 380 + 200, 1200], [120 + i * 380 + 100, 1200]], { wash: '#5C9CC8', washOp: 60, ink: null }); }
    squid(1700 + 20 * wob(t, .1), 600 + 30 * wob(t, .07), 1.4, t, 'b3s');
    const ox = lerp(2300, 1320, easeOut(seg(t, L(11, -.2), L(11, 1.6)))), oy = 470 + 20 * wob(t, .12);
    const blue = ease(seg(t, L(11, 1.6), L(11, 3.0))), squirt = L(11, 13.5), recoil = spring(t, squirt, 5, 18);
    const siph = octopus(ox, oy, 1, t, 'b3o', { blue, blink: (t > squirt - .2 && t < squirt) ? 1 : 0 });
    // O₂ rides the blue blood (L11 +5.1); inset: hemocyanin's two coppers holding an O₂ (+6.7)
    for (let i = 0; i < 5; i++) { const a = L(11, 5.0 + i * .3), k = seg(t, a, a + 1.6); if (k > 0 && k < 1) { const p = arcPt([ox - 500, 260 + i * 60], [ox - 100 + i * 40, oy + 160], 80, easeOut(k)); o2(p[0], p[1], .7, t * 3 + i, 'b3o2' + i); } }
    inset(940, 330, 170, seg(t, L(11, 6.6), L(11, 7.1)) * (1 - seg(t, L(11, 9.9), L(11, 10.3))), 'b3in', () => {
      boilSeed('b3hc'); paint(ellPts(940, 340, 128, 104, 26, 2), { wash: '#7FB8E0', fill: '#4F8FC0', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1, curv: .3 });
      cu(880, 340, 30, .6, 'b3c1', 0); cu(1000, 340, 30, .6, 'b3c2', 0); o2(940, 332, 1.05, 0, 'b3oo'); });
    // Pip: red vial (iron) vs blue vial (copper); inked by the octopus
    const u = 32, ink = seg(t, squirt + .15, squirt + .45), soot = ink * (1 - seg(t, L(12, -2.2), L(12, -1.6)));
    let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(11, 1.8), 'wow', { lookX: 1 }], [L(11, 6.8), 'idea', { lookX: 1, lookY: -.8 }],
      [L(11, 9.9), 'smug', { armF: [.9, 3.2], armB: [.6, 2.8] }], [L(11, 12.9), 'laugh', { armF: [1.2, 3.2], armB: [.6, 2.8] }],
      [squirt + .45, 'wow', { armF: [1.2, 3.2], armB: [.6, 2.8], emote: null }], [squirt + 1.4, 'worried', { blush: 0 }]]);
    if (ink > 0 && t < squirt + 1.4) o = { ...o, blink: frac((t - squirt) / .6) < .15 ? 1 : 0 };
    const [gx, gy] = genie(560, 760, u, t, o, 'b3pip', null, SOOT, soot);
    if (t > L(11, 9.7)) {
      const k = popK(seg(t, L(11, 9.7), L(11, 10.1))), hF = handPt(gx, gy, u, o), hB = handPt(gx, gy, u, o, 'B');
      if (k > .05) { vial(hF[0] + 6, hF[1] - 40, k, '#D2413F', 'b3vr', .2); vial(hB[0] - 6, hB[1] - 40, k, '#3E8ED0', 'b3vb', -.2); }
    }
    // the ink jet
    for (let i = 0; i < 8; i++) { const a = squirt + i * .03, k = seg(t, a, a + .5); if (k > 0 && k < 1) puff(lerp(siph[0], gx, easeIn(k)) + 30 * Math.sin(i), lerp(siph[1], gy - 2.6 * u, easeIn(k)), 30 + 30 * k, 1, 'b3ink' + i, '#3B3342'); }
    if (ink > 0 && ink < 1) K.burst(gx, gy - 2.6 * u, 3 * u, ink, PAL.ink, 'b3splat');
    camEnd();
    if (lt < .25) { const k = 1 - lt / .25; for (let i = 0; i < 6; i++) inkLine([[0, 200 + i * 130], [W * k, 200 + i * 130]], 3 * k, PAL.cream, 'ink', 0); }
    flash(seg(t, L(12, -1.3), L(12, -1.0)), PAL.cream);
  }

  // ================================ C · the last stop of respiration (L12 – L24) ================================
  // The inner mitochondrial membrane, side view: IMS above (pale), matrix below (coral). Complex I, III, IV and ATP
  // synthase sit in it; cytochrome c rides the IMS face from III to IV. Complex IV (cytochrome c oxidase) is the hero:
  // CuA (a copper pair, on the IMS side), heme a, and the inner chamber where heme a3's iron and CuB hold O₂.
  const MY = 560, X1 = 260, X3 = 760, X4 = 1260, X5 = 1780;
  // positions inside complex IV (s = 1, relative to its centre on the membrane)
  const IV = { cuA: [[-22, -110], [22, -110]], hemeA: [-62, -10], hemeA3: [40, 25], cuB: [98, 25], o2: [69, 22], slots: [[-48, 88], [-16, 88], [16, 88], [48, 88]], dock: [10, -176] };
  const ivAt = (p, s = 1) => [X4 + p[0] * s, MY + p[1] * s];
  function membrane(t, key, grey = 0, x0 = -400, x1 = 2400) {
    const g = c => mixCol(c, '#A8A2A6', grey * .75);
    boilSeed(key + 'ims'); paint(rectPts(x0 - 400, -900, x1 - x0 + 800, MY + 900), { wash: g(Z.ims), ink: null });
    boilSeed(key + 'mat'); paint(rectPts(x0 - 400, MY, x1 - x0 + 800, 1600), { wash: g(Z.matrix), ink: null });
    for (let i = 0; i < 4; i++) { boilSeed(key + 'mb' + i); paint(ellPts(x0 + 300 + i * 600 + 40 * wob(t, .03, i), MY + 330 + 120 * hash(i), 300, 90, 16, 5), { fill: g(Z.matrixDk), fillOp: 70, bleed: .3, tex: .4, ink: null }); }
    K.motes(t, 16, g('#E0A57A'), { key: key + 'mm', y0: MY - 100 });
    const Tk = K.track([[x0, MY], [x1, MY]]), sp = (a, b, k) => { if (b > a) K.bilayer(Tk, 1.9, { key: key + k, from: a - x0, to: b - x0, cols: () => g(K.C.phos) }); };
    sp(x0, X1 - 130, 'b1'); sp(X1 + 110, X3 - 120, 'b2'); sp(X3 + 120, X4 - 150, 'b3'); sp(X4 + 150, X5 - 92, 'b4'); sp(X5 + 92, x1, 'b5');
  }
  function heme(x, y, s, key, hi = 0, grey = 0) {                  // a heme: a rounded porphyrin square with four nubs and an iron bead
    if (s < .05) return; boilSeed('hm' + key);
    if (hi > .02) glow(x, y, 60 * s, '#FF8A60', hi * .8);
    const col = mixCol(Z.fe, '#8E8689', grey * .7);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; paint(ellPts(x + Math.cos(a) * 24 * s, y + Math.sin(a) * 24 * s, 9 * s, 9 * s, 8), { wash: mixCol(col, PAL.cream, .3), ink: PAL.ink, sw: .7 }); }
    paint(rrPts(x - 24 * s, y - 24 * s, 48 * s, 48 * s, 14 * s), { wash: mixCol(col, PAL.cream, .45 + .3 * hi), ink: PAL.ink, sw: .9 });
    paint(ellPts(x, y, 11 * s * (1 + .25 * hi), 11 * s * (1 + .25 * hi), 10), { wash: mixCol(Z.feDk, '#FF8A60', hi * .6), ink: PAL.ink, sw: .7 });
  }
  // complex IV. o: lid 0..1 (pried open), win 0..1 (cut-away interior), cuA/cuB 0..1 (Cu⁺..Cu²⁺), hi {cuA, hemeA, hemeA3, cuB},
  // o2 0..1 (an O₂ clamped in the chamber), jit (O₂ fidget), slots 0..4 (banked electrons), grey, cn 0..1 (cyanide jammed in)
  function cox(t, s, o = {}, key = 'iv') {
    const x = X4, y = MY, g = c => mixCol(c, '#A8A2A6', (o.grey || 0) * .75), col = g('#9CCFB8'), dk = g('#5F9C84');
    auditBox('cox', key, x - 160 * s, y - 250 * s, x + 160 * s, y + 130 * s);
    boilSeed('iv' + key);
    const body = [[-150, -150], [-60, -165], [60, -165], [150, -150], [165, -40], [150, 100], [80, 130], [-80, 130], [-150, 100], [-165, -40]];
    paint(body.map(([a, b]) => [x + a * s, y + b * s]), { wash: col, fill: dk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.3, curv: .35 });
    for (let i = 0; i < 4; i++) inkLine([[x + (-120 + i * 80) * s, y - 140 * s], [x + (-110 + i * 76) * s, y + 110 * s]], .8, mixCol(dk, PAL.ink, .2), 'inkfine', .4);
    const win = clamp(o.win || 0);
    if (win > .02) {
      boilSeed('ivw' + key);
      paint(ellPts(x + 10 * s, y - 20 * s, 150 * s * popK(win), 118 * s * popK(win), 30, 1), { wash: g('#E8F3EC'), ink: PAL.ink, sw: 1.1 });
      if (win > .4) {
        const h = o.hi || {};
        IV.cuA.forEach((p, i) => cu(x + p[0] * s, y + p[1] * s, 17 * s * (1 + .3 * (h.cuA || 0)), o.cuA ?? 1, key + 'a' + i, (h.cuA || 0) * .7));
        heme(x + IV.hemeA[0] * s, y + IV.hemeA[1] * s, s, key + 'ha', h.hemeA || 0, o.grey || 0);
        heme(x + IV.hemeA3[0] * s, y + IV.hemeA3[1] * s, s, key + 'ha3', h.hemeA3 || 0, o.grey || 0);
        const lean = (o.clamp || 0) * 8 * s;
        cu(x + IV.cuB[0] * s - lean, y + IV.cuB[1] * s, 17 * s * (1 + .3 * (h.cuB || 0)), o.cuB ?? 1, key + 'b', (h.cuB || 0) * .7);
        IV.slots.forEach(([a, b], i) => { boilSeed('ivs' + key + i); const full = clamp((o.slots || 0) - i);
          if (o.slotsK > .02) paint(ellPts(x + a * s, y + b * s, 11 * s * popK(o.slotsK), 11 * s * popK(o.slotsK), 10), { wash: full > .5 ? Z.el : g('#D6E6DD'), ink: PAL.ink, sw: .7 });
          if (full > .5) el(x + a * s, y + b * s, 8 * s, key + 'se' + i, .4); });
        if ((o.o2 || 0) > .02) { const j = (o.jit || 0) * 6 * s; o2(x + IV.o2[0] * s + j * Math.sin(t * 40), y + IV.o2[1] * s + j * Math.cos(t * 33), .8 * s * popK(o.o2), Math.PI / 2 + (o.jit || 0) * .3 * Math.sin(t * 25), key + 'o'); }
        if ((o.cn || 0) > .02) cyanide(x + IV.o2[0] * s, y + IV.o2[1] * s, s, key + 'cn', 0);
      }
    }
    // the lid (subunit II, IMS side), hinged at its left end
    const lid = clamp(o.lid || 0), hx = x - 115 * s, hy = y - 150 * s;
    push(); translate(hx, hy); rotate(-1.35 * backOut(lid) * (lid > 0 ? 1 : 0));
    paint([[0, 0], [20 * s, -70 * s], [120 * s, -100 * s], [215 * s, -70 * s], [235 * s, 0]], { wash: g('#B7DCCB'), fill: dk, fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2, curv: .45 });
    pop();
    return [hx, hy];
  }
  function cyanide(x, y, s, key, spin = 0) {                       // C≡N: a slate bead and a violet bead joined by three bonds
    boilSeed('cn' + key);
    const a = spin, dx = Math.cos(a) * 22 * s, dy = Math.sin(a) * 22 * s, nx = -Math.sin(a), ny = Math.cos(a);
    for (let i = -1; i <= 1; i++) inkLine([[x - dx + nx * i * 6 * s, y - dy + ny * i * 6 * s], [x + dx + nx * i * 6 * s, y + dy + ny * i * 6 * s]], 1.6, PAL.ink, 'ink', 0);
    paint(ellPts(x - dx, y - dy, 17 * s, 17 * s, 12), { wash: Z.cn, ink: PAL.ink, sw: 1 });
    paint(ellPts(x + dx, y + dy, 15 * s, 15 * s, 12), { wash: Z.cnN, ink: PAL.ink, sw: 1 });
  }
  function cytC(x, y, s, t, key, rot = 0) {                         // cytochrome c: a small pink protein with its own heme
    boilSeed('cc' + key);
    push(); translate(x, y); rotate(rot); scale(s);
    paint(ellPts(0, 0, 40, 34, 18, 1), { wash: '#F0A9B8', fill: '#D27A92', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(-12, -12, 24, 24, 7), { wash: '#D9826E', ink: PAL.ink, sw: .7 });
    pop();
  }
  // (from thermo.js) a respiratory-chain complex: membrane arm + matrix arm
  function pumpComplex(x, y, s, k, key, col = '#B392C9', dk = '#7B5CA8') {
    boilSeed('pc' + key);
    paint(rrPts(x - 90 * s, y - 46 * s, 180 * s, 92 * s, 20 * s), { wash: col, fill: dk, fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x - 70 * s, y + 30 * s, 70 * s, 170 * s * (1 + .05 * k), 22 * s), { wash: mixCol(col, PAL.cream, .2), fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 });
  }
  function complex3(x, y, s, k, key) {                              // complex III: a dimer with arms into both sides
    boilSeed('c3' + key);
    for (const sd of [-1, 1]) paint(ellPts(x + sd * 52 * s, y + 10 * s, 64 * s, 120 * s * (1 + .04 * k), 20, 1), { wash: '#EBA9A0', fill: '#C27870', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1 });
  }
  // (from thermo.js) ATP synthase: the c-ring in the membrane turning, the stalk, the F1 head in the matrix
  function atpSynthase(x, y, s, rot, t, key, stall = 0) {
    auditBox('atps', key, x - 90 * s, y - 50 * s, x + 90 * s, y + 260 * s);
    boilSeed('as' + key);
    paint(ribbon([[x + 78 * s, y], [x + 92 * s, y + 120 * s], [x + 60 * s, y + 160 * s]], 14 * s, 12 * s), { wash: '#9BB37A', ink: PAL.ink, sw: .9 });
    paint(ribbon([[x, y], [x, y + 150 * s]], 20 * s, 20 * s), { wash: '#6F8B52', ink: PAL.ink, sw: .9 });
    for (let j = 0; j < 3; j++) { const jx = x + (j - 1) * 56 * s; paint(ellPts(jx, y + 200 * s, 34 * s, 46 * s, 16), { wash: j % 2 ? '#C7D99A' : '#A6C276', fill: '#6F8B52', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 }); }
    paint(rrPts(x - 82 * s, y - 42 * s, 164 * s, 84 * s, 26 * s), { wash: '#B5CC86', fill: '#7FA05A', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1 });
    for (let j = 0; j < 7; j++) { const ph = frac(j / 7 + rot), xx = x + Math.sin((ph - .5) * Math.PI) * 74 * s, wv = Math.cos((ph - .5) * Math.PI); if (wv > .15) inkLine([[xx, y - 36 * s], [xx, y + 36 * s]], 1.4 * wv, '#56713E', 'ink', 0); }
    if (stall > 0) { const q = backOut(clamp(stall)); if (q > .05) { paint(ellPts(x + 120 * s, y - 70 * s, 26 * q * s, 26 * q * s, 18), { wash: K.C.red, ink: PAL.ink, sw: 1 }); paint(rrPts(x + 120 * s - 15 * q * s, y - 74 * s, 30 * q * s, 8 * q * s, 3), { wash: PAL.cream, ink: null }); } }
  }
  function proton(x, y, s, key) {                                  // H⁺: a cream disc with a rose + (as in thermo)
    boilSeed('h' + key); const r = 15 * s;
    paint(ellPts(x, y, r, r, 12), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
    K.glyph('+', x, y, r * 1.1, Z.prot, Math.max(1, r / 7));
  }
  function atp(x, y, s, key) {                                     // ATP: three gold beads
    boilSeed('at' + key);
    for (let j = 0; j < 3; j++) paint(ellPts(x + j * 13 * s, y - (j % 2) * 5 * s, 9 * s, 9 * s, 10), { wash: j < 2 ? Z.atp : '#F7DB86', ink: PAL.ink, sw: .7 });
  }
  function nadh(x, y, s, key) {                                    // [H] (NADH): a cream capsule carrying two electrons
    boilSeed('nh' + key);
    paint(rrPts(x - 34 * s, y - 16 * s, 68 * s, 32 * s, 16 * s), { wash: '#F4E6C4', ink: PAL.ink, sw: .9 });
    el(x - 13 * s, y, 7 * s, key + 'a'); el(x + 13 * s, y, 7 * s, key + 'b');
  }
  function crowbar(a, b, key) {                                    // from Pip's hand a to the tip b (hooked)
    boilSeed('cb' + key);
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = (b[0] - a[0]) / d, ny = (b[1] - a[1]) / d;
    paint(ribbon([[a[0] - nx * 30, a[1] - ny * 30], b, [b[0] + nx * 14 - ny * 26, b[1] + ny * 14 + nx * 26]], 15, 12), { wash: '#6E6874', ink: PAL.ink, sw: 1.1 });
  }
  function silhouette(x, y, s, key) {                              // a pale paper person, no face; (x, y) = feet
    boilSeed('si' + key);
    paint(ribbon([[x, y], [x, y - 120 * s]], 70 * s, 84 * s), { wash: '#EFE4D2', ink: PAL.ink, sw: 1 });
    paint(ellPts(x, y - 160 * s, 34 * s, 38 * s, 16), { wash: '#EFE4D2', ink: PAL.ink, sw: 1 });
  }

  // electrons hopping I → III → (cyt c) → IV, one wave per index; returns nothing
  function relay(t, t0, n, key) {
    const stops = [[X1, MY - 10], [X1 + 220, MY + 4], [X3, MY - 20], [X3 + 90, MY - 90], [X4 - 40, MY - 190], ivAt(IV.cuA[0])];
    for (let i = 0; i < n; i++) {
      const k = (t - (t0 + i * .75)) / 4.6; if (k <= 0 || k >= 1) continue;
      const f = k * (stops.length - 1), j = Math.min(stops.length - 2, Math.floor(f)), q = ease(f - j);
      const p = arcPt(stops[j], stops[j + 1], 40, q); el(p[0], p[1], 11, key + i, .4);
    }
  }

  function shotC1(t, lt, dur) {
    K.setT(t);
    const inside = t > L(12, 5.4);
    if (!inside) {                                                    // a cell, then dive into one mitochondrion
      const dv = easeIn(seg(t, L(12, 3.0), L(12, 5.4)));
      camBegin(lerp(960, 1180, dv), lerp(540, 470, dv), lerp(1.0, 9, dv));
      K.wash(Z.tissue, t, { key: 'c1t', blob: Z.tissueBlob });
      K.cell(960, 560, 360, Z.cellA, Z.cellADk, t, { key: 'c1c', mood: 'happy', fx: .1,
        extras: () => { [[1180, 470, -.3], [820, 380, .5], [760, 720, -.2], [1100, 740, .9], [1230, 620, 1.6]].forEach(([x, y, a], i) => mito(x, y, i ? 1.1 : 1.4, a, 'c1m' + i, { cuK: 1 })); } });
      const [gx, gy] = genie(lerp(520, 1150, dv), lerp(700, 480, dv), 28 * (1 - .6 * dv), t, K.act(t, [[0, 'excited', { lookX: 1 }]]), 'c1pip');
      camEnd();
      flash(Math.max(1 - seg(lt, 0, .5), seg(t, L(12, 4.9), L(12, 5.4))), PAL.cream);
      return;
    }
    const fol = seg(t, L(13, 7.6), L(14, -1.2));
    const c = kf(t, [[L(12, 5.4), [980, 520, .78]], [L(13, 7.4), [980, 520, .78]], [L(14, -1.0), [X4 - 60, 470, 1.35]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    membrane(t, 'c1');
    pumpComplex(X1, MY, 1.2, pulseK(t, L(13, 2.3), 1), 'c1i');
    complex3(X3, MY, 1, pulseK(t, L(13, 4.5), 1), 'c1iii');
    cox(t, 1, {}, 'c1iv');
    atpSynthase(X5, MY, 1.1, (t - L(12, 5)) * .3, t, 'c1as');
    // [H] arrive from the matrix and drop their electrons into complex I
    for (let i = 0; i < 3; i++) { const a = L(13, .2 + i * .5), k = seg(t, a, a + 1.8); if (k <= 0 || k >= 1) continue;
      const p = [lerp(-100 + i * 120, X1 - 30 + i * 30, easeOut(k)), lerp(1000, MY + 210, easeOut(k))]; nadh(p[0], p[1], 1.1, 'c1n' + i); }
    relay(t, L(13, 2.2), 4, 'c1e');
    // Pip runs the relay with an electron baton, legs a blur
    const run = seg(t, L(13, 2.4), L(13, 9.4)), u = 30;
    const px = lerp(X1 + 40, X4 - 240, ease(run)), py = MY - 230 + 10 * Math.sin(t * 18) * (run > 0 && run < 1 ? 1 : 0);
    let o = K.act(t, [[0, 'wow', { lookY: .6 }], [L(12, 8.0), 'excited', { lookX: 1, lookY: .4 }], [L(13, 2.4), 'strain', { armF: [.4, 3.2], armB: [-.6, 2.6] }], [L(13, 9.3), 'laugh', { armF: [.7, 3.2] }]]);
    if (run > 0 && run < 1) o = { ...o, walk: t * 14, rot: .14 };
    const [gx, gy] = genie(px, py, u, t, o, 'c1pip');
    if (run > 0 && t < L(14, -.6)) { const h = handPt(gx, gy, u, o); el(h[0] + 6, h[1] - 6, 13, 'c1bat', .4); }
    if (run > .05 && run < .95) for (let i = 0; i < 3; i++) inkLine([[gx - 110 - i * 30, gy - 2.6 * u + (i - 1) * 34], [gx - 220 - i * 40, gy - 2.6 * u + (i - 1) * 34]], 2, PAL.ink, 'ink', 0);
    camEnd();
    flash(1 - seg(t, L(12, 5.4), L(12, 6.0)), PAL.cream);
  }

  // C2 – C3 · inside complex IV (L14 – L19)
  function shotC2(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(14, -1.0), [X4 - 60, 470, 1.35]], [L(14, .8), [X4 + 40, 470, 1.65]], [L(16, 2.6), [X4 + 40, 470, 1.65]], [L(16, 4.4), [X4 + 60, 560, 2.15]],
      [L(18, -.4), [X4 + 60, 560, 2.15]], [L(18, .4), [X4 + 260, 450, 1.55]], [L(19, -.8), [X4 + 260, 450, 1.55]], [L(19, .2), [X4 + 60, 560, 2.15]]], ease);
    camBegin(c[0] + 5 * wob(t, .05), c[1] + 3 * wob(t, .04), c[2]);
    membrane(t, 'c2', 0, 600, 2000);
    complex3(X3, MY, 1, 0, 'c2iii');
    atpSynthase(X5, MY, 1.1, (t - L(12, 5)) * .3, t, 'c2as');
    // the lid is pried open (L14 +5.4); the cofactors light up as named
    const lid = seg(t, L(14, 6.4), L(14, 6.9)), win = seg(t, L(14, 6.5), L(14, 7.0));
    const hi = { cuA: Math.max(pulseK(t, L(14, 7.0), .8), pulseK(t, L(15, 10.0), 1.4), pulseK(t, L(15, 4.4), .5), pulseK(t, L(15, 8.0), .5)),
      hemeA: Math.max(pulseK(t, L(14, 10.0), .8), pulseK(t, L(16, 1.6), .7)), hemeA3: Math.max(pulseK(t, L(14, 10.7), .8), pulseK(t, L(16, 5.4), 1.4), .6 * pulseK(t, L(16, 9.2), .5), .6 * pulseK(t, L(16, 10.2), .5)),
      cuB: Math.max(pulseK(t, L(14, 7.6), .8), pulseK(t, L(16, 7.2), 1.4), .6 * pulseK(t, L(16, 9.7), .5), .6 * pulseK(t, L(16, 10.7), .5)) };
    hi.cuA = Math.max(hi.cuA, pulseK(t, L(14, 8.2), .8) * 0);
    // CuA shows copper's trick: it takes cyt c's electron (blue → orange) and passes it on (orange → blue)
    let cuA = 1; for (const a of [L(15, 4.4), L(15, 8.0), L(16, .6)]) cuA = Math.min(cuA, 1 - pulseK(t, a, 1.2));
    // electrons sit in the four slots (L19), O₂ clamped (L16 +10.4) and fidgeting (L17)
    let slots = 0; for (let i = 0; i < 4; i++) slots += ease(seg(t, L(19, 3.0 + i * .7), L(19, 3.3 + i * .7)));
    const snap = L(19, 7.0), split = seg(t, snap, snap + .4);
    if (t > snap) slots = 4 * (1 - split);
    const o2in = t < L(16, 10.2) ? 0 : t < snap + .2 ? ease(seg(t, L(16, 10.2), L(16, 11.2))) : 0;
    const jit = t > L(17, 0) && t < snap ? .5 + .5 * on(t, L(17, 2.4), L(17, 4.6)) : 0;
    const o2drift = seg(t, L(16, 9.8), L(16, 10.9));
    cox(t, 1, { lid, win, cuA, hi, o2: o2in > .98 ? 1 : 0, jit, clamp: on(t, L(16, 10.6), L(17, 1.5), .3, .6), slots, slotsK: seg(t, L(17, 6.4), L(17, 6.8)) * (1 - seg(t, snap + .4, snap + .7)) }, 'c2iv');
    if (o2drift > 0 && o2drift < 1) { const p = [lerp(X4 + 120, ivAt(IV.o2)[0], ease(o2drift)), lerp(MY + 300, ivAt(IV.o2)[1], ease(o2drift))]; o2(p[0], p[1], .8, Math.PI / 2 * o2drift, 'c2od'); }
    // the goal: two ghost water drops (L17 +8.4)
    const ghost = on(t, L(17, 8.4), L(18, -.3), .4, .3);
    if (ghost > .05) for (const sd of [-1, 1]) { const p = [ivAt(IV.o2)[0] + sd * 34, ivAt(IV.o2)[1] + 170]; boilSeed('c2gh' + sd); const P = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, w = Math.sin(a / 2); P.push([p[0] + Math.sin(a) * 15 * (.35 + .65 * w), p[1] - Math.cos(a) * 20 + 9 * w]); } inkLine(P.concat([P[0]]), 1.2 * ghost, Z.o2Dk, 'ink', .4); }
    // cyt c: rolls in and docks twice (L15), each time handing one electron to CuA
    for (const [a, k] of [[L(15, .4), 0], [L(15, 5.6), 1]]) {
      const inK = seg(t, a, a + 1.8), outK = seg(t, a + (k ? 3.2 : 3.4), a + (k ? 4.4 : 4.6)); if (inK <= 0 || outK >= 1) continue;
      const dock = ivAt(IV.dock), from = [X3 + 80, MY - 70], x = outK > 0 ? lerp(dock[0], from[0], ease(outK)) : lerp(from[0], dock[0], ease(inK)), y = (outK > 0 ? lerp(dock[1], from[1], ease(outK)) : lerp(from[1], dock[1], ease(inK))) - 20 * Math.sin(inK * Math.PI);
      cytC(x, y, 1, t, 'c2cc' + k, (x - from[0]) / 40);
      const give = a + (k ? 2.4 : 4.0) - .4, gk = seg(t, give, give + .4);
      if (t < give) el(x, y - 30, 10, 'c2ce' + k, .3); else if (gk < 1) { const tgt = ivAt(IV.cuA[0]); el(lerp(x, tgt[0], gk), lerp(y - 30, tgt[1], gk), 10, 'c2ce' + k, .4); }
      K.burst(ivAt(IV.cuA[0])[0] + 20, ivAt(IV.cuA[0])[1], 50, seg(t, give + .4, give + .8), PAL.ink, 'c2ding' + k);
    }
    // L16: the electron drops CuA → heme a → the chamber
    const hop = seg(t, L(16, .6), L(16, 4.6));
    if (hop > 0 && hop < 1) { const P = [ivAt(IV.cuA[0]), ivAt(IV.hemeA), ivAt(IV.hemeA3)], f = hop * 2, j = Math.min(1, Math.floor(f)), q = ease(f - j); const p = arcPt(P[j], P[j + 1], 20, q); el(p[0], p[1], 9, 'c2hop', .5); }
    // L19: four electrons bank in one by one, then SNAP into O₂ → two water drops that splash Pip
    for (let i = 0; i < 4; i++) { const a = L(19, 2.6 + i * .7), k = seg(t, a, a + .5); if (k > 0 && k < 1) { const p = arcPt(ivAt(IV.cuA[0]), ivAt(IV.slots[i]), 40, ease(k)); el(p[0], p[1], 9, 'c2in' + i, .4); } }
    if (t > snap && t < snap + .45) for (let i = 0; i < 4; i++) { const p = [lerp(ivAt(IV.slots[i])[0], ivAt(IV.o2)[0], split), lerp(ivAt(IV.slots[i])[1], ivAt(IV.o2)[1], split)]; el(p[0], p[1], 9, 'c2sn' + i, .6); }
    K.burst(ivAt(IV.o2)[0], ivAt(IV.o2)[1], 70, seg(t, snap + .35, snap + .8), Z.elDk, 'c2snap');
    // Pip
    const u = 20, splashT = L(19, 9.6);
    const P = kf(t, [[L(14, -1.0), [X4 - 380, MY - 200]], [L(14, .6), [X4 + 230, MY - 190]], [L(14, 4.6), [X4 + 230, MY - 190]], [L(14, 5.2), [X4 + 200, MY - 150]],
      [L(15, 7.0), [X4 + 200, MY - 150]], [L(15, 8.0), [X4 + 230, MY - 120]], [L(16, 9.6), [X4 + 260, MY - 40]], [L(16, 10.4), [X4 + 235, MY + 50]],
      [L(17, 2.4), [X4 + 250, MY + 60]], [L(18, -.2), [X4 + 250, MY + 60]], [L(18, .4), [X4 + 250, MY - 150]], [L(19, -.6), [X4 + 250, MY - 150]], [L(19, .2), [X4 + 250, MY + 150]]], ease);
    const skid = seg(t, L(14, .2), L(14, .8)), pry = on(t, L(14, 5.3), L(14, 7.0), .2, .2);
    let o = K.act(t, [[0, 'excited', { lookX: 1 }], [L(14, .5), 'wow', { lookX: -1, flip: true }], [L(14, 2.5), 'smug', { flip: true, lookX: 1, armF: [.6, 3.2] }],
      [L(14, 5.2), 'strain', { flip: true }], [L(14, 6.9), 'wow', { flip: true, lookY: .6 }], [L(14, 9.4), 'idea', { flip: true }],
      [L(15, 1.0), 'calm', { flip: true, lookX: 1, lookY: -.5 }], [L(15, 4.5), 'happy', { flip: true }], [L(15, 7.8), 'wink', { flip: true }],
      [L(16, 2.0), 'wow', { flip: true, lookY: .6 }], [L(16, 10.4), 'strain', { flip: true, armF: [0, 3.6], armB: [.1, 3.4] }],
      [L(17, 1.4), 'confused', { flip: true }], [L(17, 4.6), 'worried', { flip: true }], [L(17, 6.2), 'idea', { flip: true }],
      [L(18, .2), 'angry', { armF: [.5, 3.4] }], [L(18, 2.6), 'wow', { lookX: 1 }], [L(18, 4.9), 'worried', { take: 1.2 }],
      [L(19, .3), 'calm', { flip: true, lookY: .4 }], [L(19, 5.8), 'excited', { flip: true }], [splashT, 'wow', { flip: true, blink: 1 }], [splashT + .8, 'laugh', { flip: true }]]);
    if (pry > 0) o = { ...o, armF: [-.2 + .4 * seg(t, L(14, 5.8), L(14, 6.8)), 3.4], armB: [-.1, 3.2], rot: -.12 * pry };
    if (skid > 0 && skid < 1) o = { ...o, rot: -.3 * Math.sin(skid * Math.PI), sq: .2 * Math.sin(skid * Math.PI) };
    // L18: the demo O₂ get one and two electrons from Pip's hand and turn dangerous; the superoxide chases Pip
    const chase = seg(t, L(18, 6.2), L(19, -.4));
    let pp = P;
    if (chase > 0 && chase < 1) { const a = chase * TAU * 1.4; pp = [X4 + 360 + Math.cos(a) * 230, MY - 170 + Math.sin(a) * 110]; o = { ...o, flip: Math.sin(a) > 0, rot: .15, walk: t * 14 }; }
    const [gx, gy] = genie(pp[0], pp[1], u, t, o, 'c2pip');
    if (pry > 0) { const h = handPt(gx, gy, u, o); crowbar(h, [X4 + 100, MY - 156], 'c2cb'); }
    if (skid > 0 && skid < 1) for (let i = 0; i < 3; i++) puff(gx + 60 + i * 30, gy, 14 + 8 * i, 1 - skid, 'c2sk' + i);
    K.burst(X4 + 100, MY - 160, 60, seg(t, L(14, 6.8), L(14, 7.2)), PAL.ink, 'c2pop');
    if (t > L(18, -.2) && t < L(19, -.3)) {
      const O1 = [X4 + 400, MY - 250], O2_ = [X4 + 520, MY - 160], toss1 = L(18, .5), toss2 = L(18, 3.6);
      const r1 = seg(t, toss1 + .5, toss1 + .7) > 0 && t > L(18, 2.4), rk = seg(t, L(18, 2.4), L(18, 2.7));
      for (const [a, tgt, n] of [[toss1, O1, 1], [toss2, O2_, 2], [toss2 + .35, O2_, 2]]) { const k = seg(t, a, a + .45); if (k > 0 && k < 1) { const h = [gx + 3 * u, gy - 3 * u], p = arcPt(h, tgt, 60, k); el(p[0], p[1], 9, 'c2t' + a, .3); } }
      if (rk <= 0) o2(O1[0], O1[1] + 6 * wob(t, .5), .8, .3, 'c2d1');
      else if (chase <= 0) radical(O1[0], O1[1], 30 * popK(rk), t, 'c2r1');
      else { const a = chase * TAU * 1.4 - .7, p = [X4 + 360 + Math.cos(a) * 230, MY - 170 + Math.sin(a) * 110]; radical(p[0], p[1] - 2.5 * u, 30, t, 'c2r1'); for (let i = 0; i < 3; i++) puff(p[0] - 40 * Math.cos(a + 1.6) * (i + 1), p[1] - 2.5 * u - 40 * Math.sin(a + 1.6) * (i + 1), 12, .7 - i * .2, 'c2dust' + i); }
      const hk = seg(t, L(18, 4.3), L(18, 4.6));
      if (hk <= 0) o2(O2_[0], O2_[1] + 6 * wob(t, .5, 1), .8, -.4, 'c2d2'); else h2o2(O2_[0] + 30 * Math.sin(t * 2), O2_[1] + 20 * Math.sin(t * 1.4), popK(hk) * 1.1, t * .8, 'c2hp');
      K.burst(O1[0], O1[1], 60, rk < 1 ? rk : 0, Z.rad, 'c2rb'); K.burst(O2_[0], O2_[1], 60, hk < 1 ? hk : 0, Z.h2o2Dk, 'c2hb');
    }
    // the two drops of water fly out and splash Pip (L19 +8.3 → +9.6); ✓
    const wk = seg(t, snap + .4, splashT);
    if (wk > 0 && wk < 1) for (const sd of [-1, 1]) { const p = arcPt([ivAt(IV.o2)[0] + sd * 20, ivAt(IV.o2)[1]], [gx + sd * 20, gy - 4 * u], 70, ease(wk)); water(p[0], p[1], 1.1, 'c2w' + sd); }
    if (t > splashT) { K.burst(gx, gy - 4 * u, 3 * u, seg(t, splashT, splashT + .4), Z.water, 'c2spl');
      for (let i = 0; i < 4; i++) { const k = seg(t, splashT + i * .15, splashT + 1.2 + i * .15); if (k > 0 && k < 1) { boilSeed('c2drip' + i); paint(ellPts(gx + (i - 1.5) * 20, gy - 4 * u + k * 3 * u, 5, 7, 8), { wash: Z.water, ink: PAL.ink, sw: .5 }); } }
      K.check(ivAt(IV.o2)[0] - 120, ivAt(IV.o2)[1] - 120, 60, seg(t, L(19, 10.6), L(19, 11.2)), 'c2ck'); }
    camEnd();
  }

  // C4 · protons, ATP and the balance (L20 – L22)
  function shotC4(t, lt, dur) {
    K.setT(t);
    const out = t > L(22, .4);
    if (out) {                                                        // the whole cell: every O₂ streams to a copper glint
      camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0 + .02 * (t - L(22, .4)));
      K.wash(Z.tissue, t, { key: 'c4t', blob: Z.tissueBlob });
      const MS = [[700, 420, -.3], [1030, 360, .5], [1260, 520, -.2], [840, 700, .9], [1120, 760, 1.6], [640, 600, 1.2], [1350, 330, .3]];
      K.cell(980, 560, 380, Z.cellA, Z.cellADk, t, { key: 'c4c', mood: t > L(22, 7.6) ? 'happy' : 'calm', fx: -.6,
        extras: () => MS.forEach(([x, y, a], i) => mito(x, y, 1.1, a, 'c4m' + i, { cuK: 1, glowK: .5 * Math.max(...[0, 1, 2].map(j => pulseK(t, L(22, 3.6 + i * .3 + j * 1.6), .6))) })) });
      for (let i = 0; i < 24; i++) { const a = L(22, -.2 + i * .28), k = seg(t, a, a + 1.6); if (k <= 0 || k >= 1) continue; const m = MS[i % MS.length], p = arcPt([-80, 200 + 680 * hash(i + 3)], [m[0], m[1]], 60, easeOut(k)); o2(p[0], p[1], .7 * (1 - .5 * seg(k, .85, 1)), t * 2 + i, 'c4o' + i); }
      // a painted pie fills to nine tenths (九成以上)
      const pk = ease(seg(t, L(22, 2.0), L(22, 3.3))), pc = [1640, 250];
      if (seg(t, L(22, 1.8), L(22, 2.1)) > 0) { boilSeed('c4pie'); paint(ellPts(pc[0], pc[1], 110, 110, 32), { wash: PAL.cream, ink: PAL.ink, sw: 1.3 });
        if (pk > .02) { const P = [pc]; for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + pk * .92 * TAU * i / 30; P.push([pc[0] + Math.cos(a) * 104, pc[1] + Math.sin(a) * 104]); } paint(P, { wash: Z.cu, ink: PAL.ink, sw: 1 }); } }
      const u = 32; const o = K.act(t, [[0, 'wow', { lookX: 1 }], [L(22, 4.2), 'excited'], [L(22, 7.6), 'smug', { armsFront: true, armF: { at: [-.9, -2.4] }, armB: { at: [.9, -2.3] } }]]);
      genie(330, 820, u, t, o, 'c4pip2');
      camEnd();
      flash(1 - seg(t, L(22, .4), L(22, .9)), PAL.cream);
      return;
    }
    const c = kf(t, [[L(20, -.8), [X4 + 60, 560, 2.15]], [L(20, .4), [X4 + 260, 520, 1.15]], [L(20, 5.2), [X4 + 260, 520, 1.15]], [L(20, 6.4), [X5 - 80, 560, 1.3]], [L(21, 2.0), [X5 - 80, 560, 1.3]], [L(21, 2.8), [X5 + 230, 470, 1.0]]], ease);
    camBegin(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    membrane(t, 'c4', 0, 600, 2600);
    const rot = (t - L(12, 5)) * .3 + 3 * ease(seg(t, L(20, 6.8), L(21, 3))) + 2.5 * seg(t, L(21, 0), L(21, 9));
    cox(t, 1, { lid: 1, win: 1, cuA: 1 }, 'c4iv');
    atpSynthase(X5, MY, 1.15, rot, t, 'c4as');
    // protons: one per electron through complex IV, then a crowd, then the flood back through the synthase
    for (let i = 0; i < 16; i++) {
      const up = L(20, .9 + i * .25), ku = seg(t, up, up + .9), top = [X4 - 200 + 900 * hash(i + 200), MY - 140 - 160 * hash(i + 201) + 12 * wob(t, .3, i)], below = [X4 + (hash(i + 202) - .5) * 160, MY + 160];
      const dn = L(20, 6.8 + i * .14), kd = seg(t, dn, dn + 1.3);
      let p;
      if (ku <= 0) { if (i > 3) continue; p = below; }
      else if (kd <= 0) p = ku < 1 ? [lerp(below[0], top[0], ease(ku)), lerp(below[1], top[1], easeOut(ku))] : top;
      else if (kd < 1) { const f = kd < .5 ? ease(kd * 2) : 1, g = kd < .5 ? 0 : (kd - .5) * 2; p = kd < .5 ? [lerp(top[0], X5, f), lerp(top[1], MY - 60, f)] : [X5 + (hash(i) - .5) * 300 * g, lerp(MY - 60, MY + 300 + 100 * hash(i + 3), g)]; }
      else continue;
      proton(p[0], p[1], 1.4, 'c4h' + i);
    }
    for (let i = 0; i < 6; i++) { const a = L(20, 7.6 + i * .4), k = seg(t, a, a + 1.2); if (k > 0 && k < 1) atp(X5 - 40 + (i - 2.5) * 50 * k, MY + 260 + 160 * easeOut(k), 1.3, 'c4a' + i); }
    // the balance swings down on a rope (L21 +2.4): ATP mountain vs a paper person
    const drop = seg(t, L(21, 2.2), L(21, 3.0)), BP = [X5 + 470, lerp(-500, 230, easeOut(drop)) + 12 * spring(t, L(21, 3.0), 4, 12)];
    if (drop > 0) {
      inkLine([[BP[0], BP[1] - 800], [BP[0], BP[1]]], 2, PAL.ink, 'ink', 0);
      const pile = seg(t, L(21, 3.0), L(21, 6.4)), per = popK(seg(t, L(21, 6.9), L(21, 7.3)));
      const tilt = .2 * ease(seg(t, L(21, 3.0), L(21, 5.0))) - .2 * ease(seg(t, L(21, 7.0), L(21, 7.6))) + .04 * spring(t, L(21, 7.4), 5, 14);
      balance(BP[0], BP[1], 1.0, tilt, 'c4bal', (px, py) => { let i = 0; [5, 4, 4, 3, 2].forEach((n, r) => { for (let j = 0; j < n; j++, i++) { if (i / 18 > pile) return; atp(px - n * 22 + j * 44 - 10, py - 16 - r * 19, 1.45, 'c4p' + i); } }); },
        (px, py) => { if (per > .05) silhouette(px, py - 6, .75 * per, 'c4si'); });
    }
    // Pip: rides the proton flood into the synthase and is spun out dizzy
    const u = 26, swept = seg(t, L(20, 6.8), L(20, 7.6)), spun = t > L(20, 7.6) && t < L(20, 8.9), spat = seg(t, L(20, 8.9), L(20, 9.5));
    const p0 = ease(seg(t, L(20, -.4), L(20, 1.0)));
    let P = [lerp(X4 + 250, X4 + 460, p0), lerp(MY + 150, MY - 160, p0)];
    if (swept > 0) P = [lerp(X4 + 460, X5 - 10, ease(swept)), lerp(MY - 160, MY - 70, ease(swept))];
    if (spun) P = [X5 + Math.sin((t - L(20, 7.6)) * 16) * 60, MY - 20];
    if (spat > 0) P = [lerp(X5, X5 + 330, easeOut(spat)), lerp(MY + 60, MY + 280, easeOut(spat)) - 120 * Math.sin(spat * Math.PI)];
    let o = K.act(t, [[0, 'happy', { lookX: -1, flip: true }], [L(20, 1.0), 'calm', { flip: true, lookY: -.6 }], [L(20, 5.6), 'wow', { lookX: 1 }], [L(20, 6.8), 'worried', { take: 1.2 }],
      [L(20, 9.0), 'dizzy'], [L(21, 2.4), 'wow', { lookX: -1, lookY: -.6, flip: true }], [L(21, 7.3), 'wow', { flip: true, lookX: 1, lookY: -.4, take: 1.4 }]]);
    if (spun) o = { ...o, flip: Math.sin((t - L(20, 7.6)) * 16) < 0, sq: -.2 };
    if (t > L(20, 9.5)) P = [X5 + 330, MY + 280];
    const [gx, gy] = genie(P[0], P[1], u, t, o, 'c4pip');
    if (t > L(20, 9.0) && t < L(21, 2.4)) stars(gx, gy - 6.4 * u, 40, t, 'c4dz');
    if (spun) for (let i = 0; i < 3; i++) inkLine(ellPts(X5, MY, 110 + i * 14, 50 + i * 6, 16).slice(i * 3, i * 3 + 6), 1.6, PAL.ink, 'ink', .6);
    camEnd();
    if (lt < .1) flash(1 - lt / .1, PAL.cream);
  }

  // C5 · cyanide (L23 – L24)
  function shotC5(t, lt, dur) {
    K.setT(t);
    const grey = ease(seg(t, L(24, 2.8), L(24, 5.4)));
    camBegin(X4 + 80 + 5 * wob(t, .05) + 8 * shakeXY(t, 1)[0] * near(t, L(23, 4.2), .25), 560 + 3 * wob(t, .04), 2.0);
    membrane(t, 'c5', grey, 600, 2000);
    const slam = L(23, 4.2), cnIn = seg(t, L(23, .8), slam);
    cox(t, 1, { lid: 1, win: 1, cuA: 1, grey, cn: t > slam ? 1 : 0, hi: { hemeA3: pulseK(t, slam, .6), cuB: pulseK(t, slam, .6) } }, 'c5iv');
    if (cnIn > 0 && t < slam) { const p = arcPt([X4 + 520, MY - 250], ivAt(IV.o2), 120, easeIn(cnIn)); cyanide(p[0], p[1], 1, 'c5cn', t * 8); }
    K.burst(ivAt(IV.o2)[0], ivAt(IV.o2)[1], 90, seg(t, slam, slam + .45), PAL.ink, 'c5clang');
    // O₂ bump the blocked chamber and bounce off; electrons queue up behind
    for (let i = 0; i < 5; i++) { const a = L(24, .6 + i * .5), k = seg(t, a, a + 2.4); if (k <= 0 || k >= 1) continue;
      const hit = [ivAt(IV.o2)[0] + 40, ivAt(IV.o2)[1] + 60], src = [X4 + 120 + i * 50, MY + 330], end = [X4 + 380 - i * 120, MY + 260 + 30 * i];
      const p = k < .4 ? [lerp(src[0], hit[0], ease(k / .4)), lerp(src[1], hit[1], ease(k / .4))] : arcPt(hit, end, 60, easeOut((k - .4) / .6)); o2(p[0], p[1], .7, t + i, 'c5o' + i, mixCol(Z.o2, '#B9B4B6', grey)); }
    for (let i = 0; i < 6; i++) { const k = seg(t, L(24, 3.0 + i * .3), L(24, 3.6 + i * .3)); if (k > 0) { const p = [lerp(X4 - 300, ivAt(IV.cuA[0])[0] - 40 - i * 36, ease(k)), ivAt(IV.cuA[0])[1] - 20 + (i % 2) * 14]; el(p[0], p[1], 9, 'c5q' + i, .2); } }
    // Pip grabs the cyanide and pulls: stretches like taffy, snaps, flung off frame
    const u = 24, pull = seg(t, L(24, 5.6), L(24, 8.1)), fling = seg(t, L(24, 8.1), L(24, 8.8));
    const cnP = ivAt(IV.o2), base = [cnP[0] + 140, cnP[1] + 3.0 * u];
    let P = kf(t, [[L(23, -.6), [X4 + 330, MY + 120]], [L(24, 5.0), [X4 + 330, MY + 120]], [L(24, 5.6), base]], ease);
    if (pull > 0) P = [base[0] + 70 * ease(pull) + 4 * Math.sin(t * 40) * (pull < 1 ? 1 : 0), base[1]];
    if (fling > 0) P = [lerp(base[0] + 70, X4 + 900, easeOut(fling)), lerp(base[1], MY - 300, easeOut(fling))];
    let o = K.act(t, [[0, 'calm', { flip: true }], [L(23, 1.0), 'worried', { flip: true, lookX: 1, lookY: -.6 }], [slam, 'wow', { flip: true, take: 1.4 }],
      [L(24, 3.0), 'sad', { flip: true }], [L(24, 5.4), 'angry', { flip: true }], [L(24, 6.0), 'strain', { flip: true }], [L(24, 8.1), 'wow', { flip: true }], [L(24, 9.4), 'sad']]);
    if (pull > 0 && fling <= 0) o = { ...o, armF: [0, 3.6], armB: [.05, 3.5], sq: .1 + .45 * ease(pull), rot: .12 };
    if (fling > 0 && fling < 1) o = { ...o, rot: .4 * fling, sq: -.3 };
    if (fling < 1 || t > L(24, 9.4)) {
      const PP = t > L(24, 9.4) ? [X4 + 330, MY + 160 + 60 * (1 - easeOut(seg(t, L(24, 9.4), L(24, 10.2))))] : P;
      genie(PP[0], PP[1], u, t, o, 'c5pip', null, null, 0);
    }
    if (fling > 0 && fling < 1) for (let i = 0; i < 4; i++) inkLine([[P[0] - 60 - i * 40, P[1] - 2.6 * u + (i - 1.5) * 26], [P[0] - 180 - i * 60, P[1] - 2.6 * u + (i - 1.5) * 40]], 2, PAL.ink, 'ink', 0);
    camEnd();
    if (lt < .25) flash(1 - lt / .25, PAL.ink);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E3B497', '#F6DCC8']);
  }

  // ================================ D · the side jobs (L25 – L33) ================================
  // (from thermo.js) where Pip's head top and mouth are, in world space (no rotation)
  const headOf = (x, y, u, o) => [x, y + (o.dy || 0) * u - (1 - (o.sq || 0)) * 5 * u];
  const mouthOf = (x, y, u, o) => { const d = o.flip ? -1 : 1, sq = o.sq || 0, fx = (o.turn ?? .4) * .38 * u; return [x + d * (1 + sq) * fx * 1.05, y + (o.dy || 0) * u - (1 - sq) * 2.55 * u]; };
  function cap(x, y, u, o, col, key, tilt = 0, off = 0) {          // a cap with a brim on Pip's head (janitor blue, conductor red)
    const [hx, hy] = headOf(x, y, u, o), d = o.flip ? -1 : 1; boilSeed('cap' + key);
    push(); translate(hx, hy - off * u); rotate(tilt + (o.rot || 0));
    paint(ellPts(d * .9 * u, .15 * u, 1.2 * u, .28 * u, 14), { wash: mixCol(col, PAL.ink, .25), ink: PAL.ink, sw: .9 });
    paint([...Array(13)].map((_, i) => { const a = Math.PI + i / 12 * Math.PI; return [Math.cos(a) * 1.25 * u, .2 * u + Math.sin(a) * .95 * u]; }), { wash: col, ink: PAL.ink, sw: 1 });
    paint(ellPts(0, -.72 * u, .18 * u, .14 * u, 8), { wash: mixCol(col, PAL.cream, .4), ink: PAL.ink, sw: .7 });
    pop();
  }
  function mop(hx, hy, u, key, ang = .15) {                        // a mop held at the hand point
    boilSeed('mop' + key);
    const b = [hx - Math.sin(ang) * 5.5 * u, hy + Math.cos(ang) * 5.5 * u];
    paint(ribbon([[hx + Math.sin(ang) * .8 * u, hy - Math.cos(ang) * .8 * u], b], .32 * u, .32 * u), { wash: '#C99A5E', ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 7; i++) { const a = -.6 + i * .2; inkLine([[b[0], b[1]], [b[0] + Math.sin(a) * 1.4 * u, b[1] + Math.cos(a) * 1.4 * u]], 3.2, '#B9B4B6', 'ink', .4); }
    paint(rrPts(b[0] - .7 * u, b[1] - .25 * u, 1.4 * u, .5 * u, .2 * u), { wash: '#6F7984', ink: PAL.ink, sw: .8 });
  }
  // SOD1: a dimer of two barrels; each has a silver zinc and a copper slot (cuK[i] 0 = empty dashed slot, 1 = copper in place)
  function sod(x, y, s, t, key, o = {}) {
    const cuK = o.cuK || [1, 1], mis = o.misfold || 0, cols = [o.col || '#E7C57A', mixCol(o.col || '#E7C57A', '#D8A85A', .5)];
    auditBox('sod', key, x - 150 * s, y - 120 * s, x + 150 * s, y + 120 * s);
    for (const [i, sd] of [[0, -1], [1, 1]]) {
      boilSeed('sod' + key + i);
      const cx = x + sd * 70 * s, P = []; for (let j = 0; j < 24; j++) { const a = j / 24 * TAU, lump = mis * .35 * Math.sin(a * 3 + i * 2 + hash(key.length) * 6); P.push([cx + Math.cos(a) * 68 * s * (1 + lump), y + Math.sin(a) * 96 * s * (1 + lump * .7)]); }
      paint(P, { wash: mixCol(cols[i], '#C9B8A0', mis * .6), fill: mixCol(cols[i], PAL.ink, .25), fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1, curv: .3 });
      if (mis < .5) for (let k = -2; k <= 2; k++) inkLine([[cx + k * 22 * s, y - 80 * s * Math.cos(k * .3)], [cx + k * 22 * s, y + 80 * s * Math.cos(k * .3)]], .8, mixCol(cols[i], PAL.ink, .35), 'inkfine', .3);
      const zp = [cx + sd * 24 * s, y + 30 * s], cp = [cx - sd * 4 * s, y - 40 * s];
      boilSeed('sodz' + key + i); paint(ellPts(zp[0], zp[1], 15 * s, 15 * s, 12), { wash: Z.zn, ink: PAL.ink, sw: .8 });
      if (cuK[i] < .98) { const P2 = ellPts(cp[0], cp[1], 19 * s, 19 * s, 16); for (let k = 0; k < 16; k += 2) inkLine([P2[k], P2[k + 1]], 1.2, PAL.ink, 'ink', 0); }
      if (cuK[i] > .02) cu(cp[0], cp[1], 17 * s * popK(cuK[i]), (o.state || [1, 1])[i], key + 'c' + i, .3 * (o.glow || 0));
    }
  }
  function catalase(x, y, s, key) {                                 // catalase: four round lobes around a heme
    boilSeed('ct' + key);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; paint(ellPts(x + Math.cos(a) * 34 * s, y + Math.sin(a) * 34 * s, 38 * s, 38 * s, 16), { wash: '#C99A86', fill: '#A0705C', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1 }); }
    heme(x, y, .55 * s, key + 'h');
  }
  function neuronMotor(x, y, s, t, key, dim = 0, droop = 0) {       // a motor neuron (a cell with a face) reaching a muscle
    const col = mixCol('#B7A6DA', '#9C9497', dim), dk = mixCol('#8C78B8', '#6E676B', dim);
    boilSeed('mn' + key);
    const A = []; for (let i = 0; i <= 8; i++) { const q = i / 8; A.push([x + 60 * s + q * 640 * s, y + 20 * s * Math.sin(q * 4 + t) + droop * 140 * s * q * q]); }
    paint(ribbon(A, 18 * s, 12 * s), { wash: col, ink: PAL.ink, sw: .9 });
    const E = A[8]; boilSeed('mus' + key);
    paint(ellPts(E[0] + 110 * s, E[1] + 10 * s + droop * 50 * s, 120 * s, 70 * s * (1 - .35 * droop), 22, 1), { wash: mixCol('#E7948F', '#C9BFC0', dim), fill: '#C46E68', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 5; i++) inkLine([[E[0] + (40 + i * 34) * s, E[1] - 45 * s + droop * 40 * s], [E[0] + (30 + i * 34) * s, E[1] + 60 * s + droop * 50 * s]], .8, '#B05A55', 'inkfine', .3);
    K.cell(x, y, 80 * s, col, dk, t, { key: 'mnc' + key, mood: dim > .5 ? 'sad' : 'calm', nucleus: false, seed: 3 });
  }
  function ceruloplasmin(x, y, s, t, key, o = {}) {                // a big sky-blue three-lobed protein with six copper beads
    const fade = o.fade || 0, col = mixCol('#8EC3E6', '#C9C4C6', fade);
    auditBox('cp', key, x - 200 * s, y - 180 * s, x + 200 * s, y + 170 * s);
    boilSeed('cp' + key);
    for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * TAU / 3; paint(ellPts(x + Math.cos(a) * 80 * s, y + Math.sin(a) * 80 * s, 110 * s, 92 * s, 22, 1, a), { wash: col, fill: mixCol('#4F8FC0', '#9C9497', fade), fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2 }); }
    const N = 6; for (let i = 0; i < N; i++) { const a = -Math.PI / 2 + i * TAU / N + .3, lit = o.lit ? clamp(o.lit - i) : 1; if (lit < .02 || fade > .95) continue;
      const p = [x + Math.cos(a) * 70 * s, y + Math.sin(a) * 70 * s]; cu(p[0], p[1], 16 * s * popK(lit) * (1 - fade), (o.state ? o.state(i) : 1), key + 'c' + i, .3 * lit * (1 - fade)); }
    return [x, y];
  }
  function transferrin(x, y, s, key, seats = 0, n3 = 2) {          // the "bus": a two-lobed peach protein with two iron seats; wheels for the joke
    boilSeed('tf' + key);
    for (const sd of [-1, 1]) paint(ellPts(x + sd * 70 * s, y, 84 * s, 64 * s, 20, 1), { wash: '#F2B98F', fill: '#D98F62', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1 });
    for (const sd of [-1, 1]) { boilSeed('tfw' + key + sd); paint(ellPts(x + sd * 90 * s, y + 66 * s, 22 * s, 22 * s, 12), { wash: '#4B4250', ink: PAL.ink, sw: .9 }); }
    for (let i = 0; i < n3; i++) { const sd = i ? 1 : -1; if (seats > i) feIon(x + sd * 70 * s, y - 10 * s, 22 * s, 3, key + 's' + i); else { boilSeed('tfs' + key + i); const P = ellPts(x + sd * 70 * s, y - 10 * s, 24 * s, 24 * s, 16); for (let k = 0; k < 16; k += 2) inkLine([P[k], P[k + 1]], 1.1, PAL.ink, 'ink', 0); } }
  }
  function rbc(x, y, r, key, pale = 0) {                           // a red blood cell, a biconcave disc seen side-on-ish
    boilSeed('rb' + key);
    paint(ellPts(x, y, r, r * .82, 18), { wash: mixCol('#D9564F', '#E8C2C0', pale), ink: PAL.ink, sw: .9 });
    paint(ellPts(x, y, r * .45, r * .32, 14), { wash: mixCol('#B23F3A', '#D9AAA8', pale), ink: null });
  }
  function bone(x, y, s, key) {                                     // a long bone silhouette
    boilSeed('bo' + key);
    paint(ribbon([[x - 110 * s, y], [x + 110 * s, y]], 34 * s, 34 * s), { wash: '#F4EAD6', ink: PAL.ink, sw: 1.1 });
    for (const sd of [-1, 1]) for (const v of [-1, 1]) paint(ellPts(x + sd * 120 * s, y + v * 22 * s, 30 * s, 26 * s, 14), { wash: '#F4EAD6', ink: PAL.ink, sw: 1.1 });
  }
  function sack(x, y, s, key, tip = 0) {                            // a sack of iron pills
    boilSeed('sk' + key);
    push(); translate(x, y); rotate(tip); scale(s);
    paint([[-50, 60], [50, 60], [62, -10], [30, -60], [-30, -60], [-62, -10]], { wash: '#C9A27A', fill: '#9E7650', fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.1, curv: .4 });
    inkLine([[-30, -50], [30, -50]], 2, '#6E4A2E', 'ink', .2);
    pop();
  }
  function collagen(x0, x1, y, t, key, sag = 0, col = '#F2D2C4') {  // a collagen rope: three twisted strands
    for (let j = 0; j < 3; j++) { const P = []; for (let i = 0; i <= 16; i++) { const q = i / 16; P.push([lerp(x0, x1, q), y + 10 * Math.sin(q * 18 + j * 2.1) + sag * 60 * Math.sin(q * Math.PI)]); }
      boilSeed('co' + key + j); paint(ribbon(P, 13, 13), { wash: mixCol(col, '#C98E7A', j * .25), ink: j === 1 ? PAL.ink : null, sw: .5 }); }
  }
  function elastin(x0, x1, y, t, key, sag = 0) {                    // an elastin spring
    const P = []; for (let i = 0; i <= 60; i++) { const q = i / 60; P.push([lerp(x0, x1, q) + 14 * Math.cos(q * 40), y + 14 * Math.sin(q * 40) + sag * 50 * Math.sin(q * Math.PI)]); }
    boilSeed('es' + key); inkLine(P, 2.6, '#D9B44A', 'ink', .6);
  }
  function piglet(x, y, s, t, key, xray = 0, bulge = 0) {           // a piglet side view, dot eye; xray shows the aorta as a red tube
    boilSeed('pg' + key);
    for (const [lx, ph] of [[-60, 0], [-30, 1.4], [40, .7], [70, 2.1]]) paint(ribbon([[x + lx * s, y + 30 * s], [x + (lx + 4 * Math.sin(t * 9 + ph)) * s, y + 85 * s]], 16 * s, 14 * s), { wash: '#E8A2A8', ink: PAL.ink, sw: .9 });
    paint(ellPts(x, y, 120 * s, 72 * s, 26, 1), { wash: '#F2B8BC', fill: '#D98C94', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(x + 120 * s, y - 20 * s, 54 * s, 46 * s, 18), { wash: '#F2B8BC', ink: PAL.ink, sw: 1.1 });
    paint(ellPts(x + 168 * s, y - 12 * s, 18 * s, 22 * s, 12), { wash: '#E8A2A8', ink: PAL.ink, sw: .9 });
    paint([[x + 100 * s, y - 56 * s], [x + 118 * s, y - 92 * s], [x + 132 * s, y - 58 * s]], { wash: '#E8A2A8', ink: PAL.ink, sw: .9 });
    paint(ellPts(x + 136 * s, y - 32 * s, 6 * s, 7 * s, 8), { wash: PAL.ink, ink: null });
    inkLine([[x - 120 * s, y - 10 * s], [x - 150 * s, y - 30 * s], [x - 140 * s, y - 50 * s], [x - 128 * s, y - 36 * s]], 1.6, PAL.ink, 'ink', .6);
    if (xray > .02) { boilSeed('pga' + key); const A = [[x + 60 * s, y - 10 * s], [x + 40 * s, y - 40 * s], [x, y - 36 * s], [x - 40 * s, y - 20 * s], [x - 90 * s, y - 10 * s]];
      paint(ellPts(x + 20 * s, y - 38 * s, 30 * s * bulge + 4, 26 * s * bulge + 4, 18), { wash: '#C4483F', washOp: 255 * xray, ink: bulge > .1 ? PAL.ink : null, sw: .8 });
      paint(ribbon(A, 14 * s, 12 * s), { wash: '#C4483F', washOp: 255 * xray, ink: PAL.ink, sw: .8 }); }
  }
  function balloon(x, y, r, key) {                                  // a red balloon at a mouth point (x, y), growing to the front
    if (r < 3) return; boilSeed('bn' + key);
    paint(ellPts(x + r * .9, y - r * .2, r, r * .9, 20), { wash: '#E2462E', ink: PAL.ink, sw: 1 });
    paint(ellPts(x + r * .6, y - r * .55, r * .2, r * .12, 10, 0, -.5), { wash: '#F7A090', ink: null });
  }

  // D1 · job 1: the cleaner (peach cytoplasm), then SOD1 and ALS (L25 – L27)
  const SOD = [1000, 520], RADS = [[420, 420], [560, 300], [380, 650], [700, 700], [640, 520], [300, 260]];
  function radPos(t, i) {                                             // superoxide i: leaks out of the mitochondrion, bounces around, is pulled into SOD1 (L26)
    const leak = L(25, 6.2 + i * .3), k = t - leak; if (k < 0) return null;
    const m = [230, 760], R = RADS[i];
    let p = k < .8 ? [lerp(m[0], R[0], easeOut(k / .8)), lerp(m[1], R[1], easeOut(k / .8))] : [R[0] + 70 * Math.sin((k - .8) * 2.3 + i), R[1] + 50 * Math.sin((k - .8) * 3.1 + i * 2)];
    const eat = L(26, 2.4 + Math.floor(i / 2) * .7), ke = seg(t, eat, eat + .5);
    if (ke >= 1) return null;
    if (ke > 0) p = [lerp(p[0], SOD[0] + (i % 2 ? 70 : -70), easeIn(ke)), lerp(p[1], SOD[1] - 40, easeIn(ke))];
    return p;
  }
  function shotD1(t, lt, dur) {
    K.setT(t);
    const cz = kf(t, [[0, [880, 560, 1.0]], [L(25, 8.6), [880, 560, 1.0]], [L(25, 9.6), [860, 560, 1.22]], [L(27, 4.4), [860, 560, 1.22]], [L(27, 5.2), [960, 560, 1.0]]], ease);
    camBegin(cz[0] + 6 * wob(t, .05), cz[1] + 4 * wob(t, .04), cz[2]);
    K.wash(K.C.cyto, t, { key: 'd1', blob: '#FBEBDD' });
    K.cytoplasm(t, { key: 'd1c', mito: false, er: [1500, 140] });
    K.motes(t, 14, mixCol(K.C.cytoDk, K.C.cyto, .3), { key: 'd1m' });
    const als = t > L(27, -.4);
    mito(230, 760, 2.4, -.3, 'd1mi', { cuK: 1 });
    // SOD1: Pip throws two Cu²⁺ into the empty slots (L26 +0.4, +1.3); each radical caught flips a copper
    const in1 = seg(t, L(26, .9), L(26, 1.2)), in2 = seg(t, L(26, 1.7), L(26, 2.0)), snapK = spring(t, L(26, 2.0), 5, 16);
    const st = [1, 1]; for (let i = 0; i < 6; i++) { const a = L(26, 2.4 + Math.floor(i / 2) * .7) + .5; st[i % 2] = Math.min(st[i % 2], 1 - pulseK(t, a, .6)); }
    if (t > L(25, 9.0)) { const k = popK(seg(t, L(25, 9.0), L(25, 9.5))); if (k > .05) sod(SOD[0], SOD[1] + 8 * snapK, 1.3 * k, t, 'd1s', { cuK: [t > L(26, 1.2) ? 1 : 0, t > L(26, 2.0) ? 1 : 0], state: st, glow: seg(t, L(26, 2.0), L(26, 2.6)) }); }
    for (const [a, tgt, i] of [[L(26, .4), [SOD[0] - 96, SOD[1] - 52], 0], [L(26, 1.2), [SOD[0] + 96, SOD[1] - 52], 1]]) { const k = seg(t, a, a + .8); if (k > 0 && k < 1) { const p = arcPt([600, 640], tgt, 260, ease(k)); cu(p[0], p[1], 22, 1, 'd1th' + i, 0); } }
    K.burst(SOD[0], SOD[1], 170, seg(t, L(26, 2.0), L(26, 2.5)), PAL.ink, 'd1swish');
    for (let i = 0; i < 6; i++) { const p = radPos(t, i); if (p) radical(p[0], p[1], 32, t + i, 'd1r' + i); }
    // products: O₂ + H₂O₂ pop out (L26 +5.0); catalase turns H₂O₂ into water and O₂ (+7.5 → +9.6)
    const outK = seg(t, L(26, 4.6), L(26, 5.6)), cat = seg(t, L(26, 7.3), L(26, 8.3)), done = seg(t, L(26, 9.4), L(26, 9.9));
    if (outK > 0 && !als) {
      o2(lerp(SOD[0], SOD[0] + 240, easeOut(outK)), lerp(SOD[1], SOD[1] - 220, easeOut(outK)), .9, t * .5, 'd1po');
      if (done <= 0) h2o2(lerp(SOD[0], SOD[0] + 300, easeOut(outK)), lerp(SOD[1], SOD[1] + 180, easeOut(outK)), 1.1, t * .4, 'd1ph');
      if (cat > 0) catalase(lerp(1800, SOD[0] + 430, easeOut(cat)), SOD[1] + 190, 1, 'd1cat');
      if (done > 0) { water(SOD[0] + 330 + 30 * done, SOD[1] + 120 - 40 * done, 1.2, 'd1w'); o2(SOD[0] + 330, SOD[1] + 260 + 40 * done, .8, .4, 'd1co'); for (let i = 0; i < 3; i++) K.sparkle(SOD[0] + 300 + i * 50, SOD[1] + 100 + i * 30, 26, seg(t, L(26, 9.6 + i * .2), L(26, 10.6 + i * .2)), PAL.cream); }
    }
    // L27: a misfolded SOD1 clumps with others; a motor neuron and its muscle droop
    if (als) {
      const mk = seg(t, L(27, .6), L(27, 1.6)), cl = ease(seg(t, L(27, 2.8), L(27, 4.6)));
      [[1250, 330], [1420, 470], [1160, 520]].forEach(([x, y], i) => { const k = popK(seg(t, L(27, .4 + i * .5), L(27, .8 + i * .5))); if (k > .05) sod(lerp(x, 1300 + (i - 1) * 90, cl), lerp(y, 440 + (i % 2) * 40, cl), .6 * k, t, 'd1m' + i, { misfold: Math.max(mk, i ? 1 : 0), col: '#D9C59A' }); });
      const nk = seg(t, L(27, 5.0), L(27, 5.6));
      if (nk > 0) { push(); translate(0, 400 * (1 - easeOut(nk))); neuronMotor(560, 880, 1, t, 'd1n', ease(seg(t, L(27, 5.6), L(27, 7.4))), ease(seg(t, L(27, 7.6), L(27, 9.6)))); pop(); }
    }
    // Pip the janitor
    const u = 30, P = als ? [380, 500] : kf(t, [[0, [520, 860]], [L(25, 5.4), [520, 860]], [L(26, -.6), [560, 820]]], ease);
    let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(25, 3.7), 'smug', { lookX: 1 }], [L(25, 6.4), 'wow', { lookX: -1, flip: true }], [L(25, 8.8), 'angry', { flip: true }],
      [L(26, .2), 'excited', { armF: [1.2, 3.2] }], [L(26, 2.2), 'laugh'], [L(26, 5.0), 'smug', { lookX: 1 }], [L(27, .4), 'worried', { lookX: 1 }], [L(27, 6.0), 'sad', { lookX: 1, lookY: .7 }]]);
    const throwK = Math.max(on(t, L(26, .2), L(26, .6), .1, .2), on(t, L(26, 1.0), L(26, 1.4), .1, .2));
    if (throwK > 0) o = { ...o, armF: [lerp(-.5, 1.4, throwK), 3.4] };
    if (!als && t < L(26, .1)) o = { ...o, armF: { at: [1.7, -2.6] }, armsFront: true };
    const [gx, gy] = genie(P[0], P[1], u, t, o, 'd1pip');
    const capOff = als ? ease(seg(t, L(27, 6.0), L(27, 6.6))) : 0, knock = spring(t, L(25, 11.0), 4, 12);
    if (capOff < 1) cap(gx, gy, u, o, '#5B8FD6', 'd1cap', .3 * knock - .4 * capOff, 1.4 * capOff);
    if (capOff >= 1) { const h = K.hand(gx, gy, u, [2.2, -3.6]); boilSeed('d1hc'); paint(ellPts(h[0], h[1], 1.1 * u, .7 * u, 14), { wash: '#5B8FD6', ink: PAL.ink, sw: 1 }); }
    if (!als && t < L(26, .1)) mop(...handPt(gx, gy, u, o), u, 'd1mop');
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E3B497', '#F6DCC8']);
    if (lt > dur - .25) { const k = (lt - (dur - .25)) / .25; for (let i = 0; i < 7; i++) inkLine([[W * (1 - k), 150 + i * 130], [W, 150 + i * 130]], 3 * k, PAL.cream, 'ink', 0); }
  }

  // D2 · job 2: the iron bus (blood plasma) (L28 – L30)
  const CP = [880, 470], STOP = [1240, 720];
  function shotD2(t, lt, dur) {
    K.setT(t);
    const pan = 1 - easeOut(seg(lt, 0, .45));
    camBegin(960 + 600 * pan + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    const noCu = ease(seg(t, L(30, .3), L(30, 1.5)));
    K.wash(mixCol('#F2C6C2', '#EADCDA', noCu * .5), t, { key: 'd2', blob: '#F9E1DE' });
    for (let i = 0; i < 9; i++) { if (noCu > .5 && i % 3) continue; rbc(frac(hash(i + 50) + t * .03 * (1 + hash(i))) * (W + 400) - 200, 120 + 860 * hash(i + 51), 40 + 14 * hash(i + 52), 'd2rb' + i, noCu); }
    // ceruloplasmin glides in (L28 +3.5), its six coppers light up (+8.2 → +10.2)
    const cpIn = easeOut(seg(t, L(28, 3.4), L(28, 5.0)));
    if (cpIn > 0) ceruloplasmin(lerp(-300, CP[0], cpIn), CP[1] + 8 * wob(t, .2), 1.1, t, 'd2cp', { lit: t < L(28, 8.0) ? 0 : 6 * seg(t, L(28, 8.0), L(28, 10.4)), fade: noCu, state: i => 1 - pulseK(t, L(29, .9 + (i % 3) * .55), .7) });
    if (cpIn > 0) K.burst(CP[0], CP[1], 230, seg(t, L(28, 6.6), L(28, 7.2)), PAL.ink, 'd2cpb');
    // Fe²⁺ come by, lose an electron to a copper (spark into the blue protein), become Fe³⁺, and board the bus
    const busIn = easeOut(seg(t, L(29, 4.3), L(29, 5.3))), busOut = easeIn(seg(t, L(29, 7.3), L(29, 9.0)));
    const bus = [lerp(2300, STOP[0], busIn) + 1400 * busOut, STOP[1]];
    const seats = (t > L(29, 6.2) ? 1 : 0) + (t > L(29, 6.8) ? 1 : 0);
    if (t < L(30, 0)) {
      transferrin(bus[0], bus[1] + 6 * Math.sin(t * 6) * (busOut > 0 ? 1 : 0), 1.1, 'd2tf', seats);
      for (let i = 0; i < 3; i++) { const a = L(29, i * .55), k = seg(t, a, a + .9), ox = seg(t, a + .9, a + 1.2), board = seg(t, L(29, 5.8 + i * .6), L(29, 6.3 + i * .6));
        if (k <= 0 || (i < 2 && board >= 1)) continue;
        const near_ = [CP[0] + 160 + i * 40, CP[1] + 90 + i * 60], wait = [STOP[0] - 280 - i * 70, STOP[1] - 10];
        let p = k < 1 ? [lerp(-200, near_[0], easeOut(k)), lerp(900, near_[1], easeOut(k))] : near_;
        if (ox >= 1) p = [lerp(near_[0], wait[0], ease(seg(t, a + 1.3, a + 2.2))), lerp(near_[1], wait[1], ease(seg(t, a + 1.3, a + 2.2)))];
        if (board > 0 && i < 2) p = arcPt(p, [bus[0] + (i ? 77 : -77), bus[1] - 11], 80, ease(board));
        if (i === 2 && t > L(29, 7.3)) p = [p[0] + 1400 * busOut, p[1]];
        if (i === 2 && busOut > 0) continue;
        feIon(p[0], p[1], 26, ox > .5 ? 3 : 2, 'd2fe' + i);
        if (ox > 0 && ox < 1) el(lerp(p[0], CP[0] + 60, ox), lerp(p[1], CP[1] + 40, ox), 9, 'd2ox' + i, .3); }
    }
    if (busOut > 0 || t > L(29, 7)) bone(lerp(2200, 1700, easeOut(seg(t, L(29, 7.0), L(29, 8.0)))), 900, 1.2, 'd2bone');
    // L30: no copper — the blue protein empties, Fe²⁺ pile up at the stop, Pip pours in more iron, nothing helps
    if (t > L(30, 0)) {
      transferrin(STOP[0] + 120, STOP[1], 1.1, 'd2tf2', 0);
      for (let i = 0; i < 9; i++) { const k = popK(seg(t, L(30, .6 + i * .12), L(30, 1.0 + i * .12))); if (k > .05) feIon(STOP[0] - 320 + (i % 4) * 56 + (Math.floor(i / 4) % 2) * 28, STOP[1] + 30 - Math.floor(i / 4) * 46, 26 * k, 2, 'd2st' + i); }
      for (let i = 0; i < 12; i++) { const a = L(30, 3.6 + i * .1), k = seg(t, a, a + .6); if (k <= 0) continue; const p = k < 1 ? arcPt([560, 560], [STOP[0] - 560 + (i % 6) * 40, STOP[1] + 60 - Math.floor(i / 6) * 40], 120, easeIn(k)) : [STOP[0] - 560 + (i % 6) * 40, STOP[1] + 60 - Math.floor(i / 6) * 40]; feIon(p[0], p[1], 20, 2, 'd2pill' + i); }
    }
    // Pip the conductor
    const u = 30, P = t < L(30, 0) ? kf(t, [[0, [380, 860]], [L(29, 3.6), [380, 860]], [L(29, 4.6), [600, 880]]], ease) : [440, 760];
    let o = K.act(t, [[0, 'happy', { lookX: 1 }], [L(28, 3.6), 'wow', { lookX: -1, flip: true }], [L(28, 8.0), 'love', { lookX: 1, lookY: -.6 }], [L(29, .4), 'calm', { lookX: 1 }],
      [L(29, 5.4), 'excited', { armF: [1.1, 3.4] }], [L(29, 7.4), 'wave', { lookX: 1 }], [L(30, .2), 'worried', { lookX: 1 }], [L(30, 3.4), 'strain', { armF: [.6, 3.4], armB: [.4, 3.2] }], [L(30, 5.4), 'worried', { armF: [.7, 2.6], armB: [.8, 2.4], blush: 1 }]]);
    const [gx, gy] = genie(P[0], P[1], u, t, o, 'd2pip');
    cap(gx, gy, u, o, '#C8463F', 'd2cap');
    if (on(t, L(29, 5.4), L(29, 6.8), .1, .1) > 0) { const m = mouthOf(gx, gy, u, o); boilSeed('d2wh'); paint(ellPts(m[0] + 10, m[1], 14, 9, 10), { wash: '#B9C2CC', ink: PAL.ink, sw: .8 }); pipEmote('note', m[0] + 50, m[1] - 40, 22, 1, 'd2nt'); }
    if (t > L(30, 3.2) && t < L(30, 5.4)) { const h = handPt(gx, gy, u, o); sack(h[0] + 40, h[1] - 10, 1, 'd2sack', -1.0 * seg(t, L(30, 3.3), L(30, 3.7))); }
    camEnd();
    if (lt < .45) for (let i = 0; i < 7; i++) inkLine([[0, 150 + i * 130], [W * (1 - lt / .45), 150 + i * 130]], 3 * (1 - lt / .45), PAL.cream, 'ink', 0);
    if (lt > dur - .25) { const k = (lt - (dur - .25)) / .25; for (let i = 0; i < 7; i++) inkLine([[W * (1 - k), 150 + i * 130], [W, 150 + i * 130]], 3 * k, PAL.cream, 'ink', 0); }
  }

  // D3 · job 3: knots, a vessel wall, and the 1960s piglet (L31 – L32)
  function shotD3(t, lt, dur) {
    K.setT(t);
    const farm = t > L(32, -.6);
    const pan = 1 - easeOut(seg(lt, 0, .45));
    if (farm) {
      camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
      K.wash('#EED9AE', t, { key: 'd3f', blob: '#F7EBCC' });
      boilSeed('d3g'); paint(rectPts(-300, 760, W + 600, 600), { wash: '#D9C17E', ink: null }); inkLine([[-300, 760], [W + 300, 760]], 1.2, '#B39A58', 'ink', .3);
      boilSeed('d3barn'); paint([[1380, 760], [1380, 420], [1560, 300], [1740, 420], [1740, 760]], { wash: '#C98E7A', fill: '#A86A58', fillOp: 40, tex: .5, ink: PAL.ink, sw: 1.1 });
      paint(rectPts(1500, 560, 120, 200), { wash: '#8C5E4E', ink: PAL.ink, sw: 1 });
      const walk = seg(t, L(32, .6), L(32, 3.0)), xr = ease(seg(t, L(32, 3.2), L(32, 3.9))), bulge = ease(seg(t, L(32, 6.0), L(32, 10.2)));
      piglet(lerp(1500, 1050, easeOut(walk)), 640 + (walk < 1 ? 6 * Math.abs(Math.sin(t * 9)) : 0), 1.3, t * (walk < 1 ? 1 : .2), 'd3pig', xr, bulge * 1.3);
      // Pip blows up a balloon in sympathy; it pops in its face (L32 +10.5)
      const u = 32, popT = L(32, 10.5);
      let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(32, 3.2), 'wow', { lookX: 1 }], [L(32, 6.0), 'strain', { armF: { at: [1.3, -2.4] }, armsFront: true }], [popT, 'wow', { emote: null }], [popT + 1.2, 'worried', { blush: 1 }]]);
      const blow = t > L(32, 6.0) && t < popT, soot = seg(t, popT, popT + .1) * (1 - seg(t, L(33, -1.4), L(33, -1.0)));
      if (blow) o = { ...o, sq: (o.sq || 0) + .08 * Math.sin(t * 7) };
      if (soot > 0 && t < popT + 1.2) o = { ...o, blink: frac((t - popT) / .6) < .15 ? 1 : 0 };
      const [gx, gy] = genie(560, 820, u, t, o, 'd3pip', null, SOOT, soot);
      const m = mouthOf(gx, gy, u, o);
      if (blow) balloon(m[0] + 6, m[1], 20 + 130 * ease(seg(t, L(32, 6.0), popT)) + 6 * Math.sin(t * 7), 'd3bal');
      K.burst(m[0] + 120, m[1], 200, seg(t, popT, popT + .4), PAL.ink, 'd3pop');
      for (let i = 0; i < 5; i++) { const k = seg(t, popT, popT + .8); if (k > 0 && k < 1) { boilSeed('d3sh' + i); paint(ellPts(m[0] + 100 + Math.cos(i * 1.3) * 220 * k, m[1] + Math.sin(i * 1.3) * 160 * k + 200 * k * k, 18, 9, 8, 0, i), { wash: '#E2462E', ink: PAL.ink, sw: .6 }); } }
      camEnd();
      flash(1 - seg(t, L(32, -.6), L(32, -.2)), PAL.cream);
      if (lt > dur - .25) { const k = (lt - (dur - .25)) / .25; for (let i = 0; i < 7; i++) inkLine([[W * (1 - k), 150 + i * 130], [W, 150 + i * 130]], 3 * k, PAL.cream, 'ink', 0); }
      return;
    }
    const wallK = ease(seg(t, L(31, 9.6), L(31, 10.8)));           // the fibres pull back into a vessel wall
    camBegin(960 + 600 * pan + 6 * wob(t, .05), 540 + 4 * wob(t, .04), lerp(1.0, .55, wallK));
    K.wash('#F6E9D8', t, { key: 'd3', blob: '#FBF3E8' });
    K.motes(t, 12, '#E6D3BC', { key: 'd3m' });
    const beat = pulse(t, 4) * (t > L(31, 10.4) ? 1 : 0), bridges = seg(t, L(31, 5.6), L(31, 9.6));
    const rows = [[300, 'c'], [400, 'e'], [500, 'c'], [600, 'e'], [700, 'c']];
    if (wallK > .01) { boilSeed('d3ves'); paint(rectPts(-1400, 160 - 60 * beat, W + 2800, 680 + 120 * beat), { wash: '#E9B1A6', washOp: 255 * wallK, ink: null }); boilSeed('d3lum'); paint(rectPts(-1400, 920 + 60 * beat, W + 2800, 800), { wash: '#C4483F', washOp: 255 * wallK, ink: PAL.ink, sw: 1.2 }); for (let i = 0; i < 6; i++) rbc(frac(hash(i) + t * .08) * 3600 - 800, 1150 + 120 * hash(i + 1) + 60 * beat, 50, 'd3rb' + i); }
    const sag = (1 - ease(bridges)) * .6;
    const fx0 = wallK > .01 ? -1400 : -100, fx1 = wallK > .01 ? 3400 : 2020;
    rows.forEach(([y, kind], i) => { const yy = y + (i - 2) * 30 * beat; if (kind === 'c') collagen(fx0, fx1, yy, t, 'd3c' + i, sag * (1 + .3 * hash(i))); else elastin(fx0, fx1, yy, t, 'd3e' + i, sag * (1 + .3 * hash(i))); });
    // the lysyl oxidase zips along (Pip rides it), stapling bridges between neighbouring fibres
    const zip = seg(t, L(31, 3.0), L(31, 9.6)), lx = lerp(-200, 2100, zip), ly = 450 + 100 * Math.sin(zip * TAU * 3);
    for (let i = 0; i < 24; i++) { const bx = -40 + i * 90, row = i % 4, k = popK(seg(lx, bx, bx + 60) * 1); if (k < .05) continue; const y0 = rows[row][0] + (row - 2) * 30 * beat, y1 = rows[row + 1][0] + (row - 1) * 30 * beat; boilSeed('d3br' + i); inkLine([[bx, y0 + 10], [bx, lerp(y0 + 10, y1 - 10, k)]], 3, Z.cuDk, 'ink', 0); inkLine([[bx - 8, (y0 + y1) / 2], [bx + 8, (y0 + y1) / 2]], 2, Z.cuDk, 'ink', 0); }
    const u = 28;
    if (zip > 0 && zip < 1) { boilSeed('d3lox'); paint(ellPts(lx, ly + 40, 60, 34, 16), { wash: '#F2A58A', fill: '#D9785A', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 }); cu(lx + 30, ly + 30, 13, 0, 'd3loxc', .3);
      for (let i = 0; i < 3; i++) inkLine([[lx - 80 - i * 40, ly + 30 + (i - 1) * 16], [lx - 160 - i * 50, ly + 30 + (i - 1) * 16]], 2, PAL.ink, 'ink', 0); }
    let o = K.act(t, [[0, 'calm', { lookX: 1, lookY: .4 }], [L(31, 2.8), 'excited', { armF: [.9, 3.2], armB: [.5, 3.0] }], [L(31, 9.8), 'happy'], [L(31, 11.8), 'laugh']]);
    let P = [420, 860];
    if (zip > 0 && zip < 1) P = [lx - 10, ly + 10];
    if (zip >= 1) {                                                 // Pip bounces on the beating wall like a trampoline
      const z = lerp(1, .55, wallK), uu = u / z, top = 160 - 60 * beat, hop = Math.abs(Math.sin((t - L(31, 10.4)) * Math.PI / BEAT)) * seg(t, L(31, 10.4), L(31, 10.8));
      pip(960, lerp(860, top - hop * 2.4 * uu, wallK), uu, { ...o, sq: (o.sq || 0) + (.3 * (1 - hop) - .15 * hop) * wallK, key: 'd3pipT', noShadow: true });
    } else genie(P[0], P[1], u, t, o, 'd3pip');
    camEnd();
    if (lt < .45) for (let i = 0; i < 7; i++) inkLine([[0, 150 + i * 130], [W * (1 - lt / .45), 150 + i * 130]], 3 * (1 - lt / .45), PAL.cream, 'ink', 0);
    flash(seg(t, L(32, -.9), L(32, -.6)), PAL.cream);
  }

  // D4 · job 4: colour and signals (L33), no Pip
  function shotD4(t, lt, dur) {
    K.setT(t);
    const pan = 1 - easeOut(seg(lt, 0, .45));
    camBegin(960 + 600 * pan + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    boilSeed('d4l'); paint(rectPts(-800, -300, 1760, 1700), { wash: '#F0D4B4', ink: null });
    boilSeed('d4r'); paint(rectPts(960, -300, 1800, 1700), { wash: '#E2DCF0', ink: null });
    inkLine([[960, -100], [960, 1200]], 1.4, mixCol('#E2DCF0', PAL.ink, .3), 'ink', 0);
    K.motes(t, 10, '#DDBB96', { key: 'd4m' });
    // left: a melanocyte with a copper enzyme turning pale tyrosine into dark melanin, which flows up a hair
    const mk = seg(t, L(33, 3.6), L(33, 7.4)), hairDark = ease(seg(t, L(33, 5.6), L(33, 8.0)));
    boilSeed('d4hair'); const HP = []; for (let i = 0; i <= 8; i++) HP.push([500 + 40 * Math.sin(i * .7 + t * .6) * i / 8, 640 - i * 80]);
    paint(ribbon(HP, 34, 18), { wash: mixCol('#E8D8B8', '#4A3428', hairDark), ink: PAL.ink, sw: 1 });
    K.cell(500, 740, 130, '#E9C29A', '#C9986A', t, { key: 'd4mc', mood: hairDark > .5 ? 'happy' : 'calm', nucleus: false });
    boilSeed('d4ty'); paint(ellPts(330, 480, 56, 40, 16), { wash: '#F2A58A', fill: '#D9785A', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 });
    cu(312, 470, 12, 0, 'd4t1', .3); cu(348, 470, 12, 0, 'd4t2', .3);
    for (let i = 0; i < 8; i++) { const a = L(33, 3.8 + i * .35), k = seg(t, a, a + 1.6); if (k <= 0 || k >= 1) continue;
      const p = k < .4 ? [lerp(150, 330, k / .4), lerp(620, 480, k / .4)] : arcPt([330, 480], [500 + 10 * Math.sin(i), 560 - (k - .4) / .6 * 300], 40, (k - .4) / .6);
      boilSeed('d4g' + i); paint(ellPts(p[0], p[1], 10, 8, 8), { wash: k < .4 ? '#F2E2A8' : '#4A3428', ink: PAL.ink, sw: .6 }); }
    // right: a neuron terminal; dopamine beads pass a copper enzyme and come out as noradrenaline; the neuron fires
    const fire = seg(t, L(33, 11.0), L(33, 12.4));
    boilSeed('d4ax'); paint(ribbon([[1500, -100], [1480, 300], [1420, 520]], 40, 50), { wash: '#B7A6DA', ink: PAL.ink, sw: 1 });
    paint(ellPts(1420, 640, 170, 130, 24, 1), { wash: '#B7A6DA', fill: '#8C78B8', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2 });
    if (fire > 0 && fire < 1) { const p = [lerp(1500, 1420, fire), lerp(-80, 520, fire)]; glow(p[0], p[1], 90, '#FFE08A', 1); el(p[0], p[1], 14, 'd4sp', .5); }
    boilSeed('d4dbh'); paint(ellPts(1420, 640, 56, 40, 16), { wash: '#F2D08A', fill: '#D9A84A', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 });
    cu(1404, 630, 12, 0, 'd4d1', .3); cu(1440, 630, 12, 0, 'd4d2', .3);
    for (let i = 0; i < 8; i++) { const a = L(33, 8.3 + i * .3), k = seg(t, a, a + 1.6); if (k <= 0) continue; const done_ = k >= 1;
      const p = done_ ? [1340 + (i % 4) * 50, 740 + Math.floor(i / 4) * 40] : k < .5 ? [lerp(1250, 1420, k / .5), lerp(560, 640, k / .5)] : [lerp(1420, 1340 + (i % 4) * 50, (k - .5) / .5), lerp(640, 740 + Math.floor(i / 4) * 40, (k - .5) / .5)];
      boilSeed('d4b' + i); paint(ellPts(p[0], p[1], 11, 11, 10), { wash: k < .5 ? '#9CCB7A' : '#F0A35E', ink: PAL.ink, sw: .6 }); }
    if (fire >= 1) for (let i = 0; i < 8; i++) { const k = seg(t, L(33, 12.4), L(33, 13.4)); if (k < 1) { boilSeed('d4rel' + i); paint(ellPts(1340 + (i % 4) * 50, 790 + Math.floor(i / 4) * 40 + 240 * k, 11, 11, 10), { wash: '#F0A35E', ink: PAL.ink, sw: .6 }); } }
    camEnd();
    if (lt < .45) for (let i = 0; i < 7; i++) inkLine([[0, 150 + i * 130], [W * (1 - lt / .45), 150 + i * 130]], 3 * (1 - lt / .45), PAL.cream, 'ink', 0);
    flash(seg(t, L(34, -.9), L(34, -.5)), PAL.cream);
  }

  // R1 · recap 1 (cream board, no Pip): one bead, six jobs, one trick
  function recapIcon(i, x, y, k, t) {
    if (k < .05) return; const s = popK(k);
    push(); translate(x, y); scale(s); translate(-x, -y);
    boilSeed('ri' + i); paint(ellPts(x, y, 92, 92, 26), { wash: PAL.cream, ink: PAL.ink, sw: 1.2 });
    if (i === 0) { o2(x - 36, y, .8, 0, 'ri0'); inkLine([[x - 6, y], [x + 14, y]], 2, PAL.ink, 'ink', 0); water(x + 40, y + 6, 1, 'ri0w'); }
    if (i === 1) { radical(x - 30, y - 10, 24, t, 'ri1'); mop(x + 30, y - 50, 18, 'ri1m', .4); }
    if (i === 2) { transferrin(x, y + 10, .45, 'ri2', 2); }
    if (i === 3) { collagen(x - 70, x + 70, y - 22, t, 'ri3a'); collagen(x - 70, x + 70, y + 22, t, 'ri3b'); for (let j = 0; j < 3; j++) inkLine([[x - 40 + j * 40, y - 14], [x - 40 + j * 40, y + 14]], 3, Z.cuDk, 'ink', 0); }
    if (i === 4) { boilSeed('ri4'); const P = []; for (let j = 0; j < 22; j++) { const a = j / 22 * TAU, w = Math.sin(a / 2); P.push([x + Math.sin(a) * 30 * (.35 + .65 * w), y - Math.cos(a) * 40 + 18 * w]); } paint(P, { wash: '#4A3428', ink: PAL.ink, sw: 1, curv: .4 }); }
    if (i === 5) { boilSeed('ri5'); paint(ellPts(x, y + 10, 40, 30, 14), { wash: '#B7A6DA', ink: PAL.ink, sw: 1 }); for (let j = 0; j < 4; j++) { const a = -2.4 + j * .55; inkLine([[x + Math.cos(a) * 36, y + 10 + Math.sin(a) * 26], [x + Math.cos(a) * 70, y + 10 + Math.sin(a) * 56]], 3, '#8C78B8', 'ink', .4); } }
    pop();
  }
  function shotR1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0 + .01 * lt);
    const dark = ease(seg(t, L(35, -1.2), L(35, -.2)));
    board(t, 'r1', mixCol(Z.board, '#5E2A48', dark));
    const C = [960, 540], keys = [1.6, 2.6, 4.0, 5.2, 6.4, 7.4], R = 340, lines = seg(t, L(34, 11.0), L(34, 12.6));
    keys.forEach((a, i) => { const ang = -Math.PI / 2 + i * TAU / 6, p = [C[0] + Math.cos(ang) * R * 1.25, C[1] + Math.sin(ang) * R * .82];
      if (lines > 0) { const q = clamp(lines * 1.4 - i * .08); boilSeed('r1l' + i); inkLine([[C[0] + Math.cos(ang) * 90, C[1] + Math.sin(ang) * 90], [lerp(C[0], p[0], q * .85), lerp(C[1], p[1], q * .85)]], 2.4, Z.cuDk, 'ink', 0); }
      const sp = frac((t - L(34, 13.1)) * .9 + i * .13); if (t > L(34, 13.1)) el(lerp(C[0], p[0], sp), lerp(C[1], p[1], sp), 11, 'r1e' + i, .4);
      recapIcon(i, p[0], p[1] + 6 * wob(t, .4, i) * seg(t, L(34, 9.0), L(34, 10.4)), seg(t, L(34, a), L(34, a + .4)), t); });
    cu(C[0], C[1], 80 * popK(seg(t, L(34, .2), L(34, .7))) * (1 + .06 * pulse(t, 5)), t > L(34, 13.1) ? .5 - .5 * Math.cos((t - L(34, 13.1)) * 4) : 0, 'r1cu', .3);
    camEnd();
    flash(1 - seg(lt, 0, .5), PAL.cream);
  }

  // ================================ E · the danger, and the escorts (L35 – L43) ================================
  function helix(x0, x1, y, t, key, cut = -1, cutK = 0) {          // a short DNA double helix; cut = x of a snip, cutK opens it
    for (const ph of [0, Math.PI]) { const P = [], Q = []; for (let i = 0; i <= 30; i++) { const x = lerp(x0, x1, i / 30), dx = cut > 0 && x > cut ? 30 * cutK : cut > 0 ? -30 * cutK : 0, pt = [x + dx, y + 34 * Math.sin(x / 60 + ph + t * .5) + (cut > 0 ? (x > cut ? 1 : -1) * 20 * cutK * Math.exp(-Math.abs(x - cut) / 80) : 0)]; (cut > 0 && x > cut ? Q : P).push(pt); }
      boilSeed('hx' + key + ph); if (P.length > 1) paint(ribbon(P, 9, 9), { wash: ph ? '#5B8FD6' : '#E27A92', ink: PAL.ink, sw: .7 }); if (Q.length > 1) paint(ribbon(Q, 9, 9), { wash: ph ? '#5B8FD6' : '#E27A92', ink: PAL.ink, sw: .7 }); }
    for (let i = 0; i < 12; i++) { const x = lerp(x0, x1, (i + .5) / 12); if (cut > 0 && Math.abs(x - cut) < 40 && cutK > .1) continue; const a = 34 * Math.sin(x / 60 + t * .5); inkLine([[x, y + a], [x, y - a]], 2, '#C9A27A', 'ink', 0); }
  }
  // a copper chaperone: a lavender claw with yellow sulfur fingertips; returns the hold point (where a bead sits)
  function chap(x, y, s, ang, key, o = {}) {
    boilSeed('cp' + key);
    const hi = o.hi || 0, open = o.open || 0, col = mixCol(Z.chap, '#C9B6EA', hi * .5);
    push(); translate(x, y); rotate(ang); scale(s);
    paint(ellPts(-20, 0, 38, 32, 18, 1), { wash: col, fill: Z.chapDk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 });
    for (const sd of [-1, 1]) paint(ribbon([[0, sd * 16], [42, sd * (40 + 10 * open)], [80, sd * (34 + 12 * open)], [92, sd * (17 + 12 * open)]], 20, 11), { wash: col, ink: PAL.ink, sw: 1, curv: .5 });
    const tips = [[90, -17 - 12 * open, 'c'], [90, 17 + 12 * open, 'm']];
    for (const [a, b, kind] of tips) { const g = (o.tipHi || {})[kind] || 0; if (g > .02) glow(a, b, 30, '#FFE08A', g); paint(kind === 'c' ? ellPts(a, b, 11 * (1 + .4 * g), 11 * (1 + .4 * g), 10) : ellPts(a, b, 15 * (1 + .3 * g), 8 * (1 + .3 * g), 10, 0, .3), { wash: Z.sulf, ink: PAL.ink, sw: .8 }); }
    pop();
    return [x + Math.cos(ang) * 74 * s, y + Math.sin(ang) * 74 * s];
  }
  // (from thermo.js channel) CTR1, a funnel through the membrane; open 0..1
  function ctr1(x, y, s, open, key) {
    const col = '#93B8A0', dk = '#5F8C70', g = lerp(2, 22, ease(open)) * s;
    auditBox('channel', key, x - 90 * s, y - 70 * s, x + 90 * s, y + 140 * s);
    for (const sd of [-1, 1]) {
      boilSeed('ctr' + key + sd);
      push(); translate(x + sd * g, y + 50 * s); rotate(sd * .1 * ease(open)); translate(0, -50 * s);
      const P = [[0, -58 * s], [sd * 22 * s, -66 * s], [sd * 52 * s, -56 * s], [sd * 56 * s, -10 * s], [sd * 52 * s, 50 * s], [sd * 14 * s, 58 * s], [0, 46 * s], [-sd * 4 * s, 4 * s]];
      paint(P, { wash: col, fill: dk, fillOp: 55, tex: .5, ink: PAL.ink, sw: 1.1, curv: .35 });
      pop();
    }
  }
  function golgi(x, y, s, key) {                                    // a Golgi stack: four curved cisternae
    for (let i = 0; i < 4; i++) { const P = []; for (let j = 0; j <= 10; j++) { const q = j / 10; P.push([x + (q - .5) * (360 - i * 40) * s, y + (i * 46 - 40 * Math.sin(q * Math.PI)) * s]); }
      boilSeed('go' + key + i); paint(ribbon(P, 30 * s, 30 * s), { wash: K.C.golgi, fill: K.C.golgiDk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 }); }
  }
  function pump7(x, y, s, col, key, o = {}) {                       // ATP7A / ATP7B: a P-type pump, membrane part + a big cytosolic head
    boilSeed('p7' + key);
    const dk = mixCol(col, PAL.ink, .3);
    paint(rrPts(x - 34 * s, y - 40 * s, 68 * s, 80 * s, 16 * s), { wash: col, fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 });
    paint(ellPts(x, y + 70 * s, 56 * s, 40 * s, 18, 1), { wash: mixCol(col, PAL.cream, .25), fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 });
    if (o.wheels) for (const sd of [-1, 1]) { boilSeed('p7w' + key + sd); paint(ellPts(x + sd * 40 * s, y + 116 * s, 15 * s, 15 * s, 12), { wash: '#4B4250', ink: PAL.ink, sw: .9 }); }
    if (o.ves) { const P = ellPts(x, y + 30 * s, 110 * s, 110 * s, 30); inkLine(P.concat([P[0], P[1]]), 1.4, mixCol(K.C.phos, PAL.ink, .2), 'ink', .5); }
  }
  function mtCage(x, y, s, key, k = 1) {                            // metallothionein: a small blob wrapped round copper, sulfur dots
    if (k < .05) return; boilSeed('mt' + key);
    paint(ellPts(x, y, 40 * s * k, 32 * s * k, 16, 1), { wash: '#C9D8A0', fill: '#97A86A', fillOp: 40, tex: .4, ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; paint(ellPts(x + Math.cos(a) * 26 * s * k, y + Math.sin(a) * 20 * s * k, 4.5 * s, 4.5 * s, 6), { wash: Z.sulf, ink: null }); }
    cu(x, y, 12 * s * k, 0, key + 'c', 0, 0);
  }
  function gsh(x, y, s, key, ang = 0) {                             // glutathione: three linked beads (Glu, Cys with a yellow sulfur, Gly)
    boilSeed('gs' + key);
    const pts = [-1, 0, 1].map(i => [x + Math.cos(ang) * i * 22 * s, y + Math.sin(ang) * i * 22 * s]);
    inkLine(pts, 2, PAL.ink, 'ink', 0);
    pts.forEach((p, i) => paint(ellPts(p[0], p[1], 12 * s, 12 * s, 10), { wash: ['#E7B7D3', Z.sulf, '#B9D99A'][i], ink: PAL.ink, sw: .7 }));
  }
  function safe(x, y, s, door, dial, key) {                         // a grey safe; door 0..1 (1 = shut), dial angle
    boilSeed('sf' + key);
    paint(rrPts(x - 120 * s, y - 120 * s, 240 * s, 240 * s, 18 * s), { wash: '#8C96A3', fill: '#5E6672', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.3 });
    paint(rrPts(x - 96 * s, y - 96 * s, 192 * s, 192 * s, 12 * s), { wash: '#4B4250', ink: PAL.ink, sw: 1 });
    const w = 192 * s * clamp(door);
    if (w > 4) { paint(rrPts(x - 96 * s, y - 96 * s, w, 192 * s, 12 * s), { wash: '#A9B2BC', ink: PAL.ink, sw: 1.1 });
      if (door > .7) { const c = [x - 96 * s + w * .55, y]; paint(ellPts(c[0], c[1], 34 * s, 34 * s, 18), { wash: '#C9D0D8', ink: PAL.ink, sw: 1 }); for (let i = 0; i < 8; i++) { const a = dial + i / 8 * TAU; inkLine([[c[0] + Math.cos(a) * 24 * s, c[1] + Math.sin(a) * 24 * s], [c[0] + Math.cos(a) * 31 * s, c[1] + Math.sin(a) * 31 * s]], 1.2, PAL.ink, 'ink', 0); } inkLine([[c[0], c[1]], [c[0] + Math.cos(dial) * 18 * s, c[1] + Math.sin(dial) * 18 * s]], 2.4, Z.cuDk, 'ink', 0); } }
  }

  // E1 · a loose copper meets H₂O₂ (L35 – L36), then the search for free copper in a yeast cell (L37)
  function shotE1(t, lt, dur) {
    K.setT(t);
    if (t < L(37, -.4)) {
      camBegin(1000 + 6 * wob(t, .05) + shakeXY(t, 14)[0] * near(t, L(35, 7.8), .3), 560 + 4 * wob(t, .04) + shakeXY(t, 14)[1] * near(t, L(35, 7.8), .3), 1.1);
      K.wash('#5E2A48', t, { key: 'e1', blob: '#7A3A60' });
      K.motes(t, 16, '#8E4E74', { key: 'e1m' });
      const boom = L(35, 7.8), again = L(36, 11.4);
      // the things the radical will wreck: DNA, a membrane patch, a protein
      const cutK = ease(seg(t, L(36, 3.0), L(36, 3.4))), holeK = ease(seg(t, L(36, 4.1), L(36, 4.5))), biteK = ease(seg(t, L(36, 5.1), L(36, 5.5)));
      helix(1000, 1500, 230, t, 'e1dna', 1250, cutK);
      const Tk = K.track([[1050, 860], [1700, 860]]); K.bilayer(Tk, 1.4, { key: 'e1mem', gap: holeK > .1 ? [260, 260 + 120 * holeK] : null });
      boilSeed('e1prot'); const PP = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, bite = biteK * Math.exp(-Math.pow((a - 1.0) / .35, 2)); PP.push([1650 + Math.cos(a) * 110 * (1 - .5 * bite), 520 + Math.sin(a) * 80 * (1 - .5 * bite)]); }
      paint(PP, { wash: '#B9D99A', fill: '#7FA05A', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1, curv: .3 });
      // H₂O₂ idling; the fumbled Cu⁺ rolls into it: BOOM
      const HP = [1000, 640], fumble = L(35, 3.4), roll = seg(t, fumble + .3, L(35, 7.6));
      if (t < boom) h2o2(HP[0] + 10 * wob(t, .4), HP[1] + 8 * wob(t, .3), 2.3, .3 + .1 * wob(t, .2), 'e1hp');
      let cuP = null, cuS = 0;
      const u = 32, P = [520, 760];
      if (t < fumble) { const toss = Math.abs(Math.sin((t - L(35, -.2)) * Math.PI / (BEAT * 1.5))); cuP = [P[0] + 3.2 * u, P[1] - 4.2 * u - 120 * toss]; }
      else if (t < boom) cuP = roll <= 0 ? arcPt([P[0] + 3.2 * u, P[1] - 4.2 * u], [P[0] + 200, P[1] + 40], 120, seg(t, fumble, fumble + .3)) : [lerp(P[0] + 200, HP[0] - 40, ease(roll)), P[1] + 40 - 120 * Math.abs(Math.sin(roll * Math.PI * 3)) * (1 - roll)];
      else { cuS = 1 - pulseK(t, L(36, 9.0), 2.2) * (t < L(36, 10.6) ? 1 : 0); if (t > L(36, 10.0)) cuS = t < again ? 0 : 1; cuP = [HP[0] - 40 + 60 * seg(t, boom, boom + .5), HP[1] - 20]; }
      if (cuP) cu(cuP[0], cuP[1], 32, cuS, 'e1cu', .5);
      flash(.8 * (1 - seg(t, boom, boom + .35)) * (t > boom ? 1 : 0), '#FFE7C2');
      K.burst(HP[0], HP[1], 260, seg(t, boom, boom + .6), '#FFE7C2', 'e1boom');
      K.burst(HP[0], HP[1], 160, seg(t, again, again + .5), '#FFE7C2', 'e1boom2');
      // the hydroxyl radical rampages: DNA (+3.0), membrane (+4.1), protein (+5.1), then circles back for more
      if (t > boom) {
        const path = [[HP[0] + 40, HP[1] - 60], [1250, 230], [1300, 860], [1600, 560], [1400, 420], [1250, 600], [HP[0] + 120, HP[1] - 40]], times = [boom + .3, L(36, 3.0), L(36, 4.1), L(36, 5.1), L(36, 6.6), L(36, 8.0), L(36, 11.0)];
        let i = 0; while (i < times.length - 2 && t > times[i + 1]) i++;
        const q = ease(seg(t, times[i], times[i + 1])), p = [lerp(path[i][0], path[i + 1][0], q), lerp(path[i][1], path[i + 1][1], q) - 50 * Math.sin(q * Math.PI)];
        radical(p[0], p[1], 84 * popK(seg(t, boom, boom + .4)) * (1 + .1 * Math.sin(t * 20)), t, 'e1oh', 1);
        [L(36, 3.0), L(36, 4.1), L(36, 5.1)].forEach((a, j) => K.burst(path[j + 1][0], path[j + 1][1], 90, seg(t, a, a + .4), '#FFE7C2', 'e1hit' + j));
        if (t > again) radical(HP[0] + 60 + 200 * seg(t, again, again + 1.5), HP[1] - 100 - 150 * seg(t, again, again + 1.5), 50 * popK(seg(t, again, again + .4)), t, 'e1oh2', 1);
      }
      // the green helper (an antioxidant like vitamin C) gives the spent copper an electron back (L36 +8.4)
      const hk = seg(t, L(36, 8.2), L(36, 9.0));
      if (hk > 0 && t < L(36, 10.6)) { const gp = [lerp(700, HP[0] - 90, easeOut(hk)), HP[1] + 60]; boilSeed('e1vc'); paint(ellPts(gp[0], gp[1], 22, 22, 12), { wash: '#8CCB6A', ink: PAL.ink, sw: .9 });
        const ek = seg(t, L(36, 8.8), L(36, 9.3)); if (ek > 0 && ek < 1) el(lerp(gp[0], cuP[0], ek), lerp(gp[1], cuP[1], ek), 10, 'e1vce', .5); }
      if (t > L(36, 9.6)) { const a = (t - L(36, 9.6)) * 3; boilSeed('e1loop'); const C0 = [HP[0] - 20, HP[1] - 20], LP = []; for (let i = 0; i <= 14; i++) { const q = a + i / 14 * 4.2; LP.push([C0[0] + Math.cos(q) * 110, C0[1] + Math.sin(q) * 80]); } inkLine(LP, 2.4, '#FFE7C2', 'ink', .6); }
      if (t > again - .6 && t < again) h2o2(HP[0] + 60, HP[1] - 40, 1.4 * popK(seg(t, again - .6, again - .3)), .5, 'e1hp2');
      // Pip juggles, whistling, fumbles, gets blackened by the boom, coughs smoke
      const soot = seg(t, boom, boom + .1);
      let o = K.act(t, [[0, 'sing', { lookY: -1 }], [fumble, 'wow', { lookX: 1, lookY: .4 }], [L(35, 5.2), 'worried', { lookX: 1 }], [boom, 'wow', { emote: null }], [boom + 1.6, 'dizzy'], [L(36, 2.6), 'worried', { lookX: 1 }], [L(36, 8.0), 'confused', { lookX: 1 }], [again, 'wow', { take: 1.3 }]]);
      if (t < fumble) o = { ...o, armF: [1.2, 3.2] };
      if (t > boom && t < boom + 1.6) o = { ...o, blink: frac((t - boom) / .55) < .15 ? 1 : 0 };
      const [gx, gy] = genie(P[0], P[1] + 40 * (1 - seg(t, boom, boom + .5)) * (t > boom ? 1 : 0), u, t, o, 'e1pip', null, SOOT, soot);
      if (t > boom) for (let i = 0; i < 3; i++) { const ph = frac(t * .8 + i / 3); puff(gx + (i - 1) * 24, gy - 6.6 * u - ph * 90, 16 + 16 * ph, 1 - ph, 'e1sm' + i, '#8E8790'); }
      camEnd();
      if (lt < .3) flash(1 - lt / .3, '#5E2A48');
      flash(seg(t, L(37, -.8), L(37, -.4)), '#E6E0F2');
      return;
    }
    // L37: lavender cytoplasm, a yeast cell; every copper in it is held by a protein; Pip searches with a magnifier
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    K.wash('#E6E0F2', t, { key: 'e1y', blob: '#F2EEFA' });
    K.motes(t, 12, '#CFC6E6', { key: 'e1ym' });
    const YC = [1150, 540];
    boilSeed('e1bud'); paint(ellPts(YC[0] + 330, YC[1] - 210, 110, 96, 20, 1), { wash: '#F2DEB0', fill: '#D9B878', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1 });
    const held = [[1000, 380], [1250, 330], [1350, 560], [1180, 720], [950, 650], [1080, 520], [1400, 420], [880, 500]];
    K.cell(YC[0], YC[1], 330, '#F2DEB0', '#D9B878', t, { key: 'e1yc', rx: 1.2, mood: t > L(37, 10.4) ? 'happy' : 'calm', nucleus: false, fx: -.55,
      extras: () => held.forEach(([x, y], i) => { const hp = chap(x - 64 * Math.cos(i), y - 64 * Math.sin(i), .55, i, 'e1ch' + i, { hi: pulseK(t, L(37, 6.6 + i * .35), .5) }); cu(hp[0], hp[1], 11, 0, 'e1hc' + i, 0, 0); }) });
    const u = 30, sweep = seg(t, L(37, 4.0), L(37, 9.6)), mx = lerp(900, 1420, sweep), my = 520 + 160 * Math.sin(sweep * TAU * 1.2);
    let o = K.act(t, [[L(37, -.4), 'calm', { lookX: 1 }], [L(37, 4.0), 'confused', { lookX: 1 }], [L(37, 10.0), 'wink', { lookX: 0, lookY: 0 }]]);
    const look = sweep > 0 && sweep < 1;
    const P = look ? [mx - 260, my + 250] : [470, 780];
    if (look) o = { ...o, armF: [.5, 3.6] };
    if (t > L(37, 10.0)) o = { ...o, armF: [.9, 3.0] };
    const [gx, gy] = genie(P[0], P[1], u, t, o, 'e1pip2');
    if (look) { const h = handPt(gx, gy, u, o); magnifier(mx, my, 90, Math.atan2(h[1] - my, h[0] - mx), 'e1mag'); }
    K.check(gx + 150, gy - 7 * u, 70, seg(t, L(37, 10.4), L(37, 11.0)), 'e1ck');
    camEnd();
    flash(1 - seg(t, L(37, -.4), L(37, 0)), '#E6E0F2');
  }
  // (from thermo.js) a magnifier: rim and handle; (x, y) = lens centre; handle points along ang
  function magnifier(x, y, r, ang, key, k = 1) {
    if (k <= .02) return; boilSeed('mg' + key);
    const q = backOut(k), R = r * q, ca = Math.cos(ang), sa = Math.sin(ang);
    paint(ribbon([[x + ca * R * 1.02, y + sa * R * 1.02], [x + ca * R * 1.6, y + sa * R * 1.6]], R * .16, R * .19), { wash: '#8C5A34', fill: '#5E3A22', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
    const P = ellPts(x, y, R, R, 48); P.push(P[0], P[1], P[2]);
    paint(ribbon(P, R * .09, R * .09), { wash: '#C9963A', fill: '#8E6420', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.1 });
    inkLine(ellPts(x, y, R * .86, R * .86, 24).slice(1, 5), 2.5, PAL.cream, 'ink', .6);
  }

  // E2 · CTR1, the claws' sulfur hands, the bucket brigade (L38 – L40)
  const GM = 360;                                                  // the gut cell's top membrane (lumen above, cytoplasm below)
  function shotE2(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(38, -1.0), [820, 440, 1.5]], [L(38, 11.4), [820, 470, 1.5]], [L(39, .2), [860, 620, 2.0]], [L(39, 11.6), [860, 620, 2.0]], [L(39, 12.2), [980, 620, 1.55]], [L(40, -.2), [980, 620, 1.55]], [L(40, .8), [980, 620, 1.05]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    boilSeed('e2lum'); paint(rectPts(-800, -900, W + 1600, GM + 900), { wash: '#F4EBC9', ink: null });
    boilSeed('e2cyt'); paint(rectPts(-800, GM, W + 1600, 1600), { wash: '#E6E0F2', ink: null });
    K.motes(t, 14, '#CFC6E6', { key: 'e2m', y0: GM });
    const Tk = K.track([[-800, GM], [W + 800, GM]]);
    K.bilayer(Tk, 1.5, { key: 'e2a', from: 0, to: 760 + 800 - 100 }); K.bilayer(Tk, 1.5, { key: 'e2b', from: 760 + 800 + 100, to: W + 1600 });
    ctr1(760, GM, 1.1, on(t, L(38, 4.0), L(38, 7.4), .3, .4), 'e2ctr');
    // the reductase on the surface (a small protein in the membrane at x 560)
    boilSeed('e2red'); paint(ellPts(560, GM - 20, 50, 44, 16, 1), { wash: '#E9B39A', fill: '#C27870', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1 });
    // one Cu²⁺ arrives, is reduced (+2.6), drops through CTR1 (+4.0 → +7.6), is caught by a claw (+9.6)
    const arr = seg(t, L(38, .2), L(38, 2.4)), red = seg(t, L(38, 2.6), L(38, 3.3)), drop = seg(t, L(38, 4.0), L(38, 8.6)), catchT = L(38, 9.6);
    const C0 = chap(lerp(1100, 860, ease(seg(t, L(38, 8.4), catchT))), 720, 1.1, -2.4, 'e2c0', { open: 1 - seg(t, catchT, catchT + .2), tipHi: { c: Math.max(pulseK(t, L(39, .2), 1.2), pulseK(t, L(39, 2.0), 1.2)), m: Math.max(pulseK(t, L(39, .2), 1.2), pulseK(t, L(39, 3.6), 1.2)) } });
    let bead = null;
    if (t < L(38, 4.0)) bead = [lerp(300, 600, easeOut(arr)), lerp(120, GM - 80, easeOut(arr))];
    else if (t < catchT) bead = [lerp(600, 760, ease(seg(drop, 0, .3))), lerp(GM - 80, 600, ease(drop))];
    if (red > 0 && red < 1) el(lerp(560, 600, red), lerp(GM - 30, GM - 80, red), 10, 'e2re', .5);
    if (bead) cu(bead[0], bead[1], 22, 1 - ease(red), 'e2bead', .3);
    if (t >= catchT && t < L(39, 9.0)) cu(C0[0], C0[1], 22, 0, 'e2held', .3);
    K.burst(C0[0], C0[1], 50, seg(t, catchT, catchT + .4), PAL.ink, 'e2cat');
    // L39: the hands up close: Cys and Met tips light; a second claw comes; the bead slides across without ever floating free
    const hand2 = seg(t, L(39, 5.4), L(39, 7.0)), slide = ease(seg(t, L(39, 9.0), L(39, 10.8)));
    if (t > L(39, 5.0) && t < L(40, -.4)) { const dx = Math.cos(-2.4), dy = Math.sin(-2.4), fin = [C0[0] + dx * 110, C0[1] + dy * 110], st = [fin[0] + dx * 600, fin[1] + dy * 600];
      const C1 = chap(lerp(st[0], fin[0], easeOut(hand2)), lerp(st[1], fin[1], easeOut(hand2)), 1.1, -2.4 + Math.PI, 'e2c1', { open: .2 });
      if (t > L(39, 9.0)) cu(lerp(C0[0], C1[0], slide), lerp(C0[1], C1[1], slide), 22, 0, 'e2sl', .3); }
    // L40: the bucket brigade: claws pass beads hand to hand; the line forks to SOD1 (top right) and a mitochondrion (bottom right)
    if (t > L(40, -.4)) {
      const line = [[200, 640], [420, 600], [640, 640], [860, 600], [1080, 640]], up = [[1300, 560], [1500, 500]], dn = [[1300, 760], [1500, 860]];
      [...line, ...up, ...dn].forEach(([x, y], i) => chap(x - 50, y + 8 * Math.sin(t * 3 + i), .95, 0, 'e2br' + i, { open: .3 }));
      sod(1790, 520, .8, t, 'e2sod', { cuK: [1, t > L(40, 7.6) ? 1 : 0] }); mito(1720, 900, 2.0, -.2, 'e2mi', { cuK: t > L(40, 10.3) ? 1 : 0 });
      const routeA = [...line, ...up, [1700, 480]], routeB = [...line, ...dn, [1720, 900]];
      for (let b = 0; b < 4; b++) { const route = b % 2 ? routeB : routeA, a = L(40, -.2 + b * 1.2), k = (t - a) / (b % 2 ? 9.5 : 7.4); if (k <= 0 || k >= 1) continue; const f = k * (route.length - 1), j = Math.floor(f), q = ease(f - j); cu(lerp(route[j][0], route[j + 1][0], q) + 20, lerp(route[j][1], route[j + 1][1], q) - 30 * Math.sin(q * Math.PI), 20, 0, 'e2bb' + b, .2); }
    }
    // Pip: the bouncer at the door (L38), juggles a hot bead in oven mitts (L39), stands in the bucket line (L40)
    const u = 26;
    let P, o;
    if (t < L(39, 11.6)) {
      P = t < L(39, 0) ? [1010, 340] : [1200, 840];
      o = K.act(t, [[L(38, -1), 'smug', { armsFront: true, armF: { at: [-.9, -2.4] }, armB: { at: [.9, -2.3] }, flip: true, lookX: 1 }], [L(38, 3.3), 'wow', { flip: true, lookX: 1, lookY: .5 }], [L(38, 9.8), 'happy', { flip: true, armF: [.7, 3.2] }],
        [L(39, .2), 'calm', { flip: true, lookX: 1 }], [L(39, 2.4), 'idea', { flip: true }], [L(39, 9.0), 'wow', { flip: true, lookX: 1 }]]);
    } else {
      P = t < L(40, -.4) ? [1250, 860] : [300, 840];
      o = K.act(t, [[L(39, 11.6), 'strain', { flip: true }], [L(39, 13.6), 'worried', { flip: true, blush: 1 }], [L(40, -.2), 'happy', { lookX: 1 }], [L(40, 5.6), 'excited', { lookX: 1, lookY: -.5 }]]);
    }
    const jug = t > L(39, 11.6) && t < L(40, -.4), jk = (t - L(39, 11.6)) * 3.2;
    if (jug) o = { ...o, armF: [.9 + .5 * Math.sin(jk * Math.PI), 3.2], armB: [.9 - .5 * Math.sin(jk * Math.PI), 3.0] };
    const [gx, gy] = genie(P[0], P[1], u, t, o, 'e2pip');
    if (jug) { const drop_ = near(t, L(39, 12.6), .35); const bp = [gx - 2.4 * u * Math.cos(jk * Math.PI), gy - 6.6 * u - 70 * Math.abs(Math.sin(jk * Math.PI)) + 160 * drop_]; cu(bp[0], bp[1], 18, 0, 'e2hot', .5); steam(bp[0], bp[1] - 20, 22, t, .8, 'e2st', 3);
      for (const w of ['F', 'B']) { const h = handPt(gx, gy, u, o, w); mitts(h[0], h[1], .9, 'e2mt' + w, true); } }
    if (t > L(40, -.4)) { const h = handPt(gx, gy, u, o); bucket(h[0], h[1] + 50, .35, 'e2bkt'); }
    camEnd();
    if (lt < .3) flash(1 - lt / .3, '#E6E0F2');
  }
  // (from thermo.js) puffs rising from a point
  function steam(x, y, u, t, k, key, n = 5) {
    if (k <= .02) return;
    for (let i = 0; i < n; i++) { boilSeed('st' + key + i); const q = frac(t * .9 + i / n), r = (.3 + .8 * q) * .55 * u * k;
      paint(ellPts(x + (hash(i + 4) - .5) * u + .8 * u * q * wob(t, .4, i), y - q * 2.6 * u, r, r * .8, 12, 2), { fill: PAL.cream, fillOp: 200 * (1 - q) * k, bleed: .2, tex: .3, ink: null }); }
  }

  // E3 · the two pumps, smart trucks, and the safe (L41 – L43)
  const split0 = t => on(t, L(41, 3.6), L(42, -.3), .5, .5) >= .5;
  function miniCell(x, y, w, h, col, key) { boilSeed('mc' + key); paint(rrPts(x - w / 2, y - h / 2, w, h, 60), { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.2 }); }
  function shotE3(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 560 + 4 * wob(t, .04), split0(t) ? 1.0 : 1.12);
    K.wash('#E6E0F2', t, { key: 'e3', blob: '#F2EEFA' });
    const split = on(t, L(41, 3.6), L(42, -.3), .5, .5), u = 26;
    if (split < .5) {
      // one cell: the Golgi with its two pumps; L42 the pumps truck out to the edge and back; L43 the safe
      miniCell(960, 560, 1500, 860, '#EFE9F8', 'e3c');
      golgi(820, 520, 1, 'e3g');
      const flood = on(t, L(42, 2.0), L(42, 7.0), .6, 1.0), out = ease(seg(t, L(42, 3.0), L(42, 5.0))) * (1 - ease(seg(t, L(42, 7.0), L(42, 9.0))));
      for (const [i, col, k] of [[0, '#5FB5A8', 'A'], [1, '#D9A04A', 'B']]) {
        const home = [760 + i * 130, 452], edge = [i ? 1640 : 300, i ? 380 : 360], p = [lerp(home[0], edge[0], out), lerp(home[1], edge[1], out) + 6 * Math.abs(Math.sin(t * 8)) * (out > .02 && out < .98 ? 1 : 0)];
        pump7(p[0], p[1], .8, col, 'e3' + k, { ves: out > .02 && out < .98, wheels: out > .02 && out < .98 });
      }
      const nb = Math.round(4 + 10 * flood);
      for (let i = 0; i < nb; i++) { const p = [500 + 900 * hash(i + 80) + 30 * wob(t, .3, i), 300 + 520 * hash(i + 81)]; const leave = out > .9 ? seg(t, L(42, 5.4 + i * .1), L(42, 6.4 + i * .1)) : 0; if (leave >= 1) continue; cu(lerp(p[0], p[0] < 960 ? 120 : 1800, easeIn(leave)), p[1], 19, 0, 'e3f' + i, 0); }
      // L43: metallothionein cages and glutathione take the spares; Pip shuts them in the safe
      const store = seg(t, L(43, .4), L(43, 5.2)), door = ease(seg(t, L(43, 5.6), L(43, 6.4))), SF = [1300, 700];
      if (t > L(43, 0)) { safe(SF[0], SF[1], .9, door, (t - L(43, 6.4)) * 6 * (t > L(43, 6.4) && t < L(43, 7.4) ? 1 : 0), 'e3safe');
        for (let i = 0; i < 4; i++) { const k = seg(store, i * .15, i * .15 + .5); if (door > .5) continue; const p = [lerp(700 + i * 90, SF[0] - 40 + (i % 2) * 70, ease(k)), lerp(760, SF[1] - 30 + Math.floor(i / 2) * 60, ease(k))]; i < 2 ? mtCage(p[0], p[1], .8, 'e3mt' + i) : (gsh(p[0], p[1], .8, 'e3gs' + i, .4), cu(p[0], p[1] - 18, 11, 0, 'e3gc' + i, 0, 0)); }
        K.check(SF[0] + 200, SF[1] - 160, 80, seg(t, L(43, 8.2), L(43, 8.8)), 'e3ck'); }
      // Pip directs traffic (L42) and turns the safe dial (L43)
      const P = t < L(43, 0) ? [960, 860] : [SF[0] - 300, SF[1] + 160];
      let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(42, .2), 'wink', { lookX: 0 }], [L(42, 2.2), 'excited', { armF: [1.2, 3.4], armB: [.2, 3.0] }], [L(42, 7.0), 'happy', { armF: [-.2, 3.4] }],
        [L(43, 0), 'calm', { lookX: 1 }], [L(43, 5.4), 'strain', { armF: [.3, 3.6] }], [L(43, 7.6), 'smug']]);
      const [gx, gy] = genie(P[0], P[1], u, t, o, 'e3pip');
      if (t > L(42, 2.2) && t < L(43, 0)) { const h = handPt(gx, gy, u, o); boilSeed('e3pad'); inkLine([[h[0], h[1]], [h[0], h[1] - 70]], 3, PAL.ink, 'ink', 0); paint(ellPts(h[0], h[1] - 90, 30, 30, 16), { wash: out > .5 ? '#3E9A4E' : '#D2413F', ink: PAL.ink, sw: 1 }); }
    } else {
      // split: ATP7A sends copper from the gut cell into the blood, up to the brain; ATP7B sends the liver's extra into bile
      boilSeed('e3sp'); inkLine([[960, -100], [960, 1200]], 2, PAL.ink, 'ink', 0);
      miniCell(480, 360, 640, 360, '#F4EBC9', 'e3gut'); pump7(480, 540, .8, '#5FB5A8', 'e3pA');
      boilSeed('e3bv'); paint(ribbon([[100, 760], [480, 760], [860, 760]], 70, 70), { wash: '#E27A72', ink: PAL.ink, sw: 1.1 });
      boilSeed('e3br'); paint(ellPts(800, 220, 110, 80, 22, 1), { wash: '#F2B8C4', fill: '#D88C9C', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 }); for (let i = 0; i < 4; i++) inkLine([[730 + i * 40, 170 + 10 * (i % 2)], [745 + i * 40, 215], [728 + i * 40, 260 - 8 * (i % 2)]], 1.2, '#B06A7A', 'ink', .6); inkLine([[690, 225], [910, 220]], 1.2, '#B06A7A', 'ink', .3);
      for (let i = 0; i < 6; i++) { const a = L(41, 4.2 + i * .6), k = seg(t, a, a + 2.6); if (k <= 0 || k >= 1) continue; const P = [[460, 420], [480, 600], [600, 760], [860, 760], [900, 500], [800, 260]], f = k * 5, j = Math.min(4, Math.floor(f)); cu(lerp(P[j][0], P[j + 1][0], f - j), lerp(P[j][1], P[j + 1][1], f - j), 20, 1, 'e3ga' + i, 0); }
      miniCell(1440, 400, 640, 420, '#D9A08A', 'e3liv'); pump7(1440, 620, .8, '#D9A04A', 'e3pB');
      boilSeed('e3bile'); paint(ribbon([[1100, 820], [1440, 820], [1800, 860]], 60, 60), { wash: '#9CC46A', ink: PAL.ink, sw: 1.1 });
      for (let i = 0; i < 6; i++) { const a = L(41, 8.6 + i * .6), k = seg(t, a, a + 2.2); if (k <= 0 || k >= 1) continue; const P = [[1440, 420], [1440, 680], [1440, 820], [1800, 860]], f = k * 3, j = Math.min(2, Math.floor(f)); cu(lerp(P[j][0], P[j + 1][0], f - j), lerp(P[j][1], P[j + 1][1], f - j), 20, 1, 'e3gb' + i, 0); }
    }
    camEnd();
    flash(Math.max(1 - seg(lt, 0, .4), near(t, L(41, 3.6), .15), near(t, L(42, -.3), .15)) * .9, '#E6E0F2');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#6E5A70', '#A796A8']);
  }

  // ================================ F · when a pump breaks (L44 – L51) ================================
  // ---------- chromosomes (copied from meiosis.js: nrm, cpt, piece, chromatid, clip, centromere, chromo, solid) ----------
  // A chromatid runs from its top end (f = 0) to its bottom end (f = 1) along ang (ang = π/2: top end up), with the
  // centromere at f = c, placed at (cx, cy). segs: [[f0, f1, col, dx, dy]].
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
  function centromere(x, y, w, key, hi = 0) { boilSeed('cm' + key); paint(ellPts(x, y, w * .3 * (1 + .5 * hi), w * .3 * (1 + .5 * hi), 12), { wash: mixCol('#3B3346', '#F0A93C', hi), ink: null }); }
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
  // an X (long, a band near its tip marks the gene) and a Y (short); bad = the band blinks red
  function xChrom(x, y, s, key, bad = 0, col = '#B7A6DA') {
    const segs = [[0, .2, col], [.2, .26, bad > 0 ? mixCol('#E8B24A', '#D2413F', bad) : '#E8B24A'], [.26, 1, col]];
    chromo(x, y, Math.PI / 2, { L: 220 * s, c: .42 }, { rep: 1, w: 30 * s, segsA: segs }, key);
  }
  function yChrom(x, y, s, key) { chromo(x, y, Math.PI / 2, { L: 110 * s, c: .3 }, { rep: 1, w: 30 * s, segsA: solid('#9CB5E6') }, key); }
  const solid = col => [[0, 1, col]];

  // a body map: a pale paper person (no face) with a brain, a liver and the gut; dim 0..1 dims the brain
  function bodyMap(x, y, s, key, o = {}) {
    boilSeed('bm' + key);
    for (const sd of [-1, 1]) { paint(ribbon([[x + sd * 120 * s, y - 130 * s], [x + sd * 160 * s, y + 20 * s], [x + sd * 175 * s, y + 170 * s]], 54 * s, 42 * s), { wash: '#EFE4D2', ink: PAL.ink, sw: 1.1 }); paint(ribbon([[x + sd * 62 * s, y + 200 * s], [x + sd * 72 * s, y + 470 * s]], 70 * s, 60 * s), { wash: '#EFE4D2', ink: PAL.ink, sw: 1.1 }); }
    paint(rrPts(x - 135 * s, y - 175 * s, 270 * s, 410 * s, 80 * s), { wash: '#EFE4D2', ink: PAL.ink, sw: 1.1 });
    paint(ellPts(x, y - 270 * s, 100 * s, 106 * s, 22), { wash: '#EFE4D2', ink: PAL.ink, sw: 1.1 });
    const dim = o.dim || 0, cuK = o.cu ?? 1;
    paint(ellPts(x, y - 285 * s, 72 * s, 56 * s, 18, 1), { wash: mixCol('#F2B8C4', '#C9C4C6', dim), ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 3; i++) inkLine([[x - 40 * s + i * 40 * s, y - 325 * s], [x - 30 * s + i * 40 * s, y - 285 * s], [x - 42 * s + i * 40 * s, y - 245 * s]], 1, mixCol('#B06A7A', '#9C9497', dim), 'ink', .6);
    paint(ellPts(x + 50 * s, y - 20 * s, 70 * s, 40 * s, 16, 1, -.2), { wash: o.liver || '#B8644E', ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 4; i++) inkLine([[x - 60 * s, y + 70 * s + i * 34 * s], [x + 60 * s, y + 80 * s + i * 34 * s]], 6 * s, '#E9A99A', 'ink', .6);
    for (let i = 0; i < 7; i++) { const p = [x + (hash(i + 40) - .5) * 160 * s, y + (hash(i + 41) - .5) * 400 * s - 40 * s]; cu(p[0], p[1], 10 * s * cuK, 0, key + 'c' + i, .2 * cuK, 0); }
  }
  function hair(x, y, s, key, steely = 0, base = null) {                         // a hair strand: normal (smooth) or twisted, brittle, steel-wire like
    boilSeed('hr' + key);
    const P = []; for (let i = 0; i <= 24; i++) { const q = i / 24; P.push([x + (q - .5) * 360 * s, y + steely * 16 * s * Math.sin(q * 40) + (1 - steely) * 22 * s * Math.sin(q * 6)]); }
    const col = base || mixCol('#6E4A3A', '#9AA3AE', steely);
    if (steely > .5) { paint(ribbon(P.slice(0, 15), 11 * s, 9 * s), { wash: col, ink: PAL.ink, sw: .8 }); paint(ribbon(P.slice(16), 9 * s, 7 * s), { wash: col, ink: PAL.ink, sw: .8 }); }
    else paint(ribbon(P, 11 * s, 8 * s), { wash: col, ink: PAL.ink, sw: .8 });
  }
  function sheep(x, y, s, t, key, steely = 0) {                     // a sheep: a fleece of curls (or flat steely wool), dot eye
    boilSeed('sh' + key);
    for (const lx of [-50, -20, 30, 60]) paint(ribbon([[x + lx * s, y + 40 * s], [x + lx * s, y + 100 * s]], 14 * s, 12 * s), { wash: '#4B4250', ink: PAL.ink, sw: .8 });
    if (steely < .5) for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; paint(ellPts(x + Math.cos(a) * 70 * s, y + Math.sin(a) * 42 * s, 40 * s, 34 * s, 14, 1), { wash: '#F4EFE4', ink: PAL.ink, sw: .9 }); }
    paint(ellPts(x, y, 100 * s, 62 * s, 24, steely < .5 ? 2 : 0), { wash: steely < .5 ? '#F4EFE4' : '#C9CDD2', fill: steely < .5 ? '#D9D2C2' : '#9AA3AE', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 });
    if (steely >= .5) for (let i = 0; i < 6; i++) inkLine([[x - 80 * s, y - 40 * s + i * 16 * s], [x + 80 * s, y - 40 * s + i * 16 * s]], 1, '#7E8894', 'inkfine', 0);
    paint(ellPts(x + 110 * s, y - 20 * s, 34 * s, 28 * s, 14), { wash: '#4B4250', ink: PAL.ink, sw: .9 });
    paint(ellPts(x + 118 * s, y - 26 * s, 5 * s, 5 * s, 8), { wash: PAL.cream, ink: null });
  }
  function syringe(x, y, s, ang, push_, key) {                      // a syringe with copper-coloured liquid; push_ 0..1 empties it
    boilSeed('sy' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    paint(rrPts(-140, -24, 220, 48, 10), { wash: '#EEF5F8', ink: PAL.ink, sw: 1 });
    paint(rrPts(-140 + 200 * push_, -20, 216 - 200 * push_, 40, 8), { wash: Z.cu, ink: null });
    paint(rrPts(-170 + 200 * push_, -30, 30, 60, 6), { wash: '#B9C2CC', ink: PAL.ink, sw: .9 });
    paint(ribbon([[-170 + 200 * push_, 0], [-240 + 200 * push_, 0]], 10, 10), { wash: '#B9C2CC', ink: PAL.ink, sw: .9 });
    paint(ribbon([[80, 0], [150, 0]], 5, 2), { wash: '#B9C2CC', ink: PAL.ink, sw: .8 });
    pop();
  }
  function eye(x, y, s, ring, key) {                                // an eye diagram: sclera, iris, pupil; ring 0..1 = the golden-brown K-F ring
    boilSeed('ey' + key);
    paint([...Array(30)].map((_, i) => { const a = i / 30 * TAU; return [x + Math.cos(a) * 300 * s, y + Math.sin(a) * 150 * s * Math.pow(Math.abs(Math.sin(a)), .4) * Math.sign(Math.sin(a))]; }), { wash: '#FBF6EE', ink: PAL.ink, sw: 1.4, curv: .5 });
    paint(ellPts(x, y, 130 * s, 130 * s, 32), { wash: '#6E9BD3', fill: '#3F6FA8', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; inkLine([[x + Math.cos(a) * 60 * s, y + Math.sin(a) * 60 * s], [x + Math.cos(a) * 120 * s, y + Math.sin(a) * 120 * s]], .8, '#3F6FA8', 'inkfine', .3); }
    if (ring > .02) { const P = ellPts(x, y, 122 * s, 122 * s, 40); paint(ribbon(P.concat([P[0], P[1]]), 18 * s * ring, 18 * s * ring), { wash: '#B8862E', washOp: 230 * ring, ink: null }); }
    paint(ellPts(x, y, 52 * s, 52 * s, 22), { wash: PAL.ink, ink: null });
    paint(ellPts(x - 30 * s, y - 34 * s, 16 * s, 12 * s, 10), { wash: PAL.cream, ink: null });
  }
  function magnet(x, y, s, ang, key) {                              // a horseshoe magnet
    boilSeed('mg' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    const P = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; P.push([Math.cos(a) * 60, Math.sin(a) * 60]); }
    paint(ribbon([[-60, 70], ...P, [60, 70]], 34, 34), { wash: '#D2413F', ink: PAL.ink, sw: 1.1, curv: .3 });
    for (const sd of [-1, 1]) paint(rectPts(sd * 60 - 17, 50, 34, 34), { wash: '#C9D0D8', ink: PAL.ink, sw: 1 });
    pop();
  }

  // F1 · Menkes (L44 – L47): the gut cell's pump breaks, the whole body runs short, the sheep clue, early treatment
  function shotF1(t, lt, dur) {
    K.setT(t);
    const fz = t < L(44, 8.4) ? [1000, 580, 1.25] : t < L(45, 0) ? [960, 560, 1.1] : t < L(46, -.4) ? [960, 520, 1.05] : t < L(47, -.4) ? [960, 520, 1.0] : [900, 540, 1.1];
    camBegin(fz[0] + 6 * wob(t, .05), fz[1] + 4 * wob(t, .04), fz[2]);
    const past = on(t, L(46, -.4), L(47, -.4), .5, .5);
    K.wash(mixCol('#A796A8', '#E8CF8E', past), t, { key: 'f1', blob: mixCol('#BDAEBF', '#F4E2AE', past) });
    const u = 28;
    if (t < L(45, 0)) {
      // L44: both pumps crack in turn; the X with the ATP7A gene; the gut cell: copper piles up, nothing gets out
      const crackA = seg(t, L(44, 1.6), L(44, 2.0)), crackB = seg(t, L(44, 3.0), L(44, 3.4)), cell_ = t > L(44, 8.4);
      if (!cell_) {
        [[760, '#5FB5A8', crackA, 'A'], [1160, '#D9A04A', crackB, 'B']].forEach(([x, col, k, n]) => { pump7(x, 420, 1.4, mixCol(col, '#9C9497', .5 * k), 'f1p' + n);
          if (k > 0) { boilSeed('f1cr' + n); inkLine([[x - 30, 380], [x - 4, 420 + 30 * k], [x + 14, 400], [x + 34, 450 + 40 * k]], 2.4, PAL.ink, 'ink', 0); } });
        if (t > L(44, 4.6)) { const k = popK(seg(t, L(44, 4.6), L(44, 5.2))); if (k > .05) xChrom(960, 780, 1.5 * k, 'f1x', pulseK(t, L(44, 6.2), .8) + pulseK(t, L(44, 7.0), .8)); }
      } else {
        miniCell(960, 420, 900, 480, '#F4EBC9', 'f1gut');
        pump7(960, 640, 1.0, '#9C9497', 'f1pA');
        boilSeed('f1cr'); inkLine([[930, 610], [955, 650], [972, 625], [990, 690]], 2.4, PAL.ink, 'ink', 0);
        boilSeed('f1bv'); paint(ribbon([[200, 900], [960, 900], [1720, 900]], 90, 90), { wash: '#E27A72', ink: PAL.ink, sw: 1.1 });
        for (let i = 0; i < 16; i++) { const k = popK(seg(t, L(44, 9.0 + i * .12), L(44, 9.3 + i * .12))); if (k > .05) cu(620 + (i % 8) * 90 + (Math.floor(i / 8) % 2) * 45, 560 - Math.floor(i / 8) * 60 + 6 * wob(t, .4, i), 22 * k, 0, 'f1pile' + i, 0); }
      }
      const P = cell_ ? [1150, 820] : [1500, 760];
      let o = K.act(t, [[0, 'worried', { lookX: -1, flip: true }], [L(44, 4.6), 'sad', { flip: true, lookY: .5 }], [L(44, 9.4), 'strain', { flip: true, armF: [-.2, 3.6], armB: [-.1, 3.4] }], [L(44, 12.2), 'sad', { flip: true }]]);
      genie(P[0], P[1], u, t, o, 'f1pip');
    } else if (t < L(46, -.4)) {
      // L45: the whole body runs short; X-linked (XY vs XX); hair, vessels, nerves
      bodyMap(520, 560, 1.0, 'f1bm', { dim: ease(seg(t, L(45, .2), L(45, 1.6))), cu: 1 - ease(seg(t, L(45, .2), L(45, 1.6))) });
      const xk = popK(seg(t, L(45, 4.2), L(45, 4.8))), yk = popK(seg(t, L(45, 7.4), L(45, 8.0)));
      if (xk > .05) { xChrom(960, 300, 1.0 * xk, 'f1xa', .8 + .2 * Math.sin(t * 6)); yChrom(1100, 330, 1.0 * xk, 'f1ya'); }
      if (yk > .05) { xChrom(1330, 300, 1.0 * yk, 'f1xb', .8 + .2 * Math.sin(t * 6)); glow(1470, 300, 110, '#FFE08A', .5 * yk); xChrom(1470, 300, 1.0 * yk, 'f1xc', 0); }
      const hk = popK(seg(t, L(45, 10.4), L(45, 11.0)));
      if (hk > .05) inset(1080, 760, 150, hk, 'f1hin', () => hair(1080, 760, .7, 'f1hair', 1));
      const vk = popK(seg(t, L(45, 14.2), L(45, 14.7)));
      if (vk > .05) { boilSeed('f1ves'); const P = []; for (let i = 0; i <= 20; i++) P.push([1320 + i * 14, 760 + 40 * Math.sin(i * 1.4) * vk]); paint(ribbon(P, 26 * vk, 26 * vk), { wash: '#E27A72', ink: PAL.ink, sw: 1 }); }
      const nk = popK(seg(t, L(45, 16.0), L(45, 16.5)));
      if (nk > .05) { const dim = ease(seg(t, L(45, 16.5), L(45, 18.5))); boilSeed('f1neu'); paint(ellPts(1700, 760, 46 * nk, 40 * nk, 16), { wash: mixCol('#B7A6DA', '#9C9497', dim), ink: PAL.ink, sw: 1 }); for (let i = 0; i < 4; i++) { const a = -2.6 + i * .7; inkLine([[1700 + Math.cos(a) * 40 * nk, 760 + Math.sin(a) * 34 * nk], [1700 + Math.cos(a) * 90 * nk, 760 + Math.sin(a) * 80 * nk]], 3, mixCol('#8C78B8', '#9C9497', dim), 'ink', .4); } }
      let o = K.act(t, [[0, 'sad', { lookX: 1 }], [L(45, 4.2), 'calm', { lookX: 1, lookY: -.6 }], [L(45, 10.4), 'sad', { lookX: 1 }]]);
      genie(170, 860, u, t, o, 'f1pip2');
    } else if (t < L(47, -.4)) {
      // L46: 1972, the golden pasture: a child's hair strand reminds a doctor of steely wool on copper-poor pastures
      boilSeed('f1past'); paint(rectPts(-300, 700, W + 600, 600), { wash: '#C9B46E', ink: null }); inkLine([[-300, 700], [W + 300, 700]], 1.2, '#9E8A48', 'ink', .3);
      boilSeed('f1tree'); paint(ribbon([[1720, 700], [1700, 420]], 34, 22), { wash: '#B9A48A', ink: PAL.ink, sw: 1 }); paint(ellPts(1690, 360, 150, 90, 20, 3), { wash: '#8FA878', fill: '#6E8A58', fillOp: 40, tex: .5, ink: PAL.ink, sw: 1 });
      const sk = popK(seg(t, L(46, 8.6), L(46, 9.2)));
      sheep(980, 640, 1.4, t, 'f1s1', 0);
      if (sk > .05) sheep(1460, 660, 1.4 * sk, t, 'f1s2', 1);
      const hk = popK(seg(t, L(46, 6.0), L(46, 6.5)));
      if (hk > .05) inset(420, 330, 160, hk, 'f1h2', () => hair(420, 330, .75, 'f1hair2', 1));
      cloud(1300, 300, 220, 110, seg(t, L(46, 7.6), L(46, 8.3)), [520, 330], 'f1cl');
      if (t > L(46, 10.8)) { const k = ease(seg(t, L(46, 10.8), L(46, 12.0))); boilSeed('f1wb'); paint(rrPts(1040, 150, 520, 300, 30), { wash: PAL.cream, ink: PAL.ink, sw: 1.1 });
        hair(1300, 210, .6, 'f1crimp', 0, '#E9DFC8'); hair(1300, 290, .6, 'f1wool', 1, '#B9C0C8'); hair(lerp(420, 1300, k), lerp(330, 370, k), .6, 'f1hm', 1); }
      K.check(1300, 180, 70, seg(t, L(46, 13.4), L(46, 14.0)), 'f1ck');
      let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(46, 8.6), 'wow', { lookX: 1 }], [L(46, 13.4), 'idea']]);
      genie(160, 820, u, t, o, 'f1pip3');
    } else {
      // L47: copper injected early; the body map partly brightens
      const push_ = ease(seg(t, L(47, .6), L(47, 4.0))), back = ease(seg(t, L(47, 3.4), L(47, 6.4)));
      bodyMap(820, 560, 1.0, 'f1bm2', { dim: 1 - .65 * back, cu: back });
      syringe(1280, 520, 1.1, Math.PI, push_, 'f1syr');
      for (let i = 0; i < 6; i++) { const k = seg(t, L(47, 1.2 + i * .4), L(47, 2.4 + i * .4)); if (k > 0 && k < 1) cu(lerp(1120, 860 + (hash(i) - .5) * 120, k), lerp(520, 400 + 300 * hash(i + 1), k), 14, 0, 'f1inj' + i, .3); }
      let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(47, 5.0), 'happy', { lookX: 1, lookY: -.4 }], [L(47, 8.0), 'smug', { armsFront: true, armF: { at: [-.9, -2.4] }, armB: { at: [.9, -2.3] } }]]);
      genie(330, 840, u, t, o, 'f1pip4');
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#6E5A70', '#A796A8']);
    flash(Math.max(near(t, L(45, 0), .15), near(t, L(46, -.4), .15), near(t, L(47, -.4), .15)) * .9, PAL.cream);
  }
  // (from thermo.js) a thought bubble with two little bubbles back to the thinker
  function cloud(cx, cy, rx, ry, k, from, key) {
    if (k <= .02) return; boilSeed('cl' + key);
    const q = backOut(k);
    paint(ellPts(lerp(from[0], cx, .22), lerp(from[1], cy, .22), 12 * q, 10 * q, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(ellPts(lerp(from[0], cx, .42), lerp(from[1], cy, .42), 20 * q, 17 * q, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; P.push([cx + Math.cos(a) * rx * q * (1 + .06 * Math.sin(a * 8)), cy + Math.sin(a) * ry * q * (1 + .06 * Math.sin(a * 8))]); }
    paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
  }

  // F2 · Wilson (L48 – L50): the liver bucket overflows into the brain; inheritance; the eye's ring; treatment
  function liver(x, y, s, key) {                                   // a liver silhouette (big right lobe, small left lobe)
    boilSeed('lv' + key);
    paint([[-260, -40], [-120, -150], [120, -170], [280, -110], [300, 10], [200, 120], [-40, 150], [-200, 90], [-300, 30]].map(([a, b]) => [x + a * s, y + b * s]), { wash: '#B8644E', fill: '#8E4636', fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.2, curv: .45 });
  }
  function brainSection(x, y, s, fill, key) {                       // a brain cross-section with the bean-shaped lenticular nucleus
    boilSeed('bs' + key);
    paint(ellPts(x, y, 220 * s, 170 * s, 30, 2), { wash: '#F2B8C4', fill: '#D88C9C', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.2 });
    inkLine([[x, y - 170 * s], [x, y + 60 * s]], 1.2, '#B06A7A', 'ink', 0);
    for (const sd of [-1, 1]) { paint(ellPts(x + sd * 80 * s, y + 20 * s, 44 * s, 30 * s, 16, 0, sd * .5), { wash: mixCol('#E9A6B4', Z.cu, fill), ink: PAL.ink, sw: .9 }); if (fill > .3) glow(x + sd * 80 * s, y + 20 * s, 60 * s, '#FFB070', .5 * fill); }
  }
  function shotF2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    K.wash('#A796A8', t, { key: 'f2', blob: '#BDAEBF' });
    const u = 28;
    if (t < L(49, -.3)) {
      // L48: the liver as a wooden bucket with a broken ATP7B tap; copper fills it, overflows, and climbs to the brain
      const fill = ease(seg(t, L(48, 3.2), L(48, 6.0))), over = seg(t, L(48, 6.0), L(48, 9.6));
      liver(700, 700, 1.25, 'f2lv');
      bucket(700, 900, 2.0, 'f2bk', { fill, rot: .03 * Math.sin(t * 2) * fill });
      pump7(870, 760, .7, '#9C9497', 'f2tap'); boilSeed('f2cr'); inkLine([[850, 740], [866, 770], [880, 752], [892, 790]], 2, PAL.ink, 'ink', 0);
      for (let i = 0; i < 10; i++) { const a = L(48, 6.0 + i * .35), k = seg(t, a, a + 1.8); if (k <= 0 || k >= 1) continue; const p = k < .3 ? arcPt([600 + i * 20, 600], [520, 760], 40, k / .3) : arcPt([600, 600], [1300 + (i % 2) * 80, 400], 260, (k - .3) / .7); cu(p[0], p[1], 15, 0, 'f2ov' + i, 0); }
      brainSection(1340, 360, 1.0, ease(seg(t, L(48, 8.0), L(48, 10.4))), 'f2br');
      let o = K.act(t, [[0, 'worried', { lookX: 1 }], [L(48, 6.0), 'wow', { lookX: 1, lookY: -.6 }], [L(48, 10.6), 'sad', { lookX: 1 }]]);
      genie(240, 840, u, t, o, 'f2pip');
    } else if (t < L(50, -.3)) {
      // L49: both parents carry one faulty copy (tinted Pips); one child in four; one in 30,000; teen signs
      const BLUEP = { pip: '#6E8FC8', pipDk: '#4E6FA8', belly: '#DCE6F4' }, ROSEP = { pip: '#D9708E', pipDk: '#B2526F', belly: '#F6D6DF' };
      const pk = popK(seg(t, L(49, .2), L(49, .7)));
      if (pk > .05) { tinted(BLUEP, () => pip(300, 460, 34 * pk, { ...pipFeel('calm', t, { seed: 2 }), key: 'f2pa' })); tinted(ROSEP, () => pip(540, 460, 34 * pk, { ...pipFeel('calm', t, { seed: 4 }), flip: true, key: 'f2ma' }));
        for (const [x, key] of [[300, 'pa'], [540, 'ma']]) { chromo(x - 14, 160, Math.PI / 2, { L: 90, c: .4 }, { rep: 0, w: 18, segsA: [[0, .3, '#B7A6DA'], [.3, .4, '#D2413F'], [.4, 1, '#B7A6DA']] }, 'f2c' + key + 'a'); chromo(x + 14, 160, Math.PI / 2, { L: 90, c: .4 }, { rep: 0, w: 18, segsA: solid('#B7A6DA') }, 'f2c' + key + 'b'); } }
      for (let i = 0; i < 4; i++) { const k = popK(seg(t, L(49, 1.0 + i * .3), L(49, 1.4 + i * .3))); if (k < .05) continue; const x = 200 + i * 140;
        pip(x, 820, 22 * k, { ...pipFeel(i === 3 ? 'sad' : 'happy', t, { seed: i }), key: 'f2k' + i }); if (i === 3) glow(x, 820 - 50, 80, '#FFB070', .5); }
      const ck = seg(t, L(49, 3.4), L(49, 4.0));
      if (ck > 0) for (let i = 0; i < 60; i++) { const x = 800 + (i % 12) * 42, y = 260 + Math.floor(i / 12) * 42; boilSeed('f2d' + i); const q = popK(clamp(ck * 2 - i / 60)); if (q > .05) paint(ellPts(x, y, (i === 37 ? 16 : 11) * q, (i === 37 ? 16 : 11) * q, 8), { wash: i === 37 ? Z.cu : '#D9D2DA', ink: i === 37 ? PAL.ink : null, sw: .8 }); }
      if (t > L(49, 6.0)) { const tk = popK(seg(t, L(49, 6.0), L(49, 6.6))); if (tk > .05) silhouette(1500, 900, 1.6 * tk, 'f2teen');
        boilSeed('f2liv'); const lk = pulseK(t, L(49, 9.9), 1.0); if (t > L(49, 9.6)) paint(ellPts(1500 + 40, 760, 46, 26, 14, 1, -.2), { wash: mixCol('#B8644E', '#FFB070', lk), ink: PAL.ink, sw: .9 });
        if (t > L(49, 11.0)) { const hp = [1640 + 6 * Math.sin(t * 40), 820]; boilSeed('f2hand'); paint(ellPts(hp[0], hp[1], 26, 20, 12), { wash: '#EFE4D2', ink: PAL.ink, sw: 1 }); for (const sd of [-1, 1]) inkLine([[hp[0] + sd * 40, hp[1] - 24], [hp[0] + sd * 48, hp[1]], [hp[0] + sd * 40, hp[1] + 24]], 1.6, PAL.ink, 'ink', .5); }
        if (t > L(49, 12.6)) { boilSeed('f2sp'); const P = []; for (let i = 0; i <= 10; i++) P.push([1560 + i * 12, 560 + 14 * Math.sin(i * 2.3 + t * 10) * (i % 3 ? 1 : .3)]); inkLine(P, 2, PAL.ink, 'ink', .6); }
        if (t > L(49, 13.9)) { boilSeed('f2mood'); paint(ellPts(1500, 470, 70, 44, 16, 2), { wash: '#6E6874', ink: PAL.ink, sw: 1 }); for (let i = 0; i < 2; i++) inkLine([[1480 + i * 30, 510], [1470 + i * 30, 540], [1486 + i * 30, 540], [1474 + i * 30, 572]], 2, Z.atp, 'ink', 0); } }
      let o = K.act(t, [[L(49, -.3), 'calm', { lookX: 1 }], [L(49, 3.4), 'wow', { lookX: 1 }], [L(49, 6.0), 'worried', { lookX: 1 }]]);
      genie(1120, 880, u, t, o, 'f2pip2');
    } else {
      // L50: the eye's golden-brown ring; then the magnet pulls copper out of the liver bucket and zinc shuts the gut door
      if (t < L(50, 8.8)) { eye(960, 480, 1.3, ease(seg(t, L(50, 2.4), L(50, 4.6))), 'f2eye');
        for (let i = 0; i < 6; i++) K.sparkle(960 + Math.cos(i) * 160, 480 + Math.sin(i) * 160, 26, seg(t, L(50, 5.6 + i * .2), L(50, 6.6 + i * .2)), '#FFE7A0'); }
      if (t > L(50, 8.8)) {
        const pull = ease(seg(t, L(50, 9.8), L(50, 11.8)));
        liver(760, 720, 1.15, 'f2lv2');
        bucket(760, 900, 1.8, 'f2bk2', { fill: 1 - .6 * pull });
        for (let i = 0; i < 6; i++) { const k = seg(t, L(50, 9.8 + i * .25), L(50, 10.6 + i * .25)); if (k > 0 && k < 1) cu(lerp(760 + (i - 2.5) * 30, 1080, easeIn(k)), lerp(640, 470, easeIn(k)), 14, 0, 'f2mg' + i, 0); }
        const zk = seg(t, L(50, 12.2), L(50, 13.2));
        boilSeed('f2gut'); paint(rrPts(1300, 560, 420, 300, 60), { wash: '#F4EBC9', ink: PAL.ink, sw: 1.1 });
        for (let i = 0; i < 6; i++) { const k = popK(seg(zk, i * .12, i * .12 + .4)); if (k > .05) { boilSeed('f2zn' + i); paint(ellPts(1340 + i * 64, 540, 26 * k, 26 * k, 12), { wash: Z.zn, ink: PAL.ink, sw: .9 }); } }
        for (let i = 0; i < 3; i++) { const k = seg(t, L(50, 12.8 + i * .3), L(50, 13.8 + i * .3)); if (k > 0 && k < 1) { const p = k < .5 ? [1400 + i * 120, lerp(320, 500, k * 2)] : [1400 + i * 120 + 80 * (k - .5), lerp(500, 360, (k - .5) * 2)]; cu(p[0], p[1], 16, 1, 'f2bo' + i, 0); } }
      }
      let o = K.act(t, [[L(50, -.3), 'calm', { lookX: 1 }], [L(50, 2.6), 'wow', { lookX: 1 }], [L(50, 8.0), 'happy'], [L(50, 9.8), 'strain', { armF: [.3, 3.6] }], [L(50, 12.0), 'happy', { lookX: 1 }]]);
      const P = t > L(50, 8.8) ? [1150, 600] : [300, 860];
      const [gx, gy] = genie(P[0], P[1], u, t, o, 'f2pip3');
      if (t > L(50, 9.6) && t < L(50, 12.0)) { const h = handPt(gx, gy, u, o); magnet(h[0] + 30, h[1] - 10, .8, Math.PI / 2 + .3, 'f2mag'); }
    }
    camEnd();
    flash(Math.max(1 - seg(lt, 0, .3), near(t, L(49, -.3), .15), near(t, L(50, -.3), .15), near(t, L(50, 8.8), .15), seg(t, L(51, -1.2), L(51, -.8))) * .9, PAL.cream);
  }

  // R2 · recap 2 (cream board, no Pip): in through CTR1, hand to hand to the jobs; ATP7A broken → empty; ATP7B broken → overflowing
  function shotR2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0 + .01 * lt);
    board(t, 'r2');
    const steps = [[300, 300], [560, 300], [820, 300], [1080, 300], [1340, 300], [1600, 300]];
    boilSeed('r2gut'); const gk = popK(seg(t, L(51, .3), L(51, .8))); if (gk > .05) paint(rrPts(200 - 30 * gk, 230, 180 * gk, 140, 30), { wash: '#F4EBC9', ink: PAL.ink, sw: 1.1 });
    if (t > L(51, 2.6)) ctr1(420, 300, .6, 1, 'r2ctr');
    for (let i = 0; i < 4; i++) { const k = popK(seg(t, L(51, 4.4 + i * .3), L(51, 4.8 + i * .3))); if (k > .05) chap(620 + i * 200, 320, .7 * k, 0, 'r2ch' + i, { open: .3 }); }
    const run = seg(t, L(51, 3.0), L(51, 8.0));
    if (run > 0) { const p = run * (steps.length - 1), j = Math.min(steps.length - 2, Math.floor(p)), q = ease(p - j); cu(lerp(steps[j][0], steps[j + 1][0], q) + 50, 300 - 30 * Math.sin(q * Math.PI), 18, 0, 'r2bead', .3); }
    if (t > L(51, 7.4)) recapIcon(0, 1700, 300, seg(t, L(51, 7.4), L(51, 7.8)), t);
    const ak = popK(seg(t, L(51, 8.0), L(51, 8.6))), bk = popK(seg(t, L(51, 11.6), L(51, 12.2)));
    if (ak > .05) { bucket(640, 900, 1.3 * ak, 'r2e', { fill: 0 }); pump7(830, 760, .6 * ak, '#5FB5A8', 'r2pA'); K.cross(830, 720, 60, seg(t, L(51, 8.8), L(51, 9.4)), 'r2xa'); }
    if (bk > .05) { bucket(1280, 900, 1.3 * bk, 'r2f', { fill: 1 }); pump7(1470, 760, .6 * bk, '#D9A04A', 'r2pB'); K.cross(1470, 720, 60, seg(t, L(51, 12.4), L(51, 13.0)), 'r2xb');
      for (let i = 0; i < 4; i++) { const k = frac(t * .8 + i / 4); cu(1200 + i * 50, 690 + 160 * k, 12, 0, 'r2ov' + i, 0, 0); } }
    camEnd();
    flash(1 - seg(lt, 0, .4), PAL.cream);
    if (lt > dur - .25) { const k = (lt - (dur - .25)) / .25; for (let i = 0; i < 7; i++) inkLine([[W * (1 - k), 150 + i * 130], [W, 150 + i * 130]], 3 * k, PAL.cream, 'ink', 0); }
  }

  // ================================ G · weapon, frontier, everyday (L52 – L58) ================================
  function bacterium(x, y, s, t, key, o = {}) {                     // a rod-shaped bacterium: a capsule with a face and a few flagella
    const ang = o.ang || 0, col = mixCol('#9CCB7A', '#B9B4B6', o.grey || 0);
    boilSeed('ba' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    for (let i = 0; i < 3; i++) { const P = []; for (let j = 0; j <= 6; j++) P.push([-70 - j * 14, (i - 1) * 14 + 8 * Math.sin(j * 1.2 + t * 8 + i)]); inkLine(P, 1.2, PAL.ink, 'ink', .6); }
    paint(rrPts(-70, -36, 140, 72, 36), { wash: col, fill: '#6E9F58', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 });
    pop();
    K.face(x + Math.cos(ang) * 20 * s, y + Math.sin(ang) * 20 * s - 4 * s, 26 * s, t, { mood: o.mood || 'calm', seed: o.seed || 0, blush: false });
    if (o.dizzy) stars(x, y - 50 * s, 40 * s, t, key + 'dz');
  }
  function door(x, y, s, key) {                                     // a hospital door with a copper handle; (x, y) = the handle
    boilSeed('dr' + key);
    paint(rectPts(x - 380 * s, y - 520 * s, 440 * s, 1100 * s), { wash: '#BFD9D6', fill: '#8EB8B4', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(rectPts(x - 330 * s, y - 470 * s, 340 * s, 300 * s), { wash: '#DDEFF6', ink: PAL.ink, sw: 1 });
    paint(rrPts(x - 20 * s, y - 30 * s, 40 * s, 60 * s, 10 * s), { wash: Z.cuDk, ink: PAL.ink, sw: 1 });
    paint(ribbon([[x - 10 * s, y], [x + 150 * s, y]], 30 * s, 26 * s), { wash: Z.cu, fill: Z.cuDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(x + 60 * s, y - 6 * s, 40 * s, 5 * s, 10), { wash: Z.cuLt, ink: null });
  }
  function ring_(x, y, r, col, key, k = 1) {                        // an enzyme drawn as a pastel ring (a TCA-cycle complex)
    if (k < .05) return; boilSeed('rg' + key);
    const P = ellPts(x, y, r * k, r * k, 22); paint(ribbon(P.concat([P[0], P[1]]), 18 * k, 18 * k), { wash: col, ink: PAL.ink, sw: .9 });
  }
  function dart(x, y, s, ang, key) {                                 // a little capsule dart carrying copper
    boilSeed('dt' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    for (const sd of [-1, 1]) paint([[-40, 0], [-62, sd * 22], [-30, sd * 4]], { wash: '#E2462E', ink: PAL.ink, sw: .8 });
    paint(rrPts(-40, -14, 80, 28, 14), { wash: '#EEF5F8', ink: PAL.ink, sw: 1 });
    pop();
    cu(x, y, 11 * s, 0, key + 'c', .4, 0);
  }
  function crumble(x, y, r, k, col, key) {                          // a cell falling to dust (k 0..1)
    for (let i = 0; i < 16; i++) { const a = hash(i + 70) * TAU, d = r * (.2 + .8 * hash(i + 71)) * (1 + k * .6); boilSeed('cr' + key + i);
      paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d + 160 * k * k * hash(i), 18 * (1 - .6 * k), 14 * (1 - .6 * k), 8, 2), { wash: col, washOp: 255 * (1 - k), ink: k < .7 ? PAL.ink : null, sw: .7 }); }
  }

  // G1 · copper as a weapon (L52 – L53)
  function shotG1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    const hosp = t > L(53, -.5);
    if (!hosp) {
      K.wash('#F2C6C2', t, { key: 'g1', blob: '#F9E1DE' });
      for (let i = 0; i < 6; i++) rbc(frac(hash(i + 90) + t * .03) * (W + 400) - 200, 120 + 860 * hash(i + 91), 40, 'g1rb' + i);
      const M = [1150, 560], gulp = seg(t, L(52, 5.8), L(52, 7.6)), sizzle = seg(t, L(52, 10.0), L(52, 11.4));
      const bp = gulp < 1 ? [lerp(1700, M[0] + 40, ease(gulp)), lerp(260, M[1] + 20, ease(gulp))] : [M[0] + 40, M[1] + 20];
      K.cell(M[0], M[1], 300, '#F0D2A8', '#D9AA72', t, { key: 'g1mac', mood: 'determined', nucleus: false, fx: -.55, sq: .05 * spring(t, L(52, 7.6), 4, 12),
        behind: () => { for (let i = 0; i < 5; i++) { const a = -1.2 + i * .6 + .2 * Math.sin(t + i), reach = 1 + .5 * on(t, L(52, 5.4), L(52, 7.4)) * (i < 2 ? 1 : 0); boilSeed('g1ps' + i); const d = 260 + 60 * reach; paint(ellPts(M[0] + Math.cos(a) * d, M[1] + Math.sin(a) * d, 70 + 50 * (reach - 1), 52, 18, 1, a), { wash: '#F0D2A8', ink: PAL.ink, sw: 1.1 }); } },
        extras: () => { if (gulp > .7) { boilSeed('g1ph'); const P = ellPts(bp[0], bp[1], 130, 90, 26); paint(P, { wash: '#F8E4C4', ink: PAL.ink, sw: 1.1 }); pump7(bp[0] - 120, bp[1] - 40, .45, '#5FB5A8', 'g1p'); }
          bacterium(bp[0], bp[1], .9, t, 'g1bac', { mood: sizzle > .5 ? 'sleepy' : t > L(52, 6.0) ? 'wow' : 'calm', dizzy: sizzle > .8, grey: .6 * sizzle, ang: .2 * Math.sin(t * 2) });
          for (let i = 0; i < 6; i++) { const a = L(52, 8.4 + i * .25), k = seg(t, a, a + .6); if (k > 0) { const p = k < 1 ? [lerp(bp[0] - 150, bp[0] - 60 + (i % 3) * 50, k), lerp(bp[1] - 40, bp[1] - 40 + Math.floor(i / 3) * 70, k)] : [bp[0] - 60 + (i % 3) * 50, bp[1] - 40 + Math.floor(i / 3) * 70]; cu(p[0], p[1], 13, 0, 'g1in' + i, .3); } }
          if (sizzle > 0 && sizzle < 1) for (let i = 0; i < 5; i++) K.burst(bp[0] + (i - 2) * 40, bp[1] - 20, 40, frac(sizzle * 3 + i * .2), '#FFE7A0', 'g1sz' + i); } });
      // Pip feeds copper ammo to the pump
      const u = 30, P = [560, 820];
      let o = K.act(t, [[0, 'smug', { lookX: 1 }], [L(52, 5.4), 'wow', { lookX: 1, lookY: -.5 }], [L(52, 7.8), 'excited', { armF: [.8, 3.4] }], [L(52, 10.4), 'laugh', { armF: [1.3, 3.2], armB: [1.1, 3.0] }]]);
      const [gx, gy] = genie(P[0], P[1], u, t, o, 'g1pip');
      for (let i = 0; i < 3; i++) { const a = L(52, 7.9 + i * .3), k = seg(t, a, a + .5); if (k > 0 && k < 1) { const p = arcPt([gx + 3 * u, gy - 4 * u], [bp[0] - 150, bp[1] - 60], 140, ease(k)); cu(p[0], p[1], 14, 0, 'g1am' + i, .3); } }
    } else {
      K.wash('#E6EEF0', t, { key: 'g1h', blob: '#F4F8F9' });
      boilSeed('g1fl'); paint(rectPts(-300, 900, W + 600, 400), { wash: '#C9D6D8', ink: null });
      const dk = easeOut(seg(t, L(53, -.5), L(53, .6)));
      door(lerp(2400, 1260, dk), 560, .85, 'g1door');
      const H = [lerp(2400, 1260, dk) + 60, 560 - 30];
      for (let i = 0; i < 4; i++) { const land = L(53, 4.0 + i * .35), k = seg(t, land - .6, land), die = seg(t, L(53, 5.8 + i * .3), L(53, 6.4 + i * .3));
        if (k <= 0) continue; const p = k < 1 ? arcPt([H[0] + (i - 1.5) * 200, 100], [H[0] + (i - 1.5) * 34, H[1] - 14], 60, easeOut(k)) : [H[0] + (i - 1.5) * 34 + 80 * die, H[1] - 14 + 300 * die * die];
        bacterium(p[0], p[1], .45, t, 'g1b' + i, { mood: die > .1 ? 'sleepy' : 'calm', dizzy: die > .1 && die < .9, grey: die, ang: die * 2, seed: i }); }
      const u = 30; let o = K.act(t, [[L(53, -.5), 'smug', { lookX: 1 }], [L(53, 5.8), 'laugh'], [L(53, 7.0), 'smug', { armF: [.3, 3.4] }]]);
      const polish = on(t, L(53, 6.8), L(54, -1), .2, .2);
      const [gx, gy] = genie(polish > 0 ? 1180 : 620, polish > 0 ? 780 : 800, u, t, o, 'g1pip2');
      if (polish > 0) { const h = handPt(gx, gy, u, o); boilSeed('g1cloth'); paint(ellPts(h[0] + 10 * Math.sin(t * 14), h[1], 26, 18, 10, 2), { wash: '#F4E6C4', ink: PAL.ink, sw: .8 }); K.sparkle(H[0] + 20, H[1] - 20, 24, frac(t * 1.2), PAL.cream); }
    }
    camEnd();
    if (lt < .45) for (let i = 0; i < 7; i++) inkLine([[0, 150 + i * 130], [W * (1 - lt / .45), 150 + i * 130]], 3 * (1 - lt / .45), PAL.cream, 'ink', 0);
    flash(near(t, L(53, -.5), .15) * .9, PAL.cream);
    flash(seg(t, L(54, -1.4), L(54, -1.0)) * .95, '#1E2448');
  }

  // G2 · cuproptosis (L54 – L56), night navy
  function shotG2(t, lt, dur) {
    K.setT(t);
    const inMito = t > L(55, -.2) && t < L(55, 6.8);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    K.wash('#1E2448', t, { key: 'g2', blob: '#2C3566' });
    K.motes(t, 18, '#3F4A80', { key: 'g2m' });
    const u = 30;
    if (t < L(55, -.2)) {
      // a grumpy cell in the dark; a lightbulb (the 2022 discovery); copper drifts in, glowing
      K.cell(1150, 540, 300, '#C9A6C0', '#9C7A96', t, { key: 'g2c', mood: 'angry', nucleus: false, fx: -.5,
        extras: () => { [[1050, 450], [1250, 420], [1200, 660], [1020, 640], [1300, 560]].forEach(([x, y], i) => mito(x, y, .9, i, 'g2mi' + i, { glowK: .5 })); } });
      const bk = popK(seg(t, L(54, 2.2), L(54, 2.6))) * (1 + .1 * pulse(t, 4));
      if (bk > .05) { glow(560, 300, 160, '#FFE08A', .8); boilSeed('g2bulb'); paint(ellPts(560, 290, 60 * bk, 66 * bk, 18), { wash: '#FFF3C4', ink: PAL.ink, sw: 1.1 }); paint(rectPts(536, 350, 48, 36), { wash: '#B9C2CC', ink: PAL.ink, sw: 1 }); }
      for (let i = 0; i < 8; i++) { const a = L(54, 3.6 + i * .3), k = seg(t, a, a + 2.4); if (k <= 0) continue; const p = [lerp(200 + 80 * i, 1050 + (hash(i) - .5) * 300, easeOut(k)), lerp(900 - 40 * i, 450 + 250 * hash(i + 1), easeOut(k))]; cu(p[0], p[1], 16, 0, 'g2cu' + i, .9); }
      if (t > L(54, 8.0)) glow(1150, 540, 400, '#FF9A40', .5 * pulseK(t, L(54, 8.0), 1.4));
      genie(380, 820, u, t, K.act(t, [[0, 'calm', { lookX: 1 }], [L(54, 2.2), 'idea'], [L(54, 8.0), 'wow', { lookX: 1 }]]), 'g2pip');
    } else if (inMito) {
      // inside the mitochondrion: copper glues enzyme rings into a clump; Pip pulls and gets stuck in the "gum"
      boilSeed('g2mt'); paint(ellPts(960, 540, 900, 440, 40, 2), { wash: '#6E3E5A', fill: '#4E2A44', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.4 });
      const clump = ease(seg(t, L(55, 4.2), L(55, 5.6))), RS = [[640, 420], [900, 360], [1180, 430], [760, 660], [1060, 660], [1300, 600]];
      RS.forEach(([x, y], i) => { const c = [960 + (i % 3 - 1) * 70, 520 + (i < 3 ? -40 : 40)], p = [lerp(x, c[0], clump), lerp(y, c[1], clump)];
        ring_(p[0], p[1], 52, ['#E7B7D3', '#B9D99A', '#F2D08A', '#A9C8EC', '#E9B39A', '#C9B6EA'][i], 'g2r' + i);
        const ck = seg(t, L(55, 1.0 + i * .35), L(55, 1.5 + i * .35)); if (ck > 0) { const q = [lerp(p[0] - 300, p[0] + 30, easeOut(ck)), lerp(p[1] - 200, p[1] - 40, easeOut(ck))]; cu(q[0], q[1], 14, 0, 'g2g' + i, .6); } });
      if (clump > .5) for (let i = 0; i < 5; i++) { boilSeed('g2gum' + i); inkLine([[900 + i * 30, 480], [920 + i * 25, 560 + 10 * Math.sin(t * 3 + i)]], 3, '#E7B7D3', 'ink', .5); }
      const pull = seg(t, L(55, 4.8), L(55, 6.0)), snap = seg(t, L(55, 6.0), L(55, 6.4));
      const P = [lerp(1500, 1700, ease(pull)) - 400 * easeIn(snap), 760];
      const [gx, gy] = genie(P[0], P[1], u, t, { ...K.act(t, [[L(55, -.2), 'wow', { lookX: -1, flip: true }], [L(55, 4.6), 'strain', { flip: true, armF: [0, 3.6], armB: [.1, 3.4] }], [L(55, 6.1), 'dizzy', { flip: true }]]), sq: .3 * pull * (1 - snap) }, 'g2pip2');
      if (pull > 0) { boilSeed('g2str'); inkLine([[1060, 520], [lerp(gx - 3.4 * u, 1300, snap), gy - 3 * u]], 6 * (1 - pull * .5), '#E7B7D3', 'ink', .3); }
    } else if (t < L(56, -.3)) {
      // the cell wilts and crumbles; then: a respiring cell (many glowing mitochondria) dies, a quiet one doesn't
      const cr = seg(t, L(55, 6.8), L(55, 8.2)), side = t > L(55, 8.3);
      if (!side) { if (cr < .1) K.cell(1150, 540, 300, '#C9A6C0', '#9C7A96', t, { key: 'g2c', mood: 'sad', nucleus: false, fx: -.5 }); crumble(1150, 540, 300, cr, '#C9A6C0', 'g2cr'); }
      else {
        const hit = L(55, 10.6), die = seg(t, L(55, 11.6), L(55, 12.8));
        if (die < .1) K.cell(620, 560, 220, '#C9A6C0', '#9C7A96', t, { key: 'g2busy', mood: t > hit ? 'wow' : 'calm', nucleus: false, extras: () => { for (let i = 0; i < 7; i++) mito(620 + Math.cos(i) * 120, 560 + Math.sin(i * 1.3) * 110, .6, i, 'g2bm' + i, { glowK: .7 }); } });
        crumble(620, 560, 220, die, '#C9A6C0', 'g2bcr');
        K.cell(1320, 560, 220, '#A9C0D9', '#7F98B8', t, { key: 'g2quiet', mood: 'calm', nucleus: false, seed: 4, extras: () => { mito(1300, 600, .6, .4, 'g2qm', {}); } });
        for (let i = 0; i < 6; i++) { const a = L(55, 9.4 + (i % 3) * .3), k = seg(t, a, hit); if (k <= 0 || (i < 3 && die > .1)) continue; const tgt = i < 3 ? [620 + (i - 1) * 60, 520] : [1320 + (i - 4) * 60, 520]; cu(lerp(tgt[0], tgt[0], k), lerp(100, tgt[1], easeOut(k)), 14, 0, 'g2sd' + i, .8); }
        if (t > L(55, 12.8)) K.check(1320, 260, 70, seg(t, L(55, 12.8), L(55, 13.4)), 'g2ck');
      }
      genie(220, 860, u, t, K.act(t, [[L(55, 6.8), 'sad', { lookX: 1 }], [L(55, 8.6), 'wow', { lookX: 1 }], [L(55, 12.0), 'idea']]), 'g2pip3');
    } else {
      // L56: Pip loads a copper dart and throws it at a grumpy tumour cell; it boomerangs, the second one hits
      const TC = [1300, 520], hit2 = L(56, 4.9), die = seg(t, L(56, 5.4), L(56, 6.8));
      if (die < .1) K.cell(TC[0], TC[1], 260, '#B98AB0', '#8E6086', t, { key: 'g2tum', mood: t > hit2 ? 'wow' : 'angry', nucleus: false, fx: -.4, extras: () => { for (let i = 0; i < 6; i++) mito(TC[0] + Math.cos(i * 1.1) * 140, TC[1] + Math.sin(i * 1.1) * 120, .7, i, 'g2tm' + i, { glowK: .7 }); } });
      crumble(TC[0], TC[1], 260, die, '#B98AB0', 'g2tcr');
      const P = [480, 780], thr1 = seg(t, L(56, 2.6), L(56, 4.0)), thr2 = seg(t, L(56, 4.3), hit2);
      if (thr1 > 0 && thr1 < 1) { const a = thr1 * TAU * .9, p = [P[0] + 400 + Math.cos(a - Math.PI) * 400 + 400 * Math.sin(thr1 * Math.PI) * 0, P[1] - 300 + Math.sin(a) * 260]; dart(p[0], p[1], 1.2, a + Math.PI / 2, 'g2d1'); }
      if (thr2 > 0 && thr2 < 1) { const p = arcPt([P[0] + 90, P[1] - 140], TC, 160, easeIn(thr2)); dart(p[0], p[1], 1.2, Math.atan2(TC[1] - P[1], TC[0] - P[0]), 'g2d2'); }
      K.burst(TC[0], TC[1], 120, seg(t, hit2, hit2 + .4), '#FFE7A0', 'g2hit');
      let o = K.act(t, [[L(56, -.3), 'smug', { lookX: 1 }], [L(56, 2.4), 'excited', { armF: [1.4, 3.2] }], [L(56, 3.3), 'wow', { lookX: -1, take: 1.3 }], [L(56, 4.2), 'angry', { armF: [1.3, 3.2] }], [hit2 + .2, 'laugh'], [L(56, 6.6), 'smug']]);
      const [g4x, g4y] = genie(P[0], P[1], u, t, o, 'g2pip4');
      if (t > L(56, .6) && t < L(56, 2.6)) { const h = handPt(g4x, g4y, u, o); dart(h[0] + 20, h[1] - 10, 1.2, -.5, 'g2load'); }
    }
    camEnd();
    flash(Math.max(1 - seg(lt, 0, .4), near(t, L(55, -.2), .15), near(t, L(55, 6.8), .15), near(t, L(55, 8.3), .12), near(t, L(56, -.3), .15)) * .9, '#1E2448');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#C99A55', '#F6D68C']);
  }

  // G3 · everyday (L57 – L58), the opening table, golden
  function nut(x, y, s, key) { boilSeed('nt' + key); paint(ellPts(x, y, 40 * s, 32 * s, 16, 2), { wash: '#C98E5A', fill: '#9E6A3E', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1 }); inkLine([[x, y - 30 * s], [x, y + 30 * s]], 1, '#7A4E2A', 'ink', .5); }
  function bean(x, y, s, key) { boilSeed('bn' + key); for (let i = 0; i < 3; i++) paint(ellPts(x + (i - 1) * 34 * s, y + (i % 2) * 8 * s, 22 * s, 15 * s, 12, 0, .3 * i), { wash: '#B8452F', ink: PAL.ink, sw: .9 }); }
  function wheat(x, y, s, key) { boilSeed('wh' + key); inkLine([[x, y + 60 * s], [x, y - 60 * s]], 2, '#B8962E', 'ink', .3); for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) paint(ellPts(x + sd * 12 * s, y - 50 * s + i * 20 * s, 9 * s, 14 * s, 10, 0, sd * .5), { wash: '#E8C66A', ink: PAL.ink, sw: .7 }); }
  function oyster(x, y, s, key) { boilSeed('oy' + key); paint(ellPts(x, y, 60 * s, 36 * s, 18, 3, -.2), { wash: '#C9C4BE', fill: '#9C968E', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1 }); paint(ellPts(x, y - 4 * s, 34 * s, 18 * s, 14, 0, -.2), { wash: '#EFE4D2', ink: PAL.ink, sw: .8 }); }
  function choc(x, y, s, key) { boilSeed('ch' + key); paint(rrPts(x - 70 * s, y - 34 * s, 140 * s, 68 * s, 8 * s), { wash: '#6E4232', ink: PAL.ink, sw: 1 }); for (let i = 1; i < 4; i++) inkLine([[x - 70 * s + i * 35 * s, y - 34 * s], [x - 70 * s + i * 35 * s, y + 34 * s]], 1, '#4A2A1E', 'ink', 0); inkLine([[x - 70 * s, y], [x + 70 * s, y]], 1, '#4A2A1E', 'ink', 0); }
  function pillBottle(x, y, s, tip, key) { boilSeed('pb' + key); push(); translate(x, y); rotate(tip); scale(s); paint(rrPts(-50, -80, 100, 160, 16), { wash: '#EEF5F8', ink: PAL.ink, sw: 1.1 }); paint(rrPts(-56, -110, 112, 36, 8), { wash: '#A9B2BC', ink: PAL.ink, sw: 1 }); paint(rrPts(-40, -30, 80, 60, 8), { wash: '#B9C2CC', ink: null }); pop(); }
  function shotG3(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 560 + 4 * wob(t, .04), 1.05);
    table(t, 'g3', 1);
    lamp(LAMP[0] - 150, LAMP[1], .8, t, 'g3lamp', { lid: 1 });
    const u = 32;
    if (t < L(58, -.3)) {
      const items = [[nut, 900, 770], [bean, 1130, 780], [wheat, 1340, 700], [oyster, 1540, 780], [choc, 1760, 780]], keys = [5.9, 6.6, 7.3, 8.0, 9.4];
      items.forEach(([fn, x, y], i) => { const k = easeOut(seg(t, L(57, keys[i]), L(57, keys[i] + .5))); if (k <= 0) return; const eaten = seg(t, L(57, 11.0 + i * .25), L(57, 11.4 + i * .25)); if (eaten >= 1) return;
        fn(lerp(2400, x, k), y - 20 * Math.sin(k * Math.PI), 1.6, 'g3f' + i);
        for (let j = 0; j < 3; j++) K.sparkle(lerp(2400, x, k) + (j - 1) * 46, y - 70, 20, frac(t * .9 + j / 3 + i * .2), Z.cuLt); });
      // a tiny speck of copper between Pip's fingers (不到一毫克)
      const sk = on(t, L(57, 1.8), L(57, 5.4));
      let o = K.act(t, [[L(57, -1), 'calm', { lookX: 1 }], [L(57, 1.8), 'idea', { armF: [1.0, 3.2] }], [L(57, 5.6), 'happy', { lookX: 1 }], [L(57, 10.8), 'laugh', { armF: [.4, 3.4] }], [L(57, 12.0), 'love']]);
      if (t > L(57, 10.9) && t < L(57, 12.4)) o = { ...o, sq: (o.sq || 0) + .12 * Math.abs(Math.sin(t * 14)) };
      const [gx, gy] = genie(560, 760, u, t, o, 'g3pip');
      if (sk > 0) { const h = handPt(gx, gy, u, o); cu(h[0] + 6, h[1] - 14, 7 * sk + .1, 0, 'g3speck', .6, 0); K.sparkle(h[0] + 20, h[1] - 40, 20, frac(t * 1.2), PAL.cream); }
    } else {
      // L58: a fistful of zinc pills; inside, zinc builds a door in front of the copper; the door slams, Pip is flattened
      const tip = seg(t, L(58, .6), L(58, 1.2)), gulp = seg(t, L(58, 1.6), L(58, 2.8)), wall = seg(t, L(58, 3.6), L(58, 5.0)), slam = L(58, 7.8), flat = seg(t, slam, slam + .15), peel = seg(t, L(58, 8.6), L(58, 9.8));
      pillBottle(1100, 700, 1, -1.6 * ease(tip) * (1 - ease(seg(t, L(58, 3.0), L(58, 3.4)))), 'g3pb');
      for (let i = 0; i < 8; i++) { const k = seg(gulp, i * .06, i * .06 + .5); if (k > 0 && k < 1) { const p = arcPt([1020, 640], [640, 520], 80, k); boilSeed('g3pill' + i); paint(ellPts(p[0] + (i % 3) * 14, p[1] + (i % 2) * 10, 14, 8, 10, 0, i), { wash: '#C9D0D8', ink: PAL.ink, sw: .7 }); } }
      // the gut door: a cream archway; copper beads try to get in; zinc beads stack up into a door and it slams
      const DX = 1450, DY = 820;
      if (t > L(58, 3.2)) { boilSeed('g3arch'); paint([[DX - 180, DY], [DX - 180, DY - 360], [DX, DY - 470], [DX + 180, DY - 360], [DX + 180, DY]], { wash: '#F4EBC9', ink: PAL.ink, sw: 1.2, curv: .4 });
        for (let i = 0; i < 12; i++) { const k = popK(seg(wall, i / 12 * .7, i / 12 * .7 + .3)); if (k > .05) { boilSeed('g3zn' + i); paint(ellPts(DX - 130 + (i % 4) * 86, DY - 60 - Math.floor(i / 4) * 100, 34 * k, 34 * k, 12), { wash: Z.zn, ink: PAL.ink, sw: .9 }); } }
        for (let i = 0; i < 3; i++) { const a = L(58, 5.0 + i * .4), k = seg(t, a, a + 1.2); if (k > 0 && k < 1) { const p = k < .5 ? [lerp(DX + 420, DX + 200, k * 2), DY - 160 - i * 60] : [lerp(DX + 200, DX + 460, (k - .5) * 2), DY - 160 - i * 60 - 120 * Math.sin((k - .5) * Math.PI)]; cu(p[0], p[1], 18, 0, 'g3bo' + i, .3); } }
        K.burst(DX, DY - 200, 260, seg(t, slam, slam + .4), PAL.ink, 'g3slam'); }
      let o = K.act(t, [[L(58, -.3), 'calm', { lookX: 1 }], [L(58, 1.4), 'excited', { armF: [1.2, 3.2] }], [L(58, 3.0), 'smug', { armsFront: true, armF: { at: [1.2, -1.6] } }], [L(58, 6.2), 'confused', { lookX: 1 }], [slam, 'dizzy'], [L(58, 9.6), 'worried', { blush: 0 }]]);
      if (gulp > 0 && gulp < 1) o = { ...o, sq: (o.sq || 0) + .2 * Math.sin(gulp * Math.PI) };
      const peek = seg(t, L(58, 6.2), L(58, 7.4));
      let P = [640 + 600 * ease(peek), 760];
      if (flat > 0 && peel < 1) o = { ...o, sq: .7 * (1 - ease(peel)), emote: null };
      const pale = ease(seg(t, L(58, 9.0), L(58, 10.0)));
      const [gx, gy] = genie(P[0], P[1] + 40 * flat * (1 - peel), u, t, { ...o, leaf: (o.leaf || 0) - 1.1 * pale }, 'g3pip2', null, { pip: '#B9A7BC', pipDk: '#8E7B92', belly: '#EFE4EA' }, .7 * pale);
      if (flat > 0 && peel < 1) stars(gx, gy - 3 * u, 50, t, 'g3dz');
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#C99A55', '#F6D68C']);
  }

  // ================================ H · ending (L59 – L60) ================================
  function shotH(t, lt, dur) {
    K.setT(t);
    const inside = t > L(59, 5.4) && t < L(60, -.5);
    if (inside) {                                                      // follow the breath in: an O₂ lands beside the copper in complex IV
      camBegin(X4 + 60 + 5 * wob(t, .05), 560 + 3 * wob(t, .04), 2.0 + .1 * seg(t, L(59, 5.4), L(60, -.5)));
      membrane(t, 'h', 0, 600, 2000);
      const land = ease(seg(t, L(59, 6.4), L(59, 8.2)));
      cox(t, 1, { lid: 1, win: 1, cuA: 1, o2: land > .98 ? 1 : 0, hi: { cuB: pulseK(t, L(59, 8.2), 1.6), hemeA3: pulseK(t, L(59, 8.2), 1.6) } }, 'hiv');
      if (land < .98) { const p = [lerp(X4 + 260, ivAt(IV.o2)[0], land), lerp(MY + 300, ivAt(IV.o2)[1], land)]; o2(p[0], p[1], .8, land * 2, 'ho'); }
      glow(ivAt(IV.cuB)[0], ivAt(IV.cuB)[1], 90, '#FFB070', .6 * pulseK(t, L(59, 8.2), 1.6));
      camEnd();
      flash(Math.max(1 - seg(t, L(59, 5.4), L(59, 5.9)), seg(t, L(60, -.9), L(60, -.5))), PAL.cream);
      return;
    }
    const close = seg(t, DUR - 3.3, DUR - .6), pushIn = t < L(60, -1) ? easeIn(seg(t, L(59, 4.6), L(59, 5.4))) : 0, endK = ease(seg(t, L(60, 9.0), L(60, 12.0)));
    camBegin(lerp(lerp(1030, 760, endK), 790, pushIn) + 6 * wob(t, .05), lerp(lerp(600, 680, endK), 520, pushIn) + 4 * wob(t, .04), lerp(lerp(1.1, 1.3, endK), 5, pushIn));
    table(t, 'h', 1);
    bowl(1660, 812, 1, 'hb');
    const back = t > L(60, 7.6), settle = spring(t, L(60, 8.6), 4, 12);
    balance(PIV[0], PIV[1], .9, .03 * settle, 'hs', (px, py) => dust(px, py, 1, 1, 'hd', t), (px, py) => { for (let i = 0; i < 4; i++) grain(px - 36 + i * 24, py - 8 - (i % 2) * 8, 1.1, .2 + i * .7, 'hr' + i); });
    for (let i = 0; i < 4; i++) K.sparkle(PIV[0] + 270 * .9 - 36 + i * 24, PIV[1] + 190 * .9 - 30, 18, seg(t, L(60, 2.2 + i * .25), L(60, 3.0 + i * .25)), PAL.cream);
    const spoutHome = lamp(LAMP[0], LAMP[1], 1, t, 'hl', { rattle: on(t, L(60, 13.0), L(60, 13.6), .05, .1), lid: t < L(60, 12.4) ? 1 : 1 - ease(seg(t, L(60, 12.4), L(60, 12.8))) });
    // Pip: deep breath (L59), then passes one bead hand to hand and lays it back on the pan; winks, waves, poofs into the lamp
    const u = 31, breath = on(t, L(59, .4), L(59, 4.2), .9, .4), suck = L(60, 10.8), gone = seg(t, suck, suck + 1.1);
    const P = t < L(60, 0) ? [760, 600] : kf(t, [[L(60, 0), [760, 560]], [L(60, 4.4), [800, 520]], [L(60, 7.8), [760, 540]]], ease);
    let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(59, .4), 'strain', { armF: [1.1, 3.0], armB: [1.0, 2.8] }], [L(59, 4.6), 'wow'],
      [L(60, -.4), 'calm', { lookX: 1, lookY: .6 }], [L(60, 4.3), 'shy', { lookX: 1, lookY: .4 }], [L(60, 7.8), 'happy', { lookX: 1, lookY: .6 }], [L(60, 9.2), 'wink', { lookX: 0, lookY: 0 }], [L(60, 10.0), 'wave', { lookX: 0 }]]);
    o = { ...o, sq: (o.sq || 0) - .35 * breath + .3 * seg(t, L(59, 4.2), L(59, 4.6)) * (1 - seg(t, L(59, 4.6), L(59, 5.2))) };
    const pass = t > L(60, 4.4) && t < L(60, 7.6), pk = (t - L(60, 4.4)) / 3.2;
    if (pass) o = { ...o, armF: [.4 + .8 * Math.max(0, Math.sin(pk * TAU)), 3.0], armB: [.4 + .8 * Math.max(0, -Math.sin(pk * TAU)), 2.8] };
    if (gone < 1) {
      const sp = [spoutHome[0] + 10, spoutHome[1] - 10], x = lerp(P[0], sp[0], easeIn(gone)), y = lerp(P[1], sp[1], easeIn(gone));
      const [hx_, hy_] = genie(x, y, u * (1 - .85 * easeIn(gone)), t, o, 'hpip', gone > 0 ? [sp[0], sp[1] + 6] : null);
      for (let i = 0; i < 4; i++) if (gone > 0) puff(lerp(x, sp[0], .5) + Math.cos(t * 6 + i * 1.6) * 60 * (1 - gone), lerp(y, sp[1], .5) - 40 + Math.sin(t * 6 + i * 1.6) * 40 * (1 - gone), 30 * (1 - gone) + 4, 1 - gone, 'hsw' + i);
      if (t < L(59, 4.6) && t > L(59, 2.0)) for (let i = 0; i < 5; i++) { const k = frac((t - L(59, 2.0)) * .8 + i / 5); o2(lerp(x + 500, x + 30, k), lerp(y - 3 * u - 200 + 80 * i, y - 2.6 * u, k), .6 * (1 - .5 * k), k * 3, 'hbr' + i); }
      if (pass) { const hF = handPt(hx_, hy_, u, o), hB = handPt(hx_, hy_, u, o, 'B'), q = .5 - .5 * Math.cos(pk * TAU * 1.5);
        cu(lerp(hB[0], hF[0], q), lerp(hB[1], hF[1], q) - 40 * Math.sin(q * Math.PI), 16, 0, 'hpass', .4); }
      if (t > L(60, .2) && t < L(60, 4.4)) { const h = handPt(hx_, hy_, u, o); cu(h[0] + 6, h[1] - 10, 16 * popK(seg(t, L(60, .2), L(60, .6))), 0, 'hlift', .4); }
      if (t > L(60, 7.6) && t < L(60, 8.6)) { const k = seg(t, L(60, 7.6), L(60, 8.6)), pan = [PIV[0] - 270 * .9, PIV[1] + 190 * .9 - 40]; cu(lerp(x + 2.8 * u, pan[0], ease(k)), lerp(y - 3.4 * u, pan[1], ease(k)) - 80 * Math.sin(k * Math.PI), 16, 0, 'hdrop', .4); }
    } else K.burst(spoutHome[0], spoutHome[1], 60, seg(t, suck + 1.1, suck + 1.5), PAL.ink, 'hpop');
    camEnd();
    flash(Math.max(t > L(60, -.5) ? 1 - seg(t, L(60, -.5), L(60, -.1)) : 0, 1 - seg(lt, 0, .4), t < L(60, -1) ? seg(t, L(59, 5.0), L(59, 5.4)) : 0), PAL.cream);
    if (close > 0) iris(...toScreen(LAMP[0] + 40, LAMP[1] - 110, LAST_CAM), kf(close, [[0, 1900], [.55, 260], [.8, 240], [1, 0]], easeIn), PAL.ink);
  }

  // ================================ placeholder for unbuilt shots ================================
  const todo = col => (t) => { K.wash(col, t, { key: 'todo' }); };

  // ================================ the cover (its own design; node render.mjs --page=copper.html --loop=cover --stills=.5) ================================
  // 「铜：你过关！」 copper clears the checkpoint: the membrane is a border wall, CTR1 the gate (green light, barrier up);
  // the copper sails through to a claw waiting inside; Pip the gatekeeper raises a green ✓ paddle; a radical is turned back.
  function stamp(x, y, r, rot, key) {                              // a red approval seal with a ✓
    boilSeed('stp' + key);
    push(); translate(x, y); rotate(rot);
    for (const rr of [r, r * .82]) { const P = ellPts(0, 0, rr, rr, 40, 2); inkLine(P.concat([P[0], P[1]]), rr === r ? 2.6 : 1.4, '#D2413F', 'ink', .4); }
    inkLine([[-r * .4, 0], [-r * .1, r * .32], [r * .45, -r * .35]], 3.2, '#D2413F', 'ink', 0);
    pop();
  }
  LOOPS.cover = t => {
    K.setT(t);
    const WX = 1290, GY = 600;                                      // the membrane wall and the gate
    boilSeed('cvL'); paint(rectPts(-100, -100, WX + 100, 1300), { wash: '#F7E6BE', ink: null });
    boilSeed('cvR'); paint(rectPts(WX, -100, 900, 1300), { wash: '#A9D6C8', ink: null });
    for (let i = 0; i < 4; i++) { boilSeed('cvbl' + i); paint(ellPts(200 + 300 * i, 160 + 700 * hash(i + 3), 260, 110, 16, 5), { fill: '#FCF1D6', fillOp: 85, bleed: .3, tex: .4, ink: null }); }
    for (let i = 0; i < 3; i++) { boilSeed('cvbr' + i); paint(ellPts(WX + 150 + 400 * hash(i), 150 + 800 * hash(i + 1), 220, 110, 16, 5), { fill: '#C6E6DB', fillOp: 80, bleed: .3, tex: .4, ink: null }); }
    K.motes(.3, 16, '#E9CF9C', { key: 'cvm' });
    const Tk = K.track([[WX, -200], [WX, 1300]]);
    K.bilayer(Tk, 1.6, { key: 'cvw1', from: 0, to: GY + 200 - 120 }); K.bilayer(Tk, 1.6, { key: 'cvw2', from: GY + 200 + 120, to: 1500 });
    push(); translate(WX, GY); rotate(-Math.PI / 2); translate(-WX, -GY); ctr1(WX, GY, 1.5, 1, 'cvgate'); pop();
    // the green light over the gate, and the barrier swung up
    boilSeed('cvlight'); paint(rrPts(WX - 46, GY - 330, 92, 150, 20), { wash: '#4B4250', ink: PAL.ink, sw: 1.2 });
    paint(ellPts(WX, GY - 292, 26, 26, 14), { wash: '#6E5A5A', ink: PAL.ink, sw: .8 });
    glow(WX, GY - 222, 120, '#7CFF8A', 1); paint(ellPts(WX, GY - 222, 28, 28, 14), { wash: '#6CD07A', ink: PAL.ink, sw: .9 });
    boilSeed('cvbar'); const pv = [WX - 70, GY + 190], ba = -1.15, bl = 300;
    for (let i = 0; i < 6; i++) { const a0 = i / 6, a1 = (i + 1) / 6; paint(ribbon([[pv[0] + Math.cos(ba) * bl * a0, pv[1] + Math.sin(ba) * bl * a0], [pv[0] + Math.cos(ba) * bl * a1, pv[1] + Math.sin(ba) * bl * a1]], 26, 26), { wash: i % 2 ? PAL.cream : '#D2413F', ink: PAL.ink, sw: 1 }); }
    paint(ellPts(pv[0], pv[1], 22, 22, 12), { wash: '#6F7984', ink: PAL.ink, sw: 1 });
    // inside: a chaperone claw waiting with open hands
    chap(1790, GY + 10, 1.5, Math.PI, 'cvclaw', { open: .8, tipHi: { c: .6, m: .6 } });
    // the copper sails through the gate
    const B = [WX + 215, GY];
    glow(B[0], B[1], 260, '#FFB070', .9);
    for (let i = 0; i < 3; i++) inkLine([[B[0] - 100, B[1] - 34 + i * 34], [B[0] - 190 - i * 20, B[1] - 34 + i * 34]], 1.4, '#9A4F22', 'ink', 0);
    cu(B[0], B[1], 80, 0, 'cvcu', 0);
    for (let i = 0; i < 4; i++) K.sparkle(B[0] + Math.cos(i * 1.6 + .4) * 130, B[1] + Math.sin(i * 1.6 + .4) * 120, 30 - 4 * i, .35, '#FFF3C4');
    // a radical, turned back
    radical(1090, 330, 60, .4, 'cvrad'); K.cross(1090, 330, 86, 1, 'cvx');
    // the lamp (Pip's home) and Pip the gatekeeper, in a guard cap, raising a green ✓ paddle
    const sp = lamp(560, 1080, .7, .2, 'cvlamp', { lid: 1 });
    const u = 62, P = [1010, 990];
    const o = { ...pipFeel('wink', .3), lookX: 1, lookY: -.3, armF: [1.25, 3.4], armB: { at: [-1.6, -1.4] }, rot: .04, weight: 1.3 };
    genie(P[0], P[1], u, .3, { ...o, still: true, puff: .6 }, 'cvpip', [sp[0] + 6, sp[1] + 8]);
    cap(P[0], P[1], u, o, '#3E6FA8', 'cvcap');
    const h = handPt(P[0], P[1], u, o); boilSeed('cvpad');
    paint(ribbon([[h[0], h[1] + 10], [h[0] + 6, h[1] - 120]], 12, 12), { wash: '#C99A5E', ink: PAL.ink, sw: 1 });
    paint(ellPts(h[0] + 8, h[1] - 190, 82, 82, 26), { wash: '#3E9A4E', ink: PAL.ink, sw: 1.4 });
    inkLine([[h[0] - 30, h[1] - 192], [h[0] - 2, h[1] - 160], [h[0] + 48, h[1] - 226]], 3.4, PAL.cream, 'ink', 0);
    // the words
    const F = (wgt, px) => `${wgt} ${px}px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif`;
    boilSeed('cvtag'); paint(rrPts(80, 84, 520, 96, 32, 2), { wash: '#C8692E', fill: '#9A4F22', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
    letter('Pip讲 · 微量元素', 340, 134, 50, PAL.cream, { font: F(800, 50), screen: true });
    letter('铜：', 84, 360, 210, '#C8692E', { font: F(900, 210), align: 'left', stroke: '#3B2F45', screen: true });
    letter('你过关！', 84, 600, 200, '#3E9A4E', { font: F(900, 200), align: 'left', stroke: '#3B2F45', screen: true, rot: -.02 });
    stamp(640, 330, 96, -.22, 'cvst');
  };
  LOOPS.cover.len = 1;

  shots([[0, shotA1], [L(2, -.05), shotA2], [L(5, -1.1), shotA3], [L(6, -1.4), shotB1], [L(8, -1.2), shotB2], [L(11, -1.3), shotB3], [L(12, -1.0), shotC1], [L(14, -1.0), shotC2], [L(20, -.8), shotC4], [L(23, -.6), shotC5], [L(25, -1.4), shotD1], [L(28, -1.2), shotD2], [L(31, -1.2), shotD3], [L(33, -1.2), shotD4], [L(34, -.5), shotR1], [L(35, -.2), shotE1], [L(38, -1.0), shotE2], [L(41, -.8), shotE3], [L(44, -1.4), shotF1], [L(48, -1.2), shotF2], [L(51, -.8), shotR2], [L(52, -1.2), shotG1], [L(54, -1.0), shotG2], [L(57, -1.4), shotG3], [L(59, -1.2), shotH]]);
})();

// selenium.js: "Pip讲身体里的硒", 792.7 s. A hot open (Pip binges on Brazil nuts and loses its leaf), then why such a
// touchy element is worth a rewritten genetic code: selenium under sulfur in the periodic table, selenocysteine (the
// 21st amino acid) put in at a UGA stop codon, the Se-can-come-back trick (GPx and glutathione, sulfur that burns,
// GPx4 and ferroptosis, the Sec→Cys mice), the thyroid's deiodinases, TrxR, SELENOP and the selenoprotein hierarchy,
// then the soil: Keshan disease and Beck's virus (too little), hooves, hair and garlic breath (too much), and food.
// More slapstick than copper on purpose: every gag acts out a step of the chemistry. See storyboards/selenium.md.
// Props from mrna_kit.js (MK); helpers copied from copper.js, xenocortex.js and pip.js say where they came from.
// Every time is tied to a voice line: L(i, d) = line i's start + d seconds.
(() => {
  const K = MK;
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const Z = {
    se: '#C8323C', seDk: '#8A1F2A', seLt: '#F08A8A', sul: '#E8C547', sulDk: '#B8932A', burnt: '#5A5560',
    o: '#8CC8EE', oDk: '#4F8FC0', water: '#6FB2E3', h2o2: '#B79AD6', h2o2Dk: '#8668AE', rad: '#D2427E', radDk: '#8E1F52',
    fe: '#A0522D', feDk: '#6E3518', iod: '#7B5CC4', iodDk: '#523A92',
    shell: '#86593A', shellDk: '#5A3822', shellLt: '#B08058', kernel: '#F3E6CC',
    garlic: '#C9DE9A', garlicDk: '#8DA65A',
    // worlds
    wall: '#EBCBA3', wallBlob: '#F4DCBC', floor: '#B98657', floorDk: '#8F6238', night: '#2F3A68', nightDk: '#232B52',
    sofa: '#6FA3A0', sofaDk: '#4C7C79', sofaLt: '#93C0BC', pot: '#C9714A', potDk: '#97502F', cact: '#7BAF62', cactDk: '#4F7F3E',
    sky: '#27305A', skyBlob: '#323D6E', cliffL: '#8790A2', cliffLDk: '#5F687C', cliffR: '#8E9A5E', cliffRDk: '#66713E'
  };
  const SOOT = { pip: '#4C4249', pipDk: '#2F282D', belly: '#6E6168', leaf: '#4A4440', leafDk: '#2E2A27' };
  const BLOND = { leaf: '#F1E3A6', leafDk: '#C9B36A' };
  const BASE = { pip: PIPC.pip, pipDk: PIPC.pipDk, belly: PIPC.belly, leaf: PIPC.leaf, leafDk: PIPC.leafDk };
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));
  const pulseK = (t, a, len = .7) => t > a && t < a + len ? Math.sin(seg(t, a, a + len) * Math.PI) : 0;
  const on = (t, a, b, fi = .3, fo = .3) => Math.min(ease(seg(t, a, a + fi)), 1 - ease(seg(t, b - fo, b)));   // 0→1 at a, 1→0 at b
  const popK = k => k <= 0 ? 0 : backOut(clamp(k));                 // a pop-in scale; callers skip drawing while it is < .05
  const rotPts = (P, x, y, a, s = 1) => P.map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s]);
  const NOLEAF = Math.PI;                                          // pip.js draws the leaf before the body: pointing it down hides it

  // ---------- Pip, recoloured (from copper.js tinted/pipT, with the leaf added to the tint) ----------
  function tinted(cols, fn) { const old = {}; for (const c in cols) old[c] = PIPC[c]; Object.assign(PIPC, cols); try { fn(); } finally { Object.assign(PIPC, old); } }
  function pipT(x, y, u, o, tint = null, k = 0) {
    if (!tint || k <= .01) return pip(x, y, u, o);
    const cols = {}; for (const c in tint) cols[c] = mixCol(BASE[c], tint[c], clamp(k));
    tinted(cols, () => pip(x, y, u, o));
  }
  // where Pip's hand is, in world space (from copper.js handPt: the same arm maths as pip.js). which = 'F' or 'B'.
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
  // head top and mouth, in world space (from copper.js)
  const headOf = (x, y, u, o) => [x, y + (o.dy || 0) * u - (1 - (o.sq || 0)) * 5 * u];
  const mouthOf = (x, y, u, o) => { const d = o.flip ? -1 : 1, sq = o.sq || 0, fx = (o.turn ?? .4) * .38 * u; return [x + d * (1 + sq) * fx * 1.05, y + (o.dy || 0) * u - (1 - sq) * 2.55 * u]; };
  // Pip's leaf on its own, as a prop (the blade and stalk from pip.js); (x, y) = the stalk's foot
  function leafProp(x, y, u, ang, key, col = PIPC.leaf, dk = PIPC.leafDk) {
    boilSeed('lf' + key);
    const tip = [x + Math.sin(ang) * 1.6 * u * .6, y - Math.cos(ang) * 1.5 * u * .6], sw = clamp(u / 22, .7, 1.6);
    inkLine([[x, y], [lerp(x, tip[0], .4) - .1 * u, lerp(y, tip[1], .5)], tip], sw * 1.2, dk, 'ink', .6);
    const a = ang - 1.05, Ln = 1.5 * u, Wd = .55 * u, lp = [];
    for (let i = 0; i <= 8; i++) { const k = i / 8, w = Math.sin(k * Math.PI) * Wd * (1 - .25 * k); lp.push([k * Ln, -w]); }
    for (let i = 7; i >= 1; i--) { const k = i / 8, w = Math.sin(k * Math.PI) * Wd * (1 - .25 * k); lp.push([k * Ln, w]); }
    paint(rotPts(lp, tip[0], tip[1], a), { wash: col, fill: dk, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .75, curv: .4 });
    inkLine(rotPts([[.1 * u, 0], [Ln * .55, -.03 * u], [Ln * .85, 0]], tip[0], tip[1], a), sw * .45, dk, 'inkfine', .5);
  }

  // ---------- small effects ----------
  // soft puffs (after copper.js puff), garlic green by default
  function puff(x, y, r, k, key, col = Z.garlic) {
    if (k <= .3 || r < 2) return; boilSeed('pf' + key);
    for (let i = 0; i < 4; i++) { const a = i * 1.7 + .4, d = r * .45 * hash(i + 3); paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d * .6, r * (.55 + .3 * hash(i)) * k, r * (.45 + .25 * hash(i + 1)) * k, 14, 1), { wash: col, ink: PAL.ink, sw: .7 }); }
  }
  function stink(x, y, h, t, k, key, col = Z.garlicDk) {            // a wavy stink line rising from (x, y)
    if (k <= .02) return; boilSeed('sk' + key);
    const P = []; for (let i = 0; i <= 8; i++) { const q = i / 8; P.push([x + 9 * Math.sin(q * 9 + t * 6), y - q * h * k]); }
    inkLine(P, 2.2, col, 'ink', .6);
  }
  function stars(x, y, r, t, key, n = 3) {                         // dizzy stars circling a head (from copper.js)
    boilSeed('dz' + key);
    for (let i = 0; i < n; i++) { const a = t * 4 + i / n * TAU; paint(starPts(x + Math.cos(a) * r, y + Math.sin(a) * r * .35, r * .22, .45, 5, t * 3), { wash: '#F2C14A', ink: PAL.ink, sw: .7 }); }
  }
  function inset(x, y, r, k, key, draw) {                          // a round inset bubble, a close-up drawn inside (from copper.js)
    const q = popK(k); if (q < .05) return; boilSeed('in' + key);
    paint(ellPts(x, y, r * q, r * q, 36), { wash: PAL.cream, ink: PAL.ink, sw: 1.4 });
    push(); translate(x, y); scale(q); translate(-x, -y); draw(); pop();
  }
  function streaks(k, key, vertical = false, col = PAL.cream) {     // speed lines for a whip pan or a rewind (screen space)
    if (k <= .15) return;
    for (let i = 0; i < 14; i++) {
      boilSeed('sl' + key + i);
      const p = hash(i + 3), len = (260 + 520 * hash(i + 9)) * k, w = 2 + 5 * hash(i + 5);
      if (vertical) { const x = p * W; inkLine([[x, H * hash(i + 11) - len / 2], [x, H * hash(i + 11) + len / 2]], w, col, 'ink', 0); }
      else { const y = p * H; inkLine([[W * hash(i + 11) - len / 2, y], [W * hash(i + 11) + len / 2, y]], w, col, 'ink', 0); }
    }
  }
  // a waxing moon, k = 0 new → 1 full (from xenocortex.js)
  function moon(x, y, r, k, key) {
    boilSeed('mn' + key);
    paint(ellPts(x, y, r, r, 24), { wash: '#4A5378', ink: PAL.ink, sw: .9 });
    const P = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    for (let i = 16; i >= 0; i--) { const a = -Math.PI / 2 + i / 16 * Math.PI; P.push([x + Math.cos(a) * r * (1 - 2 * k), y + Math.sin(a) * r]); }
    if (k > .02) paint(P, { wash: '#F8E7A8', ink: null });
  }
  function nightStars(x0, y0, w, h, n, t, key) {
    for (let i = 0; i < n; i++) { const tw = .6 + .4 * Math.sin(t * 2 + i * 1.7); boilSeed('ns' + key + i);
      paint(starPts(x0 + w * hash(i + 21), y0 + h * hash(i + 22), (4 + 5 * hash(i + 23)) * tw, .4, 4), { wash: '#F6EBC4', ink: null }); }
  }

  // ---------- the Brazil nut ----------
  // a Brazil nut seen from the side: a long three-sided wedge like an orange segment. see: the shell turns see-through
  // and shows the ruby glint inside; split: the two halves part.
  function bnut(x, y, s, ang, key, o = {}) {
    if (s < .05) return; boilSeed('bn' + key);
    const see = clamp(o.see || 0), split = clamp(o.split || 0), half = (sd) => {
      const P = []; for (let i = 0; i <= 10; i++) { const q = i / 10, a = Math.PI * q; P.push([-Math.cos(a) * 26, sd * Math.sin(a) * (sd < 0 ? 13 : 7)]); }
      return P;
    };
    push(); translate(x, y); rotate(ang); scale(s);
    if (see > .05 || split > .05) {                                // the kernel and its glint
      paint(ellPts(0, -1, 20, 7, 14), { wash: Z.kernel, ink: PAL.ink, sw: .7 });
      const g = Math.max(see, split);
      glow(0, -1, 30 + 30 * g, '#FF6A6A', .55 * g);
      paint(ellPts(0, -1, 5 + 3 * g, 5 + 3 * g, 10), { wash: Z.se, ink: PAL.ink, sw: .6 });
      paint(ellPts(-1.5, -3, 1.8, 1.2, 6), { wash: PAL.cream, ink: null });
    }
    const op = 255 * (1 - .8 * see);
    for (const sd of [-1, 1]) {
      push(); translate(0, sd * 26 * split); rotate(sd * .35 * split);
      paint(half(sd), { wash: sd < 0 ? Z.shell : Z.shellDk, washOp: op, ink: PAL.ink, sw: .9, curv: .3 });
      if (sd < 0 && see < .6) { inkLine([[-18, -5], [0, -9], [18, -5]], .7, Z.shellDk, 'inkfine', .6); paint(ellPts(-8, -7, 6, 2, 8, 0, -.2), { wash: Z.shellLt, washOp: op, ink: null }); }
      pop();
    }
    pop();
  }
  // a big wooden bowl heaped with Brazil nuts; n = how many are left in the heap (0..1)
  function nutBowl(x, y, s, n, key) {
    auditBox('bowl', key, x - 120 * s, y - 120 * s, x + 120 * s, y);
    const N = 12, left = Math.round(N * clamp(n));
    for (let i = 0; i < left; i++) { const a = hash(i + 70) * 2 - 1, row = Math.floor(i / 5);
      bnut(x + a * (95 - row * 26) * s, y - (64 + row * 22 + 10 * hash(i + 71)) * s, 1.5 * s, hash(i + 72) * 3, key + 'n' + i); }
    boilSeed('bw' + key);
    paint([...Array(15)].map((_, i) => { const a = i / 14 * Math.PI; return [x - Math.cos(a) * 120 * s, y - 58 * s + Math.sin(a) * 58 * s]; }), { wash: '#B5794A', fill: '#8A5530', fillOp: 55, tex: .5, ink: PAL.ink, sw: 1.2 });
    inkLine([[x - 108 * s, y - 40 * s], [x + 108 * s, y - 40 * s]], 2.4 * s, '#D9A16E', 'ink', .3);
  }

  // ---------- the room (A1, and the ending) ----------
  // a potted cactus: wilt 0..1 droops it, bloom 0..1 opens a flower on top
  function cactus(x, y, s, wilt, bloom, key) {
    boilSeed('cc' + key);
    const w = ease(wilt), col = mixCol(Z.cact, '#9C9A5A', w), dk = mixCol(Z.cactDk, '#6E6B3A', w);
    const stem = []; for (let i = 0; i <= 6; i++) { const q = i / 6, bend = w * q * q * 1.3; stem.push([x + Math.sin(bend) * 60 * s * q, y - 40 * s - Math.cos(bend) * 120 * s * q]); }
    for (const [sd, h] of [[-1, .45], [1, .62]]) {                    // two arms, drooping with the wilt
      const b = stem[Math.round(h * 6)], a = sd < 0 ? -1.9 + 2.6 * w : 1.9 - 2.4 * w * (1 - .2 * h);
      const P = [b, [b[0] + sd * 28 * s, b[1] - 4 * s], [b[0] + sd * 34 * s + Math.cos(a) * 6 * s, b[1] - 6 * s - Math.sin(a) * 36 * s * (sd < 0 ? 1 : -1) * (sd < 0 ? 1 : -1)]];
      paint(ribbon(P, 14 * s, 11 * s), { wash: col, ink: PAL.ink, sw: .9, curv: .5 });
    }
    paint(ribbon(stem, 22 * s, 16 * s), { wash: col, fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1, curv: .5 });
    for (let i = 1; i < 6; i++) inkLine([[stem[i][0] - 4 * s, stem[i][1]], [stem[i][0] - 9 * s, stem[i][1] - 3 * s]], .6, dk, 'inkfine', 0);
    const top = stem[6];
    if (bloom > .05) { const q = popK(bloom); boilSeed('ccf' + key);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3; paint(ellPts(top[0] + Math.cos(a) * 18 * s * q, top[1] - 10 * s + Math.sin(a) * 18 * s * q, 15 * s * q, 9 * s * q, 10, 0, a), { wash: '#F39AB4', ink: PAL.ink, sw: .8 }); }
      paint(ellPts(top[0], top[1] - 10 * s, 8 * s * q, 8 * s * q, 8), { wash: '#F6D25A', ink: PAL.ink, sw: .6 }); }
    paint([[x - 34 * s, y - 44 * s], [x + 34 * s, y - 44 * s], [x + 26 * s, y], [x - 26 * s, y]], { wash: Z.pot, fill: Z.potDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1 });
    paint(rectPts(x - 38 * s, y - 52 * s, 76 * s, 12 * s), { wash: Z.potDk, ink: PAL.ink, sw: .9 });
  }
  // a fly: buzzing (wings a blur) or dead on its back (legs up, crossed eyes)
  function fly(x, y, s, t, dead, key, rot = 0) {
    boilSeed('fy' + key);
    push(); translate(x, y); rotate(rot + (dead ? Math.PI : 0)); scale(s);
    if (!dead) for (const sd of [-1, 1]) paint(ellPts(sd * 6, -8, 7, 11 + 3 * Math.sin(t * 60 + sd), 10, 0, sd * .5), { wash: '#DCE6EE', washOp: 170, ink: PAL.ink, sw: .5 });
    paint(ellPts(0, 0, 9, 7, 12), { wash: '#4A4E5C', ink: PAL.ink, sw: .7 });
    paint(ellPts(8, -1, 5, 5, 10), { wash: '#5D6272', ink: PAL.ink, sw: .6 });
    if (dead) { for (const sd of [-1, 0, 1]) inkLine([[sd * 4, 5], [sd * 6, 13], [sd * 5, 15]], .7, PAL.ink, 'inkfine', 0);
      for (const sd of [-1, 1]) { inkLine([[9 + sd * 1.5 - 1.5, -3], [9 + sd * 1.5 + 1.5, 0]], .6, PAL.cream, 'inkfine', 0); inkLine([[9 + sd * 1.5 + 1.5, -3], [9 + sd * 1.5 - 1.5, 0]], .6, PAL.cream, 'inkfine', 0); } }
    else paint(ellPts(10, -2, 1.6, 1.6, 6), { wash: PAL.cream, ink: null });
    pop();
  }
  function sofa(x, y, s, key) {                                    // (x, y) = the middle of the seat's top edge
    boilSeed('sf' + key);
    paint(rrPts(x - 360 * s, y - 210 * s, 720 * s, 230 * s, 60 * s), { wash: Z.sofa, fill: Z.sofaDk, fillOp: 45, bleed: .01, tex: .5, ink: PAL.ink, sw: 1.3 });
    for (const sd of [-1, 1]) paint(rrPts(x + sd * 360 * s - 70 * s, y - 120 * s, 140 * s, 240 * s, 50 * s), { wash: Z.sofaLt, fill: Z.sofa, fillOp: 50, bleed: .01, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(x - 300 * s, y - 10 * s, 600 * s, 120 * s, 30 * s), { wash: Z.sofaLt, fill: Z.sofa, fillOp: 40, bleed: .01, tex: .4, ink: PAL.ink, sw: 1.2 });
    inkLine([[x, y], [x, y + 100 * s]], 1, Z.sofaDk, 'ink', 0);
    for (const sd of [-1, 1]) paint(rectPts(x + sd * 300 * s - 12 * s, y + 108 * s, 24 * s, 34 * s), { wash: Z.floorDk, ink: PAL.ink, sw: .9 });
  }
  const WIN = [420, 240, 360, 280];                                 // the window: x, y, w, h
  function room(t, key, moonK = .22) {
    K.wash(Z.wall, t, { key: key + 'w', blob: Z.wallBlob, n: 4 });
    boilSeed(key + 'fl'); paint(rectPts(-400, 880, W + 800, 700), { wash: Z.floor, fill: Z.floorDk, fillOp: 35, tex: .4, ink: null });
    inkLine([[-400, 880], [W + 400, 880]], 1.4, Z.floorDk, 'ink', 0);
    for (let i = 0; i < 5; i++) inkLine([[-300 + i * 520, 960 + 50 * hash(i)], [180 + i * 520, 970 + 40 * hash(i + 1)]], .8, Z.floorDk, 'inkfine', .5);
    const [wx, wy, ww, wh] = WIN;                                   // the night window, the moon, stars
    boilSeed(key + 'win'); paint(rectPts(wx, wy, ww, wh), { wash: Z.night, fill: Z.nightDk, fillOp: 50, tex: .4, ink: null });
    nightStars(wx + 20, wy + 20, ww - 40, wh - 80, 9, t, key);
    moon(wx + ww * .68, wy + wh * .32, 52, moonK, key + 'mo');
    boilSeed(key + 'wf');
    for (const [a, b] of [[[wx, wy], [wx + ww, wy]], [[wx, wy + wh], [wx + ww, wy + wh]], [[wx, wy], [wx, wy + wh]], [[wx + ww, wy], [wx + ww, wy + wh]], [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]]]) paint(ribbon([a, b], 14, 14), { wash: '#F2E2C4', ink: PAL.ink, sw: .9, curv: 0 });
    paint(rectPts(wx - 30, wy + wh, ww + 60, 22), { wash: '#E3CBA2', ink: PAL.ink, sw: 1 });   // the sill
  }

  // ================================ A1 · the hot open: the binge, the freeze, the rewind (0 – L3) ================================
  const P1 = [1060, 742], U1 = 34, BOWL1 = [1252, 742], CACT = [700, WIN[1] + WIN[3]], FREEZE = 5.2;
  const BITES = [0, 1, 2, 3, 4].map(i => .25 + i * .36);           // the hand reaches the bowl at b - .18, the mouth at b + .16
  const REW0 = () => L(2, .2), REW1 = () => L(2, 1.6);
  // the action time of the binge: runs to the freeze, holds, then runs backwards during the rewind
  function hotA(t) {
    if (t < FREEZE) return t;
    if (t < REW0()) return FREEZE;
    if (t < REW1()) return FREEZE * (1 - ease(seg(t, REW0(), REW1())));
    return 0;
  }
  const FLY0 = [870, 410];
  function flyAt(a, t) {                                            // buzzing in loops; knocked out by the garlic at 2.6
    if (a < 2.6) { const q = a * 2.3; return { p: [FLY0[0] + 70 * Math.sin(q), FLY0[1] + 34 * Math.sin(q * 2)], dead: false }; }
    const k = seg(a, 2.6, 3.0), s = [FLY0[0] + 70 * Math.sin(2.6 * 2.3), FLY0[1] + 34 * Math.sin(5.2 * 2.3)];
    return { p: arcPt(s, [850, 905], -30, easeIn(k)), dead: k > .9, rot: k * 4 };
  }
  function binge(a, t) {                                            // Pip's pose and props for action time a (0..FREEZE)
    let o = K.act(a, [[0, 'happy'], [2.1, 'calm', { take: .2 }], [3.3, 'calm', { take: .1 }], [3.55, 'worried', { tear: .8, lookX: -1, take: 1 }],
      [4.0, 'calm', { lookY: -.9, take: .1 }], [4.45, 'calm', { lookX: .9, lookY: .1 }], [4.8, 'wow', { lookX: .9, lookY: .1, take: 1.3 }]]);
    let hold = null, cheek = 0;
    if (a < 2.05) {                                                // shovelling nuts: bowl → mouth, one every .36 s
      const B = [4.3, -1.25], M = [.55, -2.5];
      let at = B, i = BITES.findIndex(b => a < b + .2); if (i < 0) i = BITES.length - 1;
      const b = BITES[i], up = ease(seg(a, b - .02, b + .16)), down = ease(seg(a, b + .2, b + .34));
      at = i === BITES.length - 1 && a > b + .2 ? M : [lerp(lerp(B[0], M[0], up), B[0], down), lerp(lerp(B[1], M[1], up), B[1], down)];
      if (a > b - .02 && a < b + .17) hold = 'nut';
      o = { ...o, armF: { at }, armB: [-.6, 1.5], lookX: .5, lookY: .3 };
      cheek = BITES.reduce((s, bb) => s + .07 * Math.exp(-6 * Math.max(0, a - bb - .16)) * (a > bb + .16 ? 1 : 0), 0);
      o.sq = (o.sq || 0) + cheek;
    } else if (a < 3.1) {                                          // a huge yawn
      const y = on(a, 2.1, 3.1, .25, .3);
      o = { ...o, face: 'wow', blink: .85 * y, armF: [lerp(-.5, 1.35, y), lerp(1.6, 2.5, y)], armB: [lerp(-.5, 1.3, y), lerp(1.6, 2.4, y)], sq: (o.sq || 0) - .1 * y, emote: null };
    } else if (a < 3.55) o = { ...o, armF: { at: [.75, -2.45] }, armsFront: true, lookY: .4 };   // a cupped hand: sniff
    else if (a < 4.0) o = { ...o, rot: -.12 * on(a, 3.55, 4.0, .08, .3), armF: [.5, 2.6], armB: [.4, 2.4] };
    else {                                                         // scratch the head; the leaf comes away in the hand
      const sc = a < 4.45 ? .12 * Math.sin(a * 40) : 0, dn = ease(seg(a, 4.45, 4.75));
      o = { ...o, armF: { at: [lerp(.3 + sc, 2.0, dn), lerp(-5.15, -3.3, dn)] } };
      if (a > 4.4) hold = 'leaf';
    }
    if (a > 4.4) o.leaf = NOLEAF;
    return { o, hold };
  }
  function shotA1(t, lt, dur) {
    K.setT(t);
    const a = hotA(t), after = t >= REW1(), rew = t > REW0() && t < REW1();
    const frz = t >= FREEZE && t < REW1() ? 1 : 0, grey = ease(seg(t, FREEZE, FREEZE + .15)) * (1 - ease(seg(t, REW1() - .5, REW1())));
    // camera: wide, push in on Pip during the freeze, snap back on the rewind; then the nut; whip up at the end
    const faceZ = ease(seg(t, L(1, 1.0), L(1, 3.2))) * (1 - ease(seg(t, REW0(), REW0() + .5)));
    const nutZ = ease(seg(t, L(2, 5.4), L(2, 7.4)));
    const whip = easeIn(seg(t, L(3, -.4), L(3)));
    const ca = kf(a, [[0, [1150, 650, 1.75]], [2.0, [1150, 650, 1.75]], [2.35, [990, 600, 1.3]], [3.6, [990, 600, 1.3]], [4.05, [1090, 610, 1.75]]], ease);
    let cx = lerp(ca[0], 1085, faceZ), cy = lerp(ca[1], 585, faceZ), z = lerp(ca[2], 2.2, faceZ);
    if (after) { const w = ease(seg(t, REW1(), REW1() + .6)); cx = lerp(lerp(1150, 1110, w), 1150, nutZ); cy = lerp(lerp(650, 610, w), 575, nutZ); z = lerp(lerp(1.75, 1.5, w), 2.0, nutZ); }
    const shk = t > FREEZE && t < FREEZE + .18 ? shakeXY(t, 14) : rew ? [14 * Math.sin(t * 70), 0] : [0, 0];
    camBegin(cx + shk[0] + 5 * wob(t, .05) * (1 - frz), cy + shk[1] - 900 * whip + 4 * wob(t, .04) * (1 - frz), z);
    room(t, 'a1');
    // the cactus wilts in the garlic (and perks back up on the rewind)
    cactus(CACT[0], CACT[1], 1, after ? 0 : seg(a, 2.9, 3.5), 0, 'a1c');
    sofa(1110, 742, 1, 'a1s');
    // the fly
    const f = after ? { p: [FLY0[0] + 70 * Math.sin(t * 2.3), FLY0[1] + 34 * Math.sin(t * 4.6)], dead: false } : flyAt(a, t);
    fly(f.p[0], f.p[1], 2.2, t * (frz ? 0 : 1) + (frz ? FREEZE : 0), f.dead, 'a1f', f.rot || 0);
    // the bowl: the heap shrinks as Pip eats
    const eaten = after ? 0 : BITES.filter(b => a > b + .16).length;
    nutBowl(BOWL1[0], BOWL1[1], .85, 1 - eaten * .08, 'a1b');
    // Pip
    let o, hold = null;
    if (!after) ({ o, hold } = binge(a, t));
    else {                                                         // after the rewind: one nut, held up and looked at
      const up = ease(seg(t, REW1(), REW1() + .5));
      o = K.act(t, [[REW1(), 'calm', { lookX: .8, lookY: -.2 }], [L(2, 4.9), 'wow', { lookX: .8, lookY: -.3 }], [L(2, 7.0), 'idea', { lookX: .8, lookY: -.3 }]]);
      o = { ...o, armF: { at: [lerp(4.3, 2.1, up), lerp(-1.25, -3.5, up)] }, armB: [-.6, 1.5] };
      hold = 'one';
    }
    pip(P1[0], P1[1], U1, { ...o, key: 'a1pip' });
    const hF = handPt(P1[0], P1[1], U1, o), mth = mouthOf(P1[0], P1[1], U1, o);
    if (hold === 'nut') bnut(hF[0] + 4, hF[1] - 2, .9, -.6, 'a1h');
    if (hold === 'leaf') { const tw = frz && t > L(1, 7.6) && t < L(1, 8.6) ? .25 * Math.sin(t * 30) * on(t, L(1, 7.6), L(1, 8.6), .1, .2) : 0; leafProp(hF[0] - 6, hF[1] + 4, U1, .5 + tw, 'a1lf'); }
    if (hold === 'one') { const see = ease(seg(t, L(2, 5.0), L(2, 6.0))), pz = 1 + .15 * pulseK(t, L(2, 9.0), .8); bnut(hF[0] + 8, hF[1] - 4, 1.3 * pz, -.35 + .25 * Math.sin(t * 1.3) * ease(seg(t, L(2, 6.9), L(2, 7.6))), 'a1one', { see }); }
    // crumbs on every crunch
    if (!after) BITES.forEach((b, i) => { const k = seg(a, b + .16, b + .5); if (k > 0 && k < 1) for (let j = 0; j < 4; j++) {
      const p = arcPt(mth, [mth[0] + (hash(i * 7 + j) - .3) * 120, mth[1] + 90 + 30 * hash(j + 3)], 40, k); boilSeed('a1cr' + i + j);
      paint(ellPts(p[0], p[1], 4, 3, 6), { wash: Z.shellLt, ink: PAL.ink, sw: .4 }); } });
    // the garlic yawn: a cloud rolls out toward the fly and the cactus, with stink lines
    if (!after && a > 2.3) {
      for (let i = 0; i < 6; i++) { const k = seg(a, 2.3 + i * .12, 3.4 + i * .12); if (k <= 0) continue;
        const tgt = i % 2 ? [FLY0[0] - 40 + i * 10, FLY0[1] + 20] : [CACT[0] + 90, CACT[1] - 200 + i * 10];
        const p = [lerp(mth[0] - 20, tgt[0], easeOut(k)), lerp(mth[1], tgt[1], easeOut(k)) - 30 * Math.sin(k * Math.PI)];
        puff(p[0], p[1], 26 + 34 * k, (1 - .55 * k) * (1 - .85 * seg(a, 3.2 + i * .1, 3.9 + i * .1)), 'a1g' + i); }
      for (let i = 0; i < 3; i++) stink(mth[0] - 95 - i * 30, mth[1] - 10 - 12 * i, 80, t * (frz ? 0 : 1), on(a, 2.5 + i * .1, 9, .2, .1), 'a1st' + i);
    }
    if (frz && t > L(1, 9.1)) stink(mth[0] - 95, mth[1] - 30, 90, t, on(t, L(1, 9.1), REW0(), .3, .3), 'a1last');
    // after the rewind the fly buzzes and the bowl is full again; the glint pulses on 一天需要的硒
    if (hold === 'one' && t > L(2, 8.8)) K.sparkle(hF[0] + 8, hF[1] - 30, 22, seg(t, L(2, 8.9), L(2, 9.7)), PAL.cream);
    camEnd();
    // the freeze: colour drains under a warm grey; the rewind: streaks and a warble
    if (grey > .01) paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#B9AFA4', washOp: 150 * grey, ink: null });
    streaks(rew ? on(t, REW0(), REW1(), .15, .25) : 0, 'a1rw' + Math.floor(t * 12) % 3);
    streaks(whip, 'a1wp', true);
    // in: smash in from black on the first crunch
    if (lt < .12) iris(W / 2, H / 2, 0, PAL.ink);
    flash(1 - seg(lt, .12, .5), PAL.cream);
  }

  // ================================ A2 · the tightrope (L3 – L5) ================================
  const ROPE = [[470, 662], [1450, 662]];
  function ropeY(x, px, dip) {                                      // the rope sags most under Pip
    const [A, B] = ROPE, q = (x - A[0]) / (B[0] - A[0]), base = lerp(A[1], B[1], q);
    const d = x < px ? (x - A[0]) / (px - A[0]) : (B[0] - x) / (B[0] - px);
    return base + dip * clamp(d);
  }
  // the two cliffs at the rope's ends: frosty grey rock (too little) on the left, olive rock in a garlic fog (too much)
  function cliff(sd, t) {
    const x0 = sd < 0 ? ROPE[0][0] : ROPE[1][0], y0 = ROPE[0][1] - 4, col = sd < 0 ? Z.cliffL : Z.cliffR, dk = sd < 0 ? Z.cliffLDk : Z.cliffRDk;
    const P = [[x0 - sd * 40, y0 + 10], [x0 + sd * 10, y0 - 6], [x0 + sd * 160, y0 - 30], [x0 + sd * 420, y0 - 10], [x0 + sd * 900, y0 + 20], [x0 + sd * 900, 1700], [x0 - sd * 70, 1700], [x0 - sd * 110, y0 + 300], [x0 - sd * 60, y0 + 120]];
    boilSeed('a2c' + sd); paint(P, { wash: col, fill: dk, fillOp: 55, bleed: .02, tex: .6, ink: PAL.ink, sw: 1.3, curv: .35 });
    for (let i = 0; i < 4; i++) { boilSeed('a2ck' + sd + i); inkLine([[x0 + sd * (60 + 120 * i), y0 + 60 + 40 * hash(i)], [x0 + sd * (90 + 120 * i), y0 + 140 + 60 * hash(i + 1)]], .9, dk, 'inkfine', .5); }
    if (sd < 0) {                                                  // frost on top, icicles under the lip
      boilSeed('a2fr'); paint(ribbon([[x0 + 30, y0 + 4], [x0 - 10, y0 - 10], [x0 - 160, y0 - 34], [x0 - 420, y0 - 16]], 9, 6), { wash: '#E4EEF7', ink: PAL.ink, sw: .7, curv: .4 });
      for (let i = 0; i < 5; i++) { boilSeed('a2ic' + i); const x = x0 + 30 - i * 26, y = y0 + 12 - 4 * i; paint([[x - 7, y], [x + 7, y], [x, y + 26 + 14 * hash(i)]], { wash: '#CFE2F2', ink: PAL.ink, sw: .6 }); }
    } else {                                                       // a garlic fog and stink lines
      for (let i = 0; i < 4; i++) { boilSeed('a2fg' + i); paint(ellPts(x0 + 70 + 150 * i, y0 - 70 - 30 * hash(i) + 10 * Math.sin(t * .7 + i), 120, 60, 18, 8), { wash: Z.garlic, washOp: 120, ink: null }); }
      for (let i = 0; i < 3; i++) stink(x0 + 60 + 110 * i, y0 - 40, 90, t + i, 1, 'a2s' + i);
    }
  }
  function shotA2(t, lt, dur) {
    K.setT(t);
    const arrive = 1 - easeOut(seg(lt, 0, .45));
    const push_ = easeIn(seg(t, L(4, 7.6), L(5, -.1)));
    // Pip's place on the rope: lurch right with the handful, left when it's thrown away, back to the middle
    const px = 960 + 130 * ease(seg(t, L(3, 3.0), L(3, 4.4))) - 250 * ease(seg(t, L(3, 6.4), L(3, 7.6))) + 120 * ease(seg(t, L(3, 9.4), L(3, 10.4)));
    const load = clamp(ease(seg(t, L(3, 2.5), L(3, 3.2))) - ease(seg(t, L(3, 6.4), L(3, 6.7))));
    const dip = 22 + 42 * load + 26 * spring(t, L(3, 9.9), 4, 22) + 14 * spring(t, L(3, 3.0), 5, 16);
    const py = ropeY(px, px, dip);
    const nut = [px + 70, py - 120];
    camBegin(lerp(lerp(960, px, .45), nut[0], push_) + 5 * wob(t, .05), lerp(570, nut[1], push_) + 700 * arrive + 4 * wob(t, .04), lerp(1.32, 4.2, push_));
    K.wash(Z.sky, t, { key: 'a2', blob: Z.skyBlob, n: 4 });
    nightStars(-200, -200, W + 400, 760, 26, t, 'a2');
    moon(1560, 190, 92, .25, 'a2mo');
    // the cliffs: cold grey on the left (too little), garlic-green haze on the right (too much)
    cliff(-1, t);
    cliff(1, t);
    // the spotlight on Pip
    boilSeed('a2sp'); paint([[px - 70, -300], [px + 70, -300], [px + 230, py + 30], [px - 230, py + 30]], { wash: '#F6EBC4', washOp: 38, ink: null });
    glow(px, py - 90, 300, '#FFF0C0', .35);
    // the rope
    boilSeed('a2rp'); const RP = []; for (let i = 0; i <= 24; i++) { const x = lerp(ROPE[0][0], ROPE[1][0], i / 24); RP.push([x, ropeY(x, px, dip)]); }
    for (let i = 0; i < 24; i += 6) inkLine(RP.slice(i, i + 7), 2.6, '#E9D9B4', 'ink', .4);
    for (const [x, y] of ROPE) paint(rectPts(x - 8, y - 60, 16, 70), { wash: '#9C7A52', ink: PAL.ink, sw: 1 });
    // Pip: shrug, the handful, the lurches, the throw, the nut back on the head and into the hand
    const lean = .26 * ease(seg(t, L(3, 3.0), L(3, 3.8))) * (1 - ease(seg(t, L(3, 6.4), L(3, 6.8)))) - .26 * ease(seg(t, L(3, 6.5), L(3, 7.2))) * (1 - ease(seg(t, L(3, 9.6), L(3, 10.4))));
    const windmill = on(t, L(3, 3.0), L(3, 10.4), .2, .4);
    let o = K.act(t, [[0, 'smug', { lookX: 0, lookY: 0 }], [L(3, 2.6), 'wow'], [L(3, 3.4), 'worried', { lookX: 1 }], [L(3, 6.5), 'worried', { lookX: -1 }],
      [L(3, 9.6), 'dizzy'], [L(3, 10.4), 'happy'], [L(4, .9), 'confused', { lookX: .9, lookY: -.4 }], [L(4, 2.1), 'calm', { lookX: 0 }], [L(4, 5.5), 'wow', { lookX: .9, lookY: -.4 }], [L(4, 7.4), 'idea', { lookX: .9, lookY: -.4 }]]);
    const throwK = seg(t, L(3, 6.4), L(3, 6.7)), hug = load > .5;
    if (hug) o = { ...o, armsFront: true, armF: { at: [1.1, -1.7] }, armB: { at: [-1.0, -1.6] } };
    else if (windmill > .05) o = { ...o, armF: [.9 + 1.4 * Math.sin(t * 9), 2.6], armB: [.9 + 1.4 * Math.sin(t * 9 + 2), 2.4] };
    else o = { ...o, armF: { at: [2.1, -3.5] }, armB: t < L(3, 2) ? [1.0 + .3 * Math.sin(t * 2), 2.2] : [.6, 2.3] };   // the one nut held out
    if (t < L(3, 2.2) && t > L(3, .3)) o = { ...o, armB: [1.15, 2.2], face: 'smug' };        // the shrug
    o.rot = (o.rot || 0) + lean + .05 * Math.sin(t * 3.1) * (1 - windmill);
    pip(px, py, 32, { ...o, noShadow: true, key: 'a2pip' });
    const hF = handPt(px, py, 32, o), head = headOf(px, py, 32, o);
    // the nuts: one in hand; the handful raining in; thrown away; one back (bonk) and into the hand
    if (!hug && windmill < .05 && (t < L(3, 2.5) || t > L(3, 10.4))) bnut(hF[0] + 6, hF[1] - 4, 1.2, -.3, 'a2one', { split: ease(seg(t, L(4, 5.5), L(4, 6.3))) });
    for (let i = 0; i < 8; i++) {
      const fall = seg(t, L(3, 2.4 + i * .07), L(3, 2.9 + i * .07)), out = seg(t, L(3, 6.4), L(3, 7.4));
      if (fall <= 0) continue;
      const rest = [px + (i % 4 - 1.5) * 18, py - 70 - Math.floor(i / 4) * 22];
      let p = fall < 1 ? [rest[0] + 30 * Math.sin(i), lerp(-200, rest[1], easeIn(fall))] : rest;
      if (out > 0) p = arcPt(rest, [rest[0] + (i % 2 ? 1 : -1) * (300 + 60 * i), 1300], -260, out);
      if (out < 1) bnut(p[0], p[1], 1.1, i + t * (out > 0 ? 9 : 0), 'a2h' + i);
    }
    const back = seg(t, L(3, 9.2), L(3, 9.6)), bounce = seg(t, L(3, 9.6), L(3, 10.4));
    if (back > 0 && bounce < 1) { const p = bounce <= 0 ? [head[0], lerp(-150, head[1] - 10, easeIn(back))] : arcPt([head[0], head[1] - 10], [hF[0] + 6, hF[1] - 4], 90, bounce); bnut(p[0], p[1], 1.2, t * 6, 'a2bk'); }
    if (t > L(3, 9.6) && t < L(3, 11.6)) stars(head[0], head[1] - 6, 46, t, 'a2dz');
    if (t > L(3, 9.55) && t < L(3, 10.0)) K.burst(head[0], head[1] - 10, 40, seg(t, L(3, 9.55), L(3, 9.95)), PAL.cream, 'a2bonk');
    camEnd();
    streaks(arrive, 'a2wp', true);
    flash(seg(t, L(5, -.5), L(5, -.05)), PAL.cream);
  }


  // ---------- atoms and the shared props (the colour code is fixed for the whole film) ----------
  // a plain bead with a highlight
  function bead(x, y, r, col, dk, key, sw = null) {
    if (r < 2) return; boilSeed('bd' + key);
    paint(ellPts(x, y, r, r, 18), r >= 26 ? { wash: col, fill: dk, fillOp: 50, tex: .4, ink: PAL.ink, sw: sw ?? clamp(r / 22, .6, 1.4) } : { wash: col, ink: PAL.ink, sw: sw ?? clamp(r / 22, .6, 1.4) });
    paint(ellPts(x - r * .35, y - r * .38, r * .26, r * .17, 10, 0, -.6), { wash: mixCol(col, PAL.cream, .6), ink: null });
  }
  // selenium: a ruby bead with a cream crescent. o.ox 0..1 = an O stuck on top (oxidised), o.h = the little H dot (ready),
  // o.gs = a glutathione's yellow S joined on the right, o.glowK = a ruby halo, o.burnt (for the sulfur version: charcoal)
  function seBead(x, y, r, key, o = {}) {
    if (r < 2) return;
    if (o.glowK > .02) glow(x, y, r * 3, '#FF5A5A', o.glowK);
    const col = o.col || Z.se, dk = o.dk || Z.seDk;
    boilSeed('se' + key);
    paint(ellPts(x, y, r, r, 20), r >= 20 ? { wash: col, fill: dk, fillOp: 45, tex: .4, ink: PAL.ink, sw: clamp(r / 22, .6, 1.4) } : { wash: col, ink: PAL.ink, sw: clamp(r / 22, .6, 1.4) });
    const C = []; for (let i = 0; i <= 10; i++) { const a = -2.6 + i / 10 * 1.6; C.push([x + Math.cos(a) * r * .72, y + Math.sin(a) * r * .72]); }
    for (let i = 10; i >= 0; i--) { const a = -2.6 + i / 10 * 1.6; C.push([x + Math.cos(a) * r * .5 - r * .1, y + Math.sin(a) * r * .5 - r * .08]); }
    paint(C, { wash: mixCol(col, PAL.cream, .7), ink: null });
    if (o.h > .05) bead(x + r * .78, y - r * .62, r * .26 * popK(o.h), PAL.cream, '#D9CBB0', key + 'h', .6);
    if (o.ox > .05) { const q = popK(o.ox); bead(x, y - r * (1.05 + .3 * (1 - q)), r * .5 * q, Z.o, Z.oDk, key + 'o'); }
    if (o.gs > .05) { const q = popK(o.gs); bead(x + r * 1.25, y, r * .55 * q, Z.sul, Z.sulDk, key + 'g'); }
  }
  const oBead = (x, y, r, key) => bead(x, y, r, Z.o, Z.oDk, 'ob' + key);
  const sBead = (x, y, r, key, burnt = 0) => bead(x, y, r, mixCol(Z.sul, Z.burnt, burnt), mixCol(Z.sulDk, '#3C383F', burnt), 'sb' + key);
  // a 不倒翁 (roly-poly toy), no face: a weighted round belly with the element's bead on it, a small head on top.
  // (x, y) = where it touches the ground; ang tips it over about that point. kind 'se' | 's'; burnt 0..1 (charcoal)
  function tumbler(x, y, s, ang, kind, key, o = {}) {
    const se = kind === 'se', b = o.burnt || 0;
    const col = mixCol(se ? '#E0606A' : '#F2D774', '#5E5862', b), dk = mixCol(se ? '#A8333E' : '#C4A43C', '#3A363D', b);
    auditBox('toy', key, x - 70 * s, y - 180 * s, x + 70 * s, y);
    boilSeed('tb' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    paint(ellPts(0, -62, 64, 62, 26), { wash: col, fill: dk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.3 });
    paint(ellPts(0, -140, 36, 34, 20), { wash: col, fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.2 });
    inkLine([[-40, -104], [0, -96], [40, -104]], 1.2, dk, 'ink', .6);
    if (se) seBead(0, -56, 26, key + 'b'); else sBead(0, -56, 26, key + 'b', b);
    if (o.ox > .05) for (let i = 0; i < Math.ceil(o.ox * 3 - .01); i++) oBead(-26 + i * 26, -176 - 6 * (i % 2), 13, key + 'x' + i);
    pop();
  }
  // a traffic light on a post: k 0 = red, 1 = green
  function stopLight(x, y, s, k, key, glowOn = 1) {
    boilSeed('tl' + key);
    paint(ribbon([[x, y], [x, y - 220 * s]], 12 * s, 10 * s), { wash: '#4E5566', ink: PAL.ink, sw: 1 });
    paint(rrPts(x - 34 * s, y - 330 * s, 68 * s, 140 * s, 16 * s), { wash: '#3E4352', ink: PAL.ink, sw: 1.1 });
    const red = 1 - clamp(k), grn = clamp(k);
    if (glowOn) { if (red > .05) glow(x, y - 294 * s, 90 * s, '#FF4A4A', .7 * red); if (grn > .05) glow(x, y - 226 * s, 90 * s, '#5AFF8A', .7 * grn); }
    paint(ellPts(x, y - 294 * s, 22 * s, 22 * s, 16), { wash: mixCol('#5A2A2E', '#F2454A', red), ink: PAL.ink, sw: .9 });
    paint(ellPts(x, y - 226 * s, 22 * s, 22 * s, 16), { wash: mixCol('#26442F', '#4ED07A', grn), ink: PAL.ink, sw: .9 });
  }
  function earth(x, y, r, key) {                                    // a little painted globe (tellurium's namesake)
    boilSeed('ea' + key);
    paint(ellPts(x, y, r, r, 22), { wash: '#5C9AD6', ink: PAL.ink, sw: 1 });
    paint([[x - r * .5, y - r * .5], [x - r * .05, y - r * .6], [x + r * .1, y - r * .1], [x - r * .3, y + r * .2], [x - r * .6, y]], { wash: '#7DB86A', ink: null, curv: .6 });
    paint([[x + r * .2, y + r * .2], [x + r * .6, y + r * .1], [x + r * .5, y + r * .6], [x + r * .2, y + r * .55]], { wash: '#7DB86A', ink: null, curv: .6 });
  }

  // ================================ B1 · sulfur's bigger cousin, and the moon (L5 – L7) ================================
  const COL5 = 620, BENCH = 800;
  const STACK = [['o', 32], ['s', 44], ['se', 56], ['te', 70]];      // top to bottom, as in the periodic table
  function stackY() { const ys = []; let y = BENCH; for (let i = 3; i >= 0; i--) { y -= STACK[i][1]; ys[i] = y; y -= STACK[i][1]; } return ys; }
  function shotB1(t, lt, dur) {
    K.setT(t);
    const pan = ease(seg(t, L(5, 10.0), L(6, 1.0))), wide = ease(seg(t, L(6, 9.2), L(6, 10.4))), whip = easeIn(seg(t, L(7, -1.1), L(7, -.75)));
    camBegin(lerp(lerp(700, 1060, pan), 1060, wide) + 1400 * whip + 5 * wob(t, .05), lerp(lerp(530, 580, pan), 500, wide) + 4 * wob(t, .04), lerp(lerp(1.32, 1.2, pan), .98, wide));
    K.wash('#C7D0E2', t, { key: 'b1', blob: '#D9E0EE', n: 4 });
    // the window and the moon (it brightens when selenium is named after it)
    boilSeed('b1win'); paint(rectPts(1300, 110, 420, 330), { wash: Z.night, fill: Z.nightDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.2 });
    nightStars(1320, 130, 380, 240, 8, t, 'b1');
    const moonUp = ease(seg(t, L(6, 10.2), L(6, 11.4)));
    if (moonUp > .02) glow(1560, 250, 160, '#FFE9A8', .8 * moonUp);
    moon(1560, 250, 64, .32, 'b1mo');
    boilSeed('b1wf'); paint(ribbon([[1510, 110], [1510, 440]], 12, 12), { wash: '#E9E2D2', ink: PAL.ink, sw: .9, curv: 0 });
    // the bench
    boilSeed('b1b'); paint(rectPts(-300, BENCH, W + 800, 500), { wash: '#8E7B69', fill: '#6C5A4A', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2 });
    inkLine([[-300, BENCH + 26], [W + 500, BENCH + 26]], 1, '#6C5A4A', 'inkfine', 0);
    // the stack of beads: pop in top to bottom; S, then Se light up; a group outline; it sways under Pip, Pip falls
    const ys = stackY(), sway = (t > L(5, 6.0) ? .05 * Math.sin((t - L(5, 6.0)) * 7) * on(t, L(5, 6.0), L(5, 11.5), .4, .8) : 0) + .1 * spring(t, L(5, 9.0), 3, 9);
    const pivot = [COL5, BENCH];
    const sp = i => { const dy = ys[i] - BENCH; return [pivot[0] - Math.sin(sway) * dy * -1 * 1, pivot[1] + Math.cos(sway) * dy]; };
    const grp = on(t, L(5, 4.9), L(5, 8.0), .4, .5);
    if (grp > .02) { boilSeed('b1grp'); paint(rrPts(COL5 - 100, ys[0] - 60, 200, BENCH - ys[0] + 60, 80), { fill: '#FFF4D2', fillOp: 200 * grp, bleed: .12, tex: .3, ink: null }); }
    for (let i = 3; i >= 0; i--) {
      const [kind, r] = STACK[i], q = popK(seg(t, L(5, .4 + i * .35), L(5, .8 + i * .35))); if (q < .05) continue;
      const [x, y] = sp(i), sqz = .08 * ring(t, [L(5, 5.6 + (3 - i) * .45)], 7, 22);
      const hi = i === 1 ? pulseK(t, L(5, 2.4), .9) : i === 2 ? pulseK(t, L(5, 3.4), 1.0) + .6 * pulseK(t, L(5, 8.3), 1.4) : 0;
      if (hi > .02) glow(x, y, r * 2.6, i === 2 ? '#FF6A6A' : '#FFE27A', .6 * hi);
      const rr = r * q * (1 + sqz);
      if (kind === 'o') oBead(x, y, rr, 'b1o'); else if (kind === 's') sBead(x, y, rr, 'b1s'); else if (kind === 'se') seBead(x, y, rr, 'b1se');
      else bead(x, y, rr, '#9AA0AA', '#6C727C', 'b1te');
    }
    // the vat of red mud (L6)
    const V = [1120, BENCH];
    boilSeed('b1vat'); paint([[V[0] - 190, V[1] - 150], [V[0] + 190, V[1] - 150], [V[0] + 170, V[1]], [V[0] - 170, V[1]]], { wash: '#8C939C', fill: '#5F666F', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.3 });
    paint(ellPts(V[0], V[1] - 150, 190, 26, 26), { wash: '#9A4A36', fill: '#6E2E22', fillOp: 55, tex: .6, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 4; i++) { const ph = frac(t * .4 + i * .27); boilSeed('b1bub' + i); paint(ellPts(V[0] - 120 + i * 80, V[1] - 152, 8 * ph + 2, 5 * ph + 1, 8), { wash: '#B5604A', ink: PAL.ink, sw: .5 }); }
    // Pip: hops up the stack, wobbles on top, falls off toward the vat (L5); dips a finger in the mud (L6)
    const u = 30, top = sp(0), hop = [[L(5, 5.2), [COL5 - 150, BENCH]], [L(5, 5.6), sp(3).map((v, j) => v - (j ? STACK[3][1] : 0))], [L(5, 6.05), sp(2).map((v, j) => v - (j ? STACK[2][1] : 0))],
      [L(5, 6.5), sp(1).map((v, j) => v - (j ? STACK[1][1] : 0))], [L(5, 6.95), [top[0], top[1] - STACK[0][1]]]];
    let P, airK = 0;
    const fall = seg(t, L(5, 9.2), L(5, 10.1)), land = [880, BENCH];
    if (t < hop[0][0]) P = [lerp(-150, COL5 - 150, ease(seg(t, L(5, 3.6), L(5, 5.2)))), BENCH];
    else if (t < hop[4][0]) { let i = 0; while (i + 1 < hop.length && t >= hop[i + 1][0]) i++; const k = seg(t, hop[i][0], hop[i + 1][0]); P = arcPt(hop[i][1], hop[i + 1][1], 70, ease(k)); airK = Math.sin(k * Math.PI); }
    else if (fall <= 0) P = [top[0] - Math.sin(sway) * 0, top[1] - STACK[0][1]];
    else if (fall < 1) { P = arcPt([top[0], top[1] - STACK[0][1]], land, 120, easeIn(fall)); airK = 1; }
    else P = [lerp(land[0], 900, ease(seg(t, L(6, .2), L(6, 1.0)))), BENCH];
    const splat = fall >= 1 ? 1 - ease(seg(t, L(5, 10.3), L(5, 11.2))) : 0;
    let o = K.act(t, [[0, 'happy', { lookX: 1 }], [L(5, 6.0), 'strain'], [L(5, 7.1), 'smug', { lookX: -.5, lookY: .6 }], [L(5, 9.0), 'wow'], [L(5, 10.1), 'dizzy'],
      [L(5, 11.3), 'calm', { lookX: 1 }], [L(6, 3.3), 'happy', { lookX: 1, lookY: .4 }], [L(6, 5.2), 'wow', { lookX: .3, lookY: -.6 }], [L(6, 7.4), 'idea', { lookX: -1, lookY: -.6 }],
      [L(6, 9.9), 'excited', { lookX: 1, lookY: -.9 }], [L(6, 12.0), 'wave', { lookX: 1, lookY: -.9 }]]);
    if (t > L(5, 6.95) && fall <= 0) o = { ...o, armF: [.6 + .9 * Math.sin(t * 8), 2.5], armB: [.6 + .9 * Math.sin(t * 8 + 2), 2.4], rot: sway * 2 + .06 * Math.sin(t * 8) };
    if (airK > 0) o = { ...o, armF: [1.2, 2.4], armB: [1.1, 2.3], sq: (o.sq || 0) - .12 * airK, rot: fall > 0 ? fall * 4 : 0 };
    if (splat > 0) o = { ...o, sq: (o.sq || 0) + .45 * splat, face: 'dizzy' };
    const dip = on(t, L(6, 3.2), L(6, 4.8), .35, .4), up = ease(seg(t, L(6, 4.8), L(6, 5.4))) * (1 - ease(seg(t, L(6, 7.0), L(6, 7.6))));
    if (dip > .02 || up > .02) o = { ...o, armF: dip > .02 ? [lerp(-.2, -.9, dip), 3.4] : [lerp(-.6, 1.0, up), 3.0] };
    pip(P[0], P[1], u, { ...o, flip: false, key: 'b1pip' });
    const hd = headOf(P[0], P[1], u, o);
    if (splat > .1) stars(hd[0], hd[1] + 10, 44, t, 'b1dz');
    if (fall > .98 && fall < 1.01 || (t > L(5, 10.1) && t < L(5, 10.5))) K.burst(land[0], land[1] - 30, 70, seg(t, L(5, 10.1), L(5, 10.5)), PAL.ink, 'b1thud');
    // the ruby smear on Pip's finger becomes a bead (L6 +5.0); Te goes to the Earth (+7.2); Se rises to the moon (+9.9)
    const hF = handPt(P[0], P[1], u, o);
    if (t > L(6, 4.6) && t < L(6, 9.6)) { const q = seg(t, L(6, 4.6), L(6, 5.6)); seBead(hF[0] + 6, hF[1] - 8 - 24 * q, lerp(8, 22, ease(q)), 'b1smear', { glowK: .3 * q }); }
    const eK = popK(seg(t, L(6, 7.2), L(6, 7.8)));
    if (eK > .05) earth(380, 300, 60 * eK, 'b1e');
    const te = seg(t, L(6, 7.6), L(6, 8.8)); if (te > 0) { const p = arcPt(sp(3), [470, 330], 160, ease(te)); bead(p[0], p[1], lerp(70, 26, ease(te)), '#9AA0AA', '#6C727C', 'b1tefly'); }
    const seUp = seg(t, L(6, 9.6), L(6, 11.0));
    if (t >= L(6, 9.6)) { const p = arcPt([hF[0] + 6, hF[1] - 32], [1560, 250], 120, ease(seUp)); seBead(p[0], p[1], lerp(22, 30, seUp), 'b1fly', { glowK: .5 + .3 * moonUp }); }
    camEnd();
    flash(1 - seg(lt, 0, .45), PAL.cream);
    streaks(whip, 'b1wp', false, '#A9B3C6');
  }

  // ================================ B2 · ruby glass, the red signal, and the two 不倒翁 (L7 – L9) ================================
  const RAIL = 830, SIG = [1520, RAIL];
  function rails(t, key) {
    boilSeed(key + 'gr'); paint(rectPts(-400, RAIL - 6, W + 800, 700), { wash: '#2E3142', ink: null });
    for (let i = 0; i < 26; i++) { boilSeed(key + 'sl' + i); paint(rectPts(-300 + i * 100, RAIL + 4, 60, 14), { wash: '#5A4636', ink: PAL.ink, sw: .6 }); }
    inkLine([[-400, RAIL], [W + 400, RAIL]], 4, '#A8AFBC', 'ink', 0);
  }
  // a steam locomotive, side view, facing left; (x, y) = its nose on the rail. No face: it's a machine.
  function train(x, y, s, t, key, run = 0) {
    boilSeed('tr' + key);
    const w = t * 14 * run;
    for (let i = 0; i < 3; i++) { const cx = x + (110 + i * 120) * s, cy = y - 46 * s; paint(ellPts(cx, cy, 46 * s, 46 * s, 18), { wash: '#3A3C48', ink: PAL.ink, sw: 1 });
      for (let j = 0; j < 3; j++) { const a = w + j * Math.PI / 3; inkLine([[cx - Math.cos(a) * 40 * s, cy - Math.sin(a) * 40 * s], [cx + Math.cos(a) * 40 * s, cy + Math.sin(a) * 40 * s]], 1.2, '#7A7E8C', 'ink', 0); } }
    paint(rrPts(x + 40 * s, y - 230 * s, 360 * s, 150 * s, 50 * s), { wash: '#8E3B36', fill: '#6A2722', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.3 });   // boiler
    paint(rrPts(x + 360 * s, y - 330 * s, 170 * s, 250 * s, 14 * s), { wash: '#6A2722', ink: PAL.ink, sw: 1.3 });                                       // cab
    paint(rrPts(x + 390 * s, y - 300 * s, 70 * s, 70 * s, 8 * s), { wash: '#F6D98A', ink: PAL.ink, sw: .9 });
    paint([[x + 90 * s, y - 230 * s], [x + 140 * s, y - 230 * s], [x + 150 * s, y - 320 * s], [x + 80 * s, y - 320 * s]], { wash: '#3A3C48', ink: PAL.ink, sw: 1.1 });   // chimney
    paint([[x, y - 10 * s], [x + 60 * s, y - 90 * s], [x + 60 * s, y - 10 * s]], { wash: '#B8BEC9', ink: PAL.ink, sw: 1 });                                      // cowcatcher
    glow(x + 30 * s, y - 170 * s, 160 * s, '#FFE7A0', .8);
    paint(ellPts(x + 36 * s, y - 170 * s, 22 * s, 26 * s, 14), { wash: '#FFF3C4', ink: PAL.ink, sw: 1 });
  }
  function shotB2(t, lt, dur) {
    K.setT(t);
    const arrive = 1 - easeOut(seg(lt, 0, .45));
    const shake = t > L(7, 10.0) && t < L(7, 10.5) ? shakeXY(t, 10) : [0, 0];
    const c = kf(t, [[L(7, -1), [860, 640, 1.45]], [L(7, 4.4), [860, 640, 1.45]], [L(7, 6.0), [1200, 600, 1.3]], [L(8, .5), [1200, 600, 1.3]], [L(8, 2.0), [1080, 650, 1.45]]], ease);
    const irisK = seg(t, L(9, -1.1), L(9, -.35));
    camBegin(c[0] - 1400 * arrive + shake[0] + 5 * wob(t, .05), c[1] + shake[1] + 4 * wob(t, .04), c[2]);
    K.wash('#1F2A50', t, { key: 'b2', blob: '#2B3866', n: 4 });
    nightStars(-300, -200, W + 600, 700, 22, t, 'b2');
    moon(300, 180, 60, .34, 'b2mo');
    rails(t, 'b2');
    // the signal: dark, then red once the ruby lens is in; it stays red
    const lit = ease(seg(t, L(7, 6.4), L(7, 7.0)));
    stopLight(SIG[0], SIG[1] - 10, 1.2, 0, 'b2sig', lit);
    if (lit < 1) { boilSeed('b2dark'); paint(ellPts(SIG[0], SIG[1] - 10 - 294 * 1.2, 22 * 1.2, 22 * 1.2, 16), { wash: '#5A2A2E', washOp: 255 * (1 - lit), ink: PAL.ink, sw: .9 }); }
    // the glass: blown on a pipe, turns ruby when a selenium bead drops in, flattens into a lens and flies to the lamp
    const u = 30, blowP = [640, RAIL], blowing = t < L(7, 4.6);
    const bub = ease(seg(t, L(7, .2), L(7, 1.4))), ruby = ease(seg(t, L(7, 2.2), L(7, 3.4))), lens = seg(t, L(7, 4.5), L(7, 5.8));
    const tip = [blowP[0] + 260, blowP[1] - 2.6 * u];
    if (t > L(7, 1.3) && t < L(7, 2.4)) { const k = seg(t, L(7, 1.3), L(7, 2.2)); seBead(tip[0] + 60, lerp(200, tip[1] - 10, easeIn(k)), 16, 'b2drop', { glowK: .3 }); }
    if (lens < 1 && t > L(7, .1)) {
      const p = lens > 0 ? arcPt([tip[0] + 60, tip[1]], [SIG[0], SIG[1] - 10 - 294 * 1.2], 220, ease(lens)) : [tip[0] + 60, tip[1]];
      const r = lerp(18, 64, bub) * (1 - .55 * lens), col = mixCol('#F6A54A', '#D0303C', ruby);
      glow(p[0], p[1], r * 2.4, ruby > .5 ? '#FF4A4A' : '#FFB060', .6);
      boilSeed('b2gl'); paint(ellPts(p[0], p[1], r, r * (1 - .45 * lens), 20), { wash: col, ink: PAL.ink, sw: 1 });
      paint(ellPts(p[0] - r * .3, p[1] - r * .35, r * .25, r * .15, 10), { wash: PAL.cream, washOp: 200, ink: null });
    }
    // the train: in from the right on the horn, screeches to a stop at Pip's nose; backs off at the start of L8
    const tin = seg(t, L(7, 9.1), L(7, 10.0)), tout = easeIn(seg(t, L(8, .2), L(8, 1.6)));
    const PipX = 1130, noseX = lerp(2700, PipX + 72, easeOut(tin)) + 1600 * tout;
    if (tin > 0 && tout < 1) {
      train(noseX, RAIL, 1, t, 'b2tr', 1 - tin + tout);
      for (let i = 0; i < 5; i++) { const k = frac(t * .9 + i / 5); puff(noseX + 115 + 20 * Math.sin(i), RAIL - 330 - 160 * k, 26 + 40 * k, 1 - k, 'b2sm' + i, '#C9CDD6'); }
      if (t > L(7, 9.6) && t < L(7, 10.2)) for (let i = 0; i < 8; i++) { const q = frac(t * 6 + i / 8); boilSeed('b2sp' + i); paint(starPts(noseX + 110 + 120 * (i % 3) - 60 * q, RAIL - 10 - 50 * q * hash(i), 7, .4, 4), { wash: '#FFD25A', ink: null }); }
    }
    // the two 不倒翁 drop in (L8 +0.8), both get an O (+6.6), selenium shakes its off (+8.4);
    // Pip punches sulfur (+11.4): it falls and burns; then selenium (+15.2): it swings back and bonks Pip
    const TS = [880, RAIL], TSE = [1300, RAIL];
    const dropS = seg(t, L(8, .6), L(8, 1.0)), dropSe = seg(t, L(8, .8), L(8, 1.2));
    const angS = 1.45 * easeOut(seg(t, L(8, 11.45), L(8, 11.9))) - .12 * spring(t, L(8, 11.9), 6, 20);
    const burnt = ease(seg(t, L(8, 11.9), L(8, 12.8)));
    const punch = L(8, 15.2), swing = t < punch ? .1 * spring(t, L(8, 1.2), 3, 9) : t < punch + .45 ? 1.25 * Math.sin(seg(t, punch, punch + .45) * Math.PI * .5) : t < punch + .95 ? lerp(1.25, -1.0, ease(seg(t, punch + .45, punch + .95))) : -1.0 * Math.exp(-3 * (t - punch - .95)) * Math.cos((t - punch - .95) * 7);
    const oxS = ease(seg(t, L(8, 6.5), L(8, 6.9))) + ease(seg(t, L(8, 11.9), L(8, 12.6))) * 2, oxSe = ease(seg(t, L(8, 6.6), L(8, 7.0))) * (1 - ease(seg(t, L(8, 8.4), L(8, 8.7))));
    if (dropS > 0) tumbler(TS[0], lerp(-200, TS[1], easeIn(Math.min(dropS, 1))), 1, angS + .12 * spring(t, L(8, 1.0), 4, 14), 's', 'b2ts', { burnt, ox: oxS / 3 });
    if (dropSe > 0) tumbler(TSE[0], lerp(-200, TSE[1], easeIn(Math.min(dropSe, 1))), 1, swing + .12 * spring(t, L(8, 1.2), 4, 14), 'se', 'b2tse', { ox: oxSe / 3 });
    if (oxSe > 0 && t > L(8, 8.4) && t < L(8, 9.4)) { const k = seg(t, L(8, 8.4), L(8, 9.4)); oBead(TSE[0] + 300 * k, TSE[1] - 190 - 200 * Math.sin(k * Math.PI), 13, 'b2away'); }
    for (let i = 0; i < 3; i++) { const k = frac(t * .7 + i / 3); if (burnt > .3) puff(TS[0] + 120 + 30 * i, TS[1] - 60 - 120 * k, 14 + 22 * k, (1 - k) * burnt, 'b2bs' + i, '#7E7884'); }
    // Pip: glassblower (cheeks puff), strolls under the signal, nearly flattened by the train, then the punches
    const walk1 = ease(seg(t, L(7, 6.6), L(7, 8.2))), toS = ease(seg(t, L(8, 9.6), L(8, 10.8))), toSe = ease(seg(t, L(8, 13.4), L(8, 14.6)));
    let px = lerp(lerp(blowP[0], PipX, walk1), TS[0] - 150, toS);
    if (t > L(8, 13.4)) px = lerp(TS[0] - 150, TSE[0] - 150, toSe);
    const hit = punch + .9, spin = seg(t, hit, hit + .8);
    let o = K.act(t, [[0, 'strain', { lookX: 1 }], [L(7, 3.4), 'excited', { lookX: 1 }], [L(7, 6.6), 'happy', { lookX: 1, lookY: -.7 }], [L(7, 9.2), 'wow', { lookX: 1, take: 1.3 }],
      [L(7, 10.4), 'worried', { lookX: 1, blush: 1 }], [L(8, 1.2), 'calm', { lookX: 1 }], [L(8, 6.8), 'wow', { lookX: 1, lookY: -.5 }], [L(8, 8.6), 'idea', { lookX: 1 }],
      [L(8, 10.8), 'angry', { lookX: 1 }], [L(8, 12.0), 'smug', { lookX: 1 }], [L(8, 14.6), 'angry', { lookX: 1 }], [hit, 'dizzy']]);
    if (blowing && t > L(7, -.5)) o = { ...o, armF: { at: [1.4, -2.5] }, armsFront: true, sq: (o.sq || 0) + .06 * Math.sin(t * 5) };
    const wind = (pt) => on(t, pt - .6, pt + .1, .4, .05), jab = (pt) => on(t, pt, pt + .5, .05, .3);
    for (const pt of [L(8, 11.4), punch]) { if (wind(pt) > .02) o = { ...o, armF: [lerp(-.4, -1.2, wind(pt)), 2.0], rot: -.12 * wind(pt) }; if (jab(pt) > .02) o = { ...o, armF: [.1, lerp(2.0, 3.6, jab(pt))], rot: .1 * jab(pt) }; }
    if (t > L(7, 9.3) && t < L(8, .4)) o = { ...o, leaf: -1.3 + .2 * Math.sin(t * 30) };
    const walking = (walk1 > 0 && walk1 < 1) || (toS > 0 && toS < 1) || (toSe > 0 && toSe < 1);
    o = { ...o, walk: walking ? t * 2.4 : 0, rot: (o.rot || 0) + (spin > 0 && spin < 1 ? spin * TAU : 0), sq: (o.sq || 0) + (spin >= 1 ? .1 : 0) };
    pip(px, RAIL, u, { ...o, key: 'b2pip' });
    if (blowing && t > L(7, -.5)) { const m = mouthOf(px, RAIL, u, o); boilSeed('b2pipe'); inkLine([[m[0] + 8, m[1]], [tip[0] + 20, tip[1]]], 5, '#7E8694', 'ink', 0); }
    if (t > hit && t < hit + 2.6) stars(px, RAIL - 5.2 * u, 46, t, 'b2dz');
    if (t > hit && t < hit + .4) K.burst(px + 30, RAIL - 5 * u, 60, seg(t, hit, hit + .4), PAL.cream, 'b2bonk');
    camEnd();
    streaks(arrive, 'b2wp');
    if (irisK > 0) { const at = toScreen(TSE[0], TSE[1] - 90, LAST_CAM); iris(at[0], at[1], lerp(1500, 0, easeIn(irisK)), PAL.ink); }
  }


  // ---------- the genetic code props: mRNA, tRNA, the release factor ----------
  const BASEC = { A: '#E8AA38', U: '#3A9C98', G: '#6E9F58', C: '#D9708A' };
  // a straight piece of mRNA from x0 rightward, pegs pointing up, one per base (step 26). hi(i) → 0..1 highlight.
  function rnaLine(x0, y, seq, key, o = {}) {
    const st = 26, n = seq.length, x1 = x0 + n * st;
    boilSeed('rn' + key); paint(ribbon([[x0, y], [x1, y]], 13, 13), { wash: '#FBF2DF', ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < n; i++) {
      const b = seq[i], x = x0 + (i + .5) * st, h = o.hi ? o.hi(i) : 0;
      boilSeed('rp' + key + i);
      paint(rrPts(x - 5.5 * (1 + .2 * h), y - 6 - 24 * (1 + .25 * h), 11 * (1 + .2 * h), 24 * (1 + .25 * h), 4), { wash: mixCol(BASEC[b], PAL.cream, .3 * h), ink: PAL.ink, sw: .7 });
    }
    return x1;
  }
  // the special tRNA: anticodon arm down to (x, y), cloverleaf body, acceptor stem up with the amino acid on top.
  // aa: 'ser' (a cream serine with a blue O), 'sec' (ruby selenium), null. col: the body colour.
  function trna(x, y, s, ang, key, o = {}) {
    boilSeed('tn' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    const col = o.col || '#E8C2D2', dk = mixCol(col, PAL.ink, .25);
    for (let j = 0; j < 3; j++) paint(rrPts(-34 + j * 23 - 8, -2, 16, 22, 4), { wash: ['#E8AA38', '#D9708A', '#3A9C98'][j], ink: PAL.ink, sw: .7 });   // anticodon (pairs with UGA)
    paint(rrPts(-36, -26, 72, 26, 10), { wash: col, ink: PAL.ink, sw: .9 });
    const B = []; for (let i = 0; i < 40; i++) { const q = i / 40 * TAU, lob = 1 + .3 * Math.max(0, Math.cos(q * 3 - Math.PI / 2)); B.push([Math.cos(q) * 56 * lob, -84 + Math.sin(q) * 44 * lob]); }
    paint(B, { wash: col, fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw: .9, curv: .3 });
    paint(rectPts(-10, -186, 20, 64), { wash: col, ink: PAL.ink, sw: .8 });
    pop();
    const top = [x + Math.sin(ang) * 196 * s, y - Math.cos(ang) * 196 * s];
    if (o.aa === 'ser') { bead(top[0], top[1], 17 * s, '#F3E6CC', '#D8C8A6', key + 'sr'); if ((o.oK ?? 1) > .05) bead(top[0], top[1] - 24 * s, 10 * s * (o.oK ?? 1), Z.o, Z.oDk, key + 'so'); }
    if (o.aa === 'sec') seBead(top[0], top[1], 18 * s, key + 'sc', { glowK: o.glowK || 0 });
    return top;
  }
  // the release factor (eRF1): slate grey and tRNA-shaped (it mimics one), carrying a round no-entry paddle. No face.
  function releaseF(x, y, s, t, key, paddle = 1, flat = 0) {
    boilSeed('rf' + key);
    const bob = 3 * Math.abs(Math.sin(t * 9)) * (1 - flat);
    push(); translate(x, y - bob); scale(s, s * (1 - .5 * flat));
    paint([[-40, 0], [40, 0], [56, -90], [10, -170], [-30, -150], [-56, -80]], { wash: '#8C93A3', fill: '#616878', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.2, curv: .45 });
    for (const sd of [-1, 1]) paint(ellPts(sd * 24, 4, 16, 9, 10), { wash: '#616878', ink: PAL.ink, sw: .9 });
    if (paddle > .05) {
      const a = lerp(.9, -.1, paddle), px = 70 + Math.sin(a) * 120, py = -150 - Math.cos(a) * 120;
      inkLine([[30, -110], [px, py]], 5, '#6E5A48', 'ink', 0);
      paint(ellPts(px, py, 40, 40, 20), { wash: '#D2413F', ink: PAL.ink, sw: 1.1 });
      paint(rrPts(px - 24, py - 7, 48, 14, 4), { wash: PAL.cream, ink: null });
    }
    pop();
  }

  // ================================ C1 · twenty-one amino acids (L9 – L12) ================================
  const AACOL = ['#F2B49A', '#B9D99A', '#9CC4E4', '#E7B7D3', '#F3D58A', '#C9B8E8', '#A8DCCB', '#F0C07A', '#E8A9A0', '#C4D7A0'];
  function aa(x, y, r, i, key) { bead(x, y, r, AACOL[i % AACOL.length], mixCol(AACOL[i % AACOL.length], PAL.ink, .25), key); }
  // an amino acid as a lollipop: the backbone bead with its side chain ending in S (Cys) or Se (Sec)
  function sideChain(x, y, s, tipSe, key, tipK = 1) {
    boilSeed('sc' + key);
    inkLine([[x, y], [x, y - 70 * s]], 5 * s, '#8A7B6A', 'ink', 0);
    bead(x, y, 30 * s, '#F3E6CC', '#D8C8A6', key + 'bb');
    if (tipK > .05) { const r = 26 * s * tipK; if (tipSe) seBead(x, y - 92 * s, r * 1.1, key + 'tp'); else sBead(x, y - 92 * s, r, key + 'tp'); }
  }
  const ROW = i => [300 + i * 64, 470 + 26 * Math.sin(i * .5)];
  function shotC1(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(9, -1), [960, 520, 1.12]], [L(10, -.4), [960, 520, 1.12]], [L(10, .4), [960, 520, 1.3]], [L(11, -.3), [960, 520, 1.3]], [L(11, .6), [830, 680, 1.65]]], ease);
    const pan = easeIn(seg(t, L(12, -.9), L(12, -.2)));
    camBegin(c[0] + 1600 * pan + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash(K.C.cyto, t, { key: 'c1', blob: '#FBEBDD', n: 4 });
    K.motes(t, 14, '#EBC9AE', { key: 'c1m' });
    const showRow = 1 - ease(seg(t, L(10, -.2), L(10, .5))), showAB = on(t, L(10, -.2), L(11, .2), .5, .5), showRNA = ease(seg(t, L(11, -.1), L(11, .6)));
    // L9: the row of twenty, then the ruby one drops in at the end (BONG) and Pip polishes it
    if (showRow > .02) {
      for (let i = 0; i < 20; i++) { const q = popK(seg(t, L(9, .3 + i * .15), L(9, .65 + i * .15))); if (q < .05) continue; const [x, y] = ROW(i); aa(x, y + 120 * (1 - showRow), 24 * q, i, 'c1a' + i); }
      const dk = seg(t, L(9, 3.9), L(9, 4.4)), [rx, ry] = ROW(20);
      if (dk > 0) { const y = dk < 1 ? lerp(-120, ry, easeIn(dk)) : ry + 16 * spring(t, L(9, 4.4), 5, 18); seBead(rx, y + 120 * (1 - showRow), 30, 'c1sec', { glowK: .5 * pulseK(t, L(9, 6.9), 1.2) }); }
      if (t > L(9, 4.4) && t < L(9, 4.9)) K.burst(rx, ry, 60, seg(t, L(9, 4.4), L(9, 4.85)), PAL.ink, 'c1bong');
    }
    // L10: Cys and Sec side by side; Pip swaps their tips like a shell game, ending S | Se
    const CY = [760, 640], SEC = [1160, 640];
    if (showAB > .02) {
      const sw = [L(10, 3.2), L(10, 3.75), L(10, 4.3), L(10, 4.85)], swk = sw.map(a => seg(t, a, a + .4));
      let nSw = swk.filter(k => k >= 1).length; const live = swk.findIndex(k => k > 0 && k < 1);
      const tipOf = (left, n) => left ? n % 2 === 1 : n % 2 === 0;    // is this tip Se, after n swaps?
      sideChain(CY[0], CY[1] + 200 * (1 - showAB), 1.4, tipOf(true, nSw), 'c1cy', live >= 0 ? 0 : 1);
      sideChain(SEC[0], SEC[1] + 200 * (1 - showAB), 1.4, tipOf(false, nSw), 'c1se', live >= 0 ? 0 : 1);
      if (live >= 0) { const k = swk[live], a = [CY[0], CY[1] - 129], b = [SEC[0], SEC[1] - 129], pa = arcPt(a, b, 120, ease(k)), pb = arcPt(b, a, -90, ease(k));
        const leftSe = tipOf(true, nSw); if (leftSe) { seBead(pa[0], pa[1], 40, 'c1fa'); sBead(pb[0], pb[1], 36, 'c1fb'); } else { sBead(pa[0], pa[1], 36, 'c1fa'); seBead(pb[0], pb[1], 40, 'c1fb'); } }
      if (t > L(10, 5.3)) K.sparkle(SEC[0], SEC[1] - 130, 46, seg(t, L(10, 5.3), L(10, 6.1)), PAL.cream);
    }
    // L11: a strip of mRNA; the ruby bead tries the codons, gets shoved off, and lands on the red light (UGA)
    const SEQ1 = 'GCUAGCUUCGGAGCCAUGUGAA', X0 = 520, Y0 = 760, UGA = X0 + 19 * 26;
    if (showRNA > .02) {
      rnaLine(X0, Y0 + 200 * (1 - showRNA), SEQ1, 'c1r', { hi: i => i >= 18 && i <= 20 ? on(t, L(11, 4.7), L(12, 2), .3, .3) : 0 });
      const hop = [L(11, 1.6), L(11, 2.4), L(11, 3.2), L(11, 4.6)], spots = [X0 + 4 * 26, X0 + 10 * 26, X0 + 13 * 26, UGA];
      let p = [X0 - 60, Y0 - 120];
      for (let i = 0; i < hop.length; i++) { if (t > hop[i]) { const k = seg(t, hop[i], hop[i] + .45), from = i ? [spots[i - 1], Y0 - 70] : p, to = [spots[i], Y0 - 70];
        p = k < 1 ? arcPt(from, to, 90, ease(k)) : to; if (i < 3 && t > hop[i] + .5) p = [spots[i] + 40 * ease(seg(t, hop[i] + .5, hop[i] + .7)), Y0 - 70 - 30 * Math.sin(seg(t, hop[i] + .5, hop[i] + .8) * Math.PI)]; } }
      for (let i = 0; i < 3; i++) if (t > hop[i] + .45 && t < hop[i] + .8) K.burst(spots[i], Y0 - 70, 40, seg(t, hop[i] + .45, hop[i] + .8), PAL.ink, 'c1sh' + i);
      for (let i = 0; i < 3; i++) aa(spots[i], Y0 - 72, 20, i + 3, 'c1occ' + i);
      seBead(p[0], p[1], 22, 'c1hop');
      const lk = popK(seg(t, L(11, 4.7), L(11, 5.2))); if (lk > .05) stopLight(UGA, Y0 - 110, .8 * lk, 0, 'c1sl');
    }
    // Pip: polishes the ruby bead (L9), runs the shell game (L10), taps the red light, worried (L11)
    const u = 32;
    const px = t < L(10, -.2) ? 1660 : t < L(11, -.2) ? 960 : lerp(960, UGA + 150, ease(seg(t, L(11, 4.6), L(11, 6.0))));
    const py = t < L(10, -.2) ? 640 + 8 * Math.sin(t * 2.1) : t < L(11, -.2) ? 760 : Y0 - 2;
    let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(9, 4.5), 'wow', { lookX: -1 }], [L(9, 6.8), 'smug', { lookX: -1 }], [L(10, -.1), 'calm', { lookX: 0, lookY: -.6 }],
      [L(10, 3.0), 'excited', { lookY: -.8 }], [L(10, 5.4), 'smug', { lookX: .8, lookY: -.6 }], [L(11, 1.6), 'confused', { lookX: -1, lookY: -.3 }], [L(11, 5.0), 'worried', { lookX: -1, lookY: -.8 }]]);
    const polish = on(t, L(9, 7.0), L(10, -.6), .2, .3);
    if (polish > .02) o = { ...o, armF: { at: [-2.5 + .3 * Math.sin(t * 14), -4.6 + .25 * Math.cos(t * 14)] }, flip: true };
    else if (t < L(10, -.2)) o = { ...o, flip: true };
    if (t > L(10, 3.0) && t < L(10, 5.4)) o = { ...o, armF: [1.2 + .5 * Math.sin(t * 16), 2.6], armB: [1.2 + .5 * Math.sin(t * 16 + 3), 2.6] };
    if (t > L(11, 6.6)) { const tap = .25 * Math.max(0, Math.sin((t - L(11, 6.6)) * 12)); o = { ...o, flip: true, armF: [1.0 + tap, 3.4] }; }
    if (t > L(11, -.2) && t < L(11, 6.6)) o = { ...o, flip: px > UGA };
    pip(px, py, u, { ...o, walk: t > L(11, 4.6) && t < L(11, 6.0) ? t * 2.4 : 0, key: 'c1pip' });
    if (polish > .02) { const h = handPt(px, py, u, o); boilSeed('c1rag'); paint(ellPts(h[0], h[1], 20, 14, 10, 2), { wash: '#F2E2C4', ink: PAL.ink, sw: .8 }); }
    camEnd();
    if (lt < .6) iris(W / 2, H / 2 + 60, lerp(0, 1500, easeIn(lt / .6)), PAL.ink);
  }

  // ================================ C2 · the ribosome train, the hairpin, the race (L12 – L15) ================================
  const SEQ2 = 'AUGGCCAGCUUCGGAUCCAGCCUGGAAUGAGCAUCCGGUACCUUAGGCAUCCAGGUAACCGGAUCGUAGCAAGCCUUAACGGAU', RX0 = -300, RY = 700;
  const UGA2 = RX0 + (12 * 3 + 1.5) * 26, RS = 1.6, RIBO_END = UGA2 - 30 * RS;   // the UGA codon (bases 36–38) and where the ribosome stops
  const HP = 2420;                                                  // the SECIS hairpin in the 3′ UTR
  function hairpin(x, y, k, key, t) {                              // a stem of paired pegs and a loop, with a pull cord
    boilSeed('hp' + key);
    for (const sd of [-1, 1]) paint(ribbon([[x + sd * 30, y], [x + sd * 30, y - 190]], 12, 12), { wash: '#FBF2DF', ink: PAL.ink, sw: 1 });
    paint(ribbon([[x - 30, y - 190], [x - 22, y - 236], [x, y - 252], [x + 22, y - 236], [x + 30, y - 190]], 12, 12), { wash: '#FBF2DF', ink: PAL.ink, sw: 1, curv: .5 });
    for (let i = 0; i < 6; i++) { const yy = y - 22 - i * 28; boilSeed('hpr' + key + i);
      paint(rrPts(x - 24, yy - 5, 22, 10, 3), { wash: ['#3A9C98', '#6E9F58', '#E8AA38', '#D9708A', '#6E9F58', '#3A9C98'][i], ink: PAL.ink, sw: .6 });
      paint(rrPts(x + 2, yy - 5, 22, 10, 3), { wash: ['#E8AA38', '#D9708A', '#3A9C98', '#6E9F58', '#D9708A', '#E8AA38'][i], ink: PAL.ink, sw: .6 }); }
    const pull = k * 60, P = [[x, y - 252], [x + 10, y - 150 + pull], [x + 4, y - 60 + pull]];
    inkLine(P, 2, '#8A6A4A', 'ink', .6);
    paint(ellPts(P[2][0], P[2][1] + 16, 15, 15, 14), { wash: '#F2C14A', ink: PAL.ink, sw: 1 });
    paint(ellPts(P[2][0], P[2][1] + 16, 7, 7, 10), { wash: K.C.cyto, ink: PAL.ink, sw: .7 });
    return [P[2][0], P[2][1] + 16];
  }
  function blob(x, y, rx, ry, col, key, rot = 0, cheap = false) { boilSeed('pb' + key); paint(ellPts(x, y, rx, ry, 22, 2, rot), cheap ? { wash: col, ink: PAL.ink, sw: 1 } : { wash: col, fill: mixCol(col, PAL.ink, .25), fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.1 }); }
  function shotC2(t, lt, dur) {
    K.setT(t);
    const arrive = 1 - easeOut(seg(lt, 0, .45));
    const c = kf(t, [[L(12, -1), [RIBO_END + 140, 560, 1.4]], [L(13, 1.2), [RIBO_END + 140, 560, 1.4]], [L(13, 2.8), [HP - 90, 560, 1.45]], [L(14, 1.2), [HP - 90, 560, 1.45]],
      [L(14, 2.6), [1530, 560, .78]], [L(14, 8.4), [1530, 560, .78]], [L(14, 9.4), [RIBO_END + 110, 570, 1.4]]], ease);
    camBegin(c[0] - 1600 * arrive + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash(K.C.cyto, t, { key: 'c2', blob: '#FBEBDD', n: 5 });
    K.motes(t, 16, '#EBC9AE', { key: 'c2m' });
    // the mRNA, with the hairpin cut into its 3′ UTR
    const cut = Math.floor((HP - 30 - RX0) / 26), green = ease(seg(t, L(14, 11.9), L(14, 12.4)));
    rnaLine(RX0, RY, SEQ2.slice(0, cut), 'c2a', { hi: i => i >= 36 && i <= 38 ? on(t, L(12, 3.0), L(15, 0), .3, .3) * (1 - green) : 0 });
    rnaLine(HP + 30, RY, SEQ2.slice(cut, cut + 30), 'c2b');
    const ring_ = hairpin(HP, RY, on(t, L(13, 4.2), L(13, 5.0), .1, .3), 'c2hp', t);
    // the ribosome: one codon per beat up to the UGA (red light), stops; chugs on once the light is green
    const go = seg(t, L(12, -1.4), L(12, 3.3)), on2 = seg(t, L(14, 12.4), L(14, 14.2));
    const rx = lerp(RIBO_END - 5 * 78, RIBO_END, Math.floor(go * 5 + 1e-6) / 5 + ease(frac(go * 5)) / 5 * (go < 1 ? 1 : 0)) + 78 * ease(on2);
    const chainN = 7 + Math.floor(go * 5) + (green > .5 ? 1 : 0);
    const chain = []; for (let i = 0; i <= 8; i++) chain.push([rx - 14 - i * 24, RY - 132 - i * 16 - 10 * Math.sin(i * .9 + t)]);
    K.ribosome(rx, RY, 0, RS, t, { key: 'c2rb', chain, chainN, stall: 0 });
    if (green > .5) { const p = chain[0]; seBead(p[0] + 6, p[1] + 4, 10, 'c2new'); }
    stopLight(RIBO_END + 30 * RS + 96, RY - 14, .62, green, 'c2sl');
    // the escort: SBP2 latches on the hairpin (L13 +6.4); eEFSec brings the special tRNA (+8.0)
    const sbp = popK(seg(t, L(13, 6.2), L(13, 6.7))), efs = ease(seg(t, L(13, 7.6), L(13, 8.6)));
    if (sbp > .05) blob(HP + 70, RY - 170, 50 * sbp, 38 * sbp, '#C9B4E4', 'c2sbp');
    // the race: Pip grabs the tRNA (L14 +0.8) and runs left; the release factor creeps in from the far left all along
    const grab = L(14, .8), slide = L(14, 9.4), slam = L(14, 9.9), flatT = L(14, 10.5);
    const rfx = kf(t, [[L(12, 3.4), RIBO_END + 760], [L(12, 5.4), RIBO_END + 560], [flatT - .6, RIBO_END + 175], [flatT, RIBO_END + 80]], x => x) + 1400 * easeIn(seg(t, L(14, 12.6), L(14, 14.4)));
    if (efs > .02 && t < grab) { const ex = lerp(HP + 600, HP + 150, efs); blob(ex, RY - 120, 70, 44, '#7FC4B4', 'c2efs'); trna(ex - 20, RY - 150, .8, 0, 'c2tr', { aa: 'sec', glowK: .3 }); }
    const runK = seg(t, grab + .2, slide), trip = L(14, 5.4);
    let px = t < grab ? HP - 110 : lerp(HP + 60, RIBO_END + 120, ease(runK));
    if (t > trip && t < trip + 1.2) px = lerp(HP + 60, RIBO_END + 120, ease(seg(trip, grab + .2, slide))) - 40 * ease(seg(t, trip, trip + .2));
    const slideK = seg(t, slide, slam);
    if (t > slide) px = lerp(RIBO_END + 160, RIBO_END + 70, easeOut(slideK));
    const flatK = t > flatT ? 1 - ease(seg(t, L(14, 12.0), L(14, 13.4))) : 0;
    let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(13, 3.6), 'smug', { lookY: -.8 }], [L(13, 4.5), 'excited'], [L(13, 6.5), 'wow', { lookX: 1 }],
      [grab, 'angry', { lookX: -1 }], [trip, 'dizzy'], [trip + 1.0, 'angry', { lookX: -1 }], [slam, 'excited'], [flatT, 'dizzy'], [L(14, 13.4), 'smug', { lookX: 1 }]]);
    const yank = on(t, L(13, 4.1), L(13, 5.2), .15, .3);
    if (t < grab && yank > .02) o = { ...o, armF: { at: [3.2, -2.0 + 1.4 * yank] }, rot: .1 * yank };
    const running = t > grab + .2 && t < slide && !(t > trip && t < trip + 1.0);
    if (running) o = { ...o, walk: t * 9, armB: [-.8 + .6 * Math.sin(t * 18), 2.0], armF: { at: [-2.4, -3.2] }, rot: -.14 };
    if (t > trip && t < trip + 1.0) o = { ...o, rot: -1.2 * on(t, trip, trip + 1.0, .15, .4), sq: .2 * on(t, trip, trip + 1.0, .15, .4) };
    if (t > slide && t < flatT) o = { ...o, rot: -.35 * (1 - slideK), armF: [.2, 3.6], sq: .1 };
    if (flatK > 0) o = { ...o, sq: .62 * flatK, rot: 0, armF: [-.2, 2.6 * (1 - flatK) + .6], armB: [-.2, 2.6 * (1 - flatK) + .6] };
    const flip = t >= grab && t < L(14, 12.8);
    pip(px, RY - 12, 32, { ...o, flip, noShadow: true, key: 'c2pip' });
    if (running || (t > trip && t < trip + 1.1)) for (let i = 0; i < 4; i++) { const k = frac(t * 3 + i / 4); puff(px + 60 + 90 * k, RY - 20 - 20 * k, 14 + 22 * k, 1 - k, 'c2dust' + i, '#E9D6C2'); }
    // the baton: in Pip's hand during the race, slammed into the A site at the slam
    if (t > grab && t < slam) { const h = handPt(px, RY - 12, 32, { ...o, flip }); trna(h[0], h[1] + 60, .55, -.5 * (running ? 1 : 0), 'c2bt', { aa: 'sec', glowK: .3 }); }
    if (t >= slam) trna(RIBO_END + 30 * RS + 78 * ease(on2), RY - 12 - 6 * spring(t, slam, 5, 18), .62, 0, 'c2in', { aa: on2 > .5 ? null : 'sec', glowK: .3 * (1 - green) });
    if (t > slam && t < slam + .4) K.burst(RIBO_END + 30 * RS, RY - 90, 70, seg(t, slam, slam + .4), PAL.ink, 'c2slam');
    // the release factor: paddle up from L12; rolls right over the flattened Pip; slinks off when the light turns green
    if (t > L(12, 3.6)) releaseF(rfx, RY - 14, .9, t, 'c2rf', ease(seg(t, L(12, 5.4), L(12, 6.2))) * (1 - ease(seg(t, L(14, 12.0), L(14, 12.6)))));
    if (t > flatT - .05 && t < flatT + .4) K.burst(px, RY - 30, 80, seg(t, flatT - .05, flatT + .35), PAL.ink, 'c2splat');
    if (flatK > .3 && t > flatT + .2) stars(px, RY - 70, 50, t, 'c2dz');
    if (t > L(13, 4.3) && t < L(13, 5.6)) for (let i = 0; i < 3; i++) { const k = seg(t, L(13, 4.3) + i * .12, L(13, 5.4) + i * .12); puff(HP + 10 * i, RY - 270 - 120 * k, 20 + 30 * k, 1 - k, 'c2toot' + i, PAL.cream); }
    camEnd();
    streaks(arrive, 'c2wp', false, '#E3C2A8');
  }

  // ================================ C3 · the magician's swap, the failed races, twenty-five (L15 – L17) ================================
  function shotC3(t, lt, dur) {
    K.setT(t);
    const zoomOut = ease(seg(t, L(16, 5.2), L(16, 6.2)));
    const raceZ = on(t, L(16, -.2), L(16, 5.6), .5, .5) * (1 - zoomOut);
    camBegin(lerp(lerp(990, 960, raceZ), 1080, zoomOut) + 5 * wob(t, .05), lerp(lerp(640, 520, raceZ), 480, zoomOut) + 4 * wob(t, .04), lerp(lerp(1.5, 1.1, raceZ), 1.05, zoomOut));
    K.wash(K.C.cyto, t, { key: 'c3', blob: '#FBEBDD', n: 4 });
    K.motes(t, 12, '#EBC9AE', { key: 'c3m' });
    // L15: the tRNA gets a serine (+3.4); the O pops off (+7.0); the Se is screwed in (+7.6 – 8.6) and lights up
    const TR = [900, 820], serK = seg(t, L(15, 3.2), L(15, 4.0)), popO = L(15, 7.0), screw = seg(t, L(15, 7.6), L(15, 8.6));
    const showTr = 1 - ease(seg(t, L(16, -.4), L(16, .2)));
    if (showTr > .02) {
      const top = trna(TR[0], TR[1] + 400 * (1 - showTr), 1.3, 0, 'c3tr', { aa: null });
      if (serK > 0 && t < L(15, 7.6)) { const p = serK < 1 ? arcPt([top[0] + 400, top[1] - 300], top, 120, ease(serK)) : top; bead(p[0], p[1], 26, '#F3E6CC', '#D8C8A6', 'c3ser'); if (t < popO) bead(p[0], p[1] - 36, 16, Z.o, Z.oDk, 'c3o'); }
      if (t > popO && t < popO + 1.2) { const k = seg(t, popO, popO + 1.2), p = arcPt([top[0], top[1] - 36], [top[0] - 600, top[1] - 100], 300, k); bead(p[0], p[1], 16, Z.o, Z.oDk, 'c3ofly'); }
      if (t > popO && t < popO + .35) K.burst(top[0], top[1] - 36, 50, seg(t, popO, popO + .35), PAL.ink, 'c3pop');
      if (t >= L(15, 7.6)) { const lit = ease(seg(t, L(15, 8.4), L(15, 8.8))); seBead(top[0], top[1] - 6 * (1 - screw), 28, 'c3se', { glowK: .9 * lit }); }
    }
    // L16: three races lost in a row, each in a little bubble; then twenty-five selenoproteins and the counting
    const lost = [L(16, .2), L(16, 1.8), L(16, 3.4)];
    lost.forEach((a, i) => {
      const k = Math.min(seg(t, a, a + 1.5), 1); if (k <= 0) return;
      inset(560 + i * 400, 520, 185, on(t, a, L(16, 5.4), .2, .3), 'c3l' + i, () => {
        const cx = 560 + i * 400, cy = 580;
        boilSeed('c3lw' + i); paint(ellPts(cx, cy - 60, 160, 160, 30), { wash: K.C.cyto, ink: null });
        rnaLine(cx - 140, cy + 40, 'GCAUGAGCAUG', 'c3lr' + i);
        K.ribosome(cx - 30, cy + 40, 0, .8, t, { key: 'c3lrb' + i, stall: 0 });
        releaseF(cx + 20, cy + 26, .5, t, 'c3lrf' + i, 1);
        const b = arcPt([cx + 120, cy - 40], [cx + 200, cy - 200], 80, ease(seg(k, .35, .8)));
        trna(b[0], b[1], .35, k * 6, 'c3ltr' + i, { aa: 'sec' });
        if (k > .33 && k < .5) K.burst(cx + 90, cy - 20, 50, seg(k, .33, .5), PAL.ink, 'c3lb' + i);
      });
    });
    const grid = (i) => [1120 + (i % 5) * 100, 230 + Math.floor(i / 5) * 92];
    for (let i = 0; i < 25; i++) { const q = popK(seg(t, L(16, 5.6 + i * .06), L(16, 5.95 + i * .06))); if (q < .05) continue; const [x, y] = grid(i);
      blob(x, y, 38 * q, 30 * q, AACOL[(i * 3) % AACOL.length], 'c3g' + i, hash(i) - .5, true); seBead(x + 14 * q, y - 6 * q, 9 * q, 'c3gs' + i); }
    // Pip: the magician (top hat), burnt fingers; furious through the lost races; counts to 25; the S-or-Se shrug
    const u = t < L(16, 5.2) ? 34 : 38, P = t < L(16, -.3) ? [1040, 640 + 8 * Math.sin(t * 2.1)] : t < L(16, 5.2) ? [1000, 900] : [lerp(1000, 800, ease(seg(t, L(16, 5.2), L(16, 6.0)))), 840];
    const count = t > L(16, 6.2) && t < L(16, 9.2), toes = seg(t, L(16, 7.4), L(16, 7.8)), topple = seg(t, L(16, 8.4), L(16, 8.9));
    let o = K.act(t, [[0, 'calm', { lookX: -1, lookY: -.5 }], [L(15, 3.6), 'wow', { lookX: -1, lookY: -.6 }], [L(15, 5.6), 'smug', { lookX: -1, lookY: -.6 }],
      [L(15, 8.8), 'wow', { take: 1.4 }], [L(15, 9.3), 'worried', { blush: 1 }], [L(16, .2), 'angry', { lookX: -1 }], [L(16, 5.2), 'calm', { lookX: 1, lookY: -.7 }],
      [L(16, 6.2), 'confused', { lookY: .6 }], [L(16, 8.4), 'dizzy'], [L(16, 9.2), 'confused', { lookX: 0 }]]);
    const screwArm = t > L(15, 6.6) && t < L(15, 8.7);
    if (t < L(16, -.3)) o = { ...o, flip: true };
    if (screwArm) o = { ...o, armF: { at: [3.0 + .25 * Math.sin(t * 22), -3.6 - .2 * Math.cos(t * 22)] } };
    if (t > L(15, 8.7) && t < L(16, .2)) o = { ...o, armF: { at: [.6, -2.4] }, armsFront: true };
    if (count) o = { ...o, armF: { at: [.9 + .3 * Math.sin(t * 9), -2.0] }, armsFront: true, sq: (o.sq || 0) + .25 * toes, dy: (o.dy || 0) + .4 * toes };
    if (topple > 0) o = { ...o, rot: -1.4 * ease(topple), sq: .1 };
    if (t > L(16, 9.2)) o = { ...o, armF: [1.1, 2.6], armB: [1.1, 2.6], rot: 0, sq: 0, dy: 0 };
    pip(P[0], P[1], u, { ...o, key: 'c3pip' });
    // the top hat, and the burnt-finger smoke
    if (t < L(16, -.3)) { const hd = headOf(P[0], P[1], u, o); boilSeed('c3hat'); paint(rectPts(hd[0] - 46, hd[1] - 8, 92, 14), { wash: '#3B3342', ink: PAL.ink, sw: .9 }); paint(rectPts(hd[0] - 28, hd[1] - 70, 56, 64), { wash: '#3B3342', ink: PAL.ink, sw: .9 }); paint(rectPts(hd[0] - 28, hd[1] - 24, 56, 10), { wash: Z.se, ink: null }); }
    if (t > L(15, 8.8) && t < L(16, .2)) { const h = handPt(P[0], P[1], u, o); for (let i = 0; i < 3; i++) { const k = frac(t * 1.2 + i / 3); puff(h[0] + 10 * i, h[1] - 20 - 60 * k, 8 + 12 * k, 1 - k, 'c3sm' + i, '#CFC6CC'); } }
    if (t > L(16, 9.2)) { const hF = handPt(P[0], P[1], u, o), hB = handPt(P[0], P[1], u, o, 'B'); sBead(hF[0], hF[1] - 20, 22, 'c3ys'); seBead(hB[0], hB[1] - 20, 24, 'c3ysr'); }
    camEnd();
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#8CC7B0', '#B8E0D0']);
  }


  // ---------- peroxide chemistry props (H₂O₂, water, radicals and iron after copper.js; flames after thermo.js) ----------
  function h2o2(x, y, s, ang, key) {                               // a lilac dumbbell
    if (s < .05) return; boilSeed('hp' + key);
    const dx = Math.cos(ang) * 20 * s, dy = Math.sin(ang) * 20 * s;
    paint(ribbon([[x - dx, y - dy], [x + dx, y + dy]], 9 * s, 9 * s), { wash: Z.h2o2Dk, ink: PAL.ink, sw: .7 });
    for (const sd of [-1, 1]) paint(ellPts(x + sd * dx, y + sd * dy, 14 * s, 14 * s, 12), { wash: Z.h2o2, ink: PAL.ink, sw: .9 });
  }
  function water(x, y, s, key) {                                   // a droplet, tip up
    if (s < .05) return; boilSeed('wa' + key);
    const P = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, w = Math.sin(a / 2); P.push([x + Math.sin(a) * 15 * s * (.35 + .65 * w), y - Math.cos(a) * 20 * s + 9 * s * w]); }
    paint(P, { wash: Z.water, ink: PAL.ink, sw: .9, curv: .4 });
    paint(ellPts(x - 5 * s, y + 2 * s, 3.5 * s, 5 * s, 8), { wash: PAL.cream, ink: null });
  }
  function radical(x, y, r, t, key, big = 0) {                      // a spiky magenta star with the unpaired-electron dot
    if (r < 2) return; boilSeed('rd' + key);
    const n = big ? 11 : 8, rot = t * (big ? 3 : 2) + hash(key.length);
    paint(starPts(x, y, r, .52 + .06 * Math.sin(t * 9), n, rot), { wash: mixCol(Z.rad, Z.radDk, big * .5), ink: PAL.ink, sw: clamp(r / 26, .6, 1.3) });
    paint(ellPts(x + r * .1, y - r * .1, r * .14, r * .14, 8), { wash: PAL.ink, ink: null });
  }
  function feIon(x, y, r, n, key) {                                // iron: a rust-brown bead with n + discs
    if (r < 2) return; bead(x, y, r, Z.fe, Z.feDk, 'fe' + key);
    const s = r * .5; for (let i = 0; i < n; i++) K.charge('+', x + (i - (n - 1) / 2) * s * 1.05, y + r * .15, s, 1, PAL.ink, key + 'c' + i);
  }
  function gsh(x, y, s, key, ang = 0) {                             // glutathione: Glu, Cys (yellow sulfur), Gly (from copper.js)
    boilSeed('gs' + key);
    const pts = [-1, 0, 1].map(i => [x + Math.cos(ang) * i * 22 * s, y + Math.sin(ang) * i * 22 * s]);
    inkLine(pts, 2, PAL.ink, 'ink', 0);
    pts.forEach((p, i) => paint(ellPts(p[0], p[1], 12 * s, 12 * s, 10), { wash: ['#E7B7D3', Z.sul, '#B9D99A'][i], ink: PAL.ink, sw: .7 }));
  }
  function flame(x, y, r, t, key) {                                 // a teardrop flame, flickering (from thermo.js flameIcon)
    if (r < 2) return; boilSeed('fi' + key);
    const tear = (s, f) => { const P = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, w = Math.sin(a / 2); P.push([x + Math.sin(a) * r * s * .62 * (.4 + .6 * w), y - Math.cos(a) * r * s * (1 + .1 * f) + r * s * .3 * w]); } return P; };
    const f = wob(t, 4, hash(key.length));
    glow(x, y - r * .3, r * 2.2, '#FF9A40', .5);
    paint(tear(1, f), { wash: '#E2462E', ink: PAL.ink, sw: .9, curv: .4 });
    paint(tear(.62, -f).map(([a, b]) => [a, b + r * .25]), { wash: '#F28C2E', ink: null, curv: .4 });
    paint(tear(.32, f).map(([a, b]) => [a, b + r * .45]), { wash: '#FCD15A', ink: null, curv: .4 });
  }
  function mitoS(x, y, s, ang, key) {                               // a small mitochondrion: double membrane and cristae
    boilSeed('mt' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    paint(ellPts(0, 0, 120, 62, 24), { wash: '#E89A72', fill: '#C26E4C', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(0, 0, 104, 48, 22), { wash: '#F2B896', ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 5; i++) { const xx = -70 + i * 35, up = i % 2 ? -1 : 1; inkLine([[xx, up * 46], [xx + 6, up * 6], [xx + 14, up * 46]], .9, '#C26E4C', 'ink', .5); }
    pop();
  }
  // a glutathione peroxidase: a mint two-lobed blob with a pocket; the Se (or a sulfur, for the Cys version) sits in it.
  // o: sul (draw S instead of Se), ox/h/gs (the Se states), burnt, gloves [aL, aR] (boxing), hose (as an extinguisher)
  const GPXPOCKET = [-58, -46];
  function gpx(x, y, s, key, o = {}) {
    const col = mixCol(o.col || '#8FD0B4', '#6E6A70', o.burnt || 0), dk = mixCol('#5C9C84', '#4A464C', o.burnt || 0);
    auditBox('gpx', key, x - 130 * s, y - 110 * s, x + 130 * s, y + 100 * s);
    boilSeed('gx' + key);
    const fl = o.flat || 0;
    push(); translate(x, y + 50 * s * fl); rotate(o.rot || 0); scale(s * (1 + .25 * fl), s * (1 - .45 * fl));
    if (o.gloves) o.gloves.forEach((a, i) => { const sd = i ? 1 : -1, bx = sd * 110, by = -10, gx_ = bx + Math.cos(a) * 70 * sd, gy = by - Math.sin(a) * 70;
      inkLine([[bx, by], [gx_, gy]], 10, dk, 'ink', 0); paint(ellPts(gx_, gy, 30, 26, 16), { wash: '#D2413F', ink: PAL.ink, sw: 1 }); paint(ellPts(gx_ + sd * 12, gy - 18, 12, 10, 10), { wash: '#D2413F', ink: PAL.ink, sw: .8 }); });
    paint([[-130, 10], [-110, -60], [-80, -84], [-36, -74], [-20, -40], [10, -88], [70, -96], [126, -50], [130, 30], [90, 92], [-60, 98], [-120, 64]], { wash: col, fill: dk, fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.3, curv: .45 });
    paint(ellPts(GPXPOCKET[0], GPXPOCKET[1] + 6, 36, 26, 16), { wash: dk, ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 3; i++) inkLine([[-90 + i * 70, 20], [-70 + i * 70, 70]], .8, dk, 'inkfine', .5);
    if (o.hose) { inkLine([[120, 0], [190, 20], [220, -20], [260, -10]], 9, '#4E5566', 'ink', .6); paint(rrPts(250, -24, 34, 26, 6), { wash: '#3E4352', ink: PAL.ink, sw: .9 }); }
    pop();
    const p = [x + GPXPOCKET[0] * s * (1 + .25 * fl), y + 50 * s * fl + (GPXPOCKET[1] - 6) * s * (1 - .45 * fl)];
    if (o.noBead) return p;
    if (o.sul) sBead(p[0], p[1], 24 * s, key + 'sp', o.burnt || 0);
    else seBead(p[0], p[1], 24 * s, key + 'sp', { ox: o.ox, h: o.h ?? 1, gs: o.gs, glowK: o.glowK });
    if (o.sul && o.ox > .05) for (let i = 0; i < Math.ceil(o.ox * 3 - .01); i++) oBead(p[0] - 22 * s + i * 22 * s, p[1] - 30 * s - 8 * s * (i % 2), 11 * s, key + 'sx' + i);
    return p;
  }
  function handMirror(x, y, s, ang, key) {
    boilSeed('hm' + key); push(); translate(x, y); rotate(ang); scale(s);
    inkLine([[0, 0], [0, 50]], 7, '#B48A5A', 'ink', 0);
    paint(ellPts(0, -40, 36, 44, 18), { wash: '#C9D8E6', ink: PAL.ink, sw: 1.1 }); paint(ellPts(-10, -52, 9, 14, 10, 0, .4), { wash: PAL.cream, ink: null });
    pop();
  }

  // ================================ D1 · glutathione peroxidase: catch, split, reset; sulfur loses the fight (L17 – L23) ================================
  const G1 = [1180, 600], MITO1 = [330, 300];
  function hpPath(t, i, t0) {                                       // H₂O₂ drifting out of the mitochondrion
    const a = t0 + i * .45, k = t - a; if (k < 0) return null;
    return [MITO1[0] + 120 + k * (80 + 30 * hash(i)), MITO1[1] + 40 + 160 * Math.sin(k * .7 + i) * (.3 + .2 * hash(i + 2))];
  }
  function shotD1(t, lt, dur) {
    K.setT(t);
    const ring_ = ease(seg(t, L(22, .1), L(22, 1.1)));
    const c = kf(t, [[L(17, -2), [960, 540, 1.1]], [L(20, -.4), [960, 540, 1.1]], [L(20, .4), [G1[0] - 90, 600, 1.75]], [L(21, 5.6), [G1[0] - 90, 600, 1.75]], [L(22, .2), [960, 640, 1.18]]], ease);
    const whip = easeIn(seg(t, L(23, -1.0), L(23, -.65)));
    camBegin(c[0] + 5 * wob(t, .05), c[1] + 1200 * whip + 4 * wob(t, .04), c[2]);
    K.wash('#D7EDE3', t, { key: 'd1', blob: '#E8F5EF', n: 4 });
    K.motes(t, 14, '#B8DCCB', { key: 'd1m' });
    const u = 32, ringOn = ring_ > .02;
    if (!ringOn) {
      mitoS(MITO1[0], MITO1[1], 1.1, -.2, 'd1mt');
      // the GPx glides in (L17), H₂O₂ leaks out, one splashes Pip (L18 +5.4), one meets iron (L19 +5.9: boom)
      const gx = lerp(2300, G1[0], easeOut(seg(t, L(17, .3), L(17, 1.8))));
      const chomp = L(20, .6), drip = L(20, 2.8), oxOn = L(20, 4.2), gs1 = L(21, 2.6), gs2 = L(21, 4.2);
      const ox = ease(seg(t, oxOn, oxOn + .3)) * (1 - ease(seg(t, gs1, gs1 + .3))), gsK = ease(seg(t, gs1, gs1 + .3)) * (1 - ease(seg(t, gs2 + .4, gs2 + .7)));
      const jack = pulseK(t, L(21, 5.3), 1.0);
      const pk = gpx(gx, G1[1] + 6 * Math.sin(t * 1.4) + 10 * spring(t, L(17, 2.6), 5, 16), 1.5, 'd1g', { ox, h: 1 - ease(seg(t, chomp, chomp + .3)) + ease(seg(t, gs2 + .4, gs2 + .7)), gs: gsK, glowK: .8 * jack });
      for (let i = 0; i < 6; i++) { const p = hpPath(t, i, L(17, 5.2)); if (!p || (i === 1 && t > L(18, 3.0)) || (i === 3 && t > L(19, 3.6)) || (i === 4 && t > chomp - .6)) continue; h2o2(p[0], p[1], 1.8, t + i, 'd1h' + i); }
      // the one that goes into the pocket (L20 +0.6), and the water that drips out (+2.8)
      if (t > chomp - .6 && t < chomp) { const k = seg(t, chomp - .6, chomp), s0 = hpPath(chomp - .6, 4, L(17, 5.2)); const p = [lerp(s0[0], pk[0], ease(k)), lerp(s0[1], pk[1], ease(k))]; h2o2(p[0], p[1], 1.8, k * 3, 'd1in'); }
      if (t > drip && t < drip + 1.2) { const k = seg(t, drip, drip + 1.2); water(pk[0] - 10, pk[1] + 40 + 260 * easeIn(k), 1.3, 'd1dr'); }
      if (t > gs1 + .3 && t < gs1 + 1.6) { const k = seg(t, gs1 + .3, gs1 + 1.6); water(pk[0] + 30, pk[1] + 40 + 260 * easeIn(k), 1.1, 'd1dr2'); }
      // two glutathiones: fed in like coins; the pair walks off as GSSG
      for (let j = 0; j < 2; j++) { const a = L(21, .8 + j * .5), feed = j ? gs2 : gs1; if (t < a) continue;
        let p; if (t < feed - .5) p = [lerp(1800, 1330 + 80 * j, ease(seg(t, a, a + 1.0))), 790 + 10 * Math.sin(t * 5 + j)]; else if (t < feed) p = arcPt([1330 + 80 * j, 790], [pk[0] + 40, pk[1] - 10], 120, ease(seg(t, feed - .5, feed))); else p = null;
        if (p) gsh(p[0], p[1], 1.2, 'd1gs' + j, Math.sin(t * 6 + j) * .3); }
      if (t > gs2 + .5) { const k = seg(t, gs2 + .5, gs2 + 2.6); for (let j = 0; j < 2; j++) gsh(pk[0] + 60 + 380 * k + j * 10, pk[1] + 20 + 30 * j - 40 * Math.sin(k * 6), 1.1, 'd1gg' + j, j * Math.PI / 2); }
      if (jack > .02) for (let j = 0; j < 5; j++) K.sparkle(pk[0] + (j - 2) * 40, pk[1] - 70 - 20 * (j % 2), 26, seg(t, L(21, 5.3) + j * .08, L(21, 6.1) + j * .08), '#FFE7A0');
      // the iron meets an H₂O₂: BOOM, a hydroxyl radical ricochets about
      const fe = [760, 820], boom = L(19, 5.9);
      if (t > L(19, 1.0)) feIon(lerp(-100, fe[0], easeOut(seg(t, L(19, 1.0), L(19, 2.6)))), fe[1], 36, 2, 'd1fe');
      if (t > L(19, 3.6) && t < boom) { const k = seg(t, L(19, 3.6), boom), s0 = hpPath(L(19, 3.6), 3, L(17, 5.2)); h2o2(lerp(s0[0], fe[0], ease(k)), lerp(s0[1], fe[1] - 30, ease(k)), 1.8, k * 4, 'd1tofe'); }
      if (t > boom && t < boom + .5) K.burst(fe[0], fe[1] - 30, 120, seg(t, boom, boom + .5), Z.rad, 'd1boom');
      if (t > boom && t < L(20, .4)) { const B = [[fe[0], fe[1] - 40], [1500, 260], [1700, 760], [900, 180], [420, 640], [1300, 900], [2100, 300]], k = seg(t, boom, boom + 3.6) * (B.length - 1), i = Math.min(B.length - 2, Math.floor(k)), q = k - i;
        radical(lerp(B[i][0], B[i + 1][0], q), lerp(B[i][1], B[i + 1][1], q), 46, t, 'd1oh', 1); }
      // Pip: pats the GPx, catches an H₂O₂, splash (blond leaf), the mirror; ducks the radical; the slot machine
      const P = [lerp(820, 860, ease(seg(t, L(17, 2.0), L(17, 2.6)))), 840];
      const splash = L(18, 5.4), blond = ease(seg(t, splash, splash + .25));
      let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(17, 2.6), 'happy', { lookX: 1 }], [L(17, 5.6), 'calm', { lookX: -1, lookY: -.6 }], [L(18, 2.8), 'idea', { lookX: -.4, lookY: -.6 }],
        [splash, 'wow', { take: 1.4 }], [L(18, 7.0), 'worried', { lookX: 1, lookY: -.3, blush: 1 }], [L(19, 1.0), 'calm', { lookX: -1 }], [boom, 'wow', { lookX: -1 }],
        [L(19, 6.8), 'worried'], [L(20, .4), 'calm', { lookX: 1, lookY: -.6 }], [L(21, .6), 'excited', { lookX: 1 }], [L(21, 5.3), 'laugh']]);
      if (t > L(17, 2.4) && t < L(17, 4.2)) o = { ...o, armF: { at: [3.2, -3.0 + .2 * Math.sin(t * 12)] } };
      const catchK = t > L(18, 2.8) && t < splash;
      if (catchK) o = { ...o, armF: { at: [1.6, -4.4] }, armB: { at: [-.6, -4.2] } };
      if (t > L(18, 6.6) && t < L(19, .8)) o = { ...o, armF: { at: [2.4, -3.6] } };
      const duck = on(t, L(19, 6.8), L(19, 9.0), .15, .4); if (duck > .02) o = { ...o, sq: (o.sq || 0) + .35 * duck, armF: { at: [.4, -4.6] }, armB: { at: [-.4, -4.6] }, armsFront: true };
      const feeding = t > L(21, .9) && t < gs2 + .2; if (feeding) o = { ...o, armF: { at: [3.4, -3.2 - .8 * Math.max(0, Math.sin((t - L(21, .9)) * 4))] } };
      const px = feeding || (t > L(17, 2.0) && t < L(17, 4.4)) ? P[0] + 120 : P[0];
      pipT(px, P[1], u, { ...o, key: 'd1pip' }, BLOND, blond);
      if (catchK) { const h = handPt(px, P[1], u, o); h2o2(h[0] - 30, h[1] - 10, 1.3, .3, 'd1held'); }
      if (t > splash && t < splash + .6) { const hd = headOf(px, P[1], u, o); K.burst(hd[0], hd[1] + 50, 110, seg(t, splash, splash + .5), PAL.cream, 'd1spl'); for (let j = 0; j < 6; j++) { const k = seg(t, splash, splash + .6), a = j / 6 * TAU; water(hd[0] + Math.cos(a) * 90 * k, hd[1] + 40 + Math.sin(a) * 60 * k, .8 * (1 - k), 'd1spw' + j); } }
      if (t > L(18, 6.6) && t < L(19, .8)) { const h = handPt(px, P[1], u, o); handMirror(h[0], h[1], 1.1, -.2, 'd1mir'); }
      if (t > splash + .3 && t < splash + 1.3) K.sparkle(px + 10, P[1] - 6.2 * u, 30, seg(t, splash + .3, splash + 1.1), '#FFF3B0');
    } else {
      // L22: the boxing ring. Left: GPx with sulfur; right: with selenium. Pip referees.
      boilSeed('d1rg'); paint(rectPts(260, 820 + 300 * (1 - ring_), 1400, 70), { wash: '#C9A27A', ink: PAL.ink, sw: 1.2 });
      for (const sd of [-1, 1]) paint(rectPts(960 + sd * 700 - 12, 420 + 300 * (1 - ring_), 24, 420), { wash: '#B9B4AE', ink: PAL.ink, sw: 1 });
      for (let i = 0; i < 3; i++) inkLine([[260, 520 + i * 80 + 300 * (1 - ring_)], [1660, 520 + i * 80 + 300 * (1 - ring_)]], 4, i % 2 ? PAL.cream : '#D2413F', 'ink', 0);
      const slow = seg(t, L(22, 2.9), L(22, 7.2)), barrage = L(22, 9.9), ko = L(22, 10.6), knock = L(22, 13.0);
      const burnt = ease(seg(t, barrage + .4, ko)), fallS = easeIn(seg(t, ko, ko + .4));
      const hits = [barrage + .3, barrage + .9, barrage + 1.5], bob = hits.reduce((a, h) => a + (t > h ? -.5 * Math.exp(-4 * (t - h)) * Math.cos((t - h) * 9) : 0), 0);
      const swing = t > knock - .4 ? .9 * Math.sin(seg(t, knock - .4, knock + .3) * Math.PI) : 0;
      const yR = 760 + 300 * (1 - ring_);
      gpx(620, yR, 1.15, 'd1bs', { sul: 1, burnt, ox: burnt, rot: -.25 * fallS, flat: fallS, gloves: [.5 + .8 * Math.sin(slow * Math.PI), .4 + .3 * Math.sin(t * 3)] });
      gpx(1300, yR, 1.15, 'd1bse', { rot: bob * .6 - swing * .6, gloves: [.4 + .3 * Math.sin(t * 3 + 1) + swing * 1.4, .6 + .3 * Math.sin(t * 4)] });
      if (slow > 0 && slow < 1) for (let i = 0; i < 3; i++) inkLine([[520 - i * 14, yR - 140 + i * 30], [480 - i * 14, yR - 150 + i * 30]], 1.2, PAL.ink, 'inkfine', 0);
      for (let i = 0; i < 8; i++) { const a = barrage + i * .18, k = seg(t, a, a + .5); if (k > 0 && k < 1) { const tgt = i % 2 ? [620, yR - 60] : [1300, yR - 60]; const p = arcPt([960 + (i % 3 - 1) * 200, -100], tgt, 60, easeIn(k)); h2o2(p[0], p[1], 2.0, k * 6, 'd1bar' + i); }
        if (k >= 1 && t < a + .8) K.burst(i % 2 ? 620 : 1300, yR - 60, 70, seg(t, a + .5, a + .8), Z.h2o2Dk, 'd1hit' + i); }
      for (let i = 0; i < 3; i++) { const k = frac(t * .7 + i / 3); if (burnt > .3) puff(560 + 40 * i, yR - 100 - 120 * k, 14 + 22 * k, (1 - k) * burnt, 'd1sm' + i, '#7E7884'); }
      // Pip the referee (a bow tie): counts the sulfur one out, gets knocked out by the selenium one's backswing
      const P = [960, yR + 10], down = seg(t, knock, knock + .5);
      let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(22, 2.9), 'confused', { lookX: -1 }], [barrage, 'wow'], [ko, 'smug', { lookX: -1 }], [knock, 'dizzy']]);
      if (t > ko + .3 && t < knock - .2) { const n = Math.min(3, 1 + Math.floor((t - ko - .3) / .5)); o = { ...o, armF: [1.2, 2.8], armB: [-.6, 1.6] }; }
      if (down > 0) o = { ...o, rot: 1.3 * easeIn(down), sq: .1 };
      pip(P[0], P[1], u, { ...o, flip: t < knock - .3, key: 'd1ref' });
      const hd = headOf(P[0], P[1], u, o); boilSeed('d1bow'); paint([[hd[0] - 22, hd[1] + 112], [hd[0], hd[1] + 120], [hd[0] - 22, hd[1] + 128]], { wash: PAL.ink, ink: null }); paint([[hd[0] + 22, hd[1] + 112], [hd[0], hd[1] + 120], [hd[0] + 22, hd[1] + 128]], { wash: PAL.ink, ink: null });
      if (t > knock && t < knock + .4) K.burst(P[0] + 40, P[1] - 4 * u, 80, seg(t, knock, knock + .4), PAL.cream, 'd1ko');
      if (t > knock + .4) stars(P[0] + 80, P[1] - 60, 50, t, 'd1dz');
      if (t > ko + .3 && t < knock - .2) { const h = handPt(P[0], P[1], u, { ...o, flip: true }), n = Math.min(3, 1 + Math.floor((t - ko - .3) / .5)); for (let i = 0; i < n; i++) inkLine([[h[0] - 10 + i * 9, h[1] - 6], [h[0] - 10 + i * 9, h[1] - 30]], 3, PAL.ink, 'ink', 0); }
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#8CC7B0', '#B8E0D0']);
    streaks(whip, 'd1wp', true, '#A8CFC0');
  }

  // ================================ E1 · the membrane catches like matches; GPx4 the extinguisher (L23 – L26) ================================
  const MEMY = 620, LS = 2.4, LSTEP = 44, NL = 52, LX0 = -170;
  const lipX = i => LX0 + i * LSTEP;
  function igOf(i, top) {                                           // when lipid i (top or bottom leaflet) catches fire
    const c = 25, d = Math.abs(i - c);
    let a = top && d <= 6 ? L(23, 7.4 + d * .45) : 1e9;
    if (top && d > 6 && d <= 12) a = L(24, .8 + (d - 6) * .3);
    if (!top && [28, 31, 34].includes(i)) a = L(24, 3.2 + (i - 28) * .2);
    if (!top && d <= 10 && ![28, 31, 34].includes(i)) a = L(24, 1.4 + d * .25);
    return a;
  }
  const quOf = (i) => L(24, 10.9) + clamp((lipX(i) - 300) / 1400) * 2.2;      // the foam sweeps left to right
  const reOf = (i) => L(25, 2.4) + Math.abs(i - 25) * .035;                  // and the fire roars back over everything
  function shotE1(t, lt, dur) {
    K.setT(t);
    const arrive = 1 - easeOut(seg(lt, 0, .45)), cellView = t > L(25, 4.7);
    const embers = clamp(ease(seg(t, L(24, .6), L(24, 3.0))) * .5 * (1 - ease(seg(t, L(24, 10.9), L(24, 12.5)))) + ease(seg(t, L(25, 2.4), L(25, 3.6))));
    if (!cellView) {
      const c = kf(t, [[L(23, -1), [960, 560, 1.0]], [L(23, 3.0), [960, 600, 1.35]], [L(24, 9.0), [960, 600, 1.35]], [L(24, 10.6), [980, 580, 1.15]]], ease);
      camBegin(c[0] + 5 * wob(t, .05), c[1] - 1200 * arrive + 4 * wob(t, .04), c[2]);
      boilSeed('e1out'); paint(rectPts(-600, -800, W + 1200, MEMY + 800), { wash: mixCol('#DCEFF0', '#B0583A', embers * .85), ink: null });
      boilSeed('e1in'); paint(rectPts(-600, MEMY, W + 1200, 1600), { wash: mixCol('#F6DCC8', '#8E4430', embers * .85), ink: null });
      K.motes(t, 14, mixCol('#C9DCD8', '#FFB070', embers), { key: 'e1m' });
      // the bilayer, lipid by lipid: two leaflets, tails meeting in the middle
      const d = 28.5 * LS + 4;
      for (const top of [true, false]) for (let i = 0; i < NL; i++) {
        const x = lipX(i) + (top ? 0 : LSTEP / 2), ig = igOf(i, top), qu = quOf(i), re = reOf(i);
        const burning = (t > ig && t < qu) || t > re, quenched = t > qu && t < re;
        boilSeed('e1l' + (top ? 't' : 'b') + i);
        K.lipid(x, top ? MEMY - d : MEMY + d, top ? Math.PI / 2 : -Math.PI / 2, LS, 'phos', { hl: 0 });
        if (burning) flame(x, (top ? MEMY - d + 60 : MEMY + d - 30), 26 + 6 * Math.sin(t * 7 + i), t, 'e1f' + (top ? 't' : 'b') + i);
        if (quenched) { const q = popK(seg(t, qu, qu + .3)); if (q > .05) { bead(x + 18, top ? MEMY - d + 40 : MEMY + d - 40, 10 * q, Z.o, Z.oDk, 'e1oh' + top + i); bead(x + 30, top ? MEMY - d + 30 : MEMY + d - 50, 6 * q, PAL.cream, '#D9CBB0', 'e1hh' + top + i); } }
      }
      // foam from the extinguisher
      for (let i = 0; i < 10; i++) { const a = L(24, 10.9) + i * .22, k = seg(t, a, a + .9); if (k > 0 && t < L(25, 1.6)) puff(lerp(1000, 300 + i * 150, easeOut(k)), MEMY - 20 + 30 * Math.sin(i), 30 + 30 * k, 1 - .5 * k, 'e1foam' + i, '#F6F1E4'); }
      // the iron bead: rolls in (L24), Pip kicks it, it ricochets
      const kick = L(24, 2.9);
      if (t > L(24, .2) && t < L(24, 5.0)) { const B = [[-100, MEMY + 10], [720, MEMY + 10], [1300, MEMY + 120], [1600, MEMY - 60], [2200, MEMY - 200]], k = t < kick ? seg(t, L(24, .2), kick) : 1 + seg(t, kick, L(24, 4.6)) * 3;
        const i = Math.min(3, Math.floor(k)), q = k - i; feIon(lerp(B[i][0], B[i + 1][0], q), lerp(B[i][1], B[i + 1][1], q), 30, 2, 'e1fe'); }
      // Pip: stomps a flame (its foot catches), kicks the iron, sprays the GPx4 extinguisher, then the WHOOSH
      const whoosh = L(25, 3.0), soot = ease(seg(t, whoosh, whoosh + .3));
      const P = [kf(t, [[0, 1100], [L(23, 9.6), 1100], [L(24, 1.8), 760], [L(24, 3.2), 760], [L(24, 9.6), 1040]], ease), MEMY - d - 4];
      let o = K.act(t, [[0, 'calm', { lookY: .5 }], [L(23, 7.4), 'wow', { lookY: .6 }], [L(23, 10.2), 'angry', { lookY: .7 }], [L(23, 10.9), 'wow', { take: 1.3 }],
        [L(24, 2.2), 'angry', { lookX: -1 }], [L(24, 4.2), 'worried', { lookX: 1 }], [L(24, 10.6), 'determined' === 0 ? 'calm' : 'smug'], [L(25, .6), 'worried'], [whoosh, 'wow', { take: 1.5 }], [whoosh + 1.2, 'dizzy']]);
      const stomp = on(t, L(23, 10.2), L(23, 10.6), .1, .1), hop = t > L(23, 10.6) && t < L(24, 1.4);
      if (stomp > .02) o = { ...o, dy: (o.dy || 0) - .6 * stomp };
      if (hop) o = { ...o, dy: (o.dy || 0) - .8 * Math.abs(Math.sin((t - L(23, 10.6)) * 7)), armF: [1.2, 2.6], armB: [1.0, 2.6] };
      const kk = on(t, kick - .4, kick + .3, .3, .2); if (kk > .02) o = { ...o, rot: .25 * kk, armF: [.8, 2.4] };
      const spray = t > L(24, 10.4) && t < L(25, 2.0); if (spray) o = { ...o, armF: { at: [2.2, -2.2] }, armB: { at: [1.6, -2.0] }, armsFront: true, rot: -.05 * Math.sin(t * 20) };
      const flip = t > L(24, 1.8) && t < L(24, 3.6);
      pipT(P[0], P[1], 34, { ...o, flip, noShadow: true, key: 'e1pip' }, soot > 0 ? SOOT : BLOND, soot > 0 ? soot : 1);
      if (hop) flame(P[0] + 12, P[1] - 6, 18, t, 'e1foot');
      if (spray) { const h = handPt(P[0], P[1], 34, o); const sputter = t > L(25, .4); gpx(h[0] + 40, h[1] + 10, .55, 'e1ext', { hose: 1 }); if (!sputter) for (let i = 0; i < 3; i++) puff(h[0] + 210 + 60 * i, h[1] + 10 + 10 * Math.sin(t * 9 + i), 18 + 8 * i, 1, 'e1sp' + i, '#F6F1E4');
        for (let i = 0; i < 4; i++) { const out = sputter ? 1 : 0; gsh(h[0] - 60 + 34 * i, h[1] + 70, .55, 'e1belt' + i); if (out) { boilSeed('e1x' + i); paint(ellPts(h[0] - 60 + 34 * i, h[1] + 70, 12, 12, 10), { wash: '#B9B4AE', ink: PAL.ink, sw: .6 }); } } }
      if (t > whoosh && t < whoosh + .5) K.burst(P[0], P[1] - 3 * 34, 160, seg(t, whoosh, whoosh + .5), '#F28C2E', 'e1wh');
      if (soot > .5) for (let i = 0; i < 3; i++) { const k = frac(t * .8 + i / 3); puff(P[0] + (i - 1) * 24, P[1] - 6.6 * 34 - k * 80, 12 + 16 * k, 1 - k, 'e1sm' + i, '#8E8790'); }
      if (t > whoosh + 1.4 && t < whoosh + 2.6) { const k = seg(t, whoosh + 1.4, whoosh + 2.6), m = mouthOf(P[0], P[1], 34, o); boilSeed('e1ring'); paint(ellPts(m[0] + 40 + 120 * k, m[1] - 60 * k, 16 + 20 * k, 10 + 12 * k, 14), { fill: '#6E6870', fillOp: 180 * (1 - k), bleed: .1, ink: null }); }
      camEnd();
    } else {
      // the whole cell: it crumbles in the fire (L25 +5.0); an iron glow over the ashes for 铁死亡 (+11.8)
      camBegin(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
      K.wash('#5E2A1E', t, { key: 'e1c', blob: '#7A3A28', n: 4 });
      const CC = [980, 470], cr = ease(seg(t, L(25, 5.0), L(25, 7.0)));
      if (cr < .95) K.cell(CC[0], CC[1], 220, mixCol('#F2B49A', '#8E6A60', cr), mixCol('#DE8E74', '#6E4A40', cr), t, { key: 'e1cell', mood: cr > .1 ? 'sad' : 'wow', sq: .05 * Math.sin(t * 9) * (1 - cr) });
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; if (cr < .9) flame(CC[0] + Math.cos(a) * 225, CC[1] + Math.sin(a) * 225 + 20, 30, t, 'e1cf' + i); }
      if (cr > .3) for (let i = 0; i < 16; i++) { const a = hash(i + 70) * TAU, dd = 220 * (.2 + .8 * hash(i + 71)) * (1 + cr * .6); boilSeed('e1cr' + i); paint(ellPts(CC[0] + Math.cos(a) * dd, CC[1] + Math.sin(a) * dd + 160 * cr * cr * hash(i), 20 * (1 - .5 * cr), 14 * (1 - .5 * cr), 8, 2), { wash: '#6E4A40', ink: PAL.ink, sw: .7 }); }
      const feK = popK(seg(t, L(25, 11.6), L(25, 12.2))); if (feK > .05) { glow(CC[0], CC[1] - 40, 220, '#FF8A50', .8 * feK); feIon(CC[0], CC[1] - 40, 44 * feK, 2, 'e1fe2'); }
      let o = K.act(t, [[0, 'dizzy'], [L(25, 6.4), 'sad', { lookX: 1, lookY: -.4 }], [L(25, 12.0), 'wow', { lookX: 1, lookY: -.6 }], [L(25, 13.2), 'calm', { lookX: 0 }]]);
      if (t > L(25, 13.0)) o = { ...o, blink: frac((t - L(25, 13.0)) / .7) < .2 ? 1 : 0 };
      pipT(560, 900, 34, { ...o, key: 'e1pipc' }, SOOT, 1);
      for (let i = 0; i < 3; i++) { const k = frac(t * .8 + i / 3); puff(560 + (i - 1) * 24, 900 - 6.6 * 34 - k * 80, 12 + 16 * k, 1 - k, 'e1sm2' + i, '#8E8790'); }
      camEnd();
      flash(1 - seg(t, L(25, 4.7), L(25, 5.1)), PAL.cream);
    }
    streaks(arrive, 'e1wp', true, '#A8CFC0');
    flash(seg(t, L(26, -.7), L(26, -.25)), PAL.cream);
  }

  // ================================ E2 · the mice whose GPx4 had sulfur (gentle), and the light turned green (L26 – L29) ================================
  function mouse(x, y, s, t, key, o = {}) {                         // a small mouse, side view, facing right, dot eye
    boilSeed('ms' + key);
    const lie = o.lie || 0, run = o.run || 0, bob = run ? 4 * s * Math.abs(Math.sin(t * 10)) : 0;
    const T = []; for (let i = 0; i <= 6; i++) T.push([x - 90 * s - i * 20 * s, y - 20 * s + i * 3 * s - Math.sin(t * 3 + i * .7) * (2 + i * 2) * s * (1 - lie)]);
    paint(ribbon(through(T, 4), 7 * s, 2 * s), { wash: '#E9A9B4', ink: PAL.ink, sw: .7 });
    paint(ellPts(x, y - 46 * s * (1 - .35 * lie) - bob, 100 * s, 48 * s * (1 - .3 * lie), 22), { wash: '#D9D2CC', fill: '#B9B0AA', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1 });
    const hx = x + 92 * s, hy = y - 56 * s * (1 - .45 * lie) - bob;
    paint([[hx + 60 * s, hy + 14 * s], [hx + 20 * s, hy - 28 * s], [hx - 30 * s, hy - 30 * s], [hx - 34 * s, hy + 26 * s], [hx + 10 * s, hy + 30 * s]], { wash: '#D9D2CC', ink: PAL.ink, sw: 1.1, curv: .5 });
    paint(ellPts(hx - 14 * s, hy - 36 * s, 20 * s, 24 * s, 14), { wash: '#D9D2CC', ink: PAL.ink, sw: 1 }); paint(ellPts(hx - 14 * s, hy - 34 * s, 11 * s, 14 * s, 10), { wash: '#E9A9B4', ink: null });
    paint(ellPts(hx + 60 * s, hy + 12 * s, 6 * s, 5 * s, 8), { wash: '#E9A9B4', ink: PAL.ink, sw: .6 });
    if (o.sleep) inkLine([[hx + 6 * s, hy - 4 * s], [hx + 20 * s, hy - 4 * s]], 1.2, PAL.ink, 'ink', 0); else paint(ellPts(hx + 12 * s, hy - 6 * s, 4.5 * s, 5 * s, 8), { wash: PAL.ink, ink: null });
  }
  function shotE2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.05);
    const dim = .35 * ease(seg(t, L(27, 9.4), L(27, 10.6))) * (1 - ease(seg(t, L(28, -.2), L(28, .6))));
    K.wash(mixCol('#E6DDF0', '#A79BB8', dim), t, { key: 'e2', blob: '#F0EAF6', n: 4 });
    // the nest and the pup: grows and runs (L27 +0.5), lies still under a blanket (+9.6)
    const grow = ease(seg(t, L(27, .4), L(27, 2.4))), lie = ease(seg(t, L(27, 9.2), L(27, 10.2)));
    boilSeed('e2lt'); paint(ellPts(640, 760, 520, 260, 30, 6), { fill: '#FFF6E2', fillOp: 160, bleed: .25, tex: .3, ink: null });
    boilSeed('e2nest'); paint(ellPts(620, 810, 330, 60, 26, 4), { wash: '#D9BE86', fill: '#B8995E', fillOp: 50, tex: .6, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 16; i++) inkLine([[340 + 36 * i, 800 + 12 * Math.sin(i)], [372 + 36 * i, 776 + 14 * Math.cos(i * 1.7)]], 2.4, '#A8884E', 'ink', .5);
    const runX = t > L(27, .8) && t < L(27, 6.0) ? 140 * Math.sin((t - L(27, .8)) * 1.2) : 0;
    if (t < L(28, -.4)) mouse(560 + runX * (1 - lie), 800, lerp(1.0, 1.55, grow), t, 'e2m', { run: t > L(27, .8) && t < L(27, 6.0) ? 1 : 0, lie, sleep: lie > .5 });
    if (lie > .05 && t < L(28, -.4)) { boilSeed('e2bl'); paint([[380, 810], [860, 810], [830, 700 - 20 * lie], [400, 706 - 20 * lie]], { wash: '#B9C7E6', washOp: 255 * lie, ink: PAL.ink, sw: .9 * lie, curv: .4 }); }
    // inset 1 (L26 +4.2): GPx4's selenium swapped for sulfur
    inset(1300, 420, 230, on(t, L(26, 4.0), L(27, 2.8), .3, .4), 'e2i1', () => {
      const swap = ease(seg(t, L(26, 6.6), L(26, 7.2)));
      gpx(1320, 470, 1.2, 'e2gx', { noBead: 1 });
      const p = [1320 + GPXPOCKET[0] * 1.2, 470 + GPXPOCKET[1] * 1.2 - 7];
      if (swap < 1) seBead(p[0] - 160 * swap, p[1] - 120 * swap, 28, 'e2se'); if (swap > 0) sBead(p[0] + 160 * (1 - swap), p[1] - 120 * (1 - swap), 26, 'e2s');
      if (t > L(26, 7.2) && t < L(26, 7.6)) K.burst(p[0], p[1], 50, seg(t, L(26, 7.2), L(26, 7.6)), PAL.ink, 'e2click');
    });
    // inset 2 (L27 +3.1): a row of small "brake" neurons, dimming one by one
    inset(1300, 420, 230, on(t, L(27, 3.0), L(28, -.4), .3, .4), 'e2i2', () => {
      for (let i = 0; i < 4; i++) { const x = 1150 + i * 100, y = 380, dimK = ease(seg(t, L(27, 4.4 + i * .5), L(27, 5.0 + i * .5)));
        boilSeed('e2n' + i); const col = mixCol('#8FB8E8', '#BDB6C4', dimK);
        if (dimK < .5) glow(x, y, 70, '#9ED0FF', .5 * (1 - dimK * 2));
        inkLine([[x, y - 28], [x - 14, y - 90], [x - 30, y - 120]], 3.4, col, 'ink', .5); inkLine([[x, y - 28], [x + 16, y - 100]], 3, col, 'ink', .5); inkLine([[x, y + 28], [x + 6, y + 120]], 3.4, col, 'ink', .5);
        paint(ellPts(x, y, 30, 32, 14), { wash: col, ink: PAL.ink, sw: 1 });
        paint([[x - 26, y + 124], [x + 26, y + 124], [x + 20, y + 150], [x - 20, y + 150]], { wash: mixCol('#D2413F', '#9C9497', dimK), ink: PAL.ink, sw: .9, curv: .3 }); }
    });
    // L28: Pip, still sooty, flips the red light green; the ruby bead goes back into GPx4
    if (t > L(28, -.4)) {
      const in_ = ease(seg(t, L(28, -.4), L(28, 1.6))), flip_ = ease(seg(t, L(28, 3.4), L(28, 3.9)));
      stopLight(1180, 860, 1.3, flip_, 'e2sl');
      const P = [lerp(500, 1000, in_), 860];
      let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(28, 2.8), 'calm', { lookX: 1, lookY: -.9 }], [L(28, 4.2), 'happy', { lookX: -.3 }], [L(28, 6.6), 'calm', { lookX: .6, lookY: -.6 }]]);
      if (t > L(28, 2.8) && t < L(28, 4.1)) o = { ...o, armF: [1.1, 3.4] };
      if (t > L(28, 7.4)) o = { ...o, dy: (o.dy || 0) + .15 * Math.max(0, Math.sin((t - L(28, 7.4)) * 6)) * on(t, L(28, 7.4), L(28, 9.0), .1, .3) };
      pipT(P[0], P[1], 34, { ...o, walk: in_ > 0 && in_ < 1 ? t * 2.4 : 0, key: 'e2pip' }, SOOT, 1);
      inset(620, 380, 170, on(t, L(28, 6.0), L(29, -1.0), .3, .3), 'e2i3', () => { gpx(640, 420, .9, 'e2gx2', { glowK: .6 * pulseK(t, L(28, 6.8), 1.2) }); });
    }
    camEnd();
    flash(1 - seg(lt, 0, .45), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#A38BC8', '#D2C4EA']);
  }


  // ---------- thyroid, hormones, lanterns ----------
  function iodine(x, y, r, key) { bead(x, y, r, Z.iod, Z.iodDk, 'io' + key); }
  // thyroxine: two rings joined by an O; the outer ring's top iodine is the one the deiodinase takes (pull: 0..1 gone)
  function t4(x, y, s, key, o = {}) {
    boilSeed('t4' + key);
    if (o.glowK > .02) glow(x, y, 200 * s, '#FFB070', o.glowK);
    const hex = (cx, cy) => { const P = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; P.push([cx + Math.cos(a) * 46 * s, cy + Math.sin(a) * 46 * s]); } return P; };
    inkLine([[x - 150 * s, y], [x - 190 * s, y - 20 * s], [x - 230 * s, y + 10 * s]], 3, PAL.ink, 'ink', .3);
    bead(x - 236 * s, y + 12 * s, 14 * s, '#F3E6CC', '#D8C8A6', key + 'aa');
    for (const cx of [-80, 80]) { paint(hex(x + cx * s, y), { wash: '#F6EAD2', ink: PAL.ink, sw: 1.3 }); paint(ellPts(x + cx * s, y, 22 * s, 22 * s, 14), { wash: '#F6EAD2', ink: PAL.ink, sw: .8 }); }
    inkLine([[x - 34 * s, y], [x + 34 * s, y]], 3, PAL.ink, 'ink', 0);
    oBead(x, y, 15 * s, key + 'ox');
    iodine(x - 80 * s, y - 62 * s, 19 * s, key + 'a'); iodine(x - 80 * s, y + 62 * s, 19 * s, key + 'b'); iodine(x + 80 * s, y + 62 * s, 19 * s, key + 'c');
    if ((o.pull || 0) < 1) iodine(x + 80 * s + (o.yank || 0) * 20 * s, y - 62 * s - (o.yank || 0) * 14 * s, 19 * s, key + 'd');
    return [x + 80 * s, y - 62 * s];
  }
  function thyroid(x, y, s, key, o = {}) {                          // a pink butterfly with the isthmus, ruby specks inside
    boilSeed('th' + key);
    if (o.glowK > .02) glow(x, y, 220 * s, '#FF7A8A', o.glowK);
    for (const sd of [-1, 1]) paint(ellPts(x + sd * 70 * s, y, 70 * s, 110 * s, 22, 2, sd * -.25), { wash: '#E79AAE', fill: '#C9708A', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(x - 40 * s, y + 10 * s, 80 * s, 34 * s, 14 * s), { wash: '#E79AAE', ink: PAL.ink, sw: 1 });
    for (let i = 0; i < (o.n ?? 16); i++) { const sd = i % 2 ? 1 : -1; seBead(x + sd * (50 + 40 * hash(i + 5)) * s, y + (hash(i + 6) - .5) * 160 * s, 7 * s, key + 's' + i); }
  }
  function organ(kind, x, y, s, key, n) {                           // a few organs as plain silhouettes, with n ruby specks
    boilSeed('og' + key);
    if (kind === 'liver') paint([[x - 90 * s, y - 20 * s], [x + 20 * s, y - 60 * s], [x + 90 * s, y - 40 * s], [x + 70 * s, y + 30 * s], [x - 60 * s, y + 40 * s]], { wash: '#B8644E', fill: '#8E4434', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.1, curv: .5 });
    else if (kind === 'kidney') { paint(ellPts(x, y, 46 * s, 64 * s, 20), { wash: '#C46A5C', ink: PAL.ink, sw: 1.1 }); paint(ellPts(x + 30 * s, y, 14 * s, 22 * s, 12), { wash: Z.wall, ink: PAL.ink, sw: .8 }); }
    else if (kind === 'heart') paint(heartPts(x, y, 60 * s), { wash: '#D86A6A', ink: PAL.ink, sw: 1.1 });
    else if (kind === 'muscle') paint(ellPts(x, y, 90 * s, 40 * s, 20, 0, .3), { wash: '#D98C8C', ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < n; i++) seBead(x + (hash(i + 30) - .5) * 70 * s, y + (hash(i + 31) - .5) * 50 * s, 7 * s, key + 's' + i);
  }
  function crown(x, y, s, key) { boilSeed('cr' + key); paint([[x - 40 * s, y], [x - 46 * s, y - 50 * s], [x - 20 * s, y - 24 * s], [x, y - 58 * s], [x + 20 * s, y - 24 * s], [x + 46 * s, y - 50 * s], [x + 40 * s, y]], { wash: '#F2C14A', ink: PAL.ink, sw: 1.1 }); seBead(x, y - 14 * s, 8 * s, key + 'j'); }
  function pliersAt(h, g, open, key) {                              // pliers from a hand h to their jaws at g; the jaws carry the ruby Se (the deiodinase)
    const dx = g[0] - h[0], dy = g[1] - h[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, pv = [lerp(h[0], g[0], .62), lerp(h[1], g[1], .62)];
    boilSeed('pa' + key);
    for (const sd of [-1, 1]) { inkLine([[h[0] + nx * sd * 12, h[1] + ny * sd * 12], pv], 8, '#8E96A6', 'ink', 0); inkLine([pv, [g[0] + nx * sd * (5 + 12 * open), g[1] + ny * sd * (5 + 12 * open)]], 6, '#8E96A6', 'ink', 0); }
    paint(ellPts(pv[0], pv[1], 7, 7, 10), { wash: '#5E6676', ink: PAL.ink, sw: .8 });
    seBead(g[0] - dx / d * 6, g[1] - dy / d * 6, 8, key + 'se');
  }
  function pliers(x, y, s, ang, open, key) {                        // pliers = the deiodinase: its jaws carry the ruby Se
    boilSeed('pl' + key); push(); translate(x, y); rotate(ang); scale(s);
    for (const sd of [-1, 1]) { inkLine([[0, 0], [-60, sd * 14]], 9, '#8E96A6', 'ink', 0); inkLine([[0, 0], [44, sd * (6 + 10 * open)]], 7, '#8E96A6', 'ink', 0); }
    paint(ellPts(0, 0, 8, 8, 10), { wash: '#5E6676', ink: PAL.ink, sw: .8 });
    pop();
    const tip = [x + Math.cos(ang) * 50 * s, y + Math.sin(ang) * 50 * s];
    seBead(tip[0], tip[1], 9 * s, key + 'se');
    return tip;
  }
  function bodyStove(x, y, s, t, k, key) {                          // a paper-doll body with a little stove in its belly; k: how hard it burns
    boilSeed('bs' + key);
    paint(ellPts(x, y - 260 * s, 70 * s, 74 * s, 20), { wash: '#EFE4D2', ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x - 100 * s, y - 180 * s, 200 * s, 300 * s, 60 * s), { wash: '#EFE4D2', ink: PAL.ink, sw: 1.1 });
    for (const sd of [-1, 1]) { paint(ribbon([[x + sd * 90 * s, y - 150 * s], [x + sd * 140 * s, y + 40 * s]], 40 * s, 32 * s), { wash: '#EFE4D2', ink: PAL.ink, sw: 1 }); paint(ribbon([[x + sd * 50 * s, y + 110 * s], [x + sd * 56 * s, y + 300 * s]], 50 * s, 44 * s), { wash: '#EFE4D2', ink: PAL.ink, sw: 1 }); }
    paint(rrPts(x - 46 * s, y - 40 * s, 92 * s, 90 * s, 10 * s), { wash: '#4B4250', ink: PAL.ink, sw: 1 });
    paint(rrPts(x - 28 * s, y - 14 * s, 56 * s, 40 * s, 6 * s), { wash: mixCol('#6E3A30', '#F28C2E', k), ink: PAL.ink, sw: .8 });
    if (k > .1) flame(x, y + 10 * s, (18 + 26 * k) * s, t, key + 'fl');
    if (k > .5) for (let i = 0; i < 3; i++) { const q = frac(t * 1.5 + i / 3); boilSeed('hw' + key + i); inkLine([[x - 40 * s + i * 40 * s, y - 60 * s - 40 * q * s], [x - 34 * s + i * 40 * s, y - 80 * s - 40 * q * s], [x - 40 * s + i * 40 * s, y - 100 * s - 40 * q * s]], 1.6, '#F28C2E', 'ink', .6); }
  }
  function lantern(x, y, r, key, glowK = .6) {                      // a red paper lantern = one selenocysteine of SELENOP
    if (r < 3) return;
    glow(x, y, r * 3, '#FF5A4A', glowK);
    boilSeed('ln' + key);
    paint(ellPts(x, y, r, r * .82, 18), { wash: '#D94040', fill: '#A8282E', fillOp: 40, tex: .3, ink: PAL.ink, sw: 1 });
    for (const sd of [-1, 0, 1]) inkLine([[x + sd * r * .45, y - r * .78], [x + sd * r * .55, y], [x + sd * r * .45, y + r * .78]], .8, '#8E1F2A', 'inkfine', .6);
    for (const sd of [-1, 1]) paint(rrPts(x - r * .45, y + sd * r * .82 - r * .14, r * .9, r * .28, 3), { wash: '#F2C14A', ink: PAL.ink, sw: .7 });
  }
  function rbc(x, y, r, key) { boilSeed('rb' + key); paint(ellPts(x, y, r, r * .8, 16), { wash: '#D9585C', ink: PAL.ink, sw: .9 }); paint(ellPts(x, y, r * .45, r * .32, 12), { wash: '#C2464C', ink: null }); }

  // ================================ F1 · the thyroid: crowned, T4 → T3 by pliers, the H₂O₂ bath (L29 – L32) ================================
  function shotF1(t, lt, dur) {
    K.setT(t);
    const st = t < L(30, -.8) ? 0 : t < L(31, -.6) ? 1 : 2;
    camBegin(960 + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.05);
    K.wash('#E6DCF0', t, { key: 'f1', blob: '#F2ECF8', n: 4 });
    K.motes(t, 10, '#CFC2E2', { key: 'f1m' });
    const u = 32;
    if (st === 0) {
      // L29: a row of organs with a few ruby specks; the thyroid has the most, and Pip crowns it
      const glowK = .6 * pulseK(t, L(29, 3.6), 1.4);
      const row = [['liver', 360], ['kidney', 640], ['heart', 1280], ['muscle', 1560]];
      row.forEach(([k, x], i) => { const q = popK(seg(t, L(29, .4 + i * .2), L(29, .8 + i * .2))); if (q > .05) organ(k, x, 600, q, 'f1o' + i, 3); });
      const tq = popK(seg(t, L(29, .2), L(29, .7))); if (tq > .05) thyroid(960, 560, tq, 'f1th', { glowK, n: 22 });
      const cr = seg(t, L(29, 6.0), L(29, 6.8));
      if (cr > 0) { const p = cr < 1 ? arcPt([1180, 760], [960, 420], 120, ease(cr)) : [960, 420 + 6 * spring(t, L(29, 6.8), 5, 18)]; crown(p[0], p[1], 1.2, 'f1cr'); }
      let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(29, 3.6), 'wow', { lookX: -1 }], [L(29, 5.6), 'smug', { lookX: -1, lookY: -.6 }], [L(29, 7.0), 'happy']]);
      if (cr > 0 && cr < 1) o = { ...o, armF: [1.2, 3.4] };
      pip(1180 - 60 * ease(seg(t, L(29, 5.2), L(29, 6.0))), 860, u, { ...o, flip: true, key: 'f1pip' });
    } else if (st === 1) {
      // L30: T4; Pip the dentist yanks the outer iodine with the deiodinase pliers, flies into the wall; T3 fires the body's stove
      const yank = L(30, 7.4), gone = t > yank, strain = on(t, L(30, 5.2), yank, .3, .05);
      const T4 = [820, 520], t3 = seg(t, L(30, 8.4), L(30, 9.4));
      const pos = t3 > 0 ? arcPt(T4, [380, 640], 160, ease(t3)) : T4, sz = lerp(1.4, .4, ease(t3));
      if (t3 < 1) { const tip = t4(pos[0], pos[1], sz, 'f1t4', { pull: gone ? 1 : 0, yank: strain * (.5 + .5 * Math.sin(t * 30)) * .4, glowK: gone ? .5 : 0 }); }
      bodyStove(330, 640, .8, t, ease(seg(t, L(30, 9.2), L(30, 9.9))), 'f1bd');
      boilSeed('f1wall'); paint(rectPts(1640, -200, 600, 1500), { wash: '#C9B9D8', fill: '#A894BC', fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.3 });
      for (let i = 0; i < 8; i++) inkLine([[1640, 120 * i], [2200, 120 * i]], .8, '#A894BC', 'inkfine', 0);
      const fly = seg(t, yank, yank + .45), crash = yank + .45;
      const grip = [T4[0] + 80 * 1.4, T4[1] - 62 * 1.4];
      let P = [lerp(1260, 1060, ease(seg(t, L(30, 4.0), L(30, 5.0)))), lerp(860, 580, ease(seg(t, L(30, 4.0), L(30, 5.0)))) + 6 * Math.sin(t * 2.1)];
      if (fly > 0) P = [lerp(1060, 1560, easeOut(fly)), lerp(580, 860, easeIn(fly)) - 120 * Math.sin(fly * Math.PI)];
      if (t > crash) P = [1560, 860];
      const slide = t > crash ? ease(seg(t, crash + .3, crash + 1.1)) : 0;
      let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(30, 4.6), 'smug', { lookX: -1 }], [L(30, 5.4), 'strain', { lookX: -1 }], [yank, 'wow'], [crash, 'dizzy'], [L(30, 9.8), 'worried', { lookX: -1, emote: 'sweat' }]]);
      if (t > L(30, 4.6) && t < yank) o = { ...o, armF: { at: [(P[0] - grip[0] - 70) / u, (grip[1] + 30 - P[1]) / u] }, armB: { at: [(P[0] - grip[0] - 90) / u, (grip[1] + 44 - P[1]) / u] }, rot: .12 * strain };
      if (fly > 0 && fly < 1) o = { ...o, rot: .6 * fly, armF: [1.2, 2.6], armB: [1.0, 2.6] };
      if (t > crash) o = { ...o, sq: .35 * (1 - slide) + (o.sq || 0), dy: (o.dy || 0) - 3 * (1 - slide) };
      pip(P[0], P[1], u, { ...o, flip: true, key: 'f1pip2' });
      if (t > L(30, 4.6) && t < yank) { const h = handPt(P[0], P[1], u, { ...o, flip: true }); pliersAt(h, [grip[0] + 14 + strain * 8 * Math.sin(t * 30), grip[1] - 6], 1 - strain, 'f1pl'); }
      if (gone && t < yank + .9) { const k = seg(t, yank, yank + .9); iodine(lerp(grip[0], 1100, k), grip[1] - 200 * Math.sin(k * Math.PI), 19 * 1.4, 'f1off'); }
      if (t > crash && t < crash + .4) K.burst(1640, 760, 120, seg(t, crash, crash + .4), PAL.ink, 'f1crash');
      if (t > crash) stars(P[0], P[1] - 5.4 * u, 50, t, 'f1dz');
      if (t > L(30, 9.8)) for (let i = 0; i < 3; i++) { const q = frac(t * 1.2 + i / 3); boilSeed('f1hw' + i); inkLine([[1300 + i * 40, 700 - 60 * q], [1310 + i * 40, 680 - 60 * q], [1300 + i * 40, 660 - 60 * q]], 2, '#F28C2E', 'ink', .6); }
    } else {
      // L31: the thyroid's bath of H₂O₂ with iodine clipped on; Pip's leaf dips in and bleaches again; GPx rubber ducks
      const tub = [960, 700];
      boilSeed('f1tub'); paint([[tub[0] - 420, tub[1] - 120], [tub[0] + 420, tub[1] - 120], [tub[0] + 380, tub[1] + 140], [tub[0] - 380, tub[1] + 140]], { wash: '#E79AAE', fill: '#C9708A', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.4, curv: .3 });
      for (const sd of [-1, 1]) paint(ellPts(tub[0] + sd * 320, tub[1] + 170, 30, 22, 12), { wash: '#C9708A', ink: PAL.ink, sw: 1 });
      paint(ellPts(tub[0], tub[1] - 120, 420, 40, 26), { wash: '#D9C6EE', ink: PAL.ink, sw: 1.1 });
      for (let i = 0; i < 9; i++) { const ph = frac(t * .5 + i * .13); h2o2(tub[0] - 340 + i * 85, tub[1] - 130 - 40 * Math.sin(ph * Math.PI), 1.2, t + i, 'f1hb' + i); }
      for (let i = 0; i < 4; i++) { const a = L(31, 2.0 + i * .6), k = seg(t, a, a + .6); if (k > 0) { const p = k < 1 ? arcPt([tub[0] - 300 + i * 180, 200], [tub[0] - 250 + i * 160, tub[1] - 140], 60, ease(k)) : [tub[0] - 250 + i * 160, tub[1] - 140 + 6 * Math.sin(t * 2 + i)]; iodine(p[0], p[1], 16, 'f1ii' + i); } }
      for (let i = 0; i < 3; i++) { const q = popK(seg(t, L(31, 7.4 + i * .25), L(31, 7.8 + i * .25))); if (q > .05) gpx(tub[0] - 200 + i * 200, tub[1] - 150 + 8 * Math.sin(t * 2.4 + i), .45 * q, 'f1duck' + i); }
      const dip = L(31, 5.3), bl = ease(seg(t, dip + .2, dip + .5));
      const lean = on(t, dip - .5, dip + .8, .4, .4);
      let o = K.act(t, [[0, 'calm', { lookX: -1, lookY: .5 }], [L(31, 2.2), 'happy', { lookX: -1, lookY: .6 }], [dip, 'calm', { lookY: .8 }], [dip + .5, 'wow', { take: 1.3 }], [dip + 1.5, 'angry', { lookY: -.9 }]]);
      o = { ...o, rot: -.9 * lean, leaf: lean > .1 ? 1.2 : (o.leaf || 0) };
      pipT(1460, 590, u, { ...o, flip: true, key: 'f1pip3' }, BLOND, bl);
      if (t > dip && t < dip + .5) K.burst(1350, 600, 60, seg(t, dip, dip + .5), PAL.cream, 'f1splash');
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#A38BC8', '#D2C4EA']);
  }

  // ================================ F2 · thioredoxin reductase: the tetherball tail (L32 – L33) ================================
  function shotF2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.05);
    K.wash('#E6DCF0', t, { key: 'f2', blob: '#F2ECF8', n: 4 });
    K.motes(t, 10, '#CFC2E2', { key: 'f2m' });
    // TrxR: two lobes on the left; its tail whips round. Swings pass at Pip's head at +5.0 and +6.0, then low at +8.4.
    const E = [640, 560], q = popK(seg(t, L(32, .6), L(32, 1.2)));
    const swings = [L(32, 5.0), L(32, 6.0), L(32, 8.4)];
    let ang = -1.0 + .3 * Math.sin(t * 2);
    if (t > L(32, 4.2)) ang = -1.2 + (t - L(32, 4.2)) * 3.0 * (t < L(32, 9.0) ? 1 : 0) + (t >= L(32, 9.0) ? (L(32, 9.0) - L(32, 4.2)) * 3.0 + .5 * Math.sin(t * 2) : 0);
    const reach = 520 * q, tip = [E[0] + 120 + Math.cos(ang) * reach, E[1] + Math.sin(ang) * reach * .45];
    if (q > .05) {
      boilSeed('f2tr');
      const tail = []; for (let i = 0; i <= 10; i++) { const k = i / 10; tail.push([lerp(E[0] + 120, tip[0], k) + Math.sin(k * 6 + t * 4) * 20 * (1 - k), lerp(E[1], tip[1], k) + 30 * Math.sin(k * Math.PI) ]); }
      paint(ribbon(tail, 18, 8), { wash: '#F0C07A', ink: PAL.ink, sw: 1, curv: .4 });
      for (const sd of [-1, 1]) paint(ellPts(E[0] + sd * 60 * q, E[1], 90 * q, 110 * q, 22, 2, sd * .2), { wash: '#F0C07A', fill: '#C99A50', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2 });
      seBead(tip[0], tip[1], 22, 'f2tip', { glowK: .4 });
    }
    // thioredoxin: its S–S pair pops open when the tail touches it (+9.0); it goes off to smooth a dented protein (+10.4)
    const touch = L(32, 9.0), go = ease(seg(t, L(32, 9.6), L(32, 10.6)));
    const TX = [lerp(1000, 1500, go), 300 + 20 * Math.sin(t * 2)], open = ease(seg(t, touch, touch + .3));
    blob(TX[0], TX[1], 50, 40, '#A9C9EE', 'f2tx');
    sBead(TX[0] - 14 - 10 * open, TX[1] - 10, 12, 'f2s1'); sBead(TX[0] + 14 + 10 * open, TX[1] - 10, 12, 'f2s2');
    const dent = 1 - ease(seg(t, L(32, 10.6), L(32, 11.2)));
    boilSeed('f2pr'); const D = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = 80 - 40 * dent * Math.exp(-Math.pow((a - 1.6) / .4, 2)); D.push([1620 + Math.cos(a) * r, 380 + Math.sin(a) * r * .8]); }
    paint(D, { wash: '#E7B7D3', ink: PAL.ink, sw: 1.1, curv: .4 });
    if (dent < .5 && t < L(32, 12.2)) K.sparkle(1620, 380, 50, seg(t, L(32, 11.0), L(32, 11.8)), PAL.cream);
    // Pip: ducks twice, thwacked on the third swing
    const P = [1180, 860], thwack = swings[2];
    let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(32, 4.4), 'wow', { lookX: -1 }], [L(32, 6.6), 'smug', { lookX: -1 }], [thwack, 'dizzy']]);
    const duck = Math.max(on(t, swings[0] - .25, swings[0] + .25, .1, .15), on(t, swings[1] - .25, swings[1] + .25, .1, .15));
    if (duck > .02) o = { ...o, sq: (o.sq || 0) + .4 * duck };
    const spin = seg(t, thwack, thwack + .7);
    if (spin > 0) o = { ...o, rot: spin < 1 ? spin * TAU : 0 };
    pip(P[0] + 120 * easeOut(spin), P[1], 34, { ...o, flip: true, key: 'f2pip' });
    if (t > thwack && t < thwack + .4) K.burst(P[0], P[1] - 120, 90, seg(t, thwack, thwack + .4), PAL.ink, 'f2th');
    if (spin >= 1) stars(P[0] + 120, P[1] - 5.4 * 34, 48, t, 'f2dz');
    camEnd();
    flash(1 - seg(lt, 0, .3), PAL.cream);
    const wp = easeIn(seg(t, L(33, -1.0), L(33, -.6))); streaks(wp, 'f2wp', false, '#B9A8D0');
  }

  // ================================ F3 · SELENOP: the lantern dragon to the brain's gate (L33 – L35) ================================
  function shotF3(t, lt, dur) {
    K.setT(t);
    const arrive = 1 - easeOut(seg(lt, 0, .45));
    const c = kf(t, [[L(33, -1), [700, 560, 1.0]], [L(33, 5.6), [700, 560, 1.0]], [L(34, .8), [1180, 560, 1.0]]], ease);
    camBegin(c[0] - 1400 * arrive + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash('#5C2234', t, { key: 'f3', blob: '#7A3448', n: 4 });
    boilSeed('f3v'); paint(rectPts(-600, 420, 3200, 360), { wash: '#B8475A', fill: '#8E2F42', fillOp: 40, tex: .4, ink: null });
    inkLine([[-600, 420], [2600, 420]], 1.6, '#3E1220', 'ink', 0); inkLine([[-600, 780], [2600, 780]], 1.6, '#3E1220', 'ink', 0);
    for (let i = 0; i < 7; i++) rbc(frac(hash(i + 90) + t * .03) * 2600 - 400, 470 + 270 * hash(i + 91), 34, 'f3rb' + i);
    // the liver (left) makes SELENOP: a protein head pulling ten lanterns; Pip leads it like a dragon dance
    boilSeed('f3lv'); paint([[-200, 380], [80, 300], [240, 360], [220, 470], [-160, 500]], { wash: '#B8644E', fill: '#8E4434', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.3, curv: .5 });
    const out = seg(t, L(33, 3.6), L(33, 10.4)), headX = lerp(200, 1420, ease(out)) + (t > L(34, 4.2) ? 0 : 0);
    const grab = L(34, 4.2), taken = t > grab;
    const pts = []; for (let i = 0; i <= 10; i++) pts.push([headX - i * 92 * Math.min(1, out * 4 + .1), 600 + 60 * Math.sin(t * 3 - i * .7)]);
    if (out > 0 && !taken) {
      for (let i = 10; i >= 1; i--) { if (pts[i][0] < 180) continue; lantern(pts[i][0], pts[i][1], 34, 'f3l' + i, .5); inkLine([pts[i - 1], pts[i]], 1.5, '#F2C14A', 'ink', .3); }
      blob(pts[0][0], pts[0][1], 56, 44, '#F2A6B4', 'f3hd');
    }
    // the brain's gate (right): the claw takes the whole string; the gate slams on Pip
    const G = [1640, 600];
    boilSeed('f3br'); paint(ellPts(G[0] + 250, G[1] - 40, 230, 190, 26, 6), { wash: '#F2B8C4', fill: '#D98C9C', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.3 });
    for (let i = 0; i < 4; i++) inkLine([[G[0] + 120 + i * 60, G[1] - 180], [G[0] + 150 + i * 60, G[1] - 40], [G[0] + 120 + i * 60, G[1] + 100]], 1, '#C9788A', 'ink', .6);
    const slam = ease(seg(t, grab + .2, grab + .45));
    const gy = lerp(250, 610, easeIn(slam)) + 14 * spring(t, grab + .45, 6, 22);   // a portcullis: raised, then slammed down
    boilSeed('f3gt'); paint(rectPts(G[0] - 60, gy - 360, 120, 24), { wash: '#6E7686', ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 4; i++) { boilSeed('f3gb' + i); paint(rectPts(G[0] - 52 + i * 32, gy - 340, 12, 340), { wash: '#8C93A3', ink: PAL.ink, sw: .9 }); paint([[G[0] - 52 + i * 32, gy], [G[0] - 40 + i * 32, gy], [G[0] - 46 + i * 32, gy + 20]], { wash: '#8C93A3', ink: PAL.ink, sw: .8 }); }
    for (let j = 0; j < 3; j++) { boilSeed('f3gh' + j); paint(rectPts(G[0] - 60, gy - 290 + j * 100, 120, 12), { wash: '#6E7686', ink: PAL.ink, sw: .8 }); }
    const claw = popK(seg(t, L(34, .8), L(34, 1.3)));
    if (claw > .05) { boilSeed('f3cl'); for (const sd of [-1, 1]) paint(ribbon([[G[0] - 20, G[1] + sd * 20], [G[0] - 60 * claw, G[1] + sd * 50 * claw], [G[0] - 90 * claw, G[1] + sd * (taken ? 10 : 30) * claw]], 16, 8), { wash: '#C9B4E4', ink: PAL.ink, sw: 1, curv: .5 }); }
    if (taken) for (let i = 0; i < 10; i++) { const k = ease(seg(t, grab, grab + .5)); lantern(lerp(pts[i + 1][0], G[0] + 180 + (i % 4) * 50, k), lerp(pts[i + 1][1], G[1] - 80 + Math.floor(i / 4) * 60, k), 26, 'f3in' + i, .4); }
    // Pip: the dragon dancer, holding the head on a pole; flattened by the gate
    const smash = grab + .45, flat = t > smash ? 1 - ease(seg(t, smash + 1.0, smash + 2.4)) : 0;
    const P = taken ? [G[0] - 20, 760] : [headX + 70, 760];
    let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(33, 5.4), 'excited'], [L(34, .8), 'wow', { lookX: 1 }], [smash, 'dizzy'], [L(34, 7.0), 'calm', { lookX: 1, lookY: -.5 }]]);
    if (out > .1 && !taken) o = { ...o, armF: { at: [-.6, -4.6] }, armB: { at: [.4, -4.4] }, walk: t * 3, dy: (o.dy || 0) - .15 * Math.abs(Math.sin(t * 6)) };
    if (flat > 0) o = { ...o, sq: .55 * flat, armF: [-.3, 2], armB: [-.3, 2] };
    if (out > .05) pip(P[0], P[1], 34, { ...o, flip: false, key: 'f3pip' });
    if (out > .1 && !taken) { const h = handPt(P[0], P[1], 34, o); inkLine([[h[0], h[1]], [pts[0][0], pts[0][1] + 40]], 4, '#9A7A52', 'ink', 0); }
    if (t > smash && t < smash + .4) K.burst(G[0] - 40, 760, 110, seg(t, smash, smash + .4), PAL.cream, 'f3clang');
    if (flat > .3) stars(P[0], P[1] - 70, 46, t, 'f3dz');
    // a small inset: the testis gate does the same, and when selenium runs short these two are the last to dim
    inset(560, 260, 150, on(t, L(34, 5.4), L(35, -.6), .3, .3), 'f3ts', () => {
      boilSeed('f3tso'); paint(ellPts(560, 280, 80, 56, 20), { wash: '#F2D2C2', ink: PAL.ink, sw: 1 });
      for (let i = 0; i < 4; i++) lantern(500 + i * 40, 280 + 8 * Math.sin(t * 3 + i), 14, 'f3tl' + i, .3);
    });
    camEnd();
    streaks(arrive, 'f3wp', false, '#C9788A');
    flash(seg(t, L(35, -.6), L(35, -.2)), PAL.cream);
  }

  // ================================ F4 · the queue: three beads, who gets one; GPx1's mRNA is shredded (L35 – L36) ================================
  function shotF4(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.05);
    K.wash('#F5EEDD', t, { key: 'f4', blob: '#FBF6EA', n: 4 });
    const Q = [[560, '#8FD0B4', 'gpx4'], [820, '#F0C07A', 'trxr'], [1080, '#B9E4D2', 'gpx1'], [1340, '#C9B8E8', 'dio']];
    const fill = [L(35, 3.6), L(35, 5.3)], shred = seg(t, L(35, 7.8), L(35, 9.6));
    Q.forEach(([x, col, k], i) => {
      if (i === 2 && shred > .2) return;
      blob(x, 520 + 6 * Math.sin(t * 2 + i), 100, 80, col, 'f4q' + i, 0, true);
      if (k === 'trxr') { boilSeed('f4tl'); paint(ribbon([[x + 80, 520], [x + 140, 470], [x + 170, 500]], 12, 6), { wash: col, ink: PAL.ink, sw: .9, curv: .5 }); }
      const slot = [x - 30, 470]; boilSeed('f4sl' + i); paint(ellPts(slot[0], slot[1], 22, 16, 14), { wash: mixCol(col, PAL.ink, .35), ink: PAL.ink, sw: .8 });
      if (i < 2 && t > fill[i] + .5) seBead(slot[0], slot[1] - 4, 18, 'f4in' + i, { glowK: .4 * pulseK(t, fill[i] + .5, .8) });
    });
    // the shredder; GPx1's mRNA goes in, spaghetti comes out
    const SH = [1320, 840];
    boilSeed('f4sh'); paint(rrPts(SH[0] - 110, SH[1] - 40, 220, 110, 14), { wash: '#8C93A3', fill: '#616878', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2 });
    for (let i = 0; i < 6; i++) paint([[SH[0] - 90 + i * 34, SH[1] - 40], [SH[0] - 74 + i * 34, SH[1] - 58], [SH[0] - 58 + i * 34, SH[1] - 40]], { wash: '#C9CED6', ink: PAL.ink, sw: .7 });
    if (shred > 0) { const len = 300 * (1 - shred); if (len > 10) { boilSeed('f4mr'); paint(ribbon([[SH[0], SH[1] - 40 - len], [SH[0], SH[1] - 40]], 12, 12), { wash: '#FBF2DF', ink: PAL.ink, sw: 1 }); for (let j = 0; j < len / 26; j++) paint(rrPts(SH[0] + 6, SH[1] - 40 - len + j * 26, 20, 10, 3), { wash: Object.values(BASEC)[j % 4], ink: PAL.ink, sw: .6 }); }
      for (let j = 0; j < 6; j++) { const q = clamp(shred * 1.4 - j * .08); if (q <= 0) continue; boilSeed('f4sp' + j); const P = []; for (let i = 0; i <= 8; i++) P.push([SH[0] - 60 + j * 24 + 10 * Math.sin(i * 1.4 + j), SH[1] + 70 + i * 12 * q]); inkLine(P, 4, '#F3E6CC', 'ink', .6); } }
    // Pip juggles the three beads, posts two, keeps one; winces at the shredder
    const P = [940, 880];
    let o = K.act(t, [[0, 'strain', { lookY: -.8 }], [L(35, 3.4), 'calm', { lookX: -1, lookY: -.6 }], [L(35, 6.6), 'smug'], [L(35, 7.9), 'worried', { lookX: 1 }]]);
    const jug = t < L(35, 3.4);
    if (jug) o = { ...o, armF: [1.0 + .4 * Math.sin(t * 9), 2.4], armB: [1.0 + .4 * Math.sin(t * 9 + Math.PI), 2.4] };
    pip(P[0], P[1], 34, { ...o, key: 'f4pip' });
    const hd = headOf(P[0], P[1], 34, o);
    for (let i = 0; i < 3; i++) {
      let p; if (jug) { const a = t * 6 + i * TAU / 3; p = [hd[0] + Math.cos(a) * 90, hd[1] - 60 + Math.sin(a) * 50]; }
      else if (i < 2) { const k = seg(t, fill[i], fill[i] + .5); if (k >= 1) continue; p = arcPt([hd[0], hd[1] - 60], [Q[i][0] - 30, 466], 160, ease(k)); if (t < fill[i]) p = [hd[0] + (i ? 60 : -60), hd[1] - 30]; }
      else { const h = handPt(P[0], P[1], 34, o); p = [h[0], h[1] - 20]; }
      seBead(p[0], p[1], 18, 'f4j' + i);
    }
    camEnd();
    flash(1 - seg(lt, 0, .4), PAL.cream);
  }

  // ================================ R1 · RECAP 1 (cream board, no Pip) (L36 – L37) ================================
  function shotR1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 4 * wob(t, .04), 540 + 3 * wob(t, .03), 1.0);
    K.wash('#F5EEDD', t, { key: 'r1', blob: '#FBF6EA', n: 4 });
    K.motes(t, 8, '#E2D6BC', { key: 'r1m' });
    // the tumbler in the middle: an O lands on it (+14.6), it tips and rights itself (+15.2)
    const ox = ease(seg(t, L(36, 14.5), L(36, 14.8))) * (1 - ease(seg(t, L(36, 15.3), L(36, 15.6))));
    const tip = t > L(36, 14.6) ? .9 * Math.sin(seg(t, L(36, 14.6), L(36, 15.2)) * Math.PI) * Math.exp(-2 * Math.max(0, t - L(36, 15.2))) - .3 * spring(t, L(36, 15.2), 3, 10) : 0;
    const q0 = popK(seg(t, L(36, .3), L(36, .8)));
    if (q0 > .05) tumbler(960, 700, 1.3 * q0, tip, 'se', 'r1tb', { ox });
    const ic = [[[560, 330], 1.2, 'chain'], [[1360, 330], 4.9, 'h2o2'], [[460, 700], 6.3, 'membrane'], [[1460, 700], 7.6, 't4'], [[960, 230], 9.7, 'repair']];
    ic.forEach(([[x, y], a, k], i) => {
      const q = popK(seg(t, L(36, a), L(36, a + .45))); if (q < .05) return;
      const wig = .06 * Math.sin((t - L(36, 11.5)) * 10) * on(t, L(36, 11.5), L(36, 13.0), .2, .3);
      push(); translate(x, y); rotate(wig); scale(q); translate(-x, -y);
      boilSeed('r1c' + i); paint(ellPts(x, y, 120, 100, 26, 3), { wash: '#FFFDF6', ink: PAL.ink, sw: 1.1 });
      if (k === 'chain') { for (let j = 0; j < 5; j++) aa(x - 80 + j * 34, y + 10 * Math.sin(j), 15, j, 'r1a' + j); seBead(x + 90, y, 18, 'r1as'); }
      if (k === 'h2o2') { const sp = ease(seg(t, L(36, a + .5), L(36, a + 1.2))); if (sp < 1) h2o2(x - 20, y, 1.3, 0, 'r1h'); else { water(x - 40, y, 1.1, 'r1w1'); water(x + 10, y + 4, 1.1, 'r1w2'); } seBead(x + 70, y - 20, 14, 'r1hs'); }
      if (k === 'membrane') { for (let j = 0; j < 6; j++) { bead(x - 75 + j * 30, y - 24, 9, K.C.phos, mixCol(K.C.phos, PAL.ink, .3), 'r1mt' + j); bead(x - 75 + j * 30, y + 24, 9, K.C.phos, mixCol(K.C.phos, PAL.ink, .3), 'r1mb' + j); }
        if (t < L(36, a + 1.0)) flame(x, y + 4, 22, t, 'r1fl'); else { puff(x, y - 10, 30, 1, 'r1sm', '#E8E2D8'); } }
      if (k === 't4') { t4(x, y, .6, 'r1t4', { pull: t > L(36, a + .9) ? 1 : 0 }); if (t > L(36, a + .9)) iodine(x + 70, y - 90 - 20 * seg(t, L(36, a + .9), L(36, a + 1.6)), 11, 'r1io'); }
      if (k === 'repair') { const dn = 1 - ease(seg(t, L(36, a + .6), L(36, a + 1.2))); boilSeed('r1rp'); const D = []; for (let j = 0; j < 22; j++) { const aa_ = j / 22 * TAU, r = 60 - 30 * dn * Math.exp(-Math.pow((aa_ - 1.6) / .45, 2)); D.push([x + Math.cos(aa_) * r, y + Math.sin(aa_) * r * .8]); } paint(D, { wash: '#E7B7D3', ink: PAL.ink, sw: 1, curv: .4 }); seBead(x - 70, y - 40, 12, 'r1rs'); }
      pop();
      if (t > L(36, 15.2) && t < L(36, 16.2)) K.sparkle(x + 80, y - 70, 30, seg(t, L(36, 15.2) + i * .06, L(36, 16.0) + i * .06), '#F2C14A');
    });
    camEnd();
    flash(1 - seg(lt, 0, .4), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#9A7A52', '#C9A86A']);
  }


  // ---------- soil, plants, the map ----------
  // selenium in disguise: half painted sulfur-yellow, with joke glasses and a moustache (it passes for sulfur)
  function disguise(x, y, r, k, key) {
    if (k <= .05) { seBead(x, y, r, key); return; }
    seBead(x, y, r, key);
    boilSeed('dg' + key);
    const P = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * .5 + i / 12 * Math.PI; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    paint(P, { wash: Z.sul, washOp: 255 * k, ink: null });
    for (const sd of [-1, 1]) paint(ellPts(x + sd * r * .38, y - r * .15, r * .26 * k, r * .22 * k, 10), { wash: '#F6F1E4', ink: PAL.ink, sw: .7 });
    inkLine([[x - r * .12, y - r * .15], [x + r * .12, y - r * .15]], .9, PAL.ink, 'ink', 0);
    paint([[x - r * .5, y + r * .3], [x, y + r * .18], [x + r * .5, y + r * .3], [x + r * .3, y + r * .42], [x, y + r * .32], [x - r * .3, y + r * .42]], { wash: '#3B3342', washOp: 255 * k, ink: null, curv: .4 });
  }
  function soil(x0, x1, y, key, rich, t, o = {}) {                   // a soil cutaway with yellow S and (rich 0..1) ruby Se specks
    boilSeed('so' + key); paint(rectPts(x0, y, x1 - x0, 700), { wash: '#8A6448', fill: '#6A4A34', fillOp: 45, bleed: .01, tex: .6, ink: null });
    inkLine([[x0, y], [x1, y]], 1.4, '#5A3E2A', 'ink', .3);
    for (let i = 0; i < 18; i++) { const x = x0 + (x1 - x0) * hash(i + 3), yy = y + 40 + 260 * hash(i + 4); sBead(x, yy, 9, key + 's' + i); }
    const n = Math.round(22 * rich); for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * hash(i + 60), yy = y + 40 + 260 * hash(i + 61); if (o.skip && o.skip(i)) continue; (o.disguised ? disguise : seBead)(x, yy, 10, o.disguised || 0, key + 'e' + i); }
  }
  function plant(x, y, s, t, key, specks = 0, sway = 0) {          // a leafy crop with roots; specks: ruby dots in its leaves
    boilSeed('pl' + key);
    const a = .05 * Math.sin(t * 1.3 + x * .01) + sway;
    for (let i = 0; i < 5; i++) inkLine([[x, y], [x + (i - 2) * 26 * s, y + 70 * s + 20 * hash(i) * s], [x + (i - 2) * 40 * s, y + 130 * s]], 1.4, '#C9B48A', 'ink', .6);
    const top = [x + Math.sin(a) * 220 * s, y - 220 * s];
    paint(ribbon([[x, y], [lerp(x, top[0], .5), y - 110 * s], top], 9 * s, 5 * s), { wash: '#7BAF62', ink: PAL.ink, sw: .9, curv: .5 });
    for (let i = 0; i < 5; i++) { const q = .25 + i * .15, p = [lerp(x, top[0], q), lerp(y, top[1], q)], sd = i % 2 ? 1 : -1;
      paint(ellPts(p[0] + sd * 40 * s, p[1] - 10 * s, 46 * s, 16 * s, 14, 1, sd * -.5 + a), { wash: '#8DBF5E', fill: '#5E8C3E', fillOp: 40, tex: .4, ink: PAL.ink, sw: .8 }); }
    for (let i = 0; i < specks; i++) { const q = .25 + (i % 5) * .15, sd = i % 2 ? 1 : -1, p = [lerp(x, top[0], q) + sd * (30 + 14 * hash(i)) * s, lerp(y, top[1], q) - 12 * s]; seBead(p[0], p[1], 6 * s, key + 'sp' + i); }
    return top;
  }
  // China's outline, simplified (lon, lat), and the low-selenium belt from Heilongjiang to Yunnan
  const CHINA = [[135, 48.5], [131, 42.9], [125, 40], [122, 40.5], [119, 39.2], [118, 38.2], [120.7, 37.5], [122.5, 37], [119.5, 35], [121.5, 32], [122, 30], [120, 27], [119, 25.5],
    [116.5, 23], [113.5, 22.2], [110, 21], [108, 21.5], [106.7, 22.8], [103.5, 22.6], [101.5, 21.2], [98.5, 24], [97.5, 28.2], [95, 29], [92, 27.8], [89, 28], [85, 28.3], [81, 30],
    [79, 32.5], [78.5, 35.5], [75.5, 37], [73.5, 39.5], [74.5, 40.5], [80, 42.5], [82.5, 45.2], [82.8, 47.2], [87.5, 49.1], [90.5, 45.5], [96, 42.7], [101, 42.5], [106, 41.8],
    [111, 43.5], [114.5, 44.8], [117.5, 46.5], [119.5, 47.2], [116.7, 49.8], [120, 52.5], [122.5, 53.3], [126, 52.7], [127.5, 50], [130.5, 48.8], [133.5, 48.3]];
  const BELT = [[127, 47.5], [123, 43.5], [116, 39], [110, 34.5], [105.5, 30], [102, 26.5], [100.5, 24.5]];
  function mapPt(lon, lat, cx, cy, s) { return [cx + (lon - 104) * 17 * s, cy - (lat - 36) * 21 * s]; }
  function chinaMap(cx, cy, s, t, key, belt = 1, o = {}) {
    boilSeed('cn' + key);
    const P = CHINA.map(([a, b]) => mapPt(a, b, cx, cy, s));
    paint(P, { wash: '#D9C98E', fill: '#B8A66A', fillOp: 40, tex: .5, ink: PAL.ink, sw: 1.3, curv: .25 });
    for (const [lon, lat, rx] of [[109.7, 19.2, 18], [121, 23.6, 12]]) { const p = mapPt(lon, lat, cx, cy, s); paint(ellPts(p[0], p[1], rx * s, 22 * s, 12), { wash: '#D9C98E', ink: PAL.ink, sw: 1 }); }
    if (o.specks) for (let i = 0; i < 40; i++) { const lon = 80 + 50 * hash(i + 300), lat = 22 + 28 * hash(i + 301), p = mapPt(lon, lat, cx, cy, s);
      const inside = (() => { let c = false; for (let j = 0, k = P.length - 1; j < P.length; k = j++) { if ((P[j][1] > p[1]) !== (P[k][1] > p[1]) && p[0] < (P[k][0] - P[j][0]) * (p[1] - P[j][1]) / (P[k][1] - P[j][1]) + P[j][0]) c = !c; } return c; })();
      if (inside) seBead(p[0], p[1], 6 * s, key + 'sp' + i); }
    if (belt > .02) {
      const B = BELT.map(([a, b]) => mapPt(a, b, cx, cy, s)), n = Math.max(2, Math.round(B.length * clamp(belt) + .49));
      boilSeed('cnb' + key); paint(ribbon(through(B.slice(0, n), 6), 74 * s, 64 * s), { wash: '#F7F3EA', washOp: 215, ink: '#9C8E6A', sw: .8, curv: .4 });
    }
    if (o.dots) BELT.forEach(([a, b], i) => { const q = popK(seg(o.dots, i * .1, i * .1 + .3)); if (q > .05) { const p = mapPt(a, b, cx, cy, s); paint(ellPts(p[0], p[1], 10 * s * q, 10 * s * q, 10), { wash: '#C9708A', ink: PAL.ink, sw: .7 }); } });
  }

  // ================================ G1 · the turn: selenium passes for sulfur; soils; the low-selenium belt (L37 – L40) ================================
  function shotG1(t, lt, dur) {
    K.setT(t);
    const st = t < L(38, -.6) ? 0 : t < L(39, -.5) ? 1 : 2;
    const sky = '#BFD9EC';
    if (st < 2) {
      const gc = st === 0 ? kf(t, [[L(37, -.4), [690, 510, 2.2]], [L(37, 5.6), [690, 510, 2.2]], [L(37, 6.8), [960, 560, 1.15]]], ease) : [960, 560, 1.1];
      camBegin(gc[0] + 5 * wob(t, .05), gc[1] + 4 * wob(t, .04), gc[2]);
      K.wash(sky, t, { key: 'g1', blob: '#DCEBF5', n: 4 });
      if (st === 0) {
        // L37: S and Se side by side; Se puts on its sulfur disguise (+2.0); the root drinks both up a straw (+7.5);
        // Pip's tweezers try to pick out the Se; the root slurps up the tweezers (+12.3)
        const dg = ease(seg(t, L(37, 1.9), L(37, 2.6)));
        soil(-400, 2400, 640, 'g1s', .9, t, { disguised: dg, skip: i => i < 3 });
        const top = plant(900, 640, 1.4, t, 'g1p', Math.floor(seg(t, L(37, 8.0), L(37, 11.5)) * 8));
        const SE = [[600, 500], [760, 500]];
        if (t < L(37, 5.6)) { const q = popK(seg(t, L(37, .2), L(37, .6))); if (q > .05) { sBead(SE[0][0], SE[0][1], 34 * q, 'g1bs'); disguise(SE[1][0], SE[1][1], 36 * q, dg, 'g1bse'); } }
        // the straw and the parade up it
        const straw = ease(seg(t, L(37, 7.2), L(37, 7.8)));
        if (straw > .02) { boilSeed('g1st'); paint(ribbon([[920, 640], [940, 640 + 260 * straw]], 14, 14), { wash: '#F2E2C4', ink: PAL.ink, sw: .9 }); for (let i = 0; i < 4; i++) inkLine([[913, 650 + i * 60 * straw], [947, 660 + i * 60 * straw]], 3, '#D2413F', 'ink', 0); }
        for (let i = 0; i < 8; i++) { const a = L(37, 7.8 + i * .45), k = seg(t, a, a + 1.4); if (k <= 0 || k >= 1) continue; const p = [930, lerp(900, 640, k) - (k > .8 ? 200 * (k - .8) / .2 : 0)]; if (i % 2) disguise(p[0], p[1], 12, 1, 'g1up' + i); else sBead(p[0], p[1], 11, 'g1up' + i); }
        const pluck = L(37, 10.9), slurp = L(37, 12.3), tw = t > pluck && t < slurp + .4;
        let o = K.act(t, [[0, 'calm', { lookX: -1, lookY: -.4 }], [L(37, 2.0), 'wow', { lookX: -1 }], [L(37, 4.0), 'worried', { lookX: -1 }], [L(37, 7.8), 'confused', { lookX: -1, lookY: .5 }], [pluck, 'angry', { lookX: -1, lookY: .4 }], [slurp, 'wow', { take: 1.3 }], [slurp + 1.0, 'confused']]);
        const P = [1180, 640];
        if (tw) o = { ...o, armF: { at: [-3.2, -1.0 + (t > slurp ? 1.6 * seg(t, slurp, slurp + .3) : 0)] }, flip: true };
        else if (t > slurp + .4) o = { ...o, armF: [.6, 3.0], flip: true };
        else o = { ...o, flip: true };
        if (t > L(37, 6.2)) pip(P[0], P[1], 34, { ...o, key: 'g1pip' });   // off stage during the close-up on the disguise
        if (tw) { const h = handPt(P[0], P[1], 34, o); boilSeed('g1tw'); const tip = [h[0] - 120, h[1] + 10 + (t > slurp ? 200 * seg(t, slurp, slurp + .4) : 0)]; for (const sd of [-1, 1]) inkLine([[h[0], h[1]], [tip[0], tip[1] + sd * 6]], 3, '#9AA3AE', 'ink', 0); }
        if (t > slurp && t < slurp + .5) K.burst(940, 660, 60, seg(t, slurp, slurp + .5), PAL.ink, 'g1slurp');
      } else {
        // L38: two soils, poor and rich, with crops to match; Pip's soil auger spins Pip around (+4.3)
        boilSeed('g1mid');
        soil(-400, 960, 680, 'g1a', .12, t); soil(960, 2400, 680, 'g1b', 1, t);
        inkLine([[960, 680], [960, 1200]], 2, '#3E2A1C', 'ink', 0);
        plant(560, 680, 1.0, t, 'g1pa', 1); plant(1360, 680, 1.2, t, 'g1pb', 10);
        const spin = seg(t, L(38, 4.2), L(38, 6.6)), A = [960, 680];
        boilSeed('g1au'); paint(ribbon([[A[0], A[1] - 260], [A[0], A[1] + 140 * ease(seg(t, L(38, 3.6), L(38, 6.0)))]], 14, 10), { wash: '#9AA3AE', ink: PAL.ink, sw: 1 });
        for (let i = 0; i < 5; i++) inkLine([[A[0] - 20, A[1] - 200 + i * 60], [A[0] + 20, A[1] - 170 + i * 60]], 2, '#6E7686', 'ink', 0);
        const ha = spin > 0 && spin < 1 ? spin * 3 * TAU : 0, hl = [A[0] + Math.cos(ha) * 110, A[1] - 260 + Math.sin(ha) * 20];
        inkLine([[A[0] - 110 * Math.cos(ha), A[1] - 260 - Math.sin(ha) * 20], hl], 8, '#9A7A52', 'ink', 0);
        let o = K.act(t, [[0, 'calm', { lookX: 1 }], [L(38, 3.6), 'strain'], [L(38, 4.4), 'dizzy'], [L(38, 7.0), 'dizzy']]);
        const P = spin > 0 && spin < 1 ? [hl[0] + 40, A[1] - 80 + Math.sin(ha) * 30] : [A[0] + 130, 680];
        if (spin > 0 && spin < 1) o = { ...o, armF: { at: [-1.2, -4.6] }, rot: .5 * Math.sin(ha) };
        else if (t > L(38, 3.4) && t < L(38, 4.2)) o = { ...o, armF: { at: [-.4, -5.6] }, armB: { at: [-.8, -5.4] } };
        pip(P[0], P[1], 34, { ...o, flip: true, key: 'g1pip2' });
        if (spin >= 1) stars(P[0], P[1] - 180, 46, t, 'g1dz');
      }
      camEnd();
    } else {
      // L39: the map of China; the pale low-selenium belt washes in from Heilongjiang to Yunnan
      camBegin(960 + 5 * wob(t, .05), 520 + 4 * wob(t, .04), 1.0);
      K.wash('#E9E2CC', t, { key: 'g1m', blob: '#F4EFDF', n: 4 });
      chinaMap(980, 480, 1.0, t, 'g1cn', ease(seg(t, L(39, 1.6), L(39, 5.0))), { specks: 1 });
      let o = K.act(t, [[0, 'calm', { lookX: 1, lookY: -.6 }], [L(39, 2.0), 'wow', { lookX: 1, lookY: -.8 }], [L(39, 5.4), 'sad', { lookX: 1, lookY: -.5 }]]);
      pip(380, 900, 30, { ...o, key: 'g1pip3' });
      camEnd();
    }
    if (lt < .3) brushWipe(.5 + lt / .6, ['#9A7A52', '#C9A86A']);
    flash(seg(t, L(38, -.8), L(38, -.6)) * (1 - seg(t, L(38, -.6), L(38, -.2))), PAL.cream);
    flash(seg(t, L(39, -.8), L(39, -.5)) * (1 - seg(t, L(39, -.5), L(39, -.1))), PAL.cream);
    const out = seg(t, L(40, -1.6), L(40, -.2)); if (out > 0) paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#4E5B76', washOp: 255 * ease(out), ink: null });
  }

  // ================================ H1 · Keshan, winter 1935 (gentle, no Pip); the Mianning crowds (L40 – L44) ================================
  function house(x, y, s, key, lit, heart = 0, t = 0) {
    boilSeed('hs' + key);
    paint(rectPts(x - 90 * s, y - 110 * s, 180 * s, 110 * s), { wash: '#8E8478', fill: '#6E655B', fillOp: 40, tex: .5, ink: PAL.ink, sw: 1 });
    paint([[x - 110 * s, y - 104 * s], [x, y - 180 * s], [x + 110 * s, y - 104 * s]], { wash: '#E9EEF5', ink: PAL.ink, sw: 1 });
    const wc = mixCol('#3E4560', '#F6C76A', lit);
    if (lit > .1) glow(x, y - 60 * s, 70 * s, '#FFC766', .6 * lit);
    paint(rectPts(x - 30 * s, y - 84 * s, 60 * s, 46 * s), { wash: wc, ink: PAL.ink, sw: .8 });
    if (heart > .02) { const beat = 1 + .2 * Math.max(0, Math.sin(t * 7 + Math.sin(t * 3) * 2)); paint(heartPts(x, y - 62 * s, 14 * s * beat), { wash: mixCol('#9C9497', '#E46A7A', heart), ink: PAL.ink, sw: .6 }); }
  }
  function people(x, y, n, cols, sp, key, cases, caseK, tabK) {     // a crowd of little figures; cases: how many rose specks
    for (let i = 0; i < n; i++) { const px = x + (i % cols) * sp, py = y + Math.floor(i / cols) * sp * 1.1; boilSeed('pp' + key + i);
      paint(ellPts(px, py - 22, 12, 12, 12), { wash: '#E9D7C2', ink: PAL.ink, sw: .8 }); paint(ellPts(px, py + 8, 16, 19, 12), { wash: '#B9C7E6', ink: PAL.ink, sw: .8 });
      if (tabK > .05) { const k = clamp(tabK * 1.3 - (i / n) * .3); if (k > 0) seBead(px + 18, py - 30 - 60 * (1 - k), 6, key + 'tb' + i); } }
    const w = (cols - 1) * sp, h = (Math.ceil(n / cols) - 1) * sp * 1.1, m = Math.round(cases * caseK);
    for (let i = 0; i < m; i++) { boilSeed('pc' + key + i); paint(ellPts(x - 14 + (w + 28) * hash(i + 500), y - 34 + (h + 60) * hash(i + 501), 5.5, 5.5, 8), { wash: '#D9506A', ink: PAL.ink, sw: .4 }); }
  }
  function shotH1(t, lt, dur) {
    K.setT(t);
    const st = t < L(42, -.7) ? 0 : 1;
    if (st === 0) {
      camBegin(1000 + 5 * wob(t, .05), 640 + 4 * wob(t, .04), 1.35);
      K.wash('#4E5B76', t, { key: 'h1', blob: '#5E6C86', n: 4 });
      boilSeed('h1gr'); paint(rectPts(-400, 760, W + 800, 700), { wash: '#E4EAF2', fill: '#C9D3E2', fillOp: 40, tex: .4, ink: null });
      inkLine([[-400, 760], [W + 400, 760]], 1.2, '#9AA6BA', 'ink', .4);
      const dimH = ease(seg(t, L(40, 6.8), L(40, 7.8))), out1 = ease(seg(t, L(40, 8.0), L(40, 8.6))), out2 = ease(seg(t, L(40, 8.5), L(40, 9.1)));
      house(420, 770, 1.1, 'h1a', 1 - out1); house(860, 790, 1.3, 'h1b', 1, (1 - dimH) * on(t, L(40, 3.4), 1e9, .4, 0) + .4 * dimH * 0, t); house(1340, 770, 1.1, 'h1c', 1 - out2); house(1720, 780, .9, 'h1d', 1);
      for (let i = 0; i < 60; i++) { const x = frac(hash(i + 7) + t * .01 * (1 + hash(i))) * (W + 200) - 100, y = frac(hash(i + 8) + t * .06 * (.6 + hash(i + 9))) * 1100 - 40; boilSeed('h1sn' + i); paint(ellPts(x, y, 3 + 2 * hash(i), 3 + 2 * hash(i), 6), { wash: '#F4F6FA', ink: null }); }
      // L41: the heart muscle, patches going pale; then the map with dots along the belt
      inset(1380, 420, 190, on(t, L(41, 2.8), L(41, 7.4), .3, .3), 'h1hm', () => {
        boilSeed('h1ht'); paint(heartPts(1380, 440, 140), { wash: '#D86A7A', fill: '#B84A5E', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2 });
        for (let i = 0; i < 6; i++) { const q = ease(seg(t, L(41, 3.3 + i * .25), L(41, 3.8 + i * .25))); if (q > .05) { boilSeed('h1pt' + i); paint(ellPts(1320 + 120 * hash(i + 3), 380 + 120 * hash(i + 4), 24 * q, 18 * q, 10, 2), { wash: '#E8D2D6', ink: null }); } }
      });
      inset(1380, 420, 200, on(t, L(41, 7.6), L(42, -.8), .3, .3), 'h1mp', () => { chinaMap(1390, 420, .34, t, 'h1cn', 1, { dots: seg(t, L(41, 8.0), L(41, 10.6)) }); });
      camEnd();
      flash(1 - seg(lt, 0, .6), '#4E5B76');
    } else {
      // L42–43: spring 1974. The big crowd (36,603 children) with a ruby tablet each; 21 cases. The small crowd (9,430), no tablets; 106 cases.
      camBegin(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
      K.wash('#F3E2C4', t, { key: 'h1s', blob: '#FAF0DC', n: 4 });
      const A = [260, 240], B = [1260, 440];
      people(A[0], A[1], 36, 6, 96, 'h1A', 21, ease(seg(t, L(42, 9.4), L(42, 10.8))), seg(t, L(42, 3.4), L(42, 7.0)));
      if (t > L(43, .1)) people(B[0], B[1], 9, 3, 96, 'h1B', 106, ease(seg(t, L(43, 2.6), L(43, 4.6))), 0);
      camEnd();
      flash(1 - seg(t, L(42, -.7), L(42, -.2)), PAL.cream);
    }
    flash(seg(t, L(44, -.9), L(44, -.4)), '#2E5A5E');
  }

  // ================================ H2 · the virus turns nasty in selenium-poor mice; the green light (L44 – L46) ================================
  function virusC(x, y, r, t, key, bad = 0) {                       // a faceless coxsackievirus: a small icosahedral shell; bad grows red spikes
    if (r < 3) return; boilSeed('vc' + key);
    if (bad > .05) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t; paint(starPts(x + Math.cos(a) * r * 1.05, y + Math.sin(a) * r * 1.05, r * .3 * bad, .4, 4, a), { wash: '#D9506A', ink: PAL.ink, sw: .6 }); }
    const P = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .2; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    paint(P, { wash: mixCol('#C9C2E2', '#E8A0B0', bad), ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 6; i += 2) inkLine([P[i], [x, y], P[(i + 3) % 6]], .7, '#8E86A6', 'inkfine', 0);
  }
  function shotH2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.0);
    K.wash('#2E5A5E', t, { key: 'h2', blob: '#3E6E70', n: 4 });
    K.motes(t, 12, '#4E8284', { key: 'h2m' });
    // two mice: selenium-poor (few ruby specks) on the left, healthy (many) on the right
    const M1 = [560, 820], M2 = [1360, 820];
    mouse(M1[0], M1[1], 1.5, t, 'h2m1', { sleep: t > L(44, 13.5) });
    mouse(M2[0], M2[1], 1.5, t, 'h2m2', { sleep: t > L(45, 4.6) });
    for (let i = 0; i < 2; i++) seBead(M1[0] - 40 + 70 * i, M1[1] - 70, 7, 'h2s1' + i);
    for (let i = 0; i < 8; i++) seBead(M2[0] - 80 + 24 * i, M2[1] - 70 - 14 * Math.sin(i), 7, 'h2s2' + i);
    for (const [M, a] of [[M1, L(44, 13.4)], [M2, L(45, 4.4)]]) { const d = ease(seg(t, a, a + 1)); paint(heartPts(M[0] - 10, M[1] - 50, 16), { wash: mixCol('#E46A7A', '#8E8890', d), ink: PAL.ink, sw: .7 }); }
    // the virus: appears (+6.5), into the poor mouse (+9.5), mutates (+11.7), jumps to the healthy one (L45 +2.4)
    const q = popK(seg(t, L(44, 6.4), L(44, 7.0)));
    let vp = [960, 340], bad = ease(seg(t, L(44, 11.6), L(44, 12.8)));
    if (t > L(44, 9.4)) vp = arcPt([960, 340], [M1[0], M1[1] - 70], 80, ease(seg(t, L(44, 9.4), L(44, 10.8))));
    if (t > L(45, 2.2)) vp = arcPt([M1[0], M1[1] - 70], [M2[0], M2[1] - 70], 260, ease(seg(t, L(45, 2.2), L(45, 3.6))));
    if (q > .05) virusC(vp[0], vp[1], 40 * q, t, 'h2v', bad);
    inset(960, 330, 170, on(t, L(44, 11.4), L(45, .6), .3, .3), 'h2in', () => { virusC(960, 340, 90, t, 'h2vbig', bad); });
    // the traffic light by the virus turns green; Pip the traffic cop flips it back to red, whistling
    const gl = ease(seg(t, L(45, 7.4), L(45, 7.8))) * (1 - ease(seg(t, L(45, 9.6), L(45, 10.0))));
    if (t > L(45, 6.8)) {
      stopLight(1540, 640, 1.0, gl, 'h2sl');
      const P = [1680, 660];
      let o = K.act(t, [[0, 'wow', { lookX: -1 }], [L(45, 8.0), 'angry', { lookX: -1 }], [L(45, 10.0), 'smug', { lookX: -1 }]]);
      if (t > L(45, 8.4) && t < L(45, 10.0)) o = { ...o, armF: [1.0 + .3 * Math.sin(t * 14), 3.2], armB: { at: [.3, -2.5] }, armsFront: true };
      pip(P[0], P[1], 32, { ...o, flip: true, key: 'h2pip' });
      if (t > L(45, 8.0) && t < L(45, 10.6)) { const m = mouthOf(P[0], P[1], 32, { ...o, flip: true }); boilSeed('h2wh'); paint(ellPts(m[0] - 14, m[1], 12, 7, 10), { wash: '#C9CED6', ink: PAL.ink, sw: .7 }); for (let i = 0; i < 3; i++) { const k = frac(t * 3 + i / 3); inkLine([[m[0] - 40 - 30 * k, m[1] - 20 - 20 * k + i * 10], [m[0] - 60 - 30 * k, m[1] - 26 - 20 * k + i * 10]], 2, PAL.cream, 'ink', 0); } }
    }
    camEnd();
    flash(1 - seg(lt, 0, .5), '#2E5A5E');
    const dw = seg(t, L(46, -1.0), L(46, -.2)); if (dw > 0) paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#F2C98E', washOp: 255 * ease(dw), ink: null });
  }

  // ================================ H3 · a warm dawn, selenium salt (L46 – L47) ================================
  function shotH3(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.0);
    K.wash('#F2C98E', t, { key: 'h3', blob: '#FAE3B8', n: 4 });
    glow(1500, 300, 400, '#FFE7A0', .6);
    boilSeed('h3sun'); paint(ellPts(1500, 300, 90, 90, 24), { wash: '#F6D25A', ink: PAL.ink, sw: 1 });
    boilSeed('h3gr'); paint(rectPts(-400, 760, W + 800, 700), { wash: '#C9D89A', fill: '#A8B878', fillOp: 40, tex: .4, ink: null });
    const warm = ease(seg(t, L(46, 3.2), L(46, 5.0)));
    house(420, 770, 1.1, 'h3a', warm); house(860, 790, 1.3, 'h3b', warm); house(1340, 770, 1.1, 'h3c', warm); house(1720, 780, .9, 'h3d', warm);
    for (const [x, y] of [[440, 590], [890, 575], [1360, 590]]) for (let i = 0; i < 3; i++) { const k = frac(t * .5 + i / 3); if (warm > .3) puff(x + 20 * Math.sin(k * 4), y - 160 * k, 16 + 22 * k, (1 - k) * warm, 'h3ch' + x + i, '#F6F1E4'); }
    // the salt shaker sprinkles ruby flecks over the village
    const sh = seg(t, L(46, .6), L(46, 4.0)), S = [lerp(300, 1500, ease(sh)), 330 + 20 * Math.sin(t * 3)];
    if (sh > 0 && sh < 1) { boilSeed('h3ss'); push(); translate(S[0], S[1]); rotate(2.6 + .3 * Math.sin(t * 12)); scale(1.6); paint(rrPts(-30, -50, 60, 100, 14), { wash: '#E9EEF2', washOp: 220, ink: PAL.ink, sw: 1.1 }); paint(rrPts(-32, -66, 64, 22, 8), { wash: '#A9B2BC', ink: PAL.ink, sw: 1 }); pop();
      for (let i = 0; i < 10; i++) { const k = frac(t * 1.4 + i / 10); seBead(S[0] + 40 + 30 * Math.sin(i), S[1] + 60 + 380 * k, 5, 'h3fl' + i); } }
    let o = K.act(t, [[0, 'calm', { lookX: 1, lookY: -.6 }], [L(46, 5.6), 'happy', { lookX: .5 }]]);
    pip(1000, 930, 30, { ...o, key: 'h3pip' });
    camEnd();
    flash(1 - seg(lt, 0, .5), '#F2C98E');
    const whip = easeIn(seg(t, L(47, -1.0), L(47, -.6))); streaks(whip, 'h3wp', false, '#E3B07A');
  }


  // ---------- the horse, the hammer, the hair rope ----------
  // a horse, side view, facing right, dot eye. hoof(i) → 0..1: how far hoof i has flown off. faint: lies down.
  function horse(x, y, s, t, key, o = {}) {
    const fa = o.faint || 0, col = '#B87A4E', dk = '#8E5432';
    boilSeed('hr' + key);
    const cy_ = y - 190 * s; push(); translate(x, cy_ + 70 * s * ease(fa)); rotate(Math.PI * ease(fa)); translate(-x, -cy_);
    const legs = [[-120, 1], [-80, 0], [80, 1], [120, 0]];
    legs.forEach(([lx, back], i) => {
      const bx = x + lx * s, top = y - 150 * s, bot = y - 30 * s - 120 * s * fa * (i % 2);
      paint(ribbon([[bx, top], [bx + 6 * s, lerp(top, bot, .5)], [bx, bot]], 24 * s, 18 * s), { wash: back ? dk : col, ink: PAL.ink, sw: 1 });
      const h = o.hoof ? o.hoof(i) : 0;
      const hp = h > 0 ? arcPt([bx, bot + 14 * s], [bx + (i - 1.5) * 90 * s, bot - 60 * s], 160 * s, Math.min(h, 1)) : [bx, bot + 14 * s];
      if (h < 1 || o.hoofBack) paint(rrPts(hp[0] - 15 * s, hp[1] - 12 * s, 30 * s, 24 * s, 6 * s), { wash: '#3E3238', ink: PAL.ink, sw: .9 });
    });
    paint(ellPts(x, y - 190 * s, 170 * s, 70 * s, 26), { wash: col, fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.2 });
    const graze = o.graze || 0, hx = x + 210 * s, hy = lerp(y - 300 * s, y - 120 * s, graze);
    paint(ribbon([[x + 130 * s, y - 220 * s], [x + 180 * s, lerp(y - 290 * s, y - 180 * s, graze)], [hx, hy]], 60 * s, 40 * s), { wash: col, ink: PAL.ink, sw: 1.1, curv: .5 });
    paint(ellPts(hx + 30 * s, hy + 10 * s, 56 * s, 30 * s, 18, 0, .5 + .6 * graze), { wash: col, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(hx, hy - 30 * s, 10 * s, 18 * s, 10, 0, -.3), { wash: dk, ink: PAL.ink, sw: .8 });
    if (fa > .5) { for (const sd of [-1, 1]) inkLine([[hx + 14 * s + sd * 5 * s, hy - 4 * s - 5 * s], [hx + 14 * s - sd * 5 * s, hy - 4 * s + 5 * s]], 1.2, PAL.ink, 'ink', 0); }
    else paint(ellPts(hx + 14 * s, hy - 4 * s, 5 * s, 5 * s, 8), { wash: PAL.ink, ink: null });
    paint(ribbon([[x + 130 * s, y - 250 * s], [x + 150 * s, y - 210 * s], [x + 190 * s, lerp(y - 280 * s, y - 170 * s, graze)]], 22 * s, 10 * s), { wash: '#4B3A32', ink: null, curv: .5 });
    paint(ribbon([[x - 165 * s, y - 210 * s], [x - 200 * s, y - 150 * s + 10 * Math.sin(t * 2)], [x - 190 * s, y - 90 * s]], 26 * s, 10 * s), { wash: '#4B3A32', ink: PAL.ink, sw: .8, curv: .5 });
    pop();
  }
  function milkvetch(x, y, s, key, xray = 0) {                       // the pale plant that hoards selenium
    boilSeed('mv' + key);
    for (let i = 0; i < 6; i++) { const a = -1.3 + i * .5, tip = [x + Math.cos(a) * 110 * s, y - Math.sin(-a) * 0 - 130 * s + Math.abs(a) * 40 * s];
      inkLine([[x, y], tip], 2, '#8EA06A', 'ink', .5);
      for (let j = 1; j <= 3; j++) { const p = [lerp(x, tip[0], j / 3.5), lerp(y, tip[1], j / 3.5)]; paint(ellPts(p[0], p[1], 14 * s, 7 * s, 8, 0, a), { wash: mixCol('#B9C98E', '#F6EFE0', xray * .5), ink: PAL.ink, sw: .6 }); if (xray > .3) seBead(p[0], p[1], 5 * s, key + 's' + i + j); } }
  }
  function hammer(x, y, s, ang, key) {
    boilSeed('hm' + key); push(); translate(x, y); rotate(ang); scale(s);
    paint(rrPts(-5, -10, 10, 90, 4), { wash: '#B48A5A', ink: PAL.ink, sw: .9 });
    paint(rrPts(-26, -26, 52, 22, 5), { wash: '#8C93A3', ink: PAL.ink, sw: 1 });
    pop();
  }
  // a hair as a twisted keratin rope: yellow sulfur links between the strands; se(i) → disguised Se in link i; snap 0..1
  function keratin(x0, x1, y, key, t, o = {}) {
    const n = 12, snap = o.snap || 0, th = o.th || 1;
    for (const sd of [-1, 1]) { boilSeed('kr' + key + sd);
      const P = []; for (let i = 0; i <= 30; i++) { const q = i / 30, x = lerp(x0, x1, q), gap = snap * 120 * Math.max(0, 1 - Math.abs(q - .55) * 6); P.push([x + (q > .55 ? gap : -gap) * .5, y + sd * 22 * th * Math.sin(q * 18) + sd * snap * 30 * Math.exp(-Math.pow((q - .55) * 6, 2))]); }
      const cut = Math.round(.55 * 30);
      if (snap > .5) { paint(ribbon(P.slice(0, cut), 12 * th, 9 * th), { wash: '#6E4A3A', ink: PAL.ink, sw: .9 }); paint(ribbon(P.slice(cut + 1), 9 * th, 12 * th), { wash: '#6E4A3A', ink: PAL.ink, sw: .9 }); }
      else paint(ribbon(P, 12 * th, 12 * th), { wash: '#6E4A3A', ink: PAL.ink, sw: .9 });
    }
    for (let i = 0; i < n; i++) { const q = (i + .5) / n, x = lerp(x0, x1, q); if (snap > .5 && Math.abs(q - .55) < .1) continue;
      const hi = o.hi || 0, se = o.se ? o.se(i) : 0;
      if (hi > .05) glow(x, y, 26, '#FFE27A', .4 * hi);
      if (se > .05) disguise(x, y, 11 * th, 1, key + 'ds' + i); else sBead(x, y, 9 * th, key + 'sl' + i); }
  }

  // ================================ I1 · Marco Polo's horses: hooves pop off; Pip the farrier (L47 – L49) ================================
  function shotI1(t, lt, dur) {
    K.setT(t);
    const arrive = 1 - easeOut(seg(lt, 0, .45));
    camBegin(960 - 1400 * arrive + 5 * wob(t, .05), 600 + 4 * wob(t, .04), 1.1);
    K.wash('#F0D49A', t, { key: 'i1', blob: '#F8E6BE', n: 4 });
    boilSeed('i1gr'); paint(rectPts(-600, 820, W + 1200, 700), { wash: '#D9B472', fill: '#B8925A', fillOp: 40, tex: .5, ink: null });
    inkLine([[-600, 820], [W + 600, 820]], 1.4, '#9A7A48', 'ink', .4);
    for (let i = 0; i < 3; i++) { boilSeed('i1mt' + i); paint([[-300 + i * 900, 820], [100 + i * 900, 520 + 60 * hash(i)], [500 + i * 900, 820]], { wash: '#E3C08A', ink: null }); }
    // the caravan on the horizon (L47 +4.5): camels in silhouette
    const car = on(t, L(47, 4.4), L(48, 0), .5, .6);
    if (car > .02) for (let i = 0; i < 4; i++) { const x = 1300 + i * 110 - 40 * (t - L(47, 4.4)), y = 800; boilSeed('i1cm' + i);
      paint([[x - 40, y], [x - 30, y - 40], [x - 10, y - 56], [x + 6, y - 40], [x + 20, y - 56], [x + 36, y - 40], [x + 54, y - 64], [x + 64, y - 54], [x + 46, y - 30], [x + 40, y]], { wash: '#B8925A', washOp: 255 * car, ink: null, curv: .4 }); }
    // the horse grazes on milkvetch; hooves pop off (+12.1); Pip hammers them back on, then its thumb (+14.0)
    const HX = 760, HY = 820, pop0 = L(47, 12.0);
    const hoof = i => seg(t, pop0 + i * .12, pop0 + .5 + i * .12);
    const back = i => t > L(47, 12.9 + i * .35);
    milkvetch(1060, 820, 1.2, 'i1mv', t > L(48, 1.2) ? ease(seg(t, L(48, 1.2), L(48, 2.2))) : 0);
    const sniff2 = ease(seg(t, L(48, 6.2), L(48, 6.8))), backAway = ease(seg(t, L(48, 7.4), L(48, 8.6)));
    horse(HX - 160 * backAway, HY, 1.0, t, 'i1h', { graze: t < L(48, 6.2) ? .6 + .3 * Math.sin(t * 2) * (t < pop0 ? 1 : 0) : lerp(.9, .2, backAway), hoof: i => back(i) ? 0 : hoof(i), hoofBack: true });
    if (t > L(48, 1.2)) inset(1300, 330, 200, on(t, L(48, 1.2), L(48, 6.2), .3, .3), 'i1xr', () => { boilSeed('i1xb'); paint(ellPts(1300, 330, 180, 180, 30), { wash: '#2E3142', ink: null }); milkvetch(1300, 470, 2.6, 'i1mvx', 1); });
    const P = [HX - 290, 830], hit = [L(47, 12.9), L(47, 13.25), L(47, 13.6)], ouch = L(47, 14.0);
    let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(47, 4.4), 'calm', { lookX: 1, lookY: -.5 }], [pop0, 'wow', { take: 1.3 }], [L(47, 12.7), 'angry', { lookY: .5 }], [ouch, 'cry'], [ouch + 1.4, 'worried']]);
    const swingK = Math.max(...hit.map(h => on(t, h - .25, h + .05, .2, .05)), on(t, ouch - .25, ouch + .05, .2, .05));
    if (t > L(47, 12.6) && t < ouch + .1) o = { ...o, armF: [lerp(-.6, 1.4, swingK), 3.0], armB: { at: [1.6, -1.8] } }; o.flip = false;
    if (t > ouch) o = { ...o, armF: { at: [.6, -2.6] }, armB: { at: [.9, -2.8] }, armsFront: true, dy: (o.dy || 0) - .6 * Math.abs(Math.sin((t - ouch) * 6)) * (1 - seg(t, ouch + 1.2, ouch + 2.0)) };
    if (t > L(47, 12.4)) {
      pip(P[0], P[1], 32, { ...o, key: 'i1pip' });
      const h = handPt(P[0], P[1], 32, o);
      if (t < ouch + .1) hammer(h[0], h[1], 1.1, lerp(-1.8, .2, swingK), 'i1hm');
      if (t > ouch) { const th = 1 + .2 * Math.sin(t * 14); boilSeed('i1th'); paint(ellPts(h[0] + 6, h[1] - 6, 14 * th, 14 * th, 12), { wash: '#E46A6A', ink: PAL.ink, sw: .9 }); for (let i = 0; i < 3; i++) { const a = -1.2 + i * .6; inkLine([[h[0] + 6 + Math.cos(a) * 22, h[1] - 6 + Math.sin(a) * 22], [h[0] + 6 + Math.cos(a) * 34, h[1] - 6 + Math.sin(a) * 34]], 1.6, PAL.ink, 'ink', 0); } }
      hit.forEach((hh, i) => { if (t > hh && t < hh + .25) K.burst(HX - 120 + i * 80, HY - 10, 30, seg(t, hh, hh + .25), PAL.ink, 'i1clk' + i); });
    } else pip(1500, 830, 32, { ...o, flip: true, key: 'i1pip0' });
    camEnd();
    streaks(arrive, 'i1wp', false, '#E3B07A');
    flash(seg(t, L(49, -.9), L(49, -.5)) * (1 - seg(t, L(49, -.5), L(49, -.1))), '#C9DCC2');
  }

  // ================================ I2 · Enshi, the 1960s (gentle, no Pip) (L49 – L50) ================================
  function shotI2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0);
    const dry = ease(seg(t, L(49, 7.4), L(49, 9.0)));
    camEnd(); camBegin(1000 + 5 * wob(t, .05), 620 + 4 * wob(t, .04), 1.2);
    K.wash(mixCol('#C9DCC2', '#E9D8A8', dry), t, { key: 'i2', blob: '#E2EDDC', n: 4 });
    for (let i = 0; i < 5; i++) { boilSeed('i2mt' + i); const x = -200 + i * 480; paint([[x - 260, 900], [x - 80, 300 + 80 * hash(i)], [x + 60, 250 + 60 * hash(i + 1)], [x + 240, 900]], { wash: mixCol('#7FA67A', '#A8A06A', dry), fill: '#5E8A5E', fillOp: 35, tex: .5, ink: PAL.ink, sw: 1, curv: .5 }); }
    for (let i = 0; i < 4; i++) { boilSeed('i2fg' + i); paint(ellPts(200 + i * 500 + 40 * Math.sin(t * .2 + i), 560 + 40 * hash(i), 300, 50, 18, 6), { wash: '#EEF3EC', washOp: 150 * (1 - dry), ink: null }); }
    // the seam of stone coal in the rock, glowing ruby (+5.5)
    const seam = ease(seg(t, L(49, 5.2), L(49, 6.2)));
    boilSeed('i2sm'); paint(ribbon([[650, 650], [780, 630], [900, 660]], 40, 30), { wash: '#3E3238', ink: null, curv: .5 });
    if (seam > .02) for (let i = 0; i < 6; i++) seBead(670 + i * 44, 645 + 8 * Math.sin(i), 9, 'i2ss' + i, { glowK: .5 * seam });
    // fields at the foot: rain leaches ruby down; then the drought sun; the maize fills with ruby
    boilSeed('i2fd'); paint(rectPts(-400, 840, W + 800, 400), { wash: mixCol('#9CC07A', '#D9B472', dry), ink: null });
    for (let i = 0; i < 8; i++) { const k = frac(t * .5 + i / 8); if (t < L(49, 7.4) && t > L(49, 6.0)) seBead(640 + i * 36, 660 + 200 * k, 6, 'i2rn' + i); }
    if (dry > .02) { glow(1600, 220, 300, '#FFE7A0', .5 * dry); boilSeed('i2sun'); paint(ellPts(1600, 220, 70 * dry, 70 * dry, 20), { wash: '#F6D25A', ink: PAL.ink, sw: 1 }); }
    for (let i = 0; i < 6; i++) { const x = 300 + i * 120, fill_ = ease(seg(t, L(49, 8.0 + i * .2), L(49, 9.4 + i * .2))); boilSeed('i2mz' + i); inkLine([[x, 900], [x, 760]], 3, '#7BAF62', 'ink', .4);
      paint(ellPts(x + 14, 800, 12, 30, 12, 0, .3), { wash: '#F2C860', ink: PAL.ink, sw: .8 }); for (let j = 0; j < Math.round(4 * fill_); j++) seBead(x + 12, 784 + j * 10, 4, 'i2mk' + i + j); }
    // a doorway: a soft silhouette runs a comb through its hair, and the comb comes away full (+11.6)
    const H = [1380, 900];
    boilSeed('i2hs'); paint(rectPts(H[0] - 140, H[1] - 300, 280, 300), { wash: '#C9B9A2', fill: '#A8977E', fillOp: 40, tex: .5, ink: PAL.ink, sw: 1.1 });
    paint([[H[0] - 170, H[1] - 290], [H[0], H[1] - 400], [H[0] + 170, H[1] - 290]], { wash: '#7E6E5E', ink: PAL.ink, sw: 1.1 });
    paint(rectPts(H[0] - 60, H[1] - 220, 120, 220), { wash: '#4B4250', ink: PAL.ink, sw: 1 });
    const cm = on(t, L(49, 11.0), L(50, -.2), .4, .3);
    if (cm > .02) {
      boilSeed('i2sil'); paint(ellPts(H[0], H[1] - 160, 34, 38, 16), { wash: '#6E6470', washOp: 255 * cm, ink: null }); paint(rrPts(H[0] - 40, H[1] - 124, 80, 124, 30), { wash: '#6E6470', washOp: 255 * cm, ink: null });
      const k = seg(t, L(49, 11.4), L(49, 12.6)), cx = H[0] + 50 + 30 * Math.sin(k * Math.PI), cy = H[1] - 190 + 60 * k;
      inkLine([[cx - 20, cy], [cx + 20, cy]], 6, '#E9D7C2', 'ink', 0);
      for (let j = 0; j < 6; j++) inkLine([[cx - 18 + j * 7, cy + 2], [cx - 18 + j * 7 + 4 * Math.sin(j), cy + 10 + 22 * k]], 1, '#3E3238', 'inkfine', .6);
    }
    camEnd();
    flash(1 - seg(lt, 0, .45), '#C9DCC2');
    flash(seg(t, L(50, -.6), L(50, -.25)), PAL.cream);
  }

  // ================================ I3 · keratin: why hair, nails and hooves; Pip's leaf again (L50 – L51) ================================
  function shotI3(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1.05);
    K.wash('#F5EEDD', t, { key: 'i3', blob: '#FBF6EA', n: 4 });
    // three icons: a hair, a fingernail, a hoof (+0.5 – +4.4), then they make way for the rope
    const icons = 1 - ease(seg(t, L(50, 5.6), L(50, 6.4)));
    if (icons > .02) [[560, 'hair', .5], [960, 'nail', 2.6], [1360, 'hoof', 4.4]].forEach(([x, k, a], i) => {
      const q = popK(seg(t, L(50, a), L(50, a + .4))) * icons; if (q < .05) return;
      boilSeed('i3ic' + i); paint(ellPts(x, 380, 130 * q, 110 * q, 26), { wash: '#FFFDF6', ink: PAL.ink, sw: 1.1 });
      if (k === 'hair') { boilSeed('i3hr'); const P = []; for (let j = 0; j <= 12; j++) P.push([x - 90 * q + j * 15 * q, 380 + 20 * q * Math.sin(j * .8)]); paint(ribbon(P, 8 * q, 6 * q), { wash: '#6E4A3A', ink: PAL.ink, sw: .8 }); }
      if (k === 'nail') { paint(rrPts(x - 40 * q, 330 * 1 + 50 * (1 - q), 80 * q, 120 * q, 30 * q), { wash: '#F2C9B4', ink: PAL.ink, sw: 1 }); paint(rrPts(x - 30 * q, 340, 60 * q, 50 * q, 20 * q), { wash: '#FBEBE2', ink: PAL.ink, sw: .8 }); }
      if (k === 'hoof') paint([[x - 60 * q, 430], [x - 40 * q, 330], [x + 40 * q, 330], [x + 60 * q, 430]], { wash: '#3E3238', ink: PAL.ink, sw: 1 });
    });
    // the keratin rope: sulfur links light up (+7.0); disguised selenium elbows in (+10.6); it frays and snaps (+13.0)
    const rope = ease(seg(t, L(50, 5.8), L(50, 6.6)));
    if (rope > .02) keratin(300, 1500, 520 + 300 * (1 - rope), 'i3k', t, { th: 1.7, hi: pulseK(t, L(50, 7.0), 2.0), se: i => (i === 3 || i === 6 || i === 7 || i === 9) ? ease(seg(t, L(50, 10.6 + i * .1), L(50, 11.2 + i * .1))) : 0, snap: ease(seg(t, L(50, 12.9), L(50, 13.2))) });
    // Pip: the leaf falls off again (+13.5); Pip nails it back on with the farrier's hammer: BONK (+14.6)
    const fall = L(50, 13.4), nail_ = L(50, 14.6), P = [1660, 860];
    let o = K.act(t, [[0, 'calm', { lookX: -1, lookY: -.5 }], [L(50, 11.0), 'worried', { lookX: -1 }], [fall + .2, 'wow', { take: 1.3 }], [fall + .9, 'angry'], [nail_, 'dizzy']]);
    const leafOff = t > fall && t < nail_, onAgain = t >= nail_;
    if (leafOff) o = { ...o, leaf: NOLEAF, armF: { at: [-.3, -5.8] }, armB: [1.4, 2.6] };
    const sw_ = on(t, nail_ - .35, nail_ + .05, .3, .05);
    if (t > nail_ - .5 && t < nail_ + .3) o = { ...o, armB: [lerp(-.2, 1.9, sw_), 3.0] };
    pip(P[0], P[1], 34, { ...o, flip: true, key: 'i3pip' });
    const hd = headOf(P[0], P[1], 34, o);
    if (leafOff) { const k = seg(t, fall, fall + .5); leafProp(hd[0] + 6 - 10 * k, hd[1] - 30 * Math.sin(k * Math.PI) + 40 * k, 34, .4 + 2 * k, 'i3lf'); }
    if (t > nail_ - .5 && t < nail_ + .4) { const h = handPt(P[0], P[1], 34, { ...o, flip: true }, 'B'); hammer(h[0], h[1], 1.1, lerp(-1.6, .9, sw_), 'i3hm'); }
    if (onAgain) { boilSeed('i3nl'); paint(ellPts(hd[0] + 4, hd[1] - 6, 6, 6, 8), { wash: '#8C93A3', ink: PAL.ink, sw: .6 }); }
    if (t > nail_ && t < nail_ + .35) K.burst(hd[0], hd[1], 70, seg(t, nail_, nail_ + .35), PAL.ink, 'i3bonk');
    if (t > nail_ + .2) stars(hd[0], hd[1] + 6, 48, t, 'i3dz');
    camEnd();
    flash(1 - seg(lt, 0, .35), PAL.cream);
    flash(seg(t, L(51, -.6), L(51, -.2)), '#E39A6A');
  }

  // ================================ I4 · too much: the firefighter starts fires (L51 – L52) ================================
  function shotI4(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1.05);
    const hot = ease(seg(t, L(51, 3.6), L(51, 6.5)));
    K.wash(mixCol('#F2D2B8', '#C9785A', hot), t, { key: 'i4', blob: '#F8E2CC', n: 4 });
    // ruby beads flood in (+0.5); each grabs a glutathione and spins off superoxide, round and round (+3.7)
    for (let i = 0; i < 6; i++) { const a = L(51, .4 + i * .25), k = seg(t, a, a + 1.0); if (k <= 0) continue;
      const home = [500 + (i % 3) * 300, 330 + Math.floor(i / 3) * 260], p = k < 1 ? arcPt([-100, 200 + 100 * i], home, 100, ease(k)) : home;
      seBead(p[0], p[1], 22, 'i4s' + i);
      if (t > L(51, 3.6 + i * .15)) { const ang = (t - L(51, 3.6)) * 3 + i; gsh(p[0] + Math.cos(ang) * 60, p[1] + Math.sin(ang) * 40, .9, 'i4g' + i, ang);
        for (let j = 0; j < 3; j++) { const ph = frac((t - L(51, 3.6)) * .6 + j / 3 + i * .2); radical(p[0] + Math.cos(ang + j) * (70 + 160 * ph), p[1] + Math.sin(ang + j) * (50 + 120 * ph), 14 * (1 - ph * .5), t, 'i4r' + i + j); } } }
    // Pip's extinguisher, packed with ruby beads, coughs and shoots flame (+10.4): blackened again
    const P = [1500, 900], fire = L(51, 10.4), soot = ease(seg(t, fire + .1, fire + .4));
    let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(51, 3.8), 'worried', { lookX: -1 }], [L(51, 7.4), 'smug', { lookX: -1 }], [fire, 'wow', { take: 1.6 }], [fire + 1.0, 'calm']]);
    o = { ...o, armF: { at: [-2.2, -2.2] }, armB: { at: [-1.6, -2.0] }, armsFront: true };
    if (t > fire + 1.0) o = { ...o, blink: frac((t - fire - 1.0) / .7) < .2 ? 1 : 0 };
    pipT(P[0], P[1], 34, { ...o, flip: true, key: 'i4pip' }, SOOT, soot); nailHead(P[0], P[1], 34, { ...o, flip: true }, 'i4n');
    if (t > L(51, 7.2)) { const h = handPt(P[0], P[1], 34, { ...o, flip: true }); const g = gpx(h[0] - 40, h[1] + 10, .55, 'i4ext', { hose: 1, noBead: 1, rot: Math.PI }); for (let j = 0; j < 4; j++) seBead(h[0] - 60 + j * 22, h[1] + 4, 7, 'i4pk' + j);
      if (t > fire && t < fire + 1.0) { const k = seg(t, fire, fire + 1.0); for (let j = 0; j < 4; j++) flame(h[0] - 140 - j * 40 + 100 * k * (j % 2), h[1] - 10 + 10 * Math.sin(t * 20 + j), 30 + 10 * j, t, 'i4fl' + j); flame(P[0], P[1] - 140, 70 * (1 - k), t, 'i4back'); } }
    if (t > fire && t < fire + .5) K.burst(P[0], P[1] - 120, 140, seg(t, fire, fire + .5), '#F28C2E', 'i4boom');
    if (soot > .5) for (let i = 0; i < 3; i++) { const k = frac(t * .8 + i / 3); puff(P[0] + (i - 1) * 24, P[1] - 6.6 * 34 - k * 80, 12 + 16 * k, 1 - k, 'i4sm' + i, '#8E8790'); }
    camEnd();
    flash(1 - seg(lt, 0, .35), '#E39A6A');
    flash(seg(t, L(52, -.6), L(52, -.2)), '#E4EDCF');
  }

  // ================================ I5 · methylated and breathed out: garlic (L52 – L53) ================================
  function shotI5(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.05);
    K.wash('#E4EDCF', t, { key: 'i5', blob: '#F0F5E2', n: 4 });
    // a body: ruby beads get methyl groups (+1.0 – 3.4), some go down to the bladder (+4.4), some up and out of the lungs (+5.8)
    const B = [560, 640];
    boilSeed('i5bd'); paint(ellPts(B[0], B[1] - 300, 80, 86, 20), { wash: '#EFE4D2', ink: PAL.ink, sw: 1.1 }); paint(rrPts(B[0] - 120, B[1] - 210, 240, 400, 70), { wash: '#EFE4D2', ink: PAL.ink, sw: 1.1 });
    for (const sd of [-1, 1]) paint(ellPts(B[0] + sd * 52, B[1] - 110, 46, 70, 16), { wash: '#F2B8C4', ink: PAL.ink, sw: .9 });
    paint(ellPts(B[0], B[1] + 140, 40, 30, 14), { wash: '#F2D98A', ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 4; i++) { const p = [B[0] - 60 + i * 40, B[1] + 30], me = ease(seg(t, L(52, 1.0 + i * .5), L(52, 1.5 + i * .5)));
      const down = i % 2 === 0, mv = seg(t, L(52, 4.2 + i * .2), L(52, 5.4 + i * .2)), up = seg(t, L(52, 5.6 + i * .2), L(52, 7.0 + i * .2));
      const q = down ? [p[0], lerp(p[1], B[1] + 140, ease(mv))] : up > 0 ? [lerp(p[0], B[0] + 10, up), lerp(p[1], B[1] - 330, ease(up))] : p;
      if (down || up < 1) { seBead(q[0], q[1], 14, 'i5s' + i); for (let j = 0; j < 2; j++) if (me > .05) bead(q[0] + (j ? 14 : -14), q[1] - 14, 6 * me, '#9AA3AE', '#6E7686', 'i5m' + i + j); } }
    for (let i = 0; i < 4; i++) { const k = seg(t, L(52, 6.6 + i * .3), L(52, 8.6 + i * .3)); if (k > 0 && k < 1) puff(B[0] + 40 + 220 * k, B[1] - 340 - 60 * k, 30 + 30 * k, 1 - .4 * k, 'i5br' + i); }
    // the horse from I1 at the right; Pip breathes out: a garlic cloud; the horse faints; Pip jars its breath; the jar cracks
    const H = [1640, 860], ex = L(52, 8.8), faint = ease(seg(t, ex + .7, ex + 1.3)), jar = L(52, 10.2), crack = L(52, 11.2);
    horse(H[0], H[1], .7, t, 'i5h', { faint });
    const P = [1200, 880];
    let o = K.act(t, [[0, 'calm', { lookX: -1 }], [L(52, 6.6), 'calm', { lookX: -1, lookY: -.6 }], [ex - .4, 'calm'], [ex, 'wow'], [ex + 1.2, 'worried', { lookX: 1, blush: 1 }], [jar, 'smug'], [crack, 'wow', { take: 1.3 }], [crack + .8, 'worried', { blush: 1 }]]);
    if (t > ex - .4 && t < ex + .1) o = { ...o, sq: (o.sq || 0) - .12 * seg(t, ex - .4, ex) };
    if (t > jar - .3) o = { ...o, armF: { at: [1.4, -2.4] }, armB: { at: [.3, -2.6] }, armsFront: true };
    pip(P[0], P[1], 34, { ...o, key: 'i5pip' }); nailHead(P[0], P[1], 34, o, 'i5n');
    const m = mouthOf(P[0], P[1], 34, o);
    if (t > ex && t < jar + .5) { const k = seg(t, ex, ex + 1.0); for (let i = 0; i < 4; i++) puff(m[0] + 60 + 260 * k + 40 * i, m[1] - 20 + 20 * Math.sin(i), 40 + 20 * i * k, 1 - .3 * k, 'i5gc' + i);
      boilSeed('i5gb'); const g = [m[0] + 200 + 200 * k, m[1] - 40]; paint([[g[0], g[1] - 46], [g[0] + 30, g[1] - 10], [g[0] + 22, g[1] + 24], [g[0] - 22, g[1] + 24], [g[0] - 30, g[1] - 10]], { wash: '#F6F1E4', ink: PAL.ink, sw: .9, curv: .6 });
      for (let i = 0; i < 3; i++) stink(g[0] - 40 + 40 * i, g[1] - 50, 70, t, 1, 'i5st' + i); }
    if (faint > .5) for (let i = 0; i < 4; i++) fly(H[0] - 100 + 60 * i, H[1] - 10, 1.4, t, true, 'i5fl' + i);
    if (t > jar - .2) { const h = handPt(P[0], P[1], 34, o); boilSeed('i5jar'); paint(rrPts(h[0] - 28, h[1] - 70, 56, 76, 12), { wash: '#DCEBEE', washOp: 200, ink: PAL.ink, sw: 1 }); paint(rrPts(h[0] - 30, h[1] - 82, 60, 14, 4), { wash: '#C9A86A', ink: PAL.ink, sw: .9 });
      puff(h[0], h[1] - 34, 18, 1, 'i5in');
      if (t > crack) { inkLine([[h[0] - 10, h[1] - 64], [h[0] + 4, h[1] - 40], [h[0] - 6, h[1] - 20], [h[0] + 8, h[1] - 4]], 1.4, PAL.ink, 'ink', 0); const k = seg(t, crack, crack + 1.2); puff(h[0] + 40 * k, h[1] - 60 - 60 * k, 20 + 30 * k, 1 - k, 'i5leak'); } }
    camEnd();
    flash(1 - seg(lt, 0, .35), '#E4EDCF');
    flash(seg(t, L(53, -.6), L(53, -.2)), PAL.cream);
  }

  // ================================ R2 · RECAP 2: the narrow path (cream board, no Pip) (L53 – L54) ================================
  function shotR2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 4 * wob(t, .04), 540 + 3 * wob(t, .03), 1.0);
    K.wash('#F5EEDD', t, { key: 'r2', blob: '#FBF6EA', n: 4 });
    K.motes(t, 8, '#E2D6BC', { key: 'r2m' });
    // the tightrope, nobody on it; the far ends: too little (left), too much (right)
    const A = [420, 560], Bp = [1500, 560], glowK = on(t, L(53, 12.4), 1e9, .5, 0);
    boilSeed('r2cl'); paint([[A[0] + 30, A[1] + 10], [A[0] - 300, A[1] - 20], [A[0] - 600, A[1]], [A[0] - 600, 1300], [A[0] + 60, 1300]], { wash: Z.cliffL, fill: Z.cliffLDk, fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.2, curv: .3 });
    boilSeed('r2cr'); paint([[Bp[0] - 30, Bp[1] + 10], [Bp[0] + 300, Bp[1] - 20], [Bp[0] + 600, Bp[1]], [Bp[0] + 600, 1300], [Bp[0] - 60, 1300]], { wash: Z.cliffR, fill: Z.cliffRDk, fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.2, curv: .3 });
    if (glowK > .02) { for (let i = 0; i <= 6; i++) glow(lerp(A[0], Bp[0], i / 6), 572, 70, '#FFE7A0', .4 * glowK); }
    boilSeed('r2rp'); inkLine([[A[0], A[1]], [960, 590], [Bp[0], Bp[1]]], 2.6 + 1.4 * glowK, mixCol('#9C8460', '#F2C14A', glowK), 'ink', .5);
    const icon = (x, y, a, draw, key) => { const q = popK(seg(t, L(53, a), L(53, a + .45))); if (q < .05) return; push(); translate(x, y); scale(q); translate(-x, -y); boilSeed('r2i' + key); paint(ellPts(x, y, 90, 80, 22, 3), { wash: '#FFFDF6', ink: PAL.ink, sw: 1 }); draw(); pop(); };
    icon(230, 420, 2.9, () => { const d = ease(seg(t, L(53, 3.3), L(53, 4.2))); paint(heartPts(230, 436, 50), { wash: mixCol('#E46A7A', '#9C9497', d), ink: PAL.ink, sw: 1 }); }, 'h');
    icon(470, 330, 4.4, () => { for (let j = 0; j < 4; j++) bead(420 + j * 34, 316, 9, K.C.phos, mixCol(K.C.phos, PAL.ink, .3), 'r2mb' + j); flame(470, 356, 24, t, 'r2fl'); }, 'm');
    icon(700, 420, 6.2, () => { virusC(680, 420, 34, t, 'r2v', 1); stopLight(740, 472, .3, 1, 'r2gl'); }, 'v');
    icon(1220, 420, 9.6, () => disguise(1220, 420, 34, 1, 'r2dg'), 'd');
    icon(1450, 330, 10.6, () => keratin(1390, 1510, 330, 'r2k', t, { snap: 1, se: i => i % 3 === 0 ? 1 : 0 }), 'k');
    icon(1690, 420, 11.6, () => { for (let j = 0; j < 3; j++) puff(1660 + 30 * j, 420 + 10 * Math.sin(j), 26, 1, 'r2g' + j); stink(1700, 400, 50, t, 1, 'r2st'); }, 'g');
    camEnd();
    flash(1 - seg(lt, 0, .4), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#C9824E', '#F2C49A']);
  }


  // ---------- the kitchen, the fridge dial, food ----------
  function nailHead(x, y, u, o, key) { const hd = headOf(x, y, u, o); boilSeed('nh' + key); paint(ellPts(hd[0] + 4, hd[1] - 6, 6, 6, 8), { wash: '#8C93A3', ink: PAL.ink, sw: .6 }); }
  function kitchen(t, key) {
    K.wash('#F3D9B5', t, { key: key + 'w', blob: '#FAE9CF', n: 4 });
    boilSeed(key + 'tl'); for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) paint(rectPts(80 + i * 200, 120 + j * 150, 190, 140), { wash: '#F6E4C6', ink: '#E2C9A2', sw: .6 });
    boilSeed(key + 'ct'); paint(rectPts(-400, 760, W + 800, 600), { wash: '#C99A62', fill: '#A47A4A', fillOp: 40, tex: .5, ink: PAL.ink, sw: 1.2 });
    inkLine([[-400, 790], [W + 400, 790]], 1, '#A47A4A', 'inkfine', 0);
    boilSeed(key + 'fr'); paint(rrPts(1500, 40, 340, 720, 24), { wash: '#E9EEF2', fill: '#C9D3DC', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.3 }); inkLine([[1500, 330], [1840, 330]], 1.2, PAL.ink, 'ink', 0);
    paint(rrPts(1520, 180, 16, 120, 6), { wash: '#A9B2BC', ink: PAL.ink, sw: .8 }); paint(rrPts(1520, 380, 16, 160, 6), { wash: '#A9B2BC', ink: PAL.ink, sw: .8 });
  }
  // a dial with no numbers: too little (grey) | a narrow green band | too much (garlic olive); v 0..1 the needle; lim: the red limit tick
  function dial(x, y, r, v, lim, key) {
    boilSeed('dl' + key);
    const seg_ = (a0, a1, col) => { const P = [[x, y]]; for (let i = 0; i <= 12; i++) { const a = Math.PI + lerp(a0, a1, i / 12) * Math.PI; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } paint(P, { wash: col, ink: PAL.ink, sw: 1 }); };
    seg_(0, .42, '#B9B4BC'); seg_(.42, .58, '#6FBF6A'); seg_(.58, 1, '#A8B06A');
    paint(ellPts(x, y, r * .3, r * .3, 14), { wash: '#F6F1E4', ink: PAL.ink, sw: .9 });
    if (lim > .05) { const a = Math.PI + .58 * Math.PI; inkLine([[x + Math.cos(a) * r * .85, y + Math.sin(a) * r * .85], [x + Math.cos(a) * r * 1.12, y + Math.sin(a) * r * 1.12]], 5 * lim, '#D2413F', 'ink', 0); }
    const a = Math.PI + v * Math.PI; inkLine([[x, y], [x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9]], 4, PAL.ink, 'ink', 0);
    paint(ellPts(x, y, 9, 9, 10), { wash: '#4B4250', ink: null });
  }
  function food(kind, x, y, s, key) {                               // fish, prawn, egg, meat, grain bowl, each with a few ruby flecks
    boilSeed('fd' + key);
    if (kind === 'fish') { paint(ellPts(x, y, 70 * s, 30 * s, 18), { wash: '#9CC4E4', ink: PAL.ink, sw: 1 }); paint([[x + 60 * s, y], [x + 100 * s, y - 26 * s], [x + 100 * s, y + 26 * s]], { wash: '#9CC4E4', ink: PAL.ink, sw: 1 }); paint(ellPts(x - 44 * s, y - 6 * s, 5 * s, 5 * s, 8), { wash: PAL.ink, ink: null }); }
    if (kind === 'prawn') paint(ribbon([[x - 50 * s, y], [x - 10 * s, y - 30 * s], [x + 30 * s, y - 10 * s], [x + 40 * s, y + 20 * s]], 30 * s, 10 * s), { wash: '#F2A07A', ink: PAL.ink, sw: 1, curv: .5 });
    if (kind === 'egg') { paint(ellPts(x, y, 56 * s, 40 * s, 18), { wash: '#FFFDF6', ink: PAL.ink, sw: 1 }); paint(ellPts(x, y, 22 * s, 20 * s, 14), { wash: '#F6C24A', ink: PAL.ink, sw: .8 }); }
    if (kind === 'meat') { paint(ellPts(x, y, 60 * s, 40 * s, 18, 2), { wash: '#D9707A', ink: PAL.ink, sw: 1 }); inkLine([[x - 40 * s, y], [x + 40 * s, y + 6 * s]], 2, '#F2C9CC', 'ink', .5); }
    if (kind === 'grain') { paint([...Array(13)].map((_, i) => { const a = i / 12 * Math.PI; return [x - Math.cos(a) * 60 * s, y - 10 * s + Math.sin(a) * 40 * s]; }), { wash: '#E9EEF2', ink: PAL.ink, sw: 1 }); paint(ellPts(x, y - 14 * s, 56 * s, 16 * s, 16), { wash: '#FBF6E9', ink: PAL.ink, sw: .8 }); }
    for (let i = 0; i < 3; i++) seBead(x + (i - 1) * 22 * s, y - 4 * s + (i % 2) * 8 * s - (kind === 'grain' ? 14 * s : 0), 5 * s, key + 'f' + i);
  }
  function tractor(x, y, s, t, key) {
    boilSeed('tc' + key);
    paint(rrPts(x - 120 * s, y - 150 * s, 200 * s, 90 * s, 14 * s), { wash: '#D2413F', fill: '#A8282E', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x + 20 * s, y - 240 * s, 90 * s, 100 * s, 10 * s), { wash: '#D2413F', ink: PAL.ink, sw: 1.1 }); paint(rrPts(x + 34 * s, y - 226 * s, 62 * s, 50 * s, 6 * s), { wash: '#DCEBEE', ink: PAL.ink, sw: .8 });
    for (const [wx, r] of [[x + 60 * s, 70 * s], [x - 90 * s, 42 * s]]) { paint(ellPts(wx, y - r, r, r, 18), { wash: '#3E3A40', ink: PAL.ink, sw: 1 }); paint(ellPts(wx, y - r, r * .45, r * .45, 12), { wash: '#F2C14A', ink: PAL.ink, sw: .8 }); const a = t * 6; inkLine([[wx + Math.cos(a) * r * .4, y - r + Math.sin(a) * r * .4], [wx - Math.cos(a) * r * .4, y - r - Math.sin(a) * r * .4]], 1.4, PAL.ink, 'ink', 0); }
    paint(rrPts(x - 260 * s, y - 120 * s, 120 * s, 50 * s, 8 * s), { wash: '#C9A86A', ink: PAL.ink, sw: 1 });
  }

  // ================================ J1 · how much: the dial, food, Finland's fields, supplements, the nut bowl (L54 – L59) ================================
  function shotJ1(t, lt, dur) {
    K.setT(t);
    const field = t > L(56, -.4) && t < L(57, -.4);
    const u = 34;
    if (!field) {
      const c = kf(t, [[L(54, -1), [960, 500, 1.05]], [L(55, -.4), [960, 500, 1.05]], [L(55, .4), [700, 620, 1.35]], [L(57, -1), [700, 620, 1.35]], [L(57, -.2), [800, 540, 1.2]], [L(58, -.2), [1000, 540, 1.15]], [L(58, 6.2), [1000, 540, 1.15]], [L(59, -.2), [1120, 560, 3.4]]], ease);
      camBegin(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      kitchen(t, 'j1');
      // L54: the dial on the fridge door; the needle settles in the narrow green band; the red limit tick
      const v = kf(t, [[L(54, 2.6), .1], [L(54, 4.6), .2], [L(54, 6.2), .5], [L(54, 7.6), .5]], ease);
      dial(1670, 260, 120, v + .02 * Math.sin(t * 3), ease(seg(t, L(54, 8.0), L(54, 8.6))), 'j1dl');
      // L55: the food parade along the counter
      const kinds = ['fish', 'prawn', 'egg', 'meat', 'grain'];
      if (t > L(55, -.2) && t < L(57, -.6)) kinds.forEach((k, i) => { const a = L(55, .4 + i * .6), q = ease(seg(t, a, a + .6)); if (q > 0) food(k, lerp(2100, 300 + i * 220, q), 730, 1.0, 'j1f' + i); });
      // L57: the giant supplement bottle; pills avalanche; a shield ✗ and a sugar cube that grows a little
      const bot = popK(seg(t, L(57, .3), L(57, .8))), shake = L(57, 2.2), capOff = L(57, 3.4);
      if (t > L(57, .2) && t < L(58, -.3) && bot > .05) {
        const B = [760, 760], sh = t > shake && t < capOff ? 20 * Math.sin(t * 30) : 0;
        boilSeed('j1bt'); push(); translate(B[0] + sh, B[1]); scale(bot); paint(rrPts(-110, -330, 220, 330, 30), { wash: '#F2E2C4', ink: PAL.ink, sw: 1.3 }); paint(rrPts(-90, -230, 180, 120, 10), { wash: '#C8323C', ink: PAL.ink, sw: 1 }); seBead(0, -170, 30, 'j1lb'); pop();
        const capK = seg(t, capOff, capOff + .8); if (capK < 1) { const p = capK > 0 ? arcPt([B[0], B[1] - 360], [B[0] + 300, B[1] - 500], 200, capK) : [B[0] + sh, B[1] - 350 * bot]; boilSeed('j1cap'); paint(rrPts(p[0] - 80, p[1] - 30, 160, 50, 10), { wash: '#A9B2BC', ink: PAL.ink, sw: 1 }); }
        
        const sx = popK(seg(t, L(57, 6.0), L(57, 6.5))) * 1.7; if (sx > .05) { boilSeed('j1sd'); paint([[460, 200], [560, 230], [560, 330], [510, 380], [460, 330]].map(([a, b]) => [lerp(510, a, sx), lerp(290, b, sx)]), { wash: '#9CB5E6', ink: PAL.ink, sw: 1.2 }); K.cross(510, 290, 90 * sx, seg(t, L(57, 6.5), L(57, 7.3)), 'j1x'); }
        const cb = popK(seg(t, L(57, 9.0), L(57, 9.5))) * (1.5 + .3 * ease(seg(t, L(57, 9.6), L(57, 10.4)))); if (cb > .05) { boilSeed('j1sg'); paint(rectPts(700 - 40 * cb, 290 - 40 * cb, 80 * cb, 80 * cb), { wash: '#FBF8F2', ink: PAL.ink, sw: 1 }); inkLine([[700 - 40 * cb, 290 - 10 * cb], [700 + 40 * cb, 290 - 10 * cb]], .8, '#D9D2C6', 'inkfine', 0); }
      }
      // L58: the binge bowl from the opening; Pip takes a handful, thinks, puts it back, keeps one
      const bowlIn = ease(seg(t, L(58, -.2), L(58, .6)));
      if (bowlIn > .02) nutBowl(lerp(2200, 1240, bowlIn), 760, .85, 1, 'j1nb');
      // Pip
      const P = t < L(57, -.4) ? [460, 760] : t < L(58, -.3) ? [1040, 760] : [1060, 760];
      let o = K.act(t, [[0, 'calm', { lookX: 1, lookY: -.6 }], [L(54, 6.6), 'smug', { lookX: 1, lookY: -.6 }], [L(55, .4), 'wow', { lookX: 1 }], [L(55, 5.2), 'happy'],
        [L(57, .4), 'idea', { lookX: -1, lookY: -.6 }], [L(57, 2.0), 'strain', { lookX: -1 }], [capOff + .3, 'wow', { take: 1.4 }], [capOff + 1.4, 'worried', { blush: 1 }], [L(57, 10.8), 'smug'],
        [L(58, .2), 'excited', { lookX: 1 }], [L(58, 2.6), 'confused', { lookX: 0, lookY: 0 }], [L(58, 4.4), 'calm', { lookX: 1 }], [L(58, 6.0), 'wink']]);
      if (t > L(54, 7.0) && t < L(54, 8.8)) o = { ...o, armF: [1.4, 3.4] };
      if (t > L(55, 5.0) && t < L(56, -.6)) o = { ...o, armF: { at: [.6, -2.5] }, armsFront: true, sq: (o.sq || 0) + .04 * Math.abs(Math.sin(t * 8)) };
      if (t > shake - .4 && t < capOff) o = { ...o, armF: { at: [-3.4, -3.0 + .3 * Math.sin(t * 30)] }, armB: { at: [-3.2, -1.6] }, flip: true };
      if (t > capOff) { const buried = ease(seg(t, capOff + .4, capOff + 1.6)) * (1 - ease(seg(t, L(58, -.6), L(58, -.2)))); o = { ...o, flip: true, dy: (o.dy || 0) + .5 * buried }; }
      const grab = L(58, 1.9), putBack = L(58, 4.4);
      if (t > grab - .3 && t < putBack + .6) o = { ...o, armF: { at: t < putBack ? [2.0, -2.8] : [4.6, -1.2] }, armB: { at: [1.6, -2.6] }, armsFront: true, flip: false };
      if (t > putBack + .6) o = { ...o, armF: { at: [2.2, -3.6] }, flip: false };
      pip(P[0], P[1], u, { ...o, key: 'j1pip' });
      nailHead(P[0], P[1], u, o, 'j1n');
      if (t > L(55, 5.0) && t < L(56, -.6)) { const h = handPt(P[0], P[1], u, o); food('grain', h[0] + 20, h[1] + 30, .6, 'j1rice'); }
      if (t > capOff + .1 && t < L(58, -.3)) for (let i = 0; i < 26; i++) { const a = capOff + .1 + i * .06, k = seg(t, a, a + .7); if (k <= 0) continue; const rest = [P[0] + (hash(i) - .5) * 150, P[1] - 10 - Math.floor(i / 6) * 26 - 10 * hash(i + 1)]; const p = k < 1 ? arcPt([760, 420], rest, 160, k) : rest; boilSeed('j1pl' + i); paint(ellPts(p[0], p[1], 16, 9, 10, 0, hash(i) * 3), { wash: i % 2 ? '#F6F1E4' : '#E8C2D2', ink: PAL.ink, sw: .7 }); }
      if (t > grab && t < putBack + .3) { const h = handPt(P[0], P[1], u, o); for (let i = 0; i < 5; i++) bnut(h[0] - 30 + i * 14, h[1] - 6 - 10 * (i % 2), 1.0, i, 'j1hand' + i); }
      if (t > putBack + .6) { const h = handPt(P[0], P[1], u, o); bnut(h[0] + 6, h[1] - 4, 1.2, -.3, 'j1one', { see: ease(seg(t, L(59, -1.2), L(59, -.4))) }); }
      camEnd();
      flash(seg(t, L(59, -.5), L(59, -.1)), PAL.cream);
    } else {
      // L56: Finland: a green field, the tractor spreads ruby flecks with the fertiliser; Pip rides it, gets sprayed, sneezes ruby
      const arrive = 1 - easeOut(seg(t, L(56, -.4), L(56, .1)));
      const txc = lerp(-300, 2200, seg(t, L(56, .2), L(56, 11.6)));
      camBegin(clamp(txc + 100, 700, 1300) + 1400 * arrive + 5 * wob(t, .05), 640 + 4 * wob(t, .04), 1.3);
      K.wash('#CFE3F2', t, { key: 'j1f', blob: '#E4EFF8', n: 4 });
      for (let i = 0; i < 9; i++) { boilSeed('j1bi' + i); const x = 100 + i * 220; inkLine([[x, 700], [x + 6, 420 - 40 * hash(i)]], 7, '#F2EFE8', 'ink', .3); for (let j = 0; j < 3; j++) paint(ellPts(x + 6, 420 - 40 * hash(i) - 10 + j * 40, 40, 28, 12, 2), { wash: '#9CC47A', ink: null }); }
      boilSeed('j1gr'); paint(rectPts(-400, 700, W + 800, 600), { wash: '#8EB86A', fill: '#6E9A4E', fillOp: 40, tex: .5, ink: null });
      const tx = lerp(-300, 2200, seg(t, L(56, .2), L(56, 11.6)));
      tractor(tx, 860, 1.1, t, 'j1tr');
      for (let i = 0; i < 10; i++) { const k = frac(t * 1.5 + i / 10); seBead(tx - 290 - 40 * k + 20 * Math.sin(i), 760 + 100 * k, 5, 'j1sp' + i); }
      const sneeze = L(56, 7.2);
      let o = K.act(t, [[0, 'happy', { lookX: 1 }], [L(56, 6.4), 'calm', { lookX: -1 }], [sneeze - .4, 'strain'], [sneeze, 'wow', { take: 1.6 }], [sneeze + .8, 'laugh']]);
      const P = [tx + 64, 860 - 240 * 1.1];
      pip(P[0], P[1], 26, { ...o, noShadow: true, key: 'j1pipf' });
      nailHead(P[0], P[1], 26, o, 'j1nf');
      if (t > sneeze && t < sneeze + .6) { const m = mouthOf(P[0], P[1], 26, o); for (let i = 0; i < 6; i++) { const k = seg(t, sneeze, sneeze + .6); seBead(m[0] + 40 + 160 * k * Math.cos(i * .3 - .6), m[1] + 120 * k * Math.sin(i * .3 - .6), 5, 'j1sn' + i); } }
      // a blood drop: its ruby level rises (+8.0)
      const lvl = ease(seg(t, L(56, 8.0), L(56, 10.6)));
      if (false) inset(1560, 300, 150, on(t, L(56, 7.8), L(57, -.5), .3, .3), 'j1bd', () => {
        boilSeed('j1dp'); const D = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, w = Math.sin(a / 2); D.push([1560 + Math.sin(a) * 70 * (.35 + .65 * w), 290 - Math.cos(a) * 90 + 40 * w]); }
        paint(D, { wash: '#F2D2D6', ink: PAL.ink, sw: 1.1, curv: .4 });
        const n = Math.round(3 + 9 * lvl); for (let i = 0; i < n; i++) seBead(1525 + (i % 4) * 24, 360 - Math.floor(i / 4) * 26, 9, 'j1lv' + i);
      });
      camEnd();
      inset(1600, 260, 150, on(t, L(56, 7.8), L(57, -.5), .3, .3), 'j1bd', () => {
        boilSeed('j1dp'); const D = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, w = Math.sin(a / 2); D.push([1600 + Math.sin(a) * 70 * (.35 + .65 * w), 250 - Math.cos(a) * 90 + 40 * w]); }
        paint(D, { wash: '#F2D2D6', ink: PAL.ink, sw: 1.1, curv: .4 });
        const n = Math.round(3 + 9 * lvl); for (let i = 0; i < n; i++) seBead(1565 + (i % 4) * 24, 320 - Math.floor(i / 4) * 26, 9, 'j1lv' + i);
      });
      streaks(arrive, 'j1wp', false, '#B8D2E6');
      const back = easeIn(seg(t, L(57, -.9), L(57, -.4))); streaks(back, 'j1wb', false, '#E3C2A8');
    }
    if (lt < .3) brushWipe(.5 + lt / .6, ['#C9824E', '#F2C49A']);
  }

  // ================================ K1 · one nut's journey; knocked down and back up, all day (L59 – L61) ================================
  function shotK1(t, lt, dur) {
    K.setT(t);
    const S = [400, 1900, 3400, 4900];                              // the nut, the liver lanterns, the brain gate, the membrane
    const bx = kf(t, [[L(59, .2), S[0]], [L(59, 3.0), S[1]], [L(59, 5.4), S[2]], [L(59, 7.6), S[3] - 120], [L(59, 9.8), S[3] - 120]], ease);
    const cx = lerp(bx + 200, S[3], ease(seg(t, L(59, 9.4), L(60, .2))));
    camBegin(cx + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.0);
    const day = t > L(60, 5.4) ? (t - L(60, 5.4)) * (.4 + .5 * seg(t, L(60, 5.4), L(60, 9.0))) : 0, sky = .5 + .5 * Math.cos(day * TAU);
    K.wash(mixCol('#E8C3C8', '#3E3A62', t > L(60, 5.4) ? 1 - sky : 0), t, { key: 'k1', blob: '#F2D8DC', n: 4, rect: rectPts(-1600, -1400, 9000, 4000) });
    boilSeed('k1vs'); paint(rectPts(-800, 520, 5100, 200), { wash: '#D98C9C', ink: null }); inkLine([[-800, 520], [4300, 520]], 1.2, '#B8475A', 'ink', 0); inkLine([[-800, 720], [4300, 720]], 1.2, '#B8475A', 'ink', 0);
    // the nut splits (L59 +0.3); the bead leaves; the liver strings it into a lantern; the portcullis; GPx4 on the membrane
    bnut(S[0], 620, 3.0, 0, 'k1nut', { split: ease(seg(t, L(59, .1), L(59, .6))) });
    boilSeed('k1lv'); paint([[S[1] - 300, 400], [S[1] - 60, 330], [S[1] + 80, 380], [S[1] + 40, 480], [S[1] - 260, 500]], { wash: '#B8644E', fill: '#8E4434', fillOp: 45, tex: .4, ink: PAL.ink, sw: 1.2, curv: .5 });
    const inLantern = t > L(59, 3.0) && t < L(59, 7.4);
    for (let i = 0; i < 6; i++) { const lx = bx - 70 - i * 70; if (inLantern) lantern(lx, 620 + 30 * Math.sin(t * 3 - i), 26, 'k1l' + i, .4); }
    const gy = 250 + 360 * easeIn(seg(t, L(59, 6.0), L(59, 6.25)));
    boilSeed('k1gt'); for (let i = 0; i < 4; i++) paint(rectPts(S[2] - 52 + i * 32, gy - 340, 12, 340), { wash: '#8C93A3', ink: PAL.ink, sw: .9 });
    paint(rectPts(S[2] - 60, gy - 360, 120, 24), { wash: '#6E7686', ink: PAL.ink, sw: 1 });
    boilSeed('k1br'); paint(ellPts(S[2] + 260, 520, 220, 180, 26, 6), { wash: '#F2B8C4', ink: PAL.ink, sw: 1.2 });
    // the membrane and GPx4 at the end; on it the ruby 不倒翁 takes hit after hit and rights itself (L60)
    const Mx = S[3] - 700;
    boilSeed('k1mb'); paint(rectPts(Mx, 700, 2400, 120), { wash: '#F2E4CC', ink: null });
    for (let i = 0; i < 40; i++) { boilSeed('k1hd' + i); paint(ellPts(Mx + 30 + i * 44, 700, 16, 16, 10), { wash: K.C.phos, ink: PAL.ink, sw: .7 }); paint(ellPts(Mx + 52 + i * 44, 820, 16, 16, 10), { wash: K.C.phos, ink: PAL.ink, sw: .7 }); }
    gpx(S[3] + 240, 620, 1.0, 'k1gx', { glowK: .3 });
    const hits = [L(60, 2.4), L(60, 5.6), L(60, 6.6), L(60, 7.4), L(60, 8.1), L(60, 8.7)];
    let tip = 0; hits.forEach(h => { if (t > h) tip += .9 * Math.sin(Math.min(1, (t - h) / .6) * Math.PI) * Math.exp(-2.5 * Math.max(0, t - h - .6)); });
    if (t > L(59, 7.4)) tumbler(S[3], 700, 1.35 * popK(seg(t, L(59, 7.4), L(59, 7.9))), tip, 'se', 'k1tb', { ox: hits.reduce((a, h) => a + (t > h - .1 && t < h + .6 ? 1 : 0), 0) / 3 });
    hits.forEach((h, i) => { const k = seg(t, h - .5, h); if (k > 0 && k < 1) h2o2(lerp(S[3] - 400, S[3] - 10, k), 560 - 40 * i % 3, 1.6, k * 5, 'k1hp' + i); });
    if (t > L(60, 5.4)) { const a = day * TAU; boilSeed('k1sun'); const sp = [S[3] + Math.cos(a + Math.PI) * 700, 420 - Math.sin(a) * 300]; if (Math.sin(a) > -.2) { glow(sp[0], sp[1], 90, '#FFE7A0', .5); paint(ellPts(sp[0], sp[1], 40, 40, 16), { wash: '#F6D25A', ink: PAL.ink, sw: .9 }); }
      const mp = [S[3] + Math.cos(a) * 700, 420 + Math.sin(a) * 300]; if (-Math.sin(a) > -.2) moon(mp[0], mp[1], 36, 1, 'k1mo'); }
    if (t < L(59, 9.6)) seBead(bx, 620 + 10 * Math.sin(t * 4), 20, 'k1bead', { glowK: .5 });
    // Pip runs along with the bead; ducks under the falling portcullis this time (smug)
    const px = t < L(60, 0) ? bx - 220 : S[3] - 360, duck = on(t, L(59, 5.7), L(59, 6.6), .15, .3);
    let o = K.act(t, [[0, 'happy', { lookX: 1 }], [L(59, 5.6), 'wow', { lookX: 1, lookY: -.8 }], [L(59, 6.4), 'smug', { lookX: -1, lookY: -.4 }], [L(59, 8.0), 'happy', { lookX: 1 }], [L(60, 2.4), 'wow', { lookX: 1 }], [L(60, 6.0), 'excited', { lookX: 1 }]]);
    if (t < L(59, 9.6)) o = { ...o, walk: t * 3.4 };
    if (duck > .02) o = { ...o, sq: (o.sq || 0) + .45 * duck, armF: { at: [.3, -4.4] }, armB: { at: [-.3, -4.4] }, armsFront: true };
    pip(px, 720, 32, { ...o, key: 'k1pip' }); nailHead(px, 720, 32, o, 'k1n');
    camEnd();
    flash(1 - seg(lt, 0, .45), PAL.cream);
    flash(seg(t, L(61, -.6), L(61, -.2)), PAL.cream);
  }

  // ================================ K2 · the stop rewritten as go; the sulfur toy stays down (L61 – L62) ================================
  function shotK2(t, lt, dur) {
    K.setT(t);
    camBegin(980 + 5 * wob(t, .05), 560 + 4 * wob(t, .04), 1.2);
    K.wash(K.C.cyto, t, { key: 'k2', blob: '#FBEBDD', n: 4 });
    const go = ease(seg(t, L(61, 4.4), L(61, 5.0))), roll = ease(seg(t, L(61, 5.4), L(61, 7.4)));
    rnaLine(-200, 700, 'AUGGCCAGCUUCGGAUCCAGCUGAGCAUCCGGUACCUUAGGCAUCCAGGUAACCGGAUCGUAG', 'k2r', { hi: i => i >= 24 && i <= 26 ? (1 - go) * .8 : 0 });
    const rx = -200 + 25.5 * 26 - 48 + 400 * roll;
    const chain = []; for (let i = 0; i <= 8; i++) chain.push([rx - 14 - i * 24, 568 - i * 16 - 10 * Math.sin(i * .9 + t)]);
    K.ribosome(rx, 700, 0, 1.6, t, { key: 'k2rb', chain, chainN: 9 + (go > .5 ? 1 : 0) + Math.floor(roll * 5) });
    stopLight(-200 + 25.5 * 26 + 96, 686, .62, go, 'k2sl');
    if (go > .5) seBead(chain[0][0] + 6, chain[0][1] + 4, 10, 'k2new');
    // the sulfur 不倒翁 lies burnt on the siding, smoking; it doesn't get up
    const sy = popK(seg(t, L(61, 8.6), L(61, 9.2)));
    if (sy > .05) { tumbler(1460, 900, 1.0 * sy, 1.45, 's', 'k2ts', { burnt: 1, ox: 1 }); for (let i = 0; i < 3; i++) { const k = frac(t * .7 + i / 3); puff(1560 + 30 * i, 820 - 120 * k, 14 + 22 * k, 1 - k, 'k2bs' + i, '#7E7884'); } }
    const twitch = t > L(61, 10.6) && t < L(61, 11.2) ? .05 * Math.sin(t * 40) : 0;
    if (twitch) tumbler(1460, 900, 1.0, 1.45 + twitch, 's', 'k2ts2', { burnt: 1, ox: 1 });
    camEnd();
    flash(1 - seg(lt, 0, .4), PAL.cream);
    flash(seg(t, L(62, -.6), L(62, -.2)), PAL.cream);
  }

  // ================================ K3 · the room under a full moon: a fresh leaf, the narrow path, the cactus blooms (L62 – end) ================================
  function shotK3(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(62, -1), [1060, 560, 1.4]], [L(62, 2.6), [1060, 560, 1.4]], [L(62, 3.4), [1000, 560, 1.15]]], ease);
    camBegin(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    room(t, 'k3', 1.0);
    const bloom = ease(seg(t, L(62, 7.7), L(62, 8.4)));
    cactus(CACT[0], CACT[1], 1, 0, bloom, 'k3c');
    sofa(1110, 742, 1, 'k3s');
    nutBowl(BOWL1[0], BOWL1[1], .85, .9, 'k3b');
    // a toy tightrope from the sofa's right arm to the window frame
    const RA = [1470, 520], RB = [800, 460];
    const walk = seg(t, L(62, 3.4), L(62, 6.8)), px = lerp(RA[0] - 40, RB[0] + 70, ease(walk)), ry = x => lerp(RA[1], RB[1], (RA[0] - x) / (RA[0] - RB[0])) + 18 * Math.sin(clamp((RA[0] - x) / (RA[0] - RB[0])) * Math.PI);
    boilSeed('k3rp'); inkLine([RA, [lerp(RA[0], RB[0], .5), (RA[1] + RB[1]) / 2 + 20], RB], 3.4, '#7E6A4E', 'ink', .4);
    // Pip: the nailed leaf drops, a fresh sprout pops up (L62 +1.0); walks the rope with one nut; bows; yawns (the cactus blooms); winks, waves
    const sprout = L(62, 1.0), grown = ease(seg(t, sprout + .4, sprout + 1.2));
    const onRope = t > L(62, 3.0), P = onRope ? [px, ry(px)] : [1060, 742];
    let o = K.act(t, [[0, 'calm', { lookY: -.6 }], [sprout + .4, 'wow', { lookY: -.9 }], [sprout + 1.3, 'happy'], [L(62, 3.4), 'calm', { lookX: -1 }], [L(62, 7.0), 'happy'], [L(62, 7.6), 'calm'], [L(62, 8.6), 'wink'], [L(62, 9.4), 'wave']]);
    if (t < sprout + .3) o = { ...o };
    else if (t < sprout + 1.2) o = { ...o, leaf: lerp(NOLEAF, 0, grown) };
    if (onRope && walk < 1) o = { ...o, walk: t * 2.2, armF: [.2 + .2 * Math.sin(t * 3), 2.8], armB: [.2 - .2 * Math.sin(t * 3), 2.8], rot: .08 * Math.sin(t * 2.4), flip: true };
    const bow = on(t, L(62, 7.0), L(62, 7.6), .2, .2); if (bow > .02) o = { ...o, rot: -.4 * bow, flip: true };
    const yawn = on(t, L(62, 7.6), L(62, 8.5), .2, .3); if (yawn > .02) o = { ...o, face: 'wow', blink: .85 * yawn, armF: [1.3, 2.4], armB: [1.3, 2.4], flip: true };
    if (t > L(62, 8.5)) o = { ...o, flip: true };
    pip(P[0], P[1], 32, { ...o, noShadow: onRope, key: 'k3pip' });
    if (t < sprout + .1) nailHead(P[0], P[1], 32, o, 'k3n');
    if (t > sprout && t < sprout + 1.0) { const k = seg(t, sprout, sprout + 1.0), hd = headOf(P[0], P[1], 32, o); leafProp(hd[0] + 20 + 60 * k, hd[1] + 180 * k * k, 32, .6 + 2.4 * k, 'k3old', '#9C9A5A', '#6E6B3A'); }
    if (t > sprout + .4 && t < sprout + .9) { const hd = headOf(P[0], P[1], 32, o); K.burst(hd[0], hd[1] - 30, 50, seg(t, sprout + .4, sprout + .9), PAL.cream, 'k3boing'); }
    if (onRope && walk < 1) { const h = handPt(P[0], P[1], 32, o); bnut(h[0], h[1] - 4, 1.2, -.3, 'k3nut'); } else if (t > L(62, 6.8)) { const h = handPt(P[0], P[1], 32, o, 'B'); bnut(h[0], h[1] - 4, 1.2, -.3, 'k3nut2'); }
    if (bloom > .2) K.sparkle(CACT[0], CACT[1] - 180, 40, seg(t, L(62, 8.0), L(62, 8.9)), PAL.cream);
    camEnd();
    flash(1 - seg(lt, 0, .45), PAL.cream);
    const ir = seg(t, L(62, 12.5), L(62, 15.8)); if (ir > 0) { const at = toScreen(P[0], P[1] - 100, LAST_CAM); iris(at[0], at[1], lerp(1500, 0, ease(ir)), PAL.ink); }
  }

  shots([[0, shotA1], [L(3), shotA2], [L(5, -.05), shotB1], [L(7, -.75), shotB2], [L(9, -.35), shotC1], [L(12, -.2), shotC2], [L(15, -.6), shotC3], [L(17, -1.7), shotD1], [L(23, -.65), shotE1], [L(26, -.25), shotE2], [L(29, -1.5), shotF1], [L(32, -.3), shotF2], [L(33, -.6), shotF3], [L(35, -.2), shotF4], [L(36, -.4), shotR1], [L(37, -.3), shotG1], [L(40, -.2), shotH1], [L(44, -.4), shotH2], [L(46, -.2), shotH3], [L(47, -.6), shotI1], [L(49, -.1), shotI2], [L(50, -.25), shotI3], [L(51, -.2), shotI4], [L(52, -.2), shotI5], [L(53, -.2), shotR2], [L(54, -.3), shotJ1], [L(59, -.1), shotK1], [L(61, -.2), shotK2], [L(62, -.2), shotK3]]);
})();

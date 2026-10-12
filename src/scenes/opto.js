// opto.js: "Pip讲光遗传学", 177.5 s. The 2026 Nobel Prize in Physiology or Medicine (Hegemann, Nagel, Deisseroth):
// a pond alga's light-gated channel, channelrhodopsin, becomes a light switch for neurons. Pip starts lost in the brain's
// tangle, meets the alga (Chlamy), who rides along from then on: our eye's slow cascade vs the alga's one-step channel, the
// frog egg and the retinal's isomerisation, rest/threshold/action potential, the neuron in a dish, virus + promoter (the
// "genetic" part), the mouse, the chloride-pump off switch, the clinic, and back to the tangle with Chlamy as its lamp. Props from mrna_kit.js (MK). See STORYBOARD_OPTO.md.
(() => {
  const K = MK, C = MK.C;
  const O = {
    night: '#343A72', nightBlob: '#4E5596', fiber: '#4A5190',
    nA: '#A497DA', nB: '#72BDB4', nC: '#EDBE5C', lit: '#FFF1C2',
    pond: '#7DB797', pondBlob: '#B9DDB0', algaS: '#8CC768', alga: '#7DBE5A', algaDk: '#4E8E3A', eye: '#F28A3A',
    lab: '#CFE5E1', labBlob: '#E9F4F1', out: '#D3EAE8', in: '#8C7590', inDk: '#6F5A76',
    egg: '#EED9B6', eggDk: '#6B4B3E', jelly: '#E4F1EE',
    chr: '#E0637C', chrDk: '#B9465E', ret: '#F4C54A', blue: '#BCD8FF', blueG: '#7DB4FF',
    dish: '#4E4A86', dishBlob: '#625D9E', hero: '#B9ACEA', heroDk: '#7466AE',
    sand: '#EFE0C4', sandBlob: '#F8EEDC', floor: '#E2CDA6', mouse: '#BBB0C8', mouseDk: '#8F84A2', pink: '#EAA3B2',
    dark: '#2C2739', amber: '#F4B860', room: '#F3D9A8', gene: '#6FA85A'
  };
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const pipGlow = (x, y, u, a = .5) => glow(x, y - 2.6 * u, 4.6 * u, '#A898E6', a);
  // Pip acting and swimming; returns the bobbed ground point, the options and the hand helper
  function actor(x, y, u, t, keys, extra = {}, key = 'p', seed = 0) {
    const o = { ...K.act(t, keys, seed), ...extra };
    const yb = K.swim(x, y, u, t, o, key);
    return { yb, o, hand: at => K.hand(x, yb, u, at, { flip: o.flip, dy: o.dy }) };
  }
  function speedLines(k, col, key = 'spd') {                  // whip-pan streaks, screen space
    if (k <= 0) return;
    for (let i = 0; i < 16; i++) {
      boilSeed(key + i);
      const y = hash(i + 200) * H, x0 = hash(i + 201) * (W + 400) - 400, L = (260 + 520 * hash(i + 202)) * k;
      inkLine([[x0, y], [x0 + L, y + 3]], 1.5 + 2 * hash(i + 203), col, 'ink', 0);
    }
  }
  function cloud(cx, cy, rx, ry, k, from, key) {               // a thought cloud with two bubbles back to the thinker
    if (k <= .02) return; boilSeed('cl' + key);
    const q = backOut(k);
    paint(ellPts(lerp(from[0], cx, .25), lerp(from[1], cy, .25), 12 * q, 10 * q, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(ellPts(lerp(from[0], cx, .45), lerp(from[1], cy, .45), 19 * q, 16 * q, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; P.push([cx + Math.cos(a) * rx * q * (1 + .07 * Math.sin(a * 8)), cy + Math.sin(a) * ry * q * (1 + .07 * Math.sin(a * 8))]); }
    paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
  }
  function beam(x0, y0, x1, y1, w0, w1, k, col = O.blue, key = 'bm') {   // a soft wedge of light from (x0, y0) to (x1, y1)
    if (k <= .02) return; boilSeed(key);
    const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
    paint([[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], { fill: col, fillOp: 150 * k, bleed: .12, tex: .3, wash: col, washOp: 90 * k, ink: null });
  }
  function ion(x, y, r, key) {                                 // a cation: a red disc with a cream plus
    boilSeed('ion' + key);
    paint(ellPts(x, y, r, r, 14), { wash: '#E2645A', ink: PAL.ink, sw: .8 });
    paint(rrPts(x - r * .55, y - r * .15, r * 1.1, r * .3, r * .12), { wash: PAL.cream, ink: null });
    paint(rrPts(x - r * .15, y - r * .55, r * .3, r * 1.1, r * .12), { wash: PAL.cream, ink: null });
  }
  function gene(P, key, n = 9, col = O.gene) {                 // a short gene: a chain of green beads (the alga's colour)
    P.slice(0, n).forEach(([x, y], i) => { boilSeed(key + i); paint(ellPts(x, y, 7, 7, 9), { wash: i % 3 ? col : mixCol(col, PAL.cream, .4), ink: PAL.ink, sw: .7 }); });
  }

  // ---------- neurons ----------
  // (x, y) soma; dendrites fan out around a0; o.axon: world points; o.lit 0..1 lights it; o.face: K.face options
  function neuron(x, y, s, t, o = {}) {
    const key = o.key || 'n', lit = clamp(o.lit || 0), sd = o.seed || 0, sw = o.sw ?? 1;
    let col = mixCol(o.col || O.nA, O.lit, .55 * lit);
    if (o.dim) col = mixCol(col, o.dimTo || O.night, o.dim);
    if (lit > .02) glow(x, y, 150 * s * (.6 + .4 * lit), o.glowCol || '#FFDF8A', lit * (o.glowA ?? .9));
    boilSeed(key + 'den');
    const nd = o.nd ?? 5, a0 = o.a0 ?? Math.PI, spr = o.spread ?? .72;
    for (let i = 0; i < nd; i++) {
      const a = a0 + (i - (nd - 1) / 2) * spr + .35 * (hash(sd * 7 + i) - .5), L = (75 + 55 * hash(sd * 7 + i + 3)) * s, P = [];
      for (let k = 0; k <= 4; k++) { const q = k / 4, b = (.5 * (hash(sd + i * 5) - .5) + .05 * wob(t, .15, i * .2 + sd)) * q * 2; P.push([x + Math.cos(a + b) * (24 * s + L * q), y + Math.sin(a + b) * (24 * s + L * q)]); }
      paint(ribbon(P, 15 * s, 3 * s), { wash: col, ink: PAL.ink, sw: .8 * sw });
      const m = P[2], a2 = a + (i % 2 ? .75 : -.75);
      paint(ribbon([m, [m[0] + Math.cos(a2) * 42 * s, m[1] + Math.sin(a2) * 42 * s]], 7 * s, 2 * s), { wash: col, ink: PAL.ink, sw: .7 * sw });
    }
    if (o.axon) {
      boilSeed(key + 'ax');
      const P = [[x, y], ...o.axon];
      paint(ribbon(P, 12 * s, 6 * s), { wash: col, ink: PAL.ink, sw: .8 * sw });
      const e = P[P.length - 1], pe = P[P.length - 2], ang = Math.atan2(e[1] - pe[1], e[0] - pe[0]);
      for (const da of [-.65, 0, .65]) {
        const b = [e[0] + Math.cos(ang + da) * 32 * s, e[1] + Math.sin(ang + da) * 32 * s];
        paint(ribbon([[e[0] - Math.cos(ang) * 4, e[1] - Math.sin(ang) * 4], b], 5 * s, 4 * s), { wash: col, ink: PAL.ink, sw: .7 * sw });
        paint(ellPts(b[0], b[1], 8 * s, 8 * s, 10), { wash: col, ink: PAL.ink, sw: .7 * sw });
      }
    }
    boilSeed(key + 'soma');
    const r = 34 * s, P = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; P.push([x + Math.cos(a) * r * (1 + .06 * Math.sin(a * 3 + sd)), y + Math.sin(a) * r * .9 * (1 + .05 * Math.cos(a * 2 + t * 1.2))]); }
    paint(P, { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 50, tex: .5, ink: PAL.ink, sw, curv: .3 });
    if (!o.face) paint(ellPts(x - 4 * s, y + 3 * s, 12 * s, 10 * s, 12), { fill: mixCol(col, PAL.ink, .3), fillOp: 120, bleed: .1, ink: null });
    if (o.extras) o.extras(r);
    if (o.face) K.face(x + 3 * s, y - 2 * s, r * .55, t, o.face);
  }
  function spikeBead(Tk, k, s = 1, key = 'sp') {               // an action potential: a bright bead running down the axon
    if (k <= 0 || k >= 1) return;
    const [x, y] = Tk.at(k * Tk.L); glow(x, y, 70 * s, '#FFE08A', 1);
    boilSeed(key); paint(ellPts(x, y, 10 * s, 10 * s, 10), { wash: '#FFE6A0', ink: PAL.ink, sw: .8 });
  }

  // the tangle (shots A and G). Five gold cells form the circuit g0 → g4; the rest is the crowd.
  const NET = [
    { x: 760, y: 380, s: 1, c: 'nC', a0: 2.23, ax: [[900, 330], [1010, 280]] },
    { x: 1180, y: 250, s: 1, c: 'nC', a0: Math.PI, ax: [[1320, 300], [1420, 380]] },
    { x: 1580, y: 440, s: 1.05, c: 'nC', a0: -2.78, ax: [[1650, 560], [1680, 640]] },
    { x: 1700, y: 790, s: 1, c: 'nC', a0: -1.7, ax: [[1590, 870], [1480, 900]] },
    { x: 1300, y: 920, s: .95, c: 'nC', a0: -.11, ax: [[1150, 960], [1020, 1040]] },
    { x: 280, y: 200, s: .9, c: 'nA', a0: -.4, ax: [[380, 330], [460, 480], [470, 600]] },
    { x: 1020, y: 620, s: 1.1, c: 'nB', a0: Math.PI, ax: [[1150, 760], [1320, 760], [1450, 690]] },
    { x: 120, y: 620, s: 1, c: 'nB', a0: -.5, ax: [[60, 820], [-60, 900]] },
    { x: 440, y: 1060, s: 1, c: 'nA', a0: -1.2, ax: [[600, 1000], [800, 1080]] },
    { x: 2000, y: 300, s: 1, c: 'nA', a0: Math.PI, ax: [[1900, 160], [1750, 100]] },
    { x: 1420, y: 60, s: 1, c: 'nB', a0: Math.PI / 2, ax: [[1300, 120], [1150, 90], [1000, 120]] },
    { x: 2050, y: 980, s: 1, c: 'nB', a0: Math.PI, ax: [[1950, 1100], [1800, 1180]] },
    { x: -150, y: 300, s: 1, c: 'nA', a0: 0, ax: [[0, 380], [120, 420]] },
    { x: 600, y: -60, s: 1, c: 'nA', a0: Math.PI / 2, ax: [[720, 60], [860, 120]] },
    { x: 960, y: 1200, s: 1, c: 'nA', a0: -Math.PI / 2, ax: [[1100, 1150], [1200, 1200]] }
  ].map((n, i) => ({ ...n, i, T: K.track([[n.x, n.y], ...n.ax], 8) }));
  const flick = (t, i) => { const f = frac(t * (.28 + .3 * hash(i + 40)) + hash(i + 41)); return f < .1 ? Math.sin(f / .1 * Math.PI) : 0; };
  function tangle(t, litOf, o = {}) {
    K.wash(O.night, t, { key: 'tg', blob: O.nightBlob });
    // the crowd of fibres behind, low contrast: there is far more of it than we can show
    for (let i = 0; i < 16; i++) {
      boilSeed('fb' + i);
      const y0 = -200 + hash(i + 60) * 1500, P = []; for (let j = 0; j <= 6; j++) P.push([-500 + j * 500, y0 + 170 * Math.sin(j * 1.1 + i * 2.3) + 10 * wob(t, .04, i * .1)]);
      const Cv = through(P, 6); for (let j = 0; j + 1 < Cv.length; j += 12) inkLine(Cv.slice(j, j + 13), 1.6, O.fiber, 'inkfine', .5);
    }
    K.motes(t, 18, mixCol(O.night, O.nA, .35), { key: 'tg' });
    NET.forEach(n => neuron(n.x, n.y, n.s, t, { key: 'net' + n.i, seed: n.i + 1, col: O[n.c], a0: n.a0, axon: n.ax, lit: litOf(n.i), dim: o.dim ? o.dim(n.i) : 0, dimTo: O.night }));
  }
  const switchIcon = (x, y, s, on, key) => {                    // a wall switch: a plate and a toggle (no lettering)
    boilSeed('sw' + key);
    paint(rrPts(x - 34 * s, y - 52 * s, 68 * s, 104 * s, 14 * s), { wash: '#F4EBDD', ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x - 12 * s, y - 30 * s, 24 * s, 60 * s, 8 * s), { wash: mixCol('#F4EBDD', PAL.ink, .25), ink: PAL.ink, sw: .8 });
    const ty = lerp(12, -12, on) * s;
    paint(rrPts(x - 10 * s, y + ty - 14 * s, 20 * s, 28 * s, 7 * s), { wash: on > .5 ? O.nC : PAL.cream, ink: PAL.ink, sw: .9 });
  };

  function algaMini(x, y, r, ang, t, sd, key) {
    boilSeed(key);
    push(); translate(x, y); rotate(ang);
    const ph = .5 + .5 * Math.sin(t * 7 + sd * 2);
    for (const s of [-1, 1]) { const a = s * (.35 + 1.4 * ph); inkLine([[r * 1.05, 0], [r * 1.05 + Math.cos(a * .5) * r * .7, Math.sin(a * .5) * r * .7], [r * 1.05 + Math.cos(a) * r * 1.4, Math.sin(a) * r * 1.4]], .9, O.algaDk, 'inkfine', .6); }
    paint(ellPts(0, 0, r * 1.15, r * .92, 14), { wash: O.algaS, ink: PAL.ink, sw: .6 });
    paint(ellPts(-r * .35, 0, r * .6, r * .7, 10), { fill: O.algaDk, fillOp: 120, bleed: .05, ink: null });
    paint(ellPts(r * .3, -r * .72, r * .17, r * .12, 8), { wash: O.eye, ink: null });
    pop();
  }
  // Chlamy, the hero alga: an ovoid cell, cup-shaped chloroplast with its pyrenoid, two flagella up front (breaststroke),
  // and the orange eyespot on its side. Faces the way it swims (ang). Returns the eyespot's world point.
  function chlamy(x, y, r, ang, t, o = {}) {
    const key = o.key || 'ch', zap = clamp(o.zap || 0);
    if (o.glowCol) glow(x, y, r * 3.2, o.glowCol, o.glowA ?? .8);
    boilSeed(key + 'fl');
    push(); translate(x, y); rotate(ang);
    const ph = .5 + .5 * Math.sin(t * 6.5);
    for (const s of [-1, 1]) { const a = s * (.3 + 1.5 * ph); inkLine([[r * 1.05, s * r * .08], [r * 1.05 + Math.cos(a * .45) * r * .8, s * r * .08 + Math.sin(a * .45) * r * .8], [r * 1.05 + Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6]], clamp(r / 50, 1, 2.4), O.algaDk, 'ink', .6); }
    boilSeed(key + 'bd');
    paint(ellPts(0, 0, r * 1.15, r * .92, 26, 0), { wash: O.alga, fill: O.algaDk, fillOp: 40, tex: .5, ink: PAL.ink, sw: clamp(r / 80, .8, 1.5), curv: .3 });
    const cup = []; for (let i = 0; i <= 14; i++) { const a = Math.PI * .45 + i / 14 * Math.PI * 1.1; cup.push([Math.cos(a) * r * .95, Math.sin(a) * r * .74]); }
    paint(ribbon(cup, r * .42, r * .42), { fill: O.algaDk, fillOp: 140, bleed: .06, tex: .4, ink: null });
    paint(ellPts(-r * .58, r * .05, r * .2, r * .2, 12), { wash: mixCol(O.algaDk, PAL.ink, .2), ink: null });   // pyrenoid
    const hi = clamp(o.hi || 0), es = [r * .32, -r * .74];
    paint(ellPts(es[0], es[1], r * .2 * (1 + .25 * hi), r * .13 * (1 + .25 * hi), 12), { wash: mixCol(O.eye, PAL.cream, .3 * hi), ink: PAL.ink, sw: clamp(r / 120, .5, 1) });
    pop();
    const ex = x + es[0] * Math.cos(ang) - es[1] * Math.sin(ang), ey = y + es[0] * Math.sin(ang) + es[1] * Math.cos(ang);
    if (hi > .02) { boilSeed(key + 'hi'); const q = frac(t * 1.3); inkLine(ellPts(ex, ey, r * (.3 + .4 * q), r * (.24 + .3 * q), 18), 2.2 * (1 - q) * hi + .1, O.eye, 'ink', .5); }
    if (o.face) K.face(x + Math.cos(ang) * r * .3, y + Math.sin(ang) * r * .3 + r * .05, r * .42, t, { blush: true, ...o.face });
    if (zap > 0) {                                              // the electrical response: a ring round the membrane, bolts
      boilSeed(key + 'zp');
      const q = 1 + .12 * zap;
      const ring = ellPts(x, y, r * 1.15 * q + 14, r * .92 * q + 14, 28); inkLine(ring.concat([ring[0]]), 4.5 * zap, '#F6CF45', 'ink', .5);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, r0 = r * 1.3 + 10, P = []; for (let k = 0; k < 4; k++) P.push([x + Math.cos(a) * (r0 + k * 14 * zap) + (k % 2 ? 8 : -8) * Math.sin(a), y + Math.sin(a) * (r0 + k * 14 * zap) - (k % 2 ? 8 : -8) * Math.cos(a)]); inkLine(P, 3 * zap, '#F6CF45', 'ink', 0); }
    }
    return [ex, ey];
  }
  // retinal: a β-ionone ring and a polyene zigzag running left from it to the lysine. kink 0..1 bends the chain near the
  // lysine end: all-trans → 13-cis. (x, y) = the lysine end; s scales it.
  function retinal(x, y, s, kink, key) {
    boilSeed('ret' + key);
    const B = [[24, 0], [20, -4], [16, 0], [12, -4], [8, 0], [4, -4], [0, 0]], a = .95 * kink, c = Math.cos(a), sn = Math.sin(a);
    const P = B.map(([bx, by], i) => { if (i <= 4) return [x + bx * s, y + by * s]; const dx = bx - 8, dy = by; return [x + (8 + dx * c - dy * sn) * s, y + (dx * sn + dy * c) * s]; });
    inkLine(P, Math.max(.7, .9 * s / 1.25), '#B5841C', 'inkfine', 0);
    P.forEach(([px, py], i) => paint(ellPts(px, py, 1.6 * s, 1.6 * s, 8), { wash: i === 6 ? '#7FA0D8' : O.ret, ink: null }));
    const R = []; for (let i = 0; i < 6; i++) { const t = i / 6 * TAU; R.push([x + (29 + 5 * Math.cos(t)) * s, y + (-1 + 5 * Math.sin(t)) * s]); }
    paint(R, { wash: mixCol(O.ret, PAL.cream, .3), ink: '#B5841C', sw: Math.max(.6, .8 * s / 1.25) });
  }
  // a membrane protein, side view: two halves around a pore. Channelrhodopsin-2 by default (rose, all-trans retinal inside);
  // o.col/o.dk recolour it for other channels. open 0..1 parts the halves; kink 0..1 isomerises the retinal (all-trans →
  // 13-cis), null = no retinal; o.bend 0..1 tilts the helices (the conformational change); hi 0..1 lightens; k pops it in.
  function chr(x, y, s, open, kink, hi, k, key, o = {}) {
    if (k <= .03) return;
    const q = backOut(k), g = 3 * s + 14 * s * ease(open), dk = o.dk || O.chrDk, col = mixCol(o.col || O.chr, PAL.cream, .3 * hi), bend = (o.bend || 0) * .12;
    boilSeed('chr' + key);
    push(); translate(x, y); scale(q);
    if (open > .05) paint(rrPts(-g, -48 * s, 2 * g, 96 * s, g * .8), { wash: o.pore || mixCol(O.out, O.in, .3), ink: null });   // the water-filled pore
    for (const sd of [-1, 1]) {
      push(); rotate(sd * bend);
      const x0 = sd > 0 ? g : -g - 36 * s;
      paint(rrPts(x0, -54 * s, 36 * s, 108 * s, 13 * s), { wash: sd > 0 ? col : mixCol(col, dk, .25), fill: dk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1 });
      for (let j = 1; j < 3; j++) inkLine([[x0 + j * 12 * s, -46 * s], [x0 + j * 12 * s + 2, 0], [x0 + j * 12 * s, 46 * s]], .7, dk, 'inkfine', .5);
      pop();
    }
    if (kink !== null) {                                        // the retinal: a polyene chain across the right half
      push(); rotate(bend);
      retinal(g + 2 * s, 2 * s, s * .95, kink, key);
      pop();
    }
    pop();
    if (kink !== null && (kink > .1 || o.retGlow)) glow(x + (g + 18 * s) * q, y, 50 * s, '#FFE7A0', Math.max(.6 * kink, o.retGlow || 0));
  }
  const MS = [1000, 860], S = 1.3;
  const AW = [[-250, -40], [-230, -130], [-140, -195], [-20, -210], [100, -190], [175, -160], [235, -125], [290, -85], [335, -58], [342, -40], [320, -24], [270, -14], [200, -5], [80, 0], [-60, 0], [-190, -5]];
  const SL = [[-230, -30], [-210, -120], [-120, -175], [-10, -185], [100, -170], [180, -130], [228, -84], [250, -48], [252, -22], [240, -8], [215, -2], [180, 0], [80, 0], [-60, 0], [-180, -4], [-225, -12]];
  // a side-view lab mouse facing right. o: sleep 0..1, fear 0..1, whisk (swing), light 0..1, fy (fibre drop 0..1), blink
  function mouse(t, o = {}) {
    const sl = ease(o.sleep || 0), fear = o.fear || 0, sh = fear * 3 * Math.sin(t * 55), [mx, my] = [MS[0] + sh, MS[1] + (o.dy || 0)];
    const M = ([a, b]) => [mx + a * S, my + b * S], mixP = (a, b) => [lerp(a[0], b[0], sl), lerp(a[1], b[1], sl)];
    const sniff = (1 - sl) * (1 - fear) * (1 - (o.still || 0)) * 3 * Math.sin(t * 9);
    auditBox('mouse', 'm', mx - 260 * S, my - 210 * S, mx + 345 * S, my);
    boilSeed('mtail'); paint(ribbon([[-230, -30], [-340, -10], [-430, -55], [-460, -125 + 20 * wob(t, .3)]].map(p => M(mixP(p, [p[0] * .85 + 20, p[1] + 20]))), 18, 5), { wash: mixCol(O.pink, O.mouse, .4), ink: PAL.ink, sw: 1 });
    boilSeed('mfeet'); for (const fx of [-150, 215]) paint(ellPts(...M([fx - sl * 20, -6]), 30, 12, 12), { wash: O.pink, ink: PAL.ink, sw: .9 });
    boilSeed('mbody'); const B = AW.map((p, i) => M(mixP(p, SL[i]))).map(([x, y], i) => i >= 6 && i <= 11 ? [x + sniff * .5, y + sniff * .3] : [x, y]);
    if (fear > .05) { boilSeed('mfur'); for (let i = 1; i < 6; i++) { const p = B[i], n = B[i + 1], a = Math.atan2(n[1] - p[1], n[0] - p[0]) - Math.PI / 2; for (let k = 0; k < 3; k++) { const q = [lerp(p[0], n[0], k / 3), lerp(p[1], n[1], k / 3)]; inkLine([q, [q[0] + Math.cos(a) * 18 * fear, q[1] + Math.sin(a) * 18 * fear]], 1.2, PAL.ink, 'ink', 0); } } }
    boilSeed('mbody2'); paint(B, { wash: O.mouse, fill: O.mouseDk, fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.3, curv: .5 });
    paint(ellPts(...M(mixP([20, -50], [10, -45])), 150 * S, 40 * S, 18), { wash: mixCol(O.mouse, PAL.cream, .35), ink: null });   // belly
    const H = p => M(mixP(p, [p[0] - 75, p[1] + 30]));                                // head features ride the head
    boilSeed('mear'); const ep = H([95, -182]); paint(ellPts(ep[0], ep[1], 46 * S, 52 * S, 18, 0, -.3), { wash: O.mouse, ink: PAL.ink, sw: 1.1 }); paint(ellPts(ep[0] + 4, ep[1] + 4, 30 * S, 36 * S, 14, 0, -.3), { wash: O.pink, ink: null });
    // the brain, shown through the head; the fibre comes down onto it
    const bw = H([185, -160]), lt = o.light || 0, yel = o.lcol === 'y', LC = yel ? { win: '#FFE7A8', glow: '#FFC24A', fib: '#FFD98A' } : { win: '#CFE0FF', glow: O.blueG, fib: O.blue };
    boilSeed('mbrain'); paint(ellPts(bw[0], bw[1], 44 * S, 26 * S, 18, 0, .15), { wash: mixCol('#F4C9C9', LC.win, lt), ink: mixCol(PAL.ink, O.mouse, .3), sw: .8 });
    for (let i = 0; i < 5; i++) { const p = [bw[0] + (i - 2) * 14 * S, bw[1] + (i % 2 ? 7 : -5) * S]; paint(ellPts(p[0], p[1], 6, 6, 8), { wash: i % 2 ? O.nA : mixCol(O.nC, '#FFD34A', yel ? 0 : lt), ink: null }); }
    if (lt > .02) glow(bw[0], bw[1], 80, LC.glow, .7 * lt);
    const fy = o.fy ?? 1, tipY = bw[1] - 18 * S - (1 - ease(fy)) * 600;
    boilSeed('mfib'); paint(ribbon([[bw[0], tipY - 1200], [bw[0], tipY]], 11, 11), { wash: lt > .2 ? mixCol('#F3F0F7', LC.fib, lt) : '#F3F0F7', ink: PAL.ink, sw: .9 });
    paint(rrPts(bw[0] - 14, tipY - 40, 28, 40, 6), { wash: '#A8A3B4', ink: PAL.ink, sw: .9 });
    // eye, nose, whiskers
    const eye = H([275, -98]); boilSeed('meye');
    if (sl > .5 || (o.blink || 0) > .6) inkLine([[eye[0] - 13, eye[1]], [eye[0], eye[1] + 7], [eye[0] + 13, eye[1]]], 1.6, PAL.ink, 'ink', .6);
    else if (fear > .3) { paint(ellPts(eye[0], eye[1], 15, 17, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 }); paint(ellPts(eye[0] + 3, eye[1], 5, 6, 8), { wash: PAL.ink, ink: null }); }
    else { paint(ellPts(eye[0], eye[1], 11, 13, 12), { wash: PAL.ink, ink: null }); paint(ellPts(eye[0] + 4, eye[1] - 5, 3.5, 3.5, 8), { wash: PAL.cream, ink: null }); }
    const nose = H([340, -50]); boilSeed('mnose'); paint(ellPts(nose[0] + sniff, nose[1], 10, 8, 10), { wash: '#D9788E', ink: PAL.ink, sw: .8 });
    boilSeed('mwh'); const wr = H([318, -42]);
    [-.35, -.05, .25].forEach((a0, i) => { const a = a0 + (o.whisk || 0) * (i === 1 ? 1 : .8) + .05 * Math.sin(t * 9 + i) * (1 - sl); const L = 120 - i * 10; inkLine([wr, [wr[0] + Math.cos(a) * L * .5, wr[1] + Math.sin(a) * L * .5 - 4], [wr[0] + Math.cos(a) * L, wr[1] + Math.sin(a) * L]], 1.1, PAL.ink, 'inkfine', .5); });
    return { head: H([250, -150]), brain: bw, back: [mx - 110, my + lerp(-206, -184, sl) * S] };
  }
  // =========================== A: the tangle (0–25) ===========================
  const PA = [700, 800], UA = 32, POKE = 6;
  function shotA(t, lt, dur) {
    const c = kf(t, [[0, [700, 600, 1.45]], [1.0, [700, 600, 1.45]], [4.4, [960, 540, .78]], [8.9, [960, 540, .8]], [9.7, [830, 620, 1.12]], [11.3, [830, 620, 1.12]], [12.4, [960, 470, 1.0]], [25, [960, 470, 1.04]]], ease);
    cam(c[0] + 8 * wob(t, .05), c[1] + 6 * wob(t, .04), c[2]);
    const chaos = i => i === POKE ? Math.exp(-Math.pow((t - 10.45) / .18, 2)) : Math.exp(-Math.pow((t - 10.6 - hash(i + 9) * .7) / .12, 2)) * (hash(i + 3) > .35 ? 1 : 0);
    tangle(t, i => Math.max(.85 * flick(t, i), chaos(i)));
    // Pip: looks around, pokes one cell, gets chaos, dreams of a switch
    const px = kf(t, [[0, PA[0]], [9.7, PA[0]], [10.15, PA[0] + 70], [11.2, PA[0] + 70], [12.0, PA[0]]], ease);
    pipGlow(px, PA[1], UA);
    let keys = [[0, 'calm', { lookX: .3 }], [2.1, 'wow', { lookX: -.6, lookY: -.5 }], [5.7, 'confused'], [7.3, 'confused', { lookX: .8, rot: -.1 }], [9.6, 'calm', { lookX: 1, lookY: -.3 }],
      [10.55, 'worried', { take: .8 }], [12.0, 'idea', { lookX: .8, lookY: -.8 }], [14.9, 'wow', { lookX: .9, lookY: -.8, emote: null }], [18.35, 'excited'], [21.6, 'laugh'], [23.4, 'happy']];
    const extra = t > 9.8 && t < 10.6 ? { armF: { at: [3.1, -2.7] } } : {};
    const P = actor(px, PA[1], UA, t, keys, extra, 'pa');
    // the dream: a switch that lights only one kind of cell
    const ck = seg(t, 11.9, 12.35), CX = 1150, CY = 330;
    cloud(CX, CY, 250, 165, ck, [px + 60, P.yb - 6 * UA], 'a');
    const q = backOut(seg(t, 12.2, 12.6));
    if (ck > .5 && q > .05) {
      const on = ease(seg(t, 14.9, 15.05));
      switchIcon(CX - 110, CY + 5, 1.2 * q, on, 'a');
      neuron(CX + 70, CY - 55, .6 * q, t, { key: 'cg', seed: 21, col: O.nC, a0: Math.PI, lit: on * (.75 + .25 * Math.sin(t * 6)), glowA: .6 });
      neuron(CX + 110, CY + 75, .55 * q, t, { key: 'ca', seed: 22, col: O.nA, a0: Math.PI * .8 });
      if (t > 14.95 && t < 15.6) K.sparkle(CX + 60, CY - 90, 36, seg(t, 14.95, 15.6), '#FFF3C4');
      // the medal drops onto the switch
      const mk = seg(t, 17.6, 18.3), my = lerp(CY - 560, CY - 40, easeIn(mk)) + 10 * spring(t, 18.3, 5, 16);
      if (t > 17.6) { K.medal(CX - 185, my + 95, 1.0, t, 1, 'a'); }
      if (t > 18.3 && t < 19.1) K.sparkle(CX - 80, CY - 10, 60, seg(t, 18.3, 19.1), '#FFF3C4');
    }
    const at = toScreen(px, PA[1] - 2.8 * UA);
    camEnd();
    if (lt < .8) iris(at[0], at[1], kf(lt, [[0, 0], [.15, 190], [.38, 210], [.8, 1700]], easeIn));
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#5E9A7E', O.pond]);
  }

  // =========================== F: the clinic (119.5–134) ===========================
  const EYE = [900, 540], ER = 330;
  const RET = Array.from({ length: 13 }, (_, i) => { const a = -1.05 + i / 12 * 2.1; return { a, x: EYE[0] + Math.cos(a) * (ER - 60), y: EYE[1] + Math.sin(a) * (ER - 60) }; });
  function clinic(t, lt, dur) {
    if (t < 125.7) {
      cam(900 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.0 + .015 * (t - 119.5));
      K.wash(O.dark, t, { key: 'fd', blob: '#3C3550' });
      boilSeed('cornea'); paint(ellPts(EYE[0] - ER + 20, EYE[1], 80, 190, 24), { wash: '#D9E6EE', ink: PAL.ink, sw: 1.1 });
      boilSeed('ball'); paint(ellPts(EYE[0], EYE[1], ER, ER, 48), { wash: '#F2E6D8', fill: '#E4D2C2', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1.5 });
      paint(ellPts(EYE[0], EYE[1], ER - 20, ER - 20, 44), { wash: '#ECE4EE', ink: null });
      boilSeed('nerve'); paint(ribbon([[EYE[0] + ER - 30, EYE[1]], [EYE[0] + ER + 160, EYE[1] + 20], [EYE[0] + ER + 420, EYE[1] + 80], [EYE[0] + ER + 900, EYE[1] + 120]], 70, 56), { wash: '#E8C9A0', ink: PAL.ink, sw: 1.2 });
      boilSeed('iris'); for (const sd of [-1, 1]) paint(rrPts(EYE[0] - ER + 2, EYE[1] + sd * 70 - (sd > 0 ? 0 : 60), 26, 60, 10), { wash: '#6E8FB3', ink: PAL.ink, sw: .9 });
      boilSeed('lens'); paint(ellPts(EYE[0] - ER + 70, EYE[1], 42, 100, 20), { wash: '#F7F3EA', ink: PAL.ink, sw: 1 });
      const ret = []; for (let i = 0; i <= 24; i++) { const a = -1.15 + i / 24 * 2.3; ret.push([EYE[0] + Math.cos(a) * (ER - 38), EYE[1] + Math.sin(a) * (ER - 38)]); }
      boilSeed('ret'); paint(ribbon(ret, 46, 46), { wash: '#E9B4AE', ink: PAL.ink, sw: 1 });
      // the rods and cones are gone: grey stubs where they stood
      for (let i = 0; i < 22; i++) { const a = -1.1 + i / 21 * 2.2, r0 = ER - 22; boilSeed('stub' + i); inkLine([[EYE[0] + Math.cos(a) * r0, EYE[1] + Math.sin(a) * r0], [EYE[0] + Math.cos(a) * (r0 - 12), EYE[1] + Math.sin(a) * (r0 - 12)]], 3, '#A69AA6', 'ink', 0); }
      // light from the goggles, through the pupil, onto the retina
      const LK = seg(t, 124.1, 124.4);
      if (LK > 0) { beam(EYE[0] - ER - 400, EYE[1], EYE[0] + ER - 70, EYE[1], 40, 180, LK * .9, '#FFD58A', 'gl'); }
      RET.forEach((c, i) => {
        const gk = seg(t, 121.9 + i * .1, 122.25 + i * .1), on = LK * (Math.abs(c.a) < .75 ? 1 : 0);
        boilSeed('rgc' + i);
        paint(ellPts(c.x, c.y, 17, 17, 12), { wash: on ? mixCol('#C9A3C4', '#FFE2A0', .7) : '#C9A3C4', ink: PAL.ink, sw: .8 });
        if (gk > 0) { const q = backOut(gk); for (const d of [-1, 1]) paint(ellPts(c.x + Math.cos(c.a + d * 1.4) * 17, c.y + Math.sin(c.a + d * 1.4) * 17, 6 * q, 6 * q, 8), { wash: O.amber, ink: PAL.ink, sw: .5 }); }
        if (gk > 0 && gk < 1) K.sparkle(c.x - 20, c.y - 20, 22, gk, '#FFF3C4');
        if (on && t > 124.4 && t < 125.1) K.burst(c.x, c.y, 34, seg(t, 124.4, 125.1), '#E9A93A', 'rb' + i);
      });
      if (LK > 0) { const NT = K.track([[EYE[0] + ER - 30, EYE[1]], [EYE[0] + ER + 160, EYE[1] + 20], [EYE[0] + ER + 420, EYE[1] + 80], [EYE[0] + ER + 900, EYE[1] + 120]]); for (let i = 0; i < 4; i++) spikeBead(NT, seg(t, 124.4 + i * .25, 125.5 + i * .25), 1.3, 'ns' + i); }
      camEnd();
      if (lt < .3) brushWipe(.5 + lt / .6, [O.dark, '#4A3F5C']);
      if (t > 125.3) flash(seg(t, 125.3, 125.7), PAL.cream);
      return;
    }
    // Pip in the dark; goggles; the room comes back
    const lit = ease(seg(t, 127.0, 128.4));
    cam(1080 + 6 * wob(t, .05), 660 + 4 * wob(t, .04), 1.32);
    K.wash(mixCol(O.dark, O.room, lit), t, { key: 'fr', blob: mixCol('#3C3550', '#FBE9C4', lit) });
    if (lit > .02) glow(980, 520, 900, '#FFD58A', lit * .7);
    const tc = mixCol('#3E3650', '#C98F5A', lit), td = mixCol('#352E45', '#A8703F', lit);
    boilSeed('table'); paint(rrPts(1120, 760, 560, 40, 10), { wash: tc, ink: PAL.ink, sw: 1.1 });
    for (const lx of [1160, 1610]) paint(rrPts(lx, 795, 30, 300, 6), { wash: td, ink: PAL.ink, sw: 1 });
    const app = [1520, 722]; boilSeed('apple'); paint(ellPts(app[0], app[1], 40, 38, 18), { wash: mixCol('#4A3A4E', '#D9534A', lit), ink: PAL.ink, sw: 1 }); inkLine([[app[0], app[1] - 36], [app[0] + 6, app[1] - 56]], 2, PAL.ink, 'ink', 0); paint(ellPts(app[0] + 22, app[1] - 52, 14, 7, 10, 0, -.4), { wash: mixCol('#3E3650', PIPC.leaf, lit), ink: PAL.ink, sw: .7 });
    // Pip shuffles to the table and picks up the cup
    const px = kf(t, [[125.7, 760], [128.5, 760], [129.6, 1000]], ease);
    const keys = [[125.7, 'worried', { lookX: -.6 }], [126.7, 'wow', { take: .7 }], [128.0, 'wow', { lookX: .9 }], [128.5, 'happy'], [130.4, 'love'], [132.2, 'laugh']];
    const grab = seg(t, 129.6, 130.0), lift = ease(seg(t, 130.0, 130.5));
    const arm = t > 129.3 ? { armF: { at: [lerp(2.0, 2.8, ease(seg(t, 129.3, 129.6))), lerp(-2.0, -3.6, lift)] }, armsFront: false } : {};
    const glK = backOut(seg(t, 126.0, 126.5)), glOn = seg(t, 126.8, 127.1);
    const over = (u, sw, fx) => { if (glK <= .02) return; const yy = -3.35 * u - (1 - clamp(seg(t, 126.0, 126.3))) * 3 * u;
      boilSeed('gog'); paint(rrPts(-1.9 * u, yy - .22 * u, 3.8 * u, .44 * u, .2 * u), { wash: '#4E4860', ink: PAL.ink, sw: sw * .8 });
      for (const sd of [-1, 1]) paint(ellPts(fx + sd * .66 * u, yy, .62 * u * glK, .55 * u * glK, 16), { wash: mixCol('#7A6E8C', '#FFD58A', glOn), ink: PAL.ink, sw: sw * .9 }); };
    const P = duo(px, 900, 34, t, keys, { ...arm, over }, 'pf');
    if (glOn > 0) { const gp = [px + .3 * 34 + .15 * 34, P.yb - 3.35 * 34 + (P.o.dy || 0) * 34]; glow(gp[0], gp[1], 140, '#FFC46A', glOn * (1 - .6 * lit)); }
    const cup0 = [1260, 704], hp = P.hand(arm.armF ? arm.armF.at : [2, -2]);
    const cp = t < 129.95 ? cup0 : [lerp(cup0[0], hp[0] + 14, grab), lerp(cup0[1], hp[1] + 6, grab)];
    boilSeed('cup'); paint(rrPts(cp[0] - 34, cp[1] - 50, 68, 74, 12), { wash: mixCol('#45405A', '#7FB6E0', lit), ink: PAL.ink, sw: 1.1 });
    paint(ellPts(cp[0] + 42, cp[1] - 14, 14, 18, 12), { wash: null, ink: PAL.ink, sw: 2.2 });
    if (t > 130.0 && t < 130.8) K.sparkle(cp[0], cp[1] - 70, 46, seg(t, 130.0, 130.8), '#FFF3C4');
    camEnd();
    if (t < 126.1) flash(1 - seg(t, 125.7, 126.1), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [O.night, '#6F7FC8']);
  }

  // =========================== G: the tangle, lit (134–150) ===========================
  const CHAIN = [[137.6, 0], [140.0, 1], [140.6, 2], [141.2, 3], [141.8, 4]];
  function finale(t, lt, dur) {
    const c = kf(t, [[134, [880, 560, 1.06]], [137.0, [880, 560, 1.06]], [139.6, [1060, 570, .86]], [146.5, [1040, 570, .88]]], ease);
    cam(c[0] + 8 * wob(t, .05), c[1] + 6 * wob(t, .04), c[2]);
    const fire = i => { const e = CHAIN.find(cn => cn[1] === i); if (!e || t < e[0]) return 0; return clamp(.75 + .25 * Math.sin((t - e[0]) * 5)); };
    const dimAll = ease(seg(t, 137.2, 138.2));
    tangle(t, i => i < 5 ? Math.max(fire(i), (1 - dimAll) * .85 * flick(t, i)) : (1 - dimAll) * .85 * flick(t, i), { dim: i => i < 5 ? 0 : .45 * dimAll });
    CHAIN.slice(0, 4).forEach(([t0, i], j) => { const nx = CHAIN[j + 1][0]; spikeBead(NET[i].T, seg(t, nx - .55, nx), 1.1, 'gs' + j); });
    if (t > 142.2) CHAIN.slice(0, 4).forEach(([t0, i], j) => spikeBead(NET[i].T, frac((t - 142.2) / 1.25 + j * .13), 1, 'gl' + j));
    // Pip comes home with Chlamy, its lamp
    const pp = kf(t, [[136.15, [-80, 820]], [137.3, [420, 820]]], ease);
    pipGlow(pp[0], pp[1], 32);
    const keys = [[134, 'happy'], [137.0, 'calm', { lookX: .8, lookY: -.8 }], [139.4, 'wow', { lookX: .9, lookY: -.7 }], [142.5, 'excited'], [144.0, 'laugh'], [144.8, 'wave']];
    actor(pp[0], pp[1], 32, t, keys, {}, 'pg');
    const al = [pp[0] + 150 + 14 * wob(t, .4), pp[1] - 190 + 12 * wob(t, .33, .2)], spin = t > 142.5 ? (t - 142.5) * 4 * (1 - seg(t, 145, 146)) : 0;
    const shine = ease(seg(t, 137.2, 137.6));
    beam(al[0] + 20, al[1] - 20, NET[0].x - 10, NET[0].y + 30, 18, 70, shine * (1 - .3 * seg(t, 142, 144)), O.blue, 'gb');
    chlamy(al[0], al[1], 52, -.95 + spin, t, { key: 'gch', glowCol: O.blueG, glowA: .7 + .3 * shine, face: { mood: t > 142.5 ? 'happy' : 'calm', lx: .7, ly: -.7, seed: 5 } });
    if (t > 137.6 && t < 138.4) K.sparkle(NET[0].x, NET[0].y - 60, 50, seg(t, 137.6, 138.4), '#FFF3C4');
    const at = toScreen(pp[0] + 60, pp[1] - 3.4 * 32);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [O.night, '#6F7FC8']);
    if (t > 144.9) iris(at[0], at[1], kf(t, [[144.9, 1700], [145.8, 300], [146.3, 270], [146.9, 0]], ease));
  }


  // ---------- Chlamy rides along: Pip's companion from the pond on ----------
  const budMood = f => ['wow', 'star', 'idea'].includes(f) ? 'wow' : ['happy', 'laugh', 'love', 'wink', 'smug'].includes(f) ? 'happy' : f === 'sad' ? 'sad' : 'calm';
  function duo(x, y, u, t, keys, extra = {}, key = 'p', bud = {}) {
    const P = actor(x, y, u, t, keys, extra, key), dir = P.o.flip ? -1 : 1;
    const bx = x - dir * 3.2 * u + (bud.dx || 0), by = P.yb - 4.7 * u + 7 * Math.sin(t * 1.7 + 1) + (bud.dy || 0);
    chlamy(bx, by, bud.r || u * 1.0, (P.o.flip ? Math.PI : 0) + .12 * Math.sin(t * 1.3), t, { key: key + 'b', glowCol: bud.glow, glowA: bud.glowA,
      face: { mood: bud.mood || budMood(P.o.face), lx: dir * .6, ly: .2, seed: 4 } });
    P.bud = [bx, by];
    return P;
  }

  // ---------- electrophysiology: charges, the membrane, the voltage trace ----------
  function anion(x, y, r, col, key) {                          // an anion: a disc with a cream minus
    boilSeed('an' + key);
    paint(ellPts(x, y, r, r, 14), { wash: col, ink: PAL.ink, sw: .8 });
    paint(rrPts(x - r * .55, y - r * .15, r * 1.1, r * .3, r * .12), { wash: PAL.cream, ink: null });
  }
  const NEG = '#6E9BD3', CL = '#5FAE6A';
  // an action potential, as a change from rest (mV): fast rise, fall, undershoot, recovery
  const ap = (dt, from = 0) => dt < 0 ? 0 : dt < .1 ? lerp(from, 105, ease(dt / .1)) : dt < .45 ? lerp(105, -12, ease((dt - .1) / .35)) : dt < 1.4 ? lerp(-12, 0, ease((dt - .45) / .95)) : 0;
  // the recording: a cream panel, a dashed threshold, the membrane potential scrolling in from the right
  function tracePanel(x0, y0, w, h, t, vf, o = {}) {
    boilSeed('tp' + (o.key || ''));
    paint(rrPts(x0, y0, w, h, 26), { wash: '#F8F4FC', ink: PAL.ink, sw: 1 });
    const yv = v => y0 + h - 34 - (v + 90) / 130 * (h - 70), th = yv(-55), hi = o.thHi || 0;
    for (let xx = x0 + 34; xx < x0 + w - 50; xx += 38) inkLine([[xx, th], [xx + 19, th]], 1.3 + 2 * hi, mixCol('#C9533F', PAL.ink, .15), 'ink', 0);
    inkLine([[x0 + 30, yv(-70)], [x0 + w - 30, yv(-70)]], .8, mixCol('#F8F4FC', PAL.ink, .25), 'inkfine', 0);
    const win = o.win || 5, N = 220, P = [];
    for (let i = 0; i <= N; i++) { const tt = t - win + i / N * win; P.push([x0 + 34 + i / N * (w - 68), yv(vf(tt))]); }
    boilSeed('tpl' + (o.key || '')); inkLine(P, 2.6, '#3E6FA8', 'ink', 0);
    paint(ellPts(P[N][0], P[N][1], 8, 8, 10), { wash: '#3E6FA8', ink: null });
    (o.light || []).forEach(([a, b, col], i) => { if (b < t - win || a > t) return; const xa = x0 + 34 + (Math.max(a, t - win) - (t - win)) / win * (w - 68), xb = x0 + 34 + (Math.min(b, t) - (t - win)) / win * (w - 68);
      boilSeed('tpb' + i + (o.key || '')); paint(rrPts(xa, y0 + h - 24, Math.max(10, xb - xa), 13, 5), { wash: col, ink: null }); });
  }
  // the neuron membrane (shots D and H): outside above, cytoplasm below, the bilayer between
  const MEM2 = 400;
  function neuronMembrane(t, key) {
    boilSeed(key + 'o'); paint(rectPts(-1400, -1400, W + 3400, 1400 + MEM2), { wash: O.dish, ink: null });
    boilSeed(key + 'i'); paint(rectPts(-1400, MEM2, W + 3400, 2000), { wash: '#A99CD9', fill: '#8E80C4', fillOp: 50, tex: .4, ink: null });
    K.motes(t, 10, mixCol(O.dish, PAL.cream, .25), { key: key + 'm' });
    K.bilayer(K.track([[-500, MEM2], [2700, MEM2]]), 2.3, { key: key + 'b' });
  }
  // the resting charges either side; flip(x) 0..1 swaps them where the membrane is depolarised
  function chargeRows(t, flip, key, x1 = 2600, neg = 0) {
    for (let i = 0; i * 120 + 100 < x1; i++) {
      const x = 100 + i * 120 + 14 * Math.sin(i * 1.7), f = flip(x) > .5, jy = 5 * wob(t, .4, i * .21);
      if (f) { anion(x, MEM2 - 70 + jy, 15, NEG, key + 'o' + i); ion(x, MEM2 + 70 - jy, 15, key + 'i' + i); }
      else { ion(x, MEM2 - 70 + jy, 15, key + 'o' + i); anion(x, MEM2 + 70 - jy, 15 * (1 + .4 * neg), NEG, key + 'i' + i); }
    }
  }

  // ---------- small molecular props ----------
  function rhod(x, y, s, lit, key) {                            // our eyes' rhodopsin: a seven-helix block holding retinal
    boilSeed('rh' + key);
    const col = mixCol('#9C6FB8', '#E8C9F2', .5 * lit);
    if (lit > .05) glow(x, y, 70 * s, '#F2D6FF', lit * .8);
    paint(rrPts(x - 30 * s, y - 52 * s, 60 * s, 104 * s, 16 * s), { wash: col, fill: '#7A4F98', fillOp: 50, tex: .4, ink: PAL.ink, sw: .9 });
    for (let j = 1; j < 4; j++) inkLine([[x - 30 * s + j * 15 * s, y - 44 * s], [x - 30 * s + j * 15 * s + 2, y], [x - 30 * s + j * 15 * s, y + 44 * s]], .6, '#6A4486', 'inkfine', .5);
    retinal(x - 22 * s, y + 2 * s, s * 1.3, 0, 'rh' + key);
  }
  function gprot(x, y, s, k, key) {                             // transducin: three subunits
    if (k <= .03) return; const q = backOut(k); boilSeed('gp' + key);
    paint(ellPts(x, y, 20 * s * q, 17 * s * q, 12), { wash: '#F0A35E', ink: PAL.ink, sw: .8 });
    paint(ellPts(x + 20 * s * q, y + 10 * s * q, 13 * s * q, 12 * s * q, 10), { wash: '#7CC0A0', ink: PAL.ink, sw: .8 });
    paint(ellPts(x + 10 * s * q, y - 16 * s * q, 7 * s * q, 7 * s * q, 8), { wash: '#E8B24A', ink: PAL.ink, sw: .7 });
  }
  function pde(x, y, s, k, key) {                               // the enzyme: a pac-man that eats cGMP
    if (k <= .03) return; const q = backOut(k), m = .35 + .25 * Math.sin(T * 12), P = [[x, y]]; boilSeed('pd' + key);
    for (let i = 0; i <= 14; i++) { const a = m + i / 14 * (TAU - 2 * m); P.push([x + Math.cos(a) * 18 * s * q, y + Math.sin(a) * 18 * s * q]); }
    paint(P, { wash: '#5FA8A3', ink: PAL.ink, sw: .8 });
  }
  function capsid(x, y, r, k, key, open = 0) {                  // an AAV capsid: an icosahedral shell seen flat
    if (k <= .03) return; const q = backOut(k) * (1 + .5 * open), a = 1 - open; boilSeed('cap' + key);
    const P = []; for (let i = 0; i < 6; i++) { const t = i / 6 * TAU + Math.PI / 6; P.push([x + Math.cos(t) * r * q, y + Math.sin(t) * r * q]); }
    paint(P, { wash: '#CFE9E4', washOp: 230 * a, ink: a > .3 ? PAL.ink : null, sw: 1.1 });
    if (a > .3) { for (let i = 0; i < 6; i += 2) inkLine([P[i], P[(i + 2) % 6]], .8, '#7FA9A3', 'inkfine', 0); inkLine([P[1], P[3], P[5], P[1]], .8, '#7FA9A3', 'inkfine', 0); }
  }
  // the gene: a promoter (the gold block at its head) and the ChR2 coding beads behind it. lit 0..1 = being read
  function geneP(x, y, s, lit, key, n = 6) {
    boilSeed('gp' + key);
    for (let i = 0; i < n; i++) paint(ellPts(x + (i + 1.3) * 12 * s, y + 3 * s * Math.sin(i * 1.4), 6 * s, 6 * s, 9), { wash: mixCol(lit > .5 ? O.gene : '#9AA79A', '#FFF1A8', .5 * lit * (i % 2)), ink: PAL.ink, sw: .6 });
    paint(rrPts(x - 8 * s, y - 8 * s, 16 * s, 16 * s, 4 * s), { wash: O.nC, ink: PAL.ink, sw: .7 });
  }
  function pump(x, y, s, ph, act, k, key) {                     // halorhodopsin: a light-driven chloride pump (retinal inside)
    if (k <= .03) return; const q = backOut(k); boilSeed('np' + key);
    push(); translate(x, y); scale(q);
    paint(rrPts(-38 * s, -56 * s, 76 * s, 112 * s, 22 * s), { wash: mixCol('#E9A93A', '#FFE29A', .35 * act), fill: '#C27E1F', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1 });
    for (let j = 1; j < 5; j++) inkLine([[-38 * s + j * 15 * s, -48 * s], [-38 * s + j * 15 * s + 2, 0], [-38 * s + j * 15 * s, 48 * s]], .6, '#B5741C', 'inkfine', .5);
    const gy = lerp(-30, 30, ease(ph)) * s;                     // the gate walks a chloride through, one per stroke
    paint(ellPts(0, gy, 13 * s, 10 * s, 10), { wash: mixCol('#F7D58A', CL, .6 * act), ink: PAL.ink, sw: .7 });
    inkLine([[-22 * s, 14 * s], [-14 * s, 8 * s], [-6 * s, 14 * s], [2 * s, 8 * s], [10 * s, 14 * s]], 2.4 * s, O.ret, 'ink', .2);
    pop();
    if (act > .05) glow(x, y, 80 * s, '#FFD27A', act * .7);
  }

  // =========================== B: the pond, and why it's so fast (24.6–54.9) ===========================
  const ALG = Array.from({ length: 26 }, (_, i) => ({ x: hash(i + 500) * 2600 - 400, y: hash(i + 501) * 1300 - 120, r: 14 + 10 * hash(i + 502), a: hash(i + 503) * TAU }));
  const ZAPS = [40.3, 41.0, 41.7, 43.2];
  const zapK = t => ZAPS.reduce((m, z) => Math.max(m, t > z && t < z + .45 ? 1 - (t - z) / .45 : 0), 0);
  const heroB = t => { const go = ease(seg(t, 33.6, 36.8)); return { x: lerp(880, 1300, go) + 8 * wob(t, .2), y: lerp(560, 520, go) + 10 * wob(t, .17, .3), ang: lerp(.35 * Math.sin(t * .4), 0, ease(seg(t, 33.5, 34.2))) }; };
  const CC = [560, 300], CS = 1.35;
  function membraneBand(cx, cy, w, key) { boilSeed('mb' + key); paint(rrPts(cx - w / 2, cy - 13, w, 26, 10), { wash: '#F1DDBE', ink: null }); inkLine([[cx - w / 2, cy - 13], [cx + w / 2, cy - 13]], 1, PAL.ink, 'inkfine', 0); inkLine([[cx - w / 2, cy + 13], [cx + w / 2, cy + 13]], 1, PAL.ink, 'inkfine', 0); }
  function shotB(t, lt, dur) {
    const h = heroB(t), es0 = [h.x + 120 * .32, h.y - 120 * .74];
    const c = kf(t, [[24.6, [980, 560, 1.0]], [29.2, [980, 560, 1.0]], [30.3, [860, 600, 1.55]], [33.4, [860, 600, 1.55]], [36.8, [1150, 430, 1.38]], [42.3, [1150, 430, 1.38]], [43.1, [930, 440, 1.0]], [48.5, [930, 440, 1.0]], [49.2, [960, 430, 1.04]], [53.2, [1000, 430, 1.08]]], ease);
    let cx = c[0], cy = c[1], cz = c[2];
    if (t > 53.2) { const k = easeIn(seg(t, 53.2, 54.9)); cx = lerp(cx, es0[0], ease(seg(t, 53.2, 53.8))); cy = lerp(cy, es0[1], ease(seg(t, 53.2, 53.8))); cz = lerp(1.08, 11, k); }
    cam(cx + 6 * wob(t, .06) * (t < 53.2 ? 1 : 0), cy + 5 * wob(t, .05) * (t < 53.2 ? 1 : 0), cz);
    const sun = .35 + .65 * ease(seg(t, 33.3, 34.3));
    K.wash(O.pond, t, { key: 'pd', blob: O.pondBlob });
    glow(2150, 120, 1100, '#FFF2C0', sun);
    for (let i = 0; i < 6; i++) { boilSeed('shaft' + i); const x0 = 1500 + i * 180, P = [[x0, -300], [x0 + 140, -300], [x0 - 700 - i * 60, 1400], [x0 - 900 - i * 60, 1400]]; paint(P, { fill: '#FFF7D6', fillOp: (25 + 95 * sun * sun) * (.7 + .3 * wob(t, .1, i * .3)), bleed: .2, tex: .3, ink: null }); }
    K.motes(t, 20, mixCol(O.pond, PAL.cream, .4), { key: 'pd' });
    const turn = ease(seg(t, 33.6, 34.4));
    ALG.forEach((a, i) => { const go = Math.max(0, t - 33.9) * (60 + 40 * hash(i + 7)), wa = a.a + .5 * Math.sin(t * .3 + i);
      algaMini(a.x + 30 * wob(t, .05, i * .1) + go, a.y + 20 * wob(t, .04, i * .2) - go * .25, a.r, lerp(wa, -.25, turn), t, i, 'am' + i); });
    // Pip
    const pp = kf(t, [[24.6, [-150, 720]], [27.2, [600, 720]], [33.6, [600, 720]], [36.6, [1000, 420]]], ease);
    const keys = [[24.6, 'calm', { lookX: .6 }], [29.4, 'wow', { lookX: 1, lookY: -.3 }], [31.1, 'calm', { lookX: 1, lookY: -.4, armF: [.75, 2.3] }], [33.6, 'happy'],
      [37.1, 'calm', { lookX: .8, lookY: .4 }], [40.4, 'wow', { lookX: .9, lookY: .4 }], [42.8, 'calm', { lookX: -.7, lookY: -.8 }], [47.15, 'wow', { take: 1.2, lookX: .6 }],
      [47.9, 'worried', { blush: 1, lookX: -.5, lookY: -.5 }], [48.9, 'idea', { lookX: -.6, lookY: -.8 }], [51.6, 'smug', { lookX: .9, lookY: .4 }]];
    const P = actor(pp[0], pp[1], 24, t, keys, {}, 'pb');
    const rayK = Math.max(...ZAPS.map(z => t > z - .25 && t < z + .5 ? Math.sin(seg(t, z - .25, z + .5) * Math.PI) : 0)) * (t > 39 ? 1 : 0);
    const es = chlamy(h.x, h.y, 120, h.ang, t, { key: 'hero', hi: (t > 31.0 && t < 33.5) || (t > 38.4 && t < 40.1) ? 1 : 0, zap: zapK(t),
      face: { mood: zapK(t) > .2 ? 'wow' : t > 33.6 && t < 37 ? 'happy' : t > 51.6 ? 'happy' : 'calm', lx: t > 37 ? -.7 : t > 29.4 ? -.7 : 0, ly: t > 37 ? -.4 : .3, seed: 3 } });
    beam(1950, 60, es[0], es[1], 60, 10, rayK, '#FFE58A', 'ray');
    if (rayK > .05) glow(es[0], es[1], 70, '#FFE9A8', rayK);
    const from = [pp[0] - 30, P.yb - 6.2 * 24];
    // our eye: light → rhodopsin → G protein → enzyme → cGMP falls → the channel shuts. Many steps, each one amplifying.
    const ck = seg(t, 42.6, 43.0) * (1 - seg(t, 48.3, 48.7));
    cloud(CC[0], CC[1], 280 * CS, 175 * CS, ck, from, 'casc');
    if (ck > .6 && t < 48.5) {
      push(); translate(CC[0], CC[1]); scale(CS); translate(-CC[0], -CC[1]);
      membraneBand(CC[0], CC[1] + 60, 470, 'cb');
      const L = t > 43.2 && t < 43.9 ? Math.sin(seg(t, 43.2, 43.9) * Math.PI) : 0;
      beam(CC[0] - 270, CC[1] - 160, CC[0] - 190, CC[1] + 20, 14, 30, L, '#FFE58A', 'cbm');
      rhod(CC[0] - 190, CC[1] + 60, .62, ease(seg(t, 43.4, 43.7)), 'c');
      [[-110, 20], [-105, 100]].forEach(([dx, dy], i) => gprot(CC[0] + dx, CC[1] + dy, .9, seg(t, 44.9 + i * .2, 45.2 + i * .2), 'c' + i));
      [[-25, 0], [-30, 115], [25, 25], [20, 100]].forEach(([dx, dy], i) => pde(CC[0] + dx, CC[1] + dy, .85, seg(t, 45.6 + i * .12, 45.9 + i * .12), 'c' + i));
      for (let i = 0; i < 10; i++) { const k = 1 - seg(t, 46.2 + i * .05, 46.6 + i * .05), x = CC[0] + 75 + (i % 3) * 26, y = CC[1] - 40 + Math.floor(i / 3) * 42; if (k > .05) { boilSeed('cg' + i); paint(ellPts(x, y, 7 * k, 7 * k, 8), { wash: '#C9D86A', ink: PAL.ink, sw: .6 }); } }
      chr(CC[0] + 190, CC[1] + 60, .55, 1 - ease(seg(t, 46.9, 47.15)), null, 0, 1, 'cng', { col: '#8FA8C8', dk: '#5F7898', pore: '#F1DDBE' });
      if (t > 47.15 && t < 47.8) K.burst(CC[0] + 190, CC[1] + 60, 50, seg(t, 47.15, 47.8), '#E9A93A', 'cbu');
      [[43.7, -150], [45.25, -70], [45.95, 30], [46.7, 140]].forEach(([tt, dx], i) => { if (t > tt) { boilSeed('car' + i); const k = ease(seg(t, tt, tt + .25)); inkLine([[CC[0] + dx, CC[1] - 110], [CC[0] + dx + 34 * k, CC[1] - 110]], 2, PAL.ink, 'ink', 0); if (k > .9) inkLine([[CC[0] + dx + 26, CC[1] - 118], [CC[0] + dx + 35, CC[1] - 110], [CC[0] + dx + 26, CC[1] - 102]], 2, PAL.ink, 'ink', 0); } });
      pop();
    }
    // the guess: one protein that catches light AND is the channel
    const ik = seg(t, 49.1, 49.5) * (1 - seg(t, 53.0, 53.3));
    cloud(CC[0], CC[1], 250 * CS, 165 * CS, ik, from, 'idea');
    if (ik > .6) {
      push(); translate(CC[0], CC[1]); scale(CS); translate(-CC[0], -CC[1]);
      membraneBand(CC[0], CC[1] + 40, 420, 'ib');
      const L = seg(t, 50.2, 50.4), op = ease(seg(t, 50.9, 51.3));
      beam(CC[0], CC[1] - 170, CC[0], CC[1] - 10, 20, 40, L, '#BCD8FF', 'ibm');
      chr(CC[0], CC[1] + 40, .6, op, ease(seg(t, 50.45, 50.75)), 0, 1, 'ic', { pore: '#F1DDBE' });
      for (let i = 0; i < 4; i++) { const a = seg(t, 51.4 + i * .4, 52.2 + i * .4); if (a > 0 && a < 1) ion(CC[0], lerp(CC[1] - 120, CC[1] + 150, a), 11, 'ii' + i); }
      pop();
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#5E9A7E', O.pond]);
    if (t > 54.3) flash(seg(t, 54.3, 54.9), PAL.cream);
  }

  // =========================== C: the frog egg; the channel close up (54.9–85.0) ===========================
  const MEM_Y = 540, PRO = [560, 960, 1360];
  const LIGHTC = [70.05, 82.4];
  const IONS = (() => { const L = []; for (let tt = 77.6; tt < 82.4; tt += .14) L.push(tt); return L; })();
  function shotC(t, lt, dur) {
    if (t < 59.9) {                                             // the frog egg and the injection
      const z = t < 59.3 ? 1 : lerp(1, 4.2, easeIn(seg(t, 59.3, 59.9)));
      const c = kf(t, [[54.9, [900, 560, 1.12]], [56.0, [900, 560, 1.12]], [57.2, [980, 520, 1.25]], [59.3, [960, 480, 1.25]]], ease);
      cam(lerp(c[0], 860, seg(t, 59.3, 59.9)) + 6 * wob(t, .06), lerp(c[1], 300, seg(t, 59.3, 59.9)), c[2] * z);
      K.wash(O.lab, t, { key: 'lb', blob: O.labBlob });
      K.motes(t, 14, mixCol(O.lab, PAL.ink, .12), { key: 'lb' });
      const sq = .03 * spring(t, 57.4, 5, 14);
      boilSeed('jelly'); paint(ellPts(860, 560, 330, 330 * (1 - sq), 40, 2), { fill: O.jelly, fillOp: 150, bleed: .15, tex: .4, ink: mixCol(O.lab, PAL.ink, .3), sw: .7 });
      boilSeed('egg');
      paint(ellPts(860, 560, 268 * (1 + sq), 268 * (1 - sq), 40), { wash: O.egg, fill: mixCol(O.egg, PAL.ink, .12), fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.3 });
      const cap = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI; cap.push([860 + Math.cos(a) * 266 * (1 + sq), 560 + Math.sin(a) * 266 * (1 - sq)]); }
      for (let i = 0; i <= 8; i++) cap.push([860 + 266 - i / 8 * 532, 560 + 30 + 18 * Math.sin(i * 1.2)]);
      paint(cap, { wash: O.eggDk, fill: mixCol(O.eggDk, PAL.ink, .3), fillOp: 60, tex: .5, ink: null });
      paint(ellPts(760, 420, 60, 30, 14, 0, -.5), { wash: mixCol(O.eggDk, PAL.cream, .35), washOp: 150, ink: null });
      const nin = ease(seg(t, 56.1, 57.0)) * (1 - ease(seg(t, 58.6, 59.3))), tip = [lerp(1900, 1080, nin), lerp(220, 470, nin)];
      if (nin > .01) {
        boilSeed('needle');
        const a = Math.atan2(470 - 220, 1080 - 1900), nx = -Math.sin(a), ny = Math.cos(a), back = [tip[0] - Math.cos(a) * 900, tip[1] - Math.sin(a) * 900];
        paint([[tip[0], tip[1]], [back[0] + nx * 26, back[1] + ny * 26], [back[0] - nx * 26, back[1] - ny * 26]], { wash: '#E8F3F7', washOp: 220, ink: PAL.ink, sw: .9 });
        const inj = seg(t, 57.3, 58.5), G = [];
        for (let i = 0; i < 9; i++) { const d = 60 + i * 14 - inj * 260; if (d > 4) G.push([tip[0] - Math.cos(a) * d, tip[1] - Math.sin(a) * d]); else G.push([tip[0] + Math.cos(a) * (-d) * .9 - 20 * Math.sin(i), tip[1] + Math.sin(a) * (-d) * .9 + 14 * Math.cos(i * 1.3)]); }
        gene(G, 'eg', 9);
      }
      if (t > 57.4 && t < 58.1) K.sparkle(1060, 470, 40, seg(t, 57.4, 58.1), '#FFF3C4');
      duo(380, 860, 30, t, [[54.9, 'calm', { lookX: .8, lookY: -.3 }], [57.4, 'wow', { lookX: .9, lookY: -.6 }], [58.8, 'happy']], {}, 'pc');
      camEnd();
      if (t < 55.3) flash(1 - seg(t, 54.9, 55.3), PAL.cream);
      if (t > 59.5) flash(seg(t, 59.5, 59.9), PAL.cream);
      return;
    }
    // the egg membrane: channelrhodopsin appears; its retinal; light → isomerisation → shape change → open → Na+ in → shut
    const ret = [960 + 22, MEM_Y - 3];
    const c = kf(t, [[59.9, [960, 540, 1.2]], [61.2, [960, 540, 1.05]], [62.1, [960, 540, 1.05]], [63.3, [960, 545, 1.9]], [64.1, [1080, 480, 1.8]], [66.1, [1080, 480, 1.8]],
      [66.9, [880, 430, 1.45]], [69.5, [880, 430, 1.45]], [70.4, [1080, 480, 1.8]], [75.1, [1080, 480, 1.8]], [76.0, [960, 545, 1.7]], [77.4, [960, 545, 1.7]], [78.2, [960, 580, 1.22]], [85.0, [960, 580, 1.22]]], ease);
    cam(c[0] + 5 * wob(t, .06), c[1] + 4 * wob(t, .05), c[2]);
    boilSeed('memO'); paint(rectPts(-1400, -1400, W + 2800, 1400 + MEM_Y), { wash: O.out, ink: null });
    boilSeed('memI'); paint(rectPts(-1400, MEM_Y, W + 2800, 2000), { wash: O.in, fill: O.inDk, fillOp: 60, tex: .4, ink: null });
    K.motes(t, 10, mixCol(O.out, PAL.ink, .1), { key: 'mo' });
    const nIn = IONS.filter(a => t > a + .7).length;
    glow(960, 760, 220 + 12 * nIn, '#FFC977', clamp(nIn / 30) * .9 * (1 - .5 * seg(t, 83.5, 85)));
    K.bilayer(K.track([[-500, MEM_Y], [2400, MEM_Y]]), 2.3, { key: 'egm' });
    const L = ease(seg(t, LIGHTC[0], LIGHTC[0] + .2)) * (1 - ease(seg(t, LIGHTC[1], LIGHTC[1] + .15)));
    beam(960, -250, 960, MEM_Y - 30, 70, 110, L, '#A8C8FF', 'bmC');
    if (L > .05) glow(960, MEM_Y - 60, 200, O.blueG, L);
    const kink = ease(seg(t, 73.45, 74.3)) * (1 - ease(seg(t, 83.0, 83.6))), bend = ease(seg(t, 75.4, 76.5)) * (1 - ease(seg(t, 82.9, 83.3)));
    const op = ease(seg(t, 76.9, 77.4)) * (1 - ease(seg(t, 82.9, 83.2)));
    const hiName = t > 62.1 && t < 63.5 ? .5 + .5 * Math.sin(t * 9) : 0, retG = t > 63.9 && t < 69.3 ? .6 + .3 * Math.sin(t * 5) : 0;
    PRO.forEach((x, j) => { const mid = j === 1; chr(x, MEM_Y, 1.25, mid ? op : 0, mid ? kink : 0, mid ? hiName : 0, seg(t, 60.2 + j * .35, 60.55 + j * .35), 'c' + j, { bend: mid ? bend : 0, retGlow: mid ? retG : 0 }); });
    // the concentration gradient: plenty of Na+ outside, little inside
    for (let i = 0; i < 18; i++) { const x = 140 + hash(i + 300) * 1660, y = 150 + hash(i + 301) * 290; if (Math.abs(x - 960) < 60 || (x > 300 && x < 600 && y > 180)) continue; ion(x + 10 * wob(t, .3, i * .2), y + 8 * wob(t, .25, i * .3), 17, 'o' + i); }
    for (let i = 0; i < 3; i++) ion(300 + i * 640 + 20 * wob(t, .2, i), 820 + 40 * hash(i + 9), 17, 'n' + i);
    IONS.forEach((a, i) => {
      const age = t - a; if (age < 0) return;
      const s0 = [960 + (hash(i + 400) - .5) * 520, 160 + hash(i + 401) * 220], top = [960, MEM_Y - 60], bot = [960, MEM_Y + 70], end = [960 + (hash(i + 402) - .5) * 900, MEM_Y + 130 + hash(i + 403) * 300];
      let p; if (age < .45) p = [lerp(s0[0], top[0], easeIn(age / .45)), lerp(s0[1], top[1], easeIn(age / .45))];
      else if (age < .65) p = [960, lerp(top[1], bot[1], (age - .45) / .2)];
      else { const k = easeOut(seg(age, .65, 1.6)); p = [lerp(bot[0], end[0], k) + 6 * wob(t, .4, i * .3) * k, lerp(bot[1], end[1], k)]; }
      ion(p[0], p[1], 17, 'f' + i);
    });
    if (t > 78.0 && t < 78.8) K.burst(960, MEM_Y + 120, 90, seg(t, 78.0, 78.8), '#F6CF45', 'cb');
    // "the same molecule as in our eyes": the rhodopsin from the pond, its retinal pulsing in step
    const P = duo(440, 430, 28, t, [[59.9, 'calm', { lookX: .8, lookY: .6 }], [62.2, 'wow', { lookX: .9, lookY: .6 }], [66.4, 'idea', { lookX: .6, lookY: -.6 }], [68.0, 'happy'],
      [70.2, 'calm', { lookX: .9, lookY: .6 }], [74.0, 'wow', { lookX: .9, lookY: .6 }], [78.2, 'excited'], [82.5, 'calm', { lookX: .9, lookY: .6 }], [83.4, 'happy']], {}, 'pm');
    const rk = seg(t, 66.3, 66.7) * (1 - seg(t, 69.2, 69.5));
    cloud(800, 205, 150, 105, rk, [440, P.yb - 6.4 * 28], 'rh');
    if (rk > .6) { rhod(720, 205, .9, .5 + .5 * Math.sin(t * 5), 'cl'); retinal(775, 215, 2.3, 0, 'clr'); K.check(925, 290, 60, seg(t, 67.8, 68.2), 'rk'); }
    // the magnifier on the retinal: straight (all-trans), then kinked (13-cis) by the light
    const mk = seg(t, 63.8, 64.2) * (1 - seg(t, 75.4, 75.8));
    if (mk > .03) {
      const q = backOut(mk), MX = 1310, MY = 350, R = 150 * q;
      boilSeed('magC'); paint([[ret[0] - 4, ret[1] - 6], [ret[0] + 8, ret[1] + 4], [MX - R * .2, MY + R * .98], [MX - R * .9, MY + R * .4]], { fill: '#FFF5E2', fillOp: 110, bleed: .1, ink: null });
      boilSeed('mag'); paint(ellPts(MX, MY, R, R, 40), { wash: '#FBF4E6', ink: PAL.ink, sw: 1.3 });
      if (q > .5) retinal(MX - 80, MY + 8, 4.6 * q, kink, 'mag');
    }
    camEnd();
    if (t < 60.3) flash(1 - seg(t, 59.9, 60.3), PAL.cream);
    if (t > 84.5) flash(seg(t, 84.5, 85.0), PAL.cream);
  }

  // =========================== D: rest, threshold, action potential (85.0–97.4) ===========================
  const CHRX = 420, VGX = [760, 1060, 1360, 1660, 1960, 2260];
  const twD = x => 92.4 + Math.max(0, x - CHRX) / 650;
  const vD = tt => tt < 92.35 ? -70 + 17 * ease(seg(tt, 89.2, 92.3)) : -70 + ap(tt - 92.35, 17);
  function shotD(t, lt, dur) {
    const c = kf(t, [[85.0, [900, 515, 1.45]], [94.9, [900, 515, 1.45]], [96.9, [1400, 515, 1.45]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    neuronMembrane(t, 'nd');
    const L = ease(seg(t, 89.0, 89.2)) * (1 - ease(seg(t, 92.4, 92.6)));
    beam(CHRX, -250, CHRX, MEM2 - 30, 60, 95, L, '#A8C8FF', 'dbm');
    if (L > .05) glow(CHRX, MEM2 - 60, 180, O.blueG, L);
    chr(CHRX, MEM2, 1.25, L, L, 0, 1, 'dch', { pore: '#7C76B0' });
    VGX.forEach((x, i) => { const tw = twD(x), o = t > tw && t < tw + .45 ? Math.sin(seg(t, tw, tw + .45) * Math.PI) : 0;
      chr(x, MEM2, .95, o, null, 0, 1, 'dvg' + i, { col: '#5FA8A3', dk: '#3E7F7A', pore: '#7C76B0' });
      if (o > .2) ion(x, lerp(MEM2 - 50, MEM2 + 60, seg(t, tw + .05, tw + .4)), 14, 'dvi' + i); });
    const ramp = seg(t, 89.4, 92.3);
    chargeRows(t, x => ((t > 89.4 && t < twD(x) + .8 && Math.abs(x - CHRX) < 300 * ramp) || (t > twD(x) && t < twD(x) + .8)) ? 1 : 0, 'dq', 2600, t > 86.8 && t < 88.6 ? Math.abs(Math.sin((t - 86.8) * 6)) : 0);
    for (let i = 0; i < 6; i++) { const a = seg(t, 89.3 + i * .45, 89.9 + i * .45); if (a > 0 && a < 1) ion(CHRX + 8 * Math.sin(i), lerp(MEM2 - 140, MEM2 + 150, a), 15, 'dci' + i); }
    tracePanel(300, 600, 1060, 225, t, vD, { key: 'd', thHi: t > 91.3 && t < 92.6 ? .5 + .5 * Math.sin(t * 14) : 0, light: [[89.0, 92.5, O.blueG]] });
    if (t > 92.35 && t < 93.1) K.burst(1326, 640, 46, seg(t, 92.35, 93.1), '#F6CF45', 'dsp');
    duo(1430, 830, 24, t, [[85.0, 'calm', { lookX: .6, lookY: -.8 }], [87.0, 'idea', { lookX: .5, lookY: -.9 }], [89.2, 'calm', { lookX: .8, lookY: -.6 }], [91.4, 'worried', { lookX: .6, lookY: .3 }], [92.45, 'wow', { take: 1 }], [94.2, 'excited']], { flip: true }, 'pdm');
    camEnd();
    if (t < 85.4) flash(1 - seg(t, 85.0, 85.4), PAL.cream);
    if (t > 96.9) flash(seg(t, 96.9, 97.4), PAL.cream);
  }

  // =========================== E: Deisseroth's neuron in a dish (97.4–109.9) ===========================
  const HN = [720, 470], HNA = [[1000, 525], [1300, 470], [1600, 540], [1860, 500]], HNT = K.track([HN, ...HNA], 8);
  const FL = [103.65, 105.95, 106.55, 107.35, 107.95, 108.65, 109.25];
  const flashK = t => FL.reduce((m, f) => Math.max(m, t > f - .04 && t < f + .25 ? 1 - seg(t, f + .05, f + .25) : 0), 0);
  const vE = tt => -70 + FL.reduce((s, f) => s + ap(tt - f - .03), 0);
  function shotE(t, lt, dur) {
    const out = easeIn(seg(t, 109.4, 109.9)), fk = flashK(t);
    cam(900 + out * 1100 + 8 * wob(t, .05), 540 + 5 * wob(t, .04), 1.0);
    K.wash(O.dish, t, { key: 'dd', blob: O.dishBlob });
    boilSeed('rim'); for (const r of [1010, 1045]) { const E = ellPts(960, 560, r, r * .74, 64); E.push(E[0]); for (let j = 0; j < 64; j += 16) inkLine(E.slice(j, j + 17), 1.4, mixCol(O.dish, PAL.ink, .35), 'inkfine', .5); }
    [[260, 200, 1.1, .6], [1500, 170, 1.0, 2.6], [1250, 900, .9, -2.4], [120, 900, 1.0, -.6]].forEach(([x, y, s, a], i) => neuron(x, y, s, t, { key: 'dn' + i, seed: 40 + i, col: mixCol(O.dish, O.hero, .4), a0: a, axon: [[x + Math.cos(a + 3.1) * 160, y + Math.sin(a + 3.1) * 160]], sw: .6 }));
    const gk = seg(t, 101.0, 102.4);
    if (gk > 0 && gk < 1) { const G = []; for (let i = 0; i < 9; i++) G.push(arcPt([120, 80], HN, 160, clamp(easeIn(gk) - i * .035))); gene(G, 'dg'); }
    if (t > 102.3 && t < 103.0) K.sparkle(HN[0], HN[1] - 30, 60, seg(t, 102.3, 103.0), '#FFF3C4');
    const lit = Math.max(FL.reduce((m, f) => Math.max(m, t > f && t < f + .6 ? 1 - seg(t, f + .1, f + .6) : 0), 0), t < 97.9 ? 1 - seg(t, 97.4, 97.9) : 0);
    if (fk > .05) glow(HN[0], HN[1], 260, O.blueG, fk);
    const mood = t > 103.7 && t < 105.3 ? 'wow' : t > 105.3 ? 'happy' : 'calm';
    neuron(HN[0], HN[1], 2.2, t, { key: 'hero', seed: 30, col: O.hero, a0: Math.PI, spread: .62, axon: HNA, lit, glowA: .7, sw: 1.1,
      face: { mood, lx: t < 104 ? -.6 : -.8, ly: .2, seed: 2 },
      extras: r => { for (let i = 0; i < 16; i++) { const k = seg(t, 102.5 + i * .05, 102.85 + i * .05); if (k <= .03) continue; const a = i / 16 * TAU + .2; boilSeed('hc' + i); const q = backOut(k); paint(rrPts(HN[0] + Math.cos(a) * r - 8 * q, HN[1] + Math.sin(a) * r * .9 - 8 * q, 16 * q, 16 * q, 5), { wash: O.chr, ink: PAL.ink, sw: .7 }); } } });
    spikeBead(HNT, seg(t, 97.3, 98.2), 1.9, 'din');                // the spike from the membrane arrives here
    FL.forEach((f, i) => spikeBead(HNT, seg(t, f + .06, f + .62), 1.9, 'dsp' + i));
    tracePanel(640, 820, 1220, 220, t, vE, { key: 'e', win: 3, light: FL.map(f => [f - .02, f + .12, O.blueG]) });
    const keys = [[97.4, 'calm', { lookX: .8, lookY: -.2 }], [101.6, 'wow', { lookX: .9, lookY: -.3 }], [102.8, 'smug', { lookX: .9, lookY: -.3 }], [103.75, 'wow', { take: .6 }], [105.3, 'happy'], [107.4, 'laugh'], [108.7, 'excited']];
    const hold = t > 102.8 ? { armF: { at: [2.4, -3.3] }, armsFront: false } : {};
    const P = duo(260, 820, 32, t, keys, hold, 'pd');
    if (t > 102.85) {
      const hp = P.hand([2.4, -3.3]), ang = Math.atan2(HN[1] - hp[1], HN[0] - hp[0]), r = backOut(seg(t, 102.8, 103.2));
      if (fk > .02) beam(hp[0] + Math.cos(ang) * 40, hp[1] + Math.sin(ang) * 40, HN[0] - 40, HN[1], 12, 90, fk, O.blue, 'tb');
      boilSeed('torch'); push(); translate(hp[0], hp[1]); rotate(ang); scale(r * 1.4);
      paint(rrPts(-26, -11, 46, 22, 6), { wash: '#6E7FA8', ink: PAL.ink, sw: .9 }); paint(rrPts(16, -17, 18, 34, 5), { wash: '#9FB2D8', ink: PAL.ink, sw: .9 });
      paint(ellPts(35, 0, 5, 14, 10), { wash: fk > .1 ? '#EAF2FF' : '#B8C6E0', ink: null }); pop();
      if (fk > .1) glow(hp[0] + Math.cos(ang) * 36, hp[1] + Math.sin(ang) * 36, 60, O.blueG, fk);
    }
    camEnd();
    if (t < 97.8) flash(1 - seg(t, 97.4, 97.8), PAL.cream);
    speedLines(out, mixCol(O.dish, PAL.cream, .7), 'spD');
  }

  // =========================== F: the "genetic" part: virus + promoter (109.9–123.6) ===========================
  const FN = [[400, 500, 'nA', '#6E5FA8'], [960, 560, 'nB', '#3E7F7A'], [1520, 490, 'nC', '#B5841C']];
  function shotF(t, lt, dur) {
    const inK = 1 - easeOut(seg(t, 109.9, 110.5));
    const c = kf(t, [[109.9, [900, 600, 1.12]], [115.0, [900, 600, 1.12]], [115.9, [990, 570, 1.3]], [123.6, [990, 570, 1.32]]], ease);
    cam(c[0] - inK * 1100 + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash(O.night, t, { key: 'fv', blob: O.nightBlob });
    for (let i = 0; i < 10; i++) { boilSeed('ffb' + i); const y0 = hash(i + 80) * 1200 - 60, P = []; for (let j = 0; j <= 5; j++) P.push([-400 + j * 560, y0 + 150 * Math.sin(j * 1.2 + i * 2.1)]); const Cv = through(P, 6); for (let j = 0; j + 1 < Cv.length; j += 12) inkLine(Cv.slice(j, j + 13), 1.5, O.fiber, 'inkfine', .5); }
    const flood = ease(seg(t, 122.2, 122.45)) * (1 - ease(seg(t, 123.2, 123.5)));
    if (flood > .02) for (let i = 0; i < 3; i++) beam(380 + i * 560, -300, 380 + i * 560, 1300, 200, 260, flood * .8, '#A8C8FF', 'ffl' + i);
    FN.forEach(([x, y, kind, dk], j) => {
      const gold = kind === 'nC', on = gold ? ease(seg(t, 118.9, 119.4)) : 0, fire = gold && t > 122.4 ? .85 + .15 * Math.sin(t * 9) : 0;
      neuron(x, y, 2.0, t, { key: 'fn' + j, seed: 70 + j, col: O[kind], a0: Math.PI * (j === 1 ? .7 : 1.15), axon: [[x + 150, y + 170], [x + 260, y + 330]], lit: fire, glowA: .9, sw: 1.1,
        extras: r => {
          if (t > 115.1) {                                     // the delivered gene, sitting in the nucleus area
            geneP(x - 45, y + 8, 1.5, on, 'fg' + j, 4);
            // the reader: only the gold cell's fits the promoter
            const app = ease(seg(t, 116.0, 117.6)), fit = gold ? ease(seg(t, 117.6, 117.9)) : 0, bounce = gold ? 0 : Math.max(0, Math.sin(seg(t, 117.6, 118.4) * Math.PI)) * 14;
            const rx = x - 45 + (gold ? 0 : -bounce), ry = lerp(y + 80, y + 26, app) + (gold ? -5 * fit : bounce * .4);
            boilSeed('rd' + j);
            if (app > .02) { const P = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (gold ? .1 : .3) + i / 12 * Math.PI * (gold ? .8 : .4); P.push([rx + Math.cos(a) * 24, ry + Math.sin(a) * 19]); } paint(ribbon(P, 13, 13), { wash: gold ? '#F7D27A' : mixCol(O[kind], PAL.cream, .55), ink: PAL.ink, sw: .9 }); }
            if (!gold && t > 117.9 && t < 119.6) K.cross(x - 45, y - 50, 44, seg(t, 117.9, 118.3), 'fx' + j);
            if (gold && t > 117.9 && t < 118.6) K.burst(x - 45, y + 8, 40, seg(t, 117.9, 118.6), '#E9A93A', 'fb');
            if (gold && t > 118.9 && t < 119.6) K.sparkle(x - 10, y - 20, 30, seg(t, 118.9, 119.6), '#FFF3C4');
          }
          if (gold) for (let i = 0; i < 16; i++) { const k = seg(t, 120.8 + i * .05, 121.15 + i * .05); if (k <= .03) continue; const a = i / 16 * TAU + .2; boilSeed('fch' + i); const q = backOut(k); paint(rrPts(x + Math.cos(a) * r - 7 * q, y + Math.sin(a) * r * .9 - 7 * q, 14 * q, 14 * q, 5), { wash: O.chr, ink: PAL.ink, sw: .7 }); }
        } });
      if (gold && t > 122.45) spikeBead(K.track([[x, y], [x + 150, y + 170], [x + 260, y + 330]], 8), frac((t - 122.45) / .7), 1.5, 'fsp');
    });
    // Pip packs the gene into a virus; three copies fly to three kinds of cell
    const P = duo(330, 930, 30, t, [[109.9, 'calm', { lookX: .6, lookY: -.8 }], [110.5, 'happy', { lookY: -.8 }], [111.8, 'wow', { lookX: .5, lookY: -.8 }], [113.4, 'excited'], [115.9, 'calm', { lookX: .9, lookY: -.4 }], [117.95, 'idea', { lookX: .9, lookY: -.5 }], [121.0, 'happy'], [122.45, 'laugh']],
      t < 113.4 ? { armF: { at: [1.4, -6.0] }, armB: { at: [-1.2, -6.0] }, armsFront: false } : {}, 'pf', { glow: O.blueG, glowA: flood * .6 });
    const G0 = [330, P.yb - 6.6 * 30];
    for (let j = 0; j < 3; j++) {
      const born = j ? 112.6 + j * .2 : 111.7, home = j ? [G0[0] + (j === 1 ? -80 : 80), G0[1] - 70] : G0, [nx, ny] = FN[j];
      const fly = seg(t, 113.4 + j * .15, 114.8 + j * .15), at = fly > 0 ? arcPt(home, [nx - 45, ny], 180, ease(fly)) : home, open = seg(t, 114.8 + j * .15, 115.3 + j * .15);
      if (t < born || open >= 1) continue;
      if (j === 0 && t < 112.2) geneP(at[0] - 30, at[1], 1, .6, 'fhold');
      else { geneP(at[0] - 30 * (1 - open), at[1], .8, .4, 'fv' + j, 5); }
      capsid(at[0], at[1], 46, seg(t, born, born + .35), 'f' + j, open);
    }
    if (t > 110.4 && t < 111.1) K.sparkle(G0[0] + 30, G0[1] - 30, 40, seg(t, 110.4, 111.1), '#FFF3C4');
    camEnd();
    speedLines(inK, mixCol(O.night, PAL.cream, .5), 'spF');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E2CDA6', O.sand]);
  }

  // =========================== G: the mouse (123.6–138.9) ===========================
  const EL = [[129.05, 129.9], [130.3, 131.3], [133.2, 134.2], [135.0, 137.6]];
  const eLight = (t, W_ = EL) => W_.reduce((m, [a, b]) => Math.max(m, ease(seg(t, a, a + .12)) * (1 - ease(seg(t, b, b + .15)))), 0);
  function mouseFloor(t) {
    K.wash(O.sand, t, { key: 'es', blob: O.sandBlob });
    boilSeed('floor'); paint(rectPts(-1400, 860, W + 2800, 1600), { wash: O.floor, ink: null }); inkLine([[-400, 862], [700, 858], [1500, 864], [2400, 860]], 1.2, mixCol(O.floor, PAL.ink, .5), 'ink', .4);
    for (let i = 0; i < 26; i++) { boilSeed('bed' + i); const x = -300 + hash(i + 700) * 2600, y = 885 + hash(i + 701) * 200; paint(ellPts(x, y, 18 + 10 * hash(i), 7, 8, 0, hash(i + 2)), { wash: mixCol(O.floor, PAL.cream, .45), ink: null }); }
  }
  function shotG(t, lt, dur) {
    let c = kf(t, [[123.6, [1000, 560, 1.0]], [126.3, [1000, 560, 1.0]], [127.2, [1180, 520, 1.3]], [131.75, [1180, 520, 1.3]]], ease);
    if (t >= 131.75) c = kf(t, [[131.75, [1080, 600, 1.12]], [137.9, [1070, 595, 1.15]]], ease);
    let cx = c[0], cy = c[1], cz = c[2];
    const L = eLight(t), asleep = t > 131.75 && t < 133.35 ? 1 : 0;
    const whisk = t > 129 && t < 131.5 ? .32 * Math.sin((t - 129.05) * 13) * L : 0;
    const wakeT = take(t, 133.35, 1.2), fear = ease(seg(t, 135.15, 135.5)) * (1 - ease(seg(t, 137.7, 138.2)));
    const brainAt = [MS[0] + 185 * S, MS[1] - 160 * S];
    if (t > 138.0) { const k = easeIn(seg(t, 138.0, 138.9)); cx = lerp(cx, brainAt[0], ease(seg(t, 138.0, 138.4))); cy = lerp(cy, brainAt[1], ease(seg(t, 138.0, 138.4))); cz = lerp(cz, 9, k); }
    cam(cx + 6 * wob(t, .06) * (t < 138 ? 1 : 0), cy + 5 * wob(t, .05) * (t < 138 ? 1 : 0), cz);
    mouseFloor(t);
    const mm = mouse(t, { sleep: t > 131.75 ? 1 - ease(seg(t, 133.3, 133.6)) : 0, fear, whisk, light: L, fy: seg(t, 125.2, 126.9), dy: wakeT.dy * 30, blink: K.blinkAt(t, 4) });
    if (asleep) pipEmote('zzz', mm.head[0] + 40, mm.head[1] - 40, 26, 1, 'mz');
    if (t > 133.35 && t < 134.9) pipEmote('exclaim', mm.head[0] + 70, mm.head[1] - 60, 30 * backOut(seg(t, 133.35, 133.65)), 1, 'mx');
    if (fear > .3) pipEmote('sweat', mm.head[0] + 160, mm.head[1] - 10, 30, 1, 'msw');
    const ck = seg(t, 135.45, 135.85) * (1 - seg(t, 137.6, 138.0));
    if (ck > .02) {
      const cx2 = mm.head[0] + 120, cy2 = mm.head[1] - 280;
      cloud(cx2, cy2, 170, 120, ck, [mm.head[0] + 30, mm.head[1] - 40], 'cat');
      if (ck > .6 && seg(t, 135.65, 136.05) > .03) { const q = backOut(seg(t, 135.65, 136.05)); boilSeed('catH');
        paint([[cx2 - 70 * q, cy2 - 20 * q], [cx2 - 55 * q, cy2 - 85 * q], [cx2 - 20 * q, cy2 - 45 * q], [cx2 + 20 * q, cy2 - 45 * q], [cx2 + 55 * q, cy2 - 85 * q], [cx2 + 70 * q, cy2 - 20 * q], [cx2 + 60 * q, cy2 + 40 * q], [cx2, cy2 + 62 * q], [cx2 - 60 * q, cy2 + 40 * q]], { wash: '#6E6676', ink: PAL.ink, sw: 1.1, curv: .4 });
        for (const sd of [-1, 1]) paint([[cx2 + sd * 30 * q - 16 * q, cy2 + 2 * q], [cx2 + sd * 30 * q + 16 * q, cy2 - 4 * q], [cx2 + sd * 30 * q + 10 * q, cy2 + 8 * q]], { wash: '#F4D35E', ink: null }); }
    }
    const keys = [[123.6, 'calm', { lookX: .9 }], [127.0, 'wow', { lookX: .9, lookY: .5 }], [129.2, 'laugh'], [131.75, 'calm', { lookX: .9 }], [132.3, 'shy', { lookX: .9 }], [133.4, 'laugh'], [135.3, 'worried', { lookX: .9 }], [137.9, 'happy']];
    ridePip(mm, t, keys, 'pe');
    camEnd();
    if (t > 131.45 && t < 132.05) flash(1 - Math.abs(t - 131.75) / .3, PAL.cream);
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E2CDA6', O.sand]);
    if (t > 138.5) flash(seg(t, 138.5, 138.9), PAL.cream);
  }
  function ridePip(mm, t, keys, key) {                          // Pip rides on the mouse's back, Chlamy hovering behind
    const o = K.act(t, keys, 2), x = mm.back[0], y = mm.back[1] + 2, u = 28;
    pip(x, y, u, { ...o, noShadow: true, key });
    chlamy(x - 3.3 * u, y - 5.0 * u + 7 * Math.sin(t * 1.7), u, .12 * Math.sin(t * 1.3), t, { key: key + 'b', face: { mood: budMood(o.face), lx: .6, ly: .2, seed: 4 } });
  }

  // =========================== H: the off switch (138.9–153.6) ===========================
  const SP = [139.2, 140.1, 141.0, 141.9, 142.8], PUMPX = 1000, VGH = [760, 1300, 1600, 1900, 2200];
  const twH = (s, x) => s + x / 1500;
  const vH = tt => -70 - 18 * ease(seg(tt, 142.1, 145.4)) + SP.reduce((a, s) => a + ap(tt - s), 0);
  const CLI = (() => { const L = []; for (let tt = 142.2; tt < 147.4; tt += .32) L.push(tt); return L; })();
  const HL = [[147.9, 149.1, 'b'], [149.3, 150.5, 'y'], [150.7, 151.5, 'b'], [151.7, 152.6, 'y']];
  function shotH(t, lt, dur) {
    if (t < 147.4) {
      cam(900 + 6 * wob(t, .05), 515 + 4 * wob(t, .04), 1.45);
      neuronMembrane(t, 'nh');
      const Y = ease(seg(t, 141.7, 141.9)), act = Y, ph = t > 142.1 ? frac((t - 142.1) / .32) : 0;
      beam(PUMPX, -250, PUMPX, MEM2 - 40, 60, 95, Y, '#FFD98A', 'hbm');
      if (Y > .05) glow(PUMPX, MEM2 - 60, 180, '#FFC24A', Y);
      chr(CHRX, MEM2, 1.25, 0, 0, 0, 1, 'hch', { pore: '#7C76B0' });
      pump(PUMPX, MEM2, 1.25, ph, act, seg(t, 139.55, 139.95), 'h');
      VGH.forEach((x, i) => { const o = SP.reduce((m, s) => Math.max(m, t > twH(s, x) && t < twH(s, x) + .35 ? Math.sin(seg(t, twH(s, x), twH(s, x) + .35) * Math.PI) : 0), 0);
        chr(x, MEM2, .95, o, null, 0, 1, 'hvg' + i, { col: '#5FA8A3', dk: '#3E7F7A', pore: '#7C76B0' }); });
      chargeRows(t, x => SP.some(s => t > twH(s, x) && t < twH(s, x) + .45) ? 1 : 0, 'hq');
      CLI.forEach((a, i) => {
        const age = t - a; if (age < 0) return;
        const s0 = [PUMPX + (hash(i + 600) - .5) * 600, 160 + hash(i + 601) * 160], top = [PUMPX, MEM2 - 70], bot = [PUMPX, MEM2 + 70], end = [PUMPX + (hash(i + 602) - .5) * 1100, MEM2 + 140 + hash(i + 603) * 120];
        let p; if (age < .5) p = [lerp(s0[0], top[0], ease(age / .5)), lerp(s0[1], top[1], ease(age / .5))];
        else if (age < .82) p = [PUMPX, lerp(top[1], bot[1], ease((age - .5) / .32))];
        else { const k = easeOut(seg(age, .82, 1.8)); p = [lerp(bot[0], end[0], k), lerp(bot[1], end[1], k)]; }
        anion(p[0], p[1], 15, CL, 'cl' + i);
      });
      SP.forEach((s, i) => spikeBead(K.track([[0, MEM2 + 110], [2400, MEM2 + 110]]), seg(t, s, s + 1.6), 1.2, 'hsp' + i));
      tracePanel(300, 600, 1060, 225, t, vH, { key: 'h', light: [[141.7, 147.4, '#F2B640']] });
      duo(1430, 830, 24, t, [[138.9, 'calm', { lookX: .6, lookY: -.8 }], [139.7, 'wow', { lookX: .5, lookY: -.9 }], [141.8, 'calm', { lookX: .7, lookY: -.8 }], [143.9, 'idea', { lookX: .6, lookY: -.6 }], [145.8, 'sleepy'], [146.7, 'smug']], { flip: true }, 'phm');
      camEnd();
      if (t < 139.3) flash(1 - seg(t, 138.9, 139.3), PAL.cream);
      if (t > 147.0) flash(seg(t, 147.0, 147.4), PAL.cream);
      return;
    }
    // back on the mouse: blue → whiskers sweep; yellow → still. On, off: cause and effect
    cam(1180 + 6 * wob(t, .06), 520 + 5 * wob(t, .05), 1.3);
    mouseFloor(t);
    const B = HL.filter(w => w[2] === 'b').map(w => [w[0], w[1]]), Yw = HL.filter(w => w[2] === 'y').map(w => [w[0], w[1]]);
    const lb = eLight(t, B), ly = eLight(t, Yw);
    const whisk = .32 * Math.sin(t * 13) * lb;
    const mm = mouse(t, { whisk, light: Math.max(lb, ly), lcol: ly > lb ? 'y' : 'b', blink: K.blinkAt(t, 4), still: ly });
    ridePip(mm, t, [[147.4, 'calm', { lookX: .9, lookY: .5 }], [148.0, 'happy'], [149.4, 'wow', { lookX: .9, lookY: .5 }], [150.8, 'laugh'], [151.9, 'idea'], [152.8, 'smug']], 'ph');
    K.check(mm.head[0] + 200, mm.head[1] - 120, 90, seg(t, 151.9, 152.3), 'hck');
    camEnd();
    if (t < 147.8) flash(1 - seg(t, 147.4, 147.8), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [O.dark, '#4A3F5C']);
  }

  // the clinic and the finale keep their v1 staging, shifted onto the new narration
  const shotI = (t, lt, dur) => clinic(t - 33.9, lt, dur);
  const shotJ = (t, lt, dur) => finale(t - 30.45, lt, dur);

  shots([[0, shotA], [24.6, shotB], [54.9, shotC], [85.0, shotD], [97.4, shotE], [109.9, shotF], [123.6, shotG], [138.9, shotH], [153.6, shotI], [166.6, shotJ]]);
})();

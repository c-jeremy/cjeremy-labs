// zinc.js: "Pip讲身体里的锌", 854 s. A hot open (Pip photographs an egg at fertilisation and is blasted by its zinc
// fireworks), then why a metal that never trades electrons sits in one protein in ten: zinc grips hard and pulls hard on
// water without making radicals, so it catalyses (carbonic anhydrase's ping-pong), holds proteins up (SOD1, zinc
// fingers, insulin) and signals (synapses, immune cells, the egg). The turn: the same grip makes loose zinc dangerous
// (metallothionein, ZIP/ZnT, MTF-1). Then food and phytate, too little (Prasad, acrodermatitis enteropathica, taste) and
// too much (copper trapped, denture cream, Wilson's, metal fume fever), and back to the fireworks. See storyboards/zinc.md.
// Faster and denser than selenium on purpose, but the hot open gets ~10 s with no voice. Every gag acts out a step.
// Props from mrna_kit.js (MK); helpers copied from copper.js, selenium.js, meiosis.js and pip_sheets.js say so.
// Every time is tied to a voice line: L(i, d) = line i's start + d seconds.
(() => {
  const K = MK;
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const Z = {
    zn: '#A9B2BC', znDk: '#6F7984', znLt: '#EEF2F6', spark: '#DFFFF4', sparkG: '#7FE8C8',
    el: '#FFE7A0', elDk: '#C99A2E', cu: '#D27A3E', cuDk: '#9A4F22', cuLt: '#F2B27A', cu2: '#3E8ED0', cu2Dk: '#245F99', cu2Lt: '#9BC9F0',
    fe: '#B8452F', feDk: '#7E2A1C', se: '#C8323C', seDk: '#8A1F2A', mg: '#9CCB8A', mgDk: '#5E8F4E', mn: '#C98BB5', mnDk: '#8F5A80',
    water: '#6FB2E3', waterDk: '#3F7FB8', o: '#8CC8EE', oDk: '#4F8FC0', c: '#4B4F63', prot: '#E27A92',
    cys: '#E8C547', cysDk: '#B8932A', his: '#3FA79E', hisDk: '#25706A', rad: '#D2427E', radDk: '#8E1F52', h2o2: '#B79AD6', h2o2Dk: '#8668AE',
    // worlds
    night: '#1C2046', nightBlob: '#2B3170', egg: '#F2D5E0', eggDk: '#D3A2BA', zona: '#F7EDF5', corona: '#E7B79F', coronaDk: '#C98E74',
    spermH: '#C9D4F2', bench: '#3A3F6A', benchDk: '#2A2E52', scope: '#C9CFD8', scopeDk: '#8D96A6',
    cam: '#4A4552', camDk: '#2E2A35', brass: '#D9A54A', brassDk: '#A87828'
  };
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));
  const pulseK = (t, a, len = .7) => t > a && t < a + len ? Math.sin(seg(t, a, a + len) * Math.PI) : 0;
  const on = (t, a, b, fi = .3, fo = .3) => Math.min(ease(seg(t, a, a + fi)), 1 - ease(seg(t, b - fo, b)));   // 0→1 at a, 1→0 at b
  const popK = k => k <= 0 ? 0 : backOut(clamp(k));                 // a pop-in scale; callers skip drawing while it is < .05
  const rotPts = (P, x, y, a, s = 1) => P.map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s]);
  const rotEll = (x, y, rx, ry, n, rot) => { const c = Math.cos(rot), s = Math.sin(rot); return ellPts(0, 0, rx, ry, n).map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]); };

  // ---------- small effects ----------
  function streaks(k, key, vertical = false, col = PAL.cream) {     // speed lines for a whip pan or a rewind (from selenium.js)
    if (k <= .15) return;
    for (let i = 0; i < 14; i++) {
      boilSeed('sl' + key + i);
      const p = hash(i + 3), len = (260 + 520 * hash(i + 9)) * k, w = 2 + 5 * hash(i + 5);
      if (vertical) { const x = p * W; inkLine([[x, H * hash(i + 11) - len / 2], [x, H * hash(i + 11) + len / 2]], w, col, 'ink', 0); }
      else { const y = p * H; inkLine([[W * hash(i + 11) - len / 2, y], [W * hash(i + 11) + len / 2, y]], w, col, 'ink', 0); }
    }
  }
  function inset(x, y, r, k, key, draw, col = PAL.cream) {         // a round inset bubble, a close-up drawn inside (from copper.js)
    const q = popK(k); if (q < .05) return; boilSeed('in' + key);
    paint(ellPts(x, y, r * q, r * q, 36), { wash: col, ink: PAL.ink, sw: 1.4 });
    push(); translate(x, y); scale(q); translate(-x, -y); draw(); pop();
  }
  function puff(x, y, r, k, key, col = '#E4D8EC') {                  // a soft puff (from copper.js)
    if (k <= .3 || r < 2) return; boilSeed('pf' + key);
    for (let i = 0; i < 4; i++) { const a = i * 1.7 + .4, d = r * .45 * hash(i + 3); paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d * .6, r * (.55 + .3 * hash(i)) * k, r * (.45 + .25 * hash(i + 1)) * k, 14, 1), { wash: col, ink: PAL.ink, sw: .7 }); }
  }
  // a four-point spark that shines (glow is additive, so it reads on the dark grounds)
  function spark(x, y, r, key, g = 1, col = Z.spark) {
    if (r < 1.5) return;
    if (g > .02) glow(x, y, r * 4, Z.sparkG, .55 * g);
    boilSeed('sp' + key);
    paint(starPts(x, y, r, .3, 4, hash(key.length + r) * .6), { wash: col, ink: null });
  }

  // a + or − in a cream disc, thinner than the kit's (K.charge) so a pair on a small ion never reads as two eyes
  function chg(sign, x, y, s, k, col, key = '') {
    if (k <= .02) return; boilSeed('cg' + key); const q = backOut(clamp(k));
    paint(ellPts(x, y, s * .55 * q, s * .55 * q, 12), { wash: PAL.cream, ink: col, sw: clamp(s / 30, .4, .9) });
    K.glyph(sign, x, y, s * .62 * q, col, clamp(s / 16, .6, 1.8));
  }
  // an ion's charge as one small badge on its upper-right rim ("++" in a cream pill): marks inside the bead, or two discs
  // side by side, read as a pair of eyes. (x, y, r) = the ion.
  function marks(sign, n, x, y, r, k, key, col = PAL.ink) {
    if (k <= .02 || r < 9) return; boilSeed('mk' + key); const q = backOut(clamp(k)), h = r * .44 * q, gap = r * .3 * q, w = n * gap + h * .55;
    const bx = x + r * .74, by = y - r * .74;
    paint(rrPts(bx - w / 2, by - h / 2, w, h, h / 2), { wash: PAL.cream, ink: col, sw: clamp(r / 30, .5, 1.1) });
    for (let i = 0; i < n; i++) K.glyph(sign, bx + (i - (n - 1) / 2) * gap, by, h * .6, col, clamp(r / 26, .7, 2));
  }
  // ---------- the cast of ions (copper.js cu/el/water/proton, with zinc's own bead) ----------
  // Zn²⁺: a silver bead with a white crescent and two + discs. It never changes colour in this film.
  function zn(x, y, r, key, o = {}) {
    if (r < 2) return;
    if (o.glow) glow(x, y, r * 3.4, '#BFEFFF', o.glow);
    boilSeed('zn' + key);
    paint(ellPts(x, y, r, r, 18), r >= 26 ? { wash: Z.zn, fill: Z.znDk, fillOp: 55, tex: .4, ink: PAL.ink, sw: clamp(r / 22, .6, 1.4) } : { wash: Z.zn, ink: PAL.ink, sw: clamp(r / 22, .5, 1.3) });
    paint(ellPts(x - r * .35, y - r * .38, r * .3, r * .18, 10, 0, -.6), { wash: Z.znLt, ink: null });
    if (o.plus !== 0 && r > 9) { const s = r * .46; marks('+', 2, x, y, r, o.plus ?? 1, key + 'p'); }
  }
  // the full shell: a tight ring of electron sparks round a zinc (n of them; pull: one tugged outward by d px toward ang)
  function shell(x, y, R, t, key, o = {}) {
    const n = o.n ?? 18, spin = (o.spin ?? .25) * t;
    boilSeed('shr' + key); inkLine(ellPts(x, y, R, R, 40).concat([ellPts(x, y, R, R, 40)[0]]), .9, mixCol(Z.elDk, PAL.cream, .4), 'inkfine', .3);
    for (let i = 0; i < n; i++) {
      const a = spin + i / n * TAU; let px = x + Math.cos(a) * R, py = y + Math.sin(a) * R;
      if (o.tug && i === 0) { px += Math.cos(o.tugA) * o.tug; py += Math.sin(o.tugA) * o.tug; }
      if (o.skip === i) continue;
      el(px, py, o.er ?? 9, key + i);
    }
  }
  function cu(x, y, r, s2, key, glowK = 0, plus = 1) {              // Cu⁺ orange (one +) → Cu²⁺ blue (two +), from copper.js
    if (r < 2) return;
    const k = clamp(s2);
    if (glowK > 0) glow(x, y, r * 3.2, k > .5 ? '#7FC4FF' : '#FFB070', glowK);
    boilSeed('cu' + key);
    paint(ellPts(x, y, r, r, 18), r >= 28 ? { wash: mixCol(Z.cu, Z.cu2, k), fill: mixCol(Z.cuDk, Z.cu2Dk, k), fillOp: 55, tex: .4, ink: PAL.ink, sw: clamp(r / 22, .6, 1.4) } : { wash: mixCol(Z.cu, Z.cu2, k), ink: PAL.ink, sw: clamp(r / 22, .6, 1.4) });
    paint(ellPts(x - r * .35, y - r * .38, r * .28, r * .18, 10, 0, -.6), { wash: mixCol(Z.cuLt, Z.cu2Lt, k), ink: null });
    if (plus > 0 && r > 9) {
      const s = r * .62, two = backOut(seg(k, .35, .8));
      marks('+', two > .5 ? 2 : 1, x, y, r, plus, key + 'p');
    }
  }
  function el(x, y, r, key, glowK = 0) {                            // an electron: a cream-yellow spark with a − disc (copper.js)
    if (r < 2) return;
    if (glowK > 0) glow(x, y, r * 3, '#FFE08A', glowK);
    boilSeed('el' + key);
    paint(starPts(x, y, r * 1.5, .42, 4, T * 2 % TAU), { wash: Z.el, ink: Z.elDk, sw: .6 });
    if (r > 6) K.charge('-', x, y, r * 1.05, 1, Z.elDk, key + 'm');
  }
  function ion(x, y, r, col, dk, n, key, glyph = '+') {             // a generic metal ion bead with n charge discs (Fe, Mg, Mn)
    if (r < 2) return; boilSeed('io' + key);
    paint(ellPts(x, y, r, r, 16), { wash: col, ink: PAL.ink, sw: clamp(r / 22, .6, 1.3) });
    paint(ellPts(x - r * .35, y - r * .38, r * .25, r * .16, 10, 0, -.6), { wash: mixCol(col, PAL.cream, .55), ink: null });
    marks(glyph, n, x, y, r, 1, key + 'c');
  }
  function water(x, y, s, key, ang = 0) {                           // H₂O: a blue droplet with two cream H dots
    if (s < .05) return; boilSeed('wa' + key);
    paint(ellPts(x, y, 18 * s, 16 * s, 14), { wash: Z.water, ink: PAL.ink, sw: .9 });
    for (const sd of [-1, 1]) { const a = ang + Math.PI / 2 + sd * .9; paint(ellPts(x + Math.cos(a) * 19 * s, y + Math.sin(a) * 19 * s, 8 * s, 8 * s, 10), { wash: PAL.cream, ink: PAL.ink, sw: .7 }); }
  }
  function hydroxide(x, y, s, key, ang = Math.PI / 2) {             // OH⁻: a blue bead, one H dot, a − disc
    if (s < .05) return; boilSeed('oh' + key);
    paint(ellPts(x, y, 18 * s, 16 * s, 14), { wash: Z.water, ink: PAL.ink, sw: .9 });
    paint(ellPts(x + Math.cos(ang) * 19 * s, y + Math.sin(ang) * 19 * s, 8 * s, 8 * s, 10), { wash: PAL.cream, ink: PAL.ink, sw: .7 });
    K.charge('-', x - 4 * s, y - 2 * s, 15 * s, 1, Z.waterDk, key + 'm');
  }
  function proton(x, y, s, key) {                                  // H⁺: a cream disc with a rose + (copper.js)
    boilSeed('h' + key); const r = 15 * s;
    paint(ellPts(x, y, r, r, 12), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
    K.glyph('+', x, y, r * 1.1, Z.prot, Math.max(1, r / 7));
  }
  function co2(x, y, s, key, ang = 0) {                             // CO₂: a charcoal C between two sky-blue O
    if (s < .05) return; boilSeed('co' + key);
    const dx = Math.cos(ang) * 24 * s, dy = Math.sin(ang) * 24 * s;
    for (const sd of [-1, 1]) paint(ellPts(x + sd * dx, y + sd * dy, 15 * s, 15 * s, 12), { wash: Z.o, ink: PAL.ink, sw: .8 });
    paint(ellPts(x, y, 13 * s, 13 * s, 12), { wash: Z.c, ink: PAL.ink, sw: .8 });
  }
  function bicarb(x, y, s, key, ang = 0) {                          // HCO₃⁻: a charcoal C with three blue O, one H, a −
    if (s < .05) return; boilSeed('bc' + key);
    for (let i = 0; i < 3; i++) { const a = ang - Math.PI / 2 + i / 3 * TAU; paint(ellPts(x + Math.cos(a) * 22 * s, y + Math.sin(a) * 22 * s, 14 * s, 14 * s, 12), { wash: Z.o, ink: PAL.ink, sw: .8 }); }
    const a = ang - Math.PI / 2 + TAU / 3; paint(ellPts(x + Math.cos(a) * 36 * s, y + Math.sin(a) * 36 * s, 7 * s, 7 * s, 10), { wash: PAL.cream, ink: PAL.ink, sw: .6 });
    paint(ellPts(x, y, 12 * s, 12 * s, 12), { wash: Z.c, ink: PAL.ink, sw: .8 });
    K.charge('-', x + Math.cos(ang + Math.PI / 6) * 30 * s, y + Math.sin(ang + Math.PI / 6) * 30 * s, 13 * s, 1, Z.waterDk, key + 'm');
  }
  function h2o2(x, y, s, ang, key) {                               // a lilac dumbbell (copper.js)
    if (s < .05) return; boilSeed('hp' + key);
    const dx = Math.cos(ang) * 20 * s, dy = Math.sin(ang) * 20 * s;
    paint(ribbon([[x - dx, y - dy], [x + dx, y + dy]], 9 * s, 9 * s), { wash: Z.h2o2Dk, ink: PAL.ink, sw: .7 });
    for (const sd of [-1, 1]) paint(ellPts(x + sd * dx, y + sd * dy, 14 * s, 14 * s, 12), { wash: Z.h2o2, ink: PAL.ink, sw: .9 });
  }
  function radical(x, y, r, t, key) {                              // a spiky magenta star with the unpaired-electron dot (copper.js)
    if (r < 2) return; boilSeed('rd' + key);
    paint(starPts(x, y, r, .52 + .06 * Math.sin(t * 9), 8, t * 2 + hash(key.length)), { wash: Z.rad, ink: PAL.ink, sw: clamp(r / 26, .6, 1.3) });
    paint(ellPts(x + r * .1, y - r * .1, r * .14, r * .14, 8), { wash: PAL.ink, ink: null });
  }

  // ---------- the egg and the sperm (from meiosis.js, recoloured for the dark field) ----------
  function sperm(x, y, s, ang, t, col, key, tail = 1) {           // head first along ang, the tail beats behind it
    boilSeed('spm' + key);
    const ca = Math.cos(ang), sa = Math.sin(ang), P = [];
    if (tail > .02) {
      for (let i = 0; i <= 10; i++) { const d = 12 * s + i * 7 * s * tail, w = Math.sin(t * 13 - i * .8 + hash(key.length) * 6) * (1.5 + i * .9) * s * tail; P.push([x - ca * d - sa * w, y - sa * d + ca * w]); }
      inkLine(P, clamp(1.6 * s, .6, 3.2), PAL.cream, 'inkfine', .6);
    }
    paint(rotEll(x, y, 15 * s, 10.5 * s, 14, ang), { wash: col, ink: PAL.ink, sw: Math.min(1, .7 * s) });
    paint(rotEll(x + ca * 4 * s, y + sa * 4 * s, 6 * s, 5 * s, 10, ang), { wash: mixCol(col, PAL.cream, .45), ink: null });
  }
  // the egg: corona cells round a soft zona round the ooplasm. o: hard (0..1, the zona hardened to a glinting shell),
  // quiver (a wobble), ripple ([angle, k]: a bright wave running round the surface from angle), inner() drawn inside.
  function egg(x, y, r, t, key, o = {}) {
    const qv = o.quiver || 0, R = r * (1 + .025 * qv * Math.sin(t * 40));
    auditBox('egg', key, x - R * 1.2, y - R * 1.2, x + R * 1.2, y + R * 1.2);
    glow(x, y, R * 1.7, '#8A6FB8', .35);
    boilSeed('egg' + key);
    if (o.corona !== false) for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + .08 * wob(t, .05, i * .1); paint(ellPts(x + Math.cos(a) * R * 1.2, y + Math.sin(a) * R * 1.2, R * .12, R * .085, 10, 0, a), { wash: Z.corona, ink: PAL.ink, sw: .7 }); }
    const hard = o.hard || 0;
    paint(ellPts(x, y, R * 1.1, R * 1.1, 40), { wash: mixCol(Z.zona, '#A9BCD6', hard), ink: PAL.ink, sw: clamp(r / 160, .7, 1.4) * (1 + 1.4 * hard) });
    paint(ellPts(x, y, R * .96, R * .96, 38), { wash: Z.egg, ink: PAL.ink, sw: clamp(r / 200, .5, 1) });
    paint(ellPts(x + R * .12, y + R * .14, R * .78, R * .74, 26), { fill: Z.eggDk, fillOp: 45, bleed: .08, ink: null });
    if (hard > .05) for (let i = 0; i < 5; i++) { const a = -2.3 + i * .35; inkLine([[x + Math.cos(a) * R * 1.03, y + Math.sin(a) * R * 1.03], [x + Math.cos(a + .18) * R * 1.03, y + Math.sin(a + .18) * R * 1.03]], 2.2 * hard, PAL.cream, 'ink', .2); }
    if (o.inner) o.inner(R);
    if (o.ripple && o.ripple[1] > 0 && o.ripple[1] < 1) {           // the calcium wave: a bright arc sweeping both ways round the egg
      const [a0, k] = o.ripple, sp = Math.PI * easeOut(k);
      for (const sd of [-1, 1]) { const P = []; for (let i = 0; i <= 12; i++) { const a = a0 + sd * sp * i / 12; P.push([x + Math.cos(a) * R * 1.0, y + Math.sin(a) * R * 1.0]); }
        for (let j = 4; j <= 12; j += 2) glow(P[j][0], P[j][1], R * (.12 + .03 * j), '#9FE8FF', .45 * (1 - k) * j / 12); }
    }
  }
  // one burst of zinc sparks off the egg's surface, like a firework shell: n sparks fly out from radius r with a fading
  // trail, slow, droop and twinkle out. k 0..1 through the burst.
  function burst(x, y, r, k, n, key, o = {}) {
    if (k <= 0 || k >= 1) return;
    const sz = o.s ?? 1, g = o.g ?? 1;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + hash(i + key.length * 7) * .3, sp = .55 + .6 * hash(i * 3.1 + 2), reach = r * (o.reach ?? .55) * sp;
      const at = q => { const d = r * 1.04 + reach * easeOut(q); return [x + Math.cos(a) * d, y + Math.sin(a) * d + 60 * q * q * (o.fall ?? 1)]; };
      const life = .55 + .4 * hash(i + 9), q = k / life; if (q >= 1) continue;
      const p = at(q), fade = 1 - seg(q, .55, 1), tw = q > .55 ? .6 + .4 * Math.sin(k * 60 + i * 2.1) : 1;
      if (q < .7) { boilSeed('tr' + key + i); inkLine([at(Math.max(0, q - .25)), at(Math.max(0, q - .12)), p], (2.6 - 1.6 * q) * sz, '#F2FFFB', 'ink', .4); }
      spark(p[0], p[1], (9 + 8 * hash(i + 4)) * fade * tw * sz * (q < .06 ? q / .06 : 1), key + i, fade * g);
    }
  }
  // ---------- the camera (Pip's running gag): a press camera with a flash dish; (x, y) = where the hand holds it ----------
  function camera(x, y, s, rot, key, o = {}) {
    boilSeed('cam' + key);
    push(); translate(x, y); rotate(rot); scale(s);
    paint(rrPts(-34, -26, 68, 48, 8), { wash: Z.cam, fill: Z.camDk, fillOp: 50, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(-22, -36, 22, 12, 3), { wash: Z.camDk, ink: PAL.ink, sw: .8 });
    paint(ellPts(18, -2, 15, 15, 16), { wash: Z.brass, ink: PAL.ink, sw: .9 }); paint(ellPts(18, -2, 9, 9, 14), { wash: '#2A3A55', ink: PAL.ink, sw: .7 });
    paint(ellPts(15, -5, 3, 2, 6), { wash: PAL.cream, ink: null });
    inkLine([[-14, -36], [-14, -56]], 2, PAL.ink, 'ink', 0);             // the flash dish on its stalk
    paint([[-40, -78], [12, -78], [-6, -56], [-22, -56]], { wash: '#E7E1D6', fill: '#BDB4A6', fillOp: 50, ink: PAL.ink, sw: 1 });
    paint(ellPts(-14, -64, 6, 6, 10), { wash: o.lit ? '#FFFBEA' : '#F2E6C9', ink: PAL.ink, sw: .6 });
    if (o.smoke) for (let i = 0; i < 3; i++) puff(-14 + 10 * i - 10, -90 - 30 * o.smoke - i * 12, 14 + 8 * i, .9, key + 'sm' + i, '#8D8794');
    pop();
    if (o.lit) glow(x + (-14 * Math.cos(rot) + 64 * Math.sin(rot)) * s, y + (-14 * Math.sin(rot) - 64 * Math.cos(rot)) * s, 260 * o.lit * s, '#FFF6D8', o.lit);
  }

  // ---------- worlds ----------
  function darkField(t, key, col = Z.night) {                      // the microscope's dark field: indigo, slow blobs, faint motes
    K.wash(col, t, { key, blob: Z.nightBlob, n: 3 });
    K.motes(t, 12, mixCol(col, '#8E97D8', .35), { key: key + 'm' });
  }
  // the hot-open action clock: live until the freeze, frozen under L1, a rewind at L2, then a replay (fast to the
  // burst, slow through the waves)
  const FREEZE = 9.2, BOOM = 5.6;
  function hotA(t) {
    if (t < FREEZE) return t;
    const r0 = L(2), r1 = L(2, .6), b = L(2, 2.2);
    if (t < r0) return FREEZE;
    if (t < r1) return lerp(FREEZE, 3.9, ease(seg(t, r0, r1)));
    if (t < b) return lerp(3.9, BOOM, seg(t, r1, b));
    return BOOM + (t - b) * .4;
  }
  const EGG = [1250, 520], ER = 262, PIPX = 400, PIPY = 800, U1 = 38;
  // sparks waves: [action time, n, reach]; the first is the big one that blasts Pip; in the replay two more follow in real time
  const WAVES = [[BOOM, 64, 1.15], [8.3, 26, .75]];
  function eggState(a) {
    const sp = seg(a, 3.0, 4.35), inK = seg(a, 4.2, 4.65);           // the sperm swims in from the right and noses in
    const sx = lerp(2050, EGG[0] + ER * 1.12, easeOut(sp)) - 60 * ease(inK), sy = lerp(330, EGG[1] - 120, easeOut(sp)) + 20 * ease(inK);
    return { sx, sy, sAng: Math.atan2(EGG[1] - sy, EGG[0] - sx), sTail: 1 - inK, sIn: inK, ripple: seg(a, 4.6, 5.6), quiver: on(a, 4.9, 5.75, .2, .1) };
  }
  function hotPip(a, t) {                                          // Pip's pose for action time a, and where the camera is
    const sneak = TOON.sneak(a, .5, 2.6, { dir: 1, dist: 7 });
    let o = K.act(a, [[0, 'scheme'], [2.7, 'calm', { lookX: .9, lookY: -.1 }], [3.35, 'wow', { lookX: 1, lookY: -.2, take: .9 }], [4.4, 'eek', { lookX: 1 }]]);
    if (a < 2.7) o = { ...o, face: 'scheme', ...TOON.mix({}, sneak) };
    let dx = a < 2.7 ? (sneak.dx || 0) : 7 + 1.4 * ease(seg(a, 4.5, 5.4));    // leans in toward the egg before the bang
    const lift = ease(seg(a, 2.7, 3.0)) * (1 - ease(seg(a, 3.3, 3.5))) + ease(seg(a, 4.5, 4.9));
    const camAt = [lerp(1.7, 2.0, lift), lerp(-2.2, -3.3, lift)];
    o = { ...o, dx, armF: { at: camAt }, armB: { at: [lerp(1.2, 1.9, lift), lerp(-1.9, -3.0, lift)] }, armsFront: true, rot: .06 * ease(seg(a, 4.5, 5.4)) };
    let camOn = a < BOOM, camRot = 0;
    o = TOON.mix(o, TOON.blast(a, BOOM, { len: 3.0 }));
    if (a >= BOOM) o = { ...o, armF: [-1.2, 1.55], armB: [-1.3, 1.5] };
    if (a > 8.3 && a < 9.4) o = TOON.mix(o, { sq: -.15 * pulseK(a, 8.3, .35), dy: -.6 * pulseK(a, 8.3, .4), tint: 'soot', tintK: 1, leaf: -.3 + .5 * Math.sin(a * 30) * on(a, 8.3, 8.9, .05, .3) });
    if (a > 8.6) o = { ...o, face: 'deadpan', lookX: 0, lookY: 0, turn: .05 * (1 - seg(a, 8.6, 8.8)), tint: 'soot', tintK: a < 9.4 ? 1 : o.tintK ?? 1, emote: null };
    return { o, dx, camOn, camRot };
  }
  function shotA1(t, lt, dur) {
    K.setT(t);
    const a = hotA(t), frz = t >= FREEZE && t < L(2) ? 1 : 0, rew = t > L(2) && t < L(2, .6);
    const grey = ease(seg(t, FREEZE, FREEZE + .15)) * (1 - ease(seg(t, L(2, -.1), L(2, .3))));
    // camera: a wide two-shot; under L1 push to Pip's sooty face, then to the egg; in the replay in on the sparks, out
    let c = kf(t, [[0, [960, 560, 1.0]], [4.4, [960, 560, 1.0]], [5.4, [900, 570, 1.08]], [FREEZE, [900, 570, 1.08]],
      [L(1, 2.6), [900, 570, 1.08]], [L(1, 3.6), [470, 640, 1.85]], [L(1, 5.3), [470, 640, 1.85]], [L(1, 6.4), [1150, 540, 1.25]],
      [L(2, .6), [960, 560, 1.0]], [L(2, 4.3), [960, 560, 1.0]], [L(2, 5.0), [1430, 330, 2.1]], [L(2, 6.7), [1430, 330, 2.1]], [L(2, 7.6), [1180, 520, 1.05]]], ease);
    const shk = a > BOOM && a < BOOM + .25 && !frz ? shakeXY(t, 16) : rew ? [12 * Math.sin(t * 70), 0] : [0, 0];
    camBegin(c[0] + shk[0] + 6 * wob(t, .05) * (1 - frz), c[1] + shk[1] + 4 * wob(t, .04) * (1 - frz), c[2]);
    const probe = ease(seg(t, L(2, 6.9), L(2, 7.8)));                // "用会发光的探针一照": the field darkens, the sparks glow brighter
    darkField(t, 'a1', mixCol(Z.night, '#101330', probe));
    const s = eggState(a);
    egg(EGG[0], EGG[1], ER, t, 'a1e', { ripple: [s.sAng + Math.PI, s.ripple], quiver: s.quiver });
    if (s.sIn < .98) sperm(s.sx, s.sy, 2.3, s.sAng, frz ? FREEZE : t, Z.spermH, 'a1s', s.sTail);
    // the bursts: the big one at the bang, a smaller one at 8.3; in the replay two more waves follow in real time
    const after = t > L(2, 2.2);
    for (const [a0, n, reach] of WAVES) burst(EGG[0], EGG[1], ER, seg(a, a0, a0 + 2.6), n, 'a1w' + a0, { reach, g: 1 + probe });
    if (after) for (const [i, t0] of [[0, L(2, 3.3)], [1, L(2, 4.3)], [2, L(2, 7.0)]]) burst(EGG[0], EGG[1], ER, seg(t, t0, t0 + 3.2), 44, 'a1r' + i, { reach: .85 + .15 * i, g: 1 + probe, s: 1 + .3 * probe });
    // Pip and the camera
    const { o, camOn } = hotPip(a, t);
    const g = TOON.pip(PIPX, PIPY, U1, { ...o, key: 'a1pip' });
    if (camOn) { const h = TOON.hand(PIPX, PIPY, U1, o); camera(h[0] + 14, h[1] - 6, 1.05, -.05, 'a1cam', { lit: a > BOOM - .05 && a < BOOM + .2 ? 1 : 0 }); }
    else {                                                          // knocked out of its hands: it tumbles away down-left, smoking
      const k = seg(a, BOOM, BOOM + 1.4), h0 = [PIPX + 2.0 * U1 + 9 * U1, PIPY - 3.0 * U1];
      const p = arcPt(h0, [PIPX + 9 * U1 + 260, PIPY + 150], 120, easeOut(k));
      camera(p[0], p[1], 1.05, 2.6 * easeOut(k), 'a1cam', { lit: a < BOOM + .2 ? 1 - seg(a, BOOM, BOOM + .2) : 0, smoke: seg(a, BOOM + .3, BOOM + 3) });
    }
    // the inset under 几十亿个锌原子: one spark is a cloud of tiny zinc ions
    camEnd();
    inset(1500, 300, 190, on(t, L(2, 4.5), L(2, 6.8), .35, .3), 'a1in', () => {
      for (let i = 0; i < 13; i++) { const a2 = i * 2.4, d = 135 * Math.sqrt((i + .5) / 13); zn(1500 + Math.cos(a2) * d, 300 + Math.sin(a2) * d + 4 * Math.sin(t * 3 + i), 27, 'a1z' + i, { glow: .25 }); }
    }, '#E6F7F1');
    if (grey > .01) paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#77737F', washOp: 120 * grey, ink: null });
    if (a > BOOM && a < BOOM + .25 && !frz) flash(.75 * (1 - seg(a, BOOM, BOOM + .25)), '#F4FFFB');
    streaks(rew ? on(t, L(2), L(2, .6), .1, .2) : 0, 'a1rw' + Math.floor(t * 12) % 3);
    if (lt < .9) { const at = [W / 2, H / 2]; iris(at[0], at[1], lerp(0, 1500, easeIn(seg(lt, .05, .9))), PAL.ink); }
    if (lt > dur - .5) { const k = seg(lt, dur - .5, dur); flash(k, PAL.cream); }
  }

  // ================================ A2 · the lab bench, the brake, the hard shell (L3 – L5) ================================
  function scope(x, y, s, key) {                                   // a microscope seen side-on; (x, y) = its foot
    boilSeed('sc' + key);
    push(); translate(x, y); scale(s);
    paint(rrPts(-120, -24, 240, 28, 10), { wash: Z.scopeDk, ink: PAL.ink, sw: 1.1 });
    paint(ribbon([[60, -20], [70, -200], [10, -330]], 34, 26), { wash: Z.scope, fill: Z.scopeDk, fillOp: 40, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(-90, -140, 120, 16, 4), { wash: Z.scopeDk, ink: PAL.ink, sw: 1 });
    paint(ribbon([[-40, -170], [-10, -330], [10, -400]], 40, 34), { wash: Z.scope, ink: PAL.ink, sw: 1.1 });
    paint(ribbon([[-46, -200], [-50, -160]], 18, 12), { wash: Z.scopeDk, ink: PAL.ink, sw: .9 });
    paint(ribbon([[10, -400], [-30, -460]], 26, 22), { wash: Z.scopeDk, ink: PAL.ink, sw: 1 });
    pop();
  }
  function mouseT(x, y, s, t, key, look = 0) {                     // a little lab mouse (dot eyes), facing left; (x, y) = its feet
    boilSeed('ms' + key);
    const b = 2 * Math.sin(t * 6);
    inkLine(through([[x + 60 * s, y - 14 * s], [x + 110 * s, y - 30 * s], [x + 130 * s, y - 70 * s]]), 2.2 * s, '#D9A0A8', 'ink', .6);
    paint(ellPts(x + 20 * s, y - 34 * s + b, 52 * s, 34 * s, 18), { wash: '#ECE6EE', fill: '#C9C0CE', fillOp: 50, ink: PAL.ink, sw: 1 });
    paint(ellPts(x - 30 * s, y - 50 * s + b - look * 10 * s, 30 * s, 24 * s, 16, 0, -.3 - look * .3), { wash: '#ECE6EE', ink: PAL.ink, sw: 1 });
    paint(ellPts(x - 14 * s, y - 80 * s + b - look * 10 * s, 15 * s, 15 * s, 12), { wash: '#F2C9D0', ink: PAL.ink, sw: .9 });
    paint(ellPts(x - 40 * s, y - 56 * s + b - look * 12 * s, 4 * s, 4 * s, 8), { wash: PAL.ink, ink: null });
    paint(ellPts(x - 60 * s, y - 46 * s + b - look * 14 * s, 5 * s, 4 * s, 8), { wash: '#D9849A', ink: PAL.ink, sw: .5 });
  }
  // the meiosis-II spindle: chromosomes on the plate (sisters joined), poles above and below; sep 0..1 pulls the sisters apart
  function spindle(x, y, s, sep, key) {
    boilSeed('spd' + key);
    const top = [x, y - 120 * s], bot = [x, y + 120 * s];
    for (let i = -3; i <= 3; i++) { inkLine(through([top, [x + i * 26 * s, y - 20 * s], [x + i * 30 * s, y]]), .7, '#9D8DBF', 'inkfine', .5); inkLine(through([bot, [x + i * 26 * s, y + 20 * s], [x + i * 30 * s, y]]), .7, '#9D8DBF', 'inkfine', .5); }
    for (const p of [top, bot]) paint(ellPts(p[0], p[1], 9 * s, 9 * s, 10), { wash: '#F0A93C', ink: PAL.ink, sw: .7 });
    for (let i = -2; i <= 2; i++) for (const sd of [-1, 1]) {
      const cx = x + i * 30 * s, cy = y + sd * (8 + 70 * ease(sep)) * s, col = i % 2 ? '#5B8FD6' : '#E2708C';
      paint(rotEll(cx, cy, 6 * s, 20 * s, 10, .1 * i), { wash: col, ink: PAL.ink, sw: .7 });
    }
  }
  function lever(x, y, s, ang, key, clamped) {                     // a handbrake: a ratchet quadrant, a lever, zinc beads jamming it
    boilSeed('lv' + key);
    paint(ellPts(x, y, 46 * s, 46 * s, 20).filter((_, i) => i <= 10).concat([[x, y]]), { wash: Z.scopeDk, ink: PAL.ink, sw: 1 });
    const tip = [x + Math.cos(ang) * 150 * s, y + Math.sin(ang) * 150 * s];
    paint(ribbon([[x, y], tip], 14 * s, 10 * s), { wash: '#B8BEC9', ink: PAL.ink, sw: 1 });
    paint(rotEll(tip[0], tip[1], 22 * s, 14 * s, 12, ang), { wash: '#C8323C', ink: PAL.ink, sw: 1 });
    paint(ellPts(x, y, 10 * s, 10 * s, 10), { wash: PAL.ink, ink: null });
    for (let i = 0; i < 4; i++) if (clamped[i] > .05) zn(x + Math.cos(.35 + i * .55) * 52 * s, y + Math.sin(.35 + i * .55) * 52 * s, 13 * s * clamped[i], key + 'z' + i, { plus: 0 });
    return tip;
  }
  function shotA2(t, lt, dur) {
    K.setT(t);
    let c;                                                          // three framings: the bench (L3), inside the egg (L4), the shell (L5)
    if (t < L(4, .5)) c = kf(t, [[L(3, -1), [1060, 520, 1.08]], [L(3, 6.0), [1040, 520, 1.0]], [L(4, -.4), [1100, 470, 1.6]]], ease);
    else if (t < L(5, .6)) c = kf(t, [[L(4, .5), [1000, 560, 1.32]], [L(4, 6.0), [1000, 560, 1.32]], [L(4, 7.2), [1080, 500, 1.2]]], ease);
    else c = kf(t, [[L(5, .6), [960, 540, 1.45]], [L(5, 5.0), [960, 540, 1.45]], [L(5, 6.8), [1150, 540, .95]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    if (t < L(4, .5)) {                                            // L3: the bench at night; the mouse looks at its own egg's fireworks
      darkField(t, 'a2b', '#22274F');
      paint(rectPts(-300, 840, W + 600, 600), { wash: Z.bench, fill: Z.benchDk, fillOp: 60, tex: .4, ink: PAL.ink, sw: 1.2 });
      scope(1240, 850, 1.3, 'a2sc');
      const mk = ease(seg(t, L(3, .2), L(3, 1.3))), human = ease(seg(t, L(3, 5.2), L(3, 5.9))), shrug = on(t, L(3, 5.6), L(3, 7.0), .2, .3);
      mouseT(lerp(1900, 1520, mk) + 260 * ease(seg(t, L(3, 6.4), L(3, 7.4))), 845, 1.6, t, 'a2m', ease(seg(t, L(3, 1.3), L(3, 1.9))) * (1 - shrug));
      const ep = [1240 - 30 * 1.3, 850 - 470 * 1.3], sw = { x: 640, y: 360, r: 270 };
      boilSeed('a2cone'); paint([[ep[0] - 18, ep[1]], [sw.x + sw.r * .55, sw.y - sw.r * .8], [sw.x + sw.r * .8, sw.y + sw.r * .55], [ep[0] + 18, ep[1]]], { wash: '#3B4380', washOp: 120, ink: null });
      inset(sw.x, sw.y, sw.r, seg(t, L(3, -.6), L(3, .2)), 'a2iv', () => {
        paint(ellPts(sw.x, sw.y, sw.r, sw.r, 36), { wash: '#12153A', ink: null });
        const er = lerp(110, 160, human);
        egg(sw.x, sw.y, er, t, 'a2ie', { corona: human > .5 });
        const ph = (t - L(3)) / 2.4; burst(sw.x, sw.y, er, frac(ph), 30, 'a2ib' + Math.floor(ph), { reach: .8 });
      }, '#12153A');
    } else if (t < L(5, .6)) {                                     // L4: inside the egg, the brake on meiosis II
      K.wash(Z.egg, t, { key: 'a2i', blob: '#F7E3EB', n: 4 });
      paint(rectPts(-400, -400, W + 800, 640), { wash: Z.night, ink: null });                       // beyond the egg, at the top
      boilSeed('a2zo'); paint(ellPts(1060, 1700, 1760, 1625, 60), { wash: Z.zona, ink: null });
      boilSeed('a2mem'); paint(ellPts(1060, 1700, 1700, 1560, 60), { wash: Z.egg, fill: Z.eggDk, fillOp: 30, ink: PAL.ink, sw: 1.4 });  // the egg's edge
      for (let i = 0; i < 9; i++) { boilSeed('a2gr' + i); paint(ellPts(300 + 170 * i + 40 * hash(i), 330 + 30 * hash(i + 4), 9, 9, 8), { wash: Z.zn, ink: PAL.ink, sw: .6 }); }   // zinc-loaded granules under the membrane
      const rel = L(4, 5.8), sep = seg(t, L(4, 6.8), L(4, 9.0));
      spindle(1290, 540, 1.9, sep, 'a2sp');
      const pb = popK(seg(t, L(4, 7.8), L(4, 9.2))); if (pb > .05) { boilSeed('a2pb'); paint(ellPts(1290, 268 - 46 * pb, 52 * pb, 44 * pb, 14), { wash: mixCol(Z.egg, '#F7E6EE', .5), ink: PAL.ink, sw: 1 }); }
      // the handbrake on the spindle, jammed by zinc; Pip hauls on it until the zinc squirts out
      const PV = [880, 820], freed = t > rel, fly = seg(t, rel, rel + .5);
      const ang = freed ? lerp(-1.75, -3.0, easeOut(fly)) + .06 * spring(t, rel + .5, 5, 16) : -1.75 - .05 * Math.abs(Math.sin(t * 26)) * on(t, L(4, 3.0), rel, .2, .05);
      const jam = [0, 1, 2, 3].map(i => freed ? 1 - seg(t, rel + i * .05, rel + .2 + i * .05) : popK(seg(t, L(4, .6) + i * .25, L(4, 1.0) + i * .25)));
      boilSeed('a2cab'); inkLine(through([[PV[0] + 40, PV[1] - 20], [1100, 700], [1240, 640]]), 2.4, PAL.ink, 'ink', .4);   // the cable to the spindle
      const tip = lever(PV[0], PV[1], 1.0, ang, 'a2lv', jam);
      if (freed) for (let i = 0; i < 4; i++) { const k = seg(t, rel, rel + 1.0); if (k > 0 && k < 1) { const p = arcPt([PV[0] + Math.cos(.35 + i * .55) * 52, PV[1] + Math.sin(.35 + i * .55) * 52], [700 + 180 * i, 240], 160, easeOut(k)); zn(p[0], p[1], 15, 'a2zf' + i, { plus: 0, glow: .5 }); } }
      let o = K.act(t, [[L(4), 'calm', { lookX: .7 }], [L(4, 2.9), 'strain', { lookX: .8 }], [rel, 'shock', { take: 1.2 }], [rel + 1.4, 'dizzy'], [L(4, 8.4), 'happy', { lookX: .9, lookY: -.3 }]]);
      const px = 760, py = 880, u = 34;
      if (t < rel + .05) o = { ...o, armF: { to: [tip[0] - px, tip[1] - py] }, armB: { to: [tip[0] - px - 10, tip[1] - py + 12] }, armsFront: false, rot: -.14 * on(t, L(4, 2.9), rel, .3, .05) };
      o = TOON.mix(o, TOON.slip(t, rel + .05, { dir: 1, lie: .9 }));
      TOON.pip(px, py, u, { ...o, key: 'a2pip' });
    } else {                                                        // L5: the zona hardens; a late sperm bonks off; Pip knocks
      darkField(t, 'a2s');
      const hard = ease(seg(t, L(5, 1.2), L(5, 2.8))), warm = ease(seg(t, L(5, 5.2), L(5, 7.0)));
      const E = [1180, 560], R = 300;
      if (warm > .01) glow(E[0], E[1], R * 2.4, '#FFB98A', .55 * warm);
      egg(E[0], E[1], R, t, 'a2e', { hard });
      for (let i = 0; i < 18; i++) { const k = seg(t, L(5, .2) + i * .05, L(5, 1.4) + i * .05); if (k > 0 && k < 1) { const a = i / 18 * TAU; spark(E[0] + Math.cos(a) * R * lerp(1.0, 1.1, k), E[1] + Math.sin(a) * R * lerp(1.0, 1.1, k), 10 * (1 - k), 'a2k' + i); } }
      // the late sperm: in from the top left, bonks off the shell at +3.2 and tumbles away
      const b = L(5, 3.2), sk = seg(t, L(5, 2.2), b), off = seg(t, b, b + 1.2);
      const sp0 = [520, 120], hit = [E[0] + Math.cos(-2.35) * R * 1.13, E[1] + Math.sin(-2.35) * R * 1.13];
      const sp = t < b ? [lerp(sp0[0], hit[0], ease(sk)), lerp(sp0[1], hit[1], ease(sk))] : arcPt(hit, [380, 80], 140, easeOut(off));
      if (sk > 0 && off < 1) sperm(sp[0], sp[1], 2.4, t < b ? Math.atan2(hit[1] - sp0[1], hit[0] - sp0[0]) : 2.4 - 9 * off, t, Z.spermH, 'a2late', 1);
      if (t > b && t < b + .4) K.burst(hit[0], hit[1], 44, seg(t, b, b + .4), PAL.cream, 'a2bk');
      // Pip knocks on the shell: knock, knock, ow
      const px = 740, py = 790, u = 34, kn = [L(5, 3.75), L(5, 4.1)];
      let o = K.act(t, [[L(5, -1), 'calm', { lookX: .8 }], [L(5, 1.4), 'wow', { lookX: .8, lookY: -.2 }], [L(5, 3.0), 'calm', { lookX: .6, lookY: -.6 }], [L(5, 4.45), 'ouch', { take: 1 }], [L(5, 5.8), 'happy', { lookX: .7, lookY: -.3 }]]);
      if (t > L(5, 3.5) && t < L(5, 4.45)) { const k = Math.max(...kn.map(k0 => pulseK(t, k0 - .14, .28))); o = { ...o, armF: [lerp(.15, .55, k), lerp(2.3, 3.3, k)] }; }
      const sw = K.swim(px, py, u, t, { ...o, talk: false }, 'a2pip');
      for (const k0 of kn) if (t > k0 && t < k0 + .3) K.burst(px + 3.5 * u, sw - 3.6 * u, 30, seg(t, k0, k0 + .3), PAL.cream, 'a2kn' + k0);
    }
    camEnd();
    if (lt < .4) flash(1 - seg(lt, 0, .4), PAL.cream);
    if (t > L(4, -.5) && t < L(4, .3)) flash(on(t, L(4, -.5), L(4, .3), .4, .4), '#F7DCE6');   // through the zona into the egg
    if (t > L(5, -.4) && t < L(5, .4)) flash(on(t, L(5, -.4), L(5, .4), .4, .4), '#F7DCE6');
  }

  // ================================ shared props ================================
  const PASTEL = ['#F2B8A2', '#B8D8C8', '#C9C2EA', '#F4D79A', '#A9CDE8', '#E8B4CF', '#C6DDA0', '#F0C2A0'];
  const pastel = i => PASTEL[((i % 8) + 8) % 8];
  // a protein: a pastel blob of a few lobes with a pocket notched into its top. o: zn (0..1, a zinc in the pocket),
  // lean (radians, toward something), arms (0..1, two little grabbing arms), col.
  function protein(x, y, s, key, o = {}) {
    if (s < .05) return;
    const col = o.col || pastel(key.length + Math.floor(x / 7)), dk = mixCol(col, PAL.ink, .22), lean = o.lean || 0;
    boilSeed('pr' + key);
    push(); translate(x, y); rotate(lean); scale(s);
    if (o.arms) for (const sd of [-1, 1]) { const a = o.arms, hnd = [sd * (36 + 14 * a), -26 - 20 * a]; inkLine([[sd * 30, -16], hnd], 6, dk, 'ink', .3); paint(ellPts(hnd[0], hnd[1], 7, 7, 8), { wash: col, ink: PAL.ink, sw: .8 }); }
    const ph = hash(key.length * 3 + 1) * 6, P = [];
    for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, r = 1 + .09 * Math.sin(a * 3 + ph) + .05 * Math.sin(a * 5 + ph * 2), dent = Math.exp(-Math.pow((a - 1.5 * Math.PI) / .42, 2));
      P.push([Math.cos(a) * 48 * r, Math.sin(a) * 36 * r * (Math.sin(a) < 0 ? .82 : 1) * (1 - .3 * dent)]); }
    paint(P, { wash: col, ink: PAL.ink, sw: 1.2 / Math.sqrt(Math.max(1, s)), curv: .35 });
    boilSeed('prs' + key); paint(ellPts(10, 12, 26, 14, 12), { wash: mixCol(col, PAL.ink, .08), ink: null });
    pop();
    if ((o.zn || 0) > .05) zn(x + Math.sin(lean) * 24 * s, y - Math.cos(lean) * 24 * s, 13 * s * popK(o.zn), key + 'z', { plus: s > .9 ? 1 : 0, glow: o.glow || 0 });
  }
  // a paper-doll body (a pale silhouette with an ink outline, no face); (x, y) = between the feet, h = height
  function body(x, y, h, key, o = {}) {
    boilSeed('bd' + key); const s = h / 600;
    const P = [[0, -600], [40, -590], [55, -545], [45, -505], [30, -490], [100, -470], [130, -420], [150, -260], [128, -255], [110, -400], [100, -330],
      [95, -220], [75, 0], [25, 0], [15, -220], [0, -230]];
    const full = P.concat(P.slice(1, -1).reverse().map(([a, b]) => [-a, b])).map(([a, b]) => [x + a * s, y + b * s * (1 + (o.breath || 0) * (b < -250 && b > -500 ? .03 : 0))]);
    paint(full, { wash: o.col || '#F6EFE3', ink: PAL.ink, sw: 1.2, curv: .4 });
    return { s, at: (a, b) => [x + a * s, y + b * s] };
  }
  // the ping-pong table, seen side-on (flat): a slab, a white edge, a net, legs. y = the top surface
  function ppTable(x0, x1, y, key) {
    boilSeed('pt' + key);
    for (const lx of [x0 + 80, x1 - 80]) paint(rectPts(lx - 9, y + 20, 18, 230), { wash: '#4E5A66', ink: PAL.ink, sw: 1 });
    paint(rectPts(x0, y, x1 - x0, 24), { wash: '#2F7A5C', ink: PAL.ink, sw: 1.2 });
    inkLine([[x0 + 6, y + 3], [x1 - 6, y + 3]], 2.5, PAL.cream, 'ink', 0);
    const mx = (x0 + x1) / 2; paint(rectPts(mx - 4, y - 70, 8, 72), { wash: '#E9E3D6', ink: PAL.ink, sw: .8 });
    for (let k = 0; k < 4; k++) inkLine([[mx - 4, y - 62 + k * 16], [mx + 4, y - 62 + k * 16]], .6, PAL.ink, 'inkfine', 0);
  }
  function ball(x, y, r, key, col = '#FBF7EE') { boilSeed('bl' + key); paint(ellPts(x, y, r, r, 16), { wash: col, ink: PAL.ink, sw: clamp(r / 22, .6, 1.1) }); paint(ellPts(x - r * .3, y - r * .35, r * .28, r * .18, 8, 0, -.5), { wash: PAL.cream, ink: null }); }
  function paddle(x, y, s, ang, key) {                            // a ping-pong bat; (x, y) = the grip
    boilSeed('pd' + key);
    const c = [x + Math.cos(ang) * 46 * s, y + Math.sin(ang) * 46 * s];
    paint(ribbon([[x, y], [x + Math.cos(ang) * 22 * s, y + Math.sin(ang) * 22 * s]], 10 * s, 9 * s), { wash: '#C58A4A', ink: PAL.ink, sw: .9 });
    paint(rotEll(c[0], c[1], 30 * s, 26 * s, 16, ang), { wash: '#C8323C', ink: PAL.ink, sw: 1 });
    return c;
  }
  // a balance: a post, a beam tilted by tilt, two pans; drawL/drawR draw what sits on each pan (given the pan's top)
  function balance(x, y, s, tilt, key, drawL, drawR) {
    boilSeed('bal' + key);
    paint(rectPts(x - 8 * s, y - 220 * s, 16 * s, 220 * s), { wash: '#B9A27A', ink: PAL.ink, sw: 1 });
    paint(ellPts(x, y, 70 * s, 14 * s, 16), { wash: '#9C8560', ink: PAL.ink, sw: 1 });
    const dx = Math.cos(tilt) * 190 * s, dy = Math.sin(tilt) * 190 * s, top = [x, y - 220 * s];
    paint(ribbon([[top[0] - dx, top[1] - dy], [top[0] + dx, top[1] + dy]], 7 * s, 7 * s), { wash: '#B9A27A', ink: PAL.ink, sw: 1 });
    for (const sd of [-1, 1]) {
      const h = [top[0] + sd * dx, top[1] + sd * dy], pan = [h[0], h[1] + 80 * s];
      inkLine([h, [pan[0] - 50 * s, pan[1]]], 1, PAL.ink, 'inkfine', 0); inkLine([h, [pan[0] + 50 * s, pan[1]]], 1, PAL.ink, 'inkfine', 0);
      boilSeed('balp' + key + sd); paint([[pan[0] - 62 * s, pan[1]], [pan[0] + 62 * s, pan[1]], [pan[0] + 40 * s, pan[1] + 16 * s], [pan[0] - 40 * s, pan[1] + 16 * s]], { wash: '#D9C29A', ink: PAL.ink, sw: 1 });
      (sd < 0 ? drawL : drawR)(pan[0], pan[1]);
    }
  }
  function umpireChair(x, y, s, key) {                            // a tall umpire's chair; (x, y) = its feet; returns the seat
    boilSeed('uc' + key);
    for (const sd of [-1, 1]) inkLine([[x + sd * 60 * s, y], [x + sd * 34 * s, y - 300 * s]], 6 * s, '#8C6A44', 'ink', 0);
    for (let k = 1; k < 4; k++) inkLine([[x - 60 * s + k * 7 * s, y - k * 75 * s], [x + 60 * s - k * 7 * s, y - k * 75 * s]], 4 * s, '#8C6A44', 'ink', 0);
    paint(rectPts(x - 50 * s, y - 312 * s, 100 * s, 16 * s), { wash: '#B98A55', ink: PAL.ink, sw: 1 });
    return [x, y - 312 * s];
  }
  // the three verdicts that recur from C1 to the end: a shield (no radicals), a clamp (the grip), a tug (the pull)
  function icon(kind, x, y, s, k, key, t = 0) {
    const q = popK(k); if (q < .05) return; s *= q;
    boilSeed('ic' + kind + key);
    paint(ellPts(x, y, 62 * s, 62 * s, 24), { wash: PAL.cream, ink: PAL.ink, sw: 1.2 });
    if (kind === 'shield') {
      paint([[x - 32 * s, y - 34 * s], [x + 32 * s, y - 34 * s], [x + 30 * s, y + 4 * s], [x, y + 38 * s], [x - 30 * s, y + 4 * s]], { wash: Z.zn, ink: PAL.ink, sw: 1, curv: .3 });
      radical(x + 44 * s + 6 * Math.sin(t * 3), y - 34 * s, 13 * s, t, key + 'r');
      zn(x, y - 4 * s, 15 * s, key + 'z', { plus: 0 });
    } else if (kind === 'clamp') {
      inkLine(through([[x - 26 * s, y - 34 * s], [x - 40 * s, y], [x - 26 * s, y + 34 * s]]), 9 * s, '#8E96A3', 'ink', .5);
      inkLine([[x - 26 * s, y - 34 * s], [x + 14 * s, y - 34 * s]], 9 * s, '#8E96A3', 'ink', 0); inkLine([[x - 26 * s, y + 34 * s], [x + 14 * s, y + 34 * s]], 9 * s, '#8E96A3', 'ink', 0);
      zn(x + 12 * s, y, 20 * s, key + 'z', { plus: 0 });
    } else {
      zn(x - 26 * s, y, 20 * s, key + 'z', { plus: 0 });
      inkLine([[x - 6 * s, y], [x + 42 * s, y + 4 * Math.sin(t * 6)]], 3.5 * s, '#B98A55', 'ink', .3);
      water(x + 40 * s, y + 4 * Math.sin(t * 6), .8 * s, key + 'w', 0);
    }
  }
  function board(t, key, col = '#F5EEDD') { K.wash(col, t, { key, blob: '#FBF6EA', n: 4 }); K.motes(t, 8, mixCol(col, PAL.ink, .12), { key: key + 'm' }); }
  function hall(t, key) {                                         // the zinc-white ping-pong hall: soft lamps over a wash
    K.wash('#E9ECE9', t, { key, blob: '#F7F8F4', n: 4 });
    for (let i = 0; i < 3; i++) { boilSeed('lmp' + key + i); const x = 400 + 560 * i; glow(x, 120, 300, '#FFF0C8', .35); inkLine([[x, -100], [x, 70]], 1.4, PAL.ink, 'inkfine', 0); paint([[x - 50, 110], [x + 50, 110], [x + 26, 70], [x - 26, 70]], { wash: '#4E5A66', ink: PAL.ink, sw: .9 }); }
    paint(rectPts(-400, 930, W + 800, 500), { wash: '#C9CFC9', ink: null });
  }

  // ================================ B1 · two or three grams, one protein in ten (L6 – L10) ================================
  const GRID = (i, cx = 1240, cy = 470, dx = 76, dy = 62) => [cx + (i % 10 - 4.5) * dx, cy + (Math.floor(i / 10) - 4.5) * dy];
  const LIT = i => (i % 10) === ((Math.floor(i / 10) * 3 + 2) % 10);   // one protein in every row of ten holds a zinc
  function shotB1(t, lt, dur) {
    K.setT(t);
    let c = kf(t, [[L(6), [960, 540, 1]], [L(7, -.2), [960, 540, 1]], [L(7, .6), [560, 520, 1.45]], [L(8, -.4), [560, 520, 1.45]], [L(8, .4), [1040, 520, 1.05]],
      [L(9, -.3), [1040, 520, 1.05]], [L(9, .4), [960, 540, 1]], [L(10, -.2), [960, 540, 1]], [L(10, 5.6), [1000, 520, 1.15]], [L(11, -.6), [960, 470, 2.6]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    hall(t, 'b1');
    const BD = [420, 860], bh = 600;
    if (t < L(8, -.2)) {                                           // L6–L7: the body, the balance, Pip the umpire
      ppTable(140, 1780, 880, 'b1t');
      const bd = body(BD[0], BD[1] - 20, bh, 'b1b', { breath: Math.sin(t * 1.6) });
      // the body's zinc: specks all over it, which fly together into one silver ball on the right pan (L6 +3.0 – +5.0)
      const gather = ease(seg(t, L(6, 3.0), L(6, 5.0))), spread = ease(seg(t, L(7, .3), L(7, 1.6)));
      const BS = 1.1, panR = [1270 + 190 * BS, 880 - 220 * BS + 80 * BS];
      for (let i = 0; i < 40; i++) {
        const home = [BD[0] + (hash(i + 3) - .5) * 160, BD[1] - 60 - hash(i + 5) * 470], tgt = [panR[0], panR[1] - 26];
        const g2 = gather * (1 - spread), p = [lerp(home[0], tgt[0], g2), lerp(home[1], tgt[1], g2) - 160 * Math.sin(g2 * Math.PI)];
        if (gather < .98 || spread > .02) { boilSeed('b1sp' + i); paint(ellPts(p[0], p[1], 6, 6, 8), { wash: Z.zn, ink: PAL.ink, sw: .5 }); }
      }
      const lvl = ease(seg(t, L(6, 4.8), L(6, 5.8)));
      balance(1270, 880, BS, lerp(.12, 0, lvl) + .03 * spring(t, L(6, 5.8), 4, 10), 'b1bal',
        (x, y) => { const k = ease(seg(t, L(6, .2), L(6, 1.4))); const by = k < 1 ? lerp(-200, y - 22, easeIn(k)) - 60 * Math.abs(Math.sin(k * 9)) * (1 - k) : y - 22; if (t > L(6, .2)) ball(x, by - 4, 26, 'b1pp'); },
        (x, y) => { if (gather > .98 && spread < .02) zn(x, y - 26, 26, 'b1zb', { plus: 0, glow: .3 }); });
      // L7: the body map: muscles and bones glow with zinc; a thousandth goes into the blood
      const mus = ease(seg(t, L(7, .8), L(7, 2.2))), bon = ease(seg(t, L(7, 1.6), L(7, 3.0))), bld = seg(t, L(7, 3.8), L(7, 6.4));
      if (bon > .01) {                                              // bones: a spine, two thigh bones, two arm bones, knobbed ends
        const bone = (a0, a1, w, key) => { boilSeed('b1bn' + key); const A = bd.at(...a0), B = bd.at(...a1); paint(ribbon([A, B], w * bon, w * bon), { wash: '#F6E9C9', ink: PAL.ink, sw: .8 }); for (const P of [A, B]) for (const sd of [-1, 1]) paint(ellPts(P[0] + sd * w * .6 * bon, P[1], w * .55 * bon, w * .55 * bon, 10), { wash: '#F6E9C9', ink: PAL.ink, sw: .7 }); };
        for (const sd of [-1, 1]) { bone([sd * 50, -230], [sd * 52, -60], 12, 'f' + sd); bone([sd * 112, -440], [sd * 128, -330], 9, 'h' + sd); }
        for (let j = 0; j < 8; j++) { boilSeed('b1vt' + j); const P = bd.at(0, -480 + j * 28); paint(ellPts(P[0], P[1], 11 * bon, 8 * bon, 10), { wash: '#F6E9C9', ink: PAL.ink, sw: .6 }); }
        for (let j = 0; j < 6; j++) zn(...bd.at([-50, 50, 0, -112, 112, 0][j], [-150, -120, -400, -390, -380, -300][j]), 7 * bon, 'b1bz' + j, { plus: 0 });
      }
      if (mus > .01) for (const [a, b, rx, ry] of [[-55, -190, 32, 95], [55, -190, 32, 95], [-120, -390, 20, 56], [120, -390, 20, 56]]) { const p = bd.at(a, b); boilSeed('b1mu' + a + b); paint(ellPts(p[0], p[1], rx * bd.s * mus, ry * bd.s * mus, 16), { wash: '#EFA3A8', washOp: 170, ink: PAL.ink, sw: .7 }); for (let j = 0; j < 5; j++) zn(p[0] + (hash(j + a) - .5) * rx * bd.s, p[1] + (hash(j + b) - .5) * ry * 1.4 * bd.s, 7 * mus, 'b1mz' + a + b + j, { plus: 0 }); }
      if (bld > 0) { const v = [bd.at(96, -470), bd.at(116, -400), bd.at(132, -330), bd.at(144, -270)]; boilSeed('b1v'); inkLine(through(v), 3, '#C8464F', 'ink', .5);
        const Pv = through(v), p = Pv[Math.min(Pv.length - 1, Math.floor(bld * (Pv.length - 1)))]; zn(p[0], p[1], 6, 'b1bl', { plus: 0, glow: .5 }); }
      // Pip the umpire nods at the level balance
      const seat = umpireChair(1680, 880, .95, 'b1uc');
      let o = K.act(t, [[L(6), 'calm', { lookX: -.9, lookY: .3 }], [L(6, 3.2), 'wow', { lookX: -.9, lookY: .2 }], [L(6, 6.0), 'smug', { lookX: -.6 }], [L(7, .4), 'calm', { lookX: -1, lookY: .1 }], [L(7, 4.0), 'wow', { lookX: -1 }]]);
      o = { ...o, flip: true, dy: (o.dy || 0) - .18 * pulseK(t, L(6, 6.1), .4) - .18 * pulseK(t, L(6, 6.6), .4) };
      TOON.pip(seat[0], seat[1], 30, { ...o, key: 'b1pip' });
    } else if (t < L(9, -.2)) {                                    // L8: the grid of 100; Pip the waiter hands out ten zincs
      for (let i = 0; i < 100; i++) { const p = GRID(i), k = seg(t, L(8, .3) + i * .02, L(8, .7) + i * .02), wi = Math.floor(i / 10), cell = (i % 10);
        const gotAt = L(8, 4.4) + wi * .4, got = LIT(i) ? seg(t, gotAt, gotAt + .25) : 0, wave = .06 * Math.sin(t * 3 + i);
        protein(p[0], p[1] + 2 * Math.sin(t * 2 + i), .62 * popK(k), 'g' + i, { zn: wi === 9 ? 0 : got, lean: wave }); }
      // Pip runs along the rows with a tray; the tenth bead is dropped and bounces away
      const run = seg(t, L(8, 4.0), L(8, 8.4)), row = Math.min(9, Math.floor(run * 10)), rp = GRID(row * 10 + 9), lp = GRID(row * 10);
      const px = lerp(lp[0] - 90, rp[0] + 100, frac(run * 10)), py = rp[1] + 40;
      let o = K.act(t, [[L(8), 'calm', { lookX: .6 }], [L(8, 4.0), 'happy'], [L(8, 8.5), 'shock', { take: 1 }], [L(8, 9.3), 'worried', { lookX: .6, lookY: .5 }]]);
      if (run > 0 && run < 1) o = TOON.mix(o, TOON.dash(t, { dir: 1, speed: 1.1 }), { armB: { at: [-1.6, -3.4] } });
      const pp = run <= 0 ? [GRID(0)[0] - 260, GRID(0)[1] + 60] : run >= 1 ? [GRID(99)[0] + 120, GRID(99)[1] + 40] : [px, py];
      TOON.pip(pp[0], pp[1], 26, { ...o, key: 'b1pip8' });
      const tray = TOON.hand(pp[0], pp[1], 26, { ...o, armB: o.armB || [-1, 1.6] }, 'B');
      if (run < 1) { boilSeed('b1tray'); paint(ellPts(tray[0], tray[1] - 4, 34, 8, 14), { wash: '#C9CFD8', ink: PAL.ink, sw: .8 }); for (let j = 0; j < Math.max(0, 9 - row); j++) zn(tray[0] - 22 + (j % 5) * 11, tray[1] - 14 - Math.floor(j / 5) * 9, 6, 'b1tz' + j, { plus: 0 }); }
      const dk = seg(t, L(8, 8.5), L(8, 10.0)); if (dk > 0 && dk < 1) { const p = [lerp(GRID(99)[0] + 120, GRID(99)[0] + 420, dk), GRID(99)[1] - 20 + 220 * dk - 140 * Math.abs(Math.sin(dk * 9)) * (1 - dk)]; zn(p[0], p[1], 9, 'b1drop', { plus: 0 }); }
    } else {                                                       // L9: the line-up: Fe, Cu, Se trade electrons; zinc never does. L10: all want it
      const X = [520, 820, 1120, 1440], Y = 520, hop = (t - L(9, 3.5)) / .55, n = Math.floor(hop), f = frac(hop);
      if (t < L(10, .3)) {
        boilSeed('b1wall'); for (let k = 0; k < 6; k++) inkLine([[300, 260 + k * 80], [1650, 260 + k * 80]], .8, mixCol('#C9CFC9', PAL.ink, .2), 'inkfine', 0);
        const st = i => t > L(9, 3.5) && t < L(9, 7.2) ? (Math.floor((hop + (i === 1 ? 1 : 0)) / 3 + i * .4) % 2) : 0;
        ion(X[0], Y, 56, Z.fe, Z.feDk, 2 + st(0), 'b1fe');
        cu(X[1], Y, 56, st(1), 'b1cu');
        boilSeed('b1se'); paint(ellPts(X[2], Y, 56, 56, 18), { wash: Z.se, ink: PAL.ink, sw: 1.2 }); paint(ellPts(X[2] - 20, Y - 21, 16, 10, 10, 0, -.6), { wash: '#F08A8A', ink: null });
        if (st(2)) { boilSeed('b1seo'); paint(ellPts(X[2] + 30, Y - 58, 22, 22, 12), { wash: Z.o, ink: PAL.ink, sw: .9 }); }
        zn(X[3], Y, 56, 'b1zn');
        if (t > L(9, 3.5) && t < L(9, 7.2) && n >= 0) { const a = n % 3, b = (n + 1) % 3, p = arcPt([X[a], Y - 70], [X[b], Y - 70], 120, ease(f)); el(p[0], p[1], 14, 'b1hot'); }
        // Pip tosses zinc an electron; it bounces off and drops
        const toss = L(9, 7.5), tk = seg(t, toss, toss + .6), dropK = seg(t, toss + .6, toss + 1.6);
        let o = K.act(t, [[L(9), 'calm', { lookX: .8 }], [L(9, 3.6), 'wow', { lookX: .5, lookY: -.4 }], [toss - .4, 'scheme', { lookX: .9 }], [toss + .7, 'confused', { lookX: .9, lookY: .4 }]]);
        if (t > toss - .4 && t < toss + .1) o = { ...o, armF: [lerp(-.6, 1.4, ease(seg(t, toss - .4, toss))), 2.5] };
        K.swim(1740, 800, 30, t, { ...o, flip: true }, 'b1pip9');
        if (tk > 0 && dropK < 1) { const p = tk < 1 ? arcPt([1660, 690], [X[3] + 50, Y - 40], 120, tk) : [X[3] + 50 + 80 * dropK, Y - 40 + 360 * easeIn(dropK) - 80 * Math.sin(dropK * Math.PI)]; el(p[0], p[1], 12, 'b1toss'); }
      } else {                                                       // L10: every protein leans in toward the one zinc; Pip puzzled
        const lean = ease(seg(t, L(10, .8), L(10, 2.4)));
        for (let i = 0; i < 100; i++) { const a = i / 100 * TAU * 3.0, rr = 300 + 210 * (i % 3) + 18 * hash(i), p = [960 + Math.cos(a) * rr * 1.25, 520 + Math.sin(a) * rr * .72];
          protein(p[0], p[1], .5 * popK(seg(t, L(10, -.2) + i * .006, L(10, .3) + i * .006)), 'gg' + i, { lean: Math.atan2(520 - p[1], 960 - p[0]) + Math.PI / 2 - Math.PI * (1 - lean) * 0, arms: lean }); }
        zn(960, 520, 46, 'b1zc', { glow: .3 });
        const o = K.act(t, [[L(10), 'calm', { lookX: -.8 }], [L(10, 1.6), 'confused', { lookX: -.8 }], [L(10, 4.8), 'wow', { lookX: -.6, lookY: -.3 }]]);
        K.swim(1720, 820, 30, t, { ...o, flip: true }, 'b1pip10');
      }
    }
    camEnd();
    if (lt < .45) flash(1 - seg(lt, 0, .45), PAL.cream);
    if (lt > dur - .35) flash(seg(lt, dur - .35, dur), '#DDE3EA');
  }

  // ================================ C1 · why zinc: never trades, grips hard, pulls hard (L11 – L18) ================================
  function spangle(t, key) {                                      // galvanised zinc: a blue-grey wash with big crystal spangles
    K.wash('#AFBBC8', t, { key, blob: '#C9D3DC', n: 3 });
    for (let i = 0; i < 9; i++) { boilSeed('spg' + key + i); const cx = (i % 3) * 760 - 100 + 120 * hash(i), cy = Math.floor(i / 3) * 450 - 60 + 80 * hash(i + 3), P = [];
      for (let j = 0; j < 7; j++) { const a = j / 7 * TAU + hash(i * 7 + j), r = 220 + 160 * hash(i * 3 + j); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      paint(P, { wash: mixCol('#AFBBC8', i % 2 ? '#DCE3EA' : '#8C9BAA', .18), ink: mixCol('#AFBBC8', PAL.ink, .12), sw: .5 }); }
  }
  const lasso = (a, b, sag, key, col = '#B98A55') => { boilSeed('ls' + key); inkLine(through([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag], b]), 2.6, col, 'ink', .5); paint(ellPts(b[0], b[1], 16, 12, 12), { wash: null, ink: col, sw: 2.2 }); };
  function hammer(hx, hy, ang, s, key) {                          // a carpenter's hammer held at (hx, hy)
    boilSeed('hm' + key);
    const hd = [hx + Math.cos(ang) * 70 * s, hy + Math.sin(ang) * 70 * s];
    paint(ribbon([[hx, hy], hd], 8 * s, 7 * s), { wash: '#C58A4A', ink: PAL.ink, sw: .9 });
    paint(rotEll(hd[0], hd[1], 26 * s, 13 * s, 12, ang + Math.PI / 2), { wash: '#6F7984', ink: PAL.ink, sw: 1 });
    return hd;
  }
  function ligand(x0, y0, x1, y1, kind, key) {                    // a Cys (yellow S) or His (teal ring) side chain reaching from the protein to the metal
    boilSeed('lg' + key);
    inkLine(through([[x0, y0], [lerp(x0, x1, .5) + (y1 - y0) * .12, lerp(y0, y1, .5)], [x1, y1]]), 3.2, kind === 'S' ? Z.cysDk : Z.hisDk, 'ink', .5);
    if (kind === 'S') paint(ellPts(x1, y1, 15, 15, 12), { wash: Z.cys, ink: PAL.ink, sw: .9 });
    else { const P = []; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; P.push([x1 + Math.cos(a) * 17, y1 + Math.sin(a) * 17]); } paint(P, { wash: Z.his, ink: PAL.ink, sw: .9 }); paint(ellPts(x1, y1, 6, 6, 8), { wash: mixCol(Z.his, PAL.cream, .5), ink: null }); }
  }
  function phDial(x, y, r, needle, key) {                          // a pH dial: red (acid) → green (neutral) → blue (base), no numbers
    boilSeed('ph' + key);
    for (let i = 0; i < 12; i++) { const a0 = Math.PI + i / 12 * Math.PI, a1 = a0 + Math.PI / 12, col = mixCol(i < 6 ? '#D9564F' : '#6E9F58', i < 6 ? '#6E9F58' : '#4F7FC8', i < 6 ? i / 6 : (i - 6) / 6);
      paint([[x + Math.cos(a0) * r, y + Math.sin(a0) * r], [x + Math.cos(a1) * r, y + Math.sin(a1) * r], [x + Math.cos(a1) * r * .7, y + Math.sin(a1) * r * .7], [x + Math.cos(a0) * r * .7, y + Math.sin(a0) * r * .7]], { wash: col, ink: null }); }
    inkLine(ellPts(x, y, r, r, 30).filter(p => p[1] <= y + 1), 1.2, PAL.ink, 'ink', .2);
    const a = Math.PI + needle * Math.PI; inkLine([[x, y], [x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9]], 4, PAL.ink, 'ink', 0); paint(ellPts(x, y, 9, 9, 10), { wash: PAL.ink, ink: null });
  }
  function shotC1(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(11, -.9), [1000, 520, 2.6]], [L(11, .2), [1000, 580, 1.15]], [L(13, -.6), [1000, 580, 1.15]], [L(13, -.1), [900, 500, 1.25]], [L(14, -.6), [900, 500, 1.25]],
      [L(14, -.1), [1010, 560, 1.55]], [L(15, -.6), [1010, 560, 1.55]], [L(15, -.1), [980, 600, 1.12]], [L(16, -.6), [980, 600, 1.12]], [L(16, -.1), [980, 580, 1.15]], [L(17, -.6), [980, 580, 1.15]],
      [L(17, -.1), [1000, 600, 1.12]], [L(18, 5.6), [1000, 600, 1.12]], [L(18, 6.6), [1060, 640, 1.0]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    spangle(t, 'c1');
    const PX = 640, PY = 860, U = 34, ZC = [1180, 470];
    if (t < L(13, -.3)) {                                          // L11–L12: the electron yank, copper (easy) then zinc (impossible)
      const swap = ease(seg(t, L(12, -.2), L(12, .9))), yank = L(11, 5.4), got = seg(t, yank, yank + .45);
      // copper, then zinc slides in from the right as copper leaves left-up
      if (swap < 1) {
        const cx = lerp(ZC[0], ZC[0] - 900, swap), cy = ZC[1] - 200 * swap;
        cu(cx, cy, 70, ease(seg(t, yank, yank + .4)), 'c1cu');
        if (t < yank + .45) { const a = t * 2.2, p = t < yank ? [cx + Math.cos(a) * 125, cy + Math.sin(a) * 125] : null; if (p) el(p[0], p[1], 14, 'c1ce'); }
      }
      if (swap > 0) { const zx = lerp(ZC[0] + 900, ZC[0], swap); zn(zx, ZC[1], 70, 'c1zn'); shell(zx, ZC[1], 128, t, 'c1sh', { tug: t > L(12, 2.5) && t < L(12, 5.0) ? 22 + 10 * Math.sin(t * 30) : 0, tugA: Math.PI * .8 }); }
      // Pip: lasso the copper's electron, yank, catch it, smug. Then haul on zinc's, the rope snaps, knockback; shove one in, bonk
      const snap = L(12, 5.0), shove = L(12, 6.5), pop = L(12, 7.2);
      let o = K.act(t, [[L(11), 'calm', { lookX: .8 }], [L(11, 3.9), 'scheme', { lookX: .9 }], [yank, 'strain'], [yank + .5, 'smug', { lookX: -.3 }],
        [L(12, .2), 'wow', { lookX: .9 }], [L(12, 2.5), 'strain', { lookX: .9 }], [snap + 1.8, 'calm', { lookX: .9 }], [shove, 'strain', { lookX: .9 }]]);
      let px = PX;
      const hold = t > yank && t < L(12, 1.0);
      if (t > L(11, 3.9) && t < yank + .1) { const h = TOON.hand(PX, PY, U, { ...o, armF: [.9, 3] }); const cp = [ZC[0] + Math.cos(t * 2.2) * 125, ZC[1] + Math.sin(t * 2.2) * 125]; o = { ...o, armF: [.9, 3] }; lasso(h, cp, 40, 'c1l1'); }
      const pulling = t > L(12, 2.4) && t < snap;
      if (pulling) o = { ...o, armF: [.5, 3.2], armB: { to: [3.0 * U, -3.4 * U] }, rot: -.2 };
      o = TOON.mix(o, TOON.knockback(t, snap, { dir: -1, dist: 5, h: 3, spin: 1 }));
      if (t > snap + TOON.dur('knockback')) o = TOON.mix(o, { dx: lerp(-5, 0, ease(seg(t, snap + 1.9, shove))) });
      if (t > shove - .1 && t < pop) o = { ...o, armF: [.1, 3.3], armB: [0, 3.1], rot: .12 };
      o = TOON.mix(o, TOON.bonk(t, pop + .25));
      TOON.pip(px, PY, U, { ...o, key: 'c1pip' });
      if (pulling) { const h = TOON.hand(px, PY, U, o), ep = [ZC[0] + Math.cos(t * .25 + Math.PI * .8) * 128 - 22, ZC[1] + Math.sin(t * .25 + Math.PI * .8) * 128]; lasso(h, ep, -6, 'c1l2'); }
      if (hold) { const h = TOON.hand(px, PY, U, o); el(h[0] + 10, h[1] - 10, 14, 'c1held'); }
      if (t > snap && t < snap + .35) K.burst(ZC[0] - 160, ZC[1] + 80, 50, seg(t, snap, snap + .35), PAL.ink, 'c1sn');
      if (t > shove - .1 && t < pop + .25) { const h = TOON.hand(px, PY, U, { ...o, armF: [.1, 3.3] }); el(h[0] + 12, h[1], 14, 'c1shv'); }
      if (t > pop && t < pop + .4) { const k = seg(t, pop, pop + .25), hd = TOON.head(px, PY, U, o); el(...arcPt([ZC[0] - 140, ZC[1] + 60], [hd[0], hd[1] - 20], 140, k), 14, 'c1pop'); }
    } else if (t < L(14, -.3)) {                                   // L13: Fe and Cu turn H₂O₂ into radicals; zinc doesn't; a cell relaxes
      const X = [460, 900, 1340];
      for (let i = 0; i < 3; i++) {
        const go = L(13, 1.3 + 1.5 * i), fired = i < 2 && t > go;
        if (i === 0) ion(X[i], 520, 56, Z.fe, Z.feDk, fired ? 3 : 2, 'c1fe'); else if (i === 1) cu(X[i], 520, 56, fired ? 0 : 0, 'c1cu2'); else zn(X[i], 520, 56, 'c1zn3');
        if (!fired) h2o2(X[i], 360 + 6 * Math.sin(t * 2 + i), 1.6, .3, 'c1hp' + i);
        if (fired) { const k = seg(t, go, go + 1.0); radical(X[i] + 60 * easeOut(k), 360 - 120 * easeOut(k), 34, t, 'c1rd' + i); water(X[i] - 70, 330 + 40 * k, 1.2, 'c1w' + i); if (k < .35) K.burst(X[i], 380, 60, k / .35, Z.rad, 'c1b' + i); }
        if (i < 2 && t > go - .5 && t < go) el(...arcPt([X[i], 460], [X[i], 380], 40, seg(t, go - .5, go)), 12, 'c1e' + i);
      }
      const calm = ease(seg(t, L(13, 5.6), L(13, 6.4)));
      K.cell(1440, 720, 100, '#F2C6B4', '#DE9E88', t, { key: 'c1cell', mood: calm > .5 ? 'happy' : 'calm', lx: -.6 });
      const o = K.act(t, [[L(13, -1), 'dizzy'], [L(13, 1.2), 'wow', { lookX: .8 }], [L(13, 4.3), 'calm', { lookX: .9 }], [L(13, 5.8), 'happy', { lookX: .9 }]]);
      TOON.pip(400, 860, 28, { ...o, bump: 1, key: 'c1pip13' });
    } else if (t < L(16, -.3)) {                                   // L14: the grip: two Cys and two His close round zinc; Pip hammers them home. L15: the crowbar
      if (t < L(15, -.3)) {
        const P = [1080, 640], s = 3.2;
        protein(P[0], P[1], s, 'c1prot', { col: '#B8D8C8' });
        const zin = ease(seg(t, L(14, 2.0), L(14, 2.7))), zp = [P[0], lerp(120, P[1] - 26 * s - 6, zin)];
        const L4 = [[-150, 'S', L(14, 4.2)], [150, 'S', L(14, 4.5)], [-90, 'H', L(14, 5.3)], [90, 'H', L(14, 5.6)]];
        L4.forEach(([dx, kd, t0], i) => { const k = ease(seg(t, t0, t0 + .6)), a = [P[0] + dx * 1.2, P[1] - 30], end = [lerp(P[0] + dx * 1.1, zp[0] + Math.sign(dx) * (i < 2 ? 46 : 34), k), lerp(P[1] - 40, zp[1] + (i < 2 ? 10 : -30), k)]; if (k > .02) ligand(a[0], a[1], end[0], end[1], kd, 'c1lg' + i); });
        zn(zp[0], zp[1], 40, 'c1zg');
        const hits = [7.3, 7.9, 8.5, 9.1].map(d => L(14, d)), hp = [PX + 220, PY];
        let o = K.act(t, [[L(14), 'calm', { lookX: .8, lookY: -.4 }], [L(14, 2.6), 'wow', { lookX: .8, lookY: -.6 }], [L(14, 7.0), 'strain', { lookX: .8, lookY: -.6 }], [L(14, 9.4), 'smug']]);
        let ha = -1.4;
        if (t > L(14, 7.0) && t < L(14, 9.4)) { const k = Math.max(...hits.map(h => pulseK(t, h - .22, .3))); ha = lerp(-2.2, -.6, k); o = { ...o, armF: [lerp(1.6, .2, k), 2.6] }; }
        const g = TOON.pip(hp[0], hp[1], U, { ...o, key: 'c1pip14' }), h = TOON.hand(hp[0], hp[1], U, o);
        if (t > L(14, 6.8)) hammer(h[0], h[1], ha, 1.2, 'c1hm');
        hits.forEach((h0, i) => { if (t > h0 && t < h0 + .3) K.burst(zp[0] + [-46, 46, -34, 34][i], zp[1] + [10, 10, -30, -30][i], 26, seg(t, h0, h0 + .3), PAL.ink, 'c1hit' + i); });
      } else {                                                     // L15: Mg, Mn, Fe bob loose in their seats; zinc sits firm; the crowbar bends; Pip slips
        const X = [420, 780, 1140, 1500], Y = 600;
        X.forEach((x, i) => { protein(x, Y + 70, 2.2, 'c1seat' + i, { col: pastel(i + 2) }); const loose = i < 3 ? Math.abs(Math.sin(t * (4 + i) + i)) * 24 * (1 - seg(t, L(15, 4.0), L(15, 4.5))) : 0;
          const p = [x, Y + 70 - 26 * 2.2 - 6 - loose];
          if (i === 0) ion(p[0], p[1], 30, Z.mg, Z.mgDk, 2, 'c1mg'); else if (i === 1) ion(p[0], p[1], 30, Z.mn, Z.mnDk, 2, 'c1mn'); else if (i === 2) ion(p[0], p[1], 30, Z.fe, Z.feDk, 2, 'c1fe2'); else zn(p[0], p[1], 32, 'c1zs'); });
        const pry = L(15, 4.5), bend = ease(seg(t, L(15, 5.3), L(15, 6.0))), slipAt = L(15, 6.1);
        let o = K.act(t, [[L(15), 'calm', { lookX: -.6, lookY: -.3 }], [L(15, 3.8), 'scheme', { lookX: -.8 }], [pry, 'strain', { lookX: -.8 }]], 2);
        const ppx = 1720, ppy = 860;
        if (t > pry - .3 && t < slipAt) o = { ...o, flip: true, armF: [lerp(.2, -.3, bend), 3.2], armB: [lerp(.1, -.4, bend), 3.0], rot: .15 };
        o = { ...o, flip: true };
        o = TOON.mix(o, TOON.slip(t, slipAt, { dir: -1, lie: .7 }));
        TOON.pip(ppx, ppy, U, { ...o, key: 'c1pip15' });
        if (t > pry - .3 && t < slipAt + .5) { const h = TOON.hand(ppx, ppy, U, o), tip = [X[3] + 30, Y - 30], mid = [lerp(h[0], tip[0], .5), lerp(h[1], tip[1], .5) + 60 * bend];
          boilSeed('c1bar'); inkLine(through(t < slipAt ? [h, mid, tip] : [[tip[0] + 40, tip[1] + 200], [tip[0] + 100, tip[1] + 230], [tip[0] + 180, tip[1] + 210]]), 8, '#C8323C', 'ink', .4); }
      }
    } else if (t < L(17, -.3)) {                                   // L16: four, five, six arms: zinc sits on any seat; Pip the waiter
      const X = [560, 960, 1360], Y = 560, n = [4, 5, 6];
      X.forEach((x, i) => { const pk = popK(seg(t, L(16, .4) + i * 1.1, L(16, .8) + i * 1.1)); if (pk < .05) return;
        const cy = Y + 40; boilSeed('c1st' + i); paint(ellPts(x, cy + 70 * pk, 130 * pk, 60 * pk, 22).filter(p => p[1] >= cy + 40 * pk), { wash: pastel(i + 4), ink: PAL.ink, sw: 1 });
        for (let j = 0; j < n[i]; j++) { const a = -.35 + (j / (n[i] - 1)) * (Math.PI + .7); ligand(x + Math.cos(a) * 112 * pk, cy + Math.abs(Math.sin(a)) * 60 * pk + 46 * pk, x + Math.cos(a) * 58 * pk, cy + Math.sin(a) * 50 * pk, j % 2 ? 'H' : 'S', 'c1n' + i + j); } });
      const hopK = (t - L(16, 1.2)) / 1.2, at = clamp(Math.floor(hopK), 0, 2), f = frac(hopK), zp = hopK < 0 ? [X[0], Y - 300] : hopK > 2.5 ? [X[2], Y + 40] : f < .7 && at < 2 ? [X[at], Y + 40] : arcPt([X[at], Y + 40], [X[Math.min(2, at + 1)], Y + 40], 160, seg(f, .7, 1));
      zn(zp[0], hopK < 0 ? lerp(Y - 300, Y + 40, ease(seg(t, L(16, .6), L(16, 1.2)))) : zp[1], 34, 'c1zh');
      const o = K.act(t, [[L(16), 'calm', { lookX: -.6 }], [L(16, 2.3), 'happy', { lookX: -.6 }], [L(16, 6.2), 'smug', { lookX: -.8 }]]);
      const ppx = lerp(1720, 1560, ease(seg(t, L(16, 6.2), L(16, 7.4))));
      TOON.pip(ppx, 860, U, { ...o, flip: true, armF: t > L(16, 6.2) ? [.1, 2.8] : o.armF, armB: { at: [1.4, -2.9] }, armsFront: true, key: 'c1pip16' });
      if (t > L(16, 6.2)) { const h = TOON.hand(ppx, 860, U, { ...o, flip: true, armB: { at: [1.4, -2.9] }, armsFront: true }, 'B'); boilSeed('c1tw'); paint([[h[0] - 6, h[1] - 6], [h[0] + 18, h[1] - 6], [h[0] + 14, h[1] + 50], [h[0] - 2, h[1] + 46]], { wash: PAL.cream, ink: PAL.ink, sw: .8 }); }
    } else {                                                       // L17: the tug-of-war over water; L18: OH⁻, the dial, the three icons
      const zp = [820, 520];
      zn(zp[0], zp[1], 74, 'c1zt');
      const pop = L(17, 6.8), got = t > pop;
      if (t < L(18, -.3)) {
        const cloud = ease(seg(t, L(17, 2.9), L(17, 4.6))), wx = 960 - 30 * cloud + (t > L(17, 4.7) && !got ? 14 * Math.sin(t * 18) : 0);
        glow(lerp(wx, zp[0] + 80, .5 * cloud), 520, 120, '#FFE9A8', .6);
        boilSeed('c1wo'); paint(ellPts(wx, 520, 50, 44, 18), { wash: Z.water, ink: PAL.ink, sw: 1.1 });
        for (let k = 0; k < 6; k++) { const a = TAU * k / 6 + t; el(lerp(wx, zp[0] + 70, cloud * .5) + Math.cos(a) * 60, 520 + Math.sin(a) * 50, 8, 'c1we' + k); }
        paint(ellPts(wx + 52, 470, 22, 22, 12), { wash: PAL.cream, ink: PAL.ink, sw: .9 });
        if (!got) { boilSeed('c1h2'); paint(ellPts(wx + 52, 570, 22, 22, 12), { wash: PAL.cream, ink: PAL.ink, sw: .9 }); }
        let o = K.act(t, [[L(17), 'calm', { lookX: -.8 }], [L(17, 2.6), 'strain', { lookX: -.8 }], [pop, 'shock', { take: 1.2 }]]);
        const ppx = 1230, ppy = 830;
        if (!got) o = { ...o, flip: true, armF: [.2, 3.3], armB: { to: [3.1 * U, -2.9 * U] }, rot: .18 + .05 * Math.sin(t * 9), dx: -.8 * cloud + .3 * Math.sin(t * 6) };
        o = { ...o, flip: true };
        o = TOON.mix(o, TOON.knockback(t, pop, { dir: 1, dist: 7, h: 2.2, spin: .5 }));
        TOON.pip(ppx, ppy, U, { ...o, key: 'c1pip17' });
        if (!got) { const h = TOON.hand(ppx, ppy, U, o); boilSeed('c1rp'); inkLine(through([h, [(h[0] + wx + 52) / 2, (h[1] + 570) / 2 + 6], [wx + 52, 570]]), 4.5, '#B98A55', 'ink', .3); paint(ellPts(wx + 52, 570, 26, 26, 12), { wash: null, ink: '#B98A55', sw: 3 }); }
        if (got) { const h = TOON.hand(ppx, ppy, U, o); proton(h[0], h[1] - 20, 1.4, 'c1hp'); }
      } else {
        const ohK = ease(seg(t, L(18, .3), L(18, .9))), bob = Math.sin(t * 7) * 8 * on(t, L(18, 3.6), L(18, 5.5), .2, .3);
        hydroxide(lerp(960, zp[0] + 112, ohK), 520 + bob, 2.3, 'c1oh', -.5);
        phDial(1300, 420, 150, lerp(.1, .5, ease(seg(t, L(18, 2.2), L(18, 3.6)))) + .03 * spring(t, L(18, 3.6), 4, 12), 'c1ph');
        ['shield', 'clamp', 'tug'].forEach((k, i) => icon(k, 560 + i * 400, 860, 1.1, seg(t, L(18, [6.3, 7.0, 7.7][i]), L(18, [6.6, 7.3, 8.0][i])), 'c1ic', t));
        const o = K.act(t, [[L(18), 'calm', { lookX: -.8 }], [L(18, 6.3), 'happy', { lookX: -.5, lookY: .5 }], [L(18, 8.4), 'smug']]);
        TOON.pip(1700, 900, 30, { ...o, flip: true, key: 'c1pip18' });
      }
    }
    camEnd();
    if (lt < .5) flash(1 - seg(lt, 0, .5), '#DDE3EA');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B23F3A', '#D9564F']);
  }

  // ================================ D1 · every breath: carbonic anhydrase, the ping-pong enzyme (L19 – L25) ================================
  function rbc(x, y, r, key, pale = 0) {                           // a red blood cell, a biconcave disc seen side-on-ish (copper.js)
    boilSeed('rb' + key);
    paint(ellPts(x, y, r, r * .82, 18), { wash: mixCol('#D9564F', '#E8C2C0', pale), ink: PAL.ink, sw: .9 });
    paint(ellPts(x, y, r * .45, r * .32, 14), { wash: mixCol('#B23F3A', '#D9AAA8', pale), ink: null });
  }
  function mito(x, y, s, ang, key) {                               // a mitochondrion: a capsule with cristae (after copper.js)
    boilSeed('mt' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    paint(rrPts(-90, -42, 180, 84, 42), { wash: '#C8835A', ink: PAL.ink, sw: 1.1 });
    paint(rrPts(-78, -30, 156, 60, 30), { wash: '#EFB98F', ink: null });
    for (let i = 0; i < 5; i++) inkLine([[-60 + i * 30, 30], [-60 + i * 30, -6 + 10 * (i % 2)]], 3, '#8C5234', 'ink', .3);
    pop();
  }
  // carbonic anhydrase: a big rose-peach blob with a cone-shaped pit; zinc at the bottom held by three His.
  // returns the zinc's point and the pit's mouth.
  function anhydrase(x, y, s, key, o = {}) {
    boilSeed('ca' + key);
    const P = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, r = 1 + .07 * Math.sin(a * 3 + 1) + .04 * Math.sin(a * 7), pit = Math.exp(-Math.pow((a - 1.5 * Math.PI) / .3, 2)); P.push([x + Math.cos(a) * 170 * s * r, y + Math.sin(a) * 140 * s * r * (1 - .62 * pit)]); }
    paint(P, { wash: o.col || '#F2B8A2', ink: PAL.ink, sw: 1.3 / Math.sqrt(Math.max(1, s)), curv: .35 });
    const zp = [x, y - 30 * s];
    boilSeed('cah' + key); paint([[x - 60 * s, y - 120 * s], [x + 60 * s, y - 120 * s], [x + 18 * s, y - 40 * s], [x - 18 * s, y - 40 * s]], { wash: mixCol(o.col || '#F2B8A2', PAL.ink, .12), ink: null });
    if (o.his !== false) for (const [dx, dy] of [[-22, 22], [22, 22], [0, 30]]) ligand(zp[0] + dx * 1.7 * s, zp[1] + dy * 1.7 * s, zp[0] + dx * .95 * s, zp[1] + dy * .95 * s, 'H', key + dx + dy);
    if (o.zn !== false) zn(zp[0], zp[1], 26 * s, key + 'z', { plus: s > .8 ? 1 : 0 });
    return { zp, mouth: [x, y - 130 * s] };
  }
  function snail(x, y, s, t, key) {                                 // a snail (dot eyes) with a CO₂ riding on its shell
    boilSeed('sn' + key);
    paint(ribbon([[x - 60 * s, y], [x + 50 * s, y], [x + 70 * s, y - 20 * s]], 16 * s, 10 * s), { wash: '#D9C7A0', ink: PAL.ink, sw: .9 });
    for (const sd of [0, 1]) inkLine([[x + 66 * s, y - 20 * s], [x + (74 + 8 * sd) * s, y - (48 + 4 * sd) * s]], 1.2, PAL.ink, 'inkfine', .3);
    paint(ellPts(x + 80 * s, y - 52 * s, 3 * s, 3 * s, 6), { wash: PAL.ink, ink: null });
    paint(ellPts(x - 10 * s, y - 34 * s, 44 * s, 40 * s, 18), { wash: '#C58A4A', ink: PAL.ink, sw: 1 });
    inkLine(through([[x - 10 * s, y - 34 * s], [x + 10 * s, y - 40 * s], [x + 6 * s, y - 60 * s], [x - 26 * s, y - 56 * s], [x - 38 * s, y - 30 * s]]), 1.2, '#8C5A2A', 'ink', .5);
    co2(x - 10 * s, y - 92 * s, .9 * s, key + 'c');
  }
  function lungs(x, y, s, key, k = 1) {                             // two pink lobes with a branching airway
    boilSeed('lu' + key);
    for (const sd of [-1, 1]) { const P = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU; P.push([x + sd * 90 * s + Math.cos(a) * 80 * s * (1 + .15 * Math.sin(a * 2)), y + Math.sin(a) * 140 * s]); } paint(P, { wash: '#F2A9B4', ink: PAL.ink, sw: 1.1, curv: .3 }); }
    inkLine([[x, y - 200 * s], [x, y - 60 * s]], 9 * s, '#E9C9C9', 'ink', 0);
    for (const sd of [-1, 1]) inkLine(through([[x, y - 60 * s], [x + sd * 60 * s, y - 20 * s], [x + sd * 90 * s, y + 40 * s]]), 6 * s, '#E9C9C9', 'ink', .4);
  }
  function plasma(t, key) {                                       // warm red: a capillary wall top and bottom, the plasma between
    K.wash('#E7A39C', t, { key, blob: '#F2C2BA', n: 3 });
    paint(rectPts(-400, -400, W + 800, 520), { wash: '#C9655F', ink: null }); paint(rectPts(-400, 960, W + 800, 520), { wash: '#C9655F', ink: null });
    boilSeed('pl' + key); inkLine([[-400, 120], [W + 400, 120]], 1.4, PAL.ink, 'ink', 0); inkLine([[-400, 960], [W + 400, 960]], 1.4, PAL.ink, 'ink', 0);
    K.motes(t, 10, '#F7D6D0', { key: key + 'm' });
  }
  function shotD1(t, lt, dur) {
    K.setT(t);
    let c = kf(t, [[L(19, -.9), [960, 540, 1]], [L(19, 3.0), [960, 540, 1]], [L(19, 4.0), [960, 540, 1]], [L(20, 4.0), [960, 540, 1]], [L(20, 5.2), [1000, 560, 1.15]],
      [L(23, -.5), [1000, 560, 1.15]], [L(23, 0), [960, 560, 1]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    if (t < L(19, 3.0)) {                                          // L19 a: the whole body, breathing
      K.wash('#F1D3C6', t, { key: 'd1b', blob: '#F8E6DC', n: 3 });
      const br = Math.sin(t * 1.4);
      body(820, 1000, 860, 'd1bd', { breath: br });
      lungs(820, 520 - 6 * br, .62 + .02 * br, 'd1lu');
      for (let i = 0; i < 3; i++) { const k = frac(t * .5 + i / 3); if (k < .6) puff(900 + 160 * k, 268 - 20 * k, 16 + 30 * k, 1 - k, 'd1br' + i, '#E9E3EC'); }
      const o = K.act(t, [[L(19, -1), 'calm', { lookX: -.8 }], [L(19, 1.2), 'happy', { lookX: -.8 }]]);
      TOON.pip(1400, 860, 34, { ...o, flip: true, key: 'd1pip0' });
    } else if (t < L(20, 4.2)) {                                   // L19 b – L20 a: in a capillary by a muscle cell; CO₂ is slow on its own
      plasma(t, 'd1p');
      mito(300, 1030, 1.4, -.1, 'd1mt');
      for (let i = 0; i < 6; i++) { const k = seg(t, L(19, 3.4) + i * .45, L(19, 6.4) + i * .45); if (k > 0) { const p = [lerp(320 + 40 * i, 520 + 200 * i, easeOut(k)), lerp(990, 560 + 50 * Math.sin(i * 2), easeOut(k))]; co2(p[0], p[1], 1.1, 'd1c' + i, .4 * Math.sin(t + i)); } }
      for (let i = 0; i < 4; i++) { const x = frac(hash(i + 2) + (t - L(19)) * .07) * (W + 400) - 200; rbc(x, 380 + 220 * (i % 2), 70, 'd1r' + i); }
      if (t > L(20, -.3)) { water(1180, 700, 1.4, 'd1w'); co2(1270, 700, 1.3, 'd1c9');
        const sk = seg(t, L(20, .6), L(20, 4.2)); snail(lerp(300, 1000, sk), 890, 2.0, t, 'd1sn'); }
      const o = K.act(t, [[L(19, 3.0), 'calm', { lookX: -.7 }], [L(20, 1.0), 'sleepy', { lookX: -.3, lookY: .5 }]]);
      K.swim(1620, 820, 32, t, { ...o, flip: true }, 'd1pip1');
    } else if (t < L(23, -.5)) {                                   // L20 b – L22: inside a red cell, the enzyme's pit, close
      K.wash('#E6847C', t, { key: 'd1in', blob: '#F0A59E', n: 3 });
      for (let i = 0; i < 6; i++) { boilSeed('d1ca' + i); anhydrase(200 + 300 * i, 160 + 60 * (i % 2), .32, 'd1cs' + i, { zn: false, his: false }); }
      const pop = popK(seg(t, L(20, 4.6), L(20, 5.4))); if (pop < .05) { camEnd(); return; }
      const { zp, mouth } = anhydrase(960, 700, 2.5 * pop, 'd1ca');
      // L21: water on zinc → OH⁻ (its H⁺ pops); CO₂ slides in; thwack: HCO₃⁻, which slips out
      const t21 = L(21), w1 = seg(t, t21, t21 + .5), hp = seg(t, t21 + 1.3, t21 + 1.9), cin = seg(t, t21 + 2.9, t21 + 3.9), hit = t21 + 4.4, out = seg(t, t21 + 6.4, t21 + 8.4);
      const t22 = L(22), w2 = seg(t, t22 + .4, t22 + 1.0), shuttle = seg(t, t22 + 2.4, t22 + 4.6), table = ease(seg(t, t22 + 6.3, t22 + 7.0));
      const site = [zp[0], zp[1] - 80];
      if (t < t22) {
        if (t > t21 && t < hit) { if (hp < 1) water(lerp(mouth[0] + 200, site[0], ease(w1)), lerp(mouth[1] - 120, site[1], ease(w1)), 1.8, 'd1w1'); else hydroxide(site[0], site[1], 1.8, 'd1oh1'); }
        if (hp > 0 && hp < 1) proton(site[0] + 40 + 260 * easeOut(hp), site[1] - 30 - 200 * easeOut(hp), 1.5, 'd1h1');
        if (cin > 0 && t < hit) co2(lerp(mouth[0] - 300, site[0], ease(cin)), lerp(mouth[1] - 200, site[1] - 50, ease(cin)), 1.8, 'd1c1', .2);
        if (t > hit - .1 && t < hit + .35) K.burst(site[0], site[1] - 20, 70, seg(t, hit - .1, hit + .35), PAL.ink, 'd1hit');
        if (t >= hit) { const p = out <= 0 ? [site[0], site[1] - 20] : [lerp(site[0], mouth[0] + 520, easeIn(out)), lerp(site[1] - 20, mouth[1] - 300, easeIn(out))]; bicarb(p[0], p[1], 1.8, 'd1bc1', .3 * out); }
      } else {
        // L22: a new water binds; its H⁺ is passed out along a His arm; OH⁻ again; then a ping-pong table across the pit
        if (shuttle < 1) water(lerp(mouth[0] - 260, site[0], ease(w2)), lerp(mouth[1] - 160, site[1], ease(w2)), 1.8, 'd1w2'); else hydroxide(site[0], site[1], 1.8, 'd1oh2');
        const arm = [site[0] + 150, site[1] + 40], swing = Math.sin(shuttle * Math.PI);
        ligand(arm[0] + 80, arm[1] + 80, lerp(arm[0], arm[0] + 140, swing), lerp(arm[1], arm[1] - 160, swing), 'H', 'd1his64');
        if (shuttle > 0 && shuttle < 1) { const q = [lerp(site[0] + 30, arm[0] + 140, ease(shuttle)), lerp(site[1] - 10, arm[1] - 180, ease(shuttle))]; proton(q[0], q[1], 1.5, 'd1h2'); }
        if (table > .02) {
          ppTable(site[0] - 380, site[0] + 380, site[1] + 150 - 40 * (1 - table), 'd1pt');
          const rally = (t - (t22 + 7.0)) / .9, k = frac(Math.max(0, rally)), dirR = Math.floor(Math.max(0, rally)) % 2;
          if (rally > 0) { const p = arcPt([site[0] + (dirR ? 300 : -300), site[1] + 90], [site[0] + (dirR ? -300 : 300), site[1] + 90], 140, k); (dirR ? bicarb : co2)(p[0], p[1], 1.0, 'd1rb', 0); }
        }
      }
      const o = K.act(t, [[L(20, 4.2), 'wow', { lookX: -.8 }], [L(21, 4.4), 'excited', { lookX: -.8 }], [L(22, 6.5), 'happy', { lookX: -.8, lookY: .3 }]]);
      K.swim(1680, 900, 30, t, { ...o, flip: true }, 'd1pip2');
    } else if (t < L(24, -.3)) {                                   // L23: the rally, a million a second; Pip is buried in bicarbonate
      K.wash('#EBC6BE', t, { key: 'd1r', blob: '#F6DCD5', n: 3 });
      ppTable(260, 1660, 780, 'd1pt2');
      const t0 = L(23, .3), sp = 1 + 6 * easeIn(seg(t, L(23, 1.2), L(23, 5.0))), ph = (t - t0) * sp * 1.2, k = frac(ph), dirR = Math.floor(Math.max(0, ph)) % 2, buried = seg(t, L(23, 5.3), L(23, 7.0));
      // the enzyme at the right end, swinging a paddle
      anhydrase(1530, 600, .9, 'd1ca2');
      const ep = paddle(1430, 520, 1.6, Math.PI + .6 * Math.sin(ph * Math.PI), 'd1ep');
      // Pip at the left with its paddle, faster and faster until the balls bury it
      let o = K.act(t, [[L(23, -.5), 'smug', { lookX: .9 }], [L(23, 1.4), 'strain', { lookX: .9 }], [L(23, 3.6), 'panic', { lookX: .9 }], [L(23, 5.6), 'ko']]);
      const swing = Math.sin(ph * Math.PI);
      if (buried < .5) o = { ...o, armF: [lerp(-.2, 1.2, (swing + 1) / 2), 2.8] };
      if (sp > 4) o = { ...o, trail: [[0, 0, 0]] };
      const g = TOON.pip(330, 780, 36, { ...o, key: 'd1pip3' }), h = TOON.hand(330, 780, 36, o);
      if (buried < .5) paddle(h[0], h[1], 1.4, -.6 + .9 * swing, 'd1pp');
      if (t > t0 && buried < .3) { const n = sp > 4 ? 4 : 1; for (let j = 0; j < n; j++) { const kk = frac(k + j / n), p = arcPt([420, 600], [1380, 560], 130, dirR ? 1 - kk : kk); (dirR ? bicarb : co2)(p[0], p[1], .9, 'd1rb2' + j, 0); } }
      camera(560, 760 + 40 * buried, .9, 1.4 * buried, 'd1cam');
      if (buried > 0) for (let i = 0; i < 26; i++) { const q = seg(buried, i / 30, i / 30 + .25); if (q <= 0) continue; const p = arcPt([1300, 560], [240 + (i % 7) * 30, 770 - Math.floor(i / 7) * 34], 160, ease(q)); bicarb(p[0], p[1], .7, 'd1pile' + i, i); }
    } else if (t < L(25, -.3)) {                                   // L24: seven of ten CO₂ become bicarbonate
      plasma(t, 'd1p2');
      boilSeed('d1drop'); const P = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, w = Math.sin(a / 2); P.push([960 + Math.sin(a) * 300 * (.35 + .65 * w), 600 - Math.cos(a) * 380 + 160 * w]); }
      paint(P, { wash: '#E9675F', ink: PAL.ink, sw: 1.3, curv: .4 });
      for (let i = 0; i < 10; i++) { const p = [860 + (i % 4) * 110 - (Math.floor(i / 4) === 2 ? -55 : 0), 560 + Math.floor(i / 4) * 120], turn = i < 7 ? seg(t, L(24, .5) + i * .55, L(24, .8) + i * .55) : 0;
        if (turn > .5) bicarb(p[0], p[1], 1.0, 'd1pie' + i); else co2(p[0], p[1], 1.0, 'd1pie' + i); }
      const o = K.act(t, [[L(24, -.3), 'calm', { lookX: -.8 }], [L(24, 3.0), 'idea', { lookX: -.8 }]]);
      K.swim(1600, 860, 32, t, { ...o, flip: true }, 'd1pip4');
    } else {                                                        // L25: the lungs; the enzyme plays it back; the big breath out blows Pip away
      K.wash('#F1D3C6', t, { key: 'd1l', blob: '#F8E6DC', n: 3 });
      const br = ease(seg(t, L(25, 3.9), L(25, 5.4)));
      body(760, 1000, 860, 'd1bd2', { breath: -br });
      lungs(760, 520, .62 * (1 - .08 * br), 'd1lu2');
      inset(1250, 380, 200, seg(t, L(25, .4), L(25, 1.0)) * (1 - seg(t, L(25, 3.6), L(25, 3.9))), 'd1lin', () => {
        anhydrase(1250, 470, .55, 'd1ca3');
        const k = frac((t - L(25, 1.2)) / .8), p = arcPt([1150, 300], [1350, 300], 50, k);
        if (t > L(25, 1.2)) (k < .5 ? bicarb : co2)(p[0], p[1], .7, 'd1rv', 0);
      });
      const blow = seg(t, L(25, 4.2), L(25, 6.4));
      for (let i = 0; i < 6; i++) { const k = seg(blow, i * .08, .6 + i * .08); if (k > 0 && k < 1) { puff(840 + 900 * easeOut(k), 250 + (i - 3) * 30 + 60 * k, 40 + 60 * k, 1 - .5 * k, 'd1ex' + i, '#E9E3EC'); co2(860 + 900 * easeOut(k), 250 + (i - 3) * 50, 1, 'd1exc' + i, k * 3); } }
      let o = K.act(t, [[L(25, -.3), 'calm', { lookX: -.8 }], [L(25, 3.5), 'wow', { lookX: -.8 }]]);
      o = { ...o, flip: true };
      o = TOON.mix(o, TOON.knockback(t, L(25, 5.4), { dir: 1, dist: 18, h: 3, spin: 1.5 }));
      TOON.pip(1480, 860, 34, { ...o, key: 'd1pip5' });
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B23F3A', '#D9564F']);
    if (t > L(19, 2.7) && t < L(19, 3.3)) flash(on(t, L(19, 2.7), L(19, 3.3), .3, .3), '#F7DCE6');
    if (t > L(20, 3.9) && t < L(20, 4.5)) flash(on(t, L(20, 3.9), L(20, 4.5), .3, .3), '#F2B4AE');
    if (t > L(23, -.8) && t < L(23, -.2)) flash(on(t, L(23, -.8), L(23, -.2), .3, .3), PAL.cream);
    if (t > L(24, -.6) && t < L(24, 0)) flash(on(t, L(24, -.6), L(24, 0), .3, .3), PAL.cream);
    if (t > L(25, -.6) && t < L(25, 0)) flash(on(t, L(25, -.6), L(25, 0), .3, .3), PAL.cream);
    streaks(seg(lt, dur - .45, dur), 'd1wp');
  }

  // ================================ D2 · 300 zinc enzymes, in all six classes (L26 – L29) ================================
  function organ(kind, x, y, s, k, key) {                         // simple organ silhouettes for the body maps
    const q = popK(k); if (q < .05) return; boilSeed('og' + kind + key); s *= q;
    if (kind === 'stomach') paint(through([[x - 40 * s, y - 50 * s], [x - 20 * s, y + 10 * s], [x + 30 * s, y + 40 * s], [x + 60 * s, y + 10 * s], [x + 40 * s, y - 30 * s], [x, y - 20 * s], [x - 20 * s, y - 60 * s]], 4), { wash: '#F0A3A0', ink: PAL.ink, sw: 1 });
    else if (kind === 'kidney') for (const sd of [-1, 1]) paint(ellPts(x + sd * 40 * s, y, 20 * s, 32 * s, 14, 0, sd * .2), { wash: '#C46A5A', ink: PAL.ink, sw: .9 });
    else if (kind === 'eye') for (const sd of [-1, 1]) { paint(ellPts(x + sd * 20 * s, y, 13 * s, 9 * s, 12), { wash: PAL.cream, ink: PAL.ink, sw: .8 }); paint(ellPts(x + sd * 20 * s, y, 5 * s, 5 * s, 8), { wash: '#4F8FC0', ink: null }); }
    else if (kind === 'pancreas') { paint(through([[x - 100 * s, y + 6 * s], [x - 40 * s, y - 12 * s], [x + 40 * s, y - 24 * s], [x + 86 * s, y - 8 * s], [x + 92 * s, y + 24 * s], [x + 54 * s, y + 34 * s], [x - 10 * s, y + 18 * s], [x - 90 * s, y + 22 * s]], 4), { wash: '#F2C27A', ink: PAL.ink, sw: 1, curv: .4 });
      for (let i = 0; i < 9; i++) paint(ellPts(x - 80 * s + i * 20 * s, y + 6 * s - (i > 5 ? 8 * s : 0), 6 * s, 5 * s, 8), { wash: '#E0A85A', ink: null });
      inkLine([[x - 90 * s, y + 12 * s], [x + 60 * s, y + 4 * s], [x + 110 * s, y + 20 * s]], 2.4 * s, '#B98A55', 'ink', .4); }
    else if (kind === 'liver') paint(through([[x - 90 * s, y - 20 * s], [x + 60 * s, y - 50 * s], [x + 90 * s, y - 20 * s], [x + 30 * s, y + 40 * s], [x - 60 * s, y + 30 * s]], 4), { wash: '#A0522D', ink: PAL.ink, sw: 1 });
  }
  function scissors(x, y, s, open, ang, key) {                     // zinc scissors: two silver blades
    boilSeed('scs' + key);
    for (const sd of [-1, 1]) { const a = ang + sd * open * .5, tip = [x + Math.cos(a) * 70 * s, y + Math.sin(a) * 70 * s]; paint(ribbon([[x, y], tip], 10 * s, 2 * s), { wash: '#C9CFD8', ink: PAL.ink, sw: .8 });
      paint(ellPts(x - Math.cos(a) * 24 * s, y - Math.sin(a) * 24 * s, 12 * s, 9 * s, 10, 0, a), { wash: null, ink: PAL.ink, sw: 1.6 * s }); }
    zn(x, y, 7 * s, key + 'z', { plus: 0 });
  }
  function shotD2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
    if (t < L(26, 5.4)) {                                          // L26 a: the body map: stomach, kidneys, eyes
      K.wash('#DCEFE6', t, { key: 'd2', blob: '#EEF8F2', n: 3 });
      const bd = body(760, 1010, 900, 'd2bd');
      organ('eye', ...bd.at(0, -545), 1.6, seg(t, L(26, 3.4), L(26, 3.9)), 'd2e');
      organ('stomach', ...bd.at(25, -380), 1.4, seg(t, L(26, 2.4), L(26, 2.9)), 'd2s');
      organ('kidney', ...bd.at(0, -330), 1.3, seg(t, L(26, 2.9), L(26, 3.4)), 'd2k');
      for (const [a, b, d] of [[25, -380, 2.6], [40, -330, 3.1], [20, -545, 3.6]]) { const k = seg(t, L(26, d), L(26, d + 1.2)); if (k > 0 && k < 1) K.sparkle(...bd.at(a + 40, b - 30), 30, k, PAL.cream); }
      const o = K.act(t, [[L(26, -1), 'calm', { lookX: -.8 }], [L(26, 2.6), 'wow', { lookX: -.8 }]]);
      K.swim(1400, 860, 34, t, { ...o, flip: true }, 'd2pip0');
    } else if (t < L(27, -.3)) {                                   // L26 b: a snowy plateau; Pip pants, pops a pill, the enzyme slows, Pip climbs on
      K.wash('#CFE0F0', t, { key: 'd2m', blob: '#E6EFF8', n: 3 });
      boilSeed('d2mtn'); paint([[-300, 1100], [300, 380], [620, 560], [1080, 140], [1560, 520], [2300, 1100]], { wash: '#F4F7FA', ink: PAL.ink, sw: 1.3, curv: .1 });
      paint([[300, 380], [380, 470], [460, 430], [520, 500], [620, 560]], { wash: '#C9D6E2', ink: null }); paint([[1080, 140], [1180, 280], [1250, 240], [1350, 330], [1560, 520]], { wash: '#C9D6E2', ink: null });
      for (let i = 0; i < 20; i++) { boilSeed('d2sn' + i); const y = frac(hash(i) + (t - L(26)) * .15) * 1100 - 40, x = hash(i + 7) * W + 30 * Math.sin(t + i); paint(ellPts(x, y, 4, 4, 6), { wash: '#FFFFFF', washOp: 220, ink: null }); }
      const climb = seg(t, L(26, 8.2), L(26, 11.3)), pill = L(26, 7.0);
      const px = lerp(760, 1000, climb), py = lerp(820, 640, climb) - 60 * (px > 800 ? 0 : 0);
      let o = K.act(t, [[L(26, 5.4), 'strain', { lookX: .6, lookY: -.4 }], [pill - .4, 'calm', { lookX: .4 }], [pill + .3, 'gulp'], [pill + 1.2, 'happy', { lookX: .8, lookY: -.5 }]]);
      const pant = t < pill ? .06 * Math.abs(Math.sin(t * 9)) : 0;
      if (t > pill - .4 && t < pill + .2) o = { ...o, armF: { at: [.6, -2.6] }, armsFront: true };
      if (climb > 0 && climb < 1) o = TOON.mix(o, { walk: climb * 9, rot: -.12 });
      TOON.pip(px, py, 34, { ...o, sq: (o.sq || 0) + pant, key: 'd2pip1' });
      if (t > pill - .4 && t < pill) { const h = TOON.hand(px, py, 34, o); boilSeed('d2pl'); paint(ellPts(h[0], h[1], 9, 6, 8), { wash: PAL.cream, ink: PAL.ink, sw: .7 }); }
      if (t < pill + .6) for (let i = 0; i < 2; i++) puff(px + 60, py - 110 - 20 * i, 12 + 6 * i, frac(t * 2 + i * .5), 'd2pt' + i, '#FFFFFF');
      inset(1500, 300, 170, on(t, L(26, 7.4), L(26, 10.8), .3, .3), 'd2slow', () => { anhydrase(1500, 360, .5, 'd2ca'); snail(1480, 470, .55, t, 'd2sn2'); });
    } else if (t < L(28, -.3)) {                                   // L27: 300 zinc enzymes; the pancreas; carboxypeptidase snips the chain's end
      K.wash('#DCEFE6', t, { key: 'd2c', blob: '#EEF8F2', n: 3 });
      if (t < L(27, 3.4)) { for (let i = 0; i < 300; i++) { const p = [180 + (i % 25) * 64, 170 + Math.floor(i / 25) * 64], k = seg(t, L(27, .3) + i * .008, L(27, .6) + i * .008); if (k > 0) protein(p[0], p[1], .34 * popK(k), 'd2g' + (i % 40), { zn: k, col: pastel(i) }); } }
      else {
        organ('pancreas', 420, 380, 2.4, seg(t, L(27, 3.4), L(27, 3.9)), 'd2pa');
        for (let i = 0; i < 4; i++) { const k = seg(t, L(27, 3.8) + i * .15, L(27, 5.0) + i * .15); if (k > 0 && k < 1) { boilSeed('d2ju' + i); paint(ellPts(lerp(560, 760, k), 380 + 60 * k + 10 * i, 10, 8, 8), { wash: '#F6E6B8', ink: PAL.ink, sw: .6 }); } }
        // the chain: beads from Pip's hand to the enzyme; each snip takes the end bead, and Pip is pulled one bead nearer
        const snips = [5.4, 6.4, 7.4, 8.4].map(d => L(27, d)), n = snips.filter(s0 => t > s0).length;
        const E = [1360, 640], step = 46, px = 520 + n * step + step * ease(seg(t, snips[Math.max(0, n - 1)], snips[Math.max(0, n - 1)] + .3)) * 0;
        for (let i = 0; i < 12 - n; i++) { const x = E[0] - 110 - i * step, y = 660 + 6 * Math.sin(i + t * 3); boilSeed('d2ch' + i); paint(ellPts(x, y, 18, 18, 12), { wash: pastel(i), ink: PAL.ink, sw: .8 }); if (i) inkLine([[x + 18, y], [x + step - 18, y]], 2, PAL.ink, 'ink', 0); }
        protein(E[0], E[1] + 40, 3.0, 'd2cpa', { col: '#C9C2EA' });
        const op = snips.reduce((a, s0) => Math.max(a, pulseK(t, s0 - .2, .4)), 0);
        scissors(E[0] - 80, 660, 1.4, .2 + .7 * (1 - op), Math.PI, 'd2sc');
        snips.forEach((s0, i) => { const k = seg(t, s0, s0 + 1.0); if (k > 0 && k < 1) { boilSeed('d2cut' + i); paint(ellPts(E[0] - 110 + 30 * k, 660 + 200 * easeIn(k), 18, 18, 12), { wash: pastel(i * 3), ink: PAL.ink, sw: .8 }); } });
        let o = K.act(t, [[L(27, 3.4), 'calm', { lookX: .8 }], [snips[0], 'wow', { lookX: .8 }], [snips[2], 'worried', { lookX: .8 }]]);
        const chainEnd = E[0] - 110 - (11 - n) * step, ppx = chainEnd - 110;
        o = { ...o, armF: { to: [chainEnd - ppx - 18, 660 - 860 + 20] }, armsFront: false };
        o = TOON.mix(o, ...snips.map(s0 => TOON.jelly(t, s0, .6)));
        TOON.pip(ppx, 860, 32, { ...o, key: 'd2pip2' });
      }
    } else if (t < L(29, -.3)) {                                   // L28: the liver (alcohol); a scrape mended by zinc scissors
      K.wash('#DCEFE6', t, { key: 'd2l', blob: '#EEF8F2', n: 3 });
      organ('liver', 480, 420, 2.6, seg(t, L(28, .2), L(28, .8)), 'd2lv');
      const ek = seg(t, L(28, 1.0), L(28, 3.0));                    // ethanol (two C + OH) → acetaldehyde (an H leaves)
      const ex = lerp(300, 700, ease(ek));
      for (let j = 0; j < 2; j++) { boilSeed('d2et' + j); paint(ellPts(ex + j * 34, 640, 16, 16, 10), { wash: Z.c, ink: PAL.ink, sw: .8 }); }
      paint(ellPts(ex + 64, 624, 13, 13, 10), { wash: '#E24A3A', ink: PAL.ink, sw: .8 });
      if (ek < .7) paint(ellPts(ex + 86, 610, 7, 7, 8), { wash: PAL.cream, ink: PAL.ink, sw: .6 }); else proton(ex + 86 + 120 * seg(ek, .7, 1), 610 - 80 * seg(ek, .7, 1), .8, 'd2eh');
      zn(ex + 30, 590, 12, 'd2ez', { plus: 0, glow: .3 });
      // the arm with a scrape: old collagen cut, new laid
      boilSeed('d2arm'); paint(ribbon([[980, 860], [1760, 620]], 120, 100), { wash: '#F3D6C4', ink: PAL.ink, sw: 1.2 });
      const heal = seg(t, L(28, 5.0), L(28, 9.5));
      for (let i = 0; i < 6; i++) { const x = 1200 + i * 60, y = 790 - i * 18, cut = seg(heal, i / 8, i / 8 + .2), lay = seg(heal, .4 + i / 12, .55 + i / 12);
        boilSeed('d2col' + i); inkLine([[x - 30, y + 30], [x + 30, y - 30]], 5, cut < 1 ? '#C46A5A' : mixCol('#F2D2C4', '#E6A090', 1 - lay), 'ink', .2); }
      const sc = 1200 + 300 * heal; scissors(sc, 760 - heal * 90, 1.0, .3 + .5 * Math.abs(Math.sin(t * 8)), -2.5, 'd2sc2');
      const o = K.act(t, [[L(28, -.3), 'calm', { lookX: -.6 }], [L(28, 4.0), 'worried', { lookX: .6, lookY: .4, blush: .4 }], [L(28, 8.0), 'happy', { lookX: .6 }]]);
      K.swim(860, 640, 30, t, { ...o }, 'd2pip3');
    } else {                                                        // L29: six drawers, a zinc in every one; a medal
      K.wash('#DCEFE6', t, { key: 'd2d', blob: '#EEF8F2', n: 3 });
      const shapes = [0, 1, 2, 3, 4, 5];
      shapes.forEach(i => { const x = 300 + (i % 3) * 420, y = 330 + Math.floor(i / 3) * 330, k = ease(seg(t, L(29, .4) + i * .4, L(29, .9) + i * .4));
        boilSeed('d2dr' + i); paint(rrPts(x - 170, y - 120, 340, 240, 14), { wash: '#C9A27A', ink: PAL.ink, sw: 1.2 });
        paint(rrPts(x - 150 + 40 * k, y - 100, 300, 200, 10), { wash: '#E6CBA8', ink: PAL.ink, sw: 1 });
        paint(rrPts(x - 30 + 40 * k, y + 70, 60, 14, 6), { wash: '#8C6A44', ink: PAL.ink, sw: .8 });
        if (k > .3) protein(x + 40 * k, y + 20, 1.3, 'd2cls' + i, { col: pastel(i * 2 + 1), zn: seg(t, L(29, 3.7) + i * .3, L(29, 4.0) + i * .3), glow: .4 }); });
      const mk = seg(t, L(29, 6.0), L(29, 6.6));
      const o = K.act(t, [[L(29, -.3), 'calm', { lookX: -.6 }], [L(29, 3.8), 'wow', { lookX: -.6 }], [L(29, 6.0), 'excited']]);
      const pp = [1660, 860]; TOON.pip(pp[0], pp[1], 34, { ...o, flip: true, armF: t > L(29, 5.6) && t < L(29, 6.6) ? [1.2, 3] : o.armF, key: 'd2pip4' });
      if (mk > 0) K.medal(lerp(1560, 1190, ease(mk)), lerp(700, 330, ease(mk)), 1.2, t, 1, 'd2md');
    }
    camEnd();
    if (lt < .45) streaks(1 - seg(lt, 0, .45), 'd2in');
    if (t > L(26, 5.1) && t < L(26, 5.7)) flash(on(t, L(26, 5.1), L(26, 5.7), .3, .3), PAL.cream);
    if (t > L(27, -.6) && t < L(27, 0)) flash(on(t, L(27, -.6), L(27, 0), .3, .3), PAL.cream);
    if (t > L(27, 3.1) && t < L(27, 3.7)) flash(on(t, L(27, 3.1), L(27, 3.7), .3, .3), PAL.cream);
    if (t > L(28, -.6) && t < L(28, 0)) flash(on(t, L(28, -.6), L(28, 0), .3, .3), PAL.cream);
    if (t > L(29, -.6) && t < L(29, 0)) flash(on(t, L(29, -.6), L(29, 0), .3, .3), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#8E7FC0', '#B9AEDD']);
  }

  // ================================ E1 · the scaffold: SOD1, zinc fingers (L30 – L34) ================================
  // a DNA double helix along a path P (copied from pip_sheets.js pipHelix): two backbones winding round each other,
  // paired rungs between; ph turns it, tw = turns per 100 px. hi(k) lifts rung k (a lit address).
  const BASES = [['#E8AA38', '#3A9C98'], ['#3A9C98', '#E8AA38'], ['#E27A92', '#6E9F58'], ['#6E9F58', '#E27A92']];
  function helix(P, r, ph, tw, o = {}) {
    const C = through(P, 10), n = C.length, Ls = [0];
    for (let i = 1; i < n; i++) Ls.push(Ls[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
    const nrm = i => { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d]; };
    const at = (i, s) => { const th = ph + Ls[i] / 100 * tw * TAU + (s ? Math.PI : 0), [nx, ny] = nrm(i); return { p: [C[i][0] + nx * r * Math.sin(th), C[i][1] + ny * r * Math.sin(th)], z: Math.cos(th) }; };
    const strand = (s, front) => {
      let run = [];
      const flush = () => { if (run.length > 1) paint(ribbon(run, o.bw, o.bw), { wash: s ? o.c1 : o.c0, ink: PAL.ink, sw: o.sw }); run = []; };
      for (let i = 0; i < n; i++) { const q = at(i, s); if ((q.z >= 0) === front) run.push(q.p); else { if (run.length) run.push(q.p); flush(); } }
      flush();
    };
    boilSeed('hxB' + (o.key || '')); strand(0, false); strand(1, false);
    boilSeed('hxR' + (o.key || ''));
    const step = o.rung || 34;
    for (let d = step / 2, k = 0; d < Ls[n - 1]; d += step, k++) {
      let i = 0; while (i < n - 1 && Ls[i] < d) i++;
      const a = at(i, 0), b = at(i, 1), m = [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2], [ca, cb] = BASES[Math.floor(hash(k * 3.1 + 2) * 4)], h = o.hi ? o.hi(k) : 0;
      if (Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1]) < o.bw * 1.2) continue;
      if (h > .02) glow(m[0], m[1], 40, '#FFF2B8', .6 * h);
      paint(ribbon([a.p, m], o.rw, o.rw), { wash: mixCol(ca, PAL.cream, .5 * h), ink: PAL.ink, sw: o.sw * .6 });
      paint(ribbon([m, b.p], o.rw, o.rw), { wash: mixCol(cb, PAL.cream, .5 * h), ink: PAL.ink, sw: o.sw * .6 });
    }
    boilSeed('hxF' + (o.key || '')); strand(0, true); strand(1, true);
  }
  const dna = (x0, x1, y, ph, key, hi) => { const P = []; for (let x = x0; x <= x1; x += 30) P.push([x, y]); helix(P, 54, ph, .32, { bw: 13, rw: 7, sw: .9, c0: '#5B8FD6', c1: '#7FA9E0', rung: 30, key, hi }); };
  // SOD1 as in the copper film (copper.js sod), with each half's zinc removable: zn [k0, k1] (1 = in), mis (0..1 the sag)
  function sod(x, y, s, t, key, o = {}) {
    const zk = o.zn || [1, 1], mis = o.misfold || 0, cols = ['#E7C57A', mixCol('#E7C57A', '#D8A85A', .5)];
    for (const [i, sd] of [[0, -1], [1, 1]]) {
      boilSeed('sod' + key + i);
      const m = i ? mis : mis * .4, cx = x + sd * 70 * s, P = [];
      for (let j = 0; j < 24; j++) { const a = j / 24 * TAU, lump = m * .3 * Math.sin(a * 3 + i * 2 + 1.3); P.push([cx + Math.cos(a) * 68 * s * (1 + lump + .25 * m), y + Math.sin(a) * 96 * s * (1 + lump * .7 - .35 * m) + m * 60 * s]); }
      paint(P, { wash: mixCol(cols[i], '#C9B8A0', m * .6), ink: PAL.ink, sw: 1.1, curv: .3 });
      if (m < .5) for (let k = -2; k <= 2; k++) inkLine([[cx + k * 22 * s, y - 80 * s * Math.cos(k * .3)], [cx + k * 22 * s, y + 80 * s * Math.cos(k * .3)]], .8, mixCol(cols[i], PAL.ink, .35), 'inkfine', .3);
      const zp = [cx + sd * 8 * s, y + 10 * s], cp = [cx + sd * 8 * s + (i ? m * 30 * s * Math.sin(t * 9) : 0), y - 28 * s + (i ? m * 18 * s : 0)];
      if (zk[i] > .05) zn(zp[0], zp[1], 17 * s * zk[i], key + 'z' + i, { plus: 0 });
      cu(cp[0], cp[1], 19 * s, (o.state || [0, 0])[i], key + 'c' + i, .3 * (o.glow || 0), 0);
    }
  }
  function frog(x, y, s, t, key) {                                 // a green frog (dot eyes) on a lily pad, by its spawn
    boilSeed('fg' + key);
    paint(ellPts(x, y + 30 * s, 160 * s, 34 * s, 22), { wash: '#7BAF62', ink: PAL.ink, sw: 1 });
    paint(ellPts(x, y - 30 * s, 80 * s, 60 * s, 20), { wash: '#8CC56E', ink: PAL.ink, sw: 1.1 });
    for (const sd of [-1, 1]) { paint(ellPts(x + sd * 40 * s, y - 92 * s, 20 * s, 20 * s, 12), { wash: '#8CC56E', ink: PAL.ink, sw: 1 }); paint(ellPts(x + sd * 40 * s, y - 94 * s, 5 * s, 5 * s, 8), { wash: PAL.ink, ink: null }); }
    inkLine([[x - 30 * s, y - 50 * s], [x + 30 * s, y - 50 * s]], 1.2, PAL.ink, 'ink', .4);
    for (let i = 0; i < 14; i++) { const a = i * 2.4, d = 30 * Math.sqrt(i + .5) * s; boilSeed('fsp' + key + i); paint(ellPts(x + 230 * s + Math.cos(a) * d, y + 10 * s + Math.sin(a) * d * .6, 14 * s, 14 * s, 10), { wash: '#EEF3F6', washOp: 200, ink: PAL.ink, sw: .6 }); paint(ellPts(x + 230 * s + Math.cos(a) * d, y + 10 * s + Math.sin(a) * d * .6, 5 * s, 5 * s, 8), { wash: '#3B3346', ink: null }); }
  }
  function silhouette(x, y, s, key) {                              // a pale paper person, no face; (x, y) = feet (copper.js)
    boilSeed('sil' + key);
    paint(ellPts(x, y - 220 * s, 34 * s, 38 * s, 16), { wash: '#F6EFE3', ink: PAL.ink, sw: 1 });
    paint([[x - 50 * s, y - 175 * s], [x + 50 * s, y - 175 * s], [x + 62 * s, y - 60 * s], [x + 30 * s, y], [x - 30 * s, y], [x - 62 * s, y - 60 * s]], { wash: '#F6EFE3', ink: PAL.ink, sw: 1, curv: .3 });
  }
  // a zinc finger: thirty beads, a hairpin up the left and a helix down the right, round a zinc at its base held by two
  // Cys (left strand) and two His (helix). fold 0 (a loose line of beads) .. 1 (the finger); stiff 0 floppy .. 1; ang tips it.
  function finger(x, y, s, fold, ang, key, o = {}) {
    const n = 30, pts = [];
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1);
      let fx, fy;
      if (f < .42) { const q = f / .42; fx = -30 + 6 * Math.sin(q * 6); fy = 40 - q * 140; }
      else if (f < .55) { const q = (f - .42) / .13, a = Math.PI + q * Math.PI; fx = Math.cos(a) * 30; fy = -100 + Math.sin(a) * 26; }
      else { const q = (f - .55) / .45; fx = 30 + 13 * Math.sin(q * 15); fy = -100 + q * 140; }
      const lx = lerp(-170, 170, f), ly = 40 + 10 * Math.sin(f * 9);
      pts.push([lerp(lx, fx, fold), lerp(ly, fy, fold)]);
    }
    const P = rotPts(pts, x, y, ang, s), flop = 1 - (o.stiff ?? 1);
    if (flop > .01) P.forEach((p, i) => { const f = i / (n - 1); p[1] += flop * 90 * s * f * f; p[0] += flop * 30 * s * Math.sin(f * 4); });
    boilSeed('zf' + key); inkLine(P, 1.4 * s, mixCol(PAL.ink, '#9D8DBF', .4), 'ink', .4);
    const lig = { 2: 'S', 5: 'S', 22: 'H', 26: 'H' };
    P.forEach((p, i) => { boilSeed('zfb' + key + i); const L_ = lig[i]; paint(ellPts(p[0], p[1], (L_ ? 10 : 7.5) * s, (L_ ? 10 : 7.5) * s, 10), { wash: L_ === 'S' ? Z.cys : L_ === 'H' ? Z.his : pastel(i % 4 + 3), ink: PAL.ink, sw: .6 }); });
    const c = rotPts([[0, lerp(60, 14, fold)]], x, y, ang, s)[0];
    if ((o.zn ?? 1) > .05) zn(c[0], c[1], 16 * s * (o.zn ?? 1), key + 'z', { plus: 0, glow: .2 });
    return P;
  }
  // a cartoon glove with five fingers, each with a zinc at its knuckle; stiff 0 (noodles) .. 1 (straight); grip closes them
  function glove(x, y, s, ang, stiff, key, o = {}) {
    boilSeed('gl' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    for (let i = 0; i < 5; i++) {
      const a0 = -.75 + i * .38, base = [Math.cos(a0) * 44, Math.sin(a0) * 44], P = [base];
      for (let j = 1; j <= 5; j++) { const f = j / 5, a = a0 + (1 - stiff) * (1.4 * f * Math.sin(i + f * 3) + .9 * f) + (o.grip || 0) * f * 1.2; P.push([P[j - 1][0] + Math.cos(a) * 18, P[j - 1][1] + Math.sin(a) * 18]); }
      paint(ribbon(P, 15, 12), { wash: '#FBF7EE', ink: PAL.ink, sw: 1, curv: .3 });
      if (stiff > .5) { boilSeed('glz' + key + i); paint(ellPts(P[1][0], P[1][1], 6, 6, 8), { wash: Z.zn, ink: PAL.ink, sw: .6 }); }
    }
    paint(ellPts(0, 0, 52, 46, 20), { wash: '#FBF7EE', ink: PAL.ink, sw: 1.1 });
    paint(rrPts(-70, -26, 30, 52, 10), { wash: '#E9E3D6', ink: PAL.ink, sw: 1 });
    pop();
  }
  function shotE1(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(30, -.9), [960, 540, 1]], [L(32, -.4), [960, 540, 1]], [L(32, .2), [960, 540, 1.0]], [L(33, -.4), [960, 540, 1]], [L(33, .2), [960, 520, 1.25]], [L(34, -.4), [960, 520, 1.25]], [L(34, .2), [960, 560, 1.05]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash('#E4DDF2', t, { key: 'e1', blob: '#F1ECF8', n: 3 });
    if (t < L(32, -.3)) {                                          // L30–L31: a tent pole, then SOD1: copper trades, zinc holds; Pip pulls the zinc
      const tent = on(t, L(30, .3), L(30, 4.0), .4, .4), sodK = popK(seg(t, L(30, 3.8), L(30, 4.6)));
      if (tent > .02) { const tx = 960, ty = 700; boilSeed('e1tn'); paint([[tx - 300 * tent, ty + 160], [tx, ty - 200 * tent], [tx + 300 * tent, ty + 160]], { wash: '#B8D8C8', ink: PAL.ink, sw: 1.2, curv: .2 }); inkLine([[tx, ty + 160], [tx, ty - 200 * tent]], 3, Z.znDk, 'ink', 0); zn(tx, ty - 200 * tent, 30, 'e1tz'); }
      if (sodK > .05) {
        const pull = L(31, 3.4), back = L(31, 5.7), out = t > pull && t < back, mis = out ? backOut(seg(t, pull, pull + .6)) : t > back ? 1 - ease(seg(t, back, back + .35)) + .25 * spring(t, back + .35, 6, 18) : 0;
        const ex = Math.floor((t - L(30, 7.2)) / .6), st = t > L(30, 7.2) && t < L(30, 10.0) ? [ex % 2, (ex + 1) % 2] : [0, 0];
        sod(960, 560, 2.3 * sodK, t, 'e1sod', { zn: [1, out ? 0 : 1], misfold: t > pull ? (out ? mis : mis) : 0, state: st });
        if (t > L(30, 7.2) && t < L(30, 10.0)) { const k = frac((t - L(30, 7.2)) / .6), p = arcPt([960 - 170, 560 - 92], [960 + 150, 560 - 92], 60, ex % 2 ? 1 - k : k); el(p[0], p[1], 12, 'e1el'); }
        // Pip: pulls the zinc out of the right half (+3.4), looks, shoves it back (+5.7)
        const zp = [960 + 70 * 2.3 + 8 * 2.3, 560 + 10 * 2.3];
        let o = K.act(t, [[L(30, 4.0), 'calm', { lookX: -.8 }], [L(30, 9.4), 'wow', { lookX: -.8 }], [L(31, 2.8), 'scheme', { lookX: -.8 }], [pull + .3, 'shock', { take: 1 }], [back, 'strain'], [back + .6, 'happy']]);
        const hold = t > pull && t < back + .1, ppx = lerp(1560, 1420, ease(seg(t, L(31, 2.6), L(31, 3.3))));
        if (t > L(31, 2.8) && t < back + .3) o = { ...o, armF: { to: [lerp(zp[0] - ppx + 20, 120, hold ? ease(seg(t, pull, pull + .3)) * (1 - ease(seg(t, back - .3, back))) : 0), zp[1] - 860] } };
        o = { ...o, flip: true };
        TOON.pip(ppx, 860, 34, { ...o, key: 'e1pip' });
        if (hold) { const h = TOON.hand(ppx, 860, 34, o); zn(h[0], h[1], 17 * 2.3 * .7, 'e1hz', { plus: 0 }); }
      }
    } else if (t < L(33, -.3)) {                                   // L32: 1985, a frog's eggs; Klug at a microscope; nine loops
      frog(520, 760, 1.2, t, 'e1fg');
      const sk = ease(seg(t, L(32, 4.0), L(32, 4.8))); if (sk > .02) { silhouette(1330, 900, 1.6 * sk, 'e1kl'); scope(1500, 900, .9 * sk, 'e1sc'); }
      const lp = seg(t, L(32, 7.8), L(32, 10.6));
      for (let i = 0; i < 9; i++) { const k = popK(seg(lp, i / 11, i / 11 + .2)); if (k < .05) continue; const cx = 260 + i * 170, cy = 340;
        finger(cx, cy, .62 * k, 1, 0, 'e1lp' + i, { zn: 1 });
        if (i < 8) { boilSeed('e1lk' + i); inkLine([[cx + 20, cy + 32], [cx + 150, cy + 32]], 2.4, '#9D8DBF', 'ink', .2); } }
      const o = K.act(t, [[L(32, -.3), 'calm', { lookX: -.6 }], [L(32, 2.2), 'happy', { lookX: -.8, lookY: .3 }], [L(32, 8.2), 'wow', { lookX: -.4, lookY: -.6 }]]);
      K.swim(1000, 820, 30, t, { ...o, flip: true }, 'e1pip2');
    } else if (t < L(34, -.3)) {                                   // L33: one loop folds round a zinc into a finger, and wiggles
      const fold = ease(seg(t, L(33, 2.3), L(33, 6.4))), znK = popK(seg(t, L(33, 2.0), L(33, 2.6))), wig = .25 * Math.sin(t * 6) * on(t, L(33, 8.2), L(34, -.3), .3, .2);
      finger(960, 560, 3.0, fold, -.2 + wig * fold, 'e1f', { zn: znK });
      const o = K.act(t, [[L(33, -.3), 'calm', { lookX: -.6 }], [L(33, 6.2), 'wow', { lookX: -.6 }], [L(33, 8.0), 'excited']]);
      K.swim(1640, 860, 32, t, { ...o, flip: true }, 'e1pip3');
    } else {                                                        // L34: the glove: floppy without zinc, it slides off the DNA; zinc in, it snaps straight and pinches Pip's nose
      dna(-200, 2200, 330, t * .6, 'e1dna');
      const zin = L(34, 4.3), stiff = t < zin ? 0 : ease(seg(t, zin, zin + .25)), grip = ease(seg(t, L(34, 6.0), L(34, 6.6)));
      const slide = seg(t, L(34, 2.8), L(34, 3.8));
      let o = K.act(t, [[L(34, -.3), 'calm', { lookX: .5, lookY: -.6 }], [L(34, 2.8), 'shock', { take: 1 }], [L(34, 3.9), 'worried', { lookX: .5, lookY: -.6 }], [zin + .45, 'ouch', { take: 1.2 }], [L(34, 6.0), 'smug', { lookX: .5, lookY: -.6 }]]);
      const px = 820, py = 900 + 0 * slide;
      o = { ...o, armF: t < L(34, 2.8) ? [1.3, 3.3] : t < zin + .3 ? [lerp(1.3, -.4, ease(slide)), 3] : t < L(34, 5.8) ? { at: [.6, -2.8] } : [1.35, 3.4], armsFront: t > zin + .3 && t < L(34, 5.8) };
      TOON.pip(px, py, 36, { ...o, key: 'e1pip4' });
      const h = TOON.hand(px, py, 36, o), pinch = t > zin + .3 && t < L(34, 5.8);
      glove(h[0], h[1] - 30, 1.3, pinch ? 2.6 : -1.3 + .2 * Math.sin(t * 2) * (1 - stiff), stiff, 'e1gl', { grip: Math.max(grip, pinch ? .5 : 0) });
      for (let i = 0; i < 5; i++) { const k = seg(t, zin - .4 + i * .06, zin + i * .06); if (k > 0 && k < 1) zn(...arcPt([1500, 200], [h[0] + 20, h[1] - 60], 120, ease(k)), 9, 'e1gz' + i, { plus: 0 }); }
      if (pinch && t < zin + .7) K.burst(...TOON.mouth(px, py, 36, o), 40, seg(t, zin + .3, zin + .7), PAL.ink, 'e1pn');
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#8E7FC0', '#B9AEDD']);
    for (const ln of [32, 33, 34]) if (t > L(ln, -.6) && t < L(ln, 0)) flash(on(t, L(ln, -.6), L(ln, 0), .3, .3), PAL.cream);
  }

  // ================================ E2 · fingers read DNA; scissors; insulin's parcel (L35 – L39) ================================
  function steroid(x, y, s, key) {                                  // a hormone: four fused rings (three six, one five)
    boilSeed('st' + key);
    const hex = (cx, cy, n) => { const P = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + Math.PI / 6; P.push([cx + Math.cos(a) * 22 * s, cy + Math.sin(a) * 22 * s]); } return P; };
    [[0, 0, 6], [38, -22, 6], [76, 0, 6], [110, -26, 5]].forEach(([dx, dy, n]) => paint(hex(x + dx * s, y + dy * s, n), { wash: '#F2C27A', ink: PAL.ink, sw: .9 }));
  }
  function insulin(x, y, s, ang, key) {                            // insulin: two chains (A and B) joined, a small pastel pair
    boilSeed('in' + key);
    paint(rotEll(x, y, 26 * s, 12 * s, 12, ang), { wash: '#A9CDE8', ink: PAL.ink, sw: .8 });
    paint(rotEll(x + Math.cos(ang + 1.57) * 14 * s, y + Math.sin(ang + 1.57) * 14 * s, 20 * s, 9 * s, 12, ang), { wash: '#7FA9D6', ink: PAL.ink, sw: .8 });
  }
  function cas9(x, y, s, t, key) {                                 // a newer tool: a two-lobed protein with a guide RNA tail
    boilSeed('cs' + key);
    inkLine(through([[x - 40 * s, y + 20 * s], [x - 100 * s, y + 60 * s + 10 * Math.sin(t * 4)], [x - 160 * s, y + 40 * s]]), 4 * s, '#E27A92', 'ink', .5);
    for (const sd of [-1, 1]) paint(ellPts(x + sd * 34 * s, y, 50 * s, 42 * s, 16), { wash: sd < 0 ? '#9CCB8A' : '#C6DDA0', ink: PAL.ink, sw: 1 });
  }
  function shotE2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
    K.wash('#E4DDF2', t, { key: 'e2', blob: '#F1ECF8', n: 3 });
    if (t < L(36, -.3)) {                                          // L35: a three-finger protein slides along the DNA reading three base pairs per finger
      const slide = ease(seg(t, L(35, .5), L(35, 5.4))), fx = lerp(260, 1240, slide), open = ease(seg(t, L(35, 6.8), L(35, 7.8)));
      dna(-200, 2200, 560, .4, 'e2dna', k => { const cx = (fx - (-200 + 15)) / 30; return Math.abs(k - cx) < 4.5 ? .4 + .6 * (slide > .98 ? 1 : 0) : 0; });
      for (let i = 0; i < 3; i++) finger(fx - 100 + i * 100, 420, .9, 1, Math.PI + .2, 'e2f' + i, { zn: 1 });
      protein(fx, 300, 1.4, 'e2tf', { col: '#C9C2EA' });
      if (open > .02) { boilSeed('e2door'); glow(fx, 560, 160, '#FFF2B8', .7 * open); paint(rrPts(fx - 60, 470 - 120 * open, 120, 90, 12), { wash: '#F4D79A', ink: PAL.ink, sw: 1 }); }
      const o = K.act(t, [[L(35, -.3), 'calm', { lookX: -.6, lookY: -.3 }], [L(35, 5.5), 'idea', { lookX: -.6, lookY: -.3 }], [L(35, 7.2), 'happy']]);
      K.swim(1680, 880, 32, t, { ...o, flip: true }, 'e2pip0');
    } else if (t < L(37, -.3)) {                                   // L36: 700 zinc-finger genes; a hormone docks on its receptor, which grips DNA
      if (t < L(36, 5.6)) for (let i = 0; i < 70; i++) { const p = [200 + (i % 14) * 116, 200 + Math.floor(i / 14) * 150], k = popK(seg(t, L(36, .3) + i * .03, L(36, .6) + i * .03)); if (k < .05) continue;
        const w = .2 * Math.sin(t * 2 + i); boilSeed('e2g' + i); paint(ribbon([[p[0], p[1] + 40 * k], [p[0] + 10 * w * k, p[1]], [p[0] + 20 * w * k, p[1] - 44 * k]], 16 * k, 10 * k), { wash: pastel(i), ink: PAL.ink, sw: .8 }); zn(p[0], p[1] + 34 * k, 9 * k, 'e2gz' + i, { plus: 0 }); }
      else {
        dna(-200, 2200, 720, .9, 'e2dna2');
        const dock = ease(seg(t, L(36, 6.2), L(36, 7.4))), grip = ease(seg(t, L(36, 8.6), L(36, 9.6))), R = [960, lerp(380, 520, grip)];
        protein(R[0], R[1], 2.2, 'e2rec', { col: '#F0C2A0' });
        steroid(lerp(1500, R[0] - 50, dock), lerp(180, R[1] - 120, dock), 1.1, 'e2st');
        for (const sd of [-1, 1]) finger(R[0] + sd * 70, R[1] + 110 + 40 * grip, .7, 1, Math.PI / 2 + sd * .3, 'e2nr' + sd, { zn: 1 });
      }
      const o = K.act(t, [[L(36, -.3), 'wow', { lookX: -.6, lookY: -.3 }], [L(36, 6.0), 'calm', { lookX: -.6 }], [L(36, 9.0), 'happy']]);
      K.swim(1700, 900, 30, t, { ...o, flip: true }, 'e2pip1');
    } else if (t < L(38, -.3)) {                                   // L37: Pip bolts scissors onto a zinc-finger glove; it snips the DNA, then chases Pip; a newer tool rolls in
      dna(-200, 2200, 360, .4, 'e2dna3', k => Math.abs(k - 40) < 3 ? 1 : 0);
      const walk = ease(seg(t, L(37, 3.0), L(37, 4.6))), snip = L(37, 5.0), chase = seg(t, L(37, 5.6), L(37, 7.6));
      const gx = lerp(560, 1000, walk) + 700 * chase, gy = 470 + 300 * chase;
      glove(gx, gy, 1.2, -1.6, 1, 'e2gl2', { grip: .3 });
      const op = t < snip ? .6 : .2 + .5 * Math.abs(Math.sin(t * 14));
      scissors(gx + 40, gy - 80, 1.4, op, -Math.PI / 2 + .3 * chase, 'e2sc');
      if (t > snip && t < snip + .4) K.burst(1040, 380, 50, seg(t, snip, snip + .4), PAL.ink, 'e2snip');
      let o = K.act(t, [[L(37, -.3), 'scheme', { lookX: -.6 }], [L(37, 2.7), 'happy', { lookX: -.6, lookY: -.4 }], [L(37, 5.4), 'shock', { take: 1.2 }]]);
      o = { ...o, flip: true };
      if (t < L(37, 2.7)) o = { ...o, armF: { at: [2.6, -2.6] } };
      o = TOON.mix(o, TOON.zip(t, L(37, 6.3), { dir: 1, dist: 30 }));
      TOON.pip(1500, 860, 34, { ...o, key: 'e2pip2' });
      if (t < L(37, 2.7)) { const h = TOON.hand(1500, 860, 34, o); hammer(h[0], h[1], -1.2 + .6 * Math.abs(Math.sin(t * 12)), .8, 'e2hm'); }
      const ck = ease(seg(t, L(37, 7.6), L(37, 9.2))); if (ck > .01) cas9(lerp(-200, 700, ck), 560, 1.4, t, 'e2cas');
    } else if (t < L(39, -.3)) {                                   // L38: an islet cell; six insulins round two zincs; Pip tapes the parcel; it ships out
      K.cell(420, 640, 170, '#F2C27A', '#D9A35A', t, { key: 'e2isl', mood: 'calm', lx: .7 });
      const hx = popK(seg(t, L(38, 2.0), L(38, 2.6))), pack = ease(seg(t, L(38, 4.2), L(38, 6.2))), tape = seg(t, L(38, 6.7), L(38, 7.4)), ship = ease(seg(t, L(38, 7.8), L(38, 9.0)));
      const G = [1060 + 900 * ship, 520 - 100 * ship];
      inset(G[0], G[1], 230, hx, 'e2gr', () => {
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, d = lerp(160, 70, pack); insulin(G[0] + Math.cos(a) * d, G[1] + Math.sin(a) * d, 1.3, a + Math.PI / 2, 'e2ins' + i); }
        for (const sd of [-1, 1]) zn(G[0], G[1] + sd * 22, 18, 'e2iz' + sd, { plus: 0 });
        if (tape > 0) { boilSeed('e2tp'); inkLine([[G[0] - 200 * tape, G[1] - 120], [G[0] + 200 * tape, G[1] - 120]], 18, '#D9C29A', 'ink', 0); }
      }, '#FBF2E2');
      let o = K.act(t, [[L(38, -.3), 'calm', { lookX: .7 }], [L(38, 4.4), 'wow', { lookX: .7 }], [L(38, 6.5), 'strain', { lookX: .7 }], [L(38, 7.6), 'wave']]);
      if (t > L(38, 6.5) && t < L(38, 7.6)) o = { ...o, armF: [.6 + .3 * Math.sin(t * 10), 3.2] };
      TOON.pip(720, 900, 32, { ...o, key: 'e2pip3' });
    } else {                                                        // L39: ZnT8 pumps zinc into the granule; a variant and a growing sugar cube; antibodies drift toward it
      const G = [960, 520], R = 260;
      boilSeed('e2gm'); paint(ellPts(G[0], G[1], R, R, 40), { wash: '#FBF2E2', ink: PAL.ink, sw: 1.4 });
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; insulin(G[0] + Math.cos(a) * 80, G[1] + Math.sin(a) * 80, 1.0, a + Math.PI / 2, 'e2ins2' + i); }
      const pump = [G[0] - R, G[1]], var_ = ease(seg(t, L(39, 3.6), L(39, 4.4)));
      boilSeed('e2pm'); paint(rrPts(pump[0] - 40, pump[1] - 60, 80, 120, 20), { wash: mixCol('#F0A35A', '#C8323C', var_ * .0), ink: PAL.ink, sw: 1.1 });
      paint(ellPts(pump[0], pump[1] + 34, 14, 14, 10), { wash: var_ > .5 ? '#C8323C' : '#F0A35A', ink: PAL.ink, sw: .8 });
      for (let i = 0; i < 4; i++) { const k = frac((t - L(39) + i * .4) / 1.6); zn(lerp(pump[0] - 160, pump[0] + 80, k), pump[1] - 10 + 6 * Math.sin(i), 12, 'e2pz' + i, { plus: 0 }); }
      const cube = 1 + .35 * ease(seg(t, L(39, 4.4), L(39, 6.2)));
      if (var_ > .02) { boilSeed('e2cube'); paint(rrPts(1500 - 50 * cube, 360 - 50 * cube, 100 * cube, 100 * cube, 10), { wash: '#FBF7EE', ink: PAL.ink, sw: 1.2 }); for (let k = 0; k < 6; k++) paint(ellPts(1500 + (hash(k) - .5) * 80 * cube, 360 + (hash(k + 3) - .5) * 80 * cube, 5, 5, 6), { wash: '#E9E3D6', ink: null }); }
      for (let i = 0; i < 5; i++) { const k = ease(seg(t, L(39, 7.0) + i * .3, L(39, 9.4) + i * .3)); if (k > 0) K.antibody(lerp(200 + 40 * i, pump[0] - 80, k), lerp(900 - 100 * i, pump[1] + 60 - 40 * i, k), .7, -1.2 + .3 * i, { key: 'e2ab' + i }); }
      const o = K.act(t, [[L(39, -.3), 'calm', { lookX: -.6 }], [L(39, 4.0), 'worried', { lookX: .6, lookY: -.4 }]]);
      K.swim(1640, 880, 30, t, { ...o, flip: true }, 'e2pip4');
    }
    camEnd();
    for (const ln of [36, 37, 38, 39]) if (t > L(ln, -.6) && t < L(ln, 0)) flash(on(t, L(ln, -.6), L(ln, 0), .3, .3), PAL.cream);
    if (lt > dur - .35) flash(seg(lt, dur - .35, dur), PAL.cream);
  }

  // ================================ F1 · the messenger: free zinc is a millionth, so a puff is news (L40 – L44) ================================
  function magnifier(x, y, s, key) {                              // a magnifying glass; (x, y) = the lens centre
    boilSeed('mg' + key);
    paint(ribbon([[x + 60 * s, y + 60 * s], [x + 140 * s, y + 140 * s]], 16 * s, 14 * s), { wash: '#8C6A44', ink: PAL.ink, sw: 1 });
    paint(ellPts(x, y, 80 * s, 80 * s, 24), { wash: '#DDF0FF', washOp: 90, ink: PAL.ink, sw: 2.4 * s });
  }
  function bacterium(x, y, s, ang, key) { boilSeed('bac' + key); paint(rotEll(x, y, 70 * s, 28 * s, 18, ang), { wash: '#9CCB8A', ink: PAL.ink, sw: 1 }); for (let i = 0; i < 4; i++) inkLine([[x + Math.cos(ang) * 70 * s, y + Math.sin(ang) * 70 * s], [x + Math.cos(ang) * (110 + 10 * i) * s, y + Math.sin(ang) * 70 * s + (i - 1.5) * 18 * s]], 1, PAL.ink, 'inkfine', .5); }
  function navy(t, key) { K.wash('#262C5C', t, { key, blob: '#343C78', n: 3 }); K.motes(t, 12, '#4A5498', { key: key + 'm' }); }
  function shotF1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
    navy(t, 'f1');
    if (t < L(42, -.3)) {                                          // L40–L41: a cell full of held zinc; the one free; the librarian's shush; the puff
      const C0 = [900, 540], R = 360, puffAt = L(41, 4.4), startle = t > puffAt;
      K.cell(C0[0], C0[1], R, '#E9DDF2', '#C9B8DA', t, { key: 'f1c', mood: startle ? 'wow' : t > L(41, .5) ? 'sleepy' : 'calm', nucleus: false, lx: .2 });
      for (let i = 0; i < 26; i++) { const a = i * 2.4, d = R * .85 * Math.sqrt((i + .5) / 26), p = [C0[0] + Math.cos(a) * d, C0[1] + 60 + Math.sin(a) * d * .8];
        if (Math.hypot(p[0] - C0[0], p[1] - C0[1] + 60) < 120) continue; protein(p[0], p[1], .55 * popK(seg(t, L(40, 2.6) + i * .04, L(40, 3.0) + i * .04)), 'f1p' + i, { zn: 1, col: pastel(i) }); }
      const free = [C0[0] + 180 + 20 * Math.sin(t * 1.3), C0[1] - 150 + 14 * Math.cos(t * 1.1)];
      if (t > L(40, 5.6)) { const sw = ease(seg(t, L(40, 5.8), L(40, 9.2))), mx = lerp(C0[0] - 260, free[0], sw), my = lerp(C0[1] + 200, free[1], sw);
        if (t > L(40, 9.2)) zn(free[0], free[1], 14, 'f1free', { plus: 0, glow: .8 }); else zn(free[0], free[1], 9, 'f1free', { plus: 0 });
        if (t < L(41, .3)) magnifier(mx, my, 1.1, 'f1mg'); }
      if (startle) for (let i = 0; i < 14; i++) { const k = seg(t, puffAt, puffAt + 1.6), a = i / 14 * TAU; if (k < 1) spark(free[0] + Math.cos(a) * 160 * easeOut(k), free[1] + Math.sin(a) * 120 * easeOut(k), 9 * (1 - k), 'f1pf' + i, 1 - k); }
      let o = K.act(t, [[L(40, -.5), 'calm', { lookX: -.6 }], [L(40, 9.2), 'wow', { lookX: -.6, lookY: -.3 }], [L(41, .6), 'calm', { lookX: 0 }]]);
      if (t > L(41, .6) && t < puffAt) o = { ...o, armF: { at: [.4, -2.6] }, armsFront: true, face: 'smug', blink: .6 };   // shh
      o = TOON.mix(o, TOON.wildTake(t, puffAt + .1, { amt: .8 }));
      TOON.pip(1560, 860, 34, { ...o, flip: true, key: 'f1pip' });
      if (t > L(41, .6) && t < puffAt) { const m = TOON.mouth(1560, 860, 34, { ...o, flip: true }); for (let i = 0; i < 3; i++) { const k = frac(t * 1.2 + i / 3); boilSeed('f1sh' + i); inkLine([[m[0] - 30 - 50 * k, m[1] - 20 - 10 * i], [m[0] - 50 - 50 * k, m[1] - 30 - 10 * i]], 2, PAL.cream, 'ink', 0); } }
    } else if (t < L(43, -.3)) {                                   // L42: the hippocampus; a synapse's vesicles hold zinc with glutamate; the release
      if (t < L(42, 2.4)) {
        boilSeed('f1br'); paint(ellPts(960, 520, 420, 300, 32, 6), { wash: '#E6B8C8', ink: PAL.ink, sw: 1.3 });
        for (let i = 0; i < 6; i++) inkLine(through([[620 + i * 120, 300 + 40 * hash(i)], [660 + i * 120, 480], [610 + i * 120, 700 - 40 * hash(i + 2)]]), 1.4, '#C9919F', 'ink', .5);
        const hk = ease(seg(t, L(42, .5), L(42, 1.5))); glow(1060, 600, 160, '#BFEFFF', .7 * hk);
        boilSeed('f1hp'); paint(through([[1000, 540], [1080, 520], [1120, 580], [1080, 660], [1040, 640], [1060, 600]], 4), { wash: mixCol('#E6B8C8', Z.zn, hk), ink: PAL.ink, sw: 1.1 });
      } else {
        const pre = [960, 300], rel = L(42, 6.3);
        boilSeed('f1pre'); paint(ellPts(pre[0], pre[1], 420, 260, 30), { wash: '#C9B8E8', ink: PAL.ink, sw: 1.3 });
        boilSeed('f1post'); paint(ellPts(960, 1120, 620, 330, 34), { wash: '#B8D8C8', ink: PAL.ink, sw: 1.3 });
        for (let v = 0; v < 5; v++) { const vx = 720 + v * 120, vy = 380 + 20 * (v % 2), fuse = v < 3 ? seg(t, rel + v * .15, rel + .5 + v * .15) : 0, cy = lerp(vy, 520, ease(fuse));
          if (fuse < .9) { boilSeed('f1v' + v); paint(ellPts(vx, cy, 54, 54, 18), { wash: '#F6EEF8', ink: PAL.ink, sw: 1 });
            for (let j = 0; j < 9; j++) { const a = j * 2.4 + v, d = 36 * Math.sqrt((j + .5) / 9), q = [vx + Math.cos(a) * d, cy + Math.sin(a) * d]; if (j % 2) zn(q[0], q[1], 7, 'f1vz' + v + j, { plus: 0 }); else { boilSeed('f1g' + v + j); paint(ellPts(q[0], q[1], 6, 6, 8), { wash: '#F0A93C', ink: PAL.ink, sw: .5 }); } } }
          if (fuse > 0) for (let j = 0; j < 6; j++) { const k = seg(t, rel + v * .15 + .3, rel + v * .15 + 2.0), p = [vx + (j - 2.5) * 30 * k, 540 + 200 * easeOut(k)]; if (k > 0 && k < 1) { if (j % 2) spark(p[0], p[1], 9 * (1 - k * .5), 'f1rs' + v + j, 1); else { boilSeed('f1rg' + v + j); paint(ellPts(p[0], p[1], 7, 7, 8), { wash: '#F0A93C', ink: PAL.ink, sw: .5 }); } } }
        }
        const lit = ease(seg(t, rel + 1.2, rel + 2.0)); if (lit > .01) glow(960, 820, 300, '#BFEFFF', .5 * lit);
      }
      const o = K.act(t, [[L(42, -.3), 'calm', { lookX: -.6 }], [L(42, 6.4), 'wow', { lookX: -.6, lookY: -.3 }]]);
      K.swim(1700, 700, 30, t, { ...o, flip: true }, 'f1pip2');
    } else if (t < L(44, -.3)) {                                   // L43: a T cell meets a bacterium; its zinc rises; Pip's whistle; it springs to work
      const go = L(43, 4.6), tc = [820, 560];
      bacterium(1250, 420, 1.4, -.4 + .1 * Math.sin(t), 'f1bc');
      K.cell(tc[0], tc[1], 210, '#9CC9EC', '#6FA3CF', t, { key: 'f1tc', mood: t > go ? 'determined' : 'calm', lx: .7, sq: .18 * spring(t, go, 5, 18) - .12 * on(t, go - .3, go, .2, .05) });
      const n = Math.floor(3 + 12 * ease(seg(t, L(43, 1.8), L(43, 4.0))));
      for (let i = 0; i < n; i++) { const a = i * 2.4, d = 150 * Math.sqrt((i + .5) / 15); zn(tc[0] - 40 + Math.cos(a) * d, tc[1] + 40 + Math.sin(a) * d * .7, 10, 'f1tz' + i, { plus: 0, glow: .4 }); }
      let o = K.act(t, [[L(43, -.3), 'calm', { lookX: -.6 }], [L(43, 3.8), 'puff', { lookX: -.6 }], [go + .6, 'excited']]);
      if (t > L(43, 3.8) && t < go + .6) o = { ...o, armF: { at: [.9, -2.5] }, armsFront: true };
      TOON.pip(1480, 880, 34, { ...o, flip: true, key: 'f1pip3' });
      if (t > L(43, 3.8) && t < go + .6) { const m = TOON.mouth(1480, 880, 34, { ...o, flip: true }); boilSeed('f1wh'); paint(rrPts(m[0] - 40, m[1] - 8, 40, 16, 6), { wash: '#C9CFD8', ink: PAL.ink, sw: .9 }); if (t > go) K.burst(m[0] - 50, m[1], 60, seg(t, go, go + .5), PAL.cream, 'f1wb'); }
    } else {                                                        // L44: the egg's fireworks again, then it divides in two
      paint(rectPts(-400, -400, W + 800, H + 800), { wash: Z.night, ink: null });
      const div = ease(seg(t, L(44, 4.8), L(44, 7.0)));
      if (div < .02) egg(960, 520, 230, t, 'f1egg');
      else { egg(960, 520, 230, t, 'f1egg2', { inner: R => { for (const sd of [-1, 1]) { boilSeed('f1bl' + sd); paint(ellPts(960 + sd * 110 * div, 520, R * lerp(.94, .55, div), R * lerp(.94, .8, div), 30), { wash: Z.egg, ink: PAL.ink, sw: .9 }); } } }); }
      burst(960, 520, 230, seg(t, L(44, .5), L(44, 3.6)), 40, 'f1bs', { reach: 1 });
      const o = K.act(t, [[L(44, -.3), 'calm', { lookX: .6 }], [L(44, 5.0), 'love', { lookX: .6 }]]);
      K.swim(360, 820, 30, t, { ...o }, 'f1pip4');
    }
    camEnd();
    for (const ln of [42, 43, 44]) if (t > L(ln, -.6) && t < L(ln, 0)) flash(on(t, L(ln, -.6), L(ln, 0), .3, .3), PAL.cream);
    if (t > L(42, 2.1) && t < L(42, 2.7)) flash(on(t, L(42, 2.1), L(42, 2.7), .3, .3), PAL.cream);
    if (lt < .35) flash(1 - seg(lt, 0, .35), PAL.cream);
    if (lt > dur - .35) flash(seg(lt, dur - .35, dur), PAL.cream);
  }

  // ================================ R1 · recap 1: three jobs, one reason (L45 – L46; no Pip) ================================
  function panel(x, y, w, h, k, key, draw) {
    const q = popK(k); if (q < .05) return; boilSeed('pn' + key);
    paint(rrPts(x - w / 2 * q, y - h / 2 * q, w * q, h * q, 24), { wash: '#FFFDF6', ink: PAL.ink, sw: 1.3 });
    push(); translate(x, y); scale(q); translate(-x, -y); draw(); pop();
  }
  function shotR1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 4 * wob(t, .04), 540 + 3 * wob(t, .03), 1);
    board(t, 'r1');
    { const up = ease(seg(t, L(45, 1.8), L(45, 2.4))); zn(960, lerp(520, 120, up), lerp(80, 36, up) * popK(seg(t, L(45, -.6), L(45, .1))), 'r1zn', { glow: .3 }); }
    panel(420, 400, 480, 420, seg(t, L(45, 2.3), L(45, 2.8)), 'r1a', () => {   // catalysis: zinc pulls water into OH⁻, which meets CO₂
      const k = frac((t - L(45, 2.6)) / 3.2);
      anhydrase(420, 470, .9, 'r1ca');
      if (k < .45) water(420, 390 - 30 * (1 - seg(k, 0, .2)), 1.1, 'r1w'); else hydroxide(420, 390, 1.1, 'r1oh');
      co2(lerp(300, 395, ease(seg(k, .5, .8))), lerp(260, 340, ease(seg(k, .5, .8))), 1.0, 'r1c');
    });
    panel(960, 400, 480, 420, seg(t, L(45, 5.4), L(45, 5.9)), 'r1b', () => {   // structure: a finger standing on DNA
      dna(760, 1160, 520, t * .5, 'r1dna');
      finger(960, 380, .95, 1, Math.PI, 'r1f');
    });
    panel(1500, 400, 480, 420, seg(t, L(45, 8.4), L(45, 8.9)), 'r1c', () => {   // signal: sparks at a synapse and off an egg
      boilSeed('r1syn'); paint(ellPts(1400, 330, 90, 70, 18), { wash: '#C9B8E8', ink: PAL.ink, sw: 1 }); paint(rectPts(1330, 430, 140, 50), { wash: '#B8D8C8', ink: PAL.ink, sw: 1 });
      for (let i = 0; i < 4; i++) { const k = frac((t - L(45, 8.8)) / 1.4 + i / 4); spark(1400 + (i - 1.5) * 20, 380 + 40 * k, 8 * (1 - k), 'r1sp' + i, 1 - k); }
      egg(1600, 420, 70, t, 'r1egg'); burst(1600, 420, 70, frac((t - L(45, 8.8)) / 1.8), 16, 'r1eb', { reach: 1, s: .6 });
    });
    ['shield', 'clamp', 'tug'].forEach((kd, i) => icon(kd, 420 + 540 * i, 820, 1.3, seg(t, L(46, [3.7, 4.7, 5.5][i]), L(46, [4.0, 5.0, 5.8][i])), 'r1i', t));
    for (let i = 0; i < 3; i++) { const k = seg(t, L(46, 6.0) + i * .1, L(46, 6.6) + i * .1); if (k > 0 && k < 1) K.sparkle(420 + 540 * i + 50, 760, 30, k, PAL.ochre); }
    camEnd();
    if (lt < .35) flash(1 - seg(lt, 0, .35), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E8A57E', '#F2C2A0']);
  }

  // ================================ G1 · the turn: the grip that helps also jams; sponge, customs, alarm (L47 – L54) ================================
  function sack(x, y, s, key, tip = 0) {                            // a cloth sack of zinc marbles; tip 0..1 spills it
    boilSeed('sk' + key);
    push(); translate(x, y); rotate(tip * 1.6); scale(s);
    paint([[-40, 0], [40, 0], [50, -60], [20, -90], [-20, -90], [-50, -60]], { wash: '#D9C29A', ink: PAL.ink, sw: 1, curv: .4 });
    inkLine([[-24, -84], [24, -84]], 3, '#8C6A44', 'ink', 0);
    pop();
  }
  // metallothionein: a little yellow sponge with twenty sulfur dots; n zincs held (0..7); ox 0..1 (the sulfurs oxidised, blue)
  function sponge(x, y, s, key, n, ox = 0, sq = 0) {
    boilSeed('mt' + key);
    const P = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, r = 1 + .1 * Math.sin(a * 5 + 1); P.push([x + Math.cos(a) * 110 * s * r * (1 + sq), y + Math.sin(a) * 80 * s * r * (1 - sq)]); }
    paint(P, { wash: '#F2D46A', ink: PAL.ink, sw: 1.2, curv: .3 });
    for (let i = 0; i < 9; i++) { boilSeed('mth' + key + i); paint(ellPts(x + (hash(i + 1) - .5) * 160 * s, y + (hash(i + 4) - .5) * 100 * s, 9 * s, 7 * s, 8), { wash: '#D9B84A', ink: null }); }
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + .1, p = [x + Math.cos(a) * 96 * s * (1 + sq), y + Math.sin(a) * 68 * s * (1 - sq)]; boilSeed('mts' + key + i); paint(ellPts(p[0], p[1], 7 * s, 7 * s, 8), { wash: mixCol(Z.cys, Z.o, ox), ink: PAL.ink, sw: .5 }); }
    for (let i = 0; i < Math.round(n); i++) { const a = i / 7 * TAU, d = i ? 46 * s : 0; zn(x + Math.cos(a) * d, y + Math.sin(a) * d * .7, 15 * s, key + 'z' + i, { plus: 0 }); }
  }
  function door(x, y, s, kind, open, key) {                        // a transporter as a door in the membrane: ZIP teal (in), ZnT orange (out)
    boilSeed('dr' + key);
    const col = kind === 'zip' ? '#3FA79E' : '#E89A4A', dk = mixCol(col, PAL.ink, .3);
    for (const sd of [-1, 1]) paint(rrPts(x + sd * (14 + 22 * open) * s - 14 * s, y - 60 * s, 28 * s, 120 * s, 10 * s), { wash: col, ink: PAL.ink, sw: .9 });
    const dirY = kind === 'zip' ? 1 : -1; inkLine([[x, y - 30 * s * dirY], [x, y + 30 * s * dirY], [x - 10 * s, y + 18 * s * dirY]], 2, dk, 'ink', 0); inkLine([[x, y + 30 * s * dirY], [x + 10 * s, y + 18 * s * dirY]], 2, dk, 'ink', 0);
  }
  function bell(x, y, s, ring, key) {                               // an alarm bell on a post
    boilSeed('bl' + key); const r = .25 * ring * Math.sin(T * 40);
    push(); translate(x, y); rotate(r); scale(s);
    paint([[-30, 0], [30, 0], [24, -40], [0, -54], [-24, -40]], { wash: '#F0A93C', ink: PAL.ink, sw: 1, curv: .3 });
    paint(ellPts(0, 6, 8, 8, 8), { wash: '#A87828', ink: PAL.ink, sw: .7 });
    pop();
    if (ring > .1) for (let i = 0; i < 3; i++) { boilSeed('blr' + key + i); inkLine([[x + 40 * s + i * 10 * s, y - 40 * s], [x + 55 * s + i * 10 * s, y - 55 * s]], 2, PAL.ink, 'ink', 0); inkLine([[x - 40 * s - i * 10 * s, y - 40 * s], [x - 55 * s - i * 10 * s, y - 55 * s]], 2, PAL.ink, 'ink', 0); }
  }
  function cyto(t, key, dark = 0) { K.wash(mixCol('#F6D9C2', '#C98E74', dark), t, { key, blob: mixCol('#FBEADB', '#E0AE94', dark), n: 3 }); K.motes(t, 10, mixCol('#E9BFA4', '#B87A62', dark), { key: key + 'm' }); }
  function shotG1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
    const dark = on(t, L(47, 4.0), L(49, -.3), 1.5, .8);
    cyto(t, 'g1', dark * .6);
    if (t < L(49, -.3)) {                                          // L47–L48: the spilled marbles take other metals' seats; jammed enzymes; a sick cell; the padlock
      const trip = L(47, 1.0), seats = [[520, 600, 'mg'], [820, 520, 'fe'], [1120, 600, 'mg'], [1420, 520, 'fe']];
      seats.forEach(([x, y, m], i) => { const taken = seg(t, L(47, 2.6) + i * .5, L(47, 3.2) + i * .5), jam = t > L(48, .5);
        protein(x, y + 60, 2.2, 'g1e' + i, { col: pastel(i + 1), lean: jam ? .05 * Math.sin(t * 30 + i) * (1 - seg(t, L(48, 3.8), L(48, 4.2))) : .05 * Math.sin(t * 2 + i) });
        if (taken < .5) { if (m === 'mg') ion(x + 80 * taken, y + 2 - 60 * taken, 26, Z.mg, Z.mgDk, 2, 'g1m' + i); else ion(x + 80 * taken, y + 2 - 60 * taken, 26, Z.fe, Z.feDk, 2, 'g1m' + i); }
        else if (taken < 1) { const p = arcPt([x + 40, y - 30], [x + 160, y + 300], 80, (taken - .5) * 2); ion(p[0], p[1], 26, m === 'mg' ? Z.mg : Z.fe, m === 'mg' ? Z.mgDk : Z.feDk, 2, 'g1m' + i); }
        const mk = seg(t, L(47, 1.4) + i * .25, L(47, 2.8) + i * .5), mp = mk < 1 ? arcPt([260, 840], [x, y + 2], 200, ease(mk)) : [x, y + 2];
        if (mk > 0) zn(mp[0], mp[1], 26, 'g1z' + i, { plus: 0 });
        if (jam && t < L(48, 4.4)) puff(x + 70, y - 60 - 40 * frac(t + i * .3), 18, 1 - frac(t + i * .3), 'g1sm' + i, '#8D8794'); });
      for (let i = 4; i < 9; i++) { const mk = seg(t, L(47, 1.2) + i * .1, L(47, 2.4) + i * .12); if (mk > 0) zn(...arcPt([260, 840], [400 + i * 160, 900 + 30 * (i % 2)], 80, easeOut(mk)), 18, 'g1zf' + i, { plus: 0 }); }
      const sick = ease(seg(t, L(48, 4.9), L(48, 6.0)));
      if (t > L(48, 4.6)) K.cell(1650, 300, 150 * popK(seg(t, L(48, 4.6), L(48, 5.0))), mixCol('#F2C6B4', '#A9C47A', sick), mixCol('#DE9E88', '#7E9F4E', sick), t, { key: 'g1cell', mood: sick > .5 ? 'sad' : 'calm' });
      const lk = popK(seg(t, L(48, 8.4), L(48, 8.9))); if (lk > .05) { boilSeed('g1lock'); paint(rrPts(1600 - 50 * lk, 470, 100 * lk, 80 * lk, 12), { wash: '#C9A24A', ink: PAL.ink, sw: 1.2 }); inkLine(ellPts(1600, 470, 34 * lk, 40 * lk, 20).filter(p => p[1] <= 470), 6, '#8E96A3', 'ink', .3); }
      let o = K.act(t, [[L(47, -.5), 'happy', { lookX: .6 }], [trip, 'shock', { take: 1 }], [L(47, 5.4), 'angry', { lookX: .8 }], [L(48, 1.0), 'worried', { lookX: .8 }], [L(48, 8.0), 'smug']]);
      if (t < trip) o = TOON.mix(o, { walk: t * 4, dx: lerp(-4, 0, seg(t, L(47, -.5), trip)) });
      o = TOON.mix(o, TOON.slip(t, trip, { dir: 1, lie: .7 }));
      if (t > L(47, 5.4) && t < L(47, 7.6)) o = { ...o, armF: [.4 + .5 * Math.sin(t * 14), 2.8] };
      const ppx = t < L(47, 5.0) ? 200 : lerp(200, 1520, ease(seg(t, L(47, 5.0), L(47, 5.4))));
      TOON.pip(ppx, 880, 32, { ...o, key: 'g1pip' });
      if (t < trip + .2) { const h = TOON.hand(ppx, 880, 32, o); sack(h[0], h[1] + 10, 1.0, 'g1sk', seg(t, trip, trip + .25)); }
      else sack(320, 900, 1.0, 'g1sk', 1);
      if (t > L(48, 8.0)) { const hd = TOON.head(ppx, 880, 32, o); boilSeed('g1cap'); paint([[hd[0] - 50, hd[1] + 6], [hd[0] + 50, hd[1] + 6], [hd[0] + 30, hd[1] - 24], [hd[0] - 30, hd[1] - 24]], { wash: '#3D5F98', ink: PAL.ink, sw: 1 }); }
    } else if (t < L(51, -.3)) {                                   // L49–L50: the sponge soaks up seven zincs; oxidised, it lets go; Pip squeezes, splat
      const n = 7 * ease(seg(t, L(49, 6.0), L(49, 9.4))), ox = ease(seg(t, L(50, 4.6), L(50, 5.4))), let_ = t > L(50, 6.0), sqz = L(50, 6.8);
      const sq = .25 * pulseK(t, sqz - .2, .5);
      sponge(900, 560, 1.9 * popK(seg(t, L(49, 1.2), L(49, 1.8))), 'g1mt', let_ ? 7 * (1 - seg(t, L(50, 6.0), L(50, 6.6))) : n, ox, sq);
      for (let i = 0; i < 7; i++) { const k = seg(t, L(49, 6.0) + i * .45, L(49, 6.5) + i * .45); if (k > 0 && k < 1) zn(...arcPt([200 + 100 * i, 160], [900, 560], 100, ease(k)), 26, 'g1in' + i, { plus: 0 }); }
      if (t > L(50, 2.8)) h2o2(lerp(1500, 1040, ease(seg(t, L(50, 2.8), L(50, 4.6)))), lerp(260, 440, ease(seg(t, L(50, 2.8), L(50, 4.6)))), 2.0, .5, 'g1hp');
      if (let_) for (let i = 0; i < 7; i++) { const k = seg(t, sqz, sqz + .6); if (k > 0) zn(...arcPt([1000, 500], [1450 + (i - 3) * 20, 640 + (i % 3) * 30], 60, easeOut(k)), 24, 'g1sq' + i, { plus: 0, glow: .3 }); }
      let o = K.act(t, [[L(49, -.3), 'calm', { lookX: -.6 }], [L(49, 6.0), 'wow', { lookX: -.6 }], [L(50, 6.4), 'scheme', { lookX: -.8 }], [sqz + .2, 'deadpan']]);
      if (t > L(50, 6.2) && t < sqz + .2) o = { ...o, flip: true, armF: [.1, 3.4], armB: { to: [3.2 * 34, -2.6 * 34] } };
      o = { ...o, flip: true };
      o = TOON.mix(o, TOON.jelly(t, sqz + .2, 1.2));
      TOON.pip(1500, 880, 34, { ...o, key: 'g1pip2' });
    } else if (t < L(52, -.3)) {                                   // L51: the border: 14 ZIP doors in, 10 ZnT doors out; Pip the officer; a ZnT door slams on Pip
      boilSeed('g1mem'); paint(rectPts(-400, 400, W + 800, 160), { wash: '#F2D2B8', ink: PAL.ink, sw: 1.4 });
      paint(rectPts(-400, 560, W + 800, 700), { wash: '#F6E3D2', ink: null }); paint(rectPts(-400, -400, W + 800, 800), { wash: '#DDE6EE', ink: null });
      for (let i = 0; i < 24; i++) { const x = 120 + i * 72, kind = i % 12 < 7 ? 'zip' : 'znt', k = popK(seg(t, L(51, 2.4) + i * .1, L(51, 2.8) + i * .1));
        if (k > .05) door(x, 480, .9 * k, kind, .3 + .3 * Math.sin(t * 3 + i), 'g1d' + i);
        const ph = frac((t - L(51, 4.0)) / 1.8 + i * .13); if (t > L(51, 4.0)) zn(x, kind === 'zip' ? lerp(300, 680, ph) : lerp(680, 300, ph), 10, 'g1dz' + i, { plus: 0 }); }
      const slam = L(51, 8.6);
      let o = K.act(t, [[L(51, -.3), 'calm', { lookX: .8 }], [L(51, 5.0), 'smug', { lookX: .8 }]]);
      if (t > L(51, 5.0) && t < slam) o = { ...o, armF: [.8 + .4 * Math.sin(t * 6), 2.8] };
      o = TOON.mix(o, TOON.flatten(t, slam, { hold: .8 }));
      TOON.pip(1130, 860, 32, { ...o, key: 'g1pip3' });
      if (t > slam - .3 && t < slam + 1.6) { const k = seg(t, slam - .3, slam); boilSeed('g1slam'); paint(rrPts(1050, lerp(380, 820, easeIn(k)) - 40, 160, 60, 14), { wash: '#E89A4A', ink: PAL.ink, sw: 1.2 }); }
    } else {                                                        // L52–L54: MTF-1 with its bell grips DNA when zinc floods in; the genes for sponges and pumps light; the loop; calm
      if (t < L(54, -.3)) {
        boilSeed('g1nuc'); paint(ellPts(960, 600, 760, 420, 40), { wash: '#E9C4D8', ink: PAL.ink, sw: 1.4 });
        dna(250, 1700, 720, .7, 'g1dna', k => (k > 8 && k < 13 || k > 30 && k < 35) ? ease(seg(t, L(52, 8.2), L(52, 9.0))) * (1 - ease(seg(t, L(53, .5), L(53, 2.0)))) : 0);
        const flood = ease(seg(t, L(52, 5.8), L(52, 6.6))) * (1 - ease(seg(t, L(53, .3), L(53, 1.6)))), grip = flood;
        for (let i = 0; i < 16; i++) { const p = [300 + 90 * i, 260 + 60 * Math.sin(i * 1.3 + t)]; if (flood > .05) zn(p[0], p[1], 12 * flood, 'g1fl' + i, { plus: 0 }); }
        const M = [960, lerp(460, 560, grip)];
        protein(M[0], M[1], 1.8, 'g1mtf', { col: '#C9C2EA' });
        for (const sd of [-1, 0, 1]) finger(M[0] + sd * 70, M[1] + 80 + 60 * grip, .5, 1, Math.PI + sd * .2, 'g1mf' + sd, { zn: 1 });
        bell(M[0] + 110, M[1] - 80, 1.1, flood, 'g1bel');
        for (let i = 0; i < 4; i++) { const k = seg(t, L(52, 8.6) + i * .4, L(52, 9.6) + i * .4); if (k > 0 && k < 1) { const p = arcPt([i < 2 ? 520 : 1360, 680], [i < 2 ? 380 + i * 60 : 1500 + i * 60, 300], 80, easeOut(k)); if (i < 2) sponge(p[0], p[1], .4, 'g1ns' + i, 0); else door(p[0], p[1], .6, 'znt', .3, 'g1nd' + i); } }
        const loopK = ease(seg(t, L(53, 4.8), L(53, 6.4)));
        if (loopK > .02) { boilSeed('g1loop'); const P = []; for (let i = 0; i <= 30 * loopK; i++) { const a = -Math.PI / 2 + i / 30 * TAU; P.push([960 + Math.cos(a) * 300, 250 + Math.sin(a) * 120]); } if (P.length > 1) inkLine(P, 4, PAL.ink, 'ink', .4);
          for (const f of [.3, .63, .96]) if (loopK > f) { const a = -Math.PI / 2 + f * TAU, q = [960 + Math.cos(a) * 300, 250 + Math.sin(a) * 120], d = [-Math.sin(a) * 300, Math.cos(a) * 120], n = Math.hypot(d[0], d[1]), u = [d[0] / n, d[1] / n];
            paint([[q[0] + u[0] * 22, q[1] + u[1] * 22], [q[0] - u[0] * 10 - u[1] * 16, q[1] - u[1] * 10 + u[0] * 16], [q[0] - u[0] * 10 + u[1] * 16, q[1] - u[1] * 10 - u[0] * 16]], { wash: PAL.ink, ink: null }); } }
      } else {
        K.cell(960, 560, 260, '#F2C6B4', '#DE9E88', t, { key: 'g1calm', mood: 'happy', nucleus: false });
        sponge(560, 330, .7, 'g1cs', 4); door(1380, 330, 1.0, 'zip', .4, 'g1cd1'); door(1460, 330, 1.0, 'znt', .4, 'g1cd2'); bell(960, 210, 1.0, 0, 'g1cb');
        boilSeed('g1gauge'); paint(ellPts(1520, 760, 110, 110, 24).filter(p => p[1] <= 762), { wash: '#FFFDF6', ink: PAL.ink, sw: 1.2 });
        const a = Math.PI + .12 + .03 * Math.sin(t * 3); inkLine([[1520, 760], [1520 + Math.cos(a) * 90, 760 + Math.sin(a) * 90]], 4, PAL.ink, 'ink', 0);
      }
      const o = K.act(t, [[L(52, -.3), 'calm', { lookX: -.6 }], [L(52, 6.4), 'wow', { lookX: -.6 }], [L(54, 1.0), 'bliss']]);
      K.swim(1700, 900, 30, t, { ...o, flip: true }, 'g1pip4');
    }
    camEnd();
    for (const ln of [49, 51, 52, 54]) if (t > L(ln, -.6) && t < L(ln, 0)) flash(on(t, L(ln, -.6), L(ln, 0), .3, .3), PAL.cream);
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E8A57E', '#F2C2A0']);
    streaks(seg(lt, dur - .45, dur), 'g1wp');
  }

  // ================================ H1 · where it comes from: no store; oysters; phytate; yeast; the ZIP4 door (L55 – L59) ================================
  function ferritin(x, y, s, n, key) {                             // iron's warehouse: a hollow shell of subunits with rust beads inside
    boilSeed('fr' + key);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; paint(ellPts(x + Math.cos(a) * 110 * s, y + Math.sin(a) * 110 * s, 34 * s, 26 * s, 12, 0, a), { wash: '#E6C9A8', ink: PAL.ink, sw: .9 }); }
    for (let i = 0; i < n; i++) { const a = i * 2.4, d = 70 * s * Math.sqrt((i + .5) / 24); boilSeed('frb' + key + i); paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d, 11 * s, 11 * s, 8), { wash: Z.fe, ink: PAL.ink, sw: .5 }); }
  }
  function shed(x, y, s, key) {                                    // an empty shed with a padlock
    boilSeed('sh' + key);
    paint([[x - 120 * s, y], [x + 120 * s, y], [x + 120 * s, y - 150 * s], [x, y - 230 * s], [x - 120 * s, y - 150 * s]], { wash: '#C9CFD8', ink: PAL.ink, sw: 1.2 });
    paint(rectPts(x - 60 * s, y - 130 * s, 120 * s, 130 * s), { wash: '#4E5A66', ink: PAL.ink, sw: 1 });
    paint(rrPts(x - 18 * s, y - 80 * s, 36 * s, 30 * s, 6), { wash: '#C9A24A', ink: PAL.ink, sw: .9 }); inkLine(ellPts(x, y - 80 * s, 12 * s, 16 * s, 14).filter(p => p[1] <= y - 80 * s), 3, '#8E96A3', 'ink', .3);
  }
  function oyster(x, y, s, open, key) {                            // an oyster: two rough shells hinged at the left; open 0..1
    boilSeed('oy' + key);
    paint(ellPts(x, y, 90 * s, 34 * s, 18, 3), { wash: '#B9B2A6', ink: PAL.ink, sw: 1 });
    if (open > .05) paint(ellPts(x + 6 * s, y - 4 * s, 70 * s, 22 * s, 16), { wash: '#F3EEE2', ink: PAL.ink, sw: .8 });
    push(); translate(x - 80 * s, y); rotate(-.9 * open); paint(ellPts(80 * s, -10 * s, 92 * s, 30 * s, 18, 3), { wash: '#A39C90', ink: PAL.ink, sw: 1 }); pop();
  }
  function food(kind, x, y, s, key) {                               // a few foods, simply painted
    boilSeed('fd' + kind + key);
    if (kind === 'steak') { paint(ellPts(x, y, 70 * s, 46 * s, 18, 4), { wash: '#C8464F', ink: PAL.ink, sw: 1 }); inkLine(through([[x - 40 * s, y], [x, y - 14 * s], [x + 40 * s, y + 6 * s]]), 4 * s, '#F2D2C4', 'ink', .5); }
    else if (kind === 'clam') { paint(ellPts(x, y, 56 * s, 40 * s, 18).filter(p => p[1] <= y + 10 * s), { wash: '#E8C8A8', ink: PAL.ink, sw: 1 }); for (let i = -2; i <= 2; i++) inkLine([[x, y + 8 * s], [x + i * 20 * s, y - 30 * s]], 1, PAL.ink, 'inkfine', .3); }
    else if (kind === 'nuts') for (let i = 0; i < 4; i++) paint(ellPts(x + (i - 1.5) * 26 * s, y + (i % 2) * 10 * s, 16 * s, 12 * s, 12, 1, i), { wash: '#C58A4A', ink: PAL.ink, sw: .8 });
    else if (kind === 'beans') for (let i = 0; i < 5; i++) paint(ellPts(x + (i - 2) * 22 * s, y + (i % 2) * 8 * s, 12 * s, 9 * s, 10, 0, i * .7), { wash: '#B23F3A', ink: PAL.ink, sw: .7 });
    else if (kind === 'grain') for (let i = 0; i < 6; i++) paint(ellPts(x + (i - 2.5) * 18 * s, y - Math.abs(i - 2.5) * 6 * s, 7 * s, 13 * s, 10, 0, (i - 2.5) * .3), { wash: '#E8C547', ink: PAL.ink, sw: .6 });
  }
  function phytate(x, y, s, key, t = 0) {                           // phytate: an amber ring with six sticky phosphate arms
    boilSeed('py' + key);
    const P = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; P.push([x + Math.cos(a) * 34 * s, y + Math.sin(a) * 34 * s]); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .1 * Math.sin(t * 3 + i), e = [x + Math.cos(a) * 76 * s, y + Math.sin(a) * 76 * s]; inkLine([P[i], e], 4 * s, '#B8862A', 'ink', .3); paint(ellPts(e[0], e[1], 16 * s, 16 * s, 12), { wash: '#F0B94A', ink: PAL.ink, sw: .8 }); }
    paint(P, { wash: '#E8AA38', ink: PAL.ink, sw: 1 });
  }
  function yeast(x, y, r, t, key, munch = 0) {                      // a yeast cell (a face) with a bud
    K.cell(x, y, r, '#F4E3B8', '#D9C08A', t, { key, mood: munch > .5 ? 'happy' : 'calm', nucleus: false, extras: () => { boilSeed('yb' + key); paint(ellPts(x + r * .9, y - r * .6, r * .35, r * .32, 12), { wash: '#F4E3B8', ink: PAL.ink, sw: .8 }); } });
  }
  function mantou(x, y, s, rise, key) { boilSeed('mn' + key); paint(ellPts(x, y - 50 * s * rise, 110 * s, (30 + 50 * rise) * s, 22).filter(p => p[1] <= y), { wash: '#FBF6EA', ink: PAL.ink, sw: 1.1 }); paint(rectPts(x - 110 * s, y - 4, 220 * s, 8), { wash: '#E9E3D6', ink: null }); }
  function flatCake(x, y, s, key) { boilSeed('fc' + key); paint(ellPts(x, y - 12 * s, 120 * s, 16 * s, 20), { wash: '#E8D2A6', ink: PAL.ink, sw: 1 }); for (let i = 0; i < 6; i++) paint(ellPts(x + (hash(i) - .5) * 180 * s, y - 14 * s, 6 * s, 3 * s, 6), { wash: '#B98A55', ink: null }); }
  function villi(t, key, y0 = 760) {                               // the gut wall: finger-like villi along the bottom
    boilSeed('vl' + key); paint(rectPts(-400, y0 + 80, W + 800, 600), { wash: '#E6A090', ink: null });
    for (let i = 0; i < 12; i++) { const x = 40 + i * 170, P = [[x - 60, y0 + 90], [x - 50, y0 - 40], [x, y0 - 90 + 6 * Math.sin(t + i)], [x + 50, y0 - 40], [x + 60, y0 + 90]]; paint(through(P, 5), { wash: '#F2B4A6', ink: PAL.ink, sw: 1.1 }); }
  }
  function shotH1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
    if (t < L(56, 2.8)) {                                           // L55–L56 a: iron's warehouse vs zinc's empty shed; a bead a day; the daily pinch
      K.wash('#F3E6D2', t, { key: 'h1k', blob: '#FAF1E4', n: 3 });
      if (t < L(56, -.3)) {
        ferritin(560, 500, 1.6 * popK(seg(t, L(55, 1.8), L(55, 2.4))), Math.floor(24 * ease(seg(t, L(55, 4.4), L(55, 6.0)))), 'h1fr');
        if (t > L(55, 3.8)) shed(1340, 700, 1.3 * popK(seg(t, L(55, 3.8), L(55, 4.4))), 'h1sh');
        const day = (t - L(55, 6.2)) / .7; if (day > 0) { const k = frac(day), sky = Math.floor(day) % 2; boilSeed('h1sky'); paint(ellPts(1340 + 160 * Math.cos(Math.PI + k * Math.PI), 200 + 60 * Math.sin(Math.PI + k * Math.PI) * -1 + 60, 30, 30, 14), { wash: sky ? '#F8E7A8' : '#F2B84A', ink: PAL.ink, sw: .9 }); zn(1500, lerp(200, 640, easeIn(k)), 14, 'h1day', { plus: 0 }); }
      } else {
        boilSeed('h1sp'); paint(ribbon([[700, 640], [1260, 560]], 18, 12), { wash: '#C9CFD8', ink: PAL.ink, sw: 1 }); paint(ellPts(1300, 552, 80, 46, 18), { wash: '#C9CFD8', ink: PAL.ink, sw: 1.1 });
        for (let i = 0; i < 5; i++) zn(1286 + (i % 3) * 14, 544 - Math.floor(i / 3) * 10, 7, 'h1pinch' + i, { plus: 0 });
      }
      const o = K.act(t, [[L(55, -1), 'calm', { lookX: -.6 }], [L(55, 4.2), 'worried', { lookX: .6 }], [L(55, 6.4), 'idea'], [L(56, .3), 'wow', { lookX: .5, lookY: -.3 }]]);
      K.swim(t < L(56, -.3) ? 960 : 520, 880, 32, t, { ...o, flip: t < L(56, -.3) }, 'h1pip0');
    } else if (t < L(57, -.3)) {                                   // L56 b: the oyster bed; one snaps on Pip's nose; a parade of foods
      K.wash('#9FD0C8', t, { key: 'h1s', blob: '#C2E2DC', n: 3 });
      paint(rectPts(-400, 820, W + 800, 600), { wash: '#D9C7A0', ink: null });
      for (let i = 0; i < 9; i++) { const k = 4.6, op = i === 4 ? (t < L(56, k) ? .3 + .2 * Math.sin(t * 3) : t < L(56, k + .6) ? .9 * seg(t, L(56, k), L(56, k + .2)) : 0) : .1 + .1 * Math.sin(t + i); oyster(260 + i * 180, 860 + 20 * (i % 2), .9, op, 'h1o' + i); }
      for (let i = 0; i < 8; i++) { boilSeed('h1bb' + i); const k = frac(t * .3 + hash(i)); paint(ellPts(300 + i * 200, 800 - 600 * k, 8, 8, 8), { wash: '#E8F6F4', ink: PAL.ink, sw: .5 }); }
      const snap = L(56, 5.3);
      let o = K.act(t, [[L(56, 2.8), 'scheme', { lookX: .2, lookY: .8 }], [snap, 'ouch', { take: 1.2 }], [L(56, 7.4), 'happy', { lookX: .8 }]]);
      if (t > L(56, 4.2) && t < snap) o = { ...o, armF: [-.3, 3], armB: { to: [2.6 * 34, -.8 * 34] }, rot: .2, dy: .3 };
      const ppx = 980, ppy = 760;
      o = TOON.mix(o, t > snap && t < L(56, 7.4) ? { dy: -.4 * Math.abs(Math.sin((t - snap) * 9)), rot: .1 * Math.sin((t - snap) * 7) } : {});
      TOON.pip(ppx, ppy, 34, { ...o, key: 'h1pip1' });
      if (t > snap && t < L(56, 7.4)) { const m = TOON.mouth(ppx, ppy, 34, o); oyster(m[0] + 50, m[1] - 10, .6, .05, 'h1nose'); }
      const par = seg(t, L(56, 7.6), L(56, 10.6));
      ['steak', 'clam', 'nuts', 'beans'].forEach((kd, i) => { const k = ease(seg(par, i * .18, i * .18 + .4)); if (k > 0) food(kd, lerp(2100, 1240 + i * 160, k), 400 + (i % 2) * 70, 1.1, 'h1f' + i); });
    } else if (t < L(58, -.3)) {                                   // L57: grains and beans; phytate grabs zinc in the gut; Pip pulls and sticks like flypaper
      K.wash('#F3E6D2', t, { key: 'h1g', blob: '#FAF1E4', n: 3 });
      villi(t, 'h1v');
      ['grain', 'beans', 'grain'].forEach((kd, i) => food(kd, 300 + i * 160, 220, 1.4 * popK(seg(t, L(57, .3) + i * .2, L(57, .7) + i * .2)), 'h1gr' + i));
      const pk = popK(seg(t, L(57, 2.0), L(57, 2.8))), grab = ease(seg(t, L(57, 3.3), L(57, 4.4))), P = [1060, 480];
      if (pk > .05) phytate(P[0], P[1], 1.6 * pk, 'h1py', t);
      zn(lerp(1500, P[0] + 70, grab), lerp(380, P[1] - 60, grab), 22, 'h1pz');
      const pull = L(57, 5.6), stuck = t > L(57, 6.6);
      let o = K.act(t, [[L(57, -.3), 'calm', { lookX: -.6 }], [L(57, 4.4), 'angry', { lookX: -.8 }], [pull, 'strain', { lookX: -.8 }], [L(57, 6.6), 'shock', { take: 1 }], [L(57, 7.6), 'mortified']]);
      const ppx = stuck ? 1300 + 40 * Math.sin(t * 5) * (1 - seg(t, L(57, 7.6), L(57, 8.6))) : 1340;
      if (t > pull - .3) o = { ...o, flip: true, armF: { to: [-(ppx - (P[0] + 100)), -(860 - (P[1] + 40))] }, rot: stuck ? -.08 : .15 };
      o = { ...o, flip: true };
      TOON.pip(ppx, 860, 34, { ...o, key: 'h1pip2' });
      if (t > pull - .3) { const h = TOON.hand(ppx, 860, 34, o); boilSeed('h1gum'); inkLine([h, [P[0] + 100, P[1] + 40]], stuck ? 6 : 3, '#F0B94A', 'ink', .4); }
      const veg = popK(seg(t, L(57, 8.4), L(57, 9.0)));
      if (veg > .05) { boilSeed('h1veg'); paint(ellPts(420, 640, 150 * veg, 40 * veg, 20), { wash: '#FBF7EE', ink: PAL.ink, sw: 1 }); food('beans', 380, 620, 1.2 * veg, 'h1vb'); for (let i = 0; i < 3; i++) { paint(ellPts(560 + i * 70, 560, 30 * veg * (i === 2 ? .55 : 1), 16 * veg, 12), { wash: '#C9CFD8', ink: PAL.ink, sw: .8 }); } }
    } else if (t < L(59, -.3)) {                                   // L58: yeast munches phytate and frees zinc; a fluffy mantou rises beside a flat cake
      K.wash('#F3E6D2', t, { key: 'h1y', blob: '#FAF1E4', n: 3 });
      const munch = ease(seg(t, L(58, 1.9), L(58, 3.6)));
      if (munch < 1) phytate(960, 360, 1.6 * (1 - munch), 'h1py2', t);
      for (let i = 0; i < 3; i++) yeast(760 + i * 200 + 60 * Math.sin(t * 2 + i) * (1 - munch), 380 + 80 * Math.sin(i * 2) - 20 * munch, 70, t, 'h1ye' + i, munch);
      if (munch > .1) zn(lerp(1030, 1500, munch), lerp(320, 220, munch), 22, 'h1fz', { plus: 0, glow: .3 });
      const rise = ease(seg(t, L(58, 4.0), L(58, 6.8)));
      mantou(700, 900, 1.2, rise, 'h1mt'); flatCake(1200, 900, 1.2, 'h1fc');
      for (let i = 0; i < 4; i++) { const k = frac(t * .6 + i / 4); if (rise > .3) puff(700 + (i - 1.5) * 50, 780 - 120 * k, 14, 1 - k, 'h1st' + i, '#FFFFFF'); }
      const o = K.act(t, [[L(58, -.3), 'calm', { lookX: .6 }], [L(58, 2.4), 'happy', { lookX: .6, lookY: -.3 }], [L(58, 6.0), 'love']]);
      K.swim(1640, 860, 32, t, { ...o, flip: true }, 'h1pip3');
    } else {                                                        // L59: the gut wall: the ZIP4 door pulls zinc in; Pip ties a red ribbon on it
      K.wash('#F3E6D2', t, { key: 'h1z', blob: '#FAF1E4', n: 3 });
      villi(t, 'h1v2', 700);
      const D = [960, 620];
      door(D[0], D[1], 1.6, 'zip', .4 + .2 * Math.sin(t * 3), 'h1zip');
      for (let i = 0; i < 5; i++) { const k = frac((t - L(59)) / 1.6 + i / 5); zn(D[0] + 10 * Math.sin(i), lerp(320, 820, k), 16, 'h1zz' + i, { plus: 0 }); }
      const rib = ease(seg(t, L(59, 4.6), L(59, 5.8)));
      if (rib > .02) { boilSeed('h1rib'); for (const sd of [-1, 1]) paint(ribbon([[D[0] + 40, D[1] - 70], [D[0] + 40 + sd * 30 * rib, D[1] - 110], [D[0] + 40 + sd * 50 * rib, D[1] - 90]], 12, 6), { wash: '#C8323C', ink: PAL.ink, sw: .8 }); }
      let o = K.act(t, [[L(59, -.3), 'calm', { lookX: -.6 }], [L(59, 4.4), 'strain', { lookX: -.8 }], [L(59, 5.9), 'wink']]);
      if (t > L(59, 4.4) && t < L(59, 5.9)) o = { ...o, armF: [.4 + .2 * Math.sin(t * 12), 3] };
      TOON.pip(1180, 640, 32, { ...o, flip: true, key: 'h1pip4' });
    }
    camEnd();
    for (const ln of [56, 57, 58, 59]) if (t > L(ln, -.6) && t < L(ln, 0)) flash(on(t, L(ln, -.6), L(ln, 0), .3, .3), PAL.cream);
    if (t > L(56, 2.5) && t < L(56, 3.1)) flash(on(t, L(56, 2.5), L(56, 3.1), .3, .3), PAL.cream);
    if (lt < .45) streaks(1 - seg(lt, 0, .45), 'h1in');
    if (lt > dur - .9) paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#E2C79A', washOp: 255 * ease(seg(lt, dur - .9, dur)), ink: null });
  }

  // ================================ I1 · too little: the long road, Prasad, the children, the AE baby (L60 – L68; gentle, no Pip) ================================
  function dusty(t, key) { K.wash('#E2C79A', t, { key, blob: '#EED9B4', n: 3 }); K.motes(t, 10, '#D3B27C', { key: key + 'm' }); }
  function person(x, y, h, key, o = {}) {                          // a pale paper figure, no face; h = height; (x, y) = feet
    boilSeed('ps' + key); const s = h / 300;
    paint(ellPts(x, y - 270 * s, 26 * s, 30 * s, 14), { wash: o.col || '#F6EFE3', ink: PAL.ink, sw: 1 });
    paint([[x - 44 * s, y - 232 * s], [x + 44 * s, y - 232 * s], [x + 50 * s, y - 110 * s], [x + 30 * s, y], [x - 30 * s, y], [x - 50 * s, y - 110 * s]], { wash: o.col || '#F6EFE3', ink: PAL.ink, sw: 1, curv: .3 });
    if (o.patch) for (const [a, b] of [[0, -255], [-48, -120], [48, -120], [-26, -6], [26, -6]]) paint(ellPts(x + a * s, y + b * s, 12 * s * o.patch, 9 * s * o.patch, 10), { wash: '#E9675F', washOp: 170, ink: null });
  }
  function heightMark(x, y, h, key) { boilSeed('hm' + key); inkLine([[x, y], [x, y - 360]], 3, '#8C6A44', 'ink', 0); for (let i = 0; i < 9; i++) inkLine([[x, y - i * 40], [x + (i % 2 ? 14 : 24), y - i * 40]], 2, '#8C6A44', 'ink', 0); inkLine([[x - 30, y - h], [x + 34, y - h]], 4, '#C8323C', 'ink', 0); }
  function shotI1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 5 * wob(t, .04), 540 + 4 * wob(t, .035), 1);
    dusty(t, 'i1');
    if (t < L(61, -.3)) {                                          // L60: a winding road: a mould, a rat, a big question for us
      boilSeed('i1road'); inkLine(through([[-100, 900], [400, 760], [800, 840], [1200, 700], [1600, 760], [2100, 640]]), 70, '#EAD7B0', 'ink', .5);
      const ms = [[380, 640, 3.0], [1000, 600, 6.7], [1600, 560, 9.5]];
      ms.forEach(([x, y, d], i) => { const k = popK(seg(t, L(60, d), L(60, d + .5))); if (k < .05) return;
        if (i === 0) { boilSeed('i1mold'); for (let j = 0; j < 22; j++) { const a = j / 22 * TAU + hash(j) * .2, L_ = (90 + 40 * hash(j + 3)) * k; inkLine([[x, y], [x + Math.cos(a) * L_ * .6, y + Math.sin(a) * L_ * .6 + 8 * Math.sin(j)], [x + Math.cos(a) * L_, y + Math.sin(a) * L_ * .8]], 1.6, '#3B3346', 'inkfine', .5); paint(ellPts(x + Math.cos(a) * L_, y + Math.sin(a) * L_ * .8, 9 * k, 9 * k, 8), { wash: '#2F2B38', ink: null }); }
          for (let j = 0; j < 5; j++) paint(ellPts(x + (hash(j + 9) - .5) * 70 * k, y + (hash(j + 11) - .5) * 40 * k, 46 * k, 34 * k, 14, 4), { wash: j % 2 ? '#4B4F63' : '#6E6A78', ink: j ? null : PAL.ink, sw: .8 }); }
        else if (i === 1) mouseT(x, y + 90, 1.4 * k, t, 'i1rat');
        else pipEmote('question', x, y, 60 * k, 1, 'i1q'); });
    } else if (t < L(64, -.3)) {                                   // L61–L63: Shiraz; the doctor; the young man by the height mark; bread and clay; then Egypt and growth
      const egypt = t > L(63, 2.6);
      boilSeed('i1sky'); paint(rectPts(-400, 720, W + 800, 600), { wash: '#D3B27C', ink: null });
      if (!egypt) { for (let i = 0; i < 6; i++) { const x = 140 + i * 300, h = 120 + 60 * hash(i); boilSeed('i1b' + i); paint(rectPts(x, 720 - h, 160, h), { wash: '#C9A57A', ink: PAL.ink, sw: .9 }); if (i % 2 === 0) paint(ellPts(x + 80, 720 - h, 70, 60, 18).filter(p => p[1] <= 720 - h), { wash: '#4F8FC0', ink: PAL.ink, sw: .9 }); paint(ellPts(x + 230, 690, 18, 70, 12), { wash: '#6E9F58', ink: PAL.ink, sw: .8 }); } }
      else { boilSeed('i1eg'); for (const [x, h] of [[300, 300], [600, 220], [1500, 260]]) paint([[x - h, 720], [x, 720 - h], [x + h, 720]], { wash: '#E8C590', ink: PAL.ink, sw: 1 }); inkLine(through([[-100, 760], [800, 800], [1900, 770]]), 30, '#4F8FC0', 'ink', .5); }
      const doc = popK(seg(t, L(61, 2.5), L(61, 3.1))); if (doc > .05) { person(560, 950, 360 * doc, 'i1doc'); boilSeed('i1st'); inkLine(through([[530, 700], [560, 760], [600, 700]]), 2, PAL.ink, 'ink', .4); }
      heightMark(1220, 950, egypt ? lerp(200, 330, ease(seg(t, L(63, 5.6), L(63, 8.4)))) : 200, 'i1hm');
      const yk = popK(seg(t, L(61, 5.0), L(61, 5.6))), tall = egypt ? lerp(220, 340, ease(seg(t, L(63, 5.6), L(63, 8.4)))) : 220, pale = !egypt && t > L(61, 9.9) ? (t > L(62, 6.0) ? 1 - ease(seg(t, L(62, 6.0), L(62, 7.0))) : ease(seg(t, L(61, 9.9), L(61, 10.6)))) : 0;
      if (yk > .05) person(1140, 950, tall * yk, 'i1man', { col: mixCol('#F6EFE3', '#E6E6EE', pale) });
      if (egypt) for (let i = 0; i < 2; i++) person(1400 + i * 140, 950, lerp(200, 320, ease(seg(t, L(63, 5.6) + i * .3, L(63, 8.4) + i * .3))), 'i1teen' + i);
      if (t > L(62) && t < L(63)) { const fb = popK(seg(t, L(62, .4), L(62, 1.0))), cl = popK(seg(t, L(62, 2.8), L(62, 3.4)));
        if (fb > .05) flatCake(860, 520, 1.1 * fb, 'i1fb'); if (cl > .05) { boilSeed('i1clay'); paint(ellPts(1560, 540, 120 * cl, 44 * cl, 18).filter(p => p[1] >= 520), { wash: '#C9A57A', ink: PAL.ink, sw: 1 }); paint(ellPts(1560, 520, 100 * cl, 22 * cl, 16), { wash: '#8C6A44', ink: PAL.ink, sw: .8 }); }
        const fk = seg(t, L(62, 5.6), L(62, 6.4)); if (fk > 0) ion(...arcPt([1500, 300], [1140, 760], 120, ease(fk)), 22, Z.fe, Z.feDk, 2, 'i1fe');
        if (t > L(62, 8.2)) pipEmote('question', 1240, 640, 40 * popK(seg(t, L(62, 8.2), L(62, 8.6))), 1, 'i1q2'); }
      if (t > L(63, .8) && t < L(63, 3.0)) zn(560, 520, 26 * popK(seg(t, L(63, .8), L(63, 1.3))), 'i1zl', { plus: 0, glow: .8 });
      if (t > L(63, 9.9)) K.check(1700, 360, 120, seg(t, L(63, 9.9), L(63, 10.6)), 'i1ck');
    } else if (t < L(66, -.3)) {                                   // L64–L65: a sixth of the world; four gentle icons
      if (t < L(65, -.3)) {
        boilSeed('i1gl'); paint(ellPts(960, 420, 260, 260, 32), { wash: '#8FC3E6', ink: PAL.ink, sw: 1.3 });
        for (const [a, b, rx, ry] of [[-80, -60, 90, 60], [70, 40, 110, 70], [-40, 120, 60, 40]]) paint(ellPts(960 + a, 420 + b, rx, ry, 16, 8), { wash: '#B8D8A0', ink: null });
        for (let i = 0; i < 6; i++) { const k = popK(seg(t, L(64, .8) + i * .3, L(64, 1.3) + i * .3)); if (k > .05) person(560 + i * 160, 1000, 240 * k, 'i1w' + i, { col: i === 3 ? '#D9D3DC' : '#F6EFE3' }); }
        if (t > L(64, 5.2)) for (let i = 0; i < 10; i++) food('grain', 300 + i * 150, 200 + 30 * Math.sin(i), 1.2 * popK(seg(t, L(64, 5.2) + i * .1, L(64, 5.6) + i * .1)), 'i1gf' + i);
      } else {
        const ic = i => popK(seg(t, L(65, [0, 1.7, 3.0, 6.3][i]), L(65, [.5, 2.2, 3.5, 6.8][i])));
        if (ic(0) > .05) { heightMark(330, 900, 150, 'i1h2'); person(420, 900, 220 * ic(0), 'i1sh'); }
        if (ic(1) > .05) { boilSeed('i1scr'); paint(ribbon([[600, 720], [1000, 580]], 130 * ic(1), 110 * ic(1)), { wash: '#F3D6C4', ink: PAL.ink, sw: 1.2 }); inkLine([[720, 690], [880, 630]], 10, '#C46A5A', 'ink', .3); inkLine([[740, 640], [860, 680]], 6, '#C46A5A', 'ink', .3); }
        if (ic(2) > .05) { const sh = 1 - .35 * ease(seg(t, L(65, 4.0), L(65, 5.6))); for (const sd of [-1, 1]) { boilSeed('i1th' + sd); paint(ellPts(1250 + sd * 70 * sh, 620, 64 * sh * ic(2), 120 * sh * ic(2), 16), { wash: '#F2B4A6', ink: PAL.ink, sw: 1.2 }); } for (let i = 0; i < 5; i++) K.cell(1200 + i * 25, 560 + 30 * (i % 2), 14 * sh, '#9CC9EC', '#6FA3CF', t, { key: 'i1tc' + i, nucleus: false }); }
        if (ic(3) > .05) { boilSeed('i1gut'); inkLine(through([[1560, 420], [1720, 560], [1580, 700], [1740, 860]]), 60, '#F2B4A6', 'ink', .5); for (let i = 0; i < 5; i++) water(1600 + 30 * (i % 3), 440 + 420 * frac(t * .6 + i * .2), 1.2, 'i1gw' + i); }
      }
    } else if (t < L(67, -.3)) {                                   // L66: ORS and water; a zinc tablet; ten days pass; the child is up
      boilSeed('i1ors'); paint(rrPts(560, 420, 160, 220, 16), { wash: '#EEF3F6', ink: PAL.ink, sw: 1.2 }); paint(rectPts(560, 480, 160, 50), { wash: '#4F8FC0', ink: null });
      paint(rrPts(780, 460, 110, 180, 10), { wash: '#DDF0FF', washOp: 160, ink: PAL.ink, sw: 1.1 });
      const tab = popK(seg(t, L(66, 2.6), L(66, 3.1))); if (tab > .05) { boilSeed('i1tab'); paint(ellPts(1000, 560, 40 * tab, 30 * tab, 14), { wash: '#EEF2F6', ink: PAL.ink, sw: 1 }); zn(1000, 560, 16 * tab, 'i1tz', { plus: 0 }); }
      const days = Math.floor(clamp((t - L(66, 5.3)) / .2, 0, 10)); for (let i = 0; i < days; i++) { boilSeed('i1d' + i); paint(ellPts(560 + i * 80, 260, 18, 18, 12), { wash: i % 2 ? '#F8E7A8' : '#F2B84A', ink: PAL.ink, sw: .8 }); }
      const up = ease(seg(t, L(66, 6.2), L(66, 7.4))); person(1460, 900, lerp(180, 230, up), 'i1kid', { col: mixCol('#E6E6EE', '#F6EFE3', up) });
    } else {                                                        // L67–L68: the ZIP4 door, broken; the baby; zinc slips in by side paths; the child grows
      villi(t, 'i1v', 760);
      const D = [960, 680], broken = t > L(67, 3.9), sidepath = t > L(68, 6.0);
      if (!broken) door(D[0], D[1], 1.6, 'zip', .3, 'i1zip');
      else { boilSeed('i1brk'); push(); translate(D[0] + 40, D[1] - 90); rotate(.6 + .03 * Math.sin(t * 3)); paint(rrPts(-20, 0, 40, 180, 14), { wash: '#3FA79E', ink: PAL.ink, sw: 1 }); pop(); paint(rrPts(D[0] - 60, D[1] - 90, 40, 180, 14), { wash: '#3FA79E', ink: PAL.ink, sw: 1 }); }
      boilSeed('i1rb'); for (const sd of [-1, 1]) paint(ribbon([[D[0] - 40, D[1] - 90], [D[0] - 40 + sd * 30, D[1] - 130], [D[0] - 40 + sd * 50, D[1] - 110]], 12, 6), { wash: '#C8323C', ink: PAL.ink, sw: .8 });
      if (sidepath) for (let i = 0; i < 6; i++) { const k = frac((t - L(68, 6.0)) / 1.4 + i / 6), side = i % 2 ? D[0] + 260 : D[0] - 300; zn(side + 20 * Math.sin(k * 9), lerp(420, 880, k), 14, 'i1sp' + i, { plus: 0, glow: .3 }); }
      const baby = popK(seg(t, L(67, 6.4), L(67, 7.0))), grow = ease(seg(t, L(68, 8.6), L(68, 10.4))), patch = t > L(67, 6.9) ? ease(seg(t, L(67, 6.9), L(67, 7.8))) * (1 - ease(seg(t, L(68, 6.4), L(68, 8.4)))) : 0;
      if (baby > .05) { if (grow < .5) { const s_ = 1.5 * baby * lerp(1, 1.3, grow * 2), B = [1480, 720]; boilSeed('i1bb'); paint(ellPts(B[0], B[1] - 56 * s_, 56 * s_, 48 * s_, 18), { wash: '#F6EFE3', ink: PAL.ink, sw: 1.1 }); paint(ellPts(B[0], B[1] - 150 * s_, 48 * s_, 46 * s_, 18), { wash: '#F6EFE3', ink: PAL.ink, sw: 1.1 });
          for (const sd of [-1, 1]) { paint(ellPts(B[0] + sd * 58 * s_, B[1] - 76 * s_, 18 * s_, 12 * s_, 10, 0, sd * .5), { wash: '#F6EFE3', ink: PAL.ink, sw: .9 }); paint(ellPts(B[0] + sd * 30 * s_, B[1] - 4 * s_, 20 * s_, 13 * s_, 10), { wash: '#F6EFE3', ink: PAL.ink, sw: .9 }); }
          if (patch > .02) for (const [a, b] of [[0, -128], [-58, -76], [58, -76], [-30, -4], [30, -4]]) paint(ellPts(B[0] + a * s_, B[1] + b * s_, 13 * s_ * patch, 9 * s_ * patch, 10), { wash: '#E9675F', washOp: 170, ink: null }); }
        else { const run = Math.sin(t * 9) * 8; push(); translate(1480 + 30 * Math.sin(t * 2), 760); rotate(.08 + .04 * Math.sin(t * 9)); person(0, run * .3, lerp(220, 300, (grow - .5) * 2), 'i1kid2'); pop(); } }
      if (t > L(68, .3) && t < L(68, 3.0)) paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#6E5A48', washOp: 70 * on(t, L(68, .3), L(68, 3.0), .5, .5), ink: null });
      const sp = popK(seg(t, L(68, 3.2), L(68, 3.7))); if (sp > .05 && t < L(68, 6.4)) { boilSeed('i1spn'); paint(ribbon([[400, 360], [640, 300]], 14, 10), { wash: '#C9CFD8', ink: PAL.ink, sw: 1 }); paint(ellPts(680, 290, 56 * sp, 32 * sp, 16), { wash: '#C9CFD8', ink: PAL.ink, sw: 1 }); for (let i = 0; i < 4; i++) zn(668 + i * 10, 284, 7, 'i1spz' + i, { plus: 0 }); }
    }
    camEnd();
    for (const ln of [61, 64, 65, 66, 67]) if (t > L(ln, -.6) && t < L(ln, 0)) flash(on(t, L(ln, -.6), L(ln, 0), .3, .3), '#F2E3C4');
    if (lt < .9) paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#E2C79A', washOp: 255 * (1 - ease(seg(lt, 0, .9))), ink: null });
  }

  // ================================ I2 · the chili: no zinc, no taste; zinc back, fire (L69) ================================
  function chili(x, y, s, ang, key, bite = 0) { boilSeed('ch' + key); const P = rotPts([[-60, 0], [0, -14], [60, -4], [80, 14]], x, y, ang, s); paint(ribbon(P.slice(0, 4 - Math.floor(bite * 3)), 22 * s, 4 * s), { wash: '#D9302F', ink: PAL.ink, sw: 1 }); inkLine([P[0], [P[0][0] - 20 * s, P[0][1] - 20 * s]], 4 * s, '#4F7F3E', 'ink', .3); }
  function shotI2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1.1);
    K.wash('#F4D9B8', t, { key: 'i2', blob: '#FBE9D2', n: 3 });
    boilSeed('i2stall'); paint(rectPts(-200, 720, W + 400, 80), { wash: '#B98A55', ink: PAL.ink, sw: 1.2 }); for (let i = 0; i < 8; i++) paint(rectPts(i * 280 - 100, -200, 140, 300), { wash: i % 2 ? '#C8323C' : '#FBF7EE', ink: null });
    for (let i = 0; i < 6; i++) chili(300 + i * 70, 700, .8, -.3 + .2 * i, 'i2pile' + i);
    const eat = seg(t, L(69, .5), L(69, 4.5)), fire = L(69, 8.2), P = [1040, 720];
    let o = K.act(t, [[L(69, -.5), 'calm', { lookX: -.4 }], [L(69, 1.0), 'munch'], [L(69, 3.0), 'deadpan'], [L(69, 5.0), 'confused', { lookY: -.4 }], [fire, 'scream', { take: 1.6 }], [fire + 2.6, 'deadpan']]);
    const burnK = on(t, fire, fire + 2.6, .1, .6);
    if (eat > 0 && eat < .5) o = { ...o, armF: { at: [1.0, -2.6] }, armsFront: true };
    TOON.pip(P[0], P[1], 40, { ...o, tint: 'red', tintK: burnK, key: 'i2pip' });
    if (eat < .5) { const h = TOON.hand(P[0], P[1], 40, eat > 0 ? o : { ...o, armF: [-1, 1.6] }); if (eat > 0) chili(h[0], h[1], .9, -1.2, 'i2bite', clamp(eat * 2)); }
    inset(1500, 340, 220, on(t, L(69, 5.0), L(69, 7.9), .3, .3), 'i2bud', () => {           // a taste bud renewing its cells, with zinc
      boilSeed('i2bd'); paint(ellPts(1500, 380, 120, 150, 24), { wash: '#F2B4A6', ink: PAL.ink, sw: 1.1 });
      for (let i = 0; i < 6; i++) { const k = frac((t - L(69, 5)) / 1.4 + i / 6); boilSeed('i2c' + i); paint(ellPts(1440 + i * 24, lerp(470, 280, k), 12, 30, 10), { wash: mixCol('#FBEADB', '#F2C6B4', k), ink: PAL.ink, sw: .6 }); }
      for (let i = 0; i < 3; i++) zn(1440 + i * 60, 470 - 60 * frac(t * .5 + i / 3), 10, 'i2z' + i, { plus: 0, glow: .3 });
    });
    if (t > fire) { const m = TOON.mouth(P[0], P[1], 40, o); for (let i = 0; i < 6; i++) { const k = frac((t - fire) * 2 + i / 6); if (burnK > .1) { boilSeed('i2f' + i); paint(starPts(m[0] - 60 - 300 * k, m[1] - 20 * Math.sin(i), 40 * (1 - k * .5) * burnK, .5, 6, i), { wash: i % 2 ? '#F2C14A' : '#E8542F', ink: PAL.ink, sw: .8 }); } } }
    camEnd();
    if (lt < .4) flash(1 - seg(lt, 0, .4), PAL.cream);
    streaks(seg(lt, dur - .45, dur), 'i2wp');
  }

  // ================================ J1 · too much: copper trapped; denture cream; Wilson's; metal fume fever (L70 – L77) ================================
  function gutCell(x, y, s, key, o = {}) {                          // an intestinal cell: a tall column with a brush border on top
    boilSeed('gc' + key);
    paint(rrPts(x - 90 * s, y - 220 * s, 180 * s, 440 * s, 30 * s), { wash: '#F6D9C2', ink: PAL.ink, sw: 1.2 });
    for (let i = 0; i < 9; i++) inkLine([[x - 80 * s + i * 20 * s, y - 220 * s], [x - 80 * s + i * 20 * s, y - 250 * s]], 3, '#E6A090', 'ink', 0);
    paint(ellPts(x, y + 120 * s, 50 * s, 60 * s, 16), { fill: '#D9A38A', fillOp: 80, ink: null });
  }
  function teeth(x, y, s, t, key, chatter = 1) {                   // a pair of wind-up false teeth
    boilSeed('tt' + key); const g = 10 * s * chatter * Math.abs(Math.sin(t * 16));
    for (const sd of [-1, 1]) { const yy = y + sd * (12 * s + g); paint(ellPts(x, yy, 60 * s, 24 * s, 18).filter(p => sd < 0 ? p[1] <= yy + 4 : p[1] >= yy - 4), { wash: '#E9A0A8', ink: PAL.ink, sw: 1 });
      for (let i = -3; i <= 3; i++) paint(rrPts(x + i * 15 * s - 6 * s, yy - (sd < 0 ? -2 : 14) * s, 12 * s, 12 * s, 4), { wash: '#FBF7EE', ink: PAL.ink, sw: .6 }); }
  }
  function tube(x, y, s, sq, key) { boilSeed('tb' + key); paint([[x - 120 * s, y - 34 * s * (1 - .5 * sq)], [x + 90 * s, y - 40 * s], [x + 110 * s, y - 16 * s], [x + 110 * s, y + 16 * s], [x + 90 * s, y + 40 * s], [x - 120 * s, y + 34 * s * (1 - .5 * sq)]], { wash: '#EEF3F6', ink: PAL.ink, sw: 1.1 }); paint(rectPts(x + 110 * s, y - 10 * s, 30 * s, 20 * s), { wash: '#4F8FC0', ink: PAL.ink, sw: .9 }); paint(rectPts(x - 60 * s, y - 20 * s, 90 * s, 40 * s), { wash: '#4F8FC0', ink: null }); }
  function bucket(x, y, s, key, n = 12) {                           // the copper film's wooden bucket (the liver), overflowing with copper
    boilSeed('bk' + key);
    paint([[x - 110 * s, y - 220 * s], [x + 110 * s, y - 220 * s], [x + 90 * s, y], [x - 90 * s, y]], { wash: '#B9824F', ink: PAL.ink, sw: 1.2 });
    for (const yy of [-180, -60]) inkLine([[x - 104 * s, y + yy * s], [x + 104 * s, y + yy * s]], 4, '#8C6A44', 'ink', 0);
    for (let i = 0; i < n; i++) cu(x - 80 * s + (i % 6) * 32 * s, y - 230 * s - Math.floor(i / 6) * 26 * s + 6 * Math.sin(T * 3 + i), 15 * s, 0, key + 'c' + i, 0, 0);
  }
  function welder(x, y, u, o) { const hd = TOON.head(x, y, u, o); boilSeed('wd'); paint(rrPts(hd[0] - 2.0 * u * (o.flip ? -1 : 1) - 1.6 * u, hd[1] + 1.2 * u, 3.2 * u, 2.6 * u, .5 * u), { wash: '#4E5A66', ink: PAL.ink, sw: 1 }); paint(rectPts(hd[0] - 1.1 * u, hd[1] + 1.9 * u, 2.2 * u, .6 * u), { wash: '#2A3A55', ink: null }); }
  function thermo(x, y, s, k, key) { boilSeed('th' + key); paint(rrPts(x - 14 * s, y - 180 * s, 28 * s, 180 * s, 14 * s), { wash: '#FBF7EE', ink: PAL.ink, sw: 1 }); paint(ellPts(x, y + 10 * s, 26 * s, 26 * s, 14), { wash: '#C8323C', ink: PAL.ink, sw: 1 }); paint(rectPts(x - 6 * s, y - 160 * s * k, 12 * s, 160 * s * k), { wash: '#C8323C', ink: null }); }
  function shotJ1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
    if (t < L(72, -.3)) {                                          // L70–L71: Pip gulps zinc pills; the gut cell fills with sponges; one grabs copper; the cell is shed
      cyto(t, 'j1', .15);
      const gulp = L(70, .3), fz = L(70, 2.8), shedK = ease(seg(t, L(71, 2.3), L(71, 5.0)));
      const GC = [960, lerp(560, 1500, shedK * shedK)];
      if (t > L(70, 4.0)) {
        gutCell(GC[0], GC[1], 1.4, 'j1gc');
        const ns = Math.floor(5 * ease(seg(t, L(70, 4.7), L(70, 7.8))));
        for (let i = 0; i < ns; i++) sponge(GC[0] - 60 + (i % 2) * 120, GC[1] - 170 + i * 70, .42, 'j1sp' + i, 3);
        const grab = ease(seg(t, L(70, 8.6), L(70, 10.4))), cp = [lerp(GC[0] + 400, GC[0] + 60, grab), lerp(GC[1] - 300, GC[1] + 110, grab)];
        cu(cp[0], cp[1], 22, 0, 'j1cu', 0, 1);
        if (grab > .9) { boilSeed('j1sq'); inkLine(ellPts(cp[0], cp[1], 34 - 4 * Math.sin(t * 10), 34 - 4 * Math.sin(t * 10), 16).concat([ellPts(cp[0], cp[1], 34, 34, 16)[0]]), 6, '#F2D46A', 'ink', .3); }
      }
      const gauge = 1 - ease(seg(t, L(71, 7.0), L(71, 8.0)));
      if (t > L(71, 6.6)) { boilSeed('j1gg'); paint(ellPts(1560, 360, 120, 120, 24).filter(p => p[1] <= 362), { wash: '#FFFDF6', ink: PAL.ink, sw: 1.2 }); const a = Math.PI + Math.PI * .8 * gauge; inkLine([[1560, 360], [1560 + Math.cos(a) * 100, 360 + Math.sin(a) * 100]], 4, PAL.ink, 'ink', 0); cu(1560, 300, 18, 0, 'j1gcu', 0, 0); }
      let o = K.act(t, [[L(70, -.5), 'scheme', { lookX: .5 }], [gulp + .4, 'munch'], [fz, 'deadpan'], [L(70, 4.6), 'worried', { lookX: .8 }], [L(71, 7.4), 'mortified']]);
      if (t > L(70, -.6) && t < gulp) o = { ...o, armF: [.8, 3] };
      if (t > gulp && t < gulp + .6) o = { ...o, armF: { at: [.8, -2.6] }, armsFront: true };
      const px = t < L(70, 4.0) ? 960 : 360;
      TOON.pip(px, 880, t < L(70, 4.0) ? 44 : 32, { ...o, cheeks: t > gulp + .4 && t < fz + 1.2 ? .8 : 0, key: 'j1pip' });
      if (t > L(70, -.6) && t < gulp + .2) { const h = TOON.hand(px, 880, 44, o); for (let i = 0; i < 7; i++) { boilSeed('j1pl' + i); paint(ellPts(h[0] + (i - 3) * 15, h[1] - 10 - 9 * (i % 2), 14, 9, 10, 0, .3 * (i - 3)), { wash: '#EEF2F6', ink: PAL.ink, sw: .8 }); zn(h[0] + (i - 3) * 15, h[1] - 10 - 9 * (i % 2), 4, 'j1plz' + i, { plus: 0 }); } }
    } else if (t < L(74, -.3)) {                                   // L72: the denture-cream patients; the tube splats Pip. L73: Wilson's: zinc builds the door that holds copper back
      K.wash('#E9EEF2', t, { key: 'j1d', blob: '#F4F7F9', n: 3 });
      if (t < L(73, -.3)) {
        for (let i = 0; i < 3; i++) { const k = popK(seg(t, L(72, 1.0) + i * .3, L(72, 1.5) + i * .3)); if (k < .05) continue; const x = 300 + i * 200 + 40 * Math.sin(t * 2 + i), wob_ = .12 * Math.sin(t * 3 + i * 2);
          push(); translate(x, 900); rotate(wob_); person(0, 0, 300 * k, 'j1pt' + i); pop();
          if (t > L(72, 3.4)) for (let j = 0; j < 4; j++) { const a = hash(i * 9 + j + Math.floor(t * 8)) * TAU; boilSeed('j1tg' + i + j); paint(starPts(x + [-50, 50, -20, 20][j] + Math.cos(a) * 10, [700, 700, 890, 890][j], 8, .4, 4), { wash: '#F2C14A', ink: null }); } }
        teeth(1100, 520, 1.6, t, 'j1tt', t > L(72, 6.0) ? 1 : .3);
        const sqz = L(72, 7.6), sq = seg(t, sqz - .5, sqz);
        tube(1500, 640, 1.3, sq, 'j1tb');
        let o = K.act(t, [[L(72, -.3), 'calm', { lookX: -.6 }], [L(72, 6.6), 'scheme', { lookX: -.6 }], [sqz, 'deadpan']]);
        if (t > L(72, 6.6) && t < sqz) o = { ...o, flip: true, armF: { to: [-(1680 - 1560), -(880 - 640)] }, armB: { to: [-(1680 - 1450), -(880 - 650)] } };
        TOON.pip(1680, 880, 34, { ...o, flip: true, key: 'j1pip2' });
        if (t > sqz) { const g = TOON.geo(1680, 880, 34, { flip: true }); for (let i = 0; i < 7; i++) { const k = seg(t, sqz, sqz + .25 + i * .03); boilSeed('j1spl' + i); paint(ellPts(lerp(1660, g.mid[0] - 40 + (hash(i) - .5) * 120, k), lerp(640, g.mid[1] - 40 + (hash(i + 3) - .5) * 140, k), 22 + 14 * hash(i + 5), 18 + 10 * hash(i), 12, 3), { wash: '#FBF7EE', ink: PAL.ink, sw: .8 }); } }
      } else {
        bucket(560, 860, 1.4 * popK(seg(t, L(73, 1.2), L(73, 1.8))), 'j1bk');
        for (let i = 0; i < 4; i++) { const k = frac((t - L(73, 1.8)) / 1.2 + i / 4); if (t > L(73, 1.8)) cu(560 - 120 + 240 * hash(i), lerp(520, 860, easeIn(k)), 16, 0, 'j1ov' + i, 0, 0); }
        villi(t, 'j1v', 960);
        const wall = Math.floor(10 * ease(seg(t, L(73, 4.2), L(73, 7.6))));
        for (let i = 0; i < wall; i++) zn(1220 + (i % 5) * 46, 900 - Math.floor(i / 5) * 46 - 300, 22, 'j1zw' + i, { plus: 0 });
        for (let i = 0; i < 3; i++) { const k = frac((t - L(73)) / 1.6 + i / 3), x = lerp(1720, 1470, k); cu(t > L(73, 6.0) ? Math.max(x, 1480) : x, 560 + 40 * i, 18, 0, 'j1cb' + i, 0, 0); }
        const o = K.act(t, [[L(73, -.3), 'calm', { lookX: -.6 }], [L(73, 5.8), 'happy', { lookX: .6 }]]);
        K.swim(960, 640, 32, t, { ...o }, 'j1pip3');
      }
    } else if (t < L(76, -.3)) {                                   // L74–L75: welding galvanised pipe; white smoke; fever chills; seven days, a hammock, Monday again
      K.wash('#C9CFD8', t, { key: 'j1w', blob: '#DCE1E8', n: 3 });
      paint(rectPts(-400, 860, W + 800, 500), { wash: '#8E96A3', ink: null });
      boilSeed('j1pipe'); paint(rrPts(380, 760, 700, 70, 30), { wash: '#B9C4CF', ink: PAL.ink, sw: 1.2 }); for (let i = 0; i < 6; i++) paint(ellPts(450 + i * 110, 790, 30, 18, 10, 0, i), { wash: '#D2DAE2', ink: null });
      const weld = t > L(74, 1.2) && t < L(74, 5.4);
      if (weld) { glow(900, 760, 120, '#FFF2C8', .7); for (let i = 0; i < 6; i++) { const k = frac(t * 3 + i / 6); spark(900 + 120 * Math.cos(i * 1.1) * k, 760 - 80 * k + 60 * k * k, 7 * (1 - k), 'j1ws' + i, 1 - k); } }
      if (t > L(74, 2.2)) for (let i = 0; i < 4; i++) { const k = frac((t - L(74, 2.2)) * .3 + i / 4); puff(900 + 80 * k, 700 - 380 * k, 30 + 50 * k, .9 * (1 - k) * (t < L(76, -.8) ? 1 : 0), 'j1smk' + i, '#F4F2EE'); }
      const t75 = L(75), day = (t - L(75, 3.0)) / .4, d = Math.floor(day), weekend = d === 5 || d === 6, mon = t > L(75, 7.4);
      let amt = 0; if (t > L(74, 5.8) && t < t75) amt = 1; else if (t > L(75, 3.0) && t < L(75, 5.6)) amt = clamp(1 - d * .2, .1, 1); else if (mon) amt = 1.3;
      if (t > L(75, 3.0) && t < L(75, 7.6)) { const k = frac(day); boilSeed('j1sun'); paint(ellPts(lerp(200, 1700, k), 200 - 120 * Math.sin(k * Math.PI), 40, 40, 14), { wash: '#F2B84A', ink: PAL.ink, sw: .9 }); }
      const hm = t > L(75, 5.6) && t < L(75, 7.4);
      if (hm) { boilSeed('j1hm'); inkLine([[1200, 420], [1700, 420]], 3, '#8C6A44', 'ink', 0); inkLine(through([[1220, 430], [1450, 560], [1680, 430]]), 26, '#C8323C', 'ink', .5); }
      let o = K.act(t, [[L(74, -.3), 'calm', { lookX: .8 }], [L(74, 1.2), 'strain', { lookX: .8 }], [L(74, 5.8), 'worried'], [L(75, 5.6), 'bliss'], [L(75, 7.4), 'shock', { take: 1.2 }], [L(75, 8.4), 'worried']]);
      const ppx = hm ? 1450 : 700, ppy = hm ? 540 : 760;
      if (weld) o = { ...o, armF: [-.3, 2.8] };
      o = TOON.mix(o, amt > 0 ? TOON.shiver(t, t - .5, t + .5, { amt, face: null }) : {});
      TOON.pip(ppx, ppy, 34, { ...o, tint: 'frozen', tintK: .5 * clamp(amt), key: 'j1pip4' });
      if (t < L(74, 5.6)) welder(ppx, ppy, 34, o);
      if (t > L(74, 5.8)) thermo(1100, 820, 1.1, clamp(.3 + .6 * amt), 'j1th');
    } else if (t < L(78, -.3)) {                                   // L76: lozenges on a see-saw; a nasal spray and a scent that stops short. L77: the limit; a narrow window
      K.wash('#EEF0E8', t, { key: 'j1l', blob: '#F7F8F2', n: 3 });
      if (t < L(77, -.3)) {
        const tilt = .2 * Math.sin(t * 1.6) * on(t, L(76, .5), L(76, 4.4), .3, .3);
        balance(560, 820, 1.0, tilt, 'j1bal', (x, y) => { for (let i = 0; i < 3; i++) { boilSeed('j1lz' + i); paint(ellPts(x - 30 + i * 30, y - 14, 16, 12, 10), { wash: '#C9E4D8', ink: PAL.ink, sw: .7 }); } }, (x, y) => pipEmote('question', x, y - 30, 22, 1, 'j1q'));
        const sp = popK(seg(t, L(76, 4.4), L(76, 4.9)));
        if (sp > .05) { boilSeed('j1ns'); paint(rrPts(1180, 500, 70 * sp, 160 * sp, 14), { wash: '#EEF3F6', ink: PAL.ink, sw: 1 }); paint(rrPts(1195, 450, 40 * sp, 60 * sp, 8), { wash: '#4F8FC0', ink: PAL.ink, sw: .9 });
          person(1620, 940, 380, 'j1nose'); boilSeed('j1fl'); paint(starPts(1380, 700, 36, .5, 6), { wash: '#E8B4CF', ink: PAL.ink, sw: .8 }); inkLine([[1380, 700], [1380, 880]], 3, '#6E9F58', 'ink', 0);
          for (let i = 0; i < 3; i++) { const k = seg(t, L(76, 5.2) + i * .3, L(76, 6.8) + i * .3); boilSeed('j1sc' + i); const P = []; for (let j = 0; j <= 6; j++) { const q = j / 6 * Math.min(k, .55); P.push([1400 + 300 * q, 680 - 60 * i * .3 - 20 * Math.sin(q * 12 + t * 4)]); } if (P.length > 1 && k > 0) inkLine(P, 2, '#C98BB5', 'ink', .5); } }
      } else {
        boilSeed('j1sp2'); paint(ribbon([[300, 560], [700, 500]], 16, 12), { wash: '#C9CFD8', ink: PAL.ink, sw: 1 }); paint(ellPts(740, 494, 70, 40, 16), { wash: '#C9CFD8', ink: PAL.ink, sw: 1 }); for (let i = 0; i < 4; i++) zn(728 + i * 10, 488, 7, 'j1one' + i, { plus: 0 });
        const four = ease(seg(t, L(77, 1.2), L(77, 3.6)));
        for (let k = 0; k < 4; k++) if (four > k / 4) { boilSeed('j1heap' + k); paint(ellPts(1080 + k * 130, 520, 54, 30, 14), { wash: '#C9CFD8', ink: PAL.ink, sw: .9 }); for (let i = 0; i < 4; i++) zn(1068 + k * 130 + i * 9, 514, 6, 'j1hz' + k + i, { plus: 0 }); }
        if (four > .9) { boilSeed('j1lim'); inkLine([[1000, 420], [1620, 420]], 4, '#C8323C', 'ink', 0); }
        const win = popK(seg(t, L(77, 4.6), L(77, 5.2))); if (win > .05) { glow(960, 820, 120, '#FFF2C8', .6 * win); boilSeed('j1win'); paint(rrPts(960 - 40 * win, 680, 80 * win, 260, 8), { wash: '#FFF5D6', ink: PAL.ink, sw: 2 }); }
      }
      const o = K.act(t, [[L(76, -.3), 'calm', { lookX: -.6 }], [L(76, 6.6), 'sad', { lookX: .6 }], [L(77, .5), 'calm', { lookX: .6 }], [L(77, 5.0), 'wow', { lookX: -.3 }]]);
      K.swim(t < L(77, -.3) ? 960 : 1700, 900, 30, t, { ...o, flip: t > L(77, -.3) }, 'j1pip5');
    }
    camEnd();
    for (const ln of [71, 72, 73, 74, 76, 77]) if (t > L(ln, -.6) && t < L(ln, 0)) flash(on(t, L(ln, -.6), L(ln, 0), .3, .3), PAL.cream);
    if (lt < .45) streaks(1 - seg(lt, 0, .45), 'j1in');
    if (lt > dur - .35) flash(seg(lt, dur - .35, dur), PAL.cream);
  }

  // ================================ R2 · recap 2: the narrow window (L78; no Pip) ================================
  function shotR2(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 4 * wob(t, .04), 540 + 3 * wob(t, .03), 1);
    board(t, 'r2');
    const ic = d => popK(seg(t, L(78, d), L(78, d + .45)));
    if (ic(1.6) > .05) heightMark(300, 760, 130, 'r2hm');
    if (ic(2.4) > .05) { boilSeed('r2tg'); paint(ellPts(500, 640, 70 * ic(2.4), 40 * ic(2.4), 16).filter(p => p[1] >= 630), { wash: '#E9A0A8', ink: PAL.ink, sw: 1 }); }
    if (ic(3.2) > .05) { boilSeed('r2sc'); paint(ribbon([[620, 520], [800, 460]], 60 * ic(3.2), 50 * ic(3.2)), { wash: '#F3D6C4', ink: PAL.ink, sw: 1 }); inkLine([[680, 500], [750, 480]], 5, '#C46A5A', 'ink', .2); }
    if (ic(5.3) > .05) { sponge(1300, 520, .7 * ic(5.3), 'r2sp', 2); cu(1300, 520, 18 * ic(5.3), 0, 'r2cu', 0, 0); }
    if (ic(6.3) > .05) { person(1600, 860, 320 * ic(6.3), 'r2ft'); for (let j = 0; j < 3; j++) { boilSeed('r2tg' + j + Math.floor(t * 8)); paint(starPts(1560 + j * 40, 870, 9, .4, 4), { wash: '#F2C14A', ink: null }); } }
    const win = popK(seg(t, L(78, 7.6), L(78, 8.2)));
    if (win > .05) { glow(960, 560, 200 * win, '#FFF2C8', .7); boilSeed('r2win'); paint(rrPts(960 - 45 * win, 340, 90 * win, 420, 10), { wash: '#FFF5D6', ink: PAL.ink, sw: 2.2 }); inkLine([[960, 340], [960, 760]], 1.4, PAL.ink, 'inkfine', 0); }
    camEnd();
    if (lt < .35) flash(1 - seg(lt, 0, .35), PAL.cream);
    if (lt > dur - .5) flash(seg(lt, dur - .5, dur), PAL.cream);
  }

  // ================================ K1 · the answer, the ball, the fireworks again, the photo (L79 – L81) ================================
  function photo(x, y, s, ang, key, t) {                            // the photo Pip finally takes: the egg's fireworks
    boilSeed('ph' + key);
    push(); translate(x, y); rotate(ang); scale(s);
    paint(rrPts(-70, -80, 140, 160, 6), { wash: '#FBF7EE', ink: PAL.ink, sw: 1.1 });
    paint(rectPts(-58, -68, 116, 112), { wash: Z.night, ink: null });
    paint(ellPts(0, -12, 26, 26, 16), { wash: Z.egg, ink: PAL.ink, sw: .7 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; paint(starPts(Math.cos(a) * 42, -12 + Math.sin(a) * 42, 6, .3, 4), { wash: Z.spark, ink: null }); }
    pop();
  }
  function shotK1(t, lt, dur) {
    K.setT(t);
    if (t < L(80, -.3)) {                                          // L79: the full shell, calm; the grid, one in ten
      camBegin(960 + 6 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
      spangle(t, 'k1');
      if (t < L(79, 3.2)) { zn(960, 520, 90, 'k1zn', { glow: .3 }); shell(960, 520, 160, t, 'k1sh'); }
      else for (let i = 0; i < 100; i++) { const p = GRID(i, 960, 520, 150, 92), k = seg(t, L(79, 3.2) + i * .012, L(79, 3.6) + i * .012); protein(p[0], p[1], .7 * popK(k), 'k1g' + i, { zn: LIT(i) ? seg(t, L(79, 5.6) + Math.floor(i / 10) * .25, L(79, 6.0) + Math.floor(i / 10) * .25) : 0, glow: .4 }); }
      camEnd();
    } else if (t < L(81, -.2)) {                                   // L80: three quick vignettes: the tent pole, the pulled water, the synapse spark
      camBegin(960, 540, 1);
      board(t, 'k1b', '#F2EEF6');
      const v = t < L(80, 1.1) ? 0 : t < L(80, 2.2) ? 1 : 2;
      if (v === 0) { boilSeed('k1tn'); paint([[660, 760], [960, 360], [1260, 760]], { wash: '#B8D8C8', ink: PAL.ink, sw: 1.2, curv: .2 }); inkLine([[960, 760], [960, 360]], 3, Z.znDk, 'ink', 0); zn(960, 360, 34, 'k1tz'); }
      else if (v === 1) { zn(860, 540, 70, 'k1zw'); const k = seg(t, L(80, 1.2), L(80, 2.0)); if (k < .6) water(1000, 540, 2.2, 'k1w'); else hydroxide(1000, 540, 2.2, 'k1oh'); if (k > .5) proton(1000 + 200 * (k - .5), 470 - 300 * (k - .5), 1.5, 'k1hp'); }
      else { boilSeed('k1syn'); paint(ellPts(960, 360, 300, 170, 28), { wash: '#C9B8E8', ink: PAL.ink, sw: 1.2 }); paint(ellPts(960, 960, 420, 260, 28), { wash: '#B8D8C8', ink: PAL.ink, sw: 1.2 }); for (let i = 0; i < 10; i++) { const k = frac((t - L(80, 2.2)) / 1.2 + i / 10); spark(960 + (i - 4.5) * 40 * k, 540 + 120 * k, 12 * (1 - k), 'k1sp' + i, 1 - k); } }
      if (t > L(80, 3.4)) ['shield', 'clamp', 'tug'].forEach((kd, i) => icon(kd, 560 + 400 * i, 880, 1.1, seg(t, L(80, 3.4) + i * .25, L(80, 3.8) + i * .25), 'k1i', t));
      camEnd();
      for (const d of [1.1, 2.2]) if (t > L(80, d - .15) && t < L(80, d + .15)) flash(on(t, L(80, d - .15), L(80, d + .15), .15, .15), PAL.cream);
    } else {                                                        // L81: the ball on the paddle → the egg; this time Pip is ready; the photo; a last spark on its nose; wink, wave
      const mc = L(81, 2.6), flashT = L(81, 6.2), nose = L(81, 7.3);
      const c = t < mc ? [960, 540, 1.1] : kf(t, [[mc, [1300, 470, 3.2]], [mc + 1.0, [960, 560, 1.0]]], ease);
      camBegin(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      if (t < mc) {
        hall(t, 'k1h');
        const bounce = Math.abs(Math.sin((t - L(81)) * 4.2)), P = [900, 880];
        let o = K.act(t, [[L(81, -.3), 'happy', { lookX: .5, lookY: -.6 }], [L(81, 1.2), 'smug', { lookY: -.8 }]]);
        o = { ...o, armF: [.3 + .2 * bounce, 2.9] };
        TOON.pip(P[0], P[1], 38, { ...o, key: 'k1pip0' });
        const h = TOON.hand(P[0], P[1], 38, o), pc = paddle(h[0], h[1], 1.4, -1.0, 'k1pd');
        const by = pc[1] - 40 - 260 * bounce, bk = ease(seg(t, mc - .6, mc));
        ball(lerp(pc[0], 1300, bk), lerp(by, 470, bk), 26, 'k1ball');
      } else {
        darkField(t, 'k1n', mixCol(Z.night, '#3A2E5E', .3));
        const E = [1300, 470];
        glow(E[0], E[1], 600, '#FFB98A', .35);
        egg(E[0], E[1], 230, t, 'k1egg');
        for (let i = 0; i < 4; i++) { const t0 = flashT - .6 + i * 1.6; burst(E[0], E[1], 230, seg(t, t0, t0 + 3.0), 40, 'k1b' + i, { reach: 1.1 }); }
        // Pip, ready this time: goggles, back from the egg, a long shutter cable to the camera on a tripod
        const P = [470, 860];
        let o = K.act(t, [[mc, 'smug', { lookX: .9 }], [flashT - .7, 'eek', { lookX: .9 }], [flashT + .3, 'excited', { lookX: .3 }], [flashT + 1.0, 'laugh'], [nose + .1, 'deadpan'], [nose + 1.0, 'wink'], [nose + 1.8, 'wave']]);
        const holding = t > flashT + .4 && t < nose + 1.8;
        if (holding) o = { ...o, armF: { at: [1.9, -3.2] }, armsFront: true };
        if (t > flashT - .7 && t < flashT + .1) o = { ...o, armB: { at: [-1.3, -2.4] } };
        TOON.pip(P[0], P[1], 36, { ...o, tint: 'soot', tintK: on(t, nose, nose + 1.6, .05, .5), key: 'k1pip' });
        const hd = TOON.head(P[0], P[1], 36, o); boilSeed('k1gog'); for (const sd of [-1, 1]) paint(ellPts(hd[0] + 26 + sd * 24, hd[1] + 64, 18, 16, 12), { wash: '#BFE3F2', washOp: 200, ink: PAL.ink, sw: 1.6 });
        boilSeed('k1tri'); for (const sd of [-1, 0, 1]) inkLine([[860, 760], [860 + sd * 60, 900]], 3, PAL.ink, 'ink', 0);
        camera(860, 740, 1.1, 0, 'k1cam', { lit: t > flashT && t < flashT + .2 ? 1 : 0 });
        const hb = TOON.hand(P[0], P[1], 36, o, 'B'); boilSeed('k1cab'); inkLine(through([hb, [650, 900], [780, 880], [830, 760]]), 2, PAL.ink, 'ink', .5);
        const out = ease(seg(t, flashT + .1, flashT + .6));
        if (out > 0 && !holding) photo(lerp(860, 900, out), lerp(740, 800, out), .7 * out, .2, 'k1ph', t);
        if (holding) { const h = TOON.hand(P[0], P[1], 36, o); photo(h[0] + 10, h[1] - 30, .8, -.1, 'k1ph', t); }
        if (t > nose - .5 && t < nose + .3) { const k = seg(t, nose - .5, nose), m = TOON.mouth(P[0], P[1], 36, o); spark(lerp(E[0] - 260, m[0] + 20, ease(k)), lerp(E[1], m[1] - 10, ease(k)), 12, 'k1last', 1); }
        if (t > nose && t < nose + .5) puff(...TOON.mouth(P[0], P[1], 36, o), 40, 1 - seg(t, nose, nose + .5), 'k1sp', '#5F5860');
      }
      camEnd();
      if (t > flashT && t < flashT + .35) flash(.8 * (1 - seg(t, flashT, flashT + .35)), '#FFFBEA');
      if (t > mc - .15 && t < mc + .25) flash(on(t, mc - .15, mc + .25, .15, .2), PAL.cream);
      const ir = seg(lt, dur - 5.4, dur - .3);                     // iris out on Pip and the photo
      if (ir > 0) iris(560, 640, lerp(1500, 0, easeIn(ir)), PAL.ink);
    }
    if (lt < .35) flash(1 - seg(lt, 0, .35), PAL.cream);
  }

  // ---------- not built yet: a plain ground and a note of which line we're on ----------
  function todo(t, lt, dur) { K.setT(t); camBegin(960, 540, 1); K.wash('#E9E3D6', t, { key: 'todo' }); K.swim(960, 760, 30, t, { ...pipFeel('confused', t) }, 'todo'); camEnd(); }

  shots([[0, shotA1], [L(3, -.9), shotA2], [L(6, -.9), shotB1], [L(11, -.9), shotC1], [L(19, -.9), shotD1], [L(26, -.5), shotD2], [L(30, -.9), shotE1], [L(35, -.7), shotE2], [L(40, -.9), shotF1], [L(45, -.85), shotR1], [L(47, -.9), shotG1], [L(55, -.9), shotH1], [L(60, -.9), shotI1], [L(69, -.9), shotI2], [L(70, -.9), shotJ1], [L(78, -.9), shotR2], [L(79, -.9), shotK1]]);
})();

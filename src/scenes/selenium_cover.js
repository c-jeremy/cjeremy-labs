// selenium_cover.js: the covers for "Pip讲身体里的硒" (the film's own scene isn't in this repo yet; move LOOPS.cover and
// LOOPS.cover43 into src/scenes/selenium.js when it lands). The cold open: Pip ate a whole bowl of Brazil nuts, its leaf
// fell off and its breath smells of garlic. House cover rules: one big subject, under 10 characters, 10% margins, the
// bottom 20% kept clear of text for Bilibili's play counts. cover = 16:9; cover43 is composed for the centre 1440 × 1080
// and cropped to 4:3 (crop=1440:1080:240:0).
(() => {
  const K = MK;
  const Z = {
    sky: '#F4D77A', skyBlob: '#F9E6A8', ray: '#F8E39C',
    nut: '#A8693F', nutDk: '#6E3B20', meat: '#F3E2C4',
    bowl: '#C98A52', bowlDk: '#8E5530', bowlIn: '#E2B07A', bowlInDk: '#A86C3E',
    breath: '#DDE8A2', breathDk: '#A9BB5E', red: '#E8524A'
  };

  // Pip with its leaf gone: the shared pip() untouched, its leaf calls swapped for a broken stub while it draws
  function baldPip(x, y, u, o) {
    const P = window.paint, I = window.inkLine;
    window.inkLine = (pts, sw, col, br, curv) => {
      if (col !== PIPC.leafDk) return I(pts, sw, col, br, curv);
      if (br !== 'ink') return;                                    // the vein
      const [a, , c] = pts, d = Math.hypot(c[0] - a[0], c[1] - a[1]), e = [a[0] + (c[0] - a[0]) / d * .55 * u, a[1] + (c[1] - a[1]) / d * .55 * u];
      P(ribbon([a, e], .2 * u, .17 * u), { wash: PIPC.leafDk, ink: PAL.ink, sw: sw * .7 });
      P([[e[0] - .1 * u, e[1] + .02 * u], [e[0] - .04 * u, e[1] - .1 * u], [e[0] + .02 * u, e[1] - .02 * u], [e[0] + .1 * u, e[1] - .12 * u], [e[0] + .09 * u, e[1] + .03 * u]],
        { wash: PIPC.leaf, ink: PAL.ink, sw: sw * .5 });            // the torn end
    };
    window.paint = (pts, po) => { if (!(po && po.wash === PIPC.leaf && po.fill === PIPC.leafDk)) P(pts, po); };
    try { pip(x, y, u, o); } finally { window.paint = P; window.inkLine = I; }
  }
  // the fallen leaf (Pip's leaf shape, on its own): base at (x, y), pointing along ang
  function leaf(x, y, u, ang, key) {
    boilSeed('lf' + key);
    const L = 1.5 * u, Wd = .55 * u, lp = [];
    for (let i = 0; i <= 8; i++) { const k = i / 8; lp.push([k * L, -Math.sin(k * Math.PI) * Wd * (1 - .25 * k)]); }
    for (let i = 7; i >= 1; i--) { const k = i / 8; lp.push([k * L, Math.sin(k * Math.PI) * Wd * (1 - .25 * k)]); }
    const rot = P => P.map(([a, b]) => [x + a * Math.cos(ang) - b * Math.sin(ang), y + a * Math.sin(ang) + b * Math.cos(ang)]);
    inkLine(rot([[-.4 * u, .04 * u], [-.2 * u, 0], [0, 0]]), 2.4, PIPC.leafDk, 'ink', .5);
    paint(rot(lp), { wash: PIPC.leaf, fill: PIPC.leafDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 2.6, curv: .4 });
    inkLine(rot([[.1 * u, 0], [L * .55, -.03 * u], [L * .85, 0]]), 1.6, PIPC.leafDk, 'inkfine', .5);
  }
  // a shelled Brazil nut: a long curved wedge, brown skin rubbed off to cream along the ridge
  function nut(x, y, len, ang, key) {
    boilSeed('nut' + key);
    const top = [], bot = [], n = 10;
    for (let i = 0; i <= n; i++) { const k = i / n, w = len * .27 * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.12)), .6) * (1 - .4 * k);
      top.push([(k - .5) * len, -w - len * .05 * Math.sin(k * Math.PI)]); bot.push([(k - .5) * len, w * .5 - len * .05 * Math.sin(k * Math.PI)]); }
    const rot = P => P.map(([a, b]) => [x + a * Math.cos(ang) - b * Math.sin(ang), y + a * Math.sin(ang) + b * Math.cos(ang)]);
    paint(rot([...top, ...bot.reverse()]), { wash: Z.nut, fill: Z.nutDk, fillOp: 70, tex: .5, ink: PAL.ink, sw: 2, curv: .4 });
    paint(rot(ribbon([[-len * .28, -len * .17], [-len * .05, -len * .22], [len * .15, -len * .17]], len * .07, len * .02)), { wash: Z.meat, ink: null });
    for (const d of [-.08, .04]) inkLine(rot([[-len * .4, len * (d + .03)], [0, len * (d - .04)], [len * .38, len * (d * .5)]]), 1.6, Z.nutDk, 'inkfine', .5);
  }
  // the empty bowl: rim ellipse, the dark inside, one nut left in it and one fallen out
  function bowl(cx, cy, w, key) {
    boilSeed('bw' + key);
    const rh = w * .16, body = [];
    for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI; body.push([cx + Math.cos(a) * w / 2, cy + Math.sin(a) * w * .42]); }
    paint(ellPts(cx + 20, cy + w * .44, w * .5, w * .07, 20), { fill: '#3B2F3A', fillOp: 60, bleed: .15, tex: .3, ink: null });
    paint(body, { wash: Z.bowl, fill: Z.bowlDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 2.4 });
    inkLine([[cx - w * .36, cy + w * .2], [cx, cy + w * .26], [cx + w * .36, cy + w * .2]], 1.6, Z.bowlDk, 'inkfine', .5);
    paint(ellPts(cx, cy, w / 2, rh, 28), { wash: Z.bowl, ink: PAL.ink, sw: 2.4 });
    paint(ellPts(cx, cy + rh * .12, w * .44, rh * .78, 28), { wash: Z.bowlIn, fill: Z.bowlInDk, fillOp: 60, tex: .4, ink: null });
    paint(ellPts(cx, cy - rh * .35, w * .42, rh * .32, 20), { fill: Z.bowlInDk, fillOp: 90, bleed: .2, tex: .3, ink: null });
    nut(cx + w * .06, cy + rh * .2, w * .4, -.15, key + 'a');
    nut(cx - w * .7, cy + w * .34, w * .42, .3, key + 'b');
  }
  // garlic breath: puffs that grow as they drift away from the mouth, with wavy stink lines
  function breath(x0, y0, x1, y1, s, t, key) {
    for (let i = 0; i < 4; i++) {
      const k = i / 3, x = lerp(x0, x1, k), y = lerp(y0, y1, k) - 30 * Math.sin(k * Math.PI), r = s * lerp(.22, 1, k);
      boilSeed('br' + key + i);
      const P = []; for (let j = 0; j < 7; j++) { const a = j / 7 * TAU; P.push([x + Math.cos(a) * r * .62, y + Math.sin(a) * r * .5]); }
      P.forEach(([px, py], j) => paint(ellPts(px, py, r * .42, r * .38, 14, 2), { wash: Z.breath, ink: null }));
      paint(ellPts(x, y, r * .75, r * .62, 18, 2), { wash: Z.breath, fill: Z.breathDk, fillOp: 40, tex: .4, ink: null });
    }
    for (let i = 0; i < 3; i++) { boilSeed('st' + key + i);
      const bx = lerp(x0, x1, .45 + i * .22), by = lerp(y0, y1, .45 + i * .22) - s * 1.0, P = [];
      for (let j = 0; j <= 12; j++) P.push([bx + 14 * Math.sin(j * .9 + i), by - j * s * .07]);
      inkLine(P, 4, Z.breathDk, 'ink', .5); }
  }

  const COVER_FONT = '"HanziPen SC", "Wawati SC", "PingFang SC", sans-serif';
  const measure = (txt, size) => { const c = (measure.c ||= document.createElement('canvas').getContext('2d')); c.font = `bold ${size}px ${COVER_FONT}`; return c.measureText(txt).width; };
  function coverText(x, y, size, parts) {                         // one line of mixed colours, left-aligned at x, centred on y
    let cx = x;
    for (const [txt, col, k = 1] of parts) { const sz = size * k, w = measure(txt, sz);
      letter(txt, cx, y, sz, col, { screen: true, align: 'left', font: `bold ${sz}px ${COVER_FONT}`, stroke: PAL.ink }); cx += w + size * .02; }
  }
  function coverArt(t, o) {
    const [px, py] = o.pip, u = o.u, head = [px, py - 4.4 * u];
    K.wash(Z.sky, t, { key: 'cv', blob: Z.skyBlob });
    for (let i = 0; i < 14; i++) { boilSeed('ray' + i); const a = i / 14 * TAU, r0 = 120, r1 = 1800, w = .09;
      paint([[head[0] + Math.cos(a - w) * r0, head[1] + Math.sin(a - w) * r0], [head[0] + Math.cos(a - w) * r1, head[1] + Math.sin(a - w) * r1],
        [head[0] + Math.cos(a + w) * r1, head[1] + Math.sin(a + w) * r1], [head[0] + Math.cos(a + w) * r0, head[1] + Math.sin(a + w) * r0]], { wash: Z.ray, ink: null }); }
    bowl(o.bowl[0], o.bowl[1], o.bowl[2], 'cv');
    // the leaf, drifting off; snap ticks where it broke
    const stub = [px + .1 * u, py - 5.35 * u], [lx, ly] = o.leaf;
    for (const a of [-2.3, -1.6, -.9]) { boilSeed('pop' + a);                // a snap where the leaf came off
      inkLine([[stub[0] + Math.cos(a) * .32 * u, stub[1] - .2 * u + Math.sin(a) * .32 * u], [stub[0] + Math.cos(a) * .52 * u, stub[1] - .2 * u + Math.sin(a) * .52 * u]], 3.4, PAL.ink, 'ink', 0); }
    leaf(lx, ly, o.lu, o.lang, 'cv');
    baldPip(px, py, u, { face: 'wow', lookX: 1, lookY: -.75, armF: [.7, 1.9], armB: [.9, 1.6], sq: -.04, blush: .9,
      flip: true, noShadow: true, weight: 1.3, key: 'cvpip' });
    breath(px - .5 * u, py - 2.6 * u, o.breath[0], o.breath[1], o.breath[2], t, 'cv');
    flushLetters();
  }
  LOOPS.cover = t => {
    coverArt(t, { pip: [1500, 1600], u: 250, leaf: [1250, 185], lu: 105, lang: -2.5, bowl: [470, 790, 380], breath: [960, 840, 140] });
    coverText(190, 250, 190, [['一颗', '#C9874F'], ['就够', PAL.cream]]);
    coverText(190, 470, 156, [['千万别', PAL.cream], ['吃多', Z.red, 1.15], ['!!', PAL.cream]]);
  };
  LOOPS.cover.len = 2;
  LOOPS.cover43 = t => {                                          // crop x 240..1680 afterwards
    coverArt(t, { pip: [1420, 1570], u: 232, leaf: [1210, 180], lu: 92, lang: -2.5, bowl: [600, 810, 300], breath: [990, 910, 115] });
    coverText(240 + 120, 245, 160, [['一颗', '#C9874F'], ['就够', PAL.cream]]);
    coverText(240 + 120, 435, 132, [['千万别', PAL.cream], ['吃多', Z.red, 1.15], ['!!', PAL.cream]]);
  };
  LOOPS.cover43.len = 2;
})();

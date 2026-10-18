// xenocortex.js: "Pip讲"人脑"小鼠", 311 s. Kaganovsky, Pașca et al., Nature 2026: mice engineered so most of the cortex
// never forms (an Esco2 knockout in pallial cells, on an immunodeficient background) get a human cortical organoid
// shortly after birth; it grows ×4.7 to fill ~92% of the cortex, wires into the thalamus, brainstem and spinal cord,
// fires in sync, grows von Economo-like neurons, and serves as a disease model. See STORYBOARD_XENOCORTEX.md.
// Props from mrna_kit.js (MK). Every time is tied to a voice line: L(i, d) = line i's start + d seconds.
(() => {
  const K = MK;
  const Z = {
    hum: '#DC7FA0', humDk: '#A9506F', humLt: '#F2B8CB', slate: '#93A5BB', slateDk: '#62778F', slateLt: '#C3CEDB',
    vessel: '#C4483F', teal: '#4FB3A6', tealLt: '#9FDCD2', gold: '#F0B43C', goldLt: '#FBE3A6',
    mouse: '#F1EAE4', mouseDk: '#CDBFB6', pink: '#EBA2A8', rat: '#B5A595', ratDk: '#8C7B6B',
    sand: '#F3DFC0', sandBlob: '#FBEEDA', wall: '#C98F5E', wallTop: '#E4B07C',
    board: '#E4DEF0', boardBlob: '#F3EFF9', mint: '#CFE6DA', mintBlob: '#E7F3EC',
    peach: '#F8DCC8', peachBlob: '#FCEDE2', bench: '#D9B08C', recap: '#F5EEDD', recapBlob: '#FBF6EA',
    night: '#1C2244', nightBlob: '#2E3768', xray: '#2A3354', xrayBlob: '#3A4670', plum: '#2B1E3D', plumBlob: '#43305A',
    mauve: '#DCCFDD', mauveBlob: '#EEE6EE', grey: '#DCE0E6', greyBlob: '#EEF0F3', gold2: '#F7D9A0', gold2Blob: '#FCEFD3',
    guard: '#DCE7F5', guardDk: '#9FB4D3', glass: '#E8F2F4', pea: '#8DBF5E', peaDk: '#5E8C3E', interneuron: '#5B8FD6'
  };
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));
  const pulseK = (t, a, len = .7) => t > a && t < a + len ? Math.sin(seg(t, a, a + len) * Math.PI) : 0;
  const rotPts = (P, x, y, a, s = 1) => { const c = Math.cos(a), si = Math.sin(a); return P.map(([u, v]) => [x + (u * c - v * si) * s, y + (u * si + v * c) * s]); };
  const rotEll = (x, y, rx, ry, n, rot) => rotPts(ellPts(0, 0, rx, ry, n), x, y, rot);
  const scalePts = (P, cx, cy, s) => P.map(([x, y]) => [cx + x * s, cy + y * s]);
  const shrinkTo = (P, sx, sy, k) => P.map(([x, y]) => [sx + (x - sx) * k, sy + (y - sy) * k]);

  // ---------- generic marks ----------
  function dashPoly(P, k, col, key, w = 2.2, dash = 22) {      // a dashed outline along a closed polyline (k = how much is drawn)
    if (k <= .02) return; boilSeed('dp' + key);
    const Q = P.concat([P[0]]), seglen = []; let tot = 0;
    for (let i = 1; i < Q.length; i++) { const l = Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]); seglen.push(l); tot += l; }
    const at = d => { let i = 0; while (i < seglen.length - 1 && d > seglen[i]) { d -= seglen[i]; i++; } const f = clamp(d / seglen[i]); return [lerp(Q[i][0], Q[i + 1][0], f), lerp(Q[i][1], Q[i + 1][1], f)]; };
    for (let d = 0; d < tot * k; d += dash * 1.8) inkLine([at(d), at(Math.min(d + dash, tot * k)), at(Math.min(d + dash, tot * k))], w, col, 'ink', 0);
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
  function host(x, y, u, t, keys, extra = {}, key = 'ph') {      // Pip the host, swimming in place
    const o = { ...K.act(t, keys), ...extra };
    return { yb: K.swim(x, y, u, t, o, key), o };
  }
  function bg(col, blob, t, key, n = 6) { K.wash(col, t, { key, blob, n }); }

  // ---------- the brain, side view (sagittal), nose right. Local units: about 900 wide, origin mid-brain ----------
  const SB = {
    sil: [[446, 30], [430, -16], [372, -52], [318, -62], [300, -112], [230, -172], [110, -212], [-40, -220], [-180, -197], [-282, -142], [-326, -78], [-410, -54],
      [-462, 18], [-450, 96], [-392, 138], [-300, 150], [-200, 162], [-80, 148], [40, 116], [160, 104], [262, 86], [344, 66], [406, 58]],
    cortex: [[322, -52], [300, -112], [230, -172], [110, -212], [-40, -220], [-180, -197], [-282, -142], [-322, -62],
      [-252, -42], [-170, -92], [-60, -122], [60, -127], [172, -112], [262, -78]],
    hippo: [[-254, -30], [-172, -80], [-82, -102], [-18, -90], [-58, -64], [-150, -48], [-232, -6]],
    bulb: [392, 4, 64, 40, .32], striatum: [172, -42, 86, 50], thal: [12, -22, 86, 52], mid: [-132, 8, 70, 46], cbl: [-372, 42, 96, 86],
    stem: [[-60, 62], [-200, 108], [-330, 130], [-440, 122]], cord: [[-440, 122], [-600, 128], [-760, 132], [-940, 136]]
  };
  const SEED = [20, -168];
  const sbPts = (P, cx, cy, s) => scalePts(P, cx, cy, s);
  // o: human (0..1, the rose flood), cortex (0..1 how present the host cortex is), empty (0..1 dashed outline), ghost (pale
  // full cortex), hiSub (teal on thalamus + brainstem), cord (spinal cord length 0..1), patch {x, y, rx, ry} (a rose patch
  // in local units), dark (night palette), key
  function brainSide(cx, cy, s, t, o = {}) {
    const key = o.key || 'bs', sw = clamp(1.1 * Math.sqrt(s), .7, 1.6), dk = o.dark ? .55 : 0;
    const hostC = mixCol(Z.slate, Z.night, dk), hostD = mixCol(Z.slateDk, Z.night, dk), sub = mixCol(Z.slateLt, Z.night, dk);
    const tealK = o.hiSub || 0, subC = mixCol(sub, Z.teal, tealK);
    const at = (x, y) => [cx + x * s, cy + y * s];
    boilSeed(key + 'cord');
    const cordN = o.cord ?? 1;
    if (cordN > .02) { const C = SB.cord.slice(0, 1 + Math.ceil(cordN * 3)).map(p => at(...p)); paint(ribbon(through(C, 5), 50 * s, 40 * s), { wash: subC, ink: PAL.ink, sw }); }
    boilSeed(key + 'sil');
    paint(sbPts(SB.sil, cx, cy, s), { wash: mixCol(sub, PAL.cream, .3), ink: PAL.ink, sw, curv: .45 });
    if (tealK > .01) paint(ribbon(through(SB.stem.map(p => at(...p)), 5), 70 * s, 48 * s), { wash: Z.teal, washOp: 200 * tealK, ink: null });
    boilSeed(key + 'cbl');
    paint(ellPts(...at(SB.cbl[0], SB.cbl[1]), SB.cbl[2] * s, SB.cbl[3] * s, 26), { wash: mixCol(sub, Z.slate, .3), ink: PAL.ink, sw });
    for (let i = 0; i < 4; i++) { const P = []; for (let j = 0; j <= 6; j++) { const a = -2.6 + j * .36; P.push(at(SB.cbl[0] + Math.cos(a) * (30 + i * 16), SB.cbl[1] + 26 + Math.sin(a) * (26 + i * 15))); } inkLine(P, sw * .6, mixCol(Z.slateDk, PAL.ink, .3), 'inkfine', .5); }
    boilSeed(key + 'mid');
    paint(ellPts(...at(SB.mid[0], SB.mid[1]), SB.mid[2] * s, SB.mid[3] * s, 20), { wash: mixCol(sub, Z.teal, tealK * .6), ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(...at(SB.thal[0], SB.thal[1]), SB.thal[2] * s, SB.thal[3] * s, 24), { wash: subC, ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(...at(SB.striatum[0], SB.striatum[1]), SB.striatum[2] * s, SB.striatum[3] * s, 22), { wash: mixCol(sub, PAL.cream, .25), ink: PAL.ink, sw: sw * .8 });
    boilSeed(key + 'blb');
    paint(rotEll(...at(SB.bulb[0], SB.bulb[1]), SB.bulb[2] * s, SB.bulb[3] * s, 18, SB.bulb[4]), { wash: mixCol(hostC, PAL.cream, .2), ink: PAL.ink, sw });
    const CX = sbPts(SB.cortex, cx, cy, s), HX = sbPts(SB.hippo, cx, cy, s);
    if (o.ghost > .02) { boilSeed(key + 'gh'); paint(CX, { wash: mixCol(o.dark ? Z.night : PAL.cream, Z.slate, .35), washOp: 150 * o.ghost, ink: null, curv: .35 }); }
    const cort = o.cortex ?? 1;
    if (cort > .02) {
      boilSeed(key + 'cx');
      const P = cort < 1 ? shrinkTo(CX, cx + SEED[0] * s, cy + SEED[1] * s, .6 + .4 * cort) : CX;
      paint(HX, { wash: mixCol(hostD, Z.slate, .4), washOp: 255 * cort, ink: PAL.ink, sw: sw * cort, curv: .4 });
      paint(P, { wash: hostC, washOp: 255 * cort, fill: hostD, fillOp: 50 * cort, tex: .4, ink: PAL.ink, sw: sw * cort, curv: .35 });
      if (cort > .9) for (let i = 0; i < 3; i++) { const P2 = []; for (let j = 0; j <= 5; j++) P2.push(at(-190 + i * 150 + j * 20, -150 - 26 * Math.sin(j / 5 * Math.PI) - 14 * (i === 1))); inkLine(P2, sw * .5, mixCol(hostD, PAL.ink, .2), 'inkfine', .6); }
    }
    if (o.empty > .02) { dashPoly(CX, o.empty, mixCol(o.dark ? PAL.cream : Z.slateDk, PAL.ink, .2), key + 'ec', 2.2 * Math.sqrt(s)); dashPoly(HX, o.empty, mixCol(o.dark ? PAL.cream : Z.slateDk, PAL.ink, .2), key + 'eh', 1.8 * Math.sqrt(s), 14); }
    const hk = o.human || 0;
    if (hk > .01) {                                              // the graft: the cortex shape grown from a seed
      boilSeed(key + 'hum');
      const sx = cx + SEED[0] * s, sy = cy + SEED[1] * s, P = shrinkTo(CX, sx, sy, .955 * Math.pow(hk, .8)).map(([x, y], i) => [x + 3 * s * Math.sin(i * 2.1 + t * 1.2), y + 3 * s * Math.cos(i * 1.7 + t)]);
      paint(P, { wash: o.humCol || Z.hum, fill: Z.humDk, fillOp: 60, tex: .5, bleed: .05, ink: PAL.ink, sw, curv: .4 });
      if (hk > .4) for (let i = 0; i < 9; i++) { boilSeed(key + 'hd' + i); const q = clamp((hk - .4 - i * .03) * 4); if (q <= 0) continue;
        const [x, y] = [sx + (hash(i + 40) - .5) * 400 * s * hk, sy + (hash(i + 41) - .5) * 60 * s * hk]; paint(ellPts(x, y, 9 * s * q, 7 * s * q, 8), { wash: Z.humLt, ink: null }); }
    }
    if (o.patch) { boilSeed(key + 'pt'); const p = o.patch; const P = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; P.push(at(p.x + Math.cos(a) * p.rx * (1 + .07 * Math.sin(a * 3 + t * 2)), p.y + Math.sin(a) * p.ry * (1 + .07 * Math.cos(a * 2 + t * 1.6)))); }
      paint(P, { wash: Z.hum, fill: Z.humDk, fillOp: 60, tex: .5, ink: PAL.ink, sw, curv: .4 }); }
    auditBox('brain', key, cx - 460 * s, cy - 220 * s, cx + 450 * s, cy + 160 * s);
    return { at, CX };
  }
  // ---------- the brain from above (dorsal), nose right. Two hemispheres, bulbs, cerebellum, cord ----------
  const HEMI = Array.from({ length: 21 }, (_, i) => { const a = i / 20 * Math.PI, c = Math.cos(a); return [12 + 214 * c, -(7 + 178 * Math.pow(Math.sin(a), .75) * (1 - .2 * Math.max(0, c)))]; });
  function brainTop(cx, cy, s, t, o = {}) {
    const key = o.key || 'bt', sw = clamp(1.1 * Math.sqrt(s), .7, 1.7), at = (x, y) => [cx + x * s, cy + y * s];
    boilSeed(key + 'c');
    paint(ribbon(through([at(-300, 0), at(-480, 6), at(-700, -4)].concat(o.cordLong ? [at(-1000, 8)] : []), 4), 62 * s, 46 * s), { wash: Z.slateLt, ink: PAL.ink, sw });
    paint(ellPts(...at(-262, 0), 82 * s, 118 * s, 26), { wash: mixCol(Z.slateLt, Z.slate, .3), ink: PAL.ink, sw });
    for (let i = -2; i <= 2; i++) inkLine([at(-300, i * 34 - 10), at(-262, i * 36), at(-222, i * 34 + 10)], sw * .6, Z.slateDk, 'inkfine', .6);
    for (const sd of [-1, 1]) {
      boilSeed(key + 'b' + sd);
      paint(ellPts(...at(282, sd * 36), 56 * s, 32 * s, 16), { wash: mixCol(Z.slate, PAL.cream, .2), ink: PAL.ink, sw });
      const P = HEMI.map(([x, y]) => at(x, y * sd));
      boilSeed(key + 'h' + sd);
      paint(P, { wash: Z.slate, fill: Z.slateDk, fillOp: 50, tex: .4, ink: PAL.ink, sw, curv: .35 });
      const hk = o.human || 0;
      if (hk > .01) {
        const sx = cx + 10 * s, sy = cy - sd * 95 * s;
        const Q = shrinkTo(P, sx, sy, .95 * Math.pow(hk, .7)).map(([x, y], i) => [x + 3 * s * Math.sin(i * 2.3 + t * 1.3 + sd), y + 3 * s * Math.cos(i * 1.9 + t)]);
        paint(Q, { wash: Z.hum, fill: Z.humDk, fillOp: 55, tex: .5, ink: PAL.ink, sw, curv: .4 });
      }
    }
    auditBox('brain', key, cx - 340 * s, cy - 190 * s, cx + 340 * s, cy + 190 * s);
    return at;
  }

  // ---------- the mice ----------
  // from above, heading ang (0 = right); s ≈ 1 → body 150 px long
  function mouseTop(x, y, s, ang, t, o = {}) {
    const key = o.key || 'mt', run = o.run || 0, sn = o.sniff || 0;
    push(); translate(x, y); rotate(ang);
    boilSeed(key + 'tl');
    const T = []; for (let i = 0; i <= 8; i++) T.push([-70 * s - i * 22 * s, Math.sin(t * 6 * (run > 0 ? 1.6 : .7) - i * .7) * (4 + i * 3) * s]);
    paint(ribbon(through(T, 4), 9 * s, 2.5 * s), { wash: Z.pink, ink: PAL.ink, sw: .7 });
    const wig = run * Math.sin(t * 18) * .06;
    for (const sd of [-1, 1]) { const ph = run * Math.sin(t * 18 + (sd > 0 ? 0 : Math.PI)); paint(ellPts(30 * s + ph * 10 * s, sd * 38 * s, 10 * s, 6 * s, 8), { wash: Z.pink, ink: PAL.ink, sw: .6 }); paint(ellPts(-40 * s - ph * 10 * s, sd * 36 * s, 11 * s, 7 * s, 8), { wash: Z.pink, ink: PAL.ink, sw: .6 }); }
    boilSeed(key + 'bd');
    push(); rotate(wig);
    paint(ellPts(-10 * s, 0, 70 * s, 42 * s, 26), { wash: Z.mouse, fill: Z.mouseDk, fillOp: 60, tex: .4, ink: PAL.ink, sw: 1 });
    const hx = 62 * s + sn * 6 * s * Math.sin(t * 22), P = [[hx + 58 * s, 0], [hx + 20 * s, -26 * s], [hx - 22 * s, -32 * s], [hx - 32 * s, 0], [hx - 22 * s, 32 * s], [hx + 20 * s, 26 * s]];
    for (const sd of [-1, 1]) paint(ellPts(hx - 18 * s, sd * 34 * s, 17 * s, 15 * s, 14), { wash: Z.mouse, ink: PAL.ink, sw: .8 }), paint(ellPts(hx - 18 * s, sd * 34 * s, 10 * s, 9 * s, 10), { wash: Z.pink, ink: null });
    paint(P, { wash: Z.mouse, ink: PAL.ink, sw: 1, curv: .5 });
    if (o.glow > 0) { paint(ellPts(hx - 6 * s, 0, 30 * s, 22 * s, 16), { wash: Z.hum, washOp: 200 * clamp(o.glow), ink: null }); glow(hx - 4 * s, 0, 70 * s, Z.hum, o.glow); }
    paint(ellPts(hx + 58 * s, 0, 7 * s, 6 * s, 8), { wash: Z.pink, ink: PAL.ink, sw: .6 });
    for (const sd of [-1, 1]) { paint(ellPts(hx + 18 * s, sd * 15 * s, 4.5 * s, 4.5 * s, 8), { wash: PAL.ink, ink: null });
      for (let w = 0; w < 3; w++) inkLine([[hx + 50 * s, sd * 5 * s], [hx + 74 * s, sd * (14 + w * 9 + 3 * Math.sin(t * 20 * sn + w)) * s]], .6, PAL.ink, 'inkfine', 0); }
    pop(); pop();
  }
  // side view, facing right (flip: left); s ≈ 1 → about 230 px nose to rump; o.walk phase, o.sniff, o.xray (0..1),
  // o.ear (twitch), o.eye (sparkle), o.col/dk (a rat), o.brain(xray callback (cx, cy, s))
  function mouseSide(x, y, s, t, o = {}) {
    const key = o.key || 'ms', f = o.flip ? -1 : 1, wk = o.walk || 0, bob = o.walking ? 4 * s * Math.abs(Math.sin(wk * Math.PI)) : 0;
    const col = o.col || Z.mouse, dk = o.dk || Z.mouseDk, X = v => x + f * v * s, Y = v => y + v * s - bob;
    boilSeed(key + 'sh'); paint(ellPts(x, y + 4 * s, 110 * s, 10 * s, 16), { fill: '#000000', fillOp: 30, bleed: .2, ink: null });
    boilSeed(key + 'tl');
    const T = []; for (let i = 0; i <= 8; i++) T.push([X(-100 - i * 22), Y(-30 + i * 4 - Math.sin(t * 4 + i * .6) * (2 + i * 2))]);
    paint(ribbon(through(T, 4), 9 * s, 2.5 * s), { wash: Z.pink, ink: PAL.ink, sw: .7 });
    for (let i = 0; i < 4; i++) { const back = i < 2, ph = wk * Math.PI + (i % 2) * Math.PI + (back ? .5 : 0), lx = (back ? -60 : 48) + (i % 2) * 14 + (o.walking ? 14 * Math.sin(ph) : 0);
      boilSeed(key + 'lg' + i); paint(ellPts(X(lx), y - 3 * s - (o.walking ? Math.max(0, Math.cos(ph)) * 6 * s : 0), 14 * s, 6 * s, 10), { wash: i % 2 ? mixCol(Z.pink, PAL.ink, .12) : Z.pink, ink: PAL.ink, sw: .6 }); }
    boilSeed(key + 'bd');
    const B = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; B.push([X(-10 + Math.cos(a) * 100), Y(-56 + Math.sin(a) * 52 * (Math.sin(a) > 0 ? .9 : 1.05))]); }
    paint(B, { wash: col, fill: dk, fillOp: 60, tex: .4, ink: PAL.ink, sw: 1.1, curv: .4 });
    if (o.xray > .01) paint(B, { wash: Z.xray, washOp: 200 * o.xray, ink: null, curv: .4 });
    const sn = o.sniff ? o.sniff * Math.sin(t * 24) * 3 : 0, hx = 92 + sn, hy = -70;
    const H = [[hx + 72, hy + 18], [hx + 40, hy - 26], [hx - 6, hy - 40], [hx - 40, hy - 12], [hx - 30, hy + 30], [hx + 20, hy + 34]].map(([a, b]) => [X(a), Y(b)]);
    boilSeed(key + 'hd');
    paint(H, { wash: col, ink: PAL.ink, sw: 1.1, curv: .5 });
    if (o.xray > .01 && o.brain) { paint(H, { wash: Z.xray, washOp: 200 * o.xray, ink: null, curv: .5 }); o.brain(X(hx - 4), Y(hy + 8), .13 * s * f); }
    const ear = o.ear ? Math.sin(t * 30) * o.ear * .25 : 0;
    boilSeed(key + 'er');
    paint(rotEll(X(hx - 22), Y(hy - 44), 22 * s, 28 * s, 16, f * (-.3 + ear)), { wash: col, ink: PAL.ink, sw: 1 });
    paint(rotEll(X(hx - 22), Y(hy - 42), 13 * s, 18 * s, 12, f * (-.3 + ear)), { wash: Z.pink, ink: null });
    paint(ellPts(X(hx + 72), Y(hy + 16), 7 * s, 6 * s, 8), { wash: Z.pink, ink: PAL.ink, sw: .6 });
    if (!(o.xray > .5)) paint(ellPts(X(hx + 18), Y(hy - 6), 5.5 * s, 6 * s, 8), { wash: PAL.ink, ink: null });
    if (o.eye > 0 && o.eye < 1) K.sparkle(X(hx + 22), Y(hy - 14), 26 * s, o.eye, '#FFF7DD');
    for (let w = 0; w < 3; w++) inkLine([[X(hx + 62), Y(hy + 12)], [X(hx + 96), Y(hy + 2 + w * 10 + (o.whisk || 0) * 6 * Math.sin(t * 30 + w))]], .7, PAL.ink, 'inkfine', 0);
    if (o.chew) inkLine([[X(hx + 48), Y(hy + 30 + 3 * o.chew)], [X(hx + 62), Y(hy + 28)]], 1, PAL.ink, 'ink', 0);
    auditBox('mouse', key, Math.min(X(-120), X(170)), Y(-130), Math.max(X(-120), X(170)), y);
    return { head: [X(hx), Y(hy)] };
  }

  // ---------- A: the maze, the hook ----------
  const WALLS_H = [[550, -400, 670], [730, -400, 1450], [370, 670, 1270], [550, 850, 1450], [190, -400, 2300], [910, -400, 2300], [370, -400, 490],
    [370, 1450, 2300], [730, 1630, 2300], [550, 1630, 2050], [1090, -400, 2300]];
  const WALLS_V = [[670, 370, 550], [850, 550, 730], [1270, 370, 550], [1450, 550, 910], [1630, 370, 730], [490, 190, 370], [1090, 190, 370], [300, 730, 910],
    [1100, 730, 910], [1900, 190, 550], [2050, 730, 910], [160, 910, 1090], [900, 910, 1090], [1700, 910, 1090], [-100, 190, 550]];
  function maze(t, key, gold = 0) {
    const floor = mixCol(Z.sand, Z.gold2, gold);
    K.wash(floor, t, { key, blob: Z.sandBlob, n: 5, rect: rectPts(-600, -500, W + 1200, H + 1100) });
    boilSeed(key + 'tile');
    for (let i = -2; i < 14; i++) inkLine([[i * 180 - 90, -400], [i * 180 - 90 + 6, 1500]], .4, mixCol(floor, PAL.ink, .08), 'inkfine', 0);
    const wcol = mixCol(Z.wall, '#D79A4E', gold), wtop = mixCol(Z.wallTop, '#F3C47A', gold);
    WALLS_H.forEach(([y, x0, x1], i) => { boilSeed(key + 'wh' + i); paint(rrPts(x0 - 17, y - 17 + 8, x1 - x0 + 34, 34, 12), { wash: wcol, ink: null }); paint(rrPts(x0 - 17, y - 17, x1 - x0 + 34, 30, 12), { wash: wtop, ink: PAL.ink, sw: .9 }); });
    WALLS_V.forEach(([x, y0, y1], i) => { boilSeed(key + 'wv' + i); paint(rrPts(x - 17, y0 - 17 + 8, 34, y1 - y0 + 34, 12), { wash: wcol, ink: null }); paint(rrPts(x - 17, y0 - 17, 34, y1 - y0 + 30, 12), { wash: wtop, ink: PAL.ink, sw: .9 }); });
  }
  const PATH = [[260, 640], [760, 640], [760, 460], [1170, 460]];
  function along(P, k) {                                         // a point and heading at fraction k of a polyline, corners rounded
    const ls = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); ls.push(l); tot += l; }
    let d = k * tot, i = 0; while (i < ls.length - 1 && d > ls[i]) { d -= ls[i]; i++; }
    const f = clamp(d / ls[i]), a = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]);
    let ang = a; const R = 70;
    if (i < ls.length - 1 && ls[i] - d < R) { const a2 = Math.atan2(P[i + 2][1] - P[i + 1][1], P[i + 2][0] - P[i + 1][0]); ang = lerp(a, a + Math.atan2(Math.sin(a2 - a), Math.cos(a2 - a)), .5 * (1 - (ls[i] - d) / R)); }
    if (i > 0 && d < R) { const a0 = Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]); ang = lerp(a0 + Math.atan2(Math.sin(a - a0), Math.cos(a - a0)) * .5, a, d / R); if (Math.abs(ang - a) > Math.PI) ang = a; }
    return [lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f), ang];
  }
  function journal(x, y, s, rot, k, t, key) {                     // a journal with no words: a cover picture of a rose brain
    if (k <= .02) return;
    push(); translate(x, y); rotate(rot); scale(s * backOut(k));
    boilSeed('jn' + key);
    paint(rrPts(-150 + 10, -200 + 12, 300, 400, 10), { wash: '#000000', washOp: 60, ink: null });
    paint(rrPts(-150, -200, 300, 400, 10), { wash: '#F4EEE4', ink: PAL.ink, sw: 1.2 });
    paint(rrPts(-150, -200, 300, 70, 10), { wash: '#C7473D', ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 4; i++) inkLine([[-120, 160 - i * 0 + i * 9], [-20 - i * 18, 160 + i * 9]], 1.4, mixCol('#F4EEE4', PAL.ink, .35), 'inkfine', 0);
    pop();
    push(); translate(x, y); rotate(rot); const q = s * backOut(k);
    brainTop(0, 10 * q, .32 * q, t, { human: 1, key: 'jb' + key });
    pop();
  }
  function shotA(t, lt, dur) {
    const tFl = L(1, 9.0), xr = t >= tFl + .25;                  // the push into the head, then (under a flash) the x-ray
    const mk = kf(t, [[0, 0], [L(1, 3.4), 1]], e => e < .9 ? e / .9 * .97 : .97 + (e - .9) / .1 * .03);
    const [mx, my, ma] = along(PATH, mk);
    const run = t < L(1, 3.4) ? 1 : 0, sniff = seg(t, L(1, 3.6), L(1, 3.8)) * (1 - seg(t, L(1, 5.6), L(1, 5.8)));
    if (!xr) {
      const push0 = seg(t, L(1, 7.3), tFl), hz = ease(push0);
      const hx = mx + Math.cos(ma) * 62, hy = my + Math.sin(ma) * 62;
      const c = [lerp(kf(t, [[0, 640], [L(1, 3.4), 900]]), hx, hz), lerp(560, hy, hz), lerp(1.0, 2.7, easeIn(push0))];
      camBegin(c[0] + 8 * wob(t, .05) * (1 - hz), c[1] + 6 * wob(t, .04) * (1 - hz), c[2]);
      maze(t, 'mz');
      mouseTop(mx, my, 1, ma, t, { run, sniff, key: 'm1' });
      camEnd();
    } else {
      const c = kf(t, [[tFl, [960, 520, 1.25]], [L(1, 11.5), [960, 520, 1.12]], [L(2, 3.6), [960, 520, 1.12]], [L(2, 5.0), [760, 540, .95]], [L(2, 7.6), [820, 540, .95]]], ease);
      camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      bg(Z.xray, Z.xrayBlob, t, 'ax', 5);
      boilSeed('ghostHead');                                     // the ghost of the head and shoulders around the brain
      const G = [[1560, 520], [1470, 440], [1300, 330], [1080, 270], [860, 262], [640, 300], [420, 360], [-200, 380], [-200, 660], [420, 680], [640, 740], [860, 778], [1080, 770], [1300, 710], [1470, 600]];
      for (const sd of [-1, 1]) { boilSeed('gear' + sd); paint(ellPts(760, 520 + sd * 300, 120, 95, 24), { wash: mixCol(Z.xray, PAL.cream, .1), ink: mixCol(Z.xray, PAL.cream, .45), sw: 1.4 }); }
      boilSeed('ghostHead');
      paint(G, { wash: mixCol(Z.xray, PAL.cream, .1), ink: mixCol(Z.xray, PAL.cream, .45), sw: 1.4, curv: .5 });
      const flood = seg(t, L(1, 10.15), L(1, 11.35)), hk = easeOut(flood);
      if (hk > .05) glow(960, 520, 520 * hk, Z.hum, .55 * hk * (1 + .3 * pulse(t, 3)));
      brainTop(960, 520, 1.25, t, { human: hk, key: 'ab', cordLong: true });
      for (let i = 0; i < 14; i++) { const tw = L(2, .3) + hash(i + 70) * 3.2; const k = seg(t, tw, tw + .6); if (k > 0 && k < 1) { const sd = i % 2 ? 1 : -1; K.sparkle(960 + (hash(i + 71) - .45) * 420, 520 + sd * (60 + hash(i + 72) * 140), 24, k, '#FFE6EE'); } }
      const roots = seg(t, L(2, 3.9), L(2, 6.4));              // threads run down the spinal cord
      for (let j = 0; j < 4; j++) {
        const k = clamp(roots * 1.3 - j * .1); if (k <= .02) continue;
        const P = []; for (let i = 0; i <= 14; i++) { const f = i / 14 * k; P.push([960 - 230 * 1.25 - f * 1050, 520 + (j - 1.5) * 9 + 8 * Math.sin(f * 9 + j)]); }
        boilSeed('rt' + j); inkLine(P, 3, Z.humLt, 'ink', .5);
        glow(P[P.length - 1][0], P[P.length - 1][1], 40, Z.hum, .9 * (1 - seg(t, L(2, 9), L(2, 11))) + .3);
      }
      const jk = seg(t, L(2, 7.7), L(2, 8.2));
      journal(1510, 330, .85, -.12 + .05 * spring(t, L(2, 8.2), 6, 14), jk, t, 'a');
      camEnd();
    }
    const P = [235, 880];
    host(P[0], P[1], 31, t, [[0, 'calm', { lookX: .7 }], [L(1, 1.6), 'happy', { lookX: .6 }], [L(1, 5.0), 'calm', { lookX: .8, lookY: -.3 }], [L(1, 7.6), 'calm', { lookX: .9, lookY: -.5 }],
      [L(1, 11.9), 'wow', { take: 1.3, lookX: .6, lookY: -.4 }], [L(2, 1.0), 'excited'], [L(2, 4.0), 'wow', { lookX: -.3, lookY: .2 }], [L(2, 8.3), 'excited']], { talk: false }, 'pa');
    if (t > tFl - .05 && t < tFl + .6) flash(t < tFl + .25 ? seg(t, tFl - .05, tFl + .25) : 1 - seg(t, tFl + .25, tFl + .6), PAL.cream);
    if (lt < .8) iris(P[0], P[1] - 90, kf(lt, [[0, 0], [.15, 200], [.4, 220], [.8, 1900]], easeIn));
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B7AEDB', Z.board]);
  }

  // ---------- B: why it stands out (lavender board) ----------
  const CELLS_B = Array.from({ length: 30 }, (_, i) => { const x = -250 + hash(i + 300) * 520, top = -205 + .0016 * x * x, bot = -132 + .0011 * x * x; return [x, lerp(top + 14, bot - 10, hash(i + 301))]; });
  function shotB(t, lt, dur) {
    const c = kf(t, [[0, [980, 540, 1.0]], [L(4, 0), [980, 540, 1.0]], [L(4, 1.2), [1060, 470, 1.22]], [L(4, 10), [1060, 470, 1.22]], [L(5, 0), [980, 540, 1.0]],
      [L(6, -3.4), [990, 520, 1.03]], [L(6, -1.6), [1080, 380, 2.2]]], ease);
    camBegin(c[0] + 7 * wob(t, .05), c[1] + 5 * wob(t, .045), c[2]);
    bg(Z.board, Z.boardBlob, t, 'b');
    // rat (L3–L4) slides off as the mouse (L5) slides in
    const swap = seg(t, L(5, -.6), L(5, .4)), ratX = 1080 - 1700 * easeIn(swap), mouseX = 1080 + 1700 * (1 - easeOut(swap));
    const ratIn = seg(t, L(3, -.4), L(3, .8));
    if (swap < 1) {
      const bx = ratX + 900 * (1 - easeOut(ratIn)), s = 1.15;
      mouseSide(bx - 470, 870, .72, t, { col: Z.rat, dk: Z.ratDk, key: 'rat', walking: false });
      const seedK = seg(t, L(3, 4.3), L(3, 5.0)), grow = ease(seg(t, L(3, 7.4), L(3, 11.5)));
      const strainW = t > L(3, 9) && t < L(3, 13) ? .05 * Math.sin(t * 22) : 0;
      const squeeze = ease(seg(t, L(4, 1.4), L(4, 6.8)));
      let patch = null;
      if (seedK > 0) {
        const r = 16;
        const px = lerp(20, 228, squeeze), py = lerp(-168, -118, squeeze);
        const rx = lerp(lerp(r, 95, grow), 46, squeeze) * (1 + strainW), ry = lerp(lerp(r, 38, grow), 24, squeeze) * (1 - strainW);
        patch = seedK < 1 ? null : { x: px, y: py, rx, ry };
      }
      const B = brainSide(bx, 520, s, t, { key: 'rb', patch, cord: 0 });
      if (seedK > 0 && seedK < 1) { const p = arcPt([bx - 300, 120], B.at(...SEED), 160, easeIn(seedK)); boilSeed('seedB'); paint(ellPts(p[0], p[1], 18, 18, 14), { wash: Z.hum, ink: PAL.ink, sw: 1 }); }
      if (seedK >= 1 && t < L(3, 5.4)) K.burst(...B.at(...SEED), 40, seg(t, L(3, 5.0), L(3, 5.4)), PAL.ink, 'sb');
      // thirds: dashed dividers, one third is all it reaches
      const th = seg(t, L(3, 10.6), L(3, 11.6)) * (1 - seg(t, L(4, .5), L(4, 1.2)));
      if (th > 0) for (const xd of [-95, 105]) { boilSeed('th' + xd); const P = [B.at(xd, -214 + .0016 * xd * xd), B.at(xd, -125 + .0011 * xd * xd)]; for (let d = 0; d < 1; d += .14) inkLine([[lerp(P[0][0], P[1][0], d), lerp(P[0][1], P[1][1], d)], [lerp(P[0][0], P[1][0], d + .08), lerp(P[0][1], P[1][1], d + .08)]], 2.4 * th, Z.slateDk, 'ink', 0); }
      // the host's own cells crowd in (L4)
      const crowd = seg(t, L(4, 1.2), L(4, 3.0));
      if (crowd > 0) CELLS_B.forEach(([x, y], i) => {
        const q = backOut(clamp(crowd * 1.6 - i * .02)); if (q <= .02) return;
        const p = B.at(x, y), dxp = patch ? (x - patch.x) : 99, dyp = patch ? (y - patch.y) : 99, inPatch = patch && (dxp * dxp) / (patch.rx * patch.rx) + (dyp * dyp) / (patch.ry * patch.ry) < 1.4;
        if (inPatch) return;
        const bulge = 1 + .14 * pulse(t + i * .07, 3) + .1 * squeeze;
        boilSeed('cb' + i); paint(ellPts(p[0], p[1], 15 * s * q * bulge, 13 * s * q * bulge, 12), { wash: Z.slateLt, ink: PAL.ink, sw: .7 });
      });
      const feed = seg(t, L(4, 6.4), L(4, 9.9));                 // nutrients go to the host's cells, not the patch
      if (feed > 0) for (let i = 0; i < 7; i++) { const f = frac(feed * 2.2 + i / 7); const tgt = CELLS_B[(i * 4) % CELLS_B.length]; const p0 = B.at(12, -20), p1 = B.at(tgt[0], tgt[1]);
        boilSeed('fd' + i); const p = [lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f) - 30 * Math.sin(f * Math.PI)]; paint(ellPts(p[0], p[1], 7, 7, 8), { wash: Z.vessel, washOp: 255 * Math.sin(f * Math.PI), ink: null }); }
      if (squeeze > .2 && patch) for (let i = 0; i < 3; i++) arrow(...B.at(patch.x - 140 + i * 6, patch.y - 40 + i * 40), ...B.at(patch.x - 70, patch.y - 10 + i * 18), seg(t, L(4, 2 + i * .4), L(4, 2.6 + i * .4)) * (1 - seg(t, L(4, 9.6), L(4, 10.2))), Z.slateDk, 'pa' + i, 9);
    }
    if (swap > 0) {
      mouseSide(mouseX - 470, 860, .5, t, { key: 'mb' });
      const sweep = seg(t, L(5, 5.8), L(5, 7.0)), drop = seg(t, L(5, 7.8), L(5, 8.6));
      const B = brainSide(mouseX, 520, 1.15, t, { key: 'mbb', cortex: 1 - ease(sweep), empty: seg(t, L(5, 6.2), L(5, 7.4)), cord: 0,
        human: drop >= 1 ? .2 + .08 * ease(seg(t, L(5, 8.6), L(5, 10))) : 0 });
      if (sweep > 0 && sweep < 1) for (let i = 0; i < 6; i++) K.sparkle(...B.at(-200 + i * 85, -150 + 30 * Math.sin(i * 2)), 30, clamp(sweep * 1.5 - i * .08), PAL.cream);
      if (drop > 0 && drop < 1) { const p = arcPt([300, 700], B.at(...SEED), 300, easeIn(drop)); boilSeed('seedM'); paint(ellPts(p[0], p[1], 22, 22, 14), { wash: Z.hum, ink: PAL.ink, sw: 1 }); }
      if (drop >= 1 && t < L(5, 9.1)) K.burst(...B.at(...SEED), 50, seg(t, L(5, 8.6), L(5, 9.1)), PAL.ink, 'sm');
    }
    camEnd();
    const P = [215, 900], throwK = seg(t, L(5, 7.5), L(5, 7.9));
    host(P[0], P[1], 30, t, [[0, 'happy'], [L(3, 1.0), 'calm', { lookX: .8 }], [L(3, 8.0), 'strain', { lookX: .9 }], [L(3, 11.6), 'confused'], [L(4, 1.6), 'worried'], [L(4, 7.0), 'sad', { lookX: .8 }],
      [L(5, .9), 'idea', { take: 1 }], [L(5, 4.6), 'smug'], [L(5, 7.4), 'excited', throwK < 1 ? { armF: [2.4 - 3 * throwK, 2.2] } : {}], [L(5, 9.3), 'smug', { lookX: .9 }]], {}, 'pb');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B7AEDB', Z.board]);
    if (t > L(6, -2.0)) flash(seg(t, L(6, -2.0), L(6, -1.6)), PAL.cream);
  }

  // ---------- C: empty the room (mint) ----------
  const CHR = [[985, 470, .3], [1110, 590, -.5], [1190, 440, .9]];   // three X chromosomes in the progenitor cell
  // Chromosomes, copied from meiosis.js (cpt, piece, chromatid, clip, centromere, chromo) so they look the same across
  // films. A chromatid runs from its top end (f = 0) to its bottom end (f = 1) along ang, with the centromere at f = c,
  // placed at (cx, cy). o: w, bow (ends lean along +n), off (shift along +n), cond (0..1: a loose thread → a condensed
  // chromatid), bump(f) (extra shift along +n), hi (0..1 lighten). segs: [[f0, f1, col, dx, dy]].
  const CEN = '#3B3346', nrm = ang => [-Math.sin(ang), Math.cos(ang)], solid = col => [[0, 1, col]];
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
  function centromere(x, y, w, key, hi = 0) { boilSeed('cm' + key); paint(ellPts(x, y, w * .3 * (1 + .5 * hi), w * .3 * (1 + .5 * hi), 12), { wash: mixCol(CEN, Z.gold, hi), ink: null }); }
  // a chromosome: one chromatid (rep 0) or two sisters (rep 1) joined at the centromere. o: rep, sep (sisters apart),
  // bow, w, cond, segsA/segsB, hiA/hiB, bumpA/bumpB, cenHi.
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
  function softCell(x, y, r, col, dk, t, o = {}) {            // a cell with its face up-left, so the inside stays clear
    boilSeed('sc' + (o.key || ''));
    const rx = r * (1 + (o.sq || 0)), ry = r * (1 - (o.sq || 0)), P = [];
    for (let i = 0; i < 34; i++) { const a = i / 34 * TAU; P.push([x + Math.cos(a) * rx * (1 + .035 * Math.sin(a * 3 + t * 1.5)), y + Math.sin(a) * ry * (1 + .035 * Math.cos(a * 2 + t * 1.2))]); }
    paint(P, { wash: col, washOp: 255 * (o.op ?? 1), fill: dk, fillOp: 50 * (o.op ?? 1), tex: .5, bleed: .05, ink: PAL.ink, sw: clamp(r / 120, .8, 1.5) * (o.op ?? 1), curv: .3 });
    if (o.mood) K.face(x - rx * .42, y - ry * .55, r * .3, t, { mood: o.mood, lx: o.lx || 0, ly: o.ly || 0, seed: o.seed || 0 });
  }
  function toggle(x, y, s, on, key) {                          // a little switch: knob right + green = on, left + grey = off
    boilSeed('tg' + key);
    paint(rrPts(x - 46 * s, y - 20 * s, 92 * s, 40 * s, 20 * s), { wash: mixCol('#9C9C9C', '#7CC07A', on), ink: PAL.ink, sw: 1 });
    paint(ellPts(x + lerp(-24, 24, on) * s, y, 17 * s, 17 * s, 14), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
  }
  function shotC(t, lt, dur) {
    const tMap = L(7, 6.4), tMouse = L(8, -.6), tDoor = L(9, -.6);
    const ph = t < tMap ? 1 : t < tMouse ? 2 : t < tDoor ? 3 : 4;
    if (ph === 1) {
      const c = kf(t, [[0, [1000, 540, 1.0]], [L(6, 7.2), [1000, 540, 1.0]], [L(6, 8.2), [1090, 515, 1.45]], [L(7, 1.4), [1090, 515, 1.45]], [L(7, 2.4), [1060, 530, 1.05]]], ease);
      camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      bg(Z.mint, Z.mintBlob, t, 'c1');
      const wilt = seg(t, L(7, 4.2), L(7, 5.2)), gone = seg(t, L(7, 5.0), L(7, 6.0));
      const cellCol = mixCol('#BFE3CF', '#BDBFB8', wilt), mood = t < L(7, 1.8) ? 'calm' : t < L(7, 4.0) ? 'wow' : 'sad';
      if (gone < 1) softCell(1080, 520 + 30 * ease(wilt), 270 * (1 - .35 * ease(gone)), cellCol, mixCol('#8FC4A8', '#9A9C95', wilt), t, { key: 'pc', mood: gone < .5 ? mood : null, sq: .1 * ease(wilt), op: 1 - gone, lx: .5, ly: .3 });
      if (gone > 0 && gone < 1) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; K.sparkle(1080 + Math.cos(a) * 260 * (.6 + .5 * gone), 540 + Math.sin(a) * 200 * (.6 + .5 * gone), 22, clamp(gone * 1.3 - hash(i) * .3), '#E9E4D2'); }
      const sp = seg(t, L(7, 1.5), L(7, 2.1)) * (1 - gone);     // spindle poles + fibres
      if (sp > .02) for (const px of [850, 1320]) { boilSeed('pole' + px); paint(starPts(px, 520, 22 * sp, .4, 6), { wash: Z.gold, ink: PAL.ink, sw: .8 }); CHR.forEach(([x, y]) => inkLine([[px, 520], [lerp(px, x, sp), lerp(520, y, sp)]], 1, mixCol('#8FC4A8', PAL.ink, .3), 'inkfine', 0)); }
      const melt = seg(t, L(7, 0), L(7, 1.4)), fly = seg(t, L(7, 2.0), L(7, 3.6));
      const CP = { L: 150, c: .4 }, CW = 24, CC = ['#C98A4B', '#7E6BB5', '#5FA3C9'];
      CHR.forEach(([x, y, a], i) => {
        // two sisters held at the centromere; the glue melts, they slide apart, then scatter as the cell wilts
        const sep = 22 * ease(melt), k = easeOut(fly), yw = 30 * ease(wilt), key = 'xc' + i;
        if (gone < .6 && k <= 0) chromo(x, y + yw, a, CP, { rep: 1, sep, segsA: solid(CC[i]), w: CW }, key);
        else if (gone < .6) {
          const n = nrm(a), gap = CW * .47 + sep, bw = CW * .55;
          for (const sd of [1, -1]) {
            let tx = x + (hash(i * 7 + sd + 3) - .5) * 420, ty = y + (hash(i * 7 + sd + 5) - .5) * 300;
            const dc = Math.hypot(tx - 1080, ty - 520), rc = 150;                 // scatter, but stay inside the cell
            if (dc > rc) { tx = 1080 + (tx - 1080) * rc / dc; ty = 520 + (ty - 520) * rc / dc; }
            const px = lerp(x + n[0] * gap * sd, tx, k), py = lerp(y + n[1] * gap * sd, ty, k) + yw, ang = a + k * (hash(i + sd * 11 + 20) - .5) * 4;
            chromatid(px, py, ang, CP, solid(CC[i]), { w: CW, bow: sd * bw * (1 - .6 * k) }, key + (sd > 0 ? 'a' : 'b'));
            centromere(px, py, CW, key + sd);
          }
        }
        const gk = 1 - melt;                                    // the cohesin "glue" ring at the centromere
        if (gk > .02) { boilSeed('glue' + i); paint(ellPts(x, y, 30, 15, 16, 0, a + 1.57), { wash: Z.gold, washOp: 230 * gk, ink: PAL.ink, sw: .8 * gk }); }
        const g0 = L(6, 8.2 + i * .35); if (t > g0 && t < g0 + .8) K.sparkle(x + 18, y - 22, 26, seg(t, g0, g0 + .8), '#FFF4C8');
        if (melt > 0 && melt < 1) for (let d = 0; d < 2; d++) { boilSeed('drip' + i + d); paint(ellPts(x - 8 + d * 16, y + 14 + 60 * melt * (1 + d * .4), 5, 7, 8), { wash: Z.gold, washOp: 255 * (1 - melt), ink: null }); }
      });
      camEnd();
      const bk = seg(t, L(6, 4.8), L(6, 5.3)) * (1 - seg(t, L(6, 12.0), L(6, 12.5)));   // the gene and its switch
      cloud(1520, 210, 290, 120, bk, [1260, 400], 'g');
      if (bk > .7) {
        const off = seg(t, L(6, 6.3), L(6, 6.6)), cols = ['#9BC7A6', '#C3A6D6', Z.gold, '#A6C4E0', '#E6B49A'];
        const hl = pulseK(t, L(6, 5.4), .8); if (hl > 0) { boilSeed('ghl'); paint(rrPts(1472, 157, 100, 46, 14), { wash: Z.gold, washOp: 120 * hl, ink: null }); }
        boilSeed('gst');
        for (let i = 0; i < 5; i++) paint(rrPts(1300 + i * 88, 165, 84, 30, 10), { wash: i === 2 ? mixCol(Z.gold, '#A9A9A9', off) : cols[i], ink: PAL.ink, sw: .9 });
        toggle(1520, 248, 1, 1 - off, 'g');
        if (off > 0) K.burst(1520, 248, 50, seg(t, L(6, 6.6), L(6, 7.0)), PAL.ink, 'tg');
      }
    } else if (ph === 2) {
      const c = kf(t, [[tMap, [1000, 520, 1.12]], [L(7, 10.0), [1000, 520, 1.05]]], ease);
      camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      bg(Z.mint, Z.mintBlob, t, 'c2');
      const gh = seg(t, L(7, 10.2), L(7, 11.0));
      brainSide(1110, 600, 1.15, t, { key: 'cmap', cortex: 0, empty: seg(t, tMap + .2, tMap + 1.4), ghost: gh, cord: 0 });
      camEnd();
    } else if (ph === 3) {
      const tx = L(8, 6.6), c = kf(t, [[tMouse, [960, 560, 1.0]], [tx, [960, 560, 1.0]], [tx + 1.2, [1040, 700, 1.45]]], ease);
      camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      bg(Z.mint, Z.mintBlob, t, 'c3');
      boilSeed('gnd'); paint(rectPts(-800, 830, W + 1600, 900), { wash: '#B8D8C4', ink: null }); inkLine([[-800, 832], [W + 800, 836]], 1.2, PAL.ink, 'ink', 0);
      const wk = seg(t, tMouse, L(8, 2.6)), mx = lerp(-300, 1020, ease(wk)), walking = wk > 0 && wk < 1;
      const xr = seg(t, tx + .4, tx + 1.0), teal = seg(t, L(8, 9.2), L(8, 10.0));
      mouseSide(mx, 830, 1.7, t, { key: 'mc', walking, walk: mx / 60, eye: seg(t, L(8, 2.8), L(8, 3.5)), ear: near(t, L(8, 4.2), .35), sniff: near(t, L(8, 5.0), .4), whisk: near(t, L(8, 5.0), .4), xray: xr,
        brain: (bx, by, bs) => { const B = brainSide(bx, by, bs, t, { key: 'cx', cortex: 0, empty: 1, cord: .9 * xr, hiSub: teal, dark: true });
          if (teal > 0) { glow(...B.at(12, -22), 34, Z.teal, teal * (.8 + .3 * pulse(t, 3))); glow(...B.at(-200, 108), 28, Z.teal, teal * .8); } } });
      camEnd();
    } else {
      const c = kf(t, [[tDoor, [960, 540, 1.0]], [L(9, 5), [930, 520, 1.03]]], ease);
      camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
      bg(Z.mint, Z.mintBlob, t, 'c4');
      boilSeed('arch');                                         // the arched door into the empty room
      const arch = (R, y0) => { const A = [[1100 - R, 900]]; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; A.push([1100 + Math.cos(a) * R, y0 + Math.sin(a) * R]); } A.push([1100 + R, 900]); return A; };
      paint(arch(290, 560), { wash: '#9DBFAE', ink: PAL.ink, sw: 1.2, curv: .2 });
      paint(arch(220, 580), { wash: '#4E6E66', ink: PAL.ink, sw: 1.2, curv: .2 });
      const yawn = t > L(9, 2.3) && t < L(9, 3.0), asleep = t >= L(9, 3.0), sl = ease(seg(t, L(9, 2.9), L(9, 3.6)));
      [[760, 770, 1], [1440, 770, -1]].forEach(([x, y, d], i) => {
        const r = 92, yy = y + 18 * sl + (asleep ? 4 * Math.sin(t * 1.6 + i) : 0);
        boilSeed('gd' + i);
        for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + .2; paint(ellPts(x + Math.cos(a) * r * 1.02, yy + Math.sin(a) * r * .98, 11, 8, 8, 0, a), { wash: Z.guardDk, ink: PAL.ink, sw: .6 }); }
        K.cell(x, yy, r, Z.guard, Z.guardDk, t, { key: 'gc' + i, mood: yawn ? 'wow' : asleep ? 'sleepy' : 'determined', lx: d * .6, sq: .08 * sl, seed: i });
        if (asleep) pipEmote('zzz', x + d * 70, yy - 120, 30, d, 'gz' + i);
      });
      const ck = seg(t, L(9, 4.8), L(9, 5.3)) * (1 - seg(t, L(9, 9.6), L(9, 10.2)));   // otherwise: awake guards bump a rose cell away
      cloud(520, 290, 280, 150, ck, [300, 620], 'gd');
      if (ck > .7) {
        const v = seg(t, L(9, 5.6), L(9, 7.0)), hit = seg(t, L(9, 7.0), L(9, 8.2));
        const rx = hit > 0 ? lerp(482, 340, easeOut(hit)) : lerp(340, 482, ease(v)), ry = 300 - (hit > 0 ? 70 * Math.sin(hit * Math.PI) : 0);
        K.cell(rx, ry, 52, Z.hum, Z.humDk, t, { key: 'tr', mood: hit > 0 ? 'wow' : 'happy', nucleus: false, sq: hit > 0 ? .1 * spring(t, L(9, 7.0), 6, 20) : 0 });
        K.cell(600, 300, 64, Z.guard, Z.guardDk, t, { key: 'tg', mood: 'angry', lx: -1, nucleus: false });
        if (hit > 0 && hit < .4) K.burst(538, 300, 50, hit / .4, PAL.ink, 'hb');
      }
      camEnd();
    }
    host(210, 900, 30, t, [[0, 'calm', { lookX: .8 }], [L(6, 4.9), 'calm', { armsFront: true, armF: { at: [.15, -2.35] }, lookX: .7, lookY: -.3 }], [L(6, 7.6), 'wow', { lookX: .9 }],
      [L(7, 3.8), 'worried'], [L(7, 5.2), 'sad', { lookX: .8 }], [L(7, 10.6), 'wow', { take: 1 }], [L(8, 0), 'calm', { lookX: .9 }], [L(8, 3.0), 'happy'], [L(8, 9.6), 'idea'],
      [L(9, 0), 'calm', { lookX: .9 }], [L(9, 3.2), 'smug', { lookX: .9 }], [L(9, 5.0), 'worried', { lookX: .3, lookY: -.7 }], [L(9, 8.6), 'happy']], {}, 'pc');
    if (lt < .5) flash(1 - seg(lt, 0, .5), PAL.cream);
    if (t > tMap - .3 && t < tMap + .4) flash(t < tMap ? seg(t, tMap - .3, tMap) : 1 - seg(t, tMap, tMap + .4), PAL.cream);
    if (t > tMouse - .3 && t < tMouse + .3) brushWipe((t - (tMouse - .3)) / .6, ['#9FCDB5', Z.mint]);
    if (t > tDoor - .3 && t < tDoor + .3) brushWipe((t - (tDoor - .3)) / .6, ['#9FCDB5', Z.mint]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#EDB596', Z.peach]);
  }

  // ---------- D1: the dish (peach bench) ----------
  const STEM = Array.from({ length: 16 }, (_, i) => [760 + hash(i + 500) * 640, 655 + (hash(i + 501) - .5) * 60]);
  function rosettes(x, y, r, t, key, core = 0) {               // an organoid in section: neural rosettes round little lumens
    boilSeed('org' + key);
    const P = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; P.push([x + Math.cos(a) * r * (1 + .06 * Math.sin(a * 5 + 1)), y + Math.sin(a) * r * (1 + .06 * Math.cos(a * 4))]); }
    paint(P, { wash: Z.hum, fill: Z.humDk, fillOp: 55, tex: .5, ink: PAL.ink, sw: clamp(r / 90, .5, 1.2), curv: .4 });
    if (r > 30) [[-.35, -.25], [.38, -.1], [-.05, .4]].forEach(([dx, dy]) => {
      const cx = x + dx * r, cy = y + dy * r, rr = r * .26;
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; paint(ellPts(cx + Math.cos(a) * rr * .75, cy + Math.sin(a) * rr * .75, rr * .32, rr * .13, 8, 0, a), { wash: Z.humLt, ink: null }); }
      paint(ellPts(cx, cy, rr * .25, rr * .25, 10), { wash: mixCol(Z.humDk, PAL.ink, .2), ink: null });
    });
    if (core > .02) { boilSeed('core' + key); paint(ellPts(x, y, r * .62 * core, r * .55 * core, 22, 3), { wash: '#8A7A70', fill: '#5F524A', fillOp: 80, tex: .6, bleed: .15, ink: null }); }
  }
  function dish(x, y, rx, key) {
    boilSeed('dish' + key);
    paint(ellPts(x, y + 70, rx + 12, 66, 40), { fill: '#000000', fillOp: 30, bleed: .2, ink: null });
    const wall = [[x - rx, y]]; for (let i = 0; i <= 20; i++) { const a = Math.PI - i / 20 * Math.PI; wall.push([x + Math.cos(a) * rx, y + 50 + Math.sin(a) * 60]); } wall.push([x + rx, y]);
    paint(wall, { wash: Z.glass, ink: PAL.ink, sw: 1.1, curv: .2 });
    paint(ellPts(x, y, rx, 60, 40), { wash: '#F6D4D8', ink: PAL.ink, sw: 1.1 });
    paint(ellPts(x, y, rx - 22, 46, 40), { wash: '#F2C3CB', ink: null });
  }
  function shotD1(t, lt, dur) {
    const c = kf(t, [[0, [980, 560, 1.0]], [L(10, 8.4), [1000, 590, 1.05]], [L(10, 9.6), [1100, 640, 2.6]], [L(11, 0), [1100, 640, 2.6]], [L(11, .8), [1090, 630, 1.9]]], ease);
    const whip = seg(lt, dur - .4, dur);
    camBegin(c[0] + 6 * wob(t, .05) + 1600 * easeIn(whip), c[1] + 5 * wob(t, .04), c[2]);
    bg(Z.peach, Z.peachBlob, t, 'd1');
    boilSeed('bench'); paint(rectPts(-1200, 790, W + 2800, 900), { wash: Z.bench, ink: null }); inkLine([[-1200, 792], [W + 1600, 796]], 1.2, PAL.ink, 'ink', 0);
    const dx = 1080 + 900 * (1 - easeOut(seg(t, L(10, .3), L(10, 1.2))));
    dish(dx, 650, 420, 'a');
    const gather = ease(seg(t, L(10, 2.9), L(10, 6.4)));
    const ox = dx, oy = 640, grow = ease(seg(t, L(11, .6), L(11, 3.0))), stall = spring(t, L(11, 3.0), 5, 16);
    if (gather < 1) STEM.forEach(([x, y], i) => {
      const a = i / STEM.length * TAU, tx = ox + Math.cos(a) * 16 * (i % 3), ty = oy + Math.sin(a) * 11 * (i % 3);
      const px = lerp(x + (dx - 1080) + 14 * wob(t, .3, i * .2), tx, gather), py = lerp(y + 6 * wob(t, .25, i * .3), ty, gather);
      boilSeed('stm' + i); paint(ellPts(px, py, 16, 14, 12), { wash: '#F7E6EA', ink: PAL.ink, sw: .8 }); paint(ellPts(px - 2, py + 1, 6, 5, 8), { wash: '#C9A3B4', ink: null });
    });
    else {
      const r = lerp(40, 62, grow) * (1 + .05 * stall) * backOut(seg(t, L(10, 6.4), L(10, 6.8)));
      if (r > 2) rosettes(ox, oy - 4, r, t, 'd', ease(seg(t, L(11, 5.6), L(11, 8.4))));   // r is 0 on the pop's first frame: a zero-size shape crashes p5.brush
      const pk = seg(t, L(10, 6.9), L(10, 7.5)) * (1 - seg(t, L(11, .2), L(11, .7)));   // a pea, for scale
      if (pk > 0) { boilSeed('pea'); const px = lerp(1700, ox + 110, easeOut(pk)); paint(ellPts(px, oy - 2, 40, 38, 18), { wash: Z.pea, fill: Z.peaDk, fillOp: 60, tex: .4, ink: PAL.ink, sw: .9 }); paint(ellPts(px - 12, oy - 16, 10, 7, 8), { wash: '#C9E59E', ink: null }); }
      if (t > L(11, 3.2) && t < L(11, 9)) K.cross(ox + 105, oy - 85, 40, seg(t, L(11, 3.4), L(11, 4.0)), 'nov');
    }
    camEnd();
    if (whip > 0) for (let i = 0; i < 9; i++) { boilSeed('sl' + i); const y = 120 + i * 105 + 20 * hash(i), x = W * (1 - whip) - 400 * hash(i + 3); inkLine([[x, y], [x + 500 + 300 * hash(i + 4), y]], 3, '#FFF3E8', 'ink', 0); }
    host(215, 880, 31, t, [[0, 'happy'], [L(10, .4), 'excited'], [L(10, 3.2), 'calm', { lookX: .9 }], [L(10, 7.0), 'laugh', { lookX: .9 }], [L(10, 9.6), 'wow', { lookX: .9, lookY: -.3 }],
      [L(11, .8), 'strain'], [L(11, 3.6), 'confused'], [L(11, 6.0), 'worried']], {}, 'pd');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#EDB596', Z.peach]);
  }

  // ---------- D2: the transplant and the growth (mint) ----------
  function pupIcon(x, y, s, col, key) {
    boilSeed('pi' + key);
    for (const sd of [-1, 1]) paint(ellPts(x + sd * 15 * s, y - 15 * s, 10 * s, 10 * s, 10), { wash: col, ink: PAL.ink, sw: .7 });
    paint(ellPts(x, y, 20 * s, 17 * s, 14), { wash: col, ink: PAL.ink, sw: .8 });
    for (const sd of [-1, 1]) paint(ellPts(x + sd * 6 * s, y - 2 * s, 2.2 * s, 2.2 * s, 6), { wash: PAL.ink, ink: null });
  }
  function moon(x, y, r, k, key) {                              // a waxing moon: k = 0 new → 1 full
    boilSeed('mn' + key);
    paint(ellPts(x, y, r, r, 24), { wash: '#4A5378', ink: PAL.ink, sw: .9 });
    const P = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    for (let i = 16; i >= 0; i--) { const a = -Math.PI / 2 + i / 16 * Math.PI; P.push([x + Math.cos(a) * r * (1 - 2 * k), y + Math.sin(a) * r]); }
    if (k > .02) paint(P, { wash: '#F8E7A8', ink: null });
  }
  function pie(x, y, r, k, key) {
    boilSeed('pie' + key);
    paint(ellPts(x, y, r, r, 30), { wash: Z.slate, ink: PAL.ink, sw: 1.1 });
    if (k > .01) { const P = [[x, y]]; for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + i / 30 * TAU * k; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } paint(P, { wash: Z.hum, ink: PAL.ink, sw: 1 }); }
  }
  const VESSELS = [-210, -110, -10, 90, 190].map((x, j) => { const bot = -125 + .0011 * x * x, top = -205 + .0016 * x * x; return [[x, bot + 30], [x + 10 * Math.sin(j * 2), lerp(bot, top, .4)], [x - 14 + 28 * hash(j + 60), lerp(bot, top, .85)]]; });
  function shotD2(t, lt, dur) {
    const c = kf(t, [[0, [960, 540, 1.0]], [L(13, 4), [960, 540, 1.0]], [L(13, 6), [1000, 520, 1.06]]], ease);
    const win = 1 - seg(lt, 0, .4);
    camBegin(c[0] + 6 * wob(t, .05) - 1600 * easeIn(win), c[1] + 5 * wob(t, .04), c[2]);
    bg(Z.mint, Z.mintBlob, t, 'd2');
    const bx = 1130, by = 540, s = 1.05;
    const land = seg(t, L(12, 2.0), L(12, 3.0)), grow = ease(seg(t, L(13, 4.2), L(13, 10.0)));
    const hk = land < 1 ? 0 : .13 + .87 * grow;
    const vk = seg(t, L(12, 8.6), L(12, 11.0));
    const B = brainSide(bx, by, s, t, { key: 'd2b', cortex: 0, empty: 1 - grow * .7, cord: 0, human: hk, humCol: mixCol(Z.hum, '#EDA9C0', pulseK(t, L(13, 0), 1.2)) });
    if (vk > 0) VESSELS.forEach((V, j) => {                    // red vessels branch into the graft
      const k = clamp(vk * 1.4 - j * .12); if (k <= .02) return;
      const P = through(V.map(([x, y]) => B.at(x, y)), 5), n = Math.max(2, Math.round(P.length * k));
      boilSeed('vs' + j); inkLine(P.slice(0, n), 3.2, Z.vessel, 'ink', .5);
      if (k > .6) { const m = P[Math.floor(P.length * .55)], br = clamp((k - .6) / .4); for (const sd of [-1, 1]) inkLine([m, [m[0] + sd * 34 * br, m[1] - 30 * br]], 2, Z.vessel, 'ink', .3); }
      const ox = seg(t, L(12, 10.0), L(13, 3)); if (ox > 0 && ox < 1) for (let b = 0; b < 3; b++) { const f = frac(ox * 3 + b / 3 + j * .2); const q = P[Math.min(n - 1, Math.floor(f * (n - 1)))]; boilSeed('o2' + j + b); paint(ellPts(q[0], q[1], 7, 7, 8), { wash: PAL.cream, ink: Z.vessel, sw: .8 }); }
    });
    const pupK = 1 - seg(t, L(12, 4.6), L(12, 5.2));          // the newborn pup, with a dashed line to its brain
    if (pupK > .02) { push(); translate(420, 860); scale(pupK); mouseSide(0, 0, .7, t, { key: 'pup', col: '#F6D2CE', dk: '#E2AFA9' }); pop();
      const q = B.at(-150, 150); dashPoly([[500, 780], [q[0], q[1]], [q[0], q[1]]], pupK * seg(t, L(12, .2), L(12, 1.0)) * .5, Z.slateDk, 'pupl', 1.6, 14); }
    if (land > 0 && land < 1) { const p = arcPt([420, 140], B.at(...SEED), 260, easeIn(land)); rosettes(p[0], p[1], 26, t, 'fl'); }
    if (land >= 1 && t < L(12, 3.5)) K.burst(...B.at(...SEED), 60, seg(t, L(12, 3.0), L(12, 3.5)), PAL.ink, 'ld');
    const rowK = seg(t, L(12, 5.0), L(12, 5.6)) * (1 - seg(t, L(13, 2.4), L(13, 3.0)));   // 29 pups, 25 take
    if (rowK > .02) for (let i = 0; i < 29; i++) { const tk = L(12, 5.8) + i * .055, ok = i !== 6 && i !== 13 && i !== 19 && i !== 26;
      const q = backOut(clamp(rowK * 1.6 - i * .02)); if (q <= .02) continue;
      pupIcon(200 + i * 56, 120, 1.05 * q * (1 + .25 * (ok ? pulseK(t, tk, .35) : 0)), ok && t > tk ? Z.hum : '#C8CDD3', 'r' + i); }
    if (rowK > .7) K.check(1840, 115, 60, seg(t, L(12, 7.6), L(12, 8.0)), 'row');
    const mk = seg(t, L(13, 2.9), L(13, 3.3)) * (1 - seg(t, L(14, -2.2), L(14, -1.6)));   // three moons, then the pie
    if (mk > .02) for (let i = 0; i < 3; i++) { const q = backOut(clamp(mk * 1.4 - i * .15)); if (q > .05) moon(1480 + i * 130, 140, 50 * q, seg(t, L(13, 3.1 + i * .3), L(13, 3.6 + i * .3)), 'm' + i); }
    const pk = seg(t, L(13, 6.0), L(13, 6.5));
    if (pk > .02) pie(1720, 790, 90 * backOut(pk), .92 * ease(seg(t, L(13, 6.4), L(13, 8.6))), 'p');
    camEnd();
    host(215, 880, 30, t, [[0, 'calm', { lookX: .8 }], [L(12, 1.0), 'happy', { lookX: .8 }], [L(12, 3.1), 'excited'], [L(12, 6.0), 'calm', { lookX: .6, lookY: -.8 }], [L(12, 8.2), 'happy', { lookX: .9 }], [L(12, 9.5), 'wow', { lookX: .9 }],
      [L(13, .5), 'laugh'], [L(13, 4.4), 'strain', { lookX: .9 }], [L(13, 8.0), 'smug'], [L(13, 9.4), 'love']], {}, 'pd2');
    if (win > 0) for (let i = 0; i < 9; i++) { boilSeed('sl2' + i); const y = 120 + i * 105 + 20 * hash(i), x = W * win * .8 - 300 * hash(i + 3); inkLine([[x, y], [x + 500 + 300 * hash(i + 4), y]], 3, '#F2FBF6', 'ink', 0); }
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E4D4AE', Z.recap]);
  }

  // ---------- R: the recap (cream board) ----------
  function shotR(t, lt, dur) {
    camBegin(980 + 6 * wob(t, .05), 540 + 5 * wob(t, .04), 1.0 + .01 * lt);
    bg(Z.recap, Z.recapBlob, t, 'r');
    const k1 = seg(t, L(14, .9), L(14, 1.4)), k2 = seg(t, L(14, 4.0), L(14, 4.5)), k3 = seg(t, L(14, 6.0), L(14, 6.5));
    const X = [470, 1010, 1550], Y = 450;
    if (k1 > .02) { push(); translate(X[0], Y); scale(1.35 * backOut(k1));
      dashPoly(scalePts(SB.cortex, 0, 120, .55), seg(t, L(14, 1.7), L(14, 2.5)), Z.slateDk, 'rh', 2.2, 14);
      toggle(0, 150, 1.3, 1 - seg(t, L(14, 1.2), L(14, 1.5)), 'r'); pop(); }
    if (k2 > .02) { push(); translate(X[1], Y); scale(1.35 * backOut(k2));
      K.cell(-50, 40, 70, Z.guard, Z.guardDk, t, { key: 'rg', mood: 'sleepy' }); pipEmote('zzz', -10, -60, 22, 1, 'rz');
      rosettes(90, 80, 38, t, 'rr'); pop(); }
    if (k3 > .02) { push(); translate(X[2], Y); scale(1.35 * backOut(k3));
      boilSeed('rv'); inkLine(through([[-140, 140], [-80, 110], [-30, 60], [10, 30]], 5), 7, Z.vessel, 'ink', .5);
      rosettes(50, 0, 40 + 50 * ease(seg(t, L(14, 6.5), L(14, 8.0))), t, 'rb'); pop(); }
    arrow(X[0] + 190, Y + 40, X[1] - 200, Y + 40, seg(t, L(14, 3.6), L(14, 4.1)), Z.goldLt, 'r1', 12);
    arrow(X[1] + 190, Y + 40, X[2] - 200, Y + 40, seg(t, L(14, 5.6), L(14, 6.1)), Z.goldLt, 'r2', 12);
    camEnd();
    host(215, 900, 30, t, [[0, 'calm', { lookX: .8 }], [L(14, 1.2), 'idea'], [L(14, 4.2), 'happy', { lookX: .9 }], [L(14, 6.6), 'smug'], [L(14, 9.0), 'calm', { lookX: .9 }]], {}, 'pr');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E4D4AE', Z.recap]);
  }

  // ---------- neurons ----------
  function neuron(x, y, s, col, key, o = {}) {                 // a pyramidal neuron: soma, apical dendrite up, basal ones, axon down
    boilSeed('nr' + key);
    const sw = clamp(1.6 * s, .6, 2.2), dk = mixCol(col, PAL.ink, .35), rot = o.rot || 0, P = (u, v) => rotPts([[u, v]], x, y, rot, s)[0];
    inkLine([P(0, -14), P(3, -60), P(-2, -110), P(4, -150)], 3.2 * s, col, 'ink', .5);
    inkLine([P(2, -100), P(26, -130)], 2 * s, col, 'ink', .4); inkLine([P(-1, -70), P(-26, -92)], 2 * s, col, 'ink', .4);
    for (const sd of [-1, 1]) inkLine([P(sd * 10, 10), P(sd * 34, 26), P(sd * 52, 22)], 2.2 * s, col, 'ink', .5);
    if (o.axon) inkLine([P(0, 14), P(-3, 60), P(4, 60 + o.axon)], 2 * s, col, 'ink', .5);
    paint(rotPts([[0, -20], [16, 12], [-16, 12]], x, y, rot, s), { wash: col, ink: dk, sw: sw * .6, curv: .5 });
  }
  function spindle(x, y, s, col, key) {                         // a von Economo-like neuron: a long spindle, one dendrite each end
    boilSeed('ven' + key);
    inkLine([[x, y - 40 * s], [x + 4 * s, y - 120 * s], [x - 3 * s, y - 190 * s]], 3 * s, col, 'ink', .5);
    inkLine([[x, y + 40 * s], [x - 4 * s, y + 120 * s], [x + 3 * s, y + 180 * s]], 3 * s, col, 'ink', .5);
    paint([[x, y - 52 * s], [x + 11 * s, y - 10 * s], [x + 9 * s, y + 20 * s], [x, y + 52 * s], [x - 9 * s, y + 20 * s], [x - 11 * s, y - 10 * s]], { wash: col, ink: mixCol(col, PAL.ink, .4), sw: 1.1 * s, curv: .6 });
  }
  const AXONS = [[-150, -175], [-60, -195], [40, -195], [140, -180], [230, -140]].map(([x, y], j) => [[x, y], [x * .5, -70], [12 + j * 8 - 16, -18], [-110, 30 + j * 4], [-220, 104 + j * 3], [-440, 120 + j * 2], [-700, 128 + j * 2], [-940, 134]]);
  const UP = [[-10, -10], [30, -30], [60, -10], [-40, -5]].map(([x, y], j) => [[x, y], [x + 20 - j * 15, -90], [-120 + j * 110, -150 - 15 * (j % 2)]]);
  function pathPts(B, Q, k, n = 40) {                          // a smooth path through brain-local points, drawn to fraction k
    const P = through(Q.map(p => B.at(...p)), 6), m = Math.max(2, Math.round(P.length * clamp(k)));
    return P.slice(0, m);
  }

  // ---------- E1: the question (lavender dusk) ----------
  function shotE1(t, lt, dur) {
    const c = kf(t, [[0, [1080, 520, 1.0]], [L(15, 3.2), [1080, 520, 1.0]], [L(15, 4.4), [1300, 440, 1.4]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    bg(mixCol(Z.board, Z.night, .15), Z.boardBlob, t, 'e1');
    const B = brainSide(1200, 540, 1.05, t, { key: 'e1b', human: 1, cord: 0 });
    const nk = seg(t, L(15, 3.6), L(15, 4.2));
    if (nk > .05) {
      const top = B.at(30, -175), bot = B.at(10, -10), n2 = backOut(clamp(nk * 1.2 - .2));
      neuron(top[0], top[1] + 20, .55 * backOut(nk), Z.humDk, 'q1', { axon: 40 });
      if (n2 > .05) neuron(bot[0], bot[1] + 20, .5 * n2, '#2E8C80', 'q2', { rot: Math.PI, axon: 40 });
      dashPoly([[top[0] + 2, top[1] + 80], [bot[0] + 2, bot[1] - 60], [bot[0] + 2, bot[1] - 60]], seg(t, L(15, 4.4), L(15, 5.2)) * .5, PAL.ink, 'gap', 1.6, 8);
      if (t > L(15, 5.4)) pipEmote('question', (top[0] + bot[0]) / 2 + 60, (top[1] + bot[1]) / 2 + 20, 16, 1, 'eq');
    }
    camEnd();
    host(215, 900, 30, t, [[0, 'calm', { lookX: .8 }], [L(15, 1.0), 'confused'], [L(15, 4.0), 'calm', { lookX: .9, lookY: -.4 }], [L(15, 6.4), 'confused']], {}, 'pe1');
    if (lt < .3) flash(1 - lt / .3, Z.recap);
    const dark = seg(lt, dur - .9, dur); if (dark > 0) flash(dark, Z.night);
  }

  // ---------- E2: fluorescence (night) ----------
  function shotE2(t, lt, dur) {
    const c = kf(t, [[0, [1100, 500, 1.0]], [L(16, 7.8), [1100, 500, 1.0]], [L(16, 9.4), [700, 560, 1.1]], [L(16, 10.4), [700, 560, 1.1]], [L(16, 11.6), [1080, 470, 1.15]],
      [L(17, 7.0), [1080, 470, 1.15]], [L(17, 7.8), [1000, 480, 1.0]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    bg(Z.night, Z.nightBlob, t, 'e2', 4);
    K.motes(t, 14, mixCol(Z.night, PAL.cream, .18), { key: 'e2' });
    const lit = seg(t, L(16, 0), L(16, 2.2));
    const B = brainSide(1250, 470, 1.0, t, { key: 'e2b', human: 1, dark: true, cord: 1, humCol: mixCol(mixCol(Z.hum, Z.night, .45), Z.hum, lit) });
    const fl = pulseK(t, L(16, 2.4), .8);
    // the graft's light: steady after it's lit, flashing together in L17, a wave along it, and answers to the face
    const sync = t > L(17, 1.5) && t < L(17, 7.2) ? pulse(t, 5) : 0, wave = seg(t, L(17, 4.7), L(17, 7.0));
    const twitch = [7.6, 8.4, 9.1, 9.9, 10.6, 11.4].map(d => L(17, d)), ans = twitch.reduce((m, e) => Math.max(m, t > e + .12 ? Math.exp(-(t - e - .12) * 6) : 0), 0);
    for (let i = 0; i < 6; i++) {
      const x = -230 + i * 90, p = B.at(x, -205 + .0016 * x * x + 32), wv = wave > 0 && wave < 1 ? Math.exp(-Math.pow((wave * 8 - i) / 1.1, 2)) : 0;
      glow(p[0], p[1], 120, Z.hum, lit * (.35 + .5 * fl + .6 * sync + .7 * wv + .7 * ans));
    }
    const grow = seg(t, L(16, 4.6), L(16, 9.8));               // human axons dive to the spinal cord
    AXONS.forEach((Q, j) => {
      const reach = j === 2 || j === 4 ? 1 : .72, k = clamp(grow * 1.15 - j * .04) * reach; if (k <= .02) return;
      const P = pathPts(B, Q, k); boilSeed('ax' + j); inkLine(P, 2.4, '#FFC6D8', 'ink', .4);
      const tip = P[P.length - 1]; if (k < reach - .01 || t < L(16, 12)) glow(tip[0], tip[1], 34, Z.hum, .9);
    });
    const thal = pulseK(t, L(16, 6.6), .9), stem = pulseK(t, L(16, 7.5), .9);
    if (thal > 0) glow(...B.at(12, -22), 90, Z.hum, thal * .7);
    if (stem > 0) glow(...B.at(-220, 104), 80, Z.hum, stem * .7);
    const up = seg(t, L(16, 10.8), L(16, 13.2));                // mouse axons grow back into the graft
    UP.forEach((Q, j) => {
      const k = clamp(up * 1.3 - j * .1); if (k <= .02) return;
      const P = pathPts(B, Q, k); boilSeed('up' + j); inkLine(P, 2.4, Z.tealLt, 'ink', .4);
      const tip = P[P.length - 1]; glow(tip[0], tip[1], 30, Z.teal, .9);
      if (k > .98 && t < L(17, 2)) K.sparkle(tip[0], tip[1], 24, seg(t, L(16, 12.2 + j * .15), L(16, 13 + j * .15)), '#E6FFF8');
    });
    camEnd();
    // the inset: the mouse's face; each twitch of the whiskers or the jaw answered by the graft
    const ik = seg(t, L(17, 7.0), L(17, 7.5)) * (1 - seg(t, L(18, -1.8), L(18, -1.3)));
    if (ik > .02) {
      const q = backOut(ik), ix = 470, iy = 260, tw = twitch.reduce((m, e) => Math.max(m, near(t, e, .1)), 0);
      boilSeed('inset'); paint(ellPts(ix, iy, 240 * q, 180 * q, 34), { wash: '#F3ECE4', ink: PAL.ink, sw: 1.4 });
      push(); translate(ix, iy); scale(q);
      mouseSide(-40, 100, .9, t, { key: 'mi', whisk: tw * 2, chew: tw });
      pop();
    }
    host(215, 900, 30, t, [[0, 'calm', { lookX: .8 }], [L(16, 2.4), 'wow', { take: 1.1 }], [L(16, 6.0), 'calm', { lookX: .2, lookY: .6 }], [L(16, 9.6), 'wow', { lookX: .4 }], [L(16, 11.5), 'excited'],
      [L(17, 1.6), 'sing'], [L(17, 7.6), 'calm', { lookX: .9, lookY: -.8 }], [L(17, 10.0), 'laugh']], {}, 'pe2');
    if (lt < .6) flash(1 - lt / .6, Z.night);
    if (t > L(16, 2.3) && t < L(16, 2.8)) flash(.35 * pulseK(t, L(16, 2.3), .5), '#FFE3EC');
    const into = seg(lt, dur - .5, dur); if (into > 0) flash(into, Z.plum);
  }

  // ---------- E3: the neuron no mouse has (deep plum) ----------
  const FOREST = Array.from({ length: 13 }, (_, i) => [380 + hash(i + 700) * 1400, 420 + hash(i + 701) * 520, .9 + .4 * hash(i + 702), (hash(i + 703) - .5) * .4]).filter(([x, y]) => Math.hypot(x - 900, y - 600) > 170 && !(x < 640 && y > 640));
  function head(x, y, s, kind, key) {                          // flat silhouettes for the comparison: human, ape, mouse
    boilSeed('hd' + key);
    const col = '#EDE2D6';
    const P = kind === 'human' ? [[40, 60], [44, 10], [70, -6], [62, -30], [64, -60], [40, -100], [0, -118], [-46, -104], [-70, -64], [-66, -10], [-40, 30], [-30, 60]]
      : kind === 'ape' ? [[46, 60], [70, 30], [84, 0], [70, -26], [72, -46], [50, -84], [0, -100], [-50, -88], [-74, -50], [-70, 0], [-46, 34], [-36, 60]]
      : [[90, 10], [50, -20], [10, -36], [-30, -40], [-60, -20], [-64, 20], [-30, 44], [30, 40]];
    paint(P.map(([a, b]) => [x + a * s, y + b * s]), { wash: col, ink: PAL.ink, sw: 1.2, curv: .45 });
    if (kind === 'mouse') { paint(ellPts(x - 40 * s, y - 50 * s, 26 * s, 30 * s, 16), { wash: col, ink: PAL.ink, sw: 1.1 }); paint(ellPts(x + 90 * s, y + 8 * s, 7 * s, 6 * s, 8), { wash: Z.pink, ink: PAL.ink, sw: .6 }); }
    return kind === 'mouse' ? [x - 10 * s, y - 4 * s] : [x - 6 * s, y - 56 * s];
  }
  function shotE3(t, lt, dur) {
    const c = kf(t, [[0, [960, 560, 1.0]], [L(18, 6.6), [960, 560, 1.0]], [L(18, 7.8), [900, 600, 1.7]], [L(18, 9.6), [900, 600, 1.7]], [L(18, 10.4), [1040, 540, 1.0]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    bg(Z.plum, Z.plumBlob, t, 'e3', 4);
    const side = seg(t, L(18, 9.7), L(18, 10.4));                // the comparison slides in from the right; the forest dims
    FOREST.forEach(([x, y, s, r], i) => { neuron(x - 300 * ease(side), y, s, mixCol(Z.hum, Z.plum, .15 + .45 * side), 'f' + i, { rot: r, axon: 60 }); });
    const lit = seg(t, L(18, 2.8), L(18, 3.6)), vx = 900 - 300 * ease(side);
    if (lit > 0) glow(vx, 600, 200, Z.gold, lit * (.7 + .2 * pulse(t, 3)));
    spindle(vx, 600, 1.0, mixCol(mixCol(Z.humDk, Z.plum, .25), Z.gold, lit), 'v');
    if (side > 0) {
      [['human', 1150, 1], ['ape', 1440, 1], ['mouse', 1730, 0]].forEach(([kind, x, has], i) => {
        const k = backOut(clamp(side * 1.4 - i * .15)); if (k <= .02) return;
        const b = head(x + 600 * (1 - k), 640, 1.45, kind, kind);
        const mk = seg(t, L(18, has ? 10.4 + i * .5 : 12.7), L(18, has ? 10.9 + i * .5 : 13.2));
        if (has && mk > .05) { glow(b[0], b[1], 60, Z.gold, mk); spindle(b[0], b[1], .32 * backOut(mk), Z.gold, 'sv' + i); K.check(x, 820, 60, seg(t, L(18, 10.9 + i * .5), L(18, 11.3 + i * .5)), 'ck' + i); }
        if (!has && mk > .05) { dashPoly(ellPts(b[0], b[1], 18, 26, 14), 1, PAL.cream, 'nov', 1.4, 6); K.cross(x, 820, 60, mk, 'cx'); }
      });
    }
    camEnd();
    const shiver = t > L(18, .1) && t < L(18, 2.4) ? .05 * Math.sin(t * 60) : 0;
    host(215, 900, 30, t, [[0, 'calm', { lookX: .8 }], [L(18, .2), 'worried', { rot: shiver, take: .8 }], [L(18, 2.6), 'calm', { lookX: .9 }], [L(18, 3.6), 'wow', { take: 1.2 }], [L(18, 8.0), 'love'], [L(18, 12.8), 'wow', { lookX: .9 }]], {}, 'pe3');
    if (lt < .5) flash(1 - lt / .5, Z.plum);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B7AEDB', Z.board]);
  }

  // ---------- E4: smarter? the Y-maze (lavender) ----------
  const YC = [760, 470], YA = [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6];   // arms: up, down-right, down-left
  function yMaze(t, key) {
    boilSeed('ym' + key);
    YA.forEach((a, i) => { const ex = YC[0] + Math.cos(a) * 300, ey = YC[1] + Math.sin(a) * 300, nx = -Math.sin(a) * 58, ny = Math.cos(a) * 58;
      paint([[YC[0] + nx, YC[1] + ny], [ex + nx, ey + ny], [ex - nx, ey - ny], [YC[0] - nx, YC[1] - ny]], { wash: '#F5F1FA', ink: null }); });
    paint(ellPts(YC[0], YC[1], 80, 80, 20), { wash: '#F5F1FA', ink: null });
    YA.forEach((a, i) => { const ex = YC[0] + Math.cos(a) * 300, ey = YC[1] + Math.sin(a) * 300, nx = -Math.sin(a) * 58, ny = Math.cos(a) * 58;
      inkLine([[YC[0] + nx * 1.2 + Math.cos(a) * 60, YC[1] + ny * 1.2 + Math.sin(a) * 60], [ex + nx, ey + ny], [ex - nx, ey - ny], [YC[0] - nx * 1.2 + Math.cos(a) * 60, YC[1] - ny * 1.2 + Math.sin(a) * 60]], 2.2, PAL.ink, 'ink', 0); });
  }
  function bar(x, y0, h, col, k, key) {
    if (h * k < 20) return; boilSeed('bar' + key);
    paint(rrPts(x - 45, y0 - h * k, 90, h * k, 8), { wash: col, ink: PAL.ink, sw: 1.1 });
  }
  function shotE4(t, lt, dur) {
    camBegin(980 + 6 * wob(t, .05), 540 + 5 * wob(t, .04), 1.0 + .008 * lt);
    bg(Z.board, Z.boardBlob, t, 'e4');
    yMaze(t, 'a');
    // the run: arm → centre → arm. Cortexless: up, back, up again. Grafted: up, back, a new arm.
    const runs = [[L(19, 5.3), 0, 0, 'grey'], [L(19, 8.6), 0, 1, 'rose']];
    let drawn = false;
    runs.forEach(([t0, a1, a2, kind], ri) => {
      const end = ri === 0 ? L(19, 8.4) : L(19, 14.6); if (t < t0 || t > end || drawn) return; drawn = true;
      const k = seg(t, t0, t0 + 2.4), arm = (a, f) => [YC[0] + Math.cos(YA[a]) * 250 * f, YC[1] + Math.sin(YA[a]) * 250 * f];
      let p, ang;
      if (k < .45) { const f = 1 - ease(k / .45); p = arm(a1, f); ang = YA[a1] + Math.PI; }
      else { const f = ease((k - .45) / .55); p = arm(a2, f); ang = YA[a2]; }
      if (k <= .02) { p = arm(a1, 1); ang = YA[a1] + Math.PI; }
      mouseTop(p[0], p[1], .7, ang, t, { run: k > 0 && k < 1 ? 1 : 0, key: 'ym' + ri, glow: kind === 'rose' ? .9 : 0 });
      if (k >= 1) { if (kind === 'grey') pipEmote('question', p[0] + 40, p[1] - 70, 18, 1, 'yq'); else K.check(p[0] + 70, p[1] - 40, 56, seg(t, t0 + 2.4, t0 + 2.8), 'yc'); }
    });
    // the bars: chance line at 50%
    const y0 = 820, sc = 7, X = [1380, 1540, 1700];
    boilSeed('axis'); inkLine([[1300, y0], [1790, y0]], 1.6, PAL.ink, 'ink', 0);
    const ch = seg(t, L(19, 5.1), L(19, 5.7));
    bar(X[0], y0, 50 * sc, '#BFC4CB', ease(seg(t, L(19, 6.1), L(19, 7.1))), 'g');
    bar(X[1], y0, 63 * sc, Z.hum, ease(seg(t, L(19, 10.7), L(19, 11.7))), 'r');
    bar(X[2], y0, 68 * sc, Z.slate, ease(seg(t, L(19, 12.4), L(19, 13.4))), 'n');
    if (ch > 0) dashPoly([[1300, y0 - 50 * sc], [1300 + 490 * ch, y0 - 50 * sc], [1300 + 490 * ch, y0 - 50 * sc]], .5, Z.slateDk, 'ch', 1.6, 12);
    [['grey', X[0], L(19, 6.1)], ['rose', X[1], L(19, 10.7)], ['norm', X[2], L(19, 12.4)]].forEach(([k, x, t0], i) => {
      const q = backOut(seg(t, t0 - .3, t0 + .1)); if (q <= .02) return;
      boilSeed('bm' + i); const col = k === 'grey' ? '#BFC4CB' : Z.mouse;
      for (const sd of [-1, 1]) paint(ellPts(x + sd * 22 * q, y0 + 32 - 14 * q, 12 * q, 12 * q, 10), { wash: col, ink: PAL.ink, sw: .7 });
      paint(ellPts(x, y0 + 44, 26 * q, 20 * q, 14), { wash: col, ink: PAL.ink, sw: .8 });
      if (k === 'rose') glow(x, y0 + 40, 40, Z.hum, .8);
    });
    camEnd();
    host(215, 900, 30, t, [[0, 'calm', { lookX: .8 }], [L(19, .4), 'idea', { lookX: .5 }], [L(19, 3.8), 'calm', { lookX: .9, lookY: -.3 }], [L(19, 6.5), 'confused'], [L(19, 10.9), 'happy', { lookX: .9 }], [L(19, 13.4), 'smug']], {}, 'pe4');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B7AEDB', Z.board]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#BFA9C2', Z.mauve]);
  }

  // ---------- F1: what it's for (dim mauve) ----------
  function microglia(x, y, s, key) {
    boilSeed('mg' + key);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3; inkLine([[x, y], [x + Math.cos(a) * 26 * s, y + Math.sin(a) * 22 * s], [x + Math.cos(a + .4) * 36 * s, y + Math.sin(a + .4) * 30 * s]], 2 * s, '#6E8C96', 'ink', .5); }
    paint(ellPts(x, y, 12 * s, 10 * s, 10), { wash: '#9FB8BF', ink: PAL.ink, sw: .7 });
  }
  function shotF1(t, lt, dur) {
    const c = kf(t, [[0, [980, 540, 1.0]], [L(20, 10.2), [980, 540, 1.0]], [L(20, 11.2), [980, 500, .96]]], ease);
    camBegin(c[0] + 6 * wob(t, .05), c[1] + 5 * wob(t, .04), c[2]);
    const cool = seg(t, L(20, 2.0), L(20, 3.4)) * (1 - seg(t, L(20, 10.0), L(20, 11.0)));
    bg(mixCol(Z.mauve, '#B9C3D6', cool), Z.mauveBlob, t, 'f1');
    for (let i = 0; i < 10; i++) { const o2 = 1 - cool; if (o2 < .05) continue; boilSeed('ob' + i); const x = 400 + hash(i + 800) * 1300, y = frac(hash(i + 801) - t * .03) * 900 + 60;
      paint(ellPts(x, y, 14, 14, 10), { wash: PAL.cream, washOp: 220 * o2, ink: mixCol(Z.mauve, Z.vessel, .5), sw: .7 * o2 }); }
    const hurt = seg(t, L(20, 3.8), L(20, 5.0)) * (1 - seg(t, L(20, 10.0), L(20, 11.0)));
    const B = brainSide(1160, 440, .95, t, { key: 'f1b', human: 1, cord: 0, humCol: mixCol(Z.hum, '#7E5A6E', hurt) });
    const mg = seg(t, L(20, 4.2), L(20, 6.0)) * (1 - seg(t, L(20, 10.0), L(20, 10.6)));
    if (mg > 0) for (let i = 0; i < 5; i++) { const x = -200 + i * 100, tgt = B.at(x, -168 + .0012 * x * x), st = B.at(x * .6, 60); microglia(lerp(st[0], tgt[0], ease(mg)), lerp(st[1], tgt[1], ease(mg)), .9, 'm' + i); }
    // the mouse walks, then wobbles
    const wob2 = seg(t, L(20, 6.0), L(20, 6.6)) * (1 - seg(t, L(20, 10.0), L(20, 10.5))), mx = 1000 + 120 * Math.sin(t * .5);
    push(); translate(mx, 900); rotate(wob2 * .12 * Math.sin(t * 7)); mouseSide(0, 0, .9, t, { key: 'mf', walking: true, walk: t * 2.4 * (1 - .4 * wob2) }); pop();
    if (wob2 > .5) pipEmote('sweat', mx + 120, 760, 20, 1, 'mfs');
    // later: patients' own cells → three dishes, three brains
    const dk = seg(t, L(20, 10.4), L(20, 11.0));
    if (dk > .02) ['#9C7BC4', '#5FB3A6', '#E0A04E'].forEach((col, i) => {
      const q = backOut(clamp(dk * 1.4 - i * .15)); if (q <= .02) return; const x = 1440 + i * 170, y = 140;
      boilSeed('fd' + i); paint(ellPts(x, y, 70 * q, 22 * q, 20), { wash: Z.glass, ink: PAL.ink, sw: 1 }); paint(ellPts(x, y - 4 * q, 24 * q, 18 * q, 14), { wash: col, ink: PAL.ink, sw: .8 });
      arrow(x, y + 40, x - 220 + i * 40, 330, seg(t, L(20, 11.4 + i * .3), L(20, 12.0 + i * .3)), col, 'fa' + i, 9);
    });
    camEnd();
    if (cool > 0) flash(.18 * cool, '#6F86B5');
    host(215, 900, 30, t, [[0, 'calm', { lookX: .8 }], [L(20, 1.8), 'worried'], [L(20, 6.2), 'sad', { lookX: .9 }], [L(20, 10.6), 'idea'], [L(20, 13.0), 'happy', { lookX: .9 }]], {}, 'pf1');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#BFA9C2', Z.mauve]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B7BEC9', Z.grey]);
  }

  // ---------- F2: the limits (cool grey board) ----------
  function swatch(x, y, real, t, key, k) {
    if (k <= .02) return; push(); translate(x, y); scale(backOut(k)); boilSeed('sw' + key);
    const w = 300, h = 380;
    paint(rrPts(-w / 2, -h / 2, w, h, 16), { wash: real ? '#F1D6DF' : '#EFD3DC', ink: PAL.ink, sw: 1.2 });
    if (real) for (let i = 0; i < 6; i++) { paint(rrPts(-w / 2 + 6, -h / 2 + 8 + i * 61, w - 12, 56, 8), { wash: mixCol('#E9B7C8', '#C98AA2', i / 5), ink: null });
      for (let j = 0; j < 4; j++) neuron(-105 + j * 70, -h / 2 + 46 + i * 61, .2, Z.humDk, key + i + j); }
    else for (let i = 0; i < 22; i++) neuron(-120 + hash(i + 900) * 240, -150 + hash(i + 901) * 300, .2, Z.humDk, key + 'j' + i, { rot: (hash(i + 902) - .5) * 3 });
    for (let i = 0; i < 5; i++) { const px = -100 + hash(i + 950) * 200, py = -140 + hash(i + 951) * 280;
      if (real) paint(ellPts(px, py, 13, 13, 10), { wash: Z.interneuron, ink: PAL.ink, sw: .7 });
      else if (t > L(21, 4.6)) dashPoly(ellPts(px, py, 14, 14, 12), 1, Z.interneuron, key + 'in' + i, 1.4, 5); }
    pop();
  }
  function plant(x, y, h, key) {                                // a pot and a plant of height h (a sprout → a grown plant)
    boilSeed('pl' + key);
    inkLine([[x, y - 20], [x + 4, y - 20 - h * .5], [x - 2, y - 20 - h]], 4, Z.peaDk, 'ink', .5);
    const n = Math.max(1, Math.round(h / 45));
    for (let i = 0; i < n; i++) { const yy = y - 40 - i * (h - 30) / n, sd = i % 2 ? 1 : -1; paint(rotEll(x + sd * 26, yy, 26, 11, 12, sd * -.5), { wash: Z.pea, ink: PAL.ink, sw: .8 }); }
    paint([[x - 46, y - 40], [x + 46, y - 40], [x + 34, y + 30], [x - 34, y + 30]], { wash: '#C9805A', ink: PAL.ink, sw: 1 });
  }
  function monkey(x, y, s, key) {                               // a seated primate silhouette
    boilSeed('mk' + key);
    const col = '#8E7B6E';
    paint(ellPts(x, y - 70 * s, 62 * s, 80 * s, 24), { wash: col, ink: PAL.ink, sw: 1.2 });
    inkLine([[x + 50 * s, y - 20 * s], [x + 110 * s, y - 10 * s], [x + 130 * s, y - 60 * s], [x + 120 * s, y - 110 * s]], 6 * s, col, 'ink', .6);
    for (const sd of [-1, 1]) paint(ellPts(x + sd * 44 * s, y - 196 * s, 18 * s, 16 * s, 12), { wash: col, ink: PAL.ink, sw: 1 });
    paint(ellPts(x, y - 180 * s, 52 * s, 48 * s, 22), { wash: col, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(x, y - 168 * s, 32 * s, 26 * s, 16), { wash: '#C9B4A2', ink: null });
  }
  function shotF2(t, lt, dur) {
    const down = seg(t, L(21, 9.0), L(21, 10.2));
    const c = [980 + 6 * wob(t, .05), 540 + 5 * wob(t, .04) + 700 * ease(down), 1.0];
    camBegin(...c);
    bg(Z.grey, Z.greyBlob, t, 'f2');
    boilSeed('floor'); paint(rectPts(-800, 1300, W + 1600, 900), { wash: '#C9CFD8', ink: null }); inkLine([[-800, 1302], [W + 800, 1306]], 1.2, PAL.ink, 'ink', 0);
    swatch(640, 470, true, t, 'r', seg(t, L(21, 3.0), L(21, 3.5)));
    swatch(1000, 470, false, t, 'g', seg(t, L(21, 3.2), L(21, 3.7)));
    K.cross(1000, 720, 60, seg(t, L(21, 4.0), L(21, 4.4)), 'lay');
    const pk = seg(t, L(21, 6.0), L(21, 6.5));
    if (pk > .02) { push(); translate(1420, 600); scale(backOut(pk)); plant(-90, 0, 50, 's'); plant(110, 0, 280 * 0 + 300, 'b'); pop();
      arrow(1360, 640, 1470, 640, seg(t, L(21, 6.8), L(21, 7.4)), PAL.cream, 'pa', 10); }
    // the red line on the floor; a primate beyond it
    const rl = seg(t, L(21, 9.6), L(21, 10.6));
    if (rl > 0) { boilSeed('rl'); inkLine([[1120, 1080], [1124, lerp(1080, 1520, ease(rl))]], 7, '#D0453A', 'ink', 0); }
    const mk = seg(t, L(21, 10.4), L(21, 11.0));
    if (mk > .02) { push(); translate(1480, 1420); scale(backOut(mk)); monkey(0, 0, 1.1, 'a'); pop(); }
    camEnd();
    host(215 + 500 * ease(down), 900, 30, t, [[0, 'calm', { lookX: .8 }], [L(21, 3.6), 'calm', { lookX: .9, lookY: -.3 }], [L(21, 4.6), 'worried', { blush: .3 }], [L(21, 6.6), 'idea'],
      [L(21, 9.6), 'angry', { armsFront: true, armF: { at: [.9, -1.6] }, armB: { at: [-.9, -1.6] }, emote: null, lookX: .9 }], [L(21, 12.2), 'calm', { lookX: .9 }]], {}, 'pf2');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B7BEC9', Z.grey]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E8C27A', Z.gold2]);
  }

  // ---------- G: the maze again, golden ----------
  function shotG(t, lt, dur) {
    const mk = seg(t, L(22, 4.8), L(22, 8.4)), [mx, my, ma] = along([[-260, 640], ...PATH.slice(1)], ease(mk));
    const c = kf(t, [[0, [900, 520, .95]], [L(22, 8.0), [960, 500, 1.0]], [L(22, 10.0), [1080, 470, 1.12]]], ease);
    camBegin(c[0] + 8 * wob(t, .05), c[1] + 6 * wob(t, .04), c[2]);
    maze(t, 'mg', 1);
    const gl = .25 + .75 * seg(t, L(22, 9.6), L(22, 10.8));
    mouseTop(mx, my, 1, ma, t, { run: mk > 0 && mk < 1 ? 1 : 0, sniff: t > L(22, 8.4) ? 1 : 0, key: 'mg', glow: mk > 0 ? gl * (1 + .2 * pulse(t, 3)) : 0 });
    camEnd();
    // three callbacks
    [[.0, 'room'], [1.7, 'seed'], [3.0, 'wire']].forEach(([d, kind], i) => {
      const k = seg(t, L(22, d), L(22, d + .4)) * (1 - seg(t, L(22, 4.6), L(22, 5.1))); if (k <= .02) return;
      const x = 640 + i * 360, y = 220, q = backOut(k);
      boilSeed('cb' + i); paint(ellPts(x, y, 140 * q, 110 * q, 30), { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
      push(); translate(x, y + 30); scale(q * .42);
      if (kind === 'room') dashPoly(scalePts(SB.cortex, 0, 120, 1), 1, Z.slateDk, 'cbr', 3.4, 18);
      if (kind === 'seed') rosettes(0, -40, 110, t, 'cbs');
      if (kind === 'wire') { boilSeed('cbw'); inkLine(through([[-180, -120], [-60, -40], [40, 30], [180, 80]], 6), 8, Z.hum, 'ink', .5); glow(180, 80, 60, Z.hum, 1); }
      pop();
    });
    const P = [235, 880];
    host(P[0], P[1], 31, t, [[0, 'happy'], [L(22, 1.7), 'calm', { lookX: .8, lookY: -.6 }], [L(22, 4.8), 'calm', { lookX: .9 }], [L(22, 8.1), 'wink', { lookX: 0, lookY: 0 }], [L(22, 10.6), 'smug', { lookX: .8 }], [L(22, 12.4), 'wave']], {}, 'pg');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E8C27A', Z.gold2]);
    const close = seg(t, PROJECT.duration - 3.0, PROJECT.duration - .5);
    if (close > 0) iris(P[0], P[1] - 90, kf(close, [[0, 1900], [.6, 230], [.8, 210], [1, 0]], easeIn));
  }

  LOOPS.cover = t => { shotA(L(2, 2), 20, 99); };
  LOOPS.cover.len = 1;

  shots([[0, shotA], [L(3, -1.6), shotB], [L(6, -1.6), shotC], [L(10, -1.6), shotD1], [L(12, -1.6), shotD2], [L(14, -1.5), shotR], [L(15, -1.4), shotE1], [L(16, -1.0), shotE2], [L(18, -1.2), shotE3], [L(19, -1.2), shotE4], [L(20, -1.6), shotF1], [L(21, -1.1), shotF2], [L(22, -1.6), shotG]]);
})();

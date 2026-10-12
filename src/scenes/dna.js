// dna.js: "Clawd讲转录和翻译", 88 s. Clawd dives through a microscope into a cell and follows one gene: transcription in
// the nucleus (polymerase, unzipping, mRNA, T→U), processing (cap, tail, splicing), export through a nuclear pore, then
// translation in the cytoplasm (ribosome, AUG, codons, tRNAs, peptide bonds, stop) and folding into a working protein.
// Timings follow the narration (vo_dna.mjs → VO_ENV). See STORYBOARD_DNA.md.
(() => {
  // ---------- palette ----------
  const BC = { A: '#F08A4B', T: '#3AA5A0', G: '#7DB35A', C: '#8E6BC4', U: '#E86E8E' };
  const RPAIR = { A: 'U', U: 'A', G: 'C', C: 'G' };              // RNA pairing (codon ↔ anticodon)
  const RNA_OF = { A: 'U', T: 'A', G: 'C', C: 'G' };             // template DNA base → RNA base
  const DPAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const Kc = {
    dnaBack: '#5B7FC7', rnaBack: '#E8A33D', nucleus: '#3B3470', nucleusLt: '#574C94', cyto: '#F6D2B0', cytoLt: '#FBE3C8',
    pol: '#4FB0B8', polDk: '#2F7F8A', ribo: '#B982C9', riboDk: '#8B5A9C', riboLt: '#D9AEE3', trna: '#F4D06F', trnaDk: '#C99D35',
    prot: '#E98B5F', grey: '#A8A2B0', gold: '#F4C54A'
  };
  const AA = ['#E0714E', '#4FA3B5', '#E8AA38', '#7B5CA8', '#6E9F58', '#E27A92'];
  const talk = (t, o) => ({ ...o, sq: (o.sq || 0) + .035 * voAt(t) });
  let VIS = [-1e9, 1e9];
  function cam(cx, cy, z) { camBegin(cx, cy, z); VIS = [cx - W / 2 / z - 200, cx + W / 2 / z + 200]; }
  const seen = (x, r = 200) => x + r > VIS[0] && x - r < VIS[1];

  // ---------- painted letters (brush strokes, they boil with the linework) ----------
  const GLYPH = {
    A: [[[-.34, .46], [0, -.46], [.34, .46]], [[-.18, .1], [.18, .1]]],
    T: [[[-.4, -.44], [.4, -.44]], [[0, -.44], [0, .46]]],
    U: [[[-.34, -.46], [-.34, .12], [-.2, .4], [0, .47], [.2, .4], [.34, .12], [.34, -.46]]],
    C: [[...Array(11)].map((_, i) => { const a = .75 + i / 10 * (TAU - 1.5); return [Math.cos(a) * .42, Math.sin(a) * .46]; })],
    G: [[...Array(11)].map((_, i) => { const a = .75 + i / 10 * (TAU - 1.2); return [Math.cos(a) * .42, Math.sin(a) * .46]; }).concat([[.4, .1], [.08, .1]])]
  };
  function glyph(ch, x, y, s, col = PAL.cream, sw = 1.1) {
    for (const st of GLYPH[ch] || []) inkLine(st.map(([a, b]) => [x + a * s, y + b * s]), sw, col, 'ink', ch === 'C' || ch === 'G' || ch === 'U' ? .5 : 0);
  }

  // ---------- base pieces: interlocking puzzle stubs ----------
  function piecePts(type, w, L) {                              // pointing +y from (0, 0)
    const convex = type === 'A' || type === 'G', round = type === 'G' || type === 'C', d = w * .34, P = [[-w / 2, 0], [w / 2, 0], [w / 2, L]];
    if (round) for (let i = 1; i < 8; i++) { const a = i / 8 * Math.PI; P.push([w / 2 * Math.cos(a), L + (convex ? 1 : -1) * d * Math.sin(a)]); }
    else P.push([0, L + (convex ? d : -d)]);
    P.push([-w / 2, L]); return P;
  }
  function piece(x, y, ang, type, w, L, o = {}) {              // ang 0 = pointing down
    if (L < 2) return; boilSeed('pc' + (o.key ?? ''));
    push(); translate(x, y); rotate(ang); if (o.sc != null) scale(o.sc);
    if (o.glow) glow(0, L * .6, w * 1.8, '#FFE08A', o.glow);
    paint(piecePts(type, w, L), { wash: o.col || BC[type], fill: o.dim ? Kc.grey : undefined, fillOp: o.dim ? 200 * o.dim : 0, ink: PAL.ink, sw: o.sw ?? .7 });
    if (o.letter > .02) { push(); translate(0, L * .52); rotate(-ang); scale(backOut(clamp(o.letter))); glyph(type, 0, 0, w * .62, o.gcol || PAL.cream, o.gsw ?? 1.2); pop(); }
    pop();
  }
  function backbone(P, w, col, key) { if (P.length < 2) return; boilSeed('bb' + key); paint(ribbon(P, w, w), { wash: col, fill: mixCol(col, PAL.ink, .3), fillOp: 50, tex: .5, ink: PAL.ink, sw: .8 }); }
  const angOf = (nx, ny) => Math.atan2(-nx, ny);                  // rotation that points a piece along (nx, ny)

  // ---------- characters ----------
  function eyesAt(x, y, s, o = {}) {                           // two friendly eyes (+ optional smile)
    const bl = o.blink || 0;
    for (const sd of [-1, 1]) {
      const ex = x + sd * s * .55;
      if (o.happy || bl > .7) inkLine([[ex - s * .25, y + s * .05], [ex, y - s * .2], [ex + s * .25, y + s * .05]], clamp(s / 14, .5, 1.3), PAL.ink, 'ink', .7);
      else { paint(ellPts(ex, y, s * .28, s * .38 * (1 - bl), 12), { wash: PAL.cream, ink: PAL.ink, sw: clamp(s / 20, .4, 1) }); paint(ellPts(ex + (o.lx || 0) * s * .1, y + (o.ly || 0) * s * .14, s * .14, s * .18, 10), { wash: PAL.ink, ink: null }); }
    }
    if (o.smile !== false) inkLine([[x - s * .3, y + s * .45], [x, y + s * .62], [x + s * .3, y + s * .45]], clamp(s / 16, .5, 1.2), PAL.ink, 'ink', .7);
    if (o.o) paint(ellPts(x, y + s * .55, s * .16, s * .2, 10), { wash: '#5E2440', ink: PAL.ink, sw: .6 });
  }
  const blinkAt = (t, sd) => { const f = frac((t + sd) / 3.1); return f < .045 ? Math.sin(f / .045 * Math.PI) : 0; };
  // RNA polymerase: a round teal blob that hugs the DNA from above with two arms. (x, y) = the point it grips.
  function polymerase(x, y, t, o = {}) {
    boilSeed('pol');
    const r = 105, cy = y - 190 + (o.bob ?? 5 * wob(t, .7)), sq = o.sq || 0;
    for (const sd of [-1, 1]) paint(ribbon([[x + sd * 70, cy + 30], [x + sd * 170, cy + 90], [x + sd * 215, y - 4]], 30, 22), { wash: Kc.polDk, ink: PAL.ink, sw: .9 });
    const P = []; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, c = Math.cos(a), s = Math.sin(a); P.push([x + c * r * (1 + sq) * (1 + .06 * Math.sin(a * 3 + t)), cy + s * r * .82 * (1 - sq)]); }
    paint(P, { wash: Kc.pol, fill: Kc.polDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1, curv: .3 });
    paint(ellPts(x - 30, cy - 45, 40, 22, 12), { fill: '#BDE6E4', fillOp: 120, ink: null });
    eyesAt(x + 18, cy - 10, 34, { blink: blinkAt(t, 1), lx: o.lx ?? .6, ly: o.ly ?? .5, happy: o.happy, smile: true });
    return [x, cy - r * .82 * (1 - sq)];                             // top of its head (for a rider)
  }
  function ribosomeLarge(x, y, t, o = {}) {                     // (x, y) = centre of the upper subunit
    boilSeed('riboL');
    const P = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, c = Math.cos(a), s = Math.sin(a); P.push([x + c * 250 * (1 + .05 * Math.sin(a * 2 + t * 1.3)), y + s * 150 * (s > 0 ? .85 : 1)]); }
    paint(P, { wash: Kc.ribo, fill: Kc.riboDk, fillOp: 55, tex: .5, ink: PAL.ink, sw: 1.1, curv: .3 });
    paint(ellPts(x - 90, y - 80, 70, 28, 12), { fill: Kc.riboLt, fillOp: 130, ink: null });
    eyesAt(x - 140, y - 55, 46, { blink: blinkAt(t, 2), lx: o.lx ?? .4, ly: o.ly ?? .6, happy: o.happy, o: o.oh, smile: !o.oh });
  }
  function ribosomeSmall(x, y) {
    boilSeed('riboS');
    const P = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; P.push([x + Math.cos(a) * 230, y + Math.sin(a) * 58]); }
    paint(P, { wash: Kc.riboLt, fill: Kc.ribo, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1, curv: .3 });
  }
  // tRNA: a yellow cloverleaf; (x, y) = its anticodon line; anticodon pieces hang below, the bead sits on top.
  const TRNA_H = 170;
  function trna(x, y, anti, t, o = {}) {
    boilSeed('tr' + (o.key ?? ''));
    push(); translate(x, y); rotate(o.rot || 0);
    const a = o.alpha ?? 1;
    anti.forEach((b, i) => piece((i - 1) * 58, 0, 0, b, 34, 36, { key: `tra${o.key}${i}`, letter: o.letters }));
    paint(rrPts(-92, -28, 184, 30, 12), { wash: Kc.trna, washOp: 255 * a, ink: PAL.ink, sw: .9 });
    const body = []; for (let i = 0; i < 44; i++) { const q = i / 44 * TAU, lob = 1 + .28 * Math.max(0, Math.cos(q * 3 - Math.PI / 2)); body.push([Math.cos(q) * 62 * lob, -95 + Math.sin(q) * 52 * lob]); }
    paint(body, { wash: Kc.trna, fill: Kc.trnaDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: .9, curv: .3 });
    paint(rectPts(-12, -TRNA_H + 8, 24, 40), { wash: Kc.trna, ink: PAL.ink, sw: .8 });
    eyesAt(0, -98, 20, { blink: blinkAt(t, o.seed || 0), happy: o.happy, lx: o.lx || 0, ly: o.ly || 0, smile: !o.sad });
    if (o.sad) inkLine([[-8, -80], [0, -85], [8, -80]], .8, PAL.ink, 'ink', .7);
    pop();
  }
  const acceptor = (x, y, rot = 0) => [x + Math.sin(rot) * TRNA_H, y - Math.cos(rot) * TRNA_H];
  function bead(x, y, i, s = 20) { boilSeed('bd' + i); paint(ellPts(x, y, s, s, 16), { wash: AA[i % AA.length], fill: mixCol(AA[i % AA.length], PAL.ink, .3), fillOp: 60, tex: .4, ink: PAL.ink, sw: .8 }); paint(ellPts(x - s * .3, y - s * .3, s * .25, s * .2, 8), { wash: PAL.cream, washOp: 170, ink: null }); }
  function tophat(x, y, s, rot = 0) { boilSeed('hat'); push(); translate(x, y); rotate(rot); paint(rectPts(-s * .9, -s * .15, s * 1.8, s * .3), { wash: '#C94F5F', ink: PAL.ink, sw: .8 }); paint(rectPts(-s * .55, -s * 1.2, s * 1.1, s * 1.1), { wash: '#C94F5F', ink: PAL.ink, sw: .8 }); paint(rectPts(-s * .55, -s * .5, s * 1.1, s * .22), { wash: Kc.gold, ink: null }); pop(); }
  function sparkle(x, y, r, k) { if (k > 0 && k < 1) paint(starPts(x, y, r * backOut(k) * (1 - k * .5), .28, 4, k * 1.5), { wash: PAL.cream, washOp: 255 * (1 - k * k), ink: null }); }
  function bracket(x0, x1, y, k, col = PAL.ink, glowK = 0) {
    if (k <= 0) return; boilSeed('br' + x0);
    const xm = (x0 + x1) / 2, h = (x1 - x0) / 2 * ease(k);
    if (glowK > 0) glow(xm, y - 30, 120, '#FFE08A', glowK);
    inkLine([[xm - h, y + 6], [xm - h * .9, y - 10], [xm, y - 14], [xm + h * .9, y - 10], [xm + h, y + 6]], 1.2, col, 'ink', .6);
  }
  function arrow(x0, y0, x1, y1, k, bend = -60) {             // a painted arrow drawing itself (k 0..1)
    if (k <= 0) return; boilSeed('arr' + x0);
    const P = through([[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 + bend], [x1, y1]], 10), n = Math.max(2, Math.ceil(P.length * clamp(k)));
    const Q = P.slice(0, n); inkLine(Q, 2.2, PAL.ink, 'ink', .5);
    if (k > .85) { const a = Q[Q.length - 1], b = Q[Q.length - 2], ang = Math.atan2(a[1] - b[1], a[0] - b[0]); for (const s of [-1, 1]) inkLine([a, [a[0] - Math.cos(ang + s * .5) * 26, a[1] - Math.sin(ang + s * .5) * 26]], 2.2, PAL.ink, 'ink', 0); }
  }
  function protein(x, y, t, fold, o = {}) {                     // fold 0: a loose chain; 1: folded; face 0..1
    const n = 6, chainP = i => [x - 170 + i * 68, y + 24 * Math.sin(i * 1.3 + t * 2) * (1 - fold)];
    const FOLD = [[-40, -30], [10, -52], [52, -20], [38, 30], [-8, 44], [-48, 18]];
    const P = [...Array(n)].map((_, i) => { const a = chainP(i), b = [x + FOLD[i][0], y + FOLD[i][1]]; const k = ease(clamp(fold * 1.4 - i * .07)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; });
    const face = o.face || 0;
    if (face > 0) {
      boilSeed('protBody'); const sq = o.sq || 0, B = [];
      for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, bump = 1 + .1 * Math.sin(a * 5 + 1), mouth = o.chomp ? 1 - .5 * o.chomp * Math.max(0, Math.cos(a)) ** 8 : 1; B.push([x + Math.cos(a) * 92 * bump * backOut(face) * (1 + sq) * mouth, y + Math.sin(a) * 84 * bump * backOut(face) * (1 - sq)]); }
      paint(B, { wash: Kc.prot, washOp: 200, fill: '#C9603E', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1, curv: .3 });
    }
    boilSeed('chain'); inkLine(through(P, 4), 1.6, PAL.ink, 'ink', .5);
    P.forEach((p, i) => bead(p[0], p[1], i, 20));
    if (face > .3) eyesAt(x - 8, y - 16, 28 * clamp(face), { happy: o.happy, blink: blinkAt(t, 3) });
  }

  // =========================== A: into the microscope (0–10) ===========================
  function microscope(x, y) {                                   // (x, y) = its foot on the bench
    boilSeed('micro');
    paint(rrPts(x - 150, y - 50, 300, 50, 14), { wash: '#4E5773', ink: PAL.ink, sw: 1 });
    paint(ribbon([[x + 80, y - 40], [x + 110, y - 250], [x + 30, y - 420]], 60, 50), { wash: '#6A7392', ink: PAL.ink, sw: 1 });
    paint(rectPts(x - 150, y - 210, 230, 26), { wash: '#4E5773', ink: PAL.ink, sw: .9 });
    paint([[x - 50, y - 330], [x + 20, y - 520], [x + 80, y - 500], [x + 10, y - 310]], { wash: '#8E97B5', ink: PAL.ink, sw: 1 });
    paint(rectPts(x - 60, y - 320, 70, 70), { wash: '#6A7392', ink: PAL.ink, sw: .9 });
    paint(rrPts(x + 8, y - 580, 90, 70, 12), { wash: '#4E5773', ink: PAL.ink, sw: .9 });
    paint(ellPts(x + 53, y - 580, 45, 12, 16), { wash: '#1D2040', ink: PAL.ink, sw: .8 });
    return [x + 53, y - 585];                                     // the eyepiece
  }
  function cellField(t, zoomK) {                                // the microscope's view: many cells; ours at (0, 0)
    boilSeed('field'); paint(rectPts(-3000, -2000, 6000, 4000), { wash: '#D6ECE6', ink: null });
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4, d = 520 + 260 * hash(i), cx = Math.cos(a) * d, cy = Math.sin(a) * d * .8, r = 170 + 60 * hash(i + 4);
      boilSeed('fc' + i); paint(ellPts(cx, cy, r, r * .85, 22, 6, hash(i) * 3), { wash: '#F3D9C3', fill: '#E6BCA0', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1 });
      paint(ellPts(cx + 20, cy - 10, r * .35, r * .32, 16), { wash: '#7C6DB2', ink: PAL.ink, sw: .8 });
    }
    boilSeed('ourCell');
    paint(ellPts(0, 0, 380, 330, 30, 5), { wash: Kc.cytoLt, fill: Kc.cyto, fillOp: 90, tex: .5, ink: PAL.ink, sw: 1.2 });
    for (let i = 0; i < 6; i++) { boilSeed('org' + i); const a = i * 1.1 + .4, d = 250; paint(ellPts(Math.cos(a) * d, Math.sin(a) * d * .8, 38, 18, 12, 2, a), { wash: '#E7A57E', ink: PAL.ink, sw: .6 }); inkLine([[Math.cos(a) * d - 20, Math.sin(a) * d * .8], [Math.cos(a) * d + 20, Math.sin(a) * d * .8 + 4]], .5, PAL.ink, 'inkfine', .6); }
    boilSeed('nuc'); paint(ellPts(0, 0, 150, 140, 26, 3), { wash: Kc.nucleus, fill: Kc.nucleusLt, fillOp: 90, tex: .5, ink: PAL.ink, sw: 1 });
    const gk = seg(t, 6.7, 7.2);
    if (gk > 0) glow(0, 0, 150, '#9FC3FF', .8 * gk);
    boilSeed('coil'); const C = []; for (let i = 0; i < 60; i++) { const a = i * .55; C.push([Math.cos(a) * (40 + 60 * hash(i)) , Math.sin(a * 1.3) * (40 + 55 * hash(i + 9))]); }
    inkLine(through(C, 3), 1.6 * Math.min(1, 2.2 / Math.max(1, zoomK)), mixCol(Kc.dnaBack, '#CFE0FF', gk), 'ink', .5);
  }
  function shotA(t, lt, dur) {
    const inField = t >= 3.95;
    if (!inField) {
      const push = easeIn(seg(t, 3.55, 3.95)), eye = [1253, 235];
      cam(lerp(960, eye[0], push) + 5 * wob(t, .1), lerp(560, eye[1], push), lerp(1, 7, push));
      boilSeed('wall'); paint(rectPts(-400, -400, W + 800, 1300), { wash: '#F3E3C8', ink: null });
      boilSeed('win'); paint(rrPts(200, 120, 420, 330, 14), { wash: '#CFE6F0', ink: PAL.ink, sw: .9 }); inkLine([[410, 122], [410, 448]], .9, PAL.ink, 'ink', 0);
      boilSeed('bench'); paint(rectPts(-400, 820, W + 800, 500, 3), { wash: '#B98457', fill: '#8A5A35', fillOp: 80, tex: .7, ink: PAL.ink, sw: 1 });
      microscope(1200, 820);
      // Clawd
      let o = talk(t, emotions(t, [[0, 'happy'], [1.8, 'proud'], [2.3, 'idea', { lookX: 1, lookY: -.6 }], [3.05, 'excited', { emote: null }]]));
      if (t > .9 && t < 1.8) o.aR = 1.2 + .45 * Math.sin((t - .9) * 13);
      if (t > 1.82 && t < 2.3) o.aL = -.2;
      let x = 720, y = 820, u = 26;
      if (t > 3.05) { const k = seg(t, 3.1, 3.8), p = arcPt([720, 820], [eye[0], eye[1] + 20], 240, easeIn(k)); x = p[0]; y = p[1]; u = lerp(26, 4, easeIn(k)); o = { ...o, sq: -.15 * Math.sin(k * Math.PI), rot: k * 1.4, noShadow: k > .05 }; }
      if (t < 3.82) clawd(x, y, u, { ...o, view: t > 2.3 && t < 3.05 ? 'q' : 'front', boilKey: 'cA' });
      camEnd();
      if (lt < .6) iris(toScreenFix(720, 700)[0], toScreenFix(720, 700)[1], kf(lt, [[0, 0], [.12, 170], [.3, 190], [.6, 1600]], easeIn));
    } else {
      const c = kf(t, [[3.95, [0, 0, .5]], [6.3, [0, 0, 1.45]], [7.3, [0, 0, 2.4]], [8.6, [0, 0, 2.2]], [10.0, [30, 20, 9]]], ease);
      cam(c[0], c[1], c[2]);
      cellField(t, c[2]);
      for (let i = 0; i < 3; i++) {                               // proteins pop out and wave
        const k = seg(t, 7.5 + i * .18, 7.8 + i * .18); if (k <= 0) continue;
        const a = -.7 + i * .8, p = [Math.cos(a) * 230, Math.sin(a) * 200];
        push(); translate(p[0], p[1] + 6 * Math.sin(t * 6 + i)); scale(.32 * backOut(k)); protein(0, 0, t, 1, { face: 1, happy: true }); pop();
      }
      camEnd();
      if (t < 4.7) { const r = kf(t, [[3.95, 0], [4.7, 1300]], easeOut); irisShape(ellPts(W / 2, H / 2, Math.max(4, r), Math.max(4, r), 48), PAL.ink); }
    }
  }
  function toScreenFix(x, y) { return [x, y]; }

  // =========================== N: the nucleus (10–45.9) ===========================
  const SP = 64, MID = 470, HALF = 62, L0 = HALF - 4, GS = 22;          // base spacing, helix centre, half gap, piece length, gene start
  const TEMPLATE = i => { if (i === GS + 13) return 'A'; return 'ATGC'[Math.floor(hash(i * 3.7 + 1) * 4)]; };   // bottom strand
  const bx = i => i * SP;
  const NMRNA = 20, INTRON = [8, 11];
  // polymerase and transcription schedule
  const mOf = t => t < 26.25 ? 0 : t < 33.0 ? 13 * seg(t, 26.25, 33.0) : t < 34.1 ? 13 : t < 34.55 ? 13 + seg(t, 34.1, 34.55) : 14 + 6 * seg(t, 34.8, 35.7);
  function polX(t) {
    if (t < 22.8) return lerp(500, bx(GS) - 30, ease(seg(t, 21.24, 22.8)));
    if (t < 26.25) return bx(GS) - 30;
    return bx(GS) + mOf(t) * SP - 30;
  }
  const bubbleA = t => 95 * ease(seg(t, 24.15, 25.3)) * (1 - ease(seg(t, 36.2, 37.1)));
  const bubbleX = t => t < 36.0 ? polX(t) : bx(GS) + 20 * SP - 30;
  // mRNA layout after release (free, floating), with splicing
  const FX = bx(GS) - 40, FY = 250, FD = 58;
  const spliceClose = t => ease(seg(t, 42.6, 43.1));
  function freeSlot(j, t) {                                      // slot index along the free mRNA after splicing closes
    if (j < INTRON[0]) return j; if (j > INTRON[1]) return j - 4 * spliceClose(t); return null;
  }
  // the snake path out through the pore: tail → … → cap, then on to the pore
  const PX = 4300, PY = 240;
  let SNAKE = null;
  function snakePath() {
    if (SNAKE) return SNAKE;
    const pts = [];
    for (let s = 15.5; s >= 0; s -= .5) pts.push([FX + s * FD, FY]);
    pts.push([FX - 140, FY - 90], [FX - 40, FY - 230], [FX + 400, FY - 300], [FX + 1200, FY - 250], [PX - 700, PY - 60], [PX - 200, PY], [PX + 200, PY + 10], [PX + 1200, PY + 60]);
    const P = through(pts, 8), acc = [0]; for (let i = 1; i < P.length; i++) acc.push(acc[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    SNAKE = { P, acc, s0: acc[31] ?? 15.5 * FD };                  // s0: where the cap sits before the snake starts
    SNAKE.s0 = 15.5 * FD; return SNAKE;
  }
  function along(s) {
    const { P, acc } = snakePath(); if (s <= 0) return [P[0][0] - s * 0 + s, P[0][1]];
    let i = 1; while (i < acc.length - 1 && acc[i] < s) i++;
    const k = (s - acc[i - 1]) / (acc[i] - acc[i - 1] || 1); return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)];
  }
  const headS = t => snakePath().s0 + 3900 * easeIn(seg(t, 43.75, 45.9)) ** .8;
  // where mRNA nucleotide j is at time t, and the way its piece points
  function mrnaAt(j, t) {
    const m = mOf(t);
    // transcription: paired on the template inside the bubble, or trailing up behind the polymerase
    const tx = bx(GS + j), pairY = MID + HALF - 2 * L0 - 8, px = polX(t);
    let p, n = [0, 1];
    const behind = (px - SP * 1.5) - tx;
    if (behind <= 0) p = [tx, pairY];
    else { const q = behind / SP; p = [tx + 14 * q, pairY - Math.min(190, 38 * q) - 6 * Math.sin(q + t * 2)]; n = [q < 5 ? -.12 : 0, 1]; }
    if (j >= Math.floor(m) && j < NMRNA) {                       // the one docking right now
      const k = frac(m), start = [tx + 140, pairY - 230];
      p = arcPt(start, [tx, pairY], 40, ease(k)); n = [0, 1];
    }
    if (t < 35.9) return { p, n };
    // released: float up into a free wavy line
    const slot = freeSlot(j, t);
    let f;
    if (slot == null) {                                           // the intron: bulges into a loop, snipped, falls away
      const i0 = INTRON[0] - 1, k = (j - INTRON[0] + 1) / 5, a = Math.PI * k, lift = 150 * ease(seg(t, 41.9, 42.35));
      const base = [FX + (i0 + 5 * k) * FD, FY], loop = [FX + (i0 + 2.5) * FD - Math.cos(a) * 2.5 * FD * .8, FY - Math.sin(a) * lift];
      f = [lerp(base[0], loop[0], lift / 150), lerp(base[1], loop[1], 1)];
      const fall = seg(t, 42.45, 43.2); f = [f[0] + 40 * fall, f[1] + 500 * fall * fall];
    } else f = [FX + slot * FD, FY + 16 * Math.sin(slot * .6 + t * 2.2)];
    if (t > 43.75 && slot != null) { const s = headS(t) - slot * FD, a = along(s), b = along(s + 4); const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return { p: a, n: [-(b[1] - a[1]) / d, (b[0] - a[0]) / d] }; }
    const k = ease(seg(t, 35.9, 37.2));
    return { p: [lerp(p[0], f[0], k), lerp(p[1], f[1], k)], n: [lerp(n[0], 0, k), lerp(n[1], 1, k)] };
  }
  function nucleusBackdrop(t) {
    boilSeed('nbg'); paint(rectPts(VIS[0] - 300, -900, VIS[1] - VIS[0] + 600, 2600), { wash: Kc.nucleus, ink: null });
    for (let i = 0; i < 9; i++) { const x = i * 520 - 300 + 60 * wob(t, .05, i * .2); if (!seen(x, 500)) continue; boilSeed('nb' + i); paint(ellPts(x, 150 + 500 * hash(i + 2), 300, 180, 20, 6), { fill: Kc.nucleusLt, fillOp: 90, bleed: .3, tex: .5, ink: null }); }
    boilSeed('nfloor'); paint(rectPts(VIS[0] - 300, 722, VIS[1] - VIS[0] + 600, 900, 3), { wash: '#2C2658', fill: '#4A4088', fillOp: 70, tex: .7, ink: null });
    for (let x = Math.floor(VIS[0] / 1400) * 1400; x < VIS[1]; x += 1400) { boilSeed('nfl' + x); inkLine([[x, 724], [x + 700, 720], [x + 1400, 724]], .8, PAL.ink, 'inkfine', 0); }
    for (let i = 0; i < 12; i++) {                                // free nucleotides drifting (the building blocks)
      const x = (hash(i + 30) * 4200 - 400) + 40 * wob(t, .13, i * .3), y = 60 + 620 * hash(i + 31) + 30 * wob(t, .11, i * .7); if (!seen(x) || Math.abs(y - MID) < 110) continue;
      piece(x, y, t * .4 + i, 'AUGC'[i % 4], 26, 26, { key: 'fl' + i, sw: .5 });
    }
    // the nuclear envelope and its pore, far right
    if (seen(PX, 600)) {
      boilSeed('env');
      paint(rectPts(PX + 40, -900, 1600, 2600), { wash: Kc.cyto, fill: Kc.cytoLt, fillOp: 80, tex: .5, ink: null });
      for (const [y0, y1] of [[-900, PY - 70], [PY + 70, 1700]]) for (const dx of [0, 34]) inkLine([[PX + dx + 10 * Math.sin(y0), y0], [PX + dx - 8, (y0 + y1) / 2], [PX + dx + 6, y1]], 2.4, '#8C6FB8', 'ink', .4);
      paint(ellPts(PX + 17, PY - 70, 30, 16, 12), { wash: '#B99AD8', ink: PAL.ink, sw: .8 }); paint(ellPts(PX + 17, PY + 70, 30, 16, 12), { wash: '#B99AD8', ink: PAL.ink, sw: .8 });
    }
  }
  function dnaLadder(t, h, ph, hl) {                            // h: helix amount (1 helix … 0 ladder)
    const a = bubbleA(t), bxx = bubbleX(t), bw = 3.2 * SP;
    const bump = x => { const d = Math.abs(x - bxx); return d < bw ? .5 + .5 * Math.cos(Math.PI * d / bw) : 0; };
    const wave = x => lerp(1, Math.cos(x * .0095 + ph), h);
    const yT = x => MID - HALF * wave(x) - a * bump(x), yB = x => MID + HALF * wave(x) + .25 * a * bump(x);
    const i0 = Math.max(-20, Math.floor(VIS[0] / SP)), i1 = Math.min(90, Math.ceil(VIS[1] / SP));
    for (let i = i0; i <= i1; i++) {
      const x = bx(i), top = yT(x), bot = yB(x), gap = bot - top, tb = TEMPLATE(i), ob = DPAIR[tb];
      const len = Math.min(L0, Math.abs(gap) / 2 - 4), dir = gap >= 0 ? 0 : Math.PI;
      const H = hl(i) || {};
      const promoter = i >= GS - 4 && i < GS ? seg(t, 22.3, 22.8) * (1 - seg(t, 36, 37)) : 0;
      if (promoter > 0) { boilSeed('prom' + i); glow(x, MID, 70, '#9CF0A8', .7 * promoter); }
      piece(x, top, dir, ob, 30, len, { key: 't' + i, letter: H.top, glow: H.glow });
      piece(x, bot, dir + Math.PI, tb, 30, len, { key: 'b' + i, letter: H.bot, glow: H.glow });
    }
    const T = [], B = []; for (let x = Math.floor(VIS[0] / 16) * 16; x <= VIS[1]; x += 16) { T.push([x, yT(x)]); B.push([x, yB(x)]); }
    for (let s = 0; s < T.length - 1; s += 80) { backbone(T.slice(s, s + 81), 14, Kc.dnaBack, 'T' + s); backbone(B.slice(s, s + 81), 14, Kc.dnaBack, 'B' + s); }
  }
  function drawMRNA(t) {
    const m = mOf(t), shown = t < 35.9 ? Math.min(NMRNA, Math.floor(m) + (frac(m) > 0 ? 1 : 0)) : NMRNA; if (shown <= 0) return;
    const pts = [], dim = seg(t, 38.3, 39.0);
    for (let j = 0; j < shown; j++) {
      const { p, n } = mrnaAt(j, t), base = RNA_OF[TEMPLATE(GS + j)], intron = j >= INTRON[0] && j <= INTRON[1];
      const fade = intron ? 1 - seg(t, 42.9, 43.4) : 1; if (fade <= 0) continue;
      const isU = j === 13, docking = t < 35.9 && j === Math.floor(m);
      piece(p[0], p[1], angOf(n[0], n[1]), base, 30, L0 - 6, { key: 'm' + j, letter: isU ? seg(t, 34.1, 34.4) * (1 - seg(t, 36.5, 37)) : 0, dim: intron ? dim : 0, glow: isU && t > 34.4 && t < 35.4 ? .7 : 0 });
      if (!docking && fade > .5 && !(intron && t > 42.45)) pts.push([p[0] - n[0] * 7, p[1] - n[1] * 7, j]);
    }
    // backbone through the linked ones (split at the snip)
    let seg1 = [], segs = [];
    for (const q of pts) { if (seg1.length && Math.hypot(q[0] - seg1[seg1.length - 1][0], q[1] - seg1[seg1.length - 1][1]) > 2.4 * SP) { segs.push(seg1); seg1 = []; } seg1.push([q[0], q[1]]); }
    segs.push(seg1); segs.forEach((S, i) => { if (S.length > 1) backbone(through(S, 3), 12, Kc.rnaBack, 'mr' + i); });
    return pts;
  }
  function shotN(t, lt, dur) {
    // camera: helix wide → pan → ladder close → follow the polymerase → the free mRNA → chase it to the pore
    let c = kf(t, [[10, [640, 480, .8]], [12.1, [700, 480, .8]], [14.4, [1100, 480, .88]], [15.5, [1184, 500, 2.2]], [18.8, [1184, 500, 2.25]], [19.6, [1150, 500, 1.15]], [21.0, [1150, 470, 1.1]]], ease);
    if (t > 21.0) {
      const px = polX(t), dockX = bx(GS + 13);
      const z = kf(t, [[21, 1.1], [26.2, 1.25], [28.4, 1.25], [28.9, 1.9], [30.4, 1.9], [30.9, 1.4], [31.3, 1.4], [31.8, 1.5], [34.9, 1.55], [35.5, 1.3]], ease);
      const fx = kf(t, [[21, px + 60], [28.4, px + 60], [28.9, px - 20], [30.4, px - 20], [31.3, px + 40], [31.8, dockX + 50], [34.9, dockX + 50], [35.5, px + 60]], ease);
      const fy = kf(t, [[21, 400], [28.4, 400], [28.9, 440], [30.4, 440], [31.3, 400], [31.8, 330], [34.9, 330], [35.5, 400]], ease);
      const f = [t > 21.8 ? fx : lerp(1150, fx, ease(seg(t, 21, 21.8))), t > 21.8 ? fy : lerp(470, fy, ease(seg(t, 21, 21.8))), z]; c = f;
    }
    if (t > 35.6) { const g = [FX + 8 * FD, 300, 1.3]; c = kf(t, [[35.6, [polX(35.6) + 60, 420, 1.3]], [37.2, g], [41.8, [FX + 8.5 * FD, 290, 1.4]], [42.6, [FX + 9 * FD, 280, 1.4]], [43.7, [FX + 7 * FD, 280, 1.25]]], ease); }
    if (t > 43.7) { const h = along(headS(t)); const k = ease(seg(t, 43.7, 44.3)); c = [lerp(c[0], h[0] - 250, k), lerp(c[1], h[1] + 80, k), lerp(c[2], 1.1, k)]; }
    cam(c[0] + 5 * wob(t, .09), c[1] + 4 * wob(t, .07), c[2]);
    nucleusBackdrop(t);
    const h = 1 - ease(seg(t, 14.4, 15.5));
    const ph = t * .5;
    const hl = i => {                                           // A-T then C-G, with their letters
      const at = 18, cg = 19;
      if (i === at) { const k = seg(t, 16.9, 17.2) * (1 - seg(t, 20.2, 20.6)); return { top: k, bot: k, glow: .7 * k }; }
      if (i === cg) { const k = seg(t, 17.85, 18.15) * (1 - seg(t, 20.2, 20.6)); return { top: k, bot: k, glow: .7 * k }; }
      return null;
    };
    dnaLadder(t, h, ph, hl);
    const mp = drawMRNA(t);
    // the processing: cap, tail
    if (t > 40.0 && t < 46.5) {
      const cap = mrnaAt(0, t), capK = seg(t, 40.0, 40.4), drop = (1 - easeIn(capK)) * 260;
      tophat(cap.p[0] - 6, cap.p[1] - 22 - drop, 22, t > 43.75 ? Math.atan2(cap.n[1], cap.n[0]) - Math.PI / 2 : -.2);
      if (capK > 0 && capK < 1) sparkle(cap.p[0], cap.p[1] - 40, 20, capK);
    }
    if (t > 41.3) {
      const last = mrnaAt(NMRNA - 1, t), n = Math.floor(8 * seg(t, 41.3, 41.9)), T = [];
      for (let i = 1; i <= n; i++) { let q; if (t > 43.75) q = along(headS(t) - (15.5 + i * .55) * FD); else q = [last.p[0] + i * 26, last.p[1] + 12 * Math.sin(i * .9 + t * 5)]; T.push(q); }
      T.forEach((q, i) => { boilSeed('tail' + i); paint(ellPts(q[0], q[1], 11, 11, 10), { wash: BC.A, ink: PAL.ink, sw: .6 }); });
    }
    // RNA polymerase, with Clawd riding on top
    let rider = null;
    if (t > 21.0 && t < 37.5) {
      const px = polX(t), gone = seg(t, 35.9, 37.4), gy = MID - 10 - 80 * (1 - seg(t, 21.2, 22.8)) - 700 * easeIn(gone);
      const clampSq = .12 * spring(t, 22.85, 5, 16);
      rider = polymerase(px + 30 + 400 * easeIn(gone), gy, t, { sq: clampSq, happy: t > 35.6, lx: .7, ly: .6 });
    }
    // the T that doesn't belong, and the U that does
    if (t > 32.7 && t < 34.4) {
      const k1 = seg(t, 32.7, 33.45), away = seg(t, 33.5, 34.3);
      const dock = [bx(GS + 13), MID + HALF - 2 * L0 - 8], start = [dock[0] + 260, dock[1] - 300];
      const p = away > 0 ? arcPt(arcPt(start, dock, 40, ease(.8)), [dock[0] + 500, dock[1] - 520], 60, easeOut(away)) : arcPt(start, dock, 40, ease(k1) * .8);
      piece(p[0], p[1], away * 9, 'T', 30, L0 - 6, { key: 'wrongT', letter: seg(t, 32.9, 33.1) });
    }
    // Clawd: on the floor, then riding the polymerase, then surfing the mRNA
    const u = 20;
    let o = talk(t, emotions(t, [[10, 'surprised', { emote: null }], [10.9, 'happy'], [12.1, 'hopeful', { lookX: .6, lookY: -1 }], [16.9, 'excited', { emote: null, lookX: .5, lookY: -1 }],
      [19.2, 'determined'], [21.3, 'surprised', { lookX: -1 }], [22.6, 'happy'], [26.3, 'neutral', { lookX: .4, lookY: 1 }], [28.55, 'thinking', { lookX: .6, lookY: 1, emote: null }],
      [32.9, 'suspicious', { lookX: 1, lookY: -.3 }], [33.5, 'determined'], [34.2, 'proud', { emote: null }], [35.8, 'excited', { emote: null }],
      [40.1, 'happy'], [42.3, 'determined'], [42.6, 'proud', { emote: null }], [43.7, 'excited', { emote: null }]]));
    let x, y, uu = u, view = 'front', rot = 0;
    if (t < 21.9) {
      x = kf(t, [[10, 500], [12.1, 520], [14.4, 1040], [19, 1060]], ease); y = 722;
      if (t < 10.6) { const k = seg(t, 10.0, 10.6); y = lerp(-80, 722, easeIn(k)); o.sq += k > .98 ? 0 : -.1; }
      o.sq += .25 * Math.exp(-(t - 10.6) * 8) * (t > 10.6 ? 1 : 0);
      if (t > 12.1 && t < 14.4) { o.walk = (x - 520) / 60; view = 'q'; }
      if (t > 16.9 && t < 18.6) o.aR = 1.2;
      if (t > 19.2 && t < 21.0) o.aL = 1.5 + .05 * Math.sin(t * 8);
      if (t > 21.25) { const k = seg(t, 21.3, 21.9); const top = polymerase ? null : null; }
    }
    if (t >= 21.9 && t < 36.0 && rider) {
      if (t < 22.5) { const k = seg(t, 21.9, 22.5); const p = arcPt([1060, 722], rider, 240, ease(k)); x = p[0]; y = p[1]; uu = lerp(20, 17, k); }
      else { x = rider[0]; y = rider[1] + 6; uu = 17; }
      o.noShadow = true;
      if (t > 33.4 && t < 33.65) o.aR = lerp(1.3, -1.0, seg(t, 33.4, 33.6));
      if (t > 33.7 && t < 34.15) o.aR = .5;
    }
    if (t >= 36.0) {                                               // hop onto the free mRNA and surf it
      const j = 3, s = mrnaAt(j, t), onK = seg(t, 36.0, 36.6);
      const surf = [s.p[0] - s.n[0] * 12, s.p[1] - s.n[1] * 12];
      const from = [polX(35.95) + 30, MID - 290];
      const p = onK < 1 ? arcPt(from, surf, 120, ease(onK)) : surf; x = p[0]; y = p[1]; uu = 17; o.noShadow = true;
      rot = onK >= 1 ? Math.atan2(s.n[1], s.n[0]) - Math.PI / 2 : 0;
      if (t > 42.1 && t < 42.6) o.aR = lerp(.2, 1.1, seg(t, 42.1, 42.3)) - 1.3 * seg(t, 42.4, 42.5);
      if (t > 45.1) { o.sq += .35 * Math.sin(seg(t, 45.1, 45.6) * Math.PI); }
    }
    const scissors = t > 42.0 && t < 42.8;
    clawd(x, y, uu, { ...o, view, rot, boilKey: 'cN',
      armR: (t > 16.8 && t < 21) || (t > 26 && t < 33) ? (u2, sw) => inkLine([[0, 0], [2.6 * u2, 0]], sw * .9, '#8A5A35', 'ink', 0)
        : t > 33.7 && t < 34.12 ? (u2, sw) => piece(1.2 * u2, 0, -Math.PI / 2, 'U', 30, L0 - 6, { key: 'heldU', letter: 1 })
        : scissors ? (u2, sw) => { const op = .5 * Math.abs(Math.sin(t * 16)); for (const s of [-1, 1]) { push(); rotate(s * op); inkLine([[0, 0], [2.4 * u2, 0]], sw * 1.1, '#8B8EA6', 'ink', 0); paint(ellPts(-.3 * u2, s * .35 * u2, .35 * u2, .25 * u2, 10), { wash: '#C94F5F', ink: PAL.ink, sw: sw * .5 }); pop(); } } : null });
    if (t > 42.4 && t < 42.9) sparkle(FX + 8.5 * FD, FY - 80, 30, seg(t, 42.45, 42.85));
    camEnd();
  }

  // =========================== C: the cytoplasm (45.9–78.55) ===========================
  const MY = 660, SP2 = 58, LC = 46, LA = 36;
  const CSEQ = 'GAUCCA' + 'AUG' + 'GCU' + 'UUC' + 'GGA' + 'CAU' + 'AGC' + 'UAA' + 'CGA';
  const MX0 = t => lerp(-1400, 120, easeOut(seg(t, 45.9, 47.4)));
  const cX = (c, t) => MX0(t) + (7 + 3 * c) * SP2;               // centre of codon c (c = 0 is AUG)
  const DOCKY = MY - LC - LA - 4;
  // ribosome P-site codon (float): scan to AUG, then shift after each bond
  const SHIFTS = [67.94, 70.45, 71.3, 72.05, 72.65];
  const ribR = t => { if (t < 49.4) return -1.6; if (t < 51.9) return lerp(-1.6, 0, ease(seg(t, 49.4, 51.9))); let r = 0; SHIFTS.forEach((s, i) => { r += ease(seg(t, s, s + (i ? .2 : .45))); }); return r; };
  // tRNA k (k = 0 is Met, docks in the P site first); arrive, sit, leave after the next shift
  const ARRIVE = [[58.5, 59.6], [62.9, 64.0], [69.5, 70.1], [70.75, 71.05], [71.55, 71.85], [72.3, 72.55]];
  const BONDS = [[65.6, 66.3], [70.2, 70.4], [71.1, 71.25], [71.88, 72.0], [72.58, 72.64]];      // chain moves from tRNA k to k+1
  const LEAVE = [68.1, 70.5, 71.35, 72.1, 72.7, 73.2];
  const codonOf = c => CSEQ.slice(6 + 3 * c, 9 + 3 * c).split('');
  function cytoBackdrop(t) {
    boilSeed('cbg'); paint(rectPts(VIS[0] - 300, -900, VIS[1] - VIS[0] + 600, 2600), { wash: Kc.cyto, ink: null });
    for (let i = 0; i < 8; i++) { const x = i * 520 - 200 + 40 * wob(t, .05, i * .3); if (!seen(x, 500)) continue; boilSeed('cb' + i); paint(ellPts(x, 180 + 520 * hash(i + 8), 280, 150, 20, 6), { fill: Kc.cytoLt, fillOp: 110, bleed: .3, tex: .5, ink: null });
      boilSeed('er' + i); inkLine([...Array(9)].map((_, k) => [x - 200 + k * 50, 120 + 600 * hash(i + 3) + 18 * Math.sin(k * 1.2 + t)]), 2, '#E9B08E', 'ink', .6); }
    boilSeed('cfloor'); paint(rectPts(VIS[0] - 300, 842, VIS[1] - VIS[0] + 600, 800, 3), { wash: '#E7B98F', fill: '#D39B6E', fillOp: 70, tex: .7, ink: null });
    for (let x = Math.floor(VIS[0] / 1400) * 1400; x < VIS[1]; x += 1400) { boilSeed('cfl' + x); inkLine([[x, 844], [x + 700, 840], [x + 1400, 844]], .8, PAL.ink, 'inkfine', 0); }
    if (seen(-400, 600)) { boilSeed('env2'); paint(rectPts(-2400, -900, 1900, 2600), { wash: Kc.nucleus, ink: null }); for (const dx of [0, 34]) { inkLine([[-500 + dx, -900], [-510 + dx, PY2 - 70]], 2.4, '#8C6FB8', 'ink', .4); inkLine([[-500 + dx, PY2 + 70], [-490 + dx, 1700]], 2.4, '#8C6FB8', 'ink', .4); } }
  }
  const PY2 = 420;
  function shotC(t, lt, dur) {
    const r = ribR(t);
    const ribX = t2 => cX(ribR(t2), t2) + SP2 * 1.5;
    let c = kf(t, [[45.9, [200, 520, 1.0]], [47.4, [600, 560, 1.35]], [48.4, [ribX(48.4) + 150, 560, 1.5]]], ease);
    if (t > 48.4) c = [ribX(t) + 150, 560, 1.55];
    if (t > 51.7 && t < 54.0) { const k = Math.sin(Math.PI * seg(t, 51.8, 54.0)) ** .6; c = [lerp(c[0], cX(0, t), k), lerp(c[1], 610, k), lerp(c[2], 2.5, k)]; }
    if (t > 54.0 && t < 56.3) c[0] += 520 * Math.sin(Math.PI * seg(t, 54.0, 56.2));
    if (t > 73.0) { c = kf(t, [[73.0, [ribX(73) + 150, 560, 1.55]], [74.2, [ribX(73) + 120, 470, 1.6]]], ease); }
    cam(c[0] + 5 * wob(t, .09), c[1] + 4 * wob(t, .07), c[2]);
    cytoBackdrop(t);
    const x0 = MX0(t);
    const split = seg(t, 73.12, 73.6), riboIn = seg(t, 48.49, 49.3);
    const rx = ribX(t);
    if (riboIn > 0) ribosomeLarge(rx + 380 * easeIn(split), MY - 170 - 320 * (1 - ease(riboIn)) - 500 * easeIn(split), t, { happy: t > 64.0 && t < 65.4, oh: t > 72.9 && t < 73.5, lx: .5, ly: .7 });
    // tRNAs
    const chainOwner = t => { let k = 0; BONDS.forEach(([a, b], i) => { if (t > b) k = i + 1; }); return k; };
    const trPos = (k, t2) => {
      const [a0, a1] = ARRIVE[k]; if (t2 < a0) return null;
      const site = k;                                              // the codon it reads
      const dock = [cX(site, t2), DOCKY];
      if (t2 < a1) { const q = seg(t2, a0, a1); return { p: arcPt([dock[0] + 380, dock[1] - 520], dock, 60, ease(q)), rot: .5 * (1 - q) }; }
      const lv = LEAVE[k]; if (t2 > lv) { const q = seg(t2, lv, lv + .7); if (q >= 1) return null; return { p: arcPt(dock, [dock[0] - 420, dock[1] - 560], 40, easeIn(q)), rot: -.5 * q, a: 1 - q }; }
      return { p: dock, rot: 0 };
    };
    const owner = chainOwner(t);
    for (let k = 0; k < ARRIVE.length; k++) {
      const s = trPos(k, t); if (!s) continue;
      const anti = codonOf(k).map(b => RPAIR[b]);
      const docked = t > ARRIVE[k][1];
      trna(s.p[0], s.p[1], anti, t, { key: 'k' + k, rot: s.rot, happy: docked && t < ARRIVE[k][1] + .6, seed: k, letters: k === 0 ? seg(t, 59.6, 59.9) * (1 - seg(t, 62, 62.4)) : 0 });
      if (k === 1 && t > 64.0 && t < 64.6) sparkle(s.p[0] + 60, s.p[1] - 40, 26, seg(t, 64.0, 64.6));
      if (k > owner - 0 && !(k === owner)) { const ac = acceptor(s.p[0], s.p[1], s.rot); bead(ac[0], ac[1] - 18, k); }
    }
    // the wrong tRNA: tries, bumps, bounces away
    if (t > 60.7 && t < 63.3) {
      const dock = [cX(1, t), DOCKY - 18], q1 = seg(t, 60.7, 62.25), q2 = seg(t, 62.35, 63.3);
      const p = q2 > 0 ? arcPt(dock, [dock[0] + 520, dock[1] - 480], 100, easeOut(q2)) : arcPt([dock[0] + 420, dock[1] - 520], dock, 50, ease(q1));
      trna(p[0], p[1], ['G', 'G', 'U'], t, { key: 'wrong', rot: q2 * 2.5 + .3 * (1 - q1), sad: q2 > 0, seed: 7 });
      const ac = acceptor(p[0], p[1], q2 * 2.5 + .3 * (1 - q1)); bead(ac[0], ac[1] - 18, 9);
      if (t > 62.25 && t < 62.6) { boilSeed('bump'); emote('!?', dock[0] + 90, dock[1] - 200, 16, seg(t, 62.25, 62.35), t - 62.25); }
    }
    // the growing chain, hanging from the tRNA that owns it
    if (t > 59.0 && t < 73.3) {
      const own = trPos(owner, t) || trPos(Math.max(0, owner - 1), t);
      let anchor = own ? acceptor(own.p[0], own.p[1], own.rot) : null;
      const bIdx = owner < BONDS.length ? owner : -1;
      if (bIdx >= 0 && t > BONDS[bIdx][0] && t <= BONDS[bIdx][1]) { const nx = trPos(owner + 1, t); if (nx && anchor) { const a2 = acceptor(nx.p[0], nx.p[1], nx.rot); const q = ease(seg(t, BONDS[bIdx][0], BONDS[bIdx][1])); anchor = [lerp(anchor[0], a2[0], q), lerp(anchor[1], a2[1], q)]; } }
      if (anchor) for (let i = 0; i <= owner; i++) { const d = owner - i; bead(anchor[0] - 26 * d - 8 * Math.sin(d * 1.4 + t * 2), anchor[1] - 18 - 34 * d, i); if (d > 0) { boilSeed('bond' + i); inkLine([[anchor[0] - 26 * d - 8 * Math.sin(d * 1.4 + t * 2), anchor[1] - 18 - 34 * d], [anchor[0] - 26 * (d - 1) - 8 * Math.sin((d - 1) * 1.4 + t * 2), anchor[1] - 18 - 34 * (d - 1)]], 1.4, PAL.ink, 'ink', 0); } }
    }
    // the mRNA: gold backbone, bases pointing up, cap on the left, tail on the right
    const n = CSEQ.length, BP = [];
    for (let j = 0; j < n; j++) {
      const x = x0 + j * SP2; BP.push([x, MY + 10]); if (!seen(x)) continue;
      const c = Math.floor((j - 6) / 3), start = j >= 6 && j < 9, stop = c === 6;
      const letter = start ? seg(t, [52.16, 52.63, 53.11][j - 6], [52.16, 52.63, 53.11][j - 6] + .2) * (1 - seg(t, 57.5, 58)) : stop ? seg(t, 72.8, 73.0) * (1 - seg(t, 74.5, 75)) : 0;
      const gl = start ? .8 * letter : stop ? .8 * seg(t, 72.8, 73.0) * (1 - seg(t, 74.5, 75)) : (c === 1 && t > 56.07 && t < 58.2 ? .6 : 0);
      piece(x, MY, Math.PI, CSEQ[j], 36, LC, { key: 'c' + j, letter, glow: gl, gcol: PAL.ink, gsw: 1.5, col: stop && t > 72.8 ? mixCol(BC[CSEQ[j]], '#D8394E', .35) : undefined });
    }
    for (let s = 0; s < BP.length - 1; s += 12) backbone(BP.slice(s, s + 13), 12, Kc.rnaBack, 'cm' + s);
    tophat(x0 - 30, MY - 12, 22, -.25);
    for (let i = 1; i <= 8; i++) { boilSeed('ct' + i); paint(ellPts(x0 + (n - 1) * SP2 + i * 26, MY + 10 + 10 * Math.sin(i + t * 4), 11, 11, 10), { wash: BC.A, ink: PAL.ink, sw: .6 }); }
    // codon brackets: three at a time
    for (let cc = 0; cc < 7; cc++) { const k = seg(t, 54.1 + cc * .2, 54.35 + cc * .2) * (1 - seg(t, 58.3, 58.8)); bracket(cX(cc, t) - 1.4 * SP2, cX(cc, t) + 1.4 * SP2, MY + 44, k, PAL.ink, cc === 1 && t > 56.07 ? .5 : 0); }
    if (riboIn > 0) ribosomeSmall(rx - 380 * easeIn(split), MY + 72 + 300 * (1 - ease(riboIn)) + 500 * easeIn(split));
    // released chain folds into a working protein; it snaps a sugar in two
    if (t > 73.3) {
      const home = [ribX(73) + 40, 380], fold = seg(t, 74.26, 75.9), face = seg(t, 76.19, 76.5), chomp = t > 76.9 && t < 77.4 ? Math.sin(seg(t, 76.9, 77.4) * Math.PI) : 0;
      push(); translate(home[0] + 10 * wob(t, .4), home[1] + 8 * wob(t, .3, .2)); scale(1.35); protein(0, 0, t, fold, { face, happy: t > 77.4, chomp, sq: .1 * chomp }); pop();
      if (t > 76.4) {
        const sug = seg(t, 76.4, 77.0), brk = seg(t, 77.15, 77.8);
        for (const sd of brk > 0 ? [-1, 1] : [0]) { boilSeed('sugar' + sd); const hx = home[0] + 320 - 170 * ease(sug) + sd * 140 * easeOut(brk), hy = home[1] - 40 + sd * 40 * easeOut(brk) - 60 * brk; paint(starPts(hx, hy, brk > 0 ? 18 : 26, .86, 6, .2 + sd * brk * 2), { wash: '#FFF3D6', ink: PAL.ink, sw: .8 }); }
        if (brk > 0) sparkle(home[0] + 130, home[1] - 40, 40, brk);
      }
    }
    // Clawd, on the floor to the right, the host
    let o = talk(t, emotions(t, [[45.9, 'excited', { emote: null }], [46.5, 'happy'], [48.5, 'surprised', { lookX: -1, lookY: -.4 }], [49.3, 'hopeful', { lookX: -1, lookY: -.3 }],
      [52.1, 'excited', { emote: null, lookX: -1 }], [54.1, 'thinking', { lookX: -.4, lookY: -.2, emote: null }], [56.1, 'neutral', { lookX: -1, lookY: -.2 }],
      [58.6, 'hopeful', { lookX: -1, lookY: -.9 }], [62.3, 'surprised', { lookX: -.5, lookY: -1 }], [62.8, 'laugh'], [64.05, 'happy'], [65.5, 'neutral', { lookX: -1, lookY: -.8 }],
      [68.0, 'excited', { emote: null }], [71.2, 'determined', { lookX: -1 }], [73.1, 'surprised', { lookX: -.6, lookY: -1 }], [74.3, 'hopeful', { lookX: -.6, lookY: -1 }], [76.2, 'starstruck'], [77.4, 'excited', { emote: null }]]));
    let x = c[0] + 510, y = 842;
    if (t < 46.9) { const k = seg(t, 45.95, 46.9), p = arcPt([-480, PY2], [c[0] + 510, 842], 260, ease(k)); x = p[0]; y = p[1]; o.rot = (1 - k) * -3; o.noShadow = k < .95; }
    if (t > 46.4 && t < 48.2) { o.aL = 1.35; o.aR = 1.35; }
    if (t > 52.1 && t < 53.4) o.aL = .9;
    clawd(x, y, 18, { ...o, flip: true, view: t > 49 && t < 76 ? 'q' : 'front', boilKey: 'cC' });
    camEnd();
    if (lt < .35) { boilSeed('poreFlash'); flash(.5 * (1 - lt / .35), '#FFF1DC'); }
    if (t > 78.25) brushWipe((t - 78.25) / .6, [PAL.teal, PAL.sky]);
  }

  // =========================== S: the summary board (78.55–88) ===========================
  function shotS(t, lt, dur) {
    cam(960 + 4 * wob(t, .1), 540, 1.0 + .03 * seg(t, 78.55, 88));
    boilSeed('board'); paint(rectPts(-300, -300, W + 600, H + 600), { wash: '#FBF3E4', ink: null });
    boilSeed('boardB'); paint(ellPts(960, 420, 900, 300, 26, 8), { fill: '#EAF3EF', fillOp: 120, bleed: .3, tex: .5, ink: null });
    push(); translate(960, 420); scale(1.3); translate(-960, -420);
    const g1 = seg(t, 79.9, 80.3), g2 = seg(t, 81.29, 81.7), g3 = seg(t, 83.2, 83.6);
    // DNA icon
    boilSeed('iD'); if (g1) glow(430, 420, 200, '#9FC3FF', .6 * g1);
    const DT = [], DB = []; for (let i = 0; i <= 24; i++) { const x = 290 + i * 12, w = Math.cos(i * .45 + t * 1.5) * 50; DT.push([x, 420 - w]); DB.push([x, 420 + w]); }
    for (let i = 1; i < 24; i += 2) inkLine([DT[i], DB[i]], 1.4, ['#F08A4B', '#3AA5A0', '#7DB35A', '#8E6BC4'][i % 4], 'ink', 0);
    backbone(DT, 12, Kc.dnaBack, 'sdt'); backbone(DB, 12, Kc.dnaBack, 'sdb');
    // mRNA icon
    if (g2) glow(960, 420, 190, '#FFD27A', .6 * g2);
    const MR = []; for (let i = 0; i < 7; i++) { const x = 830 + i * 44, y = 440 + 14 * Math.sin(i * .9 + t * 2); MR.push([x, y]); piece(x, y, Math.PI, 'AUGCUAG'[i], 26, 34, { key: 'sm' + i }); }
    backbone(MR, 11, Kc.rnaBack, 'smr'); tophat(806, 430, 18, -.2);
    // protein icon
    if (g3) glow(1500, 420, 190, '#FFB870', .6 * g3);
    push(); translate(1500, 420 + 8 * wob(t, .5)); scale(.8 + .1 * pulse(t, 4) * g3); protein(0, 0, t, 1, { face: 1, happy: t > 83.4 }); pop();
    arrow(600, 420, 790, 420, seg(t, 80.4, 81.1), -70);
    arrow(1130, 420, 1360, 420, seg(t, 82.2, 82.9), -70);
    pop();
    // everyone waves goodbye
    const bye = seg(t, 84.6, 85.0);
    if (bye > 0) {
      push(); translate(260, 900 + 400 * (1 - backOut(bye))); scale(.55); polymerase(0, 0, t, { happy: true, bob: 0 }); pop();
      push(); translate(1680, 860 + 400 * (1 - backOut(bye))); scale(.42); ribosomeLarge(0, 0, t, { happy: true }); pop();
    }
    let o = talk(t, emotions(t, [[78.55, 'happy'], [79.9, 'neutral', { lookX: -1, lookY: -.8 }], [81.3, 'hopeful', { lookX: 0, lookY: -1 }], [83.2, 'excited', { emote: null, lookX: 1, lookY: -.8 }], [84.65, 'love']]));
    if (t > 79.9 && t < 81.3) o.aL = 1.0;
    if (t > 83.2 && t < 84.6) o.aR = 1.0;
    if (t > 84.7) o.aR = 1.15 + .45 * Math.sin((t - 84.7) * 13);
    clawd(960, 930, 26, { ...o, boilKey: 'cS' });
    const at = toScreen(960, 930 - 4 * 26);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [PAL.teal, PAL.sky]);
    if (t > 86.3) iris(at[0], at[1], kf(t, [[86.3, 1500], [86.9, 260], [87.5, 240], [87.97, 0]], ease));
  }

  shots([[0, shotA], [10.0, shotN], [45.9, shotC], [78.55, shotS]]);
})();

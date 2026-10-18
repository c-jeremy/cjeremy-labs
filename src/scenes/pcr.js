// pcr.js: "Clawd讲PCR", 149.5 s. Clawd climbs into a PCR tube and runs the copier: denature, anneal, extend; then the
// exam traps: the target-length product first appears in cycle 3 (2ⁿ − 2n after n cycles), primers with a 5′ tail
// still need 3 cycles for a full double-stranded product, tails only go on the 5′ end, and n cycles use 2ⁿ⁺¹ − 2 primers.
// Every strand on the board comes out of one copy rule (build()), so the products are computed, not placed by hand.
// Timings follow the narration (audio/vo_pcr.mjs → VO_ENV). See storyboards/pcr.md.
(() => {
  // ---------- palette ----------
  const PC = {
    tmpl: '#5B7FC7', neu: '#E8A33D', F: '#5FAE5A', R: '#9A72CF', tail: '#E0566C', tailLt: '#F09AA6',
    taq: '#EE7A45', taqDk: '#B9502A', flame: '#FFC94D', heli: '#A9AECB', heliDk: '#6E7598', card: '#FBF3E2',
    chalk: '#FFF8E6', wall: '#F3E3C8', wood: '#B98457', woodDk: '#8A5A35', mach: '#9DB8A8', machDk: '#6F8F7E', screen: '#3E4B5A'
  };
  const BASE = ['#F08A4B', '#3AA5A0', '#7DB35A', '#8E6BC4'];
  const talk = (t, o) => ({ ...o, sq: (o.sq || 0) + .035 * voAt(t) });
  let VIS = [-1e9, 1e9];
  function cam(cx, cy, z) { camBegin(cx, cy, z); VIS = [cx - W / 2 / z - 200, cx + W / 2 / z + 200]; }

  // ---------- painted marks: digits, n, +, −, prime (brush strokes that boil with the linework) ----------
  const GL = {
    '2': [[[[-.3, -.24], [-.18, -.42], [.02, -.48], [.22, -.4], [.3, -.2], [.2, .02], [-.32, .46]], .5], [[[-.32, .46], [.34, .46]], 0]],
    '3': [[[[-.3, -.36], [-.08, -.48], [.18, -.44], [.3, -.28], [.22, -.08], [-.02, 0]], .6], [[[-.02, 0], [.24, .08], [.34, .26], [.2, .44], [-.06, .48], [-.32, .36]], .6]],
    '5': [[[[.3, -.46], [-.24, -.46], [-.28, -.04]], 0], [[[-.28, -.04], [-.04, -.12], [.2, -.06], [.33, .14], [.26, .38], [.02, .48], [-.3, .38]], .5]],
    '1': [[[[-.18, -.28], [.04, -.48], [.04, .48]], 0]],
    n: [[[[-.24, -.1], [-.24, .46]], 0], [[[-.24, .06], [-.1, -.08], [.1, -.12], [.24, 0], [.24, .46]], .5]],
    '-': [[[[-.3, 0], [.3, 0]], 0]],
    '+': [[[[-.3, 0], [.3, 0]], 0], [[[0, -.3], [0, .3]], 0]],
    "'": [[[[.08, -.5], [-.06, -.16]], 0]]
  };
  function glyph(ch, x, y, s, col = PAL.ink, sw = 1.4) {
    for (const [P, c] of GL[ch] || []) inkLine(P.map(([a, b]) => [x + a * s, y + b * s]), sw, col, 'ink', c);
  }
  // a 5′ or 3′ end mark, popping in with k
  function endMark(d, x, y, s, k, col = PAL.ink, key = '') {
    if (k <= .02) return; boilSeed('em' + key);
    const p = backOut(clamp(k)); push(); translate(x, y); scale(p);
    glyph(d, -s * .14, 0, s, col, clamp(s / 20, 1, 2.6)); glyph("'", s * .34, -s * .12, s * 1.15, col, clamp(s / 16, 1.2, 3));
    pop();
  }
  // a formula: items [ch, size, dx, dy] in units of s; each pops at its own time
  function formula(items, times, x, y, s, t, col = PAL.ink) {
    items.forEach(([ch, sz, dx, dy], i) => {
      const k = seg(t, times[i], times[i] + .3); if (k <= 0) return;
      boilSeed('fm' + i + ch); push(); translate(x + dx * s, y + dy * s); scale(backOut(k)); glyph(ch, 0, 0, s * sz, col, clamp(s * sz / 20, 1.2, 3.4)); pop();
    });
  }
  function card(x, y, w, h, k, key) {                            // a cream paper card, unfolding
    if (k <= 0) return; boilSeed('card' + key);
    const q = backOut(k), hw = w / 2 * q, hh = h / 2 * Math.min(1, q * 1.1);
    paint(rrPts(x - hw, y - hh, 2 * hw, 2 * hh, 22, 3), { wash: PC.card, fill: '#EBDDC2', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.3 });
  }
  function check(x, y, s, k, key) { if (k <= 0) return; boilSeed('ck' + key); const q = clamp(k * 1.6); const P = [[-.5, 0], [-.12, .4], [.6, -.55]].map(([a, b]) => [x + a * s, y + b * s]); inkLine(q < .5 ? [P[0], [lerp(P[0][0], P[1][0], q * 2), lerp(P[0][1], P[1][1], q * 2)]] : [P[0], P[1], [lerp(P[1][0], P[2][0], q * 2 - 1), lerp(P[1][1], P[2][1], q * 2 - 1)]], 3.4, '#3E9A4E', 'ink', 0); }
  function cross(x, y, s, k, key) { if (k <= 0) return; boilSeed('cx' + key); const a = clamp(k * 2), b = clamp(k * 2 - 1); inkLine([[x - s * .45, y - s * .45], [x - s * .45 + s * .9 * a, y - s * .45 + s * .9 * a]], 3.4, '#D2413F', 'ink', 0); if (b > 0) inkLine([[x + s * .45, y - s * .45], [x + s * .45 - s * .9 * b, y - s * .45 + s * .9 * b]], 3.4, '#D2413F', 'ink', 0); }
  function sparkle(x, y, r, k, col = PAL.cream) { if (k > 0 && k < 1) paint(starPts(x, y, r * backOut(k) * (1 - k * .5), .28, 4, k * 1.5), { wash: col, washOp: 255 * (1 - k * k), ink: null }); }
  function scissors(x, y, s, k, t, key) {                       // the restriction site's mark
    if (k <= 0) return; boilSeed('sc' + key);
    push(); translate(x, y); scale(backOut(clamp(k)) * s / 20); const op = .22 + .16 * Math.abs(Math.sin(t * 5));
    for (const sd of [-1, 1]) {
      push(); rotate(sd * op);
      paint([[-3, 4], [3, 4], [2, -30], [0, -36], [-2, -30]].map(([a, b]) => [a + sd * 2, b]), { wash: '#C9CCDA', ink: PAL.ink, sw: .8 });
      paint(ellPts(sd * 4, 16, 7, 9, 12), { wash: PC.tail, ink: PAL.ink, sw: .8 }); paint(ellPts(sd * 4, 16, 3, 4.5, 8), { wash: PAL.cream, ink: null });
      pop();
    }
    paint(ellPts(0, 3, 2.4, 2.4, 8), { wash: PAL.ink, ink: null });
    pop();
  }

  // ---------- characters ----------
  function eyesAt(x, y, s, o = {}) {
    const bl = o.blink || 0;
    for (const sd of [-1, 1]) {
      const ex = x + sd * s * .55;
      if (o.happy || bl > .7) inkLine([[ex - s * .25, y + s * .05], [ex, y - s * .2], [ex + s * .25, y + s * .05]], clamp(s / 14, .5, 1.3), PAL.ink, 'ink', .7);
      else { paint(ellPts(ex, y, s * .28, s * .38 * (1 - bl), 12), { wash: PAL.cream, ink: PAL.ink, sw: clamp(s / 20, .4, 1) }); paint(ellPts(ex + (o.lx || 0) * s * .1, y + (o.ly || 0) * s * .14, s * .14, s * .18, 10), { wash: PAL.ink, ink: null }); }
    }
    if (o.sad) inkLine([[x - s * .28, y + s * .6], [x, y + s * .48], [x + s * .28, y + s * .6]], clamp(s / 16, .5, 1.2), PAL.ink, 'ink', .7);
    else if (o.o) paint(ellPts(x, y + s * .55, s * .14, s * .18, 10), { wash: '#5E2440', ink: PAL.ink, sw: .6 });
    else inkLine([[x - s * .3, y + s * .45], [x, y + s * .62], [x + s * .3, y + s * .45]], clamp(s / 16, .5, 1.2), PAL.ink, 'ink', .7);
  }
  const blinkAt = (t, sd) => { const f = frac((t + sd) / 3.1); return f < .045 ? Math.sin(f / .045 * Math.PI) : 0; };
  // Taq polymerase: a heat-loving coral blob with a flame tuft. (x, y) = its centre, s = scale, faces +x (flip for -x)
  function taq(x, y, s, t, o = {}) {
    if (s < .02) return; boilSeed('taq' + (o.key ?? ''));
    push(); translate(x, y); rotate(o.rot || 0); scale(s * (o.flip ? -1 : 1), s * (1 - (o.sq || 0)));
    const fl = 1 + .14 * Math.sin(t * 9 + (o.seed || 0) * 2.1), fl2 = 1 + .14 * Math.sin(t * 11 + 1 + (o.seed || 0));
    paint([[-24, -36], [-34, -66 * fl], [-12, -54], [-2, -86 * fl2], [12, -54], [30, -70 * fl], [24, -36]], { wash: PC.flame, ink: PAL.ink, sw: .9, curv: .4 });
    const P = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; P.push([Math.cos(a) * 52 * (1 + .05 * Math.sin(a * 3 + t * 2)), Math.sin(a) * 42]); }
    paint(P, { wash: PC.taq, fill: PC.taqDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1, curv: .3 });
    paint(ellPts(-14, -20, 18, 9, 10), { fill: '#FFC2A0', fillOp: 130, ink: null });
    eyesAt(14, -4, 22, { blink: blinkAt(t, o.seed || 0), lx: .7, ly: o.ly ?? .3, happy: o.happy, sad: o.sad, o: o.oh });
    pop();
  }
  // helicase: a grey wedge that wants to pry the strands apart (and isn't needed)
  function helicase(x, y, s, t, o = {}) {
    if (s < .02) return; boilSeed('heli');
    push(); translate(x, y); scale(s);
    paint([[-70, 0], [40, -48], [62, -10], [60, 22], [40, 46]], { wash: PC.heli, fill: PC.heliDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1, curv: .2 });
    eyesAt(22, -6, 22, { blink: blinkAt(t, 2), lx: -.8, ly: .2, sad: o.sad, happy: false });
    pop();
  }
  // a swim ring around Clawd's legs (the tube is full of water): back half, then Clawd, then the front half
  function buoy(x, y, u, front) {
    boilSeed('buoy' + (front ? 'f' : 'b'));
    const rx = 6.6 * u, ry = 1.8 * u, th = 1.25 * u, n = 12, cx = x, cy = y - 2.4 * u;
    for (let i = 0; i < n; i++) {
      const a0 = (front ? 0 : Math.PI) + i / n * Math.PI, a1 = a0 + Math.PI / n, P = [];
      for (let k = 0; k <= 3; k++) { const a = lerp(a0, a1, k / 3); P.push([cx + Math.cos(a) * (rx + th / 2), cy + Math.sin(a) * (ry + th / 2)]); }
      for (let k = 3; k >= 0; k--) { const a = lerp(a0, a1, k / 3); P.push([cx + Math.cos(a) * (rx - th / 2), cy + Math.sin(a) * (ry - th / 2) * .6]); }
      paint(P, { wash: i % 2 ? PAL.cream : PC.tail, ink: PAL.ink, sw: clamp(u / 18, .5, 1.2) });
    }
  }
  function floatClawd(x, y, u, o, t) {                        // screen space: Clawd bobbing in its ring
    const bob = 5 * Math.sin(t * 2.1);
    buoy(x, y + bob, u, false);
    clawd(x, y + bob, u, { ...o, noShadow: true, boilKey: o.boilKey || 'host' });
    buoy(x, y + bob, u, true);
  }
  function helix(x, y, s, t, key, glowK = 0) {                 // a little DNA (the thing Clawd wants copies of)
    boilSeed('hx' + key);
    if (glowK > 0) glow(x, y, 60 * s, '#FFE7A0', glowK);
    const A = [], B = []; for (let i = 0; i <= 10; i++) { const xx = x + (i - 5) * 7 * s, w = Math.cos(i * .62 + t * 2) * 12 * s; A.push([xx, y - w]); B.push([xx, y + w]); }
    for (let i = 1; i < 10; i += 2) inkLine([A[i], B[i]], Math.max(.6, 1.2 * s), BASE[i % 4], 'ink', 0);
    inkLine(A, Math.max(.8, 2 * s), PC.tmpl, 'ink', .5); inkLine(B, Math.max(.8, 2 * s), PC.tmpl, 'ink', .5);
  }

  // ---------- temperature: the water's colour, the thermometer, the cycle pips ----------
  const TCOL = { room: '#D3E9E2', hot: '#F2B49C', cold: '#BBD3EC', warm: '#F4DDA4' };
  const TLEV = { room: .12, cold: .42, warm: .62, hot: .92 };
  const TEMPS = [[0, 'room', 0], [25.4, 'hot', 1.4], [37.9, 'cold', 1.3], [46.6, 'warm', 1.3], [55.6, 'hot', .35], [56.3, 'cold', .35], [57.0, 'warm', .35],
    [72.6, 'hot', .5], [73.5, 'cold', .5], [74.4, 'warm', .4], [81.4, 'hot', .45], [82.2, 'cold', .45], [83.0, 'warm', .4],
    [87.5, 'hot', .2], [87.9, 'cold', .2], [88.3, 'warm', .2], [88.7, 'hot', .2], [89.1, 'cold', .2], [89.5, 'warm', .25],
    [94.6, 'room', 0], [100.1, 'hot', .4], [100.9, 'cold', .4], [104.9, 'warm', .5], [108.7, 'hot', .4], [109.4, 'cold', .4], [110.2, 'warm', .4],
    [113.5, 'hot', .4], [114.2, 'cold', .4], [115.0, 'warm', .4]];
  function tempAt(t) {
    let i = 0; while (i + 1 < TEMPS.length && t >= TEMPS[i + 1][0]) i++;
    const [t0, s, d] = TEMPS[i], p = i ? TEMPS[i - 1][1] : s, k = d ? ease(seg(t, t0, t0 + d)) : 1;
    const is = (n, st) => st === n ? 1 : 0;
    return { col: mixCol(TCOL[p], TCOL[s], k), lev: lerp(TLEV[p], TLEV[s], k), hot: lerp(is('hot', p), is('hot', s), k), cold: lerp(is('cold', p), is('cold', s), k), warm: lerp(is('warm', p), is('warm', s), k) };
  }
  function liquid(t, tp) {                                       // screen space: the water inside the tube
    boilSeed('liq'); paint(rectPts(-60, -60, W + 120, H + 120), { wash: tp.col, ink: null });
    for (let i = 0; i < 6; i++) {
      boilSeed('lb' + i); const x = hash(i + 3) * W + 80 * wob(t, .03, i * .3), y = hash(i + 7) * H + 60 * wob(t, .025, i);
      paint(ellPts(x, y, 260 + 120 * hash(i), 160 + 60 * hash(i + 1), 18, 6), { fill: mixCol(tp.col, PAL.cream, .45), fillOp: 90, bleed: .3, tex: .5, ink: null });
    }
    const nb = Math.round(16 * tp.hot);                          // boiling-hot bubbles
    for (let i = 0; i < nb; i++) {
      const sp = 140 + 90 * hash(i + 40), y = H + 40 - frac(t * sp / (H + 80) + hash(i + 41)) * (H + 80), x = hash(i + 42) * W + 14 * Math.sin(t * 3 + i), r = 6 + 7 * hash(i + 43);
      boilSeed('bub' + i); paint(ellPts(x, y, r, r, 10), { wash: mixCol(tp.col, PAL.cream, .7), washOp: 220, ink: mixCol(tp.col, PAL.ink, .45), sw: .6 });
    }
    const nc = Math.round(10 * tp.cold);                         // cold: slow glints
    for (let i = 0; i < nc; i++) { const x = hash(i + 60) * W, y = hash(i + 61) * H + 20 * wob(t, .1, i * .2), k = frac(t * .5 + hash(i + 62)); boilSeed('ice' + i); sparkle(x, y, 14, k, '#F4FAFF'); }
    boilSeed('glass'); for (const x of [26, W - 26]) inkLine([[x, -20], [x + (x < W / 2 ? 8 : -8), H / 2], [x, H + 20]], 3, mixCol(tp.col, PAL.cream, .8), 'ink', .5);
  }
  function thermometer(t, tp, pips, o = {}) {                   // screen space, left edge
    const x = 112, top = 300, bot = 840, lev = lerp(bot - 30, top + 20, tp.lev) + 3 * Math.sin(t * 7) * (o.shake || 0);
    boilSeed('thermo');
    paint(rrPts(x - 22, top - 20, 44, bot - top + 20, 22), { wash: '#F7F3EA', ink: PAL.ink, sw: 1.2 });
    paint(ellPts(x, bot + 16, 38, 38, 20), { wash: '#D8483C', ink: PAL.ink, sw: 1.2 });
    paint(rrPts(x - 9, lev, 18, bot - lev + 10, 8), { wash: '#D8483C', ink: null });
    [['cold', '#6C9BD8'], ['warm', '#E2A33A'], ['hot', '#E0603E']].forEach(([s, col], i) => {
      const y = lerp(bot - 30, top + 20, TLEV[s]), on = tp[s];
      if (on > .3) glow(x + 40, y, 40, col, .8 * on);
      inkLine([[x + 24, y], [x + 46 + 10 * on, y]], 3, col, 'ink', 0);
    });
    paint(ellPts(x - 6, bot + 6, 10, 7, 10), { wash: '#F28A7C', ink: null });
    for (let i = 0; i < 3; i++) {                                 // cycle pips
      const px = x - 40 + i * 40, py = 948, k = clamp(pips - i), spin = o.spin ? .5 + .5 * Math.sin(t * 18 - i * 2) : 0;
      boilSeed('pip' + i);
      if (k > .5 || spin > .5) glow(px, py, 34, '#FFD27A', .7 * Math.max(k, spin));
      paint(ellPts(px, py, 14, 14, 14), { wash: k > .5 || spin > .5 ? '#F2B53A' : '#EFE6D6', ink: PAL.ink, sw: 1 });
      if (k > 0 && k < 1) sparkle(px, py - 4, 28, k);
    }
  }

  // =========================== the strand engine ===========================
  // A template of 20 units; the forward primer F binds at 6–8 and copies rightward, the reverse primer R binds at 12–14
  // and copies leftward, so the target runs 6–14. With 5′ tails (restriction sites) F reaches back to 4, R out to 16.
  // + strands read 5′→3′ left to right and sit on top of a duplex; − strands run the other way, at the bottom.
  const UX = 54, BXL = 420, X = u => BXL + u * UX, DG = 40, STW = 16;
  const ROW3 = r => 160 + r * 110;                               // the 8 rows of cycle 3
  const rowY = (g, r) => { const n = 2 ** (3 - g); let s = 0; for (let i = r * n; i < (r + 1) * n; i++) s += ROW3(i); return s / n; };
  function build(tails) {
    const FA = tails ? 4 : 6, RB = tails ? 16 : 14; let id = 0;
    const S = (d, a, b, o = {}) => ({ d, a, b, id: id++, orig: false, flap: false, gen: 0, ...o });
    // copying a + strand primes R and runs left to the template's 5′ end; a − strand primes F and runs right.
    // A tail flaps free when the template there is still the original sequence (it ends at 0 or 20).
    const copy = (s, g) => s.d === 1 ? S(-1, s.a, RB, { gen: g, flap: tails && s.b === 20 }) : S(1, FA, s.b, { gen: g, flap: tails && s.a === 0 });
    const G = [[{ top: S(1, 0, 20, { orig: true }), bot: S(-1, 0, 20, { orig: true }) }]];
    for (let g = 1; g <= 3; g++) G.push(G[g - 1].flatMap(dp => [{ top: dp.top, bot: copy(dp.top, g) }, { top: copy(dp.bot, g), bot: dp.bot }]));
    return { G, tails, FA, RB };
  }
  const M0 = build(false), M1 = build(true);
  const isTarget = (s, M) => !s.orig && s.a === M.FA && s.b === M.RB;
  function strandSegs(s, M) {                                    // [u0, u1, colour, kind]
    if (s.orig) return [[s.a, s.b, PC.tmpl, 'body']];
    const out = [];
    if (s.d === 1) {
      if (M.tails) out.push([M.FA, 6, PC.tail, 'tail']);
      out.push([6, 8, PC.F, 'primer']);
      if (M.tails && s.b === M.RB) out.push([8, 14, PC.neu, 'body'], [14, 16, PC.tailLt, 'body']); else out.push([8, s.b, PC.neu, 'body']);
    } else {
      if (M.tails && s.a === M.FA) out.push([4, 6, PC.tailLt, 'body'], [6, 12, PC.neu, 'body']); else out.push([s.a, 12, PC.neu, 'body']);
      out.push([12, 14, PC.R, 'primer']);
      if (M.tails) out.push([14, M.RB, PC.tail, 'tail']);
    }
    return out;
  }
  const path = (u0, u1, yOf, dx = 0) => { const n = Math.max(1, Math.ceil((u1 - u0) / .5)), P = []; for (let i = 0; i <= n; i++) { const u = lerp(u0, u1, i / n); P.push([X(u) + dx, yOf(u)]); } return P; };
  // the tail of a + strand hinges at 6 and points left; a − strand's hinges at 14 and points right
  function tailPts(s, M, yOf, flap, t, dx, len = 1) {
    const hinge = s.d === 1 ? 6 : 14, dir = s.d === 1 ? -1 : 1, L = 2 * UX * len, ang = flap * .85 + .08 * flap * Math.sin(t * 5 + s.id), P = [];
    const out = s.d === 1 ? -1 : 1;                              // + strands sit on top: their tails lift up
    for (let k = 0; k <= 6; k++) { const q = k / 6, a = ang * (.4 + .6 * q); P.push([X(hinge) + dx + dir * Math.cos(a) * L * q, yOf(hinge) + out * Math.sin(a) * L * q]); }
    return P;
  }
  function drawStrand(s, M, yOf, lo, hi, o = {}) {
    if (hi - lo < .05) return;
    const segs = strandSegs(s, M), key = (o.key ?? s.id) + (M.tails ? 't' : ''), dx = o.dx || 0, flap = o.flap || 0;
    const halo = (u0, u1, k, col) => { if (k <= .01 || u1 - u0 < .05) return; boilSeed('ha' + key + u0); paint(ribbon(path(u0, u1, yOf, dx), STW + 18, STW + 18), { wash: col, washOp: 255 * clamp(k), ink: null }); };
    if (o.halo) halo(lo, hi, o.halo, o.haloCol || '#FFFCF0');
    if (o.haloR) halo(Math.max(lo, o.haloR[0]), Math.min(hi, o.haloR[1]), o.haloR[2], o.haloR[3] || '#FFF2B8');
    if (o.glow) for (let u = lo + 1; u < hi; u += 2.5) glow(X(u) + dx, yOf(u), 70, o.glowCol || '#FFE08A', o.glow);
    segs.forEach(([a, b, col, kind], i) => {
      const u0 = Math.max(a, lo), u1 = Math.min(b, hi); if (u1 - u0 < .02) return;
      boilSeed('st' + key + i);
      if (kind === 'tail') {
        const P = tailPts(s, M, yOf, flap, o.t || 0, dx, (u1 - u0) / 2);
        if (o.tailHalo) { paint(ribbon(P, STW + 18, STW + 18), { wash: '#FFE3E6', washOp: 255 * clamp(o.tailHalo), ink: null }); }
        paint(ribbon(P, STW, STW * .85), { wash: col, ink: PAL.ink, sw: .9 });
      } else paint(ribbon(path(u0, u1, yOf, dx), STW, STW), { wash: col, ink: PAL.ink, sw: .9 });
    });
    const e = s.d === 1 ? hi : lo, d = s.d, x = X(e) + dx, y = yOf(e);   // the 3′ end: a point
    const sg = segs.find(([a, b]) => e - d * .01 >= a && e - d * .01 <= b) || segs[segs.length - 1];
    boilSeed('tip' + key); paint([[x, y - STW * .95], [x + d * STW * 1.3, y], [x, y + STW * .95]], { wash: sg[2], ink: PAL.ink, sw: .9 });
  }
  function rungs(yT, yB, lo, hi, key, vis) {                    // base pairs on a fixed lattice, so they don't crawl
    if (hi - lo < .2) return; boilSeed('rg' + key);
    for (let k = Math.ceil((lo - .25) * 2); k / 2 + .25 <= hi; k++) {
      const u = k / 2 + .25; if (u < lo || (vis && !vis(u))) continue;
      inkLine([[X(u), yT(u) + STW / 2], [X(u), yB(u) - STW / 2]], 2.4, BASE[Math.floor(hash(u * 4.7 + 1) * 4)], 'ink', 0);
    }
  }
  const invEase = y => { let a = 0, b = 1; for (let i = 0; i < 18; i++) { const m = (a + b) / 2; if (ease(m) < y) a = m; else b = m; } return (a + b) / 2; };
  // cycle schedules (video time): den = rungs pop then the strands part, ann = primers dock, ext = Taq copies
  const CY0 = [null, { den: [27.1, 30.7], ann: [39.35, 41.7], ext: [50.9, 55.0], taqIn: [48.4, 49.3] }, { den: [72.6, 73.5], ann: [73.5, 74.4], ext: [74.5, 76.4] }, { den: [81.4, 82.2], ann: [82.2, 83.0], ext: [83.1, 84.5] }];
  const CY1 = [null, { den: [100.1, 100.9], ann: [100.9, 101.8], ext: [105.3, 107.4] }, { den: [108.7, 109.4], ann: [109.4, 110.2], ext: [110.3, 112.6] }, { den: [113.5, 114.2], ann: [114.2, 115.0], ext: [115.0, 116.8] }];
  const genAt = (t, CY) => { let g = 0; for (let k = 1; k <= 3; k++) if (t >= CY[k].den[0]) g = k; return g; };
  // Draws the board at time t. hl(s, info) → strand options (halo, glow...). Returns where things are, for the camera,
  // Clawd and the highlights: rows [{ y, top, bot, topY, botY, ext }], taqs [{ x, y, s, r }].
  function drawBoard(t, M, CY, hl = () => ({}), opt = {}) {
    const info = { rows: [], taqs: [], g: 0 };
    const g = genAt(t, CY); info.g = g;
    const wav = (u, k) => 3 * Math.sin(u * .8 + t * 1.7 + k * 1.3);
    if (g === 0) {
      const y0 = rowY(0, 0), dp = M.G[0][0], yT = u => y0 - DG / 2 + wav(u, 0), yB = u => y0 + DG / 2 + wav(u, 0);
      rungs(yT, yB, 0, 20, 'g0');
      drawStrand(dp.top, M, yT, 0, 20, { t, key: 'o+', ...hl(dp.top, { r: 0, g, role: 'tmpl' }) });
      drawStrand(dp.bot, M, yB, 0, 20, { t, key: 'o-', ...hl(dp.bot, { r: 0, g, role: 'tmpl' }) });
      info.rows.push({ y: y0, top: dp.top, bot: dp.bot, topY: yT, botY: yB });
      return info;
    }
    const c = CY[g], dMid = lerp(c.den[0], c.den[1], .5), sepK = ease(seg(t, dMid, c.den[1])), annD = c.ann[1] - c.ann[0];
    const rows = M.G[g];
    const geo = rows.map((row, r) => { const side = r % 2 ? 1 : -1, py = rowY(g - 1, r >> 1), cy = rowY(g, r); return { side, cy, ty: lerp(py + side * DG / 2, cy + side * DG / 2, sepK), ny: cy - side * DG / 2 }; });
    if (sepK < .02) M.G[g - 1].forEach((dp, i) => {               // the parent duplexes' bonds pop, one by one
      const yT = u => geo[2 * i].ty + wav(u, 2 * i), yB = u => geo[2 * i + 1].ty + wav(u, 2 * i + 1);
      let lo = Math.max(dp.top.a, dp.bot.a), hi = Math.min(dp.top.b, dp.bot.b);
      if (dp.top.flap && dp.top.gen === g - 1) lo = Math.max(lo, 6); if (dp.bot.flap && dp.bot.gen === g - 1) hi = Math.min(hi, 14);
      const brk = u => c.den[0] + hash(u * 3.1 + i * 7 + g) * (dMid - c.den[0] - .05);
      rungs(yT, yB, lo, hi, 'p' + g + i, u => t < brk(u));
      if (opt.sparks) for (let k = Math.ceil((lo - .25) * 2); k / 2 + .25 <= hi; k++) { const u = k / 2 + .25, a = seg(t, brk(u), brk(u) + .25); if (a > 0 && a < 1) { boilSeed('spk' + k); sparkle(X(u), (yT(u) + yB(u)) / 2, 22, a); } }
    });
    rows.forEach((row, r) => {
      const G0 = geo[r], tmpl = r % 2 ? row.bot : row.top, nw = r % 2 ? row.top : row.bot;
      const yt = u => G0.ty + wav(u, r), yn = u => G0.ny + wav(u, r);
      const tFlap = tmpl.flap && tmpl.gen === g - 1 ? 1 - sepK : 0;
      const a0 = c.ann[0] + annD * .3 * ((r % 2 ? 0 : .5) + (g > 1 ? .5 * hash(r * 3 + g) : 0)), a1 = a0 + annD * .7, dk = seg(t, a0, a1);
      const [pLo, pHi] = nw.d === 1 ? [M.FA, 8] : [12, M.RB];
      let nLo = 0, nHi = -1, ndx = 0, ndy = 0, nFlap = 0;
      if (t >= a0) {
        nLo = pLo; nHi = pHi; nFlap = nw.flap ? ease(seg(dk, .6, 1)) : 0;
        if (dk < 1) {
          const dock = [X((pLo + pHi) / 2), G0.ny], st = (opt.primerStart && opt.primerStart(r, g)) || [dock[0] - nw.d * 220, G0.ny - G0.side * 280];
          const p = arcPt(st, dock, 30, easeOut(dk)); ndx = p[0] - dock[0]; ndy = p[1] - dock[1];
        }
        const ext = ease(seg(t, c.ext[0], c.ext[1])) * 12;
        if (nw.d === 1) nHi = 8 + Math.min(nw.b - 8, ext); else nLo = 12 - Math.min(12 - nw.a, ext);
      }
      const tmplY = yt, newY = u => yn(u) + ndy;
      const topY = r % 2 ? newY : tmplY, botY = r % 2 ? tmplY : newY;
      const topExt = r % 2 ? [nLo, nHi] : [tmpl.a, tmpl.b], botExt = r % 2 ? [tmpl.a, tmpl.b] : [nLo, nHi];
      if (dk >= 1) {                                              // base pairs where both strands are present and matched
        let lo = Math.max(topExt[0], botExt[0]), hi = Math.min(topExt[1], botExt[1]);
        const topFlap = r % 2 ? nFlap : tFlap, botFlap = r % 2 ? tFlap : nFlap;
        if (topFlap > .3) lo = Math.max(lo, 6); if (botFlap > .3) hi = Math.min(hi, 14);
        rungs(topY, botY, lo, hi, 'r' + g + r);
      }
      const role = { r, g, side: G0.side };
      drawStrand(tmpl, M, tmplY, tmpl.a, tmpl.b, { t, flap: tFlap, ...hl(tmpl, { ...role, role: 'tmpl' }) });
      if (t >= a0) drawStrand(nw, M, newY, nLo, nHi, { t, flap: nFlap, dx: ndx, ...hl(nw, { ...role, role: 'new' }) });
      info.rows.push({ y: G0.cy, top: row.top, bot: row.bot, topY, botY, topExt, botExt, tmpl, nw, tmplY, newY: yn });
      // Taq: swims to the primer's 3′ end, rides it to the template's end, then lets go
      const [ti0, ti1] = c.taqIn || [c.ext[0] - .55, c.ext[0]];
      if (t >= ti0) {
        const len = nw.d === 1 ? nw.b - 8 : 12 - nw.a, tDone = c.ext[0] + (c.ext[1] - c.ext[0]) * invEase(len / 12);
        if (t < tDone + .7) {
          const ts = opt.taqS ? opt.taqS(g) : [0, .62, .5, .42][g], tip = nw.d === 1 ? nHi : nLo, out = -G0.side;
          const sit = [X(tip) + nw.d * 18 * ts, G0.ny + out * (STW / 2 + 34 * ts)];
          let p = sit, s = ts, rot = .05 * Math.sin(t * 9 + r);
          if (t < ti1) { const q = seg(t, ti0, ti1); p = arcPt([sit[0] + nw.d * 160, sit[1] + out * 240], sit, 40, easeOut(q)); rot = (1 - q) * .6 * nw.d; }
          if (t > tDone) { const q = seg(t, tDone, tDone + .7); p = arcPt(sit, [sit[0] + nw.d * 240, sit[1] + out * 320], 60, easeIn(q)); s = ts * (1 - q); rot = q * nw.d; }
          taq(p[0], p[1], s, t, { key: 'q' + g + r, flip: nw.d < 0, rot, seed: r, happy: t > tDone - .3 });
          info.taqs.push({ x: p[0], y: p[1], s, r, top: [p[0], p[1] - 50 * s] });
        }
      }
    });
    return info;
  }
  // =========================== A: the bench (0–22.6) ===========================
  const MX = 1380, MBASE = 860, MTOP = 660, TUBE = [1380, 560];
  function machine(t, lidA, lights, glowK = 0, o = {}) {        // the thermocycler, with its hinged lid
    boilSeed('lid');
    // lidA: 1 = open (standing up behind, its underside towards us), 0 = shut (a flat slab on top)
    if (lidA > .02) {                                              // open: tipped back, we see its heated underside
      const hy = MTOP - 14, top = hy - 170 * lidA, wb = 225, wt = 250;
      paint([[MX - wb, hy], [MX - wt, top + 18], [MX - wt + 18, top], [MX + wt - 18, top], [MX + wt, top + 18], [MX + wb, hy]], { wash: PC.machDk, fill: mixCol(PC.machDk, PAL.ink, .2), fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.2 });
      paint([[MX - wb + 34, hy - 16], [MX - wt + 40, top + 26], [MX + wt - 40, top + 26], [MX + wb - 34, hy - 16]], { wash: '#B9BEC6', ink: PAL.ink, sw: .9, hatch: { d: 16, a: Math.PI / 2, b: 'HB', c: '#7D838D', w: .6 } });
      paint(rrPts(MX - 50, top - 22, 100, 26, 10), { wash: PC.mach, ink: PAL.ink, sw: 1 });
      for (const sd of [-1, 1]) paint(rrPts(MX + sd * 150 - 18, hy - 10, 36, 20, 6), { wash: '#7F8A86', ink: PAL.ink, sw: .8 });
    }
    boilSeed('mach');
    paint(rrPts(MX - 230, MTOP, 460, MBASE - MTOP, 26), { wash: PC.mach, fill: PC.machDk, fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(MX - 190, MTOP + 52, 210, 100, 14), { wash: PC.screen, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 3; i++) { const on = clamp(lights - i), px = MX - 140 + i * 55, py = MTOP + 102; boilSeed('ml' + i); if (on > .5) glow(px, py, 40, '#FFB060', .9 * on); paint(ellPts(px, py, 15, 15, 12), { wash: on > .5 ? '#FFB54A' : '#5A6878', ink: PAL.ink, sw: .8 }); }
    paint(ellPts(MX + 130, MTOP + 102, 30, 30, 16), { wash: '#C9D7CE', ink: PAL.ink, sw: 1 }); inkLine([[MX + 130, MTOP + 102], [MX + 130 + 20 * Math.cos(-1 + lights), MTOP + 102 + 20 * Math.sin(-1 + lights)]], 2, PAL.ink, 'ink', 0);
    paint(rectPts(MX - 120, MTOP - 18, 240, 22), { wash: '#9AA0A8', ink: PAL.ink, sw: .9 });
    // the tube in its block
    if (glowK > 0) { boilSeed('tubeG'); glow(TUBE[0], TUBE[1] + 60, 180 + 120 * glowK, '#FFD27A', glowK); }
    if (lidA > .3) {
      boilSeed('tube');
      paint([[TUBE[0] - 34, TUBE[1]], [TUBE[0] + 34, TUBE[1]], [TUBE[0] + 22, TUBE[1] + 96], [TUBE[0], TUBE[1] + 116], [TUBE[0] - 22, TUBE[1] + 96]], { wash: '#E7F2F1', washOp: 230, ink: PAL.ink, sw: 1, curv: .2 });
      paint([[TUBE[0] - 26, TUBE[1] + 46], [TUBE[0] + 26, TUBE[1] + 46], [TUBE[0] + 20, TUBE[1] + 96], [TUBE[0], TUBE[1] + 112], [TUBE[0] - 20, TUBE[1] + 96]], { wash: mixCol(TCOL.room, '#FFD27A', glowK), ink: null, curv: .2 });
      push(); translate(TUBE[0] + 34, TUBE[1]); rotate(o.capA ?? -2.2);
      paint(rrPts(0, -10, 70, 18, 7), { wash: '#E7F2F1', ink: PAL.ink, sw: .9 }); pop();
    }
    boilSeed('lidS');
    if (lidA <= .02) { paint(rrPts(MX - 235, MTOP - 70, 470, 76, 20), { wash: PC.machDk, fill: PC.mach, fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.2 }); paint(rrPts(MX - 200, MTOP - 52, 400, 14, 7), { wash: mixCol(PC.machDk, PAL.ink, .2), ink: null }); }
  }
  function room(t) {
    boilSeed('wall'); paint(rectPts(-400, -400, W + 800, 1300), { wash: PC.wall, ink: null });
    boilSeed('wallB'); paint(ellPts(500, 300, 500, 260, 20, 6), { fill: '#F8EBD5', fillOp: 120, bleed: .3, tex: .5, ink: null });
    boilSeed('win'); paint(rrPts(180, 110, 420, 330, 14), { wash: '#CFE6F0', ink: PAL.ink, sw: .9 }); inkLine([[390, 112], [390, 438]], .9, PAL.ink, 'ink', 0); inkLine([[182, 275], [598, 275]], .9, PAL.ink, 'ink', 0);
    boilSeed('cloud'); paint(ellPts(300 + 20 * wob(t, .03), 200, 60, 24, 14, 3), { wash: '#F4FAFC', ink: null });
    boilSeed('shelf'); paint(rectPts(860, 300, 360, 18), { wash: PC.woodDk, ink: PAL.ink, sw: .9 });
    [[900, '#E2A0B0'], [960, '#9FC9A2'], [1020, '#A9B8E2'], [1100, '#F0C27A']].forEach(([x, col], i) => { boilSeed('jar' + i); paint(rrPts(x, 230, 44, 70, 10), { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 50, tex: .5, ink: PAL.ink, sw: .9 }); });
    boilSeed('bench'); paint(rectPts(-400, MBASE, W + 800, 500, 3), { wash: PC.wood, fill: PC.woodDk, fillOp: 80, tex: .7, ink: PAL.ink, sw: 1 });
  }
  const HAND = (x, y, u) => [x + 5.6 * u, y - 6.4 * u];
  const TOSS = [[12.9, 'dna'], [14.0, 'F'], [14.3, 'R'], [15.05, 0], [15.3, 1], [15.55, 2], [15.8, 3], [18.15, 'mg']];
  function tossItem(kind, x, y, s, t) {
    if (kind === 'dna') helix(x, y, s * 1.1, t, 'toss', .6);
    else if (kind === 'F' || kind === 'R') { boilSeed('tp' + kind); const col = kind === 'F' ? PC.F : PC.R; paint([[x - 26 * s, y - 7 * s], [x + 14 * s, y - 7 * s], [x + 30 * s, y], [x + 14 * s, y + 7 * s], [x - 26 * s, y + 7 * s]], { wash: col, ink: PAL.ink, sw: .9 }); }
    else if (kind === 'mg') { for (let i = 0; i < 5; i++) { boilSeed('mg' + i); paint(starPts(x + (i - 2) * 12 * s, y + 8 * s * Math.sin(i * 2), 9 * s, .4, 4, i), { wash: '#E9EEF5', ink: PAL.ink, sw: .6 }); } }
    else { boilSeed('bd' + kind); paint(ellPts(x, y, 11 * s, 11 * s, 12), { wash: BASE[kind], ink: PAL.ink, sw: .8 }); }
  }
  function shotA(t, lt) {
    const push1 = seg(t, 2.9, 3.6) * (1 - seg(t, 7.1, 8.4)), dive = easeIn(seg(t, 21.3, 22.6));
    let c = [lerp(960, 820, ease(push1)), lerp(560, 640, ease(push1)), lerp(1, 1.4, ease(push1))];
    if (t > 11.2) c = kf(t, [[11.2, [960, 560, 1]], [12.4, [1080, 600, 1.08]], [21.3, [1110, 600, 1.1]], [22.6, [TUBE[0], TUBE[1] + 70, 6]]], ease);
    cam(c[0] + 4 * wob(t, .1), c[1] + 3 * wob(t, .08), c[2]);
    room(t);
    const lidA = 1 - easeIn(seg(t, 20.35, 20.6)), lights = 3 * ease(seg(t, 20.95, 21.6));
    const slam = spring(t, 20.6, 9, 40);
    push(); translate(0, 6 * slam);
    machine(t, lidA, lights, .25 * seg(t, 13.2, 19.0), { capA: t < 20.35 ? -2.2 : lerp(-2.2, 0, seg(t, 20.2, 20.35)) });
    pop();
    // the Taq waits on the bench by the machine, then hops in by itself
    const tq = t < 16.74 ? [1100, MBASE - 40] : arcPt([1100, MBASE - 40], [TUBE[0], TUBE[1] + 10], 200, ease(seg(t, 16.74, 17.5)));
    if (t < 17.5) taq(tq[0], tq[1] - 26 * Math.abs(Math.sin(t * 3.3)) * (t < 16.74 ? .3 : 0), .75, t, { key: 'bench', happy: t > 16.5, rot: t > 16.74 ? seg(t, 16.74, 17.5) * 2 : 0, flip: t < 9 });
    if (t > 17.4 && t < 18.0) { boilSeed('plopT'); sparkle(TUBE[0], TUBE[1] - 10, 30, seg(t, 17.45, 17.9)); }
    // Clawd
    let o = talk(t, emotions(t, [[0, 'happy'], [1.74, 'proud'], [3.0, 'hopeful', { lookX: .6, lookY: -.3 }], [4.23, 'sad', { emote: null, lookX: .6, lookY: -.3 }], [5.63, 'hopeful', { lookY: -1 }],
      [7.3, 'thinking'], [8.4, 'idea', { lookX: 1, lookY: -.3 }], [9.8, 'excited', { emote: null, lookX: 1 }], [11.6, 'determined', { lookX: 1 }], [12.9, 'happy', { lookX: 1, lookY: -.5 }],
      [16.7, 'surprised', { lookX: 1 }], [17.5, 'laugh'], [18.15, 'playful'], [19.6, 'excited', { emote: null }]]));
    const x0 = t < 11.6 ? 760 : lerp(760, 860, ease(seg(t, 11.6, 12.4))), y0 = MBASE, u = 24;
    if (t > .9 && t < 1.74) o.aR = 1.2 + .45 * Math.sin((t - .9) * 13);
    const holdDNA = t > 3.0 && t < 12.9 + .05;
    if (holdDNA && t < 11.6) o.aR = lerp(o.aR ?? .2, 1.0, seg(t, 3.0, 3.3));
    if (t > 8.4 && t < 9.8) o.aL = 1.3;
    // tosses: wind up, then a flick on the beat of the word
    for (const [tt] of TOSS) { const w = seg(t, tt - .3, tt), f = seg(t, tt, tt + .15); if (w > 0 && f < 1) o.aR = lerp(-.6, 1.3, f) * (f > 0 ? 1 : 0) + (f > 0 ? 0 : lerp(o.aR ?? .2, -.6, ease(w))); }
    let x = x0, y = y0, uu = u, rot = 0, show = true;
    if (t > 19.87) { const k = seg(t, 19.87, 20.42), p = arcPt([x0, y0], [TUBE[0], TUBE[1] + 20], 320, easeIn(k)); x = p[0]; y = p[1]; uu = lerp(u, 3, easeIn(k)); rot = k * 1.2; o = { ...o, sq: o.sq - .15 * Math.sin(k * Math.PI), noShadow: k > .05 }; show = k < .98; }
    if (show) clawd(x, y, uu, { ...o, rot, view: t > 11.6 && t < 19.87 ? 'q' : 'front', boilKey: 'cA',
      armR: holdDNA ? (u2) => helix(1.2 * u2, 0, u2 / 22, t, 'held', .4) : null });
    // the flying items
    for (const [tt, kind] of TOSS) {
      const k = seg(t, tt + .12, tt + .7); if (k <= 0 || k >= 1) continue;
      const h = HAND(x0, y0, u), p = arcPt(h, [TUBE[0], TUBE[1] - 4], 160, ease(k));
      tossItem(kind, p[0], p[1], 1, t);
    }
    for (const [tt, kind] of TOSS) { const k = seg(t, tt + .7, tt + 1.1); if (k > 0 && k < 1) { boilSeed('plop' + tt); sparkle(TUBE[0] + (hash(tt) - .5) * 30, TUBE[1] - 14, 26, k); } }
    // the wish: a thought cloud full of copies
    const wish = seg(t, 5.65, 6.0) * (1 - seg(t, 7.2, 7.5));
    if (wish > 0) {
      const bx = x0 + 60, by = y0 - 330; boilSeed('wish');
      paint(ellPts(x0 + 20, y0 - 225, 12 * wish, 10 * wish, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
      paint(ellPts(x0 + 40, y0 - 260, 18 * wish, 15 * wish, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
      const P = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; P.push([bx + Math.cos(a) * 190 * backOut(wish) * (1 + .08 * Math.sin(a * 7)), by + Math.sin(a) * 90 * backOut(wish) * (1 + .08 * Math.sin(a * 7))]); }
      paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
      for (let i = 0; i < 7; i++) { const k = seg(t, 5.8 + i * .08, 6.05 + i * .08); if (k <= 0) continue; push(); translate(bx - 120 + (i % 4) * 80 + (i > 3 ? 40 : 0), by - 32 + (i > 3 ? 62 : 0)); rotate(.3 * (hash(i) - .5)); scale(backOut(k) * 1.1); helix(0, 0, 1, t, 'w' + i); pop(); }
    }
    camEnd();
    if (lt < .6) iris(W * .42, H * .62, kf(lt, [[0, 0], [.12, 160], [.3, 180], [.6, 1600]], easeIn));
    if (dive > .6) flash((dive - .6) / .4, PAL.ink);
  }

  // =========================== B + C: inside the tube, cycles 1–3 (22.6–94.6) ===========================
  const HOST = [1770, 615], HU = 20, HOST0 = [1650, 330];
  const tgtRow = (row, M) => isTarget(row.top, M) && isTarget(row.bot, M);
  function shotBC(t, lt) {
    const tp = tempAt(t);
    liquid(t, tp);
    // camera: the duplex close, out as it parts, then out for cycle 2 and 3, then far out for the copies
    let c = kf(t, [[22.6, [960, 545, 1.62]], [28.6, [960, 545, 1.62]], [30.6, [960, 545, 1.25]], [48.0, [960, 545, 1.26]], [50.0, [1010, 600, 1.34]], [55.0, [1080, 600, 1.34]], [56.0, [960, 545, 1.25]],
      [72.4, [960, 545, 1.25]], [73.6, [960, 545, 1.03]], [81.2, [960, 545, 1.03]], [82.2, [960, 545, .99]], [87.3, [960, 545, .99]], [88.9, [960, 560, .5]]], ease);
    cam(c[0] + 5 * wob(t, .08), c[1] + 4 * wob(t, .06), c[2]);
    // drifting dNTPs and spare primers in the water
    for (let i = 0; i < 16; i++) {
      const x = BXL - 300 + hash(i + 80) * 1700 + 40 * wob(t, .05, i * .3), y = 40 + hash(i + 81) * 1000 + 30 * wob(t, .07, i * .6);
      boilSeed('dn' + i); paint(ellPts(x, y, 9, 9, 10), { wash: mixCol(BASE[i % 4], tp.col, .35), ink: mixCol(PAL.ink, tp.col, .4), sw: .6 });
    }
    // highlights, per strand, on the narration
    const hlBC = (s, q) => {
      const o = {};
      if (t > 63.3 && t < 71.9 && q.g === 1 && !s.orig) o.halo = .9 * seg(t, 63.4, 63.8) * (1 - seg(t, 71.4, 71.9));
      if (t > 66.5 && t < 68.8 && q.g === 1 && !s.orig) o.haloR = [s.d === 1 ? 6 : 12, s.d === 1 ? 8 : 14, Math.abs(Math.sin((t - 66.5) * 4)), '#FFFFFF'];
      if (t > 68.7 && t < 71.9 && q.g === 1 && !s.orig) o.haloR = [s.d === 1 ? 14 : 0, s.d === 1 ? 20 : 6, seg(t, 68.8, 69.2) * (1 - seg(t, 71.4, 71.9)), '#F77F95'];
      if (t > 72.9 && t < 75.2 && q.g === 2 && !s.orig && q.role === 'tmpl') o.halo = seg(t, 73.2, 73.6) * (1 - seg(t, 74.8, 75.2));
      if (t > 76.3 && t < 81.2 && q.g === 2 && isTarget(s, M0)) { o.halo = seg(t, 76.5, 77.0) * (1 - seg(t, 80.8, 81.2)); o.glow = .5 * o.halo; }
      if (t > 78.9 && t < 81.2 && q.g === 2 && q.role === 'tmpl') { const row = M0.G[2][q.r], partner = q.r % 2 ? row.top : row.bot; if (isTarget(partner, M0)) o.haloR = [s.a, s.b, (.5 + .5 * Math.sin((t - 78.9) * 9)) * (1 - seg(t, 80.8, 81.2)), '#F77F95']; }
      if (t > 84.5 && q.g === 3 && tgtRow(M0.G[3][q.r], M0)) { o.halo = seg(t, 84.6, 85.0) * (1 - seg(t, 88.6, 89.4)); o.glow = .6 * o.halo; }
      return o;
    };
    const info = drawBoard(t, M0, CY0, hlBC, { sparks: true, taqS: g => [0, .62, .5, .42][g] });
    // the target's two ends: chalk lines
    const gl = seg(t, 64.6, 65.4) * (1 - seg(t, 87.6, 88.4));
    if (gl > 0) for (const u of [6, 14]) {
      boilSeed('guide' + u); const y0 = 110, y1 = lerp(110, 990, ease(gl));
      for (let y = y0; y < y1 - 10; y += 36) inkLine([[X(u) - 6 * (u === 6 ? 1 : -1) * 0, y], [X(u), Math.min(y + 20, y1)]], 2.6, '#FFFDF4', 'ink', 0);
      if (gl > .9) paint(rectPts(X(6) + 2, 120, X(14) - X(6) - 4, 860), { fill: '#FFFBEA', fillOp: 40 * gl, bleed: .1, tex: .3, ink: null });
    }
    // 3′ ends of the two templates (cycle 1), then the 5′→3′ arrows along the new strands
    if (info.g === 1 && info.rows.length === 2) {
      const r0 = info.rows[0], r1 = info.rows[1], k3 = seg(t, 42.26, 42.6) * (1 - seg(t, 47.5, 48.0)), k5 = .7 * seg(t, 42.7, 43.0) * (1 - seg(t, 47.5, 48.0));
      if (k3 > 0) { glow(X(20) + 20, r0.topY(20), 70, '#FFF0B0', .8 * k3); glow(X(0) - 20, r1.botY(0), 70, '#FFF0B0', .8 * k3); }
      endMark('3', X(20) + 52, r0.topY(20) - 34, 34, k3, PAL.ink, 'a'); endMark('5', X(0) - 50, r0.topY(0) - 34, 30, k5, PAL.ink, 'b');
      endMark('3', X(0) - 52, r1.botY(0) + 40, 34, k3, PAL.ink, 'c'); endMark('5', X(20) + 50, r1.botY(20) + 40, 30, k5, PAL.ink, 'd');
      // primer tips (where Taq starts)
      const kt = seg(t, 48.4, 48.8) * (1 - seg(t, 51.0, 51.4));
      if (kt > 0) { glow(X(12), r0.botY(12), 60, '#FFF6C0', kt); glow(X(8), r1.topY(8), 60, '#FFF6C0', kt); }
      const ka = seg(t, 50.87, 52.3), kaOut = 1 - seg(t, 55.4, 56.0);
      if (ka > 0 && kaOut > 0) {
        for (const [y, d, key] of [[r0.topY(10) - 64, -1, 'L'], [r1.botY(10) + 64, 1, 'R']]) {
          boilSeed('ar' + key); const u0 = d === 1 ? 6 : 14, u1 = u0 + d * 8 * ease(ka), P = [[X(u0), y], [X((u0 + u1) / 2), y - 8], [X(u1), y]];
          inkLine(P, 1.5, PAL.ink, 'ink', .5);
          for (const sd of [-1, 1]) inkLine([[X(u1), y], [X(u1) - d * 22, y + sd * 14]], 1.5, PAL.ink, 'ink', 0);
          endMark('5', X(u0) - d * 40, y, 28, seg(t, 50.9, 51.2) * kaOut, PAL.ink, 'a5' + key); endMark('3', X(u0 + d * 8) + d * 42, y, 28, seg(t, 51.9, 52.2) * kaOut, PAL.ink, 'a3' + key);
        }
      }
    }
    // "one DNA becomes two" / the two targets
    if (t > 60.1 && t < 61.6 && info.g === 1) info.rows.forEach((row, i) => { const k = seg(t, 60.2 + i * .3, 60.5 + i * .3); if (k > 0 && k < 1) sparkle(X(20) + 70, row.y, 40, k); });
    if (info.g === 3 && t > 84.6 && t < 87.4) info.rows.forEach((row, i) => { if (!tgtRow(row, M0)) return; const k = seg(t, 84.7, 85.2), p = seg(t, 85.75 + (i > 3 ? .45 : 0), 86.15 + (i > 3 ? .45 : 0)); if (k < 1) sparkle(X(14) + 60, row.y, 44, k); if (p > 0 && p < 1) sparkle(X(6) - 60, row.y, 40, p, '#FFE08A'); });
    // then they multiply: the field fills with copies of the target
    if (t > 87.4) {
      const n = Math.floor(2 * 2 ** (5 * seg(t, 87.5, 89.6))) - 2;
      for (let i = 0; i < Math.min(n, SLOTS.length); i++) {
        const [sx, sy, born] = SLOTS[i], k = seg(t, 87.5 + born, 87.75 + born); if (k <= 0) continue;
        push(); translate(sx + 8 * wob(t, .3, i * .1), sy + 6 * wob(t, .25, i * .17)); scale(backOut(k) * .55); miniTarget(t, i, M0); pop();
      }
    }
    // Clawd, the host: floating at the right, riding a Taq in cycle 1
    const h0 = ease(seg(t, 29.2, 30.4));
    let hostXY = [lerp(HOST0[0], HOST[0], h0), lerp(HOST0[1], HOST[1], h0)], hu = HU, rideP = null;
    const t1 = info.taqs.find(q => q.r === 1);
    if (info.g === 1 && t1) rideP = toScreen(t1.top[0], t1.top[1]);
    camEnd();
    let o = talk(t, emotions(t, [[22.6, 'surprised', { emote: null }], [23.5, 'happy'], [25.5, 'nervous', { emote: 'sweat', tint: 'flush', tintK: .35 }], [27.1, 'surprised', { lookX: -1, emote: null, tint: 'flush', tintK: .3 }],
      [29.2, 'excited', { lookX: -1, emote: 'sweat', tint: 'flush', tintK: .3 }], [31.4, 'suspicious', { lookX: .4, lookY: -1, emote: 'sweat' }], [33.2, 'determined', { lookX: .5, lookY: -1 }], [34.4, 'happy'],
      [37.9, 'scared', { emote: null, tint: 'blue', tintK: .45 }], [39.4, 'hopeful', { lookX: -1, tint: 'blue', tintK: .3 }], [42.3, 'thinking', { lookX: -1, lookY: 0, emote: null }], [46.9, 'relieved', { emote: null }],
      [48.4, 'excited', { lookX: -1, emote: null }], [50.6, 'happy'], [55.2, 'proud', { emote: null }], [57.8, 'excited', { emote: null, lookX: -1 }], [60.2, 'happy'],
      [62.0, 'surprised', { emote: '!!' }], [63.4, 'thinking', { lookX: -1 }], [66.6, 'neutral', { lookX: -1, lookY: .2 }], [68.8, 'suspicious', { lookX: -1 }], [72.6, 'determined', { lookX: -1 }],
      [77.0, 'excited', { emote: null, lookX: -1 }], [79.0, 'confused', { lookX: -1 }], [81.4, 'determined', { lookX: -1 }], [84.7, 'starstruck'], [85.7, 'proud', { emote: null }], [87.3, 'excited', { emote: null }], [90.4, 'happy', { lookX: -1, lookY: -1 }]]));
    if (t > 37.9 && t < 39.4) o.dx = (o.dx || 0) + .25 * Math.sin(t * 60);    // shiver
    if (t > 33.2 && t < 34.3) { o.aR = 1.4 + .25 * Math.sin(t * 22); o.dx = (o.dx || 0) + .3 * Math.sin(t * 16); }
    if (t > 59.2 && t < 61.0) { o.aL = 1.3; o.aR = 1.3; }
    if (t > 85.7 && t < 87.3) { o.aL = 1.45; o.aR = 1.45; }
    if (t > 90.6 && t < 93.6) o.aL = 1.1;
    if (lt < .9) { const k = seg(lt, .1, .8); hostXY = arcPt([HOST0[0], -200], HOST0, 0, easeIn(k)); o.sq += k > .98 ? .2 * spring(t, 23.4, 6, 20) : -.1; }
    if (rideP) {                                                   // hop on, ride, hop off
      const on = seg(t, 50.4, 50.9), off = seg(t, 55.0, 55.6);
      if (on > 0 && off < 1) { const p = off > 0 ? arcPt(rideP, HOST, 160, ease(off)) : arcPt(HOST, rideP, 200, ease(on)); hostXY = p; o.view = on > .9 && off <= 0 ? 'side' : 'q'; o.flip = false; }
    } else if (t > 55.0 && t < 55.6) hostXY = arcPt([1640, 760], HOST, 160, ease(seg(t, 55.0, 55.6)));
    if (!o.view) { o.view = 'q'; o.flip = true; }
    const riding = rideP && t > 50.9 && t < 55.0;
    if (riding) clawd(hostXY[0], hostXY[1], HU * .85, { ...o, noShadow: true, boilKey: 'host', walk: undefined });
    else floatClawd(hostXY[0], hostXY[1], hu, o, t);
    // the helicase that isn't needed
    if (t > 31.2 && t < 34.6) {
      const k = seg(t, 31.4, 32.2), back = seg(t, 33.7, 34.5);
      helicase(lerp(2080, 1690, easeOut(k)) + 420 * easeIn(back), 360 + 8 * Math.sin(t * 3), 1.35, t, { sad: t > 33.5 });
      if (t > 33.6) { boilSeed('hsw'); emote('sweat', 1690 + 420 * easeIn(back) + 40, 270, 14, seg(t, 33.6, 33.8), t - 33.6); }
    }
    thermometer(t, tp, (t > 57.8) + (t > 76.4) + (t > 84.5) + seg(t, 57.8, 58.1) * 0, { spin: t > 87.4 && t < 89.8 });
    // the formula: 2ⁿ − 2n
    if (t > 90.3) {
      const k = seg(t, 90.4, 90.9); card(960, 150, 560, 190, k, 'f1');
      formula([['2', 1, -1.35, .08], ['n', .55, -.78, -.42], ['-', .7, -.08, .1], ['2', 1, .6, .08], ['n', 1, 1.25, .12]], [91.1, 91.5, 92.05, 92.4, 92.75], 960, 150, 100, t);
    }
    if (lt < .7) { const r = kf(lt, [[0, 0], [.7, 1400]], easeOut); irisShape(ellPts(W / 2, H / 2, Math.max(4, r), Math.max(4, r), 48), PAL.ink); }
    if (t > 94.3) brushWipe((t - 94.3) / .6, [PC.tail, PC.tailLt]);
  }
  // slots for the multiplied copies around the board, nearest first
  const SLOTS = (() => {
    const S = [];
    for (let i = 0; i < 13; i++) for (let j = 0; j < 15; j++) {
      const x = -820 + i * 300 + 60 * (hash(i * 31 + j) - .5), y = -420 + j * 145 + 40 * (hash(i * 17 + j * 3) - .5);
      if (x > 260 && x < 1660 && y > 80 && y < 1010) continue;            // the board
      if (x > 300 && x < 1620 && y < 20) continue;                          // the card
      S.push([x, y, Math.hypot(x - 960, (y - 545) * 1.6)]);
    }
    S.sort((a, b) => a[2] - b[2]);
    return S.slice(0, 64).map(([x, y], i) => [x, y, 2.1 * Math.log2(i / 2 + 2) / 5 - .42]);
  })();
  function miniTarget(t, i, M) {                                  // a target duplex: two equal strands, primers at both ends
    const L = 8, y0 = -DG / 2, y1 = DG / 2, x0 = -L / 2 * UX;
    boilSeed('mt' + i);
    for (let u = .25; u < L; u += 1) inkLine([[x0 + u * UX, y0 + STW / 2], [x0 + u * UX, y1 - STW / 2]], 2.4, BASE[(u * 3 | 0) % 4], 'ink', 0);
    const bar = (a, b, y, col) => paint(ribbon([[x0 + a * UX, y], [x0 + b * UX, y]], STW, STW), { wash: col, ink: PAL.ink, sw: .9 });
    bar(0, 2, y0, PC.F); bar(2, L, y0, PC.neu); bar(0, L - 2, y1, PC.neu); bar(L - 2, L, y1, PC.R);
    paint([[x0 + L * UX, y0 - STW * .95], [x0 + L * UX + STW * 1.3, y0], [x0 + L * UX, y0 + STW * .95]], { wash: PC.neu, ink: PAL.ink, sw: .9 });
    paint([[x0, y1 - STW * .95], [x0 - STW * 1.3, y1], [x0, y1 + STW * .95]], { wash: PC.neu, ink: PAL.ink, sw: .9 });
  }

  // =========================== D + E: tails, the 3′ rule, counting primers (94.6–141.6) ===========================
  const DX = 3200, DY = [380, 760];                                // the demo rows (world, offset to the right)
  function shotDE(t, lt) {
    const tp = tempAt(t);
    liquid(t, tp);
    const whip1 = ease(seg(t, 119.25, 119.95)), whip2 = ease(seg(t, 128.45, 129.15));
    let c = kf(t, [[94.6, [X(7), 300, 3.0]], [98.4, [X(7), 300, 3.0]], [99.4, [X(6.1), 300, 3.0]], [99.9, [X(6), 302, 3.05]], [100.9, [960, 545, 1.25]], [107.6, [960, 545, 1.25]], [108.6, [960, 545, 1.03]], [113.3, [960, 545, 1.03]], [114.2, [960, 545, .99]]], ease);
    if (t > 119.25) c = [lerp(960, DX + 960, whip1), lerp(545, 570, whip1), lerp(.99, 1, whip1)];
    if (t > 128.45) c = [lerp(DX + 960, 960, whip2), lerp(570, 545, whip2), lerp(1, .99, whip2)];
    if (t > 136.2) { const k = ease(seg(t, 136.2, 137.2)); c = [960, lerp(545, 455, k), lerp(.99, .8, k)]; }
    cam(c[0] + 5 * wob(t, .08), c[1] + 4 * wob(t, .06), c[2]);
    const onBoard = t < 119.95 || t > 128.45, onDemo = t > 119.25 && t < 129.15;
    let info = null;
    if (onBoard) {
      const hlD = (s, q) => {
        const o = {};
        if (t > 106.5 && t < 108.6 && q.g === 1 && !s.orig) o.tailHalo = seg(t, 106.7, 107.0) * (1 - seg(t, 108.2, 108.6));
        if (t > 111.8 && t < 113.6 && q.g === 2 && s.gen === 2 && (s.a === M1.FA && s.d === -1 || s.b === M1.RB && s.d === 1)) o.haloR = [s.d === 1 ? 14 : 4, s.d === 1 ? 16 : 6, seg(t, 111.9, 112.3) * (1 - seg(t, 113.2, 113.6)), '#FFFFFF'];
        if (t > 117.0 && q.g === 3 && tgtRow(M1.G[3][q.r], M1)) { o.halo = seg(t, 117.2, 117.6) * (1 - seg(t, 119.0, 119.5)); o.glow = .6 * o.halo; }
        if (t > 130.4 && t < 132.6 && s.orig) { o.halo = seg(t, 130.6, 131.0) * (1 - seg(t, 132.2, 132.6)); o.haloCol = '#D8E6FF'; }
        if (t > 132.6 && t < 135.6 && !s.orig) o.halo = .8 * seg(t, 132.74, 133.1) * (1 - seg(t, 135.2, 135.6));
        if (t > 133.6 && t < 136.2 && !s.orig) { const k = seg(t, PT(s), PT(s) + .25) * (1 - seg(t, 135.8, 136.2)); o.haloR = [s.d === 1 ? 6 : 12, s.d === 1 ? 8 : 14, k, '#FFFFFF']; }
        return o;
      };
      info = drawBoard(t, M1, CY1, hlD, { taqS: g => [0, .62, .5, .42][g], primerStart: (r, g) => g === 1 && r === 1 ? [X(6), 300] : null });
      if (t < 100.9) {                                            // the close-up primer, growing its tail
        const tk = ease(seg(t, 98.44, 99.4)), s = { d: 1, a: 4, b: 8, id: 900, orig: false };
        drawStrand(s, M1, u => 300 + 3 * Math.sin(u + t * 1.6), 6 - 2 * tk, 8, { t, key: 'cu', tailHalo: seg(t, 99.3, 99.6) * (1 - seg(t, 100.5, 100.9)) });
        endMark('5', X(6 - 2 * tk) - 30, 270, 22, seg(t, 96.65, 97.0) * (1 - seg(t, 100.3, 100.7)), PAL.ink, 'cu5');
        endMark('3', X(8) + 36, 270, 22, .6 * seg(t, 97.2, 97.5) * (1 - seg(t, 100.3, 100.7)), PAL.ink, 'cu3');
        if (seg(t, 96.65, 97.0) > 0) glow(X(6 - 2 * tk) - 4, 300, 50, '#FFF0B0', .7 * seg(t, 96.65, 97.0) * (1 - seg(t, 98.4, 98.8)));
        scissors(X(5), 252, 22, seg(t, 99.3, 99.6) * (1 - seg(t, 100.3, 100.7)), t, 'cu');
      }
      if (info.g === 1 && t > 101.6 && t < 104.9) info.rows.forEach((row, i) => { const k = seg(t, 101.64 + i * .25, 102.0 + i * .25); if (k > 0 && k < 1) { const u = row.nw.d === 1 ? 5 : 15; sparkle(X(u), row.newY(u) - row.nw.d * 60 * 0 + (row.nw.d === 1 ? -60 : 60), 26, k); } });
      if (info.g === 3) info.rows.forEach((row, i) => { if (!tgtRow(row, M1)) return; const k = seg(t, 117.6, 118.0) * (1 - seg(t, 119.0, 119.4)); scissors(X(4.2), row.y - 52, 26, k, t, 'e' + i); scissors(X(15.8), row.y - 52, 26, k, t, 'f' + i); });
    }
    if (onDemo) { push(); translate(DX, 0); demo(t); pop(); }
    camEnd();
    // Clawd
    let o = talk(t, emotions(t, [[94.6, 'happy'], [95.4, 'surprised', { emote: '!!' }], [96.6, 'thinking', { lookX: -1, lookY: -.6 }], [98.4, 'hopeful', { lookX: -1, lookY: -.6 }], [101.6, 'confused', { lookX: -1 }],
      [105.3, 'neutral', { lookX: -1 }], [106.7, 'happy'], [108.7, 'determined', { lookX: -1 }], [112.0, 'excited', { emote: null, lookX: -1 }], [113.5, 'thinking', { lookX: -1 }], [117.4, 'proud'],
      [119.3, 'excited', { emote: null }], [120.0, 'determined', { lookX: -1 }], [121.6, 'happy'], [123.3, 'thinking', { lookX: -1, lookY: -.6 }], [124.6, 'happy'], [126.2, 'confused', { lookX: -1, lookY: -.8 }],
      [126.9, 'excited', { emote: null, lookX: -1, lookY: .6 }], [128.4, 'happy'], [129.2, 'thinking', { lookX: -1 }], [130.6, 'neutral', { lookX: -1, lookY: -.3 }], [133.7, 'excited', { emote: null, lookX: -1 }],
      [136.9, 'proud'], [139.0, 'happy', { lookX: -1, lookY: -1 }]]));
    if (t > 129.3 && t < 130.5) o.aL = 1.2 + .2 * Math.sin(t * 14);
    if (t > 133.7 && t < 135.4) o.aL = .9 + .4 * Math.abs(Math.sin((t - 133.7) * 14 * Math.PI / 2 / 1.7 * 1.7));
    if (t > 137.0 && t < 139.6) o.aL = 1.1;
    o.view = 'q'; o.flip = true;
    if (t > 119.25 && t < 119.95 || t > 128.45 && t < 129.15) { o.smear = .8 * Math.sin(Math.PI * (t < 125 ? seg(t, 119.25, 119.95) : seg(t, 128.45, 129.15))); o.smearDir = t < 125 ? 1 : -1; }
    floatClawd(HOST[0], HOST[1], HU, o, t);
    thermometer(t, tp, t < 128.5 ? (t > 107.4) + (t > 112.6) + (t > 116.8) : 3);
    if (t > 119.3 && t < 119.9 || t > 128.5 && t < 129.1) speedLines(t);
    if (t > 136.6) {                                               // 2ⁿ⁺¹ − 2
      const k = seg(t, 136.7, 137.2); card(960, 1000 - 860, 600, 190, k, 'f2');
      formula([['2', 1, -1.45, .08], ['n', .5, -.88, -.42], ['+', .45, -.5, -.48], ['1', .5, -.16, -.48], ['-', .7, .45, .1], ['2', 1, 1.15, .08]], [137.7, 138.05, 138.3, 138.6, 139.05, 139.35], 960, 140, 100, t);
    }
    if (lt < .3) brushWipe(.5 + lt / .6, [PC.tail, PC.tailLt]);
    if (t > 141.3) brushWipe((t - 141.3) / .6, [PC.mach, PC.machDk]);
  }
  // when each primer sparkles while they're counted (133.7–135.3), in reading order down the board
  const PT = s => { let k = 0; for (const row of M1.G[3]) for (const x of [row.top, row.bot]) { if (x === s) return 133.7 + k * .115; if (!x.orig) k++; } return 133.7; };
  function speedLines(t) { for (let i = 0; i < 9; i++) { boilSeed('spd' + i); const y = 90 + i * 115 + 30 * hash(i), x = hash(i + 4) * W; inkLine([[x - 300, y], [x + 300, y]], 2.4, mixCol(PAL.cream, PAL.ink, .15), 'dry', 0); } }
  function demo(t) {                                               // the 3′ rule: a tail on the 3′ end (✗) vs on the 5′ end (✓)
    const tm = { d: -1, a: 0, b: 20, id: 950, orig: true };
    DY.forEach((y, row) => {
      const ty = u => y + DG / 2 + 3 * Math.sin(u * .8 + t * 1.7 + row), py = u => y - DG / 2 + 3 * Math.sin(u * .8 + t * 1.7 + row);
      const good = row === 1;
      rungs(py, ty, 6, good ? 8 + 12 * ease(seg(t, 126.85, 128.2)) : 8, 'dm' + row);
      drawStrand(tm, M1, ty, 0, 20, { t, key: 'dt' + row });
      boilSeed('dp' + row);
      if (good) {
        const s = { d: 1, a: 4, b: 20, id: 960, orig: false };
        drawStrand(s, M1, py, 4, 8 + 12 * ease(seg(t, 126.85, 128.2)), { t, key: 'dg', flap: 1, tailHalo: seg(t, 121.2, 121.6) * (1 - seg(t, 122.8, 123.2)) });
      } else {
        // primer, then the tail stuck on its 3′ end, flapping up; its 3′ point is at the tail's free end
        paint(ribbon(path(6, 8, py), STW, STW), { wash: PC.F, ink: PAL.ink, sw: .9 });
        const ang = .8 + .1 * Math.sin(t * 5), P = []; for (let k = 0; k <= 6; k++) { const q = k / 6, a = ang * (.4 + .6 * q); P.push([X(8) + Math.cos(a) * 2 * UX * q, py(8) - Math.sin(a) * 2 * UX * q]); }
        if (seg(t, 121.2, 121.6) * (1 - seg(t, 122.8, 123.2)) > 0) paint(ribbon(P, STW + 18, STW + 18), { wash: '#FFE3E6', washOp: 255 * seg(t, 121.2, 121.6) * (1 - seg(t, 122.8, 123.2)), ink: null });
        paint(ribbon(P, STW, STW * .85), { wash: PC.tail, ink: PAL.ink, sw: .9 });
        const e = P[6], b = P[5], a2 = Math.atan2(e[1] - b[1], e[0] - b[0]), n = [-Math.sin(a2), Math.cos(a2)];
        paint([[e[0] + n[0] * STW * .8, e[1] + n[1] * STW * .8], [e[0] + Math.cos(a2) * STW * 1.2, e[1] + Math.sin(a2) * STW * 1.2], [e[0] - n[0] * STW * .8, e[1] - n[1] * STW * .8]], { wash: PC.tail, ink: PAL.ink, sw: .9 });
      }
      // the 3′ ends glow; the good one clicks snug
      const k3 = seg(t, 123.28, 123.6) * (1 - seg(t, 125.9, 126.3));
      if (k3 > 0) { const e = good ? [X(8), py(8)] : [X(8) + Math.cos(.8) * 2 * UX, py(8) - Math.sin(.8) * 2 * UX]; glow(e[0], e[1], 70, '#FFF0B0', k3); endMark('3', e[0] + 46, e[1] - 46, 40, k3, PAL.ink, 'd3' + row); }
      if (good) { const k = seg(t, 124.5, 124.9); if (k > 0 && k < 1) sparkle(X(8) + 10, py(8), 34, k); }
      // marks
      if (good) check(X(0) - 110, y, 90, seg(t, 121.6, 122.1), 'g'); else cross(X(0) - 110, y, 80, seg(t, 124.9, 125.4), 'b');
      // Taq: the good one runs, the bad one can't find a 3′ end on the template
      const ti = seg(t, 126.0, 126.5);
      if (ti > 0) {
        if (good) { const tip = 8 + 12 * ease(seg(t, 126.85, 128.2)), sit = [X(tip) + 12, y - DG / 2 - STW / 2 - 22], p = ti < 1 ? arcPt([sit[0] + 120, sit[1] - 220], sit, 40, easeOut(ti)) : sit; taq(p[0], p[1], .55, t, { key: 'dgq', happy: t > 128.0, rot: .05 * Math.sin(t * 9) }); }
        else { const sit = [X(10) + 30, py(8) - 150], bump = Math.sin(seg(t, 126.4, 126.9) * Math.PI), p = ti < 1 ? arcPt([sit[0] + 140, sit[1] - 180], sit, 40, easeOut(ti)) : [sit[0] - 18 * bump, sit[1] + 10 * bump]; taq(p[0], p[1], .55, t, { key: 'dbq', sad: t > 126.9, rot: -.2 * bump }); if (t > 126.5) { boilSeed('dbe'); emote('?', p[0] + 50, p[1] - 70, 14, seg(t, 126.5, 126.7), t - 126.5); } }
      }
    });
  }

  // =========================== F: back at the bench (141.6–149.5) ===========================
  function shotF(t, lt) {
    cam(1150 + 4 * wob(t, .1), 600 + 3 * wob(t, .08), 1.12 + .02 * seg(t, 141.6, 149.5));
    room(t);
    const lidA = t < 144.4 ? 0 : backOut(seg(t, 144.4, 144.75)), lights = 3 * frac(Math.max(0, t - 142.4) * 2.4) * (t < 143.6 ? 1 : 0) + (t >= 143.6 ? 3 : 0);
    const g = .3 + .7 * seg(t, 142.4, 144.3);
    machine(t, lidA, lights, g, { capA: t < 144.5 ? 0 : lerp(0, -2.2, ease(seg(t, 144.5, 144.8))) });
    if (t > 143.6 && t < 144.5) { const k = seg(t, 143.6, 144.4); for (let i = 0; i < 4; i++) { boilSeed('fs' + i); sparkle(TUBE[0] + (i - 1.5) * 50, TUBE[1] - 30 - 30 * hash(i), 30, frac(k * 2 + i * .25)); } }
    let o = talk(t, emotions(t, [[141.6, 'happy'], [144.6, 'excited', { emote: null }], [145.6, 'proud'], [146.3, 'love']]));
    const k = seg(t, 144.6, 145.3), p = arcPt([TUBE[0], TUBE[1] + 20], [960, MBASE], 260, ease(k)), u = lerp(3, 24, easeOut(k));
    if (t > 146.3) o.aR = 1.15 + .45 * Math.sin((t - 146.3) * 13);
    if (t > 144.6) clawd(p[0], p[1], u, { ...o, noShadow: k < .9, sq: o.sq + (k >= 1 ? .22 * spring(t, 145.3, 7, 22) : -.12 * Math.sin(k * Math.PI)), view: 'front', boilKey: 'cF',
      armL: (u2) => helix(1.2 * u2, 0, u2 / 20, t, 'heldL', .5), armR: (u2) => helix(1.2 * u2, 0, u2 / 20, t + 1, 'heldR', .5) });
    // the copies spill out of the open tube
    for (let i = 0; i < 14; i++) {
      const t0 = 144.55 + i * .12, k = seg(t, t0, t0 + 1.5); if (k <= 0) continue;
      const end = [TUBE[0] + (hash(i) - .5) * 900, 360 + 260 * hash(i + 5)], q = arcPt([TUBE[0], TUBE[1] - 10], end, 220 + 120 * hash(i + 9), easeOut(k));
      push(); translate(q[0], q[1] + 10 * Math.sin(t * 2 + i) * k); rotate((hash(i + 2) - .5) * 1.2 + k * (hash(i + 3) - .5)); scale(.9 * backOut(seg(t, t0, t0 + .3))); helix(0, 0, 1, t + i, 'sp' + i, .35); pop();
    }
    const at = toScreen(960, MBASE - 4 * 24);
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [PC.mach, PC.machDk]);
    if (t > 147.6) iris(at[0], at[1], kf(t, [[147.6, 1500], [148.3, 250], [148.9, 230], [149.35, 0]], ease));
  }

  shots([[0, shotA], [22.6, shotBC], [94.6, shotDE], [141.6, shotF]]);
})();

// amnesia.js: "Pip讲消失的三年", 384 s. Pip's string of memory pearls starts with three blank ones: were those years never
// written, or written and locked away? The old answer (an unripe hippocampus), the 2025 infant fMRI study, the mouse
// engram experiments (light brings a "forgotten" memory back), two guesses for why we can't get in (a brain under
// construction, a key that no longer fits), false first memories, and the locked door. See STORYBOARD_AMNESIA.md.
// Every time is tied to a voice line: L(i, d) = line i's start + d seconds.
(() => {
  const K = MK;
  const Z = {
    // worlds
    home: '#F6D9B8', homeBlob: '#FBE9D2', floor: '#E8C29A', rug: '#D98C6E', dusk: '#F3C28C', duskBlob: '#F9DDB3',
    nursery: '#F8E0D2', nurseryBlob: '#FCEEE5', brainBg: '#D9C8E4', brainBgBlob: '#ECE1F1', clinic: '#CFE6E6', clinicBlob: '#E7F3F2',
    sand: '#EFE0C4', sandBlob: '#F8EEDC', labFloor: '#E2CDA6', board: '#F4EEDD', boardBlob: '#FBF7EB',
    site: '#EED39C', siteBlob: '#F7E6C2', album: '#E9D7B8', albumBlob: '#F4E8D2', page: '#F6ECD9',
    // the codes
    pearl: '#FBE7B4', pearlDk: '#E9C277', pearlGlow: '#FFD98A', blank: '#CFC6D6', blankDk: '#A99DB6',
    skill: '#7FAE5A', skillDk: '#4E7A3A', hippo: '#E58A7A', hippoDk: '#B9604F', hippoLt: '#F4B9AA',
    brain: '#EDB9C3', brainDk: '#C98D9C', cereb: '#D99AA8', stem: '#D7A2A6',
    door: '#4B4C8C', doorDk: '#33346A', doorLt: '#6C6DAE', gold: '#F2C14A', goldDk: '#C99A2E',
    blue: '#BCD8FF', blueG: '#7DB4FF', neuron: '#B9ACEA', neuronDk: '#7466AE', engram: '#F4C54A', mint: '#8FD3B6', syn: '#E9A83C',
    sea: '#E8A548', seaDk: '#B97528', red: '#D9534F', green: '#3E9A4E', mist: '#E4DCEA',
    mouse: '#BBB0C8', mouseDk: '#8F84A2', pink: '#EAA3B2', box: '#F4EADB', stripe: '#8E8FB4',
    mri: '#F2EEE6', mriDk: '#C9C3B8', bed: '#9BB7C9', screen: '#2F3A52', hat: '#F2C14A', hatDk: '#C99A2E'
  };
  const PAPA = { pip: '#5E86CF', pipDk: '#3E62A3', belly: '#D3E0F4' }, MAMA = { pip: '#DE7895', pipDk: '#B2526F', belly: '#F8D7E0' };
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));
  const popK = (t, a, len = .35) => backOut(seg(t, a, a + len));
  const win = (t, a, b, f = .35) => seg(t, a, a + f) * (1 - seg(t, b - f, b));           // 0 → 1 → 0 over [a, b]
  const rotP = (P, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return P.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
  function tinted(cols, fn) { const old = { pip: PIPC.pip, pipDk: PIPC.pipDk, belly: PIPC.belly }; Object.assign(PIPC, cols); try { fn(); } finally { Object.assign(PIPC, old); } }
  const bigBg = (col, blob, t, key) => K.wash(col, t, { key, blob, rect: rectPts(-2400, -2800, W + 4800, H + 4600) });

  // Pip the host: acted moods; swims in place unless it stands on a floor (o.stand). Returns the ground point and the hand.
  function host(x, y, u, t, keys, extra = {}, key = 'ph', seed = 0) {
    const o = { ...K.act(t, keys, seed), talk: true, ...extra };
    let yb = y;
    if (extra.stand) pip(x, y, u, { ...o, sq: (o.sq || 0) + .03 * voAt(t), key });
    else yb = K.swim(x, y, u, t, o, key);
    return { yb, o, hand: at => K.hand(x, yb, u, at, { flip: o.flip, dy: o.dy }) };
  }
  function hardHat(x, yb, u, k, key, flip = false) {             // a yellow hard hat; (x, yb) = Pip's ground point
    if (k <= .02) return; boilSeed('hh' + key);
    const cx = x + (flip ? -.12 : .12) * u, cy = yb - 4.6 * u - (1 - backOut(k)) * 4 * u, s = u;
    paint([[cx - 1.5 * s, cy], [cx - 1.35 * s, cy - .9 * s], [cx - .6 * s, cy - 1.45 * s], [cx + .6 * s, cy - 1.45 * s], [cx + 1.35 * s, cy - .9 * s], [cx + 1.5 * s, cy]], { wash: Z.hat, fill: Z.hatDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: clamp(u / 30, .6, 1.2), curv: .5 });
    paint(rrPts(cx - 1.95 * s, cy - .12 * s, 3.9 * s, .38 * s, .16 * s), { wash: Z.hatDk, ink: PAL.ink, sw: clamp(u / 30, .6, 1.2) });
    paint(rrPts(cx - .16 * s, cy - 1.42 * s, .32 * s, 1.3 * s, .1 * s), { wash: mixCol(Z.hat, PAL.cream, .4), ink: null });
  }
  function shears(x, y, s, ang, open, key) {                      // garden shears: two blades on a pivot, long handles
    boilSeed('sh' + key); push(); translate(x, y); rotate(ang);
    for (const sg of [-1, 1]) { push(); rotate(sg * open * .4);
      paint([[0, -s * .07], [s * .95, -s * .015 * sg - s * .02], [s * 1.05, 0], [s * .95, s * .03], [0, s * .07]], { wash: '#CBD0D8', ink: PAL.ink, sw: .9 });
      paint(ribbon([[0, 0], [-s * .45, sg * s * .08], [-s * .9, sg * s * .12]], s * .12, s * .1), { wash: '#C0503E', ink: PAL.ink, sw: .9 }); pop(); }
    paint(ellPts(0, 0, s * .06, s * .06, 8), { wash: PAL.ink, ink: null });
    pop();
  }

  // ================================ the props ================================
  // A memory pearl: glass with one tiny scene inside. o.v = scene, o.blank 0..1 drains it grey, o.lit glows,
  // o.crack 0..1 shows it is pieced together, o.k pops it in, o.half: only half of it bright (an incomplete memory).
  const VIGN = ['sun', 'house', 'flower', 'heart', 'ball', 'cake', 'canyon', 'beach', 'steps', 'face', 'fish', 'box'];
  function vignette(x, y, r, v, key) {
    boilSeed('vg' + key);
    const sw = clamp(r / 40, .35, .9);
    if (v === 'sun') { paint([[x - r, y + r * .5], [x - r * .4, y + r * .05], [x + r * .2, y + r * .3], [x + r * .8, y - r * .05], [x + r, y + r * .5]], { wash: '#9CC26E', ink: null, curv: .5 }); paint(ellPts(x + r * .25, y - r * .4, r * .28, r * .28, 12), { wash: '#F4B43C', ink: null }); }
    else if (v === 'house') { paint(rectPts(x - r * .45, y - r * .1, r * .9, r * .65), { wash: '#E48F6A', ink: PAL.ink, sw }); paint([[x - r * .6, y - r * .08], [x, y - r * .62], [x + r * .6, y - r * .08]], { wash: '#9E5A73', ink: PAL.ink, sw }); paint(rectPts(x - r * .1, y + r * .2, r * .2, r * .35), { wash: '#7A4B3A', ink: null }); }
    else if (v === 'flower') { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; paint(ellPts(x + Math.cos(a) * r * .32, y - r * .15 + Math.sin(a) * r * .32, r * .22, r * .22, 10), { wash: '#E77F9C', ink: null }); } paint(ellPts(x, y - r * .15, r * .17, r * .17, 10), { wash: '#F4C54A', ink: null }); inkLine([[x, y + r * .1], [x + r * .05, y + r * .7]], sw * 1.4, '#5E8C3E', 'ink', 0); }
    else if (v === 'heart') paint(heartPts(x, y + r * .05, r * .6), { wash: '#E2708C', ink: PAL.ink, sw });
    else if (v === 'ball') { paint(ellPts(x, y + r * .1, r * .5, r * .5, 16), { wash: '#E2645A', ink: PAL.ink, sw }); inkLine([[x - r * .5, y + r * .1], [x, y + r * .25], [x + r * .5, y + r * .1]], sw * 2, PAL.cream, 'ink', .5); }
    else if (v === 'cake') { paint(rectPts(x - r * .55, y - r * .05, r * 1.1, r * .55), { wash: '#F6C8D2', ink: PAL.ink, sw }); inkLine([[x - r * .55, y + r * .15], [x + r * .55, y + r * .15]], sw * 1.5, '#E2708C', 'ink', .3); for (let i = 0; i < 3; i++) { const cx = x + (i - 1) * r * .3; paint(rectPts(cx - r * .05, y - r * .38, r * .1, r * .33), { wash: '#7FB6E0', ink: null }); paint(ellPts(cx, y - r * .48, r * .07, r * .11, 8), { wash: '#F4B43C', ink: null }); } }
    else if (v === 'canyon') { paint([[x - r, y - r * .5], [x - r * .2, y - r * .35], [x - r * .15, y + r * .7], [x - r, y + r * .7]], { wash: '#D9875A', ink: null }); paint([[x + r, y - r * .3], [x + r * .25, y - r * .2], [x + r * .2, y + r * .7], [x + r, y + r * .7]], { wash: '#C9744C', ink: null }); paint([[x - r * .18, y + r * .45], [x + r * .22, y + r * .45], [x + r * .2, y + r * .7], [x - r * .15, y + r * .7]], { wash: '#6FA8D6', ink: null }); }
    else if (v === 'beach') { paint([[x - r, y + r * .05], [x + r, y - r * .05], [x + r, y + r * .3], [x - r, y + r * .35]], { wash: '#6FA8D6', ink: null }); paint([[x - r, y + r * .35], [x + r, y + r * .3], [x + r, y + r * .8], [x - r, y + r * .8]], { wash: '#F2D48C', ink: null }); paint(ellPts(x - r * .35, y - r * .4, r * .22, r * .22, 12), { wash: '#F4B43C', ink: null }); }
    else if (v === 'steps') { for (let i = 0; i < 3; i++) { const fx = x - r * .45 + i * r * .42, fy = y + (i % 2 ? -r * .15 : r * .2); paint(ellPts(fx, fy, r * .12, r * .19, 10, 0, .3), { wash: '#8E5B8F', ink: null }); } }
    else if (v === 'face') { paint(ellPts(x, y, r * .55, r * .6, 16), { wash: MAMA.pip, ink: PAL.ink, sw }); for (const sd of [-1, 1]) paint(ellPts(x + sd * r * .2, y - r * .08, r * .07, r * .1, 8), { wash: PAL.ink, ink: null }); inkLine([[x - r * .14, y + r * .22], [x, y + r * .3], [x + r * .14, y + r * .22]], sw * 1.2, PAL.ink, 'ink', .6); }
    else if (v === 'fish') { paint([[x - r * .55, y], [x - r * .1, y - r * .3], [x + r * .35, y], [x - r * .1, y + r * .3]], { wash: '#6FB7C9', ink: PAL.ink, sw, curv: .6 }); paint([[x + r * .3, y], [x + r * .65, y - r * .25], [x + r * .65, y + r * .25]], { wash: '#4E95A8', ink: PAL.ink, sw }); }
    else if (v === 'box') { paint(rectPts(x - r * .6, y - r * .3, r * 1.2, r * .75), { wash: Z.box, ink: PAL.ink, sw }); for (let i = 0; i < 4; i++) inkLine([[x - r * .45 + i * r * .3, y - r * .28], [x - r * .45 + i * r * .3, y + r * .43]], sw * 1.5, Z.stripe, 'ink', 0); }
  }
  function pearl(x, y, r, o = {}) {
    const k = o.k ?? 1; if (k <= .02) return;
    const R = r * (o.noPop ? k : backOut(clamp(k))), blank = clamp(o.blank || 0), key = 'pl' + (o.key || '');
    if ((o.lit || 0) > .02) glow(x, y, R * 2.6, Z.pearlGlow, o.lit);
    boilSeed(key);
    paint(ellPts(x, y, R, R, 24), { wash: mixCol(Z.pearl, Z.blank, blank), fill: mixCol(Z.pearlDk, Z.blankDk, blank), fillOp: 55, tex: .4, ink: mixCol(PAL.ink, Z.blankDk, blank * .6), sw: clamp(R / 30, .5, 1.3) });
    if (o.v && blank < .98) { const q = 1 - blank; vignette(x, y + R * .05, R * .72 * q, o.v, key); }
    if (o.half) { boilSeed(key + 'hf'); const P = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI; P.push([x + Math.cos(a) * R * .97, y + Math.sin(a) * R * .97]); } paint(P, { wash: Z.blank, washOp: 200 * o.half, ink: null }); }
    if (o.crack) { boilSeed(key + 'ck'); const c = clamp(o.crack); inkLine([[x - R * .9, y - R * .2], [x - R * .3, y - R * .05], [x - R * .1, y + R * .4], [x + R * .2, y + R * .9]].slice(0, 1 + Math.ceil(c * 3)), clamp(R / 40, .6, 1.3), PAL.ink, 'inkfine', 0); inkLine([[x - R * .3, y - R * .05], [x + R * .35, y - R * .35], [x + R * .9, y - R * .3]].slice(0, 1 + Math.ceil(c * 2)), clamp(R / 40, .6, 1.3), PAL.ink, 'inkfine', 0); }
    boilSeed(key + 'hl');
    paint(ellPts(x - R * .38, y - R * .44, R * .24, R * .12, 10, 0, -.6), { wash: PAL.cream, washOp: blank > .5 ? 120 : 230, ink: null });
    if (blank > .5) { boilSeed(key + 'dash'); for (let i = 0; i < 10; i += 2) { const a0 = i / 10 * TAU + .2, a1 = a0 + TAU / 14; inkLine([[x + Math.cos(a0) * R * 1.12, y + Math.sin(a0) * R * 1.12], [x + Math.cos((a0 + a1) / 2) * R * 1.13, y + Math.sin((a0 + a1) / 2) * R * 1.13], [x + Math.cos(a1) * R * 1.12, y + Math.sin(a1) * R * 1.12]], clamp(R / 35, .5, 1.1), Z.blankDk, 'inkfine', .5); } }
  }
  // the string: a thread through pearls; P = [[x, y, v, blank], ...] drawn in order
  function string(P, r, t, key, o = {}) {
    boilSeed('str' + key);
    const pts = P.map(([x, y], i) => [x, y + 5 * wob(t, .2, i * .13)]);
    inkLine(pts, 1.2, mixCol(PAL.ink, Z.pearlDk, .4), 'ink', .5);
    P.forEach(([x, y, v, blank], i) => pearl(pts[i][0], pts[i][1], r, { v, blank, key: key + i, lit: (o.lit && o.lit(i)) || 0 }));
  }
  function cloud(cx, cy, rx, ry, k, from, key) {                 // a thought cloud with two bubbles back to the thinker
    if (k <= .02) return; boilSeed('cl' + key);
    const q = backOut(k);
    paint(ellPts(lerp(from[0], cx, .25), lerp(from[1], cy, .25), 12 * q, 10 * q, 10), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(ellPts(lerp(from[0], cx, .45), lerp(from[1], cy, .45), 19 * q, 16 * q, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    const P = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; P.push([cx + Math.cos(a) * rx * q * (1 + .07 * Math.sin(a * 8)), cy + Math.sin(a) * ry * q * (1 + .07 * Math.sin(a * 8))]); }
    paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2, curv: .3 });
  }
  function mist(x, y, r, k, key) {                                // a pearl dissolving into mist: soft puffs spreading out
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 7; i++) { boilSeed('ms' + key + i); const a = i / 7 * TAU + .3, d = r * (.2 + 1.4 * easeOut(k)); paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d - 30 * k, r * (.45 + .3 * k), r * (.35 + .25 * k), 12), { fill: Z.mist, fillOp: 160 * (1 - k), bleed: .25, tex: .3, ink: null }); }
  }
  // An arched door with planks, gold studs and a keyhole. (x, y) = the middle of its sill. o.hole: 'key' | 'baby'.
  function door(x, y, s, o = {}) {
    const w = 170 * s, h = 300 * s, key = 'dr' + (o.key || '');
    auditBox('door', key, x - w / 2, y - h, x + w / 2, y);
    boilSeed(key);
    const P = [[x - w / 2, y]]; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; P.push([x + Math.cos(a) * w / 2, y - h + w / 2 + Math.sin(a) * w / 2]); } P.push([x + w / 2, y]);
    paint(P.map(([a, b]) => [x + (a - x) * 1.16, y + (b - y) * 1.06 + 6 * s]), { wash: o.frame || Z.doorDk, ink: PAL.ink, sw: clamp(s, .7, 1.4) });
    paint(P, { wash: Z.door, fill: Z.doorDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: clamp(s, .7, 1.4) });
    for (const dx of [-.25, .25]) inkLine([[x + dx * w, y - h + w * .12 * (1 + Math.abs(dx))], [x + dx * w, y - 6 * s]], clamp(s * .9, .5, 1.1), Z.doorDk, 'inkfine', 0);
    for (const yy of [.3, .78]) { paint(rrPts(x - w * .46, y - h * yy - 9 * s, w * .92, 18 * s, 6 * s), { wash: Z.doorLt, ink: PAL.ink, sw: clamp(s * .7, .4, 1) }); for (const dx of [-.36, 0, .36]) paint(ellPts(x + dx * w, y - h * yy, 5 * s, 5 * s, 8), { wash: Z.gold, ink: null }); }
    const kx = x + w * .28, ky = y - h * .5;
    boilSeed(key + 'kh');
    paint(ellPts(kx, ky, 26 * s, 34 * s, 14), { wash: Z.gold, fill: Z.goldDk, fillOp: 60, ink: PAL.ink, sw: clamp(s * .8, .5, 1.1) });
    if (o.hole === 'baby') paint(heartPts(kx, ky + 2 * s, 14 * s).map(([a, b], i) => [a + 2 * s * Math.sin(i), b]), { wash: '#1E1830', ink: null });
    else { paint(ellPts(kx, ky - 6 * s, 8 * s, 8 * s, 10), { wash: '#1E1830', ink: null }); paint([[kx - 4 * s, ky - 4 * s], [kx + 4 * s, ky - 4 * s], [kx + 7 * s, ky + 16 * s], [kx - 7 * s, ky + 16 * s]], { wash: '#1E1830', ink: null }); }
    if ((o.lock || 0) > 0) K.burst(kx, ky, 40 * s, o.lock, Z.goldDk, key + 'lk');
    return { kx, ky, w, h };
  }
  function keyhole(cx, cy, r) {                                   // the keyhole outline (for an iris-shaped reveal)
    const P = []; for (let i = 0; i <= 18; i++) { const a = -Math.PI * 1.25 + i / 18 * Math.PI * 1.5; P.push([cx + Math.cos(a) * r, cy - r * .35 + Math.sin(a) * r]); }
    return [...P, [cx + r * .55, cy + r * 1.6], [cx - r * .55, cy + r * 1.6]];
  }
  // a gold key; o.bow: 'plain' | 'talk' (a speech bubble with a little Pip in it: language and self)
  function goldKey(x, y, s, ang, o = {}) {
    boilSeed('gk' + (o.key || '')); push(); translate(x, y); rotate(ang);
    paint(rrPts(0, -6 * s, 120 * s, 12 * s, 5 * s), { wash: Z.gold, fill: Z.goldDk, fillOp: 50, ink: PAL.ink, sw: .9 });
    paint([[92 * s, 4 * s], [92 * s, 24 * s], [102 * s, 24 * s], [102 * s, 14 * s], [110 * s, 14 * s], [110 * s, 28 * s], [120 * s, 28 * s], [120 * s, 4 * s]], { wash: Z.gold, ink: PAL.ink, sw: .9 });
    if (o.bow === 'talk') {
      const P = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; P.push([-40 * s + Math.cos(a) * 46 * s, Math.sin(a) * 36 * s]); }
      P.splice(4, 0, [-6 * s, 32 * s], [6 * s, 46 * s], [-14 * s, 30 * s]);
      paint(P, { wash: Z.gold, fill: Z.goldDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1 });
      paint(ellPts(-40 * s, 4 * s, 15 * s, 19 * s, 14), { wash: '#8E5B8F', ink: PAL.ink, sw: .8 });
      paint(ellPts(-34 * s, -20 * s, 8 * s, 4 * s, 8, 0, -.5), { wash: PIPC.leaf, ink: null });
      for (let i = 0; i < 3; i++) inkLine([[-74 * s + i * 6 * s, -12 * s + i * 10 * s], [-62 * s + i * 6 * s, -12 * s + i * 10 * s]], .9, PAL.ink, 'inkfine', 0);
    } else { paint(ellPts(-26 * s, 0, 28 * s, 28 * s, 16), { wash: Z.gold, fill: Z.goldDk, fillOp: 50, ink: PAL.ink, sw: 1 }); paint(ellPts(-26 * s, 0, 11 * s, 11 * s, 10), { wash: o.holeCol || Z.home, ink: PAL.ink, sw: .7 }); }
    pop();
  }

  // The hippocampus: a seahorse curl. (x, y) = its middle; o.young 0..1 thin and pale; o.lit glow; o.post 0..1 lights its
  // back end (the tail half); o.ang turns it. Returns slot(): where a pearl sits in it.
  const HIP = [[78, -118], [60, -92], [62, -50], [52, -8], [26, 34], [-8, 58], [-42, 54], [-58, 26], [-44, 4], [-22, 10], [-20, 30], [-34, 34]];
  function hippo(x, y, s, t, o = {}) {
    const yg = clamp(o.young || 0), key = 'hp' + (o.key || ''), col = mixCol(Z.hippo, '#F6DCD6', yg * .7), dk = mixCol(Z.hippoDk, Z.hippoLt, yg * .7);
    const P = HIP.map(([a, b], i) => { const sw = 3 * Math.sin(t * 1.3 + i * .6); return rotP([[x + a * s + sw * s * .3, y + b * s]], x, y, o.ang || 0)[0]; });
    if ((o.lit || 0) > .02) glow(x, y, 180 * s, '#FFB09A', o.lit);
    if ((o.post || 0) > .02) glow(P[8][0], P[8][1], 120 * s * (.6 + .4 * o.post), '#FFE08A', o.post);
    boilSeed(key);
    const w0 = lerp(46, 22, yg) * s, w1 = lerp(10, 5, yg) * s;
    paint(ribbon(P.slice(1), w0, w1), { wash: col, fill: dk, fillOp: 45, tex: .5, ink: PAL.ink, sw: clamp(s, .6, 1.3), curv: .3 });
    // the head and snout
    const hd = P[0], ang = (o.ang || 0) - .5;
    paint(ellPts(hd[0] - 6 * s, hd[1] + 8 * s, lerp(30, 18, yg) * s, lerp(24, 15, yg) * s, 16, 0, ang), { wash: col, ink: PAL.ink, sw: clamp(s, .6, 1.3) });
    paint(rotP(rrPts(hd[0] + 8 * s, hd[1] - 4 * s, lerp(40, 26, yg) * s, 12 * s, 5 * s), hd[0] + 8 * s, hd[1] + 2 * s, ang + .2), { wash: col, ink: PAL.ink, sw: clamp(s * .8, .5, 1.1) });
    for (let i = 2; i < 8; i++) { const a = P[i], b = P[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d, w = lerp(w0, w1, i / 11) * .48;
      inkLine([[a[0] + nx * w, a[1] + ny * w], [a[0] - nx * w * .4, a[1] - ny * w * .4]], clamp(s * .6, .4, .9), dk, 'inkfine', .2); }
    if ((o.post || 0) > .02) { boilSeed(key + 'po'); paint(ellPts(P[7][0], P[7][1], 26 * s, 22 * s, 14), { wash: mixCol(col, '#FFE08A', o.post), washOp: 220, ink: null }); }
    return { head: hd, slot: P[4], tail: P[8], P };
  }
  // a real seahorse, same curl, golden, swimming upright; (x, y) = its middle
  function seahorse(x, y, s, t, key) {
    const P = HIP.map(([a, b], i) => [x + a * s * .9 + 2 * s * Math.sin(t * 2 + i), y + b * s]);
    boilSeed('sea' + key);
    for (let i = 0; i < 3; i++) { const a = P[2 + i]; paint([[a[0] - 18 * s, a[1]], [a[0] - 40 * s - 6 * s * Math.sin(t * 9 + i), a[1] - 8 * s], [a[0] - 38 * s, a[1] + 14 * s]], { wash: mixCol(Z.sea, PAL.cream, .4), ink: PAL.ink, sw: .7 }); }
    paint(ribbon(P.slice(1), 40 * s, 9 * s), { wash: Z.sea, fill: Z.seaDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1, curv: .3 });
    for (let i = 2; i < 9; i++) { const a = P[i]; inkLine([[a[0] - 12 * s, a[1]], [a[0] + 14 * s, a[1] + 2 * s]], .7, Z.seaDk, 'inkfine', .2); }
    const hd = P[0];
    paint(ellPts(hd[0] - 6 * s, hd[1] + 8 * s, 28 * s, 22 * s, 16, 0, -.5), { wash: Z.sea, ink: PAL.ink, sw: 1 });
    paint(rotP(rrPts(hd[0] + 8 * s, hd[1] - 4 * s, 40 * s, 11 * s, 5 * s), hd[0] + 8 * s, hd[1] + 2 * s, -.3), { wash: Z.sea, ink: PAL.ink, sw: .9 });
    paint(ellPts(hd[0] - 4 * s, hd[1] + 2 * s, 6 * s, 6 * s, 10), { wash: PAL.ink, ink: null }); paint(ellPts(hd[0] - 2 * s, hd[1], 2 * s, 2 * s, 6), { wash: PAL.cream, ink: null });
    for (let i = 0; i < 3; i++) paint([[hd[0] - 22 * s + i * 10 * s, hd[1] - 14 * s], [hd[0] - 18 * s + i * 10 * s, hd[1] - 30 * s], [hd[0] - 12 * s + i * 10 * s, hd[1] - 14 * s]], { wash: Z.seaDk, ink: null });
  }
  // a side-view brain (front to the left): the cerebrum with gyri, the striped cerebellum, the stem. (x, y) = its middle.
  // o.cut 0..1 opens a soft window where the hippocampus sits (returns its centre).
  const BR = [[-300, 40], [-310, -40], [-270, -130], [-190, -200], [-80, -235], [40, -232], [150, -205], [240, -150], [295, -70], [300, 20], [265, 80], [180, 95], [90, 85], [20, 110], [-60, 130], [-150, 120], [-240, 95]];
  function brain(x, y, s, t, o = {}) {
    const key = 'br' + (o.key || ''), M = ([a, b]) => [x + a * s, y + b * s];
    auditBox('brain', key, x - 310 * s, y - 240 * s, x + 300 * s, y + 280 * s);
    boilSeed(key + 'st'); paint(ribbon([M([110, 80]), M([125, 170]), M([118, 270])], 70 * s, 50 * s), { wash: Z.stem, ink: PAL.ink, sw: 1.1 });
    boilSeed(key + 'cb');
    const cb = ellPts(x + 210 * s, y + 120 * s, 110 * s, 70 * s, 22, 0, .2);
    paint(cb, { wash: Z.cereb, fill: Z.brainDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 4; i++) inkLine([M([125 + i * 10, 80 + i * 22]), M([210 + i * 6, 70 + i * 26]), M([300, 95 + i * 22])], .8, Z.brainDk, 'inkfine', .5);
    boilSeed(key + 'cr');
    paint(BR.map(M), { wash: Z.brain, fill: Z.brainDk, fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.3, curv: .5 });
    const G = [[[-250, -60], [-200, -110], [-150, -70], [-110, -140]], [[-60, -190], [-20, -130], [30, -170], [60, -110]], [[110, -170], [130, -110], [190, -120], [210, -60]],
      [[-260, 30], [-200, 0], [-160, 50], [-100, 20]], [[-40, -50], [10, -20], [60, -60], [120, -20]], [[160, -20], [210, 10], [250, -30]], [[-180, 90], [-120, 70], [-60, 95], [0, 70]]];
    G.forEach((g, i) => { boilSeed(key + 'g' + i); inkLine(g.map(M), 1, Z.brainDk, 'ink', .6); });
    inkLine([M([-40, 70]), M([40, 40]), M([140, 10]), M([230, -40])], 1.4, Z.brainDk, 'ink', .5);       // the lateral sulcus
    const hc = M([60, 30]);
    if ((o.cut || 0) > .02) { boilSeed(key + 'cut'); paint(ellPts(hc[0], hc[1], 120 * s * o.cut, 85 * s * o.cut, 22), { wash: mixCol(Z.brain, '#7E5A7A', .55), fill: '#6E4A6A', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1 }); }
    return hc;
  }

  // backgrounds
  function homeBg(t, key, gold = 0) {
    bigBg(mixCol(Z.home, Z.dusk, gold), mixCol(Z.homeBlob, Z.duskBlob, gold), t, key);
    boilSeed('fl' + key); paint(rectPts(-2400, 860, W + 4800, 2400), { wash: mixCol(Z.floor, '#E5AE7E', gold), ink: null });
    inkLine([[-1400, 862], [400, 858], [1500, 864], [3300, 860]], 1.2, mixCol(Z.floor, PAL.ink, .45), 'ink', .4);
    boilSeed('rug' + key); paint(ellPts(560, 930, 760, 70, 30), { wash: mixCol(Z.rug, Z.floor, .4), ink: null });
    boilSeed('win' + key); paint(rrPts(1500, 140, 280, 320, 24), { wash: mixCol('#FBEFD6', '#F8C98A', gold), ink: PAL.ink, sw: 1.1 });
    inkLine([[1640, 148], [1640, 452]], 1.4, PAL.ink, 'ink', 0); inkLine([[1508, 300], [1772, 300]], 1.4, PAL.ink, 'ink', 0);
    if (gold > .05) glow(1640, 300, 260, '#FFC56A', .5 * gold);
    K.motes(t, 14, mixCol(Z.home, '#C98F5E', .35), { key });
  }

  // ================================ A: the blank pearls (0–28.4) ================================
  // Pip's string of memories runs from the present (right) back to the start (left). The first three are blank.
  const STR = Array.from({ length: 13 }, (_, i) => { const x = 1640 - i * 175, y = 560 + 46 * Math.sin(i * .9); return [x, y, i < 10 ? VIGN[(i * 5 + 2) % 9] : null, i >= 10 ? 1 : 0]; });
  // the baby vignette behind the blank pearls: Papa, Mama, baby Pip learning to walk (world coords, left of the string)
  const NURS = { papa: [-760, 900], mama: [-40, 900] };
  const BABY = { pip: '#B98AB8', pipDk: '#8E6390', belly: '#F6E2EA' };          // baby Pip: paler, with a bib
  function bib(x, yb, u, key, flip = false) { boilSeed('bib' + key); const d = flip ? -1 : 1, cx = x + d * .14 * u, cy = yb - 2.15 * u; paint(ellPts(cx, cy, .95 * u, .55 * u, 16).map(([a, b]) => [a, Math.max(b, cy - .2 * u)]), { wash: '#FFF6EC', ink: PAL.ink, sw: clamp(u / 30, .5, 1) }); paint(ellPts(cx, cy + .12 * u, .22 * u, .16 * u, 8), { wash: '#F2B8C6', ink: null }); }
  function baby(x, yb, u, o, key) { tinted(BABY, () => pip(x, yb, u, { ...o, key })); bib(x, yb + (o.dy || 0) * u, u, key, o.flip); }
  function babyScene(t, a, key, o = {}) {                          // a = how visible (it is painted in, then fades)
    if (a <= .02) return;
    boilSeed('bsv' + key);
    paint(ellPts(-400, 770, 600 * a, 300 * a, 30, 6), { fill: '#FFF3E0', fillOp: 220, bleed: .3, tex: .4, ink: null });
    if (a < .6) return;
    tinted(PAPA, () => pip(NURS.papa[0], NURS.papa[1], 34, { ...K.act(t, o.papa || [[0, 'happy']], 3), key: 'papa' + key }));
    tinted(MAMA, () => pip(NURS.mama[0], NURS.mama[1], 34, { ...K.act(t, o.mama || [[0, 'happy']], 5), flip: true, key: 'mama' + key }));
    const b = o.baby(t);
    baby(b.x, NURS.papa[1], 16, b.o, 'baby' + key);
  }
  function shotA(t, lt, dur) {
    const c = kf(t, [[0, [1180, 560, 1.05]], [L(1, 1.0), [1180, 560, 1.05]], [L(1, 3.4), [-40, 600, 1.0]], [L(1, 4.6), [-40, 640, .92]], [L(2, 2.6), [-40, 640, .92]], [L(2, 3.4), [-80, 560, .9]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    homeBg(t, 'a');
    // the baby scene appears behind the blank pearls ("可就在那三年里")
    const bv = seg(t, L(1, 4.6), L(1, 5.6)) * (1 - seg(t, L(2, 2.4), L(2, 3.2)));
    const fall = L(1, 7.0), up = L(1, 7.9);
    babyScene(t, bv, 'a', {
      papa: [[0, 'calm', { lookX: .8 }], [L(1, 5.6), 'happy', { lookX: .9 }], [fall + .1, 'worried', { lookX: .9 }], [up + .2, 'laugh']],
      mama: [[0, 'calm', { lookX: .8 }], [L(1, 5.6), 'wave'], [L(1, 9.4), 'love']],
      baby: tt => {
        const x = kf(tt, [[L(1, 5.6), -620], [fall, -530], [up + .3, -530], [L(1, 9.2), -240]], ease);
        const fallen = seg(tt, fall - .05, fall + .15) * (1 - seg(tt, up, up + .3));
        const keys = [[0, 'excited'], [fall, 'dizzy'], [up + .2, 'laugh'], [L(1, 8.0), 'sing'], [L(1, 9.2), 'wow', { lookX: .8, lookY: -.9 }], [L(1, 10.0), 'love', { lookX: .6, lookY: -.9 }]];
        const o = K.act(tt, keys, 7), walking = (tt > L(1, 5.6) && tt < fall) || (tt > up + .3 && tt < L(1, 9.2));
        return { x, o: { ...o, walk: walking ? tt * 3.2 : 0, rot: (o.rot || 0) - .9 * fallen * (tt < up ? 1 : 0), sq: (o.sq || 0) + .25 * fallen, flip: false } };
      }
    });
    // babbling: sound arcs from the baby while it "talks" (说话)
    if (t > L(1, 7.9) && t < L(1, 9.0)) { const k = seg(t, L(1, 7.9), L(1, 9.0)); boilSeed('bab'); for (let i = 0; i < 3; i++) { const r = 30 + 40 * frac(k * 2 + i / 3); inkLine([[-330 + r * .3, 790 - r], [-330 + r, 810 - r * .3]], 1.2, PAL.ink, 'ink', .6); } }
    // the string of pearls
    const glowBlank = i => i >= 10 ? .0 : .15 * near(t, L(1, 1.2) + (9 - i) * .22, .3);
    string(STR, 52, t, 'sa', { lit: glowBlank });
    // the two possibilities ("从来就没被存下来" / "还是存了，却再也打不开")
    const ck1 = win(t, L(2, 2.9), L(2, 11.4), .4), ck2 = win(t, L(2, 5.4), L(2, 11.4), .4);
    const bump = ring(t, [L(2, 8.6), L(2, 9.6)], 5, 14) * 20;
    const P1 = [-430 + bump, 260], P2 = [330 - bump, 260];
    cloud(P1[0], P1[1], 230, 150, ck1, [-90, 680], 'c1');
    if (ck1 > .7) { const k = seg(t, L(2, 3.4), L(2, 5.0)); pearl(P1[0], P1[1], 60, { v: 'steps', key: 'c1p', k: 1, blank: k * .6 }); mist(P1[0], P1[1], 60, seg(t, L(2, 4.0), L(2, 5.8)), 'c1m'); }
    cloud(P2[0], P2[1], 230, 150, ck2, [10, 680], 'c2');
    if (ck2 > .7) {
      const dx = P2[0] - 70, roll = seg(t, L(2, 5.9), L(2, 6.9)), shut = seg(t, L(2, 7.0), L(2, 7.4));
      const d = door(dx, P2[1] + 120, .6, { key: 'c2d', lock: seg(t, L(2, 7.4), L(2, 7.9)) });
      if (shut < 1) pearl(lerp(P2[0] + 120, dx, ease(roll)), P2[1] + 60, 34, { v: 'steps', key: 'c2p', k: 1 - shut });
    }
    // Pip sits at the start of the string
    const pk = [[0, 'calm', { lookX: -.9 }], [L(1, 2.6), 'confused', { lookX: -.9 }], [L(1, 5.0), 'wow', { lookX: -.9, lookY: .3 }], [L(1, 8.2), 'laugh'], [L(1, 10.4), 'love', { lookX: -.6 }],
      [L(2, 0), 'confused', { lookX: -.8 }], [L(2, 3.3), 'worried', { lookX: -.7, lookY: -.8 }], [L(2, 6.0), 'wow', { lookX: .6, lookY: -.8 }], [L(2, 8.6), 'dizzy']];
    const px = kf(t, [[L(1, 1.0), 1290], [L(1, 4.2), 420]], ease);
    const walking = t > L(1, 1.0) && t < L(1, 4.2);
    pip(px, 858, 32, { ...K.act(t, pk, 1), walk: walking ? t * 2.6 : 0, flip: walking || t < L(2, 6.0), sq: .03 * voAt(t), key: 'pa' });
    const at = toScreen(px, 858 - 3 * 32);
    camEnd();
    if (lt < .8) iris(at[0], at[1], lerp(0, 1500, easeIn(lt / .8)));
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E9B9A0', Z.nursery]);
  }

  // ================================ B: what babies learn (28.4–71.6) ================================
  function nurseryBg(t, key) {
    bigBg(Z.nursery, Z.nurseryBlob, t, key);
    boilSeed('nf' + key); paint(rectPts(-2400, 880, W + 4800, 2400), { wash: '#EFC9B4', ink: null });
    inkLine([[-1400, 882], [500, 878], [1500, 884], [3300, 880]], 1.1, mixCol('#EFC9B4', PAL.ink, .4), 'ink', .4);
    K.motes(t, 12, mixCol(Z.nursery, '#C98F7E', .35), { key });
  }
  function tag(x, y, s, k, key, kind) {                           // a learned skill: a green leaf-shaped tag with a mark
    if (k <= .02) return; boilSeed('tg' + key); const q = backOut(k);
    paint(ellPts(x, y, 30 * s * q, 30 * s * q, 18), { wash: Z.skill, fill: Z.skillDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: .9 });
    if (kind === 'face') { paint(ellPts(x, y, 12 * s * q, 14 * s * q, 12), { wash: PAL.cream, ink: null }); }
    else if (kind === 'sound') { for (let i = 0; i < 2; i++) inkLine([[x - 6 * s * q + i * 9 * s * q, y - 10 * s * q], [x + i * 9 * s * q, y], [x - 6 * s * q + i * 9 * s * q, y + 10 * s * q]], 1.3, PAL.cream, 'ink', .6); }
    else if (kind === 'fall') { inkLine([[x, y - 13 * s * q], [x, y + 10 * s * q]], 1.6, PAL.cream, 'ink', 0); inkLine([[x - 7 * s * q, y + 3 * s * q], [x, y + 12 * s * q], [x + 7 * s * q, y + 3 * s * q]], 1.6, PAL.cream, 'ink', 0); }
    else if (kind === 'walk') { for (const sd of [-1, 1]) paint(ellPts(x + sd * 8 * s * q, y + sd * 5 * s * q, 5 * s * q, 9 * s * q, 8), { wash: PAL.cream, ink: null }); }
  }
  function ball(x, y, r, key) { boilSeed('ball' + key); paint(ellPts(x, y, r, r, 16), { wash: '#E2645A', ink: PAL.ink, sw: 1 }); inkLine([[x - r, y], [x, y + r * .3], [x + r, y]], 3, PAL.cream, 'ink', .5); }
  function shotB(t, lt, dur) {
    const c = kf(t, [[L(3, -2), [960, 560, 1.0]], [L(4, 0), [960, 560, 1.0]], [L(4, 1.0), [960, 540, .95]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    nurseryBg(t, 'b');
    const BX = 980, BY = 880;
    const tFace = L(3, 6.4), tSound = L(3, 7.7), tDrop1 = L(3, 9.0), tDrop2 = L(3, 11.0);
    // Mama's face fades in at the top right (认人脸), then speaks (听母语)
    const mk = win(t, tFace - .3, L(4, 0.8), .5);
    if (mk > .02) { tinted(MAMA, () => pip(1520, 880, 46 * (.9 + .1 * mk), { ...K.act(t, [[0, 'happy'], [tSound, 'sing']], 5), flip: true, key: 'mamaB' }));
      if (t > tSound && t < tSound + 1.6) { boilSeed('mamS'); for (let i = 0; i < 3; i++) { const r = 30 + 50 * frac((t - tSound) * 1.4 + i / 3); inkLine([[1400 - r, 640 - r * .4], [1400 - r * 1.1, 660], [1400 - r, 680 + r * .4]], 1.4, PAL.ink, 'ink', .6); } } }
    // the ball: held, dropped, bounces; dropped again
    const drop = (t0, tt) => { const a = tt - t0; if (a < 0) return 0; const g = 2600; const h0 = 150; const t1 = Math.sqrt(2 * h0 / g); if (a < t1) return .5 * g * a * a; const b = a - t1, v = g * t1 * .45, y = h0 - (v * b - .5 * g * b * b); return b < 2 * v / g ? y : h0; };
    const held = t < tDrop1 || (t > tDrop1 + 1.3 && t < tDrop2);
    const by = held ? BY - 150 - 12 * (t > tDrop1 + 1.3 ? ease(seg(t, tDrop1 + 1.3, tDrop1 + 1.8)) : 0) : BY - 150 + drop(t > tDrop2 ? tDrop2 : tDrop1, t);
    const ballOn = t > L(3, 8.4) && t < L(4, 1.0);
    // baby Pip, big, learning
    const bk = [[0, 'calm', { lookX: .2 }], [L(3, 2.2), 'happy'], [tFace, 'wow', { lookX: .9, lookY: -.4 }], [tFace + .9, 'happy', { lookX: .9 }], [tSound + .5, 'sing', { lookX: .8 }],
      [tDrop1, 'wow', { lookX: .5, lookY: .9 }], [tDrop1 + .9, 'confused', { lookY: .8 }], [tDrop2, 'calm', { lookX: .4, lookY: .9 }], [tDrop2 + .6, 'laugh'], [L(4, 0.6), 'calm', { lookX: .6 }]];
    const bo = K.act(t, bk, 7), bx = kf(t, [[L(4, 0), BX], [L(4, 1.2), 540]], ease), bs = kf(t, [[L(4, 0), 36], [L(4, 1.2), 28]], ease);
    baby(bx, BY, bs, { ...bo, armF: ballOn && held ? [.5, 1.9] : bo.armF }, 'babyB');
    if (ballOn) ball(bx + 1.6 * bs + 30, by - (held ? 0 : 0), 22, 'b');
    // learned tags pop up above the baby
    const tags = [[tFace + 1.0, 'face'], [tSound + 1.0, 'sound'], [tDrop2 + 1.2, 'fall'], [L(4, 0.8), 'walk']];
    const flowIn = seg(t, L(5, 1.6), L(5, 3.0));
    tags.forEach(([t0, kind], i) => {
      const home = [bx - 150 + i * 100, BY - bs * 7.6], dst = [250, 700];
      const p = flowIn > 0 ? arcPt(home, dst, 120, easeIn(clamp(flowIn * 1.3 - i * .1))) : home;
      if (clamp(flowIn * 1.3 - i * .1) < 1) tag(p[0], p[1], 1, popK(t, t0, .4), 'b' + i, kind);
    });
    // L4: the skill (left, a looping green walk) vs one moment (right, a pearl)
    const pk2 = popK(t, L(4, 1.9), .5), drain = seg(t, L(5, 3.0), L(5, 4.6)), PX = 1260, PY = 470;
    if (pk2 > .02) {
      const glo = .6 * seg(t, L(4, 8.6), L(4, 9.4)) * (1 - drain);
      pearl(PX, PY, 150, { v: 'cake', key: 'bp', k: pk2 * (1 - seg(t, L(5, 6.0), L(5, 6.6))), lit: glo, blank: drain });
      // when, where, what
      [['sun', L(4, 10.3), -1], ['house', L(4, 11.4), 0], ['cake', L(4, 12.5), 1]].forEach(([v, t0, i]) => {
        const k = popK(t, t0, .4) * (1 - seg(t, L(5, 3.0), L(5, 3.6)));
        if (k > .02) { boilSeed('wwh' + v); paint(ellPts(PX + i * 190, PY + 230, 62 * backOut(k), 62 * backOut(k), 18), { wash: PAL.cream, ink: PAL.ink, sw: 1 }); vignette(PX + i * 190, PY + 230, 50 * k, v, 'w' + v); }
      });
    }
    // L5: the blank pearls of A slide in (婴儿期遗忘)
    const bl = seg(t, L(5, 6.2), L(5, 7.6));
    for (let i = 0; i < 3; i++) { const x = lerp(2300, 1080 + i * 190, easeOut(clamp(bl * 1.4 - i * .15))); if (bl > 0) pearl(x, 520 + 30 * Math.sin(i * 1.3), 70, { blank: 1, key: 'bb' + i }); }
    if (bl > .5) { boilSeed('bstr'); inkLine([[1000, 520], [1080, 520], [1270, 550], [1460, 510], [1560, 520]], 1.2, mixCol(PAL.ink, Z.pearlDk, .4), 'ink', .5); }
    // Pip the host, bottom left: the skills flow into Pip and stay
    const ok = popK(t, L(5, 2.8), .4);
    const hk = [[0, 'calm', { lookX: .8 }], [L(3, 2.4), 'happy', { lookX: .8 }], [tDrop2 + .7, 'laugh'], [L(4, 2.2), 'calm', { lookX: .9, lookY: -.4 }], [L(4, 8.6), 'idea'], [L(5, 0), 'calm', { lookX: .6 }],
      [L(5, 2.8), 'happy'], [L(5, 4.0), 'sad', { lookX: .8 }], [L(5, 8.4), 'sad', { lookX: .8, lookY: -.3 }]];
    const hp = host(250, 880, 34, t, hk, { stand: true, flip: false }, 'pb');
    if (flowIn > .8) { glow(250, 790, 90, '#B9E58A', .5 * (1 - seg(t, L(5, 4.0), L(5, 6.0)))); K.check(330, 650, 60, ok, 'bok'); }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E9B9A0', Z.nursery]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B8A3C9', Z.brainBg]);
  }

  // ================================ C: the old answer (71.6–116.2) ================================
  function speedLines(k, col, key = 'spd') {                     // whip-pan streaks, screen space
    if (k <= 0) return;
    for (let i = 0; i < 16; i++) { boilSeed(key + i); const y = hash(i + 200) * H, x0 = hash(i + 201) * (W + 400) - 400, Ln = (260 + 520 * hash(i + 202)) * k; inkLine([[x0, y], [x0 + Ln, y + 3]], 1.5 + 2 * hash(i + 203), col, 'ink', 0); }
  }
  function sunMoon(cx, cy, r, ph, key) {                          // time passing: a sun and a moon on one wheel
    for (const [d, col] of [[0, '#F4B43C'], [Math.PI, '#E9E4F4']]) { const a = ph * TAU + d - Math.PI / 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .5;
      if (Math.sin(a) > .3) continue; boilSeed(key + d); paint(ellPts(x, y, 26, 26, 14), { wash: col, ink: PAL.ink, sw: .9 }); if (d) paint(ellPts(x + 10, y - 6, 20, 20, 12), { wash: Z.brainBg, ink: null }); }
  }
  // a textbook, no lettering: open = a spread with the old answer drawn on it (a thin young hippocampus, a ✗ pearl); closed = a cover
  function book(x, y, s, open, t, key, shake = 0) {
    boilSeed('bk' + key); const sx = x + shake * 5 * Math.sin(t * 60), w = 150 * s, h = 110 * s;
    if (open > .5) {
      paint([[sx - w, y - h], [sx, y - h + 12 * s], [sx, y + h], [sx - w, y + h - 12 * s]], { wash: '#FBF6EA', ink: PAL.ink, sw: 1 });
      paint([[sx, y - h + 12 * s], [sx + w, y - h], [sx + w, y + h - 12 * s], [sx, y + h]], { wash: '#FBF6EA', ink: PAL.ink, sw: 1 });
      for (let i = 0; i < 4; i++) inkLine([[sx + 24 * s, y - 60 * s + i * 28 * s], [sx + w - 24 * s, y - 64 * s + i * 28 * s]], .8, '#B8AFA0', 'inkfine', 0);
      hippo(sx - w * .5, y + 6 * s, .55 * s, t, { young: 1, key: key + 'bh' });
      K.cross(sx + w * .5, y + 60 * s, 34 * s, 1, key + 'bx');
    } else {
      paint(rrPts(sx - w * .55, y - h, w * 1.1, h * 2, 10 * s), { wash: '#7E62A8', fill: '#5C4486', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.2 });
      paint(rrPts(sx - w * .55, y - h, 18 * s, h * 2, 6 * s), { wash: '#5C4486', ink: null });
      paint(ellPts(sx + 8 * s, y - 10 * s, 44 * s, 52 * s, 18), { wash: '#F4E6C8', ink: PAL.ink, sw: .8 });
      hippo(sx + 8 * s, y - 6 * s, .32 * s, t, { key: key + 'cv' });
    }
  }
  function shotC(t, lt, dur) {
    const HC = [850, 565];
    let c = kf(t, [[L(6, -1.5), [760, 560, 1.0]], [L(6, 3.2), [790, 560, 1.15]], [L(6, 5.0), [850, 565, 2.1]], [L(6, 13.6), [870, 565, 2.1]], [L(7, -.2), [870, 565, 2.1]], [L(7, .8), [2600, 520, 1.0]]], ease);
    const whip = seg(t, L(7, -.2), L(7, .8)) * (1 - seg(t, L(7, .5), L(7, .8)));
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    bigBg(Z.brainBg, Z.brainBgBlob, t, 'c');
    K.motes(t, 16, mixCol(Z.brainBg, '#9C80B4', .35), { key: 'c' });
    if (t < L(7, .8)) {
      const cut = ease(seg(t, L(6, 3.0), L(6, 4.6)));
      brain(760, 520, 1.5, t, { cut, key: 'c' });
      if (cut > .3) {
        const hp = hippo(HC[0], HC[1], .95, t, { lit: .55 * seg(t, L(6, 4.8), L(6, 5.6)), key: 'c' });
        // a real seahorse swims up beside it (像一只海马)
        const sx = kf(t, [[L(6, 7.2), 1320], [L(6, 8.4), 1010]], easeOut);
        if (t > L(6, 7.2)) seahorse(sx, HC[1] - 10 + 8 * wob(t, .4), .9, t, 'c');
        // a pearl passes through, glowing while it is inside (短时记忆)
        const pk = seg(t, L(6, 9.6), L(6, 13.0));
        if (pk > 0 && pk < 1) { const Tr = K.track([[620, 450], [740, 500], hp.slot, [800, 640], [690, 700]]), [px, py] = Tr.at(ease(pk) * Tr.L), inside = near(pk, .5, .2);
          pearl(px, py, 24, { v: 'house', key: 'cp', lit: .8 * inside, k: seg(pk, 0, .1) * (1 - seg(pk, .9, 1)), noPop: true }); }
      }
    } else {
      // the board to the right: a young hippocampus (left) grows over years into a mature one (right)
      const YX = 2180, MX = 3020, HY = 470;
      hippo(YX, HY, 1.7, t, { young: 1, key: 'cy' });
      baby(YX + 20, 900, 26, { ...pipFeel('calm', t, { seed: 3 }), lookY: -.8 }, 'cyb');
      const grow = seg(t, L(7, 1.0), L(7, 3.8));
      if (grow > 0) {
        boilSeed('carr'); const ax = lerp(YX + 170, MX - 200, ease(grow));
        inkLine([[YX + 170, HY + 60], [ax, HY + 60]], 4, PAL.ink, 'ink', 0);
        if (grow > .95) inkLine([[MX - 228, HY + 36], [MX - 200, HY + 60], [MX - 228, HY + 84]], 4, PAL.ink, 'ink', 0);
        sunMoon((YX + MX) / 2, HY - 150, 170, grow * 3, 'csm');
        hippo(MX, HY, lerp(1.0, 2.0, ease(grow)), t, { young: 1 - ease(grow), key: 'cm' });
      }
      // pearls fall at the young one and bounce off into mist (写不进去)
      for (let i = 0; i < 3; i++) {
        const t0 = L(7, 6.9) + i * .7, k = seg(t, t0, t0 + 1.6); if (k <= 0 || k >= 1) continue;
        const hit = .45, p = k < hit ? [YX - 10 + i * 20, lerp(-160, HY - 40, easeIn(k / hit))] : arcPt([YX - 10 + i * 20, HY - 40], [YX - 380 + i * 260, HY + 380], 160, (k - hit) / (1 - hit));
        pearl(p[0], p[1], 46, { v: ['heart', 'steps', 'ball'][i], key: 'cf' + i, k: 1 - seg(k, .85, 1), noPop: true });
        mist(p[0], p[1], 40, seg(k, .8, 1), 'cfm' + i);
        if (k > hit && k < hit + .15) K.burst(YX, HY - 40, 80, (k - hit) / .15, PAL.ink, 'cfb' + i);
      }
      // 从来没存过: an empty dashed slot with a ✗
      const ek = popK(t, L(7, 10.6), .4);
      if (ek > .02) { pearl(YX - 280, HY - 120, 64, { blank: 1, key: 'ce', k: ek }); K.cross(YX - 280, HY - 120, 96, seg(t, L(7, 11.4), L(7, 11.9)), 'cex'); }
      // the textbook: opens with the old answer, slams shut (天衣无缝), then trembles (直到二零二五年)
      const bk = popK(t, L(7, 4.1), .45), slam = L(8, .4);
      if (bk > .02) {
        const open = t < slam ? 1 : 0, shake = win(t, L(8, 4.9), L(8, 7.4), .2);
        push(); translate(2620, 830); scale(bk); book(0, 0, 1.45, open, t, 'cb', shake); pop();
        const yrs = win(t, L(8, 3.2), L(8, 5.4), .3); if (yrs > .02) { push(); translate(2620, 600); scale(yrs); sunMoon(0, 0, 120, (t - L(8, 3.2)) * 1.6, 'cyr'); pop(); }
        if (t > slam && t < slam + .5) { K.burst(2620, 830, 260, seg(t, slam, slam + .5), PAL.ink, 'cbs'); for (let i = 0; i < 5; i++) { boilSeed('dust' + i); const k = seg(t, slam, slam + .9); paint(ellPts(2600 + (i - 2) * 80 * (1 + k), 950 - 20 * k, 40 * (1 - k * .5), 22, 10), { fill: '#C9B8D8', fillOp: 140 * (1 - k), bleed: .2, ink: null }); } }
      }
    }
    camEnd();
    speedLines(whip, mixCol(Z.brainBg, PAL.ink, .2), 'cw');
    const hk = [[0, 'sad', { lookX: .8 }], [L(6, 1.0), 'calm', { lookX: .8, lookY: -.4 }], [L(6, 5.2), 'wow', { lookX: .9 }], [L(6, 8.4), 'laugh'], [L(6, 10.0), 'calm', { lookX: .9 }],
      [L(7, 1.0), 'calm', { lookX: .8, lookY: -.5 }], [L(7, 4.3), 'idea'], [L(7, 7.2), 'worried', { lookX: .8 }], [L(7, 11.0), 'sad', { lookX: .6 }], [L(8, .2), 'smug'], [L(8, 4.9), 'wow', { lookX: .8, lookY: .5 }], [L(8, 9.2), 'idea'], [L(8, 11.0), 'excited']];
    host(220, 980, 30, t, hk, { flip: false }, 'pc');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B8A3C9', Z.brainBg]);
    if (lt > dur - .5) speedLines(seg(lt, dur - .5, dur), '#9FC9C9', 'cw2');
  }

  // ================================ D: ask the babies (116.2–172.4) ================================
  // A side cutaway of an MRI scanner: the housing above and below the bore, the bed sliding in from the right.
  const MRI = { x: 820, y: 520, R: 300, r: 150 };
  // The scanner, drawn as one fixed key view: a big ring face with its bore, the housing behind it, the bed coming out of
  // the bore to the left. drawBaby(front) is called twice: before the ring (inside the bore) and after it (out on the bed).
  function scanner(t, slide, key, drawBaby) {
    const { x, y, R: Ro, r } = MRI, by = y + r * .45;
    auditBox('mri', key, x - Ro, y - Ro, x + Ro + 200, y + Ro);
    boilSeed('mri' + key);
    paint(rrPts(x - 40, y - Ro + 10, Ro + 260, 2 * Ro - 20, 150), { wash: Z.mriDk, fill: '#B3AC9F', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(x, y, r, r, 30), { wash: '#6F8A99', ink: null });
    paint(ellPts(x + 45, y, r * .78, r * .82, 28), { wash: '#56707F', ink: null });
    paint(ellPts(x + 80, y, r * .5, r * .58, 24), { wash: '#C9E3EC', ink: null });          // the light at the far end
    // the bed's inner part and the baby, inside the bore
    boilSeed('bed' + key); paint([[x - r, by], [x + r * .9, by], [x + r * .9, by + 16], [x - r, by + 16]], { wash: Z.bed, ink: PAL.ink, sw: .9 });
    drawBaby(false);
    // the ring face: one annulus as a thick ribbon around the bore
    boilSeed('ring' + key); const C = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; C.push([x + Math.cos(a) * (Ro + r) / 2, y + Math.sin(a) * (Ro + r) / 2]); }
    paint(ribbon(C, Ro - r, Ro - r), { wash: Z.mri, fill: '#E2DDD2', fillOp: 50, tex: .3, ink: null });
    paint(ellPts(x, y, Ro, Ro, 40), { ink: PAL.ink, sw: 1.3 }); paint(ellPts(x, y, r, r, 30), { ink: PAL.ink, sw: 1.2 });
    paint(ellPts(x, y, r + 26, r + 26, 30), { ink: Z.mriDk, sw: .9 });
    paint(rrPts(x - 50, y + Ro - 70, 100, 26, 10), { wash: '#9BC7C0', ink: PAL.ink, sw: .8 });
    // the bed's outer part and its stand, in front
    boilSeed('bedo' + key);
    paint(rrPts(x - Ro - 420, by + 60, 300, 230, 20), { wash: Z.mriDk, ink: PAL.ink, sw: 1 });
    paint([[x - Ro - 520, by], [x - r + 10, by], [x - r + 10, by + 26], [x - Ro - 520, by + 26]], { wash: Z.bed, ink: PAL.ink, sw: 1 });
    paint(rrPts(x - Ro - 520, by + 22, 380, 44, 12), { wash: '#B5CBD6', ink: PAL.ink, sw: .9 });
    drawBaby(true);
    return { by };
  }
  function pic(x, y, w, h, v, k, key, o = {}) {                   // a framed picture on a screen
    if (k <= .02) return; boilSeed('pc' + key); const q = backOut(k);
    paint(rrPts(x - w / 2 * q, y - h / 2 * q, w * q, h * q, 8), { wash: o.bg || '#F6F0E2', ink: PAL.ink, sw: 1.1 });
    vignette(x, y, Math.min(w, h) * .42 * q, v, key);
  }
  function ringK(x, y, rx, ry, a, col, key, w = 4) { if (a <= .02) return; boilSeed('rg' + key); paint(ellPts(x, y, rx, ry, 32), { ink: col, sw: w * a, curv: .3 }); }
  function clinicBg(t, key) {
    bigBg(Z.clinic, Z.clinicBlob, t, key);
    boilSeed('cf' + key); paint(rectPts(-2400, 900, W + 4800, 2400), { wash: '#B9D6D3', ink: null });
    inkLine([[-1400, 902], [500, 898], [1500, 904], [3300, 900]], 1.1, mixCol('#B9D6D3', PAL.ink, .4), 'ink', .4);
    K.motes(t, 10, mixCol(Z.clinic, '#7FA9A8', .35), { key });
  }
  function earmuffs(x, y, r, ang, key) { boilSeed('em' + key); const P = rotP([[x, y - r * 1.1], [x, y + r * 1.1]], x, y, ang); inkLine([P[0], [x + Math.cos(ang - Math.PI / 2) * r * 1.3, y + Math.sin(ang - Math.PI / 2) * r * 1.3], P[1]], 3, '#5E7FA8', 'ink', .6); for (const p of P) paint(ellPts(p[0], p[1], r * .38, r * .38, 10), { wash: '#7FA9D8', ink: PAL.ink, sw: .8 }); }
  // the scanner's monitor: a brain slice with the hippocampus; o.flare 0..1 lights its back end
  function monitor(x, y, s, t, o = {}) {
    boilSeed('mon' + (o.key || ''));
    paint(rrPts(x - 300 * s, y - 210 * s, 600 * s, 420 * s, 24 * s), { wash: '#4A5468', ink: PAL.ink, sw: 1.3 });
    paint(rrPts(x - 276 * s, y - 188 * s, 552 * s, 376 * s, 14 * s), { wash: Z.screen, ink: null });
    if (o.stand !== false) { paint(rectPts(x - 18 * s, y + 210 * s, 36 * s, 260 * s), { wash: '#6E7890', ink: PAL.ink, sw: 1 }); paint(rrPts(x - 120 * s, y + 460 * s, 240 * s, 30 * s, 10 * s), { wash: '#6E7890', ink: PAL.ink, sw: 1 }); }
    if ((o.on ?? 1) > .02) {
      const b = .5 * (o.on ?? 1);
      push(); translate(x + (o.dx || 0) * s, y); scale(b * s);
      brain(0, -40, 1, t, { key: 'mb' + (o.key || ''), cut: 1 });
      pop();
      if ((o.on ?? 1) > .9) hippo(x + (o.dx || 0) * s + 60 * b * s, y - 10 * b * s, .63 * b * s, t, { post: o.flare || 0, key: 'mh' + (o.key || '') });
    }
  }
  function shotD(t, lt, dur) {
    const lie = ease(seg(t, L(9, 5.0), L(9, 5.8))), slide = ease(seg(t, L(9, 5.8), L(9, 8.0)));
    const closeEyes = t > L(10, -.2) && t < L(11, -.2), closeMon = t >= L(11, -.2);
    if (!closeEyes && !closeMon) {
      const c = kf(t, [[L(9, -1.3), [960, 560, .95]], [L(9, 3.6), [960, 560, .95]], [L(9, 5.0), [1000, 560, .95]], [L(9, 10.4), [1000, 560, .95]], [L(9, 11.4), [840, 520, 1.5]]], ease);
      cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      clinicBg(t, 'd');
      monitor(1560, 400, .62, t, { key: 'dw', on: seg(t, L(9, 8.6), L(9, 9.2)), flare: .4 * near(t, L(9, 11.6), .5) });
      // baby Pip: sits on the end of the bed, then lies back and slides into the bore, ear muffs on
      const bk = [[0, 'sing', { lookX: .8 }], [L(9, 1.0), 'confused', { lookX: .8 }], [L(9, 3.8), 'calm', { lookX: .8 }], [L(9, 5.4), 'wow', { lookY: -.9 }], [L(9, 10.9), 'calm', { lookX: .2, lookY: -.9 }]];
      const bxp = lerp(MRI.x - MRI.R - 300, MRI.x - 40, slide) - 40 * lie, inside = slide > .55;
      scanner(t, slide, 'd', front => {
        if (front === inside) return;
        push(); translate(bxp, MRI.y + MRI.r * .45 + 2); rotate(lie * Math.PI / 2);
        baby(0, 0, 24, { ...K.act(t, bk, 4), noShadow: true }, 'bd');
        if (seg(t, L(9, 4.4), L(9, 4.8)) > 0) { const k = popK(t, L(9, 4.4)); push(); translate(.1 * 24, -3.4 * 24); scale(k); earmuffs(0, 0, 36, 0, 'bdm'); pop(); }
        pop();
      });
      // the screen inside the bore shows pictures (看图片)
      if (t > L(9, 10.6)) { const v = ['canyon', 'face', 'flower'][Math.floor((t - L(9, 10.9)) / .9) % 3]; pic(MRI.x + 20, MRI.y - 70, 110, 72, v, popK(t, L(9, 10.6)), 'dp' + v); }
      // Pip beside the monitor
      const pk = [[0, 'calm', { lookX: -.8 }], [L(9, .6), 'laugh'], [L(9, 2.2), 'confused', { lookX: -.8 }], [L(9, 3.9), 'idea'], [L(9, 5.6), 'wow', { lookX: -.9 }], [L(9, 8.9), 'excited']];
      pip(1720, 930, 32, { ...K.act(t, pk, 2), flip: true, sq: .03 * voAt(t), key: 'pd' });
      camEnd();
    } else if (closeEyes) {
      // the view the baby has: the screen above, the baby's face below, looking
      cam(960 + 4 * wob(t, .05), 540 + 3 * wob(t, .04), 1);
      bigBg('#BBCBD0', '#D5E1E4', t, 'de');
      boilSeed('bore'); paint(rectPts(-200, -200, W + 400, 330), { wash: '#DCE6E8', fill: '#B9CACD', fillOp: 60, tex: .3, ink: null });
      paint(rrPts(480, 120, 960, 400, 26), { wash: '#4A5468', ink: PAL.ink, sw: 1.3 }); paint(rrPts(500, 140, 920, 360, 16), { wash: Z.screen, ink: null });
      const once = win(t, L(10, 3.2), L(10, 5.0), .25), both = seg(t, L(10, 5.3), L(10, 5.7));
      if (once > .02) pic(960, 320, 300, 220, 'canyon', once, 'deo');
      const lookCanyon = t > L(10, 6.4), ringA = seg(t, L(10, 6.6), L(10, 11.0));
      if (both > .02) { pic(720, 320, 300, 220, 'canyon', both, 'de1'); pic(1200, 320, 300, 220, 'fish', both, 'de2'); ringK(720, 320, 175 + 25 * ringA, 135 + 20 * ringA, ringA, Z.gold, 'der', 6); }
      // an hourglass-like timer: gold beads collecting under the looked-at picture (看得越久)
      for (let i = 0; i < Math.floor(ringA * 7); i++) { boilSeed('dtk' + i); paint(ellPts(615 + i * 34, 470, 11, 11, 10), { wash: Z.gold, ink: PAL.ink, sw: .7 }); }
      const bk = [[0, 'calm', { lookY: -.9 }], [L(10, 1.2), 'wow', { lookY: -1 }], [L(10, 3.4), 'calm', { lookY: -1 }], [L(10, 5.4), 'wow', { lookX: .5, lookY: -1 }], [L(10, 6.4), 'love', { lookX: -.8, lookY: -1 }]];
      const bo = K.act(t, bk, 4);
      baby(960, 1190, 80, { ...bo, lookX: lookCanyon ? -.8 : (t > L(10, 5.4) ? .5 * Math.sin((t - L(10, 5.4)) * 6) : 0), noShadow: true }, 'dbe');
      camEnd();
      const hk = [[0, 'calm', { lookX: .8, lookY: -.6 }], [L(10, 1.3), 'idea'], [L(10, 6.6), 'wow', { lookX: .8, lookY: -.6 }], [L(10, 9.9), 'happy']];
      host(220, 990, 28, t, hk, { flip: false }, 'pde');
      if (t < L(10, .3)) flash(1 - seg(t, L(10, -.2), L(10, .3)), PAL.cream);
    } else {
      // the monitor, close: remembered vs forgotten pictures, the back of the hippocampus, then the pearl and the door
      cam(960 + 4 * wob(t, .05), 540 + 3 * wob(t, .04), 1);
      clinicBg(t, 'dm');
      const flareF = .2 * win(t, L(11, 4.0), L(11, 5.3), .3), flareR = .85 * win(t, L(11, 5.4), L(11, 8.6), .3), flareO = 1.0 * win(t, L(11, 9.3), L(12, .4), .3);
      monitor(1080, 470, 1.35, t, { key: 'dm', stand: false, dx: 40, flare: Math.max(flareF, flareR, flareO) });
      // the two pictures on the left of the screen: the canyon (remembered later: gold) and the flower (forgotten: grey)
      const tk = popK(t, L(11, 1.4));
      pic(770, 330, 120, 90, 'canyon', tk, 'dmc'); pic(770, 470, 120, 90, 'flower', tk, 'dmf', { bg: '#C9C6CC' });
      ringK(770, 330, 80, 62, win(t, L(11, 5.3), L(11, 8.8), .3), Z.gold, 'dmr', 5); ringK(770, 470, 80, 62, win(t, L(11, 3.9), L(11, 5.4), .3), '#9C98A6', 'dmr2', 4);
      // 一岁以上: a one-candle cake
      const ck = popK(t, L(11, 8.9), .4) * (1 - seg(t, L(12, .8), L(12, 1.2)));
      if (ck > .02) { boilSeed('cake1'); const q = backOut(ck); paint(rectPts(1450 - 60 * q, 560 - 30 * q, 120 * q, 70 * q), { wash: '#F6C8D2', ink: PAL.ink, sw: 1 }); paint(rectPts(1446, 560 - 30 * q - 50 * q, 9 * q, 50 * q), { wash: '#7FB6E0', ink: null }); paint(ellPts(1450, 560 - 30 * q - 64 * q, 9 * q, 14 * q, 8), { wash: '#F4B43C', ink: null }); glow(1450, 560 - 94 * q, 60, '#FFC766', .5); }
      // L12: a pearl slides into the hippocampus and stays (存，是存了) ✓, then the door closes in front of it (取)
      const hx = 1080 + (40 + 30) * 1.35, hy = 470 - 5 * 1.35;
      const pIn = seg(t, L(12, 2.8), L(12, 4.4)), dShut = ease(seg(t, L(12, 9.0), L(12, 9.8)));
      if (pIn > 0) pearl(lerp(1500, hx - 10, ease(pIn)), lerp(260, hy + 20, ease(pIn)), 34, { v: 'canyon', key: 'dmp', noPop: true, k: 1, lit: .6 * seg(t, L(12, 4.4), L(12, 5.0)) });
      K.check(hx + 120, hy - 120, 80, seg(t, L(12, 6.3), L(12, 6.9)), 'dmok');
      if (dShut > 0) door(hx - 10, lerp(-260, hy + 170, dShut), .62, { key: 'dmd', lock: seg(t, L(12, 9.8), L(12, 10.3)) });
      camEnd();
      const hk = [[0, 'calm', { lookX: .8 }], [L(11, 5.6), 'wow', { lookX: .8 }], [L(11, 9.2), 'excited'], [L(12, 3.2), 'happy', { lookX: .8 }], [L(12, 6.4), 'smug'], [L(12, 8.6), 'calm', { lookX: .9, armF: [.2, 2.8] }], [L(12, 10.0), 'worried', { lookX: .8 }]];
      host(330, 960, 34, t, hk, { flip: false }, 'pdm');
      if (t < L(11, .3)) flash(1 - seg(t, L(11, -.2), L(11, .3)), PAL.cream);
    }
    if (lt < .5) speedLines(1 - seg(lt, 0, .5), '#9FC9C9', 'dw');
    if (lt > dur - 1.2) { const k = ease(seg(lt, dur - 1.2, dur - .1)); iris(1080 + 70 * 1.35 - 10 + 47, 470 + 120, lerp(1500, 0, k)); }
  }

  // ================================ E: the mice and the light (172.4–238.2) ================================
  // The mouse, from the opto film: (mx, my) = between its feet, S = size. o.fear 0..1 freezes it (fur up, wide eye),
  // o.light 0..1 the blue light on its brain window, o.fy 0..1 lowers the fibre, o.fibre false hides it.
  const AW = [[-250, -40], [-230, -130], [-140, -195], [-20, -210], [100, -190], [175, -160], [235, -125], [290, -85], [335, -58], [342, -40], [320, -24], [270, -14], [200, -5], [80, 0], [-60, 0], [-190, -5]];
  function mouse(mx0, my, S, t, o = {}) {
    const fear = o.fear || 0, sh = fear * 3 * Math.sin(t * 55), mx = mx0 + sh, key = o.key || 'm';
    const M = ([a, b]) => [mx + a * S, my + b * S];
    const sniff = (1 - fear) * 3 * Math.sin(t * 9), crouch = fear * 12;
    auditBox('mouse', key, mx - 260 * S, my - 210 * S, mx + 345 * S, my);
    boilSeed(key + 'tail'); paint(ribbon([[-230, -30], [-340, -10], [-430, -55], [-460, -125 + 20 * wob(t, .3) * (1 - fear)]].map(M), 18 * S, 5 * S), { wash: mixCol(Z.pink, Z.mouse, .4), ink: PAL.ink, sw: 1 });
    boilSeed(key + 'feet'); for (const fx of [-150, 215]) paint(ellPts(...M([fx, -6]), 30 * S, 12 * S, 12), { wash: Z.pink, ink: PAL.ink, sw: .9 });
    const B = AW.map(([a, b], i) => M([a, b + crouch * (b < -100 ? -.4 : 0)])).map(([x, y], i) => i >= 6 && i <= 11 ? [x + sniff * .5 * S, y + sniff * .3 * S] : [x, y]);
    if (fear > .05) { boilSeed(key + 'fur'); for (let i = 1; i < 6; i++) { const p = B[i], n = B[i + 1], a = Math.atan2(n[1] - p[1], n[0] - p[0]) - Math.PI / 2; for (let k = 0; k < 3; k++) { const q = [lerp(p[0], n[0], k / 3), lerp(p[1], n[1], k / 3)]; inkLine([q, [q[0] + Math.cos(a) * 18 * S * fear, q[1] + Math.sin(a) * 18 * S * fear]], 1.2, PAL.ink, 'ink', 0); } } }
    boilSeed(key + 'body'); paint(B, { wash: Z.mouse, fill: Z.mouseDk, fillOp: 45, tex: .5, ink: PAL.ink, sw: clamp(1.3 * S, .7, 1.3), curv: .5 });
    paint(ellPts(...M([20, -50]), 150 * S, 40 * S, 18), { wash: mixCol(Z.mouse, PAL.cream, .35), ink: null });
    boilSeed(key + 'ear'); const ep = M([95, -182]); paint(ellPts(ep[0], ep[1], 46 * S, 52 * S, 18, 0, -.3), { wash: Z.mouse, ink: PAL.ink, sw: 1.1 }); paint(ellPts(ep[0] + 4 * S, ep[1] + 4 * S, 30 * S, 36 * S, 14, 0, -.3), { wash: Z.pink, ink: null });
    const bw = M([185, -160]), lt = o.light || 0;
    boilSeed(key + 'brain'); paint(ellPts(bw[0], bw[1], 44 * S, 26 * S, 18, 0, .15), { wash: mixCol('#F4C9C9', '#CFE0FF', lt), ink: mixCol(PAL.ink, Z.mouse, .3), sw: .8 });
    for (let i = 0; i < 5; i++) { const p = [bw[0] + (i - 2) * 14 * S, bw[1] + (i % 2 ? 7 : -5) * S]; paint(ellPts(p[0], p[1], 6 * S, 6 * S, 8), { wash: i % 2 ? Z.neuron : mixCol(Z.engram, '#FFD34A', lt), ink: null }); }
    if (lt > .02) glow(bw[0], bw[1], 90 * S, Z.blueG, .8 * lt);
    if (o.fibre !== false) { const fy = o.fy ?? 1, tipY = bw[1] - 18 * S - (1 - ease(fy)) * 700;
      boilSeed(key + 'fib'); paint(ribbon([[bw[0], tipY - 1400], [bw[0], tipY]], 11 * S, 11 * S), { wash: lt > .2 ? mixCol('#F3F0F7', Z.blue, lt) : '#F3F0F7', ink: PAL.ink, sw: .9 });
      paint(rrPts(bw[0] - 14 * S, tipY - 40 * S, 28 * S, 40 * S, 6 * S), { wash: '#A8A3B4', ink: PAL.ink, sw: .9 }); }
    const eye = M([275, -98]); boilSeed(key + 'eye');
    if ((o.blink || 0) > .6) inkLine([[eye[0] - 13 * S, eye[1]], [eye[0], eye[1] + 7 * S], [eye[0] + 13 * S, eye[1]]], 1.6, PAL.ink, 'ink', .6);
    else if (fear > .3) { paint(ellPts(eye[0], eye[1], 15 * S, 17 * S, 12), { wash: PAL.cream, ink: PAL.ink, sw: 1 }); paint(ellPts(eye[0] + 3 * S, eye[1], 5 * S, 6 * S, 8), { wash: PAL.ink, ink: null }); }
    else { paint(ellPts(eye[0], eye[1], 11 * S, 13 * S, 12), { wash: PAL.ink, ink: null }); paint(ellPts(eye[0] + 4 * S, eye[1] - 5 * S, 3.5 * S, 3.5 * S, 8), { wash: PAL.cream, ink: null }); }
    const nose = M([340, -50]); boilSeed(key + 'nose'); paint(ellPts(nose[0] + sniff * S, nose[1], 10 * S, 8 * S, 10), { wash: '#D9788E', ink: PAL.ink, sw: .8 });
    boilSeed(key + 'wh'); const wr = M([318, -42]);
    [-.35, -.05, .25].forEach((a0, i) => { const a = a0 + .05 * Math.sin(t * 9 + i) * (1 - fear), Ln = (120 - i * 10) * S; inkLine([wr, [wr[0] + Math.cos(a) * Ln * .5, wr[1] + Math.sin(a) * Ln * .5 - 4 * S], [wr[0] + Math.cos(a) * Ln, wr[1] + Math.sin(a) * Ln]], 1.1, PAL.ink, 'inkfine', .5); });
    return { head: M([250, -150]), brain: bw };
  }
  // the chamber: a box with striped walls and a grid floor; o.zap 0..1 sparks on the floor
  function chamber(cx, cy, w, h, t, o = {}) {
    const key = o.key || 'ch'; boilSeed(key);
    paint(rectPts(cx - w / 2, cy - h, w, h), { wash: Z.box, ink: PAL.ink, sw: 1.2 });
    for (let i = 1; i < 9; i++) paint(rectPts(cx - w / 2 + i * w / 9 - w / 40, cy - h + 4, w / 20, h - 70), { wash: Z.stripe, washOp: 200, ink: null });
    paint([[cx - w / 2, cy - 70], [cx + w / 2, cy - 70], [cx + w / 2 + 50, cy], [cx - w / 2 - 50, cy]], { wash: '#D9CDB8', ink: PAL.ink, sw: 1 });
    for (let i = 0; i <= 12; i++) inkLine([[cx - w / 2 + i * w / 12, cy - 70], [cx - w / 2 - 50 + i * (w + 100) / 12, cy]], .8, '#9A8E78', 'inkfine', 0);
    if ((o.zap || 0) > 0) for (let i = 0; i < 6; i++) { boilSeed(key + 'z' + i + Math.floor(t * 12)); const x = cx - w / 2 + 60 + hash(i + Math.floor(t * 12)) * (w - 120), y = cy - 30; inkLine([[x, y], [x + 12, y - 30], [x - 6, y - 44], [x + 10, y - 76]], 2.4 * o.zap, '#F2C14A', 'ink', 0); }
  }
  // a little brain view: a cluster of neurons in a round inset; tagged ones get a rose switch; o.lit(i), o.seal
  function inset(cx, cy, r, t, o = {}) {
    const k = o.k ?? 1; if (k <= .02) return; const key = o.key || 'in';
    boilSeed(key); paint(ellPts(cx, cy, r * backOut(k), r * backOut(k), 32), { wash: '#4E4A86', ink: PAL.ink, sw: 1.3 });
    if (k < .7) return;
    const N = [[-.45, -.25], [-.1, -.45], [.35, -.3], [-.35, .25], [.1, .05], [.42, .3], [0, .48]];
    N.forEach(([a, b], i) => { const x = cx + a * r, y = cy + b * r, lit = o.lit ? o.lit(i) : 0, tg = o.tag ? o.tag(i) : 0;
      if (lit > .02) glow(x, y, r * .35, o.litCol || '#FFE08A', lit);
      boilSeed(key + 'n' + i);
      for (let d = 0; d < 3; d++) { const an = i * 1.7 + d * 2.1; inkLine([[x, y], [x + Math.cos(an) * r * .26, y + Math.sin(an) * r * .26]], 3, mixCol(Z.neuron, '#FFE6A0', lit), 'ink', 0); }
      paint(ellPts(x, y, r * .11, r * .11, 12), { wash: mixCol(Z.neuron, '#FFE6A0', lit), ink: PAL.ink, sw: .9 });
      if (tg > .02) { const q = backOut(tg); paint(rrPts(x + r * .05, y - r * .14 * q, r * .07 * q, r * .1 * q, 3), { wash: '#E0637C', ink: PAL.ink, sw: .6 }); }
      if ((o.seal || 0) > .02 && tg > .5) paint(ellPts(x, y, r * .13 * backOut(o.seal), r * .13 * backOut(o.seal), 14), { ink: Z.goldDk, sw: 2.2 });
    });
  }
  function labBg(t, key) {
    bigBg(Z.sand, Z.sandBlob, t, key);
    boilSeed('lf' + key); paint(rectPts(-2400, 880, W + 4800, 2400), { wash: Z.labFloor, ink: null });
    inkLine([[-1400, 882], [500, 878], [1500, 884], [3300, 880]], 1.2, mixCol(Z.labFloor, PAL.ink, .5), 'ink', .4);
    K.motes(t, 12, mixCol(Z.sand, '#B99A6A', .35), { key });
  }
  function switchIcon(x, y, s, on, key) {                         // the opto film's light switch (no lettering)
    boilSeed('sw' + key);
    paint(rrPts(x - 34 * s, y - 52 * s, 68 * s, 104 * s, 14 * s), { wash: '#F4EBDD', ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x - 12 * s, y - 30 * s, 24 * s, 60 * s, 8 * s), { wash: mixCol('#F4EBDD', PAL.ink, .25), ink: PAL.ink, sw: .8 });
    paint(rrPts(x - 10 * s, y + lerp(12, -12, on) * s - 14 * s, 20 * s, 28 * s, 7 * s), { wash: on > .5 ? Z.blueG : PAL.cream, ink: PAL.ink, sw: .9 });
  }
  function shotE(t, lt, dur) {
    const c = kf(t, [[L(13, -1.5), [960, 560, 1.0]], [L(14, -.2), [960, 560, 1.0]], [L(14, 0), [1040, 560, 1.0]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    labBg(t, 'e');
    const CX = 1080, FY = 860;
    if (t < L(14, -.2)) {
      // L13: the mouse, and the light switch from the opto film
      const fy = seg(t, L(13, 5.4), L(13, 6.6)), lt2 = seg(t, L(13, 7.0), L(13, 7.3));
      mouse(CX - 60, FY, 1.05, t, { key: 'me', fy, light: lt2, blink: K.blinkAt(t, 2) });
      if (lt2 > 0) { const bw = [CX - 60 + 185 * 1.05, FY - 160 * 1.05]; glow(bw[0], bw[1] - 300, 160, Z.blueG, .5 * lt2); }
      const sk = popK(t, L(13, 5.6), .4); if (sk > .02) { push(); translate(520, 520); scale(sk); switchIcon(0, 0, 1.2, lt2, 'es'); pop(); }
    } else {
      chamber(CX, FY + 20, 900, 560, t, { key: 'ech', zap: win(t, L(14, 2.6), L(14, 4.0), .1) });
      // the age of the mouse: a pup in L14, grows up over "几周以后", an adult from then on
      const grow = ease(seg(t, L(15, 0), L(15, 1.6))), S = lerp(.55, .95, grow);
      const inChamberX = CX - 120;
      const fear14 = ease(seg(t, L(14, 3.0), L(14, 3.4))) * (1 - seg(t, L(14, 8.8), L(14, 9.6)));
      const fear15 = ease(seg(t, L(15, 8.6), L(15, 8.9)));
      const fear16 = ease(seg(t, L(16, 7.2), L(16, 7.6)));
      const tag = t > L(15, -.1) && t < L(16, 0) ? 1 : 0;
      const fyIn = seg(t, L(15, 4.4), L(15, 5.4)) * (1 - seg(t, L(16, 0), L(16, .6)));
      const light = seg(t, L(15, 5.4), L(15, 5.7)) * (1 - seg(t, L(16, 0), L(16, .3)));
      const fear = Math.max(fear14, t < L(16, 0) ? fear15 : 0, t > L(16, 6) ? fear16 : 0);
      mouse(inChamberX, FY, S, t, { key: 'mc', fy: fyIn, fibre: fyIn > 0, light, fear: t > L(17, 0) ? 0 : fear, blink: K.blinkAt(t, 3) });
      if (fear > .5 && t < L(17, 0)) { const hd = [inChamberX + 250 * S, FY - 150 * S]; pipEmote('exclaim', hd[0] + 80, hd[1] - 70, 32, 1, 'mex'); }
      if (grow > 0 && grow < 1) sunMoon(CX, 260, 160, grow * 3, 'esm');
      // the brain inset (top right): the active cluster, the light switches, the light, the seal
      const ik = popK(t, L(14, 5.0), .45) * (1 - seg(t, L(17, 2.2), L(17, 2.7)));
      const act = i => [1, 4, 5].includes(i) ? 1 : 0;
      const litF = i => act(i) * Math.max(win(t, L(14, 5.4), L(14, 8.0), .3), light, t > L(16, 3.0) ? .9 * seg(t, L(16, 3.0), L(16, 3.6)) : 0);
      inset(1640, 300, 170, t, { k: ik, key: 'ei', lit: litF, litCol: light > .3 && t < L(16, 0) ? Z.blueG : '#FFE08A', tag: i => act(i) * popK(t, L(14, 8.1) + i * .12, .35), seal: seg(t, L(16, 3.0), L(16, 3.8)) });
      // the memory pearl: comes back (L16), then shows it is incomplete (L17)
      const pk = popK(t, L(16, 9.6), .45);
      if (pk > .02) pearl(1640, 330, 110, { v: 'box', key: 'ep', k: pk, lit: .5, half: seg(t, L(17, 2.8), L(17, 3.6)), crack: seg(t, L(17, 5.2), L(17, 6.6)) });
    }
    const hk = [[0, 'calm', { lookX: .8 }], [L(13, 1.7), 'confused', { lookX: .8 }], [L(13, 3.7), 'happy', { lookX: .8 }], [L(13, 5.8), 'idea'], [L(13, 7.2), 'excited'],
      [L(14, 0), 'calm', { lookX: .8 }], [L(14, 3.1), 'worried', { lookX: .8 }], [L(14, 5.4), 'wow', { lookX: .8, lookY: -.6 }], [L(14, 8.4), 'smug'],
      [L(15, 0), 'calm', { lookX: .8 }], [L(15, 3.4), 'laugh'], [L(15, 5.2), 'calm', { lookX: .8, lookY: -.3 }], [L(15, 8.8), 'wow', { lookX: .8 }], [L(15, 10.8), 'excited'],
      [L(16, 0), 'calm', { lookX: .8, lookY: -.6 }], [L(16, 3.2), 'idea'], [L(16, 7.3), 'wow', { lookX: .8 }], [L(16, 9.7), 'love'],
      [L(17, 0), 'calm', { lookX: .8, lookY: -.6 }], [L(17, 2.9), 'worried', { lookX: .8, lookY: -.6 }], [L(17, 7.6), 'sad', { lookX: .8 }], [L(17, 9.9), 'worried', { blush: 1, lookX: .8 }]];
    pip(330, 900, 34, { ...K.act(t, hk, 2), sq: .03 * voAt(t), key: 'pe' });
    camEnd();
    if (lt < .5) { const k = 1 - seg(lt, 0, .5); iris(960, 540, lerp(1500, 0, k * k)); }
    if (near(t, L(14, -.15), .12) > .05) flash(near(t, L(14, -.15), .15), PAL.cream);
    if (near(t, L(16, 0), .12) > .05) flash(near(t, L(16, 0), .15), PAL.cream);
    if (lt > dur - .5) flash(seg(lt, dur - .5, dur), PAL.cream);
  }

  // ================================ R: recap (238.2–254.4) ================================
  function shotR(t, lt, dur) {
    cam(960 + 4 * wob(t, .05), 540 + 3 * wob(t, .04), 1);
    bigBg(Z.board, Z.boardBlob, t, 'r');
    // left: a baby's hippocampus takes a pearl in ✓
    const lk = popK(t, L(18, 1.5), .45), rk = popK(t, L(18, 4.3), .45), hide = ease(seg(t, L(18, 11.4), L(18, 12.3)));
    if (lk > .02) {
      push(); translate(560, 460); scale(lk); const hp = hippo(0, 0, 1.6, t, { young: .6, key: 'rh' }); pop();
      const pIn = ease(seg(t, L(18, 1.9), L(18, 3.0)));
      pearl(lerp(300, 560 - 26 * 1.6, pIn), lerp(160, 460 + 34 * 1.6, pIn), 50, { v: 'steps', key: 'rp1', noPop: true, lit: .4 + .4 * seg(t, L(18, 8.4), L(18, 9.0)) });
      K.check(760, 260, 90, seg(t, L(18, 3.0), L(18, 3.5)), 'rok');
    }
    // right: a mouse brain with the light: its forgotten pearl lights again
    if (rk > .02) {
      push(); translate(1360, 760); scale(rk); mouse(0, 0, .8, t, { key: 'rm', fy: 1, light: seg(t, L(18, 6.4), L(18, 6.8)) }); pop();
      pearl(1420, 300, 60, { v: 'box', key: 'rp2', k: rk, blank: 1 - seg(t, L(18, 6.5), L(18, 7.3)), lit: .5 * seg(t, L(18, 6.8), L(18, 7.4)) + .3 * seg(t, L(18, 8.4), L(18, 9.0)) });
    }
    // "只是找不到了": a door slides in front of each pearl
    if (hide > 0) { door(560 - 40, lerp(-200, 700, hide), .9, { key: 'rd1', lock: seg(t, L(18, 12.3), L(18, 12.8)) }); door(1420, lerp(-200, 470, hide), .75, { key: 'rd2', lock: seg(t, L(18, 12.4), L(18, 12.9)) }); }
    camEnd();
    const hk = [[0, 'calm', { lookX: .8 }], [L(18, 1.6), 'happy', { lookX: .6 }], [L(18, 4.5), 'calm', { lookX: .8 }], [L(18, 6.8), 'wow'], [L(18, 8.5), 'idea'], [L(18, 11.6), 'calm', { lookX: .6 }]];
    host(160, 1000, 28, t, hk, { flip: false }, 'pr');
    if (lt < .5) flash(1 - seg(lt, 0, .5), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#D9A84E', Z.site]);
  }

  // ================================ F: the building site (254.4–315.8) ================================
  // neurons: a soma, dendrites, an axon to a target with an ochre synapse bulb on the end
  function nrn(x, y, s, t, o = {}) {
    const key = o.key || 'nr', col = mixCol(o.col || Z.neuron, '#FFE6A0', o.lit || 0), k = o.k ?? 1; if (k <= .02) return;
    const q = backOut(k);
    if ((o.lit || 0) > .05) glow(x, y, 110 * s, '#FFE08A', o.lit);
    boilSeed(key + 'd');
    for (let i = 0; i < 4; i++) { const a = (o.a0 ?? Math.PI) + (i - 1.5) * .8 + .2 * (hash(i + (o.seed || 0)) - .5), Ln = (70 + 30 * hash(i + 3 + (o.seed || 0))) * s * q;
      paint(ribbon([[x, y], [x + Math.cos(a) * Ln * .55, y + Math.sin(a) * Ln * .55 + 4 * wob(t, .2, i)], [x + Math.cos(a) * Ln, y + Math.sin(a) * Ln]], 13 * s, 3 * s), { wash: col, ink: PAL.ink, sw: .8 }); }
    if (o.to) { boilSeed(key + 'ax'); const e = o.to, m = [(x + e[0]) / 2 + (o.bend || 0), (y + e[1]) / 2 - 30]; paint(ribbon([[x, y], m, e], 11 * s, 6 * s), { wash: col, ink: PAL.ink, sw: .8 });
      paint(ellPts(e[0], e[1], 15 * s, 13 * s, 12), { wash: Z.syn, ink: PAL.ink, sw: .8 }); }
    boilSeed(key + 's'); paint(ellPts(x, y, 34 * s * q, 30 * s * q, 18), { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 45, tex: .5, ink: PAL.ink, sw: 1, curv: .3 });
  }
  function siteBg(t, key) {
    bigBg(Z.site, Z.siteBlob, t, key);
    boilSeed('sf' + key); paint(rectPts(-2400, 900, W + 4800, 2400), { wash: '#D9B77A', ink: null });
    inkLine([[-1400, 902], [500, 898], [1500, 904], [4300, 900]], 1.2, mixCol('#D9B77A', PAL.ink, .5), 'ink', .4);
    // building-site marks: striped barrier poles at the edges
    for (const bx of [-300, 2220, 4600]) { boilSeed('pole' + bx); paint(rectPts(bx, 640, 26, 262), { wash: PAL.cream, ink: PAL.ink, sw: .9 }); for (let i = 0; i < 4; i++) paint(rectPts(bx, 650 + i * 64, 26, 30), { wash: '#D9534F', ink: null }); }
    K.motes(t, 12, mixCol(Z.site, '#A9803A', .35), { key });
  }
  function snail(x, y, s, t, key) {                               // a snail: "slowed down"
    boilSeed('sn' + key);
    paint(ribbon([[x - 60 * s, y], [x + 10 * s, y + 2 * s], [x + 50 * s, y - 14 * s], [x + 62 * s, y - 34 * s]], 22 * s, 16 * s), { wash: '#C9B79A', ink: PAL.ink, sw: .9 });
    for (const d of [0, 1]) inkLine([[x + 58 * s, y - 40 * s], [x + (62 + d * 12) * s, y - 70 * s]], 1.2, PAL.ink, 'ink', .3);
    paint(ellPts(x - 10 * s, y - 34 * s, 40 * s, 36 * s, 18), { wash: '#D98C5E', fill: '#A8643C', fillOp: 50, ink: PAL.ink, sw: 1 });
    const P = []; for (let i = 0; i < 30; i++) { const a = i * .45 + t * .2, r = 32 * s * (1 - i / 32); P.push([x - 10 * s + Math.cos(a) * r, y - 34 * s + Math.sin(a) * r * .9]); } inkLine(P, 1.1, '#7A4A2C', 'ink', .5);
  }
  const NC = [[380, 540], [720, 430], [1060, 540], [1380, 430]], PEARL_F = [1700, 470], MINT = [[900, 790], [1250, 800], [560, 800]];
  function chain(t, o = {}) {
    const rew = ease(seg(t, L(19, 10.5), L(19, 12.0)));
    const mintK = i => popK(t, L(19, 8.1) + i * .6, .5);
    MINT.forEach((m, i) => nrn(m[0], m[1], .9, t, { key: 'mn' + i, col: Z.mint, k: mintK(i), a0: -Math.PI / 2, seed: i + 9 }));
    const tgt = i => i < 3 ? NC[i + 1] : PEARL_F;
    NC.forEach((n, i) => {
      let to = [tgt(i)[0] - 50, tgt(i)[1]];
      if (i === 1) to = [lerp(to[0], MINT[0][0], rew), lerp(to[1], MINT[0][1] - 50, rew)];
      nrn(n[0], n[1], 1, t, { key: 'nc' + i, to, lit: o.lit ? o.lit(i) : 0, seed: i, bend: i === 1 ? 80 * rew : 0 });
    });
    return rew;
  }
  function shotF(t, lt, dur) {
    const c = kf(t, [[L(19, -2), [1000, 560, 1.0]], [L(20, -.4), [1000, 560, 1.0]], [L(20, .6), [2700, 560, 1.0]], [L(20, 7.6), [2700, 560, 1.0]], [L(20, 8.4), [1000, 560, 1.0]],
      [L(21, -.3), [1000, 560, 1.0]], [L(21, .7), [1000, -1400, 1.0]], [L(21, 10.2), [1000, -1400, 1.0]], [L(21, 11.2), [1000, 560, 1.0]], [L(22, -.4), [1000, 560, 1.0]], [L(22, .6), [1350, 600, 1.05]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    siteBg(t, 'f');
    // the signal: first along the old route to the pearl (lit), later rerouted to a new neuron (the pearl stays dark)
    const run1 = seg(t, L(19, 4.0), L(19, 6.6)), run2 = seg(t, L(19, 12.7), L(19, 14.6));
    const litOld = i => near(run1 * 4.4, i + .5, .35), litNew = i => i < 2 ? near(run2 * 3, i + .5, .35) : 0;
    const rew = chain(t, { lit: i => Math.max(litOld(i), litNew(i)) });
    if (run2 > .6) nrn(MINT[0][0], MINT[0][1], .9, t, { key: 'mn0b', col: Z.mint, lit: near(run2, .9, .15), a0: -Math.PI / 2, seed: 9 });
    const doorK = ease(seg(t, L(22, .4), L(22, 1.4)));
    pearl(PEARL_F[0], PEARL_F[1], 56, { v: 'heart', key: 'fp', lit: .8 * seg(run1, .85, 1) * (1 - seg(t, L(19, 10.5), L(19, 11.5))) });
    // synapses bloom, then are pruned (L20 second half)
    const bloom = seg(t, L(20, 8.3), L(20, 10.6)), prune = seg(t, L(20, 11.2), L(20, 12.4));
    for (let i = 0; i < 22; i++) {
      const n = NC[i % 4], a = hash(i + 50) * TAU, d = 70 + 40 * hash(i + 51), x = n[0] + Math.cos(a) * d, y = n[1] + Math.sin(a) * d, k = popK(t, L(20, 8.3) + hash(i + 52) * 2.0, .3);
      if (k <= .02) continue; const cut = i % 2 && prune > hash(i + 53) * .8;
      if (cut) { const f = seg(prune, hash(i + 53) * .8, hash(i + 53) * .8 + .3); if (f >= 1) continue; boilSeed('sb' + i); paint(ellPts(x, y + 400 * f * f, 13 * (1 - f * .5), 11, 10), { wash: Z.syn, ink: PAL.ink, sw: .7 }); }
      else { boilSeed('sb' + i); paint(ellPts(x, y, 13 * backOut(k), 11 * backOut(k), 10), { wash: Z.syn, ink: PAL.ink, sw: .7 }); }
    }
    // the old route, as a ghost that no longer matches (L21 end)
    const ghost = seg(t, L(21, 11.4), L(21, 12.2)) * (1 - seg(t, L(22, -.6), L(22, 0)));
    if (ghost > .02) { boilSeed('gh'); const P = [NC[1], [890, 420], [1010, 540]]; for (let k = 0; k < 8; k++) { const a = k / 8, b = a + .07, pa = arcPt(P[0], P[2], 60, a), pb = arcPt(P[0], P[2], 60, b); inkLine([pa, pb], 3 * ghost, '#8E7AA8', 'ink', 0); } K.cross(890, 380, 60, seg(t, L(21, 12.2), L(21, 12.7)), 'ghx'); }
    // L20: two pups, normal vs neurogenesis slowed down
    if (t > L(20, -.6) && t < L(20, 8.6)) {
      for (const [px, slow] of [[2500, 0], [3200, 1]]) {
        mouse(px - 80, 880, .55, t, { key: 'fp' + slow, fibre: false });
        const ik = popK(t, L(20, .8), .4); if (ik <= .02) continue;
        boilSeed('fpi' + slow); paint(ellPts(px, 470, 210 * backOut(ik), 170 * backOut(ik), 30), { wash: '#F9EBCB', ink: PAL.ink, sw: 1.1 });
        const nS = slow ? 2 : 9;
        for (let i = 0; i < nS; i++) { const k = popK(t, L(20, 1.6) + i * (slow ? 1.4 : .32), .3); if (k <= .02) continue; boilSeed('fps' + slow + i); paint(ellPts(px - 150 + hash(i + 7) * 300, 400 + hash(i + 8) * 170, 16 * backOut(k), 14 * backOut(k), 10), { wash: Z.mint, ink: PAL.ink, sw: .7 }); }
        pearl(px + 110, 380, 46, { v: slow ? 'house' : 'sun', key: 'fpp' + slow, blank: slow ? 0 : seg(t, L(20, 3.0), L(20, 4.6)), lit: slow ? .5 * seg(t, L(20, 4.6), L(20, 5.2)) : 0 });
        if (slow) { snail(px + 160, 880, 1, t, 'fsn'); K.check(px + 190, 260, 70, seg(t, L(20, 4.8), L(20, 5.3)), 'fok'); }
      }
    }
    // L21: one synapse, close (up above the site): the bulb swells, more vesicles, a new bud
    if (t > L(21, -.4) && t < L(21, 11.4)) {
      const SX = 1000, SY = -1400, sw = ease(seg(t, L(21, 1.5), L(21, 2.6))), ves = seg(t, L(21, 3.4), L(21, 5.0)), bud = ease(seg(t, L(21, 5.9), L(21, 7.4)));
      boilSeed('syA'); paint(ribbon([[SX - 30, SY - 700], [SX - 10, SY - 400], [SX, SY - 200]], 50, 60), { wash: Z.neuron, ink: PAL.ink, sw: 1 });
      paint(ellPts(SX, SY - 110, 150 + 45 * sw, 120 + 30 * sw, 28), { wash: Z.syn, fill: '#C98A2A', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.2 });
      const nv = 6 + Math.floor(ves * 8);
      for (let i = 0; i < nv; i++) { boilSeed('ves' + i); const a = hash(i + 30) * TAU, r = 80 * Math.sqrt(hash(i + 31)), rel = i % 3 === 0 ? seg(t, L(21, 5.0) + i * .1, L(21, 5.6) + i * .1) : 0; const vy = SY - 110 + Math.sin(a) * r * .8 + rel * 110 + (1 - seg(t, L(21, 3.4) + i * .08, L(21, 3.7) + i * .08)) * (i >= 6 ? 0 : 0);
        if (i >= 6 && ves * 8 < i - 6) continue; paint(ellPts(SX + Math.cos(a) * r, vy, 15, 15, 10), { wash: '#FFF1C8', ink: PAL.ink, sw: .7 }); }
      boilSeed('syB'); paint([[SX - 260 - 40 * sw, SY + 140], [SX - 150 - 30 * sw, SY + 50], [SX + 150 + 30 * sw, SY + 50], [SX + 260 + 40 * sw, SY + 140], [SX + 300, SY + 420], [SX - 300, SY + 420]], { wash: Z.mint, fill: '#5FA98A', fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.2, curv: .4 });
      for (let i = 0; i < 5; i++) paint(rrPts(SX - 120 + i * 50, SY + 52, 30, 14, 5), { wash: '#3E8A6C', ink: null });
      if (bud > .02) { boilSeed('bud'); paint(ribbon([[SX + 420, SY - 600], [SX + 400, SY - 300], [SX + 330, SY - 60 * bud]], 40, 34), { wash: Z.neuron, ink: PAL.ink, sw: 1 }); paint(ellPts(SX + 330, SY - 20 - 40 * (1 - bud), 70 * backOut(bud), 56 * backOut(bud), 20), { wash: Z.syn, ink: PAL.ink, sw: 1 }); }
    }
    // L22: the door comes down in front of the pearl; its keyhole is a soft baby shape. The key doesn't fit.
    if (doorK > 0) door(PEARL_F[0], lerp(-200, 902, doorK), 1.25, { key: 'fd', hole: 'baby', lock: seg(t, L(22, 1.4), L(22, 1.9)) });
    const keyK = popK(t, L(22, 3.2), .45), tryK = seg(t, L(22, 8.6), L(22, 9.3)), bump = ring(t, [L(22, 9.3), L(22, 10.2)], 7, 22);
    const kh = [PEARL_F[0] + 170 * 1.25 * .28, 902 - 300 * 1.25 * .5];
    // Pip, in a hard hat from "高速施工"
    const px = kf(t, [[L(22, 1.5), 260], [L(22, 3.4), 1220]], ease), walking = t > L(22, 1.5) && t < L(22, 3.4);
    const hk = [[0, 'calm', { lookX: .8 }], [L(19, 2.1), 'smug'], [L(19, 4.3), 'happy', { lookX: .8 }], [L(19, 8.2), 'wow', { lookX: .6, lookY: .5 }], [L(19, 10.8), 'worried', { lookX: .8 }],
      [L(20, 0), 'calm', { lookX: .8 }], [L(20, 3.0), 'sad', { lookX: .8 }], [L(20, 4.8), 'happy', { lookX: .8 }], [L(20, 8.4), 'wow'], [L(20, 11.0), 'strain'],
      [L(21, 0), 'calm', { lookX: .8, lookY: -.5 }], [L(21, 2.0), 'wow', { lookX: .8, lookY: -.6 }], [L(21, 6.1), 'idea'], [L(21, 10.8), 'worried', { lookX: .8 }],
      [L(22, 1.8), 'calm', { lookX: .8 }], [L(22, 3.4), 'smug'], [L(22, 8.6), 'strain'], [L(22, 11.1), 'worried', { lookX: .8 }]];
    const ho = K.act(t, hk, 2), snip = t > L(20, 10.6) && t < L(20, 12.8);
    const keyHold = keyK > .02;
    const arm = keyHold ? { at: [3.0 + .4 * tryK, -2.4] } : snip ? { at: [2.6, -2.6] } : ho.armF;
    const camX = c[0], hostX = t < L(22, 1.5) ? camX - 700 : px, aloft = Math.abs(c[1] - 560) > 4, hy = c[1] + 340;
    const hyb = aloft ? K.swim(hostX, hy, 34, t, { ...ho, armF: arm, sq: (ho.sq || 0) + .03 * voAt(t) }, 'pf') : (pip(hostX, 900, 34, { ...ho, armF: arm, walk: walking ? t * 2.6 : 0, sq: (ho.sq || 0) + .03 * voAt(t), key: 'pf' }), 900);
    hardHat(hostX, hyb + (ho.dy || 0) * 34, 34, popK(t, L(19, 2.1), .4), 'pf');
    if (snip) { const h = K.hand(hostX, 900, 34, [2.6, -2.6], { dy: ho.dy }); shears(h[0], h[1], 120, -.3, .5 + .5 * Math.sin((t - L(20, 10.6)) * 12), 'fs'); }
    if (keyHold) { const h = K.hand(hostX, 900, 34, arm.at, { dy: ho.dy }), kx = lerp(h[0] + 50, kh[0] - 128, tryK) - 10 * bump, ky = lerp(h[1], kh[1] + 2, tryK); goldKey(kx + 60, ky, 1.1, 0, { key: 'fk', bow: 'talk' }); if (tryK >= 1) K.burst(kh[0], kh[1], 60, seg(t, L(22, 9.3), L(22, 9.8)), PAL.ink, 'fkb'); }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#D9A84E', Z.site]);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#B89A6E', Z.album]);
  }

  // ================================ G: the first memory you're sure of (315.8–348.2) ================================
  function wedge(x, y, R, a0, a1, off, o, key) {                  // a piece of a pearl, pushed out by off
    const am = (a0 + a1) / 2, cx = x + Math.cos(am) * off, cy = y + Math.sin(am) * off, P = [[cx, cy]];
    for (let i = 0; i <= 8; i++) { const a = lerp(a0, a1, i / 8); P.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
    boilSeed('wg' + key); paint(P, { wash: o.col || Z.pearl, fill: Z.pearlDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1 });
  }
  function photo(x, y, s, ang, key) {                              // a little instant photo: the baby on a beach
    boilSeed('ph' + key); push(); translate(x, y); rotate(ang);
    paint(rectPts(-70 * s, -80 * s, 140 * s, 160 * s), { wash: '#FBF8F0', ink: PAL.ink, sw: 1 });
    paint(rectPts(-58 * s, -68 * s, 116 * s, 110 * s), { wash: '#6FA8D6', ink: null });
    paint(rectPts(-58 * s, 0, 116 * s, 42 * s), { wash: '#F2D48C', ink: null });
    tinted(BABY, () => pip(0, 30 * s, 11 * s, { ...pipFeel('happy', T), noShadow: true, key: 'phb' + key }));
    pop();
  }
  function albumBg(t, key) {
    bigBg(Z.album, Z.albumBlob, t, key);
    boilSeed('pg' + key);
    paint(rrPts(150, 120, 800, 840, 18), { wash: Z.page, fill: '#E9D7B8', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(970, 120, 800, 840, 18), { wash: Z.page, fill: '#E9D7B8', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.1 });
    inkLine([[960, 130], [960, 950]], 1.6, mixCol(Z.album, PAL.ink, .5), 'ink', 0);
    for (const [x, y] of [[170, 140], [930, 140], [170, 940], [930, 940], [990, 140], [1750, 140], [990, 940], [1750, 940]]) { boilSeed('cn' + x + y); paint([[x, y], [x + (x < 960 && x > 500 || x > 1500 ? -40 : 40), y], [x, y + (y > 500 ? -40 : 40)]], { wash: '#B89A6E', ink: null }); }
    K.motes(t, 10, mixCol(Z.album, '#9E7E50', .35), { key });
  }
  function shotG(t, lt, dur) {
    cam(960 + 5 * wob(t, .05), 540 + 4 * wob(t, .04), 1);
    albumBg(t, 'g');
    // the crowd: 10 columns of people, filling in row by row; then 4 of every 10 columns light gold
    const crowd = seg(t, L(23, 6.0), L(23, 9.4)), gone = seg(t, L(24, .2), L(24, 1.0)), gold = seg(t, L(23, 10.0), L(23, 11.0));
    for (let r = 0; r < 7; r++) for (let cI = 0; cI < 10; cI++) {
      const k = popK(t, L(23, 6.0) + r * .45 + cI * .03, .3) * (1 - gone); if (k <= .02) continue;
      const x = 1060 + cI * 70, y = 270 + r * 92, lit = cI < 4 ? gold : 0; boilSeed('cr' + r + cI);
      const col = cI < 4 ? mixCol(['#C98F7E', '#8EA6C9', '#A9B98A', '#C9A0B8', '#D9B77A'][(r * 3 + cI) % 5], Z.gold, lit) : mixCol(['#C98F7E', '#8EA6C9', '#A9B98A', '#C9A0B8', '#D9B77A'][(r * 3 + cI) % 5], '#D8D2DA', gold * .75);
      if (lit > .3) glow(x, y - 10, 34, '#FFD98A', .5 * lit);
      paint(ellPts(x, y - 14 * backOut(k), 18 * backOut(k), 18 * backOut(k), 12), { wash: col, ink: PAL.ink, sw: .8 });
      paint(ellPts(x, y + 26 * backOut(k), 24 * backOut(k), 14 * backOut(k), 12), { wash: col, ink: PAL.ink, sw: .8 });
    }
    // Pip's own "first memory": a beach pearl, held up proudly; it comes apart, Mama's story and a photo fill it in
    const PC = [560, 470], big = ease(seg(t, L(24, .4), L(24, 1.4))), split = ease(seg(t, L(24, 1.5), L(24, 2.4))) * (1 - ease(seg(t, L(24, 7.2), L(24, 8.0))));
    const hk = [[0, 'smug'], [L(23, 3.8), 'calm', { lookX: .8 }], [L(23, 6.2), 'wow', { lookX: .8 }], [L(23, 10.2), 'excited'],
      [L(24, 0), 'calm', { lookX: .6, lookY: -.6 }], [L(24, 1.8), 'worried', { lookX: .6, lookY: -.6 }], [L(24, 4.6), 'calm', { lookX: .8 }], [L(24, 8.0), 'love', { lookX: .5, lookY: -.6 }], [L(24, 9.8), 'shy']];
    const ho = K.act(t, hk, 2), holding = big < .02;
    const hp = [330, 900], hand = K.hand(hp[0], hp[1], 36, [2.2, -4.4], { dy: ho.dy });
    pip(hp[0], hp[1], 36, { ...ho, armF: holding ? { at: [2.2, -4.4] } : ho.armF, sq: (ho.sq || 0) + .03 * voAt(t), key: 'pg' });
    const px = lerp(hand[0] + 10, PC[0], big), py = lerp(hand[1] - 60, PC[1], big), R = lerp(66, 170, big);
    // the memory Pip is sure of: a toddler on the beach, in a thought cloud on the right page
    const tk = win(t, L(23, .8), L(23, 5.9), .4);
    if (tk > .02) { cloud(1370, 480, 300, 220, tk, [hand[0] + 60, hand[1] - 120], 'gtc'); if (tk > .6) { vignette(1370, 470, 220, 'beach', 'gtv'); baby(1440, 600, 26, { ...pipFeel('laugh', t, { seed: 6 }), noShadow: true }, 'gtb'); } }
    if (split > .02) { for (let i = 0; i < 3; i++) wedge(px, py, R, i / 3 * TAU - .4, (i + 1) / 3 * TAU - .4, split * 70, { col: mixCol(Z.pearl, Z.blank, split) }, 'g' + i); }
    else pearl(px, py, R, { v: 'beach', key: 'gpr', noPop: true, k: 1, crack: t > L(24, 7.2) ? 1 : 0, lit: .5 * seg(t, L(24, 8.0), L(24, 8.6)) * (1 - .6 * seg(t, L(24, 9.8), L(24, 10.4))) });
    if (t > L(24, 9.8)) { boilSeed('seam'); const q = seg(t, L(24, 9.8), L(24, 10.6)); inkLine([[px - R * .9, py - R * .2], [px - R * .3, py - R * .05], [px - R * .1, py + R * .4], [px + R * .2, py + R * .9]], 2.6 * q, '#7A5A3E', 'ink', 0); inkLine([[px - R * .3, py - R * .05], [px + R * .35, py - R * .35], [px + R * .9, py - R * .3]], 2.6 * q, '#7A5A3E', 'ink', 0); }
    // Mama tells the story (a bubble with the beach in it); a photo slides in; both fly into the pearl
    const mk = win(t, L(24, 3.6), L(24, 9.0), .5);
    if (mk > .02) {
      tinted(MAMA, () => pip(lerp(2100, 1520, ease(mk)), 900, 40, { ...K.act(t, [[0, 'happy'], [L(24, 4.6), 'sing']], 5), flip: true, key: 'mamaG' }));
      const bub = seg(t, L(24, 4.6), L(24, 5.0)), fly = ease(seg(t, L(24, 6.0), L(24, 7.2)));
      if (bub > 0 && fly < 1) { const bx = lerp(1360, PC[0] - 60, fly), by = lerp(500, PC[1] + 20, fly), q = backOut(bub) * (1 - .6 * fly); cloud(bx, by, 150 * q, 100 * q, 1, [1500, 700], 'gb'); vignette(bx, by, 70 * q, 'beach', 'gbv'); }
      const ph = ease(seg(t, L(24, 6.4), L(24, 7.4)));
      if (t > L(24, 6.0) && ph < 1) photo(lerp(1250, PC[0] + 60, ph), lerp(-120 + 380 * ease(seg(t, L(24, 6.0), L(24, 6.4))), PC[1], ph), 1.2 * (1 - .5 * ph), .15 - .3 * ph, 'gph');
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#B89A6E', Z.album]);
    if (lt > dur - .6) { const k = seg(lt, dur - .6, dur); flash(k, '#F9DDB3'); }
  }

  // ================================ H: the locked door (348.2–384) ================================
  const DOOR_H = [-285, 862];
  function shotH(t, lt, dur) {
    const look = t > L(25, 4.6) && t < L(25, 6.9);
    if (look) {
      // through the keyhole: the lost years, all there, glowing
      cam(-430 + 10 * wob(t, .05) + 60 * seg(t, L(25, 4.6), L(25, 6.9)), 640 + 6 * wob(t, .04), 1.55);
      homeBg(t, 'hk', 1);
      babyScene(t, 1, 'hk', { papa: [[0, 'happy', { lookX: .9 }]], mama: [[0, 'wave']], baby: tt => ({ x: -620 + 260 * ease(seg(tt, L(25, 4.6), L(25, 6.6))), o: { ...pipFeel('excited', tt), walk: tt * 3.2 } }) });
      [['steps', -640, 430], ['heart', -430, 380], ['face', -220, 430], ['ball', -560, 560], ['house', -300, 560]].forEach(([v, x, y], i) => pearl(x, y + 10 * wob(t, .3, i * .2), 48, { v, key: 'hkp' + i, lit: .7 }));
      camEnd();
      const k = ease(seg(t, L(25, 4.6), L(25, 5.2))) * (1 - ease(seg(t, L(25, 6.4), L(25, 6.9))));
      irisShape(keyhole(960, 450, lerp(30, 300, k)), Z.doorDk);
      return;
    }
    const c = kf(t, [[L(25, -1.6), [-100, 600, 1.15]], [L(25, 3.0), [-240, 640, 1.2]], [L(25, 4.6), [-209, 620, 4.0]], [L(25, 6.9), [-209, 620, 4.0]], [L(25, 7.9), [-200, 650, 1.15]], [L(26, 8.8), [-200, 650, 1.15]], [L(26, 10.0), [-120, 600, 1.4]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    homeBg(t, 'h', 1);
    door(DOOR_H[0], DOOR_H[1], 1.6, { key: 'hd', frame: '#A8643C' });
    glow(DOOR_H[0] + 170 * 1.6 * .28, DOOR_H[1] - 300 * 1.6 * .5, 40, '#FFD98A', .5 + .2 * wob(t, .5));
    string(STR, 52, t, 'sh', { lit: i => i >= 10 ? .25 * seg(t, L(25, 2.0), L(25, 3.0)) : .2 });
    // Pip at the door
    const hk = [[0, 'calm', { lookX: -.9 }], [L(25, 3.2), 'idea'], [L(25, 7.0), 'calm', { lookX: -.9, lookY: -.3 }], [L(25, 8.2), 'worried', { lookX: -.9 }], [L(25, 9.4), 'love'],
      [L(26, 0), 'smug'], [L(26, 3.9), 'idea'], [L(26, 7.4), 'strain'], [L(26, 9.2), 'confused', { lookX: .2, lookY: .1 }], [L(26, 12.5), 'wave']];
    const ho = K.act(t, hk, 2), touching = t > L(25, 9.4) && t < L(26, 1.5);
    const snip = t > L(26, 4.0) && t < L(26, 8.6);
    pip(-30, 862, 34, { ...ho, flip: t < L(26, 9.0), armF: touching ? { to: [3.4 * 34, -3.0 * 34] } : snip ? { at: [2.6, -2.6] } : ho.armF, sq: (ho.sq || 0) + .03 * voAt(t), key: 'ph' });
    hardHat(-30, 862 + (ho.dy || 0) * 34, 34, popK(t, L(26, .3), .45), 'ph', t < L(26, 9.0));
    if (snip) { const h = K.hand(-30, 862, 34, [2.6, -2.6], { flip: true, dy: ho.dy }); shears(h[0], h[1], 110, Math.PI + .3, .5 + .5 * Math.cos((t - L(26, 4.0)) * 9), 'hs'); }
    const at = toScreen(-30, 862 - 3 * 34);
    camEnd();
    if (lt < .6) flash(1 - seg(lt, 0, .6), '#F9DDB3');
    if (t > L(25, 4.3) && t < L(25, 4.6)) irisShape(keyhole(960, 450, lerp(300, 30, seg(t, L(25, 4.3), L(25, 4.6)))), Z.doorDk);
    const out = seg(t, DUR - 3.4, DUR - .4);
    if (out > 0) iris(at[0], at[1], lerp(1400, 0, easeIn(out)));
  }

  LOOPS.cover = t => {
    cam(-240, 600, 1.35);
    homeBg(t, 'cv', 1);
    door(DOOR_H[0], DOOR_H[1], 1.6, { key: 'cvd', frame: '#A8643C' });
    glow(DOOR_H[0] + 170 * 1.6 * .28, DOOR_H[1] - 300 * 1.6 * .5, 60, '#FFD98A', .9);
    string(STR.slice(7).map(([x, y, v, b]) => [x, y - 170, v, b]), 60, t, 'cv');
    pip(150, 862, 50, { ...pipFeel('confused', t), lookX: -.9, lookY: -.7, flip: true, key: 'cvp' });
    camEnd();
  };
  LOOPS.cover.len = 2;

  shots([[0, shotA], [L(3, -1.7), shotB], [L(6, -1.45), shotC], [L(9, -1.3), shotD], [L(13, -1.5), shotE], [L(18, -.7), shotR], [L(19, -1.85), shotF], [L(23, -1.9), shotG], [L(25, -1.75), shotH]]);
})();

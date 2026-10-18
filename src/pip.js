// pip.js: Pip, the plum sprout, as a shared global so any scene can cast it.
// pip(x, y, u, o): (x, y) = ground point between the feet; body 3.6u wide, 5u tall, plus the leaf. Options:
//   flip, turn, sq, dy, rot, face (calm|happy|idea|strain|wow|star), blink, lookX/lookY, armF/armB ([ang, len] or {to}),
//   armsFront, walk, kick, leaf, blush, noShadow, key; weight scales the ink (bolder for tiny uses, like icons). Arms also take {at: [x, y]} in u units (local, unflipped).
// More faces: laugh, love, wink, smug, shy, sad, worried, angry, sleepy, dizzy. Extras: tear (0..1), emote (sweat, anger,
//   heart, zzz, sparkle, question, exclaim, note) with emoteK (0..1, its pop-in). pipFeel(name, t) acts a whole mood.
// Slapstick faces (PIP_FACES: a base face plus parts): shock, scream, ouch, ko, deadpan, blank, gulp, eek, scheme, blech,
//   puff, ah, bliss. Parts override any face's own: eyes (a face's eyes, or x | dot; a pair [back, front] for odd eyes),
//   mouth (a face's mouth, or jaw | scream | teeth | evil | tongue | ko | flat | pursed), lid [close, tilt], brow
//   [inner, outer] (null = none). Dials for takes: eyeS (eye size; 1.8 pops them), pupil (size; .4 pinprick, 1.6
//   pleading), browY (extra brow lift, u), jaw (how far the mouth opens; 2+ drops it to the floor), tongue (0..1),
//   cheeks (puffed, 0..1). stepH scales the walk's foot lift. yaw (radians) turns Pip about its upright axis, in 3D:
//   the face and belly slide round the body and vanish at the back, the arms swing round, the leaf turns edge-on. More emotes: stars, dots, scribble, gloom, steam, panic,
//   bulb. More moods in PIP_TOON_FEELS. The gags that drive all this (takes, flattening, zip-offs…) are in pip_toon.js.
const PIPC ={ pip: '#8E5B8F', pipDk: '#6A3F6D', belly: '#EBCBD8', leaf: '#8DBF5E', leafDk: '#5E8C3E', mouth: '#5E2440', rose: '#E27A92', gold: '#F4C54A' };
const pipHeart = (cx, cy, r, n = 24) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, sa = Math.sin(a);
  p.push([cx + r * sa * sa * sa, cy - r * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16 - r * .1]); } return p; };
// The slapstick faces: each is a base face plus parts and dials. Anything the caller sets wins over the preset.
const PIP_FACES = {
  shock:   { face: 'wow', eyeS: 1.35, pupil: .45, brow: [.14, .04], mouth: 'jaw', jaw: 1 },        // the wild take
  scream:  { face: 'wow', eyeS: 1.25, pupil: .4, brow: [.16, -.06], mouth: 'scream', jaw: 1 },
  ouch:    { face: 'strain', brow: [.3, -.05], mouth: 'scream', jaw: .7 },                         // OW: squeezed shut, yelling
  ko:      { face: 'calm', eyes: 'x', mouth: 'ko', tongue: 1, blush: .2 },                          // knocked out
  deadpan: { face: 'calm', lid: [.5, 0], mouth: 'flat' },                                           // the flat look at the camera
  blank:   { face: 'calm', pupil: .45, mouth: 'flat', blush: .2 },                                  // stunned (blinks in a sooty face)
  gulp:    { face: 'worried', eyeS: 1.15, pupil: .55, mouth: 'pursed' },
  eek:     { face: 'worried', eyeS: 1.1, pupil: .6, mouth: 'teeth' },                               // the sheepish toothy grin
  scheme:  { face: 'angry', lid: [.42, -.3], brow: [-.2, .12], mouth: 'evil' },
  blech:   { face: 'strain', brow: [.2, -.06], mouth: 'tongue', tongue: 1 },
  puff:    { face: 'wow', pupil: .8, mouth: 'pursed', cheeks: 1 },                                  // cheeks full, holding its breath
  ah:      { face: 'worried', lid: [.48, .25], brow: [.38, .12], mouth: 'jaw', jaw: .4, pupil: .8 }, // the sneeze coming
  bliss:   { face: 'happy', mouth: 'calm', blush: 1 }
};
function pip(x, y, u, o = {}) {
  if (PIP_FACES[o.face]) { const p = PIP_FACES[o.face], q = { ...o }; for (const k in p) if (q[k] === undefined) q[k] = p[k]; q.face = p.face; o = q; }
  const YAW = o.yaw === undefined ? null : o.yaw + (o.turn ?? .4) * .21;   // turn's lean of the face is a small yaw
  const sq = o.sq || 0, sw = clamp(u / 30, .5, 1.3) * (o.weight || 1), dir = o.flip ? -1 : 1, turn = YAW === null ? (o.turn ?? .4) : 0;
  const lift = -(o.dy || 0) * u;
  if (!o.noShadow) {
    boilSeed('pipShadow' + (o.key || ''));
    const k = clamp(1 - lift / (6 * u), .3, 1);
    paint(ellPts(x, y + 3, 1.9 * u * k, .32 * u * k, 18), { fill: '#3B2F3A', fillOp: 55 * k, bleed: .15, tex: .3, ink: null });
  }
  if (AUDIT) auditBox('pip', o.key || '', x - 1.95 * u * (1 + sq), y + (o.dy || 0) * u - 6.6 * u, x + 1.95 * u * (1 + sq), y + (o.dy || 0) * u);
  boilSeed('pip' + (o.key || ''));
  push(); translate(x, y + (o.dy || 0) * u); rotate(o.rot || 0); scale(dir * (1 + sq), 1 - sq);
  const j = u * .035, fx = turn * .38 * u;                  // fx: the face slides toward the heading
  // yaw: side-to-side parts squeeze by cos(yaw) (hands and feet just move); marks on the body's surface are carried round it and hidden at the back
  const cyaw = YAW === null ? 1 : Math.cos(YAW), X_ = P => YAW === null ? P : P.map(([a, b]) => [a * cyaw, b]);
  const hwAt = Y => { const c = clamp(-(Y + 2.5 * u) / (2.45 * u), -1, 1); return 1.8 * u * Math.sqrt(1 - c * c) * (1 - .1 * c); };   // body half-width
  const decal = (cx, cy, fn) => {                   // a mark at (cx, cy) on the surface, turned with yaw
    if (YAW === null) return fn();
    const R = Math.max(hwAt(cy), Math.abs(cx) + .01), a = Math.asin(cx / R) + YAW, c = Math.cos(a); if (c < .12) return;
    push(); translate(R * Math.sin(a), 0); scale(c, 1); translate(-cx, 0); fn(); pop();
  };
  const near = side => YAW !== null && -side * Math.sin(YAW) > 0;   // turned, the near arm goes over the body

  // arms first, so the body covers their roots
  const arm = (side, spec, front, over) => {           // over: a near arm drawn over the turned body, from the shoulder
    const S = front ? [side * 1.62 * u, -2.35 * u] : [side * 1.35 * u, -2.5 * u];   // in front, the root sits on the body's edge
    let T;
    if (spec && spec.to) T = spec.to;
    else if (spec && !Array.isArray(spec)) T = [spec.at[0] * u, spec.at[1] * u];
    else { const [a, l] = spec || [-1.0, 1.6]; T = [S[0] + side * Math.cos(a) * l * u, S[1] - Math.sin(a) * l * u]; }
    { const dd = Math.hypot(T[0] - S[0], T[1] - S[1]), mx = 3.6 * u; if (dd > mx) T = [S[0] + (T[0] - S[0]) * mx / dd, S[1] + (T[1] - S[1]) * mx / dd]; }
    const vx = T[0] - S[0], vy = T[1] - S[1], d = Math.hypot(vx, vy) || 1, px = -vy / d, py = vx / d, bend = (front ? -.12 : .22) * side * u * Math.min(1, d / (1.5 * u));
    const mid = [S[0] + vx * .5 + px * bend, S[1] + vy * .5 + py * bend];
    const lit = YAW === null || Math.abs(Math.sin(YAW)) < .05 ? side > 0 : near(side);
    paint(X_(ribbon(front || over ? [S, mid, T] : [[S[0] - side * .6 * u, S[1] + .1 * u], S, mid, T], (front ? .5 : .62) * u, .42 * u)), { wash: lit ? PIPC.pip : PIPC.pipDk, ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(T[0] * cyaw, T[1], .3 * u, .3 * u, 12, j * .5), { wash: lit ? PIPC.pip : PIPC.pipDk, ink: PAL.ink, sw: sw * .7 });
  };
  if (!o.armsFront) { if (!near(-1)) arm(-1, o.armB); if (!near(1)) arm(1, o.armF); }

  // feet
  for (const s of [-1, 1]) {
    const ph = (o.walk || 0) * Math.PI + (s > 0 ? 0 : Math.PI), up = o.walk ? Math.max(0, Math.sin(ph)) * .45 * u * (o.stepH ?? 1) : 0;
    const kick = o.kick ? Math.sin(o.kick * TAU + (s > 0 ? 0 : 2)) * .5 * u : 0;
    paint(ellPts((s * .78 * u + .15 * u + (o.walk ? Math.cos(ph) * .25 * u : 0)) * cyaw, -.2 * u - up + kick * .6, .56 * u, .3 * u, 14, j * .5), { wash: PIPC.pipDk, ink: PAL.ink, sw: sw * .8 });
  }

  // leaf on a stalk: drags behind moves (o.leaf), sways at rest
  const la = (o.leaf || 0) + .12 * wob(T, .45, .3), top = [fx * .3, -4.85 * u], tip = [top[0] + Math.sin(la) * 1.6 * u, top[1] - Math.cos(la) * 1.5 * u];
  inkLine(X_([top, [lerp(top[0], tip[0], .4) - .15 * u, lerp(top[1], tip[1], .5)], tip]), sw * 1.2, PIPC.leafDk, 'ink', .6);
  const ang = la - 1.05, L = 1.5 * u, Wd = .55 * u, lp = [];
  for (let i = 0; i <= 8; i++) { const k = i / 8, w = Math.sin(k * Math.PI) * Wd * (1 - .25 * k); lp.push([k * L, -w]); }
  for (let i = 7; i >= 1; i--) { const k = i / 8, w = Math.sin(k * Math.PI) * Wd * (1 - .25 * k); lp.push([k * L, w]); }
  const rotP = P => P.map(([a, b]) => [tip[0] + a * Math.cos(ang) - b * Math.sin(ang), tip[1] + a * Math.sin(ang) + b * Math.cos(ang)]);
  paint(X_(rotP(lp)), { wash: PIPC.leaf, fill: PIPC.leafDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .75, curv: .4 });
  inkLine(X_(rotP([[.1 * u, 0], [L * .55, -.03 * u], [L * .85, 0]])), sw * .45, PIPC.leafDk, 'inkfine', .5);

  // body: an egg, a little wider at the bottom
  const bp = [];
  for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, c = Math.cos(a), s = Math.sin(a); bp.push([s * 1.8 * u * (1 - .1 * c) + jit(j), -2.5 * u - c * 2.45 * u + jit(j)]); }
  paint(bp, { wash: PIPC.pip, fill: PIPC.pipDk, fillOp: 45, bleed: .04, tex: .6, border: .5, ink: PAL.ink, sw, curv: .3 });
  if (YAW === null) paint(ellPts(fx * .5, -1.75 * u, 1.12 * u, 1.3 * u, 22, j), { wash: PIPC.belly, ink: null });
  else {                                            // the belly patch, seen round the curve: its visible span of the surface
    const R = 1.76 * u, a = Math.atan2(Math.sin(YAW), Math.cos(YAW)), lo = Math.max(a - .69, -Math.PI / 2), hi = Math.min(a + .69, Math.PI / 2);
    if (hi - lo > .1) paint(ellPts(R * (Math.sin(lo) + Math.sin(hi)) / 2, -1.75 * u, R * (Math.sin(hi) - Math.sin(lo)) / 2, 1.3 * u * (.75 + .25 * (hi - lo) / 1.38), 22, j), { wash: PIPC.belly, ink: null });
  }
  if (o.cheeks > 0) for (const s of [-1, 1]) {        // puffed cheeks bulge past the outline, under the eyes
    const k = clamp(o.cheeks, 0, 1.5), r = (.32 + .42 * k) * u;
    const cx = fx * .7 + s * (1.3 + .18 * k) * u, cy = -2.5 * u;
    decal(cx, cy, () => { paint(ellPts(cx, cy, r, r * .88, 16, j * .4), { wash: PIPC.pip, fill: PIPC.pipDk, fillOp: 35, tex: .5, ink: null });
    inkLine(Array.from({ length: 9 }, (_, i) => { const a = (s > 0 ? 0 : Math.PI) + (i / 8 - .5) * 2.6 * s; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * .88]; }), sw * .9, PAL.ink, 'ink', .6); });
  }

  // face. Lids (k: how far down they close, tilt: >0 lowers the outer corner) and brows (inner/outer lift, in u) shape the mood.
  // o.eyes / o.mouth borrow another face's eyes or mouth (or a slapstick one), and the dials resize them (see the header).
  const blink = clamp(o.blink || 0), face = o.face || 'calm', lx = (o.lookX || 0) * .16 * u, ly = (o.lookY || 0) * .26 * u;
  const LIDS = { smug: [.45, 0], sleepy: [.58, 0], sad: [.28, .35], angry: [.38, -.5], worried: [.1, .25] };
  const BROWS = { sad: [.22, -.06], worried: [.26, -.02], angry: [-.24, .14], smug: [.02, .14] };
  const es = o.eyeS ?? 1, spread = es > 1 ? 1 + .75 * (es - 1) : 1, eyeLift = es > 1 ? .55 * (es - 1) * u : 0;   // popped eyes grow up and apart
  const closedEye = (ex, ey, s) => inkLine([[ex - .36 * u, ey + .06 * u], [ex, ey - .3 * u], [ex + .36 * u, ey + .06 * u]], sw * .95, PAL.ink, 'ink', .7);
  for (const s of [-1, 1]) {
    const ek = (Array.isArray(o.eyes) ? o.eyes[s > 0 ? 1 : 0] : o.eyes) ?? face;
    const LID = o.lid !== undefined ? o.lid : LIDS[ek], BROW = o.brow !== undefined ? o.brow : BROWS[ek];
    const ex = fx + s * .64 * u * (1 - .18 * turn * s) * spread, ey = -3.35 * u - eyeLift;
    decal(ex, ey, () => {
      if (blink > .7 || ek === 'happy' || ek === 'laugh' || ek === 'closed' || (ek === 'wink' && s > 0)) {
        closedEye(ex, ey, s);
      } else if (ek === 'strain') {
        inkLine([[ex - s * .32 * u * es, ey - .26 * u * es], [ex + s * .26 * u * es, ey], [ex - s * .32 * u * es, ey + .26 * u * es]], sw * .95, PAL.ink, 'ink', .2);
      } else if (ek === 'love') {
        paint(pipHeart(ex, ey, .48 * u * (1 + .08 * wob(T, 2.2)) * es), { wash: PIPC.rose, ink: PAL.ink, sw: sw * .6 });
        paint(ellPts(ex - .16 * u, ey - .14 * u, .08 * u, .08 * u, 8), { wash: PAL.cream, ink: null });
      } else if (ek === 'x') {                         // knocked out
        const r = .28 * u * es;
        inkLine([[ex - r, ey - r], [ex + r, ey + r]], sw * 1.1, PAL.ink, 'ink', 0);
        inkLine([[ex + r, ey - r], [ex - r, ey + r]], sw * 1.1, PAL.ink, 'ink', 0);
      } else if (ek === 'dot') {                       // beady: no whites
        const r = .14 * u * es;
        paint(ellPts(ex + lx * .5, ey + ly * .5, r, r * 1.15 * (1 - blink * .8), 10), { wash: PAL.ink, ink: null });
        paint(ellPts(ex + lx * .5 + r * .35, ey + ly * .5 - r * .4, r * .3, r * .3, 6), { wash: PAL.cream, ink: null });
      } else {
        const big = (ek === 'wow' || ek === 'star' ? 1.25 : ek === 'idea' || ek === 'worried' ? 1.12 : 1) * es;
        const rx = .42 * u * big, ry = .6 * u * big * (1 - blink);
        paint(ellPts(ex, ey, rx, ry, 16, j * .4), { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 });
        if (ek === 'star') {
          paint(starPts(ex + lx, ey + ly, .34 * u * es, .45, 5), { wash: PIPC.gold, ink: PAL.ink, sw: sw * .5 });
        } else if (ek === 'dizzy') {
          const sp = [], a0 = T * 9 * s; for (let i = 0; i <= 26; i++) { const k = i / 26, a = a0 + k * 2.6 * TAU; sp.push([ex + Math.cos(a) * rx * .85 * k, ey + Math.sin(a) * ry * .8 * k]); }
          inkLine(sp, sw * .6, PAL.ink, 'inkfine', .5);
        } else {
          const pr = (ek === 'wow' ? .17 : ek === 'idea' ? .15 : ek === 'worried' ? .14 : .2) * u * (o.pupil ?? 1);
          const py = ey + ly * big + (LID ? LID[0] * .3 * ry : 0);
          paint(ellPts(ex + lx, py, pr, pr * 1.3 * (1 - blink * .6), 12), { wash: PAL.ink, ink: null });
          paint(ellPts(ex + lx + .08 * u, py - .1 * u, pr * .35, pr * .35, 8), { wash: PAL.cream, ink: null });
          if ((o.pupil ?? 1) > 1.3) paint(ellPts(ex + lx - pr * .4, py + pr * .5, pr * .17, pr * .17, 6), { wash: PAL.cream, ink: null });   // pleading: a second glint
        }
        if (LID && ry > 1) {                           // the lid: the eye's top, cut by a straight edge
          const [k, tl] = LID, cut = X => ey - ry + 2 * ry * k + tl * s * ry * (X - ex) / rx;
          paint(ellPts(ex, ey, rx * 1.04, ry * 1.04, 20).map(([X, Y]) => [X, Math.min(Y, cut(X))]), { wash: PIPC.pip, ink: null });
          inkLine([[ex - rx * .95, cut(ex - rx * .95)], [ex + rx * .95, cut(ex + rx * .95)]], sw * .8, PAL.ink, 'ink', 0);
        }
      }
      if (BROW) {                                      // inner end (toward the middle) and outer end, lifted by BROW
        const by = ey - .95 * u * (ek === 'worried' ? 1.1 : 1) - (es > 1 ? .7 * (es - 1) * u : 0) - (o.browY || 0) * u, bi = ex - s * .32 * u * es, bo = ex + s * .36 * u * es;
        inkLine([[bi, by - BROW[0] * u], [lerp(bi, bo, .5), by - lerp(BROW[0], BROW[1], .5) * u - .04 * u], [bo, by - BROW[1] * u]], sw * 1.05, PAL.ink, 'ink', .5);
      }
    });
  }
  const mx = fx * 1.05, my = -2.55 * u + (es > 1 ? .4 * (es - 1) * u : 0), mk = o.mouth ?? face;
  const grin = (w, d, tongue = true) => {            // an open smile: flat top, round bottom
    const mp = [[mx - w, my - .1 * u]];
    for (let i = 1; i < 8; i++) { const a = i / 8 * Math.PI; mp.push([mx - Math.cos(a) * w, my - .1 * u + Math.sin(a) * d]); }
    mp.push([mx + w, my - .1 * u]);
    paint(mp, { wash: PIPC.mouth, ink: PAL.ink, sw: sw * .7 });
    if (tongue) paint(ellPts(mx, my + d * .6, w * .45, d * .25, 10), { wash: PIPC.rose, ink: null });
  };
  const hole = P => paint(P, { wash: PIPC.mouth, ink: PAL.ink, sw: sw * .7 });
  const jaw = o.jaw ?? 1, tg = clamp(o.tongue ?? 1, 0, 1.5), band = (n, f) => { const P = []; for (let i = 0; i <= n; i++) P.push(f(i / n)); return P; };
  decal(mx, my, () => {
    if (mk === 'jaw') {                                // agape: a tall U that drops as far as jaw says (2+ reaches the floor)
      const w = (.34 + .1 * Math.min(jaw, 2)) * u, d = (.42 + 1.1 * jaw) * u, top = my - .14 * u;
      hole([...band(4, k => [mx - w + 2 * w * k, top - .05 * u * Math.sin(k * Math.PI)]), ...band(12, k => [mx + Math.cos(k * Math.PI) * w, top + Math.sin(k * Math.PI) * d]).slice(1, 12)]);
      if (d > .6 * u) paint(ellPts(mx, top + d * .78, w * .5, Math.min(d * .15, .3 * u), 12), { wash: PIPC.rose, ink: null });
    } else if (mk === 'scream') {                      // wide open, top teeth bared, tongue down below
      const w = .6 * u, d = (.45 + .55 * jaw) * u, top = my - .24 * u;
      hole([[mx - w, top], [mx + w, top], ...band(12, k => [mx + Math.cos(k * Math.PI) * w * .94, top + .04 * u + Math.sin(k * Math.PI) * d]).slice(1, 12)]);
      paint(ellPts(mx, top + d * .78, w * .46, Math.min(d * .17, .26 * u), 12), { wash: PIPC.rose, ink: null });
      paint([[mx - w * .9, top + .03 * u], [mx + w * .9, top + .03 * u], [mx + w * .8, top + .19 * u], [mx - w * .8, top + .19 * u]], { wash: PAL.cream, ink: PAL.ink, sw: sw * .4 });
      for (const k of [-.45, 0, .45]) inkLine([[mx + k * w, top + .05 * u], [mx + k * w, top + .18 * u]], sw * .35, PAL.ink, 'inkfine', 0);
    } else if (mk === 'teeth') {                       // a clenched toothy grin; jaw (0..1) opens a chattering gap
      const w = .6 * u, g = clamp(o.jaw ?? 0) * .3 * u, c = k => (2 * k - 1) * (2 * k - 1);
      const top = k => my - .17 * u - .1 * u * c(k), mid = k => my + .01 * u - .1 * u * c(k), bot = k => my + .17 * u + g - .12 * u * c(k), X = k => mx - w + 2 * w * k;
      paint([...band(10, k => [X(k), top(k)]), ...band(10, k => [X(1 - k), bot(1 - k)])], { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 });
      if (g > .5) paint([...band(10, k => [X(k), mid(k)]).slice(1, 10), ...band(10, k => [X(1 - k), mid(1 - k) + g]).slice(1, 10)], { wash: PIPC.mouth, ink: null });
      inkLine(band(10, k => [X(k), mid(k)]), sw * .45, PAL.ink, 'inkfine', .4);
      if (g > .5) inkLine(band(10, k => [X(k), mid(k) + g]), sw * .45, PAL.ink, 'inkfine', .4);
      for (let i = 1; i < 6; i++) { const k = i / 6; inkLine([[X(k), top(k) + .02 * u], [X(k), mid(k)]], sw * .35, PAL.ink, 'inkfine', 0); inkLine([[X(k), mid(k) + g], [X(k), bot(k) - .02 * u]], sw * .35, PAL.ink, 'inkfine', 0); }
    } else if (mk === 'evil') {                        // a wide crescent grin with a row of teeth: up to no good
      const w = .68 * u, top = k => my - .1 * u - .24 * u * (2 * k - 1) * (2 * k - 1), X = k => mx - w + 2 * w * k;
      hole([...band(12, k => [X(k), top(k)]), ...band(12, k => [X(1 - k), top(1 - k) + .46 * u * Math.pow(Math.sin((1 - k) * Math.PI), .8)]).slice(1, 12)]);
      paint([...band(12, k => [X(k), top(k) + .02 * u]).slice(1, 12), ...band(12, k => [X(1 - k), top(1 - k) + .02 * u + .15 * u * Math.min(1, Math.sin((1 - k) * Math.PI) * 2.2)]).slice(1, 12)], { wash: PAL.cream, ink: PAL.ink, sw: sw * .4 });
      for (const k of [.3, .43, .57, .7]) inkLine([[X(k), top(k) + .03 * u], [X(k), top(k) + .16 * u]], sw * .35, PAL.ink, 'inkfine', 0);
      for (const s of [-1, 1]) inkLine([[mx + s * w * .97, my - .32 * u], [mx + s * (w + .12 * u), my - .44 * u]], sw * .6, PAL.ink, 'ink', 0);
    } else if (mk === 'tongue') {                      // blech: tongue stuck out and down
      hole([[mx - .3 * u, my - .1 * u], ...band(8, k => [mx - Math.cos(k * Math.PI) * .3 * u, my - .1 * u + Math.sin(k * Math.PI) * .32 * u]).slice(1, 8), [mx + .3 * u, my - .1 * u]]);
      const L = (.25 + .65 * tg) * u, tx = mx + .06 * u;
      paint([[tx - .2 * u, my], [tx - .21 * u, my + L * .5], ...band(8, k => [tx - Math.cos(k * Math.PI) * .2 * u, my + L + Math.sin(k * Math.PI) * .18 * u]), [tx + .21 * u, my + L * .5], [tx + .2 * u, my]], { wash: PIPC.rose, ink: PAL.ink, sw: sw * .6 });
      inkLine([[tx, my + .06 * u], [tx, my + L * .8]], sw * .4, PIPC.mouth, 'inkfine', 0);
    } else if (mk === 'ko') {                          // slack and lopsided, the tongue lolling out of the corner
      hole(ellPts(mx - .04 * u, my, .34 * u, .2 * u, 14, 0, .2));
      if (tg > .05) {
        const P = [[mx + .1 * u, my + .05 * u], [mx + .25 * u, my + (.12 + .2 * tg) * u], [mx + .27 * u, my + (.18 + .38 * tg) * u]];
        paint([...ribbon(P, .3 * u, .3 * u), ...ellPts(P[2][0], P[2][1], .15 * u, .14 * u, 12).filter(([, Y]) => Y > P[2][1])], { wash: PIPC.rose, ink: PAL.ink, sw: sw * .55 });
        inkLine([[P[0][0] + .01 * u, P[0][1] + .08 * u], [P[2][0] - .01 * u, P[2][1]]], sw * .4, PIPC.mouth, 'inkfine', .3);
      }
    } else if (mk === 'flat') {                        // deadpan
      inkLine([[mx - .3 * u, my + .02 * u], [mx + .3 * u, my]], sw * .9, PAL.ink, 'ink', 0);
    } else if (mk === 'pursed') {                      // lips pressed into a pucker (cheeks full, a gulp)
      paint(ellPts(mx, my, .13 * u, .1 * u, 10), { wash: PIPC.mouth, ink: PAL.ink, sw: sw * .6 });
      for (const s of [-1, 1]) inkLine([[mx + s * .2 * u, my - .07 * u], [mx + s * .27 * u, my + .02 * u]], sw * .5, PAL.ink, 'inkfine', 0);
    }
    else if (mk === 'happy' || mk === 'star') grin((mk === 'star' ? .5 : .42) * u, (mk === 'star' ? .62 : .5) * u);
    else if (mk === 'laugh') grin(.55 * u, (.78 + .08 * wob(T, 7)) * u);
    else if (mk === 'love' || mk === 'wink') grin(.34 * u, .36 * u);
    else if (mk === 'strain') {
      paint(rrPts(mx - .45 * u, my - .2 * u, .9 * u, .38 * u, .12 * u), { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 });
      inkLine([[mx - .45 * u, my - .01 * u], [mx + .45 * u, my - .01 * u]], sw * .4, PAL.ink, 'inkfine', 0);
    } else if (mk === 'wow' || mk === 'idea' || mk === 'sleepy') {
      const r = (mk === 'wow' ? .3 : mk === 'idea' ? .16 : .12 + .03 * wob(T, .5)) * u;
      paint(ellPts(mx, my, r * .85, r, 12), { wash: PIPC.mouth, ink: PAL.ink, sw: sw * .6 });
    } else if (mk === 'angry') {                     // an open frown, teeth showing
      const w = .4 * u, d = .3 * u, mp = [[mx - w, my + .12 * u]];
      for (let i = 1; i < 8; i++) { const a = i / 8 * Math.PI; mp.push([mx - Math.cos(a) * w, my + .12 * u - Math.sin(a) * d]); }
      mp.push([mx + w, my + .12 * u]);
      paint(mp, { wash: PIPC.mouth, ink: PAL.ink, sw: sw * .7 });
      inkLine([[mx - w * .7, my - d * .45], [mx + w * .7, my - d * .45]], sw * .5, PAL.cream, 'ink', 0);
    } else if (mk === 'sad') {
      inkLine([[mx - .3 * u, my + .1 * u], [mx, my - .08 * u], [mx + .3 * u, my + .1 * u]], sw * .8, PAL.ink, 'ink', .7);
    } else if (mk === 'smug') {
      inkLine([[mx - .32 * u, my - .02 * u], [mx + .05 * u, my + .08 * u], [mx + .36 * u, my - .2 * u]], sw * .85, PAL.ink, 'ink', .7);
    } else if (mk === 'worried' || mk === 'dizzy' || mk === 'shy') {   // a wobbly line
      const w = (mk === 'shy' ? .22 : .34) * u, wp = [];
      for (let i = 0; i <= 6; i++) wp.push([mx - w + i / 6 * 2 * w, my + (i % 2 ? -1 : 1) * .06 * u]);
      inkLine(wp, sw * .75, PAL.ink, 'ink', .5);
    } else {
      inkLine([[mx - .3 * u, my - .05 * u], [mx, my + .12 * u], [mx + .3 * u, my - .05 * u]], sw * .8, PAL.ink, 'ink', .7);
    }
  });
  const bl = o.blush ?? (face === 'shy' || face === 'love' ? 1 : .5);
  if (bl > 0) for (const s of [-1, 1]) { const bx = fx + s * (1.18 + (o.cheeks > 0 ? .35 * clamp(o.cheeks, 0, 1.5) : 0)) * u; decal(bx, -2.72 * u, () => paint(ellPts(bx, -2.72 * u, .3 * u, .17 * u, 10), { fill: PIPC.rose, fillOp: 90 + 110 * bl, bleed: .1, tex: .2, ink: null })); }
  if (o.tear) for (const s of [-1, 1]) {             // tears well at the outer corners and run down the cheeks
    const k = frac(T * .8 + (s > 0 ? 0 : .5)), tx = fx + s * 1.0 * u, ty = -3.0 * u + k * 1.6 * u, r = .17 * u * clamp(o.tear) * (1 - .4 * k);
    if (r > .5) decal(tx, -3.0 * u, () => paint(ellPts(tx, ty, r, r * 1.35, 12).map(([X, Y]) => [X, Y < ty ? ty - (ty - Y) * 1.6 : Y]), { wash: PAL.sky, ink: PAL.ink, sw: sw * .45 }));
  }

  if (o.over) o.over(u, sw, fx);                     // body-local extras over the face (goggles, a mask), before front arms
  if (!o.armsFront && YAW !== null) { if (near(-1)) arm(-1, o.armB, false, true); if (near(1)) arm(1, o.armF, false, true); }
  if (o.armsFront) { arm(-1, o.armB, true); arm(1, o.armF, true); }
  pop();
  if (o.emote) {
    const hs = (1 - sq) * 5 * u, r = o.rot || 0;     // the head top, squashed and leaning, for the emotes that sit on it
    pipEmote(o.emote, x + dir * 2.9 * u, y + (o.dy || 0) * u - 5.0 * u, u * (o.emoteK ?? 1), dir, o.key || '', [x + Math.sin(r) * hs, y + (o.dy || 0) * u - Math.cos(r) * hs]);
  }
  boilSeed('afterPip' + (o.key || ''));
}

// Painted marks above Pip's head (no letters). (x, y): the spot up and ahead of the head; u: Pip's unit times the pop-in.
// head: the head top in world space (stars, gloom, steam and panic sit on it); left out, it's worked out from (x, y).
function pipEmote(kind, x, y, u, dir = 1, key = '', head = null) {
  if (u < .5) return;
  boilSeed('pipEmote' + key);
  const sw = clamp(u / 30, .4, 1.3), t = T, [hx, hy] = head || [x - dir * 2.9 * u, y];
  const dropPts = (px, py, r, ang) => ellPts(0, 0, r * 1.2, r, 12).map(([X, Y]) => { X = X < 0 ? X * 1.9 : X; return [px + X * Math.cos(ang) - Y * Math.sin(ang), py + X * Math.sin(ang) + Y * Math.cos(ang)]; });
  if (kind === 'sweat') {                            // a drop on the far side of the head, sliding
    const k = frac(t * .7), sx = x - dir * 4.1 * u, sy = y + 1.2 * u + k * .9 * u, r = .32 * u * (1 - .3 * k);
    paint(ellPts(sx, sy, r, r * 1.3, 14).map(([X, Y]) => [X, Y < sy ? sy - (sy - Y) * 1.7 : Y]), { wash: PAL.sky, ink: PAL.ink, sw: sw * .6 });
  } else if (kind === 'anger') {                     // the four-curl vein mark, throbbing
    const r = .95 * u * (1 + .15 * Math.abs(wob(t, 3))), q = .32 * u;
    for (let i = 0; i < 4; i++) {
      const a = i * TAU / 4 + Math.PI / 4, cx = x + Math.cos(a) * r * .8, cy = y + Math.sin(a) * r * .8, p = a;
      inkLine([[cx + Math.cos(p - .9) * q, cy + Math.sin(p - .9) * q], [cx + Math.cos(p) * q * .3, cy + Math.sin(p) * q * .3], [cx + Math.cos(p + .9) * q, cy + Math.sin(p + .9) * q]], sw * 1.5, '#D2463C', 'ink', .7);
    }
  } else if (kind === 'heart') {                     // little hearts floating up
    for (let i = 0; i < 2; i++) {
      const k = frac(t * .45 + i * .5), hx = x + dir * (i * .9 - .2) * u + .3 * u * wob(t, .9, i * .3), hy = y + .6 * u - k * 2.4 * u;
      const r = .55 * u * (i ? .7 : 1) * Math.sin(Math.min(1, k * 1.4) * Math.PI * .5 + (k > .7 ? 0 : 0)) * (1 - seg(k, .75, 1));
      if (r > .6) paint(pipHeart(hx, hy, r), { wash: PIPC.rose, ink: PAL.ink, sw: sw * .6 });
    }
  } else if (kind === 'zzz') {                       // three Zs drifting up and out
    for (let i = 0; i < 3; i++) {
      const k = frac(t * .35 + i / 3), zs = (.25 + .3 * k) * u, zx = x + dir * (k * 1.6 * u - .4 * u), zy = y + .8 * u - k * 2.6 * u;
      if (k < .92) inkLine([[zx - zs, zy - zs], [zx + zs, zy - zs], [zx - zs, zy + zs], [zx + zs, zy + zs]], sw * (1 - k * .4), PAL.indigo, 'ink', 0);
    }
  } else if (kind === 'sparkle') {                   // twinkling four-point stars
    for (let i = 0; i < 3; i++) {
      const k = .5 + .5 * Math.sin(t * 5 + i * 2.1), sx = x + dir * [0, 1.1, -.6][i] * u, sy = y + [0, .9, -1.0][i] * u;
      paint(starPts(sx, sy, (.3 + .35 * k) * u * [1, .7, .6][i], .32, 4), { wash: PIPC.gold, ink: PAL.ink, sw: sw * .5 });
    }
  } else if (kind === 'question') {                  // a hook and a dot, bobbing
    const b = .15 * u * wob(t, 1.3), r = .5 * u;
    inkLine([[x - r, y - .9 * u + b], [x - .2 * u, y - 1.45 * u + b], [x + r, y - 1.0 * u + b], [x + .1 * u, y - .3 * u + b], [x, y + .2 * u + b]], sw * 1.6, PIPC.pipDk, 'ink', .6);
    paint(ellPts(x, y + .75 * u + b, .16 * u, .16 * u, 10), { wash: PIPC.pipDk, ink: null });
  } else if (kind === 'exclaim') {                   // a bar and a dot, plus pop lines
    const s = 1 + .12 * Math.abs(wob(t, 3));
    paint([[x - .22 * u * s, y - 1.5 * u], [x + .22 * u * s, y - 1.5 * u], [x + .1 * u, y + .25 * u], [x - .1 * u, y + .25 * u]], { wash: '#D2463C', ink: PAL.ink, sw: sw * .6 });
    paint(ellPts(x, y + .75 * u, .2 * u, .2 * u, 10), { wash: '#D2463C', ink: PAL.ink, sw: sw * .5 });
    for (const a of [-2.4, -1.57, -.74]) inkLine([[x + Math.cos(a) * 1.3 * u * s, y - .5 * u + Math.sin(a) * 1.3 * u * s], [x + Math.cos(a) * 1.75 * u * s, y - .5 * u + Math.sin(a) * 1.75 * u * s]], sw * .9, PAL.ink, 'ink', 0);
  } else if (kind === 'note') {                      // a quaver, bopping
    const b = .2 * u * Math.abs(wob(t, 1.5)), nx = x, ny = y + .4 * u - b;
    paint(ellPts(nx, ny, .32 * u, .24 * u, 12, 0, -.4), { wash: PAL.ink, ink: null });
    inkLine([[nx + .28 * u, ny], [nx + .3 * u, ny - 1.5 * u]], sw * 1.1, PAL.ink, 'ink', 0);
    inkLine([[nx + .3 * u, ny - 1.5 * u], [nx + .8 * u, ny - 1.0 * u], [nx + .7 * u, ny - .6 * u]], sw * 1.1, PAL.ink, 'ink', .6);
  } else if (kind === 'stars') {                     // dizzy stars circling the head; the near ones are bigger
    for (let i = 0; i < 3; i++) {
      const a = t * 5.5 + i * TAU / 3, d = .78 + .22 * Math.sin(a);
      paint(starPts(hx + Math.cos(a) * 1.75 * u, hy - .4 * u + Math.sin(a) * .5 * u, .42 * u * d, .45, 5, a), { wash: PIPC.gold, ink: PAL.ink, sw: sw * .55 });
    }
  } else if (kind === 'dots') {                      // an awkward silence: three dots, one at a time
    const k = frac(t * .6);
    for (let i = 0; i < 3; i++) if (k > .12 + i * .22) paint(ellPts(x + (i - 1) * .62 * u, y + .4 * u, .15 * u, .15 * u, 10), { wash: PAL.ink, ink: null });
  } else if (kind === 'scribble') {                  // a furious tangle that re-knots on every boil
    const P = []; for (let i = 0; i <= 34; i++) { const a = i / 34 * 3.2 * TAU, r = (.55 + .35 * Math.sin(i * 1.9)) * u + jit(.18 * u); P.push([x + Math.cos(a) * r * 1.25, y - .2 * u + Math.sin(a) * r * .8]); }
    inkLine(P, sw * 1.1, PAL.ink, 'ink', .7);
  } else if (kind === 'gloom') {                     // a little rain cloud of its own
    const cy = hy - 1.7 * u + .1 * u * wob(t, .5), P = [];
    for (let i = 0; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI, b = 1 + .25 * Math.abs(Math.sin(a * 4)); P.push([hx + Math.cos(a) * 1.5 * u * b, cy + Math.sin(a) * .6 * u * b]); }
    P.push([hx + 1.35 * u, cy + .3 * u], [hx - 1.35 * u, cy + .3 * u]);
    for (let i = 0; i < 4; i++) { const k = frac(t * 1.8 + hash(i + 40)), rx = hx + (i - 1.5) * .6 * u; inkLine([[rx, cy + .45 * u + k * 1.2 * u], [rx - .06 * u, cy + .8 * u + k * 1.2 * u]], sw * .9, PAL.sky, 'ink', 0); }
    paint(P, { wash: '#77728A', ink: PAL.ink, sw: sw * .6 });
  } else if (kind === 'steam') {                     // boiling over: puffs jetting from the top of the head
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const k = frac(t * 1.7 + i / 3 + (s > 0 ? .17 : 0)), r = (.22 + .5 * k) * u * (k > .75 ? 1 - (k - .75) * 3 : 1);
      if (r > .5) paint(ellPts(hx + s * (.55 + 1.5 * k) * u, hy - (.1 + 1.7 * k - .6 * k * k) * u, r, r * .85, 12, .03 * u), { wash: '#F4F1EC', ink: PAL.ink, sw: sw * .55 });
    }
  } else if (kind === 'panic') {                     // sweat flying off in every direction
    for (let i = 0; i < 5; i++) {
      const k = frac(t * 1.5 + i * .37), a = -Math.PI / 2 + (i - 2) * .62, d = (1.2 + 2.0 * k) * u, r = .24 * u * (1 - .45 * k);
      if (k < .85) paint(dropPts(hx + Math.cos(a) * d, hy + 1.2 * u + Math.sin(a) * d + 1.6 * k * k * u, r, Math.atan2(Math.sin(a) * 2 + 3.2 * k, Math.cos(a) * 2)), { wash: PAL.sky, ink: PAL.ink, sw: sw * .5 });
    }
  } else if (kind === 'bulb') {                      // the idea: a light bulb, lit
    glow(x, y - .3 * u, 2.8 * u, '#FFD66B', .55);
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; inkLine([[x + Math.cos(a) * 1.05 * u, y - .3 * u + Math.sin(a) * 1.05 * u], [x + Math.cos(a) * 1.45 * u, y - .3 * u + Math.sin(a) * 1.45 * u]], sw * .9, PIPC.gold, 'ink', 0); }
    paint([...ellPts(x, y - .35 * u, .62 * u, .64 * u, 20).filter(([, Y]) => Y < y), [x + .3 * u, y + .3 * u], [x - .3 * u, y + .3 * u]], { wash: '#FFF2BF', ink: PAL.ink, sw: sw * .7, curv: .3 });
    inkLine([[x - .2 * u, y], [x - .1 * u, y - .35 * u], [x, y - .15 * u], [x + .1 * u, y - .35 * u], [x + .2 * u, y]], sw * .6, PAL.ochre, 'inkfine', .3);
    paint(rectPts(x - .3 * u, y + .3 * u, .6 * u, .4 * u), { wash: '#9A93A6', ink: PAL.ink, sw: sw * .6 });
    inkLine([[x - .3 * u, y + .45 * u], [x + .3 * u, y + .5 * u]], sw * .4, PAL.ink, 'inkfine', 0);
  }
}

// A whole mood, alive: face, natural blinks, body motion, arms, leaf and emote, for loop time t (seconds).
// Spread it into pip(): pip(x, y, u, { ...pipFeel('laugh', t), flip: true, key: 'p1' }). seed staggers several Pips.
const PIP_FEELS = ['calm', 'happy', 'laugh', 'excited', 'wave', 'love', 'wink', 'smug', 'shy', 'idea', 'wow', 'confused',
  'worried', 'sad', 'cry', 'angry', 'strain', 'sleepy', 'dizzy', 'sing'];
// The slapstick moods: the same, pushed to Tom-and-Jerry size (see the sheet at pages/pip.html?loop=pipToon).
const PIP_TOON_FEELS = ['shock', 'scream', 'ouch', 'ko', 'deadpan', 'blank', 'gulp', 'eek', 'scheme', 'blech', 'puff', 'bliss',
  'panic', 'furious', 'guffaw', 'munch', 'mortified'];
function pipFeel(name, t, { seed = 0 } = {}) {
  const ph = frac((t + seed * 1.37) / 3.1);
  const blink = ph < .045 ? Math.sin(ph / .045 * Math.PI) : 0;
  const slow = ph < .12 ? Math.sin(ph / .12 * Math.PI) : 0;                                      // a long, flat blink
  const dbl = ph < .035 || (ph > .07 && ph < .105) ? Math.sin(frac(ph / .035) * Math.PI) : 0;    // blink-blink
  const hop = (f, h, ph0 = 0) => {                   // a hop of height h, f per second: dy (up is negative) and squash
    const p = frac(t * f + ph0), a = 4 * p * (1 - p);
    return { dy: -h * a, sq: p < .1 || p > .9 ? .09 : -.05 * a };
  };
  const breathe = { sq: .025 * wob(t, .4, seed) };
  const osc = (f, a = 1, p = 0) => a * wob(t, f, p + seed * .31);
  switch (name) {
    case 'happy': return { face: 'happy', ...hop(1.4, .35), leaf: .25 * osc(1.4), armF: [-.4 + .3 * osc(1.4), 1.6], armB: [-.4 + .3 * osc(1.4, 1, .5), 1.6] };
    case 'laugh': return { face: 'laugh', sq: .05 * Math.abs(osc(4)), rot: .06 * osc(.8), dy: -.12 * Math.abs(osc(4)), armsFront: true, armF: { at: [1.0, -1.25] }, armB: { at: [-1.0, -1.3] }, leaf: .3 * osc(4) };
    case 'excited': return { face: 'star', ...hop(2, .9), armF: [1.1 + .3 * osc(4), 1.7], armB: [1.1 + .3 * osc(4, 1, .5), 1.7], leaf: -.5 * Math.sin(frac(t * 2) * Math.PI), emote: 'sparkle' };
    case 'wave': return { face: 'happy', blink, ...breathe, rot: .04 * osc(1.1), armF: [1.25 + .35 * osc(2.2), 1.75], leaf: .15 * osc(1.1) };
    case 'love': return { face: 'love', rot: .07 * osc(.6), sq: .03 * osc(1.2), armsFront: true, armF: { at: [.5, -2.0] }, armB: { at: [-.2, -2.05] }, leaf: .2 * osc(.6), emote: 'heart' };
    case 'wink': return { face: 'wink', ...breathe, rot: -.05, armF: [.6, 2.0], leaf: .1 * osc(.8) };
    case 'smug': return { face: 'smug', blink, ...breathe, rot: -.04, armF: { at: [2.05, -1.55] }, armB: { at: [-2.05, -1.55] }, lookX: .5 };
    case 'shy': return { face: 'shy', blink, rot: .05 * osc(.35), sq: .02 * osc(.7), armsFront: true, armF: { at: [.4, -1.05] }, armB: { at: [-.25, -1.0] }, lookX: -.7, lookY: .7, turn: .1 + .2 * osc(.35), leaf: .35 };
    case 'idea': return { face: 'idea', blink, ...hop(.6, .15), armF: [1.5, 1.9], armB: { at: [-1.95, -1.6] }, lookX: .4, lookY: -.8, emote: 'sparkle' };
    case 'wow': return { face: 'wow', blink: blink * .5, sq: -.06 + .02 * osc(3), dy: -.15, armF: [1.0, 1.7], armB: [1.0, 1.7], leaf: -.4, emote: 'exclaim' };
    case 'confused': return { face: 'calm', blink, rot: .1 + .03 * osc(.5), armsFront: true, armF: { at: [.55, -2.05] }, armB: { at: [-.7, -1.35] }, lookX: -.4, lookY: -.6, leaf: -.5, emote: 'question' };
    case 'worried': return { face: 'worried', blink, sq: .02 * osc(3), dy: .04 * osc(5), armsFront: true, armF: { at: [.55, -1.55] }, armB: { at: [-.45, -1.6] }, lookX: .5 * Math.sign(osc(.7)), emote: 'sweat' };
    case 'sad': return { face: 'sad', blink: blink * .6, sq: .05, armF: [-1.45, 1.5], armB: [-1.45, 1.5], lookY: .6, leaf: -1.2 + .08 * osc(.3), turn: .25 };
    case 'cry': return { face: 'sad', tear: 1, sq: .05 + .03 * Math.abs(osc(2.5)), dy: -.05 * Math.abs(osc(2.5)), armF: [-1.4, 1.5], armB: [-1.4, 1.5], leaf: -1.3, turn: .2 };
    case 'angry': return { face: 'angry', sq: .04, rot: .05 + .03 * osc(9), armF: [-1.15 + .1 * osc(9), 1.45], armB: [-1.15 + .1 * osc(9, 1, .3), 1.45], leaf: -.3 + .25 * osc(9), emote: 'anger' };
    case 'strain': return { face: 'strain', sq: .06 + .02 * osc(11), rot: .02 * osc(11), armF: [.15, 2.1], armB: [.25, 2.0], leaf: -.4 + .1 * osc(11) };
    case 'sleepy': return { face: 'sleepy', blink: .3 + .3 * Math.max(0, osc(.25)), rot: .07 * osc(.25), sq: .03 * osc(.25), armF: [-1.4, 1.5], armB: [-1.4, 1.5], leaf: -.9 + .2 * osc(.25), emote: 'zzz' };
    case 'dizzy': return { face: 'dizzy', rot: .12 * osc(.7), dy: -.08 * osc(1.4), armF: [.2 + .5 * osc(.7), 1.6], armB: [.2 - .5 * osc(.7), 1.6], leaf: .7 * osc(.7), walk: .1 * osc(.7) };
    case 'sing': return { face: 'wow', blink, ...hop(1, .12), rot: .08 * osc(.5), armF: [.5 + .2 * osc(1), 1.8], armB: [.3, 1.6], lookY: -.4, emote: 'note' };
    // slapstick (PIP_TOON_FEELS)
    case 'shock': return { face: 'shock', sq: -.12 + .03 * osc(9), dy: -.12, eyeS: 1.35 + .05 * osc(4), armF: [1.25 + .07 * osc(11), 2.1], armB: [1.15 + .07 * osc(10, 1, .3), 2.0], leaf: .12 * osc(13), emote: 'exclaim' };
    case 'scream': return { face: 'scream', jaw: 1 + .12 * osc(5), sq: -.08 + .03 * osc(14), rot: .03 * osc(14), armsFront: true, armF: { at: [1.3, -2.8] }, armB: { at: [-1.3, -2.85] }, leaf: .15 * osc(15), emote: 'panic' };
    case 'ouch': return { face: 'ouch', ...hop(2.4, .3), tear: .5, jaw: .6 + .15 * osc(4.8), armF: [.2 + .45 * osc(9), 2.0], armB: [.6 + .5 * osc(2.4), 1.8], leaf: .3 * osc(4.8) };
    case 'ko': return { face: 'ko', rot: .1 * osc(.45), sq: .08, armF: [-1.35, 1.6], armB: [-1.4, 1.55], leaf: -1.25 + .1 * osc(.45), turn: .2, emote: 'stars' };
    case 'deadpan': return { face: 'deadpan', blink: slow, sq: .01 * osc(.3), armF: [-1.45, 1.5], armB: [-1.45, 1.5], leaf: .05 * osc(.3), turn: 0, emote: 'dots' };
    case 'blank': return { face: 'blank', blink: dbl, ...breathe, armF: [-1.3, 1.5], armB: [-1.35, 1.5], turn: 0, leaf: .05 * osc(.3) };
    case 'gulp': { const g = Math.exp(-Math.pow((frac(t / 2.2 + seed * .3) - .5) / .06, 2));
      return { face: 'gulp', blink, sq: -.03 - .06 * g, dy: -.1 * g, armsFront: true, armF: { at: [.45, -1.75] }, armB: { at: [-.4, -1.8] }, lookX: .4 * Math.sign(osc(.45)), emote: 'sweat' }; }
    case 'eek': return { face: 'eek', blink: blink * .5, sq: -.06 + .02 * osc(12), rot: .025 * osc(12), armsFront: true, armF: { at: [.75, -2.0] }, armB: { at: [-.65, -2.1] }, lookX: -.6, blush: .9, emote: 'sweat', leaf: -.4 + .08 * osc(12) };
    case 'scheme': return { face: 'scheme', sq: .03 * Math.abs(osc(3)), dy: -.05 * Math.abs(osc(3)), rot: .06, armsFront: true, armF: { at: [.55 + .14 * osc(2), -1.9 + .08 * osc(2, 1, .25)] }, armB: { at: [-.2 - .14 * osc(2), -1.95 - .08 * osc(2, 1, .25)] }, lookX: .6, leaf: .2 * osc(.5) };
    case 'blech': return { face: 'blech', tongue: .9 + .1 * osc(3), rot: -.1 + .03 * osc(7), sq: .03 * osc(7), armF: [.2, 2.4], armB: [-1.2, 1.6], leaf: -.5 + .1 * osc(7) };
    case 'puff': return { face: 'puff', blink, cheeks: .9 + .12 * osc(1.5), sq: .05 + .02 * osc(1.5), armF: [-.95, 1.6], armB: [-.95, 1.6], leaf: .3 + .1 * osc(1.5) };
    case 'bliss': return { face: 'bliss', rot: .07 * osc(.35), sq: .02 * osc(.7), armsFront: true, armF: { at: [.35, -1.55] }, armB: { at: [-.25, -1.55] }, leaf: .25 * osc(.35), emote: 'sparkle' };
    case 'panic': return { face: 'scream', jaw: .8, walk: t * 9, stepH: 1.5, dy: -.15 * Math.abs(osc(4.5)), armF: [1.3 + .55 * osc(4.5), 2.1], armB: [1.3 - .55 * osc(4.5), 2.1], rot: .08 * osc(2.25), leaf: .4 * osc(9), emote: 'panic' };
    case 'furious': return { face: 'angry', blush: 1, sq: .06 + .04 * Math.abs(osc(6)), rot: .03 * osc(13), armF: [1.05 + .15 * osc(6), 2.1], armB: [-1.2, 1.5], leaf: .15 * osc(13), emote: 'steam' };
    case 'guffaw': return { face: 'laugh', tear: .7, rot: .2 * osc(1.1), sq: .06 * Math.abs(osc(5)), dy: -.15 * Math.abs(osc(5)), armsFront: true, armF: { at: [.95, -1.2] }, armB: { at: [-.95, -1.25] }, leaf: .5 * osc(5) };
    case 'munch': { const c = osc(3.2); return { face: 'calm', blink, mouth: c > 0 ? 'pursed' : 'jaw', jaw: .2, cheeks: .5 + .4 * Math.abs(c), sq: .03 * Math.abs(c), lookY: .2, armF: [-.9, 1.6], armB: [-.9, 1.6], leaf: .1 * osc(3.2) }; }
    case 'mortified': return { face: 'worried', blink, blush: 1, sq: .08, dy: .03 * osc(.5), armsFront: true, armF: { at: [.35, -1.45] }, armB: { at: [-.3, -1.45] }, lookY: .8, lookX: -.3, leaf: -1.1, turn: .15, emote: 'gloom' };
    default: return { face: 'calm', blink, ...breathe, leaf: .1 * osc(.5) };
  }
}

// pip.js: Pip, the plum sprout, as a shared global so any scene can cast it.
// pip(x, y, u, o): (x, y) = ground point between the feet; body 3.6u wide, 5u tall, plus the leaf. Options:
//   flip, turn, sq, dy, rot, face (calm|happy|idea|strain|wow|star), blink, lookX/lookY, armF/armB ([ang, len] or {to}),
//   armsFront, walk, kick, leaf, blush, noShadow, key; weight scales the ink (bolder for tiny uses, like icons). Arms also take {at: [x, y]} in u units (local, unflipped).
// More faces: laugh, love, wink, smug, shy, sad, worried, angry, sleepy, dizzy. Extras: tear (0..1), emote (sweat, anger,
//   heart, zzz, sparkle, question, exclaim, note) with emoteK (0..1, its pop-in). pipFeel(name, t) acts a whole mood.
const PIPC = { pip: '#8E5B8F', pipDk: '#6A3F6D', belly: '#EBCBD8', leaf: '#8DBF5E', leafDk: '#5E8C3E', mouth: '#5E2440', rose: '#E27A92', gold: '#F4C54A' };
const pipHeart = (cx, cy, r, n = 24) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, sa = Math.sin(a);
  p.push([cx + r * sa * sa * sa, cy - r * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16 - r * .1]); } return p; };
function pip(x, y, u, o = {}) {
  const sq = o.sq || 0, sw = clamp(u / 30, .5, 1.3) * (o.weight || 1), dir = o.flip ? -1 : 1, turn = o.turn ?? .4;
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

  // arms first, so the body covers their roots
  const arm = (side, spec, front) => {
    const S = front ? [side * 1.62 * u, -2.35 * u] : [side * 1.35 * u, -2.5 * u];   // in front, the root sits on the body's edge
    let T;
    if (spec && spec.to) T = spec.to;
    else if (spec && !Array.isArray(spec)) T = [spec.at[0] * u, spec.at[1] * u];
    else { const [a, l] = spec || [-1.0, 1.6]; T = [S[0] + side * Math.cos(a) * l * u, S[1] - Math.sin(a) * l * u]; }
    { const dd = Math.hypot(T[0] - S[0], T[1] - S[1]), mx = 3.6 * u; if (dd > mx) T = [S[0] + (T[0] - S[0]) * mx / dd, S[1] + (T[1] - S[1]) * mx / dd]; }
    const vx = T[0] - S[0], vy = T[1] - S[1], d = Math.hypot(vx, vy) || 1, px = -vy / d, py = vx / d, bend = (front ? -.12 : .22) * side * u * Math.min(1, d / (1.5 * u));
    const mid = [S[0] + vx * .5 + px * bend, S[1] + vy * .5 + py * bend];
    paint(ribbon(front ? [S, mid, T] : [[S[0] - side * .6 * u, S[1] + .1 * u], S, mid, T], (front ? .5 : .62) * u, .42 * u), { wash: side > 0 ? PIPC.pip : PIPC.pipDk, ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(T[0], T[1], .3 * u, .3 * u, 12, j * .5), { wash: side > 0 ? PIPC.pip : PIPC.pipDk, ink: PAL.ink, sw: sw * .7 });
  };
  if (!o.armsFront) { arm(-1, o.armB); arm(1, o.armF); }

  // feet
  for (const s of [-1, 1]) {
    const ph = (o.walk || 0) * Math.PI + (s > 0 ? 0 : Math.PI), up = o.walk ? Math.max(0, Math.sin(ph)) * .45 * u : 0;
    const kick = o.kick ? Math.sin(o.kick * TAU + (s > 0 ? 0 : 2)) * .5 * u : 0;
    paint(ellPts(s * .78 * u + .15 * u + (o.walk ? Math.cos(ph) * .25 * u : 0), -.2 * u - up + kick * .6, .56 * u, .3 * u, 14, j * .5), { wash: PIPC.pipDk, ink: PAL.ink, sw: sw * .8 });
  }

  // leaf on a stalk: drags behind moves (o.leaf), sways at rest
  const la = (o.leaf || 0) + .12 * wob(T, .45, .3), top = [fx * .3, -4.85 * u], tip = [top[0] + Math.sin(la) * 1.6 * u, top[1] - Math.cos(la) * 1.5 * u];
  inkLine([top, [lerp(top[0], tip[0], .4) - .15 * u, lerp(top[1], tip[1], .5)], tip], sw * 1.2, PIPC.leafDk, 'ink', .6);
  const ang = la - 1.05, L = 1.5 * u, Wd = .55 * u, lp = [];
  for (let i = 0; i <= 8; i++) { const k = i / 8, w = Math.sin(k * Math.PI) * Wd * (1 - .25 * k); lp.push([k * L, -w]); }
  for (let i = 7; i >= 1; i--) { const k = i / 8, w = Math.sin(k * Math.PI) * Wd * (1 - .25 * k); lp.push([k * L, w]); }
  const rotP = P => P.map(([a, b]) => [tip[0] + a * Math.cos(ang) - b * Math.sin(ang), tip[1] + a * Math.sin(ang) + b * Math.cos(ang)]);
  paint(rotP(lp), { wash: PIPC.leaf, fill: PIPC.leafDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .75, curv: .4 });
  inkLine(rotP([[.1 * u, 0], [L * .55, -.03 * u], [L * .85, 0]]), sw * .45, PIPC.leafDk, 'inkfine', .5);

  // body: an egg, a little wider at the bottom
  const bp = [];
  for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, c = Math.cos(a), s = Math.sin(a); bp.push([s * 1.8 * u * (1 - .1 * c) + jit(j), -2.5 * u - c * 2.45 * u + jit(j)]); }
  paint(bp, { wash: PIPC.pip, fill: PIPC.pipDk, fillOp: 45, bleed: .04, tex: .6, border: .5, ink: PAL.ink, sw, curv: .3 });
  paint(ellPts(fx * .5, -1.75 * u, 1.12 * u, 1.3 * u, 22, j), { wash: PIPC.belly, ink: null });

  // face. Lids (k: how far down they close, tilt: >0 lowers the outer corner) and brows (inner/outer lift, in u) shape the mood.
  const blink = clamp(o.blink || 0), face = o.face || 'calm', lx = (o.lookX || 0) * .16 * u, ly = (o.lookY || 0) * .26 * u;
  const LID = { smug: [.45, 0], sleepy: [.58, 0], sad: [.28, .35], angry: [.38, -.5], worried: [.1, .25] }[face];
  const BROW = { sad: [.22, -.06], worried: [.26, -.02], angry: [-.24, .14], smug: [.02, .14] }[face];
  const closedEye = (ex, ey, s) => inkLine([[ex - .36 * u, ey + .06 * u], [ex, ey - .3 * u], [ex + .36 * u, ey + .06 * u]], sw * .95, PAL.ink, 'ink', .7);
  for (const s of [-1, 1]) {
    const ex = fx + s * .64 * u * (1 - .18 * turn * s), ey = -3.35 * u;
    if (blink > .7 || face === 'happy' || face === 'laugh' || (face === 'wink' && s > 0)) {
      closedEye(ex, ey, s);
    } else if (face === 'strain') {
      inkLine([[ex - s * .32 * u, ey - .26 * u], [ex + s * .26 * u, ey], [ex - s * .32 * u, ey + .26 * u]], sw * .95, PAL.ink, 'ink', .2);
    } else if (face === 'love') {
      paint(pipHeart(ex, ey, .48 * u * (1 + .08 * wob(T, 2.2))), { wash: PIPC.rose, ink: PAL.ink, sw: sw * .6 });
      paint(ellPts(ex - .16 * u, ey - .14 * u, .08 * u, .08 * u, 8), { wash: PAL.cream, ink: null });
    } else {
      const big = face === 'wow' || face === 'star' ? 1.25 : face === 'idea' || face === 'worried' ? 1.12 : 1;
      const rx = .42 * u * big, ry = .6 * u * big * (1 - blink);
      paint(ellPts(ex, ey, rx, ry, 16, j * .4), { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 });
      if (face === 'star') {
        paint(starPts(ex + lx, ey + ly, .34 * u, .45, 5), { wash: PIPC.gold, ink: PAL.ink, sw: sw * .5 });
      } else if (face === 'dizzy') {
        const sp = [], a0 = T * 9 * s; for (let i = 0; i <= 26; i++) { const k = i / 26, a = a0 + k * 2.6 * TAU; sp.push([ex + Math.cos(a) * rx * .85 * k, ey + Math.sin(a) * ry * .8 * k]); }
        inkLine(sp, sw * .6, PAL.ink, 'inkfine', .5);
      } else {
        const pr = (face === 'wow' ? .17 : face === 'idea' ? .15 : face === 'worried' ? .14 : .2) * u;
        const py = ey + ly * big + (LID ? LID[0] * .3 * ry : 0);
        paint(ellPts(ex + lx, py, pr, pr * 1.3 * (1 - blink * .6), 12), { wash: PAL.ink, ink: null });
        paint(ellPts(ex + lx + .08 * u, py - .1 * u, pr * .35, pr * .35, 8), { wash: PAL.cream, ink: null });
      }
      if (LID && ry > 1) {                           // the lid: the eye's top, cut by a straight edge
        const [k, tl] = LID, cut = X => ey - ry + 2 * ry * k + tl * s * ry * (X - ex) / rx;
        paint(ellPts(ex, ey, rx * 1.04, ry * 1.04, 20).map(([X, Y]) => [X, Math.min(Y, cut(X))]), { wash: PIPC.pip, ink: null });
        inkLine([[ex - rx * .95, cut(ex - rx * .95)], [ex + rx * .95, cut(ex + rx * .95)]], sw * .8, PAL.ink, 'ink', 0);
      }
    }
    if (BROW) {                                      // inner end (toward the middle) and outer end, lifted by BROW
      const by = ey - .95 * u * (face === 'worried' ? 1.1 : 1), bi = ex - s * .32 * u, bo = ex + s * .36 * u;
      inkLine([[bi, by - BROW[0] * u], [lerp(bi, bo, .5), by - lerp(BROW[0], BROW[1], .5) * u - .04 * u], [bo, by - BROW[1] * u]], sw * 1.05, PAL.ink, 'ink', .5);
    }
  }
  const mx = fx * 1.05, my = -2.55 * u;
  const grin = (w, d, tongue = true) => {            // an open smile: flat top, round bottom
    const mp = [[mx - w, my - .1 * u]];
    for (let i = 1; i < 8; i++) { const a = i / 8 * Math.PI; mp.push([mx - Math.cos(a) * w, my - .1 * u + Math.sin(a) * d]); }
    mp.push([mx + w, my - .1 * u]);
    paint(mp, { wash: PIPC.mouth, ink: PAL.ink, sw: sw * .7 });
    if (tongue) paint(ellPts(mx, my + d * .6, w * .45, d * .25, 10), { wash: PIPC.rose, ink: null });
  };
  if (face === 'happy' || face === 'star') grin((face === 'star' ? .5 : .42) * u, (face === 'star' ? .62 : .5) * u);
  else if (face === 'laugh') grin(.55 * u, (.78 + .08 * wob(T, 7)) * u);
  else if (face === 'love' || face === 'wink') grin(.34 * u, .36 * u);
  else if (face === 'strain') {
    paint(rrPts(mx - .45 * u, my - .2 * u, .9 * u, .38 * u, .12 * u), { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 });
    inkLine([[mx - .45 * u, my - .01 * u], [mx + .45 * u, my - .01 * u]], sw * .4, PAL.ink, 'inkfine', 0);
  } else if (face === 'wow' || face === 'idea' || face === 'sleepy') {
    const r = (face === 'wow' ? .3 : face === 'idea' ? .16 : .12 + .03 * wob(T, .5)) * u;
    paint(ellPts(mx, my, r * .85, r, 12), { wash: PIPC.mouth, ink: PAL.ink, sw: sw * .6 });
  } else if (face === 'angry') {                     // an open frown, teeth showing
    const w = .4 * u, d = .3 * u, mp = [[mx - w, my + .12 * u]];
    for (let i = 1; i < 8; i++) { const a = i / 8 * Math.PI; mp.push([mx - Math.cos(a) * w, my + .12 * u - Math.sin(a) * d]); }
    mp.push([mx + w, my + .12 * u]);
    paint(mp, { wash: PIPC.mouth, ink: PAL.ink, sw: sw * .7 });
    inkLine([[mx - w * .7, my - d * .45], [mx + w * .7, my - d * .45]], sw * .5, PAL.cream, 'ink', 0);
  } else if (face === 'sad') {
    inkLine([[mx - .3 * u, my + .1 * u], [mx, my - .08 * u], [mx + .3 * u, my + .1 * u]], sw * .8, PAL.ink, 'ink', .7);
  } else if (face === 'smug') {
    inkLine([[mx - .32 * u, my - .02 * u], [mx + .05 * u, my + .08 * u], [mx + .36 * u, my - .2 * u]], sw * .85, PAL.ink, 'ink', .7);
  } else if (face === 'worried' || face === 'dizzy' || face === 'shy') {   // a wobbly line
    const w = (face === 'shy' ? .22 : .34) * u, wp = [];
    for (let i = 0; i <= 6; i++) wp.push([mx - w + i / 6 * 2 * w, my + (i % 2 ? -1 : 1) * .06 * u]);
    inkLine(wp, sw * .75, PAL.ink, 'ink', .5);
  } else {
    inkLine([[mx - .3 * u, my - .05 * u], [mx, my + .12 * u], [mx + .3 * u, my - .05 * u]], sw * .8, PAL.ink, 'ink', .7);
  }
  const bl = o.blush ?? (face === 'shy' || face === 'love' ? 1 : .5);
  if (bl > 0) for (const s of [-1, 1]) paint(ellPts(fx + s * 1.18 * u, -2.72 * u, .3 * u, .17 * u, 10), { fill: PIPC.rose, fillOp: 90 + 110 * bl, bleed: .1, tex: .2, ink: null });
  if (o.tear) for (const s of [-1, 1]) {             // tears well at the outer corners and run down the cheeks
    const k = frac(T * .8 + (s > 0 ? 0 : .5)), tx = fx + s * 1.0 * u, ty = -3.0 * u + k * 1.6 * u, r = .17 * u * clamp(o.tear) * (1 - .4 * k);
    if (r > .5) paint(ellPts(tx, ty, r, r * 1.35, 12).map(([X, Y]) => [X, Y < ty ? ty - (ty - Y) * 1.6 : Y]), { wash: PAL.sky, ink: PAL.ink, sw: sw * .45 });
  }

  if (o.over) o.over(u, sw, fx);                     // body-local extras over the face (goggles, a mask), before front arms
  if (o.armsFront) { arm(-1, o.armB, true); arm(1, o.armF, true); }
  pop();
  if (o.emote) pipEmote(o.emote, x + dir * 2.9 * u, y + (o.dy || 0) * u - 5.0 * u, u * (o.emoteK ?? 1), dir, o.key || '');
  boilSeed('afterPip' + (o.key || ''));
}

// Painted marks above Pip's head (no letters). (x, y): the spot up and ahead of the head; u: Pip's unit times the pop-in.
function pipEmote(kind, x, y, u, dir = 1, key = '') {
  if (u < .5) return;
  boilSeed('pipEmote' + key);
  const sw = clamp(u / 30, .4, 1.3), t = T;
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
  }
}

// A whole mood, alive: face, natural blinks, body motion, arms, leaf and emote, for loop time t (seconds).
// Spread it into pip(): pip(x, y, u, { ...pipFeel('laugh', t), flip: true, key: 'p1' }). seed staggers several Pips.
const PIP_FEELS = ['calm', 'happy', 'laugh', 'excited', 'wave', 'love', 'wink', 'smug', 'shy', 'idea', 'wow', 'confused',
  'worried', 'sad', 'cry', 'angry', 'strain', 'sleepy', 'dizzy', 'sing'];
function pipFeel(name, t, { seed = 0 } = {}) {
  const ph = frac((t + seed * 1.37) / 3.1);
  const blink = ph < .045 ? Math.sin(ph / .045 * Math.PI) : 0;
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
    default: return { face: 'calm', blink, ...breathe, leaf: .1 * osc(.5) };
  }
}

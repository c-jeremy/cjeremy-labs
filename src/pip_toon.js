// pip_toon.js: Pip's slapstick kit, the global TOON. Tom-and-Jerry gags as pure functions of time, the effects that sell
// them (speed lines, dust, a ghost left behind, impact stars, smoke, spray…) and the colour tints (soot, wet, blond…).
// Load it after src/pip.js: "cast": ["src/pip.js", "src/pip_toon.js"]. See it all at pages/pip.html?loop=pipReel.
//
// A gag returns a pose delta for pip(): {} before it starts and after it ends, and in between it moves dx/dy/sq/rot,
// pops the eyes, drops the jaw and adds effects (fx). Lay gags over a mood with TOON.mix() and draw with TOON.pip():
//   let o = MK.act(t, [[0, 'calm'], [L(3), 'happy']]);
//   o = TOON.mix(o, TOON.wildTake(t, L(3, 1.2)), TOON.jelly(t, L(3, 3.0)));
//   TOON.pip(x, y, 32, { ...o, key: 'p' });              // also draws the fx, the tint, a bump, the trail
// mix() adds dx, dy, sq, rot (dx in u, like dy), joins fx and over, and lets later deltas win everything else.
// Gags that take a face use the slapstick faces in pip.js, and each one blinks on its last frame so the cut back to
// the mood underneath is hidden. TOON.dur(name, opts) is a gag's length, for chaining. Directions: dir is the world
// direction (1 = right); gags that travel set flip themselves, the rest keep the scene's.
// Extra options TOON.pip() reads: dx, fx, tint (a TOON.TINT name or {colour: hex}) + tintK, leafOff, bump (1, 2… stacked
// lumps), lump (0..1, a gulp going down), trail ([[dx, dy, rot], …] ghosts behind a fast move), gone (fx only). Unlike
// plain pip(), TOON.pip() turns the emote with the body (rot) and drops it with a squash, so it stays on Pip's head.
const TOON = (() => {
  const NONE = Object.freeze({});
  const CLEAR = { eyes: undefined, mouth: undefined, lid: undefined, brow: undefined, eyeS: undefined, pupil: undefined, browY: undefined,
    jaw: undefined, tongue: undefined, cheeks: undefined, blush: undefined, tear: undefined };
  const face = (name, o = {}) => ({ face: name, ...CLEAR, ...o });          // a gag's face, with the mood's parts cleared
  const env = (t, a, b, fi = .1, fo = .1) => Math.max(0, Math.min(ease(seg(t, a, a + fi)), 1 - ease(seg(t, b - fo, b))));
  const cut = (t, at, w = .06) => Math.max(0, 1 - Math.abs(t - at) / w);  // a blink peaking at `at`: cut on it
  const popK = k => k <= 0 ? 0 : backOut(clamp(k));
  const DUST = '#E9DFCF', SMOKE = '#5F5860';

  // ---------- colour tints (from selenium.js pipT: PIPC is swapped while Pip is drawn) ----------
  const TINT = {
    soot: { pip: '#4C4249', pipDk: '#2F282D', belly: '#6E6168', leaf: '#4A4440', leafDk: '#2E2A27', mouth: '#1F181D' },  // blown up
    wet: { pip: '#6E5E9A', pipDk: '#4A3F7A', belly: '#CBD0EA', leaf: '#6FB08A', leafDk: '#3F7F60' },                      // dunked
    blond: { leaf: '#F1E3A6', leafDk: '#C9B36A' },                                                                        // bleached
    red: { pip: '#C8464F', pipDk: '#912B37', belly: '#F4B9B4' },                                                          // boiling mad
    pale: { pip: '#CCC3D6', pipDk: '#A99EB6', belly: '#F4F0F5', leaf: '#C9D9B9', leafDk: '#9EB58B' },                     // scared white
    sick: { pip: '#8FA66B', pipDk: '#62773F', belly: '#DCE7BA' },                                                         // green about the gills
    frozen: { pip: '#A9C8E8', pipDk: '#7FA3CC', belly: '#EAF4FB', leaf: '#B9DCE8', leafDk: '#86B5C8' }
  };
  function tinted(tint, k, fn) {
    const cols = typeof tint === 'string' ? TINT[tint] : tint;
    if (!cols || k <= .01) return fn();
    const old = {}; for (const c in cols) { old[c] = PIPC[c]; PIPC[c] = mixCol(PIPC[c], cols[c], clamp(k)); }
    try { fn(); } finally { Object.assign(PIPC, old); }
  }

  // ---------- geometry (the same maths as pip.js), all aware of dx ----------
  const yawOf = o => o.yaw === undefined ? null : o.yaw + (o.turn ?? .4) * .21;    // as pip.js reads it
  function geo(x, y, u, o) {
    const X = x + (o.dx || 0) * u, dir = o.flip ? -1 : 1, sq = o.sq || 0, r = o.rot || 0, Y = y + (o.dy || 0) * u, yw = yawOf(o), fx = yw === null ? (o.turn ?? .4) * .38 : 0;
    const loc = (lx, ly) => { const ax = lx * u * dir * (1 + sq), ay = ly * u * (1 - sq); return [X + ax * Math.cos(r) - ay * Math.sin(r), Y + ax * Math.sin(r) + ay * Math.cos(r)]; };
    const face = yw === null ? [fx * 1.05, fx - .64, fx + .64] : [1.8 * Math.sin(yw), 1.63 * Math.sin(yw - .4), 1.63 * Math.sin(yw + .4)];
    return { x0: x, y, X, Y, u, dir, sq, rot: r, yaw: yw, loc, head: loc(0, -5), mid: loc(0, -2.5), mouth: loc(face[0], -2.55), eyes: [loc(face[1], -3.35), loc(face[2], -3.35)] };
  }
  // where Pip's hand is, in world space (copper.js handPt: pip.js's arm maths). which = 'F' (front) or 'B' (back).
  function hand(x, y, u, o, which = 'F') {
    const side = which === 'F' ? 1 : -1, spec = which === 'F' ? o.armF : o.armB, front = !!o.armsFront;
    const S = front ? [side * 1.62 * u, -2.35 * u] : [side * 1.35 * u, -2.5 * u];
    let T_;
    if (spec && spec.to) T_ = spec.to; else if (spec && !Array.isArray(spec)) T_ = [spec.at[0] * u, spec.at[1] * u];
    else { const [a, l] = spec || [-1.0, 1.6]; T_ = [S[0] + side * Math.cos(a) * l * u, S[1] - Math.sin(a) * l * u]; }
    const dd = Math.hypot(T_[0] - S[0], T_[1] - S[1]), mx = 3.6 * u; if (dd > mx) T_ = [S[0] + (T_[0] - S[0]) * mx / dd, S[1] + (T_[1] - S[1]) * mx / dd];
    const yw = yawOf(o); if (yw !== null) T_ = [T_[0] * Math.cos(yw), T_[1]];       // a turned Pip's arms swing round with it
    return geo(x, y, u, o).loc(T_[0] / u, T_[1] / u);
  }
  const head = (x, y, u, o) => geo(x, y, u, o).head;
  const mouth = (x, y, u, o) => geo(x, y, u, o).mouth;
  // {rot, dx, dy} that turn Pip by th about a body point: the body's middle sits at (cx, cy) u from (x, y). Spins and
  // tumbles turn about the middle (pip() itself pivots at the feet); lying flat is cy = -1.8.
  function pivot(th, cx = 0, cy = -2.5, sq = 0) { const h = 2.5 * (1 - sq); return { rot: th, dx: cx - h * Math.sin(th), dy: cy + h * Math.cos(th) }; }
  // Freeze-frames on impacts: hold each event's frame for len seconds, then run on late. Remap an action clock with it.
  const hitStop = (t, evs, len = .1) => t - evs.reduce((s, e) => s + clamp(t - e, 0, len), 0);
  // Pip's leaf on its own, as a prop (from selenium.js leafProp); (x, y) = the stalk's foot
  function leaf(x, y, u, ang, key, col = PIPC.leaf, dk = PIPC.leafDk) {
    boilSeed('tlf' + key);
    const tip = [x + Math.sin(ang) * .96 * u, y - Math.cos(ang) * .9 * u], sw = clamp(u / 22, .7, 1.6), a = ang - 1.05, Ln = 1.5 * u, Wd = .55 * u, lp = [];
    inkLine([[x, y], [lerp(x, tip[0], .4) - .1 * u, lerp(y, tip[1], .5)], tip], sw * 1.2, dk, 'ink', .6);
    for (let i = 0; i <= 8; i++) { const k = i / 8; lp.push([k * Ln, -Math.sin(k * Math.PI) * Wd * (1 - .25 * k)]); }
    for (let i = 7; i >= 1; i--) { const k = i / 8; lp.push([k * Ln, Math.sin(k * Math.PI) * Wd * (1 - .25 * k)]); }
    const R = P => P.map(([px, py]) => [tip[0] + px * Math.cos(a) - py * Math.sin(a), tip[1] + px * Math.sin(a) + py * Math.cos(a)]);
    paint(R(lp), { wash: col, fill: dk, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .75, curv: .4 });
    inkLine(R([[.1 * u, 0], [Ln * .55, -.03 * u], [Ln * .85, 0]]), sw * .45, dk, 'inkfine', .5);
  }

  // ---------- mixing ----------
  const ADD = { dx: 1, dy: 1, sq: 1, rot: 1 };
  function mix(base, ...ds) {
    const o = { ...base };
    for (const d of ds) {
      if (!d || d === NONE) continue;
      for (const k in d) {
        if (ADD[k]) o[k] = (o[k] || 0) + d[k];
        else if (k === 'fx') o.fx = [...(o.fx || []), ...d.fx];
        else if (k === 'over' && o.over && d.over) { const a = o.over, b = d.over; o.over = (...r) => { a(...r); b(...r); }; }
        else o[k] = d[k];
      }
    }
    return o;
  }

  // ---------- effects: fx = [{kind, k (0..1), at?, dir?, r?, …}]. at: 'head' | 'mouth' | 'mid' | 'feet' | [x, y] in u
  // from the scene's (x, y), so a ghost or a puff stays where Pip was. The BACK kinds go behind Pip. ----------
  const BACK = { speed: 1, dust: 1, skid: 1, ghost: 1, puddle: 1 };
  const ptOf = (g, at) => at === 'head' ? g.head : at === 'mouth' ? g.mouth : at === 'feet' ? [g.X, g.y] : Array.isArray(at) ? [g.x0 + at[0] * g.u, g.y + at[1] * g.u] : g.mid;
  const dropPts = (px, py, r, ang) => ellPts(0, 0, r * 1.2, r, 12).map(([X, Y]) => { X = X < 0 ? X * 1.9 : X; return [px + X * Math.cos(ang) - Y * Math.sin(ang), py + X * Math.sin(ang) + Y * Math.cos(ang)]; });
  const eggPts = (cx, cy, u, rot = 0, sx = 1, sy = 1) => { const P = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, c = Math.cos(a), s = Math.sin(a), lx = s * 1.8 * u * (1 - .1 * c) * sx, ly = -c * 2.45 * u * sy; P.push([cx + lx * Math.cos(rot) - ly * Math.sin(rot), cy + lx * Math.sin(rot) + ly * Math.cos(rot)]); } return P; };
  function cloud(cx, cy, r, k, col, sw, n = 5, seed = 0) {          // a puff: overlapping balls under one outline each
    for (let i = 0; i < n; i++) { const a = i / n * TAU + hash(i + seed) * 1.3, d = r * .55 * (i ? 1 : 0), rr = r * (.55 + .3 * hash(i + seed + 7)) * k;
      if (rr > 1) paint(ellPts(cx + Math.cos(a) * d * k, cy + Math.sin(a) * d * .7 * k, rr, rr * .88, 14, rr * .04), { wash: col, ink: PAL.ink, sw }); }
  }
  const FX = {
    shock(g, f) {                                    // spiky surprise lines all round the body
      const [cx, cy] = g.mid, u = g.u, L = 1.5 * u * f.k; if (L < 2) return;
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .2, r0 = (3.1 + .4 * hash(i)) * u, c = Math.cos(a), s = Math.sin(a) * 1.2;
        inkLine([[cx + c * r0, cy + s * r0], [cx + c * (r0 + L * .5) - s * .1 * u, cy + s * (r0 + L * .5) + c * .1 * u], [cx + c * (r0 + L), cy + s * (r0 + L)]], clamp(u / 34, .8, 1.8), PAL.ink, 'inkfine', 0); }
    },
    speed(g, f) {                                    // lines streaming behind a fast move, back to `from` (u) if given
      const u = g.u, d = f.dir ?? g.dir, back = f.from !== undefined ? Math.abs(g.X - (g.x0 + f.from * u)) / u - 1.8 : (f.len ?? 6);
      if (back < .3) return;
      for (let i = 0; i < 6; i++) { const yy = g.Y - (.5 + i * .78) * u * (1 - g.sq), x0 = g.X - d * (1.6 + .3 * hash(i)) * u, len = back * (.55 + .45 * hash(i + 4)) * u * f.k;
        inkLine([[x0, yy], [x0 - d * len, yy]], i % 2 ? clamp(u / 30, .6, 1.4) : clamp(u / 9, 2, 6), i % 2 ? PAL.ink : mixCol(PIPC.pip, PAL.cream, .55), i % 2 ? 'inkfine' : 'dry', 0); }
    },
    dust(g, f) {                                     // puffs kicked up behind the feet
      const u = g.u, d = f.dir ?? g.dir;
      for (let i = 0; i < 4; i++) { const k = frac(T * 2.6 + i / 4), r = (.3 + .55 * k) * u * f.k * (1 - easeIn(seg(k, .55, 1)));
        if (r > 1) paint(ellPts(g.X - d * (1.1 + 2.6 * k) * u, g.y - (.25 + .9 * k) * u, r, r * .8, 12, r * .05), { wash: f.col || DUST, ink: PAL.ink, sw: clamp(u / 40, .5, 1) }); }
    },
    skid(g, f) {                                     // two scorched streaks on the ground from `from` (u) to the feet
      const u = g.u, a = g.x0 + f.from * u, b = g.X - g.dir * .4 * u; if (Math.abs(b - a) < 4) return;
      for (const o of [0, .2]) inkLine([[a, g.y + (o + .05) * u], [lerp(a, b, .5), g.y + (o + .08) * u], [b, g.y + (o + .03) * u]], clamp(u / 18, 1, 3) * f.k, '#7A6450', 'dry', .2);
    },
    ghost(g, f) {                                    // the outline left hanging where Pip just was
      if (f.k <= .05) return; const [ax, ay] = ptOf(g, f.at || [0, 0]), u = g.u, P = eggPts(ax, ay - 2.5 * u, u);
      paint(P, { wash: PIPC.pip, washOp: 90 * f.k, ink: null });
      for (let i = 0; i < 28; i += 2) inkLine([P[i], P[(i + 1) % 28]], clamp(u / 25, .8, 2), PIPC.pipDk, 'ink', 0);
      inkLine([[ax, ay - 4.9 * u], [ax + .15 * u, ay - 5.9 * u]], clamp(u / 25, .8, 2), PIPC.leafDk, 'ink', .3);
    },
    puff(g, f) {                                     // a cloud that billows out and shrinks away
      if (f.k <= 0 || f.k >= 1) return; const [px, py] = ptOf(g, f.at || 'feet'), u = g.u, d = f.dir ?? 0;
      const s = (.45 + .75 * easeOut(f.k)) * (1 - easeIn(seg(f.k, .55, 1)));
      cloud(px + d * (.9 + 1.5 * easeOut(f.k)) * u, py - (f.at === 'feet' || !f.at ? .6 * u : 0) - .8 * u * f.k, (f.r ?? 1.2) * u * s, 1, f.col || DUST, clamp(u / 35, .5, 1.1), 5, f.seed || 0);
    },
    sweat(g, f) {                                    // drops flying off the head
      if (f.k < .2) return; const [hx, hy] = g.head, u = g.u;
      for (let i = 0; i < 4; i++) { const k = frac(T * 2.1 + i / 4), s = i % 2 ? 1 : -1, vx = s * (1.6 + .8 * hash(i)), vy = -1.6 - .6 * hash(i + 2), x = hx + s * 1.2 * u + vx * k * u * 1.4, y = hy + 1.2 * u + (vy * k + 3.0 * k * k) * u * 1.4;
        if (k < .8) paint(dropPts(x, y, .22 * u * (1 - .4 * k), Math.atan2(vy + 6 * k, vx)), { wash: PAL.sky, ink: PAL.ink, sw: clamp(u / 40, .4, 1) }); }
    },
    tremble(g, f) {                                  // ")" marks beside the body, jumping every frame
      if (f.k < .1) return; const u = g.u, j = Math.floor(T * 24) % 2 ? .12 * u : 0, [cx, cy] = g.mid;
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const x = cx + s * ((2.25 + .4 * i) * u * (1 + g.sq) + j), y = cy + (i ? .5 : -.4) * u;
        inkLine([[x - s * .1 * u, y - .45 * u], [x + s * .08 * u, y], [x - s * .1 * u, y + .45 * u]], clamp(u / 25, .8, 2) * f.k, PAL.ink, 'ink', .6); }
    },
    smoke(g, f) {                                    // a soot cloud that swallows Pip, then drifts up and thins out
      if (f.k <= 0 || f.k >= 1) return; const [cx, cy] = g.mid, u = g.u, k = f.k;
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 1.3 * hash(i + 11), d = (.6 + .9 * hash(i + 12)) * (1 + 1.2 * easeOut(k)), rise = (1.6 + 2.4 * hash(i + 13)) * k * k;
        const r = (.9 + .7 * hash(i + 3)) * u * (1 + .5 * k) * (1 - easeIn(seg(k, .3 + .25 * hash(i), 1)));
        if (r > 1) paint(ellPts(cx + Math.cos(a) * 1.6 * u * d, cy + Math.sin(a) * 1.8 * u * d - rise * u, r, r * .85, 14, r * .05), { wash: mixCol(SMOKE, '#9A939C', k * (.6 + .4 * hash(i))), ink: PAL.ink, sw: clamp(u / 40, .5, 1) }); }
    },
    boom(g, f) {                                     // the bang itself: a jagged orange-and-yellow burst
      if (f.k <= 0 || f.k >= 1) return; const [cx, cy] = g.mid, u = g.u, q = popK(seg(f.k, 0, .35)) * (1 - easeIn(seg(f.k, .5, 1)));
      if (q < .05) return;
      glow(cx, cy, 7 * u * q, '#FFB347', .8);
      for (const [r, col, n] of [[4.6, '#F28A3B', 12], [3.0, '#FFD45E', 10]]) {
        const P = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, rr = (i % 2 ? .55 : 1 + .3 * hash(i + n)) * r * u * q; P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .9]); }
        paint(P, { wash: col, ink: PAL.ink, sw: clamp(u / 25, .8, 2) });
      }
    },
    puddle(g, f) {                                   // a puddle spreading under the feet
      if (f.k <= .02) return; const u = g.u;
      paint(ellPts(g.X, g.y + .1 * u, (1.3 + 1.7 * f.k) * u, (.25 + .2 * f.k) * u, 22, .04 * u), { wash: '#9CCBEA', washOp: 200, ink: '#5F95C0', sw: clamp(u / 40, .5, 1) });
    },
    drips(g, f) {                                    // drops running off the body and arms
      if (f.k < .1) return; const u = g.u;
      for (let i = 0; i < 5; i++) { const ox = [-1.5, -.7, .2, 1.0, 1.7][i], oy = [1.3, .3, .1, .4, 1.6][i], k = frac(T * 1.3 + hash(i + 50)), [sx, sy] = g.loc(ox, -oy);
        const y = sy + k * k * 3.2 * u; if (y < g.y) paint(dropPts(sx, y, .17 * u * f.k, Math.PI / 2), { wash: PAL.sky, ink: PAL.ink, sw: clamp(u / 45, .4, .9) }); }
    },
    spray(g, f) {                                    // a sneeze (dir) or a shake-dry (radial): droplets flung out
      if (f.k <= 0 || f.k >= 1) return; const u = g.u, d = f.dir ?? g.dir, [ox, oy] = f.radial ? g.mid : g.mouth;
      for (let i = 0; i < 12; i++) { const a = f.radial ? i / 12 * TAU + hash(i) : (d > 0 ? 0 : Math.PI) + (hash(i) - .5) * 1.0, v = (f.radial ? 2.2 : 1.2) + 4.5 * easeOut(f.k) * (.55 + .45 * hash(i + 3));
        const x = ox + Math.cos(a) * v * u, y = oy + Math.sin(a) * v * u + 1.2 * f.k * f.k * u, r = .14 * u * (1 - .6 * f.k);
        if (r > .6) paint(dropPts(x, y, r, a), { wash: f.radial ? PAL.sky : '#D3E8F2', ink: PAL.ink, sw: clamp(u / 45, .4, .9) }); }
    },
    impact(g, f) {                                   // a jagged pow star where something hit
      if (f.k <= 0 || f.k >= 1) return; const [cx, cy] = ptOf(g, f.at || 'head'), u = g.u, q = popK(seg(f.k, 0, .3)) * (1 - easeIn(seg(f.k, .55, 1))), R = (f.r ?? 1.2) * u * q;
      if (R < 2) return;
      const P = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + .1, rr = i % 2 ? R * .45 : R * (1 + .3 * hash(i)); P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
      paint(P, { wash: '#FFE08A', ink: PAL.ink, sw: clamp(u / 25, .8, 2) });
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5; inkLine([[cx + Math.cos(a) * R * 1.4, cy + Math.sin(a) * R * 1.4], [cx + Math.cos(a) * R * 1.9, cy + Math.sin(a) * R * 1.9]], clamp(u / 22, 1, 2.4), PAL.ink, 'ink', 0); }
    },
    wheel(g, f) {                                    // legs spinning so fast they're a blur
      if (f.k < .1) return; const u = g.u, cx = g.X - g.dir * .1 * u, cy = g.y - .22 * u;
      paint(ellPts(cx, cy, 1.3 * u, .36 * u, 20, .04 * u), { wash: PIPC.pipDk, washOp: 120 * f.k, ink: null });     // a blur of feet
      for (let i = 0; i < 3; i++) { const P = [], a0 = T * 30 + i * 2.1; for (let j = 0; j <= 10; j++) { const a = a0 + j / 10 * 2.6; P.push([cx + Math.cos(a) * (1.25 + .12 * i) * u, cy + Math.sin(a) * (.36 + .05 * i) * u]); }
        inkLine(P, clamp(u / 28, .7, 2) * f.k, PAL.ink, 'inkfine', .6); }
    },
    arcs(g, f) {                                     // motion arcs either side of a shaking head
      if (f.k < .1) return; const u = g.u, [cx, cy] = g.loc(0, -3.3);
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const R = (2.3 + .45 * i) * u, P = []; for (let j = 0; j <= 6; j++) { const a = (s > 0 ? 0 : Math.PI) + (j / 6 - .5) * .9; P.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
        inkLine(P, clamp(u / 30, .7, 1.6) * f.k, PAL.ink, 'inkfine', .5); }
    },
    blur(g, f) {                                     // the face smeared across the body by a fast turn
      if (f.k < .1) return; const u = g.u;
      for (let i = 0; i < 3; i++) { const ly = [-3.35, -2.55, -1.6][i], w = [.9, 1.0, .95][i], P = []; for (let j = 0; j <= 6; j++) { const k = j / 6 - .5; P.push(g.loc(k * 2 * w, ly + .1 * Math.cos(k * Math.PI))); }
        inkLine(P, clamp(u / 22, .8, 2.4) * f.k, i === 2 ? mixCol(PIPC.belly, PIPC.pip, .3) : mixCol(PAL.cream, PIPC.pip, .45), 'dry', .5); }
    },
    swirl(g, f) {                                    // whirl lines round a spinning body
      if (f.k < .1) return; const u = g.u, [cx, cy] = g.mid;
      for (let i = 0; i < 3; i++) { const P = [], ph = T * 14 + i * 2.1; for (let j = 0; j <= 10; j++) { const a = ph + j / 10 * 2.4; P.push([cx + Math.cos(a) * 2.7 * u, cy + (i - 1) * 1.4 * u + Math.sin(a) * .7 * u]); }
        inkLine(P, clamp(u / 26, .8, 2.2) * f.k, mixCol(PIPC.pipDk, PAL.cream, .3), 'dry', .6); }
    },
    fountain(g, f) {                                 // tears gushing out sideways in arcs
      if (f.k < .1) return; const u = g.u;
      g.eyes.forEach(([ex, ey], e) => { const s = e ? 1 : -1; for (let i = 0; i < 6; i++) { const k = frac(T * 2.4 + i / 6 + e * .08), x = ex + s * (.4 + 2.6 * k) * u, y = ey - 1.6 * u * k + 3.2 * u * k * k;
        paint(dropPts(x, y, .16 * u * f.k, Math.atan2(-1.6 + 6.4 * k, s * 2.6)), { wash: PAL.sky, ink: PAL.ink, sw: clamp(u / 45, .4, .9) }); } });
    },
    flakes(g, f) {                                   // soot flaking off as it fades
      if (f.k <= 0 || f.k >= 1) return; const u = g.u;
      for (let i = 0; i < 9; i++) { const x = g.X + (hash(i + 60) - .5) * 3.4 * u + .3 * u * Math.sin(T * 5 + i), y = g.Y - (1 + 3.5 * hash(i + 61)) * u + f.k * 3 * u;
        if (y < g.y) paint(ellPts(x, y, .1 * u, .07 * u, 6, 0, i), { wash: SMOKE, ink: null }); }
    }
  };

  // bumps on the head (stacked when bump > 1) and the gulp lump (bulging both sides), drawn body-local through pip()'s over hook
  const overOf = o => (u, sw, fx) => {
    for (let i = 0; i < Math.ceil(o.bump || 0); i++) { const k = Math.min(1, o.bump - i), r = .44 * u * k, cx = fx * .3 + .5 * u, cy = -4.72 * u - i * .7 * u;
      if (r > 1) { paint(ellPts(cx, cy - r * .3, r, r * .9, 14), { wash: PIPC.pip, fill: PIPC.pipDk, fillOp: 30, tex: .4, ink: PAL.ink, sw: sw * .8 }); paint(ellPts(cx - r * .3, cy - r * .65, r * .25, r * .16, 8), { wash: PAL.cream, washOp: 200, ink: null }); } }
    if (o.lump > 0 && o.lump < 1) { const y = lerp(-2.6, -.9, o.lump), c = -(y + 2.5) / 2.45, hw = 1.8 * Math.sqrt(Math.max(0, 1 - c * c)) * (1 - .1 * c);
      for (const s of [-1, 1]) { const cx = s * (hw - .12) * u, cy = y * u, r = .4 * u;   // the outline swells: only its outer arc is inked
        paint(ellPts(cx, cy, r, r * .9, 14), { wash: PIPC.pip, fill: PIPC.pipDk, fillOp: 35, tex: .5, ink: null });
        inkLine(Array.from({ length: 9 }, (_, i) => { const a = (s > 0 ? 0 : Math.PI) + (i / 8 - .5) * 2.4 * s; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * .9]; }), sw, PAL.ink, 'ink', .6); } }
  };

  // ---------- drawing ----------
  function draw(x, y, u, o) {
    const g = geo(x, y, u, o), key = o.key || '', fx = o.fx || [];
    const run = back => fx.forEach((f, i) => { if (!!BACK[f.kind] === back && FX[f.kind]) { boilSeed('tfx' + key + i + f.kind); FX[f.kind](g, f); } });
    run(true);
    if (o.trail) o.trail.forEach(([dx, dy, r = 0], i) => {      // smear ghosts of the last few frames
      boilSeed('ttr' + key + i); const fx_ = x + dx * u, fy = y + dy * u, cx = fx_ + Math.sin(r) * 2.5 * u, cy = fy - Math.cos(r) * 2.5 * u;
      paint(eggPts(cx, cy, u, r, 1 + (o.sq || 0), 1 - (o.sq || 0)), { wash: PIPC.pip, washOp: 70 - 25 * i, ink: null });
    });
    if (!o.gone) {
      const p = { ...o, emote: null };                               // the emote goes on below, on the turned body
      if (o.leafOff) p.leaf = Math.PI;                               // pip.js draws the leaf first: pointing it down hides it
      if (o.bump > 0 || (o.lump > 0 && o.lump < 1)) { const prev = o.over, mine = overOf(o); p.over = (...r) => { if (prev) prev(...r); mine(...r); }; }
      tinted(o.tint, o.tintK ?? 1, () => {
        pip(g.X, y, u, p);
        if (o.emote) {                                               // turned with the body about the feet, and down with a squash
          const hs = (1 - g.sq) * 5 * u;
          push(); translate(g.X, g.Y); rotate(g.rot); translate(-g.X, -g.Y);
          pipEmote(o.emote, g.X + g.dir * 2.9 * u, g.Y - hs, u * (o.emoteK ?? 1), g.dir, key, [g.X, g.Y - hs]);
          pop();
        }
      });
    }
    run(false);
    boilSeed('afterToon' + key);
    return g;
  }

  // ================================ the gags ================================
  // Each is gag(t, t0, opts) → a pose delta (t0 = the moment it fires; some wind up a little before it).

  // The wild take: a squint and crouch, then Pip rockets up stretched thin, eyes popped, jaw on the floor, brows off
  // its head, hangs there quivering, drops and lands in a squash. amt scales it; hang is the time held in the air.
  function wildTake(t, t0, o = {}) {
    const a = o.amt ?? 1, hang = o.hang ?? .45, tau = t - t0, T1 = .12, T2 = T1 + hang, T3 = T2 + .22, END = T3 + .65;
    if (tau < -.2 || tau > END) return NONE;
    if (tau < 0) { const k = ease(seg(tau, -.2, 0)); return { sq: .2 * a * k, dy: .04 * a * k, blink: .6 * k, leaf: -.4 * k, armF: [-1.1 - .3 * k, 1.5], armB: [-1.1 - .3 * k, 1.5] }; }
    const pop = backOut(seg(tau, 0, .22)), vib = tau < T2 ? Math.sin(tau * 70) : 0, land = tau - T3, air = tau < T3;
    let dy, sq;
    if (tau < T1) { const k = easeOut(tau / T1); dy = -3.0 * a * k; sq = lerp(.2 * a, -.32 * a, k); }
    else if (tau < T2) { dy = -3.0 * a - .15 * a * Math.sin((tau - T1) / hang * Math.PI); sq = -.32 * a + .035 * vib; }
    else if (tau < T3) { const k = easeIn(seg(tau, T2, T3)); dy = -3.0 * a * (1 - k); sq = -.32 * a * (1 - .4 * k); }
    else { dy = 0; sq = .32 * a * Math.exp(-6 * land) * Math.cos(15 * land); }
    const back = Math.exp(-6 * Math.max(0, tau - T2));              // eyes, jaw and brows spring home after the hang
    const arm = air ? .95 + .12 * vib : lerp(.95, -1.1, ease(seg(land, 0, .3)));
    return {
      ...face('shock', { eyeS: 1 + .85 * a * (tau < T2 ? pop : back) + (tau < T2 ? .05 * Math.sin(tau * 40) : .12 * spring(t, t0 + T3, 6, 20)), pupil: .38,
        jaw: Math.max(.15, 2.0 * a * (tau < T2 ? easeOut(seg(tau, .02, .16)) : back)), browY: .55 * a * (tau < T2 ? pop : back) }),
      dy, sq, blink: cut(tau, END - .03, .04), armF: [arm, 2.7], armB: [arm + .12, 2.6],
      leaf: air ? .1 * Math.sin(tau * 60) : .6 * spring(t, t0 + T3, 5, 18), emote: 'exclaim', emoteK: popK(seg(tau, 0, .25)) * (1 - seg(tau, END - .25, END)),
      fx: [{ kind: 'shock', k: env(tau, 0, T2 + .1, .05, .2) }, { kind: 'sweat', k: env(tau, .05, T3 + .2, .05, .2) }]
    };
  }
  wildTake.len = o => .12 + (o.hang ?? .45) + .22 + .65;

  // The double take: a glance at the thing (look: ±1, toward the heading or away), back to being pleased with itself,
  // then it lands: a blink, the head whips round and a wild take fires at t0 + 1.15.
  function doubleTake(t, t0, o = {}) {
    const d = o.look ?? 1, tau = t - t0, W0 = 1.15;
    if (tau < 0 || tau > W0 + wildTake.len(o)) return NONE;
    const take = wildTake(t, t0 + W0, o);
    if (tau < .95) {
      const g = ease(seg(tau, 0, .12)) * (1 - ease(seg(tau, .42, .55)));
      return mix({ lookX: d * g, turn: .4 + .3 * d * g, dy: -.08 * Math.sin(seg(tau, .62, .9) * Math.PI), ...face(tau > .5 ? 'happy' : 'calm'), blink: cut(tau, .5, .05) }, take);
    }
    const whip = seg(tau, .95, 1.05);
    return mix({ lookX: d, turn: .4 + .5 * d, rot: d * .1 * Math.sin(whip * Math.PI), blink: cut(tau, .96, .03), fx: [{ kind: 'arcs', k: 1 - seg(tau, 1.0, 1.2) }] }, take);
  }
  doubleTake.len = o => 1.15 + wildTake.len(o);

  // Shaking it off (disbelief, a bad smell, water): the face swings side to side, eyes squeezed shut.
  function headShake(t, t0, o = {}) {
    const len = o.len ?? .6, tau = t - t0; if (tau < 0 || tau > len + .05) return NONE;
    const e = env(tau, 0, len, .06, .12), w = Math.sin(tau * TAU * 7) * e;
    return { rot: .13 * w, turn: .4 + .7 * w, lookX: -w, eyes: 'strain', leaf: .6 * w, sq: .04 * e, blink: cut(tau, len + .02, .04), fx: [{ kind: 'arcs', k: e }] };
  }
  headShake.len = o => (o.len ?? .6) + .05;

  // The zip-off: rev in place (lean back, legs a wheel, dust) for rev seconds before t0, then gone in a few frames,
  // leaving its outline and a puff. Pip ends dist u away with gone: true (fx only); keep the gag running to stay gone.
  function zip(t, t0, o = {}) {
    const dir = o.dir ?? 1, dist = o.dist ?? 40, rev = o.rev ?? .55, tau = t - t0;
    if (tau < -rev) return NONE;
    const base = { flip: dir < 0, lookX: 1, turn: .8 };
    if (tau < 0) {
      const k = ease(seg(tau, -rev, -rev + .15)), spin = seg(tau, -rev + .1, -rev + .2);
      return { ...base, rot: -dir * .22 * k, sq: .1 * k, dx: -dir * .5 * k, walk: t * 26 * spin, stepH: .5, armF: [.9 + .25 * Math.sin(t * 30), 2.1], armB: [-.9, 1.9],
        leaf: -1.1 * k + .12 * Math.sin(t * 40), fx: [{ kind: 'wheel', k: spin }, { kind: 'dust', k: spin }] };
    }
    const at = k => -dir * .5 + dir * dist * easeIn(k), k = seg(tau, 0, .14), dx = at(k);
    const fx = [{ kind: 'ghost', k: 1 - seg(tau, .3, .55), at: [-dir * .5, 0] }, { kind: 'puff', k: seg(tau, 0, .7), at: [-dir * .5, 0], r: 1.7 }];
    if (tau < .14) fx.push({ kind: 'speed', k: 1, from: -dir * .5, dir });
    return { ...base, dx, rot: dir * .12, sq: .45, walk: t * 26, leaf: -1.3, armF: [-1.0, 2.0], armB: [-1.1, 2.0], fx, gone: tau >= .14,
      trail: tau < .14 ? [[at(Math.max(0, k - .25)), 0, dir * .12], [at(Math.max(0, k - .5)), 0, dir * .12]] : null };
  }
  zip.len = o => .14;

  // The skid stop: in from `from` u away at full tilt, then braking from t0 (lean back, feet first, dust, skid marks)
  // to a stop at the scene's x by t0 + brake, where the body pitches forward and wobbles. Before it arrives, gone.
  function skid(t, t0, o = {}) {
    const dir = o.dir ?? 1, from = o.from ?? 26, brake = o.brake ?? .5, tau = t - t0, END = brake + .7;
    if (tau < -.22) return { gone: true };
    if (tau > END) return NONE;
    const base = { flip: dir < 0, lookX: 1 };
    if (tau < 0) {
      const at = q => -dir * lerp(from, 4, q), k = seg(tau, -.22, 0);
      return { ...base, dx: at(k), sq: .35, rot: dir * .15, walk: t * 26, leaf: -1.3, armF: [-1.0, 2.0], armB: [-1.1, 2.0], fx: [{ kind: 'speed', k: 1, from: -dir * from, dir }],
        trail: [[at(k - .12), 0, dir * .15], [at(k - .25), 0, dir * .15]] };
    }
    if (tau < brake) {
      const k = seg(tau, 0, brake), lean = env(tau, 0, brake, .05, .12);
      return { ...base, ...face('eek', { eyeS: 1.15 }), dx: -dir * 4 * (1 - k) * (1 - k), rot: -dir * .38 * lean, sq: .06 * lean, walk: .4, leaf: -1.2 * lean, armF: [1.0, 2.2], armB: [1.2, 2.1],
        fx: [{ kind: 'dust', k: 1, dir }, { kind: 'skid', k: 1, from: -dir * 4 }] };
    }
    const q = tau - brake;
    return { ...base, rot: dir * .3 * Math.exp(-5 * q) * Math.sin(14 * q), sq: .2 * Math.exp(-6 * q) * Math.cos(16 * q), leaf: .9 * Math.exp(-4 * q) * Math.sin(12 * q),
      blink: cut(tau, END - .03, .04), fx: [{ kind: 'skid', k: 1 - seg(q, .2, .7), from: -dir * 4 }, { kind: 'puff', k: seg(q, 0, .6), at: [dir * 1.2, 0], r: .9 }] };
  }
  skid.len = o => (o.brake ?? .5) + .7;

  // Flattened like a pancake (something landed on it): squashed flat at once, a blank stare and two blinks while it's
  // held, then it pops back up with a boing and wobbles.
  function flatten(t, t0, o = {}) {
    const hold = o.hold ?? 1.1, tau = t - t0, END = hold + .75;
    if (tau < 0 || tau > END) return NONE;
    if (tau < hold) {
      const k = easeOut(seg(tau, 0, .05));
      return { ...face('blank'), sq: .82 * k + .02 * Math.sin(tau * 25) * Math.exp(-4 * tau), blink: Math.max(cut(tau, hold * .5, .05), cut(tau, hold * .5 + .2, .05)),
        armF: [0, 2.5], armB: [.05, 2.4], leaf: -1.5, turn: 0, lookX: 0, lookY: 0, emote: null, fx: [{ kind: 'impact', k: seg(tau, 0, .35), at: 'mid', r: 1.6 }] };
    }
    const q = tau - hold, sq = q < .08 ? lerp(.82, -.45, easeOut(q / .08)) : -.45 * Math.exp(-5 * (q - .08)) * Math.cos(17 * (q - .08));
    return { ...face('shock', { eyeS: 1 + .5 * Math.exp(-6 * q), jaw: .1 + .6 * Math.exp(-5 * q) }), sq, dy: -1.0 * Math.exp(-5 * q) * Math.max(0, Math.sin(9 * q)),
      leaf: .7 * Math.sin(q * 25) * Math.exp(-4 * q), armF: [1.2 * Math.exp(-3 * q), 2.0], armB: [1.1 * Math.exp(-3 * q), 2.0], blink: cut(tau, END - .03, .04), emote: null,
      fx: [{ kind: 'shock', k: 1 - seg(q, 0, .35) }] };
  }
  flatten.len = o => (o.hold ?? 1.1) + .75;

  // Splat into a wall on the dir side at t0: mashed thin against it, stuck there for `stick` s, then it peels off,
  // topples back like a plank, lies seeing stars for `lie` s and gets up dizzy.
  function wallSplat(t, t0, o = {}) {
    const dir = o.dir ?? 1, stick = o.stick ?? .55, lie = o.lie ?? .9, tau = t - t0, P = stick + .38, END = P + lie + .45;
    if (tau < 0 || tau > END) return NONE;
    const base = { flip: dir < 0, lookX: 0 };
    if (tau < stick) {
      const sq = -.4 * easeOut(seg(tau, 0, .05)) + .03 * Math.sin(tau * 40) * Math.exp(-4 * tau);
      return { ...base, ...face('ouch', { jaw: .3 }), sq, dx: -dir * 1.8 * sq, armF: [1.1, 2.4], armB: [1.3, 2.2], leaf: .5, fx: [{ kind: 'impact', k: seg(tau, 0, .35), at: [dir * 1.8, -3.2], r: 1.4 }] };
    }
    if (tau < P) {
      const k = easeIn(seg(tau, stick, P)), r = -dir * 1.52 * k, sq = -.4 * (1 - ease(seg(tau, stick, stick + .15)));
      return { ...base, ...face('ko'), sq, dx: -dir * 1.8 * sq, rot: r, dy: -1.8 * Math.abs(Math.sin(r)), armF: [1.4, 2.0], armB: [1.3, 2.0], leaf: .3 };
    }
    const q = tau - P, up = ease(seg(tau, P + lie, END - .05)), r = -dir * 1.52 * (1 - up) + dir * .12 * Math.sin(up * Math.PI);
    return { ...base, ...face(up > 0 ? 'dizzy' : 'ko'), rot: r, dy: -1.8 * Math.abs(Math.sin(r)) - .45 * Math.exp(-6 * q) * Math.abs(Math.sin(11 * q)), armF: [1.4 - 2.4 * up, 2.0 - .4 * up], armB: [1.3 - 2.4 * up, 2.0 - .4 * up],
      leaf: -.6 * (1 - up), emote: 'stars', emoteK: popK(seg(q, .1, .4)) * (1 - seg(tau, END - .2, END)), blink: cut(tau, END - .03, .04),
      fx: [{ kind: 'puff', k: seg(q, 0, .6), at: [-dir * 2.6, 0], r: 1.1 }] };
  }
  wallSplat.len = o => (o.stick ?? .55) + .38 + (o.lie ?? .9) + .45;

  // Spun like a top (a punch, a slap, a whirlwind): turns whole turns about its middle in the air, slowing, then
  // wobbles dizzy with stars.
  function spinOut(t, t0, o = {}) {
    const dir = o.dir ?? 1, turns = o.turns ?? 3, len = o.len ?? 1.0, tau = t - t0, END = len + 1.3;
    if (tau < 0 || tau > END) return NONE;
    if (tau < len) {
      const k = easeOut(seg(tau, 0, len)), lift = .9 * Math.sin(Math.PI * tau / len);
      return { ...pivot(dir * turns * TAU * k, 0, -2.5 - lift), ...face('dizzy'), armF: [.1, 2.4], armB: [.1, 2.4], leaf: .9, emote: null, fx: [{ kind: 'swirl', k: 1 - .8 * k }] };
    }
    const q = tau - len;
    return { ...face('dizzy'), rot: .22 * Math.exp(-1.5 * q) * Math.sin(5 * q), walk: .2 * Math.sin(q * 5), armF: [.2 + .5 * Math.sin(q * 4), 1.6], armB: [.2 - .5 * Math.sin(q * 4), 1.6],
      leaf: .7 * Math.sin(q * 4), emote: 'stars', emoteK: popK(seg(q, 0, .3)) * (1 - seg(q, 1.05, 1.3)), blink: cut(tau, END - .03, .04) };
  }
  spinOut.len = o => (o.len ?? 1.0) + 1.3;

  // Spun round like a top on its own upright axis, in 3D (pip()'s yaw): a little wind-up the other way, then `turns`
  // turns, slowing, the face and belly sweeping round, the back going past, arms flung out and the face a smear while
  // it's fast; then it sways, still half-turning, dizzy with stars. dir 1 swings the face toward the heading first.
  function spinY(t, t0, o = {}) {
    const dir = o.dir ?? 1, turns = o.turns ?? 3, len = o.len ?? 1.3, tau = t - t0, END = len + 1.4;
    if (tau < -.18 || tau > END) return NONE;
    if (tau < 0) { const k = ease(seg(tau, -.18, 0)); return { yaw: -dir * .45 * k, sq: .1 * k, armF: [-1.2, 1.5], armB: [-1.2, 1.5] }; }
    if (tau < len) {
      const k = seg(tau, 0, len), e = 1 - (1 - k) * (1 - k), sp = 1 - k;                // e: spinning down from full speed
      return { ...face(k < .45 ? 'wow' : 'dizzy'), yaw: -dir * .45 * (1 - e) + dir * turns * TAU * e, dy: -.8 * Math.sin(Math.PI * k), sq: -.08 * Math.sin(Math.PI * k),
        armF: [.15 + .15 * sp, 2.5], armB: [.15 + .15 * sp, 2.5], leaf: .25 * Math.sin(tau * 23) * sp, emote: null,
        fx: [{ kind: 'swirl', k: .2 + .6 * sp }, { kind: 'blur', k: clamp(sp * 2.2 - 1.1) }] };
    }
    const q = tau - len;
    return { ...face('dizzy'), yaw: dir * .55 * Math.exp(-2.2 * q) * Math.sin(6 * q), rot: .1 * Math.exp(-1.5 * q) * Math.sin(5 * q), armF: [.2 + .4 * Math.sin(q * 4), 1.6], armB: [.2 - .4 * Math.sin(q * 4), 1.6],
      leaf: .6 * Math.sin(q * 4) * Math.exp(-q), emote: 'stars', emoteK: popK(seg(q, 0, .3)) * (1 - seg(q, 1.15, 1.4)), blink: cut(tau, END - .03, .04) };
  }
  spinY.len = o => (o.len ?? 1.3) + 1.4;

  // Bonked on the head: squashed by the hit, a pow star, a lump that swells up (bumps: 2 stacks two), then knocked
  // out with stars going round, then dizzy. Keep the lump afterwards with bump: 1 in the scene.
  function bonk(t, t0, o = {}) {
    const len = o.len ?? 2.2, tau = t - t0; if (tau < 0 || tau > len) return NONE;
    const sq = tau < .05 ? .45 * easeOut(tau / .05) : .45 * Math.exp(-7 * (tau - .05)) * Math.cos(14 * (tau - .05));
    const f = tau < .35 ? face('ouch', { jaw: .5 }) : tau < .95 ? face('ko') : face('dizzy');
    return { ...f, sq, bump: popK(seg(tau, .04, .32)) * (o.bumps ?? 1), rot: tau > .35 ? .12 * Math.sin((tau - .35) * 4.5) * (1 - seg(tau, len - .4, len)) : 0,
      leaf: -1.0 * Math.exp(-6 * tau) + .4 * spring(t, t0 + .1, 4, 14), armF: [-1.2, 1.5], armB: [-1.2, 1.5], emote: tau > .35 ? 'stars' : null,
      emoteK: popK(seg(tau, .35, .6)) * (1 - seg(tau, len - .2, len)), blink: cut(tau, len - .03, .04), fx: [{ kind: 'impact', k: seg(tau, 0, .3), at: 'head', r: 1.6 }] };
  }
  bonk.len = o => o.len ?? 2.2;

  // Blown up: a bang that swallows Pip in smoke, which clears on a soot-black Pip with a frizzled leaf. Two blank
  // blinks, a cough of smoke, and the soot flakes off by t0 + len.
  function blast(t, t0, o = {}) {
    const len = o.len ?? 2.8, tau = t - t0, C = 1.75; if (tau < 0 || tau > len) return NONE;
    const coughK = env(tau, C, C + .35, .05, .2);
    return { ...face('blank', coughK > .3 ? { mouth: 'jaw', jaw: .35 } : {}), tint: 'soot', tintK: 1 - ease(seg(tau, len - .45, len)),
      blink: Math.max(cut(tau, 1.0, .05), cut(tau, 1.25, .05), cut(tau, len - .03, .04)),
      sq: .25 * Math.exp(-6 * tau) * Math.cos(12 * tau) + .12 * coughK, dy: -.9 * Math.exp(-5 * tau) * Math.max(0, Math.sin(8 * tau)), rot: -.04 * coughK,
      leaf: -.25 + .3 * Math.sin(tau * 31) * Math.exp(-1.2 * tau), armF: [-1.2, 1.55], armB: [-1.3, 1.5], turn: 0, lookX: 0, emote: null,
      fx: [{ kind: 'boom', k: seg(tau, 0, .4) }, { kind: 'smoke', k: seg(tau, .05, 1.5) }, { kind: 'puff', at: 'mouth', k: seg(tau, C, C + .8), r: .55, col: '#4A4448' }, { kind: 'flakes', k: seg(tau, len - .55, len) }] };
  }
  blast.len = o => o.len ?? 2.8;

  // Shaking with fear from t0 to t1: the body buzzes every frame, teeth chatter, knees knock. face: null keeps the mood's.
  function shiver(t, t0, t1, o = {}) {
    if (t < t0 || t > t1) return NONE;
    const e = env(t, t0, t1, .12, .15), f = Math.floor(t * 24), alt = f % 2 ? 1 : -1, a = o.amt ?? 1;
    return { ...(o.face === null ? {} : face(o.face ?? 'eek', { jaw: f % 4 < 2 ? 0 : .55 })), dx: .07 * a * e * alt, sq: -.04 * e + .02 * e * alt, walk: .14 * alt * e,
      armsFront: true, armF: { at: [.6, -2.0 + .05 * alt] }, armB: { at: [-.5, -2.1 - .05 * alt] }, leaf: -.4 * e + .12 * alt * e, emote: 'sweat', fx: [{ kind: 'tremble', k: e }] };
  }

  // The gravity gag: Pip has run off an edge and is in mid-air at t0. Its legs wind down, it looks down, looks at the
  // camera and gulps, and at t0 + drop it falls (fall u, out of shot) leaving its outline behind. wave: a little bye.
  function hangtime(t, t0, o = {}) {
    const fall = o.fall ?? 16, drop = o.drop ?? 1.5, tau = t - t0; if (tau < 0) return NONE;
    if (tau < drop) {
      const run = 1 - seg(tau, 0, .35), down = ease(seg(tau, .35, .5)) * (1 - ease(seg(tau, .78, .88))), cam = ease(seg(tau, .78, .88)), bye = o.wave ? env(tau, 1.0, drop - .05, .1, .1) : 0;
      return { ...(tau > .75 ? face('gulp', { eyeS: 1.2 }) : {}), walk: t * 10 * run, stepH: 1.3 * run, lookY: down, lookX: .3 * (1 - cam), turn: lerp(.4, 0, cam), blink: cut(tau, .76, .04),
        armF: bye > 0 ? [1.2 + .35 * Math.sin(tau * 14), 1.8] : [.4 * run, 1.8], armB: [.3 * run, 1.7], emote: tau > .9 ? 'sweat' : null, emoteK: popK(seg(tau, .9, 1.2)) };
    }
    const k = easeIn(seg(tau, drop, drop + .4));
    return { ...face('gulp', { eyeS: 1.3 }), dy: fall * k, sq: -.3 * Math.min(1, k * 4), lookX: 0, turn: 0, leaf: 0, armF: [1.5, 2.2], armB: [1.4, 2.2], gone: k >= 1,
      fx: [{ kind: 'ghost', k: 1 - seg(tau, drop + .15, drop + .5), at: [0, 0] }, { kind: 'puff', k: seg(tau, drop, drop + .5), at: [0, -2.4], r: .8 }] };
  }
  hangtime.len = o => (o.drop ?? 1.5) + .4;

  // A big gulp: eyes widen, the body stretches up, the arms go stiff and a lump goes down.
  function gulp(t, t0) {
    const tau = t - t0, END = 1.3; if (tau < 0 || tau > END) return NONE;
    const s = Math.exp(-Math.pow((tau - .35) / .08, 2));
    const arms = tau > .25 && tau < .85 ? { armsFront: false, armF: [.85, 1.8], armB: [.85, 1.8] } : {};
    return { ...face('gulp', { eyeS: 1.15 + .25 * s }), ...arms, sq: -.13 * s + .06 * spring(t, t0 + .5, 6, 16), dy: -.2 * s, lump: seg(tau, .35, .75), emote: 'sweat', emoteK: popK(seg(tau, .1, .4)), blink: cut(tau, END - .03, .04) };
  }
  gulp.len = () => 1.3;

  // Ah… ah… ah… CHOO: three building breaths (leaning back further each time), then a sneeze that throws Pip back
  // and sprays forward; it shuffles back to its spot. dir = the way Pip faces.
  function sneeze(t, t0, o = {}) {
    const dir = o.dir ?? 1, tau = t - t0, C = 1.35, END = C + 1.0; if (tau < 0 || tau > END) return NONE;
    if (tau < C) {
      const i = Math.min(2, Math.floor(tau / .45)), grow = (i + ease(seg(tau, i * .45, i * .45 + .3))) / 3, flick = .5 + .5 * Math.sin(tau * 38);
      return { ...face('ah', { jaw: .2 + .5 * grow, lid: [.4 + .15 * flick * grow, .25] }), rot: -dir * .2 * grow, dy: -.4 * grow, sq: -.1 * grow, leaf: -.6 * grow, armF: [.3 + .4 * grow, 1.8], armB: [.2 + .4 * grow, 1.7] };
    }
    const q = tau - C, back = easeOut(seg(q, 0, .25)) * (1 - ease(seg(q, .55, .95)));
    return { ...face(q < .4 ? 'ouch' : 'calm', q < .4 ? { jaw: 1 } : {}), rot: dir * .3 * Math.exp(-5 * q) * Math.cos(9 * q), sq: .35 * Math.exp(-7 * q) * Math.cos(14 * q), dx: -dir * 1.4 * back,
      walk: q > .55 ? (q - .55) * 5 : 0, leaf: .9 * Math.exp(-5 * q), armF: [-.6, 1.8], armB: [-.7, 1.7], blink: cut(tau, END - .03, .04),
      fx: [{ kind: 'spray', k: seg(q, 0, .6), dir }, { kind: 'puff', at: 'mouth', k: seg(q, 0, .7), r: 1.3, dir, col: '#EEF4F2' }] };
  }
  sneeze.len = () => 2.35;

  // Soaked from t0 to t1: wet and darker, the leaf plastered down, dripping into a growing puddle.
  function dripping(t, t0, t1) {
    const e = env(t, t0, t1, .25, .35); if (e <= 0) return NONE;
    return { tint: 'wet', tintK: .85 * e, leaf: -1.15 * e, sq: .05 * e, fx: [{ kind: 'drips', k: e }, { kind: 'puddle', k: seg(t, t0, t0 + 1.2) * e }] };
  }
  // The dog shake: spins its whole self side to side, flinging the water off; the wet tint is gone by the end.
  function shakeDry(t, t0, o = {}) {
    const len = o.len ?? .9, tau = t - t0; if (tau < 0 || tau > len + .05) return NONE;
    const e = env(tau, 0, len, .08, .15), w = Math.sin(tau * TAU * 8) * e;
    return { rot: .2 * w, dx: .12 * w, turn: .4 + .8 * w, eyes: 'strain', tint: 'wet', tintK: .85 * (1 - seg(tau, .1, len)), leaf: .9 * w, sq: -.04 * e, blink: cut(tau, len + .02, .04),
      fx: [{ kind: 'spray', k: frac(tau * 2.2) * e, radial: true }, { kind: 'arcs', k: e }] };
  }
  shakeDry.len = o => (o.len ?? .9) + .05;

  // The tiptoe sneak from t0 to t1: `steps` long, slow, high steps (a quick plant at the end of each), crouched, paws up,
  // glancing back. Pip ends dist u along and stays there (the delta holds dx after t1).
  function sneak(t, t0, t1, o = {}) {
    const n = o.steps ?? 4, dist = o.dist ?? 8, dir = o.dir ?? 1;
    if (t < t0) return NONE;
    if (t > t1) return { dx: dir * dist };
    const p = seg(t, t0, t1) * n, i = Math.min(n - 1, Math.floor(p)), f = p - i, lift = Math.sin(seg(f, .05, .75) * Math.PI);
    return { flip: dir < 0, ...face('scheme'), dx: dir * dist * (i + ease(seg(f, .25, .85))) / n, walk: i + seg(f, .05, .85), stepH: 3.2, dy: -.06 * lift, sq: .1 - .08 * lift, rot: dir * .1,
      armF: { at: [2.65, -3.0 - .15 * lift] }, armB: { at: [2.25, -3.45 - .15 * lift] }, lookX: i % 2 ? 1 : -.7, turn: .6, leaf: -.3 + .15 * lift };
  }

  // A flat-out run (a pose for any stretch of time): legs pumping, leaning in, leaf streaming, dust; speed > 1.3 adds
  // the wheel of legs. Move x yourself.
  function dash(t, o = {}) {
    const dir = o.dir ?? 1, sp = o.speed ?? 1, c = t * 13 * sp, s = Math.sin(c * Math.PI);
    return { flip: dir < 0, walk: c, stepH: 1.3, rot: dir * .16, dy: -.1 * Math.abs(s), armF: [.3 + .8 * s, 2.0], armB: [.3 - .8 * s, 1.9], leaf: -1.0 + .15 * Math.sin(c * TAU), lookX: 1, turn: .8,
      fx: [{ kind: 'speed', k: .7, dir, len: 5 }, { kind: 'dust', k: 1, dir }, ...(sp > 1.3 ? [{ kind: 'wheel', k: 1 }] : [])] };
  }

  // Teetering on an edge (dir: the drop's side) from t0 to t1: rocking, arms windmilling, a sweat drop.
  function teeter(t, t0, t1, o = {}) {
    const dir = o.dir ?? 1, e = env(t, t0, t1, .15, .25); if (e <= 0) return NONE;
    const tau = t - t0, sway = Math.sin(tau * TAU * 1.3), a = tau * 15;
    return { ...face('eek'), rot: dir * (.06 + .2 * sway) * e, dy: -.05 * Math.abs(sway), armF: [a, 2.1], armB: [Math.PI - a, 2.1], leaf: .7 * Math.sin(tau * 9) * e, lookX: dir, lookY: .6, emote: 'sweat' };
  }

  // Secondary motion: a jelly wobble after any impact (amt scales it).
  function jelly(t, t0, amt = 1) {
    const tau = t - t0; if (tau < 0 || tau > 1.2) return NONE;
    return { sq: .28 * amt * spring(t, t0, 5, 24), rot: .05 * amt * spring(t, t0 + .04, 5, 15) };
  }

  // Slipping on a banana peel: the feet shoot out ahead (dir = the way Pip faces), Pip hangs flat in the air, crashes
  // onto its back, lies seeing stars for `lie` s, and gets up dizzy.
  function slip(t, t0, o = {}) {
    const dir = o.dir ?? 1, lie = o.lie ?? .8, tau = t - t0, A = .16, B = A + .32, C = B + .12, G = C + lie, END = G + .45;
    if (tau < 0 || tau > END) return NONE;
    let th, cy, cx = -dir * .3;
    if (tau < A) { const k = easeOut(tau / A); th = -dir * 1.5 * k; cy = -2.5 - 1.8 * k; cx *= k; }
    else if (tau < B) { th = -dir * 1.5; cy = -4.3 - .25 * Math.sin((tau - A) / (B - A) * Math.PI); }
    else if (tau < C) { th = -dir * 1.5; cy = lerp(-4.3, -1.8, easeIn(seg(tau, B, C))); }
    else if (tau < G) { const q = tau - C; th = -dir * (1.5 + .06 * Math.exp(-6 * q) * Math.sin(14 * q)); cy = -1.8 - .4 * Math.exp(-6 * q) * Math.abs(Math.sin(11 * q)); }
    else { const k = ease(seg(tau, G, END - .05)); th = -dir * 1.5 * (1 - k) + dir * .1 * Math.sin(k * Math.PI); cy = lerp(-1.8, -2.5, k); cx *= 1 - k; }
    const sq = tau > C && tau < G ? .22 * Math.exp(-7 * (tau - C)) : 0;
    const f = tau < C ? face('shock', { eyeS: 1.5, jaw: 1.1 }) : tau < G ? face('ko') : face('dizzy');
    return { ...pivot(th, cx, cy, sq), sq, ...f, armF: [1.5, 2.2], armB: [1.6, 2.1], leaf: tau < C ? .5 : -.3, emote: tau > C ? 'stars' : null, emoteK: popK(seg(tau, C + .1, C + .4)) * (1 - seg(tau, END - .2, END)),
      blink: cut(tau, END - .03, .04), fx: [{ kind: 'puff', at: [cx - dir * 1.5, 0], k: seg(tau, C, C + .6), r: 1.3 }, { kind: 'impact', at: [cx - dir * 3.2, -1], k: seg(tau, C, C + .3), r: 1.1 }] };
  }
  slip.len = o => .6 + (o.lie ?? .8) + .45;

  // Fainting: the back of a hand to the forehead, eyes rolling up, a sway, then a stiff topple backward like a plank
  // (dir = the way Pip faces), a bounce, out cold for `lie` s, then up again, woozy.
  function faint(t, t0, o = {}) {
    const dir = o.dir ?? 1, lie = o.lie ?? 1.2, tau = t - t0, A = .8, B = A + .42, G = B + lie, END = G + .5;
    if (tau < 0 || tau > END) return NONE;
    if (tau < A) return { ...face('sleepy', { brow: [.3, -.02] }), lookY: -1, blink: .2, rot: -dir * .06 * Math.sin(tau * 7) * seg(tau, .2, .5), dy: -.05, armsFront: true, armF: { at: [.25, -4.1] }, armB: [-1.0, 1.6], leaf: -.3 };
    if (tau < B) { const r = -dir * 1.53 * easeIn(seg(tau, A, B)); return { ...face('ko', { tongue: 0 }), rot: r, dy: -1.8 * Math.abs(Math.sin(r)), armF: [-1.3, 1.5], armB: [-1.3, 1.5], leaf: -.2 }; }
    const q = tau - B, up = ease(seg(tau, G, END - .05)), r = -dir * 1.53 * (1 - up) + dir * .1 * Math.sin(up * Math.PI);
    return { ...face(up > 0 ? 'dizzy' : 'ko', up > 0 ? {} : { tongue: .6 }), rot: r, dy: -1.8 * Math.abs(Math.sin(r)) - .4 * Math.exp(-6 * q) * Math.abs(Math.sin(10 * q)), armF: [-1.3 + 1.6 * up, 1.5], armB: [-1.3 + 1.4 * up, 1.5], leaf: -.4 * (1 - up),
      blink: cut(tau, END - .03, .04), fx: [{ kind: 'puff', at: [-dir * 2.6, 0], k: seg(q, 0, .6), r: 1.1 }] };
  }
  faint.len = o => 1.72 + (o.lie ?? 1.2);

  // Knocked flying: launched on an arc dist u away (h u high), spinning `spin` turns about its middle, lands on its
  // feet, bounces and sees stars. Pip stays where it landed (dx = dir * dist holds after the end).
  function knockback(t, t0, o = {}) {
    const dir = o.dir ?? 1, dist = o.dist ?? 10, h = o.h ?? 4, dur = o.dur ?? .75, spin = o.spin ?? 1, tau = t - t0, END = dur + 1.1;
    if (tau < 0) return NONE;
    if (tau > END) return { dx: dir * dist };
    const at = k => pivot(dir * spin * TAU * k, dir * dist * k, -2.5 - h * 4 * k * (1 - k));
    if (tau < dur) {
      const k = seg(tau, 0, dur), p = at(k), tr = [Math.max(0, k - .07), Math.max(0, k - .14)].map(j => { const q = at(j); return [q.dx, q.dy, q.rot]; });
      return { ...p, ...face('shock', { eyeS: 1.4, jaw: .8 }), armF: [1.4, 2.2], armB: [1.3, 2.1], leaf: .4, emote: null, trail: tr, fx: [{ kind: 'impact', at: [0, -3], k: seg(tau, 0, .3), r: 1.4 }] };
    }
    const q = tau - dur;
    return { dx: dir * dist, dy: -.9 * Math.exp(-4 * q) * Math.abs(Math.sin(q * 9)), sq: .3 * Math.exp(-6 * q) * Math.cos(15 * q), ...face(q < .5 ? 'ko' : 'dizzy'),
      emote: 'stars', emoteK: popK(seg(q, .1, .35)) * (1 - seg(tau, END - .2, END)), blink: cut(tau, END - .03, .04), fx: [{ kind: 'puff', at: [dir * dist, 0], k: seg(q, 0, .6), r: 1.2 }] };
  }
  knockback.len = o => (o.dur ?? .75) + 1.1;

  // The fight cloud: a boiling ball of dust with limbs, stars and Pip's leaf poking out, and a pair of eyes now and
  // then. Draw it instead of the fighters; col: the other fighter's colour. k (0..1) pops it in.
  function fightCloud(x, y, r, t, k = 1, key = '', o = {}) {
    const q = popK(k); if (q < .05) return;
    const f = Math.floor(t * 8), R = r * q, other = o.col || '#7FA3CC';
    for (let i = 0; i < 5; i++) {                                     // limbs first, so the cloud covers their roots
      boilSeed('fcl' + key + i);
      const a = hash(f * 5.3 + i * 1.7) * TAU, kind = Math.floor(hash(f * 2.1 + i * 3.3) * 5), bx = x + Math.cos(a) * R * .75, by = y + Math.sin(a) * R * .6, ex = x + Math.cos(a) * R * 1.3, ey = y + Math.sin(a) * R * 1.05;
      if (kind === 0 || kind === 1) { const c = kind ? other : PIPC.pip; paint(ribbon([[bx, by], [ex, ey]], R * .16, R * .13), { wash: c, ink: PAL.ink, sw: 1 }); paint(ellPts(ex, ey, R * .1, R * .1, 10), { wash: c, ink: PAL.ink, sw: .9 }); }
      else if (kind === 2) paint(ellPts(ex, ey, R * .14, R * .08, 12, 0, a), { wash: PIPC.pipDk, ink: PAL.ink, sw: .9 });
      else if (kind === 3) leaf(bx + Math.cos(a) * R * .2, by + Math.sin(a) * R * .2, R * .28, a + Math.PI / 2, key + 'l');
      else paint(starPts(ex, ey, R * .16, .42, 5, a), { wash: PIPC.gold, ink: PAL.ink, sw: .9 });
    }
    boilSeed('fcc' + key + f % 3);
    const P = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, b = 1 + .13 * Math.abs(Math.sin(a * 4 + f)); P.push([x + Math.cos(a) * R * b, y + Math.sin(a) * R * .8 * b]); }
    paint(P, { wash: DUST, fill: '#D8CBB4', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.3 });
    for (let i = 0; i < 3; i++) { const a = hash(f + i * 9) * TAU, d = R * .45 * hash(f * 3 + i); cloud(x + Math.cos(a) * d, y + Math.sin(a) * d * .7, R * .3, 1, '#F2EADC', .8, 3, f + i); }
    if (f % 4 === 1) for (const s of [-1, 1]) { const cx = x + R * .15 * hash(f) + s * R * .1; paint(ellPts(cx, y - R * .1, R * .07, R * .1, 10), { wash: PAL.cream, ink: PAL.ink, sw: .8 }); paint(ellPts(cx, y - R * .08, R * .03, R * .04, 6), { wash: PAL.ink, ink: null }); }
    for (let i = 0; i < 2; i++) { const a = hash(f * 7 + i) * TAU; FX.impact({ head: [x + Math.cos(a) * R * .9, y + Math.sin(a) * R * .7], u: R / 5, mid: [x, y], x0: x, y }, { k: frac(t * 4 + i * .5), at: 'head', r: 1 }); }
  }

  const GAGS = { wildTake, doubleTake, headShake, zip, skid, flatten, wallSplat, spinOut, spinY, bonk, blast, hangtime, gulp, sneeze, shakeDry, slip, faint, knockback };
  const dur = (name, o = {}) => GAGS[name] && GAGS[name].len ? GAGS[name].len(o) : 0;

  return { pip: draw, mix, hand, head, mouth, geo, pivot, hitStop, leaf, tinted, TINT, FX, NONE, face, dur,
    ...GAGS, shiver, dripping, sneak, dash, teeter, jelly, fightCloud };
})();

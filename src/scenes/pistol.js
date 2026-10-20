// pistol.js: "Pip讲枪虾", about 185 s. A hot open (Pip, recording the reef with a hydrophone, holds it up to a tiny
// shrimp and is blasted by its snap), then how the pistol shrimp hunts: the claw is a gun, and the bullet is a bubble.
// The claw cocks and latches, slams shut in about a millisecond, and its plunger squirts a jet; fast water is low
// pressure, low pressure boils the sea at room temperature, and the cavitation bubble collapses: the bang, a flash,
// thousands of degrees, and the shockwave that stuns the prey. See storyboards/pistol.md.
// Zinc (src/scenes/zinc.js) is the standard for structure, pace and gags. Every gag acts out a step.
// Props from mrna_kit.js (MK); helpers copied from zinc.js, copper.js and selenium.js say so.
// Every time is tied to a voice line: L(i, d) = line i's start + d seconds.
(() => {
  const K = MK;
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;
  const S = {
    // the shrimp
    body: '#EF9670', bodyDk: '#B0563A', bodyLt: '#F9D2B8', claw: '#E2694A', clawDk: '#9E3E28', clawLt: '#F7B98E', eye: '#3A2430',
    // water, bubble, shock, light
    jet: '#F4F1E6', bub: '#DCE9F1', bubDk: '#5E7C93', shock: '#FFF7E4', flashC: '#9FEFFF', heat: '#FFB463',
    // worlds
    reef: '#2F8E9C', reefBlob: '#45A5AF', reefDk: '#1F6B7C', sand: '#E8D4A2', sandDk: '#C9AE78', rock: '#7B6E88', rockDk: '#5A4F68',
    coralP: '#E98FA2', coralO: '#F2A35E', fan: '#9C7BC4', weed: '#5FA678',
    tank: '#CFEBE6', tankBlob: '#E2F4F0', deep: '#173763', deepBlob: '#22487A',
    fish: '#F2C14E', fishDk: '#B88A22', phones: '#3E3A48', phonesDk: '#26232E', cable: '#2E2A35', red: '#D2424A'
  };
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));
  const pulseK = (t, a, len = .7) => t > a && t < a + len ? Math.sin(seg(t, a, a + len) * Math.PI) : 0;
  const on = (t, a, b, fi = .3, fo = .3) => Math.min(ease(seg(t, a, a + fi)), 1 - ease(seg(t, b - fo, b)));   // 0→1 at a, 1→0 at b
  const popK = k => k <= 0 ? 0 : backOut(clamp(k));                 // a pop-in scale; callers skip drawing while it is < .05
  const rotEll = (x, y, rx, ry, n, rot) => { const c = Math.cos(rot), s = Math.sin(rot); return ellPts(0, 0, rx, ry, n).map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]); };
  const ring = (x, y, r, col, sw, key) => { if (r < 2) return; boilSeed('rg' + key); paint(ellPts(x, y, r, r, Math.max(16, Math.round(r / 6))), { wash: null, ink: col, sw }); };

  // ---------- small effects (from zinc.js) ----------
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

  // ---------- the shrimp ----------
  // Side view, facing left (o.flip faces right); (x, y) = the ground under its legs; about 560 px long at s = 1 with the
  // claw. o: open (0 shut .. 1 cocked: the dactyl swung up), ant (antenna sway), feel ([wx, wy]: one antenna reaches
  // there), walk (a leg phase), tail (a flick). The big claw is about half the body's length, as in Alpheus.
  // Returns world points: tip (the claw's mouth, where the jet leaves), hinge, head.
  const HINGE = [-352, -106];
  const rotAbout = (c, a) => { const ca = Math.cos(a), sa = Math.sin(a); return ([px, py]) => [c[0] + (px - c[0]) * ca - (py - c[1]) * sa, c[1] + (px - c[0]) * sa + (py - c[1]) * ca]; };
  function shrimp(x, y, s, t, key, o = {}) {
    const dir = o.flip ? -1 : 1, open = o.open || 0, wk = o.walk || 0;
    const W_ = (lx, ly) => [x + lx * s * dir, y + ly * s];
    const P = pts => pts.map(([a, b]) => W_(a, b));
    auditBox('shrimp', key, x - 440 * s, y - 130 * s, x + 310 * s, y + 4);
    boilSeed('sh' + key);
    // the far antennae and legs, behind the body
    const sway = o.ant ?? 1;
    const whip = (k, len, lift) => { const Q = []; for (let i = 0; i <= 8; i++) { const q = i / 8, w = sway * 18 * q * q * Math.sin(t * 2.2 + k * 1.7 - q * 3); Q.push([-170 - len * q, -98 - lift * Math.sin(q * 2.2) + w]); } return Q; };
    inkLine(P(whip(1, 300, 70)), 1.3 * s, S.bodyDk, 'inkfine', .6);
    for (let i = 0; i < 4; i++) { const lx = -112 + i * 30 + 8, ph = Math.sin(wk * TAU + i * 1.6 + 1); inkLine(P([[lx, -44], [lx - 6, -22], [lx - 14 + 6 * ph, 0]]), 2.0 * s, S.bodyDk, 'ink', .3); }
    // the small claw (the far side): slender
    const Rs = rotAbout([-146, -50], (o.small || 0) * .7);
    paint(P([[-146, -56], [-204, -50], [-248, -44], [-252, -38], [-204, -38], [-146, -44]].map(Rs)), { wash: S.bodyDk, ink: PAL.ink, sw: .8 * s, curv: .4 });
    // the abdomen, its segments, the swimmerets, the tail fan
    const tf = (o.tail || 0) * 14;
    const top = [[20, -118], [64, -112], [108, -104], [152, -94], [196, -82], [240, -70]], bot = [[240, -46], [196, -42], [152, -40], [108, -38], [64, -38], [20, -40]];
    for (let i = 0; i < 5; i++) { const bx = 34 + i * 44; inkLine(P([[bx, -40], [bx - 4, -26], [bx + 8, -22]]), 1.4 * s, S.bodyDk, 'inkfine', .5); }
    paint(P([[236, -72], [296, -98 - tf], [318, -62], [296, -26 + tf], [236, -46]]), { wash: S.bodyLt, fill: S.body, fillOp: 60, ink: PAL.ink, sw: 1 * s, curv: .5 });
    inkLine(P([[240, -58], [312, -62]]), .8 * s, S.bodyDk, 'inkfine', .2);
    paint(P([...top, ...bot]), { wash: S.body, ink: PAL.ink, sw: 1.1 * s, curv: .5 });
    paint(P([[24, -64], [100, -60], [200, -56], [236, -54], [200, -44], [100, -42], [24, -44]]), { wash: S.bodyLt, ink: null, curv: .5 });
    for (let i = 1; i < 5; i++) inkLine(P([top[i], [top[i][0] - 6, (top[i][1] + bot[5 - i][1]) / 2], bot[5 - i]]), .9 * s, S.bodyDk, 'inkfine', .5);
    // the carapace, with its hood over the eyes
    paint(P([[-178, -88], [-150, -114], [-60, -124], [20, -114], [34, -80], [20, -42], [-60, -38], [-150, -48], [-170, -68]]), { wash: S.body, ink: PAL.ink, sw: 1.2 * s, curv: .55 });
    paint(P([[-140, -62], [-60, -54], [10, -58], [-60, -44], [-140, -50]]), { wash: S.bodyLt, ink: null, curv: .5 });
    const ey = W_(-148, -92);
    paint(ellPts(ey[0], ey[1], 8 * s, 8 * s, 10), { wash: S.eye, ink: null });
    paint(ellPts(ey[0] - 4 * s * dir, ey[1] - 4 * s, 22 * s, 16 * s, 14), { wash: S.bodyLt, washOp: 90, ink: PAL.ink, sw: .7 * s });
    // the big claw: the arm, the palm, the fixed finger with its socket, the dactyl with its plunger on the hinge
    const R = rotAbout([-136, -58], (o.raise || 0) * .45);
    if (o.hi > .02) { const c = W_(...R([-290, -70])); glow(c[0], c[1], 160 * s, '#FFE9A8', .6 * o.hi); }
    paint(ribbon(P([[-136, -58], [-170, -64], [-200, -66]].map(R)), 24 * s, 18 * s), { wash: S.clawDk, ink: PAL.ink, sw: .9 * s });
    paint(P(rotEll(-278, -70, 94, 58, 26, -.1).map(R)), { wash: S.claw, ink: PAL.ink, sw: 1.4 * s });
    paint(P(rotEll(-262, -50, 62, 18, 14, -.1).map(R)), { wash: S.clawLt, ink: null });
    paint(P([[-352, -82], [-392, -68], [-426, -50], [-416, -40], [-354, -44]].map(R)), { wash: S.claw, ink: PAL.ink, sw: 1.2 * s, curv: .3 });
    paint(P([[-366, -80], [-380, -72], [-364, -69]].map(R)), { wash: S.clawDk, ink: null });          // the socket
    const a = open * 1.25, ca = Math.cos(a), sa = Math.sin(a), D = ([px, py]) => [HINGE[0] + px * ca - py * sa, HINGE[1] + px * sa + py * ca];
    paint(P([[0, -8], [-34, -2], [-70, 40], [-78, 52], [-46, 36], [-6, 22]].map(D).map(R)), { wash: S.claw, ink: PAL.ink, sw: 1.2 * s, curv: .3 });
    paint(P([[-18, 18], [-26, 30], [-12, 28]].map(D).map(R)), { wash: S.clawDk, ink: PAL.ink, sw: .6 * s });                     // the plunger
    paint(P([[-56, 34], [-78, 52], [-64, 42]].map(D).map(R)), { wash: S.clawLt, ink: null });
    paint(P([[-412, -48], [-426, -50], [-418, -42]].map(R)), { wash: S.clawLt, ink: null });
    // the near legs and antennae
    for (let i = 0; i < 4; i++) { const lx = -112 + i * 30, ph = Math.sin(wk * TAU + i * 1.6); inkLine(P([[lx, -44], [lx - 8, -20], [lx - 18 + 6 * ph, 0]]), 2.4 * s, S.bodyDk, 'ink', .3); }
    let near_ = whip(0, 360, 110);
    if (o.feel) { const f = o.feel, Q = []; const st = W_(-170, -98); for (let i = 0; i <= 8; i++) { const q = i / 8; Q.push([lerp(st[0], f[0], q) + 30 * Math.sin(q * Math.PI) * dir, lerp(st[1], f[1], q) - 60 * Math.sin(q * Math.PI)]); } inkLine(Q, 1.6 * s, S.bodyDk, 'inkfine', .6); }
    else inkLine(P(near_), 1.6 * s, S.bodyDk, 'inkfine', .6);
    inkLine(P([[-172, -94], [-222, -122], [-256, -118]]), 1.4 * s, S.bodyDk, 'inkfine', .5);
    inkLine(P([[-172, -94], [-226, -110], [-262, -100]]), 1.4 * s, S.bodyDk, 'inkfine', .5);
    return { tip: W_(...R([-424, -54])), hinge: W_(...R(HINGE)), head: W_(-160, -96), palm: W_(...R([-278, -70])), back: W_(...R([-190, -70])), tail: W_(312, -62) };
  }

  // ---------- the bubble, the jet, the shock, the flash ----------
  function bubble(x, y, r, key, o = {}) {                           // a silver cavitation bubble; o.hot (0..1) glows it from inside
    if (r > 6) auditBox('bubble', key, x - r, y - r, x + r, y + r, true);                      // followed across cuts (the seam check)
    if (r < 2) return;
    if (o.hot > .02) glow(x, y, r * 3.2, S.heat, .8 * o.hot);
    boilSeed('bb' + key);
    paint(ellPts(x, y, r, r * (o.sq ? 1 - o.sq : 1), 24), { wash: mixCol(S.bub, '#FFE2B0', o.hot || 0), washOp: 210, ink: S.bubDk, sw: clamp(r / 40, .6, 1.4) });
    paint(ellPts(x - r * .35, y - r * .38, r * .3, r * .18, 10, 0, -.6), { wash: PAL.cream, ink: null });
    paint(ellPts(x + r * .3, y + r * .34, r * .14, r * .08, 8, 0, -.6), { wash: '#F3F8FB', ink: null });
  }
  function shockRings(x, y, k, key, R = 420, n = 3, col = S.shock) {  // expanding rings off a collapse; k 0..1
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < n; i++) { const q = k - i * .12; if (q <= 0) continue; ring(x, y, R * easeOut(q), col, 4 * (1 - q) + .5, key + i); }
  }
  function flashAt(x, y, k, s = 1) {                                // the collapse's flash: cyan-white light
    if (k <= .01) return;
    glow(x, y, 220 * s, S.flashC, .9 * k); glow(x, y, 90 * s, '#FFFFFF', k);
  }
  function jet(x, y, dir, len, k, key, s = 1, t = 0) {             // the squirt out of the claw's mouth: a pale stream and running speed lines
    if (k <= .02) return;
    const l = len * k, w0 = 10 * s, w1 = 34 * s;
    boilSeed('jt' + key);
    paint([[x, y - w0], [x - dir * l * .55, y - w1 * .8], [x - dir * l, y - w1], [x - dir * l * 1.02, y], [x - dir * l, y + w1], [x - dir * l * .55, y + w1 * .8], [x, y + w0]], { wash: S.jet, washOp: 95, ink: null, curv: .5 });
    for (let i = 0; i < 4; i++) { boilSeed('jt' + key + i); const off = (i - 1.5) * 9 * s, ph = frac(t * 2.4 + hash(i + 2)), a = l * (.05 + .55 * ph), b = Math.min(l, a + l * (.25 + .15 * hash(i)));
      inkLine([[x - dir * a, y + off * (1 + a / l)], [x - dir * b, y + off * (1 + b / l)]], 1.5 * s, PAL.cream, 'ink', 0); }
  }

  // ---------- worlds ----------
  function reef(t, key, o = {}) {                                   // the reef: turquoise water, light from above, sand, rocks and coral
    const warm = o.warm || 0;
    K.wash(mixCol(S.reef, '#3E9AA0', .6 * warm), t, { key, blob: mixCol(S.reefBlob, '#F2C48E', .45 * warm), n: 3 });
    for (let i = 0; i < 4; i++) { boilSeed(key + 'ray' + i); const x0 = 200 + i * 460 + 40 * Math.sin(t * .3 + i); paint([[x0, -300], [x0 + 120, -300], [x0 + 420, 900], [x0 + 200, 900]], { wash: mixCol('#7FD0D2', '#FFD08A', warm), washOp: 40 + 45 * warm, ink: null }); }
    K.motes(t, 14, mixCol('#8FD3D6', '#FFE2B8', warm), { key: key + 'm', dir: -1 });
    boilSeed(key + 'sand'); paint(rectPts(-1600, 860, W + 3200, 700), { wash: mixCol(S.sand, '#F2C27E', .5 * warm), fill: S.sandDk, fillOp: 40, tex: .5, ink: null });
    inkLine([[-400, 862], [W + 400, 858]], 1.2, S.sandDk, 'ink', .2);
    for (let i = 0; i < 9; i++) { boilSeed(key + 'pb' + i); paint(ellPts(80 + i * 230 + 60 * hash(i), 900 + 60 * hash(i + 3), 14 + 10 * hash(i + 5), 7, 8), { wash: S.sandDk, ink: null }); }
  }
  function rock(x, y, w, h, key, o = {}) {                          // a rock with a crevice (the burrow) and a little coral
    if (o.hole) auditBox('burrow', key, x - w / 2, y - h, x + w / 2, y, true);
    boilSeed('rk' + key);
    paint([[x - w / 2, y], [x - w * .45, y - h * .7], [x - w * .2, y - h], [x + w * .25, y - h * .92], [x + w / 2, y - h * .5], [x + w / 2, y]], { wash: S.rock, fill: S.rockDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.2, curv: .5 });
    if (o.hole) paint(ellPts(o.hole[0], o.hole[1], o.hole[2], o.hole[2] * .62, 18), { wash: '#2B2333', ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 3; i++) { const cx = x - w * .3 + i * w * .3, cy = y - h * (.85 + .12 * Math.sin(i * 2)); paint(ellPts(cx, cy, 30, 22, 12), { wash: [S.coralP, S.coralO, S.fan][i], ink: PAL.ink, sw: .8 }); }
  }
  function weed(x, y, h, t, key, col = S.weed) {                    // a swaying blade of sea grass
    boilSeed('wd' + key); const P = []; for (let i = 0; i <= 6; i++) { const q = i / 6; P.push([x + 26 * q * q * Math.sin(t * 1.1 + x * .01), y - h * q]); }
    paint(ribbon(P, 14, 3), { wash: col, ink: PAL.ink, sw: .7 });
  }
  function deep(t, key, col = S.deep) { K.wash(col, t, { key, blob: S.deepBlob, n: 3 }); K.motes(t, 12, mixCol(col, '#7FA6D8', .35), { key: key + 'm' }); }
  function tank(t, key) { K.wash(S.tank, t, { key, blob: S.tankBlob, n: 4 }); K.motes(t, 10, '#B6DDD6', { key: key + 'm' }); }
  function board(t, key, col = '#F5EEDD') { K.wash(col, t, { key, blob: '#FBF6EA', n: 4 }); K.motes(t, 8, mixCol(col, PAL.ink, .12), { key: key + 'm' }); }

  // ---------- Pip's kit ----------
  // big headphones on Pip's head (the running gag); o as passed to TOON.pip. smoke 0..1 after the blast; off 0..1 knocked up
  function headphones(x, y, u, o, key, fx = {}) {
    const g = TOON.geo(x, y, u, o), lift = (fx.off || 0) * 2.4;
    const cupL = g.loc(-1.95, -3.2 - lift), cupR = g.loc(1.95, -3.2 - lift), top = g.loc(0, -5.6 - lift);
    boilSeed('hp' + key);
    paint(ribbon([cupL, g.loc(-1.75, -4.9 - lift), top, g.loc(1.75, -4.9 - lift), cupR], .2 * u, .2 * u), { wash: S.phones, ink: PAL.ink, sw: .8 });
    for (const c of [cupL, cupR]) { paint(ellPts(c[0], c[1], .48 * u, .7 * u, 14, 0, g.rot), { wash: S.phones, fill: S.phonesDk, fillOp: 60, ink: PAL.ink, sw: .9 }); paint(ellPts(c[0], c[1], .22 * u, .38 * u, 10, 0, g.rot), { wash: S.red, ink: null }); }
    if (fx.smoke) for (let i = 0; i < 2; i++) { const c = i ? cupR : cupL; puff(c[0] + 8 * i, c[1] - .9 * u - 30 * fx.smoke, .5 * u + 10 * fx.smoke, .9, key + 'sm' + i, '#8D8794'); }
    return { cupL, cupR };
  }
  // the hydrophone: a microphone on a pole, held at h (Pip's hand), pointing along ang; a cable back to the cups
  function hydrophone(h, ang, len, key, o = {}) {
    boilSeed('hy' + key);
    const end = [h[0] + Math.cos(ang) * len, h[1] + Math.sin(ang) * len], bent = o.bent || 0;
    const tip = bent > 0 ? [end[0] + Math.cos(ang - 1.4 * bent) * 50, end[1] + Math.sin(ang - 1.4 * bent) * 50] : [end[0] + Math.cos(ang) * 50, end[1] + Math.sin(ang) * 50];
    auditBox('mic', key, tip[0] - 26, tip[1] - 26, tip[0] + 26, tip[1] + 26, true);
    paint(ribbon([[h[0] - Math.cos(ang) * 30, h[1] - Math.sin(ang) * 30], end, tip], 10, 8), { wash: '#B59A74', ink: PAL.ink, sw: .7 });
    paint(rotEll(tip[0], tip[1], 26, 18, 14, ang - 1.4 * bent), { wash: '#5B6170', fill: '#3A3F4C', fillOp: 50, ink: PAL.ink, sw: 1 });
    for (let i = -1; i <= 1; i++) inkLine([[tip[0] + Math.cos(ang + 1.57) * 12 * i - Math.cos(ang) * 10, tip[1] + Math.sin(ang + 1.57) * 12 * i - Math.sin(ang) * 10], [tip[0] + Math.cos(ang + 1.57) * 12 * i + Math.cos(ang) * 10, tip[1] + Math.sin(ang + 1.57) * 12 * i + Math.sin(ang) * 10]], .8, '#9BA2B2', 'inkfine', 0);
    if (o.cable) { boilSeed('hyc' + key); inkLine(through([h, [h[0] - 30, h[1] + 70], [o.cable[0] - 40, o.cable[1] + 90], o.cable]), 1.8, S.cable, 'ink', .5); }
    return tip;
  }

  // ---------- the big claw, cut away (the gun) ----------
  // Facing left; (x, y) = the palm's centre; about 1000 px wide at s = 1. open 0..1 swings the dactyl up about the hinge;
  // o: tense (0..1, the closer muscle loaded), latch (0..1, the catch engaged), hiP / hiS (highlight the plunger / socket),
  // water (0..1, the socket full of water). Returns world points: hinge, plunger, socket, mouth (where the jet leaves).
  function clawBig(x, y, s, open, key, o = {}) {
    const W_ = (lx, ly) => [x + lx * s, y + ly * s], P = pts => pts.map(([a, b]) => W_(a, b));
    const Hg = [-240, -60], a = open * 1.1, ca = Math.cos(a), sa = Math.sin(a), D = ([px, py]) => [Hg[0] + px * ca - py * sa, Hg[1] + px * sa + py * ca];
    auditBox('claw', key, x - 600 * s, y - 330 * s, x + 440 * s, y + 200 * s);
    boilSeed('cb' + key);
    paint(ribbon(P([[440, -10], [340, 0], [250, 8]]), 130 * s, 110 * s), { wash: S.clawDk, ink: PAL.ink, sw: 1.4 });
    paint(P(rotEll(0, 0, 300, 172, 40, -.05)), { wash: S.claw, ink: PAL.ink, sw: 1.8 });
    paint(P(rotEll(20, 12, 236, 118, 34, -.05)), { wash: mixCol(S.clawLt, PAL.cream, .35), ink: S.clawDk, sw: 1 });   // the cutaway window
    // the closer muscle: a striated band from the back of the palm to a tendon on the dactyl's base; it bulges when loaded
    const tz = o.tense || 0, qv = tz * Math.sin(x + y + 60 * (o.t || 0)) * 3;
    const M = P([[190, 30 + qv], [60, 10 - 6 * tz], [-90, -14 - 10 * tz], [-170, -40]]);
    paint(ribbon(M, (70 + 34 * tz) * s, 36 * s), { wash: mixCol('#D4626A', '#B8343F', tz), ink: PAL.ink, sw: 1.1 });
    for (let i = 1; i < 8; i++) { const q = i / 8, p = M[0].map((v, j) => v + (M[3][j] - v) * q); inkLine([[p[0] - 6 * s, p[1] - (30 + 14 * tz) * s * (1 - q * .5)], [p[0] + 6 * s, p[1] + (30 + 14 * tz) * s * (1 - q * .5)]], .8, '#8E2A33', 'inkfine', .2); }
    inkLine([M[3], W_(...D([-14, 22]))], 4, PAL.cream, 'ink', .2);                                   // the tendon
    if (o.spring !== undefined) {                                   // the spring the muscle loads (a metaphor, drawn literally): squeezed by spring 0..1
      const sx1 = 196, sx0 = sx1 - lerp(330, 170, ease(clamp(o.spring))), n = 9, Z = [];
      for (let i = 0; i <= n * 2; i++) Z.push(W_(lerp(sx0, sx1, i / (n * 2)), 78 + (i % 2 ? -26 : 26) * (i === 0 || i === n * 2 ? 0 : 1)));
      boilSeed('cbs' + key); inkLine(Z, 3.2, '#7E8796', 'ink', .1);
      paint(P([[sx0 - 10, 46], [sx0, 46], [sx0, 110], [sx0 - 10, 110]]), { wash: '#7E8796', ink: PAL.ink, sw: .8 });
    }
    // the fixed finger and its socket
    paint(P([[-250, 2], [-420, 30], [-566, 84], [-560, 120], [-420, 124], [-262, 118]]), { wash: S.claw, ink: PAL.ink, sw: 1.6, curv: .35 });
    const so = W_(-364, 52), hiS = o.hiS || 0;
    if (hiS > .02) glow(so[0], so[1], 110 * s, '#FFE9A8', .7 * hiS);
    paint(ellPts(so[0], so[1], 40 * s, 24 * s, 16), { wash: o.water ? mixCol('#7A2E1E', '#6FB2E3', o.water) : '#7A2E1E', ink: PAL.ink, sw: 1 });
    // the dactyl, with the plunger on its underside
    const dk = [[0, -30], [-170, -22], [-300, 112], [-332, 156], [-250, 110], [-150, 74], [-20, 40]].map(D);
    paint(P(dk), { wash: S.claw, ink: PAL.ink, sw: 1.6, curv: .3 });
    paint(P([[-60, -16], [-190, -2], [-280, 100], [-200, 60], [-60, 20]].map(D)), { wash: mixCol(S.claw, S.clawLt, .5), ink: null, curv: .3 });
    const hiP = o.hiP || 0, pc = W_(...D([-122, 92]));
    if (hiP > .02) glow(pc[0], pc[1], 110 * s, '#FFE9A8', .7 * hiP);
    paint(P([[-98, 58], [-146, 70], [-150, 112], [-108, 104]].map(D)), { wash: S.clawDk, ink: PAL.ink, sw: 1.2, curv: .4 });
    // the hinge and the latch: a little hook that catches when cocked
    const hg = W_(...Hg); paint(ellPts(hg[0], hg[1], 22 * s, 22 * s, 14), { wash: S.clawDk, ink: PAL.ink, sw: 1.2 });
    const lt = o.latch || 0;
    if (lt > .02) { boilSeed('cbl' + key); const L0 = W_(-196, -96), L1 = W_(-210, -128), L2 = W_(-236, -122); inkLine([L0, L1, L2], 5 * s * lt + 1, '#5A2418', 'ink', .4); }
    return { hinge: hg, plunger: pc, socket: so, mouth: W_(-470, 70) };
  }

  // ---------- the cast and the gag props ----------
  function fish(x, y, s, t, key, o = {}) {                          // a small yellow fish (dot eye); o.ko (X eyes, belly up), o.flip faces right
    auditBox('fish', key, x - 60 * s, y - 30 * s, x + 60 * s, y + 30 * s, true);
    const dir = o.flip ? -1 : 1, up = o.ko ? 1 : 0, wig = o.ko ? 0 : Math.sin(t * 9) * .25;
    boilSeed('fs' + key); push(); translate(x, y); rotate(o.rot || 0); scale(s * dir, s * (up ? -1 : 1));
    paint([[50, 0], [92, -26 + 14 * wig], [86, 0], [92, 26 + 14 * wig]], { wash: S.fishDk, ink: PAL.ink, sw: 1 });
    paint(ellPts(0, 0, 62, 28, 20), { wash: S.fish, ink: PAL.ink, sw: 1.1 });
    paint([[-6, -26], [24, -40], [34, -22]], { wash: S.fishDk, ink: PAL.ink, sw: .8 });
    inkLine([[10, -22], [8, 22]], 3, '#E59A3A', 'ink', .3);
    if (o.ko) { inkLine([[-42, -12], [-30, 0]], 1.6, PAL.ink, 'ink', 0); inkLine([[-42, 0], [-30, -12]], 1.6, PAL.ink, 'ink', 0); }
    else { paint(ellPts(-36, -6, 7, 7, 10), { wash: PAL.cream, ink: PAL.ink, sw: .7 }); paint(ellPts(-38, -6, 3.5, 3.5, 8), { wash: PAL.ink, ink: null }); }
    pop();
  }
  function earmuffs(x, y, u, o, key) {                              // fluffy cream earmuffs (the ending: ready this time)
    const g = TOON.geo(x, y, u, o), cl = g.loc(-1.95, -3.2), cr = g.loc(1.95, -3.2), top = g.loc(0, -5.5);
    boilSeed('em' + key);
    paint(ribbon([cl, g.loc(-1.75, -4.9), top, g.loc(1.75, -4.9), cr], .16 * u, .16 * u), { wash: '#C9A06A', ink: PAL.ink, sw: .7 });
    for (const c of [cl, cr]) paint(starPts(c[0], c[1], .78 * u, .62, 10, .2), { wash: '#FBF1DE', ink: PAL.ink, sw: .8, curv: .8 });
  }
  function goggles(x, y, u, o, key) {                               // swim goggles over Pip's eyes (zinc.js's ending)
    const g = TOON.geo(x, y, u, o); boilSeed('gg' + key);
    inkLine([g.loc(-1.85, -3.35), g.loc(1.85, -3.35)], .1 * u, '#3E6C8A', 'ink', 0);
    for (const e of g.eyes) paint(ellPts(e[0], e[1], .55 * u, .5 * u, 12), { wash: '#BFE3F2', washOp: 170, ink: PAL.ink, sw: 1.4 });
  }
  // a marshmallow: a puffy cylinder seen side-on along ang, its end face toward +ang. o.toast 0..1 browns it, o.char 0..1
  // blackens its front end, o.bite 0..1 is how much is eaten (three bites from the front, white inside)
  function mallow(x, y, ang, key, o = {}) {
    const toast = o.toast || 0, ch = o.char || 0, bite = o.bite || 0; if (bite > .97) return;
    auditBox('marshmallow', key, x - 40, y - 40, x + 40, y + 40, true);
    boilSeed('ml' + key);
    const r = 32, len = 66 * (1 - .85 * bite), ca = Math.cos(ang), sa = Math.sin(ang), Lp = (u, v) => [x + u * ca - v * sa, y + u * sa + v * ca];
    const P = [];
    for (let i = 0; i <= 8; i++) { const a = Math.PI / 2 + Math.PI * i / 8; P.push(Lp(-len / 2 + .3 * r * Math.cos(a), r * Math.sin(a))); }   // the back end, rounded
    for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + Math.PI * i / 8, v = r * Math.sin(a);                                           // the front: rounded, or bitten into scallops
      P.push(bite > .01 ? Lp(len / 2 - .28 * r * Math.abs(Math.sin(Math.PI * 1.5 * (v / r + 1))), v) : Lp(len / 2 + .3 * r * Math.cos(a), v)); }
    paint(P, { wash: mixCol('#FFFCF5', '#D48A3C', toast), fill: mixCol('#E9DFD3', '#A8652C', toast), fillOp: 45, tex: .25, ink: PAL.ink, sw: 1, curv: .2 });
    paint(rotEll(...Lp(-len * .05, -r * .55), len * .36, r * .13, 12, ang), { wash: mixCol('#FFFFFF', '#F6D39A', toast), ink: null });   // the soft highlight
    if (bite > .01) { paint(rotEll(...Lp(len / 2 - .14 * r, 0), .2 * r, .78 * r, 14, ang), { wash: '#FFFDF8', ink: null }); return; }
    if (ch > .02) paint([Lp(len * .18, -r), Lp(len / 2, -r), Lp(len / 2 + .3 * r, 0), Lp(len / 2, r), Lp(len * .24, r), Lp(len * .32, r * .45), Lp(len * .16, 0), Lp(len * .3, -r * .5)], { wash: '#4A3128', washOp: 170 * ch, ink: null, curv: .3 });
    paint(rotEll(...Lp(len / 2, 0), .28 * r, .94 * r, 16, ang), { wash: mixCol(mixCol('#FFFFFF', '#E39A4C', toast), '#2E1F1A', ch), ink: mixCol('#C9BBAE', '#6E4630', toast), sw: .6 });   // the end face, softly edged
    if (toast < .5) for (let i = 0; i < 3; i++) paint(ellPts(...Lp(-len * .3 + i * len * .22, r * (.1 + .25 * hash(i))), 1.6, 1.6, 6), { wash: '#FFFFFF', ink: null });   // powder
  }
  function toastStick(h, ang, len, key) { boilSeed('ts' + key); const e = [h[0] + Math.cos(ang) * len, h[1] + Math.sin(ang) * len]; paint(ribbon([h, e], 6, 3), { wash: '#A87A4E', ink: PAL.ink, sw: .6 }); return e; }
  function marshmallow(h, ang, key, o = {}) {                       // a toasting stick with a marshmallow on its end; returns the marshmallow's centre
    const e = toastStick(h, ang, 110, key), m = [e[0] + Math.cos(ang) * 30, e[1] + Math.sin(ang) * 30];
    mallow(m[0], m[1], ang, key, o); return m;
  }
  const mitt = (h, key) => { boilSeed('mt' + key); paint(ellPts(h[0], h[1], 20, 16, 12), { wash: '#C8323C', ink: PAL.ink, sw: .9 }); };   // an oven mitt
  function jar(x, y, s, key, o = {}) {                              // a glass jar, lid up; o.shatter 0..1 throws the shards out
    if (!o.shatter) auditBox('jar', key, x - 90 * s, y - 120 * s, x + 90 * s, y + 90 * s, true);
    boilSeed('jr' + key); const k = o.shatter || 0;
    if (k <= 0) {
      paint(rrPts(x - 70 * s, y - 90 * s, 140 * s, 180 * s, 30 * s), { wash: '#DDEFF5', washOp: 110, ink: PAL.ink, sw: 1.3 });
      paint(rrPts(x - 76 * s, y - 112 * s, 152 * s, 28 * s, 8 * s), { wash: '#C9A06A', ink: PAL.ink, sw: 1.1 });
      inkLine([[x - 44 * s, y - 70 * s], [x - 50 * s, y + 40 * s]], 3, PAL.cream, 'ink', .2);
      return;
    }
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .3, d = 260 * easeOut(k), sp = (i % 2 ? 1 : -1) * 4 * k;
      const c = [x + Math.cos(a) * d, y + Math.sin(a) * d + 200 * k * k];
      paint(starPts(c[0], c[1], 30 * s * (1 - .5 * k), .4, 3, a + sp), { wash: '#DDEFF5', washOp: 150 * (1 - k), ink: PAL.ink, sw: .8 }); }
  }
  function thermometer(x, y, s, level, key) {                       // a glass thermometer, no numbers; level 0..1
    auditBox('thermometer', key, x - 30 * s, y - 300 * s, x + 30 * s, y + 20 * s, true);
    boilSeed('th' + key);
    paint(rrPts(x - 14 * s, y - 260 * s, 28 * s, 260 * s, 14 * s), { wash: '#F3F7F8', ink: PAL.ink, sw: 1.1 });
    paint(ellPts(x, y + 10 * s, 26 * s, 26 * s, 14), { wash: S.red, ink: PAL.ink, sw: 1.1 });
    const h = 20 + 220 * clamp(level); paint(rrPts(x - 6 * s, y - h * s, 12 * s, h * s, 6 * s), { wash: S.red, ink: null });
    for (let i = 1; i < 6; i++) inkLine([[x + 14 * s, y - 40 * i * s], [x + 24 * s, y - 40 * i * s]], 1, PAL.ink, 'inkfine', 0);
  }
  // a pressure gauge, no numbers: a blue (low) → green → red (high) arc and a needle; v 0 (low) .. 1 (high)
  function gauge(x, y, r, v, key) {
    auditBox('gauge', key, x - r, y - r, x + r, y + r, true);
    boilSeed('ga' + key);
    paint(ellPts(x, y, r, r, 28), { wash: '#F7F1E4', ink: PAL.ink, sw: 1.4 });
    const A = q => Math.PI * (1.15 - 1.3 * q) * -1;                     // q 0 → lower left, 1 → lower right, via the top
    const cols = ['#4F86C8', '#7FB7A0', '#9CCB8A', '#E8B64E', '#D2424A'];
    for (let i = 0; i < 5; i++) { const P = []; for (let j = 0; j <= 6; j++) { const a = A((i + j / 6) / 5); P.push([x + Math.cos(a) * r * .74, y + Math.sin(a) * r * .74]); } paint(ribbon(P, r * .16, r * .16), { wash: cols[i], ink: null }); }
    const a = A(clamp(v)); inkLine([[x, y], [x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8]], 3.2, PAL.ink, 'ink', 0);
    paint(ellPts(x, y, r * .1, r * .1, 10), { wash: PAL.ink, ink: null });
  }
  function sun(x, y, r, t, key) {                                   // a painted sun, for the comparison
    auditBox('sun', key, x - r, y - r, x + r, y + r, true);
    glow(x, y, r * 3, '#FFC46A', .7);
    boilSeed('sn' + key);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .2; inkLine([[x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 1.15], [x + Math.cos(a) * r * 1.45, y + Math.sin(a) * r * 1.45]], 3, '#F2A33A', 'ink', 0); }
    paint(ellPts(x, y, r, r, 26), { wash: '#FFD36E', fill: '#F7B04A', fillOp: 60, ink: PAL.ink, sw: 1.2 });
  }
  function sub(x, y, s, key) {                                      // a WWII submarine in silhouette, facing right
    auditBox('sub', key, x - 300 * s, y - 80 * s, x + 300 * s, y + 60 * s, true);
    boilSeed('sb' + key);
    paint(P_(x, y, s, [[-260, 0], [-200, -40], [220, -40], [280, 0], [220, 40], [-200, 40]]), { wash: '#55606A', fill: '#3C454E', fillOp: 50, ink: PAL.ink, sw: 1.2, curv: .5 });
    paint(P_(x, y, s, [[-40, -40], [-30, -96], [60, -96], [80, -40]]), { wash: '#55606A', ink: PAL.ink, sw: 1.1 });
    inkLine(P_(x, y, s, [[20, -96], [20, -150], [46, -150]]), 2.6, '#3C454E', 'ink', 0);
    paint(P_(x, y, s, [[-300, -30], [-262, 0], [-300, 30]]), { wash: '#3C454E', ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 5; i++) paint(ellPts(x + (-150 + i * 70) * s, y - 10 * s, 9 * s, 9 * s, 10), { wash: '#B8C4CC', ink: PAL.ink, sw: .6 });
  }
  function P_(x, y, s, pts) { return pts.map(([a, b]) => [x + a * s, y + b * s]); }
  function sandbag(x, y, s, key, rows = [3, 2]) {                   // a wall of sandbags, bags per row from the bottom up; (x, y) = its foot; top at y - (34 + 60 (rows - 1) + 32) s
    auditBox('sandbag', key, x - 65 * s * Math.max(...rows), y - (34 + 60 * (rows.length - 1) + 32) * s, x + 65 * s * Math.max(...rows), y, true);
    boilSeed('sbg' + key);
    rows.forEach((n, r) => { for (let i = 0; i < n; i++) { const cx = x + (i - (n - 1) / 2) * 130 * s, cy = y - 34 * s - r * 60 * s;
      paint(rrPts(cx - 66 * s, cy - 32 * s, 132 * s, 64 * s, 28 * s), { wash: '#C9AE78', fill: '#A88A55', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1 }); } });
  }
  function meter(x, y, s, v, key) {                                 // a handheld recorder with a needle meter; v 0..1
    auditBox('recorder', key, x - 70 * s, y - 50 * s, x + 70 * s, y + 50 * s, true);
    boilSeed('mt' + key);
    paint(rrPts(x - 70 * s, y - 50 * s, 140 * s, 100 * s, 12 * s), { wash: '#4A4552', ink: PAL.ink, sw: 1.1 });
    paint(rrPts(x - 54 * s, y - 38 * s, 108 * s, 56 * s, 8 * s), { wash: '#F5EBC8', ink: PAL.ink, sw: .8 });
    paint(rectPts(x + 14 * s, y - 32 * s, 32 * s, 8 * s), { wash: S.red, ink: null });
    const a = -Math.PI * (.85 - .7 * clamp(v)); inkLine([[x, y + 14 * s], [x + Math.cos(a) * 44 * s, y + 14 * s + Math.sin(a) * 44 * s]], 2, PAL.ink, 'ink', 0);
    paint(ellPts(x + 46 * s, y + 34 * s, 8 * s, 8 * s, 8), { wash: S.red, ink: null });
  }
  function mountain(x, y, s, key) {                                 // a snowy peak (the 高原 of the boiling-point aside)
    boilSeed('mn' + key);
    paint(P_(x, y, s, [[-420, 0], [-120, -340], [-40, -300], [60, -420], [420, 0]]), { wash: '#8C9BB0', fill: '#6F7E96', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(P_(x, y, s, [[-170, -284], [-120, -340], [-40, -300], [60, -420], [140, -330], [70, -300], [10, -320], [-60, -270], [-110, -296]]), { wash: '#F4F7FA', ink: PAL.ink, sw: .9, curv: .3 });
  }
  function pot(x, y, s, t, key, boil = 0, fire = 1) {               // a pot on a camp flame; boil 0..1 bubbles
    boilSeed('pt' + key);
    if (fire > .02) for (let i = 0; i < 3; i++) { const fx = x + (i - 1) * 26 * s, h = (50 + 18 * Math.sin(t * 13 + i * 2)) * s * fire; paint([[fx - 16 * s, y], [fx, y - h], [fx + 16 * s, y]], { wash: i === 1 ? '#FFC46A' : '#F08A3E', ink: null }); }
    paint(rrPts(x - 90 * s, y - 130 * s, 180 * s, 100 * s, 18 * s), { wash: '#6E7A88', fill: '#4E5866', fillOp: 50, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(x, y - 130 * s, 90 * s, 18 * s, 18), { wash: '#8CC8EE', ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 6; i++) { const k = frac(t * 1.3 + hash(i)), bx = x + (hash(i + 2) - .5) * 140 * s; if (boil > .05) bubble(bx, y - 130 * s - 60 * k * s, (6 + 6 * hash(i)) * s * boil * (1 - k * .4), key + 'b' + i); }
  }

  // ================================ A1 · the hot open; meet the shrimp (L1 – L2) ================================
  const GY = 880;                                                   // the sand line everyone stands on
  const SNAP = 6.4, FREEZE = 9.2, KB = 3.4;                       // KB: how far (u) the bang throws Pip back
  const PX = 520, U1 = 36, SX = 1170, SS = .62;                      // Pip's spot, the shrimp's spot and size
  const MIC = [858, 828];                                           // where Pip lowers the microphone, just in front of the claw
  const CRACK = [[120, 700, .6], [300, 770, .45], [1760, 640, .7], [1870, 740, .5], [1620, 560, .55], [40, 610, .4], [1940, 560, .4], [700, 760, .35]];
  function crackle(t, key, pts, rate = .9, g = 1) {                 // the reef crackling: little flashes popping on far rocks
    pts.forEach(([x, y, r], i) => { const k = frac(t * rate * (.7 + .6 * hash(i + 5)) + hash(i)); if (k < .14) { const q = k / .14; glow(x, y, 70 * r * (1 - q), S.flashC, .8 * (1 - q) * g); ring(x, y, 60 * r * easeOut(q), S.shock, 2.2 * (1 - q) + .4, key + i); } });
  }
  function farRocks(key, wide = 0) {                                 // pale rocks far off, where the crackle comes from
    const col = mixCol(S.rock, S.reef, .55), R = [[160, 860, 380, 230], [1780, 860, 420, 300], ...(wide ? [[-700, 860, 520, 260], [-260, 860, 300, 160], [2400, 860, 560, 340], [2900, 860, 380, 200], [1180, 860, 300, 140]] : [])];
    R.forEach(([x, y, w, h], i) => { boilSeed(key + 'fr' + i); paint([[x - w / 2, y], [x - w * .4, y - h * .75], [x - w * .1, y - h], [x + w * .3, y - h * .85], [x + w / 2, y]], { wash: col, ink: mixCol(col, PAL.ink, .4), sw: .8, curv: .5 }); });
  }
  function reefSet(t, key, o = {}) {                                // the whole set: the reef, far rocks, the burrow rock, sea grass
    reef(t, key, o); farRocks(key, o.wide);
    if (o.crack !== false) crackle(t, key + 'ck', o.wide ? [...CRACK, [-600, 640, .7], [-250, 720, .5], [2350, 560, .7], [2800, 700, .6], [1180, 740, .5], [-500, 760, .5], [2600, 760, .5]] : CRACK, .9, o.crackG ?? 1);
    rock(1520, GY + 10, 600, 340, key + 'rk', { hole: [1350, GY - 58, 66] });
    for (let i = 0; i < 5; i++) weed(40 + i * 46 + (i > 2 ? 1500 : 0), GY + 6, 150 + 70 * hash(i), t, key + 'w' + i, i % 2 ? '#7DBB8A' : S.weed);
  }
  // the hot open's action, for action time a (the open plays it live, L4 replays it slowly). Returns Pip's pose etc.
  function hotState(a) {
    let o = K.act(a, [[0, 'calm', { lookX: .6 }], [.9, 'bliss'], [2.6, 'scheme', { lookX: 1 }], [4.7, 'calm', { lookX: 1, lookY: .3 }], [5.6, 'wow', { lookX: 1, lookY: .3, take: .8 }], [6.05, 'eek', { lookX: 1, lookY: .2 }]]);
    if (a < 2.6) o = { ...o, dy: (o.dy || 0) - .22 * pulse(a, 4) * on(a, .9, 2.5, .2, .2), armF: [.9, 1.7], armB: { at: [-1.6, -3.1] } };
    else if (a >= 4.6) o = { ...o, armF: [lerp(.9, -.15, ease(seg(a, 4.6, 5.5))), 2.0], armB: [.2, 1.4] };
    o = TOON.mix(o, TOON.sneak(a, 2.6, 4.6, { dir: 1, dist: 6 }));
    if (a > SNAP + .08) o = { ...K.act(a, [[SNAP + .08, 'shock'], [SNAP + 1.6, 'dizzy']]), dx: o.dx, armF: [-1.2, 1.55], armB: [-1.3, 1.5] };
    o = TOON.mix(o, TOON.wildTake(a, SNAP + .08, { amt: .6, hang: .05 }), TOON.knockback(a, SNAP + .3, { dir: -1, dist: KB, h: 2.2 }));
    if (a > 8.5) o = { ...o, face: 'deadpan', eyes: undefined, mouth: undefined, lookX: 0, lookY: 0, turn: .05, emote: null, fx: [], dx: (o.dx || 0) };
    const lower = ease(seg(a, 4.6, 5.5)), shut = a > SNAP - .02, cock = shut ? 0 : ease(seg(a, 5.8, 6.25));
    return { o, lower, open: cock + (shut ? 0 : .03 * Math.sin(a * 70) * cock), feel: ease(seg(a, 5.2, 6.0)) * (1 - seg(a, SNAP, SNAP + .3)),
      back: ease(seg(a, 6.9, 7.8)), jetK: on(a, SNAP - .01, SNAP + .07, .02, .03), bub: seg(a, SNAP, SNAP + .07), pop: seg(a, SNAP + .07, SNAP + 1.1) };
  }
  // draw the hot open's actors for action time a: the shrimp, Pip with headphones and the hydrophone, the snap
  function hotDraw(a, t, key, o2 = {}) {
    const st = hotState(a), o = { ...st.o, ...(o2.pip || {}) };
    const sx = SX + 70 * st.back;
    const sh = shrimp(sx, GY, SS, t, key + 'sh', { open: st.open, walk: st.back * 2, feel: st.feel > .02 ? [lerp(sx - 120, MIC[0] + 20, st.feel), lerp(GY - 110, MIC[1] - 26, st.feel)] : null, ...(o2.shrimp || {}) });
    // the bubble: born in the jet at the claw's mouth, carried to the microphone, where it collapses
    const bp = [lerp(sh.tip[0] - 6, MIC[0] + 8, easeOut(st.bub)), lerp(sh.tip[1], MIC[1] + 6, easeOut(st.bub))];
    jet(sh.tip[0], sh.tip[1], 1, 90, st.jetK, key + 'jt', .7, a);
    if (st.bub > 0 && st.bub < 1) bubble(bp[0], bp[1], 3 + 13 * Math.sin(st.bub * Math.PI * .9), key + 'bb');
    const px = PX - 6 * U1;
    TOON.pip(px, GY, U1, { ...o, key: key + 'pip' });
    const hp = headphones(px, GY, U1, o, key + 'hp', { off: pulseK(a, SNAP + .08, .5) + .35 * ease(seg(a, SNAP + .3, SNAP + .9)) });
    const h = TOON.hand(px, GY, U1, o), aim = Math.atan2(MIC[1] - h[1], MIC[0] - h[0]), len = a > SNAP + .1 ? 190 : Math.max(80, Math.hypot(MIC[0] - h[0], MIC[1] - h[1]) - 50);
    const ang = a > SNAP + .1 ? lerp(aim, .7, ease(seg(a, SNAP + .1, SNAP + .6))) : lerp(-1.15, aim, st.lower);
    hydrophone(h, ang, len, key + 'hy', { bent: a > SNAP + .1 ? 1 : 0, cable: hp.cupR });
    if (st.pop > 0 && st.pop < 1) { K.burst(MIC[0], MIC[1], 60, seg(st.pop, 0, .25), PAL.cream, key + 'bu'); shockRings(MIC[0], MIC[1], st.pop, key + 'sr', 700); }
    return { sh, pipX: px, o };
  }

  function shotA1(t, lt, dur) {
    K.setT(t);
    const a = t < FREEZE ? t : FREEZE, frz = t >= FREEZE && t < L(2, -.1) ? 1 : 0, live = t >= L(2, -.1);
    const grey = ease(seg(t, FREEZE, FREEZE + .15)) * (1 - ease(seg(t, L(2, -.1), L(2, .3))));
    const c = kf(t, [[0, [900, 600, 1.0]], [4.4, [900, 600, 1.0]], [5.4, [860, 760, 1.6]], [SNAP + .2, [860, 760, 1.6]], [SNAP + .8, [760, 700, 1.3]], [FREEZE, [760, 700, 1.3]], [L(1, 1.8), [760, 700, 1.3]],
      [L(1, 2.8), [PX - KB * U1 + 120, GY - 140, 1.9]], [L(1, 4.0), [PX - KB * U1 + 120, GY - 140, 1.9]], [L(1, 5.0), [SX + 70, GY - 100, 1.75]],
      [L(2, .2), [SX + 70, GY - 100, 1.75]], [L(2, 1.6), [1060, 800, 1.9]], [L(2, 5.0), [1060, 800, 1.9]], [L(2, 5.8), [880, 800, 1.45]]], ease);
    const shk = a > SNAP + .05 && a < SNAP + .35 && !frz ? shakeXY(t, 18) : [0, 0];
    camBegin(c[0] + shk[0] + 6 * wob(t, .05) * (1 - frz), c[1] + shk[1] + 4 * wob(t, .04) * (1 - frz), c[2]);
    reefSet(frz ? FREEZE : t, 'a1', { crackG: live ? 1 : 1 });
    if (!live) hotDraw(a, frz ? FREEZE : t, 'a1');
    else {                                                          // L2: the shrimp walks out; its claws; it's half the body
      const wk = seg(t, L(2, .3), L(2, 2.0)), sx = SX + 70 - 130 * ease(wk);
      const small = on(t, L(2, 2.3), L(2, 3.6), .3, .4), raise = on(t, L(2, 3.5), L(2, 5.4), .3, .5);
      const sh = shrimp(sx, GY, SS, t, 'a1sh', { walk: wk * 3, small, raise, hi: raise });
      // the measure: a cream bracket under the claw, then laid along the body twice
      const m0 = L(2, 5.5), ln = Math.abs(sh.back[0] - sh.tip[0]), by = GY + 30;
      const brk = (x0, k, key) => { if (k < .05) return; boilSeed('br' + key); const x1 = x0 + ln * k; inkLine([[x0, by], [x1, by]], 3, PAL.cream, 'ink', 0); inkLine([[x0, by - 12], [x0, by + 12]], 3, PAL.cream, 'ink', 0); if (k > .95) inkLine([[x1, by - 12], [x1, by + 12]], 3, PAL.cream, 'ink', 0); };
      if (t > m0) brk(sh.tip[0], ease(seg(t, m0, m0 + .5)), 'c');
      const head = sh.head[0] - 18 * SS, sl = ease(seg(t, m0 + .9, m0 + 1.5));
      if (t > m0 + .9) brk(head + ln * sl, 1, 'b1');
      if (t > m0 + 1.6) brk(head, ease(seg(t, m0 + 1.6, m0 + 2.0)), 'b0');
      if (t > m0 + 2.1) K.check(head + ln, by + 54, 34, seg(t, m0 + 2.1, m0 + 2.5), 'a1ok');
      const px = PX - KB * U1;
      let o = K.act(t, [[L(2, -.1), 'deadpan'], [L(2, .7), 'calm', { lookX: 1, lookY: .2 }], [L(2, 3.7), 'wow', { lookX: 1, take: .9 }], [m0 + 2.2, 'idea', { lookX: .8 }]]);
      if (t > m0 - .2 && t < m0 + 2.4) o = { ...o, armF: [.15, 2.6] };                   // it points along the measure
      TOON.pip(px, GY, U1, { ...o, key: 'a1pip' });
      const hp = headphones(px, GY, U1, o, 'a1hp', { off: .35 });
      hydrophone(TOON.hand(px, GY, U1, { ...o, armF: [-1.2, 1.55] }, 'B'), .7, 180, 'a1hy', { bent: 1, cable: hp.cupR });
    }
    camEnd();
    if (grey > .01) paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#77737F', washOp: 120 * grey, ink: null });
    if (lt < .9) iris(W * .32, H * .62, lerp(0, 1500, easeIn(seg(lt, .05, .9))), PAL.ink);
  }

  // ================================ A2 · the crackle, the sonar; the replay: it never touched Pip (L3 – L4) ================================
  function shotA2(t, lt, dur) {
    K.setT(t);
    const rp = L(4, .6);                                            // the replay starts after a rewind
    if (t < L(4, .1)) {                                             // L3: wide, the whole reef crackling; Pip's ears ring; a submarine's sonar
      const c = kf(t, [[L(3, -.9), [880, 800, 1.45]], [L(3, 1.2), [1000, 520, .62]], [L(3, 5.0), [1000, 520, .62]], [L(3, 6.0), [1900, 120, 1.15]]], ease);
      camBegin(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
      reefSet(t, 'a2', { wide: 1, crackG: 1 + ease(seg(t, L(3, .4), L(3, 2.0))) });
      for (let i = 0; i < 4; i++) { const p = [[-450, 600], [2650, 580], [1180, 690], [600, 560]][i], k = frac((t - L(3)) * 1.4 + i * .3); if (t > L(3, .4)) for (let j = 0; j < 3; j++) { boilSeed('a2sa' + i + j); const r = 40 + 30 * j + 60 * k; inkLine([[p[0] - r * .7, p[1] - r * .7], [p[0] - r, p[1]], [p[0] - r * .7, p[1] + r * .7]].map(([x, y]) => [x + 2 * r, y]), 3 * (1 - k), PAL.cream, 'ink', .6); } }
      shrimp(SX - 60, GY, SS, t, 'a2sh', { walk: 0 });
      const px = PX - KB * U1;
      let o = K.act(t, [[L(3, -.9), 'idea'], [L(3, 1.6), 'eek'], [L(3, 4.8), 'deadpan']]);
      o = TOON.mix(o, TOON.shiver(t, L(3, 1.8), L(3, 4.6), { amt: 1.4 }));
      TOON.pip(px, GY, U1, { ...o, key: 'a2pip' });
      const hp = headphones(px, GY, U1, o, 'a2hp', { off: .35 + .25 * Math.abs(Math.sin(t * 40)) * on(t, L(3, 1.8), L(3, 4.6), .1, .2) });
      hydrophone(TOON.hand(px, GY, U1, { ...o, armF: [-1.2, 1.55] }, 'B'), .7, 180, 'a2hy', { bent: 1, cable: hp.cupR });   // still holding the bent pole from A1
      // the submarine, high in the blue: its sonar pings break up in the crackle
      const SB = [1900, 140]; sub(SB[0], SB[1], .55, 'a2sb');
      for (let i = 0; i < 4; i++) { const k = frac((t - L(3, 5.2)) * .7 + i * .25); if (t < L(3, 5.2)) break;
        const r = 60 + 520 * k; boilSeed('a2pg' + i); const P = []; for (let j = 0; j <= 10; j++) { const an = -.55 + 1.1 * j / 10, jag = 26 * k * (hash(j + i * 11 + Math.floor(t * 12)) - .5); P.push([SB[0] + 170 + Math.cos(an) * (r + jag), SB[1] + Math.sin(an) * (r + jag)]); }
        inkLine(P, 3.2 * (1 - k) + .5, '#BFF3F0', 'ink', .4); }
      camEnd();
      if (t > L(3, 5.0) && t < L(3, 5.6)) streaks(on(t, L(3, 5.0), L(3, 5.6), .2, .3), 'a2wp');
    } else {                                                        // L4: rewind to the snap; slow motion; the gap; the bullet; ?
      const a = t < rp ? lerp(8.6, 5.9, ease(seg(t, L(4, .1), rp)))
        : t < L(4, 1.6) ? lerp(5.9, 6.37, seg(t, rp, L(4, 1.6)))
        : t < L(4, 2.4) ? lerp(6.37, SNAP, ease(seg(t, L(4, 1.6), L(4, 2.4))))
        : t < L(4, 5.2) ? SNAP
        : lerp(SNAP, SNAP + .055, ease(seg(t, L(4, 5.2), L(4, 6.8))));
      const c = kf(t, [[L(4, .1), [760, 700, 1.3]], [L(4, 1.4), [760, 700, 1.3]], [L(4, 2.4), [970, 835, 2.8]], [L(4, 6.6), [970, 835, 2.8]], [L(4, 7.2), [760, 740, 1.45]], [L(5, -.9), [760, 740, 1.45]], [L(5, -.2), [997, 837, 4.5]]], ease);
      camBegin(c[0] + 4 * wob(t, .05), c[1] + 3 * wob(t, .04), c[2]);
      reefSet(t, 'a2r', { crack: false });
      const d = hotDraw(a, t, 'a2r', { pip: a < SNAP + .1 ? {} : {} });
      // the gap: a cream bracket between the shut claw and the microphone, and a ✗ (no contact)
      const gk = on(t, L(4, 2.6), L(4, 5.4), .3, .3), tip = d.sh.tip;
      if (gk > .05) { boilSeed('a2gap'); const y = MIC[1] - 34; inkLine([[tip[0] - 4, y], [MIC[0] + 30, y]], 1.8 * gk, PAL.cream, 'ink', 0); for (const x of [tip[0] - 4, MIC[0] + 30]) inkLine([[x, y - 9], [x, y + 9]], 1.8 * gk, PAL.cream, 'ink', 0); }
      if (t > L(4, 3.8)) K.cross((tip[0] + MIC[0]) / 2 + 12, MIC[1] - 70, 22, on(t, L(4, 3.8), L(4, 5.4), .3, .3), 'a2x');
      if (t > L(4, 6.8)) { const q = popK(seg(t, L(4, 7.2), L(4, 7.6))); if (q > .05) pipEmote('question', d.pipX + 1.2 * U1, GY - 7.4 * U1, U1 * q, 1, 'a2q'); }
      camEnd();
      if (t < rp + .1) streaks(on(t, L(4, .1), rp + .1, .1, .2), 'a2rw' + Math.floor(t * 12) % 3);
      if (t > L(4, 6.9)) paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#77737F', washOp: 80 * ease(seg(t, L(4, 6.9), L(4, 7.1))) * (1 - ease(seg(t, L(5, -.6), L(5, -.3)))), ink: null });
      if (t > L(5, -.45)) flash(ease(seg(t, L(5, -.45), L(5, -.1))), PAL.cream);
    }
  }

  // ================================ B1 · the gun: plunger and socket; cocking against a spring; the latch trips (L5 – L7) ================================
  const CB = [1100, 700, .9];                                       // the cut-away claw: centre and scale
  function tankFloor(key) { boilSeed(key + 'fl'); paint(rectPts(-400, 900, W + 800, 500), { wash: '#B9DDD6', fill: '#9CCBC2', fillOp: 50, tex: .3, ink: null }); inkLine([[-400, 902], [W + 400, 898]], 1.2, '#7FB3AA', 'ink', .2); }
  function shotB1(t, lt, dur) {
    K.setT(t);
    const cock = L(6, .6), click = L(6, 2.6), poke = L(7, .2), fire = L(7, .55), rw = L(7, 4.6), slow0 = L(7, 5.2), slow1 = L(7, 6.6);
    // the dactyl: ajar under L5, hauled open in L6, latched; it fires in L7; in the slow replay it is cocked again and shuts slowly
    let open = t < cock ? .35 : t < fire ? lerp(.35, 1, ease(seg(t, cock, click))) : t < rw ? 1 - seg(t, fire, fire + .06) : t < slow0 ? ease(seg(t, rw, rw + .4)) : 1 - easeIn(seg(t, slow0, slow1));
    const latch = t < fire ? ease(seg(t, click - .15, click)) : t > rw + .4 && t < slow0 ? 1 : 0;
    const tense = t < fire ? ease(seg(t, L(6, 5.4), L(6, 7.2))) : t > rw && t < slow0 + .2 ? 1 : 0;
    const spring = t < fire ? ease(seg(t, L(6, 6.6), L(6, 8.4))) : t > rw && t < slow1 ? 1 - easeIn(seg(t, slow0, slow1)) : 0;
    const water = t < fire ? 1 : t < rw ? 0 : t < slow0 ? 1 : 1 - seg(t, slow0 + .7, slow1 + .2);
    const c = kf(t, [[L(5, -.2), [960, 620, 1.0]], [L(5, 1.2), [960, 620, 1.0]], [L(5, 1.9), [780, 715, 1.75]], [L(5, 6.6), [780, 715, 1.75]], [L(5, 7.4), [930, 640, 1.0]],
      [L(6, 5.0), [930, 640, 1.0]], [L(6, 5.6), [1170, 700, 1.5]], [L(6, 9.6), [1170, 700, 1.5]], [L(7, -.4), [930, 640, 1.0]], [rw, [930, 640, 1.0]], [rw + .6, [760, 730, 1.55]]], ease);
    const shk = t > fire && t < fire + .3 ? shakeXY(t, 16) : [0, 0];
    camBegin(c[0] + shk[0] + 6 * wob(t, .05), c[1] + shk[1] + 4 * wob(t, .04), c[2]);
    tank(t, 'b1'); tankFloor('b1');
    const g = clawBig(CB[0], CB[1], CB[2], open, 'b1c', { tense, latch, spring, water, t, hiP: on(t, L(5, 1.6), L(5, 3.6), .3, .4), hiS: on(t, L(5, 4.6), L(5, 6.6), .3, .4) });
    if (t > click && t < click + .35) K.burst(g.hinge[0] + 40, g.hinge[1] - 40, 46, seg(t, click, click + .35), PAL.cream, 'b1ck');
    if (tense > .3 && t < fire) for (let i = 0; i < 5; i++) { boilSeed('b1tm' + i); const a = -1.2 + i * .5, r = 330 * CB[2], p = [CB[0] + Math.cos(a) * r * 1.05, CB[1] + Math.sin(a) * r * .62], j = 6 * Math.sin(t * 40 + i); inkLine([[p[0] + j, p[1]], [p[0] + Math.cos(a) * 30 + j, p[1] + Math.sin(a) * 22]], 2.2 * tense, PAL.ink, 'ink', 0); }
    // the jet out of the front when it fires (and slowly in the replay)
    const jk = t < rw ? on(t, fire, fire + .9, .05, .5) : on(t, slow0 + .8, slow1 + 1.2, .6, .3);
    if (jk > .02) { jet(g.mouth[0], g.mouth[1], 1, 520, jk, 'b1j', 1.6, t); for (let i = 0; i < 6; i++) { const k = frac(t * 2.2 + i / 6); paint(ellPts(g.mouth[0] - 520 * k * jk, g.mouth[1] + (hash(i) - .5) * 30, 7 * (1 - k), 7 * (1 - k), 8), { wash: PAL.cream, ink: null }); } }
    // Pip: peeks into the gap (L5), hauls the dactyl open on a rope (L6), pokes the latch with its pole and is blown back (L7)
    const px = 420, u = 36;
    let o = K.act(t, [[L(5, -.2), 'calm', { lookX: .8, lookY: -.2 }], [L(5, 2.0), 'wow', { lookX: 1 }], [L(5, 5.4), 'idea', { lookX: 1, lookY: -.3 }],
      [cock, 'strain', { lookX: 1, lookY: -.6 }], [click, 'smug', { lookX: .3 }], [L(6, 5.4), 'worried', { lookX: 1, lookY: -.4 }], [L(7, -.3), 'scheme', { lookX: 1, lookY: -.5 }]]);
    // L6: Pip shoves a pole up under the dactyl's tip and walks it open, from chest height to arms overhead; at the click it flings the pole away
    const tipAt = op => { const Hg = [-240, -60], a = op * 1.1; return [CB[0] + (Hg[0] - 300 * Math.cos(a) - 138 * Math.sin(a)) * CB[2], CB[1] + (Hg[1] - 300 * Math.sin(a) + 138 * Math.cos(a)) * CB[2]]; };
    const tip = tipAt(open), POLE = 270;                            // tip: just inside the point, on the dactyl's underside
    const pushing = t > L(6, -.4) && t < click, setK = ease(seg(t, L(6, -.4), cock)), pk = clamp((open - .35) / .65);
    const pushX = lerp(420, 470, setK) + 50 * pk, grip = [pushX + lerp(1.6, .9, pk) * u, 900 - lerp(3.2, 6.0, pk) * u];
    if (pushing) o = { ...o, dx: (pushX - px) / u, armF: { to: [grip[0] - pushX, grip[1] - 900] }, armB: { to: [grip[0] - pushX - 8, grip[1] - 874] }, rot: .1 * pk + .03 * Math.sin(t * 40) * pk, sq: -.06 * pk };
    const hop = seg(t, click, click + .4);
    if (t >= click && hop < 1) o = { ...o, dx: lerp(100, 0, ease(hop)) / u, dy: -.5 * Math.sin(Math.PI * hop), armF: [1.4, 2.2] };
    if (t > click + .4 && t < L(6, 4.8)) o = { ...o, armsFront: true, armF: { at: [.8, -2.0 + .2 * Math.sin(t * 30)] }, armB: { at: [-.6, -2.0 - .2 * Math.sin(t * 30)] } };   // dusting its hands
    const poking = t > L(7, -.5) && t < fire + .1;
    if (poking) o = { ...o, armF: [.75, 2.2], armB: [.6, 1.6] };
    o = TOON.mix(o, TOON.knockback(t, fire + .12, { dir: -1, dist: 5, h: 1.8 }));
    if (t > fire + .12) o = { ...o, ...(t > fire + 2.6 ? K.act(t, [[fire + 2.6, 'dizzy'], [L(7, 4.0), 'deadpan']]) : {}), dx: o.dx };
    TOON.pip(px, 900, u, { ...o, key: 'b1pip' });
    const pole = (a, b, key) => { boilSeed(key); paint(ribbon([a, b], 9, 7), { wash: '#B59A74', ink: PAL.ink, sw: .7 }); };
    if (pushing) { const top = setK < 1 ? [lerp(grip[0] + 50, tip[0], setK), lerp(grip[1] - 110, tip[1], setK)] : tip, d = Math.hypot(grip[0] - top[0], grip[1] - top[1]);
      pole(top, [top[0] + (grip[0] - top[0]) * POLE / d, top[1] + (grip[1] - top[1]) * POLE / d], 'b1pole'); }
    if (t >= click && t < click + .7) { const T1 = tipAt(1), G1 = [520 + .9 * u, 900 - 6.0 * u], d = Math.hypot(G1[0] - T1[0], G1[1] - T1[1]), k = seg(t, click, click + .7);   // flung over its shoulder
      const c0 = [T1[0] + (G1[0] - T1[0]) * POLE / 2 / d, T1[1] + (G1[1] - T1[1]) * POLE / 2 / d], a = Math.atan2(G1[1] - T1[1], G1[0] - T1[0]) - 12 * k, cc = [c0[0] - 1100 * k, c0[1] - 700 * k + 500 * k * k];
      pole([cc[0] - Math.cos(a) * POLE / 2, cc[1] - Math.sin(a) * POLE / 2], [cc[0] + Math.cos(a) * POLE / 2, cc[1] + Math.sin(a) * POLE / 2], 'b1pole'); }
    if (poking || (t > L(6, 9) && t < fire)) { const h = TOON.hand(px, 900, u, o), L0 = [CB[0] + -196 * CB[2], CB[1] + -96 * CB[2]], k = t < poke ? .82 : t < fire ? lerp(.82, 1, ease(seg(t, poke, fire - .05))) : 1;
      const tgt = [lerp(h[0], L0[0], k), lerp(h[1], L0[1], k)]; hydrophone(h, Math.atan2(tgt[1] - h[1], tgt[0] - h[0]), Math.hypot(tgt[0] - h[0], tgt[1] - h[1]) - 50, 'b1hy'); }
    camEnd();
    if (lt < .4) flash(1 - seg(lt, 0, .4), PAL.cream);
    if (t > rw - .1 && t < rw + .5) streaks(on(t, rw - .1, rw + .5, .1, .2), 'b1rw' + Math.floor(t * 12) % 3);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#1D4272', S.deep]);
  }

  // ================================ C1 · the bubble: fast water, low pressure, cold boiling, collapse (L8 – L10) ================================
  const SH1 = [1990, 730, 1.6];                                     // the shrimp in profile at the right edge, claw toward the middle
  function shotC1(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(8, -.9), [1060, 560, 1.0]], [L(8, 3.2), [1060, 560, 1.0]], [L(8, 4.0), [900, 560, 1.15]], [L(9, 4.2), [900, 560, 1.15]], [L(9, 5.0), [1060, 600, 1.25]],
      [L(10, 3.4), [1060, 600, 1.25]], [L(10, 4.2), [1010, 640, 1.55]], [L(10, 7.6), [1010, 640, 1.55]], [L(11, -.9), [960, 600, 1.2]]], ease);
    const bang = L(10, 5.7), shk = t > bang && t < bang + .3 ? shakeXY(t, 16) : [0, 0];
    camBegin(c[0] + shk[0] + 6 * wob(t, .05), c[1] + shk[1] + 4 * wob(t, .04), c[2]);
    deep(t, 'c1');
    const sh = shrimp(SH1[0], SH1[1], SH1[2], t, 'c1sh', { open: 0, ant: .6 });
    const tip = sh.tip, B = [tip[0] - 230, tip[1]];                 // the bubble forms about a centimetre in front of the claw
    // the jet: streaming through L8–L9, gone by the jar
    const jk = on(t, L(8, -.4), L(10, 1.0), .5, .6);
    jet(tip[0], tip[1], 1, 900, jk, 'c1j', 2.2, t);
    for (let i = 0; i < 10; i++) { const k = frac(t * 1.6 + i / 10); if (jk > .05) paint(ellPts(tip[0] - 900 * k, tip[1] + (hash(i) - .5) * 44, 8 * (1 - k) + 1, 6 * (1 - k) + 1, 8), { wash: PAL.cream, washOp: 200, ink: null }); }
    // the bubble: it swells in the jet (L9), sits there (L10 start), is squeezed in the jar and collapses (L10)
    const grow = ease(seg(t, L(9, 5.0), L(9, 8.2))), squeeze = easeIn(seg(t, L(10, 4.0), bang));
    const br = 78 * grow * (1 - .9 * squeeze) * (1 + .03 * Math.sin(t * 9));
    if (t < bang && br > 2) bubble(B[0], B[1], br, 'c1b');
    if (t > L(10, 3.6) && t < bang) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, k = frac((t - L(10, 3.6)) * 1.6 + i * .13), r = lerp(220, 110, k); boilSeed('c1sq' + i); const p = [B[0] + Math.cos(a) * r, B[1] + Math.sin(a) * r]; inkLine([[p[0] + Math.cos(a + .5) * 18, p[1] + Math.sin(a + .5) * 18], p, [p[0] + Math.cos(a - .5) * 18, p[1] + Math.sin(a - .5) * 18]], 3 * (1 - k), PAL.cream, 'ink', 0); }
    if (t > bang) { shockRings(B[0], B[1], seg(t, bang, bang + 1.2), 'c1sr', 700); K.burst(B[0], B[1], 90, seg(t, bang, bang + .35), PAL.cream, 'c1bu'); }
    // the gauge on a probe in the jet (L8): its needle drops from green to deep blue
    const gk = on(t, L(8, 3.6), L(9, .4), .4, .4);
    // Pip: holds the gauge (L8), boils its pot on the mountain (inset, L9), tests the bubble with a thermometer (L9), jars it (L10)
    const px = t < L(9, 6.6) ? 700 : lerp(700, B[0] - 150, ease(seg(t, L(9, 6.6), L(9, 7.4)))), py = t < L(9, 6.6) ? 960 : 860;
    let o = K.act(t, [[L(8, -.9), 'calm', { lookX: .8, lookY: -.4 }], [L(8, 4.4), 'wow', { lookX: .6, lookY: -.8 }], [L(9, 4.6), 'calm', { lookX: 1, lookY: -.3 }],
      [L(9, 7.6), 'confused', { lookX: 1 }], [L(10, .6), 'scheme', { lookX: 1 }], [L(10, 2.8), 'smug', { lookX: .4 }], [L(10, 4.4), 'eek', { lookX: 1 }], [bang + 1.6, 'dizzy']]);
    if (gk > .05) o = { ...o, armF: { at: [1.2, -4.6] }, armB: { at: [1.0, -4.0] } };
    const dipping = t > L(9, 7.0) && t < L(10, .4), jarring = t > L(10, .9) && t < bang;
    if (dipping) o = { ...o, armF: [.25, 2.6] };
    if (jarring) o = { ...o, armF: [.35, 2.5], armB: [.55, 2.2] };
    o = TOON.mix(o, TOON.bonk(t, bang + .05, { len: 2.2 }));
    const sy = K.swim(px, py, 34, t, { ...o, talk: false }, 'c1pip');
    const pipO = { ...o, dy: (o.dy || 0) + (sy - py) / 34 };
    if (gk > .05) { const h = TOON.hand(px, py, 34, pipO); boilSeed('c1pr'); paint(ribbon([h, [h[0] + 10, tip[1] + 40], [h[0] + 10, tip[1] - 150]], 8, 7), { wash: '#B59A74', ink: PAL.ink, sw: .7 });
      paint(ellPts(h[0] + 10, tip[1], 14, 14, 10), { wash: '#C9CFD8', ink: PAL.ink, sw: .8 }); gauge(h[0] + 10, tip[1] - 230, 92 * popK(gk), lerp(.55, .04, ease(seg(t, L(8, 4.2), L(8, 6.2)))), 'c1g'); }
    if (dipping) { const h = TOON.hand(px, py, 34, pipO); push(); translate(h[0], h[1]); rotate(-1.35); thermometer(0, 0, .7, .08, 'c1th'); pop(); }
    if (jarring || (t > bang && t < bang + 1.2)) jar(B[0], B[1] + 10, 1.0, 'c1jr', { shatter: t > bang ? seg(t, bang, bang + 1.0) : 0 });
    camEnd();
    // L9's inset: the high mountain, Pip's pot boiling on a low flame, the thermometer low
    inset(620, 400, 330, on(t, L(9, .3), L(9, 4.4), .35, .3), 'c1in', () => {
      paint(ellPts(620, 400, 330, 330, 40), { wash: '#BFD9EE', ink: null });
      mountain(620, 600, .55, 'c1mn'); paint(ellPts(620, 640, 230, 46, 24), { wash: '#F4F7FA', ink: PAL.ink, sw: .8 });
      pot(705, 650, .7, t, 'c1pt', 1, .5);
      thermometer(800, 655, .55, .5 + .03 * Math.sin(t * 3), 'c1it');
      const ip = K.act(t, [[L(9, .3), 'wow', { lookX: 1, lookY: .3 }], [L(9, 2.0), 'idea', { lookX: 1 }]]);
      pip(520, 655, 22, { ...ip, key: 'c1ipip' });
    }, '#BFD9EE');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#1D4272', S.deep]);
    if (lt > dur - .35) flash(seg(lt, dur - .35, dur), PAL.cream);
  }

  // ================================ C2 · 2000: camera and hydrophone together: the bang is the collapse (L11) ================================
  function miniClaw(x, y, s, open, key) {                           // a small claw icon facing left, for the strip and the recap; returns its mouth
    boilSeed('mc' + key);
    paint(rotEll(x, y, 70 * s, 42 * s, 18, -.05), { wash: S.claw, ink: PAL.ink, sw: 1.1 });
    paint([[x - 60 * s, y + 4 * s], [x - 140 * s, y + 22 * s], [x - 136 * s, y + 34 * s], [x - 58 * s, y + 32 * s]], { wash: S.claw, ink: PAL.ink, sw: 1, curv: .3 });
    const a = open * 1.1, hx = x - 56 * s, hy = y - 16 * s, R = ([px, py]) => [hx + (px * Math.cos(a) - py * Math.sin(a)) * s, hy + (px * Math.sin(a) + py * Math.cos(a)) * s];
    paint([[0, -8], [-40, -6], [-82, 30], [-90, 42], [-56, 30], [0, 12]].map(R), { wash: S.claw, ink: PAL.ink, sw: 1, curv: .3 });
    paint(ellPts(hx, hy, 6 * s, 6 * s, 8), { wash: S.clawDk, ink: null });
    return [x - 142 * s, y + 22 * s];
  }
  function stripFrame(i, x, y, w, h, t, key) {                      // one frame of the high-speed film: 0 cocked, 1 shut + jet, 2 small bubble, 3 big bubble, 4 collapse
    paint(rectPts(x - w / 2, y - h / 2, w, h), { wash: '#203F6C', ink: PAL.ink, sw: 1 });
    const m = miniClaw(x + w * .2, y, .9, i === 0 ? 1 : 0, key + 'c');
    if (i >= 1 && i <= 3) jet(m[0], m[1], 1, 80, 1, key + 'j', .5, t);
    if (i === 2) bubble(m[0] - 34, m[1], 12, key + 'b');
    if (i === 3) bubble(m[0] - 34, m[1], 26, key + 'b');
    if (i === 4) { K.burst(m[0] - 34, m[1], 30, .5, PAL.cream, key + 'bu'); ring(m[0] - 34, m[1], 40, S.shock, 2, key + 'r1'); ring(m[0] - 34, m[1], 62, S.shock, 1.2, key + 'r2'); }
  }
  function projector(x, y, s, crank, key) {                         // a hand-cranked projector on a desk; crank = the handle's angle
    auditBox('projector', key, x - 130 * s, y - 160 * s, x + 100 * s, y + 40 * s, true);
    boilSeed('pj' + key);
    paint(rrPts(x - 90 * s, y - 70 * s, 180 * s, 110 * s, 14 * s), { wash: '#4A4552', fill: '#2E2A35', fillOp: 50, ink: PAL.ink, sw: 1.1 });
    for (const sd of [-1, 1]) paint(ellPts(x + sd * 50 * s, y - 110 * s, 44 * s, 44 * s, 16), { wash: '#5B6170', ink: PAL.ink, sw: 1 });
    paint(rrPts(x - 130 * s, y - 34 * s, 46 * s, 36 * s, 6 * s), { wash: '#5B6170', ink: PAL.ink, sw: .9 });
    const hc = [x + 100 * s, y - 20 * s], he = [hc[0] + Math.cos(crank) * 40 * s, hc[1] + Math.sin(crank) * 40 * s];
    inkLine([hc, he], 3, PAL.ink, 'ink', 0); paint(ellPts(he[0], he[1], 9 * s, 9 * s, 8), { wash: S.red, ink: PAL.ink, sw: .7 });
    return he;
  }
  function shotC2(t, lt, dur) {
    K.setT(t);
    const s0 = L(11, 1.3), trace0 = L(11, 5.4), f2T = L(11, 7.4), spikeT = L(11, 9.9);
    camBegin(880 + 5 * wob(t, .05), 500 + 4 * wob(t, .04), 1.12);
    deep(t, 'c2', '#13284A');
    boilSeed('c2desk'); paint(rectPts(-200, 900, W + 400, 400), { wash: '#6E5A48', fill: '#57463A', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.1 });
    // the strip slides in from the right and stops with its five frames in view
    const fw = 250, fh = 180, sx = lerp(2600, 0, easeOut(seg(t, s0, L(11, 3.6)))), y0 = 300;
    boilSeed('c2st'); paint(rectPts(80 + sx, y0 - fh / 2 - 34, 5 * (fw + 20) + 40, fh + 68), { wash: '#2B2632', ink: PAL.ink, sw: 1.2 });
    for (let j = 0; j < 28; j++) for (const yy of [y0 - fh / 2 - 18, y0 + fh / 2 + 18]) paint(rrPts(96 + sx + j * 50, yy - 7, 22, 14, 4), { wash: '#E9E1CF', ink: null });
    const FX = i => 100 + sx + fw / 2 + 20 + i * (fw + 20);
    for (let i = 0; i < 5; i++) stripFrame(i, FX(i), y0, fw, fh, t, 'c2f' + i);
    // the hydrophone trace under it, drawn left to right: flat at the claw, a spike at the collapse
    const pk = ease(seg(t, L(11, 3.0), L(11, 3.6)));
    if (pk > .02) {
      boilSeed('c2tp'); paint(rectPts(100, 520, 1400 * pk, 180), { wash: '#F5EEDD', ink: PAL.ink, sw: 1.2 });
      const xEnd = t < f2T ? lerp(110, FX(1) + 40, seg(t, trace0, f2T)) : lerp(FX(1) + 40, FX(4) + 30, seg(t, f2T, spikeT)) + (t > spikeT ? 300 * seg(t, spikeT, spikeT + .8) : 0);
      const P = []; for (let x = 110; x <= Math.min(xEnd, 1490); x += 6) { const d = x - FX(4); P.push([x, 610 + 3 * Math.sin(x * .7) * hash(Math.floor(x / 6)) + (Math.abs(d) < 60 ? -150 * Math.exp(-d * d / 300) * Math.cos(d * .3) : 0)]); }
      if (P.length > 1 && t > trace0) { boilSeed('c2tr'); inkLine(P, 2.2, '#2E3A5E', 'ink', .2); }
      if (t > spikeT) for (let j = 0; j < 3; j++) { const k = seg(t, spikeT + j * .12, spikeT + .9 + j * .12); if (k > 0 && k < 1) { boilSeed('c2arc' + j); const r = 40 + 120 * k; inkLine([[FX(4) + r * .5, y0 - r * .8], [FX(4) + r, y0], [FX(4) + r * .5, y0 + r * .8]], 3 * (1 - k), PAL.cream, 'ink', .6); } }
    }
    if (t > f2T) K.cross(FX(1), y0, 46, on(t, f2T, spikeT + 1.0, .3, .3), 'c2x');
    if (t > spikeT + .3) K.check(FX(4), y0 + 150, 34, seg(t, spikeT + .3, spikeT + .7), 'c2ok');
    // Pip cranks the projector in its headphones; at the spike they jump
    const PX2 = 1630, PY2 = 900;
    const crank = t < s0 ? 0 : (t - s0) * 6;
    const pe = projector(1480, 900, 1.0, crank, 'c2pj');
    let o = K.act(t, [[L(11, -.9), 'calm', { lookX: -1 }], [L(11, 1.0), 'happy', { lookX: -1, lookY: -.3 }], [f2T, 'confused', { lookX: -1 }], [spikeT, 'wow', { lookX: -1, take: 1.2 }], [spikeT + 1.2, 'excited', { lookX: -.6 }]]);
    o = { ...o, flip: true, armF: { to: [pe[0] - PX2, pe[1] - PY2] } };
    o = TOON.mix(o, TOON.wildTake(t, spikeT + .05, { amt: .7, hang: .05 }));
    TOON.pip(PX2, PY2, 36, { ...o, key: 'c2pip' });
    headphones(PX2, PY2, 36, o, 'c2hp', { off: pulseK(t, spikeT, .45) });
    camEnd();
    if (lt < .35) flash(1 - seg(lt, 0, .35), PAL.cream);
    if (lt > dur - .35) flash(seg(lt, dur - .35, dur), PAL.cream);
  }

  // ================================ D1 · hotter than the Sun's surface, for an instant; a flash too dim to see (L12 – L13) ================================
  function shotD1(t, lt, dur) {
    K.setT(t);
    const c = kf(t, [[L(12, -.9), [900, 560, 1.3]], [L(12, 5.2), [960, 560, 1.25]], [L(12, 6.0), [1120, 560, 1.0]], [L(12, 7.4), [1120, 560, 1.0]], [L(12, 8.2), [800, 620, 1.35]], [L(14, -.9), [800, 620, 1.35]]], ease);
    camBegin(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    deep(t, 'd1', '#122B52');
    const BC = [900, 520];
    // L12: one bubble collapses slowly, glowing from inside; the thermometer shoots up; the sun alongside
    const col = seg(t, L(12, .4), L(12, 3.6)), r1 = lerp(170, 10, easeIn(col)), hot = ease(seg(t, L(12, 2.2), L(12, 3.6)));
    if (t < L(12, 5.2)) { bubble(BC[0], BC[1], r1, 'd1b', { hot }); if (col >= 1) glow(BC[0], BC[1], 120, S.heat, .9 * (1 - seg(t, L(12, 3.6), L(12, 5.2)))); }
    const th = on(t, L(12, 3.6), L(12, 6.2), .3, .3);
    if (th > .02) { push(); translate(1240, 760); scale(popK(th)); thermometer(0, 0, 1.2, ease(seg(t, L(12, 3.8), L(12, 4.6))) * 1.25, 'd1th'); pop(); if (t > L(12, 4.5) && t < L(12, 5.0)) K.burst(1240, 760 - 300, 50, seg(t, L(12, 4.5), L(12, 5.0)), PAL.cream, 'd1tb'); }
    const sk = ease(seg(t, L(12, 5.4), L(12, 6.2))) * (1 - ease(seg(t, L(12, 7.4), L(12, 8.0))));
    if (sk > .02) { sun(lerp(2300, 1500, sk), 420, 150, t, 'd1sun'); glow(BC[0], BC[1], 200 * sk, S.heat, .9 * sk); paint(ellPts(BC[0], BC[1], 60 * sk, 60 * sk, 18), { wash: '#FFD36E', ink: null }); }
    // the marshmallow: Pip in oven mitts toasts it at the next bubble's collapse; it comes back white; it eats it
    const m0 = L(12, 6.8), mc = L(12, 8.0);
    const b2 = t > m0 && t < mc + .05 ? lerp(140, 8, easeIn(seg(t, m0 + .3, mc))) : 0;
    if (b2 > 2) bubble(BC[0], BC[1], b2, 'd1b2', { hot: seg(t, mc - .4, mc) });
    if (t > mc && t < mc + .3) { glow(BC[0], BC[1], 140, S.heat, 1 - seg(t, mc, mc + .3)); shockRings(BC[0], BC[1], seg(t, mc, mc + .9), 'd1sr', 300); }
    // L13: two flashes on the instruments; then Pip in sunglasses watches one: it blinks exactly as the glint comes
    const fl = [L(13, .6), L(13, 2.6)], gl = L(13, 5.2);
    if (t > L(13, -.4) && t < L(13, 5.8)) { const rr = 60 + 20 * Math.sin(t * 2); bubble(BC[0], BC[1], fl.some(f => Math.abs(t - f) < .12) || Math.abs(t - gl) < .05 ? 6 : rr * (1 - .9 * Math.max(...[...fl, gl].map(f => near(t, f - .05, .12)))), 'd1b3'); }
    for (const f of fl) if (t > f && t < f + .45) { flashAt(BC[0], BC[1], 1 - seg(t, f, f + .45), 1.4); shockRings(BC[0], BC[1], seg(t, f, f + .8), 'd1fr' + f, 280); }
    if (t > gl && t < gl + .09) glow(BC[0], BC[1], 26, '#FFFFFF', .8);
    const pIn = t > m0 - .8;
    if (pIn) {
      // the marshmallow: held up into the bubble; the collapse toasts it and chars its front, smoking; Pip pulls it back and stares;
      // brings it to its mouth; three bites; flings the bare stick away
      const px = lerp(-200, 640, ease(seg(t, m0 - .8, m0 - .1))), py = 760, U = 34;
      const g0 = L(12, 9.15), g1 = L(12, 9.55), BITES = [L(12, 9.6), L(12, 9.9), L(12, 10.2)], toss = L(13, .6);
      let o = K.act(t, [[m0 - .8, 'scheme', { lookX: 1 }], [mc - .3, 'eek', { lookX: 1 }], [mc + .6, 'calm', { lookX: .6, lookY: -.6 }], [mc + .9, 'deadpan', { lookX: .5, lookY: -.6 }], [g1, 'munch'], [toss, 'calm', { lookX: 1, lookY: -.2 }], [L(13, 4.6), 'calm', { lookX: 1 }], [gl + .5, 'blank']]);
      const gq = TOON.geo(px, py, U, o), mRel = [gq.mouth[0] - gq.X, gq.mouth[1] - gq.Y];
      const k1 = ease(seg(t, mc + .5, mc + .9)), k2 = ease(seg(t, g0, g1)), AC = .6 + Math.PI - TAU;   // the stick's three holds: up into the bubble, up to look at, pointing at the mouth
      const hRel = [lerp(lerp(108, 95, k1), mRel[0] + 140 * Math.cos(.6), k2), lerp(lerp(-135, -60, k1), mRel[1] + 140 * Math.sin(.6), k2)], ang = lerp(lerp(-.75, -1.25, k1), AC, k2);
      const holding = t < toss;
      if (holding) o = { ...o, armF: { to: hRel } };
      else if (t < toss + .35) o = { ...o, armF: [1.3, 2.2] };
      if (t > gl - .1 && t < gl + .15) o = { ...o, blink: 1 };
      const sy = K.swim(px, py, U, t, { ...o, talk: false }, 'd1pip');
      const pO = { ...o, dy: (o.dy || 0) + (sy - py) / U };
      const h = TOON.hand(px, py, U, pO), bite = BITES.reduce((s, b) => s + ease(seg(t, b, b + .08)), 0) / 3;
      if (holding) {
        if (bite < .97) { const m = marshmallow(h, ang, 'd1mm', { toast: ease(seg(t, mc, mc + .25)), char: ease(seg(t, mc + .05, mc + .35)), bite });
          if (t > mc && t < mc + 2.6) for (let i = 0; i < 3; i++) { const q = frac((t - mc) * .8 + i / 3), f = 1 - seg(t, mc + 1.8, mc + 2.6); if (f > .05) puff(m[0] + 8 * Math.sin(q * 6 + i), m[1] - 34 - 80 * q, (10 + 18 * q) * f, 1 - .6 * q, 'd1sm' + i, '#C9C3CF'); } }
        else toastStick(h, ang, 110, 'd1mm');
      } else if (t < toss + .7) { const k = seg(t, toss, toss + .7), c0 = [h[0] + 55 * Math.cos(AC), h[1] + 55 * Math.sin(AC)], a = AC + 14 * k, cc = [c0[0] - 700 * k, c0[1] - 420 * k + 380 * k * k];
        toastStick([cc[0] - 55 * Math.cos(a), cc[1] - 55 * Math.sin(a)], a, 110, 'd1mm'); }
      for (const b of BITES) if (t > b && t < b + .5) { const mo = TOON.mouth(px, py, U, pO), q = seg(t, b, b + .5); for (let j = 0; j < 3; j++) paint(ellPts(mo[0] + 10 * j - 4, mo[1] + 12 + 110 * q * q + 8 * hash(j + b), 3, 3, 6), { wash: '#3A2721', ink: null }); }
      mitt(h, 'd1mf'); mitt(TOON.hand(px, py, U, pO, 'B'), 'd1mb');
      if (t > L(13, 4.0)) { const g = TOON.geo(px, sy, 34, pO), lift = ease(seg(t, gl + .6, gl + 1.1)) * .8; boilSeed('d1sg');
        inkLine([g.loc(-1.7, -3.4 - lift), g.loc(1.7, -3.4 - lift)], 3, PAL.ink, 'ink', 0); for (const e of [g.loc(-.62, -3.35 - lift), g.loc(.62, -3.35 - lift)]) paint(ellPts(e[0], e[1], .6 * 34, .5 * 34, 12), { wash: '#26232E', ink: PAL.ink, sw: 1 }); }
    }
    camEnd();
    if (lt < .35) flash(1 - seg(lt, 0, .35), PAL.cream);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, ['#E39A6E', S.reef]);
  }

  // ================================ E1 · the hunt: the shockwave stuns what's close; feeling with antennae; the meal (L14 – L15) ================================
  function shotE1(t, lt, dur) {
    K.setT(t);
    const snap1 = L(14, 4.4), snap2 = L(15, 5.8);
    const c = kf(t, [[L(14, -.9), [860, 720, 1.35]], [L(14, 5.0), [860, 720, 1.35]], [L(14, 5.8), [780, 760, 1.7]], [L(15, -.4), [780, 760, 1.7]], [L(15, .2), [1065, 790, 2.6]],
      [L(15, 2.4), [1060, 790, 2.75]], [L(15, 3.0), [880, 760, 1.4]], [L(16, -.9), [880, 760, 1.4]]], ease);
    const shk = (t > snap1 && t < snap1 + .25) || (t > snap2 && t < snap2 + .25) ? shakeXY(t, 12) : [0, 0];
    camBegin(c[0] + shk[0] + 5 * wob(t, .05), c[1] + shk[1] + 4 * wob(t, .04), c[2]);
    reefSet(t, 'e1', { warm: .55, crackG: .6 });
    const sx = SX, eat = seg(t, L(15, 6.8), L(15, 9.4));
    const snapAt = t < L(15) ? snap1 : snap2, cock = ease(seg(t, snapAt - .6, snapAt - .15)) * (t < snapAt ? 1 : 0);
    const feelK = on(t, L(15, 1.9), L(15, 4.0), .5, .5);
    const sh = shrimp(sx, GY, SS, t, 'e1sh', { open: cock, ant: 1 + 2.5 * feelK, small: t > L(15) ? .5 * Math.abs(Math.sin((t - L(15, 6.8)) * 5)) * on(t, L(15, 6.8), L(15, 9.6), .3, .3) : 0,
      feel: t > L(15, 3.0) && t < L(15, 3.8) ? [lerp(sx - 300, 700, ease(seg(t, L(15, 3.0), L(15, 3.4)))), GY - 150] : null });
    if (t < L(15, -.2)) {                                           // L14: a fish nibbles near the burrow; Pip in a paper-fish hat swims beside it; snap
      const B = [sh.tip[0] - 40, sh.tip[1] - 6], ko = t > snap1 + .2;
      if (t > snap1 && t < snap1 + 1.2) { shockRings(B[0], B[1], seg(t, snap1, snap1 + 1.2), 'e1r', 520); K.burst(B[0], B[1], 34, seg(t, snap1, snap1 + .3), PAL.cream, 'e1b'); }
      const fx = lerp(-150, 780, ease(seg(t, L(14, -.5), L(14, 2.0)))), fy = 760 - (ko ? 30 * ease(seg(t, snap1 + .2, snap1 + 1.6)) : 10 * Math.sin(t * 2));
      fish(fx, fy, 1.0, t, 'e1f', { flip: true, ko });
      const px = lerp(-300, 610, ease(seg(t, L(14, .8), L(14, 3.4)))), py = 820;
      let o = K.act(t, [[L(14, -.9), 'scheme', { lookX: 1 }], [L(14, 3.4), 'smug', { lookX: 1 }], [snap1 + .1, 'shock'], [snap1 + 2.2, 'dizzy']]);
      o = TOON.mix(o, TOON.spinOut(t, snap1 + .15, { dir: -1, turns: 1.5, len: 1.6 }));
      const flat = ease(seg(t, snap1 + 1.8, snap1 + 2.6));
      if (flat > 0) o = TOON.mix(o, { ...TOON.pivot(-Math.PI / 2 * flat, 0, -1.8), face: 'dizzy', emote: 'question', emoteK: 0, fx: [{ kind: 'swirl', at: 'head', k: 1 }] });
      const sy = K.swim(px, py, 32, t, { ...o, talk: false }, 'e1pip');
      const g = TOON.geo(px, sy, 32, o); push(); translate(...g.loc(0, -5.35)); rotate(g.rot); fish(0, 0, .45, t, 'e1hat', { flip: true }); pop();
    } else {                                                        // L15: the dim eyes, the antennae; Pip tiptoes past and zips; a second fish; the meal
      const touch = L(15, 3.5);
      let o = K.act(t, [[L(15, -.2), 'scheme', { lookX: 1 }], [touch, 'gulp'], [L(15, 7.4), 'worried', { lookX: 1 }], [L(15, 8.6), 'gulp']]);
      const peek = t > L(15, 6.8);
      o = TOON.mix(o, TOON.sneak(t, L(15, 2.0), L(15, 3.4), { dir: 1, dist: 3 }), TOON.zip(t, touch + .5, { dir: -1, dist: 14 }));
      if (!peek) TOON.pip(560, GY, 32, { ...o, key: 'e1pip2' });
      else { const pk = ease(seg(t, L(15, 6.8), L(15, 7.4))); TOON.pip(300 + 70 * pk, GY, 30, { ...o, flip: false, lookX: 1, key: 'e1pip3' }); rock(250, GY + 10, 280, 200, 'e1rk2'); }
      // the second fish swims close, snap, belly-up; the small claw pulls it in and the shrimp nibbles
      const ko = t > snap2 + .2, fx = ko ? lerp(sh.tip[0] - 70, sh.tip[0] + 10, ease(eat)) : lerp(-150, sh.tip[0] - 70, ease(seg(t, L(15, 4.2), snap2))), fy = GY - 70 - (ko ? 20 : 8 * Math.sin(t * 2));
      if (t > L(15, 4.2)) fish(fx, fy, .8, t, 'e1f2', { flip: true, ko });
      if (t > snap2 && t < snap2 + 1.2) { const B = [sh.tip[0] - 40, sh.tip[1] - 6]; shockRings(B[0], B[1], seg(t, snap2, snap2 + 1.2), 'e1r2', 480); K.burst(B[0], B[1], 34, seg(t, snap2, snap2 + .3), PAL.cream, 'e1b2'); }
      if (t > L(15, 7.4)) for (let i = 0; i < 3; i++) { const k = frac((t - L(15, 7.4)) * 1.4 + i / 3); paint(ellPts(fx - 10 + 30 * k, fy - 20 - 60 * k, 5 * (1 - k) + 1, 5 * (1 - k) + 1, 8), { wash: '#F2D0A0', ink: null }); }
      // the eyes under their hood, dim: a soft grey veil (L15 start)
      const veil = on(t, L(15, .2), L(15, 1.9), .3, .4); if (veil > .02) { const e = sh.head; glow(e[0] + 6, e[1] + 4, 30, '#FFFFFF', .2 * veil); }
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E39A6E', S.reef]);
    if (lt > dur - .35) flash(seg(lt, dur - .35, dur), PAL.cream);
  }

  // ================================ R1 · recap: latch, shut, jet, low pressure, bubble, collapse (L16; no Pip) ================================
  function shotR1(t, lt, dur) {
    K.setT(t);
    camBegin(960 + 4 * wob(t, .05), 540 + 3 * wob(t, .04), 1.0);
    board(t, 'r1');
    const PW = 410, PH = 360, X = i => 255 + i * 470, Y = 540;
    const T = [L(16, 1.1), L(16, 2.3), L(16, 4.5), L(16, 7.9)];
    for (let i = 0; i < 4; i++) {
      const k = popK(seg(t, T[i], T[i] + .4)); if (k < .05) continue;
      push(); translate(X(i), Y); scale(k); translate(-X(i), -Y);
      boilSeed('r1p' + i); paint(rrPts(X(i) - PW / 2, Y - PH / 2, PW, PH, 26), { wash: '#203F6C', ink: PAL.ink, sw: 1.4 });
      if (i === 0) { miniClaw(X(0) + 70, Y + 20, 1.1, 1, 'r1c0'); K.burst(X(0) + 10, Y - 50, 30, frac((t - T[0]) * .8), PAL.cream, 'r1ck'); }
      if (i === 1) { const m = miniClaw(X(1) + 90, Y + 10, 1.1, 0, 'r1c1'); jet(m[0], m[1], 1, 180, 1, 'r1j', .9, t); }
      if (i === 2) { gauge(X(2) - 90, Y - 60, 70, .05, 'r1g'); const g = ease(seg(t, L(16, 6.0), L(16, 7.2))); if (g > .02) bubble(X(2) + 70, Y + 50, 70 * g, 'r1b'); }
      if (i === 3) { const k3 = seg(t, L(16, 8.0), L(16, 9.0)), r = lerp(80, 8, easeIn(k3)); bubble(X(3), Y, r, 'r1b4', { hot: k3 });
        if (t > L(16, 9.2)) for (let j = 0; j < 3; j++) { boilSeed('r1a' + j); const rr = 50 + 40 * j; inkLine([[X(3) + rr * .5, Y - rr * .8 - 40], [X(3) + rr, Y - 40], [X(3) + rr * .5, Y + rr * .8 - 40]], 3, PAL.cream, 'ink', .6); }
        if (t > L(16, 10.3)) flashAt(X(3), Y, .55 + .2 * Math.sin(t * 6), .6);
        if (t > L(16, 11.0)) for (let j = 0; j < 2; j++) ring(X(3), Y, 120 + 30 * j + 6 * Math.sin(t * 3 + j), S.shock, 2.2, 'r1r' + j); }
      pop();
      if (i > 0) { boilSeed('r1ar' + i); const ax = X(i) - PW / 2 - 40; inkLine([[ax - 26, Y], [ax + 18, Y]], 4, PAL.ink, 'ink', 0); inkLine([[ax + 4, Y - 14], [ax + 20, Y], [ax + 4, Y + 14]], 4, PAL.ink, 'ink', 0); }
    }
    camEnd();
    if (lt < .35) flash(1 - seg(lt, 0, .35), PAL.cream);
    if (lt > dur - .35) flash(seg(lt, dur - .35, dur), PAL.cream);
  }

  // ================================ K1 · the ending: it was the bubble; Pip, ready this time, records the snap ================================
  function shotK1(t, lt, dur) {
    K.setT(t);
    const pull = L(17, 6.4), snap = L(17, 10.4), nose = L(17, 13.4), irisT = dur - 2.6;
    const c = kf(t, [[L(17, -.9), [1110, 830, 2.6]], [pull, [1110, 830, 2.6]], [pull + 1.2, [900, 660, 1.15]], [snap - .2, [900, 660, 1.15]], [snap + 1.4, [700, 700, 1.4]]], ease);
    const shk = t > snap && t < snap + .25 ? shakeXY(t, 10) : [0, 0];
    camBegin(c[0] + shk[0] + 5 * wob(t, .05), c[1] + shk[1] + 4 * wob(t, .04), c[2]);
    reefSet(t, 'k1', { warm: 1, crackG: .7 });
    // the hot open's moment again: the claw shut, the mic just ahead; ✗ on the claw; the bubble swells and collapses slowly
    const sh = shrimp(SX, GY, SS, t, 'k1sh', { open: ease(seg(t, snap - .6, snap - .15)) * (t < snap ? 1 : 0) });
    const B = [sh.tip[0] - 34, sh.tip[1] - 4];
    if (t < pull + .6) {
      if (t > L(17, 2.4)) K.cross(sh.palm[0], sh.palm[1] - 40, 30, on(t, L(17, 2.4), L(17, 3.9), .3, .3), 'k1x');
      const g = seg(t, L(17, 3.8), L(17, 5.2)), cl = seg(t, L(17, 5.2), L(17, 5.8));
      if (g > 0 && cl < 1) bubble(lerp(sh.tip[0] - 6, B[0], g), B[1], 3 + 16 * ease(g) * (1 - easeIn(cl)), 'k1b0');
      if (cl >= 1) shockRings(B[0], B[1], seg(t, L(17, 5.8), L(17, 7.0)), 'k1r0', 260);
    }
    // Pip, ready: earmuffs, goggles, hiding behind a sandbag wall with just its eyes over the top; the long pole rests on the
    // wall's corner; the recorder sits on the wall. It ducks for the snap, peeks up again, and stands to watch the last bubble
    const px = 470, sbX = 470, WT = GY + 4 - 126, CR = [sbX + 184, WT + 2];             // WT: the wall's top; CR: the corner the pole rests on
    const HP = [CR[0] + (CR[0] - MIC[0]) * .45, CR[1] + (CR[1] - MIC[1]) * .45], REC = [sbX - 110, WT - 40];   // where Pip holds the pole; the recorder
    {
      let o = K.act(t, [[L(17, -.9), 'calm', { lookX: 1 }], [pull, 'smug', { lookX: 1 }], [snap - .5, 'eek', { lookX: 1 }], [snap + .5, 'excited', { lookX: .4 }], [snap + 1.4, 'happy', { lookX: -.2, lookY: .3 }], [nose - 1.0, 'wow', { lookX: 1, lookY: -.2 }], [nose + .1, 'shock'], [nose + .9, 'laugh'], [nose + 2.1, 'wink'], [nose + 2.9, 'wave']]);
      const duck = easeOut(seg(t, snap - .5, snap - .3)) * (1 - easeOut(seg(t, snap + .5, snap + .7)));   // ducking: down to its feet and squashed, eyes below the top
      const up = lerp(lerp(-1.3, 0, duck), -2.2, ease(seg(t, nose - 1.0, nose - .5)));
      o = { ...o, dy: (o.dy || 0) + up - (t > snap + 1.4 && t < nose - 1.0 ? .25 * pulse(t, 4) : 0), sq: (o.sq || 0) + .25 * duck };
      const Y = GY + o.dy * 36;
      if (t < nose + 2.9) o = { ...o, armF: { to: [HP[0] - px, HP[1] - Y] }, armB: { to: [REC[0] + 30 - px, REC[1] - 30 - Y] } };
      o = TOON.mix(o, TOON.wildTake(t, nose + .05, { amt: .5, hang: .05 }));
      TOON.pip(px, GY, 36, { ...o, key: 'k1pip' }); earmuffs(px, GY, 36, o, 'k1em'); goggles(px, GY, 36, o, 'k1gg');
      sandbag(sbX, GY + 4, 1.0, 'k1sb', [4, 3]);
      meter(REC[0], REC[1], .8, t < snap ? .1 + .04 * Math.sin(t * 7) : t < snap + 1.4 ? lerp(1, .5, seg(t, snap, snap + 1.4)) + .1 * Math.sin(t * 30) : .3 + .25 * Math.abs(Math.sin(t * 5)), 'k1mt');
      const aim = Math.atan2(MIC[1] - HP[1], MIC[0] - HP[0]);
      hydrophone(HP, aim, Math.hypot(MIC[0] - HP[0], MIC[1] - HP[1]) - 50, 'k1hy');
      // the snap: rings that break on the wall
      if (t > snap) { const k = seg(t, snap, snap + 1.1); if (k < 1) for (let i = 0; i < 3; i++) { const q = k - i * .12; if (q <= 0) continue; boilSeed('k1rg' + i); const r = 520 * easeOut(q), runs = [[]]; for (let j = 0; j <= 16; j++) { const a = Math.PI * .55 + Math.PI * .9 * j / 16, p = [B[0] + Math.cos(a) * r, B[1] + Math.sin(a) * r]; if (p[0] > sbX + 200) runs[runs.length - 1].push(p); else if (runs[runs.length - 1].length) runs.push([]); }
          runs.forEach(P => { if (P.length > 1) inkLine(P, 4 * (1 - q) + .5, S.shock, 'ink', .4); }); }
        K.burst(B[0], B[1], 40, seg(t, snap, snap + .3), PAL.cream, 'k1bu'); if (t < snap + .5) K.burst(sbX + 200, WT + 30, 50, seg(t, snap + .15, snap + .5), PAL.cream, 'k1sbb'); }
      // the last tiny bubble drifts over and pops on Pip's nose
      if (t > nose - 1.6 && t < nose) { const k = ease(seg(t, nose - 1.6, nose)), m = TOON.mouth(px, GY, 36, o); bubble(lerp(B[0], m[0] + 26, k), lerp(B[1] - 60, m[1] - 10, k) - 40 * Math.sin(k * Math.PI), 9, 'k1nb'); }
      if (t > nose && t < nose + .4) { const m = TOON.mouth(px, GY, 36, o); K.burst(m[0] + 26, m[1] - 10, 30, seg(t, nose, nose + .4), PAL.cream, 'k1nbb'); }
    }
    camEnd();
    if (lt < .35) flash(1 - seg(lt, 0, .35), PAL.cream);
    const ir = seg(lt, irisT, dur - .2); if (ir > 0) iris(W / 2 + (470 - c[0]) * c[2], H / 2 + (GY - 5.6 * 36 - c[1]) * c[2], lerp(1500, 0, easeIn(ir)), PAL.ink);   // closes on Pip's face over the wall
  }

  // ---------- a test sheet of the props ----------
  LOOPS.pistolProps2 = t => {
    camBegin(960, 540, 1);
    tank(t, 'pq');
    const op = .5 + .5 * Math.sin(t * 1.5);
    const c = clawBig(1220, 560, .7, op, 'pqc', { tense: op, latch: op > .9 ? 1 : 0, hiP: .8, hiS: .8, t });
    fish(240, 160, 1, t, 'pqf'); fish(480, 160, 1, t, 'pqf2', { ko: 1 });
    const o = { ...pipFeel('happy', t), lookX: .8 };
    TOON.pip(220, 560, 32, { ...o, key: 'pqp' }); earmuffs(220, 560, 32, o, 'pqe'); goggles(220, 560, 32, o, 'pqg');
    marshmallow(TOON.hand(220, 560, 32, o), -.4, 'pqm', { toast: op, char: op }); mallow(420, 380, .3, 'pqm2', { bite: .6 });
    jar(560, 470, .8, 'pqj'); jar(760, 470, .8, 'pqj2', { shatter: .4 });
    thermometer(120, 1000, .9, .7, 'pqt'); gauge(330, 860, 110, op, 'pqg'); sun(560, 840, 80, t, 'pqs');
    sub(1300, 960, .7, 'pqsb'); sandbag(860, 1050, .7, 'pqsg'); meter(1700, 980, .9, op, 'pqmt');
    mountain(1650, 360, .5, 'pqmn'); pot(1650, 470, .6, t, 'pqpt', 1);
    camEnd();
  };
  LOOPS.pistolProps2.len = 4;

  // ---------- a test sheet of the props ----------
  LOOPS.pistolProps = t => {
    camBegin(960, 540, 1);
    reef(t, 'pp');
    rock(1500, 870, 520, 300, 'pprk', { hole: [1420, 800, 70] });
    weed(260, 870, 220, t, 'ppw1'); weed(300, 870, 160, t, 'ppw2', '#7DBB8A');
    const op = .5 + .5 * Math.sin(t * 1.5);
    const sh = shrimp(1220, 860, .62, t, 'pps', { open: op, walk: t * .4 });
    jet(sh.tip[0], sh.tip[1], 1, 260, clamp(1 - op * 3), 'ppj', .62);
    bubble(700, 560, 60, 'ppb', { hot: .3 * (1 + Math.sin(t * 2)) / 2 });
    shockRings(700, 560, frac(t / 2), 'ppr', 300);
    const o = { ...pipFeel('calm', t), lookX: .8 };
    TOON.pip(420, 860, 36, { ...o, key: 'ppip' });
    headphones(420, 860, 36, o, 'pph');
    hydrophone(TOON.hand(420, 860, 36, { ...o, armF: [-.2, 2.2] }), -.25, 180, 'pphy');
    shrimp(960, 340, 1.0, t, 'pps2', { open: 1, flip: true });
    camEnd();
  };
  LOOPS.pistolProps.len = 4;

  function todo(t, lt, dur) { K.setT(t); camBegin(960, 540, 1); tank(t, 'todo'); K.swim(960, 760, 30, t, { ...pipFeel('confused', t) }, 'todo'); camEnd(); }
  shots([[0, shotA1], [L(3, -.9), shotA2], [L(5, -.1), shotB1], [L(8, -.9), shotC1], [L(11, -.9), shotC2], [L(12, -.9), shotD1], [L(14, -.9), shotE1], [L(16, -.9), shotR1], [L(17, -.9), shotK1]]);
})();

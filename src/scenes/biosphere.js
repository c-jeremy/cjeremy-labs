// biosphere.js: "Pip大战生物圈", 150 s, a wordless short in the spirit of "Animator vs. Math". Pip, a plum sprout at the
// bottom of the food chain, fights everything that tries to eat it and wins each round with real plant biology
// (cyanide in chewed plum leaves, ladybugs vs aphids vs ants, phages, the hypersensitive response, mycorrhiza), until it
// flicks the frog out of the food web and the grasshoppers boom. Swept to the deep sea, where its sunlight is useless,
// it sees the biosphere as one web and stops fighting. Then the shadow from the cold open returns: it's us.
// See storyboards/biosphere.md. No narration: every time is in seconds, on a 120 bpm grid (BEAT = .5 s).
(() => {
  const K = MK;
  const Z = {
    // worlds
    sky: '#CFE5E6', skyBlob: '#EAF3EC', noon: '#D8EBE0', meadow: '#A9C97A', meadowDk: '#7FA65A', meadowLt: '#C6DC98', far: '#BFD4A0',
    soil: '#A27A55', soilDk: '#7A5638', soilLt: '#C49C72', under: '#8E6A49', grain: '#B98E66', dark: '#2A2028',
    micro: '#E9E3CC', microBlob: '#F4F0E0', water: '#D9E8E2', root: '#EBDDB8', rootDk: '#C9B488', rootSick: '#8E7A5A',
    bare: '#B69A72', bareDk: '#8E7454', dusk: '#B9A68C', rain: '#9FB4B8',
    sea: '#6E9FC0', seaDk: '#3E6C93', deep: '#1E2A4A', deepBlob: '#2B3A5E', abyss: '#141B33', rock: '#3A3440', rockDk: '#29242E', vent: '#E8823A', plume: '#2A2630',
    space: '#1B2148', spaceBlob: '#27306A', ocean: '#4F8FC4', oceanDk: '#33689C', land: '#8DB86A', landDk: '#62914A', ice: '#F2F1EA', cloud: '#F6F4EC',
    // the cast
    hop: '#9AA845', hopDk: '#6A7A2C', hopLt: '#C5CF7E', hopEye: '#5B4A2E',
    aphid: '#B5D06A', aphidDk: '#7FA040', ant: '#5A3B32', antDk: '#3A2520', lady: '#D9483E', ladyDk: '#A83A33',
    bac: '#9E86C2', bacDk: '#6D579A', bacSick: '#C2B38A', phage: '#7FA3C8', phageDk: '#4E73A0', phageLt: '#B9D0E6', dna: '#E9B04A',
    virus: '#C2507E', virusDk: '#8E2F58', cellG: '#B7D88A', cellGDk: '#8FB866', mottle: '#E8DE7A', brown: '#9A6A3E', brownDk: '#6E4628',
    hypha: '#F4EEDD', hyphaDk: '#CFC3A2', mush: '#E9C9A0', mushDk: '#B98A5E', phos: '#EE8E3E', sugar: '#F2C14A',
    frog: '#79B04E', frogDk: '#4F8636', frogLt: '#CFE09A', tongue: '#E27A92', fly: '#3E3A44',
    worm: '#F1ECE0', wormDk: '#C9C0AC', plumeR: '#D9433F', plumeDk: '#A42B2E', mat: '#EFE9D6', tard: '#E2C9A6', tardDk: '#B8987A',
    bee: '#F0B840', beeDk: '#3A2E2C', petal: '#FBE6EC', petalDk: '#E9B4C4', stamen: '#F2C14A',
    steel: '#D9A43A', steelDk: '#9E7224', skin: '#E9B994', skinDk: '#C48E6A', tree: '#8B6A4C', treeDk: '#5E452F', bloom: '#F6D2DE',
    // codes
    cyan: '#A7C27A', cyanDk: '#7A5F9A', gold: '#F2C14A', goldLt: '#F8DC8A', red: '#D9534F'
  };
  const cam = (cx, cy, z) => camBegin(cx, cy, z);
  const near = (t, a, w = .3) => Math.exp(-Math.pow((t - a) / w, 2));
  const popK = (t, a, len = .35) => backOut(seg(t, a, a + len));
  const rotP = (P, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return P.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
  const rotEll = (x, y, rx, ry, n, rot) => rotP(ellPts(x, y, rx, ry, n), x, y, rot);

  // a tube along a path with a width profile wf(u), u 0..1: one outline (bodies that bulge in the middle)
  function tube(P, wf) {
    const C = through(P), n = C.length, Lf = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = wf(i / Math.max(1, n - 1)) / 2;
      Lf.push([C[i][0] - dy / d * w, C[i][1] + dx / d * w]); R.push([C[i][0] + dy / d * w, C[i][1] - dx / d * w]);
    }
    return { out: Lf.concat(R.reverse()), C };
  }
  function along(C, u) {
    const n = C.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i, a = C[i], b = C[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    return { p: [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], ang: Math.atan2(dy, dx), nx: -dy / d, ny: dx / d };
  }
  // a jointed leg: hip → knee → foot, as two tapered ribbons
  function leg(P, w, col, sw) { paint(ribbon(P.slice(0, 2), w, w * .75), { wash: col, ink: PAL.ink, sw }); paint(ribbon(P.slice(1), w * .6, w * .35), { wash: col, ink: PAL.ink, sw }); }

  // ================================ Pip, with a leaf that can be bitten ================================
  // pipX(x, y, u, o) = pip() plus: o.bite 0..1 (a scalloped notch out of the leaf's upper edge), o.chew 0..1 (the swarm:
  // both edges eaten to the midrib), o.spot 0..1 (the dry brown hypersensitive spot), o.mottle 0..1 (virus yellowing),
  // o.bloom 0..1 (a plum blossom opens on the stalk), o.glowK (photosynthesis glow on the leaf).
  function pipX(x, y, u, o = {}) {
    const P = window.paint, I = window.inkLine, bite = o.bite || 0, chew = o.chew || 0;
    let stalk = null;
    window.paint = (pts, po) => {
      if (!(po && po.wash === PIPC.leaf && po.fill === PIPC.leafDk && pts.length === 16)) return P(pts, po);
      const N = 32, Tp = [], Bt = [], up = (E, f) => { const i = Math.min(7, Math.floor(f * 8)), q = f * 8 - i; return [lerp(E[i][0], E[i + 1][0], q), lerp(E[i][1], E[i + 1][1], q)]; };
      const TE = pts.slice(0, 9), BE = [pts[0], ...pts.slice(9).reverse(), pts[8]];
      for (let n = 0; n <= N; n++) {
        const k = n / N, t0 = up(TE, Math.min(k, .9999)), b0 = up(BE, Math.min(k, .9999)), m = [(t0[0] + b0[0]) / 2, (t0[1] + b0[1]) / 2];
        const sc = q => .62 + .38 * Math.sqrt(Math.abs(Math.sin(q))), bw = k > .33 && k < .93 ? Math.pow(Math.sin(Math.PI * (k - .33) / .6), .4) : 0;
        const top = clamp(bite * .8 * bw * sc(k * Math.PI * 7) + chew * (.6 + .32 * sc(k * Math.PI * 9 + 1)), 0, .93);
        const bot = clamp(chew * (k > .12 ? .55 + .35 * sc(k * Math.PI * 8 + 2) : 0), 0, .93);
        Tp.push([lerp(t0[0], m[0], top), lerp(t0[1], m[1], top)]); Bt.push([lerp(b0[0], m[0], bot), lerp(b0[1], m[1], bot)]);
      }
      const out = [...Tp, ...Bt.slice(1, N).reverse()], mid = i => { const n = Math.round(i / 8 * N); return [(Tp[n][0] + Bt[n][0]) / 2, (Tp[n][1] + Bt[n][1]) / 2]; };
      const pts5 = Bt[Math.round(5 / 8 * N)];
      const col = o.mottle ? mixCol(PIPC.leaf, Z.mottle, .5 * o.mottle) : PIPC.leaf;
      P(out, { ...po, wash: col, curv: .15 });
      const m5 = mid(5), m3 = mid(3);
      if (o.mottle) for (let i = 0; i < 4; i++) { const q = .3 + i * .15, a = mid(Math.round(q * 8)); P(ellPts(a[0] + (i % 2 ? .1 : -.08) * u, a[1] + (i % 2 ? -.12 : .1) * u, .17 * u * o.mottle, .12 * u * o.mottle, 10), { wash: Z.mottle, washOp: 220, ink: null }); }
      if (o.spot) { const r = .26 * u * backOut(clamp(o.spot)); P(ellPts(lerp(m5[0], pts5[0], .35), lerp(m5[1], pts5[1], .35), r, r * .85, 12), { wash: Z.brown, fill: Z.brownDk, fillOp: 60, tex: .4, ink: Z.brownDk, sw: .6 }); }
      if (o.glowK) glow(m3[0], m3[1], 2.4 * u * o.glowK, '#FFD86A', o.glowK);
    };
    window.inkLine = (pts, sw, col, br, curv) => {
      if (col === PIPC.leafDk && br === 'ink' && pts.length === 3) stalk = pts;
      I(pts, sw, col, br, curv);
      if (col === PIPC.leafDk && br === 'inkfine' && stalk && (o.bloom || 0) > .02) {
        const s = stalk[0], q = [lerp(s[0], stalk[1][0], .7), lerp(s[1], stalk[1][1], .7)];
        blossom(q[0] - .55 * u, q[1] + .1 * u, .62 * u, o.bloom, 0, 'pb' + (o.key || ''), sw);
      }
    };
    try { pip(x, y, u, o); } finally { window.paint = P; window.inkLine = I; }
  }
  // Pip's leaf midpoint in world space (for viruses landing, aphids walking), mirroring pip.js's leaf geometry
  function leafAt(x, y, u, o, k = .5) {
    const dir = o.flip ? -1 : 1, sq = o.sq || 0, fx = (o.turn ?? .4) * .38 * u, la = (o.leaf || 0) + .12 * wob(T, .45, .3);
    const top = [fx * .3, -4.85 * u], tip = [top[0] + Math.sin(la) * 1.6 * u, top[1] - Math.cos(la) * 1.5 * u], ang = la - 1.05;
    const lx = tip[0] + Math.cos(ang) * k * 1.5 * u, ly = tip[1] + Math.sin(ang) * k * 1.5 * u, r = o.rot || 0;
    const sx = lx * dir * (1 + sq), sy = ly * (1 - sq), c = Math.cos(r), s = Math.sin(r);
    return [x + sx * c - sy * s, y + (o.dy || 0) * u + sx * s + sy * c, ang * dir];
  }

  // ================================ the cast ================================
  // A grasshopper, side view, facing dir. (x, y) = the ground under its middle legs; s ≈ body length / 2.6.
  // Abdomen (segmented), pronotum saddle, head with a big compound eye and mandibles, antennae, folded tegmina, the big
  // jumping hind legs (thick femur, thin tibia, folded Z). o.chomp 0..1, o.crouch 0..1, o.leap 0..1 (hind legs kick out),
  // o.sick 0..1 (green-grey tint + droop), o.bent (the B grasshopper's kinked antenna), o.lean.
  function grasshopper(x, y, s, t, o = {}) {
    const dir = o.dir ?? 1, sw = clamp(s / 60, .45, 1.2) * (o.sw || 1), cr = o.crouch || 0, lp = o.leap || 0, sick = o.sick || 0;
    const body = mixCol(o.col || Z.hop, '#A8A890', sick * .5), dk = mixCol(Z.hopDk, '#6E6E5E', sick * .4);
    boilSeed('gh' + (o.key || ''));
    push(); translate(x, y - s * (.55 - cr * .2) - lp * s * .25); scale(dir, 1); rotate((o.lean || 0) - lp * .2 + sick * .08);
    // far legs (darker, behind)
    leg([[-s * .05, s * .05], [-s * .2, s * .38 - cr * s * .1], [-s * .35, s * (.55 - cr * .2)]], s * .07, mixCol(dk, PAL.ink, .2), sw * .7);
    // hind leg, far side
    const hf = [[-s * .35, -s * .05], [-s * (1.05 + lp * .3), -s * (.45 - cr * .15 - lp * .5)], [-s * (1.25 + lp * .9), s * (.55 - cr * .2 + lp * .2)]];
    leg(hf.map(([a, b]) => [a + s * .08, b]), s * .14, mixCol(dk, PAL.ink, .15), sw * .7);
    // abdomen: a tapering segmented tube going back from the thorax
    const A = []; for (let i = 0; i <= 6; i++) { const q = i / 6; A.push([-s * .2 - q * s * 1.25, s * .02 + q * q * s * .12 + sick * q * s * .15]); }
    const TA = tube(A, q => s * (.42 - .22 * q));
    paint(TA.out, { wash: body, fill: dk, fillOp: 40, tex: .4, ink: PAL.ink, sw });
    for (let k = 1; k < 6; k++) { const a = along(TA.C, k / 6), w = s * (.42 - .22 * k / 6) / 2; inkLine([[a.p[0] + s * .02, a.p[1] - w * .9], [a.p[0] - s * .02, a.p[1] + w * .9]], sw * .5, dk, 'inkfine', .3); }
    // folded wings (tegmina) over the back
    paint([[s * .05, -s * .2], [-s * .6, -s * .3], [-s * 1.3, -s * .18], [-s * 1.45, -s * .05], [-s * .7, -s * .08], [s * .02, -s * .06]], { wash: mixCol(Z.hopLt, body, .4), fill: dk, fillOp: 30, tex: .4, ink: PAL.ink, sw: sw * .8, curv: .5 });
    inkLine([[0, -s * .15], [-s * .7, -s * .2], [-s * 1.3, -s * .12]], sw * .5, dk, 'inkfine', .5);
    // thorax + pronotum saddle
    paint(ellPts(s * .12, -s * .02, s * .34, s * .3, 18), { wash: body, fill: dk, fillOp: 35, tex: .4, ink: PAL.ink, sw });
    paint([[-s * .18, -s * .22], [s * .05, -s * .36], [s * .38, -s * .3], [s * .42, -s * .05], [s * .2, s * .05], [-s * .15, -s * .02]], { wash: mixCol(body, Z.hopLt, .3), ink: PAL.ink, sw: sw * .8, curv: .4 });
    // head: tilted, long face, big eye, mandibles
    const hx = s * .52, hy = -s * .08 + (o.chomp || 0) * s * .06;
    paint(rotEll(hx, hy, s * .24, s * .3, 18, .35), { wash: body, fill: dk, fillOp: 30, tex: .3, ink: PAL.ink, sw });
    paint(rotEll(hx + s * .04, hy - s * .1, s * .1, s * .13, 12, .3), { wash: Z.hopEye, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(hx + s * .07, hy - s * .14, s * .03, s * .03, 6), { wash: PAL.cream, washOp: 200, ink: null });
    const ch = (o.chomp || 0);
    inkLine([[hx + s * .15, hy + s * .2], [hx + s * (.26 + ch * .08), hy + s * (.3 + ch * .05)]], sw * 1.4, dk, 'ink', 0);
    inkLine([[hx + s * .08, hy + s * .24], [hx + s * (.16 - ch * .04), hy + s * (.36 + ch * .06)]], sw * 1.2, dk, 'ink', 0);
    // antennae (one kinked on the B hopper)
    for (const [k, ph] of [[0, 0], [1, 1.3]]) {
      const a = -1.2 + k * .25 + .15 * Math.sin(t * 6 + ph + (o.seed || 0)) + sick * .9, b = a + (o.bent && k === 0 ? .9 : .25);
      inkLine([[hx + s * .05, hy - s * .25], [hx + s * .05 + Math.cos(a) * s * .5, hy - s * .25 + Math.sin(a) * s * .5], [hx + s * .05 + Math.cos(a) * s * .5 + Math.cos(b) * s * .45, hy - s * .25 + Math.sin(a) * s * .5 + Math.sin(b) * s * .45]], sw * .9, dk, 'ink', .4);
    }
    // near legs: front, middle, and the big hind leg on top
    const st = o.step ? Math.sin(o.step * TAU) * s * .08 : 0;
    leg([[s * .3, s * .12], [s * .45 + st, s * .38 - cr * s * .1], [s * .55 + st, s * (.55 - cr * .2)]], s * .07, body, sw * .8);
    leg([[s * .02, s * .15], [-s * .05 - st, s * .4 - cr * s * .1], [-s * .2 - st, s * (.55 - cr * .2)]], s * .07, body, sw * .8);
    paint(ribbon(hf.slice(0, 2), s * .24, s * .13), { wash: mixCol(body, Z.hopLt, .15), fill: dk, fillOp: 30, tex: .3, ink: PAL.ink, sw });
    for (let i = 1; i < 6; i++) { const q = i / 6, px = lerp(hf[0][0], hf[1][0], q), py = lerp(hf[0][1], hf[1][1], q); inkLine([[px - s * .05, py - s * .05], [px + s * .02, py + s * .06]], sw * .4, dk, 'inkfine', 0); }
    paint(ribbon(hf.slice(1), s * .07, s * .05), { wash: mixCol(body, '#C9735A', .25), ink: PAL.ink, sw: sw * .8 });
    for (let i = 1; i < 5; i++) { const q = i / 5, px = lerp(hf[1][0], hf[2][0], q), py = lerp(hf[1][1], hf[2][1], q); inkLine([[px, py], [px + s * .05, py - s * .02]], sw * .5, PAL.ink, 'inkfine', 0); }
    pop();
    return { mouth: [x + dir * (hx + s * .24), y - s * (.55 - cr * .2) - lp * s * .25 + hy + s * .32], head: [x + dir * hx, y - s * (.55 - cr * .2) + hy - s * .3] };
  }
  // An aphid: a pear-shaped body with two cornicles (tail pipes), six thin legs, long antennae and a stylet.
  // (x, y) = its feet; dir faces; o.swell 0..1; o.stab 0..1 (stylet down); o.step phase.
  function aphid(x, y, s, t, o = {}) {
    const dir = o.dir ?? 1, sw = clamp(s / 40, .4, 1), sw2 = 1 + (o.swell || 0) * .35;
    boilSeed('ap' + (o.key || ''));
    push(); translate(x, y); rotate(o.ang || 0); scale(dir, 1);
    for (let i = 0; i < 3; i++) { const bx = -s * .25 + i * s * .3, ph = (o.step || 0) * TAU + i * 2; inkLine([[bx, -s * .3], [bx + s * .12 + Math.sin(ph) * s * .08, -s * .2], [bx + s * .05 + Math.sin(ph) * s * .12, 0]], sw * .8, Z.aphidDk, 'inkfine', .3); }
    paint(ellPts(-s * .1, -s * .45 * sw2, s * .55 * sw2, s * .38 * sw2, 18), { wash: Z.aphid, fill: Z.aphidDk, fillOp: 40, tex: .4, ink: PAL.ink, sw });
    for (const k of [0, 1]) inkLine([[-s * .45, -s * (.6 + k * .1) * sw2], [-s * .72, -s * (.78 + k * .1) * sw2]], sw * 1.6, Z.aphidDk, 'ink', 0);
    paint(ellPts(s * .42, -s * .42, s * .2, s * .18, 12), { wash: Z.aphid, ink: PAL.ink, sw });
    paint(ellPts(s * .48, -s * .48, s * .05, s * .05, 6), { wash: '#8E3B3B', ink: null });
    inkLine([[s * .5, -s * .55], [s * .8, -s * .95], [s * 1.0, -s * 1.0]], sw * .6, Z.aphidDk, 'inkfine', .5);
    inkLine([[s * .45, -s * .3], [s * (.55 + (o.stab || 0) * .05), -s * (.15 - (o.stab || 0) * .3)]], sw * .9, PAL.ink, 'ink', 0);
    pop();
  }
  // An ant: head with elbowed antennae and mandibles, thorax, a petiole node, a big gaster; six legs on a walk cycle.
  // (x, y) = feet, dir faces. o.step phase, o.bite 0..1 (mandibles open), o.tap 0..1 (antennae reach forward).
  function ant(x, y, s, t, o = {}) {
    const dir = o.dir ?? 1, sw = clamp(s / 40, .4, 1), ph = (o.step || 0) * TAU;
    boilSeed('an' + (o.key || ''));
    push(); translate(x, y); rotate(o.ang || 0); scale(dir, 1);
    for (let i = 0; i < 3; i++) { const bx = -s * .05 + i * s * .14, sd = i % 2 ? 1 : -1, sp = Math.sin(ph + i * 2.1) * s * .14;
      inkLine([[bx, -s * .32], [bx + (i - 1) * s * .25 + sp, -s * .42], [bx + (i - 1) * s * .4 + sp * 1.3, 0]], sw * 1.2, Z.antDk, 'ink', .2); }
    paint(ellPts(-s * .55, -s * .38, s * .36, s * .26, 16), { wash: Z.ant, fill: Z.antDk, fillOp: 50, tex: .4, ink: PAL.ink, sw });
    paint(ellPts(-s * .17, -s * .36, s * .09, s * .1, 8), { wash: Z.ant, ink: PAL.ink, sw: sw * .7 });
    paint(rotEll(s * .1, -s * .4, s * .22, s * .12, 12, -.15), { wash: Z.ant, ink: PAL.ink, sw });
    paint(ellPts(s * .45, -s * .45, s * .18, s * .16, 12), { wash: Z.ant, fill: Z.antDk, fillOp: 40, ink: PAL.ink, sw });
    paint(ellPts(s * .5, -s * .5, s * .045, s * .045, 6), { wash: PAL.cream, washOp: 160, ink: null });
    const b = o.bite || 0;
    inkLine([[s * .58, -s * .38], [s * (.72 + b * .06), -s * (.42 + b * .1)]], sw * 1.2, Z.antDk, 'ink', 0);
    inkLine([[s * .58, -s * .36], [s * (.74 + b * .04), -s * (.3 - b * .08)]], sw * 1.2, Z.antDk, 'ink', 0);
    for (const k of [0, 1]) { const tp = (o.tap || 0) * .6, w = .15 * Math.sin(t * 8 + k * 2); inkLine([[s * .48, -s * .6], [s * (.62 + k * .05), -s * (.9 - tp * .2)], [s * (.95 + tp * .2), -s * (.85 - tp * .45) + w * s]], sw * .9, Z.antDk, 'ink', .1); }
    pop();
  }
  // A ladybug, side view: domed red elytra with spots, black pronotum with white flecks, legs; o.fly 0..1 lifts the
  // elytra and blurs the wings. (x, y) = feet.
  function ladybug(x, y, s, t, o = {}) {
    const dir = o.dir ?? 1, sw = clamp(s / 40, .5, 1.1), fly = o.fly || 0;
    boilSeed('lb' + (o.key || ''));
    push(); translate(x, y); rotate(o.ang || 0); scale(dir, 1);
    if (fly < .5) for (let i = 0; i < 3; i++) { const bx = -s * .3 + i * s * .3, sp = Math.sin((o.step || 0) * TAU + i * 2) * s * .08; inkLine([[bx, -s * .2], [bx + s * .1 + sp, -s * .1], [bx + sp, 0]], sw * 1.1, PAL.ink, 'ink', .2); }
    if (fly > 0) for (let j = 0; j < 2; j++) paint(rotEll(-s * .2, -s * .9, s * .6, s * .2, 14, -.9 + j * .5 + .3 * Math.sin(t * 60 + j)), { wash: '#F2F0EA', washOp: 110 * fly, ink: mixCol(PAL.ink, '#F2F0EA', .5), sw: sw * .5 });
    paint(ellPts(s * .55, -s * .28, s * .24, s * .2, 12), { wash: Z.beeDk, ink: PAL.ink, sw });
    paint(ellPts(s * .5, -s * .38, s * .05, s * .04, 6), { wash: PAL.cream, ink: null });
    const lift = fly * .5;
    push(); translate(s * .3, -s * .3); rotate(-lift);
    paint([[-s * 1.0, 0], [-s * .9, -s * .5], [-s * .45, -s * .72], [0, -s * .55], [s * .15, -s * .05]], { wash: Z.lady, fill: Z.ladyDk, fillOp: 40, tex: .3, ink: PAL.ink, sw, curv: .6 });
    [[-.75, -.28], [-.45, -.5], [-.25, -.2], [-.05, -.4]].forEach(([a, b]) => paint(ellPts(a * s, b * s, s * .09, s * .08, 8), { wash: Z.beeDk, ink: null }));
    paint(ellPts(-s * .4, -s * .55, s * .2, s * .07, 8), { wash: PAL.cream, washOp: 120, ink: null });
    pop();
    paint(ellPts(s * .3, -s * .3, s * .14, s * .16, 10), { wash: Z.beeDk, ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(s * .32, -s * .38, s * .04, s * .04, 6), { wash: PAL.cream, ink: null });
    pop();
  }
  // A rod bacterium: a capsule with a face (cells get faces), several flagella trailing behind, wiggling.
  // (x, y) centre; ang = heading; o.mood; o.swell 0..1; o.pop 0..1 (bursting: the wall splits into shards);
  // o.sick 0..1 (paler); o.inside(): drawn inside (new phage heads).
  function bacterium(x, y, s, ang, t, o = {}) {
    const sw = clamp(s / 50, .5, 1.2), sick = o.sick || 0, sw2 = 1 + (o.swell || 0) * .35, col = mixCol(Z.bac, Z.bacSick, sick), dk = mixCol(Z.bacDk, '#8E8064', sick);
    boilSeed('bc' + (o.key || ''));
    push(); translate(x, y); rotate(ang);
    if ((o.pop || 0) > 0) {
      const k = o.pop;
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, d = s * (.3 + 1.6 * easeOut(k)); push(); translate(Math.cos(a) * d, Math.sin(a) * d * .6); rotate(a + k * 2);
        paint([[-s * .25, -s * .1], [s * .2, -s * .14], [s * .25, s * .06], [-s * .2, s * .1]], { wash: col, washOp: 255 * (1 - k), ink: PAL.ink, sw: sw * .6 }); pop(); }
      pop(); return;
    }
    for (let i = 0; i < 4; i++) { const P = []; for (let j = 0; j <= 10; j++) { const q = j / 10; P.push([-s * .95 - q * s * 1.3, (i - 1.5) * s * .12 + Math.sin(q * 9 - t * 14 + i) * s * .12 * q]); } inkLine(P, sw * .8, dk, 'ink', .6); }
    paint(rrPts(-s * sw2, -s * .45 * sw2, s * 2 * sw2, s * .9 * sw2, s * .45 * sw2), { wash: col, fill: dk, fillOp: 45, tex: .5, ink: PAL.ink, sw });
    paint(ellPts(-s * .3, s * .1, s * .45, s * .16, 12), { fill: dk, fillOp: 70, bleed: .1, ink: null });
    if (o.inside) o.inside();
    pop();
    const fa = ang, fx = x + Math.cos(fa) * s * .45, fy = y + Math.sin(fa) * s * .45;
    K.face(fx, fy - s * .05, s * .38, t, { mood: o.mood || 'angry', lx: o.lx ?? Math.cos(ang), ly: o.ly ?? 0, seed: o.seed || 0, blush: false });
  }
  // A T4-like phage: an icosahedral head (a hexagon with facets), a collar, a striped tail sheath that contracts,
  // a baseplate and six bent tail fibres. (x, y) = the baseplate; ang 0 = standing upright. o.contract 0..1, o.dnaK 0..1
  // (the DNA leaves the head and runs down the tail), o.spread 0..1 (fibres open for landing).
  function phage(x, y, s, ang, t, o = {}) {
    const sw = clamp(s / 50, .5, 1.2), c = o.contract || 0, sp = o.spread ?? 1, tl = s * (1.1 - .45 * c), k = o.key || '';
    boilSeed('ph' + k);
    push(); translate(x, y); rotate(ang);
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) {
      const a0 = sd * (.35 + i * .35) * sp, kx = sd * s * (.35 + i * .18) * (.5 + .5 * sp), ky = -s * (.25 - .1 * sp) + i * s * .02;
      inkLine([[sd * s * .1, -s * .05], [kx, ky], [kx + sd * s * .2 * Math.cos(a0 * .3), s * .25 * sp + i * s * .02]], sw * (i === 1 ? 1.1 : .8), i === 1 ? Z.phageDk : mixCol(Z.phageDk, PAL.ink, .2), 'ink', .1);
    }
    paint(rrPts(-s * .22, -s * .12, s * .44, s * .12, s * .03), { wash: Z.phageDk, ink: PAL.ink, sw });
    paint(rectPts(-s * .13 * (1 + c * .6), -s * .12 - tl, s * .26 * (1 + c * .6), tl), { wash: Z.phage, ink: PAL.ink, sw });
    for (let i = 1; i < 7; i++) inkLine([[-s * .13 * (1 + c * .6), -s * .12 - tl * i / 7], [s * .13 * (1 + c * .6), -s * .12 - tl * i / 7]], sw * .5, Z.phageDk, 'inkfine', 0);
    if (c > 0) paint(rectPts(-s * .05, -s * .12, s * .1, s * .45 * c), { wash: Z.phageLt, ink: PAL.ink, sw: sw * .6 });   // the inner tube punches through
    const hy = -s * .12 - tl - s * .1;
    paint(rectPts(-s * .2, hy, s * .4, s * .1), { wash: Z.phageDk, ink: PAL.ink, sw: sw * .8 });
    const H = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; H.push([Math.cos(a) * s * .48, hy - s * .52 + Math.sin(a) * s * .6]); }
    paint(H, { wash: Z.phageLt, fill: Z.phage, fillOp: 50, tex: .4, ink: PAL.ink, sw: sw * 1.1 });
    inkLine([H[5], [0, hy - s * .52], H[1]], sw * .5, Z.phageDk, 'inkfine', 0); inkLine([[0, hy - s * .52], H[3]], sw * .5, Z.phageDk, 'inkfine', 0);
    const dk = o.dnaK ?? 0;
    if (dk < 1) { const P = []; for (let i = 0; i <= 10; i++) { const q = i / 10; P.push([Math.sin(q * 14 + t * 3) * s * .2 * (1 - q * .3), hy - s * .85 + q * s * .65]); } inkLine(P, sw * 1.4, mixCol(Z.dna, Z.phageLt, dk), 'ink', .6); }
    if (dk > 0 && dk < 1) { const yy = lerp(hy - s * .2, s * .4, dk); const P = []; for (let i = 0; i <= 6; i++) P.push([Math.sin(i * 1.6 + t * 12) * s * .05, yy - s * .3 + i * s * .06]); inkLine(P, sw * 1.6, Z.dna, 'ink', .6); }
    pop();
  }
  // a virus rod (tobacco mosaic virus): a rigid tube with a helical stripe; no face (viruses aren't cells)
  function virusRod(x, y, s, ang, o = {}) {
    boilSeed('vr' + (o.key || ''));
    push(); translate(x, y); rotate(ang);
    paint(rrPts(-s, -s * .16, s * 2, s * .32, s * .1), { wash: Z.virus, fill: Z.virusDk, fillOp: 50, tex: .4, ink: PAL.ink, sw: clamp(s / 40, .5, 1) });
    for (let i = 1; i < 9; i++) inkLine([[-s + i * s * .22, -s * .16], [-s + i * s * .22 + s * .08, s * .16]], .6, Z.virusDk, 'inkfine', 0);
    pop();
  }
  // a fly, small, buzzing (wings a pale blur)
  function fly(x, y, s, t, key) {
    boilSeed('fl' + key);
    for (const sd of [-1, 1]) paint(rotEll(x + sd * s * .3, y - s * .45, s * .45, s * .2, 10, sd * (.5 + .4 * Math.sin(t * 70 + sd))), { wash: '#F2F2EE', washOp: 140, ink: mixCol(PAL.ink, '#F2F2EE', .5), sw: .5 });
    paint(ellPts(x, y, s * .45, s * .3, 10), { wash: Z.fly, ink: PAL.ink, sw: .7 });
    paint(ellPts(x + s * .38, y - s * .05, s * .16, s * .16, 8), { wash: '#A8423A', ink: null });
  }
  // A frog, sitting, side view: a squat body, folded hind legs, front legs, a big eye on top of the head, a wide mouth.
  // (x, y) = the ground under it; dir faces. o.tongue: [tx, ty] world target + o.tk 0..1 (out and back); o.leap 0..1
  // stretches it out mid-air; o.gulp 0..1 throat puff.
  function frog(x, y, s, t, o = {}) {
    const dir = o.dir ?? 1, sw = clamp(s / 60, .5, 1.2), lp = o.leap || 0, br = .02 * Math.sin(t * 3);
    boilSeed('fg' + (o.key || ''));
    push(); translate(x, y); scale(dir, 1); rotate(-lp * .5);
    if (lp > .2) {
      paint(ribbon([[-s * .4, -s * .4], [-s * 1.1, -s * .2], [-s * 1.7, -s * .05]], s * .32, s * .12), { wash: Z.frogDk, ink: PAL.ink, sw });
      paint(rotEll(0, -s * .5, s * .75, s * .4, 20, -.1), { wash: Z.frog, fill: Z.frogDk, fillOp: 40, tex: .4, ink: PAL.ink, sw });
      paint(ribbon([[s * .3, -s * .3], [s * .7, -s * .05], [s * 1.0, s * .05]], s * .14, s * .1), { wash: Z.frog, ink: PAL.ink, sw: sw * .8 });
    } else {
      paint(ribbon([[-s * .5, -s * .25], [-s * .1, -s * .1], [-s * .55, -s * .02], [-s * .1, 0]], s * .34, s * .16), { wash: Z.frogDk, ink: PAL.ink, sw });
      paint([[-s * .75, -s * .1], [-s * .7, -s * (.6 + br)], [-s * .2, -s * (.85 + br)], [s * .45, -s * (.85 + br)], [s * .8, -s * .55], [s * .6, -s * .12], [0, -s * .02]], { wash: Z.frog, fill: Z.frogDk, fillOp: 40, tex: .4, ink: PAL.ink, sw, curv: .6 });
      paint(ellPts(s * .1, -s * .25, s * .5, s * .17 * (1 + (o.gulp || 0) * .8), 14), { wash: Z.frogLt, ink: null });
      paint(ribbon([[-s * .35, -s * .35], [-s * .15, -s * .55], [s * .1, -s * .3], [-s * .05, -s * .02]], s * .26, s * .14), { wash: mixCol(Z.frog, Z.frogDk, .4), ink: PAL.ink, sw: sw * .8, curv: .5 });
      paint(ribbon([[s * .45, -s * .35], [s * .5, -s * .15], [s * .55, 0]], s * .12, s * .1), { wash: Z.frog, ink: PAL.ink, sw: sw * .8 });
      paint(ellPts(s * .58, -s * .02, s * .12, s * .05, 8), { wash: Z.frog, ink: PAL.ink, sw: sw * .7 });
    }
    // eye, mouth line
    const ex = s * .4, ey = -s * (.88 + br) + (lp > .2 ? s * .2 : 0);
    paint(ellPts(ex, ey, s * .19, s * .17, 14), { wash: Z.frog, ink: PAL.ink, sw });
    paint(ellPts(ex + s * .03, ey - s * .01, s * .12, s * .11, 12), { wash: '#E7C54A', ink: PAL.ink, sw: sw * .6 });
    paint(ellPts(ex + s * .05, ey - s * .01, s * .1, s * .045, 10), { wash: PAL.ink, ink: null });
    if (lp <= .2) inkLine([[s * .78, -s * .52], [s * .4, -s * .45], [s * .1, -s * .5]], sw * .8, PAL.ink, 'ink', .5);
    pop();
    // the tongue: from the mouth corner to the target and back, a pink ribbon with a round tip
    if (o.tongue && (o.tk || 0) > 0) {
      const m = [x + dir * s * .76, y - s * .52], k = Math.sin(clamp(o.tk) * Math.PI), tx = lerp(m[0], o.tongue[0], k), ty = lerp(m[1], o.tongue[1], k);
      boilSeed('tg' + (o.key || ''));
      paint(ribbon([m, [lerp(m[0], tx, .5), lerp(m[1], ty, .5) - s * .1 * k], [tx, ty]], s * .1, s * .14), { wash: Z.tongue, ink: PAL.ink, sw: sw * .7 });
      paint(ellPts(tx, ty, s * .12, s * .12, 10), { wash: Z.tongue, ink: PAL.ink, sw: sw * .7 });
      return [tx, ty];
    }
    return null;
  }
  // fungus: a hypha as a pale branching thread; a mushroom (cap, gills, stem) for the fruiting body
  function hypha(P, k, w, key) { if (k <= .01) return; boilSeed('hy' + key); const C = through(P, 6), n = Math.max(2, Math.round(C.length * clamp(k))); inkLine(C.slice(0, n), w + 1.6, Z.hyphaDk, 'ink', .4); inkLine(C.slice(0, n), w, Z.hypha, 'ink', .4); return C[n - 1]; }
  function mushroom(x, y, s, k, key) {
    if (k <= .02) return; boilSeed('mu' + key); const q = backOut(clamp(k));
    push(); translate(x, y); scale(q, q);
    paint([[-s * .14, 0], [-s * .1, -s * .7], [s * .1, -s * .7], [s * .14, 0]], { wash: Z.hypha, fill: Z.hyphaDk, fillOp: 40, ink: PAL.ink, sw: 1 });
    paint([[-s * .55, -s * .62], [-s * .45, -s * .95], [0, -s * 1.12], [s * .45, -s * .95], [s * .55, -s * .62]], { wash: Z.mush, fill: Z.mushDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.1, curv: .6 });
    for (let i = -3; i <= 3; i++) inkLine([[i * s * .07, -s * .64], [i * s * .11, -s * .62]], .6, Z.mushDk, 'inkfine', 0);
    pop();
  }
  // deep-sea cast: a tube worm (white tube, red plume), a tardigrade (segmented barrel, eight stubby clawed legs)
  function tubeWorm(x, y, h, t, i, o = {}) {
    boilSeed('tw' + i);
    const sway = .12 * Math.sin(t * 1.2 + i * 1.7), P = [[x, y], [x + sway * h * .3, y - h * .5], [x + sway * h * .7, y - h]];
    paint(ribbon(P, h * .11, h * .085), { wash: Z.worm, fill: Z.wormDk, fillOp: 40, tex: .5, ink: PAL.ink, sw: 1 });
    for (let k = 1; k < 5; k++) { const a = along(through(P, 4), k / 5); inkLine([[a.p[0] - h * .05, a.p[1]], [a.p[0] + h * .045, a.p[1] - h * .01]], .6, Z.wormDk, 'inkfine', .3); }
    const tp = P[2], open = o.open ?? 1;
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .35 * open + sway, L = h * (.22 + .04 * Math.sin(t * 3 + k + i)) * (.4 + .6 * open);
      paint(ribbon([[tp[0], tp[1]], [tp[0] + Math.cos(a) * L * .6, tp[1] + Math.sin(a) * L * .6 - h * .02], [tp[0] + Math.cos(a) * L, tp[1] + Math.sin(a) * L]], h * .07, h * .03), { wash: Z.plumeR, fill: Z.plumeDk, fillOp: 50, ink: PAL.ink, sw: .8 }); }
  }
  function tardigrade(x, y, s, t, o = {}) {
    const dir = o.dir ?? 1, sw = clamp(s / 50, .5, 1.2), sq = o.sq || 0;
    boilSeed('td' + (o.key || ''));
    push(); translate(x, y); rotate(o.rot || 0); scale(dir * (1 + sq), 1 - sq);
    for (let i = 0; i < 4; i++) { const lx = -s * .75 + i * s * .5, ph = Math.sin(t * 6 + i * 1.4) * s * .08;
      paint(ribbon([[lx, s * .1], [lx + ph, s * .45]], s * .22, s * .16), { wash: Z.tard, ink: PAL.ink, sw: sw * .8 });
      for (let c = -1; c <= 1; c += 2) inkLine([[lx + ph + c * s * .04, s * .52], [lx + ph + c * s * .1, s * .62]], sw * .8, PAL.ink, 'ink', 0); }
    const B = []; for (let i = 0; i <= 6; i++) { const q = i / 6; B.push([-s * 1.0 + q * s * 2.0, -s * .02 * Math.sin(q * Math.PI)]); }
    const TB = tube(B, q => s * (.55 + .35 * Math.sin(q * Math.PI)) * (q > .9 ? .8 : 1));
    paint(TB.out, { wash: Z.tard, fill: Z.tardDk, fillOp: 45, tex: .55, ink: PAL.ink, sw });
    for (let k = 1; k < 5; k++) { const a = along(TB.C, k / 5), w = s * (.55 + .35 * Math.sin(k / 5 * Math.PI)) / 2; inkLine([[a.p[0], a.p[1] - w * .95], [a.p[0] + s * .05, a.p[1]], [a.p[0], a.p[1] + w * .9]], sw * .6, Z.tardDk, 'inkfine', .6); }
    paint(ellPts(s * 1.02, -s * .02, s * .1, s * .1, 8), { wash: Z.tardDk, ink: PAL.ink, sw: sw * .6 });   // the snout
    paint(ellPts(s * .78, -s * .2, s * .045, s * .045, 6), { wash: PAL.ink, ink: null });                    // an eyespot
    pop();
  }
  // a honeybee: striped abdomen, fuzzy thorax, head, translucent wings, legs (pollen basket on the hind leg)
  function bee(x, y, s, t, o = {}) {
    const dir = o.dir ?? 1, sw = clamp(s / 40, .45, 1);
    boilSeed('be' + (o.key || ''));
    push(); translate(x, y); scale(dir, 1); rotate(o.ang || 0);
    for (let i = 0; i < 3; i++) inkLine([[-s * .1 + i * s * .2, s * .15], [-s * .15 + i * s * .2, s * .45]], sw * .9, Z.beeDk, 'ink', .3);
    paint(ellPts(-s * .2, s * .45, s * .1, s * .08, 8), { wash: Z.sugar, ink: PAL.ink, sw: sw * .5 });
    paint(rotEll(-s * .55, s * .05, s * .48, s * .32, 16, .2), { wash: Z.bee, fill: '#C88E28', fillOp: 40, tex: .3, ink: PAL.ink, sw });
    for (let k = 0; k < 3; k++) inkLine([[-s * (.35 + k * .2), -s * .22 + k * s * .04], [-s * (.42 + k * .2), s * .34 - k * s * .02]], sw * 2.4, Z.beeDk, 'ink', .4);
    paint(ellPts(0, 0, s * .3, s * .28, 14), { wash: '#C99A50', fill: '#8E6A34', fillOp: 50, tex: .7, ink: PAL.ink, sw });
    paint(ellPts(s * .38, s * .02, s * .2, s * .2, 12), { wash: Z.beeDk, ink: PAL.ink, sw });
    paint(ellPts(s * .42, -s * .04, s * .07, s * .1, 8), { wash: '#5A4A44', ink: null });
    inkLine([[s * .48, -s * .14], [s * .62, -s * .42], [s * .72, -s * .4]], sw * .7, Z.beeDk, 'ink', .4);
    for (let j = 0; j < 2; j++) paint(rotEll(-s * .1 - j * s * .15, -s * .45, s * .4, s * .18, 12, -.5 + j * .35 + .35 * Math.sin(t * 60 + j * 2)), { wash: '#F4F6F4', washOp: 130, ink: mixCol(PAL.ink, '#F4F6F4', .5), sw: sw * .5 });
    pop();
  }
  // a plum blossom, face on: five round petals, a ring of stamens, a gold centre. k 0..1 opens it from a bud.
  function blossom(x, y, s, k, rot, key, swIn) {
    boilSeed('bl' + key); const q = backOut(clamp(k)), sw = swIn ? swIn * .6 : clamp(s / 40, .4, 1);
    if (k < .35) { paint(ellPts(x, y, s * .25 * (.5 + k), s * .3 * (.5 + k), 10), { wash: Z.petalDk, ink: PAL.ink, sw }); return; }
    for (let i = 0; i < 5; i++) { const a = rot + i / 5 * TAU - Math.PI / 2, r = s * .5 * q; paint(ellPts(x + Math.cos(a) * r * .62, y + Math.sin(a) * r * .62, r * .5, r * .5, 12), { wash: Z.petal, fill: Z.petalDk, fillOp: 40, tex: .3, ink: PAL.ink, sw }); }
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = s * .26 * q; inkLine([[x, y], [x + Math.cos(a) * r, y + Math.sin(a) * r]], sw * .5, '#C9A040', 'inkfine', 0); paint(ellPts(x + Math.cos(a) * r, y + Math.sin(a) * r, s * .03, s * .03, 6), { wash: Z.stamen, ink: null }); }
    paint(ellPts(x, y, s * .08 * q, s * .08 * q, 8), { wash: '#B9D06A', ink: PAL.ink, sw: sw * .5 });
  }
  // a cyanide puff: sickly green-violet curls that swell and fade (k 0..1)
  function puff(x, y, s, k, key) {
    if (k <= 0 || k >= 1) return; boilSeed('pf' + key);
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + hash(i) * .6, d = s * (.2 + .9 * easeOut(k)) * (.6 + .4 * hash(i + 3)), r = s * (.18 + .25 * easeOut(k)) * (.7 + .5 * hash(i + 5));
      paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d * .8 - k * s * .4, r, r * .85, 12), { wash: i % 2 ? Z.cyan : mixCol(Z.cyan, Z.cyanDk, .5), washOp: 230 * (1 - k * k), ink: mixCol(Z.cyanDk, PAL.ink, .3), sw: .7 }); }
  }
  // a dizzy swirl over a head (no letters): a spiral and two orbiting stars
  function dizzy(x, y, s, t, k, key) {
    if (k <= .02) return; boilSeed('dz' + key);
    const P = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU * 1.6 + t * 6, r = s * .5 * i / 20; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r * .45]); }
    inkLine(P, 1.2, PAL.ink, 'ink', .6);
    for (let i = 0; i < 2; i++) { const a = t * 5 + i * Math.PI; paint(starPts(x + Math.cos(a) * s * .7, y + Math.sin(a) * s * .25, s * .16 * k, .4, 5), { wash: PIPC.gold, ink: PAL.ink, sw: .6 }); }
  }

  // the human side: a bulldozer blade with a wall of pushed earth; a big hand (palm down, fingers as ribbons)
  function blade(x, y, s, t, key) {
    boilSeed('bd' + key);
    auditBox('prop', 'blade', x - s * .2, y - s * 1.3, x + s * 2.5, y + s * .1);
    for (let i = 0; i < 9; i++) { const bx = x - s * .3 - hash(i) * s * .5, by = y - hash(i + 4) * s * .9; paint(ellPts(bx, by, s * (.18 + .1 * hash(i + 7)), s * .14, 10, 3), { wash: i % 2 ? Z.soil : Z.soilDk, ink: PAL.ink, sw: 1 }); }
    paint([[x, y], [x - s * .12, y - s * .6], [x, y - s * 1.2], [x + s * .3, y - s * 1.25], [x + s * .26, y]], { wash: Z.steel, fill: Z.steelDk, fillOp: 50, tex: .6, ink: PAL.ink, sw: 1.4, curv: .4 });
    for (let i = 1; i < 4; i++) inkLine([[x + s * .02 - (i === 2 ? s * .1 : 0), y - s * .3 * i], [x + s * .26, y - s * .3 * i]], 1, Z.steelDk, 'ink', 0);
    paint(rectPts(x + s * .26, y - s * .8, s * 2.4, s * .16), { wash: Z.steelDk, ink: PAL.ink, sw: 1.2 });
    paint(rectPts(x + s * .26, y - s * .3, s * 2.4, s * .16), { wash: Z.steelDk, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(x + s * .8, y - s * .28, s * 2.2, s * .3, s * .14), { wash: '#4A4248', ink: PAL.ink, sw: 1.2 });
    for (let i = 0; i < 8; i++) paint(ellPts(x + s * (.95 + i * .27), y - s * .13, s * .07, s * .07, 8), { wash: '#6A6068', ink: null });
  }
  // the hand, seen from the back, reaching down: a shirt cuff, a tapered forearm and wrist, the back of the hand with
  // knuckle bumps, four jointed fingers (middle longest) with nails and creases, and a thumb on the side.
  // (x, y) = the knuckles' middle; ang points the fingers (π/2 = straight down); s ≈ half the hand's width.
  // o.curl 0..1 bends the fingers in; o.cup 0..1 a scooping cup (fingers in, thumb across); o.spread 0..1.
  function hand(x, y, s, ang, o = {}) {
    boilSeed('hd' + (o.key || ''));
    auditBox('prop', 'hand', x - s * 1.4, y - s * 3, x + s * 1.4, y + s * 1.4);
    const cu = clamp((o.curl || 0) + (o.cup || 0) * .6), sp = o.spread ?? .4, sw = clamp(s / 70, .7, 1.5);
    const skin = Z.skin, dk = Z.skinDk, lt = '#F3CDB0', crease = mixCol(dk, PAL.ink, .25);
    push(); translate(x, y); rotate(ang - Math.PI / 2);
    // the shirt cuff and sleeve, running back off-frame (the forearm is one outline with the hand, below)
    paint([[-s * 1.1, -s * 2.85], [s * 1.12, -s * 2.85], [s * 1.18, -s * 3.45], [-s * 1.16, -s * 3.45]], { wash: '#7E95B6', fill: '#5B7298', fillOp: 45, tex: .5, ink: PAL.ink, sw, curv: .2 });
    paint([[-s * 1.22, -s * 3.4], [s * 1.24, -s * 3.4], [s * 1.34, -s * 6.2], [-s * 1.34, -s * 6.2]], { wash: '#93A8C6', fill: '#6F86AC', fillOp: 40, tex: .5, ink: PAL.ink, sw });
    for (const bx of [-.5, .55]) paint(ellPts(bx * s, -s * 3.15, s * .07, s * .07, 8), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
    // the thumb: from the side of the hand, two segments and a nail
    const tc = o.cup || 0, T0 = [s * .6, -s * 1.0], T1 = [s * (.98 - tc * .2), -s * (.38 + tc * .05)], T2 = [s * (.86 - tc * .5), s * (.32 - tc * .1)];
    paint(ribbon([T0, T1, T2], s * .42, s * .3), { wash: skin, fill: dk, fillOp: 40, tex: .3, ink: PAL.ink, sw, curv: .5 });
    paint(rotEll(T2[0] - s * .02, T2[1] - s * .12, s * .09, s * .13, 10, -.2 - tc), { wash: '#F8DCCB', ink: mixCol(dk, skin, .3), sw: sw * .4 });
    inkLine([[T1[0] - s * .14, T1[1] - s * .02], [T1[0] + s * .1, T1[1] + s * .04]], sw * .5, crease, 'inkfine', .5);
    // the fingers (drawn before the back of the hand, which covers their roots)
    const F = [[-.6, 1.18, .34, -.1], [-.2, 1.5, .37, -.03], [.2, 1.42, .36, .04], [.56, 1.1, .32, .12]];
    F.forEach(([fx, Lf, wf, splay], i) => {
      const L = s * Lf * (1 - cu * .42), a = splay * (.6 + sp) - (o.cup || 0) * (fx * .25), bx = fx * s, by = -s * .1;
      const J1 = [bx + Math.sin(a) * L * .5, by + Math.cos(a) * L * .5], J2 = [J1[0] + Math.sin(a * 1.2) * L * .32, J1[1] + Math.cos(a * 1.2) * L * .32], TP = [J2[0] + Math.sin(a * 1.3) * L * .22, J2[1] + Math.cos(a * 1.3) * L * .22];
      const w = s * wf, sh = (i % 2 ? .05 : 0) + .1 * wob(T, .15, i);
      paint(ribbon([[bx, by - s * .2], J1, J2, TP], w, w * .82), { wash: mixCol(skin, dk, cu * .25 + sh * .3), fill: dk, fillOp: 30 + cu * 40, tex: .3, ink: PAL.ink, sw, curv: .4 });
      paint(ellPts(TP[0], TP[1], w * .41, w * .38, 12), { wash: mixCol(skin, dk, cu * .25 + sh * .3), ink: null });
      inkLine([[TP[0] - w * .42, TP[1] - w * .1], [TP[0] - w * .25, TP[1] + w * .32], [TP[0] + w * .25, TP[1] + w * .32], [TP[0] + w * .42, TP[1] - w * .1]], sw, PAL.ink, 'ink', .6);
      if (cu < .7) paint(rrPts(TP[0] - w * .22, TP[1] - w * .5, w * .44, w * .62 * (1 - cu * .6), w * .2), { wash: '#F8DCCB', ink: mixCol(dk, skin, .3), sw: sw * .4 });
      for (const J of [J1, J2]) { inkLine([[J[0] - w * .28, J[1] - w * .05], [J[0], J[1] + w * .06], [J[0] + w * .28, J[1] - w * .05]], sw * .5, crease, 'inkfine', .6); }
    });
    // the back of the hand: from the wrist widening to the knuckles, the knuckle edge scalloped over each finger
    const B = [[-s * .96, -s * 2.9], [-s * .7, -s * 1.7], [-s * .6, -s * 1.15], [-s * .8, -s * .6], [-s * .86, -s * .02]];
    F.forEach(([fx, , wf]) => { B.push([fx * s - s * wf * .5, s * .02]); B.push([fx * s, s * .1]); B.push([fx * s + s * wf * .5, s * .02]); });
    B.push([s * .8, -s * .35], [s * .7, -s * .85], [s * .6, -s * 1.15], [s * .72, -s * 1.7], [s * .98, -s * 2.9]);
    paint(B, { wash: skin, fill: dk, fillOp: 35, bleed: .04, tex: .4, ink: PAL.ink, sw, curv: .35 });
    paint(ellPts(-s * .2, -s * .6, s * .38, s * .3, 14), { fill: lt, fillOp: 80, bleed: .2, ink: null });
    paint(ellPts(-s * .3, -s * 2.1, s * .25, s * .6, 14), { fill: lt, fillOp: 70, bleed: .2, ink: null });
    inkLine([[-s * .55, -s * 1.22], [-s * .2, -s * 1.12], [s * .2, -s * 1.14]], sw * .4, mixCol(dk, skin, .3), 'inkfine', .6);
    F.forEach(([fx, , wf]) => inkLine([[fx * s - s * wf * .25, -s * .05], [fx * s, -s * .1], [fx * s + s * wf * .25, -s * .05]], sw * .55, crease, 'inkfine', .6));
    for (const k of [-.32, .05, .4]) inkLine([[k * s, -s * .95], [k * s + s * .06, -s * .4]], sw * .35, mixCol(dk, skin, .4), 'inkfine', .5);   // tendons, faint
    pop();
  }
  // a fruit tree (side view): trunk + branches as ribbons, a crown of blossom or bare twigs; o.bloom 0..1, o.wilt 0..1
  function tree(x, y, h, t, o = {}) {
    boilSeed('tr' + (o.key || ''));
    const sway = .02 * Math.sin(t * .8 + (o.seed || 0)), tilt = o.fall || 0;
    push(); translate(x, y); rotate(tilt * 1.4 + sway);
    paint(ribbon([[0, 0], [h * .02, -h * .35], [-h * .02, -h * .6]], h * .09, h * .05), { wash: Z.tree, fill: Z.treeDk, fillOp: 50, tex: .6, ink: PAL.ink, sw: 1.1 });
    const BR = [[-h * .02, -h * .5, -h * .3, -h * .8], [0, -h * .55, h * .28, -h * .85], [-h * .02, -h * .6, -h * .05, -h * .98], [0, -h * .4, h * .3, -h * .55], [0, -h * .38, -h * .32, -h * .52]];
    BR.forEach(([a, b, c, d], i) => paint(ribbon([[a, b], [(a + c) / 2 + h * .03, (b + d) / 2], [c, d]], h * .04, h * .015), { wash: Z.tree, ink: PAL.ink, sw: .9 }));
    if ((o.leaves ?? 1) > 0) for (let i = 0; i < 9; i++) { const [a, b, c, d] = BR[i % 5], q = .6 + .4 * hash(i + 9); paint(ellPts(lerp(a, c, q) + (hash(i) - .5) * h * .25, lerp(b, d, q) + (hash(i + 2) - .5) * h * .15, h * .14, h * .1, 14, 2), { fill: Z.meadowDk, fillOp: 120, bleed: .15, tex: .5, ink: null }); }
    const bl = o.bloom || 0, wl = o.wilt || 0;
    if (bl > 0) for (let i = 0; i < 16; i++) { const [a, b, c, d] = BR[i % 5], q = .45 + .55 * hash(i + 30), px = lerp(a, c, q) + (hash(i + 31) - .5) * h * .2, py = lerp(b, d, q) + (hash(i + 32) - .5) * h * .14;
      if (wl > .5) paint(ellPts(px, py + wl * h * .02, h * .018, h * .014, 6), { wash: Z.bareDk, ink: null });
      else blossom(px, py, h * .07 * (1 - wl * .6), bl, i, (o.key || '') + i); }
    if (o.fruit) for (let i = 0; i < 6; i++) { const [a, b, c, d] = BR[i % 5], q = .6 + .3 * hash(i + 50); paint(ellPts(lerp(a, c, q), lerp(b, d, q) + h * .05, h * .035, h * .04, 10), { wash: '#8E3E6E', fill: '#5E2440', fillOp: 40, ink: PAL.ink, sw: .8 }); }
    pop();
  }
  // the Earth, flat: an ocean disk, painted continents, a polar cap, clouds; slow drift of the land
  function earth(x, y, r, t, key) {
    boilSeed('ea' + key);
    glow(x, y, r * 1.5, '#6FA8E8', .6);
    paint(ellPts(x, y, r, r, 48), { wash: Z.ocean, fill: Z.oceanDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.4 });
    const LANDS = [[-.35, -.25, .32, .22, .3], [.25, -.05, .22, .38, -.2], [-.1, .45, .25, .14, .5], [.45, .45, .14, .12, 0], [-.55, .2, .12, .2, .2]];
    LANDS.forEach(([a, b, rx, ry, rr], i) => { const P = rotEll(x + a * r, y + b * r, rx * r, ry * r, 18, rr).map(([px, py], j) => [px + (hash(i * 9 + j) - .5) * r * .08, py + (hash(i * 7 + j + 3) - .5) * r * .08]).map(([px, py]) => { const dx = px - x, dy = py - y, d = Math.hypot(dx, dy); return d > r * .97 ? [x + dx / d * r * .97, y + dy / d * r * .97] : [px, py]; });
      paint(P, { wash: i % 2 ? Z.land : mixCol(Z.land, '#C9B276', .35), fill: Z.landDk, fillOp: 50, tex: .5, ink: mixCol(PAL.ink, Z.landDk, .4), sw: .9, curv: .5 }); });
    paint(ellPts(x, y - r * .9, r * .35, r * .1, 16), { wash: Z.ice, ink: null });
    for (let i = 0; i < 4; i++) paint(ribbon([[x - r * .5 + i * r * .25 + 10 * wob(t, .05, i), y - r * .5 + i * r * .3], [x - r * .2 + i * r * .25 + 10 * wob(t, .05, i), y - r * .55 + i * r * .3]], r * .05, r * .03), { wash: Z.cloud, washOp: 200, ink: null });
  }

  // ---------- grounds ----------
  function skyBg(t, key, col = Z.sky, blob = Z.skyBlob) { K.wash(col, t, { key, blob, rect: rectPts(-1600, -1400, W + 3200, H + 2800) }); }
  // a grass skin along the top of a soil cross-section
  function grassStrip(t, gy, key, x0 = -800, x1 = 2800) {
    boilSeed('gs' + key);
    paint([[x0, gy - 6], [x1, gy - 6], [x1, gy + 16], [x0, gy + 16]], { wash: Z.meadow, fill: Z.meadowDk, fillOp: 50, tex: .4, ink: null });
    for (let i = 0; i < 40; i++) { boilSeed('gst' + key + i); const x = x0 + i * (x1 - x0) / 40 + hash(i) * 30, h = 26 + 30 * hash(i + 1), sw = .03 * Math.sin(t * 1.4 + i);
      for (let b = -1; b <= 1; b++) { const a = -Math.PI / 2 + b * .3 + sw; paint(ribbon([[x + b * 5, gy + 4], [x + b * 5 + Math.cos(a) * h, gy + 4 + Math.sin(a) * h]], 7, 1.5), { wash: b ? Z.meadowDk : Z.meadowLt, ink: mixCol(PAL.ink, Z.meadowDk, .4), sw: .5 }); } }
  }
  // the meadow ground band from y = gy down; o.bare 0..1 (eaten to stubble), o.wet (rain darkening)
  function meadow(t, gy, key, o = {}) {
    const bare = o.bare || 0, col = mixCol(Z.meadow, Z.bare, bare), dk = mixCol(Z.meadowDk, Z.bareDk, bare);
    boilSeed('md' + key);
    paint(rectPts(-1600, gy + 160, W + 3200, 1600), { wash: mixCol(col, dk, .4), ink: null });
    paint([[-1600, gy + 40], ...Array.from({ length: 13 }, (_, i) => [-1600 + i * 425, gy + 10 * Math.sin(i * 1.3)]), [W + 1600, gy + 40], [W + 1600, gy + 200], [-1600, gy + 200]], { wash: col, fill: dk, fillOp: 45, tex: .5, ink: null });
    inkLine(Array.from({ length: 13 }, (_, i) => [-1600 + i * 425, gy + 10 * Math.sin(i * 1.3)]).slice(2, 9), .9, mixCol(dk, PAL.ink, .3), 'inkfine', .5);
    if (o.tufts !== false) for (let i = 0; i < 26; i++) {
      boilSeed('tf' + key + i);
      const x = -400 + i * 115 + hash(i) * 60, y = gy + 14 + hash(i + 2) * 120, h = (40 + 50 * hash(i + 3)) * (1 - bare * .85) * (o.tuftH || 1), sw = .02 * Math.sin(t * 1.4 + i);
      for (let b = -2; b <= 2; b++) { const a = -Math.PI / 2 + b * .28 + sw; paint(ribbon([[x + b * 6, y], [x + b * 6 + Math.cos(a) * h * .5, y + Math.sin(a) * h * .5], [x + b * 6 + Math.cos(a + b * .1) * h, y + Math.sin(a + b * .1) * h]], 9, 1.5), { wash: b % 2 ? dk : mixCol(col, Z.meadowLt, .5 - bare * .5), ink: mixCol(PAL.ink, dk, .4), sw: .6 }); }
    }
  }
  function farHills(t, gy, key, col = Z.far) {
    boilSeed('fh' + key);
    paint([[-1600, gy], [-900, gy - 120], [-200, gy - 60], [500, gy - 170], [1200, gy - 80], [1900, gy - 150], [2600, gy - 50], [W + 1600, gy - 110], [W + 1600, gy + 60], [-1600, gy + 60]], { fill: col, fillOp: 160, bleed: .2, tex: .5, ink: null, curv: .6 });
  }
  function sun(x, y, r, t, k = 1) { if (k <= 0) return; boilSeed('sun'); glow(x, y, r * 3.2, '#FFE39A', .8 * k); paint(ellPts(x, y, r, r, 24), { wash: '#F6D66E', ink: mixCol(PAL.ink, '#E0B040', .5), sw: .9 }); }
  // the soil cross-section from y = gy down: layered bands, pebbles, a few roots
  function soilBg(t, gy, key, o = {}) {
    boilSeed('sb' + key);
    paint(rectPts(-1600, gy, W + 3200, 2400), { wash: Z.soil, fill: Z.soilDk, fillOp: 60, tex: .6, ink: null });
    for (let i = 0; i < 3; i++) paint([[-1600, gy + 260 + i * 330], [W + 1600, gy + 230 + i * 330], [W + 1600, gy + 380 + i * 330], [-1600, gy + 400 + i * 330]], { fill: i % 2 ? Z.soilDk : Z.under, fillOp: 70, bleed: .2, tex: .5, ink: null });
    for (let i = 0; i < 30; i++) { boilSeed('pb' + key + i); const x = -600 + hash(i + 11) * 3100, y = gy + 60 + hash(i + 12) * 1300, r = 10 + 22 * hash(i + 13); paint(ellPts(x, y, r, r * .7, 10, 2, hash(i) * 3), { wash: i % 3 ? Z.grain : Z.soilLt, ink: mixCol(PAL.ink, Z.soilDk, .4), sw: .7 }); }
  }
  // Pip's roots, hanging from its feet into the soil; k grows them
  function roots(x, y, s, t, key, k = 1, col = Z.root) {
    boilSeed('rt' + key);
    const R = [[0, 1, 0], [-.6, .8, .3], [.5, .85, -.2], [-.3, .5, .9], [.4, .55, -.8]];
    R.forEach(([dx, L, curl], i) => { const P = []; for (let j = 0; j <= 6; j++) { const q = j / 6 * k; P.push([x + (dx * q * s * .8) + Math.sin(q * 3 + curl * 2) * s * .1 * q, y + q * L * s * 1.4]); } paint(ribbon(P, s * (i ? .07 : .1), s * .015), { wash: col, ink: mixCol(PAL.ink, Z.rootDk, .4), sw: .8 }); });
  }

  // ================================ the cast sheet (model check) ================================
  LOOPS.cast = t => {
    K.setT(t); T = t;
    skyBg(t, 'cs', '#EEE6D2', '#F7F1E4');
    grasshopper(260, 330, 95, t, { key: 'g1', bent: 1, chomp: .5 + .5 * Math.sin(t * 8) });
    aphid(560, 300, 60, t, { key: 'a1', step: t * 2 });
    ant(800, 300, 70, t, { key: 'n1', step: t * 2 });
    ladybug(1040, 300, 70, t, { key: 'l1', step: t });
    bacterium(1350, 230, 70, 0, t, { key: 'b1' });
    phage(1650, 380, 90, 0, t, { key: 'p1' });
    virusRod(220, 520, 70, .3, { key: 'v1' });
    fly(420, 520, 30, t, 'f1');
    frog(700, 700, 150, t, { key: 'fr' });
    mushroom(950, 700, 120, 1, 'm1');
    hypha([[1050, 700], [1150, 640], [1260, 680]], 1, 5, 'h1');
    tubeWorm(1400, 720, 200, t, 1); tubeWorm(1460, 720, 170, t, 2);
    tardigrade(1720, 650, 80, t, { key: 'td' });
    bee(250, 900, 60, t, { key: 'be' });
    blossom(480, 900, 110, 1, 0, 'bl');
    pipX(700, 1040, 26, { ...pipFeel('happy', t), bite: .7, spot: 1, bloom: 1, key: 'px' });
    tree(1000, 1060, 300, t, { key: 'tr', bloom: 1 });
    earth(1300, 900, 150, t, 'ea');
    hand(1650, 760, 95, Math.PI / 2, { key: 'hd' }); 
  };
  LOOPS.cast.len = 2;
  LOOPS.hands = t => {
    K.setT(t);
    skyBg(t, 'hs', '#EEE6D2', '#F7F1E4');
    hand(330, 560, 120, Math.PI / 2, { key: 'h1' });
    hand(800, 560, 120, Math.PI / 2, { key: 'h2', curl: .8 });
    hand(1250, 560, 120, Math.PI / 2 + .3, { key: 'h3', cup: 1 });
    pipX(1660, 900, 60, { ...pipFeel('calm', t), bite: .8, spot: 1, mottle: .6, key: 'px' });
  };
  LOOPS.hands.len = 2;

  // ================================ shared staging ================================
  // Pip, acted: K.act moods + overrides, drawn with the biteable leaf
  function pp(x, y, u, t, keys, extra = {}, key = 'pip') { const o = { ...K.act(t, keys), ...extra }; pipX(x, y, u, { ...o, key }); return o; }
  // a point on Pip in its local frame (u units, unflipped) → world, mirroring pip()'s transform
  function onPip(x, y, u, o, lx, ly) {
    const dir = o.flip ? -1 : 1, sq = o.sq || 0, r = o.rot || 0, sx = lx * u * dir * (1 + sq), sy = ly * u * (1 - sq), c = Math.cos(r), s = Math.sin(r);
    return [x + sx * c - sy * s, y + (o.dy || 0) * u + sx * s + sy * c];
  }
  // a point along Pip's leaf stalk (q 0 = top of the head, 1 = the leaf's base), in world space
  function stalkAt(x, y, u, o, q) {
    const fx = (o.turn ?? .4) * .38, la = (o.leaf || 0) + .12 * wob(T, .45, .3), top = [fx * .3, -4.85], tip = [top[0] + Math.sin(la) * 1.6, top[1] - Math.cos(la) * 1.5];
    const mid = [lerp(top[0], tip[0], .4) - .15, lerp(top[1], tip[1], .5)], a = q < .5 ? top : mid, b = q < .5 ? mid : tip, k = q < .5 ? q * 2 : q * 2 - 1;
    return onPip(x, y, u, o, lerp(a[0], b[0], k), lerp(a[1], b[1], k));
  }
  // the shadow that crosses the world (the cold open, and K): a huge dark shape sliding right → left, k 0..1, screen space
  function shadowPass(k, key, op = 120) {
    if (k <= 0 || k >= 1) return; boilSeed('sh' + key);
    const x0 = lerp(W + 200, -3400, k), P = [[x0, -200], [x0 + 3000, -200], [x0 + 3000, H + 200], [x0 + 260, H + 200]];
    for (let i = 0; i <= 8; i++) P.push([x0 + 120 * Math.sin(i * 1.7) + (i % 2 ? 90 : 0), H + 200 - i * (H + 400) / 8]);
    paint(P, { wash: '#2B2440', washOp: op, ink: null });
  }
  // soil crumbs / dust puffs flying out of a point (k 0..1)
  function crumbs(x, y, s, k, key, col = Z.soilDk) {
    if (k <= 0 || k >= 1) return; boilSeed('cr' + key);
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (hash(i + 3) - .5) * 2.4, v = s * (.6 + .6 * hash(i + 5)), px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + s * 1.4 * k * k;
      paint(ellPts(px, py, s * .06 * (1 - k * .5), s * .05, 8, 1, i), { wash: i % 2 ? col : mixCol(col, PAL.cream, .3), ink: PAL.ink, sw: .6 }); }
  }
  function dust(x, y, s, k, key, col = '#D8C9A8') {
    if (k <= 0 || k >= 1) return; boilSeed('du' + key);
    for (let i = 0; i < 6; i++) { const sd = i % 2 ? 1 : -1, d = s * (.2 + .9 * easeOut(k)) * (.6 + .4 * hash(i)), r = s * (.15 + .2 * easeOut(k));
      paint(ellPts(x + sd * d, y - r * .5 - i * s * .03, r, r * .75, 12), { wash: col, washOp: 210 * (1 - k), ink: null }); }
  }
  // speed lines for a whip (screen space), dir: 1 = scrolling down
  function whipLines(k, key, col = '#F5EEDC') {
    if (k <= 0 || k >= 1) return; boilSeed('wl' + key);
    for (let i = 0; i < 14; i++) { const x = hash(i + 1) * W, y = (hash(i + 2) * H + k * 900) % (H + 300) - 150, L = 220 + 240 * hash(i + 4); paint(ribbon([[x, y], [x + 4, y + L]], 10, 2), { wash: col, washOp: 200 * Math.sin(k * Math.PI), ink: null }); }
  }
  // a whole meadow set: sky, sun, far hills, the ground band at gy, optional pond and trees. o.bare, o.dim (0..1 darkening)
  function meadowSet(t, key, gy, o = {}) {
    const dim = o.dim || 0;
    skyBg(t, key, mixCol(mixCol(o.sky || Z.sky, Z.dusk, (o.bare || 0) * .5), '#5E5870', dim * .5), mixCol(Z.skyBlob, '#8A8496', dim * .5));
    if (o.sun !== false) sun(o.sunX ?? 300, o.sunY ?? 180, 70, t, (o.sunK ?? 1) * (1 - dim));
    farHills(t, gy - 60, key, mixCol(Z.far, Z.bare, (o.bare || 0) * .6));
    if (o.behind) o.behind();
    meadow(t, gy, key, o);
    if (o.pond) { boilSeed('pd' + key); paint(ellPts(o.pond[0], gy + 60, o.pond[1], 46, 30, 3), { wash: mixCol('#8FC0C8', Z.bare, (o.bare || 0) * .5), fill: '#5F9AA8', fillOp: 50, tex: .4, ink: mixCol(PAL.ink, '#5F9AA8', .4), sw: 1 }); paint(ellPts(o.pond[0] - o.pond[1] * .3, gy + 52, o.pond[1] * .35, 8, 12), { wash: '#C9E2E4', washOp: 160, ink: null }); }
    if (o.pond) { boilSeed('rd' + key); for (let i = 0; i < 6; i++) { const x = o.pond[0] - o.pond[1] + 30 + i * 70 * (o.pond[1] / 300), h = 90 + 40 * hash(i); inkLine([[x, gy + 40], [x + 6 * Math.sin(t + i), gy + 40 - h]], 2.4, Z.meadowDk, 'ink', .5); paint(ellPts(x + 6 * Math.sin(t + i), gy + 40 - h, 6, 18, 10), { wash: '#8C6A4C', ink: PAL.ink, sw: .6 }); } }
  }

  // ================================ A: the sprout (0–10) ================================
  function plumStone(x, y, s, crack, key) {
    boilSeed('ps' + key);
    for (const sd of [-1, 1]) {
      const off = sd * crack * s * .35, P = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + sd * i / 12 * Math.PI; P.push([x + off + Math.cos(a) * s * .7 * (1 - .15 * Math.cos(a * 2)), y + Math.sin(a) * s]); }
      push(); translate(x + off, y); rotate(sd * crack * .4); translate(-(x + off), -y);
      paint(P, { wash: '#B58A5E', fill: '#8A6340', fillOp: 55, tex: .6, ink: PAL.ink, sw: 1.1, curv: .5 });
      for (let k = 0; k < 3; k++) inkLine([[x + off + sd * s * (.15 + k * .15), y - s * .6], [x + off + sd * s * (.2 + k * .15), y + s * .5]], .6, '#7A5636', 'inkfine', .6);
      pop();
    }
  }
  function shotA(t, lt, dur) {
    K.setT(t);
    const GY = 700, PX = 960, U = 34;
    const c = kf(t, [[0, [960, 975, 1.75]], [1.4, [960, 960, 1.7]], [3.0, [960, 720, 1.3]], [4.0, [960, 560, 1.1]], [10, [985, 555, 1.13]]], ease);
    const sk = shakeXY(t, 9 * seg(t, 6.9, 7.3) * (1 - seg(t, 8.2, 8.8)));
    cam(c[0] + sk[0] + 5 * wob(t, .05), c[1] + sk[1], c[2]);
    const dim = Math.sin(Math.PI * seg(t, 6.6, 9.0));
    skyBg(t, 'a', mixCol('#D6E4DA', '#4E4A66', dim * .55), mixCol('#F1F0E2', '#7E7A92', dim * .5));
    sun(560, 300, 60, t, seg(t, 4.2, 5.4) * (1 - dim * .8));
    farHills(t, GY - 40, 'a');
    // Pip: under the soil until it bursts out at 3.0
    const rise = t < 3.0 ? 9 : kf(t, [[3.0, 6], [3.35, -2.6], [3.75, 0]], easeOut) , land = jump(t, 3.62, 3.95, 0);
    const keys = [[0, 'calm'], [3.05, 'wow', { take: 1 }], [4.6, 'calm', { lookX: -.7, lookY: -.7 }], [5.1, 'happy', { lookX: -.5, lookY: -.5 }], [5.9, 'sing'],
      [6.75, 'wow', { lookX: .6, lookY: -1, take: .8 }], [7.25, 'worried', { lookX: -.2, lookY: -1, emote: 'sweat' }], [8.85, 'calm', { lookX: -.6, lookY: -.3, sq: .08 }], [9.55, 'wow', { lookX: 1, take: .6 }]];
    const o = { ...K.act(t, keys), key: 'pa' };
    const drawPip = () => { if (t >= 2.95) pipX(PX, GY + rise * U * (t < 3.75 ? 1 : 0), U, { ...o, dy: (o.dy || 0) + (t < 3.75 ? 0 : 0), sq: (o.sq || 0) + land.sq * .6 + (t < 3.3 ? -.12 : 0), noShadow: t < 3.7 }); };
    if (t < 3.3) drawPip();
    soilBg(t, GY, 'a');
    grassStrip(t, GY, 'a');
    // the root reaching down, and the shoot looping up to the surface
    roots(PX, t < 3.0 ? 975 : GY + 8, t < 3.0 ? 110 : 150, t, 'ar', t < 3.0 ? seg(t, 1.0, 2.9) : 1);
    plumStone(PX + (t < 3.0 ? 0 : 0), t < 3.0 ? 975 : 990, 30, seg(t, .8, 1.4) * (t < 3.0 ? 1 : 1.4), 'st');
    if (t < 3.05) { const k = seg(t, 1.2, 3.0); if (k > 0) { boilSeed('shoot'); const P = [[PX, 955], [PX + 18, 900], [PX - 12, 830], [PX + 8, 740]].slice(0, 2 + Math.floor(k * 2.99)); const tipK = k * 3 % 1; paint(ribbon(through(P, 6), 16, 10), { wash: '#B9D98A', ink: PAL.ink, sw: 1 }); const tp = P[P.length - 1]; paint(ellPts(tp[0], tp[1] - 8, 10, 14, 10), { wash: PIPC.leaf, ink: PAL.ink, sw: .9 }); } }
    if (t > 2.4 && t < 3.05) { boilSeed('bulge'); const k = ease(seg(t, 2.4, 3.0)), j = 3 * Math.sin(t * 50) * k; paint(ellPts(PX + j, GY - 2, 50 + 30 * k, 26 * k + 2, 16, 2), { wash: Z.soil, fill: Z.soilDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: .9 }); }
    crumbs(PX, GY, 260, seg(t, 3.0, 3.9), 'ac');
    if (t >= 3.3) drawPip();
    dust(PX, GY + 6, 120, seg(t, 3.72, 4.4), 'ad');
    camEnd();
    shadowPass(seg(t, 6.5, 9.1), 'a');
    if (lt < .8) iris(...toScreen(PX, 975, { cx: c[0], cy: c[1], zoom: c[2], rot: 0 }), lerp(0, 1500, easeIn(lt / .8)));
  }

  // ================================ B: the grasshopper (10–22) ================================
  const GYB = 820, PXB = 760, UB = 34;
  function shotB(t, lt, dur) {
    K.setT(t);
    const push = seg(t, 20.9, 22.0), c = [lerp(960, 820, ease(push)), lerp(560, 640, ease(push)), lerp(1.0, 1.9, easeIn(push))];
    cam(c[0] + 8 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2] + .01 * Math.sin(t * .3));
    meadowSet(t, 'b', GYB, {});
    // the grasshopper: drops in, creeps up, rears to bite twice, reels from the cyanide, staggers and leaps off right
    const keys = [[10, 'calm', { lookX: .8, lookY: .2 }], [10.4, 'wow', { lookX: 1, take: 1 }], [11.2, 'worried', { lookX: 1, lookY: -.2, rot: -.08, emote: 'sweat' }],
      [12.75, 'cry', { take: 1, lookX: 1 }], [13.15, 'angry', { lookX: 1 }], [15.05, 'wow', { lookX: 1, take: .8 }], [16.0, 'laugh'], [17.0, 'smug', { lookX: 1 }],
      [19.4, 'smug', { lookX: .3, armF: { at: [.4, -1.5] }, armB: { at: [-.2, -1.5] }, armsFront: true }], [20.7, 'confused', { lookX: .6, lookY: -1 }]];
    const o = K.act(t, keys);
    if (t > 19.4 && t < 20.7) { const d = Math.sin(t * 16); o.armF = { at: [.2 + .4 * d, -1.5] }; o.armB = { at: [-.1 - .4 * d, -1.4] }; }
    const lf = leafAt(PXB, GYB, UB, o, .62), S = 92;
    // the grasshopper: drops in, creeps up, leaps up to bite the leaf twice, reels from the cyanide, staggers and leaps off right
    const hopK = Math.max(Math.sin(Math.PI * seg(t, 12.42, 13.05)), Math.sin(Math.PI * seg(t, 14.8, 15.35)));
    const baseX = kf(t, [[10, 1300], [10.8, 1300], [12.3, 1060], [14.7, 1060], [15.35, 1060], [15.6, 1140], [17.6, 1170], [18.0, 1190], [18.6, 1700], [19, 2300]], ease);
    const gx = lerp(baseX, lf[0] + .74 * S, Math.min(1, hopK * 1.6));
    const air = (t < 10.35 ? -(1 - easeIn(seg(t, 9.9, 10.35))) * 700 : t > 17.9 ? -Math.sin(Math.PI * seg(t, 17.95, 18.7)) * 300 : 0) + Math.min(0, lf[1] + 10 - (GYB + 10 - .31 * S)) * Math.min(1, hopK * 1.4);
    const lean = (t > 15.3 && t < 17.8 ? .12 * Math.sin(t * 7) : 0) - .15 * hopK;
    const chompK = Math.max(near(t, 12.7, .07), near(t, 12.86, .06), near(t, 15.08, .07));
    const sick = seg(t, 15.1, 15.4) * (1 - seg(t, 18.6, 19));
    const crouch = Math.max(1 - seg(t, 10.35, 10.7), near(t, 17.85, .12), near(t, 12.4, .1), near(t, 14.78, .1)) * (t > 10.3 ? 1 : 0);
    grasshopper(gx, GYB + 10 + air, S, t, { dir: -1, key: 'gb', bent: 1, lean, chomp: chompK, sick, crouch, leap: t > 17.9 ? seg(t, 17.9, 18.1) : (t < 10.35 ? .6 : hopK * .5), step: t > 10.8 && t < 12.3 ? t * 2 : 0 });
    dust(1300, GYB + 12, 140, seg(t, 10.35, 11.0), 'bd');
    dust(1190, GYB + 12, 140, seg(t, 17.95, 18.6), 'bd2');
    dizzy(gx - 40, GYB - 190 - air, 70, t, seg(t, 15.5, 15.8) * (1 - seg(t, 17.7, 17.9)), 'bz');
    for (let i = 0; i < 3; i++) { const k = seg(t, 15.35 + i * .05, 15.95 + i * .05); if (k > 0 && k < 1) { const p = arcPt([gx - 60, GYB - 120], [gx + 80 + i * 40, GYB + 10], 60, k); boilSeed('sp' + i); paint(ellPts(p[0], p[1], 7, 6, 8), { wash: Z.cyan, ink: PAL.ink, sw: .6 }); } }
    // Pip
    const bite = .55 * seg(t, 12.66, 12.86) + .45 * seg(t, 15.0, 15.1);
    pipX(PXB, GYB, UB, { ...o, bite, key: 'pb' });
    puff(lf[0], lf[1], 90, seg(t, 15.05, 16.6), 'pf');
    if (near(t, 12.7, .06) > .2 || near(t, 15.02, .06) > .2) K.burst(lf[0], lf[1], 34, seg(t, t < 14 ? 12.66 : 14.98, t < 14 ? 12.95 : 15.27), PAL.ink, 'bb');
    // the first aphids, already climbing the stalk at the end
    for (let i = 0; i < 3; i++) { const q = clamp(seg(t, 19.8 + i * .35, 21.6 + i * .35) * .8 + .1); if (t > 19.8 + i * .35) { const p = stalkAt(PXB, GYB, UB, o, q * (.6 + i * .12)); aphid(p[0] - 4, p[1], 9, t, { key: 'ba' + i, dir: -1, ang: -1.3, step: t * 2 }); } }
    camEnd();
    if (lt < .12) flash(1 - lt / .12, '#FFF8E8');
  }

  // ================================ C: aphids, a ladybug, ants (22–34) ================================
  const PXC = 900, GYC = 1300, UC = 95;
  function shotC(t, lt, dur) {
    K.setT(t);
    const down = seg(t, 33.1, 34.0);
    const cc = kf(t, [[22, [930, 770, 1.95]], [30.7, [935, 780, 1.85]], [31.3, [960, 840, 1.25]]], ease);
    cam(cc[0] + 6 * wob(t, .05), cc[1] + 5 * wob(t, .04) + easeIn(down) * 700, cc[2]);
    meadowSet(t, 'c', 1180, { sunX: 1550, sunY: 520, tuftH: 1.6 });
    const keys = [[22, 'confused', { lookX: .5, lookY: -1 }], [22.9, 'strain', { lookY: -1, leaf: -.7 }], [24.9, 'sing', { lookY: -.6, leaf: -.5 }], [26.75, 'happy', { lookX: .3, lookY: -1 }],
      [28.2, 'confused', { lookX: 1, lookY: -.6 }], [30.0, 'wow', { lookY: -1, take: .7 }], [30.8, 'angry', { lookY: -1 }], [32.35, 'wow', { lookY: 1, take: 1.1 }], [32.9, 'worried', { lookY: 1, emote: 'sweat' }]];
    const o = K.act(t, keys);
    const stomp = jump(t, 31.6, 32.05, .5);
    o.dy = (o.dy || 0) + stomp.dy; o.sq = (o.sq || 0) + stomp.sq;
    pipX(PXC, GYC, UC, { ...o, bite: 1, key: 'pc' });
    if (t > 32.05 && t < 32.6) dust(PXC, GYC - 120, 300, seg(t, 32.05, 32.6), 'cd');
    // aphids along the stalk: stylets in, swelling; #3 is eaten by the ladybug at 26.6
    const AQ = [.22, .38, .52, .66, .8];
    AQ.forEach((q, i) => {
      if (i === 3 && t > 26.7) return;
      const p = stalkAt(PXC, GYC, UC, o, q), side = i % 2 ? 1 : -1, sc = i === 3 ? 1 - seg(t, 26.45, 26.7) : 1;
      aphid(p[0] + side * 10, p[1], 26 * sc, t, { key: 'ca' + i, dir: side, ang: side * 1.25, stab: seg(t, 22.4 + i * .2, 22.7 + i * .2), swell: seg(t, 22.8, 25) * .8 });
      if (t > 29.0 + i * .2 && t < 30.2 + i * .2 && i !== 3) { boilSeed('hd' + i); const k = seg(t, 29.0 + i * .2, 29.4 + i * .2); paint(ellPts(p[0] + side * 30, p[1] + 26, 7 * k, 8 * k, 10), { wash: '#F6E7A6', ink: PAL.ink, sw: .6 }); }
    });
    // the ladybug: flies in, lands by aphid 3, eats it, gets chased off by the lead ant
    const L3 = stalkAt(PXC, GYC, UC, o, .66), lbIn = seg(t, 25.5, 26.2), lbOut = seg(t, 30.3, 31.3);
    if (t > 25.5 && t < 31.3) {
      const p = t < 26.2 ? arcPt([1700, 380], [L3[0] + 40, L3[1] - 30], -120, easeOut(lbIn)) : t < 30.3 ? [L3[0] + 40, L3[1] - 30] : arcPt([L3[0] + 40, L3[1] - 30], [100, 300], 200, easeIn(lbOut));
      ladybug(p[0], p[1] + (t > 30.0 && t < 30.3 ? -20 * Math.sin((t - 30) * 60) : 0), 40, t, { key: 'cl', dir: t < 30.3 ? -1 : -1, fly: t < 26.15 || t > 30.25 ? 1 : 0, ang: t > 26.2 && t < 30.3 ? .9 : 0 });
      if (t > 26.4 && t < 26.8) K.burst(L3[0] + 10, L3[1], 30, seg(t, 26.45, 26.8), PAL.ink, 'cb');
      if (t > 30.0 && t < 30.5) K.burst(L3[0] + 40, L3[1] - 30, 40, seg(t, 30.0, 30.4), Z.red, 'cb2');
    }
    // ants: up Pip's back to the stalk, tapping the aphids; the lead one charges the ladybug
    const path = [onPip(PXC, GYC, UC, o, 2.4, -.2), onPip(PXC, GYC, UC, o, 1.85, -1.6), onPip(PXC, GYC, UC, o, 1.55, -3.6), onPip(PXC, GYC, UC, o, .8, -4.65), onPip(PXC, GYC, UC, o, .25, -4.85)];
    const trk = K.track(path);
    for (let i = 0; i < 3; i++) {
      const k = seg(t, 27.4 + i * .5, 29.0 + i * .5); if (k <= 0) continue;
      let p, ang;
      if (k < 1) { const a = trk.at(trk.L * easeOut(k)); p = [a[0], a[1]]; ang = a[2] + Math.PI; }
      else { const q = [.3, .45, .58][i] + (i === 0 ? .1 * seg(t, 29.7, 30.0) : 0); p = stalkAt(PXC, GYC, UC, o, q); p = [p[0] + (i === 0 ? 30 : -14), p[1]]; ang = -1.3; }
      ant(p[0], p[1], 30, t, { key: 'cn' + i, dir: -1, ang: ang + Math.PI, step: k < 1 ? t * 3 : 0, tap: k >= 1 ? .5 + .5 * Math.sin(t * 6 + i) : 0, bite: i === 0 ? near(t, 30.05, .15) : 0 });
    }
    camEnd();
    whipLines(seg(t, 33.2, 34.2), 'cw');
  }
  // ================================ D: bacteria vs phages (34–50) ================================
  function shotD1(t, lt, dur) {           // 34–36: down through the soil to a root tip
    K.setT(t);
    const k = ease(seg(t, 34, 35.9)), c = [lerp(960, 1000, k), lerp(150, 742, k), lerp(1, 2.8, easeIn(seg(t, 34.6, 36)))];
    cam(c[0], c[1], c[2]);
    skyBg(t, 'd1');
    soilBg(t, 268, 'd1'); grassStrip(t, 268, 'd1');
    pipX(960, 262, 32, { ...pipFeel('worried', t), lookY: 1, key: 'pd1' });
    roots(960, 272, 330, t, 'd1r');
    for (let i = 0; i < 3; i++) { boilSeed('dsp' + i); paint(ellPts(990 + i * 22, 735 + (i % 2) * 8, 6, 3, 8), { wash: Z.bac, ink: PAL.ink, sw: .4 }); }
    camEnd();
    whipLines(seg(t, 33.2, 34.6), 'd1w');
    flash(Math.max(seg(t, 35.6, 36), 0), '#FFF8E8');
  }
  // the micro world: a pale water film, soil grains like boulders, the root wall along the bottom with root hairs
  function microBg(t, key, sick = []) {
    K.wash(Z.micro, t, { key, blob: Z.microBlob });
    boilSeed('mw' + key);
    for (let i = 0; i < 5; i++) paint(ellPts(200 + i * 400 + 40 * wob(t, .03, i), 260 + 90 * hash(i), 260, 150, 20, 6), { fill: Z.water, fillOp: 90, bleed: .3, tex: .4, ink: null });
    [[90, 140, 210], [1820, 210, 240], [1500, -40, 170], [460, -60, 150]].forEach(([x, y, r], i) => { boilSeed('mg' + key + i); paint(ellPts(x, y, r, r * .8, 22, 5, i), { wash: i % 2 ? '#D9C7A6' : '#CDB894', fill: '#A8916C', fillOp: 50, tex: .7, ink: mixCol(PAL.ink, '#A8916C', .4), sw: 1.2 }); });
    // root hairs, then the root wall
    for (let i = 0; i < 6; i++) { boilSeed('rh' + key + i); const x = 160 + i * 330 + 80 * hash(i), h = 200 + 160 * hash(i + 3), sw = 14 * Math.sin(t * .8 + i), lean = (hash(i + 7) - .5) * 160; paint(ribbon(through([[x, 795], [x + lean * .3 + sw, 795 - h * .35], [x + lean * .7 - 30 + sw, 795 - h * .7], [x + lean + sw * 1.5, 795 - h]], 6), 26, 18), { wash: Z.root, fill: Z.rootDk, fillOp: 40, tex: .4, ink: mixCol(PAL.ink, Z.rootDk, .3), sw: 1 }); }
    boilSeed('rw' + key);
    const top = x => 780 + 18 * Math.sin(x * .004);
    paint([[-200, top(-200)], ...Array.from({ length: 12 }, (_, i) => [i * 200, top(i * 200)]), [2400, 1400], [-200, 1400]], { wash: Z.root, fill: Z.rootDk, fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.4, curv: .4 });
    for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const x = i * 170 + (r % 2) * 85 - 40, y = top(x) + 30 + r * 95; boilSeed('rc' + key + r + '_' + i);
      const sk = sick.reduce((m, [sx, k]) => Math.max(m, k * clamp(1 - Math.abs(x - sx) / 200)), 0);
      paint(rrPts(x, y, 150, 80, 26), { wash: mixCol(mixCol(Z.root, '#F4EBD0', .4), Z.rootSick, sk), ink: mixCol(PAL.ink, Z.rootDk, .4), sw: .8 });
      paint(ellPts(x + 75, y + 40, 22, 16, 10), { fill: mixCol(Z.rootDk, Z.rootSick, sk), fillOp: 90, bleed: .1, ink: null }); }
    return top;
  }
  const BACS = [[1000, 42.5], [1290, 45.4], [1560, 45.8]];       // x, the time its phage lands
  function shotD2(t, lt, dur) {
    K.setT(t);
    const shk = shakeXY(t, 6 * (near(t, 46.0, .12) + near(t, 47.3, .1) + near(t, 47.7, .1)));
    cam(1200 + shk[0] + 10 * wob(t, .04), 610 + shk[1] + 6 * wob(t, .05), 1.42 + .006 * (t - 36));
    const heal = seg(t, 47.8, 48.8);
    const top = microBg(t, 'd2', BACS.map(([x], i) => [x, seg(t, 39.2 + i * .2, 41) * (1 - heal)]));
    // Pip, the host
    const keys = [[36, 'wow', { lookX: .6 }], [38.6, 'angry', { lookX: 1, lookY: .3 }], [40.9, 'sing', { lookY: -.8 }], [42.55, 'wow', { lookX: 1, lookY: .4, take: .8 }], [44.2, 'smug', { lookX: 1, lookY: .4 }], [46.15, 'laugh', { take: 1 }], [48.0, 'happy']];
    K.swim(700, 560, 26, t, { ...K.act(t, keys) }, 'pd2');
    // bacteria + their phages
    BACS.forEach(([bx, tl], i) => {
      const by = top(bx) - 52, sIn = seg(t, 38.0 + i * .25, 39.2 + i * .25), inX = lerp(2300 + i * 200, bx, easeOut(sIn)), inY = by - 60 * (1 - sIn) + 10 * Math.sin(t * 3 + i) * (1 - sIn);
      const tc = tl + .5, td = tc + .3, tx = td + (i ? .5 : 1.0), tp = i ? tl + 1.8 : 46.0, S = 70;
      const swell = seg(t, tx, tp - .1) * .9, popK = seg(t, tp, tp + .6);
      if (t < tp + .6) bacterium(inX, inY, S, .25 + (i - 1) * .12, t, { key: 'db' + i, seed: i, mood: t > td + .1 ? (t > tx ? 'sad' : 'wow') : 'angry', swell, pop: popK, sick: seg(t, td, tx) * .8, lx: -1, ly: .3,
        inside: t > tx ? () => { const n = Math.floor(seg(t, tx, tp) * 7); for (let j = 0; j < n; j++) { const hx = -S * .6 + (j % 4) * S * .38, hy = (j < 4 ? -S * .15 : S * .15); paint(starPts(hx, hy, S * .1, .86, 6, 0), { wash: Z.phageLt, ink: PAL.ink, sw: .5 }); } } : null });
      // its phage: descends like a lander, lands on the bacterium's back, contracts, injects
      const land = [inX + 10, by - S * .42 * (1 + swell * .35) - 4], fall = seg(t, tl - 1.4, tl);
      if (t > tl - 1.4 && t < tp + 1.2) {
        const after = seg(t, tp, tp + 1.2), p = t < tl ? [lerp(land[0] - 160 + i * 60, land[0], easeOut(fall)), lerp(-220, land[1], easeOut(fall))] : [land[0] + after * 80, land[1] - after * 60 + after * after * 400];
        phage(p[0], p[1], 66, (t < tl ? .25 * (1 - fall) * Math.sin(t * 4 + i) : 0) + after * 2.4, t, { key: 'dp' + i, spread: t < tl ? .55 + .45 * fall : 1, contract: seg(t, tc, tc + .25), dnaK: seg(t, td, tx) });
        if (t > tl && t < tl + .35) K.burst(land[0], land[1], 50, seg(t, tl, tl + .35), PAL.ink, 'dl' + i);
      }
      // the burst: new phages scatter out
      if (popK > 0 && t < tp + 2.2) for (let j = 0; j < 7; j++) { const a = -Math.PI * .9 + j / 6 * Math.PI * .8 + hash(j + i * 9) * .3, d = 60 + 520 * easeOut(seg(t, tp, tp + 2.2)) * (.6 + .4 * hash(j + 1)); phage(bx + Math.cos(a) * d, by + Math.sin(a) * d, 24, a + Math.PI / 2 + t * (j % 2 ? 2 : -2), t, { key: 'dk' + i + j, dnaK: 0 }); }
      if (popK > 0 && popK < 1) K.burst(bx, by, 120, popK, Z.bacDk, 'dpb' + i);
    });
    camEnd();
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [Z.meadowDk, Z.meadow]);
  }

  // ================================ E: the virus and the sacrifice (50–60) ================================
  const PXE = 900, GYE = 1300, UE = 95;
  function closeUp(t, key, keys, extra = {}) {         // the close framing of C and E: Pip big, the leaf in the upper middle
    meadowSet(t, key, 1180, { sunX: 1550, sunY: 520, tuftH: 1.6 });
    const o = { ...K.act(t, keys), ...extra };
    pipX(PXE, GYE, UE, { ...o, key: 'p' + key });
    return o;
  }
  function shotE1(t, lt, dur) {                // 50–51.9 and 56–60: the leaf from outside
    K.setT(t);
    const inn = t < 53 ? easeIn(seg(t, 51.3, 51.9)) : 0, sink = seg(t, 59.1, 60);
    const c = [lerp(935, 960, inn), lerp(770, 690, inn) + easeIn(sink) * 800, lerp(1.9, 4.2, inn)];
    cam(c[0] + 5 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    const keys = t < 53 ? [[50, 'calm', { lookX: .6, lookY: -1 }], [50.9, 'worried', { lookX: .6, lookY: -1, emote: 'sweat' }]]
      : [[56, 'strain', { lookY: -1 }], [56.9, 'calm', { lookY: -.6, armF: { at: [1.0, -3.9] }, armsFront: true }], [58.4, 'sleepy', { emote: 'sweat', leaf: -1 }]];
    const o = closeUp(t, 'e1', keys, { bite: 1, spot: t > 53 ? 1 : 0, mottle: t > 53 ? 0 : seg(t, 51.2, 51.9) * .5 });
    if (t < 53) { const nt = leafAt(PXE, GYE, UE, o, .65); for (let i = 0; i < 6; i++) { const k = seg(t, 50 + i * .12, 51.3 + i * .08), p = [lerp(1700 + i * 60, nt[0] + (i - 2.5) * 8, easeOut(k)), lerp(380 + i * 40, nt[1] - 6 + (i % 3) * 5, easeOut(k)) + 20 * Math.sin(t * 2 + i) * (1 - k)]; if (k < 1) virusRod(p[0], p[1], 9, t * 2 + i, { key: 'ev' + i }); } }
    camEnd();
    whipLines(seg(t, 59.3, 60.3), 'ew');
    if (t > 56 && t < 56.25) flash(1 - (t - 56) / .25, '#FFF8E8');
  }
  // inside the leaf: rows of cells; the virus spreads from the torn edge; the ring around it browns and dies (HR)
  function shotE2(t, lt, dur) {                // 51.9–56
    K.setT(t);
    cam(960 + 8 * wob(t, .05), 540 + 5 * wob(t, .04), 1.0 + .015 * lt);
    K.wash('#CFE3B0', t, { key: 'e2', blob: '#E5F0CF' });
    const ex = 260, ey = 200, RING = 470;                        // the torn edge's centre and the HR ring radius
    for (let r = 0; r < 9; r++) for (let i = 0; i < 12; i++) {
      const x = i * 175 + (r % 2) * 88 - 60, y = r * 130 - 40, d = Math.hypot(x + 80 - ex, y + 55 - ey);
      if (d < 200) continue;                                     // torn away: the bite
      boilSeed('lc' + r + '_' + i);
      const inf = d < RING ? seg(t, 52.2 + (d - 200) / 260, 52.8 + (d - 200) / 260) : 0;
      const dead = d < RING + 130 ? seg(t, 54.0 + Math.max(0, d - 300) / 900, 54.6 + Math.max(0, d - 300) / 900) : 0;
      const col = mixCol(mixCol(Z.cellG, Z.mottle, inf * .8), Z.brown, dead), sh = 1 - dead * .14;
      paint(rrPts(x + 80 - 76 * sh, y + 55 - 52 * sh, 152 * sh, 104 * sh, 30), { wash: col, fill: mixCol(Z.cellGDk, Z.brownDk, dead), fillOp: 45, tex: .4, ink: mixCol(PAL.ink, Z.cellGDk, .3), sw: 1 });
      if (dead < .5) for (let k = 0; k < 3; k++) paint(ellPts(x + 46 + k * 30, y + 30 + (k % 2) * 46, 11, 7, 8, 0, k), { wash: mixCol('#5E9A3E', Z.mottle, inf), ink: null });
      if (inf > .5 && dead < .7) for (let k = 0; k < 3; k++) virusRod(x + 50 + k * 30, y + 60 + (k % 2) * 16, 11, .6 + k, { key: 'iv' + r + i + k });
    }
    boilSeed('edge'); inkLine(Array.from({ length: 16 }, (_, k) => { const a = -.3 + k / 15 * 2.2; return [ex + Math.cos(a) * (200 + 14 * Math.sin(k * 3)), ey + Math.sin(a) * (200 + 14 * Math.sin(k * 3))]; }), 3, mixCol(PAL.ink, Z.brownDk, .4), 'ink', .3);
    for (let i = 0; i < 5; i++) { const k = seg(t, 51.9 + i * .1, 52.5 + i * .1); virusRod(lerp(80 + i * 50, 380 + i * 30, easeOut(k)), lerp(60 + i * 20, 300 + i * 45, easeOut(k)), 12, 1 + i, { key: 'ev2' + i }); }
    const keys = [[51.9, 'worried', { lookX: -1, lookY: -.6, emote: 'sweat' }], [53.2, 'cry', { lookX: -1 }], [54.0, 'strain'], [55.2, 'wow', { lookX: -1, lookY: -.5, take: .8 }]];
    K.swim(1650, 960, 30, t, { ...K.act(t, keys), flip: true }, 'pe2');
    camEnd();
    if (lt < .25) flash(1 - lt / .25, '#FFF8E8');
  }

  // ================================ F: the fungus friend (60–68) ================================
  function shotF(t, lt, dur) {
    K.setT(t);
    const GY = 380, PX = 760, arrive = seg(t, 60, 60.8);
    cam(960 + 8 * wob(t, .05), 620 - (1 - easeOut(arrive)) * 500 + 5 * wob(t, .04), 1.0);
    skyBg(t, 'f');
    soilBg(t, GY, 'f'); grassStrip(t, GY, 'f');
    roots(PX, GY + 8, 330, t, 'fr');
    // hyphae from the right, wandering to the roots and wrapping them
    const H = [[[2050, 520], [1700, 560], [1400, 500], [1100, 600], [880, 640]], [[2050, 760], [1750, 700], [1450, 790], [1150, 760], [870, 760]], [[2050, 980], [1700, 920], [1350, 960], [1050, 880], [830, 840]], [[1700, 560], [1600, 420], [1300, 400]]];
    const ends = H.map((P, i) => hypha(P, seg(t, 60.3 + i * .3, 62.4 + i * .2), 2.6, 'fh' + i));
    [[1500, 790, 1440, 900], [1300, 480, 1240, 560], [1200, 940, 1160, 1040], [1650, 560, 1620, 640], [1000, 870, 960, 960]].forEach(([a, b, c, d], i) => hypha([[a, b], [(a + c) / 2 + 20, (b + d) / 2], [c, d]], seg(t, 61.4 + i * .2, 62.6 + i * .2), 2, 'fhb' + i));
    for (let i = 0; i < 3; i++) if (t > 62.4) { boilSeed('wr' + i); const e = H[i][4], k = seg(t, 62.4, 62.9); for (let j = 0; j < 3; j++) inkLine([[e[0] - 20, e[1] - 16 + j * 14], [e[0] + 20 * k, e[1] - 10 + j * 14]], 3, Z.hypha, 'ink', .4); }
    // the trade: phosphate (orange) in along the hyphae, sugar (gold) down the roots and out
    for (let i = 0; i < 3; i++) { const C = through(H[i], 6);
      for (let j = 0; j < 4; j++) { const q = frac(t * .5 + j / 4 + i * .13); if (t > 62.8 && t < 66.2) { const a = along(C, q); boilSeed('ph' + i + j); paint(ellPts(a.p[0], a.p[1], 9, 9, 8), { wash: Z.phos, ink: PAL.ink, sw: .6 }); } }
      for (let j = 0; j < 3; j++) { const q = frac(t * .45 + j / 3 + i * .2); if (t > 63.4 && t < 66.4) { const e = H[i][4], p = [lerp(PX, e[0], q), lerp(GY + 20, e[1], q)]; boilSeed('sg' + i + j); paint(ellPts(p[0], p[1], 10, 11, 8), { wash: Z.sugar, ink: PAL.ink, sw: .6 }); if (q > .9) glow(p[0], p[1], 30, '#FFD86A', .5); } }
    }
    // arbuscular mycorrhizal fungi make no mushrooms: their big round spores swell on the hyphae instead
    [[1400, 505], [1180, 758], [1520, 945], [1620, 470], [1300, 975]].forEach(([x, y], i) => { const k = seg(t, 64.4 + i * .12, 64.8 + i * .12); if (k > 0) { boilSeed('sp' + i); const r = 17 * backOut(k); paint(ellPts(x, y, r, r, 14), { wash: '#F2D68A', fill: '#C9A04A', fillOp: 50, tex: .4, ink: PAL.ink, sw: .8 }); paint(ellPts(x - r * .3, y - r * .3, r * .3, r * .25, 8), { wash: PAL.cream, washOp: 170, ink: null }); } });
    const keys = [[60, 'sleepy', { emote: 'sweat', leaf: -1 }], [61.6, 'wow', { lookX: 1, lookY: 1 }], [63.0, 'calm', { lookX: .6, lookY: 1 }], [64.55, 'excited', { take: 1.2 }], [66.4, 'smug', { armF: [1.4, 1.6], armB: [1.4, 1.6] }]];
    const o = K.act(t, keys);
    pipX(PX, GY, 34, { ...o, bite: 1, spot: 1, glowK: seg(t, 64.4, 65) * (.7 + .3 * pulse(t)), key: 'pf' });
    if (t > 64.5 && t < 65.2) K.burst(PX, GY - 110, 160, seg(t, 64.5, 65.2), PIPC.gold, 'fb');
    camEnd();
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [Z.meadowDk, Z.meadowLt]);
  }
  // ================================ G: the mistake (68–80) ================================
  const GYG = 820;
  function shotG(t, lt, dur) {
    K.setT(t);
    cam(960 + 10 * wob(t, .05) + 60 * ease(seg(t, 77, 80)), 560 + 4 * wob(t, .04), 1.0 + .03 * ease(seg(t, 77, 80)));
    meadowSet(t, 'g', GYG, { pond: [330, 300], sunX: 1500, sunY: 150 });
    // Pip walks to the frog, winds up and flicks it into the sky
    const walk = seg(t, 73.0, 73.8), px = lerp(1000, 880, ease(walk));
    const keys = [[68, 'calm', { lookX: -.5, flip: true }], [70.15, 'wow', { take: 1, flip: true, lookX: -1 }], [70.9, 'confused', { flip: true, lookX: -1 }],
      [71.42, 'cry', { take: 1.3, flip: true, rot: .1 }], [71.85, 'angry', { flip: true, lookX: -1 }], [72.5, 'angry', { flip: true, armF: { at: [1.2, -2.7] }, armsFront: true }],
      [73.0, 'angry', { flip: true, lookX: -1 }], [73.8, 'angry', { flip: true, rot: .14, armF: [2.4, 1.9], take: .3 }], [74.15, 'laugh', { flip: true, rot: -.1, armF: [-.15, 2.6], take: .6 }],
      [75.2, 'smug', { flip: true, lookX: -.4, lookY: -.8 }], [76.4, 'smug', { lookX: .5 }], [77.4, 'wow', { lookX: 1, take: .8 }], [77.9, 'worried', { lookX: 1, emote: 'sweat' }]];
    const o = K.act(t, keys);
    if (walk > 0 && walk < 1) o.walk = walk * 4;
    // the frog
    const fhop = seg(t, 69.0, 69.6), flick = seg(t, 74.18, 75.25);
    let fx = lerp(420, 720, ease(fhop)), fy = GYG + 10 - Math.sin(Math.PI * fhop) * 160, fs = 105, frot = 0;
    if (flick > 0) { const q = 1 - Math.pow(1 - flick, 2), p = arcPt([720, GYG - 40], [250, 170], 160, q); fx = p[0]; fy = p[1]; fs = lerp(105, 14, q); }
    const face = onPip(px, GYG, 34, o, .3, -3.0);
    const fly1 = [face[0] - 70 + 50 * Math.cos(t * 5), face[1] - 40 + 25 * Math.sin(t * 7)], fly2 = [face[0] - 40 + 60 * Math.cos(t * 4 + 1), face[1] - 60 + 25 * Math.sin(t * 6)];
    let tip = null;
    if (t < 75.28) {
      push(); translate(fx, fy); rotate(flick * 9); translate(-fx, -fy);
      tip = frog(fx, fy, fs, t, { dir: 1, key: 'fg', leap: fhop > 0 && fhop < 1 ? Math.sin(Math.PI * fhop) : flick > 0 ? 1 : 0, gulp: near(t, 70.6, .12),
        tongue: t < 70.8 ? fly1 : onPip(px, GYG, 34, o, -.9, -2.6), tk: t < 70.8 ? seg(t, 69.95, 70.45) : seg(t, 71.2, 71.65) });
      pop();
    }
    if (t > 75.2 && t < 75.8) K.sparkle(250, 170, 60, seg(t, 75.2, 75.8), PIPC.gold);
    pipX(px, GYG, 34, { ...o, bite: 1, spot: 1, key: 'pg' });
    if (t > 71.45 && t < 72.6) { boilSeed('slime'); const c = onPip(px, GYG, 34, o, -1.0, -2.55); paint(ellPts(c[0], c[1], 22, 14, 10), { wash: Z.tongue, washOp: 140, ink: null }); }
    if (t > 71.4 && t < 71.75) K.burst(...onPip(px, GYG, 34, o, -1.0, -2.6), 40, seg(t, 71.4, 71.75), PAL.ink, 'gs');
    if (t < 70.2 || !tip) { if (t < 70.25) fly(fly1[0], fly1[1], 22, t, 'g1'); } else if (t < 70.45) fly(tip[0], tip[1], 22, t, 'g1');
    if (t > 70.6 && t < 71.6) fly(fly2[0], fly2[1], 22, t, 'g2'); else if (t >= 71.6 && t < 74) fly(fly2[0] - (t - 71.6) * 300, fly2[1] - (t - 71.6) * 200, 22, t, 'g2');
    if (t > 74.15 && t < 74.5) K.burst(720, GYG - 80, 70, seg(t, 74.15, 74.5), PAL.ink, 'gf');
    // the first of the swarm
    [[77.3, 1270, 1], [78.1, 1480, 0], [78.5, 1130, 0], [79.1, 1620, 0], [79.4, 1360, 0]].forEach(([t0, x, bent], i) => {
      if (t < t0 - .4) return; const k = seg(t, t0 - .4, t0);
      grasshopper(x + (1 - k) * 300, GYG + 10 - (1 - easeIn(k)) * 500, 62 - i * 4, t, { dir: -1, key: 'gg' + i, bent, leap: k < 1 ? .6 : 0, crouch: near(t, t0 + .1, .12), chomp: t > t0 + .5 ? .5 + .5 * Math.sin(t * 9 + i) : 0, seed: i });
      dust(x, GYG + 12, 110, seg(t, t0, t0 + .6), 'gd' + i);
    });
    for (let i = 0; i < 18; i++) { const k = seg(t, 78.6 + hash(i) * 1.2, 80.2); if (k > 0) grasshopper(lerp(2400, 1300 + hash(i + 3) * 700, k), 120 + hash(i + 5) * 300 + 20 * Math.sin(t * 3 + i), 16, t, { dir: -1, key: 'gs' + i, leap: .8, seed: i }); }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [Z.meadowDk, Z.meadowLt]);
  }

  // ================================ H: the swarm (80–92) ================================
  function shotH(t, lt, dur) {
    K.setT(t);
    const flow = seg(t, 89.6, 90.6), swept = seg(t, 90.3, 91.9);
    const cx = 960 + 900 * ease(seg(t, 90.4, 92)), cy = 560 + 200 * easeIn(seg(t, 91, 92));
    const sk = shakeXY(t, 4 * seg(t, 80, 81) * (1 - seg(t, 86.8, 88)));
    cam(cx + sk[0], cy + sk[1], .96);
    const bare = ease(seg(t, 83, 86.4)), dim = .55 * Math.sin(Math.PI * seg(t, 80, 88.4)) + .5 * seg(t, 88.6, 89.4);
    meadowSet(t, 'h', GYG, { pond: [330, 300], bare, dim, sunX: 1500, sunY: 150 });
    // the swarm: flies in, lands, chews, flies off right
    const N = 34, onPipN = 3;
    const hop = (i) => {
      const t0 = 80 + hash(i + 1) * 2.6, t1 = 86.6 + hash(i + 2) * 1.2, k = seg(t, t0, t0 + .9), out = seg(t, t1, t1 + 1);
      if (t < t0 || out >= 1) return null;
      const lx = -200 + hash(i + 3) * 2500, ly = GYG + 10 + hash(i + 4) * 130, sx = 2300 + hash(i + 5) * 600, sy = 60 + hash(i + 6) * 400;
      let x = lerp(sx, lx, easeOut(k)), y = lerp(sy, ly, easeOut(k)) - Math.sin(Math.PI * k) * 120, air = k < 1;
      if (out > 0) { x = lerp(lx, lx + 1500, easeIn(out)); y = lerp(ly, -300, easeIn(out)); air = true; }
      return { x, y, air, s: 38 + hash(i + 7) * 22 };
    };
    for (let i = onPipN; i < N; i++) { const h = hop(i); if (h && h.y < GYG + 60) grasshopper(h.x, h.y, h.s, t, { dir: -1, key: 'hs' + i, leap: h.air ? .8 : 0, chomp: h.air ? 0 : .5 + .5 * Math.sin(t * 10 + i), seed: i, bent: i === 5 ? 1 : 0 }); }
    // Pip, chewed
    const px = 860 + 1300 * easeIn(swept), py = GYG - 60 * flow + 20 * Math.sin(t * 6) * flow;
    const keys = [[80, 'wow', { lookX: 1, take: 1 }], [80.8, 'worried', { lookX: 1, emote: 'sweat' }], [83.4, 'strain', { leaf: -.5 }], [84.6, 'cry'], [87.2, 'sad', { leaf: -1.3 }], [88.2, 'cry', { leaf: -1.3 }], [90.3, 'dizzy', { take: 1 }]];
    const o = K.act(t, keys);
    if (swept > 0) o.rot = (o.rot || 0) + swept * 5 + .3 * Math.sin(t * 4);
    pipX(px, py, 34, { ...o, bite: 1, spot: 1, chew: ease(seg(t, 83.5, 86.6)), key: 'ph', noShadow: flow > .2 });
    for (let i = 0; i < onPipN; i++) { const h = hop(i); if (!h) continue; const at = onPip(px, py, 34, o, [-.9, .7, .1][i], [-4.2, -3.6, -5.6][i]); const k = seg(t, 80 + hash(i + 1) * 2.6, 81 + hash(i + 1) * 2.6);
      const x = k < 1 || h.air ? h.x : at[0], y = k < 1 || h.air ? h.y : at[1] + 40; if (k >= 1 && !h.air) grasshopper(x, y, 40, t, { dir: i % 2 ? 1 : -1, key: 'hp' + i, chomp: .5 + .5 * Math.sin(t * 11 + i), seed: i }); else grasshopper(h.x, h.y, 40, t, { dir: -1, key: 'hp' + i, leap: .8 }); }
    for (let i = 0; i < N; i++) { const h = hop(i + 100); if (h && h.y >= GYG + 60) grasshopper(h.x, h.y, h.s * 1.1, t, { dir: -1, key: 'hf' + i, leap: h.air ? .8 : 0, chomp: h.air ? 0 : .5 + .5 * Math.sin(t * 10 + i), seed: i }); }
    // rain and the mud flow
    if (t > 88.8) {
      boilSeed('mud');
      const lvl = GYG + 60 - 110 * ease(flow), P = [[-1600, 1600]];
      for (let i = 0; i <= 30; i++) { const x = -1600 + i * 180; P.push([x, lvl + 14 * Math.sin(x * .01 - t * 6)]); }
      P.push([W + 2000, 1600]);
      if (flow > 0) paint(P, { wash: '#8E6E4E', fill: '#6E5038', fillOp: 50, tex: .5, ink: mixCol(PAL.ink, '#6E5038', .3), sw: 1.2 });
      if (flow > 0) for (let i = 0; i < 8; i++) { const x = frac(hash(i) + t * .4) * 3400 - 800; inkLine([[x, lvl + 30 + i * 12], [x + 90, lvl + 26 + i * 12]], 1.4, '#B39472', 'ink', .4); }
    }
    camEnd();
    if (t > 88.8) { boilSeed('rain'); const rk = seg(t, 88.8, 89.4); for (let i = 0; i < 60; i++) { const x = hash(i + 1) * (W + 300) - 150, y = (hash(i + 2) * H + t * 1400) % (H + 200) - 100; inkLine([[x, y], [x - 14, y + 46]], 1.4 * rk, Z.rain, 'ink', 0); } }
    if (lt > dur - .35) flash(seg(lt, dur - .35, dur), '#6E9FC0');
  }

  // ================================ I: the deep sea (92–110) ================================
  function rockFloor(gy, key) {
    boilSeed('rf' + key);
    const P = [[-1600, 1700]]; for (let i = 0; i <= 26; i++) P.push([-1600 + i * 200, gy + 50 * Math.sin(i * 1.7) + 30 * hash(i)]); P.push([W + 3600, 1700]);
    paint(P, { wash: Z.rock, fill: Z.rockDk, fillOp: 60, tex: .6, ink: mixCol(PAL.ink, Z.rock, .3), sw: 1.2, curv: .4 });
  }
  function vent(x, gy, h, t, key) {
    boilSeed('vt' + key);
    glow(x, gy - 30, 260, Z.vent, .9);
    for (let i = 0; i < 9; i++) { const k = frac(t * .18 + i / 9), py = gy - h - k * 700, r = 60 + k * 180; boilSeed('plm' + i); paint(ellPts(x + 40 * Math.sin(k * 5 + i) + k * 120, py, r, r * .8, 16, 6), { wash: Z.plume, washOp: 200 * (1 - k * .7), ink: null }); }
    const P = [[x - 110, gy + 30], [x - 80, gy - h * .3], [x - 50, gy - h * .55], [x - 60, gy - h * .8], [x - 34, gy - h], [x + 40, gy - h], [x + 56, gy - h * .75], [x + 44, gy - h * .5], [x + 90, gy - h * .25], [x + 120, gy + 30]];
    paint(P, { wash: '#4A3E44', fill: '#2A2228', fillOp: 70, tex: .7, ink: PAL.ink, sw: 1.3, curv: .3 });
    glow(x, gy - h - 10, 90, '#F2A04A', .8);
    for (let i = 0; i < 5; i++) paint(ellPts(x - 50 + i * 26, gy - h * (.2 + .15 * i), 14, 10, 8), { wash: '#8A5E3A', ink: null });
  }
  function shotI(t, lt, dur) {
    K.setT(t);
    const sinkK = seg(t, 92, 95.4);
    if (t < 95.4) {                         // sinking through the water column
      const col = mixCol(mixCol('#86B8D2', Z.sea, seg(t, 92, 93.2)), Z.deep, seg(t, 93, 95.4));
      cam(960, 540, 1);
      K.wash(col, t, { key: 'is', blob: mixCol(col, '#B9DDE8', .3) });
      boilSeed('rays'); for (let i = 0; i < 4; i++) paint([[300 + i * 420, -100], [420 + i * 420, -100], [600 + i * 420 - 200, H + 100], [380 + i * 420 - 200, H + 100]], { wash: '#DDF0F2', washOp: 70 * (1 - sinkK), ink: null });
      for (let i = 0; i < 40; i++) { boilSeed('snow' + i); const x = hash(i + 1) * W, y = (hash(i + 2) * (H + 100) - t * 260) % (H + 100); paint(ellPts(x, y < 0 ? y + H + 100 : y, 4, 3, 6), { wash: '#E8F0F0', washOp: 150, ink: null }); }
      const o = { ...pipFeel('sad', t), rot: .6 * Math.sin(t * .9), key: 'pi1', bite: 1, spot: 1, chew: 1, noShadow: true };
      pipX(960 + 40 * Math.sin(t * .7), 640 + 20 * Math.sin(t * 1.3), 34, o);
      for (let i = 0; i < 6; i++) { const k = frac(t * .7 + i / 6); boilSeed('bub' + i); paint(ellPts(960 + 30 * Math.sin(i * 2 + t), 520 - k * 520, 6 + 6 * hash(i), 6 + 6 * hash(i), 10), { wash: '#DDEFF4', washOp: 160 * (1 - k), ink: mixCol(PAL.ink, '#9CC', .5), sw: .5 }); }
      camEnd();
      if (lt < .4) flash(1 - lt / .4, '#6E9FC0');
      return;
    }
    const c = kf(t, [[95.4, [860, 560, 1.05]], [100.8, [880, 600, 1.08]], [101.8, [1260, 600, 1.15]], [103.5, [1270, 600, 1.15]], [104.3, [880, 620, 1.1]], [108.8, [880, 620, 1.1]], [110, [1000, 360, .62]]], ease);
    cam(c[0] + 6 * wob(t, .05), c[1] + 4 * wob(t, .04), c[2]);
    K.wash(Z.deep, t, { key: 'id', blob: Z.deepBlob, rect: rectPts(-2400, -2400, W + 4800, H + 4800) });
    for (let i = 0; i < 30; i++) { boilSeed('isn' + i); const x = hash(i + 1) * 2600 - 300, y = (hash(i + 2) * 1300 + t * 30) % 1300 - 200; paint(ellPts(x, y, 3, 3, 6), { wash: '#C8D0DC', washOp: 120, ink: null }); }
    const GY = 900;
    vent(1360, GY, 520, t, 'v');
    rockFloor(GY, 'i');
    // bacterial mats and tube worms by the vent
    [[1120, 30], [1600, 26], [1250, 24]].forEach(([x, r], i) => { boilSeed('mat' + i); paint(ellPts(x, GY + 10, r * 4, r, 14, 4), { wash: Z.mat, washOp: 220, ink: null }); });
    for (let i = 0; i < 9; i++) tubeWorm(1130 + i * 52 + (i > 4 ? 120 : 0), GY + 12 + (i % 2) * 8, 150 + 80 * hash(i + 2), t, i, { open: .6 + .4 * Math.sin(t * .8 + i) * .5 + .2 });
    // Pip lands, tries the sun, meets the worms and the tardigrade
    const fall = seg(t, 95.4, 96.1), px = 700;
    const keys = [[95.4, 'sad', { rot: .3 }], [96.15, 'dizzy', { take: 1 }], [97.2, 'calm', { lookX: -.6 }], [97.7, 'calm', { lookX: .6 }], [98.1, 'strain', { armF: [1.35, 1.9], armB: [1.35, 1.9], leaf: .5 }],
      [99.4, 'confused'], [100.2, 'sad'], [101.9, 'wow', { lookX: 1, take: .9 }], [102.9, 'confused', { lookX: 1 }], [104.95, 'wow', { take: 1.1, flip: true, lookX: -1 }], [105.25, 'angry', { flip: true }],
      [105.68, 'angry', { flip: true, armF: [0, 2.9], rot: -.1, take: .3 }], [106.0, 'wow', { flip: true, lookX: -1 }], [107.6, 'dizzy', { flip: true }], [108.1, 'sad', { sq: .12, dy: .15, flip: true }]];
    const o = K.act(t, keys);
    pipX(px, GY - (1 - easeOut(fall)) * 700, 34, { ...o, bite: 1, spot: 1, chew: 1, glowK: t > 98.2 && t < 99.4 ? .25 * Math.max(0, Math.sin(t * 13)) * (1 - seg(t, 98.8, 99.4)) : 0, key: 'pi2', noShadow: true });
    dust(px, GY + 10, 160, seg(t, 96.1, 96.9), 'isd', '#5A5466');
    // the tardigrade
    if (t > 103.8) {
      const inK = seg(t, 103.8, 104.9), bounce = seg(t, 105.75, 106.6), back = seg(t, 106.8, 107.8);
      let tx = lerp(-300, 560, easeOut(inK)), ty = GY - 40 + 12 * Math.sin(t * 3), rot = 0;
      if (bounce > 0) { tx = lerp(560, 250, easeOut(bounce)); ty = GY - 40 - Math.sin(Math.PI * bounce) * 180; rot = -bounce * TAU; }
      if (back > 0) tx = lerp(250, 575, ease(back));
      tardigrade(tx, ty - 20, 88, t, { key: 'tg', dir: 1, rot, sq: .45 * spring(t, 105.72, 7, 22) });
      if (t > 105.7 && t < 106.05) K.burst(610, GY - 60, 60, seg(t, 105.7, 106.05), PAL.cream, 'ib');
      if (t > 107.8 && t < 108.6) pipEmote('heart', tx + 40, ty - 90, 16, 1, 'th');
    }
    camEnd();
  }

  // ================================ J: the web (110–122) ================================
  const WEB = [['hop', -2.5], ['aphid', -1.95], ['ant', -1.4], ['lady', -.85], ['bac', -.3], ['phage', .25], ['mush', .8], ['frog', 1.35], ['worm', 1.95], ['tard', 2.6]];
  const EDGES = [[0, 7], [1, 3], [1, 2], [4, 5], [8, 4], [9, 6], [6, 1], [7, 2], [0, 6], [5, 9]];
  function icon(name, x, y, t, k) {
    if (k <= .02) return; const q = backOut(clamp(k));
    push(); translate(x, y); scale(q * 1.45, q * 1.45); translate(-x, -y);
    paint(ellPts(x, y + 8, 62, 62, 24), { wash: '#F4ECD8', ink: Z.gold, sw: 2 });
    if (name === 'hop') grasshopper(x + 30, y + 30, 30, t, { dir: -1, key: 'ih', bent: 1 });
    if (name === 'aphid') aphid(x, y + 20, 34, t, { key: 'ia' });
    if (name === 'ant') ant(x, y + 18, 40, t, { key: 'in', dir: -1 });
    if (name === 'lady') ladybug(x, y + 18, 40, t, { key: 'il' });
    if (name === 'bac') bacterium(x, y, 30, .2, t, { key: 'ib', mood: 'calm' });
    if (name === 'phage') phage(x, y + 42, 32, 0, t, { key: 'ip' });
    if (name === 'mush') mushroom(x, y + 44, 80, 1, 'im');
    if (name === 'frog') frog(x - 6, y + 40, 52, t, { key: 'if' });
    if (name === 'worm') { tubeWorm(x - 12, y + 52, 90, t, 1); tubeWorm(x + 14, y + 52, 74, t, 2); }
    if (name === 'tard') tardigrade(x, y + 4, 34, t, { key: 'it' });
    pop();
  }
  function shotJ(t, lt, dur) {
    K.setT(t);
    if (t < 111.8) {                      // up through the water to the surface
      const k = seg(t, 110, 111.8), col = mixCol(mixCol(Z.deep, Z.sea, ease(seg(t, 110, 111))), '#CFE8EE', ease(seg(t, 111, 111.8)));
      cam(960, 540, 1); K.wash(col, t, { key: 'ju', blob: mixCol(col, PAL.cream, .3) }); camEnd();
      boilSeed('jl'); for (let i = 0; i < 16; i++) { const x = hash(i + 1) * W, y = H - ((hash(i + 2) * H + k * 2400) % (H + 300)) + 150, L = 240 + 200 * hash(i + 4); paint(ribbon([[x, y], [x + 4, y + L]], 10, 2), { wash: '#F2F6F4', washOp: 160, ink: null }); }
      flash(seg(t, 111.4, 111.8), '#FFF8E8');
      return;
    }
    const zin = easeIn(seg(t, 120.9, 122));
    const EX = 1080, EY = 560, R = lerp(1500, 290, easeOut(seg(t, 111.8, 113.6)));
    cam(lerp(960, EX - 120, zin), lerp(540, EY + 140, zin), 1 + 5 * zin);
    K.wash(Z.space, t, { key: 'js', blob: Z.spaceBlob, rect: rectPts(-1600, -1600, W + 3200, H + 3200) });
    for (let i = 0; i < 70; i++) { boilSeed('star' + i); const x = hash(i + 1) * W, y = hash(i + 2) * H, r = 2 + 3 * hash(i + 3) * (.6 + .4 * Math.sin(t * 2 + i)); paint(starPts(x, y, r * 2, .4, 4), { wash: '#F6EEDA', ink: null }); }
    earth(EX, EY, R, t, 'je');
    // the web: icons around the globe, gold threads between them and to the Earth
    const shakeT = 116.5, yank = spring(t, shakeT, 4, 16), RR = 400;
    const pos = WEB.map(([n, a], i) => { const r = RR + (n === 'frog' ? 140 * Math.max(0, Math.sin(Math.PI * seg(t, shakeT - .15, shakeT + .25))) : 0); const j = 14 * yank * Math.sin(i * 2.3); return [EX + Math.cos(a) * r * 1.2 + j, EY + Math.sin(a) * r * .98 + j * .6]; });
    const thread = (A, B, k, key) => { if (k <= .06) return; boilSeed('th' + key); const i = key.length * 3.1 + key.charCodeAt(key.length - 1) * .7; const m = [(A[0] + B[0]) / 2 + 40 * yank * Math.sin(i * 1.7 + t * 20), (A[1] + B[1]) / 2 + 40 * yank * Math.cos(i * 1.3 + t * 18)], e = [lerp(A[0], B[0], k), lerp(A[1], B[1], k)];
      const P = through(k < 1 ? [A, [lerp(A[0], m[0], k), lerp(A[1], m[1], k)], e] : [A, m, B], 6).filter((p, j, a) => !j || Math.hypot(p[0] - a[j - 1][0], p[1] - a[j - 1][1]) > .5); if (P.length > 1) paint(ribbon(P, 6, 6), { wash: Z.goldLt, ink: null }); if (k > .98) glow(m[0], m[1], 50, '#F5C860', .35); };
    pos.forEach((p, i) => thread([EX, EY], p, seg(t, 114.6 + i * .1, 115.4 + i * .1), 's' + i));
    EDGES.forEach(([a, b], i) => thread(pos[a], pos[b], seg(t, 115.2 + i * .1, 116.0 + i * .1), 'e' + i));
    const px = 300 + 30 * Math.sin(t * .5), py = 780;
    thread([px + 40, py - 120], [EX - R * .7, EY + R * .3], seg(t, 120.2, 120.9), 'pip');
    pos.forEach((p, i) => { glow(p[0], p[1], 70, '#F5C860', .35 * seg(t, 115, 116)); icon(WEB[i][0], p[0], p[1], t, popK(t, 114.0 + i * .12)); });
    const keys = [[111.8, 'calm', { lookX: 1 }], [113.3, 'wow', { lookX: 1, take: .6 }], [114.4, 'calm', { lookX: 1, lookY: -.3 }], [116.6, 'wow', { lookX: 1, take: 1.2 }], [118.0, 'idea'], [119.3, 'calm', { lookX: 1, armF: [.7, 1.9], armB: [.7, 1.9] }], [120.4, 'love']];
    const inP = easeOut(seg(t, 112.6, 113.6));
    K.swim(lerp(-200, px, inP), py, 30, t, { ...K.act(t, keys), bite: 1, spot: 1, chew: 1 }, 'pj');
    camEnd();
    flash(seg(t, 121.6, 122), '#FFF8E8');
  }

  // ================================ K + L: the shadow returns, and the rhyme (122–150) ================================
  const GYK = 820, PXK = 960;
  function shotKL(t, lt, dur) {
    K.setT(t);
    const camL = ease(seg(t, 130.6, 131.6)) * (1 - ease(seg(t, 134, 135.2)));
    const sk = shakeXY(t, 6 * seg(t, 125, 125.6) * (1 - seg(t, 130.4, 131)) + 10 * near(t, 130.05, .15));
    cam(960 - 180 * camL + sk[0] + 8 * wob(t, .05), 560 + sk[1] + 4 * wob(t, .04), 1.0);
    const bx = kf(t, [[122, 2600], [126.2, 2600], [127.6, 1700], [130.0, 1210], [139.0, 1210], [141.4, 2700]], ease);
    const wilt = seg(t, 128.8, 130.6);
    meadowSet(t, 'k', GYK, { pond: [500, 220], sunX: 1500, sunY: 150, behind: () => {
      tree(150, GYK + 30, 470, t, { key: 'tl', bloom: 1, wilt });
      if (t < 128.3) tree(1620, GYK + 30, 520, t, { key: 'tr', bloom: 1, fall: easeIn(seg(t, 127.35, 128.1)), seed: 2 });
    } });
    // petals falling from the wilting tree
    for (let i = 0; i < 10; i++) { const k = seg(t, 128.9 + i * .15, 130.9 + i * .15); if (k > 0 && k < 1) { boilSeed('pt' + i); paint(ellPts(80 + hash(i) * 160 + 30 * Math.sin(k * 6 + i), lerp(430, GYK, k), 6, 4, 8, 0, k * 6), { wash: Z.petal, ink: PAL.ink, sw: .4 }); } }
    // the scraped ground behind the blade
    boilSeed('scr'); if (bx < 2500) paint([[bx + 40, GYK - 10], [W + 2000, GYK - 10], [W + 2000, 1700], [bx + 40, 1700]], { wash: Z.bare, fill: Z.bareDk, fillOp: 60, tex: .6, ink: null });
    // bees
    const fleeK = seg(t, 127.3, 128.6), beeBack = seg(t, 142.8, 144.0);
    for (let i = 0; i < 4; i++) { if (t > 128.6 && i) continue; const home = i < 2 ? [1560 + i * 90, 480 + 40 * i] : [120 + (i - 2) * 80, 470 + 30 * i], p0 = [home[0] + 50 * Math.sin(t * 2 + i), home[1] + 30 * Math.sin(t * 3 + i * 2)];
      if (t < 128.6) { const p = fleeK > 0 ? arcPt(p0, [p0[0] - 500, -300], 200, easeIn(fleeK)) : p0; bee(p[0], p[1], 22, t, { key: 'kb' + i, dir: fleeK > 0 ? -1 : (Math.sin(t * 2 + i) > 0 ? -1 : 1) }); } }
    // the hand: reaches for the left tree's fruit (none), then comes to Pip, scoops, pats, shades, waves, leaves
    const hp = kf(t, [[131.0, [190, -700]], [132.0, [200, 430]], [133.6, [200, 440]], [134.2, [300, 200]], [135.4, [960, 330]], [136.0, [970, 420]], [136.8, [1060, 800]], [137.8, [1020, 790]], [138.0, [1020, 760]], [138.25, [1020, 790]], [138.5, [1020, 760]], [138.75, [1020, 790]],
      [139.4, [985, 360]], [146.2, [990, 350]], [147.6, [1050, -900]]], ease);
    const handOn = t > 131 && t < 147.6;
    const curl = t < 133 ? .3 + .25 * Math.sin(t * 9) * seg(t, 132, 132.3) : t < 133.7 ? kf(t, [[133, .4], [133.25, 1]], easeOut) : t < 134.3 ? 1 - seg(t, 133.7, 134.3) : 0;
    const wig = t > 145.6 && t < 146.6 ? .25 * Math.max(0, Math.sin((t - 145.6) * 14)) : 0;
    if (handOn) { boilSeed('hsh'); paint(ellPts(hp[0] + 40, GYK + 8, 220 - Math.max(0, GYK - hp[1]) * .1, 34, 20), { fill: '#3B2F3A', fillOp: 40 * clamp(1 - (GYK - hp[1]) / 900), bleed: .2, ink: null }); }
    // the neighbours: frog, two grasshoppers, a ladybug; they hide behind Pip, then come out
    const hide = ease(seg(t, 127.7, 128.6)) * (1 - ease(seg(t, 145.0, 146.0))), tremble = (t > 128.6 && t < 139.4 ? 3 : 0) * Math.sin(t * 40);
    const fx = lerp(lerp(680, 820, hide), 700, 0) + tremble, fy = GYK + 10 - Math.max(Math.sin(Math.PI * seg(t, 127.7, 128.3)), Math.sin(Math.PI * seg(t, 145, 145.6))) * 120;
    frog(fx, fy, 90, t, { dir: 1, key: 'kf', leap: (t > 127.7 && t < 128.3) || (t > 145 && t < 145.6) ? .8 : 0, gulp: near(t, 123.5, .2) });
    [[1180, 860], [1290, 900]].forEach(([x0, x1], i) => { const hk = seg(t, 127.8 + i * .15, 128.5 + i * .15), ok = seg(t, 145.2 + i * .2, 145.9 + i * .2), x = lerp(lerp(x0, x1, ease(hk)), x0 + 40, ease(ok)), air = Math.max(Math.sin(Math.PI * hk), Math.sin(Math.PI * ok)) * 150;
      grasshopper(x + tremble, GYK + 14 - air, 46, t, { dir: hk > 0 && ok === 0 ? -1 : i ? -1 : 1, key: 'kg' + i, leap: air > 5 ? .7 : 0, chomp: t < 125 ? .5 + .5 * Math.sin(t * 8 + i) : 0, seed: i }); });
    // Pip
    const keys = [[122, 'calm', { lookX: -1, flip: true }], [122.6, 'wave', { flip: true }], [124.2, 'happy', { flip: true }], [125.15, 'wow', { lookX: 1, lookY: -.8, take: 1 }], [126.4, 'worried', { lookX: 1, emote: 'sweat' }],
      [127.8, 'angry', { lookX: 1, armF: [.25, 2.3], armB: [.25, 2.3] }], [130.1, 'worried', { lookX: 1, armF: [.25, 2.3], armB: [.25, 2.3], emote: 'sweat' }], [131.4, 'worried', { lookX: -1, lookY: -.6 }],
      [134.4, 'worried', { lookX: 0, lookY: -1, emote: 'sweat', rot: .06 }], [136.9, 'wow', { lookX: .6, lookY: -.2, take: .7 }], [139.45, 'wow', { lookY: -1, take: .8 }], [140.6, 'happy', { lookY: -.8 }],
      [142.1, 'shy', { lookX: -.4, lookY: -1 }], [144.25, 'love'], [145.6, 'wave', { lookY: -.6 }], [147.2, 'happy']];
    const o = K.act(t, keys);
    o.dy = (o.dy || 0) - .25 * ease(seg(t, 137, 137.8));
    o.rot = (o.rot || 0) + tremble * .004;
    const mound = ease(seg(t, 137.0, 137.8));
    pipX(PXK, GYK - mound * 8, 34, { ...o, bite: 1, spot: 1, chew: 1, bloom: seg(t, 142, 143.2), key: 'pk' });
    if (mound > 0) { boilSeed('mnd'); paint(ellPts(PXK, GYK + 4, 110 * mound, 26 * mound, 16, 3), { wash: Z.soil, fill: Z.soilDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: .9 }); }
    // the ladybug on Pip's back
    { const lk = seg(t, 127.9, 128.5), ok = seg(t, 145.4, 146.2), on = onPip(PXK, GYK, 34, o, -1.6, -2.2), home = [1080, GYK - 40];
      const p = ok > 0 ? arcPt(on, [1420, GYK - 60], -80, ease(ok)) : lk > 0 ? arcPt(home, on, -100, ease(lk)) : home; ladybug(p[0] + tremble, p[1], 24, t, { key: 'kl', dir: -1, fly: (lk > 0 && lk < 1) || (ok > 0 && ok < 1) ? 1 : 0 }); }
    // the bee comes back to Pip's blossom
    if (t > 142.8) { const bl = stalkAt(PXK, GYK - mound * 8, 34, o, .7), tgt = [bl[0] - 17, bl[1] - 4], p = beeBack < 1 ? arcPt([-150, 300], tgt, 160, easeOut(beeBack)) : [tgt[0] + 3 * Math.sin(t * 9), tgt[1] - 14]; bee(p[0], p[1], 20, t, { key: 'kbb', dir: 1 }); if (t > 144 && t < 144.6) K.sparkle(tgt[0], tgt[1] - 20, 40, seg(t, 144, 144.6), PIPC.gold); }
    // the blade
    if (bx < 2500) blade(bx, GYK + 30, 280, t, 'kd');
    if (t > 130 && t < 131) dust(bx - 30, GYK + 20, 300, seg(t, 130, 131), 'kdd');
    if (handOn) hand(hp[0], hp[1], 72, Math.PI / 2 - (t > 136.4 && t < 138.9 ? .25 : 0), { key: 'kh', curl: curl + wig, cup: t > 136.4 && t < 137.9 ? 1 : 0 });
    camEnd();
    // the shadow: slides in with the rumble, stays over the meadow, and goes when the blade backs away
    const shIn = ease(seg(t, 125, 127.6)), shOut = ease(seg(t, 139, 141.4)), sx = lerp(W + 200, 700, shIn) + (W + 400 - 700) * shOut;
    if (shIn > 0 && sx < W + 150) { boilSeed('shk'); const P = [[sx, -200], [W + 400, -200], [W + 400, H + 200], [sx + 200, H + 200]]; for (let i = 0; i <= 8; i++) P.push([sx + 100 * Math.sin(i * 1.7) + (i % 2 ? 70 : 0), H + 200 - i * (H + 400) / 8]); paint(P, { wash: '#2B2440', washOp: 95, ink: null }); }
    if (lt < .3) flash(1 - lt / .3, '#FFF8E8');
    // out: iris on Pip and the blossom
    if (t > 147.5) iris(...toScreen(PXK, GYK - 110, LAST_CAM), lerp(1500, 0, easeIn(seg(t, 147.5, 148.9))));
  }

  // ================================ covers (the one place with text) ================================
  // The brawl: one huge Pip in the middle of a radial burst, swinging, while the whole cast piles in from every side.
  // The text sits at the top (10% margins, under 10 characters); the bottom 20% holds only creatures.
  // cover43 is the same layout squeezed toward the centre (sx) for the 1440 × 1080 crop.
  const COVER_FONT = '"HanziPen SC", "Wawati SC", "PingFang SC", sans-serif';
  const measure = (txt, size) => { const c = (measure.c ||= document.createElement('canvas').getContext('2d')); c.font = `bold ${size}px ${COVER_FONT}`; return c.measureText(txt).width; };
  function coverLine(cx, y, size, parts) { let x = cx - parts.reduce((w, [txt]) => w + measure(txt, size) + size * .02, 0) / 2; for (const [txt, col] of parts) { letter(txt, x, y, size, col, { screen: true, align: 'left', font: `bold ${size}px ${COVER_FONT}`, stroke: PAL.ink }); x += measure(txt, size) + size * .02; } }
  function coverBrawl(t, sx, ts) {
    K.setT(t);
    const X = x => 960 + (x - 960) * sx, GY = 1050, U = 116;
    boilSeed('cvbg'); paint(rectPts(-100, -100, W + 200, H + 200), { wash: '#F6C35A', ink: null });
    for (let i = 0; i < 28; i++) { if (i % 2) continue; const a0 = i / 28 * TAU, a1 = (i + 1) / 28 * TAU; boilSeed('ray' + i); paint([[960, 640], [960 + Math.cos(a0) * 2400, 640 + Math.sin(a0) * 2400], [960 + Math.cos(a1) * 2400, 640 + Math.sin(a1) * 2400]], { wash: '#FAE29A', ink: null }); }
    glow(960, 640, 700, '#FFF2C8', .6);
    boilSeed('cvgr'); paint([[-100, GY - 40], [W + 100, GY - 60], [W + 100, H + 100], [-100, H + 100]], { wash: Z.meadow, fill: Z.meadowDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.2, curv: .4 });
    for (let i = 0; i < 7; i++) dust(X(300 + i * 230), GY - 30 + 10 * (i % 2), 220, .35 + .05 * i, 'cvd' + i, '#EADBB8');
    // behind Pip
    bee(X(380), 330, 52, t, { key: 'cvbe', dir: 1, ang: .2 });
    phage(X(1690), 420, 80, -.5, t, { key: 'cvph', spread: .7 });
    ladybug(X(1430), 330, 62, t, { key: 'cvlb', dir: -1, fly: 1, ang: -.3 });
    [[1250, 470, .4], [1330, 560, 1.4], [1210, 620, 2.2], [690, 470, .9], [610, 560, 2.0]].forEach(([x, y, a], i) => virusRod(X(x), y, 26, a, { key: 'cvv' + i }));
    bacterium(X(1720), 640, 66, -.5, t, { key: 'cvb2', mood: 'angry', lx: -1, seed: 2 });
    // Pip, mid-swing
    const o = { ...pipFeel('angry', .2), face: 'angry', emote: 'anger', emoteK: 1, armF: [1.0, 2.5], armB: [-.2, 2.3], rot: -.05, leaf: -.45, lookX: -.6, bite: 1, spot: 1, weight: 1.4, key: 'cvp' };
    pipX(960, GY, U, o);
    for (let i = 0; i < 3; i++) { const p = stalkAt(960, GY, U, o, .35 + i * .2); aphid(p[0] + (i % 2 ? 14 : -14), p[1], 30, t, { key: 'cva' + i, dir: i % 2 ? 1 : -1, ang: (i % 2 ? 1 : -1) * 1.2, swell: .6 }); }
    // in front: the attackers
    grasshopper(X(470), 610, 125, t, { dir: 1, key: 'cvg1', leap: 1, chomp: .8, bent: 1, lean: .25 });
    K.burst(X(700), 620, 80, .45, PAL.ink, 'cvk1');
    const hand = onPip(960, GY, U, o, -2.2, -2.9);
    frog(X(330), 1030, 145, t, { dir: 1, key: 'cvf', tongue: hand, tk: .5 });
    bacterium(X(1500), 820, 84, -.3, t, { key: 'cvb1', mood: 'angry', lx: -1 });
    tardigrade(X(1610), 960, 78, t, { key: 'cvt', dir: -1, rot: .4 });
    K.burst(X(1480), 960, 90, .45, PAL.ink, 'cvk2');
    grasshopper(X(1330), 1050, 80, t, { dir: -1, key: 'cvg2', leap: .6, chomp: .5, seed: 3 });
    [[740, 1045, 1], [620, 1060, 2], [1190, 1050, 3]].forEach(([x, y, i]) => ant(X(x), y, 52, t, { key: 'cvn' + i, dir: x < 960 ? 1 : -1, bite: .8, step: i * .3 }));
    coverLine(960, 150, ts, [['千万别惹', PIPC.gold], ['生物圈！！', '#E8524A']]);
  }
  LOOPS.cover = t => coverBrawl(t, 1, 120);
  LOOPS.cover.len = 2;
  LOOPS.cover43 = t => coverBrawl(t, .72, 98);
  LOOPS.cover43.len = 2;
  shots([[0, shotA], [10, shotB], [22, shotC], [34, shotD1], [36, shotD2], [50, shotE1], [51.9, shotE2], [56, shotE1], [60, shotF], [68, shotG], [80, shotH], [92, shotI], [110, shotJ], [122, shotKL]]);
})();

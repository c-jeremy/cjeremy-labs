// pip_sheets.js: Pip's model sheet and the channel avatar, as standalone loops (labels are fine here, as in sheets.js).
//   node render.mjs --page=pip.html --loop=pip --sheet=1 --cols=1 --w=1920 --out=docs/pip_reactions.jpg
//   node render.mjs --page=pip.html --loop=pipAvatar --sheet=0 --cols=1 --crop=420,0,1080,1080 --w=1080 --out=docs/pip_avatar.jpg
(() => {
  const label = (txt, x, y, size = 20) => letter(txt, x, y, size, PAL.ink, { ink: false, alpha: .8 });

  // Every mood in PIP_FEELS, alive.
  LOOPS.pip = t => {
    const cols = 7, rows = Math.ceil(PIP_FEELS.length / cols), cw = W / cols, ch = H / rows;
    PIP_FEELS.forEach((name, i) => {
      const cx = cw * (i % cols) + cw / 2 - 20, gy = ch * Math.floor(i / cols) + ch - 64;
      pip(cx, gy, 24, { ...pipFeel(name, t, { seed: i }), key: 'p' + i });
      label(name, cx, gy + 34);
    });
  };
  LOOPS.pip.len = 4;

  // The slapstick moods (PIP_TOON_FEELS), alive.
  //   node render.mjs --page=pip.html --loop=pipToon --sheet=1.1 --cols=1 --w=1920 --out=docs/pip_toon_moods.jpg
  LOOPS.pipToon = t => {
    const cols = 6, rows = Math.ceil(PIP_TOON_FEELS.length / cols), cw = W / cols, ch = H / rows;
    PIP_TOON_FEELS.forEach((name, i) => {
      const cx = cw * (i % cols) + cw / 2 - 20, gy = ch * Math.floor(i / cols) + ch - 70;
      pip(cx, gy, 27, { ...pipFeel(name, t, { seed: i }), key: 't' + i });
      label(name, cx, gy + 38);
    });
  };
  LOOPS.pipToon.len = 4;

  // The slapstick faces (PIP_FACES) up close, plus the parts on their own: popped eyes, a dropped jaw, cheeks.
  //   node render.mjs --page=pip.html --loop=pipFaces --sheet=.5 --cols=1 --w=1920 --out=docs/pip_toon_faces.jpg
  LOOPS.pipFaces = t => {
    const F = Object.keys(PIP_FACES), extra = [['eyeS 1.8', { face: 'wow', eyeS: 1.8, pupil: .4 }], ['jaw 2.2', { face: 'shock', jaw: 2.2, eyeS: 1.6 }],
      ['teeth + jaw .6', { face: 'eek', jaw: .6 }], ['pupil 1.7', { face: 'calm', pupil: 1.7, tear: .6, brow: [.3, -.04] }], ['eyes [dot, wow]', { face: 'calm', eyes: ['dot', 'wow'], mouth: 'smug' }]];
    const all = [...F.map(n => [n, { face: n }]), ...extra], cols = 6, cw = W / cols, ch = H / 3;
    all.forEach(([name, o], i) => {
      const cx = cw * (i % cols) + cw / 2, gy = ch * Math.floor(i / cols) + ch - 60;
      pip(cx, gy, 34, { ...o, turn: .3, armF: [-1.2, 1.5], armB: [-1.2, 1.5], key: 'f' + i });
      label(name, cx, gy + 40);
    });
  };
  LOOPS.pipFaces.len = 2;

  // A DNA double helix along a path P (world points): two backbones winding round each other, paired rungs between.
  // ph turns the helix; r: its radius; tw: turns per 100 px. The back half goes first so the front strand crosses over.
  const BASES = [['#E8AA38', '#3A9C98'], ['#3A9C98', '#E8AA38'], ['#E27A92', '#6E9F58'], ['#6E9F58', '#E27A92']];
  function helix(P, r, ph, tw, o = {}) {
    const C = through(P, 10), n = C.length, L = [0];
    for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
    const nrm = i => { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d]; };
    const at = (i, s) => { const th = ph + L[i] / 100 * tw * TAU + (s ? Math.PI : 0), [nx, ny] = nrm(i); return { p: [C[i][0] + nx * r * Math.sin(th), C[i][1] + ny * r * Math.sin(th)], z: Math.cos(th) }; };
    const strand = (s, front) => {                     // the stretches of one backbone on one side
      let run = [];
      const flush = () => { if (run.length > 1) paint(ribbon(run, o.bw, o.bw), { wash: s ? o.c1 : o.c0, ink: PAL.ink, sw: o.sw }); run = []; };
      for (let i = 0; i < n; i++) { const q = at(i, s); if ((q.z >= 0) === front) run.push(q.p); else { if (run.length) run.push(q.p); flush(); } }
      flush();
    };
    boilSeed('helixB'); strand(0, false); strand(1, false);
    boilSeed('helixR');
    const step = o.rung || 34;
    for (let d = step / 2, k = 0; d < L[n - 1]; d += step, k++) {
      let i = 0; while (i < n - 1 && L[i] < d) i++;
      const a = at(i, 0), b = at(i, 1), m = [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2], [ca, cb] = BASES[Math.floor(hash(k * 3.1 + 2) * 4)];
      if (Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1]) < o.bw * 1.2) continue;
      paint(ribbon([a.p, m], o.rw, o.rw), { wash: ca, ink: PAL.ink, sw: o.sw * .6 });
      paint(ribbon([m, b.p], o.rw, o.rw), { wash: cb, ink: PAL.ink, sw: o.sw * .6 });
    }
    boilSeed('helixF'); strand(0, true); strand(1, true);
  }
  window.pipHelix = helix;

  // The avatar: Pip skipping with a DNA helix for a jump rope, inside a round badge that survives a circle crop.
  // Frame it with --crop=420,0,1080,1080 (the square centred on the canvas); the badge is the circle of radius 500 in it.
  LOOPS.pipAvatar = t => {
    const cx = W / 2, cy = H / 2, R = 468;
    boilSeed('badge');
    paint(ellPts(cx, cy, 540, 540, 72), { wash: '#F6D77A', ink: null });
    paint(ellPts(cx, cy, R, R, 72), { wash: '#BFE6D8', fill: '#8FCFBC', fillOp: 70, tex: .4, bleed: .05, ink: null });
    const u = 84, gx = cx, gy = cy + 345, lift = .45, hx = 3.05, hy = -3.7;
    boilSeed('ground'); paint(ellPts(gx, gy + 6, 2.4 * u, .36 * u, 24), { wash: '#86C4AF', ink: null });
    for (const s of [-1, 1]) inkLine([[gx + s * 1.25 * u, gy - .05 * u], [gx + s * 1.9 * u, gy + .08 * u]], 1.6, '#3E7F6C', 'ink', 0);
    // the helix arches from hand to hand, over the leaf, like a skipping rope at the top of its swing
    const by = gy - lift * u, hL = [gx - hx * u, by + hy * u], hR = [gx + hx * u, by + hy * u], A = hx * u, B = 4.25 * u;
    const P = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * (1 + i / 16) - .0; P.push([gx + Math.cos(a) * A * 1.06, hL[1] + Math.sin(a) * B + (i === 0 || i === 16 ? .25 * u : 0)]); }
    helix(P, 52, t * 3, .5, { bw: 25, rw: 15, sw: 2.2, c0: '#2F3C7A', c1: '#D97757', rung: 34 });
    pip(gx, gy, u, { face: 'happy', dy: -lift, sq: -.03, armF: { at: [hx, hy] }, armB: { at: [-hx, hy] }, leaf: -.75, blush: 1, turn: 0, noShadow: true, weight: 1.7, key: 'av' });
    for (let i = 0; i < 3; i++) { const [sx, sy, r] = [[cx - 380, cy - 190, 24], [cx + 385, cy - 120, 30], [cx + 300, cy - 330, 18]][i]; paint(starPts(sx, sy, r, .32, 4), { wash: '#FFF5E2', ink: PAL.ink, sw: .8 }); }
  };
  LOOPS.pipAvatar.len = 2;

  // The slapstick reel: every TOON gag in turn, each with a simple cause, on a plain stage.
  //   node render.mjs --page=pip.html --loop=pipReel --strip=<a>:<b> --out=…        (REEL_AT[name] = a segment's start)
  //   node render.mjs --page=pip.html --loop=pipReel --frames --workers=1 --frames-dir=out/pip_reel/frames   → --encode
  if (typeof TOON !== 'undefined') {
    const FL = 880, U = 56, X = 960, S = TOON;
    const stage = (key, edge = null) => {                          // a warm wall and a floor (edge: the floor stops there, a cliff)
      boilSeed('rw' + key); paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#F2E6D0', ink: null });
      boilSeed('rwb' + key); paint(ellPts(560, 380, 420, 200, 20, 8), { fill: '#F8EEDC', fillOp: 90, bleed: .3, tex: .4, ink: null });
      boilSeed('rf' + key);
      if (edge === null) { paint(rectPts(-60, FL, W + 120, H - FL + 60), { wash: '#DCC6A2', fill: '#C9AE84', fillOp: 40, tex: .4, ink: null }); inkLine([[-40, FL], [W + 40, FL]], 1.4, '#9C8058', 'ink', 0); }
      else {
        paint(rectPts(-60, FL, edge + 60, H - FL + 60), { wash: '#C9B28C', fill: '#A88C62', fillOp: 45, tex: .5, ink: null });
        inkLine([[-40, FL], [edge, FL], [edge - 6, FL + 70], [edge + 8, FL + 150], [edge - 4, H + 40]], 1.6, '#7E6444', 'ink', .2);
      }
    };
    const radical = (x, y, r, t, key) => { if (r < 2) return; boilSeed('rr' + key); paint(starPts(x, y, r, .55, 9, t * 1.5), { wash: '#D2427E', ink: PAL.ink, sw: 1.2 }); paint(ellPts(x + r * .15, y - r * .1, r * .14, r * .14, 8), { wash: PAL.ink, ink: null }); };
    const cap = (txt, sub) => { label(txt, X, 1000, 30); if (sub) label(sub, X, 1040, 18); };
    const calm = (t, s = 0) => pipFeel('calm', t, { seed: s });
    const P = (x, o, key = 'rp') => S.pip(x, FL, U, { ...o, key });
    const REEL = [
      ['wildTake', 3.2, t => { stage('a'); radical(1330, 640, 46 * backOut(seg(t, .75, 1.0)), t, 'a'); P(X, S.mix(calm(t), S.wildTake(t, 1.15))); cap('wildTake', 'TOON.wildTake(t, t0, {amt, hang})'); }],
      ['doubleTake', 4.1, t => { stage('b'); radical(1330, 640, 46, t, 'b'); P(X, S.mix(pipFeel('happy', t), S.doubleTake(t, .5))); cap('doubleTake', 'a glance, back to smiling, then the take'); }],
      ['headShake', 2.2, t => { stage('c'); P(X, S.mix(t < .6 ? pipFeel('blech', t) : calm(t), S.headShake(t, .6, { len: .8 }))); cap('headShake', 'shaking it off'); }],
      ['shiver', 2.6, t => { stage('d'); P(X, S.mix(calm(t), S.shiver(t, .3, 2.3))); cap('shiver', 'TOON.shiver(t, t0, t1): buzzing, chattering teeth'); }],
      ['gulp', 2.0, t => { stage('e'); P(X, S.mix(pipFeel('worried', t), S.gulp(t, .5))); cap('gulp'); }],
      ['zip', 2.4, t => { stage('f'); P(X, S.mix(calm(t), S.zip(t, 1.0, { dist: 30 }))); cap('zip', 'rev up, gone: an outline and a puff left behind'); }],
      ['skid', 2.6, t => { stage('g'); P(X, S.mix(calm(t), S.skid(t, .6, { from: 22 }))); cap('skid', 'in at full tilt, braking to a stop'); }],
      ['flatten', 3.0, t => {
        stage('h'); const G = .55, hold = 1.1, fall = easeIn(seg(t, .35, G)), up = easeIn(seg(t, G + hold - .3, G + hold + .1));
        const o = S.mix(calm(t), S.flatten(t, G, { hold })); P(X, o);
        const by = t < G ? lerp(-260, FL - 5 * U, fall) : lerp(FL - 5 * U * (1 - (o.sq || 0)) - 4, -300, up);
        if (t > .3 && up < 1) { boilSeed('rwt'); paint([[X - 150, by], [X + 150, by], [X + 110, by - 150], [X - 110, by - 150]], { wash: '#7C7A86', fill: '#5E5C68', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.6 }); paint(rectPts(X - 40, by - 200, 80, 55), { ink: PAL.ink, sw: 6 }); }
        cap('flatten', 'pancaked, two blinks, boing');
      }],
      ['wallSplat', 3.6, t => {
        stage('i'); const G = .75, WX = 1360, run = seg(t, 0, G), x = lerp(560, WX - 1.8 * U, run);
        boilSeed('rww'); paint(rectPts(WX, -60, W - WX + 60, FL + 60), { wash: '#C77B5E', fill: '#A35A40', fillOp: 45, tex: .5, ink: PAL.ink, sw: 1.4 });
        for (let r = 0; r < 12; r++) { boilSeed('rwr' + r); inkLine([[WX, r * 80], [W + 40, r * 80]], .8, '#7E3F2C', 'inkfine', 0); for (let c = 0; c < 4; c++) inkLine([[WX + 40 + c * 150 + (r % 2) * 75, r * 80], [WX + 40 + c * 150 + (r % 2) * 75, r * 80 + 80]], .8, '#7E3F2C', 'inkfine', 0); }
        P(t < G ? x : WX - 1.8 * U, S.mix(t < G ? S.dash(t, { speed: 1.4 }) : calm(t), S.wallSplat(t, G)));
        cap('wallSplat', 'mashed flat, peels off, timber!');
      }],
      ['spinOut', 3.0, t => { stage('j'); P(X, S.mix(calm(t), S.spinOut(t, .6))); if (t > .55 && t < .9) S.FX.impact(S.geo(X, FL, U, {}), { k: seg(t, .55, .9), at: [-1.9, -3], r: 1.3 }); cap('spinOut', 'spun like a top, then dizzy'); }],
      ['spinY', 3.4, t => { stage('j2'); P(X, S.mix(calm(t), S.spinY(t, .6))); if (t > .5 && t < .85) S.FX.impact(S.geo(X, FL, U, {}), { k: seg(t, .5, .85), at: [1.9, -3.2], r: 1.3 }); cap('spinY', 'spun round its own axis, in 3D (the yaw option)'); }],
      ['bonk', 3.0, t => {
        stage('k'); const G = .8, o = S.mix(calm(t), S.bonk(t, G)), hd = S.head(X, FL, U, o), down = easeIn(seg(t, .5, G)), away = easeOut(seg(t, G + .1, G + .6));
        P(X, o);
        if (t > .45 && away < 1) { const hy = t < G ? lerp(-200, hd[1], down) : t < G + .1 ? hd[1] : lerp(hd[1], -260, away), mx = X + 30;
          boilSeed('rmh'); paint(ribbon([[mx, hy - 60], [mx + 40, hy - 420]], 22, 18), { wash: '#C9965E', ink: PAL.ink, sw: 1.3 }); paint(rrPts(mx - 110, hy - 110, 220, 110, 26), { wash: '#B5794A', fill: '#8A5530', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.6 }); }
        cap('bonk', 'pow, a lump grows, KO, stars, dizzy');
      }],
      ['blast', 3.6, t => {
        stage('l'); const G = 1.2; P(X, S.mix(t < G ? pipFeel('gulp', t) : calm(t), S.blast(t, G)));
        if (t < G) { const bx = X + 190, by = FL - 52, fuse = 1 - seg(t, 0, G); boilSeed('rbm'); paint(ellPts(bx, by, 52, 52, 22), { wash: '#3E3A44', ink: PAL.ink, sw: 1.4 }); paint(ellPts(bx - 16, by - 18, 12, 8, 10), { wash: '#8A8494', ink: null }); paint(rectPts(bx - 14, by - 66, 28, 18), { wash: '#57525E', ink: PAL.ink, sw: 1 });
          const F = [[bx, by - 66], [bx + 20, by - 66 - 50 * fuse], [bx + 50, by - 66 - 70 * fuse]]; inkLine(F, 3, '#8C6A40', 'ink', .6); glow(F[2][0], F[2][1], 40, '#FFB347', .9); paint(starPts(F[2][0], F[2][1], 16 + 6 * Math.sin(t * 40), .4, 6, t * 9), { wash: '#FFD45E', ink: PAL.ink, sw: .8 }); }
        cap('blast', 'boom, soot, blink-blink, cough');
      }],
      ['hangtime', 3.4, t => { stage('m', 1080); const G = .6, x = lerp(620, 1230, seg(t, 0, G)); P(t < G ? x : 1230, S.mix(t < G ? S.dash(t, { speed: 1.3 }) : calm(t), S.hangtime(t, G, { wave: true }))); cap('hangtime', 'off the edge: look down, look at us, gulp, drop'); }],
      ['sneeze', 3.0, t => {
        stage('n'); const fx = X + 330, G = .5; boilSeed('rfl'); inkLine([[fx, FL], [fx - 10, FL - 150], [fx - 30, FL - 260]], 4, '#5E8C3E', 'ink', .5);
        for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; paint(ellPts(fx - 30 + Math.cos(a) * 30, FL - 260 + Math.sin(a) * 30, 22, 13, 10, 0, a), { wash: '#F3D35E', ink: PAL.ink, sw: .9 }); }
        paint(ellPts(fx - 30, FL - 260, 18, 18, 12), { wash: '#C98A3A', ink: PAL.ink, sw: .9 });
        for (let i = 0; i < 6; i++) { const k = frac(t * .8 + i / 6); if (t < G + 1.3) paint(ellPts(lerp(fx - 40, X + 30, k), FL - 260 + 40 * Math.sin(k * 6 + i) + 30 * k, 4, 4, 6), { wash: '#F3D35E', ink: null }); }
        P(X, S.mix(calm(t), S.sneeze(t, G))); cap('sneeze', 'ah… ah… ah… CHOO');
      }],
      ['dripping + shakeDry', 3.8, t => {
        stage('o'); const W0 = .55; P(X, S.mix(t < W0 ? pipFeel('calm', t) : pipFeel('deadpan', t), S.dripping(t, W0, 2.6), S.shakeDry(t, 2.55)));
        if (t < W0 + .1) { const k = easeIn(seg(t, .15, W0)); boilSeed('rwa'); paint(ellPts(X, lerp(-120, FL - 4 * U, k), 140 - 40 * k, 90 + 60 * k, 20, 8), { wash: '#8EC3E6', washOp: 220, ink: '#4F8FC0', sw: 1.2 }); }
        cap('dripping, shakeDry', 'soaked, then the dog shake');
      }],
      ['slip', 3.3, t => {
        stage('p'); const G = .9, x = lerp(700, 1000, ease(seg(t, 0, G))), px = 1050 + 900 * easeOut(seg(t, G, G + .6)), pr = 6 * seg(t, G, G + .6);
        P(t < G ? x : 1000, S.mix(t < G ? { ...calm(t), walk: t * 2.6 } : calm(t), S.slip(t, G)));
        if (px < W + 100) { boilSeed('rbp'); push(); translate(px, FL - 8); rotate(pr); for (const s of [-1, 1]) paint(ribbon([[0, 0], [s * 40, -10], [s * 70, 6]], 26, 10), { wash: '#F2D04A', ink: PAL.ink, sw: 1.1 }); paint(ellPts(0, -6, 26, 16, 12), { wash: '#F2D04A', ink: PAL.ink, sw: 1.1 }); pop(); }
        cap('slip', 'banana peel: feet up, crash, stars');
      }],
      ['faint', 3.6, t => { stage('q'); P(X, S.mix(pipFeel('worried', t), S.faint(t, .4, { lie: .9 }))); cap('faint', 'a hand to the brow, then timber'); }],
      ['knockback', 3.0, t => {
        stage('r'); const G = .7, out = t < G ? easeIn(seg(t, .45, G)) : 1 - ease(seg(t, G + .2, G + .8)), gx = lerp(-40, X - 2.2 * U - 70, out);
        boilSeed('rgs'); const zz = []; for (let i = 0; i <= 10; i++) zz.push([lerp(-60, gx - 60, i / 10), FL - 170 + (i % 2 ? -26 : 26)]); inkLine(zz, 4, '#8A8494', 'ink', 0);
        paint(ellPts(gx, FL - 170, 70, 60, 18), { wash: '#D2463C', fill: '#A8302A', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.5 });
        P(X, S.mix(calm(t), S.knockback(t, G, { dist: 8, h: 3.5 }))); cap('knockback', 'launched, spinning, lands, bounces');
      }],
      ['teeter', 2.8, t => { stage('s', 1080); P(1040, S.mix(calm(t), S.teeter(t, .2, 2.6))); cap('teeter', 'arms windmilling on the edge'); }],
      ['sneak', 3.4, t => { stage('t'); P(620, S.mix(calm(t), S.sneak(t, .3, 3.1, { dist: 11, steps: 4 }))); cap('sneak', 'tip… toe… tip… toe'); }],
      ['dash', 2.0, t => { stage('u'); P(lerp(-180, W + 180, seg(t, .1, 1.9)), S.dash(t, { speed: 1.6 })); cap('dash', 'a flat-out run (move x yourself)'); }],
      ['fightCloud', 2.6, t => { stage('v'); S.fightCloud(X, 640, 250, t, seg(t, .1, .4), 'fc', { col: '#7FA3CC' }); cap('fightCloud', 'TOON.fightCloud(x, y, r, t, k, key, {col})'); }],
      ['tints', 3.0, t => {
        stage('w'); Object.keys(S.TINT).forEach((n, i) => { const x = 330 + i * 210; S.pip(x, FL, 30, { ...pipFeel(n === 'soot' ? 'blank' : n === 'red' ? 'furious' : n === 'pale' ? 'scream' : n === 'sick' ? 'blech' : n === 'frozen' ? 'eek' : n === 'wet' ? 'deadpan' : 'shock', t, { seed: i }), tint: n, key: 'tn' + i }); label(n, x, FL + 40, 20); });
        cap('tints', "tint: 'soot' | 'wet' | 'blond' | 'red' | 'pale' | 'sick' | 'frozen', tintK");
      }]
    ];
    // Every gag frozen at its peak, on one page (the reel shows them moving).
    //   node render.mjs --page=pip.html --loop=pipGags --sheet=.5 --cols=1 --w=1920 --out=docs/pip_toon_gags.jpg
    const PEAKS = [['headShake', .2, t => S.headShake(t, 0)], ['zip (rev)', -.25, t => S.zip(t, 0)], ['zip (gone)', .4, t => S.zip(t, 0, { dist: 5 })],
      ['skid', .18, t => S.skid(t, 0, { dir: -1 })], ['shiver', .5, t => S.shiver(t, 0, 2)], ['gulp', .5, t => S.gulp(t, 0)], ['yaw 1.1 (¾)', 0, () => ({ yaw: 1.1, armF: [.3, 2.2], armB: [.3, 2.2] })],
      ['wildTake', .25, t => S.wildTake(t, 0, { amt: .8 })], ['doubleTake', 1.5, t => S.doubleTake(t, 0, { amt: .8 })], ['flatten', .5, t => S.flatten(t, 0)],
      ['wallSplat', .3, t => S.wallSplat(t, 0)], ['spinOut', .35, t => S.spinOut(t, 0)], ['spinY', .55, t => S.spinY(t, 0)],
      ['yaw π (back)', 0, () => ({ yaw: Math.PI, armF: [.3, 2.2], armB: [.3, 2.2] })], ['bonk', 1.1, t => S.bonk(t, 0, { bumps: 2 })],
      ['blast', 1.6, t => S.blast(t, 0)], ['hangtime', 1.0, t => S.hangtime(t, 0, { wave: true })], ['sneeze (ah)', 1.1, t => S.sneeze(t, 0)],
      ['sneeze (choo)', 1.42, t => S.sneeze(t, 0)], ['dripping', 1.0, t => S.dripping(t, 0, 3)], ['shakeDry', .32, t => S.shakeDry(t, 0)],
      ['sneak', .55, t => S.sneak(t, 0, 2, { dist: 3, steps: 2 })], ['dash', 0, t => S.dash(t + T, { speed: 1.6 })], ['teeter', .8, t => S.teeter(t, 0, 3)],
      ['slip', .3, t => S.slip(t, 0)], ['faint', 1.6, t => S.faint(t, 0)], ['knockback', .3, t => S.knockback(t, 0, { dist: 2.5, h: 1.6 })]];
    LOOPS.pipGags = t => {
      boilSeed('gsbg'); paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#F2E6D0', ink: null });
      const cols = 7, cw = W / cols, ch = H / 4;
      PEAKS.forEach(([name, at, gag], i) => {
        const cx = cw * (i % cols) + cw / 2, gy = ch * Math.floor(i / cols) + ch - 58;
        inkLine([[cx - cw * .42, gy + 2], [cx + cw * .42, gy + 3]], .8, '#B49A74', 'inkfine', 0);
        S.pip(cx, gy, 19, { ...pipFeel('calm', t, { seed: i }), ...S.mix({}, gag(at)), key: 'g' + i });
        label(name, cx, gy + 30, 18);
      });
    };
    LOOPS.pipGags.len = 2;

    const REEL_AT = {}; let acc = 0; for (const [n, len] of REEL) { REEL_AT[n] = acc; acc += len; }
    window.REEL_AT = REEL_AT;
    LOOPS.pipReel = t => {
      let i = 0; while (i + 1 < REEL.length && t >= REEL_AT[REEL[i + 1][0]]) i++;
      const lt = t - REEL_AT[REEL[i][0]];
      REEL[i][2](lt);
      flash(1 - seg(lt, 0, .18), PAL.cream);
    };
    LOOPS.pipReel.len = acc;
  }
})();

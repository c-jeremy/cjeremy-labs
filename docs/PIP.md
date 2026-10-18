# Pip

Pip is a small plum sprout with a leaf on a stalk. It is drawn in `src/pip.js`. Pip works in any scene.

## Loading

`pip.js` is not self-contained. It uses globals from `src/core.js` (`paint`, `inkLine`, `ellPts`, `ribbon`, `starPts`, `rrPts`, `through`, `boilSeed`, `clamp`, `lerp`, `jit`, `wob`, `frac`, `seg`, `PAL`, `TAU`, and the clock `T`) and p5's `push/pop/translate/rotate/scale`. Load it after core.js and before your scene:

```html
<script src="src/core.js"></script> … <script src="src/pip.js"></script> <script src="src/scenes/yours.js"></script>
```

For slapstick, also load `src/pip_toon.js` right after `pip.js` (see "The slapstick kit" below).

## Drawing

```js
pip(x, y, u, opts)
```

- **`x, y`**: the ground point between Pip's feet.
- **`u`**: Pip's size unit. The body is 3.6u wide and 5u tall, the leaf adds about 1.5u, and an emote adds about 2u above that. About 24 reads well in a crowd and 60–85 works for a close-up.

## The easy way: moods

`pipFeel(name, t)` returns a full, animated set of options: face, natural blinks, body motion, arms, leaf and emote. Spread it, then add or override anything:

```js
pip(800, 900, 30, { ...pipFeel('laugh', t), flip: true, key: 'pipA' });
pip(1100, 900, 30, { ...pipFeel('sad', t, { seed: 2 }), key: 'pipB' });   // seed: so two Pips don't blink in sync
```

`PIP_FEELS` lists them all:

| Group | Moods |
| --- | --- |
| Positive | `calm` `happy` `laugh` `excited` `wave` `love` `wink` `smug` `shy` `sing` |
| Thinking | `idea` `wow` `confused` |
| Negative | `worried` `sad` `cry` `angry` `strain` `sleepy` `dizzy` |

`worried` covers more than worry. Its sweat drop and wobbly mouth also work when Pip is embarrassed, or is in an awkward or funny moment ("oops", "heh…"). Add `blush: 1` to lean it toward embarrassed.

To see them all moving, look at `docs/img/pip_reactions.png`.

Slapstick moods - (`PIP_TOON_FEELS`, Tom-and-Jerry size; `pages/pip.html?loop=pipToon`, `docs/img/pip_toon_moods.png`):

**IMPORTANT** - *Do not over-use slapstick moods, as they are mostly really dramatic, and audience would be attracted by Pip if you use them; only use them if you are intending so*.

| Mood | Use it for |
| --- | --- |
| `shock` | the held "AAH!" after a take: popped eyes, jaw dropped, arms up |
| `scream` | hands on cheeks, sweat flying |
| `ouch` | hopping, shaking a hurt hand, squeezed eyes, yelling |
| `ko` | X eyes, tongue lolling, stars circling |
| `deadpan` / `blank` | the flat look at the camera after a disaster (`blank` blinks twice; use it in a sooty face) |
| `gulp` / `eek` | "uh-oh": a gulp every couple of seconds / the sheepish toothy grin |
| `scheme` | up to no good: an evil grin, rubbing its hands |
| `blech` | a bad taste or smell: tongue out, leaning away |
| `puff` / `munch` | cheeks full: holding its breath / chewing |
| `bliss` | ahh: eyes shut, swaying |
| `panic` | running on the spot, screaming |
| `furious` | fist shaking, steam out of its head |
| `guffaw` | rocking with laughter, tears |
| `mortified` | a little rain cloud of its own, blushing, looking at its feet |

They work everywhere a mood does, including `MK.act()` keys.

## Options (manual control)

| Option | What it does |
| --- | --- |
| `face` | `calm` `happy` `idea` `strain` `wow` `star` `laugh` `love` `wink` `smug` `shy` `sad` `worried` `angry` `sleepy` `dizzy` |
| `blink` | 0..1 eyelid close |
| `lookX`, `lookY` | Pupils, -1..1 |
| `armF`, `armB` | Front and back arm. Use `[angle, len]` (angle in radians, + is up, len in u), or `{at: [x, y]}` in u units in local unflipped space (e.g. `{at: [1, -1.3]}` puts a hand on the belly), or `{to: [x, y]}` in local px. Each arm reaches at most 3.6u. |
| `armsFront` | Draw arms over the body (hugging, hands on belly or chin) |
| `dy`, `sq`, `rot` | Hop (negative is up, in u), squash (+ is wider and shorter), lean in radians |
| `flip`, `turn` | Face left; how far the face slides toward its heading (0..1, default .4) |
| `walk`, `kick` | Foot cycle phases |
| `leaf` | Leaf angle offset. + tips forward, − tips back. Droop it to about ±1.2 for sadness. |
| `blush` | 0..1. Defaults to 1 for `shy` and `love`, .5 otherwise. |
| `tear` | 0..1, tears running down the cheeks |
| `emote`, `emoteK` | Painted mark above the head: `sweat` `anger` `heart` `zzz` `sparkle` `question` `exclaim` `note`, and for slapstick `stars` (circling the head), `dots` (an awkward …), `scribble` (a furious tangle), `gloom` (a little rain cloud), `steam` (out of the top of the head), `panic` (sweat flying everywhere), `bulb` (the idea, lit). `emoteK` (0..1) scales it for a pop-in, e.g. `backOut(seg(t, t0, t0 + .3))`. |
| `stepH` | Scales how high the feet lift in a walk (tiptoe sneaks use about 3) |
| `yaw` | Turns Pip about its upright axis, in 3D (radians; 0 faces us, π shows its back). The outline stays (Pip is round), while the face, belly and blush slide round the body and vanish at the back, the arms swing round (the near one over the body), and the leaf turns edge-on. `TOON.spinY` spins it; a small `yaw` (±.5) is a head turn to look at something. `over` extras don't turn. |
| `weight` | Ink-thickness multiplier. Use about 1.7 for icons and thumbnails. |
| `noShadow` | Skip the ground shadow |
| `key` | **Unique per Pip on screen**, so each one's line boil is stable |

`pipEmote(kind, x, y, u, dir, key)` draws an emote on its own, anywhere.

## Slapstick faces and face parts

`face` also takes the slapstick faces in `PIP_FACES`: `shock` `scream` `ouch` `ko` `deadpan` `blank` `gulp` `eek` `scheme` `blech` `puff` `ah` (a sneeze coming) `bliss`. Each is a base face plus parts, so anything you set yourself wins. See them all up close in `pages/pip.html?loop=pipFaces` or `docs/img/pip_toon_faces.png`.

Parts mix one face's eyes with another's mouth, or swap in a slapstick one:

| Part | Values |
| --- | --- |
| `eyes` | any face's eyes (`'wow'`, `'sleepy'`, `'happy'`…), or `'x'` (knocked out), `'dot'` (beady), `'closed'`. A pair is `[back, front]`, e.g. `['dot', 'wow']`. Lids and brows come with the eyes. |
| `mouth` | any face's mouth, or `'jaw'` (agape), `'scream'`, `'teeth'` (a clenched toothy grin), `'evil'`, `'tongue'` (blech), `'ko'` (slack, tongue lolling), `'flat'`, `'pursed'` |
| `lid` | `[close, tilt]` (0..1, and >0 lowers the outer corner); `null` for none |
| `brow` | `[inner, outer]` lift in u; `null` for none |

And dials, to animate a take smoothly instead of switching faces:

| Dial | What it does |
| --- | --- |
| `eyeS` | eye size; the eyes grow up and apart. 1.8 pops them out of the head |
| `pupil` | pupil size: .4 is a pinprick (fright), 1.6 is pleading (with a second glint) |
| `browY` | extra brow lift in u; .5+ sends them off the top of the head |
| `jaw` | how far a `jaw` or `scream` mouth opens: 1 is agape, 2+ drops it to the floor. For `teeth` it opens a gap (chattering) |
| `tongue` | 0..1, how far a `tongue` or `ko` tongue hangs out |
| `cheeks` | 0..1, puffed cheeks bulging past the outline |

```js
pip(x, y, 32, { face: 'shock', eyeS: 1 + .8 * pop, jaw: 2 * pop, key: 'p' });   // pop: 0..1, from your timing
pip(x, y, 32, { face: 'happy', eyes: 'x', key: 'p' });                          // a dazed grin
```

## The slapstick kit: `src/pip_toon.js` (`TOON`)

Tom-and-Jerry gags as pure functions of time. Add `"src/pip_toon.js"` to the manifest's `cast` after `src/pip.js`. A gag returns a pose delta: nothing before it starts or after it ends, and in between it moves Pip (`dx`, `dy`, `sq`, `rot`), works the face dials and adds effects. Mix gags over a mood and draw with `TOON.pip`, which also draws the effects, the tint and any bump:

```js
let o = MK.act(t, [[0, 'calm'], [L(3), 'happy']]);
o = TOON.mix(o, TOON.wildTake(t, L(3, 1.2)), TOON.jelly(t, L(3, 3.0)));
TOON.pip(x, y, 32, { ...o, key: 'p' });
const h = TOON.hand(x, y, 32, o);                    // props go at the hand (dx included)
```

`TOON.mix(base, ...deltas)` adds `dx`, `dy`, `sq` and `rot` (dx is in u, like dy), joins `fx` lists and `over` hooks, and lets later deltas win everything else. Each gag blinks on its last frame, so the cut back to the mood underneath is hidden. `TOON.dur(name, opts)` gives a gag's length, for chaining. `dir` is a world direction (1 = right); gags that travel set `flip` themselves. Watch them all at `pages/pip.html?loop=pipReel`; the peaks are in `docs/img/pip_toon_gags.png`.

| Gag | What happens |
| --- | --- |
| `wildTake(t, t0, {amt, hang})` | a squint and crouch, then up in the air stretched thin, eyes popped, jaw on the floor, brows off its head; hangs, drops, squash-lands |
| `doubleTake(t, t0, {look})` | a glance, back to smiling, then it lands: a head whip and a wild take at t0 + 1.15 |
| `headShake(t, t0, {len})` | shaking it off, eyes squeezed |
| `shiver(t, t0, t1, {amt, face})` | buzzing every frame, teeth chattering, knees knocking (`face: null` keeps the mood's) |
| `gulp(t, t0)` | eyes widen, a lump goes down |
| `zip(t, t0, {dir, dist, rev})` | revs on the spot (legs a blur) before t0, then gone, leaving its outline and a puff (`gone: true` after) |
| `skid(t, t0, {dir, from, brake})` | in at full tilt (not drawn before it arrives), braking from t0: leaning back, dust, skid marks, a forward pitch at the stop |
| `flatten(t, t0, {hold})` | pancaked, a blank stare, two blinks, then a boing back up |
| `wallSplat(t, t0, {dir, stick, lie})` | mashed thin against a wall, peels off, topples back, sees stars, gets up dizzy |
| `spinOut(t, t0, {dir, turns, len})` | spun like a top in the air, then dizzy with stars |
| `spinY(t, t0, {dir, turns, len})` | spun round its own upright axis, in 3D (`yaw`): a wind-up the other way, the face sweeping round, the back going past, arms flung out, the face a smear while it's fast; then swaying, dizzy, stars |
| `bonk(t, t0, {bumps, len})` | a pow on the head, squashed, a lump swells (`bumps: 2` stacks two), KO, stars, dizzy. Keep the lump with `bump: 1` |
| `blast(t, t0, {len})` | boom, smoke, a soot-black Pip, blink-blink, a cough of smoke, the soot flakes off |
| `hangtime(t, t0, {fall, drop, wave})` | ran off an edge: legs wind down, it looks down, looks at us, gulps (waves), drops, leaving its outline |
| `sneeze(t, t0, {dir})` | ah… ah… ah… CHOO, thrown back by its own spray |
| `dripping(t, t0, t1)`, `shakeDry(t, t0, {len})` | soaked (`wet` tint, drips, a puddle), then the dog shake |
| `slip(t, t0, {dir, lie})` | banana peel: feet up, flat in the air, crash, stars, up again |
| `faint(t, t0, {dir, lie})` | a hand to the brow, eyes rolling up, a stiff topple, out cold, up woozy |
| `knockback(t, t0, {dir, dist, h, spin})` | launched spinning on an arc, lands, bounces, stars (stays dist u away) |
| `sneak(t, t0, t1, {dir, dist, steps})` | tiptoe: long high steps, paws up, an evil grin, glancing back (holds dx after t1) |
| `dash(t, {dir, speed})` | a flat-out run pose: speed lines, dust, a wheel of legs above speed 1.3 (move x yourself) |
| `teeter(t, t0, t1, {dir})` | rocking on an edge, arms windmilling |
| `jelly(t, t0, amt)` | a jelly wobble after any impact |

Extra options `TOON.pip` reads: `dx`, `fx`, `tint` + `tintK`, `leafOff` (hides the leaf), `bump` (1, 2… stacked lumps), `lump` (0..1, a gulp going down), `trail` (`[[dx, dy, rot], …]` smear ghosts) and `gone` (draw the effects only). Unlike plain `pip()`, `TOON.pip` turns the emote with the body and drops it with a squash, so a sweat drop stays on Pip's head while it topples.

- **Effects** (`fx: [{kind, k, …}]`, drawn around Pip; `at` is `'head'`, `'mouth'`, `'mid'`, `'feet'` or `[x, y]` in u from the scene's point): `shock` lines, `speed` lines, `dust`, `skid` marks, `ghost` (the outline left behind), `puff`, `sweat` drops, `tremble` marks, `smoke`, `boom`, `puddle`, `drips`, `spray`, `impact` (a pow star), `wheel` (legs a blur), `arcs`, `blur` (a face smeared by a fast turn), `swirl`, `fountain` (tears gushing), `flakes`. `TOON.FX[kind](TOON.geo(x, y, u, o), spec)` draws one on its own.
- **Tints** (`TOON.TINT`): `soot`, `wet`, `blond` (the leaf), `red`, `pale`, `sick`, `frozen`, or your own `{pip, pipDk, belly, leaf, leafDk, mouth}`. `TOON.tinted(tint, k, fn)` tints anything drawn in `fn`.
- **Helpers:** `TOON.hand / head / mouth (x, y, u, o)` world points; `TOON.pivot(rot, cx, cy)` turns Pip about a body point instead of its feet (tumbles; lying flat is `cy = -1.8`); `TOON.hitStop(t, [impacts], len)` freeze-frames an action clock on impacts; `TOON.leaf(x, y, u, ang, key)` the leaf as a prop; `TOON.fightCloud(x, y, r, t, k, key, {col})` the cartoon fight cloud with limbs poking out.

## Rules of thumb

- Keep `rot` small (under about .15) with plain `pip()`: its emotes ignore rotation. `TOON.pip` turns them with the body, so its gags can tumble Pip right over.
- Use the `{at: …}` form for poses that touch Pip's own body, and `[angle, len]` for reaching and waving.
- For a change of mood, cut on a blink, with a small take: `sq` plus `dy` for about 0.1 s.
- No text in videos. The emotes are painted, so use them instead of labels.

## Extras in `src/pip_sheets.js` (loaded by `pages/pip.html`)

- **`LOOPS.pip`**: the reaction sheet. **`LOOPS.pipToon`**: the slapstick moods. **`LOOPS.pipFaces`**: the slapstick faces and parts, up close. **`LOOPS.pipGags`**: every gag at its peak. **`LOOPS.pipReel`**: every gag playing, one after another, each with a cause (about 70 s; `pages/pipreel.html` is the same reel as a page `tools/phone_render.mjs pipreel` can render).
- **`LOOPS.pipAvatar`**: the channel avatar, Pip skipping with a DNA double-helix rope.
- **`pipHelix(P, r, phase, turnsPer100px, {bw, rw, sw, c0, c1, rung})`**: a two-strand DNA helix along any path, with depth-sorted backbones and colour-paired rungs. Use it in any biology scene.

Render commands:

```sh
node tools/render.mjs --page=pages/pip.html --loop=pip --stills=1.1 --out=out/pip/st
node tools/render.mjs --page=pages/pip.html --loop=pipToon --stills=1.1 --out=out/pip/st      # → docs/img/pip_toon_moods.png (pipFaces .5 → _faces, pipGags .5 → _gags)
node tools/render.mjs --page=pages/pip.html --loop=pipReel --strip=0.8:2.2 --out=out/pip/take.jpg   # a gag frame by frame
node tools/render.mjs --page=pages/pip.html --loop=pipAvatar --stills=0 --out=out/pip/st   # then crop the centre 1080×1080 (x=420)
```

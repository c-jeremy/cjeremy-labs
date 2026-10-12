# Pip

Pip is a small plum sprout with a leaf on a stalk. It is drawn in `src/pip.js`. Pip works in any scene.

## Loading

`pip.js` is not self-contained. It uses globals from `src/core.js` (`paint`, `inkLine`, `ellPts`, `ribbon`, `starPts`, `rrPts`, `through`, `boilSeed`, `clamp`, `lerp`, `jit`, `wob`, `frac`, `seg`, `PAL`, `TAU`, and the clock `T`) and p5's `push/pop/translate/rotate/scale`. Load it after core.js and before your scene:

```html
<script src="src/core.js"></script> … <script src="src/pip.js"></script> <script src="src/scenes/yours.js"></script>
```

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

`worried` covers more than worry. Its sweat drop and wobbly mouth also work when Pip is embarrassed, has just done something wrong, or is in an awkward or funny moment ("oops", "heh…"). Add `blush: 1` to lean it toward embarrassed.

To see them all moving, open `pip.html?loop=pip`, or look at `docs/pip_reactions.png`.

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
| `emote`, `emoteK` | Painted mark above the head: `sweat` `anger` `heart` `zzz` `sparkle` `question` `exclaim` `note`. `emoteK` (0..1) scales it for a pop-in, e.g. `backOut(seg(t, t0, t0 + .3))`. |
| `weight` | Ink-thickness multiplier. Use about 1.7 for icons and thumbnails. |
| `noShadow` | Skip the ground shadow |
| `key` | **Unique per Pip on screen**, so each one's line boil is stable |

`pipEmote(kind, x, y, u, dir, key)` draws an emote on its own, anywhere.

## Rules of thumb

- Keep `rot` small (under about .15). Emotes and `{at}` arms ignore rotation.
- Use the `{at: …}` form for poses that touch Pip's own body, and `[angle, len]` for reaching and waving.
- For a change of mood, cut on a blink, with a small take: `sq` plus `dy` for about 0.1 s.
- No text in videos. The emotes are painted, so use them instead of labels.

## Extras in `src/pip_sheets.js` (loaded by `pip.html`)

- **`LOOPS.pip`**: the reaction sheet.
- **`LOOPS.pipAvatar`**: the channel avatar, Pip skipping with a DNA double-helix rope.
- **`pipHelix(P, r, phase, turnsPer100px, {bw, rw, sw, c0, c1, rung})`**: a two-strand DNA helix along any path, with depth-sorted backbones and colour-paired rungs. Use it in any biology scene.

Render commands:

```sh
node render.mjs --page=pip.html --loop=pip --stills=1.1 --out=out/pip/st
node render.mjs --page=pip.html --loop=pipAvatar --stills=0 --out=out/pip/st   # then crop the centre 1080×1080 (x=420)
```

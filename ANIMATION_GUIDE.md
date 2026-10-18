# Animating Pip

**Read [STUDIO.md](STUDIO.md) first.** It says what this studio makes (narrated Mandarin science films hosted by Pip), which files a film needs and the order to make them in. This guide covers the craft.

This covers how to make a hand-painted cartoon starring Pip (see `src/pip.js`), or any character you design: the rules and animation principles that make it look good, the workflow that catches mistakes, and the full reference for the character and the engine.

The person prompting you decides **what** the video is about. This guide decides **how** it's made. If they ask for something the rules below forbid (a caption, a 3D spin), do what they ask.

**No design here is final.** Pip, the emotions, the props and the helpers are a starting point, not a limit. Change any of them, Pip's own design included, and add whatever new characters, props or emotions the idea needs. Paint new things with the same tools and rules, so they belong with the rest.

Look at the model sheet first: [docs/pip_reactions.png](docs/pip_reactions.png) shows Pip's 20 moods, [docs/pip_toon_moods.png](docs/pip_toon_moods.png) the 17 slapstick ones and [docs/pip_toon_gags.png](docs/pip_toon_gags.png) the slapstick gags (watch them move at `pip.html?loop=pipReel`). [pip_readme.md](pip_readme.md) has all of Pip's options.

Read [docs/STYLE.md](docs/STYLE.md) too: the series' look, colour codes, how molecules and cells are drawn, and how mechanisms are staged. Take the style from that sheet, **not from old scene code**: past scenes are long and specific to their stories. Open a scene file (`src/scenes/mrna_kit.js`, `pcr.js`, …) only when you badly need one technique the sheet doesn't cover, and read just that function.

---

## The three goals

Every rule below serves one of three goals.

- **Handmade.** The video should look like someone painted it by hand, frame by frame. That means brush strokes, ink lines that boil, flat 2D and *no lettering*. (see below)
- **Alive.** Something is always moving and something is always happening. Faces act instead of snapping, and characters are big enough to feel.
- **One piece.** It's ONE short film, **not a pile of clips**. Plan it before you draw it, and link every scene to the next.

Underneath all three, the viewer has to be able to follow it. Timing (rule 4) is the rule models get wrong most often.

## The rules

### 1. The medium is solid: brush strokes, flat 2D, boil

- **Paint everything with p5.brush through `paint()` and `inkLine()`.** Characters get flat `wash` colour plus an ink outline. Backgrounds get soft watercolour `fill` shapes, usually with no outline or a thin one. Never use plain p5 shapes (`rect`, `ellipse`, `fill()`): they look like 2000s Flash.
- **The linework boils.** `jit()` and `random()` are reseeded 12 times a second (`BOIL`), so every drawing wobbles slightly, like hand-drawn animation. That's the look; don't fight it. For anything that must stay put from frame to frame (star positions, tuft heights), use `hash(i)`. Give each separate element its own seed with `boilSeed(key)` (see Engine), or one moving thing makes everything drawn after it jitter.
- **Everything is flat 2D. Never project 3D.** (One exception, asked for by the person: Pip's `yaw`, a real turn about its upright axis for spins, `TOON.spinY`.) Don't rotate a box in perspective, don't use `rotateY` or WEBGL 3D and don't fake depth with math. Pip faces left or right with `flip`, and `turn` slides its face toward its heading: flip on a blink or a cut. Anything else that turns gets drawn key views, like a cartoon model sheet. Depth comes from overlap, scale and colour (farther = smaller, bluer, paler), never from a projection.
- **Light is the one exception.** p5.brush mixes colour like pigment, so a yellow glow painted over blue turns green, and a thin wash over it turns grey. Use `glow()` for anything that shines: it adds real light, under the paper grain.
- **Soft palette, no pure black or white.** Use `PAL.ink` for black and `PAL.cream` or `PAL.paper` for white. Keep colours soft and harmonious, and keep Pip clearly readable against the background.

### 2. No text

- **Show it, don't write it.** Models overuse text. No captions, no titles, no labels on objects, no signs, no speech bubbles with words, no words on screens, no "ZZZ" typed in a font.
- **Pip's reactions are painted marks, never letters**: `!`, `?`, zzz, sweat, a heart, sparkles, a note. Use the emotes (see the reference).
- **A sign that repeats the story is the classic failure.** If Pip holds a sign saying "I'm lost", the shot has failed. Show Pip being lost: looking left, then right, the map upside down, a sweat drop.
- If the prompt truly needs a word (a name, a shop sign that is the joke), use `letter()`. Paint it into the scene, keep it to one or two words and use it once.

### 3. Something happens in every scene

- **Every shot needs an event:** something changes between its first frame and its last. Pip wants something, finds something, tries, fails, reacts or gets it. "Pip stands in a meadow being cute" is not a shot.
- **One focal action at a time.** Stage it with a clear silhouette and nothing competing for attention, so it reads at a glance.
- **Cause, then reaction.** When something happens, Pip reacts to it: a take, an emotion change, a turn toward it. The reaction is often the funniest part, so give it time.
- **Pay it off.** Whatever you set up in a shot (a door, a sandwich, a strange noise) gets resolved on screen, in that shot or a later one.

### 4. Timing: model the viewer

Timing turns a set of drawings into a story. It's also where generated animation fails most often: everything moves at one brisk speed, events pile on top of each other, and moments are over before anyone understands them.

You know what happens because you wrote the code. The viewer doesn't: they see it once, at full speed, for the first time. **For every moment, ask what the viewer needs to understand and how long that will take them, and time it for that.**

- **Write the reads.** For each shot, list in order what the viewer has to understand. Each item is a *read*. Every read needs time for the eye to find it, time to understand it, and a moment to register before the next thing starts. Small, distant, fast or subtle things take longer to find and understand than big, central, obvious ones.
- **One read at a time.** Don't start a new read while the viewer is still taking in the last one. When two things happen at once, the viewer sees only one of them. Put a cause and its reaction in sequence, not on top of each other.
- **Fast actions, slow meanings.** A motion can be very quick if it's anticipated, but what it means needs held time. Anticipation tells the viewer where to look before the action, and the hold after it lets them understand it. Move quickly through what doesn't matter to the story, and spend time on what does. That contrast between quick and held is what gives a film rhythm; one constant speed, fast or slow, makes it flat and hard to follow.
- **Lead the eye.** The viewer looks at whatever moves, is bright, is big or is being looked at. Before an important read, get their eye to the right place (a character looks at it, the camera moves to it, it moves or lights up first), and give the eye time to get there.
- **Let the reads set the length.** A shot is as long as its reads need. A shot with many reads can't be short, and a shot whose reads have all landed shouldn't be padded. That includes the last shot: its final read needs time to land before the video ends.
- **Narrated films breathe.** Time the voice before the pictures, and leave pauses between lines and longer ones at section changes (numbers in docs/STYLE.md, "Let it land"). Add a recap line after dense stretches, and callbacks to earlier images. A viewer still digesting the last idea can't take in the next one.

For a worked example of timing an ending, see the end of this guide.

### 5. Alive

- **Nothing is ever still.** Every mood has its own idle motion (`pipFeel()`), cameras drift or push, particles drift and the linework boils. A frozen frame reads as a bug.
- **Faces act, they never snap.** Change moods with `MK.act()`. It cuts each change on a blink, fires a take and pops the new emote in. Never swap `face` by hand between two frames.
- **Move like a cartoon, not a machine.** Every move follows the animation principles in the next section.
- **Pip is big.** Acting, `u` is about 30–34 (Pip is 3.6u wide and 5u tall plus the leaf, so about 150–220 px on screen). In a close-up it's 60–85. A tiny Pip (u < 12) is for a wide establishing shot only, and never for the whole video.
- **Everything moves on a beat.** `PROJECT.bpm` drives every idle, bounce and dance, so the whole film shares one pulse. Put the hits on beats (`pulse()`, `beatN()`), even with no music.

### 6. Transitions always

- **Every seam gets a transition:** into the first shot, between every pair of shots and out of the last one. Never start on a hard frame, and never just stop.
- **Pick a transition that belongs to the story**, and don't default to the same one every time. Some options:
  - a brush wipe (`brushWipe`)
  - an iris or shaped iris (`iris`, `irisShape`)
  - a whip pan with a smear
  - a match cut (the same shape or motion across the cut)
  - a cut on action (cut mid-move, and finish the move in the next shot)
  - a camera move that carries through into the next shot
  - a fade or push from paper or black
- A plain cut is fine only when it's on action or a deliberate smash cut.
- **Changes inside a shot are transitions too:** moods go through `MK.act()` and turns happen on a blink. Props arrive and leave on arcs, never popping in.

### 7. One piece: a vision before any code

- **Storyboard first**, in writing, before you write any scene code (the workflow below has the format). If you're working with a person, show them the storyboard and let them react before you build.
- **One world.** Pick a palette and a setting that carries through, with a colour arc across the video (e.g. cold night → warm dawn as Pip's mood lifts).
- **One thread.** The story has a beginning, a middle and an end, and Pip's emotional arc follows it. Plan the emotion keys across the whole video, not per shot.
- **Rhyme the ending with the opening:** the same place, pose or motif, changed. It makes the film feel whole.
- **Link scenes:** motion continues across cuts, and screen direction stays consistent (if Pip travels right, keep travelling right). Props and characters carry over.

---

## Animation principles

These are the classic principles of character animation, as they apply here. Most of them fix one problem: motion written as code comes out mechanical, because code moves every part at once, on the same curve, by the same amount.

- **Anticipation.** Before a big move, make a small move the opposite way: a crouch before a jump, a wind-up before a throw, a squint before a take. It tells the viewer something is coming and where to look. `jump()` and `MK.act()` build it in.
- **Squash and stretch.** Bodies squash on impact and stretch when they move fast, keeping their volume (`sq`).
- **Slow in, slow out.** Almost nothing moves at a constant speed. Things ease out of one pose and into the next. A plain `lerp` over time looks mechanical, so run its progress through an easing (`ease`, `easeIn`, `easeOut`, `backOut`).
- **Weight.** How something starts and stops says what it weighs. Heavy things take longer to get going and to stop, and land with little bounce. Light things snap into motion, bounce and flutter to rest.
- **Arcs.** Living things move on arcs, not straight lines: thrown props, hops, arm swings, head turns (`arcPt`).
- **Overlapping action and follow-through.** Don't move every part at once. The eyes lead, the body follows, and arms, the leaf, props and tails drag behind, overshoot and settle last. Offset each part's timing a little from the one it hangs off (`spring`, `ring` and `backOut` for the settle).
- **Avoid twinning.** Code copies values, so both arms end up at the same angle, both eyes blink together and a crowd bounces in unison. Give one arm the action and the other something smaller, and offset timings, phases and `seed`s between characters.
- **Exaggeration.** Push poses, takes, squash and leans further than feels natural. In a short cartoon, subtle reads as nothing. If it looks like too much on the sheet, pull it back.
- **Strong key poses.** Each shot's storytelling poses should read as stills, with a clear silhouette and the body leaning into what it's doing, before any motion goes between them. If the key poses don't read, the motion won't fix it.
- **Show the thought.** A character notices, thinks, then acts, and the eyes move first. The viewer understands a choice when they see it being made.
- **Secondary action.** Small actions that support the main one (the leaf bobbing, an emote popping, grass stirring) add life, but they never compete with it.

---

## Workflow

### 1. Storyboard

Write `STORYBOARD.md` before any scene code:

```
Logline: one sentence. Pip wants ___, but ___, so ___.
World: setting, a small palette, light, how the colour changes across the video.
Motif: the thing that recurs and pays off.
Pip's arc: the emotion keys across the whole video.
Shots:
  A  start–end  [transition in: ___]  what's seen · the EVENT · Pip's reaction · camera
     reads:  start–end  the first thing the viewer must understand
             start–end  the next one (where is the viewer's eye when it starts?)
             ...
  B  start–end  [transition: ___]  ...
  ...
  [transition out: ___]
```

The reads are the timing sheet. Give each one a start and an end, make sure each has time to be found and understood, and make sure no two important reads overlap. If a shot's reads don't fit its length, lengthen the shot or cut a read; don't squeeze them.

Check the storyboard against the rules:
- Is there an event in every shot?
- Does every read have time to land before the next one starts?
- Is there a transition at every seam?
- Is there any text anywhere?
- Does the ending rhyme with the opening?

### 2. Build

- Start a manifest `videos/<id>.json` and run `node make.mjs <id> page` (see **Pipeline and audit** below, and STUDIO.md): it writes the page and config, so you don't copy them.
- Put your scene in `src/scenes/<id>.js`, wrapped in an IIFE, and end it with `shots([...])`. List it in the manifest's `scenes`, after `src/scenes/mrna_kit.js`.
- If the film is narrated, record the voice **before** you time the storyboard, and time the reads to the measured lines and pauses (`make.mjs <id> tts`, then `pauses`).
- Build and check one shot at a time, in order.
- Within a shot, block the key poses first and check them as stills (`--sheet` at the key times). Add the motion between them once they read.

```js
// src/scenes/<id>.js
(() => {
  const K = MK;                                      // the shared kit (src/scenes/mrna_kit.js)
  const L = (i, d = 0) => VO_STARTS[i - 1] + d;      // line i's start + d seconds: tie every time to the voice
  function park(t, lt, dur) {                        // t = video time, lt = time in this shot, dur = shot length
    K.setT(t);
    camBegin(960 + 20 * Math.sin(lt * .6), 540, 1 + .02 * lt);   // slow drift and push: the camera is never dead
    paint(rectPts(-200, -200, W + 400, H + 400), { wash: PAL.sky, ink: null });           // background
    paint(ellPts(960, 1150, 1400, 380, 40, 2), { wash: PAL.sap, ink: PAL.ink, sw: 1 });   // ground
    const mood = K.act(t, [[0, 'sleepy'], [L(1, .8), 'wow'], [L(1, 1.4), 'excited']]);   // acted changes
    const hop = jump(t, L(2), L(2, .5), 1.2);                                              // add poses that share fields
    pip(960, 860, 32, { ...mood, dy: mood.dy + hop.dy, sq: mood.sq + hop.sq, key: 'pip' });
    const at = toScreen(960, 860 - 3 * 32);          // Pip's screen position, for the iris
    camEnd();
    if (lt < .45) iris(...at, lerp(0, 1500, easeIn(lt / .45)));            // transition in
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6);                 // transition out (next shot finishes it)
  }
  shots([[0, park] /*, [L(3, -.8), nextShot], ... */]);
})();
```

### 3. Look at it: the review loop

**Audit first** (`node make.mjs <id> audit`): it lists, as text, where Pip is clipped by the frame edge, too small, or covered by a big prop, and where bare paper shows. Fix those, then spend your picture reviews on what only eyes can judge. It replaces geometry-hunting in sheets; it doesn't replace looking.

You can't see motion by reading code. Render and look at every shot, several times, at three zoom levels:

```bash
# always pass your film's page: render.mjs opens studio.html, which has no film, without it
# contact sheet: the shape of the whole piece (every shot's first, middle and last frames)
node render.mjs --page=<id>.html --sheet=0.1,0.8,1.6,2.4,3.1,3.9 --cols=6 --w=320 --out=out/<id>/check/sheet.jpg
# strip: EVERY frame of a moment (turns, takes, jumps, throws, transitions)
node render.mjs --page=<id>.html --strip=2.1:2.6 --cols=6 --w=320 --out=out/<id>/check/strip.jpg
# crop: full-resolution detail (faces, hands, contacts, glows); crop=x,y,w,h in frame pixels
node render.mjs --page=<id>.html --sheet=2.3,2.4 --crop=760,420,500,400 --w=500 --out=out/<id>/check/face.jpg
# crop-at: the same, following a WORLD point through each frame's camera (a foot or a prop on a moving shot);
# x,y in world pixels (or an expression evaluated in the page), w,h in frame pixels
node render.mjs --page=<id>.html --strip=2.1:2.6 --crop-at=960,700,500,400 --out=out/<id>/check/feet.jpg
```

Open each image and actually look at it. Check:

- **Read:** is the event of each shot clear from its sheet alone? Is Pip big enough, and does Pip separate from the background?
- **Timing.** You can't judge timing from single frames, so read it like a viewer:
  - Render the shot as a sheet at a fixed step (every 0.1–0.15 s) and read it in order.
  - At each frame ask: where is the viewer looking right now, and do they understand it yet?
  - Count the frames each read gets (24 frames = 1 s). A read that flashes by in a few frames, or shares its frames with another read, will be missed.
  - After each important moment, is there time to take it in before the next thing starts?
- **Motion:** in strips, does every move have anticipation and follow-through? Are there any pops, jumps or snaps between frames? Do the parts move at different times, or all at once? Is anything moving at a constant speed, or mirrored left and right? Are the poses pushed far enough to read?
- **Boil:** in a strip, each pair of frames that share a boil drawing should match except where something moves. Anything still that changes every frame needs its own `boilSeed()`.
- **Contacts:** do feet touch the ground? Do held things touch the arm tips? Do thrown things leave from the hand?
- **Transitions:** check the first and last 0.5 s of every shot and every seam. Does it open and close with a transition?
- **Rules:** is there any text? Is there any 3D? Is there any dead stretch where nothing is happening?
- **Colour:** any muddy glows (use `glow()`), pure black or pure white?

Fix what you find, then look again. **Budget:** at least one sheet per shot, a strip for every key motion and transition, and a crop for every face that carries the story. Contact sheets run about 0.1–1 s per frame, so this is cheap: don't skip it.

### 4. Render

```bash
node make.mjs <id> frames --workers=6                           # frames → out/<id>/frames (resumable) …
node make.mjs <id> encode                                       # … then MP4 with assets/<id>_mix.wav → out/<id>/<title>.mp4
```

A full film costs real time (the 200 s mRNA film: about 40 min on 6 workers), so render once, after the audit and the reviews.

### Pipeline and audit

One film = one manifest, `videos/<id>.json` ([videos/mrna.json](videos/mrna.json) is a complete example). [make.mjs](make.mjs) generates everything else; run `node make.mjs` for the commands.

| field | |
|---|---|
| `id`, `title`, `duration`, `bpm`, `offset` | the film; `title` names the MP4 |
| `cast`, `scenes` | scripts loaded after the engine, in order (e.g. `src/pip.js`; your kit and scene files) |
| `music` | the film's own music script; it reads `assets/<id>_vo.wav` and writes `assets/<id>_mix.wav` |
| `voice` | `model`, `voice`, `language`, `keyFile`, `notes` (director's notes for the TTS; older films use `style`, a direction prepended to every line), `lines`, `starts` (one per line, seconds) |
| `audit.ignore` | `{check, key, from, to, why}`: runs the film means to have. `check` matches by prefix, `key` by substring |

- **Generated, don't edit:** `<id>.html`, `src/config_<id>.js`, `src/scenes/<id>_vo_env.js` (gives scenes `voAt(t)`, the voice's loudness), `assets/<id>_vo.wav`. **Hand-written:** scenes and the music script. They are the film, so keep them bespoke.
- **The voice is Gemini TTS on Vertex AI, and the key is already here:** `tts_api_key.txt` (an express-mode key, the default `voice.keyFile`). `make.mjs <id> tts` and `listen` use it, so don't look for another TTS service or key. The house voice is **Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`), voice Tavi, Mandarin**: it's the default in make.mjs, so a manifest only needs `model`/`voice` to override it. Copy the rest of `voice` (`notes`, keyFile) from videos/amnesia.json: on 3.8 the direction goes in `notes` (sent as director's notes), never in a `style` prefix, which 3.8 often reads aloud. The films up to maize pin the older Gemini 3.1 Flash TTS preview with Aoede in their manifests; leave those as they are so their lines can be regenerated to match. The older films used edge-tts; that is not the setup now. Never print, paste or commit the key (it's in .gitignore).
- **Voice order:** `tts` → `listen` (optional) → `pauses` (each line's length and breaths, plus a back-to-back draft of `starts`) → set `starts` → `vo` → `music`. After regenerating a line, rerun `pauses` and `vo`, and move any scene times after it.
- **Captions:** `make.mjs <id> srt` writes `out/<id>/<title>.srt` for upload (Bilibili: 字幕 → 上传字幕). It splits the lines at their punctuation and times the chunks to the voice's real pauses. `voice.show` maps spoken spellings back to written ones for the captions only (五撇端 → 5′端). Rerun it whenever lines or `starts` change.
- **TTS notes** (Gemini on Vertex): write lines the way they should be *said* (五撇端, not 5′端; "TLR", because "Toll" gets misread). `listen` transcribes with another model and isn't deterministic: the same audio can come back differently, so treat it as a sanity check, not proof. Call the API from Node, not curl in zsh, because zsh eats `$model:generateContent`.
- **Audit:** `make.mjs <id> audit [--step=.25] [--range=a:b]`. It samples the film and prints runs: `paper` (bare paper > 0.3% of the frame), `clip-<edge>` (a character partly off-frame; fully off is an entrance and is skipped), `small` (a character under 90 px tall), `overlap` (a character's box over 25% covered by a prop's).
  - `pip()` reports its box itself. Make a big prop checkable by calling `auditBox(kind, key, x0, y0, x1, y1)` (world coords) in its draw function.
  - Boxes follow the camera but not transforms your scene pushes itself.
  - When a hit is on purpose, add it to `audit.ignore` with a `why`.
- **The audit is advisory.** A hit is a question, not a verdict. If the shot reads better as it is (Pip hugging a prop, Pip inside a particle, a deliberately tiny Pip in a wide shot, an entrance through the frame edge), keep it and ignore the hit. Never restage a good shot just to silence the auditor.
  - It costs about 1.4 s a sample, but only a few lines of text to read.

---

## Engine

### Files

| file | what's in it |
|---|---|
| `src/config_<id>.js` | generated from the manifest: `PROJECT = { duration, bpm, offset, audio }` |
| `src/core.js` | canvas, palette, timing and motion helpers, `paint()`, camera, full-frame effects, `glow()`, lettering, paper, render hooks |
| `src/pip.js` | Pip: `pip()`, `pipFeel()` and its moods, faces, arms, leaf, emotes (all options in [pip_readme.md](pip_readme.md)) |
| `src/pip_toon.js` | `TOON`: Pip's slapstick kit, Tom-and-Jerry gags as pure functions of time, their effects and colour tints (see [pip_readme.md](pip_readme.md)). Add it to `cast` after `src/pip.js` |
| `src/pip_sheets.js` | Pip's reaction sheet (`pip.html?loop=pip`), the channel avatar, `pipHelix()` |
| `src/scenes/mrna_kit.js` | `MK`: the biology props, plus `act()`, `swim()` and `hand()` for Pip (index at the end of docs/STYLE.md) |
| `src/timeline.js` | `shots()`, `LOOPS`, `brushWipe()` |
| `<id>.html` | generated; open it in Chrome to scrub the film (`?t=2.5` jumps to a time, `?loop=cover` shows a loop) |
| `render.mjs` | headless renderer: sheets, strips, crops, stills, PNG loops, MP4, `--audit` |
| `make.mjs`, `videos/<id>.json` | one manifest per film → page, config, TTS, voice layout, audit, frames, MP4 (see **Pipeline and audit**) |

### Frames are pure functions of time

- **Frames render in parallel and out of order.** A shot is `fn(t, lt, dur)` and must draw the same frame for the same `t`, every time. No state carried between frames, no counters, no `Math.random()`, no physics that integrates frame by frame. Compute everything from `t`, in closed form (the helpers below do this for you).
- Randomness: `hash(i)` for stable per-object values, and `jit(a)`/`random()` for boil (they change 12 times a second).
- **Seed each element with `boilSeed(key)`.** Each boil drawing holds for two frames, so anything that isn't moving must draw the same in both. But a moving thing uses a different amount of randomness each frame, which shifts the stream for everything drawn after it, and all of that re-boils every frame and looks jittery.
  - `boilSeed(key)` restarts the stream from the boil frame and a key that stays the same every frame (any string or number, unique within the frame).
  - Call it before each separate element: each background layer, prop and effect.
  - `pip()` seeds itself from its `key`, then reseeds when it's done, so nothing drawn after it depends on its pose. Give every Pip on screen its own `key`.
- **Each shot paints the whole frame,** background included. The paper texture is under everything and the grain is multiplied over the top, so leaving paper showing is a valid look.
- **Canvas:** 1920×1080, origin top-left, y down.
- `LOOPS.name = t => {...}; LOOPS.name.len = 4;` makes a standalone loop (tests, GIFs, sheets), rendered with `--loop=name`.

### Painting

`paint(pts, o)` paints one shape from a point list `[[x, y], ...]`:

| option | meaning |
|---|---|
| `wash, washOp` | flat colour (opacity 0–255, default 255). For characters, props, anything solid. |
| `fill, fillOp, bleed, tex, border` | watercolour fill with bleeding edges and pigment texture. For skies, hills, shading and shadows. `bleed` ~.05–.3, `tex` ~.3–.9. |
| `hatch: { d, a, o, b, c, w }` | hatching (distance, angle, `{rand, gradient}`, brush e.g. `'charcoal'`/`'HB'`, colour, weight). Texture, sparingly. |
| `ink, sw, br` | outline colour (default `PAL.ink`), weight (~.4–2), brush. **`ink: null` means no outline.** |
| `curv` | 0–1: smooth the outline through the points. |

- **Lines:** `inkLine(pts, sw, colour, brush = 'ink', curvature)`. The kit's brushes are `'ink'`, `'inkfine'` and `'dry'` (bristly). p5.brush's built-ins also work: `'2B'`, `'HB'`, `'charcoal'`, `'marker'`, `'pen'`, `'cpencil'`, `'rotring'`, `'spray'`.
- **Shapes:**
  - `rectPts(x, y, w, h, jitter)`
  - `ellPts(cx, cy, rx, ry, n, jitter, rot)`
  - `rrPts(x, y, w, h, r, jitter)`: a rounded rectangle
  - `starPts(cx, cy, r, inner, n, rot)`
  - `heartPts(cx, cy, r)`
  - `through(P)`: a smooth curve through the points
  - `ribbon(P, w0, w1)`: a tapered ribbon along a path, as one outline. Use it for tails, trails, vines and noodly arms.
- **One shape, one outline.** Build a creature or prop from as few outlines as you can, so it doesn't look like glued-on stickers: a tail is one `ribbon`, not five circles.
- **Light:** `glow(x, y, r, colour, a)`. It's additive, so it stays warm on dark grounds and barely shows on light ones (as real light would). Draw it before the things that sit in front of the light.
- **Palette** `PAL`: `paper, ink, clay, clayDk, clayLt, night, indigo, rose, ochre, sap, teal, violet, cream, sky`. `mixCol(a, b, k)` mixes two hex colours in RGB. Any hex colour works: pick a small palette per video.
- **p5.brush quirks:**
  - Colours mix like pigment: yellow over blue makes green. Layer light colours over dark ones with a full-opacity `wash`, or use `glow()`.
  - `wash` at 255 is exact colour; lower opacities mix.
  - Strokes drawn far from the origin under a zoomed camera collapse: from zoom ~2, an outline or a line at large
    world coordinates leaves only a dot at its first vertex. `paint()` and `inkLine()` draw each shape around its own
    centre, which avoids it. A shape much bigger than the canvas can still lose its outline: draw long edges as
    `inkLine`s no bigger than the canvas.
  - Outline weight is in world units, so it grows with the camera's zoom: a fine outline on a small shape becomes a
    dark blob in a close-up. Scale `sw` down with the zoom for small shapes.
  - A NaN in a point list throws `Failed to construct 'OffscreenCanvas': Value is not of type 'unsigned long'`, with
    a stack pointing at your scene rather than the NaN. Guard geometry that can degenerate (`Math.acos` of a ratio > 1).
  - p5 `push()/pop()/translate()/rotate()/scale()` work with all brush calls.
  - Cost is the number of `fill` shapes and strokes: hundreds are fine, thousands are not. Aim for ≤ 1.5 s per frame. The render log prints ms/frame.
  - Some scenes make p5.brush log five `WebGL: INVALID_OPERATION ... not from the associated program` warnings once per page. They're harmless (frames come out identical). Any other page error is real.

### Time and motion (all pure functions of t)

- **Progress and keys:**
  - `seg(t, a, b)`: 0..1 progress through [a, b]
  - `kf(t, [[t0, v0], [t1, v1], ...], ease)`: keyframes; values may be arrays
  - `lerp`, `clamp`, `frac`, `wob(t, freq, phase)`, `TAU`
- **Easing:** `ease`, `easeIn`, `easeOut`, `backOut` (overshoot) and `elasticOut`.
- **Rhythm:** `BEAT` (seconds per beat), `bpOf(t)` (beat position), `beatN(t)` (beat number), and `pulse(t, k)` / `pulse2(t, k)`, which are 1 on each beat (or eighth) and then decay.
- **Acting:**
  - `jump(t, t0, t1, h)`: crouch, stretch, arc and squash-land. Returns `{dy, sq}`.
  - `take(t, t0, amt)`: a surprise take, returns `{sq, dy}`.
  - `stroll(t, t0, t1, x0, x1, u)`: an eased walk. Returns `{x, walk, view, flip, dy}`.
  - `spring(t, t0, k, w)`: a damped wobble after an event, for settles and follow-through.
  - `ring(t, [t0, t1, ...])`: one `spring` kick per event time.
  - `arcPt(p0, p1, h, k)`: a point on a thrown arc.
  - `onTwos(t)`: holds each drawing for two frames. Wrap a shot's `t` in it for a snappier, hand-drawn feel.
- **Camera:**
  - `camBegin(cx, cy, zoom, rot)` … `camEnd()`: world point (cx, cy) lands at screen centre. One level only; always pair them.
  - `toScreen(x, y)`: world → screen while a camera is active. Use it to aim an iris at a character.
  - `shakeXY(t, amount)`: [dx, dy] to add to the camera on impacts.
- **Full-frame effects** (screen space, after `camEnd()`):
  - `brushWipe(p, [c1, c2])`: fat strokes cover the frame (p 0 → .5) and then drag off (.5 → 1). Cut under full cover. Its comment in timeline.js shows the two calls.
  - `iris(cx, cy, r, colour)` and `irisShape(pts, colour)`: shaped reveals.
  - `flash(k, colour)`: a full-frame flash.
- **Lettering** (only if you must, see "No text"):
  - `letter(txt, x, y, size, colour, {pop, rot, alpha, screen})`
  - `sfx(txt, x, y, size, colour, age)`
  - Both are composited at `flushLetters()`, after the shot. If a wipe or iris must cover them, call it yourself first.

---

## Pip

Pip is a small plum sprout: an egg-shaped plum body with a pale belly, stubby arms and feet, big eyes and a leaf on a stalk. It's drawn in flat wash with an ink outline and boils like everything else. That's the default design, not a rule: change it if the idea needs it. Within one video, though, keep every character on model, with the same shape and features in every shot. [docs/pip_reactions.png](docs/pip_reactions.png) is the model sheet, and [pip_readme.md](pip_readme.md) has every option.

```js
pip(x, y, u, options)   // (x, y) = ground point between the feet; u = size unit
```

**Sizes:** the body is 3.6u wide and 5u tall; the leaf adds about 1.5u, and an emote about 2u above that.

| shot | u | on screen |
|---|---|---|
| wide | 8–16 | small in the world |
| acting | 30–34 | the usual size, at camera zoom 1–1.3 |
| inside something | 20–26 | e.g. inside a cell or a particle |
| close-up | 60–85 | face acting |

### Moods

`pipFeel(name, t)` returns a whole mood, alive: face, natural blinks, body motion, arms, leaf and emote, all moving.

| group | moods |
|---|---|
| positive | calm, happy, laugh, excited, wave, love, wink, smug, shy, sing |
| thinking | idea, wow, confused |
| negative | worried, sad, cry, angry, strain, sleepy, dizzy |
| slapstick | shock, scream, ouch, ko, deadpan, blank, gulp, eek, scheme, blech, puff, bliss, panic, furious, guffaw, munch, mortified (`PIP_TOON_FEELS`) |

```js
pip(x, y, 32, { ...pipFeel('happy', t), key: 'p' });                                   // one mood, alive
pip(x, y, 32, { ...pipFeel('sad', t, { seed: 2 }), lookX: -1, key: 'p2' });           // with overrides; seed staggers blinks
pip(x, y, 32, { ...K.act(t, [[0, 'calm'], [L(2, .6), 'wow'], [L(2, 2), 'idea']]), key: 'p' });   // acted changes
```

- **`MK.act(t, keys, seed)`** is how moods change in a shot. Each change cuts on a blink, fires a take (a squash, then a stretch that springs back) and pops the new emote in. A key's third element overrides fields for that stretch, e.g. `{ lookX: .8, take: .8 }` (`take` scales the reaction).
- **`MK.swim(x, y, u, t, options, key)`** is Pip as the host in the science films: a bob, paddling feet and a slight tilt. With `talk: true` the body pulses with the narration (`voAt(t)`). It returns the bobbed y.
- `worried` covers more than worry: its sweat drop and wobbly mouth also work for embarrassed, "oops" and awkward moments. Add `blush: 1` to lean it toward embarrassed.
- To make a new mood, add a `case` to `pipFeel()` in src/pip.js: a `face`, plus blinks, body motion, arms, leaf and emote, all as functions of `t` (slapstick ones also go in `PIP_TOON_FEELS`). Add new cases and faces only: old films render through the same code, so check a frame of an old film still renders byte-identical.

### Options

| group | options |
|---|---|
| pose | `dy` (in u; − = up), `sq` (squash; negative stretches), `rot` (lean in radians; keep it under about .15), `flip` (face left), `walk`, `kick` (foot cycle phases), `noShadow` |
| face | `face`: calm, happy, idea, strain, wow, star, laugh, love, wink, smug, shy, sad, worried, angry, sleepy, dizzy. `blink` 0..1, `lookX`/`lookY` −1..1, `blush` 0..1, `tear` 0..1 |
| turning | `turn` 0..1: how far the face slides toward its heading (default .4). Pip faces left or right with `flip`, and `turn` shows where it's heading. `yaw` (radians) is a real 3D turn about the upright axis, back included: for spins (`TOON.spinY`) and a quick look round, not for walking |
| arms | `armF` (front), `armB` (back): `[angle, len]` (radians, + is up; len in u, at most 3.6) for reaching and waving, `{at: [x, y]}` (u units, local and unflipped) for touching its own body, `{to: [x, y]}` (local px). `armsFront: true` draws them over the body (hugging, hands on belly or chin) |
| leaf | `leaf`: angle offset; + tips forward, − tips back. Droop it to about ±1.2 for sadness |
| emote | `emote` + `emoteK` (0..1 pop-in): sweat, anger, heart, zzz, sparkle, question, exclaim, note |
| other | `weight` (ink thickness; about 1.7 for icons), `key` (**unique per Pip on screen**: it keeps the boil stable) |

Options compose by spreading: `pip(x, y, u, { ...K.act(t, keys), armF: { at: [1, -1.3] }, key: 'p' })`. Later spreads win, so put the mood first and the pose after it. If both a mood and a pose move the same field (`dy`, `sq`), add them together rather than letting one silently replace the other.

### Props and contact

- **Hold a prop with an `{at}` arm,** and draw the prop at the hand: `MK.hand(x, y, u, at, { flip, dy })` returns the hand's world point. Draw it after Pip so it sits in front.
- `pipEmote(kind, x, y, u, dir, key)` draws an emote on its own, anywhere (over a prop, over a cell).
- Anything big that Pip carries or pushes is drawn separately at a point computed from the same pose. Make sure it touches: check it with a crop.
- Plain `pip()` leaves emotes upright over the standing head whatever `rot` is; `TOON.pip()` turns them with the body.

### Walking and dancing

- **Walks:** move `x` with `stroll()` or an eased `kf()`, drive `walk` from the distance covered, and set `flip` to the direction of travel.
- **Hops:** `jump(t, t0, t1, h)` returns `{dy, sq}` (h in u; about 1–1.5 suits Pip); add them to the mood's `dy` and `sq`.
- **Dancing:** lock `dy`, `sq`, `rot`, the arms and the leaf to the beat with `pulse()` and `bpOf()`. `pipFeel('excited')` and `pipFeel('sing')` are good starting points.

### Slapstick

Tom-and-Jerry gags live in `src/pip_toon.js` (`TOON`; every gag and option is in [pip_readme.md](pip_readme.md)). Each gag is a pose delta over time, laid over the mood with `TOON.mix()` and drawn with `TOON.pip()`:

```js
let o = MK.act(t, [[0, 'smug'], [L(8, 15.6), 'dizzy']]);
o = TOON.mix(o, TOON.bonk(t, L(8, 15.5)));                 // the toy swings back: pow, a lump, KO, stars
TOON.pip(x, y, 30, { ...o, key: 'p' });
```

- **Use a gag rather than hand-rolling one** with `on()`/`seg()` overrides: each one already has the anticipation, the exaggerated key pose, the hold, the settle and a blink to hide the cut back to the mood.
- **Animate the dials, not the face.** A take is `eyeS`, `jaw`, `pupil` and `browY` running through a curve, so the face grows into the take instead of swapping to it.
- **Cause first, then the gag**, and hold the aftermath (the `deadpan` look at camera, the soot, the stars) long enough to land. Each gag needs a cartoon sound in the score.
- **Gags tumble.** `TOON.pivot()` turns Pip about its middle, so spins, slips and knockbacks can turn it right over (a flat 2D rotation), and `TOON.pip` keeps the emote on its head. `TOON.spinY` spins it round its upright axis in 3D (`yaw`).

---

## Music

Every film has its own score, synthesised from scratch in `music_<id>.mjs` (see STUDIO.md):

1. `bpm` and `offset` in the manifest set the tempo and the time of the first downbeat. Every idle, dance and `pulse()` then locks to the score, so write the score at the same tempo.
2. `node make.mjs <id> music` runs the script and writes `assets/<id>_mix.wav`; `node make.mjs <id> encode` muxes it in.
3. Land hits, cuts and takes on beats (`beatN`, `pulse`). Cut on bar lines for big changes, and give each musical phrase its own visual.
4. **Lyrics are not text.** Don't put words on screen. Act the meaning of a line instead.

## Common failures

These are the things that make a Pip video look generated. Check your storyboard and sheets against them:

- signs, captions, labels or speech bubbles with words
- Pip standing still and smiling while nothing happens
- everything moving at one brisk speed, with events stacked on top of each other and no holds
- moments that are over before the viewer understands them
- a tiny Pip in a big empty landscape for the whole video
- faces that snap from one expression to another
- mechanical motion: linear moves, every part moving at once, both arms or several characters in sync
- timid poses and takes that barely read
- jittery linework: still things re-boiling every frame because something moving before them shifted the random stream (`boilSeed`)
- hard cuts everywhere, or a video that just starts and stops
- 3D rotation, perspective boxes or projected turns
- plain p5 shapes, gradients or digital glows mixed into the paint (use `paint`/`inkLine`/`glow`)
- muddy green-grey glows from painting yellow over blue
- props floating near a hand instead of touching it
- every shot a different world with nothing linking them

## Worked example: timing an ending

This shows rule 4 applied to one shot of one video. The reads, the numbers and the way it ends are specific to this story; yours will be different. Read it for the reasoning, not the numbers. It's the last shot of an old 11-second example film ("The fallen star", since removed), from the throw on, in video time:

| time | read | why it's timed this way |
|---|---|---|
| 6.95–7.1 | wind-up and throw | fast motion; it reads because the wind-up anticipates it |
| 7.1–7.9 | the star flies home | long enough for the eye to follow it from Pip to the top of the frame; the camera eases back to give it sky |
| 7.9–8.35 | it arrives: a flare, a sparkle, the sky twinkles | the payoff. Pip only watches, so nothing competes with it |
| 8.35–8.95 | Pip falls in love | the reaction starts only after the viewer has seen the cause |
| 8.95–9.4 | Pip waves goodbye | a new action, on its own |
| 9.4–9.8 | the star twinkles back | the answer to the wave |
| 9.8–11.0 | iris to Pip, hold, shut | the last read gets time to land before the video ends |

The first version packed all of this into about 1.3 s, and nobody could tell what had happened.

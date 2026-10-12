# Style cheat-sheet: the science films

How the explainer films (PCR, mRNA) look, move and sound, so a new one belongs to the same series without
copying any of them. It covers style, not story. Each snippet shows an idea; it isn't an API to paste. The real helpers
live in `src/scenes/mrna_kit.js` (`MK`) and `src/scenes/pcr.js`. **Calibration** and the **kit API index** at the end give
you the numbers and signatures, so you shouldn't need to open those files. Open them only for a technique this sheet doesn't cover.

## The look in one breath

Hand-painted textbook: real biology, simplified until it can be read at a glance, painted in soft watercolour with
boiling ink. The science is right, the shapes are friendly, and the only faces belong to the host and to cells.

## World and colour

- **One world per film, with a colour arc** that follows the story. mRNA went: warm peach cytoplasm → pale blueprint
  teal (design) → cold extracellular blue (danger) → acid pink (endosome) → lymph green-gold → back to the opening peach.
  A colour shift tells the viewer "we moved" before anything else does.
- **The background recipe:** a flat wash, a few big soft blobs drifting slowly, small motes, and a *quiet context layer*
  at low contrast (microtubules, a mitochondrion, ER, free ribosomes). Context says where we are and never competes.
- **Cover the whole camera.** Wide or panning shots need the wash to reach past the frame (paper strips are the classic
  slip; `make.mjs <id> audit` catches them).

```js
K.wash(C.cyto, t, { key: 'a', blob: '#FBEBDD' });                       // ground + drifting blobs
K.cytoplasm(t, { key: 'a', mito: [1350, 1000], er: [1350, 170] });      // quiet context, low contrast
K.motes(t, 22, mixCol(C.cytoDk, C.cyto, .3), { key: 'a' });              // life in the medium
```

## Molecules: the real architecture, simplified

- **Draw the actual parts**, and few of them: spike = S1 head (3 lobes + RBDs on top) on an S2 stalk with a membrane
  anchor; IgG = two heavy chains forming Fc and the Fab arms, plus light chains outside, paratopes at the tips; ribosome = small subunit
  under the message and large subunit over it, with the chain leaving from the large one; lipid = head + two tails; bilayer = two rows of
  heads, tails meeting in the middle; LNP = shell (phospholipid + cholesterol + PEG brush) around a core of ionizable
  lipid paired with mRNA.
- **No faces on molecules.** They act through motion, colour and posture: the TLR leans in, turns red and pulses; the
  ribonuclease chomps; the ribosome ratchets. Cells and Pip are the only characters with faces.
- **Mechanism shows as state changes on the drawing:** pegs recolour (U → m1Ψ, a dot for the methyl), charges pop
  (`+`/`−` in little discs), pins appear (the two prolines on the S2 hinge), membranes melt and tear.
- **Keep the colour code fixed for the whole film** and reuse it across films where it fits:

| thing | colour idea |
|---|---|
| bases A / U / G / C | ochre / teal / sap green / rose; UTR pegs paler |
| modified base (m1Ψ) | gold, plus an ink dot |
| 5′ cap | brick red, a little cap on the strand's head |
| spike | coral S1, darker S2 |
| antibody, BCR, TCR | blues |
| lipids | phospholipid blue, ionizable rose, cholesterol yellow, PEG green |
| cells | DC orange, Th sky blue, B mint, CTL red; memory cells = paler + a glow |

- **Strands read left → right, 5′ → 3′**, with pegs on one side. Mark ends with painted 5′/3′ only when the film is
  about direction.

```js
K.strand(K.track(points), { key: 'b', step: 26, n5: 5, nc: 43,      // UTRs paler, coding region full colour
  cap: 1, tail: tailK, mod: i => seg(t, t0 + i * .03, t0 + .35 + i * .03),   // the modification arrives as a wave
  hi: i => near(i) });                                               // highlight = bigger + lighter, not a glow
```

## Cells as characters

Round wobbly body, soft nucleus shadow, a small face (eyes, mouth, blush), and their receptors drawn on the surface,
because the receptors *are* the plot. Moods are few: calm, happy, wow, sleepy, determined. Contacts get a burst + a
sparkle, and the receiving cell squashes with `spring()`.

```js
K.cell(x, y, 90, C.th, C.thDk, t, { key: 'th', mood: docked ? 'wow' : 'calm', lx: -1, sq: .1 * spring(t, tDock, 6, 20),
  extras: () => angles.forEach(a => K.tcr(x + Math.cos(a) * 90, y + Math.sin(a) * 90, 1.3, a + Math.PI / 2)) });
```

## Showing a mechanism

- **One read at a time, and the camera visits it.** Overview → push in on the detail the line names → back out. In
  the mRNA board shot the camera went cap → tail → both ends → ribosome → codons and spike → antibody. A full-width strand at
  zoom 1 shows nothing.
- **Point first, then change.** A highlight pulse, a bracket or a guide line lands on the part *before* it changes.
- **Ticks mean something:** ✓/✗ only for a verdict, a burst for a click or contact, sparkles for "it worked",
  `glow()` only where light makes sense (on dark grounds, or a thing that matters).
- **Contrast pairs teach:** wrong first, then right (foreign RNA trips the sensor → ours slips past; an LNP bumps another
  and bounces off because of the PEG).

```js
const c = kf(t, [[22.0, [900, 500, 1.12]], [24.9, [900, 500, 1.12]], [26.0, [330, 520, 1.9]],   // overview → the 5′ end
                 [28.6, [330, 520, 1.9]], [29.5, [1540, 540, 1.7]]], ease);                    // → the 3′ tail
cam(c[0] + 6 * wob(t, .06), c[1] + 5 * wob(t, .05), c[2]);                                        // never quite still
```

## Pip on screen

- **Pip swims** (bob + paddling feet + slight tilt). Medium size (`u` 26–34), never over the subject, facing it, head
  in frame. Pip is the viewer's stand-in: it reacts *after* the thing happens.
- **Act through the whole mood range.** A key every 2–4 s, chosen by the beat, not just calm/happy:

| beat | moods that worked |
|---|---|
| noticing, explaining | `calm` + `lookX/lookY` at the subject |
| a new fact lands | `wow`, `idea` |
| doing a job | `strain`, `smug` after it works |
| danger, a problem | `worried`, `angry` (shooing), `dizzy` (a bonk) |
| delight | `laugh`, `excited`, `sing`, `love` |
| loss, ending | `sad`, `cry`, then a `wave` |

```js
let o = K.act(t, [[25.0, 'smug'], [26.4, 'strain'], [28.0, 'happy'], [29.6, 'laugh', { lookX: -.5, lookY: .7 }]]);
if (holding) o = { ...o, armF: { at: [2.7, -1.4] } };                 // props sit at K.hand(...)
K.swim(x, y, 32, t, { ...o, flip, talk: true }, 'pb');                  // talk: body pulses with voAt(t)
```

## Motion vocabulary

- **Machines ratchet:** the ribosome steps one codon per beat, eased (it reads, it doesn't glide).
- **Things assemble as a wave:** stagger each element's `seg()` by its index (lipids, pegs recolouring, peptides popping).
- **Arrivals** `backOut`; **flights** `arcPt` + `easeIn`; **contacts** a `spring()` on the receiver.
- **Before/after held long enough:** the state change is quick, the new state holds while the line explains it.

## Transitions that fit the subject

- **Iris** in/out on Pip (the film's first and last frames).
- **Match cut by scale:** push into the thing Pip holds, flash cream, open on the same thing big.
- **Brush wipe in the next world's colours.**
- **Whip pan** with pale speed lines when the topic jumps.
- **Cut on action:** the strand slides out of one shot and into the next.
- **Zoom through a surface:** needle tip → muscle, with a cream flash.

## Sound and voice

- **Narration:** one idea per line, 40–75 Chinese characters, written for a viewer who knows basic biology (name the
  molecule, skip the babysitting), with one concrete hook per section (the Nobel, the prolines). Write it the way it should be *said*.
- **Score:** synthesised, one chord section per shot (curious / tense / bright), ducked under the voice. **Stingers**
  sit on picture events with a fixed vocabulary: block = click/contact, glock = "it worked" or a reveal, kalimba run =
  a process running, slide = something moving in or out, whoosh = a transition, kick + low block = a bonk or tear.

## Avoid

- Labels and captions (only 5′/3′, +/−, ✓/✗ as painted marks).
- Faces on molecules; generic glow on light grounds (it barely shows).
- The whole strand at zoom 1 while explaining a detail.
- Pip parked over the subject or cut off at the top.
- One background for every shot; wide shots with paper showing at the edges.

## Calibration: the numbers that worked

These are starting points from the mRNA film (1920×1080, 24 fps). The feel lives in these proportions. Start here,
then adjust by looking at renders.

| thing | value |
|---|---|
| Pip, acting | `u` 30–34 at zoom 1–1.3 (about 150–220 px tall on screen); keep the leaf at least 40 px below the top edge |
| Pip, inside something | `u` 20–26 (inside an LNP), a speck (`u` < 8) only in a wide shot |
| camera | overview zoom 1.0–1.15 · a detail 1.6–1.9 · "the whole system" 0.5 · drift 4–14 px at 0.04–0.07 Hz · moves 0.6–1.2 s, eased |
| mRNA strand | `step` 24–26 px per base, backbone `w` 12–14, peg 22 × 11, outline `sw` 1.1; a held mini-strand: step 13, w 7 |
| ribosome | scale 1.5 as the hero, 0.8–0.9 on a busy strand; one codon (3 bases, 75 px) per 0.55 s |
| spike | 1.8 as the hero icon, 0.9 on a membrane, 0.45 inside ER or vesicles; virus `r` 110–120 |
| antibody | 1.25 hero, 0.8–0.85 in a swarm |
| cells | acting `r` 85–130, memory 54–70, DC scale 1.25–1.55 |
| LNP | `R` 300 hero cross-section, 230 a neighbour, 26–40 as a dot in tissue |
| ink | outlines 0.7–1.3, fine detail 0.5–0.7; ✓/✗ stroke = size / 26 |
| pop-in | 0.3–0.4 s `backOut`; emote 0.35 s |
| flights | 0.3–1.0 s on `arcPt` |
| holds | at least 1 s after a state change before the next one |
| waves across a strand | about 1.5 s end to end |
| `act()` keys | 2–4 s apart, cut on a blink |
| transitions | brush wipe 0.6 s (cut at the middle) · iris in 0.6–0.8 s, out about 1.3 s · cream flash 0.5 s |
| narration gaps | 0.7–1.2 s between lines; 1.5–2 s at a shot change (room for the transition and a breath) |
| frame cost | about 0.2–1.3 s per frame. Bilayers, LNP shells and the cytoplasm layer are the expensive parts: keep a frame under about 1 s |

## Kit API index (`MK`, in src/scenes/mrna_kit.js)

These are biology props, reusable as they are. Keys (`key`) keep each element's boil stable; give every instance its own.
To vary one for a new film, copy it into your scene and change it. Don't pile options onto the kit.

```text
C                                   palette: cyto board extra muscle lymph acid · A U G Cb psi cap pro · s1 s2 ab · riboL/S
                                    ion phos chol peg tail · nuc er golgi · dc th bc ctl (+Dk) · mhc1 mhc2 tcr virus ace gold red green
setT(t)                             call first in every shot (the strand tail and PEG wave read it)
wash(col, t, {key, blob, n, rect})  full-frame ground + drifting blobs (rect: a custom cover for wide worlds)
cytoplasm(t, {key, col, mito:[x,y]|false, er:[x,y]|false, ribos})   quiet context layer
motes(t, n, col, {key, dir})        drifting specks
track(points, n) → {C, L, at(s) → [x, y, angle], sub(s0, s1, step)}  smooth arc-length path
strand(track, {key, seed, step, w, pegLen, pegW, sw, n5, nc, cap, capS, tail, tailN, bead, mod(i), hi(i), recol(i, col),
       pro:[i..], proK, minus, crumble, back, s0, s1}) → {e5, e3, peg(i) → [x, y, angle], n, step}
cap(x, y, angle, scale, k, key)     the m7G cap on its own (in a hand, in flight)
ribosome(x, y, angle, s, t, {key, k (assembly), stall, chain: points, seed})
peptide(points, key, n)             amino-acid beads
spike(x, y, s, {key, ang, post (0..1 post-fusion), pins (2P), glowK}) → head top [x, y]
antibody(x, y, s, ang, {key, open, col, lt}) → [tipL, tipR]     paratopes point along −y before rotation
lipid(x, y, ang, s, 'phos'|'ion'|'chol'|'peg', {hl, plus, peg})  tails point along ang
bilayer(track, s, {key, from, to, gap:[s0, s1], minus, minusSide, jig(s), cols(s, side)})
lnp(cx, cy, R, t, {key, k (assembly), inside(), hiShell, hiChol, peg, melt, meltR, core})
cell(x, y, r, col, dark, t, {key, mood: calm|happy|wow|sad|angry|determined|sleepy, lx, ly, sq, seed, nucleus, extras(), behind()})
dendritic(x, y, s, t, {...cell options, arms: [[angle, len]..], reach: [..]})
mhc(x, y, s, ang, 1|2, {key, pep}) → groove top    tcr(x, y, s, ang, {key})    bcr(x, y, s, ang, {key})
virus(x, y, r, t, {key, coat (antibodies), rot, skip (a spike index)})
medal(x, y, s, t, k, key)
endMark('5'|'3', x, y, size, k, col, key)   charge('+'|'-', x, y, size, k, col, key)   glyph(ch, x, y, s, col, sw)
check(x, y, size, k, key)   cross(x, y, size, k, key)   sparkle(x, y, r, k, col)   burst(x, y, r, k, col, key)
act(t, [[t0, mood, {overrides}], ..], seed) → pip options   pipFeel moods with a take and blink on every change
swim(x, y, u, t, options, key) → bobbed y       hand(x, y, u, [ax, ay], {flip, dy}) → world point of a pip arm {at}
```

Film-specific helpers (TLR sensor, RNase, ionizable-lipid ring, nucleus, ER/Golgi, arm and syringe) live in
`src/scenes/mrna.js`. They are good references, but rebuild them to fit your own film.


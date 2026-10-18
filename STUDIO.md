# The studio

Read this first. It says what this studio makes, which files a film needs and the order to make them in. The craft
(rules, timing, the review loop, the engine, Pip) is in [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md), and the series' look is
in [docs/STYLE.md](docs/STYLE.md).

## What we make

- **Mandarin science explainer films**, one topic each, in the series **Pip讲<topic>**: Pip讲mRNA疫苗, Pip讲光遗传学,
  Pip讲减数分裂. They're uploaded to Bilibili with captions and a cover.
- **The host is Pip**, the plum sprout ([src/pip.js](src/pip.js), [pip_readme.md](pip_readme.md),
  [docs/pip_reactions.png](docs/pip_reactions.png)). Pip is the viewer's stand-in: it swims beside the subject, never
  over it, and reacts *after* each thing happens. Pip is the only host; don't cast another one.
- **Audience:** high-school biology (人教版 terms), or a step above. Name the molecule, skip the babysitting, and keep
  the science right.
- **Length:** 3–5 minutes so far (177–290 s), 13–22 narration lines, 84–96 bpm.
- **Sound:** a Mandarin narration (Gemini TTS) over a score synthesised from scratch for that film.
- **Look:** hand-painted textbook, the same series look every time (docs/STYLE.md). No text on screen; the captions
  live in the `.srt`.

The person prompting you picks the topic. If they ask for something outside this (a short, a different host, another
language), do what they ask.

## Read in this order

1. This file.
2. [docs/STYLE.md](docs/STYLE.md): the series' look, colour, molecules, cells, staging, sound and the numbers that worked.
   Required, every time.
3. [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md): the rules, timing, the review loop, the pipeline, the engine and Pip.
4. One finished film, for **format, not content**: [videos/meiosis.json](videos/meiosis.json) and
   [STORYBOARD_MEIOSIS.md](STORYBOARD_MEIOSIS.md), plus the header comment of [music_meiosis.mjs](music_meiosis.mjs).
   Don't read old scene files start to finish (STYLE.md says why); open one only for a technique you need.

Use only the engine files these docs name. Some files in `src/` aren't for these films; leave them alone.

## The files of one film

`<id>` is a short lowercase English name (`meiosis`, `opto`). Copy the shape of the meiosis files, not their content.

| file | what it is | who writes it |
|---|---|---|
| `videos/<id>.json` | the manifest: title, length, bpm, cast, scenes, music, voice lines and starts, captions, audit | you (start from a copy of videos/meiosis.json) |
| `STORYBOARD_<ID>.md` | the storyboard, organised by voice line (format below) | you |
| `src/scenes/<id>.js` | the film: one IIFE, `const K = MK`, shots, and `LOOPS.cover` for the cover | you |
| `music_<id>.mjs` | the score, synthesised from scratch | you |
| `assets/vo_<id>/lNN.wav` | one take per narration line | `make.mjs <id> tts` |
| `<id>.html`, `src/config_<id>.js`, `src/scenes/<id>_vo_env.js`, `assets/<id>_vo.wav`, `assets/<id>_bgm.wav`, `assets/<id>_mix.wav` | the page, config, voice envelope and audio | generated: never edit |

In the manifest:
- `title` is `Pip讲<中文主题>`. It names the MP4, the captions and the cover.
- `cast` is `["src/pip.js", "src/pip_toon.js"]` (Pip and its slapstick kit, `TOON`). `scenes` is `["src/scenes/mrna_kit.js", "src/scenes/<id>.js"]`, so the kit (`MK`) is
  always there.
- Copy `voice` from meiosis and change `lines`, `starts` and `show`. Keep the model, the voice (Aoede), the language and
  the style prompt unless the person asks otherwise; adjust the audience in the style prompt if it changes.

## The order of work: the script comes first

The narration is the spine of the film. Pictures are timed to the voice, not the other way round.

1. **Outline.** Agree the topic, the audience, the opening hook and 4–7 sections with the person.
2. **Write the lines** in Chinese, into `voice.lines` (STYLE.md, "Sound and voice": one idea per line, 40–75
   characters, written the way it should be *said*, one concrete hook per section). Show them to the person before
   you go on.
3. **Voice:** `node make.mjs <id> tts` → `listen` (optional) → `pauses` → set `voice.starts` (gaps from STYLE.md's
   calibration) → set `duration` (the last line's end plus time for the ending to land) → `node make.mjs <id> vo`.
   `vo` writes `src/scenes/<id>_vo_env.js` (`VO_STARTS`, `voAt`), which the page loads: run it before you build.
4. **Storyboard** `STORYBOARD_<ID>.md`, timed to the measured starts. You can draft it alongside the lines, but its
   times come from `voice.starts`. Show it to the person.
5. **Page:** `node make.mjs <id> page`.
6. **Build** `src/scenes/<id>.js` shot by shot, in order. Tie every time to a line:
   `const L = (i, d = 0) => VO_STARTS[i - 1] + d;` then `L(3, 1.2)` is 1.2 s after line 3 starts, so a retimed line
   moves its pictures with it.
7. **Review** each shot as you go (ANIMATION_GUIDE.md, "Look at it"), and run `node make.mjs <id> audit`.
8. **Music:** write `music_<id>.mjs` → `node make.mjs <id> music`.
9. **Finish:** `frames` → `encode` → `srt` → the cover.

Changing a line later: `tts <n>` → `pauses` → fix `starts` → `vo` → `music`. Scenes tied to `L()` follow on their own.

## Storyboard format

Model it on STORYBOARD_MEIOSIS.md. The header:

```
# Pip讲<主题> — storyboard (<length> s, <bpm> bpm)

Logline: what Pip learns, in one or two sentences.
Audience: who, and the terms they know.
World / colour arc: the world of each section, and how the colour moves across the film.
Colour code (fixed all film): what each colour always means.
Motif: the thing that recurs and pays off.
Pip's arc: the moods across the whole film.
Pacing: the gap between lines, at section changes, and the holds after recaps.
```

Then the shots, each a section with its time range, its transition in and its world, and under it one entry per voice
line (`L1  1.0  what's seen …`) with the beats inside it. It's ANIMATION_GUIDE.md's storyboard with the reads organised
by line.

## Music

Every film has its own `music_<id>.mjs`, written from scratch in Node: no samples, no downloaded songs. Read the header
of music_meiosis.mjs for the shape. The script:
- reads `videos/<id>.json` for the line starts, and uses the manifest's `bpm`
- gives each shot its own chord section, with stingers on picture events (STYLE.md has the vocabulary)
- ducks under `assets/<id>_vo.wav` and breathes up in the long pauses
- writes `assets/<id>_bgm.wav` and `assets/<id>_mix.wav`

Give each film its own instrument palette (mRNA and opto used kalimba, glock and pizzicato; meiosis used electric
piano, marimba, harp and flute).

## Done means

- `out/<id>/<title>.mp4`: 1920×1080, 24 fps, with the mix.
- `out/<id>/<title>.srt` (`make.mjs <id> srt`).
- The cover: a still from `LOOPS.cover` in your scene,
  `node render.mjs --page=<id>.html --loop=cover --stills=.5 --out=out/<id>/cover`, saved as
  `out/<id>/<title>_封面.png`.
- The film's source in git: the manifest, the storyboard, the scene, the music script and `assets/vo_<id>/`, plus the
  small generated page, config and `<id>_vo_env.js`, so the page opens from a fresh clone. The generated WAVs and
  everything in `out/` are gitignored. Commit only when the person asks.

## House rules

- **The TTS key** is in `tts_api_key.txt`. Never print, paste or commit it.
- **Don't change shared files for one film** (`src/core.js`, `src/timeline.js`, `src/pip.js`, `src/pip_toon.js`, `src/scenes/mrna_kit.js`).
  To vary a helper, copy it into your scene and change it there. If a shared fix is truly needed, say so to the person
  first: every film depends on those files.
- **Nothing you need lives only in `out/`.** It's gitignored and disposable. Reference images belong in `docs/`.

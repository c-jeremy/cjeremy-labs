# The studio

Read this first. It says what this studio makes, which files a film needs and the order to make them in. The craft
(rules, timing, the review loop, the engine, Pip) is in [ANIMATION_GUIDE.md](../ANIMATION_GUIDE.md), and the series' look is
in [docs/STYLE.md](STYLE.md).

IMPORTANT: For every single video, you MUST first run `git pull` and then checkout a new branch **from remote branch main** named in the theme of
the new video before working. 
eg. if you are making a video about apples, first go git pull, and then create a new branch from main branch, named "apple", and then work. 


## What we make

- **Mandarin science explainer films**, one topic each, in the series **Pip讲<topic>**: Pip讲mRNA疫苗, Pip讲光遗传学,
  Pip讲减数分裂. They're uploaded to Bilibili with captions and a cover.
- **The host is Pip**, the plum sprout ([src/pip.js](../src/pip.js), [docs/PIP.md](PIP.md),
  [docs/img/pip_reactions.png](img/pip_reactions.png)). Pip is the viewer's stand-in: it swims beside the subject, never
  over it, and reacts *after* each thing happens. Pip is the only host; don't cast another one.
- **Audience:** high-school biology (人教版 terms), or a step above. Name the molecule, skip the babysitting, and keep
  the science right.
- **Length:** 3–5 minutes so far (177–290 s), 13–22 narration lines, 84–96 bpm.
- **Sound:** a Mandarin narration (Gemini TTS) over a score synthesised from scratch for that film.
- **Look:** hand-painted textbook, the same series look every time (docs/STYLE.md). No text on screen (the cover is
  the one exception); the captions live in the `.srt`.

The person prompting you picks the topic. If they ask for something outside this (a short, a different host, another
language), do what they ask.

## Read in this order

1. This file.
2. [docs/STYLE.md](STYLE.md): the series' look, colour, molecules, cells, staging, sound and the numbers that worked.
   Required, every time.
3. [ANIMATION_GUIDE.md](../ANIMATION_GUIDE.md): the rules, timing, the review loop, the pipeline, the engine and Pip.
4. One or two finished film(s), for **format & styles, not content**: eg [videos/meiosis.json](../videos/meiosis.json) and
   [storyboards/meiosis.md](../storyboards/meiosis.md), plus the header comment of [audio/music_meiosis.mjs](../audio/music_meiosis.mjs).
   Don't read old scene files start to finish (STYLE.md says why); open one only for a technique you need.

Use only the engine files these docs name. Some files in `src/` aren't for these films; leave them alone.

## The files of one film

`<id>` is a short lowercase English name (`meiosis`, `opto`). Copy the shape of the meiosis files, not their content.
Every path below is relative to the repo root, and every command runs from there. Each file goes in the folder shown;
nothing for a film lives at the root (the full map is in [README.md](../README.md)).

| file | what it is | who writes it |
|---|---|---|
| `videos/<id>.json` | the manifest: title, length, bpm, cast, scenes, music, voice lines and starts, captions, audit | you (start from a copy of videos/meiosis.json) |
| `storyboards/<id>.md` | the storyboard, organised by voice line (format below) | you |
| `src/scenes/<id>.js` | the film: one IIFE, `const K = MK`, shots, and `LOOPS.cover` for the cover | you |
| `audio/music_<id>.mjs` | the score, synthesised from scratch; the manifest's `music` points here | you |
| `assets/vo_<id>/lNN.wav` | one take per narration line | `tools/make.mjs <id> tts` |
| `pages/<id>.html`, `src/config_<id>.js`, `src/scenes/<id>_vo_env.js`, `assets/<id>_vo.wav`, `assets/<id>_bgm.wav`, `assets/<id>_mix.wav` | the page, config, voice envelope and audio | generated: never edit |

In the manifest:
- `title` is `Pip讲<中文主题>`. It names the MP4, the captions and the cover.
- `cast` is `["src/pip.js", "src/pip_toon.js"]` (Pip and its slapstick kit, `TOON`). `scenes` is `["src/scenes/mrna_kit.js", "src/scenes/<id>.js"]`, so the kit (`MK`) is always there.
- Copy `voice` from [videos/amnesia.json](../videos/amnesia.json) and change `lines`, `starts` and `show`. It uses the house
  voice, `"model": "gemini-3.8-flash-tts"` and `"voice": "Tavi"` (also make.mjs's default), and gives its direction as
  **`notes`**, not `style`: `notes` are director's notes (who is speaking, to whom, the mood, the pace), which make.mjs
  sends in the TTS prompt layout (`### DIRECTOR'S NOTES` … `### TRANSCRIPT`). Gemini 3.8 often reads a `style` prefix
  aloud as part of the take, so don't use `style` on 3.8. Keep the language and adjust the notes' audience if it changes.
  The films up to maize keep Aoede on 3.1 with `style`; leave them as they are.

## The order of work: the script comes first

The narration is the spine of the film. Pictures are timed to the voice, not the other way round.

1. **Outline.** Agree the topic, the audience, the opening hook and 4–7 sections with the person.
2. **Write the lines** in Chinese, into `voice.lines` (STYLE.md, "Sound and voice": one idea per line, 40–75
   characters, written the way it should be *said*, one concrete hook per section). Show them to the person before
   you go on.
3. **Voice:** `node tools/make.mjs <id> tts` (it retries a take that runs far too long for its text, the sign of spoken notes)
   → `listen` (worth running on 3.8: it catches ad-libs like an added 啊 or 诶; regenerate those lines) → `pauses` → set `voice.starts` (gaps from STYLE.md's
   calibration) → set `duration` (the last line's end plus time for the ending to land) → `node tools/make.mjs <id> vo`.
   `vo` writes `src/scenes/<id>_vo_env.js` (`VO_STARTS`, `voAt`), which the page loads: run it before you build.
4. **Storyboard** `storyboards/<id>.md`, timed to the measured starts. You can draft it alongside the lines, but its
   times come from `voice.starts`. Show it to the person.
5. **Page:** `node tools/make.mjs <id> page`.
6. **Build** `src/scenes/<id>.js` shot by shot, in order. Tie every time to a line:
   `const L = (i, d = 0) => VO_STARTS[i - 1] + d;` then `L(3, 1.2)` is 1.2 s after line 3 starts, so a retimed line
   moves its pictures with it.
7. **Review** each shot as you go (ANIMATION_GUIDE.md, "Look at it"), and run `node tools/make.mjs <id> audit`.
8. **Music:** write `audio/music_<id>.mjs` → `node tools/make.mjs <id> music`.
9. **Finish:** `frames` → `encode` → `srt` → the cover.

Changing a line later: `tts <n>` → `pauses` → fix `starts` → `vo` → `music`. Scenes tied to `L()` follow on their own.

## Storyboard format

Model it on storyboards/meiosis.md. The header:

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

Every film has its own `audio/music_<id>.mjs`, written from scratch in Node: no samples, no downloaded songs. Read the header
of audio/music_meiosis.mjs for the shape. The script:
- reads `videos/<id>.json` for the line starts, and uses the manifest's `bpm`
- gives each shot its own chord section, with stingers on picture events (STYLE.md has the vocabulary)
- ducks under `assets/<id>_vo.wav` and breathes up in the long pauses
- writes `assets/<id>_bgm.wav` and `assets/<id>_mix.wav`

Give each film its own instrument palette (mRNA and opto used kalimba, glock and pizzicato; meiosis used electric
piano, marimba, harp and flute).

## Done means

- `out/<id>/<title>.mp4`: 1920×1080, 24 fps, with the mix.
- `out/<id>/<title>.srt` (`tools/make.mjs <id> srt`).
- Two covers, both following "Covers and titles" below: 16:9 from `LOOPS.cover` and 4:3 from `LOOPS.cover43` (composed
  for the centre 1440 × 1080 of the frame, then cropped `crop=1440:1080:240:0`). Render each with
  `node tools/render.mjs --page=pages/<id>.html --loop=cover --stills=.5 --out=out/<id>/cover/c169` (and `cover43`), saved as
  `out/<id>/<title>_封面.png` and `out/<id>/<title>_封面_4比3.png`. Worked example: the covers in src/scenes/amnesia.js.
- The film's source in git: `videos/<id>.json`, `storyboards/<id>.md`, `src/scenes/<id>.js`, `audio/music_<id>.mjs` and
  `assets/vo_<id>/`, plus the small generated `pages/<id>.html`, `src/config_<id>.js` and `src/scenes/<id>_vo_env.js`,
  so the page opens from a fresh clone. The generated WAVs and
  everything in `out/` are gitignored. Commit only when the person asks.

## Covers and titles (封标)

The film itself has no text on screen; the cover is the one exception. These are the person's rules (weights in
brackets). The `title` field keeps the series name (`Pip讲<主题>`); the Bilibili upload title is proposed separately.

**Title (标题)**
1. Contains "！" and/or "？". *HIGH*
2. Is about the viewer: it says "你". *HIGH*
3. Is a little unclear, odd, or obviously has a story behind it. *MEDIUM*
4. If it has two elements, they make an unexpected contrast. *MEDIUM*

**Cover (封面)**
1. **One** main character, at least 20% of the cover's area (35% or more is better, 60% or more is best: big
   matters). Everything else is small, and no more than 4 other characters or objects. *HIGH*
2. It has text, at most 10 characters. If more are truly needed, use different colours or fonts to separate the
   parts (or for emphasis). "！" and "？" are recommended.
3. The text never fills the cover's width or height: leave at least 10% of breathing room on both axes. *MEDIUM*
4. Keep the bottom 20% free of text: Bilibili shows the play count and other data there. *HIGH*

Bilibili needs two covers, 16:9 and 4:3 (see "Done means"). For cover text, the system font 翩翩体 (`HanziPen SC`,
bold) suits the hand-painted look; draw it with `letter()` and an ink stroke.

## House rules

- **The TTS key** is in `tts_api_key.txt`. Never print, paste or commit it.
- **Don't change shared files for one film** (`src/core.js`, `src/timeline.js`, `src/pip.js`, `src/pip_toon.js`, `src/scenes/mrna_kit.js`).
  To vary a helper, copy it into your scene and change it there. If a shared fix is truly needed, say so to the person
  first: every film depends on those files.
- **Nothing you need lives only in `out/`.** It's gitignored and disposable. Reference images belong in `docs/img/`.
- **Keep the layout.** New files go in the folder for their kind (README.md has the map): manifests in `videos/`,
  storyboards and outlines in `storyboards/`, scenes in `src/scenes/`, scores in `audio/`, pages in `pages/`, scripts
  that drive the pipeline in `tools/`, docs in `docs/`. Don't add files at the repo root.
- **git pull and then create a semantically-named branch before working**.

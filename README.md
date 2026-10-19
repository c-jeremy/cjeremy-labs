# Claude Animation Base

Hand-painted, narrated science films hosted by Pip, built with p5.brush. Start with [docs/STUDIO.md](docs/STUDIO.md), then [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md).

Run every command from the repo root (all paths are relative to it).

A pre-commit hook (`.githooks/pre-commit`) rejects MP4s and any file over 10 MB: renders stay in `out/`. `npm install` turns it on; in a fresh clone without it, run `git config core.hooksPath .githooks`.

| folder | what's in it |
|---|---|
| `videos/` | one manifest per film, `<id>.json`: the source of truth for a film |
| `storyboards/` | `<id>.md`, the storyboard for each film (plus outlines for films not started yet) |
| `src/` | the engine (`core.js`, `clawd.js`, `timeline.js`), Pip (`pip*.js`), generated `config_<id>.js` |
| `src/scenes/` | each film's scenes, `<id>.js`, and the generated voice envelopes `<id>_vo_env.js` |
| `audio/` | each film's score, `music_<id>.mjs` (plus the old per-film voice scripts `vo_dna.mjs`, `vo_pcr.mjs`) |
| `assets/` | voice takes (`vo_<id>/lNN.wav`) and the generated voice, music and mix WAVs |
| `pages/` | the studio pages: `<id>.html` (generated), `studio.html`, `pip.html`, `pipreel.html` |
| `tools/` | `make.mjs` (the pipeline), `render.mjs` (headless renderer), `phone_render.mjs` + its driver page, `vo_audit.mjs` (laughs and ad-libs in voice takes), `gpu_probe.mjs` |
| `docs/` | `STUDIO.md`, `STYLE.md`, `PIP.md`, notes; reference images in `docs/img/` |
| `out/` | renders, frames, MP4s, captions: gitignored and disposable |

```sh
node tools/make.mjs                 # the pipeline's commands
node tools/make.mjs <id> page       # write pages/<id>.html and src/config_<id>.js
node tools/make.mjs <id> sheet 1,5  # contact sheet → out/<id>/check/sheet.jpg
```

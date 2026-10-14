# Pip讲植物吸收二氧化碳 (C3 · C4 · CAM)

A 5-minute-20 Mandarin explainer for high-school biology: how a leaf takes in CO₂ and what it pays in water. It covers
the stoma, Rubisco and the Calvin cycle (C3 plants), photorespiration, the C4 pump that splits the steps in space and
CAM, which splits them in time. Made in this repo's Pip studio; the source is `videos/carbon.json`,
`STORYBOARD_CARBON.md`, `src/scenes/carbon.js` and `music_carbon.mjs`.

The film is cut into 11 parts of 30 s (the last is 20 s). Each part plays on its own and has its own captions.

| part | time in the film | what's in it |
|---|---|---|
| `_part01.mp4` | 0:00–0:30 | the dilemma (the scale), the stoma |
| `_part02.mp4` | 0:30–1:00 | into the chloroplast; Calvin's ¹⁴C experiment; Rubisco fixes CO₂ |
| `_part03.mp4` | 1:00–1:30 | the Calvin cycle; C3 crops |
| `_part04.mp4` | 1:30–2:00 | Rubisco is slow and grabs O₂ |
| `_part05.mp4` | 2:00–2:30 | photorespiration; recap; corn and the Kranz wreath |
| `_part06.mp4` | 2:30–3:00 | PEP carboxylase; the pump into the bundle sheath |
| `_part07.mp4` | 3:00–3:30 | C4 named; cost and payoff; the scales |
| `_part08.mp4` | 3:30–4:00 | the desert; Bryophyllum's sour morning leaves; CAM at night |
| `_part09.mp4` | 4:00–4:30 | CAM by day; split in time; three scales |
| `_part10.mp4` | 4:30–5:00 | recap; the world's share of C4 |
| `_part11.mp4` | 5:00–5:20 | C4 rice; finding the balance |

Files:
- `Pip讲植物吸收二氧化碳_partNN.mp4`: 1920×1080, 24 fps, H.264 (CRF 23) + AAC 192 kb/s. Each starts on a keyframe.
- `Pip讲植物吸收二氧化碳_partNN.srt`: that part's captions, timed from the part's own start.
- `Pip讲植物吸收二氧化碳.srt`: captions for the whole film (for the joined video or for upload, e.g. Bilibili 字幕 → 上传字幕).
- `Pip讲植物吸收二氧化碳_封面.png`: the cover.
- `parts.txt`: the part list for joining.

Join the parts back into one film without re-encoding:

```bash
cd dist/carbon
ffmpeg -f concat -safe 0 -i parts.txt -c copy Pip讲植物吸收二氧化碳.mp4
```

These parts come from a lighter encode of the CRF 17 master that `node make.mjs carbon encode` produces (that master is
about 600 MB, too big to keep in git). To rebuild the master from source: `node make.mjs carbon vo`,
`node make.mjs carbon music`, `node make.mjs carbon frames`, `node make.mjs carbon encode`. On a machine without a GPU,
render with `node render.mjs --page=carbon.html --frames --frames-dir=out/carbon/frames --gpu-angle=gl-egl`, running one
process per `--range` so each gets its own GPU process.

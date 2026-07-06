# The Warming Sea

A scrollytelling data-visualization entry for the **Pacific Data Viz
Challenge 2026** (interactive category): Papua New Guinea's official climate
record, 1850–2025 — a warming ocean, its driest El Niño years, and the
climate-justice gap between who warms the planet and who wears the
consequences.

**Every chart is built from the official Challenge dataset** — the Pacific
Community (SPC) climate-change indicators, dataflow `SPC:DF_CLIMATE_CHANGE(1.0)`,
exported from the Pacific Data Hub's .Stat Explorer
([stats.pacificdata.org](https://stats.pacificdata.org/)) and filtered to
Papua New Guinea. The series are **annual, national-level observations** and
are used **real and unaltered**. There is no synthetic data and no forecast.

> The single scene that is not data — scene 5, "one garden" — is an explicitly
> labelled **illustration** of radiative frost, drawn so the record's numbers
> land on something human. It carries no data claim and cites no source.

## The record, and what it shows

Extracted per indicator for Papua New Guinea (`prep/make_real_data.mjs`):

| Indicator | Coverage | What the piece does with it |
|---|---|---|
| Sea-surface temperature anomaly | 1850–2025 | Scene 1 (the warming sea) + scene 2 |
| Surface (land) temperature anomaly | 1850–2025 | Scene 2 (sea and land, in step) |
| Rainfall anomaly | 1979–2025 | Scene 3 (the driest years: **1997, 2015**) |
| Crop yield | 1961–2024 | Scene 4 (what the dry years cost) |
| Sea-level anomaly | 1993–2023 | Scene 6 (who warms it, who wears it) |
| Greenhouse-gas emissions per capita | 1970–2024 | Scene 6 (the climate-justice contrast) |
| …all of the above | | Scene 7 (the whole record, small multiples) |

An honest caveat the piece states plainly (scene 3): El Niño is defined by
warming in the **central** Pacific (the Niño 3.4 region), far east of Papua
New Guinea, which sits in the western warm pool. So PNG's own sea-surface
anomaly and its rainfall shortfalls need not line up year for year — in 1997
the local sea ran near normal while the rain failed catastrophically. The
driver lives in an ocean this national dataset does not measure; the record
registers the consequence, not the signal.

## Stack

- SvelteKit (Svelte 5) + `@sveltejs/adapter-static` — fully static, no SSR at
  runtime, deployed to GitHub Pages by `.github/workflows/deploy.yml`
  (`BASE_PATH` env drives `paths.base`; all URLs go through `$app/paths`).
- Scroll orchestration: [scrollama], wrapped once in
  `src/lib/components/ScrollScene.svelte` — every scene uses this single
  abstraction (pin + 0–1 progress + lazy scene-scoped JSON loading).
- Scene 1: raw WebGL fragment shader (no three.js). Each year's real national
  SST anomaly is uploaded as a uniform LUMINANCE texture, so the colour of the
  sea **is** that year's anomaly (`°C = (byte − 128) / 40`). No WebGL →
  pre-rendered PNG posters (coolest year / record 2025) with a CSS crossfade.
- Charts: hand-authored SVG via two small reusable components —
  `AnnualLines.svelte` (multi-series annual lines, scroll-driven draw-in,
  direct end labels, hover readout) and `AnnualBars.svelte` (diverging
  anomaly bars around zero). D3 for scales/shapes only (`d3-scale`,
  `d3-shape`); Svelte owns the DOM.
- Particles (frost, scene 5): Canvas 2D, deterministic/seeded, scroll-driven,
  only drawn while the scene is on screen.
- Pacing: every pinned scene narrates through `SceneSteps` — one idea per
  step. Optional interaction beats (`src/lib/components/beats/`): `TapReveal`
  (inline accordion) and `Hotspot` (pop-up-book dot + card). **The scroll
  alone tells the complete story** — append `?notap=1` to hide every
  affordance and proof-read the scroll-only experience.
- `src/lib/palette.js` is the **single source of truth for every color**,
  including the diverging anomaly scale shared by the shader (generated GLSL)
  and all charts.

## Accessibility & performance

- Every scene has a prose equivalent: always in the accessibility tree,
  visually revealed by the "Read scene text" toggle.
- `prefers-reduced-motion` freezes shader time and all self-running motion;
  scroll-driven scrubbing (user-initiated) remains.
- Charts have `role="img"` labels and a collapsible data-table fallback.
- Scene 7 (the whole record) prints to one page.
- Budget: per-scene JSON is small (≤ ~16 KB) and fetched lazily as scenes
  approach; the tidy foundation file `pg_climate.json` (every PNG series +
  a Pacific-wide context mean) is ~42 KB.

## Develop

```bash
npm install
node prep/make_real_data.mjs   # rebuild static/data/*.json + posters from source CSV
npm run dev                    # local, base ''
npm run build                  # static build in build/
BASE_PATH=/repo-name npm run build   # as deployed to Pages
```

[scrollama]: https://github.com/russellsamora/scrollama

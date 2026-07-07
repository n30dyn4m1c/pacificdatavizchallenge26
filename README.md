# Stolen Rain

A scrollytelling data-visualization entry for the **Pacific Data Viz
Challenge 2026** (interactive category): a data detective story asked of
Papua New Guinea's official climate record. The driest years keep coming
back — 1997, 2015, droughts and highland frosts people remember by name.
The obvious suspect, the country's own record-warm sea, has an alibi. The
thief is an ocean seven thousand kilometres away.

## The argument, in seven exhibits and a coda

| Act | Scene | Series (SPC unless noted) |
|---|---|---|
| I — The record | The warming sea, 1850–2025, record +1.1 °C in 2025 (WebGL) | `SST_ANOM` |
| II — The dry years | Rainfall anomaly bars, five driest labelled | `RAIN_ANOM` |
| III — The alibi | Scatter: each year's own sea vs its own rain — **r = +0.48**, the *wrong sign* for a thief; every driest year had a cool-or-ordinary local sea | `SST_ANOM` × `RAIN_ANOM` |
| IV — The far ocean | Mirror chart: the Oceanic Niño Index over PNG's rainfall — **8 of the 10 driest years are El Niño years**, r = −0.64 | `RAIN_ANOM` + **NOAA ONI** |
| V — The cost | Crop yield against the drought years (+ the frost story as a labelled illustrative popup) | `CROP_YIELD` |
| VI — Double exposure | The resident trend beneath the visits: sea level rising, sea surface at record | `SEA_LVL`, `SST_ANOM` |
| VII — The gap | Emissions per person ~1 t, flat for 50 years, against the ≈6.6 t world average | `GHG_EMI_CAPITA` + **EDGAR ref.** |
| Coda — Watching | Monitoring network, 1 station (1951) → 6 (2026) | `METEO_MONITOR_NET` |
| Epilogue | The whole record, small multiples (prints to one page) | six SPC series |

## Data

**~90 % of the piece is the official Challenge dataset**: the Pacific
Community (SPC) climate-change indicators, dataflow
`SPC:DF_CLIMATE_CHANGE(1.0)`, exported from the Pacific Data Hub's .Stat
Explorer ([stats.pacificdata.org](https://stats.pacificdata.org/)) and
filtered to Papua New Guinea. Annual, national-level observations, used
**real and unaltered**. No synthetic data, no forecast.

Two small, documented companions from open sources supply what a national
dataset cannot:

- **NOAA CPC Oceanic Niño Index** (`prep/source/oni_cpc.csv`) — names the
  El Niño years and drives one band of Act IV's mirror chart. *Transcribed
  table; verify against the NOAA page before submission — see
  `prep/README.md`.*
- **EDGAR (EC-JRC) world-average GHG per capita** — a single reference
  value (≈6.6 t CO₂e, 2023) in Act VII.

All correlations and rankings (r = +0.48, r = −0.64, the driest-ten list)
are **computed by the pipeline** (`prep/make_real_data.mjs`) from those
sources — nothing is asserted by hand.

An honest caveat the piece states in-scene (Acts III–IV): El Niño is defined
by warming in the **central** Pacific (Niño 3.4), far east of Papua New
Guinea, which sits in the western warm pool. The local sea-surface series
cannot carry that signal — in 1997 the local sea ran −0.2 °C while the rain
failed catastrophically. That mismatch is not a flaw in the story; it *is*
the story.

## Stack

- SvelteKit (Svelte 5) + `@sveltejs/adapter-static` — fully static, no SSR at
  runtime, deployed to GitHub Pages by `.github/workflows/deploy.yml`
  (`BASE_PATH` env drives `paths.base`; all URLs go through `$app/paths`).
- Scroll orchestration: [scrollama], wrapped once in
  `src/lib/components/ScrollScene.svelte` — every scene uses this single
  abstraction (pin + 0–1 progress + lazy scene-scoped JSON loading).
- Act I: raw WebGL fragment shader (no three.js). Each year's real national
  SST anomaly is uploaded as a uniform LUMINANCE texture, so the colour of the
  sea **is** that year's anomaly (`°C = (byte − 128) / 40`). No WebGL →
  pre-rendered PNG posters (coolest year / record 2025) with a CSS crossfade.
- Charts: hand-authored SVG via four small reusable components —
  `AnnualLines` (multi-series lines, draw-in, optional step curve and
  reference line), `AnnualBars` (diverging anomaly bars), `AnomalyScatter`
  (Act III's alibi) and `MirrorBars` (Act IV's ONI-over-rainfall reveal).
  D3 for scales/shapes only (`d3-scale`, `d3-shape`); Svelte owns the DOM.
- Pacing: every pinned scene narrates through `SceneSteps` — one idea per
  step. Optional interaction beats (`src/lib/components/beats/`): `TapReveal`
  (inline accordion popups: the warm-pool explainer, the El Niño explainer,
  the frost story) and `PauseBeat` (two resting moments, hard cap). **The
  scroll alone tells the complete story** — append `?notap=1` to hide every
  affordance and proof-read the scroll-only experience.
- `src/lib/palette.js` is the **single source of truth for every color**,
  including the diverging anomaly scale shared by the shader (generated GLSL)
  and all charts. The warm arm means the same thing everywhere: the El Niño /
  dry side.

## Accessibility & performance

- Every scene has a prose equivalent: always in the accessibility tree,
  visually revealed by the "Read scene text" toggle.
- `prefers-reduced-motion` freezes shader time and all self-running motion;
  scroll-driven scrubbing (user-initiated) remains.
- Charts have `role="img"` labels and a collapsible data-table fallback.
- The epilogue (the whole record) prints to one page.
- Budget: per-scene JSON is small (≤ ~16 KB) and fetched lazily as scenes
  approach; the tidy foundation file `pg_climate.json` (every PNG series +
  ONI + a Pacific-wide context mean) is ~44 KB.

## Develop

```bash
npm install
node prep/make_real_data.mjs   # rebuild static/data/*.json + posters from source CSVs
npm run dev                    # local, base ''
npm run build                  # static build in build/
BASE_PATH=/repo-name npm run build   # as deployed to Pages
```

[scrollama]: https://github.com/russellsamora/scrollama

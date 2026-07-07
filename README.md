# The Ocean Knows First

A scrollytelling data-visualization entry for the **Pacific Data Viz
Challenge 2026** (interactive category): a light, editorial journey through
Papua New Guinea's official climate record. The country's worst droughts
don't start in its own sky — they start in the temperature of seawater
seven thousand kilometres east, months earlier. Six chapters follow that
signal from the far ocean down to a highland garden.

## The journey, in six chapters

| Chapter | Sticky graphic (morphs card by card) | Series (SPC unless noted) |
|---|---|---|
| 1 — The far ocean | The ENSO see-saw: ONI bars go from gray → meaning colors → the four great El Niños; the current season is an open "?" | **NOAA ONI** |
| 2 — The rain | The mirror: PNG rainfall alone, then the far ocean fades in above it — **8 of the 10 driest years are El Niño years**, r = −0.64 | `RAIN_ANOM` + **NOAA ONI** |
| 3 — The gardens | Crop yield stumbling at the driest years (+ the frost story as a labelled illustrative popup) | `CROP_YIELD` |
| 4 — The long record | The 176-year sea record draws under a giant year counter → 2025 record → crossfades to sea level; last card carries the local "alibi" (r = +0.48, warm local years are *wetter*) | `SST_ANOM`, `SEA_LVL` |
| 5 — The ledger | Emissions as countable dots: the world's 66 (≈6.6 t) vs PNG's 10 (1.0 t) | `GHG_EMI_CAPITA` + **EDGAR ref.** |
| 6 — The watchers | Monitoring network step chart, 1 station (1951) → 6 (2026); the payoff — a remote signal is an early one | `METEO_MONITOR_NET` |
| Epilogue | The whole record, small multiples (prints to one page) | six SPC series |

Two `BigStat` interludes let the numbers land between chapters (8/10 and
+1.1 °C).

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
  El Niño years and drives chapter 1 and one band of chapter 2's mirror chart. *Transcribed
  table; verify against the NOAA page before submission — see
  `prep/README.md`.*
- **EDGAR (EC-JRC) world-average GHG per capita** — a single reference
  value (≈6.6 t CO₂e, 2023) in chapter 5.

All correlations and rankings (r = +0.48, r = −0.64, the driest-ten list)
are **computed by the pipeline** (`prep/make_real_data.mjs`) from those
sources — nothing is asserted by hand.

An honest caveat the piece states in-scene (chapters 1–2 and 4): El Niño is defined
by warming in the **central** Pacific (Niño 3.4), far east of Papua New
Guinea, which sits in the western warm pool. The local sea-surface series
cannot carry that signal — in 1997 the local sea ran −0.2 °C while the rain
failed catastrophically. That mismatch is not a flaw in the story; it *is*
the story.

## Design & stack

The presentation follows the light editorial scrollytelling register
(pudding.cool-style): one warm paper surface end to end, big Fraunces
display type with color-highlighted words, and **white step cards** that
scroll over sticky graphics — each card advancing the chart's state
(colors arriving, marks appearing, series crossfading). Key phrases in the
cards are highlighted in the exact chart colors they refer to; the warm
arm means the same thing everywhere (the El Niño / dry side), the cool arm
its opposite.

- SvelteKit (Svelte 5) + `@sveltejs/adapter-static` — fully static, no SSR at
  runtime, deployed to GitHub Pages by `.github/workflows/deploy.yml`
  (`BASE_PATH` env drives `paths.base`; all URLs go through `$app/paths`).
- Scroll orchestration: [scrollama], wrapped once in
  `src/lib/components/ScrollScene.svelte` (pin + 0–1 progress + lazy
  scene-scoped JSON loading + the card column via its `flow` snippet).
  `src/lib/scrolly.js` holds the one card convention: N cards → runway of
  (N+1)·100 vh, active card = nearest card center.
- Charts: hand-authored SVG via small reusable components — `AnnualLines`
  (lines with draw-in, step-curve and reference-line options), `EnsoBars`
  (chapter 1's see-saw), `MirrorBars` (chapter 2's ONI-over-rainfall
  mirror), `DotUnits` (chapter 5's unit dots). D3 for scales/shapes only
  (`d3-scale`, `d3-shape`); Svelte owns the DOM.
- Static animation: the hero's CSS rain field (deterministic, no JS loop),
  chart draw-ins, dot-stagger fills and layer crossfades — all disabled or
  frozen under `prefers-reduced-motion`.
- Popups: `TapReveal` (inline accordion; the frost story in chapter 3).
  **The scroll alone tells the complete story** — append `?notap=1` to hide
  every affordance and proof-read the scroll-only experience.
- `src/lib/palette.js` is the **single source of truth for every color**.

## Accessibility & performance

- Every chapter has a prose equivalent: always in the accessibility tree,
  visually revealed by the "Read scene text" toggle.
- `prefers-reduced-motion` removes the rain field and all self-running
  motion; scroll-driven state changes (user-initiated) remain.
- Charts have `role="img"` labels and a collapsible data-table fallback.
- The epilogue (the whole record) prints to one page.
- Budget: per-scene JSON is small (≤ ~16 KB) and fetched lazily as scenes
  approach; the tidy foundation file `pg_climate.json` (every PNG series +
  ONI + a Pacific-wide context mean) is ~44 KB.

## Develop

```bash
npm install
node prep/make_real_data.mjs   # rebuild static/data/*.json from the source CSVs
npm run dev                    # local, base ''
npm run build                  # static build in build/
BASE_PATH=/repo-name npm run build   # as deployed to Pages
```

[scrollama]: https://github.com/russellsamora/scrollama

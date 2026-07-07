# The Ocean Knows First

A scrollytelling data-visualization entry for the **Pacific Data Viz
Challenge 2026** (interactive category): a light, editorial journey through
Papua New Guinea's official climate record. The country's worst droughts
don't start in its own sky — they start in the temperature of seawater
seven thousand kilometres east, months earlier. Eight chapters follow that
signal from the far ocean, across the island at every altitude, and out the
other side of the emergency — because the piece is also an educational one:
this has all happened before, it is documented, and it can be prepared for.

## The journey

| # | Chapter | Sticky graphic (morphs card by card) | Source |
|---|---|---|---|
| 1 | The map | Real-coastline map of the tropical Pacific: PNG west, the **Niño 3.4 detection box** east; the warm pool (schematic) slides east (El Niño) and piles back west (La Niña) | Natural Earth geometry |
| 2 | The far ocean | The ENSO see-saw: ONI bars, gray → meaning colors → the four great El Niños; the current season an open "?" | **NOAA ONI** |
| 3 | The rain | The mirror: PNG rainfall alone, then the far ocean fades in above it — **8 of the 10 driest years are El Niño years**, r = −0.64 | `RAIN_ANOM` + **NOAA ONI** |
| 4 | The island | The real PNG map (A–B cut marked) crossfades to a sideways **elevation profile** walked in drought: coast & islands → lowland rivers → Highlands by day → the frost night → the whole island | Natural Earth + labelled illustration |
| — | Field note 01 | **Interactive**: a slider dries a lowland river — sandbars, stranded barges, dry pumps, the walk for water | labelled illustration |
| — | Field note 02 | **Interactive**: cloud toggle on a highland night — blanket on, +9 °C; blanket off, −3 °C and the kaukau frosts | labelled illustration |
| 5 | The gardens | Crop yield stumbling at the driest years; the subsistence-garden caveat | `CROP_YIELD` |
| — | The aftermath | The swing back: rain on drought-bared slopes — floods and landslips (the documented 2016 Jiwaka case) | labelled illustration + link |
| — | The paper trail | Six real documents from 1997–98 and 2015–16 (ReliefWeb, IFRC, ANU Devpolicy, The Conversation, IOM), summarised, with key points and external links | external reporting |
| 6 | The long record | The 176-year sea record under a giant year counter → 2025 record → sea level; the local "alibi" (r = +0.48) | `SST_ANOM`, `SEA_LVL` |
| 7 | The ledger | Emissions as countable dots: the world's 66 (≈6.6 t) vs PNG's 10 (1.0 t) | `GHG_EMI_CAPITA` + **EDGAR ref.** |
| 8 | The watchers | Monitoring network step chart, 1 station (1951) → 6 (2026); a remote signal is an early one | `METEO_MONITOR_NET` |
| — | The ask | The CTA: **prepare for the predictable** — read the signal, plan on the known exposure map, move money early, teach the pattern | — |
| — | Epilogue | The whole record, small multiples (prints to one page) | six SPC series |

Two `BigStat` interludes let the numbers land between chapters (8/10 and
+1.1 °C).

## Data

**The charts are the official Challenge dataset**: the Pacific Community
(SPC) climate-change indicators, dataflow `SPC:DF_CLIMATE_CHANGE(1.0)`,
exported from the Pacific Data Hub's .Stat Explorer
([stats.pacificdata.org](https://stats.pacificdata.org/)) and filtered to
Papua New Guinea. Annual, national-level observations, used **real and
unaltered**. No synthetic data, no forecast.

Documented companions from open sources supply what a national dataset
cannot:

- **NOAA CPC Oceanic Niño Index** (`prep/source/oni_cpc.csv`) — names the
  El Niño years and drives chapter 2 and one band of chapter 3's mirror
  chart. *Transcribed table; verify against the NOAA page before
  submission — see `prep/README.md`.*
- **EDGAR (EC-JRC) world-average GHG per capita** — a single reference
  value (≈6.6 t CO₂e, 2023) in chapter 7.
- **Natural Earth** (public domain) — the real coastlines and rivers on
  both maps, pre-projected by `prep/make_maps.mjs` into
  `static/data/scene_map.json`. The highlands band on the country map is
  an illustrative marker, not a DEM.

All correlations and rankings (r = +0.48, r = −0.64, the driest-ten list)
are **computed by the pipeline** (`prep/make_real_data.mjs`) from those
sources — nothing is asserted by hand.

**Illustrations are labelled as such, on the graphic.** The elevation
profile, the two interactive field notes and the aftermath hillside carry
no dataset numbers; they draw the mechanisms the record and the linked
reporting document (the Fly River barge closures, the >2,200 m frosts, the
post-drought floods). The paper-trail section links to external reporting;
the summaries are this piece's own.

An honest caveat the piece states in-scene (chapters 1–3 and 6): El Niño is
defined by warming in the **central** Pacific (Niño 3.4), far east of Papua
New Guinea, which sits in the western warm pool. The local sea-surface
series cannot carry that signal — in 1997 the local sea ran −0.2 °C while
the rain failed catastrophically. That mismatch is not a flaw in the story;
it *is* the story: a remote signal is a readable-in-advance signal.

## Design & stack

The presentation follows the light editorial scrollytelling register
(pudding.cool-style): one warm paper surface end to end, big Fraunces
display type with color-highlighted words, and **white step cards** that
scroll over sticky graphics — each card advancing the graphic's state
(colors arriving, marks appearing, the warm pool sliding, the profile's sky
turning to night). The warm arm means the same thing everywhere (the El
Niño / dry side), the cool arm its opposite.

- SvelteKit (Svelte 5) + `@sveltejs/adapter-static` — fully static, no SSR at
  runtime, deployed to GitHub Pages by `.github/workflows/deploy.yml`
  (`BASE_PATH` env drives `paths.base`; all URLs go through `$app/paths`).
- Scroll orchestration: [scrollama], wrapped once in
  `src/lib/components/ScrollScene.svelte` (pin + 0–1 progress + lazy
  scene-scoped JSON loading + the card column via its `flow` snippet).
  `src/lib/scrolly.js` holds the one card convention: N cards → runway of
  (N+1)·100 vh, active card = nearest card center.
- Charts and maps: hand-authored SVG via small reusable components —
  `AnnualLines`, `EnsoBars`, `MirrorBars`, `DotUnits`, plus `PacificMap`,
  `PngMap` and `IslandProfile` (all geometry pre-projected by the pipeline;
  no geo library ships to the client). D3 for scales/shapes only.
- Interactives: `RiverDry` (range slider) and `FrostNight` (radiogroup
  toggle) are self-contained "field note" sections. **The scroll alone
  tells the complete story** — append `?notap=1` and every optional control
  disappears, each figure freezing at its full-drought state.
- Static animation: the hero's CSS rain field, chart draw-ins, the warm
  pool's slide, layer crossfades — all disabled or frozen under
  `prefers-reduced-motion`.
- `src/lib/palette.js` is the **single source of truth for every color**.

## Accessibility & performance

- Every chapter has a prose equivalent: always in the accessibility tree,
  visually revealed by the "Read scene text" toggle (which stays hidden
  until the reader scrolls to content it can act on).
- `prefers-reduced-motion` removes the rain fields and all self-running
  motion; scroll-driven state changes (user-initiated) remain.
- Charts and illustrated figures have `role="img"` labels that follow their
  interactive state; data charts also ship a collapsible table fallback.
- External links (the paper trail) load nothing on the page — no embeds,
  no trackers.
- The epilogue (the whole record) prints to one page.
- Budget: per-scene JSON is small (≤ ~39 KB for the shared map geometry,
  most far smaller) and fetched lazily as scenes approach.

## Develop

```bash
npm install
node prep/make_real_data.mjs   # rebuild static/data/*.json from the source CSVs
node prep/make_maps.mjs        # rebuild static/data/scene_map.json (downloads Natural Earth on first run)
npm run dev                    # local, base ''
npm run build                  # static build in build/
BASE_PATH=/repo-name npm run build   # as deployed to Pages
```

[scrollama]: https://github.com/russellsamora/scrollama

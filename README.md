# The Ocean Knows First

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![SvelteKit](https://img.shields.io/badge/SvelteKit-Svelte%205-FF3E00.svg)
[![Live](https://img.shields.io/badge/Live-GitHub%20Pages-222222.svg)](https://n30dyn4m1c.github.io/pacificdatavizchallenge26/)

**A scrollytelling data-visualization entry for the Pacific Data Viz Challenge 2026** (interactive category): a light, editorial journey through Papua New Guinea's official climate record.

The country's worst droughts don't start in its own sky — they start in the temperature of seawater seven thousand kilometres east, months earlier. Nine chapters follow that signal from the far ocean, across the island at every altitude, out the other side of the emergency — and into the present: the ninth chapter reads the El Niño developing **right now, in 2026**, month by month, against its four great precedents — an event that as of August 2026 is running above all four, with the official outlook on a *very strong* peak in late 2026 and Papua New Guinea's own weather service putting the end of the drought in the first quarter of 2027. Because the piece is also an educational one: this has all happened before, it is documented, it is happening again on schedule, and it can still be prepared for.

**Live:** [n30dyn4m1c.github.io/pacificdatavizchallenge26](https://n30dyn4m1c.github.io/pacificdatavizchallenge26/)

## Features

- Nine scroll-pinned chapters plus two interactive "field note" sections (a drying-river slider, a highland frost-night toggle)
- Real, unaltered SPC Pacific Data Hub climate indicators for Papua New Guinea, joined with NOAA ONI/Niño 3.4, EDGAR, and Natural Earth data
- All correlations, rankings, and the chapter-nine analogue forecast are computed by the data pipeline — nothing is asserted by hand
- Generated prose: chapter nine's cards, aria-labels, captions, and `BigStat` all read from one pipeline-written copy module, so text and chart never disagree
- Full prose-equivalent accessibility tree, `prefers-reduced-motion` support, and a `?notap=1` mode that freezes every interactive at its full-drought state
- Fully static SvelteKit build, deployed to GitHub Pages

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
| 9 | Now | **The one monthly chapter, because the reader is inside the event**, in five cards: the recent see-saw in months (2023–24 El Niño → weak double La Niña → the fast flip of 2026), the 2026 onset laid over 1982/1997/2015/2023 (above all four at June), the unwritten months as a labelled **analogue estimate** (weighted mean + min–max envelope of the four precedents, checked against the official CPC/IRI/WMO outlook of early Aug 2026), then the chapter **marking its own homework** — the cited weekly reading came in above the whole band, and the anchored path shows why — and the calendar it implies: the hard months to ~Mar 2027, the swing back ~May–Jun 2027 | **NOAA PSL Niño 3.4 monthly** |
| — | The live paper trail | Nine real documents of the 2026 event as it unfolds, current to 6 Aug 2026: the NWS El Niño declaration and its six-province Highlands drought warning, the PM's preparedness directive and the funding exchange in Parliament, RNZ, NARI's drought-tier updates, the Highlands frost / Oxfam food-security reporting, the Sirinumu Dam drawdown / Port Moresby load-shedding coverage, and the outlook's move to "very strong" | external reporting |
| — | The ask | The CTA: **prepare for the predictable** — read the signal, plan on the known exposure map, move money early, teach the pattern | — |
| — | Epilogue | The whole record, small multiples (prints to one page) | six SPC series |

Three `BigStat` interludes let the numbers land between chapters (8/10, +1.1 °C, and June 2026's +1.44 °C — with the mid-July weekly reading of ≈ +2.1 °C carried in the caption; the last of the three reads its numbers from the generated copy module, so it never disagrees with chapter nine).

## Data

**The charts are the official Challenge dataset**: the Pacific Community (SPC) climate-change indicators, dataflow `SPC:DF_CLIMATE_CHANGE(1.0)`, exported from the Pacific Data Hub's .Stat Explorer ([stats.pacificdata.org](https://stats.pacificdata.org/)) and filtered to Papua New Guinea. Annual, national-level observations, used **real and unaltered**. No synthetic data.

Documented companions from open sources supply what a national dataset cannot:

- **NOAA CPC Oceanic Niño Index** (`prep/source/oni_cpc.csv`) — names the El Niño years and drives chapter 2 and one band of chapter 3's mirror chart. *Transcribed table; verify against the NOAA page before submission — see `prep/README.md`.*
- **NOAA PSL Niño 3.4 monthly anomalies** (`prep/source/nino34_monthly.csv`, re-exportable with `prep/fetch_nino34.py`) — chapter 9's monthly series, 1970 → June 2026, from <https://psl.noaa.gov/data/correlation/nina34.anom.data>.
- **NOAA CPC / IRI ENSO outlook and WMO update, early August 2026** — four cited reference points (advisory status, persistence probability, the move of the central expectation to a *very strong* peak, expected further intensification) quoted beside chapter 9's estimate, source URLs carried in the JSON.
- **NOAA CPC weekly Niño 3.4 index, week centred 15 July 2026 (≈ +2.1 °C)** — one cited reading, drawn on chapter 9's chart as a ringed, unconnected marker. It is a different product on a different SST basis from the monthly series, so it is never appended to that series and never joined to the plotted line.
- **EDGAR (EC-JRC) world-average GHG per capita** — a single reference value (≈6.6 t CO₂e, 2023) in chapter 7.
- **Natural Earth** (public domain) — the real coastlines and rivers on both maps, pre-projected by `prep/make_maps.mjs` into `static/data/scene_map.json`. The highlands band on the country map is an illustrative marker, not a DEM.

All correlations and rankings (r = +0.48, r = −0.64, the driest-ten list) are **computed by the pipeline** (`prep/make_real_data.mjs`) from those sources — nothing is asserted by hand.

**Chapter nine's prose is generated too.** Scene JSON is fetched lazily as a scene approaches, which is right for a chart and wrong for a sentence, so the pipeline writes `src/lib/generated/now-copy.js` and the components import it at build time: the five cards, the prose equivalent, the chart's aria-label, the figure title, the table caption, the `BigStat` and the colophon all quote the same generated values, and the sentences are complete in the prerendered HTML and without JavaScript. Re-running the pipeline after NOAA appends a month updates the copy with the chart.

**The one forward-looking panel is labelled as such — and it is a floor.** Chapter 9 continues the observed 2026 line with an *analogue estimate*: the four great El Niños aligned by calendar month, weighted by inverse RMSE against 2026's observed January–June, drawn as a dashed weighted-mean path inside their min–max envelope. It is computed entirely by the pipeline, declared an estimate on the graphic, in the legend and in the table view, and cross-checked on-scene against the official CPC/IRI/WMO outlook. Nothing synthetic is presented as an observation.

The event has since outrun that estimate, and the chapter says so rather than quietly re-fitting: the cited mid-July weekly reading (≈ +2.1 °C) sits above the precedent envelope for its month, and the official expectation has moved from *strong* to *very strong*. The pipeline also computes an **anchored** variant — the same four trajectories started from where 2026 actually is rather than from the precedents' own levels, which peaks near +2.8 °C.

The chapter's fourth card, *marking our own homework*, is built on that miss: it states what the estimate expected for the month (+1.19, +1.56 at the top of the band) against what was read (≈ +2.10), names the structural reason — every analogue was cooler than 2026 at the anchor month, so their own levels carry that deficit forward — and only then draws the anchored path. Reading the precedents as a floor is earned on the chart rather than asserted in the caption.

The 2026 "live paper trail" section links the unfolding coverage — the PNG NWS declaration and its six-province Highlands drought warning, the Prime Minister's directive and the funding exchange in Parliament, NARI/DEWS drought updates, the Highlands frost and food-security reporting, and the Sirinumu Dam / Port Moresby power-rationing coverage — as external links with this piece's own summaries. It carries an explicit "as of" date and is current to **6 August 2026**.

**Where the record is coarse, the chart says so.** The SPC sea-level series is published rounded to 0.1 m. Drawn as a smooth line it reads as a sea oscillating wildly between −0.10 and +0.20; it is drawn instead as steps with a dot on every published value, under an on-graphic note naming the resolution, so the staircase reads as the grid the data sits on. The pipeline carries that resolution as metadata (`resolution: 0.1`) rather than the chart hard-coding it.

**Panel titles are the piece's own; the dataflow's labels are kept as provenance.** The SPC indicator names are database labels — inconsistently cased, and one of them spells greenhouse *gaz*. The epilogue titles its six panels editorially and prints the dataflow's own label under each one (`source_name`), which is the string that actually matters for tracing a number back to the hub.

**Illustrations are labelled as such, on the graphic.** The elevation profile, the two interactive field notes and the aftermath hillside carry no dataset numbers; they draw the mechanisms the record and the linked reporting document (the Fly River barge closures, the >2,200 m frosts, the post-drought floods). The paper-trail section links to external reporting; the summaries are this piece's own.

An honest caveat the piece states in-scene (chapters 1–3 and 6): El Niño is defined by warming in the **central** Pacific (Niño 3.4), far east of Papua New Guinea, which sits in the western warm pool. The local sea-surface series cannot carry that signal — in 1997 the local sea ran −0.2 °C while the rain failed catastrophically. That mismatch is not a flaw in the story; it *is* the story: a remote signal is a readable-in-advance signal.

## Design & stack

The presentation follows the light editorial scrollytelling register (pudding.cool-style): one warm paper surface end to end, big Fraunces display type with color-highlighted words, and **white step cards** that advance a sticky graphic card by card (colors arriving, marks appearing, the warm pool sliding, the profile's sky turning to night). The warm arm means the same thing everywhere (the El Niño / dry side), the cool arm its opposite.

Four rules hold the whole piece together:

**1. Two lanes, never an overlay.** On any screen at least 900 px wide the card column owns a reserved lane (`--card-lane`) and the sticky graphic starts where that lane ends, so a card is never read *through* and a graphic is never read *under*. Chapter nine mirrors it — cards right, chart left — because that chapter reads left-to-right into the future and the observed 2026 months sit at the left edge. Below 900 px the two share the pin vertically instead: the figure takes the upper band, and the card sticks to the foot of the viewport for the length of its step rather than drifting up through the chart.

**2. Graphics fill the frame they are given.** `src/lib/components/Figure.svelte` is the one chrome every sticky graphic wears — title, subtitle, body, foot (caveat + source) — and the body measures itself and hands its pixel height to the chart, which sizes its viewBox to match. Fixed-aspect geometry (the maps, the elevation profile) declares its ratio with `fit` so the body is capped at the height that graphic can actually use and the figure centres as a block; the mirror chart caps at `maxHeight` so its two bands stay within one eye-drop. The Pacific map, which is 2.5:1, crops to the stretch the story uses when the figure is too narrow to render the whole basin legibly.

**3. Colour means one thing.** The warm and cool arms are the ENSO axis and its direct consequences — nothing else. Every other measured series (sea level, crop yield, the station count, emissions) is drawn in `series[mode].record`, the neutral measured-series ink, so a rising sea and a growing monitoring network are not quietly painted "the drought colour".

**4. Nine chapters need wayfinding.** `ChapterNav.svelte` is the piece's only chrome: a hairline progress fill, the name of the chapter you are in, and a contents panel that jumps to any of the eleven anchors. Each step card carries an `n/N` counter, so a pinned scene no longer hides how long it runs.

- SvelteKit (Svelte 5) + `@sveltejs/adapter-static` — fully static, no SSR at runtime, deployed to GitHub Pages by `.github/workflows/deploy.yml` (`BASE_PATH` env drives `paths.base`; all URLs go through `$app/paths`).
- Scroll orchestration: [scrollama], wrapped once in `src/lib/components/ScrollScene.svelte` (pin + 0–1 progress + lazy scene-scoped JSON loading + the card column via its `flow` snippet). `src/lib/scrolly.js` holds the one card convention: N cards → runway of `LEAD_VH + N·SLOT_VH`, active card = nearest slot centre. `SLOT_VH` is under 100 (a card does not need a full screen of travel to be read) and the runway ends shortly after the last card instead of parking an empty viewport of graphic at the end of every chapter — together those trim roughly a sixth off a nine-chapter scroll. `SLOT_VH` is mirrored into CSS as `--slot-vh`; the two must stay equal.
- Charts and maps: hand-authored SVG via small reusable components — `AnnualLines`, `EnsoBars`, `MirrorBars`, `DotUnits`, plus `PacificMap`, `PngMap` and `IslandProfile` (all geometry pre-projected by the pipeline; no geo library ships to the client). D3 for scales/shapes only.
- Interactives: `RiverDry` (range slider) and `FrostNight` (radiogroup toggle) are self-contained "field note" sections. **The scroll alone tells the complete story** — append `?notap=1` and every optional control disappears, each figure freezing at its full-drought state.
- Static animation: the hero's two-depth CSS rain field and opening choreography (type settles in, the highlights wipe on, a single drop falls down the scroll cue), chart draw-ins, the warm pool's slide, layer crossfades, and one shared entrance convention for editorial blocks (`src/lib/reveal.js` — chapter heads, big stats and shelf cards settle up into place once, on approach) — all disabled or frozen under `prefers-reduced-motion`, and never present in the prerendered HTML.
- Wayfinding & tactility: the chapter rail described above (hidden over the hero), a whisper of SVG paper grain over the whole surface (excluded from print), and the ONI-band ornament growing from its baseline as it enters view. The hero states the commitment up front — nine chapters, about fifteen minutes.
- `src/lib/palette.js` is the **single source of truth for every color**.

## Accessibility & performance

- Every chapter has a prose equivalent: always in the accessibility tree, visually revealed by the "Read scene text" toggle (which stays hidden until the reader scrolls to content it can act on).
- `prefers-reduced-motion` removes the rain fields and all self-running motion; scroll-driven state changes (user-initiated) remain.
- Charts and illustrated figures have `role="img"` labels that follow their interactive state; data charts also ship a collapsible table fallback.
- External links (the paper trail) load nothing on the page — no embeds, no trackers.
- The epilogue (the whole record) prints to one page.
- Budget: per-scene JSON is small (≤ ~39 KB for the shared map geometry, most far smaller) and fetched lazily as scenes approach.

## Files

```text
src/
  routes/                 SvelteKit page(s) — the single scrolling route
  lib/
    components/            Figure, ScrollScene, ChapterNav, RiverDry, FrostNight, ...
    components/scenes/      per-chapter chart/map components (AnnualLines, EnsoBars, MirrorBars, DotUnits, PacificMap, PngMap, IslandProfile)
    generated/              now-copy.js — chapter 9 prose, written by the pipeline
    scrolly.js              shared scroll/runway/card convention
    reveal.js                shared entrance-animation convention
    palette.js               single source of truth for every color
prep/
  make_real_data.mjs       builds static/data/*.json from the source CSVs
  make_maps.mjs            builds static/data/scene_map.json from Natural Earth
  fetch_nino34.py          re-exports the NOAA PSL Niño 3.4 monthly series
  source/                  raw CSVs (SPC dataflow export, ONI, Niño 3.4)
static/data/               generated JSON consumed by the client
.github/workflows/deploy.yml   static build → gh-pages branch → GitHub Pages
```

## Develop

```bash
npm install
node prep/make_real_data.mjs   # rebuild static/data/*.json from the source CSVs
node prep/make_maps.mjs        # rebuild static/data/scene_map.json (downloads Natural Earth on first run)
npm run dev                    # local, base ''
npm run build                  # static build in build/
BASE_PATH=/repo-name npm run build   # as deployed to Pages
```

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**Neo Malesa** — [n30dyn4m1c](https://github.com/n30dyn4m1c)

[scrollama]: https://github.com/russellsamora/scrollama
</content>
</invoke>

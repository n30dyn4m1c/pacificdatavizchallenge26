# The Ocean Knows First

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![SvelteKit](https://img.shields.io/badge/SvelteKit-Svelte%205-FF3E00.svg)
[![Live](https://img.shields.io/badge/Live-GitHub%20Pages-222222.svg)](https://n30dyn4m1c.github.io/pacificdatavizchallenge26/)

**An interactive scrollytelling entry for the Pacific Data Viz Challenge 2026**, built on the official SPC climate record for Papua New Guinea.

Papua New Guinea's worst droughts begin seven thousand kilometres away, in the temperature of the equatorial Pacific — months before the rain fails. The piece explains that signal, shows what it does to PNG at every altitude (dry tanks, stranded barges, scorched gardens, highland frost, then floods when the rain returns), and reads the El Niño now developing in 2026 against its four strongest precedents. It ends with a practical preparation calendar: what to do, and when.

**Live:** [n30dyn4m1c.github.io/pacificdatavizchallenge26](https://n30dyn4m1c.github.io/pacificdatavizchallenge26/)

## The story

Nine scroll-pinned chapters, in three acts:

1. **The mechanism** — the warm pool and the Niño 3.4 region (real Natural Earth coastlines), an underwater cross-section of the trade-wind engine, and the Oceanic Niño Index since 1979.
2. **The consequences** — PNG's rainfall against the ONI (8 of the 10 driest years are El Niño years, r = −0.64), the island in cross-section at every altitude, the harvest record, the floods that follow the drought, and the documented coverage of 1997 and 2015.
3. **The present** — the long warming record, per-capita emissions (PNG ≈ 1 t vs world ≈ 6.6 t), the monitoring network that called the 2026 event, and chapter nine: the 2026 El Niño month by month against 1982/1997/2015/2023, with a clearly-labelled analogue estimate of the months ahead, checked against the official NOAA CPC/IRI and WMO outlooks. The piece closes on a preparation calendar (hard months to ~March 2027, floods around May–June 2027) with four concrete jobs and a live "you are here" needle.

Two interactive field notes (a drying-river slider, a highland frost-night toggle) illustrate the drought mechanisms; both are labelled illustrations, and `?notap=1` freezes every interactive at its full-drought state so the scroll alone tells the complete story.

## Data

The charts are the official Challenge dataset: the Pacific Community (SPC) climate-change indicators, dataflow `SPC:DF_CLIMATE_CHANGE(1.0)`, exported from the Pacific Data Hub ([stats.pacificdata.org](https://stats.pacificdata.org/)) and filtered to Papua New Guinea. Annual, national-level observations, used unaltered. No synthetic data presented as observation.

Documented companions supply what a national dataset cannot:

- **NOAA CPC Oceanic Niño Index** (`prep/source/oni_cpc.csv`) — names the El Niño years. *Transcribed table; verify against the NOAA page before submission — see `prep/README.md`.*
- **NOAA PSL Niño 3.4 monthly anomalies** (`prep/source/nino34_monthly.csv`, re-exportable with `prep/fetch_nino34.py`) — chapter 9's monthly series, 1970 → July 2026.
- **NOAA CPC / IRI and WMO outlooks, early August 2026** — the official expectations quoted beside chapter 9's estimate, with source URLs in the JSON.
- **NOAA CPC weekly Niño 3.4 index, week centred 15 July 2026 (≈ +2.1 °C)** — one quoted reading, drawn as a ringed marker, never joined to the monthly line (a different product on a different SST basis).
- **EDGAR (EC-JRC)** — the world-average GHG-per-capita reference (≈6.6 t CO₂e, 2023) in chapter 7.
- **Natural Earth** (public domain) — coastlines and rivers, pre-projected by `prep/make_maps.mjs`.

All correlations and rankings (r = +0.48, r = −0.64, the driest-ten list, the analogue weights) are computed by the pipeline (`prep/make_real_data.mjs`), not asserted by hand. Chapter 9's one forward-looking panel is an *analogue estimate*: the four precedents aligned by calendar month and weighted by fit against 2026's observed months, drawn dashed inside their min–max envelope, labelled as an estimate on the graphic, in the legend and in the table view. The chapter also shows that estimate being beaten (the mid-July weekly reading sits above the whole envelope) and draws the anchored variant that starts the same four trajectories from 2026's own level — so the precedents read as a floor, not a ceiling.

Chapter 9's prose is generated too: the pipeline writes `src/lib/generated/now-copy.js`, which the components import at build time, so the cards, aria-labels, captions and the closing `BigStat` always quote the same numbers as the chart. Re-running the pipeline after NOAA appends a month updates copy and chart together.

Where the record is coarse, the chart says so: the SPC sea-level series is published to 0.1 m and is drawn as steps with a dot per published value, with the resolution named on the graphic.

## Design & stack

Light editorial scrollytelling (pudding.cool register): one warm paper surface, Fraunces display type, white step cards advancing a sticky graphic. Colour means one thing throughout: warm = El Niño / dry, cool = La Niña / wet; every other series uses a neutral ink.

- SvelteKit (Svelte 5) + `@sveltejs/adapter-static`, deployed to GitHub Pages by `.github/workflows/deploy.yml` (`BASE_PATH` env drives `paths.base`).
- Scroll orchestration: [scrollama](https://github.com/russellsamora/scrollama), wrapped once in `src/lib/components/ScrollScene.svelte`; the card/runway convention lives in `src/lib/scrolly.js` (`SLOT_VH` is mirrored into CSS as `--slot-vh`; keep them equal).
- Hand-authored SVG charts and maps (D3 for scales/shapes only; all geometry pre-projected by the pipeline — no geo library ships to the client).
- Two lanes, never an overlay: on wide screens the card column owns a reserved lane (`--card-lane`) and the graphic starts where it ends; below 900 px the pin splits vertically, graphic on top, card at the foot.
- `src/lib/palette.js` is the single source of truth for every colour.

## Accessibility & performance

- Every chapter has a prose equivalent in the accessibility tree, visually revealed by the "Read scene text" toggle.
- `prefers-reduced-motion` removes all self-running motion (rain, wash, pulses, count-ups, tweens); scroll-driven state changes remain.
- Charts carry `role="img"` labels that follow their state, plus collapsible data-table fallbacks.
- External links load nothing on the page — no embeds, no trackers.
- Per-scene JSON is small and fetched lazily as scenes approach; the epilogue prints to one page.

## Files

```text
src/
  routes/                 the single scrolling route
  lib/
    components/           Figure, ScrollScene, ChapterNav, RiverDry, FrostNight, ...
    components/scenes/    the per-chapter sticky graphics
    generated/            now-copy.js — chapter 9 prose numbers, written by the pipeline
    scrolly.js            the card/runway convention
    reveal.js             the shared entrance-animation convention
    palette.js            every colour, once
prep/
  make_real_data.mjs      builds static/data/*.json and src/lib/generated/now-copy.js
  make_maps.mjs           builds static/data/scene_map.json from Natural Earth
  fetch_nino34.py         re-exports the NOAA PSL Niño 3.4 monthly series
  source/                 raw CSVs (SPC export, ONI, Niño 3.4)
static/data/              generated JSON consumed by the client
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

MIT — see [LICENSE](LICENSE).

## Author

**Neo Malesa** — [n30dyn4m1c](https://github.com/n30dyn4m1c)

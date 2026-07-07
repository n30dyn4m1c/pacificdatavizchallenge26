# /prep — data pipeline

The front end never computes anything from raw data: every scene reads one
small, scene-scoped JSON from `static/data/`, pre-baked here from the source
files below. There is no synthetic data in this project.

## Sources

### 1. `source/SPC_DF_CLIMATE_CHANGE.csv` — the official dataset (~90 % of the piece)

The official Pacific Data Viz Challenge 2026 dataset: the Pacific Community
(SPC) `DF_CLIMATE_CHANGE(1.0)` dataflow, exported from the Pacific Data
Hub's .Stat Explorer (<https://stats.pacificdata.org/>). It is **annual,
national-level** data — one observation per indicator, per country/territory,
per year — covering 22 Pacific countries and territories and 13
climate-change indicators, with coverage running (for some indicators) back
to 1850. The CSV is committed so the pipeline is fully reproducible offline.

### 2. `source/oni_cpc.csv` — the Oceanic Niño Index (NOAA CPC)

The one series in the piece not from the SPC dataflow: for each year
1979–2025 (the span of PNG's rainfall record), the **peak ONI of the ENSO
season developing in that year** (its Jun–Feb window) and the CPC episode
classification (`elnino` / `lanina` / `neutral`; 2025 is `pending` — that
season's column was still being written at extraction, which the reveal
scene renders as an open "?").

> ⚠️ **Transcribed table — verify before submission.** This file was
> transcribed from the NOAA CPC ONI record
> (<https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php>)
> because the build environment could not reach noaa.gov. The episode
> classifications are robust; individual peak values should be checked to
> ±0.1 °C against that page (a five-minute job) and corrected in place —
> then re-run the pipeline. Nothing else in the repo hardcodes ONI values
> except the decorative `OniBand` divider.

### 3. One reference number — world-average emissions

Chapter 7 marks a single reference value of **≈6.6 t CO₂e per person**
(world average, 2023), from EDGAR — the European Commission JRC's Emissions
Database for Global Atmospheric Research
(<https://edgar.jrc.ec.europa.eu/report_2024>). It is written into
`scene_gap.json` by this script with its source attached. Verify/update the
value when EDGAR publishes a newer edition.

## Script

`make_real_data.mjs` (Node, no install step beyond the repo's deps —
`node prep/make_real_data.mjs` from the repo root) reads the SPC CSV with a
quote-aware parser, extracts **Papua New Guinea** (`GEO_PICT = "PG"`) for
every indicator, joins the ONI table, computes every derived statistic the
piece quotes — the driest-year rankings, r(local SST, rain) = +0.48,
r(ONI, rain) = −0.64, the El Niño count among the driest ten, the mean
rainfall anomaly by ENSO phase — and writes:

| output | chapter | contents |
|---|---|---|
| `pg_climate.json` | (foundation) | every PG indicator series + regional context + ONI + all source blocks |
| `scene_reveal.json` | Ch. 2–3 | {year, oni, phase, rain} + r_oni + driest-ten phases + phase means |
| `scene_cost.json` | Ch. 5 | crop yield 1961–2024 + the drought years |
| `scene_exposure.json` | Ch. 6 | SST 1850–2025 + sea level 1993–2023 + r_local (the "alibi") |
| `scene_gap.json` | Ch. 7 | GHG per capita 1970–2024 + the EDGAR world reference |
| `scene_watch.json` | Ch. 8 | meteorological monitoring network 1951–2026 |
| `scene_record.json` | Epilogue | small multiples: six PG indicators with first/last values |

Re-running the script rewrites `static/data/`. To update the
piece when SPC republishes the dataflow, re-export the CSV from .Stat
Explorer, drop it in `source/`, and re-run; same for the ONI table.

A second script, `make_maps.mjs`, builds `scene_map.json` for the two map
chapters (1 and 4): real **Natural Earth** coastlines and rivers (public
domain), downloaded into `source/naturalearth/` on first run (not
committed — several MB), pre-projected to plain equirectangular SVG paths
and Douglas-Peucker simplified so no geo library ships to the client. The
highlands band on the country map is an illustrative marker, not a DEM,
and is labelled as such in the scene.

## Rules

1. **Real data only.** Every numeric value in `static/data/` traces to a
   row in one of the committed source files (or, for `scene_map.json`, to
   Natural Earth geometry). The illustrative elements in the piece — the
   warm-pool motion on the map, the elevation profile, the two field-note
   interactives, the aftermath hillside — are explicitly labelled
   illustrations on the graphic itself and carry no dataset numbers.
2. Keep every scene file small (the audience is on 3G); derive from the
   foundation file rather than re-parsing the CSV in the front end.
3. Never ship a derived quantity computed in the browser — every statistic
   the copy quotes (correlations, rankings, phase means) is computed here
   and written into the scene JSON.
4. State the caveats in the piece, not just the code: national annual
   averages blunt extreme events, and PNG's local sea-surface anomaly is not
   the El Niño (Niño 3.4) signal — the piece leans on that mismatch
   (chapters 1–3 and chapter 6's "alibi" card), not around it.

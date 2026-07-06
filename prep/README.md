# /prep — data pipeline

The front end never computes anything from raw data: every scene reads one
small, scene-scoped JSON from `static/data/`, pre-baked here from the **real
official source**. There is no synthetic data in this project.

## Source

`source/SPC_DF_CLIMATE_CHANGE.csv` — the official Pacific Data Viz Challenge
2026 dataset: the Pacific Community (SPC) `DF_CLIMATE_CHANGE(1.0)` dataflow,
exported from the Pacific Data Hub's .Stat Explorer
(<https://stats.pacificdata.org/>). It is **annual, national-level** data —
one observation per indicator, per country/territory, per year — covering 22
Pacific countries and territories and 13 climate-change indicators, with
coverage running (for some indicators) back to 1850. The CSV is committed so
the pipeline is fully reproducible offline.

## Script

`make_real_data.mjs` (Node, no install step beyond the repo's deps —
`node prep/make_real_data.mjs` from the repo root) reads that CSV with a
quote-aware parser, extracts **Papua New Guinea** (`GEO_PICT = "PG"`) for
every indicator, computes a Pacific-wide mean-per-year context trace for the
anomaly indicators, and writes:

| output | contents |
|---|---|
| `pg_climate.json` | tidy foundation: every PG indicator series + regional context means + the source block |
| `scene1_sst.json` | annual SST anomaly 1850–2025, each year quantized to a uniform grid for the shader |
| `scene2_temps.json` | SST anomaly + land-surface anomaly (both 1850–2025) + Pacific-average ghost |
| `scene3_rain.json` | rainfall anomaly 1979–2025, with the four driest years flagged |
| `scene4_impact.json` | crop yield 1961–2024 + rainfall, with the driest years |
| `scene5_garden.json` | **illustrative only** — the frost-night diagram's copy; no data claim, no source |
| `scene6_justice.json` | GHG per capita + sea-level anomaly + SST (the climate-justice contrast) |
| `scene7_record.json` | small-multiples: six PG indicators with first/last values |
| `../static/posters/sst_{cool,warm}.png` | scene 1's no-WebGL fallback (coolest year / record 2025), through the shared palette |

Re-running the script rewrites `static/data/` and the posters. To update the
piece when SPC republishes the dataflow, re-export the CSV from .Stat
Explorer, drop it in `source/`, and re-run.

## Rules

1. **Real data only.** Every value in `static/data/` traces to a row in the
   source CSV, except `scene5_garden.json`, which is a labelled illustration
   (a diagram of radiative frost) and is marked `illustrative: true`.
2. Keep every scene file small (the audience is on 3G); derive from the
   foundation file rather than re-parsing the CSV in the front end.
3. Never ship a derived quantity computed in the browser — pre-shape it here.
4. State the caveats in the piece, not just the code: national annual
   averages blunt extreme events, and PNG's local sea-surface anomaly is not
   the El Niño (Niño 3.4) signal — see scene 3's tap-reveal.

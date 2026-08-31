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

> ⚠️ **One unit label is corrected, with the reasoning carried into the
> piece.** The dataflow publishes the precipitation-anomaly series
> (`RAIN_ANOM`) with unit measure `MM`, but at these magnitudes the values
> are implausible as millimetres of rain: every country's series hovers
> around zero within roughly ±20–70 (PNG's spans −26.7…+22.0), while mean
> annual rainfall across the Pacific runs to thousands of millimetres a year
> and real mm-scale national anomalies run to hundreds. The series is
> evidently a relative anomaly index (percentage-of-normal or standardized)
> regardless of its published unit label. The pipeline therefore passes the
> values through **real and unaltered**, attaches the dataflow's own unit as
> `published_unit`, and the piece plots and describes them as **index
> points** — stated on the graphic, in the prose and in the colophon.
> Rankings and correlations (which are invariant to any monotone relabel)
> are unaffected. The pipeline writes the decision into
> `scene_reveal.json` as `rain_series`.

### 2. `source/oni_cpc.csv` — the Oceanic Niño Index (NOAA CPC)

The one series in the piece not from the SPC dataflow: for each year
1979–2025, the **peak ONI of the ENSO
season developing in that year** (its Jun–Feb window, JJA–NDJ plus the
following DJF) and the CPC episode classification (`elnino` / `lanina` /
`neutral`). Read from CPC's published ONI table on **26 August 2026** — now the
**ERSSTv6** edition (<https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/>;
the v5 page it replaced redirects there). The 2025–26 season, left `pending`
on 26 August, was **completed on 31 August 2026** from the same live table:
its final value (DJF 2026, −0.4) is published, the season peaked at **−0.6**
(SON/OND/NDJ 2025), and it is classified **weak La Niña** — the same
convention the table's own marginal events follow (2016 and 2024 both read
`lanina` at −0.5), and the classification the piece's chapter nine already
describes ("a weak La Niña through 2024 and 2025"). Completing the year
moves r(ONI, rain) from −0.640 (n=46) to −0.642 (n=47), still −0.64 at one
decimal, and the "other years" rainfall mean from +3.5 to +3.8 points; the
driest-ten list is unchanged (8 El Niño years).

> Note on the version change: the earlier commit of this file was transcribed
> from the ERSSTv5 table. NOAA has since moved the canonical table to ERSSTv6,
> and individual seasons shift by up to ~±0.3 between versions. The refresh was
> checked end-to-end: no year's episode class changes, the driest-ten El Niño
> count stays at 8, and r(ONI, rain) moves only from −0.641 to −0.642. The four
> headline events read +2.1 (1982), +2.4 (1997), +2.6 (2015), +2.0 (2023).

### 3. `source/nino34_monthly.csv` — monthly Niño 3.4 anomalies (NOAA PSL)

Chapter nine runs at monthly resolution, and this is its series: the
**monthly mean SST anomaly for the Niño 3.4 region** (5°N–5°S, 170°–120°W)
from the NOAA Physical Sciences Laboratory
(<https://psl.noaa.gov/data/correlation/nina34.anom.data>), 1970 through
July 2026 (the PSL teleconnection indices are **ERSST-based**). `fetch_nino34.py`
re-exports it (NOAA marks unobserved months
`-99.99`; the script drops them). When NOAA appends a month, re-run the
fetch and the pipeline: the "2026 so far" line, the analogue estimate, its
weights and the timing brackets all recompute.

From this series the pipeline computes chapter nine's **analogue
estimate** — the piece's only forward-looking numbers, and it is labelled
as an estimate on the graphic and in the legend. Method, in full: align
the four great El Niños (1982, 1997, 2015, 2023) by calendar month over
Jan(onset)–Jun(onset+1); weight each by inverse RMSE against 2026's
observed months to date (January–July); the dashed path is the weighted mean of the four
trajectories, the band their min–max envelope. Nothing is tuned by hand.

A second, **anchored** variant is computed alongside it
(`analogue.anchored`, `analogue.anchored_peak`): the same four
trajectories, but each shifted so that it starts at 2026's observed
anchor month instead of its own level — same shapes, higher start. It is
computed because 2026 sits *above* all four precedents at the anchor, so
the level-based path would otherwise be read as a ceiling. The chart's band
and headline dashed path stay level-based — that is what was actually
measured — and the anchored path appears only from the chapter's scoring
card onward, as a lighter dashed line with no band of its own, so the
graphic never carries two envelopes at once. Its peak (≈ +2.6 °C) is
quoted in the copy.

> ⚠️ **Two cited numbers in this chapter, and how they were checked.**
> The build environment's egress policy blocks `noaa.gov`, `iri.columbia.edu`
> and `wmo.int`, so `fetch_nino34.py` could not be re-run and the `official`
> block below was read from the published outlooks and the reporting on them
> rather than fetched (it carries its source URLs in `scene_now.json` and an
> `as_of` / `verify` field). The `latest_reading` block, by contrast, was
> **verified live on 31 August 2026** from CPC's published weekly SST table
> (<https://www.cpc.ncep.noaa.gov/data/indices/wksst9120.for>): the last
> published week is centred **19 August 2026, +2.6 °C**. The monthly series
> still ends at July 2026 — PSL has not yet published August — so the
> observed line, the analogue weights and the timing brackets are unchanged;
> only the cited reading moved, and it now sits beyond the observation, so
> the estimate-vs-reading comparison is live for the first time. Re-check
> both blocks when a newer discussion (10 September 2026) or monthly value
> lands.

- `official` — the **NOAA CPC / IRI outlook and the WMO update of early
  August 2026**: El Niño Advisory in effect; continuation into early 2027
  ≈97%; a very strong peak (Niño 3.4 ≥ +2.0 °C) in late 2026 now the
  central expectation (reported odds for the Oct–Dec / Nov–Jan window run
  60–80%, which is why the scene quotes the direction rather than a single
  percentage); further intensification expected through Aug–Oct. This
  replaced the mid-June 2026 outlook, which read "strong".
- `latest_reading` — the **CPC weekly Niño 3.4 index for the week centred
  19 August 2026, +2.6 °C** (read from `wksst9120.for` on 31 August 2026;
  the week centred 12 August read +2.7 °C). This is a *different product on
  a different SST basis* (**OISST**) from the monthly **ERSST-based** series
  the chart draws, so it is never appended to `nino34_monthly.csv` and never
  joined to the plotted line:
  the scene draws it as a ringed, unconnected marker that names itself as
  a quoted weekly value. The pipeline also records whether it falls above
  the estimate's envelope for the same month (`vs_estimate`) — as of this
  writing it does, which is the point chapter nine now makes.

### 4. One reference number — world-average emissions

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
| `scene_now.json` | Ch. 9 | monthly Niño 3.4: recent months 2023–26, the four great events aligned by month, 2026 so far, the analogue estimate + weights + anchored variant, timing windows, the official-outlook citation, the latest cited weekly reading |
| `scene_record.json` | Epilogue | small multiples: six PG indicators with first/last values |

It also writes one JavaScript module, `src/lib/generated/now-copy.js`.
Scene JSON is fetched lazily as a scene approaches — right for a chart,
wrong for a sentence: a card that read its own numbers from that fetch
would render numberless in the prerendered HTML and for anyone without
JavaScript. So every number chapter nine's *copy* quotes — the cards, the
prose equivalent, the chart's aria-label, the figure title, the table
caption, the `BigStat` on the page and the colophon — is baked into that
module and imported at build time. Nothing is hand-typed twice: re-running
this script is the whole update. Do not edit the module by hand.

Re-running the script rewrites `static/data/` and that module. To update the
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

1. **Real data only — and the one estimate says it is one.** Every numeric
   value in `static/data/` traces to a row in one of the committed source
   files (or, for `scene_map.json`, to Natural Earth geometry), with two
   documented exceptions: the reference citations (EDGAR; the CPC/IRI/WMO
   outlook points; the cited weekly Niño 3.4 reading) carry their source
   URLs in the JSON and are drawn as citations rather than as series
   members — a quoted number never joins a plotted line — and chapter nine's
   analogue estimate is computed here by the published method above and
   labelled as an estimate on the graphic, in the legend and in the data
   table. The illustrative elements in the piece — the warm-pool motion on
   the map, the elevation profile, the two field-note interactives, the
   aftermath hillside — are explicitly labelled illustrations on the
   graphic itself and carry no dataset numbers.
2. Keep every scene file small (the audience is on 3G); derive from the
   foundation file rather than re-parsing the CSV in the front end.
3. Never ship a derived quantity computed in the browser — every statistic
   the copy quotes (correlations, rankings, phase means) is computed here
   and written into the scene JSON.
4. State the caveats in the piece, not just the code: national annual
   averages blunt extreme events, and PNG's local sea-surface anomaly is not
   the El Niño (Niño 3.4) signal — the piece leans on that mismatch
   (chapters 1–3 and chapter 6's "alibi" card), not around it.

# /prep — data pipeline

The front end never computes anything from raw data: every scene reads one
small, scene-scoped JSON from `static/data/`, pre-baked here. **All files
currently in `static/data/` are synthetic placeholders** written by
`make_synthetic.mjs` (Node, no dependencies — `node prep/make_synthetic.mjs`
from the repo root). The Python pipeline in `make_scene_data.py` replaces
them with real data **in identical shapes** — the JSON contracts are the
interface, documented as docstrings in that file and summarized below.

## Scripts

| script | status | input | output |
|---|---|---|---|
| `make_synthetic.mjs` | working | `manual/` files (real) + procedural (synthetic) | every file below, plus the two no-WebGL poster PNGs in `static/posters/` |
| `make_scene_data.py` | stub with TODOs | sources listed per function + `manual/` files | same files, real data |

## Manual inputs (`prep/manual/`) — NOT synthetic

Hand-maintained editorial files that BOTH pipelines merge into the scene
JSONs. These survive the synthetic → real pipeline swap unchanged:

- **`dews_status.csv`** — `province, status (watch|alert|critical), bulletin_date,
  source_url`. The official PNG-NWS/NARI three-tier Drought Early Warning
  System status per province (**Drought Watch → Drought Alert → Drought
  Critical**), re-keyed from each monthly Drought Update bulletin. Provinces
  absent from the bulletin carry no advisory. Merged into
  `scene6_forecast.json` and `scene7_calendar.json` as the `dews` block.
- **`reported_copy.json`** — verified reported copy woven into the narrative
  (Gembogl frost, kaukau food-energy share, disaster trust accounts, the PM
  directive), each with its source; merged into scenes 5/6/7 with the source
  in `_meta`. One idea per step — do not add stats here without a step to
  carry them.
- **`tokpisin_strings.json`** — every Tok Pisin string in the piece, all
  `status: "unverified"` until the editor signs each one off. Usage sites in
  `src/` carry matching TODO-VERIFY comments.

### Monthly update procedure (while the event runs)

When the new PNG-NWS/NARI monthly Drought Update bulletin lands
(https://www.nari.gov.pg/, usually mid-month):

1. Update `manual/dews_status.csv`: re-key every province's status from the
   bulletin's map/table, set `bulletin_date` (YYYY-MM) and `source_url` to
   the new PDF on every row.
2. Update the forecast snapshot with the same month's IRI/CPC plume — today
   that means the synthetic plume in `make_synthetic.mjs`; once the real
   pipeline lands it is `manual/forecast_snapshot.json` consumed by
   `make_scene_data.py` (`make_scene6_forecast`).
3. Re-run the pipeline (`node prep/make_synthetic.mjs`, later
   `python prep/make_scene_data.py`) — this rewrites `static/data/`.
4. Redeploy. The Scene 7 "now" marker needs NO update — the current month is
   computed client-side in Pacific/Port_Moresby time.

## Output contracts (`static/data/`)

- **`scene1_sst_field.json`** — monthly equatorial-Pacific SST anomaly
  fields, Jun 2025 → present. Texture-encoding choice (documented): instead
  of per-month PNG textures, each month is a 72×24 byte grid (lon 120°E–290°E,
  lat 18°S–18°N; `°C = (byte − 128) / 40`) stored base64 in the JSON index —
  ~27 KB for 13 months, decoded straight into WebGL LUMINANCE textures.
  Fields: `w, h, lon, lat, scale, offset, months[{date, oni}], latest, grids[]`.
  Source: NOAA OISST v2.1 (or ERSSTv5), regridded and quantized.
- **`scene2_oni_history.json`** — `{ events: [{ name, series: [{month, oni,
  forecast?}] }] }`, series aligned to January of each event's year 0.
  Source: CPC ONI table; current event appended from the latest CPC/IRI values.
- **`scene3_transect.json`** — `{ profile: [{km, elev}], bands: [{km, elev,
  label, band}] }`. Source: SRTM 30 m sampled along a Gulf-of-Papua →
  Mt Giluwe transect.
- **`scene4_lag.json`** — `{ onset, peak, observed_through, months: [{date,
  oni, forecast?, lowland_drought_index, highlands_frost_events,
  elevation_band, months_since_onset, months_since_peak}] }`. **All lag
  alignment happens here at prep time** — the front end only reads.
  Sources: ONI as above; CHIRPS SPI-3 for the Fly lowlands box; NDC /
  provincial frost-event reports (historically: 1997 & 2015 assessments).
- **`scene5_garden.json`** — `{ reported: {gembogl_frost: {text, sub},
  kaukau_energy: {text, sub}}, _meta: {…sources…}, indicators:
  [{traditional, satellite}], phase: {elevation_m, frost_threshold_c,
  night_temps_c[]}, hotspots:
  [{id, label, healthy: {title, body}, frosted: {title, body}}] }`.
  The `reported` block is verified copy from `manual/reported_copy.json`. Hotspot
  ids are fixed (`leaves|soil|tuber|sky|indicator`) — the front end anchors
  them into the hand-authored mound SVG. Sources: NARI / provincial DAL
  documentation (the `indicator` hotspot needs a locally VERIFIED
  early-warning sign — see TODO markers); a Highlands station frost-night
  record for the temperature curve.
- **`scene6_forecast.json`** — `{ dews: {bulletin_date, source, source_url,
  provinces: {name: status}}, mandate: {text}, _meta, current: {name,
  series}, plume: [{month, p10, p50, p90}], scenarios: {strong: {label,
  peak_oni, caption, plume}, moderate: {...}}, provinces: [{name,
  impact_type, window_start, window_end, confidence}] }`. Top-level `plume`
  equals `scenarios.strong.plume`. Sources: IRI/CPC ENSO plume (scenarios
  from the member spread); windows from NDC hazard mapping projected by the
  historical lags in scene 4; `dews` from `manual/dews_status.csv` (the
  official PNG-NWS/NARI Drought Update — drives the scene 6 choropleth).
- **`png_provinces.json`** — GeoJSON FeatureCollection of province polygons,
  `properties.name` matching scene 6/7 province names. Currently a synthetic
  low-poly placeholder (NOT real boundaries); replace with PNG NSO/GADM
  boundaries simplified to < 30 KB (mapshaper, ~5 % retention).
- **`scene7_calendar.json`** — `{ dews: {…as scene 6…}, governance: {text},
  _meta, provinces: [{name, actions: [{month, action, trigger, lead_agency,
  oni_threshold}]}] }`. `oni_threshold` is the ONI value the trigger
  references (null for non-ONI triggers); it drives the action → threshold
  connecting line in the calendar UI. Source: to be co-drafted with NDC and
  provincial DALs; triggers must reference verifiable indices. Each action's
  window state (closed/open/ahead) is computed CLIENT-SIDE from the device
  clock in Pacific/Port_Moresby — "now" deliberately has no pipeline
  dependency (dev override: `?now=YYYY-MM-DD`).

## Rules

1. A contract change requires updating BOTH `make_scene_data.py` docstrings
   and the front-end scene that reads the file — treat shapes as frozen.
2. Keep every file small (target < 40 KB before gzip; the audience is on 3G).
3. Never ship a derived quantity computed in the browser — pre-align here.
4. Every synthetic value that must come from this pipeline (or from source
   verification) carries a `"_synthetic": true` key on its containing
   object — `grep -r '_synthetic' static/data` lists what remains.

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
| `make_synthetic.mjs` | working | none (procedural) | every file below, plus the two no-WebGL poster PNGs in `static/posters/` |
| `make_scene_data.py` | stub with TODOs | sources listed per function | same files, real data |

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
- **`scene5_garden.json`** — `{ indicators: [{traditional, satellite}],
  phase: {elevation_m, frost_threshold_c, night_temps_c[]}, hotspots:
  [{id, label, healthy: {title, body}, frosted: {title, body}}] }`. Hotspot
  ids are fixed (`leaves|soil|tuber|sky|indicator`) — the front end anchors
  them into the hand-authored mound SVG. Sources: NARI / provincial DAL
  documentation (the `indicator` hotspot needs a locally VERIFIED
  early-warning sign — see TODO markers); a Highlands station frost-night
  record for the temperature curve.
- **`scene6_forecast.json`** — `{ current: {name, series}, plume: [{month,
  p10, p50, p90}], scenarios: {strong: {label, peak_oni, caption, plume},
  moderate: {...}}, provinces: [{name, impact_type, window_start,
  window_end, confidence}] }`. Top-level `plume` equals
  `scenarios.strong.plume`. Sources: IRI/CPC ENSO plume (scenarios from the
  member spread); windows from NDC hazard mapping projected by the
  historical lags in scene 4.
- **`png_provinces.json`** — GeoJSON FeatureCollection of province polygons,
  `properties.name` matching scene 6/7 province names. Currently a synthetic
  low-poly placeholder (NOT real boundaries); replace with PNG NSO/GADM
  boundaries simplified to < 30 KB (mapshaper, ~5 % retention).
- **`scene7_calendar.json`** — `{ provinces: [{name, actions: [{month,
  action, trigger, lead_agency, oni_threshold}]}] }`. `oni_threshold` is the
  ONI value the trigger references (null for non-ONI triggers); it drives
  the action → threshold connecting line in the calendar UI. Source: to be
  co-drafted with NDC and provincial DALs; triggers must reference
  verifiable indices.

## Rules

1. A contract change requires updating BOTH `make_scene_data.py` docstrings
   and the front-end scene that reads the file — treat shapes as frozen.
2. Keep every file small (target < 40 KB before gzip; the audience is on 3G).
3. Never ship a derived quantity computed in the browser — pre-align here.
4. Every synthetic value that must come from this pipeline (or from source
   verification) carries a `"_synthetic": true` key on its containing
   object — `grep -r '_synthetic' static/data` lists what remains.

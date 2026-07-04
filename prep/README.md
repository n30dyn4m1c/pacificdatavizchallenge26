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
- **`scene5_garden.json`** — `{ indicators: [{traditional, satellite}] }`.
  Source: NARI / provincial DAL documentation of traditional indicators,
  paired with the satellite product that observes the same phenomenon.
- **`scene6_forecast.json`** — `{ current: {name, series}, plume: [{month,
  p10, p50, p90}], provinces: [{name, impact_type, window_start, window_end,
  confidence}] }`. Sources: IRI/CPC ENSO plume; windows from NDC hazard
  mapping projected by the historical lags in scene 4.
- **`png_provinces.json`** — GeoJSON FeatureCollection of province polygons,
  `properties.name` matching scene 6/7 province names. Currently a synthetic
  low-poly placeholder (NOT real boundaries); replace with PNG NSO/GADM
  boundaries simplified to < 30 KB (mapshaper, ~5 % retention).
- **`scene7_calendar.json`** — `{ provinces: [{name, actions: [{month,
  action, trigger, lead_agency}]}] }`. Source: to be co-drafted with NDC and
  provincial DALs; triggers must reference verifiable indices.

## Rules

1. A contract change requires updating BOTH `make_scene_data.py` docstrings
   and the front-end scene that reads the file — treat shapes as frozen.
2. Keep every file small (target < 40 KB before gzip; the audience is on 3G).
3. Never ship a derived quantity computed in the browser — pre-align here.

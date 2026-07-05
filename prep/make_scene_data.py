"""make_scene_data.py — the real data pipeline (STUB).

Replaces every synthetic file written by make_synthetic.mjs with real data
in IDENTICAL shapes. Each function's docstring is the authoritative output
contract; the front end is written against these shapes and must not change
when this pipeline lands.

Run:  python prep/make_scene_data.py [--only scene4]
Writes into: static/data/  (and static/posters/ for scene 1's fallback)
"""

from __future__ import annotations

import json
import pathlib

DATA_DIR = pathlib.Path(__file__).resolve().parent.parent / "static" / "data"
POSTER_DIR = pathlib.Path(__file__).resolve().parent.parent / "static" / "posters"


def make_scene1_sst_field() -> None:
    """scene1_sst_field.json — monthly SST anomaly grids, Jun 2025 → present.

    Input: NOAA OISST v2.1 monthly anomalies (or ERSSTv5),
           https://www.ncei.noaa.gov/products/optimum-interpolation-sst
    Steps: subset lon 120E–290E, lat 18S–18N; regrid to 72×24 (area mean);
           quantize byte = round(anomaly_degC * 40) + 128, clipped to 0..255.

    Output contract:
    {
      "w": 72, "h": 24,
      "lon": [120, 290], "lat": [-18, 18],
      "scale": 0.025,            # °C per byte step (1/40)
      "offset": 128,
      "months": [{"date": "2025-06", "oni": -0.6}, ...],
      "latest": {"date": "YYYY-MM", "oni": float},
      "grids": ["<base64 of w*h bytes, row-major, south row first>", ...]
    }

    Also re-render static/posters/sst_cool.png and sst_warm.png (first and
    latest month) through src/lib/palette.js fieldColor — keep them visually
    identical to the shader output.
    """
    raise NotImplementedError("TODO: OISST download, regrid, quantize")


def make_scene2_oni_history() -> None:
    """scene2_oni_history.json — ONI traces for 1997–98, 2015–16, current.

    Input: CPC ONI table https://origin.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php
           plus the current IRI/CPC forecast for the flagged months.

    Output contract:
    {
      "events": [
        {"name": "1997–98", "series": [{"month": "Jan 97", "oni": -0.5}, ...]},
        {"name": "2015–16", "series": [...]},
        {"name": "2026–27 (current + forecast)",
         "series": [{"month": "Jan 26", "oni": 0.8},
                    {"month": "Jul 26", "oni": 1.9, "forecast": true}, ...]}
      ]
    }
    Series are aligned to January of each event's year 0 and truncated to
    18 months (Jan yr0 → Jun yr1).
    """
    raise NotImplementedError("TODO: parse ONI table, append forecast")


def make_scene3_transect() -> None:
    """scene3_transect.json — elevation transect, Gulf of Papua → Mt Giluwe.

    Input: SRTM 30 m (or Copernicus DEM GLO-30) sampled every ~8 km along
           the transect line; bathymetry from GEBCO for the offshore leg.

    Output contract:
    {
      "profile": [{"km": -80, "elev": -95}, ...],   # km along transect
      "bands": [{"km": float, "elev": float, "label": str, "band":
                 "ocean|lowlands|foothills|highlands|frostline"}, ...]
    }
    """
    raise NotImplementedError("TODO: DEM sampling")


def make_scene4_lag() -> None:
    """scene4_lag.json — THE CENTERPIECE. All lag alignment happens HERE.

    Inputs: ONI (as scene 2); CHIRPS monthly rainfall → SPI-3 over the Fly
            lowlands box (141–144E, 9.5–6S), rescaled to a 0–1 drought
            index; frost events from NDC / provincial reports (current
            event) and the 1997/2015 assessment records (validation).

    Output contract:
    {
      "onset": "2025-12",            # first month ONI >= +0.5
      "peak": "2026-12",             # ONI maximum (may be forecast)
      "observed_through": "YYYY-MM",
      "months": [
        {"date": "2025-06", "oni": -0.6, "forecast": true?,
         "lowland_drought_index": 0.04,      # 0..1
         "highlands_frost_events": 0,        # count, >2200 m
         "elevation_band": null | "lowlands <50 m" | "highlands >2200 m",
         "months_since_onset": -6,
         "months_since_peak": -18}, ...]
    }
    The front end never computes lags — every derived field ships here.
    """
    raise NotImplementedError("TODO: CHIRPS SPI, frost records, alignment")


def make_scene5_garden() -> None:
    """scene5_garden.json — the pop-up-book mound: indicators, phase, hotspots.

    Inputs: NARI & provincial DAL documentation (indicators + hotspot copy,
            each traditional indicator paired with the satellite product
            observing the same thing); a representative Highlands frost-night
            station record for the temperature curve (e.g. Tambul).

    Output contract:
    {
      "indicators": [{"traditional": str, "satellite": str}, ...],  # 4-6 pairs
      "phase": {
        "elevation_m": int,          # garden elevation of the illustration
        "frost_threshold_c": float,  # readout value that triggers the frost phase
        "night_temps_c": [float]     # air temp, evenly sampled dusk -> 4 a.m.
      },
      "hotspots": [
        {"id": "leaves"|"soil"|"tuber"|"sky"|"indicator",
         "label": str,                       # accessible name of the dot
         "healthy": {"title": str, "body": str},   # phase-1 card copy
         "frosted": {"title": str, "body": str}}   # phase-2 card copy
      ]
    }
    Hotspot ids are fixed: the front end anchors them to coordinates in the
    hand-authored SVG. The "indicator" hotspot's copy must cite a VERIFIED
    local early-warning indicator (see the TODO markers in the synthetic
    copy) and is presented with the same weight as the satellite data.
    Synthetic values carry "_synthetic": true until this pipeline lands.
    """
    raise NotImplementedError("TODO: sourced indicators, station night curve, verified hotspot copy")


def make_scene6_forecast() -> None:
    """scene6_forecast.json + png_provinces.json — plume and impact windows.

    Inputs: IRI/CPC ENSO prediction plume; NDC hazard mapping; historical
            lags from scene 4 project the windows. Province boundaries from
            PNG NSO or GADM, simplified with mapshaper to < 30 KB.

    Output contracts:
    scene6_forecast.json:
    {
      "current": {"name": str, "series": [{"month": str, "oni": float}]},
      "plume": [{"month": "Jul 26", "p10": 1.6, "p50": 1.9, "p90": 2.2}, ...],
      "scenarios": {                    # the scene's CompareToggle reads these;
        "strong":   {"label": str, "peak_oni": float, "caption": str,
                     "plume": [...same shape as top-level plume...]},
        "moderate": {"label": str, "peak_oni": float, "caption": str,
                     "plume": [...]}
      },                                # top-level plume == scenarios.strong.plume
      "provinces": [{"name": str, "impact_type": "drought"|"frost",
                     "window_start": "YYYY-MM", "window_end": "YYYY-MM",
                     "confidence": "high"|"medium"|"low"}, ...]
    }
    Scenario plumes come from the IRI/CPC plume member spread (e.g. members
    above/below the median peak); synthetic ones carry "_synthetic": true.
    png_provinces.json: GeoJSON FeatureCollection; properties.name must
    match scene 6/7 province names exactly.
    """
    raise NotImplementedError("TODO: plume parse, boundary simplify")


def make_scene7_calendar() -> None:
    """scene7_calendar.json — the anticipatory-action calendar.

    Input: co-drafted with NDC and provincial DALs. Every action must have
           a trigger that references a verifiable index (ONI, CHIRPS
           percentile, gauge level, confirmed frost report).

    Output contract:
    { "provinces": [{"name": str, "actions": [{"month": "Jul 26",
      "action": str, "trigger": str, "lead_agency": str,
      "oni_threshold": float | None}, ...]}, ...] }

    "oni_threshold" is the ONI value the trigger references (None when the
    trigger is a different index — CHIRPS percentile, gauge level, confirmed
    frost report). The front end uses it to draw the connecting line from a
    selected action back to the threshold on the ONI rail. Actions whose
    thresholds are not yet co-drafted carry "_synthetic": true.
    """
    raise NotImplementedError("TODO: co-drafted action tables")


if __name__ == "__main__":
    for fn in (
        make_scene1_sst_field,
        make_scene2_oni_history,
        make_scene3_transect,
        make_scene4_lag,
        make_scene5_garden,
        make_scene6_forecast,
        make_scene7_calendar,
    ):
        try:
            fn()
        except NotImplementedError as e:
            print(f"[stub] {fn.__name__}: {e}")

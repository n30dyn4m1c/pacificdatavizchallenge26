"""fetch_nino34.py — export the monthly Niño 3.4 anomaly series from NOAA PSL.

Fetches https://psl.noaa.gov/data/correlation/nina34.anom.data (monthly mean
SST anomaly for the Niño 3.4 region, 5°N–5°S / 170°–120°W), keeps 1970 to the
present, and writes prep/source/nino34_monthly.csv for make_real_data.mjs.
Future months are marked -99.99 by NOAA and skipped. Re-run when NOAA appends
a month, then re-run the pipeline.

Usage:  python prep/fetch_nino34.py
"""
import csv
import urllib.request

URL = "https://psl.noaa.gov/data/correlation/nina34.anom.data"
OUT = __file__.rsplit("/", 1)[0] + "/source/nino34_monthly.csv"

response = urllib.request.urlopen(URL)
lines = [line.decode("utf-8") for line in response.readlines()]

cleaned = []
for line in lines:
    parts = line.split()
    if not parts:
        continue
    try:
        year = int(parts[0])
        if 1970 <= year <= 2100:
            for month_idx, raw in enumerate(parts[1:13]):
                anomaly = float(raw)
                if anomaly == -99.99:  # month not yet observed
                    continue
                cleaned.append(
                    {
                        "date": f"{year}-{month_idx + 1:02d}",
                        "year": year,
                        "month": month_idx + 1,
                        "anomaly": anomaly,
                    }
                )
    except ValueError:
        continue  # NOAA's header/footer text

with open(OUT, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["date", "year", "month", "anomaly"])
    writer.writeheader()
    writer.writerows(cleaned)

print(f"wrote {OUT}: {len(cleaned)} months")

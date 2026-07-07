/**
 * make_real_data.mjs — REAL data pipeline (official source).
 *
 * Reads the official Pacific Data Viz Challenge 2026 dataset — the Pacific
 * Community (SPC) `DF_CLIMATE_CHANGE` dataflow, exported from the Pacific Data
 * Hub .Stat Explorer (https://stats.pacificdata.org/) — and emits the tidy
 * per-country annual series the scenes read. Papua New Guinea (GEO_PICT "PG")
 * is the focus country; a Pacific-wide mean per year is emitted as context.
 *
 * One small companion series is NOT from the SPC dataflow: the Oceanic Niño
 * Index (source/oni_cpc.csv, NOAA CPC — see prep/README.md), which the piece
 * uses to name the El Niño years. Everything else is the SPC record, annual
 * and national, real and unaltered. No synthetic data, no forecast.
 *
 * Run from the repo root:  node prep/make_real_data.mjs
 * Input:  prep/source/SPC_DF_CLIMATE_CHANGE.csv  (the .Stat CSV export)
 *         prep/source/oni_cpc.csv                (NOAA CPC ONI, transcribed)
 * Output: static/data/*.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SRC = new URL('./source/SPC_DF_CLIMATE_CHANGE.csv', import.meta.url).pathname;
const ONI_SRC = new URL('./source/oni_cpc.csv', import.meta.url).pathname;
const DATA = new URL('../static/data/', import.meta.url).pathname;
mkdirSync(DATA, { recursive: true });

const FOCUS = 'PG';
const FOCUS_NAME = 'Papua New Guinea';

// ── quote-aware CSV parser (one row has an embedded comma: "Micronesia, …") ──
function parseCsv(text) {
	const rows = [];
	let row = [];
	let field = '';
	let inQuotes = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') { field += '"'; i++; }
				else inQuotes = false;
			} else field += c;
		} else if (c === '"') inQuotes = true;
		else if (c === ',') { row.push(field); field = ''; }
		else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
		else if (c === '\r') { /* skip */ }
		else field += c;
	}
	if (field.length || row.length) { row.push(field); rows.push(row); }
	return rows;
}

// SDMX column indices in the .Stat CSV export.
const COL = {
	indicator: 6, indicatorName: 7, geo: 8, geoName: 9,
	year: 10, value: 12, unit: 17, errorType: 18, errorValue: 20
};

const rows = parseCsv(readFileSync(SRC, 'utf8'));
const header = rows.shift();
if (header[COL.value] !== 'OBS_VALUE')
	throw new Error(`unexpected column layout: OBS_VALUE not at ${COL.value} (got "${header[COL.value]}")`);

// ── collect: indicator -> {name, unit, byGeo: {geo -> {year -> {value, se}}}} ─
const ind = new Map();
for (const r of rows) {
	if (r.length < 18) continue;
	const code = r[COL.indicator];
	const raw = r[COL.value];
	if (raw === '' || raw == null) continue; // gaps carry no observation
	const value = Number(raw);
	if (!Number.isFinite(value)) continue;
	const year = Number(r[COL.year]);
	if (!Number.isFinite(year)) continue;

	if (!ind.has(code))
		ind.set(code, { name: r[COL.indicatorName], unit: r[COL.unit] || null, byGeo: new Map() });
	const entry = ind.get(code);
	if (!entry.byGeo.has(r[COL.geo])) entry.byGeo.set(r[COL.geo], new Map());
	const se = r[COL.errorType] === 'SE' && r[COL.errorValue] !== '' ? Number(r[COL.errorValue]) : null;
	entry.byGeo.get(r[COL.geo]).set(year, { value, se: Number.isFinite(se) ? se : null });
}

const seriesFrom = (yearMap) =>
	[...yearMap.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([year, o]) => (o.se == null ? { year, value: o.value } : { year, value: o.value, se: o.se }));

// Pacific-wide mean per year across all reporting countries (context trace).
const regionalMean = (entry) => {
	const acc = new Map(); // year -> {sum, n}
	for (const yearMap of entry.byGeo.values())
		for (const [year, o] of yearMap) {
			if (!acc.has(year)) acc.set(year, { sum: 0, n: 0 });
			const a = acc.get(year);
			a.sum += o.value; a.n++;
		}
	return [...acc.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([year, a]) => ({ year, mean: +(a.sum / a.n).toFixed(3), n: a.n }));
};

// ── the ONI companion series (NOAA CPC, transcribed — see prep/README.md) ───
const oniRows = parseCsv(readFileSync(ONI_SRC, 'utf8'));
oniRows.shift(); // header
const oni = oniRows
	.filter((r) => r.length >= 3 && r[0] !== '')
	.map((r) => ({
		year: Number(r[0]),
		oni: r[1] === '' ? null : Number(r[1]),
		phase: r[2]
	}));

const ONI_SOURCE = {
	name: 'Oceanic Niño Index (ONI) — NOAA Climate Prediction Center',
	url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php',
	note:
		'Peak ONI of the ENSO season developing in each year (Jun–Feb window) and the ' +
		'CPC episode classification. Transcribed table (see prep/README.md); the only ' +
		'series in the piece not from the SPC dataflow.'
};

// ── assemble the focus-country foundation file ──────────────────────────────
const indicators = {};
const regional = {};
for (const [code, entry] of ind) {
	const focus = entry.byGeo.get(FOCUS);
	if (focus) indicators[code] = { name: entry.name, unit: entry.unit, series: seriesFrom(focus) };
	// regional context only for the anomaly indicators the piece leans on
	if (['SST_ANOM', 'ST_ANOM', 'RAIN_ANOM', 'SEA_LVL'].includes(code))
		regional[code] = regionalMean(entry);
}

const SOURCE = {
	name: 'Pacific Community (SPC) — Climate Change indicators',
	dataflow: 'SPC:DF_CLIMATE_CHANGE(1.0)',
	hub: 'Pacific Data Hub .Stat Explorer',
	url: 'https://stats.pacificdata.org/',
	note: 'Official Pacific Data Viz Challenge 2026 dataset. Annual, national-level observations.',
	geo: FOCUS,
	geo_name: FOCUS_NAME,
	extracted: '2026-07-06'
};

const foundation = { source: SOURCE, oni_source: ONI_SOURCE, indicators, regional, oni };
const write = (name, obj) => {
	const json = JSON.stringify(obj);
	writeFileSync(DATA + name, json);
	console.log(`  wrote ${name.padEnd(22)} ${(Buffer.byteLength(json) / 1024).toFixed(1)} KB`);
};

console.log(`PG indicators available:`);
for (const [code, o] of Object.entries(indicators)) {
	const s = o.series;
	console.log(`  ${code.padEnd(26)} ${s.length} yrs ${s[0].year}–${s[s.length - 1].year}  (${o.unit})`);
}

console.log('\nwriting scene data (SPC series + the ONI companion):');
write('pg_climate.json', foundation);

const ind_ = (code) => indicators[code];
const series_ = (code) => ind_(code).series;
const round = (v, p = 3) => +v.toFixed(p);
const extremesLow = (s, k) => s.slice().sort((a, b) => a.value - b.value).slice(0, k).map((d) => d.year);
const extremesHigh = (s, k) => s.slice().sort((a, b) => b.value - a.value).slice(0, k).map((d) => d.year);
const oniOf = (year) => oni.find((d) => d.year === year) ?? null;

function pearson(pairs) {
	const n = pairs.length;
	const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
	const my = pairs.reduce((s, p) => s + p[1], 0) / n;
	let num = 0, dx = 0, dy = 0;
	for (const [px, py] of pairs) {
		num += (px - mx) * (py - my);
		dx += (px - mx) ** 2;
		dy += (py - my) ** 2;
	}
	return num / Math.sqrt(dx * dy);
}

// ── chapters 1–2 — the see-saw, and the rain that follows it ─────────────────
{
	const rain = new Map(series_('RAIN_ANOM').map((d) => [d.year, d.value]));
	const driest = extremesLow(series_('RAIN_ANOM'), 10);
	const years = oni
		.filter((d) => rain.has(d.year))
		.map((d) => ({
			year: d.year,
			oni: d.oni,
			phase: d.phase,
			rain: rain.get(d.year),
			driest: driest.includes(d.year) || undefined
		}));
	const both = years.filter((d) => d.oni != null);
	const r_oni = pearson(both.map((d) => [d.oni, d.rain]));
	const elninoYears = both.filter((d) => d.phase === 'elnino');
	const otherYears = both.filter((d) => d.phase !== 'elnino');
	const mean = (a) => a.reduce((s, d) => s + d.rain, 0) / a.length;
	const driest10 = driest.map((y) => ({ year: y, phase: oniOf(y)?.phase ?? 'pending' }));
	const driestElnino = driest10.filter((d) => d.phase === 'elnino').length;
	write('scene_reveal.json', {
		source: SOURCE,
		oni_source: ONI_SOURCE,
		years,
		r_oni: round(r_oni),
		r_local: round(pearson(
			series_('RAIN_ANOM')
				.filter((d) => new Map(series_('SST_ANOM').map((x) => [x.year, x.value])).has(d.year))
				.map((d) => [new Map(series_('SST_ANOM').map((x) => [x.year, x.value])).get(d.year), d.value])
		)),
		driest10,
		driest_elnino_count: driestElnino,
		mean_rain_elnino: round(mean(elninoYears), 1),
		mean_rain_other: round(mean(otherYears), 1)
	});
	console.log(`  · r(ONI, rain) = ${round(r_oni, 2)}  (n=${both.length})`);
	console.log(`  · driest 10: ${driestElnino} El Niño years — ${driest10.map((d) => d.year + '(' + d.phase[0] + ')').join(' ')}`);
	console.log(`  · mean rain anomaly: El Niño years ${round(mean(elninoYears), 1)} mm vs other years ${round(mean(otherYears), 1)} mm`);
}

// ── chapter 3 — the gardens (crop yield against the drought years) ──────────
{
	const crop = series_('CROP_YIELD');
	const rain = series_('RAIN_ANOM');
	const droughtYears = extremesLow(rain, 4);
	write('scene_cost.json', {
		source: SOURCE,
		drought_years: droughtYears,
		crop: { name: ind_('CROP_YIELD').name, unit: 'kg/ha',
		        years: crop.map((d) => ({ year: d.year, value: d.value })) }
	});
}

// ── chapter 4 — the long record (the rising floor under the see-saw) ────────
{
	const sst = series_('SST_ANOM');
	const sea = series_('SEA_LVL');
	// the "local alibi": r(local SST, rain) is POSITIVE — warm local years are
	// wetter, so the drought signal cannot be the local sea (one card quotes it)
	const sstBy = new Map(sst.map((d) => [d.year, d.value]));
	const r_local = pearson(
		series_('RAIN_ANOM').filter((d) => sstBy.has(d.year)).map((d) => [sstBy.get(d.year), d.value])
	);
	write('scene_exposure.json', {
		source: SOURCE,
		r_local: round(r_local),
		sst: { name: ind_('SST_ANOM').name, unit: '°C',
		       record_year: extremesHigh(sst, 1)[0],
		       latest: sst.at(-1),
		       years: sst.map((d) => ({ year: d.year, value: d.value })) },
		sea_level: { name: ind_('SEA_LVL').name, unit: 'm',
		             first: sea[0], last: sea.at(-1),
		             years: sea.map((d) => ({ year: d.year, value: d.value })) }
	});
	console.log(`  · r(local SST, rain) = ${round(r_local, 2)}`);
}

// ── chapter 5 — the ledger (emissions per person vs the world) ──────────────
{
	const ghg = series_('GHG_EMI_CAPITA');
	write('scene_gap.json', {
		source: SOURCE,
		ghg: { name: ind_('GHG_EMI_CAPITA').name, unit: 't CO₂e / person',
		       years: ghg.map((d) => ({ year: d.year, value: d.value })) },
		// single reference value, not an SPC series — documented in prep/README.md
		world: {
			value: 6.6,
			label: 'world average, ≈6.6 t (2023)',
			source: 'EDGAR (EC-JRC) global GHG per capita, 2023',
			url: 'https://edgar.jrc.ec.europa.eu/report_2024'
		},
		latest: ghg.at(-1),
		mean: round(ghg.reduce((s, d) => s + d.value, 0) / ghg.length, 2)
	});
}

// ── chapter 6 — the watchers (the meteorological monitoring network) ────────
{
	const met = series_('METEO_MONITOR_NET');
	write('scene_watch.json', {
		source: SOURCE,
		stations: { name: ind_('METEO_MONITOR_NET').name, unit: 'stations',
		            first: met[0], last: met.at(-1),
		            years: met.map((d) => ({ year: d.year, value: d.value })) }
	});
}

// ── epilogue — the whole record (small multiples of PG's indicators) ────────
{
	const panel = (code, unit, kind) => {
		const s = series_(code);
		return { code, name: ind_(code).name, unit, kind,
			first: s[0], last: s.at(-1),
			years: s.map((d) => ({ year: d.year, value: d.value })) };
	};
	write('scene_record.json', {
		source: SOURCE,
		oni_source: ONI_SOURCE,
		panels: [
			panel('SST_ANOM', '°C', 'anomaly'),
			panel('ST_ANOM', '°C', 'anomaly'),
			panel('RAIN_ANOM', 'mm', 'anomaly'),
			panel('SEA_LVL', 'm', 'level'),
			panel('CROP_YIELD', 'kg/ha', 'level'),
			panel('GHG_EMI_CAPITA', 't/person', 'level')
		]
	});
}

// ── chapter 9 — now (monthly Niño 3.4: the 2026 event against its precedents) ─
{
	// Monthly Niño 3.4 SST anomalies, NOAA PSL (see prep/README.md §3).
	const NINO_SRC = new URL('./source/nino34_monthly.csv', import.meta.url).pathname;
	const ninoRows = parseCsv(readFileSync(NINO_SRC, 'utf8'));
	ninoRows.shift(); // header: date,year,month,anomaly
	const nino = ninoRows
		.filter((r) => r.length >= 4 && r[0] !== '')
		.map((r) => ({ date: r[0], year: Number(r[1]), month: Number(r[2]), anomaly: Number(r[3]) }))
		.filter((d) => Number.isFinite(d.anomaly));

	const NINO_SOURCE = {
		name: 'Niño 3.4 SST anomaly, monthly — NOAA Physical Sciences Laboratory',
		url: 'https://psl.noaa.gov/data/correlation/nina34.anom.data',
		note:
			'Monthly mean sea-surface temperature anomaly for the Niño 3.4 region (5°N–5°S, ' +
			'170°–120°W). Exported with prep/fetch_nino34.py in July 2026; observations run ' +
			'through June 2026. The only monthly series in the piece.'
	};

	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const byDate = new Map(nino.map((d) => [d.date, d.anomaly]));
	const at = (year, month) => byDate.get(`${year}-${String(month).padStart(2, '0')}`) ?? null;

	// Event alignment: m = 0..17 spans Jan of the onset year → Jun of the year after.
	const SPAN = 18;
	const alignEvent = (onset) => {
		const months = [];
		for (let m = 0; m < SPAN; m++) {
			const year = onset + Math.floor(m / 12);
			const value = at(year, (m % 12) + 1);
			if (value != null) months.push({ m, anomaly: value });
		}
		return months;
	};
	const mLabel = (onset, m) => `${MONTHS[m % 12]} ${onset + Math.floor(m / 12)}`;

	const GREAT_ONSETS = [1982, 1997, 2015, 2023];
	const events = GREAT_ONSETS.map((onset) => {
		const months = alignEvent(onset);
		const peak = months.reduce((a, b) => (b.anomaly > a.anomaly ? b : a));
		return { onset, label: `${onset}–${String(onset + 1).slice(2)}`, peak, months };
	});

	const CURRENT_ONSET = 2026;
	const current = alignEvent(CURRENT_ONSET); // Jan–Jun 2026 at extraction
	const lastObs = current.at(-1);

	// The recent see-saw, month by month: Jan 2023 → the last observation.
	const recent = nino
		.filter((d) => d.year >= 2023)
		.map((d) => ({ date: d.date, anomaly: d.anomaly }));

	// ── the analogue estimate for the unwritten months ────────────────────────
	// Weight each great event by how closely its Jan–Jun matched 2026's Jan–Jun
	// (inverse RMSE), then extend: mean = similarity-weighted average of the four
	// trajectories; the band is their min–max envelope. This is an ESTIMATE from
	// precedent, not an observation — the scene labels it as such on the graphic.
	const obsWindow = current.map((d) => d.m);
	const rmseOf = (ev) => {
		const diffs = obsWindow
			.map((m) => {
				const a = ev.months.find((d) => d.m === m);
				const b = current.find((d) => d.m === m);
				return a && b ? a.anomaly - b.anomaly : null;
			})
			.filter((d) => d != null);
		return Math.sqrt(diffs.reduce((s, d) => s + d * d, 0) / diffs.length);
	};
	const raw = events.map((ev) => ({ onset: ev.onset, rmse: rmseOf(ev) }));
	const wsum = raw.reduce((s, d) => s + 1 / d.rmse, 0);
	const weights = raw.map((d) => ({
		onset: d.onset,
		rmse: round(d.rmse, 3),
		weight: round(1 / d.rmse / wsum, 3)
	}));

	const forecast = [];
	// anchor the band to the last observation so the estimate continues the line
	forecast.push({ m: lastObs.m, mean: lastObs.anomaly, lo: lastObs.anomaly, hi: lastObs.anomaly });
	for (let m = lastObs.m + 1; m < SPAN; m++) {
		const vals = events
			.map((ev) => ({ onset: ev.onset, v: ev.months.find((d) => d.m === m)?.anomaly }))
			.filter((d) => d.v != null);
		const mean =
			vals.reduce((s, d) => s + d.v / weights.find((w) => w.onset === d.onset).rmse, 0) /
			vals.reduce((s, d) => s + 1 / weights.find((w) => w.onset === d.onset).rmse, 0);
		forecast.push({
			m,
			mean: round(mean, 2),
			lo: round(Math.min(...vals.map((d) => d.v)), 2),
			hi: round(Math.max(...vals.map((d) => d.v)), 2)
		});
	}

	const peakF = forecast.reduce((a, b) => (b.mean > a.mean ? b : a));
	// "the hardest months": estimate ≥ +1.0 °C (event fully in force)…
	const hard = forecast.filter((d) => d.mean >= 1);
	// …and "the swing back": the estimate's decay below the +0.5 El Niño threshold.
	const swing = forecast.find((d) => d.m > peakF.m && d.mean <= 0.5);

	// The official outlook the estimate is checked against (cited reference values,
	// not a dataset — same pattern as the EDGAR world-average number in chapter 7).
	const OFFICIAL = {
		name: 'NOAA CPC / IRI ENSO outlook, mid-June 2026',
		url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml',
		iri_url: 'https://iri.columbia.edu/our-expertise/climate/forecasts/enso/current/',
		points: [
			'El Niño conditions are present and expected to strengthen through late 2026.',
			'Probability of El Niño ≈100% through Sep–Nov 2026 and ≈99% through Dec 2026–Feb 2027.',
			'Forecast peak in Sep–Nov 2026; 13 of 24 models reach “very strong” (Niño 3.4 ≥ +2.0 °C).'
		]
	};

	// June standings: 2026 against each great event at the same point in the year.
	const juneM = lastObs.m;
	const june = events.map((ev) => ({
		onset: ev.onset,
		value: ev.months.find((d) => d.m === juneM)?.anomaly ?? null
	}));

	write('scene_now.json', {
		source: SOURCE,
		nino_source: NINO_SOURCE,
		official: OFFICIAL,
		span: SPAN,
		month_names: MONTHS,
		recent,
		events: events.map(({ onset, label, peak, months }) => ({ onset, label, peak, months })),
		current: { onset: CURRENT_ONSET, months: current, latest: { ...lastObs, date: nino.at(-1).date } },
		june_standings: june,
		analogue: { weights, forecast },
		timing: {
			peak: { m: peakF.m, label: mLabel(CURRENT_ONSET, peakF.m), mean: peakF.mean, lo: peakF.lo, hi: peakF.hi },
			hardest: hard.length
				? { from: hard[0].m, to: hard.at(-1).m,
				    label: `${mLabel(CURRENT_ONSET, hard[0].m)} – ${mLabel(CURRENT_ONSET, hard.at(-1).m)}` }
				: null,
			swingback: swing
				? { from: swing.m, to: SPAN - 1,
				    label: `${mLabel(CURRENT_ONSET, swing.m)} – ${mLabel(CURRENT_ONSET, SPAN - 1)}` }
				: null
		}
	});
	console.log(`  · Niño 3.4 monthly: ${nino.length} months ${nino[0].date} → ${nino.at(-1).date}`);
	console.log(`  · analogue weights: ${weights.map((w) => `${w.onset}=${w.weight} (rmse ${w.rmse})`).join('  ')}`);
	console.log(`  · June standings: 2026=${lastObs.anomaly} vs ${june.map((d) => `${d.onset}=${d.value}`).join(' ')}`);
	console.log(`  · estimate peak ${peakF.mean} (${peakF.lo}–${peakF.hi}) at ${mLabel(CURRENT_ONSET, peakF.m)}`);
	console.log(`  · hardest ${hard[0]?.m}–${hard.at(-1)?.m}, swing-back from m=${swing?.m}`);
}

console.log('done.');

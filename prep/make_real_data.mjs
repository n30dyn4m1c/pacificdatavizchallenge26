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
 * Output: static/data/*.json + static/posters/*.png
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fieldColor } from '../src/lib/palette.js';

const SRC = new URL('./source/SPC_DF_CLIMATE_CHANGE.csv', import.meta.url).pathname;
const ONI_SRC = new URL('./source/oni_cpc.csv', import.meta.url).pathname;
const DATA = new URL('../static/data/', import.meta.url).pathname;
const POSTERS = new URL('../static/posters/', import.meta.url).pathname;
mkdirSync(DATA, { recursive: true });
mkdirSync(POSTERS, { recursive: true });

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

// ── act I — the record (annual SST anomaly, driven into the shader) ─────────
// Each year becomes a uniform LUMINANCE grid: byte = value/scale + offset, so
// the WebGL field is tinted by that year's real national anomaly. The scale
// matches the piece's palette contract (°C = (byte − 128)/40).
{
	const s = series_('SST_ANOM');
	const SCALE = 1 / 40, OFFSET = 128, W = 2, H = 2;
	const grid = (value) => {
		const byte = Math.max(0, Math.min(255, Math.round(value / SCALE) + OFFSET));
		return Buffer.from(new Uint8Array(W * H).fill(byte)).toString('base64');
	};
	write('scene_record_sst.json', {
		source: SOURCE,
		indicator: 'SST_ANOM',
		title: ind_('SST_ANOM').name,
		unit: '°C',
		w: W, h: H, scale: SCALE, offset: OFFSET,
		min: Math.min(...s.map((d) => d.value)),
		max: Math.max(...s.map((d) => d.value)),
		latest: { year: s.at(-1).year, value: s.at(-1).value },
		record_year: extremesHigh(s, 1)[0],
		years: s.map((d) => ({ year: d.year, value: d.value })),
		grids: s.map((d) => grid(d.value))
	});
}

// ── act II — the dry years (rainfall anomaly bars, driest flagged) ──────────
{
	const s = series_('RAIN_ANOM');
	const driestYears = extremesLow(s, 5);
	write('scene_dry.json', {
		source: SOURCE,
		unit: 'mm',
		note: ind_('RAIN_ANOM').name + ' (departure from the long-term mean)',
		driest: driestYears,
		years: s.map((d) => ({ year: d.year, value: d.value, driest: driestYears.includes(d.year) || undefined }))
	});
}

// ── act III — the alibi (local SST vs rainfall: the naive suspect cleared) ──
{
	const sst = new Map(series_('SST_ANOM').map((d) => [d.year, d.value]));
	const rain = series_('RAIN_ANOM');
	const driest = extremesLow(rain, 5);
	const points = rain
		.filter((d) => sst.has(d.year))
		.map((d) => ({
			year: d.year,
			sst: sst.get(d.year),
			rain: d.value,
			driest: driest.includes(d.year) || undefined
		}));
	const r_local = pearson(points.map((p) => [p.sst, p.rain]));
	write('scene_alibi.json', {
		source: SOURCE,
		points,
		driest,
		r_local: round(r_local),
		driest_detail: driest.map((y) => ({ year: y, sst: sst.get(y), rain: rain.find((d) => d.year === y).value }))
	});
	console.log(`  · r(local SST, rain) = ${round(r_local, 2)}  (n=${points.length})`);
}

// ── act IV — the far ocean (ONI vs rainfall: the mirror chart) ──────────────
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

// ── act V — the cost (crop yield against the drought years) ─────────────────
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

// ── act VI — double exposure (the rising floor under the visits) ────────────
{
	const sst = series_('SST_ANOM');
	const sea = series_('SEA_LVL');
	write('scene_exposure.json', {
		source: SOURCE,
		sst: { name: ind_('SST_ANOM').name, unit: '°C',
		       record_year: extremesHigh(sst, 1)[0],
		       years: sst.map((d) => ({ year: d.year, value: d.value })) },
		sea_level: { name: ind_('SEA_LVL').name, unit: 'm',
		             years: sea.map((d) => ({ year: d.year, value: d.value })) }
	});
}

// ── act VII — the gap (emissions per person vs the world) ───────────────────
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

// ── coda — watching (the meteorological monitoring network) ─────────────────
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

// ── act I no-WebGL fallback posters (solid fieldColor of a real year) ────────
// Each poster is a uniform fill of a real annual SST anomaly through the shared
// palette, so the fallback matches the shader. cool = coolest year, warm = 2025.
{
	const s = series_('SST_ANOM');
	const coolest = s.slice().sort((a, b) => a.value - b.value)[0];
	const warmest = s.at(-1);
	const poster = (name, value) => {
		const W = 720, H = 240;
		const hex = fieldColor(value, 'dark');
		const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
		const rgba = Buffer.alloc(W * H * 4);
		for (let p = 0; p < W * H; p++) { rgba[p * 4] = r; rgba[p * 4 + 1] = g; rgba[p * 4 + 2] = b; rgba[p * 4 + 3] = 255; }
		writeFileSync(POSTERS + name, pngEncode(W, H, rgba));
		console.log(`  wrote posters/${name} (SST ${value > 0 ? '+' : ''}${value} °C)`);
	};
	poster('sst_cool.png', coolest.value);
	poster('sst_warm.png', warmest.value);
}

// minimal PNG (RGBA, single IDAT) — no deps, matches the old synthetic encoder
function pngEncode(width, height, rgba) {
	const crcTable = Array.from({ length: 256 }, (_, n) => {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		return c >>> 0;
	});
	const crc32 = (buf) => {
		let c = 0xffffffff;
		for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
		return (c ^ 0xffffffff) >>> 0;
	};
	const chunk = (type, data) => {
		const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
		const body = Buffer.concat([Buffer.from(type), data]);
		const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
		return Buffer.concat([len, body, crc]);
	};
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8; ihdr[9] = 6;
	const raw = Buffer.alloc((width * 4 + 1) * height);
	for (let y = 0; y < height; y++)
		rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', ihdr),
		chunk('IDAT', deflateSync(raw, { level: 9 })),
		chunk('IEND', Buffer.alloc(0))
	]);
}

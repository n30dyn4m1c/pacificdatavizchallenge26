/**
 * make_real_data.mjs — REAL data pipeline (official source).
 *
 * Reads the official Pacific Data Viz Challenge 2026 dataset — the Pacific
 * Community (SPC) `DF_CLIMATE_CHANGE` dataflow, exported from the Pacific Data
 * Hub .Stat Explorer (https://stats.pacificdata.org/) — and emits the tidy
 * per-country annual series the scenes read. Papua New Guinea (GEO_PICT "PG")
 * is the focus country; a Pacific-wide mean per year is emitted as context.
 *
 * This dataset is ANNUAL and NATIONAL (one value per country per year, no
 * spatial grid, no monthly resolution, observations only — no forecast). The
 * piece is anchored on what this record actually contains; nothing here is
 * synthetic.
 *
 * Run from the repo root:  node prep/make_real_data.mjs
 * Input:  prep/source/SPC_DF_CLIMATE_CHANGE.csv  (the .Stat CSV export)
 * Output: static/data/pg_climate.json            (the real foundation file)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fieldColor } from '../src/lib/palette.js';

const SRC = new URL('./source/SPC_DF_CLIMATE_CHANGE.csv', import.meta.url).pathname;
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

const foundation = { source: SOURCE, indicators, regional };
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

// ── the tidy foundation file (every PG series + regional context) ───────────
console.log('\nwriting scene data (all derived from the official series above):');
write('pg_climate.json', foundation);

const ind_ = (code) => indicators[code];
const series_ = (code) => ind_(code).series;
const round = (v, p = 3) => +v.toFixed(p);
const extremesLow = (s, k) => s.slice().sort((a, b) => a.value - b.value).slice(0, k).map((d) => d.year);
const extremesHigh = (s, k) => s.slice().sort((a, b) => b.value - a.value).slice(0, k).map((d) => d.year);

// ── scene 1 — the warming sea (annual SST anomaly, driven into the shader) ──
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
	write('scene1_sst.json', {
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

// ── scene 2 — sea and land, in step (two 176-yr traces + regional ghost) ────
{
	const sst = series_('SST_ANOM');
	const land = series_('ST_ANOM');
	const region = regional.SST_ANOM.map((d) => ({ year: d.year, value: d.mean }));
	write('scene2_temps.json', {
		source: SOURCE,
		unit: '°C',
		latest_year: sst.at(-1).year,
		series: [
			{ key: 'region', name: 'Pacific average (sea surface)', ghost: true,
			  values: region.map((d) => ({ year: d.year, value: d.value })) },
			{ key: 'land', name: 'Papua New Guinea — land surface',
			  values: land.map((d) => ({ year: d.year, value: d.value })) },
			{ key: 'sst', name: 'Papua New Guinea — sea surface', accent: true,
			  values: sst.map((d) => ({ year: d.year, value: d.value })) }
		]
	});
}

// ── scene 3 — the driest years (rainfall anomaly bars) ──────────────────────
{
	const s = series_('RAIN_ANOM');
	const driestYears = extremesLow(s, 4);
	write('scene3_rain.json', {
		source: SOURCE,
		unit: 'mm',
		note: ind_('RAIN_ANOM').name + ' (departure from the long-term mean)',
		driest: driestYears,
		years: s.map((d) => ({ year: d.year, value: d.value, driest: driestYears.includes(d.year) || undefined }))
	});
}

// ── scene 4 — what the extremes cost (crop yield against drought years) ─────
{
	const crop = series_('CROP_YIELD');
	const rain = series_('RAIN_ANOM');
	const droughtYears = extremesLow(rain, 4);
	write('scene4_impact.json', {
		source: SOURCE,
		drought_years: droughtYears,
		crop: { name: ind_('CROP_YIELD').name, unit: 'kg/ha',
		        years: crop.map((d) => ({ year: d.year, value: d.value })) },
		rain: { name: ind_('RAIN_ANOM').name, unit: 'mm',
		        years: rain.map((d) => ({ year: d.year, value: d.value })) }
	});
}

// ── scene 5 — one garden (ILLUSTRATIVE, not from the dataset) ───────────────
// A hand-drawn explainer of why a clear highland night kills a kaukau garden.
// This scene carries no data claim and cites no source: it is a diagram of a
// well-understood mechanism (radiative frost on a still, cloudless night),
// shown so the record's numbers land on something human. Flagged illustrative.
{
	write('scene5_garden.json', {
		illustrative: true,
		note: 'Illustrative diagram of radiative frost on a highland kaukau mound. Not from the SPC dataset; no data claim, no source cited. The night-temperature curve is a schematic, not a station record.',
		phase: {
			elevation_m: 2300,
			frost_threshold_c: 0,
			schematic: true,
			night_temps_c: [11, 9, 7, 5, 4, 3, 2, 1, 0, -1, -2, -3]
		},
		indicators: [
			{ traditional: 'Morning fog sits low in the valley and burns off late', satellite: 'Cold, clear nights show up as low night-time land-surface temperature' },
			{ traditional: 'Cordyline (tanket) leaves at the garden edge pale and curl', satellite: 'Vegetation greenness dips over the high gardens' },
			{ traditional: 'Creek levels drop and the stones stay dry by mid-morning', satellite: 'Rainfall runs below its normal range for the season' }
		],
		hotspots: [
			{ id: 'sky', label: 'The night sky',
			  healthy: { title: 'Cloud is a blanket', body: 'It is the clear nights that kill. With no cloud, the day’s heat radiates straight out to space and ground that normally never freezes can freeze by dawn.' },
			  frosted: { title: 'No blanket came', body: 'A cloudless, windless night lets the surface cool far below the air a few metres up — the classic setup for radiative frost.' } },
			{ id: 'leaves', label: 'The vine leaves',
			  healthy: { title: 'A living canopy', body: 'The vines close over the mound, holding the day’s warmth against the soil and shading the weeds.' },
			  frosted: { title: 'Frost burn', body: 'Frost silvers the leaves overnight; they blacken and dry within days. The tuber below can survive, but with the canopy dead there is little left to feed it.' } },
			{ id: 'soil', label: 'The mounded soil',
			  healthy: { title: 'Why gardeners mound', body: 'Heaping the soil and folding in old vines to rot warms and drains it, and cold air slides off the crest downhill — a little height buys a little warmth.' },
			  frosted: { title: 'Bricked ground', body: 'Weeks without rain bake a mound hard and it cracks; replanting needs soft, wet soil, so recovery has to wait for the rain.' } },
			{ id: 'tuber', label: 'The tuber, below ground',
			  healthy: { title: 'A slow clock', body: 'From planting to harvest, sweet potato takes roughly five to nine months — what is eaten today was planted the better part of a year ago.' },
			  frosted: { title: 'Two harvests at once', body: 'A killing frost takes the standing crop and the vine cuttings needed to replant, so the loss reaches months into the future.' } },
			{ id: 'indicator', label: 'Reading the warning',
			  healthy: { title: 'Two ways of knowing', body: 'The garden gives its own signs — fog, leaf, creek — and satellites read the same conditions from orbit. Neither list replaces the other.' },
			  frosted: { title: 'Both were right', body: 'The local signs and the instruments describe one event from two directions: a cold, dry, cloudless spell settling over the high gardens.' } }
		]
	});
}

// ── scene 6 — the record in full: who warms it, who wears it ────────────────
{
	const pick = (code, unit) => ({ name: ind_(code).name, unit,
		years: series_(code).map((d) => ({ year: d.year, value: d.value })) });
	write('scene6_justice.json', {
		source: SOURCE,
		ghg: pick('GHG_EMI_CAPITA', 't CO₂e / person'),
		sea_level: pick('SEA_LVL', 'm'),
		sst: pick('SST_ANOM', '°C')
	});
}

// ── scene 7 — the whole record (small multiples of PG's indicators) ─────────
{
	const panel = (code, unit, kind) => {
		const s = series_(code);
		return { code, name: ind_(code).name, unit, kind,
			first: s[0], last: s.at(-1),
			years: s.map((d) => ({ year: d.year, value: d.value })) };
	};
	write('scene7_record.json', {
		source: SOURCE,
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

// ── scene 1 no-WebGL fallback posters (solid fieldColor of a real year) ──────
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

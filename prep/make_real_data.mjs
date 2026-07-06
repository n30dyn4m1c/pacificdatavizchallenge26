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

const SRC = new URL('./source/SPC_DF_CLIMATE_CHANGE.csv', import.meta.url).pathname;
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

const out = {
	source: {
		name: 'Pacific Community (SPC) — Climate Change indicators',
		dataflow: 'SPC:DF_CLIMATE_CHANGE(1.0)',
		hub: 'Pacific Data Hub .Stat Explorer',
		url: 'https://stats.pacificdata.org/',
		note: 'Official Pacific Data Viz Challenge 2026 dataset. Annual, national-level observations.',
		geo: FOCUS,
		geo_name: FOCUS_NAME,
		extracted: '2026-07-06'
	},
	indicators,
	regional
};

writeFileSync(DATA + 'pg_climate.json', JSON.stringify(out));
const kb = (Buffer.byteLength(JSON.stringify(out)) / 1024).toFixed(1);
console.log(`wrote pg_climate.json (${kb} KB) — ${Object.keys(indicators).length} PG indicators`);
for (const [code, o] of Object.entries(indicators)) {
	const s = o.series;
	console.log(`  ${code.padEnd(26)} ${s.length} yrs ${s[0].year}–${s[s.length - 1].year}  (${o.unit})`);
}

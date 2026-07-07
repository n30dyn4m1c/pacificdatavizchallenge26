/**
 * make_maps.mjs — map geometry pipeline (real coastlines, no hand-drawn land).
 *
 * Builds static/data/scene_map.json: pre-projected SVG path strings for the
 * two maps in the piece —
 *   1. `pacific`  — the tropical Pacific basin, Papua New Guinea on the west
 *      and the Niño 3.4 detection region (5°N–5°S, 170°W–120°W) far to the
 *      east, where El Niño / La Niña is measured first;
 *   2. `png`      — Papua New Guinea itself, with its four great rivers
 *      (Fly, Sepik, Ramu, Purari) and reference points.
 *
 * Source: Natural Earth (public domain) — 50m land + admin-0 for coastlines,
 * 10m river centerlines for the PNG rivers. The GeoJSON files are downloaded
 * into prep/source/naturalearth/ on first run (they are several MB, so they
 * are not committed; the emitted scene_map.json is).
 *
 * The projection is plain equirectangular over a 0–360° longitude domain
 * (the Pacific cannot live on a ±180 map). Geometry is Douglas-Peucker
 * simplified in projected space and rounded to 0.1 px, which keeps the
 * whole file within the piece's per-scene JSON budget.
 *
 * Run from the repo root:  node prep/make_maps.mjs
 * Output: static/data/scene_map.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const NE_DIR = new URL('./source/naturalearth/', import.meta.url).pathname;
const DATA = new URL('../static/data/', import.meta.url).pathname;
mkdirSync(NE_DIR, { recursive: true });
mkdirSync(DATA, { recursive: true });

const NE_BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const SOURCES = {
	land: 'ne_50m_land.geojson',
	admin0: 'ne_50m_admin_0_countries.geojson',
	rivers: 'ne_10m_rivers_lake_centerlines.geojson'
};

async function loadSource(key) {
	const path = NE_DIR + SOURCES[key];
	if (!existsSync(path)) {
		console.log(`downloading ${SOURCES[key]} …`);
		const res = await fetch(NE_BASE + SOURCES[key]);
		if (!res.ok) throw new Error(`fetch ${SOURCES[key]}: ${res.status}`);
		writeFileSync(path, await res.text());
	}
	return JSON.parse(readFileSync(path, 'utf8'));
}

// ── projection: equirectangular on a 0–360 longitude domain ────────────────
const lon360 = (lon) => (lon < 0 ? lon + 360 : lon);

function makeView({ lonMin, lonMax, latMin, latMax, width }) {
	const k = width / (lonMax - lonMin);
	return {
		w: width,
		h: Math.round((latMax - latMin) * k * 10) / 10,
		k,
		x: (lon) => (lon360(lon) - lonMin) * k,
		y: (lat) => (latMax - lat) * k,
		contains: (lon, lat) => {
			const L = lon360(lon);
			return L >= lonMin - 2 && L <= lonMax + 2 && lat >= latMin - 2 && lat <= latMax + 2;
		}
	};
}

// ── Douglas-Peucker simplification in projected px ──────────────────────────
function simplify(pts, tol) {
	if (pts.length < 3) return pts;
	const keep = new Uint8Array(pts.length);
	keep[0] = keep[pts.length - 1] = 1;
	const stack = [[0, pts.length - 1]];
	while (stack.length) {
		const [a, b] = stack.pop();
		const [ax, ay] = pts[a];
		const [bx, by] = pts[b];
		const dx = bx - ax;
		const dy = by - ay;
		const len2 = dx * dx + dy * dy || 1;
		let iMax = -1;
		let dMax = tol * tol;
		for (let i = a + 1; i < b; i++) {
			const [px, py] = pts[i];
			const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
			const ex = px - (ax + t * dx);
			const ey = py - (ay + t * dy);
			const d2 = ex * ex + ey * ey;
			if (d2 > dMax) {
				dMax = d2;
				iMax = i;
			}
		}
		if (iMax > 0) {
			keep[iMax] = 1;
			stack.push([a, iMax], [iMax, b]);
		}
	}
	return pts.filter((_, i) => keep[i]);
}

const r1 = (v) => Math.round(v * 10) / 10;

/** ring of [lon,lat] → simplified projected point list (or null if trivial) */
function projectRing(ring, view, tol, minArea) {
	if (!ring.some(([lon, lat]) => view.contains(lon, lat))) return null;
	let pts = ring.map(([lon, lat]) => [view.x(lon), view.y(lat)]);
	pts = simplify(pts, tol);
	if (pts.length < 4) return null;
	// shoelace: drop islets below the area floor (in px²)
	let area = 0;
	for (let i = 0; i < pts.length - 1; i++)
		area += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
	if (Math.abs(area / 2) < minArea) return null;
	return pts;
}

const toPath = (pts, close) =>
	'M' + pts.map(([px, py]) => `${r1(px)} ${r1(py)}`).join('L') + (close ? 'Z' : '');

function geomRings(geom) {
	if (geom.type === 'Polygon') return [geom.coordinates[0]];
	if (geom.type === 'MultiPolygon') return geom.coordinates.map((p) => p[0]);
	return [];
}

function geomLines(geom) {
	if (geom.type === 'LineString') return [geom.coordinates];
	if (geom.type === 'MultiLineString') return geom.coordinates;
	return [];
}

function landPaths(features, view, tol, minArea) {
	const paths = [];
	for (const f of features) {
		for (const ring of geomRings(f.geometry)) {
			const pts = projectRing(ring, view, tol, minArea);
			if (pts) paths.push(toPath(pts, true));
		}
	}
	return paths;
}

const land = await loadSource('land');
const admin0 = await loadSource('admin0');
const rivers = await loadSource('rivers');

const pngFeature = admin0.features.find((f) => f.properties.ADMIN === 'Papua New Guinea');
if (!pngFeature) throw new Error('PNG not found in admin-0');

// ── view 1: the tropical Pacific basin ──────────────────────────────────────
// PNG sits at ~141–156°E; the Niño 3.4 box at 190–240° (170°W–120°W); the
// South American coast (where the fishermen who named El Niño worked) enters
// on the right edge.
const pac = makeView({ lonMin: 112, lonMax: 295, latMin: -42, latMax: 30, width: 1000 });

const pacific = {
	w: pac.w,
	h: pac.h,
	land: landPaths(land.features, pac, 1.4, 5),
	png: landPaths(geomRings(pngFeature.geometry).map((r) => ({ geometry: { type: 'Polygon', coordinates: [r] } })), pac, 1.1, 2),
	equator_y: r1(pac.y(0)),
	nino34: {
		x: r1(pac.x(190)),
		y: r1(pac.y(5)),
		w: r1(pac.x(240) - pac.x(190)),
		h: r1(pac.y(-5) - pac.y(5))
	},
	points: {
		port_moresby: { x: r1(pac.x(147.19)), y: r1(pac.y(-9.46)) },
		nino_center: { x: r1(pac.x(215)), y: r1(pac.y(0)) }
	},
	// great-circle-ish distance quoted in the piece: Port Moresby → the
	// center of Niño 3.4 (215°E, 0°) ≈ 7,500 km; the box's western edge is
	// ≈ 4,800 km out. "Seven thousand kilometres" is the piece's shorthand.
	distance_km: 7500
};

// ── view 2: Papua New Guinea ────────────────────────────────────────────────
const pgv = makeView({ lonMin: 140.4, lonMax: 156.6, latMin: -12, latMax: 0.4, width: 1000 });

const pngRivers = [];
for (const f of rivers.features) {
	const name = f.properties.name ?? '';
	if (!/^(Fly|Sepik|Ramu|Purari|Strickland)$/.test(name)) continue;
	for (const line of geomLines(f.geometry)) {
		if (!line.some(([lon, lat]) => pgv.contains(lon, lat))) continue;
		let pts = line.map(([lon, lat]) => [pgv.x(lon), pgv.y(lat)]);
		pts = simplify(pts, 1.2);
		if (pts.length >= 2) pngRivers.push({ name, d: toPath(pts, false) });
	}
}

// The central cordillera, as a hand-authored illustrative band (there is no
// public-domain vector "highlands" layer at this scale): a ridge line from
// the Star Mountains on the Indonesian border through Mt Wilhelm to the
// Owen Stanley Range, buffered ~0.55° each side. Labelled an illustration
// in the scene — it marks where the Highlands are, it does not measure them.
const RIDGE = [
	[141.0, -5.0],
	[142.5, -5.5],
	[143.7, -5.9],
	[145.0, -5.8],
	[146.2, -6.5],
	[147.0, -7.3],
	[147.9, -8.3],
	[148.8, -9.1]
];
const BAND = 0.5;
const highlands = RIDGE.map(([lon, lat]) => [pgv.x(lon), pgv.y(lat + BAND)]).concat(
	RIDGE.slice()
		.reverse()
		.map(([lon, lat]) => [pgv.x(lon), pgv.y(lat - BAND)])
);

const png = {
	w: pgv.w,
	h: pgv.h,
	country: landPaths(geomRings(pngFeature.geometry).map((r) => ({ geometry: { type: 'Polygon', coordinates: [r] } })), pgv, 1.2, 3),
	rivers: pngRivers,
	highlands: toPath(highlands.map(([x, y]) => [x, y]), true),
	points: {
		port_moresby: { x: r1(pgv.x(147.19)), y: r1(pgv.y(-9.46)), name: 'Port Moresby' },
		mt_wilhelm: { x: r1(pgv.x(145.03)), y: r1(pgv.y(-5.78)), name: 'Mt Wilhelm · 4,509 m' },
		kiunga: { x: r1(pgv.x(141.29)), y: r1(pgv.y(-6.12)), name: 'Kiunga (Fly River port)' }
	},
	// the A–B cut the profile chapter draws: south coast → Mt Wilhelm → north
	// coast, so the sideways elevation view has a place on the real map
	profile_cut: {
		x1: r1(pgv.x(144.85)),
		y1: r1(pgv.y(-7.95)),
		x2: r1(pgv.x(145.25)),
		y2: r1(pgv.y(-4.15))
	},
	labels: [
		{ x: r1(pgv.x(142.3)), y: r1(pgv.y(-4.05)), text: 'Sepik River' },
		{ x: r1(pgv.x(141.8)), y: r1(pgv.y(-7.6)), text: 'Fly River' },
		{ x: r1(pgv.x(143.1)), y: r1(pgv.y(-6.75)), text: 'the Highlands' },
		{ x: r1(pgv.x(150.2)), y: r1(pgv.y(-5.15)), text: 'New Britain' },
		{ x: r1(pgv.x(152.6)), y: r1(pgv.y(-2.9)), text: 'New Ireland' },
		{ x: r1(pgv.x(155.2)), y: r1(pgv.y(-5.9)), text: 'Bougainville' },
		{ x: r1(pgv.x(146.9)), y: r1(pgv.y(-1.85)), text: 'Manus' }
	]
};

const out = {
	source: {
		name: 'Natural Earth (public domain), 50m land / 10m rivers',
		url: 'https://www.naturalearthdata.com/',
		note: 'Coastlines and rivers are real Natural Earth geometry, pre-projected (equirectangular). The highlands band is an illustrative marker, not a DEM.'
	},
	pacific,
	png
};

writeFileSync(DATA + 'scene_map.json', JSON.stringify(out));
const kb = (JSON.stringify(out).length / 1024).toFixed(1);
console.log(`wrote static/data/scene_map.json (${kb} KB) — pacific: ${pacific.land.length} land paths, png: ${png.country.length} rings, ${pngRivers.length} river segments`);

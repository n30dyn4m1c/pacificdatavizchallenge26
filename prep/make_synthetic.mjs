/**
 * make_synthetic.mjs — generates SYNTHETIC scene data matching the contracts
 * documented in prep/README.md and make_scene_data.py.
 *
 * The real Python pipeline (make_scene_data.py) replaces every file this
 * script writes, with identical shapes. Run from the repo root:
 *
 *   node prep/make_synthetic.mjs
 *
 * Writes: static/data/*.json and static/posters/*.png (the no-WebGL fallback
 * posters for scene 1, rendered through the same palette as the shader).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fieldColor } from '../src/lib/palette.js';

const DATA = new URL('../static/data/', import.meta.url).pathname;
const POSTERS = new URL('../static/posters/', import.meta.url).pathname;
mkdirSync(DATA, { recursive: true });
mkdirSync(POSTERS, { recursive: true });

const write = (name, obj) => {
	writeFileSync(DATA + name, JSON.stringify(obj));
	console.log('wrote', name);
};

// ── ONI series ──────────────────────────────────────────────────────────────
// Ghost events approximate the shape of the real ONI record; the current
// event is invented (this is the synthetic placeholder for the 2026 event).
const oni9798 = [-0.5,-0.4,-0.1,0.3,0.8,1.2,1.6,1.9,2.1,2.3,2.4,2.4, 2.2,1.9,1.4,1.0,0.5,-0.1]; // Jan 97 – Jun 98
const oni1516 = [0.5,0.5,0.5,0.7,0.9,1.2,1.5,1.8,2.1,2.4,2.6,2.6, 2.5,2.1,1.6,0.9,0.4,-0.1]; // Jan 15 – Jun 16
// Current event, Jan 2026 – Jun 2027. Observed through Jun 2026 (+1.7),
// forecast beyond — peaks +2.8 in Dec 2026, overshooting both ghosts.
const oniNow = [0.8,1.0,1.2,1.4,1.6,1.7, 1.9,2.1,2.3,2.5,2.7,2.8, 2.7,2.4,2.0,1.5,1.0,0.5];
const OBSERVED_THROUGH = 5; // index of Jun 2026 in oniNow

// Full story arc for scenes 1 & 4: Jun 2025 (La Niña) → May 2027.
const arcStart = { y: 2025, m: 6 }; // Jun 2025
const oniArc = [-0.6,-0.5,-0.4,-0.2,0.0,0.3,0.6, ...oniNow.slice(0, 17)]; // 24 months

const ym = (i) => {
	const y = arcStart.y + Math.floor((arcStart.m - 1 + i) / 12);
	const m = ((arcStart.m - 1 + i) % 12) + 1;
	return `${y}-${String(m).padStart(2, '0')}`;
};

const monthLabel = (startYear, i) => {
	const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	return `${names[i % 12]} ${String((startYear + Math.floor(i / 12)) % 100).padStart(2, '0')}`;
};

// ── scene 2: ONI history overlay ────────────────────────────────────────────
write('scene2_oni_history.json', {
	note: 'SYNTHETIC — replaced by prep/make_scene_data.py. Series aligned Jan of event year 0; x = month index.',
	events: [
		{ name: '1997–98', series: oni9798.map((oni, i) => ({ month: monthLabel(1997, i), oni })) },
		{ name: '2015–16', series: oni1516.map((oni, i) => ({ month: monthLabel(2015, i), oni })) },
		{
			name: '2026–27 (current + forecast)',
			series: oniNow.map((oni, i) => ({
				month: monthLabel(2026, i),
				oni,
				forecast: i > OBSERVED_THROUGH || undefined
			}))
		}
	]
});

// ── scene 1: SST anomaly field, Jun 2025 → Jun 2026 ────────────────────────
// Texture-encoding strategy (documented choice): rather than PNG textures,
// each month is a 72×24 grid over 120°E–290°E, 18°S–18°N, quantized to one
// byte per cell (anomaly °C = (byte − 128) / 40) and stored as base64 in the
// JSON index. 13 months ≈ 27 KB before gzip; the front end decodes each
// month to a Uint8Array and uploads it as a LUMINANCE texture.
const FW = 72, FH = 24;
const LON0 = 120, LON1 = 290, LAT0 = -18, LAT1 = 18;

/** Synthetic equatorial-Pacific anomaly field for ONI value `o`, month idx t. */
function fieldAnomaly(lon, lat, o, t) {
	// warm tongue along the equator, spreading west as the event grows
	const center = 245 - 20 * Math.min(1, Math.max(0, o / 2.5));
	const tongue = Math.exp(-(((lon - center) / 48) ** 2)) * Math.exp(-((lat / 6.5) ** 2));
	// opposite-signed western-Pacific horseshoe
	const horse =
		-0.45 * Math.exp(-(((lon - 148) / 22) ** 2)) * Math.exp(-(((Math.abs(lat) - 7) / 7) ** 2));
	// deterministic mesoscale texture so the field doesn't look airbrushed
	const noise =
		0.07 * Math.sin(lon * 0.293 + lat * 0.17 + t * 0.9) * Math.cos(lat * 0.47 - lon * 0.11 - t * 0.6) +
		0.05 * Math.sin(lon * 0.71 - lat * 0.53 + t * 1.7) * Math.cos(lon * 0.13 + lat * 0.31);
	return o * (tongue + horse) + noise * (0.5 + Math.abs(o) * 0.4);
}

function monthGrid(o, t) {
	const buf = Buffer.alloc(FW * FH);
	for (let j = 0; j < FH; j++) {
		for (let i = 0; i < FW; i++) {
			const lon = LON0 + ((i + 0.5) / FW) * (LON1 - LON0);
			const lat = LAT0 + ((j + 0.5) / FH) * (LAT1 - LAT0);
			const a = fieldAnomaly(lon, lat, o, t);
			buf[j * FW + i] = Math.max(0, Math.min(255, Math.round(a * 40) + 128));
		}
	}
	return buf;
}

const fieldMonths = oniArc.slice(0, 13); // Jun 2025 – Jun 2026
const grids = fieldMonths.map((o, t) => monthGrid(o, t));
write('scene1_sst_field.json', {
	note: 'SYNTHETIC — replaced by prep/make_scene_data.py (OISST/ERSST). byte→°C: (b-128)/40.',
	w: FW,
	h: FH,
	lon: [LON0, LON1],
	lat: [LAT0, LAT1],
	scale: 1 / 40,
	offset: 128,
	months: fieldMonths.map((o, i) => ({ date: ym(i), oni: o })),
	latest: { date: ym(12), oni: fieldMonths[12] },
	grids: grids.map((g) => g.toString('base64'))
});

// ── scene 3: elevation transect, Coral Sea → Fly delta → Highlands ─────────
const profile = [];
for (let km = -80; km <= 560; km += 8) {
	let elev;
	if (km < 0) elev = -40 - 60 * Math.exp(-((km + 80) / 60)); // shelf
	else if (km < 220) elev = 8 + km * 0.12 + 6 * Math.sin(km * 0.05); // Fly lowlands
	else if (km < 380) elev = 35 + ((km - 220) / 160) ** 1.8 * 1500 + 30 * Math.sin(km * 0.09); // foothills
	else elev = 1550 + ((km - 380) / 180) ** 1.25 * 1400 + 60 * Math.sin(km * 0.11); // highlands
	profile.push({ km, elev: Math.round(elev) });
}
write('scene3_transect.json', {
	note: 'SYNTHETIC transect, Gulf of Papua → Mt Giluwe flank. Replaced by SRTM sampling in prep.',
	profile,
	bands: [
		{ km: -60, elev: 0, label: 'Coral Sea — where the signal begins', band: 'ocean' },
		{ km: 90, elev: 20, label: 'Fly River lowlands · < 50 m — rain-fed rivers, sago, gardens on the levees', band: 'lowlands' },
		{ km: 300, elev: 900, label: 'Foothill valleys · 600–1,400 m — coffee and food gardens', band: 'foothills' },
		{ km: 440, elev: 2000, label: 'Upper valleys · 1,400–2,200 m — the kaukau belt', band: 'highlands' },
		{ km: 530, elev: 2750, label: 'High gardens · > 2,200 m — one clear night from frost', band: 'frostline' }
	]
});

// ── scene 4: the lag (pre-aligned at prep time) ─────────────────────────────
// The front end NEVER computes lags — every derived quantity ships in the file.
// drought reaches the lowlands ~6 months after onset; the first killing
// frost above 2,200 m lands ~8 months after, in the heart of the dry season
const droughtIdx = [0.04,0.04,0.05,0.05,0.06,0.06,0.08, 0.10,0.14,0.20,0.28,0.36,0.45, 0.55,0.66,0.76,0.84,0.90,0.93, 0.91,0.86,0.78,0.66,0.55];
const frostEv =   [0,0,0,0,0,0,0, 0,0,0,0,0,0, 0,1,4,2,0,0, 0,0,0,0,0];
const ONSET = 6; // Dec 2025: first month ONI ≥ +0.5
const PEAK = 18; // Dec 2026: forecast ONI maximum
write('scene4_lag.json', {
	note: 'SYNTHETIC — lags pre-aligned here in prep; the front end only reads.',
	onset: ym(ONSET),
	peak: ym(PEAK),
	observed_through: ym(12),
	months: oniArc.map((oni, i) => ({
		date: ym(i),
		oni,
		forecast: i > 12 || undefined,
		lowland_drought_index: droughtIdx[i],
		highlands_frost_events: frostEv[i],
		elevation_band: frostEv[i] > 0 ? 'highlands >2200 m' : droughtIdx[i] >= 0.45 ? 'lowlands <50 m' : null,
		months_since_onset: i - ONSET,
		months_since_peak: i - PEAK
	}))
});

// ── scene 5: one garden — the pop-up-book mound ────────────────────────────
// Part 2 contract: the scene reads its phase thresholds, the night
// temperature curve and every hotspot's copy from here. Values that must
// come from the real pipeline (or be verified with local sources) carry
// "_synthetic": true so the remaining work is greppable.
write('scene5_garden.json', {
	note: 'SYNTHETIC placeholder — indicators, night curve and hotspot copy to be replaced/verified (NARI, provincial DAL, station records).',
	indicators: [
		{ traditional: 'Morning fog sits low in the valley and burns off before the pigs are fed', satellite: 'Night-time land-surface temperature dips below 4 °C (MODIS/VIIRS LST)' },
		{ traditional: 'The tanket (cordyline) leaves curl and pale at the garden edge', satellite: 'NDVI anomaly turns negative over the 2,200 m band (Sentinel-2)' },
		{ traditional: 'Creek levels drop and the stones stay dry by mid-morning', satellite: 'CHIRPS 30-day rainfall sits below the 20th percentile' },
		{ traditional: 'Old people say: when the dry wind comes early, plant the swamp gardens', satellite: 'ONI holds above +1.5 °C for a third consecutive month' }
	],
	phase: {
		_synthetic: true, // curve + threshold from a real frost-night station record
		elevation_m: 2300,
		frost_threshold_c: 0,
		// air temperature over the night-falls scrub (evenly sampled dusk → 4 a.m.)
		night_temps_c: [11, 9, 7, 5, 4, 3, 2, 1, 0, -1, -2, -3]
	},
	hotspots: [
		{
			_synthetic: true,
			id: 'leaves',
			label: 'The vine leaves',
			healthy: {
				title: 'A living blanket',
				body: 'The vines close over the mound like a roof. They hold the day’s warmth against the soil and shade out the weeds — the canopy is the mound’s first defence against a cold sky.'
			},
			frosted: {
				title: 'Frost burn',
				body: 'The leaves go first: silvered by dawn, black by noon, dry in three days. The tuber below can survive the night — but with the canopy dead there is nothing left to feed it. The plant starves from the top down.'
			}
		},
		{
			_synthetic: true,
			id: 'soil',
			label: 'The mounded soil',
			healthy: {
				title: 'Why we mound',
				body: 'We heap the soil and fold old vines inside to rot and warm it. A mound drains, and cold air slides off it downhill — a few hand-widths of height buys a degree on a bad night.'
			},
			frosted: {
				title: 'Bricked ground',
				body: 'Weeks without rain bake the mound hard, and it cracks. Replanting needs soft, wet soil — so even after the frost passes, the bricked ground makes us wait. The waiting is the hunger.'
			}
		},
		{
			_synthetic: true,
			id: 'tuber',
			label: 'The tuber, below ground',
			healthy: {
				title: 'A slow clock',
				body: 'From planting to harvest, kaukau takes five to nine months. What you eat tonight was decided the better part of a year ago.'
			},
			frosted: {
				title: 'Two harvests die tonight',
				body: 'The frost kills the vines we would cut to replant. So it does not just take this harvest — it takes the next one, months away. That is the lag, landing in one garden.'
			}
		},
		{
			_synthetic: true,
			id: 'sky',
			label: 'The night sky',
			healthy: {
				title: 'Cloud is a blanket',
				body: 'The secret: it is the CLEAR nights that kill. El Niño dries the sky, the day’s heat radiates straight out to space, and ground that never freezes — freezes.'
			},
			frosted: {
				title: 'No blanket came',
				body: 'No cloud last night. The heat left for space and the frost line walked downhill, into gardens that had never seen it.'
			}
		},
		{
			_synthetic: true,
			id: 'indicator',
			label: 'The early-warning plant',
			healthy: {
				title: 'What the old people watch',
				body: 'Long before any satellite, the garden gives its own warning: the tanket (cordyline) at the garden edge pales and curls when the dry is coming. When it shows, the planting moves to the swamp gardens. [TODO: verify the specific indicator and its reading with Highlands sources before publication.]'
			},
			frosted: {
				title: 'It had already told us',
				body: 'The tanket showed weeks ago — the same warning the ocean gave months ago, read from a leaf instead of a satellite. Both were right. [TODO: verify the specific indicator and its reading with Highlands sources before publication.]'
			}
		}
	]
});

// ── scene 6: current forecast + province impact windows ────────────────────
const plumeMonths = 12; // Jul 2026 – Jun 2027
const plumeFor = (mids) =>
	Array.from({ length: plumeMonths }, (_, i) => {
		const mid = mids[i];
		const spread = 0.25 + i * 0.09;
		return {
			month: monthLabel(2026, 6 + i),
			p10: +(mid - spread).toFixed(2),
			p50: +mid.toFixed(2),
			p90: +(mid + spread).toFixed(2)
		};
	});
const strongMids = oniNow.slice(6, 6 + plumeMonths);
// moderate scenario: same shape, peaking near +1.8 instead of +2.8
const moderateMids = strongMids.map((v) => Math.min(v, 0.5 + v * 0.47));
const strongPlume = plumeFor(strongMids);
write('scene6_forecast.json', {
	note: 'SYNTHETIC plume + windows — replaced by IRI/CPC plume and NDC hazard tables in prep.',
	current: {
		name: '2026–27 (current + forecast)',
		series: oniNow.slice(0, OBSERVED_THROUGH + 1).map((oni, i) => ({ month: monthLabel(2026, i), oni }))
	},
	plume: strongPlume, // == scenarios.strong.plume (kept for the base contract)
	scenarios: {
		_synthetic: true, // both plumes from the real IRI/CPC scenario spreads
		strong: {
			label: 'if strong',
			peak_oni: Math.max(...strongMids),
			caption: 'The current forecast: a strong event peaking near +2.8 °C in December.',
			plume: strongPlume
		},
		moderate: {
			label: 'if moderate',
			peak_oni: +Math.max(...moderateMids).toFixed(1),
			caption: 'If the event stalls moderate, the frost window narrows to the highest gardens.',
			plume: plumeFor(moderateMids)
		}
	},
	provinces: [
		{ name: 'Western', impact_type: 'drought', window_start: '2026-08', window_end: '2027-01', confidence: 'high' },
		{ name: 'Gulf', impact_type: 'drought', window_start: '2026-09', window_end: '2027-01', confidence: 'medium' },
		{ name: 'Hela', impact_type: 'frost', window_start: '2026-06', window_end: '2026-10', confidence: 'high' },
		{ name: 'Enga', impact_type: 'frost', window_start: '2026-06', window_end: '2026-10', confidence: 'high' },
		{ name: 'Southern Highlands', impact_type: 'frost', window_start: '2026-07', window_end: '2026-10', confidence: 'medium' },
		{ name: 'Western Highlands', impact_type: 'frost', window_start: '2026-07', window_end: '2026-09', confidence: 'medium' },
		{ name: 'Chimbu', impact_type: 'frost', window_start: '2026-07', window_end: '2026-10', confidence: 'medium' },
		{ name: 'Eastern Highlands', impact_type: 'drought', window_start: '2026-10', window_end: '2027-02', confidence: 'low' },
		{ name: 'Morobe', impact_type: 'drought', window_start: '2026-10', window_end: '2027-01', confidence: 'low' }
	]
});

// Low-poly provinces "map" — synthetic placeholder polygons in lon/lat.
// Replaced in prep by a simplified real boundaries file with the same shape.
write('png_provinces.json', {
	note: 'SYNTHETIC low-poly placeholder — NOT real boundaries. Same FeatureCollection shape as the prep output.',
	type: 'FeatureCollection',
	features: [
		poly('Western', [[141,-9.2],[143.4,-9.0],[143.9,-7.7],[142.6,-6.2],[141,-5.6],[141,-9.2]]),
		poly('Gulf', [[143.4,-9.0],[145.4,-8.1],[145.6,-7.3],[144.4,-6.6],[142.6,-6.2],[143.9,-7.7],[143.4,-9.0]]),
		poly('Hela', [[142.4,-6.1],[143.3,-6.3],[143.4,-5.6],[142.6,-5.2],[142.4,-6.1]]),
		poly('Southern Highlands', [[143.3,-6.3],[144.4,-6.6],[144.5,-5.9],[143.4,-5.6],[143.3,-6.3]]),
		poly('Enga', [[142.6,-5.2],[143.4,-5.6],[144.1,-5.3],[143.9,-4.9],[143.0,-4.9],[142.6,-5.2]]),
		poly('Western Highlands', [[143.9,-4.9],[144.1,-5.3],[144.6,-5.5],[144.8,-5.1],[144.3,-4.8],[143.9,-4.9]]),
		poly('Jiwaka', [[144.6,-5.5],[144.5,-5.9],[145.0,-5.9],[144.8,-5.1],[144.6,-5.5]]),
		poly('Chimbu', [[144.8,-5.1],[145.0,-5.9],[145.4,-6.0],[145.3,-5.2],[144.8,-5.1]]),
		poly('Eastern Highlands', [[145.3,-5.2],[145.4,-6.0],[146.2,-6.3],[146.3,-5.6],[145.3,-5.2]]),
		poly('Morobe', [[146.3,-5.6],[146.2,-6.3],[145.6,-7.3],[147.2,-7.4],[147.9,-6.5],[146.9,-5.9],[146.3,-5.6]])
	]
});
function poly(name, ring) {
	return { type: 'Feature', properties: { name }, geometry: { type: 'Polygon', coordinates: [ring] } };
}

// ── scene 7: the anticipatory-action calendar ───────────────────────────────
// Part 2: every action carries `oni_threshold` (the ONI value its trigger
// references, or null when the trigger is a different index) so the front
// end can draw the trigger → threshold connecting line. Parsed from the
// trigger text here; the real pipeline sets it explicitly. Thresholds are
// flagged _synthetic until co-drafted values land.
const cal = (name, actions) => ({
	name,
	actions: actions.map((a) => {
		const m = a.trigger.match(/ONI ≥ \+(\d+(?:\.\d+)?)/);
		return m
			? { ...a, oni_threshold: +m[1], _synthetic: true }
			: { ...a, oni_threshold: null };
	})
});
write('scene7_calendar.json', {
	note: 'SYNTHETIC placeholder calendar — actions to be co-drafted with NDC / provincial DALs.',
	provinces: [
		cal('Enga', [
			{ month: 'Jul 26', action: 'Pre-position kaukau vine cuttings of frost-hardy varieties at ward level', trigger: 'ONI ≥ +1.5 for 2 consecutive months', lead_agency: 'NARI / Provincial DAL' },
			{ month: 'Aug 26', action: 'Community frost-watch rosters; clear night SMS alerts to ward recorders', trigger: 'Forecast clear-sky run ≥ 3 nights', lead_agency: 'PNG NWS / Provincial Disaster Office' },
			{ month: 'Sep 26', action: 'Open high-altitude food barter routes with lowland wards; subsidise transport', trigger: 'First confirmed frost event > 2,200 m', lead_agency: 'Provincial Administration' },
			{ month: 'Oct 26', action: 'Distribute quick-maturing vegetable seed for valley-floor replanting', trigger: 'Frost damage assessment > 20 % of gardens', lead_agency: 'DAL / Church networks' },
			{ month: 'Nov 26', action: 'Cash-for-work on water storage before the dry deepens', trigger: 'CHIRPS 30-day rainfall < 20th percentile', lead_agency: 'NDC / Development partners' }
		]),
		cal('Hela', [
			{ month: 'Jul 26', action: 'Stage drought-and-frost awareness through church and haus krai networks', trigger: 'ONI ≥ +1.5 sustained', lead_agency: 'Provincial Disaster Office' },
			{ month: 'Aug 26', action: 'Pre-position water containers and purification at aid posts', trigger: 'Rainfall < 20th percentile for 30 days', lead_agency: 'Health / NDC' },
			{ month: 'Sep 26', action: 'Frost-watch and mulching drives in gardens above 2,000 m', trigger: 'First frost report in neighbouring Enga', lead_agency: 'DAL / NARI' },
			{ month: 'Oct 26', action: 'School feeding contingency for high-valley communities', trigger: 'Garden damage assessment > 20 %', lead_agency: 'Education / Development partners' }
		]),
		cal('Western', [
			{ month: 'Aug 26', action: 'Dredge-clear community water points along the middle Fly', trigger: 'Fly River gauge below seasonal 25th percentile', lead_agency: 'Provincial Works' },
			{ month: 'Sep 26', action: 'Pre-position sago supplies and fuel for river ambulances', trigger: 'River transport draft restrictions declared', lead_agency: 'NDC / Provincial Administration' },
			{ month: 'Oct 26', action: 'Rainwater tank checks at schools and aid posts; ration plans', trigger: 'CHIRPS 60-day rainfall < 10th percentile', lead_agency: 'Health / Education' },
			{ month: 'Nov 26', action: 'Riverine food-relief corridors agreed with churches and OTML', trigger: 'Barge access lost above Kiunga', lead_agency: 'NDC / Private sector' }
		]),
		cal('Chimbu', [
			{ month: 'Jul 26', action: 'Map gardens above 2,200 m ward by ward; identify frost-exposed households', trigger: 'ONI ≥ +1.5 sustained', lead_agency: 'Provincial DAL' },
			{ month: 'Aug 26', action: 'Vine multiplication plots at mission stations for rapid replanting', trigger: 'Forecast peak ONI ≥ +2.0', lead_agency: 'NARI / Churches' },
			{ month: 'Sep 26', action: 'Night-temperature watch; radio frost warnings in Tok Ples', trigger: 'Clear-sky run ≥ 3 nights forecast', lead_agency: 'PNG NWS / Provincial radio' }
		])
	]
});

// ── posters: no-WebGL fallback for scene 1 (same palette as the shader) ────
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
		const len = Buffer.alloc(4);
		len.writeUInt32BE(data.length);
		const body = Buffer.concat([Buffer.from(type), data]);
		const crc = Buffer.alloc(4);
		crc.writeUInt32BE(crc32(body));
		return Buffer.concat([len, body, crc]);
	};
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
	const raw = Buffer.alloc((width * 4 + 1) * height);
	for (let y = 0; y < height; y++) {
		raw[y * (width * 4 + 1)] = 0; // filter: none
		rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
	}
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', ihdr),
		chunk('IDAT', deflateSync(raw, { level: 9 })),
		chunk('IEND', Buffer.alloc(0))
	]);
}

function poster(name, o, t) {
	const W = 720, H = 240;
	const rgba = Buffer.alloc(W * H * 4);
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			const lon = LON0 + ((x + 0.5) / W) * (LON1 - LON0);
			const lat = LAT1 - ((y + 0.5) / H) * (LAT1 - LAT0);
			const hex = fieldColor(fieldAnomaly(lon, lat, o, t), 'dark');
			const p = (y * W + x) * 4;
			rgba[p] = parseInt(hex.slice(1, 3), 16);
			rgba[p + 1] = parseInt(hex.slice(3, 5), 16);
			rgba[p + 2] = parseInt(hex.slice(5, 7), 16);
			rgba[p + 3] = 255;
		}
	}
	writeFileSync(POSTERS + name, pngEncode(W, H, rgba));
	console.log('wrote posters/' + name);
}
poster('sst_cool.png', fieldMonths[0], 0); // Jun 2025, La Niña
poster('sst_warm.png', fieldMonths[12], 12); // Jun 2026, +1.7

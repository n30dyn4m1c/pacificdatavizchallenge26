/**
 * palette.js — the single source of truth for every color in the piece.
 *
 * The SST anomaly scale is a DIVERGING palette: a cool arm and a warm arm
 * around a neutral midpoint (the midpoint is per-surface — near-surface gray —
 * so "no anomaly" reads as "nothing"). Both arms were validated as ordinal
 * ramps (monotone OKLCH lightness, adjacent ΔL ≥ 0.06, single hue, light end
 * ≥ 2:1 on the dark ocean surface) with the dataviz skill's validator.
 *
 * The chart SERIES set (two ghost grays + one accent) was validated per
 * surface. Two flags are accepted by design and carry their mandated relief:
 *   - the ghosts sit below the chroma floor because past events are
 *     DELIBERATELY de-emphasized to gray; their identity is carried by
 *     visible direct labels at each trace end, never by hue;
 *   - the lighter ghost on paper is sub-3:1 contrast (WARN band); relief is
 *     the direct labels plus the data-table fallback every chart ships.
 *
 * Used by: the WebGL shader (via anomalyGLSL / anomalyStops), all SVG charts
 * (via anomalyColor and the token objects), and the global CSS custom
 * properties emitted in +layout.svelte. Do not define colors anywhere else.
 */

// ── anomaly scale (°C) ───────────────────────────────────────────────────────
export const ANOM_MIN = -2.5;
export const ANOM_MAX = 2.5;

/** Diverging stops, cool pole → neutral → warm pole. Neutral is per-surface. */
export function anomalyStops(mode = 'dark') {
	const neutral = mode === 'dark' ? '#43474e' : '#e8e2d4';
	return [
		{ t: -2.5, hex: '#a8d4f8' },
		{ t: -1.6, hex: '#5fa8ee' },
		{ t: -0.8, hex: '#2a78d6' },
		{ t: -0.3, hex: '#2f4f7d' },
		{ t: 0.0, hex: neutral },
		{ t: 0.3, hex: '#8a3524' },
		{ t: 0.8, hex: '#c74331' },
		{ t: 1.6, hex: '#f2775c' },
		{ t: 2.5, hex: '#ffb096' }
	];
}

const hex2rgb = (h) => {
	const s = h.replace('#', '');
	return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const rgb2hex = (r) =>
	'#' + r.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('');

/** anomaly (°C) → hex, piecewise-linear between stops. No d3 needed. */
export function anomalyColor(value, mode = 'dark') {
	const stops = anomalyStops(mode);
	const v = Math.max(ANOM_MIN, Math.min(ANOM_MAX, value));
	let i = 0;
	while (i < stops.length - 2 && v > stops[i + 1].t) i++;
	const a = stops[i];
	const b = stops[i + 1];
	const f = (v - a.t) / (b.t - a.t || 1);
	const ca = hex2rgb(a.hex);
	const cb = hex2rgb(b.hex);
	return rgb2hex(ca.map((c, k) => c + (cb[k] - c) * f));
}

/**
 * Emit a GLSL function `vec3 anomalyColor(float a)` (a in °C) built from the
 * SAME stops, so the shader field and the SVG charts cannot drift apart.
 */
export function anomalyGLSL(mode = 'dark') {
	const stops = anomalyStops(mode);
	const v3 = (hex) =>
		'vec3(' + hex2rgb(hex).map((c) => (c / 255).toFixed(4)).join(', ') + ')';
	let src = `vec3 anomalyColor(float a) {\n  vec3 c = ${v3(stops[0].hex)};\n`;
	for (let i = 1; i < stops.length; i++) {
		const t0 = stops[i - 1].t.toFixed(3);
		const t1 = stops[i].t.toFixed(3);
		src += `  c = mix(c, ${v3(stops[i].hex)}, clamp((a - ${t0}) / (${t1} - ${t0}), 0.0, 1.0));\n`;
	}
	src += '  return c;\n}\n';
	return src;
}

/**
 * Continuous-field treatment (shader + poster only, never discrete marks):
 * near-zero anomaly recedes toward the ocean surface so the field reads as
 * water with a signal in it, not as a gray poster. |a| ≥ FIELD_FULL wears the
 * full anomaly color.
 */
export const FIELD_FLOOR = 0.18;
export const FIELD_FULL = 0.9;

/** JS twin of the GLSL field blend — used by the poster generator. */
export function fieldColor(a, mode = 'dark') {
	const surf = mode === 'dark' ? surfaces.ocean : surfaces.paper;
	const w = FIELD_FLOOR + (1 - FIELD_FLOOR) * Math.min(1, Math.abs(a) / FIELD_FULL);
	const cs = hex2rgb(surf);
	const ca = hex2rgb(anomalyColor(a, mode));
	return rgb2hex(cs.map((c, k) => c + (ca[k] - c) * w));
}

/** GLSL twin: `vec3 fieldColor(float a)` — requires anomalyColor() above it. */
export function fieldGLSL(mode = 'dark') {
	const surf = mode === 'dark' ? surfaces.ocean : surfaces.paper;
	const v3 =
		'vec3(' + hex2rgb(surf).map((c) => (c / 255).toFixed(4)).join(', ') + ')';
	return (
		`vec3 fieldColor(float a) {\n` +
		`  float w = ${FIELD_FLOOR.toFixed(3)} + ${(1 - FIELD_FLOOR).toFixed(3)} * clamp(abs(a) / ${FIELD_FULL.toFixed(3)}, 0.0, 1.0);\n` +
		`  return mix(${v3}, anomalyColor(a), w);\n}\n`
	);
}

// ── surfaces & ink (ocean → paper progression) ──────────────────────────────
export const surfaces = {
	ocean: '#060a12', //   scenes 1–3: near-black Pacific
	oceanRaised: '#0c1220',
	paper: '#f7f3ea', //   scenes 5–7: warm paper
	paperRaised: '#fffdf7'
};

export const ink = {
	dark: {
		primary: '#f4f2ec',
		secondary: '#b8bcc4',
		muted: '#7d838d',
		grid: '#1b2330',
		axis: '#333c4c'
	},
	light: {
		primary: '#1d1a14',
		secondary: '#55503f',
		muted: '#8a8578',
		grid: '#e5ddcc',
		axis: '#c9c0aa'
	}
};

// ── chart series (validated per surface — see header) ──────────────────────
export const series = {
	dark: { ghost1: '#6b727d', ghost2: '#8b929f', accent: '#e8603f' },
	light: { ghost1: '#6f6a5c', ghost2: '#9b9280', accent: '#c74331' }
};

/** Impact colors reuse the anomaly arms: drought = warm arm, frost = cool arm. */
export const impact = {
	dark: { drought: '#f2775c', frost: '#a8d4f8' },
	light: { drought: '#c74331', frost: '#2a78d6' }
};

/**
 * The official PNG-NWS/NARI Drought Early Warning System tiers, in NARI's
 * own vocabulary and escalation order. Colors are the anomaly scale's warm
 * arm read as an ordinal ramp (watch → critical = deepening severity), so
 * the choropleth stays inside the piece's one palette. `none` renders as
 * the raised surface, not a tier color.
 */
export const DEWS_TIERS = ['watch', 'alert', 'critical'];
export const dewsLabel = {
	watch: 'Drought Watch',
	alert: 'Drought Alert',
	critical: 'Drought Critical'
};
export const dews = {
	light: { watch: '#f2775c', alert: '#c74331', critical: '#8a3524' },
	dark: { watch: '#ffb096', alert: '#f2775c', critical: '#c74331' }
};

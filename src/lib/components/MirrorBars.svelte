<script>
	/**
	 * MirrorBars — the reveal chart. Two diverging annual bar charts sharing
	 * one year axis: the far ocean above (ONI — Niño 3.4, El Niño up in the
	 * warm arm, La Niña down in the cool arm) and Papua New Guinea's rainfall
	 * anomaly below (dry down in the warm arm, wet up in the cool arm). The
	 * warm color means the same thing in both bands — "El Niño side" — so the
	 * eye can walk a red spike straight down into the rain shortfall beneath
	 * it. Progress sweeps the years in; marked years get a connector and label.
	 * 2025's ONI is null in the source ("pending") and renders as an open ?
	 * marker — the record's still-being-written last column.
	 */
	import { scaleLinear } from 'd3-scale';
	import { ink, impact } from '$lib/palette.js';

	let {
		years = [], // [{year, oni, phase, rain, driest?}]
		markYears = [],
		mode = 'light',
		progress = 1,
		/** the far-ocean band fades in when the narrative calls it up */
		showOni = true,
		height = 470,
		ariaLabel
	} = $props();

	const PAD = { l: 52, r: 20, t: 34, b: 30 };
	const GAP = 44; // vertical gap between the two bands
	let w = $state(720);

	const inkC = $derived(ink[mode]);
	const imp = $derived(impact[mode]);

	const yrMin = $derived(Math.min(...years.map((d) => d.year)));
	const yrMax = $derived(Math.max(...years.map((d) => d.year)));
	const x = $derived(scaleLinear([yrMin - 0.5, yrMax + 0.5], [PAD.l, Math.max(w, 300) - PAD.r]));
	const bw = $derived(Math.max(2, ((Math.max(w, 300) - PAD.l - PAD.r) / years.length) * 0.7));

	// two bands, each its own diverging scale around zero
	const bandH = $derived((height - PAD.t - PAD.b - GAP) / 2);
	const oniExt = $derived(Math.max(...years.map((d) => Math.abs(d.oni ?? 0))) * 1.15 || 1);
	const rainExt = $derived(Math.max(...years.map((d) => Math.abs(d.rain))) * 1.15 || 1);
	const yOni = $derived(scaleLinear([-oniExt, oniExt], [PAD.t + bandH, PAD.t]));
	const yRain = $derived(scaleLinear([-rainExt, rainExt], [PAD.t + bandH + GAP + bandH, PAD.t + bandH + GAP]));

	const shown = $derived(Math.max(0, Math.min(1, progress)));
	const visibleUpTo = $derived(yrMin + shown * (yrMax - yrMin));

	// one meaning for the warm color in both bands: the El Niño side
	const oniColor = (v) => (v >= 0 ? imp.drought : imp.frost);
	const rainColor = (v) => (v < 0 ? imp.drought : imp.frost);
	const fmt = (v, p = 1) => (v > 0 ? '+' : '') + v.toFixed(p);
</script>

<div class="wrap" bind:clientWidth={w}>
	<svg viewBox="0 0 {Math.max(w, 300)} {height}" role="img" aria-label={ariaLabel}>
		<!-- band titles -->
		<text x={PAD.l} y={PAD.t - 16} font-size="11.5" font-weight="700" fill={inkC.secondary}
			opacity={showOni ? 1 : 0} style="transition: opacity 0.5s">
			THE FAR OCEAN · Oceanic Niño Index (°C) — El Niño up, La Niña down
		</text>
		<text x={PAD.l} y={PAD.t + bandH + GAP - 12} font-size="11.5" font-weight="700" fill={inkC.secondary}>
			THE RAIN AT HOME · Papua New Guinea rainfall anomaly (mm)
		</text>

		<!-- zero baselines -->
		<line x1={PAD.l} x2={Math.max(w, 300) - PAD.r} y1={yOni(0)} y2={yOni(0)} stroke={inkC.axis} stroke-width="1.3"
			opacity={showOni ? 1 : 0} style="transition: opacity 0.5s" />
		<line x1={PAD.l} x2={Math.max(w, 300) - PAD.r} y1={yRain(0)} y2={yRain(0)} stroke={inkC.axis} stroke-width="1.3" />

		{#each years as d (d.year)}
			{@const on = d.year <= visibleUpTo}
			{@const marked = markYears.includes(d.year)}
			<!-- ONI bar (or the pending "?" for a year not yet classified) -->
			{#if d.oni != null}
				<rect
					x={x(d.year) - bw / 2}
					y={d.oni >= 0 ? yOni(d.oni) : yOni(0)}
					width={bw}
					height={Math.abs(yOni(d.oni) - yOni(0))}
					rx="1.5"
					fill={oniColor(d.oni)}
					opacity={!showOni ? 0 : on ? (marked ? 1 : 0.55) : 0}
					style="transition: opacity 0.4s"
				/>
			{:else}
				<text
					x={x(d.year)}
					y={yOni(0) - 6}
					text-anchor="middle"
					font-size="13"
					font-weight="700"
					fill={inkC.muted}
					opacity={!showOni ? 0 : on ? 0.9 : 0}
					style="transition: opacity 0.4s"
				>?</text>
			{/if}
			<!-- rain bar -->
			<rect
				x={x(d.year) - bw / 2}
				y={d.rain >= 0 ? yRain(d.rain) : yRain(0)}
				width={bw}
				height={Math.abs(yRain(d.rain) - yRain(0))}
				fill={rainColor(d.rain)}
				opacity={on ? (marked ? 1 : 0.55) : 0}
				style="transition: opacity 0.25s"
			/>
			<!-- marked years: a faint connector walks the eye from spike to shortfall -->
			{#if marked && on && showOni}
				<line
					x1={x(d.year)}
					x2={x(d.year)}
					y1={yOni(Math.max(0, d.oni ?? 0)) - 4}
					y2={d.rain < 0 ? yRain(d.rain) + 4 : yRain(0)}
					stroke={imp.drought}
					stroke-width="1"
					stroke-dasharray="2 4"
					opacity="0.6"
				/>
				<text
					x={x(d.year)}
					y={yOni(Math.max(0, d.oni ?? 0)) - 10}
					text-anchor="middle"
					font-size="11.5"
					font-weight="700"
					fill={inkC.primary}
				>{d.year}</text>
				<text
					x={x(d.year)}
					y={yRain(Math.min(0, d.rain)) + 16}
					text-anchor="middle"
					font-size="10"
					fill={inkC.secondary}
				>{fmt(d.rain)} mm</text>
			{/if}
		{/each}

		<!-- decade ticks along the bottom edge (the gap belongs to the band title) -->
		{#each years.map((d) => d.year).filter((yr) => yr % 10 === 0) as yr (yr)}
			<text
				x={x(yr)}
				y={height - 6}
				text-anchor="middle"
				font-size="11"
				fill={inkC.muted}
			>{yr}</text>
		{/each}
	</svg>
</div>

<style>
	.wrap {
		position: relative;
		width: 100%;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
	}
</style>

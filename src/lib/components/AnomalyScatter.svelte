<script>
	/**
	 * AnomalyScatter — the alibi chart. Every year 1979–2025 as one dot:
	 * x = Papua New Guinea's own sea-surface anomaly that year (°C),
	 * y = its rainfall anomaly (mm). If the local sea stole the rain, the dry
	 * years would sit bottom-right (warm sea, no rain). They sit bottom-LEFT:
	 * every driest year had a cool-or-ordinary local sea. Progress drives the
	 * dots in year order, then lifts the driest five into the accent with
	 * direct labels — identity is never colour alone.
	 */
	import { scaleLinear } from 'd3-scale';
	import { ink, impact, series as seriesColors } from '$lib/palette.js';

	let {
		points = [],
		driest = [],
		mode = 'dark',
		progress = 1,
		height = 420,
		ariaLabel
	} = $props();

	const PAD = { l: 52, r: 24, t: 30, b: 42 };
	let w = $state(720);

	const inkC = $derived(ink[mode]);
	const imp = $derived(impact[mode]);
	const colors = $derived(seriesColors[mode]);

	const xExt = $derived(Math.max(...points.map((d) => Math.abs(d.sst))) * 1.15 || 1);
	const yExt = $derived(Math.max(...points.map((d) => Math.abs(d.rain))) * 1.12 || 1);
	const x = $derived(scaleLinear([-xExt, xExt], [PAD.l, Math.max(w, 300) - PAD.r]));
	const y = $derived(scaleLinear([-yExt, yExt], [height - PAD.b, PAD.t]));

	// phases of the reveal, driven by scene progress
	const dotsIn = $derived(Math.max(0, Math.min(1, progress / 0.4))); // dots arrive in year order
	const showQuadrant = $derived(progress > 0.28); // "warm corner" annotation
	const showDriest = $derived(progress > 0.5); // driest five lift out

	const ordered = $derived(points.slice().sort((a, b) => a.year - b.year));
	const visibleCount = $derived(Math.round(dotsIn * ordered.length));
	const isDriest = (d) => driest.includes(d.year);
</script>

<div class="wrap" bind:clientWidth={w}>
	<svg viewBox="0 0 {Math.max(w, 300)} {height}" role="img" aria-label={ariaLabel}>
		<!-- zero cross: the two "ordinary" lines -->
		<line x1={x(0)} x2={x(0)} y1={PAD.t} y2={height - PAD.b} stroke={inkC.axis} stroke-width="1.2" />
		<line x1={PAD.l} x2={Math.max(w, 300) - PAD.r} y1={y(0)} y2={y(0)} stroke={inkC.axis} stroke-width="1.2" />

		<!-- axis captions -->
		<text x={Math.max(w, 300) - PAD.r} y={y(0) - 8} text-anchor="end" font-size="11" fill={inkC.muted}>
			warmer local sea →
		</text>
		<text x={PAD.l} y={y(0) - 8} font-size="11" fill={inkC.muted}>← cooler</text>
		<text x={x(0) + 8} y={PAD.t + 4} font-size="11" fill={inkC.muted}>wetter ↑</text>
		<text x={x(0) + 8} y={height - PAD.b - 6} font-size="11" fill={inkC.muted}>drier ↓</text>

		<!-- the "warm corner": where dry years would fall if the local sea were the thief -->
		{#if showQuadrant}
			<rect
				x={x(0)}
				y={y(0)}
				width={Math.max(w, 300) - PAD.r - x(0)}
				height={height - PAD.b - y(0)}
				fill={imp.drought}
				opacity="0.07"
			/>
			<text
				x={Math.max(w, 300) - PAD.r - 8}
				y={height - PAD.b - 12}
				text-anchor="end"
				font-size="11.5"
				font-style="italic"
				fill={inkC.secondary}
			>if the local sea took the rain, the dry years would be here</text>
		{/if}

		{#each ordered as d, i (d.year)}
			{@const on = i < visibleCount}
			{@const hot = showDriest && isDriest(d)}
			<circle
				cx={x(d.sst)}
				cy={y(d.rain)}
				r={hot ? 6 : 4}
				fill={hot ? imp.drought : colors.ghost1}
				opacity={on ? (hot ? 1 : showDriest ? 0.4 : 0.75) : 0}
				style="transition: opacity 0.3s, fill 0.3s, r 0.3s"
			/>
			{#if hot}
				<!-- 1982/1992 and 1993 sit close together: hang those labels below -->
				<text
					x={x(d.sst)}
					y={y(d.rain) + (d.year === 1993 || d.year === 1982 ? 22 : -12)}
					text-anchor="middle"
					font-size="11.5"
					font-weight="700"
					fill={inkC.primary}
				>{d.year}</text>
			{/if}
		{/each}

		<!-- unit hints -->
		<text x={Math.max(w, 300) - PAD.r} y={height - 8} text-anchor="end" font-size="10.5" fill={inkC.muted}>
			x: local sea-surface anomaly (°C) · y: rainfall anomaly (mm) · one dot per year, 1979–2025
		</text>
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

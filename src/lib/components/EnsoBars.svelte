<script>
	/**
	 * EnsoBars — the see-saw chart. One diverging bar per year of the Oceanic
	 * Niño Index: El Niño up, La Niña down. Starts as neutral gray ("just a
	 * wiggly measurement"), takes the piece's two meaning colors when
	 * `colored` flips, and labels the marked years directly. A year whose ONI
	 * is still unclassified (2025, `oni: null`) renders as an open "?" — the
	 * record's still-being-written last column.
	 */
	import { scaleLinear } from 'd3-scale';
	import { ink, impact, series as seriesColors } from '$lib/palette.js';

	let {
		years = [], // [{year, oni, phase}]
		colored = false,
		marks = [],
		progress = 1,
		mode = 'light',
		height = 420,
		ariaLabel
	} = $props();

	const PAD = { l: 16, r: 16, t: 56, b: 58 };
	let w = $state(720);

	const inkC = $derived(ink[mode]);
	const imp = $derived(impact[mode]);
	const ghost = $derived(seriesColors[mode].ghost1);

	const yrMin = $derived(Math.min(...years.map((d) => d.year)));
	const yrMax = $derived(Math.max(...years.map((d) => d.year)));
	const x = $derived(scaleLinear([yrMin - 0.5, yrMax + 0.5], [PAD.l, Math.max(w, 300) - PAD.r]));
	const ext = $derived(Math.max(...years.map((d) => Math.abs(d.oni ?? 0))) * 1.18 || 1);
	const y = $derived(scaleLinear([-ext, ext], [height - PAD.b, PAD.t]));
	const bw = $derived(Math.max(3, ((Math.max(w, 300) - PAD.l - PAD.r) / years.length) * 0.68));

	const visibleUpTo = $derived(yrMin + Math.max(0, Math.min(1, progress)) * (yrMax - yrMin));
	const color = (v) => (!colored ? ghost : v >= 0 ? imp.drought : imp.frost);
</script>

<div class="wrap" bind:clientWidth={w}>
	<svg viewBox="0 0 {Math.max(w, 300)} {height}" role="img" aria-label={ariaLabel}>
		<!-- zero line: "an ordinary year" -->
		<line x1={PAD.l} x2={Math.max(w, 300) - PAD.r} y1={y(0)} y2={y(0)} stroke={inkC.axis} stroke-width="1.4" />

		<!-- arm labels appear once the colors mean something -->
		<g style="transition: opacity 0.5s" opacity={colored ? 1 : 0}>
			<text x={PAD.l + 2} y={PAD.t - 34} font-size="13" font-weight="700" fill={imp.drought}>
				El Niño ↑ warm water drains east
			</text>
			<text x={PAD.l + 2} y={height - PAD.b + 24} font-size="13" font-weight="700" fill={imp.frost}>
				La Niña ↓ warmth piles back west
			</text>
		</g>

		{#each years as d (d.year)}
			{@const on = d.year <= visibleUpTo}
			{@const marked = marks.includes(d.year)}
			{#if d.oni != null}
				<rect
					x={x(d.year) - bw / 2}
					y={d.oni >= 0 ? y(d.oni) : y(0)}
					width={bw}
					height={Math.abs(y(d.oni) - y(0))}
					rx="1.5"
					fill={color(d.oni)}
					opacity={on ? (marks.length && !marked ? 0.45 : 0.88) : 0}
					style="transition: opacity 0.3s, fill 0.5s"
				/>
				{#if marked && on}
					<text
						x={x(d.year)}
						y={y(Math.max(0, d.oni)) - 10}
						text-anchor="middle"
						font-size="13"
						font-weight="800"
						fill={inkC.primary}
					>{d.year}</text>
				{/if}
			{:else}
				<text
					x={x(d.year)}
					y={y(0) - 8}
					text-anchor="middle"
					font-size="14"
					font-weight="800"
					fill={inkC.muted}
					opacity={on ? 0.9 : 0}
					style="transition: opacity 0.3s"
				>?</text>
			{/if}
		{/each}

		{#each years.map((d) => d.year).filter((yr) => yr % 10 === 0) as yr (yr)}
			<text x={x(yr)} y={height - 8} text-anchor="middle" font-size="12" fill={inkC.muted}>{yr}</text>
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

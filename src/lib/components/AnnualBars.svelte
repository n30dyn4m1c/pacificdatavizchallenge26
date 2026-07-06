<script>
	/**
	 * AnnualBars — diverging annual bars around a zero baseline, for anomaly
	 * series (scene 3 rainfall). Bars grow in left-to-right with `progress`.
	 * Sign carries meaning through the shared palette: below-normal (dry) bars
	 * take the warm/drought arm, above-normal (wet) the cool arm. Highlighted
	 * years (`markYears`) get a direct label — identity is never colour alone.
	 */
	import { scaleLinear } from 'd3-scale';
	import { ink, impact } from '$lib/palette.js';

	let {
		values,
		mode = 'dark',
		progress = 1,
		unit = '',
		markYears = [],
		height = 420,
		ariaLabel
	} = $props();

	const PAD = { l: 44, r: 20, t: 26, b: 30 };
	let w = $state(720);

	const inkC = $derived(ink[mode]);
	const imp = $derived(impact[mode]);

	const years = $derived(values.map((d) => d.year));
	const x = $derived(scaleLinear([Math.min(...years) - 0.5, Math.max(...years) + 0.5], [PAD.l, Math.max(w, 300) - PAD.r]));
	const ext = $derived(Math.max(...values.map((d) => Math.abs(d.value))) * 1.15);
	const y = $derived(scaleLinear([-ext, ext], [height - PAD.b, PAD.t]));
	const bw = $derived(Math.max(2, ((Math.max(w, 300) - PAD.l - PAD.r) / values.length) * 0.72));

	const shown = $derived(Math.max(0, Math.min(1, progress)));
	const visibleUpTo = $derived(Math.min(...years) + shown * (Math.max(...years) - Math.min(...years)));

	// dry (negative rainfall anomaly) = drought arm; wet (positive) = cool arm
	const barColor = (v, marked) => (v < 0 ? imp.drought : imp.frost);
	const fmt = (v) => (v > 0 ? '+' : '') + v.toFixed(1);
</script>

<div class="wrap" bind:clientWidth={w}>
	<svg
		viewBox="0 0 {Math.max(w, 300)} {height}"
		role="img"
		aria-label={ariaLabel}
	>
		<!-- zero baseline -->
		<line x1={PAD.l} x2={Math.max(w, 300) - PAD.r} y1={y(0)} y2={y(0)} stroke={inkC.axis} stroke-width="1.5" />
		<text x={PAD.l - 6} y={y(0) + 4} text-anchor="end" font-size="11" fill={inkC.muted}>0</text>
		<text x={PAD.l - 6} y={y(ext * 0.66) + 4} text-anchor="end" font-size="11" fill={inkC.muted}>wetter</text>
		<text x={PAD.l - 6} y={y(-ext * 0.66) + 4} text-anchor="end" font-size="11" fill={inkC.muted}>drier</text>

		{#each values as d (d.year)}
			{@const marked = markYears.includes(d.year)}
			{@const on = d.year <= visibleUpTo}
			<rect
				x={x(d.year) - bw / 2}
				y={d.value >= 0 ? y(d.value) : y(0)}
				width={bw}
				height={Math.abs(y(d.value) - y(0))}
				fill={barColor(d.value, marked)}
				opacity={on ? (marked ? 1 : 0.62) : 0}
				style="transition: opacity 0.25s"
			/>
			{#if marked && on}
				<text
					x={x(d.year)}
					y={d.value < 0 ? y(d.value) + 16 : y(d.value) - 8}
					text-anchor="middle"
					font-size="11.5"
					font-weight="700"
					fill={inkC.primary}
				>{d.year}</text>
				<text
					x={x(d.year)}
					y={d.value < 0 ? y(d.value) + 30 : y(d.value) - 22}
					text-anchor="middle"
					font-size="10"
					fill={inkC.secondary}
				>{fmt(d.value)} {unit}</text>
			{/if}
		{/each}

		<!-- decade ticks -->
		{#each years.filter((yr) => yr % 10 === 0) as yr (yr)}
			<text x={x(yr)} y={height - 8} text-anchor="middle" font-size="11" fill={inkC.muted}>{yr}</text>
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

<script>
	/**
	 * AnnualLines — a multi-series annual line chart for the real SPC record.
	 * D3 does scales/shapes only; Svelte owns the DOM. `progress` (0–1) draws
	 * the traces in from the left, so scrolling advances time. Series identity
	 * is carried by a direct label at each trace end (never colour alone);
	 * `ghost` series render in the neutral grays, `accent` in the accent hue.
	 *
	 * Shared by scenes 2, 6 and 7. A zero baseline is drawn for anomaly units.
	 */
	import { scaleLinear } from 'd3-scale';
	import { line as d3line, curveMonotoneX } from 'd3-shape';
	import { series as seriesColors, ink } from '$lib/palette.js';

	let {
		series,
		mode = 'dark',
		progress = 1,
		unit = '',
		yDomain = null,
		baseline = 0,
		height = 420,
		compact = false,
		markYears = [],
		markLabel = '',
		ariaLabel
	} = $props();

	const PAD = $derived(compact ? { l: 34, r: 60, t: 12, b: 22 } : { l: 44, r: 118, t: 18, b: 30 });
	let w = $state(720);

	const colors = $derived(seriesColors[mode]);
	const inkC = $derived(ink[mode]);

	const allYears = $derived(series.flatMap((s) => s.values.map((d) => d.year)));
	const allVals = $derived(series.flatMap((s) => s.values.map((d) => d.value)));
	const x = $derived(scaleLinear([Math.min(...allYears), Math.max(...allYears)], [PAD.l, Math.max(w, 300) - PAD.r]));
	const yd = $derived(yDomain ?? niceDomain(allVals, baseline));
	const y = $derived(scaleLinear(yd, [height - PAD.b, PAD.t]));

	function niceDomain(vals, base) {
		let lo = Math.min(...vals);
		let hi = Math.max(...vals);
		if (base != null) { lo = Math.min(lo, base); hi = Math.max(hi, base); }
		const pad = (hi - lo) * 0.12 || 1;
		return [lo - pad, hi + pad];
	}

	const gen = $derived(d3line().x((d) => x(d.year)).y((d) => y(d.value)).curve(curveMonotoneX));
	const colorOf = (s) => (s.accent ? colors.accent : s.ghost ? colors.ghost2 : colors.ghost1);

	// draw-in: reveal each path proportionally to progress (≈ along the year axis)
	const frac = $derived(Math.max(0, Math.min(1, progress)));

	// y ticks: a small set spanning the domain, always including the baseline
	const yTicks = $derived.by(() => {
		const [lo, hi] = yd;
		const step = niceStep((hi - lo) / 4);
		const ticks = [];
		for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) ticks.push(+t.toFixed(4));
		if (baseline != null && !ticks.includes(baseline) && baseline > lo && baseline < hi) ticks.push(baseline);
		return ticks;
	});
	function niceStep(raw) {
		const p = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)));
		const n = raw / p;
		return (n >= 5 ? 5 : n >= 2 ? 2 : 1) * p;
	}
	const fmt = (v) => v == null ? '' : (unit === '°C' && v > 0 ? '+' : '') + (Math.abs(v) < 1 && v !== 0 ? v.toFixed(2) : v.toFixed(v % 1 ? 1 : 0));

	// hover readout
	let hoverYear = $state(null);
	function onMove(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * Math.max(w, 300);
		hoverYear = Math.round(x.invert(px));
	}
	const near = (s, yr) => s.values.reduce((b, d) => (Math.abs(d.year - yr) < Math.abs(b.year - yr) ? d : b), s.values[0]);
</script>

<div class="wrap" bind:clientWidth={w}>
	<svg
		viewBox="0 0 {Math.max(w, 300)} {height}"
		role="img"
		aria-label={ariaLabel}
		onpointermove={onMove}
		onpointerleave={() => (hoverYear = null)}
	>
		{#each yTicks as t (t)}
			<line
				x1={PAD.l}
				x2={Math.max(w, 300) - PAD.r + (compact ? 6 : 46)}
				y1={y(t)}
				y2={y(t)}
				stroke={t === baseline ? inkC.axis : inkC.grid}
				stroke-width={t === baseline ? 1.5 : 1}
			/>
			<text x={PAD.l - 6} y={y(t) + 4} text-anchor="end" font-size={compact ? 9 : 11} fill={inkC.muted}>
				{fmt(t)}
			</text>
		{/each}

		<!-- x labels: first, last, and a couple between -->
		{#if !compact}
			{@const y0 = Math.min(...allYears)}
			{@const y1 = Math.max(...allYears)}
			{#each [y0, Math.round((y0 * 2 + y1) / 3), Math.round((y0 + y1 * 2) / 3), y1] as yr (yr)}
				<text x={x(yr)} y={height - 8} text-anchor="middle" font-size="11" fill={inkC.muted}>{yr}</text>
			{/each}
		{/if}

		<!-- highlighted years: faint verticals revealed as the draw-in passes them -->
		{#each markYears as yr (yr)}
			{@const on = (x(yr) - PAD.l) / (Math.max(w, 300) - PAD.r - PAD.l) <= frac + 0.001}
			<line
				x1={x(yr)}
				x2={x(yr)}
				y1={PAD.t}
				y2={height - PAD.b}
				stroke={colors.accent}
				stroke-width="1"
				stroke-dasharray="3 4"
				opacity={on ? 0.55 : 0}
				style="transition: opacity 0.3s"
			/>
			{#if !compact}
				<text x={x(yr)} y={PAD.t - 4} text-anchor="middle" font-size="10" fill={colors.accent} opacity={on ? 0.9 : 0}>{yr}</text>
			{/if}
		{/each}

		{#each series as s (s.key)}
			<path
				d={gen(s.values)}
				fill="none"
				stroke={colorOf(s)}
				stroke-width={s.accent ? (compact ? 2 : 2.6) : compact ? 1.3 : 1.7}
				stroke-linecap="round"
				stroke-linejoin="round"
				pathLength="1"
				stroke-dasharray="1"
				stroke-dashoffset={1 - frac}
			/>
			{#if !compact && frac > 0.92}
				{@const last = s.values.at(-1)}
				<text
					x={x(last.year) + 8}
					y={y(last.value) + 4}
					font-size="12"
					font-weight="600"
					fill={s.accent ? colorOf(s) : inkC.secondary}
					opacity={(frac - 0.92) / 0.08}
				>{s.name.split(' — ').at(-1)}</text>
			{/if}
		{/each}

		{#if hoverYear !== null}
			<line x1={x(hoverYear)} x2={x(hoverYear)} y1={PAD.t} y2={height - PAD.b} stroke={inkC.axis} />
		{/if}
	</svg>

	{#if hoverYear !== null && !compact}
		<div class="readout" style="color:{inkC.secondary}">
			<strong style="color:{inkC.primary}">{hoverYear}</strong>
			{#each series as s (s.key)}
				{@const d = near(s, hoverYear)}
				<span><span class="swatch" style="background:{colorOf(s)}"></span>{fmt(d.value)}{unit ? ' ' + unit : ''}</span>
			{/each}
		</div>
	{/if}
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
		touch-action: pan-y;
	}
	.readout {
		position: absolute;
		top: 0;
		left: 3rem;
		display: flex;
		gap: 0.9rem;
		flex-wrap: wrap;
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}
	.swatch {
		display: inline-block;
		width: 10px;
		height: 3px;
		vertical-align: middle;
		margin-right: 0.25rem;
		border-radius: 2px;
	}
</style>

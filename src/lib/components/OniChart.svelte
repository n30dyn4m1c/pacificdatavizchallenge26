<script>
	/**
	 * OniChart — the event-overlay line chart, reused by scenes 2 and 6.
	 * D3 does scales/shapes only; Svelte owns the DOM. `progress` (0–1)
	 * draws the traces in sequence: ghost 1997–98, ghost 2015–16, then the
	 * current event. Identity is carried by direct labels (the ghosts are
	 * deliberately gray). Optional `plume` adds the forecast p10–p90 band.
	 */
	import { scaleLinear } from 'd3-scale';
	import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
	import { series as seriesColors, ink } from '$lib/palette.js';

	let { events, progress = 1, mode = 'dark', plume = null, ariaLabel } = $props();

	const H = 420;
	const PAD = { l: 46, r: 96, t: 18, b: 34 };
	let w = $state(720);

	const colors = $derived(seriesColors[mode]);
	const inkC = $derived(ink[mode]);

	const n = $derived(Math.max(...events.map((e) => e.series.length)));
	// with a plume, the x-domain extends past the observed months to fit it
	const span = $derived(n - 1 + (plume?.length ?? 0));
	const x = $derived(scaleLinear([0, span], [PAD.l, Math.max(w, 320) - PAD.r]));
	const y = $derived(scaleLinear([-2, 3], [H - PAD.b, PAD.t]));

	const lineGen = $derived(
		d3line()
			.x((d, i) => x(d.i ?? i))
			.y((d) => y(d.oni))
			.curve(curveMonotoneX)
	);

	// per-event draw windows over scene progress
	const windows = [
		[0.04, 0.32],
		[0.3, 0.58],
		[0.56, 0.96]
	];
	const frac = (i) => {
		const [s, e] = windows[Math.min(i, windows.length - 1)];
		return Math.max(0, Math.min(1, (progress - s) / (e - s)));
	};

	// split the current (flagged) event into observed & forecast parts
	const parts = $derived(
		events.map((ev) => {
			const pts = ev.series.map((d, i) => ({ ...d, i }));
			const split = pts.findIndex((d) => d.forecast);
			return split === -1
				? { observed: pts, forecast: [] }
				: { observed: pts.slice(0, split), forecast: pts.slice(split - 1) };
		})
	);

	// the accent always belongs to the current (last) event; past events are
	// ghosts — color follows the entity, not its slot count
	const seriesColor = (i) =>
		i === events.length - 1 ? colors.accent : [colors.ghost1, colors.ghost2][i] ?? colors.ghost2;

	// plume band (forecast months follow the observed months of the last event)
	const plumeArea = $derived.by(() => {
		if (!plume) return null;
		const start = parts.at(-1).observed.length - 1;
		const pts = plume.map((d, i) => ({ ...d, i: start + i }));
		return {
			band: d3area()
				.x((d) => x(d.i))
				.y0((d) => y(d.p10))
				.y1((d) => y(d.p90))
				.curve(curveMonotoneX)(pts),
			median: d3line()
				.x((d) => x(d.i))
				.y((d) => y(d.p50))
				.curve(curveMonotoneX)(pts)
		};
	});

	const ticksY = [-2, -1, 0, 1, 2, 3];
	const ticksX = $derived([0, 3, 6, 9, 12, 15].filter((i) => i <= span));
	// x labels: observed months of the reference event, then plume months
	const xLabels = $derived.by(() => {
		const base = events[0].series.map((d) => d.month);
		if (plume) for (const d of plume) base.push(d.month);
		return base;
	});
	const monthName = (i) => xLabels[i]?.split(' ')[0] ?? '';

	// hover readout (corner box, no per-point tooltip collisions)
	let hoverI = $state(null);
	function onPointerMove(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * Math.max(w, 320);
		const i = Math.round(x.invert(px));
		hoverI = i >= 0 && i <= span ? i : null;
	}
	const fmt = (v) => (v > 0 ? '+' : '') + v.toFixed(1);
</script>

<div class="wrap" bind:clientWidth={w}>
	<svg
		class="chart"
		viewBox="0 0 {Math.max(w, 320)} {H}"
		role="img"
		aria-label={ariaLabel}
		onpointermove={onPointerMove}
		onpointerleave={() => (hoverI = null)}
	>
		<!-- grid + axes (recessive) -->
		{#each ticksY as t (t)}
			<line
				x1={PAD.l}
				x2={Math.max(w, 320) - PAD.r + 40}
				y1={y(t)}
				y2={y(t)}
				stroke={t === 0 ? inkC.axis : inkC.grid}
				stroke-width={t === 0 ? 1.5 : 1}
			/>
			<text x={PAD.l - 8} y={y(t) + 4} text-anchor="end" font-size="11" fill={inkC.muted}>
				{t > 0 ? '+' + t : t}°
			</text>
		{/each}
		{#each ticksX as i (i)}
			<text x={x(i)} y={H - 10} text-anchor="middle" font-size="11" fill={inkC.muted}>
				{monthName(i)}{i >= 12 ? ' ·yr2' : ''}
			</text>
		{/each}

		<!-- forecast plume -->
		{#if plumeArea && progress > 0.6}
			<path d={plumeArea.band} fill={colors.accent} opacity="0.16" />
			<path
				d={plumeArea.median}
				fill="none"
				stroke={colors.accent}
				stroke-width="2"
				stroke-dasharray="5 5"
			/>
		{/if}

		<!-- traces, drawn in sequence -->
		{#each events as ev, i (ev.name)}
			{@const f = frac(i)}
			{@const isCurrent = i === events.length - 1}
			{#if f > 0}
				<path
					d={lineGen(parts[i].observed)}
					fill="none"
					stroke={seriesColor(i)}
					stroke-width={isCurrent ? 2.5 : 1.75}
					stroke-linecap="round"
					pathLength="1"
					stroke-dasharray="1"
					stroke-dashoffset={1 - f}
				/>
				{#if parts[i].forecast.length && !plume}
					<path
						d={lineGen(parts[i].forecast)}
						fill="none"
						stroke={seriesColor(i)}
						stroke-width="2"
						stroke-dasharray="5 5"
						opacity={Math.max(0, Math.min(1, (f - 0.8) / 0.2))}
					/>
				{/if}
				<!-- direct label at each trace end (identity is never color-alone) -->
				{#if f > 0.9}
					{@const last = plume || !parts[i].forecast.length ? parts[i].observed.at(-1) : parts[i].forecast.at(-1)}
					<!-- ghosts often end at the same point: stagger their labels -->
					<text
						x={x(last.i) + 8}
						y={y(last.oni) + 4 + (isCurrent ? 0 : i === 0 ? -9 : 13)}
						font-size="12"
						font-weight="600"
						fill={isCurrent ? seriesColor(i) : inkC.secondary}
						opacity={(f - 0.9) / 0.1}
					>
						{ev.name.replace(' (current + forecast)', '')}
					</text>
				{/if}
			{/if}
		{/each}

		<!-- hover hairline -->
		{#if hoverI !== null}
			<line x1={x(hoverI)} x2={x(hoverI)} y1={PAD.t} y2={H - PAD.b} stroke={inkC.axis} />
		{/if}
	</svg>

	{#if hoverI !== null}
		<div class="readout" style="color:{inkC.secondary}">
			<strong style="color:{inkC.primary}">{xLabels[hoverI]?.split(' ')[0] ?? ''}</strong>
			{#each events as ev, i (ev.name)}
				{@const d = ev.series[hoverI]}
				{#if d && frac(i) > 0.9}
					<span>
						<span class="swatch" style="background:{seriesColor(i)}"></span>
						{ev.name.slice(0, 7)} {fmt(d.oni)}{d.forecast ? ' (fcst)' : ''}
					</span>
				{/if}
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

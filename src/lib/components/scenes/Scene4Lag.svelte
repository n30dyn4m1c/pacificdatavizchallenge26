<script>
	/**
	 * Scene 4 — The Lag. The centerpiece: scroll distance IS the wait.
	 * 24 months × 55vh each — a constant, generous scroll-per-month so the
	 * reader physically feels the gap between ocean signal and consequence.
	 * All lag alignment ships pre-computed in scene4_lag.json.
	 */
	import { scaleLinear } from 'd3-scale';
	import { line as d3line, curveMonotoneX } from 'd3-shape';
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { ink, impact, series } from '$lib/palette.js';
	import { lag } from '$lib/state.svelte.js';

	// Part 2: MORE scroll per month — the wait must be felt, so each month
	// gets a constant, generous 70vh of runway
	const VH_PER_MONTH = 70;
	const inkC = ink.dark;
	const imp = impact.dark;

	// steps are anchored to month indices (i/24 of scene progress): the copy
	// lands exactly when its month does
	const M = (i) => i / 24;
	const steps = [
		{ at: [M(0.5), M(3)], text: 'June 2025. The ocean is still cool.', sub: 'The gardens are full.' },
		{ at: [M(3), M(6)], text: 'The water warms. Here, nothing changes.' },
		{ at: [M(6), M(8)], text: 'December. The signal crosses the line.' },
		{ at: [M(8), M(10)], text: 'Still nothing.', sub: 'This is what a warning feels like: like nothing.' },
		{ at: [M(10), M(12)], text: 'The rains begin to thin over the lowlands.' },
		{ at: [M(12), M(14)], text: 'Month six: the rivers drop.', sub: 'The drought has arrived downstairs.' },
		{ at: [M(14), M(15)], text: 'August. The first killing frost in the high gardens.' },
		{ at: [M(15), M(17)], text: 'A month later, the worst of it.' },
		{ at: [M(17), M(19)], text: 'And the ocean has not even peaked.' },
		{ at: [M(19), M(22)], text: 'Every one of those months was usable.' },
		{ at: [M(22), 1], text: 'Eight months between signal and frost.', sub: 'Hold that number.' }
	];

	// feed the persistent lag ticker (a fixed element owned by +page.svelte);
	// it appears once the signal has crossed and follows the reader from here
	let months4 = null;
	function feedLag(p, active) {
		lag.inScene4 = active;
		if (months4) {
			const mi = Math.min(months4.length - 1, Math.floor(p * months4.length));
			lag.baseMonths = months4[mi].months_since_onset;
		}
		// scrolled back above the scene → the clock hasn't started yet
		if (!active && p <= 0.001) lag.baseMonths = -1;
	}

	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const label = (date) => {
		const [y, m] = date.split('-');
		return `${MONTHS[+m - 1]} ${y}`;
	};

	// bands SVG geometry
	const H = 470;
	const BAND = { hi: [46, 168], lo: [292, 414] }; // y-extents of the two bands
	let w = $state(760);
	const xi = $derived(scaleLinear([0, 23], [78, Math.max(w, 340) - 26]));

	// mini ONI chart geometry
	const MW = 280;
	const MH = 130;
	const mx = scaleLinear([0, 23], [10, MW - 10]);
	const my = scaleLinear([-1, 3], [MH - 14, 10]);
	const oniPath = (months) =>
		d3line()
			.x((d, i) => mx(i))
			.y((d) => my(d.oni))
			.curve(curveMonotoneX)(months);

	const firstIndex = (months, fn) => months.findIndex(fn);
</script>

<ScrollScene
	id="4-lag"
	title="The lag between ocean signal and consequence"
	heightVh={24 * VH_PER_MONTH}
	surface="dark"
	dataUrl="/data/scene4_lag.json"
	ondata={(d) => (months4 = d.months)}
	onprogress={feedLag}
>
	{#snippet prose({ data })}
		<h2>The lag</h2>
		<p>
			The ocean warms first. Nothing happens in the gardens — not that month, not the next. In the
			synthetic storyline shown here, the Niño 3.4 signal crosses +0.5 °C in December 2025. The Fly
			River lowlands feel real rainfall deficit from around June 2026 — six months later. The first
			killing frost above 2,200 metres arrives in August 2026, the worst of it in September —
			eight months after the signal, and months before the event even peaks. That gap is not dead
			time. It is the working space for anticipatory action, and this scene makes you scroll
			through every month of it.
		</p>
		{#if data}
			<DataTable
				caption="Monthly ocean signal, lowland drought index and highlands frost events"
				columns={['Month', 'ONI °C', 'Lowland drought index', 'Highlands frost events']}
				rows={data.months.map((m) => [
					label(m.date) + (m.forecast ? ' (forecast)' : ''),
					(m.oni > 0 ? '+' : '') + m.oni.toFixed(1),
					m.lowland_drought_index.toFixed(2),
					m.highlands_frost_events
				])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{#if data}
			{@const N = data.months.length}
			{@const mi = Math.min(N - 1, Math.floor(progress * N))}
			{@const cur = data.months[mi]}
			{@const firstDrought = firstIndex(data.months, (m) => m.lowland_drought_index >= 0.45)}
			{@const firstFrost = firstIndex(data.months, (m) => m.highlands_frost_events > 0)}
			{@const onsetI = firstIndex(data.months, (m) => m.months_since_onset === 0)}
			<div class="lag-layout">
				<header class="month-head">
					<span class="kicker">Month by month · scroll is time here</span>
					<span class="month-now display">{label(cur.date)}</span>
					<span class="oni-chip" style:color={series.dark.accent}>
						Niño 3.4 {cur.oni > 0 ? '+' : ''}{cur.oni.toFixed(1)} °C{cur.forecast ? ' · forecast' : ''}
					</span>
				</header>

				<aside class="oni-mini" aria-hidden="true">
					<svg viewBox="0 0 {MW} {MH}">
						<line x1="10" x2={MW - 10} y1={my(0)} y2={my(0)} stroke={inkC.axis} />
						<path d={oniPath(data.months)} fill="none" stroke={inkC.muted} stroke-width="1.5" />
						<circle cx={mx(mi)} cy={my(cur.oni)} r="5" fill={series.dark.accent} />
					</svg>
					<span class="mini-caption">the ocean signal, Jun 2025 → May 2027</span>
				</aside>

				<div class="steps-row">
					<SceneSteps {steps} {progress} width="30rem" />
				</div>

				<div class="bands" bind:clientWidth={w}>
					<svg
						viewBox="0 0 {Math.max(w, 340)} {H}"
						class="chart"
						role="img"
						aria-label="Timeline of drought in the lowlands and frost in the highlands, lagging the ocean signal by months"
					>
						<!-- band backgrounds, elevation as the organizing axis -->
						{#each [['hi', 'Highlands · above 2,200 m', 'kaukau gardens'], ['lo', 'Fly River lowlands · below 50 m', 'rivers, sago, garden levees']] as [key, bandLabel, sub] (key)}
							<rect
								x="66"
								y={BAND[key][0]}
								width={Math.max(w, 340) - 92}
								height={BAND[key][1] - BAND[key][0]}
								fill="var(--ocean-raised)"
								rx="6"
							/>
							<text x="66" y={BAND[key][0] - 18} font-size="12" font-weight="600" fill={inkC.secondary}>
								{bandLabel}
							</text>
							<text x="66" y={BAND[key][0] - 4} font-size="11" fill={inkC.muted}>{sub}</text>
						{/each}

						<!-- month gridlines + labels (thinner on narrow screens) -->
						{#each data.months as m, i (m.date)}
							{#if i % (w < 560 ? 6 : 3) === 0}
								<line x1={xi(i)} x2={xi(i)} y1={BAND.hi[0]} y2={BAND.lo[1]} stroke={inkC.grid} />
								<text x={xi(i)} y={BAND.lo[1] + 18} text-anchor="middle" font-size="10" fill={inkC.muted}>
									{label(m.date)}
								</text>
							{/if}
						{/each}

						<!-- the signal onset marker -->
						{#if mi >= onsetI}
							<line
								x1={xi(onsetI)}
								x2={xi(onsetI)}
								y1={BAND.hi[0] - 34}
								y2={BAND.lo[1]}
								stroke={series.dark.accent}
								stroke-dasharray="3 4"
								opacity="0.7"
							/>
							<text x={xi(onsetI) + 6} y={BAND.hi[0] - 38} font-size="11" fill={series.dark.accent}>
								signal: ONI crosses +0.5
							</text>
						{/if}

						<!-- drought markers: lowlands first -->
						{#each data.months as m, i (m.date)}
							{#if i <= mi && m.lowland_drought_index >= 0.1}
								<circle
									cx={xi(i)}
									cy={(BAND.lo[0] + BAND.lo[1]) / 2}
									r={3 + m.lowland_drought_index * 10}
									fill={imp.drought}
									opacity={0.35 + m.lowland_drought_index * 0.6}
								/>
							{/if}
						{/each}

						<!-- frost markers: highlands, months later -->
						{#each data.months as m, i (m.date)}
							{#if i <= mi && m.highlands_frost_events > 0}
								{#each Array(m.highlands_frost_events) as _, k (k)}
									<text
										x={xi(i)}
										y={BAND.hi[1] - 16 - k * 24}
										text-anchor="middle"
										font-size="17"
										fill={imp.frost}>✳</text
									>
								{/each}
							{/if}
						{/each}

						<!-- lag brackets, revealed as each consequence lands -->
						{#if firstDrought !== -1 && mi >= firstDrought}
							<path
								d="M {xi(onsetI)} 246 H {xi(firstDrought)}"
								stroke={imp.drought}
								stroke-width="1.5"
								fill="none"
								marker-end="url(#arrow-d)"
							/>
							<text x={(xi(onsetI) + xi(firstDrought)) / 2} y="238" text-anchor="middle" font-size="11" fill={imp.drought}>
								{firstDrought - onsetI} months to drought in the lowlands
							</text>
						{/if}
						{#if firstFrost !== -1 && mi >= firstFrost}
							<path
								d="M {xi(onsetI)} 262 H {xi(firstFrost)}"
								stroke={imp.frost}
								stroke-width="1.5"
								fill="none"
								marker-end="url(#arrow-f)"
							/>
							<text x={(xi(onsetI) + xi(firstFrost)) / 2} y="282" text-anchor="middle" font-size="11" fill={imp.frost}>
								{firstFrost - onsetI} months to frost above 2,200 m
							</text>
						{/if}
						<defs>
							<marker id="arrow-d" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
								<path d="M0 0 L8 4 L0 8 z" fill={imp.drought} />
							</marker>
							<marker id="arrow-f" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
								<path d="M0 0 L8 4 L0 8 z" fill={imp.frost} />
							</marker>
						</defs>
					</svg>
				</div>

				<!-- the T+n ticker is now the persistent fixed element owned by
				     +page.svelte (LagTicker) — it starts here and follows the
				     reader through scenes 5 and 6 -->
			</div>
		{:else}
			<div class="lag-layout"><p class="kicker">Loading the months…</p></div>
		{/if}
	{/snippet}
</ScrollScene>

<style>
	.lag-layout {
		position: relative;
		height: 100%;
		max-width: 72rem;
		margin: 0 auto;
		padding: 1.25rem 1.25rem 0;
		display: flex;
		flex-direction: column;
	}

	.month-head {
		display: flex;
		align-items: baseline;
		gap: 1.25rem;
		flex-wrap: wrap;
		padding-top: 0.5rem;
	}

	.month-now {
		font-size: clamp(1.9rem, 5.5vw, 3.2rem);
		font-weight: 900;
		font-variant-numeric: tabular-nums;
	}

	.oni-chip {
		font-size: 0.85rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.oni-mini {
		position: absolute;
		right: 1.5rem;
		top: 5.5rem;
		width: min(280px, 34vw);
		opacity: 0.9;
	}

	.oni-mini svg {
		width: 100%;
		height: auto;
	}

	.mini-caption {
		display: block;
		font-size: 0.65rem;
		color: var(--ink-dark-muted);
		text-align: right;
	}

	.steps-row {
		min-height: 6.75rem;
		margin-top: 0.75rem;
	}

	.bands {
		flex: 1;
		display: flex;
		align-items: center;
		margin-top: 0.25rem;
	}

	.bands svg {
		width: 100%;
		height: auto;
		max-height: 72vh;
	}

	@media (max-width: 700px) {
		.oni-mini {
			display: none;
		}
	}
</style>

<script>
	/**
	 * Scene 6 — Now: 2026. Reuses OniChart with the forecast plume, then the
	 * provinces map as a choropleth of the OFFICIAL PNG-NWS/NARI Drought
	 * Early Warning System status (Drought Watch → Drought Alert → Drought
	 * Critical, from the monthly Drought Update bulletin via
	 * prep/manual/dews_status.csv), with each province still narrated
	 * step-by-step through its projected impact window. Map polygons are a
	 * synthetic placeholder (static/data/png_provinces.json) with the same
	 * FeatureCollection shape the prep pipeline will emit.
	 */
	import { base } from '$app/paths';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import CompareToggle from '$lib/components/beats/CompareToggle.svelte';
	import OniChart from '$lib/components/OniChart.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import Cite from '$lib/components/Cite.svelte';
	import { ink, impact, dews as dewsColors, DEWS_TIERS, dewsLabel } from '$lib/palette.js';
	import { ui, lag } from '$lib/state.svelte.js';

	const inkC = ink.light;
	const imp = impact.light;
	const dewsC = dewsColors.light;

	const steps = [
		{ at: [0.03, 0.14], text: 'This is not history. This is the event we are in.' },
		{ at: [0.14, 0.26], text: 'Observed to June. Forecast beyond.' },
		{ at: [0.26, 0.42], text: 'The plume peaks in December — above both events my father remembers.' }
	];

	let geo = $state(null);
	async function loadGeo() {
		if (geo) return;
		try {
			geo = await (await fetch(`${base}/data/png_provinces.json`)).json();
		} catch {
			geo = { features: [] };
		}
	}

	// ── forecast-scenario toggle (optional enrichment) ─────────────────────
	// default is the narratively-correct scenario: "strong", the current
	// forecast. Under ?notap=1 the toggle disappears and the chart simply
	// shows it. Swapping tweens the plume band between the two shapes.
	let scenario = $state('strong');
	const plumeT = tweened(null, {
		easing: cubicOut,
		interpolate: (a, b) => {
			if (!a || a.length !== b.length) return () => b;
			return (t) =>
				b.map((d, i) => ({
					month: d.month,
					p10: a[i].p10 + (d.p10 - a[i].p10) * t,
					p50: a[i].p50 + (d.p50 - a[i].p50) * t,
					p90: a[i].p90 + (d.p90 - a[i].p90) * t
				}));
		}
	});

	let scenarios = $state(null);
	function onData(d) {
		scenarios = d.scenarios ?? null;
		plumeT.set(d.scenarios?.strong.plume ?? d.plume, { duration: 0 });
		loadGeo();
	}

	$effect(() => {
		if (scenarios?.[scenario]) {
			plumeT.set(scenarios[scenario].plume, { duration: ui.reducedMotion ? 0 : 600 });
		}
	});

	// the reader carries the lag clock through this scene
	function feedLag(p, active) {
		if (active) lag.dismissed = false;
		lag.carried6 = active;
		lag.extra6 = p >= 0.5 ? 1 : 0;
	}

	// equirectangular-ish projection for the placeholder polygons
	const K = 72;
	const px = (lon) => (lon - 140.6) * K;
	const py = (lat) => (-4.3 - lat) * K;
	const ringPath = (f) =>
		f.geometry.coordinates[0].map(([lon, lat], i) => `${i ? 'L' : 'M'}${px(lon).toFixed(1)} ${py(lat).toFixed(1)}`).join(' ') + ' Z';

	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const win = (p) => {
		const f = (d) => {
			const [y, m] = d.split('-');
			return `${MONTHS[+m - 1]} ${y}`;
		};
		return `${f(p.window_start)} → ${f(p.window_end)}`;
	};
	// '2026-06' → 'June 2026', for the choropleth's bulletin source line
	const bulletinLabel = (d) => {
		if (!d) return '';
		const [y, m] = d.split('-');
		return `${MONTHS_FULL[+m - 1]} ${y}`;
	};
</script>

<ScrollScene
	id="6-forecast"
	title="The current forecast and projected province impact windows"
	heightVh={520}
	surface="light"
	dataUrl="/data/scene6_forecast.json"
	ondata={onData}
	onprogress={feedLag}
>
	{#snippet prose({ data })}
		<h2>Now: 2026</h2>
		<p>
			The forecast plume (synthetic placeholder) has the event peaking near +2.8 °C around
			December 2026. Projected onward, that gives each province a window: riverine drought
			reaching Western and Gulf from around August 2026; frost risk in the high provinces —
			Enga, Hela, Southern Highlands, Chimbu — from June to October 2026. These windows are the
			whole point of the piece: they are printed months before they open.
		</p>
		<p>
			Papua New Guinea already tracks this event in its own official vocabulary — the three-tier
			Drought Early Warning System of the PNG National Weather Service and NARI monthly Drought
			Update: <strong>Drought Watch → Drought Alert → Drought Critical</strong>, derived from
			observed three-month rainfall, vegetation health and forecast rainfall.
			{#if data?.dews}
				As of the {bulletinLabel(data.dews.bulletin_date)} bulletin, the National Capital
				District stands at Drought Critical, eight provinces at Drought Alert, and eight more at
				Drought Watch.
			{/if}
			{#if data?.mandate}
				{data.mandate.text}<Cite
					href={data._meta?.mandate?.source_url}
					label={data._meta?.mandate?.source}
				/>
			{/if}
		</p>
		{#if data}
			<DataTable
				caption="Official DEWS status ({bulletinLabel(data.dews?.bulletin_date)} bulletin) and projected impact windows by province"
				columns={['Province', 'DEWS status', 'Impact', 'Window', 'Confidence']}
				rows={data.provinces.map((p) => [
					p.name,
					data.dews?.provinces?.[p.name] ? dewsLabel[data.dews.provinces[p.name]] : '—',
					p.impact_type,
					win(p),
					p.confidence
				])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{#if data}
			<div class="stage">
				<!-- phase A: the plume -->
				<div class="phase" style:opacity={progress < 0.46 ? 1 : 0} inert={progress >= 0.46}>
					<header class="head-row">
						<div>
							<p class="kicker">The event we are actually in · observed + forecast plume</p>
							<h2 class="display">Now: 2026.</h2>
						</div>
						{#if scenarios && progress > 0.2}
							<div class="toggle-col">
								<CompareToggle
									label="Compare forecast scenarios"
									options={[
										{ value: 'strong', label: scenarios.strong.label },
										{ value: 'moderate', label: scenarios.moderate.label }
									]}
									bind:value={scenario}
								/>
								<p class="scenario-caption">{scenarios[scenario].caption}</p>
							</div>
						{/if}
					</header>
					<OniChart
						events={[data.current]}
						progress={Math.min(1, progress * 3)}
						mode="light"
						plume={$plumeT ?? data.plume}
						ariaLabel="The current event's observed Oceanic Niño Index with the forecast plume: median peaking near +2.8 °C in December 2026, with a p10–p90 range."
					/>
					<p class="plume-note">
						Shaded band: 10th–90th percentile of the forecast plume. Dashed: median.
					</p>
					<div class="steps-row">
						<SceneSteps {steps} {progress} width="34rem" />
					</div>
				</div>

				<!-- phase B: the official DEWS choropleth + per-province impact narration -->
				{#if geo}
					{@const n = data.provinces.length}
					{@const k = Math.max(0, Math.min(n - 1, Math.floor(((progress - 0.52) / 0.44) * n)))}
					{@const activeP = data.provinces[k]}
					{@const dewsMap = data.dews?.provinces ?? {}}
					{@const activeTier = dewsMap[activeP.name]}
					<div class="phase" style:opacity={progress >= 0.46 ? 1 : 0}>
						<div class="map-grid">
							<div class="map-col">
								<svg
									viewBox="-6 -6 560 400"
									class="chart"
									role="img"
									aria-label="Map of Papua New Guinea provinces coloured by their official drought status — Drought Watch, Drought Alert or Drought Critical — while each province's projected impact window is described in turn"
								>
									{#each geo.features as f (f.properties.name)}
										{@const tier = dewsMap[f.properties.name]}
										{@const isOn = progress >= 0.52 && f.properties.name === activeP.name}
										<path
											d={ringPath(f)}
											fill={tier ? dewsC[tier] : 'var(--paper-raised)'}
											fill-opacity={tier ? (isOn ? 1 : 0.8) : 1}
											stroke={isOn ? 'var(--ink-light-primary)' : 'var(--ink-light-axis)'}
											stroke-width={isOn ? 2.5 : 1}
											style="transition: fill-opacity 0.3s, stroke 0.3s"
										/>
									{/each}
								</svg>
								<!-- the legend names the tiers exactly as NARI does -->
								<div class="legend">
									{#each DEWS_TIERS as t (t)}
										<span><i style:background={dewsC[t]}></i>{dewsLabel[t]}</span>
									{/each}
									<span><i class="l-none"></i>No current advisory</span>
								</div>
								<p class="map-source">
									Status: PNG-NWS/NARI Drought Update, {bulletinLabel(data.dews?.bulletin_date)}
								</p>
							</div>
							<div class="card">
								<p class="kicker">Projected impact window · {k + 1} of {n}</p>
								<h3 class="display">{activeP.name}</h3>
								<p class="dews-line">
									<span
										class="dews-chip"
										style:border-color={activeTier ? dewsC[activeTier] : 'var(--ink-light-axis)'}
										style:color={activeTier ? dewsC[activeTier] : 'var(--ink-light-secondary)'}
									>
										{activeTier ? dewsLabel[activeTier] : 'No current advisory'}
									</span>
								</p>
								<p class="impact-line">
									<span class="dot" style:background={imp[activeP.impact_type]}></span>
									{activeP.impact_type === 'frost' ? 'Killing-frost risk' : 'Drought / low-river risk'}
								</p>
								<p class="window">{win(activeP)}</p>
								<span class="confidence c-{activeP.confidence}">confidence: {activeP.confidence}</span>
							</div>
						</div>
						{#if data.mandate}
							<!-- the directive that hands responsibility to the level scene 7 serves -->
							<p class="mandate">
								{data.mandate.text}<Cite
									href={data._meta?.mandate?.source_url}
									label={data._meta?.mandate?.source}
								/> The calendar that follows is that responsibility, written down.
							</p>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	{/snippet}
</ScrollScene>

<style>
	.stage {
		position: relative;
		height: 100%;
		max-width: 64rem;
		margin: 0 auto;
		padding: 1.5rem 1.25rem;
	}

	.phase {
		position: absolute;
		inset: 1.5rem 1.25rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.6rem;
		transition: opacity 0.45s;
	}

	h2.display {
		font-size: clamp(1.8rem, 5vw, 3rem);
	}

	.head-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.toggle-col {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.35rem;
		max-width: 22rem;
	}

	.scenario-caption {
		font-size: 0.75rem;
		color: var(--ink-light-muted);
		text-align: right;
		margin: 0;
	}

	.steps-row {
		min-height: 5.5rem;
	}

	.plume-note {
		font-size: 0.78rem;
		color: var(--ink-light-muted);
	}

	.map-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(14rem, 1fr);
		gap: 2rem;
		align-items: center;
	}

	.map-grid svg {
		width: 100%;
		height: auto;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 1.1rem;
		font-size: 0.75rem;
		color: var(--ink-light-secondary);
		margin-top: 0.5rem;
	}

	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
	}

	.legend i {
		width: 0.85em;
		height: 0.85em;
		border-radius: 3px;
	}

	.legend .l-none {
		background: var(--paper-raised);
		border: 1px solid var(--ink-light-axis);
	}

	.map-source {
		font-size: 0.72rem;
		color: var(--ink-light-muted);
		margin: 0.4rem 0 0;
	}

	.dews-line {
		margin: 0 0 0.4em;
	}

	.dews-chip {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		padding: 0.25rem 0.55rem;
		border: 1.5px solid;
		border-radius: 4px;
	}

	.mandate {
		max-width: 44em;
		font-size: 0.88rem;
		color: var(--ink-light-secondary);
		border-top: 1px solid var(--ink-light-grid);
		padding-top: 0.7rem;
		margin: 0.6rem 0 0;
	}

	.card h3 {
		font-size: clamp(1.5rem, 4vw, 2.4rem);
		margin-bottom: 0.2em;
	}

	.impact-line {
		font-weight: 600;
		margin-bottom: 0.25em;
	}

	.dot {
		display: inline-block;
		width: 0.7em;
		height: 0.7em;
		border-radius: 50%;
		margin-right: 0.4em;
	}

	.window {
		font-variant-numeric: tabular-nums;
		color: var(--ink-light-secondary);
	}

	.confidence {
		align-self: flex-start;
		display: inline-block;
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.3rem 0.6rem;
		border-radius: 999px;
		border: 1px solid var(--ink-light-axis);
		color: var(--ink-light-secondary);
	}

	.c-high {
		border-color: var(--ink-light-primary);
		color: var(--ink-light-primary);
	}

	@media (max-width: 700px) {
		.map-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
	}
</style>

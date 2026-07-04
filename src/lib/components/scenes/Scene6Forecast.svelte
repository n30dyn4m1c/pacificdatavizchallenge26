<script>
	/**
	 * Scene 6 — Now: 2026. Reuses OniChart with the forecast plume, then a
	 * low-poly province map that highlights each province as its projected
	 * impact window is narrated. Map polygons are a synthetic placeholder
	 * (static/data/png_provinces.json) with the same FeatureCollection
	 * shape the prep pipeline will emit.
	 */
	import { base } from '$app/paths';
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import OniChart from '$lib/components/OniChart.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { ink, impact } from '$lib/palette.js';

	const inkC = ink.light;
	const imp = impact.light;

	let geo = $state(null);
	async function loadGeo() {
		if (geo) return;
		try {
			geo = await (await fetch(`${base}/data/png_provinces.json`)).json();
		} catch {
			geo = { features: [] };
		}
	}

	// equirectangular-ish projection for the placeholder polygons
	const K = 72;
	const px = (lon) => (lon - 140.6) * K;
	const py = (lat) => (-4.3 - lat) * K;
	const ringPath = (f) =>
		f.geometry.coordinates[0].map(([lon, lat], i) => `${i ? 'L' : 'M'}${px(lon).toFixed(1)} ${py(lat).toFixed(1)}`).join(' ') + ' Z';

	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const win = (p) => {
		const f = (d) => {
			const [y, m] = d.split('-');
			return `${MONTHS[+m - 1]} ${y}`;
		};
		return `${f(p.window_start)} → ${f(p.window_end)}`;
	};
</script>

<ScrollScene
	id="6-forecast"
	title="The current forecast and projected province impact windows"
	heightVh={520}
	surface="light"
	dataUrl="/data/scene6_forecast.json"
	ondata={loadGeo}
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
		{#if data}
			<DataTable
				caption="Projected impact windows by province"
				columns={['Province', 'Impact', 'Window', 'Confidence']}
				rows={data.provinces.map((p) => [p.name, p.impact_type, win(p), p.confidence])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{#if data}
			<div class="stage">
				<!-- phase A: the plume -->
				<div class="phase" style:opacity={progress < 0.46 ? 1 : 0}>
					<header>
						<p class="kicker">The event we are actually in · observed + forecast plume</p>
						<h2 class="display">Now: 2026.</h2>
					</header>
					<OniChart
						events={[data.current]}
						progress={Math.min(1, progress * 3)}
						mode="light"
						plume={data.plume}
						ariaLabel="The current event's observed Oceanic Niño Index with the forecast plume: median peaking near +2.8 °C in December 2026, with a p10–p90 range."
					/>
					<p class="plume-note">
						Shaded band: 10th–90th percentile of the forecast plume. Dashed: median.
					</p>
				</div>

				<!-- phase B: province impact windows -->
				{#if geo}
					{@const n = data.provinces.length}
					{@const k = Math.max(0, Math.min(n - 1, Math.floor(((progress - 0.52) / 0.44) * n)))}
					{@const activeP = data.provinces[k]}
					<div class="phase" style:opacity={progress >= 0.46 ? 1 : 0}>
						<div class="map-grid">
							<svg
								viewBox="-6 -6 560 400"
								class="chart"
								role="img"
								aria-label="Map of Papua New Guinea provinces, highlighted one by one as their projected impact window is described"
							>
								{#each geo.features as f (f.properties.name)}
									{@const meta = data.provinces.find((p) => p.name === f.properties.name)}
									{@const idx = data.provinces.findIndex((p) => p.name === f.properties.name)}
									{@const isOn = progress >= 0.52 && idx !== -1 && idx <= k}
									<path
										d={ringPath(f)}
										fill={isOn ? imp[meta.impact_type] : 'var(--paper-raised)'}
										fill-opacity={isOn ? (idx === k ? 0.9 : 0.4) : 1}
										stroke="var(--ink-light-axis)"
										stroke-width="1"
										style="transition: fill 0.3s, fill-opacity 0.3s"
									/>
								{/each}
							</svg>
							<div class="card">
								<p class="kicker">Projected impact window · {k + 1} of {n}</p>
								<h3 class="display">{activeP.name}</h3>
								<p class="impact-line">
									<span class="dot" style:background={imp[activeP.impact_type]}></span>
									{activeP.impact_type === 'frost' ? 'Killing-frost risk' : 'Drought / low-river risk'}
								</p>
								<p class="window">{win(activeP)}</p>
								<span class="confidence c-{activeP.confidence}">confidence: {activeP.confidence}</span>
							</div>
						</div>
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

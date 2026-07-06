<script>
	/**
	 * Scene 3 — The driest years. A pinned annual bar chart of Papua New
	 * Guinea's rainfall anomaly, 1979–2025. Below-normal (dry) years take the
	 * drought arm of the palette; the four driest are labelled directly. The
	 * two deepest — 1997 and 2015 — are the great El Niño droughts. Real SPC
	 * record (static/data/scene3_rain.json), with the honest caveat that El
	 * Niño is a central-Pacific signal this national series does not itself
	 * carry (see the tap-reveal).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import AnnualBars from '$lib/components/AnnualBars.svelte';
	import TapReveal from '$lib/components/beats/TapReveal.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.03, 0.2], text: 'Warming is the slow story. Rainfall is the sudden one.' },
		{ at: [0.2, 0.4], text: 'Most years, the rain lands near normal.' },
		{ at: [0.4, 0.62], text: 'But some years fall far short — and those are the ones people remember.' },
		{ at: [0.62, 0.82], text: '1997 and 2015: the two driest years in the record.', sub: 'Both were strong El Niño years. Both brought drought and highland frost.' },
		{ at: [0.82, 1], text: 'The extremes, not the average, are what hunger is made of.' }
	];

	const fmt = (v) => (v > 0 ? '+' : '') + v.toFixed(1);
</script>

<ScrollScene
	id="3-descent"
	title="Papua New Guinea rainfall anomaly, 1979–2025"
	heightVh={560}
	surface="dark"
	dataUrl="/data/scene3_rain.json"
>
	{#snippet prose({ data })}
		<h2>The driest years</h2>
		<p>
			Warming is the slow story; rainfall is the sudden one. The Pacific Community's rainfall-anomaly
			record for Papua New Guinea runs annually from 1979 to 2025 — each bar the departure of that
			year's rainfall from the long-term average. Most years sit near normal, but a handful fall far
			below it, and those are the years people remember. The two deepest shortfalls are 1997
			(−26.7 mm) and 2015 (−20.2 mm) — the two strong El Niño years that brought Papua New Guinea
			its worst droughts and highland frosts in living memory. One caveat, stated plainly: El Niño
			is defined by warming in the central Pacific, far to the east; this national rainfall series
			registers its consequence, not the ocean signal itself, and in a national annual average even
			a severe event is blunted.
		</p>
		{#if data}
			<DataTable
				caption="Rainfall anomaly (mm) by year"
				columns={['Year', 'Rainfall anomaly (mm)', '']}
				rows={data.years.map((d) => [d.year, fmt(d.value), d.driest ? 'driest' : ''])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · annual rainfall anomaly (mm vs the long-term average)</p>
				<h2 class="display">The driest years.</h2>
			</header>
			{#if data}
				<AnnualBars
					values={data.years}
					markYears={data.driest}
					{progress}
					mode="dark"
					unit="mm"
					height={360}
					ariaLabel="Bar chart of Papua New Guinea rainfall anomaly from 1979 to 2025. Most years are near normal; the driest are 1997 at minus 26.7 millimetres and 2015 at minus 20.2 millimetres, both strong El Niño years."
				/>
			{/if}
			<div class="steps-row">
				<SceneSteps {steps} {progress} width="32rem" />
				<div class="reveal-slot" class:hidden={progress <= 0.62} inert={progress <= 0.62}>
					<TapReveal id="s3-elnino" label="Why doesn’t the ocean chart show this? →">
						<h4>Two different oceans</h4>
						<p>
							El Niño is warming in the <em>central and eastern</em> equatorial Pacific — the
							Niño 3.4 region, thousands of kilometres east of Papua New Guinea. During a strong
							event the western Pacific, where Papua New Guinea sits, often runs near or below its
							own normal even as the drought bites.
						</p>
						<p>
							So the country's local sea-surface anomaly (scene 1) and its rainfall shortfall
							(here) need not line up year for year: in 1997 the local sea was close to average,
							yet the rain failed badly. The driver lives in an ocean this national dataset does
							not measure.
						</p>
					</TapReveal>
				</div>
			</div>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.wrap {
		height: 100%;
		max-width: 64rem;
		margin: 0 auto;
		padding: 1.5rem 1.25rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.75rem;
	}

	h2.display {
		font-size: clamp(1.8rem, 5vw, 3rem);
		margin-bottom: 0;
	}

	.steps-row {
		min-height: 6.5rem;
		display: flex;
		align-items: flex-start;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.reveal-slot {
		transition: opacity 0.4s;
	}

	.reveal-slot.hidden {
		opacity: 0;
		pointer-events: none;
	}
</style>

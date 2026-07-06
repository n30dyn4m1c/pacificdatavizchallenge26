<script>
	/**
	 * Scene 6 — Who warms it, who wears it. The climate-justice contrast, in
	 * the real SPC record: Papua New Guinea's greenhouse-gas emissions per
	 * person are among the lowest anywhere and barely move, while the sea
	 * around it rises and its ocean warms to record. Two panels, both real
	 * (static/data/scene6_justice.json).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.05, 0.3], text: 'Papua New Guinea did little to cause this.' },
		{ at: [0.3, 0.55], text: 'Its emissions per person are among the lowest anywhere — and nearly flat.' },
		{ at: [0.55, 0.8], text: 'Yet the sea around it keeps rising.' },
		{ at: [0.8, 1], text: 'Small cause, large consequence. That is the shape of climate injustice.' }
	];

	const fmt2 = (v) => v.toFixed(2);
</script>

<ScrollScene
	id="6-forecast"
	title="Emissions per person against sea-level rise, Papua New Guinea"
	heightVh={520}
	surface="light"
	dataUrl="/data/scene6_justice.json"
>
	{#snippet prose({ data })}
		<h2>Who warms it, who wears it</h2>
		<p>
			The Pacific Community's record sets Papua New Guinea's contribution beside its exposure.
			Greenhouse-gas emissions per person here are around one tonne of CO₂-equivalent a year — a
			small fraction of the world average — and they barely change across the record. Meanwhile the
			sea-level anomaly around the country rises through the satellite era, and (scenes 1–2) the
			ocean and land have warmed to their record. A country that did little to cause the warming
			carries a large share of its consequences: the shape of climate injustice, in two lines.
		</p>
		{#if data}
			<DataTable
				caption="Emissions per person and sea-level anomaly, selected years"
				columns={['Year', 'GHG per person (t CO₂e)', 'Sea-level anomaly (m)']}
				rows={[1995, 2000, 2005, 2010, 2015, 2020].map((yr) => {
					const g = data.ghg.years.find((d) => d.year === yr);
					const s = data.sea_level.years.find((d) => d.year === yr);
					return [yr, g ? fmt2(g.value) : '—', s ? fmt2(s.value) : '—'];
				})}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · cause and consequence, in the official record</p>
				<h2 class="display">Who warms it, who wears it.</h2>
			</header>
			{#if data}
				<div class="panels">
					<figure>
						<figcaption>Emissions per person · {data.ghg.unit}</figcaption>
						<LazyLines
							series={[{ key: 'ghg', name: data.ghg.name, values: data.ghg.years }]}
							{progress}
							mode="light"
							unit="t"
							baseline={0}
							height={300}
							ariaLabel="Line chart of Papua New Guinea greenhouse-gas emissions per person from 1970 to 2024, around one tonne of CO2-equivalent and nearly flat."
						/>
					</figure>
					<figure>
						<figcaption>Sea-level anomaly · {data.sea_level.unit}</figcaption>
						<LazyLines
							series={[{ key: 'sea', name: data.sea_level.name, accent: true, values: data.sea_level.years }]}
							{progress}
							mode="light"
							unit="m"
							baseline={0}
							height={300}
							ariaLabel="Line chart of the sea-level anomaly around Papua New Guinea from 1993 to 2023, rising through the period."
						/>
					</figure>
				</div>
			{/if}
			<div class="steps-row">
				<SceneSteps {steps} {progress} width="34rem" />
			</div>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.wrap {
		height: 100%;
		max-width: 66rem;
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

	.panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	figure {
		margin: 0;
	}

	figcaption {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--ink-light-secondary);
		margin-bottom: 0.25rem;
	}

	.steps-row {
		min-height: 5.5rem;
		display: flex;
		align-items: flex-start;
	}

	@media (max-width: 720px) {
		.panels {
			grid-template-columns: 1fr;
		}
	}
</style>

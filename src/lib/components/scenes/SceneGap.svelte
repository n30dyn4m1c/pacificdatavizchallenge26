<script>
	/**
	 * Act VII — The gap. The climate-justice close of the argument: Papua New
	 * Guinea's greenhouse-gas emissions per person (SPC record, 1970–2024)
	 * have stayed near one tonne for fifty years, a fraction of the world
	 * average (≈6.6 t, EDGAR 2023 — a single documented reference value, see
	 * /prep). The country did not hire the thief. (static/data/scene_gap.json)
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.05, 0.28], text: 'None of this is Papua New Guinea’s doing.' },
		{ at: [0.28, 0.54], text: 'Emissions per person here have stayed near one tonne for fifty years.' },
		{ at: [0.54, 0.78], text: 'The world average runs about six times higher.', sub: '≈6.6 t CO₂e per person (EDGAR, 2023) against Papua New Guinea’s 1.2 t in 2024.' },
		{ at: [0.78, 1], text: 'Small cause. Large consequence. That is the gap.' }
	];

	const fmt2 = (v) => v.toFixed(2);
</script>

<ScrollScene
	id="7-gap"
	title="The gap — Papua New Guinea's emissions per person against the world average"
	heightVh={500}
	surface="dark"
	dataUrl="/data/scene_gap.json"
>
	{#snippet prose({ data })}
		<h2>Exhibit G: the gap</h2>
		<p>
			The last exhibit weighs cause against consequence. In the SPC record, Papua New Guinea's
			greenhouse-gas emissions per person run from 0.9 to 1.7 tonnes of CO₂-equivalent across
			1970–2024, and end near 1.2 — essentially flat for half a century. The world average is
			about 6.6 tonnes per person (EDGAR, 2023 — the one reference figure in this piece not from
			the SPC dataflow, documented in /prep). The warming that moves the far ocean, raises the sea
			and sharpens the droughts is overwhelmingly made elsewhere; the consequences examined in the
			previous six exhibits are carried here. Small cause, large consequence — the shape of
			climate injustice in one chart.
		</p>
		{#if data}
			<DataTable
				caption="Emissions per person, selected years"
				columns={['Year', 'GHG per person (t CO₂e)']}
				rows={[1970, 1980, 1990, 2000, 2010, 2020, 2024].map((yr) => {
					const g = data.ghg.years.find((d) => d.year === yr);
					return [yr, g ? fmt2(g.value) : '—'];
				})}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · greenhouse-gas emissions per person, 1970–2024</p>
				<h2 class="display">The gap.</h2>
			</header>
			{#if data}
				<LazyLines
					series={[{ key: 'ghg', name: 'Papua New Guinea', accent: true, values: data.ghg.years }]}
					refLine={{ value: data.world.value, label: data.world.label }}
					{progress}
					mode="dark"
					unit="t"
					baseline={0}
					height={340}
					ariaLabel="Line chart of Papua New Guinea's greenhouse-gas emissions per person from 1970 to 2024, staying between about 1 and 1.7 tonnes, far below a dashed reference line at the world average of about 6.6 tonnes."
				/>
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
		min-height: 5.5rem;
		display: flex;
		align-items: flex-start;
	}
</style>

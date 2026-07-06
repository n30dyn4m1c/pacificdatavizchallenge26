<script>
	/**
	 * Scene 4 — What the dry years cost. Papua New Guinea's national crop-yield
	 * record (1961–2024) with the four driest rainfall years marked. At the
	 * national annual scale the dips are modest — most food here is grown in
	 * subsistence gardens the yield statistic barely sees — but the drought
	 * years still register, and the human cost sits below the line. Real SPC
	 * record (static/data/scene4_impact.json).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.04, 0.24], text: 'A dry year is not just a number on a rainfall chart.' },
		{ at: [0.24, 0.46], text: 'It lands on gardens, harvests and kitchens.' },
		{ at: [0.46, 0.68], text: 'Against national crop yield, the driest years leave their mark.' },
		{ at: [0.68, 0.86], text: 'The dips look modest here — most food is grown in gardens this statistic barely sees.', sub: 'The real shortfall is in the highland kaukau mounds, off the national ledger.' },
		{ at: [0.86, 1], text: 'The number that matters is the one a family cannot eat.' }
	];

	const fmt0 = (v) => Math.round(v).toLocaleString('en');
</script>

<ScrollScene
	id="4-lag"
	title="Papua New Guinea crop yield against its driest years, 1961–2024"
	heightVh={560}
	surface="dark"
	dataUrl="/data/scene4_impact.json"
>
	{#snippet prose({ data })}
		<h2>What the dry years cost</h2>
		<p>
			A rainfall shortfall is not just a number; it lands on gardens and harvests. The Pacific
			Community's national crop-yield record for Papua New Guinea (1961–2024) is shown here with
			the four driest years — 1997, 2015, 1993 and 1982 — marked. Against those years the yield
			line dips, though modestly: most food in Papua New Guinea is grown in subsistence gardens
			that a national yield-per-hectare figure barely captures, so the deepest losses — the
			highland sweet-potato (kaukau) gardens hit by drought and frost — sit largely off this
			ledger. The statistic understates the shock; the next scene is what the shock feels like in
			one garden.
		</p>
		{#if data}
			<DataTable
				caption="Crop yield (kg/ha) in and around the driest years"
				columns={['Year', 'Crop yield (kg/ha)', 'Driest year?']}
				rows={data.crop.years
					.filter((d) => data.drought_years.some((y) => Math.abs(d.year - y) <= 1))
					.map((d) => [d.year, fmt0(d.value), data.drought_years.includes(d.year) ? 'yes' : ''])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · national crop yield (kg/ha), driest years marked</p>
				<h2 class="display">What the dry years cost.</h2>
			</header>
			{#if data}
				<LazyLines
					series={[{ key: 'crop', name: data.crop.name, accent: true, values: data.crop.years }]}
					markYears={data.drought_years}
					{progress}
					mode="dark"
					unit="kg/ha"
					height={340}
					baseline={null}
					ariaLabel="Line chart of Papua New Guinea national crop yield in kilograms per hectare from 1961 to 2024, with the four driest rainfall years (1997, 2015, 1993, 1982) marked. Yield dips modestly around those years."
				/>
			{/if}
			<div class="steps-row">
				<SceneSteps {steps} {progress} width="32rem" />
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
	}
</style>

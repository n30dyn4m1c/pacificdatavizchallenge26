<script>
	/**
	 * Scene 2 — Sea and land, in step. A pinned annual line chart: scrolling
	 * draws Papua New Guinea's sea-surface and land-surface temperature
	 * anomalies together across 1850–2025, over a ghost of the Pacific-wide
	 * average. Both national traces climb to their record in 2025. All series
	 * are the real SPC record (static/data/scene2_temps.json).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import AnnualLines from '$lib/components/AnnualLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.04, 0.2], text: 'The sea is not warming alone.' },
		{ at: [0.2, 0.4], text: 'On land, Papua New Guinea’s surface temperature tracks the same climb.' },
		{ at: [0.4, 0.6], text: 'For most of the record, both hover near the old normal.' },
		{ at: [0.6, 0.8], text: 'Then, together, they lift away from it.' },
		{ at: [0.8, 1], text: 'Both reach their highest point in 2025.', sub: 'Sea and land, +1.1 °C above the long-term average.' }
	];

	const fmt = (v) => (v > 0 ? '+' : '') + v.toFixed(2);
	const at = (s, yr) => s.values.find((d) => d.year === yr);
</script>

<ScrollScene
	id="2-history"
	title="Papua New Guinea sea- and land-surface temperature anomalies, 1850–2025"
	heightVh={560}
	surface="dark"
	dataUrl="/data/scene2_temps.json"
>
	{#snippet prose({ data })}
		<h2>Sea and land, in step</h2>
		<p>
			The Pacific Community reports Papua New Guinea's sea-surface and land-surface temperature
			anomalies as two annual series, both running 1850–2025. They move together: near the
			long-term average for most of the record, then lifting away from it through the late 20th
			and early 21st centuries. Both reach their highest values in 2025, about +1.1 °C above the
			long-term average. A ghost line shows the Pacific-wide sea-surface average across the 21
			other reporting countries and territories, for context.
		</p>
		{#if data}
			{@const sst = data.series.find((s) => s.key === 'sst')}
			{@const land = data.series.find((s) => s.key === 'land')}
			{@const region = data.series.find((s) => s.key === 'region')}
			<DataTable
				caption="Annual temperature anomalies (°C) by year, selected years"
				columns={['Year', 'PNG sea surface', 'PNG land surface', 'Pacific sea-surface average']}
				rows={[1850, 1900, 1950, 1980, 2000, 2010, 2020, 2025].map((yr) => [
					yr,
					at(sst, yr) ? fmt(at(sst, yr).value) : '—',
					at(land, yr) ? fmt(at(land, yr).value) : '—',
					at(region, yr) ? fmt(at(region, yr).value) : '—'
				])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · annual temperature anomaly vs the long-term average</p>
				<h2 class="display">Sea and land, in step.</h2>
			</header>
			{#if data}
				<AnnualLines
					series={data.series}
					{progress}
					mode="dark"
					unit="°C"
					height={340}
					yDomain={[-1.6, 1.6]}
					ariaLabel="Line chart of Papua New Guinea sea-surface and land-surface temperature anomalies from 1850 to 2025, over the Pacific-wide sea-surface average. All three rise through the late 20th century; the two national series reach about +1.1 °C in 2025."
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
		max-width: 62rem;
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

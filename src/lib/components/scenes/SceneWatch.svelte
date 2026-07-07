<script>
	/**
	 * Coda — Watching. The quiet forward-looking close: Papua New Guinea's
	 * meteorological monitoring network in the SPC record, one station in
	 * 1951 to six today, drawn as a step chart. You can only see a thief you
	 * are watching for — and the far ocean's next column is still being
	 * written. (static/data/scene_watch.json)
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.05, 0.28], text: 'You can only catch a thief you are watching for.' },
		{ at: [0.28, 0.52], text: 'In 1951, Papua New Guinea reported one meteorological monitoring station.' },
		{ at: [0.52, 0.76], text: 'Today it reports six — and their record is this piece’s evidence.', sub: 'Every chart here exists because someone kept measuring.' },
		{ at: [0.76, 1], text: 'Somewhere east, the next El Niño is already taking shape.', sub: 'When it comes, the record will see it coming.' }
	];
</script>

<ScrollScene
	id="8-watch"
	title="Watching — Papua New Guinea's meteorological monitoring network, 1951–2026"
	heightVh={460}
	surface="dark"
	dataUrl="/data/scene_watch.json"
>
	{#snippet prose({ data })}
		<h2>Coda: watching</h2>
		<p>
			The case ends looking forward. The Pacific Community's record of Papua New Guinea's
			meteorological monitoring network runs from 1951, when the country reported a single
			station, to 2026, when it reports six. It is the least dramatic series in the dataset and
			the most important: every exhibit in this piece exists because someone kept measuring. El
			Niño returns every few years; the 2025 column of the far-ocean index is still being
			written. When the next event forms, the watchers — and the record they keep — will see it
			coming.
		</p>
		{#if data}
			<DataTable
				caption="Meteorological monitoring stations, selected years"
				columns={['Year', 'Stations']}
				rows={[1951, 1970, 1990, 2000, 2010, 2020, 2026].map((yr) => {
					const s = data.stations.years.find((d) => d.year === yr);
					return [yr, s ? s.value : '—'];
				})}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · meteorological monitoring network, 1951–2026</p>
				<h2 class="display">Watching.</h2>
			</header>
			{#if data}
				<LazyLines
					series={[{ key: 'met', name: 'Monitoring stations', accent: true, values: data.stations.years }]}
					{progress}
					mode="dark"
					unit=""
					baseline={0}
					curve="step"
					height={300}
					ariaLabel="Step chart of Papua New Guinea's meteorological monitoring network from 1951 to 2026, rising from one station to six."
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
		min-height: 5.5rem;
		display: flex;
		align-items: flex-start;
	}
</style>

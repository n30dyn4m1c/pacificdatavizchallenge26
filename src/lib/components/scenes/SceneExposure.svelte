<script>
	/**
	 * Act VI — Double exposure. El Niño is a visitor; the warming is a
	 * resident. Two panels of the same SPC record: the sea level around Papua
	 * New Guinea rising through the satellite era (1993–2023), and the
	 * 176-year sea-surface warming ending at the 2025 record. The next El Niño
	 * arrives on a warmer, higher ocean. (static/data/scene_exposure.json)
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.05, 0.24], text: 'El Niño is a visitor. The warming is a resident.' },
		{ at: [0.24, 0.46], text: 'Between visits, the baseline itself is moving.' },
		{ at: [0.46, 0.66], text: 'The sea around Papua New Guinea has risen through the satellite era…' },
		{ at: [0.66, 0.84], text: '…and 2025 was the warmest sea in 176 years of record.' },
		{ at: [0.84, 1], text: 'The next El Niño will knock on a warmer, higher door.' }
	];

	const fmt2 = (v) => (v > 0 ? '+' : '') + v.toFixed(2);
</script>

<ScrollScene
	id="6-exposure"
	title="Double exposure — sea level and sea-surface warming around Papua New Guinea"
	heightVh={540}
	surface="dark"
	dataUrl="/data/scene_exposure.json"
>
	{#snippet prose({ data })}
		<h2>Exhibit F: double exposure</h2>
		<p>
			The verdict names El Niño, but El Niño is episodic — a visitor every few years. The deeper
			exposure is the resident trend beneath the visits, and it is in the same SPC record. The
			sea-level anomaly around Papua New Guinea rises through the satellite era (1993–2023,
			roughly −0.10&nbsp;m to +0.20&nbsp;m), and the sea-surface record of scene one ends at its
			176-year high of +1.1&nbsp;°C in 2025. Each El Niño now arrives on a warmer, higher ocean
			than the one before it — the visits have not changed so much as the house they visit.
		</p>
		{#if data}
			<DataTable
				caption="Sea level and sea-surface anomaly, selected years"
				columns={['Year', 'Sea-level anomaly (m)', 'Sea-surface anomaly (°C)']}
				rows={[1993, 2000, 2010, 2015, 2020, 2023, 2025].map((yr) => {
					const s = data.sea_level.years.find((d) => d.year === yr);
					const t = data.sst.years.find((d) => d.year === yr);
					return [yr, s ? fmt2(s.value) : '—', t ? fmt2(t.value) : '—'];
				})}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · the resident trend beneath the visits</p>
				<h2 class="display">Double exposure.</h2>
			</header>
			{#if data}
				<div class="panels">
					<figure>
						<figcaption>Sea-level anomaly · {data.sea_level.unit} · 1993–2023</figcaption>
						<LazyLines
							series={[{ key: 'sea', name: 'Sea level', accent: true, values: data.sea_level.years }]}
							{progress}
							mode="dark"
							unit="m"
							baseline={0}
							height={280}
							ariaLabel="Line chart of the sea-level anomaly around Papua New Guinea from 1993 to 2023, rising from about minus 0.10 metres to plus 0.20 metres."
						/>
					</figure>
					<figure>
						<figcaption>Sea-surface anomaly · {data.sst.unit} · 1850–2025</figcaption>
						<LazyLines
							series={[{ key: 'sst', name: 'Sea surface', accent: true, values: data.sst.years }]}
							markYears={progress > 0.6 ? [data.sst.record_year] : []}
							{progress}
							mode="dark"
							unit="°C"
							baseline={0}
							height={280}
							ariaLabel="Line chart of Papua New Guinea's sea-surface-temperature anomaly from 1850 to 2025, climbing through the late 20th century to its record of plus 1.1 degrees in 2025."
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
		color: var(--ink-dark-secondary);
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

		/* on short/narrow pins, one panel carries the idea; the second is
		   also in the epilogue's small multiples */
		figure:last-child {
			display: none;
		}
	}
</style>
